#!/usr/bin/env node
/**
 * TheGaming.co — Bot Testing System
 * 
 * Usage:
 *   node test-bots.js                          # 4 bots, join existing room, auto-detect game
 *   node test-bots.js --bots 8                 # 8 bots
 *   node test-bots.js --join ABCD              # join specific room (--room also works)
 *   node test-bots.js --game werewolf --bots 8 # create room for werewolf with 8 bots
 *   node test-bots.js --game imposter          # create imposter room with 4 bots
 *   node test-bots.js --host                   # first bot becomes host (creates room)
 *   node test-bots.js --url http://localhost:3001  # custom server
 *   node test-bots.js --delay 2000             # 2s delay between bot actions (default 1500)
 * 
 * Games supported:
 *   imposter, spyfall, werewolf, herd-mentality, categories,
 *   word-association, codenames, trivia-royale, this-or-that-party,
 *   hot-takes-party, never-ever-party, bet-or-bluff, power-struggle,
 *   most-likely-to, ludo, word-bomb, charades, secret-roles, spectrum,
 *   npat, punchline, fools-gold, two-truths, insider, celebrity,
 *   fishbowl
 *
 * Not supported (drawing games): fake-artist, broken-pictionary,
 *   doodle-duel, sketch-guess
 */

const io = require('socket.io-client');

// ═══════════════════════════════════════════════
// CLI ARGS
// ═══════════════════════════════════════════════
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const i = args.indexOf('--' + name);
  if (i === -1) return defaultVal;
  if (typeof defaultVal === 'boolean') return true;
  return args[i + 1] || defaultVal;
}

const SERVER = getArg('url', 'https://web-production-519c7.up.railway.app');
const BOT_COUNT = parseInt(getArg('bots', '4'));
const ROOM_CODE = getArg('join', null) || getArg('room', null);
const GAME_TYPE = getArg('game', null);
const HOST_MODE = getArg('host', false);
const ACTION_DELAY = parseInt(getArg('delay', '1500'));
const AUTO_START = getArg('start', false);
const CUSTOM_Q = getArg('custom', false); // use test custom questions
const QUIET = getArg('quiet', false); // reduce log spam for large bot counts

// Test custom questions for each game type
const TEST_CUSTOM_QUESTIONS = {
  'trivia-royale': 'What color is the sky?, Blue, Red, Green, Yellow\nHow many legs does a dog have?, 4, 2, 6, 8\nWhat is 2+2?, 4, 3, 5, 22\nWhich is a fruit?, Apple, Chair, Car, Rock\nWhat do bees make?, Honey, Milk, Bread, Juice',
  'this-or-that-party': 'Cats, Dogs\nPizza, Tacos\nBeach, Mountains\nNetflix, YouTube\nSummer, Winter',
  'hot-takes-party': 'Pineapple belongs on pizza\nMonday is the worst day\nCereal is soup\nHot dogs are sandwiches\nWater is wet',
  'never-ever-party': 'eaten a whole pizza alone\npulled an all-nighter\ntalked to a pet like a person\nforgotten my own birthday\ncried during a movie',
  'bet-or-bluff': 'How many countries in the world?, countries\nHow many bones in the human body?, bones\nHow many keys on a piano?, keys\nHow many teeth does an adult have?, teeth\nHow many states in the US?, states',
  'most-likely-to': 'Who is most likely to become famous?\nWho would survive a zombie apocalypse?\nWho would win a cooking competition?\nWho would forget their own birthday?\nWho talks to their pets?',
  'punchline': 'Why did the chicken cross the road?\nWhat do you call a lazy kangaroo?\nWhat happens when you eat too much?\nWhy do programmers prefer dark mode?\nWhat did the ocean say to the beach?'
};

// ═══════════════════════════════════════════════
// BOT NAMES — 99 unique gamer tags
// ═══════════════════════════════════════════════
const BOT_NAMES = [
  // Batch 1 (1-20)
  'xShadowKing', 'NoobMaster69', 'VibeCheck', 'CouchPotato', 'BigBrainTim',
  'SaltyPretzel', 'PixelNinja', 'GlizzyGoblin', 'ChaoticNeutral', 'AFK_Andy',
  'TouchGrass', 'RizzLord', 'BotOrNot', 'SkillIssue', 'MainCharacter',
  'NPC_Energy', 'GigaChad42', 'CtrlAltDef', 'LaggingOut', 'TrustMeBro',
  // Batch 2 (21-40)
  'WifiWarrior', 'CozyGamer', 'SpeedRunner', 'LootGoblin', 'CampKing',
  'RNGesus', 'OneMoreGame', 'JustVibing', 'SendHelp', 'ProProcrastin8r',
  'ZeroDeaths', 'EZClap', 'CriticalHit', 'FullSend', 'YeetMaster',
  'gg_no_re', 'RespawnQueen', 'IdleHero', 'PogChamp', 'DistractedDan',
  // Batch 3 (41-60)
  'BubbleTeaBae', 'SnackBreak', 'OverThinking', 'PlotTwist', 'NapQueen',
  'ChillPill', 'VibinHard', 'SunsetChaser', 'MidnightOwl', 'CloudSurfer',
  'MoonWalker', 'PixelDust', 'NeonGlow', 'StarGazer', 'DayDreamer',
  'GhostMode', 'SilentStorm', 'FrostByte', 'BlazeTrial', 'ThunderClap',
  // Batch 4 (61-80)
  'CasualKing', 'TryHardTina', 'LuckyShot', 'ClutchGod', 'SneakyPete',
  'FloorGang', 'CeilingGang', 'BuffaloWing', 'TacoTuesday', 'PizzaTime',
  'BrainFreeze', 'PlotArmor', 'SideQuest', 'BossMusic', 'FinalForm',
  'PowerNap', 'ZenMode', 'CheatCode', 'WarpSpeed', 'GravityOff',
  // Batch 5 (81-99)
  'QuantumLeap', 'TimeLoop', 'GlitchHop', 'DataDrop', 'ByteSize',
  'PixelPusher', 'CodeBreaker', 'LoopHole', 'StackOver', 'NullPointer',
  'DeadPixel', 'LazyLoad', 'HotFix', 'DarkMode', 'LightTheme',
  'IncognitoTab', 'CacheMoney', 'CloudNine', 'LastOnline'
];

