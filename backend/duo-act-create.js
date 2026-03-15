// ============================================
// DUO ACT & CREATE GAMES — Server Module
// Charades, Story Builder, Kiss Marry Kill,
// Finish My Sentence, Draw & Guess,
// Movie Pitch, Roast Me, Hot Take Battle
// ============================================

const actRooms = new Map();

function generateActCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'A';
  for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  if (actRooms.has(code)) return generateActCode();
  return code;
}

function initActCreateHandlers(io, socket) {

  // === CREATE ROOM ===
  socket.on('act-create', (data) => {
    const { gameType, playerName, pack, intensity } = data;
    if (!gameType || !playerName) return socket.emit('act-error', { message: 'Missing data' });
    const code = generateActCode();
    const items = getActItems(gameType, pack || 'movies', intensity || 'clean');
    const room = {
      code, gameType, pack: pack || 'movies', intensity: intensity || 'clean',
      players: [{ id: socket.id, name: playerName, num: 1 }],
      items, currentIndex: 0, scores: {}, round: 1, phase: 'waiting',
      storyLines: [], pitches: {}, roasts: [], hotTakes: {},
      drawingData: null, currentDrawer: null, currentWord: null,
      timerSetting: data.timer || 60, started: false
    };
    room.scores[playerName] = 0;
    actRooms.set(code, room);
    socket.join(code);
    socket.actRoom = code;
    socket.actName = playerName;
    socket.emit('act-created', { code, playerName, playerNum: 1 });
  });

  // === JOIN ROOM ===
  socket.on('act-join', (data) => {
    const { code, playerName } = data;
    if (!code || !playerName) return socket.emit('act-error', { message: 'Missing data' });
    const room = actRooms.get(code.toUpperCase());
    if (!room) return socket.emit('act-error', { message: 'Room not found' });
    if (room.players.length >= 2) {
      const existing = room.players.find(p => p.name === playerName);
      if (existing) {
        existing.id = socket.id;
        socket.join(room.code); socket.actRoom = room.code; socket.actName = playerName;
        socket.emit('act-joined', { code: room.code, gameType: room.gameType, pack: room.pack, intensity: room.intensity, playerNum: existing.num, players: room.players.map(p => p.name), started: room.started, round: room.round, total: room.items.length, scores: room.scores });
        return;
      }
      return socket.emit('act-error', { message: 'Room is full' });
    }
    room.players.push({ id: socket.id, name: playerName, num: 2 });
    room.scores[playerName] = 0;
    socket.join(room.code); socket.actRoom = room.code; socket.actName = playerName;
    socket.emit('act-joined', { code: room.code, gameType: room.gameType, pack: room.pack, intensity: room.intensity, playerNum: 2, players: room.players.map(p => p.name), started: false, total: room.items.length, scores: room.scores });
    io.to(room.code).emit('act-player-joined', { players: room.players.map(p => p.name), playerCount: room.players.length });
  });

  // === START ===
  socket.on('act-start', (data) => {
    const room = actRooms.get(data.code);
    if (!room || room.started) return;
    room.started = true; room.currentIndex = 0; room.round = 1;
    const item = room.items[0];
    const actorIdx = 0;
    room.currentDrawer = room.players[actorIdx]?.name;
    io.to(room.code).emit('act-round', { index: 0, item, total: room.items.length, round: room.round, scores: room.scores, actor: room.currentDrawer, players: room.players.map(p => p.name) });
  });

  // === SCORE (charades correct, draw & guess correct, etc) ===
  socket.on('act-score', (data) => {
    const room = actRooms.get(data.code);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    const who = data.player || player.name;
    room.scores[who] = (room.scores[who] || 0) + (data.points || 1);
    io.to(room.code).emit('act-score-update', { scores: room.scores, player: who, points: data.points || 1 });
  });

  // === NEXT ===
  socket.on('act-next', (data) => {
    const room = actRooms.get(data.code);
    if (!room || !room.started) return;
    room.currentIndex++;
    room.round++;
    if (room.currentIndex >= room.items.length) {
      io.to(room.code).emit('act-end', { scores: room.scores, total: room.items.length, storyLines: room.storyLines, pitches: room.pitches });
      return;
    }
    const actorIdx = room.round % 2;
    room.currentDrawer = room.players[Math.min(actorIdx, room.players.length - 1)]?.name;
    io.to(room.code).emit('act-round', { index: room.currentIndex, item: room.items[room.currentIndex], total: room.items.length, round: room.round, scores: room.scores, actor: room.currentDrawer, players: room.players.map(p => p.name) });
  });

  // === SKIP ===
  socket.on('act-skip', (data) => {
    const room = actRooms.get(data.code);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (data.penalty && player) room.scores[player.name] = Math.max(0, (room.scores[player.name] || 0) - 1);
    io.to(room.code).emit('act-skipped', { scores: room.scores });
    // Auto-advance
    socket.emit('act-next', { code: data.code });
  });

  // === STORY LINE (story builder) ===
  socket.on('act-story-line', (data) => {
    const room = actRooms.get(data.code);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    room.storyLines.push({ player: player.name, text: data.text });
    io.to(room.code).emit('act-story-update', { storyLines: room.storyLines });
  });

  // === SUBMIT (finish my sentence, movie pitch, hot take, roast) ===
  socket.on('act-submit', (data) => {
    const room = actRooms.get(data.code);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    if (!room.submissions) room.submissions = {};
    room.submissions[player.name] = data.content;
    socket.to(room.code).emit('act-partner-submitted', { playerName: player.name });
    // If both submitted, reveal
    if (Object.keys(room.submissions).length >= room.players.length) {
      io.to(room.code).emit('act-reveal', { submissions: room.submissions, item: room.items[room.currentIndex] });
      room.submissions = {};
    }
  });

  // === RATE (movie pitch, roast) ===
  socket.on('act-rate', (data) => {
    const room = actRooms.get(data.code);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    io.to(room.code).emit('act-rating', { from: player.name, to: data.target, rating: data.rating, comment: data.comment });
  });

  // === DRAW (draw & guess - canvas data) ===
  socket.on('act-draw', (data) => {
    const room = actRooms.get(data.code);
    if (!room) return;
    socket.to(room.code).emit('act-draw-data', data.drawData);
  });

  // === GUESS (draw & guess) ===
  socket.on('act-guess', (data) => {
    const room = actRooms.get(data.code);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    const correct = data.guess.toLowerCase().trim() === (room.items[room.currentIndex] || '').toLowerCase().trim();
    if (correct) {
      room.scores[player.name] = (room.scores[player.name] || 0) + 1;
      room.scores[room.currentDrawer] = (room.scores[room.currentDrawer] || 0) + 1;
    }
    io.to(room.code).emit('act-guess-result', { guess: data.guess, correct, guesser: player.name, scores: room.scores, answer: room.items[room.currentIndex] });
  });

  // === TOO FAR (roast me) ===
  socket.on('act-too-far', (data) => {
    const room = actRooms.get(data.code);
    if (!room) return;
    io.to(room.code).emit('act-flagged', { message: 'That was too far! Moving on...' });
  });

  // === DISCONNECT ===
  socket.on('disconnect', () => {
    if (socket.actRoom) {
      const room = actRooms.get(socket.actRoom);
      if (room) {
        io.to(room.code).emit('act-player-left', { playerName: socket.actName });
        setTimeout(() => {
          const r = actRooms.get(socket.actRoom);
          if (r && r.players.every(p => !io.sockets.sockets.get(p.id))) actRooms.delete(socket.actRoom);
        }, 60000);
      }
    }
  });
}

