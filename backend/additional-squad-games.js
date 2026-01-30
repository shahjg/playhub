// ==========================================
// ADDITIONAL SQUAD GAMES BACKEND
// Head2Head, Most Likely To, Fake Artist, 
// Broken Pictionary, Power Struggle
// ==========================================

// ==================== WORD BANKS ====================

const HEAD2HEAD_WORDS = {
  easy: ['Dog', 'Cat', 'Pizza', 'Phone', 'Beach', 'Music', 'Dance', 'Movie', 'Game', 'Book', 'Tree', 'House', 'Car', 'Bird', 'Fish', 'Cake', 'Rain', 'Snow', 'Star', 'Moon'],
  medium: ['Guitar', 'Soccer', 'Elephant', 'Volcano', 'Rainbow', 'Pirate', 'Zombie', 'Ninja', 'Robot', 'Unicorn', 'Dragon', 'Castle', 'Wizard', 'Princess', 'Cowboy', 'Astronaut', 'Penguin', 'Dolphin', 'Jungle', 'Desert'],
  hard: ['Photosynthesis', 'Constitution', 'Philosophy', 'Psychology', 'Architecture', 'Archaeology', 'Cryptocurrency', 'Superstition', 'Metamorphosis', 'Renaissance']
};

const MLT_QUESTIONS = [
  "Who is most likely to become famous?",
  "Who is most likely to win the lottery and lose the ticket?",
  "Who is most likely to survive a zombie apocalypse?",
  "Who is most likely to become a millionaire?",
  "Who is most likely to cry during a movie?",
  "Who is most likely to be late to their own wedding?",
  "Who is most likely to go viral on social media?",
  "Who is most likely to become president?",
  "Who is most likely to forget their own birthday?",
  "Who is most likely to win an eating contest?",
  "Who is most likely to talk their way out of a speeding ticket?",
  "Who is most likely to adopt 10 pets?",
  "Who is most likely to become a superhero?",
  "Who is most likely to accidentally set something on fire?",
  "Who is most likely to write a best-selling book?",
  "Who is most likely to sleep through an earthquake?",
  "Who is most likely to get lost in their own city?",
  "Who is most likely to marry a celebrity?",
  "Who is most likely to win an argument?",
  "Who is most likely to binge watch an entire series in one day?"
];

const FAKE_ARTIST_WORDS = {
  easy: ['Sun', 'House', 'Tree', 'Car', 'Dog', 'Cat', 'Fish', 'Bird', 'Apple', 'Flower', 'Star', 'Moon', 'Cloud', 'Rain', 'Hat'],
  medium: ['Robot', 'Pizza', 'Guitar', 'Castle', 'Dragon', 'Pirate', 'Rocket', 'Penguin', 'Elephant', 'Butterfly', 'Snowman', 'Rainbow', 'Volcano', 'Mermaid', 'Unicorn'],
  hard: ['Gravity', 'Freedom', 'Music', 'Time', 'Dream', 'Love', 'Happiness', 'Wisdom', 'Patience', 'Courage']
};

const BP_WORDS = ['Elephant', 'Dancing', 'Birthday cake', 'Superhero', 'Rainbow', 'Robot', 'Spaghetti', 'Volcano', 'Spaceship', 'Penguin', 'Wizard', 'Treehouse', 'Waterfall', 'Dinosaur', 'Pirate ship', 'Snowman', 'Campfire', 'Roller coaster', 'Astronaut', 'Mermaid'];

const COUP_INFLUENCES = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa'];

// ==================== HEAD2HEAD ====================

function initHead2HeadGame(room) {
  const allWords = [...HEAD2HEAD_WORDS.easy, ...HEAD2HEAD_WORDS.medium];
  room.gameData = {
    words: allWords.sort(() => Math.random() - 0.5),
    wordIndex: 0,
    currentRound: 0,
    totalRounds: room.players.length,
    currentGuesserIndex: 0,
    scores: {},
    roundWords: [],
    phase: 'waiting',
    roundTimer: null
  };
  room.players.forEach(p => room.gameData.scores[p.name] = 0);
}

function startHead2HeadRound(room, io) {
  const gd = room.gameData;
  gd.currentRound++;
  
  if (gd.currentRound > gd.totalRounds) {
    endHead2HeadGame(room, io);
    return;
  }
  
  const guesser = room.players[gd.currentGuesserIndex];
  gd.roundWords = [];
  gd.phase = 'playing';
  
  // Get words for this round (10 words)
  const roundWordList = [];
  for (let i = 0; i < 10; i++) {
    if (gd.wordIndex < gd.words.length) {
      roundWordList.push(gd.words[gd.wordIndex++]);
    }
  }
  
  io.to(room.code).emit('head2head-round-start', {
    round: gd.currentRound,
    totalRounds: gd.totalRounds,
    guesser: guesser.name,
    words: roundWordList
  });
  
  // Send first word
  if (roundWordList.length > 0) {
    io.to(room.code).emit('head2head-word-update', {
      word: roundWordList[0],
      index: 0
    });
  }
  
  // Round timer (60 seconds)
  gd.roundTimer = setTimeout(() => {
    endHead2HeadRound(room, io);
  }, 60000);
}

