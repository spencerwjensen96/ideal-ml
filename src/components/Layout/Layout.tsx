import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { User, ConnectionStatus } from "../../types";
import UserInfo from "../UserInfo/UserInfo";

interface LayoutProps {
  children: ReactNode;
  user: User;
  connectionStatus: ConnectionStatus;
  onRefreshClick: () => void;
}

export default function Layout({
  children,
  user,
  connectionStatus,
  onRefreshClick,
}: LayoutProps) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">ML Platform</h1>
        </div>

        <div className="connection-indicator">
          <span className={`status-dot status-${connectionStatus}`} />
          <span className="connection-text">
            {connectionStatus === "connected" && "GitHub Connected"}
            {connectionStatus === "connecting" && "Connecting..."}
            {connectionStatus === "disconnected" && "Local Mode"}
            {connectionStatus === "error" && "Connection Error"}
          </span>
          {connectionStatus === "connected" && (
            <button
              className="refresh-btn"
              onClick={onRefreshClick}
              title="Refresh from GitHub"
            >
              ↻
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/models"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">◈</span>
            Models
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">⚙</span>
            Settings
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <NavLink
            to="/account"
            className={({ isActive }) =>
              `user-info-button ${isActive ? "active" : ""}`
            }
            title="Edit account"
          >
            <UserInfo user={user} />
          </NavLink>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
