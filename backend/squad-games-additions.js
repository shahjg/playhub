// ============================================
// SQUAD GAMES ADDITIONS - Missing Game Handlers
// Add these to server.js
// ============================================

// ============================================
// POWER STRUGGLE (COUP) - Bluffing Card Game
// ============================================

const COUP_ROLES = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa'];

const COUP_ACTIONS = {
    income: { cost: 0, blockable: false, challengeable: false, description: 'Take 1 coin' },
    foreignAid: { cost: 0, blockable: true, blockedBy: ['Duke'], challengeable: false, description: 'Take 2 coins' },
    coup: { cost: 7, blockable: false, challengeable: false, description: 'Pay 7 coins to eliminate a player' },
    tax: { cost: 0, blockable: false, challengeable: true, requires: 'Duke', description: 'Take 3 coins (Duke)' },
    assassinate: { cost: 3, blockable: true, blockedBy: ['Contessa'], challengeable: true, requires: 'Assassin', description: 'Pay 3 coins to assassinate (Assassin)' },
    steal: { cost: 0, blockable: true, blockedBy: ['Captain', 'Ambassador'], challengeable: true, requires: 'Captain', description: 'Steal 2 coins from another player (Captain)' },
    exchange: { cost: 0, blockable: false, challengeable: true, requires: 'Ambassador', description: 'Exchange cards with deck (Ambassador)' }
};

function initCoupGame(room) {
    const playerCount = room.players.length;
    
    // Create deck (3 of each role)
    let deck = [];
    COUP_ROLES.forEach(role => {
        deck.push(role, role, role);
    });
    deck = deck.sort(() => Math.random() - 0.5);
    
    // Deal 2 cards to each player
    const playerHands = {};
    const playerCoins = {};
    const playerInfluence = {}; // Cards face up (eliminated)
    
    room.players.forEach(player => {
        playerHands[player.name] = [deck.pop(), deck.pop()];
        playerCoins[player.name] = 2;
        playerInfluence[player.name] = []; // Face up cards
    });
    
    room.gameData = {
        deck: deck,
        hands: playerHands,
        coins: playerCoins,
        influence: playerInfluence, // Revealed/lost cards
        currentPlayerIndex: 0,
        phase: 'action', // action, response, challenge, exchange
        pendingAction: null,
        pendingTarget: null,
        pendingChallenge: null,
        pendingBlock: null,
        exchangeCards: [],
        eliminatedPlayers: [],
        turnTimeout: null,
        responseTimeout: null,
        roleAssignments: {}
    };
    
    // Store role assignments
    room.players.forEach(player => {
        room.gameData.roleAssignments[player.name] = {
            cards: playerHands[player.name],
            coins: 2
        };
    });
    
    console.log(`Coup game initialized in room ${room.code}`);
}

function getCoupPlayerState(room, playerName) {
    const gd = room.gameData;
    return {
        cards: gd.hands[playerName] || [],
        coins: gd.coins[playerName] || 0,
        lostInfluence: gd.influence[playerName] || [],
        isEliminated: gd.eliminatedPlayers.includes(playerName)
    };
}

function getCoupPublicState(room) {
    const gd = room.gameData;
    const publicPlayers = room.players.map(p => ({
        name: p.name,
        coins: gd.coins[p.name] || 0,
        influenceCount: (gd.hands[p.name] || []).length,
        lostInfluence: gd.influence[p.name] || [],
        isEliminated: gd.eliminatedPlayers.includes(p.name),
        isPremium: p.isPremium || false,
        cosmetics: p.cosmetics || {}
    }));
    
    return {
        players: publicPlayers,
        currentPlayer: room.players[gd.currentPlayerIndex]?.name,
        phase: gd.phase,
        deckSize: gd.deck.length
    };
}

function checkCoupElimination(room, playerName, io) {
    const gd = room.gameData;
    if (gd.hands[playerName].length === 0 && !gd.eliminatedPlayers.includes(playerName)) {
        gd.eliminatedPlayers.push(playerName);
        io.to(room.code).emit('coup-player-eliminated', {
            playerName: playerName,
            remainingPlayers: room.players.filter(p => !gd.eliminatedPlayers.includes(p.name)).length
        });
        
        // Check win condition
        const alivePlayers = room.players.filter(p => !gd.eliminatedPlayers.includes(p.name));
        if (alivePlayers.length === 1) {
            endCoupGame(room, alivePlayers[0].name, io);
            return true;
        }
    }
    return false;
}

function advanceCoupTurn(room, io) {
    const gd = room.gameData;
    
    // Find next alive player
    let nextIndex = (gd.currentPlayerIndex + 1) % room.players.length;
    let attempts = 0;
    while (gd.eliminatedPlayers.includes(room.players[nextIndex].name) && attempts < room.players.length) {
        nextIndex = (nextIndex + 1) % room.players.length;
        attempts++;
    }
    
    gd.currentPlayerIndex = nextIndex;
    gd.phase = 'action';
    gd.pendingAction = null;
    gd.pendingTarget = null;
    gd.pendingChallenge = null;
    gd.pendingBlock = null;
    
    const currentPlayer = room.players[gd.currentPlayerIndex];
    
    // Must coup if 10+ coins
    const mustCoup = gd.coins[currentPlayer.name] >= 10;
    
    io.to(room.code).emit('coup-turn-start', {
        currentPlayer: currentPlayer.name,
        mustCoup: mustCoup,
        publicState: getCoupPublicState(room)
    });
    
    // Send private hand to current player
    const playerSocket = room.players.find(p => p.name === currentPlayer.name);
    if (playerSocket) {
        io.to(playerSocket.id).emit('coup-your-turn', {
            yourCards: gd.hands[currentPlayer.name],
            yourCoins: gd.coins[currentPlayer.name],
            mustCoup: mustCoup,
            availableActions: getAvailableCoupActions(room, currentPlayer.name)
        });
    }
}

function getAvailableCoupActions(room, playerName) {
    const gd = room.gameData;
    const coins = gd.coins[playerName];
    const actions = [];
    
    // Always available
    actions.push({ action: 'income', description: 'Income: Take 1 coin' });
    actions.push({ action: 'foreignAid', description: 'Foreign Aid: Take 2 coins' });
    
    // Must coup at 10+
    if (coins >= 10) {
        return [{ action: 'coup', description: 'Coup: Must coup (10+ coins)', required: true }];
    }
    
    // Optional coup at 7+
    if (coins >= 7) {
        actions.push({ action: 'coup', description: 'Coup: Pay 7 coins to eliminate' });
    }
    
    // Character actions (can bluff)
    actions.push({ action: 'tax', description: 'Tax: Take 3 coins (Duke)' });
    actions.push({ action: 'exchange', description: 'Exchange: Swap cards (Ambassador)' });
    actions.push({ action: 'steal', description: 'Steal: Take 2 coins from player (Captain)' });
    
    if (coins >= 3) {
        actions.push({ action: 'assassinate', description: 'Assassinate: Pay 3 to kill (Assassin)' });
    }
    
    return actions;
}

function resolveCoupAction(room, io) {
    const gd = room.gameData;
    const action = gd.pendingAction;
    const actor = room.players[gd.currentPlayerIndex].name;
    const target = gd.pendingTarget;
    
    switch (action) {
        case 'income':
            gd.coins[actor]++;
            io.to(room.code).emit('coup-action-resolved', { 
                action, actor, result: `${actor} took 1 coin` 
            });
            break;
            
        case 'foreignAid':
            gd.coins[actor] += 2;
            io.to(room.code).emit('coup-action-resolved', { 
                action, actor, result: `${actor} took 2 coins` 
            });
            break;
            
        case 'tax':
            gd.coins[actor] += 3;
            io.to(room.code).emit('coup-action-resolved', { 
                action, actor, result: `${actor} took 3 coins (Tax)` 
            });
            break;
            
        case 'steal':
            const stolen = Math.min(2, gd.coins[target] || 0);
            gd.coins[target] -= stolen;
            gd.coins[actor] += stolen;
            io.to(room.code).emit('coup-action-resolved', { 
                action, actor, target, result: `${actor} stole ${stolen} coins from ${target}` 
            });
            break;
            
        case 'assassinate':
            // Target loses influence (handled in lose-influence)
            io.to(room.code).emit('coup-assassination', { actor, target });
            return; // Don't advance turn yet
            
        case 'coup':
            io.to(room.code).emit('coup-coup-action', { actor, target });
            return; // Don't advance turn yet
            
        case 'exchange':
            // Draw 2 cards, pick 2 to keep
            const drawn = [gd.deck.pop(), gd.deck.pop()].filter(c => c);
            gd.exchangeCards = [...gd.hands[actor], ...drawn];
            const actorSocket = room.players.find(p => p.name === actor);
            if (actorSocket) {
                io.to(actorSocket.id).emit('coup-exchange-choose', {
                    cards: gd.exchangeCards,
                    keepCount: gd.hands[actor].length
                });
            }
            gd.phase = 'exchange';
            return;
    }
    
    advanceCoupTurn(room, io);
}

