/**
 * TheGaming.co Profile Engagement UI v3
 * Fixed to use actual database structure (solo_scores table)
 */

class ProfileEngagementUI {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentUser = null;
    this.userProfile = null;
    this.gameStats = {}; // { gameId: { plays: X, best: Y } }
    this.totalGamesPlayed = 0;
    this.referralCode = null;
    this.referralStats = { total: 0, successful: 0, xpEarned: 0 };
    
    // Solo games config (matches profile.html)
    this.SOLO_GAMES = {
      '2048': { name: '2048', icon: '🔢', ascending: false },
      'snake': { name: 'Snake', icon: '🐍', ascending: false },
      'sky-hop': { name: 'Sky Hop', icon: '☁️', ascending: false },
      'typing-test': { name: 'Typing Test', icon: '⌨️', ascending: false, suffix: ' WPM' },
      'reaction-time': { name: 'Reaction Time', icon: '⚡', ascending: true, suffix: 'ms' },
      'aim-trainer': { name: 'Aim Trainer', icon: '🎯', ascending: false },
      'chimp-test': { name: 'Chimp Test', icon: '🐵', ascending: false },
      'sequence-memory': { name: 'Sequence Memory', icon: '🔵', ascending: false },
      'number-memory': { name: 'Number Memory', icon: '🔢', ascending: false },
      'visual-memory': { name: 'Visual Memory', icon: '👁️', ascending: false },
      'verbal-memory': { name: 'Verbal Memory', icon: '📝', ascending: false },
      'stroop-test': { name: 'Stroop Test', icon: '🌈', ascending: false },
      'math-speed': { name: 'Math Speed', icon: '➕', ascending: false },
      'minesweeper': { name: 'Minesweeper', icon: '💣', ascending: true },
      'sudoku': { name: 'Sudoku', icon: '🔢', ascending: true },
      'crossword': { name: 'Crossword', icon: '📝', ascending: false },
      'wordsearch': { name: 'Word Search', icon: '🔍', ascending: true },
      'nonogram': { name: 'Nonogram', icon: '🖼️', ascending: true },
      'block-stack': { name: 'Block Stack', icon: '🧱', ascending: false }
    };
    
    // Daily challenges
    this.dailyChallenges = [
      { id: 'd1', title: 'First Game', description: 'Play any game today', icon: '🎮', xp_reward: 50, requirement_target: 1 },
      { id: 'd2', title: 'Triple Play', description: 'Play 3 games today', icon: '🎯', xp_reward: 100, requirement_target: 3 },
      { id: 'd3', title: 'High Five', description: 'Play 5 games today', icon: '✋', xp_reward: 150, requirement_target: 5 },
      { id: 'd4', title: 'Brain Trainer', description: 'Play a memory game', icon: '🧠', xp_reward: 75, requirement_target: 1 },
      { id: 'd5', title: 'Speed Demon', description: 'Play Reaction Time', icon: '⚡', xp_reward: 75, requirement_target: 1 },
    ];
    
    // Weekly challenges
    this.weeklyChallenges = [
      { id: 'w1', title: 'Dedicated Player', description: 'Play 20 games this week', icon: '🎮', xp_reward: 500, requirement_target: 20 },
      { id: 'w2', title: 'Variety Pack', description: 'Play 5 different games', icon: '🎲', xp_reward: 400, requirement_target: 5 },
      { id: 'w3', title: 'Solo Grinder', description: 'Play 15 solo games', icon: '🕹️', xp_reward: 400, requirement_target: 15 },
      { id: 'w4', title: 'Marathon', description: 'Play 50 games this week', icon: '🏃', xp_reward: 1000, requirement_target: 50 },
      { id: 'w5', title: '2048 Expert', description: 'Reach 2048 tile', icon: '🔢', xp_reward: 750, requirement_target: 2048 },
      { id: 'w6', title: 'Snake Legend', description: 'Score 100+ in Snake', icon: '🐍', xp_reward: 750, requirement_target: 100 },
    ];
    
