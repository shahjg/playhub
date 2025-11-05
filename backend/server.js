// ============================================
// ADD TO SERVER.JS - WEREWOLF GAME LOGIC
// ============================================
// Add this code to your existing server.js file

// ADD THIS FUNCTION after the initSpyfallGame function:

// Initialize Werewolf game
function initWerewolfGame(room) {
  const playerCount = room.players.length;
  
  // Determine role distribution based on player count
  let werewolfCount = Math.floor(playerCount / 3); // ~33% werewolves
  if (werewolfCount < 1) werewolfCount = 1;
  if (werewolfCount > 3) werewolfCount = 3;
  
  const hasSeer = playerCount >= 4;
  const hasDoctor = playerCount >= 6;
  
  console.log(`Werewolf game setup: ${playerCount} players, ${werewolfCount} werewolves, Seer: ${hasSeer}, Doctor: ${hasDoctor}`);
  
  // Shuffle players
  const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);
  
  // Assign roles
  const werewolves = [];
  let seer = null;
  let doctor = null;
  
  let roleIndex = 0;
  
  // Assign werewolves
  for (let i = 0; i < werewolfCount; i++) {
    werewolves.push(shuffledPlayers[roleIndex]);
    roleIndex++;
  }
  
  // Assign seer if enough players
  if (hasSeer && roleIndex < shuffledPlayers.length) {
    seer = shuffledPlayers[roleIndex];
    roleIndex++;
  }
  
  // Assign doctor if enough players
  if (hasDoctor && roleIndex < shuffledPlayers.length) {
    doctor = shuffledPlayers[roleIndex];
    roleIndex++;
  }
  
  // Everyone else is a villager
  
  // Store game data
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
  
  // Store role assignments by player name
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
  
  // Send role assignments to all players
  room.players.forEach(player => {
    const roleData = room.gameData.roleAssignments[player.name];
    io.to(player.id).emit('role-assigned', roleData);
  });
  
  // Send werewolf team info to werewolves
  const werewolfTeam = werewolves.map(w => ({ id: w.id, name: w.name }));
  werewolves.forEach(wolf => {
    io.to(wolf.id).emit('werewolf-team', {
      werewolves: werewolfTeam
    });
  });
  
  console.log(`Werewolf game initialized in room ${room.code}`);
  console.log(`Werewolves: ${room.gameData.werewolfNames.join(', ')}`);
  if (seer) console.log(`Seer: ${room.gameData.seerName}`);
  if (doctor) console.log(`Doctor: ${room.gameData.doctorName}`);
  
  // Start first night phase after 5 seconds
  setTimeout(() => {
    startNightPhase(room);
  }, 5000);
}

// Start night phase
function startNightPhase(room) {
  room.gameData.phase = 'night';
  room.gameData.nightActions = {};
  
  console.log(`Night ${room.gameData.currentRound} started in room ${room.code}`);
  
  // Werewolf phase
  startWerewolfPhase(room);
}

// Werewolf phase
function startWerewolfPhase(room) {
  io.to(room.code).emit('night-phase-start', {
    activeRole: 'werewolf',
    alivePlayers: room.gameData.alivePlayers,
    timeLimit: 45
  });
  
  // Auto-proceed after 50 seconds if no action
  setTimeout(() => {
    if (room.gameData.phase === 'night' && !room.gameData.nightActions.werewolfTarget) {
      // Random target if werewolves didn't choose
      const nonWolves = room.gameData.alivePlayers.filter(p => !p.isWerewolf);
      if (nonWolves.length > 0) {
        const randomTarget = nonWolves[Math.floor(Math.random() * nonWolves.length)];
        room.gameData.nightActions.werewolfTarget = randomTarget.id;
        console.log(`Werewolves didn't choose, random target: ${randomTarget.name}`);
      }
      proceedToSeerPhase(room);
    }
  }, 50000);
}

// Proceed to seer phase
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

