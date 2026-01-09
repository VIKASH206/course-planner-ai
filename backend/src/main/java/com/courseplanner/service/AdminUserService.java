package com.courseplanner.service;

import com.courseplanner.model.User;
import com.courseplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin User Management Service
 * Handles user management operations for admins
 */
@Service
public class AdminUserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all users with optional filtering
     */
    public List<User> getAllUsers(String role, String status, String search) {
        List<User> users = userRepository.findAll();

        // Filter by role if provided
        if (role != null && !role.isEmpty()) {
            users = users.stream()
                    .filter(user -> role.equalsIgnoreCase(user.getRole()))
                    .collect(Collectors.toList());
        }

        // Filter by status if provided
        if (status != null && !status.isEmpty()) {
            // Convert "Active" to "ACTIVE" for comparison
            String statusUpper = status.toUpperCase();
            users = users.stream()
                    .filter(user -> {
                        String userStatus = user.getAccountStatus();
                        if (userStatus == null) userStatus = "ACTIVE"; // Default
                        return statusUpper.equalsIgnoreCase(userStatus);
                    })
                    .collect(Collectors.toList());
        }

        // Search by name or email if provided
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            users = users.stream()
                    .filter(user -> {
                        String name = (user.getFirstName() != null ? user.getFirstName() : "") + 
                                     " " + 
                                     (user.getLastName() != null ? user.getLastName() : "");
                        String email = user.getEmail() != null ? user.getEmail() : "";
                        String username = user.getUsername() != null ? user.getUsername() : "";
                        
                        return name.toLowerCase().contains(searchLower) ||
                               email.toLowerCase().contains(searchLower) ||
                               username.toLowerCase().contains(searchLower);
                    })
                    .collect(Collectors.toList());
        }

        return users;
    }

    /**
     * Get user by ID
     */
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    /**
     * Update user status (ACTIVE/INACTIVE/BLOCKED/DELETED)
     */
    public User updateUserStatus(String userId, String newStatus) {
        User user = getUserById(userId);
        
        // Validate status
        if (!isValidStatus(newStatus)) {
            throw new RuntimeException("Invalid status. Must be: ACTIVE, INACTIVE, BLOCKED, or DELETED");
        }
        
        user.setAccountStatus(newStatus.toUpperCase());
        return userRepository.save(user);
    }

    /**
     * Update user role (STUDENT/ADMIN)
     */
    public User updateUserRole(String userId, String newRole) {
        User user = getUserById(userId);
        
        // Validate role
        if (!isValidRole(newRole)) {
            throw new RuntimeException("Invalid role. Must be: STUDENT or ADMIN");
        }
        
        user.setRole(newRole.toUpperCase());
        return userRepository.save(user);
    }

    /**
     * Delete user (soft delete - set status to DELETED)
     */
    public void deleteUser(String userId) {
        User user = getUserById(userId);
        user.setAccountStatus("DELETED");
        userRepository.save(user);
    }

    /**
     * Get user statistics summary
     */
    public Map<String, Object> getUserStatsSummary() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByAccountStatus("ACTIVE");
        long inactiveUsers = userRepository.countByAccountStatus("INACTIVE");
        long totalStudents = userRepository.countByRole("STUDENT");
        long totalAdmins = userRepository.countByRole("ADMIN");
        
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("inactiveUsers", inactiveUsers);
        stats.put("totalStudents", totalStudents);
        stats.put("totalAdmins", totalAdmins);
        
        return stats;
    }

    /**
     * Validate status value
     */
    private boolean isValidStatus(String status) {
        if (status == null) return false;
        String statusUpper = status.toUpperCase();
        return statusUpper.equals("ACTIVE") || 
               statusUpper.equals("INACTIVE") || 
               statusUpper.equals("BLOCKED") || 
               statusUpper.equals("DELETED");
    }

    /**
     * Validate role value
     */
    private boolean isValidRole(String role) {
        if (role == null) return false;
        String roleUpper = role.toUpperCase();
        return roleUpper.equals("STUDENT") || roleUpper.equals("ADMIN");
    }
}
