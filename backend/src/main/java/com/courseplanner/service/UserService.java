package com.courseplanner.service;

import com.courseplanner.model.User;
import com.courseplanner.model.Course;
import com.courseplanner.repository.UserRepository;
import com.courseplanner.repository.CourseRepository;
import com.courseplanner.dto.SignupRequest;
import com.courseplanner.dto.LoginRequest;
import com.courseplanner.dto.OnboardingRequest;
import com.courseplanner.dto.AIAnalysisResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ActivityService activityService;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private GeminiService geminiService;
    
    @Autowired
    private EmailService emailService;

    /**
     * Register a new user
     */
    public User signup(SignupRequest signupRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User(signupRequest.getUsername(), signupRequest.getEmail(), signupRequest.getPassword());
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());
        
        // Set role (default to STUDENT if not provided)
        if (signupRequest.getRole() != null && !signupRequest.getRole().isEmpty()) {
            user.setRole(signupRequest.getRole());
        } else {
            user.setRole("STUDENT");
        }
        
        // Email verification setup
        user.setEmailVerified(false);
        String verificationToken = java.util.UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24)); // 24 hours expiry
        
        // Save user
        User savedUser = userRepository.save(user);
        
        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        } catch (Exception e) {
            // Log error but don't fail signup
            System.err.println("Failed to send verification email: " + e.getMessage());
        }

        return savedUser;
    }

    /**
     * Authenticate user login (supports both email and username)
     */
    public User login(LoginRequest loginRequest) {
        Optional<User> userOpt;
        
        // Try to login with email first, then username
        if (loginRequest.getEmail() != null && !loginRequest.getEmail().isEmpty()) {
            userOpt = userRepository.findByEmail(loginRequest.getEmail());
        } else if (loginRequest.getUsername() != null && !loginRequest.getUsername().isEmpty()) {
            userOpt = userRepository.findByUsername(loginRequest.getUsername());
        } else {
            throw new RuntimeException("Email or username is required");
        }
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        
        // Check if email is verified
        if (!user.isEmailVerified()) {
            throw new RuntimeException("Email not verified. Please check your email for verification link.");
        }
        
        // Simple password check (plain text)
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Update last login time
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return user;
    }

    /**
     * Get user profile by ID
     */
    public User getUserProfile(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Update user profile
     */
    public User updateProfile(String userId, User updatedUser) {
        User existingUser = getUserProfile(userId);

        // Update basic fields
        if (updatedUser.getFirstName() != null) {
            existingUser.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            existingUser.setLastName(updatedUser.getLastName());
        }
        if (updatedUser.getUsername() != null) {
            existingUser.setUsername(updatedUser.getUsername());
        }
        if (updatedUser.getEmail() != null) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getBio() != null) {
            existingUser.setBio(updatedUser.getBio());
        }
        if (updatedUser.getProfilePicture() != null) {
            existingUser.setProfilePicture(updatedUser.getProfilePicture());
        }
        
        // Update extended profile fields
        if (updatedUser.getPhone() != null) {
            existingUser.setPhone(updatedUser.getPhone());
        }
        if (updatedUser.getLocation() != null) {
            existingUser.setLocation(updatedUser.getLocation());
        }
        if (updatedUser.getUniversity() != null) {
            existingUser.setUniversity(updatedUser.getUniversity());
        }
        if (updatedUser.getDepartment() != null) {
            existingUser.setDepartment(updatedUser.getDepartment());
        }
        if (updatedUser.getMajor() != null) {
            existingUser.setMajor(updatedUser.getMajor());
        }
        if (updatedUser.getYear() != null) {
            existingUser.setYear(updatedUser.getYear());
        }
        if (updatedUser.getGender() != null) {
            existingUser.setGender(updatedUser.getGender());
        }
        if (updatedUser.getDateOfBirth() != null) {
            existingUser.setDateOfBirth(updatedUser.getDateOfBirth());
        }
        if (updatedUser.getWebsite() != null) {
            existingUser.setWebsite(updatedUser.getWebsite());
        }
        if (updatedUser.getLinkedin() != null) {
            existingUser.setLinkedin(updatedUser.getLinkedin());
        }
        if (updatedUser.getTwitter() != null) {
            existingUser.setTwitter(updatedUser.getTwitter());
        }
        if (updatedUser.getGithub() != null) {
            existingUser.setGithub(updatedUser.getGithub());
        }
        if (updatedUser.getSkills() != null) {
            existingUser.setSkills(updatedUser.getSkills());
        }
        if (updatedUser.getLanguages() != null) {
            existingUser.setLanguages(updatedUser.getLanguages());
        }
        if (updatedUser.getEmergencyContact() != null) {
            existingUser.setEmergencyContact(updatedUser.getEmergencyContact());
        }
        if (updatedUser.getEmergencyPhone() != null) {
            existingUser.setEmergencyPhone(updatedUser.getEmergencyPhone());
        }

        return userRepository.save(existingUser);
    }

    /**
     * Change user password
     */
    public User changePassword(String userId, String currentPassword, String newPassword) {
        User user = getUserProfile(userId);
        
        // Verify current password
        if (!user.getPassword().equals(currentPassword)) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Validate new password
        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters long");
        }
        
        // Update password
        user.setPassword(newPassword);
        return userRepository.save(user);
    }

    /**
     * Get leaderboard (top users by score)
     */
    public List<User> getLeaderboard() {
        return userRepository.findTopUsersByScore();
    }

    /**
     * Update user score and level
     */
    public User updateUserScore(String userId, int pointsEarned) {
        User user = getUserProfile(userId);
        user.setTotalScore(user.getTotalScore() + pointsEarned);
        
        // Simple level calculation: every 1000 points = 1 level
        int newLevel = (user.getTotalScore() / 1000) + 1;
        user.setLevel(newLevel);

        return userRepository.save(user);
    }

    /**
     * Increment completed courses count
     */
    public User incrementCompletedCourses(String userId) {
        User user = getUserProfile(userId);
        user.setCompletedCourses(user.getCompletedCourses() + 1);
        return userRepository.save(user);
    }

    /**
     * Increment completed tasks count
     */
    public User incrementCompletedTasks(String userId) {
        User user = getUserProfile(userId);
        user.setCompletedTasks(user.getCompletedTasks() + 1);
        return userRepository.save(user);
    }

    /**
     * Check if username exists
     */
    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Check if email exists
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }
    
    /**
     * Update user interests and study goals during onboarding
     */
    public User updateUserInterests(OnboardingRequest onboardingRequest) {
        User user = getUserProfile(onboardingRequest.getUserId());
        
        user.setInterests(onboardingRequest.getInterests());
        user.setStudyGoals(onboardingRequest.getStudyGoals());
        user.setPreferredLearningStyle(onboardingRequest.getPreferredLearningStyle());
        user.setCareerGoal(onboardingRequest.getCareerGoal());
        user.setExperienceLevel(onboardingRequest.getExperienceLevel());
        user.setOnboardingCompleted(true);
        
        User savedUser = userRepository.save(user);
        
        // Log activity for admin dashboard
        String description = user.getUsername() + " completed onboarding with " + 
                           onboardingRequest.getInterests().size() + " interests and " +
                           onboardingRequest.getStudyGoals().size() + " goals";
        activityService.logActivity(
            user.getId(),
            user.getUsername(),
            "STUDENT",
            "ONBOARDING_COMPLETED",
            description,
            "USER",
            user.getId(),
            user.getUsername()
        );
        
        return savedUser;
    }
    
    /**
     * Analyze user interests with AI and provide recommendations
     */
    public AIAnalysisResponse analyzeInterestsWithAI(OnboardingRequest onboardingRequest) {
        // Build prompt for AI analysis - very concise
        StringBuilder prompt = new StringBuilder();
        prompt.append("Based on this profile:\n");
        prompt.append("• Interests: ").append(String.join(", ", onboardingRequest.getInterests())).append("\n");
        prompt.append("• Goals: ").append(String.join(", ", onboardingRequest.getStudyGoals())).append("\n");
        
        if (onboardingRequest.getCareerGoal() != null && !onboardingRequest.getCareerGoal().isEmpty()) {
            prompt.append("• Career: ").append(onboardingRequest.getCareerGoal()).append("\n");
        }
        
        if (onboardingRequest.getExperienceLevel() != null && !onboardingRequest.getExperienceLevel().isEmpty()) {
            prompt.append("• Level: ").append(onboardingRequest.getExperienceLevel()).append("\n");
        }
        
        prompt.append("\nWrite EXACTLY 2-3 sentences (maximum 40 words) welcoming them and mentioning their main interest and goal. Use simple, friendly language. NO formatting. NO lists. NO symbols. Just plain text.");
        
        // Call Gemini AI for analysis (with fallback)
        String aiResponse = "";
        try {
            aiResponse = geminiService.callGeminiAPI(prompt.toString());
            // Clean up markdown formatting from AI response
            aiResponse = cleanMarkdownFormatting(aiResponse);
            // Limit to first 3 sentences if AI gives more
            aiResponse = limitToThreeSentences(aiResponse);
        } catch (Exception e) {
            // Fallback message if AI fails
            String mainInterest = onboardingRequest.getInterests().isEmpty() ? "learning" : onboardingRequest.getInterests().get(0);
            String mainGoal = onboardingRequest.getStudyGoals().isEmpty() ? "your goals" : onboardingRequest.getStudyGoals().get(0);
            aiResponse = String.format("Welcome! We're excited to help you with %s and achieve %s. Let's start your personalized learning journey!", mainInterest, mainGoal);
        }
        
        // Parse the AI response and create structured response
        AIAnalysisResponse analysisResponse = new AIAnalysisResponse();
        analysisResponse.setAnalysisText(aiResponse);
        
        // Extract recommendations from AI response (basic parsing)
        List<String> recommendedCourses = extractRecommendations(aiResponse);
        analysisResponse.setRecommendedCourses(recommendedCourses);
        analysisResponse.setRecommendedTopics(recommendedCourses);
        
        // Store recommendations in user profile
        User user = getUserProfile(onboardingRequest.getUserId());
        user.setAiRecommendations(recommendedCourses);
        userRepository.save(user);
        
        return analysisResponse;
    }
    
    /**
     * Clean markdown formatting from AI response
     */
    private String cleanMarkdownFormatting(String text) {
        if (text == null) return "";
        
        // Remove all asterisks and underscores (bold/italic)
        text = text.replaceAll("\\*+", "");
        text = text.replaceAll("_+", "");
        
        // Remove headers (###, ##, #)
        text = text.replaceAll("#{1,6}\\s*", "");
        
        // Remove code blocks (```)
        text = text.replaceAll("```[a-zA-Z]*\\n?", "");
        
        // Remove inline code (`text`)
        text = text.replaceAll("`", "");
        
        // Remove bullet points and numbered lists
        text = text.replaceAll("^[\\d]+\\.\\s*", "");
        text = text.replaceAll("^[-*+]\\s*", "");
        
        // Remove multiple consecutive spaces
        text = text.replaceAll("\\s+", " ");
        
        // Remove multiple consecutive newlines
        text = text.replaceAll("\n{3,}", "\n\n");
        
        return text.trim();
    }
    
    /**
     * Limit text to maximum 3 sentences
     */
    private String limitToThreeSentences(String text) {
        if (text == null || text.isEmpty()) return "";
        
        // Split by sentence endings (., !, ?)
        String[] sentences = text.split("(?<=[.!?])\\s+");
        
        // Take only first 3 sentences
        StringBuilder result = new StringBuilder();
        int count = 0;
        for (String sentence : sentences) {
            if (count >= 3) break;
            if (!sentence.trim().isEmpty()) {
                result.append(sentence.trim()).append(" ");
                count++;
            }
        }
        
        return result.toString().trim();
    }
    
    /**
     * Extract course recommendations from AI response
     */
    private List<String> extractRecommendations(String aiResponse) {
        List<String> recommendations = new ArrayList<>();
        
        // Simple extraction logic - look for numbered or bulleted items
        String[] lines = aiResponse.split("\n");
        for (String line : lines) {
            line = line.trim();
            // Look for patterns like "1. ", "- ", or other course-like entries
            if (line.matches("^[0-9]+\\..*") || line.startsWith("- ") || line.startsWith("* ")) {
                String cleaned = line.replaceFirst("^[0-9]+\\.", "").replaceFirst("^[-*]", "").trim();
                if (!cleaned.isEmpty() && cleaned.length() > 5) {
                    recommendations.add(cleaned);
                }
            }
        }
        
        // Limit to first 10 recommendations
        return recommendations.size() > 10 ? recommendations.subList(0, 10) : recommendations;
    }
    
    /**
     * Get onboarding status
     */
    public boolean isOnboardingCompleted(String userId) {
        User user = getUserProfile(userId);
        return user.isOnboardingCompleted();
    }
    
    /**
     * 💾 Save AI-recommended courses to user_courses collection
     * ⚠️ DISABLED: Recommendations should be dynamic, NOT saved to database!
     * This was causing 500+ courses to accumulate in user_courses collection.
     */
    public void saveUserCourseRecommendations(String userId, java.util.List<java.util.Map<String, Object>> recommendations) {
        System.out.println("⚠️ saveUserCourseRecommendations is DISABLED - recommendations are now dynamic only");
        // COMMENTED OUT - Don't save recommendations to database
        /*
        User user = getUserProfile(userId);
        
        // Track saved course IDs for user reference
        java.util.List<String> savedCourseIds = new java.util.ArrayList<>();
        
        // Create Course documents in user_courses collection
        for (java.util.Map<String, Object> rec : recommendations) {
            String courseId = (String) rec.get("courseId");
            String title = (String) rec.get("title");
            String description = (String) rec.get("description");
            String category = (String) rec.get("category");
            String difficulty = (String) rec.get("difficulty");
            
            if (courseId != null && title != null) {
                // Check if course already exists for this user
                java.util.List<Course> existingCourses = courseRepository.findByUserId(userId);
                boolean courseExists = existingCourses.stream()
                    .anyMatch(c -> courseId.equals(c.getId()));
                
                if (!courseExists) {
                    // Create new Course document
                    Course course = new Course(title, description, userId);
                    course.setId(courseId);
                    course.setCategory(category);
                    course.setDifficulty(difficulty);
                    course.setActive(true);
                    course.setCompleted(false);
                    course.setProgressPercentage(0);
                    
                    // Add tags/interests from recommendation
                    if (rec.get("interests") != null) {
                        @SuppressWarnings("unchecked")
                        java.util.List<String> interests = (java.util.List<String>) rec.get("interests");
                        course.setTags(interests);
                    }
                    
                    // Save to user_courses collection
                    courseRepository.save(course);
                    savedCourseIds.add(courseId);
                    
                    System.out.println("✅ Saved course to user_courses: " + title + " (ID: " + courseId + ")");
                } else {
                    System.out.println("⚠️ Course already exists for user: " + title);
                }
            }
        }
        
        // Also update user's AI recommendations field
        user.setAiRecommendations(savedCourseIds);
        userRepository.save(user);
        
        System.out.println("✅ Saved " + savedCourseIds.size() + " NEW recommendations to user_courses collection for user: " + userId);
        */
    }
    
    /**
     * Verify user email with token
     */
    public User verifyEmail(String email, String token) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        
        // Check if already verified
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }
        
        // Check if token matches
        if (user.getVerificationToken() == null || !user.getVerificationToken().equals(token)) {
            throw new RuntimeException("Invalid verification token");
        }
        
        // Check if token expired
        if (user.getVerificationTokenExpiry() == null || LocalDateTime.now().isAfter(user.getVerificationTokenExpiry())) {
            throw new RuntimeException("Verification token has expired. Please request a new one.");
        }
        
        // Verify email
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        
        return userRepository.save(user);
    }
    
    /**
     * Resend verification email
     */
    public void resendVerificationEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        
        // Check if already verified
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }
        
        // Generate new token
        String verificationToken = java.util.UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24)); // 24 hours expiry
        
        userRepository.save(user);
        
        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), verificationToken);
    }
}
