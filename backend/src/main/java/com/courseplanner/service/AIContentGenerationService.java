package com.courseplanner.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI-powered service to automatically generate course content
 * Generates descriptions, tags, and image URLs based on course title and category
 */
@Service
public class AIContentGenerationService {

    // Category-based keywords for intelligent tag generation
    private static final Map<String, List<String>> CATEGORY_KEYWORDS = new HashMap<>() {{
        put("Programming", Arrays.asList("coding", "software", "development", "algorithms", "programming", "code", "syntax", "debugging"));
        put("Web Development", Arrays.asList("html", "css", "javascript", "frontend", "backend", "web", "responsive", "api", "rest"));
        put("Mobile Development", Arrays.asList("mobile", "android", "ios", "app", "swift", "kotlin", "react-native", "flutter"));
        put("Data Science", Arrays.asList("data", "analysis", "statistics", "visualization", "pandas", "numpy", "analytics", "insights"));
        put("Machine Learning", Arrays.asList("ml", "model", "training", "prediction", "neural", "classification", "regression", "supervised"));
        put("AI", Arrays.asList("artificial-intelligence", "deep-learning", "nlp", "computer-vision", "ai", "neural-networks", "tensorflow"));
        put("Artificial Intelligence", Arrays.asList("ai", "intelligent-systems", "automation", "cognitive", "neural", "deep-learning"));
        put("DevOps", Arrays.asList("devops", "ci-cd", "jenkins", "docker", "kubernetes", "deployment", "automation", "infrastructure"));
        put("Cloud Computing", Arrays.asList("cloud", "aws", "azure", "gcp", "serverless", "scalability", "iaas", "paas", "saas"));
        put("Cybersecurity", Arrays.asList("security", "encryption", "penetration-testing", "firewall", "threats", "vulnerabilities", "hacking"));
        put("Design", Arrays.asList("design", "ui", "ux", "figma", "adobe", "graphics", "visual", "creative", "prototyping"));
        put("Business", Arrays.asList("business", "management", "strategy", "entrepreneurship", "leadership", "finance", "marketing"));
        put("Database", Arrays.asList("database", "sql", "nosql", "mongodb", "postgresql", "queries", "data-modeling", "schema"));
        put("Networking", Arrays.asList("networking", "tcp-ip", "routing", "protocols", "cisco", "network-security", "lan", "wan"));
        put("Game Development", Arrays.asList("game", "unity", "unreal", "3d", "gaming", "graphics", "physics", "gameplay"));
        put("Blockchain", Arrays.asList("blockchain", "cryptocurrency", "smart-contracts", "ethereum", "bitcoin", "decentralized", "web3"));
        put("Technology", Arrays.asList("technology", "innovation", "digital", "computing", "tech", "systems", "software"));
    }};

    // Description templates for different categories
    private static final Map<String, List<String>> DESCRIPTION_TEMPLATES = new HashMap<>() {{
        put("Programming", Arrays.asList(
            "Master the fundamentals of {topic} with hands-on projects and real-world applications.",
            "Learn {topic} from scratch with comprehensive tutorials and practical exercises.",
            "Dive deep into {topic} and build professional-grade applications.",
            "Comprehensive guide to {topic} covering essential concepts and advanced techniques."
        ));
        put("Web Development", Arrays.asList(
            "Build modern, responsive websites using {topic} with industry best practices.",
            "Create stunning web applications with {topic} and cutting-edge technologies.",
            "Master {topic} to develop professional web solutions from frontend to backend.",
            "Learn to design and deploy scalable web applications using {topic}."
        ));
        put("Data Science", Arrays.asList(
            "Unlock insights from data using {topic} and advanced analytics techniques.",
            "Master data analysis and visualization with {topic} for data-driven decisions.",
            "Learn {topic} to transform raw data into actionable business intelligence.",
            "Comprehensive {topic} course for aspiring data scientists and analysts."
        ));
        put("Machine Learning", Arrays.asList(
            "Build intelligent systems with {topic} and machine learning algorithms.",
            "Master {topic} to create predictive models and AI-powered applications.",
            "Learn {topic} fundamentals and deploy production-ready ML models.",
            "Comprehensive guide to {topic} from theory to practical implementation."
        ));
        put("Business", Arrays.asList(
            "Develop essential {topic} skills to excel in modern business environments.",
            "Master {topic} strategies to grow your business and career.",
            "Learn practical {topic} techniques used by successful entrepreneurs.",
            "Comprehensive {topic} course for business professionals and leaders."
        ));
    }};

    /**
     * Generate AI-powered course description based on title and category
     */
    public String generateDescription(String title, String category) {
        // Get templates for category, fallback to generic if not found
        List<String> templates = DESCRIPTION_TEMPLATES.getOrDefault(
            category, 
            DESCRIPTION_TEMPLATES.get("Programming")
        );
        
        // Randomly select a template
        String template = templates.get(new Random().nextInt(templates.size()));
        
        // Extract topic from title (remove common words like "for Beginners", "Advanced", etc.)
        String topic = extractTopicFromTitle(title);
        
        // Replace placeholder with actual topic
        String description = template.replace("{topic}", topic);
        
        // Add difficulty-specific ending
        if (title.toLowerCase().contains("beginner") || title.toLowerCase().contains("introduction")) {
            description += " Perfect for beginners with no prior experience.";
        } else if (title.toLowerCase().contains("advanced") || title.toLowerCase().contains("expert")) {
            description += " Designed for experienced professionals looking to advance their skills.";
        } else {
            description += " Suitable for learners at all levels.";
        }
        
        return description;
    }

