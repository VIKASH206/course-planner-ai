package com.courseplanner.service;

import com.courseplanner.model.BrowseCourse;
import com.courseplanner.model.User;
import com.courseplanner.model.UserCourseEnrollment;
import com.courseplanner.model.AIRecommendationLog;
import com.courseplanner.repository.BrowseCourseRepository;
import com.courseplanner.repository.UserCourseEnrollmentRepository;
import com.courseplanner.repository.UserRepository;
import com.courseplanner.repository.AIRecommendationLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIRecommendationService {

    @Autowired
    private BrowseCourseRepository browseCourseRepository;

    @Autowired
    private UserCourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeminiService geminiService;
    
    @Autowired
    private AIRecommendationLogRepository aiRecommendationLogRepository;

    /**
     * Get AI-based personalized course recommendations for a user
     * Analyzes user's enrolled courses, interests, and skill level
     * 🚨 STRICT FILTERING: Only shows courses matching user's experience level
     */
    public List<Map<String, Object>> getPersonalizedRecommendations(String userId) {
        try {
            // Get user data - validate user exists
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Get user's enrolled courses
            List<UserCourseEnrollment> enrollments = enrollmentRepository.findByUserId(userId);
            List<String> enrolledCourseIds = enrollments.stream()
                    .map(UserCourseEnrollment::getCourseId)
                    .collect(Collectors.toList());

            // Get enrolled course details for analysis
            List<BrowseCourse> enrolledCourses = browseCourseRepository.findAllById(enrolledCourseIds);

            // Extract user interests from profile AND enrolled courses (prioritize profile interests)
            Set<String> userInterests = extractUserInterests(user, enrolledCourses);
            
            // 🎯 CRITICAL: Use user's experience level from profile if available
            // This ensures onboarding preferences are respected
            String skillLevel;
            if (user.getExperienceLevel() != null && !user.getExperienceLevel().isEmpty()) {
                skillLevel = user.getExperienceLevel();
                System.out.println("✅ Using user's onboarding experience level: " + skillLevel);
            } else {
                skillLevel = determineSkillLevel(enrolledCourses);
                System.out.println("⚠️ No onboarding level set, determined from courses: " + skillLevel);
            }

            // Get all available courses (excluding enrolled ones)
            List<BrowseCourse> allCourses = browseCourseRepository.findByIsPublished(true, null).getContent();
            
            // 🚨 STRICT FILTERING: Apply experience level filter FIRST
            List<BrowseCourse> availableCourses = allCourses.stream()
                    .filter(course -> !enrolledCourseIds.contains(course.getId()))
                    .filter(course -> {
                        // STRICT: Only show courses matching user's EXACT experience level
                        if (course.getDifficulty() == null) return false;
                        
                        String courseDifficulty = course.getDifficulty().trim();
                        String userLevel = skillLevel.trim();
                        
                        // Case-insensitive exact match
                        boolean matches = courseDifficulty.equalsIgnoreCase(userLevel);
                        
                        if (!matches) {
                            System.out.println("❌ Filtered out: " + course.getTitle() + 
                                " (difficulty: " + courseDifficulty + 
                                ", user level: " + userLevel + ")");
                        }
                        
                        return matches;
                    })
                    .collect(Collectors.toList());

            System.out.println("🎯 After STRICT level filtering: " + availableCourses.size() + 
                " courses match level '" + skillLevel + "'");

            // Calculate recommendation scores
            List<Map<String, Object>> recommendations = availableCourses.stream()
                    .map(course -> {
                        Map<String, Object> recommendation = new HashMap<>();
                        
                        // Calculate relevance score
                        int relevanceScore = calculateRelevanceScore(course, userInterests, skillLevel, enrolledCourses);
                        
                        recommendation.put("id", course.getId());
                        recommendation.put("title", course.getTitle());
                        recommendation.put("description", course.getDescription());
                        recommendation.put("category", course.getCategory());
                        recommendation.put("difficulty", course.getDifficulty());
                        recommendation.put("instructor", course.getInstructor());
                        recommendation.put("duration", course.getDuration());
                        recommendation.put("estimatedTime", course.getEstimatedTime());
                        recommendation.put("rating", course.getRating());
                        recommendation.put("studentsCount", course.getStudentsCount());
                        recommendation.put("imageUrl", course.getImageUrl());
                        recommendation.put("tags", course.getTags());
                        recommendation.put("relevanceScore", relevanceScore);
                        recommendation.put("aiSuggested", true);
                        recommendation.put("reason", generateRecommendationReason(course, userInterests, skillLevel));
                        
                        return recommendation;
                    })
                    .filter(rec -> {
                        int score = (Integer) rec.get("relevanceScore");
                        // Only include courses with meaningful relevance (at least 30 points)
                        // This ensures we only show courses that actually match user interests
                        return score >= 30;
                    })
                    .sorted((a, b) -> Integer.compare(
                            (Integer) b.get("relevanceScore"), 
                            (Integer) a.get("relevanceScore")))
                    // Don't limit to fixed number - return only relevant courses
                    // If user has IoT interest and only 5 IoT courses exist, show only 5
                    .collect(Collectors.toList());

            System.out.println("✅ Final recommendations: " + recommendations.size() + 
                " courses (all at " + skillLevel + " level)");

            // Log AI recommendation event for dashboard statistics
            if (!recommendations.isEmpty()) {
                try {
                    AIRecommendationLog log = new AIRecommendationLog(
                        userId, 
                        user.getUsername(), 
                        recommendations.size()
                    );
                    log.setRecommendationType("PERSONALIZED");
                    aiRecommendationLogRepository.save(log);
                    System.out.println("📊 Logged AI recommendation event: " + recommendations.size() + " recommendations");
                } catch (Exception logError) {
                    System.err.println("⚠️ Failed to log AI recommendation: " + logError.getMessage());
                }
            }

            return recommendations;
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback to popular courses if recommendation fails
            return getPopularCoursesAsRecommendations();
        }
    }

    /**
     * Calculate relevance score for a course based on user profile
     */
    private int calculateRelevanceScore(
            BrowseCourse course, 
            Set<String> userInterests, 
            String skillLevel,
            List<BrowseCourse> enrolledCourses) {
        
        int score = 0;
        int interestMatchScore = 0; // Track score from interest/category/tag matches only

        // Match with user interests (category) - HIGHEST PRIORITY
        if (course.getCategory() != null) {
            for (String interest : userInterests) {
                String courseCategory = course.getCategory().toLowerCase();
                String userInterest = interest.toLowerCase();
                
                // Exact match gets highest score
                if (courseCategory.equals(userInterest)) {
                    score += 50;
                    interestMatchScore += 50;
                }
                // Partial match (contains) gets medium score
                else if (courseCategory.contains(userInterest) || userInterest.contains(courseCategory)) {
                    score += 40;
                    interestMatchScore += 40;
                }
            }
        }

        // Match with course title - important for specific interests like "UI/UX"
        if (course.getTitle() != null) {
            for (String interest : userInterests) {
                if (course.getTitle().toLowerCase().contains(interest.toLowerCase())) {
                    score += 35;
                    interestMatchScore += 35;
                }
            }
        }

        // Match with tags
        if (course.getTags() != null) {
            for (String interest : userInterests) {
                for (String tag : course.getTags()) {
                    String courseTag = tag.toLowerCase();
                    String userInterest = interest.toLowerCase();
                    
                    if (courseTag.equals(userInterest)) {
                        score += 25;
                        interestMatchScore += 25;
                    } else if (courseTag.contains(userInterest) || userInterest.contains(courseTag)) {
                        score += 20;
                        interestMatchScore += 20;
                    }
                }
            }
        }

        // Skill level matching
        if (course.getDifficulty() != null) {
            String courseDifficulty = course.getDifficulty().toLowerCase();
            String userLevel = skillLevel.toLowerCase();
            
            if (userLevel.equals("beginner")) {
                if (courseDifficulty.equals("beginner")) score += 25;
                else if (courseDifficulty.equals("intermediate")) score += 10;
            } else if (userLevel.equals("intermediate")) {
                if (courseDifficulty.equals("intermediate")) score += 25;
                else if (courseDifficulty.equals("beginner") || courseDifficulty.equals("advanced")) score += 15;
            } else if (userLevel.equals("advanced")) {
                if (courseDifficulty.equals("advanced")) score += 25;
                else if (courseDifficulty.equals("intermediate")) score += 15;
            } else if (userLevel.equals("expert")) {
                if (courseDifficulty.equals("expert") || courseDifficulty.equals("advanced")) score += 25;
            }
        }

        // Bonus for high ratings
        if (course.getRating() >= 4.5) {
            score += 10;
        } else if (course.getRating() >= 4.0) {
            score += 5;
        }

        // Bonus for popular courses
        if (course.getStudentsCount() > 1000) {
            score += 10;
        } else if (course.getStudentsCount() > 500) {
            score += 5;
        }

        // Sequential learning bonus (related to enrolled courses)
        for (BrowseCourse enrolledCourse : enrolledCourses) {
            if (enrolledCourse.getCategory() != null && 
                course.getCategory() != null &&
                enrolledCourse.getCategory().equals(course.getCategory())) {
                // Check if this is a progression
                String enrolledDiff = enrolledCourse.getDifficulty() != null ? 
                        enrolledCourse.getDifficulty().toLowerCase() : "beginner";
                String courseDiff = course.getDifficulty() != null ? 
                        course.getDifficulty().toLowerCase() : "beginner";
                
                if (isProgression(enrolledDiff, courseDiff)) {
                    score += 20; // Bonus for logical progression
                }
            }
        }

        // Trending and featured bonus
        if (course.isTrending()) {
            score += 8;
        }
        if (course.isFeatured()) {
            score += 5;
        }

        // ⚠️ CRITICAL FILTER: Courses must have meaningful interest match
        // If user has specific interests, course must match at least one interest/category/tag
        // Don't show courses that only score high from difficulty/rating/popularity bonuses
        if (!userInterests.isEmpty() && interestMatchScore < 20) {
            // No meaningful interest match found - return 0 to exclude this course
            // This prevents showing Python for IoT interest just because of rating/difficulty bonuses
            return 0;
        }

        return score;
    }

    /**
     * Check if course difficulty is a logical progression
     */
    private boolean isProgression(String currentLevel, String nextLevel) {
        Map<String, Integer> levelOrder = Map.of(
            "beginner", 1,
            "intermediate", 2,
            "advanced", 3,
            "expert", 4
        );
        
        int current = levelOrder.getOrDefault(currentLevel, 1);
        int next = levelOrder.getOrDefault(nextLevel, 1);
        
        return next == current + 1; // Next level is one step up
    }

    /**
     * Extract user interests from user profile and enrolled courses
     * Prioritizes explicit user interests from profile
     */
    private Set<String> extractUserInterests(User user, List<BrowseCourse> enrolledCourses) {
        Set<String> interests = new HashSet<>();
        
        // PRIORITY 1: Get explicit interests from user profile
        if (user.getInterests() != null && !user.getInterests().isEmpty()) {
            interests.addAll(user.getInterests());
            System.out.println("✅ Using user profile interests: " + user.getInterests());
        }
        
        // PRIORITY 2: Add interests from enrolled courses
        for (BrowseCourse course : enrolledCourses) {
            if (course.getCategory() != null) {
                interests.add(course.getCategory());
            }
            if (course.getTags() != null) {
                interests.addAll(course.getTags());
            }
        }
        
        return interests;
    }

    /**
     * Determine user skill level based on enrolled courses
     */
    private String determineSkillLevel(List<BrowseCourse> enrolledCourses) {
        if (enrolledCourses.isEmpty()) {
            return "beginner";
        }

        Map<String, Integer> difficultyCount = new HashMap<>();
        
        for (BrowseCourse course : enrolledCourses) {
            if (course.getDifficulty() != null) {
                String difficulty = course.getDifficulty().toLowerCase();
                difficultyCount.put(difficulty, difficultyCount.getOrDefault(difficulty, 0) + 1);
            }
        }

        // Determine highest skill level
        if (difficultyCount.getOrDefault("expert", 0) > 0 || 
            difficultyCount.getOrDefault("advanced", 0) >= 2) {
            return "advanced";
        } else if (difficultyCount.getOrDefault("advanced", 0) > 0 || 
                   difficultyCount.getOrDefault("intermediate", 0) >= 2) {
            return "intermediate";
        } else if (difficultyCount.getOrDefault("intermediate", 0) > 0) {
            return "intermediate";
        } else {
            return "beginner";
        }
    }

    /**
     * Generate recommendation reason
     */
    private String generateRecommendationReason(
            BrowseCourse course, 
            Set<String> userInterests, 
            String skillLevel) {
        
        List<String> reasons = new ArrayList<>();

        // Interest match
        if (course.getCategory() != null) {
            for (String interest : userInterests) {
                if (course.getCategory().toLowerCase().contains(interest.toLowerCase())) {
                    reasons.add("Matches your interest in " + interest);
                    break;
                }
            }
        }

        // Skill level match
        if (course.getDifficulty() != null && 
            course.getDifficulty().equalsIgnoreCase(skillLevel)) {
            reasons.add("Perfect for your " + skillLevel + " skill level");
        }

        // High rating
        if (course.getRating() >= 4.5) {
            reasons.add("Highly rated by students (" + course.getRating() + "/5.0)");
        }

        // Popular
        if (course.getStudentsCount() > 1000) {
            reasons.add("Popular choice with " + course.getStudentsCount() + "+ students");
        }

        // Trending
        if (course.isTrending()) {
            reasons.add("Trending now in " + course.getCategory());
        }

        if (reasons.isEmpty()) {
            return "Recommended based on your learning profile";
        }

        return String.join(". ", reasons) + ".";
    }

    /**
     * Fallback: Return popular courses as recommendations
     */
    private List<Map<String, Object>> getPopularCoursesAsRecommendations() {
        List<BrowseCourse> popularCourses = browseCourseRepository.findTopPopularCourses(
                org.springframework.data.domain.PageRequest.of(0, 6));
        
        return popularCourses.stream()
                .map(course -> {
                    Map<String, Object> rec = new HashMap<>();
                    rec.put("id", course.getId());
                    rec.put("title", course.getTitle());
                    rec.put("description", course.getDescription());
                    rec.put("category", course.getCategory());
                    rec.put("difficulty", course.getDifficulty());
                    rec.put("instructor", course.getInstructor());
                    rec.put("duration", course.getDuration());
                    rec.put("estimatedTime", course.getEstimatedTime());
                    rec.put("rating", course.getRating());
                    rec.put("studentsCount", course.getStudentsCount());
                    rec.put("imageUrl", course.getImageUrl());
                    rec.put("relevanceScore", 50);
                    rec.put("aiSuggested", true);
                    rec.put("reason", "Popular course among learners");
                    return rec;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get recommendations using AI (Gemini)
     */
    public List<Map<String, Object>> getAIEnhancedRecommendations(String userId) {
        try {
            // Get basic recommendations first
            List<Map<String, Object>> recommendations = getPersonalizedRecommendations(userId);
            
            // Enhance with AI if available
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && geminiService != null) {
                // Use Gemini to refine recommendations (optional enhancement)
                // This can be implemented later with more sophisticated AI logic
            }
            
            return recommendations;
        } catch (Exception e) {
            return getPersonalizedRecommendations(userId);
        }
    }

    /**
     * Generate personalized onboarding recommendations
     * STRICT RULES:
     * 1. Priority to user's selected Interests
     * 2. Align with user's Goals (job, skill upgrade, career growth)
     * 3. STRICTLY filter by Experience Level (Beginner/Intermediate/Advanced)
     * 4. NO mixing of difficulty levels
     * 5. Show "Coming Soon" message if no courses available
     */
    public Map<String, Object> generateOnboardingRecommendations(String userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Get user data - validate user exists
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Validate onboarding data exists
            if (user.getInterests() == null || user.getInterests().isEmpty()) {
                response.put("success", false);
                response.put("message", "Please complete your interests first");
                response.put("recommendations", new ArrayList<>());
                return response;
            }

            if (user.getExperienceLevel() == null || user.getExperienceLevel().isEmpty()) {
                response.put("success", false);
                response.put("message", "Please select your experience level");
                response.put("recommendations", new ArrayList<>());
                return response;
            }

            // Extract user preferences
            List<String> userInterests = user.getInterests();
            List<String> userGoals = user.getStudyGoals() != null ? user.getStudyGoals() : new ArrayList<>();
            String experienceLevel = user.getExperienceLevel(); // Beginner, Intermediate, Advanced
            String careerGoal = user.getCareerGoal();

            System.out.println("🎯 Generating onboarding recommendations for user: " + userId);
            System.out.println("📚 Interests: " + userInterests);
            System.out.println("🎓 Experience Level: " + experienceLevel);
            System.out.println("🎯 Goals: " + userGoals);

            // Get all published courses
            List<BrowseCourse> allCourses = browseCourseRepository.findByIsPublished(true, null).getContent();

            // STRICT FILTERING: Only courses matching EXACT experience level
            List<BrowseCourse> filteredCourses = allCourses.stream()
                    .filter(course -> {
                        // CRITICAL: Only show courses of the EXACT difficulty level
                        String courseDifficulty = course.getDifficulty();
                        if (courseDifficulty == null) return false;
                        
                        // Normalize for comparison
                        String normalizedCourseDifficulty = courseDifficulty.trim().toLowerCase();
                        String normalizedUserLevel = experienceLevel.trim().toLowerCase();
                        
                        // STRICT MATCH: Must be exact match
                        return normalizedCourseDifficulty.equals(normalizedUserLevel);
                    })
                    .filter(course -> {
                        // Filter by interests: Course must match at least one user interest
                        boolean matchesInterest = false;
                        
                        for (String interest : userInterests) {
                            String normalizedInterest = interest.toLowerCase().trim();
                            
                            // Check category match
                            if (course.getCategory() != null && 
                                course.getCategory().toLowerCase().contains(normalizedInterest)) {
                                matchesInterest = true;
                                break;
                            }
                            
                            // Check title match
                            if (course.getTitle() != null && 
                                course.getTitle().toLowerCase().contains(normalizedInterest)) {
                                matchesInterest = true;
                                break;
                            }
                            
                            // Check tags match
                            if (course.getTags() != null) {
                                for (String tag : course.getTags()) {
                                    if (tag.toLowerCase().contains(normalizedInterest)) {
                                        matchesInterest = true;
                                        break;
                                    }
                                }
                            }
                            
                            if (matchesInterest) break;
                        }
                        
                        return matchesInterest;
                    })
                    .collect(Collectors.toList());

            // Check if courses are available
            if (filteredCourses.isEmpty()) {
                response.put("success", true);
                response.put("hasRecommendations", false);
                response.put("message", "🚧 Coming Soon – " + String.join(", ", userInterests) + 
                           " courses at " + experienceLevel + " level are not yet available.");
                response.put("recommendations", new ArrayList<>());
                response.put("userProfile", buildUserProfileSummary(user));
                return response;
            }

            // Calculate relevance scores and sort courses
            List<Map<String, Object>> recommendations = filteredCourses.stream()
                    .map(course -> {
                        Map<String, Object> recommendation = new HashMap<>();
                        
                        // Calculate relevance score based on interest and goal match
                        int relevanceScore = calculateOnboardingRelevanceScore(
                            course, userInterests, userGoals, experienceLevel
                        );
                        
                        recommendation.put("id", course.getId());
                        recommendation.put("title", course.getTitle());
                        recommendation.put("description", course.getDescription());
                        recommendation.put("shortDescription", generateShortDescription(course));
                        recommendation.put("category", course.getCategory());
                        recommendation.put("difficulty", course.getDifficulty());
                        recommendation.put("instructor", course.getInstructor());
                        recommendation.put("duration", course.getDuration());
                        recommendation.put("estimatedTime", course.getEstimatedTime());
                        recommendation.put("rating", course.getRating());
                        recommendation.put("studentsCount", course.getStudentsCount());
                        recommendation.put("imageUrl", course.getImageUrl());
                        recommendation.put("tags", course.getTags());
                        recommendation.put("relevanceScore", relevanceScore);
                        recommendation.put("aiRecommended", true);
                        recommendation.put("matchReason", generateOnboardingMatchReason(
                            course, userInterests, userGoals, experienceLevel
                        ));
                        recommendation.put("goalAlignment", generateGoalAlignment(course, userGoals, careerGoal));
                        
                        return recommendation;
                    })
                    .sorted((a, b) -> Integer.compare(
                            (Integer) b.get("relevanceScore"), 
                            (Integer) a.get("relevanceScore")))
                    .limit(8) // Show top 8 recommendations
                    .collect(Collectors.toList());

            // Build response with user profile summary
            response.put("success", true);
            response.put("hasRecommendations", true);
            response.put("message", "Personalized recommendations generated successfully");
            response.put("recommendations", recommendations);
            response.put("totalFound", recommendations.size());
            response.put("userProfile", buildUserProfileSummary(user));
            
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error generating recommendations: " + e.getMessage());
            response.put("recommendations", new ArrayList<>());
            return response;
        }
    }

    /**
     * Calculate relevance score for onboarding recommendations
     */
    private int calculateOnboardingRelevanceScore(
            BrowseCourse course, 
            List<String> userInterests, 
            List<String> userGoals,
            String experienceLevel) {
        
        int score = 0;

        // Interest matching (HIGHEST PRIORITY)
        for (String interest : userInterests) {
            String normalizedInterest = interest.toLowerCase().trim();
            
            // Category exact match
            if (course.getCategory() != null && 
                course.getCategory().toLowerCase().equals(normalizedInterest)) {
                score += 50;
            }
            // Category contains match
            else if (course.getCategory() != null && 
                     course.getCategory().toLowerCase().contains(normalizedInterest)) {
                score += 40;
            }
            
            // Title match
            if (course.getTitle() != null && 
                course.getTitle().toLowerCase().contains(normalizedInterest)) {
                score += 35;
            }
            
            // Tags match
            if (course.getTags() != null) {
                for (String tag : course.getTags()) {
                    if (tag.toLowerCase().equals(normalizedInterest)) {
                        score += 25;
                    } else if (tag.toLowerCase().contains(normalizedInterest)) {
                        score += 20;
                    }
                }
            }
        }

        // Goal matching
        if (userGoals != null && !userGoals.isEmpty()) {
            for (String goal : userGoals) {
                String normalizedGoal = goal.toLowerCase().trim();
                
                // Check if course aligns with goals
                if (course.getDescription() != null && 
                    course.getDescription().toLowerCase().contains(normalizedGoal)) {
                    score += 15;
                }
                
                if (course.getTitle() != null && 
                    course.getTitle().toLowerCase().contains(normalizedGoal)) {
                    score += 15;
                }
            }
        }

        // Experience level perfect match bonus (already filtered, so always perfect match)
        score += 30;

        // Quality indicators
        if (course.getRating() >= 4.5) score += 15;
        else if (course.getRating() >= 4.0) score += 10;

        if (course.getStudentsCount() > 1000) score += 15;
        else if (course.getStudentsCount() > 500) score += 10;

        if (course.isTrending()) score += 10;
        if (course.isFeatured()) score += 10;

        return score;
    }

    /**
     * Generate match reason for onboarding recommendations
     */
    private String generateOnboardingMatchReason(
            BrowseCourse course,
            List<String> userInterests,
            List<String> userGoals,
            String experienceLevel) {
        
        List<String> reasons = new ArrayList<>();

        // Interest match
        for (String interest : userInterests) {
            if (course.getCategory() != null && 
                course.getCategory().toLowerCase().contains(interest.toLowerCase())) {
                reasons.add("Matches your interest in " + interest);
                break;
            }
        }

        // Perfect level match
        reasons.add("Perfect for " + experienceLevel + " level learners");

        // High rating
        if (course.getRating() >= 4.5) {
            reasons.add("Highly rated (" + course.getRating() + "★)");
        }

        // Popular
        if (course.getStudentsCount() > 1000) {
            reasons.add("Popular with " + course.getStudentsCount() + "+ students");
        }

        return String.join(" • ", reasons);
    }

    /**
     * Generate goal alignment explanation
     */
    private String generateGoalAlignment(
            BrowseCourse course,
            List<String> userGoals,
            String careerGoal) {
        
        List<String> alignments = new ArrayList<>();

        // Check goal alignment
        if (userGoals != null) {
            for (String goal : userGoals) {
                String normalizedGoal = goal.toLowerCase().trim();
                
                if (goal.toLowerCase().contains("job") || goal.toLowerCase().contains("career")) {
                    alignments.add("Helps you achieve your career goals");
                    break;
                } else if (goal.toLowerCase().contains("skill")) {
                    alignments.add("Builds essential skills for your development");
                    break;
                }
            }
        }

        // Career goal alignment
        if (careerGoal != null && !careerGoal.isEmpty()) {
            alignments.add("Supports your path to " + careerGoal);
        }

        if (alignments.isEmpty()) {
            return "Recommended for your learning journey";
        }

        return String.join(". ", alignments) + ".";
    }

    /**
     * Generate short description for course card
     */
    private String generateShortDescription(BrowseCourse course) {
        if (course.getDescription() == null || course.getDescription().isEmpty()) {
            return "Learn " + course.getTitle();
        }
        
        String description = course.getDescription();
        if (description.length() > 120) {
            return description.substring(0, 117) + "...";
        }
        
        return description;
    }

    /**
     * Build user profile summary for response
     */
    private Map<String, Object> buildUserProfileSummary(User user) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("interests", user.getInterests());
        profile.put("studyGoals", user.getStudyGoals());
        profile.put("experienceLevel", user.getExperienceLevel());
        profile.put("careerGoal", user.getCareerGoal());
        profile.put("preferredLearningStyle", user.getPreferredLearningStyle());
        return profile;
    }
}
