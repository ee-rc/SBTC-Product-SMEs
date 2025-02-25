import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// ตั้งค่า Firebase
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
const auth = getAuth();
const orderList = document.getElementById("orderList");

// ตรวจสอบการเข้าสู่ระบบ
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadOrders(user);
  } else {
    if (orderList) orderList.innerHTML = "<p>⚠️ กรุณาเข้าสู่ระบบเพื่อดูคำสั่งซื้อของคุณ</p>";
  }
});
window.copyOrderId = (orderId) => {  
  navigator.clipboard.writeText(orderId).then(() => {  
    ("✅ คัดลอกหมายเลขคำสั่งซื้อสำเร็จ!");  
  }).catch(() => {  
    alert("❌ ไม่สามารถคัดลอกได้!");  
  });  
};

// โหลดคำสั่งซื้อ
function loadOrders(user) {
  if (!orderList) return;
  
  const q = query(collection(db, "orders"), where("userId", "==", user.uid));
  
  if (window.unsubscribeOrders) {
    window.unsubscribeOrders();
  }
  
  window.unsubscribeOrders = onSnapshot(q, (snapshot) => {
    orderList.innerHTML = "";
    
    snapshot.docs.forEach((doc) => {
      const order = doc.data();
      const orderId = doc.id;
      
      const orderItem = document.createElement("div");
      orderItem.classList.add("order-slip");
      orderItem.id = orderId;
      
      orderItem.innerHTML = `  
  <p><strong>🆔 คำสั่งซื้อ:</strong> ${orderId} <button class="copy-id" onclick="copyOrderId('${orderId}')">📋 คัดลอก ID</button></p>  
  <p><strong>👤 ชื่อ:</strong> ${order.name}</p>  
  <p><strong>📍 ที่อยู่:</strong> ${order.address}</p>  
  <p><strong>📞 เบอร์โทร:</strong> ${order.phone}</p>  
  <p><strong>💰 ราคารวม:</strong> ${order.totalPrice} บาท</p>  
     <p><strong>💳 ช่องทางการชำระเงิน:</strong> ${order.paymentMethod} </p> 
  <p><strong>📝 หมายเหตุ:</strong> ${order.note || "ไม่มี"}</p>  
  <p><strong>📦หมายเลขติดตามพัสดุ:</strong> ${order.trackingNumber || "●_●?"}</p>  
  <p><strong>📦 สถานะ:</strong> <span class="order-status">${order.status}</span></p>  
`;
      
      if (order.products && Array.isArray(order.products) && order.products.length > 0) {
        const productList = document.createElement("div");
        productList.classList.add("product-list");
        
        order.products.forEach(product => {
          const productItem = document.createElement("div");
          productItem.classList.add("product-item");
          
          productItem.innerHTML = `
            <img src="${product.image || 'logo.png'}" alt="${product.name}">
            <p><strong>📦 ชื่อสินค้า:</strong> ${product.name}</p>
            <p><strong>🔢 จำนวน:</strong> ${product.quantity}</p>
            <p><strong>💰 ราคา:</strong> ${product.price} บาท</p>
          `;
          productList.appendChild(productItem);
        });
        
        orderItem.appendChild(productList);
      }
      
      const buttonGroup = document.createElement("div");
      buttonGroup.classList.add("button-group");
      
      if (order.status === "รอยืนยัน") {
        buttonGroup.innerHTML = `
          <button class="edit" onclick="editOrder('${orderId}')">✏️ แก้ไข</button>
          <button class="confirm" onclick="confirmOrder('${orderId}')">✅ ยืนยัน</button>
          <button class="cancel" onclick="cancelOrder('${orderId}')">❌ ยกเลิก</button>
        `;
      } else if (order.status === "จัดส่งเสร็จสิ้น") {
        buttonGroup.innerHTML = `
          <button class="received" onclick="receivedOrder('${orderId}')">📦 รับสินค้า</button>
        `;
      }
      
      orderItem.appendChild(buttonGroup);
      orderList.appendChild(orderItem);
    });
  });
}

