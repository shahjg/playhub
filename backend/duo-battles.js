// ============================================
// DUO QUICK BATTLES & WORD GAMES — Server Module
// TTT, Connect4, RPS, Reaction, Battleship,
// Dots&Boxes, Quiz, TypeRacer, Hangman,
// Word Chain, Memory, Wordle, Rhyme,
// Taboo, Scramble
// ============================================

const battleRooms = new Map();

function genBattleCode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'B';
  for (let i = 0; i < 5; i++) code += c.charAt(Math.floor(Math.random() * c.length));
  if (battleRooms.has(code)) return genBattleCode();
  return code;
}

function initBattleHandlers(io, socket) {

  socket.on('battle-create', (data) => {
    const { gameType, playerName, settings } = data;
    if (!gameType || !playerName) return socket.emit('battle-error', { message: 'Missing data' });
    const code = genBattleCode();
    const room = {
      code, gameType, settings: settings || {},
      players: [{ id: socket.id, name: playerName, num: 1 }],
      state: {}, scores: {}, round: 1, phase: 'waiting', started: false
    };
    room.scores[playerName] = 0;
    battleRooms.set(code, room);
    socket.join(code); socket.battleRoom = code; socket.battleName = playerName;
    socket.emit('battle-created', { code, playerName, playerNum: 1 });
  });

  socket.on('battle-join', (data) => {
    const { code, playerName } = data;
    if (!code || !playerName) return socket.emit('battle-error', { message: 'Missing data' });
    const room = battleRooms.get(code.toUpperCase());
    if (!room) return socket.emit('battle-error', { message: 'Room not found' });
    if (room.players.length >= 2) {
      const ex = room.players.find(p => p.name === playerName);
      if (ex) { ex.id = socket.id; socket.join(room.code); socket.battleRoom = room.code; socket.battleName = playerName;
        socket.emit('battle-joined', { code: room.code, gameType: room.gameType, settings: room.settings, playerNum: ex.num, players: room.players.map(p => p.name), started: room.started, state: room.state, scores: room.scores }); return; }
      return socket.emit('battle-error', { message: 'Room is full' });
    }
    room.players.push({ id: socket.id, name: playerName, num: 2 });
    room.scores[playerName] = 0;
    socket.join(room.code); socket.battleRoom = room.code; socket.battleName = playerName;
    socket.emit('battle-joined', { code: room.code, gameType: room.gameType, settings: room.settings, playerNum: 2, players: room.players.map(p => p.name), started: false, scores: room.scores });
    io.to(room.code).emit('battle-player-joined', { players: room.players.map(p => p.name), playerCount: room.players.length });
  });

  socket.on('battle-start', (data) => {
    const room = battleRooms.get(data.code);
    if (!room || room.started) return;
    room.started = true; room.phase = 'playing';
    initGameState(room);
    io.to(room.code).emit('battle-started', { state: room.state, scores: room.scores, round: room.round, players: room.players.map(p => p.name), settings: room.settings });
  });

  // Generic move handler
  socket.on('battle-move', (data) => {
    const room = battleRooms.get(data.code);
    if (!room || !room.started) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    const result = processMove(room, player, data.move, io);
    if (result) io.to(room.code).emit('battle-update', result);
  });

  // Simultaneous submit (RPS, quiz, etc)
  socket.on('battle-submit', (data) => {
    const room = battleRooms.get(data.code);
    if (!room || !room.started) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    if (!room.state.submissions) room.state.submissions = {};
    room.state.submissions[player.name] = data.answer;
    socket.to(room.code).emit('battle-partner-submitted', { playerName: player.name });
    if (Object.keys(room.state.submissions).length >= 2) {
      const result = resolveSubmissions(room);
      io.to(room.code).emit('battle-reveal', result);
      room.state.submissions = {};
    }
  });

  // Next round
  socket.on('battle-next', (data) => {
    const room = battleRooms.get(data.code);
    if (!room) return;
    room.round++;
    initRoundState(room);
    io.to(room.code).emit('battle-round', { state: room.state, scores: room.scores, round: room.round });
  });

  // Rematch
  socket.on('battle-rematch', (data) => {
    const room = battleRooms.get(data.code);
    if (!room) return;
    room.round = 1;
    Object.keys(room.scores).forEach(k => room.scores[k] = 0);
    initGameState(room);
    io.to(room.code).emit('battle-started', { state: room.state, scores: room.scores, round: 1, players: room.players.map(p => p.name), settings: room.settings });
  });

  // Draw data (for drawing games)
  socket.on('battle-draw', (data) => {
    const room = battleRooms.get(data.code);
    if (!room) return;
    socket.to(room.code).emit('battle-draw-data', data.drawData);
  });

  // Guess
  socket.on('battle-guess', (data) => {
    const room = battleRooms.get(data.code);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    io.to(room.code).emit('battle-guess-made', { guess: data.guess, guesser: player.name });
  });

  socket.on('disconnect', () => {
    if (socket.battleRoom) {
      const room = battleRooms.get(socket.battleRoom);
      if (room) io.to(room.code).emit('battle-player-left', { playerName: socket.battleName });
      setTimeout(() => { const r = battleRooms.get(socket.battleRoom); if (r && r.players.every(p => !io.sockets.sockets.get(p.id))) battleRooms.delete(socket.battleRoom); }, 60000);
    }
  });
}

