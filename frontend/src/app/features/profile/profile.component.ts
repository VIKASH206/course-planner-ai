import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { trigger, state, style, transition, animate, query, stagger, keyframes } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { ApiService } from '../../core/services/api.service';
import { BackendApiService } from '../../core/services/backend-api.service';

interface ProfileData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  bio?: string;
  profilePhoto?: string;
  profilePicture?: string; // Added for template compatibility
  coverPhoto?: string;
  level?: number;
  university?: string;
  memberSince?: Date;
  lastLogin?: Date;
  title?: string; // Added for template
  phone?: string; // Added for template
  location?: string; // Added for template
  coursesCompleted?: number; // Added for template
  studyHours?: number; // Added for template
  points?: number; // Added for template
  streak?: number; // Added for template
  // Additional comprehensive fields
  dateOfBirth?: Date;
  gender?: string;
  department?: string;
  year?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  skills?: string[];
  interests?: string[];
  languages?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface ProfileStats {
  coursesCompleted: number;
  tasksCompleted: number;
  xpPoints: number;
  studyHours: number;
}

interface RecentActivity {
  icon: string;
  description: string;
  timestamp: Date;
  color: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'progress' | 'recommendation' | 'reminder' | 'general';
  showMeetAdmin?: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatSelectModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [
    // Fade in animation for the entire page
    trigger('pageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),

    // Cover photo animation
    trigger('coverAnimation', [
      state('loaded', style({ opacity: 1, transform: 'scale(1)' })),
      transition('* => loaded', [
        style({ opacity: 0, transform: 'scale(1.1)' }),
        animate('800ms ease-out')
      ])
    ]),

    // Profile photo animation
    trigger('profilePhotoAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8) translateY(20px)' }),
        animate('500ms 200ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ]),

    // Card stagger animation
    trigger('cardStagger', [
      transition('* => *', [
        query('.profile-card', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(150, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),

    // Stats animation with bounce
    trigger('statsAnimation', [
      transition(':enter', [
        query('.stat-item', [
          style({ opacity: 0, transform: 'scale(0.8)' }),
          stagger(100, [
            animate('400ms ease-out', 
              keyframes([
                style({ opacity: 0, transform: 'scale(0.8)', offset: 0 }),
                style({ opacity: 1, transform: 'scale(1.1)', offset: 0.7 }),
                style({ opacity: 1, transform: 'scale(1)', offset: 1 })
              ])
            )
          ])
        ], { optional: true })
      ])
    ]),

    // Activity list animation
    trigger('activityAnimation', [
      transition('* => *', [
        query('.activity-item', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(80, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),

    // Form slide animation
    trigger('formSlide', [
      transition('view => edit', [
        style({ transform: 'translateX(-100%)' }),
        animate('400ms ease-in-out', style({ transform: 'translateX(0%)' }))
      ]),
      transition('edit => view', [
        animate('400ms ease-in-out', style({ transform: 'translateX(-100%)' }))
      ])
    ]),

    // Button hover animation
    trigger('buttonHover', [
      state('normal', style({ transform: 'scale(1)' })),
      state('hovered', style({ transform: 'scale(1.05)' })),
      transition('normal <=> hovered', animate('200ms ease-in-out'))
    ]),

    // Photo upload button pulse
    trigger('photoButtonPulse', [
      transition('* => *', [
        animate('2s ease-in-out', 
          keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(1.1)', offset: 0.5 }),
            style({ transform: 'scale(1)', offset: 1 })
          ])
        )
      ])
    ]),

    // Loading spinner animation
    trigger('loadingAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),

    // New animations for comprehensive profile
    trigger('nameAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms 400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),

    trigger('statusAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms 600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),

    trigger('cardsAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ])
    ]),

    trigger('cardSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('{{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),

    trigger('cardHover', [
      state('normal', style({ transform: 'translateY(0) scale(1)' })),
      state('hovered', style({ transform: 'translateY(-4px) scale(1.02)' })),
      transition('normal <=> hovered', animate('300ms ease-in-out'))
    ])
  ]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private themeService = inject(ThemeService);
  private snackBar = inject(MatSnackBar);
  private apiService = inject(ApiService);
  private backendApi = inject(BackendApiService);
  private router = inject(Router);

  // Component state
  isLoading = signal(false);
  editMode = signal(false);
  isSaving = signal(false);
  isDarkMode = signal<boolean>(false);
  
  // Animation states
  coverLoaded = signal(false);
  showCards = signal(false);
  showStats = signal(false);
  showActivities = signal(false);
  buttonHoverState = signal('normal');
  
  // Card animation states
  cardHoverStates = signal<Record<string, string>>({});
  cardsAnimated = signal(false);
  
  // Animation timing
  private animationDelay = 200;

  // Profile data
  profileData = signal<ProfileData>({
    id: '',
    name: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: '',
    bio: '',
    profilePhoto: '',
    profilePicture: '',
    coverPhoto: '',
    level: 1,
    title: 'Student',
    phone: '',
    location: '',
    coursesCompleted: 12,
    studyHours: 145,
    points: 2340,
    streak: 15
  });

  // Profile stats
  profileStats = signal<ProfileStats>({
    coursesCompleted: 0,
    tasksCompleted: 0,
    xpPoints: 0,
    studyHours: 0
  });

  // Recent activities
  recentActivities = signal<RecentActivity[]>([]);

  // AI Chatbot interface
  chatMessages = signal<ChatMessage[]>([]);
  currentMessage: string = '';
  isTyping = signal(false);

  // Profile form
  profileForm!: FormGroup;

  constructor() {
    // Initialize dark mode state
    this.isDarkMode.set(this.themeService.isDarkMode());
    
    // Watch for theme changes using effect in constructor
    effect(() => {
      // This will run whenever themeService signals change
      this.isDarkMode.set(this.themeService.isDarkMode());
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.initializeForm();
    this.loadProfile();
    this.loadProfileStats();
    this.loadRecentActivities();
    this.triggerAnimations();
    this.initializeAnimations();
  }

  private triggerAnimations() {
    // Trigger animations in sequence
    setTimeout(() => this.coverLoaded.set(true), 300);
    setTimeout(() => this.showCards.set(true), 600);
    setTimeout(() => this.showStats.set(true), 900);
    setTimeout(() => this.showActivities.set(true), 1200);
  }

  private initializeForm() {
    this.profileForm = this.fb.group({
      // Basic Information
      firstName: ['', [Validators.minLength(2)]],
      lastName: ['', [Validators.minLength(2)]],
      username: ['', [Validators.minLength(3)]],
      email: ['', [Validators.email]],
      bio: ['', [Validators.maxLength(500)]],
      
      // Contact Information
      phone: [''],
      location: [''],
      emergencyContact: [''],
      emergencyPhone: [''],
      
      // Academic Information
      university: [''],
      department: [''],
      year: [''],
      
      // Personal Information
      dateOfBirth: [''],
      gender: [''],
      
      // Social Links
      website: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      linkedin: [''],
      twitter: [''],
      github: [''],
      
      // Skills and Interests (as comma-separated strings for form simplicity)
      skills: [''],
      interests: [''],
      languages: ['']
    });
  }

  private loadProfile() {
    this.isLoading.set(true);
    
    const currentUser = this.authService.currentUser();
    if (currentUser && currentUser.id) {
      // Fetch fresh data from backend
      this.backendApi.getUserProfile(currentUser.id).subscribe({
        next: (response: any) => {
          const userData = response.data || response;
          
          // Create a more descriptive display name
          const displayName = this.createDisplayName(userData);
          const username = this.createUsername(userData);
          
          // Ensure we have default values for required fields
          const firstName = userData.firstName || 'User';
          const lastName = userData.lastName || 'Name';
          const userEmail = userData.email || 'user@example.com';
          
          this.profileData.set({
            id: userData.id || '',
            name: displayName,
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: userEmail,
            role: this.capitalizeRole(userData.role || 'student'),
            bio: userData.bio || 'No bio added yet. Click edit to add one!',
            profilePhoto: userData.profilePicture || userData.avatar || '',
            profilePicture: userData.profilePicture || userData.avatar || '',
            coverPhoto: '',
            level: userData.level || 1,
            university: userData.university || '',
            memberSince: userData.createdAt ? new Date(userData.createdAt) : new Date(),
            lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : new Date(),
            title: this.capitalizeRole(userData.role || 'student'),
            phone: userData.phone || '',
            location: userData.location || '',
            coursesCompleted: (userData.level || 1) >= 2 ? 12 : 6,
            studyHours: (userData.level || 1) * 25 + 45,
            points: (userData.level || 1) * 234 + 1200,
            streak: (userData.level || 1) * 5 + 10,
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
            gender: userData.gender || '',
            department: userData.department || '',
            year: userData.year || '',
            website: userData.website || '',
            linkedin: userData.linkedin || '',
            twitter: userData.twitter || '',
            github: userData.github || '',
            skills: userData.skills || [],
            interests: userData.interests || [],
            languages: userData.languages || [],
            emergencyContact: userData.emergencyContact || '',
            emergencyPhone: userData.emergencyPhone || ''
          });

          // Update form with current data
          const profile = this.profileData();
          this.profileForm.patchValue({
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: userEmail,
            bio: userData.bio || '',
            phone: profile.phone || '',
            location: profile.location || '',
            emergencyContact: profile.emergencyContact || '',
            emergencyPhone: profile.emergencyPhone || '',
            university: profile.university || '',
            department: profile.department || '',
            year: profile.year || '',
            dateOfBirth: profile.dateOfBirth ? this.formatDateForInput(profile.dateOfBirth) : '',
            gender: profile.gender || '',
            website: profile.website || '',
            linkedin: profile.linkedin || '',
            twitter: profile.twitter || '',
            github: profile.github || '',
            skills: profile.skills ? profile.skills.join(', ') : '',
            interests: profile.interests ? profile.interests.join(', ') : '',
            languages: profile.languages ? profile.languages.join(', ') : ''
          });

          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.isLoading.set(false);
          // Fallback to local auth data if API fails
          this.loadProfileFromAuth();
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }

  private loadProfileFromAuth() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      // Create a more descriptive display name
      const displayName = this.createDisplayName(currentUser);
      const username = this.createUsername(currentUser);
      
      // Ensure we have default values for required fields
      const firstName = currentUser.firstName || 'User';
      const lastName = currentUser.lastName || 'Name';
      const userEmail = currentUser.email || 'user@example.com';
      
      this.profileData.set({
        id: currentUser.id || '',
        name: displayName,
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: userEmail,
        role: this.capitalizeRole(currentUser.role || 'student'),
        bio: currentUser.profile?.bio || 'No bio added yet. Click edit to add one!',
        profilePhoto: currentUser.avatar || '',
        profilePicture: currentUser.avatar || '', // Same as profilePhoto for compatibility
        coverPhoto: '', // Will be stored separately
        level: currentUser.level || 1,
        university: currentUser.profile?.university || '',
        memberSince: new Date(currentUser.createdAt),
        lastLogin: new Date(currentUser.lastLoginAt),
        title: this.capitalizeRole(currentUser.role || 'student'),
        phone: currentUser.profile?.phone || '',
        location: currentUser.profile?.location || '',
        coursesCompleted: (currentUser.level || 1) >= 2 ? 12 : 6,
        studyHours: (currentUser.level || 1) * 25 + 45,
        points: (currentUser.level || 1) * 234 + 1200,
        streak: (currentUser.level || 1) * 5 + 10,
        // Additional comprehensive fields
        dateOfBirth: currentUser.profile?.dateOfBirth || undefined,
        gender: currentUser.profile?.gender || '',
        department: currentUser.profile?.department || '',
        year: currentUser.profile?.year || '',
        website: currentUser.profile?.website || '',
        linkedin: currentUser.profile?.linkedin || '',
        twitter: currentUser.profile?.twitter || '',
        github: currentUser.profile?.github || '',
        skills: currentUser.profile?.skills || [],
        interests: currentUser.profile?.interests || [],
        languages: currentUser.profile?.languages || [],
        emergencyContact: currentUser.profile?.emergencyContact || '',
        emergencyPhone: currentUser.profile?.emergencyPhone || ''
      });

      // Update form with current data
      const profile = this.profileData();
      this.profileForm.patchValue({
        // Basic Information - ensure required fields have values
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: userEmail,
        bio: currentUser.profile?.bio || '',
        
        // Contact Information
        phone: profile.phone || '',
        location: profile.location || '',
        emergencyContact: profile.emergencyContact || '',
        emergencyPhone: profile.emergencyPhone || '',
        
        // Academic Information
        university: profile.university || '',
        department: profile.department || '',
        year: profile.year || '',
        
        // Personal Information
        dateOfBirth: profile.dateOfBirth ? this.formatDateForInput(profile.dateOfBirth) : '',
        gender: profile.gender || '',
        
        // Social Links
        website: profile.website || '',
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        github: profile.github || '',
        
        // Skills and Interests (convert arrays to comma-separated strings)
        skills: profile.skills ? profile.skills.join(', ') : '',
        interests: profile.interests ? profile.interests.join(', ') : '',
        languages: profile.languages ? profile.languages.join(', ') : ''
      });
    }
    
    this.isLoading.set(false);
  }

  private createDisplayName(user: any): string {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    // If we have both names and lastName is not just 'User'
    if (firstName && lastName && lastName !== 'User') {
      return `${firstName} ${lastName}`;
    }
    
    // If we only have firstName
    if (firstName) {
      return firstName;
    }
    
    // Fall back to email prefix but make it more readable
    const emailPrefix = user.email.split('@')[0];
    return this.formatEmailPrefix(emailPrefix);
  }

  private createUsername(user: any): string {
    // Use email prefix but make it more readable
    return user.email.split('@')[0].toLowerCase();
  }

  private formatEmailPrefix(prefix: string): string {
    // Convert email prefix to a more readable name
    // e.g., 'ankush.kumar' -> 'Ankush Kumar'
    return prefix
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private capitalizeRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  private loadProfileStats() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      // Use real user data based on current user level and provide sensible defaults
      const userLevel = currentUser.level || 1;
      this.profileStats.set({
        coursesCompleted: userLevel >= 2 ? 2 : 1,
        tasksCompleted: userLevel * 3 + 2,
        xpPoints: userLevel * 100,
        studyHours: userLevel * 5 + 10
      });
    } else {
      // Fallback data
      this.profileStats.set({
        coursesCompleted: 1,
        tasksCompleted: 5,
        xpPoints: 100,
        studyHours: 15
      });
    }
  }

  private loadRecentActivities() {
    const currentUser = this.authService.currentUser();
    const userName = currentUser ? `${currentUser.firstName || currentUser.email.split('@')[0]}` : 'User';
    const userLevel = currentUser?.level || 1;
    
    // Generate activities based on real user data
    const activities: RecentActivity[] = [
      {
        icon: 'school',
        description: `Completed course "Advanced Mathematics"`,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        color: 'blue'
      },
      {
        icon: 'assignment_turned_in',
        description: `Finished task "Physics Assignment"`,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        color: 'green'
      },
      {
        icon: 'star',
        description: `Reached Level ${userLevel}`,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        color: 'purple'
      }
    ];

    this.recentActivities.set(activities);
  }

  toggleEditMode() {
    this.editMode.set(!this.editMode());
    
    if (this.editMode()) {
      // Reset form with current data when entering edit mode
      const profile = this.profileData();
      this.profileForm.patchValue({
        // Basic Information
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        email: profile.email,
        bio: profile.bio,
        
        // Contact Information
        phone: profile.phone || '',
        location: profile.location || '',
        emergencyContact: profile.emergencyContact || '',
        emergencyPhone: profile.emergencyPhone || '',
        
        // Academic Information
        university: profile.university || '',
        department: profile.department || '',
        year: profile.year || '',
        
        // Personal Information
        dateOfBirth: profile.dateOfBirth ? this.formatDateForInput(profile.dateOfBirth) : '',
        gender: profile.gender || '',
        
        // Social Links
        website: profile.website || '',
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        github: profile.github || '',
        
        // Skills and Interests (convert arrays to comma-separated strings)
        skills: profile.skills ? profile.skills.join(', ') : '',
        interests: profile.interests ? profile.interests.join(', ') : '',
        languages: profile.languages ? profile.languages.join(', ') : ''
      });
    }
  }

  cancelEdit() {
    this.editMode.set(false);
    this.profileForm.reset();
    this.loadProfile(); // Reload original data
  }

  // Debug method to check form validation status
  debugFormValidation() {
    console.log('=== Form Validation Debug ===');
    console.log('Form valid:', this.profileForm.valid);
    console.log('Form invalid:', this.profileForm.invalid);
    console.log('Form status:', this.profileForm.status);
    
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control) {
        console.log(`${key}:`, {
          value: control.value,
          valid: control.valid,
          invalid: control.invalid,
          errors: control.errors,
          status: control.status
        });
      }
    });
    console.log('=== End Debug ===');
  }

  saveProfile() {
    // Debug: Log all form values and validation status for debugging
    console.log('=== FORM DEBUG INFO ===');
    console.log('Form Valid:', this.profileForm.valid);
    console.log('Form Values:', this.profileForm.value);
    console.log('Form Errors:');
    
    if (this.profileForm.invalid) {
      // Debug: Show detailed validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control && control.invalid) {
          console.log(`❌ ${key}:`, control.errors, 'Value:', control.value);
        } else {
          console.log(`✅ ${key}: Valid`);
        }
      });
      
      // Show user-friendly message
      let errorMessage = 'Please fix the form errors before saving.';
      
      // Check for specific common errors
      const firstNameErrors = this.profileForm.get('firstName')?.errors;
      const lastNameErrors = this.profileForm.get('lastName')?.errors;
      const usernameErrors = this.profileForm.get('username')?.errors;
      const emailErrors = this.profileForm.get('email')?.errors;
      
      if (firstNameErrors || lastNameErrors || usernameErrors || emailErrors) {
        errorMessage = 'Required fields are missing or invalid. Please check First Name, Last Name, Username, and Email.';
      }
      
      console.log('Error Message:', errorMessage);
      console.log('=== END DEBUG INFO ===');
      
      this.notificationService.showError(errorMessage);
      return;
    }

    this.isSaving.set(true);
    
    const formData = this.profileForm.value;
    const currentUser = this.authService.currentUser();
    
    // Get user ID from either currentUser or localStorage
    const userId = currentUser?.id || localStorage.getItem('userId');
    
    if (!userId) {
      this.notificationService.showError('User not found. Please login again.');
      this.isSaving.set(false);
      this.router.navigate(['/auth/login']);
      return;
    }

    // Prepare profile data for API (flattened structure to match Java backend)
    const profileUpdateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email,
      bio: formData.bio || '',
      phone: formData.phone || '',
      location: formData.location || '',
      profilePicture: this.profileData().profilePhoto || this.profileData().profilePicture || '',
      university: formData.university || '',
      department: formData.department || '',
      major: formData.major || '',
      year: formData.year || '',
      dateOfBirth: formData.dateOfBirth || null,
      gender: formData.gender || '',
      website: formData.website || '',
      linkedin: formData.linkedin || '',
      twitter: formData.twitter || '',
      github: formData.github || '',
      skills: formData.skills ? formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      interests: formData.interests ? formData.interests.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      languages: formData.languages ? formData.languages.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      emergencyContact: formData.emergencyContact || '',
      emergencyPhone: formData.emergencyPhone || ''
    };

    // Call backend API to update profile
    this.backendApi.updateProfile(userId, profileUpdateData).subscribe({
      next: (response: any) => {
        // Update local profile data
        const updatedProfile = {
          ...this.profileData(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          bio: formData.bio,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          location: formData.location,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          university: formData.university,
          department: formData.department,
          year: formData.year,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
          gender: formData.gender,
          website: formData.website,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          github: formData.github,
          skills: formData.skills ? formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
          interests: formData.interests ? formData.interests.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
          languages: formData.languages ? formData.languages.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []
        };

        this.profileData.set(updatedProfile);
        this.editMode.set(false);
        this.isSaving.set(false);
        
        this.notificationService.showSuccess('Profile updated successfully!');
        
        // Reload profile to ensure data is in sync
        this.loadProfile();
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isSaving.set(false);
        this.notificationService.showError('Failed to update profile. Please try again.');
      }
    });
  }

  onProfilePhotoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.notificationService.showError('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.notificationService.showError('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const photoData = e.target.result;
        
        // Update local profile data immediately for UI feedback
        const updatedProfile = {
          ...this.profileData(),
          profilePhoto: photoData,
          profilePicture: photoData // Update both for compatibility
        };
        this.profileData.set(updatedProfile);
        
        // Save to database
        const currentUser = this.authService.currentUser();
        if (currentUser && currentUser.id) {
          this.backendApi.updateProfile(currentUser.id, { profilePicture: photoData }).subscribe({
            next: () => {
              this.notificationService.showSuccess('Profile photo updated and saved successfully!');
            },
            error: (error) => {
              console.error('Error saving profile photo:', error);
              this.notificationService.showError('Photo uploaded but failed to save to database');
            }
          });
        } else {
          this.notificationService.showSuccess('Profile photo updated!');
        }
      };
      reader.onerror = () => {
        this.notificationService.showError('Failed to load image');
      };
      reader.readAsDataURL(file);
    }
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  }

  onCoverPhotoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        this.notificationService.showError('Image size should be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.notificationService.showError('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const updatedProfile = {
          ...this.profileData(),
          coverPhoto: e.target.result
        };
        this.profileData.set(updatedProfile);
        this.notificationService.showSuccess('Cover photo updated successfully!');
      };
      reader.onerror = () => {
        this.notificationService.showError('Failed to load image');
      };
      reader.readAsDataURL(file);
    }
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDateForInput(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Animation methods
  onButtonHover(state: 'normal' | 'hovered') {
    this.buttonHoverState.set(state);
  }

  getFormAnimationState() {
    return this.editMode() ? 'edit' : 'view';
  }

  triggerPhotoButtonPulse() {
    // This can be called when hovering over photo
    return 'pulse';
  }

  // Theme management
  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode.set(this.themeService.isDarkMode());
  }
  
  // Settings methods
  changePassword() {
    // TODO: Implement password change dialog
    this.notificationService.showSuccess('Password change feature coming soon!');
  }
  
  // AI Chat Integration
  sendMessage() {
    if (!this.currentMessage?.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: this.currentMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message
    this.chatMessages.update(messages => [...messages, userMessage]);
    const messageText = this.currentMessage.trim();
    this.currentMessage = '';
    this.isTyping.set(true);

    // Send to AI service with project relevance filtering
    this.apiService.sendMessage(messageText).subscribe({
      next: (response) => {
        this.isTyping.set(false);
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: response.data.response,
          sender: 'bot',
          timestamp: new Date(),
          showMeetAdmin: response.data.showMeetAdmin,
          type: response.data.isAIGenerated ? 'general' : 'recommendation'
        };
        this.chatMessages.update(messages => [...messages, botMessage]);
      },
      error: (error) => {
        this.isTyping.set(false);
        console.error('Chat error:', error);
        const errorMessage: ChatMessage = {
          id: 'error_' + Date.now(),
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        };
        this.chatMessages.update(messages => [...messages, errorMessage]);
      }
    });
  }

  sendQuickMessage(message: string) {
    this.currentMessage = message;
    this.sendMessage();
  }

  contactAdmin() {
    this.snackBar.open('Admin contact feature will be implemented. Please contact support for assistance.', 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  private generateAIResponse(userMessage: string): { text: string; type?: ChatMessage['type'] } {
    const message = userMessage.toLowerCase();
    const profile = this.profileData();
    const stats = this.profileStats();

    // Personal Progress Queries
    if (message.includes('progress') || message.includes('completed') || message.includes('course')) {
      return {
        text: `Great question! Based on your profile, you've completed ${stats.coursesCompleted} courses and have ${stats.studyHours} study hours. You're currently at level ${profile.level} with ${stats.xpPoints} XP points. Keep up the excellent work! 🎓`,
        type: 'progress'
      };
    }

    if (message.includes('weak') || message.includes('subject') || message.includes('difficult')) {
      return {
        text: `Based on your study patterns, I'd recommend focusing more on areas where you spend less time. Consider reviewing your recent tasks and identifying subjects with lower completion rates. Would you like me to suggest a focused study plan? 📚`,
        type: 'recommendation'
      };
    }

    if (message.includes('week') || message.includes('this week')) {
      return {
        text: `This week you've maintained a ${profile.streak}-day study streak! 🔥 You've completed several tasks and are making steady progress. Your consistency is impressive - keep building on this momentum!`,
        type: 'progress'
      };
    }

    // Study Recommendations
    if (message.includes('study today') || message.includes('what should i study') || message.includes('recommend')) {
      const recommendations = [
        'Review your pending assignments first - deadlines are important! ⏰',
        'Based on your interests in ' + (profile.skills?.[0] || 'your subjects') + ', I suggest focusing on practical exercises.',
        'Consider taking a short quiz to test your recent learning, then dive into new material.',
        'Since you\'re doing well, try tackling a challenging topic to expand your knowledge!'
      ];
      return {
        text: recommendations[Math.floor(Math.random() * recommendations.length)],
        type: 'recommendation'
      };
    }

    if (message.includes('study plan') || message.includes('schedule') || message.includes('plan')) {
      return {
        text: `Here's a personalized study plan for you:\n\n🌅 Morning (9-11 AM): Focus on challenging subjects\n🌞 Afternoon (2-4 PM): Review and practice\n🌙 Evening (7-8 PM): Light reading or revision\n\nAdjust based on your energy levels and preferences!`,
        type: 'recommendation'
      };
    }

    // Task & Reminder Help
    if (message.includes('deadline') || message.includes('due') || message.includes('upcoming')) {
      return {
        text: `⏰ Based on your current pace, you have several tasks approaching. I recommend prioritizing the ones due this week. Don't worry - you're typically great at meeting deadlines! Need help organizing your tasks?`,
        type: 'reminder'
      };
    }

    if (message.includes('remind') || message.includes('notification')) {
      return {
        text: `I can help you stay on track! Based on your profile, I suggest study reminders at 9 AM and 3 PM on weekdays. You can customize these in your profile settings. Would you like me to set up smart reminders? 🔔`,
        type: 'reminder'
      };
    }

    // Content Assistance
    if (message.includes('quiz') || message.includes('test') || message.includes('revision')) {
      const subjects = profile.skills || ['JavaScript', 'TypeScript', 'Angular'];
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      return {
        text: `🧠 Quick ${randomSubject} Quiz:\n\nQ: What's the main advantage of using TypeScript over JavaScript?\nA) Better performance\nB) Type safety\nC) Smaller file size\n\nThink about it and let me know your answer! I can generate more quizzes on any subject you're studying.`,
        type: 'general'
      };
    }

    if (message.includes('explain') || message.includes('help with') || message.includes('understand')) {
      return {
        text: `I'd love to help explain concepts! While I can't access your specific notes right now, I can help break down topics, provide examples, and suggest learning resources. What specific topic would you like me to explain? 🤔`,
        type: 'general'
      };
    }

    // Motivation & Engagement
    if (message.includes('motivat') || message.includes('encourage') || message.includes('tired')) {
      const motivationalMessages = [
        `You're doing amazing! 🌟 Your ${profile.streak}-day streak shows real dedication. Every expert was once a beginner!`,
        `Remember why you started! 💪 You've already completed ${stats.coursesCompleted} courses - that's incredible progress!`,
        `Take a short break if you need it, then come back stronger! 🚀 Consistent small steps lead to big achievements.`,
        `You're at level ${profile.level} - that didn't happen by accident! You have what it takes to keep growing! ✨`
      ];
      return {
        text: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
        type: 'general'
      };
    }

    if (message.includes('leaderboard') || message.includes('position') || message.includes('ranking')) {
      return {
        text: `🏆 You're doing great! With ${stats.xpPoints} XP points and level ${profile.level}, you're in the top performers this week! Your consistent ${profile.streak}-day streak is inspiring others. Keep it up!`,
        type: 'progress'
      };
    }

    // Profile Management Help
    if (message.includes('bio') || message.includes('profile') || message.includes('update')) {
      return {
        text: `I can help you optimize your profile! 👤 Your current bio looks good. Consider adding more about your learning goals or recent achievements. You can update your bio, skills, and preferences using the Edit Profile button above!`,
        type: 'general'
      };
    }

    if (message.includes('setting') || message.includes('notification') || message.includes('preference')) {
      return {
        text: `⚙️ Based on your study patterns, I suggest:\n• Study reminders at 9 AM (your most active time)\n• Weekly progress reports on Sundays\n• Achievement notifications enabled\n\nYou can customize these in your profile settings!`,
        type: 'recommendation'
      };
    }

    // General responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return {
        text: `Hello ${profile.firstName || 'there'}! 👋 I'm your AI Study Assistant. I can help you track progress, get study recommendations, manage tasks, and stay motivated. What would you like to know about your learning journey?`,
        type: 'general'
      };
    }

    if (message.includes('thanks') || message.includes('thank you')) {
      return {
        text: `You're very welcome! 😊 I'm here to support your learning journey. Feel free to ask me anything about your studies, progress, or need motivation anytime!`,
        type: 'general'
      };
    }

    // Default response
    return {
      text: `I understand you're asking about "${userMessage}". I can help with:\n\n📊 Progress tracking\n📚 Study recommendations\n⏰ Deadline reminders\n🧠 Quiz generation\n💪 Motivation & tips\n👤 Profile optimization\n\nWhat specific area interests you most?`,
      type: 'general'
    };
  }

  openAIChat(type?: string) {
    // This method is kept for compatibility but now the chat is integrated
    const welcomeMessage = type ? 
      `Welcome to ${type} assistance! How can I help you today?` :
      'Hi! I\'m your AI Study Assistant. What would you like to know?';
    
    this.sendQuickMessage(welcomeMessage);
  }

  // Card hover animation methods
  onCardHover(cardName: string, state: 'normal' | 'hovered') {
    const currentStates = this.cardHoverStates();
    this.cardHoverStates.set({
      ...currentStates,
      [cardName]: state
    });
  }

  // Initialize animations
  private initializeAnimations() {
    setTimeout(() => this.cardsAnimated.set(true), 500);
  }
}