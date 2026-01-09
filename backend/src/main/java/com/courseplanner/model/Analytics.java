package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "learning_analytics")
public class Analytics {
    @Id
    private String id;
    
    private String userId;
    private LocalDateTime date;
    
    // Progress tracking
    private int completedTasksToday;
    private int totalTasksToday;
    private int studyTimeMinutes;
    private int coursesWorkedOn;
    
    // Performance metrics
    private double completionRate; // percentage
    private int streakDays;
    private int pointsEarned;
    
    // Weak and strong areas
    private Map<String, Integer> categoryProgress; // category -> completion count
    private Map<String, Double> subjectScores; // subject -> average score
    
    // Weekly/Monthly aggregates
    private int weeklyCompletedTasks;
    private int monthlyCompletedTasks;
    private int weeklyStudyTime;
    private int monthlyStudyTime;

    // Default constructor
    public Analytics() {
        this.date = LocalDateTime.now();
        this.completionRate = 0.0;
        this.streakDays = 0;
        this.pointsEarned = 0;
    }

    // Constructor
    public Analytics(String userId) {
        this();
        this.userId = userId;
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

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public int getCompletedTasksToday() {
        return completedTasksToday;
    }

    public void setCompletedTasksToday(int completedTasksToday) {
        this.completedTasksToday = completedTasksToday;
    }

    public int getTotalTasksToday() {
        return totalTasksToday;
    }

    public void setTotalTasksToday(int totalTasksToday) {
        this.totalTasksToday = totalTasksToday;
    }

    public int getStudyTimeMinutes() {
        return studyTimeMinutes;
    }

    public void setStudyTimeMinutes(int studyTimeMinutes) {
        this.studyTimeMinutes = studyTimeMinutes;
    }

    public int getCoursesWorkedOn() {
        return coursesWorkedOn;
    }

    public void setCoursesWorkedOn(int coursesWorkedOn) {
        this.coursesWorkedOn = coursesWorkedOn;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public int getStreakDays() {
        return streakDays;
    }

    public void setStreakDays(int streakDays) {
        this.streakDays = streakDays;
    }

    public int getPointsEarned() {
        return pointsEarned;
    }

    public void setPointsEarned(int pointsEarned) {
        this.pointsEarned = pointsEarned;
    }

    public Map<String, Integer> getCategoryProgress() {
        return categoryProgress;
    }

    public void setCategoryProgress(Map<String, Integer> categoryProgress) {
        this.categoryProgress = categoryProgress;
    }

    public Map<String, Double> getSubjectScores() {
        return subjectScores;
    }

    public void setSubjectScores(Map<String, Double> subjectScores) {
        this.subjectScores = subjectScores;
    }

    public int getWeeklyCompletedTasks() {
        return weeklyCompletedTasks;
    }

    public void setWeeklyCompletedTasks(int weeklyCompletedTasks) {
        this.weeklyCompletedTasks = weeklyCompletedTasks;
    }

    public int getMonthlyCompletedTasks() {
        return monthlyCompletedTasks;
    }

    public void setMonthlyCompletedTasks(int monthlyCompletedTasks) {
        this.monthlyCompletedTasks = monthlyCompletedTasks;
    }

    public int getWeeklyStudyTime() {
        return weeklyStudyTime;
    }

    public void setWeeklyStudyTime(int weeklyStudyTime) {
        this.weeklyStudyTime = weeklyStudyTime;
    }

    public int getMonthlyStudyTime() {
        return monthlyStudyTime;
    }

    public void setMonthlyStudyTime(int monthlyStudyTime) {
        this.monthlyStudyTime = monthlyStudyTime;
    }
}