function initGameState(room) {
  const gt = room.gameType;
  if (gt === 'ttt') room.state = { board: Array(9).fill(null), turn: room.players[0].name, winner: null };
  else if (gt === 'c4') room.state = { board: Array(42).fill(null), turn: room.players[0].name, winner: null, cols: 7, rows: 6 };
  else if (gt === 'rps') room.state = { submissions: {} };
  else if (gt === 'battleship') room.state = { phase: 'placing', boards: {}, shots: {}, ships: {} };
  else if (gt === 'dots') { const s = room.settings.gridSize || 4; room.state = { h: Array(s * (s + 1)).fill(null), v: Array((s + 1) * s).fill(null), boxes: Array(s * s).fill(null), turn: room.players[0].name, size: s }; }
  else if (gt === 'memory') { const s = room.settings.gridSize || 4; const total = s * s; const pairs = total / 2; const icons = MEMORY_ICONS.slice(0, pairs); const cards = [...icons, ...icons].sort(() => Math.random() - 0.5); room.state = { cards, revealed: Array(total).fill(false), matched: Array(total).fill(false), turn: room.players[0].name, size: s, flipped: [] }; }
  else room.state = { submissions: {} };
}

function initRoundState(room) {
  const gt = room.gameType;
  if (gt === 'ttt') room.state = { board: Array(9).fill(null), turn: room.players[room.round % 2].name, winner: null };
  else if (gt === 'c4') room.state = { board: Array(42).fill(null), turn: room.players[room.round % 2].name, winner: null, cols: 7, rows: 6 };
  else if (gt === 'rps') room.state = { submissions: {} };
  else room.state.submissions = {};
}

