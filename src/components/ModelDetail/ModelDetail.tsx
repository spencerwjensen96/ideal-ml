import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Highlight, themes } from "prism-react-renderer";
import { Model } from "../../types";
import { fetchFileContent, getGitHubFileUrl } from "../../services/github";
import Markdown from 'react-markdown'

interface ModelDetailProps {
  model: Model;
  isConnected: boolean;
}

type Tab = "overview" | "model_file" | "training" | "features" | "inference";

const statusColors: Record<Model["status"], string> = {
  development: "status-development",
  staging: "status-staging",
  production: "status-production",
  archived: "status-archived",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ModelDetail({ model, isConnected }: ModelDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [modelCardContent, setModelCardContent] = useState<string | null>(null);
  const [trainingScript, setTrainingScript] = useState<string | null>(null);
  const [featureScript, setFeatureScript] = useState<string | null>(null);
  const [inferenceScript, setInferenceScript] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadFile = async (
    filePath: string | undefined,
    setter: (content: string | null) => void,
    key: string
  ) => {
    if (!filePath || !isConnected) {
      setter(null);
      return;
    }

    setLoading((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: "" }));

    try {
      console.log("Fetching file content for:", filePath);
      const content = await fetchFileContent(filePath);
      setter(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load file";
      setErrors((prev) => ({ ...prev, [key]: message }));
      setter(null);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    if (model.files?.modelCard) {
      loadFile(model.files.modelCard, setModelCardContent, "modelCard");
    }
  }, [model.files?.modelCard, isConnected]);

  useEffect(() => {
    if (activeTab === "training" && model.files?.trainingScript && trainingScript === null && !errors.training) {
      loadFile(model.files.trainingScript, setTrainingScript, "training");
    }
  }, [activeTab, model.files?.trainingScript]);

  useEffect(() => {
    if (activeTab === "features" && model.files?.featureScript && featureScript === null && !errors.features) {
      loadFile(model.files.featureScript, setFeatureScript, "features");
    }
  }, [activeTab, model.files?.featureScript]);

  useEffect(() => {
    if (activeTab === "inference" && model.files?.inferenceScript && inferenceScript === null && !errors.inference) {
      loadFile(model.files.inferenceScript, setInferenceScript, "inference");
    }
  }, [activeTab, model.files?.inferenceScript]);

  const tabs: { id: Tab; label: string; filePath?: string }[] = [
    { id: "overview", label: "Model Card" },
    { id: "training", label: "Training Script", filePath: model.files?.trainingScript },
    { id: "features", label: "Feature Extraction", filePath: model.files?.featureScript },
    { id: "inference", label: "Inference Script", filePath: model.files?.inferenceScript },
  ];

  const renderMDFile = () => {
    if (!(model.files?.modelCard && isConnected)) {
      return (
        <div className="overview-fallback">
          <h3>No model card</h3>
          <p>Please add a ModelCard.md in your model directory.</p>
          <br />
          <a
          href={`https://github.com/spencerwjensen96/example-ml-models`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary github-link-btn"
        >
          View on GitHub →
        </a>
      </div>
      )
    }
    if (loading.modelCard) {
      return (
        <div className="file-loading">
          <div className="loading-spinner" />
          <p>Loading model card...</p>
        </div>
      )
    }
    if (errors.modelCard) {
      return (
        <div className="file-error">
          <p>Error loading model card: {errors.modelCard}</p>
          <button
            className="btn btn-secondary"
            onClick={() =>
              loadFile(model.files?.modelCard, setModelCardContent, "modelCard")
            }
          >
            Retry
          </button>
        </div>
      )
    }

    return (
        <div className="markdown-content">
          <div className="code-header">
            <span className="code-filename">{model.files.modelCard}</span>
            {getGitHubFileUrl(model.files.modelCard) && (
              <a
                href={getGitHubFileUrl(model.files.modelCard)!}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                View on GitHub →
              </a>
            )}
          </div>
          <div className="markdown-raw">
            <Markdown >{modelCardContent}</Markdown>
          </div>
        </div>
    )
  }

  const renderCodeBlock = (
    content: string | null,
    filePath: string | undefined,
    loadingKey: string,
    errorKey: string
  ) => {
    if (!isConnected) {
      return (
        <div className="file-placeholder">
          <p>Connect to GitHub to view this file.</p>
        </div>
      );
    }

    if (!filePath) {
      return (
        <div className="file-placeholder">
          <p>No file path configured for this script.</p>
        </div>
      );
    }

    if (loading[loadingKey]) {
      return (
        <div className="file-loading">
          <div className="loading-spinner" />
          <p>Loading file...</p>
        </div>
      );
    }

    if (errors[errorKey]) {
      return (
        <div className="file-error">
          <p>Error: {errors[errorKey]}</p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (loadingKey === "training") loadFile(filePath, setTrainingScript, "training");
              if (loadingKey === "features") loadFile(filePath, setFeatureScript, "features");
              if (loadingKey === "inference") loadFile(filePath, setInferenceScript, "inference");
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    const githubUrl = getGitHubFileUrl(filePath);

    return (
      <div className="code-container">
        <div className="code-header">
          <span className="code-filename">{filePath}</span>
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              View on GitHub →
            </a>
          )}
        </div>
        <Highlight theme={themes.vsDark} code={content || ""} language="python">
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre className="code-block" style={style}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  <span className="line-number">{i + 1}</span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    );
  };

  const renderModelFileContents = (filePath: string) => {
    const githubUrl = getGitHubFileUrl(filePath);

    return (
      <div className="code-container" style={{ marginTop: '24px' }}>
        <div className="code-header">
          <span className="code-filename">{model.files?.modelFile}</span>
          {githubUrl && (
            <div>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                View on GitHub →
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="model-detail-page">
      <div className="model-detail-header">
        <Link to="/models" className="btn btn-secondary back-btn">
          ← Back to Models
        </Link>
        <h1 className="page-title">{model.name}</h1>
        <div />
      </div>

      <div className="model-detail-content">
        <div className="model-detail-hero">
          <div className="model-detail-title-row">
            <span className={`status-badge ${statusColors[model.status]}`}>
              {model.status}
            </span>
          </div>
          <div className="model-detail-meta">
            <span className="meta-item">
              <strong>Version:</strong> {model.version}
            </span>
            <span className="meta-item">
              <strong>Framework:</strong> {model.framework}
            </span>
            <span className="meta-item">
              <strong>Owner:</strong> {model.owner}
            </span>
            <span className="meta-item">
              <strong>Updated:</strong> {formatDate(model.updatedAt)}
            </span>
          </div>
          <p className="model-detail-description">{model.description}</p>

          {model.metrics && (
            <div className="model-detail-metrics">
              <Link
                to={`/models/${model.id}/metrics`}
                className="btn btn-primary view-metrics-btn"
              >
                View Metrics
              </Link>
            </div>
          )}
        </div>

        <div className="model-detail-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""} ${
                tab.id !== "overview" && !tab.filePath ? "disabled" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.id !== "overview" && !tab.filePath && !isConnected}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="model-detail-tab-content">
          {activeTab === "overview" && (
            <div className="tab-panel">
              {renderMDFile()}
              {renderModelFileContents(
                model.files!.modelFile!
              )}
            </div>
          )}

          {activeTab === "training" && (
            <div className="tab-panel">
              {renderCodeBlock(
                trainingScript,
                model.files?.trainingScript,
                "training",
                "training"
              )}
            </div>
          )}

          {activeTab === "features" && (
            <div className="tab-panel">
              {renderCodeBlock(
                featureScript,
                model.files?.featureScript,
                "features",
                "features"
              )}
            </div>
          )}

          {activeTab === "inference" && (
            <div className="tab-panel">
              {renderCodeBlock(
                inferenceScript,
                model.files?.inferenceScript,
                "inference",
                "inference"
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