function handleHead2HeadAction(room, action, io) {
  const gd = room.gameData;
  if (gd.phase !== 'playing') return;
  
  const currentWordIndex = gd.roundWords.length;
  const words = gd.words.slice(gd.wordIndex - 10, gd.wordIndex);
  const currentWord = words[currentWordIndex];
  
  if (!currentWord) return;
  
  const result = action === 'correct' ? 'correct' : 'pass';
  gd.roundWords.push({ word: currentWord, result });
  
  // Update score
  if (result === 'correct') {
    const guesser = room.players[gd.currentGuesserIndex];
    gd.scores[guesser.name] = (gd.scores[guesser.name] || 0) + 1;
  }
  
  const nextIndex = currentWordIndex + 1;
  const nextWord = words[nextIndex];
  
  io.to(room.code).emit('head2head-word-result', {
    word: currentWord,
    result,
    nextWord: nextWord || null,
    nextIndex
  });
  
  // If no more words, end round
  if (!nextWord || nextIndex >= 10) {
    setTimeout(() => endHead2HeadRound(room, io), 1000);
  }
}

function endHead2HeadRound(room, io) {
  const gd = room.gameData;
  if (gd.roundTimer) {
    clearTimeout(gd.roundTimer);
    gd.roundTimer = null;
  }
  
  gd.phase = 'results';
  
  io.to(room.code).emit('head2head-round-end', {
    round: gd.currentRound,
    guesser: room.players[gd.currentGuesserIndex].name,
    words: gd.roundWords,
    scores: gd.scores
  });
  
  gd.currentGuesserIndex = (gd.currentGuesserIndex + 1) % room.players.length;
}

function endHead2HeadGame(room, io) {
  room.gameState = 'ended';
  const sorted = Object.entries(room.gameData.scores).sort((a, b) => b[1] - a[1]);
  
  io.to(room.code).emit('head2head-game-over', {
    scores: room.gameData.scores,
    winner: sorted[0]?.[0],
    rankings: sorted.map(([name, score], i) => ({ name, score, rank: i + 1 }))
  });
}

// ==================== MOST LIKELY TO ====================

function initMostLikelyToGame(room) {
  room.gameData = {
    questions: [...MLT_QUESTIONS].sort(() => Math.random() - 0.5),
    questionIndex: 0,
    currentRound: 0,
    totalRounds: Math.min(10, MLT_QUESTIONS.length),
    votes: {},
    scores: {},
    phase: 'waiting',
    voteTimer: null
  };
  room.players.forEach(p => room.gameData.scores[p.name] = 0);
}

function startMostLikelyToRound(room, io) {
  const gd = room.gameData;
  gd.currentRound++;
  
  if (gd.currentRound > gd.totalRounds || gd.questionIndex >= gd.questions.length) {
    endMostLikelyToGame(room, io);
    return;
  }
  
  gd.votes = {};
  gd.phase = 'voting';
  const question = gd.questions[gd.questionIndex++];
  
  io.to(room.code).emit('mlt-question', {
    question,
    round: gd.currentRound,
    totalRounds: gd.totalRounds
  });
  
  // Auto-end voting after 20 seconds
  gd.voteTimer = setTimeout(() => {
    calculateMostLikelyToResults(room, io);
  }, 20000);
}

function handleMostLikelyToVote(room, playerName, votedFor, io) {
  const gd = room.gameData;
  if (gd.phase !== 'voting') return;
  
  gd.votes[playerName] = votedFor;
  
  io.to(room.code).emit('mlt-vote-update', {
    count: Object.keys(gd.votes).length
  });
  
  // Check if everyone voted
  if (Object.keys(gd.votes).length >= room.players.length) {
    if (gd.voteTimer) {
      clearTimeout(gd.voteTimer);
      gd.voteTimer = null;
    }
    calculateMostLikelyToResults(room, io);
  }
}

function calculateMostLikelyToResults(room, io) {
  const gd = room.gameData;
  if (gd.voteTimer) {
    clearTimeout(gd.voteTimer);
    gd.voteTimer = null;
  }
  
  gd.phase = 'results';
  
  // Count votes
  const voteCounts = {};
  Object.values(gd.votes).forEach(name => {
    voteCounts[name] = (voteCounts[name] || 0) + 1;
  });
  
  // Award points - each vote = 10 points
  Object.entries(voteCounts).forEach(([name, count]) => {
    gd.scores[name] = (gd.scores[name] || 0) + (count * 10);
  });
  
  io.to(room.code).emit('mlt-results', {
    votes: gd.votes,
    voteCounts,
    scores: gd.scores
  });
}

