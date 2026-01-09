package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * AI Rule model for defining recommendation logic
 * Example: If Interest = AI && Goal = Job → recommend [Python, ML, Deep Learning] in order
 */
@Document(collection = "ai_rules")
public class AIRule {
    @Id
    private String id;
    
    private String name; // Rule name for admin reference
    private String description;
    
    // Condition
    private String interestId; // If user has this interest
    private String goalId; // AND this goal
    private String experienceLevel; // AND this experience level (optional)
    
    // Action
    private List<String> subjectIds; // Then recommend these subjects
    private List<Integer> subjectOrder; // In this order (roadmap sequence)
    
    // Rule configuration
    private int priority; // Higher priority rules are applied first
    private double weight; // Weight for recommendation scoring
    private boolean enabled;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy; // Admin user ID
    
    public AIRule() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.enabled = true;
        this.priority = 0;
        this.weight = 1.0;
        this.subjectIds = new ArrayList<>();
        this.subjectOrder = new ArrayList<>();
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
    
    public String getInterestId() {
        return interestId;
    }
    
    public void setInterestId(String interestId) {
        this.interestId = interestId;
    }
    
    public String getGoalId() {
        return goalId;
    }
    
    public void setGoalId(String goalId) {
        this.goalId = goalId;
    }
    
    public String getExperienceLevel() {
        return experienceLevel;
    }
    
    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }
    
    public List<String> getSubjectIds() {
        return subjectIds;
    }
    
    public void setSubjectIds(List<String> subjectIds) {
        this.subjectIds = subjectIds;
    }
    
    public List<Integer> getSubjectOrder() {
        return subjectOrder;
    }
    
    public void setSubjectOrder(List<Integer> subjectOrder) {
        this.subjectOrder = subjectOrder;
    }
    
    public int getPriority() {
        return priority;
    }
    
    public void setPriority(int priority) {
        this.priority = priority;
    }
    
    public double getWeight() {
        return weight;
    }
    
    public void setWeight(double weight) {
        this.weight = weight;
    }
    
    public boolean isEnabled() {
        return enabled;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
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
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
