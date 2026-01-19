import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { User } from "../../types";

interface AccountProps {
  user: User;
  onSave: (user: User) => void;
}

const roleOptions = [
  "ML Engineer",
  "Data Scientist",
  "Software Engineer",
  "Engineering Manager",
  "Product Manager",
  "Research Scientist",
  "DevOps Engineer",
  "Other",
];

export default function Account({ user, onSave }: AccountProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    if (roleOptions.includes(user.role)) {
      setRole(user.role);
      setCustomRole("");
    } else {
      setRole("Other");
      setCustomRole(user.role);
    }
  }, [user]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const updatedUser: User = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      role: role === "Other" ? customRole.trim() : role,
    };

    onSave(updatedUser);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="account-page">
      <div className="account-header">
        <Link to="/models" className="btn btn-secondary back-btn">
          ← Back to Models
        </Link>
        <h1 className="page-title">Account</h1>
      </div>

      <div className="account-content">
        <div className="account-card">
          <div className="account-card-header">
            <div className="account-avatar-large">{initials}</div>
            <div className="account-header-info">
              <h2>{name || "Your Name"}</h2>
              <p>{role === "Other" ? customRole : role || "Your Role"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="account-form">
            <div className="form-section">
              <h3>Profile Information</h3>

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <input
                  id="role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  placeholder="Enter your role"
                />
              </div>

              {role === "Other" && (
                <div className="form-group">
                  <label htmlFor="customRole">Custom Role *</label>
                  <input
                    id="customRole"
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    required
                    placeholder="Enter your role"
                  />
                </div>
              )}
            </div>

            <div className="form-actions-page">
              {isSaved && (
                <span className="save-success">Changes saved successfully!</span>
              )}
              <div className="form-actions-right">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
