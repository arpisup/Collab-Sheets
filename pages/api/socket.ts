import type { NextApiRequest } from "next"
import type { NextApiResponse } from "next"
import { Server as IOServer } from "socket.io"
import type { Server as HTTPServer } from "http"
import type { Socket as NetSocket } from "net"

interface SocketServer extends HTTPServer {
  io?: IOServer
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

interface PresenceUser {
  id: string
  name: string
  color: string
  activeCell?: string
}

export const config = {
  api: { bodyParser: false },
}

// Track users per room: docId -> Map<socketId, PresenceUser>
const rooms = new Map<string, Map<string, PresenceUser>>()

function getRoomUsers(docId: string): PresenceUser[] {
  const room = rooms.get(docId)
  return room ? Array.from(room.values()) : []
}

function broadcastPresence(io: IOServer, docId: string) {
  io.to(docId).emit("presence", { users: getRoomUsers(docId) })
}

export default function handler(_req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server as HTTPServer, {
      path: "/api/socket",
      addTrailingSlash: false,
    })

    io.on("connection", (socket) => {
      let currentDocId: string | null = null

      socket.on("join", (data: { docId: string; name: string; color: string }) => {
        currentDocId = data.docId
        socket.join(data.docId)

        if (!rooms.has(data.docId)) {
          rooms.set(data.docId, new Map())
        }
        rooms.get(data.docId)!.set(socket.id, {
          id: socket.id,
          name: data.name,
          color: data.color,
        })

        broadcastPresence(io, data.docId)
      })

      socket.on("cell_update", (data: { cell: string; value: string }) => {
        socket.broadcast.emit("cell_update", data)
      })

      socket.on("cursor", (data: { docId: string; cell: string }) => {
        const room = rooms.get(data.docId)
        if (room && room.has(socket.id)) {
          room.get(socket.id)!.activeCell = data.cell
          broadcastPresence(io, data.docId)
        }
      })

      socket.on("leave", (data: { docId: string }) => {
        socket.leave(data.docId)
        const room = rooms.get(data.docId)
        if (room) {
          room.delete(socket.id)
          if (room.size === 0) rooms.delete(data.docId)
        }
        broadcastPresence(io, data.docId)
        currentDocId = null
      })

      socket.on("disconnect", () => {
        if (currentDocId) {
          const room = rooms.get(currentDocId)
          if (room) {
            room.delete(socket.id)
            if (room.size === 0) rooms.delete(currentDocId)
          }
          broadcastPresence(io, currentDocId)
        }
      })
    })

    res.socket.server.io = io
  }

  res.end()
}
