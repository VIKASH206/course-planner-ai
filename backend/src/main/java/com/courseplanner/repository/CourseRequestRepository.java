package com.courseplanner.repository;

import com.courseplanner.model.CourseRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRequestRepository extends MongoRepository<CourseRequest, String> {
    
    // Find by status
    List<CourseRequest> findByStatus(String status);
    
    // Find by level
    List<CourseRequest> findByLevel(String level);
    
    // Find by status and level
    List<CourseRequest> findByStatusAndLevel(String status, String level);
    
    // Find by interest (case insensitive)
    Optional<CourseRequest> findByInterestIgnoreCase(String interest);
    
    // Find by interest and level
    Optional<CourseRequest> findByInterestIgnoreCaseAndLevel(String interest, String level);
    
    // Order by requestedBy count (most requested first)
    List<CourseRequest> findAllByOrderByRequestedByDesc();
    
    // Order by lastRequestedDate (most recent first)
    List<CourseRequest> findAllByOrderByLastRequestedDateDesc();
}
