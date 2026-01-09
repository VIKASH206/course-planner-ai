package com.courseplanner.dto;

public class GoogleAuthRequest {
    private String googleToken;
    private String email;
    private String firstName;
    private String lastName;
    private String profilePicture;
    private String googleId;

    // Constructors
    public GoogleAuthRequest() {
    }

    public GoogleAuthRequest(String googleToken, String email, String firstName, String lastName, String profilePicture, String googleId) {
        this.googleToken = googleToken;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.profilePicture = profilePicture;
        this.googleId = googleId;
    }

    // Getters and Setters
    public String getGoogleToken() {
        return googleToken;
    }

    public void setGoogleToken(String googleToken) {
        this.googleToken = googleToken;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }
}
