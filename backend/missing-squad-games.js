/**
 * MISSING SQUAD GAMES BACKEND HANDLERS - FIXED VERSION
 */

// AVALON
const AVALON_QUEST_SIZES = {5:[2,3,2,3,3],6:[2,3,4,3,4],7:[2,3,3,4,4],8:[3,4,4,5,5],9:[3,4,4,5,5],10:[3,4,4,5,5],11:[3,4,4,5,5],12:[3,4,4,5,5],13:[3,4,4,5,6],14:[3,4,4,5,6],15:[3,4,4,5,6]};
const AVALON_EVIL_COUNT = {5:2,6:2,7:3,8:3,9:3,10:4,11:4,12:4,13:5,14:5,15:5};

function initAvalonGame(room, io) {
  const pc = room.players.length;
  if (pc < 5 || pc > 15) { io.to(room.code).emit('error', { message: 'Avalon requires 5-15 players' }); return; }
  const evilCount = AVALON_EVIL_COUNT[pc] || 2, goodCount = pc - evilCount;
  const shuffled = [...room.players].sort(() => Math.random() - 0.5);
  const roles = ['Assassin'];
  if (pc >= 7) roles.push('Morgana');
  if (pc >= 10) roles.push('Mordred');
  while (roles.length < evilCount) roles.push('Minion');
  const goodRoles = ['Merlin'];
  if (pc >= 7) goodRoles.push('Percival');
  while (goodRoles.length < goodCount) goodRoles.push('Loyal Servant');
  roles.push(...goodRoles);
  const shuffledRoles = roles.sort(() => Math.random() - 0.5);
  const assignments = {}, evilPlayers = [];
  let merlinId = null, assassinId = null;
  shuffled.forEach((p, i) => {
    const role = shuffledRoles[i], team = ['Assassin','Morgana','Mordred','Oberon','Minion'].includes(role) ? 'evil' : 'good';
    assignments[p.id] = { role, team };
    if (team === 'evil' && role !== 'Oberon') evilPlayers.push(p.name);
    if (role === 'Merlin') merlinId = p.id;
    if (role === 'Assassin') assassinId = p.id;
  });
  room.gameState = 'playing';
  room.gameData = { assignments, evilPlayers, merlinId, assassinId, questSizes: AVALON_QUEST_SIZES[pc] || [2,3,2,3,3], currentQuest: 0, questResults: [], leaderIndex: 0, rejections: 0, selectedTeam: [], teamVotes: {}, questVotes: {}, phase: 'team-select' };
  room.players.forEach(player => {
    const { role, team } = assignments[player.id];
    let visibleEvil = [];
    if (role === 'Merlin') visibleEvil = room.players.filter(p => assignments[p.id].team === 'evil' && assignments[p.id].role !== 'Mordred').map(p => p.name);
    else if (team === 'evil' && role !== 'Oberon') visibleEvil = evilPlayers;
    io.to(player.id).emit('avalon-roles', { role, team, evilPlayers: visibleEvil });
  });
  startAvalonTeamSelect(room, io);
}

function startAvalonTeamSelect(room, io) {
  const leader = room.players[room.gameData.leaderIndex];
  const teamSize = room.gameData.questSizes[room.gameData.currentQuest];
  room.gameData.phase = 'team-select'; room.gameData.selectedTeam = []; room.gameData.teamVotes = {};
  io.to(room.code).emit('avalon-team-select', { quest: room.gameData.currentQuest, leader: leader.name, teamSize, rejections: room.gameData.rejections });
}

function handleAvalonProposeTeam(room, team, io) {
  room.gameData.selectedTeam = team; room.gameData.phase = 'team-vote'; room.gameData.teamVotes = {};
  io.to(room.code).emit('avalon-team-vote', { team, leader: room.players[room.gameData.leaderIndex].name });
}

function handleAvalonVote(room, playerId, vote, io) {
  room.gameData.teamVotes[playerId] = vote;
  if (Object.keys(room.gameData.teamVotes).length === room.players.length) {
    const approves = Object.values(room.gameData.teamVotes).filter(v => v === 'approve').length;
    if (approves > room.players.length - approves) {
      room.gameData.phase = 'quest'; room.gameData.questVotes = {};
      io.to(room.code).emit('avalon-quest', { team: room.gameData.selectedTeam, quest: room.gameData.currentQuest });
    } else {
      room.gameData.rejections++;
      io.to(room.code).emit('avalon-team-rejected', { approves, rejects: room.players.length - approves, rejections: room.gameData.rejections });
      if (room.gameData.rejections >= 5) { endAvalonGame(room, 'evil', 'Five team rejections', io); return; }
      room.gameData.leaderIndex = (room.gameData.leaderIndex + 1) % room.players.length;
      setTimeout(() => startAvalonTeamSelect(room, io), 2000);
    }
  }
}

function handleAvalonQuestVote(room, playerId, vote, io) {
  room.gameData.questVotes[playerId] = vote;
  const teamIds = room.players.filter(p => room.gameData.selectedTeam.includes(p.name)).map(p => p.id);
  if (teamIds.filter(id => room.gameData.questVotes[id]).length === teamIds.length) {
    const fails = Object.values(room.gameData.questVotes).filter(v => v === 'fail').length;
    const failsNeeded = (room.gameData.currentQuest === 3 && room.players.length >= 7) ? 2 : 1;
    const success = fails < failsNeeded;
    room.gameData.questResults.push(success ? 'success' : 'fail');
    room.gameData.rejections = 0;
    io.to(room.code).emit('avalon-quest-result', { success, fails, successes: teamIds.length - fails, results: room.gameData.questResults });
    const goodWins = room.gameData.questResults.filter(r => r === 'success').length;
    const evilWins = room.gameData.questResults.filter(r => r === 'fail').length;
    if (goodWins >= 3) endAvalonGame(room, 'good', 'Three successful quests', io);
    else if (evilWins >= 3) endAvalonGame(room, 'evil', 'Three failed quests', io);
    else {
      room.gameData.currentQuest++;
      room.gameData.leaderIndex = (room.gameData.leaderIndex + 1) % room.players.length;
      setTimeout(() => startAvalonTeamSelect(room, io), 3000);
    }
  }
}

