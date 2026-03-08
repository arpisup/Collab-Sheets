const http = require("http")
const { parse } = require("url")
const next = require("next")
const { Server } = require("socket.io")

const dev = process.env.NODE_ENV !== "production"
const hostname = "0.0.0.0"
const port = Number(process.env.PORT || 3000)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Presence state for active rooms: docId -> Map<socketId, user>
const rooms = new Map()

function getRoomUsers(docId) {
  const room = rooms.get(docId)
  return room ? Array.from(room.values()) : []
}

function broadcastPresence(io, docId) {
  io.to(docId).emit("presence", { users: getRoomUsers(docId) })
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    // Let Socket.IO own its endpoint for polling transports.
    if (req.url && req.url.startsWith("/api/socket")) {
      return
    }

    const parsedUrl = parse(req.url || "/", true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(server, {
    path: "/api/socket",
    addTrailingSlash: false,
  })

  io.on("connection", (socket) => {
    let currentDocId = null

    socket.on("join", (data) => {
      const { docId, name, color } = data || {}
      if (!docId || !name || !color) return

      currentDocId = docId
      socket.join(docId)

      if (!rooms.has(docId)) {
        rooms.set(docId, new Map())
      }

      rooms.get(docId).set(socket.id, {
        id: socket.id,
        name,
        color,
      })

      broadcastPresence(io, docId)
    })

    socket.on("cell_update", (data) => {
      if (!currentDocId) return
      socket.to(currentDocId).emit("cell_update", data)
    })

    socket.on("cursor", (data) => {
      const { docId, cell } = data || {}
      if (!docId || !cell) return

      const room = rooms.get(docId)
      if (room && room.has(socket.id)) {
        room.get(socket.id).activeCell = cell
        broadcastPresence(io, docId)
      }
    })

    socket.on("leave", (data) => {
      const { docId } = data || {}
      if (!docId) return

      socket.leave(docId)
      const room = rooms.get(docId)
      if (room) {
        room.delete(socket.id)
        if (room.size === 0) {
          rooms.delete(docId)
        }
      }

      broadcastPresence(io, docId)
      if (currentDocId === docId) {
        currentDocId = null
      }
    })

    socket.on("disconnect", () => {
      if (!currentDocId) return

      const room = rooms.get(currentDocId)
      if (room) {
        room.delete(socket.id)
        if (room.size === 0) {
          rooms.delete(currentDocId)
        }
      }

      broadcastPresence(io, currentDocId)
    })
  })

  server
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
    .on("error", (err) => {
      console.error(err)
      process.exit(1)
    })
})
