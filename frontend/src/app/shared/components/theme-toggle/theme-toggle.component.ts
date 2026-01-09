import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule
  ],
  template: `
    <div class="theme-toggle">
      
      <!-- Simple Toggle Button (when showMenu is false) -->
      <button *ngIf="!showMenu"
              mat-icon-button 
              (click)="toggleTheme()"
              [matTooltip]="getTooltipText()"
              matTooltipPosition="below"
              class="theme-button"
              [class.compact]="variant === 'compact'">
        <mat-icon>{{ themeService.getThemeIcon() }}</mat-icon>
      </button>

      <!-- Menu Toggle Button (when showMenu is true) -->
      <div *ngIf="showMenu">
        <button mat-icon-button 
                [matMenuTriggerFor]="themeMenu"
                [matTooltip]="'Change theme'"
                matTooltipPosition="below"
                class="theme-button"
                [class.compact]="variant === 'compact'">
          <mat-icon>{{ themeService.getThemeIcon() }}</mat-icon>
        </button>

        <mat-menu #themeMenu="matMenu" class="theme-menu">
          <button mat-menu-item 
                  (click)="setTheme('light')"
                  [class.active]="themeService.currentTheme() === 'light'">
            <mat-icon>light_mode</mat-icon>
            <span>Light</span>
            <mat-icon *ngIf="themeService.currentTheme() === 'light'" class="checkmark">check</mat-icon>
          </button>
          
          <button mat-menu-item 
                  (click)="setTheme('dark')"
                  [class.active]="themeService.currentTheme() === 'dark'">
            <mat-icon>dark_mode</mat-icon>
            <span>Dark</span>
            <mat-icon *ngIf="themeService.currentTheme() === 'dark'" class="checkmark">check</mat-icon>
          </button>
          
          <button mat-menu-item 
                  (click)="setTheme('auto')"
                  [class.active]="themeService.currentTheme() === 'auto'">
            <mat-icon>brightness_auto</mat-icon>
            <span>Auto</span>
            <mat-icon *ngIf="themeService.currentTheme() === 'auto'" class="checkmark">check</mat-icon>
          </button>
        </mat-menu>
      </div>
    </div>
  `,
  styles: [`
    .theme-toggle {
      display: inline-block;
    }

    .theme-button {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 8px !important;
      position: relative;
      overflow: hidden;
    }

    .theme-button:hover {
      background-color: var(--mat-toolbar-container-background-color, rgba(255, 255, 255, 0.1));
      transform: scale(1.05);
    }

    .theme-button.compact {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }

    .theme-button mat-icon {
      transition: transform 0.3s ease, color 0.3s ease;
    }

    .theme-button:hover mat-icon {
      transform: rotate(180deg);
    }

    :host-context(.dark-theme) .theme-button mat-icon {
      color: #ffd54f;
    }

    :host-context(.light-theme) .theme-button mat-icon {
      color: #ff9800;
    }

    /* Theme Menu Styles */
    ::ng-deep .theme-menu {
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    ::ng-deep .theme-menu .mat-mdc-menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      transition: all 0.2s ease;
      position: relative;
      min-height: 48px;
    }

    ::ng-deep .theme-menu .mat-mdc-menu-item:hover {
      background-color: var(--mat-menu-item-hover-state-layer-color, rgba(0, 0, 0, 0.04));
    }

    ::ng-deep .theme-menu .mat-mdc-menu-item.active {
      background-color: var(--mat-primary-50, rgba(63, 81, 181, 0.08));
      color: var(--mat-primary, #3f51b5);
    }

    ::ng-deep .theme-menu .mat-mdc-menu-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-right: 0;
    }

    ::ng-deep .theme-menu .checkmark {
      margin-left: auto;
      color: var(--mat-primary, #3f51b5);
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Animation for theme switching */
    @keyframes themeSwitch {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.1); }
      100% { transform: rotate(360deg) scale(1); }
    }

    .theme-button.switching mat-icon {
      animation: themeSwitch 0.6s ease-in-out;
    }

    /* Responsive design */
    /* Small phones (320px - 480px) */
    @media screen and (max-width: 480px) {
      .theme-button {
        width: 44px;
        height: 44px;
        min-width: 44px;
        padding: 10px;
      }
      
      .theme-button.compact {
        width: 40px;
        height: 40px;
        min-width: 40px;
        padding: 8px;
      }

      .theme-button mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      ::ng-deep .theme-menu .mat-mdc-menu-item {
        min-height: 56px;
        padding: 16px 20px;
        font-size: 16px;
      }

      ::ng-deep .theme-menu .mat-mdc-menu-item mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    /* Large phones / Small tablets (481px - 768px) */
    @media screen and (min-width: 481px) and (max-width: 768px) {
      .theme-button {
        width: 42px;
        height: 42px;
        min-width: 42px;
      }
      
      .theme-button.compact {
        width: 38px;
        height: 38px;
        min-width: 38px;
      }

      ::ng-deep .theme-menu .mat-mdc-menu-item {
        min-height: 52px;
        padding: 14px 18px;
      }
    }

    /* Tablets (769px - 1024px) */
    @media screen and (min-width: 769px) and (max-width: 1024px) {
      .theme-button {
        width: 40px;
        height: 40px;
        min-width: 40px;
      }
      
      .theme-button.compact {
        width: 36px;
        height: 36px;
        min-width: 36px;
      }
    }

    /* Large tablets / Small desktops (1025px - 1440px) */
    @media screen and (min-width: 1025px) and (max-width: 1440px) {
      .theme-button {
        width: 40px;
        height: 40px;
        min-width: 40px;
      }
      
      .theme-button.compact {
        width: 36px;
        height: 36px;
        min-width: 36px;
      }
    }

    /* Large desktops (1441px+) */
    @media screen and (min-width: 1441px) {
      .theme-button {
        width: 42px;
        height: 42px;
        min-width: 42px;
      }
      
      .theme-button.compact {
        width: 38px;
        height: 38px;
        min-width: 38px;
      }
    }

    /* Orientation-specific adjustments */
    @media screen and (orientation: landscape) and (max-height: 500px) {
      .theme-button {
        width: 36px;
        height: 36px;
        min-width: 36px;
      }
      
      .theme-button.compact {
        width: 32px;
        height: 32px;
        min-width: 32px;
      }

      ::ng-deep .theme-menu {
        max-height: 60vh;
        overflow-y: auto;
      }
    }

    /* High DPI / Retina displays */
    @media screen and (-webkit-min-device-pixel-ratio: 2), 
           screen and (min-resolution: 192dpi) {
      .theme-button mat-icon {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    }

    /* Touch device optimizations */
    @media (hover: none) and (pointer: coarse) {
      .theme-button {
        min-width: 44px;
        min-height: 44px;
        padding: 12px;
      }
      
      .theme-button:hover {
        transform: none; /* Remove hover transform on touch devices */
      }
      
      .theme-button:active {
        transform: scale(0.95);
        background-color: var(--mat-toolbar-container-background-color, rgba(255, 255, 255, 0.2));
      }

      ::ng-deep .theme-menu .mat-mdc-menu-item {
        min-height: 56px;
        padding: 16px;
      }
    }

    /* Hover-capable devices */
    @media (hover: hover) and (pointer: fine) {
      .theme-button:hover {
        transform: scale(1.05);
      }

      .theme-button:hover mat-icon {
        transform: rotate(180deg);
      }
    }
  `]
})
export class ThemeToggleComponent {
  @Input() showMenu = false; // If true, shows dropdown menu, if false, shows simple toggle
  @Input() variant: 'normal' | 'compact' = 'normal';
  
  themeService: ThemeService = inject(ThemeService);
  private switching = false;

  toggleTheme(): void {
    if (this.switching) return;
    
    this.switching = true;
    const button = document.querySelector('.theme-button');
    button?.classList.add('switching');
    
    // Add slight delay for animation
    setTimeout(() => {
      this.themeService.toggleTheme();
      this.switching = false;
      button?.classList.remove('switching');
    }, 300);
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  getTooltipText(): string {
    const currentTheme = this.themeService.getThemeDisplayName();
    return `Current theme: ${currentTheme} - Click to toggle`;
  }
}