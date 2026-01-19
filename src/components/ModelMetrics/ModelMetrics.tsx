import { Link } from "react-router-dom";
import { Model } from "../../types";

interface ModelMetricsProps {
  model: Model;
}

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

export default function ModelMetrics({ model }: ModelMetricsProps) {
  const hasMetrics = model.metrics && (model.metrics.accuracy !== undefined || model.metrics.latency !== undefined);

  return (
    <div className="model-metrics-page">
      <div className="model-metrics-header">
        <Link to={`/models/${model.id}`} className="btn btn-secondary back-btn">
          ← Back
        </Link>
        <h1 className="page-title">Model Metrics</h1>
        <div />
      </div>

      <div className="model-metrics-content">
        <div className="model-metrics-hero">
          <div className="model-metrics-title-row">
            <h2>{model.name}</h2>
            <span className={`status-badge ${statusColors[model.status]}`}>
              {model.status}
            </span>
          </div>
          <div className="model-metrics-meta">
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
        </div>

        {hasMetrics ? (
          <div className="metrics-grid">
            {model.metrics?.accuracy !== undefined && (
              <div className="metrics-card-large">
                <div className="metrics-card-header">
                  <h3>Accuracy</h3>
                </div>
                <div className="metrics-card-body">
                  <div className="metrics-value-large">
                    {(model.metrics.accuracy * 100).toFixed(1)}%
                  </div>
                  <div className="metrics-bar-container">
                    <div
                      className="metrics-bar"
                      style={{ width: `${model.metrics.accuracy * 100}%` }}
                    />
                  </div>
                  <p className="metrics-description">
                    Model prediction accuracy on the validation dataset
                  </p>
                </div>
              </div>
            )}

            {model.metrics?.latency !== undefined && (
              <div className="metrics-card-large">
                <div className="metrics-card-header">
                  <h3>Latency</h3>
                </div>
                <div className="metrics-card-body">
                  <div className="metrics-value-large">
                    {model.metrics.latency}ms
                  </div>
                  <div className="metrics-bar-container">
                    <div
                      className="metrics-bar metrics-bar-latency"
                      style={{ width: `${Math.min(model.metrics.latency / 100 * 100, 100)}%` }}
                    />
                  </div>
                  <p className="metrics-description">
                    Average inference time per prediction
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-metrics-state">
            <h3>No Metrics Available</h3>
            <p>This model does not have any metrics recorded yet.</p>
          </div>
        )}

        <div className="metrics-summary-card">
          <h3>Performance Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Status</span>
              <span className={`status-badge ${statusColors[model.status]}`}>
                {model.status}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Framework</span>
              <span className="summary-value">{model.framework}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Last Updated</span>
              <span className="summary-value">{formatDate(model.updatedAt)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Created</span>
              <span className="summary-value">{formatDate(model.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
