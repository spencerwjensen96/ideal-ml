import { Model, GitHubSettings, GitHubCache } from "../types";

const SETTINGS_KEY = "github_settings";
const CACHE_KEY = "github_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getSettings(): GitHubSettings | null {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveSettings(settings: GitHubSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  // Clear cache when settings change
  localStorage.removeItem(CACHE_KEY);
}

export function clearSettings(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(CACHE_KEY);
}

function getCache(): GitHubCache | null {
  const stored = localStorage.getItem(CACHE_KEY);
  if (!stored) return null;
  try {
    const cache: GitHubCache = JSON.parse(stored);
    const lastFetched = new Date(cache.lastFetched).getTime();
    if (Date.now() - lastFetched > CACHE_TTL) {
      return null; // Cache expired
    }
    return cache;
  } catch {
    return null;
  }
}

function setCache(models: Model[], repoUrl: string): void {
  const cache: GitHubCache = {
    models,
    lastFetched: new Date().toISOString(),
    repoUrl,
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function fetchModelsFromGitHub(
  settings: GitHubSettings
): Promise<Model[]> {
  const repoUrl = `${settings.repoOwner}/${settings.repoName}`;

  // Check cache first
  const cached = getCache();
  if (cached && cached.repoUrl === repoUrl) {
    return cached.models;
  }

  // Fetch from GitHub API
  const url = `https://api.github.com/repos/${settings.repoOwner}/${settings.repoName}/contents/${settings.configPath}?ref=${settings.branch}`;

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (settings.token) {
    headers.Authorization = `Bearer ${settings.token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Config file not found: ${settings.configPath}`);
    }
    if (response.status === 401) {
      throw new Error("Invalid GitHub token");
    }
    if (response.status === 403) {
      throw new Error("Rate limited or access denied");
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();

  // GitHub returns base64 encoded content
  const content = atob(data.content);
  const parsed = parseConfigFile(content, settings.configPath);

  // Cache the results
  setCache(parsed, repoUrl);

  return parsed;
}

function parseConfigFile(content: string, path: string): Model[] {
  const isYaml = path.endsWith(".yaml") || path.endsWith(".yml");

  let data: unknown;

  if (isYaml) {
    data = parseYaml(content);
  } else {
    data = JSON.parse(content);
  }

  // Expect either { models: [...] } or just [...]
  const modelsArray = Array.isArray(data) ? data : (data as { models?: unknown[] }).models;

  if (!Array.isArray(modelsArray)) {
    throw new Error("Config file must contain an array of models");
  }

  return modelsArray.map((item, index) => normalizeModel(item, index));
}

function normalizeModel(item: unknown, index: number): Model {
  const obj = item as Record<string, unknown>;
  const now = new Date().toISOString();

  const filesObj = obj.files as Record<string, unknown> | undefined;
  return {
    id: String(obj.id || `model-${index}`),
    name: String(obj.name || "Unnamed Model"),
    version: String(obj.version || "1.0.0"),
    description: String(obj.description || ""),
    framework: String(obj.framework || "Unknown"),
    status: validateStatus(obj.status),
    owner: String(obj.owner || "Unknown"),
    createdAt: String(obj.createdAt || obj.created_at || now),
    updatedAt: String(obj.updatedAt || obj.updated_at || now),
    metrics: obj.metrics ? {
      accuracy: typeof (obj.metrics as Record<string, unknown>).accuracy === "number"
        ? (obj.metrics as Record<string, unknown>).accuracy as number
        : undefined,
      latency: typeof (obj.metrics as Record<string, unknown>).latency === "number"
        ? (obj.metrics as Record<string, unknown>).latency as number
        : undefined,
    } : undefined,
    files: filesObj ? {
      modelCard: typeof filesObj.modelCard === "string" ? filesObj.modelCard : undefined,
      trainingScript: typeof filesObj.trainingScript === "string" ? filesObj.trainingScript : undefined,
      featureScript: typeof filesObj.featureScript === "string" ? filesObj.featureScript : undefined,
      inferenceScript: typeof filesObj.inferenceScript === "string" ? filesObj.inferenceScript : undefined,
      modelFile: typeof filesObj.modelFile === "string" ? filesObj.modelFile : undefined,
    } : undefined,
  };
}

function validateStatus(status: unknown): Model["status"] {
  const validStatuses = ["development", "staging", "production", "archived"];
  if (typeof status === "string" && validStatuses.includes(status)) {
    return status as Model["status"];
  }
  return "development";
}

// Simple YAML parser for basic structures
function parseYaml(content: string): unknown {
  const lines = content.split("\n");
  const result: unknown[] = [];
  let currentObject: Record<string, unknown> | null = null;
  let currentNested: Record<string, unknown> | null = null;
  let currentNestedKey: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) continue;

    // New array item
    if (trimmed.startsWith("- ")) {
      if (currentObject) {
        if (currentNested && currentNestedKey && Object.keys(currentNested).length > 0) {
          currentObject[currentNestedKey] = currentNested;
        }
        result.push(currentObject);
      }
      currentObject = {};
      currentNested = null;
      currentNestedKey = null;

      // Parse inline key-value after -
      const afterDash = trimmed.slice(2).trim();
      if (afterDash) {
        const [key, ...valueParts] = afterDash.split(":");
        if (key && valueParts.length > 0) {
          currentObject[key.trim()] = parseYamlValue(valueParts.join(":").trim());
        }
      }
      continue;
    }

    // Nested property
    if (currentObject && trimmed.includes(":")) {
      const colonIndex = trimmed.indexOf(":");
      const key = trimmed.slice(0, colonIndex).trim();
      const value = trimmed.slice(colonIndex + 1).trim();

      // Check if this is a nested object declaration (key with no value)
      if ((key === "metrics" || key === "files") && !value) {
        // Save previous nested object if any
        if (currentNested && currentNestedKey && Object.keys(currentNested).length > 0) {
          currentObject[currentNestedKey] = currentNested;
        }
        currentNestedKey = key;
        currentNested = {};
        continue;
      }

      // Check if this is a nested property (indented with spaces)
      if (currentNested && currentNestedKey && (line.startsWith("      ") || line.startsWith("    "))) {
        currentNested[key] = parseYamlValue(value);
      } else {
        // Save any pending nested object
        if (currentNested && currentNestedKey && Object.keys(currentNested).length > 0) {
          currentObject[currentNestedKey] = currentNested;
          currentNested = null;
          currentNestedKey = null;
        }
        currentObject[key] = parseYamlValue(value);
      }
    }
  }

  // Don't forget the last object
  if (currentObject) {
    if (currentNested && currentNestedKey && Object.keys(currentNested).length > 0) {
      currentObject[currentNestedKey] = currentNested;
    }
    result.push(currentObject);
  }

  return result;
}

