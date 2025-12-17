// party-games.js - Separate module for party games
// Place this file in the same directory as server.js

// QUESTION BANKS
const triviaQuestions = [
  { question: "What year did the first iPhone release?", options: ["2005", "2006", "2007", "2008"], correct: 2 },
  { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
  { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2 },
  { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], correct: 2 },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
  { question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2 },
  { question: "Which company created the PlayStation?", options: ["Nintendo", "Microsoft", "Sony", "Sega"], correct: 2 },
  { question: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], correct: 1 },
  { question: "What is the hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Platinum"], correct: 2 },
  { question: "What is the largest mammal?", options: ["Elephant", "Blue Whale", "Giraffe", "Hippo"], correct: 1 },
  { question: "Who is the CEO of Tesla?", options: ["Jeff Bezos", "Tim Cook", "Elon Musk", "Bill Gates"], correct: 2 },
  { question: "What year did Titanic sink?", options: ["1910", "1911", "1912", "1913"], correct: 2 },
  { question: "What is the currency of Japan?", options: ["Yuan", "Won", "Yen", "Ringgit"], correct: 2 },
  { question: "Who directed Inception?", options: ["Spielberg", "Nolan", "Cameron", "Scorsese"], correct: 1 },
  { question: "Which band sang Bohemian Rhapsody?", options: ["Beatles", "Led Zeppelin", "Queen", "Pink Floyd"], correct: 2 }
];

const thisOrThatQuestions = [
  { optionA: "Netflix", optionB: "YouTube" },
  { optionA: "Morning Person", optionB: "Night Owl" },
  { optionA: "Dogs", optionB: "Cats" },
  { optionA: "Pizza", optionB: "Burgers" },
  { optionA: "Beach", optionB: "Mountains" },
  { optionA: "Summer", optionB: "Winter" },
  { optionA: "Coffee", optionB: "Tea" },
  { optionA: "iOS", optionB: "Android" },
  { optionA: "Books", optionB: "Movies" },
  { optionA: "Invisibility", optionB: "Flight" },
  { optionA: "City Life", optionB: "Country Life" },
  { optionA: "Texting", optionB: "Calling" },
  { optionA: "Marvel", optionB: "DC" },
  { optionA: "Instagram", optionB: "TikTok" },
  { optionA: "Coke", optionB: "Pepsi" }
];

const hotTakesQuestions = [
  { statement: "Pineapple belongs on pizza" },
  { statement: "Social media has done more harm than good" },
  { statement: "The book is always better than the movie" },
  { statement: "Working from home is better than office work" },
  { statement: "Everyone should learn to code" },
  { statement: "AI will take most jobs" },
  { statement: "Cereal is a soup" },
  { statement: "Hot dogs are sandwiches" },
  { statement: "Monday is the worst day" },
  { statement: "Money can buy happiness" },
  { statement: "Tipping culture has gone too far" },
  { statement: "Die Hard is a Christmas movie" },
  { statement: "Crocs are fashionable" },
  { statement: "Reality TV is actually entertaining" },
  { statement: "Water is the best drink" }
];

const neverEverQuestions = [
  { statement: "Never have I ever ghosted someone" },
  { statement: "Never have I ever pretended to be sick to skip work/school" },
  { statement: "Never have I ever stalked an ex on social media" },
  { statement: "Never have I ever eaten food off the floor" },
  { statement: "Never have I ever lied on my resume" },
  { statement: "Never have I ever binged an entire TV series in one day" },
  { statement: "Never have I ever regifted a present" },
  { statement: "Never have I ever cried during a movie" },
  { statement: "Never have I ever sent a text to the wrong person" },
  { statement: "Never have I ever pulled an all-nighter" },
  { statement: "Never have I ever had a crush on a fictional character" },
  { statement: "Never have I ever eaten an entire pizza by myself" },
  { statement: "Never have I ever waved at someone who wasn't waving at me" },
  { statement: "Never have I ever talked to myself out loud" },
  { statement: "Never have I ever laughed at an inappropriate time" }
];

