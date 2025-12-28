/* =============================================
   SOCIAL SYSTEM v5 - TheGaming.co
   Clean, Modern, Premium Design
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
      arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`
    };

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
    
    this.init();
  }

  async init() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) return;
    
    this.currentUser = session.user;
    await this.loadUserProfile();
    this.injectStyles();
    this.injectHTML();
    this.bindEvents();
    await this.loadAll();
    await this.updatePresence('online');
    this.startPresenceHeartbeat();
    this.subscribeToRealtime();
    this.updateNotificationBadge();
  }

  async loadAll() {
    await Promise.all([
      this.loadFriends(),
      this.loadRequests(),
      this.loadInvites(),
      this.loadParty(),
      this.loadPartyInvites()
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
      }
      .s-profile-inner {
        display: flex;
        align-items: center;
        gap: 14px;
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
      .s-btn svg { width: 16px; height: 16px; }
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

      /* ===== MOBILE ===== */
      @media (max-width: 480px) {
        .s-panel { max-width: 100%; }
        .s-header { padding: 16px; }
        .s-title { font-size: 1.25rem; }
        .s-profile { margin: 12px; padding: 14px; }
        .s-search { margin: 0 12px 10px; }
        .s-tabs { margin: 0 12px 10px; }
        .s-content { padding: 0 12px 12px; }
        #s-toasts { top: 12px; right: 12px; left: 12px; }
        .s-toast { min-width: auto; width: 100%; }
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

    const displayName = this.userProfile?.gamer_tag || this.userProfile?.display_name || 'Player';
    const initial = displayName[0].toUpperCase();
    const handle = this.generateHandle();
    const avatarStyle = this.getAvatarStyle(this.userProfile);

    const html = `
      <div class="s-overlay" id="s-overlay"></div>
      
      <div class="s-panel" id="s-panel">
        <div class="s-header">
          <h2 class="s-title">F R I E N D S</h2>
          <button class="s-close" id="s-close">${this.icons.x}</button>
        </div>
        
        <div class="s-profile">
          <div class="s-profile-inner">
            <div class="s-profile-avatar" style="${avatarStyle}">${this.userProfile?.avatar_url ? '' : initial}</div>
            <div class="s-profile-info">
              <div class="s-profile-name">${this.escapeHtml(displayName)}</div>
              <div class="s-profile-tag">
                <code class="s-profile-code" id="my-handle">${this.escapeHtml(handle)}</code>
                <button class="s-copy-btn" id="copy-handle">${this.icons.copy}</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="s-search">
          <span class="s-search-icon">${this.icons.search}</span>
          <input type="text" class="s-search-input" id="s-search" placeholder="Add friend by Username#1234">
        </div>
        
        <div class="s-tabs">
          <button class="s-tab active" data-tab="friends">Friends</button>
          <button class="s-tab" data-tab="party">Party</button>
          <button class="s-tab" data-tab="requests">Requests <span class="s-tab-count" id="req-count" style="display:none;">0</span></button>
        </div>
        
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
          
          <!-- Requests Tab -->
          <div class="s-tab-panel" id="panel-requests">
            <div id="incoming-requests"></div>
            <div id="sent-requests"></div>
          </div>
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
    
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.isOpen) this.close(); });
    
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
    this.channels.invites = this.supabase.channel('invites_ch')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_invites', filter: `to_user=eq.${this.currentUser.id}` }, async (payload) => {
        await this.loadInvites();
        this.updateNotificationBadge();
        const { data: sender } = await this.supabase.from('profiles').select('display_name, gamer_tag').eq('id', payload.new.from_user).single();
        const name = sender?.gamer_tag || sender?.display_name || 'Someone';
        this.showToast('game', 'Game Invite', `${name} invited you to ${payload.new.game_name}`, [
          { label: 'Join', style: 'primary', action: `acceptInvite:${payload.new.id}:${payload.new.game_name}:${payload.new.room_code}` },
          { label: 'Ignore', action: `declineInvite:${payload.new.id}` }
        ]);
      }).subscribe();

    this.channels.requests = this.supabase.channel('requests_ch')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friend_requests', filter: `to_user=eq.${this.currentUser.id}` }, async (payload) => {
        await this.loadRequests();
        this.updateNotificationBadge();
        const { data: sender } = await this.supabase.from('profiles').select('display_name, gamer_tag, discriminator').eq('id', payload.new.from_user).single();
        const name = sender?.gamer_tag || sender?.display_name || 'Someone';
        const tag = sender?.discriminator ? `#${sender.discriminator}` : '';
        this.showToast('friend', 'Friend Request', `${name}${tag} wants to be friends`, [
          { label: 'Accept', style: 'primary', action: `acceptRequest:${payload.new.id}` },
          { label: 'Decline', action: `declineRequest:${payload.new.id}` }
        ]);
      }).subscribe();

    this.channels.partyInvites = this.supabase.channel('partyinv_ch')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'party_invites', filter: `to_user=eq.${this.currentUser.id}` }, async (payload) => {
        await this.loadPartyInvites();
        this.updateNotificationBadge();
        const { data: sender } = await this.supabase.from('profiles').select('display_name, gamer_tag').eq('id', payload.new.from_user).single();
        const name = sender?.gamer_tag || sender?.display_name || 'Someone';
        this.showToast('party', 'Party Invite', `${name} invited you to their party`, [
          { label: 'Join', style: 'primary', action: `acceptPartyInvite:${payload.new.id}` },
          { label: 'Decline', action: `declinePartyInvite:${payload.new.id}` }
        ]);
      }).subscribe();

    this.subscribeToParty();
  }

  subscribeToParty() {
    if (this.channels.party) this.channels.party.unsubscribe();
    if (!this.currentParty) return;

    this.channels.party = this.supabase.channel(`party_${this.currentParty.party_id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parties', filter: `id=eq.${this.currentParty.party_id}` }, async (payload) => {
        if (payload.eventType === 'DELETE') {
          this.currentParty = null;
          this.partyMembers = [];
          this.renderParty();
          this.showToast('party', 'Party Ended', 'The party has been disbanded');
          return;
        }
        
        const oldUrl = this.lastHostUrl;
        await this.loadParty();
        
        // AUTO-FOLLOW
        if (this.currentParty && this.currentParty.leader_id !== this.currentUser.id && this.isFollowingHost) {
          const newUrl = this.currentParty.current_room;
          if (newUrl && newUrl !== oldUrl && newUrl !== window.location.pathname + window.location.search) {
            this.showToast('follow', 'Following Host', `Joining ${this.currentParty.current_game}...`, []);
            setTimeout(() => { window.location.href = newUrl; }, 1200);
          }
        }
        this.lastHostUrl = this.currentParty?.current_room || null;
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'party_members', filter: `party_id=eq.${this.currentParty.party_id}` }, () => {
        this.loadParty();
      })
      .subscribe();
  }

  // ==================== TOAST ====================

  showToast(type, title, message, actions = []) {
    const container = document.getElementById('s-toasts');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `s-toast ${type}`;
    
    const iconMap = { game: this.icons.gamepad, party: this.icons.users, friend: this.icons.userPlus, follow: this.icons.link };
    
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
      const { data } = await this.supabase.from('profiles').select('id, display_name, gamer_tag, discriminator, avatar_url, avatar_icon').eq('id', this.currentUser.id).single();
      this.userProfile = data || { display_name: 'Player', id: this.currentUser.id };
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
      this.friends = data || [];
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

  async loadParty() {
    try {
      const { data } = await this.supabase.rpc('get_my_party');
      if (data?.length > 0) {
        this.currentParty = {
          party_id: data[0].party_id,
          party_name: data[0].party_name,
          leader_id: data[0].leader_id,
          current_game: data[0].current_game,
          current_room: data[0].current_room,
          status: data[0].status,
          max_size: data[0].max_size || 8
        };
        this.partyMembers = data.map(m => ({
          id: m.member_id, 
          name: m.member_gamer_tag || m.member_name,
          discriminator: m.member_discriminator, 
          role: m.member_role, 
          status: m.member_status,
          avatar_url: m.member_avatar_url,
          avatar_icon: m.member_avatar_icon
        }));
        this.lastHostUrl = this.currentParty.current_room;
        this.subscribeToParty();
      } else {
        this.currentParty = null;
        this.partyMembers = [];
      }
      this.renderParty();
    } catch (e) { console.error(e); }
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
    
    const canInvite = (f.status === 'online' || f.status === 'in_game') && this.isInLobby();
    const canJoin = f.status === 'in_game' && f.current_room;
    const canPartyInvite = this.isPartyLeader() && (f.status === 'online' || f.status === 'in_game');

    let actions = '';
    if (canPartyInvite) actions += `<button class="s-btn s-btn-secondary s-btn-icon party-invite-btn" data-id="${f.friend_id}" title="Invite to Party">${this.icons.plus}</button>`;
    if (canJoin) actions += `<button class="s-btn s-btn-primary join-btn" data-id="${f.friend_id}" data-game="${f.current_game}" data-room="${f.current_room}">Join</button>`;
    else if (canInvite) actions += `<button class="s-btn s-btn-primary invite-btn" data-id="${f.friend_id}">Invite</button>`;

    return `
      <div class="s-user" data-id="${f.friend_id}">
        <div class="s-avatar ${avatarClass}" style="${avatarStyle}">${f.avatar_url ? '' : initial}<div class="s-status-dot ${statusClass}"></div></div>
        <div class="s-user-info">
          <div class="s-user-name">${this.escapeHtml(name)}<span class="disc">${tag}</span></div>
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
          <button class="s-btn s-btn-primary" id="create-party-btn">${this.icons.plus} Create</button>
        </div>`;
      document.getElementById('create-party-btn')?.addEventListener('click', () => this.createParty());
      return;
    }

    const isLeader = this.isPartyLeader();
    const inGame = this.currentParty.status === 'in_game' && this.currentParty.current_room;
    const memberCount = this.partyMembers.length;
    const maxSize = this.currentParty.max_size || 8;

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
      
      let actions = '';
      if (isLeader && !isMe) {
        actions = `
          <button class="s-btn s-btn-ghost s-btn-icon transfer-btn" data-id="${m.id}" title="Make Host">${this.icons.crown}</button>
          <button class="s-btn s-btn-ghost s-btn-icon kick-btn" data-id="${m.id}" title="Kick">${this.icons.x}</button>`;
      }
      
      return `
        <div class="s-party-member">
          <div class="s-party-member-avatar" style="${avatarStyle}">${m.avatar_url ? '' : initial}${isMemberLeader ? `<span class="s-crown">${this.icons.crown}</span>` : ''}</div>
          <div class="s-party-member-info">
            <div class="s-party-member-name">
              ${this.escapeHtml(m.name)}
              ${isMemberLeader ? '<span class="s-host-tag">Host</span>' : ''}
              ${isMe ? '<span class="s-you-tag">(You)</span>' : ''}
            </div>
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
        <div class="s-party-actions">
          <button class="s-btn s-btn-danger" id="leave-party" style="width:100%">${this.icons.logout} Leave</button>
        </div>
      </div>`;

    document.getElementById('leave-party')?.addEventListener('click', () => this.leaveParty());
    document.getElementById('join-party-game')?.addEventListener('click', () => this.joinPartyGame());
    container.querySelectorAll('.kick-btn').forEach(b => b.addEventListener('click', () => this.kickFromParty(b.dataset.id)));
    container.querySelectorAll('.transfer-btn').forEach(b => b.addEventListener('click', () => this.transferLeadership(b.dataset.id)));
  }

  renderPartyInvites() {
    const container = document.getElementById('party-invites');
    if (!container) return;
    if (!this.partyInvites.length) { container.innerHTML = ''; return; }

    container.innerHTML = `<div class="s-label">Party Invites</div>` + this.partyInvites.map(inv => {
      const name = inv.profiles?.gamer_tag || inv.profiles?.display_name || 'Someone';
      return `
        <div class="s-invite party">
          <div class="s-invite-icon">${this.icons.users}</div>
          <div class="s-invite-info">
            <div class="s-invite-title">${this.escapeHtml(name)}</div>
            <div class="s-invite-sub">Invited to party</div>
          </div>
          <div class="s-invite-actions">
            <button class="s-btn s-btn-primary accept-party-btn" data-id="${inv.id}">Join</button>
            <button class="s-btn s-btn-secondary s-btn-icon decline-party-btn" data-id="${inv.id}">${this.icons.x}</button>
          </div>
        </div>`;
    }).join('');

    container.querySelectorAll('.accept-party-btn').forEach(b => b.addEventListener('click', () => this.acceptPartyInvite(b.dataset.id)));
    container.querySelectorAll('.decline-party-btn').forEach(b => b.addEventListener('click', () => this.declinePartyInvite(b.dataset.id)));
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

      container.querySelectorAll('.add-btn').forEach(b => b.addEventListener('click', () => this.sendFriendRequest(b.dataset.id)));
      container.querySelectorAll('.accept-search-btn').forEach(b => {
        b.addEventListener('click', () => {
          const req = this.pendingRequests.find(r => r.from_user === b.dataset.id);
          if (req) this.acceptRequest(req.id);
        });
      });
    } catch (e) { 
      console.error(e); 
      container.innerHTML = `<div class="s-empty"><p class="s-empty-text">Search error</p></div>`; 
    }
  }

  // ==================== API CALLS ====================

  async sendFriendRequest(userId) {
    try {
      await this.supabase.from('friend_requests').insert({ from_user: this.currentUser.id, to_user: userId });
      await this.loadRequests();
      const input = document.getElementById('s-search');
      if (input?.value) this.searchUsers(input.value);
    } catch (e) { console.error(e); alert('Failed to send request'); }
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
    if (!confirm('Remove this friend?')) return;
    try {
      await this.supabase.rpc('remove_friend', { friend_user_id: id });
      await this.loadFriends();
    } catch (e) { console.error(e); }
  }

  async blockUser(id) {
    if (!confirm('Block this user?')) return;
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
      this.showToast('party', 'Party Created', 'Invite friends from the Friends tab');
    } catch (e) {
      console.error(e);
      if (e.message?.includes('Already')) alert('Already in a party');
    }
  }

  async inviteToParty(userId) {
    try {
      await this.supabase.rpc('invite_to_party', { invitee_id: userId });
      this.showToast('party', 'Invite Sent', 'Party invite sent');
    } catch (e) { console.error(e); alert(e.message || 'Could not invite'); }
  }

  async acceptPartyInvite(id) {
    try {
      await this.supabase.rpc('accept_party_invite', { invite_id: id });
      await this.loadParty();
      await this.loadPartyInvites();
      this.showToast('party', 'Joined Party', 'You will follow the host automatically');
    } catch (e) { console.error(e); alert(e.message || 'Could not join'); }
  }

  async declinePartyInvite(id) {
    try {
      await this.supabase.from('party_invites').update({ status: 'declined' }).eq('id', id);
      await this.loadPartyInvites();
    } catch (e) { console.error(e); }
  }

  async leaveParty() {
    if (!confirm('Leave the party?')) return;
    try {
      await this.supabase.rpc('leave_party');
      this.currentParty = null;
      this.partyMembers = [];
      this.renderParty();
    } catch (e) { console.error(e); }
  }

  async kickFromParty(userId) {
    if (!confirm('Kick this player?')) return;
    try {
      await this.supabase.rpc('kick_from_party', { kick_user_id: userId });
      await this.loadParty();
    } catch (e) { console.error(e); }
  }

  async transferLeadership(userId) {
    if (!confirm('Make this player the host?')) return;
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
}

// Initialize
function initSocialSystem() {
  if (typeof supabaseClient !== 'undefined') window.socialSystem = new SocialSystem(supabaseClient);
  else setTimeout(initSocialSystem, 100);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSocialSystem);
else initSocialSystem();

window.SocialSystem = SocialSystem;
