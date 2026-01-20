# TheGaming.co SEO Landing Pages

## What's Included
- **66 SEO landing pages** (all at root level for clean URLs)
- `sitemap.xml` - Submit to Google Search Console
- `robots.txt` - Search engine instructions

## Pages by Category

### Solo (19 pages) - Light Theme / Teal
typing-test, reaction-time, aim-trainer, chimp-test, number-memory, sequence-memory, visual-memory, verbal-memory, math-speed, stroop-test, 2048, minesweeper, sudoku, snake, crossword, wordsearch, block-stack, sky-hop, nonogram

### Duos (16 pages) - Light Theme / Pink
truth-or-dare, would-you-rather, 21-questions, never-have-i-ever, this-or-that, connect-four, rock-paper-scissors, reaction-race, hangman, word-chain, memory-match, tic-tac-toe, charades, story-builder, finish-my-sentence, kmk

### Squad (26 pages) - Dark Theme / Game Colors
spyfall, codenames, werewolf, avalon, imposter, fake-artist, insider, wavelength, herd-mentality, categories, word-association, word-bomb, npat, broken-pictionary, sketch-guess, doodle-duel, punchline, fools-gold, two-truths, most-likely-to, charades-squad, celebrity, hot-seat, power-struggle, ludo, head2head

### Party (5 pages) - Dark Theme / Game Colors
trivia-royale, bet-or-bluff, this-or-that-party, hot-takes, never-ever

## Deployment

### Step 1: Upload Files
Copy all `.html` files to your site's root directory:
```
thegaming.co/
├── index.html (existing)
├── spyfall.html (new - SEO page)
├── typing-test.html (new - SEO page)
├── ... (all 66 pages)
├── sitemap.xml (new)
├── robots.txt (new/update)
```

### Step 2: Submit Sitemap
1. Go to Google Search Console
2. Select your property (thegaming.co)
3. Go to Sitemaps (left sidebar)
4. Enter: `sitemap.xml`
5. Click Submit

### Step 3: Request Indexing (Optional)
For faster indexing of key pages:
1. In Search Console, go to URL Inspection
2. Enter a page URL (e.g., `https://thegaming.co/spyfall`)
3. Click "Request Indexing"

## How It Works
- User searches "play spyfall online free"
- Google shows `thegaming.co/spyfall` (SEO page)
- User clicks "Play Now" → goes to `/games/squad/spyfall.html` (actual game)

## Dependencies
These pages require your existing files:
- `/header.css` - Header styles
- `/header.js` - Header functionality
- `/favicon.ico` - Site favicon

## URL Structure
```
SEO Page:    thegaming.co/spyfall
Game Page:   thegaming.co/games/squad/spyfall.html
```

Clean, memorable URLs for better SEO and sharing!