function endMostLikelyToGame(room, io) {
  room.gameState = 'ended';
  const sorted = Object.entries(room.gameData.scores).sort((a, b) => b[1] - a[1]);
  
  io.to(room.code).emit('mlt-game-over', {
    scores: room.gameData.scores,
    winner: sorted[0]?.[0]
  });
}

// ==================== FAKE ARTIST ====================

function initFakeArtistGame(room) {
  const words = [...FAKE_ARTIST_WORDS.easy, ...FAKE_ARTIST_WORDS.medium].sort(() => Math.random() - 0.5);
  room.gameData = {
    words,
    wordIndex: 0,
    currentRound: 0,
    totalRounds: 3,
    currentWord: null,
    fakerIndex: -1,
    faker: null,
    turnOrder: [],
    currentTurnIndex: 0,
    drawingsPerRound: 2,
    currentDrawingRound: 0,
    votes: {},
    scores: {},
    phase: 'waiting'
  };
  room.players.forEach(p => room.gameData.scores[p.name] = 0);
}

function startFakeArtistRound(room, io) {
  const gd = room.gameData;
  gd.currentRound++;
  
  if (gd.currentRound > gd.totalRounds) {
    endFakeArtistGame(room, io);
    return;
  }
  
  // Select faker randomly
  gd.fakerIndex = Math.floor(Math.random() * room.players.length);
  gd.faker = room.players[gd.fakerIndex].name;
  gd.currentWord = gd.words[gd.wordIndex++];
  gd.turnOrder = room.players.map(p => p.name).sort(() => Math.random() - 0.5);
  gd.currentTurnIndex = 0;
  gd.currentDrawingRound = 0;
  gd.votes = {};
  gd.phase = 'drawing';
  
  // Send round info to each player
  room.players.forEach(p => {
    const isFaker = p.name === gd.faker;
    io.to(p.id).emit('fakeartist-round', {
      round: gd.currentRound,
      totalRounds: gd.totalRounds,
      isFaker,
      word: isFaker ? null : gd.currentWord,
      turnOrder: gd.turnOrder
    });
  });
  
  // Start first turn
  io.to(room.code).emit('fakeartist-turn', {
    turnIndex: 0,
    currentPlayer: gd.turnOrder[0]
  });
}

function handleFakeArtistDraw(room, socketId, drawData, io) {
  // Broadcast drawing to all players
  io.to(room.code).emit('fakeartist-draw', drawData);
}

function handleFakeArtistDone(room, socketId, io) {
  const gd = room.gameData;
  if (gd.phase !== 'drawing') return;
  
  gd.currentTurnIndex++;
  
  // Check if all players have drawn this round
  if (gd.currentTurnIndex >= gd.turnOrder.length) {
    gd.currentDrawingRound++;
    gd.currentTurnIndex = 0;
    
    // Check if all drawing rounds complete
    if (gd.currentDrawingRound >= gd.drawingsPerRound) {
      startFakeArtistVoting(room, io);
      return;
    }
  }
  
  // Next player's turn
  io.to(room.code).emit('fakeartist-turn', {
    turnIndex: gd.currentTurnIndex,
    currentPlayer: gd.turnOrder[gd.currentTurnIndex]
  });
}

function startFakeArtistVoting(room, io) {
  const gd = room.gameData;
  gd.phase = 'voting';
  gd.votes = {};
  
  io.to(room.code).emit('fakeartist-vote-phase', {
    players: room.players.map(p => p.name)
  });
}

function handleFakeArtistVote(room, playerName, votedFor, io) {
  const gd = room.gameData;
  if (gd.phase !== 'voting') return;
  
  gd.votes[playerName] = votedFor;
  
  // Check if everyone voted
  if (Object.keys(gd.votes).length >= room.players.length) {
    calculateFakeArtistResults(room, io);
  }
}

function calculateFakeArtistResults(room, io) {
  const gd = room.gameData;
  gd.phase = 'results';
  
  // Count votes
  const voteCounts = {};
  Object.values(gd.votes).forEach(name => {
    voteCounts[name] = (voteCounts[name] || 0) + 1;
  });
  
  // Check if faker was caught (majority voted for them)
  const fakerVotes = voteCounts[gd.faker] || 0;
  const fakerCaught = fakerVotes > room.players.length / 2;
  
  // Award points
  if (fakerCaught) {
    // Artists win - each artist gets 10 points
    room.players.forEach(p => {
      if (p.name !== gd.faker) {
        gd.scores[p.name] = (gd.scores[p.name] || 0) + 10;
      }
    });
  } else {
    // Faker wins - faker gets 20 points
    gd.scores[gd.faker] = (gd.scores[gd.faker] || 0) + 20;
  }
  
  io.to(room.code).emit('fakeartist-results', {
    faker: gd.faker,
    word: gd.currentWord,
    fakerCaught,
    votes: gd.votes,
    voteCounts,
    scores: gd.scores
  });
}

