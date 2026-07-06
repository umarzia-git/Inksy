import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext.jsx'
import { RoomProvider } from './context/RoomContext.jsx'
import HomePage from './pages/HomePage.jsx'
import CreateRoomPage from './pages/CreateRoomPage.jsx'
import JoinRoomPage from './pages/JoinRoomPage.jsx'
import LobbyPage from './pages/LobbyPage.jsx'
import GamePage from './pages/GamePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function App() {
  return (
    <SocketProvider>
      <RoomProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateRoomPage />} />
            <Route path="/join" element={<JoinRoomPage />} />
            <Route path="/room/:code/lobby" element={<LobbyPage />} />
            <Route path="/room/:code/game" element={<GamePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </RoomProvider>
    </SocketProvider>
  )
}

export default App