function processMove(room, player, move, io) {
  const gt = room.gameType;

  if (gt === 'ttt') {
    if (room.state.turn !== player.name || room.state.winner) return null;
    const i = move.cell;
    if (room.state.board[i] !== null) return null;
    const sym = player.num === 1 ? 'X' : 'O';
    room.state.board[i] = sym;
    const w = checkTTTWin(room.state.board);
    if (w) { room.state.winner = player.name; room.scores[player.name]++; return { state: room.state, scores: room.scores, winner: player.name, winLine: w }; }
    if (room.state.board.every(c => c !== null)) { room.state.winner = 'draw'; return { state: room.state, scores: room.scores, winner: 'draw' }; }
    room.state.turn = room.players.find(p => p.name !== player.name).name;
    return { state: room.state, scores: room.scores };
  }

  if (gt === 'c4') {
    if (room.state.turn !== player.name || room.state.winner) return null;
    const col = move.col;
    const { board, cols, rows } = room.state;
    let row = -1;
    for (let r = rows - 1; r >= 0; r--) { if (board[r * cols + col] === null) { row = r; break; } }
    if (row === -1) return null;
    board[row * cols + col] = player.num;
    const w = checkC4Win(board, cols, rows);
    if (w) { room.state.winner = player.name; room.scores[player.name]++; return { state: room.state, scores: room.scores, winner: player.name, winCells: w }; }
    if (board.every(c => c !== null)) { room.state.winner = 'draw'; return { state: room.state, scores: room.scores, winner: 'draw' }; }
    room.state.turn = room.players.find(p => p.name !== player.name).name;
    return { state: room.state, scores: room.scores };
  }

  if (gt === 'memory') {
    if (room.state.turn !== player.name) return null;
    const idx = move.card;
    if (room.state.matched[idx] || room.state.revealed[idx]) return null;
    room.state.flipped.push(idx);
    room.state.revealed[idx] = true;
    if (room.state.flipped.length === 2) {
      const [a, b] = room.state.flipped;
      if (room.state.cards[a] === room.state.cards[b]) {
        room.state.matched[a] = room.state.matched[b] = true;
        room.scores[player.name]++;
      } else {
        setTimeout(() => {
          room.state.revealed[a] = room.state.revealed[b] = false;
          room.state.turn = room.players.find(p => p.name !== player.name).name;
          io.to(room.code).emit('battle-update', { state: room.state, scores: room.scores });
        }, 1000);
      }
      room.state.flipped = [];
      if (room.state.matched.every(m => m)) {
        room.state.winner = Object.entries(room.scores).sort((a, b) => b[1] - a[1])[0][0];
        return { state: room.state, scores: room.scores, winner: room.state.winner, gameOver: true };
      }
    }
    return { state: room.state, scores: room.scores };
  }

  if (gt === 'dots') {
    if (room.state.turn !== player.name) return null;
    const { type, idx } = move; // type: 'h' or 'v'
    if (room.state[type][idx] !== null) return null;
    room.state[type][idx] = player.num;
    const captured = checkDotsCapture(room.state, idx, type, player.num);
    if (captured > 0) { room.scores[player.name] = (room.scores[player.name] || 0) + captured; }
    else { room.state.turn = room.players.find(p => p.name !== player.name).name; }
    const totalBoxes = room.state.size * room.state.size;
    if (room.state.boxes.every(b => b !== null)) {
      room.state.winner = Object.entries(room.scores).sort((a, b) => b[1] - a[1])[0][0];
      return { state: room.state, scores: room.scores, winner: room.state.winner, gameOver: true };
    }
    return { state: room.state, scores: room.scores };
  }

  return null;
}

function resolveSubmissions(room) {
  const gt = room.gameType;
  const subs = room.state.submissions;
  const names = room.players.map(p => p.name);

  if (gt === 'rps') {
    const a = subs[names[0]], b = subs[names[1]];
    let winner = null;
    const wins = { rock: ['scissors', 'lizard'], paper: ['rock', 'spock'], scissors: ['paper', 'lizard'], lizard: ['spock', 'paper'], spock: ['scissors', 'rock'] };
    if (a === b) winner = 'draw';
    else if (wins[a] && wins[a].includes(b)) { winner = names[0]; room.scores[names[0]]++; }
    else { winner = names[1]; room.scores[names[1]]++; }
    return { submissions: subs, winner, scores: room.scores, round: room.round };
  }

  // Generic simultaneous
  return { submissions: subs, scores: room.scores, round: room.round };
}

// === TTT WIN CHECK ===
function checkTTTWin(b) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const l of lines) { if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return l; }
  return null;
}

// === C4 WIN CHECK ===
function checkC4Win(b, cols, rows) {
  const check = (r, c, dr, dc) => {
    const v = b[r * cols + c];
    if (!v) return null;
    const cells = [[r, c]];
    for (let i = 1; i < 4; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || b[nr * cols + nc] !== v) return null;
      cells.push([nr, nc]);
    }
    return cells;
  };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of dirs) { const w = check(r, c, dr, dc); if (w) return w; }
  }
  return null;
}

// === DOTS CAPTURE CHECK ===
function checkDotsCapture(state, idx, type, playerNum) {
  const s = state.size;
  let captured = 0;
  // Check which boxes this line borders
  const boxes = getAdjacentBoxes(s, idx, type);
  for (const box of boxes) {
    if (state.boxes[box] !== null) continue;
    if (isBoxComplete(state, box, s)) {
      state.boxes[box] = playerNum;
      captured++;
    }
  }
  return captured;
}

function getAdjacentBoxes(s, idx, type) {
  const boxes = [];
  if (type === 'h') {
    const row = Math.floor(idx / s), col = idx % s;
    if (row > 0) boxes.push((row - 1) * s + col);
    if (row < s) boxes.push(row * s + col);
  } else {
    const row = Math.floor(idx / s), col = idx % (s + 1);
    if (col > 0) boxes.push(row * s + (col - 1));
    if (col < s) boxes.push(row * s + col);
  }
  return boxes.filter(b => b >= 0 && b < s * s);
}