function endFakeArtistGame(room, io) {
  room.gameState = 'ended';
  const sorted = Object.entries(room.gameData.scores).sort((a, b) => b[1] - a[1]);
  
  io.to(room.code).emit('fakeartist-game-over', {
    scores: room.gameData.scores,
    winner: sorted[0]?.[0]
  });
}

// ==================== BROKEN PICTIONARY ====================

function initBrokenPictionaryGame(room) {
  room.gameData = {
    words: [...BP_WORDS].sort(() => Math.random() - 0.5),
    chains: {}, // playerName -> [{ type: 'text'|'drawing', content, player }]
    prompts: {}, // playerName -> initial prompt
    currentStep: 0,
    totalSteps: room.players.length,
    phase: 'writing',
    submittedCount: 0,
    chainIndex: 0, // For viewing chains at end
    rotations: [] // Track chain rotation order
  };
  
  // Initialize chains and rotation
  room.players.forEach((p, i) => {
    room.gameData.chains[p.name] = [];
    room.gameData.rotations.push(p.name);
  });
}

function startBrokenPictionaryWritePhase(room, io) {
  const gd = room.gameData;
  gd.phase = 'writing';
  gd.submittedCount = 0;
  gd.currentStep = 1;
  
  io.to(room.code).emit('bp-write', {
    timeLimit: 45
  });
}

function handleBPSubmitPrompt(room, playerName, prompt, io) {
  const gd = room.gameData;
  if (gd.phase !== 'writing') return;
  
  gd.prompts[playerName] = prompt;
  gd.chains[playerName].push({ type: 'text', content: prompt, player: playerName });
  gd.submittedCount++;
  
  io.to(room.code).emit('bp-waiting', {
    message: `Waiting for others... (${gd.submittedCount}/${room.players.length})`
  });
  
  if (gd.submittedCount >= room.players.length) {
    startBrokenPictionaryDrawPhase(room, io);
  }
}

function startBrokenPictionaryDrawPhase(room, io) {
  const gd = room.gameData;
  gd.phase = 'drawing';
  gd.currentStep++;
  gd.submittedCount = 0;
  
  // Rotate chains - each player draws the previous player's prompt
  room.players.forEach((p, i) => {
    const prevIndex = (i - 1 + room.players.length) % room.players.length;
    const prevPlayer = room.players[prevIndex].name;
    const chain = gd.chains[prevPlayer];
    const lastItem = chain[chain.length - 1];
    
    io.to(p.id).emit('bp-draw', {
      prompt: lastItem.content,
      step: gd.currentStep,
      totalSteps: gd.totalSteps,
      timeLimit: 60
    });
  });
}

function handleBPSubmitDrawing(room, socketId, playerName, drawing, io) {
  const gd = room.gameData;
  if (gd.phase !== 'drawing') return;
  
  // Find which chain this player is working on
  const playerIndex = room.players.findIndex(p => p.name === playerName);
  const prevIndex = (playerIndex - (gd.currentStep - 1) + room.players.length) % room.players.length;
  const chainOwner = room.players[prevIndex].name;
  
  gd.chains[chainOwner].push({ type: 'drawing', content: drawing, player: playerName });
  gd.submittedCount++;
  
  io.to(socketId).emit('bp-waiting', {
    message: `Waiting for others... (${gd.submittedCount}/${room.players.length})`
  });
  
  if (gd.submittedCount >= room.players.length) {
    // Check if we need more steps
    if (gd.currentStep < gd.totalSteps) {
      startBrokenPictionaryGuessPhase(room, io);
    } else {
      startBrokenPictionaryResults(room, io);
    }
  }
}

function startBrokenPictionaryGuessPhase(room, io) {
  const gd = room.gameData;
  gd.phase = 'guessing';
  gd.currentStep++;
  gd.submittedCount = 0;
  
  // Rotate chains - each player guesses based on the drawing
  room.players.forEach((p, i) => {
    const offset = gd.currentStep - 1;
    const prevIndex = (i - offset + room.players.length) % room.players.length;
    const chainOwner = room.players[prevIndex].name;
    const chain = gd.chains[chainOwner];
    const lastItem = chain[chain.length - 1];
    
    io.to(p.id).emit('bp-guess', {
      drawing: lastItem.content,
      step: gd.currentStep,
      totalSteps: gd.totalSteps,
      timeLimit: 30
    });
  });
}

