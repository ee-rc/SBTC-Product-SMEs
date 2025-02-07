document.addEventListener("DOMContentLoaded", function() {
  console.log("cart.js Loaded!"); // เช็คว่าไฟล์โหลดจริงหรือไม่
  updateCartCount();
});

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function addToCart(name, image, price) {
  let cart = getCart();
  cart.push({ name, image, price });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`✅ เพิ่ม "${name}" ลงตะกร้าแล้ว!`);
  console.log("Cart Updated:", cart); // เช็คค่าตะกร้า
}

function updateCartCount() {
  let cart = getCart();
  let cartCountElement = document.getElementById("cartCount");

  if (cartCountElement) {
    cartCountElement.textContent = cart.length;
  } else {
    console.error("❌ ไม่พบ ID 'cartCount' บนหน้าเว็บ!");
  }
}