// Connection batching for large bot counts
const BATCH_SIZE = 10; // connect 10 at a time
const BATCH_DELAY = 1500; // 1.5s between batches

// ═══════════════════════════════════════════════
// RANDOM HELPERS
// ═══════════════════════════════════════════════
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const wait = ms => new Promise(r => setTimeout(r, ms + Math.random() * 500));

const CLUE_WORDS = [
  'interesting', 'round', 'colorful', 'fun', 'warm', 'cold', 'big', 'small',
  'delicious', 'scary', 'exciting', 'beautiful', 'old', 'new', 'shiny', 'dark',
  'loud', 'quiet', 'fast', 'slow', 'heavy', 'light', 'soft', 'hard', 'smooth',
  'rough', 'sweet', 'sour', 'spicy', 'fresh', 'classic', 'modern', 'popular',
  'traditional', 'unique', 'common', 'rare', 'famous', 'useful', 'important'
];

const HERD_ANSWERS = [
  'pizza', 'dog', 'blue', 'summer', 'football', 'car', 'apple', 'water',
  'happy', 'love', 'beach', 'music', 'sleep', 'money', 'family', 'friends',
  'chocolate', 'coffee', 'phone', 'movie', 'yes', 'no', 'maybe'
];

const CATEGORY_ANSWERS = [
  'apple', 'banana', 'brazil', 'canada', 'red', 'blue', 'guitar', 'piano',
  'football', 'basketball', 'dog', 'cat', 'pizza', 'burger', 'water', 'juice',
  'toyota', 'honda', 'nike', 'adidas', 'netflix', 'spotify', 'google', 'amazon'
];

const WORD_ASSOC = [
  'sun', 'moon', 'star', 'fire', 'water', 'earth', 'sky', 'cloud', 'rain',
  'snow', 'tree', 'flower', 'ocean', 'river', 'mountain', 'forest', 'desert'
];

const PUNCHLINE_ANSWERS = [
  'my ex', 'a raccoon in a tuxedo', 'the entire state of Florida',
  'someone who peaked in middle school', 'a sentient WiFi router',
  'that one aunt at Thanksgiving', 'a man named Gerald', 'pure chaos',
  'three raccoons in a trench coat', 'the CEO of bad decisions',
  'a conspiracy theorist with a podcast', 'my sleep schedule',
  'an overconfident pigeon', 'the ghost of a mediocre comedian',
  'a very confused llama', 'whoever invented Mondays'
];

const FAKE_TRIVIA_ANSWERS = [
  'approximately 42', 'the ancient Romans', 'a guy named Steve',
  'it was actually a hoax', 'nobody really knows', 'about 3.50',
  'the French, probably', 'a series of unfortunate events',
  'technically it was cheese', 'the Queen of England', 'a wild guess',
  'surprisingly, dolphins', 'everyone was wrong', 'the year 1847'
];

const TWO_TRUTHS_POOL = [
  'I have been skydiving', 'I can speak three languages', 'I met a celebrity',
  'I have a pet snake', 'I once won a eating contest', 'I can juggle',
  'I have been on TV', 'I broke a bone twice', 'I can do a backflip',
  'I have been to 10 countries', 'I played in a band', 'I can solve a Rubik\'s cube',
  'I swam with sharks', 'I was born on a holiday', 'I have a twin',
  'I ran a marathon', 'I lived on a boat', 'I can whistle with my fingers'
];

const CELEB_WORDS = [
  'pizza', 'elephant', 'basketball', 'Shakespeare', 'volcano',
  'astronaut', 'spaghetti', 'penguin', 'sunflower', 'tornado',
  'karate', 'dinosaur', 'surfing', 'fireworks', 'unicorn',
  'detective', 'submarine', 'cowboy', 'ballerina', 'werewolf'
];

const INSIDER_GUESSES = [
  'is it an animal?', 'is it food?', 'is it bigger than a car?',
  'can you hold it?', 'is it alive?', 'is it man-made?',
  'is it found indoors?', 'does it move?', 'is it colorful?',
  'can you eat it?', 'is it expensive?', 'is it common?'
];

// NPAT answers by starting letter (partial — bots pick from these)
const NPAT_NAMES = {
  fallback: ['Alex', 'Ben', 'Clara', 'Diana', 'Eric', 'Fiona', 'George', 'Hannah']
};
const NPAT_PLACES = {
  fallback: ['Amsterdam', 'Berlin', 'Cairo', 'Denver', 'Edinburgh', 'Florence', 'Geneva']
};
const NPAT_ANIMALS = {
  fallback: ['Ant', 'Bear', 'Cat', 'Dog', 'Eagle', 'Fox', 'Goat', 'Horse']
};
const NPAT_THINGS = {
  fallback: ['Apple', 'Book', 'Chair', 'Door', 'Eraser', 'Fan', 'Glass', 'Hat']
};

// ═══════════════════════════════════════════════
// BOT CLASS
// ═══════════════════════════════════════════════
class Bot {
  constructor(name, index) {
    this.name = name;
    this.index = index;
    this.socket = null;
    this.roomCode = null;
    this.role = null;
    this.gameType = null;
    this.isHost = false;
    this.connected = false;
    this.players = [];
  }

  log(msg) {
    if (QUIET && !msg.includes('✅') && !msg.includes('❌') && !msg.includes('🏆') && !msg.includes('Created') && !msg.includes('Game started')) return;
    const tag = this.isHost ? '👑' : '🤖';
    console.log(`  ${tag} [${this.name}] ${msg}`);
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = io(SERVER, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 30000
      });

      this.socket.on('connect', () => {
        this.connected = true;
        this.log(`Connected (${this.socket.id})`);
        resolve();
      });

      this.socket.on('connect_error', (err) => {
        this.log(`Connection failed: ${err.message}`);
        reject(err);
      });

      this.socket.on('error', (data) => {
        this.log(`⚠️  Error: ${data.message}`);
      });

      this.socket.on('disconnect', () => {
        this.log('Disconnected');
        this.connected = false;
      });

