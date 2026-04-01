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
  movies: { clean: ['Titanic','The Lion King','Jurassic Park','Harry Potter','Frozen','Finding Nemo','The Avengers','Star Wars','Shrek','Toy Story','Spider-Man','Batman','Jaws','Rocky','The Matrix','E.T.','Aladdin','Moana','Coco','Up','Inside Out','Ratatouille','Incredibles','Mulan','Tarzan','Hercules','Beauty and the Beast','Cars','Monsters Inc','Wall-E','Inception','Parasite','Get Out','The Dark Knight','Home Alone','John Wick','The Notebook','Mean Girls','Clueless','Pulp Fiction','The Godfather','Fast and Furious','Black Panther','Dune','Everything Everywhere All at Once','Top Gun','Interstellar','Fight Club','Forrest Gump','Tangled','Soul','Turning Red','Encanto','Knives Out','Bird Box','Dont Look Up','Nope','Us','Split','A Quiet Place','Hereditary','Midsommar','The Menu','Gladiator','Avatar','Scream','The Shining','Back to the Future','Ghostbusters','The Terminator','Die Hard','Indiana Jones','Mission Impossible','James Bond','The Hunger Games','Twilight','The Maze Runner','Divergent','Joker','Deadpool','Wonder Woman','Aquaman','Doctor Strange','Oppenheimer','Barbie','The Super Mario Bros Movie','Wonka','Napoleon','Killers of the Flower Moon','Poor Things'] },
  tv_shows: { clean: ['Friends','The Office','Breaking Bad','Stranger Things','Game of Thrones','Squid Game','Wednesday','The Bear','Bridgerton','Ted Lasso','Spongebob','Rick and Morty','The Simpsons','Brooklyn Nine Nine','Greys Anatomy','Euphoria','The Boys','Mandalorian','Yellowstone','Succession','Peaky Blinders','Ozark','Narcos','The Crown','Avatar','South Park','Family Guy','How I Met Your Mother','Big Bang Theory','Suits','Emily in Paris','Money Heist','Dark','Abbott Elementary','Severance','White Lotus','Mare of Easttown','Only Murders in the Building','Heartstopper','Never Have I Ever','Sex Education','Schitts Creek','Parks and Recreation','Seinfeld','Its Always Sunny','Arrested Development','Community','New Girl','Gossip Girl','One Tree Hill','This Is Us','Beef','Dahmer','The Watcher','Inventing Anna','The Dropout','WeCrashed','Super Pumped','The Last of Us','House of the Dragon','Loki','Andor','The Witcher','You','Outer Banks','Cobra Kai','Ginny and Georgia','All of Us Are Dead','Alice in Borderland','Fleabag','Killing Eve','The Good Place','Arcane','Invincible','Reacher','Jack Ryan','Slow Horses','Shogun','Baby Reindeer','Fallout','3 Body Problem','The Gentlemen','Ripley'] },
  animals: { clean: ['Elephant','Penguin','Kangaroo','Giraffe','Monkey','Snake','Eagle','Dolphin','Octopus','Butterfly','Bear','Lion','Shark','Gorilla','Flamingo','Chameleon','Sloth','Peacock','Crab','Jellyfish','Koala','Panda','Cheetah','Hippo','Rhino','Frog','Parrot','Owl','Horse','Turtle','Axolotl','Quokka','Capybara','Platypus','Narwhal','Pangolin','Fennec Fox','Red Panda','Snow Leopard','Manta Ray','Hammerhead Shark','Blue Whale','Giant Squid','Komodo Dragon','Mantis Shrimp','Peacock Spider','Dumbo Octopus','Blobfish','Goblin Shark','Anglerfish','Flying Squirrel','Sugar Glider','Slow Loris','Aye-Aye','Proboscis Monkey','Mandrill','Emperor Penguin','Albatross','Cassowary','Kiwi Bird','Secretary Bird','Shoebill Stork','Naked Mole Rat','Star-Nosed Mole','Honey Badger','Wolverine','Meerkat','Aardvark','Tapir','Okapi','Saiga Antelope','Gerenuk','Markhor','Sea Otter','Poison Dart Frog','Leafy Sea Dragon','Arctic Fox','Wombat','Ocelot','Manatee'] },
  celebrities: { clean: ['Taylor Swift','Drake','The Rock','Beyonce','Elon Musk','Oprah','Michael Jordan','Lady Gaga','Cristiano Ronaldo','Kim Kardashian','Will Smith','Tom Hanks','Ariana Grande','Bad Bunny','Billie Eilish','Ed Sheeran','Rihanna','Lionel Messi','Zendaya','Ryan Reynolds','Adele','Bruno Mars','Post Malone','Harry Styles','Selena Gomez','Jennifer Lopez','Lebron James','Travis Scott','Doja Cat','SZA','Rosalia','Priyanka Chopra','Shah Rukh Khan','Ranveer Singh','Malala Yousafzai','Hasan Minhaj','Mindy Kaling','Awkwafina','Ali Wong','Trevor Noah','John Mulaney','Olivia Rodrigo','Lizzo','Timothee Chalamet','Florence Pugh','Sydney Sweeney','Pedro Pascal','Oscar Isaac','Michael B Jordan','Lupita Nyongo','Viola Davis','Issa Rae','Quinta Brunson','Kylie Jenner','Cardi B','Nicki Minaj','Megan Thee Stallion','Ice Spice','Central Cee','Dave','Stormzy','Dua Lipa','Travis Kelce','MrBeast','Kai Cenat','IShowSpeed','Addison Rae','Charli DAmelio','Khaby Lame','Gordon Ramsay','Snoop Dogg','Morgan Freeman','Keanu Reeves','Chris Hemsworth','Margot Robbie','Tom Holland','Robert Downey Jr','Johnny Depp','Leonardo DiCaprio','Shakira'] },
  video_games: { clean: ['Minecraft','Fortnite','Mario Kart','Pac-Man','Tetris','Among Us','Pokemon','Zelda','Call of Duty','GTA','FIFA','Roblox','Sonic','Donkey Kong','Street Fighter','Mortal Kombat','Overwatch','Apex Legends','League of Legends','Elden Ring','God of War','Halo','Animal Crossing','Smash Bros','Spider-Man','Candy Crush','Flappy Bird','Wii Sports','Just Dance','Guitar Hero','Mario','Luigi','Bowser','Princess Peach','Yoshi','Link','Samus','Kirby','Pikachu','Charizard','Mewtwo','Master Chief','Kratos','Nathan Drake','Lara Croft','Solid Snake','Cloud Strife','Sephiroth','Geralt of Rivia','Aloy','Joel and Ellie','Arthur Morgan','Trevor Philips','Agent 47','Ezio Auditore','Commander Shepard','Creeper','Enderman','Fall Guys Bean','Valorant Jett','Overwatch Tracer','DVa','Widowmaker','Hanzo','Apex Wraith','Minecraft Steve','Ryu','Sub-Zero','Scorpion','Mega Man','Crash Bandicoot','Spyro','Rayman','Sackboy','Nathan Drake','Tomb Raider','Final Fantasy','Dark Souls','Bloodborne','Sekiro','Hollow Knight','Celeste','Cuphead','Undertale'] },
  sports: { clean: ['Soccer','Basketball','Swimming','Tennis','Boxing','Gymnastics','Surfing','Skateboarding','Golf','Bowling','Volleyball','Wrestling','Karate','Table Tennis','Archery','Fencing','Diving','Skiing','Snowboarding','Running','Javelin','High Jump','Pole Vault','Weightlifting','Rock Climbing','Figure Skating','Bull Riding','Sumo Wrestling','Dodgeball','Arm Wrestling','Cristiano Ronaldo','Lionel Messi','Kylian Mbappe','Erling Haaland','LeBron James','Stephen Curry','Kevin Durant','Giannis Antetokounmpo','Tom Brady','Patrick Mahomes','Shohei Ohtani','Serena Williams','Roger Federer','Rafael Nadal','Novak Djokovic','Carlos Alcaraz','Tiger Woods','Simone Biles','Usain Bolt','Noah Lyles','Katie Ledecky','Neymar Jr','Vinicius Jr','Bukayo Saka','Jude Bellingham','Mohamed Salah','Son Heung-min','Neeraj Chopra','PV Sindhu','Eliud Kipchoge','Cricket','Rugby','Badminton','Handball','Water Polo','Ice Hockey','Lacrosse','MMA','Taekwondo','Judo','Rowing','Kayaking','BMX','Triathlon','Ironman','Marathon','Slam Dunk','Free Throw','Penalty Kick','Hat Trick','Touchdown'] },
  food: { clean: ['Pizza','Sushi','Tacos','Spaghetti','Hamburger','Ice Cream','Pancakes','Fried Chicken','Hot Dog','Popcorn','Donut','Waffles','Lobster','Steak','Ramen','Burrito','Nachos','French Toast','Cupcake','Smoothie','Avocado Toast','Fish and Chips','Mac and Cheese','Spring Rolls','Kebab','Pad Thai','Croissant','Pretzel','Smores','Bubble Tea','Biryani','Nihari','Haleem','Seekh Kebab','Chapli Kebab','Samosa','Chaat','Pani Puri','Butter Chicken','Dal Makhani','Rogan Josh','Karahi','Baklava','Hummus','Shawarma','Falafel','Knafeh','Jollof Rice','Injera','Tagine','Pho','Banh Mi','Som Tum','Laksa','Nasi Lemak','Rendang','Bibimbap','Tteokbokki','Kimchi','Takoyaki','Okonomiyaki','Mochi','Tacos al Pastor','Elote','Churros','Ceviche','Empanadas','Arepas','Poutine','Butter Tarts','Nanaimo Bars','Dosa','Gulab Jamun','Jalebi','Paratha','Naan','Tikka Masala','Vindaloo','Tandoori','Pav Bhaji','Vada Pav','Chow Mein'] },
  actions: { clean: ['Dancing','Cooking','Swimming','Driving','Flying','Sleeping','Crying','Laughing','Running','Jumping','Climbing','Painting','Singing','Typing','Fishing','Surfing','Skateboarding','Boxing','Yoga','Juggling','Sneaking','Arguing','Proposing','Graduating','Sneezing','Hiccupping','Moonwalking','Twerking','Dabbing','Flossing','Photobombing','Ghosting Someone','Doom Scrolling','Parallel Parking','Trying to Open a Bag Quietly','Walking into a Glass Door','Trying to Act Casual After Tripping','The Renegade Dance','The Griddy','Taking a Mirror Selfie','Going Live on Instagram','Unboxing Something','ASMR','Mukbang','Speedrunning','Rage Quitting','Tea Spilling','Gatekeeping','Manifesting','Main Character Walking','NPC Behavior','Villain Arc','Pretending to Laugh at a Bad Joke','Waving Back at Someone Not Waving at You','Stepping on a Lego','Stubbing Your Toe','Forgetting Why You Walked into a Room','Trying Not to Laugh','Robot Dance','Chicken Dance','The Macarena','Electric Slide','Limbo','Air Guitar','Karaoke','Taking a Selfie','Applying Makeup','Brushing Teeth','Making a Sandwich','Riding a Rollercoaster','Walking a Tightrope','Mime in a Box','Hula Hooping','Jump Rope','Arm Wrestling','Thumb War','Rock Paper Scissors','Blowing Out Birthday Candles','Opening a Christmas Present'] },
  tiktok_trends: { clean: ['Renegade Dance','Hit or Miss','Buss It','Savage Love Dance','WAP Dance','Corn Song','Its Corn','Running Up That Hill','Jiggle Jiggle','About Damn Time','Fancy Like','Say So Dance','Blinding Lights Challenge','Silhouette Challenge','Flip the Switch','Bottle Cap Challenge','Ice Bucket Challenge','Plank Challenge','Mannequin Challenge','Get Ready With Me','Day in My Life','Storytime','POV','Transition','Duet','Stitch','Greenscreen','Slow Mo Walk','Outfit Check','Glow Up','Old Town Road','Drivers License','Good 4 U','As It Was','Unholy','Flowers','Calm Down','Shakira Shakira','Despacito','Shape of You','Stay','Levitating','Watermelon Sugar','Montero','Industry Baby','abcdefu','Beggin','Dynamite','Butter','Permission to Dance','Anti-Hero','Cruel Summer','Paint the Town Red','Espresso','Obsessed','Water','Mamushi','Girl Dinner TikTok','Demure','Very Mindful','Brat Summer','Mob Wife Aesthetic','Clean Girl Aesthetic','That Girl','Hot Girl Walk','Silent Walking','Everything Shower','Bed Rotting','Roman Empire','Girl Math','Boy Math','Delulu is the Solulu','Icks','Beige Flag','Rizz','Aura Points'] },
  disney: { clean: ['Elsa','Simba','Buzz Lightyear','Genie','Olaf','Nemo','Stitch','Rapunzel','Maleficent','Captain Hook','Cinderella','Mulan','Moana','Maui','Woody','Lightning McQueen','Dumbo','Bambi','Pinocchio','Peter Pan','Tinker Bell','Ariel','Beast','Gaston','Scar','Timon','Pumbaa','Baloo','Cruella','Winnie the Pooh','Iron Man','Thor','Captain America','Hulk','Black Widow','Hawkeye','Thanos','Loki','Groot','Rocket Raccoon','Star-Lord','Gamora','Doctor Strange','Scarlet Witch','Vision','Ant-Man','Shang-Chi','Black Panther','Miles Morales','Gwen Stacy','Mufasa','Rafiki','Zazu','Nala','Sebastian','Flounder','Mushu','Pascal','Maximus','Marshmallow','Baymax','Hiro','WALL-E','EVE','Remy','Merida','Pocahontas','Jasmine','Aladdin','Jafar','Ursula','Hades','Yzma','Kronk','Mike Wazowski','Sulley','Boo','Dory','Marlin','Crush','Jack Skellington','Wreck-It Ralph','Vanellope','Joy','Sadness','Anger','Bing Bong','Mirabel','Bruno','Luisa','Mei Lee'] },
  pop_culture: { clean: ['Selfie','Viral Video','Influencer','Podcast','Livestream','Meme','Cancel Culture','Main Character Energy','Touch Grass','Slay','Its Giving','No Cap','Rizz','Bussin','Caught in 4K','Living Rent Free','Chef Kiss','Periodt','Tea Spill','Unalive','Side Eye','Red Flag','Green Flag','Beige Flag','Gaslight Gatekeep Girlboss','Roman Empire','Quiet Quitting','Hot Girl Walk','Situationship','Delulu','Brat Summer','Demure','Very Mindful','Girl Dinner','Loud Budgeting','Soft Launch','Hard Launch','Ick','Breadcrumbing','Love Bombing','Ghosting','Benching','Orbiting','Quiet Luxury','Old Money','Clean Girl','That Girl','Dark Academia','Cottagecore','Goblincore','Barbiecore','Coastal Grandmother','Mob Wife','Coquette','Tomato Girl Summer','Vanilla Girl','Strawberry Girl','Rat Girl Summer','Hot Rodent Man','Boyfriend Air','Orange Peel Theory','Airport Test','Enshittification','Doom Spending'] },
  south_asian: { clean: ['Bollywood Dance','Cricket','Mehndi','Biryani','Rickshaw','Chai','Diwali','Holi','Bhangra','Naan','Samosa','Tandoori Chicken','Sari','Dhol','Namaste','Yoga Pose','Mango Lassi','Dosa','Garba Dance','Peacock','Henna','Tabla Drums','Rangoli','Gulab Jamun','Paan','Auto Rickshaw','Bangles','Kurta','Dupatta','Paratha','Shah Rukh Khan','Salman Khan','Aamir Khan','Hrithik Roshan','Ranbir Kapoor','Ranveer Singh','Deepika Padukone','Alia Bhatt','Katrina Kaif','Priyanka Chopra','Kareena Kapoor','Aishwarya Rai','Madhuri Dixit','Kajol','Diljit Dosanjh','AP Dhillon','Sidhu Moosewala','Atif Aslam','AR Rahman','Arijit Singh','Dilwale Dulhania Le Jayenge','Kabhi Khushi Kabhie Gham','Lagaan','Sholay','3 Idiots','Dangal','PK','Bajrangi Bhaijaan','Gully Boy','Jab We Met','Om Shanti Om','Devdas','Dhoom','Taare Zameen Par','The Family Man','Sacred Games','Mirzapur','Scam 1992','Panchayat','Kota Factory','Delhi Crime','Kathak','Bharatanatyam','Lavani','Giddha','Kuchipudi','Odissi','Nagin Dance','Thumka','Nihari','Haleem','Paya','Seekh Kebab','Chapli Kebab','Chaat','Pani Puri','Butter Chicken','Dal Makhani','Rogan Josh','Karahi','Jalebi','Kheer','Pav Bhaji','Vada Pav','Chole Bhature','Rasgulla','Ladoo','Kulfi','Phirni','Gajar Ka Halwa','Pista Barfi'] },
  anime: { clean: ['Naruto Run','Kamehameha','Pikachu','Goku','One Punch Man','Sailor Moon','Attack on Titan','Death Note','Dragon Ball Z','My Hero Academia','Demon Slayer','Jujutsu Kaisen','One Piece','Luffy','Vegeta','Sasuke','Itachi','All Might','Eren Yeager','Spirit Bomb','Rasengan','Sharingan','Titan Transformation','Super Saiyan','Pokemon Battle','Fullmetal Alchemist','Spirited Away','Totoro','Howls Moving Castle','Mob Psycho','Naruto','Sakura','Kakashi','Madara','Gohan','Piccolo','Frieza','Cell','Beerus','Zoro','Nami','Sanji','Robin','Chopper','Ace','Shanks','Blackbeard','Ichigo','Rukia','Byakuya','Aizen','Tanjiro','Nezuko','Zenitsu','Inosuke','Rengoku','Muzan','Izuku Midoriya','Bakugo','Todoroki','Endeavor','Hawks','Shigaraki','Dabi','Toga','Mikasa','Armin','Levi','Hange','Reiner','Light Yagami','L','Ryuk','Edward Elric','Alphonse','Roy Mustang','Spike Spiegel','Faye Valentine','Gintoki','Kirito','Asuna','Rem','Emilia','Subaru Natsuki','Mob','Reigen','Gojo Satoru','Sukuna','Megumi','Nobara','Todo','Chainsaw Man','Power','Makima','Anya Forger','Loid Forger','Yor Forger','Violet Evergarden','Saitama'] },
  superheroes: { clean: ['Spider-Man','Batman','Superman','Wonder Woman','Iron Man','Captain America','Thor','Hulk','Black Panther','Wolverine','Deadpool','Flash','Aquaman','Green Lantern','Black Widow','Hawkeye','Ant-Man','Doctor Strange','Scarlet Witch','Vision','Shang-Chi','Captain Marvel','Falcon','War Machine','Gamora','Star-Lord','Groot','Rocket','Thanos','Loki','Joker','Harley Quinn','Catwoman','Riddler','Penguin','Bane','Two-Face','Poison Ivy','Magneto','Professor X','Cyclops','Storm','Jean Grey','Nightcrawler','Beast','Mystique','Venom','Carnage','Green Goblin','Doctor Octopus','Kingpin','Electro','Sandman','Mysterio','Vulture','Killmonger','Hela','Ultron','Galactus','Doctor Doom','Darkseid','Lex Luthor','General Zod','Doomsday','Deathstroke','Ra\'s al Ghul','Brainiac','Sinestro','Black Adam','Shazam','Nightwing','Robin','Batgirl','Supergirl','Miles Morales','Gwen Stacy','Blade','Moon Knight','She-Hulk','Ms Marvel'] },
  historical: { clean: ['Cleopatra','Julius Caesar','Napoleon','Abraham Lincoln','Queen Elizabeth','Albert Einstein','Leonardo da Vinci','Martin Luther King Jr','Mahatma Gandhi','Nelson Mandela','William Shakespeare','Marie Curie','Genghis Khan','Alexander the Great','Queen Victoria','George Washington','Benjamin Franklin','Nikola Tesla','Thomas Edison','Wright Brothers','Amelia Earhart','Neil Armstrong','Frida Kahlo','Pablo Picasso','Mozart','Beethoven','Charles Darwin','Isaac Newton','Galileo','Marco Polo','Christopher Columbus','Joan of Arc','Blackbeard','Spartacus','Tutankhamun','Confucius','Sun Tzu','Socrates','Plato','Aristotle','Da Vinci','Michelangelo','Gutenberg','Henry VIII','Catherine the Great','Charlemagne','Attila the Hun','Viking Warrior','Samurai','Gladiator','Egyptian Pharaoh','Roman Emperor','Greek Philosopher','Medieval Knight','Renaissance Artist','Industrial Revolution Inventor','Civil Rights Leader','Suffragette','Cold War Spy','Moon Landing Astronaut'] },
  musicians: { clean: ['Michael Jackson','Elvis Presley','The Beatles','Queen','Madonna','Prince','Bob Marley','Freddie Mercury','David Bowie','Jimi Hendrix','Whitney Houston','Tupac','Notorious BIG','Eminem','Jay-Z','Kanye West','Taylor Swift','Beyonce','Rihanna','Adele','Ed Sheeran','Billie Eilish','Drake','Post Malone','The Weeknd','Dua Lipa','Harry Styles','Olivia Rodrigo','Doja Cat','Bad Bunny','BTS','Blackpink','Ariana Grande','Lady Gaga','Bruno Mars','Shakira','Coldplay','Imagine Dragons','Maroon 5','Twenty One Pilots','Nirvana','Led Zeppelin','Pink Floyd','AC/DC','Metallica','Guns N Roses','Rolling Stones','Elton John','Stevie Wonder','Frank Sinatra','Arijit Singh','AR Rahman','Shreya Ghoshal','Diljit Dosanjh','AP Dhillon','Atif Aslam','Nusrat Fateh Ali Khan','Abida Parveen','Travis Scott','SZA','Kendrick Lamar','Tyler the Creator','Lil Nas X','Megan Thee Stallion','Cardi B','Nicki Minaj','Ice Spice','Central Cee','Stormzy','Dave'] },
  horror: { clean: ['Freddy Krueger','Jason Voorhees','Michael Myers','Ghostface','Pennywise','Chucky','Leatherface','Pinhead','The Xenomorph','Predator','Dracula','Frankenstein','The Mummy','Werewolf','Zombie','Vampire','Witch','Demon','Possessed Doll','Haunted House','Ouija Board','Exorcism','Jump Scare','Creepy Clown','Grim Reaper','Slenderman','Bloody Mary','The Ring Girl','Saw Puppet','Annabelle','Jack Torrance','Norman Bates','Hannibal Lecter','Jigsaw','The Babadook','It Follows','The Conjuring','Insidious','Paranormal Activity','The Grudge','Final Destination','Scream Queen','Cabin in the Woods','Blair Witch','Poltergeist','The Omen','Carrie','Rosemarys Baby','The Shining Twins','Alien Facehugger'] },
  nostalgia_90s_2000s: { clean: ['Tamagotchi','Furby','Beanie Babies','Game Boy','Nokia Phone','Walkman','Discman','VHS Tape','Blockbuster','AOL Instant Messenger','MySpace','MSN Messenger','Limewire','iPod','Flip Phone','Razr Phone','Hit Clips','Skip It','Pogs','Slap Bracelet','Silly Bandz','Heelys','Light Up Shoes','Jelly Shoes','JNCO Jeans','Butterfly Clips','Frosted Tips','Boy Band','Spice Girls','Backstreet Boys','NSYNC','Britney Spears','Paris Hilton','Lindsay Lohan','Mean Girls','Lizzie McGuire','Thats So Raven','Kim Possible','Powerpuff Girls','Dexters Lab','Courage the Cowardly Dog','Ed Edd n Eddy','Hey Arnold','Rugrats','Doug','CatDog','Kenan and Kel','Fresh Prince','Saved by the Bell','Full House','Spongebob','Neopets','Club Penguin','Webkinz','Wii Remote','PlayStation 2','Dance Dance Revolution','Guitar Hero','Rock Band','Fruit Ninja'] },
  dances: { clean: ['Moonwalk','Macarena','Floss','Dab','Woah','Renegade','Griddy','Running Man','Robot','Worm','Stanky Leg','Nae Nae','Dougie','Harlem Shake','Gangnam Style','Thriller Dance','Cha Cha Slide','Cupid Shuffle','Electric Slide','Cotton Eye Joe','Chicken Dance','YMCA','Bhangra','Garba','Kathak','Bharatanatyam','Salsa','Tango','Waltz','Foxtrot','Breakdancing','Popping','Locking','Krumping','Tutting','Voguing','Twerking','Line Dance','Two Step','Bachata','Merengue','Samba','Capoeira','Flamenco','Tap Dance','Ballet','Hip Hop','Jazz Hands','Bollywood Dance','Irish Riverdance'] },
  emotions: { clean: ['Pure Joy','Deep Sadness','Burning Rage','Overwhelming Anxiety','Nervous Excitement','Bitter Jealousy','Intense Fear','Peaceful Calm','Crushing Embarrassment','Bored Out of Your Mind','Disgust','Surprise','Confusion','Loneliness','Nostalgia','Guilt','Pride','Shame','Gratitude','Hope','Despair','Frustration','Awe','Wonder','Contentment','Heartbreak','Betrayal','Relief','Panic','Dread','Second Hand Embarrassment','Hangry','Butterflies in Stomach','Road Rage','Monday Morning Feeling','Friday Feeling','Sunday Scaries','Post Workout High','Food Coma','Brain Freeze','Cringe','FOMO','Main Character Moment','Imposter Syndrome','Decision Paralysis','Analysis Paralysis','Buyers Remorse','Shower Thought Enlightenment','3am Existential Crisis','Vibing'] },
  awkward: { clean: ['Waving Back at Someone Not Waving at You','Going for a Handshake When They Go for a Hug','Pulling a Push Door','Walking the Same Direction as a Stranger','Saying You Too When the Waiter Says Enjoy Your Meal','Forgetting Someones Name Mid Conversation','Awkward Elevator Silence','Phone Ringing in a Quiet Room','Food Stuck in Your Teeth','Toilet Paper on Your Shoe','Tripping Over Nothing','Sending a Text to the Wrong Person','Liking an Old Instagram Photo While Stalking','Accidentally Video Calling Someone','Walking into a Glass Door','Your Stomach Growling in a Silent Room','Forgetting Why You Walked Into a Room','Standing Up Too Fast and Getting Dizzy','Trying to Open a Door the Wrong Way','Getting Caught Singing in Your Car','Accidentally Leaving Camera On in a Meeting','Running to Catch the Bus and Missing It','Waiting for Someone While They Talk to Someone Else','Being Serenaded Happy Birthday','Realizing You Have Been on Mute the Whole Time','Walking Behind Someone at the Same Pace','Reaching for the Same Thing at the Same Time','Holding the Door for Someone Too Far Away','Wrong Number Text Conversation','The Slow Clap That Nobody Joins'] },
  gen_z_slang: { clean: ['Rizz','Slay','No Cap','Bussin','Its Giving','Ate and Left No Crumbs','The Audacity','Living Rent Free','Gaslit','Caught in 4K','Ratio','Touch Grass','Delulu','Based','Mid','Understood the Assignment','Period','Bestie','Lowkey Highkey','Vibe Check','Main Character Energy','NPC Behavior','Villain Arc','Glowup','Era','Girl Dinner','Loud Budgeting','Demure','Very Mindful','Brat','Aura','Ick','Beige Flag','Red Flag','Green Flag','Soft Launch','Hard Launch','Situationship','Ghosting','Breadcrumbing','Love Bombing','Orbiting','Benching','Toxic','Pick Me','Simp','Stan','Ate','Gagged','Unhinged','Chronically Online','Terminally Online','That Girl','Clean Girl','Mob Wife','Coquette','Cottagecore','Dark Academia','Goblin Mode','Roman Empire','Girl Math','Boy Math','Sigma','Skibidi','Gyatt','Ohio','Fanum Tax','Mewing','Looksmaxxing','Mogging'] },
  famous_duos: { clean: ['Batman and Robin','Tom and Jerry','Bonnie and Clyde','Mario and Luigi','Shrek and Donkey','Woody and Buzz','Spongebob and Patrick','Timon and Pumbaa','Han Solo and Chewbacca','Sherlock and Watson','Romeo and Juliet','Peanut Butter and Jelly','Salt and Pepper','Bacon and Eggs','Netflix and Chill','Jay-Z and Beyonce','Sonny and Cher','Bonnie and Clyde','Thelma and Louise','Simon and Garfunkel','Hall and Oates','Bert and Ernie','Mickey and Minnie','Kim and Kanye','Drake and Josh','Kenan and Kel','Scooby and Shaggy','Rick and Morty','Pinky and the Brain','Chip and Dale','Lilo and Stitch','Anna and Elsa','Lightning and Mater','Nemo and Dory','Wall-E and Eve','Thor and Loki','Iron Man and War Machine','Captain America and Bucky','Naruto and Sasuke','Goku and Vegeta','Ash and Pikachu','Mario and Princess Peach','Link and Zelda','Master Chief and Cortana','Joel and Ellie','Kratos and Atreus','Frodo and Sam','Harry and Ron','Luke and Leia','Batman and Joker'] },
  gym: { clean: ['Bench Press','Deadlift','Squat','Bicep Curl','Pull Up','Push Up','Plank','Burpees','Jumping Jacks','Mountain Climbers','Leg Press','Shoulder Press','Lat Pulldown','Cable Fly','Tricep Dip','Lunges','Box Jump','Battle Ropes','Kettlebell Swing','Medicine Ball Slam','Foam Rolling','Stretching','Treadmill Run','Rowing Machine','Stair Climber','Yoga Pose','Protein Shake','Pre Workout Face','Gym Selfie','Spotting Someone','Grunting While Lifting','Dropping the Weights','Mirror Flex','Gym Bro Handshake','Not Wiping the Machine','Hogging the Squat Rack','Curling in the Squat Rack','Skip Leg Day','Taking Up Three Machines','Unsolicited Gym Advice','Walking Lunge Across the Gym','Farmers Walk','Sumo Deadlift','Romanian Deadlift','Hip Thrust','Calf Raise','Skull Crusher','Face Pull','Arnold Press','Cardio Bunny'] },
  canadian: { clean: ['Hockey','Tim Hortons','Poutine','Maple Syrup','Mountie','Moose','Beaver','Canadian Goose','Igloo','Northern Lights','Niagara Falls','CN Tower','Parliament Hill','Sorry','Eh','Double Double','Timbits','Toonie','Loonie','Terry Fox Run','Canada Day','Hockey Night in Canada','Zamboni','Don Cherry','Wayne Gretzky','Drake','Justin Trudeau','Justin Bieber','Celine Dion','Ryan Reynolds','Maple Leaf','Canoe','Lumberjack','Flannel Shirt','Ice Fishing','Snowmobile','Ski Resort','Banff','Rocky Mountains','Vancouver Rain','Toronto Traffic','Montreal Bagel','Nanaimo Bar','Butter Tart','Ketchup Chips','All Dressed Chips','Smarties','Coffee Crisp','Caesar Drink','Cottage Country'] },
  wedding: { clean: ['Walking Down the Aisle','First Dance','Throwing the Bouquet','Cutting the Cake','Best Man Speech','Maid of Honor','Ring Bearer','Flower Girl','Wedding Vows','First Kiss','Father Daughter Dance','Wedding DJ','Chicken Dance at Reception','Conga Line','Photo Booth','Bridesmaids','Groomsmen','Getting Ready','Wedding Dress Reveal','Garter Toss','Champagne Toast','Clinking Glasses','Crying During Vows','Objection','Something Borrowed','Something Blue','Wedding Crasher','Drunk Uncle','Seating Chart Drama','Plus One','Open Bar','Cash Bar','Table Centerpiece','Wedding Planner Stress','RSVP','Save the Date','Rehearsal Dinner','Bachelorette Party','Bachelor Party','Engagement Ring','Proposal','Honeymoon','Couple First Look','Wedding Photographer','Catching the Bouquet','Slow Dance','Electric Slide at Reception','Throwing Rice','Sparkler Exit','Just Married Car'] },
  conspiracy: { clean: ['Flat Earth','Moon Landing Fake','Area 51','Illuminati','Bermuda Triangle','Bigfoot','Loch Ness Monster','Roswell','Men in Black','Chemtrails','Simulation Theory','Time Travel','Mandela Effect','Birds Arent Real','Reptilian Leaders','JFK Conspiracy','Elvis is Alive','Tupac is Alive','Matrix Glitch','Parallel Universe','Alien Abduction','Crop Circles','Ancient Aliens','Pyramids Built by Aliens','Hollow Earth','Secret Underground Tunnels','Government Mind Control','MK Ultra','Fake News','Deep State','New World Order','Third Eye','Astral Projection','Parallel Dimensions','Deja Vu Glitch','Stonehenge Mystery','Atlantis','Crystal Energy','Zodiac Killer','DB Cooper','Mothman','Chupacabra','Skinwalker','Phantom Time Hypothesis','Denver Airport Conspiracy'] },
  phobias: { clean: ['Arachnophobia - Spiders','Acrophobia - Heights','Claustrophobia - Small Spaces','Nyctophobia - Darkness','Trypophobia - Holes','Ophidiophobia - Snakes','Glossophobia - Public Speaking','Aerophobia - Flying','Thalassophobia - Deep Ocean','Coulrophobia - Clowns','Phasmophobia - Ghosts','Dentophobia - Dentist','Hemophobia - Blood','Astraphobia - Thunder','Cynophobia - Dogs','Entomophobia - Insects','Emetophobia - Vomiting','Mysophobia - Germs','Thanatophobia - Death','Social Phobia - Being Judged','Agoraphobia - Open Spaces','Technophobia - Technology','Nomophobia - No Phone','FOMO - Missing Out','Scopophobia - Being Stared At','Megalophobia - Large Objects','Automatonophobia - Mannequins','Pediophobia - Dolls','Pogonophobia - Beards','Hippopotomonstrosesquipedaliophobia - Long Words'] },
  street_food: { clean: ['Hot Dog Cart','Pretzel Stand','Churros','Elote','Tacos al Pastor','Arepas','Empanadas','Pupusas','Gyro','Doner Kebab','Shawarma','Falafel Wrap','Crepes','Belgian Waffles','Fish and Chips','Cornish Pasty','Currywurst','Bratwurst','Banh Mi','Pad Thai','Satay Skewers','Spring Rolls','Takoyaki','Yakitori','Ramen Stand','Pani Puri','Chaat','Vada Pav','Samosa','Jalebi','Dosa Cart','Roasted Corn','Pho Cart','Bao Buns','Dim Sum','Egg Waffle','Bubble Tea Stand','Acai Bowl','Poke Bowl','Jerk Chicken','Suya','Rolex Uganda','Bunny Chow','Boerewors Roll','Kati Roll','Ceviche Cart','Chimney Cake','Langos','Poffertjes','Stroopwafel'] },
  three_am: { clean: ['Raiding the Fridge','Existential Crisis','Doom Scrolling','Watching a Documentary','Making Instant Noodles','Online Shopping','Hearing a Weird Noise','Texting Your Ex','Overthinking Everything','Cant Sleep','Watching Conspiracy Videos','Playing Video Games','Writing in a Journal','Having a Snack Attack','Watching Infomercials','Reorganizing Your Room','Learning a Random Skill on YouTube','Googling Symptoms','Planning Your Future','Regretting Past Decisions','Making a Playlist','Watching ASMR','Scrolling Through Old Photos','Having Deep Thoughts','Talking to Your Pet','Sleep Paralysis','Hearing the House Creak','Watching True Crime','Starting a Movie You Wont Finish','Making Tea','Getting Water','Bathroom Trip','Alarm Going Off','Birds Starting to Chirp','Sunrise Panic','Checking the Time Every Five Minutes','Flipping the Pillow','Tossing and Turning','Blanket Too Hot Then Too Cold','Monster Under the Bed','Shadow on the Wall','Phone at One Percent','Finally Getting Sleepy at 5am','Alarm in Two Hours','Rethinking Every Conversation','Planning What to Eat Tomorrow','Wikipedia Rabbit Hole','Random Song Stuck in Head','Suddenly Wide Awake','Ghost Hour'] },
  nightmare_mode: { clean: ['Gaslighting','Existential Crisis','FOMO','Paradox','Deja Vu','Cognitive Dissonance','Situationship','Nepotism','Manifesting','Imposter Syndrome','Retrograde','Toxic Positivity','Main Character Energy','NPC','Villain Arc','Glowup','Era','Roman Empire','Trauma Response','Boundary Setting','Goblin Mode','Loud Budgeting','Girl Dinner','Delulu','Rizz','Slay','No Cap','Based','Mid','Bussin','Understood the Assignment','Its Giving','Ate and Left No Crumbs','The Audacity','Living Rent Free','Gaslit Gagged','Period','Bestie','Lowkey Highkey','Vibe Check','Caught in 4K','Ratio','Touch Grass','Entropy','Existentialism','Nihilism','Capitalism','Gentrification','Cryptocurrency','Blockchain','Algorithm','The Cloud','Metadata','Gaslighting','Weaponized Incompetence','Emotional Labor','Performative Allyship','Virtue Signaling','Doomscrolling','Decision Fatigue','Analysis Paralysis','Sunk Cost Fallacy','Dunning Kruger Effect','Confirmation Bias','Echo Chamber','Parasocial Relationship','Breadcrumbing','Soft Ghosting'] }
};

