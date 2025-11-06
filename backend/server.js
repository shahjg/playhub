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
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================
// HERD MENTALITY HELPER FUNCTIONS
// ============================================

const herdMentalityQuestions = [
  "Name a pizza topping",
  "Name a fast food restaurant",
  "Name a superhero",
  "Name something cold",
  "Name a country in Europe",
  "Name something you find in a bathroom",
  "Name a car brand",
  "Name a fruit",
  "Name a sport",
  "Name a color",
  "Name an animal with four legs",
  "Name something hot",
  "Name a type of weather",
  "Name a holiday",
  "Name a streaming service",
  "Name something you wear on your feet",
  "Name a breakfast food",
  "Name a US state",
  "Name a profession",
  "Name something found in a kitchen",
  "Name a video game",
  "Name a social media platform",
  "Name a musical instrument",
  "Name something you drink",
  "Name a day of the week people hate",
  "Name a month of the year",
  "Name something scary",
  "Name a type of exercise",
  "Name a board game",
  "Name something you do at the beach",
  "Name a TV show genre",
  "Name something that flies",
  "Name a vegetable",
  "Name a candy bar",
  "Name a coffee shop chain",
  "Name something round",
  "Name a reason to call in sick",
  "Name a famous landmark",
  "Name something you'd find in a school",
  "Name a type of music",
  "Name something expensive",
  "Name a pet animal",
  "Name something green",
  "Name a movie genre",
  "Name something you need electricity for",
  "Name a reason to be late",
  "Name something you'd find at a party",
  "Name a type of shoe",
  "Name something that smells bad",
  "Name a popular baby name"
];

function initHerdMentalityGame(room, category = 'standard') {
  const shuffledQuestions = [...herdMentalityQuestions].sort(() => Math.random() - 0.5);
  
  // Determine win threshold based on category
  let winThreshold = 8; // default
  if (category === 'quick') {
    winThreshold = 5;
  } else if (category === 'marathon') {
    winThreshold = 12;
  }
  
  room.gameData = {
    questions: shuffledQuestions,
    currentQuestionIndex: 0,
    roundNumber: 1,
    phase: 'question',
    answers: {},
    scores: {},
    pinkCowHolder: null,
    winThreshold: winThreshold
  };
  
  // Initialize scores
  room.players.forEach(player => {
    room.gameData.scores[player.name] = 0;
  });
  
  console.log(`Herd Mentality game initialized in room ${room.code} (win at ${winThreshold} points)`);
  
  // Start first question
  setTimeout(() => {
    startHerdQuestion(room);
  }, 2000);
}

function startHerdQuestion(room) {
  room.gameData.phase = 'question';
  room.gameData.answers = {};
  
  const question = room.gameData.questions[room.gameData.currentQuestionIndex];
  
  console.log(`Starting question ${room.gameData.roundNumber} in room ${room.code}`);
  
  io.to(room.code).emit('question-phase', {
    question: question,
    roundNumber: room.gameData.roundNumber,
    timeLimit: 30
  });
  
  // Auto-proceed after 35 seconds
  setTimeout(() => {
    if (room.gameData.phase === 'question') {
      calculateHerdResults(room);
    }
  }, 35000);
}

function calculateHerdResults(room) {
  room.gameData.phase = 'results';
  
  const answers = room.gameData.answers;
  
  // Group answers (case-insensitive, trim whitespace)
  const groups = {};
  
  Object.entries(answers).forEach(([playerName, answer]) => {
    const normalizedAnswer = answer.toLowerCase().trim();
    
    if (!groups[normalizedAnswer]) {
      groups[normalizedAnswer] = {
        originalAnswer: answer,
        count: 0,
        players: []
      };
    }
    
    groups[normalizedAnswer].count++;
    groups[normalizedAnswer].players.push(playerName);
  });
  
  // Find majority (most common answer)
  let maxCount = 0;
  let majorityAnswers = [];
  
  Object.entries(groups).forEach(([normalized, group]) => {
    if (group.count > maxCount) {
      maxCount = group.count;
      majorityAnswers = [normalized];
    } else if (group.count === maxCount) {
      majorityAnswers.push(normalized);
    }
  });
  
  // Award points to majority (if not tied)
  let pinkCowPlayer = null;
  
  if (majorityAnswers.length === 1) {
    // Clear majority - award points
    const majorityGroup = groups[majorityAnswers[0]];
    majorityGroup.players.forEach(player => {
      room.gameData.scores[player]++;
    });
    
    majorityGroup.isMajority = true;
  }
  
  // Find pink cow (lone wolf with unique answer)
  Object.entries(groups).forEach(([normalized, group]) => {
    if (group.count === 1) {
      pinkCowPlayer = group.players[0];
      group.isPinkCow = true;
      room.gameData.pinkCowHolder = pinkCowPlayer;
    }
  });
  
  // Format groups for display (use original answers)
  const displayGroups = {};
  Object.entries(groups).forEach(([normalized, group]) => {
    displayGroups[group.originalAnswer] = {
      count: group.count,
      players: group.players,
      isMajority: group.isMajority || false,
      isPinkCow: group.isPinkCow || false
    };
  });
  
  console.log(`Results calculated for room ${room.code}`);
  
  // Send results
  io.to(room.code).emit('results-phase', {
    groups: displayGroups,
    pinkCowPlayer: pinkCowPlayer
  });
  
  // Show scoreboard after 10 seconds
  setTimeout(() => {
    showHerdScoreboard(room);
  }, 10000);
}

