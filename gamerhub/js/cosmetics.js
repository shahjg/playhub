/**
 * TheGaming.co Cosmetics Renderer
 * 
 * Include this script on any page that needs to render premium nameplates.
 * Works in: Lobbies, Waiting Rooms, In-Game Player Lists, Leaderboards
 * 
 * Usage:
 *   // Render a nameplate
 *   const html = renderNameplate({
 *     name: 'PlayerName',
 *     cosmetics: { badge_icon: '👑', border_color: 'gold', ... },
 *     isPremium: true,
 *     showEntrance: true // triggers entrance animation
 *   });
 * 
 *   // Or use the helper to fetch and render from Supabase
 *   const html = await renderPlayerNameplate(userId, playerName);
 */

// Color map for border colors
const COSMETIC_COLORS = {
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

// Default cosmetics for free users
const DEFAULT_COSMETICS = {
  border_style: 'solid',
  border_color: 'gray',
  badge_icon: null,
  name_effect: 'none',
  title: null,
  entrance_animation: 'fade'
};

// CSS styles - inject once
const COSMETICS_STYLES = `
<style id="cosmetics-styles">
  /* Nameplate Container */
  .tgco-nameplate {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }

  .tgco-nameplate.free {
    border-color: rgba(255, 255, 255, 0.1);
  }

  /* Badge Icon */
  .tgco-badge {
    font-size: 1.1rem;
    line-height: 1;
  }

  /* Name Wrapper */
  .tgco-name-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  /* Player Name */
  .tgco-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: white;
    transition: all 0.3s ease;
  }

  /* Title */
  .tgco-title {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Border Styles */
  .tgco-border-solid { border-style: solid; }
  .tgco-border-glow { box-shadow: 0 0 15px var(--tgco-color), 0 0 30px var(--tgco-color); }
  .tgco-border-pulse { animation: tgcoBorderPulse 1.5s ease-in-out infinite !important; }
  .tgco-border-double { border-style: double; border-width: 4px; }
  .tgco-border-dotted { border-style: dotted; }

  @keyframes tgcoBorderPulse {
    0%, 100% { 
      box-shadow: 0 0 5px var(--tgco-color);
      filter: brightness(1);
    }
    50% { 
      box-shadow: 0 0 20px var(--tgco-color), 0 0 40px var(--tgco-color);
      filter: brightness(1.2);
    }
  }

  /* Rainbow border */
  .tgco-nameplate.rainbow-border {
    border-color: transparent !important;
    background: 
      linear-gradient(rgba(15, 15, 25, 0.95), rgba(15, 15, 25, 0.95)) padding-box,
      linear-gradient(90deg, #f87171, #fbbf24, #34d399, #67e8f9, #c084fc, #f87171) border-box;
    background-size: 100% 100%, 300% 100%;
    animation: tgcoRainbow 3s linear infinite;
  }

  @keyframes tgcoRainbow {
    0% { background-position: 0 0, 0% 0; }
    100% { background-position: 0 0, 300% 0; }
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
    text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor, 0 0 80px currentColor !important; 
  }

  @keyframes tgcoShimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Entrance Animations */
  @keyframes tgcoFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes tgcoSlide { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes tgcoPop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @keyframes tgcoLightning { 
    0% { opacity: 0; filter: brightness(5); }
    30% { opacity: 1; filter: brightness(5); }
    100% { opacity: 1; filter: brightness(1); }
  }
  @keyframes tgcoFire { 
    0% { opacity: 0; transform: translateY(10px); filter: blur(5px); }
    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  @keyframes tgcoSparkle { 
    0% { opacity: 0; transform: scale(0) rotate(-180deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes tgcoSmoke { 
    0% { opacity: 0; filter: blur(10px); transform: scale(1.2); }
    100% { opacity: 1; filter: blur(0); transform: scale(1); }
  }
  @keyframes tgcoGlitch { 
    0% { opacity: 0; transform: translateX(-5px) skewX(-5deg); filter: hue-rotate(90deg); }
    20% { opacity: 1; transform: translateX(5px) skewX(5deg); filter: hue-rotate(180deg); }
    40% { transform: translateX(-3px) skewX(-3deg); filter: hue-rotate(270deg); }
    60% { transform: translateX(3px) skewX(3deg); filter: hue-rotate(360deg); }
    100% { transform: translateX(0) skewX(0deg); filter: hue-rotate(0deg); }
  }

  .tgco-entrance-fade { animation: tgcoFade 0.5s ease both; }
  .tgco-entrance-slide { animation: tgcoSlide 0.5s ease both; }
  .tgco-entrance-pop { animation: tgcoPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) both; }
  .tgco-entrance-lightning { animation: tgcoLightning 0.4s ease both; }
  .tgco-entrance-fire { animation: tgcoFire 0.5s ease both; }
  .tgco-entrance-sparkle { animation: tgcoSparkle 0.6s ease both; }
  .tgco-entrance-smoke { animation: tgcoSmoke 0.6s ease both; }
  .tgco-entrance-glitch { animation: tgcoGlitch 0.5s ease both; }

  /* Compact mode for player lists */
  .tgco-nameplate.compact {
    padding: 5px 10px;
    gap: 6px;
  }

  .tgco-nameplate.compact .tgco-badge {
    font-size: 0.9rem;
  }

  .tgco-nameplate.compact .tgco-name {
    font-size: 0.85rem;
  }

  .tgco-nameplate.compact .tgco-title {
    font-size: 0.6rem;
  }

  /* Leaderboard mode */
  .tgco-nameplate.leaderboard {
    background: transparent;
    border: none;
    padding: 0;
  }

  .tgco-nameplate.leaderboard .tgco-name {
    font-size: 1rem;
  }

  /* Player Cards (for waiting rooms) */
  .player-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }

  .player-card.premium {
    background: rgba(255, 255, 255, 0.05);
  }

  .player-card.is-me {
    background: rgba(79, 172, 254, 0.1);
  }

  .player-card.rainbow-border {
    border-color: transparent !important;
    background: 
      linear-gradient(rgba(15, 15, 25, 0.95), rgba(15, 15, 25, 0.95)) padding-box,
      linear-gradient(90deg, #f87171, #fbbf24, #34d399, #67e8f9, #c084fc, #f87171) border-box;
    background-size: 100% 100%, 300% 100%;
    animation: tgcoRainbow 3s linear infinite;
  }

  .player-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .player-badge {
    font-size: 1.2rem;
  }

  .player-name-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .player-name {
    font-size: 1rem;
    font-weight: 600;
    color: white;
  }

  .player-title {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
  }

  .host-badge {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }
</style>
`;

// Inject styles if not already present
function injectCosmeticsStyles() {
  if (!document.getElementById('cosmetics-styles')) {
    document.head.insertAdjacentHTML('beforeend', COSMETICS_STYLES);
  }
}

/**
 * Render a nameplate with cosmetics
 * @param {Object} options
 * @param {string} options.name - Player display name
 * @param {Object} options.cosmetics - Cosmetics object from Supabase
 * @param {boolean} options.isPremium - Whether user is premium
 * @param {boolean} options.showEntrance - Trigger entrance animation
 * @param {string} options.mode - 'default', 'compact', or 'leaderboard'
 * @returns {string} HTML string
 */
function renderNameplate(options) {
  injectCosmeticsStyles();

  const {
    name = 'Player',
    cosmetics = {},
    isPremium = false,
    showEntrance = false,
    mode = 'default'
  } = options;

  // Merge with defaults
  const c = isPremium ? { ...DEFAULT_COSMETICS, ...cosmetics } : DEFAULT_COSMETICS;

  // Get color
  const isRainbow = c.border_color === 'rainbow';
  const color = isRainbow ? '#c084fc' : (COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray);

  // Build classes
  const classes = ['tgco-nameplate'];
  
  if (!isPremium) {
    classes.push('free');
  } else {
    if (isRainbow) {
      classes.push('rainbow-border');
    } else {
      classes.push(`tgco-border-${c.border_style || 'solid'}`);
    }
    if (showEntrance && c.entrance_animation) {
      classes.push(`tgco-entrance-${c.entrance_animation}`);
    }
  }

  if (mode !== 'default') {
    classes.push(mode);
  }

  // Name classes
  const nameClasses = ['tgco-name'];
  if (isPremium && c.name_effect && c.name_effect !== 'none') {
    nameClasses.push(`tgco-effect-${c.name_effect}`);
  }

  // Build HTML
  const badgeHtml = (isPremium && c.badge_icon) 
    ? `<span class="tgco-badge">${escapeHtml(c.badge_icon)}</span>` 
    : '';

  const titleHtml = (isPremium && c.title) 
    ? `<span class="tgco-title">${escapeHtml(c.title)}</span>` 
    : '';

  const styleAttr = isPremium && !isRainbow
    ? `style="--tgco-color: ${color}; border-color: ${color};"` 
    : '';

  const nameStyle = isPremium ? `style="color: ${color};"` : '';

  return `
    <div class="${classes.join(' ')}" ${styleAttr}>
      ${badgeHtml}
      <div class="tgco-name-wrapper">
        <span class="${nameClasses.join(' ')}" ${nameStyle}>${escapeHtml(name)}</span>
        ${titleHtml}
      </div>
    </div>
  `.trim();
}

/**
 * Render a simple name with cosmetics (no nameplate box)
 * Good for inline use in player lists
 */
function renderInlineName(options) {
  injectCosmeticsStyles();

  const {
    name = 'Player',
    cosmetics = {},
    isPremium = false
  } = options;

  const c = isPremium ? { ...DEFAULT_COSMETICS, ...cosmetics } : DEFAULT_COSMETICS;
  const color = COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray;

  const nameClasses = ['tgco-name'];
  if (isPremium && c.name_effect && c.name_effect !== 'none') {
    nameClasses.push(`tgco-effect-${c.name_effect}`);
  }

  const badge = (isPremium && c.badge_icon) ? `${c.badge_icon} ` : '';
  const nameStyle = isPremium ? `style="color: ${color};"` : '';

  return `<span class="${nameClasses.join(' ')}" ${nameStyle}>${badge}${escapeHtml(name)}</span>`;
}

/**
 * Create a player card for lobby/waiting room
 */
function renderPlayerCard(options) {
  injectCosmeticsStyles();

  const {
    name = 'Player',
    cosmetics = {},
    isPremium = false,
    isHost = false,
    isMe = false,
    showEntrance = false
  } = options;

  const c = isPremium ? { ...DEFAULT_COSMETICS, ...cosmetics } : DEFAULT_COSMETICS;
  const isRainbow = c.border_color === 'rainbow';
  const color = isRainbow ? '#c084fc' : (isPremium ? (COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray) : 'rgba(255,255,255,0.1)');

  // Card classes
  const cardClasses = ['player-card'];
  if (isMe) cardClasses.push('is-me');
  if (isPremium) cardClasses.push('premium');
  if (isRainbow && isPremium) cardClasses.push('rainbow-border');
  if (showEntrance && isPremium) cardClasses.push(`tgco-entrance-${c.entrance_animation || 'fade'}`);

  // Name classes  
  const nameClasses = ['player-name'];
  if (isPremium && c.name_effect && c.name_effect !== 'none') {
    nameClasses.push(`tgco-effect-${c.name_effect}`);
  }

  const badge = (isPremium && c.badge_icon) ? `<span class="player-badge">${c.badge_icon}</span>` : '';
  const hostBadge = isHost ? '<span class="host-badge">HOST</span>' : '';
  const title = (isPremium && c.title) ? `<span class="player-title">${escapeHtml(c.title)}</span>` : '';

  // Border style (skip for rainbow - handled by class)
  let borderStyle = '';
  if (isPremium && !isRainbow) {
    borderStyle = `border-color: ${color};`;
    if (c.border_style === 'glow') borderStyle += ` box-shadow: 0 0 15px ${color}, 0 0 30px ${color};`;
    if (c.border_style === 'pulse') borderStyle += ` --tgco-color: ${color};`;
  }
  
  const nameStyle = isPremium ? `color: ${color};` : '';

  return `
    <div class="${cardClasses.join(' ')}" style="${borderStyle}">
      <div class="player-info">
        ${badge}
        <div class="player-name-wrapper">
          <span class="${nameClasses.join(' ')}" style="${nameStyle}">${escapeHtml(name)}</span>
          ${title}
        </div>
      </div>
      ${hostBadge}
    </div>
  `.trim();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Cache for player cosmetics
 */
const cosmeticsCache = new Map();

/**
 * Fetch cosmetics from Supabase for a user
 * Requires supabaseClient to be available globally
 */
async function fetchPlayerCosmetics(userId) {
  if (cosmeticsCache.has(userId)) {
    return cosmeticsCache.get(userId);
  }

  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('display_name, account_type, cosmetics')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const result = {
      name: data.display_name || 'Player',
      isPremium: data.account_type === 'premium',
      cosmetics: data.cosmetics || DEFAULT_COSMETICS
    };

    cosmeticsCache.set(userId, result);
    return result;
  } catch (e) {
    console.error('Error fetching cosmetics:', e);
    return {
      name: 'Player',
      isPremium: false,
      cosmetics: DEFAULT_COSMETICS
    };
  }
}

/**
 * Clear cosmetics cache (call when user updates their cosmetics)
 */
function clearCosmeticsCache(userId = null) {
  if (userId) {
    cosmeticsCache.delete(userId);
  } else {
    cosmeticsCache.clear();
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.TGCOCosmetics = {
    renderNameplate,
    renderInlineName,
    renderPlayerCard,
    fetchPlayerCosmetics,
    clearCosmeticsCache,
    COSMETIC_COLORS,
    DEFAULT_COSMETICS
  };
}
