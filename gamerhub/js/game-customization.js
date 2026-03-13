// Game Customization - Applies premium host customizations to game pages
(function() {
    var PRESETS = {
        sunset: 'linear-gradient(135deg, #ff6b35 0%, #f72585 50%, #7209b7 100%)',
        galaxy: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 30%, #415a77 60%, #778da9 100%)',
        ocean: 'linear-gradient(135deg, #023e8a 0%, #0077b6 40%, #00b4d8 70%, #90e0ef 100%)',
        party: 'linear-gradient(135deg, #f72585 0%, #7209b7 25%, #3a0ca3 50%, #4361ee 75%, #4cc9f0 100%)',
        neon: 'linear-gradient(135deg, #0a0a0f 0%, #1a0030 30%, #2d0050 60%, #0a0a0f 100%)',
        forest: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 40%, #40916c 70%, #52b788 100%)',
        lava: 'linear-gradient(135deg, #1a0000 0%, #4a0000 30%, #8b0000 60%, #ff4500 100%)',
        arctic: 'linear-gradient(135deg, #0b1120 0%, #1a2744 30%, #2e4a7a 60%, #6b8fc7 100%)'
    };

    var THEME_COLORS = {
        purple: '#a855f7',
        pink: '#ec4899',
        blue: '#3b82f6',
        cyan: '#06b6d4',
        red: '#ef4444',
        orange: '#f97316',
        green: '#22c55e',
        teal: '#14b8a6',
        gold: '#fbbf24',
        indigo: '#6366f1'
    };

    window.GameCustomization = {
        PRESETS: PRESETS,
        THEME_COLORS: THEME_COLORS,

        apply: function(c) {
            if (!c) return;

            // Custom title
            if (c.customTitle) {
                var titleEl = document.getElementById('custom-game-title');
                if (!titleEl) {
                    titleEl = document.createElement('div');
                    titleEl.id = 'custom-game-title';
                    titleEl.style.cssText = 'text-align:center;font-family:"Bebas Neue",sans-serif;font-size:1.6rem;letter-spacing:4px;color:#fbbf24;padding:6px 0 2px;text-shadow:0 0 20px rgba(251,191,36,0.3);z-index:10;position:relative;';
                    var main = document.querySelector('main');
                    if (main) main.prepend(titleEl);
                }
                titleEl.textContent = c.customTitle;
            }

            // Custom background
            var bgEl = document.querySelector('.bg-gradient') || document.querySelector('.bg-effects') || document.querySelector('.bg-container');
            if (bgEl) {
                if (c.customBackgroundImage) {
                    bgEl.style.background = 'url(' + c.customBackgroundImage + ') center/cover no-repeat';
                    bgEl.style.opacity = '0.4';
                } else if (c.customBackground && PRESETS[c.customBackground]) {
                    bgEl.style.background = PRESETS[c.customBackground];
                }
            }

            // Theme color
            if (c.themeColor && THEME_COLORS[c.themeColor]) {
                var color = THEME_COLORS[c.themeColor];
                document.documentElement.style.setProperty('--accent', color);
                document.documentElement.style.setProperty('--accent-glow', color + '66');
                // Also try game-specific variables
                document.documentElement.style.setProperty('--hot', color);
                document.documentElement.style.setProperty('--primary', color);
            }

            // Logo
            if (c.logoImage) {
                var logo = document.getElementById('custom-logo');
                if (!logo) {
                    logo = document.createElement('img');
                    logo.id = 'custom-logo';
                    logo.style.cssText = 'position:fixed;top:68px;right:14px;max-width:64px;max-height:64px;z-index:101;border-radius:10px;opacity:0.85;box-shadow:0 4px 15px rgba(0,0,0,0.4);';
                    document.body.appendChild(logo);
                }
                logo.src = c.logoImage;
            }
        }
    };
})();
