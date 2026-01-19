import { useState, useEffect, FormEvent } from "react";
import { Model, ModelStatus } from "../../types";

interface ModelFormProps {
  model: Model | null;
  onSave: (model: Omit<Model, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const frameworks = [
  "PyTorch",
  "TensorFlow",
  "scikit-learn",
  "Hugging Face",
  "JAX",
  "XGBoost",
  "Other",
];

const statuses: { value: ModelStatus; label: string }[] = [
  { value: "development", label: "Development" },
  { value: "staging", label: "Staging" },
  { value: "production", label: "Production" },
  { value: "archived", label: "Archived" },
];

export default function ModelForm({ model, onSave, onCancel }: ModelFormProps) {
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [framework, setFramework] = useState(frameworks[0]);
  const [status, setStatus] = useState<ModelStatus>("development");
  const [owner, setOwner] = useState("");
  const [accuracy, setAccuracy] = useState("");
  const [latency, setLatency] = useState("");

  useEffect(() => {
    if (model) {
      setName(model.name);
      setVersion(model.version);
      setDescription(model.description);
      setFramework(model.framework);
      setStatus(model.status);
      setOwner(model.owner);
      setAccuracy(
        model.metrics?.accuracy !== undefined
          ? (model.metrics.accuracy * 100).toString()
          : ""
      );
      setLatency(
        model.metrics?.latency !== undefined
          ? model.metrics.latency.toString()
          : ""
      );
    }
  }, [model]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const metrics: Model["metrics"] = {};
    if (accuracy) {
      metrics.accuracy = parseFloat(accuracy) / 100;
    }
    if (latency) {
      metrics.latency = parseFloat(latency);
    }

    onSave({
      name,
      version,
      description,
      framework,
      status,
      owner,
      metrics: Object.keys(metrics).length > 0 ? metrics : undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{model ? "Edit Model" : "Add New Model"}</h2>
          <button className="modal-close" onClick={onCancel}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="model-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Model Name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Customer Churn Predictor"
              />
            </div>

            <div className="form-group">
              <label htmlFor="version">Version *</label>
              <input
                id="version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required
                placeholder="e.g., 1.0.0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Describe what this model does..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="framework">Framework *</label>
              <select
                id="framework"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                required
              >
                {frameworks.map((fw) => (
                  <option key={fw} value={fw}>
                    {fw}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ModelStatus)}
                required
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="owner">Owner *</label>
            <input
              id="owner"
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              required
              placeholder="e.g., Sarah Chen"
            />
          </div>

          <div className="form-section">
            <h3>Metrics (Optional)</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accuracy">Accuracy (%)</label>
                <input
                  id="accuracy"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={accuracy}
                  onChange={(e) => setAccuracy(e.target.value)}
                  placeholder="e.g., 92.5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="latency">Latency (ms)</label>
                <input
                  id="latency"
                  type="number"
                  min="0"
                  step="1"
                  value={latency}
                  onChange={(e) => setLatency(e.target.value)}
                  placeholder="e.g., 45"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {model ? "Save Changes" : "Create Model"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
