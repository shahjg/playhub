/* ========================================
   THEGAMING.CO - SHARED HEADER SYSTEM
   ========================================
   
   Usage:
   1. Add <link rel="stylesheet" href="/header.css"> in <head>
   2. Add <div id="site-header"></div> at start of <body>
   3. Add <script src="/header.js"></script> before </body>
   
   Options (data attributes on #site-header):
   - data-back-url="/solo"  → Custom back button URL
   - data-back-text="Solo"  → Custom back button text
   - data-no-back           → Force hide back button
   
======================================== */

(function() {
    'use strict';

    // ========================================
    // CONFIGURATION
    // ========================================
    
    const SUPABASE_URL = 'https://tvvivtmzofsyehatzlvl.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dml2dG16b2ZzeWVoYXR6bHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4OTExODYsImV4cCI6MjA4MDQ2NzE4Nn0.Qy8kHMO0Nb4yJ0ZHjby7RuQtzwWB8rUcZvkdnbL1b3M';
    
    // Cache keys
    const CACHE_LABEL = 'tgco_header_label';
    const CACHE_FULL = 'tgco_header_full';

    // ========================================
    // AUTO-DETECT PAGE TYPE
    // ========================================
    
    function getPageInfo() {
        const path = window.location.pathname;
        const container = document.getElementById('site-header');
        
        // Check for manual overrides
        if (container) {
            if (container.hasAttribute('data-no-back')) {
                return { showBack: false };
            }
            
            const customUrl = container.getAttribute('data-back-url');
            const customText = container.getAttribute('data-back-text');
            if (customUrl) {
                return { showBack: true, backUrl: customUrl, backText: customText || 'Back' };
            }
        }
        
        // Auto-detect based on URL path
        // Game pages: /games/solo/*, /games/duos/*, /games/squad/*, /games/party/*
        if (path.includes('/games/solo/')) {
            return { showBack: true, backUrl: '/solo', backText: 'Solo' };
        }
        if (path.includes('/games/duos/')) {
            return { showBack: true, backUrl: '/duos', backText: 'Duos' };
        }
        if (path.includes('/games/squad/')) {
            return { showBack: true, backUrl: '/squad-games', backText: 'Squad' };
        }
        if (path.includes('/games/party/')) {
            return { showBack: true, backUrl: '/party-games', backText: 'Party' };
        }
        
        // Default: no back button (category pages, index, etc.)
        return { showBack: false };
    }

    // ========================================
    // GENERATE HEADER HTML
    // ========================================
    
    function generateHeaderHTML(pageInfo) {
        const backButtonHTML = pageInfo.showBack ? `
            <a href="${pageInfo.backUrl}" class="back-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>${pageInfo.backText}</span>
            </a>
        ` : '';

        return `
            <header class="site-header">
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

    // ========================================
    // INJECT HEADER
    // ========================================
    
    function injectHeader() {
        const container = document.getElementById('site-header');
        if (!container) {
            console.warn('Header: #site-header container not found');
            return false;
        }
        
        const pageInfo = getPageInfo();
        container.innerHTML = generateHeaderHTML(pageInfo);
        return true;
    }

    // ========================================
    // AUTH UI MANAGEMENT
    // ========================================
    
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
            
            // Clear cache on logout
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
        
        // Cache for instant load next time
        try {
            localStorage.setItem(CACHE_LABEL, initial);
            localStorage.setItem(CACHE_FULL, trimmed);
        } catch (e) {}
    }

    // ========================================
    // PRIME FROM CACHE (Instant UI)
    // ========================================
    
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
                return true; // Was cached as logged in
            }
        } catch (e) {}
        
        // No cache or error - show skeleton, wait for auth check
        return false;
    }

    // ========================================
    // DROPDOWN MENU
    // ========================================
    
    let menuOpen = false;
    
    function setupMenu() {
        if (!elements.menuButton || !elements.menu) return;
        
        function setMenuOpen(open) {
            menuOpen = open;
            if (open) {
                elements.menu.classList.add('open');
                elements.menuButton.setAttribute('aria-expanded', 'true');
            } else {
                elements.menu.classList.remove('open');
                elements.menuButton.setAttribute('aria-expanded', 'false');
            }
        }
        
        elements.menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
        });
        
        document.addEventListener('click', () => {
            if (menuOpen) setMenuOpen(false);
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
        });
    }

    // ========================================
    // SUPABASE AUTH
    // ========================================
    
    async function initSupabaseAuth() {
        // Wait for Supabase to be available
        if (typeof supabase === 'undefined') {
            // Try to load it
            await loadSupabase();
        }
        
        if (typeof supabase === 'undefined') {
            console.warn('Header: Supabase not available');
            updateAuthUI(false);
            return;
        }
        
        // Create client if not already exists
        if (!window.supabaseClient) {
            window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        
        const client = window.supabaseClient;
        
        // Check session
        try {
            const { data, error } = await client.auth.getSession();
            if (error) throw error;
            
            const user = data?.session?.user;
            
            if (user) {
                updateAuthUI(true);
                
                // Fetch profile for display name
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
            console.warn('Header auth error:', err);
            updateAuthUI(false);
        }
        
        // Listen for auth changes
        client.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                updateAuthUI(false);
            } else if (event === 'SIGNED_IN' && session?.user) {
                updateAuthUI(true);
                // Re-fetch profile
                initSupabaseAuth();
            }
        });
        
        // Setup sign out button
        if (elements.signoutBtn) {
            elements.signoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    localStorage.removeItem(CACHE_LABEL);
                    localStorage.removeItem(CACHE_FULL);
                } catch (e) {}
                await client.auth.signOut();
                window.location.href = '/';
            });
        }
    }
    
    function loadSupabase() {
        return new Promise((resolve) => {
            if (typeof supabase !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@supabase/supabase-js@2';
            script.onload = () => resolve();
            script.onerror = () => resolve(); // Continue even if failed
            document.head.appendChild(script);
        });
    }

    // ========================================
    // INITIALIZE
    // ========================================
    
    function init() {
        // Inject header HTML
        if (!injectHeader()) return;
        
        // Cache DOM elements
        cacheElements();
        
        // Prime from localStorage for instant UI
        const wasCached = primeFromCache();
        
        // If not cached, show loading state briefly
        if (!wasCached && elements.skeleton) {
            elements.skeleton.style.display = 'block';
        }
        
        // Setup dropdown menu
        setupMenu();
        
        // Initialize auth (async)
        initSupabaseAuth();
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
