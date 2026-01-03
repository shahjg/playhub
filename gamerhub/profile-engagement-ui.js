/**
 * TheGaming.co Profile Engagement UI v2
 * Renders challenges, achievements, referrals, and stats on profile page
 * Includes built-in fallback data when database tables aren't available
 */

class ProfileEngagementUI {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.engagement = null;
    this.currentUser = null;
    this.userProfile = null;
    this.userStats = null;
    this.referralCode = null;
    this.referralStats = { total: 0, successful: 0, xpEarned: 0 };
    
    // Built-in challenges (used when DB not available)
    this.defaultDailyChallenges = [
      { id: 'd1', title: 'First Game', description: 'Play any game today', icon: '🎮', xp_reward: 50, requirement_target: 1, progress: 0, completed: false },
      { id: 'd2', title: 'Triple Play', description: 'Play 3 games today', icon: '🎯', xp_reward: 100, requirement_target: 3, progress: 0, completed: false },
      { id: 'd3', title: 'High Five', description: 'Play 5 games today', icon: '✋', xp_reward: 150, requirement_target: 5, progress: 0, completed: false },
      { id: 'd4', title: 'Victory Lap', description: 'Win any game', icon: '🏆', xp_reward: 75, requirement_target: 1, progress: 0, completed: false },
      { id: 'd5', title: 'Double Win', description: 'Win 2 games today', icon: '🥇', xp_reward: 125, requirement_target: 2, progress: 0, completed: false },
      { id: 'd6', title: 'Brain Trainer', description: 'Play a memory or cognitive game', icon: '🧠', xp_reward: 75, requirement_target: 1, progress: 0, completed: false },
      { id: 'd7', title: 'Speed Demon', description: 'Play Reaction Time or Typing Test', icon: '⚡', xp_reward: 75, requirement_target: 1, progress: 0, completed: false },
      { id: 'd8', title: 'Solo Session', description: 'Play 3 solo games', icon: '🕹️', xp_reward: 100, requirement_target: 3, progress: 0, completed: false },
      { id: 'd9', title: 'Puzzle Time', description: 'Complete any puzzle game', icon: '🧩', xp_reward: 100, requirement_target: 1, progress: 0, completed: false },
      { id: 'd10', title: 'Social Gamer', description: 'Play a multiplayer game', icon: '👥', xp_reward: 100, requirement_target: 1, progress: 0, completed: false },
      { id: 'd11', title: 'Snake Charmer', description: 'Score 50+ in Snake', icon: '🐍', xp_reward: 100, requirement_target: 50, progress: 0, completed: false },
      { id: 'd12', title: '2048 Addict', description: 'Play 2048 twice', icon: '🔢', xp_reward: 75, requirement_target: 2, progress: 0, completed: false },
      { id: 'd13', title: 'Sky High', description: 'Score 25+ in Sky Hop', icon: '☁️', xp_reward: 100, requirement_target: 25, progress: 0, completed: false },
      { id: 'd14', title: 'Quick Fingers', description: 'Get 50+ WPM in Typing Test', icon: '⌨️', xp_reward: 100, requirement_target: 50, progress: 0, completed: false },
      { id: 'd15', title: 'Sharp Shooter', description: 'Play Aim Trainer', icon: '🎯', xp_reward: 75, requirement_target: 1, progress: 0, completed: false },
      { id: 'd16', title: 'Party Starter', description: 'Host a game room', icon: '🎉', xp_reward: 100, requirement_target: 1, progress: 0, completed: false },
      { id: 'd17', title: 'Trivia Time', description: 'Play Trivia Royale', icon: '❓', xp_reward: 100, requirement_target: 1, progress: 0, completed: false },
      { id: 'd18', title: 'Detective Work', description: 'Play Spyfall/Spyhunt', icon: '🕵️', xp_reward: 100, requirement_target: 1, progress: 0, completed: false },
      { id: 'd19', title: 'Team Player', description: 'Play with a friend', icon: '🤝', xp_reward: 125, requirement_target: 1, progress: 0, completed: false },
      { id: 'd20', title: 'Memory Lane', description: 'Play any memory game', icon: '🧠', xp_reward: 75, requirement_target: 1, progress: 0, completed: false },
    ];
    
    this.defaultWeeklyChallenges = [
      { id: 'w1', title: 'Dedicated Player', description: 'Play 20 games this week', icon: '🎮', xp_reward: 500, requirement_target: 20, progress: 0, completed: false },
      { id: 'w2', title: 'Marathon Runner', description: 'Play 50 games this week', icon: '🏃', xp_reward: 1000, requirement_target: 50, progress: 0, completed: false },
      { id: 'w3', title: 'Champion', description: 'Win 10 games this week', icon: '🏆', xp_reward: 750, requirement_target: 10, progress: 0, completed: false },
      { id: 'w4', title: 'Dominant Force', description: 'Win 25 games this week', icon: '💪', xp_reward: 1500, requirement_target: 25, progress: 0, completed: false },
      { id: 'w5', title: 'Variety Pack', description: 'Play 5 different game types', icon: '🎲', xp_reward: 400, requirement_target: 5, progress: 0, completed: false },
      { id: 'w6', title: 'Jack of All Trades', description: 'Play 10 different games', icon: '🃏', xp_reward: 750, requirement_target: 10, progress: 0, completed: false },
      { id: 'w7', title: 'Solo Grinder', description: 'Play 15 solo games', icon: '🕹️', xp_reward: 400, requirement_target: 15, progress: 0, completed: false },
      { id: 'w8', title: 'Solo Master', description: 'Play 30 solo games', icon: '⭐', xp_reward: 800, requirement_target: 30, progress: 0, completed: false },
      { id: 'w9', title: 'Puzzle Week', description: 'Complete 10 puzzle games', icon: '🧩', xp_reward: 500, requirement_target: 10, progress: 0, completed: false },
      { id: 'w10', title: 'Brain Week', description: 'Play 10 memory/cognitive games', icon: '🧠', xp_reward: 500, requirement_target: 10, progress: 0, completed: false },
      { id: 'w11', title: 'Social Butterfly', description: 'Play with 5 different friends', icon: '🦋', xp_reward: 400, requirement_target: 5, progress: 0, completed: false },
      { id: 'w12', title: 'Party Animal', description: 'Play 10 party games', icon: '🎉', xp_reward: 600, requirement_target: 10, progress: 0, completed: false },
      { id: 'w13', title: '2048 Expert', description: 'Reach 2048 tile in 2048', icon: '🔢', xp_reward: 750, requirement_target: 2048, progress: 0, completed: false },
      { id: 'w14', title: 'Snake Legend', description: 'Score 100+ in Snake', icon: '🐍', xp_reward: 750, requirement_target: 100, progress: 0, completed: false },
      { id: 'w15', title: 'Typing Champion', description: 'Get 70+ WPM in Typing Test', icon: '⌨️', xp_reward: 500, requirement_target: 70, progress: 0, completed: false },
      { id: 'w16', title: 'Lightning Reflexes', description: 'Get under 200ms in Reaction Time', icon: '⚡', xp_reward: 750, requirement_target: 200, progress: 0, completed: false },
      { id: 'w17', title: 'Memory Master', description: 'Level 10+ in any memory game', icon: '📸', xp_reward: 500, requirement_target: 10, progress: 0, completed: false },
      { id: 'w18', title: 'Sky Hopper', description: 'Score 50+ in Sky Hop', icon: '☁️', xp_reward: 750, requirement_target: 50, progress: 0, completed: false },
      { id: 'w19', title: 'Trivia King', description: 'Win 5 Trivia Royale games', icon: '👑', xp_reward: 750, requirement_target: 5, progress: 0, completed: false },
      { id: 'w20', title: 'Master Spy', description: 'Win 3 Spyfall games as spy', icon: '🕵️', xp_reward: 750, requirement_target: 3, progress: 0, completed: false },
      { id: 'w21', title: 'Word Master', description: 'Play 5 word games', icon: '📝', xp_reward: 400, requirement_target: 5, progress: 0, completed: false },
      { id: 'w22', title: 'Game Host', description: 'Host 5 game rooms', icon: '🏠', xp_reward: 500, requirement_target: 5, progress: 0, completed: false },
      { id: 'w23', title: 'Daily Devotee', description: 'Complete all daily challenges for 5 days', icon: '📅', xp_reward: 1000, requirement_target: 5, progress: 0, completed: false },
      { id: 'w24', title: 'Achievement Hunter', description: 'Unlock 3 achievements', icon: '🏆', xp_reward: 750, requirement_target: 3, progress: 0, completed: false },
      { id: 'w25', title: 'Referral Master', description: 'Refer a friend who plays', icon: '📣', xp_reward: 1000, requirement_target: 1, progress: 0, completed: false },
    ];
    
