import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Task } from '../../core/services/backend-api.service';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  template: `
    <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-t-2xl border-l-4 border-purple-600">
      <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1">
        {{ data.task ? '✏️ Edit Task' : '➕ Create New Task' }}
      </h2>
      <p class="text-sm text-gray-600">Fill in the details below</p>
    </div>
    
    <div class="p-6 bg-white overflow-y-auto scrollable-content">
      <form [formGroup]="taskForm" class="space-y-4">
        <!-- Task Title -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Task Title *</label>
          <input 
            type="text"
            formControlName="title"
            placeholder="Enter task title"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400"
            [class.border-red-400]="taskForm.get('title')?.hasError('required') && taskForm.get('title')?.touched">
          <p *ngIf="taskForm.get('title')?.hasError('required') && taskForm.get('title')?.touched" 
             class="text-red-500 text-xs mt-1">Title is required</p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea 
            formControlName="description"
            placeholder="Enter task description"
            rows="3"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none text-gray-900 placeholder-gray-400"></textarea>
        </div>

        <!-- Due Date -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Due Date *</label>
          <input 
            type="date"
            formControlName="dueDate"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-gray-900"
            [class.border-red-400]="taskForm.get('dueDate')?.hasError('required') && taskForm.get('dueDate')?.touched">
          <p *ngIf="taskForm.get('dueDate')?.hasError('required') && taskForm.get('dueDate')?.touched" 
             class="text-red-500 text-xs mt-1">Due date is required</p>
        </div>

        <!-- Priority and Status -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Priority *</label>
            <select 
              formControlName="priority"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors bg-white text-gray-900">
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select 
              formControlName="status"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors bg-white text-gray-900">
              <option value="TODO">📋 To Do</option>
              <option value="IN_PROGRESS">🔄 In Progress</option>
              <option value="COMPLETED">✅ Completed</option>
            </select>
          </div>
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
          <input 
            type="text"
            formControlName="tagsInput"
            placeholder="e.g., homework, study, project"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400">
          <p class="text-gray-500 text-xs mt-1">Separate tags with commas</p>
        </div>
      </form>
    </div>
    
    <div class="bg-gray-50 p-4 rounded-b-2xl flex justify-end gap-3">
      <button 
        (click)="onCancel()" 
        class="px-6 py-2 text-gray-700 bg-white border-2 border-gray-300 font-semibold rounded-lg hover:bg-gray-100 transition-all">
        Cancel
      </button>
      <button 
        (click)="onSave()" 
        [disabled]="!taskForm.valid"
        class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
        {{ data.task ? '💾 Update Task' : '✨ Create Task' }}
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    :host ::ng-deep .mat-mdc-dialog-container {
      --mdc-dialog-container-shape: 16px;
      overflow: visible !important;
      padding: 0 !important;
    }

    :host ::ng-deep .mat-mdc-dialog-surface {
      padding: 0 !important;
      overflow: visible !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .scrollable-content {
      max-height: 60vh;
      overflow-y: auto;
    }

    .scrollable-content::-webkit-scrollbar {
      width: 8px;
    }

    .scrollable-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .scrollable-content::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #9333ea, #ec4899);
      border-radius: 10px;
    }

    .scrollable-content::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(to bottom, #7e22ce, #db2777);
    }

    .w-full {
      width: 100%;
    }

    .space-y-4 > * + * {
      margin-top: 1rem;
    }

    .grid {
      display: grid;
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .gap-3 {
      gap: 0.75rem;
    }

    .gap-4 {
      gap: 1rem;
    }

    input[type="date"]::-webkit-calendar-picker-indicator {
      cursor: pointer;
      filter: opacity(0.5);
    }

    input[type="date"]::-webkit-calendar-picker-indicator:hover {
      filter: opacity(1);
    }
  `]
})
export class TaskDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  taskForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: Task; userId: string }
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      priority: ['Medium', Validators.required],
      status: ['TODO'],
      tagsInput: ['']
    });
  }

  ngOnInit() {
    if (this.data.task) {
      // Populate form with existing task data
      const tagsString = this.data.task.tags?.join(', ') || '';
      const taskDeadline = this.data.task.deadline || this.data.task.dueDate;
      
      // Format date to YYYY-MM-DD for date input
      let formattedDate = '';
      if (taskDeadline) {
        const date = new Date(taskDeadline);
        formattedDate = date.toISOString().split('T')[0];
      }
      
      this.taskForm.patchValue({
        title: this.data.task.title,
        description: this.data.task.description || '',
        dueDate: formattedDate,
        priority: this.data.task.priority,
        status: this.data.task.status,
        tagsInput: tagsString
      });
    } else {
      // Set default date to today in YYYY-MM-DD format
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];
      this.taskForm.patchValue({
        dueDate: formattedToday
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      
      // Process tags from comma-separated string to array
      const tags = formValue.tagsInput
        ? formValue.tagsInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];
      
      // Convert date to LocalDateTime format for backend (YYYY-MM-DDTHH:mm:ss)
      let deadlineDateTime = '';
      if (formValue.dueDate) {
        const date = new Date(formValue.dueDate);
        // Set time to end of day (23:59:59)
        date.setHours(23, 59, 59, 0);
        deadlineDateTime = date.toISOString().slice(0, 19); // Format: YYYY-MM-DDTHH:mm:ss
      }
      
      const taskData = {
        title: formValue.title,
        description: formValue.description,
        deadline: deadlineDateTime, // Use deadline to match backend
        priority: formValue.priority,
        status: formValue.status,
        tags: tags,
        userId: this.data.userId
      };
      
      console.log('Task data being sent:', taskData);
      console.log('Deadline format:', deadlineDateTime);
      
      this.dialogRef.close(taskData);
    } else {
      console.error('Form is invalid:', this.taskForm.errors);
    }
  }
}
