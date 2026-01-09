import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-floating-chat-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  template: `
    <button 
      mat-fab 
      class="floating-chat-button"
      (click)="openChat()"
      matTooltip="AI Study Assistant 🤖"
      matTooltipPosition="left"
      color="primary">
      <span class="emoji">🤖</span>
    </button>
  `,
  styles: [`
    .floating-chat-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: visible;
    }

    .floating-chat-button:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    }

    .floating-chat-button:active {
      transform: scale(0.95);
    }

    .emoji {
      font-size: 32px;
      line-height: 1;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }

    /* Pulse animation for attention */
    .floating-chat-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50%;
      background: inherit;
      z-index: -1;
      animation: pulse 2s infinite;
      opacity: 0;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 0.7;
      }
      100% {
        transform: scale(1.4);
        opacity: 0;
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .floating-chat-button {
        bottom: 80px; /* Avoid overlap with mobile bottom nav */
        right: 16px;
        width: 56px;
        height: 56px;
      }

      .emoji {
        font-size: 28px;
      }
    }

    @media (max-width: 480px) {
      .floating-chat-button {
        bottom: 70px;
        right: 12px;
        width: 52px;
        height: 52px;
      }

      .emoji {
        font-size: 24px;
      }
    }

    /* Hide on very small screens when keyboard is open */
    @media (max-height: 500px) {
      .floating-chat-button {
        display: none;
      }
    }

    /* Smooth transition when scrolling */
    .floating-chat-button {
      transition: all 0.3s ease-in-out;
    }

    /* Additional glow effect */
    .floating-chat-button::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      z-index: -2;
      filter: blur(10px);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .floating-chat-button:hover::after {
      opacity: 0.6;
    }
  `]
})
export class FloatingChatButtonComponent {
  private router = inject(Router);

  openChat(): void {
    this.router.navigate(['/chat']);
  }
}
