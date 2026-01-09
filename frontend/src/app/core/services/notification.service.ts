import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show a success notification with green styling
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['success-notification'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  /**
   * Show an error notification with red styling
   */
  showError(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['error-notification'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  /**
   * Show an info notification with default styling
   */
  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  /**
   * Show a warning notification with yellow/orange styling
   */
  showWarning(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['warning-notification'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}