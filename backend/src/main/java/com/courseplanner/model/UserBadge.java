package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "user_badges")
public class UserBadge {
    @Id
    private String id;
    
    private String userId;
    private String badgeId;
    private String courseId; // Optional - if badge is course-specific
    
    private LocalDateTime earnedAt;
    private boolean isDisplayed; // Whether user chose to display this badge
    
    // Context for earning the badge
    private String earnedFor; // Description of what earned this badge
    private String relatedEntityId; // ID of course/quiz/post that triggered the badge

    // Default constructor
    public UserBadge() {
        this.earnedAt = LocalDateTime.now();
        this.isDisplayed = true;
    }

    // Constructor
    public UserBadge(String userId, String badgeId) {
        this();
        this.userId = userId;
        this.badgeId = badgeId;
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

    public String getBadgeId() {
        return badgeId;
    }

    public void setBadgeId(String badgeId) {
        this.badgeId = badgeId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public LocalDateTime getEarnedAt() {
        return earnedAt;
    }

    public void setEarnedAt(LocalDateTime earnedAt) {
        this.earnedAt = earnedAt;
    }

    public boolean isDisplayed() {
        return isDisplayed;
    }

    public void setDisplayed(boolean displayed) {
        isDisplayed = displayed;
    }

    public String getEarnedFor() {
        return earnedFor;
    }

    public void setEarnedFor(String earnedFor) {
        this.earnedFor = earnedFor;
    }

    public String getRelatedEntityId() {
        return relatedEntityId;
    }

    public void setRelatedEntityId(String relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
    }
}