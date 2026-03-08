import { PresenceUser } from "../../store/spreadsheetStore"

interface PresenceBarProps {
  users: PresenceUser[]
  currentUserId?: string
}

export default function PresenceBar({ users, currentUserId }: PresenceBarProps) {
  const others = users.filter((u) => u.id !== currentUserId)

  if (others.length === 0) {
    return (
      <div className="presence">
        <span className="presence-empty">Only you are here</span>
      </div>
    )
  }

  return (
    <div className="presence">
      <span className="presence-count">{others.length} collaborator{others.length !== 1 ? "s" : ""}</span>
      {others.map((u) => (
        <span key={u.id} style={{ background: u.color }} className="user">
          <span className="user-dot" />
          {u.name}
          {u.activeCell ? <span className="user-cell">{u.activeCell}</span> : ""}
        </span>
      ))}
    </div>
  )
}