function endAvalonGame(room, winner, reason, io) {
  room.gameState = 'ended';
  io.to(room.code).emit('avalon-game-over', { winner, reason, roles: Object.fromEntries(room.players.map(p => [p.name, room.gameData.assignments[p.id]])) });
}

// INSIDER
const INSIDER_WORDS = ['Lighthouse','Parachute','Submarine','Telescope','Trampoline','Volcano','Waterfall','Dinosaur','Astronaut','Helicopter','Pyramid','Compass','Thermometer','Chandelier','Accordion','Escalator','Microphone','Skateboard','Saxophone','Bulldozer'];

function initInsiderGame(room, io) {
  const pc = room.players.length;
  if (pc < 4 || pc > 8) { io.to(room.code).emit('error', { message: 'Insider requires 4-8 players' }); return; }
  const shuffled = [...room.players].sort(() => Math.random() - 0.5);
  const master = shuffled[0], insider = shuffled[1];
  const word = INSIDER_WORDS[Math.floor(Math.random() * INSIDER_WORDS.length)];
  room.gameState = 'playing';
  room.gameData = { masterId: master.id, insiderId: insider.id, word, phase: 'questioning', votes: {} };
  room.players.forEach(p => {
    let role = 'villager', knownWord = null;
    if (p.id === master.id) { role = 'master'; knownWord = word; }
    else if (p.id === insider.id) { role = 'insider'; knownWord = word; }
    io.to(p.id).emit('insider-roles', { role, word: knownWord, master: master.name });
  });
}

function handleInsiderGuess(room, playerId, guess, io) {
  if (room.gameData.phase !== 'questioning') return;
  if (guess.toLowerCase().trim() === room.gameData.word.toLowerCase()) {
    room.gameData.phase = 'voting';
    io.to(room.code).emit('insider-word-found', { word: room.gameData.word, guesser: room.players.find(p => p.id === playerId)?.name });
  }
}

function handleInsiderTimeout(room, io) {
  if (room.gameData.phase !== 'questioning') return;
  room.gameData.phase = 'ended';
  io.to(room.code).emit('insider-timeout', { word: room.gameData.word, insider: room.players.find(p => p.id === room.gameData.insiderId)?.name });
  endInsiderGame(room, 'insider', io);
}

function handleInsiderVote(room, playerId, targetName, io) {
  room.gameData.votes[playerId] = targetName;
  if (Object.keys(room.gameData.votes).length >= room.players.length - 1) {
    const voteCounts = {};
    Object.values(room.gameData.votes).forEach(name => { voteCounts[name] = (voteCounts[name] || 0) + 1; });
    const sorted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
    const topVoted = sorted[0][0], topPlayer = room.players.find(p => p.name === topVoted);
    const foundInsider = topPlayer?.id === room.gameData.insiderId;
    io.to(room.code).emit('insider-results', { votes: voteCounts, insider: room.players.find(p => p.id === room.gameData.insiderId)?.name, foundInsider });
    endInsiderGame(room, foundInsider ? 'villagers' : 'insider', io);
  }
}

function endInsiderGame(room, winner, io) {
  room.gameState = 'ended';
  io.to(room.code).emit('insider-game-over', { winner, word: room.gameData.word, insider: room.players.find(p => p.id === room.gameData.insiderId)?.name, master: room.players.find(p => p.id === room.gameData.masterId)?.name });
}

// WAVELENGTH
const WAVELENGTH_SPECTRUMS = [['Cold','Hot'],['Bad','Good'],['Underrated','Overrated'],['Boring','Exciting'],['Useless','Useful'],['Cheap','Expensive'],['Old','New'],['Safe','Dangerous'],['Simple','Complex'],['Ugly','Beautiful'],['Sad','Happy'],['Slow','Fast'],['Quiet','Loud'],['Small','Large'],['Weak','Strong']];

function initWavelengthGame(room, io) {
  const pc = room.players.length;
  if (pc < 4 || pc > 12) { io.to(room.code).emit('error', { message: 'Wavelength requires 4-12 players' }); return; }
  room.gameState = 'playing';
  room.gameData = { round: 1, maxRounds: Math.min(pc, 8), psychicIndex: 0, scores: {}, targetPosition: 0, spectrum: null, clue: null, guesses: {}, phase: 'clue' };
  room.players.forEach(p => room.gameData.scores[p.id] = 0);
  startWavelengthRound(room, io);
}

function startWavelengthRound(room, io) {
  const spectrum = WAVELENGTH_SPECTRUMS[Math.floor(Math.random() * WAVELENGTH_SPECTRUMS.length)];
  const targetPosition = Math.floor(Math.random() * 100);
  const psychic = room.players[room.gameData.psychicIndex];
  room.gameData.spectrum = spectrum; room.gameData.targetPosition = targetPosition;
  room.gameData.clue = null; room.gameData.guesses = {}; room.gameData.phase = 'clue';
  room.players.forEach(p => {
    io.to(p.id).emit('wavelength-round', {
      round: room.gameData.round, totalRounds: room.gameData.maxRounds, psychic: psychic.name,
      isPsychic: p.id === psychic.id, target: p.id === psychic.id ? targetPosition : null,
      leftLabel: spectrum[0], rightLabel: spectrum[1]
    });
  });
}

function handleWavelengthClue(room, clue, io) {
  room.gameData.clue = clue; room.gameData.phase = 'guessing';
  io.to(room.code).emit('wavelength-clue', { clue, psychic: room.players[room.gameData.psychicIndex].name });
}

