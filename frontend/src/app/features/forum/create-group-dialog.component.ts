import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-group-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <div class="create-group-dialog">
      <h2 mat-dialog-title>
        <span class="title-icon">👥</span>
        Create New Study Group
      </h2>
      <p class="subtitle">Fill in the details below</p>
      
      <mat-dialog-content>
        <form [formGroup]="groupForm" class="group-form">
          <div class="form-group">
            <label class="form-label">Group Name <span class="required">*</span></label>
            <input class="form-input" 
                   formControlName="name" 
                   placeholder="Enter group name">
            <span class="error-text" *ngIf="groupForm.get('name')?.hasError('required') && groupForm.get('name')?.touched">
              Group name is required
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Description <span class="required">*</span></label>
            <textarea class="form-input" 
                      formControlName="description" 
                      placeholder="Describe your study group"
                      rows="4"></textarea>
            <span class="error-text" *ngIf="groupForm.get('description')?.hasError('required') && groupForm.get('description')?.touched">
              Description is required
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Category <span class="required">*</span></label>
            <select class="form-input" formControlName="category">
              <option value="" disabled selected>Select category</option>
              <option value="Programming">📚 Programming</option>
              <option value="Data Science">📊 Data Science</option>
              <option value="Design">🎨 Design</option>
              <option value="Business">💼 Business</option>
              <option value="Languages">🌍 Languages</option>
              <option value="Career">🚀 Career</option>
            </select>
            <span class="error-text" *ngIf="groupForm.get('category')?.hasError('required') && groupForm.get('category')?.touched">
              Please select a category
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Tags (comma separated)</label>
            <input class="form-input" 
                   formControlName="tags" 
                   placeholder="e.g., python, java, beginner">
          </div>

          <div class="checkbox-wrapper">
            <label class="checkbox-label">
              <input type="checkbox" 
                     formControlName="isPrivate"
                     class="checkbox-input">
              <span class="checkbox-text">Make this group private</span>
            </label>
            <p class="helper-text">Private groups require approval to join</p>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button class="cancel-btn" (click)="onCancel()">
          Cancel
        </button>
        <button class="create-btn" 
                (click)="onCreate()" 
                [disabled]="!groupForm.valid">
          <span class="btn-icon">✨</span>
          Create Group
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .create-group-dialog {
      min-width: 600px;
      max-width: 700px;
      background: linear-gradient(to bottom, #faf5ff 0%, #ffffff 100%);
      border-radius: 20px;
      overflow: hidden;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: white;
      margin: 0;
      padding: 24px 32px 20px 32px;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .subtitle {
      margin: 0;
      padding: 0 32px 20px 32px;
      color: #6b7280;
      font-size: 14px;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: rgba(255, 255, 255, 0.9);
    }

    .title-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-icon {
      font-size: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    mat-dialog-content {
      padding: 32px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .group-form {
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
      border-color: #a855f7;
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
    }

    .form-input:hover {
      border-color: #d1d5db;
    }

    .form-input::placeholder {
      color: #9ca3af;
    }

    textarea.form-input {
      resize: vertical;
      min-height: 100px;
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

    .checkbox-wrapper {
      padding: 14px 20px 12px 20px;
      margin-top: 6px;
      margin-bottom: 12px;
      background: #faf5ff;
      border: 2px solid #e9d5ff;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      justify-content: flex-start;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 2px 0;
    }

    .checkbox-input {
      width: 18px;
      height: 18px;
      min-width: 18px;
      min-height: 18px;
      cursor: pointer;
      accent-color: #a855f7;
      flex-shrink: 0;
    }

    .checkbox-text {
      user-select: none;
      font-size: 15px;
      font-weight: 600;
      color: #374151;
      line-height: 1.4;
    }

    .helper-text {
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 0 32px;
      font-style: italic;
      line-height: 1.5;
    }

    mat-dialog-actions {
      padding: 20px 32px 24px 32px;
      gap: 12px;
      display: flex !important;
      justify-content: flex-end;
      border-top: 1px solid #f3f4f6;
      background: white;
      position: sticky;
      bottom: 0;
      z-index: 10;
    }

    .cancel-btn {
      padding: 12px 28px;
      border: none;
      background: #f3f4f6;
      color: #6b7280;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-block;
    }

    .cancel-btn:hover {
      background: #e5e7eb;
      color: #374151;
    }

    .create-btn {
      padding: 12px 28px;
      border: none;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: white;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex !important;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
    }

    .create-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
    }

    .create-btn:disabled {
      background: #d1d5db;
      color: #9ca3af;
      cursor: not-allowed;
      box-shadow: none;
    }
  `]
})
export class CreateGroupDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateGroupDialogComponent>);

  groupForm: FormGroup;

  constructor() {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      tags: [''],
      isPrivate: [false]
    });
  }

  ngOnInit(): void {
    // Reset form completely when dialog opens
    this.groupForm.reset({
      name: '',
      description: '',
      category: '',
      tags: '',
      isPrivate: false
    });
    
    // Clear all validation states
    Object.keys(this.groupForm.controls).forEach(key => {
      const control = this.groupForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
      control?.setErrors(null);
      control?.updateValueAndValidity();
    });
    
    // Ensure form is pristine and untouched initially
    this.groupForm.markAsUntouched();
    this.groupForm.markAsPristine();
  }

  onCreate(): void {
    console.log('Create button clicked');
    console.log('Form valid:', this.groupForm.valid);
    console.log('Form value:', this.groupForm.value);
    console.log('Form errors:', this.groupForm.errors);
    
    // Force validation check
    this.groupForm.updateValueAndValidity();
    
    if (this.groupForm.valid) {
      const formValue = this.groupForm.value;
      const tags = formValue.tags 
        ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];
      
      const result = {
        ...formValue,
        tags,
        createdBy: 'user-123' // Replace with actual user ID
      };
      
      console.log('Closing dialog with result:', result);
      this.dialogRef.close(result);
      
      // Reset form after closing to ensure clean state
      this.groupForm.reset();
    } else {
      console.log('Form is invalid');
      // Mark all fields as touched to show validation errors
      Object.keys(this.groupForm.controls).forEach(key => {
        this.groupForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.groupForm.reset();
    this.dialogRef.close();
  }
}
