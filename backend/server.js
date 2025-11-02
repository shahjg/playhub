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
const disconnectTimers = new Map(); // socketId -> timeout for delayed cleanup

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

  // CREATE ROOM (initial creation only)
  socket.on('create-room', (data) => {
    const { playerName, gameType } = data;
    
    // Always generate a new room code for initial creation
    const roomCode = generateRoomCode();
    
    console.log(`Creating room: ${roomCode} for player: ${playerName}`);
    
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
    
    // Send success response to creator with the room code
    socket.emit('room-created', {
      success: true,
      roomCode: roomCode,
      room: newRoom
    });
    
    console.log(`Room created: ${roomCode} by ${playerName}`);
  });

  // REJOIN ROOM (for page refreshes or reconnections)
  socket.on('rejoin-room', (data) => {
    const { roomCode, playerName } = data;
    
    console.log(`Player ${playerName} attempting to rejoin room: ${roomCode}`);
    
    const room = rooms.get(roomCode);
    if (!room) {
      console.log(`Room ${roomCode} not found for rejoin`);
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    // Find if player already exists in room
    const existingPlayer = room.players.find(p => p.name === playerName);
    
    if (existingPlayer) {
      // Cancel any pending disconnect timer for this player
      const oldId = existingPlayer.id;
      if (disconnectTimers.has(oldId)) {
        console.log(`Cancelling disconnect timer for ${playerName}`);
        clearTimeout(disconnectTimers.get(oldId));
        disconnectTimers.delete(oldId);
      }
      
      // Update socket ID for reconnection
      existingPlayer.id = socket.id;
      
      // Update players map
      players.delete(oldId);
      players.set(socket.id, {
        roomCode: roomCode,
        playerName: playerName,
        isHost: existingPlayer.isHost
      });
      
      // Check if they were the host
      if (room.hostId === oldId) {
        room.hostId = socket.id;
        console.log(`Host ${playerName} reconnected with new socket ID`);
      }
    } else {
      // Player wasn't in room, add them
      room.players.push({
        id: socket.id,
        name: playerName,
        isHost: false,
        joinedAt: new Date()
      });
      
      players.set(socket.id, {
        roomCode: roomCode,
        playerName: playerName,
        isHost: false
      });
    }
    
    // Join socket room
    socket.join(roomCode);
    
    // Send room state to rejoining player
    socket.emit('room-joined', {
      success: true,
      roomCode: roomCode,
      room: room
    });
    
    // If game is active, send the player their role
    if (room.gameState === 'playing' && room.gameData && room.gameData.roleAssignments) {
      const playerRole = room.gameData.roleAssignments[playerName];
      if (playerRole) {
        console.log(`Sending role assignment to ${playerName}: ${playerRole.role}`);
        socket.emit('role-assigned', playerRole);
        
        // Handle game phase transitions
        if (room.gameData.phase === 'role-reveal') {
          // Schedule clue phase start if not already scheduled
          if (!room.gameData.phaseTransitionScheduled) {
            room.gameData.phaseTransitionScheduled = true;
            console.log('Scheduling clue phase start in 5 seconds...');
            setTimeout(() => {
              if (room.gameData.phase === 'role-reveal') { // Double check we're still in role reveal
                room.gameData.phase = 'clue-giving';
                io.to(roomCode).emit('clue-phase-start', {
                  timeLimit: 60,
                  round: room.gameData.currentRound
                });
                console.log(`Clue phase started in room ${roomCode}, Round ${room.gameData.currentRound}`);
              }
            }, 5000);
          }
        } else if (room.gameData.phase === 'clue-giving') {
          // Already in clue phase, send current state
          socket.emit('clue-phase-start', {
            timeLimit: 60,
            round: room.gameData.currentRound
          });
          // Send existing clues
          room.gameData.clues.forEach(clue => {
            socket.emit('clue-submitted', {
              playerName: clue.playerName,
              clue: clue.clue,
              totalClues: room.gameData.clues.length,
              totalPlayers: room.players.length
            });
          });
        } else if (room.gameData.phase === 'voting') {
          // Already in voting phase
          socket.emit('voting-phase-start', {
            clues: room.gameData.clues,
            players: room.players,
            round: room.gameData.currentRound
          });
          // Send current vote count
          socket.emit('vote-counted', {
            totalVotes: Object.keys(room.gameData.votes).length,
            totalPlayers: room.players.length
          });
          // Send skip vote count if not final round
          if (room.gameData.currentRound < 3) {
            socket.emit('skip-vote-counted', {
              skipVotes: room.gameData.skipVotes.length,
              totalPlayers: room.players.length
            });
          }
        } else if (room.gameData.phase === 'results') {
          // Game ended, send results
          const imposterCaught = room.gameData.votedOutPlayerId === room.gameData.imposterId;
          const imposterPlayer = room.players.find(p => p.name === room.gameData.imposterName);
          const votedOutPlayer = room.players.find(p => p.id === room.gameData.votedOutPlayerId);
          
          socket.emit('game-results', {
            imposterCaught: imposterCaught,
            imposter: imposterPlayer,
            votedOut: votedOutPlayer,
            word: room.gameData.word,
            voteCounts: room.gameData.voteCounts || {}
          });
        }
      }
    }
    
    // Notify others
    socket.to(roomCode).emit('player-joined', {
      player: room.players.find(p => p.id === socket.id),
      room: room
    });
    
    console.log(`Player ${playerName} rejoined room ${roomCode}`);
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
    
    // Check if name is already taken IN THIS SPECIFIC ROOM ONLY
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
    
    // Store game data with role assignments
    room.gameData = {
      word: word,
      imposterId: imposterId,
      imposterName: room.players[imposterIndex].name,
      clues: [],
      votes: {},
      skipVotes: [],
      currentRound: 1,
      maxRounds: 3,
      phase: 'role-reveal', // phases: role-reveal, clue-giving, voting, results
      roleAssignments: {} // Store roles by player name (not socket ID, since IDs change)
    };
    
    // Store role assignments by player name
    room.players.forEach((player, index) => {
      const isImposter = index === imposterIndex;
      room.gameData.roleAssignments[player.name] = {
        role: isImposter ? 'imposter' : 'player',
        word: isImposter ? null : word,
        isImposter: isImposter
      };
    });
    
    console.log(`Game initialized in room ${room.code}. Imposter: ${room.gameData.imposterName}, Word: ${word}`);
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
    
    // Check if player already submitted a clue
    const existingClue = room.gameData.clues.find(c => c.playerId === socket.id);
    if (existingClue) {
      socket.emit('error', { message: 'You already submitted a clue' });
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
      room.gameData.votes = {}; // Reset votes
      room.gameData.skipVotes = []; // Reset skip votes
      io.to(roomCode).emit('voting-phase-start', {
        clues: room.gameData.clues,
        players: room.players,
        round: room.gameData.currentRound
      });
    }
  });

  // VOTE TO SKIP ROUND (for Imposter game)
  socket.on('vote-skip', (data) => {
    const { roomCode } = data;
    const room = rooms.get(roomCode);
    const player = players.get(socket.id);
    
    if (!room || !player) {
      socket.emit('error', { message: 'Invalid room or player' });
      return;
    }
    
    // Can only skip in rounds 1 and 2
    if (room.gameData.currentRound >= 3) {
      socket.emit('error', { message: 'Cannot skip final round' });
      return;
    }
    
    // Check if player already voted to skip
    if (room.gameData.skipVotes.includes(socket.id)) {
      socket.emit('error', { message: 'You already voted to skip' });
      return;
    }
    
    // Add skip vote
    room.gameData.skipVotes.push(socket.id);
    
    // Notify all players about skip vote count
    io.to(roomCode).emit('skip-vote-counted', {
      skipVotes: room.gameData.skipVotes.length,
      totalPlayers: room.players.length
    });
    
    console.log(`Skip vote in room ${roomCode}: ${room.gameData.skipVotes.length}/${room.players.length}`);
    
    // Check if majority voted to skip
    const majority = Math.ceil(room.players.length / 2);
    if (room.gameData.skipVotes.length >= majority) {
      // Skip to next round
      room.gameData.currentRound++;
      room.gameData.phase = 'role-reveal';
      room.gameData.clues = []; // Reset clues
      room.gameData.votes = {};
      room.gameData.skipVotes = [];
      
      console.log(`Round skipped in room ${roomCode}, starting round ${room.gameData.currentRound}`);
      
      // Notify players
      io.to(roomCode).emit('round-skipped', {
        round: room.gameData.currentRound
      });
      
      // Start next round after brief delay
      setTimeout(() => {
        room.gameData.phase = 'clue-giving';
        io.to(roomCode).emit('clue-phase-start', {
          timeLimit: 60,
          round: room.gameData.currentRound
        });
      }, 3000);
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
    const imposterPlayer = room.players.find(p => p.name === room.gameData.imposterName);
    const imposterCaught = votedOutPlayerId === (imposterPlayer ? imposterPlayer.id : room.gameData.imposterId);
    const votedOutPlayer = room.players.find(p => p.id === votedOutPlayerId);
    
    room.gameData.phase = 'results';
    room.gameData.voteCounts = voteCounts;
    room.gameData.votedOutPlayerId = votedOutPlayerId;
    room.gameData.imposterCaught = imposterCaught;
    
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
          console.log(`Host disconnected from room ${player.roomCode}, waiting 10s before cleanup...`);
          
          // Set a timer to delete the room after 10 seconds
          // If the host reconnects within 10 seconds, this timer will be cancelled
          const timer = setTimeout(() => {
            console.log(`Host did not reconnect, closing room ${player.roomCode}`);
            
            const currentRoom = rooms.get(player.roomCode);
            if (currentRoom) {
              // Notify all other players that host left
              io.to(player.roomCode).emit('host-left', {
                message: 'The host has left. Game disconnected.'
              });
              
              // Remove all players from the room
              currentRoom.players.forEach(p => {
                players.delete(p.id);
                // Disconnect their sockets
                const playerSocket = io.sockets.sockets.get(p.id);
                if (playerSocket) {
                  playerSocket.leave(player.roomCode);
                  playerSocket.disconnect(true);
                }
              });
              
              // Delete the room
              rooms.delete(player.roomCode);
              console.log(`Room ${player.roomCode} deleted (host left)`);
            }
            
            disconnectTimers.delete(socket.id);
          }, 10000); // 10 second grace period
          
          disconnectTimers.set(socket.id, timer);
          
        } else {
          // Regular player disconnected - also give them a grace period
          console.log(`Player ${player.playerName} disconnected, waiting 10s before cleanup...`);
          
          const timer = setTimeout(() => {
            console.log(`Player ${player.playerName} did not reconnect, removing from room`);
            
            const currentRoom = rooms.get(player.roomCode);
            if (currentRoom) {
              // Remove player from room
              currentRoom.players = currentRoom.players.filter(p => p.id !== socket.id);
              
              // If room is now empty, delete it
              if (currentRoom.players.length === 0) {
                rooms.delete(player.roomCode);
                console.log(`Room ${player.roomCode} deleted (empty)`);
              } else {
                // Notify remaining players
                io.to(player.roomCode).emit('player-disconnected', {
                  playerName: player.playerName,
                  room: currentRoom
                });
              }
            }
            
            players.delete(socket.id);
            disconnectTimers.delete(socket.id);
          }, 10000); // 10 second grace period
          
          disconnectTimers.set(socket.id, timer);
        }
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
