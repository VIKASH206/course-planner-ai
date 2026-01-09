package com.courseplanner.dto;

import java.time.LocalDateTime;

public class ReminderRequest {
    private String userId;
    private String courseId;
    private String moduleId;
    private String topicId;
    private String title;
    private String description;
    private String reminderType; // DEADLINE, STUDY_SESSION, QUIZ, REVIEW, CUSTOM
    private LocalDateTime reminderDateTime;
    
    // Recurring settings
    private boolean isRecurring;
    private String recurringPattern; // DAILY, WEEKLY, MONTHLY
    private int recurringInterval;
    
    // Notification preferences
    private boolean emailNotification = true;
    private boolean pushNotification = true;
    private boolean inAppNotification = true;

    // Default constructor
    public ReminderRequest() {}

    // Constructor
    public ReminderRequest(String userId, String courseId, String title, LocalDateTime reminderDateTime) {
        this.userId = userId;
        this.courseId = courseId;
        this.title = title;
        this.reminderDateTime = reminderDateTime;
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

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getReminderType() { return reminderType; }
    public void setReminderType(String reminderType) { this.reminderType = reminderType; }

    public LocalDateTime getReminderDateTime() { return reminderDateTime; }
    public void setReminderDateTime(LocalDateTime reminderDateTime) { this.reminderDateTime = reminderDateTime; }

    public boolean isRecurring() { return isRecurring; }
    public void setRecurring(boolean recurring) { isRecurring = recurring; }

    public String getRecurringPattern() { return recurringPattern; }
    public void setRecurringPattern(String recurringPattern) { this.recurringPattern = recurringPattern; }

    public int getRecurringInterval() { return recurringInterval; }
    public void setRecurringInterval(int recurringInterval) { this.recurringInterval = recurringInterval; }

    public boolean isEmailNotification() { return emailNotification; }
    public void setEmailNotification(boolean emailNotification) { this.emailNotification = emailNotification; }

    public boolean isPushNotification() { return pushNotification; }
    public void setPushNotification(boolean pushNotification) { this.pushNotification = pushNotification; }

    public boolean isInAppNotification() { return inAppNotification; }
    public void setInAppNotification(boolean inAppNotification) { this.inAppNotification = inAppNotification; }
}