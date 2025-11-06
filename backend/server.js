// ============================================
// EXACT SERVER.JS STRUCTURE - COPY THIS PATTERN
// ============================================

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

const rooms = new Map();
const players = new Map();
const disconnectTimers = new Map();

function generateRoomCode() {
  // ... your existing code
}

// ============================================
// ADD ALL WEREWOLF HELPER FUNCTIONS HERE
// (BEFORE io.on('connection'))
// ============================================

function initWerewolfGame(room) {
  const playerCount = room.players.length;
  
  let werewolfCount = Math.floor(playerCount / 3);
  if (werewolfCount < 1) werewolfCount = 1;
  if (werewolfCount > 3) werewolfCount = 3;
  
  const hasSeer = playerCount >= 4;
  const hasDoctor = playerCount >= 6;
  
  console.log(`Werewolf game setup: ${playerCount} players, ${werewolfCount} werewolves`);
  
  const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);
  
  const werewolves = [];
  let seer = null;
  let doctor = null;
  let roleIndex = 0;
  
  for (let i = 0; i < werewolfCount; i++) {
    werewolves.push(shuffledPlayers[roleIndex]);
    roleIndex++;
  }
  
  if (hasSeer && roleIndex < shuffledPlayers.length) {
    seer = shuffledPlayers[roleIndex];
    roleIndex++;
  }
  
  if (hasDoctor && roleIndex < shuffledPlayers.length) {
    doctor = shuffledPlayers[roleIndex];
    roleIndex++;
  }
  
  room.gameData = {
    werewolves: werewolves.map(w => w.id),
    werewolfNames: werewolves.map(w => w.name),
    seer: seer ? seer.id : null,
    seerName: seer ? seer.name : null,
    doctor: doctor ? doctor.id : null,
    doctorName: doctor ? doctor.name : null,
    alivePlayers: room.players.map(p => ({
      id: p.id,
      name: p.name,
      isWerewolf: werewolves.some(w => w.id === p.id)
    })),
    deadPlayers: [],
    currentRound: 1,
    phase: 'role-reveal',
    nightActions: {},
    votes: {},
    roleAssignments: {}
  };
  
  room.players.forEach(player => {
    let role = 'villager';
    if (werewolves.some(w => w.id === player.id)) {
      role = 'werewolf';
    } else if (seer && player.id === seer.id) {
      role = 'seer';
    } else if (doctor && player.id === doctor.id) {
      role = 'doctor';
    }
    
    room.gameData.roleAssignments[player.name] = {
      role: role,
      isWerewolf: role === 'werewolf'
    };
  });
  
  room.players.forEach(player => {
    const roleData = room.gameData.roleAssignments[player.name];
    io.to(player.id).emit('role-assigned', roleData);
  });
  
  const werewolfTeam = werewolves.map(w => ({ id: w.id, name: w.name }));
  werewolves.forEach(wolf => {
    io.to(wolf.id).emit('werewolf-team', { werewolves: werewolfTeam });
  });
  
  console.log(`Werewolf game initialized in room ${room.code}`);
  
  setTimeout(() => {
    startNightPhase(room);
  }, 5000);
}

function startNightPhase(room) {
  room.gameData.phase = 'night';
  room.gameData.nightActions = {};
  console.log(`Night ${room.gameData.currentRound} started in room ${room.code}`);
  startWerewolfPhase(room);
}

function startWerewolfPhase(room) {
  io.to(room.code).emit('night-phase-start', {
    activeRole: 'werewolf',
    alivePlayers: room.gameData.alivePlayers,
    timeLimit: 45
  });
  
  setTimeout(() => {
    if (room.gameData.phase === 'night' && !room.gameData.nightActions.werewolfTarget) {
      const nonWolves = room.gameData.alivePlayers.filter(p => !p.isWerewolf);
      if (nonWolves.length > 0) {
        const randomTarget = nonWolves[Math.floor(Math.random() * nonWolves.length)];
        room.gameData.nightActions.werewolfTarget = randomTarget.id;
      }
      proceedToSeerPhase(room);
    }
  }, 50000);
}

function proceedToSeerPhase(room) {
  if (room.gameData.seer && room.gameData.alivePlayers.some(p => p.id === room.gameData.seer)) {
    io.to(room.code).emit('night-phase-start', {
      activeRole: 'seer',
      alivePlayers: room.gameData.alivePlayers,
      timeLimit: 30
    });
    
    setTimeout(() => {
      proceedToDoctorPhase(room);
    }, 35000);
  } else {
    proceedToDoctorPhase(room);
  }
}

function proceedToDoctorPhase(room) {
  if (room.gameData.doctor && room.gameData.alivePlayers.some(p => p.id === room.gameData.doctor)) {
    io.to(room.code).emit('night-phase-start', {
      activeRole: 'doctor',
      alivePlayers: room.gameData.alivePlayers,
      timeLimit: 30
    });
    
    setTimeout(() => {
      processNightActions(room);
    }, 35000);
  } else {
    processNightActions(room);
  }
}