function handleBPSubmitGuess(room, socketId, playerName, guess, io) {
  const gd = room.gameData;
  if (gd.phase !== 'guessing') return;
  
  // Find which chain this player is working on
  const playerIndex = room.players.findIndex(p => p.name === playerName);
  const offset = gd.currentStep - 1;
  const prevIndex = (playerIndex - offset + room.players.length) % room.players.length;
  const chainOwner = room.players[prevIndex].name;
  
  gd.chains[chainOwner].push({ type: 'text', content: guess, player: playerName });
  gd.submittedCount++;
  
  io.to(socketId).emit('bp-waiting', {
    message: `Waiting for others... (${gd.submittedCount}/${room.players.length})`
  });
  
  if (gd.submittedCount >= room.players.length) {
    // Check if we need more steps
    if (gd.currentStep < gd.totalSteps) {
      startBrokenPictionaryDrawPhase(room, io);
    } else {
      startBrokenPictionaryResults(room, io);
    }
  }
}

function startBrokenPictionaryResults(room, io) {
  const gd = room.gameData;
  gd.phase = 'results';
  gd.chainIndex = 0;
  
  // Show first chain
  showBrokenPictionaryChain(room, io);
}

function showBrokenPictionaryChain(room, io) {
  const gd = room.gameData;
  const chainOwners = Object.keys(gd.chains);
  
  if (gd.chainIndex >= chainOwners.length) {
    // All chains shown, end game
    io.to(room.code).emit('bp-game-over', { chains: gd.chains });
    room.gameState = 'ended';
    return;
  }
  
  const owner = chainOwners[gd.chainIndex];
  const chain = gd.chains[owner];
  
  io.to(room.code).emit('bp-chain', {
    owner,
    items: chain,
    chainIndex: gd.chainIndex + 1,
    totalChains: chainOwners.length
  });
}

function handleBPNextChain(room, io) {
  const gd = room.gameData;
  gd.chainIndex++;
  showBrokenPictionaryChain(room, io);
}

// ==================== POWER STRUGGLE (COUP CLONE) ====================

function initPowerStruggleGame(room) {
  // Calculate how many copies of each card we need
  // Each player needs 2 cards, plus some in reserve
  const playerCount = room.players.length;
  const cardsNeeded = playerCount * 2 + 3; // Extra cards for exchange action
  const copiesPerInfluence = Math.ceil(cardsNeeded / COUP_INFLUENCES.length);
  
  // Create deck with enough copies of each influence
  const deck = [];
  COUP_INFLUENCES.forEach(inf => {
    for (let i = 0; i < copiesPerInfluence; i++) {
      deck.push(inf);
    }
  });
  
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  room.gameData = {
    deck,
    playerCards: {},
    coins: {},
    currentTurnIndex: 0,
    phase: 'action', // action, challenge, block, lose-influence
    pendingAction: null,
    logs: [],
    eliminated: []
  };
  
  // Deal 2 cards to each player, give 2 coins
  room.players.forEach(p => {
    room.gameData.playerCards[p.id] = [
      { card: deck.pop(), dead: false },
      { card: deck.pop(), dead: false }
    ];
    room.gameData.coins[p.id] = 2;
  });
  
  console.log(`Power Struggle: ${playerCount} players, ${copiesPerInfluence} copies per influence, ${deck.length} cards remaining`);
}

function sendPowerStruggleState(room, io) {
  const gd = room.gameData;
  const currentPlayer = room.players.filter(p => !gd.eliminated.includes(p.id))[gd.currentTurnIndex % (room.players.length - gd.eliminated.length)];
  
  room.players.forEach(p => {
    if (gd.eliminated.includes(p.id)) return;
    
    const isMyTurn = currentPlayer && currentPlayer.id === p.id;
    const myCards = gd.playerCards[p.id] || [];
    
    // Build visible state
    const playersState = room.players.map(pl => ({
      name: pl.name,
      id: pl.id,
      coins: gd.coins[pl.id] || 0,
      cardCount: (gd.playerCards[pl.id] || []).filter(c => !c.dead).length,
      eliminated: gd.eliminated.includes(pl.id),
      // Show dead cards to everyone
      deadCards: (gd.playerCards[pl.id] || []).filter(c => c.dead).map(c => c.card)
    }));
    
    io.to(p.id).emit('ps-state', {
      myCards: myCards,
      coins: gd.coins,
      currentPlayer: currentPlayer?.name,
      isMyTurn,
      players: playersState,
      phase: gd.phase,
      pendingAction: gd.pendingAction
    });
  });
}

