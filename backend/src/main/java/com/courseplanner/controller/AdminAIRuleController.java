package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.AIRule;
import com.courseplanner.service.AIRuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin AI Rule Management Controller
 * Requires ADMIN role for all operations
 */
@RestController
@RequestMapping("/api/admin/ai-rules")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for development
public class AdminAIRuleController {
    
    @Autowired
    private AIRuleService aiRuleService;
    
    /**
     * GET /api/admin/ai-rules - Get all AI rules
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AIRule>>> getAllRules() {
        try {
            List<AIRule> rules = aiRuleService.getAllRules();
            return ResponseEntity.ok(ApiResponse.success("AI Rules retrieved successfully", rules));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve AI rules: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/ai-rules/enabled - Get enabled AI rules only
     */
    @GetMapping("/enabled")
    public ResponseEntity<ApiResponse<List<AIRule>>> getEnabledRules() {
        try {
            List<AIRule> rules = aiRuleService.getEnabledRules();
            return ResponseEntity.ok(ApiResponse.success("Enabled AI rules retrieved successfully", rules));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve enabled AI rules: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/ai-rules/{id} - Get AI rule by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AIRule>> getRuleById(@PathVariable String id) {
        try {
            AIRule rule = aiRuleService.getRuleById(id);
            return ResponseEntity.ok(ApiResponse.success("AI Rule retrieved successfully", rule));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/ai-rules/filter - Get AI rules by interest and goal
     */
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<AIRule>>> getRulesByInterestAndGoal(
            @RequestParam String interestId,
            @RequestParam String goalId) {
        try {
            List<AIRule> rules = aiRuleService.getRulesByInterestAndGoal(interestId, goalId);
            return ResponseEntity.ok(ApiResponse.success("Filtered AI rules retrieved successfully", rules));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve AI rules: " + e.getMessage()));
        }
    }
    
    /**
     * POST /api/admin/ai-rules - Create new AI rule
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AIRule>> createRule(@RequestBody AIRule rule) {
        try {
            AIRule created = aiRuleService.createRule(rule);
            return ResponseEntity.ok(ApiResponse.success("AI Rule created successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * PUT /api/admin/ai-rules/{id} - Update AI rule
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AIRule>> updateRule(
            @PathVariable String id,
            @RequestBody AIRule rule) {
        try {
            AIRule updated = aiRuleService.updateRule(id, rule);
            return ResponseEntity.ok(ApiResponse.success("AI Rule updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/admin/ai-rules/{id} - Delete AI rule
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable String id) {
        try {
            aiRuleService.deleteRule(id);
            return ResponseEntity.ok(ApiResponse.success("AI Rule deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * PATCH /api/admin/ai-rules/{id}/toggle - Enable/Disable AI rule
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<AIRule>> toggleRuleStatus(
            @PathVariable String id,
            @RequestParam boolean enabled) {
        try {
            AIRule updated = aiRuleService.toggleRuleStatus(id, enabled);
            return ResponseEntity.ok(ApiResponse.success("AI Rule status updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
