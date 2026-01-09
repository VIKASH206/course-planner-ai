import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BackendApiService, Task } from '../../core/services/backend-api.service';
import { AuthService } from '../../core/services/auth.service';
import { TaskDialogComponent } from './task-dialog.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  private backendApi = inject(BackendApiService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  // Signals for reactive state
  tasks = signal<Task[]>([]);
  statusFilter = '';
  priorityFilter = '';

  // Computed values
  filteredTasks = computed(() => {
    return this.tasks().filter(task => {
      const matchesStatus = !this.statusFilter || task.status === this.statusFilter;
      const matchesPriority = !this.priorityFilter || task.priority === this.priorityFilter;
      
      return matchesStatus && matchesPriority;
    });
  });

  totalTasks = computed(() => this.tasks().length);
  completedTasks = computed(() => this.tasks().filter(t => t.status === 'COMPLETED').length);
  pendingTasks = computed(() => this.tasks().filter(t => t.status !== 'COMPLETED').length);
  completionRate = computed(() => {
    const total = this.totalTasks();
    return total > 0 ? Math.round((this.completedTasks() / total) * 100) : 0;
  });

  priorityStats = computed(() => {
    const stats = { high: 0, medium: 0, low: 0 };
    this.tasks().forEach(task => {
      if (task.priority === 'High') stats.high++;
      else if (task.priority === 'Medium') stats.medium++;
      else stats.low++;
    });
    return stats;
  });

  upcomingTasks = computed(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.tasks()
      .filter(task => {
        const taskDateStr = this.getTaskDate(task);
        if (!taskDateStr) return false;
        const taskDate = new Date(taskDateStr);
        return task.status !== 'COMPLETED' && 
               taskDate >= now && 
               taskDate <= weekFromNow;
      })
      .sort((a, b) => {
        const dateA = new Date(this.getTaskDate(a) || new Date()).getTime();
        const dateB = new Date(this.getTaskDate(b) || new Date()).getTime();
        return dateA - dateB;
      })
      .slice(0, 5);
  });

  // Track by function for ngFor
  trackByTaskId(index: number, task: Task): string | number | undefined {
    return task.id;
  }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('No user logged in');
      this.tasks.set([]);
      return;
    }
    
    // Load tasks from backend API
    this.backendApi.getUserTasks(currentUser.id).subscribe({
      next: (response) => {
        const tasks = response.data || [];
        this.tasks.set(tasks);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        // Show empty state on error
        this.tasks.set([]);
      }
    });
  }

  openTaskDialog(task?: Task) {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }
    
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      minHeight: '600px',
      maxHeight: '90vh',
      maxWidth: '95vw',
      panelClass: 'task-dialog-panel',
      hasBackdrop: true,
      disableClose: false,
      autoFocus: true,
      data: {
        task: task,
        userId: currentUser.id
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (task && task.id) {
          // Update existing task
          this.backendApi.updateTask(task.id, result).subscribe({
            next: (response) => {
              this.loadTasks();
            },
            error: (error) => {
              console.error('Error updating task:', error);
            }
          });
        } else {
          // Create new task
          console.log('Creating task with data:', result);
          this.backendApi.createTask(result).subscribe({
            next: (response) => {
              console.log('Task created successfully:', response);
              this.loadTasks();
            },
            error: (error) => {
              console.error('Error creating task:', error);
              alert('Failed to create task: ' + (error.error?.message || error.message));
            }
          });
        }
      }
    });
  }

  editTask(task: Task) {
    this.openTaskDialog(task);
  }

  deleteTask(task: Task) {
    if (!task.id) return;
    
    if (confirm('Are you sure you want to delete this task?')) {
      this.backendApi.deleteTask(task.id).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  toggleTaskComplete(task: Task) {
    if (!task.id) return;
    
    const newStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    
    const updatedTask = { ...task, status: newStatus };
    this.backendApi.updateTask(task.id, updatedTask).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error updating task:', error);
      }
    });
  }
  
  getTaskDate(task: Task): string | undefined {
    return task.deadline || task.dueDate;
  }
}
