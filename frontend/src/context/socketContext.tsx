import { createContext, useContext, PropsWithChildren, useEffect, useState } from "react";
import { Socket, io } from 'socket.io-client'
import { useAuthContext } from "./authContext";
import { API_URL } from '@/lib/api'


const SocketContext = createContext<Socket | undefined>(undefined)

export const useSocketContext = () => {
    const context = useContext(SocketContext)
    return context
}

interface SocketProviderType extends PropsWithChildren {}

export const SocketProvider = ({
    children
} : SocketProviderType ) => {
    const [socket, setSocket] = useState<Socket | undefined>(undefined)
    const { user } = useAuthContext()

    useEffect(() => {
        // because user can still use website even though they are not logged in
        if(user) {
            const socket:Socket = io(`${API_URL}`, {
                transports: ['websocket'],
                query: { 
                    userId: user.id
                }
            })

            setSocket(socket)

            return () => {
                socket.close()
            }
        }
    }, [user])

    return (
        <SocketContext.Provider value={ socket } >
            {children}
        </SocketContext.Provider>
    )
}