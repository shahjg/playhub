/* =============================================
   SOCIAL SYSTEM v8 - TheGaming.co
   Features: Clubs, DMs, Profile Cards, Emoji, 
             Typing Indicator, Unblock UI, Leaderboards
   ============================================= */

class SocialSystem {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentUser = null;
    this.userProfile = null;
    this.friends = [];
    this.pendingRequests = [];
    this.sentRequests = [];
    this.gameInvites = [];
    this.partyInvites = [];
    this.currentParty = null;
    this.partyMembers = [];
    this.isOpen = false;
    this.activeTab = 'friends';
    this.channels = {};
    this.notificationCount = 0;
    this.originalTitle = document.title;
    this.titleFlashInterval = null;
    this.lastHostUrl = null;
    this.isFollowingHost = true;
    
    // V8: New state for clubs, DMs, blocked users
    this.currentClub = null;
    this.clubMembers = [];
    this.clubMessages = [];
    this.clubInvites = [];
    this.blockedUsers = [];
    this.dmConversations = [];
    this.activeDmUser = null;
    this.dmMessages = [];
    this.typingUsers = {}; // { oduserId: timestamp }
    this.isTyping = false;
    this.typingTimeout = null;
    this.profileModalUser = null;
    
    // SVG Icons
    this.icons = {
      users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      userPlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
      userMinus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
      search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
      x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
      plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
      gamepad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>`,
      logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
      moreVertical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
      copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
      shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      play: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
      crown: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 19h19v3h-19zM22.1 6.5L17.5 11l-5.5-9-5.5 9L2 6.5l2.5 11h15.1l2.5-11z"/></svg>`,
      link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
      arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
      send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
      message: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
      chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
      circle: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>`,
      moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
      minusCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
      eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
      // V8: New icons
      smile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
      trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
      clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      flag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
      userX: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="22" y2="13"/><line x1="22" y1="8" x2="17" y2="13"/></svg>`,
      unlock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
      inbox: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`
    };
    
    // Common emojis for picker
    this.commonEmojis = [
      '😀', '😂', '😊', '🥰', '😎', '🤔', '😮', '😢',
      '🔥', '❤️', '💯', '👍', '👎', '👏', '🙌', '💪',
      '🎮', '🏆', '⚡', '🎯', '🚀', '💀', '😈', '👀',
      'GG', 'EZ', 'WP', 'GL', 'HF', 'AFK', 'BRB', 'LOL'
    ];

    // Sound effects (base64 encoded short sounds)
    this.sounds = {
      notification: null,
      invite: null,
      join: null,
      message: null
    };
    this.soundsEnabled = true;
    this.initSounds();

    // Default avatar icons for users without profile pictures
    this.avatarIcons = [
      { id: 'default', gradient: ['#6366f1', '#8b5cf6'] },
      { id: 'fire', gradient: ['#f97316', '#ef4444'] },
      { id: 'ice', gradient: ['#06b6d4', '#3b82f6'] },
      { id: 'nature', gradient: ['#22c55e', '#10b981'] },
      { id: 'gold', gradient: ['#f59e0b', '#eab308'] },
      { id: 'pink', gradient: ['#ec4899', '#f472b6'] },
      { id: 'dark', gradient: ['#374151', '#1f2937'] },
      { id: 'ocean', gradient: ['#0ea5e9', '#6366f1'] }
    ];

    // Status options
    this.statusOptions = [
      { id: 'online', label: 'Online', color: '#22c55e' },
      { id: 'away', label: 'Away', color: '#f59e0b' },
      { id: 'dnd', label: 'Do Not Disturb', color: '#ef4444' },
      { id: 'invisible', label: 'Invisible', color: '#6b7280' }
    ];
    this.userStatus = 'online';

    // Party chat
    this.partyMessages = [];
    this.chatChannel = null;
    
    this.init();
  }

  // Initialize sound effects
  initSounds() {
    // Create audio context on first user interaction
    const initAudio = () => {
      // Simple beep sounds using oscillator
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio, { once: true });
  }

  playSound(type) {
    if (!this.soundsEnabled || !this.audioContext) return;
    
    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      // Different sounds for different events
      const sounds = {
        notification: { freq: 880, duration: 0.15, type: 'sine' },
        invite: { freq: 660, duration: 0.2, type: 'sine' },
        join: { freq: 523, duration: 0.1, type: 'triangle' },
        message: { freq: 440, duration: 0.08, type: 'sine' }
      };
      
      const sound = sounds[type] || sounds.notification;
      osc.frequency.value = sound.freq;
      osc.type = sound.type;
      gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + sound.duration);
    } catch (e) {
      console.log('Sound error:', e);
    }
  }

  async init() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) return;
    
    this.currentUser = session.user;
    console.log('🚀 Initializing social system for:', this.currentUser.id);
    
    await this.loadUserProfile();
    this.injectStyles();
    this.injectHTML();
    this.updateNameplate();
    this.bindEvents();
    await this.loadAll();
    await this.updatePresence('online');
    this.startPresenceHeartbeat();
    this.subscribeToRealtime();
    this.updateNotificationBadge();
    
    // Cleanup inactive parties (runs server-side, fire and forget)
    try {
      await this.supabase.rpc('cleanup_inactive_parties');
    } catch (e) { /* ignore errors */ }
    
    // Check for party join code in URL
    this.checkPartyJoinCode();
    
    // Handle window close - update presence and cleanup
    window.addEventListener('beforeunload', () => {
      this.stopActivityPing();
    });
    
    console.log('✅ Social system initialized');
    console.log('   Party:', this.currentParty ? 'Yes' : 'No');
    console.log('   Friends:', this.friends.length);
    console.log('   Party Invites:', this.partyInvites.length);
  }

  async checkPartyJoinCode() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('partycode') || params.get('party') || params.get('joinparty');
    
    if (!code) return;
    
    // Clean URL (remove the party code param)
    params.delete('partycode');
    params.delete('party');
    params.delete('joinparty');
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}` 
      : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    
    // Check if already in a party
    if (this.currentParty) {
      this.showToast('party', 'Already in Party', 'Leave your current party first');
      return;
    }
    
    // Try to join party
    try {
      const { error } = await this.supabase.rpc('join_party_by_code', { code: code.toUpperCase() });
      
      if (error) {
        console.error('Failed to join party:', error);
        this.showToast('party', 'Could not join', error.message || 'Invalid or expired code');
      } else {
        await this.loadParty();
        this.open();
        this.switchTab('party');
        this.showToast('party', 'Joined Party!', 'You are now in the party');
      }
    } catch (e) {
      console.error('Join party error:', e);
      this.showToast('party', 'Error', 'Could not join party');
    }
  }

  updateNameplate() {
    const displayName = this.userProfile?.gamer_tag || this.userProfile?.display_name || 'Player';
    const initial = displayName[0].toUpperCase();
    const handle = this.generateHandle();
    const avatarStyle = this.getAvatarStyle(this.userProfile);
    const nameStyle = this.getPremiumNameStyle(this.userProfile);
    const nameEffectClass = this.getNameEffectClass(this.userProfile);
    const borderClass = this.getBorderColorClass(this.userProfile);
    
    // Get border color for title
    const borderColor = this.userProfile?.border_color || this.userProfile?.cosmetics?.border_color || 'gray';
    const titleColor = this.COSMETIC_COLORS[borderColor] || this.COSMETIC_COLORS.gray;
    
    const avatarEl = document.getElementById('s-profile-avatar');
    const nameEl = document.getElementById('s-profile-name');
    const handleEl = document.getElementById('my-handle');
    const statusIndicator = document.getElementById('status-indicator');
    const profileInner = document.getElementById('s-profile-inner');
    
    if (avatarEl) {
      avatarEl.style.cssText = avatarStyle;
      if (!this.userProfile?.avatar_url) {
        avatarEl.textContent = initial;
      } else {
        avatarEl.textContent = '';
      }
    }
    
    // Apply border color to profile section
    if (profileInner) {
      if (this.userProfile?.isPremium && borderClass) {
        profileInner.className = `s-profile-inner ${borderClass}`;
      } else {
        profileInner.className = 's-profile-inner';
      }
    }
    
    if (nameEl) {
      // Badge icon
      const badge = this.userProfile?.badge_icon || this.userProfile?.cosmetics?.badge_icon;
      const badgeHtml = badge && this.userProfile?.isPremium ? `<span class="s-badge-icon">${badge}</span>` : '';
      
      // Title with matching color
      const title = this.userProfile?.title || this.userProfile?.cosmetics?.title;
      const titleStyle = this.userProfile?.isPremium ? `color: ${titleColor};` : '';
      const titleHtml = title && this.userProfile?.isPremium ? `<div class="s-premium-title" style="${titleStyle}">${this.escapeHtml(title)}</div>` : '';
      
      // Apply premium styling
      nameEl.innerHTML = `
        <div class="s-profile-name-row">${badgeHtml}<span class="s-name ${nameEffectClass}" style="${nameStyle}">${this.escapeHtml(displayName)}</span></div>
        ${titleHtml}
      `;
    }
    if (handleEl) handleEl.textContent = handle;
    
    // Update status indicator
    if (statusIndicator) {
      const statusOpt = this.statusOptions.find(s => s.id === this.userStatus);
      if (statusOpt) statusIndicator.style.background = statusOpt.color;
    }
  }

  async loadAll() {
    await Promise.all([
      this.loadFriends(),
      this.loadRequests(),
      this.loadInvites(),
      this.loadParty(),
      this.loadPartyInvites(),
      // V8: New data
      this.loadBlockedUsers(),
      this.loadDmConversations(),
      this.loadClub(),
      this.loadClubInvites()
    ]);
  }

  // ==================== STYLES ====================

