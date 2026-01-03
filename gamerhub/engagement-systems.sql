-- =============================================
-- THEGAMING.CO ENGAGEMENT SYSTEMS
-- Daily/Weekly Challenges, Achievements, Referrals, Custom Content
-- =============================================

-- ============ CHALLENGES SYSTEM ============

-- Challenge definitions (admin-created)
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'special')),
  category TEXT DEFAULT 'general', -- 'solo', 'multiplayer', 'social', 'general'
  
  -- Requirements
  requirement_type TEXT NOT NULL, -- 'play_games', 'win_games', 'score_points', 'play_specific', 'invite_friends', etc.
  requirement_target INTEGER NOT NULL DEFAULT 1, -- e.g., play 3 games
  requirement_game TEXT DEFAULT NULL, -- specific game if needed (e.g., 'trivia-royale')
  
  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  cosmetic_reward_type TEXT DEFAULT NULL, -- 'badge', 'title', 'border', 'effect', etc.
  cosmetic_reward_id TEXT DEFAULT NULL, -- ID of the cosmetic item
  
  -- Scheduling
  day_of_week INTEGER DEFAULT NULL, -- 0-6 for weekly challenges (0=Sunday)
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenge progress
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  reward_claimed BOOLEAN DEFAULT false,
  
  -- For daily/weekly reset tracking
  period_start DATE NOT NULL, -- Start of the day/week this challenge is for
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, challenge_id, period_start)
);

-- ============ ACHIEVEMENTS SYSTEM ============

-- Achievement definitions
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY, -- e.g., 'first_win', 'games_100', 'streak_5'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '🏆',
  category TEXT DEFAULT 'general', -- 'games', 'social', 'collection', 'special'
  
  -- Requirements
  requirement_type TEXT NOT NULL, -- 'total_wins', 'total_games', 'win_streak', 'friends_count', etc.
  requirement_value INTEGER NOT NULL DEFAULT 1,
  requirement_game TEXT DEFAULT NULL, -- specific game if needed
  
  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  cosmetic_reward_type TEXT DEFAULT NULL,
  cosmetic_reward_id TEXT DEFAULT NULL,
  
  -- Display
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  sort_order INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false, -- Secret achievements
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  reward_claimed BOOLEAN DEFAULT false,
  
  UNIQUE(user_id, achievement_id)
);

-- User stats for achievement tracking
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Game stats
  total_games_played INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  current_win_streak INTEGER DEFAULT 0,
  best_win_streak INTEGER DEFAULT 0,
  
  -- Solo game stats
  solo_games_played INTEGER DEFAULT 0,
  solo_best_scores JSONB DEFAULT '{}', -- {"2048": 12345, "snake": 67}
  
  -- Multiplayer stats
  multiplayer_games_played INTEGER DEFAULT 0,
  multiplayer_wins INTEGER DEFAULT 0,
  
  -- Social stats
  friends_count INTEGER DEFAULT 0,
  referrals_count INTEGER DEFAULT 0,
  games_hosted INTEGER DEFAULT 0,
  
  -- Time stats
  total_playtime_minutes INTEGER DEFAULT 0,
  
  -- Streaks
  daily_login_streak INTEGER DEFAULT 0,
  best_daily_login_streak INTEGER DEFAULT 0,
  last_login_date DATE DEFAULT NULL,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ REFERRAL SYSTEM ============

-- Referral codes
CREATE TABLE IF NOT EXISTS referral_codes (
  code TEXT PRIMARY KEY, -- e.g., 'SHAH2024' or auto-generated
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  
  -- Rewards for referrer
  referrer_xp_per_use INTEGER DEFAULT 500,
  referrer_cosmetic_type TEXT DEFAULT NULL,
  referrer_cosmetic_id TEXT DEFAULT NULL,
  
  -- Rewards for new user
  referee_xp_bonus INTEGER DEFAULT 250,
  referee_cosmetic_type TEXT DEFAULT NULL,
  referee_cosmetic_id TEXT DEFAULT NULL,
  
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral tracking
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT REFERENCES referral_codes(code) ON DELETE SET NULL,
  
  referrer_rewarded BOOLEAN DEFAULT false,
  referee_rewarded BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(referee_id) -- Each user can only be referred once
);

-- ============ CUSTOM CONTENT SYSTEM ============

