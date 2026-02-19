import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth-backend.service';
import { BackendApiService } from '../../../core/services/backend-api.service';
import { firstValueFrom } from 'rxjs';

interface InterestCategory {
  name: string;
  icon: string;
  selected: boolean;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {
  interestsForm!: FormGroup;
  goalsForm!: FormGroup;
  // preferencesForm - REMOVED: No longer needed
  
  isLoading = signal(false);
  isAnalyzing = signal(false);
  aiAnalysis = signal<any>(null);
  
  // Interest categories
  interestCategories: InterestCategory[] = [
    { name: 'Artificial Intelligence', icon: 'psychology', selected: false },
    { name: 'Machine Learning', icon: 'model_training', selected: false },
    { name: 'Web Development', icon: 'web', selected: false },
    { name: 'Mobile Development', icon: 'phone_android', selected: false },
    { name: 'Data Science', icon: 'analytics', selected: false },
    { name: 'Cloud Computing', icon: 'cloud', selected: false },
    { name: 'Cybersecurity', icon: 'security', selected: false },
    { name: 'DevOps', icon: 'settings_suggest', selected: false },
    { name: 'Blockchain', icon: 'link', selected: false },
    { name: 'Game Development', icon: 'sports_esports', selected: false },
    { name: 'UI/UX Design', icon: 'design_services', selected: false },
    { name: 'Database Management', icon: 'storage', selected: false },
    { name: 'IoT', icon: 'devices', selected: false },
    { name: 'AR/VR', icon: 'view_in_ar', selected: false },
    { name: 'Network Engineering', icon: 'hub', selected: false },
  ];
  
  // experienceLevels - REMOVED: Preferences step removed, using default
  
  constructor(
    private fb: FormBuilder,
    public router: Router,
    private authService: AuthService,
    private backendApi: BackendApiService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit() {
    this.createForms();
    this.loadUserProfile(); // Load existing user profile data
  }
  
  private createForms() {
    this.interestsForm = this.fb.group({
      customInterest: ['']
    });
    
    this.goalsForm = this.fb.group({
      studyGoal1: ['', Validators.required],
      studyGoal2: [''],
      studyGoal3: [''],
      careerGoal: ['']
    });
    
    // preferencesForm removed - using default Intermediate experience level
  }
  
  private loadUserProfile() {
    const currentUser = this.authService.currentUser();
    if (!currentUser || !currentUser.id) {
      return;
    }
    
    this.isLoading.set(true);
    
    this.backendApi.getUserProfile(currentUser.id).subscribe({
      next: (response: any) => {
        if (response?.success && response.data) {
          const profile = response.data;
          
          // Load existing interests
          if (profile.interests && Array.isArray(profile.interests)) {
            profile.interests.forEach((interest: string) => {
              // Check if interest exists in predefined categories
              const existingCategory = this.interestCategories.find(
                cat => cat.name.toLowerCase() === interest.toLowerCase()
              );
              
              if (existingCategory) {
                // Mark predefined interest as selected
                existingCategory.selected = true;
              } else {
                // Add custom interest that user added previously
                this.interestCategories.push({
                  name: interest,
                  icon: 'add_circle',
                  selected: true
                });
              }
            });
          }
          
          // Note: Goals are intentionally not pre-filled so user enters fresh each visit
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.warn('Could not load user profile:', error);
        this.isLoading.set(false);
        // Don't show error - user can still proceed with onboarding
      }
    });
  }
  
  toggleInterest(interest: InterestCategory) {
    interest.selected = !interest.selected;
  }
  
  addCustomInterest() {
    const customInterest = this.interestsForm.get('customInterest')?.value;
    if (customInterest && customInterest.trim()) {
      const exists = this.interestCategories.find(
        cat => cat.name.toLowerCase() === customInterest.toLowerCase()
      );
      
      if (!exists) {
        this.interestCategories.push({
          name: customInterest.trim(),
          icon: 'add_circle',
          selected: true
        });
        this.interestsForm.get('customInterest')?.setValue('');
        this.snackBar.open('Interest added!', 'Close', { duration: 2000 });
      } else {
        this.snackBar.open('Interest already exists', 'Close', { duration: 2000 });
      }
    }
  }
  
  getSelectedInterests(): string[] {
    return this.interestCategories
      .filter(cat => cat.selected)
      .map(cat => cat.name);
  }
  
  getStudyGoals(): string[] {
    const goals: string[] = [];
    const goal1 = this.goalsForm.get('studyGoal1')?.value;
    const goal2 = this.goalsForm.get('studyGoal2')?.value;
    const goal3 = this.goalsForm.get('studyGoal3')?.value;
    
    if (goal1) goals.push(goal1);
    if (goal2) goals.push(goal2);
    if (goal3) goals.push(goal3);
    
    return goals;
  }
  
  async analyzeAndComplete() {
    const selectedInterests = this.getSelectedInterests();
    
    if (selectedInterests.length === 0) {
      this.snackBar.open('Please select at least one interest', 'Close', { duration: 3000 });
      return;
    }
    
    if (this.goalsForm.invalid) {
      this.snackBar.open('Please complete all required fields', 'Close', { duration: 3000 });
      return;
    }
    
    const currentUser = this.authService.currentUser();
    if (!currentUser || !currentUser.id) {
      this.snackBar.open('Session expired. Please login again.', 'Close', { duration: 3000 });
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.isAnalyzing.set(true);
    
    const onboardingData = {
      userId: currentUser.id,
      interests: selectedInterests,
      studyGoals: this.getStudyGoals(),
      careerGoal: this.goalsForm.get('careerGoal')?.value || '',
      experienceLevel: 'Intermediate'
    };
    
    // Step 1: Try AI analysis — if fails, use local fallback (never block user)
    let analysisData: any = null;
    try {
      const analysisResponse = await Promise.race([
        firstValueFrom(this.backendApi.analyzeInterests(onboardingData)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI analysis timeout')), 20000)
        )
      ]) as any;

      if (analysisResponse?.success && analysisResponse.data) {
        analysisData = analysisResponse.data;
      } else {
        analysisData = this.generateLocalFallbackAnalysis(selectedInterests, onboardingData.studyGoals);
      }
    } catch (analysisError: any) {
      console.warn('AI analysis failed, using local fallback:', analysisError?.message);
      analysisData = this.generateLocalFallbackAnalysis(selectedInterests, onboardingData.studyGoals);
    }

    // Step 2: Try saving to backend — if fails, still proceed to dashboard
    try {
      await Promise.race([
        firstValueFrom(this.backendApi.completeOnboarding(onboardingData)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Save timeout')), 15000)
        )
      ]);
    } catch (saveError: any) {
      console.warn('Could not save onboarding to backend (will retry on next login):', saveError?.message);
      // Don't block the user — profile save will auto-retry
    }

    // Step 3: Always show results — never leave user stuck
    this.aiAnalysis.set(analysisData);
    this.isAnalyzing.set(false);
  }

  /**
   * Generate a local fallback analysis when backend/AI is unavailable
   */
  private generateLocalFallbackAnalysis(interests: string[], goals: string[]): any {
    const topInterest = interests[0] || 'Technology';
    const goalText = goals.length > 0 ? goals[0] : 'your learning goals';

    const pathMap: Record<string, string> = {
      'Artificial Intelligence': '1. Mathematics & Statistics → 2. Python Programming → 3. Machine Learning Fundamentals → 4. Deep Learning → 5. AI Projects',
      'Machine Learning': '1. Python Basics → 2. Data Analysis → 3. Supervised Learning → 4. Neural Networks → 5. ML Projects',
      'Web Development': '1. HTML/CSS → 2. JavaScript → 3. React or Angular → 4. Node.js Backend → 5. Full Stack Projects',
      'Data Science': '1. Python/R → 2. Statistics → 3. Data Visualization → 4. Machine Learning → 5. Data Projects',
      'Cybersecurity': '1. Networking Basics → 2. Linux/OS → 3. Ethical Hacking → 4. Security Tools → 5. Certifications',
      'Mobile Development': '1. Programming Basics → 2. React Native or Flutter → 3. Mobile UI/UX → 4. APIs → 5. App Publishing',
      'Cloud Computing': '1. Linux Basics → 2. Networking → 3. AWS/Azure/GCP → 4. DevOps → 5. Cloud Certifications',
    };

    const recommendedPath = pathMap[topInterest] ||
      `1. Fundamentals of ${topInterest} → 2. Core Concepts → 3. Practical Projects → 4. Advanced Topics → 5. Real-world Applications`;

    return {
      analysisText: `🎯 Personalized Learning Plan\n\nBased on your interest in **${interests.join(', ')}** and your goal to "${goalText}", here is your recommended path:\n\n📚 Recommended Study Path:\n${recommendedPath}\n\n💡 Quick Tips:\n• Set aside 1-2 hours daily for focused learning\n• Build hands-on projects to reinforce concepts\n• Join communities like GitHub, Stack Overflow, and Discord groups\n• Track your progress weekly in the dashboard\n\n🚀 You're all set! Check the Courses section to start your first course.`,
      interests: interests,
      recommendedPath: recommendedPath,
      estimatedDuration: '3-6 months'
    };
  }
  
  skipOnboarding() {
    if (confirm('Are you sure you want to skip? You can complete this later from your profile.')) {
      this.router.navigate(['/dashboard']);
    }
  }
  
  /**
   * Format analysis text - make numbered headings bold
   */
  formatAnalysisText(text: string): string {
    if (!text) return '';
    
    // Split text into lines
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
      // Check if line starts with a number followed by a period (e.g., "1. ", "2. ")
      if (/^\d+\.\s/.test(line.trim())) {
        // Make the heading part bold
        return line.replace(/^(\d+\.\s+[^:]+)/, '<strong>$1</strong>');
      }
      return line;
    });
    
    return formattedLines.join('\n');
  }
}