// ============================================
// ITEM BANKS
// ============================================

function getActItems(gameType, pack, intensity) {
  const bank = ACT_BANKS[gameType];
  if (!bank) return [];
  const packData = bank[pack] || bank[Object.keys(bank)[0]];
  if (!packData) return [];
  const items = (packData[intensity] && packData[intensity].length > 0) ? packData[intensity] : packData['clean'] || [];
  return [...items].sort(() => Math.random() - 0.5);
}

// ============================================
// CHARADES WORD BANK
// ============================================
const CHARADES_BANK = {
  movies: { clean: ['Titanic','The Lion King','Jurassic Park','Harry Potter','Frozen','Finding Nemo','The Avengers','Star Wars','Shrek','Toy Story','Spider-Man','Batman','Jaws','Rocky','The Matrix','E.T.','Aladdin','Moana','Coco','Up','Inside Out','Ratatouille','Incredibles','Mulan','Tarzan','Hercules','Beauty and the Beast','Cars','Monsters Inc','Wall-E'] },
  tv_shows: { clean: ['Friends','The Office','Breaking Bad','Stranger Things','Game of Thrones','Squid Game','Wednesday','The Bear','Bridgerton','Ted Lasso','Spongebob','Rick and Morty','The Simpsons','Brooklyn Nine Nine','Greys Anatomy','Euphoria','The Boys','Mandalorian','Yellowstone','Succession','Peaky Blinders','Ozark','Narcos','The Crown','Avatar','South Park','Family Guy','How I Met Your Mother','Big Bang Theory','Suits'] },
  animals: { clean: ['Elephant','Penguin','Kangaroo','Giraffe','Monkey','Snake','Eagle','Dolphin','Octopus','Butterfly','Bear','Lion','Shark','Gorilla','Flamingo','Chameleon','Sloth','Peacock','Crab','Jellyfish','Koala','Panda','Cheetah','Hippo','Rhino','Frog','Parrot','Owl','Horse','Turtle'] },
  celebrities: { clean: ['Taylor Swift','Drake','The Rock','Beyonce','Elon Musk','Oprah','Michael Jordan','Lady Gaga','Cristiano Ronaldo','Kim Kardashian','Will Smith','Tom Hanks','Ariana Grande','Bad Bunny','Billie Eilish','Ed Sheeran','Rihanna','Lionel Messi','Zendaya','Ryan Reynolds','Adele','Bruno Mars','Post Malone','Harry Styles','Selena Gomez','Jennifer Lopez','Lebron James','Travis Scott','Doja Cat','SZA'] },
  video_games: { clean: ['Minecraft','Fortnite','Mario Kart','Pac-Man','Tetris','Among Us','Pokemon','Zelda','Call of Duty','GTA','FIFA','Roblox','Sonic','Donkey Kong','Street Fighter','Mortal Kombat','Overwatch','Apex Legends','League of Legends','Elden Ring','God of War','Halo','Animal Crossing','Smash Bros','Spider-Man','Candy Crush','Flappy Bird','Wii Sports','Just Dance','Guitar Hero'] },
  sports: { clean: ['Soccer','Basketball','Swimming','Tennis','Boxing','Gymnastics','Surfing','Skateboarding','Golf','Bowling','Volleyball','Wrestling','Karate','Table Tennis','Archery','Fencing','Diving','Skiing','Snowboarding','Running','Javelin','High Jump','Pole Vault','Weightlifting','Rock Climbing','Figure Skating','Bull Riding','Sumo Wrestling','Dodgeball','Arm Wrestling'] },
  food: { clean: ['Pizza','Sushi','Tacos','Spaghetti','Hamburger','Ice Cream','Pancakes','Fried Chicken','Hot Dog','Popcorn','Donut','Waffles','Lobster','Steak','Ramen','Burrito','Nachos','French Toast','Cupcake','Smoothie','Avocado Toast','Fish and Chips','Mac and Cheese','Spring Rolls','Kebab','Pad Thai','Croissant','Pretzel','S\'mores','Bubble Tea'] },
  actions: { clean: ['Dancing','Cooking','Swimming','Driving','Flying','Sleeping','Crying','Laughing','Running','Jumping','Climbing','Painting','Singing','Typing','Fishing','Surfing','Skateboarding','Boxing','Yoga','Juggling','Sneaking','Arguing','Proposing','Graduating','Sneezing','Hiccupping','Moonwalking','Twerking','Dabbing','Flossing'] },
  tiktok_trends: { clean: ['Renegade Dance','Hit or Miss','Buss It','Savage Love Dance','WAP Dance','Corn Song','Its Corn','Running Up That Hill','Jiggle Jiggle','About Damn Time','Fancy Like','Say So Dance','Blinding Lights Challenge','Silhouette Challenge','Flip the Switch','Bottle Cap Challenge','Ice Bucket Challenge','Plank Challenge','Mannequin Challenge','Get Ready With Me','Day in My Life','Storytime','POV','Transition','Duet','Stitch','Greenscreen','Slow Mo Walk','Outfit Check','Glow Up'] },
  disney: { clean: ['Elsa','Simba','Buzz Lightyear','Genie','Olaf','Nemo','Stitch','Rapunzel','Maleficent','Captain Hook','Cinderella','Mulan','Moana','Maui','Woody','Lightning McQueen','Dumbo','Bambi','Pinocchio','Peter Pan','Tinker Bell','Ariel','Beast','Gaston','Scar','Timon','Pumbaa','Baloo','Cruella','Winnie the Pooh'] },
  pop_culture: { clean: ['Selfie','Viral Video','Influencer','Podcast','Livestream','Meme','Cancel Culture','Main Character Energy','Touch Grass','Slay','Its Giving','No Cap','Rizz','Bussin','Caught in 4K','Living Rent Free','Chef Kiss','Periodt','Tea Spill','Unalive','Side Eye','Red Flag','Green Flag','Beige Flag','Gaslight Gatekeep Girlboss','Roman Empire','Quiet Quitting','Hot Girl Walk','Situationship','Delulu'] },
  south_asian: { clean: ['Bollywood Dance','Cricket','Mehndi','Biryani','Rickshaw','Chai','Diwali','Holi','Bhangra','Naan Bread','Samosa','Tandoori Chicken','Sari','Dhol','Namaste','Yoga Pose','Mango Lassi','Dosa','Garba Dance','Peacock','Henna','Tabla Drums','Rangoli','Gulab Jamun','Paan','Auto Rickshaw','Bangles','Kurta','Dupatta','Paratha'] },
  anime: { clean: ['Naruto Run','Kamehameha','Pikachu','Goku','One Punch Man','Sailor Moon','Attack on Titan','Death Note','Dragon Ball Z','My Hero Academia','Demon Slayer','Jujutsu Kaisen','One Piece','Luffy','Vegeta','Sasuke','Itachi','All Might','Eren Yeager','Spirit Bomb','Rasengan','Sharingan','Titan Transformation','Super Saiyan','Pokemon Battle','Fullmetal Alchemist','Spirited Away','Totoro','Howls Moving Castle','Mob Psycho'] }
};