function handleWavelengthGuess(room, playerId, guess, io) {
  if (playerId === room.players[room.gameData.psychicIndex].id) return;
  room.gameData.guesses[playerId] = guess;
  if (Object.keys(room.gameData.guesses).length >= room.players.length - 1) calculateWavelengthResults(room, io);
}

function calculateWavelengthResults(room, io) {
  const target = room.gameData.targetPosition, results = [];
  Object.entries(room.gameData.guesses).forEach(([pid, guess]) => {
    const distance = Math.abs(target - guess);
    let points = distance <= 5 ? 4 : distance <= 10 ? 3 : distance <= 20 ? 2 : distance <= 30 ? 1 : 0;
    room.gameData.scores[pid] = (room.gameData.scores[pid] || 0) + points;
    results.push({ name: room.players.find(p => p.id === pid)?.name, guess, points, distance });
  });
  io.to(room.code).emit('wavelength-results', { target, clue: room.gameData.clue, results, scores: Object.fromEntries(room.players.map(p => [p.name, room.gameData.scores[p.id] || 0])) });
  room.gameData.round++;
  if (room.gameData.round > room.gameData.maxRounds) endWavelengthGame(room, io);
  else room.gameData.psychicIndex = (room.gameData.psychicIndex + 1) % room.players.length;
}

function endWavelengthGame(room, io) {
  room.gameState = 'ended';
  const sortedScores = room.players.map(p => ({ name: p.name, score: room.gameData.scores[p.id] || 0 })).sort((a,b) => b.score - a.score);
  io.to(room.code).emit('wavelength-game-over', { winner: sortedScores[0].name, finalScores: sortedScores });
}

// NPAT
const NPAT_LETTERS = 'ABCDEFGHIJKLMNOPRSTW'.split('');

function initNPATGame(room, io) {
  room.gameState = 'playing';
  room.gameData = { round: 1, maxRounds: 5, letter: null, answers: {}, scores: {}, phase: 'playing', timeLimit: 60, categories: ['Name','Place','Animal','Thing'], usedLetters: [] };
  room.players.forEach(p => room.gameData.scores[p.id] = 0);
  startNPATRound(room, io);
}

function startNPATRound(room, io) {
  const availableLetters = NPAT_LETTERS.filter(l => !room.gameData.usedLetters.includes(l));
  const letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
  room.gameData.letter = letter; room.gameData.answers = {}; room.gameData.usedLetters.push(letter); room.gameData.phase = 'playing';
  io.to(room.code).emit('npat-round', { round: room.gameData.round, maxRounds: room.gameData.maxRounds, letter, categories: room.gameData.categories, timeLimit: room.gameData.timeLimit });
}

function handleNPATSubmit(room, playerId, answers, io) {
  room.gameData.answers[playerId] = answers;
  if (Object.keys(room.gameData.answers).length >= room.players.length) calculateNPATResults(room, io);
}

function calculateNPATResults(room, io) {
  const letter = room.gameData.letter.toLowerCase(), results = [];
  room.players.forEach(player => {
    const playerAnswers = room.gameData.answers[player.id] || {};
    let roundScore = 0;
    const answerResults = [];
    room.gameData.categories.forEach(cat => {
      const answer = (playerAnswers[cat] || '').trim();
      let points = 0, valid = false;
      if (answer && answer.toLowerCase().startsWith(letter)) {
        valid = true;
        const otherAnswers = room.players.filter(p => p.id !== player.id).map(p => (room.gameData.answers[p.id]?.[cat] || '').toLowerCase().trim());
        points = otherAnswers.includes(answer.toLowerCase()) ? 5 : 10;
      }
      roundScore += points;
      answerResults.push({ category: cat, answer, points, valid });
    });
    room.gameData.scores[player.id] = (room.gameData.scores[player.id] || 0) + roundScore;
    results.push({ name: player.name, answers: answerResults, roundScore, totalScore: room.gameData.scores[player.id] });
  });
  io.to(room.code).emit('npat-results', { letter: room.gameData.letter, results, round: room.gameData.round });
  room.gameData.round++;
  if (room.gameData.round > room.gameData.maxRounds) endNPATGame(room, io);
}

function endNPATGame(room, io) {
  room.gameState = 'ended';
  const sortedScores = room.players.map(p => ({ name: p.name, score: room.gameData.scores[p.id] || 0 })).sort((a,b) => b.score - a.score);
  io.to(room.code).emit('npat-gameover', { winner: sortedScores[0].name, finalScores: sortedScores });
}

// PUNCHLINE
const PUNCHLINE_PROMPTS = ["Why did the chicken cross the road?","What do you call a fish without eyes?","Why don't scientists trust atoms?","What did the ocean say to the beach?","Why did the scarecrow win an award?","What do you call a fake noodle?","Why did the bicycle fall over?","What do you call a bear with no teeth?","Why can't you give Elsa a balloon?","What do you call a sleeping dinosaur?"];

function initPunchlineGame(room, io) {
  room.gameState = 'playing';
  room.gameData = { round: 1, maxRounds: Math.min(room.players.length, 8), prompt: null, answers: {}, votes: {}, scores: {}, phase: 'answering', usedPrompts: [], shuffledAnswers: [] };
  room.players.forEach(p => room.gameData.scores[p.id] = 0);
  startPunchlineRound(room, io);
}

function startPunchlineRound(room, io) {
  const available = PUNCHLINE_PROMPTS.filter(p => !room.gameData.usedPrompts.includes(p));
  const prompt = available[Math.floor(Math.random() * available.length)];
  room.gameData.prompt = prompt; room.gameData.usedPrompts.push(prompt);
  room.gameData.answers = {}; room.gameData.votes = {}; room.gameData.phase = 'answering';
  io.to(room.code).emit('punchline-prompt', { round: room.gameData.round, maxRounds: room.gameData.maxRounds, prompt, timeLimit: 60 });
}

