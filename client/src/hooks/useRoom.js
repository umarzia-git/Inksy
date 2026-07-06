import { useContext } from 'react'
import { RoomContext } from '../context/RoomContext.jsx'

export function useRoom() {
  return useContext(RoomContext)
}
