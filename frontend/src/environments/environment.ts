export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',  // Backend API URL
  googleClientId: '1063218681611-q2a79aenejv9ee4sl7cp1crsl4nti7dh.apps.googleusercontent.com',
  firebase: {
    apiKey: 'AIzaSyCy0Z8VzPwmD9u_KmeGWmPSGhwUQxT8bAc',
    authDomain: 'ai-course-palnner.firebaseapp.com',
    projectId: 'ai-course-palnner',
    storageBucket: 'ai-course-palnner.firebasestorage.app',
    messagingSenderId: '665053614065',
    appId: '1:665053614065:web:68d8dd35512ada21937e50',
    measurementId: 'G-3RDK3RRN3Y'
  },
  enablePWA: false,
  version: '1.0.0',
  appName: 'Course Planner AI',
  openAIKey: '' // OpenAI API key - should be moved to backend in production
};
