package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * UserGamification Model - stores user's gamification progress
 */
@Document(collection = "user_gamification")
public class UserGamification {
    
    @Id
    private String id;
    private String userId;
    private int xp; // Total experience points
    private int level;
    private List<EarnedBadge> earnedBadges;
    private Map<String, QuestProgress> questProgress; // questId -> progress
    private List<String> purchasedRewards; // Reward IDs
    private int currentStreak;
    private LocalDate lastActivityDate;
    private int totalStudyHours;
    private Map<String, Integer> statistics; // Track various stats
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserGamification() {
        this.earnedBadges = new ArrayList<>();
        this.questProgress = new HashMap<>();
        this.purchasedRewards = new ArrayList<>();
        this.statistics = new HashMap<>();
        this.xp = 0;
        this.level = 1;
        this.currentStreak = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Nested class for earned badges
    public static class EarnedBadge {
        private String badgeId;
        private LocalDateTime earnedDate;

        public EarnedBadge() {}

        public EarnedBadge(String badgeId, LocalDateTime earnedDate) {
            this.badgeId = badgeId;
            this.earnedDate = earnedDate;
        }

        public String getBadgeId() {
            return badgeId;
        }

        public void setBadgeId(String badgeId) {
            this.badgeId = badgeId;
        }

        public LocalDateTime getEarnedDate() {
            return earnedDate;
        }

        public void setEarnedDate(LocalDateTime earnedDate) {
            this.earnedDate = earnedDate;
        }
    }

    // Nested class for quest progress
    public static class QuestProgress {
        private int progress;
        private boolean isCompleted;
        private LocalDateTime completedDate;

        public QuestProgress() {}

        public QuestProgress(int progress, boolean isCompleted) {
            this.progress = progress;
            this.isCompleted = isCompleted;
        }

        public int getProgress() {
            return progress;
        }

        public void setProgress(int progress) {
            this.progress = progress;
        }

        public boolean isCompleted() {
            return isCompleted;
        }

        public void setCompleted(boolean completed) {
            isCompleted = completed;
        }

        public LocalDateTime getCompletedDate() {
            return completedDate;
        }

        public void setCompletedDate(LocalDateTime completedDate) {
            this.completedDate = completedDate;
        }
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public List<EarnedBadge> getEarnedBadges() {
        return earnedBadges;
    }

    public void setEarnedBadges(List<EarnedBadge> earnedBadges) {
        this.earnedBadges = earnedBadges;
    }

    public Map<String, QuestProgress> getQuestProgress() {
        return questProgress;
    }

    public void setQuestProgress(Map<String, QuestProgress> questProgress) {
        this.questProgress = questProgress;
    }

    public List<String> getPurchasedRewards() {
        return purchasedRewards;
    }

    public void setPurchasedRewards(List<String> purchasedRewards) {
        this.purchasedRewards = purchasedRewards;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public LocalDate getLastActivityDate() {
        return lastActivityDate;
    }

    public void setLastActivityDate(LocalDate lastActivityDate) {
        this.lastActivityDate = lastActivityDate;
    }

    public int getTotalStudyHours() {
        return totalStudyHours;
    }

    public void setTotalStudyHours(int totalStudyHours) {
        this.totalStudyHours = totalStudyHours;
    }

    public Map<String, Integer> getStatistics() {
        return statistics;
    }

    public void setStatistics(Map<String, Integer> statistics) {
        this.statistics = statistics;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
