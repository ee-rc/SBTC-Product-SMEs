;import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// ตั้งค่า Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBTcik7Ldm_Bv_nwY8jq0xdhCx6LwUhu8g",
  authDomain: "sdtc-b8863.firebaseapp.com",
  projectId: "sdtc-b8863",
  storageBucket: "sdtc-b8863.appspot.com",
  messagingSenderId: "1077154268954",
  appId: "1:1077154268954:web:a385080364aa9759994ea3",
  measurementId: "G-WZBWX7B35M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const orderList = document.getElementById("orderList");

// ตรวจสอบการเข้าสู่ระบบ
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadOrders(user);
  } else {
    orderList.innerHTML = "<p>⚠️ กรุณาเข้าสู่ระบบเพื่อดูคำสั่งซื้อของคุณ</p>";
  }
});

// โหลดคำสั่งซื้อ
function loadOrders(user) {
  const q = query(collection(db, "orders"), where("userId", "==", user.uid));

  if (window.unsubscribeOrders) {
    window.unsubscribeOrders();
  }

  window.unsubscribeOrders = onSnapshot(q, (snapshot) => {
    orderList.innerHTML = "";

    snapshot.forEach((doc) => {
      const order = doc.data();
      const orderId = doc.id;

      const orderItem = document.createElement("div");
      orderItem.classList.add("order-slip");
      orderItem.id = orderId;

      orderItem.innerHTML = `
        <p><strong>🆔 คำสั่งซื้อ:</strong> ${orderId}</p>
        <p><strong>👤 ชื่อ:</strong> ${order.name}</p>
        <p><strong>📍 ที่อยู่:</strong> ${order.address}</p>
        <p><strong>📞 เบอร์โทร:</strong> ${order.phone}</p>
        <p><strong>💰 ราคารวม:</strong> ${order.totalPrice} บาท</p>
        <p><strong>📦 สถานะ:</strong> <span class="order-status">${order.status}</span></p>
      `;

      // แสดงสินค้าที่สั่ง
      if (order.products && order.products.length > 0) {
        const productList = document.createElement("div");
        productList.classList.add("product-list");

        order.products.forEach(product => {
          const productItem = document.createElement("div");
          productItem.classList.add("product-item");

          productItem.innerHTML = `
            <img src="${product.image || 'logo.png' }" alt="${product.name}">
            <p><strong>📦 ชื่อสินค้า:</strong> ${product.name}</p>
            <p><strong>🔢 จำนวน:</strong> ${product.quantity}</p>
            <p><strong>💰 ราคา:</strong> ${product.price} บาท</p>
          `;
          productList.appendChild(productItem);
        });

        orderItem.appendChild(productList);
      }

      // **แสดงปุ่มตามสถานะของคำสั่งซื้อ**
      let buttons = "";

      if (order.status === "รอดำเนินการ") {
        buttons = `
          <div class="button-group">
            <button class="edit" onclick="editOrder('${orderId}')">✏️ แก้ไข</button>
            <button class="confirm" onclick="confirmOrder('${orderId}')">✅ ยืนยัน</button>
            <button class="cancel" onclick="cancelOrder('${orderId}')">❌ ยกเลิก</button>
          </div>
        `;
      } else if (order.status === "ยืนยันแล้ว") {
        buttons = `
          <div class="button-group">
            <button class="received" onclick="receivedOrder('${orderId}')">📦 รับสินค้า</button>
          </div>
        `;
      }

      orderItem.innerHTML += buttons;
      orderList.appendChild(orderItem);
    });
  });
}

// ยืนยันคำสั่งซื้อ
window.confirmOrder = async (orderId) => {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status: "ยืนยันแล้ว" });
  alert("✅ ยืนยันคำสั่งซื้อแล้ว!");
};

// ยกเลิกคำสั่งซื้อ
window.cancelOrder = async (orderId) => {
  const orderRef = doc(db, "orders", orderId);
  await deleteDoc(orderRef);
  document.getElementById(orderId).remove();
  alert("❌ ยกเลิกคำสั่งซื้อแล้ว!");
};

// รับสินค้า
window.receivedOrder = async (orderId) => {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status: "ได้รับสินค้า" });

  // อัปเดต UI ให้ปุ่มหายไป
  const orderItem = document.getElementById(orderId);
  if (orderItem) {
    orderItem.querySelector(".button-group").innerHTML = "";
  }

  alert("✅ รับสินค้าสำเร็จ!");
};