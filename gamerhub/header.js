/* ========================================
   THEGAMING.CO - SHARED HEADER SYSTEM
   ======================================== */

(function() {
    'use strict';

    const SUPABASE_URL = 'https://tvvivtmzofsyehatzlvl.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dml2dG16b2ZzeWVoYXR6bHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4OTExODYsImV4cCI6MjA4MDQ2NzE4Nn0.Qy8kHMO0Nb4yJ0ZHjby7RuQtzwWB8rUcZvkdnbL1b3M';
    
    const CACHE_LABEL = 'tgco_header_label';
    const CACHE_FULL = 'tgco_header_full';

    // Load social system (friends button, sidebar)
    function loadSocialSystem() {
        if (!document.querySelector('link[href="/social.css"]')) {
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = '/social.css';
            document.head.appendChild(css);
        }
        if (!document.querySelector('script[src="/social.js"]')) {
            const js = document.createElement('script');
            js.src = '/social.js';
            js.defer = true;
            document.body.appendChild(js);
        }
    }

    // Check if this is a game page that needs a back button
    function needsBackButton() {
        const path = window.location.pathname;
        return path.includes('/games/');
    }

    // Generate header HTML
    function generateHeaderHTML() {
        const showBack = needsBackButton();
        
        const backButtonHTML = showBack ? `
            <a href="javascript:history.back()" class="back-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Back</span>
            </a>
        ` : '';

        return `
            <header>
                <nav class="nav-inner">
                    <div class="nav-left">
                        ${backButtonHTML}
                    </div>
                    
                    <a href="/" class="header-logo">THEGAMING.CO</a>
                    
                    <div class="nav-right-wrapper">
                        <div class="header-actions">
                            <div class="user-pill-skeleton" id="auth-skeleton"></div>
                            
                            <div class="nav-right-logged-out">
                                <a href="/login" class="auth-link">Sign In</a>
                            </div>
                            
                            <div class="nav-right-logged-in">
                                <div class="user-menu-wrapper">
                                    <button class="user-pill" type="button" id="user-menu-button" aria-haspopup="true" aria-expanded="false">
                                        <span class="user-pill-label" id="header-username-label">P</span>
                                    </button>
                                    
                                    <div class="user-menu" id="user-menu" role="menu">
                                        <a href="/profile" class="user-menu-item" role="menuitem">Profile</a>
                                        <a href="/leaderboards" class="user-menu-item" role="menuitem">Leaderboards</a>
                                        <button type="button" class="user-menu-item" id="user-menu-signout" role="menuitem">Sign Out</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        `;
    }

    function injectHeader() {
        const container = document.getElementById('site-header');
        if (!container) return false;
        container.innerHTML = generateHeaderHTML();
        return true;
    }

    let elements = {};
    
    function cacheElements() {
        elements = {
            skeleton: document.getElementById('auth-skeleton'),
            loggedOut: document.querySelector('.nav-right-logged-out'),
            loggedIn: document.querySelector('.nav-right-logged-in'),
            usernameLabel: document.getElementById('header-username-label'),
            menuButton: document.getElementById('user-menu-button'),
            menu: document.getElementById('user-menu'),
            signoutBtn: document.getElementById('user-menu-signout')
        };
    }
    
    function updateAuthUI(isLoggedIn) {
        if (elements.skeleton) elements.skeleton.style.display = 'none';
        
        if (isLoggedIn) {
            if (elements.loggedOut) elements.loggedOut.style.setProperty('display', 'none', 'important');
            if (elements.loggedIn) elements.loggedIn.style.setProperty('display', 'flex', 'important');
        } else {
            if (elements.loggedOut) elements.loggedOut.style.setProperty('display', 'flex', 'important');
            if (elements.loggedIn) elements.loggedIn.style.setProperty('display', 'none', 'important');
            try {
                localStorage.removeItem(CACHE_LABEL);
                localStorage.removeItem(CACHE_FULL);
            } catch (e) {}
        }
    }
    
    function setHeaderName(name) {
        if (!name || !name.trim()) {
            if (elements.usernameLabel) {
                elements.usernameLabel.textContent = 'P';
                elements.usernameLabel.title = 'Player';
            }
            return;
        }
        
        const trimmed = name.trim();
        const initial = trimmed.charAt(0).toUpperCase();
        
        if (elements.usernameLabel) {
            elements.usernameLabel.textContent = initial;
            elements.usernameLabel.title = trimmed;
        }
        
        try {
            localStorage.setItem(CACHE_LABEL, initial);
            localStorage.setItem(CACHE_FULL, trimmed);
        } catch (e) {}
    }

    function primeFromCache() {
        try {
            const cachedLabel = localStorage.getItem(CACHE_LABEL);
            const cachedFull = localStorage.getItem(CACHE_FULL);
            
            if (cachedLabel && cachedFull) {
                if (elements.usernameLabel) {
                    elements.usernameLabel.textContent = cachedLabel;
                    elements.usernameLabel.title = cachedFull;
                }
                if (elements.skeleton) elements.skeleton.style.display = 'none';
                if (elements.loggedIn) elements.loggedIn.style.setProperty('display', 'flex', 'important');
                return true;
            }
        } catch (e) {}
        return false;
    }

    let menuOpen = false;
    
    function setupMenu() {
        if (!elements.menuButton || !elements.menu) return;
        
        elements.menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            menuOpen = !menuOpen;
            elements.menu.classList.toggle('open', menuOpen);
            elements.menuButton.setAttribute('aria-expanded', menuOpen);
        });
        
        document.addEventListener('click', () => {
            if (menuOpen) {
                menuOpen = false;
                elements.menu.classList.remove('open');
                elements.menuButton.setAttribute('aria-expanded', 'false');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuOpen) {
                menuOpen = false;
                elements.menu.classList.remove('open');
                elements.menuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    async function initSupabaseAuth() {
        if (typeof supabase === 'undefined') {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/@supabase/supabase-js@2';
                script.onload = resolve;
                script.onerror = resolve;
                document.head.appendChild(script);
            });
        }
        
        if (typeof supabase === 'undefined') {
            updateAuthUI(false);
            return;
        }
        
        if (!window.supabaseClient) {
            window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        
        const client = window.supabaseClient;
        
        try {
            const { data } = await client.auth.getSession();
            const user = data?.session?.user;
            
            if (user) {
                updateAuthUI(true);
                const { data: profile } = await client.from('profiles')
                    .select('display_name, gamer_tag')
                    .eq('id', user.id)
                    .single();
                
                const name = profile?.display_name || profile?.gamer_tag || user.email?.split('@')[0] || 'Player';
                setHeaderName(name);
            } else {
                updateAuthUI(false);
            }
        } catch (err) {
            updateAuthUI(false);
        }
        
        client.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') updateAuthUI(false);
            if (event === 'SIGNED_IN') initSupabaseAuth();
        });
        
        if (elements.signoutBtn) {
            elements.signoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                localStorage.removeItem(CACHE_LABEL);
                localStorage.removeItem(CACHE_FULL);
                await client.auth.signOut();
                window.location.href = '/';
            });
        }
    }

    function init() {
        if (!injectHeader()) return;
        cacheElements();
        primeFromCache();
        setupMenu();
        initSupabaseAuth();
        loadSocialSystem();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
