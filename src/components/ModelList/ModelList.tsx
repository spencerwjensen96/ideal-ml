import { useState } from "react";
import { Model, ModelStatus } from "../../types";
import ModelCard from "../ModelCard/ModelCard";

interface ModelListProps {
  models: Model[];
  onEdit: (model: Model) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  isReadOnly?: boolean;
  isConnected?: boolean;
  onRefresh?: () => void;
}

const statusOptions: { value: ModelStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "production", label: "Production" },
  { value: "staging", label: "Staging" },
  { value: "development", label: "Development" },
  { value: "archived", label: "Archived" },
];

export default function ModelList({
  models,
  onEdit,
  onDelete,
  onAddNew,
  isReadOnly = false,
  onRefresh,
}: ModelListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ModelStatus | "all">("all");

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.framework.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || model.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="model-list-container">
      <div className="model-list-header">
        <h2 className="page-title">Models</h2>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={onAddNew}>
            + Add Model
          </button>
        )}
        {isReadOnly && (
          <div className="header-actions">
            <span className="readonly-badge">View Only (from GitHub)</span>
            {onRefresh && (
              <button
                className="btn btn-secondary refresh-btn-main"
                onClick={onRefresh}
                title="Refresh from GitHub"
              >
                ↻ Refresh
              </button>
            )}
          </div>
        )}
      </div>

      <div className="model-list-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ModelStatus | "all")
          }
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="model-list">
        {filteredModels.length === 0 ? (
          <div className="empty-state">
            <p>No models found matching your criteria.</p>
          </div>
        ) : (
          filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onEdit={onEdit}
              onDelete={onDelete}
              isReadOnly={isReadOnly}
            />
          ))
        )}
      </div>
    </div>
  );
}
