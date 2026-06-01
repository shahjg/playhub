// Global Game Search with Fuse.js
// Provides autocomplete suggestions across all game pages

async function loadFuse() {
  if (window.Fuse) return;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

function initGlobalSearch(options) {
  const {
    inputId = 'game-search',
    suggestionsId = 'search-suggestions',
    clearBtnId = 'search-clear',
    onSelect = null
  } = options;

  const input = document.getElementById(inputId);
  const suggestionsDiv = document.getElementById(suggestionsId);
  const clearBtn = document.getElementById(clearBtnId);

  if (!input || !suggestionsDiv) return;

  let searchIndex = null;
  let games = [];
  let selectedIndex = -1;
  let debounceTimer = null;

  // Extract games from gameInfo object
  function extractGames() {
    if (typeof gameInfo === 'undefined') return [];

    return Object.entries(gameInfo).map(([id, info]) => ({
      id,
      name: info.name || '',
      overview: info.overview || '',
      category: info.category || '',
      players: info.players || '',
      duration: info.duration || ''
    }));
  }

  // Initialize Fuse search index
  async function initializeSearch() {
    await loadFuse();

    games = extractGames();
    if (games.length === 0) return;

    searchIndex = new Fuse(games, {
      keys: ['name', 'overview', 'category'],
      threshold: 0.3,
      minMatchCharLength: 2,
      includeScore: true
    });
  }

  // Handle input with debounce
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    selectedIndex = -1;
    clearBtn.classList.toggle('visible', input.value.length > 0);

    debounceTimer = setTimeout(() => {
      const query = input.value.trim().toLowerCase();
      if (query.length === 0) {
        suggestionsDiv.innerHTML = '';
        return;
      }

      showSuggestions(query);
    }, 150);
  });

  // Show suggestions dropdown
  function showSuggestions(query) {
    if (!searchIndex || games.length === 0) return;

    const results = searchIndex.search(query).slice(0, 8);

    if (results.length === 0) {
      suggestionsDiv.innerHTML = '<div class="search-no-results">No games found</div>';
      return;
    }

    suggestionsDiv.innerHTML = results
      .map((result, index) => {
        const game = result.item;
        return `<div class="search-suggestion" data-index="${index}" data-id="${game.id}">
          ${escapeHtml(game.name)}
        </div>`;
      })
      .join('');

    // Add click handlers to suggestions
    document.querySelectorAll('.search-suggestion').forEach(item => {
      item.addEventListener('click', () => selectSuggestion(item.dataset.id));
      item.addEventListener('mouseenter', () => {
        selectedIndex = parseInt(item.dataset.index);
        updateHighlight();
      });
    });
  }

  // Select a suggestion
  function selectSuggestion(gameId) {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    input.value = game.name;
    suggestionsDiv.innerHTML = '';
    clearBtn.classList.remove('visible');

    if (onSelect) {
      onSelect(gameId);
    }
  }

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    const suggestions = document.querySelectorAll('.search-suggestion');
    const count = suggestions.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, count - 1);
      updateHighlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateHighlight();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < count) {
        selectSuggestion(suggestions[selectedIndex].dataset.id);
      }
    } else if (e.key === 'Escape') {
      suggestionsDiv.innerHTML = '';
      selectedIndex = -1;
    }
  });

  // Highlight selected suggestion
  function updateHighlight() {
    document.querySelectorAll('.search-suggestion').forEach((item, index) => {
      item.classList.toggle('active', index === selectedIndex);
    });
  }

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      suggestionsDiv.innerHTML = '';
      selectedIndex = -1;
      clearBtn.classList.remove('visible');
      input.focus();
    });
  }

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper') && !e.target.closest('#' + suggestionsId)) {
      suggestionsDiv.innerHTML = '';
      selectedIndex = -1;
    }
  });

  // Initialize
  initializeSearch();
}

// Escape HTML special characters
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
