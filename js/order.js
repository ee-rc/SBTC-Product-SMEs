import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Firebase Configuration
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

// ตรวจสอบสถานะการล็อกอิน
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    if (document.getElementById("loginPrompt")) {
      document.getElementById("loginPrompt").style.display = "none"; // ซ่อนข้อความล็อกอิน
    }
  } else {
    currentUser = null;
    if (document.getElementById("loginPrompt")) {
      document.getElementById("loginPrompt").style.display = "block"; // แสดงข้อความให้ล็อกอิน
    }
  }
});

// ดึงข้อมูลตะกร้าสินค้า
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

// บันทึกตะกร้าสินค้าลง LocalStorage
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// คำนวณรวมราคา
function updateTotalPrice() {
  const cart = getCart();
  let totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  
  if (document.getElementById("totalPrice")) {
    document.getElementById("totalPrice").innerText = totalPrice;
  }
}

// ฟังก์ชันเพิ่มจำนวนสินค้า
window.increaseQuantity = function(index) {
  let cart = getCart();
  if (cart[index]) {
    cart[index].quantity += 1;
    saveCart(cart);
    loadProductList();
  }
};

// ฟังก์ชันลดจำนวนสินค้า (แก้ไขใหม่)
window.decreaseQuantity = function(index) {
  let cart = getCart();
  if (cart[index]) {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
      saveCart(cart);
      loadProductList();
    }
  }
};

// โหลดรายการสินค้าในตะกร้า
function loadProductList() {
  let cart = getCart();
  let productListHTML = '';
  
  cart.forEach((item, index) => {
    productListHTML += `
      <div>
        <img src="${item.image}" width="50" alt="${item.name}">
        <b>${item.name}</b> - ${item.price} บาท  
        <button onclick="decreaseQuantity(${index})">-</button>
        <span style="margin: 0 10px;">${item.quantity}</span>
        <button onclick="increaseQuantity(${index})">+</button>
      </div>
    `;
  });
  
  if (document.getElementById("productList")) {
    document.getElementById("productList").innerHTML = productListHTML;
  }
  
  updateTotalPrice(); // อัปเดตราคาทั้งหมด
}

// เมื่อโหลดหน้าฟอร์ม
document.addEventListener("DOMContentLoaded", () => {
  updateTotalPrice();
  loadProductList();
});

// เมื่อคลิกปุ่ม "สั่งซื้อ"
const placeOrderBtn = document.getElementById("placeOrder");

if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", async () => {
    if (!currentUser) {
      alert("กรุณาล็อกอินก่อนทำการสั่งซื้อ");
      return;
    }
    
    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const note = document.getElementById("note").value.trim();
    
    const cart = getCart();
    if (cart.length === 0) {
      alert("ตะกร้าว่าง!");
      return;
    }
    
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    
    if (!name || !address) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        address,
        createdAt: new Date(),
        email: currentUser.email,
        name,
        note,
        products: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        status: "รอยืนยัน",
        totalPrice,
        userId: currentUser.uid
      });
      
      alert("✅ สั่งซื้อสำเร็จ!");
      localStorage.removeItem("cart");
      window.location.href = "success.html";
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      alert("❌ กรุณาลองใหม่");
    }
  });
}

// ฟังก์ชันเข้าสู่ระบบ
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const email = prompt("กรุณากรอกอีเมล:");
    const password = prompt("กรุณากรอกรหัสผ่าน:");
    
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("เข้าสู่ระบบสำเร็จ");
      })
      .catch((error) => {
        console.error(error);
        alert("เข้าสู่ระบบไม่สำเร็จ");
      });
  });
}