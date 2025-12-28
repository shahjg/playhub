/* =============================================
   SOCIAL SYSTEM v2 - TheGaming.co
   Features: Friends, Invites, Join Game, Toast Notifications, Browser Alerts
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
    this.isOpen = false;
    this.activeTab = 'friends';
    this.invitesChannel = null;
    this.requestsChannel = null;
    this.notificationCount = 0;
    this.originalTitle = document.title;
    this.titleFlashInterval = null;
    
    this.init();
  }

  async init() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) return;
    
    this.currentUser = session.user;
    await this.loadUserProfile();
    this.injectHTML();
    this.injectNotificationContainer();
    this.bindEvents();
    await this.loadFriends();
    await this.loadRequests();
    await this.loadInvites();
    await this.updatePresence('online');
    this.startPresenceHeartbeat();
    this.subscribeToRealtime();
    this.updateNotificationDot();
    this.requestBrowserNotificationPermission();
  }

  // ==================== NOTIFICATIONS ====================

  injectNotificationContainer() {
    if (document.getElementById('toast-container')) return;
    
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.innerHTML = '';
    document.body.appendChild(container);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }
      .toast {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 16px 20px;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        pointer-events: auto;
        animation: slideIn 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .toast.invite { border-left: 4px solid #6c5ce7; }
      .toast.request { border-left: 4px solid #00cec9; }
      .toast-icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      .toast-content {
        flex: 1;
      }
      .toast-title {
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }
      .toast-message {
        color: rgba(255,255,255,0.7);
        font-size: 0.9rem;
      }
      .toast-actions {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }
      .toast-btn {
        padding: 6px 14px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.2s;
      }
      .toast-btn.primary {
        background: #6c5ce7;
        color: white;
      }
      .toast-btn.primary:hover { background: #5b4cdb; }
      .toast-btn.secondary {
        background: rgba(255,255,255,0.1);
        color: white;
      }
      .toast-btn.secondary:hover { background: rgba(255,255,255,0.2); }
      .toast-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: rgba(255,255,255,0.4);
        cursor: pointer;
        font-size: 18px;
        padding: 4px;
      }
      .toast-close:hover { color: white; }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      .toast.removing { animation: slideOut 0.3s ease-in forwards; }
    `;
    document.head.appendChild(style);
  }

  showToast(type, title, message, actions = []) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'invite' ? '🎮' : '👋';
    
    let actionsHTML = '';
    if (actions.length > 0) {
      actionsHTML = `<div class="toast-actions">
        ${actions.map(a => `<button class="toast-btn ${a.style || 'secondary'}" data-action="${a.action}">${a.label}</button>`).join('')}
      </div>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${this.escapeHtml(title)}</div>
        <div class="toast-message">${this.escapeHtml(message)}</div>
        ${actionsHTML}
      </div>
      <button class="toast-close">×</button>
    `;

    // Bind actions
    toast.querySelectorAll('.toast-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action) {
          const [method, ...args] = action.split(':');
          if (method === 'join') this.joinFriendGame(args[0], args[1], args[2]);
          else if (method === 'accept') this.acceptInvite(args[0], args[1], args[2]);
          else if (method === 'decline') this.declineInvite(args[0]);
          else if (method === 'acceptRequest') this.acceptRequest(args[0]);
          else if (method === 'declineRequest') this.declineRequest(args[0]);
          else if (method === 'openSidebar') this.open();
        }
        this.removeToast(toast);
      });
    });

    toast.querySelector('.toast-close').addEventListener('click', () => this.removeToast(toast));

    container.appendChild(toast);

    // Auto-remove after 10 seconds
    setTimeout(() => this.removeToast(toast), 10000);
  }

  removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }

  // Browser tab notifications
  updateBrowserNotification() {
    const count = this.pendingRequests.length + this.gameInvites.length;
    this.notificationCount = count;

    // Update title
    if (count > 0) {
      document.title = `(${count}) ${this.originalTitle}`;
      this.startTitleFlash();
    } else {
      document.title = this.originalTitle;
      this.stopTitleFlash();
    }

    // Update favicon with badge (optional)
    this.updateFavicon(count);
  }

  startTitleFlash() {
    if (this.titleFlashInterval) return;
    let showCount = true;
    this.titleFlashInterval = setInterval(() => {
      if (this.notificationCount > 0) {
        document.title = showCount ? `(${this.notificationCount}) ${this.originalTitle}` : `💬 ${this.originalTitle}`;
        showCount = !showCount;
      }
    }, 1500);
  }

  stopTitleFlash() {
    if (this.titleFlashInterval) {
      clearInterval(this.titleFlashInterval);
      this.titleFlashInterval = null;
    }
    document.title = this.originalTitle;
  }

  updateFavicon(count) {
    // Create or update favicon with notification badge
    const existingLink = document.querySelector("link[rel*='icon']");
    if (count === 0 && existingLink) return;

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Draw original favicon or default
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 32, 32);
      
      if (count > 0) {
        // Draw red badge
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(24, 8, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw count
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(count > 9 ? '9+' : count.toString(), 24, 8);
      }

      // Update favicon
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = canvas.toDataURL();
    };
    img.src = existingLink?.href || '/favicon.ico';
  }

  requestBrowserNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      // Will request on first interaction
    }
  }

  sendBrowserNotification(title, body, onClick) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
      notification.onclick = () => {
        window.focus();
        if (onClick) onClick();
        notification.close();
      };
    }
  }

  // ==================== REALTIME SUBSCRIPTIONS ====================

  subscribeToRealtime() {
    // Subscribe to game invites
    this.invitesChannel = this.supabase
      .channel('game_invites_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_invites',
        filter: `to_user=eq.${this.currentUser.id}`
      }, async (payload) => {
        await this.loadInvites();
        this.updateNotificationDot();
        this.updateBrowserNotification();
        
        // Get sender info
        const { data: sender } = await this.supabase
          .from('profiles')
          .select('display_name, gamer_tag')
          .eq('id', payload.new.from_user)
          .single();
        
        const senderName = sender?.gamer_tag || sender?.display_name || 'Someone';
        
        this.showToast('invite', 'Game Invite!', `${senderName} invited you to ${payload.new.game_name}`, [
          { label: 'Join', style: 'primary', action: `accept:${payload.new.id}:${payload.new.game_name}:${payload.new.room_code}` },
          { label: 'Ignore', style: 'secondary', action: `decline:${payload.new.id}` }
        ]);

        // Browser notification if tab not focused
        if (document.hidden) {
          this.sendBrowserNotification('Game Invite!', `${senderName} invited you to ${payload.new.game_name}`, () => this.open());
        }
      })
      .subscribe();

    // Subscribe to friend requests
    this.requestsChannel = this.supabase
      .channel('friend_requests_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'friend_requests',
        filter: `to_user=eq.${this.currentUser.id}`
      }, async (payload) => {
        await this.loadRequests();
        this.updateNotificationDot();
        this.updateBrowserNotification();
        
        // Get sender info
        const { data: sender } = await this.supabase
          .from('profiles')
          .select('display_name, gamer_tag, discriminator')
          .eq('id', payload.new.from_user)
          .single();
        
        const senderName = sender?.gamer_tag || sender?.display_name || 'Someone';
        const tag = sender?.discriminator ? `#${sender.discriminator}` : '';
        
        this.showToast('request', 'Friend Request', `${senderName}${tag} wants to be friends`, [
          { label: 'Accept', style: 'primary', action: `acceptRequest:${payload.new.id}` },
          { label: 'View', style: 'secondary', action: 'openSidebar' }
        ]);

        if (document.hidden) {
          this.sendBrowserNotification('Friend Request', `${senderName} wants to be friends`, () => this.open());
        }
      })
      .subscribe();
  }

  // ==================== JOIN FRIEND'S GAME ====================

  joinFriendGame(friendId, game, roomCode) {
    if (!roomCode) {
      alert('Could not get room code');
      return;
    }
    window.location.href = this.getGameLobbyUrl(game, roomCode);
  }

  // ==================== LOAD PROFILE ====================

  async loadUserProfile() {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id, display_name, gamer_tag, discriminator')
        .eq('id', this.currentUser.id)
        .single();
      if (error) throw error;
      this.userProfile = data;
    } catch (err) {
      console.error('Error loading user profile:', err);
      this.userProfile = { display_name: 'Player', id: this.currentUser.id };
    }
  }

  generateHandle() {
    if (this.userProfile?.gamer_tag && this.userProfile?.discriminator) return `${this.userProfile.gamer_tag}#${this.userProfile.discriminator}`;
    if (this.userProfile?.display_name && this.userProfile?.discriminator) return `${this.userProfile.display_name}#${this.userProfile.discriminator}`;
    return this.currentUser.id.substring(0, 8).toUpperCase();
  }

  // ==================== UI ====================

  injectHTML() {
    if (document.getElementById('social-sidebar')) return;

    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
      const friendsBtn = document.createElement('button');
      friendsBtn.className = 'friends-btn';
      friendsBtn.id = 'friends-btn';
      friendsBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
        <span class="notification-dot" id="social-notification-dot"></span>
      `;
      const navLoggedIn = headerActions.querySelector('.nav-right-logged-in');
      const navLoggedOut = headerActions.querySelector('.nav-right-logged-out');
      if (navLoggedIn) headerActions.insertBefore(friendsBtn, navLoggedIn);
      else if (navLoggedOut) headerActions.insertBefore(friendsBtn, navLoggedOut);
      else headerActions.appendChild(friendsBtn);
    }

    const displayName = this.userProfile?.gamer_tag || this.userProfile?.display_name || 'Player';
    const initial = displayName[0].toUpperCase();
    const handle = this.generateHandle();
    
    const sidebarHTML = `
      <div class="social-overlay" id="social-overlay"></div>
      <div class="social-sidebar" id="social-sidebar">
        <div class="social-header">
          <h2>FRIENDS</h2>
          <button class="social-close" id="social-close">✕</button>
        </div>
        <div class="social-profile-card">
          <div class="social-profile-info">
            <div class="social-profile-avatar">${initial}</div>
            <div class="social-profile-name">${this.escapeHtml(displayName)}</div>
          </div>
          <div class="social-profile-handle">
            <span>Add me:</span>
            <code id="my-handle">${this.escapeHtml(handle)}</code>
            <button onclick="window.socialSystem.copyHandle()" title="Copy">📋</button>
          </div>
        </div>
        <div class="social-tabs">
          <button class="social-tab active" data-tab="friends">Friends</button>
          <button class="social-tab" data-tab="requests">Requests<span class="badge" id="requests-badge" style="display: none;">0</span></button>
          <button class="social-tab" data-tab="search">Search</button>
        </div>
        <div class="social-content">
          <div class="social-panel active" id="panel-friends">
            <div id="invites-container"></div>
            <div id="friends-list"><div class="loading-friends"><div class="skeleton"></div><div class="skeleton"></div></div></div>
          </div>
          <div class="social-panel" id="panel-requests"><div id="incoming-requests"></div><div id="sent-requests"></div></div>
          <div class="social-panel" id="panel-search">
            <div class="search-wrapper"><input type="text" class="search-input" id="user-search-input" placeholder="Username#1234 or name..."></div>
            <div class="search-results" id="search-results"></div>
            <p class="search-hint">Search by name or paste a friend's tag</p>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
  }

  bindEvents() {
    document.getElementById('friends-btn')?.addEventListener('click', () => {
      this.toggle();
      // Request notification permission on first interaction
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    });
    document.getElementById('social-close')?.addEventListener('click', () => this.close());
    document.getElementById('social-overlay')?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.isOpen) this.close(); });
    document.querySelectorAll('.social-tab').forEach(tab => tab.addEventListener('click', () => this.switchTab(tab.dataset.tab)));
    
    const searchInput = document.getElementById('user-search-input');
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.searchUsers(e.target.value), 300);
    });
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.friend-options')) {
        document.querySelectorAll('.friend-options-menu.open').forEach(menu => menu.classList.remove('open'));
      }
    });

    // Clear notifications when sidebar opens
    document.getElementById('friends-btn')?.addEventListener('click', () => {
      this.stopTitleFlash();
    });
  }

  toggle() { this.isOpen ? this.close() : this.open(); }
  open() {
    this.isOpen = true;
    document.getElementById('social-sidebar')?.classList.add('open');
    document.getElementById('social-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.stopTitleFlash();
  }
  close() {
    this.isOpen = false;
    document.getElementById('social-sidebar')?.classList.remove('open');
    document.getElementById('social-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }
  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.social-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.social-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
  }

  // ==================== DATA LOADING ====================

  async loadFriends() {
    try {
      const { data, error } = await this.supabase.rpc('get_friends_with_presence');
      if (error) throw error;
      this.friends = data || [];
      this.renderFriends();
    } catch (err) {
      console.error('Error loading friends:', err);
      this.friends = [];
      this.renderFriends();
    }
  }

  async loadRequests() {
    try {
      const { data: incoming, error: inErr } = await this.supabase
        .from('friend_requests')
        .select('id, from_user, created_at, profiles!friend_requests_from_user_fkey(display_name, gamer_tag, discriminator)')
        .eq('to_user', this.currentUser.id)
        .eq('status', 'pending');
      if (inErr) throw inErr;
      
      const { data: sent, error: sentErr } = await this.supabase
        .from('friend_requests')
        .select('id, to_user, created_at, profiles!friend_requests_to_user_fkey(display_name, gamer_tag, discriminator)')
        .eq('from_user', this.currentUser.id)
        .eq('status', 'pending');
      if (sentErr) throw sentErr;
      
      this.pendingRequests = incoming || [];
      this.sentRequests = sent || [];
      this.renderRequests();
      this.updateNotificationDot();
      this.updateBrowserNotification();
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  }

  async loadInvites() {
    try {
      const { data, error } = await this.supabase
        .from('game_invites')
        .select('id, from_user, game_name, room_code, created_at, expires_at, profiles!game_invites_from_user_fkey(display_name, gamer_tag)')
        .eq('to_user', this.currentUser.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());
      if (error) throw error;
      this.gameInvites = data || [];
      this.renderInvites();
      this.updateBrowserNotification();
    } catch (err) {
      console.error('Error loading invites:', err);
    }
  }

  getDisplayName(profile) { return profile?.gamer_tag || profile?.display_name || 'Unknown'; }

  // ==================== RENDERING ====================

  renderFriends() {
    const container = document.getElementById('friends-list');
    if (!container) return;
    if (this.friends.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><p class="empty-state-text">No friends yet.<br>Search for players to add them!</p></div>';
      return;
    }
    const online = this.friends.filter(f => f.status === 'online' || f.status === 'in_game');
    const offline = this.friends.filter(f => f.status === 'offline' || !f.status);
    let html = '';
    if (online.length > 0) { html += `<div class="section-label">ONLINE — ${online.length}</div>` + online.map(f => this.renderFriendItem(f)).join(''); }
    if (offline.length > 0) { html += `<div class="section-label" style="margin-top: 20px;">OFFLINE — ${offline.length}</div>` + offline.map(f => this.renderFriendItem(f)).join(''); }
    container.innerHTML = html;
    this.bindFriendActions();
  }

  renderFriendItem(friend) {
    const displayName = friend.gamer_tag || friend.display_name || '?';
    const initial = displayName[0].toUpperCase();
    const statusClass = friend.status || 'offline';
    const tagDisplay = friend.discriminator ? `#${friend.discriminator}` : '';
    let statusText = 'Offline';
    if (friend.status === 'online') statusText = 'Online';
    if (friend.status === 'in_game') statusText = `Playing ${friend.current_game || 'a game'}`;
    const lastSeen = friend.last_seen ? this.timeAgo(new Date(friend.last_seen)) : '';
    if (statusClass === 'offline' && lastSeen) statusText = `Last seen ${lastSeen}`;

    // Show Invite button if we're in a lobby, Join button if they're in a game
    const canInvite = (friend.status === 'online' || friend.status === 'in_game') && this.isInLobby();
    const canJoin = friend.status === 'in_game' && friend.current_room;

    let actionButtons = '';
    if (canJoin) {
      actionButtons = `<button class="action-btn primary join-btn" data-friend-id="${friend.friend_id}" data-game="${friend.current_game || 'Unknown'}" data-room="${friend.current_room}">Join</button>`;
    } else if (canInvite) {
      actionButtons = `<button class="action-btn primary invite-btn" data-friend-id="${friend.friend_id}">Invite</button>`;
    }

    return `
      <div class="friend-item" data-friend-id="${friend.friend_id}">
        <div class="friend-avatar">${initial}<div class="status-dot ${statusClass}"></div></div>
        <div class="friend-info">
          <div class="friend-name">${this.escapeHtml(displayName)}<span class="friend-tag">${tagDisplay}</span></div>
          <div class="friend-status ${friend.status === 'in_game' ? 'in-game' : ''}">${statusText}</div>
        </div>
        <div class="friend-actions">
          ${actionButtons}
          <div class="friend-options">
            <button class="action-btn icon-only options-btn" data-friend-id="${friend.friend_id}">⋮</button>
            <div class="friend-options-menu">
              <button class="friend-options-item unfriend-btn" data-friend-id="${friend.friend_id}">Unfriend</button>
              <button class="friend-options-item danger block-btn" data-friend-id="${friend.friend_id}">Block</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  renderRequests() {
    const incomingContainer = document.getElementById('incoming-requests');
    if (incomingContainer) {
      if (this.pendingRequests.length > 0) {
        incomingContainer.innerHTML = `<div class="section-label">INCOMING REQUESTS</div>` +
          this.pendingRequests.map(req => {
            const name = this.getDisplayName(req.profiles);
            const tag = req.profiles?.discriminator ? `#${req.profiles.discriminator}` : '';
            return `<div class="friend-item" data-request-id="${req.id}">
              <div class="friend-avatar">${name[0].toUpperCase()}<div class="status-dot online"></div></div>
              <div class="friend-info"><div class="friend-name">${this.escapeHtml(name)}<span class="friend-tag">${tag}</span></div><div class="friend-status">Wants to be friends</div></div>
              <div class="friend-actions"><button class="action-btn accept accept-request-btn" data-request-id="${req.id}">✓</button><button class="action-btn decline decline-request-btn" data-request-id="${req.id}">✕</button></div>
            </div>`;
          }).join('');
      } else { incomingContainer.innerHTML = ''; }
    }
    const sentContainer = document.getElementById('sent-requests');
    if (sentContainer) {
      if (this.sentRequests.length > 0) {
        sentContainer.innerHTML = `<div class="section-label" style="margin-top: 20px;">SENT REQUESTS</div>` +
          this.sentRequests.map(req => {
            const name = this.getDisplayName(req.profiles);
            const tag = req.profiles?.discriminator ? `#${req.profiles.discriminator}` : '';
            return `<div class="friend-item">
              <div class="friend-avatar">${name[0].toUpperCase()}</div>
              <div class="friend-info"><div class="friend-name">${this.escapeHtml(name)}<span class="friend-tag">${tag}</span></div><div class="friend-status">Pending...</div></div>
              <div class="friend-actions"><button class="action-btn secondary cancel-request-btn" data-request-id="${req.id}">Cancel</button></div>
            </div>`;
          }).join('');
      } else { sentContainer.innerHTML = ''; }
    }
    const badge = document.getElementById('requests-badge');
    if (badge) {
      if (this.pendingRequests.length > 0) { badge.textContent = this.pendingRequests.length; badge.style.display = 'inline-flex'; }
      else { badge.style.display = 'none'; }
    }
    this.bindRequestActions();
  }

  renderInvites() {
    const container = document.getElementById('invites-container');
    if (!container) return;
    if (this.gameInvites.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = `<div class="invites-section"><h3>🎮 GAME INVITES</h3>` +
      this.gameInvites.map(inv => {
        const name = inv.profiles?.gamer_tag || inv.profiles?.display_name || 'Someone';
        return `<div class="invite-item" data-invite-id="${inv.id}">
          <div class="invite-info"><div class="invite-from">${this.escapeHtml(name)}</div><div class="invite-game">invited you to ${this.escapeHtml(inv.game_name)}</div></div>
          <div class="friend-actions"><button class="action-btn primary join-invite-btn" data-invite-id="${inv.id}" data-room="${inv.room_code}" data-game="${inv.game_name}">Join</button><button class="action-btn secondary ignore-invite-btn" data-invite-id="${inv.id}">✕</button></div>
        </div>`;
      }).join('') + '</div>';
    this.bindInviteActions();
  }

  // ==================== ACTIONS ====================

  bindFriendActions() {
    document.querySelectorAll('.options-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        document.querySelectorAll('.friend-options-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
        menu.classList.toggle('open');
      });
    });
    document.querySelectorAll('.invite-btn').forEach(btn => btn.addEventListener('click', () => this.sendInvite(btn.dataset.friendId)));
    document.querySelectorAll('.join-btn').forEach(btn => btn.addEventListener('click', () => this.joinFriendGame(btn.dataset.friendId, btn.dataset.game, btn.dataset.room)));
    document.querySelectorAll('.unfriend-btn').forEach(btn => btn.addEventListener('click', () => this.removeFriend(btn.dataset.friendId)));
    document.querySelectorAll('.block-btn').forEach(btn => btn.addEventListener('click', () => this.blockUser(btn.dataset.friendId)));
  }

  bindRequestActions() {
    document.querySelectorAll('.accept-request-btn').forEach(btn => btn.addEventListener('click', () => this.acceptRequest(btn.dataset.requestId)));
    document.querySelectorAll('.decline-request-btn').forEach(btn => btn.addEventListener('click', () => this.declineRequest(btn.dataset.requestId)));
    document.querySelectorAll('.cancel-request-btn').forEach(btn => btn.addEventListener('click', () => this.cancelRequest(btn.dataset.requestId)));
  }

  bindInviteActions() {
    document.querySelectorAll('.join-invite-btn').forEach(btn => btn.addEventListener('click', () => this.acceptInvite(btn.dataset.inviteId, btn.dataset.game, btn.dataset.room)));
    document.querySelectorAll('.ignore-invite-btn').forEach(btn => btn.addEventListener('click', () => this.declineInvite(btn.dataset.inviteId)));
  }

  async searchUsers(query) {
    const container = document.getElementById('search-results');
    if (!container) return;
    if (!query || query.length < 2) { container.innerHTML = ''; return; }

    try {
      let data = [], error = null;
      const tagMatch = query.match(/^(.+)#(\d{4})$/);
      
      if (tagMatch) {
        const [, username, discriminator] = tagMatch;
        const result = await this.supabase.from('profiles').select('id, display_name, gamer_tag, discriminator')
          .or(`gamer_tag.ilike.${username},display_name.ilike.${username}`).eq('discriminator', discriminator).neq('id', this.currentUser.id).limit(10);
        data = result.data; error = result.error;
      } else {
        const result = await this.supabase.from('profiles').select('id, display_name, gamer_tag, discriminator')
          .or(`display_name.ilike.%${query}%,gamer_tag.ilike.%${query}%`).neq('id', this.currentUser.id).limit(10);
        data = result.data; error = result.error;
      }
      if (error) throw error;
      if (!data || data.length === 0) { container.innerHTML = '<div class="empty-state"><p class="empty-state-text">No users found</p></div>'; return; }

      const friendIds = this.friends.map(f => f.friend_id);
      const sentIds = this.sentRequests.map(r => r.to_user);
      const receivedIds = this.pendingRequests.map(r => r.from_user);

      container.innerHTML = data.map(user => {
        const isFriend = friendIds.includes(user.id);
        const hasSentRequest = sentIds.includes(user.id);
        const hasReceivedRequest = receivedIds.includes(user.id);
        const displayName = user.gamer_tag || user.display_name || 'Unknown';
        const tagDisplay = user.discriminator ? `#${user.discriminator}` : '';
        let actionBtn = '';
        if (isFriend) actionBtn = '<span style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Friends ✓</span>';
        else if (hasSentRequest) actionBtn = '<span style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Pending...</span>';
        else if (hasReceivedRequest) actionBtn = `<button class="action-btn accept accept-from-search-btn" data-user-id="${user.id}">Accept</button>`;
        else actionBtn = `<button class="action-btn primary add-friend-btn" data-user-id="${user.id}">Add</button>`;
        return `<div class="search-result-item"><div class="friend-avatar">${displayName[0].toUpperCase()}</div><div class="friend-info"><div class="friend-name">${this.escapeHtml(displayName)}<span class="friend-tag">${tagDisplay}</span></div></div><div class="friend-actions">${actionBtn}</div></div>`;
      }).join('');

      document.querySelectorAll('.add-friend-btn').forEach(btn => btn.addEventListener('click', () => this.sendFriendRequest(btn.dataset.userId)));
      document.querySelectorAll('.accept-from-search-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const request = this.pendingRequests.find(r => r.from_user === btn.dataset.userId);
          if (request) this.acceptRequest(request.id);
        });
      });
    } catch (err) {
      console.error('Search error:', err);
      container.innerHTML = '<div class="empty-state"><p class="empty-state-text">Error searching. Try again.</p></div>';
    }
  }

  async sendFriendRequest(userId) {
    try {
      const { error } = await this.supabase.from('friend_requests').insert({ from_user: this.currentUser.id, to_user: userId });
      if (error) throw error;
      await this.loadRequests();
      const searchInput = document.getElementById('user-search-input');
      if (searchInput?.value) this.searchUsers(searchInput.value);
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Could not send friend request');
    }
  }

  async acceptRequest(requestId) {
    try {
      const { error } = await this.supabase.rpc('accept_friend_request', { request_id: requestId });
      if (error) throw error;
      await this.loadFriends();
      await this.loadRequests();
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('Could not accept request');
    }
  }

  async declineRequest(requestId) {
    try {
      const { error } = await this.supabase.from('friend_requests').update({ status: 'declined' }).eq('id', requestId);
      if (error) throw error;
      await this.loadRequests();
    } catch (err) { console.error('Error declining request:', err); }
  }

  async cancelRequest(requestId) {
    try {
      const { error } = await this.supabase.from('friend_requests').delete().eq('id', requestId);
      if (error) throw error;
      await this.loadRequests();
    } catch (err) { console.error('Error canceling request:', err); }
  }

  async removeFriend(friendId) {
    if (!confirm('Remove this friend?')) return;
    try {
      const { error } = await this.supabase.rpc('remove_friend', { friend_user_id: friendId });
      if (error) throw error;
      await this.loadFriends();
    } catch (err) { console.error('Error removing friend:', err); alert('Could not remove friend'); }
  }

  async blockUser(userId) {
    if (!confirm('Block this user?')) return;
    try {
      const { error: blockErr } = await this.supabase.from('blocked_users').insert({ user_id: this.currentUser.id, blocked_user_id: userId });
      if (blockErr) throw blockErr;
      await this.supabase.rpc('remove_friend', { friend_user_id: userId });
      await this.loadFriends();
    } catch (err) { console.error('Error blocking user:', err); alert('Could not block user'); }
  }

  async sendInvite(friendId) {
    const lobbyInfo = this.getLobbyInfo();
    if (!lobbyInfo) { alert('You must be in a game lobby to invite friends'); return; }
    try {
      const { error } = await this.supabase.from('game_invites').insert({ from_user: this.currentUser.id, to_user: friendId, game_name: lobbyInfo.game, room_code: lobbyInfo.roomCode });
      if (error) throw error;
      const btn = document.querySelector(`.invite-btn[data-friend-id="${friendId}"]`);
      if (btn) { btn.textContent = 'Sent!'; btn.disabled = true; setTimeout(() => { btn.textContent = 'Invite'; btn.disabled = false; }, 3000); }
    } catch (err) { console.error('Error sending invite:', err); alert('Could not send invite'); }
  }

  async acceptInvite(inviteId, game, roomCode) {
    try {
      await this.supabase.from('game_invites').update({ status: 'accepted' }).eq('id', inviteId);
      this.close();
      window.location.href = this.getGameLobbyUrl(game, roomCode);
    } catch (err) { console.error('Error accepting invite:', err); }
  }

  async declineInvite(inviteId) {
    try {
      await this.supabase.from('game_invites').update({ status: 'declined' }).eq('id', inviteId);
      await this.loadInvites();
    } catch (err) { console.error('Error declining invite:', err); }
  }

  // ==================== PRESENCE ====================

  async updatePresence(status, game = null, room = null) {
    try {
      await this.supabase.from('user_presence').upsert({ user_id: this.currentUser.id, status, current_game: game, current_room: room, last_seen: new Date().toISOString() });
    } catch (err) { console.error('Error updating presence:', err); }
  }

  startPresenceHeartbeat() {
    setInterval(() => {
      if (this.currentUser) {
        const lobbyInfo = this.getLobbyInfo();
        if (lobbyInfo) this.updatePresence('in_game', lobbyInfo.game, lobbyInfo.roomCode);
        else this.updatePresence('online');
      }
    }, 60000);
    window.addEventListener('beforeunload', () => {
      if (this.currentUser) {
        const data = JSON.stringify({ user_id: this.currentUser.id, status: 'offline', last_seen: new Date().toISOString() });
        navigator.sendBeacon?.(`${this.supabase.supabaseUrl}/rest/v1/user_presence?user_id=eq.${this.currentUser.id}`, data);
      }
    });
  }

  // ==================== HELPERS ====================

  isInLobby() { return window.location.pathname.includes('lobby') || window.location.search.includes('room=') || document.querySelector('[data-room-code]') !== null; }

  getLobbyInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room') || urlParams.get('code') || document.querySelector('[data-room-code]')?.dataset.roomCode;
    if (!roomCode) return null;
    const path = window.location.pathname;
    let game = 'Unknown';
    if (path.includes('spyhunt') || path.includes('spyfall')) game = 'Spyhunt';
    else if (path.includes('codenames')) game = 'Codenames';
    else if (path.includes('werewolf')) game = 'Werewolf';
    else if (path.includes('imposter')) game = 'Imposter';
    else if (path.includes('herd')) game = 'Herd Mentality';
    else if (path.includes('kiss-marry')) game = 'Kiss Marry Kill';
    else if (path.includes('this-or-that')) game = 'This or That';
    else if (path.includes('21-questions') || path.includes('questions')) game = '21 Questions';
    else if (path.includes('sketch') || path.includes('draw')) game = 'Sketch & Guess';
    const pageTitle = document.querySelector('h1')?.textContent || document.title;
    if (game === 'Unknown' && pageTitle) game = pageTitle.split('–')[0].split('-')[0].trim();
    return { game, roomCode };
  }

  getGameLobbyUrl(game, roomCode) {
    const gameUrls = { 'Spyhunt': '/spyhunt/lobby.html', 'Spyfall': '/spyhunt/lobby.html', 'Codenames': '/codenames/lobby.html', 'Werewolf': '/werewolf/lobby.html', 'Imposter': '/imposter/lobby.html', 'Herd Mentality': '/herd-mentality/lobby.html', 'Kiss Marry Kill': '/kiss-marry-kill/lobby.html', 'This or That': '/this-or-that/lobby.html', '21 Questions': '/21-questions/lobby.html', 'Sketch & Guess': '/sketch/lobby.html' };
    return `${gameUrls[game] || '/lobby.html'}?join=${roomCode}`;
  }

  updateNotificationDot() {
    const dot = document.getElementById('social-notification-dot');
    if (dot) dot.classList.toggle('visible', this.pendingRequests.length > 0 || this.gameInvites.length > 0);
  }

  timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

  copyHandle() {
    const handle = this.generateHandle();
    navigator.clipboard.writeText(handle).then(() => {
      const btn = document.querySelector('.social-profile-handle button');
      if (btn) { const original = btn.textContent; btn.textContent = '✓'; setTimeout(() => { btn.textContent = original; }, 1500); }
    }).catch(() => {
      const input = document.createElement('input'); input.value = handle; document.body.appendChild(input); input.select(); document.execCommand('copy'); document.body.removeChild(input);
    });
  }
}

function initSocialSystem() {
  if (typeof supabase !== 'undefined' && typeof supabaseClient !== 'undefined') window.socialSystem = new SocialSystem(supabaseClient);
  else setTimeout(initSocialSystem, 100);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSocialSystem);
else initSocialSystem();

window.SocialSystem = SocialSystem;