-- User-submitted question packs
CREATE TABLE IF NOT EXISTS custom_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  game_type TEXT NOT NULL, -- 'trivia', 'would-you-rather', 'never-have-i-ever', 'this-or-that', 'hot-takes'
  category TEXT DEFAULT 'general', -- 'pop-culture', 'sports', 'science', 'adult', etc.
  
  -- Content
  questions JSONB NOT NULL, -- Array of question objects
  question_count INTEGER GENERATED ALWAYS AS (jsonb_array_length(questions)) STORED,
  
  -- Moderation
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderator_notes TEXT DEFAULT NULL,
  moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ DEFAULT NULL,
  
  -- Stats
  times_played INTEGER DEFAULT 0,
  rating_sum INTEGER DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) GENERATED ALWAYS AS (
    CASE WHEN rating_count > 0 THEN rating_sum::NUMERIC / rating_count ELSE 0 END
  ) STORED,
  
  -- Rewards for creator
  creator_xp_earned INTEGER DEFAULT 0, -- Earned from plays
  
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pack ratings by users
CREATE TABLE IF NOT EXISTS pack_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID REFERENCES custom_packs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(pack_id, user_id)
);

-- Pack reports
CREATE TABLE IF NOT EXISTS pack_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID REFERENCES custom_packs(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ COSMETIC UNLOCKS ============

-- Track which cosmetics users have unlocked (beyond what they purchased)
CREATE TABLE IF NOT EXISTS user_cosmetic_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  cosmetic_type TEXT NOT NULL, -- 'badge', 'title', 'border_color', 'border_style', 'name_effect', 'entrance'
  cosmetic_id TEXT NOT NULL, -- The specific item ID
  
  source TEXT NOT NULL, -- 'achievement', 'challenge', 'referral', 'purchase', 'special'
  source_id TEXT DEFAULT NULL, -- ID of the achievement/challenge that unlocked it
  
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, cosmetic_type, cosmetic_id)
);

-- ============ INDEXES ============

CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_period ON user_challenges(period_start);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_custom_packs_status ON custom_packs(status);
CREATE INDEX IF NOT EXISTS idx_custom_packs_game ON custom_packs(game_type, status);
CREATE INDEX IF NOT EXISTS idx_custom_packs_creator ON custom_packs(creator_id);

-- ============ FUNCTIONS ============

