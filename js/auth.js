import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTcik7Ldm_Bv_nwY8jq0xdhCx6LwUhu8g",
  authDomain: "sdtc-b8863.firebaseapp.com",
  projectId: "sdtc-b8863",
  storageBucket: "sdtc-b8863.firebasestorage.app",
  messagingSenderId: "1077154268954",
  appId: "1:1077154268954:web:a385080364aa9759994ea3",
  measurementId: "G-WZBWX7B35M"
};

// Initializing Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ฟังก์ชันเช็คสถานะผู้ใช้
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // หากผู้ใช้ไม่ได้เข้าสู่ระบบจะเปลี่ยนเส้นทางไปยังหน้าล็อกอิน
    window.location.href = "login.html"; // หน้า Login ของคุณ
  }
});