    // Achievements
    this.achievements = [
      // Games Played
      { id: 'first_game', title: 'First Steps', description: 'Play your first game', icon: '🎮', category: 'games', rarity: 'common', xp_reward: 50, check: () => this.totalGamesPlayed >= 1 },
      { id: 'games_10', title: 'Getting Started', description: 'Play 10 games', icon: '🎯', category: 'games', rarity: 'common', xp_reward: 100, check: () => this.totalGamesPlayed >= 10 },
      { id: 'games_25', title: 'Casual Gamer', description: 'Play 25 games', icon: '🕹️', category: 'games', rarity: 'common', xp_reward: 150, check: () => this.totalGamesPlayed >= 25 },
      { id: 'games_50', title: 'Regular', description: 'Play 50 games', icon: '⭐', category: 'games', rarity: 'uncommon', xp_reward: 250, check: () => this.totalGamesPlayed >= 50 },
      { id: 'games_100', title: 'Dedicated', description: 'Play 100 games', icon: '💫', category: 'games', rarity: 'uncommon', xp_reward: 500, check: () => this.totalGamesPlayed >= 100 },
      { id: 'games_250', title: 'Committed', description: 'Play 250 games', icon: '🌟', category: 'games', rarity: 'rare', xp_reward: 750, check: () => this.totalGamesPlayed >= 250 },
      { id: 'games_500', title: 'Veteran', description: 'Play 500 games', icon: '🏅', category: 'games', rarity: 'rare', xp_reward: 1000, check: () => this.totalGamesPlayed >= 500 },
      { id: 'games_1000', title: 'Legend', description: 'Play 1000 games', icon: '👑', category: 'games', rarity: 'epic', xp_reward: 2500, check: () => this.totalGamesPlayed >= 1000 },
      
      // Variety
      { id: 'variety_3', title: 'Explorer', description: 'Play 3 different games', icon: '🗺️', category: 'variety', rarity: 'common', xp_reward: 75, check: () => Object.keys(this.gameStats).length >= 3 },
      { id: 'variety_5', title: 'Adventurer', description: 'Play 5 different games', icon: '🧭', category: 'variety', rarity: 'common', xp_reward: 150, check: () => Object.keys(this.gameStats).length >= 5 },
      { id: 'variety_10', title: 'Versatile', description: 'Play 10 different games', icon: '🎪', category: 'variety', rarity: 'uncommon', xp_reward: 300, check: () => Object.keys(this.gameStats).length >= 10 },
      { id: 'variety_all', title: 'Completionist', description: 'Play all solo games', icon: '🏆', category: 'variety', rarity: 'epic', xp_reward: 1000, check: () => Object.keys(this.gameStats).length >= Object.keys(this.SOLO_GAMES).length },
      
      // 2048
      { id: '2048_first', title: '2048 Beginner', description: 'Play 2048', icon: '🔢', category: '2048', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['2048']?.plays || 0) >= 1 },
      { id: '2048_256', title: '2048: 256 Tile', description: 'Reach 256 tile', icon: '🟨', category: '2048', rarity: 'common', xp_reward: 50, check: () => (this.gameStats['2048']?.best || 0) >= 256 },
      { id: '2048_512', title: '2048: 512 Tile', description: 'Reach 512 tile', icon: '🟧', category: '2048', rarity: 'common', xp_reward: 100, check: () => (this.gameStats['2048']?.best || 0) >= 512 },
      { id: '2048_1024', title: '2048: 1024 Tile', description: 'Reach 1024 tile', icon: '🟥', category: '2048', rarity: 'uncommon', xp_reward: 200, check: () => (this.gameStats['2048']?.best || 0) >= 1024 },
      { id: '2048_2048', title: '2048: Victory!', description: 'Reach 2048 tile', icon: '🏆', category: '2048', rarity: 'rare', xp_reward: 500, check: () => (this.gameStats['2048']?.best || 0) >= 2048 },
      { id: '2048_4096', title: '2048: Beyond', description: 'Reach 4096 tile', icon: '💎', category: '2048', rarity: 'epic', xp_reward: 1000, check: () => (this.gameStats['2048']?.best || 0) >= 4096 },
      { id: '2048_addict', title: '2048 Addict', description: 'Play 50 games of 2048', icon: '🎯', category: '2048', rarity: 'uncommon', xp_reward: 300, check: () => (this.gameStats['2048']?.plays || 0) >= 50 },
      
