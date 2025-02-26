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
      document.getElementById("loginPrompt").style.display = "none";
    }
  } else {
    currentUser = null;
    if (document.getElementById("loginPrompt")) {
      document.getElementById("loginPrompt").style.display = "block";
    }
  }
});

// ดึงข้อมูลตะกร้าสินค้า
function getCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.forEach(item => {
    if (!item.quantity || item.quantity < 1) {
      item.quantity = 1;
    }
  });
  return cart;
}

// บันทึกตะกร้าสินค้าลง LocalStorage
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// คำนวณรวมราคา + ค่าจัดส่ง
function updateTotalPrice() {
  const cart = getCart();
  let totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  
  // ตรวจสอบค่าจัดส่งจาก dropdown
  const shippingMethod = document.getElementById("shippingMethod")?.value;
  let shippingFee = 0;
  
  if (shippingMethod === "cod") {
    shippingFee = 50; // ค่าส่งปลายทาง
  } else if (shippingMethod === "pickup") {
    shippingFee = 0; // มารับเองไม่มีค่าส่ง
  }
  
  // รวมยอดทั้งหมด
  const finalTotal = totalPrice + shippingFee;
  document.getElementById("totalPrice").innerText = finalTotal.toLocaleString() + " บาท";
}

// ฟังก์ชันเพิ่มสินค้า
window.increaseQuantity = function(index) {
  let cart = getCart();
  if (cart[index]) {
    cart[index].quantity += 1;
    saveCart(cart);
    loadProductList();
  }
};

// ฟังก์ชันลดสินค้า
window.decreaseQuantity = function(index) {
  let cart = getCart();
  if (cart[index]) {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    }
    saveCart(cart);
    loadProductList();
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
        <b>${item.name}</b>  ${item.price} บาท
        <button onclick="increaseQuantity(${index})">+</button>
        <span id="quantity-${index}">${item.quantity}</span>
        <button onclick="decreaseQuantity(${index})">-</button>
      </div>
    `;
  });
  
  if (document.getElementById("productList")) {
    document.getElementById("productList").innerHTML = productListHTML;
  }
  
  updateTotalPrice();
}

// อัปเดตราคาเมื่อเลือกวิธีจัดส่ง
document.getElementById("shippingMethod")?.addEventListener("change", updateTotalPrice);

// เมื่อโหลดหน้า
document.addEventListener("DOMContentLoaded", () => {
  loadProductList();
});

// เมื่อกดปุ่ม "ยืนยันคำสั่งซื้อ"
const placeOrderBtn = document.getElementById("placeOrder");

if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", async () => {
    if (!currentUser) {
      alert("กรุณาล็อกอินก่อนทำการสั่งซื้อ");
      return;
    }
    
    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const note = document.getElementById("note").value.trim();
    const selectedPaymentMethod = document.getElementById("shippingMethod").value;
    
    if (!selectedPaymentMethod) {
      alert("กรุณาเลือกวิธีจัดส่ง");
      return;
    }
    
    const cart = getCart();
    if (cart.length === 0) {
      alert("ตะกร้าว่าง!");
      return;
    }
    
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    let shippingFee = selectedPaymentMethod === "cod" ? 50 : 0; // เพิ่มค่าจัดส่ง
    const finalTotal = totalPrice + shippingFee;
    
    if (!name || !address || !phone) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    
    const phonePattern = /^0\d{9}$/;
    if (!phonePattern.test(phone)) {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)");
      return;
    }
    
    try {
  await addDoc(collection(db, "orders"), {
    name,
    address,
    phone,
    email: currentUser.email,
    note,
    paymentMethod: selectedPaymentMethod === "cod" ? "เก็บเงินปลายทาง" : "มารับเอง",
    products: cart.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    totalPrice: finalTotal, // ใช้ราคารวมค่าจัดส่ง
    status: "รอยืนยัน",
    userId: currentUser.uid,
    createdAt: new Date()
  });

  localStorage.removeItem("cart");
  window.location.href = "Order list.html";
} catch (error) {
  console.error("เกิดข้อผิดพลาด:", error);
  alert("❌ กรุณาลองใหม่");
}
  });
}
