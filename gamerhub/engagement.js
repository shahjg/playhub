/**
 * TheGaming.co Engagement System
 * Handles: Daily/Weekly Challenges, Achievements, Referrals, Stats Tracking
 * 
 * Usage:
 *   const engagement = new EngagementSystem(supabaseClient);
 *   await engagement.init();
 *   
 *   // After a game:
 *   await engagement.recordGame({ game: 'trivia-royale', won: true, score: 1500 });
 *   
 *   // Check for new achievements:
 *   const newAchievements = await engagement.checkAchievements();
 */

class EngagementSystem {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentUser = null;
    this.userStats = null;
    this.challenges = [];
    this.achievements = [];
    this.unlockedAchievements = [];
    this.referralCode = null;
    this.initialized = false;
    
    // Toast notification queue
    this.toastQueue = [];
    this.toastContainer = null;
  }

  async init() {
    if (this.initialized) return;
    
    // Get current user
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session?.user) {
      console.log('[Engagement] No user logged in');
      return;
    }
    
    this.currentUser = session.user;
    
    // Load user data in parallel
    await Promise.all([
      this.loadUserStats(),
      this.loadChallenges(),
      this.loadAchievements(),
      this.updateLoginStreak()
    ]);
    
    // Inject styles
    this.injectStyles();
    
    // Create toast container
    this.createToastContainer();
    
    this.initialized = true;
    console.log('[Engagement] Initialized for user:', this.currentUser.id);
  }

  // ============ STATS ============
  
  async loadUserStats() {
    const { data, error } = await this.supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', this.currentUser.id)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // No stats yet, create initial record
      const { data: newStats } = await this.supabase
        .from('user_stats')
        .insert({ user_id: this.currentUser.id })
        .select()
        .single();
      this.userStats = newStats;
    } else {
      this.userStats = data;
    }
  }

  async updateLoginStreak() {
    if (!this.userStats) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = this.userStats.last_login_date;
    
    if (lastLogin === today) return; // Already logged in today
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = 1;
    if (lastLogin === yesterdayStr) {
      // Continuing streak
      newStreak = (this.userStats.daily_login_streak || 0) + 1;
    }
    
    const bestStreak = Math.max(newStreak, this.userStats.best_daily_login_streak || 0);
    
    await this.supabase
      .from('user_stats')
      .update({
        daily_login_streak: newStreak,
        best_daily_login_streak: bestStreak,
        last_login_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', this.currentUser.id);
    
    this.userStats.daily_login_streak = newStreak;
    this.userStats.best_daily_login_streak = bestStreak;
    this.userStats.last_login_date = today;
    
    // Show streak toast if continuing
    if (newStreak > 1) {
      this.showToast(`🔥 ${newStreak} day streak!`, 'streak');
    }
  }

  async recordGame(options = {}) {
    const {
      game = 'unknown',
      won = false,
      score = 0,
      isMultiplayer = false,
      playtimeMinutes = 5
    } = options;

    if (!this.currentUser || !this.userStats) return;

    // Update stats
    const updates = {
      total_games_played: (this.userStats.total_games_played || 0) + 1,
      total_playtime_minutes: (this.userStats.total_playtime_minutes || 0) + playtimeMinutes,
      updated_at: new Date().toISOString()
    };

    if (isMultiplayer) {
      updates.multiplayer_games_played = (this.userStats.multiplayer_games_played || 0) + 1;
      if (won) {
        updates.total_wins = (this.userStats.total_wins || 0) + 1;
        updates.multiplayer_wins = (this.userStats.multiplayer_wins || 0) + 1;
        updates.current_win_streak = (this.userStats.current_win_streak || 0) + 1;
        updates.best_win_streak = Math.max(
          updates.current_win_streak,
          this.userStats.best_win_streak || 0
        );
      } else {
        updates.total_losses = (this.userStats.total_losses || 0) + 1;
        updates.current_win_streak = 0;
      }
    } else {
      updates.solo_games_played = (this.userStats.solo_games_played || 0) + 1;
      
      // Update best scores for solo games
      const bestScores = this.userStats.solo_best_scores || {};
      if (!bestScores[game] || score > bestScores[game]) {
        bestScores[game] = score;
        updates.solo_best_scores = bestScores;
      }
    }

    await this.supabase
      .from('user_stats')
      .update(updates)
      .eq('user_id', this.currentUser.id);

    // Update local state
    Object.assign(this.userStats, updates);

    // Update challenge progress
    await this.updateChallengeProgress('play_games', 1, game);
    if (won) {
      await this.updateChallengeProgress('win_games', 1, game);
    }
    if (!isMultiplayer) {
      await this.updateChallengeProgress('play_solo', 1, game);
    }

    // Check for new achievements
    const newAchievements = await this.checkAchievements();
    newAchievements.forEach(ach => {
      this.showToast(`🏆 Achievement: ${ach.title}`, 'achievement', ach.icon);
    });

    return { newAchievements };
  }

  // ============ CHALLENGES ============

  async loadChallenges() {
    // Assign today's challenges if not already
    await this.supabase.rpc('assign_daily_challenges', { p_user_id: this.currentUser.id });
    await this.supabase.rpc('assign_weekly_challenges', { p_user_id: this.currentUser.id });

    // Load user's active challenges
    const today = new Date().toISOString().split('T')[0];
    const weekStart = this.getWeekStart();

    const { data } = await this.supabase
      .from('user_challenges')
      .select(`
        *,
        challenges (*)
      `)
      .eq('user_id', this.currentUser.id)
      .or(`period_start.eq.${today},period_start.eq.${weekStart}`)
      .order('created_at', { ascending: false });

    this.challenges = data || [];
  }

  async updateChallengeProgress(requirementType, increment = 1, game = null) {
    await this.supabase.rpc('update_challenge_progress', {
      p_user_id: this.currentUser.id,
      p_requirement_type: requirementType,
      p_increment: increment,
      p_game: game
    });

    // Reload challenges to get updated progress
    await this.loadChallenges();

    // Check for newly completed challenges
    const completed = this.challenges.filter(c => c.completed && !c.reward_claimed);
    completed.forEach(c => {
      this.showToast(`✅ Challenge Complete: ${c.challenges.title}`, 'challenge');
    });
  }

  async claimChallengeReward(challengeId, periodStart) {
    const { data, error } = await this.supabase.rpc('claim_challenge_reward', {
      p_user_id: this.currentUser.id,
      p_challenge_id: challengeId,
      p_period_start: periodStart
    });

    if (data?.success) {
      this.showToast(`+${data.xp_earned} XP earned!`, 'xp');
      await this.loadChallenges();
    }

    return data;
  }

  getDailyChallenges() {
    const today = new Date().toISOString().split('T')[0];
    return this.challenges.filter(c => 
      c.period_start === today && c.challenges?.type === 'daily'
    );
  }

  getWeeklyChallenges() {
    const weekStart = this.getWeekStart();
    return this.challenges.filter(c => 
      c.period_start === weekStart && c.challenges?.type === 'weekly'
    );
  }

  getWeekStart() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    const weekStart = new Date(now.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  }

  // ============ ACHIEVEMENTS ============

  async loadAchievements() {
    // Load all achievements
    const { data: allAchievements } = await this.supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    this.achievements = allAchievements || [];

    // Load user's unlocked achievements
    const { data: unlocked } = await this.supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at, reward_claimed')
      .eq('user_id', this.currentUser.id);

    this.unlockedAchievements = unlocked || [];
  }

  async checkAchievements() {
    const { data, error } = await this.supabase.rpc('check_achievements', {
      p_user_id: this.currentUser.id
    });

    if (data && data.length > 0) {
      await this.loadAchievements(); // Reload to include new ones
    }

    return data || [];
  }

  async claimAchievementReward(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return { success: false, error: 'Achievement not found' };

    const unlocked = this.unlockedAchievements.find(u => u.achievement_id === achievementId);
    if (!unlocked) return { success: false, error: 'Achievement not unlocked' };
    if (unlocked.reward_claimed) return { success: false, error: 'Already claimed' };

    // Mark as claimed
    await this.supabase
      .from('user_achievements')
      .update({ reward_claimed: true })
      .eq('user_id', this.currentUser.id)
      .eq('achievement_id', achievementId);

    // Award XP
    if (achievement.xp_reward > 0) {
      await this.supabase.rpc('add_xp', {
        p_user_id: this.currentUser.id,
        p_amount: achievement.xp_reward
      });
    }

    // Unlock cosmetic if applicable
    if (achievement.cosmetic_reward_type) {
      await this.supabase
        .from('user_cosmetic_unlocks')
        .insert({
          user_id: this.currentUser.id,
          cosmetic_type: achievement.cosmetic_reward_type,
          cosmetic_id: achievement.cosmetic_reward_id,
          source: 'achievement',
          source_id: achievementId
        });
    }

    this.showToast(`+${achievement.xp_reward} XP earned!`, 'xp');
    await this.loadAchievements();

    return { success: true, xp_earned: achievement.xp_reward };
  }

  getAchievementProgress(achievement) {
    if (!this.userStats) return 0;

    const value = {
      'total_games': this.userStats.total_games_played,
      'total_wins': this.userStats.total_wins,
      'win_streak': this.userStats.best_win_streak,
      'friends_count': this.userStats.friends_count,
      'referrals_count': this.userStats.referrals_count,
      'daily_streak': this.userStats.best_daily_login_streak,
      'playtime_hours': Math.floor((this.userStats.total_playtime_minutes || 0) / 60)
    }[achievement.requirement_type] || 0;

    return Math.min(value / achievement.requirement_value, 1);
  }

  isAchievementUnlocked(achievementId) {
    return this.unlockedAchievements.some(u => u.achievement_id === achievementId);
  }

  // ============ REFERRALS ============

  async getReferralCode() {
    if (this.referralCode) return this.referralCode;

    const { data } = await this.supabase.rpc('generate_referral_code', {
      p_user_id: this.currentUser.id
    });

    this.referralCode = data;
    return data;
  }

  async applyReferralCode(code) {
    const { data, error } = await this.supabase.rpc('process_referral', {
      p_referee_id: this.currentUser.id,
      p_referral_code: code
    });

    if (data?.success) {
      this.showToast(`🎉 Referral bonus: +${data.referee_xp} XP!`, 'referral');
    }

    return data;
  }

  async getReferralStats() {
    const { data } = await this.supabase
      .from('referral_codes')
      .select('code, uses_count')
      .eq('user_id', this.currentUser.id)
      .single();

    const { data: referrals } = await this.supabase
      .from('referrals')
      .select('created_at, profiles:referee_id(display_name)')
      .eq('referrer_id', this.currentUser.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      code: data?.code,
      totalReferrals: data?.uses_count || 0,
      recentReferrals: referrals || []
    };
  }

  // ============ UI COMPONENTS ============

  injectStyles() {
    if (document.getElementById('engagement-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'engagement-styles';
    styles.textContent = `
      /* Toast Notifications */
      .engagement-toast-container {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }

      .engagement-toast {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 20px;
        background: rgba(10, 10, 15, 0.95);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        color: #fff;
        font-size: 0.9rem;
        font-weight: 500;
        pointer-events: auto;
        animation: toastSlideIn 0.3s ease forwards;
        max-width: 320px;
      }

      .engagement-toast.hiding {
        animation: toastSlideOut 0.3s ease forwards;
      }

      .engagement-toast-icon {
        font-size: 1.4rem;
        flex-shrink: 0;
      }

      .engagement-toast.achievement {
        border-color: rgba(251, 191, 36, 0.4);
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(10, 10, 15, 0.95));
      }

      .engagement-toast.challenge {
        border-color: rgba(34, 197, 94, 0.4);
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(10, 10, 15, 0.95));
      }

      .engagement-toast.xp {
        border-color: rgba(99, 102, 241, 0.4);
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(10, 10, 15, 0.95));
      }

      .engagement-toast.streak {
        border-color: rgba(249, 115, 22, 0.4);
        background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(10, 10, 15, 0.95));
      }

      .engagement-toast.referral {
        border-color: rgba(236, 72, 153, 0.4);
        background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(10, 10, 15, 0.95));
      }

      @keyframes toastSlideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes toastSlideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100px);
        }
      }

      /* Challenge Card */
      .challenge-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .challenge-card.completed {
        border-color: rgba(34, 197, 94, 0.3);
        background: rgba(34, 197, 94, 0.05);
      }

      .challenge-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }

      .challenge-info h4 {
        font-size: 0.95rem;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .challenge-info p {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
      }

      .challenge-reward {
        font-size: 0.75rem;
        color: #fbbf24;
        font-weight: 600;
        white-space: nowrap;
      }

      .challenge-progress {
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
      }

      .challenge-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #22c55e, #4ade80);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      .challenge-progress-text {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.5);
        text-align: right;
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

      /* Achievement Card */
      .achievement-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        align-items: center;
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
        margin-bottom: 2px;
      }

      .achievement-info p {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 6px;
      }

      .achievement-rarity {
        font-size: 0.7rem;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .achievement-rarity.common { color: #9ca3af; }
      .achievement-rarity.uncommon { color: #22c55e; }
      .achievement-rarity.rare { color: #3b82f6; }
      .achievement-rarity.epic { color: #a855f7; }
      .achievement-rarity.legendary { color: #fbbf24; }

      .achievement-reward {
        font-size: 0.85rem;
        color: #6366f1;
        font-weight: 600;
        text-align: right;
      }

      /* Referral Section */
      .referral-code-box {
        background: rgba(255, 255, 255, 0.05);
        border: 2px dashed rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
      }

      .referral-code {
        font-family: 'Bebas Neue', monospace;
        font-size: 2rem;
        letter-spacing: 4px;
        color: #fff;
        margin: 10px 0;
      }

      .referral-copy-btn {
        padding: 10px 24px;
        background: linear-gradient(135deg, #ec4899, #be185d);
        border: none;
        border-radius: 8px;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .referral-copy-btn:hover {
        transform: translateY(-1px);
      }

      @media (max-width: 480px) {
        .engagement-toast-container {
          left: 10px;
          right: 10px;
          top: 70px;
        }

        .engagement-toast {
          max-width: 100%;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  createToastContainer() {
    if (this.toastContainer) return;
    
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'engagement-toast-container';
    document.body.appendChild(this.toastContainer);
  }

  showToast(message, type = 'default', icon = null) {
    if (!this.toastContainer) this.createToastContainer();

    const toast = document.createElement('div');
    toast.className = `engagement-toast ${type}`;
    
    const icons = {
      achievement: '🏆',
      challenge: '✅',
      xp: '⭐',
      streak: '🔥',
      referral: '🎉',
      default: '💫'
    };

    toast.innerHTML = `
      <span class="engagement-toast-icon">${icon || icons[type] || icons.default}</span>
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ============ RENDER HELPERS ============

  renderChallengeCard(challenge) {
    const c = challenge.challenges;
    const progress = Math.min(challenge.progress / c.requirement_target, 1);
    const completed = challenge.completed;
    const claimed = challenge.reward_claimed;

    return `
      <div class="challenge-card ${completed ? 'completed' : ''}">
        <div class="challenge-header">
          <div class="challenge-info">
            <h4>${c.title}</h4>
            <p>${c.description}</p>
          </div>
          <div class="challenge-reward">+${c.xp_reward} XP</div>
        </div>
        <div class="challenge-progress">
          <div class="challenge-progress-fill" style="width: ${progress * 100}%"></div>
        </div>
        <div class="challenge-progress-text">${challenge.progress} / ${c.requirement_target}</div>
        ${completed && !claimed ? `
          <button class="challenge-claim-btn" data-challenge-id="${c.id}" data-period="${challenge.period_start}">
            Claim Reward
          </button>
        ` : ''}
      </div>
    `;
  }

  renderAchievementCard(achievement) {
    const unlocked = this.isAchievementUnlocked(achievement.id);
    const progress = this.getAchievementProgress(achievement);

    return `
      <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <h4>${unlocked || !achievement.is_hidden ? achievement.title : '???'}</h4>
          <p>${unlocked || !achievement.is_hidden ? achievement.description : 'Hidden achievement'}</p>
          <span class="achievement-rarity ${achievement.rarity}">${achievement.rarity}</span>
        </div>
        <div class="achievement-reward">+${achievement.xp_reward} XP</div>
      </div>
    `;
  }

  async renderReferralSection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const code = await this.getReferralCode();
    const stats = await this.getReferralStats();
    const shareUrl = `${window.location.origin}?ref=${code}`;

    container.innerHTML = `
      <div class="referral-code-box">
        <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem;">Your Referral Code</p>
        <div class="referral-code">${code}</div>
        <button class="referral-copy-btn" onclick="navigator.clipboard.writeText('${shareUrl}').then(() => this.textContent = 'Copied!')">
          Copy Link
        </button>
        <p style="color: rgba(255,255,255,0.5); font-size: 0.8rem; margin-top: 12px;">
          ${stats.totalReferrals} friends referred • Earn 500 XP per referral!
        </p>
      </div>
    `;
  }
}

// Auto-init if supabase is available
if (typeof window !== 'undefined') {
  window.EngagementSystem = EngagementSystem;
  
  // Check for referral code in URL
  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('pending_referral', refCode);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  });
}
