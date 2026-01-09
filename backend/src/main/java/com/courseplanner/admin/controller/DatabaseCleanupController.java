package com.courseplanner.admin.controller;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/cleanup")
@CrossOrigin(origins = "*")
public class DatabaseCleanupController {

    @Autowired
    private MongoClient mongoClient;

    @PostMapping("/remove-duplicates")
    public ResponseEntity<?> removeDuplicates() {
        try {
            MongoDatabase database = mongoClient.getDatabase("course_planner_db");
            
            Map<String, Object> result = new HashMap<>();
            int deletedCount = 0;
            
            // Clean Interests - Remove test/duplicate data
            MongoCollection<Document> interests = database.getCollection("interests");
            List<String> testInterests = Arrays.asList("AR/VR", "Artificial Intelligence", "Web Development", "Machine Learning");
            deletedCount += interests.deleteMany(new Document("name", new Document("$in", testInterests))).getDeletedCount();
            
            // Clean Goals - Remove test/duplicate data
            MongoCollection<Document> goals = database.getCollection("goals");
            List<String> testGoals = Arrays.asList("sddsf", "master", "ai", "software engineer");
            deletedCount += goals.deleteMany(new Document("name", new Document("$in", testGoals))).getDeletedCount();
            
            // Reset user selections if they had test data
            MongoCollection<Document> users = database.getCollection("users");
            users.updateMany(
                new Document(),
                new Document("$set", new Document()
                    .append("selectedInterests", Collections.emptyList())
                    .append("selectedGoals", Collections.emptyList())
                )
            );
            
            result.put("success", true);
            result.put("message", "Cleanup completed successfully");
            result.put("deletedCount", deletedCount);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Cleanup failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/reset-all")
    public ResponseEntity<?> resetAll() {
        try {
            MongoDatabase database = mongoClient.getDatabase("course_planner_db");
            
            // Delete ALL interests and goals
            MongoCollection<Document> interests = database.getCollection("interests");
            long interestsDeleted = interests.deleteMany(new Document()).getDeletedCount();
            
            MongoCollection<Document> goals = database.getCollection("goals");
            long goalsDeleted = goals.deleteMany(new Document()).getDeletedCount();
            
            // Create clean data
            createCleanData(database);
            
            // Reset user selections
            MongoCollection<Document> users = database.getCollection("users");
            users.updateMany(
                new Document(),
                new Document("$set", new Document()
                    .append("selectedInterests", Collections.emptyList())
                    .append("selectedGoals", Collections.emptyList())
                    .append("onboardingComplete", false)
                )
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Database reset successfully");
            result.put("interestsDeleted", interestsDeleted);
            result.put("goalsDeleted", goalsDeleted);
            result.put("newInterests", 4);
            result.put("newGoals", 5);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Reset failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    private void createCleanData(MongoDatabase database) {
        Date now = new Date();
        MongoCollection<Document> interests = database.getCollection("interests");
        MongoCollection<Document> goals = database.getCollection("goals");
        
        // Create clean interests
        interests.insertOne(new Document()
            .append("name", "Technology & Programming")
            .append("description", "Software development, coding, and technical skills")
            .append("iconUrl", "")
            .append("enabled", true)
            .append("orderIndex", 1)
            .append("createdAt", now)
            .append("updatedAt", now));
        
        interests.insertOne(new Document()
            .append("name", "Data Science & AI")
            .append("description", "Machine learning, data analysis, and artificial intelligence")
            .append("iconUrl", "")
            .append("enabled", true)
            .append("orderIndex", 2)
            .append("createdAt", now)
            .append("updatedAt", now));
        
        interests.insertOne(new Document()
            .append("name", "Business & Management")
            .append("description", "Business strategy, leadership, and entrepreneurship")
            .append("iconUrl", "")
            .append("enabled", true)
            .append("orderIndex", 3)
            .append("createdAt", now)
            .append("updatedAt", now));
        
        interests.insertOne(new Document()
            .append("name", "Design & Creativity")
            .append("description", "UI/UX design, graphic design, and creative arts")
            .append("iconUrl", "")
            .append("enabled", true)
            .append("orderIndex", 4)
            .append("createdAt", now)
            .append("updatedAt", now));
        
        // Create clean goals
        goals.insertOne(new Document()
            .append("name", "Career Advancement")
            .append("description", "Advance in your current career and get promoted")
            .append("iconUrl", "")
            .append("interestIds", Collections.emptyList())
            .append("enabled", true)
            .append("orderIndex", 1)
            .append("createdAt", now)
            .append("updatedAt", now));
        
        goals.insertOne(new Document()
            .append("name", "Job Preparation")
            .append("description", "Prepare for job interviews and land your dream role")
            .append("iconUrl", "")
            .append("interestIds", Collections.emptyList())
            .append("enabled", true)
            .append("orderIndex", 2)
            .append("createdAt", now)
            .append("updatedAt", now));
        
        goals.insertOne(new Document()
            .append("name", "Entrepreneurship")
            .append("description", "Start your own business or venture")
            .append("iconUrl", "")
            .append("interestIds", Collections.emptyList())
            .append("enabled", true)
            .append("orderIndex", 3)
            .append("createdAt", now)
            .append("updatedAt", now));
        
        goals.insertOne(new Document()
            .append("name", "Personal Growth")
            .append("description", "Learn new skills for personal development")
            .append("iconUrl", "")
            .append("interestIds", Collections.emptyList())
            .append("enabled", true)
            .append("orderIndex", 4)
            .append("createdAt", now)
            .append("updatedAt", now));
        
        goals.insertOne(new Document()
            .append("name", "Academic Excellence")
            .append("description", "Excel in your academic studies and research")
            .append("iconUrl", "")
            .append("interestIds", Collections.emptyList())
            .append("enabled", true)
            .append("orderIndex", 5)
            .append("createdAt", now)
            .append("updatedAt", now));
    }
}