function handlePunchlineAnswer(room, playerId, answer, io) {
  room.gameData.answers[playerId] = answer;
  io.to(room.code).emit('punchline-answer-received', { playerName: room.players.find(p => p.id === playerId)?.name, answeredCount: Object.keys(room.gameData.answers).length, totalPlayers: room.players.length });
  if (Object.keys(room.gameData.answers).length >= room.players.length) startPunchlineVoting(room, io);
}

function startPunchlineVoting(room, io) {
  room.gameData.phase = 'voting';
  const shuffledAnswers = Object.entries(room.gameData.answers).map(([id, answer], index) => ({ id, answer, index })).sort(() => Math.random() - 0.5);
  room.gameData.shuffledAnswers = shuffledAnswers;
  io.to(room.code).emit('punchline-voting', { prompt: room.gameData.prompt, answers: shuffledAnswers.map(a => ({ index: a.index, answer: a.answer })), timeLimit: 30 });
}

function handlePunchlineVote(room, playerId, answerIndex, io) {
  const votedAnswer = room.gameData.shuffledAnswers.find(a => a.index === answerIndex);
  if (votedAnswer?.id === playerId) return;
  room.gameData.votes[playerId] = answerIndex;
  if (Object.keys(room.gameData.votes).length >= room.players.length) calculatePunchlineResults(room, io);
}

function calculatePunchlineResults(room, io) {
  const voteCounts = {};
  Object.values(room.gameData.votes).forEach(index => { voteCounts[index] = (voteCounts[index] || 0) + 1; });
  const results = room.gameData.shuffledAnswers.map(a => {
    const votes = voteCounts[a.index] || 0, points = votes * 100;
    room.gameData.scores[a.id] = (room.gameData.scores[a.id] || 0) + points;
    return { name: room.players.find(p => p.id === a.id)?.name, answer: a.answer, votes, points };
  }).sort((a,b) => b.votes - a.votes);
  io.to(room.code).emit('punchline-results', { prompt: room.gameData.prompt, results, scores: Object.fromEntries(room.players.map(p => [p.name, room.gameData.scores[p.id] || 0])) });
  room.gameData.round++;
  if (room.gameData.round > room.gameData.maxRounds) endPunchlineGame(room, io);
}

function endPunchlineGame(room, io) {
  room.gameState = 'ended';
  const sortedScores = room.players.map(p => ({ name: p.name, score: room.gameData.scores[p.id] || 0 })).sort((a,b) => b.score - a.score);
  io.to(room.code).emit('punchline-game-over', { winner: sortedScores[0].name, finalScores: sortedScores });
}

// BROKEN PICTIONARY
const BP_WORDS = ['Elephant','Pizza','Rocket','Superhero','Dancing','Surfing','Birthday','Fireworks','Camping','Robot','Dinosaur','Castle','Pirate','Mermaid','Volcano','Treehouse','Rainbow','Spaceship','Unicorn','Dragon'];

function initBrokenPictionaryGame(room, io) {
  room.gameState = 'playing';
  const shuffledWords = [...BP_WORDS].sort(() => Math.random() - 0.5);
  room.gameData = { chains: {}, currentStep: 1, totalSteps: room.players.length, phase: 'drawing', playerOrder: [...room.players].sort(() => Math.random() - 0.5), submitted: {} };
  room.gameData.playerOrder.forEach((p, i) => {
    const word = shuffledWords[i % shuffledWords.length];
    room.gameData.chains[p.id] = [{ type: 'word', content: word, author: 'system' }];
    io.to(p.id).emit('bp-draw', { prompt: word, step: 1, totalSteps: room.gameData.totalSteps, timeLimit: 60 });
  });
}

function handleBPSubmitDrawing(room, playerId, drawing, io) {
  if (room.gameData.submitted[playerId]) return;
  room.gameData.submitted[playerId] = true;
  const playerIndex = room.gameData.playerOrder.findIndex(p => p.id === playerId);
  const chainIndex = (playerIndex - room.gameData.currentStep + 1 + room.gameData.totalSteps) % room.gameData.totalSteps;
  const chainOwner = room.gameData.playerOrder[chainIndex];
  room.gameData.chains[chainOwner.id].push({ type: 'drawing', content: drawing, author: playerId });
  checkBPStepComplete(room, io);
}

function handleBPSubmitGuess(room, playerId, guess, io) {
  if (room.gameData.submitted[playerId]) return;
  room.gameData.submitted[playerId] = true;
  const playerIndex = room.gameData.playerOrder.findIndex(p => p.id === playerId);
  const chainIndex = (playerIndex - room.gameData.currentStep + 1 + room.gameData.totalSteps) % room.gameData.totalSteps;
  const chainOwner = room.gameData.playerOrder[chainIndex];
  room.gameData.chains[chainOwner.id].push({ type: 'word', content: guess, author: playerId });
  checkBPStepComplete(room, io);
}

function checkBPStepComplete(room, io) {
  if (Object.keys(room.gameData.submitted).length < room.players.length) return;
  room.gameData.currentStep++; room.gameData.submitted = {};
  if (room.gameData.currentStep > room.gameData.totalSteps) { endBrokenPictionaryGame(room, io); return; }
  const isDrawingStep = room.gameData.currentStep % 2 === 1;
  room.gameData.playerOrder.forEach((p, pIdx) => {
    const chainIndex = (pIdx - room.gameData.currentStep + 1 + room.gameData.totalSteps) % room.gameData.totalSteps;
    const chainOwner = room.gameData.playerOrder[chainIndex];
    const chain = room.gameData.chains[chainOwner.id], lastItem = chain[chain.length - 1];
    if (isDrawingStep) io.to(p.id).emit('bp-draw', { prompt: lastItem.content, step: room.gameData.currentStep, totalSteps: room.gameData.totalSteps, timeLimit: 60 });
    else io.to(p.id).emit('bp-guess', { drawing: lastItem.content, step: room.gameData.currentStep, totalSteps: room.gameData.totalSteps, timeLimit: 45 });
  });
}

