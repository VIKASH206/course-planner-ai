package com.courseplanner.dto;

public class ProgressUpdateRequest {
    private String userId;
    private String courseId;
    private String moduleId;
    private String topicId;
    private int progressPercentage;
    private int timeSpentMinutes;
    private boolean isCompleted;
    private String notes;

    // Default constructor
    public ProgressUpdateRequest() {}

    // Constructor
    public ProgressUpdateRequest(String userId, String courseId, int progressPercentage) {
        this.userId = userId;
        this.courseId = courseId;
        this.progressPercentage = progressPercentage;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public int getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }

    public int getTimeSpentMinutes() { return timeSpentMinutes; }
    public void setTimeSpentMinutes(int timeSpentMinutes) { this.timeSpentMinutes = timeSpentMinutes; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}