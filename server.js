require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS configuration for frontend
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage (replace with database later)
const rooms = new Map(); // roomCode -> room data
const players = new Map(); // socketId -> player data

// Generate random 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Check if code already exists
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size, players: players.size });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // CREATE ROOM
  socket.on('create-room', (data) => {
    const { playerName, gameType } = data;
    const roomCode = generateRoomCode();
    
    const room = {
      code: roomCode,
      gameType: gameType,
      host: socket.id,
      state: 'waiting', // waiting, playing, ended
      players: [{
        id: socket.id,
        name: playerName,
        connected: true,
        isHost: true
      }],
      gameState: null,
      createdAt: Date.now()
    };

    rooms.set(roomCode, room);
    players.set(socket.id, { roomCode, playerName });
    
    socket.join(roomCode);
    
    socket.emit('room-created', {
      success: true,
      roomCode: roomCode,
      room: room
    });

    console.log(`Room created: ${roomCode} by ${playerName}`);
  });

  // JOIN ROOM
  socket.on('join-room', (data) => {
    const { roomCode, playerName } = data;
    const room = rooms.get(roomCode.toUpperCase());

    if (!room) {
      socket.emit('join-error', { message: 'Room not found' });
      return;
    }

    if (room.state !== 'waiting') {
      socket.emit('join-error', { message: 'Game already started' });
      return;
    }

    // Check if name already taken
    if (room.players.some(p => p.name === playerName)) {
      socket.emit('join-error', { message: 'Name already taken' });
      return;
    }

    // Add player to room
    room.players.push({
      id: socket.id,
      name: playerName,
      connected: true,
      isHost: false
    });

    players.set(socket.id, { roomCode: roomCode.toUpperCase(), playerName });
    socket.join(roomCode.toUpperCase());

    // Notify all players in room
    io.to(roomCode.toUpperCase()).emit('player-joined', {
      player: { name: playerName },
      room: room
    });

    socket.emit('room-joined', {
      success: true,
      room: room
    });

    console.log(`${playerName} joined room: ${roomCode}`);
  });

  // START GAME
  socket.on('start-game', (data) => {
    const playerData = players.get(socket.id);
    if (!playerData) return;

    const room = rooms.get(playerData.roomCode);
    if (!room || room.host !== socket.id) {
      socket.emit('error', { message: 'Only host can start game' });
      return;
    }

    if (room.players.length < 3) {
      socket.emit('error', { message: 'Need at least 3 players' });
      return;
    }

    // Initialize game based on type
    room.state = 'playing';
    
    if (room.gameType === 'imposter') {
      initImposterGame(room);
    }

    io.to(playerData.roomCode).emit('game-started', {
      gameType: room.gameType,
      gameState: room.gameState
    });

    console.log(`Game started in room: ${playerData.roomCode}`);
  });

  // IMPOSTER: Submit clue
  socket.on('submit-clue', (data) => {
    const playerData = players.get(socket.id);
    if (!playerData) return;

    const room = rooms.get(playerData.roomCode);
    if (!room || room.gameState.phase !== 'clues') return;

    const { clue } = data;
    
    // Store the clue
    room.gameState.clues[socket.id] = {
      playerName: playerData.playerName,
      clue: clue
    };

    // Check if all clues submitted
    const cluesCount = Object.keys(room.gameState.clues).length;
    if (cluesCount === room.players.length) {
      // Move to voting phase
      room.gameState.phase = 'voting';
      io.to(playerData.roomCode).emit('voting-started', {
        clues: room.gameState.clues,
        players: room.players
      });
    } else {
      // Notify player their clue was received
      socket.emit('clue-received');
      // Notify room of progress
      io.to(playerData.roomCode).emit('clue-submitted', {
        count: cluesCount,
        total: room.players.length
      });
    }
  });

  // IMPOSTER: Submit vote
  socket.on('submit-vote', (data) => {
    const playerData = players.get(socket.id);
    if (!playerData) return;

    const room = rooms.get(playerData.roomCode);
    if (!room || room.gameState.phase !== 'voting') return;

    const { votedPlayerId } = data;
    
    room.gameState.votes[socket.id] = votedPlayerId;

    // Check if all votes submitted
    const votesCount = Object.keys(room.gameState.votes).length;
    if (votesCount === room.players.length) {
      // Calculate results
      const results = calculateImposterResults(room);
      room.gameState.phase = 'results';
      room.gameState.results = results;
      room.state = 'ended';

      io.to(playerData.roomCode).emit('game-ended', {
        results: results
      });
    } else {
      socket.emit('vote-received');
      io.to(playerData.roomCode).emit('vote-submitted', {
        count: votesCount,
        total: room.players.length
      });
    }
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomCode);
      if (room) {
        // Mark player as disconnected
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          player.connected = false;
        }

        // Notify other players
        io.to(playerData.roomCode).emit('player-disconnected', {
          playerName: playerData.playerName
        });

        // If host disconnected and room is waiting, assign new host
        if (room.host === socket.id && room.state === 'waiting') {
          const newHost = room.players.find(p => p.connected && p.id !== socket.id);
          if (newHost) {
            room.host = newHost.id;
            newHost.isHost = true;
            io.to(playerData.roomCode).emit('new-host', {
              hostId: newHost.id,
              hostName: newHost.name
            });
          }
        }

        // Clean up empty rooms after 5 minutes
        if (room.players.every(p => !p.connected)) {
          setTimeout(() => {
            const currentRoom = rooms.get(playerData.roomCode);
            if (currentRoom && currentRoom.players.every(p => !p.connected)) {
              rooms.delete(playerData.roomCode);
              console.log(`Room deleted: ${playerData.roomCode}`);
            }
          }, 300000); // 5 minutes
        }
      }

      players.delete(socket.id);
    }
    console.log('Client disconnected:', socket.id);
  });
});

