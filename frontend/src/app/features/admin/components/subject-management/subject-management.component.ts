import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Subject, Interest, Goal } from '../../models/admin.interface';

@Component({
  selector: 'app-subject-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Subject Management</h1>
          <p class="text-gray-600 mt-1">Manage course subjects with difficulty, prerequisites, and roadmap order</p>
        </div>
        <button (click)="openCreateModal()"
                class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg">
          <span class="text-xl">➕</span>
          <span>Add Subject</span>
        </button>
      </div>

      <!-- Subjects Table -->
      @if (subjects().length === 0) {
        <div class="bg-white rounded-xl shadow-lg p-12 text-center">
          <div class="text-6xl mb-4">📚</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Subjects Yet</h3>
          <p class="text-gray-600 mb-4">Get started by creating your first subject</p>
          <button (click)="openCreateModal()"
                  class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Create First Subject
          </button>
        </div>
      } @else {
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Subject Name</th>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Interest</th>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Goal</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Difficulty</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Duration</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Order</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (subject of subjects(); track subject.id) {
                <tr class="hover:bg-purple-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-semibold text-gray-900">{{subject.name}}</div>
                    <div class="text-sm text-gray-500">{{subject.description}}</div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-700">
                    {{getInterestName(subject.interestId)}}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-700">
                    {{getGoalName(subject.goalId)}}
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span [class]="getDifficultyBadgeClass(subject.difficultyLevel)">
                      {{subject.difficultyLevel}}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="text-sm font-medium text-gray-900">{{subject.durationWeeks}} weeks</span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      #{{subject.roadmapOrder}}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <button (click)="toggleStatus(subject)"
                            [class]="subject.enabled ? 
                              'px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 hover:bg-green-200' : 
                              'px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 hover:bg-gray-200'">
                      {{subject.enabled ? '✓ Active' : '✗ Inactive'}}
                    </button>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button (click)="editSubject(subject)"
                              class="text-indigo-600 hover:text-indigo-900 font-medium text-sm">
                        ✏️ Edit
                      </button>
                      <button (click)="deleteSubject(subject.id!)"
                              class="text-red-600 hover:text-red-900 font-medium text-sm">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Modal Form -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" (click)="closeModal()">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 class="text-2xl font-bold">{{isEditMode() ? 'Edit Subject' : 'Create New Subject'}}</h2>
              <button (click)="closeModal()" class="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            
            <form (ngSubmit)="saveSubject()" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                <input type="text" 
                       [(ngModel)]="formData.name" 
                       name="name"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                       placeholder="Enter subject name (e.g., Introduction to Python)"
                       required>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea [(ngModel)]="formData.description" 
                          name="description"
                          rows="3"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                          placeholder="Enter a brief description of the subject"
                          required></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Interest *</label>
                  <select [(ngModel)]="formData.interestId" 
                          name="interestId"
                          (change)="onInterestChange()"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                          required>
                    <option value="" class="text-gray-500">-- Select Interest --</option>
                    @for (interest of enabledInterests; track interest.id) {
                      <option [value]="interest.id" class="text-gray-900">{{interest.name}}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Goal *</label>
                  <select [(ngModel)]="formData.goalId" 
                          name="goalId"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                          required>
                    <option value="" class="text-gray-500">-- Select Goal --</option>
                    @for (goal of filteredGoals(); track goal.id) {
                      <option [value]="goal.id" class="text-gray-900">{{goal.name}}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                  <select [(ngModel)]="formData.difficultyLevel" 
                          name="difficultyLevel"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                          required>
                    <option value="Beginner" class="text-gray-900">🟢 Beginner</option>
                    <option value="Intermediate" class="text-gray-900">🟡 Intermediate</option>
                    <option value="Advanced" class="text-gray-900">🔴 Advanced</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Duration (weeks) *</label>
                  <input type="number" 
                         [(ngModel)]="formData.durationWeeks" 
                         name="durationWeeks"
                         min="1"
                         placeholder="e.g., 4"
                         class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                         required>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Roadmap Order *</label>
                  <input type="number" 
                         [(ngModel)]="formData.roadmapOrder" 
                         name="roadmapOrder"
                         min="1"
                         placeholder="e.g., 1"
                         class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                         required>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
                <div class="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  @for (subject of availablePrerequisites(); track subject.id) {
                    <label class="flex items-center space-x-2 py-1 hover:bg-gray-50 px-2 rounded">
                      <input type="checkbox"
                             [checked]="isPrerequisiteSelected(subject.id!)"
                             (change)="togglePrerequisite(subject.id!)"
                             class="rounded text-purple-600">
                      <span class="text-sm text-gray-700">{{subject.name}}</span>
                    </label>
                  }
                  @if (availablePrerequisites().length === 0) {
                    <p class="text-sm text-gray-500">No subjects available as prerequisites</p>
                  }
                </div>
              </div>

              <div>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" 
                         [(ngModel)]="formData.enabled" 
                         name="enabled"
                         class="rounded text-purple-600">
                  <span class="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" 
                        (click)="closeModal()"
                        class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                  Cancel
                </button>
                <button type="submit"
                        class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium">
                  {{isEditMode() ? 'Update' : 'Create'}} Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class SubjectManagementComponent implements OnInit {
  subjects = signal<Subject[]>([]);
  interests = signal<Interest[]>([]);
  goals = signal<Goal[]>([]);
  filteredGoals = signal<Goal[]>([]);
  
  // For dropdowns - only enabled items
  get enabledInterests(): Interest[] {
    return this.interests().filter(i => i.enabled);
  }
  
  get enabledGoals(): Goal[] {
    return this.goals().filter(g => g.enabled);
  }
  availablePrerequisites = signal<Subject[]>([]);
  showModal = signal(false);
  isEditMode = signal(false);
  editingId = signal<string | null>(null);

  formData: Subject = this.getEmptyForm();

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Load interests first
    this.adminService.getAllInterests().subscribe(interests => {
      console.log('Loaded interests:', interests);
      this.interests.set(interests); // Don't filter here - we need all for display
    });
    
    // Load goals
    this.adminService.getAllGoals().subscribe(goals => {
      console.log('Loaded goals:', goals);
      this.goals.set(goals); // Don't filter here - we need all for display
    });
    
    // Load subjects
    this.adminService.getAllSubjects().subscribe(subjects => {
      console.log('Loaded subjects:', subjects);
      this.subjects.set(subjects);
    });
  }

  getEmptyForm(): Subject {
    return {
      name: '',
      description: '',
      interestId: '',
      goalId: '',
      difficultyLevel: 'Beginner',
      durationWeeks: 1,
      prerequisites: [],
      roadmapOrder: 1,
      enabled: true
    };
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.editingId.set(null);
    this.formData = this.getEmptyForm();
    this.filteredGoals.set([]);
    this.updateAvailablePrerequisites();
    this.showModal.set(true);
  }

  editSubject(subject: Subject) {
    this.isEditMode.set(true);
    this.editingId.set(subject.id!);
    this.formData = { ...subject, prerequisites: [...(subject.prerequisites || [])] };
    this.onInterestChange();
    this.updateAvailablePrerequisites();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.formData = this.getEmptyForm();
  }

  onInterestChange() {
    console.log('Interest changed to:', this.formData.interestId);
    console.log('Available goals:', this.goals());
    
    const filtered = this.goals().filter(g => 
      g.enabled && g.interestIds.includes(this.formData.interestId)
    );
    console.log('Filtered goals:', filtered);
    this.filteredGoals.set(filtered);
    
    if (!filtered.find(g => g.id === this.formData.goalId)) {
      this.formData.goalId = '';
    }
  }

  updateAvailablePrerequisites() {
    const available = this.subjects().filter(s => 
      s.id !== this.editingId() && s.enabled
    );
    this.availablePrerequisites.set(available);
  }

  isPrerequisiteSelected(id: string): boolean {
    return this.formData.prerequisites.includes(id);
  }

  togglePrerequisite(id: string) {
    const index = this.formData.prerequisites.indexOf(id);
    if (index > -1) {
      this.formData.prerequisites.splice(index, 1);
    } else {
      this.formData.prerequisites.push(id);
    }
  }

  saveSubject() {
    const operation = this.isEditMode() 
      ? this.adminService.updateSubject(this.editingId()!, this.formData)
      : this.adminService.createSubject(this.formData);

    operation.subscribe({
      next: () => {
        this.loadData();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving subject:', err);
        alert('Failed to save subject. Please try again.');
      }
    });
  }

  toggleStatus(subject: Subject) {
    this.adminService.toggleSubjectStatus(subject.id!, !subject.enabled).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error toggling status:', err)
    });
  }

  deleteSubject(id: string) {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.adminService.deleteSubject(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting subject:', err)
      });
    }
  }

  getInterestName(id: string): string {
    if (!id) return 'N/A';
    const interest = this.interests().find(i => i.id === id);
    console.log(`Looking for interest ${id}, found:`, interest);
    return interest?.name || 'N/A';
  }

  getGoalName(id: string): string {
    if (!id) return 'N/A';
    const goal = this.goals().find(g => g.id === id);
    console.log(`Looking for goal ${id}, found:`, goal);
    return goal?.name || 'N/A';
  }

  getDifficultyBadgeClass(level: string): string {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-bold ';
    switch(level) {
      case 'Beginner': return baseClasses + 'bg-green-100 text-green-800';
      case 'Intermediate': return baseClasses + 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return baseClasses + 'bg-red-100 text-red-800';
      default: return baseClasses + 'bg-gray-100 text-gray-800';
    }
  }
}
