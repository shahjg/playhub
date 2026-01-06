/**
 * TheGaming.co Profile Engagement UI
 * Renders challenges, achievements, and referral sections on profile page
 * 
 * Usage:
 *   <div id="challenges-container"></div>
 *   <div id="achievements-container"></div>
 *   <div id="referral-container"></div>
 *   
 *   <script>
 *     const profileUI = new ProfileEngagementUI(supabaseClient);
 *     await profileUI.init();
 *   </script>
 */

class ProfileEngagementUI {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.engagement = null;
    this.currentUser = null;
  }

  async init() {
    // Get current user
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session?.user) return;
    
    this.currentUser = session.user;
    
    // Initialize engagement system
    if (window.EngagementSystem) {
      this.engagement = new EngagementSystem(this.supabase);
      await this.engagement.init();
    }
    
    // Render sections
    this.renderChallengesSection();
    this.renderAchievementsSection();
    this.renderReferralSection();
    this.renderStatsSection();
  }

  async renderChallengesSection() {
    const container = document.getElementById('challenges-container');
    if (!container) return;

    // Get user stats to calculate progress
    const stats = this.engagement?.userStats || {};
    const gamesPlayedToday = stats.games_played_today || 0;
    const gamesPlayedWeek = stats.games_played_week || 0;
    const uniqueGamesWeek = stats.unique_games_week || 0;

    // Define daily challenges
    const dailyChallenges = [
      { id: 'first-game', icon: '🎮', title: 'First Game', description: 'Play 1 game today', target: 1, progress: Math.min(gamesPlayedToday, 1), xp: 25 },
      { id: 'triple-play', icon: '🎲', title: 'Triple Play', description: 'Play 3 games today', target: 3, progress: Math.min(gamesPlayedToday, 3), xp: 50 },
      { id: 'high-five', icon: '🖐️', title: 'High Five', description: 'Play 5 games today', target: 5, progress: Math.min(gamesPlayedToday, 5), xp: 75 },
      { id: 'brain-trainer', icon: '🧠', title: 'Brain Trainer', description: 'Play a memory game', target: 1, progress: stats.memory_games_today || 0, xp: 40 },
      { id: 'speed-demon', icon: '⚡', title: 'Speed Demon', description: 'Play Reaction Time', target: 1, progress: stats.reaction_games_today || 0, xp: 35 }
    ];

    // Define weekly challenges
    const weeklyChallenges = [
      { id: 'dedicated-player', icon: '🏆', title: 'Dedicated Player', description: 'Play 20 games this week', target: 20, progress: Math.min(gamesPlayedWeek, 20), xp: 200 },
      { id: 'variety-pack', icon: '🎯', title: 'Variety Pack', description: 'Play 5 different games', target: 5, progress: Math.min(uniqueGamesWeek, 5), xp: 150 },
      { id: '2048-expert', icon: '🔲', title: '2048 Expert', description: 'Reach the 2048 tile', target: 2048, progress: stats.best_2048_tile || 0, xp: 300 },
      { id: 'snake-century', icon: '🐍', title: 'Snake Century', description: 'Score 100+ in Snake', target: 100, progress: stats.best_snake_score || 0, xp: 250 },
      { id: 'typing-pro', icon: '⌨️', title: 'Typing Pro', description: 'Achieve 70+ WPM', target: 70, progress: stats.best_typing_wpm || 0, xp: 200 }
    ];

    container.innerHTML = `
      <div class="challenges-wrapper">
        <div class="challenge-tabs">
          <button class="challenge-tab active" data-tab="daily">Daily Challenges</button>
          <button class="challenge-tab" data-tab="weekly">Weekly Challenges</button>
        </div>

        <div class="challenge-content" id="daily-challenges">
          ${dailyChallenges.map(c => this.renderChallengeCard(c)).join('')}
        </div>

        <div class="challenge-content hidden" id="weekly-challenges">
          ${weeklyChallenges.map(c => this.renderChallengeCard(c)).join('')}
        </div>
      </div>
    `;

    // Tab switching
    container.querySelectorAll('.challenge-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.challenge-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        container.querySelectorAll('.challenge-content').forEach(c => c.classList.add('hidden'));
        document.getElementById(`${tab.dataset.tab}-challenges`).classList.remove('hidden');
      });
    });
  }

  renderChallengeCard(challenge) {
    const progress = Math.min(challenge.progress / challenge.target, 1);
    const completed = challenge.progress >= challenge.target;
    const progressPercent = Math.round(progress * 100);

    return `
      <div class="challenge-card ${completed ? 'completed' : ''}">
        <div class="challenge-icon">${challenge.icon}</div>
        <div class="challenge-content-inner">
          <div class="challenge-header">
            <div class="challenge-info">
              <h4>${challenge.title}</h4>
              <p>${challenge.description}</p>
            </div>
            <div class="challenge-reward">
              <span class="xp-badge">+${challenge.xp} XP</span>
            </div>
          </div>
          <div class="challenge-progress-bar">
            <div class="challenge-progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <div class="challenge-footer">
            <span class="progress-text">${challenge.progress.toLocaleString()} / ${challenge.target.toLocaleString()}</span>
            ${completed ? `<span class="completed-badge">✓ Complete</span>` : `<span class="progress-percent">${progressPercent}%</span>`}
          </div>
        </div>
      </div>
    `;
  }

  async renderAchievementsSection() {
    const container = document.getElementById('achievements-container');
    if (!container) return;

    // Fetch actual stats from solo_scores
    const playerStats = await this.fetchPlayerStats();

    // Define all achievements with requirements
    const achievements = [
      // Play count achievements
      { id: 'first-steps', icon: '👣', title: 'First Steps', description: 'Play your first game', category: 'milestone', rarity: 'common', xp: 25, type: 'games_played', target: 1 },
      { id: 'getting-started', icon: '🎮', title: 'Getting Started', description: 'Play 10 games', category: 'milestone', rarity: 'common', xp: 50, type: 'games_played', target: 10 },
      { id: 'dedicated', icon: '🏃', title: 'Dedicated Player', description: 'Play 50 games', category: 'milestone', rarity: 'uncommon', xp: 100, type: 'games_played', target: 50 },
      { id: 'veteran', icon: '🎖️', title: 'Veteran', description: 'Play 100 games', category: 'milestone', rarity: 'rare', xp: 200, type: 'games_played', target: 100 },
      { id: 'legend', icon: '👑', title: 'Living Legend', description: 'Play 500 games', category: 'milestone', rarity: 'legendary', xp: 500, type: 'games_played', target: 500 },

      // Variety achievements
      { id: 'explorer', icon: '🗺️', title: 'Explorer', description: 'Try 5 different games', category: 'variety', rarity: 'common', xp: 50, type: 'unique_games', target: 5 },
      { id: 'jack-of-all', icon: '🃏', title: 'Jack of All Trades', description: 'Try 10 different games', category: 'variety', rarity: 'uncommon', xp: 100, type: 'unique_games', target: 10 },
      { id: 'completionist', icon: '✅', title: 'Completionist', description: 'Play every game at least once', category: 'variety', rarity: 'rare', xp: 250, type: 'unique_games', target: 19 },

      // Game-specific achievements - Reaction Time
      { id: 'quick-reflex', icon: '⚡', title: 'Quick Reflexes', description: 'Get under 300ms in Reaction Time', category: 'skill', rarity: 'common', xp: 50, type: 'reaction-time', target: 300, compare: 'less' },
      { id: 'lightning', icon: '🌩️', title: 'Lightning Fast', description: 'Get under 200ms in Reaction Time', category: 'skill', rarity: 'rare', xp: 150, type: 'reaction-time', target: 200, compare: 'less' },

      // Game-specific achievements - Typing
      { id: 'typist', icon: '⌨️', title: 'Typist', description: 'Reach 50 WPM in Typing Test', category: 'skill', rarity: 'common', xp: 50, type: 'typing-test-60', target: 50, compare: 'greater' },
      { id: 'speed-typist', icon: '💨', title: 'Speed Typist', description: 'Reach 80 WPM in Typing Test', category: 'skill', rarity: 'uncommon', xp: 100, type: 'typing-test-60', target: 80, compare: 'greater' },
      { id: 'keyboard-master', icon: '🏆', title: 'Keyboard Master', description: 'Reach 100 WPM in Typing Test', category: 'skill', rarity: 'epic', xp: 200, type: 'typing-test-60', target: 100, compare: 'greater' },

      // Game-specific achievements - 2048
      { id: '2048-256', icon: '🔲', title: '2048 Beginner', description: 'Reach the 256 tile in 2048', category: 'skill', rarity: 'common', xp: 50, type: '2048', target: 256, compare: 'greater' },
      { id: '2048-512', icon: '🟨', title: '2048 Intermediate', description: 'Reach the 512 tile in 2048', category: 'skill', rarity: 'uncommon', xp: 100, type: '2048', target: 512, compare: 'greater' },
      { id: '2048-1024', icon: '🟧', title: '2048 Advanced', description: 'Reach the 1024 tile in 2048', category: 'skill', rarity: 'rare', xp: 150, type: '2048', target: 1024, compare: 'greater' },
      { id: '2048-winner', icon: '🏅', title: '2048 Master', description: 'Reach the 2048 tile!', category: 'skill', rarity: 'epic', xp: 300, type: '2048', target: 2048, compare: 'greater' },

      // Game-specific achievements - Snake
      { id: 'snake-50', icon: '🐍', title: 'Snake Charmer', description: 'Score 50+ in Snake', category: 'skill', rarity: 'common', xp: 50, type: 'snake', target: 50, compare: 'greater' },
      { id: 'snake-100', icon: '🐍', title: 'Snake Master', description: 'Score 100+ in Snake', category: 'skill', rarity: 'uncommon', xp: 100, type: 'snake', target: 100, compare: 'greater' },
      { id: 'snake-200', icon: '🐉', title: 'Snake Legend', description: 'Score 200+ in Snake', category: 'skill', rarity: 'rare', xp: 200, type: 'snake', target: 200, compare: 'greater' },

      // Memory achievements
      { id: 'memory-5', icon: '🧠', title: 'Good Memory', description: 'Reach level 5 in Sequence Memory', category: 'skill', rarity: 'common', xp: 50, type: 'sequence-memory', target: 5, compare: 'greater' },
      { id: 'memory-10', icon: '🧠', title: 'Great Memory', description: 'Reach level 10 in Sequence Memory', category: 'skill', rarity: 'uncommon', xp: 100, type: 'sequence-memory', target: 10, compare: 'greater' },
      { id: 'chimp-10', icon: '🐵', title: 'Chimp Challenger', description: 'Reach level 10 in Chimp Test', category: 'skill', rarity: 'rare', xp: 150, type: 'chimp-test', target: 10, compare: 'greater' },

      // Aim Trainer
      { id: 'sharpshooter', icon: '🎯', title: 'Sharpshooter', description: 'Get under 400ms average in Aim Trainer', category: 'skill', rarity: 'uncommon', xp: 100, type: 'aim-trainer-30', target: 400, compare: 'less' },
    ];

    // Check which achievements are unlocked
    const checkedAchievements = achievements.map(a => ({
      ...a,
      ...this.checkAchievement(a, playerStats)
    }));

    const unlockedCount = checkedAchievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;

    container.innerHTML = `
      <div class="achievements-wrapper">
        <div class="achievements-header">
          <span class="achievements-count">${unlockedCount} / ${totalCount} Unlocked</span>
          <div class="achievements-xp">🏆 ${checkedAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp, 0)} XP earned</div>
        </div>

        <div class="achievements-grid">
          ${checkedAchievements.map(a => this.renderAchievementCard(a)).join('')}
        </div>
      </div>
    `;
  }

  async fetchPlayerStats() {
    if (!this.supabase || !this.currentUser) {
      return { gamesPlayed: 0, uniqueGames: 0, gameScores: {} };
    }

    try {
      // Fetch all solo_scores for this user
      const { data: entries, error } = await this.supabase
        .from('solo_scores')
        .select('game_id, score')
        .eq('user_id', this.currentUser.id);

      if (error || !entries) {
        console.error('[Achievements] Error fetching stats:', error);
        return { gamesPlayed: 0, uniqueGames: 0, gameScores: {} };
      }

      // Calculate stats
      const gamesPlayed = entries.length;
      const gameScores = {};
      const gameCounts = {};

      entries.forEach(e => {
        gameCounts[e.game_id] = (gameCounts[e.game_id] || 0) + 1;

        // Track best scores (lower is better for time-based, higher for score-based)
        const isTimeBased = ['reaction-time', 'aim-trainer-30', 'minesweeper', 'sudoku', 'word-search', 'nonogram'].includes(e.game_id);

        if (!gameScores[e.game_id]) {
          gameScores[e.game_id] = e.score;
        } else if (isTimeBased) {
          gameScores[e.game_id] = Math.min(gameScores[e.game_id], e.score);
        } else {
          gameScores[e.game_id] = Math.max(gameScores[e.game_id], e.score);
        }
      });

      const uniqueGames = Object.keys(gameCounts).length;

      console.log('[Achievements] Player stats:', { gamesPlayed, uniqueGames, gameScores });

      return { gamesPlayed, uniqueGames, gameScores, gameCounts };
    } catch (err) {
      console.error('[Achievements] Exception:', err);
      return { gamesPlayed: 0, uniqueGames: 0, gameScores: {} };
    }
  }

  checkAchievement(achievement, stats) {
    let progress = 0;
    let unlocked = false;
    let currentValue = 0;

    switch (achievement.type) {
      case 'games_played':
        currentValue = stats.gamesPlayed || 0;
        progress = Math.min(currentValue / achievement.target, 1);
        unlocked = currentValue >= achievement.target;
        break;

      case 'unique_games':
        currentValue = stats.uniqueGames || 0;
        progress = Math.min(currentValue / achievement.target, 1);
        unlocked = currentValue >= achievement.target;
        break;

      default:
        // Game-specific achievement - check best score
        const score = stats.gameScores?.[achievement.type];
        if (score !== undefined) {
          currentValue = score;
          if (achievement.compare === 'less') {
            // Lower is better (reaction time, aim trainer)
            unlocked = score <= achievement.target;
            progress = unlocked ? 1 : Math.min(achievement.target / score, 0.99);
          } else {
            // Higher is better (typing, 2048, snake)
            unlocked = score >= achievement.target;
            progress = Math.min(score / achievement.target, 1);
          }
        }
        break;
    }

    return { unlocked, progress, currentValue };
  }

  renderAchievementCard(achievement) {
    const progressPercent = Math.round(achievement.progress * 100);
    const rarityColors = {
      common: '#9ca3af',
      uncommon: '#22c55e',
      rare: '#3b82f6',
      epic: '#a855f7',
      legendary: '#fbbf24'
    };

    return `
      <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
        ${achievement.unlocked ? '<div class="achievement-checkmark">✓</div>' : ''}
        <div class="achievement-icon-wrapper ${achievement.unlocked ? 'unlocked' : ''}">
          <span class="achievement-icon">${achievement.icon}</span>
        </div>
        <div class="achievement-details">
          <h4 class="achievement-title">${achievement.title}</h4>
          <p class="achievement-desc">${achievement.description}</p>
          <div class="achievement-meta">
            <span class="achievement-rarity" style="color: ${rarityColors[achievement.rarity]}">${achievement.rarity}</span>
            <span class="achievement-xp">+${achievement.xp} XP</span>
          </div>
          ${!achievement.unlocked ? `
            <div class="achievement-progress-bar">
              <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="achievement-progress-text">${progressPercent}%</div>
          ` : `
            <div class="achievement-unlocked-badge">🎉 Unlocked!</div>
          `}
        </div>
      </div>
    `;
  }

  async renderReferralSection() {
    const container = document.getElementById('referrals-container');
    if (!container) return;

    // Get referral code - generate if null
    let code = this.engagement ? await this.engagement.getReferralCode() : null;
    if (!code || code === 'null') {
      // Generate a random code if none exists
      code = this.currentUser ? this.currentUser.id.substring(0, 8).toUpperCase() : 'GAMER' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    const stats = this.engagement ? await this.engagement.getReferralStats() : { totalReferrals: 0 };
    const totalReferrals = stats.totalReferrals || 0;
    const shareUrl = `${window.location.origin}/signup?ref=${code}`;

    // Calculate tier
    const tiers = [
      { name: 'Bronze', icon: '🥉', required: 1, color: '#cd7f32' },
      { name: 'Silver', icon: '🥈', required: 5, color: '#c0c0c0' },
      { name: 'Gold', icon: '🥇', required: 10, color: '#ffd700' },
      { name: 'Platinum', icon: '💎', required: 25, color: '#e5e4e2' }
    ];

    let currentTier = null;
    let nextTier = tiers[0];
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (totalReferrals >= tiers[i].required) {
        currentTier = tiers[i];
        nextTier = tiers[i + 1] || null;
        break;
      }
    }

    const tierProgress = nextTier
      ? Math.min(((totalReferrals - (currentTier?.required || 0)) / (nextTier.required - (currentTier?.required || 0))) * 100, 100)
      : 100;

    container.innerHTML = `
      <div class="referral-wrapper">
        <!-- How it works -->
        <div class="how-it-works">
          <h3>How It Works</h3>
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-icon">📋</div>
              <div class="step-text">Share your code</div>
            </div>
            <div class="step-arrow">→</div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-icon">👥</div>
              <div class="step-text">Friends sign up</div>
            </div>
            <div class="step-arrow">→</div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-icon">🎁</div>
              <div class="step-text">Both get XP!</div>
            </div>
          </div>
        </div>

        <!-- Referral Code Box -->
        <div class="referral-code-section">
          <div class="code-label">Your Referral Code</div>
          <div class="code-box">
            <span class="referral-code">${code}</span>
            <button class="copy-code-btn" onclick="navigator.clipboard.writeText('${shareUrl}').then(() => { this.innerHTML = '✓ Copied!'; this.classList.add('copied'); setTimeout(() => { this.innerHTML = '📋 Copy Link'; this.classList.remove('copied'); }, 2000); })">
              📋 Copy Link
            </button>
          </div>
        </div>

        <!-- Share Buttons -->
        <div class="share-section">
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Join me on TheGaming.co! Use my referral code ' + code + ' to get bonus XP! 🎮')}&url=${encodeURIComponent(shareUrl)}" target="_blank" class="share-btn-large twitter">
            <span class="share-icon">𝕏</span>
            <span class="share-text">Share on X</span>
          </a>
          <a href="https://wa.me/?text=${encodeURIComponent('Join me on TheGaming.co! 🎮 Use my code: ' + code + ' to get bonus XP! ' + shareUrl)}" target="_blank" class="share-btn-large whatsapp">
            <span class="share-icon">💬</span>
            <span class="share-text">WhatsApp</span>
          </a>
          <a href="mailto:?subject=${encodeURIComponent('Join me on TheGaming.co!')}&body=${encodeURIComponent('Hey! Join me on TheGaming.co and use my referral code ' + code + ' to get bonus XP! ' + shareUrl)}" class="share-btn-large email">
            <span class="share-icon">📧</span>
            <span class="share-text">Email</span>
          </a>
        </div>

        <!-- Tier Progress -->
        <div class="tier-section">
          <div class="tier-header">
            <div class="current-tier">
              ${currentTier ? `<span class="tier-icon">${currentTier.icon}</span> ${currentTier.name}` : '🎯 Getting Started'}
            </div>
            <div class="referral-count">${totalReferrals} referral${totalReferrals !== 1 ? 's' : ''}</div>
          </div>
          ${nextTier ? `
            <div class="tier-progress">
              <div class="tier-progress-bar">
                <div class="tier-progress-fill" style="width: ${tierProgress}%"></div>
              </div>
              <div class="tier-next">
                <span>${nextTier.icon} ${nextTier.name}</span>
                <span>${nextTier.required - totalReferrals} more to go</span>
              </div>
            </div>
          ` : `
            <div class="tier-max">🏆 Maximum tier reached!</div>
          `}
          <div class="tier-rewards">
            ${tiers.map(t => `
              <div class="tier-badge ${totalReferrals >= t.required ? 'unlocked' : 'locked'}">
                <span class="tier-badge-icon">${t.icon}</span>
                <span class="tier-badge-name">${t.name}</span>
                <span class="tier-badge-req">${t.required}+</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Stats -->
        <div class="referral-stats-row">
          <div class="ref-stat">
            <div class="ref-stat-value">${totalReferrals}</div>
            <div class="ref-stat-label">Friends Invited</div>
          </div>
          <div class="ref-stat">
            <div class="ref-stat-value">${(totalReferrals * 500).toLocaleString()}</div>
            <div class="ref-stat-label">XP Earned</div>
          </div>
          <div class="ref-stat">
            <div class="ref-stat-value">250</div>
            <div class="ref-stat-label">Friend Bonus</div>
          </div>
        </div>
      </div>
    `;
  }

  renderStatsSection() {
    const container = document.getElementById('stats-container');
    if (!container || !this.engagement?.userStats) return;

    const stats = this.engagement.userStats;

    container.innerHTML = `
      <div class="profile-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">📊</span>
            YOUR STATS
          </h2>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">🎮</span>
            <span class="stat-value">${stats.total_games_played || 0}</span>
            <span class="stat-label">Games Played</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🏆</span>
            <span class="stat-value">${stats.total_wins || 0}</span>
            <span class="stat-label">Wins</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🔥</span>
            <span class="stat-value">${stats.best_win_streak || 0}</span>
            <span class="stat-label">Best Streak</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📅</span>
            <span class="stat-value">${stats.daily_login_streak || 0}</span>
            <span class="stat-label">Day Streak</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">⏱️</span>
            <span class="stat-value">${Math.floor((stats.total_playtime_minutes || 0) / 60)}h</span>
            <span class="stat-label">Play Time</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">👥</span>
            <span class="stat-value">${stats.friends_count || 0}</span>
            <span class="stat-label">Friends</span>
          </div>
        </div>
      </div>
    `;
  }
}

// Inject required styles
const profileEngagementStyles = `
<style id="profile-engagement-styles">
  .profile-section {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.4rem;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-icon {
    font-size: 1.5rem;
  }

  .challenge-tabs {
    display: flex;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px;
    border-radius: 10px;
  }

  .challenge-tab {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.2s;
  }

  .challenge-tab:hover {
    color: rgba(255, 255, 255, 0.8);
  }

  .challenge-tab.active {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .challenge-content.hidden {
    display: none;
  }

  .challenge-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    transition: all 0.2s;
  }

  .challenge-card.completed {
    border-color: rgba(34, 197, 94, 0.3);
    background: rgba(34, 197, 94, 0.05);
  }

  .challenge-card.claimed {
    opacity: 0.6;
  }

  .challenge-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  .challenge-info h4 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .challenge-info p {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .xp-badge {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #000;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .challenge-progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .challenge-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #4ade80);
    border-radius: 3px;
    transition: width 0.3s;
  }

  .challenge-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .progress-text {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .challenge-claim-btn {
    padding: 8px 16px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .challenge-claim-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
  }

  .claimed-badge {
    color: #22c55e;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .achievement-count {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem;
    color: #fbbf24;
  }

  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }

  .achievement-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    gap: 14px;
    transition: all 0.2s;
  }

  .achievement-card.locked {
    opacity: 0.5;
    filter: grayscale(0.5);
  }

  .achievement-card.unlocked {
    border-color: rgba(251, 191, 36, 0.3);
    background: rgba(251, 191, 36, 0.05);
  }

  .achievement-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    flex-shrink: 0;
  }

  .achievement-info {
    flex: 1;
    min-width: 0;
  }

  .achievement-info h4 {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .achievement-info p {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 8px;
  }

  .achievement-meta {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 8px;
  }

  .rarity {
    font-size: 0.7rem;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .rarity-common { background: rgba(156, 163, 175, 0.2); color: #9ca3af; }
  .rarity-uncommon { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
  .rarity-rare { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
  .rarity-epic { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
  .rarity-legendary { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }

  .xp-reward {
    font-size: 0.75rem;
    color: #6366f1;
    font-weight: 600;
  }

  .achievement-progress {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .achievement-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #a855f7, #ec4899);
    border-radius: 2px;
  }

  .progress-percent {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .achievement-claim-btn {
    padding: 6px 12px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    border: none;
    border-radius: 6px;
    color: #000;
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .unlocked-date {
    font-size: 0.75rem;
    color: #22c55e;
  }

  /* Referral Section */
  .referral-card {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1));
    border: 1px solid rgba(236, 72, 153, 0.2);
    border-radius: 16px;
    padding: 24px;
  }

  .referral-info p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 16px;
  }

  .referral-benefits {
    list-style: none;
    margin-bottom: 20px;
  }

  .referral-benefits li {
    padding: 8px 0;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .referral-code-box {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    margin-bottom: 20px;
  }

  .referral-code-box label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .code-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 10px;
  }

  .code-display .code {
    font-family: 'Bebas Neue', monospace;
    font-size: 2rem;
    letter-spacing: 4px;
    color: #fff;
  }

  .copy-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .referral-stats {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-bottom: 20px;
  }

  .referral-stat {
    text-align: center;
  }

  .referral-stat .stat-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2rem;
    color: #fff;
    display: block;
  }

  .referral-stat .stat-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .share-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .share-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .share-btn.twitter {
    background: #1da1f2;
    color: #fff;
  }

  .share-btn.whatsapp {
    background: #25d366;
    color: #fff;
  }

  .share-btn:hover {
    transform: translateY(-2px);
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .stat-card .stat-icon {
    font-size: 1.5rem;
  }

  .stat-card .stat-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem;
    color: #fff;
  }

  .stat-card .stat-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .empty-state {
    text-align: center;
    padding: 30px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* ========== CHALLENGES STYLES ========== */
  .challenges-wrapper {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    padding: 20px;
  }

  .challenge-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 4px;
  }

  .challenge-tab {
    flex: 1;
    padding: 12px 20px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.2s;
  }

  .challenge-tab:hover { color: rgba(255, 255, 255, 0.8); }
  .challenge-tab.active { background: rgba(255, 255, 255, 0.1); color: #fff; }

  .challenge-card {
    display: flex;
    gap: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    transition: all 0.2s;
  }

  .challenge-card:hover { border-color: rgba(255, 255, 255, 0.2); }
  .challenge-card.completed { border-color: rgba(34, 197, 94, 0.4); background: rgba(34, 197, 94, 0.08); }

  .challenge-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    flex-shrink: 0;
  }

  .challenge-content-inner { flex: 1; min-width: 0; }
  .challenge-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
  .challenge-info h4 { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
  .challenge-info p { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }

  .challenge-progress-bar { height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
  .challenge-progress-fill { height: 100%; background: linear-gradient(90deg, #22c55e, #4ade80); border-radius: 4px; transition: width 0.3s; }

  .challenge-footer { display: flex; justify-content: space-between; align-items: center; }
  .progress-text { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }
  .progress-percent { font-size: 0.8rem; color: rgba(255, 255, 255, 0.4); }
  .completed-badge { color: #22c55e; font-weight: 600; font-size: 0.85rem; }

  .xp-badge {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #000;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    white-space: nowrap;
  }

  /* ========== REFERRAL STYLES ========== */
  .referral-wrapper {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    padding: 24px;
  }

  .how-it-works { margin-bottom: 24px; text-align: center; }
  .how-it-works h3 { font-size: 1rem; font-weight: 600; margin-bottom: 16px; color: rgba(255, 255, 255, 0.7); }
  .steps { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
  .step { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 20px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; min-width: 100px; }
  .step-number { width: 24px; height: 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }
  .step-icon { font-size: 1.5rem; }
  .step-text { font-size: 0.8rem; color: rgba(255, 255, 255, 0.7); }
  .step-arrow { font-size: 1.2rem; color: rgba(255, 255, 255, 0.3); }

  .referral-code-section { text-align: center; margin-bottom: 24px; }
  .code-label { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .code-box { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px 24px; background: rgba(255, 255, 255, 0.05); border: 2px dashed rgba(255, 255, 255, 0.2); border-radius: 12px; }
  .referral-code { font-family: 'Bebas Neue', monospace; font-size: 2rem; letter-spacing: 4px; color: #fff; }
  .copy-code-btn { padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 8px; color: #fff; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
  .copy-code-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); }
  .copy-code-btn.copied { background: linear-gradient(135deg, #22c55e, #16a34a); }

  .share-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .share-btn-large { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; border-radius: 12px; text-decoration: none; transition: all 0.2s; font-weight: 600; }
  .share-btn-large:hover { transform: translateY(-3px); }
  .share-btn-large.twitter { background: #1da1f2; color: #fff; }
  .share-btn-large.whatsapp { background: #25d366; color: #fff; }
  .share-btn-large.email { background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); }
  .share-icon { font-size: 1.5rem; }
  .share-text { font-size: 0.8rem; }

  .tier-section { background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
  .tier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .current-tier { font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .tier-icon { font-size: 1.3rem; }
  .referral-count { font-size: 0.9rem; color: rgba(255, 255, 255, 0.5); }
  .tier-progress { margin-bottom: 16px; }
  .tier-progress-bar { height: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 5px; overflow: hidden; margin-bottom: 8px; }
  .tier-progress-fill { height: 100%; background: linear-gradient(90deg, #fbbf24, #f59e0b); border-radius: 5px; transition: width 0.3s; }
  .tier-next { display: flex; justify-content: space-between; font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }
  .tier-max { text-align: center; color: #fbbf24; font-weight: 600; padding: 12px; }
  .tier-rewards { display: flex; justify-content: space-between; gap: 8px; }
  .tier-badge { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 8px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; transition: all 0.2s; }
  .tier-badge.unlocked { background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); }
  .tier-badge.locked { opacity: 0.4; }
  .tier-badge-icon { font-size: 1.3rem; }
  .tier-badge-name { font-size: 0.7rem; font-weight: 600; }
  .tier-badge-req { font-size: 0.65rem; color: rgba(255, 255, 255, 0.4); }

  .referral-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .ref-stat { text-align: center; padding: 16px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; }
  .ref-stat-value { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; color: #fff; margin-bottom: 4px; }
  .ref-stat-label { font-size: 0.7rem; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px; }

  /* ========== ACHIEVEMENTS STYLES ========== */
  .achievements-wrapper { background: rgba(255, 255, 255, 0.02); border-radius: 16px; padding: 20px; }
  .achievements-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
  .achievements-count { font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; letter-spacing: 1px; }
  .achievements-xp { font-size: 0.9rem; color: #fbbf24; font-weight: 600; }

  .achievements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

  .achievement-card {
    position: relative;
    display: flex;
    gap: 14px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 16px;
    transition: all 0.3s ease;
  }

  .achievement-card.locked { opacity: 0.6; filter: grayscale(0.3); }
  .achievement-card.unlocked {
    border-color: #fbbf24;
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(255, 255, 255, 0.03));
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.15);
  }
  .achievement-card.unlocked:hover { box-shadow: 0 0 30px rgba(251, 191, 36, 0.25); transform: translateY(-2px); }

  .achievement-checkmark {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: bold;
    color: #fff;
    box-shadow: 0 2px 10px rgba(34, 197, 94, 0.4);
  }

  .achievement-icon-wrapper {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    flex-shrink: 0;
    transition: all 0.3s;
  }
  .achievement-icon-wrapper.unlocked { background: rgba(251, 191, 36, 0.2); }
  .achievement-icon { font-size: 1.8rem; }

  .achievement-details { flex: 1; min-width: 0; }
  .achievement-title { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
  .achievement-desc { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); margin-bottom: 8px; }

  .achievement-meta { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
  .achievement-rarity { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .achievement-xp { font-size: 0.75rem; color: #6366f1; font-weight: 600; }

  .achievement-progress-bar { height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
  .achievement-progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 3px; transition: width 0.3s; }
  .achievement-progress-text { font-size: 0.7rem; color: rgba(255, 255, 255, 0.4); }

  .achievement-unlocked-badge { font-size: 0.85rem; color: #22c55e; font-weight: 600; }

  @media (max-width: 600px) {
    .profile-section { padding: 16px; }
    .achievements-grid { grid-template-columns: 1fr; }
    .share-buttons { flex-direction: column; }
    .steps { flex-direction: column; gap: 12px; }
    .step-arrow { transform: rotate(90deg); }
    .share-section { grid-template-columns: 1fr; }
    .tier-rewards { flex-wrap: wrap; }
    .tier-badge { min-width: calc(50% - 4px); }
    .referral-stats-row { grid-template-columns: 1fr; }
    .code-box { flex-direction: column; gap: 12px; }
    .referral-code { font-size: 1.5rem; }
  }
</style>
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('profile-engagement-styles')) {
  document.head.insertAdjacentHTML('beforeend', profileEngagementStyles);
}

// Export
if (typeof window !== 'undefined') {
  window.ProfileEngagementUI = ProfileEngagementUI;
}