// IMPOSTER GAME LOGIC
function initImposterGame(room) {
  // Select random imposter
  const randomIndex = Math.floor(Math.random() * room.players.length);
  const imposterPlayerId = room.players[randomIndex].id;

  // Select random word
  const words = [
    'Pizza', 'Beach', 'Coffee', 'Guitar', 'Rainbow', 'Dragon',
    'Mountain', 'Laptop', 'Basketball', 'Sunglasses', 'Bicycle',
    'Campfire', 'Thunder', 'Butterfly', 'Waterfall', 'Headphones'
  ];
  const word = words[Math.floor(Math.random() * words.length)];

  room.gameState = {
    phase: 'clues', // clues, voting, results
    word: word,
    imposterPlayerId: imposterPlayerId,
    clues: {},
    votes: {},
    results: null
  };

  // Send word/imposter status to each player
  room.players.forEach(player => {
    const socket = io.sockets.sockets.get(player.id);
    if (socket) {
      socket.emit('game-initialized', {
        isImposter: player.id === imposterPlayerId,
        word: player.id === imposterPlayerId ? null : word
      });
    }
  });
}

function calculateImposterResults(room) {
  const voteCounts = {};
  
  // Count votes
  Object.values(room.gameState.votes).forEach(votedId => {
    voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
  });

  // Find player with most votes
  let maxVotes = 0;
  let votedOutPlayerId = null;
  Object.entries(voteCounts).forEach(([playerId, votes]) => {
    if (votes > maxVotes) {
      maxVotes = votes;
      votedOutPlayerId = playerId;
    }
  });

  const imposterWins = votedOutPlayerId !== room.gameState.imposterPlayerId;
  const votedOutPlayer = room.players.find(p => p.id === votedOutPlayerId);
  const imposterPlayer = room.players.find(p => p.id === room.gameState.imposterPlayerId);

  return {
    imposterWins: imposterWins,
    imposterPlayer: imposterPlayer,
    votedOutPlayer: votedOutPlayer,
    word: room.gameState.word,
    voteCounts: voteCounts
  };
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
