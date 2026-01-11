import { Injectable, signal } from '@angular/core';

/**
 * Global Loading Service
 * Manages application-wide loading state
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Loading state signal
  private loadingSignal = signal<boolean>(false);
  
  // Expose as readonly
  readonly isLoading = this.loadingSignal.asReadonly();
  
  // Loading message
  private messageSignal = signal<string>('Loading...');
  readonly loadingMessage = this.messageSignal.asReadonly();
  
  /**
   * Show loading indicator
   */
  show(message: string = 'Loading...'): void {
    this.messageSignal.set(message);
    this.loadingSignal.set(true);
  }
  
  /**
   * Hide loading indicator
   */
  hide(): void {
    this.loadingSignal.set(false);
  }
}