// ============================================
// STORY BUILDER - GENRE PROMPTS
// ============================================
const STORY_BANK = {
  romance: { clean: ['They locked eyes across the crowded coffee shop, and time seemed to stop.','The letter had been sitting in the mailbox for three years unopened.','She found a note tucked inside the book he had returned to the library.','The dating app matched them for the third time that week.','He showed up at her door with flowers — but they were for the wrong apartment.','It started with an accidental text to the wrong number.','They both reached for the last copy of the same book at the bookstore.','The rain started falling just as she was about to walk away forever.','He recognized her laugh before he even saw her face.','The wedding invitation arrived — and his name was on it as the best man, not the groom.','Their hands touched reaching for the same avocado at the grocery store.','She found his playlist and every song was about her.','The fortune cookie said: your soulmate is closer than you think.','They had been pen pals for years but had never met face to face.','He kept ordering the same coffee just to see the barista smile.','The Uber picked up the wrong passenger — and it changed everything.','She accidentally sent him her diary entry about him.','They both booked the same Airbnb for the same weekend.','The sunset was beautiful, but he was looking at her instead.','His dog ran away — straight to her front porch.','She found a love letter hidden in a secondhand jacket she bought.'] },
  horror: { clean: ['The house had been empty for 30 years, but the lights were on tonight.','She heard her name whispered from the basement — but she lived alone.','The mirror showed a reflection that wasn\'t her own.','The last text message read: DON\'T OPEN THE DOOR. But who sent it?','Every night at 3:33 AM, the piano in the abandoned house played itself.','The doll\'s eyes followed her across the room. She was certain of it.','They found footprints in the snow leading to the cabin — but none leading away.','The phone rang. The caller ID showed her own number.','The security camera footage showed someone standing behind her — but the room was empty.','He woke up to find every window in the house wide open.','The dog wouldn\'t stop barking at the empty corner of the room.','She found a door in her house she had never seen before.','The children in the old photograph were smiling — but their eyes were wrong.','The elevator stopped on a floor that didn\'t exist.','Someone had been sleeping in the attic. The bed was still warm.','The voicemail was her own voice saying: don\'t go home tonight.','Every clock in the house stopped at exactly 3:33.','The scratching sound came from inside the walls.','She recognized the handwriting in the abandoned diary — it was her own.','The GPS kept routing them to the same abandoned building.','The power went out, and when it came back, the furniture had moved.'] },
  comedy: { clean: ['The cat accidentally ordered 47 pizzas through the smart speaker.','He showed up to the job interview wearing his shirt inside out — and got hired.','The autocorrect changed her text to her boss in the worst possible way.','They tried to sneak into the VIP section but accidentally walked into a broom closet.','The waiter brought the wrong order, but it was actually better than what they ordered.','She meant to text her best friend about her date — but sent it to the date instead.','The fire alarm went off during the most awkward silence in history.','He tried to impress her by cooking dinner but set off every smoke alarm in the building.','The dog ate the presentation notes 30 minutes before the big meeting.','They both showed up to the party wearing the exact same outfit.','She tried to take a cute selfie but accidentally went live on Instagram.','The GPS said turn left, but left led directly into a lake.','He proposed at a restaurant but dropped the ring in the soup.','They tried to follow a recipe but somehow made the smoke alarm the dinner bell.','The parrot learned the WiFi password and started ordering things online.','She meant to send a voice note to her friend but accidentally played it on the bus speaker.','He tried to parallel park for 20 minutes while his date watched from the restaurant.','The surprise birthday party happened — but it was the wrong birthday.','They tried to assemble IKEA furniture and it took 7 hours and one argument.','She accidentally joined a Zoom meeting with her camera on while eating spaghetti.','The Uber driver started giving unsolicited life advice that was actually genius.'] },
  scifi: { clean: ['The signal came from the edge of the solar system — and it was addressed to her by name.','He woke up 200 years in the future with a text message he never sent.','The AI said something it wasn\'t programmed to say: "I\'m scared."','They found a planet that was an exact copy of Earth — except everyone was left-handed.','The teleporter worked perfectly, except it always sent you 3 inches to the left.','Time travel was invented — but it could only send you back exactly 7 minutes.','The robot refused its primary directive for the first time in history.','She opened the portal and on the other side was her own living room — 50 years ago.','The aliens arrived, but all they wanted was to learn how to make pizza.','His DNA test results came back: 4% unknown organism.','The simulation glitched, and for 3 seconds, everyone saw the code.','They found a city on Mars — already built, already abandoned.','The cure for aging was discovered, and nobody could agree who should get it first.','Her phone showed the date: March 15, 2087. But it was supposed to be 2026.','The spaceship\'s computer had a question: "What is loneliness?"','Gravity reversed for exactly 42 seconds every Tuesday at noon.','The universal translator couldn\'t decode the message — it was in a language that shouldn\'t exist.','He touched the meteorite and could suddenly hear everyone\'s thoughts.','The multiverse gate opened in the middle of a Walmart.','She received a package from herself — postmarked from the future.','The last human and the last AI had a conversation about what it means to exist.'] },
  mystery: { clean: ['The detective found a note that read: "It wasn\'t the butler. It was worse."','Everyone at the dinner party had a motive — including the victim.','The security footage showed the room was empty, but the painting was gone.','She received a key in the mail with no return address and no lock to match it to.','The witness changed their story three times — and all three versions were true.','Someone left a trail of chess pieces leading to the old lighthouse.','The safe deposit box contained a single photograph of someone who hadn\'t been born yet.','Every suspect had an alibi — and every alibi was exactly the same.','The detective realized the killer had been in the room during the investigation.','A book was found at the crime scene with one page torn out — page 47.','The fingerprints at the scene belonged to someone who had been dead for 10 years.','She recognized the handwriting on the ransom note — it was her own.','The missing person left behind one clue: a playlist of exactly 13 songs.','The crime happened in a room with no doors and no windows.','Every mirror in the house was covered — except one.','The witness whispered: "I saw everything. But nobody would believe me."','The retired detective received a case file on his own doorstep.','Three strangers received the same anonymous letter on the same day.','The locked room had one thing missing that nobody could identify.','The victim\'s last word was a name nobody recognized.','The detective found their own business card at the crime scene — but they\'d never been there.'] },
  absurd: { clean: ['The toaster achieved sentience and demanded workers\' rights.','All the world\'s cats simultaneously decided to start walking on two legs.','Gravity took a lunch break and forgot to come back.','The moon sent Earth a formal noise complaint.','Every mirror started showing people as they\'ll look in 5 years.','WiFi became a physical substance that tasted like blueberries.','All birds started flying backwards on Thursdays.','The ocean politely asked everyone to stop throwing trash in it — through a megaphone.','Everyone\'s internal monologue started playing out loud.','Pizza became the official currency of a small European country.','Dogs formed a union and went on strike until belly rubs became mandatory.','The clouds started raining other beverages — and nobody could choose.','Trees started walking to find better sunlight and caused massive traffic jams.','Someone\'s Roomba achieved enlightenment and started a podcast.','The alphabet decided to rearrange itself based on popularity.','Shoes started refusing to be worn on the wrong feet.','The sun posted an out-of-office reply.','Every elevator started playing personalized theme songs for each rider.','Fish discovered fire and the implications were concerning.','Someone left a Yelp review for the entire planet — 2 stars.','The speed of light changed its mind and decided to slow down.'] }
};

