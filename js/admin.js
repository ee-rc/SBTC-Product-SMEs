import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { 
  getFirestore, collection, doc, updateDoc, deleteDoc, onSnapshot 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

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

// ตัวแปรเก็บข้อมูลคำสั่งซื้อทั้งหมด
let ordersData = [];

// ตัวแปรเก็บ filter ที่เลือก
let filters = {
  date: "",
  time: "",
  category: "",
  status: ""
};

// โหลดข้อมูลคำสั่งซื้อและเก็บใน ordersData จากนั้นเรียก renderOrders()
function loadOrders() {
  onSnapshot(collection(db, "orders"), (snapshot) => {
    ordersData = [];
    snapshot.forEach((docSnap) => {
      ordersData.push({ id: docSnap.id, ...docSnap.data() });
    });

    // เรียงคำสั่งซื้อจากใหม่ไปเก่า
    ordersData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    renderOrders();
  });
}

// ฟังก์ชันกรองคำสั่งซื้อที่ได้จากฐานข้อมูลตามค่าที่ผู้ใช้เลือก
function applyOrderFilters(order) {
  // ตรวจสอบวันที่ (เปรียบเทียบในรูปแบบ YYYY-MM-DD)
  if (filters.date && order.createdAt) {
    const orderDate = new Date(order.createdAt.seconds * 1000)
      .toISOString()
      .slice(0, 10);
    if (orderDate !== filters.date) return false;
  }
  // ตรวจสอบเวลา (เปรียบเทียบในรูปแบบ HH:MM)
  if (filters.time && order.createdAt) {
    const orderTime = new Date(order.createdAt.seconds * 1000)
      .toTimeString()
      .slice(0, 5);
    if (orderTime !== filters.time) return false;
  }
  // ตรวจสอบประเภทสินค้า (สมมติ order.products มี property category)
  if (filters.category) {
    if (!order.products || !order.products.some(item => item.category === filters.category)) {
      return false;
    }
  }
  // ตรวจสอบสถานะ (รวมทั้ง "รับสินค้าแล้ว" ด้วย)
  if (filters.status && order.status !== filters.status) {
    return false;
  }
  return true;
}

// ฟังก์ชันแสดงคำสั่งซื้อ โดยจะเรียก applyOrderFilters ในการกรองข้อมูล
function renderOrders() {
  orderList.innerHTML = "";
  ordersData.forEach((order) => {
    if (!applyOrderFilters(order)) return;
    
    const orderId = order.id;
    const createdAt = order.createdAt 
      ? new Date(order.createdAt.seconds * 1000).toLocaleString() 
      : "ไม่ระบุ";

    let productHTML = "";
    if (order.products && order.products.length > 0) {
      productHTML = order.products.map(item => `
        <div class="product-list">
          <img src="${item.image}" alt="${item.name}" class="product-image">
          <p><strong>${item.name}</strong></p>
          <p>💰 ราคา: ${item.price} บาท</p>
          <p>🔢 จำนวน: ${item.quantity} ชิ้น</p>
          ${item.category ? `<p>📂 ประเภท: ${item.category}</p>` : ""}
        </div>
      `).join("");
    }

    const orderItem = document.createElement("div");
    orderItem.classList.add("order-slip");
    if (order.status === "ยืนยันแล้ว" || order.status === "รับสินค้าแล้ว") {
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
         <p><strong>💳 ช่องทางการชำระเงิน:</strong> ${order.paymentMethod} </p> 
      <p><strong>📦 สถานะ:</strong> <span style="color: ${order.status === "ยืนยันแล้ว" || order.status === "รับสินค้าแล้ว" ? "green" : "red"};">${order.status}</span></p>
      <div class="button-group">
          <button class="confirm" onclick="confirmOrder('${orderId}')">✅ สินค้ากำลังจัดส่ง</button>
          <button class="cancel" onclick="cancelOrder('${orderId}')">❌ ยกเลิก</button>
      </div>
    `;

    orderList.appendChild(orderItem);
  });
}

// อัปเดตคำสั่งซื้อให้เป็น "ยืนยันแล้ว"
window.confirmOrder = async (orderId) => {
  await updateDoc(doc(db, "orders", orderId), { status: "กำลังจัดส่ง" });
  alert("✅ สินค้ากำลังจัดส่ง");
};

// ลบคำสั่งซื้อ
window.cancelOrder = async (orderId) => {
  const confirmDelete = confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?");
  if (confirmDelete) {
    await deleteDoc(doc(db, "orders", orderId));
    alert("❌ ยกเลิกคำสั่งซื้อแล้ว");
  }
};

// อ่านค่าจาก Filter UI และอัปเดตตัวแปร filters จากนั้นรีเรนเดอร์ข้อมูลคำสั่งซื้อ
function applyFilters() {
  filters.date = document.getElementById("filterDate").value;
  filters.time = document.getElementById("filterTime").value;
  filters.category = document.getElementById("filterCategory").value;
  filters.status = document.getElementById("filterStatus").value;
  renderOrders();
}

// ล้างค่า Filter ทั้งหมด แล้วรีเรนเดอร์ข้อมูลใหม่
function clearFilters() {
  document.getElementById("filterDate").value = "";
  document.getElementById("filterTime").value = "";
  document.getElementById("filterCategory").value = "";
  document.getElementById("filterStatus").value = "";
  filters = {
    date: "",
    time: "",
    category: "",
    status: ""
  };
  renderOrders();
}

// เรียกใช้งานเพื่อโหลดข้อมูลคำสั่งซื้อเมื่อเปิดหน้าเว็บ
loadOrders();