      // Setup all game handlers
      this.setupHandlers();
    });
  }

  createRoom(gameType) {
    this.isHost = true;
    this.gameType = gameType;
    return new Promise((resolve) => {
      this.socket.once('room-created', (data) => {
        this.roomCode = data.roomCode;
        this.log(`✅ Created room: ${this.roomCode} (${gameType})`);
        resolve(this.roomCode);
      });
      this.socket.emit('create-room', {
        playerName: this.name,
        gameType: gameType,
        isPremium: true,
        cosmetics: null,
        userId: null
      });
    });
  }

  joinRoom(roomCode) {
    return new Promise((resolve, reject) => {
      this.roomCode = roomCode;

      this.socket.once('room-joined', (data) => {
        this.log(`✅ Joined room: ${roomCode}`);
        if (data.room) {
          this.gameType = data.room.gameType;
          this.players = data.room.players || [];
        }
        resolve();
      });

      this.socket.once('join-error', (data) => {
        this.log(`❌ Join failed: ${data.message}`);
        reject(new Error(data.message));
      });

      this.socket.emit('join-room', {
        roomCode: roomCode,
        playerName: this.name,
        isPremium: true,
        cosmetics: null,
        userId: null
      });
    });
  }

  startGame(category, opts = {}) {
    this.log(`🎮 Starting game: ${this.gameType}`);
    const data = {
      roomCode: this.roomCode,
      category: category || 'random',
      ...opts
    };
    this.socket.emit('start-game', data);
  }

  // ═══════════════════════════════════════════════
  // GAME EVENT HANDLERS
  // ═══════════════════════════════════════════════
  setupHandlers() {
    const s = this.socket;

    // Track room updates
    s.on('player-joined', (data) => {
      if (data.room) this.players = data.room.players;
    });
    s.on('player-disconnected', (data) => {
      if (data.room) this.players = data.room.players;
    });

    // Game started
    s.on('game-started', async (data) => {
      this.gameType = data.gameType;
      this.log(`🎮 Game started: ${data.gameType}`);

      // Codenames: auto-join a team
      if (data.gameType === 'codenames') {
        await wait(1000 + this.index * 500);
        const team = this.index % 2 === 0 ? 'red' : 'blue';
        const role = this.index < 2 ? 'spymaster' : 'operative';
        this.codenamesTeam = team;
        this.codenamesRole = role;
        this.log(`🔤 Joining ${team} team as ${role}`);
        s.emit('codenames-join-team', { roomCode: this.roomCode, team, role });
      }
    });

    // ── IMPOSTER ──
    s.on('role-assigned', async (data) => {
      this.role = data;
      if (data.role === 'imposter' || data.isImposter) {
        this.log(`🎭 Role: IMPOSTER (no word)`);
      } else {
        this.log(`👤 Role: ${data.role || 'player'} | Word: ${data.word || '?'}`);
      }
    });

    s.on('clue-phase-start', async (data) => {
      if (this.gameType !== 'imposter' && this.gameType !== 'spyfall') return;
      await wait(ACTION_DELAY + Math.random() * 2000);
      const clue = pick(CLUE_WORDS) + ' ' + pick(CLUE_WORDS);
      this.log(`💬 Submitting clue: "${clue}"`);
      s.emit('submit-clue', { roomCode: this.roomCode, clue });
    });

    s.on('voting-phase-start', async (data) => {
      await wait(ACTION_DELAY + Math.random() * 2000);
      // Vote for a random player (not self)
      const others = (data.players || this.players).filter(p => p.id !== s.id);
      if (others.length > 0) {
        const target = pick(others);
        this.log(`🗳️  Voting for: ${target.name}`);
        s.emit('submit-vote', { roomCode: this.roomCode, votedPlayerId: target.id });
      }
    });

    s.on('game-results', (data) => {
      this.log(`🏆 Game over! Imposter ${data.imposterCaught ? 'caught' : 'wins'}!`);
    });

    // ── SPYFALL ──
    s.on('question-phase-start', async (data) => {
      if (this.gameType === 'spyfall') {
        this.log(`📍 Location: ${data.location || 'SPY - no location'} | Role: ${data.role || 'spy'}`);
      }
    });

    s.on('turn-changed', (data) => {
      this.log(`🔄 Turn: ${data.currentPlayer}`);
    });

    s.on('vote-called', async (data) => {
      await wait(ACTION_DELAY);
      const others = this.players.filter(p => p.id !== s.id);
      if (others.length > 0) {
        const target = pick(others);
        this.log(`🗳️  Voting for: ${target.name}`);
        s.emit('submit-vote', { roomCode: this.roomCode, votedPlayerId: target.id });
      }
    });

    // ── WEREWOLF ──
    s.on('werewolf-team', (data) => {
      this.log(`🐺 Werewolf team: ${data.werewolves.map(w => w.name).join(', ')}`);
    });

    s.on('night-phase-start', async (data) => {
      this.log(`🌙 Night — Active role: ${data.activeRole || '?'}`);

      if (!this.role) return;
      await wait(ACTION_DELAY);

      const alive = data.alivePlayers || [];
      const others = alive.filter(p => p.name !== this.name);
      if (others.length === 0) return;
      const target = pick(others);

      const roleName = this.role.role || '';

      // Server expects player NAMES as targetId, not socket IDs
      if ((roleName === 'werewolf' || roleName === 'alpha-wolf') && data.activeRole === 'werewolf') {
        const nonMafia = others.filter(p => !p.isMafia && !p.isWerewolf);
        const wolfTarget = nonMafia.length > 0 ? pick(nonMafia) : target;
        this.log(`🐺 Targeting: ${wolfTarget.name}`);
        s.emit('night-action', { roomCode: this.roomCode, actionType: 'werewolf-target', targetId: wolfTarget.name });
      } else if (roleName === 'seer' && data.activeRole === 'seer') {
        this.log(`🔮 Checking: ${target.name}`);
        s.emit('night-action', { roomCode: this.roomCode, actionType: 'seer-check', targetId: target.name });
      } else if (roleName === 'doctor' && data.activeRole === 'doctor') {
        this.log(`💉 Saving: ${target.name}`);
        s.emit('night-action', { roomCode: this.roomCode, actionType: 'doctor-save', targetId: target.name });
      }
    });

    s.on('seer-vision', (data) => {
      this.log(`🔮 Vision: ${data.playerName} is ${data.isWerewolf ? '🐺 WEREWOLF' : '👤 innocent'}`);
    });

    s.on('day-phase-start', (data) => {
      this.log(`☀️  Day phase — ${data.killed ? data.killed + ' was killed' : 'no deaths'}`);
    });

    s.on('voting-phase-start', async (data) => {
      if (this.gameType !== 'werewolf') return;
      await wait(ACTION_DELAY + Math.random() * 2000);
      const alive = data.alivePlayers || [];
      const others = alive.filter(p => p.name !== this.name);
      if (others.length > 0) {
        const target = pick(others);
        this.log(`🗳️  Voting to eliminate: ${target.name}`);
        s.emit('submit-vote', { roomCode: this.roomCode, votedPlayerId: target.name });
      }
    });

    s.on('player-eliminated', (data) => {
      this.log(`💀 ${data.playerName} was eliminated (${data.role || 'unknown role'})`);
    });

    s.on('game-over', (data) => {
      this.log(`🏆 Game over! Winners: ${data.winners || data.winner || 'unknown'}`);
    });

    // ── THINK ALIKE ──
    s.on('question-phase', async (data) => {
      if (this.gameType !== 'herd-mentality') return;
      this.log(`❓ Question: ${data.question}`);
      await wait(ACTION_DELAY + Math.random() * 3000);
      const answer = pick(HERD_ANSWERS);
      this.log(`📝 Answer: "${answer}"`);
      s.emit('submit-answer', { roomCode: this.roomCode, answer });
    });

    s.on('results-phase', (data) => {
      if (this.gameType === 'herd-mentality') {
        this.log(`📊 Results — Herd answer: "${data.herdAnswer}" | Pink cow: ${data.pinkCowHolder || 'none'}`);
      }
    });

    s.on('scoreboard-phase', (data) => {
      if (this.gameType === 'herd-mentality') {
        this.log(`📋 Scores: ${JSON.stringify(data.scores || {})}`);
      }
    });

    // ── CATEGORIES ──
    s.on('categories-round-start', async (data) => {
      this.log(`📂 Category: "${data.category}" — Letter: ${data.letter}`);
      await wait(ACTION_DELAY + Math.random() * 3000);
      const answer = pick(CATEGORY_ANSWERS);
      this.log(`📝 Answer: "${answer}"`);
      s.emit('categories-answer', { roomCode: this.roomCode, answer });
    });

    s.on('categories-answer-result', (data) => {
      this.log(`${data.valid ? '✅' : '❌'} Answer ${data.valid ? 'accepted' : 'rejected'}`);
    });

    s.on('categories-challenge', async (data) => {
      await wait(ACTION_DELAY);
      const vote = Math.random() > 0.5;
      this.log(`⚖️  Challenge vote: ${vote ? 'valid' : 'invalid'}`);
      s.emit('categories-challenge-vote', { roomCode: this.roomCode, vote });
    });

    // ── WORD ASSOCIATION ──
    s.on('word-association-turn', async (data) => {
      this.log(`💬 Word Association — Current: "${data.currentWord}" — Player: ${data.currentPlayer}`);
      if (data.currentPlayer === this.name) {
        await wait(ACTION_DELAY);
        const word = pick(WORD_ASSOC);
        this.log(`📝 Submitting: "${word}"`);
        s.emit('word-association-submit', { roomCode: this.roomCode, word });
      }
    });

    // ── CODENAMES ──
    s.on('codenames-state', async (data) => {
      this.log(`🔤 Codenames update — ${data.currentTeam}'s turn`);
    });

    // ── TRIVIA ROYALE ──
    s.on('trivia-question', async (data) => {
      this.log(`❓ Trivia: "${(data.question || '').substring(0, 50)}..."`);
      await wait(ACTION_DELAY + Math.random() * 3000);
      const answer = Math.floor(Math.random() * (data.options ? data.options.length : 4));
      this.log(`📝 Answer: option ${answer}`);
      s.emit('trivia-answer', { roomCode: this.roomCode, answerIndex: answer });
    });

    s.on('trivia-results', (data) => {
      this.log(`📊 Trivia round results — correct: "${data.correctAnswer}"`);
    });

    // ── THIS OR THAT ──
    s.on('thisorthat-party-question', async (data) => {
      this.log(`🔀 This or That: "${data.optionA}" vs "${data.optionB}"`);
      await wait(ACTION_DELAY + Math.random() * 2000);
      const choice = Math.random() > 0.5 ? 'A' : 'B';
      this.log(`📝 Choice: ${choice}`);
      s.emit('thisorthat-party-vote', { roomCode: this.roomCode, choice });
    });

    // ── HOT TAKES ──
    s.on('hottakes-party-statement', async (data) => {
      this.log(`🔥 Hot Take: "${(data.statement || '').substring(0, 50)}..."`);
      await wait(ACTION_DELAY + Math.random() * 2000);
      const rating = Math.floor(Math.random() * 5) + 1; // 1-5
      this.log(`📝 Rating: ${rating}/5`);
      s.emit('hottakes-party-rate', { roomCode: this.roomCode, rating });
    });

    // ── NEVER HAVE I EVER ──
    s.on('neverever-party-statement', async (data) => {
      this.log(`🙈 Never Ever: "${(data.statement || '').substring(0, 50)}..."`);
      await wait(ACTION_DELAY + Math.random() * 2000);
      const answer = Math.random() > 0.4; // 60% chance "I have"
      this.log(`📝 ${answer ? 'I have ✋' : 'Never 🚫'}`);
      s.emit('neverever-party-answer', { roomCode: this.roomCode, answer });
    });

    // ── BET OR BLUFF ──
    s.on('betorbluff-question', async (data) => {
      this.log(`💰 Bet or Bluff Q: "${(data.question || '').substring(0, 50)}..."`);
      await wait(ACTION_DELAY + Math.random() * 2000);
      const guess = Math.floor(Math.random() * 50) + 1;
      this.log(`📝 Guessing: ${guess}`);
      s.emit('betorbluff-guess', { roomCode: this.roomCode, guess });
    });

    s.on('betorbluff-betting-phase', async (data) => {
      this.log(`💰 Betting phase - ${data.guesses?.length || 0} guesses`);
      await wait(ACTION_DELAY + Math.random() * 2000);
      const guesses = data.guesses || [];
      if (guesses.length > 0) {
        const target = pick(guesses);
        const chips = (data.chips && data.chips[this.name]) || 100;
        const betAmount = Math.min(Math.floor(Math.random() * 50) + 10, chips);
        this.log(`📝 Betting ${betAmount} on ${target.playerName}`);
        s.emit('betorbluff-bet', { roomCode: this.roomCode, targetPlayerId: target.playerId, betAmount });
      }
    });

    // ── MOST LIKELY TO ──
    s.on('mostlikelyto-question', async (data) => {
      this.log(`🎯 Most Likely To: "${(data.question || '').substring(0, 50)}..."`);
      await wait(ACTION_DELAY + Math.random() * 2000);
      const others = this.players.filter(p => p.id !== s.id);
      if (others.length > 0) {
        const target = pick(others);
        this.log(`📝 Voting: ${target.name}`);
        s.emit('mostlikelyto-vote', { roomCode: this.roomCode, votedPlayerId: target.id });
      }
    });

    // ── LUDO ──
    s.on('ludo-state', (data) => {
      this.log(`🎲 Ludo — Current: ${data.currentPlayer} | Phase: ${data.phase}`);
    });

    s.on('ludo-your-turn', async () => {
      await wait(ACTION_DELAY);
      this.log(`🎲 Rolling dice...`);
      s.emit('ludo-roll', { roomCode: this.roomCode });
    });

    s.on('ludo-roll-result', async (data) => {
      this.log(`🎲 Rolled: ${data.value}`);
      if (data.movablePieces && data.movablePieces.length > 0) {
        await wait(500);
        const piece = pick(data.movablePieces);
        this.log(`🎲 Moving piece ${piece}`);
        s.emit('ludo-move', { roomCode: this.roomCode, pieceId: piece });
      }
    });

    // ── WORD BOMB ──
    s.on('wordbomb-turn', async (data) => {
      if (data.currentPlayer === this.name) {
        await wait(ACTION_DELAY);
        const word = pick(['apple', 'banana', 'cherry', 'dance', 'eagle', 'forest', 'grape', 'house']);
        this.log(`💣 Word: "${word}"`);
        s.emit('wordbomb-answer', { roomCode: this.roomCode, word });
      }
    });

    // ── CHARADES ──
    s.on('charades-turn', async (data) => {
      if (data.guesser) {
        await wait(ACTION_DELAY + Math.random() * 3000);
        const guess = pick(['dog', 'cat', 'swimming', 'dancing', 'cooking', 'driving', 'flying', 'sleeping']);
        this.log(`🎭 Guessing: "${guess}"`);
        s.emit('charades-guess', { roomCode: this.roomCode, guess });
      }
    });

    // ── POWER STRUGGLE (Coup) ──
    s.on('ps-state', async (data) => {
      this.log(`⚔️  PS state — Turn: ${data.currentPlayer} | Coins: ${data.coins} | Cards: ${(data.myCards || []).length}`);
      this.psCards = data.myCards || [];
      this.psCoins = data.coins || 0;

      if (!data.isMyTurn) return;
      await wait(ACTION_DELAY);
      const coins = data.coins || 0;
      const others = this.players.filter(p => p.id !== s.id);
      const target = others.length > 0 ? pick(others) : null;

      let action, actionData;
      if (coins >= 10) {
        action = 'coup';
        actionData = { roomCode: this.roomCode, action: 'coup', target: target?.id };
      } else if (coins >= 7 && Math.random() > 0.4) {
        action = 'coup';
        actionData = { roomCode: this.roomCode, action: 'coup', target: target?.id };
      } else {
        const actions = ['income', 'foreign-aid', 'duke'];
        if (coins >= 3 && target) actions.push('assassin');
        if (target) actions.push('captain');
        action = pick(actions);
        actionData = { roomCode: this.roomCode, action, target: target?.id };
      }
      this.log(`⚔️  Action: ${action}${target ? ' → ' + target.name : ''}`);
      s.emit('ps-action', actionData);
    });

    s.on('ps-action-pending', async (data) => {
      await wait(ACTION_DELAY);
      const roll = Math.random();
      let response;
      if (data.canChallenge && roll < 0.2) {
        response = 'challenge';
        this.log(`⚔️  Challenging ${data.actor}'s ${data.action}!`);
      } else if (data.canBlock && roll < 0.35) {
        response = 'block';
        this.log(`🛡️  Blocking ${data.actor}'s ${data.action}`);
      } else {
        response = 'allow';
        this.log(`✅ Allowing ${data.actor}'s ${data.action}`);
      }
      s.emit('ps-respond', { roomCode: this.roomCode, response });
    });

    s.on('ps-choose-influence', async (data) => {
      await wait(ACTION_DELAY);
      this.log(`💀 Must lose influence: ${data.reason}`);
      s.emit('ps-lose-influence', { roomCode: this.roomCode, cardIndex: 0 });
    });

    s.on('ps-game-over', (data) => {
      this.log(`🏆 Power Struggle over! Winner: ${data.winner}`);
    });

    // ── SECRET ROLES (Avalon) ──
    s.on('avalon-roles', (data) => {
      this.role = data;
      this.log(`🏰 Avalon role: ${data.role} (${data.team})`);
    });

    s.on('avalon-team-select', async (data) => {
      this.log(`🏰 Quest ${data.quest} — Leader: ${data.leader} needs ${data.teamSize} players`);
      // If we're the leader, propose a team
      if (data.leader === this.name) {
        await wait(ACTION_DELAY);
        const available = this.players.map(p => p.name);
        const team = [];
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        for (let i = 0; i < data.teamSize && i < shuffled.length; i++) {
          team.push(shuffled[i]);
        }
        this.log(`🏰 Proposing team: ${team.join(', ')}`);
        s.emit('avalon-propose-team', { roomCode: this.roomCode, team });
      }
    });

    s.on('avalon-team-vote', async (data) => {
      await wait(ACTION_DELAY);
      const vote = Math.random() > 0.35 ? 'approve' : 'reject';
      this.log(`🗳️  Team vote: ${vote}`);
      s.emit('avalon-vote', { roomCode: this.roomCode, vote });
    });

    s.on('avalon-team-rejected', (data) => {
      this.log(`❌ Team rejected (${data.rejections} rejections)`);
    });

    s.on('avalon-quest', async (data) => {
      await wait(ACTION_DELAY);
      // Evil players might fail the quest
      const isEvil = this.role && this.role.team === 'evil';
      const vote = (isEvil && Math.random() > 0.4) ? 'fail' : 'succeed';
      this.log(`⚔️  Quest vote: ${vote}`);
      s.emit('avalon-quest-vote', { roomCode: this.roomCode, vote });
    });

    s.on('avalon-quest-result', (data) => {
      this.log(`📊 Quest ${data.success ? 'SUCCEEDED' : 'FAILED'} (${data.fails} fails)`);
    });

    s.on('avalon-game-over', (data) => {
      this.log(`🏆 Avalon over! ${data.winner} wins — ${data.reason}`);
    });

    // ── CODENAMES (full bot support) ──
    s.on('codenames-started', (data) => {
      this.log(`🔤 Codenames started`);
    });

    s.on('codenames-clue-given', async (data) => {
      this.log(`🔤 Clue: "${data.clue?.word}" (${data.clue?.number})`);
      // If we're an operative on the current team, guess a word
      const gs = data.gameState;
      if (!gs) return;
      const isOurTurn = (gs.currentTeam === 'red' && this.codenamesTeam === 'red') ||
                        (gs.currentTeam === 'blue' && this.codenamesTeam === 'blue');
      if (isOurTurn && this.codenamesRole === 'operative') {
        await wait(ACTION_DELAY + Math.random() * 2000);
        // Pick a random unrevealed word
        const unrevealed = (gs.words || [])
          .map((w, i) => ({ ...w, index: i }))
          .filter(w => !w.revealed);
        if (unrevealed.length > 0) {
          const target = pick(unrevealed);
          this.log(`🔤 Guessing: "${target.word}"`);
          s.emit('codenames-select-word', { roomCode: this.roomCode, wordIndex: target.index });
        }
      }
    });

    s.on('codenames-word-revealed', (data) => {
      this.log(`🔤 Revealed: ${data.color}`);
    });

    s.on('codenames-turn-ended', (data) => {
      this.log(`🔤 Turn ended`);
    });

    // Codenames spymaster gives clue
    s.on('codenames-state', async (data) => {
      if (!data || !data.currentTeam) return;
      const isOurTurn = data.currentTeam === this.codenamesTeam;
      if (isOurTurn && this.codenamesRole === 'spymaster' && data.phase === 'clue') {
        await wait(ACTION_DELAY);
        const clue = pick(CLUE_WORDS);
        const number = Math.floor(Math.random() * 2) + 1;
        this.log(`🔤 Giving clue: "${clue}" ${number}`);
        s.emit('codenames-give-clue', { roomCode: this.roomCode, word: clue, number });
      }
    });

    // ── SPECTRUM / WAVELENGTH ──
    s.on('wavelength-round', async (data) => {
      this.log(`🌈 Spectrum: "${data.leftLabel}" ← → "${data.rightLabel}"`);
      if (data.isPsychic) {
        await wait(ACTION_DELAY);
        const clue = pick(CLUE_WORDS);
        this.log(`🌈 Psychic clue: "${clue}"`);
        s.emit('wavelength-clue', { roomCode: this.roomCode, clue });
      }
    });

    s.on('wavelength-clue', async (data) => {
      this.log(`🌈 Clue from ${data.psychic}: "${data.clue}"`);
      await wait(ACTION_DELAY + Math.random() * 2000);
      const guess = Math.floor(Math.random() * 101); // 0-100
      this.log(`🌈 Guessing position: ${guess}`);
      s.emit('wavelength-guess', { roomCode: this.roomCode, guess });
    });

    s.on('wavelength-results', (data) => {
      this.log(`📊 Spectrum results — Target: ${data.target}`);
    });

    s.on('wavelength-game-over', (data) => {
      this.log(`🏆 Spectrum over! Winner: ${data.winner}`);
    });

    // ── NPAT ──
    s.on('npat-round', async (data) => {
      this.log(`📝 NPAT Round ${data.round} — Letter: ${data.letter}`);
      await wait(ACTION_DELAY + Math.random() * 3000);
      const letter = (data.letter || 'A').toUpperCase();
      const categories = data.categories || ['Name', 'Place', 'Animal', 'Thing'];
      const answers = {};
      categories.forEach(cat => {
        const catLower = cat.toLowerCase();
        let pool;
        if (catLower.includes('name')) pool = NPAT_NAMES.fallback;
        else if (catLower.includes('place')) pool = NPAT_PLACES.fallback;
        else if (catLower.includes('animal')) pool = NPAT_ANIMALS.fallback;
        else pool = NPAT_THINGS.fallback;
        // Try to find one starting with the right letter, else use any
        const matching = pool.filter(w => w[0].toUpperCase() === letter);
        answers[cat] = matching.length > 0 ? pick(matching) : (letter + pick(pool).substring(1));
      });
      this.log(`📝 Answers: ${JSON.stringify(answers)}`);
      s.emit('npat-submit', { roomCode: this.roomCode, answers });
    });

    s.on('npat-results', (data) => {
      this.log(`📊 NPAT results for letter ${data.letter}`);
    });

    s.on('npat-gameover', (data) => {
      this.log(`🏆 NPAT over! Winner: ${data.winner}`);
    });

    // ── PUNCHLINE ──
    s.on('punchline-prompt', async (data) => {
      this.log(`😂 Punchline: "${(data.prompt || '').substring(0, 50)}..."`);
      await wait(ACTION_DELAY + Math.random() * 3000);
      const answer = pick(PUNCHLINE_ANSWERS);
      this.log(`📝 Answer: "${answer}"`);
      s.emit('punchline-answer', { roomCode: this.roomCode, answer });
    });

    s.on('punchline-voting', async (data) => {
      this.log(`😂 Voting on ${(data.answers || []).length} punchlines`);
      await wait(ACTION_DELAY + Math.random() * 2000);
      const answers = data.answers || [];
      if (answers.length > 0) {
        const vote = pick(answers);
        this.log(`📝 Voted for answer #${vote.index}`);
        s.emit('punchline-vote', { roomCode: this.roomCode, answerIndex: vote.index });
      }
    });

    s.on('punchline-results', (data) => {
      this.log(`📊 Punchline results`);
    });

    s.on('punchline-game-over', (data) => {
      this.log(`🏆 Punchline over! Winner: ${data.winner}`);
    });

    // ── FOOLS GOLD ──
    s.on('fools-question', async (data) => {
      this.log(`🤥 Fools Gold: "${(data.question || '').substring(0, 50)}..."`);
      await wait(ACTION_DELAY + Math.random() * 3000);
      const answer = pick(FAKE_TRIVIA_ANSWERS);
      this.log(`📝 Fake answer: "${answer}"`);
      s.emit('fools-submit-answer', { roomCode: this.roomCode, playerName: this.name, answer });
    });

    s.on('fools-voting', async (data) => {
      this.log(`🤥 Voting — ${(data.answers || []).length} answers`);
      await wait(ACTION_DELAY + Math.random() * 2000);
      const answers = data.answers || [];
      if (answers.length > 0) {
        const vote = pick(answers);
        this.log(`📝 Voted for: "${vote.text}"`);
        s.emit('fools-submit-vote', { roomCode: this.roomCode, playerName: this.name, answerId: vote.id });
      }
    });

    s.on('fools-results', (data) => {
      this.log(`📊 Fools Gold results`);
    });

    s.on('fools-game-over', (data) => {
      this.log(`🏆 Fools Gold over!`);
    });

    // ── TWO TRUTHS AND A LIE ──
    s.on('twotruths-write', async (data) => {
      this.log(`✌️  Two Truths — Round ${data.round} | Writer: ${data.currentPlayer}`);
      if (data.isYourTurn) {
        await wait(ACTION_DELAY + Math.random() * 2000);
        // Pick 3 random statements, one is the "lie"
        const shuffled = [...TWO_TRUTHS_POOL].sort(() => Math.random() - 0.5);
        const statements = [shuffled[0], shuffled[1], shuffled[2]];
        const lieIndex = Math.floor(Math.random() * 3);
        this.log(`📝 Submitting: [${statements.join(', ')}] — lie: #${lieIndex}`);
        s.emit('twotruths-submit', { roomCode: this.roomCode, statements, lieIndex });
      }
    });

    s.on('twotruths-vote', async (data) => {
      if (data.currentPlayer === this.name) return; // Don't vote on own
      this.log(`✌️  Voting on ${data.currentPlayer}'s statements`);
      await wait(ACTION_DELAY + Math.random() * 2000);
      const voteIndex = Math.floor(Math.random() * 3);
      this.log(`📝 Guessing lie is #${voteIndex}`);
      s.emit('twotruths-vote', { roomCode: this.roomCode, voteIndex });
    });

    s.on('twotruths-results', (data) => {
      this.log(`📊 Two Truths results — Lie was #${data.lieIndex}`);
    });

    s.on('twotruths-game-over', (data) => {
      this.log(`🏆 Two Truths over! Winner: ${data.winner}`);
    });

    // ── INSIDER ──
    s.on('insider-roles', async (data) => {
      this.role = data;
      this.log(`🕵️  Insider role: ${data.role}${data.word ? ' | Word: ' + data.word : ''}`);

      // After getting role, periodically guess if we're not the master
      if (data.role === 'master') return;
      await wait(ACTION_DELAY * 2);
      const guessCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < guessCount; i++) {
        await wait(ACTION_DELAY * 2 + Math.random() * 4000);
        if (!this.connected) return;
        const guess = pick(INSIDER_GUESSES);
        this.log(`🕵️  Asking: "${guess}"`);
        s.emit('insider-guess', { roomCode: this.roomCode, guess });
      }
    });

    s.on('insider-word-found', async (data) => {
      this.log(`🕵️  Word found: "${data.word}" by ${data.guesser}`);
      // Vote for who we think the insider is
      await wait(ACTION_DELAY + Math.random() * 2000);
      const others = this.players.filter(p => p.name !== this.name);
      if (others.length > 0) {
        const target = pick(others);
        this.log(`🗳️  Voting insider: ${target.name}`);
        s.emit('insider-vote', { roomCode: this.roomCode, target: target.name });
      }
    });

    s.on('insider-timeout', (data) => {
      this.log(`🕵️  Time's up! Word was "${data.word}"`);
    });

    s.on('insider-results', (data) => {
      this.log(`📊 Insider vote results — Insider was ${data.insider}`);
    });

    s.on('insider-game-over', (data) => {
      this.log(`🏆 Insider over! ${data.winner} wins`);
    });

    // ── CELEBRITY ──
    s.on('celeb-teams', (data) => {
      this.log(`🌟 Celebrity — Teams assigned`);
    });

    s.on('celeb-submit-words', async (data) => {
      await wait(ACTION_DELAY + Math.random() * 2000);
      const count = data.count || 3;
      const shuffled = [...CELEB_WORDS].sort(() => Math.random() - 0.5);
      const words = shuffled.slice(0, count);
      this.log(`📝 Submitting words: ${words.join(', ')}`);
      s.emit('celeb-submit-words', { roomCode: this.roomCode, words });
    });

    s.on('celeb-turn', async (data) => {
      this.log(`🌟 Turn — ${data.team} | Clue giver: ${data.clueGiver} | Round ${data.round}`);
      // If we're the clue giver, auto-skip words or mark correct
      if (data.clueGiver === this.name) {
        // Simulate giving clues — alternate correct/skip
        const doTurn = async () => {
          await wait(ACTION_DELAY);
          if (Math.random() > 0.3) {
            this.log(`🌟 Correct!`);
            s.emit('celeb-correct', { roomCode: this.roomCode });
          } else {
            this.log(`🌟 Skip`);
            s.emit('celeb-skip', { roomCode: this.roomCode });
          }
        };
        // Do a few actions during the turn
        for (let i = 0; i < 3; i++) {
          await doTurn();
        }
      }
    });

    s.on('celeb-score', (data) => {
      this.log(`🌟 Score: A=${data.scoreA} B=${data.scoreB}`);
    });

    s.on('celeb-round-end', (data) => {
      this.log(`🌟 Round ${data.round} ended — A=${data.scoreA} B=${data.scoreB}`);
    });

    s.on('celeb-game-over', (data) => {
      this.log(`🏆 Celebrity over! ${data.winner} wins (A=${data.scoreA} B=${data.scoreB})`);
    });

    // ── FISHBOWL (uses celebrity events) ──
    // Fishbowl shares the celeb-* events, so the celebrity handlers above work for both

    // ── GENERIC CATCHALLS ──
    s.on('round-results', (data) => {
      this.log(`📊 Round results received`);
    });

    s.on('game-ended', (data) => {
      this.log(`🏁 Game ended`);
    });

    s.on('force-return-lobby', () => {
      this.log(`↩️  Returned to lobby`);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.log('🔌 Disconnected');
    }
  }
}

// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════
async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   TheGaming.co — Bot Testing System      ║');
  console.log('╚══════════════════════════════════════════╝\n');
  console.log(`  Server:  ${SERVER}`);
  console.log(`  Bots:    ${BOT_COUNT}`);
  console.log(`  Room:    ${ROOM_CODE || '(will create)'}`);
  console.log(`  Game:    ${GAME_TYPE || '(auto-detect)'}`);
  console.log(`  Delay:   ${ACTION_DELAY}ms`);
  console.log('');

  const bots = [];

  // Create bots
  for (let i = 0; i < BOT_COUNT; i++) {
    bots.push(new Bot(BOT_NAMES[i] || `Bot_${i}`, i));
  }

  // Connect bots in batches
  console.log('📡 Connecting bots...\n');
  let connected = 0;
  for (let batch = 0; batch < Math.ceil(bots.length / BATCH_SIZE); batch++) {
    const start = batch * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, bots.length);
    const batchBots = bots.slice(start, end);

    const results = await Promise.allSettled(
      batchBots.map(bot => bot.connect())
    );

    results.forEach((r, i) => {
      if (r.status === 'fulfilled') connected++;
      else console.error(`  ❌ ${batchBots[i].name}: ${r.reason?.message}`);
    });

    process.stdout.write(`  ✅ ${connected}/${BOT_COUNT} connected\r`);

    if (end < bots.length) await wait(BATCH_DELAY);
  }

  console.log(`\n\n✅ ${connected}/${BOT_COUNT} bots connected!\n`);
  if (connected === 0) { console.log('No bots connected. Exiting.'); process.exit(1); }

  let roomCode = ROOM_CODE;

  // Create or join room
  if (!roomCode && (HOST_MODE || GAME_TYPE)) {
    // First bot creates the room
    const gameType = GAME_TYPE || 'imposter';
    roomCode = await bots[0].createRoom(gameType);

    // Print URL IMMEDIATELY so user can join while bots are still connecting
    console.log('\n  ╔══════════════════════════════════════════════════════╗');
    console.log(`  ║  ROOM CODE: ${roomCode}                                    ║`);
    console.log('  ╚══════════════════════════════════════════════════════╝\n');
    console.log(`  👉 Join now: https://thegaming.co/lobby?game=${gameType}&join=${roomCode}\n`);
    console.log('  Bots are joining in the background. You start the game whenever you\'re ready.\n');

    // Rest join in batches
    let joined = 1;
    for (let batch = 0; batch < Math.ceil((bots.length - 1) / BATCH_SIZE); batch++) {
      const start = 1 + batch * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, bots.length);
      const batchBots = bots.slice(start, end);

      const results = await Promise.allSettled(
        batchBots.map(bot => bot.joinRoom(roomCode))
      );

      results.forEach((r, i) => {
        if (r.status === 'fulfilled') joined++;
        else console.error(`  ❌ ${batchBots[i].name}: ${r.reason?.message}`);
      });

      process.stdout.write(`  📥 ${joined}/${BOT_COUNT} bots joined\r`);

      if (end < bots.length) await wait(BATCH_DELAY);
    }
    console.log(`\n\n  ✅ All ${joined} bots in the room.`);

    // Auto-start with optional custom questions
    if (AUTO_START) {
      await wait(2000);
      const startOpts = {};
      if (CUSTOM_Q && TEST_CUSTOM_QUESTIONS[gameType]) {
        startOpts.customQuestions = TEST_CUSTOM_QUESTIONS[gameType];
        startOpts.roundCount = 5;
        console.log(`  📝 Using custom questions for ${gameType}:\n`);
        TEST_CUSTOM_QUESTIONS[gameType].split('\n').forEach(q => console.log(`     ${q}`));
        console.log('');
      }
      bots[0].startGame('general', startOpts);
      console.log('  🎮 Game auto-started!\n');
    } else {
      console.log('  Start the game from your browser! (or use --start to auto-start)\n');
    }
  } else if (roomCode) {
    // All bots join existing room in batches
    console.log(`\n📥 Joining ${bots.length} bots to room ${roomCode}...\n`);
    let joined = 0;
    for (let batch = 0; batch < Math.ceil(bots.length / BATCH_SIZE); batch++) {
      const start = batch * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, bots.length);
      const batchBots = bots.slice(start, end);

      const results = await Promise.allSettled(
        batchBots.map(bot => bot.joinRoom(roomCode))
      );

      results.forEach((r, i) => {
        if (r.status === 'fulfilled') joined++;
        else console.error(`  ❌ ${batchBots[i].name}: ${r.reason?.message}`);
      });

      process.stdout.write(`  ✅ ${joined}/${BOT_COUNT} joined\r`);

      if (end < bots.length) await wait(BATCH_DELAY);
    }
    console.log(`\n`);
  } else {
    console.log('  ⚠️  No room code or game type specified.');
    console.log('  Use --join ABCD to join a room, or --game werewolf to create one.\n');
    bots.forEach(b => b.disconnect());
    process.exit(0);
  }

  // Keep alive — user starts the game from browser
  console.log('  Press Ctrl+C to disconnect all bots.\n');

  process.on('SIGINT', () => {
    console.log('\n\n🔌 Disconnecting all bots...');
    bots.forEach(b => b.disconnect());
    setTimeout(() => process.exit(0), 500);
  });

  // Heartbeat
  setInterval(() => {
    const alive = bots.filter(b => b.connected).length;
    if (alive === 0) {
      console.log('  ⚠️  All bots disconnected. Exiting.');
      process.exit(1);
    }
  }, 10000);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