-- Update challenge progress
CREATE OR REPLACE FUNCTION update_challenge_progress(
  p_user_id UUID,
  p_requirement_type TEXT,
  p_increment INTEGER DEFAULT 1,
  p_game TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_week_start DATE := date_trunc('week', CURRENT_DATE)::DATE;
BEGIN
  -- Update daily challenges
  UPDATE user_challenges uc
  SET 
    progress = LEAST(progress + p_increment, c.requirement_target),
    completed = CASE WHEN progress + p_increment >= c.requirement_target THEN true ELSE completed END,
    completed_at = CASE WHEN progress + p_increment >= c.requirement_target AND completed_at IS NULL THEN NOW() ELSE completed_at END,
    updated_at = NOW()
  FROM challenges c
  WHERE uc.challenge_id = c.id
    AND uc.user_id = p_user_id
    AND uc.period_start = v_today
    AND c.type = 'daily'
    AND c.requirement_type = p_requirement_type
    AND (c.requirement_game IS NULL OR c.requirement_game = p_game)
    AND uc.completed = false;
  
  -- Update weekly challenges
  UPDATE user_challenges uc
  SET 
    progress = LEAST(progress + p_increment, c.requirement_target),
    completed = CASE WHEN progress + p_increment >= c.requirement_target THEN true ELSE completed END,
    completed_at = CASE WHEN progress + p_increment >= c.requirement_target AND completed_at IS NULL THEN NOW() ELSE completed_at END,
    updated_at = NOW()
  FROM challenges c
  WHERE uc.challenge_id = c.id
    AND uc.user_id = p_user_id
    AND uc.period_start = v_week_start
    AND c.type = 'weekly'
    AND c.requirement_type = p_requirement_type
    AND (c.requirement_game IS NULL OR c.requirement_game = p_game)
    AND uc.completed = false;
END;
$$ LANGUAGE plpgsql;

-- Assign daily challenges to user
CREATE OR REPLACE FUNCTION assign_daily_challenges(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Insert daily challenges that user doesn't have yet
  INSERT INTO user_challenges (user_id, challenge_id, period_start)
  SELECT p_user_id, c.id, v_today
  FROM challenges c
  WHERE c.type = 'daily'
    AND c.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM user_challenges uc 
      WHERE uc.user_id = p_user_id 
        AND uc.challenge_id = c.id 
        AND uc.period_start = v_today
    )
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Assign weekly challenges to user
CREATE OR REPLACE FUNCTION assign_weekly_challenges(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_week_start DATE := date_trunc('week', CURRENT_DATE)::DATE;
BEGIN
  INSERT INTO user_challenges (user_id, challenge_id, period_start)
  SELECT p_user_id, c.id, v_week_start
  FROM challenges c
  WHERE c.type = 'weekly'
    AND c.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM user_challenges uc 
      WHERE uc.user_id = p_user_id 
        AND uc.challenge_id = c.id 
        AND uc.period_start = v_week_start
    )
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Check and unlock achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS TABLE(achievement_id TEXT, title TEXT, icon TEXT, xp_reward INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH user_stat AS (
    SELECT * FROM user_stats WHERE user_id = p_user_id
  ),
  newly_unlocked AS (
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT p_user_id, a.id
    FROM achievements a, user_stat us
    WHERE a.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM user_achievements ua 
        WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
      )
      AND (
        (a.requirement_type = 'total_games' AND us.total_games_played >= a.requirement_value)
        OR (a.requirement_type = 'total_wins' AND us.total_wins >= a.requirement_value)
        OR (a.requirement_type = 'win_streak' AND us.best_win_streak >= a.requirement_value)
        OR (a.requirement_type = 'friends_count' AND us.friends_count >= a.requirement_value)
        OR (a.requirement_type = 'referrals_count' AND us.referrals_count >= a.requirement_value)
        OR (a.requirement_type = 'daily_streak' AND us.best_daily_login_streak >= a.requirement_value)
        OR (a.requirement_type = 'playtime_hours' AND us.total_playtime_minutes >= a.requirement_value * 60)
      )
    ON CONFLICT DO NOTHING
    RETURNING achievement_id
  )
  SELECT a.id, a.title, a.icon, a.xp_reward
  FROM newly_unlocked nu
  JOIN achievements a ON a.id = nu.achievement_id;
END;
$$ LANGUAGE plpgsql;

-- Claim challenge reward
CREATE OR REPLACE FUNCTION claim_challenge_reward(p_user_id UUID, p_challenge_id UUID, p_period_start DATE)
RETURNS JSONB AS $$
DECLARE
  v_challenge RECORD;
  v_result JSONB;
BEGIN
  -- Get challenge details
  SELECT c.*, uc.completed, uc.reward_claimed
  INTO v_challenge
  FROM user_challenges uc
  JOIN challenges c ON c.id = uc.challenge_id
  WHERE uc.user_id = p_user_id 
    AND uc.challenge_id = p_challenge_id
    AND uc.period_start = p_period_start;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenge not found');
  END IF;
  
  IF NOT v_challenge.completed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenge not completed');
  END IF;
  
  IF v_challenge.reward_claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward already claimed');
  END IF;
  
  -- Mark as claimed
  UPDATE user_challenges 
  SET reward_claimed = true 
  WHERE user_id = p_user_id 
    AND challenge_id = p_challenge_id 
    AND period_start = p_period_start;
  
  -- Award XP
  IF v_challenge.xp_reward > 0 THEN
    UPDATE profiles SET xp = COALESCE(xp, 0) + v_challenge.xp_reward WHERE id = p_user_id;
  END IF;
  
  -- Unlock cosmetic if applicable
  IF v_challenge.cosmetic_reward_type IS NOT NULL THEN
    INSERT INTO user_cosmetic_unlocks (user_id, cosmetic_type, cosmetic_id, source, source_id)
    VALUES (p_user_id, v_challenge.cosmetic_reward_type, v_challenge.cosmetic_reward_id, 'challenge', p_challenge_id::TEXT)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true, 
    'xp_earned', v_challenge.xp_reward,
    'cosmetic_type', v_challenge.cosmetic_reward_type,
    'cosmetic_id', v_challenge.cosmetic_reward_id
  );
END;
$$ LANGUAGE plpgsql;

