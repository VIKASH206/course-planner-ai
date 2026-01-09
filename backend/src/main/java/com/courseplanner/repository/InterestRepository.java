package com.courseplanner.repository;

import com.courseplanner.model.Interest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterestRepository extends MongoRepository<Interest, String> {
    Optional<Interest> findByName(String name);
    List<Interest> findByEnabledOrderByOrderIndexAsc(boolean enabled);
    List<Interest> findAllByOrderByOrderIndexAsc();
    
    // Count interests by enabled status
    long countByEnabled(boolean enabled);
    
    // Find interests by enabled status
    List<Interest> findByEnabled(boolean enabled);
}
