// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBTcik7Ldm_Bv_nwY8jq0xdhCx6LwUhu8g",
  authDomain: "sdtc-b8863.firebaseapp.com",
  projectId: "sdtc-b8863",
  storageBucket: "sdtc-b8863.firebasestorage.app",
  messagingSenderId: "1077154268954",
  appId: "1:1077154268954:web:a385080364aa9759994ea3",
  measurementId: "G-WZBWX7B35M"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ตรวจสอบสถานะการล็อกอิน
firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        // ถ้าผู้ใช้ไม่ได้ล็อกอิน ส่งไปที่หน้า login.html
        window.location.href = "login.html";  // เปลี่ยนเส้นทางไปยังหน้า login
    }
});