  injectStyles() {
    if (document.getElementById('social-v5-styles')) return;
    const style = document.createElement('style');
    style.id = 'social-v5-styles';
    style.textContent = `
      :root {
        --s-bg-primary: #0a0a0f;
        --s-bg-secondary: #111118;
        --s-bg-tertiary: #1a1a23;
        --s-bg-hover: rgba(255, 255, 255, 0.04);
        --s-border: rgba(255, 255, 255, 0.06);
        --s-border-light: rgba(255, 255, 255, 0.1);
        --s-text: #ffffff;
        --s-text-secondary: rgba(255, 255, 255, 0.6);
        --s-text-muted: rgba(255, 255, 255, 0.35);
        --s-accent: #6366f1;
        --s-accent-light: #818cf8;
        --s-success: #10b981;
        --s-warning: #f59e0b;
        --s-danger: #ef4444;
      }

      /* ===== HEADER BUTTON ===== */
      .friends-header-btn {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: transparent;
        border: none;
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .friends-header-btn svg { width: 22px; height: 22px; }
      .friends-header-btn:hover { 
        background: rgba(255, 255, 255, 0.08); 
        color: #fff; 
      }
      .friends-header-btn .notif-dot {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 8px;
        height: 8px;
        background: var(--s-danger);
        border-radius: 50%;
        opacity: 0;
        transform: scale(0);
        transition: all 0.2s ease;
      }
      .friends-header-btn .notif-dot.visible {
        opacity: 1;
        transform: scale(1);
      }

      /* ===== OVERLAY ===== */
      .s-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 9999;
      }
      .s-overlay.open { opacity: 1; visibility: visible; }

      /* ===== PANEL ===== */
      .s-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 100%;
        max-width: 380px;
        height: 100%;
        background: var(--s-bg-primary);
        border-left: 1px solid var(--s-border);
        transform: translateX(100%);
        transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 10000;
        display: flex;
        flex-direction: column;
      }
      .s-panel.open { transform: translateX(0); }

      /* ===== HEADER ===== */
      .s-header {
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--s-border);
      }
      .s-title {
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--s-text);
        letter-spacing: 0.02em;
      }
      .s-close {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--s-bg-hover);
        border: none;
        border-radius: 10px;
        color: var(--s-text-secondary);
        cursor: pointer;
        transition: all 0.2s;
      }
      .s-close svg { width: 18px; height: 18px; }
      .s-close:hover { background: var(--s-bg-tertiary); color: var(--s-text); }

      /* ===== PROFILE CARD ===== */
      .s-profile {
        margin: 16px;
        padding: 16px;
        background: var(--s-bg-secondary);
        border: 1px solid var(--s-border);
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .s-profile-inner {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px;
        border-radius: 14px;
        border: 2px solid transparent;
        transition: all 0.3s ease;
      }
      /* Profile border colors */
      .s-profile-inner.gold-border { border-color: #fbbf24; background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), transparent); }
      .s-profile-inner.diamond-border { border-color: #67e8f9; background: linear-gradient(135deg, rgba(103, 232, 249, 0.1), transparent); }
      .s-profile-inner.ruby-border { border-color: #f87171; background: linear-gradient(135deg, rgba(248, 113, 113, 0.1), transparent); }
      .s-profile-inner.emerald-border { border-color: #34d399; background: linear-gradient(135deg, rgba(52, 211, 153, 0.1), transparent); }
      .s-profile-inner.amethyst-border { border-color: #c084fc; background: linear-gradient(135deg, rgba(192, 132, 252, 0.1), transparent); }
      .s-profile-inner.platinum-border { border-color: #e2e8f0; background: linear-gradient(135deg, rgba(226, 232, 240, 0.1), transparent); }
      .s-profile-inner.obsidian-border { border-color: #1e1b4b; background: linear-gradient(135deg, rgba(30, 27, 75, 0.2), transparent); }
      .s-profile-inner.rose-border { border-color: #fb7185; background: linear-gradient(135deg, rgba(251, 113, 133, 0.1), transparent); }
      .s-profile-inner.rainbow-border {
        border-color: transparent;
        background: 
          linear-gradient(var(--s-bg-tertiary), var(--s-bg-tertiary)) padding-box,
          linear-gradient(90deg, #f87171, #fbbf24, #34d399, #67e8f9, #c084fc, #f87171) border-box;
        background-size: 100% 100%, 300% 100%;
        animation: tgcoRainbow 3s linear infinite;
      }
      .s-profile-avatar {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1.2rem;
        color: white;
        background-size: cover;
        background-position: center;
        flex-shrink: 0;
      }
      .s-profile-info { flex: 1; min-width: 0; }
      .s-profile-name {
        font-weight: 600;
        font-size: 1rem;
        color: var(--s-text);
        margin-bottom: 6px;
      }
      .s-profile-name-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .s-profile-name .s-name {
        color: inherit;
      }
      .s-profile-tag {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .s-profile-code {
        font-family: 'SF Mono', 'Consolas', monospace;
        font-size: 0.8rem;
        color: var(--s-text-muted);
        background: rgba(0, 0, 0, 0.3);
        padding: 4px 10px;
        border-radius: 6px;
      }
      .s-copy-btn {
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.06);
        border: none;
        border-radius: 6px;
        color: var(--s-text-muted);
        cursor: pointer;
        transition: all 0.2s;
      }
      .s-copy-btn svg { width: 14px; height: 14px; }
      .s-copy-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--s-text); }

      /* ===== SEARCH BAR (Always visible) ===== */
      .s-search {
        margin: 0 16px 12px;
        position: relative;
      }
      .s-search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--s-text-muted);
        pointer-events: none;
        width: 16px;
        height: 16px;
      }
      .s-search-input {
        width: 100%;
        padding: 11px 14px 11px 42px;
        background: var(--s-bg-secondary);
        border: 1px solid var(--s-border);
        border-radius: 10px;
        color: var(--s-text);
        font-size: 0.9rem;
        transition: all 0.2s;
      }
      .s-search-input::placeholder { color: var(--s-text-muted); }
      .s-search-input:focus {
        outline: none;
        border-color: var(--s-accent);
        background: var(--s-bg-tertiary);
      }

      /* ===== TABS (Simplified) ===== */
      .s-tabs {
        display: flex;
        margin: 0 16px 12px;
        background: var(--s-bg-secondary);
        border-radius: 10px;
        padding: 4px;
      }
      .s-tab {
        flex: 1;
        padding: 9px 12px;
        background: transparent;
        border: none;
        border-radius: 8px;
        color: var(--s-text-muted);
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .s-tab:hover { color: var(--s-text-secondary); }
      .s-tab.active {
        background: var(--s-bg-tertiary);
        color: var(--s-text);
      }
      .s-tab-count {
        min-width: 18px;
        height: 18px;
        background: var(--s-danger);
        border-radius: 9px;
        font-size: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
      }

      /* Party Invites Banner */
      #party-invites-banner:empty { display: none; }
      .s-party-invites-wrap {
        padding: 12px 16px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.08));
        border-bottom: 1px solid rgba(139, 92, 246, 0.3);
      }
      .s-party-invite-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--s-bg-secondary);
        border-radius: 12px;
        border: 1px solid var(--s-accent);
        margin-bottom: 8px;
        animation: s-pulse 2s ease-in-out infinite;
      }
      @keyframes s-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
        50% { box-shadow: 0 0 0 4px rgba(139, 92, 246, 0); }
      }
      .s-party-invite-card:last-child { margin-bottom: 0; }
      .s-party-invite-card .s-invite-info { flex: 1; min-width: 0; }
      .s-party-invite-card .s-invite-title {
        font-weight: 600;
        color: var(--s-text);
        font-size: 0.9rem;
      }
      .s-party-invite-card .s-invite-sub {
        font-size: 0.75rem;
        color: var(--s-accent-light);
      }
      .s-party-invite-card .s-invite-actions {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
      }

      /* ===== CONTENT ===== */
      .s-content {
        flex: 1;
        overflow-y: auto;
        padding: 0 16px 16px;
      }
      .s-content::-webkit-scrollbar { width: 5px; }
      .s-content::-webkit-scrollbar-track { background: transparent; }
      .s-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }

      .s-tab-panel { display: none; }
      .s-tab-panel.active { display: block; }

      /* ===== SECTION LABEL ===== */
      .s-label {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--s-text-muted);
        margin: 16px 0 10px;
        padding-left: 4px;
      }
      .s-label:first-child { margin-top: 0; }

      /* ===== USER CARD ===== */
      .s-user {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: var(--s-bg-secondary);
        border: 1px solid var(--s-border);
        border-radius: 12px;
        margin-bottom: 8px;
        transition: all 0.15s;
      }
      .s-user:hover { background: var(--s-bg-tertiary); border-color: var(--s-border-light); }
      
      .s-avatar {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.95rem;
        color: white;
        flex-shrink: 0;
        position: relative;
        background-size: cover;
        background-position: center;
      }
      .s-avatar.offline { opacity: 0.6; }
      .s-status-dot {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid var(--s-bg-secondary);
        background: #6b7280;
      }
      .s-status-dot.online { background: var(--s-success); }
      .s-status-dot.in-game { background: var(--s-accent); }
      
      .s-user-info { flex: 1; min-width: 0; }
      .s-user-name {
        font-weight: 500;
        font-size: 0.9rem;
        color: var(--s-text);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .s-user-name .disc { color: var(--s-text-muted); font-weight: 400; }
      .s-user-status { font-size: 0.75rem; color: var(--s-text-muted); margin-top: 2px; }
      .s-user-status.playing { color: var(--s-accent-light); }
      
      .s-user-actions { display: flex; gap: 6px; flex-shrink: 0; }

      /* ===== BUTTONS ===== */
      .s-btn {
        padding: 8px 14px;
        border-radius: 8px;
        border: none;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .s-btn svg { width: 16px; height: 16px; pointer-events: none; }
      .s-btn-primary {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
      }
      .s-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
      .s-btn-secondary {
        background: var(--s-bg-tertiary);
        color: var(--s-text-secondary);
        border: 1px solid var(--s-border);
      }
      .s-btn-secondary:hover { background: var(--s-bg-hover); color: var(--s-text); }
      .s-btn-success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
      }
      .s-btn-danger {
        background: rgba(239, 68, 68, 0.12);
        color: #f87171;
      }
      .s-btn-danger:hover { background: rgba(239, 68, 68, 0.2); }
      .s-btn-icon { width: 32px; height: 32px; padding: 0; }
      .s-btn-ghost {
        background: transparent;
        color: var(--s-text-muted);
        padding: 6px;
      }
      .s-btn-ghost:hover { background: var(--s-bg-hover); color: var(--s-text); }

      /* ===== PARTY SECTION ===== */
      .s-party {
        background: var(--s-bg-secondary);
        border: 1px solid var(--s-border);
        border-radius: 12px;
        margin-bottom: 16px;
      }
      .s-party-header {
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--s-border);
      }
      .s-party-title {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--s-text);
      }
      .s-party-count {
        font-size: 0.8rem;
        color: var(--s-text-muted);
      }
      .s-party-game {
        padding: 12px 16px;
        background: rgba(16, 185, 129, 0.08);
        border-bottom: 1px solid rgba(16, 185, 129, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .s-party-game-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .s-party-game-icon {
        width: 32px;
        height: 32px;
        background: rgba(16, 185, 129, 0.15);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #34d399;
      }
      .s-party-game-icon svg { width: 16px; height: 16px; }
      .s-party-game-label { font-size: 0.7rem; color: var(--s-text-muted); }
      .s-party-game-name { font-weight: 500; font-size: 0.85rem; color: var(--s-text); }
      
      .s-party-members { padding: 8px 12px; }
      .s-party-member {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 4px;
      }
      .s-party-member-avatar {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.85rem;
        color: white;
        position: relative;
        background-size: cover;
        background-position: center;
      }
      .s-crown {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 14px;
        height: 14px;
        color: #fbbf24;
      }
      .s-party-member-info { flex: 1; }
      .s-party-member-name {
        font-weight: 500;
        font-size: 0.85rem;
        color: var(--s-text);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .s-host-tag {
        font-size: 0.65rem;
        font-weight: 500;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(251, 191, 36, 0.15);
        color: #fbbf24;
      }
      .s-you-tag {
        font-size: 0.7rem;
        color: var(--s-text-muted);
      }
      .s-party-member-status {
        font-size: 0.7rem;
        color: var(--s-text-muted);
      }
      .s-party-actions {
        padding: 12px 16px;
        border-top: 1px solid var(--s-border);
      }

      /* Party Invite Section */
      .s-party-invite-section {
        margin-top: 16px;
        background: var(--s-bg-secondary);
        border: 1px solid var(--s-border);
        border-radius: 12px;
        overflow: hidden;
      }
      .s-party-invite-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        border-bottom: 1px solid var(--s-border);
      }
      .s-invite-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--s-text);
      }
      .s-party-invite-list {
        max-height: 200px;
        overflow-y: auto;
      }
      .s-invite-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        border-bottom: 1px solid var(--s-border);
      }
      .s-invite-row:last-child { border-bottom: none; }
      .s-invite-row.offline { opacity: 0.5; }
      .s-avatar-sm {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.8rem;
        color: white;
        position: relative;
        background-size: cover;
        background-position: center;
        flex-shrink: 0;
      }
      .s-status-dot-sm {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid var(--s-bg-secondary);
        background: #6b7280;
      }
      .s-status-dot-sm.online { background: var(--s-success); }
      .s-status-dot-sm.in-game { background: var(--s-accent); }
      .s-invite-name {
        flex: 1;
        font-size: 0.85rem;
        color: var(--s-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .s-invite-offline-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        color: var(--s-text-muted);
        font-size: 0.8rem;
        cursor: pointer;
        border-top: 1px solid var(--s-border);
        transition: background 0.2s;
      }
      .s-invite-offline-toggle:hover { background: var(--s-bg-hover); }
      .s-toggle-arrow {
        font-size: 1.2rem;
        transition: transform 0.2s;
      }
      .s-empty-mini {
        padding: 16px;
        text-align: center;
        color: var(--s-text-muted);
        font-size: 0.8rem;
      }
      .s-btn-sm {
        padding: 6px 10px;
        font-size: 0.75rem;
      }
      .s-btn-sm svg { width: 14px; height: 14px; }

      /* Modal */
      .s-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100002;
        backdrop-filter: blur(4px);
      }
      .s-modal {
        background: var(--s-bg);
        border: 1px solid var(--s-border);
        border-radius: 16px;
        width: 90%;
        max-width: 360px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }
      .s-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid var(--s-border);
      }
      .s-modal-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--s-text);
      }
      .s-modal-body {
        padding: 16px;
        max-height: 400px;
        overflow-y: auto;
      }
      .s-modal-friends-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
      }
      .s-modal-friend {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: var(--s-bg-secondary);
        border-radius: 10px;
        transition: all 0.2s;
      }
      .s-modal-friend.offline { opacity: 0.5; }
      .s-modal-friend-name {
        flex: 1;
        font-size: 0.9rem;
        color: var(--s-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .s-btn-block { width: 100%; }

      /* Party Chat */
      .s-party-chat {
        border-top: 1px solid var(--s-border);
        background: var(--s-bg-tertiary);
      }
      .s-chat-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--s-text);
        cursor: pointer;
        transition: background 0.2s;
        user-select: none;
      }
      .s-chat-header:hover { background: var(--s-bg-hover); }
      .s-chat-badge {
        background: var(--s-accent);
        color: white;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
      }
      .s-chat-toggle-icon {
        margin-left: auto;
        color: var(--s-text-muted);
        transition: transform 0.2s;
      }
      .s-chat-toggle-icon svg { width: 16px; height: 16px; }
      .s-chat-body {
        border-top: 1px solid var(--s-border);
      }
      .s-chat-messages {
        height: 150px;
        overflow-y: auto;
        padding: 10px 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .s-chat-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--s-text-muted);
        font-size: 0.8rem;
      }
      .s-chat-msg {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 8px;
        font-size: 0.85rem;
        line-height: 1.4;
      }
      .s-chat-msg.me .s-chat-name { color: var(--s-accent-light); }
      .s-chat-name {
        font-weight: 600;
        color: var(--s-text);
      }
      .s-chat-text {
        color: var(--s-text);
        word-break: break-word;
      }
      .s-chat-time {
        font-size: 0.7rem;
        color: var(--s-text-muted);
        margin-left: auto;
      }
      .s-chat-input-wrap {
        display: flex;
        gap: 8px;
        padding: 10px 16px;
        border-top: 1px solid var(--s-border);
      }
      .s-chat-input {
        flex: 1;
        padding: 10px 14px;
        background: var(--s-bg-secondary);
        border: 1px solid var(--s-border);
        border-radius: 10px;
        color: var(--s-text);
        font-size: 0.85rem;
      }
      .s-chat-input:focus {
        outline: none;
        border-color: var(--s-accent);
      }

      /* Premium Name Styles (matching cosmetics.js) */
      .s-name {
        display: inline;
      }
      
      /* Name Effects */
      .tgco-effect-glow { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor !important; }
      .tgco-effect-shadow { text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.9), 6px 6px 10px rgba(0, 0, 0, 0.5) !important; }
      .tgco-effect-shimmer { 
        background: linear-gradient(90deg, currentColor, white, currentColor) !important;
        background-size: 200% 100% !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        animation: tgcoShimmer 2s linear infinite !important;
      }
      .tgco-effect-neon { 
        text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor !important; 
      }
      @keyframes tgcoShimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Legacy effects (keep for compatibility) */
      .s-name.glow {
        text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
      }
      .s-name.rainbow {
        background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: rainbow 3s linear infinite;
      }
      @keyframes rainbow {
        to { background-position: 200% center; }
      }
      
      /* Premium title */
      .s-premium-title {
        font-size: 0.7rem;
        color: var(--s-text-muted);
        margin-top: 2px;
        display: block;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .s-profile-name .s-premium-title {
        font-size: 0.65rem;
        margin-top: 4px;
      }
      
      /* Badge icon (emoji style) */
      .s-badge-icon {
        font-size: 1rem;
        margin-right: 4px;
      }
      
      /* Legacy badge (text style) */
      .s-badge {
        font-size: 0.65rem;
        padding: 2px 6px;
        background: linear-gradient(135deg, var(--s-accent), #8b5cf6);
        color: white;
        border-radius: 4px;
        margin-left: 6px;
        font-weight: 600;
      }
      
      /* Border Colors (matching cosmetics.js) */
      .gray-border { border-color: #6b7280 !important; }
      .gold-border { border-color: #fbbf24 !important; background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), transparent) !important; }
      .diamond-border { border-color: #67e8f9 !important; background: linear-gradient(135deg, rgba(103, 232, 249, 0.1), transparent) !important; }
      .ruby-border { border-color: #f87171 !important; background: linear-gradient(135deg, rgba(248, 113, 113, 0.1), transparent) !important; }
      .emerald-border { border-color: #34d399 !important; background: linear-gradient(135deg, rgba(52, 211, 153, 0.1), transparent) !important; }
      .amethyst-border { border-color: #c084fc !important; background: linear-gradient(135deg, rgba(192, 132, 252, 0.1), transparent) !important; }
      .platinum-border { border-color: #e2e8f0 !important; background: linear-gradient(135deg, rgba(226, 232, 240, 0.1), transparent) !important; }
      .obsidian-border { border-color: #1e1b4b !important; background: linear-gradient(135deg, rgba(30, 27, 75, 0.2), transparent) !important; }
      .rose-border { border-color: #fb7185 !important; background: linear-gradient(135deg, rgba(251, 113, 133, 0.1), transparent) !important; }
      .rainbow-border {
        border-color: transparent !important;
        background: 
          linear-gradient(var(--s-bg-secondary), var(--s-bg-secondary)) padding-box,
          linear-gradient(90deg, #f87171, #fbbf24, #34d399, #67e8f9, #c084fc, #f87171) border-box !important;
        background-size: 100% 100%, 300% 100% !important;
        animation: tgcoRainbow 3s linear infinite !important;
      }
      @keyframes tgcoRainbow {
        0% { background-position: 0 0, 0% 0; }
        100% { background-position: 0 0, 300% 0; }
      }
      
      /* Apply borders to user cards and party members */
      .s-user[class*="-border"], .s-party-member[class*="-border"] {
        border: 2px solid;
        border-radius: 12px;
      }

      /* Status Selector */
      .s-status-selector {
        position: relative;
      }
      .s-status-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--s-bg-tertiary);
        border: 1px solid var(--s-border);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        color: var(--s-text);
        font-size: 0.85rem;
        width: 100%;
      }
      .s-status-btn svg { width: 14px; height: 14px; color: var(--s-text-muted); margin-left: auto; }
      .s-status-btn:hover { background: var(--s-bg-hover); border-color: var(--s-accent); }
      .s-status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--s-success);
        flex-shrink: 0;
      }
      .s-status-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 4px;
        background: var(--s-bg-secondary);
        border: 1px solid var(--s-border-light);
        border-radius: 10px;
        overflow: hidden;
        display: none;
        z-index: 100;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        backdrop-filter: blur(10px);
      }
      .s-status-dropdown.open { display: block; }
      .s-status-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        cursor: pointer;
        transition: background 0.2s;
        font-size: 0.85rem;
        color: var(--s-text);
        background: var(--s-bg-secondary);
      }
      .s-status-option:hover { background: var(--s-bg-tertiary); }
      .s-status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      /* Party Share Link */
      .s-party-share {
        padding: 12px 16px;
        border-top: 1px solid var(--s-border);
        background: rgba(99, 102, 241, 0.05);
      }
      .s-share-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .s-share-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .s-share-label {
        font-size: 0.75rem;
        color: var(--s-text-muted);
      }
      .s-share-code {
        font-family: 'SF Mono', 'Consolas', monospace;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--s-accent-light);
        background: rgba(99, 102, 241, 0.15);
        padding: 4px 10px;
        border-radius: 6px;
        letter-spacing: 0.05em;
      }

      /* No party - inline create */
      .s-no-party {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        background: var(--s-bg-secondary);
        border: 1px solid var(--s-border);
        border-radius: 12px;
        margin-bottom: 16px;
      }
      .s-no-party-text {
        font-size: 0.85rem;
        color: var(--s-text-secondary);
      }

      /* ===== INVITE CARDS ===== */
      .s-invite {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--s-bg-secondary);
        border: 1px solid var(--s-border);
        border-radius: 10px;
        margin-bottom: 8px;
      }
      .s-invite.game { border-left: 3px solid var(--s-accent); }
      .s-invite.party { border-left: 3px solid var(--s-warning); }
      .s-invite-icon {
        width: 38px;
        height: 38px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .s-invite-icon svg { width: 18px; height: 18px; }
      .s-invite.game .s-invite-icon { background: rgba(99, 102, 241, 0.12); color: var(--s-accent-light); }
      .s-invite.party .s-invite-icon { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
      .s-invite-info { flex: 1; min-width: 0; }
      .s-invite-title { font-weight: 500; font-size: 0.85rem; color: var(--s-text); }
      .s-invite-sub { font-size: 0.75rem; color: var(--s-text-muted); margin-top: 2px; }
      .s-invite-actions { display: flex; gap: 6px; }

      /* ===== OPTIONS MENU ===== */
      .s-options { position: relative; }
      .s-options-menu {
        position: absolute;
        top: 100%;
        right: 0;
        min-width: 140px;
        background: var(--s-bg-tertiary);
        border: 1px solid var(--s-border-light);
        border-radius: 10px;
        padding: 4px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-4px);
        transition: all 0.2s;
        z-index: 100;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      }
      .s-options-menu.open { opacity: 1; visibility: visible; transform: translateY(4px); }
      .s-options-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 9px 12px;
        background: transparent;
        border: none;
        color: var(--s-text-secondary);
        font-size: 0.8rem;
        cursor: pointer;
        border-radius: 6px;
        text-align: left;
        transition: all 0.15s;
      }
      .s-options-item svg { width: 15px; height: 15px; opacity: 0.7; }
      .s-options-item:hover { background: var(--s-bg-hover); color: var(--s-text); }
      .s-options-item.danger { color: #f87171; }
      .s-options-item.danger:hover { background: rgba(239, 68, 68, 0.1); }

      /* ===== EMPTY STATE ===== */
      .s-empty {
        text-align: center;
        padding: 40px 20px;
        color: var(--s-text-muted);
      }
      .s-empty-icon {
        width: 56px;
        height: 56px;
        margin: 0 auto 14px;
        background: var(--s-bg-secondary);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .s-empty-icon svg { width: 24px; height: 24px; opacity: 0.4; }
      .s-empty-text { font-size: 0.85rem; line-height: 1.5; }

      /* ===== TOAST ===== */
      #s-toasts {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
        max-width: calc(100vw - 32px);
      }
      .s-toast {
        background: var(--s-bg-tertiary);
        border: 1px solid var(--s-border-light);
        border-radius: 12px;
        padding: 14px;
        min-width: 300px;
        max-width: 360px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        pointer-events: auto;
        animation: toastIn 0.3s ease;
        display: flex;
        gap: 12px;
        position: relative;
      }
      .s-toast.game { border-left: 3px solid var(--s-accent); }
      .s-toast.party { border-left: 3px solid var(--s-warning); }
      .s-toast.friend { border-left: 3px solid var(--s-success); }
      .s-toast.follow { border-left: 3px solid var(--s-success); }
      .s-toast-icon {
        width: 38px;
        height: 38px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .s-toast-icon svg { width: 18px; height: 18px; }
      .s-toast.game .s-toast-icon { background: rgba(99, 102, 241, 0.12); color: var(--s-accent-light); }
      .s-toast.party .s-toast-icon { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
      .s-toast.friend .s-toast-icon { background: rgba(16, 185, 129, 0.12); color: #34d399; }
      .s-toast.follow .s-toast-icon { background: rgba(16, 185, 129, 0.12); color: #34d399; }
      .s-toast-content { flex: 1; }
      .s-toast-title { font-weight: 600; font-size: 0.85rem; color: var(--s-text); margin-bottom: 3px; }
      .s-toast-msg { font-size: 0.8rem; color: var(--s-text-secondary); }
      .s-toast-actions { display: flex; gap: 6px; margin-top: 10px; }
      .s-toast-close {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
        background: var(--s-bg-hover);
        border: none;
        border-radius: 6px;
        color: var(--s-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .s-toast-close svg { width: 12px; height: 12px; }
      .s-toast-close:hover { background: var(--s-bg-secondary); color: var(--s-text); }
      @keyframes toastIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .s-toast.removing { animation: toastOut 0.25s ease forwards; }
      @keyframes toastOut {
        to { transform: translateX(100%); opacity: 0; }
      }

      /* ===== V8: PROFILE MODAL ===== */
      .s-modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .s-profile-modal {
        background: var(--s-bg-primary);
        border: 1px solid var(--s-border);
        border-radius: 20px;
        width: 90%;
        max-width: 380px;
        max-height: 85vh;
        overflow-y: auto;
        position: relative;
        animation: modalIn 0.25s ease;
      }
      @keyframes modalIn { from { transform: scale(0.95) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
      .s-modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: var(--s-bg-secondary);
        border: 1px solid var(--s-border);
        color: var(--s-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }
      .s-modal-close:hover { background: var(--s-bg-tertiary); color: var(--s-text); }
      .s-modal-close svg { width: 16px; height: 16px; }
      
      .s-pm-header {
        padding: 24px;
        text-align: center;
        border-bottom: 1px solid var(--s-border);
      }
      .s-pm-avatar {
        width: 80px;
        height: 80px;
        border-radius: 16px;
        margin: 0 auto 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 600;
        color: white;
        background-size: cover;
        background-position: center;
        border: 3px solid var(--s-border);
        cursor: pointer;
        transition: transform 0.2s;
      }
      .s-pm-avatar:hover { transform: scale(1.05); }
      .s-pm-name {
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--s-text);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .s-pm-name .disc { color: var(--s-text-muted); font-weight: 400; }
      .s-pm-title {
        font-size: 0.85rem;
        margin-top: 4px;
      }
      .s-pm-club-tag {
        display: inline-block;
        padding: 4px 10px;
        background: var(--s-accent);
        color: white;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        margin-top: 8px;
      }
      .s-pm-stats {
        display: flex;
        justify-content: center;
        gap: 24px;
        padding: 16px;
        border-bottom: 1px solid var(--s-border);
      }
      .s-pm-stat {
        text-align: center;
      }
      .s-pm-stat-value {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--s-text);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .s-pm-stat-value svg { width: 16px; height: 16px; color: var(--s-text-muted); }
      .s-pm-stat-label {
        font-size: 0.7rem;
        color: var(--s-text-muted);
        margin-top: 2px;
      }
      
      .s-pm-scores {
        padding: 16px;
      }
      .s-pm-scores-title {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--s-text-muted);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .s-pm-scores-title svg { width: 14px; height: 14px; }
      .s-pm-score-row {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        background: var(--s-bg-secondary);
        border-radius: 10px;
        margin-bottom: 6px;
      }
      .s-pm-score-game {
        flex: 1;
        font-size: 0.85rem;
        color: var(--s-text);
      }
      .s-pm-score-value {
        font-weight: 600;
        color: var(--s-accent);
        margin-right: 12px;
      }
      .s-pm-score-rank {
        font-size: 0.75rem;
        color: var(--s-text-muted);
        padding: 4px 8px;
        background: var(--s-bg-tertiary);
        border-radius: 6px;
      }
      .s-pm-score-rank.gold { color: #fbbf24; background: rgba(251, 191, 36, 0.15); }
      
      .s-pm-actions {
        display: flex;
        gap: 8px;
        padding: 16px;
        border-top: 1px solid var(--s-border);
      }
      .s-pm-actions .s-btn { flex: 1; }

      /* ===== V8: EMOJI PICKER ===== */
      .s-emoji-picker {
        position: fixed;
        background: var(--s-bg-secondary);
        border: 1px solid var(--s-border);
        border-radius: 12px;
        padding: 8px;
        z-index: 10001;
        animation: fadeIn 0.15s ease;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      }
      .s-emoji-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 4px;
      }
      .s-emoji-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
      }
      .s-emoji-btn:hover { background: var(--s-bg-tertiary); }

      /* ===== V8: TYPING INDICATOR ===== */
      .s-typing-indicator {
        padding: 8px 12px;
        font-size: 0.75rem;
        color: var(--s-text-muted);
        font-style: italic;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .s-typing-dots {
        display: flex;
        gap: 3px;
      }
      .s-typing-dots span {
        width: 6px;
        height: 6px;
        background: var(--s-text-muted);
        border-radius: 50%;
        animation: typingBounce 1.2s ease-in-out infinite;
      }
      .s-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
      .s-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-4px); }
      }

      /* ===== V8: FLOATING DM POPUP ===== */
      .s-dm-popup {
        position: fixed;
        bottom: 20px;
        right: 420px;
        width: 320px;
        height: 400px;
        background: var(--s-bg-primary);
        border: 1px solid var(--s-border);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        z-index: 10000;
        animation: popupIn 0.2s ease;
      }
      @keyframes popupIn {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .s-dm-popup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        border-bottom: 1px solid var(--s-border);
        background: var(--s-bg-secondary);
        border-radius: 16px 16px 0 0;
      }
      .s-dm-popup-user {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .s-dm-popup-user span {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--s-text);
      }
      .s-dm-popup-close {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        background: transparent;
        border: none;
        color: var(--s-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .s-dm-popup-close:hover { background: var(--s-bg-tertiary); color: var(--s-text); }
      .s-dm-popup-close svg { width: 16px; height: 16px; }
      .s-dm-popup-messages {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .s-dm-popup-messages::-webkit-scrollbar { width: 4px; }
      .s-dm-popup-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      .s-dm-msg {
        max-width: 80%;
        padding: 8px 12px;
        border-radius: 14px;
        font-size: 0.85rem;
        word-wrap: break-word;
      }
      .s-dm-msg.me {
        align-self: flex-end;
        background: var(--s-accent);
        color: white;
        border-bottom-right-radius: 4px;
      }
      .s-dm-msg.them {
        align-self: flex-start;
        background: var(--s-bg-tertiary);
        color: var(--s-text);
        border-bottom-left-radius: 4px;
      }
      .s-dm-msg-time {
        font-size: 0.6rem;
        opacity: 0.6;
        margin-top: 4px;
      }
      .s-dm-popup-input {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-top: 1px solid var(--s-border);
        background: var(--s-bg-secondary);
        border-radius: 0 0 16px 16px;
      }
      .s-dm-popup-input input {
        flex: 1;
        background: var(--s-bg-tertiary);
        border: 1px solid var(--s-border);
        border-radius: 8px;
        padding: 8px 12px;
        color: var(--s-text);
        font-size: 0.85rem;
      }
      .s-dm-popup-input input:focus { outline: none; border-color: var(--s-accent); }
      .s-dm-popup-input input::placeholder { color: var(--s-text-muted); }
      .s-dm-popup-input .s-btn-icon { width: 32px; height: 32px; flex-shrink: 0; }
      
      /* Mobile: Full screen DM popup */
      @media (max-width: 768px) {
        .s-dm-popup {
          right: 10px;
          left: 10px;
          bottom: 10px;
          width: auto;
          height: 50vh;
          max-height: 400px;
        }
      }

      /* ===== V8: CLUB STYLES ===== */
      .s-club-create {
        text-align: center;
        padding: 30px 20px;
      }
      .s-club-create h3 {
        font-size: 1.1rem;
        color: var(--s-text);
        margin-bottom: 8px;
      }
      .s-club-create p {
        font-size: 0.85rem;
        color: var(--s-text-muted);
        margin-bottom: 20px;
      }
      
      .s-club-form {
        max-width: 280px;
        margin: 0 auto;
      }
      .s-club-form input {
        width: 100%;
        padding: 12px 14px;
        background: var(--s-bg-secondary);
        border: 1px solid var(--s-border);
        border-radius: 10px;
        color: var(--s-text);
        font-size: 0.9rem;
        margin-bottom: 10px;
      }
      .s-club-form input:focus { outline: none; border-color: var(--s-accent); }
      .s-club-form input::placeholder { color: var(--s-text-muted); }
      
      .s-club-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: var(--s-bg-secondary);
        border-radius: 12px;
        margin-bottom: 16px;
      }
      .s-club-avatar {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--s-accent), #6366f1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        font-weight: 700;
        color: white;
      }
      .s-club-info { flex: 1; }
      .s-club-name { font-weight: 600; font-size: 1rem; color: var(--s-text); }
      .s-club-tag-display {
        font-size: 0.8rem;
        color: var(--s-accent);
        font-weight: 600;
      }
      .s-club-members-count {
        font-size: 0.75rem;
        color: var(--s-text-muted);
      }

      /* ===== V8: BLOCKED USERS (Collapsible) ===== */
      .s-blocked-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        background: var(--s-bg-secondary);
        border-radius: 8px;
        cursor: pointer;
        margin-top: 16px;
      }
      .s-blocked-header:hover { background: var(--s-bg-tertiary); }
      .s-blocked-title {
        font-size: 0.8rem;
        color: var(--s-text-muted);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .s-blocked-title svg { width: 14px; height: 14px; }
      .s-blocked-arrow {
        color: var(--s-text-muted);
        transition: transform 0.2s;
      }
      .s-blocked-arrow svg { width: 14px; height: 14px; }
      .s-blocked-list {
        margin-top: 8px;
      }
      .s-blocked-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: var(--s-bg-secondary);
        border-radius: 8px;
        margin-bottom: 6px;
      }
      .s-blocked-name { font-size: 0.85rem; color: var(--s-text); }
      .s-btn-sm { padding: 4px 10px; font-size: 0.75rem; }

      .s-avatar-sm {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        color: white;
        background-size: cover;
        background-position: center;
      }
      .s-club-members-list {
        max-height: 200px;
        overflow-y: auto;
      }
      
      /* ===== V8: CONFIRM MODAL ===== */
      .s-confirm-modal {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        border-radius: 20px;
      }
      .s-confirm-content {
        background: var(--s-bg-primary);
        border: 1px solid var(--s-border);
        border-radius: 12px;
        padding: 20px;
        max-width: 280px;
        text-align: center;
      }
      .s-confirm-content p {
        font-size: 0.9rem;
        color: var(--s-text);
        margin-bottom: 16px;
      }
      .s-confirm-actions {
        display: flex;
        gap: 10px;
      }
      .s-confirm-actions .s-btn { flex: 1; }

      /* ===== V8: PROFILE MODAL "YOU" BADGE ===== */
      .s-pm-you-badge {
        display: inline-block;
        padding: 2px 8px;
        background: var(--s-accent);
        color: white;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 600;
        margin-top: 8px;
      }

      /* ===== MOBILE & RESPONSIVE ===== */
      @media (max-width: 480px) {
        .s-panel { max-width: 100%; width: 100%; right: 0; border-radius: 0; }
        .s-header { padding: 12px 16px; }
        .s-title { font-size: 1.1rem; }
        .s-profile { margin: 10px; padding: 12px; }
        .s-profile-avatar { width: 36px; height: 36px; }
        .s-profile-name { font-size: 0.85rem; }
        .s-search { margin: 0 10px 8px; }
        .s-search-input { padding: 10px 12px 10px 36px; font-size: 0.85rem; }
        .s-tabs { margin: 0 10px 8px; gap: 4px; flex-wrap: nowrap; overflow-x: auto; }
        .s-tabs .s-tab { padding: 6px 8px; font-size: 0.7rem; white-space: nowrap; flex-shrink: 0; }
        .s-tabs .s-tab svg { display: none; }
        .s-content { padding: 0 10px 10px; }
        .s-user { padding: 8px 10px; gap: 10px; }
        .s-avatar { width: 36px; height: 36px; }
        .s-user-name { font-size: 0.85rem; }
        .s-user-status { font-size: 0.7rem; }
        .s-btn { padding: 6px 10px; font-size: 0.8rem; }
        .s-btn-icon { width: 32px; height: 32px; }
        #s-toasts { top: 10px; right: 10px; left: 10px; }
        .s-toast { min-width: auto; width: 100%; padding: 12px; }
        .s-profile-modal { max-width: 100%; width: 95%; margin: 10px; max-height: 90vh; }
        .s-pm-header { padding: 16px; }
        .s-pm-avatar { width: 60px; height: 60px; }
        .s-pm-name { font-size: 1.1rem; }
        .s-pm-stats { padding: 12px; gap: 16px; }
        .s-pm-scores { padding: 12px; }
        .s-pm-score-row { padding: 8px 10px; }
        .s-pm-actions { padding: 12px; }
        .s-emoji-picker { left: 4px; right: 4px; }
        .s-emoji-grid { grid-template-columns: repeat(6, 1fr); }
        .s-emoji-btn { width: 36px; height: 36px; font-size: 1.1rem; }
        .s-dm-chat-header { padding: 10px; }
        .s-dm-messages { padding: 10px; }
        .s-dm-msg { max-width: 85%; padding: 8px 12px; font-size: 0.85rem; }
        .s-club-header { padding: 12px; }
        .s-club-avatar { width: 40px; height: 40px; font-size: 1rem; }
        .s-club-form input { padding: 10px 12px; }
      }

      /* Tablet */
      @media (min-width: 481px) and (max-width: 768px) {
        .s-panel { width: 360px; }
        .s-profile-modal { max-width: 360px; }
      }

      /* Safe areas for notched phones */
      @supports (padding: max(0px)) {
        .s-panel {
          padding-bottom: max(16px, env(safe-area-inset-bottom));
        }
        .s-header {
          padding-top: max(16px, env(safe-area-inset-top));
        }
      }

      /* Touch-friendly interactions */
      @media (hover: none) and (pointer: coarse) {
        .s-btn { min-height: 44px; }
        .s-tab { min-height: 40px; }
        .s-user { min-height: 60px; }
        .s-options-menu { min-width: 160px; }
        .s-options-item { padding: 12px 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ==================== HTML ====================

  injectHTML() {
    if (document.getElementById('social-v5')) return;

    // Add button to header
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
      const btn = document.createElement('button');
      btn.className = 'friends-header-btn';
      btn.id = 'friends-header-btn';
      btn.innerHTML = `${this.icons.users}<span class="notif-dot" id="notif-dot"></span>`;
      
      const navLoggedIn = headerActions.querySelector('.nav-right-logged-in');
      if (navLoggedIn) headerActions.insertBefore(btn, navLoggedIn);
      else headerActions.appendChild(btn);
    }

    // Use placeholders - updateNameplate() will fill in correct values
    const html = `
      <div class="s-overlay" id="s-overlay"></div>
      
      <div class="s-panel" id="s-panel">
        <div class="s-header">
          <h2 class="s-title">F R I E N D S</h2>
          <button class="s-close" id="s-close">${this.icons.x}</button>
        </div>
        
        <div class="s-profile" id="s-profile-section">
          <div class="s-profile-inner" id="s-profile-inner">
            <div class="s-profile-avatar" id="s-profile-avatar" style="cursor:pointer;" title="View Profile"></div>
            <div class="s-profile-info">
              <div class="s-profile-name" id="s-profile-name"></div>
              <div class="s-profile-tag">
                <code class="s-profile-code" id="my-handle"></code>
                <button class="s-copy-btn" id="copy-handle">${this.icons.copy}</button>
              </div>
            </div>
          </div>
          <div class="s-status-selector">
            <button class="s-status-btn" id="status-btn">
              <div class="s-status-indicator" id="status-indicator"></div>
              <span id="status-label">Online</span>
              ${this.icons.chevronDown}
            </button>
            <div class="s-status-dropdown" id="status-dropdown">
              <div class="s-status-option" data-status="online">
                <div class="s-status-dot" style="background:#22c55e"></div>Online
              </div>
              <div class="s-status-option" data-status="away">
                <div class="s-status-dot" style="background:#f59e0b"></div>Away
              </div>
              <div class="s-status-option" data-status="dnd">
                <div class="s-status-dot" style="background:#ef4444"></div>Do Not Disturb
              </div>
              <div class="s-status-option" data-status="invisible">
                <div class="s-status-dot" style="background:#6b7280"></div>Invisible
              </div>
            </div>
          </div>
        </div>
        
        <div class="s-search">
          <span class="s-search-icon">${this.icons.search}</span>
          <input type="text" class="s-search-input" id="s-search" placeholder="Add friend by Username#1234">
        </div>
        
        <div class="s-tabs">
          <button class="s-tab" data-tab="party">Party <span class="s-tab-count" id="party-invite-count" style="display:none;">0</span></button>
          <button class="s-tab active" data-tab="friends">Friends</button>
          <button class="s-tab" data-tab="club">Club</button>
          <button class="s-tab" data-tab="requests">! <span class="s-tab-count" id="req-count" style="display:none;">0</span></button>
        </div>
        
        <!-- Party invites banner - shows on ALL tabs when you have invites -->
        <div id="party-invites-banner"></div>
        
        <div class="s-content">
          <!-- Friends Tab -->
          <div class="s-tab-panel active" id="panel-friends">
            <div id="game-invites"></div>
            <div id="search-results"></div>
            <div id="friends-list"></div>
          </div>
          
          <!-- Party Tab -->
          <div class="s-tab-panel" id="panel-party">
            <div id="party-invites"></div>
            <div id="party-section"></div>
          </div>
          
          <!-- Club Tab -->
          <div class="s-tab-panel" id="panel-club">
            <div id="club-section"></div>
          </div>
          
          <!-- Requests Tab -->
          <div class="s-tab-panel" id="panel-requests">
            <div id="incoming-requests"></div>
            <div id="sent-requests"></div>
            <div id="blocked-section"></div>
          </div>
        </div>
      </div>
      
      <!-- Floating DM Popup -->
      <div id="s-dm-popup" class="s-dm-popup" style="display:none;">
        <div class="s-dm-popup-header" id="dm-popup-header">
          <div class="s-dm-popup-user">
            <div class="s-avatar-sm" id="dm-popup-avatar"></div>
            <span id="dm-popup-name">User</span>
          </div>
          <button class="s-dm-popup-close" id="dm-popup-close">${this.icons.x}</button>
        </div>
        <div class="s-dm-popup-messages" id="dm-popup-messages"></div>
        <div class="s-dm-popup-input">
          <button class="s-btn s-btn-ghost s-btn-icon" id="dm-popup-emoji">${this.icons.smile}</button>
          <input type="text" id="dm-popup-input" placeholder="Type a message...">
          <button class="s-btn s-btn-primary s-btn-icon" id="dm-popup-send">${this.icons.send}</button>
        </div>
      </div>
      
      <!-- Profile Modal -->
      <div id="s-profile-modal" class="s-modal-overlay" style="display:none;">
        <div class="s-profile-modal">
          <button class="s-modal-close" id="close-profile-modal">${this.icons.x}</button>
          <div id="profile-modal-content"></div>
        </div>
      </div>
      
      <!-- Emoji Picker -->
      <div id="s-emoji-picker" class="s-emoji-picker" style="display:none;">
        <div class="s-emoji-grid">
          ${this.commonEmojis.map(e => `<button class="s-emoji-btn" data-emoji="${e}">${e}</button>`).join('')}
        </div>
      </div>
      
      <div id="s-toasts"></div>
    `;
    
    const container = document.createElement('div');
    container.id = 'social-v5';
    container.innerHTML = html;
    document.body.appendChild(container);
  }

  getAvatarStyle(profile) {
    if (profile?.avatar_url) {
      return `background-image: url('${profile.avatar_url}');`;
    }
    const iconIndex = profile?.avatar_icon || 0;
    const icon = this.avatarIcons[iconIndex] || this.avatarIcons[0];
    return `background: linear-gradient(135deg, ${icon.gradient[0]} 0%, ${icon.gradient[1]} 100%);`;
  }

  // ==================== EVENTS ====================

  bindEvents() {
    document.getElementById('friends-header-btn')?.addEventListener('click', () => {
      this.toggle();
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    });
    document.getElementById('s-close')?.addEventListener('click', () => this.close());
    document.getElementById('s-overlay')?.addEventListener('click', () => this.close());
    document.getElementById('copy-handle')?.addEventListener('click', () => this.copyHandle());
    
    document.addEventListener('keydown', (e) => { 
      if (e.key === 'Escape') {
        if (document.getElementById('s-profile-modal')?.style.display !== 'none') {
          this.closeProfileModal();
        } else if (this.isOpen) {
          this.close();
        }
      }
    });
    
    document.querySelectorAll('.s-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });
    
    const searchInput = document.getElementById('s-search');
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.searchUsers(e.target.value), 300);
    });
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.s-options')) {
        document.querySelectorAll('.s-options-menu.open').forEach(m => m.classList.remove('open'));
      }
      if (!e.target.closest('.s-status-selector')) {
        document.getElementById('status-dropdown')?.classList.remove('open');
      }
      // V8: Close emoji picker when clicking outside
      if (!e.target.closest('.s-emoji-picker') && !e.target.closest('#dm-popup-emoji') && !e.target.closest('#party-emoji-btn')) {
        const picker = document.getElementById('s-emoji-picker');
        if (picker) picker.style.display = 'none';
      }
    });

    // Status selector
    document.getElementById('status-btn')?.addEventListener('click', () => {
      document.getElementById('status-dropdown')?.classList.toggle('open');
    });
    document.querySelectorAll('.s-status-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const status = opt.dataset.status;
        this.setUserStatus(status);
        document.getElementById('status-dropdown')?.classList.remove('open');
        document.getElementById('status-label').textContent = opt.textContent.trim();
      });
    });

    // V8: Profile modal close
    document.getElementById('close-profile-modal')?.addEventListener('click', () => this.closeProfileModal());
    document.getElementById('s-profile-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 's-profile-modal') this.closeProfileModal();
    });

    // V8: View own profile by clicking avatar
    document.getElementById('s-profile-avatar')?.addEventListener('click', () => {
      if (this.currentUser) this.openProfileModal(this.currentUser.id);
    });

    // V8: Emoji picker buttons
    document.querySelectorAll('.s-emoji-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.insertEmoji(btn.dataset.emoji);
      });
    });

    // V8: DM Popup events
    document.getElementById('dm-popup-close')?.addEventListener('click', () => this.closeDmChat());
    document.getElementById('dm-popup-send')?.addEventListener('click', () => this.sendDm());
    document.getElementById('dm-popup-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendDm();
    });
    document.getElementById('dm-popup-emoji')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleEmojiPicker('dm-popup-input');
    });
  }

  toggle() { this.isOpen ? this.close() : this.open(); }
  
  open() {
    this.isOpen = true;
    document.getElementById('s-panel')?.classList.add('open');
    document.getElementById('s-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.stopTitleFlash();
  }
  
  close() {
    this.isOpen = false;
    document.getElementById('s-panel')?.classList.remove('open');
    document.getElementById('s-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }
  
  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.s-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.s-tab-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
  }

  // ==================== REALTIME ====================

  subscribeToRealtime() {
    const myId = this.currentUser.id;
    
    // Game invites subscription
    this.channels.invites = this.supabase.channel(`game-invites-${myId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_invites' }, async (payload) => {
        // Client-side filter
        if (payload.new.to_user !== myId) return;
        
        await this.loadInvites();
        this.updateNotificationBadge();
        this.playSound('invite');
        const { data: sender } = await this.supabase.from('profiles').select('display_name, gamer_tag').eq('id', payload.new.from_user).single();
        const name = sender?.gamer_tag || sender?.display_name || 'Someone';
        this.showToast('game', 'Game Invite', `${name} invited you to ${payload.new.game_name}`, [
          { label: 'Join', style: 'primary', action: `acceptInvite:${payload.new.id}:${payload.new.game_name}:${payload.new.room_code}` },
          { label: 'Ignore', action: `declineInvite:${payload.new.id}` }
        ]);
      }).subscribe((status) => {
        console.log('Game invites subscription:', status);
      });