function endCoupGame(room, winner, io) {
    room.gameData.phase = 'game-over';
    room.gameState = 'ended';
    
    const finalState = room.players.map(p => ({
        name: p.name,
        cards: room.gameData.hands[p.name] || [],
        coins: room.gameData.coins[p.name] || 0,
        eliminated: room.gameData.eliminatedPlayers.includes(p.name),
        isPremium: p.isPremium || false,
        cosmetics: p.cosmetics || {}
    }));
    
    io.to(room.code).emit('coup-game-over', {
        winner: winner,
        finalState: finalState
    });
    
    console.log(`Coup game ended in room ${room.code}. Winner: ${winner}`);
}

// ============================================
// WORD BOMB - Speed Typing Game
// ============================================

const WORD_BOMB_PROMPTS = [
    'TH', 'IN', 'ER', 'AN', 'RE', 'ON', 'AT', 'EN', 'ND', 'TI',
    'ES', 'OR', 'TE', 'OF', 'ED', 'IS', 'IT', 'AL', 'AR', 'ST',
    'TO', 'NT', 'NG', 'SE', 'HA', 'AS', 'OU', 'IO', 'LE', 'VE',
    'CO', 'ME', 'DE', 'HI', 'RI', 'RO', 'IC', 'NE', 'EA', 'RA',
    'CE', 'LI', 'CH', 'LL', 'BE', 'MA', 'SI', 'OM', 'UR', 'CA',
    'EL', 'TA', 'LA', 'NS', 'DI', 'FO', 'HO', 'PE', 'UN', 'NC',
    'WI', 'US', 'TR', 'PO', 'OW', 'SO', 'UP', 'WA', 'NO', 'WH',
    'GE', 'DO', 'BU', 'AC', 'LO', 'MO', 'OT', 'PR', 'GO', 'PA',
    'EX', 'PL', 'SH', 'GR', 'BO', 'SP', 'BL', 'CL', 'DR', 'FL',
    'FR', 'GL', 'SC', 'SK', 'SL', 'SM', 'SN', 'SW', 'TW', 'WR'
];

// Common English words for validation (subset - in production use a full dictionary API)
const VALID_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
    'thing', 'things', 'another', 'without', 'through', 'whether', 'within', 'together',
    'father', 'mother', 'brother', 'sister', 'weather', 'feather', 'leather', 'rather',
    'gather', 'either', 'neither', 'something', 'nothing', 'everything', 'anything',
    'theater', 'theatre', 'thinking', 'thanksgiving', 'birthday', 'otherwise',
    // Add many more words in production
]);

function initWordBombGame(room, difficulty = 'medium') {
    const difficultySettings = {
        easy: { startTime: 15, minTime: 8, decreaseRate: 0.5 },
        medium: { startTime: 10, minTime: 5, decreaseRate: 0.7 },
        hard: { startTime: 7, minTime: 3, decreaseRate: 0.8 }
    };
    
    const settings = difficultySettings[difficulty] || difficultySettings.medium;
    
    // Shuffle players for turn order
    const playerOrder = [...room.players].sort(() => Math.random() - 0.5);
    
    room.gameData = {
        playerOrder: playerOrder.map(p => ({ id: p.id, name: p.name })),
        currentPlayerIndex: 0,
        currentPrompt: '',
        usedWords: new Set(),
        lives: {},
        scores: {},
        currentTime: settings.startTime,
        minTime: settings.minTime,
        decreaseRate: settings.decreaseRate,
        phase: 'playing',
        eliminatedPlayers: [],
        turnTimeout: null,
        roundNumber: 1,
        wordsThisRound: 0,
        difficulty: difficulty,
        roleAssignments: {}
    };
    
    // Initialize lives and scores
    room.players.forEach(player => {
        room.gameData.lives[player.name] = 3;
        room.gameData.scores[player.name] = 0;
    });
    
    console.log(`Word Bomb game initialized in room ${room.code}, difficulty: ${difficulty}`);
}

function startWordBombTurn(room, io) {
    const gd = room.gameData;
    
    // Clear previous timeout
    if (gd.turnTimeout) {
        clearTimeout(gd.turnTimeout);
    }
    
    // Get current player
    const currentPlayer = gd.playerOrder[gd.currentPlayerIndex];
    if (!currentPlayer) {
        endWordBombGame(room, io);
        return;
    }
    
    // Pick random prompt
    gd.currentPrompt = WORD_BOMB_PROMPTS[Math.floor(Math.random() * WORD_BOMB_PROMPTS.length)];
    
    // Calculate time (decreases over rounds)
    const baseTime = gd.currentTime;
    const roundPenalty = Math.floor(gd.roundNumber / 3) * gd.decreaseRate;
    const turnTime = Math.max(gd.minTime, baseTime - roundPenalty);
    
    io.to(room.code).emit('wordbomb-round', {
        currentPlayer: currentPlayer.name,
        prompt: gd.currentPrompt,
        timeLimit: turnTime,
        lives: gd.lives,
        scores: gd.scores,
        roundNumber: gd.roundNumber
    });
    
    // Set timeout for explosion
    gd.turnTimeout = setTimeout(() => {
        handleWordBombExplosion(room, io);
    }, turnTime * 1000);
}

function handleWordBombExplosion(room, io) {
    const gd = room.gameData;
    const currentPlayer = gd.playerOrder[gd.currentPlayerIndex];
    
    // Lose a life
    gd.lives[currentPlayer.name]--;
    
    io.to(room.code).emit('wordbomb-timeout', {
        playerName: currentPlayer.name,
        livesRemaining: gd.lives[currentPlayer.name],
        lives: gd.lives
    });
    
    // Check elimination
    if (gd.lives[currentPlayer.name] <= 0) {
        gd.eliminatedPlayers.push(currentPlayer.name);
        io.to(room.code).emit('wordbomb-eliminated', {
            playerName: currentPlayer.name,
            finalScore: gd.scores[currentPlayer.name]
        });
    }
    
    // Check win condition
    const alivePlayers = gd.playerOrder.filter(p => !gd.eliminatedPlayers.includes(p.name));
    if (alivePlayers.length <= 1) {
        endWordBombGame(room, io);
        return;
    }
    
    // Next turn
    advanceWordBombTurn(room, io);
}

function advanceWordBombTurn(room, io) {
    const gd = room.gameData;
    
    // Find next alive player
    let nextIndex = (gd.currentPlayerIndex + 1) % gd.playerOrder.length;
    let attempts = 0;
    while (gd.eliminatedPlayers.includes(gd.playerOrder[nextIndex].name) && attempts < gd.playerOrder.length) {
        nextIndex = (nextIndex + 1) % gd.playerOrder.length;
        attempts++;
    }
    
    // Check if we completed a round
    if (nextIndex <= gd.currentPlayerIndex) {
        gd.roundNumber++;
        gd.wordsThisRound = 0;
    }
    
    gd.currentPlayerIndex = nextIndex;
    
    setTimeout(() => {
        startWordBombTurn(room, io);
    }, 1500);
}

function validateWordBombAnswer(word, prompt, usedWords) {
    const w = word.toLowerCase().trim();
    
    // Check minimum length
    if (w.length < 3) return { valid: false, reason: 'Too short (min 3 letters)' };
    
    // Check if contains prompt
    if (!w.includes(prompt.toLowerCase())) {
        return { valid: false, reason: `Must contain "${prompt}"` };
    }
    
    // Check if already used
    if (usedWords.has(w)) {
        return { valid: false, reason: 'Already used!' };
    }
    
    // In production, validate against dictionary API
    // For now, accept words that are long enough and contain the prompt
    // This is a simplified validation
    if (w.length >= 3) {
        return { valid: true };
    }
    
    return { valid: false, reason: 'Not a valid word' };
}

