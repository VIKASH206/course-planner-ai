package com.courseplanner.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.List;

/**
 * Utility to clean up unused MongoDB collections
 * This will run once on application startup
 */
@Component
@ConditionalOnProperty(name = "app.db.cleanup.enabled", havingValue = "true")
public class DatabaseCleanupUtil {

    @Autowired
    private MongoTemplate mongoTemplate;

    // List of unused collections to remove
    private static final List<String> UNUSED_COLLECTIONS = Arrays.asList(
            "forums",
            "forum_posts",
            "modules",
            "notes",
            "quiz_attempts",
            "quizzes",
            "reminders",
            "topics",
            "lessons",
            "study_groups",
            "ai_interactions",
            "course_tags",
            "course_popularity_score"
    );

    /**
     * Clean up unused collections on application startup
     * Comment out @PostConstruct if you don't want this to run automatically
     */
    @PostConstruct
    public void cleanupUnusedCollections() {
        System.out.println("\n🗑️  Starting cleanup of unused MongoDB collections...");
        
        int successCount = 0;
        int notFoundCount = 0;

        for (String collectionName : UNUSED_COLLECTIONS) {
            try {
                if (mongoTemplate.collectionExists(collectionName)) {
                    mongoTemplate.dropCollection(collectionName);
                    System.out.println("✅ Dropped collection: " + collectionName);
                    successCount++;
                } else {
                    System.out.println("⚠️  Collection not found (already removed): " + collectionName);
                    notFoundCount++;
                }
            } catch (Exception e) {
                System.err.println("❌ Error dropping collection " + collectionName + ": " + e.getMessage());
            }
        }

        System.out.println("\n📊 Cleanup Summary:");
        System.out.println("   ✅ Successfully dropped: " + successCount + " collections");
        System.out.println("   ⚠️  Already removed: " + notFoundCount + " collections");
        System.out.println("   📦 Total collections in database: " + mongoTemplate.getCollectionNames().size());
        
        System.out.println("\n📋 Currently active collections:");
        mongoTemplate.getCollectionNames().forEach(name -> {
            long count = mongoTemplate.getCollection(name).countDocuments();
            System.out.println("   • " + name + " (" + count + " documents)");
        });
        
        System.out.println("\n✨ Database cleanup completed!\n");
    }

    /**
     * Manual cleanup method (can be called from a controller endpoint)
     */
    public String performCleanup() {
        cleanupUnusedCollections();
        return "Database cleanup completed successfully!";
    }
}