function endBrokenPictionaryGame(room, io) {
  room.gameState = 'ended';
  const chains = Object.entries(room.gameData.chains).map(([ownerId, chain]) => ({
    owner: room.players.find(p => p.id === ownerId)?.name, originalWord: chain[0].content, finalGuess: chain[chain.length - 1].content,
    steps: chain.map(item => ({ type: item.type, content: item.content, author: item.author === 'system' ? 'System' : room.players.find(p => p.id === item.author)?.name }))
  }));
  io.to(room.code).emit('bp-game-over', { chains });
}

// DOODLE DUEL
const DD_PROMPTS = ['A cat wearing a hat','An angry pizza','A robot dancing','A sad cloud','A superhero potato','A sleepy sun','A confused octopus','A fancy penguin','A singing tree','A nervous ghost','A tired coffee cup','A happy volcano'];

function initDoodleDuelGame(room, io) {
  room.gameState = 'playing';
  room.gameData = { round: 1, maxRounds: Math.min(room.players.length, 6), artistIndex: 0, prompt: null, drawings: {}, fakeDrawing: null, votes: {}, scores: {}, phase: 'drawing', shuffledDrawings: [] };
  room.players.forEach(p => room.gameData.scores[p.id] = 0);
  startDoodleDuelRound(room, io);
}

function startDoodleDuelRound(room, io) {
  const prompt = DD_PROMPTS[Math.floor(Math.random() * DD_PROMPTS.length)];
  const artist = room.players[room.gameData.artistIndex];
  room.gameData.prompt = prompt; room.gameData.drawings = {}; room.gameData.fakeDrawing = null; room.gameData.votes = {}; room.gameData.phase = 'drawing';
  room.players.forEach(p => { io.to(p.id).emit('dd-draw', { round: room.gameData.round, maxRounds: room.gameData.maxRounds, prompt, isArtist: p.id === artist.id, artist: artist.name, timeLimit: 60 }); });
}

function handleDDSubmitDrawing(room, playerId, drawing, io) {
  room.gameData.drawings[playerId] = drawing;
  if (Object.keys(room.gameData.drawings).length >= room.players.length) {
    const artist = room.players[room.gameData.artistIndex];
    room.gameData.phase = 'fake';
    io.to(artist.id).emit('dd-fake', { prompt: room.gameData.prompt, timeLimit: 45 });
    room.players.filter(p => p.id !== artist.id).forEach(p => { io.to(p.id).emit('dd-waiting', { message: artist.name + ' is creating a decoy...' }); });
  }
}

function handleDDSubmitFake(room, playerId, fakeDrawing, io) {
  if (playerId !== room.players[room.gameData.artistIndex].id) return;
  room.gameData.fakeDrawing = fakeDrawing; room.gameData.phase = 'voting';
  const allDrawings = Object.entries(room.gameData.drawings).map(([id, drawing]) => ({ id, drawing, isFake: false }));
  allDrawings.push({ id: 'fake', drawing: fakeDrawing, isFake: true });
  const shuffled = allDrawings.sort(() => Math.random() - 0.5);
  room.gameData.shuffledDrawings = shuffled;
  io.to(room.code).emit('dd-vote', { prompt: room.gameData.prompt, drawings: shuffled.map((d, i) => ({ index: i, drawing: d.drawing })), artist: room.players[room.gameData.artistIndex].name, timeLimit: 30 });
}

function handleDDVote(room, playerId, drawingIndex, io) {
  if (playerId === room.players[room.gameData.artistIndex].id) return;
  room.gameData.votes[playerId] = drawingIndex;
  if (Object.keys(room.gameData.votes).length >= room.players.length - 1) calculateDDResults(room, io);
}

function calculateDDResults(room, io) {
  const artist = room.players[room.gameData.artistIndex], shuffled = room.gameData.shuffledDrawings;
  const fakeIndex = shuffled.findIndex(d => d.isFake);
  const votesForFake = Object.values(room.gameData.votes).filter(v => v === fakeIndex).length;
  room.gameData.scores[artist.id] = (room.gameData.scores[artist.id] || 0) + (votesForFake * 100);
  Object.entries(room.gameData.votes).forEach(([pid, vote]) => { if (vote !== fakeIndex) room.gameData.scores[pid] = (room.gameData.scores[pid] || 0) + 50; });
  const results = room.players.map(p => ({ name: p.name, score: room.gameData.scores[p.id] || 0, isArtist: p.id === artist.id })).sort((a,b) => b.score - a.score);
  io.to(room.code).emit('dd-results', { fakeIndex, votesForFake, artist: artist.name, results, drawings: shuffled });
  room.gameData.round++; room.gameData.artistIndex = (room.gameData.artistIndex + 1) % room.players.length;
  if (room.gameData.round > room.gameData.maxRounds) endDoodleDuelGame(room, io);
}

function endDoodleDuelGame(room, io) {
  room.gameState = 'ended';
  const sortedScores = room.players.map(p => ({ name: p.name, score: room.gameData.scores[p.id] || 0 })).sort((a,b) => b.score - a.score);
  io.to(room.code).emit('dd-game-over', { winner: sortedScores[0].name, finalScores: sortedScores });
}

// TWO TRUTHS
function initTwoTruthsGame(room, io) {
  room.gameState = 'playing';
  room.gameData = { round: 1, maxRounds: room.players.length, currentPlayerIndex: 0, statements: {}, lieIndex: {}, votes: {}, scores: {}, phase: 'writing' };
  room.players.forEach(p => room.gameData.scores[p.id] = 0);
  startTwoTruthsRound(room, io);
}

