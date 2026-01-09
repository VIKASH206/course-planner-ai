package com.courseplanner.dto;

public class PasswordResetResponse {
    private boolean success;
    private String message;
    private boolean emailExists;

    // Default constructor
    public PasswordResetResponse() {}

    // Constructor
    public PasswordResetResponse(boolean success, String message, boolean emailExists) {
        this.success = success;
        this.message = message;
        this.emailExists = emailExists;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isEmailExists() {
        return emailExists;
    }

    public void setEmailExists(boolean emailExists) {
        this.emailExists = emailExists;
    }
}
