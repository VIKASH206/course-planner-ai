package com.courseplanner.service;

import com.courseplanner.model.Subject;
import com.courseplanner.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubjectService {
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    /**
     * Get all subjects
     */
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAllByOrderByRoadmapOrderAsc();
    }
    
    /**
     * Get all enabled subjects
     */
    public List<Subject> getEnabledSubjects() {
        return subjectRepository.findByEnabledOrderByRoadmapOrderAsc(true);
    }
    
    /**
     * Get subject by ID
     */
    public Subject getSubjectById(String id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
    }
    
    /**
     * Get subjects by interest ID
     */
    public List<Subject> getSubjectsByInterestId(String interestId) {
        return subjectRepository.findByInterestId(interestId);
    }
    
    /**
     * Get subjects by goal ID
     */
    public List<Subject> getSubjectsByGoalId(String goalId) {
        return subjectRepository.findByGoalId(goalId);
    }
    
    /**
     * Get subjects by interest and goal
     */
    public List<Subject> getSubjectsByInterestAndGoal(String interestId, String goalId) {
        return subjectRepository.findByInterestIdAndGoalIdOrderByRoadmapOrderAsc(interestId, goalId);
    }
    
    /**
     * Get subjects by difficulty level
     */
    public List<Subject> getSubjectsByDifficulty(String difficultyLevel) {
        return subjectRepository.findByDifficultyLevel(difficultyLevel);
    }
    
    /**
     * Create new subject
     */
    public Subject createSubject(Subject subject) {
        return subjectRepository.save(subject);
    }
    
    /**
     * Update subject
     */
    public Subject updateSubject(String id, Subject updatedSubject) {
        Subject existing = getSubjectById(id);
        
        existing.setName(updatedSubject.getName());
        existing.setDescription(updatedSubject.getDescription());
        existing.setInterestId(updatedSubject.getInterestId());
        existing.setGoalId(updatedSubject.getGoalId());
        existing.setDifficultyLevel(updatedSubject.getDifficultyLevel());
        existing.setDurationWeeks(updatedSubject.getDurationWeeks());
        existing.setPrerequisites(updatedSubject.getPrerequisites());
        existing.setRoadmapOrder(updatedSubject.getRoadmapOrder());
        existing.setThumbnailUrl(updatedSubject.getThumbnailUrl());
        existing.setEnabled(updatedSubject.isEnabled());
        existing.setInstructor(updatedSubject.getInstructor());
        existing.setEstimatedHours(updatedSubject.getEstimatedHours());
        existing.setTags(updatedSubject.getTags());
        existing.setUpdatedAt(LocalDateTime.now());
        
        return subjectRepository.save(existing);
    }
    
    /**
     * Delete subject
     */
    public void deleteSubject(String id) {
        if (!subjectRepository.existsById(id)) {
            throw new RuntimeException("Subject not found with id: " + id);
        }
        subjectRepository.deleteById(id);
    }
    
    /**
     * Enable/Disable subject
     */
    public Subject toggleSubjectStatus(String id, boolean enabled) {
        Subject subject = getSubjectById(id);
        subject.setEnabled(enabled);
        subject.setUpdatedAt(LocalDateTime.now());
        return subjectRepository.save(subject);
    }
    
    /**
     * Count total subjects
     */
    public long countSubjects() {
        return subjectRepository.count();
    }
}
