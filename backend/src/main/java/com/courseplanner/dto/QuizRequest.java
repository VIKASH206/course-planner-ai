package com.courseplanner.dto;

public class QuizRequest {
    private String content;
    private int numberOfQuestions;

    public QuizRequest() {}

    public QuizRequest(String content, int numberOfQuestions) {
        this.content = content;
        this.numberOfQuestions = numberOfQuestions;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getNumberOfQuestions() {
        return numberOfQuestions;
    }

    public void setNumberOfQuestions(int numberOfQuestions) {
        this.numberOfQuestions = numberOfQuestions;
    }
}