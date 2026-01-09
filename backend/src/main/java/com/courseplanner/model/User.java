package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    @Indexed(unique = true)
    private String email;
    
    private String password; // Plain text as per requirements
    
    private String firstName;
    private String lastName;
    private String profilePicture;
    private String bio;
    
    // Extended Profile fields
    private String phone;
    private String location;
    private String university;
    private String department;
    private String major;
    private String year;
    private String gender;
    private String dateOfBirth;
    private String website;
    private String linkedin;
    private String twitter;
    private String github;
    private List<String> skills;
    private List<String> languages;
    private String emergencyContact;
    private String emergencyPhone;
    
    // Role-based access control
    private String role; // "STUDENT", "ADMIN", "INSTRUCTOR"
    
    // Account status
    private String accountStatus; // "ACTIVE", "INACTIVE", "BLOCKED", "DELETED"
    
    // OAuth fields
    private String authProvider; // "LOCAL", "GOOGLE", "FACEBOOK", etc.
    private String googleId; // Google OAuth user ID
    
    // Password reset fields
    private String resetToken;
    private LocalDateTime resetTokenExpiry;
    
    // Email verification fields
    private boolean isEmailVerified;
    private String verificationToken;
    private LocalDateTime verificationTokenExpiry;
    
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    
    // Gamification fields
    private int totalScore;
    private int level;
    private int completedCourses;
    private int completedTasks;
    private int xpPoints; // Experience points
    private int studyStreakDays; // Consecutive days of study
    
    // Onboarding & Interests fields
    private boolean onboardingCompleted;
    private List<String> interests; // e.g., "AI", "Web Development", "Data Science"
    private List<String> studyGoals; // e.g., "Learn Python", "Get job in ML"
    private String preferredLearningStyle; // e.g., "Visual", "Hands-on", "Reading"
    private String careerGoal; // e.g., "Software Engineer", "Data Scientist"
    private String experienceLevel; // e.g., "Beginner", "Intermediate", "Advanced"
    private List<String> aiRecommendations; // AI-generated course recommendations

    // Default constructor
    public User() {
        this.createdAt = LocalDateTime.now();
        this.totalScore = 0;
        this.level = 1;
        this.completedCourses = 0;
        this.completedTasks = 0;
        this.xpPoints = 0;
        this.studyStreakDays = 0;
        this.onboardingCompleted = false;
        this.isEmailVerified = false; // Email verification required by default
        this.interests = new ArrayList<>();
        this.studyGoals = new ArrayList<>();
        this.aiRecommendations = new ArrayList<>();
        this.role = "STUDENT"; // Default role
        this.accountStatus = "ACTIVE"; // Default status
    }

    // Constructor
    public User(String username, String email, String password) {
        this();
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getCompletedCourses() {
        return completedCourses;
    }

    public void setCompletedCourses(int completedCourses) {
        this.completedCourses = completedCourses;
    }

    public int getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(int completedTasks) {
        this.completedTasks = completedTasks;
    }

    public boolean isOnboardingCompleted() {
        return onboardingCompleted;
    }

    public void setOnboardingCompleted(boolean onboardingCompleted) {
        this.onboardingCompleted = onboardingCompleted;
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

    public List<String> getAiRecommendations() {
        return aiRecommendations;
    }

    public void setAiRecommendations(List<String> aiRecommendations) {
        this.aiRecommendations = aiRecommendations;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getAccountStatus() {
        return accountStatus;
    }
    
    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }
    
    public String getResetToken() {
        return resetToken;
    }
    
    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }
    
    public LocalDateTime getResetTokenExpiry() {
        return resetTokenExpiry;
    }
    
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }
    
    public String getAuthProvider() {
        return authProvider;
    }
    
    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }
    
    public String getGoogleId() {
        return googleId;
    }
    
    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }
    
    public boolean isEmailVerified() {
        return isEmailVerified;
    }
    
    public void setEmailVerified(boolean emailVerified) {
        this.isEmailVerified = emailVerified;
    }
    
    // Extended Profile Getters and Setters
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getUniversity() {
        return university;
    }
    
    public void setUniversity(String university) {
        this.university = university;
    }
    
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public String getMajor() {
        return major;
    }
    
    public void setMajor(String major) {
        this.major = major;
    }
    
    public String getYear() {
        return year;
    }
    
    public void setYear(String year) {
        this.year = year;
    }
    
    public String getGender() {
        return gender;
    }
    
    public void setGender(String gender) {
        this.gender = gender;
    }
    
    public String getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
    }
    
    public String getLinkedin() {
        return linkedin;
    }
    
    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }
    
    public String getTwitter() {
        return twitter;
    }
    
    public void setTwitter(String twitter) {
        this.twitter = twitter;
    }
    
    public String getGithub() {
        return github;
    }
    
    public void setGithub(String github) {
        this.github = github;
    }
    
    public List<String> getSkills() {
        return skills;
    }
    
    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
    
    public List<String> getLanguages() {
        return languages;
    }
    
    public void setLanguages(List<String> languages) {
        this.languages = languages;
    }
    
    public String getEmergencyContact() {
        return emergencyContact;
    }
    
    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }
    
    public String getEmergencyPhone() {
        return emergencyPhone;
    }
    
    public void setEmergencyPhone(String emergencyPhone) {
        this.emergencyPhone = emergencyPhone;
    }
    
    public String getVerificationToken() {
        return verificationToken;
    }
    
    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }
    
    public LocalDateTime getVerificationTokenExpiry() {
        return verificationTokenExpiry;
    }
    
    public void setVerificationTokenExpiry(LocalDateTime verificationTokenExpiry) {
        this.verificationTokenExpiry = verificationTokenExpiry;
    }
    
    public Integer getXpPoints() {
        return xpPoints;
    }
    
    public void setXpPoints(Integer xpPoints) {
        this.xpPoints = xpPoints;
    }
    
    public Integer getStudyStreakDays() {
        return studyStreakDays;
    }
    
    public void setStudyStreakDays(Integer studyStreakDays) {
        this.studyStreakDays = studyStreakDays;
    }
}