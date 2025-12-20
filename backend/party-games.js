// party-games.js - Separate module for party games
// Place this file in the same directory as server.js

// ==================== TRIVIA QUESTION BANKS ====================
const triviaQuestions = {
    general: [
        { question: "What is the largest mammal in the world?", options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"], correct: 1 },
        { question: "How many days are in a leap year?", options: ["364", "365", "366", "367"], correct: 2 },
        { question: "Which color is NOT in the rainbow?", options: ["Red", "Pink", "Indigo", "Violet"], correct: 1 },
        { question: "What currency is used in the United Kingdom?", options: ["Euro", "Dollar", "Pound Sterling", "Yen"], correct: 2 },
        { question: "How many legs does a spider have?", options: ["6", "8", "10", "12"], correct: 1 },
        { question: "What is the hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Platinum"], correct: 2 },
        { question: "Which fruit is associated with Isaac Newton?", options: ["Pear", "Apple", "Orange", "Fig"], correct: 1 },
        { question: "What does 'www' stand for?", options: ["World Wide Web", "World Web Wares", "Wide World Web", "Web Wide World"], correct: 0 },
        { question: "How many players are on a soccer team on the field?", options: ["9", "10", "11", "12"], correct: 2 },
        { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
        { question: "What is the chemical symbol for water?", options: ["HO2", "H2O", "O2H", "HOH"], correct: 1 },
        { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], correct: 2 },
        { question: "What is the boiling point of water?", options: ["90°C", "100°C", "110°C", "120°C"], correct: 1 },
        { question: "Which animal is known as the 'Ship of the Desert'?", options: ["Horse", "Camel", "Elephant", "Donkey"], correct: 1 },
        { question: "How many letters are in the English alphabet?", options: ["24", "25", "26", "27"], correct: 2 }
    ],
    history: [
        { question: "Who was the first President of the United States?", options: ["Abraham Lincoln", "Thomas Jefferson", "George Washington", "John Adams"], correct: 2 },
        { question: "In which year did the Titanic sink?", options: ["1910", "1912", "1914", "1920"], correct: 1 },
        { question: "Who was the first man on the moon?", options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Michael Collins"], correct: 2 },
        { question: "Which ancient civilization built the Pyramids?", options: ["Romans", "Greeks", "Egyptians", "Mayans"], correct: 2 },
        { question: "What year did the Berlin Wall fall?", options: ["1987", "1988", "1989", "1990"], correct: 2 },
        { question: "Who wrote the Declaration of Independence?", options: ["George Washington", "Benjamin Franklin", "Thomas Jefferson", "Alexander Hamilton"], correct: 2 },
        { question: "What was the name of the ship that brought the Pilgrims to America?", options: ["Santa Maria", "Mayflower", "Titanic", "Endeavour"], correct: 1 },
        { question: "Which queen ruled the UK for 70 years?", options: ["Victoria", "Elizabeth I", "Elizabeth II", "Mary"], correct: 2 },
        { question: "Who discovered America in 1492?", options: ["Magellan", "Columbus", "Vasco da Gama", "Cook"], correct: 1 },
        { question: "The Industrial Revolution began in which country?", options: ["USA", "France", "Germany", "Great Britain"], correct: 3 },
        { question: "Who was assassinated to spark WWI?", options: ["JFK", "Archduke Franz Ferdinand", "Tsar Nicholas II", "King George V"], correct: 1 },
        { question: "What year did the US moon landing occur?", options: ["1965", "1969", "1971", "1975"], correct: 1 },
        { question: "Nelson Mandela was the president of which country?", options: ["Nigeria", "Kenya", "South Africa", "Zimbabwe"], correct: 2 },
        { question: "Who was the French military leader who declared himself Emperor?", options: ["Louis XVI", "Charlemagne", "Napoleon Bonaparte", "Robespierre"], correct: 2 },
        { question: "Which empire was ruled by Julius Caesar?", options: ["Greek", "Roman", "Ottoman", "Mongol"], correct: 1 }
    ],
    wars: [
        { question: "What year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2 },
        { question: "Which country attacked Pearl Harbor?", options: ["Germany", "Italy", "Japan", "Russia"], correct: 2 },
        { question: "Who was the leader of Nazi Germany?", options: ["Mussolini", "Stalin", "Hitler", "Franco"], correct: 2 },
        { question: "The 'Cold War' was primarily between the USA and which other power?", options: ["China", "Soviet Union", "Germany", "Cuba"], correct: 1 },
        { question: "Which war was fought between the North and South states of the USA?", options: ["Revolutionary War", "Civil War", "War of 1812", "Vietnam War"], correct: 1 },
        { question: "What was the code name for the D-Day invasion?", options: ["Operation Overlord", "Operation Barbarossa", "Operation Desert Storm", "Operation Torch"], correct: 0 },
        { question: "Which city was the first atomic bomb dropped on?", options: ["Nagasaki", "Tokyo", "Hiroshima", "Kyoto"], correct: 2 },
        { question: "The Hundred Years' War was fought between which two countries?", options: ["Spain and France", "England and France", "Germany and Russia", "England and Spain"], correct: 1 },
        { question: "Who lost the Battle of Waterloo?", options: ["Wellington", "Napoleon", "Blucher", "Nelson"], correct: 1 },
        { question: "The Vietnam War took place in which two decades?", options: ["40s and 50s", "50s and 60s", "60s and 70s", "70s and 80s"], correct: 2 },
        { question: "Which ancient city did the Greeks capture using a giant wooden horse?", options: ["Sparta", "Athens", "Troy", "Rome"], correct: 2 },
        { question: "What defines a 'Blitzkrieg'?", options: ["Trench warfare", "Lightning war", "Naval blockade", "Air only"], correct: 1 },
        { question: "Who was the British Prime Minister during most of WWII?", options: ["Chamberlain", "Churchill", "Attlee", "Thatcher"], correct: 1 },
        { question: "The invasion of which country triggered WWII?", options: ["France", "Poland", "Austria", "Belgium"], correct: 1 },
        { question: "Which war is often called 'The Great War'?", options: ["WWI", "WWII", "Civil War", "Gulf War"], correct: 0 }
    ],
    science: [
        { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Cytoplasm"], correct: 2 },
        { question: "What symbol represents Gold on the periodic table?", options: ["Go", "Gd", "Ag", "Au"], correct: 3 },
        { question: "What is the closest star to Earth?", options: ["Proxima Centauri", "The Sun", "Sirius", "Alpha Centauri"], correct: 1 },
        { question: "Who developed the theory of relativity?", options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Stephen Hawking"], correct: 1 },
        { question: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], correct: 1 },
        { question: "What is the speed of light approx?", options: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "Sound speed"], correct: 0 },
        { question: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Mars"], correct: 1 },
        { question: "What is the main organ of the circulatory system?", options: ["Lungs", "Brain", "Heart", "Liver"], correct: 2 },
        { question: "What is the chemical formula for table salt?", options: ["H2O", "NaCl", "CO2", "HCl"], correct: 1 },
        { question: "At what temperature does water freeze (Celsius)?", options: ["0", "32", "100", "-10"], correct: 0 },
        { question: "Which element is needed for combustion?", options: ["Hydrogen", "Nitrogen", "Oxygen", "Helium"], correct: 2 },
        { question: "What is the study of fossils called?", options: ["Biology", "Geology", "Paleontology", "Archaeology"], correct: 2 },
        { question: "How many bones are in the adult human body?", options: ["186", "206", "226", "306"], correct: 1 },
        { question: "Which planet is the hottest?", options: ["Mercury", "Venus", "Mars", "Jupiter"], correct: 1 },
        { question: "What part of the atom has a positive charge?", options: ["Electron", "Neutron", "Proton", "Quark"], correct: 2 }
    ],
    geography: [
        { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2 },
        { question: "Which is the largest continent?", options: ["Africa", "North America", "Europe", "Asia"], correct: 3 },
        { question: "What is the longest river in the world?", options: ["Nile", "Amazon", "Yangtze", "Mississippi"], correct: 0 },
        { question: "Which country has the largest population?", options: ["USA", "India", "China", "Russia"], correct: 1 },
        { question: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Montreal", "Ottawa"], correct: 3 },
        { question: "In which country would you find the Eiffel Tower?", options: ["Italy", "Spain", "France", "Germany"], correct: 2 },
        { question: "Which US state is an island?", options: ["Florida", "Alaska", "Hawaii", "Rhode Island"], correct: 2 },
        { question: "What is the largest desert in the world?", options: ["Sahara", "Gobi", "Antarctic", "Arabian"], correct: 2 },
        { question: "Which country looks like a boot?", options: ["Spain", "Greece", "Italy", "Portugal"], correct: 2 },
        { question: "Mount Everest is located in which mountain range?", options: ["Rockies", "Andes", "Alps", "Himalayas"], correct: 3 },
        { question: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], correct: 1 },
        { question: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
        { question: "Which country is known as the Land of the Rising Sun?", options: ["China", "Korea", "Japan", "Thailand"], correct: 2 },
        { question: "What river flows through London?", options: ["Seine", "Thames", "Danube", "Rhine"], correct: 1 },
        { question: "Which continent is the Sahara Desert in?", options: ["Asia", "South America", "Africa", "Australia"], correct: 2 }
    ],
    popculture: [
        { question: "Who has the most followers on Instagram (2024)?", options: ["Selena Gomez", "Kylie Jenner", "Cristiano Ronaldo", "Lionel Messi"], correct: 2 },
        { question: "What was the highest-grossing movie of 2023?", options: ["Oppenheimer", "Super Mario Bros", "Barbie", "Guardians 3"], correct: 2 },
        { question: "Who bought Twitter and renamed it X?", options: ["Jeff Bezos", "Mark Zuckerberg", "Bill Gates", "Elon Musk"], correct: 3 },
        { question: "Which artist has fans called 'Swifties'?", options: ["Katy Perry", "Taylor Swift", "Ariana Grande", "Lady Gaga"], correct: 1 },
        { question: "What color was the dress that broke the internet?", options: ["Blue/Black", "White/Gold", "Both", "Red/Green"], correct: 2 },
        { question: "Which YouTuber created 'Squid Game in Real Life'?", options: ["PewDiePie", "MrBeast", "Logan Paul", "KSI"], correct: 1 },
        { question: "What is the name of the viral dance from 'Wednesday'?", options: ["Goo Goo Muck", "Bloody Mary", "Thriller", "Monster Mash"], correct: 0 },
        { question: "Who slapped Chris Rock at the Oscars?", options: ["Kevin Hart", "Will Smith", "Dwayne Johnson", "Kanye West"], correct: 1 },
        { question: "What was the most streamed song on Spotify in 2023?", options: ["As It Was", "Flowers", "Anti-Hero", "Kill Bill"], correct: 1 },
        { question: "Which app popularized short-form vertical video?", options: ["Instagram", "Vine", "TikTok", "Snapchat"], correct: 2 },
        { question: "Who is married to Hailey Bieber?", options: ["Shawn Mendes", "Harry Styles", "Justin Bieber", "Drake"], correct: 2 },
        { question: "Which show features 'The Upside Down'?", options: ["Dark", "Stranger Things", "Black Mirror", "Riverdale"], correct: 1 },
        { question: "What does 'GOAT' stand for?", options: ["Greatest Of All Time", "Good On Any Terrain", "Game Of All Tournaments", "Giving Out All Things"], correct: 0 },
        { question: "Who performed at the 2024 Super Bowl Halftime show?", options: ["Rihanna", "Usher", "The Weeknd", "Beyonce"], correct: 1 },
        { question: "Which couple is known as 'Bennifer'?", options: ["Ben & Jennifer", "Brad & Jen", "Bill & Jen", "Bob & Jen"], correct: 0 }
    ],
    brainrot: [
        { question: "What term describes excessive charm or ability to pull?", options: ["Drip", "Rizz", "Bet", "Cap"], correct: 1 },
        { question: "Who is the 'Skibidi Toilet' creator?", options: ["DaFuq!?Boom!", "MrBeast", "IShowSpeed", "Kai Cenat"], correct: 0 },
        { question: "What does 'no cap' mean?", options: ["No hat", "No lie", "No money", "No loud noise"], correct: 1 },
        { question: "What is the 'Fanum Tax'?", options: ["A government tax", "Taking a bite of food", "Paying a streamer", "A dance move"], correct: 1 },
        { question: "Which state is meme'd as being chaotic and weird?", options: ["Florida", "Ohio", "Texas", "Wyoming"], correct: 1 },
        { question: "What flavor was the viral Grimace Shake?", options: ["Strawberry", "Blueberry", "Berry/Vanilla", "Grape"], correct: 2 },
        { question: "What does 'Gyatt' usually refer to?", options: ["A gun", "Surprise", "Big butt", "Get Your Act Together"], correct: 2 },
        { question: "If someone is a 'Sigma', they are:", options: ["A lone wolf", "A follower", "Weak", "Loud"], correct: 0 },
        { question: "Which streamer is known for barking and screaming?", options: ["Adin Ross", "IShowSpeed", "xQc", "Ninja"], correct: 1 },
        { question: "What does it mean to 'mew'?", options: ["Cat noises", "Jawline exercise", "Crying", "Sleeping"], correct: 1 },
        { question: "Finish the phrase: 'What the ____ doing?'", options: ["Cat", "Dog", "Baby", "Bird"], correct: 1 },
        { question: "What is 'Baby Gronk' famous for?", options: ["Football/Rizzing Livvy", "Basketball", "Singing", "Fortnite"], correct: 0 },
        { question: "What happened to the Titan submersible?", options: ["It found Titanic", "It imploded", "It got lost", "It ran out of gas"], correct: 1 },
        { question: "What is a 'Karen'?", options: ["A nice lady", "An entitled woman", "A dog lover", "A teacher"], correct: 1 },
        { question: "If something is 'mid', it is:", options: ["Great", "Average/Bad", "Small", "Expensive"], correct: 1 }
    ],
    bollywood: [
        { question: "Who is known as the 'King of Bollywood'?", options: ["Salman Khan", "Aamir Khan", "Shah Rukh Khan", "Akshay Kumar"], correct: 2 },
        { question: "Which movie features the song 'Naatu Naatu'?", options: ["Baahubali", "Pushpa", "RRR", "KGF"], correct: 2 },
        { question: "Who played the lead role in 'Dangal'?", options: ["Salman Khan", "Aamir Khan", "Hrithik Roshan", "Ranbir Kapoor"], correct: 1 },
        { question: "In 'Sholay', what was the villain's name?", options: ["Mogambo", "Gabbar Singh", "Shakaal", "Kancha Cheena"], correct: 1 },
        { question: "Which actress made her Hollywood debut in 'XXX: Return of Xander Cage'?", options: ["Priyanka Chopra", "Deepika Padukone", "Aishwarya Rai", "Alia Bhatt"], correct: 1 },
        { question: "What is the longest-running Bollywood movie in theaters?", options: ["Sholay", "DDLJ", "3 Idiots", "Lagaan"], correct: 1 },
        { question: "Who is Amitabh Bachchan's son?", options: ["Ranbir", "Abhishek", "Tiger", "Shahid"], correct: 1 },
        { question: "Which movie has the dialogue 'Pushpa, I hate tears'?", options: ["Amar Prem", "Deewar", "Sholay", "Don"], correct: 0 },
        { question: "Who is the female lead in 'Padmaavat'?", options: ["Deepika Padukone", "Kareena Kapoor", "Katrina Kaif", "Anushka Sharma"], correct: 0 },
        { question: "Which Indian actor won Miss World 2000?", options: ["Sushmita Sen", "Aishwarya Rai", "Priyanka Chopra", "Lara Dutta"], correct: 2 },
        { question: "What is the name of Salman Khan's character in 'Dabangg'?", options: ["Radhe", "Chulbul Pandey", "Prem", "Tiger"], correct: 1 },
        { question: "Who directed 'Kuch Kuch Hota Hai'?", options: ["Yash Chopra", "Karan Johar", "Sanjay Leela Bhansali", "Aditya Chopra"], correct: 1 },
        { question: "Which song features the 'Hook Step'?", options: ["Chammak Challo", "Nacho Nacho", "Jhoome Jo Pathaan", "All of them"], correct: 3 },
        { question: "Who starred in '3 Idiots'?", options: ["Aamir Khan", "SRK", "Salman Khan", "Akshay Kumar"], correct: 0 },
        { question: "What does 'KGF' stand for?", options: ["Kolar Gold Fields", "Kerala Gold Factory", "Karnataka Gold Fields", "King Gold Fort"], correct: 0 }
    ],
    hollywood: [
        { question: "Who plays Iron Man in the MCU?", options: ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo"], correct: 1 },
        { question: "What movie won Best Picture at the 2024 Oscars?", options: ["Barbie", "Oppenheimer", "Killers of the Flower Moon", "Poor Things"], correct: 1 },
        { question: "Who directed 'Titanic' and 'Avatar'?", options: ["Steven Spielberg", "Christopher Nolan", "James Cameron", "Quentin Tarantino"], correct: 2 },
        { question: "Which actor voiced the Genie in the original 'Aladdin'?", options: ["Eddie Murphy", "Robin Williams", "Jim Carrey", "Will Smith"], correct: 1 },
        { question: "What is the highest-grossing film of all time (as of 2024)?", options: ["Avengers: Endgame", "Avatar", "Titanic", "Star Wars: The Force Awakens"], correct: 1 },
        { question: "Who played Barbie in the 2023 movie?", options: ["Emma Stone", "Margot Robbie", "Scarlett Johansson", "Jennifer Lawrence"], correct: 1 },
        { question: "Which movie features the quote 'I'll be back'?", options: ["Rambo", "Terminator", "Rocky", "Die Hard"], correct: 1 },
        { question: "Who is the voice of Woody in 'Toy Story'?", options: ["Tim Allen", "Tom Hanks", "Billy Crystal", "Steve Carell"], correct: 1 },
        { question: "In 'Mean Girls', what day do they wear pink?", options: ["Monday", "Tuesday", "Wednesday", "Friday"], correct: 2 },
        { question: "Which actor plays John Wick?", options: ["Keanu Reeves", "Tom Cruise", "Brad Pitt", "Matt Damon"], correct: 0 },
        { question: "What is the name of the hobbit played by Elijah Wood?", options: ["Bilbo", "Frodo", "Sam", "Merry"], correct: 1 },
        { question: "Who directed 'Pulp Fiction'?", options: ["Scorsese", "Tarantino", "Nolan", "Coppola"], correct: 1 },
        { question: "Which studio was bought by Disney in 2012?", options: ["Pixar", "Lucasfilm", "Marvel", "Fox"], correct: 1 },
        { question: "Who played the Joker in 'The Dark Knight'?", options: ["Joaquin Phoenix", "Jared Leto", "Heath Ledger", "Jack Nicholson"], correct: 2 },
        { question: "What franchise features 'Dominic Toretto'?", options: ["Need for Speed", "Fast & Furious", "Transporter", "Mission Impossible"], correct: 1 }
    ],
    sports: [
        { question: "Which country won the 2022 FIFA World Cup?", options: ["France", "Brazil", "Argentina", "Germany"], correct: 2 },
        { question: "Who has the most NBA championships as a player?", options: ["Michael Jordan", "LeBron James", "Bill Russell", "Kobe Bryant"], correct: 2 },
        { question: "What sport is played at Wimbledon?", options: ["Cricket", "Golf", "Tennis", "Rugby"], correct: 2 },
        { question: "How long is a marathon?", options: ["20 miles", "26.2 miles", "30 miles", "13.1 miles"], correct: 1 },
        { question: "In which sport would you perform a 'slam dunk'?", options: ["Volleyball", "Tennis", "Basketball", "Soccer"], correct: 2 },
        { question: "Who is known as 'CR7'?", options: ["Messi", "Ronaldo", "Neymar", "Mbappe"], correct: 1 },
        { question: "What is the national sport of Japan?", options: ["Judo", "Sumo Wrestling", "Karate", "Baseball"], correct: 1 },
        { question: "How many rings are in the Olympic logo?", options: ["4", "5", "6", "7"], correct: 1 },
        { question: "Which country invented Cricket?", options: ["India", "Australia", "England", "South Africa"], correct: 2 },
        { question: "Who is the fastest man in history?", options: ["Carl Lewis", "Usain Bolt", "Tyson Gay", "Yohan Blake"], correct: 1 },
        { question: "The Super Bowl is the final game of which league?", options: ["NBA", "MLB", "NFL", "NHL"], correct: 2 },
        { question: "What does 'KO' stand for in boxing?", options: ["Kick Out", "Knock Out", "Keep On", "Knock Off"], correct: 1 },
        { question: "How many players are on a baseball team?", options: ["9", "10", "11", "8"], correct: 0 },
        { question: "Which golfer is nicknamed 'Tiger'?", options: ["Rory McIlroy", "Phil Mickelson", "Eldrick Woods", "Jack Nicklaus"], correct: 2 },
        { question: "Where were the 2024 Summer Olympics held?", options: ["Tokyo", "Los Angeles", "Paris", "London"], correct: 2 }
    ],
    music: [
        { question: "Who is the 'King of Pop'?", options: ["Elvis", "Prince", "Michael Jackson", "Justin Timberlake"], correct: 2 },
        { question: "Which band sings 'Bohemian Rhapsody'?", options: ["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd"], correct: 2 },
        { question: "What is Eminem's real name?", options: ["Marshall Mathers", "Shawn Carter", "Curtis Jackson", "Calvin Broadus"], correct: 0 },
        { question: "Who sings 'Shape of You'?", options: ["Justin Bieber", "Ed Sheeran", "Shawn Mendes", "Harry Styles"], correct: 1 },
        { question: "Which K-Pop group has members Jin, Suga, and RM?", options: ["EXO", "Blackpink", "BTS", "Stray Kids"], correct: 2 },
        { question: "What instrument has 88 keys?", options: ["Guitar", "Piano", "Violin", "Drums"], correct: 1 },
        { question: "Who released the album 'Renaissance' in 2022?", options: ["Rihanna", "Beyonce", "Adele", "Taylor Swift"], correct: 1 },
        { question: "Which Beatle was assassinated?", options: ["Paul McCartney", "Ringo Starr", "George Harrison", "John Lennon"], correct: 3 },
        { question: "What country is Drake from?", options: ["USA", "UK", "Canada", "Australia"], correct: 2 },
        { question: "Who sings 'Bad Guy'?", options: ["Olivia Rodrigo", "Billie Eilish", "Dua Lipa", "Doja Cat"], correct: 1 },
        { question: "What genre is Bob Marley associated with?", options: ["Jazz", "Reggae", "Blues", "Rock"], correct: 1 },
        { question: "How many strings does a standard violin have?", options: ["4", "5", "6", "3"], correct: 0 },
        { question: "Who is Miley Cyrus's father?", options: ["Billy Ray Cyrus", "Johnny Cash", "Willie Nelson", "Dolly Parton"], correct: 0 },
        { question: "Which female artist has the most Grammys?", options: ["Adele", "Beyonce", "Taylor Swift", "Aretha Franklin"], correct: 1 },
        { question: "What band was Harry Styles in?", options: ["NSYNC", "Backstreet Boys", "One Direction", "Jonas Brothers"], correct: 2 }
    ],
    gaming: [
        { question: "Who is the mascot of Nintendo?", options: ["Link", "Pikachu", "Mario", "Sonic"], correct: 2 },
        { question: "What game features 'creepers'?", options: ["Roblox", "Fortnite", "Minecraft", "Terraria"], correct: 2 },
        { question: "What is the best-selling video game of all time?", options: ["GTA V", "Tetris", "Minecraft", "Wii Sports"], correct: 2 },
        { question: "In 'Among Us', what are the bad guys called?", options: ["Killers", "Traitors", "Impostors", "Aliens"], correct: 2 },
        { question: "Which game features a 'Battle Royale' mode?", options: ["Fortnite", "FIFA", "The Sims", "Zelda"], correct: 0 },
        { question: "What is the name of the princess in Zelda?", options: ["Peach", "Daisy", "Zelda", "Samus"], correct: 2 },
        { question: "Which company makes the PlayStation?", options: ["Microsoft", "Sony", "Nintendo", "Sega"], correct: 1 },
        { question: "What is Master Chief's AI companion called?", options: ["Siri", "Alexa", "Cortana", "GLaDOS"], correct: 2 },
        { question: "In Pokemon, which type is super effective against Fire?", options: ["Grass", "Water", "Ice", "Bug"], correct: 1 },
        { question: "What city is GTA V set in?", options: ["Liberty City", "Vice City", "Los Santos", "San Fierro"], correct: 2 },
        { question: "What year did the first iPhone game release?", options: ["2007", "2008", "2009", "2010"], correct: 1 },
        { question: "Who is the main character in 'God of War'?", options: ["Zeus", "Kratos", "Thor", "Hades"], correct: 1 },
        { question: "Which game popularized the term 'no-scope'?", options: ["Call of Duty", "Halo", "Counter-Strike", "Overwatch"], correct: 0 },
        { question: "What color is Pac-Man?", options: ["Red", "Yellow", "Blue", "Green"], correct: 1 },
        { question: "E-Sports often refers to competitive playing of which game?", options: ["Candy Crush", "League of Legends", "Animal Crossing", "Sims"], correct: 1 }
    ],
    anime: [
        { question: "Who is the main character of Dragon Ball?", options: ["Vegeta", "Gohan", "Goku", "Piccolo"], correct: 2 },
        { question: "In 'One Piece', what does Luffy want to become?", options: ["Hokage", "Pirate King", "Wizard King", "Soul King"], correct: 1 },
        { question: "What is the name of Naruto's village?", options: ["Sand", "Mist", "Leaf", "Cloud"], correct: 2 },
        { question: "Which anime features Titans eating humans?", options: ["Tokyo Ghoul", "Attack on Titan", "Bleach", "Demon Slayer"], correct: 1 },
        { question: "Who writes the name of people to kill them?", options: ["L", "Light Yagami", "Ryuk", "Near"], correct: 1 },
        { question: "What is the name of Ash Ketchum's first Pokemon?", options: ["Charmander", "Squirtle", "Bulbasaur", "Pikachu"], correct: 3 },
        { question: "In 'Demon Slayer', what does Tanjiro carry in the box?", options: ["His sword", "His sister", "Food", "Gold"], correct: 1 },
        { question: "Who is the 'One Punch Man'?", options: ["Genos", "Saitama", "Bang", "King"], correct: 1 },
        { question: "What is the currency in the Pokemon world?", options: ["Dollars", "Yen", "Pokedollars", "Gil"], correct: 2 },
        { question: "Which anime is about a family of spies and assassins?", options: ["Spy x Family", "My Hero Academia", "Hunter x Hunter", "Blue Lock"], correct: 0 },
        { question: "What is the highest rank in the Demon Slayer Corps?", options: ["Hashira", "Kage", "Captain", "Admiral"], correct: 0 },
        { question: "In 'Jujutsu Kaisen', who is the strongest sorcerer?", options: ["Itadori", "Megumi", "Gojo", "Sukuna"], correct: 2 },
        { question: "How many Dragon Balls are there?", options: ["5", "6", "7", "8"], correct: 2 },
        { question: "Which anime features a 'Rubber Man'?", options: ["Naruto", "One Piece", "Bleach", "Fairy Tail"], correct: 1 },
        { question: "What studio produced 'Spirited Away'?", options: ["Toei", "MAPPA", "Ghibli", "Madhouse"], correct: 2 }
    ],
    food: [
        { question: "Sushi originated in which country?", options: ["China", "Japan", "Korea", "Thailand"], correct: 1 },
        { question: "What is the main ingredient in Guacamole?", options: ["Tomato", "Onion", "Avocado", "Pepper"], correct: 2 },
        { question: "Which pasta shape looks like a bow tie?", options: ["Penne", "Fusilli", "Farfalle", "Rigatoni"], correct: 2 },
        { question: "What is the most expensive spice in the world?", options: ["Cinnamon", "Vanilla", "Saffron", "Cardamom"], correct: 2 },
        { question: "Which country invented Pizza?", options: ["USA", "France", "Italy", "Greece"], correct: 2 },
        { question: "What is Tofu made from?", options: ["Milk", "Soybeans", "Chickpeas", "Almonds"], correct: 1 },
        { question: "What is the spicy green paste served with sushi?", options: ["Wasabi", "Ginger", "Mustard", "Pesto"], correct: 0 },
        { question: "Which fruit has seeds on the outside?", options: ["Apple", "Kiwi", "Strawberry", "Banana"], correct: 2 },
        { question: "What is the main ingredient in Hummus?", options: ["Lentils", "Chickpeas", "Beans", "Peas"], correct: 1 },
        { question: "Croissants are associated with which country?", options: ["Germany", "Italy", "France", "Spain"], correct: 2 },
        { question: "What is the sweet substance made by bees?", options: ["Nectar", "Pollen", "Honey", "Wax"], correct: 2 },
        { question: "Which nut is used to make Marzipan?", options: ["Peanut", "Walnut", "Almond", "Cashew"], correct: 2 },
        { question: "What is a dried grape called?", options: ["Prune", "Date", "Raisin", "Fig"], correct: 2 },
        { question: "Which of these is NOT a dairy product?", options: ["Cheese", "Yogurt", "Butter", "Mayonnaise"], correct: 3 },
        { question: "Gouda is a type of what?", options: ["Bread", "Cheese", "Meat", "Wine"], correct: 1 }
    ]
};

// ==================== THIS OR THAT QUESTIONS ====================
const thisOrThatQuestions = {
    mixed: [
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
        { optionA: "Coke", optionB: "Pepsi" },
        { optionA: "Sweet", optionB: "Savory" },
        { optionA: "Early Bird", optionB: "Night Owl" },
        { optionA: "Save Money", optionB: "Spend Money" },
        { optionA: "Introvert", optionB: "Extrovert" },
        { optionA: "iPhone", optionB: "Samsung" },
        { optionA: "Comedy", optionB: "Horror" },
        { optionA: "Online Shopping", optionB: "In-Store Shopping" },
        { optionA: "Music", optionB: "Podcasts" },
        { optionA: "McDonald's", optionB: "Burger King" },
        { optionA: "Hot Weather", optionB: "Cold Weather" },
        { optionA: "Sweet Breakfast", optionB: "Savory Breakfast" },
        { optionA: "Window Seat", optionB: "Aisle Seat" },
        { optionA: "Physical Books", optionB: "E-Books" },
        { optionA: "Bath", optionB: "Shower" },
        { optionA: "Small Party", optionB: "Big Party" }
    ],
    lifestyle: [
        { optionA: "Work from Home", optionB: "Work at Office" },
        { optionA: "Live in a Mansion Alone", optionB: "Live in an Apartment with Friends" },
        { optionA: "Cook at Home", optionB: "Eat Out" },
        { optionA: "Be Rich", optionB: "Be Famous" },
        { optionA: "More Time", optionB: "More Money" },
        { optionA: "Dream Job Low Pay", optionB: "Boring Job High Pay" },
        { optionA: "Live to Work", optionB: "Work to Live" },
        { optionA: "Rent Forever", optionB: "30-Year Mortgage" },
        { optionA: "Start Your Own Business", optionB: "Climb Corporate Ladder" },
        { optionA: "Minimalist Life", optionB: "Maximalist Life" }
    ],
    hypothetical: [
        { optionA: "Read Minds", optionB: "See the Future" },
        { optionA: "Live 100 Years in Past", optionB: "Live 100 Years in Future" },
        { optionA: "Never Age", optionB: "Never Get Sick" },
        { optionA: "Be the Smartest Person", optionB: "Be the Most Attractive Person" },
        { optionA: "Know How You Die", optionB: "Know When You Die" },
        { optionA: "Unlimited Money", optionB: "Unlimited Love" },
        { optionA: "Be Able to Fly", optionB: "Be Able to Teleport" },
        { optionA: "Talk to Animals", optionB: "Speak All Languages" },
        { optionA: "Relive Your Life", optionB: "Start Fresh as a Baby" },
        { optionA: "No Internet for a Year", optionB: "No AC/Heat for a Year" }
    ]
};

// ==================== HOT TAKES QUESTIONS ====================
const hotTakesQuestions = {
    mild: [
        { statement: "Pineapple belongs on pizza" },
        { statement: "The book is always better than the movie" },
        { statement: "Monday is the worst day of the week" },
        { statement: "Water is the best drink" },
        { statement: "Breakfast for dinner is great" },
        { statement: "Dogs are better than cats" },
        { statement: "Coffee is overrated" },
        { statement: "Summer is the best season" },
        { statement: "Watching sports is boring" },
        { statement: "Naps are for lazy people" },
        { statement: "Cold pizza is better than reheated pizza" },
        { statement: "Cereal is a soup" },
        { statement: "Die Hard is a Christmas movie" },
        { statement: "Crocs are fashionable" },
        { statement: "Reality TV is actually entertaining" }
    ],
    medium: [
        { statement: "Social media has done more harm than good" },
        { statement: "Working from home is better than office work" },
        { statement: "Everyone should learn to code" },
        { statement: "AI will take most jobs" },
        { statement: "Tipping culture has gone too far" },
        { statement: "Money can buy happiness" },
        { statement: "College is a waste of money" },
        { statement: "Marriage is an outdated concept" },
        { statement: "Being famous would be terrible" },
        { statement: "Most people are actually lazy" },
        { statement: "Hustle culture is toxic" },
        { statement: "Influencers aren't real jobs" },
        { statement: "Video games are a waste of time" },
        { statement: "Climate change panic is overblown" },
        { statement: "Billionaires shouldn't exist" }
    ],
    spicy: [
        { statement: "People shouldn't have kids if they can't afford them" },
        { statement: "Ghosting is acceptable" },
        { statement: "It's okay to lie on your resume" },
        { statement: "Loyalty to employers is pointless" },
        { statement: "Most friendships are transactional" },
        { statement: "Therapy is overrated" },
        { statement: "Attractive people have it way easier" },
        { statement: "Most people peaked in high school" },
        { statement: "Hard work doesn't guarantee success" },
        { statement: "Most relationships are settling" },
        { statement: "Cancel culture has gone too far" },
        { statement: "Complaining about your life is boring" },
        { statement: "Most people are bad with money" },
        { statement: "Social anxiety is mostly an excuse" },
        { statement: "Age gaps in dating don't matter" }
    ]
};

// ==================== NEVER EVER QUESTIONS ====================
const neverEverQuestions = {
    clean: [
        { statement: "Never have I ever pulled an all-nighter" },
        { statement: "Never have I ever cried during a movie" },
        { statement: "Never have I ever sent a text to the wrong person" },
        { statement: "Never have I ever laughed at an inappropriate time" },
        { statement: "Never have I ever waved at someone who wasn't waving at me" },
        { statement: "Never have I ever binged an entire TV series in one day" },
        { statement: "Never have I ever eaten food off the floor" },
        { statement: "Never have I ever talked to myself out loud" },
        { statement: "Never have I ever had a crush on a fictional character" },
        { statement: "Never have I ever eaten an entire pizza by myself" },
        { statement: "Never have I ever forgotten someone's name right after meeting them" },
        { statement: "Never have I ever pretended to text to avoid talking to someone" },
        { statement: "Never have I ever walked into a glass door" },
        { statement: "Never have I ever sung in the shower" },
        { statement: "Never have I ever blamed a fart on someone else" }
    ],
    spicy: [
        { statement: "Never have I ever ghosted someone" },
        { statement: "Never have I ever pretended to be sick to skip work/school" },
        { statement: "Never have I ever stalked an ex on social media" },
        { statement: "Never have I ever lied on my resume" },
        { statement: "Never have I ever regifted a present" },
        { statement: "Never have I ever had a one night stand" },
        { statement: "Never have I ever cheated on a test" },
        { statement: "Never have I ever drunk texted someone" },
        { statement: "Never have I ever lied about my age" },
        { statement: "Never have I ever read someone's messages without permission" },
        { statement: "Never have I ever faked being busy to avoid plans" },
        { statement: "Never have I ever pretended to like a gift I hated" },
        { statement: "Never have I ever taken something from work" },
        { statement: "Never have I ever lied to get out of a date" },
        { statement: "Never have I ever eavesdropped on a conversation" }
    ],
    extreme: [
        { statement: "Never have I ever been kicked out of a bar" },
        { statement: "Never have I ever skinny dipped" },
        { statement: "Never have I ever had a secret relationship" },
        { statement: "Never have I ever lied about my job" },
        { statement: "Never have I ever stolen something" },
        { statement: "Never have I ever been arrested" },
        { statement: "Never have I ever broken up with someone via text" },
        { statement: "Never have I ever dated two people at once" },
        { statement: "Never have I ever gotten a tattoo I regret" },
        { statement: "Never have I ever slid into a celebrity's DMs" },
        { statement: "Never have I ever called in sick for a hangover" },
        { statement: "Never have I ever lied about my relationship status" },
        { statement: "Never have I ever said 'I love you' without meaning it" },
        { statement: "Never have I ever gotten into a physical fight" },
        { statement: "Never have I ever faked an emergency to leave somewhere" }
    ]
};

// ==================== BET OR BLUFF QUESTIONS ====================
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
    { question: "How many concerts have you attended?", unit: "concerts" },
    { question: "How many times have you moved homes?", unit: "times" },
    { question: "How many pets have you had in your life?", unit: "pets" },
    { question: "How many hours of TV do you watch per week?", unit: "hours" },
    { question: "How many different jobs have you had?", unit: "jobs" },
    { question: "How many first dates have you been on?", unit: "dates" },
    { question: "How many cups of coffee/tea per day?", unit: "cups" },
    { question: "How many minutes is your commute?", unit: "minutes" },
    { question: "How many followers do you have on social media?", unit: "followers" },
    { question: "How many times have you been to the ER?", unit: "times" },
    { question: "How many hours do you exercise per week?", unit: "hours" }
];

// ==================== SKETCH & GUESS WORD BANK ====================
const sketchWords = {
    animals: [
        "cat", "dog", "elephant", "giraffe", "lion", "tiger", "bear", "monkey", "penguin", "dolphin",
        "shark", "whale", "octopus", "jellyfish", "crab", "lobster", "turtle", "snake", "lizard", "frog",
        "butterfly", "bee", "spider", "ant", "snail", "bird", "eagle", "owl", "parrot", "flamingo",
        "horse", "cow", "pig", "sheep", "goat", "chicken", "duck", "rabbit", "mouse", "squirrel",
        "wolf", "fox", "deer", "moose", "kangaroo", "koala", "panda", "gorilla", "zebra", "hippo",
        "crocodile", "dinosaur", "dragon", "unicorn", "phoenix", "bat", "raccoon", "skunk", "otter", "seal"
    ],
    food: [
        "pizza", "hamburger", "hotdog", "taco", "burrito", "sushi", "ramen", "pasta", "spaghetti", "lasagna",
        "steak", "chicken", "bacon", "egg", "cheese", "bread", "sandwich", "toast", "pancakes", "waffle",
        "donut", "cake", "pie", "cookie", "ice cream", "chocolate", "candy", "popcorn", "chips", "fries",
        "apple", "banana", "orange", "grape", "strawberry", "watermelon", "pineapple", "mango", "lemon", "cherry",
        "carrot", "broccoli", "corn", "potato", "tomato", "onion", "mushroom", "pepper", "salad", "soup",
        "coffee", "tea", "milk", "juice", "soda", "beer", "wine", "smoothie", "milkshake", "cocktail"
    ],
    objects: [
        "phone", "laptop", "computer", "keyboard", "mouse", "headphones", "camera", "television", "remote", "clock",
        "chair", "table", "couch", "bed", "lamp", "mirror", "door", "window", "stairs", "elevator",
        "car", "bus", "train", "airplane", "helicopter", "boat", "bicycle", "motorcycle", "skateboard", "scooter",
        "book", "pencil", "pen", "scissors", "ruler", "backpack", "wallet", "key", "umbrella", "sunglasses",
        "shoe", "hat", "shirt", "pants", "dress", "jacket", "gloves", "scarf", "belt", "watch",
        "knife", "fork", "spoon", "plate", "cup", "bottle", "pan", "pot", "oven", "refrigerator"
    ],
    actions: [
        "running", "jumping", "swimming", "dancing", "singing", "sleeping", "eating", "drinking", "cooking", "reading",
        "writing", "drawing", "painting", "playing", "fighting", "crying", "laughing", "screaming", "whispering", "thinking",
        "driving", "flying", "climbing", "falling", "sliding", "rolling", "spinning", "bouncing", "throwing", "catching",
        "kissing", "hugging", "waving", "pointing", "clapping", "sneezing", "coughing", "yawning", "stretching", "flexing",
        "surfing", "skiing", "skating", "bowling", "fishing", "hunting", "camping", "hiking", "yoga", "meditation",
        "texting", "selfie", "twerking", "dabbing", "flossing", "moonwalk", "breakdancing", "karaoke", "vlogging", "gaming"
    ],
    movies: [
        "Star Wars", "Harry Potter", "Spider-Man", "Batman", "Superman", "Iron Man", "Hulk", "Thor", "Avengers", "X-Men",
        "Frozen", "Lion King", "Finding Nemo", "Toy Story", "Shrek", "Minions", "Moana", "Coco", "Up", "WALL-E",
        "Titanic", "Jurassic Park", "Jaws", "King Kong", "Godzilla", "Transformers", "Pirates of the Caribbean", "Indiana Jones", "James Bond", "Mission Impossible",
        "The Matrix", "Terminator", "Alien", "Predator", "Ghostbusters", "Back to the Future", "E.T.", "Avatar", "Inception", "Interstellar",
        "Squid Game", "Stranger Things", "Game of Thrones", "Breaking Bad", "The Office", "Friends", "Spongebob", "Pokemon", "Mario", "Minecraft",
        "Fortnite", "Among Us", "Pac-Man", "Tetris", "Angry Birds", "Candy Crush", "Flappy Bird", "Temple Run", "Subway Surfers", "Roblox"
    ],
    places: [
        "beach", "mountain", "forest", "desert", "island", "volcano", "waterfall", "cave", "river", "lake",
        "house", "apartment", "castle", "palace", "pyramid", "church", "temple", "mosque", "statue", "tower",
        "hospital", "school", "library", "museum", "zoo", "aquarium", "park", "playground", "stadium", "arena",
        "restaurant", "cafe", "bar", "club", "mall", "supermarket", "gym", "spa", "hotel", "airport",
        "Paris", "London", "New York", "Tokyo", "Dubai", "Hollywood", "Las Vegas", "Hawaii", "Disneyland", "Times Square",
        "space", "moon", "Mars", "heaven", "hell", "underwater", "jungle", "arctic", "haunted house", "amusement park"
    ],
    people: [
        "baby", "kid", "teenager", "adult", "grandma", "grandpa", "mom", "dad", "brother", "sister",
        "doctor", "nurse", "teacher", "chef", "police", "firefighter", "astronaut", "pilot", "soldier", "scientist",
        "king", "queen", "prince", "princess", "knight", "wizard", "witch", "vampire", "zombie", "ghost",
        "pirate", "ninja", "cowboy", "samurai", "gladiator", "superhero", "villain", "angel", "devil", "mermaid",
        "clown", "magician", "mime", "DJ", "rapper", "rockstar", "influencer", "youtuber", "gamer", "streamer",
        "Santa Claus", "Easter Bunny", "Tooth Fairy", "Cupid", "Grim Reaper", "Bigfoot", "alien", "robot", "caveman", "mummy"
    ],
    random: [
        "rainbow", "lightning", "tornado", "earthquake", "tsunami", "eclipse", "northern lights", "shooting star", "black hole", "galaxy",
        "heart", "brain", "skeleton", "muscle", "blood", "DNA", "cell", "virus", "bacteria", "medicine",
        "money", "diamond", "gold", "treasure", "lottery", "casino", "poker", "dice", "magic", "luck",
        "love", "hate", "fear", "happiness", "sadness", "anger", "surprise", "disgust", "jealousy", "pride",
        "time", "gravity", "electricity", "wifi", "bluetooth", "battery", "charging", "loading", "buffering", "lag",
        "Monday", "Friday", "weekend", "vacation", "birthday", "wedding", "funeral", "graduation", "retirement", "apocalypse"
    ]
};

// ==================== INIT FUNCTIONS ====================
function initTriviaRoyaleGame(room, category = 'general') {
    room.gameData = {
        questions: [],
        currentQuestionIndex: 0, 
        roundNumber: 1, 
        maxRounds: 10,
        phase: 'countdown', 
        answers: {}, 
        scores: {}, 
        streaks: {},
        timePerQuestion: 15, 
        roleAssignments: {},
        category: category
    };
    room.players.forEach(p => { 
        room.gameData.scores[p.name] = 0; 
        room.gameData.streaks[p.name] = 0; 
    });
}

function initThisOrThatPartyGame(room, category = 'mixed') {
    const questions = thisOrThatQuestions[category] || thisOrThatQuestions.mixed;
    room.gameData = {
        questions: [...questions].sort(() => Math.random() - 0.5).slice(0, 10),
        currentQuestionIndex: 0, 
        roundNumber: 1, 
        maxRounds: 10,
        phase: 'countdown', 
        votes: {}, 
        scores: {}, 
        timePerRound: 15, 
        roleAssignments: {},
        category: category
    };
    room.players.forEach(p => { room.gameData.scores[p.name] = 0; });
}

function initHotTakesPartyGame(room, category = 'mild') {
    const questions = hotTakesQuestions[category] || hotTakesQuestions.mild;
    room.gameData = {
        questions: [...questions].sort(() => Math.random() - 0.5).slice(0, 10),
        currentQuestionIndex: 0, 
        roundNumber: 1, 
        maxRounds: 10,
        phase: 'countdown', 
        ratings: {}, 
        scores: {}, 
        timePerRound: 20, 
        roleAssignments: {},
        category: category
    };
    room.players.forEach(p => { room.gameData.scores[p.name] = 0; });
}

function initNeverEverPartyGame(room, category = 'clean') {
    const questions = neverEverQuestions[category] || neverEverQuestions.clean;
    room.gameData = {
        questions: [...questions].sort(() => Math.random() - 0.5).slice(0, 12),
        currentQuestionIndex: 0, 
        roundNumber: 1, 
        maxRounds: 12,
        phase: 'countdown', 
        responses: {}, 
        scores: {}, 
        timePerRound: 15, 
        roleAssignments: {},
        category: category
    };
    room.players.forEach(p => { room.gameData.scores[p.name] = 0; });
}

function initBetOrBluffGame(room, startingPoints = 500) {
    room.gameData = {
        questions: [...betOrBluffQuestions].sort(() => Math.random() - 0.5).slice(0, 8),
        currentQuestionIndex: 0, 
        roundNumber: 1, 
        maxRounds: 8,
        phase: 'countdown', 
        guesses: {}, 
        bets: {}, 
        chips: {},
        timePerGuess: 20, 
        timePerBet: 30, 
        roleAssignments: {},
        startingPoints: startingPoints
    };
    room.players.forEach(p => { room.gameData.chips[p.name] = parseInt(startingPoints) || 500; });
}

function initSketchGuessGame(room, category = 'random') {
    let wordPool = [];
    
    // Check if custom words were provided (format: "custom:word1,word2,word3")
    if (category && category.startsWith('custom:')) {
        const customWordsStr = category.substring(7); // Remove "custom:" prefix
        wordPool = customWordsStr.split(',')
            .map(w => w.trim())
            .filter(w => w.length > 0 && w.length <= 30); // Filter empty and too-long words
        
        // Need at least 10 words for a good game
        if (wordPool.length < 10) {
            // Pad with random words if not enough custom words
            const randomWords = [...sketchWords.random].sort(() => Math.random() - 0.5);
            while (wordPool.length < 15 && randomWords.length > 0) {
                wordPool.push(randomWords.pop());
            }
        }
        console.log('[SKETCH] Using custom words:', wordPool.length, 'words');
    } else {
        // Use themed category
        if (category === 'random' || category === 'mixed' || !sketchWords[category]) {
            // Mix all categories for random
            Object.values(sketchWords).forEach(words => {
                wordPool = [...wordPool, ...words];
            });
        } else {
            // Use specific category + add some random for variety
            wordPool = [...sketchWords[category]];
            // Add 15 random words from other categories for variety
            const otherCategories = Object.keys(sketchWords).filter(k => k !== category);
            otherCategories.forEach(cat => {
                const shuffled = [...sketchWords[cat]].sort(() => Math.random() - 0.5);
                wordPool.push(...shuffled.slice(0, 5));
            });
        }
        console.log('[SKETCH] Using category:', category, 'with', wordPool.length, 'words');
    }
    
    // Shuffle word pool
    wordPool = wordPool.sort(() => Math.random() - 0.5);
    
    // Calculate rounds: each player draws once per round, 3 rounds total
    const roundsPerPlayer = 3;
    const totalTurns = room.players.length * roundsPerPlayer;
    
    room.gameData = {
        wordPool: wordPool,
        wordIndex: 0,
        currentTurn: 0,
        totalTurns: totalTurns,
        currentRound: 1,
        totalRounds: roundsPerPlayer,
        phase: 'countdown',
        currentDrawer: null,
        currentDrawerIndex: 0,
        currentWord: null,
        scores: {},
        guessedPlayers: [],
        timePerTurn: 60,
        hintLevel: 0,
        hintInterval: null,
        turnTimeout: null,
        wordChoiceTimeout: null,
        category: category
    };
    
    room.players.forEach(p => { room.gameData.scores[p.name] = 0; });
}

// ==================== HELPER ====================
function getTopPlayer(obj) {
    let max = -Infinity, winner = null;
    Object.entries(obj).forEach(([name, val]) => { 
        if (val > max) { max = val; winner = name; } 
    });
    return winner;
}

// Generate hint with underscores and revealed letters
function generateHint(word, revealCount) {
    const chars = word.split('');
    const letterIndices = chars.map((c, i) => c !== ' ' ? i : -1).filter(i => i !== -1);
    
    // Randomly select which letters to reveal
    const shuffledIndices = [...letterIndices].sort(() => Math.random() - 0.5);
    const toReveal = shuffledIndices.slice(0, revealCount);
    
    return chars.map((c, i) => {
        if (c === ' ') return '  ';
        if (toReveal.includes(i)) return c.toUpperCase();
        return '_';
    }).join(' ');
}

// Check if guess is close (similar to the word)
function isCloseGuess(guess, word) {
    const g = guess.toLowerCase().trim();
    const w = word.toLowerCase().trim();
    if (g === w) return false; // Exact match handled elsewhere
    
    // Check if guess contains the word or vice versa
    if (w.length > 3 && (g.includes(w) || w.includes(g))) return true;
    
    // Check for similar length and matching characters
    if (Math.abs(g.length - w.length) <= 2 && g.length >= 3) {
        let matchCount = 0;
        for (let i = 0; i < Math.min(g.length, w.length); i++) {
            if (g[i] === w[i]) matchCount++;
        }
        if (matchCount >= Math.floor(w.length * 0.6)) return true;
    }
    
    return false;
}

// Get next set of word choices
function getWordChoices(room, count = 3) {
    const gd = room.gameData;
    const choices = [];
    
    for (let i = 0; i < count && gd.wordIndex < gd.wordPool.length; i++) {
        choices.push(gd.wordPool[gd.wordIndex]);
        gd.wordIndex++;
    }
    
    // If we ran out of words, recycle
    if (choices.length < count) {
        gd.wordPool = gd.wordPool.sort(() => Math.random() - 0.5);
        gd.wordIndex = 0;
        while (choices.length < count && gd.wordIndex < gd.wordPool.length) {
            choices.push(gd.wordPool[gd.wordIndex]);
            gd.wordIndex++;
        }
    }
    
    return choices;
}

// ==================== RESULT CALCULATORS ====================
function calculateTriviaResults(room, io) {
    if (room.gameData.phase === 'results') return;
    room.gameData.phase = 'results';
    
    const q = room.gameData.questions[room.gameData.currentQuestionIndex];
    const results = [];
    
    Object.entries(room.gameData.answers).forEach(([pid, ans]) => {
        const p = room.players.find(x => x.id === pid);
        if (!p) return;
        const correct = ans.answerIndex === q.correct;
        let points = 0;
        
        if (correct) {
            const timeTaken = ans.timestamp - room.gameData.roundStartTime;
            const speedBonus = Math.max(0, Math.floor((15000 - timeTaken) / 150));
            points = 100 + speedBonus;
            
            room.gameData.streaks[p.name]++;
            if (room.gameData.streaks[p.name] >= 3) {
                points += 50;
            }
            
            room.gameData.scores[p.name] += points;
        } else { 
            room.gameData.streaks[p.name] = 0; 
        }
        
        results.push({ 
            playerName: p.name, 
            isCorrect: correct, 
            correct: correct,
            points: points,
            streak: room.gameData.streaks[p.name],
            isPremium: p.isPremium || false
        });
    });
    
    const leaderboard = Object.entries(room.gameData.scores)
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

    const isLastQuestion = room.gameData.roundNumber >= room.gameData.maxRounds;
    
    io.to(room.code).emit('trivia-results', { 
        correctAnswer: q.correct, 
        correctOption: q.options[q.correct],
        correctText: q.options[q.correct], 
        roundResults: results,
        results: results, 
        scores: room.gameData.scores,
        leaderboard: leaderboard,
        isLastQuestion: isLastQuestion
    });
    
    setTimeout(() => {
        if (!room.gameData) return;
        
        room.gameData.currentQuestionIndex++;
        room.gameData.roundNumber++;
        
        if (room.gameData.roundNumber > room.gameData.maxRounds) {
            io.to(room.code).emit('trivia-game-over', { 
                finalScores: room.gameData.scores,
                finalLeaderboard: Object.entries(room.gameData.scores)
                    .map(([name, score]) => {
                        const p = room.players.find(x => x.name === name);
                        return { 
                            name, 
                            score, 
                            isPremium: p?.isPremium || false,
                            cosmetics: p?.cosmetics || {}
                        };
                    })
                    .sort((a, b) => b.score - a.score),
                winner: getTopPlayer(room.gameData.scores) 
            });
        } else {
            const nextQ = room.gameData.questions[room.gameData.currentQuestionIndex];
            if (!nextQ) {
                io.to(room.code).emit('trivia-game-over', { 
                    finalScores: room.gameData.scores,
                    finalLeaderboard: Object.entries(room.gameData.scores)
                        .map(([name, score]) => {
                            const p = room.players.find(x => x.name === name);
                            return { 
                                name, 
                                score, 
                                isPremium: p?.isPremium || false,
                                cosmetics: p?.cosmetics || {}
                            };
                        })
                        .sort((a, b) => b.score - a.score),
                    winner: getTopPlayer(room.gameData.scores) 
                });
                return;
            }
            
            room.gameData.phase = 'question'; 
            room.gameData.answers = {}; 
            room.gameData.roundStartTime = Date.now();
            
            io.to(room.code).emit('trivia-question', { 
                question: nextQ.question, 
                options: nextQ.options, 
                questionIndex: room.gameData.currentQuestionIndex,
                roundNumber: room.gameData.roundNumber, 
                totalQuestions: room.gameData.maxRounds,
                totalRounds: room.gameData.maxRounds, 
                timeLimit: room.gameData.timePerQuestion 
            });
        }
    }, 2500);
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
    if (majority !== 'TIE') {
        (majority === 'A' ? votersA : votersB).forEach(n => room.gameData.scores[n] += 10);
    }
    
    const total = votesA + votesB;
    io.to(room.code).emit('thisorthat-party-results', { 
        optionA: q.optionA, 
        optionB: q.optionB, 
        votesA, 
        votesB, 
        votersA, 
        votersB, 
        majorityChoice: majority, 
        percentA: total ? Math.round(votesA/total*100) : 50, 
        percentB: total ? Math.round(votesB/total*100) : 50, 
        scores: room.gameData.scores 
    });
}

function calculateHotTakesPartyResults(room, io) {
    room.gameData.phase = 'results';
    const ratings = Object.values(room.gameData.ratings);
    const avg = ratings.length ? ratings.reduce((s,r) => s + r.rating, 0) / ratings.length : 3;
    const breakdown = {1:[],2:[],3:[],4:[],5:[]};
    
    ratings.forEach(r => breakdown[r.rating].push(r.playerName));
    
    let mode = 3, modeCount = 0;
    for (let i = 1; i <= 5; i++) {
        if (breakdown[i].length > modeCount) { 
            modeCount = breakdown[i].length; 
            mode = i; 
        }
    }
    
    breakdown[mode].forEach(n => room.gameData.scores[n] += 10);
    
    io.to(room.code).emit('hottakes-party-results', { 
        statement: room.gameData.questions[room.gameData.currentQuestionIndex].statement, 
        averageRating: Math.round(avg*10)/10, 
        modeRating: mode, 
        ratingBreakdown: breakdown, 
        scores: room.gameData.scores 
    });
}

function calculateNeverEverPartyResults(room, io) {
    room.gameData.phase = 'results';
    const haveList = [], haventList = [];
    
    Object.values(room.gameData.responses).forEach(r => {
        (r.response ? haveList : haventList).push(r.playerName);
    });
    
    const minority = haveList.length < haventList.length ? haveList : 
                    (haventList.length < haveList.length ? haventList : null);
    
    if (minority?.length) {
        minority.forEach(n => room.gameData.scores[n] += Math.min(20, Math.floor(20/minority.length)));
    }
    
    const total = haveList.length + haventList.length;
    io.to(room.code).emit('neverever-party-results', { 
        statement: room.gameData.questions[room.gameData.currentQuestionIndex].statement, 
        haveList, 
        haventList, 
        haveCount: haveList.length, 
        haventCount: haventList.length, 
        percentHave: total ? Math.round(haveList.length/total*100) : 50, 
        scores: room.gameData.scores 
    });
}

function startBettingPhase(room, io, roomCode) {
    room.gameData.phase = 'betting';
    const guesses = Object.values(room.gameData.guesses).sort((a,b) => a.guess - b.guess);
    io.to(roomCode).emit('betorbluff-betting-phase', { 
        guesses, 
        timeLimit: room.gameData.timePerBet, 
        chips: room.gameData.chips 
    });
}

function calculateBetOrBluffResults(room, io) {
    room.gameData.phase = 'results';
    const all = Object.values(room.gameData.guesses).map(g => g.guess).sort((a,b) => a-b);
    const mid = Math.floor(all.length/2);
    const target = all.length % 2 ? all[mid] : (all[mid-1]+all[mid])/2;
    
    let closestId = null, closestDiff = Infinity, closestName = null;
    Object.entries(room.gameData.guesses).forEach(([id, g]) => {
        const diff = Math.abs(g.guess - target);
        if (diff < closestDiff) { 
            closestDiff = diff; 
            closestId = id; 
            closestName = g.playerName; 
        }
    });
    
    Object.entries(room.gameData.bets).forEach(([pid, b]) => {
        const p = room.players.find(x => x.id === pid);
        if (!p) return;
        if (b.targetPlayerId === closestId) {
            room.gameData.chips[p.name] += b.betAmount;
        } else if (b.targetPlayerId) {
            room.gameData.chips[p.name] = Math.max(0, room.gameData.chips[p.name] - b.betAmount);
        }
    });
    
    if (closestName) room.gameData.chips[closestName] += 50;
    
    io.to(room.code).emit('betorbluff-results', { 
        targetValue: Math.round(target*10)/10, 
        closestPlayer: closestName, 
        allGuesses: Object.values(room.gameData.guesses), 
        chips: room.gameData.chips 
    });
}

// ==================== SKETCH & GUESS FUNCTIONS ====================
function startSketchTurn(room, io) {
    const gd = room.gameData;
    
    // Clear any existing timers
    if (gd.hintInterval) clearInterval(gd.hintInterval);
    if (gd.turnTimeout) clearTimeout(gd.turnTimeout);
    if (gd.wordChoiceTimeout) clearTimeout(gd.wordChoiceTimeout);
    
    // Get current drawer
    const drawer = room.players[gd.currentDrawerIndex];
    if (!drawer) return endSketchGame(room, io);
    
    gd.currentDrawer = drawer;
    gd.guessedPlayers = [];
    gd.hintLevel = 0;
    gd.phase = 'choosing';
    gd.canvasData = null; // Clear canvas data for new turn
    
    // Pick 3 random words for drawer to choose from
    const wordChoices = getWordChoices(room, 3);
    if (wordChoices.length === 0) return endSketchGame(room, io);
    
    // Send word choices only to drawer
    io.to(drawer.id).emit('sketch-choose-word', { words: wordChoices });
    
    // Notify others that drawer is choosing
    room.players.forEach(p => {
        if (p.id !== drawer.id) {
            io.to(p.id).emit('sketch-waiting-for-word', { drawerName: drawer.name });
        }
    });
    
    // Auto-select first word after 10 seconds if drawer doesn't choose
    gd.wordChoiceTimeout = setTimeout(() => {
        if (gd.phase === 'choosing' && wordChoices.length > 0) {
            handleWordSelected(room, io, wordChoices[0]);
        }
    }, 10000);
}

function handleWordSelected(room, io, word) {
    const gd = room.gameData;
    if (gd.phase !== 'choosing') return;
    
    clearTimeout(gd.wordChoiceTimeout);
    
    gd.currentWord = word;
    gd.phase = 'drawing';
    gd.turnStartTime = Date.now();
    
    const hint = generateHint(word, 0);
    const currentRound = Math.floor(gd.currentTurn / room.players.length) + 1;
    
    // Send round start to everyone
    room.players.forEach(p => {
        const isDrawer = p.id === gd.currentDrawer.id;
        io.to(p.id).emit('sketch-round-start', {
            round: currentRound,
            totalRounds: gd.totalRounds,
            turn: (gd.currentTurn % room.players.length) + 1,
            totalTurns: room.players.length,
            drawerName: gd.currentDrawer.name,
            word: isDrawer ? word : null,
            hint: isDrawer ? null : hint,
            timeLimit: gd.timePerTurn
        });
    });
    
    // Reveal hints progressively (at 20s and 40s into the round)
    const wordLength = word.replace(/ /g, '').length;
    let hintsGiven = 0;
    
    gd.hintInterval = setInterval(() => {
        const elapsed = (Date.now() - gd.turnStartTime) / 1000;
        
        // Give hints at 20s and 40s
        if (elapsed >= 20 && hintsGiven === 0) {
            hintsGiven = 1;
            const lettersToReveal = Math.max(1, Math.ceil(wordLength * 0.25));
            const newHint = generateHint(word, lettersToReveal);
            
            room.players.forEach(p => {
                if (p.id !== gd.currentDrawer.id) {
                    io.to(p.id).emit('sketch-hint-update', { hint: newHint });
                }
            });
        } else if (elapsed >= 40 && hintsGiven === 1) {
            hintsGiven = 2;
            const lettersToReveal = Math.max(2, Math.ceil(wordLength * 0.5));
            const newHint = generateHint(word, lettersToReveal);
            
            room.players.forEach(p => {
                if (p.id !== gd.currentDrawer.id) {
                    io.to(p.id).emit('sketch-hint-update', { hint: newHint });
                }
            });
        }
    }, 1000);
    
    // End turn after time limit
    gd.turnTimeout = setTimeout(() => {
        endSketchTurn(room, io);
    }, gd.timePerTurn * 1000);
}

function endSketchTurn(room, io) {
    const gd = room.gameData;
    
    // Clear timers
    if (gd.hintInterval) clearInterval(gd.hintInterval);
    if (gd.turnTimeout) clearTimeout(gd.turnTimeout);
    if (gd.wordChoiceTimeout) clearTimeout(gd.wordChoiceTimeout);
    
    gd.phase = 'turnEnd';
    
    // Build player list with scores
    const players = room.players.map(p => ({
        name: p.name,
        score: gd.scores[p.name] || 0,
        isPremium: p.isPremium || false,
        cosmetics: p.cosmetics || {},
        guessed: gd.guessedPlayers.includes(p.name)
    }));
    
    io.to(room.code).emit('sketch-round-end', {
        word: gd.currentWord,
        scores: gd.scores,
        players: players
    });
    
    // Move to next turn after delay
    setTimeout(() => {
        if (!room.gameData) return;
        
        gd.currentTurn++;
        gd.currentDrawerIndex = (gd.currentDrawerIndex + 1) % room.players.length;
        
        if (gd.currentTurn >= gd.totalTurns) {
            endSketchGame(room, io);
        } else {
            startSketchTurn(room, io);
        }
    }, 4000);
}

function endSketchGame(room, io) {
    const gd = room.gameData;
    
    // Clear any remaining timers
    if (gd.hintInterval) clearInterval(gd.hintInterval);
    if (gd.turnTimeout) clearTimeout(gd.turnTimeout);
    if (gd.wordChoiceTimeout) clearTimeout(gd.wordChoiceTimeout);
    
    gd.phase = 'gameOver';
    
    const finalLeaderboard = Object.entries(gd.scores)
        .map(([name, score]) => {
            const p = room.players.find(x => x.name === name);
            return {
                name,
                score,
                isPremium: p?.isPremium || false,
                cosmetics: p?.cosmetics || {}
            };
        })
        .sort((a, b) => b.score - a.score);
    
    io.to(room.code).emit('sketch-game-over', {
        finalLeaderboard,
        winner: finalLeaderboard[0]?.name || 'No one'
    });
}

// ==================== SOCKET HANDLER SETUP ====================
function setupPartyGameHandlers(io, socket, rooms, players) {
  
    // TRIVIA ROYALE
    socket.on('trivia-start-round', ({roomCode, category}) => {
        const room = rooms.get(roomCode); 
        if (!room?.gameData) return;
        
        console.log('trivia-start-round received - category:', category, 'stored:', room.gameData.category);
        
        const cat = category || room.gameData.category || 'general';
        if (room.gameData.questions.length === 0 || (category && category !== room.gameData.category)) {
            const questions = triviaQuestions[cat];
            if (!questions) {
                console.log('WARNING: Category not found:', cat, '- using general');
            }
            room.gameData.questions = [...(questions || triviaQuestions.general)].sort(() => Math.random() - 0.5).slice(0, 10);
            room.gameData.category = cat;
            room.gameData.currentQuestionIndex = 0;
            room.gameData.roundNumber = 1;
            console.log('Trivia loaded category:', cat, '- First question:', room.gameData.questions[0]?.question);
        }
        
        const q = room.gameData.questions[room.gameData.currentQuestionIndex];
        if (!q) return;
        
        room.gameData.phase = 'question'; 
        room.gameData.answers = {}; 
        room.gameData.roundStartTime = Date.now();
        
        io.to(roomCode).emit('trivia-question', { 
            question: q.question, 
            options: q.options, 
            questionIndex: room.gameData.currentQuestionIndex,
            roundNumber: room.gameData.roundNumber, 
            totalQuestions: room.gameData.maxRounds,
            totalRounds: room.gameData.maxRounds, 
            timeLimit: room.gameData.timePerQuestion,
            category: cat
        });
    });
    
    socket.on('trivia-answer', ({roomCode, answerIndex}) => {
        const room = rooms.get(roomCode), player = players.get(socket.id);
        if (!room?.gameData || !player || room.gameData.phase !== 'question' || room.gameData.answers[socket.id]) return;
        
        room.gameData.answers[socket.id] = { answerIndex, timestamp: Date.now() };
        socket.emit('trivia-answer-received', { answerIndex });
        
        io.to(roomCode).emit('trivia-answer-count', { 
            answeredCount: Object.keys(room.gameData.answers).length, 
            totalPlayers: room.players.length 
        });
        
        if (Object.keys(room.gameData.answers).length === room.players.length) {
            calculateTriviaResults(room, io);
        }
    });
    
    socket.on('trivia-time-up', ({roomCode}) => { 
        const room = rooms.get(roomCode); 
        if (room?.gameData?.phase === 'question') {
            calculateTriviaResults(room, io); 
        }
    });

    // THIS OR THAT
    socket.on('thisorthat-party-start-round', ({roomCode}) => {
        const room = rooms.get(roomCode); 
        if (!room?.gameData) return;
        
        const q = room.gameData.questions[room.gameData.currentQuestionIndex];
        room.gameData.phase = 'voting'; 
        room.gameData.votes = {};
        
        io.to(roomCode).emit('thisorthat-party-question', { 
            optionA: q.optionA, 
            optionB: q.optionB, 
            roundNumber: room.gameData.roundNumber, 
            totalRounds: room.gameData.maxRounds, 
            timeLimit: room.gameData.timePerRound 
        });
    });
    
    socket.on('thisorthat-party-vote', ({roomCode, choice}) => {
        const room = rooms.get(roomCode), player = players.get(socket.id);
        if (!room?.gameData || !player || room.gameData.phase !== 'voting' || room.gameData.votes[socket.id]) return;
        
        room.gameData.votes[socket.id] = { choice, playerName: player.playerName };
        socket.emit('thisorthat-party-vote-received', { choice });
        
        io.to(roomCode).emit('thisorthat-party-vote-count', { 
            votedCount: Object.keys(room.gameData.votes).length, 
            totalPlayers: room.players.length 
        });
        
        if (Object.keys(room.gameData.votes).length === room.players.length) {
            calculateThisOrThatPartyResults(room, io);
        }
    });
    
    socket.on('thisorthat-party-time-up', ({roomCode}) => { 
        const room = rooms.get(roomCode); 
        if (room?.gameData?.phase === 'voting') {
            calculateThisOrThatPartyResults(room, io); 
        }
    });
    
    socket.on('thisorthat-party-next-round', ({roomCode}) => {
        const room = rooms.get(roomCode); 
        if (!room?.gameData) return;
        
        room.gameData.currentQuestionIndex++; 
        room.gameData.roundNumber++;
        
        if (room.gameData.roundNumber > room.gameData.maxRounds) {
            io.to(roomCode).emit('thisorthat-party-game-over', { 
                finalScores: room.gameData.scores, 
                winner: getTopPlayer(room.gameData.scores) 
            });
        } else {
            io.to(roomCode).emit('thisorthat-party-round-transition', { 
                nextRound: room.gameData.roundNumber, 
                scores: room.gameData.scores 
            });
        }
    });

    // HOT TAKES
    socket.on('hottakes-party-start-round', ({roomCode}) => {
        const room = rooms.get(roomCode); 
        if (!room?.gameData) return;
        
        const q = room.gameData.questions[room.gameData.currentQuestionIndex];
        room.gameData.phase = 'rating'; 
        room.gameData.ratings = {};
        
        io.to(roomCode).emit('hottakes-party-statement', { 
            statement: q.statement, 
            roundNumber: room.gameData.roundNumber, 
            totalRounds: room.gameData.maxRounds, 
            timeLimit: room.gameData.timePerRound 
        });
    });
    
    socket.on('hottakes-party-rate', ({roomCode, rating}) => {
        const room = rooms.get(roomCode), player = players.get(socket.id);
        if (!room?.gameData || !player || room.gameData.phase !== 'rating' || room.gameData.ratings[socket.id]) return;
        
        room.gameData.ratings[socket.id] = { rating, playerName: player.playerName };
        socket.emit('hottakes-party-rate-received', { rating });
        
        io.to(roomCode).emit('hottakes-party-rate-count', { 
            ratedCount: Object.keys(room.gameData.ratings).length, 
            totalPlayers: room.players.length 
        });
        
        if (Object.keys(room.gameData.ratings).length === room.players.length) {
            calculateHotTakesPartyResults(room, io);
        }
    });
    
    socket.on('hottakes-party-time-up', ({roomCode}) => { 
        const room = rooms.get(roomCode); 
        if (room?.gameData?.phase === 'rating') {
            calculateHotTakesPartyResults(room, io); 
        }
    });
    
    socket.on('hottakes-party-next-round', ({roomCode}) => {
        const room = rooms.get(roomCode); 
        if (!room?.gameData) return;
        
        room.gameData.currentQuestionIndex++; 
        room.gameData.roundNumber++;
        
        if (room.gameData.roundNumber > room.gameData.maxRounds) {
            io.to(roomCode).emit('hottakes-party-game-over', { 
                finalScores: room.gameData.scores, 
                winner: getTopPlayer(room.gameData.scores) 
            });
        } else {
            io.to(roomCode).emit('hottakes-party-round-transition', { 
                nextRound: room.gameData.roundNumber, 
                scores: room.gameData.scores 
            });
        }
    });

    // NEVER EVER
    socket.on('neverever-party-start-round', ({roomCode}) => {
        const room = rooms.get(roomCode); 
        if (!room?.gameData) return;
        
        const q = room.gameData.questions[room.gameData.currentQuestionIndex];
        room.gameData.phase = 'responding'; 
        room.gameData.responses = {};
        
        io.to(roomCode).emit('neverever-party-statement', { 
            statement: q.statement, 
            roundNumber: room.gameData.roundNumber, 
            totalRounds: room.gameData.maxRounds, 
            timeLimit: room.gameData.timePerRound 
        });
    });
    
    socket.on('neverever-party-respond', ({roomCode, response}) => {
        const room = rooms.get(roomCode), player = players.get(socket.id);
        if (!room?.gameData || !player || room.gameData.phase !== 'responding' || room.gameData.responses[socket.id] !== undefined) return;
        
        room.gameData.responses[socket.id] = { response, playerName: player.playerName };
        socket.emit('neverever-party-response-received', { response });
        
        io.to(roomCode).emit('neverever-party-response-count', { 
            respondedCount: Object.keys(room.gameData.responses).length, 
            totalPlayers: room.players.length 
        });
        
        if (Object.keys(room.gameData.responses).length === room.players.length) {
            calculateNeverEverPartyResults(room, io);
        }
    });
    
    socket.on('neverever-party-time-up', ({roomCode}) => { 
        const room = rooms.get(roomCode); 
        if (room?.gameData?.phase === 'responding') {
            calculateNeverEverPartyResults(room, io); 
        }
    });
    
    socket.on('neverever-party-next-round', ({roomCode}) => {
        const room = rooms.get(roomCode); 
        if (!room?.gameData) return;
        
        room.gameData.currentQuestionIndex++; 
        room.gameData.roundNumber++;
        
        if (room.gameData.roundNumber > room.gameData.maxRounds) {
            io.to(roomCode).emit('neverever-party-game-over', { 
                finalScores: room.gameData.scores, 
                winner: getTopPlayer(room.gameData.scores) 
            });
        } else {
            io.to(roomCode).emit('neverever-party-round-transition', { 
                nextRound: room.gameData.roundNumber, 
                scores: room.gameData.scores 
            });
        }
    });

    // BET OR BLUFF
    socket.on('betorbluff-start-round', ({roomCode}) => {
        const room = rooms.get(roomCode); 
        if (!room?.gameData) return;
        
        const q = room.gameData.questions[room.gameData.currentQuestionIndex];
        room.gameData.phase = 'guessing'; 
        room.gameData.guesses = {}; 
        room.gameData.bets = {};
        
        io.to(roomCode).emit('betorbluff-question', { 
            question: q.question, 
            unit: q.unit, 
            roundNumber: room.gameData.roundNumber, 
            totalRounds: room.gameData.maxRounds, 
            timeLimit: room.gameData.timePerGuess, 
            chips: room.gameData.chips 
        });
    });
    
    socket.on('betorbluff-guess', ({roomCode, guess}) => {
        const room = rooms.get(roomCode), player = players.get(socket.id);
        if (!room?.gameData || !player || room.gameData.phase !== 'guessing' || room.gameData.guesses[socket.id]) return;
        
        room.gameData.guesses[socket.id] = { 
            guess: parseFloat(guess), 
            playerName: player.playerName, 
            playerId: socket.id 
        };
        socket.emit('betorbluff-guess-received', { guess });
        
        io.to(roomCode).emit('betorbluff-guess-count', { 
            guessedCount: Object.keys(room.gameData.guesses).length, 
            totalPlayers: room.players.length 
        });
        
        if (Object.keys(room.gameData.guesses).length === room.players.length) {
            startBettingPhase(room, io, roomCode);
        }
    });
    
    socket.on('betorbluff-guess-time-up', ({roomCode}) => {
        const room = rooms.get(roomCode); 
        if (!room?.gameData || room.gameData.phase !== 'guessing') return;
        
        room.players.forEach(p => { 
            if (!room.gameData.guesses[p.id]) {
                room.gameData.guesses[p.id] = { 
                    guess: 0, 
                    playerName: p.name, 
                    playerId: p.id 
                }; 
            }
        });
        startBettingPhase(room, io, roomCode);
    });
    
    socket.on('betorbluff-bet', ({roomCode, targetPlayerId, betAmount}) => {
        const room = rooms.get(roomCode), player = players.get(socket.id);
        if (!room?.gameData || !player || room.gameData.phase !== 'betting' || room.gameData.bets[socket.id]) return;
        
        const maxBet = room.gameData.chips[player.playerName] || 0;
        room.gameData.bets[socket.id] = { 
            targetPlayerId, 
            betAmount: Math.min(Math.max(0, betAmount), maxBet), 
            playerName: player.playerName 
        };
        socket.emit('betorbluff-bet-received', { targetPlayerId, betAmount });
        
        io.to(roomCode).emit('betorbluff-bet-count', { 
            betCount: Object.keys(room.gameData.bets).length, 
            totalPlayers: room.players.length 
        });
        
        if (Object.keys(room.gameData.bets).length === room.players.length) {
            calculateBetOrBluffResults(room, io);
        }
    });
    
    socket.on('betorbluff-bet-time-up', ({roomCode}) => {
        const room = rooms.get(roomCode); 
        if (!room?.gameData || room.gameData.phase !== 'betting') return;
        
        room.players.forEach(p => { 
            if (!room.gameData.bets[p.id]) {
                room.gameData.bets[p.id] = { 
                    targetPlayerId: null, 
                    betAmount: 0, 
                    playerName: p.name 
                }; 
            }
        });
        calculateBetOrBluffResults(room, io);
    });
    
    socket.on('betorbluff-next-round', ({roomCode}) => {
        const room = rooms.get(roomCode); 
        if (!room?.gameData) return;
        
        room.gameData.currentQuestionIndex++; 
        room.gameData.roundNumber++;
        
        if (room.gameData.roundNumber > room.gameData.maxRounds) {
            io.to(roomCode).emit('betorbluff-game-over', { 
                finalChips: room.gameData.chips, 
                winner: getTopPlayer(room.gameData.chips) 
            });
        } else {
            io.to(roomCode).emit('betorbluff-round-transition', { 
                nextRound: room.gameData.roundNumber, 
                chips: room.gameData.chips 
            });
        }
    });

    // ==================== SKETCH & GUESS ====================
    socket.on('sketch-start-game', ({roomCode, category}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData) return;
        
        console.log('[SKETCH] Starting game for room:', roomCode, 'with category:', category);
        
        // If category provided and different from current, reinitialize word pool
        if (category && category !== room.gameData.category) {
            let wordPool = [];
            
            // Check if custom words were provided (format: "custom:word1,word2,word3")
            if (category.startsWith('custom:')) {
                const customWordsStr = category.substring(7);
                wordPool = customWordsStr.split(',')
                    .map(w => w.trim())
                    .filter(w => w.length > 0 && w.length <= 30);
                
                if (wordPool.length < 10) {
                    const randomWords = [...sketchWords.random].sort(() => Math.random() - 0.5);
                    while (wordPool.length < 15 && randomWords.length > 0) {
                        wordPool.push(randomWords.pop());
                    }
                }
                console.log('[SKETCH] Using custom words:', wordPool.length, 'words');
            } else {
                if (category === 'random' || category === 'mixed' || !sketchWords[category]) {
                    Object.values(sketchWords).forEach(words => {
                        wordPool = [...wordPool, ...words];
                    });
                } else {
                    wordPool = [...sketchWords[category]];
                    const otherCategories = Object.keys(sketchWords).filter(k => k !== category);
                    otherCategories.forEach(cat => {
                        const shuffled = [...sketchWords[cat]].sort(() => Math.random() - 0.5);
                        wordPool.push(...shuffled.slice(0, 5));
                    });
                }
                console.log('[SKETCH] Using category:', category, 'with', wordPool.length, 'words');
            }
            
            room.gameData.wordPool = wordPool.sort(() => Math.random() - 0.5);
            room.gameData.category = category;
            room.gameData.wordIndex = 0;
        }
        
        // Shuffle player order for drawing
        room.players.sort(() => Math.random() - 0.5);
        room.gameData.currentDrawerIndex = 0;
        
        startSketchTurn(room, io);
    });
    
    socket.on('sketch-word-selected', ({roomCode, word}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData || room.gameData.phase !== 'choosing') return;
        
        // Verify sender is the drawer
        if (socket.id !== room.gameData.currentDrawer?.id) return;
        
        console.log('[SKETCH] Word selected:', word);
        handleWordSelected(room, io, word);
    });
    
    socket.on('sketch-draw', ({roomCode, drawData}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData || room.gameData.phase !== 'drawing') return;
        
        // Verify sender is the drawer
        if (socket.id !== room.gameData.currentDrawer?.id) return;
        
        // Broadcast to all except drawer
        socket.to(roomCode).emit('sketch-draw', { drawData });
    });
    
    socket.on('sketch-clear', ({roomCode}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData || room.gameData.phase !== 'drawing') return;
        if (socket.id !== room.gameData.currentDrawer?.id) return;
        
        socket.to(roomCode).emit('sketch-clear');
    });
    
    socket.on('sketch-canvas', ({roomCode, canvasData}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData || room.gameData.phase !== 'drawing') return;
        if (socket.id !== room.gameData.currentDrawer?.id) return;
        
        // Store canvas data on server for late joiners / sync
        room.gameData.canvasData = canvasData;
        
        socket.to(roomCode).emit('sketch-canvas', { canvasData });
    });
    
    // Handle canvas sync requests from clients
    socket.on('sketch-request-canvas', ({roomCode}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData) return;
        
        // Send stored canvas data to the requesting client
        if (room.gameData.canvasData) {
            socket.emit('sketch-canvas', { canvasData: room.gameData.canvasData });
        }
    });
    
    socket.on('sketch-guess', ({roomCode, guess}) => {
        const room = rooms.get(roomCode), player = players.get(socket.id);
        if (!room?.gameData || !player || room.gameData.phase !== 'drawing') return;
        
        const gd = room.gameData;
        const playerName = player.playerName;
        
        // Can't guess if you're the drawer or already guessed
        if (socket.id === gd.currentDrawer?.id) return;
        if (gd.guessedPlayers.includes(playerName)) return;
        
        const guessLower = guess.toLowerCase().trim();
        const wordLower = gd.currentWord.toLowerCase().trim();
        
        if (guessLower === wordLower) {
            // Correct guess!
            gd.guessedPlayers.push(playerName);
            
            // Calculate points based on time remaining and guess order
            const elapsed = (Date.now() - gd.turnStartTime) / 1000;
            const timeBonus = Math.max(0, Math.floor((gd.timePerTurn - elapsed) * 2));
            const orderBonus = Math.max(0, (room.players.length - gd.guessedPlayers.length) * 20);
            const points = 50 + timeBonus + orderBonus;
            
            gd.scores[playerName] = (gd.scores[playerName] || 0) + points;
            
            // Drawer gets points for each correct guess
            const drawerName = gd.currentDrawer.name;
            gd.scores[drawerName] = (gd.scores[drawerName] || 0) + 25;
            
            io.to(roomCode).emit('sketch-guess-result', {
                playerName,
                correct: true,
                points,
                guess: null // Don't reveal the word in chat
            });
            
            console.log('[SKETCH] Correct guess by', playerName, '- Points:', points);
            
            // Check if everyone has guessed
            const nonDrawerCount = room.players.length - 1;
            if (gd.guessedPlayers.length >= nonDrawerCount) {
                // Everyone guessed! End turn early
                console.log('[SKETCH] Everyone guessed - ending turn early');
                setTimeout(() => endSketchTurn(room, io), 1000);
            }
        } else if (isCloseGuess(guessLower, wordLower)) {
            // Close guess
            io.to(roomCode).emit('sketch-guess-result', {
                playerName,
                correct: false,
                close: true,
                guess
            });
        } else {
            // Wrong guess - show in chat
            io.to(roomCode).emit('sketch-guess-result', {
                playerName,
                correct: false,
                close: false,
                guess
            });
        }
    });
    
    socket.on('sketch-time-up', ({roomCode}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData || room.gameData.phase !== 'drawing') return;
        
        endSketchTurn(room, io);
    });
}

module.exports = {
    initTriviaRoyaleGame,
    initThisOrThatPartyGame,
    initHotTakesPartyGame,
    initNeverEverPartyGame,
    initBetOrBluffGame,
    initSketchGuessGame,
    setupPartyGameHandlers
};
