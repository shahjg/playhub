/* ========================================
   THEGAMING.CO - SHARED HEADER SYSTEM
   ======================================== */

(function() {
    'use strict';

    const GAME_INDEX = [
      // SQUAD
      {n:'Spy Hunt',u:'/lobby.html?game=spyfall',c:'Squad',e:'🕵️',a:['spyfall','spy fall','spy','find the spy']},
      {n:'Mafia',u:'/lobby.html?game=werewolf',c:'Squad',e:'🐺',a:['werewolf','mafia','village']},
      {n:'Secret Roles',u:'/lobby.html?game=secret-roles',c:'Squad',e:'👑',a:['avalon','resistance','merlin']},
      {n:'Imposter',u:'/lobby.html?game=imposter',c:'Squad',e:'👾',a:['imposter','impostor','undercover']},
      {n:'Fake Artist',u:'/lobby.html?game=fake-artist',c:'Squad',e:'🎨',a:['fake artist','drawing','new york']},
      {n:'Insider',u:'/lobby.html?game=insider',c:'Squad',e:'🔍',a:['insider','20 questions','twenty questions']},
      {n:'Power Struggle',u:'/lobby.html?game=power-struggle',c:'Squad',e:'👔',a:['coup','bluff','power']},
      {n:'Codewords',u:'/lobby.html?game=codenames',c:'Squad',e:'🔤',a:['codenames','code names','spymaster','grid']},
      {n:'Spectrum',u:'/lobby.html?game=wavelength',c:'Squad',e:'🎚️',a:['wavelength','spectrum','dial']},
      {n:'Think Alike',u:'/lobby.html?game=herd-mentality',c:'Squad',e:'🧠',a:['herd mentality','herd','match majority']},
      {n:'Categories',u:'/lobby.html?game=categories',c:'Squad',e:'📝',a:['categories','scattergories']},
      {n:'Word Chain',u:'/lobby.html?game=word-association',c:'Squad',e:'🔗',a:['word association','word chain']},
      {n:'Word Bomb',u:'/lobby.html?game=word-bomb',c:'Squad',e:'💣',a:['word bomb','bomb party','bomb']},
      {n:'Name Place Animal Thing',u:'/lobby.html?game=npat',c:'Squad',e:'✏️',a:['npat','name place animal thing','stop']},
      {n:'Punchline',u:'/lobby.html?game=punchline',c:'Squad',e:'😂',a:['punchline','cards against','apples','quiplash']},
      {n:'Fools Gold',u:'/lobby.html?game=fools-gold',c:'Squad',e:'🪙',a:['fools gold','fibbage','bluff trivia']},
      {n:'Broken Pictionary',u:'/lobby.html?game=broken-pictionary',c:'Squad',e:'🖍️',a:['broken pictionary','telephone','gartic']},
      {n:'Doodle Duel',u:'/lobby.html?game=doodle-duel',c:'Squad',e:'✍️',a:['doodle duel','draw','sketch']},
      {n:'Two Truths One Lie',u:'/lobby.html?game=two-truths',c:'Squad',e:'🤥',a:['two truths','one lie','2 truths']},
      {n:'Sketch & Guess',u:'/lobby.html?game=sketch-guess',c:'Squad',e:'🖌️',a:['sketch','pictionary','skribbl','draw guess']},
      {n:'Charades',u:'/lobby.html?game=charades',c:'Squad',e:'🎭',a:['charades','act it out','heads up']},
      {n:'Celebrity',u:'/lobby.html?game=celebrity',c:'Squad',e:'⭐',a:['celebrity','salad bowl']},
      {n:'Fishbowl',u:'/lobby.html?game=fishbowl',c:'Squad',e:'🐠',a:['fishbowl','salad bowl']},
      {n:'Most Likely To',u:'/lobby.html?game=most-likely-to',c:'Squad',e:'👉',a:['most likely to','who would']},
      {n:'Ludo',u:'/lobby.html?game=ludo',c:'Squad',e:'🎲',a:['ludo','parcheesi','sorry','board']},
      // PARTY
      {n:'Trivia Royale',u:'/lobby.html?game=trivia-royale',c:'Party',e:'❓',a:['trivia','quiz','kahoot']},
      {n:'This or That',u:'/lobby.html?game=this-or-that-party',c:'Party',e:'⚖️',a:['this or that','would you rather','pick']},
      {n:'Hot Takes',u:'/lobby.html?game=hot-takes-party',c:'Party',e:'🔥',a:['hot takes','opinions','controversial']},
      {n:'Never Have I Ever',u:'/lobby.html?game=never-ever-party',c:'Party',e:'🙅',a:['never have i ever','never ever','nhie']},
      {n:'Bet or Bluff',u:'/lobby.html?game=bet-or-bluff',c:'Party',e:'🎰',a:['bet or bluff','wager','gamble trivia']},
      // DUOS
      {n:'Truth or Dare',u:'/games/duos/game-truth-or-dare.html',c:'Duos',e:'🎯',a:['truth or dare','tod']},
      {n:'21 Questions',u:'/games/duos/game-21-questions.html',c:'Duos',e:'💬',a:['21 questions','twenty one questions']},
      {n:'Would You Rather',u:'/games/duos/game-would-you-rather.html',c:'Duos',e:'🤔',a:['would you rather','wyr']},
      {n:'Never Have I Ever',u:'/games/duos/game-never-have-i-ever.html',c:'Duos',e:'🙈',a:['never have i ever','nhie']},
      {n:'KMK',u:'/games/duos/game-kmk.html',c:'Duos',e:'💋',a:['kmk','kiss marry kill','marry']},
      {n:'Taboo',u:'/games/duos/game-taboo.html',c:'Duos',e:'🚫',a:['taboo','forbidden words']},
      {n:'Draw & Guess',u:'/games/duos/game-draw-guess.html',c:'Duos',e:'🎨',a:['draw guess','pictionary','skribbl']},
      {n:'Hangman',u:'/games/duos/game-hangman.html',c:'Duos',e:'🪢',a:['hangman','guess word']},
      {n:'Word Chain',u:'/games/duos/game-word-chain.html',c:'Duos',e:'🔗',a:['word chain','word association']},
      {n:'This or That',u:'/games/duos/game-this-or-that.html',c:'Duos',e:'⚖️',a:['this or that']},
      {n:'Tic Tac Toe',u:'/games/duos/game-tic-tac-toe.html',c:'Duos',e:'⭕',a:['tic tac toe','noughts crosses','xo']},
      {n:'Connect Four',u:'/games/duos/game-connect-four.html',c:'Duos',e:'🔴',a:['connect four','connect 4']},
      {n:'Rock Paper Scissors',u:'/games/duos/game-rock-paper-scissors.html',c:'Duos',e:'✊',a:['rock paper scissors','rps']},
      {n:'Battleship',u:'/games/duos/game-battleship.html',c:'Duos',e:'🚢',a:['battleship','sink ships']},
      {n:'Reaction Race',u:'/games/duos/game-reaction-race.html',c:'Duos',e:'⚡',a:['reaction race','reflex']},
      {n:'Memory Match',u:'/games/duos/game-memory-match.html',c:'Duos',e:'🃏',a:['memory match','concentration','pairs']},
      {n:'Story Builder',u:'/games/duos/game-story-builder.html',c:'Duos',e:'📖',a:['story builder','collaborative story']},
      {n:'Finish My Sentence',u:'/games/duos/game-finish-my-sentence.html',c:'Duos',e:'✍️',a:['finish my sentence','complete']},
      {n:'Wordle Duel',u:'/games/duos/game-wordle-duel.html',c:'Duos',e:'🟩',a:['wordle','wordle duel']},
      {n:'TypeRacer',u:'/games/duos/game-typeracer.html',c:'Duos',e:'⌨️',a:['typeracer','typing race','speed type']},
      {n:'Scramble',u:'/games/duos/game-scramble.html',c:'Duos',e:'🔤',a:['scramble','anagram','unscramble']},
      {n:'Quiz Duel',u:'/games/duos/game-quiz-duel.html',c:'Duos',e:'🧠',a:['quiz duel','trivia battle']},
      {n:'Roast Me',u:'/games/duos/game-roast-me.html',c:'Duos',e:'🔥',a:['roast me','roast','burn']},
      {n:'Rhyme Battle',u:'/games/duos/game-rhyme-battle.html',c:'Duos',e:'🎤',a:['rhyme battle','rap','bars']},
      {n:'Movie Pitch',u:'/games/duos/game-movie-pitch.html',c:'Duos',e:'🎬',a:['movie pitch','film idea']},
      {n:'Hot Take',u:'/games/duos/game-hot-take.html',c:'Duos',e:'🔥',a:['hot take','opinion']},
      {n:'Dots & Boxes',u:'/games/duos/game-dots-boxes.html',c:'Duos',e:'📦',a:['dots and boxes','dots boxes']},
      // SOLO
      {n:'Connections',u:'/connections.html',c:'Solo',e:'🔲',a:['connections','grouping']},
      {n:'Gamedle',u:'/gamedle.html',c:'Solo',e:'🎮',a:['gamedle','guess game']},
      {n:'Athletedle',u:'/athletedle.html',c:'Solo',e:'🏅',a:['athletedle','guess athlete']},
      {n:'Jobdle',u:'/jobdle.html',c:'Solo',e:'💼',a:['jobdle','guess job']},
      {n:'Weebdle',u:'/weebdle.html',c:'Solo',e:'🌸',a:['weebdle','anime','guess anime']},
      {n:'Aim Trainer',u:'/games/solo/aim-trainer.html',c:'Solo',e:'🎯',a:['aim trainer','aim','flick']},
      {n:'Typing Speed Test',u:'/games/solo/typing-test.html',c:'Solo',e:'⌨️',a:['typing test','wpm','typing speed']},
      {n:'Reaction Time',u:'/games/solo/reaction-time.html',c:'Solo',e:'⚡',a:['reaction time','reflex']},
      {n:'Chimp Test',u:'/games/solo/chimp-test.html',c:'Solo',e:'🐒',a:['chimp test','memory']},
      {n:'Number Memory',u:'/games/solo/number-memory.html',c:'Solo',e:'🔢',a:['number memory']},
      {n:'Sequence Memory',u:'/games/solo/sequence-memory.html',c:'Solo',e:'🎵',a:['sequence memory','simon']},
      {n:'Visual Memory',u:'/games/solo/visual-memory.html',c:'Solo',e:'👁️',a:['visual memory']},
      {n:'Verbal Memory',u:'/games/solo/verbal-memory.html',c:'Solo',e:'💭',a:['verbal memory']},
      {n:'Math Speed',u:'/games/solo/math-speed.html',c:'Solo',e:'➕',a:['math speed','mental math','arithmetic']},
      {n:'Sudoku',u:'/games/solo/sudoku.html',c:'Solo',e:'🔢',a:['sudoku']},
      {n:'2048',u:'/games/solo/2048.html',c:'Solo',e:'🟦',a:['2048','tile merge']},
      {n:'Minesweeper',u:'/games/solo/minesweeper.html',c:'Solo',e:'💥',a:['minesweeper','mines']},
      {n:'Nonogram',u:'/games/solo/nonogram.html',c:'Solo',e:'🖼️',a:['nonogram','picross']},
      {n:'Crossword',u:'/games/solo/crossword.html',c:'Solo',e:'📋',a:['crossword']},
      {n:'Word Search',u:'/games/solo/wordsearch.html',c:'Solo',e:'🔍',a:['word search','wordsearch']},
      {n:'Block Stack',u:'/games/solo/block-stack.html',c:'Solo',e:'🏗️',a:['block stack','tetris','blocks']}
    ];

    const SUPABASE_URL = 'https://tvvivtmzofsyehatzlvl.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dml2dG16b2ZzeWVoYXR6bHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4OTExODYsImV4cCI6MjA4MDQ2NzE4Nn0.Qy8kHMO0Nb4yJ0ZHjby7RuQtzwWB8rUcZvkdnbL1b3M';
    
    const CACHE_LABEL = 'tgco_header_label';
    const CACHE_FULL = 'tgco_header_full';

    // ========================================
    // LOAD DEPENDENCIES
    // ========================================
    
    function loadSocialSystem() {
        // Load social.css if not already loaded
        if (!document.querySelector('link[href="/social.css"]')) {
            const socialCSS = document.createElement('link');
            socialCSS.rel = 'stylesheet';
            socialCSS.href = '/social.css';
            document.head.appendChild(socialCSS);
        }
        
        // Load social.js if not already loaded  
        if (!document.querySelector('script[src="/social.js"]')) {
            const socialJS = document.createElement('script');
            socialJS.src = '/social.js';
            socialJS.defer = true;
            document.body.appendChild(socialJS);
        }
    }

    // ========================================
    // AUTO-DETECT PAGE TYPE FOR BACK BUTTON
    // ========================================
    
    function getPageInfo() {
        const path = window.location.pathname;
        const container = document.getElementById('site-header');
        
        if (container) {
            if (container.hasAttribute('data-no-back')) {
                return { showBack: false };
            }
            const customUrl = container.getAttribute('data-back-url');
            const customText = container.getAttribute('data-back-text');
            if (customUrl) {
                return { showBack: true, backUrl: customUrl, backText: customText || 'Back' };
            }
        }
        
        if (path.includes('/games/solo/')) {
            return { showBack: true, backUrl: '/solo', backText: 'Solo' };
        }
        if (path.includes('/games/duos/')) {
            return { showBack: true, backUrl: '/duos', backText: 'Duos' };
        }
        if (path.includes('/games/squad/')) {
            return { showBack: true, backUrl: '/squad-games', backText: 'Squad' };
        }
        if (path.includes('/games/party/')) {
            return { showBack: true, backUrl: '/party-games', backText: 'Party' };
        }
        
        return { showBack: false };
    }

    // ========================================
    // GENERATE HEADER HTML
    // ========================================
    
    function generateHeaderHTML(pageInfo) {
        const backButtonHTML = pageInfo.showBack ? `
            <a href="${pageInfo.backUrl}" class="back-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>${pageInfo.backText}</span>
            </a>
        ` : '';

        return `
            <header>
                <nav class="nav-inner">
                    <div class="nav-left">
                        ${backButtonHTML}
                    </div>
                    
                    <a href="/" class="header-logo">THEGAMING.CO</a>
                    
                    <div class="nav-right-wrapper">
                        <div class="header-actions">
                            <div class="hdr-search">
                                <button type="button" class="hdr-search-trigger" id="hdr-search-trigger" aria-label="Search games">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                    <span class="hdr-search-trigger-text">Search games…</span>
                                </button>
                            </div>
                            <div class="user-pill-skeleton" id="auth-skeleton"></div>
                            
                            <div class="nav-right-logged-out">
                                <a href="/login" class="auth-link">Sign In</a>
                            </div>
                            
                            <div class="nav-right-logged-in">
                                <!-- User Menu -->
                                <div class="user-menu-wrapper">
                                    <button class="user-pill" type="button" id="user-menu-button" aria-haspopup="true" aria-expanded="false">
                                        <span class="user-pill-label" id="header-username-label">P</span>
                                    </button>
                                    
                                    <div class="user-menu" id="user-menu" role="menu">
                                        <a href="/profile" class="user-menu-item" role="menuitem">Profile</a>
                                        <a href="/leaderboards" class="user-menu-item" role="menuitem">Leaderboards</a>
                                        <button type="button" class="user-menu-item" id="user-menu-signout" role="menuitem">Sign Out</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
                <div class="hdr-search-panel" id="hdr-search-panel" role="dialog" aria-label="Game search">
                    <div class="hdr-search-box">
                        <svg class="hdr-search-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" id="hdr-search-input" class="hdr-search-input" placeholder="Search games… try 'spyfall' or 'trivia'" autocomplete="off" spellcheck="false" aria-label="Search games">
                        <button type="button" class="hdr-search-close" id="hdr-search-close" aria-label="Close">✕</button>
                    </div>
                    <div class="hdr-search-results" id="hdr-search-results"></div>
                </div>
            </header>
        `;
    }

    // ========================================
    // INJECT HEADER
    // ========================================
    
    function injectHeader() {
        const container = document.getElementById('site-header');
        if (!container) {
            console.warn('Header: #site-header container not found');
            return false;
        }
        
        const pageInfo = getPageInfo();
        container.innerHTML = generateHeaderHTML(pageInfo);
        return true;
    }

    // ========================================
    // AUTH UI MANAGEMENT
    // ========================================
    
    let elements = {};
    
    function cacheElements() {
        elements = {
            skeleton: document.getElementById('auth-skeleton'),
            loggedOut: document.querySelector('.nav-right-logged-out'),
            loggedIn: document.querySelector('.nav-right-logged-in'),
            usernameLabel: document.getElementById('header-username-label'),
            menuButton: document.getElementById('user-menu-button'),
            menu: document.getElementById('user-menu'),
            signoutBtn: document.getElementById('user-menu-signout')
        };
    }
    
    function updateAuthUI(isLoggedIn) {
        if (elements.skeleton) elements.skeleton.style.display = 'none';
        
        if (isLoggedIn) {
            if (elements.loggedOut) elements.loggedOut.style.setProperty('display', 'none', 'important');
            if (elements.loggedIn) elements.loggedIn.style.setProperty('display', 'flex', 'important');
        } else {
            if (elements.loggedOut) elements.loggedOut.style.setProperty('display', 'flex', 'important');
            if (elements.loggedIn) elements.loggedIn.style.setProperty('display', 'none', 'important');
            try {
                localStorage.removeItem(CACHE_LABEL);
                localStorage.removeItem(CACHE_FULL);
            } catch (e) {}
        }
    }
    
    function setHeaderName(name) {
        if (!name || !name.trim()) {
            if (elements.usernameLabel) {
                elements.usernameLabel.textContent = 'P';
                elements.usernameLabel.title = 'Player';
            }
            return;
        }
        
        const trimmed = name.trim();
        const initial = trimmed.charAt(0).toUpperCase();
        
        if (elements.usernameLabel) {
            elements.usernameLabel.textContent = initial;
            elements.usernameLabel.title = trimmed;
        }
        
        try {
            localStorage.setItem(CACHE_LABEL, initial);
            localStorage.setItem(CACHE_FULL, trimmed);
        } catch (e) {}
    }

    // ========================================
    // PRIME FROM CACHE (Instant UI)
    // ========================================
    
    function primeFromCache() {
        try {
            const cachedLabel = localStorage.getItem(CACHE_LABEL);
            const cachedFull = localStorage.getItem(CACHE_FULL);
            
            if (cachedLabel && cachedFull) {
                if (elements.usernameLabel) {
                    elements.usernameLabel.textContent = cachedLabel;
                    elements.usernameLabel.title = cachedFull;
                }
                if (elements.skeleton) elements.skeleton.style.display = 'none';
                if (elements.loggedIn) elements.loggedIn.style.setProperty('display', 'flex', 'important');
                return true;
            }
        } catch (e) {}
        
        // Not cached - show skeleton until auth loads
        if (elements.skeleton) elements.skeleton.style.display = 'block';
        return false;
    }

    // ========================================
    // DROPDOWN MENU
    // ========================================
    
    let menuOpen = false;
    
    function setupMenu() {
        if (!elements.menuButton || !elements.menu) return;
        
        function setMenuOpen(open) {
            menuOpen = open;
            if (open) {
                elements.menu.classList.add('open');
                elements.menuButton.setAttribute('aria-expanded', 'true');
            } else {
                elements.menu.classList.remove('open');
                elements.menuButton.setAttribute('aria-expanded', 'false');
            }
        }
        
        elements.menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
        });
        
        document.addEventListener('click', () => {
            if (menuOpen) setMenuOpen(false);
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
        });
    }

    function setupSearch() {
        const trigger = document.getElementById('hdr-search-trigger');
        const panel = document.getElementById('hdr-search-panel');
        const input = document.getElementById('hdr-search-input');
        const closeBtn = document.getElementById('hdr-search-close');
        const results = document.getElementById('hdr-search-results');
        if (!trigger || !panel || !input || !results) return;

        let activeIdx = -1, current = [];

        function openPanel() {
            panel.classList.add('open');
            document.body.classList.add('hdr-search-active');
            setTimeout(() => input.focus(), 50);
            render('');
        }
        function closePanel() {
            panel.classList.remove('open');
            document.body.classList.remove('hdr-search-active');
            input.value = ''; activeIdx = -1;
        }
        function score(g, q) {
            const name = g.n.toLowerCase();
            if (name === q) return 100;
            if (name.startsWith(q)) return 80;
            for (const al of g.a) { if (al === q) return 75; if (al.startsWith(q)) return 60; }
            if (name.includes(q)) return 40;
            for (const al of g.a) { if (al.includes(q)) return 30; }
            if (g.c.toLowerCase().includes(q)) return 10;
            return 0;
        }
        function render(q) {
            q = q.trim().toLowerCase();
            if (!q) {
                results.innerHTML = '<div class="hdr-search-hint">Start typing to find a game across Solo, Duos, Squad & Party.</div>';
                current = []; activeIdx = -1; return;
            }
            const scored = GAME_INDEX.map(g => ({g, s: score(g, q)})).filter(x => x.s > 0)
                .sort((a,b) => b.s - a.s || a.g.n.localeCompare(b.g.n)).slice(0, 8);
            current = scored.map(x => x.g);
            if (!current.length) {
                results.innerHTML = '<div class="hdr-search-empty"><strong>No games found</strong><span>Try another word — like "draw", "trivia", or "word".</span></div>';
                activeIdx = -1; return;
            }
            const catColor = {Solo:'#4facfe',Duos:'#a445b2',Squad:'#ff6b9d',Party:'#ffd166'};
            results.innerHTML = current.map((g, i) =>
                '<a href="'+g.u+'" class="hdr-search-item'+(i===activeIdx?' active':'')+'" data-i="'+i+'">'
                + '<span class="hdr-search-icon" style="--c:'+(catColor[g.c]||'#888')+'">'+g.e+'</span>'
                + '<span class="hdr-search-item-main"><span class="hdr-search-item-name">'+g.n+'</span>'
                + '<span class="hdr-search-item-sub">'+g.c+' • Play now</span></span>'
                + '<svg class="hdr-search-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></a>'
            ).join('');
        }
        function move(d) {
            if (!current.length) return;
            activeIdx = (activeIdx + d + current.length) % current.length;
            [...results.querySelectorAll('.hdr-search-item')].forEach((el,i) => el.classList.toggle('active', i===activeIdx));
            const act = results.querySelector('.hdr-search-item.active');
            if (act) act.scrollIntoView({block:'nearest'});
        }

        trigger.addEventListener('click', openPanel);
        closeBtn.addEventListener('click', closePanel);
        input.addEventListener('input', () => render(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
            else if (e.key === 'Enter') {
                const target = activeIdx >= 0 ? current[activeIdx] : current[0];
                if (target) window.location.href = target.u;
            } else if (e.key === 'Escape') { closePanel(); }
        });
        panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });
        document.addEventListener('keydown', (e) => {
            if ((e.key === '/' || (e.key === 'k' && (e.metaKey||e.ctrlKey))) && !panel.classList.contains('open')) {
                const tag = (document.activeElement.tagName||'').toLowerCase();
                if (tag !== 'input' && tag !== 'textarea') { e.preventDefault(); openPanel(); }
            }
        });
    }

    // ========================================
    // SUPABASE AUTH
    // ========================================
    
    async function initSupabaseAuth() {
        // Wait for Supabase if not loaded
        if (typeof supabase === 'undefined') {
            await loadSupabase();
        }
        
        if (typeof supabase === 'undefined') {
            console.warn('Header: Supabase not available');
            updateAuthUI(false);
            return;
        }
        
        // Create or reuse client
        if (!window.supabaseClient) {
            window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        
        const client = window.supabaseClient;
        
        try {
            const { data, error } = await client.auth.getSession();
            if (error) throw error;
            
            const user = data?.session?.user;
            
            if (user) {
                updateAuthUI(true);
                
                // Fetch profile for display name
                const { data: profile } = await client.from('profiles')
                    .select('display_name, gamer_tag')
                    .eq('id', user.id)
                    .single();
                
                const name = profile?.display_name || profile?.gamer_tag || user.email?.split('@')[0] || 'Player';
                setHeaderName(name);
            } else {
                updateAuthUI(false);
            }
        } catch (err) {
            console.warn('Header auth error:', err);
            updateAuthUI(false);
        }
        
        // Listen for auth changes
        client.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                updateAuthUI(false);
            } else if (event === 'SIGNED_IN' && session?.user) {
                updateAuthUI(true);
                // Re-fetch profile
                initSupabaseAuth();
            }
        });
        
        // Setup sign out
        if (elements.signoutBtn) {
            elements.signoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    localStorage.removeItem(CACHE_LABEL);
                    localStorage.removeItem(CACHE_FULL);
                } catch (e) {}
                await client.auth.signOut();
                window.location.href = '/';
            });
        }
    }
    
    function loadSupabase() {
        return new Promise((resolve) => {
            if (typeof supabase !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@supabase/supabase-js@2';
            script.onload = () => resolve();
            script.onerror = () => resolve();
            document.head.appendChild(script);
        });
    }

    // ========================================
    // INITIALIZE
    // ========================================
    
    function init() {
        // Inject header HTML
        if (!injectHeader()) return;
        
        // Cache DOM elements
        cacheElements();
        
        // Prime from localStorage for instant UI
        primeFromCache();
        
        // Setup dropdown menu
        setupMenu();

        // Setup search
        setupSearch();

        // Initialize auth
        initSupabaseAuth();
        
        // Load social system (friends panel)
        loadSocialSystem();
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
