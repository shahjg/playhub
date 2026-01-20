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

// ========== UNIFIED BACKGROUNDS (replaces both bg color and pattern) ==========
const BACKGROUNDS = {
  // === SOLID COLORS ===
  default: { 
    name: 'Default', 
    css: 'linear-gradient(135deg, rgba(15,15,25,0.95), rgba(20,20,35,0.95))', 
    category: 'solid' 
  },
  midnight: { 
    name: 'Midnight', 
    css: 'linear-gradient(135deg, #0f0f19, #1a1a2e)', 
    category: 'solid' 
  },
  charcoal: { 
    name: 'Charcoal', 
    css: 'linear-gradient(135deg, #1f2937, #374151)', 
    category: 'solid' 
  },
  navy: { 
    name: 'Navy', 
    css: 'linear-gradient(135deg, #1e3a5f, #0f172a)', 
    category: 'solid' 
  },
  wine: { 
    name: 'Wine', 
    css: 'linear-gradient(135deg, #4a1942, #2d1326)', 
    category: 'solid' 
  },
  forest: { 
    name: 'Forest', 
    css: 'linear-gradient(135deg, #14532d, #052e16)', 
    category: 'solid' 
  },
  ember: { 
    name: 'Ember', 
    css: 'linear-gradient(135deg, #7c2d12, #431407)', 
    category: 'solid' 
  },
  ocean: { 
    name: 'Ocean', 
    css: 'linear-gradient(135deg, #0c4a6e, #082f49)', 
    category: 'solid' 
  },
  royal: { 
    name: 'Royal Purple', 
    css: 'linear-gradient(135deg, #4c1d95, #2e1065)', 
    category: 'solid' 
  },
  bloodmoon: { 
    name: 'Blood Moon', 
    css: 'linear-gradient(135deg, #7f1d1d, #450a0a)', 
    category: 'solid' 
  },

  // === CAMO PRINTS ===
  'military-camo': { 
    name: 'Military Camo', 
    css: `
      radial-gradient(ellipse 80% 60% at 20% 30%, rgba(34,85,51,0.8) 0%, transparent 60%),
      radial-gradient(ellipse 70% 50% at 70% 60%, rgba(85,107,47,0.7) 0%, transparent 55%),
      radial-gradient(ellipse 60% 70% at 40% 80%, rgba(47,79,47,0.75) 0%, transparent 50%),
      radial-gradient(ellipse 50% 40% at 80% 20%, rgba(60,90,60,0.6) 0%, transparent 45%),
      linear-gradient(135deg, #2d3a2d, #1a2f1a)
    `,
    category: 'camo' 
  },
  'desert-camo': { 
    name: 'Desert Camo', 
    css: `
      radial-gradient(ellipse 70% 60% at 25% 35%, rgba(194,178,128,0.7) 0%, transparent 55%),
      radial-gradient(ellipse 60% 50% at 65% 55%, rgba(139,119,101,0.6) 0%, transparent 50%),
      radial-gradient(ellipse 80% 40% at 45% 75%, rgba(160,140,120,0.65) 0%, transparent 45%),
      radial-gradient(ellipse 50% 60% at 85% 25%, rgba(180,160,130,0.5) 0%, transparent 40%),
      linear-gradient(135deg, #8b7355, #6b5344)
    `,
    category: 'camo' 
  },
  'arctic-camo': { 
    name: 'Arctic Camo', 
    css: `
      radial-gradient(ellipse 80% 50% at 20% 40%, rgba(230,240,250,0.5) 0%, transparent 50%),
      radial-gradient(ellipse 60% 70% at 70% 30%, rgba(200,220,235,0.45) 0%, transparent 55%),
      radial-gradient(ellipse 70% 40% at 50% 70%, rgba(180,200,220,0.4) 0%, transparent 45%),
      radial-gradient(ellipse 50% 60% at 30% 80%, rgba(160,180,200,0.35) 0%, transparent 40%),
      linear-gradient(135deg, #94a3b8, #64748b)
    `,
    category: 'camo' 
  },
  'digital-camo': { 
    name: 'Digital Camo', 
    css: `
      repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(50,50,50,0.4) 4px, rgba(50,50,50,0.4) 8px),
      repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(70,70,70,0.35) 4px, rgba(70,70,70,0.35) 8px),
      repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(40,40,40,0.3) 6px, rgba(40,40,40,0.3) 12px),
      linear-gradient(135deg, #374151, #1f2937)
    `,
    category: 'camo' 
  },
  'pink-camo': { 
    name: 'Pink Camo', 
    css: `
      radial-gradient(ellipse 70% 60% at 25% 30%, rgba(255,105,180,0.5) 0%, transparent 55%),
      radial-gradient(ellipse 60% 50% at 70% 60%, rgba(255,20,147,0.4) 0%, transparent 50%),
      radial-gradient(ellipse 80% 45% at 40% 75%, rgba(219,112,147,0.45) 0%, transparent 45%),
      radial-gradient(ellipse 55% 65% at 85% 20%, rgba(255,182,193,0.35) 0%, transparent 40%),
      linear-gradient(135deg, #9d174d, #831843)
    `,
    category: 'camo' 
  },

  // === ANIMAL PRINTS ===
  'leopard': { 
    name: 'Leopard', 
    css: `
      radial-gradient(ellipse 25% 35% at 15% 25%, rgba(0,0,0,0.6) 30%, rgba(139,90,43,0.4) 31%, transparent 70%),
      radial-gradient(ellipse 30% 25% at 45% 55%, rgba(0,0,0,0.6) 30%, rgba(139,90,43,0.4) 31%, transparent 70%),
      radial-gradient(ellipse 25% 30% at 75% 35%, rgba(0,0,0,0.6) 30%, rgba(139,90,43,0.4) 31%, transparent 70%),
      radial-gradient(ellipse 28% 25% at 30% 80%, rgba(0,0,0,0.6) 30%, rgba(139,90,43,0.4) 31%, transparent 70%),
      radial-gradient(ellipse 22% 32% at 85% 75%, rgba(0,0,0,0.6) 30%, rgba(139,90,43,0.4) 31%, transparent 70%),
      linear-gradient(135deg, #92400e, #78350f)
    `,
    category: 'animal' 
  },
  'tiger': { 
    name: 'Tiger', 
    css: `
      repeating-linear-gradient(
        100deg,
        transparent 0px, transparent 15px,
        rgba(0,0,0,0.7) 15px, rgba(0,0,0,0.7) 25px,
        transparent 25px, transparent 40px
      ),
      linear-gradient(135deg, #ea580c, #c2410c)
    `,
    category: 'animal' 
  },
  'zebra': { 
    name: 'Zebra', 
    css: `
      repeating-linear-gradient(
        110deg,
        rgba(255,255,255,0.9) 0px, rgba(255,255,255,0.9) 20px,
        rgba(0,0,0,0.85) 20px, rgba(0,0,0,0.85) 40px
      ),
      linear-gradient(135deg, #1f2937, #111827)
    `,
    category: 'animal' 
  },
  'snakeskin': { 
    name: 'Snakeskin', 
    css: `
      radial-gradient(ellipse 50% 30% at 50% 50%, transparent 40%, rgba(0,0,0,0.3) 41%, rgba(0,0,0,0.3) 45%, transparent 46%),
      linear-gradient(135deg, #365314, #1a2e05)
    `,
    size: '20px 35px',
    category: 'animal' 
  },

  // === PREMIUM MATERIALS ===
  'carbon-fiber': { 
    name: 'Carbon Fiber', 
    css: `
      repeating-linear-gradient(45deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 4px),
      repeating-linear-gradient(-45deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 4px),
      repeating-linear-gradient(90deg, transparent, rgba(60,60,60,0.1) 1px, rgba(60,60,60,0.1) 2px, transparent 3px),
      linear-gradient(135deg, #1f2937, #111827)
    `,
    category: 'material' 
  },
  'brushed-steel': { 
    name: 'Brushed Steel', 
    css: `
      repeating-linear-gradient(90deg, 
        rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.06) 1px, 
        rgba(0,0,0,0.02) 1px, rgba(0,0,0,0.02) 2px,
        rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px
      ),
      linear-gradient(180deg, rgba(148,163,184,0.2), rgba(100,116,139,0.3)),
      linear-gradient(135deg, #475569, #334155)
    `,
    category: 'material' 
  },
  'diamond-plate': { 
    name: 'Diamond Plate', 
    css: `
      linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%),
      linear-gradient(225deg, rgba(255,255,255,0.1) 25%, transparent 25%),
      linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
      linear-gradient(315deg, rgba(255,255,255,0.1) 25%, transparent 25%),
      linear-gradient(135deg, #52525b, #3f3f46)
    `,
    size: '20px 20px',
    category: 'material' 
  },

  // === ANIMATED EFFECTS ===
  'rainbow-wave': { 
    name: 'Rainbow Wave', 
    css: 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0088ff, #8800ff, #ff0088, #ff0000)',
    size: '400% 100%',
    animated: 'rainbowWave',
    category: 'animated' 
  },
  'nyan-trail': { 
    name: 'Nyan Trail', 
    css: `
      linear-gradient(90deg, 
        #ff0000 0%, #ff0000 14.28%,
        #ff9900 14.28%, #ff9900 28.57%,
        #ffff00 28.57%, #ffff00 42.85%,
        #33ff00 42.85%, #33ff00 57.14%,
        #0099ff 57.14%, #0099ff 71.42%,
        #6633ff 71.42%, #6633ff 85.71%,
        #ff0000 85.71%
      )
    `,
    size: '300% 100%',
    animated: 'nyanTrail',
    category: 'animated' 
  },
  'fire': { 
    name: 'Inferno', 
    css: `
      radial-gradient(ellipse 80% 50% at 50% 100%, rgba(255,200,0,0.6) 0%, transparent 50%),
      radial-gradient(ellipse 60% 40% at 30% 90%, rgba(255,100,0,0.5) 0%, transparent 45%),
      radial-gradient(ellipse 60% 40% at 70% 90%, rgba(255,50,0,0.5) 0%, transparent 45%),
      linear-gradient(0deg, rgba(255,100,0,0.4) 0%, rgba(200,50,0,0.2) 30%, transparent 60%),
      linear-gradient(135deg, #1c1917, #0c0a09)
    `,
    animated: 'fireFlicker',
    category: 'animated' 
  },
  'ice-crystal': { 
    name: 'Ice Crystal', 
    css: `
      radial-gradient(ellipse at 20% 30%, rgba(150,220,255,0.4) 0%, transparent 40%),
      radial-gradient(ellipse at 80% 20%, rgba(100,200,255,0.3) 0%, transparent 35%),
      radial-gradient(ellipse at 50% 70%, rgba(180,230,255,0.35) 0%, transparent 45%),
      radial-gradient(ellipse at 30% 80%, rgba(200,240,255,0.25) 0%, transparent 30%),
      linear-gradient(135deg, #0c4a6e, #082f49, #0e7490)
    `,
    animated: 'iceShimmer',
    category: 'animated' 
  },
  'matrix': { 
    name: 'Matrix Code', 
    css: `
      repeating-linear-gradient(0deg, 
        transparent 0px, transparent 20px, 
        rgba(0,255,65,0.1) 20px, rgba(0,255,65,0.15) 21px
      ),
      repeating-linear-gradient(90deg, 
        transparent 0px, transparent 30px, 
        rgba(0,255,65,0.05) 30px, rgba(0,255,65,0.08) 31px
      ),
      linear-gradient(180deg, rgba(0,50,0,0.8), rgba(0,20,0,0.95))
    `,
    animated: 'matrixRain',
    category: 'animated' 
  },
  'galaxy': { 
    name: 'Galaxy', 
    css: `
      radial-gradient(ellipse 2px 2px at 20% 30%, white, transparent),
      radial-gradient(ellipse 1px 1px at 40% 70%, white, transparent),
      radial-gradient(ellipse 2px 2px at 60% 20%, white, transparent),
      radial-gradient(ellipse 1px 1px at 80% 60%, white, transparent),
      radial-gradient(ellipse 1px 1px at 10% 80%, rgba(255,255,255,0.8), transparent),
      radial-gradient(ellipse 1px 1px at 90% 40%, rgba(255,255,255,0.8), transparent),
      radial-gradient(ellipse 50% 50% at 30% 40%, rgba(138,43,226,0.4), transparent 60%),
      radial-gradient(ellipse 40% 60% at 70% 60%, rgba(59,130,246,0.3), transparent 50%),
      linear-gradient(135deg, #0a0a1f, #1a0a2e, #0a1a2f)
    `,
    animated: 'galaxyRotate',
    category: 'animated' 
  },
  'aurora': { 
    name: 'Aurora Borealis', 
    css: `
      radial-gradient(ellipse 100% 50% at 50% 0%, rgba(0,255,128,0.3), transparent 50%),
      radial-gradient(ellipse 80% 40% at 30% 20%, rgba(0,200,255,0.25), transparent 45%),
      radial-gradient(ellipse 80% 40% at 70% 15%, rgba(128,0,255,0.2), transparent 40%),
      linear-gradient(180deg, rgba(0,50,50,0.3) 0%, transparent 40%),
      linear-gradient(135deg, #0f172a, #1e1b4b)
    `,
    animated: 'auroraWave',
    category: 'animated' 
  },
  'holographic': { 
    name: 'Holographic', 
    css: `
      linear-gradient(135deg, 
        rgba(255,0,128,0.3) 0%, 
        rgba(0,255,255,0.3) 25%, 
        rgba(255,255,0,0.3) 50%, 
        rgba(128,0,255,0.3) 75%, 
        rgba(255,0,128,0.3) 100%
      )
    `,
    size: '400% 400%',
    animated: 'holoShift',
    category: 'animated' 
  },
  'lava-flow': { 
    name: 'Lava Flow', 
    css: `
      radial-gradient(ellipse 40% 30% at 20% 70%, rgba(255,100,0,0.6), transparent),
      radial-gradient(ellipse 50% 40% at 60% 80%, rgba(255,50,0,0.5), transparent),
      radial-gradient(ellipse 30% 35% at 80% 60%, rgba(255,150,0,0.4), transparent),
      linear-gradient(0deg, rgba(255,69,0,0.3) 0%, rgba(139,0,0,0.2) 40%, rgba(50,0,0,0.9) 100%)
    `,
    animated: 'lavaFlow',
    category: 'animated' 
  },
  'electric-storm': { 
    name: 'Electric Storm', 
    css: `
      radial-gradient(ellipse at 30% 50%, rgba(0,150,255,0.3), transparent 50%),
      radial-gradient(ellipse at 70% 40%, rgba(100,200,255,0.25), transparent 45%),
      linear-gradient(180deg, rgba(0,50,100,0.4), rgba(0,0,50,0.9))
    `,
    animated: 'electricPulse',
    category: 'animated' 
  },
  'void': { 
    name: 'Void', 
    css: `
      radial-gradient(ellipse at center, rgba(80,0,120,0.3) 0%, transparent 50%),
      radial-gradient(ellipse at center, rgba(0,0,0,0.95) 30%, rgba(20,0,40,0.98) 100%)
    `,
    animated: 'voidPulse',
    category: 'animated' 
  },
  'synthwave': { 
    name: 'Synthwave Grid', 
    css: `
      linear-gradient(transparent 0%, rgba(255,0,128,0.1) 50%, rgba(255,0,128,0.3) 100%),
      repeating-linear-gradient(90deg, rgba(255,0,128,0.15) 0px, rgba(255,0,128,0.15) 1px, transparent 1px, transparent 40px),
      repeating-linear-gradient(0deg, rgba(0,255,255,0.1) 0px, rgba(0,255,255,0.1) 1px, transparent 1px, transparent 40px),
      linear-gradient(180deg, #0a0015 0%, #1a0030 100%)
    `,
    category: 'animated',
    animated: 'synthwaveScroll'
  },
  'starfield': { 
    name: 'Starfield', 
    css: `
      radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.9), transparent),
      radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.8), transparent),
      radial-gradient(2px 2px at 50% 30%, rgba(255,255,255,1), transparent),
      radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.7), transparent),
      radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.85), transparent),
      radial-gradient(1px 1px at 15% 85%, rgba(255,255,255,0.75), transparent),
      radial-gradient(2px 2px at 85% 45%, rgba(255,255,255,0.95), transparent),
      radial-gradient(1px 1px at 45% 95%, rgba(255,255,255,0.6), transparent),
      linear-gradient(135deg, #030712, #0f172a)
    `,
    size: '200px 200px',
    animated: 'starTwinkle',
    category: 'animated' 
  }
};

