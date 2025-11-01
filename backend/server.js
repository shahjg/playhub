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

console.log('Frontend URL:', process.env.FRONTEND_URL);

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
    const { playerName, gameType, roomCode: existingRoomCode } = data;
    
    // Use existing room code if provided (for host reconnection), otherwise generate new one
    const roomCode = existingRoomCode || generateRoomCode();
    
    console.log(`Creating room: ${roomCode} for player: ${playerName}`);
    
    // Check if room already exists with this code
    const existingRoom = rooms.get(roomCode);
    if (existingRoom && !existingRoomCode) {
      // Room code collision (rare), generate a new one
      console.log(`Room ${roomCode} already exists, generating new code`);
      const newRoomCode = generateRoomCode();
      return socket.emit('create-room', { playerName, gameType, roomCode: newRoomCode });
    }
    
    // If room exists and we're reconnecting, clear it and recreate
    if (existingRoom && existingRoomCode) {
      console.log(`Recreating existing room: ${roomCode}`);
      rooms.delete(roomCode);
    }
    
    // Create new room
    const newRoom = {
      code: roomCode,
      gameType: gameType,
      hostId: socket.id,
      players: [{
        id: socket.id,
        name: playerName,
        isHost: true,
        joinedAt: new Date()
      }],
      gameState: 'waiting',
      createdAt: new Date()
    };
    
    rooms.set(roomCode, newRoom);
    players.set(socket.id, {
      roomCode: roomCode,
      playerName: playerName,
      isHost: true
    });
    
    // Join socket room
    socket.join(roomCode);
    
    // Send success response to creator
    socket.emit('room-created', {
      success: true,
      roomCode: roomCode,
      room: newRoom
    });
    
    console.log(`Room created: ${roomCode} by ${playerName}`);
  });

  // GET ROOM STATE (for reconnections and host initial load)
  socket.on('get-room-state', (data) => {
    const { roomCode } = data;
    const room = rooms.get(roomCode);
    
    if (room) {
      socket.emit('room-state', {
        success: true,
        room: room
      });
    }
  });

  // JOIN ROOM
  socket.on('join-room', (data) => {
    const { roomCode, playerName } = data;
    
    console.log(`Player ${playerName} attempting to join room: ${roomCode}`);
    
    // Check if room exists
    const room = rooms.get(roomCode);
    if (!room) {
      console.log(`Room ${roomCode} not found`);
      socket.emit('join-error', { message: 'Room not found' });
      return;
    }
    
    // FIXED: Check if name is already taken IN THIS SPECIFIC ROOM ONLY
    const nameExists = room.players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (nameExists) {
      console.log(`Name ${playerName} already taken in room ${roomCode}`);
      socket.emit('join-error', { message: 'Name already taken' });
      return;
    }
    
    // Check if room is full (max 15 players)
    if (room.players.length >= 15) {
      console.log(`Room ${roomCode} is full`);
      socket.emit('join-error', { message: 'Room is full' });
      return;
    }
    
    // Add player to room
    const newPlayer = {
      id: socket.id,
      name: playerName,
      isHost: false,
      joinedAt: new Date()
    };
    
    room.players.push(newPlayer);
    
    // Store player info
    players.set(socket.id, {
      roomCode: roomCode,
      playerName: playerName,
      isHost: false
    });
    
    // Join socket room
    socket.join(roomCode);
    
    // Notify player they joined successfully
    socket.emit('room-joined', {
      success: true,
      roomCode: roomCode,
      room: room
    });
    
    // Notify all other players in the room
    socket.to(roomCode).emit('player-joined', {
      player: newPlayer,
      room: room
    });
    
    console.log(`Player ${playerName} joined room ${roomCode}. Total players: ${room.players.length}`);
  });

  // KICK PLAYER
  socket.on('kick-player', (data) => {
    const { roomCode, playerId } = data;
    const room = rooms.get(roomCode);
    const kicker = players.get(socket.id);
    
    if (!room || !kicker) {
      socket.emit('error', { message: 'Invalid room or player' });
      return;
    }
    
    // Only host can kick
    if (!kicker.isHost) {
      socket.emit('error', { message: 'Only host can kick players' });
      return;
    }
    
    // Can't kick yourself
    if (playerId === socket.id) {
      socket.emit('error', { message: 'Cannot kick yourself' });
      return;
    }
    
    // Find and remove player
    const kickedPlayer = room.players.find(p => p.id === playerId);
    if (kickedPlayer) {
      room.players = room.players.filter(p => p.id !== playerId);
      players.delete(playerId);
      
      // Notify kicked player with specific message
      io.to(playerId).emit('kicked', {
        message: 'You have been kicked by the host'
      });
      
      // Disconnect the kicked player's socket
      const kickedSocket = io.sockets.sockets.get(playerId);
      if (kickedSocket) {
        kickedSocket.disconnect(true);
      }
      
      // Notify all remaining players
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

  // Initialize Imposter game
  function initImposterGame(room) {
    const words = [
      'Pizza', 'Ocean', 'Mountain', 'Guitar', 'Coffee', 'Rainbow', 'Dinosaur', 'Robot',
      'Sunset', 'Laptop', 'Basketball', 'Chocolate', 'Spaceship', 'Dragon', 'Camera',
      'Volcano', 'Unicorn', 'Thunder', 'Waterfall', 'Moonlight', 'Butterfly', 'Castle'
    ];
    
    const word = words[Math.floor(Math.random() * words.length)];
    
    // Randomly select imposter
    const imposterIndex = Math.floor(Math.random() * room.players.length);
    const imposterId = room.players[imposterIndex].id;
    
    // Assign roles to all players
    room.players.forEach((player, index) => {
      const isImposter = index === imposterIndex;
      
      // Send role to each player privately
      io.to(player.id).emit('role-assigned', {
        role: isImposter ? 'imposter' : 'player',
        word: isImposter ? null : word,
        isImposter: isImposter
      });
    });
    
    // Store game data
    room.gameData = {
      word: word,
      imposterId: imposterId,
      clues: [],
      votes: {},
      phase: 'clue-giving' // phases: clue-giving, voting, results
    };
    
    // Start clue-giving phase
    io.to(room.code).emit('clue-phase-start', {
      timeLimit: 60 // seconds
    });
  }

  // SUBMIT CLUE (for Imposter game)
  socket.on('submit-clue', (data) => {
    const { roomCode, clue } = data;
    const room = rooms.get(roomCode);
    const player = players.get(socket.id);
    
    if (!room || !player) {
      socket.emit('error', { message: 'Invalid room or player' });
      return;
    }
    
    // Add clue to game data
    room.gameData.clues.push({
      playerId: socket.id,
      playerName: player.playerName,
      clue: clue
    });
    
    // Notify all players about new clue
    io.to(roomCode).emit('clue-submitted', {
      playerName: player.playerName,
      clue: clue,
      totalClues: room.gameData.clues.length,
      totalPlayers: room.players.length
    });
    
    // If all players submitted clues, start voting phase
    if (room.gameData.clues.length === room.players.length) {
      room.gameData.phase = 'voting';
      io.to(roomCode).emit('voting-phase-start', {
        clues: room.gameData.clues,
        players: room.players
      });
    }
  });

  // SUBMIT VOTE (for Imposter game)
  socket.on('submit-vote', (data) => {
    const { roomCode, votedPlayerId } = data;
    const room = rooms.get(roomCode);
    const player = players.get(socket.id);
    
    if (!room || !player) {
      socket.emit('error', { message: 'Invalid room or player' });
      return;
    }
    
    // Record vote
    room.gameData.votes[socket.id] = votedPlayerId;
    
    // Notify all players about vote count
    io.to(roomCode).emit('vote-counted', {
      totalVotes: Object.keys(room.gameData.votes).length,
      totalPlayers: room.players.length
    });
    
    // If all players voted, show results
    if (Object.keys(room.gameData.votes).length === room.players.length) {
      calculateImposterResults(room);
    }
  });

  // Calculate voting results for Imposter game
  function calculateImposterResults(room) {
    const voteCounts = {};
    
    // Count votes for each player
    Object.values(room.gameData.votes).forEach(votedPlayerId => {
      voteCounts[votedPlayerId] = (voteCounts[votedPlayerId] || 0) + 1;
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
    
    // Determine if imposter was caught
    const imposterCaught = votedOutPlayerId === room.gameData.imposterId;
    const imposterPlayer = room.players.find(p => p.id === room.gameData.imposterId);
    const votedOutPlayer = room.players.find(p => p.id === votedOutPlayerId);
    
    room.gameData.phase = 'results';
    
    // Send results to all players
    io.to(room.code).emit('game-results', {
      imposterCaught: imposterCaught,
      imposter: imposterPlayer,
      votedOut: votedOutPlayer,
      word: room.gameData.word,
      voteCounts: voteCounts
    });
  }

  // DISCONNECT
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    const player = players.get(socket.id);
    if (player) {
      const room = rooms.get(player.roomCode);
      if (room) {
        // Check if disconnecting player is the host
        if (player.isHost) {
          console.log(`Host disconnected from room ${player.roomCode}, closing room`);
          
          // Notify all other players that host left
          socket.to(player.roomCode).emit('host-left', {
            message: 'The host has left. Game disconnected.'
          });
          
          // Remove all players from the room
          room.players.forEach(p => {
            if (p.id !== socket.id) {
              players.delete(p.id);
              // Disconnect their sockets
              const playerSocket = io.sockets.sockets.get(p.id);
              if (playerSocket) {
                playerSocket.leave(player.roomCode);
              }
            }
          });
          
          // Delete the room
          rooms.delete(player.roomCode);
          console.log(`Room ${player.roomCode} deleted (host left)`);
        } else {
          // Regular player disconnected
          // Remove player from room
          room.players = room.players.filter(p => p.id !== socket.id);
          
          // If room is now empty, delete it
          if (room.players.length === 0) {
            rooms.delete(player.roomCode);
            console.log(`Room ${player.roomCode} deleted (empty)`);
          } else {
            // Notify remaining players
            io.to(player.roomCode).emit('player-disconnected', {
              playerName: player.playerName,
              room: room
            });
          }
        }
      }
      
      players.delete(socket.id);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
