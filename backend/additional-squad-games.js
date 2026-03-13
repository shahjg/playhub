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

function initMostLikelyToGame(room, premiumOptions = {}) {
  const maxRounds = premiumOptions.roundCount || 10;
  let questions;

  // Parse custom questions: one per line
  if (premiumOptions.customQuestions) {
    const custom = premiumOptions.customQuestions.split('\n')
      .map(line => line.trim()).filter(l => l.length > 0);
    if (custom.length > 0) questions = custom;
  }
  if (!questions) questions = [...MLT_QUESTIONS];

  room.gameData = {
    questions: questions.sort(() => Math.random() - 0.5),
    questionIndex: 0,
    currentRound: 0,
    totalRounds: Math.min(maxRounds, questions.length),
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

// ==================== POWER STRUGGLE (COUP CLONE + REFORMATION) ====================
// All state keyed by player NAME (not socket ID) to survive reconnects

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function psAllSameFaction(gd) {
  if (!gd.reformation) return true; // standard mode = no faction restrictions
  const alive = gd.turnOrder.filter(n => !gd.eliminated.includes(n));
  if (alive.length <= 1) return true;
  const factions = new Set(alive.map(n => gd.allegiances[n]));
  return factions.size <= 1;
}

function initPowerStruggleGame(room, options = {}) {
  const reformation = !!options.reformation;
  const useInquisitor = !!(options.useInquisitor && reformation);
  const playerCount = room.players.length;

  // Determine role set
  const roles = ['Duke', 'Assassin', 'Captain', 'Contessa'];
  roles.push(useInquisitor ? 'Inquisitor' : 'Ambassador');

  // Scale: reformation supports up to 10 (5 copies each), standard scales dynamically
  const copiesPerRole = reformation ? 5 : Math.ceil((playerCount * 2 + 3) / roles.length);

  const deck = [];
  roles.forEach(r => { for (let i = 0; i < copiesPerRole; i++) deck.push(r); });
  shuffleDeck(deck);

  // Allegiances (alternating Loyalist/Reformist)
  const allegiances = {};
  if (reformation) {
    room.players.forEach((p, i) => {
      allegiances[p.name] = i % 2 === 0 ? 'Loyalist' : 'Reformist';
    });
  }

  room.gameData = {
    deck,
    playerCards: {},
    coins: {},
    currentTurnIndex: 0,
    phase: 'action',
    pendingAction: null,
    logs: [],
    eliminated: [],
    turnOrder: room.players.map(p => p.name),
    reformation,
    useInquisitor,
    allegiances,
    treasury: 0,
    roles  // store which roles are in play
  };

  room.players.forEach(p => {
    room.gameData.playerCards[p.name] = [
      { card: deck.pop(), dead: false },
      { card: deck.pop(), dead: false }
    ];
    room.gameData.coins[p.name] = 2;
  });

  if (reformation) {
    const factionSummary = room.players.map(p => `${p.name}=${allegiances[p.name]}`).join(', ');
    addPSLog(room, 'Reformation mode — factions divide the boardroom.', null);
    addPSLog(room, `Factions: ${factionSummary}`, null);
    if (useInquisitor) addPSLog(room, 'Inquisitor replaces Ambassador.', null);
  } else {
    addPSLog(room, 'The power struggle begins. Trust no one.', null);
  }
  console.log(`[PS] Game init: ${playerCount} players, reformation=${reformation}, inquisitor=${useInquisitor}, ${deck.length} cards in deck`);
}

function sendPowerStruggleState(room, io) {
  const gd = room.gameData;
  const aliveTurnOrder = gd.turnOrder.filter(n => !gd.eliminated.includes(n));
  const currentName = aliveTurnOrder[gd.currentTurnIndex % aliveTurnOrder.length];
  const allSame = psAllSameFaction(gd);

  room.players.forEach(p => {
    const myCards = gd.playerCards[p.name] || [];
    const isMyTurn = p.name === currentName && !gd.eliminated.includes(p.name);

    const playersState = gd.turnOrder.map(name => ({
      name,
      coins: gd.coins[name] || 0,
      cardCount: (gd.playerCards[name] || []).filter(c => !c.dead).length,
      eliminated: gd.eliminated.includes(name),
      deadCards: (gd.playerCards[name] || []).filter(c => c.dead).map(c => c.card),
      faction: gd.allegiances[name] || null
    }));

    io.to(p.id).emit('ps-state', {
      myCards,
      myCoins: gd.coins[p.name] || 0,
      myFaction: gd.allegiances[p.name] || null,
      currentTurn: currentName,
      isMyTurn,
      players: playersState,
      phase: gd.phase,
      pendingAction: gd.pendingAction,
      logs: gd.logs.slice(-15),
      reformation: gd.reformation,
      useInquisitor: gd.useInquisitor,
      treasury: gd.treasury,
      allSameFaction: allSame
    });
  });
}

function handlePowerStruggleAction(room, socketId, action, target, io) {
  const gd = room.gameData;
  const player = room.players.find(p => p.id === socketId);
  if (!player) return;

  const name = player.name;
  const coins = gd.coins[name] || 0;
  const allSame = psAllSameFaction(gd);

  // Faction restriction check for targeted actions
  if (gd.reformation && !allSame && target) {
    const myFaction = gd.allegiances[name];
    const targetFaction = gd.allegiances[target];
    if (['coup', 'assassinate', 'steal'].includes(action) && myFaction === targetFaction) {
      io.to(socketId).emit('ps-error', { message: 'Cannot target your own faction' });
      return;
    }
  }

  let logMsg = '';

  switch (action) {
    case 'income':
      gd.coins[name] = coins + 1;
      logMsg = `${name} takes Income (+1 coin)`;
      addPSLog(room, logMsg, io);
      nextPowerStruggleTurn(room, io);
      break;

    case 'foreign-aid':
      logMsg = `${name} takes Foreign Aid (+2 coins)`;
      gd.pendingAction = { type: 'foreign-aid', player: name };
      gd.phase = 'response';
      addPSLog(room, logMsg, io);
      broadcastActionPending(room, socketId, io, {
        actor: name, action: 'Foreign Aid', target: null,
        canChallenge: false, canBlock: true, blockReason: 'Claim Duke to block'
      });
      gd.actionTimeout = setTimeout(() => {
        if (gd.pendingAction?.type === 'foreign-aid') {
          gd.coins[name] = (gd.coins[name] || 0) + 2;
          gd.pendingAction = null;
          gd.phase = 'action';
          addPSLog(room, `${name}'s Foreign Aid succeeds`, io);
          nextPowerStruggleTurn(room, io);
        }
      }, 10000);
      sendPowerStruggleState(room, io);
      break;

    case 'coup':
      if (coins < 7) { io.to(socketId).emit('ps-error', { message: 'Need 7 coins' }); return; }
      gd.coins[name] = coins - 7;
      logMsg = `${name} launches a Coup against ${target}!`;
      addPSLog(room, logMsg, io);
      forceInfluenceLoss(room, target, io);
      break;

    case 'tax':
      logMsg = `${name} claims Duke — collects Tax (+3 coins)`;
      gd.pendingAction = { type: 'tax', claimedRole: 'Duke', player: name };
      gd.phase = 'response';
      addPSLog(room, logMsg, io);
      broadcastActionPending(room, socketId, io, {
        actor: name, action: 'Tax', target: null,
        canChallenge: true, canBlock: false, claimedRole: 'Duke'
      });
      gd.actionTimeout = setTimeout(() => {
        if (gd.pendingAction?.type === 'tax') {
          gd.coins[name] = (gd.coins[name] || 0) + 3;
          gd.pendingAction = null;
          gd.phase = 'action';
          addPSLog(room, `${name} collects 3 coins (Tax)`, io);
          nextPowerStruggleTurn(room, io);
        }
      }, 10000);
      sendPowerStruggleState(room, io);
      break;

    case 'assassinate':
      if (coins < 3) { io.to(socketId).emit('ps-error', { message: 'Need 3 coins' }); return; }
      gd.coins[name] = coins - 3;
      logMsg = `${name} claims Assassin — targets ${target}`;
      gd.pendingAction = { type: 'assassinate', claimedRole: 'Assassin', player: name, target };
      gd.phase = 'response';
      addPSLog(room, logMsg, io);
      broadcastActionPending(room, socketId, io, {
        actor: name, action: 'Assassinate', target,
        canChallenge: true, canBlock: false, claimedRole: 'Assassin',
        targetCanBlock: true, blockReason: 'Claim Contessa to block'
      });
      gd.actionTimeout = setTimeout(() => {
        if (gd.pendingAction?.type === 'assassinate') {
          forceInfluenceLoss(room, target, io);
        }
      }, 10000);
      sendPowerStruggleState(room, io);
      break;

    case 'steal':
      logMsg = `${name} claims Captain — steals from ${target}`;
      gd.pendingAction = { type: 'steal', claimedRole: 'Captain', player: name, target };
      gd.phase = 'response';
      addPSLog(room, logMsg, io);
      broadcastActionPending(room, socketId, io, {
        actor: name, action: 'Steal', target,
        canChallenge: true, canBlock: false, claimedRole: 'Captain',
        targetCanBlock: true, blockReason: gd.useInquisitor ? 'Claim Captain or Inquisitor to block' : 'Claim Captain or Ambassador to block'
      });
      gd.actionTimeout = setTimeout(() => {
        if (gd.pendingAction?.type === 'steal') {
          const stolen = Math.min(2, gd.coins[target] || 0);
          gd.coins[target] = (gd.coins[target] || 0) - stolen;
          gd.coins[name] = (gd.coins[name] || 0) + stolen;
          gd.pendingAction = null;
          gd.phase = 'action';
          addPSLog(room, `${name} steals ${stolen} coins from ${target}`, io);
          nextPowerStruggleTurn(room, io);
        }
      }, 10000);
      sendPowerStruggleState(room, io);
      break;

    case 'exchange':
      logMsg = `${name} claims ${gd.useInquisitor ? 'Inquisitor' : 'Ambassador'} — exchanges cards`;
      gd.pendingAction = { type: 'exchange', claimedRole: gd.useInquisitor ? 'Inquisitor' : 'Ambassador', player: name };
      gd.phase = 'response';
      addPSLog(room, logMsg, io);
      broadcastActionPending(room, socketId, io, {
        actor: name, action: 'Exchange', target: null,
        canChallenge: true, canBlock: false, claimedRole: gd.useInquisitor ? 'Inquisitor' : 'Ambassador'
      });
      gd.actionTimeout = setTimeout(() => {
        if (gd.pendingAction?.type === 'exchange') {
          resolveExchange(room, name);
          gd.pendingAction = null;
          gd.phase = 'action';
          addPSLog(room, `${name} exchanges cards`, io);
          nextPowerStruggleTurn(room, io);
        }
      }, 10000);
      sendPowerStruggleState(room, io);
      break;

    // ===== REFORMATION ACTIONS =====

    case 'change-allegiance':
      if (!gd.reformation) { io.to(socketId).emit('ps-error', { message: 'Not in Reformation mode' }); return; }
      if (coins < 1) { io.to(socketId).emit('ps-error', { message: 'Need 1 coin' }); return; }
      gd.coins[name] = coins - 1;
      gd.treasury += 1;
      gd.allegiances[name] = gd.allegiances[name] === 'Loyalist' ? 'Reformist' : 'Loyalist';
      logMsg = `${name} changes allegiance to ${gd.allegiances[name]} (1 coin → Treasury)`;
      addPSLog(room, logMsg, io);
      nextPowerStruggleTurn(room, io);
      break;

    case 'convert':
      if (!gd.reformation) { io.to(socketId).emit('ps-error', { message: 'Not in Reformation mode' }); return; }
      if (coins < 2) { io.to(socketId).emit('ps-error', { message: 'Need 2 coins' }); return; }
      if (!target) { io.to(socketId).emit('ps-error', { message: 'Must select a target' }); return; }
      gd.coins[name] = coins - 2;
      gd.treasury += 2;
      gd.allegiances[target] = gd.allegiances[target] === 'Loyalist' ? 'Reformist' : 'Loyalist';
      logMsg = `${name} converts ${target} to ${gd.allegiances[target]} (2 coins → Treasury)`;
      addPSLog(room, logMsg, io);
      nextPowerStruggleTurn(room, io);
      break;

    case 'embezzle':
      if (!gd.reformation) { io.to(socketId).emit('ps-error', { message: 'Not in Reformation mode' }); return; }
      if (gd.treasury <= 0) { io.to(socketId).emit('ps-error', { message: 'Treasury is empty' }); return; }
      logMsg = `${name} claims Duke — embezzles the Treasury (${gd.treasury} coins)`;
      gd.pendingAction = { type: 'embezzle', claimedRole: 'Duke', player: name, treasuryAmount: gd.treasury };
      gd.phase = 'response';
      addPSLog(room, logMsg, io);
      broadcastActionPending(room, socketId, io, {
        actor: name, action: 'Embezzle', target: null,
        canChallenge: true, canBlock: false, claimedRole: 'Duke'
      });
      gd.actionTimeout = setTimeout(() => {
        if (gd.pendingAction?.type === 'embezzle') {
          const amount = gd.treasury;
          gd.coins[name] = (gd.coins[name] || 0) + amount;
          gd.treasury = 0;
          gd.pendingAction = null;
          gd.phase = 'action';
          addPSLog(room, `${name} embezzles ${amount} coins from the Treasury`, io);
          nextPowerStruggleTurn(room, io);
        }
      }, 10000);
      sendPowerStruggleState(room, io);
      break;

    case 'inquisitor-examine':
      if (!gd.useInquisitor) { io.to(socketId).emit('ps-error', { message: 'Inquisitor not in play' }); return; }
      if (!target) { io.to(socketId).emit('ps-error', { message: 'Must select a target' }); return; }
      // Faction check: can only examine different faction (unless all same)
      if (gd.reformation && !allSame && gd.allegiances[name] === gd.allegiances[target]) {
        io.to(socketId).emit('ps-error', { message: 'Can only examine players from a different faction' });
        return;
      }
      logMsg = `${name} claims Inquisitor — examines ${target}`;
      gd.pendingAction = { type: 'inquisitor-examine', claimedRole: 'Inquisitor', player: name, target };
      gd.phase = 'response';
      addPSLog(room, logMsg, io);
      broadcastActionPending(room, socketId, io, {
        actor: name, action: 'Examine', target,
        canChallenge: true, canBlock: false, claimedRole: 'Inquisitor'
      });
      gd.actionTimeout = setTimeout(() => {
        if (gd.pendingAction?.type === 'inquisitor-examine') {
          resolveInquisitorExamine(room, name, target, io);
        }
      }, 10000);
      sendPowerStruggleState(room, io);
      break;

    default:
      break;
  }
}

function resolveExchange(room, playerName) {
  const gd = room.gameData;
  const myCards = gd.playerCards[playerName];
  const aliveIdxs = myCards.map((c, i) => c.dead ? -1 : i).filter(i => i >= 0);
  if (gd.deck.length >= 2) {
    const drawn = [gd.deck.pop(), gd.deck.pop()];
    const pool = aliveIdxs.map(i => myCards[i].card).concat(drawn);
    shuffleDeck(pool);
    aliveIdxs.forEach((idx, k) => { myCards[idx].card = pool[k]; });
    for (let k = aliveIdxs.length; k < pool.length; k++) gd.deck.push(pool[k]);
    shuffleDeck(gd.deck);
  }
}

function resolveInquisitorExamine(room, examinerName, targetName, io) {
  const gd = room.gameData;
  const targetCards = gd.playerCards[targetName] || [];
  const aliveCards = targetCards.map((c, i) => ({ card: c.card, index: i })).filter((c, i) => !targetCards[i]?.dead);

  if (aliveCards.length === 0) {
    gd.pendingAction = null;
    gd.phase = 'action';
    nextPowerStruggleTurn(room, io);
    return;
  }

  // Pick a random alive card to reveal to examiner
  const chosen = aliveCards[Math.floor(Math.random() * aliveCards.length)];
  gd.pendingAction = null;
  gd.phase = 'inquisitor-decide';
  gd.inquisitorExamine = { examiner: examinerName, target: targetName, cardIndex: chosen.index, card: chosen.card };

  // Send the card info only to the examiner
  const examinerPlayer = room.players.find(p => p.name === examinerName);
  if (examinerPlayer) {
    io.to(examinerPlayer.id).emit('ps-inquisitor-reveal', {
      target: targetName,
      card: chosen.card,
      cardIndex: chosen.index
    });
  }
  sendPowerStruggleState(room, io);
}

function handleInquisitorDecide(room, socketId, decision, io) {
  const gd = room.gameData;
  const player = room.players.find(p => p.id === socketId);
  if (!player || !gd.inquisitorExamine || gd.inquisitorExamine.examiner !== player.name) return;

  const { target, cardIndex } = gd.inquisitorExamine;

  if (decision === 'swap') {
    // Force target to swap that card for a random one from the deck
    const targetCards = gd.playerCards[target];
    if (targetCards && targetCards[cardIndex] && !targetCards[cardIndex].dead && gd.deck.length > 0) {
      gd.deck.push(targetCards[cardIndex].card);
      shuffleDeck(gd.deck);
      targetCards[cardIndex].card = gd.deck.pop();
      addPSLog(room, `${player.name} forces ${target} to swap a card`, io);
    }
  } else {
    addPSLog(room, `${player.name} lets ${target} keep their card`, io);
  }

  gd.inquisitorExamine = null;
  gd.phase = 'action';
  nextPowerStruggleTurn(room, io);
}

function broadcastActionPending(room, actorSocketId, io, data) {
  const gd = room.gameData;
  const allSame = psAllSameFaction(gd);
  const actorFaction = gd.allegiances[data.actor];

  room.players.forEach(p => {
    if (p.id !== actorSocketId && !gd.eliminated.includes(p.name)) {
      const playerData = { ...data };

      // Faction-based block restriction for Foreign Aid
      if (data.action === 'Foreign Aid' && gd.reformation && !allSame) {
        const pFaction = gd.allegiances[p.name];
        if (pFaction === actorFaction) {
          playerData.canBlock = false; // Can't block same faction's foreign aid
        }
      }

      // Only target can block assassination/steal
      if (data.targetCanBlock) {
        playerData.canBlock = (p.name === data.target);
      }

      io.to(p.id).emit('ps-action-pending', playerData);
    }
  });
}

function handlePowerStruggleRespond(room, socketId, response, io) {
  const gd = room.gameData;
  const player = room.players.find(p => p.id === socketId);
  if (!player || !gd.pendingAction) return;

  if (gd.actionTimeout) {
    clearTimeout(gd.actionTimeout);
    gd.actionTimeout = null;
  }

  if (response === 'challenge') {
    addPSLog(room, `${player.name} challenges!`, io);
    resolvePowerStruggleChallenge(room, player.name, io);
  } else if (response === 'block') {
    addPSLog(room, `${player.name} blocks the action!`, io);
    gd.pendingAction = null;
    gd.phase = 'action';
    nextPowerStruggleTurn(room, io);
  } else if (response === 'allow') {
    // Let timeout handle resolution
  }
}

function resolvePowerStruggleChallenge(room, challengerName, io) {
  const gd = room.gameData;
  const action = gd.pendingAction;
  if (!action) return;

  const claimedCard = action.claimedRole || getClaimedCard(action.type);
  const claimantCards = gd.playerCards[action.player] || [];
  const hasCard = claimantCards.some(c => !c.dead && c.card === claimedCard);

  if (hasCard) {
    addPSLog(room, `Challenge failed! ${action.player} revealed ${claimedCard}`, io);
    forceInfluenceLoss(room, challengerName, io);
    // Swap revealed card back into deck
    const cardIdx = claimantCards.findIndex(c => !c.dead && c.card === claimedCard);
    if (cardIdx >= 0 && gd.deck.length > 0) {
      gd.deck.push(claimantCards[cardIdx].card);
      shuffleDeck(gd.deck);
      claimantCards[cardIdx].card = gd.deck.pop();
    }
  } else {
    addPSLog(room, `Challenge succeeded! ${action.player} didn't have ${claimedCard}`, io);
    forceInfluenceLoss(room, action.player, io);
  }

  gd.pendingAction = null;
  gd.phase = 'action';
}

function getClaimedCard(actionType) {
  const mapping = {
    'tax': 'Duke', 'duke': 'Duke',
    'assassinate': 'Assassin', 'assassin': 'Assassin',
    'steal': 'Captain', 'captain': 'Captain',
    'exchange': 'Ambassador', 'ambassador': 'Ambassador',
    'embezzle': 'Duke',
    'inquisitor-examine': 'Inquisitor', 'inquisitor-exchange': 'Inquisitor',
    'contessa': 'Contessa'
  };
  return mapping[actionType] || 'Duke';
}

function forceInfluenceLoss(room, targetName, io) {
  const gd = room.gameData;
  const targetPlayer = room.players.find(p => p.name === targetName);
  if (!targetPlayer) return;

  const cards = gd.playerCards[targetName] || [];
  const aliveCards = cards.filter(c => !c.dead);

  if (aliveCards.length <= 1) {
    const idx = cards.findIndex(c => !c.dead);
    if (idx >= 0) handlePowerStruggleLoseInfluenceByName(room, targetName, idx, io);
    return;
  }

  gd.phase = 'lose-influence';
  io.to(targetPlayer.id).emit('ps-choose-influence', {
    reason: 'You must discard an influence card'
  });
  sendPowerStruggleState(room, io);
}

function handlePowerStruggleLoseInfluence(room, socketId, cardIndex, io) {
  const player = room.players.find(p => p.id === socketId);
  if (!player) return;
  handlePowerStruggleLoseInfluenceByName(room, player.name, cardIndex, io);
}

function handlePowerStruggleLoseInfluenceByName(room, playerName, cardIndex, io) {
  const gd = room.gameData;
  const cards = gd.playerCards[playerName];
  if (!cards || !cards[cardIndex] || cards[cardIndex].dead) return;

  cards[cardIndex].dead = true;
  addPSLog(room, `${playerName} loses ${cards[cardIndex].card}`, io);

  const aliveCards = cards.filter(c => !c.dead);
  if (aliveCards.length === 0) {
    gd.eliminated.push(playerName);
    addPSLog(room, `${playerName} has been eliminated!`, io);
  }

  const alivePlayers = gd.turnOrder.filter(n => !gd.eliminated.includes(n));
  if (alivePlayers.length <= 1) {
    endPowerStruggleGame(room, io);
    return;
  }

  // Check if elimination caused all-same-faction
  if (gd.reformation && psAllSameFaction(gd)) {
    addPSLog(room, 'All survivors share one faction — allegiances no longer matter!', io);
  }

  gd.phase = 'action';
  nextPowerStruggleTurn(room, io);
}

function addPSLog(room, message, io) {
  room.gameData.logs.push(message);
  if (io) io.to(room.code).emit('ps-log', { message, logs: room.gameData.logs.slice(-15) });
}

function nextPowerStruggleTurn(room, io) {
  const gd = room.gameData;
  const alivePlayers = gd.turnOrder.filter(n => !gd.eliminated.includes(n));

  if (alivePlayers.length <= 1) {
    endPowerStruggleGame(room, io);
    return;
  }

  gd.currentTurnIndex = (gd.currentTurnIndex + 1) % alivePlayers.length;
  gd.phase = 'action';
  gd.pendingAction = null;

  const currentName = alivePlayers[gd.currentTurnIndex];
  if ((gd.coins[currentName] || 0) >= 10) {
    addPSLog(room, `${currentName} has 10+ coins — must Coup!`, io);
  }

  sendPowerStruggleState(room, io);
}

function endPowerStruggleGame(room, io) {
  const gd = room.gameData;
  room.gameState = 'ended';

  const alivePlayers = gd.turnOrder.filter(n => !gd.eliminated.includes(n));
  const winner = alivePlayers[0] || 'No one';

  addPSLog(room, `${winner} seizes total control!`, io);

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

  socket.on('ps-inquisitor-decide', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room?.gameData) return;
    handleInquisitorDecide(room, socket.id, data.decision, io);
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
