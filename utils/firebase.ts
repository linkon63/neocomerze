import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAAX_9alyMbxiUSaLuGY3DeImFSTBsXOFc',
  authDomain: 'm-ftht-practiceday.firebaseapp.com',
  projectId: 'm-ftht-practiceday',
  storageBucket: 'm-ftht-practiceday.firebasestorage.app',
  messagingSenderId: '996034074146',
  appId: '1:996034074146:web:c7dd989e7d070d067d1c7b',
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(firebaseApp);
