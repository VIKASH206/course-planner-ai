package com.courseplanner.util;

import com.courseplanner.model.AIRecommendationLog;
import com.courseplanner.model.User;
import com.courseplanner.repository.AIRecommendationLogRepository;
import com.courseplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * Database seeder for AI Recommendation Logs
 * Creates sample logs for demonstration
 */
@Component
@Order(200)
public class AIRecommendationLogSeeder implements CommandLineRunner {

    @Autowired
    private AIRecommendationLogRepository aiRecommendationLogRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        System.out.println("\n🤖 Checking AI Recommendation Logs...");
        
        List<User> students = userRepository.findByRole("STUDENT");
        
        if (students.isEmpty()) {
            System.out.println("⚠️  No students found.");
            return;
        }
        
        // Find students who don't have any logs yet
        int newLogsCreated = 0;
        for (User student : students) {
            long existingLogs = aiRecommendationLogRepository.countByUserId(student.getId());
            
            if (existingLogs == 0) {
                // Create logs for this new user
                int logsToCreate = random.nextInt(3) + 1; // 1-3 logs per user
                
                for (int i = 0; i < logsToCreate; i++) {
                    AIRecommendationLog log = new AIRecommendationLog();
                    log.setUserId(student.getId());
                    log.setUsername(student.getUsername());
                    log.setRecommendationCount(getRandomRecommendationCount());
                    log.setRecommendationType(getRandomRecommendationType());
                    
                    // Get user's actual interest
                    String userInterest = getUserInterest(student);
                    log.setInterest(userInterest);
                    log.setStatus(getRandomStatus());
                    
                    // Vary the creation time (within last 7 days)
                    int daysAgo = random.nextInt(7);
                    int hoursAgo = random.nextInt(24);
                    log.setCreatedAt(LocalDateTime.now().minusDays(daysAgo).minusHours(hoursAgo));
                    
                    aiRecommendationLogRepository.save(log);
                    newLogsCreated++;
                }
                
                System.out.println("✅ Created " + logsToCreate + " logs for new user: " + student.getUsername());
            }
        }
        
        if (newLogsCreated > 0) {
            System.out.println("✅ Total new logs created: " + newLogsCreated);
        } else {
            System.out.println("✅ All users already have logs");
        }
    }

    private int getRandomRecommendationCount() {
        // Random between 3 and 8 recommendations
        return random.nextInt(6) + 3;
    }

    private String getRandomRecommendationType() {
        String[] types = {"INITIAL", "REFRESH", "MANUAL", "AUTO"};
        return types[random.nextInt(types.length)];
    }
    
    private String getRandomInterest() {
        String[] interests = {
            "Technology and Programming",
            "Data Science and AI",
            "Business and Management",
            "Creative Arts and Design",
            "Web Development",
            "Machine Learning"
        };
        return interests[random.nextInt(interests.length)];
    }
    
    private String getRandomStatus() {
        // 80% Success, 20% Coming Soon
        return random.nextInt(10) < 8 ? "Success" : "Coming Soon";
    }
    
    private String getUserInterest(User user) {
        // Get user's first interest if available
        if (user.getInterests() != null && !user.getInterests().isEmpty()) {
            return user.getInterests().get(0);
        }
        // Fallback to random interest if user has no interests set
        return getRandomInterest();
    }
}
