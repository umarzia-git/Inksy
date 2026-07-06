import { createContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export const SocketContext = createContext({ socket: null, connected: false })

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

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
