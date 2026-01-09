package com.courseplanner.service;

import com.courseplanner.model.Activity;
import com.courseplanner.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {
    
    @Autowired
    private ActivityRepository activityRepository;
    
    /**
     * Log a new activity
     */
    public Activity logActivity(String userId, String username, String userRole, 
                               String actionType, String actionDescription,
                               String targetType, String targetId, String targetName) {
        Activity activity = new Activity(userId, username, userRole, actionType, 
                                        actionDescription, targetType, targetId, targetName);
        return activityRepository.save(activity);
    }
    
    /**
     * Get recent activities for admin dashboard
     */
    public List<Activity> getRecentActivitiesForAdmin() {
        return activityRepository.findTop20ByVisibleToAdminOrderByTimestampDesc(true);
    }
    
    /**
     * Get recent activities for student dashboard
     */
    public List<Activity> getRecentActivitiesForStudent() {
        return activityRepository.findTop20ByVisibleToStudentOrderByTimestampDesc(true);
    }
    
    /**
     * Get all activities for a specific user
     */
    public List<Activity> getUserActivities(String userId) {
        return activityRepository.findByUserIdOrderByTimestampDesc(userId);
    }
    
    /**
     * Get all activities visible to admin
     */
    public List<Activity> getAllActivitiesForAdmin() {
        return activityRepository.findByVisibleToAdminOrderByTimestampDesc(true);
    }
    
    /**
     * Get all activities visible to students
     */
    public List<Activity> getAllActivitiesForStudent() {
        return activityRepository.findByVisibleToStudentOrderByTimestampDesc(true);
    }
}
