import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
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