function endWordBombGame(room, io) {
    const gd = room.gameData;
    
    if (gd.turnTimeout) {
        clearTimeout(gd.turnTimeout);
    }
    
    gd.phase = 'game-over';
    room.gameState = 'ended';
    
    // Find winner (last alive or highest score)
    const alivePlayers = gd.playerOrder.filter(p => !gd.eliminatedPlayers.includes(p.name));
    let winner = alivePlayers[0]?.name;
    
    if (!winner) {
        // Everyone eliminated - highest score wins
        let maxScore = -1;
        Object.entries(gd.scores).forEach(([name, score]) => {
            if (score > maxScore) {
                maxScore = score;
                winner = name;
            }
        });
    }
    
    const finalLeaderboard = Object.entries(gd.scores)
        .map(([name, score]) => {
            const player = room.players.find(p => p.name === name);
            return {
                name,
                score,
                lives: gd.lives[name],
                eliminated: gd.eliminatedPlayers.includes(name),
                isPremium: player?.isPremium || false,
                cosmetics: player?.cosmetics || {}
            };
        })
        .sort((a, b) => {
            if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
            return b.score - a.score;
        });
    
    io.to(room.code).emit('wordbomb-game-over', {
        winner: winner,
        finalLeaderboard: finalLeaderboard,
        totalRounds: gd.roundNumber
    });
    
    console.log(`Word Bomb game ended in room ${room.code}. Winner: ${winner}`);
}

// ============================================
// LUDO - Complete Implementation
// ============================================

const LUDO_COLORS = ['red', 'blue', 'yellow', 'green'];
const LUDO_PATH_LENGTH = 52; // Main track
const LUDO_HOME_LENGTH = 6; // Home stretch per color

function initLudoGame(room) {
    const playerCount = Math.min(4, room.players.length);
    const colors = LUDO_COLORS.slice(0, playerCount);
    
    const pieces = {};
    const playerColors = {};
    const homeProgress = {}; // Track pieces in home stretch
    const finishedPieces = {}; // Pieces that reached the end
    
    room.players.slice(0, 4).forEach((player, index) => {
        const color = colors[index];
        playerColors[player.name] = color;
        pieces[color] = [-1, -1, -1, -1]; // -1 = in base, 0-51 = on board
        homeProgress[color] = [0, 0, 0, 0]; // 0 = not in home, 1-6 = position in home stretch
        finishedPieces[color] = [false, false, false, false];
    });
    
    room.gameData = {
        pieces: pieces,
        playerColors: playerColors,
        homeProgress: homeProgress,
        finishedPieces: finishedPieces,
        currentTurnIndex: 0,
        diceValue: 0,
        consecutiveSixes: 0,
        phase: 'roll', // roll, move
        selectedPiece: null,
        turnTimeout: null,
        winner: null,
        roleAssignments: {}
    };
    
    // Starting positions for each color
    room.gameData.startPositions = {
        red: 0,
        blue: 13,
        yellow: 26,
        green: 39
    };
    
    // Safe spots (can't be captured)
    room.gameData.safeSpots = [0, 8, 13, 21, 26, 34, 39, 47];
    
    console.log(`Ludo game initialized in room ${room.code} with ${playerCount} players`);
}

function getLudoCurrentPlayer(room) {
    const gd = room.gameData;
    const players = room.players.slice(0, 4);
    return players[gd.currentTurnIndex];
}

function getLudoState(room) {
    const gd = room.gameData;
    const currentPlayer = getLudoCurrentPlayer(room);
    
    return {
        pieces: gd.pieces,
        colors: gd.playerColors,
        homeProgress: gd.homeProgress,
        finishedPieces: gd.finishedPieces,
        currentTurn: currentPlayer?.name,
        currentColor: gd.playerColors[currentPlayer?.name],
        diceValue: gd.diceValue,
        phase: gd.phase,
        players: room.players.slice(0, 4).map(p => ({
            name: p.name,
            color: gd.playerColors[p.name],
            isPremium: p.isPremium || false,
            cosmetics: p.cosmetics || {}
        }))
    };
}

function rollLudoDice(room, io) {
    const gd = room.gameData;
    const currentPlayer = getLudoCurrentPlayer(room);
    const color = gd.playerColors[currentPlayer.name];
    
    const value = Math.floor(Math.random() * 6) + 1;
    gd.diceValue = value;
    
    // Check for three consecutive sixes (lose turn)
    if (value === 6) {
        gd.consecutiveSixes++;
        if (gd.consecutiveSixes >= 3) {
            io.to(room.code).emit('ludo-three-sixes', {
                playerName: currentPlayer.name,
                color: color
            });
            gd.consecutiveSixes = 0;
            advanceLudoTurn(room, io);
            return;
        }
    } else {
        gd.consecutiveSixes = 0;
    }
    
    // Find moveable pieces
    const moveablePieces = [];
    const pieces = gd.pieces[color];
    const homeProgress = gd.homeProgress[color];
    const finished = gd.finishedPieces[color];
    
    pieces.forEach((pos, index) => {
        if (finished[index]) return; // Already finished
        
        if (pos === -1) {
            // In base - need 6 to come out
            if (value === 6) moveablePieces.push(index);
        } else if (homeProgress[index] > 0) {
            // In home stretch - can move if won't overshoot
            if (homeProgress[index] + value <= 6) moveablePieces.push(index);
        } else {
            // On main board - can always move
            moveablePieces.push(index);
        }
    });
    
    io.to(room.code).emit('ludo-roll', {
        playerName: currentPlayer.name,
        color: color,
        value: value,
        selectablePieces: moveablePieces,
        state: getLudoState(room)
    });
    
    if (moveablePieces.length === 0) {
        // No valid moves - next turn
        setTimeout(() => {
            advanceLudoTurn(room, io);
        }, 1500);
    } else if (moveablePieces.length === 1) {
        // Auto-select only piece
        gd.phase = 'move';
        gd.selectedPiece = moveablePieces[0];
    } else {
        // Player must choose
        gd.phase = 'move';
    }
}

function moveLudoPiece(room, pieceIndex, io) {
    const gd = room.gameData;
    const currentPlayer = getLudoCurrentPlayer(room);
    const color = gd.playerColors[currentPlayer.name];
    const value = gd.diceValue;
    
    const pieces = gd.pieces[color];
    const homeProgress = gd.homeProgress[color];
    const finished = gd.finishedPieces[color];
    const startPos = gd.startPositions[color];
    
    let pos = pieces[pieceIndex];
    let captured = null;
    
    if (pos === -1) {
        // Coming out of base
        pieces[pieceIndex] = startPos;
        pos = startPos;
    } else if (homeProgress[pieceIndex] > 0) {
        // Moving in home stretch
        homeProgress[pieceIndex] += value;
        if (homeProgress[pieceIndex] >= 6) {
            finished[pieceIndex] = true;
            io.to(room.code).emit('ludo-piece-finished', {
                playerName: currentPlayer.name,
                color: color,
                pieceIndex: pieceIndex
            });
        }
    } else {
        // Moving on main board
        const newPos = (pos + value) % LUDO_PATH_LENGTH;
        
        // Check if entering home stretch
        const homeEntry = (startPos + LUDO_PATH_LENGTH - 1) % LUDO_PATH_LENGTH;
        const distanceToHome = (homeEntry - pos + LUDO_PATH_LENGTH) % LUDO_PATH_LENGTH;
        
        if (distanceToHome < value && distanceToHome > 0) {
            // Entering home stretch
            const homeSteps = value - distanceToHome;
            pieces[pieceIndex] = -2; // Mark as in home
            homeProgress[pieceIndex] = homeSteps;
            
            if (homeSteps >= 6) {
                finished[pieceIndex] = true;
                io.to(room.code).emit('ludo-piece-finished', {
                    playerName: currentPlayer.name,
                    color: color,
                    pieceIndex: pieceIndex
                });
            }
        } else {
            pieces[pieceIndex] = newPos;
            
            // Check for capture (if not safe spot)
            if (!gd.safeSpots.includes(newPos)) {
                Object.entries(gd.pieces).forEach(([otherColor, otherPieces]) => {
                    if (otherColor !== color) {
                        otherPieces.forEach((otherPos, otherIndex) => {
                            if (otherPos === newPos && otherPos >= 0) {
                                // Capture!
                                gd.pieces[otherColor][otherIndex] = -1;
                                captured = { color: otherColor, pieceIndex: otherIndex };
                            }
                        });
                    }
                });
            }
        }
    }
    
    io.to(room.code).emit('ludo-move', {
        playerName: currentPlayer.name,
        color: color,
        pieceIndex: pieceIndex,
        newPosition: pieces[pieceIndex],
        homeProgress: homeProgress[pieceIndex],
        captured: captured,
        state: getLudoState(room)
    });
    
    // Check win condition
    if (finished.every(f => f)) {
        endLudoGame(room, currentPlayer.name, io);
        return;
    }
    
    // Roll again if got 6 or captured
    if (gd.diceValue === 6 || captured) {
        gd.phase = 'roll';
        io.to(room.code).emit('ludo-bonus-turn', {
            playerName: currentPlayer.name,
            reason: captured ? 'Captured a piece!' : 'Rolled a 6!'
        });
    } else {
        advanceLudoTurn(room, io);
    }
}