// **ยกเลิกคำสั่งซื้อ (เพิ่มการยืนยันก่อน)**
window.cancelOrder = async (orderId) => {
  const isConfirmed = confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้? \n(กดยืนยันเพื่อดำเนินการ)");
  
  if (!isConfirmed) {
    alert("❌ การยกเลิกถูกยกเลิก!");
    return;
  }

  try {
    await deleteDoc(doc(db, "orders", orderId));
    document.getElementById(orderId).remove();
    alert("✅ คำสั่งซื้อถูกยกเลิกเรียบร้อย!");
  } catch (error) {
    alert("❌ ไม่สามารถยกเลิกคำสั่งซื้อได้");
  }
};

// **แก้ไขคำสั่งซื้อ**
window.editOrder = async (orderId) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    
    // ดึงข้อมูลปัจจุบัน
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) {
      alert("⚠️ ไม่พบคำสั่งซื้อนี้!");
      return;
    }
    const orderData = orderSnap.data();

    // ให้ผู้ใช้เลือกว่าจะแก้อะไร
    const editChoice = prompt("🔄 ต้องการแก้ไขอะไร?\n1: ชื่อ\n2: ที่อยู่\n3: เบอร์โทร\n4: หมายเหตุ\n(พิมพ์ตัวเลขที่ต้องการเปลี่ยนแล้วกดตกลง)");

    let updateData = {};
    
    if (editChoice === "1") {
      const newName = prompt("📝 ป้อนชื่อใหม่:", orderData.name);
      if (newName) updateData.name = newName;
    } else if (editChoice === "2") {
      const newAddress = prompt("📍 ป้อนที่อยู่ใหม่:", orderData.address);
      if (newAddress) updateData.address = newAddress;
    } else if (editChoice === "3") {
      const newPhone = prompt("📞 ป้อนเบอร์โทรใหม่:", orderData.phone);
      if (newPhone) updateData.phone = newPhone;
    } else if (editChoice === "4") {
  const newNote = prompt("📝 หมายเหตุ", orderData.note);
  if (newNote) updateData.note = newNote;
} else if (editChoice === "5") {
  const newQuantity = prompt("🔢 จำนวนสินค้า", orderData.quantity);
  if (newQuantity) updateData.quantity = newQuantity;
} else {
      alert("⚠️ กรุณาเลือกตัวเลือกที่ถูกต้อง!");
      return;
    }

    // อัปเดตเฉพาะข้อมูลที่เปลี่ยนแปลง
    await updateDoc(orderRef, updateData);

    // อัปเดต UI ทันที
    const orderItem = document.getElementById(orderId);
    if (orderItem) {
      if (updateData.name) orderItem.querySelector("p:nth-child(2)").innerHTML = `<strong>👤 ชื่อ:</strong> ${updateData.name}`;
      if (updateData.name) orderItem.querySelector("p:nth-child(2)").innerHTML = `<strong>👤 ชื่อ:</strong> ${updateData.name}`;
if (updateData.address) orderItem.querySelector("p:nth-child(3)").innerHTML = `<strong>📍 ที่อยู่:</strong> ${updateData.address}`;
if (updateData.phone) orderItem.querySelector("p:nth-child(4)").innerHTML = `<strong>📞 เบอร์โทร:</strong> ${updateData.phone}`;
if (updateData.note) orderItem.querySelector("p:nth-child(6)").innerHTML = `<strong>📝 หมายเหตุ:</strong> ${updateData.note}`;

            

    }

    alert("✅ อัปเดตข้อมูลสำเร็จ!");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการแก้ไข:", error);
    alert("❌ ไม่สามารถแก้ไขคำสั่งซื้อได้");
  }
};

// **ยืนยันคำสั่งซื้อ**
window.confirmOrder = async (orderId) => {
  try {
    await updateDoc(doc(db, "orders", orderId), { status: "ยืนยันแล้ว" });
    document.getElementById(orderId).querySelector(".order-status").innerText = "ยืนยันแล้ว";
    alert("✅ ยืนยันคำสั่งซื้อแล้ว!");
  } catch (error) {
    alert("❌ ไม่สามารถยืนยันคำสั่งซื้อได้");
  }
};

// **รับสินค้า**
window.receivedOrder = async (orderId) => {
  try {
    await updateDoc(doc(db, "orders", orderId), { status: "ได้รับสินค้า" });
    document.getElementById(orderId).querySelector(".order-status").innerText = "ได้รับสินค้า";
    alert("✅ รับสินค้าสำเร็จ!");
  } catch (error) {
    alert("❌ ไม่สามารถอัปเดตสถานะการรับสินค้าได้");
  }
  
};
