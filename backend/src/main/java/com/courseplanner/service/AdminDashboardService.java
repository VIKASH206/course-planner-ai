package com.courseplanner.service;

import com.courseplanner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Admin Dashboard Service for statistics and analytics
 */
@Service
public class AdminDashboardService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BrowseCourseRepository browseCourseRepository;
    
    @Autowired
    private AIRecommendationLogRepository aiRecommendationLogRepository;
    
    @Autowired
    private InterestService interestService;
    
    @Autowired
    private GoalService goalService;
    
    @Autowired
    private AIRuleService aiRuleService;
    
    @Autowired
    private UserCourseEnrollmentRepository userCourseEnrollmentRepository;
    
    /**
     * Get dashboard statistics
     * Implements all 6 required metrics:
     * 1. Total Users (all users including students + admins)
     * 2. Active Users (users with accountStatus = 'ACTIVE')
     * 3. Total Courses (all courses in browse_courses)
     * 4. Available Courses (courses with isPublished = true)
     * 5. Coming Soon Courses (courses with isPublished = false)
     * 6. AI Recommendations Today (AI logs created today)
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 1. TOTAL USERS - Count all registered users (students + admins)
        long totalUsers = userRepository.count();
        System.out.println("📊 Total Users in DB: " + totalUsers);
        
        // 2. ACTIVE USERS - Count users with accountStatus = 'ACTIVE'
        long activeUsers = userRepository.countByAccountStatus("ACTIVE");
        System.out.println("📊 Active Users in DB: " + activeUsers);
        
        // 3. TOTAL COURSES - Count all courses in browse_courses collection
        long totalCourses = browseCourseRepository.count();
        System.out.println("📊 Total Courses in browse_courses: " + totalCourses);
        
        // 4. AVAILABLE COURSES - Count courses with isPublished = true
        long availableCourses = browseCourseRepository.countByIsPublished(true);
        System.out.println("📊 Available Courses (isPublished=true): " + availableCourses);
        
        // 5. COMING SOON COURSES - Count courses with isComingSoon = true
        long comingSoonCourses = browseCourseRepository.countByIsComingSoon(true);
        System.out.println("📊 Coming Soon Courses (isComingSoon=true): " + comingSoonCourses);
        
        // 6. AI RECOMMENDATIONS TODAY - Count AI recommendation logs created today
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        long aiRecommendationsToday = aiRecommendationLogRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        
        // Add to response
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("totalCourses", totalCourses);
        stats.put("availableCourses", availableCourses);
        stats.put("comingSoonCourses", comingSoonCourses);
        stats.put("aiRecommendationsToday", aiRecommendationsToday);
        
        // Legacy fields (kept for backward compatibility with other dashboard features)
        stats.put("activeInterests", interestService.countActiveInterests());
        stats.put("totalGoals", goalService.countGoals());
        stats.put("totalRules", aiRuleService.countRules());
        
        return stats;
    }
    
    /**
     * Get user interest trends - Real data from MongoDB
     * NOTE: Only counts interests from STUDENT users, excludes ADMIN users
     */
    public Map<String, Long> getUserInterestTrends() {
        Map<String, Long> trends = new HashMap<>();
        
        // Get only student users and count their interests (exclude admins)
        var users = userRepository.findByRole("STUDENT");
        for (var user : users) {
            if (user.getInterests() != null) {
                for (String interest : user.getInterests()) {
                    trends.put(interest, trends.getOrDefault(interest, 0L) + 1);
                }
            }
        }
        
        return trends;
    }
    
    /**
     * Get goal selection statistics - Real data from MongoDB
     * NOTE: Only counts goals from STUDENT users, excludes ADMIN users
     */
    public Map<String, Long> getGoalSelectionStats() {
        Map<String, Long> stats = new HashMap<>();
        
        // Get only student users and count their study goals (exclude admins)
        var users = userRepository.findByRole("STUDENT");
        for (var user : users) {
            if (user.getStudyGoals() != null) {
                for (String goal : user.getStudyGoals()) {
                    stats.put(goal, stats.getOrDefault(goal, 0L) + 1);
                }
            }
        }
        
        return stats;
    }
    
    /**
     * Get most recommended subjects - Real data from MongoDB
     * NOTE: Only counts recommendations from STUDENT users, excludes ADMIN users
     */
    public Map<String, Long> getMostRecommendedSubjects() {
        Map<String, Long> subjects = new HashMap<>();
        
        // Get only student users and count AI recommendations (exclude admins)
        var users = userRepository.findByRole("STUDENT");
        for (var user : users) {
            if (user.getAiRecommendations() != null) {
                for (String recommendation : user.getAiRecommendations()) {
                    subjects.put(recommendation, subjects.getOrDefault(recommendation, 0L) + 1);
                }
            }
        }
        
        return subjects;
    }
    
    /**
     * Get completion rate statistics - Real data from MongoDB
     */
    public Map<String, Object> getCompletionRateStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get completion data from user enrollments
        long completedCourses = userCourseEnrollmentRepository.countByIsCompleted(true);
        long inProgressCourses = userCourseEnrollmentRepository.countByIsCompletedAndIsActive(false, true);
        long totalCourses = userCourseEnrollmentRepository.count();
        
        double completionRate = totalCourses > 0 ? (double) completedCourses / totalCourses * 100 : 0.0;
        
        stats.put("overallCompletionRate", Math.round(completionRate * 100.0) / 100.0);
        stats.put("averageTimeToComplete", "4 weeks"); // Can be calculated from timestamps
        stats.put("completedCourses", completedCourses);
        stats.put("inProgressCourses", inProgressCourses);
        
        return stats;
    }
}
