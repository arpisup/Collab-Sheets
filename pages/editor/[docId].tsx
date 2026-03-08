import { useEffect } from "react"
import { useRouter } from "next/router"
import Spreadsheet from "../../components/Spreadsheet/Spreadsheet"
import PresenceBar from "../../components/Presence/PresenceBar"
import { getSocket } from "../../lib/socket"
import { useSheetStore } from "../../store/spreadsheetStore"
import { useAuthStore } from "../../store/authStore"

export default function Editor() {
  const router = useRouter()
  const { docId } = router.query

  const user = useAuthStore((s) => s.user)
  const setCell = useSheetStore((s) => s.setCell)
  const users = useSheetStore((s) => s.users)
  const setUsers = useSheetStore((s) => s.setUsers)

  // Redirect to login if no identity
  useEffect(() => {
    if (!user && router.isReady) {
      router.replace("/login")
    }
  }, [user, router])

  useEffect(() => {
    if (!docId || !user) return

    const socket = getSocket()

    // Join room with identity
    socket.emit("join", {
      docId,
      name: user.displayName,
      color: user.color,
    })

    socket.on("cell_update", (data: { cell: string; value: string }) => {
      setCell(data.cell, data.value)
    })

    socket.on("presence", (data: { users: typeof users }) => {
      setUsers(data.users)
    })

    return () => {
      socket.off("cell_update")
      socket.off("presence")
      socket.emit("leave", { docId })
    }
  }, [docId, user, setCell, setUsers])

  // Track active cell and send cursor position
  function handleCellFocus(cellId: string) {
    if (!docId) return
    getSocket().emit("cursor", { docId, cell: cellId })
  }

  if (!user) return null

  return (
    <div className="editor">
      <div className="editor-header">
        <h1>Spreadsheet — {docId}</h1>
        <div className="editor-user">
          <span className="editor-user-name">{user.displayName}</span>
          <div className="avatar-sm" style={{ background: user.color }}>
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
      <PresenceBar users={users} currentUserId={user.uid} />
      <Spreadsheet onCellFocus={handleCellFocus} />
    </div>
  )
}
