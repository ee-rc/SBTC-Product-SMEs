import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "sdtc-b8863.firebaseapp.com",
    projectId: "sdtc-b8863",
    storageBucket: "sdtc-b8863.appspot.com",
    messagingSenderId: "1077154268954",
    appId: "1:1077154268954:web:a385080364aa9759994ea3",
    measurementId: "G-WZBWX7B35M"
};

const app = initializeApp(firebaseConfig);
export { app }; // ✅ เพิ่ม export เพื่อให้ order.js ใช้ได้