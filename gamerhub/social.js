/* =============================================
   SOCIAL SYSTEM - TheGaming.co
   Include this on every page after Supabase
   ============================================= */

class SocialSystem {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentUser = null;
    this.friends = [];
    this.pendingRequests = [];
    this.sentRequests = [];
    this.gameInvites = [];
    this.isOpen = false;
    this.activeTab = 'friends';
    this.presenceChannel = null;
    this.invitesChannel = null;
    
    this.init();
  }

  async init() {
    // Check if user is logged in
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) return;
    
    this.currentUser = session.user;
    
    // Inject HTML
    this.injectHTML();
    
    // Bind events
    this.bindEvents();
    
    // Load initial data
    await this.loadFriends();
    await this.loadRequests();
    await this.loadInvites();
    
    // Update presence
    await this.updatePresence('online');
    
    // Start presence heartbeat
    this.startPresenceHeartbeat();
    
    // Subscribe to real-time updates
    this.subscribeToInvites();
    
    // Update notification dot
    this.updateNotificationDot();
  }

  injectHTML() {
    // Check if already injected
    if (document.getElementById('social-sidebar')) return;

    // Add friends button to header
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
      
      // Insert before user pill
      const userPill = headerActions.querySelector('.user-menu-wrapper') || headerActions.querySelector('.user-pill');
      if (userPill) {
        headerActions.insertBefore(friendsBtn, userPill);
      } else {
        headerActions.appendChild(friendsBtn);
      }
    }

    // Add overlay and sidebar
    const sidebarHTML = `
      <div class="social-overlay" id="social-overlay"></div>
      <div class="social-sidebar" id="social-sidebar">
        <div class="social-header">
          <h2>FRIENDS</h2>
          <button class="social-close" id="social-close">✕</button>
        </div>
        
        <div class="social-tabs">
          <button class="social-tab active" data-tab="friends">Friends</button>
          <button class="social-tab" data-tab="requests">
            Requests
            <span class="badge" id="requests-badge" style="display: none;">0</span>
          </button>
          <button class="social-tab" data-tab="search">Search</button>
        </div>
        
        <div class="social-content">
          <!-- Friends Panel -->
          <div class="social-panel active" id="panel-friends">
            <div id="invites-container"></div>
            <div id="friends-list">
              <div class="loading-friends">
                <div class="skeleton"></div>
                <div class="skeleton"></div>
                <div class="skeleton"></div>
              </div>
            </div>
          </div>
          
          <!-- Requests Panel -->
          <div class="social-panel" id="panel-requests">
            <div id="incoming-requests"></div>
            <div id="sent-requests"></div>
          </div>
          
          <!-- Search Panel -->
          <div class="social-panel" id="panel-search">
            <div class="search-wrapper">
              <input type="text" class="search-input" id="user-search-input" placeholder="Search by display name...">
            </div>
            <div class="search-results" id="search-results"></div>
            <p class="search-hint">Enter a display name to find players</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
  }

  bindEvents() {
    // Open/close sidebar
    document.getElementById('friends-btn')?.addEventListener('click', () => this.toggle());
    document.getElementById('social-close')?.addEventListener('click', () => this.close());
    document.getElementById('social-overlay')?.addEventListener('click', () => this.close());
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
    
    // Tab switching
    document.querySelectorAll('.social-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });
    
    // Search input
    const searchInput = document.getElementById('user-search-input');
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.searchUsers(e.target.value), 300);
    });
    
    // Close options menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.friend-options')) {
        document.querySelectorAll('.friend-options-menu.open').forEach(menu => {
          menu.classList.remove('open');
        });
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    document.getElementById('social-sidebar')?.classList.add('open');
    document.getElementById('social-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    document.getElementById('social-sidebar')?.classList.remove('open');
    document.getElementById('social-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  switchTab(tab) {
    this.activeTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.social-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    
    // Update panels
    document.querySelectorAll('.social-panel').forEach(p => {
      p.classList.toggle('active', p.id === `panel-${tab}`);
    });
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
      // Load incoming requests
      const { data: incoming, error: inErr } = await this.supabase
        .from('friend_requests')
        .select(`
          id,
          from_user,
          created_at,
          profiles!friend_requests_from_user_fkey(display_name)
        `)
        .eq('to_user', this.currentUser.id)
        .eq('status', 'pending');
      
      if (inErr) throw inErr;
      
      // Load sent requests
      const { data: sent, error: sentErr } = await this.supabase
        .from('friend_requests')
        .select(`
          id,
          to_user,
          created_at,
          profiles!friend_requests_to_user_fkey(display_name)
        `)
        .eq('from_user', this.currentUser.id)
        .eq('status', 'pending');
      
      if (sentErr) throw sentErr;
      
      this.pendingRequests = incoming || [];
      this.sentRequests = sent || [];
      
      this.renderRequests();
      this.updateNotificationDot();
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  }

  async loadInvites() {
    try {
      const { data, error } = await this.supabase
        .from('game_invites')
        .select(`
          id,
          from_user,
          game_name,
          room_code,
          created_at,
          expires_at,
          profiles!game_invites_from_user_fkey(display_name)
        `)
        .eq('to_user', this.currentUser.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());
      
      if (error) throw error;
      
      this.gameInvites = data || [];
      this.renderInvites();
    } catch (err) {
      console.error('Error loading invites:', err);
    }
  }

  // ==================== RENDERING ====================

  renderFriends() {
    const container = document.getElementById('friends-list');
    if (!container) return;

    if (this.friends.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">👥</div>
          <p class="empty-state-text">No friends yet.<br>Search for players to add them!</p>
        </div>
      `;
      return;
    }

    const online = this.friends.filter(f => f.status === 'online' || f.status === 'in_game');
    const offline = this.friends.filter(f => f.status === 'offline' || !f.status);

    let html = '';

    if (online.length > 0) {
      html += `<div class="section-label">ONLINE — ${online.length}</div>`;
      html += online.map(f => this.renderFriendItem(f)).join('');
    }

    if (offline.length > 0) {
      html += `<div class="section-label" style="margin-top: 20px;">OFFLINE — ${offline.length}</div>`;
      html += offline.map(f => this.renderFriendItem(f)).join('');
    }

    container.innerHTML = html;
    
    // Bind friend action events
    this.bindFriendActions();
  }

  renderFriendItem(friend) {
    const initial = (friend.display_name || '?')[0].toUpperCase();
    const statusClass = friend.status || 'offline';
    
    let statusText = 'Offline';
    if (friend.status === 'online') statusText = 'Online';
    if (friend.status === 'in_game') statusText = `In Game: ${friend.current_game || 'Unknown'}`;
    
    const lastSeen = friend.last_seen ? this.timeAgo(new Date(friend.last_seen)) : '';
    if (statusClass === 'offline' && lastSeen) {
      statusText = `Last seen ${lastSeen}`;
    }

    const canInvite = (friend.status === 'online' || friend.status === 'in_game') && this.isInLobby();

    return `
      <div class="friend-item" data-friend-id="${friend.friend_id}">
        <div class="friend-avatar">
          ${initial}
          <div class="status-dot ${statusClass}"></div>
        </div>
        <div class="friend-info">
          <div class="friend-name">${this.escapeHtml(friend.display_name || 'Unknown')}</div>
          <div class="friend-status ${friend.status === 'in_game' ? 'in-game' : ''}">${statusText}</div>
        </div>
        <div class="friend-actions">
          ${canInvite ? `<button class="action-btn primary invite-btn" data-friend-id="${friend.friend_id}">Invite</button>` : ''}
          <div class="friend-options">
            <button class="action-btn icon-only options-btn" data-friend-id="${friend.friend_id}">⋮</button>
            <div class="friend-options-menu">
              <button class="friend-options-item unfriend-btn" data-friend-id="${friend.friend_id}">Unfriend</button>
              <button class="friend-options-item danger block-btn" data-friend-id="${friend.friend_id}">Block</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderRequests() {
    // Incoming requests
    const incomingContainer = document.getElementById('incoming-requests');
    if (incomingContainer) {
      if (this.pendingRequests.length > 0) {
        incomingContainer.innerHTML = `
          <div class="section-label">INCOMING REQUESTS</div>
          ${this.pendingRequests.map(req => `
            <div class="friend-item" data-request-id="${req.id}">
              <div class="friend-avatar">
                ${(req.profiles?.display_name || '?')[0].toUpperCase()}
                <div class="status-dot online"></div>
              </div>
              <div class="friend-info">
                <div class="friend-name">${this.escapeHtml(req.profiles?.display_name || 'Unknown')}</div>
                <div class="friend-status">Wants to be friends</div>
              </div>
              <div class="friend-actions">
                <button class="action-btn accept accept-request-btn" data-request-id="${req.id}">✓</button>
                <button class="action-btn decline decline-request-btn" data-request-id="${req.id}">✕</button>
              </div>
            </div>
          `).join('')}
        `;
      } else {
        incomingContainer.innerHTML = '';
      }
    }

    // Sent requests
    const sentContainer = document.getElementById('sent-requests');
    if (sentContainer) {
      if (this.sentRequests.length > 0) {
        sentContainer.innerHTML = `
          <div class="section-label" style="margin-top: 20px;">SENT REQUESTS</div>
          ${this.sentRequests.map(req => `
            <div class="friend-item">
              <div class="friend-avatar">
                ${(req.profiles?.display_name || '?')[0].toUpperCase()}
              </div>
              <div class="friend-info">
                <div class="friend-name">${this.escapeHtml(req.profiles?.display_name || 'Unknown')}</div>
                <div class="friend-status">Pending...</div>
              </div>
              <div class="friend-actions">
                <button class="action-btn secondary cancel-request-btn" data-request-id="${req.id}">Cancel</button>
              </div>
            </div>
          `).join('')}
        `;
      } else {
        sentContainer.innerHTML = '';
      }
    }

    // Update badge
    const badge = document.getElementById('requests-badge');
    if (badge) {
      if (this.pendingRequests.length > 0) {
        badge.textContent = this.pendingRequests.length;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }

    // Bind request action events
    this.bindRequestActions();
  }

  renderInvites() {
    const container = document.getElementById('invites-container');
    if (!container) return;

    if (this.gameInvites.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="invites-section">
        <h3>🎮 GAME INVITES</h3>
        ${this.gameInvites.map(inv => `
          <div class="invite-item" data-invite-id="${inv.id}">
            <div class="invite-info">
              <div class="invite-from">${this.escapeHtml(inv.profiles?.display_name || 'Someone')}</div>
              <div class="invite-game">invited you to ${this.escapeHtml(inv.game_name)}</div>
            </div>
            <div class="friend-actions">
              <button class="action-btn primary join-invite-btn" data-invite-id="${inv.id}" data-room="${inv.room_code}" data-game="${inv.game_name}">Join</button>
              <button class="action-btn secondary ignore-invite-btn" data-invite-id="${inv.id}">✕</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.bindInviteActions();
  }

  // ==================== ACTIONS ====================

  bindFriendActions() {
    // Options toggle
    document.querySelectorAll('.options-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        document.querySelectorAll('.friend-options-menu.open').forEach(m => {
          if (m !== menu) m.classList.remove('open');
        });
        menu.classList.toggle('open');
      });
    });

    // Invite button
    document.querySelectorAll('.invite-btn').forEach(btn => {
      btn.addEventListener('click', () => this.sendInvite(btn.dataset.friendId));
    });

    // Unfriend button
    document.querySelectorAll('.unfriend-btn').forEach(btn => {
      btn.addEventListener('click', () => this.removeFriend(btn.dataset.friendId));
    });

    // Block button
    document.querySelectorAll('.block-btn').forEach(btn => {
      btn.addEventListener('click', () => this.blockUser(btn.dataset.friendId));
    });
  }

  bindRequestActions() {
    // Accept request
    document.querySelectorAll('.accept-request-btn').forEach(btn => {
      btn.addEventListener('click', () => this.acceptRequest(btn.dataset.requestId));
    });

    // Decline request
    document.querySelectorAll('.decline-request-btn').forEach(btn => {
      btn.addEventListener('click', () => this.declineRequest(btn.dataset.requestId));
    });

    // Cancel sent request
    document.querySelectorAll('.cancel-request-btn').forEach(btn => {
      btn.addEventListener('click', () => this.cancelRequest(btn.dataset.requestId));
    });
  }

  bindInviteActions() {
    // Join game invite
    document.querySelectorAll('.join-invite-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const game = btn.dataset.game;
        const room = btn.dataset.room;
        this.acceptInvite(btn.dataset.inviteId, game, room);
      });
    });

    // Ignore invite
    document.querySelectorAll('.ignore-invite-btn').forEach(btn => {
      btn.addEventListener('click', () => this.declineInvite(btn.dataset.inviteId));
    });
  }

  async searchUsers(query) {
    const container = document.getElementById('search-results');
    if (!container) return;

    if (!query || query.length < 2) {
      container.innerHTML = '';
      return;
    }

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id, display_name, created_at')
        .ilike('display_name', `%${query}%`)
        .neq('id', this.currentUser.id)
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) {
        container.innerHTML = `<div class="empty-state"><p class="empty-state-text">No users found</p></div>`;
        return;
      }

      // Check which users are already friends or have pending requests
      const friendIds = this.friends.map(f => f.friend_id);
      const sentIds = this.sentRequests.map(r => r.to_user);
      const receivedIds = this.pendingRequests.map(r => r.from_user);

      container.innerHTML = data.map(user => {
        const isFriend = friendIds.includes(user.id);
        const hasSentRequest = sentIds.includes(user.id);
        const hasReceivedRequest = receivedIds.includes(user.id);

        let actionBtn = '';
        if (isFriend) {
          actionBtn = `<span style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Friends ✓</span>`;
        } else if (hasSentRequest) {
          actionBtn = `<span style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Pending...</span>`;
        } else if (hasReceivedRequest) {
          actionBtn = `<button class="action-btn accept accept-from-search-btn" data-user-id="${user.id}">Accept</button>`;
        } else {
          actionBtn = `<button class="action-btn primary add-friend-btn" data-user-id="${user.id}">Add</button>`;
        }

        return `
          <div class="search-result-item">
            <div class="friend-avatar">
              ${(user.display_name || '?')[0].toUpperCase()}
            </div>
            <div class="friend-info">
              <div class="friend-name">${this.escapeHtml(user.display_name || 'Unknown')}</div>
              <div class="friend-status">Member since ${new Date(user.created_at).toLocaleDateString()}</div>
            </div>
            <div class="friend-actions">
              ${actionBtn}
            </div>
          </div>
        `;
      }).join('');

      // Bind search result actions
      document.querySelectorAll('.add-friend-btn').forEach(btn => {
        btn.addEventListener('click', () => this.sendFriendRequest(btn.dataset.userId));
      });

      document.querySelectorAll('.accept-from-search-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const request = this.pendingRequests.find(r => r.from_user === btn.dataset.userId);
          if (request) this.acceptRequest(request.id);
        });
      });

    } catch (err) {
      console.error('Search error:', err);
      container.innerHTML = `<div class="empty-state"><p class="empty-state-text">Error searching</p></div>`;
    }
  }

  async sendFriendRequest(userId) {
    try {
      const { error } = await this.supabase
        .from('friend_requests')
        .insert({ from_user: this.currentUser.id, to_user: userId });

      if (error) throw error;

      await this.loadRequests();
      // Re-run search to update button
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
      const { error } = await this.supabase
        .from('friend_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);

      if (error) throw error;
      await this.loadRequests();
    } catch (err) {
      console.error('Error declining request:', err);
    }
  }

  async cancelRequest(requestId) {
    try {
      const { error } = await this.supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      await this.loadRequests();
    } catch (err) {
      console.error('Error canceling request:', err);
    }
  }

  async removeFriend(friendId) {
    if (!confirm('Remove this friend?')) return;

    try {
      const { error } = await this.supabase.rpc('remove_friend', { friend_user_id: friendId });
      if (error) throw error;

      await this.loadFriends();
    } catch (err) {
      console.error('Error removing friend:', err);
      alert('Could not remove friend');
    }
  }

  async blockUser(userId) {
    if (!confirm('Block this user? They won\'t be able to see your status or send you requests.')) return;

    try {
      // Block
      const { error: blockErr } = await this.supabase
        .from('blocked_users')
        .insert({ user_id: this.currentUser.id, blocked_user_id: userId });

      if (blockErr) throw blockErr;

      // Also remove friendship
      await this.supabase.rpc('remove_friend', { friend_user_id: userId });

      await this.loadFriends();
    } catch (err) {
      console.error('Error blocking user:', err);
      alert('Could not block user');
    }
  }

  // ==================== INVITES ====================

  async sendInvite(friendId) {
    const lobbyInfo = this.getLobbyInfo();
    if (!lobbyInfo) {
      alert('You must be in a game lobby to invite friends');
      return;
    }

    try {
      const { error } = await this.supabase
        .from('game_invites')
        .insert({
          from_user: this.currentUser.id,
          to_user: friendId,
          game_name: lobbyInfo.game,
          room_code: lobbyInfo.roomCode
        });

      if (error) throw error;

      // Update button to show sent
      const btn = document.querySelector(`.invite-btn[data-friend-id="${friendId}"]`);
      if (btn) {
        btn.textContent = 'Sent!';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = 'Invite';
          btn.disabled = false;
        }, 3000);
      }
    } catch (err) {
      console.error('Error sending invite:', err);
      alert('Could not send invite');
    }
  }

  async acceptInvite(inviteId, game, roomCode) {
    try {
      await this.supabase
        .from('game_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      // Navigate to game lobby
      this.close();
      window.location.href = this.getGameLobbyUrl(game, roomCode);
    } catch (err) {
      console.error('Error accepting invite:', err);
    }
  }

  async declineInvite(inviteId) {
    try {
      await this.supabase
        .from('game_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      await this.loadInvites();
    } catch (err) {
      console.error('Error declining invite:', err);
    }
  }

  // ==================== PRESENCE ====================

  async updatePresence(status, game = null, room = null) {
    try {
      const { error } = await this.supabase
        .from('user_presence')
        .upsert({
          user_id: this.currentUser.id,
          status: status,
          current_game: game,
          current_room: room,
          last_seen: new Date().toISOString()
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error updating presence:', err);
    }
  }

  startPresenceHeartbeat() {
    // Update presence every 30 seconds
    setInterval(() => {
      if (this.currentUser) {
        const lobbyInfo = this.getLobbyInfo();
        if (lobbyInfo) {
          this.updatePresence('in_game', lobbyInfo.game, lobbyInfo.roomCode);
        } else {
          this.updatePresence('online');
        }
      }
    }, 30000);

    // Set offline when leaving page
    window.addEventListener('beforeunload', () => {
      if (this.currentUser) {
        // Use sendBeacon for reliability
        const data = JSON.stringify({
          user_id: this.currentUser.id,
          status: 'offline',
          last_seen: new Date().toISOString()
        });
        navigator.sendBeacon?.(`${this.supabase.supabaseUrl}/rest/v1/user_presence?user_id=eq.${this.currentUser.id}`, data);
      }
    });
  }

  subscribeToInvites() {
    this.invitesChannel = this.supabase
      .channel('game_invites_channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_invites',
        filter: `to_user=eq.${this.currentUser.id}`
      }, (payload) => {
        this.loadInvites();
        this.updateNotificationDot();
      })
      .subscribe();
  }

  // ==================== HELPERS ====================

  isInLobby() {
    // Check if we're in a game lobby page
    return window.location.pathname.includes('lobby') || 
           window.location.search.includes('room=') ||
           document.querySelector('[data-room-code]') !== null;
  }

  getLobbyInfo() {
    // Try to get lobby info from various sources
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room') || urlParams.get('code') || document.querySelector('[data-room-code]')?.dataset.roomCode;
    
    if (!roomCode) return null;

    // Try to determine game name from URL or page
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
    
    // Or try page title
    const pageTitle = document.querySelector('h1')?.textContent || document.title;
    if (game === 'Unknown' && pageTitle) {
      game = pageTitle.split('–')[0].split('-')[0].trim();
    }

    return { game, roomCode };
  }

  getGameLobbyUrl(game, roomCode) {
    // Map game names to URLs - update this based on your actual game URLs
    const gameUrls = {
      'Spyhunt': '/spyhunt/lobby.html',
      'Spyfall': '/spyhunt/lobby.html',
      'Codenames': '/codenames/lobby.html',
      'Werewolf': '/werewolf/lobby.html',
      'Imposter': '/imposter/lobby.html',
      'Herd Mentality': '/herd-mentality/lobby.html',
      'Kiss Marry Kill': '/kiss-marry-kill/lobby.html',
      'This or That': '/this-or-that/lobby.html',
      '21 Questions': '/21-questions/lobby.html',
      'Sketch & Guess': '/sketch/lobby.html'
    };

    const basePath = gameUrls[game] || '/lobby.html';
    return `${basePath}?join=${roomCode}`;
  }

  updateNotificationDot() {
    const dot = document.getElementById('social-notification-dot');
    if (dot) {
      const hasNotifications = this.pendingRequests.length > 0 || this.gameInvites.length > 0;
      dot.classList.toggle('visible', hasNotifications);
    }
  }

  timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ==================== INITIALIZATION ====================

// Auto-initialize when Supabase is available
function initSocialSystem() {
  if (typeof supabase !== 'undefined' && typeof supabaseClient !== 'undefined') {
    window.socialSystem = new SocialSystem(supabaseClient);
  } else {
    // Retry in 100ms
    setTimeout(initSocialSystem, 100);
  }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSocialSystem);
} else {
  initSocialSystem();
}

// Export for manual initialization if needed
window.SocialSystem = SocialSystem;