function advanceLudoTurn(room, io) {
    const gd = room.gameData;
    gd.currentTurnIndex = (gd.currentTurnIndex + 1) % Math.min(4, room.players.length);
    gd.phase = 'roll';
    gd.diceValue = 0;
    gd.selectedPiece = null;
    
    const nextPlayer = getLudoCurrentPlayer(room);
    
    io.to(room.code).emit('ludo-turn-change', {
        currentPlayer: nextPlayer.name,
        currentColor: gd.playerColors[nextPlayer.name],
        state: getLudoState(room)
    });
}

function endLudoGame(room, winner, io) {
    room.gameData.phase = 'game-over';
    room.gameData.winner = winner;
    room.gameState = 'ended';
    
    const rankings = room.players.slice(0, 4).map(p => {
        const color = room.gameData.playerColors[p.name];
        const finished = room.gameData.finishedPieces[color].filter(f => f).length;
        return {
            name: p.name,
            color: color,
            finishedPieces: finished,
            isPremium: p.isPremium || false,
            cosmetics: p.cosmetics || {}
        };
    }).sort((a, b) => b.finishedPieces - a.finishedPieces);
    
    io.to(room.code).emit('ludo-game-over', {
        winner: winner,
        rankings: rankings
    });
    
    console.log(`Ludo game ended in room ${room.code}. Winner: ${winner}`);
}

// ============================================
// HEADS UP / CHARADES - Acting Games
// ============================================

const CHARADES_WORDS = {
    movies: [
        'Titanic', 'Avatar', 'Frozen', 'Jaws', 'Star Wars', 'The Matrix', 'Jurassic Park',
        'Spider-Man', 'Batman', 'Harry Potter', 'Finding Nemo', 'Toy Story', 'Shrek',
        'The Lion King', 'Avengers', 'Inception', 'Forrest Gump', 'Rocky', 'E.T.',
        'Ghostbusters', 'Indiana Jones', 'Back to the Future', 'Terminator', 'Alien'
    ],
    actions: [
        'Swimming', 'Dancing', 'Cooking', 'Sleeping', 'Crying', 'Laughing', 'Running',
        'Jumping', 'Flying', 'Climbing', 'Driving', 'Singing', 'Fishing', 'Boxing',
        'Surfing', 'Skiing', 'Golfing', 'Bowling', 'Yoga', 'Karate', 'Ballet',
        'Skateboarding', 'Juggling', 'Magic trick', 'Taking a selfie'
    ],
    animals: [
        'Elephant', 'Monkey', 'Penguin', 'Kangaroo', 'Snake', 'Chicken', 'Dog',
        'Cat', 'Lion', 'Bear', 'Rabbit', 'Frog', 'Horse', 'Dolphin', 'Shark',
        'Eagle', 'Owl', 'Gorilla', 'Giraffe', 'Crocodile', 'Butterfly', 'Spider'
    ],
    celebrities: [
        'Michael Jackson', 'Elvis', 'Beyonce', 'Taylor Swift', 'The Rock',
        'Oprah', 'Barack Obama', 'Queen Elizabeth', 'Einstein', 'Marilyn Monroe',
        'Charlie Chaplin', 'Muhammad Ali', 'Michael Jordan', 'Usain Bolt'
    ],
    objects: [
        'Umbrella', 'Guitar', 'Telephone', 'Camera', 'Scissors', 'Hammer',
        'Blender', 'Vacuum cleaner', 'Microwave', 'Washing machine', 'Toilet',
        'Ladder', 'Trampoline', 'Skateboard', 'Bicycle', 'Motorcycle'
    ],
    random: [
        'Birthday party', 'Wedding', 'Dentist visit', 'Job interview', 'First date',
        'Zombie', 'Superhero', 'Robot', 'Alien', 'Ghost', 'Vampire', 'Werewolf',
        'Baby', 'Old person', 'Drunk person', 'Ninja', 'Cowboy', 'Pirate'
    ]
};

function initCharadesGame(room, category = 'random', mode = 'classic') {
    // mode: 'classic' (one actor) or 'headsup' (phone on forehead style)
    let wordPool = [];
    
    if (category === 'mixed' || !CHARADES_WORDS[category]) {
        Object.values(CHARADES_WORDS).forEach(words => {
            wordPool = [...wordPool, ...words];
        });
    } else {
        wordPool = [...CHARADES_WORDS[category]];
    }
    
    wordPool = wordPool.sort(() => Math.random() - 0.5);
    
    // Determine rounds - each player acts once per round, 2 rounds
    const roundsPerPlayer = 2;
    const totalTurns = room.players.length * roundsPerPlayer;
    
    room.gameData = {
        wordPool: wordPool,
        wordIndex: 0,
        currentTurn: 0,
        totalTurns: totalTurns,
        currentRound: 1,
        totalRounds: roundsPerPlayer,
        phase: 'countdown',
        currentActor: null,
        currentActorIndex: 0,
        currentWord: null,
        scores: {},
        timePerTurn: mode === 'headsup' ? 60 : 90,
        mode: mode,
        category: category,
        wordsGuessedThisTurn: 0,
        skipsRemaining: 3,
        turnTimeout: null,
        roleAssignments: {}
    };
    
    room.players.forEach(p => { room.gameData.scores[p.name] = 0; });
    
    console.log(`Charades game initialized in room ${room.code}, mode: ${mode}, category: ${category}`);
}

function startCharadesTurn(room, io) {
    const gd = room.gameData;
    
    if (gd.turnTimeout) clearTimeout(gd.turnTimeout);
    
    const actor = room.players[gd.currentActorIndex];
    if (!actor) {
        endCharadesGame(room, io);
        return;
    }
    
    gd.currentActor = actor;
    gd.currentWord = gd.wordPool[gd.wordIndex] || getNextCharadesWord(room);
    gd.wordIndex++;
    gd.wordsGuessedThisTurn = 0;
    gd.skipsRemaining = 3;
    gd.phase = 'acting';
    
    const currentRound = Math.floor(gd.currentTurn / room.players.length) + 1;
    
    // Send word only to actor
    io.to(actor.id).emit('charades-your-turn', {
        word: gd.currentWord,
        timeLimit: gd.timePerTurn,
        round: currentRound,
        totalRounds: gd.totalRounds,
        skipsRemaining: gd.skipsRemaining
    });
    
    // Send to guessers
    room.players.forEach(p => {
        if (p.id !== actor.id) {
            io.to(p.id).emit('charades-guess-turn', {
                actor: actor.name,
                timeLimit: gd.timePerTurn,
                round: currentRound,
                mode: gd.mode,
                category: gd.category
            });
        }
    });
    
    io.to(room.code).emit('charades-turn-start', {
        actor: actor.name,
        timeLimit: gd.timePerTurn,
        round: currentRound,
        scores: gd.scores
    });
    
    // Also emit charades-round for frontend compatibility
    io.to(room.code).emit('charades-round', {
        actor: actor.name,
        word: gd.currentWord,
        timeLimit: gd.timePerTurn,
        round: currentRound,
        totalRounds: gd.totalRounds
    });
    
    // Turn timeout
    gd.turnTimeout = setTimeout(() => {
        endCharadesTurn(room, io, false);
    }, gd.timePerTurn * 1000);
}

function getNextCharadesWord(room) {
    const gd = room.gameData;
    
    if (gd.wordIndex >= gd.wordPool.length) {
        // Reshuffle
        gd.wordPool = gd.wordPool.sort(() => Math.random() - 0.5);
        gd.wordIndex = 0;
    }
    
    return gd.wordPool[gd.wordIndex];
}