function startTwoTruthsRound(room, io) {
  const currentPlayer = room.players[room.gameData.currentPlayerIndex];
  room.gameData.votes = {}; room.gameData.phase = 'writing';
  room.players.forEach(p => { io.to(p.id).emit('twotruths-write', { round: room.gameData.round, maxRounds: room.gameData.maxRounds, isYourTurn: p.id === currentPlayer.id, currentPlayer: currentPlayer.name, timeLimit: 90 }); });
}

function handleTwoTruthsSubmit(room, playerId, statements, lieIndex, io) {
  room.gameData.statements[playerId] = statements; room.gameData.lieIndex[playerId] = lieIndex; room.gameData.phase = 'voting';
  io.to(room.code).emit('twotruths-vote', { currentPlayer: room.players.find(p => p.id === playerId)?.name, statements, timeLimit: 30 });
}

function handleTwoTruthsVote(room, playerId, voteIndex, io) {
  const currentPlayer = room.players[room.gameData.currentPlayerIndex];
  if (playerId === currentPlayer.id) return;
  room.gameData.votes[playerId] = voteIndex;
  io.to(room.code).emit('twotruths-vote-update', { votedCount: Object.keys(room.gameData.votes).length, totalVoters: room.players.length - 1 });
  if (Object.keys(room.gameData.votes).length >= room.players.length - 1) calculateTwoTruthsResults(room, io);
}

function calculateTwoTruthsResults(room, io) {
  const currentPlayer = room.players[room.gameData.currentPlayerIndex];
  const lieIndex = room.gameData.lieIndex[currentPlayer.id];
  let correctGuesses = 0;
  const voteResults = {};
  Object.entries(room.gameData.votes).forEach(([voterId, vote]) => {
    const correct = vote === lieIndex;
    if (correct) { correctGuesses++; room.gameData.scores[voterId] = (room.gameData.scores[voterId] || 0) + 100; }
    voteResults[room.players.find(p => p.id === voterId)?.name] = { vote, correct };
  });
  const fooled = room.players.length - 1 - correctGuesses;
  room.gameData.scores[currentPlayer.id] = (room.gameData.scores[currentPlayer.id] || 0) + (fooled * 100);
  io.to(room.code).emit('twotruths-results', { currentPlayer: currentPlayer.name, statements: room.gameData.statements[currentPlayer.id], lieIndex, voteResults, correctGuesses, fooled, scores: Object.fromEntries(room.players.map(p => [p.name, room.gameData.scores[p.id] || 0])) });
  room.gameData.round++; room.gameData.currentPlayerIndex = (room.gameData.currentPlayerIndex + 1) % room.players.length;
  if (room.gameData.round > room.gameData.maxRounds) endTwoTruthsGame(room, io);
}

function endTwoTruthsGame(room, io) {
  room.gameState = 'ended';
  const sortedScores = room.players.map(p => ({ name: p.name, score: room.gameData.scores[p.id] || 0 })).sort((a,b) => b.score - a.score);
  io.to(room.code).emit('twotruths-game-over', { winner: sortedScores[0].name, finalScores: sortedScores });
}

// CELEBRITY (uses A/B teams to match frontend)
function initCelebrityGame(room, io) {
  room.gameState = 'playing';
  room.gameData = { phase: 'submitting', words: [], submittedWords: {}, wordsPerPlayer: 3, teams: { A: [], B: [] }, scores: { A: 0, B: 0 }, currentRound: 1, maxRounds: 3, currentTeam: 'A', currentPlayerIndex: { A: 0, B: 0 }, currentWord: null, remainingWords: [], timePerTurn: 60 };
  const shuffled = [...room.players].sort(() => Math.random() - 0.5);
  shuffled.forEach((p, i) => { room.gameData.teams[i % 2 === 0 ? 'A' : 'B'].push(p); });
  io.to(room.code).emit('celeb-teams', { teamA: room.gameData.teams.A.map(p => p.name), teamB: room.gameData.teams.B.map(p => p.name), wordsPerPlayer: room.gameData.wordsPerPlayer });
  room.players.forEach(p => { io.to(p.id).emit('celeb-submit-words', { count: room.gameData.wordsPerPlayer }); });
}

function handleCelebritySubmitWords(room, playerId, words, io) {
  room.gameData.submittedWords[playerId] = words;
  io.to(room.code).emit('celeb-word-count', { submitted: Object.keys(room.gameData.submittedWords).length, total: room.players.length });
  if (Object.keys(room.gameData.submittedWords).length >= room.players.length) {
    room.gameData.words = Object.values(room.gameData.submittedWords).flat();
    room.gameData.remainingWords = [...room.gameData.words].sort(() => Math.random() - 0.5);
    startCelebrityRound(room, io);
  }
}

function startCelebrityRound(room, io) {
  room.gameData.remainingWords = [...room.gameData.words].sort(() => Math.random() - 0.5);
  io.to(room.code).emit('celeb-round', { round: room.gameData.currentRound, scoreA: room.gameData.scores.A, scoreB: room.gameData.scores.B, totalWords: room.gameData.remainingWords.length });
  startCelebrityTurn(room, io);
}

function startCelebrityTurn(room, io) {
  if (room.gameData.remainingWords.length === 0) { endCelebrityRound(room, io); return; }
  const team = room.gameData.currentTeam, teamPlayers = room.gameData.teams[team], playerIndex = room.gameData.currentPlayerIndex[team], currentPlayer = teamPlayers[playerIndex];
  room.gameData.currentWord = room.gameData.remainingWords[0]; room.gameData.phase = 'playing';
  io.to(currentPlayer.id).emit('celeb-word', { word: room.gameData.currentWord });
  io.to(room.code).emit('celeb-turn', { team, clueGiver: currentPlayer.name, timeLimit: room.gameData.timePerTurn, remainingWords: room.gameData.remainingWords.length, round: room.gameData.currentRound });
}