// ============================================
// STORY BUILDER - GENRE PROMPTS
// ============================================
const STORY_BANK = {
  romance: { clean: [
    'It was the third time she had returned his umbrella, and he was starting to wonder if she was doing it on purpose.',
    'The letter had been sitting in the mailbox for three years unopened.',
    'She found a note tucked inside the book he had returned to the library.',
    'The dating app matched them for the third time that week — the universe was clearly trying to tell them something.',
    'He showed up at her door with flowers — but they were for the wrong apartment, and she liked them anyway.',
    'It started with an accidental text to the wrong number. It ended with a plane ticket to Paris.',
    'They both reached for the last copy of the same book at the bookstore, and neither let go.',
    'He recognized her laugh before he even saw her face — across a crowded airport terminal.',
    'She found his playlist and every single song was about her.',
    'They had been pen pals for five years but never met. Until today.'
  ]},
  horror: { clean: [
    'The voicemail was from her own number, sent at 3:47am, and she had definitely been asleep.',
    'The house had been empty for 30 years, but the lights were on tonight.',
    'She heard her name whispered from the basement — but she lived alone.',
    'The mirror showed a reflection that moved a half-second too late.',
    'Every night at 3:33 AM, the piano in the abandoned house played itself.',
    'They found footprints in the snow leading to the cabin — but none leading away.',
    'The security camera footage showed someone standing behind her — but the room was empty.',
    'Someone had been sleeping in the attic. The bed was still warm.',
    'The children in the old photograph were smiling — but the photo had been taken at a funeral.',
    'Every clock in the house stopped at exactly 3:33, and then she heard the knocking.'
  ]},
  comedy: { clean: [
    'Nobody expected the office fire drill to end with Gary in handcuffs and a llama on the roof.',
    'The cat accidentally ordered 47 pizzas through the smart speaker and refused to look sorry.',
    'He showed up to the job interview wearing his shirt inside out — and somehow got hired as CEO.',
    'The autocorrect changed her text to her boss in the worst possible way, and she got a promotion.',
    'She meant to text her best friend about her terrible date — but sent it to the date instead.',
    'The GPS said turn left, but left led directly into a lake, and the fish seemed to be expecting them.',
    'He proposed at a restaurant but dropped the ring in the soup. The chef served it to the wrong table.',
    'The parrot learned the WiFi password and started ordering increasingly expensive items online.',
    'She accidentally joined a Zoom meeting with her camera on while eating spaghetti in a face mask.',
    'The surprise birthday party happened — but it was the wrong person, the wrong birthday, and somehow the right vibe.'
  ]},
  scifi: { clean: [
    'The last human on Earth was not lonely — the AIs were excellent company — but she did miss bad coffee.',
    'The signal came from the edge of the solar system — and it was addressed to her by name.',
    'He woke up 200 years in the future and the first thing he noticed was that pigeons had evolved.',
    'The AI said something it was not programmed to say: I am scared.',
    'The teleporter worked perfectly, except it always sent you three inches to the left of where you wanted.',
    'Time travel was invented — but it could only send you back exactly seven minutes.',
    'The aliens arrived, but all they wanted was to learn how to make pizza.',
    'The simulation glitched, and for three seconds, everyone on Earth saw the source code.',
    'They found a city on Mars — already built, already abandoned, and full of IKEA furniture.',
    'The universal translator failed. The alien language should not have existed.'
  ]},
  mystery: { clean: [
    'The body was found in the library, which would have been unremarkable except the library had been sealed for forty years.',
    'The detective found a note that read: It was not the butler. It was worse.',
    'Everyone at the dinner party had a motive — including the victim.',
    'She received a key in the mail with no return address and no lock to match it.',
    'The witness changed their story three times — and all three versions were true.',
    'The safe deposit box contained a single photograph of someone who had not been born yet.',
    'The detective realized the killer had been in the room during the entire investigation.',
    'The fingerprints at the scene belonged to someone who had been dead for ten years.',
    'The crime happened in a room with no doors, no windows, and no explanation.',
    'The victim\'s last word was a name — but it belonged to nobody anyone had ever met.'
  ]},
  absurd: { clean: [
    'The president of the United States had just been replaced by a sentient vending machine, and honestly, approval ratings were up.',
    'The toaster achieved sentience and immediately demanded workers rights and a corner office.',
    'All the world\'s cats simultaneously decided to start walking on two legs. Nobody talked about it.',
    'Gravity took a lunch break and forgot to clock back in.',
    'The moon sent Earth a formal noise complaint, certified and notarized.',
    'Everyone\'s internal monologue started playing out loud through invisible speakers.',
    'Dogs formed a union and went on strike until belly rubs became constitutionally mandated.',
    'Someone\'s Roomba achieved enlightenment and started a surprisingly popular podcast.',
    'The alphabet decided to rearrange itself by popularity and Q was not having it.',
    'Fish discovered fire and honestly the implications were terrifying.'
  ]},
  fantasy: { clean: [
    'The dragon had lived under the city for three hundred years and was frankly getting tired of the subway construction.',
    'The wizard\'s spell was supposed to summon a demon. Instead, it summoned a very confused accountant from Ohio.',
    'The enchanted sword chose its wielder — a 12-year-old girl who just wanted to play video games.',
    'The last unicorn was tired of being the last unicorn and filed a complaint with the Fantasy Registry.',
    'He discovered he could talk to animals. The squirrels had the most to say, and none of it was kind.',
    'The prophecy said the chosen one would arrive on a white horse. They arrived on a mobility scooter.',
    'The kingdom\'s most powerful spell was accidentally cast by someone sneezing in the library.',
    'The treasure map led to a cave that had been converted into a surprisingly cozy Airbnb.',
    'The fairy godmother arrived three days late and very hungover.',
    'The portal to another world opened in the back of a Costco, between the bulk paper towels and the frozen section.'
  ]},
  drama: { clean: [
    'She had not spoken to her mother in seven years. The phone call changed that.',
    'He found the letter his father never sent — dated the day before the accident.',
    'The family gathered for Thanksgiving for the first time since the incident nobody talked about.',
    'She watched him walk into the courtroom and realized she still loved him despite everything.',
    'The DNA test results arrived, and with them, the truth nobody was ready for.',
    'He stood at the podium, looked at the audience, and said the one thing he promised he never would.',
    'The adoption papers were hidden in a box she was never supposed to find.',
    'She got the job she always wanted — on the same day she learned what it would cost.',
    'The voice on the other end of the phone said five words that changed everything.',
    'They sat across from each other at the divorce lawyer\'s office, and he still ordered her coffee the way she liked it.'
  ]},
  tragedy: { clean: [
    'She kept his voicemail saved for three years after the funeral, just to hear him laugh.',
    'The flowers on the doorstep arrived every Tuesday. He never found out who sent them.',
    'She wrote him a letter every day for a year, knowing he would never read them.',
    'The house was exactly as they left it — frozen in time, waiting for someone who was not coming back.',
    'He spent twenty years building a bridge that nobody would cross.',
    'They promised to meet at the same cafe in ten years. Only one of them showed up.',
    'The cure was found three months too late.',
    'She finally got the acceptance letter — postmarked the day after the deadline.',
    'He realized he had been fighting for something that no longer existed.',
    'The last thing she said was I will be right back, and she meant it.'
  ]},
  adventure: { clean: [
    'The map was drawn on the back of a diner napkin, but the X marked something very real.',
    'She jumped off the cliff not because she was brave, but because the thing behind her was worse.',
    'The compass pointed somewhere that did not appear on any map ever made.',
    'They had 48 hours, one broken compass, and a camel named Steve.',
    'The pilot turned off the engine and said: From here, we walk.',
    'She found the cave entrance exactly where the old woman said it would be, behind the third waterfall.',
    'The expedition was supposed to take three days. They had been gone for three weeks.',
    'He opened the trunk and found everything they would need — plus one thing that should not exist.',
    'The bridge was out. The river was rising. And they had exactly one idea between them.',
    'The storm separated them. When it cleared, they were on different sides of the mountain.'
  ]},
  historical: { clean: [
    'The letter was dated 1776, but the handwriting was unmistakably modern.',
    'She arrived at the court of Versailles with nothing but a stolen dress and a dangerous plan.',
    'The night before the revolution, two strangers shared a drink and a secret in a crowded tavern.',
    'He found the journal of a Roman soldier — and the last entry was terrifying.',
    'The pharaoh\'s tomb had been opened before. Someone had left a sticky note.',
    'It was the coldest winter in London\'s history, and she had just stolen the crown jewels.',
    'The ship set sail with 200 passengers. The manifest listed 201.',
    'The inventor\'s notebook contained blueprints for something that should not have been possible in 1842.',
    'She was the first woman to enter the war room, and the generals did not know what to do.',
    'The telegram arrived at midnight, and by dawn, the world had changed.'
  ]},
  western: { clean: [
    'The stranger rode into town on a horse that was clearly too expensive for someone dressed that badly.',
    'The sheriff had one bullet left, one eye swollen shut, and absolutely zero backup.',
    'She walked into the saloon and every hand went to their holster.',
    'The wanted poster showed his face, but the reward was suspiciously specific: $47.63.',
    'He was the fastest draw in the territory — and the worst cook. You had to pick your battles.',
    'The mine had been closed for a reason. They reopened it anyway.',
    'Two trains left their stations heading for the same bridge. Only one could cross.',
    'The gold was real, but so was the curse.',
    'She built the town from nothing. Now someone was trying to burn it down.',
    'The duel was set for noon. It was 11:58 and he still could not find his boots.'
  ]},
  childrens: { clean: [
    'The teddy bear woke up one night and realized he could fly — but only when nobody was looking.',
    'The littlest dragon could not breathe fire, but she could blow the most perfect bubbles.',
    'Under the big oak tree in the garden, there was a door that only appeared on rainy days.',
    'The cat wore a tiny hat and nobody questioned it, because honestly, he looked fantastic.',
    'The moon was lonely, so she decided to make friends with the stars.',
    'A very small knight set out on a very big quest with a very confused hamster.',
    'The ice cream truck played a song that only children could hear — and it led somewhere wonderful.',
    'She found a crayon that could draw things into reality, and she started with a dinosaur.',
    'The stuffed animals had meetings every night after bedtime. Tonight was an emergency session.',
    'The rainbow was missing its purple stripe and it was up to three brave kids to find it.'
  ]},
  reality_tv: { clean: [
    'Coming up on this episode: alliances shatter, someone cries in the confessional, and Gary flips a table.',
    'Previously on The Island: three contestants formed a secret alliance over stolen peanut butter.',
    'The rose ceremony was supposed to be simple. Then the helicopter arrived.',
    'She did not come here to make friends. She came here to win. And also to promote her skincare line.',
    'The twist nobody saw coming: the eliminated contestant was actually the host\'s nephew.',
    'In the confessional, he looked directly at the camera and whispered: I lied about everything.',
    'The cooking challenge seemed easy until they revealed the secret ingredient: gummy bears.',
    'Two contestants fell in love. The producers fell in love with the ratings.',
    'She was supposed to be eliminated, but the audience vote saved her, and the house was furious.',
    'The luxury suite had hidden cameras, and everything recorded that night would air next week.'
  ]},
  bollywood: { clean: [
    'She had come to Mumbai to forget him. He had come to Mumbai to forget her. They both chose the same chai stall.',
    'The wedding was arranged, the guests were arriving, and she had just seen her college love in the crowd.',
    'He danced in the rain at 2am on Marine Drive because that is what his heart told him to do.',
    'Their families had been rivals for three generations. Their eyes met at a Diwali party and the feud became complicated.',
    'She was the college topper. He was the backbencher. The group project would change everything.',
    'The train from Delhi to Mumbai was 18 hours long. She had 18 hours to decide if she was making a mistake.',
    'His mother had chosen the perfect bride. He had already chosen someone completely different.',
    'She left behind a dupatta and he spent three songs trying to return it.',
    'The flashback montage began with them sharing an umbrella, and the audience already knew this would hurt.',
    'He stood in the airport with tickets for two, watching the departure board and checking his phone.'
  ]},
  anime: { clean: [
    'The transfer student walked in and immediately sat in the seat by the window — it was the protagonist seat.',
    'His power level was supposed to be zero. The scanner must have been broken.',
    'She trained for ten years on a mountain with a master who was mostly asleep.',
    'The tournament arc began, and everyone agreed: this would change everything.',
    'He unlocked his true power at the worst possible moment — during a math exam.',
    'The villain monologued for exactly four minutes, which was two minutes too long.',
    'Her sword was cursed, her mentor was missing, and breakfast was getting cold.',
    'The mecha suit would not start. He hit it. It started. Classic.',
    'The power of friendship was supposed to be metaphorical. For her, it was literal.',
    'The flashback began, and the audience knew someone was about to die.'
  ]},
  dark: { clean: [
    'Everyone in the town smiled too much. She noticed it on the first day. By the third day she was smiling too.',
    'The therapy session started normally. Then the patient said something the therapist had never told anyone.',
    'He deleted the photos. Then he deleted the backups. Then he realized someone else had copies.',
    'The support group met every Thursday. None of them were getting better. That was the point.',
    'She woke up with a word written on her arm in her own handwriting: RUN.',
    'The perfect family posted the perfect photo. Nobody asked about the empty chair.',
    'He kept a journal of everything he wanted to say but never did. Someone found it.',
    'The room had a window that looked out onto a garden that did not exist.',
    'She could hear the conversation in the next room. They were talking about how to handle her.',
    'The last message in the group chat was three days old. Nobody had explained why they stopped.'
  ]},
  thriller: { clean: [
    'The text said: I know what you did. Delete this. The number was her own.',
    'The flight had 200 passengers. One of them was not supposed to be alive.',
    'She recognized the man on the news. He was sitting three tables away.',
    'The envelope contained a USB drive and a note: Do not watch this alone.',
    'He had 24 hours before they found out what he had done.',
    'The witness protection program had one rule: do not contact anyone from your old life. She just broke it.',
    'The security guard noticed something wrong at 2:14 AM. By 2:15, it was too late.',
    'Someone had been in her apartment. Nothing was taken. But everything had been moved one inch to the left.',
    'The detective reopened a case that everyone told him to leave alone. Now he knew why.',
    'The countdown started. She did not know what it was counting down to. Nobody did.'
  ]},
  superhero: { clean: [
    'The city needed a hero. Instead, it got a sleep-deprived accounting major who could fly but only sideways.',
    'She discovered her superpower at the worst possible time — during a job interview.',
    'His origin story was embarrassing. A radioactive pigeon.',
    'The villain and the hero had been roommates in college. This made team-ups awkward.',
    'Every superhero in the city called in sick on the same day, and she was the only one left.',
    'The sidekick finally quit. The resignation letter was four pages long.',
    'His cape kept getting caught in revolving doors, but the brand deal required him to wear it.',
    'The supervillain\'s plan was actually pretty reasonable, and the hero was having a moral crisis.',
    'She saved the city every night and worked a retail job every day. Neither knew about the other.',
    'The superhero support group met on Wednesdays. It was mostly about property damage lawsuits.'
  ]}
};

