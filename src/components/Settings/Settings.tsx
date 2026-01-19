import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { GitHubSettings, ConnectionStatus } from "../../types";
import {
  getSettings,
  saveSettings,
  clearSettings,
  fetchModelsFromGitHub,
  invalidateCache,
} from "../../services/github";

interface SettingsProps {
  onSave: (settings: GitHubSettings | null) => void;
  connectionStatus: ConnectionStatus;
  connectionError: string | null;
}

export default function Settings({
  onSave,
  connectionStatus,
  connectionError,
}: SettingsProps) {
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [branch, setBranch] = useState("main");
  const [configPath, setConfigPath] = useState("models.yaml");
  const [token, setToken] = useState("");

  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testError, setTestError] = useState<string | null>(null);
  const [testDetails, setTestDetails] = useState<string | null>(null);

  useEffect(() => {
    const existing = getSettings();
    if (existing) {
      setRepoOwner(existing.repoOwner);
      setRepoName(existing.repoName);
      setBranch(existing.branch);
      setConfigPath(existing.configPath);
      setToken(existing.token);
    }
  }, []);

  const buildApiUrl = () => {
    const owner = repoOwner.trim();
    const repo = repoName.trim();
    const br = branch.trim() || "main";
    const path = configPath.trim() || "models.yaml";
    return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${br}`;
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    setTestError(null);
    setTestDetails(null);

    const settings: GitHubSettings = {
      repoOwner: repoOwner.trim(),
      repoName: repoName.trim(),
      branch: branch.trim() || "main",
      configPath: configPath.trim() || "models.yaml",
      token: token.trim(),
    };

    const apiUrl = buildApiUrl();
    setTestDetails(`Fetching: ${apiUrl}`);

    try {
      invalidateCache();
      const models = await fetchModelsFromGitHub(settings);
      setTestStatus("success");
      setTestDetails(`Success! Found ${models.length} model(s).`);
      setTestError(null);
    } catch (error) {
      setTestStatus("error");
      const message = error instanceof Error ? error.message : "Unknown error";
      setTestError(message);
      setTestDetails(`API URL: ${apiUrl}`);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const settings: GitHubSettings = {
      repoOwner: repoOwner.trim(),
      repoName: repoName.trim(),
      branch: branch.trim() || "main",
      configPath: configPath.trim() || "models.yaml",
      token: token.trim(),
    };

    saveSettings(settings);
    invalidateCache();
    onSave(settings);
  };

  const handleRetry = () => {
    const settings: GitHubSettings = {
      repoOwner: repoOwner.trim(),
      repoName: repoName.trim(),
      branch: branch.trim() || "main",
      configPath: configPath.trim() || "models.yaml",
      token: token.trim(),
    };

    saveSettings(settings);
    invalidateCache();
    onSave(settings);
  };

  const handleDisconnect = () => {
    clearSettings();
    onSave(null);
    setRepoOwner("");
    setRepoName("");
    setBranch("main");
    setConfigPath("models.yaml");
    setToken("");
    setTestStatus("idle");
    setTestError(null);
    setTestDetails(null);
  };

  const hasSettings = getSettings() !== null;
  const canTest = repoOwner.trim() && repoName.trim() && token.trim();

  return (
    <div className="settings-page">
      <div className="settings-header">
        <Link to="/models" className="btn btn-secondary back-btn">
          ← Back to Models
        </Link>
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>GitHub Connection</h2>
            <div className="connection-status-badge">
              <span className={`status-dot status-${connectionStatus}`} />
              <span className="status-text">
                {connectionStatus === "connected" && "Connected"}
                {connectionStatus === "connecting" && "Connecting..."}
                {connectionStatus === "disconnected" && "Not connected"}
                {connectionStatus === "error" && "Error"}
              </span>
            </div>
          </div>

          {connectionError && (
            <div className="error-banner">
              <strong>Connection Error:</strong> {connectionError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="settings-form-page">
            <div className="form-section">
              <h3>Repository</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="repoOwner">Owner *</label>
                  <input
                    id="repoOwner"
                    type="text"
                    value={repoOwner}
                    onChange={(e) => setRepoOwner(e.target.value)}
                    required
                    placeholder="e.g., my-org"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="repoName">Repository *</label>
                  <input
                    id="repoName"
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    required
                    placeholder="e.g., ml-models"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="branch">Branch</label>
                  <input
                    id="branch"
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="configPath">Config File Path</label>
                  <input
                    id="configPath"
                    type="text"
                    value={configPath}
                    onChange={(e) => setConfigPath(e.target.value)}
                    placeholder="models.yaml"
                  />
                </div>
              </div>

              {repoOwner.trim() && repoName.trim() && (
                <a
                  href={`https://github.com/${repoOwner.trim()}/${repoName.trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary github-link-btn"
                >
                  View on GitHub →
                </a>
              )}
            </div>

            <div className="form-section">
              <h3>Authentication</h3>
              <div className="form-group">
                <label htmlFor="token">Personal Access Token *</label>
                <input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  placeholder="ghp_xxxxxxxxxxxx"
                />
                {token.length >= 8 && (
                  <span className="token-preview">
                    Token ending in: <code>...{token.slice(-8)}</code>
                  </span>
                )}
                <span className="form-hint">
                  Create a token with <code>repo</code> scope at{" "}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Settings
                  </a>
                </span>
              </div>
            </div>

            <div className="form-section">
              <h3>Test Connection</h3>
              <div className="test-connection-area">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleTestConnection}
                  disabled={!canTest || testStatus === "testing"}
                >
                  {testStatus === "testing" ? "Testing..." : "Test Connection"}
                </button>

                {testStatus === "success" && (
                  <div className="test-result test-success">
                    {testDetails}
                  </div>
                )}

                {testStatus === "error" && (
                  <div className="test-result test-error">
                    <strong>Failed:</strong> {testError}
                    {testDetails && <div className="test-details">{testDetails}</div>}
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions-page">
              {hasSettings && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              )}
              <div className="form-actions-right">
                {hasSettings && connectionStatus === "error" && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleRetry}
                  >
                    Retry Connection
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  {hasSettings ? "Save & Reconnect" : "Connect"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
