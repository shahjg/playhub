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
  .tgco-border-glow { box-shadow: 0 0 12px var(--tgco-color, rgba(255,255,255,0.3)); }
  .tgco-border-pulse { animation: tgcoBorderPulse 2s ease-in-out infinite; }
  .tgco-border-double { border-style: double; border-width: 4px; }
  .tgco-border-dotted { border-style: dotted; }

  @keyframes tgcoBorderPulse {
    0%, 100% { box-shadow: 0 0 8px var(--tgco-color, rgba(255,255,255,0.3)); }
    50% { box-shadow: 0 0 20px var(--tgco-color, rgba(255,255,255,0.5)); }
  }

  /* Name Effects */
  .tgco-effect-glow { text-shadow: 0 0 8px currentColor; }
  .tgco-effect-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
  .tgco-effect-shimmer { 
    background: linear-gradient(90deg, currentColor, white, currentColor);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: tgcoShimmer 2s linear infinite;
  }
  .tgco-effect-neon { text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor; }

  @keyframes tgcoShimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Entrance Animations */
  @keyframes tgcoFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes tgcoSlide { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes tgcoPop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @keyframes tgcoLightning { 
    0% { opacity: 0; filter: brightness(3); }
    50% { opacity: 1; filter: brightness(3); }
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
    0% { opacity: 0; transform: translateX(-5px); filter: hue-rotate(90deg); }
    25% { opacity: 1; transform: translateX(5px); filter: hue-rotate(180deg); }
    50% { transform: translateX(-3px); filter: hue-rotate(270deg); }
    75% { transform: translateX(3px); filter: hue-rotate(360deg); }
    100% { transform: translateX(0); filter: hue-rotate(0deg); }
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
  const color = COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray;
  const isGradient = c.border_color === 'rainbow';

  // Build classes
  const classes = ['tgco-nameplate'];
  
  if (!isPremium) {
    classes.push('free');
  } else {
    classes.push(`tgco-border-${c.border_style || 'solid'}`);
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

  const styleAttr = isPremium 
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
  const {
    name = 'Player',
    cosmetics = {},
    isPremium = false,
    isHost = false,
    isMe = false,
    showEntrance = false
  } = options;

  const c = isPremium ? { ...DEFAULT_COSMETICS, ...cosmetics } : DEFAULT_COSMETICS;
  const color = isPremium ? (COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray) : 'rgba(255,255,255,0.1)';

  // Card classes
  const cardClasses = ['player-card'];
  if (isMe) cardClasses.push('is-me');
  if (isPremium) cardClasses.push('premium');
  if (showEntrance && isPremium) cardClasses.push(`tgco-entrance-${c.entrance_animation || 'fade'}`);

  // Name classes  
  const nameClasses = ['player-name'];
  if (isPremium && c.name_effect && c.name_effect !== 'none') {
    nameClasses.push(`tgco-effect-${c.name_effect}`);
  }

  const badge = (isPremium && c.badge_icon) ? `<span class="player-badge">${c.badge_icon}</span>` : '';
  const hostBadge = isHost ? '<span class="host-badge">HOST</span>' : '';
  const title = (isPremium && c.title) ? `<span class="player-title">${escapeHtml(c.title)}</span>` : '';

  const borderStyle = isPremium ? `border-color: ${color}; ${c.border_style === 'glow' ? `box-shadow: 0 0 12px ${color};` : ''}` : '';
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
