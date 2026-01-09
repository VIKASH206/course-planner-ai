package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.Module;
import com.courseplanner.model.UserProgress;
import com.courseplanner.service.ModuleService;
import com.courseplanner.service.ModuleService.ModuleWithProgress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Module management
 * Handles all module-related operations for courses
 */
@RestController
@RequestMapping("/api/modules")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class ModuleController {
    
    @Autowired
    private ModuleService moduleService;
    
    /**
     * GET /api/modules/course/{courseId} - Get all modules for a course
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<Module>>> getCourseModules(@PathVariable String courseId) {
        try {
            List<Module> modules = moduleService.getCourseModules(courseId);
            return ResponseEntity.ok(ApiResponse.success("Modules retrieved successfully", modules));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve modules: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/modules/course/{courseId}/user/{userId} - Get modules with user progress
     */
    @GetMapping("/course/{courseId}/user/{userId}")
    public ResponseEntity<ApiResponse<List<ModuleWithProgress>>> getModulesWithProgress(
            @PathVariable String courseId,
            @PathVariable String userId) {
        try {
            List<ModuleWithProgress> modules = moduleService.getModulesWithProgress(courseId, userId);
            return ResponseEntity.ok(ApiResponse.success("Modules with progress retrieved successfully", modules));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve modules: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/modules/{moduleId} - Get specific module
     */
    @GetMapping("/{moduleId}")
    public ResponseEntity<ApiResponse<Module>> getModule(@PathVariable String moduleId) {
        try {
            Module module = moduleService.getModuleById(moduleId);
            return ResponseEntity.ok(ApiResponse.success("Module retrieved successfully", module));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Module not found: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/modules/course/{courseId}/next/{userId} - Get next module for user
     */
    @GetMapping("/course/{courseId}/next/{userId}")
    public ResponseEntity<ApiResponse<Module>> getNextModule(
            @PathVariable String courseId,
            @PathVariable String userId) {
        try {
            Module nextModule = moduleService.getNextModule(courseId, userId);
            if (nextModule != null) {
                return ResponseEntity.ok(ApiResponse.success("Next module retrieved successfully", nextModule));
            } else {
                return ResponseEntity.ok(ApiResponse.success("No more modules available", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get next module: " + e.getMessage()));
        }
    }
    
    /**
     * POST /api/modules - Create new module
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Module>> createModule(@RequestBody Module module) {
        try {
            Module createdModule = moduleService.createModule(module);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Module created successfully", createdModule));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to create module: " + e.getMessage()));
        }
    }
    
    /**
     * PUT /api/modules/{moduleId} - Update module
     */
    @PutMapping("/{moduleId}")
    public ResponseEntity<ApiResponse<Module>> updateModule(
            @PathVariable String moduleId,
            @RequestBody Module module) {
        try {
            Module updatedModule = moduleService.updateModule(moduleId, module);
            return ResponseEntity.ok(ApiResponse.success("Module updated successfully", updatedModule));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Module not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to update module: " + e.getMessage()));
        }
    }
    
    /**
     * PUT /api/modules/{moduleId}/progress/{userId} - Update module progress
     */
    @PutMapping("/{moduleId}/progress/{userId}")
    public ResponseEntity<ApiResponse<UserProgress>> updateModuleProgress(
            @PathVariable String moduleId,
            @PathVariable String userId,
            @RequestParam int progress) {
        try {
            UserProgress updatedProgress = moduleService.updateModuleProgress(moduleId, userId, progress);
            return ResponseEntity.ok(ApiResponse.success("Progress updated successfully", updatedProgress));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to update progress: " + e.getMessage()));
        }
    }
    
    /**
     * PUT /api/modules/{moduleId}/complete/{userId} - Mark module as complete
     */
    @PutMapping("/{moduleId}/complete/{userId}")
    public ResponseEntity<ApiResponse<UserProgress>> completeModule(
            @PathVariable String moduleId,
            @PathVariable String userId) {
        try {
            UserProgress progress = moduleService.completeModule(moduleId, userId);
            return ResponseEntity.ok(ApiResponse.success("Module marked as complete", progress));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to complete module: " + e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/modules/{moduleId} - Delete module
     */
    @DeleteMapping("/{moduleId}")
    public ResponseEntity<ApiResponse<Void>> deleteModule(@PathVariable String moduleId) {
        try {
            moduleService.deleteModule(moduleId);
            return ResponseEntity.ok(ApiResponse.success("Module deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Module not found: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/modules/course/{courseId}/stats/{userId} - Get module statistics
     */
    @GetMapping("/course/{courseId}/stats/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getModuleStats(
            @PathVariable String courseId,
            @PathVariable String userId) {
        try {
            long totalModules = moduleService.getModuleCount(courseId);
            long completedModules = moduleService.getCompletedModulesCount(courseId, userId);
            
            Map<String, Object> stats = Map.of(
                "totalModules", totalModules,
                "completedModules", completedModules,
                "remainingModules", totalModules - completedModules,
                "completionPercentage", totalModules > 0 ? (completedModules * 100 / totalModules) : 0
            );
            
            return ResponseEntity.ok(ApiResponse.success("Module statistics retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve statistics: " + e.getMessage()));
        }
    }
}