function handlePowerStruggleAction(room, socketId, action, target, io) {
  const gd = room.gameData;
  const player = room.players.find(p => p.id === socketId);
  if (!player) return;
  
  const playerCoins = gd.coins[socketId] || 0;
  
  // Log the action
  let logMessage = `${player.name}`;
  
  switch (action) {
    case 'income':
      gd.coins[socketId] = playerCoins + 1;
      logMessage += ' takes Income (+1 coin)';
      addPSLog(room, logMessage, io);
      nextPowerStruggleTurn(room, io);
      break;
      
    case 'foreign-aid':
      logMessage += ' takes Foreign Aid (+2 coins)';
      gd.pendingAction = { type: 'foreign-aid', player: player.name, playerId: socketId };
      gd.phase = 'block';
      addPSLog(room, logMessage, io);
      // Notify other players they can block
      room.players.forEach(p => {
        if (p.id !== socketId && !gd.eliminated.includes(p.id)) {
          io.to(p.id).emit('ps-action-pending', {
            actor: player.name,
            action: 'Foreign Aid',
            target: null,
            canChallenge: false,
            canBlock: true
          });
        }
      });
      sendPowerStruggleState(room, io);
      // Allow blocking for 8 seconds
      gd.actionTimeout = setTimeout(() => {
        if (gd.pendingAction?.type === 'foreign-aid') {
          gd.coins[socketId] = playerCoins + 2;
          gd.pendingAction = null;
          gd.phase = 'action';
          addPSLog(room, `${player.name}'s Foreign Aid succeeds`, io);
          nextPowerStruggleTurn(room, io);
        }
      }, 8000);
      break;
      
    case 'coup':
      if (playerCoins < 7) {
        io.to(socketId).emit('error', { message: 'Need 7 coins to Coup' });
        return;
      }
      gd.coins[socketId] = playerCoins - 7;
      logMessage += ` Coups ${target}`;
      addPSLog(room, logMessage, io);
      // Target must lose an influence
      forceInfluenceLoss(room, target, io);
      break;
      
    case 'duke': // Tax
      logMessage += ' claims Duke and takes Tax (+3 coins)';
      gd.pendingAction = { type: 'duke', player: player.name, playerId: socketId };
      gd.phase = 'challenge';
      addPSLog(room, logMessage, io);
      // Notify other players they can challenge
      room.players.forEach(p => {
        if (p.id !== socketId && !gd.eliminated.includes(p.id)) {
          io.to(p.id).emit('ps-action-pending', {
            actor: player.name,
            action: 'Tax (Duke)',
            target: null,
            canChallenge: true,
            canBlock: false
          });
        }
      });
      sendPowerStruggleState(room, io);
      // Allow challenge for 8 seconds
      gd.actionTimeout = setTimeout(() => {
        if (gd.pendingAction?.type === 'duke') {
          gd.coins[socketId] = playerCoins + 3;
          gd.pendingAction = null;
          gd.phase = 'action';
          nextPowerStruggleTurn(room, io);
        }
      }, 8000);
      break;
      
    case 'assassin':
      if (playerCoins < 3) {
        io.to(socketId).emit('error', { message: 'Need 3 coins to Assassinate' });
        return;
      }
      gd.coins[socketId] = playerCoins - 3;
      logMessage += ` claims Assassin and targets ${target}`;
      gd.pendingAction = { type: 'assassin', player: player.name, playerId: socketId, target };
      gd.phase = 'challenge';
      addPSLog(room, logMessage, io);
      // Notify other players they can challenge or block (target can block with Contessa)
      room.players.forEach(p => {
        if (p.id !== socketId && !gd.eliminated.includes(p.id)) {
          io.to(p.id).emit('ps-action-pending', {
            actor: player.name,
            action: 'Assassinate',
            target: target,
            canChallenge: true,
            canBlock: p.name === target // Only target can block with Contessa
          });
        }
      });
      sendPowerStruggleState(room, io);
      // Allow challenge/block for 8 seconds
      gd.actionTimeout = setTimeout(() => {
        if (gd.pendingAction?.type === 'assassin') {
          forceInfluenceLoss(room, target, io);
        }
      }, 8000);
      break;
      
    case 'captain': // Steal
      logMessage += ` claims Captain and steals from ${target}`;
      gd.pendingAction = { type: 'captain', player: player.name, playerId: socketId, target };
      gd.phase = 'challenge';
      addPSLog(room, logMessage, io);
      // Notify other players they can challenge or block (target can block with Captain/Ambassador)
      room.players.forEach(p => {
        if (p.id !== socketId && !gd.eliminated.includes(p.id)) {
          io.to(p.id).emit('ps-action-pending', {
            actor: player.name,
            action: 'Steal',
            target: target,
            canChallenge: true,
            canBlock: p.name === target // Only target can block
          });
        }
      });
      sendPowerStruggleState(room, io);
      // Allow challenge/block for 8 seconds
      gd.actionTimeout = setTimeout(() => {
        if (gd.pendingAction?.type === 'captain') {
          const targetPlayer = room.players.find(p => p.name === target);
          if (targetPlayer) {
            const stolen = Math.min(2, gd.coins[targetPlayer.id] || 0);
            gd.coins[targetPlayer.id] -= stolen;
            gd.coins[socketId] += stolen;
          }
          gd.pendingAction = null;
          gd.phase = 'action';
          nextPowerStruggleTurn(room, io);
        }
      }, 8000);
      break;
      
    default:
      nextPowerStruggleTurn(room, io);
  }
}

