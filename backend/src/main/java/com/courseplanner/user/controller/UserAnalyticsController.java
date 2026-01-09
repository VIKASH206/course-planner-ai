package com.courseplanner.user.controller;

import com.courseplanner.model.User;
import com.courseplanner.repository.UserRepository;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/user/analytics")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class UserAnalyticsController {

    @Autowired
    private MongoClient mongoClient;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMyAnalytics(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "User not authenticated");
                return ResponseEntity.status(401).body(error);
            }

            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (!userOpt.isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "User not found");
                return ResponseEntity.status(404).body(error);
            }

            User user = userOpt.get();
            MongoDatabase database = mongoClient.getDatabase("course_planner_db");

            // Get user's interests and goals count
            int myInterestsCount = user.getInterests() != null ? user.getInterests().size() : 0;
            int myGoalsCount = user.getStudyGoals() != null ? user.getStudyGoals().size() : 0;

            // Get total available interests and goals
            MongoCollection<Document> interestsCollection = database.getCollection("interests");
            long totalInterests = interestsCollection.countDocuments(new Document("enabled", true));
            
            MongoCollection<Document> goalsCollection = database.getCollection("goals");
            long totalGoals = goalsCollection.countDocuments(new Document("enabled", true));

            // Create analytics data
            Map<String, Object> userAnalytics = new HashMap<>();
            userAnalytics.put("totalUsers", myInterestsCount); // Reusing for "My Courses" display
            userAnalytics.put("studentUsers", 0);
            userAnalytics.put("onboardedUsers", user.isOnboardingCompleted() ? 1 : 0);
            userAnalytics.put("totalCourses", 0); // Can be expanded later

            Map<String, Object> interestAnalytics = new HashMap<>();
            interestAnalytics.put("totalInterests", myInterestsCount);
            interestAnalytics.put("enabledInterests", myInterestsCount);
            interestAnalytics.put("availableInterests", totalInterests);
            
            // Create topInterests map from user's selected interests
            Map<String, Integer> topInterests = new HashMap<>();
            if (user.getInterests() != null) {
                for (String interestId : user.getInterests()) {
                    // Get interest name from database
                    Document interest = interestsCollection.find(new Document("_id", new org.bson.types.ObjectId(interestId))).first();
                    if (interest != null) {
                        topInterests.put(interest.getString("name"), 1);
                    }
                }
            }
            interestAnalytics.put("topInterests", topInterests);

            Map<String, Object> goalAnalytics = new HashMap<>();
            goalAnalytics.put("totalGoals", myGoalsCount);
            goalAnalytics.put("enabledGoals", myGoalsCount);
            goalAnalytics.put("availableGoals", totalGoals);
            
            // Create topGoals map from user's selected goals
            Map<String, Integer> topGoals = new HashMap<>();
            if (user.getStudyGoals() != null) {
                for (String goalId : user.getStudyGoals()) {
                    // Get goal name from database
                    Document goal = goalsCollection.find(new Document("_id", new org.bson.types.ObjectId(goalId))).first();
                    if (goal != null) {
                        topGoals.put(goal.getString("name"), 1);
                    }
                }
            }
            goalAnalytics.put("topGoals", topGoals);

            Map<String, Object> recommendationAnalytics = new HashMap<>();
            recommendationAnalytics.put("usersWithRecommendations", 0);
            recommendationAnalytics.put("totalRecommendationsGenerated", 0);
            recommendationAnalytics.put("averageRecommendationsPerUser", 0.0);

            Map<String, Object> data = new HashMap<>();
            data.put("users", userAnalytics);
            data.put("interests", interestAnalytics);
            data.put("goals", goalAnalytics);
            data.put("recommendations", recommendationAnalytics);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            response.put("message", "Student analytics retrieved successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to retrieve analytics: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
