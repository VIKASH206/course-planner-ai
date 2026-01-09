import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeModal()">
      <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-lg">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-3 py-1 bg-white/20 rounded-full text-sm">{{ course.category }}</span>
                <span class="px-3 py-1 bg-white/20 rounded-full text-sm">{{ course.difficulty }}</span>
              </div>
              <h2 class="text-3xl font-bold mb-2">{{ course.title }}</h2>
              <div class="flex items-center gap-4 text-sm">
                <span *ngIf="course.instructor">👨‍🏫 {{ course.instructor }}</span>
                <span *ngIf="course.duration">⏱️ {{ course.duration }} hours</span>
                <span *ngIf="course.rating">⭐ {{ course.rating }}/5.0</span>
                <span *ngIf="course.studentsCount">👥 {{ course.studentsCount }} students</span>
              </div>
            </div>
            <button 
              (click)="closeModal()" 
              class="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- AI Recommendation Reason (if available) -->
          <div *ngIf="course.reason" class="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 p-4 rounded-lg mb-6">
            <h3 class="text-lg font-semibold text-purple-900 mb-2">💡 Why This Course?</h3>
            <p class="text-purple-800">{{ course.reason }}</p>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">📖 About This Course</h3>
            <p class="text-gray-700 leading-relaxed">{{ course.description || 'No description available.' }}</p>
          </div>

          <!-- Learning Outcomes -->
          <div *ngIf="course.learningOutcomes && course.learningOutcomes.length > 0" class="mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">🎯 What You'll Learn</h3>
            <ul class="space-y-2">
              <li *ngFor="let outcome of course.learningOutcomes" class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span class="text-gray-700">{{ outcome }}</span>
              </li>
            </ul>
          </div>

          <!-- Prerequisites -->
          <div *ngIf="course.prerequisites && course.prerequisites.length > 0" class="mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">📋 Prerequisites</h3>
            <ul class="space-y-2">
              <li *ngFor="let prereq of course.prerequisites" class="flex items-start gap-2">
                <span class="text-blue-500">•</span>
                <span class="text-gray-700">{{ prereq }}</span>
              </li>
            </ul>
          </div>

          <!-- Tags -->
          <div *ngIf="course.tags && course.tags.length > 0" class="mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">🏷️ Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let tag of course.tags" 
                    class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Course Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-purple-600">{{ course.difficulty || 'N/A' }}</div>
              <div class="text-sm text-gray-600">Difficulty</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-indigo-600">{{ course.duration || 0 }}h</div>
              <div class="text-sm text-gray-600">Duration</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-600">{{ course.rating || 0 }}/5</div>
              <div class="text-sm text-gray-600">Rating</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ course.studentsCount || 0 }}</div>
              <div class="text-sm text-gray-600">Students</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4">
            <button 
              (click)="enrollCourse()"
              class="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg">
              🚀 Enroll Now
            </button>
            <button 
              (click)="addToWishlist()"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors">
              ❤️ Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CourseDetailComponent {
  @Input() course: any;
  @Output() close = new EventEmitter<void>();
  @Output() enroll = new EventEmitter<any>();

  private router = inject(Router);

  closeModal() {
    this.close.emit();
  }

  enrollCourse() {
    console.log('📚 Enrolling in course:', this.course.title);
    this.enroll.emit(this.course);
    // Optionally close modal after enrollment
    // this.closeModal();
  }

  addToWishlist() {
    console.log('❤️ Added to wishlist:', this.course.title);
    // TODO: Implement wishlist functionality
    alert(`Added "${this.course.title}" to your wishlist! 🎉`);
  }
}
