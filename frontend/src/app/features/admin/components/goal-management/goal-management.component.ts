import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Goal, Interest } from '../../models/admin.interface';

@Component({
  selector: 'app-goal-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Goal Management</h1>
          <p class="text-gray-600 mt-1">Manage career goals and learning objectives</p>
        </div>
        <button (click)="openCreateModal()"
                class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg">
          <span class="text-xl">➕</span>
          <span>Add Goal</span>
        </button>
      </div>

      <!-- Goals Table -->
      @if (goals().length === 0) {
        <div class="bg-white rounded-xl shadow-lg p-12 text-center">
          <div class="text-6xl mb-4">🎯</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Goals Yet</h3>
          <p class="text-gray-600 mb-4">Get started by creating your first goal</p>
          <button (click)="openCreateModal()"
                  class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Create First Goal
          </button>
        </div>
      } @else {
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-green-600 to-teal-600 text-white">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Goal Name</th>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Description</th>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Mapped Interests</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Order</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (goal of sortedGoals(); track goal.id) {
                <tr class="hover:bg-green-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-semibold text-gray-900">{{goal.name}}</div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-700 max-w-md">
                    {{goal.description}}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                      @for (interestId of goal.interestIds; track interestId) {
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {{getInterestName(interestId)}}
                        </span>
                      }
                      @if (!goal.interestIds || goal.interestIds.length === 0) {
                        <span class="text-sm text-gray-400">No interests mapped</span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {{goal.orderIndex}}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <button (click)="toggleStatus(goal)"
                            [class]="goal.enabled ? 
                              'px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 hover:bg-green-200' : 
                              'px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 hover:bg-gray-200'">
                      {{goal.enabled ? '✓ Active' : '✗ Inactive'}}
                    </button>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button (click)="editGoal(goal)"
                              class="text-indigo-600 hover:text-indigo-900 font-medium text-sm">
                        ✏️ Edit
                      </button>
                      <button (click)="deleteGoal(goal.id!)"
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
            <div class="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between sticky top-0">
              <h2 class="text-2xl font-bold">
                {{isEditMode() ? 'Edit Goal' : 'Create New Goal'}}
              </h2>
              <button (click)="closeModal()" class="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            
            <form (ngSubmit)="saveGoal()" class="p-6 space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input type="text"
                       [(ngModel)]="formData().name"
                       name="name"
                       required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                       placeholder="e.g., Get a Job">
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea [(ngModel)]="formData().description"
                          name="description"
                          rows="3"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          placeholder="Describe this goal..."></textarea>
              </div>

              <!-- Icon URL -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Icon URL (optional)</label>
                <input type="url"
                       [(ngModel)]="formData().iconUrl"
                       name="iconUrl"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                       placeholder="https://example.com/icon.png">
              </div>

              <!-- Map to Interests -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Map to Interests</label>
                <div class="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  @for (interest of interests(); track interest.id) {
                    <label class="flex items-center space-x-2 py-1 hover:bg-gray-50 px-2 rounded cursor-pointer">
                      <input type="checkbox"
                             [checked]="isInterestSelected(interest.id!)"
                             (change)="toggleInterest(interest.id!)"
                             class="rounded text-green-600">
                      <span class="text-sm text-gray-700">{{interest.name}}</span>
                    </label>
                  }
                  @if (interests().length === 0) {
                    <p class="text-sm text-gray-500">No interests available. Please create interests first.</p>
                  }
                </div>
              </div>

              <!-- Order Index -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                <input type="number"
                       [(ngModel)]="formData().orderIndex"
                       name="orderIndex"
                       min="0"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                       placeholder="0">
              </div>

              <!-- Enabled Status -->
              <div class="flex items-center">
                <input type="checkbox"
                       [(ngModel)]="formData().enabled"
                       name="enabled"
                       id="enabled"
                       class="rounded text-green-600 mr-2">
                <label for="enabled" class="text-sm font-medium text-gray-700 cursor-pointer">Enable this goal</label>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" 
                        (click)="closeModal()"
                        class="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit"
                        class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  {{isEditMode() ? 'Update' : 'Create'}}
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
export class GoalManagementComponent implements OnInit {
  goals = signal<Goal[]>([]);
  interests = signal<Interest[]>([]);
  showModal = signal(false);
  isEditMode = signal(false);
  editingId = signal<string | null>(null);
  formData = signal<Goal>({
    name: '',
    description: '',
    iconUrl: '',
    interestIds: [],
    enabled: true,
    orderIndex: 0
  });

  sortedGoals = computed(() => {
    return [...this.goals()].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  });

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadGoals();
    this.loadInterests();
  }

  loadGoals() {
    this.adminService.getAllGoals().subscribe({
      next: (goals) => {
        this.goals.set(goals);
        console.log('Loaded goals:', goals);
      },
      error: (err) => {
        console.error('Failed to load goals:', err);
        alert('Failed to load goals. Please try again.');
      }
    });
  }

  loadInterests() {
    this.adminService.getAllInterests().subscribe({
      next: (interests) => {
        this.interests.set(interests);
        console.log('Loaded interests:', interests);
      },
      error: (err) => {
        console.error('Failed to load interests:', err);
      }
    });
  }

  getInterestName(interestId: string): string {
    const interest = this.interests().find(i => i.id === interestId);
    return interest?.name || 'Unknown';
  }

  isInterestSelected(interestId: string): boolean {
    return this.formData().interestIds?.includes(interestId) || false;
  }

  toggleInterest(interestId: string) {
    const current = this.formData();
    const interestIds = current.interestIds || [];
    
    if (interestIds.includes(interestId)) {
      this.formData.set({
        ...current,
        interestIds: interestIds.filter(id => id !== interestId)
      });
    } else {
      this.formData.set({
        ...current,
        interestIds: [...interestIds, interestId]
      });
    }
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.editingId.set(null);
    this.formData.set({
      name: '',
      description: '',
      iconUrl: '',
      interestIds: [],
      enabled: true,
      orderIndex: this.goals().length
    });
    this.showModal.set(true);
  }

  editGoal(goal: Goal) {
    this.isEditMode.set(true);
    this.editingId.set(goal.id!);
    this.formData.set({ ...goal });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.isEditMode.set(false);
    this.editingId.set(null);
  }

  saveGoal() {
    const data = this.formData();
    
    if (!data.name?.trim()) {
      alert('Please enter a goal name');
      return;
    }

    if (this.isEditMode()) {
      this.adminService.updateGoal(this.editingId()!, data).subscribe({
        next: () => {
          alert('Goal updated successfully!');
          this.loadGoals();
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to update goal:', err);
          alert('Failed to update goal. Please try again.');
        }
      });
    } else {
      this.adminService.createGoal(data).subscribe({
        next: () => {
          alert('Goal created successfully!');
          this.loadGoals();
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to create goal:', err);
          alert('Failed to create goal. Please try again.');
        }
      });
    }
  }

  toggleStatus(goal: Goal) {
    const newStatus = !goal.enabled;
    this.adminService.toggleGoalStatus(goal.id!, newStatus).subscribe({
      next: () => {
        this.loadGoals();
      },
      error: (err) => {
        console.error('Failed to toggle goal status:', err);
        alert('Failed to update goal status. Please try again.');
      }
    });
  }

  deleteGoal(id: string) {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    this.adminService.deleteGoal(id).subscribe({
      next: () => {
        alert('Goal deleted successfully!');
        this.loadGoals();
      },
      error: (err) => {
        console.error('Failed to delete goal:', err);
        alert('Failed to delete goal. Please try again.');
      }
    });
  }
}
