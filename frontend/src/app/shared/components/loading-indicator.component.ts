import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

/**
 * Global Loading Indicator Component
 * Shows a full-screen loading overlay with spinner
 */
@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loading-overlay">
        <div class="loading-container">
          <div class="spinner"></div>
          <p class="loading-message">{{ loadingService.loadingMessage() }}</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }
    
    .loading-container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      min-width: 200px;
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      margin: 0 auto 1rem;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-message {
      margin: 0;
      color: #333;
      font-size: 16px;
      font-weight: 500;
    }
    
    /* Mobile optimizations */
    @media (max-width: 768px) {
      .loading-container {
        padding: 1.5rem;
        min-width: 160px;
      }
      
      .spinner {
        width: 40px;
        height: 40px;
      }
      
      .loading-message {
        font-size: 14px;
      }
    }
  `]
})
export class LoadingIndicatorComponent {
  loadingService = inject(LoadingService);
}
