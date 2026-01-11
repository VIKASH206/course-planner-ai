import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { LoadingIndicatorComponent } from './shared/components/loading-indicator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoadingIndicatorComponent],
  template: `
    <div class="app-container">
      <app-loading-indicator></app-loading-indicator>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      height: 100vh;
      overflow: hidden;
      transition: background-color 0.3s ease;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Course Planner AI';
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Initialize theme service (this will apply the stored theme)
    // The theme service constructor already handles initialization
  }
}
