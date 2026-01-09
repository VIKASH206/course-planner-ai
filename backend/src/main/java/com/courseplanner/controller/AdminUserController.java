package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.User;
import com.courseplanner.service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin User Management Controller
 * Handles CRUD operations for user management by admins
 */
@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    /**
     * GET /api/admin/users - Get all users with optional filters
     * Query params: role (STUDENT/ADMIN), status (ACTIVE/INACTIVE), search
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        try {
            List<User> users = adminUserService.getAllUsers(role, status, search);
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve users: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/users/{userId} - Get specific user details
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable String userId) {
        try {
            User user = adminUserService.getUserById(userId);
            return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT /api/admin/users/{userId}/status - Update user status (activate/deactivate)
     */
    @PutMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            User user = adminUserService.updateUserStatus(userId, newStatus);
            return ResponseEntity.ok(ApiResponse.success("User status updated successfully", user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/users/{userId}/role - Update user role
     */
    @PutMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        try {
            String newRole = request.get("role");
            User user = adminUserService.updateUserRole(userId, newRole);
            return ResponseEntity.ok(ApiResponse.success("User role updated successfully", user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * DELETE /api/admin/users/{userId} - Delete user (soft delete - set status to DELETED)
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable String userId) {
        try {
            adminUserService.deleteUser(userId);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", "User removed from system"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/admin/users/stats/summary - Get user statistics summary
     */
    @GetMapping("/stats/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStatsSummary() {
        try {
            Map<String, Object> stats = adminUserService.getUserStatsSummary();
            return ResponseEntity.ok(ApiResponse.success("User stats retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve stats: " + e.getMessage()));
        }
    }
}