function isBoxComplete(state, box, s) {
  const row = Math.floor(box / s), col = box % s;
  const top = state.h[row * s + col];
  const bottom = state.h[(row + 1) * s + col];
  const left = state.v[row * (s + 1) + col];
  const right = state.v[row * (s + 1) + col + 1];
  return top !== null && bottom !== null && left !== null && right !== null;
}

// === MEMORY ICONS ===
const MEMORY_ICONS = ['🐶','🐱','🦊','🐼','🐨','🦁','🐸','🐙','🦋','🐝','🌸','🌺','🍎','🍕','🎸','🎮','⚽','🚀','💎','🌈','🎭','🎪','🧸','🎯','🏆','🎩','🦄','🐉','🌻','🍩','🎵','🌙'];

// === QUIZ BANK ===
const QUIZ_BANK = {
  general: [
    {q:'What planet is known as the Red Planet?',a:'Mars',opts:['Venus','Mars','Jupiter','Saturn']},
    {q:'How many continents are there?',a:'7',opts:['5','6','7','8']},
    {q:'What is the largest ocean?',a:'Pacific',opts:['Atlantic','Pacific','Indian','Arctic']},
    {q:'Who painted the Mona Lisa?',a:'Leonardo da Vinci',opts:['Michelangelo','Leonardo da Vinci','Picasso','Van Gogh']},
    {q:'What is the chemical symbol for gold?',a:'Au',opts:['Go','Gd','Au','Ag']},
    {q:'How many Harry Potter books are there?',a:'7',opts:['5','6','7','8']},
    {q:'What year did the Titanic sink?',a:'1912',opts:['1905','1912','1920','1898']},
    {q:'What is the smallest country in the world?',a:'Vatican City',opts:['Monaco','Vatican City','San Marino','Liechtenstein']},
    {q:'What gas do plants absorb?',a:'Carbon dioxide',opts:['Oxygen','Nitrogen','Carbon dioxide','Hydrogen']},
    {q:'How many sides does a hexagon have?',a:'6',opts:['5','6','7','8']},
    {q:'What is the capital of Japan?',a:'Tokyo',opts:['Osaka','Tokyo','Kyoto','Hiroshima']},
    {q:'Who wrote Romeo and Juliet?',a:'Shakespeare',opts:['Dickens','Shakespeare','Austen','Hemingway']},
    {q:'What is the speed of light?',a:'300,000 km/s',opts:['150,000 km/s','300,000 km/s','500,000 km/s','1,000,000 km/s']},
    {q:'How many teeth does an adult have?',a:'32',opts:['28','30','32','36']},
    {q:'What is the largest mammal?',a:'Blue whale',opts:['Elephant','Blue whale','Giraffe','Hippo']},
    {q:'What year was the iPhone released?',a:'2007',opts:['2005','2006','2007','2008']},
    {q:'What language has the most native speakers?',a:'Mandarin Chinese',opts:['English','Spanish','Mandarin Chinese','Hindi']},
    {q:'How many strings does a standard guitar have?',a:'6',opts:['4','5','6','8']},
    {q:'What is the hardest natural substance?',a:'Diamond',opts:['Gold','Iron','Diamond','Titanium']},
    {q:'Who discovered gravity?',a:'Newton',opts:['Einstein','Newton','Galileo','Darwin']}
  ],
  pop_culture: [
    {q:'What is Baby Yoda\'s real name?',a:'Grogu',opts:['Yoda Jr','Grogu','Din','Mando']},
    {q:'Which app has the slogan "Make Your Day"?',a:'TikTok',opts:['Instagram','TikTok','Snapchat','YouTube']},
    {q:'Who is the most followed person on Instagram?',a:'Cristiano Ronaldo',opts:['Kylie Jenner','Cristiano Ronaldo','Selena Gomez','The Rock']},
    {q:'What Netflix show features a squid-themed game?',a:'Squid Game',opts:['Squid Game','Alice in Borderland','The Platform','3%']},
    {q:'What is the highest-grossing film of all time?',a:'Avatar',opts:['Avengers Endgame','Avatar','Titanic','Star Wars']},
    {q:'Who sang "Blinding Lights"?',a:'The Weeknd',opts:['Drake','The Weeknd','Post Malone','Bruno Mars']},
    {q:'What year did Fortnite release?',a:'2017',opts:['2015','2016','2017','2018']},
    {q:'What is the name of Elon Musk\'s space company?',a:'SpaceX',opts:['Blue Origin','SpaceX','Virgin Galactic','NASA']},
    {q:'Who plays Wednesday Addams in the Netflix series?',a:'Jenna Ortega',opts:['Millie Bobby Brown','Jenna Ortega','Sadie Sink','Zendaya']},
    {q:'What K-pop group performed at the 2022 Grammys?',a:'BTS',opts:['BLACKPINK','BTS','Stray Kids','TWICE']},
    {q:'What video game features a character named Master Chief?',a:'Halo',opts:['Call of Duty','Halo','Gears of War','Destiny']},
    {q:'Who created Facebook?',a:'Mark Zuckerberg',opts:['Elon Musk','Mark Zuckerberg','Jeff Bezos','Jack Dorsey']},
    {q:'What is the most streamed song on Spotify?',a:'Blinding Lights',opts:['Shape of You','Blinding Lights','Someone Like You','Despacito']},
    {q:'What animated movie features a clownfish?',a:'Finding Nemo',opts:['Finding Nemo','Shark Tale','Moana','Luca']},
    {q:'What reality show does Gordon Ramsay host?',a:'Hell\'s Kitchen',opts:['MasterChef','Hell\'s Kitchen','Top Chef','Chopped']},
    {q:'What is the name of the AI chatbot by OpenAI?',a:'ChatGPT',opts:['Siri','ChatGPT','Alexa','Cortana']},
    {q:'Who directed Oppenheimer?',a:'Christopher Nolan',opts:['Steven Spielberg','Christopher Nolan','Denis Villeneuve','Martin Scorsese']},
    {q:'What platform is known for "Stories" that disappear?',a:'Snapchat',opts:['Instagram','Snapchat','TikTok','Twitter']},
    {q:'What Marvel character wields Mjolnir?',a:'Thor',opts:['Iron Man','Thor','Captain America','Hulk']},
    {q:'What is the most subscribed YouTube channel?',a:'MrBeast',opts:['PewDiePie','MrBeast','T-Series','Cocomelon']}
  ]
};

