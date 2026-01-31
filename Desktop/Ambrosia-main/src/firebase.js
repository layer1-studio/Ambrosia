// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: "AIzaSyCIPE6DWpsUhDwRz9r5WMnsLGV4f8y-X2s",
    authDomain: "ambrosia-web-bc4f9.firebaseapp.com",
    projectId: "ambrosia-web-bc4f9",
    storageBucket: "ambrosia-web-bc4f9.firebasestorage.app",
    messagingSenderId: "768539470516",
    appId: "1:768539470516:web:d9f3705b1c79d35147c5e1",
    measurementId: "G-08Y4G38JM3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);

export default app;
