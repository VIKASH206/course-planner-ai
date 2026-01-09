package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

/**
 * AI Recommendation Log model to track when AI recommendations are generated
 * Used for analytics and dashboard statistics
 */
@Document(collection = "ai_recommendation_logs")
public class AIRecommendationLog {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    private String username;
    
    @Indexed
    private LocalDateTime createdAt;
    
    private int recommendationCount; // Number of recommendations generated in this event
    
    private String recommendationType; // "INITIAL", "REFRESH", "MANUAL", etc.
    
    private String interest; // User's selected interest
    
    private String status; // "Success" or "Coming Soon"
    
    // Default constructor
    public AIRecommendationLog() {
        this.createdAt = LocalDateTime.now();
        this.recommendationCount = 0;
    }
    
    // Constructor with userId
    public AIRecommendationLog(String userId, String username, int recommendationCount) {
        this();
        this.userId = userId;
        this.username = username;
        this.recommendationCount = recommendationCount;
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
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public int getRecommendationCount() {
        return recommendationCount;
    }
    
    public void setRecommendationCount(int recommendationCount) {
        this.recommendationCount = recommendationCount;
    }
    
    public String getRecommendationType() {
        return recommendationType;
    }
    
    public void setRecommendationType(String recommendationType) {
        this.recommendationType = recommendationType;
    }
    
    public String getInterest() {
        return interest;
    }
    
    public void setInterest(String interest) {
        this.interest = interest;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}