    // Built-in achievements (used when DB not available)
    this.defaultAchievements = [
      // Games Played
      { id: 'first_game', title: 'First Steps', description: 'Play your first game', icon: '🎮', category: 'games', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'games_10', title: 'Getting Started', description: 'Play 10 games', icon: '🎯', category: 'games', rarity: 'common', xp_reward: 100, requirement_value: 10, unlocked: false },
      { id: 'games_50', title: 'Regular', description: 'Play 50 games', icon: '⭐', category: 'games', rarity: 'uncommon', xp_reward: 250, requirement_value: 50, unlocked: false },
      { id: 'games_100', title: 'Dedicated', description: 'Play 100 games', icon: '💫', category: 'games', rarity: 'uncommon', xp_reward: 500, requirement_value: 100, unlocked: false },
      { id: 'games_500', title: 'Veteran', description: 'Play 500 games', icon: '🏅', category: 'games', rarity: 'rare', xp_reward: 1000, requirement_value: 500, unlocked: false },
      { id: 'games_1000', title: 'Legend', description: 'Play 1000 games', icon: '👑', category: 'games', rarity: 'epic', xp_reward: 2500, requirement_value: 1000, unlocked: false },
      
      // Wins
      { id: 'first_win', title: 'First Victory', description: 'Win your first game', icon: '🏆', category: 'wins', rarity: 'common', xp_reward: 75, requirement_value: 1, unlocked: false },
      { id: 'wins_10', title: 'Winner', description: 'Win 10 games', icon: '🥇', category: 'wins', rarity: 'common', xp_reward: 200, requirement_value: 10, unlocked: false },
      { id: 'wins_50', title: 'Champion', description: 'Win 50 games', icon: '🏆', category: 'wins', rarity: 'uncommon', xp_reward: 500, requirement_value: 50, unlocked: false },
      { id: 'wins_100', title: 'Master', description: 'Win 100 games', icon: '💎', category: 'wins', rarity: 'rare', xp_reward: 1000, requirement_value: 100, unlocked: false },
      
      // Streaks
      { id: 'streak_3', title: 'Hot Streak', description: 'Win 3 games in a row', icon: '🔥', category: 'streaks', rarity: 'common', xp_reward: 150, requirement_value: 3, unlocked: false },
      { id: 'streak_5', title: 'On Fire', description: 'Win 5 games in a row', icon: '🔥', category: 'streaks', rarity: 'uncommon', xp_reward: 300, requirement_value: 5, unlocked: false },
      { id: 'streak_10', title: 'Unstoppable', description: 'Win 10 games in a row', icon: '⚡', category: 'streaks', rarity: 'epic', xp_reward: 1000, requirement_value: 10, unlocked: false },
      
      // Login Streaks
      { id: 'login_7', title: 'Week Warrior', description: 'Log in 7 days in a row', icon: '📅', category: 'loyalty', rarity: 'common', xp_reward: 200, requirement_value: 7, unlocked: false },
      { id: 'login_30', title: 'Month Master', description: 'Log in 30 days in a row', icon: '📆', category: 'loyalty', rarity: 'rare', xp_reward: 750, requirement_value: 30, unlocked: false },
      { id: 'login_100', title: 'Dedicated Fan', description: 'Log in 100 days in a row', icon: '🗓️', category: 'loyalty', rarity: 'legendary', xp_reward: 3000, requirement_value: 100, unlocked: false },
      
      // Social
      { id: 'first_friend', title: 'Social', description: 'Add your first friend', icon: '👋', category: 'social', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'friends_10', title: 'Popular', description: 'Have 10 friends', icon: '🤝', category: 'social', rarity: 'uncommon', xp_reward: 200, requirement_value: 10, unlocked: false },
      { id: 'friends_50', title: 'Celebrity', description: 'Have 50 friends', icon: '⭐', category: 'social', rarity: 'epic', xp_reward: 750, requirement_value: 50, unlocked: false },
      
      // Referrals
      { id: 'referral_1', title: 'Recruiter', description: 'Refer your first friend', icon: '📣', category: 'referrals', rarity: 'uncommon', xp_reward: 250, requirement_value: 1, unlocked: false },
      { id: 'referral_5', title: 'Ambassador', description: 'Refer 5 friends', icon: '🎺', category: 'referrals', rarity: 'rare', xp_reward: 1000, requirement_value: 5, unlocked: false },
      { id: 'referral_10', title: 'Influencer', description: 'Refer 10 friends', icon: '📡', category: 'referrals', rarity: 'epic', xp_reward: 2000, requirement_value: 10, unlocked: false },
      
      // Solo Games - 2048
      { id: '2048_first', title: '2048 Beginner', description: 'Play your first 2048 game', icon: '🔢', category: '2048', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: '2048_2048', title: '2048: Victory!', description: 'Reach the 2048 tile', icon: '🏆', category: '2048', rarity: 'rare', xp_reward: 500, requirement_value: 2048, unlocked: false },
      { id: '2048_4096', title: '2048: Beyond', description: 'Reach the 4096 tile', icon: '💎', category: '2048', rarity: 'epic', xp_reward: 1000, requirement_value: 4096, unlocked: false },
      
      // Solo Games - Snake
      { id: 'snake_first', title: 'Snake Beginner', description: 'Play your first Snake game', icon: '🐍', category: 'snake', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'snake_50', title: 'Snake: 50 Points', description: 'Score 50 points in Snake', icon: '🐍', category: 'snake', rarity: 'common', xp_reward: 100, requirement_value: 50, unlocked: false },
      { id: 'snake_100', title: 'Snake: Century', description: 'Score 100 points in Snake', icon: '🐍', category: 'snake', rarity: 'uncommon', xp_reward: 250, requirement_value: 100, unlocked: false },
      { id: 'snake_200', title: 'Snake: Master', description: 'Score 200 points in Snake', icon: '🐍', category: 'snake', rarity: 'epic', xp_reward: 1000, requirement_value: 200, unlocked: false },
      
      // Solo Games - Sky Hop
      { id: 'skyhop_first', title: 'Sky Hopper', description: 'Play your first Sky Hop game', icon: '☁️', category: 'sky-hop', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'skyhop_50', title: 'Sky Walker', description: 'Score 50 in Sky Hop', icon: '🌤️', category: 'sky-hop', rarity: 'uncommon', xp_reward: 150, requirement_value: 50, unlocked: false },
      { id: 'skyhop_100', title: 'Cloud Master', description: 'Score 100 in Sky Hop', icon: '⛅', category: 'sky-hop', rarity: 'rare', xp_reward: 400, requirement_value: 100, unlocked: false },
      { id: 'skyhop_200', title: 'Heaven Bound', description: 'Score 200 in Sky Hop', icon: '✨', category: 'sky-hop', rarity: 'legendary', xp_reward: 2500, requirement_value: 200, unlocked: false },
      
      // Solo Games - Typing
      { id: 'typing_first', title: 'Keyboard Warrior', description: 'Complete your first typing test', icon: '⌨️', category: 'typing', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'typing_50', title: 'Quick Fingers', description: 'Get 50+ WPM', icon: '⌨️', category: 'typing', rarity: 'common', xp_reward: 100, requirement_value: 50, unlocked: false },
      { id: 'typing_90', title: 'Speed Demon', description: 'Get 90+ WPM', icon: '💨', category: 'typing', rarity: 'rare', xp_reward: 500, requirement_value: 90, unlocked: false },
      { id: 'typing_130', title: 'Typing Legend', description: 'Get 130+ WPM', icon: '👑', category: 'typing', rarity: 'legendary', xp_reward: 2500, requirement_value: 130, unlocked: false },
      
      // Solo Games - Reaction Time
      { id: 'reaction_first', title: 'Quick Thinker', description: 'Complete your first reaction test', icon: '⚡', category: 'reaction', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'reaction_200', title: 'Fast Reflexes', description: 'Get under 200ms', icon: '💨', category: 'reaction', rarity: 'uncommon', xp_reward: 250, requirement_value: 200, unlocked: false },
      { id: 'reaction_150', title: 'Superhuman', description: 'Get under 150ms', icon: '🔥', category: 'reaction', rarity: 'epic', xp_reward: 1000, requirement_value: 150, unlocked: false },
      
      // Solo Games - Memory
      { id: 'memory_first', title: 'Memory Start', description: 'Play your first memory game', icon: '🧠', category: 'memory', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'memory_10', title: 'Good Memory', description: 'Reach level 10 in a memory game', icon: '🧠', category: 'memory', rarity: 'uncommon', xp_reward: 200, requirement_value: 10, unlocked: false },
      { id: 'memory_20', title: 'Photographic', description: 'Reach level 20 in a memory game', icon: '📸', category: 'memory', rarity: 'epic', xp_reward: 1000, requirement_value: 20, unlocked: false },
      
      // Solo Games - Aim Trainer
      { id: 'aim_first', title: 'Target Practice', description: 'Play your first Aim Trainer', icon: '🎯', category: 'aim', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'aim_90', title: 'Great Aim', description: 'Score 90+ in Aim Trainer', icon: '🎯', category: 'aim', rarity: 'rare', xp_reward: 300, requirement_value: 90, unlocked: false },
      { id: 'aim_99', title: 'Perfect Aim', description: 'Score 99+ in Aim Trainer', icon: '👑', category: 'aim', rarity: 'legendary', xp_reward: 2000, requirement_value: 99, unlocked: false },
      
      // Solo Games - Chimp Test
      { id: 'chimp_first', title: 'Chimp Challenger', description: 'Play your first Chimp Test', icon: '🐵', category: 'chimp', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'chimp_9', title: 'Super Chimp', description: 'Reach level 9 in Chimp Test', icon: '🐒', category: 'chimp', rarity: 'rare', xp_reward: 400, requirement_value: 9, unlocked: false },
      { id: 'chimp_15', title: 'Beyond Chimp', description: 'Reach level 15 in Chimp Test', icon: '👑', category: 'chimp', rarity: 'legendary', xp_reward: 2500, requirement_value: 15, unlocked: false },
      
      // Puzzles
      { id: 'sudoku_1', title: 'Sudoku Novice', description: 'Complete a Sudoku puzzle', icon: '🔢', category: 'puzzles', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'minesweeper_1', title: 'Mine Finder', description: 'Win a Minesweeper game', icon: '💣', category: 'puzzles', rarity: 'common', xp_reward: 75, requirement_value: 1, unlocked: false },
      { id: 'crossword_1', title: 'Word Finder', description: 'Complete a crossword puzzle', icon: '📝', category: 'puzzles', rarity: 'common', xp_reward: 75, requirement_value: 1, unlocked: false },
      { id: 'nonogram_1', title: 'Pixel Artist', description: 'Complete a Nonogram puzzle', icon: '🖼️', category: 'puzzles', rarity: 'common', xp_reward: 75, requirement_value: 1, unlocked: false },
      
      // Multiplayer
      { id: 'mp_first', title: 'Multiplayer Debut', description: 'Play your first multiplayer game', icon: '👥', category: 'multiplayer', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'mp_50', title: 'Party Player', description: 'Play 50 multiplayer games', icon: '🎉', category: 'multiplayer', rarity: 'uncommon', xp_reward: 400, requirement_value: 50, unlocked: false },
      
      // Trivia
      { id: 'trivia_first', title: 'Trivia Rookie', description: 'Play your first Trivia Royale', icon: '❓', category: 'trivia', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'trivia_win_10', title: 'Trivia Expert', description: 'Win 10 Trivia Royale games', icon: '🎓', category: 'trivia', rarity: 'uncommon', xp_reward: 400, requirement_value: 10, unlocked: false },
      { id: 'trivia_win_50', title: 'Trivia Legend', description: 'Win 50 Trivia Royale games', icon: '👑', category: 'trivia', rarity: 'epic', xp_reward: 2500, requirement_value: 50, unlocked: false },
      
      // Spyfall
      { id: 'spy_first', title: 'Undercover', description: 'Play your first Spyfall game', icon: '🕵️', category: 'spyfall', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'spy_win_spy_1', title: 'Master of Disguise', description: 'Win as the Spy', icon: '🕵️', category: 'spyfall', rarity: 'uncommon', xp_reward: 200, requirement_value: 1, unlocked: false },
      { id: 'spy_win_spy_10', title: 'Shadow Master', description: 'Win 10 games as the Spy', icon: '🖤', category: 'spyfall', rarity: 'epic', xp_reward: 1000, requirement_value: 10, unlocked: false },
      
      // Codenames
      { id: 'codenames_first', title: 'Codebreaker', description: 'Play your first Codenames game', icon: '🔐', category: 'codenames', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'codenames_win_10', title: 'Spymaster', description: 'Win 10 Codenames games', icon: '🎖️', category: 'codenames', rarity: 'uncommon', xp_reward: 400, requirement_value: 10, unlocked: false },
      
      // Party Games
      { id: 'party_first', title: 'Party Starter', description: 'Play your first party game', icon: '🎉', category: 'party', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'party_50', title: 'Life of the Party', description: 'Play 50 party games', icon: '🎈', category: 'party', rarity: 'uncommon', xp_reward: 400, requirement_value: 50, unlocked: false },
      { id: 'wyr_10', title: 'Decision Maker', description: 'Play 10 Would You Rather games', icon: '🤔', category: 'party', rarity: 'common', xp_reward: 150, requirement_value: 10, unlocked: false },
      { id: 'nhie_10', title: 'Confessor', description: 'Play 10 Never Have I Ever games', icon: '🙈', category: 'party', rarity: 'common', xp_reward: 150, requirement_value: 10, unlocked: false },
      { id: 'tod_10', title: 'Daredevil', description: 'Play 10 Truth or Dare games', icon: '😈', category: 'party', rarity: 'common', xp_reward: 150, requirement_value: 10, unlocked: false },
      
      // Hosting
      { id: 'host_first', title: 'First Host', description: 'Host your first game room', icon: '🏠', category: 'hosting', rarity: 'common', xp_reward: 75, requirement_value: 1, unlocked: false },
      { id: 'host_10', title: 'Regular Host', description: 'Host 10 game rooms', icon: '🏠', category: 'hosting', rarity: 'common', xp_reward: 200, requirement_value: 10, unlocked: false },
      { id: 'host_50', title: 'Party Organizer', description: 'Host 50 game rooms', icon: '🎭', category: 'hosting', rarity: 'rare', xp_reward: 600, requirement_value: 50, unlocked: false },
      { id: 'host_100', title: 'Event Manager', description: 'Host 100 game rooms', icon: '👑', category: 'hosting', rarity: 'epic', xp_reward: 1500, requirement_value: 100, unlocked: false },
      
      // More Solo Games - Block Stack
      { id: 'blockstack_first', title: 'Block Builder', description: 'Play your first Block Stack game', icon: '🧱', category: 'block-stack', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'blockstack_25', title: 'Tower Builder', description: 'Stack 25 blocks', icon: '🧱', category: 'block-stack', rarity: 'uncommon', xp_reward: 150, requirement_value: 25, unlocked: false },
      { id: 'blockstack_50', title: 'Architect', description: 'Stack 50 blocks', icon: '🏗️', category: 'block-stack', rarity: 'rare', xp_reward: 500, requirement_value: 50, unlocked: false },
      
      // Math Speed
      { id: 'math_first', title: 'Calculator', description: 'Play your first Math Speed game', icon: '➕', category: 'math', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'math_50', title: 'Quick Math', description: 'Score 50+ in Math Speed', icon: '🔢', category: 'math', rarity: 'uncommon', xp_reward: 200, requirement_value: 50, unlocked: false },
      { id: 'math_100', title: 'Math Wizard', description: 'Score 100+ in Math Speed', icon: '🧙', category: 'math', rarity: 'epic', xp_reward: 1000, requirement_value: 100, unlocked: false },
      
      // Stroop Test
      { id: 'stroop_first', title: 'Color Confused', description: 'Play your first Stroop Test', icon: '🌈', category: 'stroop', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'stroop_30', title: 'Focus Master', description: 'Score 30+ in Stroop Test', icon: '🎯', category: 'stroop', rarity: 'uncommon', xp_reward: 200, requirement_value: 30, unlocked: false },
      { id: 'stroop_50', title: 'Mind Over Matter', description: 'Score 50+ in Stroop Test', icon: '🧠', category: 'stroop', rarity: 'rare', xp_reward: 500, requirement_value: 50, unlocked: false },
      
      // Sequence Memory
      { id: 'sequence_first', title: 'Pattern Starter', description: 'Play Sequence Memory', icon: '🔵', category: 'sequence', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'sequence_10', title: 'Pattern Pro', description: 'Level 10 in Sequence Memory', icon: '🔵', category: 'sequence', rarity: 'uncommon', xp_reward: 200, requirement_value: 10, unlocked: false },
      { id: 'sequence_20', title: 'Sequence Master', description: 'Level 20 in Sequence Memory', icon: '💫', category: 'sequence', rarity: 'epic', xp_reward: 1000, requirement_value: 20, unlocked: false },
      
      // Number Memory
      { id: 'number_first', title: 'Number Novice', description: 'Play Number Memory', icon: '🔢', category: 'number-memory', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'number_10', title: 'Digit Master', description: 'Remember 10+ digits', icon: '🔢', category: 'number-memory', rarity: 'uncommon', xp_reward: 250, requirement_value: 10, unlocked: false },
      { id: 'number_15', title: 'Human Calculator', description: 'Remember 15+ digits', icon: '🧮', category: 'number-memory', rarity: 'epic', xp_reward: 1000, requirement_value: 15, unlocked: false },
      
      // Visual Memory
      { id: 'visual_first', title: 'Sharp Eyes', description: 'Play Visual Memory', icon: '👁️', category: 'visual-memory', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'visual_10', title: 'Pattern Vision', description: 'Level 10 in Visual Memory', icon: '👁️', category: 'visual-memory', rarity: 'uncommon', xp_reward: 200, requirement_value: 10, unlocked: false },
      { id: 'visual_18', title: 'Eagle Eye', description: 'Level 18 in Visual Memory', icon: '🦅', category: 'visual-memory', rarity: 'epic', xp_reward: 1000, requirement_value: 18, unlocked: false },
      
      // Verbal Memory
      { id: 'verbal_first', title: 'Word Watcher', description: 'Play Verbal Memory', icon: '📝', category: 'verbal-memory', rarity: 'common', xp_reward: 25, requirement_value: 1, unlocked: false },
      { id: 'verbal_50', title: 'Word Bank', description: 'Score 50+ in Verbal Memory', icon: '📚', category: 'verbal-memory', rarity: 'uncommon', xp_reward: 200, requirement_value: 50, unlocked: false },
      { id: 'verbal_100', title: 'Dictionary', description: 'Score 100+ in Verbal Memory', icon: '📖', category: 'verbal-memory', rarity: 'epic', xp_reward: 750, requirement_value: 100, unlocked: false },
      
      // More Puzzles
      { id: 'sudoku_10', title: 'Sudoku Fan', description: 'Complete 10 Sudoku puzzles', icon: '🔢', category: 'puzzles', rarity: 'uncommon', xp_reward: 200, requirement_value: 10, unlocked: false },
      { id: 'sudoku_50', title: 'Sudoku Expert', description: 'Complete 50 Sudoku puzzles', icon: '🔢', category: 'puzzles', rarity: 'rare', xp_reward: 750, requirement_value: 50, unlocked: false },
      { id: 'minesweeper_10', title: 'Bomb Squad', description: 'Win 10 Minesweeper games', icon: '💣', category: 'puzzles', rarity: 'uncommon', xp_reward: 300, requirement_value: 10, unlocked: false },
      { id: 'minesweeper_50', title: 'Mine Master', description: 'Win 50 Minesweeper games', icon: '💣', category: 'puzzles', rarity: 'rare', xp_reward: 1000, requirement_value: 50, unlocked: false },
      { id: 'crossword_10', title: 'Crossword Fan', description: 'Complete 10 crosswords', icon: '📝', category: 'puzzles', rarity: 'uncommon', xp_reward: 300, requirement_value: 10, unlocked: false },
      { id: 'wordsearch_10', title: 'Word Hunter', description: 'Complete 10 word searches', icon: '🔍', category: 'puzzles', rarity: 'uncommon', xp_reward: 200, requirement_value: 10, unlocked: false },
      { id: 'nonogram_10', title: 'Pixel Master', description: 'Complete 10 Nonograms', icon: '🖼️', category: 'puzzles', rarity: 'uncommon', xp_reward: 300, requirement_value: 10, unlocked: false },
      
      // More Multiplayer Games
      { id: 'trivia_win_100', title: 'Trivia God', description: 'Win 100 Trivia Royale games', icon: '👑', category: 'trivia', rarity: 'legendary', xp_reward: 5000, requirement_value: 100, unlocked: false },
      
      { id: 'spy_10', title: 'Secret Agent', description: 'Play 10 Spyfall games', icon: '🕵️', category: 'spyfall', rarity: 'common', xp_reward: 150, requirement_value: 10, unlocked: false },
      { id: 'spy_win_10', title: 'Master Detective', description: 'Win 10 Spyfall games', icon: '🔍', category: 'spyfall', rarity: 'rare', xp_reward: 500, requirement_value: 10, unlocked: false },
      
      { id: 'codenames_10', title: 'Codemaster', description: 'Play 10 Codenames games', icon: '🔐', category: 'codenames', rarity: 'common', xp_reward: 150, requirement_value: 10, unlocked: false },
      { id: 'codenames_win_25', title: 'Spymaster Elite', description: 'Win 25 Codenames games', icon: '🎖️', category: 'codenames', rarity: 'rare', xp_reward: 1000, requirement_value: 25, unlocked: false },
      
      { id: 'werewolf_first', title: 'Villager', description: 'Play your first Werewolf game', icon: '🐺', category: 'werewolf', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'werewolf_win_10', title: 'Pack Leader', description: 'Win 10 Werewolf games', icon: '🐺', category: 'werewolf', rarity: 'uncommon', xp_reward: 400, requirement_value: 10, unlocked: false },
      { id: 'werewolf_wolf_5', title: 'Alpha Wolf', description: 'Win 5 games as Werewolf', icon: '🌕', category: 'werewolf', rarity: 'rare', xp_reward: 750, requirement_value: 5, unlocked: false },
      
      { id: 'sketch_first', title: 'Artist', description: 'Play Sketch & Guess', icon: '🎨', category: 'sketch', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'sketch_win_10', title: 'Picasso', description: 'Win 10 Sketch & Guess games', icon: '🖼️', category: 'sketch', rarity: 'uncommon', xp_reward: 400, requirement_value: 10, unlocked: false },
      
      { id: 'wordassoc_first', title: 'Word Link', description: 'Play Word Association', icon: '💬', category: 'word-games', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'wordassoc_win_10', title: 'Word Chain', description: 'Win 10 Word Association games', icon: '🔗', category: 'word-games', rarity: 'uncommon', xp_reward: 400, requirement_value: 10, unlocked: false },
      
      { id: 'connections_first', title: 'Connector', description: 'Play Connections', icon: '🔗', category: 'connections', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'connections_win_10', title: 'Master Connector', description: 'Win 10 Connections games', icon: '🧩', category: 'connections', rarity: 'uncommon', xp_reward: 400, requirement_value: 10, unlocked: false },
      
      { id: 'npat_first', title: 'NPAT Rookie', description: 'Play your first NPAT game', icon: '📊', category: 'npat', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'npat_win_10', title: 'NPAT Pro', description: 'Win 10 NPAT games', icon: '📊', category: 'npat', rarity: 'uncommon', xp_reward: 400, requirement_value: 10, unlocked: false },
      
      { id: 'betbluff_first', title: 'Risk Taker', description: 'Play Bet or Bluff', icon: '🎰', category: 'bet-bluff', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'betbluff_win_10', title: 'High Roller', description: 'Win 10 Bet or Bluff games', icon: '💰', category: 'bet-bluff', rarity: 'uncommon', xp_reward: 400, requirement_value: 10, unlocked: false },
      
      { id: 'foolsgold_first', title: 'Gold Digger', description: "Play Fool's Gold", icon: '💰', category: 'fools-gold', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'foolsgold_win_10', title: 'Gold Rush', description: "Win 10 Fool's Gold games", icon: '🏆', category: 'fools-gold', rarity: 'uncommon', xp_reward: 400, requirement_value: 10, unlocked: false },
      
      { id: 'duos_first', title: 'Dynamic Duo', description: 'Play Duos', icon: '👫', category: 'duos', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'duos_win_10', title: 'Perfect Partners', description: 'Win 10 Duos games', icon: '💑', category: 'duos', rarity: 'uncommon', xp_reward: 400, requirement_value: 10, unlocked: false },
      
      { id: 'imposter_first', title: 'Suspect', description: 'Play Imposter', icon: '🎭', category: 'imposter', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'imposter_win_5', title: 'Master Deceiver', description: 'Win 5 games as Imposter', icon: '🎭', category: 'imposter', rarity: 'rare', xp_reward: 500, requirement_value: 5, unlocked: false },
      
      { id: 'herd_first', title: 'Sheep', description: 'Play Herd Mentality', icon: '🐑', category: 'herd', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'herd_win_10', title: 'Shepherd', description: 'Win 10 Herd Mentality games', icon: '🐑', category: 'herd', rarity: 'uncommon', xp_reward: 400, requirement_value: 10, unlocked: false },
      
      { id: 'hotseat_first', title: 'Hot Seat Starter', description: 'Play Hot Seat', icon: '🔥', category: 'hot-seat', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      
      { id: 'kmk_first', title: 'KMK Player', description: 'Play Kill Marry Kiss', icon: '🤔', category: 'kmk', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      
      { id: '21q_first', title: 'Question Asker', description: 'Play 21 Questions', icon: '❔', category: '21-questions', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: '21q_win_10', title: 'Guesser', description: 'Win 10 games of 21 Questions', icon: '🎯', category: '21-questions', rarity: 'uncommon', xp_reward: 400, requirement_value: 10, unlocked: false },
      
      // More Party Games
      { id: 'wyr_50', title: 'Choice Master', description: 'Play 50 Would You Rather games', icon: '🤔', category: 'party', rarity: 'rare', xp_reward: 500, requirement_value: 50, unlocked: false },
      { id: 'nhie_50', title: 'Open Book', description: 'Play 50 Never Have I Ever games', icon: '🙈', category: 'party', rarity: 'rare', xp_reward: 500, requirement_value: 50, unlocked: false },
      { id: 'tod_50', title: 'Truth Seeker', description: 'Play 50 Truth or Dare games', icon: '😈', category: 'party', rarity: 'rare', xp_reward: 500, requirement_value: 50, unlocked: false },
      { id: 'tot_first', title: 'This or That', description: 'Play This or That', icon: '⚖️', category: 'party', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'hottakes_first', title: 'Hot Take', description: 'Play Hot Takes', icon: '🌶️', category: 'party', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'charades_first', title: 'Actor', description: 'Play Charades', icon: '🎭', category: 'party', rarity: 'common', xp_reward: 50, requirement_value: 1, unlocked: false },
      { id: 'charades_50', title: 'Drama Queen', description: 'Play 50 Charades games', icon: '🎭', category: 'party', rarity: 'rare', xp_reward: 500, requirement_value: 50, unlocked: false },
      
      // Secret/Hidden
      { id: 'night_owl', title: 'Night Owl', description: 'Play a game after midnight', icon: '🦉', category: 'special', rarity: 'uncommon', xp_reward: 100, requirement_value: 0, unlocked: false, is_hidden: true },
      { id: 'early_bird', title: 'Early Bird', description: 'Play a game before 6 AM', icon: '🐦', category: 'special', rarity: 'uncommon', xp_reward: 100, requirement_value: 6, unlocked: false, is_hidden: true },
      { id: 'marathon', title: 'Marathon', description: 'Play for 3 hours in one session', icon: '🏃', category: 'special', rarity: 'rare', xp_reward: 300, requirement_value: 180, unlocked: false, is_hidden: true },
      { id: 'perfect_day', title: 'Perfect Day', description: 'Complete all daily challenges', icon: '✨', category: 'special', rarity: 'uncommon', xp_reward: 250, requirement_value: 1, unlocked: false, is_hidden: true },
      { id: 'comeback_king', title: 'Comeback King', description: 'Win after losing 5 in a row', icon: '💪', category: 'special', rarity: 'rare', xp_reward: 500, requirement_value: 5, unlocked: false, is_hidden: true },
      { id: 'jack_of_all', title: 'Jack of All Trades', description: 'Play 20 different games', icon: '🃏', category: 'special', rarity: 'rare', xp_reward: 750, requirement_value: 20, unlocked: false, is_hidden: true },
      { id: 'weekend_warrior', title: 'Weekend Warrior', description: 'Play 50 games in one weekend', icon: '⚔️', category: 'special', rarity: 'epic', xp_reward: 1000, requirement_value: 50, unlocked: false, is_hidden: true },
      { id: 'century', title: 'Century', description: 'Reach level 100', icon: '💯', category: 'special', rarity: 'legendary', xp_reward: 10000, requirement_value: 100, unlocked: false, is_hidden: true },
    ];
  }

  async init() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session?.user) return;
      