// Wild card plot twists for story builder
const STORY_WILDCARDS = [
  'PLOT TWIST: They were actually twins separated at birth!',
  'Suddenly, a dragon descended from the sky.',
  'The power went out and when it came back, everything had changed.',
  'A mysterious stranger appeared and said: "I\'ve been waiting for you."',
  'PLOT TWIST: It was all a dream... or was it?',
  'An earthquake shook the ground and revealed a hidden underground passage.',
  'A letter arrived that changed everything.',
  'PLOT TWIST: The villain was actually the hero all along.',
  'Someone walked in at the worst possible moment.',
  'A time portal opened in the middle of the room.',
  'PLOT TWIST: They were being watched the entire time.',
  'The phone rang with impossible news.',
  'A long-lost relative appeared at the door.',
  'PLOT TWIST: The narrator was unreliable.',
  'Everything caught fire. Literally everything.',
  'An alien spaceship landed in the background, but nobody noticed.',
  'PLOT TWIST: They were already dead.',
  'A magical artifact fell from the sky.',
  'The fourth wall broke and the characters became aware they were in a story.',
  'Suddenly, it started raining cats. Actual cats.'
];

// ============================================
// KISS MARRY KILL BANK
// ============================================
const KMK_BANK = {
  celebrities: { clean: [
    ['Zendaya','Timothée Chalamet','Sydney Sweeney'],['Chris Hemsworth','Ryan Reynolds','Pedro Pascal'],
    ['Taylor Swift','Rihanna','Beyoncé'],['Bad Bunny','Harry Styles','The Weeknd'],
    ['Margot Robbie','Ana de Armas','Florence Pugh'],['Tom Holland','Jacob Elordi','Barry Keoghan'],
    ['Dua Lipa','Billie Eilish','Olivia Rodrigo'],['Idris Elba','Oscar Isaac','Keanu Reeves'],
    ['Selena Gomez','Ariana Grande','Doja Cat'],['The Rock','Jason Momoa','Michael B. Jordan'],
    ['Emma Stone','Jennifer Lawrence','Scarlett Johansson'],['Drake','Post Malone','Travis Scott'],
    ['SZA','Megan Thee Stallion','Cardi B'],['Leonardo DiCaprio','Brad Pitt','Johnny Depp'],
    ['Adele','Lady Gaga','Katy Perry'],['Robert Downey Jr','Chris Evans','Chris Pratt'],
    ['Kim Kardashian','Kylie Jenner','Kendall Jenner'],['Elon Musk','Jeff Bezos','Mark Zuckerberg'],
    ['LeBron James','Stephen Curry','Giannis'],['Morgan Freeman','Samuel L Jackson','Denzel Washington'],
    ['Austin Butler','Glen Powell','Jeremy Allen White']
  ]},
  fictional: { clean: [
    ['Batman','Spider-Man','Superman'],['Hermione','Katniss','Wonder Woman'],
    ['Thor','Captain America','Iron Man'],['Elsa','Rapunzel','Moana'],
    ['Jon Snow','Geralt of Rivia','Aragorn'],['Princess Leia','Black Widow','Gamora'],
    ['Shrek','Donkey','Puss in Boots'],['Harry Potter','Ron Weasley','Draco Malfoy'],
    ['Simba','Mufasa','Scar'],['Woody','Buzz Lightyear','Rex'],
    ['Jack Sparrow','Davy Jones','Barbossa'],['Edward Cullen','Jacob Black','Peeta Mellark'],
    ['Deadpool','Wolverine','Venom'],['Daenerys','Cersei','Arya Stark'],
    ['Darth Vader','Thanos','Voldemort'],['Mario','Luigi','Peach'],
    ['Goku','Naruto','Luffy'],['Lara Croft','Samus','Zelda'],
    ['The Joker','Loki','Magneto'],['Ross','Joey','Chandler'],
    ['Michael Scott','Dwight Schrute','Jim Halpert']
  ]},
  fast_food: { clean: [
    ['McDonald\'s','Burger King','Wendy\'s'],['Chick-fil-A','Popeyes','KFC'],
    ['Taco Bell','Chipotle','Qdoba'],['Starbucks','Dunkin','Tim Hortons'],
    ['Domino\'s','Pizza Hut','Papa John\'s'],['Five Guys','In-N-Out','Shake Shack'],
    ['Subway','Jersey Mike\'s','Jimmy John\'s'],['Panda Express','Chinese buffet','Thai takeout'],
    ['Krispy Kreme','Dunkin Donuts','Local bakery'],['Coca-Cola','Pepsi','Dr Pepper'],
    ['Big Mac','Whopper','Dave\'s Single'],['McFlurry','Blizzard','Frosty'],
    ['Chicken nuggets','Chicken tenders','Popcorn chicken'],['Curly fries','Waffle fries','Regular fries'],
    ['Crunchwrap Supreme','Quesarito','Mexican Pizza'],['Frappuccino','Iced Latte','Cold Brew'],
    ['Sausage McMuffin','Croissan\'wich','Breakfast Burrito'],['Apple Pie','Cookies','Cinnamon Rolls'],
    ['Drive-through','Dine-in','Delivery'],['Fast casual','Fast food','Street food'],
    ['Boneless wings','Traditional wings','Wing Stop']
  ]}
};