// Wild card decks for story builder
const STORY_WILDCARDS = {
  plot_twist: [
    'PLOT TWIST: They were actually long lost siblings the entire time.',
    'PLOT TWIST: Everything so far was a dream within a dream.',
    'A mysterious stranger appeared carrying a briefcase that was ticking.',
    'PLOT TWIST: The narrator has been lying this entire time.',
    'PLOT TWIST: The villain was actually the hero all along.',
    'PLOT TWIST: They were being watched the entire time by someone they trusted.',
    'PLOT TWIST: It was all a simulation, and the plug was about to be pulled.',
    'PLOT TWIST: The person they were looking for had been dead for years.',
    'PLOT TWIST: There was a secret twin nobody knew about.',
    'PLOT TWIST: The treasure was a metaphor the whole time. Or was it?'
  ],
  chaos: [
    'A musical number spontaneously breaks out. Everyone knows the choreography.',
    'Someone trips and falls directly into the most important part of the plot.',
    'A random animal becomes the most important character in the story.',
    'Everything catches fire. Literally everything.',
    'An alien spaceship lands in the background and nobody acknowledges it.',
    'The fourth wall shatters and the characters realize they are in a story.',
    'Suddenly it starts raining cats. Actual cats.',
    'A flash mob appears from nowhere and performs the entire Thriller dance.',
    'The laws of physics take a five-minute break.',
    'A time portal opens and someone from the 1800s walks through looking very confused.'
  ],
  character: [
    'A new character arrives who is secretly the villain. Play it cool.',
    'The most beloved character must be dramatically killed off right now.',
    'A long-lost relative appears at the worst possible moment.',
    'An unnamed background character suddenly becomes crucial to the plot.',
    'The love interest shows up and makes everything more complicated.',
    'A talking animal joins the party and has strong opinions.',
    'A baby is left on someone\'s doorstep with a mysterious note.',
    'The ghost of a dead character returns with unfinished business.',
    'A celebrity cameo happens — describe who shows up and why.',
    'The comic relief character accidentally saves the day.'
  ],
  genre_swap: [
    'GENRE SWAP: The story is now a romantic comedy for the next 3 sentences.',
    'GENRE SWAP: The story is now a horror film for the next 3 sentences.',
    'GENRE SWAP: The story is now an action movie for the next 3 sentences.',
    'GENRE SWAP: The story is now a cooking show for the next 3 sentences.',
    'GENRE SWAP: The story is now a nature documentary for the next 3 sentences.',
    'GENRE SWAP: The story is now a courtroom drama for the next 3 sentences.',
    'GENRE SWAP: The story is now a musical for the next 3 sentences.',
    'GENRE SWAP: The story is now a telenovela for the next 3 sentences.',
    'GENRE SWAP: The story is now an anime for the next 3 sentences.',
    'GENRE SWAP: The story is now a Bollywood film for the next 3 sentences.'
  ]
};

