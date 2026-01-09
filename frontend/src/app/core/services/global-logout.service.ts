import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalLogoutService {
  
  logout(): void {
    console.log('🚨 GLOBAL LOGOUT TRIGGERED');
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cookies (if exist)
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('🗑️ All data cleared globally');
    
    // Force redirect to login
    console.log('🔄 Forcing redirect to login...');
    window.location.replace('/auth/login');
  }
}

// Make logout function available globally on window object
declare global {
  interface Window {
    globalLogout: () => void;
  }
}

// Attach to window so it can be called from anywhere
window.globalLogout = () => {
  const service = new GlobalLogoutService();
  service.logout();
};