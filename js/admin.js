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

let ordersData = [];
let filters = { date: "", time: "", category: "", status: "" };

function loadOrders() {
  onSnapshot(collection(db, "orders"), (snapshot) => {
    ordersData = [];
    snapshot.forEach((docSnap) => {
      ordersData.push({ id: docSnap.id, ...docSnap.data() });
    });

    ordersData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    renderOrders();
  });
}

function applyOrderFilters(order) {
  if (filters.date && order.createdAt) {
    const orderDate = new Date(order.createdAt.seconds * 1000).toISOString().slice(0, 10);
    if (orderDate !== filters.date) return false;
  }
  if (filters.time && order.createdAt) {
    const orderTime = new Date(order.createdAt.seconds * 1000).toTimeString().slice(0, 5);
    if (orderTime !== filters.time) return false;
  }
  if (filters.category) {
    if (!order.products || !order.products.some(item => item.category === filters.category)) {
      return false;
    }
  }
  if (filters.status && order.status !== filters.status) {
    return false;
  }
  return true;
}

function renderOrders() {
  orderList.innerHTML = "";
  ordersData.forEach((order) => {
    if (!applyOrderFilters(order)) return;
    
    const orderId = order.id;
    const createdAt = order.createdAt 
      ? new Date(order.createdAt.seconds * 1000).toLocaleString() 
      : "ไม่ระบุ";

    let trackingNumber = order.trackingNumber || "";

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
      
      <label for="tracking-${orderId}"><strong>🚚 หมายเลขติดตาม:</strong></label>
      <input type="text" id="tracking-${orderId}" value="${trackingNumber}" placeholder="กรอกหมายเลขติดตาม">
      <button class="update-tracking" onclick="updateTrackingNumber('${orderId}')">💾 บันทึก</button>

      <div class="button-group">
          <button class="confirm" onclick="confirmOrder('${orderId}')">✅ ยืนยัน</button>
          <button class="confirm" onclick="confirmOrder1('${orderId}')">✅ จัดส่ง</button>
          <button class="confirm" onclick="confirmOrder2('${orderId}')">✅ เสร็จสิ้น</button>
          <button class="cancel" onclick="cancelOrder('${orderId}')">❌ ยกเลิก</button>
      </div>
    `;

    orderList.appendChild(orderItem);
  });
}

window.updateTrackingNumber = async (orderId) => {
  const trackingInput = document.getElementById(`tracking-${orderId}`);
  const trackingNumber = trackingInput.value.trim();

  if (trackingNumber === "") {
    alert("⚠️ กรุณากรอกหมายเลขติดตามพัสดุ!");
    return;
  }

  try {
    await updateDoc(doc(db, "orders", orderId), { trackingNumber });
    alert("✅ หมายเลขติดตามถูกบันทึกแล้ว!");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการบันทึกหมายเลขติดตาม:", error);
    alert("❌ ไม่สามารถบันทึกหมายเลขติดตามได้!");
  }
};

window.confirmOrder = async (orderId) => {
  await updateDoc(doc(db, "orders", orderId), { status: "ร้านค้ายืนยันคำสั่งซื้อของคุณแล้ว" });
  alert("✅ ยืนยัน");
};

window.confirmOrder1 = async (orderId) => {
  await updateDoc(doc(db, "orders", orderId), { status: "สินค้าอยู่ระหว่างการจัดส่ง" });
  alert("✅ จัดส่ง");
};

window.confirmOrder2 = async (orderId) => {
  await updateDoc(doc(db, "orders", orderId), { status: "จัดส่งเสร็จสิ้น" });
  alert("✅ เสร็จ");
};

window.cancelOrder = async (orderId) => {
  const confirmDelete = confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?");
  if (confirmDelete) {
    await deleteDoc(doc(db, "orders", orderId));
    alert("❌ ยกเลิกคำสั่งซื้อแล้ว");
  }
};

function applyFilters() {
  filters.date = document.getElementById("filterDate").value;
  filters.time = document.getElementById("filterTime").value;
  filters.category = document.getElementById("filterCategory").value;
  filters.status = document.getElementById("filterStatus").value;
  renderOrders();
}

function clearFilters() {
  document.getElementById("filterDate").value = "";
  document.getElementById("filterTime").value = "";
  document.getElementById("filterCategory").value = "";
  document.getElementById("filterStatus").value = "";
  filters = { date: "", time: "", category: "", status: "" };
  renderOrders();
}

loadOrders();
