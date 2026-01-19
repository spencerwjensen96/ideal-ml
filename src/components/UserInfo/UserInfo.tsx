import { User } from "../../types";

interface UserInfoProps {
  user: User;
}

export default function UserInfo({ user }: UserInfoProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="user-info">
      <div className="user-avatar">{initials}</div>
      <div className="user-details">
        <span className="user-name">{user.name}</span>
        <span className="user-role">{user.role}</span>
      </div>
    </div>
  );
}
