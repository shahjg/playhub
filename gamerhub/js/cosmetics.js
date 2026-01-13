/**
 * TheGaming.co Cosmetics Renderer v2.0
 * 
 * Now with Level-Based Unlocks!
 * Free users can earn cosmetics by leveling up.
 * Premium unlocks everything instantly.
 * 
 * Usage:
 *   const html = renderNameplate({
 *     name: 'PlayerName',
 *     cosmetics: { badge_icon: '👑', border_color: 'gold', ... },
 *     isPremium: true,
 *     level: 50,
 *     prestige: 0,
 *     showEntrance: true
 *   });
 */

// ========== COLOR MAP ==========
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
  sunset: '#f97316',
  toxic: '#84cc16',
  rainbow: 'linear-gradient(90deg, #f87171, #fbbf24, #34d399, #67e8f9, #c084fc)'
};

// ========== DEFAULT COSMETICS ==========
const DEFAULT_COSMETICS = {
  border_style: 'solid',
  border_color: 'gray',
  badge_icon: null,
  name_effect: 'none',
  title: null,
  entrance_animation: 'fade'
};

// ========== LEVEL REWARDS SYSTEM ==========
// Free users unlock cosmetics by leveling up!
const LEVEL_REWARDS = [
  { level: 1, type: 'color', value: 'gray', name: 'Gray Border', icon: '⬜' },
  { level: 5, type: 'badge', value: '⭐', name: 'Star Badge', icon: '⭐' },
  { level: 10, type: 'entrance', value: 'slide', name: 'Slide Entrance', icon: '→' },
  { level: 15, type: 'color', value: 'emerald', name: 'Emerald Border', icon: '💚' },
  { level: 20, type: 'badge', value: '🔥', name: 'Fire Badge', icon: '🔥' },
  { level: 25, type: 'effect', value: 'shadow', name: 'Shadow Text', icon: '▣' },
  { level: 30, type: 'color', value: 'ruby', name: 'Ruby Border', icon: '❤️' },
  { level: 35, type: 'entrance', value: 'pop', name: 'Pop Entrance', icon: '●' },
  { level: 40, type: 'badge', value: '💎', name: 'Diamond Badge', icon: '💎' },
  { level: 45, type: 'border', value: 'glow', name: 'Glow Border', icon: '✦' },
  { level: 50, type: 'color', value: 'diamond', name: 'Diamond Border', icon: '💠' },
  { level: 55, type: 'effect', value: 'glow', name: 'Glow Text', icon: '✨' },
  { level: 60, type: 'badge', value: '👑', name: 'Crown Badge', icon: '👑' },
  { level: 65, type: 'entrance', value: 'sparkle', name: 'Sparkle Entrance', icon: '✧' },
  { level: 70, type: 'color', value: 'amethyst', name: 'Amethyst Border', icon: '💜' },
  { level: 75, type: 'effect', value: 'shimmer', name: 'Shimmer Text', icon: '≋' },
  { level: 80, type: 'border', value: 'pulse', name: 'Pulse Border', icon: '◉' },
  { level: 85, type: 'badge', value: '🏆', name: 'Trophy Badge', icon: '🏆' },
  { level: 90, type: 'color', value: 'gold', name: 'Gold Border', icon: '💛' },
  { level: 95, type: 'entrance', value: 'lightning', name: 'Lightning Entrance', icon: '⚡' },
  { level: 100, type: 'effect', value: 'neon', name: 'Neon Text', icon: '◈' },
];