function showHerdScoreboard(room) {
  room.gameData.phase = 'scoreboard';
  
  // Check win condition
  let winner = null;
  
  Object.entries(room.gameData.scores).forEach(([player, score]) => {
    if (score >= room.gameData.winThreshold && room.gameData.pinkCowHolder !== player) {
      winner = player;
    }
  });
  
  if (winner) {
    endHerdGame(room, winner);
    return;
  }
  
  // Send scoreboard
  io.to(room.code).emit('scoreboard-phase', {
    scores: room.gameData.scores,
    pinkCowHolder: room.gameData.pinkCowHolder
  });
  
  // Start next round after 5 seconds
  setTimeout(() => {
    room.gameData.roundNumber++;
    room.gameData.currentQuestionIndex++;
    
    if (room.gameData.currentQuestionIndex >= room.gameData.questions.length) {
      // Ran out of questions - shuffle and restart
      room.gameData.currentQuestionIndex = 0;
      room.gameData.questions.sort(() => Math.random() - 0.5);
    }
    
    startHerdQuestion(room);
  }, 5000);
}

function endHerdGame(room, winner) {
  room.gameData.phase = 'game-over';
  
  console.log(`Herd Mentality game ended in room ${room.code}, winner: ${winner}`);
  
  io.to(room.code).emit('game-over', {
    winner: winner,
    finalScores: room.gameData.scores
  });
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

  // CREATE ROOM
  socket.on('create-room', (data) => {
    const roomCode = generateRoomCode();
    const { playerName, gameType } = data;
    
    const room = {
      code: roomCode,
      gameType: gameType || 'imposter',
      players: [],
      host: socket.id,
      gameState: 'waiting',
      gameData: null
    };
    
    const player = {
      id: socket.id,
      name: playerName,
      isHost: true,
      roomCode: roomCode
    };
    
    room.players.push(player);
    rooms.set(roomCode, room);
    players.set(socket.id, player);
    
    socket.join(roomCode);
    
    socket.emit('room-created', {
      roomCode: roomCode,
      gameType: room.gameType
    });
    
    console.log(`Room ${roomCode} created by ${playerName} for ${gameType}`);
  });

  // JOIN ROOM
  socket.on('join-room', (data) => {
    const { roomCode, playerName } = data;
    const room = rooms.get(roomCode);
    
    if (!room) {
      socket.emit('join-error', { message: 'Room not found' });
      return;
    }
    
    if (room.gameState !== 'waiting') {
      socket.emit('join-error', { message: 'Game already in progress' });
      return;
    }
    
    if (room.players.length >= 15) {
      socket.emit('join-error', { message: 'Room is full' });
      return;
    }
    
    const player = {
      id: socket.id,
      name: playerName,
      isHost: false,
      roomCode: roomCode
    };
    
    room.players.push(player);
    players.set(socket.id, player);
    
    socket.join(roomCode);
    
    socket.emit('room-joined', {
      roomCode: roomCode,
      gameType: room.gameType,
      room: {
        code: room.code,
        gameType: room.gameType,
        players: room.players,
        gameState: room.gameState
      }
    });
    
    io.to(roomCode).emit('player-joined', {
      player: player,
      room: {
        code: room.code,
        gameType: room.gameType,
        players: room.players,
        gameState: room.gameState
      }
    });
    
    console.log(`${playerName} joined room ${roomCode}`);
  });

  // REJOIN ROOM
  socket.on('rejoin-room', (data) => {
    const { roomCode, playerName } = data;
    const room = rooms.get(roomCode);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    let player = room.players.find(p => p.name === playerName);
    
    if (!player) {
      socket.emit('error', { message: 'Player not in room' });
      return;
    }
    
    const oldSocketId = player.id;
    player.id = socket.id;
    
    if (room.host === oldSocketId) {
      room.host = socket.id;
    }
    
    players.delete(oldSocketId);
    players.set(socket.id, player);
    
    socket.join(roomCode);
    
    socket.emit('room-state', {
      success: true,
      room: {
        code: room.code,
        gameType: room.gameType,
        players: room.players,
        gameState: room.gameState
      }
    });
    
    console.log(`${playerName} rejoined room ${roomCode}`);
  });

  // START GAME HANDLER
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
    } else if (room.gameType === 'herd-mentality') {
      initHerdMentalityGame(room, category || 'standard');
    }
    
    room.gameState = 'playing';
    
    io.to(roomCode).emit('game-started', {
      roomCode: roomCode,
      gameType: room.gameType
    });
    
    console.log(`Game started in room ${roomCode}`);
  });

  // HERD MENTALITY - SUBMIT ANSWER
  socket.on('submit-answer', (data) => {
    const { roomCode, answer } = data;
    const room = rooms.get(roomCode);
    const player = players.get(socket.id);
    
    if (!room || !player || room.gameType !== 'herd-mentality') {
      socket.emit('error', { message: 'Invalid request' });
      return;
    }
    
    if (room.gameData.phase !== 'question') {
      socket.emit('error', { message: 'Not in question phase' });
      return;
    }
    
    // Store answer
    room.gameData.answers[player.name] = answer;
    
    console.log(`${player.name} submitted answer: ${answer}`);
    
    // Confirm submission
    socket.emit('answer-submitted');
    
    // Check if all players have answered
    if (Object.keys(room.gameData.answers).length === room.players.length) {
      calculateHerdResults(room);
    }
  });

  // NIGHT ACTION HANDLER
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

  // SUBMIT VOTE HANDLER
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

  // KICK PLAYER
  socket.on('kick-player', (data) => {
    const { roomCode, playerId } = data;
    const room = rooms.get(roomCode);
    
    if (!room) return;
    
    const host = players.get(socket.id);
    if (!host || !host.isHost) return;
    
    room.players = room.players.filter(p => p.id !== playerId);
    players.delete(playerId);
    
    io.to(playerId).emit('kicked', { message: 'You were kicked from the room' });
    
    io.to(roomCode).emit('player-kicked', {
      playerId: playerId,
      room: {
        code: room.code,
        gameType: room.gameType,
        players: room.players,
        gameState: room.gameState
      }
    });
    
    const kickedSocket = io.sockets.sockets.get(playerId);
    if (kickedSocket) {
      kickedSocket.leave(roomCode);
    }
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    const player = players.get(socket.id);
    if (!player) return;
    
    const room = rooms.get(player.roomCode);
    if (!room) return;
    
    if (player.isHost) {
      io.to(player.roomCode).emit('host-left', {
        message: 'Host left the game'
      });
      
      rooms.delete(player.roomCode);
      room.players.forEach(p => players.delete(p.id));
    } else {
      room.players = room.players.filter(p => p.id !== socket.id);
      
      io.to(player.roomCode).emit('player-disconnected', {
        playerId: socket.id,
        room: {
          code: room.code,
          gameType: room.gameType,
          players: room.players,
          gameState: room.gameState
        }
      });
    }
    
    players.delete(socket.id);
  });

}); // ← END OF io.on('connection') - VERY IMPORTANT!

// Placeholder functions for other games (implement these as needed)
function initImposterGame(room, category) {
  console.log(`Imposter game initialized in room ${room.code}`);
  // Add your Imposter game logic here
}

function initSpyfallGame(room, category, twoSpies) {
  console.log(`Spyfall game initialized in room ${room.code}`);
  // Add your Spyfall game logic here
}

function calculateImposterResults(room) {
  console.log(`Calculating Imposter results for room ${room.code}`);
  // Add your Imposter results logic here
}

function calculateSpyfallResults(room) {
  console.log(`Calculating Spyfall results for room ${room.code}`);
  // Add your Spyfall results logic here
}

// ============================================
// START SERVER (after the connection block closes)
// ============================================

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
