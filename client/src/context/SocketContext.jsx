import { createContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export const SocketContext = createContext({ socket: null, connected: false })

const isLocalDevHost =
  ['localhost', '127.0.0.1'].includes(window.location.hostname) ||
  /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(window.location.hostname)

// Deployed builds (Vercel, etc.) must always be given a real backend URL via
// VITE_SERVER_URL (e.g. the Railway backend) — a static host has no port 4000
// to fall back to. The same-host:4000 guess only ever makes sense for local
// or LAN-IP dev (e.g. testing on a phone against a machine running the server).
let SERVER_URL = import.meta.env.VITE_SERVER_URL
if (!SERVER_URL) {
  if (isLocalDevHost) {
    SERVER_URL = `${window.location.protocol}//${window.location.hostname}:4000`
  } else {
    console.error(
      'VITE_SERVER_URL is not set. The app cannot reach a backend from this host — ' +
        'set VITE_SERVER_URL to the deployed server URL (e.g. https://inksy-production.up.railway.app) ' +
        'in the frontend deployment\'s environment variables.',
    )
    SERVER_URL = `${window.location.protocol}//${window.location.hostname}:4000`
  }
}

export function SocketProvider({ children }) {
  const [socket] = useState(() =>
    io(SERVER_URL, {
      autoConnect: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    }),
  )
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const handleConnect = () => {
      console.log('socket connected:', socket.id)
      setConnected(true)
    }
    const handleDisconnect = (reason) => {
      console.log('socket disconnected:', reason)
      setConnected(false)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [socket])

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>
}
