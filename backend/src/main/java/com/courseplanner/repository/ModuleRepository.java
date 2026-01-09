package com.courseplanner.repository;

import com.courseplanner.model.Module;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for Module entity
 * Provides database operations for course modules
 */
@Repository
public interface ModuleRepository extends MongoRepository<Module, String> {
    
    /**
     * Find all modules for a specific course, ordered by their sequence
     */
    List<Module> findByCourseIdOrderByOrderIndexAsc(String courseId);
    
    /**
     * Find unlocked modules for a course
     */
    List<Module> findByCourseIdAndIsLockedOrderByOrderIndexAsc(String courseId, boolean isLocked);
    
    /**
     * Count total modules in a course
     */
    long countByCourseId(String courseId);
    
    /**
     * Find modules by creator
     */
    List<Module> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    
    /**
     * Find a specific module by course and order
     */
    Module findByCourseIdAndOrderIndex(String courseId, int orderIndex);
    
    /**
     * Delete all modules for a course
     */
    void deleteByCourseId(String courseId);
}