function processNightActions(room) {
  const targetId = room.gameData.nightActions.werewolfTarget;
  const savedId = room.gameData.nightActions.doctorSave;
  
  let killedPlayer = null;
  let savedByDoctor = false;
  
  if (targetId) {
    if (savedId === targetId) {
      savedByDoctor = true;
      console.log(`Doctor saved the target in room ${room.code}`);
    } else {
      killedPlayer = room.gameData.alivePlayers.find(p => p.id === targetId);
      if (killedPlayer) {
        room.gameData.alivePlayers = room.gameData.alivePlayers.filter(p => p.id !== targetId);
        room.gameData.deadPlayers.push(killedPlayer);
        console.log(`${killedPlayer.name} was killed in room ${room.code}`);
      }
    }
  }
  
  if (checkWinConditions(room)) {
    return;
  }
  
  startDayPhase(room, killedPlayer, savedByDoctor);
}

function startDayPhase(room, killedPlayer, savedByDoctor) {
  room.gameData.phase = 'day';
  console.log(`Day ${room.gameData.currentRound} started in room ${room.code}`);
  
  io.to(room.code).emit('day-phase-start', {
    alivePlayers: room.gameData.alivePlayers,
    killedPlayer: killedPlayer,
    savedByDoctor: savedByDoctor,
    timeLimit: 90
  });
  
  setTimeout(() => {
    startVotingPhase(room);
  }, 95000);
}

function startVotingPhase(room) {
  room.gameData.phase = 'voting';
  room.gameData.votes = {};
  console.log(`Voting started in room ${room.code}`);
  
  io.to(room.code).emit('voting-phase-start', {
    alivePlayers: room.gameData.alivePlayers,
    timeLimit: 45
  });
}

function processVotingResults(room) {
  const voteCounts = {};
  
  Object.values(room.gameData.votes).forEach(votedId => {
    voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
  });
  
  let maxVotes = 0;
  let eliminatedId = null;
  
  Object.entries(voteCounts).forEach(([playerId, votes]) => {
    if (votes > maxVotes) {
      maxVotes = votes;
      eliminatedId = playerId;
    }
  });
  
  let eliminatedPlayer = null;
  if (eliminatedId) {
    eliminatedPlayer = room.gameData.alivePlayers.find(p => p.id === eliminatedId);
    if (eliminatedPlayer) {
      room.gameData.alivePlayers = room.gameData.alivePlayers.filter(p => p.id !== eliminatedId);
      room.gameData.deadPlayers.push(eliminatedPlayer);
      
      const playerObj = room.players.find(p => p.id === eliminatedId);
      if (playerObj) {
        eliminatedPlayer.role = room.gameData.roleAssignments[playerObj.name].role;
      }
      
      console.log(`${eliminatedPlayer.name} was eliminated by vote in room ${room.code}`);
    }
  }
  
  if (checkWinConditions(room, eliminatedPlayer)) {
    return;
  }
  
  room.gameData.currentRound++;
  setTimeout(() => {
    startNightPhase(room);
  }, 5000);
}

function checkWinConditions(room, eliminatedPlayer = null) {
  const aliveWerewolves = room.gameData.alivePlayers.filter(p => p.isWerewolf).length;
  const aliveVillagers = room.gameData.alivePlayers.filter(p => !p.isWerewolf).length;
  
  console.log(`Win check: ${aliveWerewolves} wolves, ${aliveVillagers} villagers`);
  
  let gameOver = false;
  let villagersWin = false;
  let werewolvesWin = false;
  
  if (aliveWerewolves === 0) {
    gameOver = true;
    villagersWin = true;
  } else if (aliveWerewolves >= aliveVillagers) {
    gameOver = true;
    werewolvesWin = true;
  }
  
  if (gameOver) {
    room.gameData.phase = 'results';
    
    const allRoles = room.players.map(p => {
      const roleData = room.gameData.roleAssignments[p.name];
      return {
        name: p.name,
        role: roleData.role
      };
    });
    
    io.to(room.code).emit('game-results', {
      villagersWin: villagersWin,
      werewolvesWin: werewolvesWin,
      eliminatedPlayer: eliminatedPlayer,
      allRoles: allRoles
    });
    
    console.log(`Game over in room ${room.code}`);
    return true;
  }
  
  return false;
}