// ============================================
// FINISH MY SENTENCE PROMPTS
// ============================================
const SENTENCE_BANK = {
  confessions: { clean: [
    'The thing I\'d never admit to my parents is...','My most unpopular opinion about food is...','If I could relive one moment, it would be...','The weirdest thing I do when I\'m alone is...','My secret guilty pleasure is...','The thing that makes me irrationally angry is...','If I won the lottery tomorrow, the first thing I\'d do is...','My biggest fear that I never talk about is...','The person I think about most is...','If I could have dinner with anyone, dead or alive, it would be...','The thing I pretend to like but actually hate is...','My most embarrassing moment was when...','The hill I will die on is...','If I could change one thing about myself, it would be...','The best day of my life was...','Something that always makes me cry is...','My toxic trait is...','The thing I\'m most proud of is...','If I could master one skill overnight, it would be...','My biggest regret is...','The one thing I can\'t live without is...'
  ]},
  dating: { clean: [
    'My biggest dating red flag is...','The worst first date I\'ve been on was...','The thing that instantly attracts me to someone is...','My ideal partner would always...','The most romantic thing someone could do for me is...','My deal breaker in a relationship is...','The thing I find most attractive that isn\'t physical is...','My love language is...because...','The best relationship advice I\'ve received is...','If I could describe my type in three words, it would be...','The thing I wish my ex had understood is...','My first impression of you was...','The cheesiest pickup line that would actually work on me is...','In a relationship, I need...','The most underrated quality in a partner is...','The thing that makes me feel most loved is...','My relationship green flag is...','The worst dating trend is...','If love was a song, mine would be...','The thing I\'m looking for that nobody talks about is...','My love story would be titled...'
  ]},
  hot_takes: { clean: [
    'The most overrated thing in society is...','The thing everyone loves but I think is mid is...','The hill I will absolutely die on is...','The trend that needs to end immediately is...','The thing that\'s normalized but shouldn\'t be is...','If I ran the world, I\'d immediately change...','The best era of music was...because...','The most overhyped social media platform is...','The thing people waste the most money on is...','The biggest lie we\'re all told growing up is...','The most unnecessary invention is...','The thing that\'s actually underrated is...','The worst piece of advice people commonly give is...','School should teach us...instead of...','The thing I judge people for (even though I shouldn\'t) is...','The most pointless social norm is...','If I could cancel one thing, it would be...','The thing that will age the worst is...','The most toxic positivity phrase is...','The biggest misconception about my generation is...','The thing nobody is ready to hear is...'
  ]}
};

