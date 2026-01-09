import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AIContentService } from '../../../core/services/ai-content.service';

@Component({
  selector: 'app-add-course-ai',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container mx-auto p-6 max-w-4xl">
      <mat-card class="mb-6">
        <mat-card-header>
          <mat-card-title class="text-3xl font-bold flex items-center gap-3">
            <mat-icon class="text-4xl">auto_awesome</mat-icon>
            AI-Powered Course Creator
          </mat-card-title>
          <mat-card-subtitle>Enter course details and let AI generate description, tags, and image</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="mt-6">
          <!-- Course Title -->
          <mat-form-field appearance="outline" class="w-full mb-4">
            <mat-label>Course Title *</mat-label>
            <input matInput 
                   [(ngModel)]="courseTitle" 
                   placeholder="e.g., Python for Beginners"
                   (input)="onTitleChange()">
            <mat-icon matSuffix>title</mat-icon>
          </mat-form-field>

          <!-- Category Selection -->
          <mat-form-field appearance="outline" class="w-full mb-4">
            <mat-label>Category *</mat-label>
            <mat-select [(ngModel)]="courseCategory" (selectionChange)="onCategoryChange()">
              <mat-option *ngFor="let cat of categories" [value]="cat">
                {{cat}}
              </mat-option>
            </mat-select>
            <mat-icon matSuffix>category</mat-icon>
          </mat-form-field>

          <!-- AI Generate Button -->
          <div class="flex gap-3 mb-6">
            <button mat-raised-button 
                    color="primary" 
                    (click)="generateAIContent()"
                    [disabled]="!courseTitle || !courseCategory || isGenerating()"
                    class="flex-1">
              <mat-icon>auto_awesome</mat-icon>
              <span *ngIf="!isGenerating()">Generate AI Content</span>
              <span *ngIf="isGenerating()">Generating...</span>
            </button>
            
            <button mat-button 
                    (click)="clearAll()"
                    [disabled]="isGenerating()">
              <mat-icon>clear</mat-icon>
              Clear
            </button>
          </div>

          <!-- Loading Spinner -->
          <div *ngIf="isGenerating()" class="flex justify-center items-center py-8">
            <mat-spinner diameter="50"></mat-spinner>
            <span class="ml-4 text-lg">AI is generating content...</span>
          </div>

          <!-- Generated Content Preview -->
          <div *ngIf="generatedContent() && !isGenerating()" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <mat-icon class="text-green-600">check_circle</mat-icon>
                <span class="font-semibold text-green-800">AI Content Generated!</span>
              </div>
            </div>

            <!-- Image Preview -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Course Image</label>
              <div class="h-48 rounded-lg overflow-hidden flex items-center justify-center"
                   [style.background]="getGradientStyle(generatedContent()?.imageUrl)">
                <div class="text-center">
                  <div class="text-6xl mb-2">{{generatedContent()?.emoji}}</div>
                  <div class="text-white text-sm font-semibold">{{courseCategory}}</div>
                </div>
              </div>
            </div>

            <!-- Description -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>AI Generated Description</mat-label>
              <textarea matInput 
                        [(ngModel)]="description"
                        rows="4"
                        placeholder="AI will generate description..."></textarea>
              <mat-icon matSuffix>description</mat-icon>
              <mat-hint>You can edit this before saving</mat-hint>
            </mat-form-field>

            <!-- Tags -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                AI Generated Tags
              </label>
              <mat-chip-set>
                <mat-chip *ngFor="let tag of tags" 
                          [removable]="true"
                          (removed)="removeTag(tag)">
                  {{tag}}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              </mat-chip-set>
            </div>

            <!-- Additional Fields -->
            <div class="grid grid-cols-2 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Instructor</mat-label>
                <input matInput [(ngModel)]="instructor" placeholder="Instructor name">
                <mat-icon matSuffix>person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Difficulty</mat-label>
                <mat-select [(ngModel)]="difficulty">
                  <mat-option value="Beginner">Beginner</mat-option>
                  <mat-option value="Intermediate">Intermediate</mat-option>
                  <mat-option value="Advanced">Advanced</mat-option>
                  <mat-option value="Expert">Expert</mat-option>
                </mat-select>
                <mat-icon matSuffix>signal_cellular_alt</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estimated Time (hours)</mat-label>
                <input matInput type="number" [(ngModel)]="estimatedTime" placeholder="e.g., 20">
                <mat-icon matSuffix>schedule</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Rating</mat-label>
                <input matInput type="number" step="0.1" min="0" max="5" [(ngModel)]="rating" placeholder="e.g., 4.5">
                <mat-icon matSuffix>star</mat-icon>
              </mat-form-field>
            </div>

            <!-- Save Button -->
            <div class="flex gap-3 mt-6">
              <button mat-raised-button 
                      color="accent" 
                      (click)="saveCourse()"
                      class="flex-1">
                <mat-icon>save</mat-icon>
                Save Course to Database
              </button>
              
              <button mat-button (click)="clearAll()">
                <mat-icon>cancel</mat-icon>
                Cancel
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Info Card -->
      <mat-card class="bg-blue-50">
        <mat-card-content>
          <div class="flex items-start gap-3">
            <mat-icon class="text-blue-600">info</mat-icon>
            <div>
              <h3 class="font-semibold text-blue-900 mb-1">How it works:</h3>
              <ol class="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Enter course title and select category</li>
                <li>Click "Generate AI Content" button</li>
                <li>AI will automatically create description, tags, and select appropriate image</li>
                <li>Review and edit the generated content if needed</li>
                <li>Click "Save Course" to add it to the database</li>
              </ol>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 0;
    }

    mat-card {
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .mat-mdc-form-field {
      width: 100%;
    }
  `]
})
export class AddCourseAIComponent {
  // Form fields
  courseTitle = '';
  courseCategory = '';
  description = '';
  tags: string[] = [];
  instructor = '';
  difficulty = 'Beginner';
  estimatedTime = 20;
  rating = 4.5;

  // State
  isGenerating = signal(false);
  generatedContent = signal<any>(null);

  // Categories
  categories = [
    'Programming',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'AI',
    'Artificial Intelligence',
    'DevOps',
    'Cloud Computing',
    'Cybersecurity',
    'Design',
    'Business',
    'Database',
    'Networking',
    'Game Development',
    'Blockchain',
    'Technology'
  ];

  constructor(
    private aiContentService: AIContentService,
    private snackBar: MatSnackBar
  ) {}

  onTitleChange() {
    // Auto-detect difficulty from title
    const titleLower = this.courseTitle.toLowerCase();
    if (titleLower.includes('beginner') || titleLower.includes('introduction')) {
      this.difficulty = 'Beginner';
    } else if (titleLower.includes('advanced')) {
      this.difficulty = 'Advanced';
    } else if (titleLower.includes('intermediate')) {
      this.difficulty = 'Intermediate';
    }
  }

  onCategoryChange() {
    // Could trigger preview update
  }

  generateAIContent() {
    if (!this.courseTitle || !this.courseCategory) {
      this.snackBar.open('Please enter title and select category', 'Close', {
        duration: 3000
      });
      return;
    }

    this.isGenerating.set(true);

    this.aiContentService.enhanceCourse(this.courseTitle, this.courseCategory)
      .subscribe({
        next: (content) => {
          this.generatedContent.set(content);
          this.description = content.description;
          this.tags = content.tags;
          this.isGenerating.set(false);
          
          this.snackBar.open('✨ AI content generated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error generating AI content:', error);
          this.isGenerating.set(false);
          this.snackBar.open('Error generating content. Please try again.', 'Close', {
            duration: 3000
          });
        }
      });
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);
  }

  getGradientStyle(imageUrl: string): string {
    const gradients: { [key: string]: string } = {
      'gradient-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'gradient-pink': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'gradient-blue': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'gradient-green': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'gradient-orange': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'gradient-cyan': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'gradient-teal': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'gradient-rose': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'gradient-peach': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'gradient-red': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
      'gradient-lavender': 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
      'gradient-pink-light': 'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
      'gradient-blue-light': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      'gradient-yellow': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      'gradient-orange-red': 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)',
      'gradient-gold': 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
      'gradient-purple-light': 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
    };

    return gradients[imageUrl] || gradients['gradient-purple'];
  }

  saveCourse() {
    const courseData = {
      title: this.courseTitle,
      category: this.courseCategory,
      description: this.description,
      tags: this.tags,
      imageUrl: this.generatedContent()?.imageUrl,
      emoji: this.generatedContent()?.emoji,
      instructor: this.instructor,
      difficulty: this.difficulty,
      estimatedTime: this.estimatedTime,
      rating: this.rating,
      aiGenerated: true
    };

    console.log('Saving course:', courseData);
    
    // TODO: Call API service to save to database
    // this.courseService.createCourse(courseData).subscribe(...)
    
    this.snackBar.open('🎉 Course saved successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });

    // Clear form
    setTimeout(() => this.clearAll(), 1500);
  }

  clearAll() {
    this.courseTitle = '';
    this.courseCategory = '';
    this.description = '';
    this.tags = [];
    this.instructor = '';
    this.difficulty = 'Beginner';
    this.estimatedTime = 20;
    this.rating = 4.5;
    this.generatedContent.set(null);
    this.isGenerating.set(false);
  }
}
