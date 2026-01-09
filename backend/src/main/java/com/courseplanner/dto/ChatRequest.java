package com.courseplanner.dto;

public class ChatRequest {
    private String message;
    private String context;
    private String userId;

    public ChatRequest() {}

    public ChatRequest(String message, String context, String userId) {
        this.message = message;
        this.context = context;
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}