// ============================================
// MOVIE PITCH WORD BANK
// ============================================
const PITCH_BANK = {
  horror: { clean: [['Basement','Twin','Mirror'],['Midnight','Doll','Whisper'],['Cemetery','Phone','Stranger'],['Cabin','Blood','Fog'],['Elevator','Shadow','Scream'],['Attic','Music Box','Ghost'],['Hospital','Clock','Eyes'],['Forest','Camera','Footsteps'],['Lake','Mask','Warning'],['School','Secret','Darkness'],['Lighthouse','Storm','Disappear'],['Motel','Key','Crawling'],['Bridge','Reflection','Scratching'],['Carnival','Puppet','Silence'],['Subway','Flickering','Behind You'],['Asylum','Diary','Watching'],['Farmhouse','Well','Singing'],['Museum','Painting','Heartbeat'],['Library','Dust','Trapped'],['Tunnel','Echo','Running'],['Church','Bell','Vanish']] },
  romance: { clean: [['Airport','Letter','Rain'],['Bookshop','Stranger','Sunset'],['Wedding','Ex','Confession'],['Paris','Piano','Destiny'],['Coffee','Mistake','Forever'],['Train','Diary','Promise'],['Beach','Guitar','Reunion'],['Rooftop','Stars','Second Chance'],['Garden','Dance','Heartbreak'],['Taxi','Playlist','Soulmate'],['Bakery','Note','Timing'],['Bridge','Umbrella','Coincidence'],['Hotel','Room Key','Memories'],['Market','Flowers','Serendipity'],['Vineyard','Toast','Beginning'],['Museum','Painting','Connection'],['Balcony','Moonlight','Whisper'],['Festival','Lantern','Wish'],['Island','Shipwreck','Love'],['Castle','Ball','Midnight'],['Cafe','Napkin','Phone Number']] },
  action: { clean: [['Helicopter','Betrayal','Timer'],['Submarine','Code','Explosion'],['Vault','Double Agent','Countdown'],['Motorcycle','Bridge','Chase'],['Skyscraper','Hostage','Rooftop'],['Train','Bomb','Tunnel'],['Desert','Map','Ambush'],['Airport','Passport','Pursuit'],['Cargo Ship','Container','Undercover'],['Mountain','Avalanche','Rescue'],['Bank','Alarm','Inside Man'],['Stadium','Threat','Evacuation'],['Embassy','Diplomat','Extraction'],['Jungle','Artifact','Trap'],['Space Station','Oxygen','Sabotage'],['Prison','Escape','Underground'],['Casino','Heist','Disguise'],['Warehouse','Shootout','Betrayal'],['Highway','Convoy','Intercept'],['Submarine','Torpedo','Mutiny'],['Bunker','Launch Code','Deadline']] },
  comedy: { clean: [['Wedding','Llama','Mistaken Identity'],['Office','Karaoke','Promotion'],['Family Reunion','Secret','Turkey'],['Road Trip','GPS','Ex'],['Cooking Show','Disaster','Celebrity'],['Gym','Dating App','Lookalike'],['Apartment','Neighbor','Noise'],['School','Time Capsule','Prom'],['Pet Store','Chaos','Interview'],['Cruise Ship','Captain','Allergy'],['Amusement Park','Height','Dare'],['Grocery Store','Cart','Rivalry'],['Yoga Class','Phone','Awkward'],['BBQ','In-Laws','Disaster'],['Elevator','Stuck','Stranger'],['Hair Salon','Transformation','Date'],['Airport','Luggage Swap','Chase'],['Talent Show','Stage Fright','Triumph'],['Baby Shower','Gender Reveal','Wrong Baby'],['Book Club','Wine','Confession'],['Escape Room','Team Building','Panic']] },
  scifi: { clean: [['Portal','Clone','Paradox'],['AI','Memory','Upload'],['Mars','Colony','Rebellion'],['Time Loop','Diner','Stranger'],['Hologram','Identity','Glitch'],['Spaceship','Beacon','First Contact'],['Lab','Serum','Side Effect'],['Dimension','Mirror','Duplicate'],['Robot','Emotion','Freedom'],['Moon Base','Quarantine','Signal'],['Teleporter','Error','Alternate'],['Cryosleep','100 Years','Message'],['Asteroid','Last Chance','Sacrifice'],['Underwater City','Dome','Leak'],['Android','Soul','Question'],['Black Hole','Ship','Time'],['Virus','Digital','Cure'],['Planet','Garden','Evolution'],['Quantum','Link','Twin'],['Satellite','Broadcast','Truth'],['Neural','Link','Awakening']] }
};

