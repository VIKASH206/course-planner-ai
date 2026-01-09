import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface User {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  accountStatus?: string;
  status?: 'Active' | 'Inactive';
  createdAt?: string;
  joinedDate?: string;
  interests?: string[];
  studyGoals?: string[];
  goals?: string[];
  profilePicture?: string;
  bio?: string;
  phone?: string;
  location?: string;
  gender?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div class="max-w-7xl mx-auto">
        <!-- Header with Search -->
        <div class="mb-4 bg-white p-4 rounded-lg shadow border-l-4 border-purple-600">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">👥 User Management</h1>
              <p class="text-sm text-gray-600">Manage all students and administrators</p>
            </div>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                (input)="filterUsers()"
                placeholder="Search users by name or email..."
                class="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none w-full lg:w-80 text-sm text-gray-800 placeholder-gray-500">
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-lg p-4 mb-4 relative z-10">
          <div class="flex gap-4 items-center flex-wrap">
            <div class="flex items-center gap-2 relative">
              <label class="text-sm font-semibold text-gray-700">Role:</label>
              <select 
                [(ngModel)]="filterRole" 
                (change)="filterUsers()" 
                class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none text-sm bg-white cursor-pointer hover:border-purple-400 transition-colors relative z-20 min-w-[150px]">
                <option value="">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div class="flex items-center gap-2 relative">
              <label class="text-sm font-semibold text-gray-700">Status:</label>
              <select 
                [(ngModel)]="filterStatus" 
                (change)="filterUsers()" 
                class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none text-sm bg-white cursor-pointer hover:border-purple-400 transition-colors relative z-20 min-w-[150px]">
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button (click)="resetFilters()" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all">
              Reset Filters
            </button>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-lg shadow-lg border-t-4 border-purple-500 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
          <thead class="bg-gradient-to-r from-purple-50 to-pink-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Role</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Joined Date</th>
              <th class="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (filteredUsers().length === 0) {
              <tr>
                <td colspan="6" class="p-8">
                  <div class="text-center py-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <span class="text-4xl mb-2 block">👥</span>
                    <p class="text-sm text-gray-500 font-medium">No users found</p>
                    <p class="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            } @else {
              @for (user of filteredUsers(); track user.id) {
                <tr class="border-b hover:bg-purple-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {{ getInitials(user.name || user.username || user.email) }}
                      </div>
                      <span class="font-semibold text-gray-800">{{ user.name || user.username || 'Unknown' }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-gray-600 text-sm">{{ user.email }}</td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold" 
                          [class.bg-purple-100]="user.role === 'ADMIN'"
                          [class.text-purple-700]="user.role === 'ADMIN'"
                          [class.bg-blue-100]="user.role === 'STUDENT'"
                          [class.text-blue-700]="user.role === 'STUDENT'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold" 
                          [class.bg-green-100]="user.status === 'Active'"
                          [class.text-green-700]="user.status === 'Active'"
                          [class.bg-gray-100]="user.status === 'Inactive'"
                          [class.text-gray-700]="user.status === 'Inactive'">
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-gray-600 text-sm">{{ user.joinedDate }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-center gap-2">
                      <button (click)="viewUserProfile(user)" class="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-lg" title="View Profile">
                        👁️
                      </button>
                      <button (click)="viewUserDetails(user)" class="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors text-lg" title="View Interests & Goals">
                        📋
                      </button>
                      @if (user.status === 'Active') {
                        <button (click)="toggleUserStatus(user)" class="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors text-lg" title="Deactivate User">
                          ⛔
                        </button>
                      } @else {
                        <button (click)="toggleUserStatus(user)" class="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-lg" title="Activate User">
                          ✅
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
          </div>
        </div>
      </div>

      <!-- User Details Modal -->
      @if (selectedUser()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeModal()">
          <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between rounded-t-lg">
              <h3 class="text-xl font-bold text-white">👤 User Details</h3>
              <button (click)="closeModal()" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl">✕</button>
            </div>
            <div class="p-6">
              <div class="text-center mb-6">
                @if (selectedUser()!.profilePicture) {
                  <img 
                    [src]="selectedUser()!.profilePicture" 
                    alt="Profile Picture"
                    class="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-purple-200 shadow-lg"
                    (error)="onImageError($event)">
                } @else {
                  <div class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                    {{ getInitials(selectedUser()!.name || selectedUser()!.username || selectedUser()!.email) }}
                  </div>
                }
                <h4 class="text-2xl font-bold text-gray-800 mb-1">{{ selectedUser()!.name || selectedUser()!.username || 'Unknown User' }}</h4>
                <p class="text-gray-600 mb-3">{{ selectedUser()!.email }}</p>
                <div class="flex items-center justify-center gap-2">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold" 
                        [class.bg-purple-100]="selectedUser()!.role === 'ADMIN'"
                        [class.text-purple-700]="selectedUser()!.role === 'ADMIN'"
                        [class.bg-blue-100]="selectedUser()!.role === 'STUDENT'"
                        [class.text-blue-700]="selectedUser()!.role === 'STUDENT'">
                    {{ selectedUser()!.role }}
                  </span>
                  <span class="px-3 py-1 rounded-full text-xs font-semibold" 
                        [class.bg-green-100]="selectedUser()!.status === 'Active'"
                        [class.text-green-700]="selectedUser()!.status === 'Active'"
                        [class.bg-gray-100]="selectedUser()!.status === 'Inactive'"
                        [class.text-gray-700]="selectedUser()!.status === 'Inactive'">
                    {{ selectedUser()!.status }}
                  </span>
                </div>
              </div>

              <!-- Bio Section -->
              @if (selectedUser()!.bio) {
                <div class="mb-6 bg-blue-50 rounded-lg p-4">
                  <h5 class="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span class="text-xl">✍️</span> Bio
                  </h5>
                  <p class="text-sm text-gray-700">{{ selectedUser()!.bio }}</p>
                </div>
              }

              <!-- Contact & Location Info -->
              @if (selectedUser()!.phone || selectedUser()!.location) {
                <div class="mb-6 bg-green-50 rounded-lg p-4">
                  <h5 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span class="text-xl">📞</span> Contact Information
                  </h5>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    @if (selectedUser()!.phone) {
                      <div>
                        <span class="text-xs text-gray-600 block mb-1">📱 Phone:</span>
                        <span class="text-sm font-semibold text-gray-800">{{ selectedUser()!.phone }}</span>
                      </div>
                    }
                    @if (selectedUser()!.location) {
                      <div>
                        <span class="text-xs text-gray-600 block mb-1">📍 Location:</span>
                        <span class="text-sm font-semibold text-gray-800">{{ selectedUser()!.location }}</span>
                      </div>
                    }
                  </div>
                </div>
              }

              @if (selectedUser()!.interests && selectedUser()!.interests!.length > 0) {
                <div class="mb-6">
                  <h5 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span class="text-xl">🎨</span> Interests
                  </h5>
                  <div class="flex flex-wrap gap-2">
                    @for (interest of selectedUser()!.interests; track interest) {
                      <span class="px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full text-sm font-semibold">{{ interest }}</span>
                    }
                  </div>
                </div>
              }

              @if (selectedUser()!.goals && selectedUser()!.goals!.length > 0) {
                <div class="mb-6">
                  <h5 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span class="text-xl">🎯</span> Goals
                  </h5>
                  <div class="flex flex-wrap gap-2">
                    @for (goal of selectedUser()!.goals; track goal) {
                      <span class="px-3 py-1 bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 rounded-full text-sm font-semibold">{{ goal }}</span>
                    }
                  </div>
                </div>
              }

              <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <h5 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span class="text-xl">ℹ️</span> Account Information
                </h5>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <span class="text-sm text-gray-600 block mb-1">Joined:</span>
                    <span class="text-sm font-semibold text-gray-800">{{ selectedUser()!.joinedDate }}</span>
                  </div>
                  <div>
                    <span class="text-sm text-gray-600 block mb-1">User ID:</span>
                    <span class="text-sm font-semibold text-gray-800">{{ selectedUser()!.id }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Interests & Goals Modal (Book Button) -->
      @if (selectedUserDetails()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeDetailsModal()">
          <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl z-10">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-2xl font-bold flex items-center gap-2">
                    <span>📋</span> Interests & Goals
                  </h3>
                  <p class="text-purple-100 text-sm mt-1">{{ selectedUserDetails()!.name || selectedUserDetails()!.username || selectedUserDetails()!.email }}</p>
                </div>
                <button (click)="closeDetailsModal()" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all">
                  <span class="text-2xl">✕</span>
                </button>
              </div>
            </div>

            <div class="p-6">
              @if (selectedUserDetails()!.interests && selectedUserDetails()!.interests!.length > 0) {
                <div class="mb-6">
                  <h5 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span class="text-xl">🎨</span> Interests
                  </h5>
                  <div class="flex flex-wrap gap-2">
                    @for (interest of selectedUserDetails()!.interests; track interest) {
                      <span class="px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full text-sm font-semibold">{{ interest }}</span>
                    }
                  </div>
                </div>
              } @else {
                <div class="mb-6 bg-gray-50 rounded-lg p-6 text-center">
                  <span class="text-4xl mb-2 block">🎨</span>
                  <p class="text-gray-500 text-sm">No interests added yet</p>
                </div>
              }

              @if (selectedUserDetails()!.goals && selectedUserDetails()!.goals!.length > 0) {
                <div class="mb-6">
                  <h5 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span class="text-xl">🎯</span> Goals
                  </h5>
                  <div class="flex flex-wrap gap-2">
                    @for (goal of selectedUserDetails()!.goals; track goal) {
                      <span class="px-3 py-1 bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 rounded-full text-sm font-semibold">{{ goal }}</span>
                    }
                  </div>
                </div>
              } @else {
                <div class="bg-gray-50 rounded-lg p-6 text-center">
                  <span class="text-4xl mb-2 block">🎯</span>
                  <p class="text-gray-500 text-sm">No goals set yet</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .user-management {
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .page-title-large {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }

    .page-subtitle {
      color: #64748b;
      margin: 0;
      font-size: 0.95rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.625rem 1rem;
      min-width: 350px;
      transition: all 0.2s;
    }

    .search-box:focus-within {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-icon {
      margin-right: 0.5rem;
      font-size: 1.125rem;
    }

    .search-input {
      border: none;
      outline: none;
      flex: 1;
      font-size: 0.95rem;
    }

    /* Filters Bar */
    .filters-bar {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s;
      min-width: 150px;
    }

    .filter-select:focus {
      border-color: #667eea;
    }

    .btn-reset {
      padding: 0.5rem 1.25rem;
      background: #f1f5f9;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      transition: all 0.2s;
      margin-left: auto;
    }

    .btn-reset:hover {
      background: #e2e8f0;
    }

    /* Table Container */
    .table-container {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table thead {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
    }

    .users-table th {
      padding: 1rem 1.25rem;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .users-table td {
      padding: 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.9rem;
      color: #334155;
    }

    .users-table tbody tr:hover {
      background: #fafbfc;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
      font-size: 0.875rem;
    }

    .user-name {
      font-weight: 600;
      color: #1e293b;
    }

    .badge {
      padding: 0.375rem 0.875rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-admin {
      background: #fee2e2;
      color: #dc2626;
    }

    .badge-student {
      background: #dbeafe;
      color: #2563eb;
    }

    .status-badge {
      padding: 0.375rem 0.875rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-active {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-inactive {
      background: #f3f4f6;
      color: #6b7280;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-view {
      background: #dbeafe;
    }

    .btn-view:hover {
      background: #bfdbfe;
      transform: scale(1.1);
    }

    .btn-details {
      background: #fef3c7;
    }

    .btn-details:hover {
      background: #fde68a;
      transform: scale(1.1);
    }

    .btn-activate {
      background: #dcfce7;
    }

    .btn-activate:hover {
      background: #bbf7d0;
      transform: scale(1.1);
    }

    .btn-deactivate {
      background: #fee2e2;
    }

    .btn-deactivate:hover {
      background: #fecaca;
      transform: scale(1.1);
    }

    .no-data {
      text-align: center;
      padding: 4rem 0;
    }

    .no-data-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .no-data-icon {
      font-size: 4rem;
      opacity: 0.3;
    }

    .no-data-content p {
      color: #94a3b8;
      font-size: 1rem;
      margin: 0;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.5rem;
      color: #1e293b;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #94a3b8;
      transition: all 0.2s;
    }

    .btn-close:hover {
      color: #1e293b;
      transform: scale(1.2);
    }

    .modal-body {
      padding: 1.5rem;
    }

    .user-detail-section {
      text-align: center;
      padding: 1rem 0 1.5rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .detail-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
      font-size: 2rem;
      margin: 0 auto 1rem;
    }

    .user-detail-section h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1.5rem;
      color: #1e293b;
    }

    .detail-email {
      color: #64748b;
      margin: 0 0 1rem 0;
    }

    .detail-badges {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .detail-section {
      padding: 1.5rem 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .detail-section:last-child {
      border-bottom: none;
    }

    .detail-section h5 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      color: #475569;
      font-weight: 600;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .tag-interest {
      background: #ede9fe;
      color: #7c3aed;
    }

    .tag-goal {
      background: #fef3c7;
      color: #d97706;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 0.95rem;
      color: #1e293b;
      font-weight: 600;
    }

    /* Dropdown select styling */
    select {
      appearance: auto !important;
      -webkit-appearance: menulist !important;
      -moz-appearance: menulist !important;
      color: #1e293b !important;
      background-image: none !important;
    }

    select option {
      background: white;
      color: #1e293b;
      padding: 8px 12px;
      font-size: 14px;
    }

    select:focus option:checked,
    select option:hover {
      background: #f3e8ff;
      color: #7c3aed;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .search-box {
        min-width: 100%;
      }
      .users-table {
        font-size: 0.875rem;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  allUsers: User[] = [];

  filteredUsers = signal<User[]>([...this.allUsers]);
  selectedUser = signal<User | null>(null);
  selectedUserDetails = signal<User | null>(null);

  searchTerm: string = '';
  filterRole: string = '';
  filterStatus: string = '';

  private apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const params: any = {};
    if (this.filterRole) params.role = this.filterRole;
    if (this.filterStatus) params.status = this.filterStatus.toUpperCase();
    if (this.searchTerm) params.search = this.searchTerm;

    this.http.get<any>(this.apiUrl, { params }).subscribe({
      next: (response) => {
        console.log('✅ Users loaded:', response);
        this.allUsers = response.data.map((user: any) => this.transformUser(user));
        this.filteredUsers.set([...this.allUsers]);
      },
      error: (error) => {
        console.error('❌ Failed to load users:', error);
        alert('Failed to load users. Please try again.');
      }
    });
  }

  transformUser(apiUser: any): User {
    const fullName = `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || apiUser.username || 'Unknown User';
    const status = apiUser.accountStatus === 'ACTIVE' ? 'Active' : 'Inactive';
    const joinedDate = apiUser.createdAt ? new Date(apiUser.createdAt).toLocaleDateString() : 'N/A';

    return {
      ...apiUser,
      name: fullName,
      status: status as 'Active' | 'Inactive',
      joinedDate: joinedDate,
      goals: apiUser.studyGoals || []
    };
  }

  filterUsers(): void {
    this.loadUsers();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterRole = '';
    this.filterStatus = '';
    this.loadUsers();
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  viewUserProfile(user: User): void {
    // Show user details in modal instead of alert
    this.selectedUser.set(user);
  }

  viewUserDetails(user: User): void {
    this.selectedUserDetails.set(user);
  }

  closeDetailsModal(): void {
    this.selectedUserDetails.set(null);
  }

  toggleUserStatus(user: User): void {
    const userName = user.name || user.username || user.email;
    const action = user.status === 'Active' ? 'deactivate' : 'activate';
    const newStatus = user.status === 'Active' ? 'INACTIVE' : 'ACTIVE';
    
    if (confirm(`Are you sure you want to ${action} ${userName}?`)) {
      this.http.put<any>(`${this.apiUrl}/${user.id}/status`, { status: newStatus }).subscribe({
        next: (response) => {
          console.log('✅ User status updated:', response);
          user.status = user.status === 'Active' ? 'Inactive' : 'Active';
          user.accountStatus = newStatus;
          this.filteredUsers.set([...this.filteredUsers()]);
          alert(`User ${action}d successfully!`);
        },
        error: (error) => {
          console.error('❌ Failed to update user status:', error);
          alert('Failed to update user status. Please try again.');
        }
      });
    }
  }

  closeModal(): void {
    this.selectedUser.set(null);
  }

  onImageError(event: any): void {
    // Hide the broken image and show initials instead
    event.target.style.display = 'none';
  }
}