-- Process referral
CREATE OR REPLACE FUNCTION process_referral(p_referee_id UUID, p_referral_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_code RECORD;
  v_referrer_id UUID;
BEGIN
  -- Get referral code
  SELECT * INTO v_code FROM referral_codes WHERE code = UPPER(p_referral_code) AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Referral code expired');
  END IF;
  
  IF v_code.max_uses IS NOT NULL AND v_code.uses_count >= v_code.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'Referral code max uses reached');
  END IF;
  
  IF v_code.user_id = p_referee_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot use your own referral code');
  END IF;
  
  -- Check if already referred
  IF EXISTS (SELECT 1 FROM referrals WHERE referee_id = p_referee_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already used a referral code');
  END IF;
  
  v_referrer_id := v_code.user_id;
  
  -- Create referral record
  INSERT INTO referrals (referrer_id, referee_id, referral_code)
  VALUES (v_referrer_id, p_referee_id, v_code.code);
  
  -- Update code uses
  UPDATE referral_codes SET uses_count = uses_count + 1 WHERE code = v_code.code;
  
  -- Award referee bonus
  UPDATE profiles SET xp = COALESCE(xp, 0) + v_code.referee_xp_bonus WHERE id = p_referee_id;
  
  -- Award referrer bonus
  UPDATE profiles SET xp = COALESCE(xp, 0) + v_code.referrer_xp_per_use WHERE id = v_referrer_id;
  
  -- Update referrer stats
  UPDATE user_stats SET referrals_count = referrals_count + 1 WHERE user_id = v_referrer_id;
  
  -- Unlock cosmetics if applicable
  IF v_code.referee_cosmetic_type IS NOT NULL THEN
    INSERT INTO user_cosmetic_unlocks (user_id, cosmetic_type, cosmetic_id, source, source_id)
    VALUES (p_referee_id, v_code.referee_cosmetic_type, v_code.referee_cosmetic_id, 'referral', v_code.code)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF v_code.referrer_cosmetic_type IS NOT NULL THEN
    INSERT INTO user_cosmetic_unlocks (user_id, cosmetic_type, cosmetic_id, source, source_id)
    VALUES (v_referrer_id, v_code.referrer_cosmetic_type, v_code.referrer_cosmetic_id, 'referral', v_code.code)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Mark both as rewarded
  UPDATE referrals SET referrer_rewarded = true, referee_rewarded = true 
  WHERE referee_id = p_referee_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'referee_xp', v_code.referee_xp_bonus,
    'referrer_username', (SELECT display_name FROM profiles WHERE id = v_referrer_id)
  );
END;
$$ LANGUAGE plpgsql;

-- Generate referral code for user
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_username TEXT;
BEGIN
  -- Check if user already has a code
  SELECT code INTO v_code FROM referral_codes WHERE user_id = p_user_id LIMIT 1;
  IF FOUND THEN
    RETURN v_code;
  END IF;
  
  -- Generate code based on username
  SELECT UPPER(SUBSTRING(REGEXP_REPLACE(display_name, '[^a-zA-Z0-9]', '', 'g'), 1, 6)) 
  INTO v_username FROM profiles WHERE id = p_user_id;
  
  v_code := v_username || SUBSTRING(MD5(RANDOM()::TEXT), 1, 4);
  v_code := UPPER(v_code);
  
  -- Ensure unique
  WHILE EXISTS (SELECT 1 FROM referral_codes WHERE code = v_code) LOOP
    v_code := v_username || SUBSTRING(MD5(RANDOM()::TEXT), 1, 4);
    v_code := UPPER(v_code);
  END LOOP;
  
  -- Create code
  INSERT INTO referral_codes (code, user_id) VALUES (v_code, p_user_id);
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- ============ SEED DATA: DEFAULT CHALLENGES ============

INSERT INTO challenges (title, description, type, requirement_type, requirement_target, xp_reward) VALUES
-- Daily
('First Game', 'Play any game today', 'daily', 'play_games', 1, 50),
('Triple Play', 'Play 3 games today', 'daily', 'play_games', 3, 100),
('Winner', 'Win a multiplayer game', 'daily', 'win_games', 1, 75),
('Solo Grinder', 'Play 5 solo games', 'daily', 'play_solo', 5, 100),

-- Weekly
('Dedicated Player', 'Play 20 games this week', 'weekly', 'play_games', 20, 500),
('Champion', 'Win 10 multiplayer games', 'weekly', 'win_games', 10, 750),
('Social Butterfly', 'Play with 5 different friends', 'weekly', 'play_with_friends', 5, 400),
('Variety Pack', 'Play 5 different game types', 'weekly', 'play_unique_games', 5, 300)
ON CONFLICT DO NOTHING;