function handleCelebrityCorrect(room, io) {
  const team = room.gameData.currentTeam;
  room.gameData.scores[team]++; room.gameData.remainingWords.shift();
  io.to(room.code).emit('celeb-score', { scoreA: room.gameData.scores.A, scoreB: room.gameData.scores.B, lastWord: room.gameData.currentWord, remainingWords: room.gameData.remainingWords.length });
  if (room.gameData.remainingWords.length > 0) {
    room.gameData.currentWord = room.gameData.remainingWords[0];
    const teamPlayers = room.gameData.teams[team], playerIndex = room.gameData.currentPlayerIndex[team], currentPlayer = teamPlayers[playerIndex];
    io.to(currentPlayer.id).emit('celeb-word', { word: room.gameData.currentWord });
  }
}

function handleCelebritySkip(room, io) {
  const word = room.gameData.remainingWords.shift(); room.gameData.remainingWords.push(word);
  room.gameData.currentWord = room.gameData.remainingWords[0];
  const team = room.gameData.currentTeam, teamPlayers = room.gameData.teams[team], playerIndex = room.gameData.currentPlayerIndex[team], currentPlayer = teamPlayers[playerIndex];
  io.to(currentPlayer.id).emit('celeb-word', { word: room.gameData.currentWord });
}

function handleCelebrityTimeUp(room, io) {
  const team = room.gameData.currentTeam;
  room.gameData.currentPlayerIndex[team] = (room.gameData.currentPlayerIndex[team] + 1) % room.gameData.teams[team].length;
  room.gameData.currentTeam = team === 'A' ? 'B' : 'A';
  io.to(room.code).emit('celeb-turn-end', { scoreA: room.gameData.scores.A, scoreB: room.gameData.scores.B });
  if (room.gameData.remainingWords.length > 0) startCelebrityTurn(room, io);
  else endCelebrityRound(room, io);
}

function endCelebrityRound(room, io) {
  io.to(room.code).emit('celeb-round-end', { round: room.gameData.currentRound, scoreA: room.gameData.scores.A, scoreB: room.gameData.scores.B });
  room.gameData.currentRound++;
  if (room.gameData.currentRound > room.gameData.maxRounds) endCelebrityGame(room, io);
  else setTimeout(() => startCelebrityRound(room, io), 3000);
}

function endCelebrityGame(room, io) {
  room.gameState = 'ended';
  const winner = room.gameData.scores.A > room.gameData.scores.B ? 'A' : room.gameData.scores.B > room.gameData.scores.A ? 'B' : 'tie';
  io.to(room.code).emit('celeb-game-over', { winner, scoreA: room.gameData.scores.A, scoreB: room.gameData.scores.B, teamA: room.gameData.teams.A.map(p => p.name), teamB: room.gameData.teams.B.map(p => p.name) });
}

// FISHBOWL (same as Celebrity)
function initFishbowlGame(room, io) { initCelebrityGame(room, io); }

