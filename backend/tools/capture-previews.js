/**
 * Playhub Game Preview Screenshot Pipeline
 * =========================================
 * Run: npm run capture-previews
 * After redesigning any game, run this to regenerate its card preview.
 *
 * Strategy: serve gamerhub/ via a local HTTP server, intercept socket.io with a
 * fake stub, inject localStorage values so redirect guards pass, fire game-specific
 * socket events after load to render a populated mid-game state, then screenshot.
 *
 * Output: gamerhub/assets/previews/<game-id>.webp (640×280 @ deviceScaleFactor 2)
 */

const puppeteer = require('puppeteer');
const http      = require('http');
const fs        = require('fs');
const path      = require('path');

// ─── Config ────────────────────────────────────────────────────────────────
const GAMERHUB_DIR = path.resolve(__dirname, '../../gamerhub');
const OUTPUT_DIR   = path.resolve(GAMERHUB_DIR, 'assets/previews');
const PORT         = 19_234; // unlikely collision port
const BASE_URL     = `http://localhost:${PORT}`;
const VIEWPORT     = { width: 640, height: 280, deviceScaleFactor: 2 };

// ─── Minimal static HTTP server ────────────────────────────────────────────
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.json': 'application/json',
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/') urlPath = '/index.html';
      const file = path.join(GAMERHUB_DIR, urlPath);
      if (!file.startsWith(GAMERHUB_DIR)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        const ext = path.extname(file).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

// ─── Fake socket.io stub (injected before page scripts run) ────────────────
const FAKE_IO_SCRIPT = `
(function() {
  'use strict';
  const _handlers = {};
  const _fakeSocket = {
    on(event, fn) {
      if (!_handlers[event]) _handlers[event] = [];
      _handlers[event].push(fn);
      return this;
    },
    off() { return this; },
    emit() { return this; },
    disconnect() {},
    connect() { return this; },
    id: 'preview-fake-id',
    connected: true
  };
  window.__fakeSocket   = _fakeSocket;
  window.__fakeHandlers = _handlers;
  // Override io() — intercept before game scripts call it
  window.io = function() { return _fakeSocket; };
})();
`;

// Fire pre-defined events into the fake socket
async function fireEvents(page, events) {
  for (const [event, data] of events) {
    await page.evaluate(([ev, d]) => {
      const hs = window.__fakeHandlers?.[ev] || [];
      hs.forEach(h => { try { h(d); } catch(e) {} });
    }, [event, data]);
    await page.waitForTimeout(120);
  }
}

// ─── Game configurations ────────────────────────────────────────────────────
// Each entry: { id, gamePath, ls (localStorage), events, waitMs, captureSelector }
// localStorage keys the games read: tempPlayerName, tempRoomCode, tempIsHost, etc.
const BASE_LS = {
  tempPlayerName: 'Alex',
  tempRoomCode:   'PREV01',
  tempIsHost:     'true',
  tempIsPremium:  'false',
  tempGameType:   'spyfall',
};

const GAMES = [
  // ── DECEPTION ──────────────────────────────────────────────────────────
  {
    id: 'spyfall',
    gamePath: '/games/squad/spyfall.html',
    ls: { ...BASE_LS, tempGameType: 'spyfall' },
    events: [
      ['role-assigned', {
        role: 'player', isSpy: false, location: 'Casino', word: 'Casino',
        role: 'Card Dealer',
        roles: ['Card Dealer','Gambler','Security Guard','Bartender','Manager','Hotel Manager'],
        allLocations: ['Casino','Beach','Hospital','Airport','School','Museum','Zoo']
      }]
    ],
    waitMs: 800,
  },
  {
    id: 'werewolf',
    gamePath: '/games/squad/werewolf.html',
    ls: { ...BASE_LS, tempGameType: 'werewolf' },
    events: [
      ['game-state', {
        phase: 'day', round: 2, alivePlayers: ['Alex','Sam','Jordan','Taylor','Riley'],
        eliminatedPlayers: ['Chris'],
        myRole: 'Villager', myId: 'preview-fake-id', votes: {}
      }],
      ['day-phase-start', {
        round: 2, players: ['Alex','Sam','Jordan','Taylor','Riley'],
        eliminated: null, message: 'The sun rises. Discuss and vote!'
      }],
    ],
    waitMs: 900,
  },
  {
    id: 'imposter',
    gamePath: '/games/squad/imposter.html',
    ls: { ...BASE_LS, tempGameType: 'imposter' },
    events: [
      ['role-assigned', {
        role: 'player', isImposter: false, word: 'PIZZA', category: 'food',
        imposterTeam: []
      }]
    ],
    waitMs: 800,
  },
  {
    id: 'fake-artist',
    gamePath: '/games/squad/fake-artist.html',
    ls: { ...BASE_LS, tempGameType: 'fake-artist' },
    events: [
      ['fakeartist-round', {
        round: 1, totalRounds: 3, isFaker: false, word: 'ELEPHANT',
        turnOrder: ['Alex','Sam','Jordan','Taylor']
      }]
    ],
    waitMs: 800,
  },
  {
    id: 'secret-roles',
    gamePath: '/games/squad/secret-roles.html',
    ls: { ...BASE_LS, tempGameType: 'secret-roles' },
    events: [
      ['role-assigned', {
        role: 'Merlin', team: 'good', teammates: ['Alex','Sam'],
        evilPlayers: ['Jordan']
      }],
      ['quest-phase', {
        questNumber: 2, teamSize: 3, leader: 'Sam',
        players: ['Alex','Sam','Jordan','Taylor','Riley'],
        questResults: [true, null, null, null, null]
      }]
    ],
    waitMs: 900,
  },
  {
    id: 'insider',
    gamePath: '/games/squad/insider.html',
    ls: { ...BASE_LS, tempGameType: 'insider' },
    events: [
      ['insider-start', {
        role: 'common', word: null, timeLimit: 300,
        master: 'Sam', insiderName: null
      }],
      ['question-phase', { timeLeft: 180 }]
    ],
    waitMs: 700,
  },
  {
    id: 'power-struggle',
    gamePath: '/games/squad/power-struggle.html',
    ls: { ...BASE_LS, tempGameType: 'power-struggle' },
    events: [
      ['ps-state', {
        myCards: [{ card: 'Duke', dead: false }, { card: 'Captain', dead: false }],
        myCoins: 5, myFaction: null, currentTurn: 'Jordan',
        isMyTurn: false, phase: 'action', pendingAction: null,
        reformation: false, useInquisitor: false, treasury: 0, allSameFaction: true,
        players: [
          { name:'Alex', coins:5, cardCount:2, eliminated:false, deadCards:[], faction:null },
          { name:'Sam',  coins:3, cardCount:1, eliminated:false, deadCards:['Ambassador'], faction:null },
          { name:'Jordan', coins:7, cardCount:2, eliminated:false, deadCards:[], faction:null },
          { name:'Taylor', coins:2, cardCount:2, eliminated:false, deadCards:[], faction:null },
        ],
        logs: ['Game started.','Alex takes Income.','Sam claims Captain — steals from Jordan.'],
      }]
    ],
    waitMs: 1000,
  },

  // ── WORD ───────────────────────────────────────────────────────────────
  {
    id: 'codenames',
    gamePath: '/games/squad/codenames.html',
    ls: { ...BASE_LS, tempGameType: 'codenames' },
    events: [],  // complex board — screenshot waiting state with game colors visible
    waitMs: 600,
  },
  {
    id: 'wavelength',
    gamePath: '/games/squad/wavelength.html',
    ls: { ...BASE_LS, tempGameType: 'wavelength' },
    events: [
      ['wavelength-round', {
        round: 2, totalRounds: 6, psychic: 'Sam',
        isPsychic: false, target: null, leftLabel: 'Cold', rightLabel: 'Hot'
      }],
      ['wavelength-clue', { clue: 'LAVA', psychic: 'Sam' }]
    ],
    waitMs: 900,
  },
  {
    id: 'herd-mentality',
    gamePath: '/games/squad/herd-mentality.html',
    ls: { ...BASE_LS, tempGameType: 'herd-mentality' },
    events: [
      ['think-alike-question', {
        question: 'Name a type of pizza topping', round: 2, totalRounds: 10
      }]
    ],
    waitMs: 700,
  },
  {
    id: 'categories',
    gamePath: '/games/squad/categories.html',
    ls: { ...BASE_LS, tempGameType: 'categories' },
    events: [
      ['categories-round', {
        category: 'Animals that can swim', round: 3, timeLimit: 15,
        players: ['Alex','Sam','Jordan','Taylor']
      }]
    ],
    waitMs: 700,
  },
  {
    id: 'word-association',
    gamePath: '/games/squad/word-association.html',
    ls: { ...BASE_LS, tempGameType: 'word-association' },
    events: [
      ['word-chain-update', {
        chain: ['Ocean','Wave','Surfer','Beach','Sunburn','Aloe'],
        currentPlayer: 'Jordan', yourTurn: false
      }]
    ],
    waitMs: 700,
  },
  {
    id: 'word-bomb',
    gamePath: '/games/squad/word-bomb.html',
    ls: { ...BASE_LS, tempGameType: 'word-bomb' },
    events: [
      ['bomb-tick', {
        letters: 'PL', currentPlayer: 'Alex', isMyTurn: true,
        players: ['Alex','Sam','Jordan','Taylor'], lives: { Alex:3,Sam:2,Jordan:3,Taylor:1 },
        timeLeft: 8, round: 3
      }]
    ],
    waitMs: 800,
  },
  {
    id: 'npat',
    gamePath: '/games/squad/npat.html',
    ls: { ...BASE_LS, tempGameType: 'npat' },
    events: [
      ['npat-round', {
        round: 2, maxRounds: 5, letter: 'B',
        categories: ['Name','Place','Animal','Thing'], timeLimit: 60
      }]
    ],
    waitMs: 700,
  },

  // ── DRAWING ────────────────────────────────────────────────────────────
  {
    id: 'punchline',
    gamePath: '/games/squad/punchline.html',
    ls: { ...BASE_LS, tempGameType: 'punchline' },
    events: [
      ['punchline-setup', {
        setup: 'Why don\'t scientists trust atoms?', round: 2, totalRounds: 8,
        players: ['Alex','Sam','Jordan','Taylor']
      }]
    ],
    waitMs: 700,
  },
  {
    id: 'fools-gold',
    gamePath: '/games/squad/fools-gold.html',
    ls: { ...BASE_LS, tempGameType: 'fools-gold' },
    events: [
      ['fools-gold-round', {
        statement: 'The Great Wall of China is visible from space.',
        round: 3, totalRounds: 10
      }]
    ],
    waitMs: 700,
  },
  {
    id: 'broken-pictionary',
    gamePath: '/games/squad/broken-pictionary.html',
    ls: { ...BASE_LS, tempGameType: 'broken-pictionary' },
    events: [
      ['bp-draw', {
        prompt: 'VOLCANO', step: 2, totalSteps: 4, timeLimit: 60
      }]
    ],
    waitMs: 800,
  },
  {
    id: 'doodle-duel',
    gamePath: '/games/squad/doodle-duel.html',
    ls: { ...BASE_LS, tempGameType: 'doodle-duel' },
    events: [
      ['dd-round-start', {
        round: 2, maxRounds: 4, prompt: 'A confused octopus',
        isArtist: true, timeLimit: 60
      }]
    ],
    waitMs: 800,
  },
  {
    id: 'two-truths',
    gamePath: '/games/squad/two-truths.html',
    ls: { ...BASE_LS, tempGameType: 'two-truths' },
    events: [
      ['twotruths-reveal', {
        player: 'Sam', statements: [
          'I once met the president.',
          'I can speak three languages.',
          'I have never eaten sushi.',
        ], lieIndex: 0, round: 2
      }]
    ],
    waitMs: 700,
  },
  {
    id: 'sketch-guess',
    gamePath: '/games/squad/sketch-guess.html',
    ls: { ...BASE_LS, tempGameType: 'sketch-guess' },
    events: [
      ['drawing-phase', {
        word: 'ROBOT', isDrawer: true, timeLimit: 60, round: 2,
        players: ['Alex','Sam','Jordan','Taylor']
      }]
    ],
    waitMs: 800,
  },

  // ── PARTY ──────────────────────────────────────────────────────────────
  {
    id: 'charades',
    gamePath: '/games/squad/charades.html',
    ls: { ...BASE_LS, tempGameType: 'charades' },
    events: [
      ['charades-turn', {
        actor: 'Alex', word: 'SKATEBOARDING', isMyTurn: true,
        round: 2, totalRounds: 4, timeLimit: 90,
        scores: { Alex:3, Sam:2, Jordan:4, Taylor:1 }
      }]
    ],
    waitMs: 800,
  },
  {
    id: 'celebrity',
    gamePath: '/games/squad/celebrity.html',
    ls: { ...BASE_LS, tempGameType: 'celebrity' },
    events: [
      ['celeb-turn', {
        guesser: 'Alex', isMyTurn: true, round: 2,
        players: ['Alex','Sam','Jordan','Taylor'],
        scores: { Alex:5, Sam:3, Jordan:4, Taylor:2 },
        timeLimit: 30
      }]
    ],
    waitMs: 700,
  },
  {
    id: 'fishbowl',
    gamePath: '/games/squad/fishbowl.html',
    ls: { ...BASE_LS, tempGameType: 'fishbowl' },
    events: [
      ['fishbowl-turn', {
        phase: 'taboo', guesser: 'Sam', isMyTurn: false,
        round: 2, wordsLeft: 8, timeLeft: 22
      }]
    ],
    waitMs: 700,
  },
  {
    id: 'most-likely-to',
    gamePath: '/games/squad/most-likely-to.html',
    ls: { ...BASE_LS, tempGameType: 'most-likely-to' },
    events: [
      ['mlt-question', {
        question: 'Most likely to forget their own birthday',
        round: 3, totalRounds: 10
      }]
    ],
    waitMs: 700,
  },

  // ── CLASSIC ────────────────────────────────────────────────────────────
  {
    id: 'ludo',
    gamePath: '/games/squad/ludo.html',
    ls: { ...BASE_LS, tempGameType: 'ludo' },
    events: [
      ['ludo-state', {
        pieces: {
          red:   [{ pos: 14, home: false }, { pos: -1, home: false }, { pos: -1, home: false }, { pos: -1, home: false }],
          blue:  [{ pos: 28, home: false }, { pos: -1, home: false }, { pos: -1, home: false }, { pos: -1, home: false }],
          green: [{ pos:  5, home: false }, { pos: -1, home: false }, { pos: -1, home: false }, { pos: -1, home: false }],
          yellow:[{ pos: 41, home: false }, { pos: -1, home: false }, { pos: -1, home: false }, { pos: -1, home: false }],
        },
        playerColors: { Alex:'red', Sam:'blue', Jordan:'green', Taylor:'yellow' },
        currentPlayer: 'Alex', phase: 'roll', dice: null
      }]
    ],
    waitMs: 1000,
  },
];

// ─── Screenshot one game ───────────────────────────────────────────────────
async function captureGame(browser, game) {
  const page = await browser.newPage();
  try {
    await page.setViewport(VIEWPORT);

    // 1. Intercept socket.io CDN — return our stub so the real socket never connects
    await page.setRequestInterception(true);
    page.on('request', req => {
      const url = req.url();
      if (url.includes('socket.io') && url.endsWith('.js')) {
        req.respond({ status: 200, contentType: 'application/javascript',
          body: `window.io = function() { return window.__fakeSocket; };` });
      } else if (url.includes('socket.io')) {
        req.abort();
      } else {
        req.continue().catch(() => {});
      }
    });

    // 2. Before any script runs: set localStorage + install fake socket
    await page.evaluateOnNewDocument((lsData, fakeScript) => {
      // Seed localStorage
      Object.entries(lsData).forEach(([k,v]) => localStorage.setItem(k, v));
      // Install fake socket
      eval(fakeScript); // eslint-disable-line no-eval
    }, game.ls, FAKE_IO_SCRIPT);

    // 3. Navigate
    await page.goto(`${BASE_URL}${game.gamePath}`, {
      waitUntil: 'domcontentloaded', timeout: 12000
    });

    // 4. Hide nav/header and scrollbars for clean screenshot
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `
        header, #site-header, nav, .back, .back-btn { display: none !important; }
        ::-webkit-scrollbar { display: none !important; }
        body { overflow: hidden !important; margin-top: 0 !important; padding-top: 0 !important; }
        main { padding-top: 16px !important; margin-top: 0 !important; }
      `;
      document.head.appendChild(style);
    });

    // 5. Fire mock events
    if (game.events.length > 0) {
      await fireEvents(page, game.events);
    }

    // 6. Wait for render + animations
    await page.waitForTimeout(game.waitMs || 800);

    // 7. Capture — try main content first, fall back to body
    let screenshotBuf;
    const mainEl = await page.$('main, .game-container, #game-container, .container');
    if (mainEl) {
      const box = await mainEl.boundingBox();
      if (box && box.width > 100 && box.height > 100) {
        screenshotBuf = await page.screenshot({
          clip: { x: box.x, y: box.y, width: Math.min(box.width, 640), height: Math.min(box.height, 280) },
          type: 'webp', quality: 88
        });
      }
    }
    if (!screenshotBuf) {
      screenshotBuf = await page.screenshot({
        clip: { x: 0, y: 0, width: 640, height: 280 },
        type: 'webp', quality: 88
      });
    }

    // 8. Save
    const outPath = path.join(OUTPUT_DIR, `${game.id}.webp`);
    fs.writeFileSync(outPath, screenshotBuf);
    console.log(`  ✓ ${game.id} → ${outPath}`);
    return true;
  } catch (err) {
    console.warn(`  ✗ ${game.id}: ${err.message}`);
    return false;
  } finally {
    await page.close();
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────
(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Starting local server…');
  const server = await startServer();
  console.log(`Serving ${GAMERHUB_DIR} on ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--font-render-hinting=none'],
  });

  let ok = 0, fail = 0;
  for (const game of GAMES) {
    process.stdout.write(`  capturing ${game.id}…`);
    const success = await captureGame(browser, game);
    if (success) ok++; else fail++;
  }

  await browser.close();
  server.close();

  console.log(`\nDone: ${ok} captured, ${fail} failed.`);
  console.log(`Output: ${OUTPUT_DIR}`);
})();
