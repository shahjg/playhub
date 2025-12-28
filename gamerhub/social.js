/* =============================================
   SOCIAL SYSTEM v4 - TheGaming.co
   Premium Edition - SVG Icons, Auto-Follow Party
   Senior UI/UX Design Implementation
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
    this.activeTab = 'party';
    this.channels = {};
    this.notificationCount = 0;
    this.originalTitle = document.title;
    this.titleFlashInterval = null;
    this.lastHostUrl = null;
    this.isFollowingHost = true;
    
    // SVG Icon Library
    this.icons = {
      users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      userPlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
      userMinus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
      search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
      party: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      crown: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 19h19v3h-19zM22.1 6.5L17.5 11l-5.5-9-5.5 9L2 6.5l2.5 11h15.1l2.5-11z"/></svg>`,
      x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
      plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
      gamepad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>`,
      logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
      moreVertical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
      copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
      bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
      shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      play: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
      radio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>`,
      zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
      arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
      inbox: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`
    };
    
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
    this.trackHostNavigation();
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
    if (document.getElementById('social-v4-styles')) return;
    const style = document.createElement('style');
    style.id = 'social-v4-styles';
    style.textContent = `
      :root {
        --social-bg-primary: #0a0a0f;
        --social-bg-secondary: #12121a;
        --social-bg-tertiary: #1a1a24;
        --social-bg-hover: rgba(255, 255, 255, 0.04);
        --social-border: rgba(255, 255, 255, 0.06);
        --social-border-hover: rgba(255, 255, 255, 0.12);
        --social-text-primary: #ffffff;
        --social-text-secondary: rgba(255, 255, 255, 0.6);
        --social-text-muted: rgba(255, 255, 255, 0.35);
        --social-accent: #6366f1;
        --social-accent-hover: #818cf8;
        --social-success: #10b981;
        --social-warning: #f59e0b;
        --social-danger: #ef4444;
        --social-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        --social-radius-sm: 8px;
        --social-radius-md: 12px;
        --social-radius-lg: 16px;
        --social-radius-xl: 20px;
        --social-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        --social-transition: cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* ===== TRIGGER BUTTON ===== */
      .social-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--social-gradient);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35);
        transition: all 0.3s var(--social-transition);
        z-index: 9998;
        outline: none;
      }
      .social-fab svg { width: 24px; height: 24px; }
      .social-fab:hover {
        transform: scale(1.08) translateY(-2px);
        box-shadow: 0 12px 40px rgba(99, 102, 241, 0.45);
      }
      .social-fab:active { transform: scale(0.96); }
      .social-fab .fab-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        min-width: 20px;
        height: 20px;
        background: var(--social-danger);
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
        opacity: 0;
        transform: scale(0);
        transition: all 0.25s var(--social-transition);
        border: 2px solid var(--social-bg-primary);
      }
      .social-fab .fab-badge.visible { opacity: 1; transform: scale(1); }
      
      /* Pulse animation for notifications */
      .social-fab.has-notifications::after {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 2px solid var(--social-accent);
        animation: fabPulse 2s ease-out infinite;
      }
      @keyframes fabPulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(1.3); opacity: 0; }
      }

      /* ===== OVERLAY ===== */
      .social-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s var(--social-transition);
        z-index: 9999;
      }
      .social-overlay.open { opacity: 1; visibility: visible; }

      /* ===== SLIDE PANEL ===== */
      .social-slide-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 100%;
        max-width: 400px;
        height: 100%;
        background: var(--social-bg-primary);
        border-left: 1px solid var(--social-border);
        transform: translateX(100%);
        transition: transform 0.4s var(--social-transition);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .social-slide-panel.open { transform: translateX(0); }

      /* ===== PANEL HEADER ===== */
      .sp-header {
        padding: 20px;
        border-bottom: 1px solid var(--social-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .sp-header-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--social-text-primary);
        letter-spacing: -0.025em;
      }
      .sp-close {
        width: 36px;
        height: 36px;
        border-radius: var(--social-radius-sm);
        background: var(--social-bg-hover);
        border: 1px solid transparent;
        color: var(--social-text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .sp-close svg { width: 18px; height: 18px; }
      .sp-close:hover {
        background: var(--social-bg-tertiary);
        border-color: var(--social-border);
        color: var(--social-text-primary);
      }

      /* ===== PROFILE NAMEPLATE ===== */
      .sp-nameplate {
        margin: 0 16px 16px;
        padding: 16px;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%);
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: var(--social-radius-lg);
        flex-shrink: 0;
      }
      .sp-nameplate-inner {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .sp-nameplate-avatar {
        width: 52px;
        height: 52px;
        border-radius: var(--social-radius-md);
        background: var(--social-gradient);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1.25rem;
        color: white;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      }
      .sp-nameplate-info { flex: 1; min-width: 0; }
      .sp-nameplate-name {
        font-weight: 600;
        font-size: 1rem;
        color: var(--social-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 6px;
      }
      .sp-nameplate-tag {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .sp-nameplate-code {
        font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
        font-size: 0.8rem;
        color: var(--social-text-muted);
        background: rgba(0, 0, 0, 0.3);
        padding: 4px 10px;
        border-radius: 6px;
      }
      .sp-copy-btn {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.06);
        border: none;
        color: var(--social-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .sp-copy-btn svg { width: 14px; height: 14px; }
      .sp-copy-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--social-text-primary); }

      /* ===== TABS ===== */
      .sp-tabs {
        display: flex;
        gap: 4px;
        padding: 0 16px 12px;
        flex-shrink: 0;
      }
      .sp-tab {
        flex: 1;
        padding: 10px 8px;
        border: none;
        background: transparent;
        color: var(--social-text-muted);
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        border-radius: var(--social-radius-sm);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        position: relative;
      }
      .sp-tab svg { width: 16px; height: 16px; opacity: 0.7; }
      .sp-tab:hover { color: var(--social-text-secondary); background: var(--social-bg-hover); }
      .sp-tab.active {
        background: rgba(99, 102, 241, 0.12);
        color: var(--social-accent-hover);
      }
      .sp-tab.active svg { opacity: 1; }
      .sp-tab-badge {
        min-width: 16px;
        height: 16px;
        background: var(--social-danger);
        border-radius: 8px;
        font-size: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
      }

      /* ===== CONTENT AREA ===== */
      .sp-content {
        flex: 1;
        overflow-y: auto;
        padding: 0 16px 16px;
        scroll-behavior: smooth;
      }
      .sp-content::-webkit-scrollbar { width: 5px; }
      .sp-content::-webkit-scrollbar-track { background: transparent; }
      .sp-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
      .sp-content::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }

      .sp-tab-panel { display: none; }
      .sp-tab-panel.active { display: block; animation: fadeIn 0.2s ease; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

      /* ===== SECTION HEADERS ===== */
      .sp-section-label {
        font-size: 0.65rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--social-text-muted);
        margin: 16px 0 10px;
        padding-left: 2px;
      }
      .sp-section-label:first-child { margin-top: 0; }

      /* ===== USER CARD ===== */
      .sp-user-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--social-bg-secondary);
        border: 1px solid var(--social-border);
        border-radius: var(--social-radius-md);
        margin-bottom: 8px;
        transition: all 0.2s;
      }
      .sp-user-card:hover {
        background: var(--social-bg-tertiary);
        border-color: var(--social-border-hover);
      }
      .sp-user-avatar {
        width: 42px;
        height: 42px;
        border-radius: var(--social-radius-sm);
        background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.95rem;
        color: white;
        flex-shrink: 0;
        position: relative;
      }
      .sp-user-avatar.online { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
      .sp-user-avatar.in-game { background: var(--social-gradient); }
      .sp-status-dot {
        position: absolute;
        bottom: -3px;
        right: -3px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2.5px solid var(--social-bg-secondary);
        background: #6b7280;
      }
      .sp-status-dot.online { background: var(--social-success); }
      .sp-status-dot.in-game { background: var(--social-accent); }
      .sp-user-info { flex: 1; min-width: 0; }
      .sp-user-name {
        font-weight: 500;
        font-size: 0.9rem;
        color: var(--social-text-primary);
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 2px;
      }
      .sp-user-name .sp-discriminator {
        color: var(--social-text-muted);
        font-weight: 400;
        font-size: 0.8rem;
      }
      .sp-user-status {
        font-size: 0.75rem;
        color: var(--social-text-muted);
      }
      .sp-user-status.playing { color: var(--social-accent-hover); }
      .sp-user-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }

      /* ===== BUTTONS ===== */
      .sp-btn {
        padding: 8px 14px;
        border-radius: var(--social-radius-sm);
        border: none;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        white-space: nowrap;
      }
      .sp-btn svg { width: 16px; height: 16px; }
      .sp-btn-primary {
        background: var(--social-gradient);
        color: white;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
      }
      .sp-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35); }
      .sp-btn-secondary {
        background: var(--social-bg-tertiary);
        color: var(--social-text-secondary);
        border: 1px solid var(--social-border);
      }
      .sp-btn-secondary:hover { background: var(--social-bg-hover); color: var(--social-text-primary); border-color: var(--social-border-hover); }
      .sp-btn-success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
      }
      .sp-btn-success:hover { filter: brightness(1.1); }
      .sp-btn-danger {
        background: rgba(239, 68, 68, 0.12);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.2);
      }
      .sp-btn-danger:hover { background: rgba(239, 68, 68, 0.2); }
      .sp-btn-icon {
        width: 34px;
        height: 34px;
        padding: 0;
      }
      .sp-btn-ghost {
        background: transparent;
        color: var(--social-text-muted);
        padding: 6px;
      }
      .sp-btn-ghost:hover { background: var(--social-bg-hover); color: var(--social-text-primary); }

      /* ===== SEARCH INPUT ===== */
      .sp-search-wrapper {
        position: relative;
        margin-bottom: 16px;
      }
      .sp-search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--social-text-muted);
        pointer-events: none;
        width: 18px;
        height: 18px;
      }
      .sp-search-input {
        width: 100%;
        padding: 13px 16px 13px 46px;
        background: var(--social-bg-secondary);
        border: 1px solid var(--social-border);
        border-radius: var(--social-radius-md);
        color: var(--social-text-primary);
        font-size: 0.9rem;
        transition: all 0.2s;
      }
      .sp-search-input::placeholder { color: var(--social-text-muted); }
      .sp-search-input:focus {
        outline: none;
        border-color: var(--social-accent);
        background: var(--social-bg-tertiary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      /* ===== EMPTY STATES ===== */
      .sp-empty {
        text-align: center;
        padding: 48px 24px;
        color: var(--social-text-muted);
      }
      .sp-empty-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
        background: var(--social-bg-secondary);
        border-radius: var(--social-radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .sp-empty-icon svg { width: 28px; height: 28px; opacity: 0.4; }
      .sp-empty-text { font-size: 0.9rem; line-height: 1.6; }

      /* ===== PARTY CARD ===== */
      .sp-party-card {
        background: var(--social-bg-secondary);
        border: 1px solid var(--social-border);
        border-radius: var(--social-radius-lg);
        overflow: hidden;
      }
      .sp-party-header {
        padding: 16px;
        border-bottom: 1px solid var(--social-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .sp-party-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        color: var(--social-text-primary);
      }
      .sp-party-icon {
        width: 38px;
        height: 38px;
        background: var(--social-gradient);
        border-radius: var(--social-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      .sp-party-icon svg { width: 20px; height: 20px; }
      .sp-party-badge {
        font-size: 0.7rem;
        font-weight: 500;
        padding: 4px 10px;
        border-radius: 20px;
        background: var(--social-bg-tertiary);
        color: var(--social-text-muted);
      }
      .sp-party-badge.active {
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
      }
      .sp-party-badge.hosting {
        background: rgba(245, 158, 11, 0.12);
        color: #fbbf24;
      }

      /* Party Game Banner */
      .sp-party-game {
        padding: 14px 16px;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%);
        border-bottom: 1px solid rgba(16, 185, 129, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .sp-party-game-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .sp-party-game-icon {
        width: 38px;
        height: 38px;
        background: rgba(16, 185, 129, 0.15);
        border-radius: var(--social-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #34d399;
      }
      .sp-party-game-icon svg { width: 20px; height: 20px; }
      .sp-party-game-label { font-size: 0.75rem; color: var(--social-text-muted); margin-bottom: 2px; }
      .sp-party-game-name { font-weight: 600; color: var(--social-text-primary); }

      /* Party Members */
      .sp-party-members { padding: 8px 16px; }
      .sp-party-member {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--social-border);
      }
      .sp-party-member:last-child { border-bottom: none; }
      .sp-party-member-avatar {
        width: 38px;
        height: 38px;
        border-radius: var(--social-radius-sm);
        background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
        color: white;
        position: relative;
      }
      .sp-party-member-avatar.host { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
      .sp-crown-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 16px;
        height: 16px;
        color: #fbbf24;
      }
      .sp-party-member-info { flex: 1; }
      .sp-party-member-name {
        font-weight: 500;
        font-size: 0.9rem;
        color: var(--social-text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .sp-host-tag {
        font-size: 0.65rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(245, 158, 11, 0.12);
        color: #fbbf24;
      }
      .sp-you-tag {
        font-size: 0.65rem;
        font-weight: 500;
        color: var(--social-text-muted);
      }
      .sp-party-member-status {
        font-size: 0.75rem;
        color: var(--social-text-muted);
        margin-top: 2px;
      }

      /* Party Actions */
      .sp-party-actions {
        padding: 16px;
        border-top: 1px solid var(--social-border);
        display: flex;
        gap: 10px;
      }
      .sp-party-actions .sp-btn { flex: 1; }

      /* Host Controls Banner */
      .sp-host-controls {
        margin: 0 16px 12px;
        padding: 12px 14px;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%);
        border: 1px solid rgba(245, 158, 11, 0.2);
        border-radius: var(--social-radius-md);
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .sp-host-controls-icon {
        width: 36px;
        height: 36px;
        background: rgba(245, 158, 11, 0.15);
        border-radius: var(--social-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fbbf24;
      }
      .sp-host-controls-icon svg { width: 18px; height: 18px; }
      .sp-host-controls-text { flex: 1; }
      .sp-host-controls-title { font-weight: 600; font-size: 0.85rem; color: var(--social-text-primary); }
      .sp-host-controls-desc { font-size: 0.75rem; color: var(--social-text-muted); margin-top: 2px; }

      /* ===== INVITE CARDS ===== */
      .sp-invite-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px;
        background: var(--social-bg-secondary);
        border: 1px solid var(--social-border);
        border-radius: var(--social-radius-md);
        margin-bottom: 10px;
      }
      .sp-invite-card.game { border-left: 3px solid var(--social-accent); }
      .sp-invite-card.party { border-left: 3px solid var(--social-warning); }
      .sp-invite-icon {
        width: 42px;
        height: 42px;
        border-radius: var(--social-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .sp-invite-icon svg { width: 20px; height: 20px; }
      .sp-invite-card.game .sp-invite-icon { background: rgba(99, 102, 241, 0.12); color: var(--social-accent-hover); }
      .sp-invite-card.party .sp-invite-icon { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
      .sp-invite-info { flex: 1; min-width: 0; }
      .sp-invite-title { font-weight: 500; font-size: 0.9rem; color: var(--social-text-primary); }
      .sp-invite-subtitle { font-size: 0.8rem; color: var(--social-text-muted); margin-top: 2px; }
      .sp-invite-actions { display: flex; gap: 6px; flex-shrink: 0; }

      /* ===== OPTIONS MENU ===== */
      .sp-options { position: relative; }
      .sp-options-menu {
        position: absolute;
        top: 100%;
        right: 0;
        min-width: 160px;
        background: var(--social-bg-tertiary);
        border: 1px solid var(--social-border-hover);
        border-radius: var(--social-radius-md);
        padding: 6px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px) scale(0.96);
        transition: all 0.2s var(--social-transition);
        z-index: 100;
        box-shadow: var(--social-shadow);
      }
      .sp-options-menu.open { opacity: 1; visibility: visible; transform: translateY(6px) scale(1); }
      .sp-options-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 12px;
        border: none;
        background: transparent;
        color: var(--social-text-secondary);
        font-size: 0.85rem;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.15s;
        text-align: left;
      }
      .sp-options-item svg { width: 16px; height: 16px; opacity: 0.7; }
      .sp-options-item:hover { background: var(--social-bg-hover); color: var(--social-text-primary); }
      .sp-options-item.danger { color: #f87171; }
      .sp-options-item.danger:hover { background: rgba(239, 68, 68, 0.1); }

      /* ===== TOAST NOTIFICATIONS ===== */
      #sp-toasts {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
        max-width: calc(100vw - 40px);
      }
      .sp-toast {
        background: var(--social-bg-tertiary);
        border: 1px solid var(--social-border-hover);
        border-radius: var(--social-radius-lg);
        padding: 16px;
        min-width: 320px;
        max-width: 380px;
        box-shadow: var(--social-shadow);
        pointer-events: auto;
        animation: toastSlideIn 0.4s var(--social-transition);
        display: flex;
        gap: 14px;
        position: relative;
      }
      .sp-toast.game { border-left: 3px solid var(--social-accent); }
      .sp-toast.party { border-left: 3px solid var(--social-warning); }
      .sp-toast.friend { border-left: 3px solid var(--social-success); }
      .sp-toast.follow { border-left: 3px solid var(--social-success); }
      .sp-toast-icon {
        width: 42px;
        height: 42px;
        border-radius: var(--social-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .sp-toast-icon svg { width: 20px; height: 20px; }
      .sp-toast.game .sp-toast-icon { background: rgba(99, 102, 241, 0.12); color: var(--social-accent-hover); }
      .sp-toast.party .sp-toast-icon { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
      .sp-toast.friend .sp-toast-icon { background: rgba(16, 185, 129, 0.12); color: #34d399; }
      .sp-toast.follow .sp-toast-icon { background: rgba(16, 185, 129, 0.12); color: #34d399; }
      .sp-toast-content { flex: 1; min-width: 0; }
      .sp-toast-title { font-weight: 600; font-size: 0.9rem; color: var(--social-text-primary); margin-bottom: 4px; }
      .sp-toast-message { font-size: 0.8rem; color: var(--social-text-secondary); line-height: 1.4; }
      .sp-toast-actions { display: flex; gap: 8px; margin-top: 12px; }
      .sp-toast-close {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        background: var(--social-bg-hover);
        border: none;
        color: var(--social-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .sp-toast-close svg { width: 14px; height: 14px; }
      .sp-toast-close:hover { background: var(--social-bg-secondary); color: var(--social-text-primary); }
      @keyframes toastSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .sp-toast.removing { animation: toastSlideOut 0.3s ease forwards; }
      @keyframes toastSlideOut {
        to { transform: translateX(100%); opacity: 0; }
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 480px) {
        .social-fab { bottom: 16px; right: 16px; width: 52px; height: 52px; }
        .social-fab svg { width: 22px; height: 22px; }
        .social-slide-panel { max-width: 100%; }
        .sp-header { padding: 16px; }
        .sp-nameplate { margin: 0 12px 12px; padding: 14px; }
        .sp-nameplate-avatar { width: 44px; height: 44px; font-size: 1.1rem; }
        .sp-tabs { padding: 0 12px 10px; }
        .sp-tab { padding: 8px 4px; font-size: 0.75rem; }
        .sp-tab span:last-child { display: none; }
        .sp-content { padding: 0 12px 12px; }
        .sp-user-card { padding: 10px; }
        .sp-user-avatar { width: 38px; height: 38px; font-size: 0.85rem; }
        #sp-toasts { top: 12px; right: 12px; left: 12px; }
        .sp-toast { min-width: auto; width: 100%; padding: 14px; }
      }

      @media (max-width: 360px) {
        .sp-tabs { gap: 2px; }
        .sp-tab { padding: 6px 2px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ==================== HTML ====================

  injectHTML() {
    if (document.getElementById('social-system-v4')) return;

    const displayName = this.userProfile?.gamer_tag || this.userProfile?.display_name || 'Player';
    const initial = displayName[0].toUpperCase();
    const handle = this.generateHandle();

    const html = `
      <!-- Floating Action Button -->
      <button class="social-fab" id="social-fab" aria-label="Open Social Panel">
        ${this.icons.users}
        <span class="fab-badge" id="fab-badge">0</span>
      </button>
      
      <!-- Overlay -->
      <div class="social-overlay" id="social-overlay"></div>
      
      <!-- Slide Panel -->
      <div class="social-slide-panel" id="social-panel">
        <div class="sp-header">
          <h2 class="sp-header-title">Social</h2>
          <button class="sp-close" id="sp-close">${this.icons.x}</button>
        </div>
        
        <!-- Nameplate -->
        <div class="sp-nameplate">
          <div class="sp-nameplate-inner">
            <div class="sp-nameplate-avatar">${initial}</div>
            <div class="sp-nameplate-info">
              <div class="sp-nameplate-name">${this.escapeHtml(displayName)}</div>
              <div class="sp-nameplate-tag">
                <code class="sp-nameplate-code" id="my-handle">${this.escapeHtml(handle)}</code>
                <button class="sp-copy-btn" id="copy-handle" title="Copy Tag">${this.icons.copy}</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tabs -->
        <div class="sp-tabs">
          <button class="sp-tab active" data-tab="party">${this.icons.party}<span>Party</span></button>
          <button class="sp-tab" data-tab="friends">${this.icons.user}<span>Friends</span></button>
          <button class="sp-tab" data-tab="requests">${this.icons.inbox}<span>Requests</span><span class="sp-tab-badge" id="requests-badge" style="display:none;">0</span></button>
          <button class="sp-tab" data-tab="search">${this.icons.search}<span>Search</span></button>
        </div>
        
        <!-- Content -->
        <div class="sp-content">
          <!-- Party Tab -->
          <div class="sp-tab-panel active" id="panel-party">
            <div id="host-controls"></div>
            <div id="party-invites"></div>
            <div id="party-section"></div>
          </div>
          
          <!-- Friends Tab -->
          <div class="sp-tab-panel" id="panel-friends">
            <div id="game-invites"></div>
            <div id="friends-list"></div>
          </div>
          
          <!-- Requests Tab -->
          <div class="sp-tab-panel" id="panel-requests">
            <div id="incoming-requests"></div>
            <div id="sent-requests"></div>
          </div>
          
          <!-- Search Tab -->
          <div class="sp-tab-panel" id="panel-search">
            <div class="sp-search-wrapper">
              <span class="sp-search-icon">${this.icons.search}</span>
              <input type="text" class="sp-search-input" id="search-input" placeholder="Search username#1234...">
            </div>
            <div id="search-results"></div>
          </div>
        </div>
      </div>
      
      <!-- Toast Container -->
      <div id="sp-toasts"></div>
    `;
    
    const container = document.createElement('div');
    container.id = 'social-system-v4';
    container.innerHTML = html;
    document.body.appendChild(container);
  }

  // ==================== EVENT BINDING ====================

  bindEvents() {
    document.getElementById('social-fab')?.addEventListener('click', () => {
      this.toggle();
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    });
    document.getElementById('sp-close')?.addEventListener('click', () => this.close());
    document.getElementById('social-overlay')?.addEventListener('click', () => this.close());
    document.getElementById('copy-handle')?.addEventListener('click', () => this.copyHandle());
    
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.isOpen) this.close(); });
    
    document.querySelectorAll('.sp-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });
    
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.searchUsers(e.target.value), 350);
    });
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.sp-options')) {
        document.querySelectorAll('.sp-options-menu.open').forEach(m => m.classList.remove('open'));
      }
    });
  }

  toggle() { this.isOpen ? this.close() : this.open(); }
  
  open() {
    this.isOpen = true;
    document.getElementById('social-panel')?.classList.add('open');
    document.getElementById('social-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.stopTitleFlash();
  }
  
  close() {
    this.isOpen = false;
    document.getElementById('social-panel')?.classList.remove('open');
    document.getElementById('social-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }
  
  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.sp-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.sp-tab-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
  }

  // ==================== REALTIME SUBSCRIPTIONS ====================

  subscribeToRealtime() {
    // Game invites
    this.channels.invites = this.supabase.channel('game_invites_channel')
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

    // Friend requests
    this.channels.requests = this.supabase.channel('friend_requests_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friend_requests', filter: `to_user=eq.${this.currentUser.id}` }, async (payload) => {
        await this.loadRequests();
        this.updateNotificationBadge();
        const { data: sender } = await this.supabase.from('profiles').select('display_name, gamer_tag, discriminator').eq('id', payload.new.from_user).single();
        const name = sender?.gamer_tag || sender?.display_name || 'Someone';
        const tag = sender?.discriminator ? `#${sender.discriminator}` : '';
        this.showToast('friend', 'Friend Request', `${name}${tag} wants to be your friend`, [
          { label: 'Accept', style: 'primary', action: `acceptRequest:${payload.new.id}` },
          { label: 'Decline', action: `declineRequest:${payload.new.id}` }
        ]);
      }).subscribe();

    // Party invites
    this.channels.partyInvites = this.supabase.channel('party_invites_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'party_invites', filter: `to_user=eq.${this.currentUser.id}` }, async (payload) => {
        await this.loadPartyInvites();
        this.updateNotificationBadge();
        const { data: sender } = await this.supabase.from('profiles').select('display_name, gamer_tag').eq('id', payload.new.from_user).single();
        const name = sender?.gamer_tag || sender?.display_name || 'Someone';
        this.showToast('party', 'Party Invite', `${name} invited you to their party`, [
          { label: 'Join Party', style: 'primary', action: `acceptPartyInvite:${payload.new.id}` },
          { label: 'Decline', action: `declinePartyInvite:${payload.new.id}` }
        ]);
      }).subscribe();

    this.subscribeToParty();
  }

  subscribeToParty() {
    if (this.channels.party) this.channels.party.unsubscribe();
    if (!this.currentParty) return;

    this.channels.party = this.supabase.channel(`party_updates_${this.currentParty.party_id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parties', filter: `id=eq.${this.currentParty.party_id}` }, async (payload) => {
        if (payload.eventType === 'DELETE') {
          this.currentParty = null;
          this.partyMembers = [];
          this.renderParty();
          this.showToast('party', 'Party Disbanded', 'The party leader has disbanded the party');
          return;
        }
        
        const oldUrl = this.lastHostUrl;
        await this.loadParty();
        
        // AUTO-FOLLOW: Passive following - redirect non-hosts when host navigates
        if (this.currentParty && this.currentParty.leader_id !== this.currentUser.id && this.isFollowingHost) {
          const newUrl = this.currentParty.current_room;
          if (newUrl && newUrl !== oldUrl && newUrl !== window.location.pathname + window.location.search) {
            this.showToast('follow', 'Following Host', `Joining ${this.currentParty.current_game}...`, []);
            setTimeout(() => {
              window.location.href = newUrl;
            }, 1200);
          }
        }
        this.lastHostUrl = this.currentParty?.current_room || null;
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'party_members', filter: `party_id=eq.${this.currentParty.party_id}` }, () => {
        this.loadParty();
      })
      .subscribe();
  }

  // Track host navigation for auto-follow
  trackHostNavigation() {
    if (!this.isPartyLeader()) return;
    
    // Update party with current URL when host navigates
    const currentUrl = window.location.pathname + window.location.search;
    const gameName = this.getGameNameFromUrl();
    
    if (this.currentParty && gameName) {
      this.supabase.rpc('party_start_game', { 
        game_name: gameName, 
        room_code: currentUrl 
      }).catch(console.error);
    }
  }

  getGameNameFromUrl() {
    const path = window.location.pathname.toLowerCase();
    const gameMap = {
      'spyhunt': 'Spyhunt', 'spyfall': 'Spyhunt',
      'codenames': 'Codenames', 'werewolf': 'Werewolf',
      'imposter': 'Imposter', 'herd': 'Herd Mentality',
      'kiss-marry': 'Kiss Marry Kill', 'this-or-that': 'This or That',
      '21-questions': '21 Questions', 'questions': '21 Questions',
      'sketch': 'Sketch & Guess', 'draw': 'Sketch & Guess',
      'trivia': 'Trivia', 'quiz': 'Quiz'
    };
    for (const [key, name] of Object.entries(gameMap)) {
      if (path.includes(key)) return name;
    }
    return null;
  }

  // ==================== TOAST NOTIFICATIONS ====================

  showToast(type, title, message, actions = []) {
    const container = document.getElementById('sp-toasts');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `sp-toast ${type}`;
    
    const iconMap = { game: this.icons.gamepad, party: this.icons.party, friend: this.icons.userPlus, follow: this.icons.link };
    
    toast.innerHTML = `
      <div class="sp-toast-icon">${iconMap[type] || this.icons.bell}</div>
      <div class="sp-toast-content">
        <div class="sp-toast-title">${this.escapeHtml(title)}</div>
        <div class="sp-toast-message">${this.escapeHtml(message)}</div>
        ${actions.length ? `<div class="sp-toast-actions">${actions.map(a => 
          `<button class="sp-btn ${a.style === 'primary' ? 'sp-btn-primary' : 'sp-btn-secondary'}" data-action="${a.action}">${a.label}</button>`
        ).join('')}</div>` : ''}
      </div>
      <button class="sp-toast-close">${this.icons.x}</button>
    `;

    toast.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleToastAction(btn.dataset.action);
        this.removeToast(toast);
      });
    });
    toast.querySelector('.sp-toast-close').addEventListener('click', () => this.removeToast(toast));
    
    container.appendChild(toast);
    setTimeout(() => this.removeToast(toast), 12000);
  }

  removeToast(toast) {
    if (!toast?.parentNode) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }

  handleToastAction(action) {
    const [method, ...args] = action.split(':');
    const handlers = {
      acceptInvite: () => this.acceptInvite(args[0], args[1], args[2]),
      declineInvite: () => this.declineInvite(args[0]),
      acceptRequest: () => this.acceptRequest(args[0]),
      declineRequest: () => this.declineRequest(args[0]),
      acceptPartyInvite: () => this.acceptPartyInvite(args[0]),
      declinePartyInvite: () => this.declinePartyInvite(args[0]),
      joinPartyGame: () => this.joinPartyGame()
    };
    handlers[method]?.();
  }

  updateNotificationBadge() {
    const count = this.pendingRequests.length + this.gameInvites.length + this.partyInvites.length;
    const badge = document.getElementById('fab-badge');
    const reqBadge = document.getElementById('requests-badge');
    const fab = document.getElementById('social-fab');
    
    if (badge) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.classList.toggle('visible', count > 0);
    }
    if (reqBadge) {
      reqBadge.textContent = this.pendingRequests.length;
      reqBadge.style.display = this.pendingRequests.length > 0 ? 'flex' : 'none';
    }
    fab?.classList.toggle('has-notifications', count > 0);

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

  // ==================== DATA LOADING ====================

  async loadUserProfile() {
    try {
      const { data } = await this.supabase.from('profiles').select('id, display_name, gamer_tag, discriminator').eq('id', this.currentUser.id).single();
      this.userProfile = data || { display_name: 'Player', id: this.currentUser.id };
    } catch (e) { console.error('Error loading profile:', e); }
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
    } catch (e) { console.error('Error loading friends:', e); this.friends = []; this.renderFriends(); }
  }

  async loadRequests() {
    try {
      const [incoming, sent] = await Promise.all([
        this.supabase.from('friend_requests').select('id, from_user, created_at, profiles!friend_requests_from_user_fkey(display_name, gamer_tag, discriminator)').eq('to_user', this.currentUser.id).eq('status', 'pending'),
        this.supabase.from('friend_requests').select('id, to_user, created_at, profiles!friend_requests_to_user_fkey(display_name, gamer_tag, discriminator)').eq('from_user', this.currentUser.id).eq('status', 'pending')
      ]);
      this.pendingRequests = incoming.data || [];
      this.sentRequests = sent.data || [];
      this.renderRequests();
      this.updateNotificationBadge();
    } catch (e) { console.error('Error loading requests:', e); }
  }

  async loadInvites() {
    try {
      const { data } = await this.supabase.from('game_invites')
        .select('id, from_user, game_name, room_code, profiles!game_invites_from_user_fkey(display_name, gamer_tag)')
        .eq('to_user', this.currentUser.id).eq('status', 'pending').gt('expires_at', new Date().toISOString());
      this.gameInvites = data || [];
      this.renderInvites();
    } catch (e) { console.error('Error loading invites:', e); }
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
          status: data[0].status
        };
        this.partyMembers = data.map(m => ({
          id: m.member_id, name: m.member_gamer_tag || m.member_name,
          discriminator: m.member_discriminator, role: m.member_role, status: m.member_status
        }));
        this.lastHostUrl = this.currentParty.current_room;
        this.subscribeToParty();
      } else {
        this.currentParty = null;
        this.partyMembers = [];
      }
      this.renderParty();
      this.renderHostControls();
    } catch (e) { console.error('Error loading party:', e); }
  }

  async loadPartyInvites() {
    try {
      const { data } = await this.supabase.from('party_invites')
        .select('id, party_id, from_user, profiles!party_invites_from_user_fkey(display_name, gamer_tag)')
        .eq('to_user', this.currentUser.id).eq('status', 'pending').gt('expires_at', new Date().toISOString());
      this.partyInvites = data || [];
      this.renderPartyInvites();
    } catch (e) { console.error('Error loading party invites:', e); }
  }

  // ==================== RENDERING ====================

  renderHostControls() {
    const container = document.getElementById('host-controls');
    if (!container) return;
    
    if (!this.currentParty || !this.isPartyLeader()) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="sp-host-controls">
        <div class="sp-host-controls-icon">${this.icons.radio}</div>
        <div class="sp-host-controls-text">
          <div class="sp-host-controls-title">Party Active</div>
          <div class="sp-host-controls-desc">Members will follow you automatically</div>
        </div>
      </div>
    `;
  }

  renderFriends() {
    const container = document.getElementById('friends-list');
    if (!container) return;

    if (!this.friends.length) {
      container.innerHTML = `
        <div class="sp-empty">
          <div class="sp-empty-icon">${this.icons.users}</div>
          <p class="sp-empty-text">No friends yet.<br>Search for players to add them!</p>
        </div>`;
      return;
    }

    const online = this.friends.filter(f => f.status === 'online' || f.status === 'in_game');
    const offline = this.friends.filter(f => !f.status || f.status === 'offline');

    let html = '';
    if (online.length) {
      html += `<div class="sp-section-label">Online — ${online.length}</div>`;
      html += online.map(f => this.renderFriendCard(f)).join('');
    }
    if (offline.length) {
      html += `<div class="sp-section-label">Offline — ${offline.length}</div>`;
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
    const statusText = f.status === 'in_game' ? `Playing ${f.current_game || 'a game'}` : f.status === 'online' ? 'Online' : f.last_seen ? `Last seen ${this.timeAgo(new Date(f.last_seen))}` : 'Offline';
    
    const canInvite = (f.status === 'online' || f.status === 'in_game') && this.isInLobby();
    const canJoin = f.status === 'in_game' && f.current_room;
    const canPartyInvite = this.isPartyLeader() && (f.status === 'online' || f.status === 'in_game');

    let actions = '';
    if (canPartyInvite) actions += `<button class="sp-btn sp-btn-secondary sp-btn-icon party-invite-btn" data-id="${f.friend_id}" title="Invite to Party">${this.icons.party}</button>`;
    if (canJoin) actions += `<button class="sp-btn sp-btn-primary join-btn" data-id="${f.friend_id}" data-game="${f.current_game}" data-room="${f.current_room}">${this.icons.play} Join</button>`;
    else if (canInvite) actions += `<button class="sp-btn sp-btn-primary invite-btn" data-id="${f.friend_id}">Invite</button>`;

    return `
      <div class="sp-user-card" data-id="${f.friend_id}">
        <div class="sp-user-avatar ${statusClass}">${initial}<div class="sp-status-dot ${statusClass}"></div></div>
        <div class="sp-user-info">
          <div class="sp-user-name">${this.escapeHtml(name)}<span class="sp-discriminator">${tag}</span></div>
          <div class="sp-user-status ${f.status === 'in_game' ? 'playing' : ''}">${statusText}</div>
        </div>
        <div class="sp-user-actions">
          ${actions}
          <div class="sp-options">
            <button class="sp-btn sp-btn-ghost sp-btn-icon options-btn">${this.icons.moreVertical}</button>
            <div class="sp-options-menu">
              <button class="sp-options-item unfriend-btn" data-id="${f.friend_id}">${this.icons.userMinus} Unfriend</button>
              <button class="sp-options-item danger block-btn" data-id="${f.friend_id}">${this.icons.shield} Block</button>
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
        incoming.innerHTML = `<div class="sp-section-label">Incoming Requests</div>` + this.pendingRequests.map(r => {
          const p = r.profiles || {};
          const name = p.gamer_tag || p.display_name || 'Unknown';
          const tag = p.discriminator ? `#${p.discriminator}` : '';
          return `
            <div class="sp-user-card">
              <div class="sp-user-avatar online">${name[0].toUpperCase()}</div>
              <div class="sp-user-info">
                <div class="sp-user-name">${this.escapeHtml(name)}<span class="sp-discriminator">${tag}</span></div>
                <div class="sp-user-status">Wants to be friends</div>
              </div>
              <div class="sp-user-actions">
                <button class="sp-btn sp-btn-success sp-btn-icon accept-req-btn" data-id="${r.id}">${this.icons.check}</button>
                <button class="sp-btn sp-btn-secondary sp-btn-icon decline-req-btn" data-id="${r.id}">${this.icons.x}</button>
              </div>
            </div>`;
        }).join('');
      } else { 
        incoming.innerHTML = `
          <div class="sp-empty">
            <div class="sp-empty-icon">${this.icons.inbox}</div>
            <p class="sp-empty-text">No pending requests</p>
          </div>`; 
      }
    }
    
    if (sent) {
      if (this.sentRequests.length) {
        sent.innerHTML = `<div class="sp-section-label">Sent Requests</div>` + this.sentRequests.map(r => {
          const p = r.profiles || {};
          const name = p.gamer_tag || p.display_name || 'Unknown';
          const tag = p.discriminator ? `#${p.discriminator}` : '';
          return `
            <div class="sp-user-card">
              <div class="sp-user-avatar">${name[0].toUpperCase()}</div>
              <div class="sp-user-info">
                <div class="sp-user-name">${this.escapeHtml(name)}<span class="sp-discriminator">${tag}</span></div>
                <div class="sp-user-status">Pending...</div>
              </div>
              <div class="sp-user-actions">
                <button class="sp-btn sp-btn-secondary cancel-req-btn" data-id="${r.id}">Cancel</button>
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

    container.innerHTML = `<div class="sp-section-label">Game Invites</div>` + this.gameInvites.map(inv => {
      const name = inv.profiles?.gamer_tag || inv.profiles?.display_name || 'Someone';
      return `
        <div class="sp-invite-card game">
          <div class="sp-invite-icon">${this.icons.gamepad}</div>
          <div class="sp-invite-info">
            <div class="sp-invite-title">${this.escapeHtml(name)}</div>
            <div class="sp-invite-subtitle">Invited you to ${this.escapeHtml(inv.game_name)}</div>
          </div>
          <div class="sp-invite-actions">
            <button class="sp-btn sp-btn-primary join-inv-btn" data-id="${inv.id}" data-game="${inv.game_name}" data-room="${inv.room_code}">Join</button>
            <button class="sp-btn sp-btn-secondary sp-btn-icon ignore-inv-btn" data-id="${inv.id}">${this.icons.x}</button>
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
        <div class="sp-empty">
          <div class="sp-empty-icon">${this.icons.party}</div>
          <p class="sp-empty-text">No active party</p>
          <button class="sp-btn sp-btn-primary" id="create-party-btn">${this.icons.plus} Create Party</button>
        </div>`;
      document.getElementById('create-party-btn')?.addEventListener('click', () => this.createParty());
      return;
    }

    const isLeader = this.isPartyLeader();
    const inGame = this.currentParty.status === 'in_game' && this.currentParty.current_room;

    let gameBanner = '';
    if (inGame) {
      gameBanner = `
        <div class="sp-party-game">
          <div class="sp-party-game-info">
            <div class="sp-party-game-icon">${this.icons.gamepad}</div>
            <div>
              <div class="sp-party-game-label">Currently in</div>
              <div class="sp-party-game-name">${this.escapeHtml(this.currentParty.current_game)}</div>
            </div>
          </div>
          ${!isLeader ? `<button class="sp-btn sp-btn-success" id="join-party-game">${this.icons.play} Join</button>` : ''}
        </div>`;
    }

    const members = this.partyMembers.map(m => {
      const isMe = m.id === this.currentUser.id;
      const isMemberLeader = m.role === 'leader';
      const initial = (m.name || '?')[0].toUpperCase();
      let actions = '';
      if (isLeader && !isMe) {
        actions = `
          <button class="sp-btn sp-btn-ghost sp-btn-icon transfer-btn" data-id="${m.id}" title="Make Host">${this.icons.crown}</button>
          <button class="sp-btn sp-btn-ghost sp-btn-icon kick-btn" data-id="${m.id}" title="Kick">${this.icons.x}</button>`;
      }
      return `
        <div class="sp-party-member">
          <div class="sp-party-member-avatar ${isMemberLeader ? 'host' : ''}">${initial}${isMemberLeader ? `<span class="sp-crown-badge">${this.icons.crown}</span>` : ''}</div>
          <div class="sp-party-member-info">
            <div class="sp-party-member-name">
              ${this.escapeHtml(m.name)}
              ${isMemberLeader ? '<span class="sp-host-tag">Host</span>' : ''}
              ${isMe ? '<span class="sp-you-tag">(You)</span>' : ''}
            </div>
            <div class="sp-party-member-status">${m.status === 'online' ? 'Online' : m.status === 'in_game' ? 'In Game' : 'Offline'}</div>
          </div>
          <div class="sp-user-actions">${actions}</div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="sp-party-card">
        <div class="sp-party-header">
          <div class="sp-party-title">
            <div class="sp-party-icon">${this.icons.party}</div>
            <span>${this.escapeHtml(this.currentParty.party_name)}</span>
          </div>
          <span class="sp-party-badge ${isLeader ? 'hosting' : inGame ? 'active' : ''}">${isLeader ? 'Hosting' : inGame ? 'In Game' : 'Idle'}</span>
        </div>
        ${gameBanner}
        <div class="sp-party-members">${members}</div>
        <div class="sp-party-actions">
          <button class="sp-btn ${isLeader ? 'sp-btn-danger' : 'sp-btn-secondary'}" id="leave-party">${this.icons.logout} ${isLeader ? 'Disband' : 'Leave'}</button>
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

    container.innerHTML = `<div class="sp-section-label">Party Invites</div>` + this.partyInvites.map(inv => {
      const name = inv.profiles?.gamer_tag || inv.profiles?.display_name || 'Someone';
      return `
        <div class="sp-invite-card party">
          <div class="sp-invite-icon">${this.icons.party}</div>
          <div class="sp-invite-info">
            <div class="sp-invite-title">${this.escapeHtml(name)}</div>
            <div class="sp-invite-subtitle">Invited you to their party</div>
          </div>
          <div class="sp-invite-actions">
            <button class="sp-btn sp-btn-primary accept-party-btn" data-id="${inv.id}">Join</button>
            <button class="sp-btn sp-btn-secondary sp-btn-icon decline-party-btn" data-id="${inv.id}">${this.icons.x}</button>
          </div>
        </div>`;
    }).join('');

    container.querySelectorAll('.accept-party-btn').forEach(b => b.addEventListener('click', () => this.acceptPartyInvite(b.dataset.id)));
    container.querySelectorAll('.decline-party-btn').forEach(b => b.addEventListener('click', () => this.declinePartyInvite(b.dataset.id)));
  }

  // ==================== ACTION HANDLERS ====================

  bindFriendActions() {
    document.querySelectorAll('.options-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        document.querySelectorAll('.sp-options-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
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
        const { data: d } = await this.supabase.from('profiles').select('id, display_name, gamer_tag, discriminator')
          .or(`gamer_tag.ilike.${username},display_name.ilike.${username}`).eq('discriminator', disc).neq('id', this.currentUser.id).limit(10);
        data = d || [];
      } else {
        const { data: d } = await this.supabase.from('profiles').select('id, display_name, gamer_tag, discriminator')
          .or(`display_name.ilike.%${query}%,gamer_tag.ilike.%${query}%`).neq('id', this.currentUser.id).limit(10);
        data = d || [];
      }

      if (!data.length) { 
        container.innerHTML = `
          <div class="sp-empty">
            <div class="sp-empty-icon">${this.icons.search}</div>
            <p class="sp-empty-text">No users found</p>
          </div>`; 
        return; 
      }

      const friendIds = this.friends.map(f => f.friend_id);
      const sentIds = this.sentRequests.map(r => r.to_user);
      const receivedIds = this.pendingRequests.map(r => r.from_user);

      container.innerHTML = data.map(u => {
        const name = u.gamer_tag || u.display_name || 'Unknown';
        const tag = u.discriminator ? `#${u.discriminator}` : '';
        const isFriend = friendIds.includes(u.id);
        const hasSent = sentIds.includes(u.id);
        const hasReceived = receivedIds.includes(u.id);

        let action = '';
        if (isFriend) action = '<span style="color:var(--social-text-muted);font-size:0.8rem;">Friends</span>';
        else if (hasSent) action = '<span style="color:var(--social-text-muted);font-size:0.8rem;">Pending</span>';
        else if (hasReceived) action = `<button class="sp-btn sp-btn-success accept-search-btn" data-id="${u.id}">${this.icons.check} Accept</button>`;
        else action = `<button class="sp-btn sp-btn-primary add-btn" data-id="${u.id}">${this.icons.userPlus} Add</button>`;

        return `
          <div class="sp-user-card">
            <div class="sp-user-avatar">${name[0].toUpperCase()}</div>
            <div class="sp-user-info">
              <div class="sp-user-name">${this.escapeHtml(name)}<span class="sp-discriminator">${tag}</span></div>
            </div>
            <div class="sp-user-actions">${action}</div>
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
      console.error('Search error:', e); 
      container.innerHTML = `
        <div class="sp-empty">
          <p class="sp-empty-text">Search error. Try again.</p>
        </div>`; 
    }
  }

  // ==================== FRIEND ACTIONS ====================

  async sendFriendRequest(userId) {
    try {
      await this.supabase.from('friend_requests').insert({ from_user: this.currentUser.id, to_user: userId });
      await this.loadRequests();
      const input = document.getElementById('search-input');
      if (input?.value) this.searchUsers(input.value);
    } catch (e) { console.error('Error:', e); alert('Failed to send request'); }
  }

  async acceptRequest(id) {
    try {
      await this.supabase.rpc('accept_friend_request', { request_id: id });
      await this.loadFriends();
      await this.loadRequests();
    } catch (e) { console.error('Error:', e); }
  }

  async declineRequest(id) {
    try {
      await this.supabase.from('friend_requests').update({ status: 'declined' }).eq('id', id);
      await this.loadRequests();
    } catch (e) { console.error('Error:', e); }
  }

  async cancelRequest(id) {
    try {
      await this.supabase.from('friend_requests').delete().eq('id', id);
      await this.loadRequests();
    } catch (e) { console.error('Error:', e); }
  }

  async removeFriend(id) {
    if (!confirm('Remove this friend?')) return;
    try {
      await this.supabase.rpc('remove_friend', { friend_user_id: id });
      await this.loadFriends();
    } catch (e) { console.error('Error:', e); }
  }

  async blockUser(id) {
    if (!confirm('Block this user?')) return;
    try {
      await this.supabase.from('blocked_users').insert({ user_id: this.currentUser.id, blocked_user_id: id });
      await this.supabase.rpc('remove_friend', { friend_user_id: id });
      await this.loadFriends();
    } catch (e) { console.error('Error:', e); }
  }

  // ==================== GAME INVITES ====================

  async sendGameInvite(friendId) {
    const lobby = this.getLobbyInfo();
    if (!lobby) { alert('Join a game lobby first'); return; }
    try {
      await this.supabase.from('game_invites').insert({ from_user: this.currentUser.id, to_user: friendId, game_name: lobby.game, room_code: lobby.roomCode });
      const btn = document.querySelector(`.invite-btn[data-id="${friendId}"]`);
      if (btn) { btn.textContent = 'Sent!'; btn.disabled = true; setTimeout(() => { btn.textContent = 'Invite'; btn.disabled = false; }, 3000); }
    } catch (e) { console.error('Error:', e); }
  }

  async acceptInvite(id, game, room) {
    try {
      await this.supabase.from('game_invites').update({ status: 'accepted' }).eq('id', id);
      this.close();
      window.location.href = this.getGameLobbyUrl(game, room);
    } catch (e) { console.error('Error:', e); }
  }

  async declineInvite(id) {
    try {
      await this.supabase.from('game_invites').update({ status: 'declined' }).eq('id', id);
      await this.loadInvites();
    } catch (e) { console.error('Error:', e); }
  }

  joinFriendGame(game, room) {
    if (!room) return;
    window.location.href = this.getGameLobbyUrl(game, room);
  }

  // ==================== PARTY ====================

  isPartyLeader() { return this.currentParty?.leader_id === this.currentUser.id; }

  async createParty() {
    try {
      await this.supabase.rpc('create_party', { party_name: 'Party' });
      await this.loadParty();
      this.showToast('party', 'Party Created', 'Invite friends from the Friends tab');
    } catch (e) {
      console.error('Error:', e);
      if (e.message?.includes('Already')) alert('You are already in a party');
    }
  }

  async inviteToParty(userId) {
    try {
      await this.supabase.rpc('invite_to_party', { invitee_id: userId });
      this.showToast('party', 'Invite Sent', 'Party invite sent successfully');
    } catch (e) { console.error('Error:', e); alert(e.message || 'Could not invite'); }
  }

  async acceptPartyInvite(id) {
    try {
      await this.supabase.rpc('accept_party_invite', { invite_id: id });
      await this.loadParty();
      await this.loadPartyInvites();
      this.showToast('party', 'Joined Party', 'You will now follow the host automatically');
    } catch (e) { console.error('Error:', e); alert(e.message || 'Could not join'); }
  }

  async declinePartyInvite(id) {
    try {
      await this.supabase.from('party_invites').update({ status: 'declined' }).eq('id', id);
      await this.loadPartyInvites();
    } catch (e) { console.error('Error:', e); }
  }

  async leaveParty() {
    if (!confirm(this.isPartyLeader() ? 'Disband the party?' : 'Leave the party?')) return;
    try {
      await this.supabase.rpc('leave_party');
      this.currentParty = null;
      this.partyMembers = [];
      this.renderParty();
      this.renderHostControls();
    } catch (e) { console.error('Error:', e); }
  }

  async kickFromParty(userId) {
    if (!confirm('Kick this player?')) return;
    try {
      await this.supabase.rpc('kick_from_party', { kick_user_id: userId });
      await this.loadParty();
    } catch (e) { console.error('Error:', e); }
  }

  async transferLeadership(userId) {
    if (!confirm('Transfer host to this player?')) return;
    try {
      await this.supabase.rpc('transfer_party_leadership', { new_leader_id: userId });
      await this.loadParty();
    } catch (e) { console.error('Error:', e); }
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
    } catch (e) { console.error('Error updating presence:', e); }
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
      // If party leader, broadcast current location to party
      if (this.isPartyLeader() && this.currentParty) {
        this.supabase.rpc('party_start_game', { game_name: lobby.game, room_code: currentUrl }).catch(console.error);
      }
    } else {
      this.updatePresence('online');
      // If leader leaves a game, update party
      if (this.isPartyLeader() && this.currentParty?.current_room) {
        this.supabase.rpc('party_clear_game').catch(console.error);
      }
    }
  }

  // ==================== HELPERS ====================

  isInLobby() { 
    return window.location.pathname.includes('lobby') || 
           window.location.search.includes('room=') || 
           window.location.search.includes('join=') ||
           window.location.search.includes('code='); 
  }

  getLobbyInfo() {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room') || params.get('code') || params.get('join');
    if (!room) return null;
    return { game: this.getGameNameFromUrl() || 'Game', roomCode: room };
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

  escapeHtml(t) { 
    const d = document.createElement('div'); 
    d.textContent = t; 
    return d.innerHTML; 
  }

  copyHandle() {
    const handle = this.generateHandle();
    navigator.clipboard.writeText(handle).then(() => {
      const btn = document.getElementById('copy-handle');
      if (btn) { 
        btn.innerHTML = this.icons.check; 
        setTimeout(() => btn.innerHTML = this.icons.copy, 1500); 
      }
    });
  }
}

// ==================== INITIALIZATION ====================

function initSocialSystem() {
  if (typeof supabaseClient !== 'undefined') {
    window.socialSystem = new SocialSystem(supabaseClient);
  } else {
    setTimeout(initSocialSystem, 150);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSocialSystem);
} else {
  initSocialSystem();
}

window.SocialSystem = SocialSystem;
