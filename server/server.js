const express = require('express');
const signupRoute = require('./src/routes/signup');
const loginRoute = require('./src/routes/login');
const userRoute = require('./src/routes/user');
const bodyParser = require('body-parser');
const cors = require('cors');
const createAdminAccount = require('./src/scripts/admin');
const socketio = require('socket.io');
const http = require('http');
const formatMessage = require('./src/utils/messages.js')

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
    socket.emit('message', formatMessage(
        username=serverName, 
        text="Connected to chat"
    ));

    // Broadcast when user connects
    socket.broadcast.emit('message', formatMessage(
        username=serverName, 
        text="New user joined"
    ));

    // Run when client disconnects
    socket.on('disconnect', () => {
        io.emit('message', formatMessage(
            username=serverName, 
            text="User left the chat"
        ));
    })

    // Listen for chat message
    socket.on('chatMessage', (message) => {
        io.emit('message', message);
    })
});

app.use('/user', signupRoute);
app.use('/auth', loginRoute);
app.use('/api', userRoute);

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`)
});