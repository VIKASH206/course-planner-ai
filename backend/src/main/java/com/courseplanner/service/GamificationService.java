package com.courseplanner.service;

import com.courseplanner.model.*;
import com.courseplanner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Gamification Service - Manages all gamification features
 */
@Service
public class GamificationService {

    @Autowired
    private UserGamificationRepository userGamificationRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private QuestRepository questRepository;

    @Autowired
    private RewardRepository rewardRepository;

    @Autowired
    private UserRepository userRepository;

    // XP Constants
    private static final int XP_PER_LEVEL = 500;
    private static final int XP_TASK_COMPLETE = 10;
    private static final int XP_COURSE_COMPLETE = 100;
    private static final int XP_FORUM_POST = 5;
    private static final int XP_DAILY_LOGIN = 5;

    /**
     * Get or create user gamification profile
     */
    public UserGamification getUserGamification(String userId) {
        try {
            System.out.println("[GAMIFICATION SERVICE] Getting gamification for userId: " + userId);
            
            // Handle potential duplicates
            List<UserGamification> allRecords = userGamificationRepository.findAllByUserId(userId);
            
            if (allRecords.isEmpty()) {
                System.out.println("[GAMIFICATION SERVICE] No record found, creating new one for userId: " + userId);
                return createUserGamification(userId);
            } else if (allRecords.size() > 1) {
                System.err.println("[GAMIFICATION SERVICE WARNING] Found " + allRecords.size() + " duplicate records for userId: " + userId);
                System.err.println("[GAMIFICATION SERVICE] Cleaning up duplicates, keeping the latest record");
                
                // Sort by creation date/XP and keep the best one
                UserGamification bestRecord = allRecords.stream()
                    .sorted((a, b) -> Integer.compare(b.getXp(), a.getXp())) // Keep record with most XP
                    .findFirst()
                    .get();
                
                // Delete other duplicates
                for (UserGamification record : allRecords) {
                    if (!record.getId().equals(bestRecord.getId())) {
                        System.err.println("[GAMIFICATION SERVICE] Deleting duplicate record: " + record.getId());
                        userGamificationRepository.delete(record);
                    }
                }
                
                return bestRecord;
            } else {
                return allRecords.get(0);
            }
        } catch (Exception e) {
            System.err.println("[GAMIFICATION SERVICE ERROR] Failed to get gamification for userId: " + userId);
            e.printStackTrace();
            throw new RuntimeException("Failed to get user gamification: " + e.getMessage(), e);
        }
    }

    /**
     * Create new gamification profile for user
     */
    private UserGamification createUserGamification(String userId) {
        try {
            System.out.println("[GAMIFICATION SERVICE] Creating new gamification profile for userId: " + userId);
            UserGamification gamification = new UserGamification();
            gamification.setUserId(userId);
            gamification.setXp(0);
            gamification.setLevel(1);
            gamification.setCurrentStreak(0);
            gamification.setLastActivityDate(LocalDate.now());
            gamification.setTotalStudyHours(0);
            gamification.setEarnedBadges(new ArrayList<>());
            gamification.setQuestProgress(new HashMap<>());
            gamification.setPurchasedRewards(new ArrayList<>());
            gamification.setStatistics(new HashMap<>());
            UserGamification saved = userGamificationRepository.save(gamification);
            System.out.println("[GAMIFICATION SERVICE] Successfully created gamification profile for userId: " + userId);
            return saved;
        } catch (Exception e) {
            System.err.println("[GAMIFICATION SERVICE ERROR] Failed to create gamification for userId: " + userId);
            e.printStackTrace();
            throw new RuntimeException("Failed to create user gamification: " + e.getMessage(), e);
        }
    }

