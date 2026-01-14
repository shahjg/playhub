/**
 * TheGaming.co Cosmetics Renderer v2.6
 * 
 * Now with Level-Based Unlocks, Background Patterns, Background Colors & Podium Styles!
 * Free users can earn cosmetics by leveling up.
 * Premium unlocks everything instantly.
 * 
 * Usage:
 *   const html = renderNameplate({
 *     name: 'PlayerName',
 *     cosmetics: { badge_icon: '👑', border_color: 'gold', background_color: 'navy', ... },
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

// ========== BACKGROUND COLORS ==========
const BG_COLORS = {
  default: 'rgba(255, 255, 255, 0.03)',
  midnight: 'linear-gradient(135deg, #0f0f19, #1a1a2e)',
  charcoal: 'linear-gradient(135deg, #1f2937, #374151)',
  navy: 'linear-gradient(135deg, #1e3a5f, #0f172a)',
  wine: 'linear-gradient(135deg, #4a1942, #2d1326)',
  forest: 'linear-gradient(135deg, #14532d, #052e16)',
  royal: 'linear-gradient(135deg, #312e81, #1e1b4b)',
  ember: 'linear-gradient(135deg, #7c2d12, #431407)',
  ocean: 'linear-gradient(135deg, #164e63, #083344)',
  'sunset-bg': 'linear-gradient(135deg, #7c2d12, #581c87)',
  aurora: 'linear-gradient(135deg, #14532d, #164e63, #312e81)',
  galaxy: 'linear-gradient(135deg, #0f0f19, #312e81, #581c87)'
};

// ========== BACKGROUND PATTERNS ==========
const BACKGROUND_PATTERNS = {
  none: { name: 'None', css: 'none', size: null },
  // Geometric
  dots: { name: 'Dots', css: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', size: '10px 10px' },
  grid: { name: 'Grid', css: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', size: '20px 20px' },
  lines: { name: 'Lines', css: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 11px)', size: null },
  honeycomb: { name: 'Honeycomb', css: 'radial-gradient(circle farthest-side at 0% 50%, transparent 47%, rgba(255,255,255,0.08) 49%, transparent 51%), radial-gradient(circle farthest-side at 100% 50%, transparent 47%, rgba(255,255,255,0.08) 49%, transparent 51%)', size: '30px 52px' },
  diagonal: { name: 'Diagonal', css: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)', size: null },
  // Camo
  camo: { name: 'Military', css: 'radial-gradient(ellipse at 20% 30%, rgba(34,85,51,0.5) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(85,107,47,0.4) 0%, transparent 40%), radial-gradient(ellipse at 40% 80%, rgba(47,79,47,0.5) 0%, transparent 45%)', size: '100px 100px' },
  snowcamo: { name: 'Snow Camo', css: 'radial-gradient(ellipse at 25% 35%, rgba(200,200,210,0.3) 0%, transparent 45%), radial-gradient(ellipse at 65% 55%, rgba(180,180,195,0.25) 0%, transparent 40%), radial-gradient(ellipse at 45% 75%, rgba(220,220,230,0.3) 0%, transparent 50%)', size: '80px 80px' },
  digitalcamo: { name: 'Digital', css: 'linear-gradient(90deg, rgba(60,60,60,0.4) 25%, transparent 25%), linear-gradient(90deg, transparent 75%, rgba(80,80,80,0.3) 75%), linear-gradient(rgba(50,50,50,0.35) 25%, transparent 25%), linear-gradient(transparent 75%, rgba(70,70,70,0.3) 75%)', size: '8px 8px' },
  // Animal
  zebra: { name: 'Zebra', css: 'repeating-linear-gradient(75deg, transparent, transparent 15px, rgba(255,255,255,0.08) 15px, rgba(255,255,255,0.08) 30px)', size: null },
  leopard: { name: 'Leopard', css: 'radial-gradient(ellipse at 30% 30%, rgba(139,90,43,0.3) 0%, transparent 35%), radial-gradient(ellipse at 70% 70%, rgba(139,90,43,0.25) 0%, transparent 30%), radial-gradient(ellipse at 50% 50%, rgba(101,67,33,0.2) 0%, transparent 40%)', size: '60px 60px' },
  tiger: { name: 'Tiger', css: 'repeating-linear-gradient(80deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 16px)', size: null },
  // Premium
  carbonfiber: { name: 'Carbon Fiber', css: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.3), rgba(0,0,0,0.3) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.3), rgba(0,0,0,0.3) 1px, transparent 1px, transparent 4px)', size: '8px 8px' },
  brushedmetal: { name: 'Brushed Metal', css: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)', size: null },
  circuit: { name: 'Circuit', css: 'linear-gradient(90deg, transparent 49%, rgba(0,255,136,0.1) 49%, rgba(0,255,136,0.1) 51%, transparent 51%), linear-gradient(transparent 49%, rgba(0,255,136,0.1) 49%, rgba(0,255,136,0.1) 51%, transparent 51%)', size: '30px 30px' },
  starfield: { name: 'Starfield', css: 'radial-gradient(1px 1px at 10% 20%, white, transparent), radial-gradient(1px 1px at 30% 60%, white, transparent), radial-gradient(1px 1px at 50% 30%, white, transparent), radial-gradient(1px 1px at 70% 80%, white, transparent), radial-gradient(1px 1px at 90% 40%, white, transparent)', size: '100px 100px' },
  // Animated (Premium)
  holographic: { name: 'Holographic', css: 'linear-gradient(135deg, rgba(255,0,128,0.1), rgba(0,255,255,0.1), rgba(255,255,0,0.1), rgba(128,0,255,0.1))', size: '400% 400%', animated: true },
  matrix: { name: 'Matrix', css: 'linear-gradient(180deg, transparent, rgba(0,255,65,0.03))', size: '100% 200%', animated: true },
  fire: { name: 'Fire', css: 'linear-gradient(180deg, rgba(255,68,0,0.15), rgba(255,165,0,0.1), transparent)', size: '100% 200%', animated: true },
  pulse: { name: 'Pulse', css: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.2), transparent 70%)', size: '200% 200%', animated: true }
};

// ========== PODIUM STYLES ==========
const PODIUM_STYLES = {
  default: { name: 'Classic', description: 'Traditional gold/silver/bronze' },
  flames: { name: 'Flames', description: 'Fiery animated border' },
  neon: { name: 'Neon', description: 'Bright neon glow' },
  crystal: { name: 'Crystal', description: 'Icy diamond shimmer' },
  cosmic: { name: 'Cosmic', description: 'Starry space theme' },
  holographic: { name: 'Holographic', description: 'Rainbow shifting colors' },
  royal: { name: 'Royal', description: 'Elegant gold trim' },
  cyber: { name: 'Cyber', description: 'Glitchy tech aesthetic' },
  nature: { name: 'Nature', description: 'Earthy organic feel' },
  void: { name: 'Void', description: 'Dark mysterious aura' }
};

// ========== DEFAULT COSMETICS ==========
const DEFAULT_COSMETICS = {
  border_style: 'solid',
  border_color: 'gray',
  badge_icon: null,
  name_effect: 'none',
  title: null,
  entrance_animation: 'fade',
  background_pattern: 'none',
  background_color: 'default',
  podium_style: 'default'
};

// ========== LEVEL REWARDS SYSTEM ==========
// Free users unlock cosmetics by leveling up!
const LEVEL_REWARDS = [
  { level: 1, type: 'color', value: 'gray', name: 'Gray Border', icon: '⬜' },
  { level: 5, type: 'badge', value: '⭐', name: 'Star Badge', icon: '⭐' },
  { level: 8, type: 'background', value: 'dots', name: 'Dots Pattern', icon: '⚬' },
  { level: 10, type: 'entrance', value: 'slide', name: 'Slide Entrance', icon: '→' },
  { level: 15, type: 'color', value: 'emerald', name: 'Emerald Border', icon: '💚' },
  { level: 18, type: 'background', value: 'grid', name: 'Grid Pattern', icon: '▦' },
  { level: 20, type: 'badge', value: '🔥', name: 'Fire Badge', icon: '🔥' },
  { level: 22, type: 'bgColor', value: 'charcoal', name: 'Charcoal BG', icon: '⬛' },
  { level: 25, type: 'effect', value: 'shadow', name: 'Shadow Text', icon: '▣' },
  { level: 28, type: 'background', value: 'lines', name: 'Lines Pattern', icon: '≡' },
  { level: 30, type: 'color', value: 'ruby', name: 'Ruby Border', icon: '❤️' },
  { level: 32, type: 'background', value: 'zebra', name: 'Zebra Pattern', icon: '🦓' },
  { level: 35, type: 'entrance', value: 'pop', name: 'Pop Entrance', icon: '●' },
  { level: 37, type: 'bgColor', value: 'navy', name: 'Navy BG', icon: '🔵' },
  { level: 38, type: 'background', value: 'camo', name: 'Camo Pattern', icon: '🌲' },
  { level: 40, type: 'badge', value: '💎', name: 'Diamond Badge', icon: '💎' },
  { level: 42, type: 'background', value: 'diagonal', name: 'Diagonal Pattern', icon: '╱' },
  { level: 45, type: 'border', value: 'glow', name: 'Glow Border', icon: '✦' },
  { level: 47, type: 'bgColor', value: 'forest', name: 'Forest BG', icon: '🌲' },
  { level: 48, type: 'background', value: 'honeycomb', name: 'Honeycomb Pattern', icon: '⬡' },
  { level: 50, type: 'color', value: 'diamond', name: 'Diamond Border', icon: '💠' },
  { level: 52, type: 'background', value: 'leopard', name: 'Leopard Pattern', icon: '🐆' },
  { level: 55, type: 'effect', value: 'glow', name: 'Glow Text', icon: '✨' },
  { level: 57, type: 'bgColor', value: 'wine', name: 'Wine BG', icon: '🍷' },
  { level: 58, type: 'background', value: 'tiger', name: 'Tiger Pattern', icon: '🐯' },
  { level: 60, type: 'badge', value: '👑', name: 'Crown Badge', icon: '👑' },
  { level: 62, type: 'background', value: 'carbonfiber', name: 'Carbon Fiber', icon: '⬛' },
  { level: 65, type: 'entrance', value: 'sparkle', name: 'Sparkle Entrance', icon: '✧' },
  { level: 67, type: 'bgColor', value: 'ember', name: 'Ember BG', icon: '🔥' },
  { level: 68, type: 'background', value: 'snowcamo', name: 'Snow Camo', icon: '❄️' },
  { level: 70, type: 'color', value: 'amethyst', name: 'Amethyst Border', icon: '💜' },
  { level: 72, type: 'background', value: 'digitalcamo', name: 'Digital Camo', icon: '🔲' },
  { level: 75, type: 'effect', value: 'shimmer', name: 'Shimmer Text', icon: '≋' },
  { level: 77, type: 'bgColor', value: 'ocean', name: 'Ocean BG', icon: '🌊' },
  { level: 78, type: 'background', value: 'brushedmetal', name: 'Brushed Metal', icon: '🔩' },
  { level: 80, type: 'border', value: 'pulse', name: 'Pulse Border', icon: '◉' },
  { level: 82, type: 'background', value: 'circuit', name: 'Circuit Pattern', icon: '🔌' },
  { level: 85, type: 'badge', value: '🏆', name: 'Trophy Badge', icon: '🏆' },
  { level: 87, type: 'bgColor', value: 'midnight', name: 'Midnight BG', icon: '🌙' },
  { level: 88, type: 'background', value: 'starfield', name: 'Starfield', icon: '⭐' },
  { level: 90, type: 'color', value: 'gold', name: 'Gold Border', icon: '💛' },
  { level: 95, type: 'entrance', value: 'lightning', name: 'Lightning Entrance', icon: '⚡' },
  { level: 100, type: 'effect', value: 'neon', name: 'Neon Text', icon: '◈' },
];

// ========== PRESTIGE REWARDS ==========
// Exclusive rewards for prestiging (resetting at max level)
const PRESTIGE_REWARDS = [
  { prestige: 1, type: 'badge', value: '🌟', name: 'P1 - Prestige Star', icon: '🌟' },
  { prestige: 1, type: 'background', value: 'holographic', name: 'P1 - Holographic BG', icon: '🌈' },
  { prestige: 1, type: 'bgColor', value: 'royal', name: 'P1 - Royal BG', icon: '👑' },
  { prestige: 2, type: 'color', value: 'platinum', name: 'P2 - Platinum Border', icon: '🤍' },
  { prestige: 2, type: 'podium', value: 'neon', name: 'P2 - Neon Podium', icon: '💡' },
  { prestige: 2, type: 'bgColor', value: 'aurora', name: 'P2 - Aurora BG', icon: '🌌' },
  { prestige: 3, type: 'entrance', value: 'fire', name: 'P3 - Fire Entrance', icon: '🔥' },
  { prestige: 3, type: 'background', value: 'fire', name: 'P3 - Fire BG', icon: '🔥' },
  { prestige: 4, type: 'effect', value: 'fire', name: 'P4 - Fire Text', icon: '🔥' },
  { prestige: 4, type: 'podium', value: 'flames', name: 'P4 - Flames Podium', icon: '🔥' },
  { prestige: 4, type: 'bgColor', value: 'galaxy', name: 'P4 - Galaxy BG', icon: '🌌' },
  { prestige: 5, type: 'color', value: 'rainbow', name: 'P5 - Rainbow Border', icon: '🌈' },
  { prestige: 5, type: 'podium', value: 'holographic', name: 'P5 - Holographic Podium', icon: '🌈' },
  { prestige: 5, type: 'bgColor', value: 'sunset-bg', name: 'P5 - Sunset BG', icon: '🌅' },
  { prestige: 6, type: 'badge', value: '💫', name: 'P6 - Cosmic Badge', icon: '💫' },
  { prestige: 6, type: 'background', value: 'matrix', name: 'P6 - Matrix BG', icon: '▼' },
  { prestige: 7, type: 'effect', value: 'ice', name: 'P7 - Ice Text', icon: '❄️' },
  { prestige: 7, type: 'podium', value: 'crystal', name: 'P7 - Crystal Podium', icon: '💎' },
  { prestige: 8, type: 'entrance', value: 'matrix', name: 'P8 - Matrix Entrance', icon: '▼' },
  { prestige: 8, type: 'podium', value: 'cyber', name: 'P8 - Cyber Podium', icon: '🤖' },
  { prestige: 9, type: 'effect', value: 'glitch', name: 'P9 - Glitch Text', icon: '⚠' },
  { prestige: 9, type: 'background', value: 'pulse', name: 'P9 - Pulse BG', icon: '◉' },
  { prestige: 10, type: 'badge', value: '🐉', name: 'P10 - Dragon Badge', icon: '🐉' },
  { prestige: 10, type: 'podium', value: 'cosmic', name: 'P10 - Cosmic Podium', icon: '🌌' },
];

// ========== PREMIUM EXCLUSIVE ==========
const PREMIUM_EXCLUSIVE = {
  colors: ['obsidian', 'rose', 'sunset', 'toxic'],
  backgrounds: ['holographic', 'matrix', 'fire', 'pulse'],
  bgColors: ['royal', 'aurora', 'galaxy', 'sunset-bg'],
  podiums: ['royal', 'void', 'nature'],
  effects: ['fire', 'ice', 'glitch'],
  badges: ['😎', '🎮', '🎯', '🚀', '💀', '🤖', '👾', '🦄', '🐉', '👻']
};

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
  if (type === 'background' && value === 'none') return true;
  if (type === 'bgColor' && value === 'default') return true;
  if (type === 'podium' && value === 'default') return true;
  
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

// ========== HELPER: Get combined background style ==========
function getBackgroundStyle(bgColorKey, patternKey) {
  const bgColor = BG_COLORS[bgColorKey] || BG_COLORS.default;
  const pattern = BACKGROUND_PATTERNS[patternKey];
  
  if (!pattern || pattern.css === 'none') {
    return { background: bgColor, backgroundSize: null };
  }
  
  // Combine pattern with background color
  return {
    background: `${pattern.css}, ${bgColor}`,
    backgroundSize: pattern.size ? `${pattern.size}, 100% 100%` : null
  };
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
    0%, 100% { box-shadow: 0 0 5px var(--tgco-color); filter: brightness(1); }
    50% { box-shadow: 0 0 20px var(--tgco-color), 0 0 40px var(--tgco-color); filter: brightness(1.2); }
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
  .tgco-effect-neon { text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor, 0 0 80px currentColor !important; }
  .tgco-effect-fire { text-shadow: 0 0 5px #ff6b35, 0 -5px 10px #ff6b35, 0 -10px 20px #ffa500, 0 -15px 30px #ff4500 !important; animation: tgcoFireFlicker 0.5s ease-in-out infinite alternate !important; }
  .tgco-effect-ice { text-shadow: 0 0 10px #67e8f9, 0 0 20px #06b6d4, 0 0 30px #0891b2 !important; }
  .tgco-effect-glitch { animation: tgcoGlitchText 0.3s infinite !important; }

  @keyframes tgcoShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  @keyframes tgcoFireFlicker { 0% { filter: brightness(1); } 100% { filter: brightness(1.2); } }
  @keyframes tgcoGlitchText {
    0% { transform: translate(0); } 20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); } 60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); } 100% { transform: translate(0); }
  }

  /* Entrance Animations */
  @keyframes tgcoFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes tgcoSlide { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes tgcoPop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @keyframes tgcoLightning { 0% { opacity: 0; filter: brightness(5); } 30% { opacity: 1; filter: brightness(5); } 100% { opacity: 1; filter: brightness(1); } }
  @keyframes tgcoFire { 0% { opacity: 0; transform: translateY(10px); filter: blur(5px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
  @keyframes tgcoSparkle { 0% { opacity: 0; transform: scale(0) rotate(-180deg); } 100% { opacity: 1; transform: scale(1) rotate(0deg); } }
  @keyframes tgcoSmoke { 0% { opacity: 0; filter: blur(10px); transform: scale(1.2); } 100% { opacity: 1; filter: blur(0); transform: scale(1); } }
  @keyframes tgcoGlitch { 0% { opacity: 0; transform: translateX(-5px) skewX(-5deg); filter: hue-rotate(90deg); } 20% { opacity: 1; transform: translateX(5px) skewX(5deg); filter: hue-rotate(180deg); } 40% { transform: translateX(-3px) skewX(-3deg); filter: hue-rotate(270deg); } 60% { transform: translateX(3px) skewX(3deg); filter: hue-rotate(360deg); } 100% { transform: translateX(0) skewX(0deg); filter: hue-rotate(0deg); } }
  @keyframes tgcoMatrix { 0% { opacity: 0; transform: translateY(-30px); filter: blur(10px) hue-rotate(90deg); } 100% { opacity: 1; transform: translateY(0); filter: blur(0) hue-rotate(0deg); } }
  @keyframes tgcoBounce { 0% { opacity: 0; transform: scale(0); } 50% { transform: scale(1.2); } 70% { transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }

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

  /* Background Pattern Animations */
  @keyframes tgcoHolographicShift { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
  @keyframes tgcoMatrixRain { 0% { background-position: 0 0; } 100% { background-position: 0 200%; } }
  @keyframes tgcoFireFlickerBG { 0%, 100% { background-position: 0 0; } 50% { background-position: 0 -10%; } }
  @keyframes tgcoPulseBG { 0%, 100% { background-size: 100% 100%; } 50% { background-size: 150% 150%; } }

  .tgco-bg-holographic { animation: tgcoHolographicShift 4s ease infinite !important; }
  .tgco-bg-matrix { animation: tgcoMatrixRain 3s linear infinite !important; }
  .tgco-bg-fire { animation: tgcoFireFlickerBG 0.5s ease-in-out infinite !important; }
  .tgco-bg-pulse { animation: tgcoPulseBG 2s ease-in-out infinite !important; }

  /* Compact mode for player lists */
  .tgco-nameplate.compact { padding: 5px 10px; gap: 6px; }
  .tgco-nameplate.compact .tgco-badge { font-size: 0.9rem; }
  .tgco-nameplate.compact .tgco-name { font-size: 0.85rem; }
  .tgco-nameplate.compact .tgco-title { font-size: 0.6rem; }

  /* Leaderboard mode */
  .tgco-nameplate.leaderboard { background: transparent; border: none; padding: 0; }
  .tgco-nameplate.leaderboard .tgco-name { font-size: 1rem; }

  /* ========== PODIUM STYLES ========== */
  .tgco-podium {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 16px;
    border-radius: 16px;
    text-align: center;
    position: relative;
    overflow: hidden;
    min-height: 140px;
    transition: all 0.3s ease;
  }

  .tgco-podium.rank-1 { background: linear-gradient(180deg, rgba(255,215,0,0.15), rgba(255,215,0,0.02)); border: 2px solid #ffd700; min-height: 200px; padding-top: 28px; padding-bottom: 28px; box-shadow: 0 0 50px rgba(255,215,0,0.15); }
  .tgco-podium.rank-2 { background: linear-gradient(180deg, rgba(192,192,192,0.12), rgba(192,192,192,0.02)); border: 2px solid #c0c0c0; min-height: 170px; }
  .tgco-podium.rank-3 { background: linear-gradient(180deg, rgba(205,127,50,0.12), rgba(205,127,50,0.02)); border: 2px solid #cd7f32; min-height: 150px; }

  .tgco-podium-rank { font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; letter-spacing: 1px; margin-bottom: 4px; }
  .tgco-podium.rank-1 .tgco-podium-rank { color: #ffd700; font-size: 1.4rem; }
  .tgco-podium.rank-2 .tgco-podium-rank { color: #c0c0c0; }
  .tgco-podium.rank-3 .tgco-podium-rank { color: #cd7f32; }

  .tgco-podium-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .tgco-podium.rank-1 .tgco-podium-label { color: rgba(255,215,0,0.7); }
  .tgco-podium.rank-2 .tgco-podium-label { color: rgba(192,192,192,0.7); }
  .tgco-podium.rank-3 .tgco-podium-label { color: rgba(205,127,50,0.7); }

  .tgco-podium-avatar { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 10px; border: 3px solid rgba(255,255,255,0.2); }
  .tgco-podium.rank-1 .tgco-podium-avatar { width: 60px; height: 60px; font-size: 1.8rem; border-color: rgba(255,215,0,0.4); background: linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,215,0,0.1)); }
  .tgco-podium.rank-2 .tgco-podium-avatar { border-color: rgba(192,192,192,0.4); background: linear-gradient(135deg, rgba(192,192,192,0.3), rgba(192,192,192,0.1)); }
  .tgco-podium.rank-3 .tgco-podium-avatar { border-color: rgba(205,127,50,0.4); background: linear-gradient(135deg, rgba(205,127,50,0.3), rgba(205,127,50,0.1)); }

  .tgco-podium-name { font-size: 1rem; font-weight: 700; margin-bottom: 4px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tgco-podium.rank-1 .tgco-podium-name { font-size: 1.2rem; }

  .tgco-podium-title { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.5); margin-bottom: 8px; }

  .tgco-podium-score { font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; letter-spacing: 1px; }
  .tgco-podium.rank-1 .tgco-podium-score { color: #ffd700; font-size: 1.5rem; }
  .tgco-podium.rank-2 .tgco-podium-score { color: #c0c0c0; }
  .tgco-podium.rank-3 .tgco-podium-score { color: #cd7f32; }

  .tgco-podium-meta { font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-top: 4px; }

  /* Podium Style Variations */
  .tgco-podium.podium-flames { border-image: linear-gradient(180deg, #ff4500, #ff8c00, #ffd700) 1; animation: tgcoPodiumFlames 0.5s ease-in-out infinite alternate; }
  .tgco-podium.podium-neon { box-shadow: 0 0 20px var(--podium-color), 0 0 40px var(--podium-color), inset 0 0 20px rgba(255,255,255,0.05); }
  .tgco-podium.podium-crystal { background: linear-gradient(135deg, rgba(103,232,249,0.1), rgba(6,182,212,0.05)) !important; border-color: #67e8f9 !important; box-shadow: 0 0 30px rgba(103,232,249,0.2); }
  .tgco-podium.podium-cosmic { background: radial-gradient(ellipse at top, rgba(139,92,246,0.2), transparent), radial-gradient(ellipse at bottom, rgba(59,130,246,0.15), transparent) !important; }
  .tgco-podium.podium-holographic { border-color: transparent !important; background: linear-gradient(rgba(15,15,25,0.9), rgba(15,15,25,0.9)) padding-box, linear-gradient(135deg, #f87171, #fbbf24, #34d399, #67e8f9, #c084fc, #f87171) border-box !important; background-size: 100% 100%, 400% 400% !important; animation: tgcoRainbow 4s linear infinite; }
  .tgco-podium.podium-royal { border-color: #ffd700 !important; background: linear-gradient(180deg, rgba(255,215,0,0.12), rgba(139,69,19,0.08)) !important; box-shadow: inset 0 0 30px rgba(255,215,0,0.1); }
  .tgco-podium.podium-cyber { border-color: #00ff88 !important; background: linear-gradient(180deg, rgba(0,255,136,0.08), rgba(0,0,0,0.3)) !important; box-shadow: 0 0 15px rgba(0,255,136,0.3); animation: tgcoPodiumCyber 2s ease-in-out infinite; }
  .tgco-podium.podium-nature { border-color: #34d399 !important; background: linear-gradient(180deg, rgba(52,211,153,0.1), rgba(16,185,129,0.05)) !important; }
  .tgco-podium.podium-void { border-color: #6366f1 !important; background: radial-gradient(ellipse at center, rgba(99,102,241,0.15), rgba(0,0,0,0.5)) !important; animation: tgcoPodiumVoid 3s ease-in-out infinite; }

  @keyframes tgcoPodiumFlames { 0% { box-shadow: 0 -5px 20px rgba(255,69,0,0.4), 0 -10px 30px rgba(255,140,0,0.3); } 100% { box-shadow: 0 -8px 25px rgba(255,69,0,0.5), 0 -15px 40px rgba(255,140,0,0.4); } }
  @keyframes tgcoPodiumCyber { 0%, 100% { opacity: 1; } 50% { opacity: 0.85; } }
  @keyframes tgcoPodiumVoid { 0%, 100% { box-shadow: 0 0 30px rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 50px rgba(99,102,241,0.5); } }

  /* Player Cards (for waiting rooms) */
  .player-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 2px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; }
  .player-card.premium { background: rgba(255, 255, 255, 0.05); }
  .player-card.is-me { background: rgba(79, 172, 254, 0.1); }
  .player-card.rainbow-border { border-color: transparent !important; background: linear-gradient(rgba(15, 15, 25, 0.95), rgba(15, 15, 25, 0.95)) padding-box, linear-gradient(90deg, #f87171, #fbbf24, #34d399, #67e8f9, #c084fc, #f87171) border-box; background-size: 100% 100%, 300% 100%; animation: tgcoRainbow 3s linear infinite; }

  .player-info { display: flex; align-items: center; gap: 10px; }
  .player-badge { font-size: 1.2rem; }
  .player-name-wrapper { display: flex; flex-direction: column; gap: 2px; }
  .player-name { font-size: 1rem; font-weight: 600; color: white; }
  .player-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.5); }
  .host-badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 8px; border-radius: 6px; background: rgba(251, 191, 36, 0.2); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }

  /* ========== LEADERBOARD ITEMS ========== */
  .lb-item { display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 2px solid rgba(255, 255, 255, 0.1); gap: 12px; transition: all 0.3s ease; }
  .lb-item.is-me { background: rgba(79, 172, 254, 0.1); border-color: rgba(79, 172, 254, 0.3); }

  .lb-rank { font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; min-width: 28px; color: rgba(255, 255, 255, 0.5); }
  .lb-name { flex: 1; font-weight: 600; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lb-name-wrapper { flex: 1; display: flex; flex-direction: column; gap: 2px; overflow: hidden; min-width: 0; }
  .lb-name-wrapper .tgco-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lb-title { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.45); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lb-score { font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; color: var(--accent, #14b8a6); }

  /* Rank styling */
  .lb-item.rank-1 { border-color: #fbbf24; background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), transparent); }
  .lb-item.rank-2 { border-color: #94a3b8; background: linear-gradient(135deg, rgba(148, 163, 184, 0.15), transparent); }
  .lb-item.rank-3 { border-color: #cd7c32; background: linear-gradient(135deg, rgba(205, 124, 50, 0.15), transparent); }
  .lb-item.rank-1 .lb-rank { color: #fbbf24; }
  .lb-item.rank-2 .lb-rank { color: #94a3b8; }
  .lb-item.rank-3 .lb-rank { color: #cd7c32; }

  /* Border colors */
  .lb-item.rainbow-border, .mini-lb-item.rainbow-border, .winner-card.rainbow-border { border-color: transparent !important; background: linear-gradient(rgba(15, 15, 25, 0.95), rgba(15, 15, 25, 0.95)) padding-box, linear-gradient(90deg, #f87171, #fbbf24, #34d399, #67e8f9, #c084fc, #f87171) border-box; background-size: 100% 100%, 300% 100%; animation: tgcoRainbow 3s linear infinite; }
  .lb-item.gold-border, .mini-lb-item.gold-border, .winner-card.gold-border { border-color: #fbbf24 !important; background: linear-gradient(135deg, rgba(251, 191, 36, 0.12), transparent); }
  .lb-item.diamond-border, .mini-lb-item.diamond-border, .winner-card.diamond-border { border-color: #67e8f9 !important; background: linear-gradient(135deg, rgba(103, 232, 249, 0.12), transparent); }
  .lb-item.ruby-border, .mini-lb-item.ruby-border, .winner-card.ruby-border { border-color: #f87171 !important; background: linear-gradient(135deg, rgba(248, 113, 113, 0.12), transparent); }
  .lb-item.emerald-border, .mini-lb-item.emerald-border, .winner-card.emerald-border { border-color: #34d399 !important; background: linear-gradient(135deg, rgba(52, 211, 153, 0.12), transparent); }
  .lb-item.amethyst-border, .mini-lb-item.amethyst-border, .winner-card.amethyst-border { border-color: #c084fc !important; background: linear-gradient(135deg, rgba(192, 132, 252, 0.12), transparent); }
  .lb-item.platinum-border, .mini-lb-item.platinum-border, .winner-card.platinum-border { border-color: #e2e8f0 !important; background: linear-gradient(135deg, rgba(226, 232, 240, 0.12), transparent); }
  .lb-item.obsidian-border, .mini-lb-item.obsidian-border, .winner-card.obsidian-border { border-color: #1e1b4b !important; background: linear-gradient(135deg, rgba(30, 27, 75, 0.25), transparent); }
  .lb-item.rose-border, .mini-lb-item.rose-border, .winner-card.rose-border { border-color: #fb7185 !important; background: linear-gradient(135deg, rgba(251, 113, 133, 0.12), transparent); }
  .lb-item.sunset-border, .mini-lb-item.sunset-border, .winner-card.sunset-border { border-color: #f97316 !important; background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), transparent); }
  .lb-item.toxic-border, .mini-lb-item.toxic-border, .winner-card.toxic-border { border-color: #84cc16 !important; background: linear-gradient(135deg, rgba(132, 204, 22, 0.12), transparent); }
  .lb-item.gray-border, .mini-lb-item.gray-border, .winner-card.gray-border { border-color: #6b7280 !important; }

  /* ========== MINI LEADERBOARD ========== */
  .mini-lb-item { display: flex; align-items: center; padding: 8px 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.03); border: 2px solid rgba(255, 255, 255, 0.1); gap: 8px; transition: all 0.3s ease; }
  .mini-lb-item.is-me { background: rgba(79, 172, 254, 0.1); border-color: rgba(79, 172, 254, 0.3); }
  .mini-lb-item.rank-1 { border-color: #fbbf24; }
  .mini-lb-rank { font-family: 'Bebas Neue', sans-serif; font-size: 1rem; min-width: 20px; color: rgba(255, 255, 255, 0.5); }
  .mini-lb-name { flex: 1; font-weight: 600; font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mini-lb-name-wrapper { flex: 1; display: flex; flex-direction: column; gap: 1px; overflow: hidden; min-width: 0; }
  .mini-lb-name-wrapper .tgco-name { font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mini-lb-title { font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(255, 255, 255, 0.4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mini-lb-score { font-family: 'Bebas Neue', sans-serif; font-size: 1rem; color: var(--accent, #14b8a6); }

  /* ========== WINNER CARD ========== */
  .winner-card { display: flex; flex-direction: column; align-items: center; padding: 24px 32px; border-radius: 16px; background: rgba(255, 255, 255, 0.05); border: 3px solid #fbbf24; gap: 8px; text-align: center; }
  .winner-crown { font-size: 2.5rem; margin-bottom: 4px; }
  .winner-name { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; letter-spacing: 2px; color: #fbbf24; }
  .winner-score { font-size: 1rem; color: rgba(255, 255, 255, 0.7); }
  .winner-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255, 255, 255, 0.5); margin-top: -4px; }

  /* ========== GLOBAL LEADERBOARD ========== */
  .global-lb-item { display: flex; align-items: center; padding: 16px 20px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 2px solid rgba(255, 255, 255, 0.1); gap: 16px; transition: all 0.3s ease; }
  .global-lb-item:hover { background: rgba(255, 255, 255, 0.05); transform: translateX(4px); }
  .global-lb-item.rainbow-border { border-color: transparent !important; background: linear-gradient(rgba(15, 15, 25, 0.95), rgba(15, 15, 25, 0.95)) padding-box, linear-gradient(90deg, #f87171, #fbbf24, #34d399, #67e8f9, #c084fc, #f87171) border-box; background-size: 100% 100%, 300% 100%; animation: tgcoRainbow 3s linear infinite; }
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

  .global-lb-rank { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; min-width: 40px; color: rgba(255, 255, 255, 0.5); }
  .global-lb-rank.top-1 { color: #fbbf24; }
  .global-lb-rank.top-2 { color: #94a3b8; }
  .global-lb-rank.top-3 { color: #cd7c32; }
  .global-lb-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .global-lb-name { font-weight: 600; font-size: 1.1rem; }
  .global-lb-stats { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }
  .global-lb-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.45); }
  .global-lb-score { font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; color: var(--accent, #14b8a6); }
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

  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) c.badge_icon = cosmetics.badge_icon;
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) c.border_color = cosmetics.border_color;
  if (cosmetics.border_style && isCosmeticUnlocked('border', cosmetics.border_style, unlockOpts)) c.border_style = cosmetics.border_style;
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) c.name_effect = cosmetics.name_effect;
  if (cosmetics.entrance_animation && isCosmeticUnlocked('entrance', cosmetics.entrance_animation, unlockOpts)) c.entrance_animation = cosmetics.entrance_animation;
  if (cosmetics.background_pattern && isCosmeticUnlocked('background', cosmetics.background_pattern, unlockOpts)) c.background_pattern = cosmetics.background_pattern;
  if (cosmetics.background_color && isCosmeticUnlocked('bgColor', cosmetics.background_color, unlockOpts)) c.background_color = cosmetics.background_color;
  if (isPremium && cosmetics.title) c.title = cosmetics.title;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.border_style !== 'solid' || c.name_effect !== 'none' || c.title || c.background_pattern !== 'none' || c.background_color !== 'default';
  const isRainbow = c.border_color === 'rainbow';
  const color = isRainbow ? '#c084fc' : (COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray);

  const classes = ['tgco-nameplate'];
  if (!hasCosmetics) { classes.push('free'); }
  else {
    if (isRainbow) classes.push('rainbow-border');
    else classes.push(`tgco-border-${c.border_style || 'solid'}`);
    if (showEntrance && c.entrance_animation) classes.push(`tgco-entrance-${c.entrance_animation}`);
  }
  if (mode !== 'default') classes.push(mode);

  const pattern = BACKGROUND_PATTERNS[c.background_pattern];
  if (pattern && pattern.animated) classes.push(`tgco-bg-${c.background_pattern}`);

  const nameClasses = ['tgco-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') nameClasses.push(`tgco-effect-${c.name_effect}`);

  const badgeHtml = (hasCosmetics && c.badge_icon) ? `<span class="tgco-badge">${escapeHtml(c.badge_icon)}</span>` : '';
  const titleHtml = (hasCosmetics && c.title) ? `<span class="tgco-title">${escapeHtml(c.title)}</span>` : '';

  let styleAttr = '';
  if (hasCosmetics) {
    const styles = [];
    if (!isRainbow) { styles.push(`--tgco-color: ${color}`); styles.push(`border-color: ${color}`); }
    
    // Apply background color + pattern
    const bgStyle = getBackgroundStyle(c.background_color, c.background_pattern);
    styles.push(`background: ${bgStyle.background}`);
    if (bgStyle.backgroundSize) styles.push(`background-size: ${bgStyle.backgroundSize}`);
    
    if (styles.length) styleAttr = `style="${styles.join('; ')};"`;
  }

  const nameStyle = hasCosmetics ? `style="color: ${color};"` : '';

  return `<div class="${classes.join(' ')}" ${styleAttr}>${badgeHtml}<div class="tgco-name-wrapper"><span class="${nameClasses.join(' ')}" ${nameStyle}>${escapeHtml(name)}</span>${titleHtml}</div></div>`.trim();
}

/**
 * Render a simple name with cosmetics (no nameplate box)
 */
function renderInlineName(options) {
  injectCosmeticsStyles();
  const { name = 'Player', cosmetics = {}, isPremium = false, level = 1, prestige = 0 } = options;
  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) c.badge_icon = cosmetics.badge_icon;
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) c.border_color = cosmetics.border_color;
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) c.name_effect = cosmetics.name_effect;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none';
  const color = COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray;

  const nameClasses = ['tgco-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') nameClasses.push(`tgco-effect-${c.name_effect}`);

  const badge = (hasCosmetics && c.badge_icon) ? `${c.badge_icon} ` : '';
  const nameStyle = hasCosmetics ? `style="color: ${color};"` : '';

  return `<span class="${nameClasses.join(' ')}" ${nameStyle}>${badge}${escapeHtml(name)}</span>`;
}

/**
 * Create a player card for lobby/waiting room
 */
function renderPlayerCard(options) {
  injectCosmeticsStyles();
  const { name = 'Player', cosmetics = {}, isPremium = false, level = 1, prestige = 0, isHost = false, isMe = false, showEntrance = false } = options;
  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) c.badge_icon = cosmetics.badge_icon;
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) c.border_color = cosmetics.border_color;
  if (cosmetics.border_style && isCosmeticUnlocked('border', cosmetics.border_style, unlockOpts)) c.border_style = cosmetics.border_style;
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) c.name_effect = cosmetics.name_effect;
  if (cosmetics.entrance_animation && isCosmeticUnlocked('entrance', cosmetics.entrance_animation, unlockOpts)) c.entrance_animation = cosmetics.entrance_animation;
  if (cosmetics.background_color && isCosmeticUnlocked('bgColor', cosmetics.background_color, unlockOpts)) c.background_color = cosmetics.background_color;
  if (cosmetics.background_pattern && isCosmeticUnlocked('background', cosmetics.background_pattern, unlockOpts)) c.background_pattern = cosmetics.background_pattern;
  if (isPremium && cosmetics.title) c.title = cosmetics.title;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.border_style !== 'solid' || c.name_effect !== 'none' || c.title || c.background_color !== 'default' || c.background_pattern !== 'none';
  const isRainbow = c.border_color === 'rainbow';
  const color = isRainbow ? '#c084fc' : (hasCosmetics ? (COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray) : 'rgba(255,255,255,0.1)');

  const cardClasses = ['player-card'];
  if (isMe) cardClasses.push('is-me');
  if (hasCosmetics) cardClasses.push('premium');
  if (isRainbow && hasCosmetics) cardClasses.push('rainbow-border');
  if (showEntrance && hasCosmetics) cardClasses.push(`tgco-entrance-${c.entrance_animation || 'fade'}`);

  const nameClasses = ['player-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') nameClasses.push(`tgco-effect-${c.name_effect}`);

  const badge = (hasCosmetics && c.badge_icon) ? `<span class="player-badge">${c.badge_icon}</span>` : '';
  const hostBadge = isHost ? '<span class="host-badge">HOST</span>' : '';
  const title = (hasCosmetics && c.title) ? `<span class="player-title">${escapeHtml(c.title)}</span>` : '';

  let cardStyle = '';
  if (hasCosmetics && !isRainbow) {
    cardStyle = `border-color: ${color};`;
    if (c.border_style === 'glow') cardStyle += ` box-shadow: 0 0 15px ${color}, 0 0 30px ${color};`;
    if (c.border_style === 'pulse') cardStyle += ` --tgco-color: ${color};`;
  }
  
  // Apply background color + pattern
  if (hasCosmetics && (c.background_color !== 'default' || c.background_pattern !== 'none')) {
    const bgStyle = getBackgroundStyle(c.background_color, c.background_pattern);
    cardStyle += ` background: ${bgStyle.background};`;
    if (bgStyle.backgroundSize) cardStyle += ` background-size: ${bgStyle.backgroundSize};`;
  }
  
  const nameStyle = hasCosmetics ? `color: ${color};` : '';

  return `<div class="${cardClasses.join(' ')}" style="${cardStyle}"><div class="player-info">${badge}<div class="player-name-wrapper"><span class="${nameClasses.join(' ')}" style="${nameStyle}">${escapeHtml(name)}</span>${title}</div></div>${hostBadge}</div>`.trim();
}

/**
 * Render a podium item for leaderboard top 3
 */
function renderPodiumItem(options) {
  injectCosmeticsStyles();
  const { name = 'Player', score = 0, rank = 1, cosmetics = {}, isPremium = false, level = 1, prestige = 0, scoreUnit = '', meta = '' } = options;
  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) c.badge_icon = cosmetics.badge_icon;
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) c.border_color = cosmetics.border_color;
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) c.name_effect = cosmetics.name_effect;
  if (cosmetics.podium_style && isCosmeticUnlocked('podium', cosmetics.podium_style, unlockOpts)) c.podium_style = cosmetics.podium_style;
  if (cosmetics.background_pattern && isCosmeticUnlocked('background', cosmetics.background_pattern, unlockOpts)) c.background_pattern = cosmetics.background_pattern;
  if (cosmetics.background_color && isCosmeticUnlocked('bgColor', cosmetics.background_color, unlockOpts)) c.background_color = cosmetics.background_color;
  if (isPremium && cosmetics.title) c.title = cosmetics.title;
  if (cosmetics.avatar) c.avatar = cosmetics.avatar;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title || c.podium_style !== 'default' || c.background_color !== 'default';
  const color = COSMETIC_COLORS[c.border_color] || (rank === 1 ? '#ffd700' : rank === 2 ? '#c0c0c0' : '#cd7f32');

  const classes = ['tgco-podium', `rank-${rank}`];
  if (c.podium_style && c.podium_style !== 'default') classes.push(`podium-${c.podium_style}`);

  const pattern = BACKGROUND_PATTERNS[c.background_pattern];
  if (pattern && pattern.animated) classes.push(`tgco-bg-${c.background_pattern}`);

  const nameClasses = ['tgco-podium-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') nameClasses.push(`tgco-effect-${c.name_effect}`);

  const avatarDisplay = c.avatar || c.badge_icon || name.charAt(0).toUpperCase();

  let bgStyle = '';
  if (c.background_color !== 'default' || (pattern && pattern.css && pattern.css !== 'none')) {
    const bg = getBackgroundStyle(c.background_color, c.background_pattern);
    bgStyle = `background: ${bg.background};`;
    if (bg.backgroundSize) bgStyle += ` background-size: ${bg.backgroundSize};`;
  }

  const podiumColorStyle = c.podium_style !== 'default' ? `--podium-color: ${color};` : '';
  const rankLabels = { 1: 'Champion', 2: 'Silver', 3: 'Bronze' };
  const nameStyle = hasCosmetics ? `color: ${color};` : '';
  const scoreText = scoreUnit ? `${score.toLocaleString()} ${scoreUnit}` : score.toLocaleString();

  return `<div class="${classes.join(' ')}" style="${bgStyle}${podiumColorStyle}"><div class="tgco-podium-rank">${rank}</div><div class="tgco-podium-label">${rankLabels[rank] || ''}</div><div class="tgco-podium-avatar">${avatarDisplay}</div><div class="${nameClasses.join(' ')}" style="${nameStyle}">${escapeHtml(name)}</div>${c.title ? `<div class="tgco-podium-title">${escapeHtml(c.title)}</div>` : ''}<div class="tgco-podium-score">${scoreText}</div>${meta ? `<div class="tgco-podium-meta">${escapeHtml(meta)}</div>` : ''}</div>`.trim();
}

/**
 * Render a leaderboard item
 */
function renderLeaderboardItem(options) {
  injectCosmeticsStyles();
  const { name = 'Player', score = 0, rank = 1, cosmetics = {}, isPremium = false, level = 1, prestige = 0, isMe = false, showRankStyling = true } = options;
  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) c.badge_icon = cosmetics.badge_icon;
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) c.border_color = cosmetics.border_color;
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) c.name_effect = cosmetics.name_effect;
  if (cosmetics.background_color && isCosmeticUnlocked('bgColor', cosmetics.background_color, unlockOpts)) c.background_color = cosmetics.background_color;
  if (isPremium && cosmetics.title) c.title = cosmetics.title;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title || c.background_color !== 'default';
  const color = COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray;
  
  const classes = ['lb-item'];
  if (isMe) classes.push('is-me');
  
  if (hasCosmetics && c.border_color) classes.push(`${c.border_color}-border`);
  else if (showRankStyling) {
    if (rank === 1) classes.push('rank-1');
    else if (rank === 2) classes.push('rank-2');
    else if (rank === 3) classes.push('rank-3');
  }

  const nameClasses = ['tgco-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') nameClasses.push(`tgco-effect-${c.name_effect}`);
  const badge = (hasCosmetics && c.badge_icon) ? `${c.badge_icon} ` : '';
  const nameStyle = hasCosmetics ? `color: ${color};` : '';
  const title = (hasCosmetics && c.title) ? `<span class="lb-title">${escapeHtml(c.title)}</span>` : '';

  // Apply background color
  let itemStyle = '';
  if (hasCosmetics && c.background_color !== 'default') {
    const bgColor = BG_COLORS[c.background_color] || BG_COLORS.default;
    itemStyle = `style="background: ${bgColor};"`;
  }

  return `<div class="${classes.join(' ')}" ${itemStyle}><span class="lb-rank">${rank}</span><div class="lb-name-wrapper"><span class="${nameClasses.join(' ')}" style="${nameStyle}">${badge}${escapeHtml(name)}</span>${title}</div><span class="lb-score">${score.toLocaleString()}</span></div>`.trim();
}

/**
 * Render a mini leaderboard item (compact)
 */
function renderMiniLeaderboardItem(options) {
  injectCosmeticsStyles();
  const { name = 'Player', score = 0, rank = 1, cosmetics = {}, isPremium = false, level = 1, prestige = 0, isMe = false } = options;
  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) c.badge_icon = cosmetics.badge_icon;
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) c.border_color = cosmetics.border_color;
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) c.name_effect = cosmetics.name_effect;
  if (cosmetics.background_color && isCosmeticUnlocked('bgColor', cosmetics.background_color, unlockOpts)) c.background_color = cosmetics.background_color;
  if (isPremium && cosmetics.title) c.title = cosmetics.title;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title || c.background_color !== 'default';
  const color = COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray;
  
  const classes = ['mini-lb-item'];
  if (isMe) classes.push('is-me');
  if (rank === 1 && !hasCosmetics) classes.push('rank-1');
  if (hasCosmetics && c.border_color) classes.push(`${c.border_color}-border`);

  const nameClasses = ['tgco-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') nameClasses.push(`tgco-effect-${c.name_effect}`);
  const badge = (hasCosmetics && c.badge_icon) ? `${c.badge_icon} ` : '';
  const nameStyle = hasCosmetics ? `color: ${color};` : '';
  const title = (hasCosmetics && c.title) ? `<span class="mini-lb-title">${escapeHtml(c.title)}</span>` : '';

  // Apply background color
  let itemStyle = '';
  if (hasCosmetics && c.background_color !== 'default') {
    const bgColor = BG_COLORS[c.background_color] || BG_COLORS.default;
    itemStyle = `style="background: ${bgColor};"`;
  }

  return `<div class="${classes.join(' ')}" ${itemStyle}><span class="mini-lb-rank">${rank}</span><div class="mini-lb-name-wrapper"><span class="${nameClasses.join(' ')}" style="${nameStyle}">${badge}${escapeHtml(name)}</span>${title}</div><span class="mini-lb-score">${score.toLocaleString()}</span></div>`.trim();
}

/**
 * Render a winner card (for game over screens)
 */
function renderWinnerCard(options) {
  injectCosmeticsStyles();
  const { name = 'Player', score = 0, cosmetics = {}, isPremium = false, level = 1, prestige = 0, showCrown = true } = options;
  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) c.badge_icon = cosmetics.badge_icon;
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) c.border_color = cosmetics.border_color;
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) c.name_effect = cosmetics.name_effect;
  if (cosmetics.background_color && isCosmeticUnlocked('bgColor', cosmetics.background_color, unlockOpts)) c.background_color = cosmetics.background_color;
  if (isPremium && cosmetics.title) c.title = cosmetics.title;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title || c.background_color !== 'default';
  const color = COSMETIC_COLORS[c.border_color] || '#fbbf24';
  
  const classes = ['winner-card'];
  if (hasCosmetics && c.border_color) classes.push(`${c.border_color}-border`);

  const nameClasses = ['winner-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') nameClasses.push(`tgco-effect-${c.name_effect}`);

  const badge = (hasCosmetics && c.badge_icon) ? c.badge_icon + ' ' : '';
  const title = (hasCosmetics && c.title) ? `<div class="winner-title">${escapeHtml(c.title)}</div>` : '';
  const crown = showCrown ? '<div class="winner-crown">👑</div>' : '';
  const nameStyle = hasCosmetics ? `color: ${color};` : '';

  // Apply background color
  let cardStyle = '';
  if (hasCosmetics && c.background_color !== 'default') {
    const bgColor = BG_COLORS[c.background_color] || BG_COLORS.default;
    cardStyle = `style="background: ${bgColor};"`;
  }

  return `<div class="${classes.join(' ')}" ${cardStyle}>${crown}<div class="${nameClasses.join(' ')}" style="${nameStyle}">${badge}${escapeHtml(name)}</div>${title}<div class="winner-score">${score.toLocaleString()} points</div></div>`.trim();
}

/**
 * Render a global leaderboard item
 */
function renderGlobalLeaderboardItem(options) {
  injectCosmeticsStyles();
  const { name = 'Player', score = 0, rank = 1, stats = '', cosmetics = {}, isPremium = false, level = 1, prestige = 0 } = options;
  const unlockOpts = { isPremium, level, prestige };
  const c = { ...DEFAULT_COSMETICS };
  
  if (cosmetics.badge_icon && isCosmeticUnlocked('badge', cosmetics.badge_icon, unlockOpts)) c.badge_icon = cosmetics.badge_icon;
  if (cosmetics.border_color && isCosmeticUnlocked('color', cosmetics.border_color, unlockOpts)) c.border_color = cosmetics.border_color;
  if (cosmetics.name_effect && isCosmeticUnlocked('effect', cosmetics.name_effect, unlockOpts)) c.name_effect = cosmetics.name_effect;
  if (cosmetics.background_color && isCosmeticUnlocked('bgColor', cosmetics.background_color, unlockOpts)) c.background_color = cosmetics.background_color;
  if (isPremium && cosmetics.title) c.title = cosmetics.title;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title || c.background_color !== 'default';
  const color = COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray;
  
  const classes = ['global-lb-item'];
  if (hasCosmetics && c.border_color) classes.push(`${c.border_color}-border`);

  const rankClass = rank <= 3 ? `top-${rank}` : '';
  
  const nameClasses = ['tgco-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') nameClasses.push(`tgco-effect-${c.name_effect}`);
  const badge = (hasCosmetics && c.badge_icon) ? `${c.badge_icon} ` : '';
  const nameStyle = hasCosmetics ? `color: ${color};` : '';
  const title = (hasCosmetics && c.title) ? `<div class="global-lb-title">${escapeHtml(c.title)}</div>` : '';

  // Apply background color
  let itemStyle = '';
  if (hasCosmetics && c.background_color !== 'default') {
    const bgColor = BG_COLORS[c.background_color] || BG_COLORS.default;
    itemStyle = `style="background: ${bgColor};"`;
  }

  return `<div class="${classes.join(' ')}" ${itemStyle}><span class="global-lb-rank ${rankClass}">#${rank}</span><div class="global-lb-info"><div class="global-lb-name"><span class="${nameClasses.join(' ')}" style="${nameStyle}">${badge}${escapeHtml(name)}</span></div>${title}${stats ? `<div class="global-lb-stats">${escapeHtml(stats)}</div>` : ''}</div><span class="global-lb-score">${score.toLocaleString()}</span></div>`.trim();
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
  if (cosmeticsCache.has(userId)) return cosmeticsCache.get(userId);

  try {
    const { data, error } = await supabaseClient.from('profiles').select('display_name, account_type, cosmetics, xp, prestige').eq('id', userId).single();
    if (error) throw error;

    const level = getLevelFromXP(data.xp || 0);
    const result = { name: data.display_name || 'Player', isPremium: data.account_type === 'premium', cosmetics: data.cosmetics || DEFAULT_COSMETICS, level: level, prestige: data.prestige || 0 };

    cosmeticsCache.set(userId, result);
    return result;
  } catch (e) {
    console.error('Error fetching cosmetics:', e);
    return { name: 'Player', isPremium: false, cosmetics: DEFAULT_COSMETICS, level: 1, prestige: 0 };
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
  if (userId) cosmeticsCache.delete(userId);
  else cosmeticsCache.clear();
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.TGCOCosmetics = {
    renderNameplate,
    renderInlineName,
    renderPlayerCard,
    renderPodiumItem,
    renderLeaderboardItem,
    renderMiniLeaderboardItem,
    renderWinnerCard,
    renderGlobalLeaderboardItem,
    fetchPlayerCosmetics,
    clearCosmeticsCache,
    isCosmeticUnlocked,
    getUnlockRequirement,
    COSMETIC_COLORS,
    BG_COLORS,
    BACKGROUND_PATTERNS,
    PODIUM_STYLES,
    DEFAULT_COSMETICS,
    LEVEL_REWARDS,
    PRESTIGE_REWARDS,
    PREMIUM_EXCLUSIVE,
    LEVEL_THRESHOLDS,
    getLevelFromXP
  };
}
