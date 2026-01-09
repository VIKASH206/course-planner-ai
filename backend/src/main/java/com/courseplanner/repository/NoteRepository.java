package com.courseplanner.repository;

import com.courseplanner.model.Note;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for Note entity
 * Provides database operations for student notes
 */
@Repository
public interface NoteRepository extends MongoRepository<Note, String> {
    
    /**
     * Find all notes for a user in a course
     */
    List<Note> findByUserIdAndCourseIdOrderByUpdatedAtDesc(String userId, String courseId);
    
    /**
     * Find all notes for a user
     */
    List<Note> findByUserIdOrderByUpdatedAtDesc(String userId);
    
    /**
     * Find pinned notes for a user in a course
     */
    List<Note> findByUserIdAndCourseIdAndIsPinnedOrderByUpdatedAtDesc(String userId, String courseId, boolean isPinned);
    
    /**
     * Find notes by module
     */
    List<Note> findByUserIdAndModuleIdOrderByUpdatedAtDesc(String userId, String moduleId);
    
    /**
     * Find notes by topic
     */
    List<Note> findByUserIdAndTopicIdOrderByUpdatedAtDesc(String userId, String topicId);
    
    /**
     * Find notes by tags
     */
    List<Note> findByUserIdAndTagsContainingOrderByUpdatedAtDesc(String userId, String tag);
    
    /**
     * Find shared notes in a course
     */
    List<Note> findByCourseIdAndIsSharedOrderByUpdatedAtDesc(String courseId, boolean isShared);
    
    /**
     * Count notes by user and course
     */
    long countByUserIdAndCourseId(String userId, String courseId);
    
    /**
     * Delete all notes for a course by user
     */
    void deleteByUserIdAndCourseId(String userId, String courseId);
}
