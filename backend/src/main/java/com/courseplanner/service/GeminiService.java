package com.courseplanner.service;

import com.courseplanner.dto.GeminiRequest;
import com.courseplanner.dto.GeminiResponse;
import com.courseplanner.model.Course;
import com.courseplanner.model.Task;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Arrays;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient;

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
    public String chatResponse(String userMessage, String context) {
        // First, determine if this is a project-related question
        if (isProjectRelatedQuestion(userMessage)) {
            String prompt = "You are an AI study assistant for a course planning application. " +
                           "Provide helpful, educational responses related to studying, course planning, task management, and academic guidance. " +
                           "Context: " + (context != null ? context : "General study assistance") + "\n\n" +
                           "User message: " + userMessage;
            
            return callGeminiAPI(prompt);
        } else {
            // For non-project-related questions, return "Meet Admin" message
            return "For questions not related to course planning, studying, or academic guidance, please contact our admin team. " +
                   "Click 'Meet Admin' to get in touch with a human representative who can better assist you with your query.";
        }
    }

    /**
     * Determine if a question is related to the project (course planning, studying, etc.)
     */
    private boolean isProjectRelatedQuestion(String message) {
        String lowercaseMessage = message.toLowerCase();
        
        // Keywords that indicate project-related questions
        String[] projectKeywords = {
            "course", "study", "learn", "education", "academic", "assignment", "homework", "quiz", "exam",
            "syllabus", "lesson", "tutorial", "class", "schedule", "deadline", "task", "project",
            "grade", "score", "progress", "curriculum", "subject", "topic", "concept", "understanding",
            "explain", "help me understand", "how to learn", "study plan", "revision", "practice",
            "difficulty", "beginner", "intermediate", "advanced", "prerequisite", "skill", "knowledge",
            "instructor", "teacher", "professor", "mentor", "guidance", "advice", "tip", "strategy",
            "time management", "productivity", "focus", "concentration", "memory", "retention",
            "note taking", "reading", "writing", "research", "analysis", "problem solving",
            "mathematics", "science", "literature", "history", "language", "programming", "coding",
            "algorithm", "data structure", "software", "technology", "engineering", "business",
            "management", "finance", "marketing", "design", "art", "music", "philosophy", "psychology"
        };

        // Check if message contains project-related keywords
        for (String keyword : projectKeywords) {
            if (lowercaseMessage.contains(keyword)) {
                return true;
            }
        }

        // Additional check: if message is asking for help/explanation in academic context
        if ((lowercaseMessage.contains("help") || lowercaseMessage.contains("explain") || 
             lowercaseMessage.contains("what is") || lowercaseMessage.contains("how to") ||
             lowercaseMessage.contains("can you") || lowercaseMessage.contains("please")) &&
            (lowercaseMessage.length() > 20)) { // Reasonable length for educational questions
            
            // Use AI to make a more sophisticated determination
            String classificationPrompt = "Determine if the following question is related to education, learning, studying, course planning, academic subjects, or any educational/learning context. " +
                                        "Respond with only 'YES' if it's educational/learning related, or 'NO' if it's completely unrelated to education/learning.\n\n" +
                                        "Question: " + message;
            
            String classification = callGeminiAPI(classificationPrompt);
            return classification != null && classification.trim().toUpperCase().startsWith("YES");
        }
        
        return false;
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
     * Core method to call Gemini API with retry logic for rate limiting
     */
    public String callGeminiAPI(String prompt) {
        int maxRetries = 3;
        int baseDelayMs = 1000; // Start with 1 second delay
        
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Create request payload
                GeminiRequest.Part part = new GeminiRequest.Part(prompt);
                GeminiRequest.Content content = new GeminiRequest.Content(Arrays.asList(part));
                GeminiRequest request = new GeminiRequest(Arrays.asList(content));

                // Make API call
                GeminiResponse response = webClient.post()
                        .uri(apiUrl + "?key=" + apiKey)
                        .header("Content-Type", "application/json")
                        .bodyValue(request)
                        .retrieve()
                        .bodyToMono(GeminiResponse.class)
                        .block();

                // Extract response text
                if (response != null && 
                    response.getCandidates() != null && 
                    !response.getCandidates().isEmpty() &&
                    response.getCandidates().get(0).getContent() != null &&
                    response.getCandidates().get(0).getContent().getParts() != null &&
                    !response.getCandidates().get(0).getContent().getParts().isEmpty()) {
                    
                    return response.getCandidates().get(0).getContent().getParts().get(0).getText();
                }

                return "Sorry, I couldn't generate a response at this time. Please try again.";

            } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                // Handle rate limiting (429) and server errors (5xx)
                int statusCode = e.getStatusCode().value();
                
                if (statusCode == 429 || (statusCode >= 500 && statusCode < 600)) {
                    // Rate limited or server error - retry with exponential backoff
                    if (attempt < maxRetries) {
                        int delayMs = baseDelayMs * (int) Math.pow(2, attempt); // Exponential backoff
                        System.out.println("Gemini API error " + statusCode + ", retrying in " + delayMs + "ms... (attempt " + (attempt + 1) + "/" + maxRetries + ")");
                        
                        try {
                            Thread.sleep(delayMs);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            return "Request interrupted. Please try again.";
                        }
                        continue; // Retry
                    } else {
                        // Max retries exceeded
                        System.err.println("Gemini API rate limit exceeded after " + maxRetries + " retries");
                        throw new RuntimeException("AI service temporarily unavailable. Please try again in a few moments.");
                    }
                } else {
                    // Other client errors (4xx) - don't retry
                    System.err.println("Gemini API error: " + statusCode + " - " + e.getMessage());
                    throw new RuntimeException("AI service error. Please try again.");
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
                throw new RuntimeException("Failed to process your request. Please try again.");
            }
        }
        
        return "Sorry, I couldn't generate a response at this time. Please try again.";
    }
}