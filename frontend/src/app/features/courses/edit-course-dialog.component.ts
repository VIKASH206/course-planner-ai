import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

import { Course } from '../../shared/models/course.interface';

@Component({
  selector: 'app-edit-course-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="edit-course-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon class="header-icon">edit</mat-icon>
          {{ data.course ? 'Edit Course' : 'Create Course' }}
        </h2>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <form [formGroup]="courseForm" class="course-form">
          <!-- Title -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Course Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter course title" required>
            <mat-icon matPrefix>title</mat-icon>
            <mat-error *ngIf="courseForm.get('title')?.hasError('required')">
              Title is required
            </mat-error>
            <mat-error *ngIf="courseForm.get('title')?.hasError('minlength')">
              Title must be at least 3 characters
            </mat-error>
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea 
              matInput 
              formControlName="description" 
              placeholder="Describe what students will learn"
              rows="4"
              required>
            </textarea>
            <mat-icon matPrefix>description</mat-icon>
            <mat-error *ngIf="courseForm.get('description')?.hasError('required')">
              Description is required
            </mat-error>
            <mat-error *ngIf="courseForm.get('description')?.hasError('minlength')">
              Description must be at least 10 characters
            </mat-error>
          </mat-form-field>

          <!-- Category & Difficulty Row -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category" required>
                <mat-option value="Programming">Programming</mat-option>
                <mat-option value="Web Development">Web Development</mat-option>
                <mat-option value="Mobile Development">Mobile Development</mat-option>
                <mat-option value="Data Science">Data Science</mat-option>
                <mat-option value="Machine Learning">Machine Learning</mat-option>
                <mat-option value="DevOps">DevOps</mat-option>
                <mat-option value="Cloud Computing">Cloud Computing</mat-option>
                <mat-option value="Cybersecurity">Cybersecurity</mat-option>
                <mat-option value="Design">Design</mat-option>
                <mat-option value="Business">Business</mat-option>
              </mat-select>
              <mat-icon matPrefix>category</mat-icon>
              <mat-error *ngIf="courseForm.get('category')?.hasError('required')">
                Category is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Difficulty Level</mat-label>
              <mat-select formControlName="difficulty" required>
                <mat-option value="Beginner">Beginner</mat-option>
                <mat-option value="Intermediate">Intermediate</mat-option>
                <mat-option value="Advanced">Advanced</mat-option>
                <mat-option value="Expert">Expert</mat-option>
              </mat-select>
              <mat-icon matPrefix>signal_cellular_alt</mat-icon>
              <mat-error *ngIf="courseForm.get('difficulty')?.hasError('required')">
                Difficulty is required
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Estimated Time & Price Row -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Estimated Hours</mat-label>
              <input matInput type="number" formControlName="estimatedTime" placeholder="40" min="1">
              <mat-icon matPrefix>schedule</mat-icon>
              <mat-hint>Total course duration in hours</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Price (USD)</mat-label>
              <input matInput type="number" formControlName="price" placeholder="0" min="0" step="0.01">
              <mat-icon matPrefix>attach_money</mat-icon>
              <mat-hint>Set 0 for free</mat-hint>
            </mat-form-field>
          </div>

          <!-- Instructor -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Instructor Name</mat-label>
            <input matInput formControlName="instructor" placeholder="John Doe">
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>

          <!-- Tags -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Tags</mat-label>
            <mat-chip-grid #chipGrid aria-label="Course tags">
              <mat-chip-row
                *ngFor="let tag of tags"
                (removed)="removeTag(tag)"
                [editable]="true">
                {{ tag }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip-row>
              <input
                placeholder="Add tags..."
                [matChipInputFor]="chipGrid"
                [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                [matChipInputAddOnBlur]="true"
                (matChipInputTokenEnd)="addTag($event)"/>
            </mat-chip-grid>
            <mat-icon matPrefix>label</mat-icon>
            <mat-hint>Press Enter to add tags</mat-hint>
          </mat-form-field>

          <!-- Student Count & Rating Row (for display/edit) -->
          <div class="form-row" *ngIf="data.course">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Students Enrolled</mat-label>
              <input matInput type="number" formControlName="studentsCount" min="0">
              <mat-icon matPrefix>people</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Rating</mat-label>
              <input matInput type="number" formControlName="rating" min="0" max="5" step="0.1">
              <mat-icon matPrefix>star</mat-icon>
            </mat-form-field>
          </div>

          <!-- Total Lessons (for editing existing courses) -->
          <mat-form-field appearance="outline" class="full-width" *ngIf="data.course">
            <mat-label>Total Lessons</mat-label>
            <input matInput type="number" formControlName="totalLessons" min="1">
            <mat-icon matPrefix>menu_book</mat-icon>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button mat-dialog-close [disabled]="saving">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onSave()"
          [disabled]="!courseForm.valid || saving">
          <mat-spinner *ngIf="saving" diameter="20" class="button-spinner"></mat-spinner>
          <mat-icon *ngIf="!saving">{{ data.course ? 'save' : 'add' }}</mat-icon>
          {{ saving ? 'Saving...' : (data.course ? 'Update Course' : 'Create Course') }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .edit-course-dialog {
      min-width: 600px;
      max-width: 800px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        color: #1976d2;
      }

      .header-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .close-btn {
        margin-top: -8px;
      }
    }

    mat-dialog-content {
      padding: 0 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .course-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 0;
    }

    .full-width {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 1rem;

      .half-width {
        flex: 1;
      }
    }

    mat-chip-grid {
      min-height: 48px;
    }

    .button-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      
      button {
        min-width: 120px;
        
        mat-icon {
          margin-right: 4px;
        }
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .edit-course-dialog {
        min-width: 90vw;
      }

      .form-row {
        flex-direction: column;
        
        .half-width {
          width: 100%;
        }
      }
    }
  `]
})
export class EditCourseDialogComponent implements OnInit {
  courseForm: FormGroup;
  tags: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  saving = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditCourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { course?: Course }
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      difficulty: ['', Validators.required],
      estimatedTime: ['', [Validators.min(1)]],
      price: [0, [Validators.min(0)]],
      instructor: [''],
      studentsCount: [0, [Validators.min(0)]],
      rating: [0, [Validators.min(0), Validators.max(5)]],
      totalLessons: [1, [Validators.min(1)]]
    });
  }

  ngOnInit() {
    if (this.data.course) {
      this.populateForm(this.data.course);
    }
  }

  private populateForm(course: Course) {
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      estimatedTime: course.estimatedTime,
      price: course.price || 0,
      instructor: course.instructor || '',
      studentsCount: course.studentsCount || 0,
      rating: course.rating || 0,
      totalLessons: course.totalLessons || 1
    });

    if (course.tags) {
      this.tags = [...course.tags];
    }
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onSave() {
    if (this.courseForm.valid) {
      this.saving = true;
      
      const courseData = {
        ...this.courseForm.value,
        tags: this.tags
      };

      // If editing existing course, include the ID
      if (this.data.course) {
        courseData.id = this.data.course.id;
      }

      this.dialogRef.close(courseData);
    }
  }
}