// ============================================
// NOW START THE SOCKET CONNECTION BLOCK
// NOTICE: All socket.on() handlers go INSIDE here
// ============================================

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // ... your existing handlers like create-room, join-room, etc.

  // START GAME HANDLER - UPDATE THIS
  socket.on('start-game', (data) => {
    const { roomCode, category, twoSpies } = data;
    const room = rooms.get(roomCode);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const player = players.get(socket.id);
    if (!player || !player.isHost) {
      socket.emit('error', { message: 'Only host can start the game' });
      return;
    }
    
    if (room.players.length < 3) {
      socket.emit('error', { message: 'Need at least 3 players to start' });
      return;
    }
    
    // Initialize game based on game type
    if (room.gameType === 'imposter') {
      initImposterGame(room, category || 'random');
    } else if (room.gameType === 'spyfall') {
      initSpyfallGame(room, category || 'random', twoSpies || false);
    } else if (room.gameType === 'werewolf') {
      initWerewolfGame(room);
    }
    
    room.gameState = 'playing';
    
    io.to(roomCode).emit('game-started', {
      roomCode: roomCode,
      gameType: room.gameType
    });
    
    console.log(`Game started in room ${roomCode}`);
  });

  // NIGHT ACTION HANDLER - ADD THIS INSIDE THE CONNECTION BLOCK
  socket.on('night-action', (data) => {
    const { roomCode, actionType, targetId } = data;
    const room = rooms.get(roomCode);
    const player = players.get(socket.id);
    
    if (!room || !player) {
      socket.emit('error', { message: 'Invalid room or player' });
      return;
    }
    
    console.log(`Night action: ${actionType} by ${player.playerName}`);
    
    if (actionType === 'werewolf-target') {
      if (!room.gameData.werewolfVotes) {
        room.gameData.werewolfVotes = {};
      }
      room.gameData.werewolfVotes[socket.id] = targetId;
      
      const aliveWerewolves = room.gameData.alivePlayers.filter(p => p.isWerewolf);
      const werewolfVotes = Object.keys(room.gameData.werewolfVotes).length;
      
      if (werewolfVotes >= aliveWerewolves.length) {
        const voteCounts = {};
        Object.values(room.gameData.werewolfVotes).forEach(voted => {
          voteCounts[voted] = (voteCounts[voted] || 0) + 1;
        });
        
        let maxVotes = 0;
        let target = null;
        Object.entries(voteCounts).forEach(([id, count]) => {
          if (count > maxVotes) {
            maxVotes = count;
            target = id;
          }
        });
        
        room.gameData.nightActions.werewolfTarget = target;
        room.gameData.werewolfVotes = {};
        
        proceedToSeerPhase(room);
      }
      
      socket.emit('night-action-confirmed', {});
      
    } else if (actionType === 'seer-check') {
      const targetPlayer = room.gameData.alivePlayers.find(p => p.id === targetId);
      if (targetPlayer) {
        socket.emit('seer-vision', {
          playerName: targetPlayer.name,
          isWerewolf: targetPlayer.isWerewolf
        });
        
        room.gameData.nightActions.seerCheck = targetId;
        
        setTimeout(() => {
          proceedToDoctorPhase(room);
        }, 3000);
      }
      
      socket.emit('night-action-confirmed', {});
      
    } else if (actionType === 'doctor-save') {
      room.gameData.nightActions.doctorSave = targetId;
      socket.emit('night-action-confirmed', {});
      
      setTimeout(() => {
        processNightActions(room);
      }, 2000);
    }
  });

  // SUBMIT VOTE HANDLER - UPDATE THIS
  socket.on('submit-vote', (data) => {
    const { roomCode, votedPlayerId } = data;
    const room = rooms.get(roomCode);
    const player = players.get(socket.id);
    
    if (!room || !player) {
      socket.emit('error', { message: 'Invalid room or player' });
      return;
    }
    
    room.gameData.votes[socket.id] = votedPlayerId;
    
    const totalVotes = Object.keys(room.gameData.votes).length;
    
    let totalPlayers;
    if (room.gameType === 'werewolf') {
      totalPlayers = room.gameData.alivePlayers.length;
    } else {
      totalPlayers = room.players.length;
    }
    
    const majority = Math.ceil(totalPlayers / 2);
    
    io.to(roomCode).emit('vote-counted', {
      totalVotes: totalVotes,
      totalPlayers: totalPlayers
    });
    
    const voteCounts = {};
    Object.values(room.gameData.votes).forEach(votedId => {
      voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
    });
    
    const maxVotes = Math.max(...Object.values(voteCounts));
    const hasConsensus = maxVotes >= majority;
    
    if (hasConsensus || totalVotes === totalPlayers) {
      if (room.gameType === 'imposter') {
        calculateImposterResults(room);
      } else if (room.gameType === 'spyfall') {
        calculateSpyfallResults(room);
      } else if (room.gameType === 'werewolf') {
        processVotingResults(room);
      }
    }
  });

  // ... your other handlers (disconnect, kick-player, etc.)

}); // ← END OF io.on('connection') - VERY IMPORTANT!

// ============================================
// START SERVER (after the connection block closes)
// ============================================

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
