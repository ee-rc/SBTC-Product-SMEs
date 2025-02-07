import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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
const db = getDatabase(app);
const chatRef = ref(db, "chats");

// ฟังก์ชันส่งข้อความ
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const messageText = messageInput.value.trim();

  if (messageText !== "") {
    push(chatRef, {
      sender: "user", // เปลี่ยนเป็น "shop" หากเป็นร้านค้าตอบกลับ
      message: messageText,
      timestamp: Date.now()
    });
    messageInput.value = "";
  }
}

// ฟังก์ชันโหลดข้อความแชท
onChildAdded(chatRef, (snapshot) => {
  const message = snapshot.val();
  const chatBox = document.getElementById("chatBox");

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("chat-message");
  messageDiv.classList.add(message.sender === "user" ? "user-message" : "shop-message");
  messageDiv.textContent = message.message;

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // เลื่อนลงอัตโนมัติ
});

// ทำให้ฟังก์ชันส่งข้อความเรียกใช้งานได้
window.sendMessage = sendMessage;
// ตะกร้าสิรค้า
document.addEventListener("DOMContentLoaded", function() {
  updateCartCount();
});

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, image, price) {
  cart.push({ name, image, price });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert("✅ เพิ่มสินค้าในตะกร้าแล้ว!");
}

function updateCartCount() {
  document.getElementById("cartCount").textContent = cart.length;
}

// โหลดจำนวนสินค้าในตะกร้าตอนเริ่มหน้า
document.addEventListener("DOMContentLoaded", updateCartCount);

document.addEventListener("DOMContentLoaded", function () {
    let order = localStorage.getItem("order");
    if (order) {
        let chatBox = document.getElementById("chatBox");
        let orderMessage = document.createElement("div");
        orderMessage.className = "chat-message";
        orderMessage.textContent = "🛍 คำสั่งซื้อ:\n" + order;
        chatBox.appendChild(orderMessage);
        localStorage.removeItem("order"); // ลบคำสั่งซื้อหลังแสดงแล้ว
    }
});

function checkout() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("ตะกร้าว่างเปล่า!");
        return;
    }
    let orderText = cart.map(item => `${item.name} - ${item.price} บาท`).join("\n");
    localStorage.setItem("order", orderText);
    window.location.href = "chat.html"; // ไปที่หน้าแชท
}

document.addEventListener("DOMContentLoaded", function () {
    let order = localStorage.getItem("order");
    if (order) {
        let chatBox = document.getElementById("chatBox");
        let orderMessage = document.createElement("div");
        orderMessage.className = "chat-message";
        orderMessage.textContent = "🛍 คำสั่งซื้อ:\n" + order;
        chatBox.appendChild(orderMessage);
        localStorage.removeItem("order"); // ลบคำสั่งซื้อหลังแสดงแล้ว
    }
});
function adminSendMessage() {
  let adminInput = document.getElementById("adminReply");
  let messageText = adminInput.value.trim();

  if (messageText !== "") {
    sendMessage("shop", messageText);
    adminInput.value = ""; // เคลียร์ช่องข้อความ
  }
}