    /**
     * Generate AI-powered tags based on title and category
     */
    public List<String> generateTags(String title, String category) {
        List<String> tags = new ArrayList<>();
        
        // Add category-specific keywords
        List<String> categoryKeywords = CATEGORY_KEYWORDS.getOrDefault(category, new ArrayList<>());
        
        // Find relevant keywords from title
        String titleLower = title.toLowerCase();
        for (String keyword : categoryKeywords) {
            if (titleLower.contains(keyword.replace("-", " ")) || 
                titleLower.contains(keyword.replace("-", ""))) {
                tags.add(keyword);
            }
        }
        
        // Add difficulty level tag
        if (titleLower.contains("beginner") || titleLower.contains("introduction")) {
            tags.add("beginner-friendly");
        } else if (titleLower.contains("advanced")) {
            tags.add("advanced");
        } else if (titleLower.contains("intermediate")) {
            tags.add("intermediate");
        }
        
        // Add language/technology specific tags from title
        String[] titleWords = title.split("\\s+");
        for (String word : titleWords) {
            String cleanWord = word.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
            if (cleanWord.length() > 2 && !isCommonWord(cleanWord)) {
                tags.add(cleanWord);
            }
        }
        
        // Always add the category as a tag
        tags.add(category.toLowerCase().replace(" ", "-"));
        
        // Add trending tags
        tags.add("popular");
        tags.add("hands-on");
        
        // Remove duplicates and limit to 10 tags
        return tags.stream()
                .distinct()
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * Generate smart image URL based on category
     * Returns gradient background configuration
     */
    public String generateImageUrl(String category) {
        // Map categories to gradient identifiers
        Map<String, String> categoryGradients = new HashMap<>() {{
            put("Programming", "gradient-purple");
            put("Web Development", "gradient-pink");
            put("Mobile Development", "gradient-blue");
            put("Data Science", "gradient-green");
            put("Machine Learning", "gradient-orange");
            put("AI", "gradient-cyan");
            put("Artificial Intelligence", "gradient-teal");
            put("DevOps", "gradient-rose");
            put("Cloud Computing", "gradient-peach");
            put("Cybersecurity", "gradient-red");
            put("Design", "gradient-lavender");
            put("Business", "gradient-pink-light");
            put("Database", "gradient-blue-light");
            put("Networking", "gradient-yellow");
            put("Game Development", "gradient-orange-red");
            put("Blockchain", "gradient-gold");
            put("Technology", "gradient-purple-light");
        }};
        
        return categoryGradients.getOrDefault(category, "gradient-purple");
    }

    /**
     * Generate emoji icon based on category
     */
    public String generateEmoji(String category) {
        Map<String, String> categoryEmojis = new HashMap<>() {{
            put("Programming", "💻");
            put("Web Development", "🌐");
            put("Mobile Development", "📱");
            put("Data Science", "📊");
            put("Machine Learning", "🤖");
            put("AI", "🧠");
            put("Artificial Intelligence", "🧠");
            put("DevOps", "⚙️");
            put("Cloud Computing", "☁️");
            put("Cybersecurity", "🔒");
            put("Design", "🎨");
            put("Business", "💼");
            put("Database", "🗄️");
            put("Networking", "🌐");
            put("Game Development", "🎮");
            put("Blockchain", "⛓️");
            put("Technology", "🔧");
        }};
        
        return categoryEmojis.getOrDefault(category, "📚");
    }

    /**
     * Extract main topic from course title
     */
    private String extractTopicFromTitle(String title) {
        // Remove common filler words
        String[] fillerWords = {"for", "beginners", "advanced", "complete", "introduction", 
                               "to", "guide", "course", "the", "a", "an", "and"};
        
        String topic = title;
        for (String word : fillerWords) {
            topic = topic.replaceAll("(?i)\\b" + word + "\\b", "");
        }
        
        return topic.trim().replaceAll("\\s+", " ");
    }

    /**
     * Check if word is common and should be filtered
     */
    private boolean isCommonWord(String word) {
        Set<String> commonWords = new HashSet<>(Arrays.asList(
            "the", "and", "for", "with", "from", "into", "that", "this", "your",
            "will", "can", "how", "what", "when", "where", "why", "who", "course"
        ));
        return commonWords.contains(word);
    }

    /**
     * Complete AI enhancement - generates all content at once
     */
    public Map<String, Object> enhanceCourse(String title, String category) {
        Map<String, Object> enhancement = new HashMap<>();
        
        enhancement.put("description", generateDescription(title, category));
        enhancement.put("tags", generateTags(title, category));
        enhancement.put("imageUrl", generateImageUrl(category));
        enhancement.put("emoji", generateEmoji(category));
        enhancement.put("aiGenerated", true);
        enhancement.put("timestamp", new Date());
        
        return enhancement;
    }
}