    /**
     * Add XP to user and handle level ups
     */
    public Map<String, Object> addXP(String userId, int xp, String reason) {
        UserGamification gamification = getUserGamification(userId);
        
        int oldLevel = gamification.getLevel();
        int oldXP = gamification.getXp();
        
        gamification.setXp(oldXP + xp);
        gamification.setUpdatedAt(LocalDateTime.now());
        
        // Calculate new level
        int newLevel = calculateLevel(gamification.getXp());
        boolean leveledUp = newLevel > oldLevel;
        
        if (leveledUp) {
            gamification.setLevel(newLevel);
        }
        
        userGamificationRepository.save(gamification);
        
        // Check for badge achievements
        checkAndAwardBadges(userId, gamification);
        
        Map<String, Object> result = new HashMap<>();
        result.put("xpGained", xp);
        result.put("totalXP", gamification.getXp());
        result.put("oldLevel", oldLevel);
        result.put("newLevel", newLevel);
        result.put("leveledUp", leveledUp);
        result.put("reason", reason);
        result.put("xpToNextLevel", getXPToNextLevel(gamification.getXp()));
        
        return result;
    }

    /**
     * Calculate level from XP
     */
    private int calculateLevel(int xp) {
        return (xp / XP_PER_LEVEL) + 1;
    }

    /**
     * Get XP needed to reach next level
     */
    private int getXPToNextLevel(int currentXP) {
        int currentLevel = calculateLevel(currentXP);
        int nextLevelXP = currentLevel * XP_PER_LEVEL;
        return nextLevelXP - currentXP;
    }

    /**
     * Update daily streak
     */
    public Map<String, Object> updateStreak(String userId) {
        UserGamification gamification = getUserGamification(userId);
        LocalDate today = LocalDate.now();
        LocalDate lastActivity = gamification.getLastActivityDate();
        
        int streakBonus = 0;
        
        if (lastActivity == null) {
            // First activity
            gamification.setCurrentStreak(1);
            gamification.setLastActivityDate(today);
        } else if (lastActivity.equals(today)) {
            // Already logged in today, no change
            return createStreakResponse(gamification, streakBonus, false);
        } else if (lastActivity.equals(today.minusDays(1))) {
            // Consecutive day
            gamification.setCurrentStreak(gamification.getCurrentStreak() + 1);
            gamification.setLastActivityDate(today);
            
            // Award bonus XP for streak milestones
            if (gamification.getCurrentStreak() % 7 == 0) {
                streakBonus = 50; // Weekly streak bonus
            } else if (gamification.getCurrentStreak() % 30 == 0) {
                streakBonus = 200; // Monthly streak bonus
            }
        } else {
            // Streak broken
            gamification.setCurrentStreak(1);
            gamification.setLastActivityDate(today);
        }
        
        gamification.setUpdatedAt(LocalDateTime.now());
        userGamificationRepository.save(gamification);
        
        if (streakBonus > 0) {
            addXP(userId, streakBonus, "Streak milestone bonus");
        }
        
        return createStreakResponse(gamification, streakBonus, true);
    }

    private Map<String, Object> createStreakResponse(UserGamification gamification, int bonusXP, boolean updated) {
        Map<String, Object> result = new HashMap<>();
        result.put("currentStreak", gamification.getCurrentStreak());
        result.put("bonusXP", bonusXP);
        result.put("updated", updated);
        result.put("lastActivityDate", gamification.getLastActivityDate());
        return result;
    }

    /**
     * Get leaderboard
     */
    public List<Map<String, Object>> getLeaderboard(int limit) {
        List<UserGamification> topUsers = userGamificationRepository.findAllByOrderByXpDesc()
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
        
        List<Map<String, Object>> leaderboard = new ArrayList<>();
        
        for (int i = 0; i < topUsers.size(); i++) {
            UserGamification userGam = topUsers.get(i);
            Optional<User> userOpt = userRepository.findById(userGam.getUserId());
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> entry = new HashMap<>();
                entry.put("rank", i + 1);
                entry.put("userId", user.getId());
                entry.put("name", user.getFirstName() + " " + user.getLastName());
                entry.put("email", user.getEmail());
                entry.put("level", userGam.getLevel());
                entry.put("xp", userGam.getXp());
                entry.put("badges", userGam.getEarnedBadges().size());
                entry.put("streak", userGam.getCurrentStreak());
                entry.put("hoursStudied", userGam.getTotalStudyHours());
                
                leaderboard.add(entry);
            }
        }
        
