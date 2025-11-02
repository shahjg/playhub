require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS configuration for frontend
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

console.log('Frontend URL:', process.env.FRONTEND_URL);

// In-memory storage (replace with database later)
const rooms = new Map(); // roomCode -> room data
const players = new Map(); // socketId -> player data
const disconnectTimers = new Map(); // socketId -> timeout for delayed cleanup

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

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // CREATE ROOM (initial creation only)
  socket.on('create-room', (data) => {
    const { playerName, gameType } = data;
    
    // Always generate a new room code for initial creation
    const roomCode = generateRoomCode();
    
    console.log(`Creating room: ${roomCode} for player: ${playerName}`);
    
    // Create new room
    const newRoom = {
      code: roomCode,
      gameType: gameType,
      hostId: socket.id,
      players: [{
        id: socket.id,
        name: playerName,
        isHost: true,
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
      room: newRoom
    });
    
    console.log(`Room created: ${roomCode} by ${playerName}`);
  });

  // REJOIN ROOM (for page refreshes or reconnections)
  socket.on('rejoin-room', (data) => {
    const { roomCode, playerName } = data;
    
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
    const { roomCode, playerName } = data;
    
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

  // START GAME
  socket.on('start-game', (data) => {
    const { roomCode, category } = data;
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
      initSpyfallGame(room, category || 'random');
    }
    // Add other game types here
    
    room.gameState = 'playing';
    
    // Notify all players to start
    io.to(roomCode).emit('game-started', {
      roomCode: roomCode,
      gameType: room.gameType
    });
    
    console.log(`Game started in room ${roomCode} with category: ${category || 'random'}`);
  });

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

  // Helper function to handle Spyfall phase transitions
  function handleSpyfallPhaseTransition(room, socket, roomCode, playerName) {
    if (room.gameData.phase === 'role-reveal') {
      if (!room.gameData.phaseTransitionScheduled) {
        room.gameData.phaseTransitionScheduled = true;
        console.log('Scheduling question phase start in 5 seconds...');
        setTimeout(() => {
          if (room.gameData.phase === 'role-reveal') {
            room.gameData.phase = 'question';
            io.to(roomCode).emit('question-phase-start', {
              timeLimit: 480 // 8 minutes
            });
            // Send first turn
            io.to(roomCode).emit('turn-changed', {
              currentPlayer: room.players[0].name,
              turnIndex: 0
            });
            console.log(`Question phase started in room ${roomCode}`);
          }
        }, 5000);
      }
    } else if (room.gameData.phase === 'question') {
      socket.emit('question-phase-start', {
        timeLimit: 480
      });
      socket.emit('turn-changed', {
        currentPlayer: room.players[room.gameData.currentTurnIndex].name,
        turnIndex: room.gameData.currentTurnIndex
      });
    } else if (room.gameData.phase === 'voting') {
      socket.emit('voting-phase-start', {
        players: room.players
      });
      socket.emit('vote-counted', {
        totalVotes: Object.keys(room.gameData.votes).length,
        totalPlayers: room.players.length
      });
    } else if (room.gameData.phase === 'results') {
      const spyCaught = room.gameData.votedOutPlayerId === room.gameData.spyId;
      const spyPlayer = room.players.find(p => p.name === room.gameData.spyName);
      const votedOutPlayer = room.players.find(p => p.id === room.gameData.votedOutPlayerId);
      
      socket.emit('game-results', {
        spyCaught: spyCaught,
        spy: spyPlayer,
        votedOut: votedOutPlayer,
        location: room.gameData.location,
        voteCounts: room.gameData.voteCounts || {}
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
  function initSpyfallGame(room, locationPack = 'classic') {
    // Location packs with roles
    const locationPacks = {
      classic: [
        { name: 'Airport', roles: ['First Class Passenger', 'Air Marshal', 'Mechanic', 'Flight Attendant', 'Co-Pilot', 'Captain', 'Tourist', 'Security Guard'] },
        { name: 'Bank', roles: ['Armored Car Driver', 'Manager', 'Consultant', 'Customer', 'Robber', 'Security Guard', 'Teller', 'Janitor'] },
        { name: 'Beach', roles: ['Beach Photographer', 'Ice Cream Man', 'Lifeguard', 'Thief', 'Beach Goer', 'Surfer', 'Kite Surfer', 'Beach Volleyball Player'] },
        { name: 'Casino', roles: ['Bartender', 'Head Security', 'Bouncer', 'Manager', 'Hustler', 'Dealer', 'Gambler', 'Waitress'] },
        { name: 'Cathedral', roles: ['Priest', 'Beggar', 'Sinner', 'Tourist', 'Sponsor', 'Choir Singer', 'Parishioner', 'Bishop'] },
        { name: 'Circus', roles: ['Acrobat', 'Animal Trainer', 'Magician', 'Fire Eater', 'Clown', 'Juggler', 'Visitor', 'Ticket Seller'] },
        { name: 'Hospital', roles: ['Nurse', 'Doctor', 'Anesthesiologist', 'Intern', 'Patient', 'Therapist', 'Surgeon', 'Pharmacist'] },
        { name: 'Hotel', roles: ['Doorman', 'Security Guard', 'Manager', 'Housekeeper', 'Customer', 'Bartender', 'Bellman', 'Chef'] },
        { name: 'Military Base', roles: ['Deserter', 'Colonel', 'Medic', 'Soldier', 'Sniper', 'Officer', 'Tank Engineer', 'Cook'] },
        { name: 'Movie Studio', roles: ['Stunt Man', 'Sound Engineer', 'Camera Man', 'Director', 'Costume Artist', 'Actor', 'Producer', 'Makeup Artist'] },
        { name: 'Ocean Liner', roles: ['Rich Passenger', 'Cook', 'Captain', 'Bartender', 'Musician', 'Waiter', 'Mechanic', 'Sailor'] },
        { name: 'Passenger Train', roles: ['Mechanic', 'Border Patrol', 'Train Attendant', 'Passenger', 'Restaurant Chef', 'Engineer', 'Stoker', 'Conductor'] },
        { name: 'Pirate Ship', roles: ['Cook', 'Sailor', 'Slave', 'Cannoneer', 'Bound Prisoner', 'Cabin Boy', 'Brave Captain', 'Surgeon'] },
        { name: 'Polar Station', roles: ['Medic', 'Geologist', 'Expedition Leader', 'Biologist', 'Radioman', 'Hydrologist', 'Meteorologist', 'Cook'] },
        { name: 'Police Station', roles: ['Detective', 'Lawyer', 'Journalist', 'Criminalist', 'Archivist', 'Patrol Officer', 'Criminal', 'Chief'] },
        { name: 'Restaurant', roles: ['Musician', 'Customer', 'Bouncer', 'Hostess', 'Head Chef', 'Food Critic', 'Waiter', 'Bartender'] },
        { name: 'School', roles: ['Gym Teacher', 'Student', 'Principal', 'Security Guard', 'Janitor', 'Cafeteria Lady', 'Maintenance Man', 'Teacher'] },
        { name: 'Space Station', roles: ['Engineer', 'Alien', 'Space Tourist', 'Pilot', 'Commander', 'Scientist', 'Doctor', 'Astronaut'] },
        { name: 'Submarine', roles: ['Cook', 'Commander', 'Sonar Technician', 'Electronics Technician', 'Sailor', 'Radioman', 'Navigator', 'Mechanic'] },
        { name: 'Supermarket', roles: ['Customer', 'Cashier', 'Butcher', 'Janitor', 'Security Guard', 'Food Sample Demonstrator', 'Shelf Stocker', 'Manager'] },
        { name: 'Theater', roles: ['Coat Check Lady', 'Prompter', 'Cashier', 'Director', 'Actor', 'Crew Man', 'Customer', 'Stage Hand'] },
        { name: 'University', roles: ['Graduate Student', 'Professor', 'Dean', 'Psychologist', 'Maintenance Man', 'Student', 'Janitor', 'Researcher'] },
        { name: 'Amusement Park', roles: ['Ride Operator', 'Parent', 'Food Vendor', 'Cashier', 'Happy Child', 'Annoying Child', 'Teenager', 'Security Guard'] },
        { name: 'Art Museum', roles: ['Ticket Seller', 'Student', 'Visitor', 'Teacher', 'Security Guard', 'Painter', 'Art Collector', 'Curator'] },
        { name: 'Embassy', roles: ['Security Guard', 'Secretary', 'Ambassador', 'Government Official', 'Tourist', 'Refugee', 'Diplomat', 'Clerk'] }
      ],
      modern: [
        { name: 'Coffee Shop', roles: ['Barista', 'Regular Customer', 'Wi-Fi Freeloader', 'Student', 'Manager', 'Delivery Person', 'Freelancer', 'Tourist'] },
        { name: 'Gym', roles: ['Personal Trainer', 'Bodybuilder', 'Yoga Instructor', 'Newbie', 'Receptionist', 'Cleaner', 'Athlete', 'Influencer'] },
        { name: 'Shopping Mall', roles: ['Security Guard', 'Salesperson', 'Shopper', 'Manager', 'Janitor', 'Food Court Worker', 'Lost Child', 'Mystery Shopper'] },
        { name: 'Tech Startup', roles: ['CEO', 'Developer', 'Designer', 'Intern', 'Investor', 'Marketing Manager', 'Salesperson', 'IT Support'] },
        { name: 'Spa', roles: ['Masseuse', 'Customer', 'Receptionist', 'Beautician', 'Manager', 'Cleaner', 'VIP Customer', 'Aromatherapist'] }
      ]
    };

    // Get locations from selected pack
    let locations;
    if (locationPack === 'random' || !locationPacks[locationPack]) {
      locations = [...locationPacks.classic, ...locationPacks.modern];
    } else {
      locations = locationPacks[locationPack];
    }

    // Pick random location
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Randomly select spy
    const spyIndex = Math.floor(Math.random() * room.players.length);
    const spyId = room.players[spyIndex].id;
    
    // Shuffle roles
    const shuffledRoles = [...location.roles].sort(() => Math.random() - 0.5);
    
    // Store game data with role assignments
    room.gameData = {
      location: location.name,
      locationPack: locationPack,
      spyId: spyId,
      spyName: room.players[spyIndex].name,
      votes: {},
      currentTurnIndex: 0,
      phase: 'role-reveal', // phases: role-reveal, question, voting, results
      roleAssignments: {} // Store roles by player name
    };
    
    // Store role assignments by player name
    room.players.forEach((player, index) => {
      const isSpy = index === spyIndex;
      room.gameData.roleAssignments[player.name] = {
        role: isSpy ? 'spy' : 'player',
        location: isSpy ? null : location.name,
        specificRole: isSpy ? 'Spy' : (shuffledRoles[index] || 'Tourist'),
        isSpy: isSpy
      };
    });
    
    console.log(`Spyfall game initialized in room ${room.code}. Location: ${location.name}, Spy: ${room.gameData.spyName}`);
  }

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
    const totalPlayers = room.players.length;
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
      }
    }
  });

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
    
    // Determine if spy was caught
    const spyPlayer = room.players.find(p => p.name === room.gameData.spyName);
    const spyCaught = votedOutPlayerId === (spyPlayer ? spyPlayer.id : room.gameData.spyId);
    const votedOutPlayer = room.players.find(p => p.id === votedOutPlayerId);
    
    room.gameData.phase = 'results';
    room.gameData.voteCounts = voteCounts;
    room.gameData.votedOutPlayerId = votedOutPlayerId;
    room.gameData.spyCaught = spyCaught;
    
    // Send results to all players
    io.to(room.code).emit('game-results', {
      spyCaught: spyCaught,
      spy: spyPlayer,
      votedOut: votedOutPlayer,
      location: room.gameData.location,
      voteCounts: voteCounts
    });
  }

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