// For backwards compatibility
const BG_COLORS = Object.fromEntries(
  Object.entries(BACKGROUNDS).map(([key, val]) => [key, val.css])
);
const BACKGROUND_PATTERNS = { none: { name: 'None', css: 'none', size: null } }; // deprecated
const BG_ANIMATED = Object.entries(BACKGROUNDS)
  .filter(([_, val]) => val.animated)
  .map(([key]) => key);

// ========== PODIUM STYLES ==========
// ========== PODIUM STYLES (with actual visual decorations) ==========
const PODIUM_STYLES = {
  default: { 
    name: 'Classic', 
    description: 'Traditional gold podium',
    decorations: [] 
  },
  champion: { 
    name: 'Champion', 
    description: 'Trophy & laurel wreath',
    decorations: ['trophy', 'laurel-wreath'],
    borderGlow: '#ffd700'
  },
  confetti: { 
    name: 'Confetti Party', 
    description: 'Falling confetti celebration',
    decorations: ['confetti-fall'],
    animated: true
  },
  sparkle: { 
    name: 'Sparkle', 
    description: 'Twinkling star particles',
    decorations: ['sparkles'],
    animated: true
  },
  flames: { 
    name: 'Inferno', 
    description: 'Rising flames & embers',
    decorations: ['flames-bottom', 'ember-particles'],
    borderGlow: '#ff4500',
    animated: true
  },
  neon: { 
    name: 'Neon Glow', 
    description: 'Bright neon with scan lines',
    decorations: ['neon-glow', 'scan-lines'],
    borderGlow: '#00ffff',
    animated: true
  },
  crystal: { 
    name: 'Crystal Ice', 
    description: 'Ice crystals & frost',
    decorations: ['ice-crystals', 'frost-particles'],
    borderGlow: '#67e8f9',
    animated: true
  },
  cosmic: { 
    name: 'Cosmic', 
    description: 'Stars, planets & nebula',
    decorations: ['stars', 'nebula-glow', 'orbit-rings'],
    borderGlow: '#8b5cf6',
    animated: true
  },
  royal: { 
    name: 'Royal', 
    description: 'Crown, ribbons & gold trim',
    decorations: ['crown-top', 'ribbons-hanging', 'gold-trim'],
    borderGlow: '#ffd700'
  },
  cyber: { 
    name: 'Cyber', 
    description: 'Glitch effects & data streams',
    decorations: ['glitch-overlay', 'data-stream'],
    borderGlow: '#00ff88',
    animated: true
  },
  nature: { 
    name: 'Nature', 
    description: 'Vines, leaves & flowers',
    decorations: ['vine-border', 'floating-leaves'],
    borderGlow: '#22c55e',
    animated: true
  },
  void: { 
    name: 'Void', 
    description: 'Dark energy & portal effect',
    decorations: ['void-portal', 'dark-particles'],
    borderGlow: '#6366f1',
    animated: true
  },
  legendary: { 
    name: 'Legendary', 
    description: 'Ultimate combo of effects',
    decorations: ['trophy', 'confetti-fall', 'sparkles', 'ribbons-hanging', 'gold-trim'],
    borderGlow: 'rainbow',
    animated: true
  },
  streamer: { 
    name: 'Streamer', 
    description: 'Party streamers & balloons',
    decorations: ['streamers', 'balloons'],
    animated: true
  },
  military: { 
    name: 'Military', 
    description: 'Medals, stars & honor',
    decorations: ['medal-badge', 'honor-stars'],
    borderGlow: '#b8860b'
  }
};