function handleCharadesGuess(room, guesserName, guess, io) {
    const gd = room.gameData;
    if (gd.phase !== 'acting') return;
    
    const guessLower = guess.toLowerCase().trim();
    const wordLower = gd.currentWord.toLowerCase().trim();
    
    if (guessLower === wordLower || wordLower.includes(guessLower) && guessLower.length >= 3) {
        // Correct!
        if (gd.turnTimeout) clearTimeout(gd.turnTimeout);
        
        // Award points
        const actorPoints = 10;
        const guesserPoints = 15;
        
        gd.scores[gd.currentActor.name] = (gd.scores[gd.currentActor.name] || 0) + actorPoints;
        gd.scores[guesserName] = (gd.scores[guesserName] || 0) + guesserPoints;
        gd.wordsGuessedThisTurn++;
        
        io.to(room.code).emit('charades-correct', {
            guesser: guesserName,
            word: gd.currentWord,
            actorPoints: actorPoints,
            guesserPoints: guesserPoints,
            scores: gd.scores
        });
        
        if (gd.mode === 'headsup') {
            // In heads up mode, immediately get next word
            gd.currentWord = getNextCharadesWord(room);
            gd.wordIndex++;
            
            io.to(gd.currentActor.id).emit('charades-next-word', {
                word: gd.currentWord,
                wordsGuessed: gd.wordsGuessedThisTurn
            });
        } else {
            // Classic mode - end turn after correct guess
            endCharadesTurn(room, io, true);
        }
    } else {
        // Wrong guess - broadcast to chat
        io.to(room.code).emit('charades-guess', {
            guesser: guesserName,
            guess: guess
        });
    }
}

function handleCharadesSkip(room, io) {
    const gd = room.gameData;
    if (gd.phase !== 'acting' || gd.skipsRemaining <= 0) return;
    
    gd.skipsRemaining--;
    
    io.to(room.code).emit('charades-pass', {
        word: gd.currentWord,
        skipsRemaining: gd.skipsRemaining
    });
    
    // Get next word
    gd.currentWord = getNextCharadesWord(room);
    gd.wordIndex++;
    
    io.to(gd.currentActor.id).emit('charades-next-word', {
        word: gd.currentWord,
        skipsRemaining: gd.skipsRemaining
    });
}

function endCharadesTurn(room, io, guessed) {
    const gd = room.gameData;
    
    if (gd.turnTimeout) clearTimeout(gd.turnTimeout);
    
    gd.phase = 'turnEnd';
    
    io.to(room.code).emit('charades-time-up', {
        actor: gd.currentActor.name,
        word: gd.currentWord,
        guessed: guessed,
        wordsGuessed: gd.wordsGuessedThisTurn,
        scores: gd.scores
    });
    
    // Next turn
    setTimeout(() => {
        gd.currentTurn++;
        gd.currentActorIndex = (gd.currentActorIndex + 1) % room.players.length;
        
        if (gd.currentTurn >= gd.totalTurns) {
            endCharadesGame(room, io);
        } else {
            startCharadesTurn(room, io);
        }
    }, 3000);
}

function endCharadesGame(room, io) {
    const gd = room.gameData;
    
    if (gd.turnTimeout) clearTimeout(gd.turnTimeout);
    
    gd.phase = 'game-over';
    room.gameState = 'ended';
    
    const finalLeaderboard = Object.entries(gd.scores)
        .map(([name, score]) => {
            const player = room.players.find(p => p.name === name);
            return {
                name,
                score,
                isPremium: player?.isPremium || false,
                cosmetics: player?.cosmetics || {}
            };
        })
        .sort((a, b) => b.score - a.score);
    
    io.to(room.code).emit('charades-game-over', {
        finalLeaderboard: finalLeaderboard,
        winner: finalLeaderboard[0]?.name || 'No one'
    });
    
    console.log(`Charades game ended in room ${room.code}. Winner: ${finalLeaderboard[0]?.name}`);
}

// ============================================
// SECRET ROLES (AVALON) - Advanced Social Deduction
// ============================================

const AVALON_ROLES = {
    good: ['Merlin', 'Percival', 'Loyal Servant', 'Loyal Servant', 'Loyal Servant'],
    evil: ['Morgana', 'Assassin', 'Mordred', 'Oberon', 'Minion']
};

const AVALON_TEAM_SIZES = {
    5: [2, 3, 2, 3, 3],
    6: [2, 3, 4, 3, 4],
    7: [2, 3, 3, 4, 4],
    8: [3, 4, 4, 5, 5],
    9: [3, 4, 4, 5, 5],
    10: [3, 4, 4, 5, 5]
};

const AVALON_EVIL_COUNT = {
    5: 2, 6: 2, 7: 3, 8: 3, 9: 3, 10: 4
};

function initAvalonGame(room, variant = 'standard') {
    const playerCount = room.players.length;
    
    if (playerCount < 5 || playerCount > 10) {
        console.log(`Invalid player count for Avalon: ${playerCount}`);
        return;
    }
    
    const evilCount = AVALON_EVIL_COUNT[playerCount];
    const goodCount = playerCount - evilCount;
    
    // Assign roles based on variant
    let goodRoles, evilRoles;
    
    if (variant === 'basic') {
        goodRoles = Array(goodCount).fill('Loyal Servant');
        evilRoles = Array(evilCount).fill('Minion');
    } else {
        // Standard includes Merlin + Assassin
        goodRoles = ['Merlin', ...Array(goodCount - 1).fill('Loyal Servant')];
        evilRoles = ['Assassin', ...Array(evilCount - 1).fill('Minion')];
        
        if (variant === 'advanced' && playerCount >= 7) {
            // Add Percival and Morgana
            goodRoles[1] = 'Percival';
            if (evilRoles.length > 1) evilRoles[1] = 'Morgana';
        }
    }
    
    // Shuffle players and assign roles
    const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);
    const assignments = {};
    const evilTeam = [];
    let merlin = null;
    let percival = null;
    const morganaAndMerlin = [];
    
    shuffledPlayers.forEach((player, index) => {
        let role, isEvil;
        
        if (index < goodCount) {
            role = goodRoles[index];
            isEvil = false;
        } else {
            role = evilRoles[index - goodCount];
            isEvil = true;
            evilTeam.push(player.name);
        }
        
        assignments[player.name] = { role, isEvil };
        
        if (role === 'Merlin') {
            merlin = player.name;
            morganaAndMerlin.push(player.name);
        }
        if (role === 'Percival') percival = player.name;
        if (role === 'Morgana') morganaAndMerlin.push(player.name);
    });
    
    room.gameData = {
        assignments: assignments,
        evilTeam: evilTeam,
        merlin: merlin,
        percival: percival,
        morganaAndMerlin: morganaAndMerlin,
        questHistory: [],
        currentQuest: 1,
        questResults: [], // 'success' or 'fail'
        teamSizes: AVALON_TEAM_SIZES[playerCount],
        leaderIndex: Math.floor(Math.random() * playerCount),
        proposedTeam: [],
        teamVotes: {},
        questVotes: {},
        consecutiveRejects: 0,
        phase: 'role-reveal', // role-reveal, team-proposal, team-vote, quest, assassinate, game-over
        variant: variant,
        roleAssignments: assignments
    };
    
    console.log(`Avalon game initialized in room ${room.code}, variant: ${variant}`);
    
    // Send role information to each player
    room.players.forEach(player => {
        const assignment = assignments[player.name];
        let knownInfo = {};
        
        if (assignment.role === 'Merlin') {
            // Merlin sees all evil except Mordred
            knownInfo.evilPlayers = evilTeam.filter(name => 
                assignments[name].role !== 'Mordred'
            );
        } else if (assignment.isEvil && assignment.role !== 'Oberon') {
            // Evil sees each other (except Oberon)
            knownInfo.evilPlayers = evilTeam.filter(name =>
                assignments[name].role !== 'Oberon' && name !== player.name
            );
        } else if (assignment.role === 'Percival') {
            // Percival sees Merlin and Morgana (but doesn't know which is which)
            knownInfo.merlinCandidates = morganaAndMerlin;
        }
        
        io.to(player.id).emit('avalon-role-assigned', {
            role: assignment.role,
            isEvil: assignment.isEvil,
            ...knownInfo
        });
    });
}

function getAvalonPublicState(room) {
    const gd = room.gameData;
    const leader = room.players[gd.leaderIndex];
    
    return {
        currentQuest: gd.currentQuest,
        questResults: gd.questResults,
        teamSize: gd.teamSizes[gd.currentQuest - 1],
        leader: leader?.name,
        proposedTeam: gd.proposedTeam,
        consecutiveRejects: gd.consecutiveRejects,
        phase: gd.phase,
        players: room.players.map(p => ({
            name: p.name,
            isPremium: p.isPremium || false,
            cosmetics: p.cosmetics || {}
        }))
    };
}

function startAvalonTeamProposal(room, io) {
    const gd = room.gameData;
    gd.phase = 'team-proposal';
    gd.proposedTeam = [];
    gd.teamVotes = {};
    
    const leader = room.players[gd.leaderIndex];
    const teamSize = gd.teamSizes[gd.currentQuest - 1];
    
    io.to(room.code).emit('avalon-team-proposal', {
        leader: leader.name,
        teamSize: teamSize,
        quest: gd.currentQuest,
        consecutiveRejects: gd.consecutiveRejects,
        state: getAvalonPublicState(room)
    });
}