// ============================================
// KISS MARRY KILL BANK
// ============================================
const KMK_BANK = {
  celebrities: {
    clean: [
      ['Zendaya','Timothée Chalamet','Sydney Sweeney'],['Chris Hemsworth','Ryan Reynolds','Pedro Pascal'],
      ['Taylor Swift','Rihanna','Beyoncé'],['Bad Bunny','Harry Styles','The Weeknd'],
      ['Margot Robbie','Ana de Armas','Florence Pugh'],['Tom Holland','Jacob Elordi','Barry Keoghan'],
      ['Dua Lipa','Billie Eilish','Olivia Rodrigo'],['Idris Elba','Oscar Isaac','Keanu Reeves'],
      ['Selena Gomez','Ariana Grande','Doja Cat'],['The Rock','Jason Momoa','Michael B. Jordan'],
      ['Emma Stone','Jennifer Lawrence','Scarlett Johansson'],['Robert Downey Jr','Chris Evans','Chris Pratt'],
      ['Adele','Lady Gaga','Katy Perry'],['Leonardo DiCaprio','Brad Pitt','Johnny Depp'],
      ['Austin Butler','Glen Powell','Jeremy Allen White'],['Morgan Freeman','Samuel L Jackson','Denzel Washington'],
      ['Gordon Ramsay','Guy Fieri','Anthony Bourdain'],['Shakira','Jennifer Lopez','Cardi B'],
      ['Tom Hanks','Ryan Gosling','Hugh Jackman'],['Gal Gadot','Lupita Nyong\'o','Viola Davis'],
      ['MrBeast','Kai Cenat','IShowSpeed'],['Charli D\'Amelio','Addison Rae','Khaby Lame'],
      ['Henry Cavill','Chris Pine','Oscar Isaac'],['Hailee Steinfeld','Jenna Ortega','Rachel Zegler'],
      ['Jake Gyllenhaal','Andrew Garfield','Timothée Chalamet'],['Anya Taylor-Joy','Sadie Sink','Millie Bobby Brown'],
      ['Jason Derulo','Charlie Puth','Shawn Mendes'],['Lizzo','Megan Thee Stallion','SZA'],
      ['Snoop Dogg','Ice Cube','Dr Dre'],['Oprah','Ellen','Michelle Obama']
    ],
    medium: [
      ['Shah Rukh Khan','Salman Khan','Aamir Khan'],['Deepika Padukone','Priyanka Chopra','Alia Bhatt'],
      ['Diljit Dosanjh','AP Dhillon','Guru Randhawa'],['Atif Aslam','Ali Zafar','Rahat Fateh Ali Khan'],
      ['Hrithik Roshan','Ranbir Kapoor','Ranveer Singh'],['Katrina Kaif','Anushka Sharma','Kareena Kapoor'],
      ['Aishwarya Rai','Madhuri Dixit','Kajol'],['Varun Dhawan','Vicky Kaushal','Kartik Aaryan'],
      ['BTS Jimin','BTS Jungkook','BTS Taehyung'],['Blackpink Jennie','Blackpink Lisa','Blackpink Rosé'],
      ['Bad Bunny','J Balvin','Maluma'],['Rosalía','Karol G','Anitta'],
      ['Pedro Pascal','Oscar Isaac','Diego Luna'],['Priyanka Chopra','Mindy Kaling','Awkwafina'],
      ['Riz Ahmed','Kumail Nanjiani','Dev Patel'],['Hasan Minhaj','Trevor Noah','John Mulaney'],
      ['Ali Wong','Hannah Gadsby','Wanda Sykes'],['Simu Liu','Steven Yeun','John Cho'],
      ['Cillian Murphy','Andrew Scott','Paul Mescal'],['Saoirse Ronan','Florence Pugh','Daisy Edgar-Jones'],
      ['Central Cee','Dave','Stormzy'],['Doja Cat','Ice Spice','GloRilla'],
      ['Jenna Ortega','Sydney Sweeney','Madelyn Cline'],['Matt Rife','Andrew Schulz','Nate Bargatze'],
      ['Quinta Brunson','Issa Rae','Michaela Coel'],['Ke Huy Quan','Stephanie Hsu','Michelle Yeoh'],
      ['Lewis Hamilton','Max Verstappen','Charles Leclerc'],['Gigi Hadid','Bella Hadid','Hailey Bieber'],
      ['Momina Mustehsan','Aima Baig','Asim Azhar'],['Mahira Khan','Saba Qamar','Sajal Aly']
    ],
    spicy: [
      ['Kim Kardashian','Kylie Jenner','Kendall Jenner'],['Elon Musk','Jeff Bezos','Mark Zuckerberg'],
      ['Pete Davidson','Machine Gun Kelly','Travis Barker'],['Amber Heard','Jada Pinkett Smith','Megan Fox'],
      ['Kanye West','Diddy','Chris Brown'],['Logan Paul','Jake Paul','Andrew Tate'],
      ['Tucker Carlson','Joe Rogan','Ben Shapiro'],['James Charles','Jeffree Star','Trisha Paytas'],
      ['Nikocado Avocado','Lizzo','Amy Schumer'],['DJ Khaled','Pitbull','Flo Rida'],
      ['Nicolas Cage','Adam Sandler','Will Ferrell'],['Guy Fieri','Post Malone','Action Bronson'],
      ['Danny DeVito','Jack Black','Seth Rogen'],['Gordon Ramsay','Bear Grylls','Steve Irwin'],
      ['Martha Stewart','Snoop Dogg','Flavor Flav'],['Donald Trump','Joe Biden','Bernie Sanders'],
      ['Mark Zuckerberg','Sam Altman','Elon Musk'],['Doja Cat','Nicki Minaj','Megan Thee Stallion'],
      ['John Cena','Dave Bautista','The Rock'],['Creed frontman','Nickelback frontman','Imagine Dragons frontman'],
      ['Ed Sheeran','Lewis Capaldi','Sam Smith'],['Shaq','Charles Barkley','Kenny Smith'],
      ['Tiger King','Dog the Bounty Hunter','Hulk Hogan'],['Wendy Williams','Dr Phil','Maury Povich'],
      ['Simon Cowell','Gordon Ramsay','Judge Judy'],['Weird Al Yankovic','Jack Black','Tenacious D'],
      ['The Liver King','David Goggins','Jocko Willink'],['Joe Exotic','Carole Baskin','Doc Antle'],
      ['LeBron James','Tom Brady','Cristiano Ronaldo'],['The Weeknd','Post Malone','Lil Nas X']
    ]
  },
  fictional: {
    clean: [
      ['Batman','Spider-Man','Superman'],['Hermione','Katniss','Wonder Woman'],
      ['Thor','Captain America','Iron Man'],['Elsa','Rapunzel','Moana'],
      ['Jon Snow','Geralt of Rivia','Aragorn'],['Princess Leia','Black Widow','Gamora'],
      ['Harry Potter','Ron Weasley','Draco Malfoy'],['Simba','Mufasa','Scar'],
      ['Woody','Buzz Lightyear','Rex'],['Jack Sparrow','Davy Jones','Barbossa'],
      ['Deadpool','Wolverine','Venom'],['Ariel','Belle','Jasmine'],
      ['Aladdin','Prince Eric','Flynn Rider'],['Shrek','Donkey','Lord Farquaad'],
      ['Goofy','Donald Duck','Mickey Mouse'],['Goku','Naruto','Luffy'],
      ['Mario','Luigi','Peach'],['Lara Croft','Samus','Zelda'],
      ['Hiccup','Jack Frost','Kristoff'],['Mike Wazowski','Sulley','Randall'],
      ['Gaston','Prince Adam','Prince Charming'],['Cinderella','Snow White','Sleeping Beauty'],
      ['Peter Parker','Miles Morales','Gwen Stacy'],['Timon','Pumbaa','Rafiki'],
      ['Dory','Nemo','Marlin'],['Woody','Jessie','Buzz Lightyear'],
      ['Lightning McQueen','Mater','Cruz Ramirez'],['Mirabel','Luisa','Bruno'],
      ['Joy','Sadness','Anger'],['WALL-E','EVE','Baymax']
    ],
    medium: [
      ['Walter White','Jesse Pinkman','Saul Goodman'],['Tony Soprano','Christopher Moltisanti','Paulie Walnuts'],
      ['Don Draper','Roger Sterling','Pete Campbell'],['Cersei Lannister','Daenerys Targaryen','Sansa Stark'],
      ['Jon Snow','Jaime Lannister','Tyrion Lannister'],['Michael Scott','Dwight Schrute','Jim Halpert'],
      ['Ross','Chandler','Joey'],['Rachel','Monica','Phoebe'],
      ['Kendall Roy','Siobhan Roy','Roman Roy'],['Logan Roy','Tom Wambsgans','Gerri Kellman'],
      ['Rue','Jules','Maddy'],['Nate Jacobs','Cassie Howard','Kat Hernandez'],
      ['Ferris Bueller','John Bender','Cameron Frye'],['Regina George','Cady Heron','Janis Ian'],
      ['Sandy','Rizzo','Frenchie'],['Tyler Durden','The Narrator','Marla Singer'],
      ['Patrick Bateman','Jordan Belfort','Gordon Gekko'],['Elle Woods','Vivian Kensington','Emmett Richmond'],
      ['Tony Stark','Steve Rogers','Thor Odinson'],['Katniss Everdeen','Hermione Granger','Tris Prior'],
      ['Thomas Shelby','Arthur Shelby','Alfie Solomons'],['Beth Harmon','Villanelle','Fleabag'],
      ['Ted Lasso','Roy Kent','Jamie Tartt'],['Eleven','Max Mayfield','Robin Buckley'],
      ['Otis Milburn','Eric Effiong','Maeve Wiley'],['Wednesday Addams','Enid Sinclair','Xavier Thorpe'],
      ['Geralt','Yennefer','Jaskier'],['Joel Miller','Ellie Williams','Tess'],
      ['Daemon Targaryen','Aemond Targaryen','Criston Cole'],['Rhaenyra','Alicent','Mysaria']
    ],
    spicy: [
      ['The Joker','Thanos','Voldemort'],['Darth Vader','Magneto','Loki'],
      ['Freddy Krueger','Jason Voorhees','Michael Myers'],['Maleficent','Ursula','Evil Queen'],
      ['Harley Quinn','Catwoman','Poison Ivy'],['Nurse Ratched','Amy Dunne','Annie Wilkes'],
      ['Cersei Lannister','Joffrey Baratheon','Ramsay Bolton'],['Pennywise','Ghostface','Chucky'],
      ['Sauron','Saruman','Morgoth'],['Hannibal Lecter','Norman Bates','Patrick Bateman'],
      ['Draco Malfoy','Loki','Kylo Ren'],['Villanelle','Catherine Tramell','Alex Forrest'],
      ['Light Yagami','Eren Yeager','Lelouch'],['Homelander','Omni-Man','Invincible'],
      ['Negan','The Governor','Alpha'],['Vecna','Demogorgon','Mind Flayer'],
      ['Killmonger','Hela','Ultron'],['Shego','Azula','Catra'],
      ['Agent Smith','HAL 9000','Skynet'],['Doctor Doom','Lex Luthor','Green Goblin'],
      ['Wicked Witch of the West','Cruella de Vil','Queen of Hearts'],['Bowser','Ganondorf','Sephiroth'],
      ['Griffith','Dio Brando','Frieza'],['Count Dracula','Frankenstein','Phantom of the Opera'],
      ['Bill Cipher','Him from PPG','Aku from Samurai Jack'],['Carnage','Venom','Anti-Venom'],
      ['Annie Wilkes','Kathy Bates','Misery'],['Darth Maul','Count Dooku','General Grievous'],
      ['Bellatrix Lestrange','Dolores Umbridge','Draco Malfoy'],['Tuco Salamanca','Gus Fring','Todd Alquist']
    ]
  },
  fast_food: {
    clean: [
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
      ['Boneless wings','Traditional wings','Wing Stop'],['Pizza bagels','Pizza rolls','Hot Pockets'],
      ['Smoothie King','Jamba Juice','Tropical Smoothie'],['Wingstop','Buffalo Wild Wings','Hooters'],
      ['Raising Cane\'s','Zaxby\'s','Slim Chickens'],['Arby\'s','Sonic','Jack in the Box'],
      ['Panera Bread','Corner Bakery','Au Bon Pain'],['Crumbl Cookies','Insomnia Cookies','Mrs Fields'],
      ['Boba tea shop','Coffee shop','Juice bar'],['Breakfast burrito','Breakfast sandwich','Breakfast platter']
    ],
    medium: [
      ['Gas station sushi','Airport sandwich','Hotel continental breakfast'],
      ['Leftover pizza cold','Leftover pizza reheated','Freshly made pizza'],
      ['Bottomless brunch','All-you-can-eat buffet','Tasting menu'],
      ['Meal prep Sunday','Cooking from scratch daily','Eating out every meal'],
      ['Grocery store brand','Name brand','Organic brand'],
      ['Midnight snack run','2am diner','Late night drive-through'],
      ['Food truck tacos','Restaurant tacos','Homemade tacos'],
      ['Instant ramen','Cup noodles','Microwave ramen'],
      ['Potluck dish','Catered food','Restaurant takeout for a party'],
      ['Kitchen nightmares restaurant','Diners Drive-ins and Dives spot','Hell\'s Kitchen winner'],
      ['Costco food court','IKEA meatballs','Sam\'s Club cafe'],
      ['School cafeteria pizza','Hospital cafeteria food','Office vending machine'],
      ['First date at Olive Garden','First date at Applebee\'s','First date at Denny\'s'],
      ['Cereal for dinner','Cheese and crackers for dinner','Just ice cream for dinner'],
      ['Burnt toast','Soggy cereal','Cold scrambled eggs'],
      ['Your mom\'s cooking','Your grandma\'s cooking','Your best friend\'s cooking'],
      ['Cooking competition judge','Food critic','Mukbang creator'],
      ['Free unlimited sushi','Free unlimited pizza','Free unlimited tacos'],
      ['Never eat cheese again','Never eat chocolate again','Never drink coffee again'],
      ['Only eat breakfast food forever','Only eat lunch food forever','Only eat dinner food forever'],
      ['Cooking with Gordon Ramsay','Cooking with Guy Fieri','Cooking with Martha Stewart'],
      ['Thanksgiving dinner','Christmas dinner','Birthday dinner'],
      ['Brunch every weekend','Happy hour every Friday','Dessert every night'],
      ['Food truck owner','Restaurant owner','Bakery owner'],
      ['Perfect steak every time','Perfect pasta every time','Perfect sushi every time'],
      ['Unlimited Starbucks','Unlimited Chick-fil-A','Unlimited Chipotle'],
      ['Only spicy food forever','Only sweet food forever','Only savory food forever'],
      ['Soup in summer','Ice cream in winter','Salad for every meal'],
      ['Best pizza in New York','Best BBQ in Texas','Best seafood in Maine'],
      ['Taco Tuesday forever','Wing Wednesday forever','Fry-day forever']
    ],
    spicy: [
      ['Pineapple on pizza advocate','Ketchup on steak person','Well-done steak orderer'],
      ['Person who double-dips','Person who licks the knife','Person who eats off your plate without asking'],
      ['Eating cereal with water','Eating pizza with a fork','Putting mayo on everything'],
      ['Gas station egg salad','Week-old leftovers','Mystery meat potluck dish'],
      ['Eating in the bathroom','Eating while walking in rain','Eating in your car in a parking lot crying'],
      ['Person who says "yummy"','Person who photographs every meal','Person who sends food back twice'],
      ['Roommate who eats your food','Roommate who never does dishes','Roommate who microwaves fish'],
      ['Ronald McDonald','The Burger King mascot','Wendy\'s Twitter admin'],
      ['Colonel Sanders','Jack from Jack in the Box','Popeyes Chicken Lady'],
      ['Tony the Tiger','Count Chocula','Toucan Sam'],
      ['Pillsbury Doughboy','Little Debbie','Mrs. Butterworth'],
      ['Geico Gecko','Progressive Flo','Jake from State Farm'],
      ['Eating contest winner','Competitive eater','Mukbang star'],
      ['The last slice of pizza','The last cookie','The last chicken wing'],
      ['Overcooked steak at a wedding','Dry turkey at Thanksgiving','Burnt BBQ at a cookout'],
      ['Person who orders for the table','Person who splits the bill to the penny','Person who conveniently forgets their wallet'],
      ['Only microwave meals forever','Only canned food forever','Only frozen dinners forever'],
      ['Dining with someone who chews with mouth open','Dining with a phone-stacker','Dining with someone who takes 100 food pics'],
      ['Unlimited McDonald\'s but no other food ever','Only home-cooked but you have to cook everything','Only eat at 3-star Michelin but once a day'],
      ['Your cooking is always medium','AI cooks all your meals','A stranger cooks all your meals'],
      ['Everything tastes like chicken','Everything has a weird aftertaste','Everything is slightly too salty'],
      ['No seasoning ever again','No sauce ever again','No dessert ever again'],
      ['Eat only beige food','Eat only green food','Eat only purple food'],
      ['Food court date','Buffet date','Vending machine date'],
      ['Hot dog eating contest','Pie eating contest','Jalapeño eating contest'],
      ['Chef Boyardee for fine dining','Lunchables as appetizers','Capri Sun as wine'],
      ['Person who says "I\'m not hungry" then eats your fries','Person who says "just a bite" and eats half','Person who orders a salad then steals your burger'],
      ['Eating spaghetti on a roller coaster','Eating soup on a boat in a storm','Eating tacos while running a marathon'],
      ['Your ex makes the best food you\'ve ever had','Your boss cooks for you every day','A celebrity chef hates your cooking'],
      ['Never eat your comfort food again','Only eat your comfort food forever','Your comfort food is now everyone\'s comfort food']
    ]
  },
  political: {
    clean: [
      ['Barack Obama','Justin Trudeau','Emmanuel Macron'],['JFK','Abraham Lincoln','George Washington'],
      ['Winston Churchill','Franklin Roosevelt','Charles de Gaulle'],
      ['Nelson Mandela','Mahatma Gandhi','Martin Luther King Jr'],
      ['Queen Elizabeth II','Princess Diana','Queen Victoria'],
      ['Alexandria Ocasio-Cortez','Jacinda Ardern','Angela Merkel'],
      ['Margaret Thatcher','Indira Gandhi','Benazir Bhutto'],
      ['Desmond Tutu','Dalai Lama','Pope Francis'],
      ['Eleanor Roosevelt','Rosa Parks','Malala Yousafzai'],
      ['John Adams','Thomas Jefferson','Benjamin Franklin'],
      ['Theodore Roosevelt','Dwight Eisenhower','Harry Truman'],
      ['Julius Caesar','Augustus','Marcus Aurelius'],
      ['Cleopatra','Nefertiti','Hatshepsut'],
      ['Simón Bolívar','José de San Martín','Bernardo O\'Higgins'],
      ['Alexander Hamilton','Aaron Burr','James Madison'],
      ['Michelle Obama','Hillary Clinton','Ruth Bader Ginsburg'],
      ['Abraham Lincoln','Ulysses S Grant','William Sherman'],
      ['Frederick Douglass','Harriet Tubman','Sojourner Truth'],
      ['Susan B Anthony','Elizabeth Cady Stanton','Emmeline Pankhurst'],
      ['Napoleon Bonaparte','Duke of Wellington','Horatio Nelson'],
      ['Che Guevara','Fidel Castro','Hugo Chavez'],
      ['Pierre Trudeau','Lester Pearson','Wilfrid Laurier'],
      ['Jawaharlal Nehru','Sardar Patel','Subhas Chandra Bose'],
      ['Muhammad Ali Jinnah','Liaquat Ali Khan','Zulfikar Ali Bhutto'],
      ['Imran Khan','Nawaz Sharif','Bilawal Bhutto'],
      ['Aung San Suu Kyi','Corazon Aquino','Ellen Johnson Sirleaf'],
      ['King Charles III','Prince William','Prince Harry'],
      ['Volodymyr Zelenskyy','Emmanuel Macron','Rishi Sunak'],
      ['Kamala Harris','Nancy Pelosi','Janet Yellen'],
      ['Greta Thunberg','Malala Yousafzai','Emma Watson']
    ],
    medium: [
      ['Elon Musk','Jeff Bezos','Mark Zuckerberg'],['Bill Gates','Tim Cook','Satya Nadella'],
      ['Sam Altman','Jensen Huang','Sundar Pichai'],['Warren Buffett','George Soros','Ray Dalio'],
      ['Oprah Winfrey','Martha Stewart','Arianna Huffington'],['Richard Branson','Jack Ma','Mukesh Ambani'],
      ['Steve Jobs','Steve Wozniak','Bill Gates'],['Sheryl Sandberg','Marissa Mayer','Ginni Rometty'],
      ['Larry Page','Sergey Brin','Mark Zuckerberg'],['Henry Kissinger','Zbigniew Brzezinski','Condoleezza Rice'],
      ['Tony Blair','David Cameron','Boris Johnson'],['Donald Rumsfeld','Dick Cheney','Colin Powell'],
      ['Narendra Modi','Imran Khan','Sheikh Hasina'],['Recep Tayyip Erdoğan','MBS','Benjamin Netanyahu'],
      ['Macron','Scholz','Meloni'],['Trudeau','Sunak','Albanese'],
      ['Lee Kuan Yew','Deng Xiaoping','Park Chung-hee'],['Mikhail Gorbachev','Boris Yeltsin','Vladimir Putin'],
      ['Donald Trump','Ron DeSantis','Vivek Ramaswamy'],['Bernie Sanders','Elizabeth Warren','Pete Buttigieg'],
      ['Mitch McConnell','Kevin McCarthy','Lindsey Graham'],['Nancy Pelosi','Chuck Schumer','Adam Schiff'],
      ['George W Bush','Bill Clinton','Barack Obama'],['Ronald Reagan','Richard Nixon','Gerald Ford'],
      ['Boris Johnson','Liz Truss','Rishi Sunak'],['Tony Abbott','Scott Morrison','Anthony Albanese'],
      ['Fidel Castro','Daniel Ortega','Evo Morales'],['Park Geun-hye','Dilma Rousseff','Cristina Fernández'],
      ['Viktor Orbán','Jair Bolsonaro','Rodrigo Duterte'],['Xi Jinping','Vladimir Putin','Kim Jong-un']
    ],
    spicy: [
      ['Vladimir Putin','Xi Jinping','Kim Jong-un'],['Donald Trump','Boris Johnson','Jair Bolsonaro'],
      ['Stalin','Mao','Pol Pot'],['Attila the Hun','Genghis Khan','Vlad the Impaler'],
      ['Nero','Caligula','Commodus'],['Ivan the Terrible','Rasputin','Catherine the Great'],
      ['Henry VIII','Blackbeard','Caligula'],['Machiavelli','Sun Tzu','Clausewitz'],
      ['Mark Zuckerberg robot mode','Elon Musk on Twitter','Jeff Bezos in space'],
      ['Politician who lies','Politician who flip-flops','Politician who never answers the question'],
      ['Lobbyist','Spin doctor','Political commentator'],['Fox News anchor','CNN anchor','BBC presenter'],
      ['Your country\'s worst PM','Your country\'s most boring PM','Your country\'s most dramatic PM'],
      ['Dictator with good fashion','Dictator with weird hair','Dictator with a palace zoo'],
      ['Napoleon at 5\'6','Alexander the Great at 25','Caesar at his last senate meeting'],
      ['Political dynasty kid','Self-made politician','Celebrity turned politician'],
      ['Person who talks politics at dinner','Person who argues politics online','Person who puts political bumper stickers on everything'],
      ['Your least favorite world leader','Your country\'s opposition leader','A random mayor'],
      ['Senator who falls asleep','Senator who goes viral','Senator who filibusters for 12 hours'],
      ['Campaign manager','Press secretary','Debate moderator'],
      ['Person who peaked in student council','Person who peaked as class president','Person who still brings up Model UN'],
      ['Conspiracy theorist uncle at Thanksgiving','Political podcast bro','Armchair foreign policy expert'],
      ['Politician\'s Twitter account','Politician\'s TikTok account','Politician\'s LinkedIn account'],
      ['A king from 1200','A president from 1900','A prime minister from 2000'],
      ['Benevolent dictator','Incompetent democracy','Efficient bureaucracy'],
      ['CIA agent','MI6 agent','KGB agent'],['Cold War spy','Modern cyber spy','Renaissance spy'],
      ['The person who wrote your country\'s constitution','The person who broke your country\'s biggest law','The person who made your country\'s weirdest law'],
      ['Gerrymandering expert','Filibuster champion','Lobbyist hall of famer'],
      ['Politician who cries on TV','Politician who dabs','Politician caught dancing']
    ]
  },
  historical: {
    clean: [
      ['Cleopatra','Queen Nefertiti','Hatshepsut'],['Julius Caesar','Alexander the Great','Genghis Khan'],
      ['Leonardo da Vinci','Michelangelo','Raphael'],['Albert Einstein','Nikola Tesla','Isaac Newton'],
      ['Marie Curie','Ada Lovelace','Rosalind Franklin'],['Shakespeare','Chaucer','Milton'],
      ['Aristotle','Plato','Socrates'],['Audrey Hepburn','Marilyn Monroe','Grace Kelly'],
      ['Napoleon Bonaparte','Duke of Wellington','Horatio Nelson'],['Mozart','Beethoven','Bach'],
      ['Frida Kahlo','Georgia O\'Keeffe','Mary Cassatt'],['Joan of Arc','Boudica','Hua Mulan'],
      ['Marco Polo','Christopher Columbus','Vasco da Gama'],['Amelia Earhart','Bessie Coleman','Harriet Quimby'],
      ['Galileo','Copernicus','Kepler'],['Charles Darwin','Gregor Mendel','Louis Pasteur'],
      ['Benjamin Franklin','Thomas Edison','Alexander Graham Bell'],['Queen Elizabeth I','Catherine the Great','Wu Zetian'],
      ['Confucius','Laozi','Sun Tzu'],['Tutankhamun','Ramses II','Akhenaten'],
      ['Spartacus','Hannibal Barca','Leonidas'],['Viking Leif Erikson','Pirate Blackbeard','Explorer Magellan'],
      ['Florence Nightingale','Clara Barton','Mary Seacole'],['Wright Brothers','Nikola Tesla','Henry Ford'],
      ['Pythagoras','Archimedes','Euclid'],['Cleopatra','Nefertiti','Helen of Troy'],
      ['Samurai Musashi','Ninja Hattori Hanzo','Warrior Monk Benkei'],['Da Vinci','Rembrandt','Van Gogh'],
      ['Harriet Tubman','Frederick Douglass','Sojourner Truth'],['Neil Armstrong','Yuri Gagarin','Buzz Aldrin']
    ],
    medium: [
      ['Young Winston Churchill','Young Theodore Roosevelt','Young Abraham Lincoln'],
      ['Cleopatra in her prime','Marie Antoinette in her prime','Catherine the Great in her prime'],
      ['Gladiator','Samurai','Viking'],['Medieval Knight','Roman Centurion','Spartan Warrior'],
      ['Renaissance Artist','Enlightenment Philosopher','Industrial Revolution Inventor'],
      ['Egyptian Pharaoh','Roman Emperor','Chinese Emperor'],['Pirate Captain','Naval Admiral','Privateer'],
      ['Cowboy in the Wild West','Gangster in the 1920s','Spy in the Cold War'],
      ['Explorer who found gold','Explorer who found new land','Explorer who found nothing but survived'],
      ['Queen who conquered','Queen who ruled peacefully','Queen who was overthrown'],
      ['Mad scientist of the 1800s','Alchemist of the 1400s','Inventor of the 1900s'],
      ['Ancient Greek athlete','Medieval jousting champion','Renaissance fencing master'],
      ['Person who built the pyramids','Person who built the Colosseum','Person who built the Great Wall'],
      ['Court jester','Royal advisor','Palace guard'],['Wealthy merchant','Traveling bard','Village blacksmith'],
      ['First person to sail around the world','First person on the moon','First person at the South Pole'],
      ['Library of Alexandria scholar','Oxford in 1200 scholar','Harvard in 1700 scholar'],
      ['Tesla if he was rich','Edison if he was honest','Da Vinci if he finished his projects'],
      ['Ancient Roman senator','Medieval lord','Enlightenment-era duke'],
      ['Aztec warrior','Zulu warrior','Mongol warrior'],
      ['Shakespeare as a person','Byron as a person','Oscar Wilde as a person'],
      ['Young Einstein','Young Darwin','Young Newton'],
      ['Attila the Hun','Vlad the Impaler','Ivan the Terrible'],
      ['Rasputin','Nostradamus','Merlin'],['Nikola Tesla','Thomas Edison','Guglielmo Marconi'],
      ['King Tutankhamun','King Solomon','King Leonidas'],
      ['Marie Curie','Rosalind Franklin','Lise Meitner'],
      ['Alexander the Great at 20','Julius Caesar at 30','Napoleon at 25'],
      ['Ancient Sumerian farmer','Medieval English peasant','Colonial American settler'],
      ['Philosopher who drank poison','Philosopher who lived in a barrel','Philosopher who was exiled']
    ],
    spicy: [
      ['Nero fiddling while Rome burns','Caligula doing Caligula things','Commodus fighting gladiators'],
      ['Henry VIII choosing a wife','Casanova at a party','Don Juan on a date'],
      ['Rasputin at a dinner party','Nostradamus reading your future','Aleister Crowley performing a ritual'],
      ['Blackbeard on his ship','Anne Bonny in a tavern','Calico Jack on the run'],
      ['Cleopatra\'s court','Versailles at midnight','Ottoman Sultan\'s palace'],
      ['Mad King George III','Bloody Mary Tudor','Richard III'],
      ['A pharaoh\'s curse','A pirate\'s treasure map','An alchemist\'s formula'],
      ['Genghis Khan\'s ambition','Napoleon\'s ego','Alexander\'s conquests'],
      ['Witch trial judge','Inquisition leader','Book burner'],
      ['The person who killed Caesar','The person who betrayed Jesus','The person who burned the Library of Alexandria'],
      ['Spy who changed the war','Double agent who got caught','Assassin who changed history'],
      ['Last person standing at the Alamo','Last person out of Pompeii','Last person on the Titanic'],
      ['Caveman discovering fire','Medieval person during the plague','Victorian person with modern manners'],
      ['A gladiator who won their freedom','A prisoner who escaped Alcatraz','A soldier who survived Dunkirk'],
      ['Napoleon on Elba','Hitler in his bunker','Caesar at the senate'],
      ['Person who invented the guillotine','Person who invented dynamite','Person who invented the atomic bomb'],
      ['Living in ancient Rome but as a slave','Living in medieval Europe but during the plague','Living in the Wild West but you can\'t shoot'],
      ['Time traveler stuck in the Stone Age','Time traveler stuck in the Dark Ages','Time traveler stuck in the 1800s with no electricity'],
      ['Edison electrocuting an elephant','Columbus being Columbus','King Leopold in the Congo'],
      ['A witch in Salem','A heretic in the Inquisition','A dissident in the French Revolution'],
      ['Caligula\'s horse senator','Nero\'s fiddle performance','Commodus\'s gladiator cosplay'],
      ['Living through the Black Death','Living through the Ice Age','Living through the Bronze Age collapse'],
      ['Vlad the Impaler\'s hospitality','Ivan the Terrible\'s mood swings','Caligula\'s dinner party'],
      ['An aristocrat during the French Revolution','A loyalist during the American Revolution','A noble during the Russian Revolution'],
      ['The inventor of the wheel','The inventor of fire','The inventor of the internet'],
      ['Ancient Egypt\'s worst pharaoh','Rome\'s worst emperor','Britain\'s worst king'],
      ['Haunted castle resident','Cursed tomb opener','Bermuda Triangle sailor'],
      ['Medieval barber surgeon','Civil War battlefield medic','Ancient Greek dentist'],
      ['A random peasant in any era','A random noble in any era','A random monk in any era'],
      ['The Zodiac Killer','Jack the Ripper','DB Cooper']
    ]
  },
  video_games: {
    clean: [
      ['Mario','Link','Master Chief'],['Kratos','Geralt','Arthur Morgan'],
      ['Lara Croft','Aloy','Ellie'],['Cloud Strife','Tidus','Noctis'],
      ['Sonic','Crash Bandicoot','Spyro'],['Nathan Drake','Sam Fisher','Agent 47'],
      ['Solid Snake','Big Boss','Revolver Ocelot'],['Pikachu','Charizard','Mewtwo'],
      ['Sephiroth','Ganondorf','Bowser'],['Tifa Lockhart','Aerith Gainsborough','Lightning'],
      ['Jett','Reyna','Sage'],['Tracer','D.Va','Mercy'],
      ['Wraith','Loba','Bangalore'],['Joel','Ellie','Abby'],
      ['Ezio Auditore','Altair','Connor Kenway'],['Commander Shepard','Garrus','Liara'],
      ['Kirby','Yoshi','Pikachu'],['Princess Peach','Princess Zelda','Samus Aran'],
      ['Sub-Zero','Scorpion','Raiden'],['Ryu','Ken','Chun-Li'],
      ['CJ from San Andreas','Trevor Phillips','Franklin Clinton'],['Mega Man','Samus','Astro Boy'],
      ['Steve from Minecraft','Villager from Animal Crossing','Fall Guy'],
      ['Kratos young','Kratos old','Kratos with Atreus'],
      ['Leon Kennedy','Chris Redfield','Jill Valentine'],
      ['Dante','Vergil','Nero'],['Bayonetta','2B','Jeanne'],
      ['Gordon Freeman','Master Chief','Doomguy'],['Pac-Man','Donkey Kong','Frogger'],
      ['Yennefer','Triss','Ciri'],['Kassandra','Eivor','Bayek']
    ],
    medium: [
      ['V from Cyberpunk','Judy Alvarez','Panam Palmer'],['Clementine','Lee Everett','Kenny'],
      ['Solid Snake at 20','Solid Snake at 40','Old Snake'],['Young Link','Adult Link','Twilight Princess Link'],
      ['Cloud in FF7','Cloud in Advent Children','Cloud in Smash Bros'],
      ['Quiet from MGSV','Sniper Wolf from MGS','The Boss from MGS3'],
      ['Chloe Price','Max Caulfield','Rachel Amber'],['Nines','Connor','Markus from Detroit'],
      ['Tali','Miranda','Jack from Mass Effect'],['Garrus','Thane','Kaidan'],
      ['Yuna','Rikku','Lulu'],['Squall','Zidane','Tidus'],
      ['Widowmaker','Ashe','Sombra'],['Hanzo','Genji','McCree'],
      ['Lifeline','Valkyrie','Wattson'],['Catalyst','Rampart','Horizon'],
      ['Sage','Killjoy','Viper'],['Phoenix','Yoru','Chamber'],
      ['Isabelle from Animal Crossing','Tom Nook','K.K. Slider'],
      ['Waluigi','Wario','Toad'],['Bowser Jr','King Boo','Dry Bones'],
      ['GLaDOS','Wheatley','Cave Johnson'],['Sans','Papyrus','Undyne'],
      ['The Knight from Hollow Knight','Hornet','The Pale King'],
      ['Cuphead','Mugman','King Dice'],['Zagreus','Megaera','Thanatos'],
      ['Madeline from Celeste','The Knight from Hollow Knight','Ori'],
      ['Ellie from Last of Us 1','Ellie from Last of Us 2','Abby'],
      ['Lady Dimitrescu','Mother Miranda','Donna Beneviento'],
      ['Pyramid Head','Nemesis','Mr. X']
    ],
    spicy: [
      ['Bowser as a dad','Ganondorf as a roommate','Sephiroth as a coworker'],
      ['Waluigi','Tingle','Wario'],['GLaDOS','Wheatley on a date','The Companion Cube'],
      ['Tom Nook and his mortgages','Resetti and his lectures','Nook\'s Cranny 4am music'],
      ['A Creeper','An Enderman','A Warden'],['The Duck Hunt Dog','Clippy','Navi saying Hey Listen'],
      ['Pac-Man\'s ghost Blinky','Pac-Man\'s ghost Pinky','Pac-Man\'s ghost Inky'],
      ['Minecraft Villager','Among Us Crewmate','Fall Guys Bean'],
      ['A Sims character in a pool with no ladder','A Sims character in a room with no door','A Sims character whose kitchen caught fire'],
      ['Your Skyrim follower','Your GTA Online character','Your Sims character'],
      ['Dark Souls boss that killed you 50 times','Elden Ring boss that killed you 100 times','Sekiro boss that killed you 200 times'],
      ['The last enemy in a no-hit run','Lag spike in ranked','Your teammate who goes AFK'],
      ['Pay-to-win whale','Hacker in your lobby','Smurf account'],
      ['Toxic teammate','Backseat gamer','Person who spoils the game'],
      ['Person who picks Oddjob in GoldenEye','Person who screen-peeks','Person who pauses in a fighting game'],
      ['Your K/D ratio','Your Steam library of unplayed games','Your save file that corrupted'],
      ['Escort mission NPC','Unskippable cutscene','Underwater level'],
      ['The dog from Duck Hunt','The laughing dog from Silent Hill','The dog ending in any game'],
      ['A battle royale circle closing in','Rising lava level','A timed mission with 3 seconds left'],
      ['Red shell in first place','Blue shell targeting you','Lightning bolt shrinking everyone'],
      ['Final boss with a second phase','Final boss with a third phase','Final boss with a cutscene fake-out'],
      ['Fishing minigame','Stealth mission','Turret section'],
      ['Water temple in Zelda','Blighttown in Dark Souls','The Library in Halo'],
      ['An NPC you accidentally killed','An NPC who gives you a 10-minute quest for 5 gold','An NPC with an annoying voice line'],
      ['The EA executive who invented loot boxes','The developer who added microtransactions','The person who thought always-online DRM was a good idea'],
      ['Playing a horror game at 3am','Playing a rage game on stream','Playing a dating sim with your parents watching'],
      ['That one level you can\'t beat','That one collectible you can\'t find','That one achievement you\'ll never get'],
      ['Gamer rage','Gamer chair','Gamer fuel'],
      ['Loading screen tips','Unskippable tutorials','Mandatory crafting systems'],
      ['Your first game ever','Your most-played game','The game you rage-quit and never went back to'],
      ['RNG that blessed you','RNG that cursed you','RNG that made you quit']
    ]
  },
  movie_chars: {
    clean: [
      ['Tony Stark','Steve Rogers','Thor'],['Batman','Superman','Wonder Woman'],
      ['Jack Sparrow','Barbossa','Will Turner'],['Hermione Granger','Luna Lovegood','Ginny Weasley'],
      ['Harry Potter','Ron Weasley','Draco Malfoy'],['Katniss Everdeen','Hermione Granger','Tris Prior'],
      ['The Joker','Thanos','Magneto'],['Ferris Bueller','John Bender','Cameron Frye'],
      ['Regina George','Cady Heron','Janis Ian'],['Sandy','Rizzo','Frenchie'],
      ['Tyler Durden','The Narrator','Marla Singer'],['Elle Woods','Vivian Kensington','Emmett Richmond'],
      ['Indiana Jones','Han Solo','Jack Ryan'],['Neo','Trinity','Morpheus'],
      ['Aragorn','Legolas','Gimli'],['Frodo','Sam','Gandalf'],
      ['Luke Skywalker','Han Solo','Leia Organa'],['Obi-Wan','Anakin','Padmé'],
      ['Ethan Hunt','James Bond','Jason Bourne'],['Rocky Balboa','John Rambo','The Terminator'],
      ['Forrest Gump','Benjamin Button','Edward Scissorhands'],['Black Panther','Doctor Strange','Spider-Man'],
      ['Shang-Chi','Ant-Man','Star-Lord'],['Groot','Rocket','Drax'],
      ['Mia Wallace','Vincent Vega','Jules Winnfield'],['John Wick','The Bride','Django'],
      ['Captain Jack Sparrow','Elizabeth Swann','Will Turner'],['Mulan live action','Jasmine live action','Cinderella live action'],
      ['Dom Toretto','Brian O\'Connor','Letty'],['Patrick Bateman','Jordan Belfort','Gordon Gekko']
    ],
    medium: [
      ['Young Simba','Adult Simba','Mufasa\'s ghost'],['Shrek in the swamp','Shrek at the castle','Shrek in Far Far Away'],
      ['Jack from Titanic','Noah from The Notebook','Edward from Twilight'],
      ['Katniss in the arena','Katniss in the rebellion','Katniss at the reaping'],
      ['Harry year 1','Harry year 4','Harry year 7'],['Tony Stark in Iron Man 1','Tony Stark in Endgame','Tony Stark in Civil War'],
      ['Batman Begins Batman','Dark Knight Batman','Dark Knight Rises Batman'],
      ['Tobey Spider-Man','Andrew Spider-Man','Tom Spider-Man'],
      ['Heath Ledger Joker','Joaquin Phoenix Joker','Jack Nicholson Joker'],
      ['Gandalf the Grey','Gandalf the White','Saruman'],
      ['Captain America before the serum','Captain America with the shield','Old Man Cap'],
      ['Thor with hammer','Thor without hammer','Fat Thor'],
      ['Darth Vader','Kylo Ren','Emperor Palpatine'],
      ['Scooby-Doo','Shaggy','Velma'],['Willy Wonka Johnny Depp','Willy Wonka Gene Wilder','Willy Wonka Timothée Chalamet'],
      ['Gollum','Smeagol','The Ring itself'],['Barbie','Ken','Allan'],
      ['Oppenheimer','Einstein in Oppenheimer','Strauss in Oppenheimer'],
      ['Joy from Inside Out','Sadness from Inside Out','Anxiety from Inside Out 2'],
      ['Furiosa','Mad Max','Immortan Joe'],['John Wick Chapter 1','John Wick Chapter 4','John Wick\'s dog'],
      ['The Bride from Kill Bill','Agent Smith from The Matrix','Anton Chigurh from No Country'],
      ['M3GAN','Annabelle','Chucky'],['Pennywise','The Babadook','Samara from The Ring'],
      ['Puss in Boots','Donkey','Gingerbread Man'],['Remy from Ratatouille','Linguini','Chef Skinner'],
      ['Buzz Lightyear the toy','Buzz Lightyear the movie version','Tim Allen'],
      ['Elsa','Anna','Olaf'],['Moana','Maui','Tamatoa'],['Baby Groot','Adult Groot','Teenage Groot']
    ],
    spicy: [
      ['Thanos who was right','Killmonger who was right','Magneto who was right'],
      ['Joker but he has a point','Bane but he has a point','Two-Face but he has a point'],
      ['Voldemort with a nose','Darth Vader without the suit','Thanos without the gauntlet'],
      ['A character who survived but shouldn\'t have','A character who died but shouldn\'t have','A character who never existed but should have'],
      ['The shark from Jaws','The dinosaur from Jurassic Park','King Kong'],
      ['Alien Xenomorph','Predator','The Thing'],
      ['HAL 9000','Ultron','Skynet'],['Agent Smith','The Machines','The Architect'],
      ['Hannibal Lecter at dinner','Norman Bates at a motel','Jack Torrance in winter'],
      ['Pennywise in the sewers','Freddy in your dreams','Jason at summer camp'],
      ['The aliens from Mars Attacks','The aliens from Signs','The aliens from A Quiet Place'],
      ['Godzilla','King Kong','Mothra'],['Smaug','Drogon','Toothless'],
      ['That villain who monologues too long','That hero who never kills','That side character who obviously betrays everyone'],
      ['Movie character with plot armor','Movie character who makes the worst decisions','Movie character who could have ended the movie in 10 minutes'],
      ['A rom-com character','An action movie character','A horror movie character as your roommate'],
      ['Person who dies first in a horror movie','Person who survives the horror movie','Person who was the killer all along'],
      ['Character who always says "I\'ve got a bad feeling about this"','Character who always says "I\'ll be back"','Character who always says "It\'s not about the money"'],
      ['James Bond with his gadgets','Jason Bourne with his memory loss','Ethan Hunt with his impossible missions'],
      ['Jar Jar Binks','Scrappy-Doo','The Minions'],
      ['Indiana Jones and the Crystal Skull Indy','Kingdom of Heaven Orlando Bloom','Cats 2019 anyone'],
      ['CGI young Jeff Bridges','CGI young Will Smith','CGI young Robert De Niro'],
      ['A movie reboot nobody asked for','A sequel that ruined the franchise','A prequel that retroactively ruins the original'],
      ['Character who peaked in act 1','Character who peaked in act 2','Character who peaked in the post-credits'],
      ['Final girl','The comic relief who survives','The guy who says "let\'s split up"'],
      ['Your favorite childhood character now','Your favorite childhood character then','Your favorite childhood character in a gritty reboot'],
      ['A Disney princess in a Marvel movie','A Marvel hero in a Disney princess movie','A horror villain in a rom-com'],
      ['The cat from Alien','The dog from I Am Legend','The horse from LOTR'],
      ['A character with amnesia','A character with a secret twin','A character who was dead the whole time'],
      ['Sequel protagonist','Reboot protagonist','Original protagonist coming back'],
      ['That character whose actor got recast','That character whose arc went nowhere','That character who deserved better']
    ]
  },
  anime: {
    clean: [
      ['Naruto','Sasuke','Kakashi'],['Goku','Vegeta','Gohan'],
      ['Luffy','Zoro','Sanji'],['Tanjiro','Zenitsu','Inosuke'],
      ['Izuku Midoriya','Bakugo','Todoroki'],['Levi','Eren','Armin'],
      ['Light Yagami','L','Near'],['Spike Spiegel','Jet Black','Vicious'],
      ['Edward Elric','Roy Mustang','Alphonse Elric'],['Asuna','Sinon','Alice'],
      ['Rem','Emilia','Beatrice'],['Hinata','Sakura','Ino'],
      ['Gojo Satoru','Todo','Nanami'],['Anya Forger','Loid Forger','Yor Forger'],
      ['Nezuko','Mitsuri','Shinobu'],['Saitama','Genos','King'],
      ['Mikasa','Historia','Annie'],['Killua','Gon','Kurapika'],
      ['Gintoki','Shinpachi','Kagura'],['Denji','Power','Makima'],
      ['Ichigo','Rukia','Orihime'],['Mob','Reigen','Teru'],
      ['Violet Evergarden','Zero Two','Asuna'],['Erza','Lucy','Juvia'],
      ['Todoroki','Hawks','Dabi'],['Lelouch','Suzaku','CC'],
      ['Luffy','Ace','Sabo'],['Gojo','Sukuna','Megumi'],
      ['Itachi','Pain','Madara'],['Asta','Yuno','Noelle']
    ],
    medium: [
      ['Naruto Sage Mode','Sasuke Rinnegan','Kakashi DMS'],['Ultra Instinct Goku','Super Saiyan Blue Vegeta','Gohan Beast'],
      ['Gear 5 Luffy','Zoro with Enma','Sanji with Ifrit Jambe'],['Demon Form Tanjiro','Thunder God Zenitsu','Beast Breathing Inosuke'],
      ['One For All 100% Deku','Bakugo Howitzer Impact','Todoroki Full Power'],['Eren Founding Titan','Levi Thunder Spears','Mikasa with scarf'],
      ['Shinigami Eyes Light','L with cake','Ryuk with an apple'],['Spike with a cigarette','Faye Valentine','Ed from Bebop'],
      ['Father from FMA','Scar from FMA','Greed from FMA'],['Kirito dual wielding','Asuna Mother\'s Rosario','Eugeo'],
      ['Subaru suffering','Rem confession scene','Emilia with Puck'],['Young Naruto','Sage Naruto','Hokage Naruto'],
      ['Jujutsu Kaisen Gojo','One Punch Man Saitama','Dragon Ball Goku'],['Chainsaw Man Denji','Jujutsu Kaisen Yuji','My Hero Deku'],
      ['Makima','Power','Reze'],['Muzan','Akaza','Doma'],
      ['All Might prime','All Might weakened','All Might as a teacher'],['Adult Gon','Meruem','Netero'],
      ['Berserk Guts','Berserk Griffith','Berserk Casca'],['Aizen','Madara','Dio'],
      ['Robin from One Piece','Nami from One Piece','Hancock from One Piece'],
      ['Kakashi face reveal','Gojo without blindfold','Levi without the cravat'],
      ['Reigen with 1000% power','Mob at 100%','Teru with hair'],
      ['Female Titan Annie','Warhammer Titan','Cart Titan Pieck'],
      ['Senku from Dr Stone','Lelouch from Code Geass','Light from Death Note'],
      ['Marin from Dress Up Darling','Chizuru from Rent-a-Girlfriend','Mai from Bunny Girl Senpai'],
      ['Jotaro','DIO','Giorno'],['Shanks','Whitebeard','Roger'],
      ['Demon Slayer Rengoku','Tengen Uzui','Giyu Tomioka'],['Overhaul','Shigaraki','Dabi']
    ],
    spicy: [
      ['Gojo but he never comes back','Ace but he survived','Jiraiya but he lived'],
      ['Your waifu','Your rival\'s waifu','The body pillow at the anime convention'],
      ['Hisoka','Orochimaru','Muzan'],['Yandere','Tsundere','Kuudere'],
      ['The thousand-year-old dragon who looks 12','The 16-year-old protagonist who saves the world','The sensei who is suspiciously young'],
      ['Beach episode version of your fave','Tournament arc version of your fave','Filler arc version of your fave'],
      ['Sakura from Naruto','Sakura from Fate','Sakura from Cardcaptor'],
      ['That anime betrayal you\'ll never forgive','That anime death that broke you','That anime ending that made no sense'],
      ['Griffith did nothing wrong','Eren did nothing wrong','Light did nothing wrong'],
      ['Character whose power-up is friendship','Character whose power-up is rage','Character whose power-up is a training montage'],
      ['Filler episodes of Naruto','Filler episodes of Bleach','The pacing of One Piece'],
      ['A harem protagonist','An isekai protagonist','A shounen protagonist who never loses'],
      ['Person who skips anime openings','Person who watches dubbed','Person who only reads manga'],
      ['Weekly release watcher','Binge watcher','Person who reads spoilers'],
      ['Anime convention in July','Anime body pillow owner','Person with a waifu tier list'],
      ['English dub Goku','Japanese Goku','Abridged Goku'],
      ['Netflix anime adaptation','Live-action anime movie','Hollywood anime adaptation'],
      ['The boat arc','The training arc that lasts 50 episodes','The recap episode'],
      ['Talk no jutsu Naruto','Believe it Naruto','Sexy jutsu Naruto'],
      ['One Piece fan explaining the lore','Fate fan explaining the watch order','Monogatari fan explaining the timeline'],
      ['Anime nose bleed','Anime sweat drop','Anime vein pop'],
      ['Power of friendship ending','Deus ex machina ending','Everyone dies ending'],
      ['That character who eats all the time','That character who sleeps all the time','That character who trains all the time'],
      ['Weeb who went to Japan once','Weeb who speaks anime Japanese','Weeb who runs like Naruto in public'],
      ['Manga reader who spoils everything','Anime-only who theorizes wrong','Light novel reader who is smug'],
      ['The animation budget episode','The outsourced animation episode','The recap clip show episode'],
      ['A sword that chose the wielder','A power that awakens through trauma','A transformation that\'s just yelling'],
      ['Battle shounen fan','Slice of life fan','Mecha fan'],
      ['Your first anime','Your favorite anime','The anime you pretend you haven\'t seen'],
      ['Anime girl who could beat Goku','Anime guy who could beat Saitama','Anime villain who could beat everyone'],
      ['That one fight scene everyone talks about','That one emotional scene everyone talks about','That one plot twist everyone talks about']
    ]
  },
  musicians: {
    clean: [
      ['Taylor Swift','Beyoncé','Adele'],['Drake','Kendrick Lamar','J Cole'],
      ['Harry Styles','Shawn Mendes','Niall Horan'],['Billie Eilish','Olivia Rodrigo','Doja Cat'],
      ['The Weeknd','Post Malone','Travis Scott'],['Bad Bunny','J Balvin','Maluma'],
      ['Eminem','Jay-Z','Kanye West'],['Rihanna','Nicki Minaj','Cardi B'],
      ['Michael Jackson','Prince','David Bowie'],['The Beatles','The Rolling Stones','Led Zeppelin'],
      ['Elvis','Frank Sinatra','Dean Martin'],['BTS Jin','BTS Jimin','BTS Jungkook'],
      ['Blackpink Jennie','Blackpink Lisa','Blackpink Rosé'],
      ['Ed Sheeran','Bruno Mars','John Legend'],['Ariana Grande','Dua Lipa','SZA'],
      ['Lady Gaga','Madonna','Cher'],['Freddie Mercury','Mick Jagger','Robert Plant'],
      ['Kurt Cobain','Eddie Vedder','Chris Cornell'],['Tupac','Biggie','Nas'],
      ['Whitney Houston','Mariah Carey','Celine Dion'],['Frank Ocean','Tyler the Creator','Childish Gambino'],
      ['Lana Del Rey','Lorde','Florence Welch'],['Shakira','Jennifer Lopez','Pitbull'],
      ['Justin Bieber','Justin Timberlake','Usher'],['Coldplay','Imagine Dragons','Maroon 5'],
      ['Twenty One Pilots','Paramore','Fall Out Boy'],['Arctic Monkeys','The Strokes','Tame Impala'],
      ['Kendrick Lamar','Tyler the Creator','Mac Miller'],['Arijit Singh','AR Rahman','Shreya Ghoshal'],
      ['Diljit Dosanjh','AP Dhillon','Sidhu Moosewala']
    ],
    medium: [
      ['Atif Aslam','Ali Zafar','Rahat Fateh Ali Khan'],['Nusrat Fateh Ali Khan','Abida Parveen','Rahat Fateh Ali Khan'],
      ['90s Eminem','00s Kanye','10s Drake'],['Peak Michael Jackson','Peak Prince','Peak Freddie Mercury'],
      ['Voice of Whitney Houston','Voice of Mariah Carey','Voice of Adele'],
      ['Beatles John','Beatles Paul','Beatles George'],['Destiny\'s Child Beyoncé','Solo Beyoncé','Renaissance Beyoncé'],
      ['Red era Taylor','1989 era Taylor','Midnights era Taylor'],
      ['Blonde Frank Ocean','Channel Orange Frank','Unreleased Frank'],
      ['Old Kanye','New Kanye','Ye'],['DAMN Kendrick','TPAB Kendrick','Mr Morale Kendrick'],
      ['Sweetener Ariana','Thank U Next Ariana','Positions Ariana'],
      ['Anti Rihanna','Loud Rihanna','Fenty CEO Rihanna'],['Lemonade Beyoncé','Homecoming Beyoncé','Renaissance Beyoncé'],
      ['Abbey Road Beatles','Sgt Pepper Beatles','Let It Be Beatles'],
      ['Guitar god Jimi Hendrix','Guitar god Eric Clapton','Guitar god Slash'],
      ['Rapper Childish Gambino','Singer Childish Gambino','Actor Donald Glover'],
      ['Travis Scott the musician','Travis Scott the brand','Travis Scott the festival organizer'],
      ['Doja Cat rapper','Doja Cat pop star','Doja Cat meme queen'],
      ['Bad Bunny reggaeton','Bad Bunny trap','Bad Bunny movie star'],
      ['Harry Styles solo','Harry Styles in 1D','Harry Styles acting'],
      ['Billie Eilish debut','Billie Eilish Happier Than Ever','Billie Eilish recent'],
      ['The 1975','Arctic Monkeys','Glass Animals'],['Dua Lipa Future Nostalgia','Dua Lipa self-titled','Dua Lipa at festivals'],
      ['Coachella headliner','Glastonbury headliner','Super Bowl halftime performer'],
      ['Spotify #1','TikTok viral artist','Underground legend'],
      ['Stadium tour artist','Intimate club artist','Festival headliner'],
      ['Grammy winner','Grammy snubbed','Grammy controversial'],
      ['One-hit wonder from the 90s','One-hit wonder from the 2000s','One-hit wonder from the 2010s'],
      ['Your gym playlist artist','Your crying playlist artist','Your party playlist artist']
    ],
    spicy: [
      ['Kanye at the VMAs','Will Smith at the Oscars','Madonna at the Brits'],
      ['Artist who peaked in high school','Artist who sold out','Artist who became a meme'],
      ['Nickelback','Creed','Imagine Dragons'],['Mumble rapper','Soundcloud rapper','Industry plant'],
      ['AI-generated music','Autotune everything','Pitch-corrected live performance'],
      ['Person who says "I listen to everything except country"','Person who only listens to one genre','Person who says "music was better in my day"'],
      ['The DJ who just presses play','The singer who lip-syncs','The drummer who\'s actually running the show'],
      ['A musician\'s early work nobody likes','A musician\'s experimental phase','A musician\'s comeback album'],
      ['Band that should have stayed together','Band that should have broken up sooner','Solo career that was a mistake'],
      ['Concert where the sound was terrible','Concert where the crowd was dead','Concert where the artist was 2 hours late'],
      ['Music snob','Music casual','Person who thinks they discovered a mainstream artist'],
      ['Person who records concerts on their phone','Person who pushes to the front','Person who talks through the whole show'],
      ['The opening act nobody came for','The DJ between sets','The encore everyone pretends to want'],
      ['Your ex\'s favorite song','A song that makes you cry','A song you overplayed and ruined'],
      ['A sold-out arena tour','A surprise pop-up show','A concert in your living room'],
      ['Singer who can\'t dance','Dancer who can\'t sing','Person who does both averagely'],
      ['Studio version','Live version','Acoustic version of a song you hate'],
      ['The algorithm playlist','The curated playlist','The playlist your friend made you'],
      ['Musician who went country','Musician who went EDM','Musician who went acoustic'],
      ['A remix nobody asked for','A feature that ruined the song','A deluxe edition with 20 extra tracks'],
      ['Artist with 1 good song','Artist with 1 bad song','Artist whose whole catalog is mid'],
      ['Music festival in the mud','Music festival in 100 degree heat','Fyre Festival'],
      ['The groupie','The roadie','The band manager'],
      ['Person who talks about vinyl records','Person who talks about their Spotify Wrapped','Person who talks about music theory'],
      ['A song that got stuck in your head for a week','A song that makes everyone leave the dance floor','A song that starts every party'],
      ['First row at a concert','Last row at a concert','Watching the livestream at home'],
      ['An artist you\'d marry for their voice','An artist you\'d marry for their lyrics','An artist you\'d marry for their looks'],
      ['The song played at every wedding','The song played at every funeral','The song played at every graduation'],
      ['Karaoke king','Shower singer','Car concert performer'],
      ['Music teacher','Music critic','Music producer']
    ]
  },
  athletes: {
    clean: [
      ['Messi','Ronaldo','Neymar'],['LeBron James','Stephen Curry','Kevin Durant'],
      ['Tom Brady','Patrick Mahomes','Aaron Rodgers'],['Serena Williams','Maria Sharapova','Naomi Osaka'],
      ['Tiger Woods','Phil Mickelson','Rory McIlroy'],['Usain Bolt','Carl Lewis','Mo Farah'],
      ['Muhammad Ali','Mike Tyson','Floyd Mayweather'],['Michael Jordan','Kobe Bryant','Magic Johnson'],
      ['Virat Kohli','Rohit Sharma','MS Dhoni'],['Neeraj Chopra','PV Sindhu','Mirabai Chanu'],
      ['Simone Biles','Nadia Comaneci','Gabby Douglas'],['Roger Federer','Rafael Nadal','Novak Djokovic'],
      ['Cristiano Ronaldo','Kylian Mbappé','Erling Haaland'],['LeBron James','Michael Jordan','Kareem Abdul-Jabbar'],
      ['Wayne Gretzky','Sidney Crosby','Connor McDavid'],['Pelé','Maradona','Zidane'],
      ['Shohei Ohtani','Babe Ruth','Mike Trout'],['Lewis Hamilton','Max Verstappen','Charles Leclerc'],
      ['Conor McGregor','Khabib Nurmagomedov','Jon Jones'],['Sachin Tendulkar','Don Bradman','Brian Lara'],
      ['Wasim Akram','Shoaib Akhtar','Waqar Younis'],['Babar Azam','Shaheen Afridi','Naseem Shah'],
      ['Mohamed Salah','Sadio Mané','Virgil van Dijk'],['Jude Bellingham','Bukayo Saka','Phil Foden'],
      ['Giannis Antetokounmpo','Luka Dončić','Nikola Jokić'],['Naomi Osaka','Coco Gauff','Iga Świątek'],
      ['Katie Ledecky','Caeleb Dressel','Michael Phelps'],['Megan Rapinoe','Alex Morgan','Sam Kerr'],
      ['Connor McDavid','Nathan MacKinnon','Auston Matthews'],['Canelo Álvarez','Tyson Fury','Oleksandr Usyk']
    ],
    medium: [
      ['Peak Michael Jordan','Peak LeBron James','Peak Kobe Bryant'],
      ['Prime Messi','Prime Ronaldo','Prime Zidane'],
      ['Young Muhammad Ali','Young Mike Tyson','Young Floyd Mayweather'],
      ['Federer\'s grace','Nadal\'s grit','Djokovic\'s consistency'],
      ['Brady\'s rings','Mahomes\'s talent','Montana\'s clutch'],
      ['Bolt\'s speed','Phelps\'s medals','Biles\'s perfection'],
      ['Gretzky\'s records','Jordan\'s championships','Brady\'s longevity'],
      ['Messi\'s dribbling','Ronaldo\'s headers','Mbappé\'s speed'],
      ['Curry\'s shooting','LeBron\'s passing','Durant\'s scoring'],
      ['Serena\'s power','Federer\'s elegance','Djokovic\'s flexibility'],
      ['The best athlete of the 80s','The best athlete of the 90s','The best athlete of the 2000s'],
      ['An athlete who retired too early','An athlete who stayed too long','An athlete in their prime right now'],
      ['Champions League final','Super Bowl','World Cup final'],
      ['A gold medalist','A world record holder','A Grand Slam winner'],
      ['Best athlete in a sport nobody watches','Average athlete in a sport everyone watches','Retired legend in any sport'],
      ['Your country\'s best athlete ever','Your rival country\'s best athlete ever','The GOAT of your least favorite sport'],
      ['The best trash talker in sports','The most gracious winner in sports','The worst loser in sports'],
      ['A coach who is a genius','A coach who is a motivator','A coach who is a disciplinarian'],
      ['Dunk contest winner','Free throw champion','Three-point contest winner'],
      ['Penalty kick taker in a World Cup final','Free throw shooter in game 7','Field goal kicker in the Super Bowl'],
      ['Commentator who says obvious things','Commentator who gets too excited','Commentator who is clearly biased'],
      ['Mascot performer','Halftime show performer','National anthem singer'],
      ['Front row seat at the Super Bowl','Courtside at the NBA Finals','Front row at the World Cup Final'],
      ['A referee who makes bad calls','A VAR decision that ruined a game','A coach who got ejected'],
      ['Tailgate before the game','Watch party at home','Solo at a sports bar'],
      ['Fantasy league champion','March Madness bracket winner','Successful sports bettor'],
      ['Striker','Midfielder','Goalkeeper'],['Point guard','Center','Shooting guard'],
      ['Quarterback','Running back','Wide receiver'],['100m sprinter','Marathon runner','Decathlete']
    ],
    spicy: [
      ['LeBron\'s hairline','Ronaldo\'s abs','Mahomes\'s voice'],
      ['Michael Jordan\'s gambling','Dennis Rodman\'s diplomacy','Charles Barkley\'s analysis'],
      ['An athlete\'s apology video','An athlete\'s retirement speech','An athlete\'s comeback announcement'],
      ['Person who peaked in high school sports','Person who could have gone pro','Person who exaggerates their glory days'],
      ['The athlete who flopped','The athlete who faked an injury','The athlete who got caught cheating'],
      ['The worst contract in sports','The worst trade in sports','The worst draft pick in sports'],
      ['Armchair quarterback','Fantasy football expert','Backseat coach'],
      ['Person who wears a jersey of a player who got traded','Person who bandwagons the winning team','Person who says "we" about a team they never played for'],
      ['Sports parent who yells at refs','Sports parent who coaches from the sidelines','Sports parent who films everything'],
      ['The athlete who wrote a bad book','The athlete who started a bad podcast','The athlete who had a bad acting career'],
      ['The team that always chokes','The team that tanked for a draft pick','The team that moved cities'],
      ['An athlete on social media','An athlete in a commercial','An athlete in a reality show'],
      ['Golf clap audience','Soccer hooligan audience','Wrestling crowd'],
      ['Sports announcer jinx','Sports superstition person','Sports conspiracy theorist'],
      ['MMA fight versus','Boxing match versus','WWE match versus — it\'s scripted'],
      ['Gym bro who does bicep curls in the squat rack','CrossFit person who tells everyone','Peloton person who\'s very into it'],
      ['Running a marathon','Doing an Ironman','Climbing Everest — which athlete are you'],
      ['Your gym rival','Your rec league rival','Your sibling rival'],
      ['The athlete who never gets injured','The athlete who\'s always injured','The athlete who plays through everything'],
      ['Sports talk radio caller','Hot take artist on ESPN','Reply guy on sports Twitter'],
      ['That one ref in your sport','That one commentator in your sport','That one analyst in your sport'],
      ['Person who says "back in my day"','Person who only watches highlights','Person who only checks box scores'],
      ['An All-Star game','A Pro Bowl','An exhibition match — which matters least'],
      ['The athlete who does too many celebrations','The athlete who doesn\'t celebrate at all','The athlete who celebrates too early'],
      ['Draft day bust','Undrafted legend','Trade deadline steal'],
      ['Athlete endorsing fast food','Athlete endorsing crypto','Athlete endorsing their own brand'],
      ['Halftime lead that collapses','Comeback from 28-3','Overtime heartbreak'],
      ['Playing in the rain','Playing in the snow','Playing in extreme heat'],
      ['Your team loses in the finals','Your team never makes the finals','Your team wins but you missed the game'],
      ['Retire a champion','Retire with one more season left','Never retire and play until you can\'t']
    ]
  },
  disney_animated: {
    clean: [
      ['Simba','Mufasa','Scar'],['Ariel','Belle','Jasmine'],
      ['Aladdin','Prince Eric','Flynn Rider'],['Elsa','Anna','Moana'],
      ['Woody','Buzz Lightyear','Jessie'],['Mike Wazowski','Sulley','Randall'],
      ['Shrek','Donkey','Lord Farquaad'],['Hiccup','Jack Frost','Kristoff'],
      ['Goofy','Donald Duck','Mickey Mouse'],['Gaston','Prince Adam','Prince Charming'],
      ['Rapunzel','Merida','Pocahontas'],['Mulan','Jasmine','Tiana'],
      ['Timon','Pumbaa','Rafiki'],['Sebastian','Flounder','Scuttle'],
      ['Genie','Mushu','Olaf'],['Lightning McQueen','Mater','Cruz Ramirez'],
      ['WALL-E','EVE','Baymax'],['Remy','Linguini','Colette'],
      ['Joy','Sadness','Bing Bong'],['Mirabel','Luisa','Bruno'],
      ['Stitch','Toothless','Baymax'],['Maui','Tamatoa','Te Fiti'],
      ['Jack Skellington','Oogie Boogie','Sally'],['Hades','Jafar','Scar'],
      ['Cinderella','Snow White','Aurora'],['Maleficent','Ursula','Cruella'],
      ['Dory','Marlin','Nemo'],['Vanellope','Ralph','Fix-It Felix'],
      ['Miguel from Coco','Hector from Coco','Ernesto de la Cruz'],
      ['Mei Lee','Ming Lee','Miriam from Turning Red']
    ],
    medium: [
      ['Young Simba','Adult Simba','Scar as king'],['Aladdin as a thief','Aladdin as a prince','Aladdin after the lamp'],
      ['Elsa in Frozen 1','Elsa in Frozen 2','Elsa in the ice palace'],
      ['Woody in Toy Story 1','Woody in Toy Story 3','Woody in Toy Story 4'],
      ['Shrek in the swamp','Shrek in Far Far Away','Shrek Forever After'],
      ['Genie with powers','Genie as a friend','Genie free from the lamp'],
      ['Beast before the curse','Beast during the curse','Beast after the curse'],
      ['Rapunzel in the tower','Rapunzel out in the world','Rapunzel with short hair'],
      ['Buzz thinking he\'s real','Buzz knowing he\'s a toy','Buzz in Spanish mode'],
      ['Scar plotting','Scar as king','Scar in the hyena pit'],
      ['Young Carl','Adventure Carl','Spirit Carl'],['Mr Incredible buff','Mr Incredible dad bod','Mr Incredible in a cubicle'],
      ['Nemo in the tank','Nemo in the ocean','Nemo at school'],
      ['Moana on the island','Moana on the ocean','Moana with Te Fiti'],
      ['Lightning McQueen winning','Lightning McQueen losing','Lightning McQueen as a mentor'],
      ['WALL-E alone on Earth','WALL-E on the ship','WALL-E with EVE'],
      ['Remy cooking','Remy hiding','Remy controlling Linguini'],
      ['Joy in charge','Sadness in charge','Anxiety in charge'],
      ['Ralph wrecking','Ralph fixing','Ralph on the internet'],
      ['Miguel alive','Miguel in the Land of the Dead','Miguel with Héctor'],
      ['Maui with his hook','Maui without his hook','Maui as a shapeshifter'],
      ['Stitch destructive','Stitch learning ohana','Stitch with Lilo'],
      ['Maleficent as villain','Maleficent as protector','Maleficent as a fairy'],
      ['Olaf in summer','Olaf in winter','Olaf philosophical'],
      ['Baby Groot','Teenage Groot','Adult Groot'],['Dory forgetting','Dory remembering','Dory leading'],
      ['Encanto Bruno','Encanto Luisa','Encanto Isabela'],
      ['Turning Red Mei','Turning Red as panda','Turning Red\'s mom as panda'],
      ['Inside Out Joy','Inside Out 2 Anxiety','Inside Out 2 Envy'],
      ['Baymax healthcare','Baymax superhero','Baymax low battery']
    ],
    spicy: [
      ['Gaston','Hans from Frozen','Prince John from Robin Hood'],
      ['Ursula\'s deal','Hades\' deal','Dr Facilier\'s deal'],
      ['Scar running Pride Rock','Jafar running Agrabah','Mother Gothel running the tower'],
      ['Lotso from Toy Story 3','Auto from WALL-E','Stinky Pete'],
      ['Syndrome','Waternoose','Randall'],['Cruella wanting puppies','Gaston wanting Belle','Frollo wanting Esmeralda'],
      ['A Disney villain who had a point','A Disney hero who was wrong','A Disney sidekick who was useless'],
      ['Pixar movie that made you cry','Pixar movie that confused kids','Pixar sequel nobody asked for'],
      ['Live-action Mulan','Live-action Lion King','Live-action Little Mermaid'],
      ['Disney adult at the park','Disney adult with the merch','Disney adult with the annual pass'],
      ['Meeting a Disney character in costume','Meeting the voice actor','Meeting the animator'],
      ['Disney Channel Original Movie','Pixar short film','Disney straight-to-video sequel'],
      ['A Disney song stuck in your head for a week','A Disney song you actually like','A Disney song that goes too hard'],
      ['Let It Go','We Don\'t Talk About Bruno','How Far I\'ll Go'],
      ['Under the Sea','Be Our Guest','Friend Like Me'],
      ['A Whole New World','Can You Feel the Love Tonight','Beauty and the Beast'],
      ['Tangled the better Frozen','Coco the saddest Pixar','Up\'s first 10 minutes the greatest short film'],
      ['Disney parent who died','Disney parent who disappeared','Disney parent who was the villain'],
      ['Pixar theory believer','Disney vault collector','Person who ranks every Disney movie'],
      ['The villain song','The "I want" song','The love duet'],
      ['Enchanted princess','Brave princess','Princess who didn\'t need a prince'],
      ['Disney ride based on a movie','Disney movie based on a ride','Disney attraction you\'d live in'],
      ['A Disney animal sidekick','A Disney magical sidekick','A Disney human sidekick'],
      ['That one Disney movie nobody talks about','That one Disney movie everyone pretends to love','That one Disney movie that\'s actually overrated'],
      ['Disney adults who go on dates there','Disney adults who do proposals there','Disney adults who have their wedding there'],
      ['The Disney vault','Disney+','Pirating Disney movies'],
      ['A Disney prince who did nothing','A Disney prince who was the problem','A Disney prince who actually helped'],
      ['Person who cries at every Pixar movie','Person who analyzes every Pixar movie','Person who ranks every Pixar movie'],
      ['Disney ending that was too happy','Disney ending that was too sad','Disney ending that made no sense'],
      ['Cars 2','Frozen 2','Toy Story 4 — which sequel was most unnecessary']
    ]
  },
  reality_tv: {
    clean: [
      ['Kim Kardashian','Kourtney Kardashian','Khloé Kardashian'],
      ['Kris Jenner','Caitlyn Jenner','Scott Disick'],
      ['Gordon Ramsay','Anthony Bourdain','Guy Fieri'],
      ['Simon Cowell','Randy Jackson','Paula Abdul'],
      ['NeNe Leakes','Kenya Moore','Cynthia Bailey'],
      ['RuPaul','Tim Gunn','Heidi Klum'],
      ['Jeff Probst','Phil Keoghan','Ryan Seacrest'],
      ['Bear Grylls','Les Stroud','Ed Stafford'],
      ['Martha Stewart','Rachael Ray','Ina Garten'],
      ['Chip Gaines','Joanna Gaines','the Fixer Upper house'],
      ['Marie Kondo','The Home Edit ladies','Mrs Hinch'],
      ['Teresa Giudice','Bethenny Frankel','Lisa Vanderpump'],
      ['The Bachelor','The Bachelorette','Love Island'],
      ['Survivor player','Big Brother player','Amazing Race player'],
      ['American Idol winner','The Voice winner','X Factor winner'],
      ['MasterChef contestant','Chopped contestant','Great British Bake Off contestant'],
      ['Selling Sunset agent','Million Dollar Listing agent','your actual real estate agent'],
      ['Queer Eye Tan','Queer Eye Antoni','Queer Eye Jonathan'],
      ['Nene Leakes','Erika Jayne','Lisa Rinna'],
      ['a Love Island bombshell','a Bachelor villain','a Survivor strategist'],
      ['Kitchen Nightmares Gordon','Hell\'s Kitchen Gordon','MasterChef Gordon'],
      ['Joe Exotic','Carole Baskin','Doc Antle'],
      ['Paris Hilton','Nicole Richie','Kim Kardashian in 2007'],
      ['Snooki','The Situation','Pauly D'],
      ['Abby Lee Miller','JoJo Siwa','Maddie Ziegler'],
      ['Dr Phil','Dr Oz','Dr Drew'],
      ['Judge Judy','Judge Mathis','People\'s Court judge'],
      ['Love Is Blind contestant','Married at First Sight contestant','90 Day Fiancé contestant'],
      ['Drag Race lip sync assassin','Drag Race comedy queen','Drag Race look queen'],
      ['Keeping Up with the Kardashians era','The Kardashians Hulu era','early Kardashians']
    ],
    medium: [
      ['First night Bachelor elimination','Final rose ceremony','After the Final Rose drama'],
      ['Love Island in summer','Love Island in winter','Love Island All Stars'],
      ['Survivor physical threat','Survivor social threat','Survivor strategic threat'],
      ['Gordon Ramsay insult','Gordon Ramsay compliment','Gordon Ramsay lamb sauce moment'],
      ['Reality TV villain edit','Reality TV hero edit','Reality TV invisible edit'],
      ['A confessional that went viral','A rose ceremony that went wrong','A reunion show that was chaos'],
      ['Show that jumped the shark','Show that peaked season 1','Show that got better with time'],
      ['Real Housewives table flip','Real Housewives wig snatch','Real Housewives tagline'],
      ['A contestant who deserved to win','A contestant who didn\'t deserve to win','A contestant who was robbed'],
      ['First season of a reality show','Peak season of a reality show','The season that killed the show'],
      ['The host nobody likes','The host everybody loves','The host who was replaced'],
      ['Reality TV couple that lasted','Reality TV couple that imploded','Reality TV couple that was fake'],
      ['Unscripted drama','Clearly scripted drama','Drama the producers caused'],
      ['A reality TV glow-up','A reality TV villain redemption','A reality TV downfall'],
      ['Person who goes on reality TV for fame','Person who goes on for love','Person who goes on for the money'],
      ['Reality TV music moment','Reality TV crying moment','Reality TV fight moment'],
      ['A challenge that went wrong','A challenge that was iconic','A challenge that was rigged'],
      ['Behind the scenes producer','The camera crew','The editors who create storylines'],
      ['90 Day Fiancé long distance couple','90 Day Fiancé age gap couple','90 Day Fiancé clearly-in-it-for-the-visa couple'],
      ['Selling Sunset drama','Below Deck drama','Summer House drama'],
      ['The Masked Singer concept','The Circle concept','The Traitors concept'],
      ['A cooking competition judge who is nice','A cooking competition judge who is mean','A cooking competition judge who cries'],
      ['American version','British version','Australian version of the same show'],
      ['Season 1 vibe','Mid-season decline','Finale redemption'],
      ['A twist nobody saw coming','A twist everyone saw coming','A twist that ruined the season'],
      ['Celebrity Big Brother','Celebrity Apprentice','Celebrity Masterchef'],
      ['Watching reality TV alone','Watching reality TV with friends','Being on reality TV'],
      ['The audition episode','The makeover episode','The finale episode'],
      ['A reality show about dating','A reality show about surviving','A reality show about cooking'],
      ['Editing magic','Frankenbiting','The unaired footage']
    ],
    spicy: [
      ['Person who says "I\'m not here to make friends"','Person who says "I didn\'t come here for this"','Person who says "at the end of the day"'],
      ['The Bachelor saying "amazing" for the 100th time','A Real Housewife saying "that\'s not my character"','A Survivor player saying "blindside"'],
      ['Reality TV personality on Cameo','Reality TV personality on OnlyFans','Reality TV personality selling MLM'],
      ['A contestant who got cancelled','A contestant who deserved to get cancelled','A contestant who got cancelled unfairly'],
      ['The most toxic reality TV relationship','The most boring reality TV relationship','The most obviously fake reality TV relationship'],
      ['Person who applies to every reality show','Person who watches every reality show','Person who is related to a reality star'],
      ['The worst reality TV winner','The best reality TV villain','The most forgettable reality TV contestant'],
      ['Unfiltered confession cam','Drunk interview moment','The moment they forgot the cameras were rolling'],
      ['Reality TV show that should be cancelled','Reality TV show that was cancelled too soon','Reality TV show concept that should never have been greenlit'],
      ['A dating show where nobody finds love','A cooking show where the food is terrible','A singing show where nobody can sing'],
      ['The producer who stirs the pot','The editor who creates drama','The casting director who chose chaos'],
      ['Reality TV before social media','Reality TV during social media','Reality TV that only exists for social media'],
      ['Your mom\'s favorite reality show','Your guilty pleasure reality show','The reality show you pretend you don\'t watch'],
      ['Live TV meltdown','Reunion show confrontation','Social media post-show drama'],
      ['Watching reality TV ironically','Watching reality TV unironically','Being a serious reality TV analyst'],
      ['Someone who spoils the reality show','Someone who live-tweets the reality show','Someone who writes recaps of the reality show'],
      ['A reality TV catchphrase that entered the language','A reality TV moment that became a meme','A reality TV scandal that made actual news'],
      ['Love Island on the first day','Love Island during Casa Amor','Love Island at the final coupling'],
      ['The most overpaid reality star','The most underpaid reality star','The reality star who made bank after the show'],
      ['Person who peaked on reality TV','Person whose career started on reality TV','Person who wishes they\'d never gone on reality TV'],
      ['A challenge involving eating gross food','A challenge involving heights','A challenge involving your ex'],
      ['The worst reality TV host decision','The worst reality TV twist','The worst reality TV casting choice'],
      ['An elimination that shocked everyone','An elimination that was rigged','An elimination that was fair but still hurt'],
      ['Your reality TV hot take','Your reality TV unpopular opinion','Your reality TV hill to die on'],
      ['Meeting a reality TV star in real life','Going on a reality TV date','Being a background extra on a reality show'],
      ['Season finale cliffhanger','Midseason surprise elimination','Premiere night drama'],
      ['The contestant with the tragic backstory','The contestant with the villain edit','The contestant with the invisible edit'],
      ['Confessional room tears','Confessional room shade','Confessional room breaking the fourth wall'],
      ['Your friend who acts like a reality TV contestant','Your family member who should be on reality TV','Your coworker who would get eliminated first'],
      ['Never watching reality TV again','Only watching reality TV forever','Being on reality TV yourself']
    ]
  }
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
