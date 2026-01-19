import { Link } from "react-router-dom";
import { Model } from "../../types";

interface ModelCardProps {
  model: Model;
  onEdit: (model: Model) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

const statusColors: Record<Model["status"], string> = {
  development: "status-development",
  staging: "status-staging",
  production: "status-production",
  archived: "status-archived",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ModelCard({ model, onEdit, onDelete, isReadOnly = false }: ModelCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`Are you sure you want to delete "${model.name}"?`)) {
      onDelete(model.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit(model);
  };

  return (
    <Link to={`/models/${model.id}`} className="model-card model-card-clickable">
      <div className="model-card-header">
        <div className="model-title-row">
          <h3 className="model-name">{model.name}</h3>
          <span className={`status-badge ${statusColors[model.status]}`}>
            {model.status}
          </span>
        </div>
        <div className="model-meta">
          <span className="model-version">v{model.version}</span>
          <span className="model-framework">{model.framework}</span>
        </div>
      </div>

      <p className="model-description">{model.description}</p>

      {model.metrics && (
        <div className="model-metrics">
          {model.metrics.accuracy !== undefined && (
            <div className="metric">
              <span className="metric-label">Accuracy</span>
              <span className="metric-value">
                {(model.metrics.accuracy * 100).toFixed(1)}%
              </span>
            </div>
          )}
          {model.metrics.latency !== undefined && (
            <div className="metric">
              <span className="metric-label">Latency</span>
              <span className="metric-value">{model.metrics.latency}ms</span>
            </div>
          )}
        </div>
      )}

      <div className="model-card-footer">
        <div className="model-info">
          <span className="model-owner">{model.owner}</span>
          <span className="model-date">Updated {formatDate(model.updatedAt)}</span>
        </div>
        <div className="model-actions">
          <Link
            to={`/models/${model.id}/metrics`}
            className="btn btn-primary btn-sm"
            onClick={(e) => e.stopPropagation()}
            aria-label={`View metrics for ${model.name}`}
          >
            Metrics
          </Link>
          {!isReadOnly && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleEdit}
                aria-label={`Edit ${model.name}`}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                aria-label={`Delete ${model.name}`}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