const betOrBluffQuestions = [
  { question: "How many hours of sleep did you get last night?", unit: "hours" },
  { question: "How many unread emails do you have?", unit: "emails" },
  { question: "How many times do you check your phone per day?", unit: "times" },
  { question: "How many pairs of shoes do you own?", unit: "pairs" },
  { question: "How many countries have you visited?", unit: "countries" },
  { question: "How many apps are on your phone?", unit: "apps" },
  { question: "How many books did you read last year?", unit: "books" },
  { question: "How many alarms do you set in the morning?", unit: "alarms" },
  { question: "How many streaming services do you have?", unit: "services" },
  { question: "How many close friends do you have?", unit: "friends" },
  { question: "How many tattoos do you have?", unit: "tattoos" },
  { question: "How many languages can you speak?", unit: "languages" },
  { question: "How many browser tabs are open right now?", unit: "tabs" },
  { question: "How many plants do you own?", unit: "plants" },
  { question: "How many concerts have you attended?", unit: "concerts" }
];

// INIT FUNCTIONS
function initTriviaRoyaleGame(room) {
  room.gameData = {
    questions: [...triviaQuestions].sort(() => Math.random() - 0.5),
    currentQuestionIndex: 0, roundNumber: 1, maxRounds: 10,
    phase: 'countdown', answers: {}, scores: {}, streaks: {},
    timePerQuestion: 15, roleAssignments: {}
  };
  room.players.forEach(p => { room.gameData.scores[p.name] = 0; room.gameData.streaks[p.name] = 0; });
}

function initThisOrThatPartyGame(room) {
  room.gameData = {
    questions: [...thisOrThatQuestions].sort(() => Math.random() - 0.5),
    currentQuestionIndex: 0, roundNumber: 1, maxRounds: 10,
    phase: 'countdown', votes: {}, scores: {}, timePerRound: 15, roleAssignments: {}
  };
  room.players.forEach(p => { room.gameData.scores[p.name] = 0; });
}

function initHotTakesPartyGame(room) {
  room.gameData = {
    questions: [...hotTakesQuestions].sort(() => Math.random() - 0.5),
    currentQuestionIndex: 0, roundNumber: 1, maxRounds: 10,
    phase: 'countdown', ratings: {}, scores: {}, timePerRound: 20, roleAssignments: {}
  };
  room.players.forEach(p => { room.gameData.scores[p.name] = 0; });
}

function initNeverEverPartyGame(room) {
  room.gameData = {
    questions: [...neverEverQuestions].sort(() => Math.random() - 0.5),
    currentQuestionIndex: 0, roundNumber: 1, maxRounds: 10,
    phase: 'countdown', responses: {}, scores: {}, timePerRound: 15, roleAssignments: {}
  };
  room.players.forEach(p => { room.gameData.scores[p.name] = 0; });
}

function initBetOrBluffGame(room) {
  room.gameData = {
    questions: [...betOrBluffQuestions].sort(() => Math.random() - 0.5),
    currentQuestionIndex: 0, roundNumber: 1, maxRounds: 8,
    phase: 'countdown', guesses: {}, bets: {}, chips: {},
    timePerGuess: 20, timePerBet: 30, roleAssignments: {}
  };
  room.players.forEach(p => { room.gameData.chips[p.name] = 100; });
}

// HELPER
function getTopPlayer(obj) {
  let max = -Infinity, winner = null;
  Object.entries(obj).forEach(([name, val]) => { if (val > max) { max = val; winner = name; } });
  return winner;
}

// RESULT CALCULATORS
function calculateTriviaResults(room, io) {
  room.gameData.phase = 'results';
  const q = room.gameData.questions[room.gameData.currentQuestionIndex];
  const results = [];
  Object.entries(room.gameData.answers).forEach(([pid, ans]) => {
    const p = room.players.find(x => x.id === pid);
    if (!p) return;
    const correct = ans.answerIndex === q.correct;
    if (correct) {
      const pts = 100 + Math.max(0, Math.floor((15000 - (ans.timestamp - room.gameData.roundStartTime)) / 100));
      room.gameData.streaks[p.name]++;
      room.gameData.scores[p.name] += pts + (room.gameData.streaks[p.name] - 1) * 10;
    } else { room.gameData.streaks[p.name] = 0; }
    results.push({ playerName: p.name, correct, streak: room.gameData.streaks[p.name] });
  });
  io.to(room.code).emit('trivia-results', { correctAnswer: q.correct, correctOption: q.options[q.correct], results, scores: room.gameData.scores });
}