// === HANGMAN WORDS ===
const HANGMAN_BANK = {
  movies: ['TITANIC','INCEPTION','AVATAR','FROZEN','JAWS','ROCKY','SHREK','COCO','MOANA','GLADIATOR','PSYCHO','BAMBI','DUMBO','BRAVE','UP','RATATOUILLE','MULAN','CARS','ALADDIN','TARZAN'],
  animals: ['ELEPHANT','PENGUIN','GIRAFFE','DOLPHIN','BUTTERFLY','KANGAROO','OCTOPUS','CHAMELEON','FLAMINGO','CHEETAH','RHINOCEROS','HIPPOPOTAMUS','PORCUPINE','JELLYFISH','CROCODILE','ARMADILLO','PLATYPUS','ORANGUTAN','WOLVERINE','ALLIGATOR'],
  countries: ['AUSTRALIA','BRAZIL','CANADA','DENMARK','EGYPT','FRANCE','GERMANY','HUNGARY','ICELAND','JAPAN','KENYA','LEBANON','MEXICO','NORWAY','PAKISTAN','QATAR','ROMANIA','SWEDEN','THAILAND','URUGUAY'],
  celebrities: ['BEYONCE','DRAKE','RIHANNA','EMINEM','ADELE','SHAKIRA','MADONNA','PRINCE','ELVIS','OPRAH','KANYE','TAYLOR','BIEBER','SELENA','ARIANA','BILLIE','LIZZO','DOJA','MEGAN','OLIVIA'],
  food: ['SPAGHETTI','HAMBURGER','CHOCOLATE','PANCAKES','AVOCADO','CROISSANT','BURRITO','LASAGNA','GUACAMOLE','SUSHI','DUMPLINGS','BRUSCHETTA','QUESADILLA','CHEESECAKE','TIRAMISU','CINNAMON','PRETZELS','MACARONI','RAVIOLI','FOCACCIA'],
  gen_z: ['SLAY','BUSSIN','RIZZ','DELULU','GOATED','PERIODT','YEET','VIBE','LOWKEY','HIGHKEY','GHOSTING','SIMPING','FLEXING','CLOUT','DRIP','SLAPS','CRINGE','BASED','VALID','RATIO']
};