// Proceed to doctor phase
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

// Process night actions and start day
function processNightActions(room) {
  const targetId = room.gameData.nightActions.werewolfTarget;
  const savedId = room.gameData.nightActions.doctorSave;
  
  let killedPlayer = null;
  let savedByDoctor = false;
  
  if (targetId) {
    if (savedId === targetId) {
      // Doctor saved the target!
      savedByDoctor = true;
      console.log(`Doctor saved the target in room ${room.code}`);
    } else {
      // Kill the target
      killedPlayer = room.gameData.alivePlayers.find(p => p.id === targetId);
      if (killedPlayer) {
        room.gameData.alivePlayers = room.gameData.alivePlayers.filter(p => p.id !== targetId);
        room.gameData.deadPlayers.push(killedPlayer);
        console.log(`${killedPlayer.name} was killed in room ${room.code}`);
      }
    }
  }
  
  // Check win conditions
  if (checkWinConditions(room)) {
    return;
  }
  
  // Start day phase
  startDayPhase(room, killedPlayer, savedByDoctor);
}

// Start day phase
function startDayPhase(room, killedPlayer, savedByDoctor) {
  room.gameData.phase = 'day';
  
  console.log(`Day ${room.gameData.currentRound} started in room ${room.code}`);
  
  io.to(room.code).emit('day-phase-start', {
    alivePlayers: room.gameData.alivePlayers,
    killedPlayer: killedPlayer,
    savedByDoctor: savedByDoctor,
    timeLimit: 90
  });
  
  // Start voting after day discussion
  setTimeout(() => {
    startVotingPhase(room);
  }, 95000);
}

// Start voting phase
function startVotingPhase(room) {
  room.gameData.phase = 'voting';
  room.gameData.votes = {};
  
  console.log(`Voting started in room ${room.code}`);
  
  io.to(room.code).emit('voting-phase-start', {
    alivePlayers: room.gameData.alivePlayers,
    timeLimit: 45
  });
}

// Process voting results
function processVotingResults(room) {
  const voteCounts = {};
  
  // Count votes
  Object.values(room.gameData.votes).forEach(votedId => {
    voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
  });
  
  // Find player with most votes
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
      
      // Get the role
      const playerObj = room.players.find(p => p.id === eliminatedId);
      if (playerObj) {
        eliminatedPlayer.role = room.gameData.roleAssignments[playerObj.name].role;
      }
      
      console.log(`${eliminatedPlayer.name} was eliminated by vote in room ${room.code}`);
    }
  }
  
  // Check win conditions
  if (checkWinConditions(room, eliminatedPlayer)) {
    return;
  }
  
  // Start next round
  room.gameData.currentRound++;
  setTimeout(() => {
    startNightPhase(room);
  }, 5000);
}

// Check win conditions
function checkWinConditions(room, eliminatedPlayer = null) {
  const aliveWerewolves = room.gameData.alivePlayers.filter(p => p.isWerewolf).length;
  const aliveVillagers = room.gameData.alivePlayers.filter(p => !p.isWerewolf).length;
  
  console.log(`Win check: ${aliveWerewolves} wolves, ${aliveVillagers} villagers`);
  
  let gameOver = false;
  let villagersWin = false;
  let werewolvesWin = false;
  
  if (aliveWerewolves === 0) {
    // Villagers win
    gameOver = true;
    villagersWin = true;
  } else if (aliveWerewolves >= aliveVillagers) {
    // Werewolves win
    gameOver = true;
    werewolvesWin = true;
  }
  
  if (gameOver) {
    room.gameData.phase = 'results';
    
    // Prepare all roles for display
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
    
    console.log(`Game over in room ${room.code}. Villagers win: ${villagersWin}, Werewolves win: ${werewolvesWin}`);
    return true;
  }
  
  return false;
}

// ============================================
// ADD THESE SOCKET EVENT HANDLERS
// Add these inside the io.on('connection', (socket) => { ... }) block
// ============================================