      // Snake
      { id: 'snake_first', title: 'Snake Beginner', description: 'Play Snake', icon: '🐍', category: 'snake', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['snake']?.plays || 0) >= 1 },
      { id: 'snake_25', title: 'Snake: 25 Points', description: 'Score 25 in Snake', icon: '🐍', category: 'snake', rarity: 'common', xp_reward: 50, check: () => (this.gameStats['snake']?.best || 0) >= 25 },
      { id: 'snake_50', title: 'Snake: 50 Points', description: 'Score 50 in Snake', icon: '🐍', category: 'snake', rarity: 'common', xp_reward: 100, check: () => (this.gameStats['snake']?.best || 0) >= 50 },
      { id: 'snake_100', title: 'Snake: Century', description: 'Score 100 in Snake', icon: '🐍', category: 'snake', rarity: 'uncommon', xp_reward: 250, check: () => (this.gameStats['snake']?.best || 0) >= 100 },
      { id: 'snake_150', title: 'Snake: Expert', description: 'Score 150 in Snake', icon: '🐍', category: 'snake', rarity: 'rare', xp_reward: 500, check: () => (this.gameStats['snake']?.best || 0) >= 150 },
      { id: 'snake_200', title: 'Snake: Master', description: 'Score 200 in Snake', icon: '🐍', category: 'snake', rarity: 'epic', xp_reward: 1000, check: () => (this.gameStats['snake']?.best || 0) >= 200 },
      
      // Sky Hop
      { id: 'skyhop_first', title: 'Sky Hopper', description: 'Play Sky Hop', icon: '☁️', category: 'sky-hop', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['sky-hop']?.plays || 0) >= 1 },
      { id: 'skyhop_25', title: 'Cloud Jumper', description: 'Score 25 in Sky Hop', icon: '☁️', category: 'sky-hop', rarity: 'common', xp_reward: 75, check: () => (this.gameStats['sky-hop']?.best || 0) >= 25 },
      { id: 'skyhop_50', title: 'Sky Walker', description: 'Score 50 in Sky Hop', icon: '🌤️', category: 'sky-hop', rarity: 'uncommon', xp_reward: 150, check: () => (this.gameStats['sky-hop']?.best || 0) >= 50 },
      { id: 'skyhop_100', title: 'Cloud Master', description: 'Score 100 in Sky Hop', icon: '⛅', category: 'sky-hop', rarity: 'rare', xp_reward: 400, check: () => (this.gameStats['sky-hop']?.best || 0) >= 100 },
      { id: 'skyhop_200', title: 'Heaven Bound', description: 'Score 200 in Sky Hop', icon: '✨', category: 'sky-hop', rarity: 'legendary', xp_reward: 2500, check: () => (this.gameStats['sky-hop']?.best || 0) >= 200 },
      
      // Typing Test
      { id: 'typing_first', title: 'Keyboard Warrior', description: 'Complete a typing test', icon: '⌨️', category: 'typing', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['typing-test']?.plays || 0) >= 1 },
      { id: 'typing_30', title: 'Casual Typer', description: 'Get 30+ WPM', icon: '⌨️', category: 'typing', rarity: 'common', xp_reward: 50, check: () => (this.gameStats['typing-test']?.best || 0) >= 30 },
      { id: 'typing_50', title: 'Quick Fingers', description: 'Get 50+ WPM', icon: '⌨️', category: 'typing', rarity: 'common', xp_reward: 100, check: () => (this.gameStats['typing-test']?.best || 0) >= 50 },
      { id: 'typing_70', title: 'Fast Typer', description: 'Get 70+ WPM', icon: '⚡', category: 'typing', rarity: 'uncommon', xp_reward: 250, check: () => (this.gameStats['typing-test']?.best || 0) >= 70 },
      { id: 'typing_90', title: 'Speed Demon', description: 'Get 90+ WPM', icon: '💨', category: 'typing', rarity: 'rare', xp_reward: 500, check: () => (this.gameStats['typing-test']?.best || 0) >= 90 },
      { id: 'typing_120', title: 'Typing Legend', description: 'Get 120+ WPM', icon: '👑', category: 'typing', rarity: 'epic', xp_reward: 1500, check: () => (this.gameStats['typing-test']?.best || 0) >= 120 },
      
      // Reaction Time (lower is better)
      { id: 'reaction_first', title: 'Quick Thinker', description: 'Complete reaction test', icon: '⚡', category: 'reaction', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['reaction-time']?.plays || 0) >= 1 },
      { id: 'reaction_300', title: 'Average Reflexes', description: 'Get under 300ms', icon: '⚡', category: 'reaction', rarity: 'common', xp_reward: 50, check: () => { const b = this.gameStats['reaction-time']?.best; return b && b > 0 && b <= 300; }},
      { id: 'reaction_250', title: 'Quick Reflexes', description: 'Get under 250ms', icon: '⚡', category: 'reaction', rarity: 'common', xp_reward: 100, check: () => { const b = this.gameStats['reaction-time']?.best; return b && b > 0 && b <= 250; }},
      { id: 'reaction_200', title: 'Fast Reflexes', description: 'Get under 200ms', icon: '💨', category: 'reaction', rarity: 'uncommon', xp_reward: 250, check: () => { const b = this.gameStats['reaction-time']?.best; return b && b > 0 && b <= 200; }},
      { id: 'reaction_175', title: 'Lightning Fast', description: 'Get under 175ms', icon: '⚡', category: 'reaction', rarity: 'rare', xp_reward: 500, check: () => { const b = this.gameStats['reaction-time']?.best; return b && b > 0 && b <= 175; }},
      { id: 'reaction_150', title: 'Superhuman', description: 'Get under 150ms', icon: '🔥', category: 'reaction', rarity: 'epic', xp_reward: 1000, check: () => { const b = this.gameStats['reaction-time']?.best; return b && b > 0 && b <= 150; }},
      
      // Aim Trainer
      { id: 'aim_first', title: 'Target Practice', description: 'Play Aim Trainer', icon: '🎯', category: 'aim', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['aim-trainer']?.plays || 0) >= 1 },
      { id: 'aim_50', title: 'Decent Aim', description: 'Score 50+ in Aim Trainer', icon: '🎯', category: 'aim', rarity: 'common', xp_reward: 75, check: () => (this.gameStats['aim-trainer']?.best || 0) >= 50 },
      { id: 'aim_75', title: 'Good Aim', description: 'Score 75+ in Aim Trainer', icon: '🎯', category: 'aim', rarity: 'uncommon', xp_reward: 150, check: () => (this.gameStats['aim-trainer']?.best || 0) >= 75 },
      { id: 'aim_90', title: 'Great Aim', description: 'Score 90+ in Aim Trainer', icon: '🎯', category: 'aim', rarity: 'rare', xp_reward: 300, check: () => (this.gameStats['aim-trainer']?.best || 0) >= 90 },
      { id: 'aim_95', title: 'Elite Aim', description: 'Score 95+ in Aim Trainer', icon: '🎯', category: 'aim', rarity: 'epic', xp_reward: 750, check: () => (this.gameStats['aim-trainer']?.best || 0) >= 95 },
      
      // Memory Games
      { id: 'chimp_first', title: 'Chimp Challenger', description: 'Play Chimp Test', icon: '🐵', category: 'memory', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['chimp-test']?.plays || 0) >= 1 },
      { id: 'chimp_7', title: 'Chimp Brain', description: 'Level 7 in Chimp Test', icon: '🐵', category: 'memory', rarity: 'uncommon', xp_reward: 150, check: () => (this.gameStats['chimp-test']?.best || 0) >= 7 },
      { id: 'chimp_10', title: 'Super Chimp', description: 'Level 10 in Chimp Test', icon: '🐒', category: 'memory', rarity: 'rare', xp_reward: 400, check: () => (this.gameStats['chimp-test']?.best || 0) >= 10 },
      { id: 'sequence_first', title: 'Pattern Starter', description: 'Play Sequence Memory', icon: '🔵', category: 'memory', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['sequence-memory']?.plays || 0) >= 1 },
      { id: 'sequence_10', title: 'Pattern Pro', description: 'Level 10 in Sequence Memory', icon: '🔵', category: 'memory', rarity: 'uncommon', xp_reward: 200, check: () => (this.gameStats['sequence-memory']?.best || 0) >= 10 },
      { id: 'visual_first', title: 'Sharp Eyes', description: 'Play Visual Memory', icon: '👁️', category: 'memory', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['visual-memory']?.plays || 0) >= 1 },
      { id: 'visual_10', title: 'Pattern Vision', description: 'Level 10 in Visual Memory', icon: '👁️', category: 'memory', rarity: 'uncommon', xp_reward: 200, check: () => (this.gameStats['visual-memory']?.best || 0) >= 10 },
      { id: 'number_first', title: 'Number Novice', description: 'Play Number Memory', icon: '🔢', category: 'memory', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['number-memory']?.plays || 0) >= 1 },
      { id: 'number_10', title: 'Digit Master', description: 'Remember 10+ digits', icon: '🔢', category: 'memory', rarity: 'uncommon', xp_reward: 250, check: () => (this.gameStats['number-memory']?.best || 0) >= 10 },
      { id: 'verbal_first', title: 'Word Watcher', description: 'Play Verbal Memory', icon: '📝', category: 'memory', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['verbal-memory']?.plays || 0) >= 1 },
      { id: 'verbal_50', title: 'Word Bank', description: 'Score 50+ in Verbal Memory', icon: '📚', category: 'memory', rarity: 'uncommon', xp_reward: 200, check: () => (this.gameStats['verbal-memory']?.best || 0) >= 50 },
      
      // Puzzles
      { id: 'minesweeper_first', title: 'Mine Finder', description: 'Play Minesweeper', icon: '💣', category: 'puzzles', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['minesweeper']?.plays || 0) >= 1 },
      { id: 'sudoku_first', title: 'Sudoku Novice', description: 'Play Sudoku', icon: '🔢', category: 'puzzles', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['sudoku']?.plays || 0) >= 1 },
      { id: 'crossword_first', title: 'Word Finder', description: 'Play Crossword', icon: '📝', category: 'puzzles', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['crossword']?.plays || 0) >= 1 },
      { id: 'wordsearch_first', title: 'Word Seeker', description: 'Play Word Search', icon: '🔍', category: 'puzzles', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['wordsearch']?.plays || 0) >= 1 },
      { id: 'nonogram_first', title: 'Pixel Artist', description: 'Play Nonogram', icon: '🖼️', category: 'puzzles', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['nonogram']?.plays || 0) >= 1 },
      
      // Other games
      { id: 'stroop_first', title: 'Color Confused', description: 'Play Stroop Test', icon: '🌈', category: 'other', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['stroop-test']?.plays || 0) >= 1 },
      { id: 'math_first', title: 'Calculator', description: 'Play Math Speed', icon: '➕', category: 'other', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['math-speed']?.plays || 0) >= 1 },
      { id: 'blockstack_first', title: 'Block Builder', description: 'Play Block Stack', icon: '🧱', category: 'other', rarity: 'common', xp_reward: 25, check: () => (this.gameStats['block-stack']?.plays || 0) >= 1 },
    ];
  }

  async init() {
    console.log('[ProfileUI] Initializing...');
    
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session?.user) {
        console.log('[ProfileUI] No user session');
        this.generateReferralCode();
        return;
      }
      
      this.currentUser = session.user;
      console.log('[ProfileUI] User:', this.currentUser.id);
      
      // Load profile
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', this.currentUser.id)
        .single();
      this.userProfile = profile;
      
      // Load actual game stats from solo_scores
      await this.loadGameStats();
      
      // Generate referral code
      this.generateReferralCode();
      
      console.log('[ProfileUI] Init complete. Total games:', this.totalGamesPlayed);
    } catch (e) {
      console.error('[ProfileUI] Init error:', e);
      this.generateReferralCode();
    }
  }
  
  generateReferralCode() {
    const name = this.userProfile?.display_name || this.userProfile?.gamer_tag || 'PLAYER';
    const clean = name.replace(/[^A-Za-z0-9]/g, '').toUpperCase().substring(0, 4);
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referralCode = (clean || 'TGCO') + rand;
  }
  
  async loadGameStats() {
    if (!this.currentUser) return;
    
    try {
      // Get all scores for this user
      const { data: scores, error } = await this.supabase
        .from('solo_scores')
        .select('game_id, score')
        .eq('user_id', this.currentUser.id);
      
      if (error) {
        console.log('[ProfileUI] Error loading scores:', error.message);
        return;
      }
      
      if (!scores || scores.length === 0) {
        console.log('[ProfileUI] No scores found');
        return;
      }
      
      this.totalGamesPlayed = scores.length;
      console.log('[ProfileUI] Found', scores.length, 'game plays');
      
      // Group by game and find best scores
      scores.forEach(s => {
        if (!this.gameStats[s.game_id]) {
          this.gameStats[s.game_id] = { plays: 0, best: null, scores: [] };
        }
        this.gameStats[s.game_id].plays++;
        this.gameStats[s.game_id].scores.push(s.score);
      });
      
      // Calculate best for each game
      Object.entries(this.gameStats).forEach(([gameId, stats]) => {
        const config = this.SOLO_GAMES[gameId];
        if (config?.ascending) {
          // Lower is better (reaction time, puzzle times)
          stats.best = Math.min(...stats.scores.filter(s => s > 0));
        } else {
          // Higher is better
          stats.best = Math.max(...stats.scores);
        }
      });
      
      console.log('[ProfileUI] Game stats:', this.gameStats);
    } catch (e) {
      console.error('[ProfileUI] Error loading game stats:', e);
    }
  }

  // ============ CHALLENGES ============
  
  renderChallengesSection() {
    const container = document.getElementById('challenges-container');
    if (!container) {
      console.log('[ProfileUI] challenges-container not found');
      return;
    }
    
    console.log('[ProfileUI] Rendering', this.dailyChallenges.length, 'daily and', this.weeklyChallenges.length, 'weekly challenges');
    
    container.innerHTML = `
      <div class="engagement-section">
        <div class="challenge-tabs">
          <button class="challenge-tab active" data-tab="daily">Daily Challenges</button>
          <button class="challenge-tab" data-tab="weekly">Weekly Challenges</button>
        </div>
        
        <div class="challenge-list" id="daily-challenges">
          ${this.dailyChallenges.map(c => this.renderChallengeCard(c)).join('')}
        </div>
        
        <div class="challenge-list" id="weekly-challenges" style="display: none;">
          ${this.weeklyChallenges.map(c => this.renderChallengeCard(c)).join('')}
        </div>
      </div>
      
      <style>
        .engagement-section { margin-top: 8px; }
        .challenge-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .challenge-tab {
          padding: 10px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.6);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .challenge-tab:hover { background: rgba(255,255,255,0.08); color: white; }
        .challenge-tab.active { 
          background: linear-gradient(135deg, rgba(255,107,157,0.2), rgba(164,69,178,0.2));
          border-color: rgba(255,107,157,0.4);
          color: white;
        }
        .challenge-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .challenge-card:hover { background: rgba(255,255,255,0.05); }
        .challenge-icon { font-size: 2rem; }
        .challenge-info { flex: 1; }
        .challenge-title { font-weight: 600; margin-bottom: 4px; }
        .challenge-desc { font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
        .challenge-progress { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
        .challenge-progress-fill { height: 100%; background: linear-gradient(90deg, #ff6b9d, #a445b2); border-radius: 3px; }
        .challenge-meta { display: flex; gap: 12px; font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 6px; }
        .challenge-xp { background: rgba(255,107,157,0.15); color: #ff6b9d; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 0.75rem; }
      </style>
    `;
    
    // Tab switching
    container.querySelectorAll('.challenge-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.challenge-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const isDaily = tab.dataset.tab === 'daily';
        container.querySelector('#daily-challenges').style.display = isDaily ? 'block' : 'none';
        container.querySelector('#weekly-challenges').style.display = isDaily ? 'none' : 'block';
      });
    });
  }
  
  renderChallengeCard(challenge) {
    return `
      <div class="challenge-card">
        <div class="challenge-icon">${challenge.icon}</div>
        <div class="challenge-info">
          <div class="challenge-title">${challenge.title}</div>
          <div class="challenge-desc">${challenge.description}</div>
          <div class="challenge-progress">
            <div class="challenge-progress-fill" style="width: 0%"></div>
          </div>
          <div class="challenge-meta">
            <span>0/${challenge.requirement_target}</span>
            <span class="challenge-xp">+${challenge.xp_reward} XP</span>
          </div>
        </div>
      </div>
    `;
  }

  // ============ ACHIEVEMENTS ============
  
  renderAchievementsSection() {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    // Check which achievements are unlocked
    const processed = this.achievements.map(a => ({
      ...a,
      unlocked: a.check ? a.check() : false
    }));
    
    // Group by category
    const categories = {};
    processed.forEach(a => {
      const cat = a.category || 'other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(a);
    });
    
    const unlockedCount = processed.filter(a => a.unlocked).length;
    const totalCount = processed.length;
    
    const categoryNames = {
      games: '🎮 Games Played',
      variety: '🎲 Variety',
      '2048': '🔢 2048',
      snake: '🐍 Snake',
      'sky-hop': '☁️ Sky Hop',
      typing: '⌨️ Typing Test',
      reaction: '⚡ Reaction Time',
      aim: '🎯 Aim Trainer',
      memory: '🧠 Memory Games',
      puzzles: '🧩 Puzzles',
      other: '🎮 Other Games'
    };
    
    container.innerHTML = `
      <div class="achievements-section">
        <div class="achievements-header">
          <div class="achievements-progress">
            <span class="achievements-count">${unlockedCount}/${totalCount}</span>
            <span class="achievements-label">Achievements Unlocked</span>
          </div>
          <div class="achievements-bar">
            <div class="achievements-bar-fill" style="width: ${(unlockedCount/totalCount)*100}%"></div>
          </div>
        </div>
        
        <div class="achievements-categories">
          ${Object.entries(categories).map(([cat, achs]) => `
            <div class="achievement-category">
              <div class="category-header" onclick="this.parentElement.classList.toggle('collapsed')">
                <span>${categoryNames[cat] || cat}</span>
                <span class="category-count">${achs.filter(a => a.unlocked).length}/${achs.length}</span>
                <span class="category-toggle">▼</span>
              </div>
              <div class="category-list">
                ${achs.map(a => this.renderAchievementCard(a)).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <style>
        .achievements-header { margin-bottom: 20px; }
        .achievements-progress { display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px; }
        .achievements-count { font-size: 1.5rem; font-weight: 700; color: #ff6b9d; }
        .achievements-label { color: rgba(255,255,255,0.6); }
        .achievements-bar { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
        .achievements-bar-fill { height: 100%; background: linear-gradient(90deg, #ff6b9d, #a445b2); }
        
        .achievement-category { margin-bottom: 16px; }
        .category-header {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
          cursor: pointer;
        }
        .category-header:hover { background: rgba(255,255,255,0.06); }
        .category-header span:first-child { flex: 1; font-weight: 600; }
        .category-count { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
        .category-toggle { color: rgba(255,255,255,0.4); transition: transform 0.2s; }
        .achievement-category.collapsed .category-toggle { transform: rotate(-90deg); }
        .achievement-category.collapsed .category-list { display: none; }
        
        .category-list { padding: 12px 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
        
        .achievement-card {
          display: flex; align-items: center; gap: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
        }
        .achievement-card.unlocked { border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.05); }
        .achievement-card.locked { opacity: 0.5; }
        
        .achievement-icon {
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .achievement-card.unlocked .achievement-icon { background: rgba(52,211,153,0.15); }
        
        .achievement-info { flex: 1; }
        .achievement-title { font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .achievement-desc { font-size: 0.8rem; color: rgba(255,255,255,0.5); }
        .achievement-xp { font-size: 0.75rem; color: #ff6b9d; font-weight: 600; }
        
        .rarity-badge { font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
        .rarity-common { background: rgba(148,163,184,0.2); color: #94a3b8; }
        .rarity-uncommon { background: rgba(34,197,94,0.2); color: #22c55e; }
        .rarity-rare { background: rgba(59,130,246,0.2); color: #3b82f6; }
        .rarity-epic { background: rgba(168,85,247,0.2); color: #a855f7; }
        .rarity-legendary { background: rgba(251,191,36,0.2); color: #fbbf24; }
      </style>
    `;
  }
  
  renderAchievementCard(a) {
    return `
      <div class="achievement-card ${a.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-info">
          <div class="achievement-title">
            ${a.title}
            <span class="rarity-badge rarity-${a.rarity}">${a.rarity}</span>
          </div>
          <div class="achievement-desc">${a.description}</div>
          <div class="achievement-xp">+${a.xp_reward} XP</div>
        </div>
      </div>
    `;
  }

  // ============ REFERRALS ============
  
  async renderReferralSection() {
    const container = document.getElementById('referrals-container');
    if (!container) return;
    
    const shareUrl = `${window.location.origin}?ref=${this.referralCode}`;
    
    container.innerHTML = `
      <div class="referral-section">
        <div class="referral-header">
          <h3>🎁 Invite Friends & Earn Rewards</h3>
          <p>Share your referral code and both you and your friend get bonus XP!</p>
        </div>
        
        <div class="referral-rewards">
          <div class="reward-item"><span>🎮</span> You get <strong>500 XP</strong> per referral</div>
          <div class="reward-item"><span>🎉</span> Friends get <strong>250 XP</strong> bonus</div>
          <div class="reward-item"><span>🏆</span> Unlock exclusive achievements</div>
        </div>
        
        <div class="referral-code-box">
          <div class="code-label">Your Referral Code</div>
          <div class="code-display">
            <span class="code-text">${this.referralCode}</span>
            <button class="copy-btn" onclick="navigator.clipboard.writeText('${this.referralCode}'); this.textContent='Copied!'">Copy</button>
          </div>
        </div>
        
        <div class="share-section">
          <div class="share-label">Share Link</div>
          <div class="share-box">
            <input type="text" value="${shareUrl}" readonly>
            <button class="copy-btn" onclick="navigator.clipboard.writeText('${shareUrl}'); this.textContent='Copied!'">Copy</button>
          </div>
        </div>
        
        <div class="referral-stats">
          <div class="ref-stat"><div class="ref-value">${this.referralStats.total}</div><div class="ref-label">Referrals</div></div>
          <div class="ref-stat"><div class="ref-value">${this.referralStats.successful}</div><div class="ref-label">Successful</div></div>
          <div class="ref-stat"><div class="ref-value">${this.referralStats.xpEarned}</div><div class="ref-label">XP Earned</div></div>
        </div>
      </div>
      
      <style>
        .referral-header h3 { margin-bottom: 8px; }
        .referral-header p { color: rgba(255,255,255,0.6); }
        
        .referral-rewards { display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0; }
        .reward-item {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
        }
        .reward-item strong { color: #ff6b9d; }
        
        .referral-code-box {
          background: linear-gradient(135deg, rgba(255,107,157,0.1), rgba(164,69,178,0.1));
          border: 1px solid rgba(255,107,157,0.3);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .code-label { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-bottom: 8px; text-transform: uppercase; }
        .code-display { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .code-text { font-size: 2rem; font-weight: 700; letter-spacing: 4px; }
        
        .copy-btn {
          padding: 8px 16px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
        .copy-btn:hover { background: rgba(255,255,255,0.15); }
        
        .share-section { margin-bottom: 20px; }
        .share-label { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
        .share-box { display: flex; gap: 8px; }
        .share-box input {
          flex: 1; padding: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: white;
        }
        
        .referral-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .ref-stat { text-align: center; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 10px; }
        .ref-value { font-size: 1.5rem; font-weight: 700; color: #ff6b9d; }
        .ref-label { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
      </style>
    `;
  }

  // ============ STATS ============
  
  renderStatsSection() {
    const container = document.getElementById('stats-container');
    if (!container) return;
    
    const profile = this.userProfile || {};
    const xp = profile.xp || 0;
    const level = Math.floor(xp / 1000) + 1;
    const xpInLevel = xp % 1000;
    
    container.innerHTML = `
      <div class="stats-section">
        <div class="level-card">
          <div class="level-display">
            <div class="level-badge">LVL ${level}</div>
            <div class="level-info">
              <div class="xp-text">${xp.toLocaleString()} XP</div>
              <div class="xp-bar"><div class="xp-fill" style="width: ${(xpInLevel/1000)*100}%"></div></div>
              <div class="xp-next">${1000 - xpInLevel} XP to level ${level + 1}</div>
            </div>
          </div>
        </div>
        
        <div class="overview-stats">
          <div class="stat-box"><div class="stat-val">${this.totalGamesPlayed}</div><div class="stat-lbl">Games Played</div></div>
          <div class="stat-box"><div class="stat-val">${Object.keys(this.gameStats).length}</div><div class="stat-lbl">Games Tried</div></div>
          <div class="stat-box"><div class="stat-val">${Object.keys(this.SOLO_GAMES).length - Object.keys(this.gameStats).length}</div><div class="stat-lbl">Games Left</div></div>
        </div>
        
        <h3 class="section-title">🎮 Solo Games</h3>
        <div class="games-grid">
          ${Object.entries(this.SOLO_GAMES).map(([id, config]) => this.renderGameStatCard(id, config)).join('')}
        </div>
      </div>
      
      <style>
        .level-card {
          background: linear-gradient(135deg, rgba(255,107,157,0.1), rgba(164,69,178,0.1));
          border: 1px solid rgba(255,107,157,0.3);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .level-display { display: flex; align-items: center; gap: 20px; }
        .level-badge {
          font-size: 1.5rem; font-weight: 800;
          background: linear-gradient(135deg, #ff6b9d, #a445b2);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          padding: 12px 20px;
          border: 2px solid rgba(255,107,157,0.4);
          border-radius: 12px;
        }
        .level-info { flex: 1; }
        .xp-text { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
        .xp-bar { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
        .xp-fill { height: 100%; background: linear-gradient(90deg, #ff6b9d, #a445b2); }
        .xp-next { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 6px; }
        
        .overview-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .stat-box { text-align: center; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 10px; }
        .stat-val { font-size: 1.5rem; font-weight: 700; color: #ff6b9d; }
        .stat-lbl { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
        
        .section-title { margin: 20px 0 12px; font-size: 1rem; }
        
        .games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .game-stat-card {
          display: flex; align-items: center; gap: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
        }
        .game-stat-card.played { border-color: rgba(255,107,157,0.3); }
        .game-stat-card.not-played { opacity: 0.5; }
        .game-icon { font-size: 1.5rem; width: 40px; text-align: center; }
        .game-info { flex: 1; }
        .game-name { font-weight: 600; font-size: 0.85rem; }
        .game-best { font-size: 0.8rem; color: #ff6b9d; font-weight: 600; }
        .game-plays { font-size: 0.7rem; color: rgba(255,255,255,0.4); }
      </style>
    `;
  }
  
  renderGameStatCard(gameId, config) {
    const stats = this.gameStats[gameId];
    const played = stats && stats.plays > 0;
    
    let bestDisplay = '--';
    if (stats?.best !== null && stats?.best !== undefined) {
      bestDisplay = stats.best + (config.suffix || '');
    }
    
    return `
      <div class="game-stat-card ${played ? 'played' : 'not-played'}">
        <div class="game-icon">${config.icon}</div>
        <div class="game-info">
          <div class="game-name">${config.name}</div>
          ${played ? `<div class="game-best">Best: ${bestDisplay}</div>` : ''}
          <div class="game-plays">${stats?.plays || 0} plays</div>
        </div>
      </div>
    `;
  }
}

// Export
window.ProfileEngagementUI = ProfileEngagementUI;
