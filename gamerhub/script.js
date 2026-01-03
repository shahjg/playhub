// Navigation functionality
function navigateToCategory(category) {
    console.log(`Navigating to ${category} category`);
    // In a real app, this would route to a category page
    alert(`Opening ${category.charAt(0).toUpperCase() + category.slice(1)} games!\n\nIn the full version, this would show all games in this category.`);
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.8)';
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Play button functionality
document.querySelectorAll('.play-button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        const gameTitle = this.closest('.game-card').querySelector('.game-title').textContent;
        console.log(`Starting game: ${gameTitle}`);
        alert(`Starting ${gameTitle}!\n\nIn the full version, this would:\n1. Create a game room\n2. Generate a shareable code\n3. Start the lobby`);
    });
});

// See all button
document.querySelector('.see-all')?.addEventListener('click', function() {
    console.log('See all games clicked');
    alert('Opening all games!\n\nIn the full version, this would show a filterable grid of all 24+ games.');
});

// CTA button
document.querySelector('.cta-button')?.addEventListener('click', function() {
    const gamesSection = document.getElementById('games');
    if (gamesSection) {
        gamesSection.scrollIntoView({ behavior: 'smooth' });
    }
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.category-card, .game-card, .feature').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Add particle effect on hover for category cards (optional enhancement)
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.3)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.boxShadow = 'none';
    });
});

// Track analytics (placeholder)
function trackEvent(eventName, data) {
    console.log('Analytics Event:', eventName, data);
    // In production, this would send to your analytics service
}

// Track page view
trackEvent('page_view', { page: 'home' });

// Track category clicks
document.querySelectorAll('.category-card').forEach((card, index) => {
    card.addEventListener('click', function() {
        const category = this.querySelector('.category-title').textContent;
        trackEvent('category_click', { category: category });
    });
});

// Easter egg: Konami code
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiPattern.join(',')) {
        document.body.style.animation = 'rainbow 3s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
            alert('🎮 Konami Code Activated! You found the secret! 🎮');
        }, 3000);
    }
});

// Add rainbow animation for easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Console message for developers
console.log('%c🎮 Welcome to PlayHub! 🎮', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%cLike what you see? We\'re hiring! Check out our careers page.', 'font-size: 14px; color: #a0a0b0;');
console.log('%cPro tip: Try the Konami Code 😉', 'font-size: 12px; color: #f5576c;');
