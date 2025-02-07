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

// ตรวจสอบว่าแอดมินหลักล็อกอินหรือไม่
auth.onAuthStateChanged(async user => {
  if (!user || user.email !== 'gamione09@gmail.com') {
    // หากไม่ได้ล็อกอินเป็นแอดมินหลัก ส่งไปที่หน้าอื่น (เช่น หน้า Login หรือหน้าหลัก)
    window.location.href = "login.html"; // เปลี่ยนเส้นทางไปยังหน้า login
    return;
  }

  // ถ้าแอดมินหลักล็อกอินแล้ว ให้แสดงคำขอ
  displayRequests(); // แสดงคำขอสมัครแอดมิน
});

// แสดงคำขอสมัครแอดมิน
async function displayRequests() {
  const requestsRef = db.collection("adminRequests").where("approved", "==", false);
  const snapshot = await requestsRef.get();

  const adminRequestsDiv = document.getElementById("adminRequests");
  snapshot.forEach(doc => {
    const requestData = doc.data();
    adminRequestsDiv.innerHTML += `
            <div>
                <p>${requestData.email} - รอการอนุมัติ</p>
                <button onclick="approveRequest('${doc.id}')">อนุมัติ</button>
            </div>
        `;
  });
}

// อนุมัติคำขอเป็นแอดมิน
async function approveRequest(requestId) {
  try {
    await db.collection("adminRequests").doc(requestId).update({
      approved: true
    });
    alert("อนุมัติคำขอเรียบร้อยแล้ว");
    location.reload(); // รีเฟรชหน้าจอ
  } catch (error) {
    console.error("Error approving request:", error);
  }
}