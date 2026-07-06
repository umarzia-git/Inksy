import { createContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export const SocketContext = createContext({ socket: null, connected: false })

// Falls back to whatever host the page itself was loaded from (same hostname,
// port 4000) rather than a hardcoded "localhost" — so the same build works
// whether it's opened via localhost or a LAN IP (e.g. testing on a phone).
const SERVER_URL = import.meta.env.VITE_SERVER_URL || `${window.location.protocol}//${window.location.hostname}:4000`

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
