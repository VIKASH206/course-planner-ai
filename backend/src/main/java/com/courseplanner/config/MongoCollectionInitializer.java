package com.courseplanner.config;

import com.mongodb.client.MongoDatabase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Initializes MongoDB collections that don't exist yet
 * This ensures all collections used in the application are created
 */
@Component
public class MongoCollectionInitializer implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) throws Exception {
        MongoDatabase database = mongoTemplate.getDb();
        
        // List of collections that should exist (ONLY active collections)
        List<String> requiredCollections = Arrays.asList(
            // Core collections
            "users",
            "browse_courses",
            "course_ratings",
            "enrollments",
            "user_courses",
            "enrolled_courses",
            
            // Learning features
            "tasks",
            "user_progress",
            "learning_analytics",
            "activities",
            
            // Gamification
            "badges",
            "user_badges",
            "user_gamification",
            
            // AI and personalization
            "ai_rules",
            "interests",
            "goals",
            "subjects"
        );
        
        // Get existing collections
        List<String> existingCollections = database.listCollectionNames()
            .into(new java.util.ArrayList<>());
        
        System.out.println("\n========================================");
        System.out.println("🔍 MongoDB Collection Initialization");
        System.out.println("========================================\n");
        
        int createdCount = 0;
        int existingCount = 0;
        
        for (String collectionName : requiredCollections) {
            if (!existingCollections.contains(collectionName)) {
                database.createCollection(collectionName);
                System.out.println("✅ Created collection: " + collectionName);
                createdCount++;
            } else {
                System.out.println("✓  Collection already exists: " + collectionName);
                existingCount++;
            }
        }
        
        System.out.println("\n========================================");
        System.out.println("📊 Summary:");
        System.out.println("   - Existing collections: " + existingCount);
        System.out.println("   - Newly created: " + createdCount);
        System.out.println("   - Total collections: " + (existingCount + createdCount));
        System.out.println("========================================\n");
    }
}
