package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "user_progress")
public class UserProgress {
    @Id
    private String id;
    
    private String userId;
    private String courseId;
    private String moduleId;
    private String topicId;
    
    // Progress tracking
    private int progressPercentage; // 0-100
    private boolean isCompleted;
    private boolean isBookmarked;
    
    // Time tracking
    private int timeSpentMinutes;
    private LocalDateTime lastAccessedAt;
    private LocalDateTime completedAt;
    
    // AI personalization data
    private String learningStyle; // VISUAL, AUDITORY, KINESTHETIC, READING
    private String difficultyPreference; // EASY, MODERATE, CHALLENGING
    private double confidenceLevel; // 0.0 to 1.0
    private int retryCount; // Number of times user revisited this content
    
    // Performance metrics
    private double comprehensionScore; // AI-calculated based on quiz performance
    private String strongAreas; // Areas where user excels
    private String weakAreas; // Areas needing improvement
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public UserProgress() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.progressPercentage = 0;
        this.isCompleted = false;
        this.isBookmarked = false;
        this.timeSpentMinutes = 0;
        this.confidenceLevel = 0.0;
        this.retryCount = 0;
        this.comprehensionScore = 0.0;
    }

    // Constructor
    public UserProgress(String userId, String courseId) {
        this();
        this.userId = userId;
        this.courseId = courseId;
    }

    // Constructor with module
    public UserProgress(String userId, String courseId, String moduleId) {
        this(userId, courseId);
        this.moduleId = moduleId;
    }

    // Constructor with topic
    public UserProgress(String userId, String courseId, String moduleId, String topicId) {
        this(userId, courseId, moduleId);
        this.topicId = topicId;
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

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getModuleId() {
        return moduleId;
    }

    public void setModuleId(String moduleId) {
        this.moduleId = moduleId;
    }

    public String getTopicId() {
        return topicId;
    }

    public void setTopicId(String topicId) {
        this.topicId = topicId;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = progressPercentage;
        this.updatedAt = LocalDateTime.now();
        
        if (progressPercentage >= 100 && !this.isCompleted) {
            this.isCompleted = true;
            this.completedAt = LocalDateTime.now();
        }
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
        if (completed) {
            this.completedAt = LocalDateTime.now();
            this.progressPercentage = 100;
        }
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isBookmarked() {
        return isBookmarked;
    }

    public void setBookmarked(boolean bookmarked) {
        isBookmarked = bookmarked;
        this.updatedAt = LocalDateTime.now();
    }

    public int getTimeSpentMinutes() {
        return timeSpentMinutes;
    }

    public void setTimeSpentMinutes(int timeSpentMinutes) {
        this.timeSpentMinutes = timeSpentMinutes;
    }

    public void addTimeSpent(int minutes) {
        this.timeSpentMinutes += minutes;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getLastAccessedAt() {
        return lastAccessedAt;
    }

    public void setLastAccessedAt(LocalDateTime lastAccessedAt) {
        this.lastAccessedAt = lastAccessedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getLearningStyle() {
        return learningStyle;
    }

    public void setLearningStyle(String learningStyle) {
        this.learningStyle = learningStyle;
    }

    public String getDifficultyPreference() {
        return difficultyPreference;
    }

    public void setDifficultyPreference(String difficultyPreference) {
        this.difficultyPreference = difficultyPreference;
    }

    public double getConfidenceLevel() {
        return confidenceLevel;
    }

    public void setConfidenceLevel(double confidenceLevel) {
        this.confidenceLevel = confidenceLevel;
    }

    public int getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(int retryCount) {
        this.retryCount = retryCount;
    }

    public void incrementRetryCount() {
        this.retryCount++;
        this.updatedAt = LocalDateTime.now();
    }

    public double getComprehensionScore() {
        return comprehensionScore;
    }

    public void setComprehensionScore(double comprehensionScore) {
        this.comprehensionScore = comprehensionScore;
    }

    public String getStrongAreas() {
        return strongAreas;
    }

    public void setStrongAreas(String strongAreas) {
        this.strongAreas = strongAreas;
    }

    public String getWeakAreas() {
        return weakAreas;
    }

    public void setWeakAreas(String weakAreas) {
        this.weakAreas = weakAreas;
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