function handlePowerStruggleRespond(room, socketId, response, io) {
  const gd = room.gameData;
  const player = room.players.find(p => p.id === socketId);
  if (!player || !gd.pendingAction) return;
  
  // Clear the action timeout
  if (gd.actionTimeout) {
    clearTimeout(gd.actionTimeout);
    gd.actionTimeout = null;
  }
  
  if (response === 'challenge') {
    // Challenge the claim
    addPSLog(room, `${player.name} challenges!`, io);
    resolvePowerStruggleChallenge(room, socketId, io);
  } else if (response === 'block') {
    // Block the action
    addPSLog(room, `${player.name} blocks!`, io);
    gd.pendingAction = null;
    gd.phase = 'action';
    nextPowerStruggleTurn(room, io);
  } else if (response === 'allow') {
    // Allow - do nothing, let timeout handle it
    // Or if everyone has allowed, proceed immediately
  }
}

function resolvePowerStruggleChallenge(room, challengerId, io) {
  const gd = room.gameData;
  const action = gd.pendingAction;
  if (!action) return;
  
  const claimedCard = getClaimedCard(action.type);
  const claimantCards = gd.playerCards[action.playerId] || [];
  const hasCard = claimantCards.some(c => !c.dead && c.card === claimedCard);
  
  if (hasCard) {
    // Challenge fails - challenger loses influence
    addPSLog(room, `Challenge failed! ${action.player} had ${claimedCard}`, io);
    const challenger = room.players.find(p => p.id === challengerId);
    forceInfluenceLoss(room, challenger.name, io);
  } else {
    // Challenge succeeds - claimant loses influence
    addPSLog(room, `Challenge succeeded! ${action.player} didn't have ${claimedCard}`, io);
    forceInfluenceLoss(room, action.player, io);
  }
  
  gd.pendingAction = null;
  gd.phase = 'action';
}

function getClaimedCard(actionType) {
  const mapping = {
    'duke': 'Duke',
    'assassin': 'Assassin',
    'captain': 'Captain',
    'ambassador': 'Ambassador',
    'contessa': 'Contessa'
  };
  return mapping[actionType] || 'Duke';
}

function forceInfluenceLoss(room, targetName, io) {
  const gd = room.gameData;
  const targetPlayer = room.players.find(p => p.name === targetName);
  if (!targetPlayer) return;
  
  gd.phase = 'lose-influence';
  
  io.to(targetPlayer.id).emit('ps-choose-influence', {
    reason: 'You must lose an influence'
  });
}

function handlePowerStruggleLoseInfluence(room, socketId, cardIndex, io) {
  const gd = room.gameData;
  const cards = gd.playerCards[socketId];
  
  if (!cards || !cards[cardIndex] || cards[cardIndex].dead) return;
  
  cards[cardIndex].dead = true;
  
  const player = room.players.find(p => p.id === socketId);
  addPSLog(room, `${player.name} loses ${cards[cardIndex].card}`, io);
  
  // Check if player is eliminated
  const aliveCards = cards.filter(c => !c.dead);
  if (aliveCards.length === 0) {
    gd.eliminated.push(socketId);
    addPSLog(room, `${player.name} is eliminated!`, io);
  }
  
  // Check if game over
  const alivePlayers = room.players.filter(p => !gd.eliminated.includes(p.id));
  if (alivePlayers.length <= 1) {
    endPowerStruggleGame(room, io);
    return;
  }
  
  gd.phase = 'action';
  nextPowerStruggleTurn(room, io);
}

function addPSLog(room, message, io) {
  room.gameData.logs.push(message);
  io.to(room.code).emit('ps-log', { message, logs: room.gameData.logs.slice(-10) });
}

function nextPowerStruggleTurn(room, io) {
  const gd = room.gameData;
  const alivePlayers = room.players.filter(p => !gd.eliminated.includes(p.id));
  
  if (alivePlayers.length <= 1) {
    endPowerStruggleGame(room, io);
    return;
  }
  
  gd.currentTurnIndex = (gd.currentTurnIndex + 1) % alivePlayers.length;
  gd.phase = 'action';
  gd.pendingAction = null;
  
  // Check if current player must coup (10+ coins)
  const currentPlayer = alivePlayers[gd.currentTurnIndex];
  if (gd.coins[currentPlayer.id] >= 10) {
    addPSLog(room, `${currentPlayer.name} has 10+ coins and must Coup`, io);
  }
  
  sendPowerStruggleState(room, io);
}