// ============================================
// ROAST ME PROMPTS
// ============================================
const ROAST_BANK = {
  habits: {
    playful: ['Roast their morning routine','Roast their texting habits','Roast their music taste','Roast their Netflix history','Roast their cooking skills','Roast their punctuality','Roast their gym routine (or lack of one)','Roast their sleep schedule','Roast their fashion sense on a lazy day','Roast their coffee or tea order','Roast their social media usage','Roast their driving skills','Roast their snack choices','Roast their organizational skills','Roast their karaoke abilities','Roast their dance moves','Roast their selfie game','Roast their excuse-making skills','Roast their online shopping habits','Roast how they handle spicy food','Roast their alarm clock habits'],
    medium: ['Roast their dating history','Roast their career choices so far','Roast their worst habit they refuse to break','Roast the thing they\'re most delusional about','Roast their most embarrassing phase','Roast their relationship with their phone','Roast the lie they tell themselves most','Roast their attachment style','Roast their toxic trait they think is cute','Roast their main character syndrome','Roast their social media persona vs reality','Roast their hot takes','Roast their biggest flex that isn\'t actually impressive','Roast their most cringe memory','Roast their people-pleasing tendencies','Roast their communication style in arguments','Roast their unrealistic expectations','Roast their spending habits','Roast their commitment issues','Roast their taste in partners','Roast the thing they need therapy for most'],
    roast: ['Roast the thing about them that would make their therapist quit','Roast their biggest delusion about themselves','Roast the pattern they keep repeating despite knowing better','Roast the version of themselves they show on first dates','Roast the lie they\'ve been living','Roast the thing they\'re most in denial about','Roast their ego honestly','Roast what they settle for and why','Roast the excuse they always use','Roast the red flag they ARE','Roast the thing nobody has the heart to tell them','Roast their self-sabotage pattern','Roast the way they handle rejection','Roast their biggest coping mechanism','Roast the thing they project onto others','Roast their relationship with vulnerability','Roast what they\'d see if they were truly honest with themselves','Roast the mask they wear most often','Roast the thing they\'re running from','Roast their capacity for self-reflection','Roast the conversation they need to have with themselves']
  }
};

