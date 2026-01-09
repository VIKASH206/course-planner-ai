import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Interest } from '../../models/admin.interface';

@Component({
  selector: 'app-interest-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Interest Management</h1>
          <p class="text-gray-600 mt-1">Manage learning interests and topics</p>
        </div>
        <button (click)="openCreateModal()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg">
          <span class="text-xl">➕</span>
          <span>Add Interest</span>
        </button>
      </div>

      <!-- Interests Table -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Icon</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (interest of interests(); track interest.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                      @if (interest.iconUrl) {
                        <img [src]="interest.iconUrl" [alt]="interest.name" class="w-8 h-8 rounded-full">
                      } @else {
                        📚
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{interest.name}}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-600 max-w-xs truncate">{{interest.description}}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-600">{{interest.orderIndex}}</div>
                  </td>
                  <td class="px-6 py-4">
                    <button (click)="toggleStatus(interest)"
                            class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                            [ngClass]="interest.enabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'">
                      {{interest.enabled ? 'Active' : 'Inactive'}}
                    </button>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                      <button (click)="editInterest(interest)"
                              class="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors">
                        ✏️
                      </button>
                      <button (click)="deleteInterest(interest)"
                              class="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <div class="text-4xl mb-2">📋</div>
                    <div>No interests found. Create your first interest!</div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
             (click)="closeModal()">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" (click)="$event.stopPropagation()">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
              {{isEditMode() ? 'Edit Interest' : 'Create New Interest'}}
            </h2>
            
            <form (ngSubmit)="saveInterest()" class="space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input type="text"
                       [(ngModel)]="formData().name"
                       name="name"
                       required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                       placeholder="e.g., Artificial Intelligence">
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea [(ngModel)]="formData().description"
                          name="description"
                          rows="3"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                          placeholder="Describe this interest area..."></textarea>
              </div>

              <!-- Icon URL -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Icon URL (optional)</label>
                <input type="url"
                       [(ngModel)]="formData().iconUrl"
                       name="iconUrl"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                       placeholder="https://example.com/icon.png">
              </div>

              <!-- Order Index -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                <input type="number"
                       [(ngModel)]="formData().orderIndex"
                       name="orderIndex"
                       min="0"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                       placeholder="0">
              </div>

              <!-- Enabled Status -->
              <div class="flex items-center">
                <input type="checkbox"
                       [(ngModel)]="formData().enabled"
                       name="enabled"
                       id="enabled"
                       class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <label for="enabled" class="ml-2 text-sm text-gray-700">Enable this interest</label>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center space-x-3 pt-4">
                <button type="submit"
                        class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  {{isEditMode() ? 'Update' : 'Create'}}
                </button>
                <button type="button"
                        (click)="closeModal()"
                        class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
                  Cancel
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
export class InterestManagementComponent implements OnInit {
  interests = signal<Interest[]>([]);
  showModal = signal(false);
  isEditMode = signal(false);
  formData = signal<Interest>({
    name: '',
    description: '',
    iconUrl: '',
    enabled: true,
    orderIndex: 0,
    interestIds: []
  } as any);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    // Clear any old localStorage data to ensure fresh data from backend
    localStorage.removeItem('admin_interests');
    this.loadInterests();
  }

  loadInterests() {
    this.adminService.getAllInterests().subscribe({
      next: (interests) => {
        this.interests.set(interests);
      },
      error: (error) => {
        console.error('Failed to load interests:', error);
        alert('Failed to load interests from server. Please check your connection.');
      }
    });
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.formData.set({
      name: '',
      description: '',
      iconUrl: '',
      enabled: true,
      orderIndex: 0
    } as Interest);
    this.showModal.set(true);
  }

  editInterest(interest: Interest) {
    this.isEditMode.set(true);
    this.formData.set({...interest});
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveInterest() {
    const interest = this.formData();
    
    if (this.isEditMode() && interest.id) {
      this.adminService.updateInterest(interest.id, interest).subscribe({
        next: () => {
          this.loadInterests();
          this.closeModal();
        },
        error: (error) => {
          console.error('Failed to update interest:', error);
          alert('Failed to update interest. Please try again.');
        }
      });
    } else {
      this.adminService.createInterest(interest).subscribe({
        next: () => {
          this.loadInterests();
          this.closeModal();
        },
        error: (error) => {
          console.error('Failed to create interest:', error);
          alert('Failed to create interest. Please try again.');
        }
      });
    }
  }

  toggleStatus(interest: Interest) {
    if (!interest.id) return;
    
    this.adminService.toggleInterestStatus(interest.id, !interest.enabled).subscribe({
      next: () => {
        this.loadInterests();
      },
      error: (error) => {
        console.error('Failed to toggle interest status:', error);
        alert('Failed to toggle interest status. Please try again.');
      }
    });
  }

  deleteInterest(interest: Interest) {
    if (!interest.id) return;
    
    if (confirm(`Are you sure you want to delete "${interest.name}"?`)) {
      this.adminService.deleteInterest(interest.id).subscribe({
        next: () => {
          this.loadInterests();
        },
        error: (error) => {
          console.error('Failed to delete interest:', error);
          alert('Failed to delete interest. Please try again.');
        }
      });
    }
  }
}
