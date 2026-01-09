package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.Note;
import com.courseplanner.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Note management
 * Handles all note-related operations for students
 */
@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class NoteController {
    
    @Autowired
    private NoteService noteService;
    
    /**
     * GET /api/notes/course/{courseId}/user/{userId} - Get all notes for a course
     */
    @GetMapping("/course/{courseId}/user/{userId}")
    public ResponseEntity<ApiResponse<List<Note>>> getCourseNotes(
            @PathVariable String courseId,
            @PathVariable String userId) {
        try {
            List<Note> notes = noteService.getCourseNotes(userId, courseId);
            return ResponseEntity.ok(ApiResponse.success("Notes retrieved successfully", notes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve notes: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/notes/user/{userId} - Get all notes for a user (across all courses)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Note>>> getUserNotes(@PathVariable String userId) {
        try {
            List<Note> notes = noteService.getUserNotes(userId);
            return ResponseEntity.ok(ApiResponse.success("User notes retrieved successfully", notes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve notes: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/notes/course/{courseId}/user/{userId}/pinned - Get pinned notes
     */
    @GetMapping("/course/{courseId}/user/{userId}/pinned")
    public ResponseEntity<ApiResponse<List<Note>>> getPinnedNotes(
            @PathVariable String courseId,
            @PathVariable String userId) {
        try {
            List<Note> notes = noteService.getPinnedNotes(userId, courseId);
            return ResponseEntity.ok(ApiResponse.success("Pinned notes retrieved successfully", notes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve pinned notes: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/notes/module/{moduleId}/user/{userId} - Get notes by module
     */
    @GetMapping("/module/{moduleId}/user/{userId}")
    public ResponseEntity<ApiResponse<List<Note>>> getModuleNotes(
            @PathVariable String moduleId,
            @PathVariable String userId) {
        try {
            List<Note> notes = noteService.getModuleNotes(userId, moduleId);
            return ResponseEntity.ok(ApiResponse.success("Module notes retrieved successfully", notes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve module notes: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/notes/topic/{topicId}/user/{userId} - Get notes by topic
     */
    @GetMapping("/topic/{topicId}/user/{userId}")
    public ResponseEntity<ApiResponse<List<Note>>> getTopicNotes(
            @PathVariable String topicId,
            @PathVariable String userId) {
        try {
            List<Note> notes = noteService.getTopicNotes(userId, topicId);
            return ResponseEntity.ok(ApiResponse.success("Topic notes retrieved successfully", notes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve topic notes: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/notes/{noteId} - Get specific note
     */
    @GetMapping("/{noteId}")
    public ResponseEntity<ApiResponse<Note>> getNote(@PathVariable String noteId) {
        try {
            Note note = noteService.getNoteById(noteId);
            return ResponseEntity.ok(ApiResponse.success("Note retrieved successfully", note));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Note not found: " + e.getMessage()));
        }
    }
    
    /**
     * POST /api/notes - Create new note
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Note>> createNote(@RequestBody Note note) {
        try {
            Note createdNote = noteService.createNote(note);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Note created successfully", createdNote));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to create note: " + e.getMessage()));
        }
    }
    
    /**
     * PUT /api/notes/{noteId} - Update note
     */
    @PutMapping("/{noteId}")
    public ResponseEntity<ApiResponse<Note>> updateNote(
            @PathVariable String noteId,
            @RequestBody Note note) {
        try {
            Note updatedNote = noteService.updateNote(noteId, note);
            return ResponseEntity.ok(ApiResponse.success("Note updated successfully", updatedNote));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Note not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to update note: " + e.getMessage()));
        }
    }
    
    /**
     * PUT /api/notes/{noteId}/toggle-pin - Toggle pin status
     */
    @PutMapping("/{noteId}/toggle-pin")
    public ResponseEntity<ApiResponse<Note>> togglePin(@PathVariable String noteId) {
        try {
            Note note = noteService.togglePin(noteId);
            return ResponseEntity.ok(ApiResponse.success("Note pin status toggled", note));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Note not found: " + e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/notes/{noteId} - Delete note
     */
    @DeleteMapping("/{noteId}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable String noteId) {
        try {
            noteService.deleteNote(noteId);
            return ResponseEntity.ok(ApiResponse.success("Note deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Note not found: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/notes/course/{courseId}/shared - Get shared notes in a course
     */
    @GetMapping("/course/{courseId}/shared")
    public ResponseEntity<ApiResponse<List<Note>>> getSharedNotes(@PathVariable String courseId) {
        try {
            List<Note> notes = noteService.getSharedNotes(courseId);
            return ResponseEntity.ok(ApiResponse.success("Shared notes retrieved successfully", notes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve shared notes: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/notes/course/{courseId}/user/{userId}/stats - Get note statistics
     */
    @GetMapping("/course/{courseId}/user/{userId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNoteStats(
            @PathVariable String courseId,
            @PathVariable String userId) {
        try {
            long totalNotes = noteService.getNoteCount(userId, courseId);
            long pinnedNotes = noteService.getPinnedNotes(userId, courseId).size();
            
            Map<String, Object> stats = Map.of(
                "totalNotes", totalNotes,
                "pinnedNotes", pinnedNotes,
                "regularNotes", totalNotes - pinnedNotes
            );
            
            return ResponseEntity.ok(ApiResponse.success("Note statistics retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve statistics: " + e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/notes/course/{courseId}/user/{userId} - Delete all notes for a course
     */
    @DeleteMapping("/course/{courseId}/user/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteAllCourseNotes(
            @PathVariable String courseId,
            @PathVariable String userId) {
        try {
            noteService.deleteAllCourseNotes(userId, courseId);
            return ResponseEntity.ok(ApiResponse.success("All course notes deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete notes: " + e.getMessage()));
        }
    }
}
