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
        { question: "How many letters are in the English alphabet?", options: ["24", "25", "26", "27"], correct: 2 },
        { question: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Skin", "Brain"], correct: 2 },
        { question: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2 },
        { question: "What gas do humans breathe in to survive?", options: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Helium"], correct: 2 },
        { question: "Which animal is the tallest in the world?", options: ["Elephant", "Giraffe", "Horse", "Camel"], correct: 1 },
        { question: "What is the square root of 144?", options: ["10", "11", "12", "14"], correct: 2 },
        { question: "How many hours are in a day?", options: ["12", "20", "24", "48"], correct: 2 },
        { question: "What is the main ingredient in bread?", options: ["Rice", "Flour", "Sugar", "Corn"], correct: 1 },
        { question: "Which sense do dogs rely on the most?", options: ["Sight", "Hearing", "Smell", "Touch"], correct: 2 },
        { question: "What shape has three sides?", options: ["Square", "Circle", "Triangle", "Pentagon"], correct: 2 },
        { question: "How many weeks are in a year?", options: ["48", "50", "52", "54"], correct: 2 },
        { question: "What color do you get when you mix red and white?", options: ["Orange", "Pink", "Purple", "Peach"], correct: 1 },
        { question: "Which animal produces milk that humans commonly drink?", options: ["Horse", "Cow", "Pig", "Chicken"], correct: 1 },
        { question: "What is the freezing point of water in Fahrenheit?", options: ["0°F", "32°F", "100°F", "212°F"], correct: 1 },
        { question: "How many teeth does an adult human typically have?", options: ["28", "30", "32", "36"], correct: 2 },
        { question: "What is the largest bird in the world?", options: ["Eagle", "Ostrich", "Albatross", "Condor"], correct: 1 },
        { question: "Which blood type is the universal donor?", options: ["A", "B", "AB", "O-"], correct: 3 },
        { question: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Dynamic Nuclear Acid", "Double Nucleic Atom"], correct: 0 },
        { question: "How many zeros are in a million?", options: ["5", "6", "7", "8"], correct: 1 },
        { question: "Which metal is liquid at room temperature?", options: ["Lead", "Mercury", "Tin", "Zinc"], correct: 1 },
        { question: "What is the capital of the United States?", options: ["New York", "Los Angeles", "Washington D.C.", "Chicago"], correct: 2 },
        { question: "Which vitamin does the sun help your body produce?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], correct: 3 },
        { question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correct: 1 },
        { question: "What is the most spoken language in the world?", options: ["English", "Spanish", "Mandarin", "Hindi"], correct: 2 },
        { question: "Which organ pumps blood through the body?", options: ["Brain", "Lungs", "Heart", "Kidneys"], correct: 2 },
        { question: "What is the smallest prime number?", options: ["0", "1", "2", "3"], correct: 2 },
        { question: "How many bones does a newborn baby have?", options: ["206", "270", "300", "350"], correct: 2 },
        { question: "What color is a ruby?", options: ["Blue", "Green", "Red", "Purple"], correct: 2 },
        { question: "Which planet has rings around it?", options: ["Mars", "Venus", "Saturn", "Mercury"], correct: 2 },
        { question: "What is the fastest land animal?", options: ["Lion", "Cheetah", "Horse", "Gazelle"], correct: 1 },
        { question: "How many innings are in a standard baseball game?", options: ["7", "8", "9", "10"], correct: 2 },
        { question: "What language has the most words?", options: ["English", "Chinese", "Spanish", "Arabic"], correct: 0 },
        { question: "Which element has the chemical symbol 'Fe'?", options: ["Fluorine", "Francium", "Iron", "Fermium"], correct: 2 },
        { question: "What is the currency of Japan?", options: ["Yuan", "Won", "Yen", "Ringgit"], correct: 2 },
        { question: "How many chambers does the human heart have?", options: ["2", "3", "4", "5"], correct: 2 },
        { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
        { question: "Which famous scientist developed the theory of gravity?", options: ["Einstein", "Newton", "Galileo", "Darwin"], correct: 1 },
        { question: "What does 'USB' stand for?", options: ["Universal Serial Bus", "United System Base", "Ultra Speed Bandwidth", "Universal System Backup"], correct: 0 },
        { question: "How many minutes are in an hour?", options: ["30", "45", "60", "90"], correct: 2 },
        { question: "What is the tallest building in the world (2024)?", options: ["Shanghai Tower", "Burj Khalifa", "One World Trade", "Taipei 101"], correct: 1 }
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
        { question: "Which empire was ruled by Julius Caesar?", options: ["Greek", "Roman", "Ottoman", "Mongol"], correct: 1 },
        { question: "What year did the American Civil War begin?", options: ["1851", "1861", "1871", "1881"], correct: 1 },
        { question: "Who was the first female Prime Minister of the UK?", options: ["Theresa May", "Margaret Thatcher", "Queen Victoria", "Angela Merkel"], correct: 1 },
        { question: "The Renaissance began in which country?", options: ["France", "England", "Italy", "Spain"], correct: 2 },
        { question: "Who was the last Pharaoh of Ancient Egypt?", options: ["Nefertiti", "Hatshepsut", "Cleopatra", "Ramses II"], correct: 2 },
        { question: "What empire was Genghis Khan the leader of?", options: ["Ottoman", "Roman", "Mongol", "Persian"], correct: 2 },
        { question: "In what year did the French Revolution begin?", options: ["1776", "1789", "1799", "1812"], correct: 1 },
        { question: "Who invented the printing press?", options: ["Da Vinci", "Gutenberg", "Galileo", "Newton"], correct: 1 },
        { question: "What was the name of the first satellite launched into space?", options: ["Apollo", "Sputnik", "Explorer", "Voyager"], correct: 1 },
        { question: "Which civilization built Machu Picchu?", options: ["Aztec", "Maya", "Inca", "Olmec"], correct: 2 },
        { question: "Who was the 16th President of the United States?", options: ["Andrew Jackson", "Abraham Lincoln", "Ulysses Grant", "James Buchanan"], correct: 1 },
        { question: "The Magna Carta was signed in which year?", options: ["1066", "1215", "1415", "1776"], correct: 1 },
        { question: "Who led India's independence movement through nonviolence?", options: ["Nehru", "Gandhi", "Bose", "Patel"], correct: 1 },
        { question: "Which ancient wonder was in Alexandria, Egypt?", options: ["Colosseum", "Hanging Gardens", "Lighthouse", "Temple of Artemis"], correct: 2 },
        { question: "What year did the Soviet Union collapse?", options: ["1989", "1990", "1991", "1993"], correct: 2 },
        { question: "Who was the first person to circumnavigate the globe?", options: ["Columbus", "Magellan's crew", "Drake", "Cook"], correct: 1 },
        { question: "What ancient trade route connected China to the Mediterranean?", options: ["Spice Route", "Silk Road", "Tea Trail", "Gold Path"], correct: 1 },
        { question: "Which US President is on the $100 bill?", options: ["Washington", "Lincoln", "Franklin", "Hamilton"], correct: 2 },
        { question: "The Black Death killed roughly what fraction of Europe?", options: ["One-tenth", "One-quarter", "One-third", "One-half"], correct: 2 },
        { question: "Who painted the ceiling of the Sistine Chapel?", options: ["Da Vinci", "Raphael", "Michelangelo", "Botticelli"], correct: 2 },
        { question: "What was the first country to give women the right to vote?", options: ["USA", "UK", "New Zealand", "France"], correct: 2 },
        { question: "Which explorer reached the South Pole first?", options: ["Scott", "Amundsen", "Shackleton", "Peary"], correct: 1 },
        { question: "The Roman Colosseum was built in which century?", options: ["1st century AD", "3rd century AD", "5th century BC", "2nd century BC"], correct: 0 },
        { question: "Who was known as the 'Sun King' of France?", options: ["Louis XIV", "Louis XVI", "Napoleon", "Charlemagne"], correct: 0 },
        { question: "What document did Abraham Lincoln issue in 1863?", options: ["Bill of Rights", "Constitution", "Emancipation Proclamation", "Declaration of Independence"], correct: 2 },
        { question: "Which dynasty built the Great Wall of China?", options: ["Han", "Ming", "Qin", "Tang"], correct: 2 },
        { question: "Who was the first European to reach India by sea?", options: ["Columbus", "Magellan", "Vasco da Gama", "Drake"], correct: 2 },
        { question: "What year did Hawaii become a US state?", options: ["1945", "1950", "1959", "1963"], correct: 2 },
        { question: "The Ottoman Empire's capital was which city?", options: ["Baghdad", "Cairo", "Constantinople", "Damascus"], correct: 2 },
        { question: "Who was the Greek god of the sea?", options: ["Zeus", "Hades", "Poseidon", "Apollo"], correct: 2 },
        { question: "What famous structure was completed in Paris in 1889?", options: ["Arc de Triomphe", "Eiffel Tower", "Notre Dame", "Louvre Pyramid"], correct: 1 },
        { question: "Which war lasted from 1950 to 1953?", options: ["Vietnam War", "Korean War", "Gulf War", "Falklands War"], correct: 1 },
        { question: "Who wrote 'The Communist Manifesto'?", options: ["Lenin", "Stalin", "Marx and Engels", "Trotsky"], correct: 2 },
        { question: "The Aztec Empire was located in modern-day what?", options: ["Peru", "Mexico", "Brazil", "Colombia"], correct: 1 },
        { question: "What ancient city was buried by Mount Vesuvius?", options: ["Rome", "Athens", "Pompeii", "Carthage"], correct: 2 },
        { question: "Who was the first woman in space?", options: ["Sally Ride", "Valentina Tereshkova", "Mae Jemison", "Christa McAuliffe"], correct: 1 }
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
        { question: "Which war is often called 'The Great War'?", options: ["WWI", "WWII", "Civil War", "Gulf War"], correct: 0 },
        { question: "What was the Manhattan Project?", options: ["NYC construction", "Atomic bomb development", "Space race", "Spy network"], correct: 1 },
        { question: "Which battle is considered the turning point of the Civil War?", options: ["Antietam", "Gettysburg", "Bull Run", "Vicksburg"], correct: 1 },
        { question: "What was the name of the German air force in WWII?", options: ["Wehrmacht", "Luftwaffe", "Panzer", "U-Boot"], correct: 1 },
        { question: "The Gulf War was fought over the invasion of which country?", options: ["Iran", "Kuwait", "Saudi Arabia", "Syria"], correct: 1 },
        { question: "What year did the Korean War begin?", options: ["1948", "1950", "1952", "1954"], correct: 1 },
        { question: "Who was the Supreme Allied Commander on D-Day?", options: ["Patton", "Montgomery", "Eisenhower", "MacArthur"], correct: 2 },
        { question: "What ancient military formation used interlocking shields?", options: ["Wedge", "Phalanx", "Testudo", "Column"], correct: 1 },
        { question: "The Battle of Midway was fought between which two nations?", options: ["US and Germany", "UK and Japan", "US and Japan", "UK and Germany"], correct: 2 },
        { question: "What was the name of the German submarine fleet?", options: ["S-Boats", "U-Boats", "K-Boats", "V-Boats"], correct: 1 },
        { question: "Which revolution began in 1917?", options: ["French Revolution", "American Revolution", "Russian Revolution", "Chinese Revolution"], correct: 2 },
        { question: "What wall divided Berlin during the Cold War?", options: ["Iron Curtain", "Berlin Wall", "Brandenburg Wall", "Eastern Wall"], correct: 1 },
        { question: "Who was the US President when WWII ended?", options: ["Roosevelt", "Truman", "Eisenhower", "Churchill"], correct: 1 },
        { question: "What weapon was first used in WWI?", options: ["Nuclear bomb", "Tank", "Helicopter", "Drone"], correct: 1 },
        { question: "The Falklands War was between the UK and which country?", options: ["Spain", "Brazil", "Argentina", "Chile"], correct: 2 },
        { question: "What treaty ended WWI?", options: ["Treaty of Paris", "Treaty of Versailles", "Treaty of Vienna", "Treaty of Berlin"], correct: 1 }
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
        { question: "What part of the atom has a positive charge?", options: ["Electron", "Neutron", "Proton", "Quark"], correct: 2 },
        { question: "What is the largest planet in our solar system?", options: ["Saturn", "Jupiter", "Neptune", "Uranus"], correct: 1 },
        { question: "What type of blood vessel carries blood away from the heart?", options: ["Veins", "Capillaries", "Arteries", "Lymph vessels"], correct: 2 },
        { question: "What is the most abundant gas in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correct: 2 },
        { question: "How many chromosomes do humans have?", options: ["23", "44", "46", "48"], correct: 2 },
        { question: "What force keeps planets in orbit around the sun?", options: ["Magnetism", "Friction", "Gravity", "Centrifugal force"], correct: 2 },
        { question: "Which scientist is known for the laws of motion?", options: ["Darwin", "Newton", "Curie", "Faraday"], correct: 1 },
        { question: "What is the pH of pure water?", options: ["5", "7", "9", "14"], correct: 1 },
        { question: "Which organ filters blood in the human body?", options: ["Heart", "Liver", "Kidney", "Stomach"], correct: 2 },
        { question: "What is the smallest unit of life?", options: ["Atom", "Molecule", "Cell", "Organ"], correct: 2 },
        { question: "How long does it take light from the Sun to reach Earth?", options: ["1 minute", "8 minutes", "30 minutes", "1 hour"], correct: 1 },
        { question: "What is the hardest mineral on the Mohs scale?", options: ["Quartz", "Topaz", "Corundum", "Diamond"], correct: 3 },
        { question: "Which gas makes up about 21% of the atmosphere?", options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Argon"], correct: 1 },
        { question: "What is the process by which plants make food?", options: ["Respiration", "Fermentation", "Photosynthesis", "Osmosis"], correct: 2 },
        { question: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], correct: 1 },
        { question: "What is the chemical symbol for Sodium?", options: ["So", "Sd", "Na", "S"], correct: 2 },
        { question: "Which part of the brain controls balance?", options: ["Cerebrum", "Cerebellum", "Brainstem", "Hypothalamus"], correct: 1 },
        { question: "What type of energy does the Sun produce?", options: ["Chemical", "Nuclear", "Electrical", "Mechanical"], correct: 1 },
        { question: "What is the unit of electrical resistance?", options: ["Watt", "Volt", "Ohm", "Ampere"], correct: 2 },
        { question: "Which vitamin is also known as ascorbic acid?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], correct: 2 },
        { question: "What phenomenon causes the Northern Lights?", options: ["Solar eclipse", "Charged particles from Sun", "Moon reflection", "Cloud refraction"], correct: 1 },
        { question: "How many states of matter are there (common)?", options: ["2", "3", "4", "5"], correct: 2 },
        { question: "What does a seismograph measure?", options: ["Wind speed", "Temperature", "Earthquakes", "Rainfall"], correct: 2 },
        { question: "Which animal can regenerate its limbs?", options: ["Frog", "Starfish", "Snake", "Lizard"], correct: 1 },
        { question: "What is the center of an atom called?", options: ["Shell", "Electron cloud", "Nucleus", "Orbital"], correct: 2 },
        { question: "Which planet is known for its Great Red Spot?", options: ["Mars", "Saturn", "Jupiter", "Neptune"], correct: 2 },
        { question: "What is absolute zero in Celsius?", options: ["-100°C", "-200°C", "-273°C", "-373°C"], correct: 2 },
        { question: "What type of rock is formed from cooled lava?", options: ["Sedimentary", "Metamorphic", "Igneous", "Limestone"], correct: 2 },
        { question: "Which scientist discovered penicillin?", options: ["Pasteur", "Fleming", "Jenner", "Koch"], correct: 1 },
        { question: "What is the Doppler effect related to?", options: ["Light color", "Sound pitch changes", "Gravity", "Magnetism"], correct: 1 },
        { question: "How many elements are on the periodic table (approx)?", options: ["92", "108", "118", "150"], correct: 2 },
        { question: "What is the human body's largest bone?", options: ["Tibia", "Humerus", "Femur", "Spine"], correct: 2 },
        { question: "Which layer of the atmosphere do we live in?", options: ["Stratosphere", "Mesosphere", "Troposphere", "Thermosphere"], correct: 2 },
        { question: "What particle orbits the nucleus of an atom?", options: ["Proton", "Neutron", "Electron", "Photon"], correct: 2 },
        { question: "What is the study of weather called?", options: ["Astronomy", "Meteorology", "Geology", "Ecology"], correct: 1 },
        { question: "Which planet rotates on its side?", options: ["Neptune", "Uranus", "Saturn", "Pluto"], correct: 1 }
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
        { question: "Which continent is the Sahara Desert in?", options: ["Asia", "South America", "Africa", "Australia"], correct: 2 },
        { question: "What is the capital of Brazil?", options: ["Rio de Janeiro", "Sao Paulo", "Brasilia", "Salvador"], correct: 2 },
        { question: "Which African country has the most people?", options: ["South Africa", "Ethiopia", "Nigeria", "Egypt"], correct: 2 },
        { question: "What is the deepest ocean trench?", options: ["Tonga Trench", "Mariana Trench", "Java Trench", "Puerto Rico Trench"], correct: 1 },
        { question: "Which country has the most time zones?", options: ["USA", "Russia", "China", "France"], correct: 3 },
        { question: "What is the capital of South Korea?", options: ["Busan", "Seoul", "Incheon", "Daegu"], correct: 1 },
        { question: "The Amazon Rainforest is mostly in which country?", options: ["Colombia", "Peru", "Brazil", "Venezuela"], correct: 2 },
        { question: "Which European country has the most people?", options: ["Germany", "France", "UK", "Italy"], correct: 0 },
        { question: "What is the tallest mountain in Africa?", options: ["Mount Kenya", "Kilimanjaro", "Atlas Mountains", "Drakensberg"], correct: 1 },
        { question: "Which country is both in Europe and Asia?", options: ["Russia", "Turkey", "Egypt", "Both A and B"], correct: 3 },
        { question: "What is the capital of Egypt?", options: ["Alexandria", "Cairo", "Luxor", "Giza"], correct: 1 },
        { question: "Which island is the largest in the world?", options: ["Madagascar", "Borneo", "Greenland", "New Guinea"], correct: 2 },
        { question: "What is the capital of Germany?", options: ["Munich", "Hamburg", "Berlin", "Frankfurt"], correct: 2 },
        { question: "Which country is shaped like a long thin strip?", options: ["Norway", "Chile", "Vietnam", "Italy"], correct: 1 },
        { question: "What sea separates Europe from Africa?", options: ["Red Sea", "Black Sea", "Mediterranean Sea", "Caspian Sea"], correct: 2 },
        { question: "Which US state is the largest by area?", options: ["Texas", "California", "Montana", "Alaska"], correct: 3 },
        { question: "What is the capital of Russia?", options: ["St. Petersburg", "Moscow", "Vladivostok", "Novosibirsk"], correct: 1 },
        { question: "The Great Barrier Reef is located near which country?", options: ["Indonesia", "Philippines", "Australia", "Fiji"], correct: 2 },
        { question: "Which country has the most islands?", options: ["Indonesia", "Philippines", "Sweden", "Norway"], correct: 2 },
        { question: "What canal connects the Atlantic and Pacific oceans?", options: ["Suez Canal", "Panama Canal", "Erie Canal", "Kiel Canal"], correct: 1 },
        { question: "Which mountain is the tallest in North America?", options: ["Mount Rainier", "Denali", "Mount Whitney", "Mount Logan"], correct: 1 },
        { question: "What is the capital of Turkey?", options: ["Istanbul", "Ankara", "Izmir", "Antalya"], correct: 1 },
        { question: "Which waterfall is on the border of USA and Canada?", options: ["Victoria Falls", "Angel Falls", "Niagara Falls", "Iguazu Falls"], correct: 2 },
        { question: "What is the driest continent?", options: ["Africa", "Australia", "Antarctica", "Asia"], correct: 2 },
        { question: "Which river flows through Paris?", options: ["Rhine", "Danube", "Seine", "Thames"], correct: 2 },
        { question: "What country has the most land area?", options: ["Canada", "China", "USA", "Russia"], correct: 3 },
        { question: "Which strait separates Asia from North America?", options: ["Strait of Gibraltar", "Bering Strait", "Strait of Hormuz", "Strait of Malacca"], correct: 1 },
        { question: "What is the capital of Mexico?", options: ["Cancun", "Guadalajara", "Mexico City", "Monterrey"], correct: 2 },
        { question: "Which lake is the largest freshwater lake by area?", options: ["Lake Victoria", "Lake Superior", "Lake Baikal", "Lake Michigan"], correct: 1 },
        { question: "What is the official language of Brazil?", options: ["Spanish", "Portuguese", "French", "English"], correct: 1 },
        { question: "Which country is home to the Taj Mahal?", options: ["Pakistan", "Bangladesh", "India", "Nepal"], correct: 2 },
        { question: "What is the capital of Thailand?", options: ["Phuket", "Chiang Mai", "Bangkok", "Pattaya"], correct: 2 },
        { question: "Which continent has no countries?", options: ["Arctic", "Antarctica", "Australia", "None"], correct: 1 },
        { question: "What is the longest wall in the world?", options: ["Hadrian's Wall", "Berlin Wall", "Great Wall of China", "Western Wall"], correct: 2 },
        { question: "Which two countries share the longest border?", options: ["USA-Mexico", "Russia-China", "USA-Canada", "Argentina-Chile"], correct: 2 },
        { question: "What is the capital of Japan?", options: ["Osaka", "Kyoto", "Tokyo", "Yokohama"], correct: 2 }
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
        { question: "Which couple is known as 'Bennifer'?", options: ["Ben & Jennifer", "Brad & Jen", "Bill & Jen", "Bob & Jen"], correct: 0 },
        { question: "What is the most subscribed YouTube channel?", options: ["PewDiePie", "MrBeast", "T-Series", "Cocomelon"], correct: 1 },
        { question: "Which reality show features roses and final roses?", options: ["Love Island", "The Bachelor", "Too Hot to Handle", "Love is Blind"], correct: 1 },
        { question: "Who is the CEO of Tesla?", options: ["Jeff Bezos", "Tim Cook", "Elon Musk", "Bill Gates"], correct: 2 },
        { question: "What streaming service produced 'Squid Game'?", options: ["Hulu", "Disney+", "Amazon Prime", "Netflix"], correct: 3 },
        { question: "Which Kardashian-Jenner has a cosmetics brand?", options: ["Kim", "Khloe", "Kylie", "Kourtney"], correct: 2 },
        { question: "What is the name of Beyonce's fandom?", options: ["Barbz", "Beyhive", "Monsters", "Swifties"], correct: 1 },
        { question: "Who created Facebook?", options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Jack Dorsey"], correct: 2 },
        { question: "Which show features a chemistry teacher turned drug lord?", options: ["Ozark", "Breaking Bad", "Narcos", "Better Call Saul"], correct: 1 },
        { question: "What was the name of the viral TikTok sea shanty?", options: ["Wellerman", "Drunken Sailor", "What Shall We Do", "Leave Her Johnny"], correct: 0 },
        { question: "Who is the richest person in the world (2024)?", options: ["Jeff Bezos", "Elon Musk", "Bernard Arnault", "Bill Gates"], correct: 1 },
        { question: "What does 'FOMO' stand for?", options: ["Fear Of Missing Out", "Feeling Of Moving On", "Friends Over Money Only", "Finding Our Mutual Options"], correct: 0 },
        { question: "Which Marvel movie features the line 'I am inevitable'?", options: ["Infinity War", "Endgame", "Civil War", "Age of Ultron"], correct: 1 },
        { question: "Who is known as the 'Internet's Boyfriend'?", options: ["Tom Holland", "Keanu Reeves", "Pedro Pascal", "All of them at different times"], correct: 3 },
        { question: "What social media platform is known for disappearing messages?", options: ["Instagram", "Twitter", "Snapchat", "Facebook"], correct: 2 },
        { question: "Which Netflix show is about chess?", options: ["Checkmate", "The Queen's Gambit", "King's Game", "Pawn Stars"], correct: 1 },
        { question: "What did the 'Ice Bucket Challenge' raise awareness for?", options: ["Cancer", "ALS", "Diabetes", "Heart Disease"], correct: 1 },
        { question: "Who went to space on a Blue Origin rocket?", options: ["Elon Musk", "Jeff Bezos", "Richard Branson", "Mark Zuckerberg"], correct: 1 },
        { question: "Which anime became a global Netflix phenomenon in 2021?", options: ["Attack on Titan", "Demon Slayer", "Squid Game", "One Piece"], correct: 2 },
        { question: "What is the most liked photo on Instagram?", options: ["An egg", "Kylie's baby", "Leo's Oscar", "A sunset"], correct: 0 },
        { question: "Who hosted 'Hot Ones' interviews?", options: ["Jimmy Fallon", "Sean Evans", "James Corden", "Trevor Noah"], correct: 1 },
        { question: "What show features 'Winter is Coming'?", options: ["The Witcher", "Lord of the Rings", "Game of Thrones", "Vikings"], correct: 2 },
        { question: "Which platform is known for 'threads' and short text posts?", options: ["Threads", "Twitter/X", "Mastodon", "All of them"], correct: 3 },
        { question: "What year did COVID-19 become a global pandemic?", options: ["2019", "2020", "2021", "2022"], correct: 1 },
        { question: "Who is 'The Rock' (actor)?", options: ["Vin Diesel", "John Cena", "Dwayne Johnson", "Dave Bautista"], correct: 2 },
        { question: "What AI chatbot went viral in late 2022?", options: ["Siri", "Alexa", "ChatGPT", "Google Bard"], correct: 2 },
        { question: "Which platform is TikTok's main competitor from Meta?", options: ["Stories", "Shorts", "Reels", "Clips"], correct: 2 },
        { question: "Who directed 'Don't Look Up'?", options: ["Christopher Nolan", "Adam McKay", "Martin Scorsese", "Greta Gerwig"], correct: 1 },
        { question: "What trend involved people dancing in public to 'Gonna Fly Now'?", options: ["Mannequin Challenge", "Running Man", "Rocky Training", "Bottle Cap Challenge"], correct: 2 },
        { question: "Which podcaster signed a $200M deal with Spotify?", options: ["Alex Cooper", "Joe Rogan", "Dax Shepard", "Conan O'Brien"], correct: 1 },
        { question: "What does 'ratio' mean on Twitter/X?", options: ["A math term", "Getting more replies than likes (disagreement)", "Having a big account", "Posting frequently"], correct: 1 },
        { question: "Which show featured a tiger-owning man named Joe?", options: ["Tiger King", "Wild Things", "Big Cat Diary", "Zoo"], correct: 0 },
        { question: "What was the most downloaded app of 2023?", options: ["Instagram", "TikTok", "Threads", "WhatsApp"], correct: 1 },
        { question: "Who is known for saying 'That's hot'?", options: ["Kim Kardashian", "Paris Hilton", "Nicole Richie", "Lindsay Lohan"], correct: 1 },
        { question: "What Disney+ show features a bounty hunter and a baby alien?", options: ["Obi-Wan Kenobi", "Andor", "The Mandalorian", "Ahsoka"], correct: 2 },
        { question: "Which influencer is known for 'Beast' philanthropy videos?", options: ["Logan Paul", "PewDiePie", "MrBeast", "David Dobrik"], correct: 2 }
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
        { question: "If something is 'mid', it is:", options: ["Great", "Average/Bad", "Small", "Expensive"], correct: 1 },
        { question: "What does 'slay' mean in Gen Z slang?", options: ["To kill", "To do something amazing", "To sleep", "To eat"], correct: 1 },
        { question: "Who popularized the 'Griddy' dance?", options: ["Drake", "Ja'Marr Chase", "Justin Jefferson", "Fortnite"], correct: 2 },
        { question: "What does 'bussin' mean?", options: ["Riding a bus", "Really good", "Really bad", "Running fast"], correct: 1 },
        { question: "What is 'NPC behavior'?", options: ["Acting like a robot/scripted", "Being creative", "Being smart", "Playing games"], correct: 0 },
        { question: "What does 'L + ratio' mean?", options: ["A math equation", "You took a loss and nobody agrees with you", "A music term", "A gaming strategy"], correct: 1 },
        { question: "Who is Livvy Dunne?", options: ["A singer", "A TikTok gymnast/influencer", "A streamer", "A YouTuber"], correct: 1 },
        { question: "What does 'rent free' mean?", options: ["Free housing", "Living in someone's thoughts", "No cost", "A coupon"], correct: 1 },
        { question: "What is a 'glaze'?", options: ["A donut topping", "Excessive complimenting/dickriding", "A type of dance", "A drink"], correct: 1 },
        { question: "What does 'ate and left no crumbs' mean?", options: ["Finished eating", "Did something perfectly", "Made a mess", "Was hungry"], correct: 1 },
        { question: "What is 'delulu'?", options: ["A type of food", "Delusional", "A dance move", "A song"], correct: 1 },
        { question: "Kai Cenat is famous for streaming on which platform?", options: ["YouTube", "TikTok", "Twitch", "Kick"], correct: 2 },
        { question: "What does 'sus' come from?", options: ["Suspicious", "Sustainable", "Sugar", "Super"], correct: 0 },
        { question: "What is the 'ick'?", options: ["Being sick", "A sudden turnoff from someone", "A dance", "A game"], correct: 1 },
        { question: "What does 'understood the assignment' mean?", options: ["Did homework", "Nailed it perfectly", "Failed a test", "Got confused"], correct: 1 },
        { question: "What is 'main character energy'?", options: ["Being a movie star", "Acting like the world revolves around you", "Being shy", "Playing video games"], correct: 1 },
        { question: "What does 'it's giving' mean?", options: ["Giving a gift", "It has the vibe of...", "It's broken", "It's expensive"], correct: 1 },
        { question: "What streamer had the most Twitch subs ever?", options: ["Ninja", "xQc", "Kai Cenat", "Pokimane"], correct: 2 },
        { question: "What does 'unalive' mean on TikTok?", options: ["To revive", "A censored way to say kill/die", "To log off", "To break up"], correct: 1 },
        { question: "What is 'chronically online'?", options: ["Being sick a lot", "Spending too much time on the internet", "Having fast WiFi", "Being a gamer"], correct: 1 },
        { question: "What does 'W' mean in chat?", options: ["Waiting", "Win", "Wrong", "Whatever"], correct: 1 },
        { question: "What does 'touch grass' mean?", options: ["Garden", "Go outside/touch reality", "Play sports", "Eat salad"], correct: 1 },
        { question: "What is the 'Roman Empire' trend about?", options: ["History class", "How often men think about the Roman Empire", "A movie", "A game"], correct: 1 },
        { question: "What does 'aura points' mean?", options: ["A video game stat", "Social coolness/reputation points", "Energy healing", "A light show"], correct: 1 },
        { question: "What is a 'pick me'?", options: ["A type of guitar", "Someone who seeks validation by putting others down", "A game show", "A shopping app"], correct: 1 },
        { question: "What does 'mogging' mean?", options: ["Jogging with a mop", "Dominating someone in looks/presence", "A type of dance", "Eating fast"], correct: 1 },
        { question: "What does 'based' mean?", options: ["Being basic", "Being unapologetically yourself/correct", "Being boring", "Being angry"], correct: 1 },
        { question: "What is 'looksmaxxing'?", options: ["Shopping for looks", "Maximizing your physical appearance", "A makeup brand", "A camera filter"], correct: 1 },
        { question: "What does 'caught in 4K' mean?", options: ["Bought a camera", "Got caught red-handed with evidence", "Took a photo", "Watched TV"], correct: 1 },
        { question: "What is the 'hawk tuah' meme about?", options: ["A bird", "A viral street interview answer", "A song", "A dance"], correct: 1 },
        { question: "What does 'bop' mean when talking about a song?", options: ["A bad song", "A really good/catchy song", "A slow song", "A remix"], correct: 1 },
        { question: "What is a 'situationship'?", options: ["A job position", "An undefined romantic relationship", "A TV show", "A location"], correct: 1 },
        { question: "What does 'era' mean in internet slang?", options: ["A time period in history", "A current phase/personality someone is in", "An error", "A song"], correct: 1 },
        { question: "What does 'cap' mean?", options: ["A hat", "A lie", "A limit", "A trophy"], correct: 1 },
        { question: "What is 'brain rot'?", options: ["A disease", "When your brain is ruined by too much internet content", "A zombie thing", "A headache"], correct: 1 },
        { question: "What does 'sussy baka' mean?", options: ["A type of sushi", "Suspicious fool (Among Us + anime)", "A dance move", "A compliment"], correct: 1 },
        { question: "What is the 'Sigma male grindset'?", options: ["A workout", "A meme about lone-wolf hustle mentality", "A diet", "A game strategy"], correct: 1 },
        { question: "What does 'fr fr' mean?", options: ["For real for real", "French fries", "Free refill", "From France"], correct: 0 },
        { question: "Who said 'I am not crazy! I am not crazy!'?", options: ["Walter White", "Chuck McGill", "The Joker", "SpongeBob"], correct: 1 },
        { question: "What does 'yeet' mean?", options: ["To eat", "To throw something forcefully", "To sleep", "To laugh"], correct: 1 },
        { question: "What is 'skibidi' from?", options: ["A song by Little Big", "A Fortnite dance", "A meme video series", "Both A and C"], correct: 3 }
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
        { question: "What does 'KGF' stand for?", options: ["Kolar Gold Fields", "Kerala Gold Factory", "Karnataka Gold Fields", "King Gold Fort"], correct: 0 },
        { question: "Which Bollywood film won India's first Oscar?", options: ["Lagaan", "RRR", "Slumdog Millionaire", "Gandhi"], correct: 1 },
        { question: "Who is the 'Badshah of Bollywood'?", options: ["Akshay Kumar", "Shah Rukh Khan", "Salman Khan", "Ranveer Singh"], correct: 1 },
        { question: "Which film has the dialogue 'Mogambo Khush Hua'?", options: ["Sholay", "Don", "Mr. India", "Deewar"], correct: 2 },
        { question: "Who played 'Bahubali'?", options: ["Allu Arjun", "Prabhas", "Yash", "Ram Charan"], correct: 1 },
        { question: "Which actress is known as 'Queen' of Bollywood?", options: ["Deepika Padukone", "Kangana Ranaut", "Alia Bhatt", "Katrina Kaif"], correct: 1 },
        { question: "What is 'Pushpa' famous for saying?", options: ["Pushpa Raj", "Main jhukega nahi", "Flower power", "I am fire"], correct: 1 },
        { question: "Who composed the music for 'Roja'?", options: ["Pritam", "A.R. Rahman", "Vishal-Shekhar", "Amit Trivedi"], correct: 1 },
        { question: "Which Bollywood movie is about a zombie comedy?", options: ["Stree", "Go Goa Gone", "Bhool Bhulaiyaa", "Roohi"], correct: 1 },
        { question: "Who plays Rancho in '3 Idiots'?", options: ["R. Madhavan", "Sharman Joshi", "Aamir Khan", "Boman Irani"], correct: 2 },
        { question: "Which actress starred in 'Gangubai Kathiawadi'?", options: ["Deepika Padukone", "Alia Bhatt", "Priyanka Chopra", "Anushka Sharma"], correct: 1 },
        { question: "What is Ranveer Singh's wife's name?", options: ["Alia Bhatt", "Deepika Padukone", "Katrina Kaif", "Anushka Sharma"], correct: 1 },
        { question: "Which film features the 'Lungi Dance'?", options: ["Chennai Express", "Happy New Year", "Dilwale", "Ra.One"], correct: 0 },
        { question: "Who directed 'Lagaan'?", options: ["Sanjay Leela Bhansali", "Rajkumar Hirani", "Ashutosh Gowariker", "Karan Johar"], correct: 2 },
        { question: "Which actor is known as 'Bhai' of Bollywood?", options: ["Shah Rukh Khan", "Aamir Khan", "Salman Khan", "Akshay Kumar"], correct: 2 }
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
        { question: "What franchise features 'Dominic Toretto'?", options: ["Need for Speed", "Fast & Furious", "Transporter", "Mission Impossible"], correct: 1 },
        { question: "What are the Infinity Stones collected in?", options: ["A box", "A gauntlet", "A ring", "A crown"], correct: 1 },
        { question: "Who plays Spider-Man in the MCU?", options: ["Andrew Garfield", "Tobey Maguire", "Tom Holland", "Miles Morales"], correct: 2 },
        { question: "What is the name of Batman's butler?", options: ["Jarvis", "Alfred", "Watson", "Jeeves"], correct: 1 },
        { question: "Which movie features a blue pill and a red pill?", options: ["Inception", "The Matrix", "Tron", "Ready Player One"], correct: 1 },
        { question: "Who plays Captain Jack Sparrow?", options: ["Orlando Bloom", "Johnny Depp", "Javier Bardem", "Geoffrey Rush"], correct: 1 },
        { question: "What is the name of Thor's hammer?", options: ["Stormbreaker", "Excalibur", "Mjolnir", "Gungnir"], correct: 2 },
        { question: "Which Pixar movie features the emotion characters Joy and Sadness?", options: ["Up", "Coco", "Inside Out", "Soul"], correct: 2 },
        { question: "Who directed 'Inception' and 'Interstellar'?", options: ["Spielberg", "Nolan", "Fincher", "Villeneuve"], correct: 1 },
        { question: "What movie features the line 'Here's looking at you, kid'?", options: ["Gone with the Wind", "Casablanca", "Citizen Kane", "The Godfather"], correct: 1 },
        { question: "Which horror franchise features a doll named Annabelle?", options: ["Chucky", "Saw", "The Conjuring", "Insidious"], correct: 2 },
        { question: "Who plays Katniss in 'The Hunger Games'?", options: ["Emma Watson", "Shailene Woodley", "Jennifer Lawrence", "Kristen Stewart"], correct: 2 },
        { question: "What studio makes the 'Shrek' movies?", options: ["Pixar", "DreamWorks", "Disney", "Illumination"], correct: 1 },
        { question: "Which movie has the line 'I see dead people'?", options: ["The Ring", "The Sixth Sense", "Paranormal Activity", "The Others"], correct: 1 },
        { question: "Who directed 'Get Out' and 'Us'?", options: ["Ari Aster", "Jordan Peele", "James Wan", "M. Night Shyamalan"], correct: 1 },
        { question: "What is the fictional country in 'Black Panther'?", options: ["Zamunda", "Wakanda", "Genosha", "Latveria"], correct: 1 }
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
        { question: "Where were the 2024 Summer Olympics held?", options: ["Tokyo", "Los Angeles", "Paris", "London"], correct: 2 },
        { question: "How many quarters are in an NBA game?", options: ["2", "3", "4", "6"], correct: 2 },
        { question: "Who has won the most Ballon d'Or awards?", options: ["Ronaldo", "Messi", "Pele", "Maradona"], correct: 1 },
        { question: "What is a 'hat trick' in soccer?", options: ["3 assists", "3 goals in one game", "3 saves", "3 fouls"], correct: 1 },
        { question: "Which team has won the most Super Bowls?", options: ["Dallas Cowboys", "New England Patriots", "Pittsburgh Steelers", "San Francisco 49ers"], correct: 1 },
        { question: "In tennis, what is a score of 0 called?", options: ["Zero", "Nil", "Love", "Nothing"], correct: 2 },
        { question: "Who is the all-time leading scorer in the NBA?", options: ["Kareem Abdul-Jabbar", "Michael Jordan", "LeBron James", "Kobe Bryant"], correct: 2 },
        { question: "How many players are on a basketball team on the court?", options: ["4", "5", "6", "7"], correct: 1 },
        { question: "What country is the sport of Rugby most associated with?", options: ["USA", "Brazil", "New Zealand", "France"], correct: 2 },
        { question: "In American football, how many points is a touchdown worth?", options: ["3", "5", "6", "7"], correct: 2 },
        { question: "Who holds the record for most Olympic gold medals?", options: ["Usain Bolt", "Michael Phelps", "Carl Lewis", "Simone Biles"], correct: 1 },
        { question: "What sport uses the terms 'birdie' and 'eagle'?", options: ["Tennis", "Baseball", "Golf", "Badminton"], correct: 2 },
        { question: "Which F1 driver has the most world championships?", options: ["Ayrton Senna", "Michael Schumacher", "Lewis Hamilton", "Max Verstappen"], correct: 2 },
        { question: "How long is an Olympic swimming pool?", options: ["25 meters", "50 meters", "75 meters", "100 meters"], correct: 1 },
        { question: "What sport is known as 'The Beautiful Game'?", options: ["Baseball", "Cricket", "Soccer/Football", "Tennis"], correct: 2 },
        { question: "Who is considered the greatest boxer of all time?", options: ["Mike Tyson", "Muhammad Ali", "Floyd Mayweather", "Manny Pacquiao"], correct: 1 },
        { question: "In which sport do you use a shuttlecock?", options: ["Tennis", "Squash", "Badminton", "Ping Pong"], correct: 2 },
        { question: "What does 'MVP' stand for?", options: ["Most Valued Person", "Most Versatile Player", "Most Valuable Player", "Most Victorious Player"], correct: 2 },
        { question: "Which basketball player is known as 'The King'?", options: ["Kobe Bryant", "Stephen Curry", "LeBron James", "Kevin Durant"], correct: 2 },
        { question: "How many sets does a man need to win at Wimbledon?", options: ["2", "3", "4", "5"], correct: 1 },
        { question: "What color card means ejection in soccer?", options: ["Yellow", "Red", "Blue", "Green"], correct: 1 },
        { question: "Who won the 2023 NBA Finals?", options: ["Miami Heat", "Boston Celtics", "Denver Nuggets", "LA Lakers"], correct: 2 },
        { question: "What is the penalty for a 'false start' in track?", options: ["Warning", "Disqualification", "Time penalty", "Lane change"], correct: 1 },
        { question: "Which country has won the most FIFA World Cups?", options: ["Germany", "Italy", "Argentina", "Brazil"], correct: 3 },
        { question: "In baseball, what is a perfect game?", options: ["Scoring 10 runs", "No hits allowed", "No batter reaches base", "Winning by 10+"], correct: 2 },
        { question: "What sport does Serena Williams play?", options: ["Golf", "Tennis", "Volleyball", "Soccer"], correct: 1 },
        { question: "How many holes are in a standard round of golf?", options: ["9", "12", "18", "21"], correct: 2 },
        { question: "Which country dominates Table Tennis at the Olympics?", options: ["Japan", "South Korea", "China", "Germany"], correct: 2 },
        { question: "What is the term for three strikes in bowling?", options: ["Triple", "Turkey", "Trifecta", "Triple Crown"], correct: 1 },
        { question: "Who scored the 'Hand of God' goal?", options: ["Pele", "Maradona", "Ronaldo", "Zidane"], correct: 1 },
        { question: "What sport does Tom Brady play?", options: ["Baseball", "Basketball", "Football", "Hockey"], correct: 2 },
        { question: "In the UFC, how many rounds is a championship fight?", options: ["3", "4", "5", "6"], correct: 2 },
        { question: "Which team sport uses a stick and a puck?", options: ["Lacrosse", "Field Hockey", "Ice Hockey", "Cricket"], correct: 2 },
        { question: "What is Stephen Curry known for?", options: ["Dunking", "Defense", "Three-point shooting", "Blocking"], correct: 2 },
        { question: "How many periods are in an NHL hockey game?", options: ["2", "3", "4", "5"], correct: 1 },
        { question: "What martial art is known for kicks and originated in Korea?", options: ["Karate", "Judo", "Taekwondo", "Kung Fu"], correct: 2 }
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
        { question: "What band was Harry Styles in?", options: ["NSYNC", "Backstreet Boys", "One Direction", "Jonas Brothers"], correct: 2 },
        { question: "Who is known as the 'Queen of Pop'?", options: ["Beyonce", "Madonna", "Lady Gaga", "Rihanna"], correct: 1 },
        { question: "What Taylor Swift album features 'Shake It Off'?", options: ["Red", "1989", "Reputation", "Lover"], correct: 1 },
        { question: "Who sang 'Uptown Funk'?", options: ["Bruno Mars", "The Weeknd", "Pharrell", "Justin Timberlake"], correct: 0 },
        { question: "What is the best-selling album of all time?", options: ["Back in Black", "The Bodyguard", "Thriller", "Abbey Road"], correct: 2 },
        { question: "Which rapper's real name is Aubrey Drake Graham?", options: ["Kanye West", "Drake", "Lil Wayne", "Jay-Z"], correct: 1 },
        { question: "What genre is Taylor Swift primarily known for now?", options: ["Country", "Pop", "Rock", "R&B"], correct: 1 },
        { question: "Who sang 'Blinding Lights'?", options: ["Post Malone", "Drake", "The Weeknd", "Dua Lipa"], correct: 2 },
        { question: "Which band performed 'Smells Like Teen Spirit'?", options: ["Pearl Jam", "Nirvana", "Soundgarden", "Alice in Chains"], correct: 1 },
        { question: "What does 'DJ' stand for?", options: ["Dance Jockey", "Disc Jockey", "Digital Jukebox", "Dynamic Jam"], correct: 1 },
        { question: "Who released the album 'DAMN.'?", options: ["Drake", "J. Cole", "Kendrick Lamar", "Travis Scott"], correct: 2 },
        { question: "Which instrument does a drummer play?", options: ["Percussion", "Strings", "Woodwind", "Brass"], correct: 0 },
        { question: "Who sang 'Drivers License'?", options: ["Billie Eilish", "Olivia Rodrigo", "Dua Lipa", "Ariana Grande"], correct: 1 },
        { question: "What is Kanye West's legal name now?", options: ["Kanye", "Ye", "Yeezy", "West"], correct: 1 },
        { question: "Which group sang 'Dynamite'?", options: ["Blackpink", "BTS", "Twice", "NCT"], correct: 1 },
        { question: "Who performed 'Levitating'?", options: ["Doja Cat", "Megan Thee Stallion", "Dua Lipa", "Cardi B"], correct: 2 },
        { question: "What year did Spotify launch?", options: ["2006", "2008", "2010", "2012"], correct: 1 },
        { question: "Who is known for the song 'Lose Yourself'?", options: ["50 Cent", "Dr. Dre", "Eminem", "Snoop Dogg"], correct: 2 },
        { question: "What is the musical term for playing softly?", options: ["Forte", "Piano", "Allegro", "Staccato"], correct: 1 },
        { question: "Who sang 'Old Town Road'?", options: ["Post Malone", "Lil Nas X", "DaBaby", "Roddy Ricch"], correct: 1 },
        { question: "Which artist released '30' in 2021?", options: ["Taylor Swift", "Billie Eilish", "Adele", "Ed Sheeran"], correct: 2 },
        { question: "What does 'BPM' stand for in music?", options: ["Beats Per Measure", "Beats Per Minute", "Bass Per Melody", "Big Pop Music"], correct: 1 },
        { question: "Who is the lead singer of Maroon 5?", options: ["Adam Levine", "Chris Martin", "Brandon Flowers", "Patrick Stump"], correct: 0 },
        { question: "Which rapper released 'ASTROWORLD'?", options: ["Kanye West", "Kid Cudi", "Travis Scott", "Playboi Carti"], correct: 2 },
        { question: "Who sang 'Someone Like You'?", options: ["Sam Smith", "Adele", "Amy Winehouse", "Lana Del Rey"], correct: 1 },
        { question: "What is a group of four musicians called?", options: ["Trio", "Quartet", "Quintet", "Ensemble"], correct: 1 },
        { question: "Who had the hit 'Watermelon Sugar'?", options: ["Ed Sheeran", "Shawn Mendes", "Harry Styles", "Niall Horan"], correct: 2 },
        { question: "Which genre originated in Jamaica?", options: ["Blues", "Jazz", "Reggae", "Salsa"], correct: 2 },
        { question: "Who released the song 'Montero (Call Me By Your Name)'?", options: ["Tyler the Creator", "Lil Nas X", "Frank Ocean", "Kid Cudi"], correct: 1 },
        { question: "What is SZA's most streamed song?", options: ["Good Days", "Kill Bill", "Kiss Me More", "Shirt"], correct: 1 },
        { question: "Which artist is known as 'Champagne Papi'?", options: ["Jay-Z", "Drake", "Future", "Metro Boomin"], correct: 1 },
        { question: "What is the name of Post Malone's debut album?", options: ["Beerbongs & Bentleys", "Stoney", "Hollywood's Bleeding", "Twelve Carat Toothache"], correct: 1 },
        { question: "Who sang 'WAP' with Megan Thee Stallion?", options: ["Nicki Minaj", "Doja Cat", "Cardi B", "Lizzo"], correct: 2 },
        { question: "What instrument does Lizzo famously play?", options: ["Trumpet", "Saxophone", "Flute", "Clarinet"], correct: 2 },
        { question: "Which rock band has a song called 'Stairway to Heaven'?", options: ["Pink Floyd", "Led Zeppelin", "The Rolling Stones", "AC/DC"], correct: 1 },
        { question: "Who is the youngest self-made billionaire rapper?", options: ["Drake", "Jay-Z", "Kanye West", "Rihanna"], correct: 2 }
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
        { question: "E-Sports often refers to competitive playing of which game?", options: ["Candy Crush", "League of Legends", "Animal Crossing", "Sims"], correct: 1 },
        { question: "What is the default character skin in Fortnite called?", options: ["Jonesy", "Ramirez", "Peely", "Drift"], correct: 0 },
        { question: "In Minecraft, what do you need to go to the Nether?", options: ["Diamond Portal", "Obsidian Portal", "Gold Portal", "Iron Portal"], correct: 1 },
        { question: "What game has characters called 'Legends' and takes place in the Outlands?", options: ["Overwatch", "Valorant", "Apex Legends", "Fortnite"], correct: 2 },
        { question: "In Roblox, what is the virtual currency called?", options: ["V-Bucks", "Robux", "Minecoins", "Gems"], correct: 1 },
        { question: "What is the final boss in most Mario games?", options: ["Wario", "Bowser", "King Boo", "Donkey Kong"], correct: 1 },
        { question: "Which game features the phrase 'Winner Winner Chicken Dinner'?", options: ["Fortnite", "PUBG", "Apex", "Warzone"], correct: 1 },
        { question: "What material do you need to craft a pickaxe first in Minecraft?", options: ["Stone", "Iron", "Wood", "Diamond"], correct: 2 },
        { question: "In Fortnite, what is the storm called?", options: ["The Zone", "The Storm", "The Ring", "The Gas"], correct: 1 },
        { question: "Who is the main character of 'The Last of Us'?", options: ["Nathan Drake", "Joel", "Ellie", "Tommy"], correct: 1 },
        { question: "What game features agents with abilities like 'Jett' and 'Sage'?", options: ["Overwatch", "Apex Legends", "Valorant", "Rainbow Six"], correct: 2 },
        { question: "In GTA, what does the star system represent?", options: ["Score", "Wanted Level", "Health", "Rank"], correct: 1 },
        { question: "What is the Ender Dragon found in?", options: ["The Nether", "The Overworld", "The End", "The Aether"], correct: 2 },
        { question: "Which Pokemon game introduced Mega Evolution?", options: ["Sun/Moon", "X/Y", "Sword/Shield", "Black/White"], correct: 1 },
        { question: "What is the name of Link's horse in Zelda?", options: ["Shadowfax", "Roach", "Epona", "Agro"], correct: 2 },
        { question: "In 'Elden Ring', what is the main quest item?", options: ["Master Sword", "Elden Ring", "Chaos Emerald", "Triforce"], correct: 1 },
        { question: "What game has you building and defending against zombies with plants?", options: ["Zombie Army", "Plants vs Zombies", "Left 4 Dead", "Dead Rising"], correct: 1 },
        { question: "What is the highest rank in most competitive games?", options: ["Diamond", "Master", "Radiant/Predator/Champion", "Platinum"], correct: 2 },
        { question: "In 'Fall Guys', what are the characters shaped like?", options: ["Squares", "Beans/Jelly beans", "Balls", "Cylinders"], correct: 1 },
        { question: "What console is the 'Halo' series exclusive to?", options: ["PlayStation", "Nintendo", "Xbox", "PC only"], correct: 2 },
        { question: "In Minecraft, what mob explodes when near you?", options: ["Zombie", "Skeleton", "Creeper", "Enderman"], correct: 2 },
        { question: "What game features 'Tilted Towers'?", options: ["Call of Duty", "Apex Legends", "Fortnite", "PUBG"], correct: 2 },
        { question: "Who is Sonic's sidekick?", options: ["Knuckles", "Shadow", "Tails", "Amy"], correct: 2 },
        { question: "What does 'GG' stand for in gaming?", options: ["Good Going", "Great Game", "Good Game", "Got Gold"], correct: 2 },
        { question: "In 'Rocket League', what sport is combined with cars?", options: ["Basketball", "Soccer/Football", "Hockey", "All of the above"], correct: 3 },
        { question: "What year did Fortnite Battle Royale launch?", options: ["2015", "2016", "2017", "2018"], correct: 2 },
        { question: "What is the rarest item in Minecraft?", options: ["Diamond", "Netherite", "Dragon Egg", "Emerald"], correct: 2 },
        { question: "In 'Overwatch', what role does Mercy play?", options: ["Tank", "DPS", "Support/Healer", "Defense"], correct: 2 },
        { question: "What game features a character named 'Steve'?", options: ["Roblox", "Minecraft", "Terraria", "Fortnite"], correct: 1 },
        { question: "Which FIFA game introduced Ultimate Team?", options: ["FIFA 07", "FIFA 09", "FIFA 11", "FIFA 13"], correct: 1 },
        { question: "What is the max level in most Pokemon games?", options: ["50", "75", "99", "100"], correct: 3 },
        { question: "In 'Spider-Man PS4', who is the main villain?", options: ["Green Goblin", "Venom", "Mr. Negative/Doc Ock", "Kingpin"], correct: 2 },
        { question: "What type of game is 'Stardew Valley'?", options: ["FPS", "Farming simulator", "Racing", "Horror"], correct: 1 },
        { question: "What is the currency in Fortnite?", options: ["Robux", "Gold", "V-Bucks", "Credits"], correct: 2 },
        { question: "In 'League of Legends', what is the map called?", options: ["King's Canyon", "Summoner's Rift", "Verdansk", "Erangel"], correct: 1 },
        { question: "Who developed 'The Legend of Zelda'?", options: ["Sony", "Capcom", "Nintendo", "Square Enix"], correct: 2 }
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
        { question: "What studio produced 'Spirited Away'?", options: ["Toei", "MAPPA", "Ghibli", "Madhouse"], correct: 2 },
        { question: "What is Luffy's Devil Fruit power?", options: ["Fire Fire Fruit", "Gum-Gum Fruit", "Chop Chop Fruit", "Smoke Smoke Fruit"], correct: 1 },
        { question: "Who is Naruto's best friend and rival?", options: ["Sakura", "Kakashi", "Sasuke", "Gaara"], correct: 2 },
        { question: "What is the name of Goku's signature attack?", options: ["Rasengan", "Spirit Bomb", "Kamehameha", "Final Flash"], correct: 2 },
        { question: "In 'My Hero Academia', what is Deku's real name?", options: ["Katsuki Bakugo", "Shoto Todoroki", "Izuku Midoriya", "Tenya Iida"], correct: 2 },
        { question: "What is the name of the survey corps in Attack on Titan?", options: ["Military Police", "Garrison", "Scout Regiment", "Warriors"], correct: 2 },
        { question: "Who is the main villain in Dragon Ball Z's Frieza Saga?", options: ["Cell", "Frieza", "Buu", "Vegeta"], correct: 1 },
        { question: "What breathing style does Tanjiro use in Demon Slayer?", options: ["Flame Breathing", "Water Breathing", "Thunder Breathing", "Wind Breathing"], correct: 1 },
        { question: "In 'Naruto', what are the tailed beasts called?", options: ["Bijuu", "Summons", "Curse Marks", "Akatsuki"], correct: 0 },
        { question: "Who is the captain of the Straw Hat Pirates' crew's swordsman?", options: ["Sanji", "Zoro", "Usopp", "Franky"], correct: 1 },
        { question: "What is the name of the notebook in Death Note?", options: ["Black Book", "Kill Book", "Death Note", "Soul Ledger"], correct: 2 },
        { question: "In 'Hunter x Hunter', what is Gon searching for?", options: ["His mother", "His father", "A treasure", "A legendary beast"], correct: 1 },
        { question: "What is Vegeta's signature move?", options: ["Kamehameha", "Spirit Bomb", "Galick Gun", "Destructo Disc"], correct: 2 },
        { question: "Which anime features alchemy and two brothers?", options: ["Naruto", "Blue Exorcist", "Fullmetal Alchemist", "Soul Eater"], correct: 2 },
        { question: "What is the name of the school in My Hero Academia?", options: ["Hogwarts", "UA High", "Kunugigaoka", "True Cross Academy"], correct: 1 },
        { question: "In 'Bleach', what is Ichigo's weapon called?", options: ["Bankai", "Zanpakuto", "Zangetsu", "Shikai"], correct: 2 },
        { question: "Who is the strongest Hero in One Punch Man?", options: ["Genos", "Blast", "Saitama", "Tatsumaki"], correct: 2 },
        { question: "What is Eren Yeager's Titan form called?", options: ["Colossal Titan", "Armored Titan", "Attack Titan", "Beast Titan"], correct: 2 },
        { question: "In 'Naruto', who is the leader of the Akatsuki?", options: ["Itachi", "Orochimaru", "Pain/Nagato", "Madara"], correct: 2 },
        { question: "What sport is 'Blue Lock' about?", options: ["Basketball", "Baseball", "Soccer/Football", "Volleyball"], correct: 2 },
        { question: "What sport is 'Haikyuu!!' about?", options: ["Basketball", "Volleyball", "Soccer", "Tennis"], correct: 1 },
        { question: "In 'Tokyo Ghoul', what is Kaneki's ghoul type?", options: ["Ukaku", "Koukaku", "Rinkaku", "Bikaku"], correct: 2 },
        { question: "What is All Might's real name in My Hero Academia?", options: ["Toshinori Yagi", "Shota Aizawa", "Endeavor", "Gran Torino"], correct: 0 },
        { question: "Who created the manga 'One Piece'?", options: ["Masashi Kishimoto", "Eiichiro Oda", "Akira Toriyama", "Tite Kubo"], correct: 1 },
        { question: "In 'Chainsaw Man', what devil is Pochita?", options: ["Gun Devil", "Chainsaw Devil", "Control Devil", "War Devil"], correct: 1 },
        { question: "What is the name of the pirate ship in One Piece (current)?", options: ["Going Merry", "Thousand Sunny", "Red Force", "Moby Dick"], correct: 1 },
        { question: "In 'Mob Psycho 100', what is Mob's real name?", options: ["Arataka Reigen", "Shigeo Kageyama", "Teruki Hanazawa", "Ritsu Kageyama"], correct: 1 },
        { question: "What clan does Sasuke belong to?", options: ["Hyuga", "Uzumaki", "Uchiha", "Senju"], correct: 2 },
        { question: "Which anime features a 'Death Parade' bar?", options: ["Death Note", "Death Parade", "Angel Beats", "Psycho-Pass"], correct: 1 },
        { question: "What is the name of Gojo's domain expansion?", options: ["Malevolent Shrine", "Infinite Void", "Chimera Shadow Garden", "Coffin of the Iron Mountain"], correct: 1 },
        { question: "In 'Vinland Saga', what is Thorfinn's goal at first?", options: ["Become king", "Kill Askeladd", "Find Vinland", "Become a monk"], correct: 1 },
        { question: "What is Luffy's gear 5 form based on?", options: ["A dragon", "Sun God Nika", "A monkey", "Poseidon"], correct: 1 },
        { question: "In 'Solo Leveling', what rank does Sung Jin-Woo start as?", options: ["S-Rank", "A-Rank", "E-Rank", "D-Rank"], correct: 2 },
        { question: "Who is the main character of 'Cowboy Bebop'?", options: ["Jet Black", "Spike Spiegel", "Vicious", "Ed"], correct: 1 },
        { question: "What is the name of the strongest curse in Jujutsu Kaisen?", options: ["Mahito", "Jogo", "Sukuna", "Hanami"], correct: 2 },
        { question: "In 'Steins;Gate', what device is used for time travel?", options: ["DeLorean", "Phone Microwave", "Time Watch", "Quantum Leap"], correct: 1 },
        { question: "What anime has the quote 'It's over 9000!'?", options: ["Naruto", "One Piece", "Dragon Ball Z", "Bleach"], correct: 2 },
        { question: "Who is the main character of 'Neon Genesis Evangelion'?", options: ["Asuka", "Rei", "Shinji Ikari", "Gendo"], correct: 2 },
        { question: "What is Rock Lee known for in Naruto?", options: ["Ninjutsu master", "Taijutsu only/no ninjutsu", "Genjutsu expert", "Medical ninja"], correct: 1 },
        { question: "In 'Black Clover', who has no magic?", options: ["Yuno", "Asta", "Noelle", "Yami"], correct: 1 },
        { question: "What type of creature is Chopper in One Piece?", options: ["Dog", "Cat", "Reindeer", "Raccoon"], correct: 2 }
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
        { question: "Gouda is a type of what?", options: ["Bread", "Cheese", "Meat", "Wine"], correct: 1 },
        { question: "What is the hottest pepper in the world (2024)?", options: ["Ghost Pepper", "Carolina Reaper", "Pepper X", "Trinidad Scorpion"], correct: 2 },
        { question: "Which country is famous for Pad Thai?", options: ["Vietnam", "China", "Thailand", "Japan"], correct: 2 },
        { question: "What gives bread its rise?", options: ["Baking soda", "Yeast", "Salt", "Sugar"], correct: 1 },
        { question: "Which fruit is known as the 'King of Fruits'?", options: ["Mango", "Durian", "Jackfruit", "Pineapple"], correct: 1 },
        { question: "What type of cuisine is Kimchi from?", options: ["Japanese", "Chinese", "Korean", "Thai"], correct: 2 },
        { question: "What is the main ingredient in traditional pesto?", options: ["Parsley", "Basil", "Cilantro", "Mint"], correct: 1 },
        { question: "Which drink is made from fermented grapes?", options: ["Beer", "Whiskey", "Wine", "Vodka"], correct: 2 },
        { question: "What is the most consumed fruit in the world?", options: ["Apple", "Banana", "Orange", "Mango"], correct: 1 },
        { question: "Tacos originally come from which country?", options: ["Spain", "USA", "Mexico", "Brazil"], correct: 2 },
        { question: "What is mozzarella traditionally made from?", options: ["Cow milk", "Goat milk", "Buffalo milk", "Sheep milk"], correct: 2 },
        { question: "What spice gives curry its yellow color?", options: ["Paprika", "Saffron", "Turmeric", "Cumin"], correct: 2 },
        { question: "Which bean is used to make chocolate?", options: ["Coffee bean", "Cacao bean", "Vanilla bean", "Lima bean"], correct: 1 },
        { question: "What is the most eaten food in the world?", options: ["Bread", "Rice", "Pasta", "Potatoes"], correct: 1 },
        { question: "What country does Ramen originate from?", options: ["Korea", "Japan", "China", "Thailand"], correct: 2 },
        { question: "Which vitamin do carrots famously contain?", options: ["Vitamin C", "Vitamin A", "Vitamin D", "Vitamin K"], correct: 1 }
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
function initTriviaRoyaleGame(room, category = 'general', premiumOptions = {}) {
    const maxRounds = premiumOptions.roundCount || 10;
    let questions = [];

    // Parse custom trivia questions: "Question, Correct, Wrong1, Wrong2, Wrong3"
    if (premiumOptions.customQuestions) {
        questions = premiumOptions.customQuestions.split('\n')
            .map(line => line.trim()).filter(l => l.includes(','))
            .map(line => {
                const parts = line.split(',').map(s => s.trim());
                if (parts.length >= 2) {
                    const correct = parts[1];
                    const wrong = parts.slice(2).filter(s => s.length > 0);
                    while (wrong.length < 3) wrong.push('???');
                    return { question: parts[0], correct, options: [correct, ...wrong.slice(0, 3)].sort(() => Math.random() - 0.5) };
                }
                return null;
            }).filter(Boolean);
    }

    room.gameData = {
        questions: questions.length ? questions.slice(0, maxRounds) : [],
        currentQuestionIndex: 0,
        roundNumber: 1,
        maxRounds: maxRounds,
        phase: 'countdown',
        answers: {},
        scores: {},
        streaks: {},
        timePerQuestion: 15,
        roleAssignments: {},
        category: category,
        useCustomQuestions: questions.length > 0
    };
    room.players.forEach(p => {
        room.gameData.scores[p.name] = 0;
        room.gameData.streaks[p.name] = 0;
    });
}

function initThisOrThatPartyGame(room, category = 'mixed', premiumOptions = {}) {
    const maxRounds = premiumOptions.roundCount || 10;
    let questions;

    // Parse custom questions: "Option A, Option B"
    if (premiumOptions.customQuestions) {
        const custom = premiumOptions.customQuestions.split('\n')
            .map(line => line.trim()).filter(l => l.includes(','))
            .map(line => { const [a, b] = line.split(',').map(s => s.trim()); return { optionA: a, optionB: b }; })
            .filter(q => q.optionA && q.optionB);
        if (custom.length > 0) questions = custom;
    }
    if (!questions) questions = thisOrThatQuestions[category] || thisOrThatQuestions.mixed;

    room.gameData = {
        questions: [...questions].sort(() => Math.random() - 0.5).slice(0, maxRounds),
        currentQuestionIndex: 0,
        roundNumber: 1,
        maxRounds: maxRounds,
        phase: 'countdown',
        votes: {},
        scores: {},
        timePerRound: 15,
        roleAssignments: {},
        category: category
    };
    room.players.forEach(p => { room.gameData.scores[p.name] = 0; });
}

function initHotTakesPartyGame(room, category = 'mild', premiumOptions = {}) {
    const maxRounds = premiumOptions.roundCount || 10;
    let questions;

    // Parse custom statements: one per line
    if (premiumOptions.customQuestions) {
        const custom = premiumOptions.customQuestions.split('\n')
            .map(line => line.trim()).filter(l => l.length > 0)
            .map(s => ({ statement: s }));
        if (custom.length > 0) questions = custom;
    }
    if (!questions) questions = hotTakesQuestions[category] || hotTakesQuestions.mild;

    room.gameData = {
        questions: [...questions].sort(() => Math.random() - 0.5).slice(0, maxRounds),
        currentQuestionIndex: 0,
        roundNumber: 1,
        maxRounds: maxRounds,
        phase: 'countdown',
        ratings: {},
        scores: {},
        timePerRound: 20,
        roleAssignments: {},
        category: category
    };
    room.players.forEach(p => { room.gameData.scores[p.name] = 0; });
}

function initNeverEverPartyGame(room, category = 'clean', premiumOptions = {}) {
    const maxRounds = premiumOptions.roundCount || 12;
    let questions;

    // Parse custom statements: one per line (auto-prefix "Never have I ever" if needed)
    if (premiumOptions.customQuestions) {
        const custom = premiumOptions.customQuestions.split('\n')
            .map(line => line.trim()).filter(l => l.length > 0)
            .map(s => ({ statement: s.toLowerCase().startsWith('never have i ever') ? s : 'Never have I ever ' + s }));
        if (custom.length > 0) questions = custom;
    }
    if (!questions) questions = neverEverQuestions[category] || neverEverQuestions.clean;

    room.gameData = {
        questions: [...questions].sort(() => Math.random() - 0.5).slice(0, maxRounds),
        currentQuestionIndex: 0,
        roundNumber: 1,
        maxRounds: maxRounds,
        phase: 'countdown',
        responses: {},
        scores: {},
        timePerRound: 15,
        roleAssignments: {},
        category: category
    };
    room.players.forEach(p => { room.gameData.scores[p.name] = 0; });
}

function initBetOrBluffGame(room, startingPoints = 500, premiumOptions = {}) {
    const maxRounds = premiumOptions.roundCount || 8;
    let questions;

    // Parse custom questions: "Question text, unit"
    if (premiumOptions.customQuestions) {
        const custom = premiumOptions.customQuestions.split('\n')
            .map(line => line.trim()).filter(l => l.length > 0)
            .map(line => {
                const parts = line.split(',').map(s => s.trim());
                return { question: parts[0], unit: parts[1] || '' };
            }).filter(q => q.question);
        if (custom.length > 0) questions = custom;
    }
    if (!questions) questions = [...betOrBluffQuestions];

    room.gameData = {
        questions: [...questions].sort(() => Math.random() - 0.5).slice(0, maxRounds),
        currentQuestionIndex: 0,
        roundNumber: 1,
        maxRounds: maxRounds,
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

    // Build lookup map to avoid O(n²) find() calls
    const playerById = new Map();
    const playerByName = new Map();
    for (const p of room.players) {
        playerById.set(p.id, p);
        playerByName.set(p.name, p);
    }

    Object.entries(room.gameData.answers).forEach(([pid, ans]) => {
        const p = playerById.get(pid);
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
            const player = playerByName.get(name);
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

        function buildFinalLeaderboard() {
            const byName = new Map();
            for (const p of room.players) byName.set(p.name, p);
            return Object.entries(room.gameData.scores)
                .map(([name, score]) => {
                    const p = byName.get(name);
                    return { name, score, isPremium: p?.isPremium || false, cosmetics: p?.cosmetics || {} };
                })
                .sort((a, b) => b.score - a.score);
        }

        if (room.gameData.roundNumber > room.gameData.maxRounds) {
            io.to(room.code).emit('trivia-game-over', {
                finalScores: room.gameData.scores,
                finalLeaderboard: buildFinalLeaderboard(),
                winner: getTopPlayer(room.gameData.scores)
            });
        } else {
            const nextQ = room.gameData.questions[room.gameData.currentQuestionIndex];
            if (!nextQ) {
                io.to(room.code).emit('trivia-game-over', {
                    finalScores: room.gameData.scores,
                    finalLeaderboard: buildFinalLeaderboard(),
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
    const isLastQuestion = room.gameData.currentQuestionIndex >= room.gameData.maxRounds - 1;
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
        scores: room.gameData.scores,
        isLastQuestion
    });
}

function calculateHotTakesPartyResults(room, io) {
    room.gameData.phase = 'results';
    const ratings = Object.values(room.gameData.ratings);
    const avg = ratings.length ? ratings.reduce((s,r) => s + r.rating, 0) / ratings.length : 5;

    // Distribution array for 1-10
    const distribution = Array(10).fill(0);
    let mostAgree = null, mostDisagree = null;
    let highestRating = 0, lowestRating = 11;

    ratings.forEach(r => {
        if (r.rating >= 1 && r.rating <= 10) distribution[r.rating - 1]++;
        if (r.rating > highestRating) { highestRating = r.rating; mostAgree = r.playerName; }
        if (r.rating < lowestRating) { lowestRating = r.rating; mostDisagree = r.playerName; }
    });

    // Score: players who picked the mode rating get points
    let mode = 0, modeCount = 0;
    distribution.forEach((count, i) => {
        if (count > modeCount) { modeCount = count; mode = i + 1; }
    });
    ratings.forEach(r => { if (r.rating === mode) room.gameData.scores[r.playerName] = (room.gameData.scores[r.playerName] || 0) + 10; });

    const isLastStatement = room.gameData.currentQuestionIndex >= room.gameData.maxRounds - 1;

    io.to(room.code).emit('hottakes-party-results', {
        statement: room.gameData.questions[room.gameData.currentQuestionIndex].statement,
        average: Math.round(avg*10)/10,
        distribution,
        mostAgree,
        mostDisagree,
        scores: room.gameData.scores,
        isLastStatement
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
    const isLastStatement = room.gameData.currentQuestionIndex >= room.gameData.maxRounds - 1;

    io.to(room.code).emit('neverever-party-results', {
        statement: room.gameData.questions[room.gameData.currentQuestionIndex].statement,
        whoHas: haveList,
        whoHasnt: haventList,
        totalHas: haveList.length,
        totalHasnt: haventList.length,
        percentHas: total ? Math.round(haveList.length/total*100) : 50,
        scores: room.gameData.scores,
        isLastStatement
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

    // Server-side failsafe: auto-advance if host never sends bet-time-up
    if (room.gameData._betTimer) {
        clearTimeout(room.gameData._betTimer);
    }
    room.gameData._betTimer = setTimeout(() => {
        room.gameData._betTimer = null;
        if (room.gameData?.phase === 'betting') {
            console.log(`[BET-OR-BLUFF] Server failsafe: auto-advancing bet phase for room ${roomCode}`);
            room.players.forEach(p => {
                if (!room.gameData.bets[p.id]) {
                    room.gameData.bets[p.id] = { targetPlayerId: null, betAmount: 0, playerName: p.name };
                }
            });
            calculateBetOrBluffResults(room, io);
        }
    }, (room.gameData.timePerBet + 5) * 1000);
}

function calculateBetOrBluffResults(room, io) {
    room.gameData.phase = 'results';
    const all = Object.values(room.gameData.guesses).map(g => g.guess).sort((a,b) => a-b);
    const mid = Math.floor(all.length/2);
    const target = all.length % 2 ? all[mid] : (all[mid-1]+all[mid])/2;
    const correctAnswer = Math.round(target * 10) / 10;

    let closestId = null, closestDiff = Infinity, closestName = null, closestGuess = null;
    Object.entries(room.gameData.guesses).forEach(([id, g]) => {
        const diff = Math.abs(g.guess - target);
        if (diff < closestDiff) {
            closestDiff = diff;
            closestId = id;
            closestName = g.playerName;
            closestGuess = g.guess;
        }
    });

    const betResults = [];
    Object.entries(room.gameData.bets).forEach(([pid, b]) => {
        const p = room.players.find(x => x.id === pid);
        if (!p) return;
        let winnings = 0;
        if (b.targetPlayerId === closestId) {
            winnings = b.betAmount;
            room.gameData.chips[p.name] += b.betAmount;
        } else if (b.targetPlayerId) {
            winnings = -b.betAmount;
            room.gameData.chips[p.name] = Math.max(0, room.gameData.chips[p.name] - b.betAmount);
        }
        betResults.push({ playerName: p.name, winnings, newTotal: room.gameData.chips[p.name] });
    });

    if (closestName) room.gameData.chips[closestName] += 50;
    // Update newTotal for closest player in betResults
    const closestResult = betResults.find(r => r.playerName === closestName);
    if (closestResult) closestResult.newTotal = room.gameData.chips[closestName];

    const leaderboard = Object.entries(room.gameData.chips)
        .map(([name, chips]) => ({ name, chips }))
        .sort((a, b) => b.chips - a.chips);

    const isLastQuestion = room.gameData.currentQuestionIndex >= room.gameData.maxRounds - 1;

    io.to(room.code).emit('betorbluff-results', {
        correctAnswer,
        closestPlayer: closestName,
        closestGuess,
        betResults,
        leaderboard,
        isLastQuestion,
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
        // Only load default questions if no custom questions were provided AND pool is empty or category changed
        if (!room.gameData.useCustomQuestions && (room.gameData.questions.length === 0 || (category && category !== room.gameData.category))) {
            const questions = triviaQuestions[cat];
            if (!questions) {
                console.log('WARNING: Category not found:', cat, '- using general');
            }
            room.gameData.questions = [...(questions || triviaQuestions.general)].sort(() => Math.random() - 0.5).slice(0, room.gameData.maxRounds || 10);
            room.gameData.category = cat;
            room.gameData.currentQuestionIndex = 0;
            room.gameData.roundNumber = 1;
            console.log('Trivia loaded category:', cat, '- First question:', room.gameData.questions[0]?.question);
        }

        const q = room.gameData.questions[room.gameData.currentQuestionIndex];
        if (!q) return;

        // Clear any previous round timer
        if (room.gameData._roundTimer) {
            clearTimeout(room.gameData._roundTimer);
            room.gameData._roundTimer = null;
        }

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

        // Server-side failsafe timer: auto-advance if host never sends trivia-time-up
        // Add 3s buffer beyond the question time limit for network lag
        room.gameData._roundTimer = setTimeout(() => {
            room.gameData._roundTimer = null;
            if (room.gameData?.phase === 'question') {
                console.log(`[TRIVIA] Server failsafe: auto-advancing round for room ${roomCode}`);
                calculateTriviaResults(room, io);
            }
        }, (room.gameData.timePerQuestion + 3) * 1000);
    });

    socket.on('trivia-answer', ({roomCode, answerIndex}) => {
        const room = rooms.get(roomCode), player = players.get(socket.id);
        if (!room?.gameData || !player || room.gameData.phase !== 'question' || room.gameData.answers[socket.id]) return;

        room.gameData.answers[socket.id] = { answerIndex, timestamp: Date.now() };
        socket.emit('trivia-answer-received', { answerIndex });

        const answeredCount = Object.keys(room.gameData.answers).length;
        // Count only connected players (those still in the players map)
        const connectedPlayerCount = room.players.filter(p => players.has(p.id)).length;
        const totalPlayerCount = room.players.length;

        // Throttle answer-count broadcasts to avoid flooding clients
        // Advance when all CONNECTED players have answered (don't wait for disconnected ones)
        if (answeredCount >= connectedPlayerCount) {
            clearTimeout(room.gameData._answerCountTimer);
            clearTimeout(room.gameData._roundTimer);
            room.gameData._roundTimer = null;
            io.to(roomCode).emit('trivia-answer-count', { answeredCount, totalPlayers: totalPlayerCount });
            calculateTriviaResults(room, io);
        } else {
            if (!room.gameData._answerCountTimer) {
                room.gameData._answerCountTimer = setTimeout(() => {
                    room.gameData._answerCountTimer = null;
                    const currentCount = Object.keys(room.gameData.answers).length;
                    io.to(roomCode).emit('trivia-answer-count', { answeredCount: currentCount, totalPlayers: totalPlayerCount });
                }, 500);
            }
        }
    });

    socket.on('trivia-time-up', ({roomCode}) => {
        const room = rooms.get(roomCode);
        if (room?.gameData?.phase === 'question') {
            // Clear server-side failsafe since client triggered time-up
            if (room.gameData._roundTimer) {
                clearTimeout(room.gameData._roundTimer);
                room.gameData._roundTimer = null;
            }
            calculateTriviaResults(room, io);
        }
    });

    // THIS OR THAT
    socket.on('thisorthat-party-start-round', ({roomCode}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData) return;

        if (room.gameData._roundTimer) {
            clearTimeout(room.gameData._roundTimer);
            room.gameData._roundTimer = null;
        }

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

        room.gameData._roundTimer = setTimeout(() => {
            room.gameData._roundTimer = null;
            if (room.gameData?.phase === 'voting') {
                console.log(`[THIS-OR-THAT] Server failsafe: auto-advancing for room ${roomCode}`);
                calculateThisOrThatPartyResults(room, io);
            }
        }, (room.gameData.timePerRound + 5) * 1000);
    });
    
    socket.on('thisorthat-party-vote', ({roomCode, choice}) => {
        const room = rooms.get(roomCode), player = players.get(socket.id);
        if (!room?.gameData || !player || room.gameData.phase !== 'voting' || room.gameData.votes[socket.id]) return;
        
        room.gameData.votes[socket.id] = { choice, playerName: player.playerName };
        socket.emit('thisorthat-party-vote-received', { choice });
        
        const votedCount = Object.keys(room.gameData.votes).length;
        io.to(roomCode).emit('thisorthat-party-vote-counted', {
            votedCount,
            totalPlayers: room.players.length
        });

        const connectedCount = room.players.filter(p => players.has(p.id)).length;
        if (votedCount >= connectedCount) {
            if (room.gameData._roundTimer) { clearTimeout(room.gameData._roundTimer); room.gameData._roundTimer = null; }
            calculateThisOrThatPartyResults(room, io);
        }
    });
    
    socket.on('thisorthat-party-time-up', ({roomCode}) => {
        const room = rooms.get(roomCode);
        if (room?.gameData?.phase === 'voting') {
            if (room.gameData._roundTimer) { clearTimeout(room.gameData._roundTimer); room.gameData._roundTimer = null; }
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

        if (room.gameData._roundTimer) {
            clearTimeout(room.gameData._roundTimer);
            room.gameData._roundTimer = null;
        }

        const q = room.gameData.questions[room.gameData.currentQuestionIndex];
        room.gameData.phase = 'rating';
        room.gameData.ratings = {};

        io.to(roomCode).emit('hottakes-party-statement', {
            statement: q.statement,
            roundNumber: room.gameData.roundNumber,
            totalRounds: room.gameData.maxRounds,
            timeLimit: room.gameData.timePerRound
        });

        room.gameData._roundTimer = setTimeout(() => {
            room.gameData._roundTimer = null;
            if (room.gameData?.phase === 'rating') {
                console.log(`[HOT-TAKES] Server failsafe: auto-advancing for room ${roomCode}`);
                calculateHotTakesPartyResults(room, io);
            }
        }, (room.gameData.timePerRound + 5) * 1000);
    });
    
    socket.on('hottakes-party-rate', ({roomCode, rating}) => {
        const room = rooms.get(roomCode), player = players.get(socket.id);
        if (!room?.gameData || !player || room.gameData.phase !== 'rating' || room.gameData.ratings[socket.id]) return;
        
        room.gameData.ratings[socket.id] = { rating, playerName: player.playerName };
        socket.emit('hottakes-party-rate-received', { rating });
        
        const ratedCount = Object.keys(room.gameData.ratings).length;
        io.to(roomCode).emit('hottakes-party-rate-counted', {
            ratedCount,
            totalPlayers: room.players.length
        });

        const connectedCount = room.players.filter(p => players.has(p.id)).length;
        if (ratedCount >= connectedCount) {
            if (room.gameData._roundTimer) { clearTimeout(room.gameData._roundTimer); room.gameData._roundTimer = null; }
            calculateHotTakesPartyResults(room, io);
        }
    });
    
    socket.on('hottakes-party-time-up', ({roomCode}) => {
        const room = rooms.get(roomCode);
        if (room?.gameData?.phase === 'rating') {
            if (room.gameData._roundTimer) { clearTimeout(room.gameData._roundTimer); room.gameData._roundTimer = null; }
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

        if (room.gameData._roundTimer) {
            clearTimeout(room.gameData._roundTimer);
            room.gameData._roundTimer = null;
        }

        const q = room.gameData.questions[room.gameData.currentQuestionIndex];
        room.gameData.phase = 'responding';
        room.gameData.responses = {};

        io.to(roomCode).emit('neverever-party-statement', {
            statement: q.statement,
            roundNumber: room.gameData.roundNumber,
            totalRounds: room.gameData.maxRounds,
            timeLimit: room.gameData.timePerRound
        });

        room.gameData._roundTimer = setTimeout(() => {
            room.gameData._roundTimer = null;
            if (room.gameData?.phase === 'responding') {
                console.log(`[NEVER-EVER] Server failsafe: auto-advancing for room ${roomCode}`);
                calculateNeverEverPartyResults(room, io);
            }
        }, (room.gameData.timePerRound + 5) * 1000);
    });
    
    socket.on('neverever-party-respond', ({roomCode, response}) => {
        const room = rooms.get(roomCode), player = players.get(socket.id);
        if (!room?.gameData || !player || room.gameData.phase !== 'responding' || room.gameData.responses[socket.id] !== undefined) return;
        
        room.gameData.responses[socket.id] = { response, playerName: player.playerName };
        socket.emit('neverever-party-response-received', { response });
        
        const respondedCount = Object.keys(room.gameData.responses).length;
        io.to(roomCode).emit('neverever-party-response-counted', {
            respondedCount,
            totalPlayers: room.players.length
        });

        const connectedCount = room.players.filter(p => players.has(p.id)).length;
        if (respondedCount >= connectedCount) {
            if (room.gameData._roundTimer) { clearTimeout(room.gameData._roundTimer); room.gameData._roundTimer = null; }
            calculateNeverEverPartyResults(room, io);
        }
    });
    
    socket.on('neverever-party-time-up', ({roomCode}) => {
        const room = rooms.get(roomCode);
        if (room?.gameData?.phase === 'responding') {
            if (room.gameData._roundTimer) { clearTimeout(room.gameData._roundTimer); room.gameData._roundTimer = null; }
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

        // Clear any previous failsafe timer
        if (room.gameData._guessTimer) {
            clearTimeout(room.gameData._guessTimer);
            room.gameData._guessTimer = null;
        }

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

        // Server-side failsafe: auto-advance if host never sends guess-time-up
        room.gameData._guessTimer = setTimeout(() => {
            room.gameData._guessTimer = null;
            if (room.gameData?.phase === 'guessing') {
                console.log(`[BET-OR-BLUFF] Server failsafe: auto-advancing guess phase for room ${roomCode}`);
                room.players.forEach(p => {
                    if (!room.gameData.guesses[p.id]) {
                        room.gameData.guesses[p.id] = { guess: 0, playerName: p.name, playerId: p.id };
                    }
                });
                startBettingPhase(room, io, roomCode);
            }
        }, (room.gameData.timePerGuess + 5) * 1000);
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
        
        const totalPlayerCount = room.players.length;
        const guessedCount = Object.keys(room.gameData.guesses).length;
        io.to(roomCode).emit('betorbluff-guess-counted', {
            guessedCount,
            totalPlayers: totalPlayerCount
        });

        const connectedGuessCount = room.players.filter(p => players.has(p.id)).length;
        if (guessedCount >= connectedGuessCount) {
            if (room.gameData._guessTimer) {
                clearTimeout(room.gameData._guessTimer);
                room.gameData._guessTimer = null;
            }
            startBettingPhase(room, io, roomCode);
        }
    });
    
    socket.on('betorbluff-guess-time-up', ({roomCode}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData || room.gameData.phase !== 'guessing') return;

        if (room.gameData._guessTimer) {
            clearTimeout(room.gameData._guessTimer);
            room.gameData._guessTimer = null;
        }

        room.players.forEach(p => {
            if (!room.gameData.guesses[p.id]) {
                room.gameData.guesses[p.id] = { guess: 0, playerName: p.name, playerId: p.id };
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
        
        const totalPlayerCount = room.players.length;
        const betCount = Object.keys(room.gameData.bets).length;
        io.to(roomCode).emit('betorbluff-bet-counted', {
            betCount,
            totalPlayers: totalPlayerCount
        });

        const connectedBetCount = room.players.filter(p => players.has(p.id)).length;
        if (betCount >= connectedBetCount) {
            if (room.gameData._betTimer) {
                clearTimeout(room.gameData._betTimer);
                room.gameData._betTimer = null;
            }
            calculateBetOrBluffResults(room, io);
        }
    });
    
    socket.on('betorbluff-bet-time-up', ({roomCode}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData || room.gameData.phase !== 'betting') return;

        if (room.gameData._betTimer) {
            clearTimeout(room.gameData._betTimer);
            room.gameData._betTimer = null;
        }

        room.players.forEach(p => {
            if (!room.gameData.bets[p.id]) {
                room.gameData.bets[p.id] = { targetPlayerId: null, betAmount: 0, playerName: p.name };
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
            const finalLeaderboard = Object.entries(room.gameData.chips)
                .map(([name, chips]) => ({ name, chips }))
                .sort((a, b) => b.chips - a.chips);
            io.to(roomCode).emit('betorbluff-game-over', {
                finalLeaderboard,
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
    
    socket.on('sketch-word-chosen', ({roomCode, word}) => {
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
    
    // ==================== FOOLS GOLD HANDLERS ====================
    socket.on('fools-start-game', ({roomCode, category}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData) return;
        
        console.log('[FOOLS GOLD] Starting game for room:', roomCode, 'category:', category);
        
        // Initialize with category if provided
        if (category && category !== room.gameData.category) {
            const questions = getFoolsGoldQuestions(category);
            room.gameData.questions = questions.sort(() => Math.random() - 0.5);
            room.gameData.category = category;
        }
        
        startFoolsGoldRound(room, io);
    });
    
    socket.on('fools-submit-answer', ({roomCode, playerName, answer}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData || room.gameData.phase !== 'submit') return;
        
        const gd = room.gameData;
        
        // Don't allow duplicate submissions
        if (gd.submissions.find(s => s.playerName === playerName)) return;
        
        gd.submissions.push({
            id: 'lie-' + playerName,
            playerName,
            text: answer.trim().substring(0, 50),
            isTruth: false
        });
        
        console.log('[FOOLS GOLD] Answer submitted by', playerName);
        
        // Notify all players
        const submitted = gd.submissions.map(s => s.playerName);
        io.to(roomCode).emit('fools-player-submitted', { submitted });
        
        // Check if everyone submitted
        if (gd.submissions.length >= room.players.length) {
            clearTimeout(gd.submitTimeout);
            startFoolsGoldVoting(room, io);
        }
    });
    
    socket.on('fools-submit-vote', ({roomCode, playerName, answerId}) => {
        const room = rooms.get(roomCode);
        if (!room?.gameData || room.gameData.phase !== 'voting') return;
        
        const gd = room.gameData;
        
        // Don't allow duplicate votes
        if (gd.votes[playerName]) return;
        
        // Can't vote for own answer
        const answer = gd.allAnswers.find(a => a.id === answerId);
        if (answer && answer.playerName === playerName) return;
        
        gd.votes[playerName] = answerId;
        
        console.log('[FOOLS GOLD] Vote cast by', playerName, 'for', answerId);
        
        // Check if everyone voted
        const voteCount = Object.keys(gd.votes).length;
        const expectedVotes = room.players.length;
        
        if (voteCount >= expectedVotes) {
            clearTimeout(gd.voteTimeout);
            showFoolsGoldResults(room, io);
        }
    });
}

// ==================== FOOLS GOLD QUESTION BANKS ====================
const foolsGoldQuestions = {
    brainrot: [
        { q: "The 'Skibidi Toilet' meme originated from a video made in _____.", a: "Source Filmmaker" },
        { q: "The phrase 'It's giving _____' became popular on TikTok in 2022.", a: "what it's supposed to give" },
        { q: "The 'Grimace Shake' trend started because of a McDonald's promotion for Grimace's _____.", a: "birthday" },
        { q: "The 'NPC streaming' trend involves streamers acting like _____ in video games.", a: "non-player characters" },
        { q: "'Rizz' was added to the Oxford Dictionary and means _____.", a: "romantic charm or appeal" },
        { q: "The 'Mewing' trend claims to reshape your face by positioning your _____.", a: "tongue on the roof of your mouth" },
        { q: "'Ohio' became a meme because people joke that _____ happens there.", a: "only weird things" },
        { q: "The song 'A Bar Song (Tipsy)' by Shaboozey has been stuck on the charts for _____ weeks.", a: "over 20" },
        { q: "'Fanum Tax' refers to when streamer Fanum would _____ from other streamers.", a: "steal food" },
        { q: "The 'Hawk Tuah' girl became famous from a _____ video.", a: "street interview" },
    ],
    memes: [
        { q: "The 'Distracted Boyfriend' meme stock photo was taken in _____.", a: "Spain" },
        { q: "The Doge meme features a _____ breed of dog named Kabosu.", a: "Shiba Inu" },
        { q: "Grumpy Cat's real name was _____.", a: "Tardar Sauce" },
        { q: "The 'This is Fine' dog meme was created by artist _____.", a: "KC Green" },
        { q: "Rick Rolling uses the song 'Never Gonna Give You Up' by _____.", a: "Rick Astley" },
        { q: "The 'Woman Yelling at Cat' meme combines Real Housewives with a cat named _____.", a: "Smudge" },
        { q: "The 'Surprised Pikachu' meme came from episode _____ of the Pokemon anime.", a: "1" },
        { q: "The 'Is This a Pigeon?' meme is from the anime _____.", a: "The Brave Fighter of Sun Fighbird" },
        { q: "Bernie Sanders' mittens at the inauguration were made from _____.", a: "recycled sweaters" },
        { q: "The 'Coffin Dance' meme originated from _____.", a: "Ghana" },
    ],
    history: [
        { q: "Cleopatra lived closer in time to the Moon landing than to the building of the _____.", a: "Great Pyramid of Giza" },
        { q: "In 1932, Australia lost a war against _____.", a: "emus" },
        { q: "Napoleon was once attacked by a horde of _____.", a: "rabbits" },
        { q: "Ancient Romans used crushed _____ as toothpaste.", a: "mouse brains" },
        { q: "In medieval times, animals could be put on trial and the accused included _____.", a: "pigs" },
        { q: "The shortest war in history lasted _____ minutes.", a: "38" },
        { q: "Ketchup was sold as _____ in the 1830s.", a: "medicine" },
        { q: "The Great Fire of London destroyed 13,200 houses but only _____ people officially died.", a: "6" },
        { q: "Vikings used the skulls of their enemies as _____.", a: "drinking cups" },
        { q: "Ancient Egyptians used _____ as a form of currency before coins.", a: "bread and beer" },
    ],
    games: [
        { q: "Mario's original name was _____.", a: "Jumpman" },
        { q: "The iconic Minecraft 'oof' death sound was licensed from _____.", a: "Roblox" },
        { q: "Pac-Man was originally going to be called _____.", a: "Puck-Man" },
        { q: "The first video game Easter egg was hidden in _____.", a: "Adventure for Atari" },
        { q: "Sonic the Hedgehog's original design included him being in a band with a _____ girlfriend.", a: "human" },
        { q: "The 'Konami Code' first appeared in _____.", a: "Gradius" },
        { q: "Lara Croft's original design had her as a _____.", a: "man" },
        { q: "The longest game of Civilization ever played lasted _____.", a: "10 years" },
        { q: "GTA San Andreas has a hidden _____ mini-game that caused an AO rating.", a: "Hot Coffee" },
        { q: "The default Minecraft skin Steve has _____ pixels of height.", a: "32" },
    ],
    popculture: [
        { q: "Taylor Swift's 'Eras Tour' became the first tour to gross over _____ billion dollars.", a: "1" },
        { q: "The 'Barbenheimer' phenomenon combined Barbie with _____ releasing the same day.", a: "Oppenheimer" },
        { q: "BTS announced their hiatus in 2022 so members could complete mandatory _____.", a: "military service" },
        { q: "The most-liked Instagram post of all time is a picture of _____.", a: "an egg" },
        { q: "Mr. Beast's real name is _____.", a: "Jimmy Donaldson" },
        { q: "The 'Saltburn' bathtub scene features Jacob Elordi drinking _____.", a: "bathwater" },
        { q: "Beyoncé's 'Renaissance' album was inspired by her late _____.", a: "Uncle Johnny" },
        { q: "The 'Tortured Poets Department' has _____ tracks in its longest version.", a: "31" },
        { q: "Drake's real first name is _____.", a: "Aubrey" },
        { q: "The Kardashians originally became famous through a reality show on _____.", a: "E!" },
    ],
    science: [
        { q: "Honey never spoils and has been found edible in _____ year old Egyptian tombs.", a: "3000" },
        { q: "A day on Venus is longer than a _____ on Venus.", a: "year" },
        { q: "Octopuses have _____ hearts.", a: "three" },
        { q: "Bananas are naturally slightly _____.", a: "radioactive" },
        { q: "The human body contains enough carbon to make _____ pencils.", a: "9,000" },
        { q: "Hot water freezes faster than cold water, a phenomenon called the _____ effect.", a: "Mpemba" },
        { q: "There are more trees on Earth than stars in the _____.", a: "Milky Way galaxy" },
        { q: "A group of flamingos is called a _____.", a: "flamboyance" },
        { q: "The inventor of the Pringles can is buried in _____.", a: "a Pringles can" },
        { q: "Wombat poop is shaped like _____.", a: "cubes" },
    ]
};

function getFoolsGoldQuestions(category) {
    if (category === 'mixed' || !foolsGoldQuestions[category]) {
        // Mix all categories
        let all = [];
        Object.values(foolsGoldQuestions).forEach(qs => {
            all = [...all, ...qs];
        });
        return all;
    }
    return [...foolsGoldQuestions[category]];
}

function initFoolsGoldGame(room, category = 'mixed') {
    const questions = getFoolsGoldQuestions(category);
    
    room.gameData = {
        questions: questions.sort(() => Math.random() - 0.5),
        questionIndex: 0,
        currentQuestion: null,
        phase: 'countdown',
        submissions: [],
        allAnswers: [],
        votes: {},
        scores: {},
        currentRound: 0,
        totalRounds: Math.min(8, questions.length),
        submitTime: 30,
        voteTime: 20,
        category: category,
        submitTimeout: null,
        voteTimeout: null,
        resultsTimeout: null
    };
    
    room.players.forEach(p => { room.gameData.scores[p.name] = 0; });
}

function startFoolsGoldRound(room, io) {
    const gd = room.gameData;
    
    // Clear any existing timeouts
    if (gd.submitTimeout) clearTimeout(gd.submitTimeout);
    if (gd.voteTimeout) clearTimeout(gd.voteTimeout);
    if (gd.resultsTimeout) clearTimeout(gd.resultsTimeout);
    
    gd.currentRound++;
    
    if (gd.currentRound > gd.totalRounds || gd.questionIndex >= gd.questions.length) {
        endFoolsGoldGame(room, io);
        return;
    }
    
    // Get next question
    gd.currentQuestion = gd.questions[gd.questionIndex];
    gd.questionIndex++;
    gd.submissions = [];
    gd.allAnswers = [];
    gd.votes = {};
    gd.phase = 'submit';
    
    // Create question text with blank
    const questionText = gd.currentQuestion.q;
    
    io.to(room.code).emit('fools-question', {
        round: gd.currentRound,
        totalRounds: gd.totalRounds,
        question: questionText,
        category: gd.category,
        submitTime: gd.submitTime
    });
    
    console.log('[FOOLS GOLD] Round', gd.currentRound, '- Question:', questionText);
    
    // Auto-advance after submit time
    gd.submitTimeout = setTimeout(() => {
        if (gd.phase === 'submit') {
            startFoolsGoldVoting(room, io);
        }
    }, gd.submitTime * 1000);
}

function startFoolsGoldVoting(room, io) {
    const gd = room.gameData;
    gd.phase = 'voting';
    
    // Add the truth
    gd.allAnswers = [
        {
            id: 'truth',
            playerName: null,
            text: gd.currentQuestion.a,
            isTruth: true
        },
        ...gd.submissions
    ];
    
    // Shuffle for presentation
    const shuffled = gd.allAnswers.sort(() => Math.random() - 0.5);
    
    io.to(room.code).emit('fools-voting', {
        question: gd.currentQuestion.q,
        answers: shuffled.map(a => ({ id: a.id, text: a.text, playerName: a.isTruth ? null : a.playerName })),
        voteTime: gd.voteTime
    });
    
    console.log('[FOOLS GOLD] Voting started with', gd.allAnswers.length, 'answers');
    
    // Auto-advance after vote time
    gd.voteTimeout = setTimeout(() => {
        if (gd.phase === 'voting') {
            showFoolsGoldResults(room, io);
        }
    }, gd.voteTime * 1000);
}

function showFoolsGoldResults(room, io) {
    const gd = room.gameData;
    gd.phase = 'results';
    
    // Calculate points
    const results = gd.allAnswers.map(answer => {
        const voters = Object.entries(gd.votes)
            .filter(([_, votedFor]) => votedFor === answer.id)
            .map(([voter, _]) => voter);
        
        let fooledCount = 0;
        
        if (answer.isTruth) {
            // Players who voted for truth get 200 points
            voters.forEach(voter => {
                gd.scores[voter] = (gd.scores[voter] || 0) + 200;
            });
        } else {
            // Players who fooled others get 100 points per fool
            fooledCount = voters.length;
            if (fooledCount > 0 && answer.playerName) {
                gd.scores[answer.playerName] = (gd.scores[answer.playerName] || 0) + (fooledCount * 100);
            }
        }
        
        return {
            id: answer.id,
            text: answer.text,
            author: answer.playerName,
            isTruth: answer.isTruth,
            voters: voters,
            fooledCount: fooledCount
        };
    });
    
    // Sort: truth first, then by fooled count
    results.sort((a, b) => {
        if (a.isTruth) return -1;
        if (b.isTruth) return 1;
        return b.fooledCount - a.fooledCount;
    });
    
    io.to(room.code).emit('fools-results', {
        question: gd.currentQuestion.q,
        results: results,
        scores: gd.scores
    });
    
    console.log('[FOOLS GOLD] Results shown, scores:', gd.scores);
    
    // Next round after delay
    gd.resultsTimeout = setTimeout(() => {
        startFoolsGoldRound(room, io);
    }, 6000);
}

function endFoolsGoldGame(room, io) {
    const gd = room.gameData;
    
    // Clear timeouts
    if (gd.submitTimeout) clearTimeout(gd.submitTimeout);
    if (gd.voteTimeout) clearTimeout(gd.voteTimeout);
    if (gd.resultsTimeout) clearTimeout(gd.resultsTimeout);
    
    gd.phase = 'gameover';
    
    // Build final leaderboard
    const leaderboard = Object.entries(gd.scores)
        .map(([name, score]) => ({
            name,
            score,
            isPremium: room.players.find(p => p.name === name)?.isPremium || false
        }))
        .sort((a, b) => b.score - a.score);
    
    io.to(room.code).emit('fools-game-over', {
        finalLeaderboard: leaderboard
    });
    
    console.log('[FOOLS GOLD] Game over! Winner:', leaderboard[0]?.name);
}

module.exports = {
    initTriviaRoyaleGame,
    initThisOrThatPartyGame,
    initHotTakesPartyGame,
    initNeverEverPartyGame,
    initBetOrBluffGame,
    initSketchGuessGame,
    initFoolsGoldGame,
    setupPartyGameHandlers
};
