package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Quest Model - represents challenges users can complete
 */
@Document(collection = "quests")
public class Quest {
    
    @Id
    private String id;
    private String title;
    private String description;
    private String type; // daily, weekly, monthly, special
    private String category;
    private int maxProgress;
    private int xpReward;
    private String badgeReward; // Badge ID if applicable
    private LocalDateTime deadline;
    private boolean isActive;
    private String difficulty; // easy, medium, hard, epic
    private String trackingField; // What action to track
    private LocalDateTime createdAt;

    public Quest() {
        this.createdAt = LocalDateTime.now();
        this.isActive = true;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getMaxProgress() {
        return maxProgress;
    }

    public void setMaxProgress(int maxProgress) {
        this.maxProgress = maxProgress;
    }

    public int getXpReward() {
        return xpReward;
    }

    public void setXpReward(int xpReward) {
        this.xpReward = xpReward;
    }

    public String getBadgeReward() {
        return badgeReward;
    }

    public void setBadgeReward(String badgeReward) {
        this.badgeReward = badgeReward;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getTrackingField() {
        return trackingField;
    }

    public void setTrackingField(String trackingField) {
        this.trackingField = trackingField;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
