package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Reward Model - represents items users can purchase with points/XP
 */
@Document(collection = "rewards")
public class Reward {
    
    @Id
    private String id;
    private String name;
    private String description;
    private String type; // xp_boost, badge, theme, avatar, feature_unlock
    private int cost; // XP cost to purchase
    private String icon;
    private boolean isActive;
    private int limitPerUser; // -1 for unlimited
    private LocalDateTime createdAt;
    private String rewardValue; // e.g., theme name, avatar URL, feature ID

    public Reward() {
        this.createdAt = LocalDateTime.now();
        this.isActive = true;
        this.limitPerUser = -1; // Unlimited by default
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public int getCost() {
        return cost;
    }

    public void setCost(int cost) {
        this.cost = cost;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public int getLimitPerUser() {
        return limitPerUser;
    }

    public void setLimitPerUser(int limitPerUser) {
        this.limitPerUser = limitPerUser;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getRewardValue() {
        return rewardValue;
    }

    public void setRewardValue(String rewardValue) {
        this.rewardValue = rewardValue;
    }
}