function parseYamlValue(value: string): unknown {
  if (!value) return "";

  // Remove quotes
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  // Numbers
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value);
  }

  // Booleans
  if (value === "true") return true;
  if (value === "false") return false;

  // Null
  if (value === "null" || value === "~") return null;

  return value;
}

export function invalidateCache(): void {
  localStorage.removeItem(CACHE_KEY);
}

export async function fetchFileContent(
  filePath: string
): Promise<string> {
  const settings = getSettings();
  if (!settings) {
    throw new Error("GitHub not configured");
  }

  const url = `https://api.github.com/repos/${settings.repoOwner}/${settings.repoName}/contents/${filePath}?ref=${settings.branch}`;

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (settings.token) {
    headers.Authorization = `Bearer ${settings.token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(`Failed to fetch file: ${response.status}`);
  }

  const data = await response.json();

  // GitHub returns base64 encoded content
  return atob(data.content);
}

export function getGitHubFileUrl(filePath: string): string | null {
  const settings = getSettings();
  if (!settings) return null;

  return `https://github.com/${settings.repoOwner}/${settings.repoName}/blob/${settings.branch}/${filePath}`;
}

export function downloadGitHubFile(filePath: string): string | null {
  const settings = getSettings();
  if (!settings) return null;
  
  return `https://raw.githubusercontent.com/${settings.repoOwner}/${settings.repoName}/refs/heads/${settings.branch}/${filePath}`;
}
