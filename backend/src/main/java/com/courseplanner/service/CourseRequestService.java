package com.courseplanner.service;

import com.courseplanner.model.CourseRequest;
import com.courseplanner.repository.CourseRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CourseRequestService {

    @Autowired
    private CourseRequestRepository courseRequestRepository;

    /**
     * Get all course requests
     */
    public List<CourseRequest> getAllCourseRequests() {
        List<CourseRequest> requests = courseRequestRepository.findAll();
        // Ensure all requests have a valid status (fix for old records)
        requests.forEach(request -> {
            if (request.getStatus() == null || request.getStatus().isEmpty()) {
                request.setStatus("Pending");
                courseRequestRepository.save(request);
            }
        });
        return requests;
    }

    /**
     * Get course request by ID
     */
    public CourseRequest getCourseRequestById(String id) {
        return courseRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course request not found with id: " + id));
    }

    /**
     * Get course requests by status
     */
    public List<CourseRequest> getCourseRequestsByStatus(String status) {
        return courseRequestRepository.findByStatus(status);
    }

    /**
     * Get course requests by level
     */
    public List<CourseRequest> getCourseRequestsByLevel(String level) {
        return courseRequestRepository.findByLevel(level);
    }

    /**
     * Get course requests by status and level
     */
    public List<CourseRequest> getCourseRequestsByStatusAndLevel(String status, String level) {
        return courseRequestRepository.findByStatusAndLevel(status, level);
    }

    /**
     * Get most requested courses
     */
    public List<CourseRequest> getMostRequestedCourses() {
        return courseRequestRepository.findAllByOrderByRequestedByDesc();
    }

    /**
     * Get recently requested courses
     */
    public List<CourseRequest> getRecentlyRequestedCourses() {
        return courseRequestRepository.findAllByOrderByLastRequestedDateDesc();
    }

    /**
     * Create a new course request or increment count if exists
     */
    public CourseRequest createOrIncrementCourseRequest(String interest, String level) {
        Optional<CourseRequest> existing = courseRequestRepository
                .findByInterestIgnoreCaseAndLevel(interest, level);
        
        if (existing.isPresent()) {
            // Request already exists, increment count
            CourseRequest request = existing.get();
            request.incrementRequestCount();
            return courseRequestRepository.save(request);
        } else {
            // New request
            CourseRequest newRequest = new CourseRequest(interest, level);
            newRequest.setRequestedBy(1);
            return courseRequestRepository.save(newRequest);
        }
    }

    /**
     * Update course request status
     */
    public CourseRequest updateStatus(String id, String status) {
        CourseRequest request = getCourseRequestById(id);
        request.setStatus(status);
        return courseRequestRepository.save(request);
    }

    /**
     * Mark as planned (In Progress)
     */
    public CourseRequest markAsPlanned(String id) {
        return updateStatus(id, "In Progress");
    }

    /**
     * Mark as ready
     */
    public CourseRequest markAsReady(String id) {
        return updateStatus(id, "Ready");
    }

    /**
     * Mark as pending
     */
    public CourseRequest markAsPending(String id) {
        return updateStatus(id, "Pending");
    }

    /**
     * Save course request
     */
    public CourseRequest saveCourseRequest(CourseRequest request) {
        return courseRequestRepository.save(request);
    }

    /**
     * Update course request
     */
    public CourseRequest updateCourseRequest(String id, CourseRequest updatedRequest) {
        CourseRequest existingRequest = getCourseRequestById(id);
        
        if (updatedRequest.getInterest() != null) {
            existingRequest.setInterest(updatedRequest.getInterest());
        }
        if (updatedRequest.getLevel() != null) {
            existingRequest.setLevel(updatedRequest.getLevel());
        }
        if (updatedRequest.getStatus() != null) {
            existingRequest.setStatus(updatedRequest.getStatus());
        }
        
        existingRequest.setUpdatedAt(LocalDateTime.now());
        return courseRequestRepository.save(existingRequest);
    }

    /**
     * Delete course request
     */
    public void deleteCourseRequest(String id) {
        CourseRequest request = getCourseRequestById(id);
        courseRequestRepository.delete(request);
    }

    /**
     * Get statistics
     */
    public CourseRequestStats getStatistics() {
        List<CourseRequest> allRequests = getAllCourseRequests();
        
        long totalRequests = allRequests.size();
        long pendingCount = allRequests.stream()
                .filter(r -> "Pending".equals(r.getStatus()))
                .count();
        long inProgressCount = allRequests.stream()
                .filter(r -> "In Progress".equals(r.getStatus()))
                .count();
        long readyCount = allRequests.stream()
                .filter(r -> "Ready".equals(r.getStatus()))
                .count();
        int totalUsers = allRequests.stream()
                .mapToInt(CourseRequest::getRequestedBy)
                .sum();
        
        return new CourseRequestStats(totalRequests, pendingCount, inProgressCount, readyCount, totalUsers);
    }

    /**
     * Inner class for statistics
     */
    public static class CourseRequestStats {
        private long totalRequests;
        private long pendingCount;
        private long inProgressCount;
        private long readyCount;
        private int totalUsers;

        public CourseRequestStats(long totalRequests, long pendingCount, long inProgressCount, long readyCount, int totalUsers) {
            this.totalRequests = totalRequests;
            this.pendingCount = pendingCount;
            this.inProgressCount = inProgressCount;
            this.readyCount = readyCount;
            this.totalUsers = totalUsers;
        }

        // Getters
        public long getTotalRequests() {
            return totalRequests;
        }

        public long getPendingCount() {
            return pendingCount;
        }

        public long getInProgressCount() {
            return inProgressCount;
        }

        public long getReadyCount() {
            return readyCount;
        }

        public long getPlannedCount() {
            return inProgressCount; // For backward compatibility
        }

        public int getTotalUsers() {
            return totalUsers;
        }
    }
}