-- ============ SEED DATA: DEFAULT ACHIEVEMENTS ============

INSERT INTO achievements (id, title, description, icon, requirement_type, requirement_value, xp_reward, rarity) VALUES
-- Games played
('first_game', 'First Steps', 'Play your first game', '🎮', 'total_games', 1, 50, 'common'),
('games_10', 'Getting Started', 'Play 10 games', '🎯', 'total_games', 10, 100, 'common'),
('games_50', 'Regular', 'Play 50 games', '⭐', 'total_games', 50, 250, 'uncommon'),
('games_100', 'Dedicated', 'Play 100 games', '💫', 'total_games', 100, 500, 'uncommon'),
('games_500', 'Veteran', 'Play 500 games', '🏅', 'total_games', 500, 1000, 'rare'),
('games_1000', 'Legend', 'Play 1000 games', '👑', 'total_games', 1000, 2500, 'epic'),

-- Wins
('first_win', 'First Victory', 'Win your first game', '🏆', 'total_wins', 1, 75, 'common'),
('wins_10', 'Winner', 'Win 10 games', '🥇', 'total_wins', 10, 200, 'common'),
('wins_50', 'Champion', 'Win 50 games', '🏆', 'total_wins', 50, 500, 'uncommon'),
('wins_100', 'Master', 'Win 100 games', '💎', 'total_wins', 100, 1000, 'rare'),
('wins_500', 'Grandmaster', 'Win 500 games', '👑', 'total_wins', 500, 2500, 'epic'),

-- Win streaks
('streak_3', 'Hot Streak', 'Win 3 games in a row', '🔥', 'win_streak', 3, 150, 'common'),
('streak_5', 'On Fire', 'Win 5 games in a row', '🔥', 'win_streak', 5, 300, 'uncommon'),
('streak_10', 'Unstoppable', 'Win 10 games in a row', '💥', 'win_streak', 10, 750, 'rare'),

-- Social
('first_friend', 'Social', 'Add your first friend', '👋', 'friends_count', 1, 50, 'common'),
('friends_10', 'Popular', 'Have 10 friends', '🤝', 'friends_count', 10, 200, 'uncommon'),
('friends_50', 'Celebrity', 'Have 50 friends', '⭐', 'friends_count', 50, 500, 'rare'),

-- Referrals
('first_referral', 'Recruiter', 'Refer your first friend', '📣', 'referrals_count', 1, 250, 'uncommon'),
('referrals_5', 'Ambassador', 'Refer 5 friends', '🎺', 'referrals_count', 5, 750, 'rare'),
('referrals_10', 'Influencer', 'Refer 10 friends', '📢', 'referrals_count', 10, 1500, 'epic'),

-- Daily login
('streak_7d', 'Week Warrior', 'Log in 7 days in a row', '📅', 'daily_streak', 7, 200, 'common'),
('streak_30d', 'Month Master', 'Log in 30 days in a row', '📆', 'daily_streak', 30, 750, 'rare'),
('streak_100d', 'Dedicated Fan', 'Log in 100 days in a row', '🗓️', 'daily_streak', 100, 2000, 'legendary')

ON CONFLICT DO NOTHING;

-- ============ RLS POLICIES ============

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cosmetic_unlocks ENABLE ROW LEVEL SECURITY;

-- Everyone can read challenges/achievements definitions
CREATE POLICY "Challenges are viewable by everyone" ON challenges FOR SELECT USING (true);
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);

-- Users can only see their own progress
CREATE POLICY "Users view own challenges" ON user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own unlocks" ON user_cosmetic_unlocks FOR SELECT USING (auth.uid() = user_id);

-- Referral codes - users see their own
CREATE POLICY "Users view own referral codes" ON referral_codes FOR SELECT USING (auth.uid() = user_id OR is_active = true);

-- Custom packs - public approved ones viewable by all
CREATE POLICY "Approved packs viewable by all" ON custom_packs FOR SELECT USING (status = 'approved' AND is_public = true);
CREATE POLICY "Users view own packs" ON custom_packs FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Users create packs" ON custom_packs FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users update own packs" ON custom_packs FOR UPDATE USING (auth.uid() = creator_id);
