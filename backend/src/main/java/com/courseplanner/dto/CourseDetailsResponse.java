package com.courseplanner.dto;

import java.util.List;

public class CourseDetailsResponse {
    private String courseId;
    private String title;
    private String description;
    private int progressPercentage;
    private String currentModuleId;
    private String currentTopicId;
    private List<ModuleProgress> modules;
    private CourseStats stats;
    private List<String> recommendations;

    // Default constructor
    public CourseDetailsResponse() {}

    // Constructor
    public CourseDetailsResponse(String courseId, String title, String description) {
        this.courseId = courseId;
        this.title = title;
        this.description = description;
    }

    // Inner classes for nested data
    public static class ModuleProgress {
        private String moduleId;
        private String title;
        private int progressPercentage;
        private boolean isCompleted;
        private boolean isLocked;
        private int totalTopics;
        private int completedTopics;

        // Constructors, getters, and setters
        public ModuleProgress() {}

        public ModuleProgress(String moduleId, String title) {
            this.moduleId = moduleId;
            this.title = title;
        }

        public String getModuleId() { return moduleId; }
        public void setModuleId(String moduleId) { this.moduleId = moduleId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public int getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }

        public boolean isCompleted() { return isCompleted; }
        public void setCompleted(boolean completed) { isCompleted = completed; }

        public boolean isLocked() { return isLocked; }
        public void setLocked(boolean locked) { isLocked = locked; }

        public int getTotalTopics() { return totalTopics; }
        public void setTotalTopics(int totalTopics) { this.totalTopics = totalTopics; }

        public int getCompletedTopics() { return completedTopics; }
        public void setCompletedTopics(int completedTopics) { this.completedTopics = completedTopics; }
    }

    public static class CourseStats {
        private int totalModules;
        private int completedModules;
        private int totalTopics;
        private int completedTopics;
        private int totalTimeSpent; // in minutes
        private int totalQuizzes;
        private int completedQuizzes;
        private double averageQuizScore;

        // Constructors, getters, and setters
        public CourseStats() {}

        public int getTotalModules() { return totalModules; }
        public void setTotalModules(int totalModules) { this.totalModules = totalModules; }

        public int getCompletedModules() { return completedModules; }
        public void setCompletedModules(int completedModules) { this.completedModules = completedModules; }

        public int getTotalTopics() { return totalTopics; }
        public void setTotalTopics(int totalTopics) { this.totalTopics = totalTopics; }

        public int getCompletedTopics() { return completedTopics; }
        public void setCompletedTopics(int completedTopics) { this.completedTopics = completedTopics; }

        public int getTotalTimeSpent() { return totalTimeSpent; }
        public void setTotalTimeSpent(int totalTimeSpent) { this.totalTimeSpent = totalTimeSpent; }

        public int getTotalQuizzes() { return totalQuizzes; }
        public void setTotalQuizzes(int totalQuizzes) { this.totalQuizzes = totalQuizzes; }

        public int getCompletedQuizzes() { return completedQuizzes; }
        public void setCompletedQuizzes(int completedQuizzes) { this.completedQuizzes = completedQuizzes; }

        public double getAverageQuizScore() { return averageQuizScore; }
        public void setAverageQuizScore(double averageQuizScore) { this.averageQuizScore = averageQuizScore; }
    }

    // Getters and Setters
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }

    public String getCurrentModuleId() { return currentModuleId; }
    public void setCurrentModuleId(String currentModuleId) { this.currentModuleId = currentModuleId; }

    public String getCurrentTopicId() { return currentTopicId; }
    public void setCurrentTopicId(String currentTopicId) { this.currentTopicId = currentTopicId; }

    public List<ModuleProgress> getModules() { return modules; }
    public void setModules(List<ModuleProgress> modules) { this.modules = modules; }

    public CourseStats getStats() { return stats; }
    public void setStats(CourseStats stats) { this.stats = stats; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
}