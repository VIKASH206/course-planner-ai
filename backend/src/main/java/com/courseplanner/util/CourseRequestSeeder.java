package com.courseplanner.util;

import com.courseplanner.model.CourseRequest;
import com.courseplanner.repository.CourseRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Database seeder for Course Requests
 * Populates the database with sample course requests for testing
 * 
 * ⚠️ ENABLED: This will seed sample course requests on first run
 */
@Component
public class CourseRequestSeeder implements CommandLineRunner {

    @Autowired
    private CourseRequestRepository courseRequestRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if collection is empty
        long existingCount = courseRequestRepository.count();
        if (existingCount > 0) {
            System.out.println("⏭️ Course requests already exist (" + existingCount + "), skipping seeding");
            return;
        }

        System.out.println("🌱 Seeding course requests database...");

        List<CourseRequest> requests = createSampleRequests();
        courseRequestRepository.saveAll(requests);

        System.out.println("✅ Successfully seeded " + requests.size() + " course requests!");
    }

    private List<CourseRequest> createSampleRequests() {
        return Arrays.asList(
            createRequest("Blockchain Development", "Beginner", 15, "Pending", 2),
            createRequest("Quantum Computing Basics", "Advanced", 8, "Pending", 5),
            createRequest("Cybersecurity Fundamentals", "Intermediate", 23, "Planned", 1),
            createRequest("Game Development with Unity", "Beginner", 31, "Pending", 3),
            createRequest("iOS App Development", "Intermediate", 12, "Planned", 4),
            createRequest("Docker and Kubernetes", "Advanced", 19, "Pending", 6),
            createRequest("Vue.js Framework", "Beginner", 27, "Planned", 2),
            createRequest("GraphQL APIs", "Intermediate", 14, "Pending", 7),
            createRequest("Rust Programming", "Advanced", 9, "Pending", 10),
            createRequest("Cloud Architecture", "Intermediate", 21, "Planned", 3)
        );
    }

    private CourseRequest createRequest(String interest, String level, int requestedBy, String status, int daysAgo) {
        CourseRequest request = new CourseRequest(interest, level);
        request.setRequestedBy(requestedBy);
        request.setStatus(status);
        request.setLastRequestedDate(LocalDateTime.now().minusDays(daysAgo));
        request.setCreatedAt(LocalDateTime.now().minusDays(daysAgo + 5));
        return request;
    }
}
