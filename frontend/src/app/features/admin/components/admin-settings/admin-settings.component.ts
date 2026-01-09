import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth-backend.service';
import { AdminService } from '../../../admin/services/admin.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <h2 class="page-title">Admin Settings</h2>

      <!-- Profile Settings -->
      <div class="settings-section">
        <h3 class="section-title">Profile Settings</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>First Name</label>
            <input type="text" [(ngModel)]="profile.firstName" class="form-input">
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input type="text" [(ngModel)]="profile.lastName" class="form-input">
          </div>
          <div class="form-group full-width">
            <label>Email</label>
            <input type="email" [(ngModel)]="profile.email" class="form-input">
          </div>
        </div>
        <button (click)="saveProfile()" class="btn-save">💾 Save Profile</button>
      </div>

      <!-- Change Password -->
      <div class="settings-section">
        <h3 class="section-title">Change Password</h3>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Current Password</label>
            <input type="password" [(ngModel)]="password.current" class="form-input">
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" [(ngModel)]="password.new" class="form-input">
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input type="password" [(ngModel)]="password.confirm" class="form-input">
          </div>
        </div>
        <button (click)="changePassword()" class="btn-save">🔒 Change Password</button>
      </div>

      <!-- Platform Settings -->
      <div class="settings-section">
        <h3 class="section-title">Platform Settings</h3>
        <div class="toggle-settings">
          <div class="toggle-item">
            <div>
              <div class="toggle-label">🤖 AI Recommendations</div>
              <div class="toggle-description">Enable or disable AI-powered course recommendations</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="platformSettings.aiEnabled" (change)="savePlatformSettings()">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-item">
            <div>
              <div class="toggle-label">📧 Email Notifications</div>
              <div class="toggle-description">Send email notifications to users</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="platformSettings.emailNotifications" (change)="savePlatformSettings()">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-item">
            <div>
              <div class="toggle-label">👥 New User Registration</div>
              <div class="toggle-description">Allow new users to sign up</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="platformSettings.registrationEnabled" (change)="savePlatformSettings()">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-item">
            <div>
              <div class="toggle-label">🎮 Gamification</div>
              <div class="toggle-description">Enable badges, points, and leaderboards</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="platformSettings.gamificationEnabled" (change)="savePlatformSettings()">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        <button (click)="savePlatformSettings()" class="btn-save" style="display: none;">💾 Save Platform Settings</button>
      </div>

      <!-- Role Management -->
      <div class="settings-section">
        <h3 class="section-title">Role Management</h3>
        <div class="role-info">
          <div class="role-card">
            <div class="role-icon">👑</div>
            <div>
              <div class="role-name">Super Admin</div>
              <div class="role-description">Full system access, can manage all admins</div>
            </div>
          </div>
          <div class="role-card">
            <div class="role-icon">⚙️</div>
            <div>
              <div class="role-name">Sub Admin</div>
              <div class="role-description">Limited access, can manage content only</div>
            </div>
          </div>
        </div>
        <div class="current-role-badge">
          Your Role: <span class="badge-super">👑 Super Admin</span>
        </div>
      </div>

      <!-- System Information -->
      <div class="settings-section">
        <h3 class="section-title">System Information</h3>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-label">Platform Version</div>
            <div class="info-value">v2.0.1</div>
          </div>
          <div class="info-card">
            <div class="info-label">Database Status</div>
            <div class="info-value status-ok">✅ Connected</div>
          </div>
          <div class="info-card">
            <div class="info-label">AI Service Status</div>
            <div class="info-value status-ok">✅ Active</div>
          </div>
          <div class="info-card">
            <div class="info-label">Last Backup</div>
            <div class="info-value">2024-01-05 02:00 AM</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 2rem 0;
    }

    .settings-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 1.5rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
      margin-bottom: 0.5rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.95rem;
      color: #1e293b;
      background: white;
      transition: all 0.2s;
      outline: none;
    }

    .form-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input:disabled {
      background: #f8fafc;
      cursor: not-allowed;
    }

    .btn-save {
      padding: 0.875rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-save:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    /* Toggle Settings */
    .toggle-settings {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      background: #f8fafc;
      border-radius: 8px;
      gap: 1rem;
    }

    .toggle-label {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .toggle-description {
      font-size: 0.875rem;
      color: #64748b;
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
      flex-shrink: 0;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5e1;
      transition: 0.4s;
      border-radius: 34px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .toggle-slider {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    input:checked + .toggle-slider:before {
      transform: translateX(26px);
    }

    /* Role Management */
    .role-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .role-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
    }

    .role-icon {
      font-size: 2.5rem;
    }

    .role-name {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .role-description {
      font-size: 0.85rem;
      color: #64748b;
    }

    .current-role-badge {
      padding: 1rem;
      background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
      color: #475569;
    }

    .badge-super {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 700;
      margin-left: 0.5rem;
    }

    /* System Information */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .info-card {
      padding: 1.25rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
    }

    .info-label {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .info-value {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1e293b;
    }

    .status-ok {
      color: #16a34a;
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  profile = {
    firstName: '',
    lastName: '',
    email: ''
  };

  password = {
    current: '',
    new: '',
    confirm: ''
  };

  platformSettings = {
    aiEnabled: true,
    emailNotifications: true,
    registrationEnabled: true,
    gamificationEnabled: true
  };

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Load current user data
    const user = this.authService.currentUser();
    if (user) {
      this.profile.firstName = user.firstName || '';
      this.profile.lastName = user.lastName || '';
      this.profile.email = user.email || '';
    }
    
    // Load platform settings from backend
    this.loadPlatformSettings();
  }

  private loadPlatformSettings(): void {
    // Try to load from backend first
    this.http.get<any>(`${environment.apiUrl}/admin/settings/platform`)
      .subscribe({
        next: (response) => {
          if (response.success && response.settings) {
            this.platformSettings.aiEnabled = response.settings.aiEnabled;
            this.platformSettings.emailNotifications = response.settings.emailNotifications;
            this.platformSettings.registrationEnabled = response.settings.registrationEnabled;
            this.platformSettings.gamificationEnabled = response.settings.gamificationEnabled;
            console.log('✅ Platform settings loaded from backend:', response.settings);
          }
        },
        error: (error) => {
          console.warn('⚠️ Backend load failed, using defaults:', error);
          // Fallback to localStorage
          const savedSettings = localStorage.getItem('admin_platform_settings');
          if (savedSettings) {
            try {
              this.platformSettings = JSON.parse(savedSettings);
            } catch (error) {
              console.error('Failed to load from localStorage:', error);
            }
          }
        }
      });
  }

  saveProfile(): void {
    const user = this.authService.currentUser();
    if (!user) {
      alert('No user logged in!');
      return;
    }

    const updates = {
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      email: this.profile.email
    };

    this.authService.updateProfile(updates).subscribe({
      next: (updatedUser) => {
        alert('Profile updated successfully!');
        console.log('✅ Profile updated:', updatedUser);
      },
      error: (error) => {
        console.error('❌ Failed to update profile:', error);
        // Fallback: Update localStorage directly
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          localStorage.setItem('course-planner-user', JSON.stringify(updatedUser));
          alert('Profile updated locally (backend unavailable)');
        } else {
          alert('Failed to update profile. Please try again.');
        }
      }
    });
  }

  changePassword(): void {
    if (!this.password.current || !this.password.new || !this.password.confirm) {
      alert('Please fill all password fields!');
      return;
    }
    if (this.password.new !== this.password.confirm) {
      alert('New passwords do not match!');
      return;
    }
    if (this.password.new.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    const user = this.authService.currentUser();
    if (!user?.id) {
      alert('No user logged in!');
      return;
    }

    // Call backend API to change password
    const passwordData = {
      userId: user.id,
      currentPassword: this.password.current,
      newPassword: this.password.new
    };

    this.http.post<any>(`${environment.apiUrl}/users/change-password`, passwordData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Password changed successfully!');
            this.password = { current: '', new: '', confirm: '' };
            console.log('✅ Password changed successfully');
          } else {
            alert(response.message || 'Failed to change password');
          }
        },
        error: (error) => {
          console.error('❌ Failed to change password:', error);
          const errorMessage = error.error?.message || 'Failed to change password. The endpoint may not be implemented yet.';
          alert(errorMessage);
        }
      });
  }

  savePlatformSettings(): void {
    // Save to backend
    this.http.post<any>(`${environment.apiUrl}/admin/settings/platform`, this.platformSettings)
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('✅ Platform settings saved successfully!');
            console.log('✅ Platform settings saved to backend:', response);
            
            // Also save to localStorage as backup
            localStorage.setItem('admin_platform_settings', JSON.stringify(this.platformSettings));
          } else {
            alert('⚠️ ' + (response.message || 'Failed to save settings'));
          }
        },
        error: (error) => {
          console.error('❌ Backend save failed:', error);
          
          // Fallback: Save to localStorage
          localStorage.setItem('admin_platform_settings', JSON.stringify(this.platformSettings));
          alert('⚠️ Settings saved locally (backend unavailable)');
        }
      });
  }
}