// SOCKET HANDLERS
function setupMissingSquadGameHandlers(io, socket, rooms, players) {
  socket.on('avalon-start', ({ roomCode }) => { const room = rooms.get(roomCode); if (room) initAvalonGame(room, io); });
  socket.on('avalon-propose-team', ({ roomCode, team }) => { const room = rooms.get(roomCode); if (room?.gameData) handleAvalonProposeTeam(room, team, io); });
  socket.on('avalon-vote', ({ roomCode, vote }) => { const room = rooms.get(roomCode); if (room?.gameData) handleAvalonVote(room, socket.id, vote, io); });
  socket.on('avalon-quest-vote', ({ roomCode, vote }) => { const room = rooms.get(roomCode); if (room?.gameData) handleAvalonQuestVote(room, socket.id, vote, io); });
  socket.on('avalon-next', ({ roomCode }) => { const room = rooms.get(roomCode); if (room?.gameData) startAvalonTeamSelect(room, io); });
  
  socket.on('insider-start', ({ roomCode }) => { const room = rooms.get(roomCode); if (room) initInsiderGame(room, io); });
  socket.on('insider-guess', ({ roomCode, guess }) => { const room = rooms.get(roomCode); if (room?.gameData) handleInsiderGuess(room, socket.id, guess, io); });
  socket.on('insider-timeout', ({ roomCode }) => { const room = rooms.get(roomCode); if (room?.gameData) handleInsiderTimeout(room, io); });
  socket.on('insider-vote', ({ roomCode, target }) => { const room = rooms.get(roomCode); if (room?.gameData) handleInsiderVote(room, socket.id, target, io); });
  socket.on('insider-next', ({ roomCode }) => { const room = rooms.get(roomCode); if (room) initInsiderGame(room, io); });
  
  socket.on('wavelength-start', ({ roomCode }) => { const room = rooms.get(roomCode); if (room) initWavelengthGame(room, io); });
  socket.on('wavelength-clue', ({ roomCode, clue }) => { const room = rooms.get(roomCode); if (room?.gameData) handleWavelengthClue(room, clue, io); });
  socket.on('wavelength-guess', ({ roomCode, guess }) => { const room = rooms.get(roomCode); if (room?.gameData) handleWavelengthGuess(room, socket.id, guess, io); });
  socket.on('wavelength-next', ({ roomCode }) => { const room = rooms.get(roomCode); if (room?.gameData) startWavelengthRound(room, io); });
  
  socket.on('npat-start', ({ roomCode }) => { const room = rooms.get(roomCode); if (room) initNPATGame(room, io); });
  socket.on('npat-submit', ({ roomCode, answers }) => { const room = rooms.get(roomCode); if (room?.gameData) handleNPATSubmit(room, socket.id, answers, io); });
  socket.on('npat-timeout', ({ roomCode }) => { const room = rooms.get(roomCode); if (room?.gameData) calculateNPATResults(room, io); });
  socket.on('npat-next', ({ roomCode }) => { const room = rooms.get(roomCode); if (room?.gameData) startNPATRound(room, io); });
  
  socket.on('punchline-start', ({ roomCode }) => { const room = rooms.get(roomCode); if (room) initPunchlineGame(room, io); });
  socket.on('punchline-answer', ({ roomCode, answer }) => { const room = rooms.get(roomCode); if (room?.gameData) handlePunchlineAnswer(room, socket.id, answer, io); });
  socket.on('punchline-vote', ({ roomCode, answerIndex }) => { const room = rooms.get(roomCode); if (room?.gameData) handlePunchlineVote(room, socket.id, answerIndex, io); });
  socket.on('punchline-next', ({ roomCode }) => { const room = rooms.get(roomCode); if (room?.gameData) startPunchlineRound(room, io); });
  
  socket.on('bp-start', ({ roomCode }) => { const room = rooms.get(roomCode); if (room) initBrokenPictionaryGame(room, io); });
  socket.on('bp-submit-drawing', ({ roomCode, drawing }) => { const room = rooms.get(roomCode); if (room?.gameData) handleBPSubmitDrawing(room, socket.id, drawing, io); });
  socket.on('bp-submit-guess', ({ roomCode, guess }) => { const room = rooms.get(roomCode); if (room?.gameData) handleBPSubmitGuess(room, socket.id, guess, io); });
  
  socket.on('dd-start', ({ roomCode }) => { const room = rooms.get(roomCode); if (room) initDoodleDuelGame(room, io); });
  socket.on('dd-submit-drawing', ({ roomCode, drawing }) => { const room = rooms.get(roomCode); if (room?.gameData) handleDDSubmitDrawing(room, socket.id, drawing, io); });
  socket.on('dd-submit-fake', ({ roomCode, drawing }) => { const room = rooms.get(roomCode); if (room?.gameData) handleDDSubmitFake(room, socket.id, drawing, io); });
  socket.on('dd-vote', ({ roomCode, drawingIndex }) => { const room = rooms.get(roomCode); if (room?.gameData) handleDDVote(room, socket.id, drawingIndex, io); });
  socket.on('dd-next', ({ roomCode }) => { const room = rooms.get(roomCode); if (room?.gameData) startDoodleDuelRound(room, io); });
  
  socket.on('twotruths-start', ({ roomCode }) => { const room = rooms.get(roomCode); if (room) initTwoTruthsGame(room, io); });
  socket.on('twotruths-submit', ({ roomCode, statements, lieIndex }) => { const room = rooms.get(roomCode); if (room?.gameData) handleTwoTruthsSubmit(room, socket.id, statements, lieIndex, io); });
  socket.on('twotruths-vote', ({ roomCode, voteIndex }) => { const room = rooms.get(roomCode); if (room?.gameData) handleTwoTruthsVote(room, socket.id, voteIndex, io); });
  socket.on('twotruths-next', ({ roomCode }) => { const room = rooms.get(roomCode); if (room?.gameData) startTwoTruthsRound(room, io); });
  
  socket.on('celeb-start', ({ roomCode }) => { const room = rooms.get(roomCode); if (room) initCelebrityGame(room, io); });
  socket.on('celeb-submit-words', ({ roomCode, words }) => { const room = rooms.get(roomCode); if (room?.gameData) handleCelebritySubmitWords(room, socket.id, words, io); });
  socket.on('celeb-correct', ({ roomCode }) => { const room = rooms.get(roomCode); if (room?.gameData) handleCelebrityCorrect(room, io); });
  socket.on('celeb-skip', ({ roomCode }) => { const room = rooms.get(roomCode); if (room?.gameData) handleCelebritySkip(room, io); });
  socket.on('celeb-time-up', ({ roomCode }) => { const room = rooms.get(roomCode); if (room?.gameData) handleCelebrityTimeUp(room, io); });
  socket.on('celeb-next', ({ roomCode }) => { const room = rooms.get(roomCode); if (room?.gameData) startCelebrityTurn(room, io); });
  socket.on('fishbowl-start', ({ roomCode }) => { const room = rooms.get(roomCode); if (room) initFishbowlGame(room, io); });
}

module.exports = {
  initAvalonGame, startAvalonTeamSelect, handleAvalonProposeTeam, handleAvalonVote, handleAvalonQuestVote, endAvalonGame,
  initInsiderGame, handleInsiderGuess, handleInsiderTimeout, handleInsiderVote, endInsiderGame,
  initWavelengthGame, startWavelengthRound, handleWavelengthClue, handleWavelengthGuess, calculateWavelengthResults, endWavelengthGame,
  initNPATGame, startNPATRound, handleNPATSubmit, calculateNPATResults, endNPATGame,
  initPunchlineGame, startPunchlineRound, handlePunchlineAnswer, startPunchlineVoting, handlePunchlineVote, calculatePunchlineResults, endPunchlineGame,
  initBrokenPictionaryGame, handleBPSubmitDrawing, handleBPSubmitGuess, checkBPStepComplete, endBrokenPictionaryGame,
  initDoodleDuelGame, startDoodleDuelRound, handleDDSubmitDrawing, handleDDSubmitFake, handleDDVote, calculateDDResults, endDoodleDuelGame,
  initTwoTruthsGame, startTwoTruthsRound, handleTwoTruthsSubmit, handleTwoTruthsVote, calculateTwoTruthsResults, endTwoTruthsGame,
  initCelebrityGame, handleCelebritySubmitWords, startCelebrityRound, startCelebrityTurn, handleCelebrityCorrect, handleCelebritySkip, handleCelebrityTimeUp, endCelebrityRound, endCelebrityGame,
  initFishbowlGame, setupMissingSquadGameHandlers
};
