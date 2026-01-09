import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private readonly THEME_KEY = 'course-planner-theme';
  
  // Theme state
  currentTheme = signal<Theme>(this.getStoredTheme());
  isDarkMode = signal(false);

  constructor() {
    // Initialize theme on service creation
    this.initializeTheme();
    
    // Watch for theme changes and apply them
    effect(() => {
      this.applyTheme(this.currentTheme());
    }, { allowSignalWrites: true });

    // Listen for system theme changes when in auto mode
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.currentTheme() === 'auto') {
          this.updateDarkModeState();
        }
      });
    }
  }

  /**
   * Set the theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.storeTheme(theme);
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const current = this.currentTheme();
    if (current === 'auto') {
      // If currently auto, switch to the opposite of system preference
      const systemPrefersDark = this.getSystemPreference();
      this.setTheme(systemPrefersDark ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      this.setTheme(current === 'light' ? 'dark' : 'light');
    }
  }

  /**
   * Get the current theme display name
   */
  getThemeDisplayName(): string {
    const theme = this.currentTheme();
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'auto': return 'Auto';
      default: return 'Light';
    }
  }

  /**
   * Get the theme icon
   */
  getThemeIcon(): string {
    const theme = this.currentTheme();
    switch (theme) {
      case 'light': return 'light_mode';
      case 'dark': return 'dark_mode';
      case 'auto': return 'brightness_auto';
      default: return 'light_mode';
    }
  }

  private initializeTheme(): void {
    const stored = this.getStoredTheme();
    this.currentTheme.set(stored);
    this.applyTheme(stored);
  }

  private applyTheme(theme: Theme): void {
    const body = this.document.body;
    const html = this.document.documentElement;
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme', 'dark');
    html.classList.remove('light-theme', 'dark-theme', 'dark');
    
    let shouldUseDark = false;
    
    switch (theme) {
      case 'dark':
        shouldUseDark = true;
        break;
      case 'light':
        shouldUseDark = false;
        break;
      case 'auto':
        shouldUseDark = this.getSystemPreference();
        break;
    }
    
    // Apply theme classes
    const themeClass = shouldUseDark ? 'dark-theme' : 'light-theme';
    body.classList.add(themeClass);
    html.classList.add(themeClass);
    
    // Also add 'dark' class for Tailwind CSS compatibility
    if (shouldUseDark) {
      body.classList.add('dark');
      html.classList.add('dark');
    }
    
    // Update dark mode state
    this.isDarkMode.set(shouldUseDark);
    
    // Set CSS custom property for theme
    this.document.documentElement.style.setProperty('--current-theme', shouldUseDark ? 'dark' : 'light');
  }

  private updateDarkModeState(): void {
    if (this.currentTheme() === 'auto') {
      const shouldUseDark = this.getSystemPreference();
      this.isDarkMode.set(shouldUseDark);
      this.applyTheme('auto');
    }
  }

  private getSystemPreference(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  private getStoredTheme(): Theme {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.THEME_KEY) as Theme;
      if (stored && ['light', 'dark', 'auto'].includes(stored)) {
        return stored;
      }
    }
    return 'auto'; // Default to auto mode
  }

  private storeTheme(theme: Theme): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }
}