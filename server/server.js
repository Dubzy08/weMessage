require('dotenv').config();
const express = require('express');
const signupRoute = require('./src/routes/signup');
const loginRoute = require('./src/routes/login');
const userRoute = require('./src/routes/user');
const messageRoute = require('./src/routes/messageRoute.js');
const bodyParser = require('body-parser');
const cors = require('cors');
const createAdminAccount = require('./src/scripts/admin');
const socketio = require('socket.io');
const http = require('http');
const formatMessage = require('./src/utils/messages.js');
const { createMessage } = require('./src/services/messageService.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});


app.use(bodyParser.json());
app.use(cors());

createAdminAccount();

const serverName = "Chat Bot"

io.on('connection', socket => {

    // Display added user to chat and modify conversation to group
    socket.on('addUser', () => {

    })

    // Run when client is goes offline
    socket.on('disconnect', () => {

    })

    socket.on('joinRoom', (conversationId) => {
        socket.join(conversationId);
        console.log(`User joined room: ${conversationId}`)
    })

    socket.on('leaveRoom', (conversationId) => {
        socket.leave(conversationId);
        console.log(`User left room: ${conversationId}`);
    })

    // Listen for chat message
    socket.on('chatMessage', async (message) => {
        await createMessage(message.conversationId, message.from, message.text);
        socket.to(message.conversationId).emit('chatMessage', message);
    })
});

app.use('/user', signupRoute);
app.use('/auth', loginRoute);
app.use('/api', userRoute);
app.use('/messages', messageRoute);

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`)
});