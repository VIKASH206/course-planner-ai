import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';

let firebaseApp: FirebaseApp | null = null;

export function getFirebaseApp(config: FirebaseOptions): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);
  return firebaseApp;
}
