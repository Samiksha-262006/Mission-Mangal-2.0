import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAU707erTjJHTdxBpxFPlC-bw1NZEty-pE",
    authDomain: "mission-mangal-4f70e.firebaseapp.com",
    databaseURL: "https://mission-mangal-4f70e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mission-mangal-4f70e",
    storageBucket: "mission-mangal-4f70e.firebasestorage.app",
    messagingSenderId: "838706816104",
    appId: "1:838706816104:web:0ad4fbd0191432fa33c7dd"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);