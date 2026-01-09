package com.courseplanner.dto;

import java.util.List;

public class OnboardingRequest {
    private String userId;
    private List<String> interests;
    private List<String> studyGoals;
    private String preferredLearningStyle;
    private String careerGoal;
    private String experienceLevel;

    // Default constructor
    public OnboardingRequest() {}

    // Constructor
    public OnboardingRequest(String userId, List<String> interests, List<String> studyGoals) {
        this.userId = userId;
        this.interests = interests;
        this.studyGoals = studyGoals;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public List<String> getStudyGoals() {
        return studyGoals;
    }

    public void setStudyGoals(List<String> studyGoals) {
        this.studyGoals = studyGoals;
    }

    public String getPreferredLearningStyle() {
        return preferredLearningStyle;
    }

    public void setPreferredLearningStyle(String preferredLearningStyle) {
        this.preferredLearningStyle = preferredLearningStyle;
    }

    public String getCareerGoal() {
        return careerGoal;
    }

    public void setCareerGoal(String careerGoal) {
        this.careerGoal = careerGoal;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }
}