// === TABOO WORDS ===
const TABOO_BANK = {
  animals: [
    {word:'ELEPHANT',forbidden:['Trunk','Big','Grey','Africa','Tusk']},
    {word:'PENGUIN',forbidden:['Ice','Cold','Bird','Black','White']},
    {word:'DOLPHIN',forbidden:['Ocean','Swim','Smart','Flipper','Sea']},
    {word:'BUTTERFLY',forbidden:['Wings','Fly','Caterpillar','Colorful','Insect']},
    {word:'GIRAFFE',forbidden:['Tall','Neck','Long','Africa','Spots']},
    {word:'KANGAROO',forbidden:['Australia','Jump','Pouch','Baby','Hop']},
    {word:'OCTOPUS',forbidden:['Eight','Arms','Sea','Tentacles','Ink']},
    {word:'LION',forbidden:['King','Jungle','Mane','Roar','Cat']},
    {word:'SHARK',forbidden:['Ocean','Teeth','Jaws','Fin','Bite']},
    {word:'PARROT',forbidden:['Talk','Bird','Colorful','Pirate','Repeat']}
  ],
  movies: [
    {word:'TITANIC',forbidden:['Ship','Sink','Rose','Jack','Ice']},
    {word:'AVATAR',forbidden:['Blue','Alien','Planet','James','Cameron']},
    {word:'FROZEN',forbidden:['Elsa','Ice','Snow','Let It Go','Disney']},
    {word:'JAWS',forbidden:['Shark','Ocean','Beach','Bite','Summer']},
    {word:'SHREK',forbidden:['Ogre','Donkey','Swamp','Green','Fairy']},
    {word:'INCEPTION',forbidden:['Dream','Sleep','Layer','Leo','Mind']},
    {word:'MATRIX',forbidden:['Pill','Red','Neo','Virtual','Reality']},
    {word:'FINDING NEMO',forbidden:['Fish','Ocean','Clown','Dad','Lost']},
    {word:'TOY STORY',forbidden:['Woody','Buzz','Pixar','Play','Andy']},
    {word:'STAR WARS',forbidden:['Force','Jedi','Luke','Darth','Light']}
  ],
  food: [
    {word:'PIZZA',forbidden:['Cheese','Italy','Slice','Topping','Dough']},
    {word:'SUSHI',forbidden:['Japan','Rice','Fish','Raw','Roll']},
    {word:'HAMBURGER',forbidden:['Bun','Beef','Fast','Patty','Grill']},
    {word:'CHOCOLATE',forbidden:['Sweet','Cocoa','Brown','Candy','Milk']},
    {word:'PANCAKE',forbidden:['Flat','Breakfast','Syrup','Batter','Stack']},
    {word:'TACO',forbidden:['Mexico','Shell','Beef','Tuesday','Salsa']},
    {word:'ICE CREAM',forbidden:['Cold','Scoop','Cone','Vanilla','Frozen']},
    {word:'PASTA',forbidden:['Italy','Noodle','Sauce','Boil','Spaghetti']},
    {word:'AVOCADO',forbidden:['Green','Toast','Guacamole','Fruit','Millennial']},
    {word:'DONUT',forbidden:['Hole','Glaze','Round','Sprinkle','Sweet']}
  ]
};

// === SCRAMBLE WORDS ===
const SCRAMBLE_BANK = {
  animals: ['TIGER','EAGLE','WHALE','SNAKE','PANDA','KOALA','ZEBRA','SHARK','MOUSE','HORSE','CAMEL','GOOSE','RHINO','LLAMA','BISON','OTTER','GECKO','RAVEN','CRANE','STORK'],
  countries: ['SPAIN','CHINA','INDIA','JAPAN','ITALY','KENYA','CHILE','NEPAL','GHANA','EGYPT','QATAR','SYRIA','YEMEN','NIGER','TONGA','NAURU','BENIN','GABON','SAMOA','TUVALU'],
  movies: ['JAWS','COCO','BRAVE','SHREK','ROCKY','ALIEN','DRIVE','CRASH','TENET','DUNE','JOKER','TAKEN','FROST','SPARK','MAGIC','PULSE','QUEEN','TOWER','BLADE','HONOR'],
  food: ['PASTA','PIZZA','CURRY','STEAK','BREAD','SALAD','GRAPE','PEACH','MANGO','LEMON','CREAM','TOAST','SAUCE','JUICE','MELON','OLIVE','ONION','HONEY','SUGAR','COCOA']
};

