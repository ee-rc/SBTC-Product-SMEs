import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, doc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTcik7Ldm_Bv_nwY8jq0xdhCx6LwUhu8g",
  authDomain: "sdtc-b8863.firebaseapp.com",
  projectId: "sdtc-b8863",
  storageBucket: "sdtc-b8863.firebasestorage.app",
  messagingSenderId: "1077154268954",
  appId: "1:1077154268954:web:a385080364aa9759994ea3",
  measurementId: "G-WZBWX7B35M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const orderList = document.getElementById("orderList");

function loadOrders() {
  onSnapshot(collection(db, "orders"), (snapshot) => {
    orderList.innerHTML = "";

    snapshot.forEach((doc) => {
      const order = doc.data();
      const orderId = doc.id;
      const createdAt = order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : "ไม่ระบุ";

      let productHTML = "";
      if (order.products && order.products.length > 0) {
        productHTML = order.products.map(item => `
          <div class="product-list">
            <img src="${item.image}" alt="${item.name}" class="product-image">
            <p><strong>${item.name}</strong></p>
            <p>💰 ราคา: ${item.price} บาท</p>
            <p>🔢 จำนวน: ${item.quantity} ชิ้น</p>
          </div>
        `).join("");
      }

      const orderItem = document.createElement("div");
      orderItem.classList.add("order-slip");
      if (order.status === "ยืนยันแล้ว") {
        orderItem.style.background = "#d4edda";
      }

      orderItem.innerHTML = `
  <p><strong>🆔 คำสั่งซื้อ:</strong> ${orderId}</p>
  <p><strong>👤 ชื่อ:</strong> ${order.name}</p>
  <p><strong>📞 เบอร์โทร:</strong> ${order.phone || "ไม่มีข้อมูล"}</p>
  <p><strong>📍 ที่อยู่:</strong> ${order.address}</p>
  <p><strong>📝 หมายเหตุ:</strong> ${order.note || "ไม่มี"}</p>
  <p><strong>📅 เวลาสั่งซื้อ:</strong> ${createdAt}</p>
  <p><strong>📦 รายการสินค้า:</strong></p>
  <div class="order-products">${productHTML}</div>
  <p><strong>💰 ราคารวม:</strong> ${order.totalPrice} บาท</p>
  <p><strong>📦 สถานะ:</strong> <span style="color: ${order.status === "ยืนยันแล้ว" ? "green" : "red"};">${order.status}</span></p>
  
  <div class="button-group">
      <button class="confirm" onclick="confirmOrder('${orderId}')">✅ ยืนยัน</button>
      <button class="cancel" onclick="cancelOrder('${orderId}')">❌ ยกเลิก</button>
  </div>
`;

      orderList.appendChild(orderItem);
    });
  });
}

window.confirmOrder = async (orderId) => {
  await updateDoc(doc(db, "orders", orderId), { status: "ยืนยันแล้ว" });
  alert("✅ ยืนยันคำสั่งซื้อแล้ว");
};

window.cancelOrder = async (orderId) => {
  const confirmDelete = confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?");
  if (confirmDelete) {
    await deleteDoc(doc(db, "orders", orderId));
    alert("❌ ยกเลิกคำสั่งซื้อแล้ว");
  }
};

loadOrders();