function endPowerStruggleGame(room, io) {
  const gd = room.gameData;
  room.gameState = 'ended';
  
  const alivePlayers = room.players.filter(p => !gd.eliminated.includes(p.id));
  const winner = alivePlayers[0]?.name || 'No one';
  
  io.to(room.code).emit('ps-game-over', {
    winner,
    logs: gd.logs
  });
}

// ==================== SOCKET HANDLERS ====================

function registerAdditionalSquadGameHandlers(io, socket, rooms, players) {
  
  // HEAD2HEAD
  socket.on('head2head-start-round', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room?.gameData) return;
    startHead2HeadRound(room, io);
  });
  
  socket.on('head2head-word-action', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room?.gameData) return;
    handleHead2HeadAction(room, data.action, io);
  });
  
  // MOST LIKELY TO
  socket.on('mlt-start', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    initMostLikelyToGame(room);
    startMostLikelyToRound(room, io);
  });
  
  socket.on('mlt-vote', (data) => {
    const room = rooms.get(data.roomCode);
    const player = players.get(socket.id);
    if (!room?.gameData || !player) return;
    handleMostLikelyToVote(room, player.playerName, data.votedFor, io);
  });
  
  socket.on('mlt-next', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room?.gameData) return;
    startMostLikelyToRound(room, io);
  });
  
  // FAKE ARTIST
  socket.on('fakeartist-start', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    initFakeArtistGame(room);
    startFakeArtistRound(room, io);
  });
  
  socket.on('fakeartist-draw', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room?.gameData) return;
    handleFakeArtistDraw(room, socket.id, data, io);
  });
  
  socket.on('fakeartist-done', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room?.gameData) return;
    handleFakeArtistDone(room, socket.id, io);
  });
  
  socket.on('fakeartist-vote', (data) => {
    const room = rooms.get(data.roomCode);
    const player = players.get(socket.id);
    if (!room?.gameData || !player) return;
    handleFakeArtistVote(room, player.playerName, data.votedFor, io);
  });
  
  socket.on('fakeartist-next', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room?.gameData) return;
    startFakeArtistRound(room, io);
  });
  
  // BROKEN PICTIONARY
  socket.on('bp-start', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    initBrokenPictionaryGame(room);
    startBrokenPictionaryWritePhase(room, io);
  });
  
  socket.on('bp-submit-prompt', (data) => {
    const room = rooms.get(data.roomCode);
    const player = players.get(socket.id);
    if (!room?.gameData || !player) return;
    handleBPSubmitPrompt(room, player.playerName, data.prompt, io);
  });
  
  socket.on('bp-submit-drawing', (data) => {
    const room = rooms.get(data.roomCode);
    const player = players.get(socket.id);
    if (!room?.gameData || !player) return;
    handleBPSubmitDrawing(room, socket.id, player.playerName, data.drawing, io);
  });
  
  socket.on('bp-submit-guess', (data) => {
    const room = rooms.get(data.roomCode);
    const player = players.get(socket.id);
    if (!room?.gameData || !player) return;
    handleBPSubmitGuess(room, socket.id, player.playerName, data.guess, io);
  });
  
  socket.on('bp-next-chain', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room?.gameData) return;
    handleBPNextChain(room, io);
  });
  
  // POWER STRUGGLE
  socket.on('ps-start', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    initPowerStruggleGame(room);
    sendPowerStruggleState(room, io);
  });
  
  socket.on('ps-action', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room?.gameData) return;
    handlePowerStruggleAction(room, socket.id, data.action, data.target, io);
  });
  
  socket.on('ps-respond', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room?.gameData) return;
    handlePowerStruggleRespond(room, socket.id, data.response, io);
  });
  
  socket.on('ps-lose-influence', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room?.gameData) return;
    handlePowerStruggleLoseInfluence(room, socket.id, data.cardIndex, io);
  });
}

// ==================== EXPORTS ====================

module.exports = {
  // Head2Head
  initHead2HeadGame,
  startHead2HeadRound,
  handleHead2HeadAction,
  
  // Most Likely To
  initMostLikelyToGame,
  startMostLikelyToRound,
  handleMostLikelyToVote,
  
  // Fake Artist
  initFakeArtistGame,
  startFakeArtistRound,
  handleFakeArtistDraw,
  handleFakeArtistVote,
  
  // Broken Pictionary
  initBrokenPictionaryGame,
  startBrokenPictionaryWritePhase,
  handleBPSubmitPrompt,
  handleBPSubmitDrawing,
  handleBPSubmitGuess,
  handleBPNextChain,
  
  // Power Struggle
  initPowerStruggleGame,
  sendPowerStruggleState,
  handlePowerStruggleAction,
  handlePowerStruggleLoseInfluence,
  
  // Socket handler registration
  registerAdditionalSquadGameHandlers
};
