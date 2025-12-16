require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS configuration for Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());

// STRIPE WEBHOOK - MUST BE BEFORE express.json()
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.user_id;

    await supabase
      .from('profiles')
      .update({ account_type: 'premium' })
      .eq('id', userId);

    console.log(`User ${userId} upgraded to premium`);
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const userId = subscription.metadata.user_id;

    await supabase
      .from('profiles')
      .update({ account_type: 'free' })
      .eq('id', userId);

    console.log(`User ${userId} downgraded to free`);
  }

  res.json({ received: true });
});

app.use(express.json());

// Add URL-encoded parser for Ko-fi webhooks
app.use(express.urlencoded({ extended: true }));

// ============================================
// KO-FI WEBHOOK - HALL OF CHAMPIONS
// ============================================
const KOFI_VERIFICATION_TOKEN = process.env.KOFI_VERIFICATION_TOKEN;

app.post('/api/kofi-webhook', async (req, res) => {
  try {
    // Ko-fi sends data as form-encoded with a 'data' field containing JSON
    const kofiData = JSON.parse(req.body.data);
    
    // Verify webhook authenticity
    if (KOFI_VERIFICATION_TOKEN && kofiData.verification_token !== KOFI_VERIFICATION_TOKEN) {
      console.error('Invalid Ko-fi verification token');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract donation data
    const {
      message_id, // Ko-fi transaction ID
      timestamp,
      type, // 'Donation', 'Subscription', or 'Shop Order'
      from_name, // Donor's name
      message, // Optional message from donor
      amount, // Amount as string like "3.00"
      email, // Donor email
    } = kofiData;

    // Only process donations and subscriptions (not shop orders)
    if (type === 'Shop Order') {
      console.log('Skipping shop order');
      return res.status(200).json({ message: 'Shop order skipped' });
    }

    // Parse amount (Ko-fi sends as "3.00" string)
    const donationAmount = parseFloat(amount);

    // Determine display name
    // Priority: Check if message contains "Display as: X", otherwise use from_name
    let displayName = from_name;
    
    if (message) {
      // Look for custom display name in message
      const displayMatch = message.match(/Display as:\s*(.+?)(?:\n|$)/i);
      if (displayMatch) {
        displayName = displayMatch[1].trim();
      }
    }

    // Sanitize display name (basic XSS prevention)
    displayName = displayName
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .substring(0, 50); // Max 50 chars

    console.log(`Ko-fi donation received: ${displayName} - $${donationAmount}`);

    // Insert into Supabase
    const { data, error } = await supabase
      .from('supporters')
      .insert([
        {
          display_name: displayName,
          amount: donationAmount,
          email: email,
          ko_fi_transaction_id: message_id,
          message: message,
          donated_at: new Date(timestamp),
        }
      ])
      .select();

    if (error) {
      // Check if it's a duplicate transaction
      if (error.code === '23505') { // Unique violation
        console.log('Duplicate Ko-fi transaction, skipping:', message_id);
        return res.status(200).json({ message: 'Duplicate transaction' });
      }
      
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    console.log('Supporter added to Hall of Champions:', data[0]);

    res.status(200).json({ 
      message: 'Donation recorded successfully',
      supporter: data[0] 
    });

  } catch (error) {
    console.error('Ko-fi webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to manually add a supporter (for testing only - remove in production)
app.post('/api/test-supporter', async (req, res) => {
  const { display_name, amount } = req.body;
  
  if (!display_name || !amount) {
    return res.status(400).json({ error: 'display_name and amount required' });
  }
  
  const { data, error } = await supabase
    .from('supporters')
    .insert([{ 
      display_name, 
      amount: parseFloat(amount),
      ko_fi_transaction_id: `test-${Date.now()}` // Fake transaction ID for testing
    }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

// STRIPE CHECKOUT - MUST BE AFTER express.json()
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { userId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_1ScbQvExT6JNJPgqCxT0qdHc',
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'https://thegaming.co/profile.html?success=true',
      cancel_url: 'https://thegaming.co/profile.html?canceled=true',
      metadata: { user_id: userId }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

console.log('Frontend URL:', process.env.FRONTEND_URL);

// In-memory storage (replace with database later)
const rooms = new Map(); // roomCode -> room data
const players = new Map(); // socketId -> player data
const disconnectTimers = new Map(); // socketId -> timeout for delayed cleanup
const gameTimers = new Map(); // roomCode -> interval for game timers

// Generate random 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Check if code already exists
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size, players: players.size });
});

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
    winThreshold: winThreshold,
    roleAssignments: {} // For consistency with other games
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
// CODENAMES WORD BANK & GAME LOGIC
// ============================================

const codenamesWords = [
  'AGENT', 'AFRICA', 'AIR', 'ALIEN', 'ALPS', 'AMAZON', 'AMBULANCE', 'AMERICA', 'ANGEL', 'ANTARCTICA',
  'APPLE', 'ARM', 'ATLANTIS', 'AUSTRALIA', 'AZTEC', 'BACK', 'BALL', 'BAND', 'BANK', 'BAR',
  'BARK', 'BAT', 'BATTERY', 'BEACH', 'BEAR', 'BEAT', 'BED', 'BEIJING', 'BELL', 'BELT',
  'BERLIN', 'BERMUDA', 'BERRY', 'BILL', 'BLOCK', 'BOARD', 'BOLT', 'BOMB', 'BOND', 'BOOM',
  'BOOT', 'BOTTLE', 'BOW', 'BOX', 'BRIDGE', 'BRUSH', 'BUCK', 'BUFFALO', 'BUG', 'BUGLE',
  'BUTTON', 'CALF', 'CANADA', 'CAP', 'CAPITAL', 'CAR', 'CARD', 'CARROT', 'CASINO', 'CAST',
  'CAT', 'CELL', 'CENTAUR', 'CENTER', 'CHAIR', 'CHANGE', 'CHARGE', 'CHECK', 'CHEST', 'CHICK',
  'CHINA', 'CHOCOLATE', 'CHURCH', 'CIRCLE', 'CLIFF', 'CLOAK', 'CLUB', 'CODE', 'COLD', 'COMIC',
  'COMPOUND', 'CONCERT', 'CONDUCTOR', 'CONTRACT', 'COOK', 'COPPER', 'COTTON', 'COURT', 'COVER', 'CRANE',
  'CRASH', 'CRICKET', 'CROSS', 'CROWN', 'CYCLE', 'CZECH', 'DANCE', 'DATE', 'DAY', 'DEATH',
  'DECK', 'DEGREE', 'DIAMOND', 'DICE', 'DINOSAUR', 'DISEASE', 'DOCTOR', 'DOG', 'DRAFT', 'DRAGON',
  'DRESS', 'DRILL', 'DROP', 'DUCK', 'DWARF', 'EAGLE', 'EGYPT', 'EMBASSY', 'ENGINE', 'ENGLAND',
  'EUROPE', 'EYE', 'FACE', 'FAIR', 'FALL', 'FAN', 'FENCE', 'FIELD', 'FIGHTER', 'FIGURE',
  'FILE', 'FILM', 'FIRE', 'FISH', 'FLUTE', 'FLY', 'FOOT', 'FORCE', 'FOREST', 'FORK',
  'FRANCE', 'GAME', 'GAS', 'GENIUS', 'GERMANY', 'GHOST', 'GIANT', 'GLASS', 'GLOVE', 'GOLD',
  'GRACE', 'GRASS', 'GREECE', 'GREEN', 'GROUND', 'HAM', 'HAND', 'HAWK', 'HEAD', 'HEART',
  'HELICOPTER', 'HIMALAYAS', 'HOLE', 'HOLLYWOOD', 'HONEY', 'HOOD', 'HOOK', 'HORN', 'HORSE', 'HORSESHOE',
  'HOSPITAL', 'HOTEL', 'ICE', 'INDIA', 'IRON', 'IVORY', 'JACK', 'JAM', 'JET', 'JUPITER',
  'KANGAROO', 'KETCHUP', 'KEY', 'KID', 'KING', 'KIWI', 'KNIFE', 'KNIGHT', 'LAB', 'LAP',
  'LASER', 'LAWYER', 'LEAD', 'LEMON', 'LEPRECHAUN', 'LIFE', 'LIGHT', 'LIMOUSINE', 'LINE', 'LINK',
  'LION', 'LITTER', 'LOCH NESS', 'LOCK', 'LOG', 'LONDON', 'LUCK', 'MAIL', 'MAMMOTH', 'MAPLE',
  'MARBLE', 'MARCH', 'MASS', 'MATCH', 'MERCURY', 'MEXICO', 'MICROSCOPE', 'MILLIONAIRE', 'MINE', 'MINT',
  'MISSILE', 'MODEL', 'MOLE', 'MOON', 'MOSCOW', 'MOUNT', 'MOUSE', 'MOUTH', 'MUG', 'NAIL',
  'NEEDLE', 'NET', 'NEW YORK', 'NIGHT', 'NINJA', 'NOTE', 'NOVEL', 'NURSE', 'NUT', 'OCTOPUS',
  'OIL', 'OLIVE', 'OLYMPUS', 'OPERA', 'ORANGE', 'ORGAN', 'PALM', 'PAN', 'PANTS', 'PAPER',
  'PARACHUTE', 'PARK', 'PART', 'PASS', 'PASTE', 'PENGUIN', 'PHOENIX', 'PIANO', 'PIE', 'PILOT',
  'PIN', 'PIPE', 'PIRATE', 'PISTOL', 'PIT', 'PITCH', 'PLANE', 'PLASTIC', 'PLATE', 'PLATYPUS',
  'PLAY', 'PLOT', 'POINT', 'POISON', 'POLE', 'POLICE', 'POOL', 'PORT', 'POST', 'POUND',
  'PRESS', 'PRINCESS', 'PUMPKIN', 'PUPIL', 'PYRAMID', 'QUEEN', 'RABBIT', 'RACKET', 'RAY', 'REVOLUTION',
  'RING', 'ROBIN', 'ROBOT', 'ROCK', 'ROME', 'ROOT', 'ROSE', 'ROULETTE', 'ROUND', 'ROW',
  'RULER', 'SATELLITE', 'SATURN', 'SCALE', 'SCHOOL', 'SCIENTIST', 'SCORPION', 'SCREEN', 'SCUBA DIVER', 'SEAL',
  'SERVER', 'SHADOW', 'SHAKESPEARE', 'SHARK', 'SHIP', 'SHOE', 'SHOP', 'SHOT', 'SINK', 'SKYSCRAPER',
  'SLIP', 'SLUG', 'SMUGGLER', 'SNOW', 'SOCK', 'SOLDIER', 'SOUL', 'SOUND', 'SPACE', 'SPELL',
  'SPIDER', 'SPIKE', 'SPINE', 'SPOT', 'SPRING', 'SPY', 'SQUARE', 'STADIUM', 'STAFF', 'STAR',
  'STATE', 'STICK', 'STOCK', 'STRAW', 'STREAM', 'STRIKE', 'STRING', 'SUB', 'SUIT', 'SUPERHERO',
  'SWING', 'SWITCH', 'TABLE', 'TABLET', 'TAG', 'TAIL', 'TAP', 'TEACHER', 'TELESCOPE', 'TEMPLE',
  'TEXAS', 'THEATER', 'THIEF', 'THUMB', 'TICK', 'TIE', 'TIME', 'TOKYO', 'TOOTH', 'TORCH',
  'TOWER', 'TRACK', 'TRAIN', 'TRIANGLE', 'TRIP', 'TRUNK', 'TUBE', 'TURKEY', 'UNDERTAKER', 'UNICORN',
  'VACUUM', 'VAN', 'VET', 'WAKE', 'WALL', 'WAR', 'WASHER', 'WASHINGTON', 'WATCH', 'WATER',
  'WAVE', 'WEB', 'WELL', 'WHALE', 'WHIP', 'WIND', 'WITCH', 'WORM', 'YARD'
];

function initializeCodenamesGame(room) {
  // Pick 25 random words
  const shuffled = [...codenamesWords].sort(() => Math.random() - 0.5);
  const selectedWords = shuffled.slice(0, 25);

  // Decide who goes first (Red or Blue)
  const startingTeam = Math.random() < 0.5 ? 'red' : 'blue';
  
  // Assign colors to words
  const colors = [];
  colors.push(...Array(startingTeam === 'red' ? 9 : 8).fill('red'));
  colors.push(...Array(startingTeam === 'blue' ? 9 : 8).fill('blue'));
  colors.push(...Array(7).fill('neutral'));
  colors.push('assassin');
  
  // Shuffle colors
  colors.sort(() => Math.random() - 0.5);

  // Create word objects
  const words = selectedWords.map((word, index) => ({
    word,
    color: colors[index],
    revealed: false
  }));

  return {
    words,
    currentTeam: startingTeam,
    currentClue: null,
    phase: 'clue_giving',
    winner: null,
    gameOverReason: null
  };
}
// ============================================
// WEREWOLF HELPER FUNCTIONS
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

function processWerewolfVotingResults(room) {
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
// IMPOSTER & SPYFALL HELPER FUNCTIONS
// ============================================

// Helper function to handle Imposter phase transitions
function handleImposterPhaseTransition(room, socket, roomCode, playerName) {
  if (room.gameData.phase === 'role-reveal') {
    // Schedule clue phase start if not already scheduled
    if (!room.gameData.phaseTransitionScheduled) {
      room.gameData.phaseTransitionScheduled = true;
      console.log('Scheduling clue phase start in 5 seconds...');
      setTimeout(() => {
        if (room.gameData.phase === 'role-reveal') {
          room.gameData.phase = 'clue-giving';
          io.to(roomCode).emit('clue-phase-start', {
            timeLimit: 60,
            round: room.gameData.currentRound
          });
          console.log(`Clue phase started in room ${roomCode}, Round ${room.gameData.currentRound}`);
        }
      }, 5000);
    }
  } else if (room.gameData.phase === 'clue-giving') {
    socket.emit('clue-phase-start', {
      timeLimit: 60,
      round: room.gameData.currentRound
    });
    room.gameData.clues.forEach(clue => {
      socket.emit('clue-submitted', {
        playerName: clue.playerName,
        clue: clue.clue,
        totalClues: room.gameData.clues.length,
        totalPlayers: room.players.length
      });
    });
  } else if (room.gameData.phase === 'voting') {
    socket.emit('voting-phase-start', {
      clues: room.gameData.clues,
      players: room.players,
      round: room.gameData.currentRound
    });
    socket.emit('vote-counted', {
      totalVotes: Object.keys(room.gameData.votes).length,
      totalPlayers: room.players.length
    });
    if (room.gameData.currentRound < 3) {
      socket.emit('skip-vote-counted', {
        skipVotes: room.gameData.skipVotes.length,
        totalPlayers: room.players.length
      });
    }
  } else if (room.gameData.phase === 'results') {
    const imposterCaught = room.gameData.votedOutPlayerId === room.gameData.imposterId;
    const imposterPlayer = room.players.find(p => p.name === room.gameData.imposterName);
    const votedOutPlayer = room.players.find(p => p.id === room.gameData.votedOutPlayerId);
    
    socket.emit('game-results', {
      imposterCaught: imposterCaught,
      imposter: imposterPlayer,
      votedOut: votedOutPlayer,
      word: room.gameData.word,
      voteCounts: room.gameData.voteCounts || {}
    });
  }
}

// Start Spyfall question phase with timer
function startSpyfallQuestionPhase(room) {
  room.gameData.phase = 'question';
  room.gameData.timeRemaining = 480;
  
  io.to(room.code).emit('question-phase-start', {
    timeLimit: 480
  });
  
  startSpyfallTimer(room);
  console.log(`Question phase started in room ${room.code}`);
}

// Start/resume Spyfall timer
function startSpyfallTimer(room) {
  if (gameTimers.has(room.code)) {
    clearInterval(gameTimers.get(room.code));
  }
  
  const timerInterval = setInterval(() => {
    if (!room.gameData || room.gameData.phase !== 'question') {
      clearInterval(timerInterval);
      gameTimers.delete(room.code);
      return;
    }
  
    room.gameData.timeRemaining--;
  
    io.to(room.code).emit('timer-update', {
      timeRemaining: room.gameData.timeRemaining
    });
  
    if (room.gameData.timeRemaining <= 0) {
      clearInterval(timerInterval);
      gameTimers.delete(room.code);
      endSpyfallGame(room, true, 'Time ran out! The spy escaped.');
    }
  }, 1000);
  
  gameTimers.set(room.code, timerInterval);
}

// End Spyfall game
function endSpyfallGame(room, spyWins, reason) {
  if (gameTimers.has(room.code)) {
    clearInterval(gameTimers.get(room.code));
    gameTimers.delete(room.code);
  }
  
  room.gameData.phase = 'results';
  room.gameData.spyWins = spyWins;
  room.gameData.gameOverReason = reason;
  room.gameState = 'ended';
  
  const spyPlayers = room.gameData.spies.map(spyId =>
    room.players.find(p => p.id === spyId) || { name: 'Unknown' }
  );
  
  io.to(room.code).emit('game-over', {
    spyWins: spyWins,
    reason: reason,
    spyName: spyPlayers.map(p => p.name).join(', '),
    spyNames: spyPlayers.map(p => p.name),
    location: room.gameData.location,
    twoSpies: room.gameData.twoSpies
  });
  
  console.log(`Spyfall game ended in room ${room.code}. Spy wins: ${spyWins}. Reason: ${reason}`);
}

// Helper function to handle Spyfall phase transitions
function handleSpyfallPhaseTransition(room, socket, roomCode, playerName) {
  if (room.gameData.phase === 'role-reveal') {
    if (!room.gameData.phaseTransitionScheduled) {
      room.gameData.phaseTransitionScheduled = true;
      setTimeout(() => {
        if (room.gameData.phase === 'role-reveal') {
          startSpyfallQuestionPhase(room);
        }
      }, 5000);
    }
  } else if (room.gameData.phase === 'question') {
    socket.emit('question-phase-start', {
      timeLimit: room.gameData.timeRemaining
    });
    socket.emit('timer-update', {
      timeRemaining: room.gameData.timeRemaining
    });
  } else if (room.gameData.phase === 'voting') {
    socket.emit('vote-called', {
      caller: room.gameData.voteCaller
    });
  } else if (room.gameData.phase === 'results') {
    const spyPlayers = room.gameData.spies.map(spyId =>
      room.players.find(p => p.id === spyId) || { name: 'Unknown' }
    );
    socket.emit('game-over', {
      spyWins: room.gameData.spyWins,
      reason: room.gameData.gameOverReason,
      spyName: spyPlayers.map(p => p.name).join(', '),
      spyNames: spyPlayers.map(p => p.name),
      location: room.gameData.location,
      twoSpies: room.gameData.twoSpies
    });
  }
}

// Initialize Imposter game
function initImposterGame(room, category = 'random') {
  // Word lists by category
  const wordCategories = {
    food: [
      'Pizza', 'Sushi', 'Burger', 'Taco', 'Pasta', 'Steak', 'Salad', 'Soup',
      'Sandwich', 'Ice Cream', 'Chocolate', 'Coffee', 'Tea', 'Wine', 'Beer',
      'Cheese', 'Bacon', 'Chicken', 'Rice', 'Bread', 'Cake', 'Cookie'
    ],
    animals: [
      'Dog', 'Cat', 'Lion', 'Tiger', 'Bear', 'Elephant', 'Giraffe', 'Zebra',
      'Monkey', 'Penguin', 'Dolphin', 'Shark', 'Eagle', 'Owl', 'Parrot',
      'Snake', 'Rabbit', 'Horse', 'Cow', 'Pig', 'Sheep', 'Chicken'
    ],
    places: [
      'Beach', 'Mountain', 'Desert', 'Forest', 'City', 'Village', 'Island',
      'Airport', 'Hospital', 'School', 'Library', 'Restaurant', 'Mall',
      'Park', 'Zoo', 'Museum', 'Theater', 'Stadium', 'Hotel', 'Casino'
    ],
    objects: [
      'Phone', 'Laptop', 'Car', 'Bicycle', 'Watch', 'Camera', 'Television',
      'Chair', 'Table', 'Bed', 'Lamp', 'Mirror', 'Book', 'Pen', 'Wallet',
      'Keys', 'Umbrella', 'Backpack', 'Shoes', 'Hat', 'Glasses', 'Bottle'
    ],
    activities: [
      'Swimming', 'Running', 'Dancing', 'Singing', 'Cooking', 'Reading',
      'Writing', 'Painting', 'Football', 'Basketball', 'Tennis', 'Golf',
      'Yoga', 'Hiking', 'Camping', 'Fishing', 'Shopping', 'Gaming', 'Skiing'
    ],
    nature: [
      'Ocean', 'River', 'Lake', 'Waterfall', 'Mountain', 'Valley', 'Cave',
      'Volcano', 'Rainbow', 'Sunset', 'Sunrise', 'Storm', 'Snow', 'Rain',
      'Thunder', 'Lightning', 'Tree', 'Flower', 'Grass', 'Rock', 'Cloud'
    ],
    entertainment: [
      'Movie', 'Concert', 'Festival', 'Party', 'Wedding', 'Birthday',
      'Game', 'Puzzle', 'Magic', 'Circus', 'Comedy', 'Drama', 'Musical',
      'Dance', 'Karaoke', 'Podcast', 'Stream', 'Video', 'Music', 'Song'
    ],
    spicy: [
      'Bedroom', 'Kissing', 'Dating', 'Flirting', 'Romance', 'Attraction',
      'Seduction', 'Passion', 'Desire', 'Fantasy', 'Pleasure', 'Intimate',
      'Sensual', 'Temptation', 'Foreplay', 'Massage', 'Strip Club', 'Handcuffs',
      'Lingerie', 'Tease', 'Fetish', 'Domination'
    ],
    stereotypes: [
      'Karen', 'Chad', 'Boomer', 'Millennial', 'Gen Z', 'Hipster', 'Jock',
      'Nerd', 'Goth', 'Emo', 'Influencer', 'Gamer', 'Vegan', 'CrossFit',
      'Yoga Mom', 'Tech Bro', 'Finance Guy', 'Theater Kid', 'Band Kid',
      'Art Student', 'Frat Boy', 'Sorority Girl'
    ]
  };
  
  // Get words from selected category or all categories
  let words;
  if (category === 'random' || !wordCategories[category]) {
    // Combine all categories
    words = Object.values(wordCategories).flat();
  } else {
    words = wordCategories[category];
  }
  
  const word = words[Math.floor(Math.random() * words.length)];
  
  // Randomly select imposter
  const imposterIndex = Math.floor(Math.random() * room.players.length);
  const imposterId = room.players[imposterIndex].id;
  
  // Store game data with role assignments
  room.gameData = {
    word: word,
    category: category,
    imposterId: imposterId,
    imposterName: room.players[imposterIndex].name,
    clues: [],
    votes: {},
    skipVotes: [],
    currentRound: 1,
    maxRounds: 3,
    phase: 'role-reveal', // phases: role-reveal, clue-giving, voting, results
    roleAssignments: {} // Store roles by player name (not socket ID, since IDs change)
  };
  
  // Store role assignments by player name
  room.players.forEach((player, index) => {
    const isImposter = index === imposterIndex;
    room.gameData.roleAssignments[player.name] = {
      role: isImposter ? 'imposter' : 'player',
      word: isImposter ? null : word,
      isImposter: isImposter
    };
  });
  
  console.log(`Game initialized in room ${room.code}. Category: ${category}, Imposter: ${room.gameData.imposterName}, Word: ${word}`);
}

// Initialize Spyfall game
function initSpyfallGame(room, locationPack = 'classic', twoSpies = false) {
  // EXPANDED LOCATION PACKS - 15-20 locations each
  const locationPacks = {
    classic: [
      { name: 'Airport', roles: ['First Class Passenger', 'Air Marshal', 'Mechanic', 'Flight Attendant', 'Co-Pilot', 'Captain', 'Tourist', 'Security Guard', 'Pilot', 'Baggage Handler', 'TSA Agent', 'Gate Agent', 'Janitor', 'Customs Officer', 'Duty Free Clerk'] },
      { name: 'Bank', roles: ['Armored Car Driver', 'Manager', 'Consultant', 'Customer', 'Robber', 'Security Guard', 'Teller', 'Janitor', 'Loan Officer', 'Vault Keeper', 'Financial Advisor', 'ATM Technician', 'Intern', 'Branch Director', 'Auditor'] },
      { name: 'Beach', roles: ['Beach Photographer', 'Ice Cream Man', 'Lifeguard', 'Thief', 'Beach Goer', 'Surfer', 'Kite Surfer', 'Beach Volleyball Player', 'Sunbather', 'Vendor', 'Fisherman', 'Parasailer', 'Tourist', 'Beach Cleaner', 'Jet Ski Renter'] },
      { name: 'Casino', roles: ['Bartender', 'Head Security', 'Bouncer', 'Manager', 'Hustler', 'Dealer', 'Gambler', 'Waitress', 'Pit Boss', 'Card Counter', 'Chip Runner', 'Poker Player', 'Slot Attendant', 'High Roller', 'Floor Supervisor'] },
      { name: 'Cathedral', roles: ['Priest', 'Beggar', 'Sinner', 'Tourist', 'Sponsor', 'Choir Singer', 'Parishioner', 'Bishop', 'Altar Boy', 'Organist', 'Wedding Guest', 'Confessor', 'Sacristan', 'Deacon', 'Visitor'] },
      { name: 'Circus', roles: ['Acrobat', 'Animal Trainer', 'Magician', 'Fire Eater', 'Clown', 'Juggler', 'Visitor', 'Ticket Seller', 'Ringmaster', 'Trapeze Artist', 'Tightrope Walker', 'Strongman', 'Contortionist', 'Knife Thrower', 'Lion Tamer'] },
      { name: 'Hospital', roles: ['Nurse', 'Doctor', 'Anesthesiologist', 'Intern', 'Patient', 'Therapist', 'Surgeon', 'Pharmacist', 'Radiologist', 'ER Doctor', 'Orderly', 'Medical Student', 'Paramedic', 'Lab Technician', 'Administrator'] },
      { name: 'Hotel', roles: ['Doorman', 'Security Guard', 'Manager', 'Housekeeper', 'Customer', 'Bartender', 'Bellman', 'Chef', 'Concierge', 'Valet', 'Guest', 'Receptionist', 'Room Service', 'Maintenance', 'Event Coordinator'] },
      { name: 'Military Base', roles: ['Deserter', 'Colonel', 'Medic', 'Soldier', 'Sniper', 'Officer', 'Tank Engineer', 'Cook', 'General', 'Drill Sergeant', 'Recruit', 'Spy', 'Pilot', 'Radio Operator', 'Intelligence Officer'] },
      { name: 'Movie Studio', roles: ['Stunt Man', 'Sound Engineer', 'Camera Man', 'Director', 'Costume Artist', 'Actor', 'Producer', 'Makeup Artist', 'Screenwriter', 'Set Designer', 'Lighting Technician', 'Boom Operator', 'Casting Director', 'Gaffer', 'Film Editor'] },
      { name: 'Ocean Liner', roles: ['Rich Passenger', 'Cook', 'Captain', 'Bartender', 'Musician', 'Waiter', 'Mechanic', 'Sailor', 'Cruise Director', 'Entertainer', 'Deckhand', 'Navigator', 'Purser', 'Lifeguard', 'Guest'] },
      { name: 'Passenger Train', roles: ['Mechanic', 'Border Patrol', 'Train Attendant', 'Passenger', 'Restaurant Chef', 'Engineer', 'Stoker', 'Conductor', 'Ticket Inspector', 'Porter', 'Sleeper Car Attendant', 'Dining Car Server', 'Tourist', 'Commuter', 'Cargo Handler'] },
      { name: 'Pirate Ship', roles: ['Cook', 'Sailor', 'Slave', 'Cannoneer', 'Bound Prisoner', 'Cabin Boy', 'Brave Captain', 'Surgeon', 'First Mate', 'Lookout', 'Navigator', 'Gunner', 'Quartermaster', 'Stowaway', 'Treasure Hunter'] },
      { name: 'Polar Station', roles: ['Medic', 'Geologist', 'Expedition Leader', 'Biologist', 'Radioman', 'Hydrologist', 'Meteorologist', 'Cook', 'Researcher', 'Engineer', 'Pilot', 'Glaciologist', 'Climatologist', 'Supply Manager', 'Photographer'] },
      { name: 'Police Station', roles: ['Detective', 'Lawyer', 'Journalist', 'Criminalist', 'Archivist', 'Patrol Officer', 'Criminal', 'Chief', 'Dispatcher', 'Forensic Expert', 'Sergeant', 'Witness', 'Undercover Agent', 'IT Specialist', 'CSI Technician'] },
      { name: 'Restaurant', roles: ['Musician', 'Customer', 'Bouncer', 'Hostess', 'Head Chef', 'Food Critic', 'Waiter', 'Bartender', 'Sous Chef', 'Dishwasher', 'Sommelier', 'Busboy', 'Line Cook', 'Regular', 'Manager'] },
      { name: 'School', roles: ['Gym Teacher', 'Student', 'Principal', 'Security Guard', 'Janitor', 'Cafeteria Lady', 'Maintenance Man', 'Teacher', 'Librarian', 'Counselor', 'Substitute', 'Coach', 'Nurse', 'Vice Principal', 'Lunch Monitor'] },
      { name: 'Space Station', roles: ['Engineer', 'Alien', 'Space Tourist', 'Pilot', 'Commander', 'Scientist', 'Doctor', 'Astronaut', 'Mission Specialist', 'Flight Controller', 'Researcher', 'Mechanic', 'Biologist', 'Communications Officer', 'Space Walker'] },
      { name: 'Submarine', roles: ['Cook', 'Commander', 'Sonar Technician', 'Electronics Technician', 'Sailor', 'Radioman', 'Navigator', 'Mechanic', 'Torpedo Operator', 'Executive Officer', 'Engineer', 'Lookout', 'Weapons Officer', 'Diver', 'Cryptographer'] },
      { name: 'Supermarket', roles: ['Customer', 'Cashier', 'Butcher', 'Janitor', 'Security Guard', 'Food Sample Demonstrator', 'Shelf Stocker', 'Manager', 'Produce Worker', 'Deli Counter Worker', 'Baker', 'Pharmacist', 'Cart Collector', 'Loss Prevention', 'Assistant Manager'] }
    ],
    
    modern: [
      { name: 'Coffee Shop', roles: ['Barista', 'Regular Customer', 'Wi-Fi Freeloader', 'Student', 'Manager', 'Delivery Person', 'Freelancer', 'Tourist', 'Coffee Snob', 'Blogger', 'Remote Worker', 'First Date', 'Book Reader', 'Artist', 'Laptop Warrior'] },
      { name: 'Gym', roles: ['Personal Trainer', 'Bodybuilder', 'Yoga Instructor', 'Newbie', 'Receptionist', 'Cleaner', 'Athlete', 'Influencer', 'Powerlifter', 'Cardio Enthusiast', 'CrossFit Coach', 'Zumba Teacher', 'Spin Instructor', 'Physical Therapist', 'Protein Shake Guy'] },
      { name: 'Shopping Mall', roles: ['Security Guard', 'Salesperson', 'Shopper', 'Manager', 'Janitor', 'Food Court Worker', 'Lost Child', 'Mystery Shopper', 'Teenager', 'Kiosk Seller', 'Window Shopper', 'Mall Walker', 'Store Owner', 'Parking Attendant', 'Santa Claus'] },
      { name: 'Tech Startup', roles: ['CEO', 'Developer', 'Designer', 'Intern', 'Investor', 'Marketing Manager', 'Salesperson', 'IT Support', 'Product Manager', 'UX Researcher', 'Data Analyst', 'Scrum Master', 'DevOps Engineer', 'Growth Hacker', 'Office Dog'] },
      { name: 'Spa', roles: ['Masseuse', 'Customer', 'Receptionist', 'Beautician', 'Manager', 'Cleaner', 'VIP Customer', 'Aromatherapist', 'Nail Technician', 'Facial Specialist', 'Yoga Teacher', 'Meditation Guide', 'Sauna Attendant', 'Makeup Artist', 'Hot Stone Therapist'] },
      { name: 'Escape Room', roles: ['Game Master', 'First Timer', 'Pro Player', 'Birthday Guest', 'Team Leader', 'Panicker', 'Actor', 'Owner', 'Tech Support', 'Hint Giver', 'Time Keeper', 'Observer', 'Group Leader', 'Photographer', 'Scared Participant'] },
      { name: 'Coworking Space', roles: ['Startup Founder', 'Freelancer', 'Remote Worker', 'Receptionist', 'Event Manager', 'Networking Enthusiast', 'Coffee Addict', 'Phone Booth Hog', 'Community Manager', 'Developer', 'Designer', 'Sales Rep', 'Consultant', 'Investor Scout', 'Nap Room User'] },
      { name: 'Food Truck Festival', roles: ['Food Truck Owner', 'Customer', 'Food Blogger', 'Vendor', 'Street Performer', 'Festival Organizer', 'Health Inspector', 'Musician', 'Line Waiter', 'Photographer', 'Local Chef', 'Food Critic', 'Beer Tent Worker', 'Ticket Seller', 'Lost Tourist'] },
      { name: 'Podcast Studio', roles: ['Host', 'Co-Host', 'Guest', 'Producer', 'Sound Engineer', 'Intern', 'Sponsor Rep', 'Social Media Manager', 'Listener', 'Fact Checker', 'Editor', 'Music Composer', 'Advertiser', 'Network Executive', 'Fan'] },
      { name: 'Airbnb', roles: ['Host', 'Guest', 'Cleaner', 'Neighbor', 'Maintenance Person', 'Previous Guest', 'Photographer', 'Property Manager', 'Review Writer', 'Check-in Assistant', 'Long-term Renter', 'Party Thrower', 'Quiet Reader', 'Chef User', 'Remote Worker'] },
      { name: 'Rock Climbing Gym', roles: ['Instructor', 'Beginner', 'Expert Climber', 'Belayer', 'Manager', 'Route Setter', 'Scared Parent', 'Kid Climber', 'Competitive Athlete', 'Yoga Class Member', 'Equipment Renter', 'Social Climber', 'Boulder Problem Solver', 'Chalk Addict', 'Wall Cleaner'] },
      { name: 'eSports Arena', roles: ['Pro Gamer', 'Coach', 'Commentator', 'Fan', 'Streamer', 'Sponsor', 'Team Manager', 'Referee', 'Casual Player', 'Tech Support', 'Camera Operator', 'Social Media Manager', 'Snack Vendor', 'Tournament Organizer', 'Spectator'] },
      { name: 'Pet Store', roles: ['Owner', 'Customer', 'Dog Trainer', 'Aquarium Specialist', 'Groomer', 'Cashier', 'Adoption Counselor', 'Veterinarian', 'Bird Handler', 'Reptile Expert', 'Hamster Buyer', 'Fish Tank Cleaner', 'Pet Food Rep', 'Kid with Parents', 'Cat Lady'] },
      { name: 'Comic Con', roles: ['Cosplayer', 'Celebrity Guest', 'Vendor', 'Security', 'Panel Moderator', 'Photographer', 'First Timer', 'Hardcore Fan', 'Artist', 'Voice Actor', 'Blogger', 'Autograph Hunter', 'Props Maker', 'Convention Staff', 'Confused Parent'] },
      { name: 'Brewery', roles: ['Brewmaster', 'Bartender', 'Tour Guide', 'Customer', 'Beer Enthusiast', 'Tasting Room Manager', 'Hop Farmer', 'Quality Control', 'Delivery Driver', 'First Timer', 'IPA Snob', 'Designated Driver', 'Food Truck Partner', 'Brewer Assistant', 'Craft Beer Blogger'] },
      { name: 'Dog Park', roles: ['Dog Owner', 'Professional Dog Walker', 'Puppy Owner', 'Large Breed Owner', 'Small Dog Owner', 'Ball Thrower', 'Treat Giver', 'Park Regular', 'Dog Trainer', 'Vet', 'Grumpy Owner', 'Social Butterfly', 'Photographer', 'Lost Dog Owner', 'Dog Sitting for Friend'] }
    ],
    
    adult: [
      { name: 'Strip Club', roles: ['Dancer', 'DJ', 'Bouncer', 'VIP Guest', 'Regular', 'Bachelor Party Guest', 'Bartender', 'Manager', 'Security Guard', 'Waitress', 'Stage Manager', 'First Timer', 'Nervous Friend', 'High Roller', 'Pole Instructor'] },
      { name: 'Las Vegas Casino', roles: ['High Roller', 'Cocktail Waitress', 'Dealer', 'Poker Pro', 'Drunk Tourist', 'Security', 'Pit Boss', 'Card Counter', 'Elvis Impersonator', 'Newlywed', 'Bachelor', 'Bachelorette', 'Magician', 'Showgirl', 'Loan Shark'] },
      { name: 'Hookah Lounge', roles: ['Owner', 'Regular', 'First Timer', 'Flavor Expert', 'Bartender', 'DJ', 'Hookah Preparer', 'VIP Guest', 'College Student', 'Date Couple', 'Group Leader', 'Belly Dancer', 'Bouncer', 'Instagram Model', 'Smoke Trick Master'] },
      { name: 'Gentleman\'s Club', roles: ['Manager', 'Entertainer', 'Bouncer', 'Bachelor', 'Regular Client', 'Waitress', 'Bartender', 'DJ', 'VIP Host', 'Security', 'Photographer', 'First Timer', 'Champagne Room Guest', 'Bottle Service', 'Club Promoter'] },
      { name: 'Wine Tasting', roles: ['Sommelier', 'Wine Snob', 'First Timer', 'Vineyard Owner', 'Tipsy Guest', 'Designated Spitter', 'Wine Blogger', 'Cheese Pairer', 'Rich Collector', 'Broke College Kid', 'Date Night Couple', 'Tour Guide', 'Winery Manager', 'Barrel Taster', 'Cork Sniffer'] },
      { name: 'Nightclub', roles: ['DJ', 'Bouncer', 'Bartender', 'VIP Guest', 'Bottle Service Girl', 'Dance Floor Regular', 'Promoter', 'Coat Check', 'Security', 'Birthday Party', 'Bachelorette', 'First Timer', 'Instagram Influencer', 'Drug Dealer', 'Lightweight Drunk'] },
      { name: 'Bachelor Party', roles: ['Groom', 'Best Man', 'Drunk Friend', 'Responsible One', 'Party Planner', 'Exotic Dancer', 'Limo Driver', 'Bartender', 'Casino Dealer', 'Wingman', 'Photographer', 'Bouncer', 'VIP Host', 'Regretful Attendee', 'Blackout Drunk'] },
      { name: 'Bachelorette Party', roles: ['Bride', 'Maid of Honor', 'Drunk Bridesmaid', 'Responsible Friend', 'Party Planner', 'Male Stripper', 'Bartender', 'Limo Driver', 'Photographer', 'Instagram Manager', 'Spa Worker', 'Crying Emotional Friend', 'Wild One', 'Mom Friend', 'Ex Boyfriend'] },
      { name: 'Poker Tournament', roles: ['Pro Player', 'Amateur', 'Dealer', 'Floor Manager', 'Chip Runner', 'Cocktail Waitress', 'Commentator', 'Cameraman', 'Railbird', 'Tournament Director', 'Security', 'Bluffer', 'Tight Player', 'All-in Addict', 'Sponsorship Rep'] },
      { name: 'Speakeasy Bar', roles: ['Bartender', 'Mixologist', 'Regular', 'First Timer', 'Owner', 'Jazz Singer', 'Bouncer', 'Prohibition Agent', 'Gangster', 'Rich Patron', 'Secret Password Giver', 'Whiskey Connoisseur', 'Date Couple', 'Undercover Cop', 'Bootlegger'] },
      { name: 'Tattoo Parlor', roles: ['Tattoo Artist', 'Apprentice', 'Customer', 'First Timer', 'Heavily Tattooed Regular', 'Piercer', 'Receptionist', 'Regretful Ex Name Haver', 'Cover-up Seeker', 'Pain Wimp', 'Tough Guy', 'Mom Getting Kid Name', 'Couple Tattoo', 'Gang Member', 'Artist Portfolio Checker'] },
      { name: 'Music Festival', roles: ['Headliner', 'Opening Act', 'Festival Goer', 'Security', 'Vendor', 'Lost Friend', 'Drug Dealer', 'First Aid', 'VIP Guest', 'Photographer', 'Stage Manager', 'Sound Engineer', 'Crowd Surfer', 'Passed Out Person', 'Pickpocket'] },
      { name: 'Boxing Gym', roles: ['Boxer', 'Coach', 'Sparring Partner', 'Cutman', 'Manager', 'Ring Girl', 'Referee', 'Promoter', 'First Timer', 'Heavy Bag Hitter', 'Speed Bag Expert', 'Jump Rope Master', 'Intimidating Regular', 'Fitness Boxer', 'Former Pro'] },
      { name: 'Dive Bar', roles: ['Bartender', 'Regular Drunk', 'Pool Shark', 'Dart Player', 'Jukebox Hog', 'Bouncer', 'Karaoke Singer', 'First Timer', 'Old Timer', 'College Kids', 'Loner', 'Bar Fight Starter', 'Whiskey Drinker', 'Beer Guy', 'Owner'] },
      { name: 'Swingers Club', roles: ['Regular Member', 'First Timer', 'Curious Couple', 'Single Guy', 'Hostess', 'Bartender', 'Security', 'DJ', 'VIP Member', 'Nervous Newbie', 'Experienced Swinger', 'Voyeur', 'Rules Explainer', 'Coat Check', 'Uncomfortable Guest'] },
      { name: 'Massage Parlor', roles: ['Masseuse', 'Client', 'Receptionist', 'Manager', 'First Timer', 'Regular', 'Deep Tissue Specialist', 'Hot Stone Therapist', 'Couples Massage Client', 'Sports Massage Client', 'Aromatherapist', 'Reflexologist', 'Nervous Customer', 'Creepy Guy', 'Undercover Cop'] }
    ],
    
    marvel: [
      { name: 'Avengers Tower', roles: ['Iron Man', 'Captain America', 'Thor', 'Hulk', 'Black Widow', 'Hawkeye', 'Nick Fury', 'Jarvis', 'Pepper Potts', 'War Machine', 'Vision', 'Scarlet Witch', 'Falcon', 'Security Guard', 'Scientist'] },
      { name: 'Asgard', roles: ['Thor', 'Loki', 'Odin', 'Heimdall', 'Sif', 'Warrior', 'Palace Guard', 'Frost Giant', 'Asgardian Citizen', 'Valkyrie', 'Court Jester', 'Blacksmith', 'Royal Advisor', 'Bifrost Guardian', 'Prisoner'] },
      { name: 'Wakanda', roles: ['Black Panther', 'Shuri', 'Okoye', 'M\'Baku', 'Nakia', 'W\'Kabi', 'Dora Milaje', 'Wakandan Citizen', 'Scientist', 'Tribal Elder', 'Border Tribe Warrior', 'Merchant', 'Royal Guard', 'Vibranium Miner', 'Jabari Warrior'] },
      { name: 'X-Mansion', roles: ['Professor X', 'Wolverine', 'Storm', 'Cyclops', 'Jean Grey', 'Beast', 'Rogue', 'Gambit', 'Jubilee', 'Nightcrawler', 'Iceman', 'Student', 'Sentinel', 'Mystique', 'Magneto'] },
      { name: 'Stark Industries', roles: ['Tony Stark', 'Pepper Potts', 'Happy Hogan', 'Engineer', 'Scientist', 'Security Guard', 'Janitor', 'Intern', 'Board Member', 'PR Manager', 'Weapons Designer', 'AI Programmer', 'Test Pilot', 'Accountant', 'Receptionist'] },
      { name: 'S.H.I.E.L.D. Helicarrier', roles: ['Nick Fury', 'Maria Hill', 'Phil Coulson', 'Agent', 'Pilot', 'Engineer', 'Medical Officer', 'Communications', 'Weapons Officer', 'Mechanic', 'Scientist', 'Hydra Spy', 'Recruit', 'Captain', 'Radar Operator'] },
      { name: 'Sanctum Sanctorum', roles: ['Doctor Strange', 'Wong', 'Ancient One', 'Sorcerer', 'Apprentice', 'Librarian', 'Guardian', 'Mystic Arts Student', 'Astral Projector', 'Portal Master', 'Time Stone Keeper', 'Dimension Traveler', 'Kamar-Taj Monk', 'Dark Dimension Entity', 'Zealot'] },
      { name: 'Knowhere', roles: ['Collector', 'Rocket Raccoon', 'Groot', 'Star-Lord', 'Gamora', 'Drax', 'Mantis', 'Miner', 'Bar Patron', 'Slave', 'Black Market Dealer', 'Bounty Hunter', 'Ravager', 'Tourist', 'Security'] },
      { name: 'Hydra Base', roles: ['Red Skull', 'Hydra Agent', 'Scientist', 'Winter Soldier', 'Commander', 'Guard', 'Weapons Expert', 'Infiltrator', 'Brainwashed Soldier', 'Mad Scientist', 'Test Subject', 'Strategist', 'Assassin', 'Undercover S.H.I.E.L.D.', 'Zealot'] },
      { name: 'Daily Bugle', roles: ['J. Jonah Jameson', 'Peter Parker', 'Photographer', 'Reporter', 'Editor', 'Intern', 'Receptionist', 'Fact Checker', 'Copy Editor', 'Layout Designer', 'Columnist', 'Investigative Journalist', 'Coffee Runner', 'IT Guy', 'Security'] },
      { name: 'Sokovia', roles: ['Scarlet Witch', 'Quicksilver', 'Ultron', 'Refugee', 'Resistance Fighter', 'Civilian', 'Street Vendor', 'Hydra Scientist', 'War Orphan', 'Baron Strucker', 'Enhanced Individual', 'Aid Worker', 'Journalist', 'UN Peacekeeper', 'Evacuee'] },
      { name: 'Kamar-Taj', roles: ['Ancient One', 'Wong', 'Mordo', 'Apprentice Sorcerer', 'Master', 'Librarian', 'Healer', 'Portal Guardian', 'Time Keeper', 'Astral Plane Guide', 'Meditation Master', 'Weapon Master', 'Student', 'Zealot Spy', 'Dimensional Traveler'] },
      { name: 'Ravager Ship', roles: ['Yondu', 'Star-Lord', 'Kraglin', 'Taserface', 'Ravager Captain', 'Pilot', 'Gunner', 'Engineer', 'Prisoner', 'New Recruit', 'Cook', 'Mutineer', 'Treasure Hunter', 'Bounty Target', 'Stowaway'] },
      { name: 'Titan', roles: ['Thanos', 'Gamora', 'Nebula', 'Titan Survivor', 'Black Order Member', 'Chitauri', 'Outrider', 'Sanctuary Guard', 'Mad Titan Worshipper', 'Prisoner', 'Scientist', 'Warlord', 'Sacrificed Soul', 'Resistance Fighter', 'Soul Stone Guardian'] },
      { name: 'TVA (Time Variance Authority)', roles: ['Loki', 'Mobius', 'Hunter', 'Judge', 'Miss Minutes', 'Analyst', 'Minuteman', 'Variant', 'Time Keeper', 'Receptionist', 'Pruner', 'Clerk', 'Reset Charge Placer', 'Time Theater Operator', 'Void Survivor'] }
    ],
    
    dc: [
      { name: 'Batcave', roles: ['Batman', 'Robin', 'Alfred', 'Batgirl', 'Nightwing', 'Oracle', 'Commissioner Gordon', 'Lucius Fox', 'Computer System', 'Mechanic', 'Security System', 'Bat-family Member', 'Injured Hero', 'Training Partner', 'Intruder'] },
      { name: 'Fortress of Solitude', roles: ['Superman', 'Lois Lane', 'Jor-El AI', 'Kryptonian Robot', 'Phantom Zone Prisoner', 'Supergirl', 'Brainiac', 'Krypto', 'Scientist Hologram', 'Intruder', 'Ice Creature', 'Visitor', 'Lex Luthor', 'Jimmy Olsen', 'Time Traveler'] },
      { name: 'Arkham Asylum', roles: ['Joker', 'Harley Quinn', 'Scarecrow', 'Two-Face', 'Riddler', 'Poison Ivy', 'Mr. Freeze', 'Bane', 'Doctor', 'Guard', 'Nurse', 'Psychiatrist', 'Orderly', 'Visitor', 'Escaped Inmate'] },
      { name: 'Metropolis', roles: ['Superman', 'Lois Lane', 'Jimmy Olsen', 'Perry White', 'Lex Luthor', 'Citizen', 'Police Officer', 'Daily Planet Reporter', 'Photographer', 'News Anchor', 'Businessman', 'Tourist', 'Superhero Fan', 'Villain', 'LexCorp Employee'] },
      { name: 'Gotham City', roles: ['Batman', 'Commissioner Gordon', 'Detective', 'Corrupt Cop', 'Mob Boss', 'Street Thug', 'Wayne Enterprises Employee', 'Reporter', 'Vigilante', 'Citizen', 'Crime Scene Investigator', 'GCPD Officer', 'Arkham Escapee', 'District Attorney', 'Informant'] },
      { name: 'Justice League Watchtower', roles: ['Superman', 'Batman', 'Wonder Woman', 'Flash', 'Green Lantern', 'Aquaman', 'Cyborg', 'Martian Manhunter', 'Monitor Duty', 'Scientist', 'Engineer', 'Medical Officer', 'Security', 'Communications', 'Trainee Hero'] },
      { name: 'Themyscira', roles: ['Wonder Woman', 'Hippolyta', 'Antiope', 'Amazon Warrior', 'Oracle', 'Blacksmith', 'Healer', 'Trainer', 'Guard', 'Priestess', 'Young Amazon', 'Steve Trevor', 'Intruder', 'Ares', 'Cheetah'] },
      { name: 'Atlantis', roles: ['Aquaman', 'Mera', 'Ocean Master', 'Atlantean Soldier', 'Palace Guard', 'Royal Advisor', 'Scientist', 'Citizen', 'Black Manta', 'Sea Creature Trainer', 'Priest', 'Ambassador', 'Rebel', 'Surface Dweller', 'Trench Creature'] },
      { name: 'Central City', roles: ['Flash', 'Iris West', 'Cisco Ramon', 'Caitlin Snow', 'Joe West', 'Harrison Wells', 'S.T.A.R. Labs Scientist', 'Police Officer', 'Speedster Villain', 'Crime Scene Analyst', 'Reporter', 'Citizen', 'Meta-human', 'Time Remnant', 'Speedforce Entity'] },
      { name: 'LexCorp Tower', roles: ['Lex Luthor', 'Mercy Graves', 'Scientist', 'Security Guard', 'Engineer', 'Board Member', 'Secretary', 'Intern', 'Corporate Spy', 'Weapons Designer', 'Superman Hater', 'Lab Tech', 'Janitor', 'PR Manager', 'Kryptonite Researcher'] },
      { name: 'Hall of Justice', roles: ['Superman', 'Batman', 'Wonder Woman', 'Aquaman', 'Green Lantern', 'Flash', 'Tour Guide', 'Security', 'Visitor', 'Museum Curator', 'Sidekick', 'News Reporter', 'Young Justice Member', 'Janitor', 'Villain Disguised'] },
      { name: 'Apokolips', roles: ['Darkseid', 'Desaad', 'Granny Goodness', 'Kalibak', 'Steppenwolf', 'Parademon', 'Female Fury', 'Slave', 'Fire Pit Guard', 'Scientist', 'Warrior', 'Boom Tube Operator', 'Prisoner', 'Lowly', 'New God'] },
      { name: 'Oa (Green Lantern HQ)', roles: ['Guardian', 'Hal Jordan', 'John Stewart', 'Guy Gardner', 'Kilowog', 'Sinestro', 'Trainee Lantern', 'Alpha Lantern', 'Honor Guard', 'Book of Oa Keeper', 'Scientist', 'Ring Forger', 'Central Battery Guard', 'Ambassador', 'Yellow Lantern Spy'] },
      { name: 'Smallville', roles: ['Young Clark Kent', 'Martha Kent', 'Jonathan Kent', 'Lana Lang', 'Pete Ross', 'Lex Luthor', 'Farmer', 'High School Student', 'Teacher', 'Sheriff', 'Diner Owner', 'Meteor Mutant', 'Reporter', 'Curious Neighbor', 'Kryptonian Artifact Hunter'] },
      { name: 'Wayne Manor', roles: ['Bruce Wayne', 'Alfred', 'Dick Grayson', 'Tim Drake', 'Damian Wayne', 'Butler', 'Maid', 'Chef', 'Security Guard', 'Gardener', 'Party Guest', 'Socialite', 'Paparazzi', 'Talia al Ghul', 'League of Assassins Member'] }
    ],
    
    movies: [
      { name: 'Hogwarts', roles: ['Harry Potter', 'Hermione', 'Ron', 'Dumbledore', 'Snape', 'McGonagall', 'Hagrid', 'Student', 'House Elf', 'Ghost', 'Prefect', 'Quidditch Player', 'Death Eater', 'Professor', 'Malfoy'] },
      { name: 'The Shire', roles: ['Frodo', 'Sam', 'Merry', 'Pippin', 'Bilbo', 'Gandalf', 'Farmer', 'Innkeeper', 'Hobbit Child', 'Party Guest', 'Gardener', 'Baker', 'Ring Wraith', 'Traveling Dwarf', 'Elf Visitor'] },
      { name: 'Mordor', roles: ['Sauron', 'Saruman', 'Orc', 'Nazgul', 'Gollum', 'Uruk-hai', 'Tower Guard', 'Eye of Sauron', 'Mouth of Sauron', 'Orc Captain', 'Warg Rider', 'Slave', 'Prisoner', 'Corrupted Man', 'Dark Lord Servant'] },
      { name: 'Rivendell', roles: ['Elrond', 'Arwen', 'Legolas', 'Elf Warrior', 'Scholar', 'Healer', 'Council Member', 'Musician', 'Ranger', 'Gandalf', 'Visitor', 'Librarian', 'Guard', 'Blacksmith', 'Loremaster'] },
      { name: 'Death Star', roles: ['Darth Vader', 'Emperor', 'Stormtrooper', 'Imperial Officer', 'Pilot', 'Engineer', 'Prisoner', 'Rebel Spy', 'Gunner', 'Commander', 'Droid', 'Mechanic', 'Admiral', 'Scientist', 'Detention Guard'] },
      { name: 'Jurassic Park', roles: ['Ian Malcolm', 'Alan Grant', 'Ellie Sattler', 'John Hammond', 'Robert Muldoon', 'Scientist', 'Security Guard', 'Tour Guide', 'Lawyer', 'Veterinarian', 'Computer Programmer', 'Dinosaur Handler', 'Visitor', 'Chef', 'Raptor'] },
      { name: 'Titanic', roles: ['Jack', 'Rose', 'Cal', 'Captain Smith', 'Molly Brown', 'First Class Passenger', 'Third Class Passenger', 'Crew Member', 'Lookout', 'Violinist', 'Steward', 'Engineer', 'Lifeboat Officer', 'Iceberg Spotter', 'Survivor'] },
      { name: 'The Matrix', roles: ['Neo', 'Morpheus', 'Trinity', 'Agent Smith', 'Oracle', 'Cypher', 'Tank', 'Dozer', 'Mouse', 'Apoc', 'Switch', 'Architect', 'Keymaker', 'Merovingian', 'Seraph'] },
      { name: 'Pandora (Avatar)', roles: ['Jake Sully', 'Neytiri', 'Colonel Quaritch', 'Dr. Grace Augustine', 'Na\'vi Warrior', 'Scientist', 'Marine', 'Pilot', 'Ikran Rider', 'Toruk Makto', 'Shaman', 'Omaticaya Clan Member', 'RDA Employee', 'Avatar Driver', 'Thanator'] },
      { name: 'Gotham (Dark Knight)', roles: ['Batman', 'Joker', 'Harvey Dent', 'Commissioner Gordon', 'Alfred', 'Lucius Fox', 'Rachel Dawes', 'Scarecrow', 'Mob Boss', 'GCPD Officer', 'Corrupt Cop', 'Citizen', 'Bank Robber', 'Hospital Patient', 'Ferry Passenger'] },
      { name: 'Wonderland', roles: ['Alice', 'Mad Hatter', 'Cheshire Cat', 'Queen of Hearts', 'White Rabbit', 'Caterpillar', 'Tweedledee', 'Tweedledum', 'March Hare', 'Dormouse', 'Card Soldier', 'Talking Flower', 'Mock Turtle', 'Gryphon', 'Jabberwocky'] },
      { name: 'Shawshank Prison', roles: ['Andy Dufresne', 'Red', 'Warden Norton', 'Captain Hadley', 'Brooks', 'Tommy', 'Bogs', 'Heywood', 'Guard', 'Inmate', 'Librarian', 'New Fish', 'Parole Board', 'Corrupt Guard', 'Innocent Prisoner'] },
      { name: 'Fight Club Basement', roles: ['Tyler Durden', 'Narrator', 'Marla Singer', 'Bob', 'Fight Club Member', 'New Recruit', 'Bartender', 'Lou', 'Mechanic', 'Waiter', 'Space Monkey', 'Project Mayhem Member', 'Beaten Member', 'First Timer', 'Narrator\'s Boss'] },
      { name: 'Inception Dream', roles: ['Cobb', 'Arthur', 'Ariadne', 'Eames', 'Yusuf', 'Saito', 'Mal', 'Fischer', 'Extractor', 'Architect', 'Forger', 'Chemist', 'Tourist', 'Projection', 'Dream Security'] },
      { name: 'Wakanda (Black Panther)', roles: ['T\'Challa', 'Shuri', 'Okoye', 'Nakia', 'M\'Baku', 'W\'Kabi', 'Killmonger', 'Dora Milaje', 'Tribal Elder', 'Border Tribe', 'Merchant Tribe', 'River Tribe', 'Jabari Warrior', 'Scientist', 'Wakandan Citizen'] }
    ],
    
    medieval: [
      { name: 'Castle Throne Room', roles: ['King', 'Queen', 'Prince', 'Princess', 'Royal Advisor', 'Knight', 'Jester', 'Royal Guard', 'Nobleman', 'Noblewoman', 'Squire', 'Servant', 'Messenger', 'Bard', 'Assassin'] },
      { name: 'Medieval Tavern', roles: ['Innkeeper', 'Barmaid', 'Drunk Patron', 'Traveling Merchant', 'Bard', 'Knight', 'Thief', 'Gambler', 'Cook', 'Stable Boy', 'Mysterious Hooded Figure', 'Local Drunk', 'Bounty Hunter', 'Peasant', 'Wanted Criminal'] },
      { name: 'Blacksmith Forge', roles: ['Master Blacksmith', 'Apprentice', 'Knight Customer', 'Weaponsmith', 'Armorer', 'Bellows Operator', 'Metal Merchant', 'Sword Buyer', 'Beggar', 'Thief', 'Noble Customer', 'Royal Armorer', 'Village Blacksmith', 'Swordmaster', 'Coal Deliverer'] },
      { name: 'Medieval Market', roles: ['Merchant', 'Baker', 'Butcher', 'Fishmonger', 'Fabric Seller', 'Blacksmith', 'Herbalist', 'Pickpocket', 'Town Crier', 'Guard', 'Noble Shopper', 'Peasant', 'Traveling Salesman', 'Street Performer', 'Tax Collector'] },
      { name: 'Monastery', roles: ['Abbot', 'Monk', 'Novice', 'Scribe', 'Librarian', 'Herbalist', 'Pilgrim', 'Healer', 'Gardener', 'Cook', 'Bell Ringer', 'Illuminator', 'Choir Member', 'Guest', 'Wandering Friar'] },
      { name: 'Jousting Tournament', roles: ['Champion Knight', 'Challenger', 'Herald', 'Squire', 'King', 'Queen', 'Noble Spectator', 'Peasant Spectator', 'Weapons Master', 'Horse Trainer', 'Tent Master', 'Physician', 'Bard', 'Betting Man', 'Disgraced Knight'] },
      { name: 'Castle Dungeon', roles: ['Dungeon Master', 'Torturer', 'Guard', 'Prisoner', 'Political Prisoner', 'Thief', 'Traitor', 'Spy', 'Witch', 'Heretic', 'Debtor', 'Executioner', 'Priest', 'Jailer', 'Innocent Victim'] },
      { name: 'Wizard\'s Tower', roles: ['Wizard', 'Apprentice', 'Familiar', 'Alchemist', 'Scribe', 'Magic Student', 'Librarian', 'Demon', 'Summoned Creature', 'Scholar', 'Potion Maker', 'Spell Caster', 'Tower Guard', 'Visiting Mage', 'Cursed Servant'] },
      { name: 'Knights\' Barracks', roles: ['Knight Commander', 'Veteran Knight', 'Young Knight', 'Squire', 'Weapons Master', 'Armor Keeper', 'Stable Hand', 'Blacksmith', 'Trainer', 'Page', 'Messenger', 'Healer', 'Cook', 'Guard Captain', 'Disgraced Knight'] },
      { name: 'Royal Banquet', roles: ['King', 'Queen', 'Jester', 'Bard', 'Cup Bearer', 'Chef', 'Servant', 'Noble Guest', 'Foreign Ambassador', 'Royal Taster', 'Entertainer', 'Juggler', 'Acrobat', 'Poisoner', 'Spy'] },
      { name: 'Medieval Village', roles: ['Village Elder', 'Blacksmith', 'Baker', 'Farmer', 'Miller', 'Shepherd', 'Peasant', 'Town Guard', 'Priest', 'Healer', 'Innkeeper', 'Beggar', 'Traveling Merchant', 'Tax Collector', 'Witch'] },
      { name: 'Dragon\'s Lair', roles: ['Dragon', 'Knight Slayer', 'Treasure Hunter', 'Captured Princess', 'Wizard', 'Brave Warrior', 'Scared Squire', 'Kobold', 'Dragon Cultist', 'Cursed Victim', 'Former Hero', 'Gold Hoarding Dragon', 'Cave Explorer', 'Trapped Adventurer', 'Dragon Egg Guardian'] },
      { name: 'Plague Village', roles: ['Doctor', 'Plague Victim', 'Priest', 'Healer', 'Grave Digger', 'Town Watch', 'Survivor', 'Quarantined Resident', 'Herbalist', 'Merchant', 'Fleeing Noble', 'Desperate Mother', 'Undertaker', 'Witch Hunter', 'Paranoid Villager'] },
      { name: 'Siege Battlefield', roles: ['King', 'General', 'Knight', 'Archer', 'Foot Soldier', 'Siege Engineer', 'Medic', 'Spy', 'Messenger', 'Squire', 'Catapult Operator', 'Cavalry', 'Supply Runner', 'Wounded Soldier', 'Traitor'] },
      { name: 'Enchanted Forest', roles: ['Elf', 'Dwarf', 'Fairy', 'Druid', 'Ranger', 'Witch', 'Wizard', 'Forest Guardian', 'Unicorn', 'Centaur', 'Tree Ent', 'Lost Traveler', 'Hunter', 'Bandit', 'Cursed Prince'] }
    ],
    
    websites: [
      { name: 'Reddit Office', roles: ['Moderator', 'Admin', 'Karma Farmer', 'Troll', 'Lurker', 'Power User', 'Subreddit Creator', 'Bot', 'Downvote Brigade', 'Wholesome Poster', 'Reposter', 'AMA Guest', 'Gilded User', 'Banned User', 'New Redditor'] },
      { name: 'YouTube Studio', roles: ['YouTuber', 'Video Editor', 'Cameraman', 'Thumbnail Designer', 'Subscriber', 'Hater', 'Copyright Striker', 'Monetization Specialist', 'Comment Moderator', 'Reaction YouTuber', 'Demonetized Creator', 'Algorithm Expert', 'Sponsor', 'Clickbaiter', 'Livestreamer'] },
      { name: 'Discord Server', roles: ['Server Owner', 'Admin', 'Moderator', 'Bot', 'Active Member', 'Lurker', 'Troll', 'Nitro User', 'Emoji Spammer', 'DM Slider', 'Gamer', 'Music Bot', 'Meme Lord', 'Server Booster', 'Banned User Alt'] },
      { name: 'TikTok House', roles: ['Famous TikToker', 'Up and Coming Creator', 'Manager', 'Videographer', 'Dancer', 'Comedy Creator', 'Makeup Artist', 'Editor', 'Chef', 'Housekeeper', 'Brand Deal Rep', 'Cancelled Creator', 'Drama Stirrer', 'Backup Dancer', 'Pet Influencer'] },
      { name: 'Twitter HQ', roles: ['CEO', 'Developer', 'Content Moderator', 'Verified User', 'Ratio\'d User', 'Bot Account', 'Blue Checkmark', 'Trending Topic Starter', 'Reply Guy', 'Quote Tweet Master', 'Canceled User', 'Thread Maker', 'Meme Account', 'News Breaker', 'Troll'] },
      { name: 'Twitch Stream', roles: ['Streamer', 'Moderator', 'Subscriber', 'Viewer', 'Troll', 'Donator', 'Emote Spammer', 'Lurker', 'Raid Leader', 'Chatter', 'Clip Chimp', 'Hype Man', 'Bot', 'Banned User', 'Bits Donator'] },
      { name: 'Amazon Warehouse', roles: ['Warehouse Worker', 'Manager', 'Packer', 'Driver', 'Robot', 'Customer Return Processor', 'Quality Control', 'Forklift Operator', 'Scanner', 'Sorter', 'Prime Member', 'Stolen Package', 'Union Organizer', 'Jeff Bezos', 'Delivery Drone'] },
      { name: 'LinkedIn Office', roles: ['CEO', 'Recruiter', 'Job Seeker', 'Humble Bragger', 'Thought Leader', 'Connection Collector', 'Endorsement Farmer', 'Motivational Speaker', 'Unemployed Graduate', 'Networking Pro', 'Cringe Poster', 'Sales Rep', 'HR Manager', 'Algorithm Gamer', 'Spam Messenger'] },
      { name: 'Instagram Influencer Shoot', roles: ['Influencer', 'Photographer', 'Makeup Artist', 'Manager', 'Brand Rep', 'Assistant', 'Props Manager', 'Fan', 'Paparazzi', 'Filter Expert', 'Location Scout', 'Videographer', 'Comment Engagement Pod Member', 'Fake Follower Bot', 'Jealous Competitor'] },
      { name: 'Wikipedia Edit War', roles: ['Admin', 'Editor', 'Vandal', 'Subject Expert', 'Passionate Amateur', 'Citation Needed Guy', 'Revert Warrior', 'Talk Page Debater', 'Bot', 'Banned User', 'Sockpuppet Account', 'Neutral Observer', 'Biased Editor', 'Bureaucrat', 'Stubborn Contributor'] },
      { name: 'Steam Game Launch', roles: ['Game Developer', 'QA Tester', 'Community Manager', 'Player', 'Hater', 'Review Bomber', 'Early Access Buyer', 'Refund Requester', 'Bug Reporter', 'Streamer', 'Mod Creator', 'Achievement Hunter', 'Forum Troll', 'Discount Waiter', 'Trading Card Farmer'] },
      { name: 'Netflix Office', roles: ['Content Curator', 'Algorithm Engineer', 'Producer', 'Binge Watcher', 'Show Canceller', 'Password Sharer', 'Subscription Manager', 'Recommendation Bot', 'Documentary Maker', 'Stand-up Comedian', 'Anime Fan', 'Movie Critic', 'Autoplay Hater', 'Original Series Creator', 'Are You Still Watching Person'] },
      { name: 'OnlyFans', roles: ['Content Creator', 'Subscriber', 'Manager', 'Photographer', 'Editor', 'Top 1% Earner', 'New Creator', 'Catfish', 'Simp', 'Tipper', 'Request Maker', 'DM Responder', 'Free Trial Hunter', 'Leaked Content Reporter', 'Account Manager'] },
      { name: 'eBay Warehouse', roles: ['Seller', 'Buyer', 'Bidder', 'Scammer', 'Power Seller', 'Feedback Farmer', 'Shipping Manager', 'Auction Sniper', 'Returns Processor', 'Collector', 'Reseller', 'Non-Payer', 'Dispute Filer', 'Rare Item Hunter', 'Vintage Seller'] },
      { name: 'Spotify Office', roles: ['Playlist Curator', 'Artist', 'Podcast Host', 'Algorithm Engineer', 'Listener', 'Premium User', 'Ad Skipper', 'Discover Weekly Fan', 'Wrapped Sharer', 'Family Plan Moocher', 'Indie Artist', 'Top 0.01% Fan', 'Shuffle Hater', 'Lyrics Reader', 'Queue Manager'] }
    ],
    
    popculture: [
      { name: 'Squid Game', roles: ['Player 456', 'Player 001', 'VIP Guest', 'Front Man', 'Guard', 'Game Master', 'Desperate Player', 'Strategic Player', 'Scared Player', 'Betrayer', 'Alliance Member', 'Old Player', 'Young Player', 'Marble Game Partner', 'Glass Bridge Walker'] },
      { name: 'The Office', roles: ['Michael Scott', 'Dwight', 'Jim', 'Pam', 'Angela', 'Kevin', 'Oscar', 'Stanley', 'Phyllis', 'Ryan', 'Kelly', 'Toby', 'Creed', 'Intern', 'Regional Manager'] },
      { name: 'Friends Apartment', roles: ['Rachel', 'Ross', 'Monica', 'Chandler', 'Joey', 'Phoebe', 'Gunther', 'Janice', 'Central Perk Customer', 'Ugly Naked Guy', 'Neighbor', 'Guest Star', 'Roommate', 'Date', 'Smelly Cat'] },
      { name: 'Stranger Things', roles: ['Eleven', 'Mike', 'Dustin', 'Lucas', 'Will', 'Joyce', 'Hopper', 'Steve', 'Demogorgon', 'Mind Flayer', 'Dr. Brenner', 'Lab Experiment', 'Hawkins Resident', 'Upside Down Creature', 'D&D Player'] },
      { name: 'Among Us Ship', roles: ['Crewmate', 'Imposter', 'Engineer', 'Scientist', 'Guardian Angel', 'Shapeshifter', 'AFK Player', 'Task Doer', 'Emergency Button Presser', 'Vent User', 'Security Camera Watcher', 'Medbay Scanner', 'Electrical Fixer', 'Sus Person', 'Dead Body Reporter'] },
      { name: 'Minecraft World', roles: ['Steve', 'Alex', 'Creeper', 'Enderman', 'Villager', 'Zombie', 'Skeleton', 'Builder', 'Miner', 'Farmer', 'Redstone Engineer', 'Speedrunner', 'PvP Player', 'Noob', 'Ender Dragon'] },
      { name: 'Fortnite Battle', roles: ['Default Skin', 'Sweat', 'Bot', 'Streamer', 'Squad Leader', 'Sniper', 'Builder', 'Bush Camper', 'Storm Runner', 'Loot Goblin', 'Emote Dancer', 'Skin Collector', 'No Skin', 'Try Hard', 'AFK Player'] },
      { name: 'Breaking Bad RV', roles: ['Walter White', 'Jesse Pinkman', 'DEA Agent', 'Cartel Member', 'Rival Cook', 'Customer', 'Supplier', 'Cleanup Crew', 'Lawyer', 'Informant', 'Hank', 'Gus', 'Mike', 'Junkie', 'Witness'] },
      { name: 'Game of Thrones', roles: ['Jon Snow', 'Daenerys', 'Tyrion', 'Cersei', 'Jaime', 'Arya', 'Sansa', 'White Walker', 'Dragon', 'Maester', 'Knight', 'Wildling', 'Lord', 'Assassin', 'King\'s Guard'] },
      { name: 'SpongeBob\'s Bikini Bottom', roles: ['SpongeBob', 'Patrick', 'Squidward', 'Mr. Krabs', 'Sandy', 'Plankton', 'Karen', 'Gary', 'Mrs. Puff', 'Pearl', 'Larry', 'Krusty Krab Customer', 'Jellyfish', 'Mermaid Man', 'Barnacle Boy'] },
      { name: 'Marvel Snap', roles: ['Iron Man', 'Captain America', 'Hulk', 'Thor', 'Black Widow', 'Spider-Man', 'Doctor Strange', 'Loki', 'Thanos', 'Galactus', 'Destroyer', 'Cosmo', 'Shang-Chi', 'She-Hulk', 'Devil Dinosaur'] },
      { name: 'Wednesday Addams School', roles: ['Wednesday', 'Enid', 'Xavier', 'Bianca', 'Tyler', 'Principal Weems', 'Outcast Student', 'Normie Student', 'Monster', 'Sheriff', 'Therapist', 'Teacher', 'Goth Student', 'Siren', 'Werewolf'] },
      { name: 'Ted Lasso Locker Room', roles: ['Ted Lasso', 'Coach Beard', 'Roy Kent', 'Jamie Tartt', 'Keeley', 'Rebecca', 'Nathan', 'Sam', 'Dani Rojas', 'Isaac', 'Colin', 'Will', 'Trent Crimm', 'Rupert', 'Dr. Sharon'] },
      { name: 'Last of Us', roles: ['Joel', 'Ellie', 'Clicker', 'Bloater', 'Survivor', 'Firefly', 'FEDRA Soldier', 'Infected', 'Smuggler', 'Scavenger', 'Doctor', 'Hunter', 'Tommy', 'Tess', 'Resistance Fighter'] },
      { name: 'Yellowstone Ranch', roles: ['John Dutton', 'Beth', 'Kayce', 'Rip', 'Jamie', 'Cowboy', 'Ranch Hand', 'Horse Trainer', 'Livestock Agent', 'Native American', 'Land Developer', 'Governor', 'Lawyer', 'Branded Worker', 'Journalist'] }
    ],
    
    anime: [
      { name: 'U.A. High School (My Hero Academia)', roles: ['All Might', 'Deku', 'Bakugo', 'Todoroki', 'Ochaco', 'Aizawa', 'Present Mic', 'Recovery Girl', 'Class 1-A Student', 'Class 1-B Student', 'Support Course Student', 'Villain Spy', 'Principal Nezu', 'Lunch Rush', 'Janitor'] },
      { name: 'Survey Corps HQ (Attack on Titan)', roles: ['Eren Jaeger', 'Mikasa', 'Armin', 'Levi', 'Erwin', 'Hange', 'Jean', 'Connie', 'Sasha', 'New Recruit', 'Veteran Scout', 'Titan Shifter', 'Military Police Spy', 'Stable Hand', 'Cook'] },
      { name: 'Hidden Leaf Village (Naruto)', roles: ['Naruto', 'Sasuke', 'Sakura', 'Kakashi', 'Hokage', 'Anbu Black Ops', 'Genin', 'Chunin', 'Jonin', 'Academy Student', 'Ichiraku Ramen Chef', 'Medical Ninja', 'Root Spy', 'Village Elder', 'Gate Guard'] },
      { name: 'Thousand Sunny (One Piece)', roles: ['Luffy', 'Zoro', 'Nami', 'Sanji', 'Chopper', 'Robin', 'Franky', 'Brook', 'Usopp', 'Jinbe', 'Stowaway', 'Marine Spy', 'Captured Pirate', 'Mysterious Passenger', 'News Coo'] },
      { name: 'Death Note Investigation HQ', roles: ['Light Yagami', 'L', 'Misa Amane', 'Ryuk', 'Near', 'Mello', 'Matsuda', 'Soichiro Yagami', 'Watari', 'Task Force Member', 'FBI Agent', 'Kira Supporter', 'News Reporter', 'Shinigami', 'Innocent Suspect'] },
      { name: 'Spirit World Bathhouse (Spirited Away)', roles: ['Chihiro', 'Haku', 'Yubaba', 'No-Face', 'Lin', 'Kamaji', 'Zeniba', 'Radish Spirit', 'Frog Worker', 'Slug Woman', 'Bathhouse Customer', 'Soot Sprite', 'River Spirit', 'Gold Spirit', 'Lost Human'] },
      { name: 'Demon Slayer Corps Headquarters', roles: ['Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke', 'Hashira', 'Kagaya Ubuyashiki', 'Kakushi', 'Demon Slayer Trainee', 'Swordsmith', 'Crow Messenger', 'Medical Staff', 'Retired Slayer', 'Hidden Demon', 'Butterfly Mansion Nurse', 'Final Selection Survivor'] },
      { name: 'Capsule Corp (Dragon Ball)', roles: ['Goku', 'Vegeta', 'Bulma', 'Trunks', 'Dr. Brief', 'Android 18', 'Piccolo', 'Krillin', 'Scientist', 'Security Guard', 'Capsule Corp Employee', 'Time Traveler', 'Red Ribbon Spy', 'Namekian Visitor', 'World Tournament Fighter'] },
      { name: 'Tokyo Jujutsu High', roles: ['Yuji Itadori', 'Megumi', 'Nobara', 'Gojo Satoru', 'Principal Yaga', 'Cursed Corpse', 'First Year Student', 'Second Year Student', 'Third Year Student', 'Curse User Spy', 'Window Cleaner', 'Exchange Student', 'Jujutsu Sorcerer', 'Panda', 'Maki'] },
      { name: 'Hunter Exam Site (Hunter x Hunter)', roles: ['Gon', 'Killua', 'Kurapika', 'Leorio', 'Hisoka', 'Examiner', 'Rookie Crusher', 'Veteran Applicant', 'First Time Applicant', 'Undercover Hunter', 'Medical Staff', 'Phantom Troupe Spy', 'Failed Applicant', 'Blimp Pilot', 'Judge'] },
      { name: 'Sword Art Online - Floor 1 Town', roles: ['Kirito', 'Asuna', 'Klein', 'Agil', 'Heathcliff', 'Beta Tester', 'New Player', 'Guild Leader', 'Solo Player', 'Blacksmith', 'Merchant', 'Info Broker', 'Clearer', 'Orange Player', 'NPC Glitch'] },
      { name: 'Ouran High School Host Club', roles: ['Tamaki', 'Haruhi', 'Kyoya', 'Hikaru', 'Kaoru', 'Honey', 'Mori', 'Club Guest', 'Newspaper Club Spy', 'Jealous Rival', 'Rich Student', 'Scholarship Student', 'Teacher', 'School Chairman', 'Renge'] },
      { name: 'Nerv Headquarters (Evangelion)', roles: ['Shinji', 'Rei', 'Asuka', 'Misato', 'Gendo', 'Ritsuko', 'Maya', 'Eva Pilot', 'Bridge Operator', 'Scientist', 'Section 2 Agent', 'Seele Spy', 'Maintenance Worker', 'Cafeteria Staff', 'Penguin (Pen Pen)'] },
      { name: 'Fairy Tail Guild Hall', roles: ['Natsu', 'Lucy', 'Gray', 'Erza', 'Happy', 'Makarov', 'Mirajane', 'Guild Member', 'S-Class Wizard', 'New Recruit', 'Bartender', 'Job Board Manager', 'Rival Guild Spy', 'Celestial Spirit', 'Exceed'] },
      { name: 'Tokyo Ghoul Coffee Shop (Anteiku)', roles: ['Kaneki', 'Touka', 'Yoshimura', 'Hide', 'Hinami', 'Nishiki', 'Ghoul Customer', 'Human Customer', 'CCG Investigator', 'Waiter', 'Barista', 'Aogiri Spy', 'One-Eyed Ghoul', 'Kagune User', 'Mask Maker'] }
    ],

    horror: [
      { name: 'Haunted Victorian Mansion', roles: ['Ghost Hunter', 'Skeptic', 'Medium', 'Homeowner', 'Real Estate Agent', 'Paranormal Investigator', 'Camera Operator', 'Terrified Guest', 'Caretaker', 'Vengeful Spirit', 'Possessed Person', 'Priest', 'Historian', 'Urban Explorer', 'Previous Owner\'s Ghost'] },
      { name: 'Summer Camp Crystal Lake', roles: ['Camp Counselor', 'Head Counselor', 'Camper', 'Camp Cook', 'Lifeguard', 'Groundskeeper', 'Final Girl', 'Jock', 'Stoner', 'Virgin', 'Sheriff', 'Masked Killer', 'Lone Survivor', 'Camp Nurse', 'Kayak Instructor'] },
      { name: 'Overlook Hotel', roles: ['Caretaker', 'Hotel Manager', 'Chef', 'Bartender', 'Maid', 'Guest', 'Writer', 'Psychic Child', 'Ghost of Former Guest', 'Concerned Wife', 'Previous Caretaker', 'Snowcat Driver', 'Room 237 Spirit', 'Twin Ghosts', 'Hotel Inspector'] },
      { name: 'Elm Street Neighborhood', roles: ['Teenager', 'Sleep-Deprived Teen', 'Psychiatrist', 'Parent in Denial', 'Dream Warrior', 'Nightmare Victim', 'Police Officer', 'Nurse', 'Hypnotherapist', 'Burned Killer', 'Coffee Shop Worker', 'Sleep Researcher', 'Babysitter', 'Pool Party Host', 'Freddy Fan'] },
      { name: 'Cabin in the Woods', roles: ['The Athlete', 'The Scholar', 'The Virgin', 'The Fool', 'The Whore', 'Control Room Technician', 'Facility Director', 'Zombie Redneck', 'Ancient God', 'Security Guard', 'Maintenance Worker', 'Betting Pool Participant', 'Monster Handler', 'Elevator Operator', 'Survivor'] },
      { name: 'Raccoon City Police Station', roles: ['Rookie Cop', 'Veteran Officer', 'S.T.A.R.S. Member', 'Umbrella Scientist', 'Survivor', 'Infected Citizen', 'Reporter', 'Weapons Dealer', 'Helicopter Pilot', 'Lab Escapee', 'Tyrant', 'Zombie', 'Chief of Police', 'Prisoner', 'Mysterious Woman in Red'] },
      { name: 'The Conjuring House', roles: ['Ed Warren', 'Lorraine Warren', 'Haunted Family Father', 'Haunted Family Mother', 'Possessed Child', 'Skeptical Teenager', 'Police Officer', 'Priest', 'Demonologist Assistant', 'News Reporter', 'Neighbor', 'Previous Owner Ghost', 'Witch Spirit', 'Dog', 'Camera Operator'] },
      { name: 'Haddonfield (Halloween Night)', roles: ['Babysitter', 'The Shape', 'Psychiatrist', 'Sheriff', 'Trick-or-Treater', 'Concerned Parent', 'Final Girl', 'Boyfriend', 'Party Teen', 'News Anchor', 'Asylum Nurse', 'Neighbor Watching TV', 'Gas Station Attendant', 'Cemetery Keeper', 'Prank Caller'] },
      { name: 'Saw Trap Room', roles: ['Jigsaw', 'Jigsaw Apprentice', 'Victim', 'Detective', 'SWAT Team Member', 'Doctor', 'Dirty Cop', 'Drug Addict', 'Cheating Spouse', 'Insurance Fraudster', 'FBI Agent', 'Forensic Analyst', 'Game Survivor', 'Morgue Worker', 'Billy the Puppet'] },
      { name: 'Amityville House', roles: ['New Homeowner', 'Skeptical Spouse', 'Possessed Father', 'Terrified Child', 'Priest', 'Real Estate Agent', 'Previous Murder Investigator', 'Paranormal Researcher', 'Nosy Neighbor', 'Babysitter', 'Exterminator', 'Historical Society Member', 'News Reporter', 'DeFeo Ghost', 'Demon'] },
      { name: 'The Upside Down', roles: ['Eleven', 'Lost Kid', 'Demogorgon', 'Mind Flayer Spy', 'Government Scientist', 'Search Party Member', 'Sheriff', 'Protective Mother', 'AV Club Member', 'Demodogs', 'Russian Spy', 'Teenager with Bat', 'Psychic Escapee', 'Hawkins Lab Guard', 'Vine Creature'] },
      { name: 'Purge Night Streets', roles: ['Purger', 'Hiding Family', 'Rich Elite', 'Homeless Target', 'Anti-Purge Rebel', 'NFFA Official', 'Emergency Services (Off-duty)', 'Masked Gang Leader', 'Revenge Seeker', 'Lost Tourist', 'Survivalist', 'Murder Tourist', 'Underground Doctor', 'Security Guard', 'News Drone Operator'] },
      { name: 'Silent Hill', roles: ['Lost Parent', 'Cult Member', 'Nurse Monster', 'Pyramid Head', 'Police Officer', 'Survivor', 'Demon Child', 'Institutionalized Patient', 'Truck Driver', 'Cult Leader', 'Radio Static Hearer', 'Fog Walker', 'Monster Victim', 'Church Refugee', 'Mannequin Creature'] },
      { name: 'Texas Chainsaw Farmhouse', roles: ['Hitchhiker', 'Road Tripper', 'Gas Station Owner', 'Leatherface', 'Cannibal Grandpa', 'Final Girl', 'Wheelchair Friend', 'Van Driver', 'Sheriff', 'Local Drunk', 'BBQ Restaurant Owner', 'Meat Hook Victim', 'Chainsaw Survivor', 'Escaped Prisoner', 'Documentary Filmmaker'] },
      { name: 'The Shining Hedge Maze', roles: ['Psychic Child', 'Axe-Wielding Father', 'Terrified Mother', 'Hotel Ghost', 'Maze Groundskeeper', 'Frozen Victim', 'Snow Cat Rescuer', 'Bartender Ghost', 'Woman in Bathtub', 'Twin Girls', 'Hedge Trimmer', 'Lost Tourist', 'Winter Caretaker', 'Previous Victim', 'Typewriter Ghost'] }
    ],

    realitytv: [
      { name: 'Love Island Villa', roles: ['Bombshell', 'Day One Islander', 'Coupled Up Islander', 'Single Islander', 'Casa Amor Intruder', 'Narrator', 'Producer', 'Camera Operator', 'Dumped Islander', 'Public Vote Favorite', 'Villain Edit', 'Cringe Couple', 'Friendship Couple', 'Islander\'s Ex', 'Host'] },
      { name: 'Survivor Tribal Council', roles: ['Challenge Beast', 'Strategic Mastermind', 'Goat', 'Blindside Victim', 'Hidden Immunity Idol Holder', 'Jury Member', 'Host', 'Camera Crew', 'Medical Team', 'Torch Snuffer', 'First Boot', 'Merge Survivor', 'Final Tribal Contestant', 'Bitter Jury Member', 'Fan Favorite'] },
      { name: 'Big Brother House', roles: ['Head of Household', 'Nominee', 'Power of Veto Holder', 'Backdoor Target', 'Floater', 'Showmance Partner', 'Alliance Leader', 'House Pariah', 'Diary Room Confessionalist', 'Evicted Houseguest', 'Comeback Player', 'Twist Victim', 'Comp Beast', 'Social Player', 'Chaos Agent'] },
      { name: 'The Bachelor Mansion', roles: ['Bachelor/Bachelorette', 'First Impression Rose', 'Villain', 'Night One Elimination', 'Fantasy Suite Date', 'Limo Arrival', 'Crying in ITM', 'Group Date Participant', 'One-on-One Date', 'Rose Ceremony Reject', 'Hometown Date Family', 'Producer', 'Host Chris Harrison', 'Jealous Contestant', 'There for Wrong Reasons'] },
      { name: 'RuPaul\'s Drag Race Werkroom', roles: ['RuPaul', 'Frontrunner', 'Underdog', 'Lip Sync Assassin', 'First Eliminated', 'Pit Crew', 'Guest Judge', 'Seamstress', 'Makeup Artist', 'Snatch Game Winner', 'Untucked Drama Starter', 'Miss Congeniality', 'Villain Queen', 'Fan Favorite', 'Returning Queen'] },
      { name: 'MasterChef Kitchen', roles: ['Gordon Ramsay', 'Home Cook', 'Professional Ringer', 'Crying Contestant', 'Immunity Pin Holder', 'Pressure Test Victim', 'Balcony Spectator', 'Eliminated Chef', 'Sous Chef', 'Food Critic Guest', 'Family Visit', 'Mystery Box Winner', 'Team Challenge Captain', 'Raw Chicken Server', 'Dessert Specialist'] },
      { name: 'The Circle Apartment', roles: ['Catfish', 'Real Player', 'Influencer', 'Blocked Player', 'Super Fan', 'Flirt', 'Alliance Builder', 'Rankings Manipulator', 'Newcomer', 'Host', 'Producer Voice', 'Popular Player', 'Strategic Catfish', 'Clueless Player', 'Finale Winner'] },
      { name: 'Jersey Shore House', roles: ['The Situation', 'GTL Enthusiast', 'Grenade Whistle Holder', 'Smoosh Room User', 'Duck Phone Caller', 'Sunday Dinner Cook', 'Club Promoter', 'Cab Driver', 'T-Shirt Shop Employee', 'Landlord', 'Camera Crew', 'Drunk Roommate', 'Morning After Regret', 'Boardwalk Walker', 'Fist Pumper'] },
      { name: 'The Amazing Race Pit Stop', roles: ['Phil Keoghan', 'First Place Team', 'Last Place Team', 'Eliminated Team', 'U-Turned Team', 'Yield Victim', 'Express Pass Holder', 'Racer', 'Greeter', 'Taxi Driver', 'Roadblock Participant', 'Detour Chooser', 'Speed Bump Team', 'Bickering Couple', 'Fan Favorite Team'] },
      { name: 'Hell\'s Kitchen', roles: ['Gordon Ramsay', 'Sous Chef', 'Contestant', 'First Elimination', 'Black Jacket', 'Signature Dish Failure', 'Raw Protein Server', 'Dining Room Customer', 'Maitre D\'', 'Line Cook', 'Dessert Station', 'Meat Station', 'Fish Station', 'Walk-Out', 'Finale Winner'] },
      { name: 'Keeping Up Mansion', roles: ['Kim', 'Kris Jenner', 'Camera Crew', 'Bodyguard', 'Personal Assistant', 'Glam Team', 'Chef', 'Nanny', 'Business Manager', 'PR Crisis Handler', 'Paparazzi', 'Friend of Family', 'Boyfriend of the Season', 'Brand Deal Rep', 'Social Media Manager'] },
      { name: 'Shark Tank Set', roles: ['Mark Cuban', 'Entrepreneur', 'Nervous Pitcher', 'Successful Deal Maker', 'Walked Away', 'Valuation Disaster', 'Camera Operator', 'Stage Manager', 'Infomercial Product', 'Tech Startup', 'Food Business', 'Crying Founder', 'Family Business', 'Update Segment Success', 'Guest Shark'] },
      { name: 'The Real World House', roles: ['Confessional Regular', 'Hookup Partner', 'House Mom/Dad', 'Party Animal', 'Political Debater', 'Job Skipper', 'Phone Booth Crier', 'Camera Crew', 'Producers', 'First to Leave', 'Replacement Roommate', 'Drama Starter', 'Peacemaker', 'Drunk Mess', 'Genuine Person'] },
      { name: 'Too Hot to Handle Beach', roles: ['Rule Breaker', 'Lana the Cone', 'Serial Kisser', 'Workshop Leader', 'New Arrival', 'Loyal Player', 'Prize Money Loser', 'Retreat Host', 'Coupled Up Player', 'Temptation', 'Confession Booth User', 'Rule Follower', 'Heartbreaker', 'Genuine Connection', 'Thirst Trap'] },
      { name: 'Queer Eye Makeover House', roles: ['Antoni (Food)', 'Tan (Fashion)', 'Karamo (Culture)', 'Bobby (Design)', 'Jonathan (Grooming)', 'Hero (Makeover Subject)', 'Nominator', 'Family Member', 'Best Friend', 'Co-worker', 'Camera Crew', 'Crying During Reveal', 'Supportive Neighbor', 'Before and After', 'Emotional Breakdown'] }
    ],

    videogames: [
      { name: 'Los Santos (GTA V)', roles: ['Franklin', 'Michael', 'Trevor', 'Lester', 'Strip Club DJ', 'Car Dealer', 'Bank Teller', 'LSPD Officer', 'FIB Agent', 'Gang Member', 'Prostitute', 'Street Racer', 'Ammunation Clerk', 'Taxi Driver', 'Heist Crew Member'] },
      { name: 'Hyrule Castle (Zelda)', roles: ['Link', 'Zelda', 'Ganondorf', 'Royal Guard', 'Castle Servant', 'Sheikah Spy', 'Goron Ambassador', 'Zora Diplomat', 'Gerudo Visitor', 'Rito Messenger', 'Malice Infected', 'Cook', 'Stable Hand', 'Court Musician', 'Ancient Researcher'] },
      { name: 'Pokemon Gym', roles: ['Gym Leader', 'Challenger', 'Gym Trainer', 'Pokemon', 'Referee', 'Spectator', 'Pokemon Center Nurse', 'Pokedex Researcher', 'Team Rocket Grunt', 'Elite Four Scout', 'Badge Collector', 'Breeding Expert', 'Evolution Specialist', 'Shiny Hunter', 'Gym Guide'] },
      { name: 'Verdansk Warzone', roles: ['Operator', 'Camper', 'Loadout Dropper', 'Gulag Fighter', 'Bounty Target', 'Most Wanted', 'Helicopter Pilot', 'Vehicle Driver', 'Sniper', 'Buy Station User', 'Gas Mask Wearer', 'Self-Reviver', 'Hacker', 'Streamer', 'Squad Wiper'] },
      { name: 'The Lands Between (Elden Ring)', roles: ['Tarnished', 'Maiden', 'Demigod', 'Merchant', 'Spirit Ash', 'Invader', 'Cooperator', 'Site of Grace Rester', 'Rune Farmer', 'Message Writer', 'Scarlet Rot Victim', 'Dragon', 'Erdtree Worshipper', 'Volcano Manor Assassin', 'Jar Warrior'] },
      { name: 'Rapture (Bioshock)', roles: ['Jack', 'Andrew Ryan', 'Atlas', 'Big Daddy', 'Little Sister', 'Splicer', 'Fontaine', 'Scientist', 'Doctor', 'Security Guard', 'Artist', 'Smuggler', 'Gatherer', 'Plasmid Addict', 'Survivor'] },
      { name: 'USG Ishimura (Dead Space)', roles: ['Isaac Clarke', 'Engineer', 'Necromorph', 'Unitologist', 'Ship Captain', 'Medical Officer', 'Security Team', 'Survivor', 'Marker Worshipper', 'Hallucinating Crew', 'Escape Pod User', 'Maintenance Worker', 'Science Officer', 'Weapons Specialist', 'Communications Officer'] },
      { name: 'Aperture Science (Portal)', roles: ['Chell', 'GLaDOS', 'Wheatley', 'Cave Johnson Recording', 'Test Subject', 'Turret', 'Companion Cube', 'Scientist', 'Maintenance Bot', 'Defective Turret', 'Core', 'Rat Man', 'Mannequin', 'Cake Believer', 'Escaped Test Subject'] },
      { name: 'Hogwarts Legacy Castle', roles: ['New Student', 'Professor', 'House Ghost', 'Prefect', 'Quidditch Player', 'Forbidden Forest Explorer', 'Room of Requirement User', 'Dark Wizard', 'Goblin Rebel', 'Poacher', 'Ministry Official', 'Hogsmeade Shopkeeper', 'House Elf', 'Portrait', 'Astronomy Tower Stargazer'] },
      { name: 'Night City (Cyberpunk)', roles: ['V', 'Johnny Silverhand', 'Fixer', 'Corpo', 'Street Kid', 'Nomad', 'Netrunner', 'Solo', 'Ripperdoc', 'Joytoy', 'NCPD Officer', 'Arasaka Agent', 'Militech Soldier', 'Braindance Editor', 'Cyberpsycho'] },
      { name: 'Silent Cartographer (Halo)', roles: ['Master Chief', 'Cortana', 'UNSC Marine', 'ODST', 'Elite', 'Grunt', 'Hunter', 'Flood Infected', 'Pelican Pilot', 'Warthog Driver', 'Sniper', 'Medic', 'Covenant Spy', 'Monitor', 'Weapons Specialist'] },
      { name: 'Firelink Shrine (Dark Souls)', roles: ['Ashen One', 'Fire Keeper', 'Andre the Blacksmith', 'Crestfallen Knight', 'Onion Knight', 'Invader', 'Sunbro', 'Hollow', 'Merchant', 'Pyromancer', 'Cleric', 'Sorcerer', 'Undead', 'Lord of Cinder', 'Mysterious Pilgrim'] },
      { name: 'Sanctuary (Borderlands)', roles: ['Vault Hunter', 'Claptrap', 'Marcus', 'Moxxi', 'Lilith', 'Tannis', 'Ellie', 'Scooter', 'Psycho', 'Bandit', 'Gun Manufacturer Rep', 'Eridium Dealer', 'Bounty Board', 'New-U Station', 'Crimson Raider'] },
      { name: 'The Island (Fortnite)', roles: ['Default Skin', 'Sweat', 'Bot', 'Fishstick', 'Peely', 'Midas', 'IO Agent', 'The Seven Member', 'NPC', 'Bus Driver', 'Loot Llama', 'Storm Chaser', 'Zero Build Player', 'Creative Mode Builder', 'Battle Pass Grinder'] },
      { name: 'City 17 (Half-Life)', roles: ['Gordon Freeman', 'Alyx Vance', 'G-Man', 'Combine Soldier', 'Civil Protection', 'Citizen', 'Resistance Fighter', 'Dr. Kleiner', 'Barney', 'Headcrab Zombie', 'Vortigaunt', 'Strider', 'Dog (Robot)', 'Black Mesa Scientist', 'Breen'] }
    ],

    bollywood: [
      { name: 'DDLJ Train Platform', roles: ['Raj', 'Simran', 'Bauji', 'Simran\'s Mother', 'Train Conductor', 'Chai Wallah', 'Coolie', 'Traveling Family', 'Mustard Field Dancer', 'NRI Tourist', 'Ticket Checker', 'Station Master', 'Beggar', 'Platform Vendor', 'Last Minute Runner'] },
      { name: 'Bollywood Film Set', roles: ['Superstar Hero', 'Lead Heroine', 'Director', 'Choreographer', 'Item Song Dancer', 'Spot Boy', 'Makeup Artist', 'Stunt Double', 'Playback Singer', 'Music Director', 'Producer', 'Angry Father Actor', 'Comedian Sidekick', 'Villain', 'Junior Artist'] },
      { name: 'Big Fat Indian Wedding', roles: ['Bride', 'Groom', 'Pandit Ji', 'Wedding Planner', 'Drunk Uncle', 'Gossiping Aunty', 'Photographer', 'Dhol Player', 'Caterer', 'Baraat Dancer', 'Jealous Ex', 'Mehndi Artist', 'Crying Mother', 'NRI Cousin', 'Wedding Crasher'] },
      { name: '3 Idiots Engineering College', roles: ['Rancho', 'Farhan', 'Raju', 'Virus (Principal)', 'Pia', 'Chatur', 'Millimeter', 'Librarian', 'Hostel Warden', 'Ragging Senior', 'Stressed Student', 'Placement Cell Officer', 'Canteen Owner', 'Night Watchman', 'Joy Lobo'] },
      { name: 'Mumbai Local Train', roles: ['Office Worker', 'College Student', 'Chai Seller', 'Dabbawaala', 'Pickpocket', 'Vendor', 'First Class Passenger', 'Ladies Compartment Aunty', 'Hanging Off Door Guy', 'Newspaper Reader', 'Ear Cleaner', 'Sleeping Commuter', 'Ticket Checker', 'Platform Jumper', 'Love Confessor'] },
      { name: 'Karan Johar House Party', roles: ['KJo', 'Nepo Kid', 'A-List Star', 'Fashion Designer', 'Gossip Columnist', 'Wannabe Actor', 'Instagram Influencer', 'Bodyguard', 'Star Wife', 'PR Manager', 'Paparazzi', 'DJ', 'Bartender', 'Film Critic', 'Has-Been Actor'] },
      { name: 'IPL Cricket Stadium', roles: ['Batsman', 'Bowler', 'Team Owner', 'Cheerleader', 'Commentator', 'Umpire', 'Coach', 'Physio', 'Superfan', 'Drunk Spectator', 'Betting Bookie', 'Cameraman', 'Ground Staff', 'Team Mascot', 'Celebrity Guest'] },
      { name: 'Gangs of Wasseypur', roles: ['Sardar Khan', 'Faizal Khan', 'Ramadhir Singh', 'Definite', 'Mohsina', 'Perpendicular', 'Sultan', 'Corrupt Politician', 'Coal Mafia', 'Betel Nut Seller', 'Hired Assassin', 'Police Inspector', 'Arms Dealer', 'Informer', 'Rival Gang Member'] },
      { name: 'Goa Beach Party', roles: ['Gap Year Tourist', 'DJ', 'Shack Owner', 'Drug Dealer', 'Honeymoon Couple', 'Russian Tourist', 'Local Fisherman', 'Tattoo Artist', 'Yoga Instructor', 'Trance Dancer', 'Beach Photographer', 'Drunk Bachelor Party', 'Undercover Cop', 'Sunset Chaser', 'Scooter Renter'] },
      { name: 'Bigg Boss House', roles: ['Salman Khan', 'Controversial Contestant', 'Crybaby', 'Love Angle Partner', 'Kitchen Fighter', 'Task Winner', 'Nominated Contestant', 'Bigg Boss Voice', 'Camera Operator', 'Wildcard Entry', 'Evicted Contestant', 'Mastermind', 'Peacemaker', 'Confession Room Regular', 'Weekend Ka Vaar Victim'] },
      { name: 'Dilwale Dulhania Style Europe Trip', roles: ['Rich NRI Son', 'Strict Father\'s Daughter', 'Drunk Best Friend', 'Tour Group Aunty', 'Bus Driver', 'Swiss Hotel Manager', 'Guitar Playing Romantic', 'Disapproving Father', 'Cool Mother', 'Souvenir Shop Owner', 'Train Station Musician', 'Passport Loser', 'Love Letter Writer', 'Church Singer', 'Tulip Field Dancer'] },
      { name: 'Filmfare Awards', roles: ['Award Winner', 'Snubbed Actor', 'Awkward Presenter', 'Lifetime Achievement Veteran', 'Best Dressed', 'Worst Dressed', 'Crying Speech Giver', 'Teleprompter Reader', 'Red Carpet Host', 'Trophy Engraver', 'Seat Filler', 'Standing Ovation Starter', 'Backstage Manager', 'Paparazzi', 'Thank You Speech Forgetter'] },
      { name: 'Sacred Games Mumbai Underworld', roles: ['Gaitonde', 'Sartaj Singh', 'Bunty', 'Kukoo', 'Guruji', 'RAW Agent', 'Corrupt Cop', 'Gang Member', 'Bar Dancer', 'Informant', 'Hit Man', 'Slum Dweller', 'Political Fixer', 'Arms Smuggler', 'Journalist'] },
      { name: 'Hum Aapke Hain Koun Wedding House', roles: ['Prem', 'Nisha', 'Tuffy (Dog)', 'Rajesh', 'Pooja', 'Professor Father', 'Kachra Seth', 'Wedding Guest', 'Antakshari Singer', 'Cricket Match Player', 'Baby Shower Dancer', 'Puja Ceremony Pandit', 'Kitchen Aunty', 'Photo Album Looker', 'Staircase Accident Witness'] },
      { name: 'Zindagi Na Milegi Dobara Road Trip', roles: ['Arjun', 'Kabir', 'Imran', 'Laila', 'Natasha', 'Skydiving Instructor', 'Tomatina Fighter', 'Flamenco Dancer', 'Scuba Diving Guide', 'Bull Runner', 'Poetry Reader', 'Car Rental Guy', 'Spanish Local', 'Underwater Cameraman', 'Bachelor Party Planner'] }
    ]
  };
  // Get locations from selected pack or all packs for random
  let locations;
  if (locationPack === 'random' || !locationPacks[locationPack]) {
    locations = Object.values(locationPacks).flat();
  } else {
    locations = locationPacks[locationPack];
  }
  // Select random location
  const selectedLocation = locations[Math.floor(Math.random() * locations.length)];
  
  // Determine number of spies
  const spyCount = twoSpies ? 2 : 1;
  
  // Randomly select spies
  const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);
  const spies = shuffledPlayers.slice(0, spyCount).map(p => p.id);
  const spyNames = shuffledPlayers.slice(0, spyCount).map(p => p.name);
  
  // Assign roles to non-spy players
  const availableRoles = [...selectedLocation.roles].sort(() => Math.random() - 0.5);
  
  room.gameData = {
    location: selectedLocation.name,
    locationPack: locationPack,
    spies: spies,
    spyNames: spyNames,
    twoSpies: twoSpies,
    phase: 'role-reveal',
    timeRemaining: 480,
    votes: {},
    currentTurnIndex: 0,
    roleAssignments: {}
  };
  
  // Assign roles
  let roleIndex = 0;
  room.players.forEach(player => {
    const isSpy = spies.includes(player.id);
  
    room.gameData.roleAssignments[player.name] = {
      role: isSpy ? 'Spy' : (availableRoles[roleIndex % availableRoles.length] || 'Visitor'),
      location: isSpy ? null : selectedLocation.name,
      isSpy: isSpy
    };
  
    if (!isSpy) {
      roleIndex++;
    }
  });
  
  console.log(`Spyfall game initialized in room ${room.code}. Location: ${selectedLocation.name}, Spies: ${spyNames.join(', ')}`);
}

// Calculate voting results for Imposter game
function calculateImposterResults(room) {
  const voteCounts = {};
  
  // Count votes for each player
  Object.values(room.gameData.votes).forEach(votedPlayerId => {
    voteCounts[votedPlayerId] = (voteCounts[votedPlayerId] || 0) + 1;
  });
  
  // Find player with most votes
  let maxVotes = 0;
  let votedOutPlayerId = null;
  
  Object.entries(voteCounts).forEach(([playerId, votes]) => {
    if (votes > maxVotes) {
      maxVotes = votes;
      votedOutPlayerId = playerId;
    }
  });
  
  // Determine if imposter was caught
  const imposterPlayer = room.players.find(p => p.name === room.gameData.imposterName);
  const imposterCaught = votedOutPlayerId === (imposterPlayer ? imposterPlayer.id : room.gameData.imposterId);
  const votedOutPlayer = room.players.find(p => p.id === votedOutPlayerId);
  
  room.gameData.phase = 'results';
  room.gameData.voteCounts = voteCounts;
  room.gameData.votedOutPlayerId = votedOutPlayerId;
  room.gameData.imposterCaught = imposterCaught;
  
  // Send results to all players
  io.to(room.code).emit('game-results', {
    imposterCaught: imposterCaught,
    imposter: imposterPlayer,
    votedOut: votedOutPlayer,
    word: room.gameData.word,
    voteCounts: voteCounts
  });
}

// Calculate voting results for Spyfall game
function calculateSpyfallResults(room) {
  const voteCounts = {};
  
  Object.values(room.gameData.votes).forEach(votedPlayerId => {
    voteCounts[votedPlayerId] = (voteCounts[votedPlayerId] || 0) + 1;
  });
  
  let maxVotes = 0;
  let votedOutPlayerId = null;
  
  Object.entries(voteCounts).forEach(([playerId, votes]) => {
    if (votes > maxVotes) {
      maxVotes = votes;
      votedOutPlayerId = playerId;
    }
  });
  
  const spyCaught = room.gameData.spies.includes(votedOutPlayerId);
  const votedOutPlayer = room.players.find(p => p.id === votedOutPlayerId);
  
  room.gameData.voteCounts = voteCounts;
  room.gameData.votedOutPlayerId = votedOutPlayerId;
  
  if (spyCaught) {
    if (room.gameData.twoSpies && room.gameData.spies.length > 1) {
      room.gameData.spies = room.gameData.spies.filter(id => id !== votedOutPlayerId);
      
      if (room.gameData.spies.length === 0) {
        endSpyfallGame(room, false, `All spies caught! ${votedOutPlayer.name} was the last spy.`);
      } else {
        room.gameData.votes = {};
        room.gameData.phase = 'question';
        startSpyfallTimer(room);
        
        io.to(room.code).emit('spy-caught', {
          caughtSpy: votedOutPlayer,
          spiesRemaining: room.gameData.spies.length,
          message: `${votedOutPlayer.name} was a spy! But there's still another spy among you...`
        });
      }
    } else {
      endSpyfallGame(room, false, `${votedOutPlayer.name} was the spy! Players win!`);
    }
  } else {
    const spyNames = room.gameData.spyNames.join(' and ');
    endSpyfallGame(room, true, `${votedOutPlayer.name} was innocent! ${spyNames} ${room.gameData.twoSpies ? 'were' : 'was'} the spy!`);
  }
}

// ============================================
// SOCKET.IO CONNECTION HANDLER
// ============================================

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // CREATE ROOM (initial creation only)
  socket.on('create-room', (data) => {
    const { playerName, gameType, isPremium, cosmetics, userId } = data;
    
    // Always generate a new room code for initial creation
    const roomCode = generateRoomCode();
    
    console.log(`Creating room: ${roomCode} for player: ${playerName}, game: ${gameType}`);
    
    // Create new room
    const newRoom = {
      code: roomCode,
      gameType: gameType,
      hostId: socket.id,
      players: [{
        id: socket.id,
        name: playerName,
        isHost: true,
        isPremium: isPremium || false,
        cosmetics: cosmetics || null,
        userId: userId || null,
        joinedAt: new Date()
      }],
      gameState: 'waiting',
      createdAt: new Date()
    };
    
    rooms.set(roomCode, newRoom);
    players.set(socket.id, {
      roomCode: roomCode,
      playerName: playerName,
      isHost: true
    });
    
    // Join socket room
    socket.join(roomCode);
    
    // Send success response to creator with the room code
    socket.emit('room-created', {
      success: true,
      roomCode: roomCode,
      gameType: gameType,
      room: newRoom
    });
    
    console.log(`Room created: ${roomCode} by ${playerName} for game ${gameType}`);
  });

  // REJOIN ROOM (for page refreshes or reconnections)
  socket.on('rejoin-room', (data) => {
    const { roomCode, playerName, isPremium, cosmetics, userId } = data;
    
    console.log(`Player ${playerName} attempting to rejoin room: ${roomCode}`);
    
    const room = rooms.get(roomCode);
    if (!room) {
      console.log(`Room ${roomCode} not found for rejoin`);
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    // Find if player already exists in room
    const existingPlayer = room.players.find(p => p.name === playerName);
    
    if (existingPlayer) {
      // Cancel any pending disconnect timer for this player
      const oldId = existingPlayer.id;
      if (disconnectTimers.has(oldId)) {
        console.log(`Cancelling disconnect timer for ${playerName}`);
        clearTimeout(disconnectTimers.get(oldId));
        disconnectTimers.delete(oldId);
      }
      
      // Update socket ID for reconnection
      existingPlayer.id = socket.id;
      // Update existing player's socket and cosmetics
      existingPlayer.id = socket.id;
      existingPlayer.isPremium = isPremium || existingPlayer.isPremium;
      existingPlayer.cosmetics = cosmetics || existingPlayer.cosmetics;
      existingPlayer.userId = userId || existingPlayer.userId;
      
      // Update players map
      players.delete(oldId);
      players.set(socket.id, {
        roomCode: roomCode,
        playerName: playerName,
        isHost: existingPlayer.isHost
      });
      
      // Check if they were the host
      if (room.hostId === oldId) {
        room.hostId = socket.id;
        console.log(`Host ${playerName} reconnected with new socket ID`);
      }
    } else {
      // Player wasn't in room, add them
      room.players.push({
        id: socket.id,
        name: playerName,
        isHost: false,
        isPremium: isPremium || false,
        cosmetics: cosmetics || null,
        userId: userId || null,
        joinedAt: new Date()
      });
      
      players.set(socket.id, {
        roomCode: roomCode,
        playerName: playerName,
        isHost: false
      });
    }
    
    // Join socket room
    socket.join(roomCode);
    
    // Send room state to rejoining player
    socket.emit('room-joined', {
      success: true,
      roomCode: roomCode,
      gameType: room.gameType,
      room: room
    });
    
    // If game is active, send the player their role
    if (room.gameState === 'playing' && room.gameData && room.gameData.roleAssignments) {
      const playerRole = room.gameData.roleAssignments[playerName];
      if (playerRole) {
        console.log(`Sending role assignment to ${playerName}: ${playerRole.role}`);
        socket.emit('role-assigned', playerRole);
        
        // Handle game phase transitions based on game type
        if (room.gameType === 'imposter') {
          handleImposterPhaseTransition(room, socket, roomCode, playerName);
        } else if (room.gameType === 'spyfall') {
          handleSpyfallPhaseTransition(room, socket, roomCode, playerName);
        }
      }
    }
    
    // Notify others
    socket.to(roomCode).emit('player-joined', {
      player: room.players.find(p => p.id === socket.id),
      room: room
    });
    
    console.log(`Player ${playerName} rejoined room ${roomCode}`);
  });

  // GET ROOM STATE (for reconnections and host initial load)
  socket.on('get-room-state', (data) => {
    const { roomCode } = data;
    const room = rooms.get(roomCode);
    
    if (room) {
      socket.emit('room-state', {
        success: true,
        room: room
      });
    }
  });

  // JOIN ROOM
  socket.on('join-room', (data) => {
    const { roomCode, playerName, isPremium, cosmetics, userId } = data;
    
    console.log(`Player ${playerName} attempting to join room: ${roomCode}`);
    
    // Check if room exists
    const room = rooms.get(roomCode);
    if (!room) {
      console.log(`Room ${roomCode} not found`);
      socket.emit('join-error', { message: 'Room not found' });
      return;
    }
    
    // Check if name is already taken IN THIS SPECIFIC ROOM ONLY
    const nameExists = room.players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (nameExists) {
      console.log(`Name ${playerName} already taken in room ${roomCode}`);
      socket.emit('join-error', { message: 'Name already taken' });
      return;
    }
    
    // Check if room is full (max 15 players)
    if (room.players.length >= 15) {
      console.log(`Room ${roomCode} is full`);
      socket.emit('join-error', { message: 'Room is full' });
      return;
    }
    
    // Add player to room
    const newPlayer = {
      id: socket.id,
      name: playerName,
      isHost: false,
      isPremium: isPremium || false,
      cosmetics: cosmetics || null,
      userId: userId || null,
      joinedAt: new Date()
    };
    
    room.players.push(newPlayer);
    
    // Store player info
    players.set(socket.id, {
      roomCode: roomCode,
      playerName: playerName,
      isHost: false
    });
    
    // Join socket room
    socket.join(roomCode);
    
    // Notify player they joined successfully
    socket.emit('room-joined', {
      success: true,
      roomCode: roomCode,
      gameType: room.gameType,
      room: room
    });
    
    // Notify all other players in the room
    socket.to(roomCode).emit('player-joined', {
      player: newPlayer,
      room: room
    });
    
    console.log(`Player ${playerName} joined room ${roomCode}. Total players: ${room.players.length}`);
  });

  // KICK PLAYER
  socket.on('kick-player', (data) => {
    const { roomCode, playerId } = data;
    const room = rooms.get(roomCode);
    const kicker = players.get(socket.id);
    
    if (!room || !kicker) {
      socket.emit('error', { message: 'Invalid room or player' });
      return;
    }
    
    // Only host can kick
    if (!kicker.isHost) {
      socket.emit('error', { message: 'Only host can kick players' });
      return;
    }
    
    // Can't kick yourself
    if (playerId === socket.id) {
      socket.emit('error', { message: 'Cannot kick yourself' });
      return;
    }
    
    // Find and remove player
    const kickedPlayer = room.players.find(p => p.id === playerId);
    if (kickedPlayer) {
      room.players = room.players.filter(p => p.id !== playerId);
      players.delete(playerId);
      
      // Notify kicked player with specific message
      io.to(playerId).emit('kicked', {
        message: 'You have been kicked by the host'
      });
      
      // Disconnect the kicked player's socket
      const kickedSocket = io.sockets.sockets.get(playerId);
      if (kickedSocket) {
        kickedSocket.disconnect(true);
      }
      
      // Notify all remaining players
      io.to(roomCode).emit('player-kicked', {
        playerName: kickedPlayer.name,
        room: room
      });
      
      console.log(`Player ${kickedPlayer.name} kicked from room ${roomCode}`);
    }
  });

  // HOST RETURN TO LOBBY (force all players back to waiting room)
  socket.on('host-return-lobby', (data) => {
    const { roomCode } = data;
    const room = rooms.get(roomCode);
    const host = players.get(socket.id);
    
    if (!room || !host) {
      socket.emit('error', { message: 'Invalid room or player' });
      return;
    }
    
    // Only host can force return to lobby
    if (!host.isHost) {
      socket.emit('error', { message: 'Only host can return players to lobby' });
      return;
    }
    
    console.log(`Host returning all players to lobby in room ${roomCode}`);
    
    // Reset game state
    room.gameState = 'waiting';
    room.gameData = null;
    
    // Notify all players to return to lobby
    io.to(roomCode).emit('force-return-lobby', {
      message: 'Host has returned everyone to the lobby'
    });
    
    console.log(`Room ${roomCode} returned to lobby by host`);
  });

  // START GAME
  socket.on('start-game', (data) => {
    const { roomCode, category, twoSpies } = data;
    const room = rooms.get(roomCode);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    // Check if socket is the host
    const player = players.get(socket.id);
    if (!player || !player.isHost) {
      socket.emit('error', { message: 'Only host can start the game' });
      return;
    }
    
    // Check minimum players (3 for most games)
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
    } else if (room.gameType === 'codenames') {
      // Codenames starts with team selection
      console.log(`Codenames starting in room ${roomCode}`);
    }
    
    room.gameState = 'playing';
    
    // Send role assignments to each player
    if (room.gameType === 'spyfall') {
      room.players.forEach(p => {
        const roleData = room.gameData.roleAssignments[p.name];
        if (roleData) {
          io.to(p.id).emit('role-assigned', roleData);
        }
      });
      
      room.gameData.phaseTransitionScheduled = true;
      setTimeout(() => {
        if (room.gameData && room.gameData.phase === 'role-reveal') {
          startSpyfallQuestionPhase(room);
        }
      }, 5000);
    }

    // Notify all players to start
    io.to(roomCode).emit('game-started', {
      roomCode: roomCode,
      gameType: room.gameType
    });
    
    console.log(`Game started in room ${roomCode} with category: ${category || 'random'}, twoSpies: ${twoSpies || false}`);
  });

  // CALL VOTE (for Spyfall)
  socket.on('call-vote', (data) => {
    const { roomCode } = data;
    const room = rooms.get(roomCode);
    const player = players.get(socket.id);
    
    if (!room || !player || !room.gameData) {
      socket.emit('error', { message: 'Invalid room or game' });
      return;
    }
    
    if (room.gameData.phase !== 'question') {
      socket.emit('error', { message: 'Cannot call vote right now' });
      return;
    }
    
    if (gameTimers.has(roomCode)) {
      clearInterval(gameTimers.get(roomCode));
      gameTimers.delete(roomCode);
    }
    
    room.gameData.phase = 'voting';
    room.gameData.votes = {};
    room.gameData.voteCaller = player.playerName;
    
    io.to(roomCode).emit('vote-called', {
      caller: player.playerName
    });
    
    console.log(`Vote called by ${player.playerName} in room ${roomCode}`);
  });

  // SPY GUESS LOCATION (for Spyfall)
  socket.on('spy-guess', (data) => {
    const { roomCode, location } = data;
    const room = rooms.get(roomCode);
    const player = players.get(socket.id);
    
    if (!room || !player || !room.gameData) {
      socket.emit('error', { message: 'Invalid room or game' });
      return;
    }
    
    if (!room.gameData.spies.includes(socket.id)) {
      socket.emit('error', { message: 'Only spies can guess the location' });
      return;
    }
    
    const isCorrect = location.toLowerCase() === room.gameData.location.toLowerCase();
    
    if (isCorrect) {
      endSpyfallGame(room, true, `${player.playerName} correctly guessed the location: ${room.gameData.location}!`);
    } else {
      endSpyfallGame(room, false, `${player.playerName} guessed wrong! The location was ${room.gameData.location}. Players win!`);
    }
    
    console.log(`Spy ${player.playerName} guessed "${location}" (Correct: ${isCorrect}) in room ${roomCode}`);
  });
  // NEXT TURN (for Spyfall)
  socket.on('next-turn', (data) => {
    const { roomCode } = data;
    const room = rooms.get(roomCode);
    
    if (!room || !room.gameData) {
      socket.emit('error', { message: 'Invalid room or game' });
      return;
    }
    
    // Move to next turn
    room.gameData.currentTurnIndex = (room.gameData.currentTurnIndex + 1) % room.players.length;
    
    // Notify all players
    io.to(roomCode).emit('turn-changed', {
      currentPlayer: room.players[room.gameData.currentTurnIndex].name,
      turnIndex: room.gameData.currentTurnIndex
    });
  });

  // SUBMIT CLUE (for Imposter game)
  socket.on('submit-clue', (data) => {
    const { roomCode, clue } = data;
    const room = rooms.get(roomCode);
    const player = players.get(socket.id);
    
    if (!room || !player) {
      socket.emit('error', { message: 'Invalid room or player' });
      return;
    }
    
    // Check if player already submitted a clue
    const existingClue = room.gameData.clues.find(c => c.playerId === socket.id);
    if (existingClue) {
      socket.emit('error', { message: 'You already submitted a clue' });
      return;
    }
    
    // Add clue to game data
    room.gameData.clues.push({
      playerId: socket.id,
      playerName: player.playerName,
      clue: clue
    });
    
    // Notify all players about new clue
    io.to(roomCode).emit('clue-submitted', {
      playerName: player.playerName,
      clue: clue,
      totalClues: room.gameData.clues.length,
      totalPlayers: room.players.length
    });
    
    // If all players submitted clues, start voting phase
    if (room.gameData.clues.length === room.players.length) {
      room.gameData.phase = 'voting';
      room.gameData.votes = {}; // Reset votes
      room.gameData.skipVotes = []; // Reset skip votes
      io.to(roomCode).emit('voting-phase-start', {
        clues: room.gameData.clues,
        players: room.players,
        round: room.gameData.currentRound
      });
    }
  });

  // VOTE TO SKIP ROUND (for Imposter game)
  socket.on('vote-skip', (data) => {
    const { roomCode } = data;
    const room = rooms.get(roomCode);
    const player = players.get(socket.id);
    
    if (!room || !player) {
      socket.emit('error', { message: 'Invalid room or player' });
      return;
    }
    
    // Can only skip in rounds 1 and 2
    if (room.gameData.currentRound >= 3) {
      socket.emit('error', { message: 'Cannot skip final round' });
      return;
    }
    
    // Check if player already voted to skip
    if (room.gameData.skipVotes.includes(socket.id)) {
      socket.emit('error', { message: 'You already voted to skip' });
      return;
    }
    
    // Add skip vote
    room.gameData.skipVotes.push(socket.id);
    
    const skipVoteCount = room.gameData.skipVotes.length;
    const totalPlayers = room.players.length;
    const majority = Math.ceil(totalPlayers / 2);
    
    console.log(`Skip vote in room ${roomCode}: ${skipVoteCount}/${totalPlayers}, majority needed: ${majority}`);
    
    // Notify all players about skip vote count
    io.to(roomCode).emit('skip-vote-counted', {
      skipVotes: skipVoteCount,
      totalPlayers: totalPlayers
    });
    
    // Check if majority voted to skip (immediate check)
    if (skipVoteCount >= majority) {
      console.log(`✅ MAJORITY REACHED for skip! ${skipVoteCount} >= ${majority}`);
      
      // Skip to next round
      room.gameData.currentRound++;
      room.gameData.phase = 'role-reveal';
      room.gameData.clues = []; // Reset clues
      room.gameData.votes = {};
      room.gameData.skipVotes = [];
      
      console.log(`Round skipped in room ${roomCode}, starting round ${room.gameData.currentRound}`);
      
      // Notify players
      io.to(roomCode).emit('round-skipped', {
        round: room.gameData.currentRound
      });
      
      // Start next round after brief delay
      setTimeout(() => {
        room.gameData.phase = 'clue-giving';
        io.to(roomCode).emit('clue-phase-start', {
          timeLimit: 60,
          round: room.gameData.currentRound
        });
      }, 3000);
    } else {
      console.log(`⏳ Waiting for more skip votes: ${skipVoteCount}/${majority} (need ${majority - skipVoteCount} more)`);
    }
  });

  // SUBMIT VOTE (for Imposter and Spyfall games)
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
    let totalPlayers;
    
    // Determine total players based on game type
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
    
    console.log(`Vote in room ${roomCode}: ${totalVotes}/${totalPlayers}, majority needed: ${majority}`);
    
    // Check if we have majority votes for any single player
    const voteCounts = {};
    Object.values(room.gameData.votes).forEach(votedId => {
      voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
    });
    
    // Find if any player has majority
    const maxVotes = Math.max(...Object.values(voteCounts));
    const hasConsensus = maxVotes >= majority;
    
    console.log(`Vote counts:`, voteCounts, `Max votes: ${maxVotes}, Has consensus: ${hasConsensus}`);
    
    // End voting if someone has majority OR if all players voted
    if (hasConsensus || totalVotes === totalPlayers) {
      if (hasConsensus && totalVotes < totalPlayers) {
        console.log(`✅ MAJORITY REACHED! Player has ${maxVotes} votes (need ${majority}), ending voting early`);
        io.to(roomCode).emit('voting-ended-early', {
          message: 'Someone has majority votes - ending voting early'
        });
      }
      
      console.log(`Ending voting in room ${roomCode}`);
      
      // Calculate results based on game type
      if (room.gameType === 'imposter') {
        calculateImposterResults(room);
      } else if (room.gameType === 'spyfall') {
        calculateSpyfallResults(room);
      } else if (room.gameType === 'werewolf') {
        processWerewolfVotingResults(room);
      }
    }
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
    room.gameData.answers[player.playerName] = answer;
    
    console.log(`${player.playerName} submitted answer: ${answer}`);
    
    // Confirm submission
    socket.emit('answer-submitted');
    
    // Check if all players have answered
    if (Object.keys(room.gameData.answers).length === room.players.length) {
      calculateHerdResults(room);
    }
  });
  // ============================================
  // CODENAMES SOCKET HANDLERS
  // ============================================

  // Join a team
  socket.on('codenames-join-team', (data) => {
    const { roomCode, team, role } = data;
    const room = rooms.get(roomCode);
    
    if (!room) return socket.emit('error', { message: 'Room not found' });
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return socket.emit('error', { message: 'Player not in room' });

    // Create teams structure if needed
    if (!room.codenamesTeams) {
      room.codenamesTeams = {
        red: { spymaster: null, operatives: [] },
        blue: { spymaster: null, operatives: [] }
      };
    }

    // Remove player from any existing team
    ['red', 'blue'].forEach(t => {
      if (room.codenamesTeams[t].spymaster?.id === socket.id) {
        room.codenamesTeams[t].spymaster = null;
      }
      room.codenamesTeams[t].operatives = 
        room.codenamesTeams[t].operatives.filter(p => p.id !== socket.id);
    });

    // Add to new team/role
    if (role === 'spymaster') {
      if (room.codenamesTeams[team].spymaster) {
        return socket.emit('error', { message: 'Spymaster slot taken' });
      }
      room.codenamesTeams[team].spymaster = player;
    } else {
      room.codenamesTeams[team].operatives.push(player);
    }

    io.to(roomCode).emit('team-updated', { room });
  });

  // Start game
  socket.on('codenames-start-game', (data) => {
    const { roomCode } = data;
    const room = rooms.get(roomCode);
    
    if (!room) return socket.emit('error', { message: 'Room not found' });
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player?.isHost) return socket.emit('error', { message: 'Only host can start' });

    const teams = room.codenamesTeams;
    if (!teams.red.spymaster || !teams.blue.spymaster ||
        teams.red.operatives.length === 0 || teams.blue.operatives.length === 0) {
      return socket.emit('error', { message: 'Need both spymasters + 1 operative each' });
    }

    room.codenamesState = initializeCodenamesGame(room);
    room.status = 'playing';

    io.to(roomCode).emit('codenames-started', { gameState: room.codenamesState });
  });

  // Give clue (spymaster)
  socket.on('codenames-give-clue', (data) => {
    const { roomCode, word, number } = data;
    const room = rooms.get(roomCode);
    
    if (!room?.codenamesState) return socket.emit('error', { message: 'Game not found' });

    const state = room.codenamesState;
    const teams = room.codenamesTeams;
    const currentTeam = teams[state.currentTeam];
    
    if (!currentTeam.spymaster || currentTeam.spymaster.id !== socket.id) {
      return socket.emit('error', { message: 'Not your turn' });
    }

    state.currentClue = { word: word.toUpperCase(), number };
    state.phase = 'guessing';

    io.to(roomCode).emit('codenames-clue-given', { 
      clue: state.currentClue,
      gameState: state
    });
  });

  // Select word (operative)
  socket.on('codenames-select-word', (data) => {
    const { roomCode, wordIndex } = data;
    const room = rooms.get(roomCode);
    
    if (!room?.codenamesState) return socket.emit('error', { message: 'Game not found' });

    const state = room.codenamesState;
    const teams = room.codenamesTeams;
    const currentTeam = teams[state.currentTeam];
    const isOperative = currentTeam.operatives.some(p => p.id === socket.id);

    if (!isOperative) return socket.emit('error', { message: 'Not your turn' });
    if (!state.currentClue) return socket.emit('error', { message: 'Wait for clue' });

    const word = state.words[wordIndex];
    if (word.revealed) return socket.emit('error', { message: 'Already revealed' });

    // Reveal word
    word.revealed = true;

    // Check game over
    const assassinRevealed = word.color === 'assassin';
    const redRemaining = state.words.filter(w => w.color === 'red' && !w.revealed).length;
    const blueRemaining = state.words.filter(w => w.color === 'blue' && !w.revealed).length;

    if (assassinRevealed) {
      state.phase = 'game_over';
      state.winner = state.currentTeam === 'red' ? 'blue' : 'red';
      state.gameOverReason = 'assassin';
    } else if (redRemaining === 0) {
      state.phase = 'game_over';
      state.winner = 'red';
      state.gameOverReason = 'all_words';
    } else if (blueRemaining === 0) {
      state.phase = 'game_over';
      state.winner = 'blue';
      state.gameOverReason = 'all_words';
    } else if (word.color !== state.currentTeam) {
      // Wrong word - end turn
      state.currentTeam = state.currentTeam === 'red' ? 'blue' : 'red';
      state.currentClue = null;
      state.phase = 'clue_giving';
    }

    io.to(roomCode).emit('codenames-word-revealed', {
      wordIndex,
      color: word.color,
      gameState: state
    });

    if (state.phase === 'clue_giving') {
      io.to(roomCode).emit('codenames-turn-ended', { gameState: state });
    }
  });

  // End turn
  socket.on('codenames-end-turn', (data) => {
    const { roomCode } = data;
    const room = rooms.get(roomCode);
    
    if (!room?.codenamesState) return socket.emit('error', { message: 'Game not found' });

    const state = room.codenamesState;
    const teams = room.codenamesTeams;
    const currentTeam = teams[state.currentTeam];
    const isOperative = currentTeam.operatives.some(p => p.id === socket.id);

    if (!isOperative) return socket.emit('error', { message: 'Not your turn' });

    state.currentTeam = state.currentTeam === 'red' ? 'blue' : 'red';
    state.currentClue = null;
    state.phase = 'clue_giving';

    io.to(roomCode).emit('codenames-turn-ended', { gameState: state });
  });
  // WEREWOLF - NIGHT ACTION
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

  // DISCONNECT
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    const player = players.get(socket.id);
    if (player) {
      const room = rooms.get(player.roomCode);
      if (room) {
        // Check if disconnecting player is the host
        if (player.isHost) {
          console.log(`Host disconnected from room ${player.roomCode}, waiting 10s before cleanup...`);
          
          // Set a timer to delete the room after 10 seconds
          // If the host reconnects within 10 seconds, this timer will be cancelled
          const timer = setTimeout(() => {
            console.log(`Host did not reconnect, closing room ${player.roomCode}`);
            
            const currentRoom = rooms.get(player.roomCode);
            if (currentRoom) {
              // Notify all other players that host left
              io.to(player.roomCode).emit('host-left', {
                message: 'The host has left. Game disconnected.'
              });
              
              // Remove all players from the room
              currentRoom.players.forEach(p => {
                players.delete(p.id);
                // Disconnect their sockets
                const playerSocket = io.sockets.sockets.get(p.id);
                if (playerSocket) {
                  playerSocket.leave(player.roomCode);
                  playerSocket.disconnect(true);
                }
              });
              
              // Delete the room
              rooms.delete(player.roomCode);
              console.log(`Room ${player.roomCode} deleted (host left)`);
            }
            
            disconnectTimers.delete(socket.id);
          }, 10000); // 10 second grace period
          
          disconnectTimers.set(socket.id, timer);
        } else {
          // Regular player disconnected - also give them a grace period
          console.log(`Player ${player.playerName} disconnected, waiting 10s before cleanup...`);
          
          const timer = setTimeout(() => {
            console.log(`Player ${player.playerName} did not reconnect, removing from room`);
            
            const currentRoom = rooms.get(player.roomCode);
            if (currentRoom) {
              // Remove player from room
              currentRoom.players = currentRoom.players.filter(p => p.id !== socket.id);
              
              // If room is now empty, delete it
              if (currentRoom.players.length === 0) {
                rooms.delete(player.roomCode);
                console.log(`Room ${player.roomCode} deleted (empty)`);
              } else {
                // Notify remaining players
                io.to(player.roomCode).emit('player-disconnected', {
                  playerName: player.playerName,
                  room: currentRoom
                });
              }
            }
            
            players.delete(socket.id);
            disconnectTimers.delete(socket.id);
          }, 10000); // 10 second grace period
          
          disconnectTimers.set(socket.id, timer);
        }
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
