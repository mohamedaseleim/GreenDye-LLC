const DailyLearningRecord = require('../models/DailyLearningRecord');
const { LeaderboardEntry, Badge, UserAchievement } = require('../models/Gamification');

/**
 * Log a user's learning activity for today.
 *
 * When a user performs any learning‑related action (e.g. completes a
 * lesson, takes a quiz, earns points), this function should be called
 * to ensure there is a record for the current calendar day. The time
 * portion of the date is normalised to midnight to simplify
 * streak calculations.
 *
 * @param {String} userId - The ID of the user performing the activity.
 * @param {String[]} [activityTypes] - Optional list of activity types.
 * @returns {Promise<DailyLearningRecord>} The daily learning record.
 */
async function logLearningActivity(userId, activityTypes = []) {
  // Normalise to midnight so that all records for the same day share
  // an identical timestamp. This avoids duplicate records for a single
  // day and simplifies streak calculations.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find or create the record for today
  let record = await DailyLearningRecord.findOne({ user: userId, date: today });
  if (!record) {
    record = await DailyLearningRecord.create({ user: userId, date: today, activities: activityTypes });
  } else if (activityTypes && activityTypes.length > 0) {
    // Append any new activity types that are not already recorded
    const existing = new Set(record.activities);
    for (const type of activityTypes) {
      if (!existing.has(type)) {
        record.activities.push(type);
      }
    }
    await record.save();
  }
  return record;
}

/**
 * Calculate the current and longest learning streaks for a user.
 *
 * A streak is defined as a sequence of consecutive days (without gaps)
 * on which the user has at least one learning record. The current
 * streak counts from the most recent day backwards, while the longest
 * streak reflects the maximum sequence length across all time.
 *
 * @param {String} userId - The ID of the user.
 * @returns {Promise<{currentStreak: number, longestStreak: number}>}
 */
async function calculateStreak(userId) {
  // Fetch all records sorted descending by date
  const records = await DailyLearningRecord.find({ user: userId }).sort({ date: -1 });
  let currentStreak = 0;
  let longestStreak = 0;
  let prevDate = null;

  for (const record of records) {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    if (prevDate === null) {
      // first iteration
      currentStreak = 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      const diffDays = Math.floor((prevDate - recordDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak += 1;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else if (diffDays > 1) {
        // gap larger than one day breaks the streak
        break;
      }
      // If diffDays === 0 (duplicate day), continue without changing streak
    }
    prevDate = recordDate;
  }
  // If there were no records, streaks remain zero
  return { currentStreak, longestStreak };
}

/**
 * Award badges based on the user's current streak length.
 *
 * This function awards all active streak‑related badges whose
 * threshold is less than or equal to the user’s current streak and
 * which the user has not yet earned. Points associated with each
 * badge are added to the provided leaderboard entry. Newly earned
 * achievements are returned to the caller.
 *
 * @param {String} userId - The user’s ID.
 * @param {number} currentStreak - The user’s current streak length.
 * @param {LeaderboardEntry} leaderboardEntry - The user’s leaderboard entry.
 * @returns {Promise<UserAchievement[]>}
 */
async function awardStreakBadges(userId, currentStreak, leaderboardEntry) {
  // Fetch all active badges with type 'streak_days' and threshold <= current streak
  const badges = await Badge.find({
    isActive: true,
    'criteria.type': 'streak_days',
    'criteria.threshold': { $lte: currentStreak },
  });
  const newlyEarned = [];
  for (const badge of badges) {
    const existing = await UserAchievement.findOne({ user: userId, badge: badge._id });
    if (existing) {
      continue;
    }
    const achievement = await UserAchievement.create({
      user: userId,
      badge: badge._id,
      progress: {
        current: badge.criteria.threshold,
        target: badge.criteria.threshold,
      },
    });
    // Add badge points to leaderboard if applicable
    if (leaderboardEntry && typeof badge.points === 'number') {
      leaderboardEntry.points += badge.points;
    }
    newlyEarned.push(achievement);
  }
  return newlyEarned;
}

/**
 * Update the user's streak information on the leaderboard and award streak badges.
 *
 * This helper calculates the current and longest streaks based on daily
 * records, updates the corresponding fields on the leaderboard entry,
 * and awards any streak‑related badges. The leaderboard entry is
 * created if it does not already exist.
 *
 * @param {String} userId - The user’s ID.
 * @returns {Promise<{leaderboardEntry: LeaderboardEntry, newlyEarnedBadges: UserAchievement[]}>}
 */
async function updateLeaderboardStreak(userId) {
  const { currentStreak, longestStreak } = await calculateStreak(userId);
  let leaderboardEntry = await LeaderboardEntry.findOne({ user: userId, period: 'all_time' });
  if (!leaderboardEntry) {
    leaderboardEntry = await LeaderboardEntry.create({
      user: userId,
      points: 0,
      period: 'all_time',
      streak: {
        current: currentStreak,
        longest: longestStreak,
        lastActivity: new Date(),
      },
    });
  } else {
    // Only update longest streak if the current streak surpasses it
    leaderboardEntry.streak.current = currentStreak;
    if (!leaderboardEntry.streak.longest || currentStreak > leaderboardEntry.streak.longest) {
      leaderboardEntry.streak.longest = currentStreak;
    }
    leaderboardEntry.streak.lastActivity = new Date();
  }
  // Award streak badges based on the current streak length
  const newlyEarnedBadges = await awardStreakBadges(userId, currentStreak, leaderboardEntry);
  // Persist changes (leaderboard points may have been updated by badge awards)
  await leaderboardEntry.save();
  return { leaderboardEntry, newlyEarnedBadges };
}

module.exports = {
  logLearningActivity,
  calculateStreak,
  updateLeaderboardStreak,
  awardStreakBadges,
};
