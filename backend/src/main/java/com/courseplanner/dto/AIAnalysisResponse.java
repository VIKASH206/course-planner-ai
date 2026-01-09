package com.courseplanner.dto;

import java.util.List;

public class AIAnalysisResponse {
    private String analysisText;
    private List<String> recommendedCourses;
    private List<String> recommendedTopics;
    private String learningPath;
    private String personalizedMessage;
    private List<String> skills;
    private String motivationalQuote;

    // Default constructor
    public AIAnalysisResponse() {}

    // Constructor
    public AIAnalysisResponse(String analysisText, List<String> recommendedCourses, String learningPath) {
        this.analysisText = analysisText;
        this.recommendedCourses = recommendedCourses;
        this.learningPath = learningPath;
    }

    // Getters and Setters
    public String getAnalysisText() {
        return analysisText;
    }

    public void setAnalysisText(String analysisText) {
        this.analysisText = analysisText;
    }

    public List<String> getRecommendedCourses() {
        return recommendedCourses;
    }

    public void setRecommendedCourses(List<String> recommendedCourses) {
        this.recommendedCourses = recommendedCourses;
    }

    public List<String> getRecommendedTopics() {
        return recommendedTopics;
    }

    public void setRecommendedTopics(List<String> recommendedTopics) {
        this.recommendedTopics = recommendedTopics;
    }

    public String getLearningPath() {
        return learningPath;
    }

    public void setLearningPath(String learningPath) {
        this.learningPath = learningPath;
    }

    public String getPersonalizedMessage() {
        return personalizedMessage;
    }

    public void setPersonalizedMessage(String personalizedMessage) {
        this.personalizedMessage = personalizedMessage;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getMotivationalQuote() {
        return motivationalQuote;
    }

    public void setMotivationalQuote(String motivationalQuote) {
        this.motivationalQuote = motivationalQuote;
    }
}
