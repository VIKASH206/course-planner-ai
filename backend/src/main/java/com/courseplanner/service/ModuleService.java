package com.courseplanner.service;

import com.courseplanner.model.Module;
import com.courseplanner.model.UserProgress;
import com.courseplanner.repository.ModuleRepository;
import com.courseplanner.repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Module operations
 * Handles business logic for course modules
 */
@Service
public class ModuleService {
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    /**
     * Get all modules for a course
     */
    public List<Module> getCourseModules(String courseId) {
        return moduleRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
    }
    
    /**
     * Get modules with user progress information
     */
    public List<ModuleWithProgress> getModulesWithProgress(String courseId, String userId) {
        List<Module> modules = getCourseModules(courseId);
        
        return modules.stream().map(module -> {
            // Get progress for this module
            UserProgress progress = userProgressRepository
                .findByUserIdAndCourseIdAndModuleId(userId, courseId, module.getId())
                .orElse(null);
            
            ModuleWithProgress mwp = new ModuleWithProgress();
            mwp.setModule(module);
            mwp.setProgress(progress != null ? progress.getProgressPercentage() : 0);
            mwp.setCompleted(progress != null && progress.isCompleted());
            mwp.setTimeSpentMinutes(progress != null ? progress.getTimeSpentMinutes() : 0);
            
            return mwp;
        }).collect(Collectors.toList());
    }
    
    /**
     * Get a specific module by ID
     */
    public Module getModuleById(String moduleId) {
        return moduleRepository.findById(moduleId)
            .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));
    }
    
    /**
     * Create a new module
     */
    public Module createModule(Module module) {
        module.setCreatedAt(LocalDateTime.now());
        module.setUpdatedAt(LocalDateTime.now());
        return moduleRepository.save(module);
    }
    
    /**
     * Update an existing module
     */
    public Module updateModule(String moduleId, Module updatedModule) {
        Module existingModule = getModuleById(moduleId);
        
        // Update fields
        if (updatedModule.getTitle() != null) {
            existingModule.setTitle(updatedModule.getTitle());
        }
        if (updatedModule.getDescription() != null) {
            existingModule.setDescription(updatedModule.getDescription());
        }
        if (updatedModule.getOrderIndex() > 0) {
            existingModule.setOrderIndex(updatedModule.getOrderIndex());
        }
        if (updatedModule.getVideoUrl() != null) {
            existingModule.setVideoUrl(updatedModule.getVideoUrl());
        }
        if (updatedModule.getThumbnailUrl() != null) {
            existingModule.setThumbnailUrl(updatedModule.getThumbnailUrl());
        }
        if (updatedModule.getDurationMinutes() > 0) {
            existingModule.setDurationMinutes(updatedModule.getDurationMinutes());
        }
        if (updatedModule.getLearningObjectives() != null && !updatedModule.getLearningObjectives().isEmpty()) {
            existingModule.setLearningObjectives(updatedModule.getLearningObjectives());
        }
        if (updatedModule.getResources() != null && !updatedModule.getResources().isEmpty()) {
            existingModule.setResources(updatedModule.getResources());
        }
        
        existingModule.setLocked(updatedModule.isLocked());
        existingModule.setUpdatedAt(LocalDateTime.now());
        
        return moduleRepository.save(existingModule);
    }
    
    /**
     * Delete a module
     */
    public void deleteModule(String moduleId) {
        Module module = getModuleById(moduleId);
        moduleRepository.delete(module);
    }
    
    /**
     * Get next module for user to study
     * Returns the first incomplete module or the next locked module
     */
    public Module getNextModule(String courseId, String userId) {
        List<ModuleWithProgress> modules = getModulesWithProgress(courseId, userId);
        
        // Find first incomplete, unlocked module
        for (ModuleWithProgress mwp : modules) {
            if (!mwp.isCompleted() && !mwp.getModule().isLocked()) {
                return mwp.getModule();
            }
        }
        
        // All modules completed or all remaining are locked
        return !modules.isEmpty() ? modules.get(modules.size() - 1).getModule() : null;
    }
    
    /**
     * Update module progress for a user
     */
    public UserProgress updateModuleProgress(String moduleId, String userId, int progressPercentage) {
        Module module = getModuleById(moduleId);
        
        UserProgress progress = userProgressRepository
            .findByUserIdAndCourseIdAndModuleId(userId, module.getCourseId(), moduleId)
            .orElse(new UserProgress(userId, module.getCourseId(), moduleId));
        
        progress.setProgressPercentage(progressPercentage);
        progress.setLastAccessedAt(LocalDateTime.now());
        progress.setUpdatedAt(LocalDateTime.now());
        
        if (progressPercentage >= 100) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
        }
        
        return userProgressRepository.save(progress);
    }
    
    /**
     * Mark module as complete
     */
    public UserProgress completeModule(String moduleId, String userId) {
        return updateModuleProgress(moduleId, userId, 100);
    }
    
    /**
     * Count total modules in a course
     */
    public long getModuleCount(String courseId) {
        return moduleRepository.countByCourseId(courseId);
    }
    
    /**
     * Get completed modules count for user
     */
    public long getCompletedModulesCount(String courseId, String userId) {
        List<ModuleWithProgress> modules = getModulesWithProgress(courseId, userId);
        return modules.stream().filter(ModuleWithProgress::isCompleted).count();
    }
    
    /**
     * Inner class to combine Module with Progress
     */
    public static class ModuleWithProgress {
        private Module module;
        private int progress;
        private boolean completed;
        private int timeSpentMinutes;
        
        public Module getModule() { return module; }
        public void setModule(Module module) { this.module = module; }
        
        public int getProgress() { return progress; }
        public void setProgress(int progress) { this.progress = progress; }
        
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
        
        public int getTimeSpentMinutes() { return timeSpentMinutes; }
        public void setTimeSpentMinutes(int timeSpentMinutes) { this.timeSpentMinutes = timeSpentMinutes; }
    }
}
