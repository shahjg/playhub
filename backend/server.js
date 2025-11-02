const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://playhub-puce.vercel.app';
app.use(cors({
    origin: ['https://playhub-puce.vercel.app', 'http://localhost:5500'],
    methods: ['GET', 'POST'],
    credentials: true
}));

const io = new Server(server, {
    cors: {
        origin: ['https://playhub-puce.vercel.app', 'http://localhost:5500'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// In-memory storage
const rooms = new Map();
const players = new Map();

// Generate random room code
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket.io connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // CREATE ROOM
    socket.on('create-room', (data) => {
        const { playerName, gameType } = data;
        const roomCode = generateRoomCode();

        const player = {
            id: socket.id,
            name: playerName,
            isHost: true
        };

        const room = {
            code: roomCode,
            gameType: gameType,
            host: socket.id,
            players: [player],
            gameState: 'waiting',
            gameData: {} // Store game-specific data here
        };

        rooms.set(roomCode, room);
        players.set(socket.id, { ...player, roomCode });

        socket.join(roomCode);

        socket.emit('room-created', {
            roomCode: roomCode,
            room: room
        });

        console.log(`Room created: ${roomCode} by ${playerName}`);
    });

    // JOIN ROOM
    socket.on('join-room', (data) => {
        const { roomCode, playerName } = data;
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        if (room.gameState !== 'waiting') {
            socket.emit('error', { message: 'Game already in progress' });
            return;
        }

        // Check if name already taken in this room
        const nameExists = room.players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (nameExists) {
            socket.emit('error', { message: 'Name already taken in this room' });
            return;
        }

        const player = {
            id: socket.id,
            name: playerName,
            isHost: false
        };

        room.players.push(player);
        players.set(socket.id, { ...player, roomCode });

        socket.join(roomCode);

        // Notify all players in room
        io.to(roomCode).emit('player-list-updated', {
            room: room
        });

        socket.emit('room-joined', {
            roomCode: roomCode,
            room: room
        });

        console.log(`${playerName} joined room ${roomCode}. Total players: ${room.players.length}`);
    });

    // DISCONNECT
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        const player = players.get(socket.id);
        if (!player) return;

        const room = rooms.get(player.roomCode);
        if (!room) return;

        // If host disconnects, kick everyone
        if (player.isHost) {
            io.to(player.roomCode).emit('host-disconnected');
            
            // Clean up room
            room.players.forEach(p => {
                players.delete(p.id);
            });
            rooms.delete(player.roomCode);
            
            console.log(`Host disconnected, room ${player.roomCode} closed`);
        } else {
            // Remove player from room
            room.players = room.players.filter(p => p.id !== socket.id);
            players.delete(socket.id);

            // Notify remaining players
            io.to(player.roomCode).emit('player-list-updated', {
                room: room
            });

            console.log(`${player.name} left room ${player.roomCode}`);
        }
    });

    // KICK PLAYER
    socket.on('kick-player', (data) => {
        const { roomCode, playerId } = data;
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        // Verify kicker is host
        const kicker = players.get(socket.id);
        if (!kicker || !kicker.isHost) {
            socket.emit('error', { message: 'Only host can kick players' });
            return;
        }

        // Find and remove player
        const kickedPlayer = room.players.find(p => p.id === playerId);
        if (kickedPlayer) {
            room.players = room.players.filter(p => p.id !== playerId);
            players.delete(playerId);

            // Notify kicked player
            io.to(playerId).emit('kicked');

            // Force disconnect
            const kickedSocket = io.sockets.sockets.get(playerId);
            if (kickedSocket) {
                kickedSocket.disconnect(true);
            }

            // Notify remaining players
            io.to(roomCode).emit('player-kicked', {
                playerName: kickedPlayer.name,
                room: room
            });

            console.log(`Player ${kickedPlayer.name} kicked from room ${roomCode}`);
        }
    });

    // START GAME
    socket.on('start-game', (data) => {
        const { roomCode } = data;
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        // Check if socket is the host
        const player = players.get(socket.id);
        if (!player || !player.isHost) {
            socket.emit('error', { message: 'Only host can start the game' });
            return;
        }

        // Check minimum players (3 for most games)
        if (room.players.length < 3) {
            socket.emit('error', { message: 'Need at least 3 players to start' });
            return;
        }

        // Initialize game based on game type
        if (room.gameType === 'imposter') {
            initImposterGame(room);
        }
        // Add other game types here

        room.gameState = 'playing';

        // Notify all players to start
        io.to(roomCode).emit('game-started', {
            roomCode: roomCode,
            gameType: room.gameType
        });

        console.log(`Game started in room ${roomCode}`);
    });

    // IMPOSTER GAME: Submit Clue
    socket.on('submit-clue', (data) => {
        const { roomCode, playerName, clue } = data;
        const room = rooms.get(roomCode);

        if (!room || !room.gameData.clues) {
            socket.emit('error', { message: 'Game not found' });
            return;
        }

        // Add clue
        room.gameData.clues.push({
            playerName: playerName,
            clue: clue
        });

        // Notify all players of new clue
        io.to(roomCode).emit('clue-submitted', {
            clues: room.gameData.clues,
            totalPlayers: room.players.length
        });

        console.log(`Clue submitted by ${playerName}: ${clue}`);

        // Check if all clues are in
        if (room.gameData.clues.length === room.players.length) {
            console.log('All clues submitted, starting voting phase');
            setTimeout(() => {
                io.to(roomCode).emit('all-clues-submitted', {
                    players: room.players
                });
            }, 1000);
        }
    });

    // IMPOSTER GAME: Submit Vote
    socket.on('submit-vote', (data) => {
        const { roomCode, playerName, votedFor } = data;
        const room = rooms.get(roomCode);

        if (!room || !room.gameData.votes) {
            socket.emit('error', { message: 'Game not found' });
            return;
        }

        // Record vote
        room.gameData.votes[playerName] = votedFor;

        console.log(`Vote submitted by ${playerName} for ${votedFor}`);

        // Check if all votes are in
        const voteCount = Object.keys(room.gameData.votes).length;
        if (voteCount === room.players.length) {
            console.log('All votes submitted, calculating results');
            calculateImposterResults(room);
        }
    });

    // Initialize Imposter game
    function initImposterGame(room) {
        const words = [
            'Pizza', 'Ocean', 'Mountain', 'Guitar', 'Coffee', 'Rainbow', 'Dinosaur', 'Robot',
            'Sunset', 'Laptop', 'Basketball', 'Chocolate', 'Spaceship', 'Dragon', 'Camera',
            'Volcano', 'Unicorn', 'Thunder', 'Waterfall', 'Moonlight', 'Butterfly', 'Castle',
            'Elephant', 'Rocket', 'Pancake', 'Lightning', 'Penguin', 'Tornado', 'Wizard',
            'Galaxy', 'Treasure', 'Phoenix', 'Submarine', 'Compass', 'Telescope', 'Flamingo'
        ];

        const word = words[Math.floor(Math.random() * words.length)];

        // Randomly select imposter
        const imposterIndex = Math.floor(Math.random() * room.players.length);
        const imposterId = room.players[imposterIndex].id;

        // Store game data
        room.gameData = {
            word: word,
            imposterId: imposterId,
            imposterName: room.players[imposterIndex].name,
            clues: [],
            votes: {}
        };

        console.log(`Imposter game initialized. Word: ${word}, Imposter: ${room.players[imposterIndex].name}`);

        // Assign roles to all players
        room.players.forEach((player, index) => {
            const isImposter = index === imposterIndex;

            // Send role to each player privately
            io.to(player.id).emit('role-assigned', {
                role: isImposter ? 'imposter' : 'player',
                word: isImposter ? null : word,
                players: room.players.map(p => ({ name: p.name }))
            });
        });
    }

    // Calculate Imposter game results
    function calculateImposterResults(room) {
        const votes = room.gameData.votes;
        const voteTally = {};

        // Count votes
        for (const votedFor of Object.values(votes)) {
            voteTally[votedFor] = (voteTally[votedFor] || 0) + 1;
        }

        // Find player with most votes
        let maxVotes = 0;
        let votedPlayer = null;

        for (const [player, voteCount] of Object.entries(voteTally)) {
            if (voteCount > maxVotes) {
                maxVotes = voteCount;
                votedPlayer = player;
            }
        }

        // Check if voted player is the imposter
        const votedPlayerWasImposter = votedPlayer === room.gameData.imposterName;

        console.log(`Game results: Voted out ${votedPlayer}, Was imposter: ${votedPlayerWasImposter}`);

        // Send results to all players
        io.to(room.code).emit('game-results', {
            votedPlayer: votedPlayer,
            votedPlayerWasImposter: votedPlayerWasImposter,
            voteTally: voteTally,
            actualWord: room.gameData.word,
            imposterName: room.gameData.imposterName
        });

        // Reset game state
        room.gameState = 'finished';
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.send('PlayHub Backend Server Running');
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        rooms: rooms.size,
        players: players.size
    });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
});
