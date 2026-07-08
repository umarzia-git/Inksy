import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext.jsx'
import { RoomProvider } from './context/RoomContext.jsx'
import HomePage from './pages/HomePage.jsx'
import CreateRoomPage from './pages/CreateRoomPage.jsx'
import JoinRoomPage from './pages/JoinRoomPage.jsx'
import LobbyPage from './pages/LobbyPage.jsx'
import GamePage from './pages/GamePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// Fades each route in over 300ms. The new page mounts immediately (the `key`
// just restarts the CSS animation on a fresh node) — it must never be
// deferred, since pages like the game screen need to attach their socket
// listeners the instant they mount or they can miss server events that
// arrive during the transition.
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="page-fade-in">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/join" element={<JoinRoomPage />} />
        <Route path="/room/:code/lobby" element={<LobbyPage />} />
        <Route path="/room/:code/game" element={<GamePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <SocketProvider>
      <RoomProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </RoomProvider>
    </SocketProvider>
  )
}

export default App