function handleAvalonTeamProposal(room, team, io) {
    const gd = room.gameData;
    const leader = room.players[gd.leaderIndex];
    const teamSize = gd.teamSizes[gd.currentQuest - 1];
    
    if (team.length !== teamSize) {
        return { error: `Team must have exactly ${teamSize} members` };
    }
    
    gd.proposedTeam = team;
    gd.phase = 'team-vote';
    gd.teamVotes = {};
    
    io.to(room.code).emit('avalon-team-proposed', {
        leader: leader.name,
        team: team,
        state: getAvalonPublicState(room)
    });
}

function handleAvalonTeamVote(room, playerName, approve, io) {
    const gd = room.gameData;
    
    if (gd.teamVotes[playerName] !== undefined) return;
    
    gd.teamVotes[playerName] = approve;
    
    io.to(room.code).emit('avalon-vote-cast', {
        voterCount: Object.keys(gd.teamVotes).length,
        totalPlayers: room.players.length
    });
    
    // Check if all voted
    if (Object.keys(gd.teamVotes).length === room.players.length) {
        resolveAvalonTeamVote(room, io);
    }
}

function resolveAvalonTeamVote(room, io) {
    const gd = room.gameData;
    
    const approves = Object.values(gd.teamVotes).filter(v => v).length;
    const rejects = Object.values(gd.teamVotes).filter(v => !v).length;
    const approved = approves > rejects;
    
    const voteResults = room.players.map(p => ({
        name: p.name,
        vote: gd.teamVotes[p.name],
        isPremium: p.isPremium || false
    }));
    
    io.to(room.code).emit('avalon-team-vote-results', {
        approved: approved,
        approves: approves,
        rejects: rejects,
        votes: voteResults
    });
    
    if (approved) {
        // Start quest
        gd.consecutiveRejects = 0;
        startAvalonQuest(room, io);
    } else {
        gd.consecutiveRejects++;
        
        if (gd.consecutiveRejects >= 5) {
            // Evil wins automatically
            endAvalonGame(room, false, 'Five consecutive team rejections', io);
        } else {
            // Next leader
            gd.leaderIndex = (gd.leaderIndex + 1) % room.players.length;
            setTimeout(() => {
                startAvalonTeamProposal(room, io);
            }, 3000);
        }
    }
}

function startAvalonQuest(room, io) {
    const gd = room.gameData;
    gd.phase = 'quest';
    gd.questVotes = {};
    
    // Only team members vote on quest
    gd.proposedTeam.forEach(memberName => {
        const member = room.players.find(p => p.name === memberName);
        if (member) {
            const isEvil = gd.assignments[memberName].isEvil;
            io.to(member.id).emit('avalon-quest-vote', {
                quest: gd.currentQuest,
                canFail: isEvil // Only evil can fail
            });
        }
    });
    
    io.to(room.code).emit('avalon-quest-started', {
        quest: gd.currentQuest,
        team: gd.proposedTeam
    });
}

function handleAvalonQuestVote(room, playerName, success, io) {
    const gd = room.gameData;
    
    if (!gd.proposedTeam.includes(playerName)) return;
    if (gd.questVotes[playerName] !== undefined) return;
    
    // Good players must vote success
    if (!gd.assignments[playerName].isEvil && !success) {
        success = true; // Force good players to succeed
    }
    
    gd.questVotes[playerName] = success;
    
    io.to(room.code).emit('avalon-quest-vote-cast', {
        voterCount: Object.keys(gd.questVotes).length,
        totalVoters: gd.proposedTeam.length
    });
    
    // Check if all voted
    if (Object.keys(gd.questVotes).length === gd.proposedTeam.length) {
        resolveAvalonQuest(room, io);
    }
}

function resolveAvalonQuest(room, io) {
    const gd = room.gameData;
    
    const fails = Object.values(gd.questVotes).filter(v => !v).length;
    const failsNeeded = gd.currentQuest === 4 && room.players.length >= 7 ? 2 : 1;
    const questSucceeded = fails < failsNeeded;
    
    gd.questResults.push(questSucceeded ? 'success' : 'fail');
    gd.questHistory.push({
        quest: gd.currentQuest,
        team: [...gd.proposedTeam],
        result: questSucceeded ? 'success' : 'fail',
        fails: fails
    });
    
    io.to(room.code).emit('avalon-quest-results', {
        quest: gd.currentQuest,
        success: questSucceeded,
        fails: fails,
        questResults: gd.questResults
    });
    
    // Check win conditions
    const goodWins = gd.questResults.filter(r => r === 'success').length;
    const evilWins = gd.questResults.filter(r => r === 'fail').length;
    
    if (goodWins >= 3) {
        // Good has 3 successes - but evil can still win by assassinating Merlin
        if (gd.merlin && gd.variant !== 'basic') {
            startAvalonAssassination(room, io);
        } else {
            endAvalonGame(room, true, 'Three successful quests', io);
        }
    } else if (evilWins >= 3) {
        endAvalonGame(room, false, 'Three failed quests', io);
    } else {
        // Next quest
        gd.currentQuest++;
        gd.leaderIndex = (gd.leaderIndex + 1) % room.players.length;
        
        setTimeout(() => {
            startAvalonTeamProposal(room, io);
        }, 3000);
    }
}

function startAvalonAssassination(room, io) {
    const gd = room.gameData;
    gd.phase = 'assassinate';
    
    // Find the assassin
    const assassin = room.players.find(p => gd.assignments[p.name].role === 'Assassin');
    
    const goodPlayers = room.players.filter(p => !gd.assignments[p.name].isEvil);
    
    io.to(room.code).emit('avalon-assassination-phase', {
        assassin: assassin?.name,
        goodPlayers: goodPlayers.map(p => p.name)
    });
    
    if (assassin) {
        io.to(assassin.id).emit('avalon-choose-assassination', {
            targets: goodPlayers.map(p => p.name)
        });
    }
}

function handleAvalonAssassination(room, targetName, io) {
    const gd = room.gameData;
    
    const assassinatedMerlin = targetName === gd.merlin;
    
    io.to(room.code).emit('avalon-assassination-result', {
        target: targetName,
        wasMerlin: assassinatedMerlin,
        actualMerlin: gd.merlin
    });
    
    if (assassinatedMerlin) {
        endAvalonGame(room, false, 'Merlin was assassinated', io);
    } else {
        endAvalonGame(room, true, 'Merlin survived assassination', io);
    }
}

function endAvalonGame(room, goodWins, reason, io) {
    const gd = room.gameData;
    gd.phase = 'game-over';
    room.gameState = 'ended';
    
    const allRoles = room.players.map(p => ({
        name: p.name,
        role: gd.assignments[p.name].role,
        isEvil: gd.assignments[p.name].isEvil,
        isPremium: p.isPremium || false,
        cosmetics: p.cosmetics || {}
    }));
    
    io.to(room.code).emit('avalon-game-over', {
        goodWins: goodWins,
        reason: reason,
        allRoles: allRoles,
        questHistory: gd.questHistory
    });
    
    console.log(`Avalon game ended in room ${room.code}. Good wins: ${goodWins}. Reason: ${reason}`);
}

// ============================================
// FAKE ARTIST - Drawing Social Deduction
// ============================================

const FAKE_ARTIST_THEMES = {
    animals: ['elephant', 'giraffe', 'penguin', 'dolphin', 'butterfly', 'octopus', 'kangaroo', 'peacock'],
    food: ['pizza', 'hamburger', 'sushi', 'ice cream', 'birthday cake', 'taco', 'spaghetti', 'donut'],
    places: ['beach', 'castle', 'space station', 'jungle', 'volcano', 'underwater', 'desert', 'city'],
    objects: ['guitar', 'bicycle', 'umbrella', 'rocket', 'camera', 'treasure chest', 'hot air balloon', 'robot'],
    movies: ['Star Wars', 'Titanic', 'Jurassic Park', 'Harry Potter', 'Finding Nemo', 'Frozen', 'Avatar', 'Jaws']
};