function calculateThisOrThatPartyResults(room, io) {
  room.gameData.phase = 'results';
  const q = room.gameData.questions[room.gameData.currentQuestionIndex];
  let votesA = 0, votesB = 0, votersA = [], votersB = [];
  Object.values(room.gameData.votes).forEach(v => {
    if (v.choice === 'A') { votesA++; votersA.push(v.playerName); }
    else { votesB++; votersB.push(v.playerName); }
  });
  const majority = votesA > votesB ? 'A' : (votesB > votesA ? 'B' : 'TIE');
  if (majority !== 'TIE') (majority === 'A' ? votersA : votersB).forEach(n => room.gameData.scores[n] += 10);
  const total = votesA + votesB;
  io.to(room.code).emit('thisorthat-party-results', { optionA: q.optionA, optionB: q.optionB, votesA, votesB, votersA, votersB, majorityChoice: majority, percentA: total ? Math.round(votesA/total*100) : 50, percentB: total ? Math.round(votesB/total*100) : 50, scores: room.gameData.scores });
}

function calculateHotTakesPartyResults(room, io) {
  room.gameData.phase = 'results';
  const ratings = Object.values(room.gameData.ratings);
  const avg = ratings.length ? ratings.reduce((s,r) => s + r.rating, 0) / ratings.length : 3;
  const breakdown = {1:[],2:[],3:[],4:[],5:[]};
  ratings.forEach(r => breakdown[r.rating].push(r.playerName));
  let mode = 3, modeCount = 0;
  for (let i = 1; i <= 5; i++) if (breakdown[i].length > modeCount) { modeCount = breakdown[i].length; mode = i; }
  breakdown[mode].forEach(n => room.gameData.scores[n] += 10);
  io.to(room.code).emit('hottakes-party-results', { statement: room.gameData.questions[room.gameData.currentQuestionIndex].statement, averageRating: Math.round(avg*10)/10, modeRating: mode, ratingBreakdown: breakdown, scores: room.gameData.scores });
}

function calculateNeverEverPartyResults(room, io) {
  room.gameData.phase = 'results';
  const haveList = [], haventList = [];
  Object.values(room.gameData.responses).forEach(r => (r.response ? haveList : haventList).push(r.playerName));
  const minority = haveList.length < haventList.length ? haveList : (haventList.length < haveList.length ? haventList : null);
  if (minority?.length) minority.forEach(n => room.gameData.scores[n] += Math.min(20, Math.floor(20/minority.length)));
  const total = haveList.length + haventList.length;
  io.to(room.code).emit('neverever-party-results', { statement: room.gameData.questions[room.gameData.currentQuestionIndex].statement, haveList, haventList, haveCount: haveList.length, haventCount: haventList.length, percentHave: total ? Math.round(haveList.length/total*100) : 50, scores: room.gameData.scores });
}

function startBettingPhase(room, io) {
  room.gameData.phase = 'betting';
  const guesses = Object.values(room.gameData.guesses).sort((a,b) => a.guess - b.guess);
  io.to(room.code).emit('betorbluff-betting-phase', { guesses, timeLimit: room.gameData.timePerBet, chips: room.gameData.chips });
}

function calculateBetOrBluffResults(room, io) {
  room.gameData.phase = 'results';
  const all = Object.values(room.gameData.guesses).map(g => g.guess).sort((a,b) => a-b);
  const mid = Math.floor(all.length/2);
  const target = all.length % 2 ? all[mid] : (all[mid-1]+all[mid])/2;
  let closestId = null, closestDiff = Infinity, closestName = null;
  Object.entries(room.gameData.guesses).forEach(([id, g]) => {
    const diff = Math.abs(g.guess - target);
    if (diff < closestDiff) { closestDiff = diff; closestId = id; closestName = g.playerName; }
  });
  Object.entries(room.gameData.bets).forEach(([pid, b]) => {
    const p = room.players.find(x => x.id === pid);
    if (!p) return;
    if (b.targetPlayerId === closestId) room.gameData.chips[p.name] += b.betAmount;
    else if (b.targetPlayerId) room.gameData.chips[p.name] = Math.max(0, room.gameData.chips[p.name] - b.betAmount);
  });
  if (closestName) room.gameData.chips[closestName] += 50;
  io.to(room.code).emit('betorbluff-results', { targetValue: Math.round(target*10)/10, closestPlayer: closestName, allGuesses: Object.values(room.gameData.guesses), chips: room.gameData.chips });
}