// ========== DEFAULT COSMETICS ==========
const DEFAULT_COSMETICS = {
  border_style: 'solid',
  border_color: 'gray',
  badge_icon: null,
  name_effect: 'none',
  title: null,
  entrance_animation: 'fade',
  background: 'default',  // Unified background (replaces background_color + background_pattern)
  podium_style: 'default',
  // Legacy compatibility
  background_pattern: 'none',
  background_color: 'default'
};

// ========== LEVEL REWARDS SYSTEM ==========
// Free users unlock cosmetics by leveling up!
const LEVEL_REWARDS = [
  { level: 1, type: 'color', value: 'gray', name: 'Gray Border', icon: '⬜' },
  { level: 5, type: 'badge', value: '⭐', name: 'Star Badge', icon: '⭐' },
  { level: 10, type: 'entrance', value: 'slide', name: 'Slide Entrance', icon: '→' },
  { level: 15, type: 'color', value: 'emerald', name: 'Emerald Border', icon: '💚' },
  { level: 18, type: 'background', value: 'charcoal', name: 'Charcoal', icon: '⬛' },
  { level: 20, type: 'badge', value: '🔥', name: 'Fire Badge', icon: '🔥' },
  { level: 25, type: 'effect', value: 'shadow', name: 'Shadow Text', icon: '▣' },
  { level: 28, type: 'background', value: 'midnight', name: 'Midnight', icon: '🌙' },
  { level: 30, type: 'color', value: 'ruby', name: 'Ruby Border', icon: '❤️' },
  { level: 32, type: 'background', value: 'zebra', name: 'Zebra Print', icon: '🦓' },
  { level: 35, type: 'entrance', value: 'pop', name: 'Pop Entrance', icon: '●' },
  { level: 37, type: 'background', value: 'navy', name: 'Navy', icon: '🔵' },
  { level: 40, type: 'badge', value: '💎', name: 'Diamond Badge', icon: '💎' },
  { level: 42, type: 'background', value: 'military-camo', name: 'Military Camo', icon: '🪖' },
  { level: 45, type: 'border', value: 'glow', name: 'Glow Border', icon: '✦' },
  { level: 47, type: 'background', value: 'forest', name: 'Forest', icon: '🌲' },
  { level: 50, type: 'color', value: 'diamond', name: 'Diamond Border', icon: '💠' },
  { level: 52, type: 'background', value: 'leopard', name: 'Leopard Print', icon: '🐆' },
  { level: 55, type: 'effect', value: 'glow', name: 'Glow Text', icon: '✨' },
  { level: 57, type: 'background', value: 'wine', name: 'Wine', icon: '🍷' },
  { level: 60, type: 'badge', value: '👑', name: 'Crown Badge', icon: '👑' },
  { level: 62, type: 'background', value: 'tiger', name: 'Tiger Print', icon: '🐯' },
  { level: 65, type: 'entrance', value: 'sparkle', name: 'Sparkle Entrance', icon: '✧' },
  { level: 67, type: 'background', value: 'desert-camo', name: 'Desert Camo', icon: '🏜️' },
  { level: 70, type: 'color', value: 'amethyst', name: 'Amethyst Border', icon: '💜' },
  { level: 72, type: 'background', value: 'digital-camo', name: 'Digital Camo', icon: '🔲' },
  { level: 75, type: 'effect', value: 'shimmer', name: 'Shimmer Text', icon: '≋' },
  { level: 77, type: 'background', value: 'ocean', name: 'Ocean', icon: '🌊' },
  { level: 78, type: 'background', value: 'arctic-camo', name: 'Arctic Camo', icon: '❄️' },
  { level: 80, type: 'border', value: 'pulse', name: 'Pulse Border', icon: '◉' },
  { level: 82, type: 'background', value: 'carbon-fiber', name: 'Carbon Fiber', icon: '⬛' },
  { level: 85, type: 'badge', value: '🏆', name: 'Trophy Badge', icon: '🏆' },
  { level: 87, type: 'background', value: 'brushed-steel', name: 'Brushed Steel', icon: '🔩' },
  { level: 90, type: 'color', value: 'gold', name: 'Gold Border', icon: '💛' },
  { level: 92, type: 'background', value: 'pink-camo', name: 'Pink Camo', icon: '💗' },
  { level: 95, type: 'entrance', value: 'lightning', name: 'Lightning Entrance', icon: '⚡' },
  { level: 97, type: 'background', value: 'snakeskin', name: 'Snakeskin', icon: '🐍' },
  { level: 100, type: 'effect', value: 'neon', name: 'Neon Text', icon: '◈' },
  { level: 100, type: 'background', value: 'diamond-plate', name: 'Diamond Plate', icon: '💠' },
  // Podium styles at higher levels
  { level: 30, type: 'podium', value: 'sparkle', name: 'Sparkle Podium', icon: '✨' },
  { level: 50, type: 'podium', value: 'confetti', name: 'Confetti Podium', icon: '🎊' },
  { level: 70, type: 'podium', value: 'champion', name: 'Champion Podium', icon: '🏆' },
  { level: 90, type: 'podium', value: 'military', name: 'Military Podium', icon: '🎖️' },
];