    // Friend requests subscription
    this.channels.requests = this.supabase.channel(`friend-requests-${myId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friend_requests' }, async (payload) => {
        // Client-side filter
        if (payload.new.to_user !== myId) return;
        
        await this.loadRequests();
        this.updateNotificationBadge();
        this.playSound('notification');
        const { data: sender } = await this.supabase.from('profiles').select('display_name, gamer_tag, discriminator').eq('id', payload.new.from_user).single();
        const name = sender?.gamer_tag || sender?.display_name || 'Someone';
        const tag = sender?.discriminator ? `#${sender.discriminator}` : '';
        this.showToast('friend', 'Friend Request', `${name}${tag} wants to be friends`, [
          { label: 'Accept', style: 'primary', action: `acceptRequest:${payload.new.id}` },
          { label: 'Decline', action: `declineRequest:${payload.new.id}` }
        ]);
      }).subscribe((status) => {
        console.log('Friend requests subscription:', status);
      });

    // Party invites subscription
    this.channels.partyInvites = this.supabase.channel(`party-invites-${myId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'party_invites'
      }, async (payload) => {
        console.log('🎉 Party invite INSERT:', payload);
        // Client-side filter
        if (payload.new.to_user !== myId) return;
        
        console.log('✅ Party invite is for me!');
        await this.loadPartyInvites();
        this.updateNotificationBadge();
        this.playSound('invite');
        this.flashTitle('Party Invite!');
        const { data: sender } = await this.supabase.from('profiles').select('display_name, gamer_tag').eq('id', payload.new.from_user).single();
        const name = sender?.gamer_tag || sender?.display_name || 'Someone';
        this.showToast('party', 'Party Invite!', `${name} invited you to their party!`, [
          { label: 'Join', style: 'primary', action: `acceptPartyInvite:${payload.new.id}` },
          { label: 'Decline', action: `declinePartyInvite:${payload.new.id}` }
        ]);
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'party_invites'
      }, async (payload) => {
        if (payload.new.to_user === myId) {
          await this.loadPartyInvites();
        }
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'party_invites'
      }, async (payload) => {
        if (payload.old.to_user === myId) {
          await this.loadPartyInvites();
        }
      })
      .subscribe((status) => {
        console.log('Party invites subscription:', status);
      });

    // NOTE: Party subscription is handled by loadParty() when user is in a party
    // Don't call subscribeToParty() here to avoid duplicate subscriptions
  }

  subscribeToParty() {
    // Prevent double subscription - remove existing first
    if (this.channels.party) {
      console.log('Removing existing party subscription');
      this.supabase.removeChannel(this.channels.party);
      this.channels.party = null;
    }
    
    if (!this.currentParty) {
      console.log('No party to subscribe to');
      return;
    }

    const partyId = this.currentParty.party_id;
    const myId = this.currentUser.id;
    console.log('Subscribing to party:', partyId);

    // Use unique channel name with timestamp to prevent conflicts
    const channelName = `party-${partyId}-${Date.now()}`;
    
    this.channels.party = this.supabase.channel(channelName)
      // Party updates (status, game, leader changes)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'parties'
      }, async (payload) => {
        // Client-side filter - only react to our party
        const relevantId = payload.new?.id || payload.old?.id;
        if (relevantId !== partyId) return;
        
        console.log('Party update:', payload.eventType, payload);
        
        if (payload.eventType === 'DELETE') {
          console.log('Party was deleted');
          this.handleKickedOrDisbanded('The party has been disbanded');
          return;
        }
        
        const oldUrl = this.lastHostUrl;
        await this.loadParty();
        
        // Auto-follow host to new game
        if (this.currentParty && this.currentParty.leader_id !== myId && this.isFollowingHost) {
          const newUrl = this.currentParty.current_room;
          if (newUrl && newUrl !== oldUrl && newUrl !== window.location.pathname + window.location.search) {
            this.showToast('follow', 'Following Host', `Joining ${this.currentParty.current_game}...`, []);
            setTimeout(() => { window.location.href = newUrl; }, 1200);
          }
        }
        this.lastHostUrl = this.currentParty?.current_room || null;
      })
      // Member joined
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'party_members'
      }, async (payload) => {
        // Client-side filter
        if (payload.new.party_id !== partyId) return;
        
        console.log('Member joined:', payload.new.user_id);
        
        // Reload party to get updated member list
        await this.loadParty();
        this.playSound('join');
        
        if (payload.new.user_id !== myId) {
          const member = this.partyMembers.find(m => m.id === payload.new.user_id);
          const name = member?.name || 'Someone';
          this.showToast('party', 'Member Joined', `${name} joined the party!`, []);
        }
      })
      // Member left or was kicked
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'party_members'
      }, async (payload) => {
        // Client-side filter
        if (payload.old.party_id !== partyId) return;
        
        console.log('Member removed:', payload.old.user_id, 'Me:', myId);
        
        // Check if I was kicked
        if (payload.old.user_id === myId) {
          console.log('I was kicked!');
          this.handleKickedOrDisbanded('You have been removed from the party');
          return;
        }
        
        // Someone else left - reload party
        const memberName = this.partyMembers.find(m => m.id === payload.old.user_id)?.name || 'Someone';
        await this.loadParty();
        this.showToast('party', 'Member Left', `${memberName} left the party`, []);
      })
      .subscribe((status, err) => {
        console.log('Party subscription:', status, err || '');
        if (status === 'CHANNEL_ERROR') {
          console.error('Party channel error, retrying in 2s...');
          setTimeout(() => this.subscribeToParty(), 2000);
        }
      });
  }
  
  // Centralized cleanup when kicked or party disbanded
  handleKickedOrDisbanded(message) {
    console.log('Cleaning up party state:', message);
    
    // Clear state
    this.currentParty = null;
    this.partyMembers = [];
    this.partyMessages = [];
    
    // Remove subscriptions
    if (this.channels.party) {
      this.supabase.removeChannel(this.channels.party);
      this.channels.party = null;
    }
    if (this.chatChannel) {
      this.supabase.removeChannel(this.chatChannel);
      this.chatChannel = null;
    }
    
    // Stop activity ping
    this.stopActivityPing();
    
    // Update UI
    this.renderParty();
    this.renderFriends();
    
    // Notify user
    this.showToast('party', 'Party Ended', message);
  }

  // ==================== TOAST ====================

  showToast(type, title, message, actions = []) {
    const container = document.getElementById('s-toasts');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `s-toast ${type}`;
    
    const iconMap = { game: this.icons.gamepad, party: this.icons.users, friend: this.icons.userPlus, follow: this.icons.link, message: this.icons.message };
    
    toast.innerHTML = `
      <div class="s-toast-icon">${iconMap[type] || this.icons.users}</div>
      <div class="s-toast-content">
        <div class="s-toast-title">${this.escapeHtml(title)}</div>
        <div class="s-toast-msg">${this.escapeHtml(message)}</div>
        ${actions.length ? `<div class="s-toast-actions">${actions.map(a => 
          `<button class="s-btn ${a.style === 'primary' ? 's-btn-primary' : 's-btn-secondary'}" data-action="${a.action}">${a.label}</button>`
        ).join('')}</div>` : ''}
      </div>
      <button class="s-toast-close">${this.icons.x}</button>
    `;

    toast.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleToastAction(btn.dataset.action);
        this.removeToast(toast);
      });
    });
    toast.querySelector('.s-toast-close').addEventListener('click', () => this.removeToast(toast));
    
    container.appendChild(toast);
    setTimeout(() => this.removeToast(toast), 10000);
  }

  removeToast(toast) {
    if (!toast?.parentNode) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 250);
  }

  handleToastAction(action) {
    const [method, ...args] = action.split(':');
    const handlers = {
      acceptInvite: () => this.acceptInvite(args[0], args[1], args[2]),
      declineInvite: () => this.declineInvite(args[0]),
      acceptRequest: () => this.acceptRequest(args[0]),
      declineRequest: () => this.declineRequest(args[0]),
      acceptPartyInvite: () => this.acceptPartyInvite(args[0]),
      declinePartyInvite: () => this.declinePartyInvite(args[0])
    };
    handlers[method]?.();
  }

  updateNotificationBadge() {
    const count = this.pendingRequests.length + this.gameInvites.length + this.partyInvites.length;
    const dot = document.getElementById('notif-dot');
    const reqCount = document.getElementById('req-count');
    
    dot?.classList.toggle('visible', count > 0);
    
    if (reqCount) {
      reqCount.textContent = this.pendingRequests.length;
      reqCount.style.display = this.pendingRequests.length > 0 ? 'flex' : 'none';
    }

    this.notificationCount = count;
    if (count > 0 && !this.isOpen) {
      document.title = `(${count}) ${this.originalTitle}`;
      this.startTitleFlash();
    } else {
      document.title = this.originalTitle;
      this.stopTitleFlash();
    }
  }

  startTitleFlash() {
    if (this.titleFlashInterval) return;
    let alt = false;
    this.titleFlashInterval = setInterval(() => {
      document.title = alt ? `(${this.notificationCount}) ${this.originalTitle}` : this.originalTitle;
      alt = !alt;
    }, 1500);
  }

  stopTitleFlash() {
    if (this.titleFlashInterval) { clearInterval(this.titleFlashInterval); this.titleFlashInterval = null; }
    document.title = this.originalTitle;
  }

  // ==================== DATA ====================

  async loadUserProfile() {
    try {
      const { data } = await this.supabase.from('profiles')
        .select('id, display_name, gamer_tag, discriminator, avatar_url, avatar_icon, account_type, cosmetics, user_status')
        .eq('id', this.currentUser.id)
        .single();
      
      const cosmetics = data?.cosmetics || {};
      const isPremium = data?.account_type === 'premium';
      
      this.userProfile = {
        ...data,
        isPremium: isPremium,
        cosmetics: cosmetics,
        badge_icon: isPremium ? cosmetics.badge_icon : null,
        border_color: isPremium ? cosmetics.border_color : 'gray',
        name_effect: isPremium ? cosmetics.name_effect : 'none',
        title: isPremium ? cosmetics.title : null
      };
      this.userStatus = data?.user_status || 'online';
    } catch (e) { console.error(e); }
  }

  generateHandle() {
    const { gamer_tag, display_name, discriminator } = this.userProfile || {};
    if (gamer_tag && discriminator) return `${gamer_tag}#${discriminator}`;
    if (display_name && discriminator) return `${display_name}#${discriminator}`;
    return this.currentUser?.id?.substring(0, 8).toUpperCase() || 'USER';
  }

  async loadFriends() {
    try {
      const { data } = await this.supabase.rpc('get_friends_with_presence');
      // Map friends with cosmetics format
      this.friends = (data || []).map(f => {
        const cosmetics = f.cosmetics || {};
        const isPremium = f.account_type === 'premium';
        return {
          ...f,
          isPremium: isPremium,
          cosmetics: cosmetics,
          badge_icon: isPremium ? cosmetics.badge_icon : null,
          border_color: isPremium ? cosmetics.border_color : 'gray',
          name_effect: isPremium ? cosmetics.name_effect : 'none',
          title: isPremium ? cosmetics.title : null
        };
      });
      this.renderFriends();
    } catch (e) { console.error(e); this.friends = []; this.renderFriends(); }
  }

  async loadRequests() {
    try {
      const [incoming, sent] = await Promise.all([
        this.supabase.from('friend_requests').select('id, from_user, profiles!friend_requests_from_user_fkey(display_name, gamer_tag, discriminator, avatar_url, avatar_icon)').eq('to_user', this.currentUser.id).eq('status', 'pending'),
        this.supabase.from('friend_requests').select('id, to_user, profiles!friend_requests_to_user_fkey(display_name, gamer_tag, discriminator, avatar_url, avatar_icon)').eq('from_user', this.currentUser.id).eq('status', 'pending')
      ]);
      this.pendingRequests = incoming.data || [];
      this.sentRequests = sent.data || [];
      this.renderRequests();
      this.updateNotificationBadge();
    } catch (e) { console.error(e); }
  }

  async loadInvites() {
    try {
      const { data } = await this.supabase.from('game_invites')
        .select('id, from_user, game_name, room_code, profiles!game_invites_from_user_fkey(display_name, gamer_tag, avatar_url, avatar_icon)')
        .eq('to_user', this.currentUser.id).eq('status', 'pending').gt('expires_at', new Date().toISOString());
      this.gameInvites = data || [];
      this.renderInvites();
    } catch (e) { console.error(e); }
  }

  // Cosmetic colors map (matches cosmetics.js)
  COSMETIC_COLORS = {
    gray: '#6b7280',
    gold: '#fbbf24',
    diamond: '#67e8f9',
    ruby: '#f87171',
    emerald: '#34d399',
    amethyst: '#c084fc',
    platinum: '#e2e8f0',
    obsidian: '#1e1b4b',
    rose: '#fb7185',
    rainbow: 'linear-gradient(90deg, #f87171, #fbbf24, #34d399, #67e8f9, #c084fc)'
  };

  async loadParty() {
    try {
      const { data, error } = await this.supabase.rpc('get_my_party');
      
      if (error) {
        console.error('Load party error:', error);
        return;
      }
      
      const wasInParty = !!this.currentParty;
      const oldPartyId = this.currentParty?.party_id;
      
      if (data?.length > 0) {
        this.currentParty = {
          party_id: data[0].party_id,
          party_name: data[0].party_name,
          leader_id: data[0].leader_id,
          current_game: data[0].current_game,
          current_room: data[0].current_room,
          status: data[0].status,
          max_size: data[0].max_size || 20,
          invite_code: data[0].invite_code,
          last_activity: data[0].last_activity
        };
        
        // Map members with cosmetics JSON format
        this.partyMembers = data.map(m => {
          const cosmetics = m.member_cosmetics || {};
          const isPremium = m.member_account_type === 'premium';
          return {
            id: m.member_id, 
            name: m.member_gamer_tag || m.member_name,
            discriminator: m.member_discriminator, 
            role: m.member_role, 
            status: m.member_status,
            avatar_url: m.member_avatar_url,
            avatar_icon: m.member_avatar_icon,
            // Cosmetics (matching cosmetics.js format)
            isPremium: isPremium,
            cosmetics: cosmetics,
            badge_icon: isPremium ? cosmetics.badge_icon : null,
            border_color: isPremium ? cosmetics.border_color : 'gray',
            name_effect: isPremium ? cosmetics.name_effect : 'none',
            title: isPremium ? cosmetics.title : null,
            border_style: isPremium ? cosmetics.border_style : 'solid'
          };
        });
        
        console.log('Party members:', this.partyMembers.map(m => ({ 
          name: m.name, 
          isPremium: m.isPremium,
          cosmetics: m.cosmetics
        })));
        
        this.lastHostUrl = this.currentParty.current_room;
        
        // Only subscribe if party changed or first time (not on regular reloads)
        if (!wasInParty || oldPartyId !== this.currentParty.party_id) {
          console.log('Party changed, setting up new subscriptions');
          this.subscribeToParty();
          this.subscribeToPartyChat();
        }
        
        // Start activity ping
        this.startActivityPing();
        
      } else {
        // No longer in a party - cleanup everything
        if (wasInParty) {
          console.log('No longer in party, cleaning up');
          this.cleanupPartySubscriptions();
        }
        this.currentParty = null;
        this.partyMembers = [];
        this.partyMessages = [];
        this.stopActivityPing();
      }
      this.renderParty();
    } catch (e) { console.error('Load party exception:', e); }
  }
  
  // Clean up all party-related subscriptions
  cleanupPartySubscriptions() {
    if (this.channels.party) {
      console.log('Removing party channel');
      this.supabase.removeChannel(this.channels.party);
      this.channels.party = null;
    }
    if (this.chatChannel) {
      console.log('Removing chat channel');
      this.supabase.removeChannel(this.chatChannel);
      this.chatChannel = null;
    }
  }
  
  // Activity ping to keep party alive AND sync members as fallback
  startActivityPing() {
    this.stopActivityPing();
    
    // Ping server every minute to keep party alive
    this.activityInterval = setInterval(async () => {
      if (this.currentParty) {
        try {
          await this.supabase.rpc('update_party_activity');
        } catch (e) { /* ignore */ }
        
        // Also reload party as fallback in case realtime missed an event
        // This ensures host always sees current members within 1 minute
        const oldCount = this.partyMembers.length;
        await this.loadParty();
        const newCount = this.partyMembers.length;
        
        // If member count changed and we didn't already show a notification, log it
        if (oldCount !== newCount) {
          console.log('Party sync: member count changed', oldCount, '->', newCount);
        }
      }
    }, 60000);
    
    // Also do an immediate sync after a short delay (catches missed events on page load)
    setTimeout(() => {
      if (this.currentParty) {
        this.loadParty();
      }
    }, 3000);
  }
  
  stopActivityPing() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
  }

  async loadPartyInvites() {
    try {
      const { data } = await this.supabase.from('party_invites')
        .select('id, party_id, from_user, profiles!party_invites_from_user_fkey(display_name, gamer_tag, avatar_url, avatar_icon)')
        .eq('to_user', this.currentUser.id).eq('status', 'pending').gt('expires_at', new Date().toISOString());
      this.partyInvites = data || [];
      this.renderPartyInvites();
    } catch (e) { console.error(e); }
  }

  // ==================== RENDERING ====================

  renderFriends() {
    const container = document.getElementById('friends-list');
    if (!container) return;

    if (!this.friends.length) {
      container.innerHTML = `
        <div class="s-empty">
          <div class="s-empty-icon">${this.icons.users}</div>
          <p class="s-empty-text">No friends yet<br>Search above to add friends</p>
        </div>`;
      return;
    }

    const online = this.friends.filter(f => f.status === 'online' || f.status === 'in_game');
    const offline = this.friends.filter(f => !f.status || f.status === 'offline');

    let html = '';
    if (online.length) {
      html += `<div class="s-label">Online - ${online.length}</div>`;
      html += online.map(f => this.renderFriendCard(f)).join('');
    }
    if (offline.length) {
      html += `<div class="s-label">Offline - ${offline.length}</div>`;
      html += offline.map(f => this.renderFriendCard(f)).join('');
    }
    container.innerHTML = html;
    this.bindFriendActions();
  }

  renderFriendCard(f) {
    const name = f.gamer_tag || f.display_name || 'Unknown';
    const initial = name[0].toUpperCase();
    const tag = f.discriminator ? `#${f.discriminator}` : '';
    const statusClass = f.status === 'in_game' ? 'in-game' : f.status === 'online' ? 'online' : '';
    const avatarClass = (!f.status || f.status === 'offline') ? 'offline' : '';
    const statusText = f.status === 'in_game' ? `Playing ${f.current_game || 'a game'}` : f.status === 'online' ? 'Online' : f.last_seen ? `${this.timeAgo(new Date(f.last_seen))}` : 'Offline';
    const avatarStyle = this.getAvatarStyle(f);
    const nameStyle = this.getPremiumNameStyle(f);
    const nameEffectClass = this.getNameEffectClass(f);
    const borderClass = this.getBorderColorClass(f);
    
    const isOnline = f.status === 'online' || f.status === 'in_game';
    const canInviteToGame = isOnline && this.isInLobby();
    const canJoin = f.status === 'in_game' && f.current_room;
    const canPartyInvite = this.isPartyLeader();

    let actions = '';
    
    // Party invite button - show for party leaders
    if (canPartyInvite) {
      actions += `<button class="s-btn s-btn-primary s-btn-icon party-invite-btn" data-id="${f.friend_id}" title="Invite to Party">${this.icons.userPlus}</button>`;
    }
    
    // Join/Invite to game buttons
    if (canJoin) {
      actions += `<button class="s-btn s-btn-success join-btn" data-id="${f.friend_id}" data-game="${f.current_game}" data-room="${f.current_room}">Join</button>`;
    } else if (canInviteToGame) {
      actions += `<button class="s-btn s-btn-secondary invite-btn" data-id="${f.friend_id}">Invite</button>`;
    }

    // Cosmetics format - badge_icon and title
    const badge = f.badge_icon || f.cosmetics?.badge_icon;
    const title = f.title || f.cosmetics?.title;
    const borderColor = f.border_color || f.cosmetics?.border_color || 'gray';
    const titleColor = f.isPremium ? (this.COSMETIC_COLORS[borderColor] || this.COSMETIC_COLORS.gray) : '';
    
    let badgeHtml = badge && f.isPremium ? `<span class="s-badge-icon">${badge}</span>` : '';
    let titleHtml = title && f.isPremium ? `<div class="s-premium-title" style="color: ${titleColor};">${this.escapeHtml(title)}</div>` : '';

    // Add border class for premium users
    const userClass = f.isPremium && borderClass ? `s-user ${borderClass}` : 's-user';

    return `
      <div class="${userClass}" data-id="${f.friend_id}">
        <div class="s-avatar ${avatarClass} clickable-profile" style="${avatarStyle};cursor:pointer;" data-uid="${f.friend_id}">${f.avatar_url ? '' : initial}<div class="s-status-dot ${statusClass}"></div></div>
        <div class="s-user-info clickable-profile" style="cursor:pointer;" data-uid="${f.friend_id}">
          <div class="s-user-name">${badgeHtml}<span class="s-name ${nameEffectClass}" style="${nameStyle}">${this.escapeHtml(name)}</span><span class="disc">${tag}</span></div>
          ${titleHtml}
          <div class="s-user-status ${f.status === 'in_game' ? 'playing' : ''}">${statusText}</div>
        </div>
        <div class="s-user-actions">
          ${actions}
          <div class="s-options">
            <button class="s-btn s-btn-ghost s-btn-icon options-btn">${this.icons.moreVertical}</button>
            <div class="s-options-menu">
              <button class="s-options-item unfriend-btn" data-id="${f.friend_id}">${this.icons.userMinus} Remove</button>
              <button class="s-options-item danger block-btn" data-id="${f.friend_id}">${this.icons.shield} Block</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  renderRequests() {
    const incoming = document.getElementById('incoming-requests');
    const sent = document.getElementById('sent-requests');
    
    if (incoming) {
      if (this.pendingRequests.length) {
        incoming.innerHTML = `<div class="s-label">Incoming</div>` + this.pendingRequests.map(r => {
          const p = r.profiles || {};
          const name = p.gamer_tag || p.display_name || 'Unknown';
          const tag = p.discriminator ? `#${p.discriminator}` : '';
          const avatarStyle = this.getAvatarStyle(p);
          return `
            <div class="s-user">
              <div class="s-avatar" style="${avatarStyle}">${p.avatar_url ? '' : name[0].toUpperCase()}</div>
              <div class="s-user-info">
                <div class="s-user-name">${this.escapeHtml(name)}<span class="disc">${tag}</span></div>
                <div class="s-user-status">Wants to be friends</div>
              </div>
              <div class="s-user-actions">
                <button class="s-btn s-btn-success s-btn-icon accept-req-btn" data-id="${r.id}">${this.icons.check}</button>
                <button class="s-btn s-btn-secondary s-btn-icon decline-req-btn" data-id="${r.id}">${this.icons.x}</button>
              </div>
            </div>`;
        }).join('');
      } else { 
        incoming.innerHTML = `
          <div class="s-empty">
            <div class="s-empty-icon">${this.icons.users}</div>
            <p class="s-empty-text">No pending requests</p>
          </div>`; 
      }
    }
    
    if (sent) {
      if (this.sentRequests.length) {
        sent.innerHTML = `<div class="s-label">Sent</div>` + this.sentRequests.map(r => {
          const p = r.profiles || {};
          const name = p.gamer_tag || p.display_name || 'Unknown';
          const avatarStyle = this.getAvatarStyle(p);
          return `
            <div class="s-user">
              <div class="s-avatar" style="${avatarStyle}">${p.avatar_url ? '' : name[0].toUpperCase()}</div>
              <div class="s-user-info">
                <div class="s-user-name">${this.escapeHtml(name)}</div>
                <div class="s-user-status">Pending</div>
              </div>
              <div class="s-user-actions">
                <button class="s-btn s-btn-secondary cancel-req-btn" data-id="${r.id}">Cancel</button>
              </div>
            </div>`;
        }).join('');
      } else { sent.innerHTML = ''; }
    }
    this.bindRequestActions();
  }

  renderInvites() {
    const container = document.getElementById('game-invites');
    if (!container) return;
    if (!this.gameInvites.length) { container.innerHTML = ''; return; }

    container.innerHTML = `<div class="s-label">Game Invites</div>` + this.gameInvites.map(inv => {
      const name = inv.profiles?.gamer_tag || inv.profiles?.display_name || 'Someone';
      return `
        <div class="s-invite game">
          <div class="s-invite-icon">${this.icons.gamepad}</div>
          <div class="s-invite-info">
            <div class="s-invite-title">${this.escapeHtml(name)}</div>
            <div class="s-invite-sub">Invited to ${this.escapeHtml(inv.game_name)}</div>
          </div>
          <div class="s-invite-actions">
            <button class="s-btn s-btn-primary join-inv-btn" data-id="${inv.id}" data-game="${inv.game_name}" data-room="${inv.room_code}">Join</button>
            <button class="s-btn s-btn-secondary s-btn-icon ignore-inv-btn" data-id="${inv.id}">${this.icons.x}</button>
          </div>
        </div>`;
    }).join('');
    this.bindInviteActions();
  }

  renderParty() {
    const container = document.getElementById('party-section');
    if (!container) return;

    if (!this.currentParty) {
      container.innerHTML = `
        <div class="s-no-party">
          <span class="s-no-party-text">Not in a party</span>
          <button class="s-btn s-btn-primary" id="create-party-btn">Create Party</button>
        </div>`;
      document.getElementById('create-party-btn')?.addEventListener('click', () => this.createParty());
      return;
    }

    const isLeader = this.isPartyLeader();
    const inGame = this.currentParty.status === 'in_game' && this.currentParty.current_room;
    const memberCount = this.partyMembers.length;
    const maxSize = this.currentParty.max_size || 20;
    const partyCode = this.currentParty.invite_code || this.currentParty.party_id.substring(0, 8).toUpperCase();

    let gameBanner = '';
    if (inGame) {
      gameBanner = `
        <div class="s-party-game">
          <div class="s-party-game-info">
            <div class="s-party-game-icon">${this.icons.gamepad}</div>
            <div>
              <div class="s-party-game-label">Playing</div>
              <div class="s-party-game-name">${this.escapeHtml(this.currentParty.current_game)}</div>
            </div>
          </div>
          ${!isLeader ? `<button class="s-btn s-btn-success" id="join-party-game">${this.icons.play} Join</button>` : ''}
        </div>`;
    }

    const members = this.partyMembers.map(m => {
      const isMe = m.id === this.currentUser.id;
      const isMemberLeader = m.role === 'leader';
      const initial = (m.name || '?')[0].toUpperCase();
      const avatarStyle = this.getAvatarStyle(m);
      const nameStyle = this.getPremiumNameStyle(m);
      const nameEffectClass = this.getNameEffectClass(m);
      const borderClass = this.getBorderColorClass(m);
      
      let actions = '';
      if (isLeader && !isMe) {
        actions = `
          <button class="s-btn s-btn-ghost s-btn-icon transfer-btn" data-id="${m.id}" title="Make Host">${this.icons.crown}</button>
          <button class="s-btn s-btn-ghost s-btn-icon kick-btn" data-id="${m.id}" title="Kick">${this.icons.x}</button>`;
      }

      // Use cosmetics format
      let titleHtml = '';
      const title = m.title || m.cosmetics?.title;
      if (title && m.isPremium) {
        const borderColor = m.border_color || m.cosmetics?.border_color || 'gray';
        const titleColor = this.COSMETIC_COLORS[borderColor] || this.COSMETIC_COLORS.gray;
        titleHtml = `<span class="s-premium-title" style="color: ${titleColor};">${this.escapeHtml(title)}</span>`;
      }

      let badgeHtml = '';
      const badge = m.badge_icon || m.cosmetics?.badge_icon;
      if (badge && m.isPremium) {
        badgeHtml = `<span class="s-badge-icon">${badge}</span>`;
      }
      
      // Add premium border class
      const memberClass = m.isPremium && borderClass ? `s-party-member ${borderClass}` : 's-party-member';
      
      return `
        <div class="${memberClass}">
          <div class="s-party-member-avatar" style="${avatarStyle}">${m.avatar_url ? '' : initial}${isMemberLeader ? `<span class="s-crown">${this.icons.crown}</span>` : ''}</div>
          <div class="s-party-member-info">
            <div class="s-party-member-name">
              ${badgeHtml}
              <span class="s-name ${nameEffectClass}" style="${nameStyle}">${this.escapeHtml(m.name)}</span>
              ${isMemberLeader ? '<span class="s-host-tag">Host</span>' : ''}
              ${isMe ? '<span class="s-you-tag">(You)</span>' : ''}
            </div>
            ${titleHtml}
            <div class="s-party-member-status">${m.status === 'online' ? 'Online' : m.status === 'in_game' ? 'In Game' : 'Offline'}</div>
          </div>
          <div class="s-user-actions">${actions}</div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="s-party">
        <div class="s-party-header">
          <span class="s-party-title">Party</span>
          <span class="s-party-count">${memberCount}/${maxSize}</span>
        </div>
        ${gameBanner}
        <div class="s-party-members">${members}</div>
        <div class="s-party-share">
          <div class="s-share-row">
            <div class="s-share-info">
              <span class="s-share-label">Invite Code</span>
              <code class="s-share-code" id="party-code">${partyCode}</code>
            </div>
            <button class="s-btn s-btn-secondary s-btn-icon" id="copy-party-link" title="Copy invite link">${this.icons.link}</button>
            ${isLeader ? `<button class="s-btn s-btn-primary" id="open-invite-modal">Invite</button>` : ''}
          </div>
        </div>
        <div class="s-party-chat" id="party-chat-section">
          <div class="s-chat-header" id="chat-toggle">
            <span>Party Chat</span>
            <span class="s-chat-badge" id="chat-badge" style="display:none;">0</span>
            <span class="s-chat-toggle-icon" style="transform:rotate(180deg);">${this.icons.chevronDown}</span>
          </div>
          <div class="s-chat-body" id="chat-body">
            <div class="s-chat-messages" id="party-messages"></div>
            <div class="s-typing-indicator" id="party-typing" style="display:none;">
              <div class="s-typing-dots"><span></span><span></span><span></span></div>
              <span id="typing-name">Someone</span> is typing...
            </div>
            <div class="s-chat-input-wrap" style="position:relative;">
              <button class="s-btn s-btn-ghost s-btn-icon" id="party-emoji-btn" style="position:absolute;left:4px;top:50%;transform:translateY(-50%);z-index:2;">${this.icons.smile}</button>
              <input type="text" class="s-chat-input" id="party-chat-input" placeholder="Type a message..." maxlength="200" style="padding-left:36px;">
              <button class="s-btn s-btn-primary s-btn-icon" id="send-chat-btn">${this.icons.send}</button>
            </div>
          </div>
        </div>
        <div class="s-party-actions">
          <button class="s-btn s-btn-danger" id="leave-party" style="width:100%">${this.icons.logout} Leave</button>
        </div>
      </div>`;

    // Bind events
    document.getElementById('leave-party')?.addEventListener('click', () => this.leaveParty());
    document.getElementById('join-party-game')?.addEventListener('click', () => this.joinPartyGame());
    document.getElementById('copy-party-link')?.addEventListener('click', () => this.copyPartyLink(partyCode));
    document.getElementById('open-invite-modal')?.addEventListener('click', () => this.openInviteModal());
    document.getElementById('send-chat-btn')?.addEventListener('click', () => this.sendPartyMessage());
    document.getElementById('party-chat-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendPartyMessage();
    });
    document.getElementById('chat-toggle')?.addEventListener('click', () => this.toggleChat());
    document.getElementById('party-emoji-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleEmojiPicker('party-chat-input');
    });
    
    container.querySelectorAll('.kick-btn').forEach(b => b.addEventListener('click', () => this.kickFromParty(b.dataset.id)));
    container.querySelectorAll('.transfer-btn').forEach(b => b.addEventListener('click', () => this.transferLeadership(b.dataset.id)));

    this.renderPartyChatMessages();
  }

  getPremiumNameStyle(user) {
    if (!user.isPremium) return '';
    const borderColor = user.border_color || user.cosmetics?.border_color || 'gray';
    if (borderColor === 'rainbow') return 'color: #c084fc;'; // Default purple for rainbow
    const color = this.COSMETIC_COLORS[borderColor] || this.COSMETIC_COLORS.gray;
    return `color: ${color};`;
  }
  
  getNameEffectClass(user) {
    if (!user.isPremium) return '';
    const effect = user.name_effect || user.cosmetics?.name_effect || 'none';
    if (effect === 'none') return '';
    return `tgco-effect-${effect}`;
  }
  
  getBorderColorClass(user) {
    if (!user.isPremium) return '';
    const borderColor = user.border_color || user.cosmetics?.border_color || 'gray';
    return `${borderColor}-border`;
  }

  openInviteModal() {
    const partyMemberIds = this.partyMembers.map(m => m.id);
    const availableFriends = this.friends.filter(f => !partyMemberIds.includes(f.friend_id));
    const onlineFriends = availableFriends.filter(f => f.status === 'online' || f.status === 'in_game');
    const offlineFriends = availableFriends.filter(f => !f.status || f.status === 'offline');

    const friendsList = [...onlineFriends, ...offlineFriends].map(f => {
      const name = f.gamer_tag || f.display_name || 'Unknown';
      const initial = name[0].toUpperCase();
      const isOnline = f.status === 'online' || f.status === 'in_game';
      const avatarStyle = this.getAvatarStyle(f);
      const statusClass = f.status === 'in_game' ? 'in-game' : f.status === 'online' ? 'online' : '';
      const nameStyle = this.getPremiumNameStyle(f);
      
      return `
        <div class="s-modal-friend ${isOnline ? '' : 'offline'}" data-id="${f.friend_id}">
          <div class="s-avatar-sm" style="${avatarStyle}">${f.avatar_url ? '' : initial}<div class="s-status-dot-sm ${statusClass}"></div></div>
          <span class="s-modal-friend-name" style="${nameStyle}">${this.escapeHtml(name)}</span>
          <button class="s-btn s-btn-primary s-btn-sm s-modal-invite-btn" data-id="${f.friend_id}">Invite</button>
        </div>`;
    }).join('');

    const modal = document.createElement('div');
    modal.className = 's-modal-overlay';
    modal.id = 'invite-modal';
    modal.innerHTML = `
      <div class="s-modal">
        <div class="s-modal-header">
          <span class="s-modal-title">Invite to Party</span>
          <button class="s-btn s-btn-ghost s-btn-icon s-modal-close">${this.icons.x}</button>
        </div>
        <div class="s-modal-body">
          ${availableFriends.length > 0 ? `
            ${onlineFriends.length > 1 ? `<button class="s-btn s-btn-primary s-btn-block" id="modal-invite-all">Invite All Online (${onlineFriends.length})</button>` : ''}
            <div class="s-modal-friends-list">${friendsList}</div>
          ` : '<div class="s-empty-mini">No friends to invite</div>'}
        </div>
      </div>`;

    document.body.appendChild(modal);

    // Bind modal events
    modal.querySelector('.s-modal-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    modal.querySelectorAll('.s-modal-invite-btn').forEach(btn => {
      btn.onclick = async () => {
        btn.innerHTML = 'Sent!';
        btn.disabled = true;
        btn.classList.remove('s-btn-primary');
        btn.classList.add('s-btn-success');
        await this.inviteToPartyQuick(btn.dataset.id);
      };
    });

    document.getElementById('modal-invite-all')?.addEventListener('click', async () => {
      const btn = document.getElementById('modal-invite-all');
      btn.innerHTML = 'Sending...';
      btn.disabled = true;
      
      for (const friend of onlineFriends) {
        const invBtn = modal.querySelector(`.s-modal-invite-btn[data-id="${friend.friend_id}"]`);
        if (invBtn) {
          invBtn.innerHTML = 'Sent!';
          invBtn.disabled = true;
          invBtn.classList.remove('s-btn-primary');
          invBtn.classList.add('s-btn-success');
        }
        await this.inviteToPartyQuick(friend.friend_id);
      }
      
      btn.innerHTML = 'All Sent!';
      setTimeout(() => modal.remove(), 1000);
    });
  }

  async inviteToPartyQuick(userId) {
    try {
      const { error } = await this.supabase.rpc('invite_to_party', { invitee_id: userId });
      if (error) {
        console.error('Party invite error:', error);
      } else {
        this.playSound('invite');
      }
    } catch (e) {
      console.error('Party invite exception:', e);
    }
  }

  toggleChat() {
    const body = document.getElementById('chat-body');
    const icon = document.querySelector('.s-chat-toggle-icon');
    const badge = document.getElementById('chat-badge');
    
    if (body) {
      const isHidden = body.style.display === 'none';
      body.style.display = isHidden ? 'block' : 'none';
      if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      
      // Clear unread badge when opening
      if (isHidden && badge) {
        badge.style.display = 'none';
        badge.textContent = '0';
        this.unreadMessages = 0;
      }
      
      // Scroll to bottom when opening
      if (isHidden) {
        const messages = document.getElementById('party-messages');
        if (messages) messages.scrollTop = messages.scrollHeight;
      }
    }
  }

  // Party Chat Functions
  async subscribeToPartyChat() {
    if (!this.currentParty) return;
    
    // Prevent double subscription
    if (this.chatChannel) {
      console.log('Removing existing chat subscription');
      this.supabase.removeChannel(this.chatChannel);
      this.chatChannel = null;
    }

    this.unreadMessages = 0;
    await this.loadPartyMessages();

    const partyId = this.currentParty.party_id;
    console.log('Subscribing to chat:', partyId);

    // Use unique channel name to prevent conflicts
    const channelName = `chat-${partyId}-${Date.now()}`;

    this.chatChannel = this.supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'party_messages'
      }, (payload) => {
        // Client-side filter
        if (payload.new.party_id !== partyId) return;
        
        console.log('Chat message:', payload.new.message?.substring(0, 20));
        this.handleNewPartyMessage(payload.new);
      })
      .subscribe((status, err) => {
        console.log('Chat subscription:', status, err || '');
      });
  }

  async loadPartyMessages() {
    if (!this.currentParty) return;
    
    try {
      const { data, error } = await this.supabase
        .from('party_messages')
        .select('id, user_id, message, created_at')
        .eq('party_id', this.currentParty.party_id)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (error) {
        console.error('Load messages error:', error);
        return;
      }
      
      this.partyMessages = data || [];
      this.renderPartyChatMessages();
    } catch (e) {
      console.error('Load party messages error:', e);
    }
  }

  handleNewPartyMessage(msg) {
    const member = this.partyMembers.find(m => m.id === msg.user_id);
    const newMsg = {
      id: msg.id,
      user_id: msg.user_id,
      message: msg.message,
      created_at: msg.created_at,
      member: member
    };
    
    this.partyMessages.push(newMsg);
    this.renderPartyChatMessages();
    
    // Play sound and show notification if not from self
    if (msg.user_id !== this.currentUser.id) {
      this.playSound('message');
      
      // Update unread badge if chat is closed
      const chatBody = document.getElementById('chat-body');
      if (chatBody && chatBody.style.display === 'none') {
        this.unreadMessages = (this.unreadMessages || 0) + 1;
        const badge = document.getElementById('chat-badge');
        if (badge) {
          badge.textContent = this.unreadMessages > 9 ? '9+' : this.unreadMessages;
          badge.style.display = 'inline-flex';
        }
      }
      
      // Show toast notification
      const name = member?.name || 'Someone';
      this.showToast('message', 'New Message', `${name}: ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}`, []);
    }
  }

  renderPartyChatMessages() {
    const container = document.getElementById('party-messages');
    if (!container) return;

    if (!this.partyMessages.length) {
      container.innerHTML = '<div class="s-chat-empty">No messages yet</div>';
      return;
    }

    container.innerHTML = this.partyMessages.map(msg => {
      const member = msg.member || this.partyMembers.find(m => m.id === msg.user_id) || {};
      const name = member.name || 'Unknown';
      const isMe = msg.user_id === this.currentUser.id;
      const nameStyle = member.is_premium && member.name_color ? `color: ${member.name_color}` : '';
      const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return `
        <div class="s-chat-msg ${isMe ? 'me' : ''}">
          <span class="s-chat-name" style="${nameStyle}">${this.escapeHtml(name)}</span>
          <span class="s-chat-text">${this.escapeHtml(msg.message)}</span>
          <span class="s-chat-time">${time}</span>
        </div>`;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

  async sendPartyMessage() {
    const input = document.getElementById('party-chat-input');
    if (!input || !this.currentParty) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    input.value = '';
    
    try {
      const { error } = await this.supabase.from('party_messages').insert({
        party_id: this.currentParty.party_id,
        user_id: this.currentUser.id,
        message: message
      });
      
      if (error) {
        console.error('Send message error:', error);
        input.value = message;
      }
    } catch (e) {
      console.error('Send message exception:', e);
      input.value = message;
    }
  }

  async setUserStatus(status) {
    this.userStatus = status;
    try {
      await this.supabase.rpc('update_user_status', { new_status: status });
      this.updateStatusIndicator();
    } catch (e) {
      console.error('Set status error:', e);
    }
  }

  updateStatusIndicator() {
    const indicator = document.getElementById('status-indicator');
    const statusOpt = this.statusOptions.find(s => s.id === this.userStatus);
    if (indicator && statusOpt) {
      indicator.style.background = statusOpt.color;
    }
  }

  renderPartyInvites() {
    const container = document.getElementById('party-invites');
    const banner = document.getElementById('party-invites-banner');
    const countBadge = document.getElementById('party-invite-count');
    
    // Update tab badge
    if (countBadge) {
      if (this.partyInvites.length > 0) {
        countBadge.textContent = this.partyInvites.length;
        countBadge.style.display = 'inline-flex';
      } else {
        countBadge.style.display = 'none';
      }
    }
    
    if (!this.partyInvites.length) { 
      if (container) container.innerHTML = ''; 
      if (banner) banner.innerHTML = '';
      return; 
    }

    // Create the invite cards HTML
    const invitesHtml = this.partyInvites.map(inv => {
      const name = inv.profiles?.gamer_tag || inv.profiles?.display_name || 'Someone';
      const avatarStyle = this.getAvatarStyle(inv.profiles || {});
      const initial = (name[0] || '?').toUpperCase();
      return `
        <div class="s-party-invite-card">
          <div class="s-avatar-sm" style="${avatarStyle}">${inv.profiles?.avatar_url ? '' : initial}</div>
          <div class="s-invite-info">
            <div class="s-invite-title">${this.escapeHtml(name)}</div>
            <div class="s-invite-sub">invited you to their party</div>
          </div>
          <div class="s-invite-actions">
            <button class="s-btn s-btn-primary accept-party-btn" data-id="${inv.id}">${this.icons.check} Join</button>
            <button class="s-btn s-btn-ghost s-btn-icon decline-party-btn" data-id="${inv.id}">${this.icons.x}</button>
          </div>
        </div>`;
    }).join('');

    // Show in BOTH the banner (visible on all tabs) and party tab
    const fullHtml = `<div class="s-party-invites-wrap">${invitesHtml}</div>`;
    
    if (banner) banner.innerHTML = fullHtml;
    if (container) container.innerHTML = ''; // Don't duplicate in party tab since banner shows

    // Bind click handlers
    document.querySelectorAll('.accept-party-btn').forEach(b => {
      b.onclick = () => this.acceptPartyInvite(b.dataset.id);
    });
    document.querySelectorAll('.decline-party-btn').forEach(b => {
      b.onclick = () => this.declinePartyInvite(b.dataset.id);
    });
  }

  // ==================== ACTIONS ====================

  bindFriendActions() {
    document.querySelectorAll('.options-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        document.querySelectorAll('.s-options-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
        menu.classList.toggle('open');
      });
    });
    document.querySelectorAll('.invite-btn').forEach(b => b.addEventListener('click', () => this.sendGameInvite(b.dataset.id)));
    document.querySelectorAll('.join-btn').forEach(b => b.addEventListener('click', () => this.joinFriendGame(b.dataset.game, b.dataset.room)));
    document.querySelectorAll('.party-invite-btn').forEach(b => b.addEventListener('click', () => this.inviteToParty(b.dataset.id)));
    document.querySelectorAll('.unfriend-btn').forEach(b => b.addEventListener('click', () => this.removeFriend(b.dataset.id)));
    document.querySelectorAll('.block-btn').forEach(b => b.addEventListener('click', () => this.blockUser(b.dataset.id)));
    // Click on avatar or name to open profile
    document.querySelectorAll('.clickable-profile').forEach(el => el.addEventListener('click', () => this.openProfileModal(el.dataset.uid)));
  }

  bindRequestActions() {
    document.querySelectorAll('.accept-req-btn').forEach(b => b.addEventListener('click', () => this.acceptRequest(b.dataset.id)));
    document.querySelectorAll('.decline-req-btn').forEach(b => b.addEventListener('click', () => this.declineRequest(b.dataset.id)));
    document.querySelectorAll('.cancel-req-btn').forEach(b => b.addEventListener('click', () => this.cancelRequest(b.dataset.id)));
  }

  bindInviteActions() {
    document.querySelectorAll('.join-inv-btn').forEach(b => b.addEventListener('click', () => this.acceptInvite(b.dataset.id, b.dataset.game, b.dataset.room)));
    document.querySelectorAll('.ignore-inv-btn').forEach(b => b.addEventListener('click', () => this.declineInvite(b.dataset.id)));
  }

  async searchUsers(query) {
    const container = document.getElementById('search-results');
    if (!container) return;
    if (!query || query.length < 2) { container.innerHTML = ''; return; }

    try {
      let data = [];
      const tagMatch = query.match(/^(.+)#(\d{4})$/);
      if (tagMatch) {
        const [, username, disc] = tagMatch;
        const { data: d } = await this.supabase.from('profiles').select('id, display_name, gamer_tag, discriminator, avatar_url, avatar_icon')
          .or(`gamer_tag.ilike.${username},display_name.ilike.${username}`).eq('discriminator', disc).neq('id', this.currentUser.id).limit(10);
        data = d || [];
      } else {
        const { data: d } = await this.supabase.from('profiles').select('id, display_name, gamer_tag, discriminator, avatar_url, avatar_icon')
          .or(`display_name.ilike.%${query}%,gamer_tag.ilike.%${query}%`).neq('id', this.currentUser.id).limit(10);
        data = d || [];
      }

      if (!data.length) { 
        container.innerHTML = `<div class="s-empty"><p class="s-empty-text">No users found</p></div>`; 
        return; 
      }

      const friendIds = this.friends.map(f => f.friend_id);
      const sentIds = this.sentRequests.map(r => r.to_user);
      const receivedIds = this.pendingRequests.map(r => r.from_user);

      container.innerHTML = `<div class="s-label">Search Results</div>` + data.map(u => {
        const name = u.gamer_tag || u.display_name || 'Unknown';
        const tag = u.discriminator ? `#${u.discriminator}` : '';
        const isFriend = friendIds.includes(u.id);
        const hasSent = sentIds.includes(u.id);
        const hasReceived = receivedIds.includes(u.id);
        const avatarStyle = this.getAvatarStyle(u);

        let action = '';
        if (isFriend) action = '<span style="color:var(--s-text-muted);font-size:0.8rem;">Friends</span>';
        else if (hasSent) action = '<span style="color:var(--s-text-muted);font-size:0.8rem;">Pending</span>';
        else if (hasReceived) action = `<button class="s-btn s-btn-success accept-search-btn" data-id="${u.id}">Accept</button>`;
        else action = `<button class="s-btn s-btn-primary add-btn" data-id="${u.id}">${this.icons.userPlus} Add</button>`;

        return `
          <div class="s-user">
            <div class="s-avatar" style="${avatarStyle}">${u.avatar_url ? '' : name[0].toUpperCase()}</div>
            <div class="s-user-info">
              <div class="s-user-name">${this.escapeHtml(name)}<span class="disc">${tag}</span></div>
            </div>
            <div class="s-user-actions">${action}</div>
          </div>`;
      }).join('');

      // Bind click events directly with explicit function calls
      const addBtns = container.querySelectorAll('.add-btn');
      const acceptBtns = container.querySelectorAll('.accept-search-btn');
      
      addBtns.forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const userId = btn.getAttribute('data-id');
          this.sendFriendRequest(userId);
        };
      });
      
      acceptBtns.forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const userId = btn.getAttribute('data-id');
          const req = this.pendingRequests.find(r => r.from_user === userId);
          if (req) this.acceptRequest(req.id);
        };
      });
    } catch (e) { 
      console.error(e); 
      container.innerHTML = `<div class="s-empty"><p class="s-empty-text">Search error</p></div>`; 
    }
  }

  // ==================== API CALLS ====================

  async sendFriendRequest(userId) {
    // Update button immediately for feedback
    const btn = document.querySelector(`.add-btn[data-id="${userId}"]`);
    if (btn) {
      btn.innerHTML = 'Sent!';
      btn.disabled = true;
      btn.classList.remove('s-btn-primary');
      btn.classList.add('s-btn-secondary');
    }
    
    try {
      const { error } = await this.supabase.from('friend_requests').insert({ from_user: this.currentUser.id, to_user: userId });
      
      if (error) {
        // Duplicate = request already exists
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          if (btn) btn.innerHTML = 'Pending';
        } else {
          console.error('Friend request error:', error);
          if (btn) {
            btn.innerHTML = 'Error';
            btn.classList.remove('s-btn-secondary');
            btn.classList.add('s-btn-danger');
          }
        }
        return;
      }
      
      await this.loadRequests();
    } catch (e) { 
      console.error('Friend request exception:', e); 
    }
  }

  async acceptRequest(id) {
    try {
      await this.supabase.rpc('accept_friend_request', { request_id: id });
      await this.loadFriends();
      await this.loadRequests();
    } catch (e) { console.error(e); }
  }

  async declineRequest(id) {
    try {
      await this.supabase.from('friend_requests').update({ status: 'declined' }).eq('id', id);
      await this.loadRequests();
    } catch (e) { console.error(e); }
  }

  async cancelRequest(id) {
    try {
      await this.supabase.from('friend_requests').delete().eq('id', id);
      await this.loadRequests();
    } catch (e) { console.error(e); }
  }

  async removeFriend(id) {
    try {
      await this.supabase.rpc('remove_friend', { friend_user_id: id });
      await this.loadFriends();
    } catch (e) { console.error(e); }
  }

  async blockUser(id) {
    try {
      await this.supabase.from('blocked_users').insert({ user_id: this.currentUser.id, blocked_user_id: id });
      await this.supabase.rpc('remove_friend', { friend_user_id: id });
      await this.loadFriends();
    } catch (e) { console.error(e); }
  }

  async sendGameInvite(friendId) {
    const lobby = this.getLobbyInfo();
    if (!lobby) { alert('Join a game lobby first'); return; }
    try {
      await this.supabase.from('game_invites').insert({ from_user: this.currentUser.id, to_user: friendId, game_name: lobby.game, room_code: lobby.roomCode });
      const btn = document.querySelector(`.invite-btn[data-id="${friendId}"]`);
      if (btn) { btn.textContent = 'Sent!'; btn.disabled = true; setTimeout(() => { btn.textContent = 'Invite'; btn.disabled = false; }, 3000); }
    } catch (e) { console.error(e); }
  }

  async acceptInvite(id, game, room) {
    try {
      await this.supabase.from('game_invites').update({ status: 'accepted' }).eq('id', id);
      this.close();
      window.location.href = this.getGameLobbyUrl(game, room);
    } catch (e) { console.error(e); }
  }

  async declineInvite(id) {
    try {
      await this.supabase.from('game_invites').update({ status: 'declined' }).eq('id', id);
      await this.loadInvites();
    } catch (e) { console.error(e); }
  }

  joinFriendGame(game, room) {
    if (!room) return;
    window.location.href = this.getGameLobbyUrl(game, room);
  }

  // Party
  isPartyLeader() { return this.currentParty?.leader_id === this.currentUser.id; }

  async createParty() {
    try {
      await this.supabase.rpc('create_party', { party_name: 'Party' });
      await this.loadParty();
      this.renderFriends(); // Re-render to show invite buttons
    } catch (e) {
      console.error(e);
    }
  }

  async inviteToParty(userId) {
    console.log('📤 Sending party invite to:', userId);
    console.log('   My party:', this.currentParty?.party_id);
    console.log('   I am leader:', this.isPartyLeader());
    
    // Get friend name for toast
    const friend = this.friends.find(f => f.friend_id === userId);
    const friendName = friend?.gamer_tag || friend?.display_name || 'Player';
    
    // Update button immediately
    const btn = document.querySelector(`.party-invite-btn[data-id="${userId}"]`);
    if (btn) {
      btn.innerHTML = this.icons.check;
      btn.disabled = true;
      btn.classList.remove('s-btn-primary');
      btn.classList.add('s-btn-success');
    }
    
    try {
      const { data, error } = await this.supabase.rpc('invite_to_party', { invitee_id: userId });
      
      console.log('📥 Invite result:', { data, error });
      
      if (error) {
        console.error('❌ Party invite error:', error);
        this.showToast('party', 'Invite Failed', error.message || 'Could not send invite', []);
        if (btn) {
          btn.innerHTML = '!';
          btn.classList.remove('s-btn-success');
          btn.classList.add('s-btn-danger');
        }
        return;
      }
      
      console.log('✅ Invite sent successfully! ID:', data);
      this.playSound('invite');
      this.showToast('party', 'Invite Sent!', `Invited ${friendName} to the party`, []);
      
      // Reset button after 3 seconds
      setTimeout(() => {
        if (btn) {
          btn.innerHTML = this.icons.userPlus;
          btn.disabled = false;
          btn.classList.remove('s-btn-success');
          btn.classList.add('s-btn-primary');
        }
      }, 3000);
      
    } catch (e) { 
      console.error('❌ Party invite exception:', e);
      this.showToast('party', 'Error', 'Could not send invite', []);
    }
  }

  async acceptPartyInvite(id) {
    try {
      await this.supabase.rpc('accept_party_invite', { invite_id: id });
      await this.loadParty();
      await this.loadPartyInvites();
      this.renderFriends(); // Re-render friends list
    } catch (e) { console.error(e); }
  }

  async declinePartyInvite(id) {
    try {
      await this.supabase.from('party_invites').update({ status: 'declined' }).eq('id', id);
      await this.loadPartyInvites();
    } catch (e) { console.error(e); }
  }

  async leaveParty() {
    try {
      await this.supabase.rpc('leave_party');
      
      // Cleanup everything
      this.cleanupPartySubscriptions();
      this.stopActivityPing();
      
      this.currentParty = null;
      this.partyMembers = [];
      this.partyMessages = [];
      
      this.renderParty();
      this.renderFriends(); // Re-render to remove invite buttons
    } catch (e) { console.error(e); }
  }

  async kickFromParty(userId) {
    try {
      await this.supabase.rpc('kick_from_party', { kick_user_id: userId });
      await this.loadParty();
    } catch (e) { console.error(e); }
  }

  async transferLeadership(userId) {
    try {
      await this.supabase.rpc('transfer_party_leadership', { new_leader_id: userId });
      await this.loadParty();
    } catch (e) { console.error(e); }
  }

  joinPartyGame() {
    if (!this.currentParty?.current_room) return;
    window.location.href = this.currentParty.current_room;
  }

  // ==================== PRESENCE ====================

  async updatePresence(status, game = null, room = null) {
    try {
      await this.supabase.from('user_presence').upsert({ 
        user_id: this.currentUser.id, 
        status, 
        current_game: game, 
        current_room: room, 
        last_seen: new Date().toISOString() 
      });
    } catch (e) { console.error(e); }
  }

  startPresenceHeartbeat() {
    this.updatePresenceForPage();
    setInterval(() => this.updatePresenceForPage(), 60000);
    
    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon?.(`${this.supabase.supabaseUrl}/rest/v1/user_presence?user_id=eq.${this.currentUser.id}`, 
        JSON.stringify({ user_id: this.currentUser.id, status: 'offline', last_seen: new Date().toISOString() }));
    });
  }

  updatePresenceForPage() {
    const lobby = this.getLobbyInfo();
    const currentUrl = window.location.pathname + window.location.search;
    
    if (lobby) {
      this.updatePresence('in_game', lobby.game, lobby.roomCode);
      if (this.isPartyLeader() && this.currentParty) {
        this.supabase.rpc('party_start_game', { game_name: lobby.game, room_code: currentUrl }).catch(console.error);
      }
    } else {
      this.updatePresence('online');
      if (this.isPartyLeader() && this.currentParty?.current_room) {
        this.supabase.rpc('party_clear_game').catch(console.error);
      }
    }
  }

  // ==================== HELPERS ====================

  isInLobby() { 
    return window.location.pathname.includes('lobby') || 
           window.location.search.includes('room=') || 
           window.location.search.includes('join='); 
  }

  getLobbyInfo() {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room') || params.get('code') || params.get('join');
    if (!room) return null;
    return { game: this.getGameNameFromUrl() || 'Game', roomCode: room };
  }

  getGameNameFromUrl() {
    const path = window.location.pathname.toLowerCase();
    const games = {
      'spyhunt': 'Spyhunt', 'spyfall': 'Spyhunt', 'codenames': 'Codenames',
      'werewolf': 'Werewolf', 'imposter': 'Imposter', 'herd': 'Herd Mentality',
      'kiss-marry': 'Kiss Marry Kill', 'this-or-that': 'This or That',
      '21-questions': '21 Questions', 'questions': '21 Questions',
      'sketch': 'Sketch & Guess', 'draw': 'Sketch & Guess', 'trivia': 'Trivia'
    };
    for (const [key, name] of Object.entries(games)) {
      if (path.includes(key)) return name;
    }
    return null;
  }

  getGameLobbyUrl(game, room) {
    const urls = {
      'Spyhunt': '/spyhunt/lobby.html', 'Codenames': '/codenames/lobby.html',
      'Werewolf': '/werewolf/lobby.html', 'Imposter': '/imposter/lobby.html',
      'Herd Mentality': '/herd-mentality/lobby.html', 'Kiss Marry Kill': '/kiss-marry-kill/lobby.html',
      'This or That': '/this-or-that/lobby.html', '21 Questions': '/21-questions/lobby.html',
      'Sketch & Guess': '/sketch/lobby.html', 'Trivia': '/trivia/lobby.html'
    };
    return `${urls[game] || '/lobby.html'}?join=${room}`;
  }

  timeAgo(date) {
    const s = Math.floor((Date.now() - date) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  copyHandle() {
    navigator.clipboard.writeText(this.generateHandle()).then(() => {
      const btn = document.getElementById('copy-handle');
      if (btn) { btn.innerHTML = this.icons.check; setTimeout(() => btn.innerHTML = this.icons.copy, 1500); }
    });
  }

  copyPartyLink(code) {
    const link = `${window.location.origin}?partycode=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      const btn = document.getElementById('copy-party-link');
      const codeEl = document.getElementById('party-code');
      if (btn) { 
        btn.innerHTML = this.icons.check; 
        btn.classList.remove('s-btn-secondary');
        btn.classList.add('s-btn-success');
        setTimeout(() => { 
          btn.innerHTML = this.icons.link; 
          btn.classList.remove('s-btn-success');
          btn.classList.add('s-btn-secondary');
        }, 2000); 
      }
      if (codeEl) {
        codeEl.textContent = 'Copied!';
        setTimeout(() => { codeEl.textContent = code; }, 1500);
      }
    });
  }

  // ==================== V8: BLOCKED USERS ====================
  
  async loadBlockedUsers() {
    try {
      const { data } = await this.supabase.rpc('get_blocked_users');
      this.blockedUsers = data || [];
      this.renderBlockedUsers();
    } catch (e) { console.error('Load blocked error:', e); }
  }

  renderBlockedUsers() {
    const container = document.getElementById('blocked-section');
    if (!container) return;

    if (!this.blockedUsers.length) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="s-blocked-header" id="blocked-toggle">
        <span class="s-blocked-title">${this.icons.eyeOff} Blocked (${this.blockedUsers.length})</span>
        <span class="s-blocked-arrow">${this.icons.chevronDown}</span>
      </div>
      <div class="s-blocked-list" id="blocked-list" style="display:none;">
        ${this.blockedUsers.map(u => `
          <div class="s-blocked-item">
            <span class="s-blocked-name">${this.escapeHtml(u.gamer_tag || u.display_name || 'Unknown')}</span>
            <button class="s-btn s-btn-sm s-btn-ghost unblock-btn" data-id="${u.blocked_id}">Unblock</button>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('blocked-toggle')?.addEventListener('click', () => {
      const list = document.getElementById('blocked-list');
      const arrow = container.querySelector('.s-blocked-arrow');
      if (list.style.display === 'none') {
        list.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
      } else {
        list.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
      }
    });

    container.querySelectorAll('.unblock-btn').forEach(btn => {
      btn.onclick = () => this.unblockUser(btn.dataset.id);
    });
  }

  async unblockUser(userId) {
    try {
      await this.supabase.rpc('unblock_user', { p_blocked_id: userId });
      this.blockedUsers = this.blockedUsers.filter(u => u.blocked_id !== userId);
      this.renderBlockedUsers();
      this.showToast('friend', 'Unblocked', 'User has been unblocked');
    } catch (e) { 
      console.error('Unblock error:', e); 
      this.showToast('friend', 'Error', 'Could not unblock user');
    }
  }

  // ==================== V8: PROFILE MODAL ====================

  async openProfileModal(userId) {
    const modal = document.getElementById('s-profile-modal');
    const content = document.getElementById('profile-modal-content');
    if (!modal || !content) return;

    content.innerHTML = '<div style="text-align:center;padding:40px;color:var(--s-text-muted);">Loading...</div>';
    modal.style.display = 'flex';

    try {
      // Get profile data
      const { data: profile } = await this.supabase.rpc('get_user_profile_stats', { p_user_id: userId });
      if (!profile || !profile.length) {
        content.innerHTML = '<div style="text-align:center;padding:40px;color:var(--s-text-muted);">User not found</div>';
        return;
      }

      const p = profile[0];
      
      // Get scores
      const { data: scores } = await this.supabase.rpc('get_user_best_scores', { p_user_id: userId });

      // Format playtime
      const playtime = this.formatPlaytime(p.total_playtime_seconds || 0);
      
      // Format join date
      const joinDate = p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown';

      // Cosmetics
      const cosmetics = p.cosmetics || {};
      const isPremium = p.account_type === 'premium';
      const nameColor = isPremium && cosmetics.border_color ? this.COSMETIC_COLORS[cosmetics.border_color] || 'inherit' : 'inherit';
      const nameEffect = isPremium && cosmetics.name_effect ? `tgco-effect-${cosmetics.name_effect}` : '';
      const badgeIcon = isPremium && cosmetics.badge_icon ? cosmetics.badge_icon : '';
      const title = isPremium && cosmetics.title ? cosmetics.title : '';

      const name = p.gamer_tag || p.display_name || 'Unknown';
      const tag = p.discriminator ? `#${p.discriminator}` : '';
      const avatarStyle = this.getAvatarStyle(p);

      // Game name mapping
      const gameNames = {
        'reaction-time': '⚡ Reaction',
        'typing-test-15': '⌨️ Typing 15s',
        'typing-test-30': '⌨️ Typing 30s',
        'typing-test-60': '⌨️ Typing 60s',
        'typing-test-120': '⌨️ Typing 2m',
        'aim-trainer-15': '🎯 Aim 15',
        'aim-trainer-30': '🎯 Aim 30',
        'aim-trainer-50': '🎯 Aim 50',
        'chimp-test': '🐒 Chimp',
        'number-memory': '🔢 Numbers',
        'sequence-memory': '📋 Sequence',
        'visual-memory': '👁️ Visual',
        'verbal-memory': '💬 Verbal',
        'math-speed-add': '➕ Math Add',
        'math-speed-sub': '➖ Math Sub',
        'math-speed-mul': '✖️ Math Mul',
        'math-speed-div': '➗ Math Div'
      };

      const gameUnits = {
        'reaction-time': 'ms',
        'aim-trainer-15': 'ms', 'aim-trainer-30': 'ms', 'aim-trainer-50': 'ms',
        'typing-test-15': 'WPM', 'typing-test-30': 'WPM', 'typing-test-60': 'WPM', 'typing-test-120': 'WPM',
        'chimp-test': 'lvl', 'number-memory': 'digits', 'sequence-memory': 'lvl',
        'visual-memory': 'lvl', 'verbal-memory': 'words',
        'math-speed-add': 'solved', 'math-speed-sub': 'solved', 'math-speed-mul': 'solved', 'math-speed-div': 'solved'
      };

      // Render scores
      let scoresHtml = '';
      if (scores && scores.length) {
        scoresHtml = scores.slice(0, 6).map(s => {
          const gameName = gameNames[s.game_id] || s.game_id;
          const unit = gameUnits[s.game_id] || '';
          const rankClass = s.global_rank === 1 ? 'gold' : '';
          const trophy = s.global_rank === 1 ? ' 🏆' : '';
          return `
            <div class="s-pm-score-row">
              <span class="s-pm-score-game">${gameName}</span>
              <span class="s-pm-score-value">${s.score} ${unit}</span>
              <span class="s-pm-score-rank ${rankClass}">#${s.global_rank}${trophy}</span>
            </div>
          `;
        }).join('');
      } else {
        scoresHtml = '<div style="text-align:center;padding:20px;color:var(--s-text-muted);font-size:0.85rem;">No scores yet</div>';
      }

      // Actions based on relationship
      const isMe = userId === this.currentUser.id;
      let actionsHtml = '';
      
      if (isMe) {
        // Own profile - no actions needed, just show stats
        actionsHtml = '';
      } else if (p.is_blocked) {
        actionsHtml = `<button class="s-btn s-btn-secondary" id="pm-unblock">${this.icons.unlock} Unblock</button>`;
      } else if (p.is_friend) {
        actionsHtml = `
          <button class="s-btn s-btn-primary" id="pm-message">${this.icons.message} Message</button>
          ${this.currentParty && this.isPartyLeader() ? `<button class="s-btn s-btn-secondary" id="pm-party-invite">${this.icons.userPlus} Party</button>` : ''}
        `;
      } else {
        actionsHtml = `<button class="s-btn s-btn-primary" id="pm-add-friend">${this.icons.userPlus} Add Friend</button>`;
      }

      content.innerHTML = `
        <div class="s-pm-header">
          <div class="s-pm-avatar" style="${avatarStyle}">${p.avatar_url ? '' : name[0].toUpperCase()}</div>
          <div class="s-pm-name ${nameEffect}" style="color: ${nameColor};">
            ${badgeIcon} ${this.escapeHtml(name)}<span class="disc">${tag}</span>
          </div>
          ${title ? `<div class="s-pm-title" style="color: ${nameColor};">${this.escapeHtml(title)}</div>` : ''}
          ${p.club_tag ? `<span class="s-pm-club-tag">[${this.escapeHtml(p.club_tag)}] ${this.escapeHtml(p.club_name)}</span>` : ''}
          ${isMe ? '<div class="s-pm-you-badge">You</div>' : ''}
        </div>
        
        <div class="s-pm-stats">
          <div class="s-pm-stat">
            <div class="s-pm-stat-value">${this.icons.clock} ${playtime}</div>
            <div class="s-pm-stat-label">Playtime</div>
          </div>
          <div class="s-pm-stat">
            <div class="s-pm-stat-value">${this.icons.calendar} ${joinDate}</div>
            <div class="s-pm-stat-label">Joined</div>
          </div>
        </div>
        
        <div class="s-pm-scores">
          <div class="s-pm-scores-title">${this.icons.trophy} Best Scores</div>
          ${scoresHtml}
        </div>
        
        ${actionsHtml ? `<div class="s-pm-actions">${actionsHtml}</div>` : ''}
      `;

      // Bind action buttons
      document.getElementById('pm-unblock')?.addEventListener('click', async () => {
        await this.unblockUser(userId);
        this.closeProfileModal();
      });
      
      document.getElementById('pm-message')?.addEventListener('click', () => {
        this.closeProfileModal();
        this.openDmChat(userId);
      });
      
      document.getElementById('pm-party-invite')?.addEventListener('click', async () => {
        await this.inviteToParty(userId);
        this.closeProfileModal();
      });
      
      document.getElementById('pm-add-friend')?.addEventListener('click', async () => {
        await this.sendFriendRequest(userId);
        this.closeProfileModal();
      });

      this.profileModalUser = userId;
    } catch (e) {
      console.error('Profile modal error:', e);
      content.innerHTML = '<div style="text-align:center;padding:40px;color:var(--s-text-muted);">Error loading profile</div>';
    }
  }

  closeProfileModal() {
    const modal = document.getElementById('s-profile-modal');
    if (modal) modal.style.display = 'none';
    this.profileModalUser = null;
  }

  formatPlaytime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }

  // ==================== V8: DIRECT MESSAGES ====================

  async loadDmConversations() {
    // Load DM conversations in background (for future notifications)
    try {
      const { data } = await this.supabase.rpc('get_dm_conversations');
      this.dmConversations = data || [];
    } catch (e) { console.error('Load DMs error:', e); }
  }

  updateDmBadge() {
    // No badge needed since we removed the DMs tab
  }

  renderDmList() {
    // No longer needed - using popup instead
  }

  async openDmChat(userId) {
    this.activeDmUser = userId;
    const popup = document.getElementById('s-dm-popup');
    if (!popup) return;

    // Find user info
    const conv = this.dmConversations.find(c => c.other_user_id === userId);
    const friend = this.friends.find(f => f.friend_id === userId);
    const name = conv?.other_user_name || friend?.gamer_tag || friend?.display_name || 'User';
    const avatarStyle = this.getAvatarStyle(conv || friend || {});

    // Update popup header
    const avatarEl = document.getElementById('dm-popup-avatar');
    const nameEl = document.getElementById('dm-popup-name');
    if (avatarEl) {
      avatarEl.style.cssText = avatarStyle;
      avatarEl.textContent = (conv?.other_user_avatar_url || friend?.avatar_url) ? '' : name[0].toUpperCase();
    }
    if (nameEl) nameEl.textContent = name;

    // Show popup
    popup.style.display = 'flex';

    // Load messages
    await this.loadDmMessages(userId);
    
    // Mark as read
    await this.markDmRead(userId);

    // Subscribe to new messages
    this.subscribeToDm(userId);
  }

  closeDmChat() {
    const popup = document.getElementById('s-dm-popup');
    if (popup) popup.style.display = 'none';
    
    if (this.channels.dm) {
      this.supabase.removeChannel(this.channels.dm);
      this.channels.dm = null;
    }
    
    this.activeDmUser = null;
  }

  async loadDmMessages(userId) {
    try {
      const { data } = await this.supabase.rpc('get_dm_messages', { p_other_user: userId, p_limit: 50 });
      this.dmMessages = (data || []).reverse();
      this.renderDmMessages();
    } catch (e) { console.error('Load DM messages error:', e); }
  }

  renderDmMessages() {
    const container = document.getElementById('dm-popup-messages');
    if (!container) return;

    if (!this.dmMessages.length) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--s-text-muted);font-size:0.85rem;">No messages yet. Say hi! 👋</div>';
      return;
    }

    container.innerHTML = this.dmMessages.map(m => {
      const isMe = m.is_me || m.from_user === this.currentUser.id;
      const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="s-dm-msg ${isMe ? 'me' : 'them'}">
          ${this.escapeHtml(m.message)}
          <div class="s-dm-msg-time">${time}</div>
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

  async sendDm() {
    const input = document.getElementById('dm-popup-input');
    if (!input || !this.activeDmUser) return;

    const message = input.value.trim();
    if (!message) return;

    input.value = '';

    try {
      const { data, error } = await this.supabase.rpc('send_dm', { 
        p_to_user: this.activeDmUser, 
        p_message: message 
      });

      if (error) throw error;

      // Add to local messages immediately
      this.dmMessages.push({
        id: data,
        from_user: this.currentUser.id,
        to_user: this.activeDmUser,
        message: message,
        created_at: new Date().toISOString(),
        is_me: true
      });
      this.renderDmMessages();
    } catch (e) {
      console.error('Send DM error:', e);
      this.showToast('message', 'Error', 'Could not send message');
    }
  }

  async markDmRead(userId) {
    try {
      await this.supabase.rpc('mark_dm_read', { p_other_user: userId });
      const conv = this.dmConversations.find(c => c.other_user_id === userId);
      if (conv) conv.unread_count = 0;
    } catch (e) { console.error('Mark read error:', e); }
  }

  subscribeToDm(userId) {
    if (this.channels.dm) {
      this.supabase.removeChannel(this.channels.dm);
    }

    const myId = this.currentUser.id;
    this.channels.dm = this.supabase.channel(`dm-${myId}-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        const msg = payload.new;
        if ((msg.from_user === userId && msg.to_user === myId) || 
            (msg.from_user === myId && msg.to_user === userId)) {
          if (msg.from_user !== myId) {
            this.dmMessages.push({
              ...msg,
              is_me: false
            });
            this.renderDmMessages();
            this.playSound('message');
          }
        }
      })
      .subscribe();
  }

  handleDmTyping() {
    // Future: typing indicators
  }

  // ==================== V8: CLUBS ====================

  async loadClub() {
    try {
      const { data } = await this.supabase.rpc('get_my_club');
      
      if (data?.length > 0) {
        this.currentClub = {
          id: data[0].club_id,
          name: data[0].club_name,
          tag: data[0].club_tag,
          description: data[0].club_description,
          leader_id: data[0].club_leader_id,
          avatar_url: data[0].club_avatar_url,
          max_members: data[0].club_max_members,
          created_at: data[0].club_created_at
        };
        
        this.clubMembers = data.map(m => ({
          id: m.member_id,
          name: m.member_gamer_tag || m.member_name,
          discriminator: m.member_discriminator,
          role: m.member_role,
          avatar_url: m.member_avatar_url,
          avatar_icon: m.member_avatar_icon,
          status: m.member_status,
          account_type: m.member_account_type,
          cosmetics: m.member_cosmetics,
          joined_at: m.member_joined_at
        }));
      } else {
        this.currentClub = null;
        this.clubMembers = [];
      }
      
      this.renderClub();
    } catch (e) { console.error('Load club error:', e); }
  }

  async loadClubInvites() {
    try {
      const { data } = await this.supabase.from('club_invites')
        .select('id, club_id, from_user, clubs(name, tag), profiles!club_invites_from_user_fkey(display_name, gamer_tag)')
        .eq('to_user', this.currentUser.id)
        .eq('status', 'pending');
      this.clubInvites = data || [];
    } catch (e) { console.error('Load club invites error:', e); }
  }

  renderClub() {
    const container = document.getElementById('club-section');
    if (!container) return;

    if (!this.currentClub) {
      // Show create club UI or invites
      container.innerHTML = `
        <div class="s-club-create">
          <h3>Join or Create a Club</h3>
          <p>Clubs let you compete with friends on leaderboards</p>
          
          <div class="s-club-form">
            <input type="text" id="club-name-input" placeholder="Club Name" maxlength="20">
            <input type="text" id="club-tag-input" placeholder="Tag (2-5 chars)" maxlength="5" style="text-transform:uppercase;">
            <button class="s-btn s-btn-primary" id="create-club-btn" style="width:100%;">Create Club</button>
          </div>
          
          ${this.clubInvites.length ? `
            <div style="margin-top:24px;">
              <div class="s-label">Club Invites</div>
              ${this.clubInvites.map(inv => `
                <div class="s-party-invite-card">
                  <div class="s-invite-info">
                    <div class="s-invite-title">[${inv.clubs?.tag}] ${inv.clubs?.name}</div>
                    <div class="s-invite-sub">from ${inv.profiles?.gamer_tag || inv.profiles?.display_name}</div>
                  </div>
                  <div class="s-invite-actions">
                    <button class="s-btn s-btn-primary accept-club-inv" data-id="${inv.id}">Join</button>
                    <button class="s-btn s-btn-ghost decline-club-inv" data-id="${inv.id}">✕</button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;

      document.getElementById('create-club-btn')?.addEventListener('click', () => this.createClub());
      container.querySelectorAll('.accept-club-inv').forEach(b => {
        b.onclick = () => this.acceptClubInvite(b.dataset.id);
      });
      container.querySelectorAll('.decline-club-inv').forEach(b => {
        b.onclick = () => this.declineClubInvite(b.dataset.id);
      });
      return;
    }

    // Show club
    const isLeader = this.currentClub.leader_id === this.currentUser.id;
    const myMember = this.clubMembers.find(m => m.id === this.currentUser.id);
    const isAdmin = myMember && ['leader', 'officer'].includes(myMember.role);

    container.innerHTML = `
      <div class="s-club-header">
        <div class="s-club-avatar">${this.currentClub.tag.substring(0, 2)}</div>
        <div class="s-club-info">
          <div class="s-club-name">${this.escapeHtml(this.currentClub.name)}</div>
          <div class="s-club-tag-display">[${this.escapeHtml(this.currentClub.tag)}]</div>
          <div class="s-club-members-count">${this.clubMembers.length}/${this.currentClub.max_members} members</div>
        </div>
        ${isAdmin ? `<button class="s-btn s-btn-primary" id="open-club-invite-modal">Invite</button>` : ''}
      </div>
      
      <div class="s-label">Members (${this.clubMembers.length})</div>
      <div class="s-club-members-list">
        ${this.clubMembers.map(m => this.renderClubMember(m, isLeader, isAdmin)).join('')}
      </div>
      
      <div style="margin-top:16px;">
        <button class="s-btn s-btn-secondary" id="leave-club-btn" style="width:100%;">Leave Club</button>
      </div>
      
      <!-- Leave Confirmation Modal -->
      <div id="leave-club-confirm" class="s-confirm-modal" style="display:none;">
        <div class="s-confirm-content">
          <p>Are you sure you want to leave <strong>${this.escapeHtml(this.currentClub.name)}</strong>?</p>
          <div class="s-confirm-actions">
            <button class="s-btn s-btn-secondary" id="leave-club-cancel">Cancel</button>
            <button class="s-btn s-btn-danger" id="leave-club-yes">Leave</button>
          </div>
        </div>
      </div>
    `;

    // Bind events
    document.getElementById('leave-club-btn')?.addEventListener('click', () => {
      document.getElementById('leave-club-confirm').style.display = 'flex';
    });
    document.getElementById('leave-club-cancel')?.addEventListener('click', () => {
      document.getElementById('leave-club-confirm').style.display = 'none';
    });
    document.getElementById('leave-club-yes')?.addEventListener('click', () => {
      document.getElementById('leave-club-confirm').style.display = 'none';
      this.leaveClub();
    });
    document.getElementById('open-club-invite-modal')?.addEventListener('click', () => this.openClubInviteModal());
    
    container.querySelectorAll('.club-kick-btn').forEach(b => {
      b.onclick = () => this.kickFromClub(b.dataset.id);
    });
    container.querySelectorAll('.club-promote-btn').forEach(b => {
      b.onclick = () => this.promoteClubMember(b.dataset.id);
    });
    container.querySelectorAll('.club-member-avatar').forEach(el => {
      el.onclick = () => this.openProfileModal(el.dataset.id);
    });
  }

  openClubInviteModal() {
    const clubMemberIds = this.clubMembers.map(m => m.id);
    const availableFriends = this.friends.filter(f => !clubMemberIds.includes(f.friend_id));
    const onlineFriends = availableFriends.filter(f => f.status === 'online' || f.status === 'in_game');
    const offlineFriends = availableFriends.filter(f => !f.status || f.status === 'offline');

    const friendsList = [...onlineFriends, ...offlineFriends].map(f => {
      const name = f.gamer_tag || f.display_name || 'Unknown';
      const initial = name[0].toUpperCase();
      const isOnline = f.status === 'online' || f.status === 'in_game';
      const avatarStyle = this.getAvatarStyle(f);
      const statusClass = f.status === 'in_game' ? 'in-game' : f.status === 'online' ? 'online' : '';
      const nameStyle = this.getPremiumNameStyle(f);
      
      return `
        <div class="s-modal-friend ${isOnline ? '' : 'offline'}" data-id="${f.friend_id}">
          <div class="s-avatar-sm" style="${avatarStyle}">${f.avatar_url ? '' : initial}<div class="s-status-dot-sm ${statusClass}"></div></div>
          <span class="s-modal-friend-name" style="${nameStyle}">${this.escapeHtml(name)}</span>
          <button class="s-btn s-btn-primary s-btn-sm s-club-modal-invite-btn" data-id="${f.friend_id}">Invite</button>
        </div>`;
    }).join('');

    const modal = document.createElement('div');
    modal.className = 's-modal-overlay';
    modal.id = 'club-invite-modal';
    modal.innerHTML = `
      <div class="s-modal">
        <div class="s-modal-header">
          <span class="s-modal-title">Invite to Club</span>
          <button class="s-btn s-btn-ghost s-btn-icon s-modal-close">✕</button>
        </div>
        <div class="s-modal-body">
          ${availableFriends.length > 0 ? `
            <div class="s-modal-friends-list">${friendsList}</div>
          ` : '<div class="s-empty-mini">No friends to invite</div>'}
        </div>
      </div>`;

    document.body.appendChild(modal);

    // Bind modal events
    modal.querySelector('.s-modal-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    modal.querySelectorAll('.s-club-modal-invite-btn').forEach(btn => {
      btn.onclick = async () => {
        btn.innerHTML = 'Sent!';
        btn.disabled = true;
        btn.classList.remove('s-btn-primary');
        btn.classList.add('s-btn-success');
        await this.inviteToClub(btn.dataset.id);
      };
    });
  }

  renderClubMember(m, isLeader, isAdmin) {
    const name = m.name || 'Unknown';
    const avatarStyle = this.getAvatarStyle(m);
    const roleIcon = m.role === 'leader' ? this.icons.crown : m.role === 'officer' ? this.icons.shield : '';
    const statusClass = m.status === 'online' || m.status === 'in_game' ? 'online' : '';
    const isMe = m.id === this.currentUser.id;
    
    // Cosmetics
    const isPremium = m.account_type === 'premium';
    const cosmetics = m.cosmetics || {};
    const badge = isPremium && cosmetics.badge_icon ? cosmetics.badge_icon : '';
    const borderColor = isPremium ? cosmetics.border_color || 'gray' : 'gray';
    const nameColor = isPremium ? (this.COSMETIC_COLORS[borderColor] || '') : '';
    const nameEffect = isPremium && cosmetics.name_effect ? `tgco-effect-${cosmetics.name_effect}` : '';
    const title = isPremium && cosmetics.title ? cosmetics.title : '';
    const borderClass = isPremium ? this.getBorderColorClass({ isPremium, border_color: borderColor }) : '';
    
    let actions = '';
    if (!isMe && isAdmin && m.role === 'member') {
      actions = `<button class="s-btn s-btn-ghost s-btn-icon club-kick-btn" data-id="${m.id}" title="Kick">${this.icons.x}</button>`;
    }
    if (isLeader && !isMe && m.role !== 'leader') {
      actions += `<button class="s-btn s-btn-ghost s-btn-icon club-promote-btn" data-id="${m.id}" title="Promote">${this.icons.shield}</button>`;
    }

    const userClass = borderClass ? `s-user ${borderClass}` : 's-user';

    return `
      <div class="${userClass}">
        <div class="s-avatar club-member-avatar" style="${avatarStyle};cursor:pointer;" data-id="${m.id}">
          ${m.avatar_url ? '' : name[0].toUpperCase()}
          <div class="s-status-dot ${statusClass}"></div>
        </div>
        <div class="s-user-info">
          <div class="s-user-name">
            ${roleIcon ? `<span style="color:var(--s-accent);">${roleIcon}</span>` : ''}
            ${badge ? `<span class="s-badge-icon">${badge}</span>` : ''}
            <span class="${nameEffect}" style="color:${nameColor || 'inherit'};">${this.escapeHtml(name)}</span>
            ${m.discriminator ? `<span class="disc">#${m.discriminator}</span>` : ''}
          </div>
          ${title ? `<div class="s-premium-title" style="color:${nameColor};">${this.escapeHtml(title)}</div>` : ''}
          <div class="s-user-status">${m.role}${isMe ? ' (you)' : ''}</div>
        </div>
        <div class="s-user-actions">${actions}</div>
      </div>
    `;
  }

  async createClub() {
    const nameInput = document.getElementById('club-name-input');
    const tagInput = document.getElementById('club-tag-input');
    
    const name = nameInput?.value.trim();
    const tag = tagInput?.value.trim().toUpperCase();
    
    if (!name || name.length < 2) {
      this.showToast('party', 'Error', 'Club name must be at least 2 characters');
      return;
    }
    if (!tag || tag.length < 2 || tag.length > 5) {
      this.showToast('party', 'Error', 'Tag must be 2-5 characters');
      return;
    }

    try {
      const { data, error } = await this.supabase.rpc('create_club', { 
        p_name: name, 
        p_tag: tag 
      });
      
      if (error) throw error;
      
      await this.loadClub();
      this.showToast('party', 'Club Created!', `[${tag}] ${name}`);
    } catch (e) {
      console.error('Create club error:', e);
      this.showToast('party', 'Error', e.message || 'Could not create club');
    }
  }

  async leaveClub() {
    try {
      await this.supabase.rpc('leave_club');
      this.currentClub = null;
      this.clubMembers = [];
      this.renderClub();
      this.showToast('party', 'Left Club', 'You have left the club');
    } catch (e) {
      console.error('Leave club error:', e);
    }
  }

  async kickFromClub(userId) {
    try {
      await this.supabase.rpc('kick_from_club', { p_user_id: userId });
      await this.loadClub();
    } catch (e) { console.error('Kick error:', e); }
  }

  async promoteClubMember(userId) {
    try {
      await this.supabase.rpc('set_club_role', { p_user_id: userId, p_role: 'officer' });
      await this.loadClub();
      this.showToast('party', 'Promoted', 'Member promoted to officer');
    } catch (e) { console.error('Promote error:', e); }
  }

  async inviteToClub(userId) {
    try {
      const { error } = await this.supabase.rpc('invite_to_club', { p_user_id: userId });
      if (error) throw error;
      this.showToast('party', 'Invite Sent', 'Club invite sent!');
    } catch (e) {
      console.error('Club invite error:', e);
      this.showToast('party', 'Error', e.message || 'Could not send invite');
    }
  }

  async acceptClubInvite(inviteId) {
    try {
      await this.supabase.rpc('accept_club_invite', { p_invite_id: inviteId });
      await this.loadClub();
      await this.loadClubInvites();
    } catch (e) { console.error('Accept club invite error:', e); }
  }

  async declineClubInvite(inviteId) {
    try {
      await this.supabase.from('club_invites').update({ status: 'declined' }).eq('id', inviteId);
      this.clubInvites = this.clubInvites.filter(i => i.id !== inviteId);
      this.renderClub();
    } catch (e) { console.error('Decline club invite error:', e); }
  }

  // ==================== V8: EMOJI PICKER ====================

  toggleEmojiPicker(inputId) {
    const picker = document.getElementById('s-emoji-picker');
    if (!picker) return;

    if (picker.style.display === 'none' || picker.style.display === '') {
      picker.style.display = 'block';
      picker.dataset.targetInput = inputId;
      
      // Position near the button
      let btnId;
      if (inputId === 'dm-popup-input') btnId = 'dm-popup-emoji';
      else if (inputId === 'party-chat-input') btnId = 'party-emoji-btn';
      else btnId = 'party-emoji-btn';
      
      const btn = document.getElementById(btnId);
      if (btn) {
        const rect = btn.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.bottom = 'auto';
        picker.style.top = Math.max(10, rect.top - picker.offsetHeight - 8) + 'px';
        picker.style.left = Math.max(10, rect.left) + 'px';
      }
    } else {
      picker.style.display = 'none';
    }
  }

  insertEmoji(emoji) {
    const picker = document.getElementById('s-emoji-picker');
    const inputId = picker?.dataset.targetInput;
    const input = document.getElementById(inputId);
    
    if (input) {
      input.value += emoji;
      input.focus();
    }
    
    if (picker) picker.style.display = 'none';
  }

  // ==================== V8: HELPER FUNCTIONS ====================

  formatTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd';
    return date.toLocaleDateString();
  }
}

// Initialize
function initSocialSystem() {
  if (typeof supabaseClient !== 'undefined') window.socialSystem = new SocialSystem(supabaseClient);
  else setTimeout(initSocialSystem, 100);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSocialSystem);
else initSocialSystem();

window.SocialSystem = SocialSystem;
