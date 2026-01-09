package com.courseplanner.service;

import com.courseplanner.model.Interest;
import com.courseplanner.repository.InterestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterestService {
    
    @Autowired
    private InterestRepository interestRepository;
    
    /**
     * Get all interests
     */
    public List<Interest> getAllInterests() {
        return interestRepository.findAllByOrderByOrderIndexAsc();
    }
    
    /**
     * Get all enabled interests
     */
    public List<Interest> getEnabledInterests() {
        return interestRepository.findByEnabledOrderByOrderIndexAsc(true);
    }
    
    /**
     * Get interest by ID
     */
    public Interest getInterestById(String id) {
        return interestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interest not found with id: " + id));
    }
    
    /**
     * Create new interest
     */
    public Interest createInterest(Interest interest) {
        // Check if name already exists
        if (interestRepository.findByName(interest.getName()).isPresent()) {
            throw new RuntimeException("Interest with name '" + interest.getName() + "' already exists");
        }
        return interestRepository.save(interest);
    }
    
    /**
     * Update interest
     */
    public Interest updateInterest(String id, Interest updatedInterest) {
        Interest existing = getInterestById(id);
        
        // Check if name is being changed and if new name already exists
        if (!existing.getName().equals(updatedInterest.getName())) {
            if (interestRepository.findByName(updatedInterest.getName()).isPresent()) {
                throw new RuntimeException("Interest with name '" + updatedInterest.getName() + "' already exists");
            }
        }
        
        existing.setName(updatedInterest.getName());
        existing.setDescription(updatedInterest.getDescription());
        existing.setIconUrl(updatedInterest.getIconUrl());
        existing.setEnabled(updatedInterest.isEnabled());
        existing.setOrderIndex(updatedInterest.getOrderIndex());
        existing.setUpdatedAt(LocalDateTime.now());
        
        return interestRepository.save(existing);
    }
    
    /**
     * Delete interest
     */
    public void deleteInterest(String id) {
        if (!interestRepository.existsById(id)) {
            throw new RuntimeException("Interest not found with id: " + id);
        }
        interestRepository.deleteById(id);
    }
    
    /**
     * Enable/Disable interest
     */
    public Interest toggleInterestStatus(String id, boolean enabled) {
        Interest interest = getInterestById(id);
        interest.setEnabled(enabled);
        interest.setUpdatedAt(LocalDateTime.now());
        return interestRepository.save(interest);
    }
    
    /**
     * Count total interests
     */
    public long countInterests() {
        return interestRepository.count();
    }
    
    /**
     * Count active (enabled) interests
     */
    public long countActiveInterests() {
        return interestRepository.findByEnabledOrderByOrderIndexAsc(true).size();
    }
}
