import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div class="text-center">
        <mat-spinner diameter="60" class="mx-auto mb-4"></mat-spinner>
        <h2 class="text-2xl font-bold text-white mb-2">Processing OAuth...</h2>
        <p class="text-gray-300">Please wait while we complete your authentication.</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Redirect to login if accessed directly
      console.log('OAuth callback accessed directly, redirecting to login...');
      window.location.href = '/auth/login';
    }
  }
}
