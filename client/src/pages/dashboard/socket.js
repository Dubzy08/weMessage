import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_WEMESSAGE_API_URL;

const socket = io(apiUrl, {
    autoConnect: false
}
);

export default socket