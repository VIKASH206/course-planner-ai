package com.courseplanner.repository;

import com.courseplanner.model.Badge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends MongoRepository<Badge, String> {
    
    /**
     * Find all active badges
     */
    List<Badge> findByIsActiveOrderByCreatedAtDesc(boolean isActive);
    
    /**
     * Convenience method to find active badges
     */
    default List<Badge> findByIsActiveTrue() {
        return findByIsActiveOrderByCreatedAtDesc(true);
    }
    
    /**
     * Find badges by category
     */
    List<Badge> findByCategoryAndIsActiveOrderByCreatedAtDesc(String category, boolean isActive);
    
    /**
     * Convenience method
     */
    default List<Badge> findByCategoryAndIsActiveTrue(String category) {
        return findByCategoryAndIsActiveOrderByCreatedAtDesc(category, true);
    }
    
    /**
     * Find badges by rarity
     */
    List<Badge> findByRarityAndIsActiveOrderByPointsDesc(String rarity, boolean isActive);
    
    /**
     * Convenience method
     */
    default List<Badge> findByRarityAndIsActiveTrue(String rarity) {
        return findByRarityAndIsActiveOrderByPointsDesc(rarity, true);
    }
    
    /**
     * Find badges by criteria type
     */
    List<Badge> findByCriteriaTypeAndIsActiveOrderByCreatedAtDesc(String criteriaType, boolean isActive);
    
    /**
     * Convenience method
     */
    default List<Badge> findByCriteriaTypeAndIsActiveTrue(String criteriaType) {
        return findByCriteriaTypeAndIsActiveOrderByCreatedAtDesc(criteriaType, true);
    }
    
    /**
     * Search badges by name or description
     */
    @Query("{ 'isActive': true, $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ] }")
    List<Badge> searchBadges(String searchTerm);
    
    /**
     * Find badges with criteria value less than or equal to given value
     */
    @Query("{ 'criteriaType': ?0, 'criteriaValue': { $lte: ?1 }, 'isActive': true }")
    List<Badge> findEligibleBadges(String criteriaType, int currentValue);
    
    /**
     * Count badges by category
     */
    long countByCategoryAndIsActive(String category, boolean isActive);
}