package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * Subject model for course topics (Python, ML, Angular, etc.)
 */
@Document(collection = "subjects")
public class Subject {
    @Id
    private String id;
    
    @Indexed
    private String name; // e.g., "Python", "Machine Learning", "Angular"
    
    private String description;
    private String interestId; // Related interest
    private String goalId; // Related goal
    private String difficultyLevel; // "Beginner", "Intermediate", "Advanced"
    private int durationWeeks; // Estimated duration in weeks
    private List<String> prerequisites; // Subject IDs that should be completed first
    private int roadmapOrder; // Order in learning roadmap
    private String thumbnailUrl;
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy; // Admin user ID
    
    // Additional metadata
    private String instructor;
    private int estimatedHours;
    private List<String> tags;
    
    public Subject() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.enabled = true;
        this.roadmapOrder = 0;
        this.prerequisites = new ArrayList<>();
        this.tags = new ArrayList<>();
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
    
    public String getDifficultyLevel() {
        return difficultyLevel;
    }
    
    public void setDifficultyLevel(String difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }
    
    public int getDurationWeeks() {
        return durationWeeks;
    }
    
    public void setDurationWeeks(int durationWeeks) {
        this.durationWeeks = durationWeeks;
    }
    
    public List<String> getPrerequisites() {
        return prerequisites;
    }
    
    public void setPrerequisites(List<String> prerequisites) {
        this.prerequisites = prerequisites;
    }
    
    public int getRoadmapOrder() {
        return roadmapOrder;
    }
    
    public void setRoadmapOrder(int roadmapOrder) {
        this.roadmapOrder = roadmapOrder;
    }
    
    public String getThumbnailUrl() {
        return thumbnailUrl;
    }
    
    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
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
    
    public String getInstructor() {
        return instructor;
    }
    
    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }
    
    public int getEstimatedHours() {
        return estimatedHours;
    }
    
    public void setEstimatedHours(int estimatedHours) {
        this.estimatedHours = estimatedHours;
    }
    
    public List<String> getTags() {
        return tags;
    }
    
    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
