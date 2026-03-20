package com.courseplanner.util;

import com.courseplanner.model.User;
import com.courseplanner.model.BrowseCourse;
import com.courseplanner.repository.UserRepository;
import com.courseplanner.repository.BrowseCourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.util.List;

/**
 * Data initializer to ensure all users have accountStatus and courses have isPublished status
 */
@Component
@Order(100) // Run after other initializers
public class DashboardStatsInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BrowseCourseRepository browseCourseRepository;
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔄 Initializing Dashboard Statistics Data...");
        
        // Initialize user account status
        initializeUserAccountStatus();
        
        // Initialize course published status
        initializeCoursePublishedStatus();
        
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
    
}
