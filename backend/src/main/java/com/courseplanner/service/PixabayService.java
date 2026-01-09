package com.courseplanner.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;
import java.util.List;
import java.util.HashMap;

/**
 * Service to fetch course-related images from Pixabay API
 */
@Service
public class PixabayService {

    private static final String PIXABAY_API_KEY = "52863432-fa917db9e4be7736d2ed547a7";
    private static final String PIXABAY_API_URL = "https://pixabay.com/api/";
    
    private final RestTemplate restTemplate;

    public PixabayService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Fetch an image URL from Pixabay based on course name
     * 
     * @param courseName The name of the course to search for
     * @return Map containing courseName and imageUrl
     */
    public Map<String, String> getCourseImage(String courseName) {
        Map<String, String> result = new HashMap<>();
        result.put("courseName", courseName);
        
        try {
            // Extract keywords from course name for better search
            String searchQuery = extractKeywords(courseName);
            
            // Build Pixabay API request URL
            String url = UriComponentsBuilder.fromHttpUrl(PIXABAY_API_URL)
                    .queryParam("key", PIXABAY_API_KEY)
                    .queryParam("q", searchQuery)
                    .queryParam("image_type", "photo")
                    .queryParam("per_page", 3)
                    .queryParam("safesearch", "true")
                    .queryParam("orientation", "horizontal")
                    .toUriString();
            
            System.out.println("🔍 Searching Pixabay for: " + searchQuery);
            
            // Make API call to Pixabay
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("hits")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> hits = (List<Map<String, Object>>) response.get("hits");
                
                if (!hits.isEmpty()) {
                    // Get the first image's webformatURL (medium size, suitable for web)
                    Map<String, Object> firstImage = hits.get(0);
                    String imageUrl = (String) firstImage.get("webformatURL");
                    
                    result.put("imageUrl", imageUrl);
                    result.put("status", "success");
                    
                    // Optional: Include additional image metadata
                    result.put("imageId", String.valueOf(firstImage.get("id")));
                    result.put("tags", (String) firstImage.get("tags"));
                    result.put("user", (String) firstImage.get("user"));
                    
                    System.out.println("✅ Found image for: " + courseName);
                } else {
                    // No images found, return default placeholder
                    result.put("imageUrl", getDefaultPlaceholder(courseName));
                    result.put("status", "no_results");
                    System.out.println("⚠️ No images found for: " + courseName);
                }
            } else {
                result.put("imageUrl", getDefaultPlaceholder(courseName));
                result.put("status", "error");
                System.out.println("❌ Invalid response from Pixabay API");
            }
            
        } catch (RestClientException e) {
            System.err.println("❌ Error calling Pixabay API: " + e.getMessage());
            result.put("imageUrl", getDefaultPlaceholder(courseName));
            result.put("status", "error");
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    /**
     * Extract meaningful keywords from course name for better image search
     * Examples:
     * - "Introduction to Python Programming" -> "python programming"
     * - "Advanced Machine Learning" -> "machine learning"
     * - "Web Development with React" -> "react web development"
     */
    private String extractKeywords(String courseName) {
        // Remove common words
        String keywords = courseName.toLowerCase()
                .replaceAll("\\b(introduction|intro|to|advanced|beginner|intermediate|course|tutorial|guide|fundamentals|basics|with|for|and|the|a|an)\\b", "")
                .replaceAll("\\s+", " ")
                .trim();
        
        // If keywords are too short, use original course name
        if (keywords.length() < 3) {
            keywords = courseName.toLowerCase();
        }
        
        return keywords;
    }

    /**
     * Generate a placeholder image URL based on course category/name
     * Using a placeholder service like placeholder.com
     */
    private String getDefaultPlaceholder(String courseName) {
        // Extract first word as category
        String category = courseName.split("\\s+")[0];
        
        // Return a colored placeholder with text
        return String.format(
            "https://via.placeholder.com/800x450/6366f1/ffffff?text=%s",
            category.replaceAll(" ", "+")
        );
    }

    /**
     * Batch fetch images for multiple courses
     * 
     * @param courseNames List of course names
     * @return List of maps containing courseName and imageUrl
     */
    public List<Map<String, String>> getCourseImages(List<String> courseNames) {
        return courseNames.stream()
                .map(this::getCourseImage)
                .toList();
    }
}
