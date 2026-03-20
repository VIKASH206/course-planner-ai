package com.courseplanner.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.courseplanner.model.Course;
import com.courseplanner.model.Task;
import com.courseplanner.model.User;
import com.courseplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${groq.api.key:${GROQ_API_KEY:}}")
    private String apiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Value("${groq.api.model:llama-3.3-70b-versatile}")
    private String model;

    private final WebClient webClient;
    
    @Autowired
    private UserRepository userRepository;

    public GeminiService() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024)) // 2MB
                .build();
    }

    /**
     * Generate study path suggestions based on courses
     */
    public String generateStudyPath(List<Course> courses) {
        StringBuilder coursesInfo = new StringBuilder();
        coursesInfo.append("I have the following courses to study:\n");
        
        for (Course course : courses) {
            coursesInfo.append("- ").append(course.getTitle())
                      .append(" (").append(course.getDifficulty()).append(")")
                      .append(" - Progress: ").append(course.getProgressPercentage()).append("%")
                      .append(" - Category: ").append(course.getCategory()).append("\n");
        }
        
        coursesInfo.append("\nPlease suggest an optimal study path order considering difficulty levels, prerequisites, and current progress. Provide a structured learning plan with reasoning for the order.");

        return callGeminiAPI(coursesInfo.toString());
    }

    /**
     * Summarize course content or notes
     */
    public String summarizeContent(String content) {
        String prompt = "Please provide a concise summary of the following educational content. " +
                       "Focus on key concepts, main ideas, and important points:\n\n" + content;
        
        return callGeminiAPI(prompt);
    }

    /**
     * Generate quiz questions from content
     */
    public String generateQuiz(String content, int numberOfQuestions) {
        String prompt = "Based on the following educational content, generate " + numberOfQuestions + 
                       " multiple choice questions (MCQs). Each question should have 4 options with one correct answer. " +
                       "Format the output clearly with question numbers, options labeled A-D, and indicate the correct answer:\n\n" + 
                       content;
        
        return callGeminiAPI(prompt);
    }

    /**
     * Predict upcoming or missed tasks based on user patterns
     */
    public String generateSmartReminders(List<Task> recentTasks, List<Task> upcomingTasks) {
        StringBuilder taskInfo = new StringBuilder();
        taskInfo.append("Based on the following task patterns, provide smart reminders and suggestions:\n\n");
        
        taskInfo.append("Recent completed tasks:\n");
        for (Task task : recentTasks) {
            taskInfo.append("- ").append(task.getTitle())
                   .append(" (").append(task.getStatus()).append(")")
                   .append(" - Priority: ").append(task.getPriority()).append("\n");
        }
        
        taskInfo.append("\nUpcoming tasks:\n");
        for (Task task : upcomingTasks) {
            taskInfo.append("- ").append(task.getTitle())
                   .append(" - Deadline: ").append(task.getDeadline())
                   .append(" - Priority: ").append(task.getPriority()).append("\n");
        }
        
        taskInfo.append("\nPlease analyze patterns and provide smart reminders, time management suggestions, and priority recommendations.");

        return callGeminiAPI(taskInfo.toString());
    }

    /**
     * AI Chat for study guidance and FAQs with question classification
     */
    public String chatResponse(String userMessage, String context, String preferredLanguage) {
        // First, determine if this is a project-related question
        if (!isProjectRelatedQuestion(userMessage, context)) {
            // For non-project-related questions, return "Meet Admin" message
            return "For questions not related to course planning, studying, or academic guidance, please contact our admin team. " +
                   "Click 'Meet Admin' to get in touch with a human representative who can better assist you with your query.";
        }

        String responseRules = buildResponseRules(userMessage, preferredLanguage, context);
        String prompt = "You are an AI study assistant for a course planning application. " +
                       "Only answer questions related to studying, course planning, tasks, quizzes, goals, and academic guidance.\n" +
                       responseRules + "\n" +
                       "Context: " + (context != null ? context : "General study assistance") + "\n\n" +
                       "User message: " + userMessage;

        return callGeminiAPI(prompt);
    }

    /**
     * AI Chat that is personalized by user profile and only answers project-related questions.
     */
    public String chatResponseWithUserProfile(String userId, String userMessage, String context, String preferredLanguage) {
        if (!isProjectRelatedQuestion(userMessage, context)) {
            return "For questions not related to course planning, studying, or academic guidance, please contact our admin team. " +
                   "Click 'Meet Admin' to get in touch with a human representative who can better assist you with your query.";
        }

        User user;
        try {
            user = userRepository.findById(userId).orElse(null);
        } catch (Exception ex) {
            // Invalid/missing profile context should not break AI chat.
            return chatResponse(userMessage, context, preferredLanguage);
        }
        if (user == null) {
            return chatResponse(userMessage, context, preferredLanguage);
        }

        String interests = (user.getInterests() == null || user.getInterests().isEmpty())
                ? "Not provided"
                : String.join(", ", user.getInterests());

        String profileContext = "User Profile:\n" +
                "- Name: " + user.getFirstName() + " " + user.getLastName() + "\n" +
                "- Experience Level: " + (user.getExperienceLevel() != null ? user.getExperienceLevel() : "Not specified") + "\n" +
                "- Interests: " + interests + "\n" +
                "- Context: " + (context != null ? context : "General study assistance");

        String responseRules = buildResponseRules(userMessage, preferredLanguage, context);
        String prompt = "You are an AI study assistant for Course Planner AI. " +
                "Answer only with project-related, educational guidance and personalize the response based on the profile below. " +
            "If profile interests are missing, ask the user to update profile interests before giving recommendations.\n" +
            responseRules + "\n\n" +
                profileContext + "\n\n" +
                "User message: " + userMessage;

        return callGeminiAPI(prompt);
    }

    /**
     * Determine if a question is related to the project (course planning, studying, etc.)
     */
    private boolean isProjectRelatedQuestion(String message, String context) {
        String lowercaseMessage = message == null ? "" : message.toLowerCase();
        String lowercaseContext = context == null ? "" : context.toLowerCase();

        // If the call already has explicit course context, treat it as project-related.
        if (lowercaseContext.contains("course") || lowercaseContext.contains("browse-courses") || lowercaseContext.contains("study")) {
            return true;
        }
        
        // Keywords that indicate project-related questions
        String[] projectKeywords = {
            "course", "study", "learn", "education", "academic", "assignment", "homework", "quiz", "exam",
            "syllabus", "lesson", "tutorial", "class", "schedule", "deadline", "task", "project",
            "grade", "score", "progress", "curriculum", "subject", "topic", "concept", "understanding",
            "explain", "help me understand", "how to learn", "study plan", "revision", "practice",
            "difficulty", "beginner", "intermediate", "advanced", "prerequisite", "prerequisites", "skill", "knowledge",
            "instructor", "teacher", "professor", "mentor", "guidance", "advice", "tip", "strategy",
            "time management", "productivity", "focus", "concentration", "memory", "retention",
            "note taking", "reading", "writing", "research", "analysis", "problem solving",
            "mathematics", "science", "literature", "history", "language", "programming", "coding",
            "algorithm", "data structure", "software", "technology", "engineering", "business",
            "management", "finance", "marketing", "design", "art", "music", "philosophy", "psychology",
            "suitable", "suitability", "worth", "enroll", "enrol", "compare", "comparison", "what should i study",
            "what should i learn", "what next", "after this", "career path", "learning path", "recommend", "suggest"
        };

        // Check if message contains project-related keywords
        for (String keyword : projectKeywords) {
            if (lowercaseMessage.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    private String buildResponseRules(String userMessage, String preferredLanguage, String context) {
        String normalized = userMessage == null ? "" : userMessage.toLowerCase();
        String normalizedContext = context == null ? "" : context.toLowerCase();
        boolean wantsLong = normalized.contains("long") || normalized.contains("detailed") ||
                normalized.contains("in detail") || normalized.contains("detail me") ||
                normalized.contains("deep") || normalized.contains("elaborate") ||
                normalized.contains("विस्तार") || normalized.contains("detail") ||
                normalized.contains("full explain");
        boolean isBrowseCoursesContext = normalizedContext.contains("browse-courses") ||
                normalizedContext.contains("page: browse-courses");

        String lengthRule = wantsLong
                ? "- Give a detailed answer with 8-12 bullet points and section headings."
                : "- Keep answer concise with 3-6 bullet points. Avoid long paragraphs.";

        String language = (preferredLanguage == null || preferredLanguage.isBlank()) ? "auto" : preferredLanguage.trim();
        String languageRule;
        if ("auto".equalsIgnoreCase(language)) {
            languageRule = "- Reply in the same language as the user message.";
        } else {
            languageRule = "- Reply strictly in: " + language + ".";
        }

        String professionalRule = isBrowseCoursesContext
            ? "- Use professional, advisor-like tone. No emojis, no slang, and no casual filler text."
            : "- Keep a friendly but professional academic tone.";

        return "Response format rules:\n" +
                "- Always use structured, point-wise format.\n" +
                "- If user asks steps/how-to, use numbered steps.\n" +
                "- If user asks comparison, use short bullet comparison by criteria.\n" +
                lengthRule + "\n" +
                languageRule + "\n" +
            professionalRule + "\n" +
            "- Do not expose internal IDs, technical keys, or raw database identifiers.\n" +
                "- Keep response practical and action-oriented for this project.";
    }

    /**
     * Generate study tips based on weak areas
     */
    public String generateStudyTips(String weakAreas, String strongAreas) {
        String prompt = "Based on the following analysis of a student's performance:\n\n" +
                       "Weak areas: " + weakAreas + "\n" +
                       "Strong areas: " + strongAreas + "\n\n" +
                       "Please provide personalized study tips, strategies to improve weak areas, " +
                       "and ways to leverage strong areas for better overall performance.";
        
        return callGeminiAPI(prompt);
    }

    /**
     * Analyze progress and provide insights
     */
    public String analyzeProgress(String progressData) {
        String prompt = "Analyze the following student progress data and provide insights, " +
                       "trends, and recommendations for improvement:\n\n" + progressData +
                       "\n\nProvide actionable feedback and motivational suggestions.";
        
        return callGeminiAPI(prompt);
    }

    /**
     * Generate general AI response for custom prompts
     */
    public String generateCustomResponse(String prompt) {
        return callGeminiAPI(prompt);
    }

    /**
     * Core method to call Groq API with retry logic for rate limiting
     */
    public String callGeminiAPI(String prompt) {
        int maxRetries = 3;
        int baseDelayMs = 1000; // Start with 1 second delay

        if (apiKey == null || apiKey.isBlank() || apiKey.contains("your-groq-api-key")) {
            return buildOfflineFallbackResponse(prompt);
        }
        
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Create Groq OpenAI-compatible chat request payload
                Map<String, Object> request = Map.of(
                    "model", model,
                    "messages", List.of(
                        Map.of("role", "system", "content", "You are a helpful AI study assistant for course planning."),
                        Map.of("role", "user", "content", prompt)
                    ),
                    "temperature", 0.7,
                    "max_tokens", 1024
                );

                // Make API call
                JsonNode response = webClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                        .header("Content-Type", "application/json")
                        .bodyValue(request)
                        .retrieve()
                    .bodyToMono(JsonNode.class)
                        .block();

                // Extract response text from Groq format: choices[0].message.content
                if (response != null &&
                    response.path("choices").isArray() &&
                    !response.path("choices").isEmpty()) {
                    String content = response.path("choices").get(0).path("message").path("content").asText();
                    if (content != null && !content.isBlank()) {
                    return content;
                    }
                }

                return "Sorry, I couldn't generate a response at this time. Please try again.";

            } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                // Handle rate limiting (429) and server errors (5xx)
                int statusCode = e.getStatusCode().value();
                
                if (statusCode == 429 || (statusCode >= 500 && statusCode < 600)) {
                    // Rate limited or server error - retry with exponential backoff
                    if (attempt < maxRetries) {
                        int delayMs = baseDelayMs * (int) Math.pow(2, attempt); // Exponential backoff
                        System.out.println("Groq API error " + statusCode + ", retrying in " + delayMs + "ms... (attempt " + (attempt + 1) + "/" + maxRetries + ")");
                        
                        try {
                            Thread.sleep(delayMs);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            return "Request interrupted. Please try again.";
                        }
                        continue; // Retry
                    } else {
                        // Max retries exceeded
                        System.err.println("Groq API rate limit exceeded after " + maxRetries + " retries");
                        return buildOfflineFallbackResponse(prompt);
                    }
                } else {
                    // Other client errors (4xx) - don't retry
                    System.err.println("Groq API error: " + statusCode + " - " + e.getMessage());
                    return buildOfflineFallbackResponse(prompt);
                }
            } catch (Exception e) {
                // Unexpected errors
                e.printStackTrace();
                if (attempt < maxRetries) {
                    System.out.println("Unexpected error, retrying... (attempt " + (attempt + 1) + "/" + maxRetries + ")");
                    try {
                        Thread.sleep(baseDelayMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return "Request interrupted. Please try again.";
                    }
                    continue;
                }
                return buildOfflineFallbackResponse(prompt);
            }
        }
        
        return "Sorry, I couldn't generate a response at this time. Please try again.";
    }

    private String buildOfflineFallbackResponse(String prompt) {
        String userMessage = extractBetween(prompt, "User message:", "\n");
        String context = extractBetween(prompt, "Context:", "\n");
        String question = (userMessage == null || userMessage.isBlank()) ? "your query" : userMessage.trim();

        StringBuilder response = new StringBuilder();
        response.append("AI cloud model is temporarily unavailable, but I can still guide you based on your context.\n\n");
        response.append("Question understood: ").append(question).append("\n\n");
        response.append("Suggested next steps:\n");
        response.append("1. Choose a course matching your current level (Beginner/Intermediate/Advanced).\n");
        response.append("2. Check prerequisites first, then commit a weekly study schedule (3-6 hrs minimum).\n");
        response.append("3. After each module, do one practice task and one revision session.\n");
        response.append("4. Track progress weekly and adjust pace based on completion rate.\n");

        if (context != null && !context.isBlank()) {
            response.append("\nContext used: ").append(context.trim());
        }

        return response.toString();
    }

    private String extractBetween(String source, String startToken, String endToken) {
        if (source == null || startToken == null) {
            return "";
        }

        int start = source.indexOf(startToken);
        if (start < 0) {
            return "";
        }

        int contentStart = start + startToken.length();
        int end = endToken == null || endToken.isBlank()
                ? -1
                : source.indexOf(endToken, contentStart);

        if (end < 0) {
            end = source.length();
        }

        return source.substring(contentStart, end).trim();
    }

    /**
     * Generate personalized course recommendation based on user interests and profile
     */
    public String generatePersonalizedCourseRecommendation(String userId, String userMessage) {
        try {
            // Fetch actual user data
            User user = userRepository.findById(userId).orElse(null);
            
            if (user == null) {
                System.err.println("❌ User not found with ID: " + userId);
                return "Please log in to get personalized course recommendations!";
            }

            // Get user interests from profile
            List<String> userInterests = user.getInterests();
            String experienceLevel = user.getExperienceLevel();
            
            System.out.println("========================================");
            System.out.println("👤 User: " + user.getUsername());
            System.out.println("🆔 User ID: " + userId);
            System.out.println("🎯 Interests: " + (userInterests != null ? userInterests : "NULL"));
            System.out.println("📊 Experience Level: " + experienceLevel);
            System.out.println("📧 Email: " + user.getEmail());
            System.out.println("========================================");
            
            // Check if user has no interests set
            if (userInterests == null || userInterests.isEmpty()) {
                System.out.println("⚠️ User has no interests set in profile");
                return "I'd love to give you personalized recommendations! 🎯\n\n" +
                       "I noticed your profile interests aren't set up yet. Please:\n" +
                       "1. Go to your Profile page\n" +
                       "2. Click 'Edit Profile'\n" +
                       "3. Add your interests (e.g., Artificial Intelligence, Web Development, Data Science)\n" +
                       "4. Save your profile\n\n" +
                       "Then come back and I'll suggest courses that perfectly match your learning goals! 🚀";
            }
            
            // Build detailed prompt with actual user data
            StringBuilder prompt = new StringBuilder();
            prompt.append("You are an AI course recommendation assistant for a course planning platform.\n\n");
            prompt.append("**User Profile:**\n");
            prompt.append("- Name: ").append(user.getFirstName()).append(" ").append(user.getLastName()).append("\n");
            prompt.append("- Experience Level: ").append(experienceLevel != null ? experienceLevel : "Not specified").append("\n");
            prompt.append("- Interests: ").append(String.join(", ", userInterests)).append("\n\n");
            
            prompt.append("**User Request:** \"").append(userMessage).append("\"\n\n");
            
            prompt.append("**Instructions:**\n");
            prompt.append("1. Provide 3-4 personalized course recommendations that MATCH the user's interests\n");
            prompt.append("2. If user interest is 'Artificial Intelligence', recommend AI/ML courses\n");
            prompt.append("3. If user interest is 'Web Development', recommend web dev courses\n");
            prompt.append("4. Match the difficulty level to their experience: ").append(experienceLevel).append("\n");
            prompt.append("5. For each course, explain:\n");
            prompt.append("   - Why it matches their interests\n");
            prompt.append("   - Career impact\n");
            prompt.append("   - Job demand\n");
            prompt.append("   - Duration\n\n");
            
            prompt.append("Format your response in a friendly, engaging markdown style with emojis.\n");
            prompt.append("Start with: '💡 **Personalized Course Recommendations**'\n\n");
            prompt.append("IMPORTANT: Do NOT recommend JavaScript/TypeScript courses if user is interested in AI/ML!");
            
            System.out.println("📤 Sending prompt to Groq API...");
            return callGeminiAPI(prompt.toString());
            
        } catch (Exception e) {
            System.err.println("❌ Error generating personalized recommendation: " + e.getMessage());
            e.printStackTrace();
            return "Unable to generate personalized recommendations right now. Please try again in a moment.";
        }
    }
}