function initFakeArtistGame(room, category = 'mixed') {
    let wordPool = [];
    
    if (category === 'mixed' || !FAKE_ARTIST_THEMES[category]) {
        Object.values(FAKE_ARTIST_THEMES).forEach(words => {
            wordPool = [...wordPool, ...words];
        });
    } else {
        wordPool = [...FAKE_ARTIST_THEMES[category]];
    }
    
    wordPool = wordPool.sort(() => Math.random() - 0.5);
    
    // Pick fake artist randomly
    const fakeArtistIndex = Math.floor(Math.random() * room.players.length);
    const fakeArtist = room.players[fakeArtistIndex];
    
    // Pick question master (person who sees the word and picks next theme)
    const questionMasterIndex = (fakeArtistIndex + 1 + Math.floor(Math.random() * (room.players.length - 1))) % room.players.length;
    const questionMaster = room.players[questionMasterIndex];
    
    // Pick word
    const currentWord = wordPool[0];
    
    // Assign colors to players
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    const playerColors = {};
    room.players.forEach((p, i) => {
        playerColors[p.name] = colors[i % colors.length];
    });
    
    room.gameData = {
        wordPool: wordPool,
        wordIndex: 0,
        currentWord: currentWord,
        fakeArtist: fakeArtist.name,
        questionMaster: questionMaster.name,
        playerColors: playerColors,
        currentDrawerIndex: 0,
        drawOrder: [...room.players].sort(() => Math.random() - 0.5),
        round: 1,
        maxRounds: 2, // Each player draws twice
        phase: 'reveal', // reveal, drawing, voting, results
        votes: {},
        canvasData: [],
        roleAssignments: {},
        category: category
    };
    
    // Store role assignments
    room.players.forEach(p => {
        room.gameData.roleAssignments[p.name] = {
            isFakeArtist: p.name === fakeArtist.name,
            isQuestionMaster: p.name === questionMaster.name
        };
    });
    
    console.log(`Fake Artist game initialized in room ${room.code}. Fake Artist: ${fakeArtist.name}`);
}

function startFakeArtistRound(room, io) {
    const gd = room.gameData;
    gd.phase = 'reveal';
    
    // Send info to each player
    room.players.forEach(player => {
        const isFake = player.name === gd.fakeArtist;
        
        io.to(player.id).emit('fakeartist-role', {
            isFakeArtist: isFake,
            word: isFake ? null : gd.currentWord,
            theme: getCategoryFromWord(gd.currentWord),
            yourColor: gd.playerColors[player.name],
            allColors: gd.playerColors
        });
    });
    
    io.to(room.code).emit('fakeartist-round-start', {
        round: gd.round,
        maxRounds: gd.maxRounds,
        playerColors: gd.playerColors,
        drawOrder: gd.drawOrder.map(p => p.name)
    });
    
    // Start drawing after reveal
    setTimeout(() => {
        startFakeArtistDrawing(room, io);
    }, 5000);
}

function getCategoryFromWord(word) {
    for (const [category, words] of Object.entries(FAKE_ARTIST_THEMES)) {
        if (words.includes(word)) return category;
    }
    return 'mixed';
}

function startFakeArtistDrawing(room, io) {
    const gd = room.gameData;
    gd.phase = 'drawing';
    gd.currentDrawerIndex = 0;
    
    startFakeArtistTurn(room, io);
}

function startFakeArtistTurn(room, io) {
    const gd = room.gameData;
    const currentDrawer = gd.drawOrder[gd.currentDrawerIndex];
    
    if (!currentDrawer) {
        // Round complete
        gd.round++;
        if (gd.round > gd.maxRounds) {
            startFakeArtistVoting(room, io);
        } else {
            gd.currentDrawerIndex = 0;
            startFakeArtistTurn(room, io);
        }
        return;
    }
    
    io.to(room.code).emit('fakeartist-turn', {
        currentDrawer: currentDrawer.name,
        drawerColor: gd.playerColors[currentDrawer.name],
        round: gd.round,
        turnNumber: gd.currentDrawerIndex + 1,
        totalTurns: gd.drawOrder.length
    });
    
    io.to(currentDrawer.id).emit('fakeartist-your-turn', {
        timeLimit: 10,
        color: gd.playerColors[currentDrawer.name]
    });
}

function handleFakeArtistDraw(room, playerName, strokeData, io) {
    const gd = room.gameData;
    const currentDrawer = gd.drawOrder[gd.currentDrawerIndex];
    
    if (currentDrawer?.name !== playerName) return;
    
    // Store stroke data
    gd.canvasData.push({
        player: playerName,
        color: gd.playerColors[playerName],
        stroke: strokeData,
        round: gd.round
    });
    
    // Broadcast to all
    io.to(room.code).emit('fakeartist-stroke', {
        player: playerName,
        color: gd.playerColors[playerName],
        stroke: strokeData
    });
    
    // Next drawer
    gd.currentDrawerIndex++;
    
    setTimeout(() => {
        startFakeArtistTurn(room, io);
    }, 500);
}

function startFakeArtistVoting(room, io) {
    const gd = room.gameData;
    gd.phase = 'voting';
    gd.votes = {};
    
    io.to(room.code).emit('fakeartist-voting', {
        canvasData: gd.canvasData,
        players: room.players.map(p => ({
            name: p.name,
            color: gd.playerColors[p.name],
            isPremium: p.isPremium || false
        })),
        timeLimit: 30
    });
}

function handleFakeArtistVote(room, voterName, targetName, io) {
    const gd = room.gameData;
    
    if (gd.votes[voterName] !== undefined) return;
    if (voterName === targetName) return; // Can't vote for self
    
    gd.votes[voterName] = targetName;
    
    io.to(room.code).emit('fakeartist-vote-cast', {
        voterCount: Object.keys(gd.votes).length,
        totalPlayers: room.players.length
    });
    
    // Check if all voted
    if (Object.keys(gd.votes).length === room.players.length) {
        resolveFakeArtistVoting(room, io);
    }
}

function resolveFakeArtistVoting(room, io) {
    const gd = room.gameData;
    gd.phase = 'results';
    
    // Count votes
    const voteCounts = {};
    Object.values(gd.votes).forEach(target => {
        voteCounts[target] = (voteCounts[target] || 0) + 1;
    });
    
    // Find most voted
    let maxVotes = 0;
    let accused = null;
    Object.entries(voteCounts).forEach(([name, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            accused = name;
        }
    });
    
    const fakeArtistCaught = accused === gd.fakeArtist;
    
    // If caught, fake artist gets one chance to guess the word
    if (fakeArtistCaught) {
        gd.phase = 'fake-artist-guess';
        
        const fakeArtistSocket = room.players.find(p => p.name === gd.fakeArtist);
        if (fakeArtistSocket) {
            io.to(fakeArtistSocket.id).emit('fakeartist-guess-word', {
                timeLimit: 15
            });
        }
        
        io.to(room.code).emit('fakeartist-caught', {
            fakeArtist: gd.fakeArtist,
            votes: voteCounts
        });
    } else {
        // Fake artist wins
        endFakeArtistGame(room, false, false, io);
    }
}

function handleFakeArtistWordGuess(room, guess, io) {
    const gd = room.gameData;
    
    const correct = guess.toLowerCase().trim() === gd.currentWord.toLowerCase().trim();
    
    endFakeArtistGame(room, true, correct, io);
}

function endFakeArtistGame(room, wasCaught, guessedWord, io) {
    const gd = room.gameData;
    gd.phase = 'game-over';
    room.gameState = 'ended';
    
    // Calculate winner
    let fakeArtistWins = false;
    
    if (!wasCaught) {
        fakeArtistWins = true;
    } else if (guessedWord) {
        fakeArtistWins = true;
    }
    
    io.to(room.code).emit('fakeartist-game-over', {
        fakeArtist: gd.fakeArtist,
        fakeArtistWins: fakeArtistWins,
        word: gd.currentWord,
        wasCaught: wasCaught,
        guessedWord: guessedWord,
        canvasData: gd.canvasData,
        players: room.players.map(p => ({
            name: p.name,
            color: gd.playerColors[p.name],
            isFakeArtist: p.name === gd.fakeArtist,
            isPremium: p.isPremium || false,
            cosmetics: p.cosmetics || {}
        }))
    });
    
    console.log(`Fake Artist game ended in room ${room.code}. Fake Artist wins: ${fakeArtistWins}`);
}

// ============================================
// MOST LIKELY TO - Party Game
// ============================================