        return leaderboard;
    }

    /**
     * Get user rank
     */
    public Map<String, Object> getUserRank(String userId) {
        UserGamification userGam = getUserGamification(userId);
        List<UserGamification> allUsers = userGamificationRepository.findAllByOrderByXpDesc();
        
        int rank = 0;
        for (int i = 0; i < allUsers.size(); i++) {
            if (allUsers.get(i).getUserId().equals(userId)) {
                rank = i + 1;
                break;
            }
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        String userName = "Unknown User";
        String email = "";
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String firstName = user.getFirstName() != null ? user.getFirstName() : "";
            String lastName = user.getLastName() != null ? user.getLastName() : "";
            userName = (firstName + " " + lastName).trim();
            if (userName.isEmpty()) {
                userName = user.getUsername() != null ? user.getUsername() : "Unknown User";
            }
            email = user.getEmail() != null ? user.getEmail() : "";
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("rank", rank > 0 ? rank : "Unranked");
        result.put("totalUsers", allUsers.size());
        result.put("userId", userId);
        result.put("name", userName);
        result.put("email", email);
        result.put("level", userGam.getLevel());
        result.put("xp", userGam.getXp());
        result.put("xpToNextLevel", getXPToNextLevel(userGam.getXp()));
        result.put("badges", userGam.getEarnedBadges() != null ? userGam.getEarnedBadges().size() : 0);
        result.put("streak", userGam.getCurrentStreak());
        result.put("hoursStudied", userGam.getTotalStudyHours());
        
        return result;
    }

    /**
     * Get all badges with user progress
     */
    public List<Map<String, Object>> getAllBadgesWithProgress(String userId) {
        UserGamification gamification = getUserGamification(userId);
        List<Badge> allBadges = badgeRepository.findByIsActiveTrue();
        
        Set<String> earnedBadgeIds = gamification.getEarnedBadges().stream()
                .map(UserGamification.EarnedBadge::getBadgeId)
                .collect(Collectors.toSet());
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Badge badge : allBadges) {
            Map<String, Object> badgeData = new HashMap<>();
            badgeData.put("id", badge.getId());
            badgeData.put("name", badge.getName());
            badgeData.put("description", badge.getDescription());
            badgeData.put("icon", badge.getIcon() != null ? badge.getIcon() : badge.getIconUrl());
            badgeData.put("color", badge.getColor());
            badgeData.put("rarity", badge.getRarity());
            badgeData.put("category", badge.getCategory());
            badgeData.put("xpReward", badge.getXpReward() > 0 ? badge.getXpReward() : badge.getPoints());
            badgeData.put("requirements", badge.getRequirements() != null ? badge.getRequirements() : badge.getCriteriaDescription());
            badgeData.put("isEarned", earnedBadgeIds.contains(badge.getId()));
            
            // Get progress
            int progress = calculateBadgeProgress(userId, badge, gamification);
            badgeData.put("progress", progress);
            badgeData.put("maxProgress", badge.getCriteriaValue());
            
            // Find earned date if earned
            gamification.getEarnedBadges().stream()
                    .filter(eb -> eb.getBadgeId().equals(badge.getId()))
                    .findFirst()
                    .ifPresent(eb -> badgeData.put("earnedDate", eb.getEarnedDate()));
            
            result.add(badgeData);
        }
        
        return result;
    }

    /**
     * Calculate badge progress for user
     */
    private int calculateBadgeProgress(String userId, Badge badge, UserGamification gamification) {
        if (gamification.getStatistics() == null) {
            return 0;
        }
        
        String trackingField = badge.getTrackingField() != null ? badge.getTrackingField() : badge.getCriteriaType();
        
        if (trackingField == null) {
            return 0;
        }
        
        return gamification.getStatistics().getOrDefault(trackingField, 0);
    }

    /**
     * Check and award badges based on user progress
     */
    private void checkAndAwardBadges(String userId, UserGamification gamification) {
        List<Badge> allBadges = badgeRepository.findByIsActiveTrue();
        Set<String> earnedBadgeIds = gamification.getEarnedBadges().stream()
                .map(UserGamification.EarnedBadge::getBadgeId)
                .collect(Collectors.toSet());
        
        for (Badge badge : allBadges) {
            if (!earnedBadgeIds.contains(badge.getId())) {
                int progress = calculateBadgeProgress(userId, badge, gamification);
                
                if (progress >= badge.getCriteriaValue()) {
                    // Award badge
                    UserGamification.EarnedBadge earnedBadge = new UserGamification.EarnedBadge(
                            badge.getId(),
                            LocalDateTime.now()
                    );
                    gamification.getEarnedBadges().add(earnedBadge);
                    
                    // Award badge XP
                    int badgeXP = badge.getXpReward() > 0 ? badge.getXpReward() : badge.getPoints();
                    gamification.setXp(gamification.getXp() + badgeXP);
                    
                    userGamificationRepository.save(gamification);
                }
            }
        }
    }

    /**
     * Get active quests for user
     */
    public List<Map<String, Object>> getActiveQuests(String userId) {
        UserGamification gamification = getUserGamification(userId);
        List<Quest> allQuests = questRepository.findByIsActiveTrue();
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Quest quest : allQuests) {
            Map<String, Object> questData = new HashMap<>();
            questData.put("id", quest.getId());
            questData.put("title", quest.getTitle());
            questData.put("description", quest.getDescription());
            questData.put("type", quest.getType());
            questData.put("category", quest.getCategory());
            questData.put("maxProgress", quest.getMaxProgress());
            questData.put("xpReward", quest.getXpReward());
            questData.put("difficulty", quest.getDifficulty());
            questData.put("deadline", quest.getDeadline());
            
            // Get user progress
            UserGamification.QuestProgress progress = gamification.getQuestProgress().get(quest.getId());
            if (progress != null) {
                questData.put("progress", progress.getProgress());
                questData.put("isCompleted", progress.isCompleted());
                questData.put("completedDate", progress.getCompletedDate());
            } else {
                questData.put("progress", 0);
                questData.put("isCompleted", false);
            }
            
            result.add(questData);
        }
        
        return result;
    }

    /**
     * Update quest progress
     */
    public Map<String, Object> updateQuestProgress(String userId, String questId, int increment) {
        UserGamification gamification = getUserGamification(userId);
        Optional<Quest> questOpt = questRepository.findById(questId);
        
        if (!questOpt.isPresent()) {
            throw new RuntimeException("Quest not found");
        }
        
        Quest quest = questOpt.get();
        UserGamification.QuestProgress progress = gamification.getQuestProgress().getOrDefault(
                questId,
                new UserGamification.QuestProgress(0, false)
        );
        
        int newProgress = Math.min(progress.getProgress() + increment, quest.getMaxProgress());
        progress.setProgress(newProgress);
        
        boolean justCompleted = false;
        
        if (newProgress >= quest.getMaxProgress() && !progress.isCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedDate(LocalDateTime.now());
            justCompleted = true;
            
            // Award quest XP
            addXP(userId, quest.getXpReward(), "Quest completed: " + quest.getTitle());
        }
        
        gamification.getQuestProgress().put(questId, progress);
        gamification.setUpdatedAt(LocalDateTime.now());
        userGamificationRepository.save(gamification);
        
        Map<String, Object> result = new HashMap<>();
        result.put("questId", questId);
        result.put("progress", progress.getProgress());
        result.put("maxProgress", quest.getMaxProgress());
        result.put("isCompleted", progress.isCompleted());
        result.put("justCompleted", justCompleted);
        
        return result;
    }

    /**
     * Get available rewards
     */
    public List<Map<String, Object>> getAvailableRewards(String userId) {
        UserGamification gamification = getUserGamification(userId);
        List<Reward> allRewards = rewardRepository.findByIsActiveTrue();
        
        Set<String> purchasedRewardIds = new HashSet<>(gamification.getPurchasedRewards());
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Reward reward : allRewards) {
            Map<String, Object> rewardData = new HashMap<>();
            rewardData.put("id", reward.getId());
            rewardData.put("name", reward.getName());
            rewardData.put("description", reward.getDescription());
            rewardData.put("type", reward.getType());
            rewardData.put("cost", reward.getCost());
            rewardData.put("icon", reward.getIcon());
            rewardData.put("isPurchased", purchasedRewardIds.contains(reward.getId()));
            rewardData.put("isUnlocked", gamification.getXp() >= reward.getCost());
            
            result.add(rewardData);
        }
        
        return result;
    }

    /**
     * Purchase reward
     */
    public Map<String, Object> purchaseReward(String userId, String rewardId) {
        UserGamification gamification = getUserGamification(userId);
        Optional<Reward> rewardOpt = rewardRepository.findById(rewardId);
        
        if (!rewardOpt.isPresent()) {
            throw new RuntimeException("Reward not found");
        }
        
        Reward reward = rewardOpt.get();
        
        // Check if already purchased
        if (gamification.getPurchasedRewards().contains(rewardId)) {
            throw new RuntimeException("Reward already purchased");
        }
        
        // Check if user has enough XP
        if (gamification.getXp() < reward.getCost()) {
            throw new RuntimeException("Not enough XP");
        }
        
        // Deduct XP and add reward
        gamification.setXp(gamification.getXp() - reward.getCost());
        gamification.getPurchasedRewards().add(rewardId);
        gamification.setUpdatedAt(LocalDateTime.now());
        userGamificationRepository.save(gamification);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("rewardId", rewardId);
        result.put("rewardName", reward.getName());
        result.put("costPaid", reward.getCost());
        result.put("remainingXP", gamification.getXp());
        
        return result;
    }

    /**
     * Update user statistics (for badge tracking)
     */
    public void updateStatistic(String userId, String statisticName, int value) {
        UserGamification gamification = getUserGamification(userId);
        
        if (gamification.getStatistics() == null) {
            gamification.setStatistics(new HashMap<>());
        }
        
        gamification.getStatistics().put(statisticName, value);
        gamification.setUpdatedAt(LocalDateTime.now());
        userGamificationRepository.save(gamification);
        
        // Check for badge achievements
        checkAndAwardBadges(userId, gamification);
    }

    /**
     * Increment user statistic
     */
    public void incrementStatistic(String userId, String statisticName, int increment) {
        UserGamification gamification = getUserGamification(userId);
        
        if (gamification.getStatistics() == null) {
            gamification.setStatistics(new HashMap<>());
        }
        
        int currentValue = gamification.getStatistics().getOrDefault(statisticName, 0);
        gamification.getStatistics().put(statisticName, currentValue + increment);
        gamification.setUpdatedAt(LocalDateTime.now());
        userGamificationRepository.save(gamification);
        
        // Check for badge achievements
        checkAndAwardBadges(userId, gamification);
    }

    /**
     * Initialize default badges
     */
    public void initializeDefaultBadges() {
        if (badgeRepository.count() > 0) {
            return; // Already initialized
        }
        
        List<Badge> defaultBadges = new ArrayList<>();
        
        // First Course Badge
        Badge firstCourse = new Badge();
        firstCourse.setName("First Steps");
        firstCourse.setDescription("Complete your first course");
        firstCourse.setIcon("school");
        firstCourse.setColor("#4CAF50");
        firstCourse.setRarity("bronze");
        firstCourse.setCategory("ACHIEVEMENT");
        firstCourse.setCriteriaType("coursesCompleted");
        firstCourse.setCriteriaValue(1);
        firstCourse.setTrackingField("coursesCompleted");
        firstCourse.setXpReward(50);
        firstCourse.setRequirements("Complete 1 course");
        defaultBadges.add(firstCourse);
        
        // 7-Day Streak Badge
        Badge weekStreak = new Badge();
        weekStreak.setName("Week Warrior");
        weekStreak.setDescription("Maintain a 7-day learning streak");
        weekStreak.setIcon("local_fire_department");
        weekStreak.setColor("#FF5722");
        weekStreak.setRarity("silver");
        weekStreak.setCategory("PARTICIPATION");
        weekStreak.setCriteriaType("streak");
        weekStreak.setCriteriaValue(7);
        weekStreak.setTrackingField("maxStreak");
        weekStreak.setXpReward(100);
        weekStreak.setRequirements("Maintain a 7-day streak");
        defaultBadges.add(weekStreak);
        
        // 10 Forum Posts Badge
        Badge socialBadge = new Badge();
        socialBadge.setName("Community Helper");
        socialBadge.setDescription("Make 10 forum posts");
        socialBadge.setIcon("forum");
        socialBadge.setColor("#2196F3");
        socialBadge.setRarity("bronze");
        socialBadge.setCategory("PARTICIPATION");
        socialBadge.setCriteriaType("forumPosts");
        socialBadge.setCriteriaValue(10);
        socialBadge.setTrackingField("forumPosts");
        socialBadge.setXpReward(75);
        socialBadge.setRequirements("Create 10 forum posts");
        defaultBadges.add(socialBadge);
        
        badgeRepository.saveAll(defaultBadges);
    }

    /**
     * Initialize default quests
     */
    public void initializeDefaultQuests() {
        if (questRepository.count() > 0) {
            return;
        }
        
        List<Quest> defaultQuests = new ArrayList<>();
        
        // Daily quest
        Quest dailyLogin = new Quest();
        dailyLogin.setTitle("Daily Login");
        dailyLogin.setDescription("Log in to the platform today");
        dailyLogin.setType("daily");
        dailyLogin.setCategory("engagement");
        dailyLogin.setMaxProgress(1);
        dailyLogin.setXpReward(10);
        dailyLogin.setDifficulty("easy");
        dailyLogin.setTrackingField("dailyLogin");
        dailyLogin.setDeadline(LocalDateTime.now().plusDays(1));
        defaultQuests.add(dailyLogin);
        
        // Weekly quest
        Quest weeklyTasks = new Quest();
        weeklyTasks.setTitle("Weekly Warrior");
        weeklyTasks.setDescription("Complete 10 tasks this week");
        weeklyTasks.setType("weekly");
        weeklyTasks.setCategory("progress");
        weeklyTasks.setMaxProgress(10);
        weeklyTasks.setXpReward(100);
        weeklyTasks.setDifficulty("medium");
        weeklyTasks.setTrackingField("weeklyTasks");
        weeklyTasks.setDeadline(LocalDateTime.now().plusWeeks(1));
        defaultQuests.add(weeklyTasks);
        
        questRepository.saveAll(defaultQuests);
    }

    /**
     * Initialize default rewards
     */
    public void initializeDefaultRewards() {
        if (rewardRepository.count() > 0) {
            return;
        }
        
        List<Reward> defaultRewards = new ArrayList<>();
        
        // XP Boost
        Reward xpBoost = new Reward();
        xpBoost.setName("2x XP Boost (1 day)");
        xpBoost.setDescription("Double XP gains for 24 hours");
        xpBoost.setType("xp_boost");
        xpBoost.setCost(500);
        xpBoost.setIcon("bolt");
        xpBoost.setRewardValue("2x_24h");
        defaultRewards.add(xpBoost);
        
        // Theme
        Reward darkTheme = new Reward();
        darkTheme.setName("Dark Theme");
        darkTheme.setDescription("Unlock the dark theme");
        darkTheme.setType("theme");
        darkTheme.setCost(1000);
        darkTheme.setIcon("palette");
        darkTheme.setRewardValue("dark_theme");
        defaultRewards.add(darkTheme);
        
        rewardRepository.saveAll(defaultRewards);
    }
}