// ========== PRESTIGE REWARDS ==========
// Exclusive rewards for prestiging (resetting at max level)
const PRESTIGE_REWARDS = [
  // Prestige 1 - Rainbow & Sparkles
  { prestige: 1, type: 'badge', value: '🌟', name: 'P1 - Prestige Star', icon: '🌟' },
  { prestige: 1, type: 'background', value: 'rainbow-wave', name: 'P1 - Rainbow Wave', icon: '🌈' },
  { prestige: 1, type: 'podium', value: 'sparkle', name: 'P1 - Sparkle Podium', icon: '✨' },
  // Prestige 2 - Neon & Nyan
  { prestige: 2, type: 'color', value: 'platinum', name: 'P2 - Platinum Border', icon: '🤍' },
  { prestige: 2, type: 'background', value: 'nyan-trail', name: 'P2 - Nyan Trail', icon: '🐱' },
  { prestige: 2, type: 'podium', value: 'neon', name: 'P2 - Neon Podium', icon: '💡' },
  // Prestige 3 - Fire
  { prestige: 3, type: 'entrance', value: 'fire', name: 'P3 - Fire Entrance', icon: '🔥' },
  { prestige: 3, type: 'background', value: 'fire', name: 'P3 - Inferno', icon: '🔥' },
  { prestige: 3, type: 'podium', value: 'flames', name: 'P3 - Flames Podium', icon: '🔥' },
  // Prestige 4 - Galaxy & Cosmic
  { prestige: 4, type: 'effect', value: 'fire', name: 'P4 - Fire Text', icon: '🔥' },
  { prestige: 4, type: 'background', value: 'galaxy', name: 'P4 - Galaxy', icon: '🌌' },
  { prestige: 4, type: 'podium', value: 'cosmic', name: 'P4 - Cosmic Podium', icon: '🌌' },
  // Prestige 5 - Rainbow & Holo
  { prestige: 5, type: 'color', value: 'rainbow', name: 'P5 - Rainbow Border', icon: '🌈' },
  { prestige: 5, type: 'background', value: 'holographic', name: 'P5 - Holographic', icon: '🌈' },
  { prestige: 5, type: 'podium', value: 'confetti', name: 'P5 - Confetti Podium', icon: '🎊' },
  // Prestige 6 - Matrix & Cyber
  { prestige: 6, type: 'badge', value: '💫', name: 'P6 - Cosmic Badge', icon: '💫' },
  { prestige: 6, type: 'background', value: 'matrix', name: 'P6 - Matrix Code', icon: '▼' },
  { prestige: 6, type: 'podium', value: 'cyber', name: 'P6 - Cyber Podium', icon: '🤖' },
  // Prestige 7 - Ice & Crystal
  { prestige: 7, type: 'effect', value: 'ice', name: 'P7 - Ice Text', icon: '❄️' },
  { prestige: 7, type: 'background', value: 'ice-crystal', name: 'P7 - Ice Crystal', icon: '❄️' },
  { prestige: 7, type: 'podium', value: 'crystal', name: 'P7 - Crystal Podium', icon: '💎' },
  // Prestige 8 - Electric Storm
  { prestige: 8, type: 'entrance', value: 'matrix', name: 'P8 - Matrix Entrance', icon: '▼' },
  { prestige: 8, type: 'background', value: 'electric-storm', name: 'P8 - Electric Storm', icon: '⚡' },
  { prestige: 8, type: 'podium', value: 'streamer', name: 'P8 - Streamer Podium', icon: '🎈' },
  // Prestige 9 - Aurora & Synthwave
  { prestige: 9, type: 'effect', value: 'glitch', name: 'P9 - Glitch Text', icon: '⚠' },
  { prestige: 9, type: 'background', value: 'aurora', name: 'P9 - Aurora Borealis', icon: '🌌' },
  { prestige: 9, type: 'background', value: 'synthwave', name: 'P9 - Synthwave Grid', icon: '🕹️' },
  // Prestige 10 - Legendary & Void
  { prestige: 10, type: 'badge', value: '🐉', name: 'P10 - Dragon Badge', icon: '🐉' },
  { prestige: 10, type: 'background', value: 'void', name: 'P10 - Void', icon: '🕳️' },
  { prestige: 10, type: 'background', value: 'lava-flow', name: 'P10 - Lava Flow', icon: '🌋' },
  { prestige: 10, type: 'background', value: 'starfield', name: 'P10 - Starfield', icon: '⭐' },
  { prestige: 10, type: 'podium', value: 'legendary', name: 'P10 - Legendary Podium', icon: '👑' },
];

