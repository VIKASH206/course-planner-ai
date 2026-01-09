import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { BackendApiService, Task } from './backend-api.service';
import { AuthService } from './auth-backend.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Reactive state for tasks
  private _tasks = signal<Task[]>([]);
  private _pendingTasks = signal<Task[]>([]);
  private _completedTasks = signal<Task[]>([]);
  private _overdueTasks = signal<Task[]>([]);
  private _upcomingTasks = signal<Task[]>([]);
  private _isLoading = signal<boolean>(false);

  // Public readonly signals
  tasks = this._tasks.asReadonly();
  pendingTasks = this._pendingTasks.asReadonly();
  completedTasks = this._completedTasks.asReadonly();
  overdueTasks = this._overdueTasks.asReadonly();
  upcomingTasks = this._upcomingTasks.asReadonly();
  isLoading = this._isLoading.asReadonly();

  constructor(
    private backendApi: BackendApiService,
    private authService: AuthService
  ) {}

  /**
   * Load all user tasks
   */
  loadUserTasks(userId?: string): Observable<Task[]> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    this._isLoading.set(true);

    return this.backendApi.getUserTasks(currentUserId).pipe(
      map(response => {
        if (response.success) {
          const tasks = response.data;
          this._tasks.set(tasks);
          this.categorializeTasks(tasks);
          return tasks;
        } else {
          throw new Error(response.message);
        }
      }),
      tap(() => this._isLoading.set(false)),
      catchError(error => {
        this._isLoading.set(false);
        console.error('Failed to load user tasks:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new task
   */
  createTask(taskData: Partial<Task>): Observable<Task> {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    const newTask = {
      ...taskData,
      userId: currentUserId
    };

    return this.backendApi.createTask(newTask).pipe(
      map(response => {
        if (response.success) {
          const task = response.data;
          
          // Update local state
          const currentTasks = this._tasks();
          this._tasks.set([...currentTasks, task]);
          this.categorializeTasks([...currentTasks, task]);
          
          return task;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to create task:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update task details
   */
  updateTask(taskId: string, updates: Partial<Task>): Observable<Task> {
    return this.backendApi.updateTask(taskId, updates).pipe(
      map(response => {
        if (response.success) {
          const updatedTask = response.data;
          this.updateTaskInState(updatedTask);
          return updatedTask;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to update task:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mark task as completed
   */
  completeTask(taskId: string): Observable<Task> {
    return this.backendApi.completeTask(taskId).pipe(
      map(response => {
        if (response.success) {
          const completedTask = response.data;
          this.updateTaskInState(completedTask);
          
          // Refresh user profile to update stats
          this.authService.refreshUserProfile().subscribe();
          
          return completedTask;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to complete task:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: string): Observable<Task> {
    return this.backendApi.updateTaskStatus(taskId, status).pipe(
      map(response => {
        if (response.success) {
          const updatedTask = response.data;
          this.updateTaskInState(updatedTask);
          
          // If task is completed, refresh user profile
          if (status === 'completed') {
            this.authService.refreshUserProfile().subscribe();
          }
          
          return updatedTask;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to update task status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a task
   */
  deleteTask(taskId: string): Observable<void> {
    return this.backendApi.deleteTask(taskId).pipe(
      map(response => {
        if (response.success) {
          this.removeTaskFromState(taskId);
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to delete task:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get tasks by date range (calendar view)
   */
  getTasksByDateRange(startDate: string, endDate: string, userId?: string): Observable<Task[]> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.getTasksByDateRange(currentUserId, startDate, endDate).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get tasks by date range:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get tasks for a specific date
   */
  getTasksByDate(date: string, userId?: string): Observable<Task[]> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.getTasksByDate(currentUserId, date).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get tasks by date:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Load overdue tasks
   */
  loadOverdueTasks(userId?: string): Observable<Task[]> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.getOverdueTasks(currentUserId).pipe(
      map(response => {
        if (response.success) {
          const overdueTasks = response.data;
          this._overdueTasks.set(overdueTasks);
          return overdueTasks;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to load overdue tasks:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Load upcoming tasks
   */
  loadUpcomingTasks(userId?: string): Observable<Task[]> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.getUpcomingTasks(currentUserId).pipe(
      map(response => {
        if (response.success) {
          const upcomingTasks = response.data;
          this._upcomingTasks.set(upcomingTasks);
          return upcomingTasks;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to load upcoming tasks:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get tasks by priority
   */
  getTasksByPriority(priority: string, userId?: string): Observable<Task[]> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.getTasksByPriority(currentUserId, priority).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get tasks by priority:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get tasks by course
   */
  getTasksByCourse(courseId: string): Observable<Task[]> {
    return this.backendApi.getTasksByCourse(courseId).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get tasks by course:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get task statistics
   */
  getTaskStats(): { total: number; completed: number; pending: number; overdue: number; completionRate: number } {
    const tasks = this._tasks();
    const total = tasks.length;
    const completed = tasks.filter(task => task.isCompleted).length;
    const pending = tasks.filter(task => !task.isCompleted).length;
    const overdue = this._overdueTasks().length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate
    };
  }

  /**
   * Get tasks grouped by status
   */
  getTasksByStatus(): { [status: string]: Task[] } {
    const tasks = this._tasks();
    return tasks.reduce((grouped, task) => {
      const status = task.status || 'pending';
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(task);
      return grouped;
    }, {} as { [status: string]: Task[] });
  }

  /**
   * Get tasks grouped by priority
   */
  getTasksByPriorityGrouped(): { [priority: string]: Task[] } {
    const tasks = this._tasks();
    return tasks.reduce((grouped, task) => {
      const priority = task.priority || 'medium';
      if (!grouped[priority]) {
        grouped[priority] = [];
      }
      grouped[priority].push(task);
      return grouped;
    }, {} as { [priority: string]: Task[] });
  }

  /**
   * Categorize tasks into different arrays
   */
  private categorializeTasks(tasks: Task[]): void {
    const now = new Date();
    
    const pending = tasks.filter(task => !task.isCompleted);
    const completed = tasks.filter(task => task.isCompleted);
    const overdue = tasks.filter(task => {
      if (task.isCompleted) return false;
      const deadline = new Date(task.deadline);
      return deadline < now;
    });

    this._pendingTasks.set(pending);
    this._completedTasks.set(completed);
    this._overdueTasks.set(overdue);
  }

  /**
   * Update task in local state
   */
  private updateTaskInState(updatedTask: Task): void {
    const tasks = this._tasks();
    const taskIndex = tasks.findIndex(t => t.id === updatedTask.id);
    
    if (taskIndex !== -1) {
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      this._tasks.set(updatedTasks);
      this.categorializeTasks(updatedTasks);
    }
  }

  /**
   * Remove task from local state
   */
  private removeTaskFromState(taskId: string): void {
    const tasks = this._tasks().filter(t => t.id !== taskId);
    this._tasks.set(tasks);
    this.categorializeTasks(tasks);
  }

  /**
   * Reset state (useful for logout)
   */
  resetState(): void {
    this._tasks.set([]);
    this._pendingTasks.set([]);
    this._completedTasks.set([]);
    this._overdueTasks.set([]);
    this._upcomingTasks.set([]);
    this._isLoading.set(false);
  }
}