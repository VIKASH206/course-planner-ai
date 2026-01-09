package com.courseplanner.service;

import com.courseplanner.model.Task;
import com.courseplanner.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    /**
     * Create a new task
     */
    public Task createTask(Task task) {
        System.out.println("TaskService: Creating task with title: " + task.getTitle());
        System.out.println("TaskService: UserId: " + task.getUserId());
        System.out.println("TaskService: Deadline: " + task.getDeadline());
        
        Task savedTask = taskRepository.save(task);
        
        System.out.println("TaskService: Task saved with ID: " + savedTask.getId());
        return savedTask;
    }

    /**
     * Get all tasks for a user
     */
    public List<Task> getUserTasks(String userId) {
        return taskRepository.findByUserId(userId);
    }

    /**
     * Get tasks by status for a user
     */
    public List<Task> getTasksByStatus(String userId, String status) {
        return taskRepository.findByUserIdAndStatus(userId, status);
    }

    /**
     * Get tasks for a specific course
     */
    public List<Task> getTasksByCourse(String courseId) {
        return taskRepository.findByCourseId(courseId);
    }

    /**
     * Get task by ID
     */
    public Task getTaskById(String taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    /**
     * Update task
     */
    public Task updateTask(String taskId, Task updatedTask) {
        Task existingTask = getTaskById(taskId);

        // Update allowed fields
        if (updatedTask.getTitle() != null) {
            existingTask.setTitle(updatedTask.getTitle());
        }
        if (updatedTask.getDescription() != null) {
            existingTask.setDescription(updatedTask.getDescription());
        }
        if (updatedTask.getDeadline() != null) {
            existingTask.setDeadline(updatedTask.getDeadline());
        }
        if (updatedTask.getStatus() != null) {
            existingTask.setStatus(updatedTask.getStatus());
        }
        if (updatedTask.getPriority() != null) {
            existingTask.setPriority(updatedTask.getPriority());
        }
        if (updatedTask.getEstimatedMinutes() > 0) {
            existingTask.setEstimatedMinutes(updatedTask.getEstimatedMinutes());
        }
        if (updatedTask.getReminderTime() != null) {
            existingTask.setReminderTime(updatedTask.getReminderTime());
        }
        if (updatedTask.getNotes() != null) {
            existingTask.setNotes(updatedTask.getNotes());
        }

        return taskRepository.save(existingTask);
    }

    /**
     * Mark task as completed
     */
    public Task completeTask(String taskId) {
        Task task = getTaskById(taskId);
        String oldStatus = task.getStatus();
        task.setCompleted(true);
        
        // If task is newly completed, update user stats (case-insensitive)
        String normalizedOldStatus = oldStatus != null ? oldStatus.toLowerCase() : "";
        if (!"completed".equals(normalizedOldStatus)) {
            userService.incrementCompletedTasks(task.getUserId());
            userService.updateUserScore(task.getUserId(), 50); // 50 points for completing a task
        }

        return taskRepository.save(task);
    }

    /**
     * Delete task
     */
    public void deleteTask(String taskId) {
        Task task = getTaskById(taskId);
        taskRepository.delete(task);
    }

    /**
     * Get tasks by date range (calendar view)
     */
    public List<Task> getTasksByDateRange(String userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        return taskRepository.findByUserIdAndDeadlineBetween(userId, startDateTime, endDateTime);
    }

    /**
     * Get tasks for a specific date
     */
    public List<Task> getTasksByDate(String userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        return taskRepository.findByUserIdAndDeadlineBetween(userId, startOfDay, endOfDay);
    }

    /**
     * Get overdue tasks for a user
     */
    public List<Task> getOverdueTasks(String userId) {
        return taskRepository.findOverdueTasksByUser(userId, LocalDateTime.now());
    }

    /**
     * Get upcoming tasks (next 24 hours)
     */
    public List<Task> getUpcomingTasks(String userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);
        return taskRepository.findUpcomingTasks(userId, now, tomorrow);
    }

    /**
     * Get tasks by priority for a user
     */
    public List<Task> getTasksByPriority(String userId, String priority) {
        return taskRepository.findByUserIdAndPriority(userId, priority);
    }

    /**
     * Update task status
     */
    public Task updateTaskStatus(String taskId, String status) {
        Task task = getTaskById(taskId);
        String oldStatus = task.getStatus();
        task.setStatus(status);
        
        // Update user stats if task is completed (case-insensitive)
        String normalizedStatus = status != null ? status.toLowerCase() : "";
        String normalizedOldStatus = oldStatus != null ? oldStatus.toLowerCase() : "";
        if ("completed".equals(normalizedStatus) && !"completed".equals(normalizedOldStatus)) {
            userService.incrementCompletedTasks(task.getUserId());
            userService.updateUserScore(task.getUserId(), 50);
        }

        return taskRepository.save(task);
    }

    /**
     * Get tasks with due reminders
     */
    public List<Task> getTasksWithDueReminders() {
        return taskRepository.findTasksWithDueReminders(LocalDateTime.now());
    }

    /**
     * Count completed tasks for user
     */
    public long countCompletedTasks(String userId) {
        return taskRepository.countByUserIdAndIsCompleted(userId, true);
    }

    /**
     * Count tasks by status for user
     */
    public long countTasksByStatus(String userId, String status) {
        return taskRepository.countByUserIdAndStatus(userId, status);
    }

    /**
     * Get weekly tasks for a user
     */
    public List<Task> getWeeklyTasks(String userId, LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        return getTasksByDateRange(userId, weekStart, weekEnd);
    }

    /**
     * Get monthly tasks for a user
     */
    public List<Task> getMonthlyTasks(String userId, LocalDate monthStart) {
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
        return getTasksByDateRange(userId, monthStart, monthEnd);
    }
}