// ========== PREMIUM EXCLUSIVE ==========
const PREMIUM_EXCLUSIVE = {
  colors: ['obsidian', 'rose', 'sunset', 'toxic'],
  backgrounds: [
    // All animated/special backgrounds are premium
    'rainbow-wave', 'nyan-trail', 'fire', 'ice-crystal', 'matrix', 'galaxy', 
    'aurora', 'holographic', 'lava-flow', 'electric-storm', 'void', 'synthwave', 'starfield'
  ],
  podiums: ['royal', 'void', 'nature', 'legendary'],
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
  if (type === 'background' && value === 'default') return true;
  if (type === 'bgColor' && value === 'default') return true; // Legacy compat
  if (type === 'podium' && value === 'default') return true;
  
  // Check level rewards
  const levelReward = LEVEL_REWARDS.find(r => r.type === type && r.value === value);
  if (levelReward && level >= levelReward.level) return true;
  
  // Also check background type for old bgColor lookups (backwards compat)
  if (type === 'bgColor') {
    const bgLevelReward = LEVEL_REWARDS.find(r => r.type === 'background' && r.value === value);
    if (bgLevelReward && level >= bgLevelReward.level) return true;
  }
  
  // Check prestige rewards
  const prestigeReward = PRESTIGE_REWARDS.find(r => r.type === type && r.value === value);
  if (prestigeReward && prestige >= prestigeReward.prestige) return true;
  
  // Also check background type for old bgColor lookups (backwards compat)
  if (type === 'bgColor') {
    const bgPrestigeReward = PRESTIGE_REWARDS.find(r => r.type === 'background' && r.value === value);
    if (bgPrestigeReward && prestige >= bgPrestigeReward.prestige) return true;
  }
  
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

// ========== HELPER: Get unified background style ==========
function getBackgroundStyle(backgroundKey, legacyPatternKey = null) {
  // New unified system - check BACKGROUNDS first
  const bg = BACKGROUNDS[backgroundKey];
  if (bg) {
    return {
      background: bg.css,
      backgroundSize: bg.size || null,
      animated: bg.animated || null
    };
  }
  
  // Legacy fallback - check BG_COLORS 
  const bgColor = BG_COLORS[backgroundKey] || BG_COLORS.default;
  const pattern = legacyPatternKey ? BACKGROUND_PATTERNS[legacyPatternKey] : null;
  
  if (!pattern || pattern.css === 'none') {
    return { background: bgColor, backgroundSize: null, animated: null };
  }
  
  // Combine pattern with background color (legacy)
  return {
    background: `${pattern.css}, ${bgColor}`,
    backgroundSize: pattern.size ? `${pattern.size}, 100% 100%` : null,
    animated: pattern.animated || null
  };
}

// Helper to get animation class for background
function getBackgroundAnimClass(backgroundKey) {
  const bg = BACKGROUNDS[backgroundKey];
  if (bg && bg.animated) {
    return `tgco-bg-${backgroundKey}`;
  }
  // Legacy check
  if (BG_ANIMATED.includes(backgroundKey)) {
    return `tgco-bgc-${backgroundKey}`;
  }
  return null;
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

  /* ========== UNIFIED BACKGROUND ANIMATIONS ========== */
  @keyframes tgcoBgRainbowWave { 0% { background-position: 0% 50%; } 100% { background-position: 400% 50%; } }
  @keyframes tgcoBgNyanTrail { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } }
  @keyframes tgcoBgFireFlicker { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.2); } }
  @keyframes tgcoBgIceShimmer { 0%, 100% { filter: brightness(1) hue-rotate(0deg); } 50% { filter: brightness(1.15) hue-rotate(5deg); } }
  @keyframes tgcoBgMatrixRain { 0% { background-position: 0 0; } 100% { background-position: 0 100px; } }
  @keyframes tgcoBgGalaxyRotate { 0% { filter: saturate(1) brightness(1); } 50% { filter: saturate(1.2) brightness(1.1); } 100% { filter: saturate(1) brightness(1); } }
  @keyframes tgcoBgAuroraWave { 0%, 100% { filter: hue-rotate(0deg) brightness(1); } 50% { filter: hue-rotate(20deg) brightness(1.15); } }
  @keyframes tgcoBgHoloShift { 0% { background-position: 0% 0%; } 100% { background-position: 400% 400%; } }
  @keyframes tgcoBgLavaFlow { 0%, 100% { filter: brightness(1); background-position: 0 0; } 50% { filter: brightness(1.3); background-position: 0 10px; } }
  @keyframes tgcoBgElectricPulse { 0%, 100% { filter: brightness(1); } 25% { filter: brightness(1.4); } 50% { filter: brightness(0.9); } 75% { filter: brightness(1.3); } }
  @keyframes tgcoBgVoidPulse { 0%, 100% { filter: brightness(0.9); } 50% { filter: brightness(1.1); } }
  @keyframes tgcoBgSynthwave { 0% { background-position: 0 0; } 100% { background-position: 0 80px; } }
  @keyframes tgcoBgStarTwinkle { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }

  /* Apply animations to unified backgrounds */
  .tgco-bg-rainbow-wave { background-size: 400% 100% !important; animation: tgcoBgRainbowWave 3s linear infinite !important; }
  .tgco-bg-nyan-trail { background-size: 300% 100% !important; animation: tgcoBgNyanTrail 2s linear infinite !important; }
  .tgco-bg-fire { animation: tgcoBgFireFlicker 0.8s ease-in-out infinite !important; }
  .tgco-bg-ice-crystal { animation: tgcoBgIceShimmer 3s ease-in-out infinite !important; }
  .tgco-bg-matrix { animation: tgcoBgMatrixRain 2s linear infinite !important; }
  .tgco-bg-galaxy { animation: tgcoBgGalaxyRotate 6s ease-in-out infinite !important; }
  .tgco-bg-aurora { animation: tgcoBgAuroraWave 5s ease-in-out infinite !important; }
  .tgco-bg-holographic { background-size: 400% 400% !important; animation: tgcoBgHoloShift 4s linear infinite !important; }
  .tgco-bg-lava-flow { animation: tgcoBgLavaFlow 2s ease-in-out infinite !important; }
  .tgco-bg-electric-storm { animation: tgcoBgElectricPulse 1.5s ease-in-out infinite !important; }
  .tgco-bg-void { animation: tgcoBgVoidPulse 4s ease-in-out infinite !important; }
  .tgco-bg-synthwave { animation: tgcoBgSynthwave 3s linear infinite !important; }
  .tgco-bg-starfield { animation: tgcoBgStarTwinkle 2s ease-in-out infinite !important; }

  /* Legacy animated background color classes (backwards compat) */
  @keyframes tgcoBgRainbow { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
  @keyframes tgcoBgHolo { 0%, 100% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } }

  .tgco-bgc-rainbow-wave, .tgco-bgc-rainbow { background-size: 400% 100% !important; animation: tgcoBgRainbowWave 3s linear infinite !important; }
  .tgco-bgc-nyan-trail { background-size: 300% 100% !important; animation: tgcoBgNyanTrail 2s linear infinite !important; }
  .tgco-bgc-fire { animation: tgcoBgFireFlicker 0.8s ease-in-out infinite !important; }
  .tgco-bgc-ice-crystal { animation: tgcoBgIceShimmer 3s ease-in-out infinite !important; }
  .tgco-bgc-matrix { animation: tgcoBgMatrixRain 2s linear infinite !important; }
  .tgco-bgc-galaxy { animation: tgcoBgGalaxyRotate 6s ease-in-out infinite !important; }
  .tgco-bgc-aurora { animation: tgcoBgAuroraWave 5s ease-in-out infinite !important; }
  .tgco-bgc-holographic { background-size: 400% 400% !important; animation: tgcoBgHoloShift 4s linear infinite !important; }
  .tgco-bgc-lava-flow { animation: tgcoBgLavaFlow 2s ease-in-out infinite !important; }
  .tgco-bgc-electric-storm { animation: tgcoBgElectricPulse 1.5s ease-in-out infinite !important; }
  .tgco-bgc-void { animation: tgcoBgVoidPulse 4s ease-in-out infinite !important; }
  .tgco-bgc-synthwave { animation: tgcoBgSynthwave 3s linear infinite !important; }

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
    overflow: visible;
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

  /* ========== PODIUM DECORATION ELEMENTS ========== */
  .tgco-podium-decorations { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; overflow: visible; }

  /* CHAMPION - Trophy & Laurel Wreath */
  .tgco-podium.podium-champion .tgco-podium-decorations::before {
    content: '🏆';
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2.5rem;
    filter: drop-shadow(0 0 10px rgba(255,215,0,0.5));
    animation: tgcoTrophyBounce 2s ease-in-out infinite;
  }
  .tgco-podium.podium-champion .tgco-podium-decorations::after {
    content: '🌿';
    position: absolute;
    top: 5px;
    left: 5px;
    font-size: 1.5rem;
    opacity: 0.7;
  }
  .tgco-podium.podium-champion { box-shadow: 0 0 40px rgba(255,215,0,0.3), inset 0 0 20px rgba(255,215,0,0.1); }
  @keyframes tgcoTrophyBounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-5px); } }

  /* CONFETTI - Falling confetti particles */
  .tgco-podium.podium-confetti { overflow: hidden; }
  .tgco-podium.podium-confetti .tgco-podium-decorations::before,
  .tgco-podium.podium-confetti .tgco-podium-decorations::after {
    content: '🎊';
    position: absolute;
    font-size: 1.2rem;
    animation: tgcoConfettiFall 3s linear infinite;
  }
  .tgco-podium.podium-confetti .tgco-podium-decorations::before { left: 20%; animation-delay: 0s; }
  .tgco-podium.podium-confetti .tgco-podium-decorations::after { left: 70%; animation-delay: 1.5s; content: '🎉'; }
  @keyframes tgcoConfettiFall { 
    0% { top: -20px; opacity: 1; transform: rotate(0deg) translateX(0); } 
    100% { top: 110%; opacity: 0.3; transform: rotate(360deg) translateX(20px); } 
  }

  /* SPARKLE - Twinkling stars */
  .tgco-podium.podium-sparkle .tgco-podium-decorations::before,
  .tgco-podium.podium-sparkle .tgco-podium-decorations::after {
    content: '✨';
    position: absolute;
    font-size: 1rem;
    animation: tgcoSparkle 1.5s ease-in-out infinite;
  }
  .tgco-podium.podium-sparkle .tgco-podium-decorations::before { top: 10%; left: 10%; animation-delay: 0s; }
  .tgco-podium.podium-sparkle .tgco-podium-decorations::after { top: 15%; right: 10%; animation-delay: 0.75s; content: '⭐'; }
  .tgco-podium.podium-sparkle { box-shadow: 0 0 30px rgba(255,255,255,0.2); }
  @keyframes tgcoSparkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }

  /* FLAMES - Rising fire & embers */
  .tgco-podium.podium-flames {
    border-color: #ff4500 !important;
    box-shadow: 0 0 30px rgba(255,69,0,0.4), 0 -10px 40px rgba(255,140,0,0.3);
  }
  .tgco-podium.podium-flames .tgco-podium-decorations::before {
    content: '🔥';
    position: absolute;
    bottom: -5px;
    left: 20%;
    font-size: 1.8rem;
    animation: tgcoFlameRise 0.8s ease-in-out infinite alternate;
  }
  .tgco-podium.podium-flames .tgco-podium-decorations::after {
    content: '🔥';
    position: absolute;
    bottom: -5px;
    right: 20%;
    font-size: 1.5rem;
    animation: tgcoFlameRise 0.6s ease-in-out infinite alternate-reverse;
  }
  @keyframes tgcoFlameRise { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-8px) scale(1.1); } }

  /* NEON - Bright glow with scan lines */
  .tgco-podium.podium-neon {
    border-color: #00ffff !important;
    box-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px rgba(0,255,255,0.3);
    animation: tgcoNeonPulse 2s ease-in-out infinite;
  }
  .tgco-podium.podium-neon .tgco-podium-decorations::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px);
    pointer-events: none;
  }
  @keyframes tgcoNeonPulse { 0%, 100% { box-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff; } 50% { box-shadow: 0 0 30px #00ffff, 0 0 60px #00ffff, 0 0 80px rgba(0,255,255,0.5); } }

  /* CRYSTAL - Ice crystals & frost */
  .tgco-podium.podium-crystal {
    border-color: #67e8f9 !important;
    background: linear-gradient(135deg, rgba(103,232,249,0.15), rgba(6,182,212,0.08)) !important;
    box-shadow: 0 0 30px rgba(103,232,249,0.3), inset 0 0 20px rgba(255,255,255,0.1);
  }
  .tgco-podium.podium-crystal .tgco-podium-decorations::before {
    content: '❄️';
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 1.2rem;
    animation: tgcoSnowfall 4s linear infinite;
  }
  .tgco-podium.podium-crystal .tgco-podium-decorations::after {
    content: '💎';
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.5rem;
    animation: tgcoSparkle 2s ease-in-out infinite;
  }
  @keyframes tgcoSnowfall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(150px) rotate(360deg); opacity: 0; } }

  /* COSMIC - Stars & nebula */
  .tgco-podium.podium-cosmic {
    border-color: #8b5cf6 !important;
    background: radial-gradient(ellipse at top, rgba(139,92,246,0.25), transparent 60%), 
                radial-gradient(ellipse at bottom, rgba(59,130,246,0.2), transparent 50%),
                linear-gradient(135deg, rgba(15,15,35,0.95), rgba(30,20,50,0.95)) !important;
    box-shadow: 0 0 40px rgba(139,92,246,0.3);
  }
  .tgco-podium.podium-cosmic .tgco-podium-decorations::before {
    content: '🌟';
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 0.9rem;
    animation: tgcoStarTwinkle 1.5s ease-in-out infinite;
  }
  .tgco-podium.podium-cosmic .tgco-podium-decorations::after {
    content: '🪐';
    position: absolute;
    top: -20px;
    right: -10px;
    font-size: 2rem;
    animation: tgcoOrbit 8s linear infinite;
  }
  @keyframes tgcoStarTwinkle { 0%, 100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
  @keyframes tgcoOrbit { 0% { transform: rotate(0deg) translateX(5px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(5px) rotate(-360deg); } }

  /* ROYAL - Crown & ribbons */
  .tgco-podium.podium-royal {
    border-color: #ffd700 !important;
    background: linear-gradient(180deg, rgba(255,215,0,0.2), rgba(139,69,19,0.12)) !important;
    box-shadow: 0 0 40px rgba(255,215,0,0.25), inset 0 0 30px rgba(255,215,0,0.1);
  }
  .tgco-podium.podium-royal .tgco-podium-decorations::before {
    content: '👑';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2rem;
    filter: drop-shadow(0 0 8px rgba(255,215,0,0.6));
  }
  .tgco-podium.podium-royal .tgco-podium-decorations::after {
    content: '🎀';
    position: absolute;
    top: 0;
    right: -5px;
    font-size: 1.5rem;
    transform: rotate(15deg);
  }

  /* CYBER - Glitch & data */
  .tgco-podium.podium-cyber {
    border-color: #00ff88 !important;
    background: linear-gradient(180deg, rgba(0,255,136,0.1), rgba(0,50,30,0.5)) !important;
    box-shadow: 0 0 20px rgba(0,255,136,0.4);
    animation: tgcoCyberGlitch 3s ease-in-out infinite;
  }
  .tgco-podium.podium-cyber .tgco-podium-decorations::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,255,136,0.05) 2px, rgba(0,255,136,0.05) 4px);
  }
  .tgco-podium.podium-cyber .tgco-podium-decorations::after {
    content: '⚡';
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 1.2rem;
    animation: tgcoDataPulse 0.5s ease-in-out infinite;
  }
  @keyframes tgcoCyberGlitch { 0%, 90%, 100% { transform: translateX(0); } 92% { transform: translateX(-2px); } 94% { transform: translateX(2px); } 96% { transform: translateX(-1px); } }
  @keyframes tgcoDataPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

  /* NATURE - Vines & leaves */
  .tgco-podium.podium-nature {
    border-color: #22c55e !important;
    background: linear-gradient(180deg, rgba(34,197,94,0.12), rgba(21,128,61,0.08)) !important;
    box-shadow: 0 0 25px rgba(34,197,94,0.2);
  }
  .tgco-podium.podium-nature .tgco-podium-decorations::before {
    content: '🌿';
    position: absolute;
    top: 0;
    left: 0;
    font-size: 1.3rem;
    transform: rotate(-30deg);
  }
  .tgco-podium.podium-nature .tgco-podium-decorations::after {
    content: '🍃';
    position: absolute;
    top: 20%;
    right: 5px;
    font-size: 1rem;
    animation: tgcoLeafFloat 4s ease-in-out infinite;
  }
  @keyframes tgcoLeafFloat { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(10px) rotate(15deg); } }

  /* VOID - Dark energy portal */
  .tgco-podium.podium-void {
    border-color: #6366f1 !important;
    background: radial-gradient(ellipse at center, rgba(99,102,241,0.2), rgba(0,0,0,0.9)) !important;
    box-shadow: 0 0 50px rgba(99,102,241,0.4), inset 0 0 30px rgba(0,0,0,0.5);
    animation: tgcoVoidPulse 3s ease-in-out infinite;
  }
  .tgco-podium.podium-void .tgco-podium-decorations::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80%;
    height: 80%;
    transform: translate(-50%, -50%);
    border: 2px solid rgba(99,102,241,0.3);
    border-radius: 50%;
    animation: tgcoVoidRing 4s linear infinite;
  }
  @keyframes tgcoVoidPulse { 0%, 100% { box-shadow: 0 0 30px rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 60px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2); } }
  @keyframes tgcoVoidRing { 0% { transform: translate(-50%, -50%) rotate(0deg) scale(0.8); opacity: 0.5; } 100% { transform: translate(-50%, -50%) rotate(360deg) scale(1.2); opacity: 0; } }

  /* LEGENDARY - Ultimate combo */
  .tgco-podium.podium-legendary {
    border: 3px solid transparent !important;
    background: linear-gradient(rgba(15,15,25,0.9), rgba(15,15,25,0.9)) padding-box,
                linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0088ff, #ff0088, #ff0000) border-box !important;
    background-size: 100% 100%, 300% 100% !important;
    animation: tgcoLegendaryRainbow 3s linear infinite, tgcoLegendaryPulse 2s ease-in-out infinite;
    box-shadow: 0 0 40px rgba(255,215,0,0.4), 0 0 60px rgba(255,100,0,0.2);
  }
  .tgco-podium.podium-legendary .tgco-podium-decorations::before {
    content: '👑';
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2.5rem;
    filter: drop-shadow(0 0 15px rgba(255,215,0,0.8));
    animation: tgcoTrophyBounce 1.5s ease-in-out infinite;
  }
  .tgco-podium.podium-legendary .tgco-podium-decorations::after {
    content: '✨';
    position: absolute;
    top: 10%;
    right: 10%;
    font-size: 1.5rem;
    animation: tgcoSparkle 1s ease-in-out infinite;
  }
  @keyframes tgcoLegendaryRainbow { 0% { background-position: 0 0, 0% 50%; } 100% { background-position: 0 0, 300% 50%; } }
  @keyframes tgcoLegendaryPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }

  /* STREAMER - Party streamers & balloons */
  .tgco-podium.podium-streamer {
    box-shadow: 0 0 30px rgba(255,100,200,0.3);
  }
  .tgco-podium.podium-streamer .tgco-podium-decorations::before {
    content: '🎈';
    position: absolute;
    top: -15px;
    left: 10px;
    font-size: 1.8rem;
    animation: tgcoBalloonFloat 3s ease-in-out infinite;
  }
  .tgco-podium.podium-streamer .tgco-podium-decorations::after {
    content: '🎊';
    position: absolute;
    top: -10px;
    right: 10px;
    font-size: 1.5rem;
    animation: tgcoBalloonFloat 3s ease-in-out infinite reverse;
  }
  @keyframes tgcoBalloonFloat { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-10px) rotate(5deg); } }

  /* MILITARY - Medals & honor */
  .tgco-podium.podium-military {
    border-color: #b8860b !important;
    background: linear-gradient(180deg, rgba(184,134,11,0.15), rgba(139,90,43,0.1)) !important;
    box-shadow: 0 0 25px rgba(184,134,11,0.3);
  }
  .tgco-podium.podium-military .tgco-podium-decorations::before {
    content: '🎖️';
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2rem;
  }
  .tgco-podium.podium-military .tgco-podium-decorations::after {
    content: '⭐';
    position: absolute;
    top: 5px;
    right: 8px;
    font-size: 1rem;
    color: #ffd700;
  }

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
  if (isPremium && cosmetics.title) c.title = cosmetics.title;
  
  // Unified background (with backwards compat)
  const bgKey = cosmetics.background || cosmetics.background_color || 'default';
  if (isCosmeticUnlocked('background', bgKey, unlockOpts)) c.background = bgKey;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.border_style !== 'solid' || c.name_effect !== 'none' || c.title || c.background !== 'default';
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

  // Add animation class for animated backgrounds
  const bgAnimClass = getBackgroundAnimClass(c.background);
  if (bgAnimClass) classes.push(bgAnimClass);

  const nameClasses = ['tgco-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') nameClasses.push(`tgco-effect-${c.name_effect}`);

  const badgeHtml = (hasCosmetics && c.badge_icon) ? `<span class="tgco-badge">${escapeHtml(c.badge_icon)}</span>` : '';
  const titleHtml = (hasCosmetics && c.title) ? `<span class="tgco-title">${escapeHtml(c.title)}</span>` : '';

  let styleAttr = '';
  if (hasCosmetics) {
    const styles = [];
    if (!isRainbow) { styles.push(`--tgco-color: ${color}`); styles.push(`border-color: ${color}`); }
    
    // Apply unified background
    const bgStyle = getBackgroundStyle(c.background);
    styles.push(`background: ${bgStyle.background} !important`);
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
  if (isPremium && cosmetics.title) c.title = cosmetics.title;
  
  // Unified background
  const bgKey = cosmetics.background || cosmetics.background_color || 'default';
  if (isCosmeticUnlocked('background', bgKey, unlockOpts)) c.background = bgKey;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.border_style !== 'solid' || c.name_effect !== 'none' || c.title || c.background !== 'default';
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
  
  // Apply unified background
  if (hasCosmetics && c.background !== 'default') {
    const bgStyle = getBackgroundStyle(c.background);
    cardStyle += ` background: ${bgStyle.background} !important;`;
    if (bgStyle.backgroundSize) cardStyle += ` background-size: ${bgStyle.backgroundSize};`;
    
    const bgAnimClass = getBackgroundAnimClass(c.background);
    if (bgAnimClass) cardClasses.push(bgAnimClass);
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
  if (isPremium && cosmetics.title) c.title = cosmetics.title;
  if (cosmetics.avatar) c.avatar = cosmetics.avatar;
  
  // Unified background
  const bgKey = cosmetics.background || cosmetics.background_color || 'default';
  if (isCosmeticUnlocked('background', bgKey, unlockOpts)) c.background = bgKey;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title || c.podium_style !== 'default' || c.background !== 'default';
  const color = COSMETIC_COLORS[c.border_color] || (rank === 1 ? '#ffd700' : rank === 2 ? '#c0c0c0' : '#cd7f32');

  const classes = ['tgco-podium', `rank-${rank}`];
  if (c.podium_style && c.podium_style !== 'default') classes.push(`podium-${c.podium_style}`);

  // Add animation class for animated backgrounds
  const bgAnimClass = getBackgroundAnimClass(c.background);
  if (bgAnimClass) classes.push(bgAnimClass);

  const nameClasses = ['tgco-podium-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') nameClasses.push(`tgco-effect-${c.name_effect}`);

  const avatarDisplay = c.avatar || c.badge_icon || name.charAt(0).toUpperCase();

  let bgStyle = '';
  if (c.background !== 'default') {
    const bg = getBackgroundStyle(c.background);
    bgStyle = `background: ${bg.background} !important;`;
    if (bg.backgroundSize) bgStyle += ` background-size: ${bg.backgroundSize};`;
  }

  const podiumColorStyle = c.podium_style !== 'default' ? `--podium-color: ${color};` : '';
  const rankLabels = { 1: 'Champion', 2: 'Silver', 3: 'Bronze' };
  const nameStyle = hasCosmetics ? `color: ${color};` : '';
  const scoreText = scoreUnit ? `${score.toLocaleString()} ${scoreUnit}` : score.toLocaleString();

  // Add decorations container for podium styles
  const decorationsHtml = c.podium_style !== 'default' ? '<div class="tgco-podium-decorations"></div>' : '';

  return `<div class="${classes.join(' ')}" style="${bgStyle}${podiumColorStyle}">${decorationsHtml}<div class="tgco-podium-rank">${rank}</div><div class="tgco-podium-label">${rankLabels[rank] || ''}</div><div class="tgco-podium-avatar">${avatarDisplay}</div><div class="${nameClasses.join(' ')}" style="${nameStyle}">${escapeHtml(name)}</div>${c.title ? `<div class="tgco-podium-title">${escapeHtml(c.title)}</div>` : ''}<div class="tgco-podium-score">${scoreText}</div>${meta ? `<div class="tgco-podium-meta">${escapeHtml(meta)}</div>` : ''}</div>`.trim();
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
  if (isPremium && cosmetics.title) c.title = cosmetics.title;
  
  // Unified background
  const bgKey = cosmetics.background || cosmetics.background_color || 'default';
  if (isCosmeticUnlocked('background', bgKey, unlockOpts)) c.background = bgKey;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title || c.background !== 'default';
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

  // Apply unified background
  let itemStyle = '';
  if (hasCosmetics && c.background !== 'default') {
    const bgStyle = getBackgroundStyle(c.background);
    itemStyle = `style="background: ${bgStyle.background} !important;"`;
    const bgAnimClass = getBackgroundAnimClass(c.background);
    if (bgAnimClass) classes.push(bgAnimClass);
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
  if (isPremium && cosmetics.title) c.title = cosmetics.title;
  
  // Unified background
  const bgKey = cosmetics.background || cosmetics.background_color || 'default';
  if (isCosmeticUnlocked('background', bgKey, unlockOpts)) c.background = bgKey;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title || c.background !== 'default';
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

  // Apply unified background
  let itemStyle = '';
  if (hasCosmetics && c.background !== 'default') {
    const bgStyle = getBackgroundStyle(c.background);
    itemStyle = `style="background: ${bgStyle.background} !important;"`;
    const bgAnimClass = getBackgroundAnimClass(c.background);
    if (bgAnimClass) classes.push(bgAnimClass);
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
  if (isPremium && cosmetics.title) c.title = cosmetics.title;
  
  // Unified background
  const bgKey = cosmetics.background || cosmetics.background_color || 'default';
  if (isCosmeticUnlocked('background', bgKey, unlockOpts)) c.background = bgKey;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title || c.background !== 'default';
  const color = COSMETIC_COLORS[c.border_color] || '#fbbf24';
  
  const classes = ['winner-card'];
  if (hasCosmetics && c.border_color) classes.push(`${c.border_color}-border`);

  const nameClasses = ['winner-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') nameClasses.push(`tgco-effect-${c.name_effect}`);

  const badge = (hasCosmetics && c.badge_icon) ? c.badge_icon + ' ' : '';
  const title = (hasCosmetics && c.title) ? `<div class="winner-title">${escapeHtml(c.title)}</div>` : '';
  const crown = showCrown ? '<div class="winner-crown">👑</div>' : '';
  const nameStyle = hasCosmetics ? `color: ${color};` : '';

  // Apply unified background
  let cardStyle = '';
  if (hasCosmetics && c.background !== 'default') {
    const bgStyle = getBackgroundStyle(c.background);
    cardStyle = `style="background: ${bgStyle.background} !important;"`;
    const bgAnimClass = getBackgroundAnimClass(c.background);
    if (bgAnimClass) classes.push(bgAnimClass);
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
  if (isPremium && cosmetics.title) c.title = cosmetics.title;
  
  // Unified background
  const bgKey = cosmetics.background || cosmetics.background_color || 'default';
  if (isCosmeticUnlocked('background', bgKey, unlockOpts)) c.background = bgKey;

  const hasCosmetics = c.badge_icon || c.border_color !== 'gray' || c.name_effect !== 'none' || c.title || c.background !== 'default';
  const color = COSMETIC_COLORS[c.border_color] || COSMETIC_COLORS.gray;
  
  const classes = ['global-lb-item'];
  if (hasCosmetics && c.border_color) classes.push(`${c.border_color}-border`);

  const rankClass = rank <= 3 ? `top-${rank}` : '';
  
  const nameClasses = ['tgco-name'];
  if (hasCosmetics && c.name_effect && c.name_effect !== 'none') nameClasses.push(`tgco-effect-${c.name_effect}`);
  const badge = (hasCosmetics && c.badge_icon) ? `${c.badge_icon} ` : '';
  const nameStyle = hasCosmetics ? `color: ${color};` : '';
  const title = (hasCosmetics && c.title) ? `<div class="global-lb-title">${escapeHtml(c.title)}</div>` : '';

  // Apply unified background
  let itemStyle = '';
  if (hasCosmetics && c.background !== 'default') {
    const bgStyle = getBackgroundStyle(c.background);
    itemStyle = `style="background: ${bgStyle.background} !important;"`;
    const bgAnimClass = getBackgroundAnimClass(c.background);
    if (bgAnimClass) classes.push(bgAnimClass);
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
    BACKGROUNDS,        // New unified backgrounds
    BG_COLORS,          // Legacy compat
    BG_ANIMATED,
    BACKGROUND_PATTERNS, // Legacy compat (deprecated)
    PODIUM_STYLES,
    DEFAULT_COSMETICS,
    LEVEL_REWARDS,
    PRESTIGE_REWARDS,
    PREMIUM_EXCLUSIVE,
    LEVEL_THRESHOLDS,
    getLevelFromXP
  };
}
