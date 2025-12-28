/* =============================================
   SOCIAL SYSTEM v3 - TheGaming.co
   Features: Friends, Invites, Party Mode, Toast Notifications
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
    this.invitesChannel = null;
    this.requestsChannel = null;
    this.partyChannel = null;
    this.partyInviteChannel = null;
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
    this.injectStyles();
    this.injectHTML();
    this.injectNotificationContainer();
    this.bindEvents();
    await this.loadFriends();
    await this.loadRequests();
    await this.loadInvites();
    await this.loadParty();
    await this.loadPartyInvites();
    await this.updatePresence('online');
    this.startPresenceHeartbeat();
    this.subscribeToRealtime();
    this.updateNotificationDot();
  }

  // ==================== STYLES ====================

  injectStyles() {
    if (document.getElementById('social-party-styles')) return;
    const style = document.createElement('style');
    style.id = 'social-party-styles';
    style.textContent = `
      /* Party Section */
      .party-section {
        background: linear-gradient(135deg, rgba(108, 92, 231, 0.2) 0%, rgba(108, 92, 231, 0.05) 100%);
        border: 1px solid rgba(108, 92, 231, 0.3);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }
      .party-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .party-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #fff;
      }
      .party-title .crown { color: #f1c40f; }
      .party-status {
        font-size: 0.8rem;
        color: rgba(255,255,255,0.5);
        padding: 4px 8px;
        background: rgba(255,255,255,0.1);
        border-radius: 12px;
      }
      .party-status.in-game {
        background: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
      }
      .party-members {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }
      .party-member {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
      }
      .party-member .member-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6c5ce7 0%, #a855f7 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
        position: relative;
      }
      .party-member .member-avatar .crown-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        font-size: 12px;
      }
      .party-member .member-info {
        flex: 1;
      }
      .party-member .member-name {
        font-weight: 500;
        color: #fff;
        font-size: 0.9rem;
      }
      .party-member .member-status {
        font-size: 0.75rem;
        color: rgba(255,255,255,0.5);
      }
      .party-member .member-actions {
        display: flex;
        gap: 4px;
      }
      .party-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .party-btn {
        flex: 1;
        min-width: 100px;
        padding: 10px 16px;
        border: none;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .party-btn.primary {
        background: linear-gradient(135deg, #6c5ce7 0%, #a855f7 100%);
        color: white;
      }
      .party-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4); }
      .party-btn.secondary {
        background: rgba(255,255,255,0.1);
        color: white;
      }
      .party-btn.secondary:hover { background: rgba(255,255,255,0.15); }
      .party-btn.danger {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
      }
      .party-btn.danger:hover { background: rgba(231, 76, 60, 0.3); }
      .party-btn.small {
        padding: 4px 8px;
        font-size: 0.75rem;
        min-width: auto;
        flex: none;
      }
      
      /* No party state */
      .no-party {
        text-align: center;
        padding: 20px;
      }
      .no-party-icon { font-size: 48px; margin-bottom: 12px; }
      .no-party-text { color: rgba(255,255,255,0.6); margin-bottom: 16px; }
      
      /* Party game banner */
      .party-game-banner {
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .party-game-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .party-game-icon { font-size: 24px; }
      .party-game-text { font-weight: 500; }
      .party-game-name { font-size: 0.85rem; opacity: 0.9; }
      
      /* Party invite in friends list */
      .invite-to-party-btn {
        background: linear-gradient(135deg, #6c5ce7 0%, #a855f7 100%) !important;
      }
      
      /* Toast styles */
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
        animation: toastSlideIn 0.3s ease-out;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        position: relative;
      }
      .toast.invite { border-left: 4px solid #6c5ce7; }
      .toast.request { border-left: 4px solid #00cec9; }
      .toast.party { border-left: 4px solid #f39c12; }
      .toast-icon { font-size: 24px; flex-shrink: 0; }
      .toast-content { flex: 1; }
      .toast-title { font-weight: 600; color: #fff; margin-bottom: 4px; }
      .toast-message { color: rgba(255,255,255,0.7); font-size: 0.9rem; }
      .toast-actions { display: flex; gap: 8px; margin-top: 10px; }
      .toast-btn {
        padding: 6px 14px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.2s;
      }
      .toast-btn.primary { background: #6c5ce7; color: white; }
      .toast-btn.primary:hover { background: #5b4cdb; }
      .toast-btn.secondary { background: rgba(255,255,255,0.1); color: white; }
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
      }
      .toast-close:hover { color: white; }
      @keyframes toastSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .toast.removing { animation: toastSlideOut 0.3s ease-in forwards; }
      @keyframes toastSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // ==================== NOTIFICATIONS ====================

  injectNotificationContainer() {
    if (document.getElementById('toast-container')) return;
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  showToast(type, title, message, actions = []) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = { invite: '🎮', request: '👋', party: '🎉' };
    
    let actionsHTML = '';
    if (actions.length > 0) {
      actionsHTML = `<div class="toast-actions">
        ${actions.map(a => `<button class="toast-btn ${a.style || 'secondary'}" data-action="${a.action}">${a.label}</button>`).join('')}
      </div>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || '📢'}</div>
      <div class="toast-content">
        <div class="toast-title">${this.escapeHtml(title)}</div>
        <div class="toast-message">${this.escapeHtml(message)}</div>
        ${actionsHTML}
      </div>
      <button class="toast-close">×</button>
    `;

    toast.querySelectorAll('.toast-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action) this.handleToastAction(action);
        this.removeToast(toast);
      });
    });

    toast.querySelector('.toast-close').addEventListener('click', () => this.removeToast(toast));
    container.appendChild(toast);
    setTimeout(() => this.removeToast(toast), 10000);
  }

  handleToastAction(action) {
    const [method, ...args] = action.split(':');
    switch(method) {
      case 'join': this.joinFriendGame(args[0], args[1], args[2]); break;
      case 'accept': this.acceptInvite(args[0], args[1], args[2]); break;
      case 'decline': this.declineInvite(args[0]); break;
      case 'acceptRequest': this.acceptRequest(args[0]); break;
      case 'declineRequest': this.declineRequest(args[0]); break;
      case 'acceptParty': this.acceptPartyInvite(args[0]); break;
      case 'declineParty': this.declinePartyInvite(args[0]); break;
      case 'joinPartyGame': this.joinPartyGame(); break;
      case 'openSidebar': this.open(); break;
    }
  }

  removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }

  updateBrowserNotification() {
    const count = this.pendingRequests.length + this.gameInvites.length + this.partyInvites.length;
    this.notificationCount = count;
    if (count > 0) {
      document.title = `(${count}) ${this.originalTitle}`;
      this.startTitleFlash();
    } else {
      document.title = this.originalTitle;
      this.stopTitleFlash();
    }
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

  sendBrowserNotification(title, body, onClick) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, { body, icon: '/favicon.ico' });
      notification.onclick = () => { window.focus(); if (onClick) onClick(); notification.close(); };
    }
  }

  // ==================== REALTIME ====================

  subscribeToRealtime() {
    // Game invites
    this.invitesChannel = this.supabase.channel('game_invites_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_invites', filter: `to_user=eq.${this.currentUser.id}` }, async (payload) => {
        await this.loadInvites();
        this.updateNotificationDot();
        this.updateBrowserNotification();
        const { data: sender } = await this.supabase.from('profiles').select('display_name, gamer_tag').eq('id', payload.new.from_user).single();
        const senderName = sender?.gamer_tag || sender?.display_name || 'Someone';
        this.showToast('invite', 'Game Invite!', `${senderName} invited you to ${payload.new.game_name}`, [
          { label: 'Join', style: 'primary', action: `accept:${payload.new.id}:${payload.new.game_name}:${payload.new.room_code}` },
          { label: 'Ignore', style: 'secondary', action: `decline:${payload.new.id}` }
        ]);
        if (document.hidden) this.sendBrowserNotification('Game Invite!', `${senderName} invited you to ${payload.new.game_name}`);
      }).subscribe();

    // Friend requests
    this.requestsChannel = this.supabase.channel('friend_requests_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friend_requests', filter: `to_user=eq.${this.currentUser.id}` }, async (payload) => {
        await this.loadRequests();
        this.updateNotificationDot();
        this.updateBrowserNotification();
        const { data: sender } = await this.supabase.from('profiles').select('display_name, gamer_tag, discriminator').eq('id', payload.new.from_user).single();
        const senderName = sender?.gamer_tag || sender?.display_name || 'Someone';
        const tag = sender?.discriminator ? `#${sender.discriminator}` : '';
        this.showToast('request', 'Friend Request', `${senderName}${tag} wants to be friends`, [
          { label: 'Accept', style: 'primary', action: `acceptRequest:${payload.new.id}` },
          { label: 'View', style: 'secondary', action: 'openSidebar' }
        ]);
        if (document.hidden) this.sendBrowserNotification('Friend Request', `${senderName} wants to be friends`);
      }).subscribe();

    // Party invites
    this.partyInviteChannel = this.supabase.channel('party_invites_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'party_invites', filter: `to_user=eq.${this.currentUser.id}` }, async (payload) => {
        await this.loadPartyInvites();
        this.updateNotificationDot();
        this.updateBrowserNotification();
        const { data: sender } = await this.supabase.from('profiles').select('display_name, gamer_tag').eq('id', payload.new.from_user).single();
        const senderName = sender?.gamer_tag || sender?.display_name || 'Someone';
        this.showToast('party', 'Party Invite!', `${senderName} invited you to their party`, [
          { label: 'Join', style: 'primary', action: `acceptParty:${payload.new.id}` },
          { label: 'Decline', style: 'secondary', action: `declineParty:${payload.new.id}` }
        ]);
        if (document.hidden) this.sendBrowserNotification('Party Invite!', `${senderName} invited you to their party`);
      }).subscribe();

    // Party updates (for members to see when leader starts game)
    this.subscribeToPartyUpdates();
  }

  subscribeToPartyUpdates() {
    if (this.partyChannel) this.partyChannel.unsubscribe();
    if (!this.currentParty) return;

    this.partyChannel = this.supabase.channel(`party_${this.currentParty.party_id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parties', filter: `id=eq.${this.currentParty.party_id}` }, async (payload) => {
        if (payload.eventType === 'DELETE') {
          // Party disbanded
          this.currentParty = null;
          this.partyMembers = [];
          this.renderParty();
          this.showToast('party', 'Party Disbanded', 'The party leader has disbanded the party');
          return;
        }
        
        const oldGame = this.currentParty?.current_room;
        await this.loadParty();
        
        // If leader started a new game and we're not the leader, show join notification
        if (this.currentParty && this.currentParty.current_room && this.currentParty.current_room !== oldGame) {
          if (this.currentParty.leader_id !== this.currentUser.id) {
            this.showToast('party', 'Party Game Started!', `Leader started ${this.currentParty.current_game}`, [
              { label: 'Join Now', style: 'primary', action: 'joinPartyGame' }
            ]);
            if (document.hidden) this.sendBrowserNotification('Party Game Started!', `Join ${this.currentParty.current_game}`);
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'party_members', filter: `party_id=eq.${this.currentParty.party_id}` }, async () => {
        await this.loadParty();
      })
      .subscribe();
  }

  // ==================== PARTY FUNCTIONS ====================

  async loadParty() {
    try {
      const { data, error } = await this.supabase.rpc('get_my_party');
      if (error) throw error;
      
      if (data && data.length > 0) {
        this.currentParty = {
          party_id: data[0].party_id,
          party_name: data[0].party_name,
          leader_id: data[0].leader_id,
          current_game: data[0].current_game,
          current_room: data[0].current_room,
          status: data[0].status
        };
        this.partyMembers = data.map(m => ({
          id: m.member_id,
          name: m.member_gamer_tag || m.member_name,
          gamer_tag: m.member_gamer_tag,
          discriminator: m.member_discriminator,
          role: m.member_role,
          status: m.member_status
        }));
        this.subscribeToPartyUpdates();
      } else {
        this.currentParty = null;
        this.partyMembers = [];
      }
      this.renderParty();
    } catch (err) {
      console.error('Error loading party:', err);
    }
  }

  async loadPartyInvites() {
    try {
      const { data, error } = await this.supabase
        .from('party_invites')
        .select('id, party_id, from_user, created_at, profiles!party_invites_from_user_fkey(display_name, gamer_tag)')
        .eq('to_user', this.currentUser.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());
      if (error) throw error;
      this.partyInvites = data || [];
      this.renderPartyInvites();
    } catch (err) {
      console.error('Error loading party invites:', err);
    }
  }

  async createParty() {
    try {
      const { data, error } = await this.supabase.rpc('create_party', { party_name: 'Party' });
      if (error) throw error;
      await this.loadParty();
      this.showToast('party', 'Party Created!', 'Invite friends to join your party');
    } catch (err) {
      console.error('Error creating party:', err);
      if (err.message?.includes('Already in a party')) {
        alert('You are already in a party!');
      } else {
        alert('Could not create party');
      }
    }
  }

  async inviteToParty(userId) {
    try {
      const { error } = await this.supabase.rpc('invite_to_party', { invitee_id: userId });
      if (error) throw error;
      this.showToast('party', 'Invite Sent', 'Party invite sent!');
    } catch (err) {
      console.error('Error inviting to party:', err);
      alert(err.message || 'Could not send party invite');
    }
  }

  async acceptPartyInvite(inviteId) {
    try {
      const { error } = await this.supabase.rpc('accept_party_invite', { invite_id: inviteId });
      if (error) throw error;
      await this.loadParty();
      await this.loadPartyInvites();
      this.showToast('party', 'Joined Party!', 'You are now in the party');
    } catch (err) {
      console.error('Error accepting party invite:', err);
      alert(err.message || 'Could not join party');
    }
  }

  async declinePartyInvite(inviteId) {
    try {
      await this.supabase.from('party_invites').update({ status: 'declined' }).eq('id', inviteId);
      await this.loadPartyInvites();
    } catch (err) {
      console.error('Error declining party invite:', err);
    }
  }

  async leaveParty() {
    if (!confirm(this.isPartyLeader() ? 'Disband the party?' : 'Leave the party?')) return;
    try {
      const { error } = await this.supabase.rpc('leave_party');
      if (error) throw error;
      this.currentParty = null;
      this.partyMembers = [];
      this.renderParty();
    } catch (err) {
      console.error('Error leaving party:', err);
      alert('Could not leave party');
    }
  }

  async kickFromParty(userId) {
    if (!confirm('Kick this player from the party?')) return;
    try {
      const { error } = await this.supabase.rpc('kick_from_party', { kick_user_id: userId });
      if (error) throw error;
      await this.loadParty();
    } catch (err) {
      console.error('Error kicking from party:', err);
    }
  }

  async transferLeadership(userId) {
    if (!confirm('Transfer leadership to this player?')) return;
    try {
      const { error } = await this.supabase.rpc('transfer_party_leadership', { new_leader_id: userId });
      if (error) throw error;
      await this.loadParty();
    } catch (err) {
      console.error('Error transferring leadership:', err);
    }
  }

  async partyStartGame() {
    const lobbyInfo = this.getLobbyInfo();
    if (!lobbyInfo) {
      alert('Create or join a game lobby first, then click "Start Party Game"');
      return;
    }
    try {
      const { error } = await this.supabase.rpc('party_start_game', { 
        game_name: lobbyInfo.game, 
        room_code: lobbyInfo.roomCode 
      });
      if (error) throw error;
      await this.loadParty();
    } catch (err) {
      console.error('Error starting party game:', err);
    }
  }

  joinPartyGame() {
    if (!this.currentParty?.current_room) return;
    window.location.href = this.getGameLobbyUrl(this.currentParty.current_game, this.currentParty.current_room);
  }

  isPartyLeader() {
    return this.currentParty?.leader_id === this.currentUser.id;
  }

  // ==================== RENDER PARTY ====================

  renderParty() {
    const container = document.getElementById('party-section');
    if (!container) return;

    if (!this.currentParty) {
      container.innerHTML = `
        <div class="no-party">
          <div class="no-party-icon">🎉</div>
          <p class="no-party-text">No active party</p>
          <button class="party-btn primary" id="create-party-btn">Create Party</button>
        </div>
      `;
      document.getElementById('create-party-btn')?.addEventListener('click', () => this.createParty());
      return;
    }

    const isLeader = this.isPartyLeader();
    const inGame = this.currentParty.status === 'in_game' && this.currentParty.current_room;

    let gameBanner = '';
    if (inGame) {
      gameBanner = `
        <div class="party-game-banner">
          <div class="party-game-info">
            <div class="party-game-icon">🎮</div>
            <div>
              <div class="party-game-text">Playing</div>
              <div class="party-game-name">${this.escapeHtml(this.currentParty.current_game)}</div>
            </div>
          </div>
          ${!isLeader ? `<button class="party-btn primary small" id="join-party-game-btn">Join</button>` : ''}
        </div>
      `;
    }

    const membersHTML = this.partyMembers.map(m => {
      const isMe = m.id === this.currentUser.id;
      const isMemberLeader = m.role === 'leader';
      const initial = (m.name || '?')[0].toUpperCase();
      
      let actions = '';
      if (isLeader && !isMe) {
        actions = `
          <button class="party-btn small secondary transfer-btn" data-user-id="${m.id}" title="Make Leader">👑</button>
          <button class="party-btn small danger kick-btn" data-user-id="${m.id}" title="Kick">✕</button>
        `;
      }

      return `
        <div class="party-member">
          <div class="member-avatar">
            ${initial}
            ${isMemberLeader ? '<span class="crown-badge">👑</span>' : ''}
          </div>
          <div class="member-info">
            <div class="member-name">${this.escapeHtml(m.name)}${isMe ? ' (You)' : ''}</div>
            <div class="member-status">${m.status === 'online' ? '🟢 Online' : m.status === 'in_game' ? '🎮 In Game' : '⚫ Offline'}</div>
          </div>
          <div class="member-actions">${actions}</div>
        </div>
      `;
    }).join('');

    let actionButtons = '';
    if (isLeader) {
      if (this.isInLobby()) {
        actionButtons = `<button class="party-btn primary" id="party-start-btn">🚀 Start Party Game</button>`;
      } else {
        actionButtons = `<button class="party-btn secondary" id="party-start-btn" disabled>Join a lobby to start</button>`;
      }
    }

    container.innerHTML = `
      <div class="party-section">
        <div class="party-header">
          <div class="party-title">
            <span>🎉</span>
            <span>${this.escapeHtml(this.currentParty.party_name)}</span>
          </div>
          <div class="party-status ${inGame ? 'in-game' : ''}">${inGame ? 'In Game' : 'Idle'}</div>
        </div>
        ${gameBanner}
        <div class="party-members">${membersHTML}</div>
        <div class="party-actions">
          ${actionButtons}
          <button class="party-btn ${isLeader ? 'danger' : 'secondary'}" id="leave-party-btn">${isLeader ? 'Disband' : 'Leave'}</button>
        </div>
      </div>
    `;

    // Bind events
    document.getElementById('party-start-btn')?.addEventListener('click', () => this.partyStartGame());
    document.getElementById('leave-party-btn')?.addEventListener('click', () => this.leaveParty());
    document.getElementById('join-party-game-btn')?.addEventListener('click', () => this.joinPartyGame());
    document.querySelectorAll('.kick-btn').forEach(btn => btn.addEventListener('click', () => this.kickFromParty(btn.dataset.userId)));
    document.querySelectorAll('.transfer-btn').forEach(btn => btn.addEventListener('click', () => this.transferLeadership(btn.dataset.userId)));
  }

  renderPartyInvites() {
    const container = document.getElementById('party-invites-container');
    if (!container) return;
    if (this.partyInvites.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = `
      <div class="invites-section" style="border-color: rgba(243, 156, 18, 0.3); background: rgba(243, 156, 18, 0.1);">
        <h3>🎉 PARTY INVITES</h3>
        ${this.partyInvites.map(inv => {
          const name = inv.profiles?.gamer_tag || inv.profiles?.display_name || 'Someone';
          return `
            <div class="invite-item" data-invite-id="${inv.id}">
              <div class="invite-info">
                <div class="invite-from">${this.escapeHtml(name)}</div>
                <div class="invite-game">invited you to their party</div>
              </div>
              <div class="friend-actions">
                <button class="action-btn primary accept-party-btn" data-invite-id="${inv.id}">Join</button>
                <button class="action-btn secondary decline-party-btn" data-invite-id="${inv.id}">✕</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.querySelectorAll('.accept-party-btn').forEach(btn => btn.addEventListener('click', () => this.acceptPartyInvite(btn.dataset.inviteId)));
    document.querySelectorAll('.decline-party-btn').forEach(btn => btn.addEventListener('click', () => this.declinePartyInvite(btn.dataset.inviteId)));
  }

  // ==================== UI ====================

  async loadUserProfile() {
    try {
      const { data, error } = await this.supabase.from('profiles').select('id, display_name, gamer_tag, discriminator').eq('id', this.currentUser.id).single();
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
          <h2>SOCIAL</h2>
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
          <button class="social-tab active" data-tab="party">Party</button>
          <button class="social-tab" data-tab="friends">Friends</button>
          <button class="social-tab" data-tab="requests">Requests<span class="badge" id="requests-badge" style="display: none;">0</span></button>
          <button class="social-tab" data-tab="search">Search</button>
        </div>
        
        <div class="social-content">
          <div class="social-panel active" id="panel-party">
            <div id="party-invites-container"></div>
            <div id="party-section"></div>
          </div>
          <div class="social-panel" id="panel-friends">
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
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
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
      const { data: incoming, error: inErr } = await this.supabase.from('friend_requests')
        .select('id, from_user, created_at, profiles!friend_requests_from_user_fkey(display_name, gamer_tag, discriminator)')
        .eq('to_user', this.currentUser.id).eq('status', 'pending');
      if (inErr) throw inErr;
      const { data: sent, error: sentErr } = await this.supabase.from('friend_requests')
        .select('id, to_user, created_at, profiles!friend_requests_to_user_fkey(display_name, gamer_tag, discriminator)')
        .eq('from_user', this.currentUser.id).eq('status', 'pending');
      if (sentErr) throw sentErr;
      this.pendingRequests = incoming || [];
      this.sentRequests = sent || [];
      this.renderRequests();
      this.updateNotificationDot();
      this.updateBrowserNotification();
    } catch (err) { console.error('Error loading requests:', err); }
  }

  async loadInvites() {
    try {
      const { data, error } = await this.supabase.from('game_invites')
        .select('id, from_user, game_name, room_code, created_at, expires_at, profiles!game_invites_from_user_fkey(display_name, gamer_tag)')
        .eq('to_user', this.currentUser.id).eq('status', 'pending').gt('expires_at', new Date().toISOString());
      if (error) throw error;
      this.gameInvites = data || [];
      this.renderInvites();
      this.updateBrowserNotification();
    } catch (err) { console.error('Error loading invites:', err); }
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

    const canInvite = (friend.status === 'online' || friend.status === 'in_game') && this.isInLobby();
    const canJoin = friend.status === 'in_game' && friend.current_room;
    const canInviteToParty = this.isPartyLeader() && (friend.status === 'online' || friend.status === 'in_game');

    let actionButtons = '';
    if (canInviteToParty) {
      actionButtons = `<button class="action-btn invite-to-party-btn" data-friend-id="${friend.friend_id}" title="Invite to Party">🎉</button>`;
    }
    if (canJoin) {
      actionButtons += `<button class="action-btn primary join-btn" data-friend-id="${friend.friend_id}" data-game="${friend.current_game || 'Unknown'}" data-room="${friend.current_room}">Join</button>`;
    } else if (canInvite) {
      actionButtons += `<button class="action-btn primary invite-btn" data-friend-id="${friend.friend_id}">Invite</button>`;
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
            return `<div class="friend-item"><div class="friend-avatar">${name[0].toUpperCase()}</div>
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
    document.querySelectorAll('.invite-to-party-btn').forEach(btn => btn.addEventListener('click', () => this.inviteToParty(btn.dataset.friendId)));
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

  joinFriendGame(friendId, game, roomCode) {
    if (!roomCode) { alert('Could not get room code'); return; }
    window.location.href = this.getGameLobbyUrl(game, roomCode);
  }

  async sendFriendRequest(userId) {
    try {
      const { error } = await this.supabase.from('friend_requests').insert({ from_user: this.currentUser.id, to_user: userId });
      if (error) throw error;
      await this.loadRequests();
      const searchInput = document.getElementById('user-search-input');
      if (searchInput?.value) this.searchUsers(searchInput.value);
    } catch (err) { console.error('Error sending friend request:', err); alert('Could not send friend request'); }
  }

  async acceptRequest(requestId) {
    try {
      const { error } = await this.supabase.rpc('accept_friend_request', { request_id: requestId });
      if (error) throw error;
      await this.loadFriends();
      await this.loadRequests();
    } catch (err) { console.error('Error accepting request:', err); alert('Could not accept request'); }
  }

  async declineRequest(requestId) {
    try {
      await this.supabase.from('friend_requests').update({ status: 'declined' }).eq('id', requestId);
      await this.loadRequests();
    } catch (err) { console.error('Error declining request:', err); }
  }

  async cancelRequest(requestId) {
    try {
      await this.supabase.from('friend_requests').delete().eq('id', requestId);
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
      await this.supabase.from('blocked_users').insert({ user_id: this.currentUser.id, blocked_user_id: userId });
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
    // Immediate check
    this.updatePresenceForCurrentPage();
    
    setInterval(() => {
      if (this.currentUser) this.updatePresenceForCurrentPage();
    }, 60000);
    
    window.addEventListener('beforeunload', () => {
      if (this.currentUser) {
        const data = JSON.stringify({ user_id: this.currentUser.id, status: 'offline', last_seen: new Date().toISOString() });
        navigator.sendBeacon?.(`${this.supabase.supabaseUrl}/rest/v1/user_presence?user_id=eq.${this.currentUser.id}`, data);
      }
    });
  }

  updatePresenceForCurrentPage() {
    const lobbyInfo = this.getLobbyInfo();
    if (lobbyInfo) {
      this.updatePresence('in_game', lobbyInfo.game, lobbyInfo.roomCode);
      // If party leader, also update party
      if (this.isPartyLeader()) {
        this.supabase.rpc('party_start_game', { game_name: lobbyInfo.game, room_code: lobbyInfo.roomCode });
      }
    } else {
      this.updatePresence('online');
      // Clear party game if leader leaves lobby
      if (this.isPartyLeader() && this.currentParty?.current_room) {
        this.supabase.rpc('party_clear_game');
      }
    }
  }

  // ==================== HELPERS ====================

  isInLobby() { return window.location.pathname.includes('lobby') || window.location.search.includes('room=') || document.querySelector('[data-room-code]') !== null; }

  getLobbyInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room') || urlParams.get('code') || urlParams.get('join') || document.querySelector('[data-room-code]')?.dataset.roomCode;
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
    if (dot) dot.classList.toggle('visible', this.pendingRequests.length > 0 || this.gameInvites.length > 0 || this.partyInvites.length > 0);
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
