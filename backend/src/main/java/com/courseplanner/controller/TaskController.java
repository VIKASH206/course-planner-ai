package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.Task;
import com.courseplanner.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class TaskController {

    @Autowired
    private TaskService taskService;

    /**
     * Create a new task
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Task>> createTask(@RequestBody Task task) {
        try {
            System.out.println("Received task creation request:");
            System.out.println("Title: " + task.getTitle());
            System.out.println("Description: " + task.getDescription());
            System.out.println("Deadline: " + task.getDeadline());
            System.out.println("Priority: " + task.getPriority());
            System.out.println("Status: " + task.getStatus());
            System.out.println("UserId: " + task.getUserId());
            System.out.println("Tags: " + task.getTags());
            
            Task createdTask = taskService.createTask(task);
            System.out.println("Task created successfully with ID: " + createdTask.getId());
            
            return ResponseEntity.ok(ApiResponse.success("Task created successfully", createdTask));
        } catch (RuntimeException e) {
            System.err.println("Error creating task: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error creating task: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get all tasks for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Task>>> getUserTasks(@PathVariable String userId) {
        List<Task> tasks = taskService.getUserTasks(userId);
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", tasks));
    }

    /**
     * Get tasks by status for a user
     */
    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<ApiResponse<List<Task>>> getTasksByStatus(@PathVariable String userId, @PathVariable String status) {
        List<Task> tasks = taskService.getTasksByStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success("Tasks by status retrieved successfully", tasks));
    }

    /**
     * Get tasks for a specific course
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<Task>>> getTasksByCourse(@PathVariable String courseId) {
        List<Task> tasks = taskService.getTasksByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Course tasks retrieved successfully", tasks));
    }

    /**
     * Get task by ID
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Task>> getTask(@PathVariable String taskId) {
        try {
            Task task = taskService.getTaskById(taskId);
            return ResponseEntity.ok(ApiResponse.success(task));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update task
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Task>> updateTask(@PathVariable String taskId, @RequestBody Task updatedTask) {
        try {
            Task task = taskService.updateTask(taskId, updatedTask);
            return ResponseEntity.ok(ApiResponse.success("Task updated successfully", task));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Mark task as completed
     */
    @PutMapping("/{taskId}/complete")
    public ResponseEntity<ApiResponse<Task>> completeTask(@PathVariable String taskId) {
        try {
            Task task = taskService.completeTask(taskId);
            return ResponseEntity.ok(ApiResponse.success("Task completed successfully", task));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update task status
     */
    @PutMapping("/{taskId}/status")
    public ResponseEntity<ApiResponse<Task>> updateTaskStatus(@PathVariable String taskId, @RequestParam String status) {
        try {
            Task task = taskService.updateTaskStatus(taskId, status);
            return ResponseEntity.ok(ApiResponse.success("Task status updated successfully", task));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete task
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<String>> deleteTask(@PathVariable String taskId) {
        try {
            taskService.deleteTask(taskId);
            return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", "Task deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get tasks by date range (calendar view)
     */
    @GetMapping("/user/{userId}/calendar")
    public ResponseEntity<ApiResponse<List<Task>>> getTasksByDateRange(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Task> tasks = taskService.getTasksByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Calendar tasks retrieved successfully", tasks));
    }

    /**
     * Get tasks for a specific date
     */
    @GetMapping("/user/{userId}/date/{date}")
    public ResponseEntity<ApiResponse<List<Task>>> getTasksByDate(
            @PathVariable String userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Task> tasks = taskService.getTasksByDate(userId, date);
        return ResponseEntity.ok(ApiResponse.success("Daily tasks retrieved successfully", tasks));
    }

    /**
     * Get overdue tasks for a user
     */
    @GetMapping("/user/{userId}/overdue")
    public ResponseEntity<ApiResponse<List<Task>>> getOverdueTasks(@PathVariable String userId) {
        List<Task> tasks = taskService.getOverdueTasks(userId);
        return ResponseEntity.ok(ApiResponse.success("Overdue tasks retrieved successfully", tasks));
    }

    /**
     * Get upcoming tasks (next 24 hours)
     */
    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<ApiResponse<List<Task>>> getUpcomingTasks(@PathVariable String userId) {
        List<Task> tasks = taskService.getUpcomingTasks(userId);
        return ResponseEntity.ok(ApiResponse.success("Upcoming tasks retrieved successfully", tasks));
    }

    /**
     * Get tasks by priority for a user
     */
    @GetMapping("/user/{userId}/priority/{priority}")
    public ResponseEntity<ApiResponse<List<Task>>> getTasksByPriority(@PathVariable String userId, @PathVariable String priority) {
        List<Task> tasks = taskService.getTasksByPriority(userId, priority);
        return ResponseEntity.ok(ApiResponse.success("Tasks by priority retrieved successfully", tasks));
    }

    /**
     * Get weekly tasks for a user
     */
    @GetMapping("/user/{userId}/week/{weekStart}")
    public ResponseEntity<ApiResponse<List<Task>>> getWeeklyTasks(
            @PathVariable String userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        List<Task> tasks = taskService.getWeeklyTasks(userId, weekStart);
        return ResponseEntity.ok(ApiResponse.success("Weekly tasks retrieved successfully", tasks));
    }

    /**
     * Get monthly tasks for a user
     */
    @GetMapping("/user/{userId}/month/{monthStart}")
    public ResponseEntity<ApiResponse<List<Task>>> getMonthlyTasks(
            @PathVariable String userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate monthStart) {
        List<Task> tasks = taskService.getMonthlyTasks(userId, monthStart);
        return ResponseEntity.ok(ApiResponse.success("Monthly tasks retrieved successfully", tasks));
    }
}