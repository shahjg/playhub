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

  renderChallengesSection() {
    const container = document.getElementById('challenges-container');
    if (!container) return;
    
    if (!this.engagement) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <h3 style="margin-bottom: 12px;">🎯 Challenges Coming Soon</h3>
          <p style="color: rgba(255,255,255,0.5);">Complete games to unlock daily and weekly challenges!</p>
        </div>
      `;
      return;
    }

    const dailyChallenges = this.engagement.getDailyChallenges();
    const weeklyChallenges = this.engagement.getWeeklyChallenges();

    container.innerHTML = `
      <div class="profile-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">🎯</span>
            CHALLENGES
          </h2>
          <div class="challenge-tabs">
            <button class="challenge-tab active" data-tab="daily">Daily</button>
            <button class="challenge-tab" data-tab="weekly">Weekly</button>
          </div>
        </div>

        <div class="challenge-content" id="daily-challenges">
          ${dailyChallenges.length > 0 ? dailyChallenges.map(c => this.renderChallengeCard(c)).join('') : `
            <div class="empty-state">
              <p>No daily challenges available. Check back later!</p>
            </div>
          `}
        </div>

        <div class="challenge-content hidden" id="weekly-challenges">
          ${weeklyChallenges.length > 0 ? weeklyChallenges.map(c => this.renderChallengeCard(c)).join('') : `
            <div class="empty-state">
              <p>No weekly challenges available. Check back later!</p>
            </div>
          `}
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

    // Claim buttons
    container.querySelectorAll('.challenge-claim-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const result = await this.engagement.claimChallengeReward(
          btn.dataset.challengeId,
          btn.dataset.period
        );
        if (result?.success) {
          this.renderChallengesSection(); // Re-render
        }
      });
    });
  }

  renderChallengeCard(challenge) {
    const c = challenge.challenges;
    const progress = Math.min(challenge.progress / c.requirement_target, 1);
    const completed = challenge.completed;
    const claimed = challenge.reward_claimed;

    return `
      <div class="challenge-card ${completed ? 'completed' : ''} ${claimed ? 'claimed' : ''}">
        <div class="challenge-header">
          <div class="challenge-info">
            <h4>${c.title}</h4>
            <p>${c.description}</p>
          </div>
          <div class="challenge-reward">
            <span class="xp-badge">+${c.xp_reward} XP</span>
          </div>
        </div>
        <div class="challenge-progress-bar">
          <div class="challenge-progress-fill" style="width: ${progress * 100}%"></div>
        </div>
        <div class="challenge-footer">
          <span class="progress-text">${challenge.progress} / ${c.requirement_target}</span>
          ${completed && !claimed ? `
            <button class="challenge-claim-btn" data-challenge-id="${c.id}" data-period="${challenge.period_start}">
              Claim Reward
            </button>
          ` : claimed ? `
            <span class="claimed-badge">✓ Claimed</span>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderAchievementsSection() {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    if (!this.engagement) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <h3 style="margin-bottom: 12px;">🏆 Achievements Coming Soon</h3>
          <p style="color: rgba(255,255,255,0.5);">Play games to unlock achievements and earn rewards!</p>
        </div>
      `;
      return;
    }

    const achievements = this.engagement.achievements;
    const unlocked = this.engagement.unlockedAchievements;
    
    // Group by category
    const categories = {};
    achievements.forEach(a => {
      if (!categories[a.category]) categories[a.category] = [];
      categories[a.category].push(a);
    });

    const unlockedCount = unlocked.length;
    const totalCount = achievements.filter(a => !a.is_hidden).length;

    container.innerHTML = `
      <div class="profile-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">🏆</span>
            ACHIEVEMENTS
          </h2>
          <span class="achievement-count">${unlockedCount} / ${totalCount}</span>
        </div>

        <div class="achievements-grid">
          ${achievements.map(a => this.renderAchievementCard(a)).join('')}
        </div>
      </div>
    `;

    // Claim buttons
    container.querySelectorAll('.achievement-claim-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const result = await this.engagement.claimAchievementReward(btn.dataset.achievementId);
        if (result?.success) {
          this.renderAchievementsSection();
        }
      });
    });
  }

  renderAchievementCard(achievement) {
    const isUnlocked = this.engagement.isAchievementUnlocked(achievement.id);
    const unlockData = this.engagement.unlockedAchievements.find(u => u.achievement_id === achievement.id);
    const progress = this.engagement.getAchievementProgress(achievement);
    const progressPercent = Math.round(progress * 100);

    if (achievement.is_hidden && !isUnlocked) {
      return `
        <div class="achievement-card locked hidden-achievement">
          <div class="achievement-icon">❓</div>
          <div class="achievement-info">
            <h4>Hidden Achievement</h4>
            <p>Keep playing to discover!</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <h4>${achievement.title}</h4>
          <p>${achievement.description}</p>
          <div class="achievement-meta">
            <span class="rarity rarity-${achievement.rarity}">${achievement.rarity}</span>
            <span class="xp-reward">+${achievement.xp_reward} XP</span>
          </div>
          ${!isUnlocked ? `
            <div class="achievement-progress">
              <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <span class="progress-percent">${progressPercent}%</span>
          ` : unlockData && !unlockData.reward_claimed ? `
            <button class="achievement-claim-btn" data-achievement-id="${achievement.id}">Claim</button>
          ` : `
            <span class="unlocked-date">Unlocked!</span>
          `}
        </div>
      </div>
    `;
  }

  async renderReferralSection() {
    const container = document.getElementById('referrals-container');
    if (!container) return;
    
    if (!this.engagement) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <h3 style="margin-bottom: 12px;">🎁 Referrals Coming Soon</h3>
          <p style="color: rgba(255,255,255,0.5);">Invite friends and earn bonus XP!</p>
        </div>
      `;
      return;
    }

    const code = await this.engagement.getReferralCode();
    const stats = await this.engagement.getReferralStats();
    const shareUrl = `${window.location.origin}?ref=${code}`;

    container.innerHTML = `
      <div class="profile-section referral-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">🎁</span>
            INVITE FRIENDS
          </h2>
        </div>

        <div class="referral-card">
          <div class="referral-info">
            <p>Share your code and earn rewards when friends sign up!</p>
            <ul class="referral-benefits">
              <li>🎮 You get <strong>500 XP</strong> per referral</li>
              <li>🎉 Friends get <strong>250 XP</strong> bonus</li>
              <li>🏆 Unlock exclusive achievements</li>
            </ul>
          </div>

          <div class="referral-code-box">
            <label>Your Referral Code</label>
            <div class="code-display">
              <span class="code">${code}</span>
              <button class="copy-btn" onclick="navigator.clipboard.writeText('${shareUrl}').then(() => { this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy', 2000); })">
                Copy
              </button>
            </div>
          </div>

          <div class="referral-stats">
            <div class="referral-stat">
              <span class="stat-value">${stats.totalReferrals}</span>
              <span class="stat-label">Friends Invited</span>
            </div>
            <div class="referral-stat">
              <span class="stat-value">${stats.totalReferrals * 500}</span>
              <span class="stat-label">XP Earned</span>
            </div>
          </div>

          <div class="share-buttons">
            <a href="https://twitter.com/intent/tweet?text=Join%20me%20on%20TheGaming.co%20and%20get%20bonus%20XP!%20Use%20code%20${code}%20${encodeURIComponent(shareUrl)}" target="_blank" class="share-btn twitter">
              Share on X
            </a>
            <a href="https://wa.me/?text=Join%20me%20on%20TheGaming.co%20and%20get%20bonus%20XP!%20Use%20my%20code%3A%20${code}%20${encodeURIComponent(shareUrl)}" target="_blank" class="share-btn whatsapp">
              WhatsApp
            </a>
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

  @media (max-width: 600px) {
    .profile-section {
      padding: 16px;
    }
    
    .achievements-grid {
      grid-template-columns: 1fr;
    }
    
    .share-buttons {
      flex-direction: column;
    }
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
