import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AIRule, Interest, Goal, Subject } from '../../models/admin.interface';

@Component({
  selector: 'app-ai-rule-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">AI Rule Configuration</h1>
          <p class="text-gray-600 mt-1">Define recommendation rules with priority and weight-based logic</p>
        </div>
        <button (click)="openCreateModal()"
                class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg">
          <span class="text-xl">🤖</span>
          <span>Create Rule</span>
        </button>
      </div>

      <!-- AI Rules Table -->
      @if (aiRules().length === 0) {
        <div class="bg-white rounded-xl shadow-lg p-12 text-center">
          <div class="text-6xl mb-4">🤖</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No AI Rules Yet</h3>
          <p class="text-gray-600 mb-4">Create intelligent recommendation rules based on user interests, goals, and experience</p>
          <button (click)="openCreateModal()"
                  class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Create First Rule
          </button>
        </div>
      } @else {
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-red-600 to-pink-600 text-white">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Rule Name</th>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Conditions</th>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Subjects</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Priority</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Weight</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (rule of sortedRules(); track rule.id) {
                <tr class="hover:bg-red-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-semibold text-gray-900">{{rule.name}}</div>
                    <div class="text-xs text-gray-500">{{rule.description}}</div>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <div class="space-y-1">
                      <div><span class="font-medium">Interest:</span> {{getInterestName(rule.interestId)}}</div>
                      <div><span class="font-medium">Goal:</span> {{getGoalName(rule.goalId)}}</div>
                      <div><span class="font-medium">Level:</span> 
                        <span [class]="getExperienceBadgeClass(rule.experienceLevel || '')">
                          {{rule.experienceLevel || 'N/A'}}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                      @for (subjectId of rule.subjectIds; track subjectId; let i = $index) {
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {{i + 1}}. {{getSubjectName(subjectId)}}
                        </span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800">
                      {{rule.priority}}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="text-sm font-medium text-gray-900">{{rule.weight}}</span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <button (click)="toggleStatus(rule)"
                            [class]="rule.enabled ? 
                              'px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 hover:bg-green-200' : 
                              'px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 hover:bg-gray-200'">
                      {{rule.enabled ? '✓ Active' : '✗ Inactive'}}
                    </button>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button (click)="editRule(rule)"
                              class="text-indigo-600 hover:text-indigo-900 font-medium text-sm">
                        ✏️ Edit
                      </button>
                      <button (click)="deleteRule(rule.id!)"
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
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between sticky top-0">
              <h2 class="text-2xl font-bold">
                {{isEditMode() ? 'Edit AI Rule' : 'Create New AI Rule'}}
              </h2>
              <button (click)="closeModal()" class="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            
            <form (ngSubmit)="saveRule()" class="p-6 space-y-4">
              <!-- Rule Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Rule Name *</label>
                <input type="text"
                       [(ngModel)]="formData().name"
                       name="name"
                       required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                       placeholder="e.g., Python for Data Science Beginners">
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea [(ngModel)]="formData().description"
                          name="description"
                          rows="2"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                          placeholder="Describe this rule..."></textarea>
              </div>

              <!-- Conditions Section -->
              <div class="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 class="font-semibold text-gray-900 mb-2">🎯 Conditions</h3>
                
                <div class="grid grid-cols-3 gap-3">
                  <!-- Interest -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Interest *</label>
                    <select [(ngModel)]="formData().interestId"
                            name="interestId"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900 text-sm">
                      <option value="">Select...</option>
                      @for (interest of interests(); track interest.id) {
                        <option [value]="interest.id">{{interest.name}}</option>
                      }
                    </select>
                  </div>

                  <!-- Goal -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Goal *</label>
                    <select [(ngModel)]="formData().goalId"
                            name="goalId"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900 text-sm">
                      <option value="">Select...</option>
                      @for (goal of goals(); track goal.id) {
                        <option [value]="goal.id">{{goal.name}}</option>
                      }
                    </select>
                  </div>

                  <!-- Experience Level -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
                    <select [(ngModel)]="formData().experienceLevel"
                            name="experienceLevel"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900 text-sm">
                      <option value="">Select...</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Subjects Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">📚 Recommended Subjects (in order) *</label>
                <div class="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                  @for (subject of subjects(); track subject.id) {
                    <label class="flex items-center space-x-2 py-1.5 hover:bg-gray-50 px-2 rounded cursor-pointer">
                      <input type="checkbox"
                             [checked]="isSubjectSelected(subject.id!)"
                             (change)="toggleSubject(subject.id!)"
                             class="rounded text-red-600">
                      <span class="text-sm text-gray-900 flex-1">{{subject.name}}</span>
                      <span class="text-xs text-gray-500">{{subject.difficultyLevel}}</span>
                    </label>
                  }
                  @if (subjects().length === 0) {
                    <p class="text-sm text-gray-500">No subjects available. Please create subjects first.</p>
                  }
                </div>
                @if (formData().subjectIds && formData().subjectIds!.length > 0) {
                  <div class="mt-2 p-2 bg-blue-50 rounded">
                    <p class="text-xs font-medium text-blue-800 mb-1">Selected Order:</p>
                    <div class="flex flex-wrap gap-1">
                      @for (subjectId of formData().subjectIds; track subjectId; let i = $index) {
                        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {{i + 1}}. {{getSubjectName(subjectId)}}
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Priority and Weight -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                  <input type="number"
                         [(ngModel)]="formData().priority"
                         name="priority"
                         min="1"
                         max="100"
                         required
                         class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                         placeholder="1-100">
                  <p class="text-xs text-gray-500 mt-1">Higher priority rules are evaluated first</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                  <input type="number"
                         [(ngModel)]="formData().weight"
                         name="weight"
                         min="0"
                         step="0.1"
                         class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                         placeholder="0.0-1.0">
                  <p class="text-xs text-gray-500 mt-1">Weight for recommendation scoring</p>
                </div>
              </div>

              <!-- Enabled Status -->
              <div class="flex items-center">
                <input type="checkbox"
                       [(ngModel)]="formData().enabled"
                       name="enabled"
                       id="enabled"
                       class="rounded text-red-600 mr-2">
                <label for="enabled" class="text-sm font-medium text-gray-700 cursor-pointer">Enable this rule</label>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" 
                        (click)="closeModal()"
                        class="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit"
                        class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                  {{isEditMode() ? 'Update' : 'Create'}} Rule
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
export class AIRuleManagementComponent implements OnInit {
  aiRules = signal<AIRule[]>([]);
  interests = signal<Interest[]>([]);
  goals = signal<Goal[]>([]);
  subjects = signal<Subject[]>([]);
  showModal = signal(false);
  isEditMode = signal(false);
  editingId = signal<string | null>(null);
  formData = signal<AIRule>({
    name: '',
    description: '',
    interestId: '',
    goalId: '',
    experienceLevel: '',
    subjectIds: [],
    subjectOrder: [],
    priority: 50,
    weight: 1.0,
    enabled: true
  });

  sortedRules = computed(() => {
    return [...this.aiRules()].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  });

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadRules();
    this.loadInterests();
    this.loadGoals();
    this.loadSubjects();
  }

  loadRules() {
    this.adminService.getAllAIRules().subscribe({
      next: (rules) => {
        this.aiRules.set(rules);
        console.log('Loaded AI rules:', rules);
      },
      error: (err) => {
        console.error('Failed to load AI rules:', err);
      }
    });
  }

  loadInterests() {
    this.adminService.getAllInterests().subscribe({
      next: (interests) => this.interests.set(interests),
      error: (err) => console.error('Failed to load interests:', err)
    });
  }

  loadGoals() {
    this.adminService.getAllGoals().subscribe({
      next: (goals) => this.goals.set(goals),
      error: (err) => console.error('Failed to load goals:', err)
    });
  }

  loadSubjects() {
    this.adminService.getAllSubjects().subscribe({
      next: (subjects) => this.subjects.set(subjects),
      error: (err) => console.error('Failed to load subjects:', err)
    });
  }

  getInterestName(interestId: string): string {
    return this.interests().find(i => i.id === interestId)?.name || 'Unknown';
  }

  getGoalName(goalId: string): string {
    return this.goals().find(g => g.id === goalId)?.name || 'Unknown';
  }

  getSubjectName(subjectId: string): string {
    return this.subjects().find(s => s.id === subjectId)?.name || 'Unknown';
  }

  getExperienceBadgeClass(level: string): string {
    const classes = 'px-2 py-1 rounded text-xs font-medium ';
    switch(level) {
      case 'Beginner': return classes + 'bg-green-100 text-green-800';
      case 'Intermediate': return classes + 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return classes + 'bg-red-100 text-red-800';
      default: return classes + 'bg-gray-100 text-gray-800';
    }
  }

  isSubjectSelected(subjectId: string): boolean {
    return this.formData().subjectIds?.includes(subjectId) || false;
  }

  toggleSubject(subjectId: string) {
    const current = this.formData();
    const subjectIds = current.subjectIds || [];
    
    if (subjectIds.includes(subjectId)) {
      this.formData.set({
        ...current,
        subjectIds: subjectIds.filter(id => id !== subjectId)
      });
    } else {
      this.formData.set({
        ...current,
        subjectIds: [...subjectIds, subjectId]
      });
    }
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.editingId.set(null);
    this.formData.set({
      name: '',
      description: '',
      interestId: '',
      goalId: '',
      experienceLevel: '',
      subjectIds: [],
      subjectOrder: [],
      priority: 50,
      weight: 1.0,
      enabled: true
    });
    this.showModal.set(true);
  }

  editRule(rule: AIRule) {
    this.isEditMode.set(true);
    this.editingId.set(rule.id!);
    this.formData.set({ ...rule });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.isEditMode.set(false);
    this.editingId.set(null);
  }

  saveRule() {
    const data = this.formData();
    
    if (!data.name?.trim()) {
      alert('Please enter a rule name');
      return;
    }
    if (!data.interestId || !data.goalId || !data.experienceLevel) {
      alert('Please select all conditions (Interest, Goal, and Experience Level)');
      return;
    }
    if (!data.subjectIds || data.subjectIds.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    if (this.isEditMode()) {
      this.adminService.updateAIRule(this.editingId()!, data).subscribe({
        next: () => {
          alert('AI Rule updated successfully!');
          this.loadRules();
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to update AI rule:', err);
          alert('Failed to update AI rule. Please try again.');
        }
      });
    } else {
      this.adminService.createAIRule(data).subscribe({
        next: () => {
          alert('AI Rule created successfully!');
          this.loadRules();
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to create AI rule:', err);
          alert('Failed to create AI rule. Please try again.');
        }
      });
    }
  }

  toggleStatus(rule: AIRule) {
    const newStatus = !rule.enabled;
    this.adminService.toggleAIRuleStatus(rule.id!, newStatus).subscribe({
      next: () => {
        this.loadRules();
      },
      error: (err) => {
        console.error('Failed to toggle AI rule status:', err);
        alert('Failed to update AI rule status. Please try again.');
      }
    });
  }

  deleteRule(id: string) {
    if (!confirm('Are you sure you want to delete this AI rule?')) {
      return;
    }

    this.adminService.deleteAIRule(id).subscribe({
      next: () => {
        alert('AI Rule deleted successfully!');
        this.loadRules();
      },
      error: (err) => {
        console.error('Failed to delete AI rule:', err);
        alert('Failed to delete AI rule. Please try again.');
      }
    });
  }
}
