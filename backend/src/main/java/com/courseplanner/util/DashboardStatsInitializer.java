package com.courseplanner.util;

import com.courseplanner.model.User;
import com.courseplanner.model.BrowseCourse;
import com.courseplanner.model.AIRecommendationLog;
import com.courseplanner.repository.UserRepository;
import com.courseplanner.repository.BrowseCourseRepository;
import com.courseplanner.repository.AIRecommendationLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data initializer to ensure all users have accountStatus and courses have isPublished status
 * Also initializes some test AI recommendation logs for demo purposes
 */
@Component
@Order(100) // Run after other initializers
public class DashboardStatsInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BrowseCourseRepository browseCourseRepository;
    
    @Autowired
    private AIRecommendationLogRepository aiRecommendationLogRepository;
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔄 Initializing Dashboard Statistics Data...");
        
        // Initialize user account status
        initializeUserAccountStatus();
        
        // Initialize course published status
        initializeCoursePublishedStatus();
        
        // Create sample AI recommendation logs for today (demo purposes)
        createSampleAIRecommendationLogs();
        
        System.out.println("✅ Dashboard Statistics Data Initialized!");
    }
    
    private void initializeUserAccountStatus() {
        List<User> users = userRepository.findAll();
        int updated = 0;
        
        for (User user : users) {
            if (user.getAccountStatus() == null || user.getAccountStatus().isEmpty()) {
                user.setAccountStatus("ACTIVE");
                userRepository.save(user);
                updated++;
            }
        }
        
        System.out.println("✅ Updated " + updated + " users with default ACTIVE status");
    }
    
    private void initializeCoursePublishedStatus() {
        List<BrowseCourse> courses = browseCourseRepository.findAll();
        int updated = 0;
        
        for (BrowseCourse course : courses) {
            // If not explicitly set, default to published (true)
            // This ensures existing courses are visible
            if (!course.isPublished()) {
                course.setPublished(true);
                browseCourseRepository.save(course);
                updated++;
            }
        }
        
        System.out.println("✅ Ensured " + courses.size() + " courses have published status (updated " + updated + ")");
    }
    
    private void createSampleAIRecommendationLogs() {
        // Check if logs already exist for today
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        
        long existingLogsToday = aiRecommendationLogRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        
        if (existingLogsToday == 0) {
            // Create 3-5 sample logs for demonstration
            List<User> sampleUsers = userRepository.findByRole("STUDENT");
            
            int logsToCreate = Math.min(5, sampleUsers.size());
            
            for (int i = 0; i < logsToCreate; i++) {
                User user = sampleUsers.get(i);
                AIRecommendationLog log = new AIRecommendationLog(
                    user.getId(),
                    user.getUsername(),
                    (int) (Math.random() * 5) + 3 // 3-7 recommendations
                );
                log.setRecommendationType("INITIAL");
                log.setCreatedAt(LocalDateTime.now().minusHours(i)); // Spread throughout the day
                aiRecommendationLogRepository.save(log);
            }
            
            System.out.println("✅ Created " + logsToCreate + " sample AI recommendation logs for today");
        } else {
            System.out.println("ℹ️ Found " + existingLogsToday + " AI recommendation logs for today");
        }
    }
}
