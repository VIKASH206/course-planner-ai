import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

export interface DialogData {
  groups: any[];
  selectedGroup?: any;
}

@Component({
  selector: 'app-create-thread-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <div class="create-thread-dialog">
      <div class="dialog-header">
        <h2>
          <span class="title-icon">💬</span>
          Start Discussion Thread
        </h2>
        <p class="subtitle">Fill in the details below</p>
      </div>
      
      <mat-dialog-content>
        <form [formGroup]="threadForm" class="thread-form">
          <div class="form-group">
            <label class="form-label">Select Group <span class="required">*</span></label>
            <select class="form-input" formControlName="groupId">
              <option value="" disabled selected>Select a group</option>
              <option *ngFor="let group of data.groups" [value]="group.id">
                {{ group.name }} ({{ group.category }})
              </option>
            </select>
            <span class="error-text" *ngIf="threadForm.get('groupId')?.hasError('required') && threadForm.get('groupId')?.touched">
              Please select a group
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Thread Title <span class="required">*</span></label>
            <input class="form-input" 
                   formControlName="title" 
                   placeholder="Enter discussion title">
            <span class="error-text" *ngIf="threadForm.get('title')?.hasError('required') && threadForm.get('title')?.touched">
              Title is required
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Content <span class="required">*</span></label>
            <textarea class="form-input" 
                      formControlName="content" 
                      placeholder="Share your thoughts, questions, or ideas..."
                      rows="6"></textarea>
            <span class="error-text" *ngIf="threadForm.get('content')?.hasError('required') && threadForm.get('content')?.touched">
              Content is required
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Tags (comma separated)</label>
            <input class="form-input" 
                   formControlName="tags" 
                   placeholder="e.g., question, help, discussion">
          </div>

          <div class="info-box">
            <span class="info-icon">ℹ️</span>
            <p>Your thread will be visible to all group members. Be respectful and follow community guidelines.</p>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button class="cancel-btn" (click)="onCancel()">
          Cancel
        </button>
        <button class="create-btn" 
                (click)="onCreate()" 
                [disabled]="!threadForm.valid">
          <span class="btn-icon">📤</span>
          Post Thread
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .create-thread-dialog {
      min-width: 600px;
      max-width: 750px;
      width: 100%;
      background: white;
      border-radius: 20px;
      overflow: visible;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }

    .dialog-header {
      background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
      padding: 0;
      border-radius: 20px 20px 0 0;
      overflow: hidden;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
      margin: 0;
      padding: 24px 32px 16px 32px;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.3px;
      word-break: keep-all;
      white-space: nowrap;
    }

    .subtitle {
      margin: 0;
      padding: 0 32px 24px 32px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }

    .title-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .info-icon {
      font-size: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .btn-icon {
      font-size: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    mat-dialog-content {
      padding: 24px;
      max-height: 65vh;
      overflow-y: auto;
      background: #fafafa;
      box-sizing: border-box;
    }

    .thread-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .required {
      color: #ef4444;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 15px;
      color: #1f2937;
      background: white;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-input:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .form-input:hover {
      border-color: #d1d5db;
    }

    .form-input::placeholder {
      color: #9ca3af;
    }

    textarea.form-input {
      resize: vertical;
      min-height: 140px;
    }

    select.form-input {
      cursor: pointer;
      appearance: none;
      background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e');
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 20px;
      padding-right: 40px;
    }

    .error-text {
      font-size: 12px;
      color: #ef4444;
      margin-top: 4px;
    }

    .info-box {
      display: flex;
      gap: 12px;
      padding: 20px;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border-left: 5px solid #3b82f6;
      border-radius: 12px;
      margin-top: 24px;
      align-items: flex-start;
    }

    .info-box mat-icon {
      color: #3b82f6;
      font-size: 22px;
      width: 22px;
      height: 22px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .info-box p {
      margin: 0;
      font-size: 13.5px;
      color: #1e3a8a;
      line-height: 1.5;
      font-weight: 500;
      flex: 1;
      word-break: break-word;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      gap: 12px;
      display: flex !important;
      justify-content: flex-end;
      border-top: 1px solid #f3f4f6;
      background: white;
      margin: 0 !important;
      flex-shrink: 0;
      box-sizing: border-box;
      flex-wrap: wrap;
    }

    .cancel-btn {
      padding: 10px 24px;
      border: none;
      background: #f3f4f6;
      color: #6b7280;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-block;
      white-space: nowrap;
    }

    .cancel-btn:hover {
      background: #e5e7eb;
      color: #374151;
    }

    .create-btn {
      padding: 10px 24px;
      border: none;
      background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
      color: white;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex !important;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      white-space: nowrap;
    }

    .create-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .create-btn:disabled {
      background: #d1d5db;
      color: #9ca3af;
      cursor: not-allowed;
      box-shadow: none;
    }

    mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class CreateThreadDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateThreadDialogComponent>);
  private authService = inject(AuthService);

  threadForm: FormGroup;

  ngOnInit(): void {
    console.log('Dialog opened with groups:', this.data.groups);
    console.log('Selected group:', this.data.selectedGroup);
    
    // Reset form completely when dialog opens
    this.threadForm.reset({
      groupId: this.data.selectedGroup?.id || '',
      title: '',
      content: '',
      tags: ''
    });
    
    // Clear all validation states
    Object.keys(this.threadForm.controls).forEach(key => {
      const control = this.threadForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
      control?.updateValueAndValidity();
    });
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    console.log('Constructor - Groups received:', this.data.groups);
    this.threadForm = this.fb.group({
      groupId: [data.selectedGroup?.id || '', Validators.required],
      title: ['', Validators.required],
      content: ['', Validators.required],
      tags: ['']
    });
  }

  onCreate(): void {
    // Force validation check
    this.threadForm.updateValueAndValidity();
    
    if (this.threadForm.valid) {
      const formValue = this.threadForm.value;
      const tags = formValue.tags 
        ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];
      
      // Get current user data
      const currentUser = this.authService.currentUser();
      const userId = currentUser?.id || 'guest';
      const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'Anonymous';
      const userRole = currentUser?.role || 'student';
      
      this.dialogRef.close({
        ...formValue,
        tags,
        author: {
          id: userId,
          name: userName,
          role: userRole,
          avatar: currentUser?.avatar || ''
        }
      });
      
      // Reset form after closing
      this.threadForm.reset();
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.threadForm.controls).forEach(key => {
        this.threadForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.threadForm.reset();
    this.dialogRef.close();
  }
}