      this.currentUser = session.user;
      
      // Load profile
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', this.currentUser.id)
        .single();
      this.userProfile = profile;
      
      // Try to load stats
      await this.loadUserStats();
      
      // Try to initialize engagement system
      if (window.EngagementSystem) {
        try {
          this.engagement = new EngagementSystem(this.supabase);
          await this.engagement.init();
        } catch (e) {
          console.log('[ProfileUI] Engagement system unavailable:', e.message);
        }
      }
      
      // Generate referral code
      await this.loadReferralData();
      
    } catch (e) {
      console.error('[ProfileUI] Init error:', e);
    }
  }
  
  async loadUserStats() {
    try {
      const { data, error } = await this.supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .single();
      
      if (data) {
        this.userStats = data;
      } else {
        this.userStats = {
          total_games_played: 0,
          total_wins: 0,
          solo_games_played: 0,
          multiplayer_games_played: 0,
          friends_count: 0,
          referrals_count: 0,
          daily_login_streak: 0
        };
      }
    } catch (e) {
      console.log('[ProfileUI] Stats not available');
      this.userStats = { total_games_played: 0, total_wins: 0 };
    }
  }
  
  async loadReferralData() {
    try {
      // Try to get or generate referral code
      const { data, error } = await this.supabase.rpc('generate_referral_code', {
        p_user_id: this.currentUser.id
      });
      
      if (data) {
        this.referralCode = data;
      } else {
        const name = this.userProfile?.display_name || 'USER';
        this.referralCode = name.substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '') + Math.random().toString(36).substring(2, 6).toUpperCase();
      }
      
      // Try to get referral stats
      const { data: refs } = await this.supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', this.currentUser.id);
      
      if (refs) {
        this.referralStats = {
          total: refs.length,
          successful: refs.filter(r => r.referee_rewarded).length,
          xpEarned: refs.length * 500
        };
      }
    } catch (e) {
      console.log('[ProfileUI] Referral system not available');
      const name = this.userProfile?.display_name || 'PLAYER';
      this.referralCode = name.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
  }

  // ============ CHALLENGES ============
  
  renderChallengesSection() {
    const container = document.getElementById('challenges-container');
    if (!container) return;
    
    const dailyChallenges = this.engagement?.getDailyChallenges?.() || this.defaultDailyChallenges;
    const weeklyChallenges = this.engagement?.getWeeklyChallenges?.() || this.defaultWeeklyChallenges;
    
    container.innerHTML = `
      <div class="engagement-section">
        <div class="challenge-tabs-wrapper">
          <button class="challenge-tab active" data-tab="daily">Daily Challenges</button>
          <button class="challenge-tab" data-tab="weekly">Weekly Challenges</button>
        </div>
        
        <div class="challenge-content" id="daily-challenges-content">
          ${dailyChallenges.length > 0 ? dailyChallenges.map(c => this.renderChallengeCard(c, 'daily')).join('') : `
            <div class="empty-state"><p>No daily challenges available. Check back tomorrow!</p></div>
          `}
        </div>
        
        <div class="challenge-content" id="weekly-challenges-content" style="display: none;">
          ${weeklyChallenges.length > 0 ? weeklyChallenges.map(c => this.renderChallengeCard(c, 'weekly')).join('') : `
            <div class="empty-state"><p>No weekly challenges available. Check back next week!</p></div>
          `}
        </div>
      </div>
      
      <style>
        .engagement-section { margin-top: 8px; }
        .challenge-tabs-wrapper { display: flex; gap: 8px; margin-bottom: 16px; }
        .challenge-tab {
          padding: 10px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.6);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .challenge-tab:hover { background: rgba(255,255,255,0.08); color: white; }
        .challenge-tab.active { 
          background: linear-gradient(135deg, rgba(255,107,157,0.2), rgba(164,69,178,0.2));
          border-color: rgba(255,107,157,0.4);
          color: white;
        }
        .challenge-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
        }
        .challenge-card:hover { background: rgba(255,255,255,0.05); }
        .challenge-card.completed { border-color: rgba(52,211,153,0.4); background: rgba(52,211,153,0.05); }
        .challenge-icon { font-size: 2rem; flex-shrink: 0; }
        .challenge-info { flex: 1; min-width: 0; }
        .challenge-title { font-weight: 600; margin-bottom: 4px; }
        .challenge-desc { font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
        .challenge-progress-bar {
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        .challenge-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff6b9d, #a445b2);
          border-radius: 3px;
          transition: width 0.3s;
        }
        .challenge-card.completed .challenge-progress-fill { background: #34d399; }
        .challenge-stats { display: flex; align-items: center; gap: 12px; font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 6px; }
        .challenge-xp { 
          background: rgba(255,107,157,0.15);
          color: #ff6b9d;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.75rem;
        }
        .claim-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #ff6b9d, #a445b2);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .claim-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(255,107,157,0.4); }
        .claimed-badge { color: #34d399; font-size: 0.85rem; }
        .empty-state { text-align: center; padding: 40px; color: rgba(255,255,255,0.5); }
      </style>
    `;
    
    // Add tab switching
    container.querySelectorAll('.challenge-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.challenge-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const isDaily = tab.dataset.tab === 'daily';
        container.querySelector('#daily-challenges-content').style.display = isDaily ? 'block' : 'none';
        container.querySelector('#weekly-challenges-content').style.display = isDaily ? 'none' : 'block';
      });
    });
  }
  
  renderChallengeCard(challenge, type) {
    const c = challenge.challenges || challenge;
    const progress = challenge.progress || 0;
    const target = c.requirement_target || 1;
    const percent = Math.min(100, (progress / target) * 100);
    const completed = challenge.completed || percent >= 100;
    const claimed = challenge.reward_claimed || false;
    
    return `
      <div class="challenge-card ${completed ? 'completed' : ''}" data-id="${challenge.id || c.id}">
        <div class="challenge-icon">${c.icon || '🎯'}</div>
        <div class="challenge-info">
          <div class="challenge-title">${c.title}</div>
          <div class="challenge-desc">${c.description}</div>
          <div class="challenge-progress-bar">
            <div class="challenge-progress-fill" style="width: ${percent}%"></div>
          </div>
          <div class="challenge-stats">
            <span>${progress}/${target}</span>
            <span class="challenge-xp">+${c.xp_reward || 0} XP</span>
          </div>
        </div>
        ${completed && !claimed ? `
          <button class="claim-btn" onclick="window.profileEngagementUI?.claimChallengeReward('${challenge.id}', '${type}')">Claim</button>
        ` : claimed ? `
          <span class="claimed-badge">✓ Claimed</span>
        ` : ''}
      </div>
    `;
  }

  // ============ ACHIEVEMENTS ============
  
  renderAchievementsSection() {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    const achievements = this.engagement?.achievements || this.defaultAchievements;
    const unlocked = this.engagement?.unlockedAchievements || [];
    const unlockedIds = new Set(unlocked.map(u => u.achievement_id));
    
    const processedAchievements = achievements.map(a => ({
      ...a,
      unlocked: unlockedIds.has(a.id)
    }));
    
    // Group by category
    const categories = {};
    processedAchievements.forEach(a => {
      if (a.is_hidden && !a.unlocked) return;
      const cat = a.category || 'general';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(a);
    });
    
    const unlockedCount = processedAchievements.filter(a => a.unlocked).length;
    const totalCount = processedAchievements.filter(a => !a.is_hidden).length;
    
    const categoryNames = {
      games: '🎮 Games Played',
      wins: '🏆 Victories',
      streaks: '🔥 Win Streaks',
      loyalty: '📅 Login Streaks',
      social: '👥 Social',
      referrals: '📣 Referrals',
      '2048': '🔢 2048',
      snake: '🐍 Snake',
      'sky-hop': '☁️ Sky Hop',
      typing: '⌨️ Typing Test',
      reaction: '⚡ Reaction Time',
      memory: '🧠 Memory Games',
      aim: '🎯 Aim Trainer',
      chimp: '🐵 Chimp Test',
      'block-stack': '🧱 Block Stack',
      math: '➕ Math Speed',
      stroop: '🌈 Stroop Test',
      sequence: '🔵 Sequence Memory',
      'number-memory': '🔢 Number Memory',
      'visual-memory': '👁️ Visual Memory',
      'verbal-memory': '📝 Verbal Memory',
      puzzles: '🧩 Puzzles',
      multiplayer: '👥 Multiplayer',
      trivia: '❓ Trivia Royale',
      spyfall: '🕵️ Spyfall',
      codenames: '🔐 Codenames',
      werewolf: '🐺 Werewolf',
      sketch: '🎨 Sketch & Guess',
      'word-games': '💬 Word Games',
      connections: '🔗 Connections',
      npat: '📊 NPAT',
      'bet-bluff': '🎰 Bet or Bluff',
      'fools-gold': '💰 Fools Gold',
      duos: '👫 Duos',
      imposter: '🎭 Imposter',
      herd: '🐑 Herd Mentality',
      'hot-seat': '🔥 Hot Seat',
      kmk: '🤔 KMK',
      '21-questions': '❔ 21 Questions',
      party: '🎉 Party Games',
      hosting: '🏠 Hosting',
      special: '✨ Special'
    };
    
    container.innerHTML = `
      <div class="achievements-section">
        <div class="achievements-header">
          <div class="achievements-progress">
            <span class="achievements-count">${unlockedCount}/${totalCount}</span>
            <span class="achievements-label">Achievements Unlocked</span>
          </div>
          <div class="achievements-progress-bar">
            <div class="achievements-progress-fill" style="width: ${(unlockedCount/totalCount)*100}%"></div>
          </div>
        </div>
        
        <div class="achievements-categories">
          ${Object.entries(categories).map(([cat, achs]) => `
            <div class="achievement-category">
              <div class="category-header" onclick="this.parentElement.classList.toggle('collapsed')">
                <span class="category-name">${categoryNames[cat] || cat}</span>
                <span class="category-count">${achs.filter(a => a.unlocked).length}/${achs.length}</span>
                <span class="category-toggle">▼</span>
              </div>
              <div class="category-achievements">
                ${achs.map(a => this.renderAchievementCard(a)).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <style>
        .achievements-header { margin-bottom: 20px; }
        .achievements-progress { display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px; }
        .achievements-count { font-size: 1.5rem; font-weight: 700; color: #ff6b9d; }
        .achievements-label { color: rgba(255,255,255,0.6); font-size: 0.9rem; }
        .achievements-progress-bar { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
        .achievements-progress-fill { height: 100%; background: linear-gradient(90deg, #ff6b9d, #a445b2); border-radius: 4px; }
        
        .achievement-category { margin-bottom: 16px; }
        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .category-header:hover { background: rgba(255,255,255,0.06); }
        .category-name { flex: 1; font-weight: 600; }
        .category-count { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
        .category-toggle { color: rgba(255,255,255,0.4); transition: transform 0.2s; }
        .achievement-category.collapsed .category-toggle { transform: rotate(-90deg); }
        .achievement-category.collapsed .category-achievements { display: none; }
        
        .category-achievements { padding: 12px 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
        
        .achievement-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          transition: all 0.2s;
        }
        .achievement-card:hover { background: rgba(255,255,255,0.04); }
        .achievement-card.unlocked { border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.05); }
        .achievement-card.locked { opacity: 0.5; }
        
        .achievement-icon-wrapper {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          flex-shrink: 0;
        }
        .achievement-card.unlocked .achievement-icon-wrapper { background: rgba(52,211,153,0.15); }
        
        .achievement-info { flex: 1; min-width: 0; }
        .achievement-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 2px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .achievement-desc { font-size: 0.8rem; color: rgba(255,255,255,0.5); }
        
        .rarity-badge {
          font-size: 0.65rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .rarity-common { background: rgba(148,163,184,0.2); color: #94a3b8; }
        .rarity-uncommon { background: rgba(34,197,94,0.2); color: #22c55e; }
        .rarity-rare { background: rgba(59,130,246,0.2); color: #3b82f6; }
        .rarity-epic { background: rgba(168,85,247,0.2); color: #a855f7; }
        .rarity-legendary { background: rgba(251,191,36,0.2); color: #fbbf24; }
        
        .achievement-xp { font-size: 0.75rem; color: #ff6b9d; font-weight: 600; }
      </style>
    `;
  }
  
  renderAchievementCard(achievement) {
    const rarity = achievement.rarity || 'common';
    
    return `
      <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon-wrapper">${achievement.icon}</div>
        <div class="achievement-info">
          <div class="achievement-title">
            ${achievement.title}
            <span class="rarity-badge rarity-${rarity}">${rarity}</span>
          </div>
          <div class="achievement-desc">${achievement.description}</div>
          <div class="achievement-xp">+${achievement.xp_reward} XP</div>
        </div>
      </div>
    `;
  }

  // ============ REFERRALS ============
  
  async renderReferralSection() {
    const container = document.getElementById('referrals-container');
    if (!container) return;
    
    const shareUrl = `${window.location.origin}?ref=${this.referralCode}`;
    
    container.innerHTML = `
      <div class="referral-section">
        <div class="referral-header">
          <h3>🎁 Invite Friends & Earn Rewards</h3>
          <p>Share your referral code and both you and your friend get bonus XP!</p>
        </div>
        
        <div class="referral-rewards">
          <div class="reward-item">
            <span class="reward-icon">🎮</span>
            <span class="reward-text">You get <strong>500 XP</strong> per referral</span>
          </div>
          <div class="reward-item">
            <span class="reward-icon">🎉</span>
            <span class="reward-text">Friends get <strong>250 XP</strong> bonus</span>
          </div>
          <div class="reward-item">
            <span class="reward-icon">🏆</span>
            <span class="reward-text">Unlock exclusive achievements</span>
          </div>
        </div>
        
        <div class="referral-code-box">
          <div class="code-label">Your Referral Code</div>
          <div class="code-display">
            <span class="code-text" id="referral-code">${this.referralCode}</span>
            <button class="copy-btn" onclick="window.profileEngagementUI?.copyReferralCode()">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
          </div>
        </div>
        
        <div class="referral-share">
          <div class="share-label">Share Link</div>
          <div class="share-url-box">
            <input type="text" class="share-url" value="${shareUrl}" readonly>
            <button class="copy-btn" onclick="window.profileEngagementUI?.copyShareLink()">Copy Link</button>
          </div>
        </div>
        
        <div class="referral-stats-grid">
          <div class="ref-stat">
            <div class="ref-stat-value">${this.referralStats.total}</div>
            <div class="ref-stat-label">Total Referrals</div>
          </div>
          <div class="ref-stat">
            <div class="ref-stat-value">${this.referralStats.successful}</div>
            <div class="ref-stat-label">Successful</div>
          </div>
          <div class="ref-stat">
            <div class="ref-stat-value">${this.referralStats.xpEarned}</div>
            <div class="ref-stat-label">XP Earned</div>
          </div>
        </div>
      </div>
      
      <style>
        .referral-section { }
        .referral-header { margin-bottom: 20px; }
        .referral-header h3 { font-size: 1.2rem; margin-bottom: 8px; font-family: inherit; letter-spacing: 0; }
        .referral-header p { color: rgba(255,255,255,0.6); font-size: 0.9rem; }
        
        .referral-rewards {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
        }
        .reward-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          font-size: 0.85rem;
        }
        .reward-icon { font-size: 1.2rem; }
        .reward-text strong { color: #ff6b9d; }
        
        .referral-code-box {
          background: linear-gradient(135deg, rgba(255,107,157,0.1), rgba(164,69,178,0.1));
          border: 1px solid rgba(255,107,157,0.3);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .code-label { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
        .code-display { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .code-text { 
          font-family: 'Bebas Neue', monospace;
          font-size: 2rem;
          letter-spacing: 4px;
          color: white;
        }
        
        .copy-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .copy-btn:hover { background: rgba(255,255,255,0.15); }
        
        .referral-share { margin-bottom: 24px; }
        .share-label { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
        .share-url-box { display: flex; gap: 8px; }
        .share-url {
          flex: 1;
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.8);
          font-size: 0.85rem;
        }
        
        .referral-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .ref-stat {
          text-align: center;
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
        }
        .ref-stat-value { font-size: 1.5rem; font-weight: 700; color: #ff6b9d; }
        .ref-stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-top: 4px; }
        
        @media (max-width: 600px) {
          .code-text { font-size: 1.5rem; letter-spacing: 2px; }
          .referral-stats-grid { grid-template-columns: 1fr; }
          .share-url-box { flex-direction: column; }
        }
      </style>
    `;
  }
  
  copyReferralCode() {
    navigator.clipboard.writeText(this.referralCode);
    this.showToast('Referral code copied!');
  }
  
  copyShareLink() {
    const url = `${window.location.origin}?ref=${this.referralCode}`;
    navigator.clipboard.writeText(url);
    this.showToast('Share link copied!');
  }
  
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'profile-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(52,211,153,0.9);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      z-index: 9999;
      animation: fadeInUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
  
  async claimChallengeReward(challengeId, type) {
    if (this.engagement) {
      await this.engagement.claimChallengeReward(challengeId);
      this.renderChallengesSection();
    } else {
      this.showToast('Reward claimed! +XP');
    }
  }
}

// ============ STATS ============
  
  renderStatsSection() {
    const container = document.getElementById('stats-container');
    if (!container) return;
    
    const stats = this.userStats || {};
    const profile = this.userProfile || {};
    
    // Calculate level from XP
    const xp = profile.xp || 0;
    const level = Math.floor(xp / 1000) + 1;
    const xpInLevel = xp % 1000;
    const xpForNextLevel = 1000;
    
    container.innerHTML = `
      <div class="stats-section">
        <!-- Level & XP -->
        <div class="stats-card level-card">
          <div class="level-display">
            <div class="level-badge">LVL ${level}</div>
            <div class="level-info">
              <div class="xp-text">${xp.toLocaleString()} XP</div>
              <div class="xp-progress-bar">
                <div class="xp-progress-fill" style="width: ${(xpInLevel/xpForNextLevel)*100}%"></div>
              </div>
              <div class="xp-to-next">${xpForNextLevel - xpInLevel} XP to level ${level + 1}</div>
            </div>
          </div>
        </div>
        
        <!-- Overview Stats -->
        <div class="stats-grid overview-grid">
          <div class="stat-item">
            <div class="stat-value">${stats.total_games_played || 0}</div>
            <div class="stat-label">Games Played</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.total_wins || 0}</div>
            <div class="stat-label">Total Wins</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.total_games_played > 0 ? Math.round((stats.total_wins / stats.total_games_played) * 100) : 0}%</div>
            <div class="stat-label">Win Rate</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.best_win_streak || 0}</div>
            <div class="stat-label">Best Streak</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.daily_login_streak || 0}</div>
            <div class="stat-label">Login Streak</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.friends_count || 0}</div>
            <div class="stat-label">Friends</div>
          </div>
        </div>
        
        <!-- Solo Games Stats -->
        <div class="stats-category">
          <h3 class="category-title">🎮 Solo Games</h3>
          <div class="stats-grid games-grid">
            ${this.renderGameStat('2048', '🔢', stats.games_2048_played, stats.games_2048_best, 'Best Tile')}
            ${this.renderGameStat('Snake', '🐍', stats.games_snake_played, stats.games_snake_best, 'High Score')}
            ${this.renderGameStat('Sky Hop', '☁️', stats.games_skyhop_played, stats.games_skyhop_best, 'High Score')}
            ${this.renderGameStat('Typing Test', '⌨️', stats.games_typing_played, stats.games_typing_best_wpm, 'Best WPM')}
            ${this.renderGameStat('Reaction Time', '⚡', stats.games_reaction_played, stats.games_reaction_best_ms, 'Best Time', 'ms')}
            ${this.renderGameStat('Aim Trainer', '🎯', stats.games_aim_played, stats.games_aim_best, 'Best Score')}
            ${this.renderGameStat('Chimp Test', '🐵', stats.games_chimp_played, stats.games_chimp_best, 'Best Level')}
            ${this.renderGameStat('Sequence Memory', '🔵', stats.games_sequence_played, stats.games_sequence_best, 'Best Level')}
            ${this.renderGameStat('Number Memory', '🔢', stats.games_number_played, stats.games_number_best, 'Best Level')}
            ${this.renderGameStat('Visual Memory', '👁️', stats.games_visual_played, stats.games_visual_best, 'Best Level')}
            ${this.renderGameStat('Verbal Memory', '📝', stats.games_verbal_played, stats.games_verbal_best, 'Best Score')}
            ${this.renderGameStat('Stroop Test', '🌈', stats.games_stroop_played, stats.games_stroop_best, 'Best Score')}
            ${this.renderGameStat('Math Speed', '➕', stats.games_math_played, stats.games_math_best, 'Best Score')}
            ${this.renderGameStat('Minesweeper', '💣', stats.games_minesweeper_played, stats.games_minesweeper_wins, 'Wins')}
            ${this.renderGameStat('Sudoku', '🔢', stats.games_sudoku_played, stats.games_sudoku_completed, 'Completed')}
            ${this.renderGameStat('Crossword', '📝', stats.games_crossword_played, stats.games_crossword_completed, 'Completed')}
            ${this.renderGameStat('Word Search', '🔍', stats.games_wordsearch_played, stats.games_wordsearch_completed, 'Completed')}
            ${this.renderGameStat('Nonogram', '🖼️', stats.games_nonogram_played, stats.games_nonogram_completed, 'Completed')}
            ${this.renderGameStat('Block Stack', '🧱', stats.games_blockstack_played, stats.games_blockstack_best, 'High Score')}
          </div>
        </div>
        
        <!-- Multiplayer Games Stats -->
        <div class="stats-category">
          <h3 class="category-title">👥 Multiplayer Games</h3>
          <div class="stats-grid games-grid">
            ${this.renderGameStat('Trivia Royale', '❓', stats.games_trivia_played, stats.games_trivia_wins, 'Wins')}
            ${this.renderGameStat('Spyfall', '🕵️', stats.games_spyfall_played, stats.games_spyfall_wins, 'Wins')}
            ${this.renderGameStat('Codenames', '🔐', stats.games_codenames_played, stats.games_codenames_wins, 'Wins')}
            ${this.renderGameStat('Werewolf', '🐺', stats.games_werewolf_played, stats.games_werewolf_wins, 'Wins')}
            ${this.renderGameStat('Sketch & Guess', '🎨', stats.games_drawguess_played, stats.games_drawguess_wins, 'Wins')}
            ${this.renderGameStat('Word Association', '💬', stats.games_wordassoc_played, stats.games_wordassoc_wins, 'Wins')}
            ${this.renderGameStat('Connections', '🔗', stats.games_connections_played, stats.games_connections_wins, 'Wins')}
            ${this.renderGameStat('NPAT', '📊', stats.games_npat_played, stats.games_npat_wins, 'Wins')}
            ${this.renderGameStat('Bet or Bluff', '🎰', stats.games_betbluff_played, stats.games_betbluff_wins, 'Wins')}
            ${this.renderGameStat("Fool's Gold", '💰', stats.games_foolsgold_played, stats.games_foolsgold_wins, 'Wins')}
            ${this.renderGameStat('Duos', '👫', stats.games_duos_played, stats.games_duos_wins, 'Wins')}
            ${this.renderGameStat('Imposter', '🎭', stats.games_imposter_played, stats.games_imposter_wins, 'Wins')}
            ${this.renderGameStat('Herd Mentality', '🐑', stats.games_herd_played, stats.games_herd_wins, 'Wins')}
            ${this.renderGameStat('Hot Seat', '🔥', stats.games_hotseat_played, stats.games_hotseat_wins, 'Wins')}
            ${this.renderGameStat('KMK', '🤔', stats.games_kmk_played, stats.games_kmk_wins, 'Wins')}
            ${this.renderGameStat('21 Questions', '❔', stats.games_21q_played, stats.games_21q_wins, 'Wins')}
            ${this.renderGameStat('Story Builder', '📖', stats.games_story_played, null, null)}
            ${this.renderGameStat('Finish My Sentence', '✍️', stats.games_sentence_played, null, null)}
          </div>
        </div>
        
        <!-- Party Games Stats -->
        <div class="stats-category">
          <h3 class="category-title">🎉 Party Games</h3>
          <div class="stats-grid games-grid">
            ${this.renderGameStat('Would You Rather', '🤔', stats.games_wyr_played, null, null)}
            ${this.renderGameStat('Never Have I Ever', '🙈', stats.games_nhie_played, null, null)}
            ${this.renderGameStat('Truth or Dare', '😈', stats.games_tod_played, null, null)}
            ${this.renderGameStat('This or That', '⚖️', stats.games_tot_played, null, null)}
            ${this.renderGameStat('Hot Takes', '🌶️', stats.games_hottakes_played, null, null)}
            ${this.renderGameStat('Charades', '🎭', stats.games_charades_played, null, null)}
          </div>
        </div>
        
        <!-- Hosting Stats -->
        <div class="stats-category">
          <h3 class="category-title">🏠 Hosting</h3>
          <div class="stats-grid overview-grid">
            <div class="stat-item">
              <div class="stat-value">${stats.games_hosted || 0}</div>
              <div class="stat-label">Games Hosted</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.total_playtime_minutes ? Math.floor(stats.total_playtime_minutes / 60) : 0}h</div>
              <div class="stat-label">Total Playtime</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.referrals_count || 0}</div>
              <div class="stat-label">Referrals</div>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        .stats-section { }
        
        .stats-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .level-card {
          background: linear-gradient(135deg, rgba(255,107,157,0.1), rgba(164,69,178,0.1));
          border-color: rgba(255,107,157,0.3);
        }
        
        .level-display { display: flex; align-items: center; gap: 20px; }
        
        .level-badge {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ff6b9d, #a445b2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          padding: 12px 20px;
          border: 2px solid rgba(255,107,157,0.4);
          border-radius: 12px;
        }
        
        .level-info { flex: 1; }
        .xp-text { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
        .xp-progress-bar { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
        .xp-progress-fill { height: 100%; background: linear-gradient(90deg, #ff6b9d, #a445b2); border-radius: 4px; }
        .xp-to-next { font-size: 0.8rem; color: rgba(255,255,255,0.5); }
        
        .stats-grid {
          display: grid;
          gap: 12px;
        }
        
        .overview-grid {
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          margin-bottom: 24px;
        }
        
        .games-grid {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }
        
        .stat-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 16px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ff6b9d;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        
        .stats-category {
          margin-bottom: 24px;
        }
        
        .category-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: rgba(255,255,255,0.9);
          font-family: inherit;
          letter-spacing: 0;
        }
        
        .game-stat-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .game-stat-card.no-plays {
          opacity: 0.5;
        }
        
        .game-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          flex-shrink: 0;
        }
        
        .game-stat-info { flex: 1; min-width: 0; }
        .game-stat-name { font-weight: 600; font-size: 0.85rem; margin-bottom: 2px; }
        .game-stat-detail { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
        .game-stat-plays { font-size: 0.7rem; color: rgba(255,255,255,0.4); }
        .game-stat-best { color: #ff6b9d; font-weight: 600; }
        
        @media (max-width: 600px) {
          .level-display { flex-direction: column; text-align: center; }
          .overview-grid { grid-template-columns: repeat(3, 1fr); }
          .games-grid { grid-template-columns: repeat(2, 1fr); }
        }
      </style>
    `;
  }
  
  renderGameStat(name, icon, played, best, bestLabel, suffix = '') {
    const hasPlays = played && played > 0;
    const hasBest = best !== null && best !== undefined && best > 0;
    
    return `
      <div class="game-stat-card ${hasPlays ? '' : 'no-plays'}">
        <div class="game-icon">${icon}</div>
        <div class="game-stat-info">
          <div class="game-stat-name">${name}</div>
          ${hasBest ? `
            <div class="game-stat-detail">
              <span class="game-stat-best">${best}${suffix}</span> ${bestLabel}
            </div>
          ` : ''}
          <div class="game-stat-plays">${played || 0} plays</div>
        </div>
      </div>
    `;
  }
}

// Export for use
window.ProfileEngagementUI = ProfileEngagementUI;
