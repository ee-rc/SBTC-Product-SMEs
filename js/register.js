import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js"; import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js"; import { getFirestore, collection, addDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ตั้งค่า Firebase
const firebaseConfig = { apiKey: "AIzaSyBTcik7Ldm_Bv_nwY8jq0xdhCx6LwUhu8g", authDomain: "sdtc-b8863.firebaseapp.com", projectId: "sdtc-b8863", storageBucket: "sdtc-b8863.appspot.com", messagingSenderId: "1077154268954", appId: "1:1077154268954:web:a385080364aa9759994ea3" };

const app = initializeApp(firebaseConfig); const auth = getAuth(app); const db = getFirestore(app);

// การสมัครสมาชิก
document.getElementById("register-form").addEventListener("submit", async (e) => { e.preventDefault();

const username = document.getElementById("username").value.trim(); const email = document.getElementById("email").value.trim(); const password = document.getElementById("password").value; const confirmPassword = document.getElementById("confirm-password").value; const errorMessage = document.getElementById("error-message");

// ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
if (password !== confirmPassword) { errorMessage.textContent = "รหัสผ่านไม่ตรงกัน กรุณาลองใหม่อีกครั้ง!"; return; }

if (!username) { errorMessage.textContent = "กรุณากรอกชื่อผู้ใช้!"; return; }

try { const userCredential = await createUserWithEmailAndPassword(auth, email, password); const user = userCredential.user;

console.log("User UID:", user.uid); // ตรวจสอบค่า UID ใน console  

// บันทึกข้อมูลผู้ใช้ใน Firestore โดยใช้ UID เป็น ID ของเอกสาร  
await setDoc(doc(db, "users", user.uid), {
  uid: user.uid,
  username: username,
  email: email,
  createdAt: new Date()
});

// เปลี่ยนหน้าไป login.html ทันที  
window.location.href = "login.html";

} catch (error) { console.error("Error:", error.message); errorMessage.textContent = error.message; } });

