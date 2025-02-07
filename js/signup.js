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
const db = firebase.firestore();
const auth = firebase.auth();

document.getElementById("signupButton").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();

  if (email) {
    try {
      // ส่งคำขอเป็นแอดมิน
      await db.collection("adminRequests").add({
        email: email,
        approved: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      alert("คำขอสมัครแอดมินถูกส่งแล้ว รอการอนุมัติจากแอดมินหลัก");
    } catch (error) {
      console.error("Error sending admin request:", error);
    }
  } else {
    alert("กรุณากรอกอีเมล");
  }
});