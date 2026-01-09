package com.courseplanner.dto;

import java.util.List;

public class NoteRequest {
    private String userId;
    private String courseId;
    private String moduleId;
    private String topicId;
    private String title;
    private String content;
    private String noteType; // PERSONAL, SHARED, HIGHLIGHT, RESOURCE
    private List<String> attachmentUrls;
    private List<String> tags;
    private boolean isPublic;
    private List<String> sharedWithUserIds;

    // For highlights
    private String highlightedText;
    private int startPosition;
    private int endPosition;

    // Default constructor
    public NoteRequest() {}

    // Constructor
    public NoteRequest(String userId, String courseId, String title, String content) {
        this.userId = userId;
        this.courseId = courseId;
        this.title = title;
        this.content = content;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getNoteType() { return noteType; }
    public void setNoteType(String noteType) { this.noteType = noteType; }

    public List<String> getAttachmentUrls() { return attachmentUrls; }
    public void setAttachmentUrls(List<String> attachmentUrls) { this.attachmentUrls = attachmentUrls; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public List<String> getSharedWithUserIds() { return sharedWithUserIds; }
    public void setSharedWithUserIds(List<String> sharedWithUserIds) { this.sharedWithUserIds = sharedWithUserIds; }

    public String getHighlightedText() { return highlightedText; }
    public void setHighlightedText(String highlightedText) { this.highlightedText = highlightedText; }

    public int getStartPosition() { return startPosition; }
    public void setStartPosition(int startPosition) { this.startPosition = startPosition; }

    public int getEndPosition() { return endPosition; }
    public void setEndPosition(int endPosition) { this.endPosition = endPosition; }
}