// === TYPERACER PASSAGES ===
const TYPERACE_BANK = {
  quotes: [
    'The only way to do great work is to love what you do.',
    'In the middle of difficulty lies opportunity.',
    'Be yourself; everyone else is already taken.',
    'Two things are infinite: the universe and human stupidity.',
    'The future belongs to those who believe in the beauty of their dreams.',
    'It is during our darkest moments that we must focus to see the light.',
    'Life is what happens when you are busy making other plans.',
    'The only impossible journey is the one you never begin.',
    'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    'Happiness is not something ready made. It comes from your own actions.'
  ],
  lyrics: [
    'Just a small town girl living in a lonely world.',
    'Is this the real life? Is this just fantasy?',
    'We will, we will rock you.',
    'Hello from the other side, I must have called a thousand times.',
    'Cause baby you are a firework, come on show them what you are worth.',
    'I got my mind on my money and my money on my mind.',
    'Never gonna give you up, never gonna let you down.',
    'Im on the highway to hell.',
    'Shake it off, shake it off.',
    'Old town road, gonna ride til I cant no more.'
  ],
  tongue_twisters: [
    'She sells seashells by the seashore.',
    'Peter Piper picked a peck of pickled peppers.',
    'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
    'Red lorry yellow lorry red lorry yellow lorry.',
    'Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.',
    'I scream you scream we all scream for ice cream.',
    'Toy boat toy boat toy boat.',
    'A proper copper coffee pot.',
    'Six slippery snails slid slowly seaward.',
    'Fresh French fried fish.'
  ]
};

// === RHYME WORDS ===
const RHYME_BANK = {
  easy: ['cat','dog','sun','day','run','fly','blue','tree','love','star','night','light','rain','pain','cake','lake','time','mind','gold','cold','ring','sing','ball','tall','door','more','fun','one','red','bed'],
  hard: ['orange','silver','purple','month','ninth','wolf','bulb','depth','film','world','rhythm','angel','danger','heaven','music','ocean','spirit','wonder','gentle','simple']
};

// === WORDLE WORDS ===
const WORDLE_BANK = {
  common: ['CRANE','HOUSE','WATER','LIGHT','DREAM','STONE','BRAVE','CHARM','DANCE','FLAME','GRAPE','HEART','IVORY','JOKER','KNEEL','LEMON','MAGIC','NOBLE','OCEAN','PIANO','QUEEN','RIVER','SMILE','TOWER','UNITY','VIVID','WORLD','YOUTH','ZEBRA','ALIGN','BEACH','CLOUD','DRIVE','EMBER','FROST','GHOST','HONEY','IMAGE','JEWEL','KARMA','LUNAR','MONEY','NERVE','ORBIT','PEACE','QUEST','REIGN','SOLAR','TRIBE'],
  hard: ['ABYSS','BLITZ','CAULK','DWARF','EPOXY','FJORD','GLYPH','HYPER','IVORY','JAZZY','KNACK','LYMPH','MYRRH','NYMPH','OXIDE','PROXY','QUAFF','RUSTY','SWAMP','THYME','ULCER','VEXED','WHACK','XENON','YACHT','ZESTY','BATCH','CIVIC','DODGE','EVICT']
};

function getBattleItems(gameType, pack, intensity) {
  if (gameType === 'quiz') return [...(QUIZ_BANK[pack] || QUIZ_BANK.general)].sort(() => Math.random() - 0.5);
  if (gameType === 'hangman') return [...(HANGMAN_BANK[pack] || HANGMAN_BANK.movies)].sort(() => Math.random() - 0.5);
  if (gameType === 'taboo') return [...(TABOO_BANK[pack] || TABOO_BANK.animals)].sort(() => Math.random() - 0.5);
  if (gameType === 'scramble') return [...(SCRAMBLE_BANK[pack] || SCRAMBLE_BANK.animals)].sort(() => Math.random() - 0.5);
  if (gameType === 'typerace') return [...(TYPERACE_BANK[pack] || TYPERACE_BANK.quotes)].sort(() => Math.random() - 0.5);
  if (gameType === 'rhyme') return [...(RHYME_BANK[pack] || RHYME_BANK.easy)].sort(() => Math.random() - 0.5);
  if (gameType === 'wordle') return [...(WORDLE_BANK[pack] || WORDLE_BANK.common)].sort(() => Math.random() - 0.5);
  return [];
}

module.exports = { initBattleHandlers, battleRooms, getBattleItems, QUIZ_BANK, HANGMAN_BANK, TABOO_BANK, SCRAMBLE_BANK, TYPERACE_BANK, WORDLE_BANK, RHYME_BANK };
