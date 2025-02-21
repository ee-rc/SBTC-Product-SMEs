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

// ฟังก์ชันลดจำนวนสินค้า (แก้ไขให้เหลือขั้นต่ำ 1 ชิ้น)
window.decreaseQuantity = function(index) {
  let cart = getCart();
  if (cart[index]) {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    } else {
      cart[index].quantity = 1; // ป้องกันไม่ให้สินค้าหายไป
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
        <b>${item.name}</b> - ${item.price} บาท
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

// เมื่อโหลดหน้าฟอร์ม
document.addEventListener("DOMContentLoaded", () => {
  updateTotalPrice();
  loadProductList();
});

// เมื่อคลิกปุ่ม "สั่งซื้อ"
// เมื่อคลิกปุ่ม "ยืนยันคำสั่งซื้อ"
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
    const selectedPaymentMethod = document.getElementById("paymentMethod").value;

    if (!selectedPaymentMethod) {
      alert("กรุณาเลือกวิธีชำระเงิน");
      return;
    }

    const cart = getCart();
    if (cart.length === 0) {
      alert("ตะกร้าว่าง!");
      return;
    }

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    if (!name || !address || !phone) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน (รวมถึงเบอร์โทรศัพท์)");
      return;
    }

    const phonePattern = /^0\d{9}$/;
    if (!phonePattern.test(phone)) {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก และขึ้นต้นด้วย 0)");
      return;
    }

    try {
      await addDoc(collection(db, "orders"), {
        name,
        address,
        phone,
        email: currentUser.email,
        note,
        paymentMethod: selectedPaymentMethod, // 🏦 บันทึกช่องทางการชำระเงิน
        products: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalPrice,
        status: "รอยืนยัน",
        userId: currentUser.uid,
        createdAt: new Date()
      });

      // เคลียร์ตะกร้าหลังสั่งซื้อ
      localStorage.removeItem("cart");

      // นำทางไปยังหน้ารายการคำสั่งซื้อ
      window.location.href = "Order list.html";
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