// NIGHT ACTION - Add after the 'submit-vote' handler
socket.on('night-action', (data) => {
  const { roomCode, actionType, targetId } = data;
  const room = rooms.get(roomCode);
  const player = players.get(socket.id);
  
  if (!room || !player) {
    socket.emit('error', { message: 'Invalid room or player' });
    return;
  }
  
  console.log(`Night action in room ${roomCode}: ${actionType} by ${player.playerName} targeting ${targetId}`);
  
  if (actionType === 'werewolf-target') {
    // Werewolf voting - use majority
    if (!room.gameData.werewolfVotes) {
      room.gameData.werewolfVotes = {};
    }
    room.gameData.werewolfVotes[socket.id] = targetId;
    
    // Check if all werewolves voted
    const aliveWerewolves = room.gameData.alivePlayers.filter(p => p.isWerewolf);
    const werewolfVotes = Object.keys(room.gameData.werewolfVotes).length;
    
    if (werewolfVotes >= aliveWerewolves.length) {
      // Calculate majority target
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
      
      // Proceed to next phase
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
      
      // Proceed to next phase
      setTimeout(() => {
        proceedToDoctorPhase(room);
      }, 3000);
    }
    
    socket.emit('night-action-confirmed', {});
    
  } else if (actionType === 'doctor-save') {
    room.gameData.nightActions.doctorSave = targetId;
    
    socket.emit('night-action-confirmed', {});
    
    // Proceed to process night actions
    setTimeout(() => {
      processNightActions(room);
    }, 2000);
  }
});

// ============================================
// UPDATE THE START-GAME HANDLER
// Replace the existing start-game handler with this updated version:
// ============================================

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
  
  // Notify all players to start
  io.to(roomCode).emit('game-started', {
    roomCode: roomCode,
    gameType: room.gameType
  });
  
  console.log(`Game started in room ${roomCode}, type: ${room.gameType}`);
});

// ============================================
// UPDATE THE SUBMIT-VOTE HANDLER
// Replace the existing submit-vote handler with this updated version:
// ============================================

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
  
  const totalVotes = Object.keys(room.gameData.votes).length;
  
  // For werewolf, count alive players only
  let totalPlayers;
  if (room.gameType === 'werewolf') {
    totalPlayers = room.gameData.alivePlayers.length;
  } else {
    totalPlayers = room.players.length;
  }
  
  const majority = Math.ceil(totalPlayers / 2);
  
  // Notify all players about vote count
  io.to(roomCode).emit('vote-counted', {
    totalVotes: totalVotes,
    totalPlayers: totalPlayers
  });
  
  console.log(`Vote in room ${roomCode}: ${totalVotes}/${totalPlayers}`);
  
  // Check if we have majority or all votes
  const voteCounts = {};
  Object.values(room.gameData.votes).forEach(votedId => {
    voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
  });
  
  const maxVotes = Math.max(...Object.values(voteCounts));
  const hasConsensus = maxVotes >= majority;
  
  // End voting if majority reached or all voted
  if (hasConsensus || totalVotes === totalPlayers) {
    console.log(`Ending voting in room ${roomCode}`);
    
    if (room.gameType === 'imposter') {
      calculateImposterResults(room);
    } else if (room.gameType === 'spyfall') {
      calculateSpyfallResults(room);
    } else if (room.gameType === 'werewolf') {
      processVotingResults(room);
    }
  }
});

// ============================================
// NOTES FOR IMPLEMENTATION:
// ============================================
// 1. Add the initWerewolfGame function after initSpyfallGame
// 2. Add all the helper functions (startNightPhase, startWerewolfPhase, etc.)
// 3. Add the 'night-action' socket handler in the connection block
// 4. Update the 'start-game' handler to include werewolf
// 5. Update the 'submit-vote' handler to handle werewolf voting
// 6. Make sure to add these to your existing server.js - don't replace the whole file!