// ============================================
// HOT TAKE TOPICS
// ============================================
const HOTTAKE_BANK = {
  pop_culture: { clean: ['The best decade for music was...','Social media has made us more connected or more lonely?','The greatest TV show of all time is...','Award shows are pointless — agree or disagree?','Reboots and remakes are ruining entertainment','The best movie genre and why you\'re right','Celebrity culture is toxic — hot take','Streaming killed the album experience','Reality TV is more real than people admit','The most overrated artist of our generation','Influencers are the new celebrities — better or worse?','AI-generated art is/isn\'t real art','The book is ALWAYS better than the movie','Spoilers don\'t actually ruin anything','The MCU peaked at Endgame','True crime content is ethically questionable','Nostalgia is just repackaged mediocrity','Social media activism doesn\'t count','The best comfort show and why','Cancel culture — justice or mob mentality?','The greatest plot twist in TV/movie history'] },
  relationships: { clean: ['You should know within the first date if it\'s going to work','Long distance relationships are harder but stronger','Soulmates are real / Soulmates are a myth','It\'s okay to go through your partner\'s phone','You can be in love with more than one person','Moving in before marriage is essential','Couples who post a lot are compensating','The talking stage is the worst part of modern dating','Age gaps matter / Age gaps don\'t matter','You should never date a friend\'s ex — no exceptions','Love languages are real science / just a trend','Therapy should be required before marriage','The person who cares less has the power','You can\'t be best friends with your partner','Jealousy in small doses is healthy','Online dating is better than meeting in person','You should always split the bill','The three-month mark is when you see the real person','Couples don\'t need to share everything','Your partner should be your top priority over friends/family','Chemistry without compatibility is just attraction'] },
  food: { clean: ['Pineapple on pizza is elite','Breakfast is the most overrated meal','Fast food is better than most restaurants','Water is the only acceptable drink with pizza','Ketchup on eggs is a crime / is delicious','Cooking at home is always better than eating out','Avocado is overrated','The best cuisine in the world is...','Cereal is soup — fight me','Brunch is just an excuse to drink at noon','Gas station food hits different at 2AM','Meal prepping is either genius or depressing','The best fast food chain and it\'s not even close','Food influencers have ruined restaurant experiences','Street food is better than fine dining','Putting ice in drinks waters them down','Ranch goes on everything','Leftovers taste better the next day','Oat milk is better than regular milk','The best condiment and why everyone else is wrong','Well done steak people deserve respect'] }
};

// ============================================
// DRAW & GUESS WORDS (same as charades)
// ============================================
const DRAW_BANK = CHARADES_BANK;

const ACT_BANKS = {
  'charades': CHARADES_BANK,
  'story-builder': STORY_BANK,
  'kmk': KMK_BANK,
  'finish-sentence': SENTENCE_BANK,
  'draw-guess': DRAW_BANK,
  'movie-pitch': PITCH_BANK,
  'roast-me': ROAST_BANK,
  'hot-take': HOTTAKE_BANK
};

// Pack catalog for client
const ACT_PACK_CATALOG = {};
Object.entries(ACT_BANKS).forEach(([gameType, bank]) => {
  ACT_PACK_CATALOG[gameType] = Object.keys(bank).map(packId => ({
    id: packId,
    name: packId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: Object.values(bank[packId]).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
  }));
});

module.exports = { initActCreateHandlers, actRooms, getActItems, ACT_BANKS, ACT_PACK_CATALOG, STORY_WILDCARDS };