// ========== PRESTIGE REWARDS ==========
// Exclusive rewards for prestiging (resetting at max level)
const PRESTIGE_REWARDS = [
  { prestige: 1, type: 'badge', value: '🌟', name: 'P1 - Prestige Star', icon: '🌟' },
  { prestige: 2, type: 'color', value: 'platinum', name: 'P2 - Platinum Border', icon: '🤍' },
  { prestige: 3, type: 'entrance', value: 'fire', name: 'P3 - Fire Entrance', icon: '🔥' },
  { prestige: 4, type: 'effect', value: 'fire', name: 'P4 - Fire Text', icon: '🔥' },
  { prestige: 5, type: 'color', value: 'rainbow', name: 'P5 - Rainbow Border', icon: '🌈' },
  { prestige: 6, type: 'badge', value: '💫', name: 'P6 - Cosmic Badge', icon: '💫' },
  { prestige: 7, type: 'effect', value: 'ice', name: 'P7 - Ice Text', icon: '❄️' },
  { prestige: 8, type: 'entrance', value: 'matrix', name: 'P8 - Matrix Entrance', icon: '▼' },
  { prestige: 9, type: 'effect', value: 'glitch', name: 'P9 - Glitch Text', icon: '⚠' },
  { prestige: 10, type: 'badge', value: '🐉', name: 'P10 - Dragon Badge', icon: '🐉' },
];

// ========== CHECK IF COSMETIC IS UNLOCKED ==========
function isCosmeticUnlocked(type, value, options = {}) {
  const { isPremium = false, level = 1, prestige = 0 } = options;
  
  // Premium unlocks everything
  if (isPremium) return true;
  
  // Check base unlocks (always available)
  if (type === 'color' && value === 'gray') return true;
  if (type === 'border' && value === 'solid') return true;
  if (type === 'effect' && value === 'none') return true;
  if (type === 'entrance' && value === 'fade') return true;
  if (type === 'badge' && !value) return true; // "None" badge
  
  // Check level rewards
  const levelReward = LEVEL_REWARDS.find(r => r.type === type && r.value === value);
  if (levelReward && level >= levelReward.level) return true;
  
  // Check prestige rewards
  const prestigeReward = PRESTIGE_REWARDS.find(r => r.type === type && r.value === value);
  if (prestigeReward && prestige >= prestigeReward.prestige) return true;
  
  return false;
}

// ========== GET REQUIRED LEVEL FOR COSMETIC ==========
function getUnlockRequirement(type, value) {
  const levelReward = LEVEL_REWARDS.find(r => r.type === type && r.value === value);
  if (levelReward) return { type: 'level', value: levelReward.level };
  
  const prestigeReward = PRESTIGE_REWARDS.find(r => r.type === type && r.value === value);
  if (prestigeReward) return { type: 'prestige', value: prestigeReward.prestige };
  
  return { type: 'premium', value: null };
}

