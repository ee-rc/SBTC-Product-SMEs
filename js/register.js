import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const db = getFirestore(app);

// การสมัครสมาชิก
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const errorMessage = document.getElementById("error-message");

  // ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
  if (password !== confirmPassword) {
    errorMessage.textContent = "รหัสผ่านไม่ตรงกัน กรุณาลองใหม่อีกครั้ง!";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // บันทึกข้อมูลผู้ใช้ใน Firestore
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name: name,
      email: email,
      createdAt: new Date()
    });

    alert("สมัครสมาชิกสำเร็จ!");
    window.location.href = "login.html"; // ไปหน้าเข้าสู่ระบบ
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});