// SOCKET HANDLER SETUP - Call this from server.js
function setupPartyGameHandlers(io, socket, rooms, players) {
  
  // TRIVIA ROYALE
  socket.on('trivia-start-round', ({roomCode}) => {
    const room = rooms.get(roomCode); if (!room?.gameData) return;
    const q = room.gameData.questions[room.gameData.currentQuestionIndex];
    room.gameData.phase = 'question'; room.gameData.answers = {}; room.gameData.roundStartTime = Date.now();
    io.to(roomCode).emit('trivia-question', { question: q.question, options: q.options, roundNumber: room.gameData.roundNumber, totalRounds: room.gameData.maxRounds, timeLimit: room.gameData.timePerQuestion });
  });
  socket.on('trivia-answer', ({roomCode, answerIndex}) => {
    const room = rooms.get(roomCode), player = players.get(socket.id);
    if (!room?.gameData || !player || room.gameData.phase !== 'question' || room.gameData.answers[socket.id]) return;
    room.gameData.answers[socket.id] = { answerIndex, timestamp: Date.now() };
    socket.emit('trivia-answer-received', { answerIndex });
    io.to(roomCode).emit('trivia-answer-count', { answeredCount: Object.keys(room.gameData.answers).length, totalPlayers: room.players.length });
    if (Object.keys(room.gameData.answers).length === room.players.length) calculateTriviaResults(room, io);
  });
  socket.on('trivia-time-up', ({roomCode}) => { const room = rooms.get(roomCode); if (room?.gameData?.phase === 'question') calculateTriviaResults(room, io); });
  socket.on('trivia-next-round', ({roomCode}) => {
    const room = rooms.get(roomCode); if (!room?.gameData) return;
    room.gameData.currentQuestionIndex++; room.gameData.roundNumber++;
    if (room.gameData.roundNumber > room.gameData.maxRounds) io.to(roomCode).emit('trivia-game-over', { finalScores: room.gameData.scores, winner: getTopPlayer(room.gameData.scores) });
    else io.to(roomCode).emit('trivia-round-transition', { nextRound: room.gameData.roundNumber, scores: room.gameData.scores });
  });

  // THIS OR THAT
  socket.on('thisorthat-party-start-round', ({roomCode}) => {
    const room = rooms.get(roomCode); if (!room?.gameData) return;
    const q = room.gameData.questions[room.gameData.currentQuestionIndex];
    room.gameData.phase = 'voting'; room.gameData.votes = {};
    io.to(roomCode).emit('thisorthat-party-question', { optionA: q.optionA, optionB: q.optionB, roundNumber: room.gameData.roundNumber, totalRounds: room.gameData.maxRounds, timeLimit: room.gameData.timePerRound });
  });
  socket.on('thisorthat-party-vote', ({roomCode, choice}) => {
    const room = rooms.get(roomCode), player = players.get(socket.id);
    if (!room?.gameData || !player || room.gameData.phase !== 'voting' || room.gameData.votes[socket.id]) return;
    room.gameData.votes[socket.id] = { choice, playerName: player.playerName };
    socket.emit('thisorthat-party-vote-received', { choice });
    io.to(roomCode).emit('thisorthat-party-vote-count', { votedCount: Object.keys(room.gameData.votes).length, totalPlayers: room.players.length });
    if (Object.keys(room.gameData.votes).length === room.players.length) calculateThisOrThatPartyResults(room, io);
  });
  socket.on('thisorthat-party-time-up', ({roomCode}) => { const room = rooms.get(roomCode); if (room?.gameData?.phase === 'voting') calculateThisOrThatPartyResults(room, io); });
  socket.on('thisorthat-party-next-round', ({roomCode}) => {
    const room = rooms.get(roomCode); if (!room?.gameData) return;
    room.gameData.currentQuestionIndex++; room.gameData.roundNumber++;
    if (room.gameData.roundNumber > room.gameData.maxRounds) io.to(roomCode).emit('thisorthat-party-game-over', { finalScores: room.gameData.scores, winner: getTopPlayer(room.gameData.scores) });
    else io.to(roomCode).emit('thisorthat-party-round-transition', { nextRound: room.gameData.roundNumber, scores: room.gameData.scores });
  });

  // HOT TAKES
  socket.on('hottakes-party-start-round', ({roomCode}) => {
    const room = rooms.get(roomCode); if (!room?.gameData) return;
    const q = room.gameData.questions[room.gameData.currentQuestionIndex];
    room.gameData.phase = 'rating'; room.gameData.ratings = {};
    io.to(roomCode).emit('hottakes-party-statement', { statement: q.statement, roundNumber: room.gameData.roundNumber, totalRounds: room.gameData.maxRounds, timeLimit: room.gameData.timePerRound });
  });
  socket.on('hottakes-party-rate', ({roomCode, rating}) => {
    const room = rooms.get(roomCode), player = players.get(socket.id);
    if (!room?.gameData || !player || room.gameData.phase !== 'rating' || room.gameData.ratings[socket.id]) return;
    room.gameData.ratings[socket.id] = { rating, playerName: player.playerName };
    socket.emit('hottakes-party-rate-received', { rating });
    io.to(roomCode).emit('hottakes-party-rate-count', { ratedCount: Object.keys(room.gameData.ratings).length, totalPlayers: room.players.length });
    if (Object.keys(room.gameData.ratings).length === room.players.length) calculateHotTakesPartyResults(room, io);
  });
  socket.on('hottakes-party-time-up', ({roomCode}) => { const room = rooms.get(roomCode); if (room?.gameData?.phase === 'rating') calculateHotTakesPartyResults(room, io); });
  socket.on('hottakes-party-next-round', ({roomCode}) => {
    const room = rooms.get(roomCode); if (!room?.gameData) return;
    room.gameData.currentQuestionIndex++; room.gameData.roundNumber++;
    if (room.gameData.roundNumber > room.gameData.maxRounds) io.to(roomCode).emit('hottakes-party-game-over', { finalScores: room.gameData.scores, winner: getTopPlayer(room.gameData.scores) });
    else io.to(roomCode).emit('hottakes-party-round-transition', { nextRound: room.gameData.roundNumber, scores: room.gameData.scores });
  });

  // NEVER EVER
  socket.on('neverever-party-start-round', ({roomCode}) => {
    const room = rooms.get(roomCode); if (!room?.gameData) return;
    const q = room.gameData.questions[room.gameData.currentQuestionIndex];
    room.gameData.phase = 'responding'; room.gameData.responses = {};
    io.to(roomCode).emit('neverever-party-statement', { statement: q.statement, roundNumber: room.gameData.roundNumber, totalRounds: room.gameData.maxRounds, timeLimit: room.gameData.timePerRound });
  });
  socket.on('neverever-party-respond', ({roomCode, response}) => {
    const room = rooms.get(roomCode), player = players.get(socket.id);
    if (!room?.gameData || !player || room.gameData.phase !== 'responding' || room.gameData.responses[socket.id] !== undefined) return;
    room.gameData.responses[socket.id] = { response, playerName: player.playerName };
    socket.emit('neverever-party-response-received', { response });
    io.to(roomCode).emit('neverever-party-response-count', { respondedCount: Object.keys(room.gameData.responses).length, totalPlayers: room.players.length });
    if (Object.keys(room.gameData.responses).length === room.players.length) calculateNeverEverPartyResults(room, io);
  });
  socket.on('neverever-party-time-up', ({roomCode}) => { const room = rooms.get(roomCode); if (room?.gameData?.phase === 'responding') calculateNeverEverPartyResults(room, io); });
  socket.on('neverever-party-next-round', ({roomCode}) => {
    const room = rooms.get(roomCode); if (!room?.gameData) return;
    room.gameData.currentQuestionIndex++; room.gameData.roundNumber++;
    if (room.gameData.roundNumber > room.gameData.maxRounds) io.to(roomCode).emit('neverever-party-game-over', { finalScores: room.gameData.scores, winner: getTopPlayer(room.gameData.scores) });
    else io.to(roomCode).emit('neverever-party-round-transition', { nextRound: room.gameData.roundNumber, scores: room.gameData.scores });
  });

  // BET OR BLUFF
  socket.on('betorbluff-start-round', ({roomCode}) => {
    const room = rooms.get(roomCode); if (!room?.gameData) return;
    const q = room.gameData.questions[room.gameData.currentQuestionIndex];
    room.gameData.phase = 'guessing'; room.gameData.guesses = {}; room.gameData.bets = {};
    io.to(roomCode).emit('betorbluff-question', { question: q.question, unit: q.unit, roundNumber: room.gameData.roundNumber, totalRounds: room.gameData.maxRounds, timeLimit: room.gameData.timePerGuess, chips: room.gameData.chips });
  });
  socket.on('betorbluff-guess', ({roomCode, guess}) => {
    const room = rooms.get(roomCode), player = players.get(socket.id);
    if (!room?.gameData || !player || room.gameData.phase !== 'guessing' || room.gameData.guesses[socket.id]) return;
    room.gameData.guesses[socket.id] = { guess: parseFloat(guess), playerName: player.playerName, playerId: socket.id };
    socket.emit('betorbluff-guess-received', { guess });
    io.to(roomCode).emit('betorbluff-guess-count', { guessedCount: Object.keys(room.gameData.guesses).length, totalPlayers: room.players.length });
    if (Object.keys(room.gameData.guesses).length === room.players.length) startBettingPhase(room, io);
  });
  socket.on('betorbluff-guess-time-up', ({roomCode}) => {
    const room = rooms.get(roomCode); if (!room?.gameData || room.gameData.phase !== 'guessing') return;
    room.players.forEach(p => { if (!room.gameData.guesses[p.id]) room.gameData.guesses[p.id] = { guess: 0, playerName: p.name, playerId: p.id }; });
    startBettingPhase(room, io);
  });
  socket.on('betorbluff-bet', ({roomCode, targetPlayerId, betAmount}) => {
    const room = rooms.get(roomCode), player = players.get(socket.id);
    if (!room?.gameData || !player || room.gameData.phase !== 'betting' || room.gameData.bets[socket.id]) return;
    const maxBet = room.gameData.chips[player.playerName] || 0;
    room.gameData.bets[socket.id] = { targetPlayerId, betAmount: Math.min(Math.max(0, betAmount), maxBet), playerName: player.playerName };
    socket.emit('betorbluff-bet-received', { targetPlayerId, betAmount });
    io.to(roomCode).emit('betorbluff-bet-count', { betCount: Object.keys(room.gameData.bets).length, totalPlayers: room.players.length });
    if (Object.keys(room.gameData.bets).length === room.players.length) calculateBetOrBluffResults(room, io);
  });
  socket.on('betorbluff-bet-time-up', ({roomCode}) => {
    const room = rooms.get(roomCode); if (!room?.gameData || room.gameData.phase !== 'betting') return;
    room.players.forEach(p => { if (!room.gameData.bets[p.id]) room.gameData.bets[p.id] = { targetPlayerId: null, betAmount: 0, playerName: p.name }; });
    calculateBetOrBluffResults(room, io);
  });
  socket.on('betorbluff-next-round', ({roomCode}) => {
    const room = rooms.get(roomCode); if (!room?.gameData) return;
    room.gameData.currentQuestionIndex++; room.gameData.roundNumber++;
    if (room.gameData.roundNumber > room.gameData.maxRounds) io.to(roomCode).emit('betorbluff-game-over', { finalChips: room.gameData.chips, winner: getTopPlayer(room.gameData.chips) });
    else io.to(roomCode).emit('betorbluff-round-transition', { nextRound: room.gameData.roundNumber, chips: room.gameData.chips });
  });
}

module.exports = {
  initTriviaRoyaleGame,
  initThisOrThatPartyGame,
  initHotTakesPartyGame,
  initNeverEverPartyGame,
  initBetOrBluffGame,
  setupPartyGameHandlers
};
