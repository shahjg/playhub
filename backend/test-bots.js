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
 *   most-likely-to, ludo, word-bomb, charades
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
const QUIET = getArg('quiet', false); // reduce log spam for large bot counts

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
        reconnection: false,
        timeout: 10000
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

  startGame(category) {
    this.log(`🎮 Starting game: ${this.gameType}`);
    this.socket.emit('start-game', {
      roomCode: this.roomCode,
      category: category || 'random'
    });
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
    s.on('game-started', (data) => {
      this.gameType = data.gameType;
      this.log(`🎮 Game started: ${data.gameType}`);
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
      this.log(`🌙 Night ${data.nightNumber || '?'} — Phase: ${data.phase || 'night'}`);

      if (!this.role) return;
      await wait(ACTION_DELAY);

      const alive = data.alivePlayers || this.players;
      const others = alive.filter(p => p.id !== s.id);
      if (others.length === 0) return;
      const target = pick(others);

      const roleName = this.role.role || '';

      if (roleName === 'werewolf' || roleName === 'alpha-wolf') {
        // Only target non-wolves
        const nonWolves = others.filter(p => !p.isWerewolf);
        const wolfTarget = nonWolves.length > 0 ? pick(nonWolves) : target;
        this.log(`🐺 Targeting: ${wolfTarget.name}`);
        s.emit('night-action', { roomCode: this.roomCode, actionType: 'werewolf-target', targetId: wolfTarget.id });
      } else if (roleName === 'seer') {
        this.log(`🔮 Checking: ${target.name}`);
        s.emit('night-action', { roomCode: this.roomCode, actionType: 'seer-check', targetId: target.id });
      } else if (roleName === 'doctor') {
        this.log(`💉 Saving: ${target.name}`);
        s.emit('night-action', { roomCode: this.roomCode, actionType: 'doctor-save', targetId: target.id });
      } else if (roleName === 'bodyguard') {
        this.log(`🛡️ Protecting: ${target.name}`);
        s.emit('night-action', { roomCode: this.roomCode, actionType: 'bodyguard-protect', targetId: target.id });
      } else if (roleName === 'vigilante') {
        this.log(`🔫 Targeting: ${target.name}`);
        s.emit('night-action', { roomCode: this.roomCode, actionType: 'vigilante-shoot', targetId: target.id });
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
      const alive = data.alivePlayers || this.players;
      const others = alive.filter(p => p.id !== s.id);
      if (others.length > 0) {
        const target = pick(others);
        this.log(`🗳️  Voting to eliminate: ${target.name}`);
        s.emit('submit-vote', { roomCode: this.roomCode, votedPlayerId: target.id });
      }
    });

    s.on('player-eliminated', (data) => {
      this.log(`💀 ${data.playerName} was eliminated (${data.role || 'unknown role'})`);
    });

    s.on('game-over', (data) => {
      this.log(`🏆 Game over! Winners: ${data.winners || data.winner || 'unknown'}`);
    });

    // ── HERD MENTALITY ──
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
      this.log(`💰 Bet or Bluff: "${(data.question || '').substring(0, 50)}..."`);
      await wait(ACTION_DELAY + Math.random() * 2000);
      const bet = Math.floor(Math.random() * 100) + 10;
      this.log(`📝 Betting: ${bet} points`);
      s.emit('betorbluff-bet', { roomCode: this.roomCode, amount: bet });
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
    console.log(`\n\n  ✅ All ${joined} bots in the room. Start the game from your browser!\n`);
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
    console.log('  Use --room ABCD to join a room, or --game werewolf to create one.\n');
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