const MOST_LIKELY_TO_QUESTIONS = {
    fun: [
        "Most likely to become famous",
        "Most likely to win the lottery and lose the ticket",
        "Most likely to sleep through an alarm",
        "Most likely to laugh at the wrong moment",
        "Most likely to trip over nothing",
        "Most likely to forget someone's name",
        "Most likely to binge a whole series in one day",
        "Most likely to go viral on TikTok",
        "Most likely to become a meme",
        "Most likely to text the wrong person",
        "Most likely to eat food off the floor",
        "Most likely to start a dance party",
        "Most likely to get lost in their own city",
        "Most likely to become a reality TV star",
        "Most likely to marry a celebrity"
    ],
    spicy: [
        "Most likely to ghost someone",
        "Most likely to slide into a celebrity's DMs",
        "Most likely to have a secret OnlyFans",
        "Most likely to drunk text an ex",
        "Most likely to date two people at once",
        "Most likely to kiss and tell",
        "Most likely to have a one night stand",
        "Most likely to lie about their body count",
        "Most likely to date someone for money",
        "Most likely to get caught cheating",
        "Most likely to send a risky text to the wrong person",
        "Most likely to have a friends with benefits",
        "Most likely to make out with a stranger",
        "Most likely to have a secret relationship",
        "Most likely to be the side piece"
    ],
    wholesome: [
        "Most likely to become a parent first",
        "Most likely to still be friends in 20 years",
        "Most likely to adopt all the pets",
        "Most likely to start a charity",
        "Most likely to be the best listener",
        "Most likely to drop everything to help a friend",
        "Most likely to remember everyone's birthday",
        "Most likely to be the friend therapist",
        "Most likely to give the best hugs",
        "Most likely to cry happy tears at a wedding",
        "Most likely to become a teacher",
        "Most likely to volunteer the most",
        "Most likely to be the designated driver",
        "Most likely to cook for everyone",
        "Most likely to write heartfelt letters"
    ],
    chaotic: [
        "Most likely to start a fight",
        "Most likely to get kicked out of a bar",
        "Most likely to get arrested",
        "Most likely to do something illegal for fun",
        "Most likely to rage quit",
        "Most likely to cause a scene in public",
        "Most likely to burn down their kitchen",
        "Most likely to make a bad decision",
        "Most likely to get into road rage",
        "Most likely to break something expensive",
        "Most likely to start drama",
        "Most likely to get banned from somewhere",
        "Most likely to do something stupid on a dare",
        "Most likely to say the wrong thing",
        "Most likely to cause chaos at a family dinner"
    ]
};

function initMostLikelyToGame(room, category = 'fun') {
    let questionPool = [];
    
    if (category === 'mixed' || !MOST_LIKELY_TO_QUESTIONS[category]) {
        Object.values(MOST_LIKELY_TO_QUESTIONS).forEach(qs => {
            questionPool = [...questionPool, ...qs];
        });
    } else {
        questionPool = [...MOST_LIKELY_TO_QUESTIONS[category]];
    }
    
    questionPool = questionPool.sort(() => Math.random() - 0.5);
    
    room.gameData = {
        questions: questionPool.slice(0, 10),
        currentQuestionIndex: 0,
        roundNumber: 1,
        maxRounds: 10,
        phase: 'countdown',
        votes: {},
        voteHistory: [],
        timePerRound: 20,
        category: category,
        roleAssignments: {}
    };
    
    console.log(`Most Likely To game initialized in room ${room.code}, category: ${category}`);
}

function startMostLikelyToRound(room, io) {
    const gd = room.gameData;
    const question = gd.questions[gd.currentQuestionIndex];
    
    gd.phase = 'voting';
    gd.votes = {};
    
    io.to(room.code).emit('mostlikelyto-question', {
        question: question,
        roundNumber: gd.roundNumber,
        totalRounds: gd.maxRounds,
        timeLimit: gd.timePerRound,
        players: room.players.map(p => ({
            name: p.name,
            isPremium: p.isPremium || false,
            cosmetics: p.cosmetics || {}
        }))
    });
}

function handleMostLikelyToVote(room, voterName, targetName, io) {
    const gd = room.gameData;
    if (gd.phase !== 'voting') return;
    if (gd.votes[voterName]) return;
    
    gd.votes[voterName] = targetName;
    
    io.to(room.code).emit('mostlikelyto-vote-cast', {
        voterCount: Object.keys(gd.votes).length,
        totalPlayers: room.players.length
    });
    
    if (Object.keys(gd.votes).length === room.players.length) {
        calculateMostLikelyToResults(room, io);
    }
}

function calculateMostLikelyToResults(room, io) {
    const gd = room.gameData;
    gd.phase = 'results';
    
    // Count votes
    const voteCounts = {};
    room.players.forEach(p => { voteCounts[p.name] = 0; });
    
    Object.values(gd.votes).forEach(target => {
        voteCounts[target] = (voteCounts[target] || 0) + 1;
    });
    
    // Find winner(s)
    let maxVotes = 0;
    let winners = [];
    
    Object.entries(voteCounts).forEach(([name, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            winners = [name];
        } else if (count === maxVotes && count > 0) {
            winners.push(name);
        }
    });
    
    // Store result
    gd.voteHistory.push({
        question: gd.questions[gd.currentQuestionIndex],
        votes: { ...gd.votes },
        voteCounts: { ...voteCounts },
        winners: winners
    });
    
    // Build vote breakdown
    const voteBreakdown = room.players.map(p => ({
        name: p.name,
        votedFor: gd.votes[p.name],
        receivedVotes: voteCounts[p.name],
        isWinner: winners.includes(p.name),
        isPremium: p.isPremium || false,
        cosmetics: p.cosmetics || {}
    }));
    
    io.to(room.code).emit('mostlikelyto-results', {
        question: gd.questions[gd.currentQuestionIndex],
        winners: winners,
        voteCounts: voteCounts,
        voteBreakdown: voteBreakdown,
        roundNumber: gd.roundNumber
    });
}

function advanceMostLikelyToRound(room, io) {
    const gd = room.gameData;
    
    gd.currentQuestionIndex++;
    gd.roundNumber++;
    
    if (gd.roundNumber > gd.maxRounds) {
        endMostLikelyToGame(room, io);
    } else {
        setTimeout(() => {
            startMostLikelyToRound(room, io);
        }, 3000);
    }
}

function endMostLikelyToGame(room, io) {
    const gd = room.gameData;
    gd.phase = 'game-over';
    room.gameState = 'ended';
    
    // Count total votes received per player
    const totalVotesReceived = {};
    room.players.forEach(p => { totalVotesReceived[p.name] = 0; });
    
    gd.voteHistory.forEach(round => {
        Object.entries(round.voteCounts).forEach(([name, count]) => {
            totalVotesReceived[name] = (totalVotesReceived[name] || 0) + count;
        });
    });
    
    const leaderboard = room.players.map(p => ({
        name: p.name,
        totalVotes: totalVotesReceived[p.name],
        isPremium: p.isPremium || false,
        cosmetics: p.cosmetics || {}
    })).sort((a, b) => b.totalVotes - a.totalVotes);
    
    io.to(room.code).emit('mostlikelyto-game-over', {
        leaderboard: leaderboard,
        voteHistory: gd.voteHistory,
        mvp: leaderboard[0]?.name
    });
    
    console.log(`Most Likely To game ended in room ${room.code}`);
}

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

module.exports = {
    // Coup (Power Struggle)
    initCoupGame,
    getCoupPlayerState,
    getCoupPublicState,
    checkCoupElimination,
    advanceCoupTurn,
    getAvailableCoupActions,
    resolveCoupAction,
    endCoupGame,
    COUP_ROLES,
    COUP_ACTIONS,
    
    // Word Bomb
    initWordBombGame,
    startWordBombTurn,
    handleWordBombExplosion,
    advanceWordBombTurn,
    validateWordBombAnswer,
    endWordBombGame,
    
    // Ludo
    initLudoGame,
    getLudoCurrentPlayer,
    getLudoState,
    rollLudoDice,
    moveLudoPiece,
    advanceLudoTurn,
    endLudoGame,
    
    // Charades / Heads Up
    initCharadesGame,
    startCharadesTurn,
    handleCharadesGuess,
    handleCharadesSkip,
    endCharadesTurn,
    endCharadesGame,
    CHARADES_WORDS,
    
    // Avalon (Secret Roles)
    initAvalonGame,
    getAvalonPublicState,
    startAvalonTeamProposal,
    handleAvalonTeamProposal,
    handleAvalonTeamVote,
    handleAvalonQuestVote,
    handleAvalonAssassination,
    endAvalonGame,
    
    // Fake Artist
    initFakeArtistGame,
    startFakeArtistRound,
    startFakeArtistDrawing,
    handleFakeArtistDraw,
    handleFakeArtistVote,
    handleFakeArtistWordGuess,
    endFakeArtistGame,
    
    // Most Likely To
    initMostLikelyToGame,
    startMostLikelyToRound,
    handleMostLikelyToVote,
    calculateMostLikelyToResults,
    advanceMostLikelyToRound,
    endMostLikelyToGame,
    MOST_LIKELY_TO_QUESTIONS
};
