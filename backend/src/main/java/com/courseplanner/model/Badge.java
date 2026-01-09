package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "badges")
public class Badge {
    @Id
    private String id;
    
    private String name;
    private String description;
    private String iconUrl;
    private String icon; // Icon name for frontend
    private String category; // PROGRESS, ACHIEVEMENT, PARTICIPATION, SPECIAL
    
    // Badge criteria
    private String criteriaType; // COURSE_COMPLETION, QUIZ_SCORE, STREAK, FORUM_POSTS, etc.
    private int criteriaValue; // Required value to earn badge
    private String criteriaDescription;
    private String requirements; // Human-readable requirements
    private String trackingField; // What to track (e.g., "coursesCompleted", "studyHours")
    
    // Badge properties
    private String rarity; // bronze, silver, gold, platinum, diamond, legendary
    private int points; // Points awarded for earning this badge
    private int xpReward; // XP reward for earning badge
    private String color; // Badge color theme
    
    // Metadata
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public Badge() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
        this.points = 10; // Default points
    }

    // Constructor
    public Badge(String name, String description, String category, String criteriaType, int criteriaValue) {
        this();
        this.name = name;
        this.description = description;
        this.category = category;
        this.criteriaType = criteriaType;
        this.criteriaValue = criteriaValue;
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

    public String getIconUrl() {
        return iconUrl;
    }

    public void setIconUrl(String iconUrl) {
        this.iconUrl = iconUrl;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCriteriaType() {
        return criteriaType;
    }

    public void setCriteriaType(String criteriaType) {
        this.criteriaType = criteriaType;
    }

    public int getCriteriaValue() {
        return criteriaValue;
    }

    public void setCriteriaValue(int criteriaValue) {
        this.criteriaValue = criteriaValue;
    }

    public String getCriteriaDescription() {
        return criteriaDescription;
    }

    public void setCriteriaDescription(String criteriaDescription) {
        this.criteriaDescription = criteriaDescription;
    }

    public String getRarity() {
        return rarity;
    }

    public void setRarity(String rarity) {
        this.rarity = rarity;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
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

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getTrackingField() {
        return trackingField;
    }

    public void setTrackingField(String trackingField) {
        this.trackingField = trackingField;
    }

    public int getXpReward() {
        return xpReward;
    }

    public void setXpReward(int xpReward) {
        this.xpReward = xpReward;
    }
}