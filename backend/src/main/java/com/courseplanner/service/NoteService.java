package com.courseplanner.service;

import com.courseplanner.model.Note;
import com.courseplanner.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for Note operations
 * Handles business logic for student notes
 */
@Service
public class NoteService {
    
    @Autowired
    private NoteRepository noteRepository;
    
    /**
     * Get all notes for a user in a course
     */
    public List<Note> getCourseNotes(String userId, String courseId) {
        return noteRepository.findByUserIdAndCourseIdOrderByUpdatedAtDesc(userId, courseId);
    }
    
    /**
     * Get all notes for a user (across all courses)
     */
    public List<Note> getUserNotes(String userId) {
        return noteRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }
    
    /**
     * Get pinned notes for a course
     */
    public List<Note> getPinnedNotes(String userId, String courseId) {
        return noteRepository.findByUserIdAndCourseIdAndIsPinnedOrderByUpdatedAtDesc(userId, courseId, true);
    }
    
    /**
     * Get notes by module
     */
    public List<Note> getModuleNotes(String userId, String moduleId) {
        return noteRepository.findByUserIdAndModuleIdOrderByUpdatedAtDesc(userId, moduleId);
    }
    
    /**
     * Get notes by topic
     */
    public List<Note> getTopicNotes(String userId, String topicId) {
        return noteRepository.findByUserIdAndTopicIdOrderByUpdatedAtDesc(userId, topicId);
    }
    
    /**
     * Get notes by tag
     */
    public List<Note> getNotesByTag(String userId, String tag) {
        return noteRepository.findByUserIdAndTagsContainingOrderByUpdatedAtDesc(userId, tag);
    }
    
    /**
     * Get a specific note by ID
     */
    public Note getNoteById(String noteId) {
        return noteRepository.findById(noteId)
            .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));
    }
    
    /**
     * Create a new note
     */
    public Note createNote(Note note) {
        note.setCreatedAt(LocalDateTime.now());
        note.setUpdatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }
    
    /**
     * Update an existing note
     */
    public Note updateNote(String noteId, Note updatedNote) {
        Note existingNote = getNoteById(noteId);
        
        // Update fields
        if (updatedNote.getTitle() != null) {
            existingNote.setTitle(updatedNote.getTitle());
        }
        if (updatedNote.getContent() != null) {
            existingNote.setContent(updatedNote.getContent());
        }
        if (updatedNote.getTags() != null) {
            existingNote.setTags(updatedNote.getTags());
        }
        if (updatedNote.getColor() != null) {
            existingNote.setColor(updatedNote.getColor());
        }
        if (updatedNote.getModuleId() != null) {
            existingNote.setModuleId(updatedNote.getModuleId());
        }
        if (updatedNote.getTopicId() != null) {
            existingNote.setTopicId(updatedNote.getTopicId());
        }
        
        existingNote.setPinned(updatedNote.isPinned());
        existingNote.setShared(updatedNote.isShared());
        existingNote.setUpdatedAt(LocalDateTime.now());
        
        return noteRepository.save(existingNote);
    }
    
    /**
     * Toggle pin status of a note
     */
    public Note togglePin(String noteId) {
        Note note = getNoteById(noteId);
        note.setPinned(!note.isPinned());
        note.setUpdatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }
    
    /**
     * Delete a note
     */
    public void deleteNote(String noteId) {
        Note note = getNoteById(noteId);
        noteRepository.delete(note);
    }
    
    /**
     * Get shared notes in a course
     */
    public List<Note> getSharedNotes(String courseId) {
        return noteRepository.findByCourseIdAndIsSharedOrderByUpdatedAtDesc(courseId, true);
    }
    
    /**
     * Count notes for a user in a course
     */
    public long getNoteCount(String userId, String courseId) {
        return noteRepository.countByUserIdAndCourseId(userId, courseId);
    }
    
    /**
     * Delete all notes for a user in a course
     */
    public void deleteAllCourseNotes(String userId, String courseId) {
        noteRepository.deleteByUserIdAndCourseId(userId, courseId);
    }
}
