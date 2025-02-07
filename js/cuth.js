document.addEventListener("DOMContentLoaded", function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      window.location.href = "login.html"; // กลับไปหน้า Login ถ้าไม่ได้ล็อกอิน
    }
  });
});

function logout() {
  firebase.auth().signOut()
    .then(() => {
      console.log("ออกจากระบบสำเร็จ!");
      alert("ออกจากระบบเรียบร้อยแล้ว!");
      window.location.href = "login.html"; // กลับไปที่หน้า Login
    })
    .catch((error) => {
      console.error("เกิดข้อผิดพลาดในการออกจากระบบ:", error);
    });
}