// ========== CSS STYLES ==========
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
  .tgco-border-dotted { border-style: dotted; border-width: 3px; }
  .tgco-border-dashed { border-style: dashed; border-width: 2px; }

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
  .tgco-effect-fire {
    text-shadow: 0 0 5px #ff6b35, 0 -5px 10px #ff6b35, 0 -10px 20px #ffa500, 0 -15px 30px #ff4500 !important;
    animation: tgcoFireFlicker 0.5s ease-in-out infinite alternate !important;
  }
  .tgco-effect-ice {
    text-shadow: 0 0 10px #67e8f9, 0 0 20px #06b6d4, 0 0 30px #0891b2 !important;
  }
  .tgco-effect-glitch {
    animation: tgcoGlitchText 0.3s infinite !important;
  }

  @keyframes tgcoShimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes tgcoFireFlicker {
    0% { filter: brightness(1); }
    100% { filter: brightness(1.2); }
  }

  @keyframes tgcoGlitchText {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
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
  @keyframes tgcoMatrix {
    0% { opacity: 0; transform: translateY(-30px); filter: blur(10px) hue-rotate(90deg); }
    100% { opacity: 1; transform: translateY(0); filter: blur(0) hue-rotate(0deg); }
  }
  @keyframes tgcoBounce {
    0% { opacity: 0; transform: scale(0); }
    50% { transform: scale(1.2); }
    70% { transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }

  .tgco-entrance-fade { animation: tgcoFade 0.5s ease both; }
  .tgco-entrance-slide { animation: tgcoSlide 0.5s ease both; }
  .tgco-entrance-pop { animation: tgcoPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) both; }
  .tgco-entrance-lightning { animation: tgcoLightning 0.4s ease both; }
  .tgco-entrance-fire { animation: tgcoFire 0.5s ease both; }
  .tgco-entrance-sparkle { animation: tgcoSparkle 0.6s ease both; }
  .tgco-entrance-smoke { animation: tgcoSmoke 0.6s ease both; }
  .tgco-entrance-glitch { animation: tgcoGlitch 0.5s ease both; }
  .tgco-entrance-matrix { animation: tgcoMatrix 0.6s ease both; }
  .tgco-entrance-bounce { animation: tgcoBounce 0.6s ease both; }

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

  /* ========== LEADERBOARD ITEMS ========== */
  .lb-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    gap: 12px;
    transition: all 0.3s ease;
  }

  .lb-item.is-me {
    background: rgba(79, 172, 254, 0.1);
    border-color: rgba(79, 172, 254, 0.3);
  }

  .lb-rank {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.2rem;
    min-width: 28px;
    color: rgba(255, 255, 255, 0.5);
  }

  .lb-name {
    flex: 1;
    font-weight: 600;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lb-name-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
    min-width: 0;
  }

  .lb-name-wrapper .tgco-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lb-title {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.45);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lb-score {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem;
    color: var(--accent, #14b8a6);
  }

  /* Rank styling for non-premium players */
  .lb-item.rank-1 { border-color: #fbbf24; background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), transparent); }
  .lb-item.rank-2 { border-color: #94a3b8; background: linear-gradient(135deg, rgba(148, 163, 184, 0.15), transparent); }
  .lb-item.rank-3 { border-color: #cd7c32; background: linear-gradient(135deg, rgba(205, 124, 50, 0.15), transparent); }

  .lb-item.rank-1 .lb-rank { color: #fbbf24; }
  .lb-item.rank-2 .lb-rank { color: #94a3b8; }
  .lb-item.rank-3 .lb-rank { color: #cd7c32; }

  /* Premium border colors for leaderboard */
  .lb-item.rainbow-border,
  .mini-lb-item.rainbow-border,
  .winner-card.rainbow-border {
    border-color: transparent !important;
    background: 
      linear-gradient(rgba(15, 15, 25, 0.95), rgba(15, 15, 25, 0.95)) padding-box,
      linear-gradient(90deg, #f87171, #fbbf24, #34d399, #67e8f9, #c084fc, #f87171) border-box;
    background-size: 100% 100%, 300% 100%;
    animation: tgcoRainbow 3s linear infinite;
  }

  .lb-item.gold-border, .mini-lb-item.gold-border, .winner-card.gold-border { 
    border-color: #fbbf24 !important; 
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.12), transparent); 
  }
  .lb-item.diamond-border, .mini-lb-item.diamond-border, .winner-card.diamond-border { 
    border-color: #67e8f9 !important; 
    background: linear-gradient(135deg, rgba(103, 232, 249, 0.12), transparent); 
  }
  .lb-item.ruby-border, .mini-lb-item.ruby-border, .winner-card.ruby-border { 
    border-color: #f87171 !important; 
    background: linear-gradient(135deg, rgba(248, 113, 113, 0.12), transparent); 
  }
  .lb-item.emerald-border, .mini-lb-item.emerald-border, .winner-card.emerald-border { 
    border-color: #34d399 !important; 
    background: linear-gradient(135deg, rgba(52, 211, 153, 0.12), transparent); 
  }
  .lb-item.amethyst-border, .mini-lb-item.amethyst-border, .winner-card.amethyst-border { 
    border-color: #c084fc !important; 
    background: linear-gradient(135deg, rgba(192, 132, 252, 0.12), transparent); 
  }
  .lb-item.platinum-border, .mini-lb-item.platinum-border, .winner-card.platinum-border { 
    border-color: #e2e8f0 !important; 
    background: linear-gradient(135deg, rgba(226, 232, 240, 0.12), transparent); 
  }
  .lb-item.obsidian-border, .mini-lb-item.obsidian-border, .winner-card.obsidian-border { 
    border-color: #1e1b4b !important; 
    background: linear-gradient(135deg, rgba(30, 27, 75, 0.25), transparent); 
  }
  .lb-item.rose-border, .mini-lb-item.rose-border, .winner-card.rose-border { 
    border-color: #fb7185 !important; 
    background: linear-gradient(135deg, rgba(251, 113, 133, 0.12), transparent); 
  }
  .lb-item.sunset-border, .mini-lb-item.sunset-border, .winner-card.sunset-border { 
    border-color: #f97316 !important; 
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), transparent); 
  }
  .lb-item.toxic-border, .mini-lb-item.toxic-border, .winner-card.toxic-border { 
    border-color: #84cc16 !important; 
    background: linear-gradient(135deg, rgba(132, 204, 22, 0.12), transparent); 
  }
  .lb-item.gray-border, .mini-lb-item.gray-border, .winner-card.gray-border { 
    border-color: #6b7280 !important; 
  }

  /* ========== MINI LEADERBOARD (during gameplay) ========== */
  .mini-lb-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    gap: 8px;
    transition: all 0.3s ease;
  }

  .mini-lb-item.is-me {
    background: rgba(79, 172, 254, 0.1);
    border-color: rgba(79, 172, 254, 0.3);
  }

  .mini-lb-item.rank-1 { border-color: #fbbf24; }

  .mini-lb-rank {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1rem;
    min-width: 20px;
    color: rgba(255, 255, 255, 0.5);
  }

  .mini-lb-name {
    flex: 1;
    font-weight: 600;
    font-size: 0.85rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mini-lb-name-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
    overflow: hidden;
    min-width: 0;
  }

  .mini-lb-name-wrapper .tgco-name {
    font-size: 0.85rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mini-lb-title {
    font-size: 0.55rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.4);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mini-lb-score {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1rem;
    color: var(--accent, #14b8a6);
  }

  /* ========== WINNER CARD (game over) ========== */
  .winner-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 32px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 3px solid #fbbf24;
    gap: 8px;
    text-align: center;
  }

  .winner-crown {
    font-size: 2.5rem;
    margin-bottom: 4px;
  }

  .winner-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2rem;
    letter-spacing: 2px;
    color: #fbbf24;
  }

  .winner-score {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .winner-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.5);
    margin-top: -4px;
  }

  /* ========== GLOBAL LEADERBOARD PAGE ========== */
  .global-lb-item {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    gap: 16px;
    transition: all 0.3s ease;
  }

  .global-lb-item:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(4px);
  }

  .global-lb-item.rainbow-border { 
    border-color: transparent !important;
    background: 
      linear-gradient(rgba(15, 15, 25, 0.95), rgba(15, 15, 25, 0.95)) padding-box,
      linear-gradient(90deg, #f87171, #fbbf24, #34d399, #67e8f9, #c084fc, #f87171) border-box;
    background-size: 100% 100%, 300% 100%;
    animation: tgcoRainbow 3s linear infinite;
  }

  .global-lb-item.gold-border { border-color: #fbbf24 !important; background: linear-gradient(135deg, rgba(251, 191, 36, 0.12), transparent); }
  .global-lb-item.diamond-border { border-color: #67e8f9 !important; background: linear-gradient(135deg, rgba(103, 232, 249, 0.12), transparent); }
  .global-lb-item.ruby-border { border-color: #f87171 !important; background: linear-gradient(135deg, rgba(248, 113, 113, 0.12), transparent); }
  .global-lb-item.emerald-border { border-color: #34d399 !important; background: linear-gradient(135deg, rgba(52, 211, 153, 0.12), transparent); }
  .global-lb-item.amethyst-border { border-color: #c084fc !important; background: linear-gradient(135deg, rgba(192, 132, 252, 0.12), transparent); }
  .global-lb-item.platinum-border { border-color: #e2e8f0 !important; background: linear-gradient(135deg, rgba(226, 232, 240, 0.12), transparent); }
  .global-lb-item.obsidian-border { border-color: #1e1b4b !important; background: linear-gradient(135deg, rgba(30, 27, 75, 0.25), transparent); }
  .global-lb-item.rose-border { border-color: #fb7185 !important; background: linear-gradient(135deg, rgba(251, 113, 133, 0.12), transparent); }
  .global-lb-item.sunset-border { border-color: #f97316 !important; background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), transparent); }
  .global-lb-item.toxic-border { border-color: #84cc16 !important; background: linear-gradient(135deg, rgba(132, 204, 22, 0.12), transparent); }

  .global-lb-rank {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.5rem;
    min-width: 40px;
    color: rgba(255, 255, 255, 0.5);
  }

  .global-lb-rank.top-1 { color: #fbbf24; }
  .global-lb-rank.top-2 { color: #94a3b8; }
  .global-lb-rank.top-3 { color: #cd7c32; }

  .global-lb-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .global-lb-name {
    font-weight: 600;
    font-size: 1.1rem;
  }

  .global-lb-stats {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .global-lb-title {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.45);
  }

  .global-lb-score {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.3rem;
    color: var(--accent, #14b8a6);
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
 * Now supports level-based unlocks!
 */
function renderNameplate(options) {
  injectCosmeticsStyles();

  const {
    name = 'Player',
    cosmetics = {},
    isPremium = false,
    level = 1,
    prestige = 0,
    showEntrance = false,
    mode = 'default'
  } = options;

  // Determine which cosmetics are actually usable
  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  // Only apply cosmetics that are unlocked
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) {
    c.badge_icon = cosmetics.badge_icon;
  }
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) {
    c.border_color = cosmetics.border_color;
  }
  if (cosmetics.border_style && isCosmeticUnlocked('border', cosmetics.border_style, unlockOpts)) {
    c.border_style = cosmetics.border_style;
  }
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) {
    c.name_effect = cosmetics.name_effect;
  }
  if (cosmetics.entrance_animation && isCosmeticUnlocked('entrance', cosmetics.entrance_animation, unlockOpts)) {
    c.entrance_animation = cosmetics.entrance_animation;
  }
  // Title is premium-only
  if (isPremium && cosmetics.title) {
    c.title = cosmetics.title;
  }

  // Check if user has ANY unlocked cosmetics
  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.border_style !== 'solid' || 
                       c.name_effect !== 'none' || c.title;

  // Get color
  const isRainbow = c.border_color === 'rainbow';
  const color = isRainbow ? '#c084fc' : (COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray);

  // Build classes
  const classes = ['tgco-nameplate'];
  
  if (!hasCosmetics) {
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
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') {
    nameClasses.push(`tgco-effect-${c.name_effect}`);
  }

  // Build HTML
  const badgeHtml = (hasCosmetics && c.badge_icon) 
    ? `<span class="tgco-badge">${escapeHtml(c.badge_icon)}</span>` 
    : '';

  const titleHtml = (hasCosmetics && c.title) 
    ? `<span class="tgco-title">${escapeHtml(c.title)}</span>` 
    : '';

  const styleAttr = hasCosmetics && !isRainbow
    ? `style="--tgco-color: ${color}; border-color: ${color};"` 
    : '';

  const nameStyle = hasCosmetics ? `style="color: ${color};"` : '';

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
 */
function renderInlineName(options) {
  injectCosmeticsStyles();

  const {
    name = 'Player',
    cosmetics = {},
    isPremium = false,
    level = 1,
    prestige = 0
  } = options;

  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) {
    c.badge_icon = cosmetics.badge_icon;
  }
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) {
    c.border_color = cosmetics.border_color;
  }
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) {
    c.name_effect = cosmetics.name_effect;
  }

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none';
  const color = COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray;

  const nameClasses = ['tgco-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') {
    nameClasses.push(`tgco-effect-${c.name_effect}`);
  }

  const badge = (hasCosmetics && c.badge_icon) ? `${c.badge_icon} ` : '';
  const nameStyle = hasCosmetics ? `style="color: ${color};"` : '';

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
    level = 1,
    prestige = 0,
    isHost = false,
    isMe = false,
    showEntrance = false
  } = options;

  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) {
    c.badge_icon = cosmetics.badge_icon;
  }
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) {
    c.border_color = cosmetics.border_color;
  }
  if (cosmetics.border_style && isCosmeticUnlocked('border', cosmetics.border_style, unlockOpts)) {
    c.border_style = cosmetics.border_style;
  }
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) {
    c.name_effect = cosmetics.name_effect;
  }
  if (cosmetics.entrance_animation && isCosmeticUnlocked('entrance', cosmetics.entrance_animation, unlockOpts)) {
    c.entrance_animation = cosmetics.entrance_animation;
  }
  if (isPremium && cosmetics.title) {
    c.title = cosmetics.title;
  }

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.border_style !== 'solid' || 
                       c.name_effect !== 'none' || c.title;
  const isRainbow = c.border_color === 'rainbow';
  const color = isRainbow ? '#c084fc' : (hasCosmetics ? (COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray) : 'rgba(255,255,255,0.1)');

  // Card classes
  const cardClasses = ['player-card'];
  if (isMe) cardClasses.push('is-me');
  if (hasCosmetics) cardClasses.push('premium');
  if (isRainbow && hasCosmetics) cardClasses.push('rainbow-border');
  if (showEntrance && hasCosmetics) cardClasses.push(`tgco-entrance-${c.entrance_animation || 'fade'}`);

  // Name classes  
  const nameClasses = ['player-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') {
    nameClasses.push(`tgco-effect-${c.name_effect}`);
  }

  const badge = (hasCosmetics && c.badge_icon) ? `<span class="player-badge">${c.badge_icon}</span>` : '';
  const hostBadge = isHost ? '<span class="host-badge">HOST</span>' : '';
  const title = (hasCosmetics && c.title) ? `<span class="player-title">${escapeHtml(c.title)}</span>` : '';

  // Border style (skip for rainbow - handled by class)
  let borderStyle = '';
  if (hasCosmetics && !isRainbow) {
    borderStyle = `border-color: ${color};`;
    if (c.border_style === 'glow') borderStyle += ` box-shadow: 0 0 15px ${color}, 0 0 30px ${color};`;
    if (c.border_style === 'pulse') borderStyle += ` --tgco-color: ${color};`;
  }
  
  const nameStyle = hasCosmetics ? `color: ${color};` : '';

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
 * Render a leaderboard item
 */
function renderLeaderboardItem(options) {
  injectCosmeticsStyles();

  const {
    name = 'Player',
    score = 0,
    rank = 1,
    cosmetics = {},
    isPremium = false,
    level = 1,
    prestige = 0,
    isMe = false,
    showRankStyling = true
  } = options;

  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) {
    c.badge_icon = cosmetics.badge_icon;
  }
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) {
    c.border_color = cosmetics.border_color;
  }
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) {
    c.name_effect = cosmetics.name_effect;
  }
  if (isPremium && cosmetics.title) {
    c.title = cosmetics.title;
  }

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title;
  const color = COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray;
  
  const classes = ['lb-item'];
  if (isMe) classes.push('is-me');
  
  if (hasCosmetics && c.border_color) {
    classes.push(`${c.border_color}-border`);
  } else if (showRankStyling) {
    if (rank === 1) classes.push('rank-1');
    else if (rank === 2) classes.push('rank-2');
    else if (rank === 3) classes.push('rank-3');
  }

  // Build name with effects
  const nameClasses = ['tgco-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') {
    nameClasses.push(`tgco-effect-${c.name_effect}`);
  }
  const badge = (hasCosmetics && c.badge_icon) ? `${c.badge_icon} ` : '';
  const nameStyle = hasCosmetics ? `color: ${color};` : '';
  const title = (hasCosmetics && c.title) ? `<span class="lb-title">${escapeHtml(c.title)}</span>` : '';

  return `
    <div class="${classes.join(' ')}">
      <span class="lb-rank">${rank}</span>
      <div class="lb-name-wrapper">
        <span class="${nameClasses.join(' ')}" style="${nameStyle}">${badge}${escapeHtml(name)}</span>
        ${title}
      </div>
      <span class="lb-score">${score.toLocaleString()}</span>
    </div>
  `.trim();
}

/**
 * Render a mini leaderboard item (compact)
 */
function renderMiniLeaderboardItem(options) {
  injectCosmeticsStyles();

  const {
    name = 'Player',
    score = 0,
    rank = 1,
    cosmetics = {},
    isPremium = false,
    level = 1,
    prestige = 0,
    isMe = false
  } = options;

  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) {
    c.badge_icon = cosmetics.badge_icon;
  }
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) {
    c.border_color = cosmetics.border_color;
  }
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) {
    c.name_effect = cosmetics.name_effect;
  }
  if (isPremium && cosmetics.title) {
    c.title = cosmetics.title;
  }

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title;
  const color = COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray;
  
  const classes = ['mini-lb-item'];
  if (isMe) classes.push('is-me');
  if (rank === 1 && !hasCosmetics) classes.push('rank-1');
  if (hasCosmetics && c.border_color) classes.push(`${c.border_color}-border`);

  const nameClasses = ['tgco-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') {
    nameClasses.push(`tgco-effect-${c.name_effect}`);
  }
  const badge = (hasCosmetics && c.badge_icon) ? `${c.badge_icon} ` : '';
  const nameStyle = hasCosmetics ? `color: ${color};` : '';
  const title = (hasCosmetics && c.title) ? `<span class="mini-lb-title">${escapeHtml(c.title)}</span>` : '';

  return `
    <div class="${classes.join(' ')}">
      <span class="mini-lb-rank">${rank}</span>
      <div class="mini-lb-name-wrapper">
        <span class="${nameClasses.join(' ')}" style="${nameStyle}">${badge}${escapeHtml(name)}</span>
        ${title}
      </div>
      <span class="mini-lb-score">${score.toLocaleString()}</span>
    </div>
  `.trim();
}

/**
 * Render a winner card (for game over screens)
 */
function renderWinnerCard(options) {
  injectCosmeticsStyles();

  const {
    name = 'Player',
    score = 0,
    cosmetics = {},
    isPremium = false,
    level = 1,
    prestige = 0,
    showCrown = true
  } = options;

  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) {
    c.badge_icon = cosmetics.badge_icon;
  }
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) {
    c.border_color = cosmetics.border_color;
  }
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) {
    c.name_effect = cosmetics.name_effect;
  }
  if (isPremium && cosmetics.title) {
    c.title = cosmetics.title;
  }

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title;
  const color = COSMETIC_COLORS[c.border_color] || '#fbbf24';
  
  const classes = ['winner-card'];
  if (hasCosmetics && c.border_color) {
    classes.push(`${c.border_color}-border`);
  }

  const nameClasses = ['winner-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') {
    nameClasses.push(`tgco-effect-${c.name_effect}`);
  }

  const badge = (hasCosmetics && c.badge_icon) ? c.badge_icon + ' ' : '';
  const title = (hasCosmetics && c.title) ? `<div class="winner-title">${escapeHtml(c.title)}</div>` : '';
  const crown = showCrown ? '<div class="winner-crown">👑</div>' : '';
  const nameStyle = hasCosmetics ? `color: ${color};` : '';

  return `
    <div class="${classes.join(' ')}">
      ${crown}
      <div class="${nameClasses.join(' ')}" style="${nameStyle}">${badge}${escapeHtml(name)}</div>
      ${title}
      <div class="winner-score">${score.toLocaleString()} points</div>
    </div>
  `.trim();
}

/**
 * Render a global leaderboard item
 */
function renderGlobalLeaderboardItem(options) {
  injectCosmeticsStyles();

  const {
    name = 'Player',
    score = 0,
    rank = 1,
    stats = '',
    cosmetics = {},
    isPremium = false,
    level = 1,
    prestige = 0
  } = options;

  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) {
    c.badge_icon = cosmetics.badge_icon;
  }
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) {
    c.border_color = cosmetics.border_color;
  }
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) {
    c.name_effect = cosmetics.name_effect;
  }
  if (isPremium && cosmetics.title) {
    c.title = cosmetics.title;
  }

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title;
  const color = COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray;
  
  const classes = ['global-lb-item'];
  if (hasCosmetics && c.border_color) classes.push(`${c.border_color}-border`);

  const rankClass = rank <= 3 ? `top-${rank}` : '';
  
  const nameClasses = ['tgco-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') {
    nameClasses.push(`tgco-effect-${c.name_effect}`);
  }
  const badge = (hasCosmetics && c.badge_icon) ? `${c.badge_icon} ` : '';
  const nameStyle = hasCosmetics ? `color: ${color};` : '';
  const title = (hasCosmetics && c.title) ? `<div class="global-lb-title">${escapeHtml(c.title)}</div>` : '';

  return `
    <div class="${classes.join(' ')}">
      <span class="global-lb-rank ${rankClass}">#${rank}</span>
      <div class="global-lb-info">
        <div class="global-lb-name"><span class="${nameClasses.join(' ')}" style="${nameStyle}">${badge}${escapeHtml(name)}</span></div>
        ${title}
        ${stats ? `<div class="global-lb-stats">${escapeHtml(stats)}</div>` : ''}
      </div>
      <span class="global-lb-score">${score.toLocaleString()}</span>
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
 */
async function fetchPlayerCosmetics(userId) {
  if (cosmeticsCache.has(userId)) {
    return cosmeticsCache.get(userId);
  }

  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('display_name, account_type, cosmetics, xp, prestige')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Calculate level from XP
    const level = getLevelFromXP(data.xp || 0);

    const result = {
      name: data.display_name || 'Player',
      isPremium: data.account_type === 'premium',
      cosmetics: data.cosmetics || DEFAULT_COSMETICS,
      level: level,
      prestige: data.prestige || 0
    };

    cosmeticsCache.set(userId, result);
    return result;
  } catch (e) {
    console.error('Error fetching cosmetics:', e);
    return {
      name: 'Player',
      isPremium: false,
      cosmetics: DEFAULT_COSMETICS,
      level: 1,
      prestige: 0
    };
  }
}

// Level thresholds (must match profile.html)
const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000,
  26000, 30500, 35500, 41000, 47000, 54000, 62000, 71000, 81000, 92000,
  104000, 117000, 131000, 146000, 162000, 180000, 199000, 220000, 242000, 266000,
  292000, 320000, 350000, 382000, 416000, 452000, 490000, 530000, 572000, 616000,
  665000, 718000, 775000, 836000, 901000, 970000, 1043000, 1120000, 1201000, 1286000,
  1375000, 1468000, 1565000, 1666000, 1771000, 1880000, 1993000, 2110000, 2231000, 2356000,
  2485000, 2618000, 2755000, 2896000, 3041000, 3190000, 3343000, 3500000, 3661000, 3826000,
  3995000, 4168000, 4345000, 4526000, 4711000, 4900000, 5093000, 5290000, 5491000, 5696000,
  5905000, 6118000, 6335000, 6556000, 6781000, 7010000, 7243000, 7480000, 7721000, 7966000
];

function getLevelFromXP(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

/**
 * Clear cosmetics cache
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
    renderLeaderboardItem,
    renderMiniLeaderboardItem,
    renderWinnerCard,
    renderGlobalLeaderboardItem,
    fetchPlayerCosmetics,
    clearCosmeticsCache,
    isCosmeticUnlocked,
    getUnlockRequirement,
    COSMETIC_COLORS,
    DEFAULT_COSMETICS,
    LEVEL_REWARDS,
    PRESTIGE_REWARDS,
    LEVEL_THRESHOLDS,
    getLevelFromXP
  };
}
