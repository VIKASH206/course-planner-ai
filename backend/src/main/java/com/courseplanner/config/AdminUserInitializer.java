package com.courseplanner.config;

import com.courseplanner.model.User;
import com.courseplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Initializes default admin user on application startup
 * This ensures there's always an admin account available
 */
@Component
@Order(1) // Run this first before other initializers
public class AdminUserInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        createDefaultAdminUser();
        migrateExistingUsers();
    }

    private void createDefaultAdminUser() {
        // Check if admin user already exists
        if (userRepository.findByEmail("admin@courseplanner.com").isEmpty()) {
            System.out.println("\n🔐 Creating default admin user...");
            
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@courseplanner.com");
            admin.setPassword("admin123"); // Plain text as per system requirements
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRole("ADMIN");
            admin.setCreatedAt(LocalDateTime.now());
            admin.setLastLogin(LocalDateTime.now());
            admin.setOnboardingCompleted(true); // Admin doesn't need onboarding
            admin.setEmailVerified(true); // Admin is auto-verified
            admin.setLevel(1);
            admin.setTotalScore(0);
            admin.setCompletedCourses(0);
            admin.setCompletedTasks(0);
            
            userRepository.save(admin);
            
            System.out.println("✅ Admin user created successfully");
            System.out.println("   Email: admin@courseplanner.com");
            System.out.println("   Password: admin123");
        } else {
            System.out.println("✅ Admin user already exists");
        }
    }
    
    /**
     * Migrate existing users to set isEmailVerified = true
     * This ensures existing users can login without issues
     */
    private void migrateExistingUsers() {
        System.out.println("\n🔄 Migrating existing users for email verification...");
        
        try {
            // Find all users and update those without isEmailVerified field set
            java.util.List<User> allUsers = userRepository.findAll();
            int updatedCount = 0;
            
            for (User user : allUsers) {
                // For existing users created before verification was implemented,
                // set them as verified so they can login
                if (user.getVerificationToken() == null && user.getCreatedAt() != null) {
                    user.setEmailVerified(true);
                    userRepository.save(user);
                    updatedCount++;
                }
            }
            
            if (updatedCount > 0) {
                System.out.println("✅ Migrated " + updatedCount + " existing users");
            } else {
                System.out.println("✅ No users needed migration");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error during user migration: " + e.getMessage());
        }
    }
}
