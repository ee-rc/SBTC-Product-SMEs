import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// ตั้งค่า Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBTcik7Ldm_Bv_nwY8jq0xdhCx6LwUhu8g",
  authDomain: "sdtc-b8863.firebaseapp.com",
  projectId: "sdtc-b8863",
  storageBucket: "sdtc-b8863.appspot.com",
  messagingSenderId: "1077154268954",
  appId: "1:1077154268954:web:a385080364aa9759994ea3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// การเข้าสู่ระบบ
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("error-message");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    alert("เข้าสู่ระบบสำเร็จ!");
    window.location.href = "products.html"; // เปลี่ยนเส้นทางไปยังหน้าหลัก
  } catch (error) {
    errorMessage.textContent = "อีเมลหรือรหัสผ่านไม่ถูกต้อง!";
  }
});

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "admins", user.email));

        if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.role === "main-admin" || (userData.role === "admin" && userData.approved)) {
                console.log("เข้าสู่ระบบแอดมิน");
                window.location.href = "admin.html";  // ไปหน้าจัดการแอดมิน
            } else {
                alert("คุณไม่ได้รับสิทธิ์เป็นแอดมิน");
                auth.signOut();
            }
        } else {
            alert("คุณไม่ได้รับสิทธิ์เป็นแอดมิน");
            auth.signOut();
        }
    }
});