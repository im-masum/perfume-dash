// Debounce function to limit rapid function calls
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Focus trap for modals
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  firstFocusable.focus();

  modal.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });
}

// Close modal and return focus to trigger element
function closeModal(modal, triggerElement) {
  modal.style.display = "none";
  if (triggerElement) triggerElement.focus();
}

// Initialize Cart, Wishlist, and Reviews from Local Storage
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let reviews = JSON.parse(localStorage.getItem("reviews")) || {};
let currentPage = 1;
const productsPerPage = 8;

// Save to Local Storage
function saveToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  localStorage.setItem("reviews", JSON.stringify(reviews));
}

// Show Toast Notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Mobile Menu Toggle
document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector(".nav").classList.toggle("active");
  document.querySelector(".menu-toggle").classList.toggle("active");
});

// Smooth Scroll for Navigation
document.querySelectorAll(".nav-list a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    document.querySelector(targetId).scrollIntoView({ behavior: "smooth" });
    document.querySelector(".nav").classList.remove("active");
  });
});

// Dark Mode Toggle
document.querySelector(".dark-mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  document.querySelector(".dark-mode-toggle").textContent = isDarkMode
    ? "☀️"
    : "🌙";
  localStorage.setItem("darkMode", isDarkMode);
});

// Cart Modal
const cartModal = document.getElementById("cart-modal");
const cartIcon = document.querySelector(".cart-icon");
const closeModalBtn = document.querySelector(".close");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout-button");

cartIcon.addEventListener("click", () => {
  cartModal.style.display = "flex";
  trapFocus(cartModal);
  updateCart();
});

closeModalBtn.addEventListener("click", () => {
  closeModal(cartModal, cartIcon);
});

window.addEventListener("click", (e) => {
  if (e.target === cartModal) {
    closeModal(cartModal, cartIcon);
  }
});

// Product Details Modal
const detailsModal = document.getElementById("details-modal");
const closeDetails = document.querySelector(".close-details");

closeDetails.addEventListener("click", () => {
  closeModal(detailsModal);
});

window.addEventListener("click", (e) => {
  if (e.target === detailsModal) {
    closeModal(detailsModal);
  }
});

// Quantity Selector with Keyboard Navigation
document.querySelectorAll(".quantity-increase").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.previousElementSibling;
    input.value = parseInt(input.value) + 1;
  });
});

document.querySelectorAll(".quantity-decrease").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.nextElementSibling;
    if (parseInt(input.value) > 1) {
      input.value = parseInt(input.value) - 1;
    }
  });
});

// Keyboard navigation for quantity inputs
document.querySelectorAll(".quantity-input").forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      input.value = parseInt(input.value) + 1;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
      }
    }
  });
});

// Update Add to Cart Buttons
function updateAddToCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    const name = button.getAttribute("data-name");
    const inCart = cart.some((item) => item.name === name);
    if (inCart) {
      button.textContent = "Added!";
      button.style.backgroundColor = "#28a745";
    } else {
      button.textContent = "Add to Cart";
      button.style.backgroundColor = "#6b4e31";
    }
  });
}

// Add to Cart
document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.getAttribute("data-name");
    const price = parseFloat(button.getAttribute("data-price"));
    const quantity = parseInt(
      button.parentElement.querySelector(".quantity-input").value
    );
    cart.push({ name, price, quantity });
    updateCartCount();
    saveToLocalStorage();
    showToast(`${name} added to cart!`);
    updateAddToCartButtons();
  });
});

// Add to Cart from Details Modal
document.getElementById("details-add-to-cart").addEventListener("click", () => {
  const name = document.getElementById("details-name").textContent;
  const price = parseFloat(
    document.getElementById("details-price").textContent.replace("$", "")
  );
  const quantity = parseInt(
    document.querySelector("#details-modal .quantity-input").value
  );
  cart.push({ name, price, quantity });
  updateCartCount();
  saveToLocalStorage();
  showToast(`${name} added to cart!`);
  document.getElementById("details-add-to-cart").textContent = "Added!";
  document.getElementById("details-add-to-cart").style.backgroundColor =
    "#28a745";
  setTimeout(() => {
    document.getElementById("details-add-to-cart").textContent = "Add to Cart";
    document.getElementById("details-add-to-cart").style.backgroundColor =
      "#6b4e31";
  }, 1000);
  updateAddToCartButtons();
});

// Update Cart Display
function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item");
    itemDiv.innerHTML = `
            <span>${item.name} - $${item.price.toFixed(2)} x ${
      item.quantity
    } = $${itemTotal.toFixed(2)}</span>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
    cartItems.appendChild(itemDiv);
  });
  cartTotal.textContent = total.toFixed(2);
}

// Remove from Cart
function removeFromCart(index) {
  const itemName = cart[index].name;
  cart.splice(index, 1);
  updateCart();
  updateCartCount();
  saveToLocalStorage();
  showToast(`${itemName} removed from cart!`);
  updateAddToCartButtons();
}

// Update Cart Count
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector(".cart-count").textContent = totalItems;
}

// Wishlist Functionality
document.querySelectorAll(".wishlist-button").forEach((button) => {
  const name = button.getAttribute("data-name");
  if (wishlist.includes(name)) {
    button.classList.add("active");
    button.textContent = "♥";
  }
  button.addEventListener("click", () => {
    if (wishlist.includes(name)) {
      wishlist = wishlist.filter((item) => item !== name);
      button.classList.remove("active");
      button.textContent = "♡";
      showToast(`${name} removed from wishlist!`);
    } else {
      wishlist.push(name);
      button.classList.add("active");
      button.textContent = "♥";
      showToast(`${name} added to wishlist!`);
    }
    saveToLocalStorage();
  });
});

// Product Details Modal
document.querySelectorAll(".view-details").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.getAttribute("data-name");
    const description = button.getAttribute("data-description");
    const price = button.getAttribute("data-price");
    const image = button.parentElement.querySelector("img").src;
    document.getElementById("details-name").textContent = name;
    document.getElementById("details-description").textContent = description;
    document.getElementById("details-price").textContent = `$${price}`;
    document.getElementById("details-image").src = image;
    document
      .getElementById("details-add-to-cart")
      .setAttribute("data-name", name);
    document
      .getElementById("details-add-to-cart")
      .setAttribute("data-price", price);
    updateReviews(name);
    detailsModal.style.display = "flex";
    trapFocus(detailsModal);
  });
});

// Reviews Functionality with Validation
document.getElementById("review-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const productName = document.getElementById("details-name").textContent;
  const rating = document.getElementById("review-rating").value;
  const text = document.getElementById("review-text").value.trim();
  if (!text) {
    showToast("Please enter a review text.");
    return;
  }
  if (!reviews[productName]) reviews[productName] = [];
  reviews[productName].push({ rating, text });
  saveToLocalStorage();
  updateReviews(productName);
  document.getElementById("review-form").reset();
  showToast("Review submitted!");
});

function updateReviews(productName) {
  const reviewsList = document.getElementById("reviews-list");
  reviewsList.innerHTML = "";
  if (reviews[productName]) {
    reviews[productName].forEach((review) => {
      const reviewItem = document.createElement("div");
      reviewItem.classList.add("review-item");
      reviewItem.innerHTML = `
                <p>Rating: ${"★".repeat(review.rating)}${"☆".repeat(
        5 - review.rating
      )}</p>
                <p>${review.text}</p>
            `;
      reviewsList.appendChild(reviewItem);
    });
  }
}

// Debounced Search Bar
document
  .getElementById("search-bar")
  .addEventListener("input", debounce(filterProducts, 300));

// Pagination
document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updateProductDisplay();
  }
});

document.getElementById("next-page").addEventListener("click", () => {
  const products = document.querySelectorAll(".product-card");
  const maxPage = Math.ceil(products.length / productsPerPage);
  if (currentPage < maxPage) {
    currentPage++;
    updateProductDisplay();
  }
});

// Product Filtering and Pagination
function filterProducts() {
  const search = document.getElementById("search-bar").value.toLowerCase();
  const category = document.getElementById("category-filter").value;
  const sort = document.getElementById("price-sort").value;
  const products = document.querySelectorAll(".product-card");
  let productArray = Array.from(products);

  // Filter by search and category
  productArray = productArray.filter((product) => {
    const name = product.getAttribute("data-name").toLowerCase();
    const matchesSearch = name.includes(search);
    const matchesCategory =
      category === "all" || product.getAttribute("data-category") === category;
    return matchesSearch && matchesCategory;
  });

  // Sort by price
  if (sort !== "default") {
    productArray.sort((a, b) => {
      const priceA = parseFloat(a.getAttribute("data-price"));
      const priceB = parseFloat(b.getAttribute("data-price"));
      return sort === "low-high" ? priceA - priceB : priceB - priceA;
    });
  }

  // Update display with pagination
  currentPage = 1; // Reset to first page on filter
  updateProductDisplay(productArray);
}

// Update Product Display with Pagination
function updateProductDisplay(filteredProducts = null) {
  const products =
    filteredProducts || Array.from(document.querySelectorAll(".product-card"));
  const productGrid = document.querySelector(".product-grid");
  productGrid.innerHTML = "";
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = products.slice(start, end);

  paginatedProducts.forEach((product) => productGrid.appendChild(product));
  products.forEach((product) => {
    if (!paginatedProducts.includes(product)) {
      product.style.display = "none";
    } else {
      product.style.display = "block";
    }
  });

  const maxPage = Math.ceil(products.length / productsPerPage);
  document.getElementById(
    "page-info"
  ).textContent = `Page ${currentPage} of ${maxPage}`;
  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled = currentPage === maxPage;
}

// Lazy Loading Images
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll("img");
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute("src");
        img.classList.add("loaded");
        observer.unobserve(img);
      }
    });
  });
  images.forEach((img) => observer.observe(img));

  // Initialize cart, wishlist, and dark mode
  updateCartCount();
  updateCart();
  updateProductDisplay();
  updateAddToCartButtons();
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.querySelector(".dark-mode-toggle").textContent = "☀️";
  }

  // Initialize About section animations
  initializeAboutSection();
});

// About Section Animations and Interactions
function initializeAboutSection() {
  const aboutSection = document.getElementById("about");

  // Smooth scroll to About section
  const aboutLink = document.querySelector('a[href="#about"]');
  if (aboutLink) {
    aboutLink.addEventListener("click", (e) => {
      e.preventDefault();
      aboutSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Intersection Observer for feature cards animation
  const featureItems = document.querySelectorAll(".feature-item");
  const observerOptions = {
    threshold: 0.2,
    rootMargin: "0px",
  };

  const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Initialize feature items with initial styles
  featureItems.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
    item.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    featureObserver.observe(item);
  });

  // Add hover effect for feature icons
  featureItems.forEach((item) => {
    const icon = item.querySelector(".feature-icon");
    if (icon) {
      item.addEventListener("mouseenter", () => {
        icon.style.transform = "scale(1.2) rotate(5deg)";
        icon.style.transition = "transform 0.3s ease";
      });

      item.addEventListener("mouseleave", () => {
        icon.style.transform = "scale(1) rotate(0deg)";
      });
    }
  });
}

// Checkout Button
checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Your cart is empty!");
  } else {
    showToast("Proceeding to checkout with total: $" + cartTotal.textContent);
    cart = [];
    updateCart();
    updateCartCount();
    saveToLocalStorage();
    cartModal.style.display = "none";
    updateAddToCartButtons();
  }
});

// Newsletter Form Handling
const newsletterForm = document.querySelector(".newsletter-form");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;

    // Basic email validation
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address");
      return;
    }

    // Simulate newsletter subscription
    showToast("Thank you for subscribing to our newsletter!");
    newsletterForm.reset();
  });
}

// Social Media Links Animation
document.querySelectorAll(".social-link").forEach((link) => {
  link.addEventListener("mouseenter", (e) => {
    e.target.style.transform = "translateY(-3px) scale(1.1)";
  });

  link.addEventListener("mouseleave", (e) => {
    e.target.style.transform = "translateY(0) scale(1)";
  });
});

// Smooth Scroll for Footer Links
document.querySelectorAll(".footer-section a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href.startsWith("#")) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Initialize Dark Mode from Local Storage
const savedDarkMode = localStorage.getItem("darkMode");
if (savedDarkMode === "true") {
  document.body.classList.add("dark-mode");
  document.querySelector(".dark-mode-toggle").textContent = "☀️";
}

// Enhanced Product Filtering
function filterProducts() {
  const searchTerm = document.getElementById("search").value.toLowerCase();
  const categoryFilter = document.getElementById("category-filter").value;
  const priceFilter = document.getElementById("price-filter").value;
  const sortOrder = document.getElementById("sort-order").value;

  let filteredProducts = [...products];

  // Apply search filter
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
  }

  // Apply category filter
  if (categoryFilter !== "all") {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === categoryFilter
    );
  }

  // Apply price filter
  if (priceFilter !== "all") {
    const [min, max] = priceFilter.split("-").map(Number);
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= min && product.price <= max
    );
  }

  // Apply sorting
  filteredProducts.sort((a, b) => {
    if (sortOrder === "price-asc") {
      return a.price - b.price;
    } else if (sortOrder === "price-desc") {
      return b.price - a.price;
    } else if (sortOrder === "name-asc") {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === "name-desc") {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  updateProductDisplay(filteredProducts);
}

// Debounced search input
const searchInput = document.getElementById("search");
if (searchInput) {
  searchInput.addEventListener(
    "input",
    debounce(() => {
      filterProducts();
    }, 300)
  );
}

// Initialize filters
document
  .querySelectorAll("#category-filter, #price-filter, #sort-order")
  .forEach((filter) => {
    filter.addEventListener("change", filterProducts);
  });

// Enhanced Cart Functionality
function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    cartTotal.textContent = "0.00";
    checkoutButton.disabled = true;
    return;
  }

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item");
    itemDiv.innerHTML = `
            <div class="cart-item-details">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, 1)">+</button>
                </div>
                <span class="cart-item-total">$${itemTotal.toFixed(2)}</span>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        `;
    cartItems.appendChild(itemDiv);
  });

  cartTotal.textContent = total.toFixed(2);
  checkoutButton.disabled = false;
}

// Update cart item quantity
function updateCartItemQuantity(index, change) {
  const newQuantity = cart[index].quantity + change;
  if (newQuantity > 0) {
    cart[index].quantity = newQuantity;
    updateCart();
    updateCartCount();
    saveToLocalStorage();
  } else if (newQuantity === 0) {
    removeFromCart(index);
  }
}

// Enhanced Checkout Process
checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }

  // Simulate checkout process
  showToast("Processing your order...");
  setTimeout(() => {
    cart = [];
    updateCart();
    updateCartCount();
    saveToLocalStorage();
    closeModal(cartModal, cartIcon);
    showToast("Order placed successfully! Thank you for shopping with us.");
  }, 2000);
});

// Contact Form Handling
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      subject: document.getElementById("subject").value,
      message: document.getElementById("message").value,
    };

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      showToast("Please fill in all fields");
      return;
    }

    if (!formData.email.includes("@")) {
      showToast("Please enter a valid email address");
      return;
    }

    // Disable submit button and show loading state
    const submitBtn = contactForm.querySelector(".submit-btn");
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success message
      showToast("Message sent successfully! We will get back to you soon.");

      // Reset form
      contactForm.reset();
    } catch (error) {
      showToast("Failed to send message. Please try again later.");
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}

// Form input validation
const formInputs = document.querySelectorAll(
  ".contact-form input, .contact-form textarea"
);
formInputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.value.trim() === "") {
      input.classList.add("invalid");
    } else {
      input.classList.remove("invalid");
    }
  });

  input.addEventListener("blur", () => {
    if (input.value.trim() === "") {
      input.classList.add("invalid");
    } else {
      input.classList.remove("invalid");
    }
  });
});

// Payment Section Functionality
document.addEventListener("DOMContentLoaded", () => {
  // Animate payment cards on scroll
  const paymentCards = document.querySelectorAll(".payment-card");
  const featuresList = document.querySelector(".features-list");

  const animateOnScroll = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(animateOnScroll, {
    threshold: 0.2,
    rootMargin: "0px",
  });

  paymentCards.forEach((card) => {
    observer.observe(card);
  });

  if (featuresList) {
    observer.observe(featuresList);
  }

  // Payment method selection
  const paymentMethodCards = document.querySelectorAll(".payment-card");
  paymentMethodCards.forEach((card) => {
    card.addEventListener("click", () => {
      // Remove active class from all cards
      paymentMethodCards.forEach((c) => c.classList.remove("active"));
      // Add active class to clicked card
      card.classList.add("active");

      // Show toast notification
      const methodName = card.querySelector("h3").textContent;
      showToast(`Selected payment method: ${methodName}`);
    });
  });

  // Payment icons hover effect
  const paymentIcons = document.querySelectorAll(".card-icons i");
  paymentIcons.forEach((icon) => {
    icon.addEventListener("mouseenter", () => {
      icon.style.transform = "scale(1.2)";
    });

    icon.addEventListener("mouseleave", () => {
      icon.style.transform = "scale(1)";
    });
  });

  // Features list animation
  const features = document.querySelectorAll(".features-list li");
  features.forEach((feature, index) => {
    feature.style.opacity = "0";
    feature.style.transform = "translateX(-20px)";
    feature.style.transition = "opacity 0.3s ease, transform 0.3s ease";

    setTimeout(() => {
      feature.style.opacity = "1";
      feature.style.transform = "translateX(0)";
    }, index * 100);
  });
});

// Enhanced checkout process with payment method selection
checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }

  const selectedPaymentMethod = document.querySelector(".payment-card.active");
  if (!selectedPaymentMethod) {
    showToast("Please select a payment method");
    return;
  }

  const paymentMethod = selectedPaymentMethod.querySelector("h3").textContent;

  // Show processing message
  showToast(`Processing payment with ${paymentMethod}...`);

  // Simulate payment processing
  setTimeout(() => {
    // Clear cart
    cart = [];
    updateCart();
    updateCartCount();
    saveToLocalStorage();

    // Close modal
    closeModal(cartModal, cartIcon);

    // Show success message
    showToast("Payment successful! Thank you for your purchase.");

    // Reset payment method selection
    document.querySelectorAll(".payment-card").forEach((card) => {
      card.classList.remove("active");
    });
  }, 2000);
});

// Add CSS classes for animations
const style = document.createElement("style");
style.textContent = `
    .payment-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }

    .payment-card.animate {
        opacity: 1;
        transform: translateY(0);
    }

    .payment-card.active {
        border: 2px solid #6b4e31;
        transform: translateY(-5px);
    }

    .dark-mode .payment-card.active {
        border-color: #ffe0b2;
    }

    .features-list li {
        opacity: 0;
        transform: translateX(-20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .features-list li.animate {
        opacity: 1;
        transform: translateX(0);
    }

    .card-icons i {
        transition: transform 0.3s ease, color 0.3s ease;
    }
`;
document.head.appendChild(style);

// Enhanced Product Management
function initializeProductFeatures() {
  // Quick View Enhancement
  document.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const product = btn.closest(".product-card");
      showQuickView(product);
    });
  });

  // Wishlist Enhancement
  document.querySelectorAll(".wishlist-btn").forEach((btn) => {
    const product = btn.closest(".product-card");
    const productId = product.dataset.name;

    // Update wishlist button state
    if (wishlist.includes(productId)) {
      btn.classList.add("active");
      btn.innerHTML = '<i class="fas fa-heart"></i>';
    }

    btn.addEventListener("click", () => {
      toggleWishlist(product, btn);
    });
  });

  // Rating System
  document.querySelectorAll(".rating").forEach((rating) => {
    const stars = rating.querySelectorAll("i");
    stars.forEach((star, index) => {
      star.addEventListener("click", () => {
        updateRating(rating, index + 1);
      });
    });
  });
}

// Enhanced Quick View
function showQuickView(product) {
  const modal = document.getElementById("details-modal");
  const name = product.querySelector("h3").textContent;
  const price = product.querySelector(".price-tag").textContent;
  const description = product.querySelector("p").textContent;
  const image = product.querySelector("img").src;
  const rating = product.querySelector(".rating").innerHTML;
  const category = product.querySelector(".category-badge").textContent;
  const size = product.querySelector(".product-size").textContent;

  modal.querySelector("#details-name").textContent = name;
  modal.querySelector("#details-price").textContent = price;
  modal.querySelector("#details-description").textContent = description;
  modal.querySelector("#details-image").src = image;
  modal.querySelector(".rating").innerHTML = rating;
  modal.querySelector(".category-badge").textContent = category;
  modal.querySelector(".product-size").textContent = size;

  // Load reviews
  loadProductReviews(name);

  // Show modal with animation
  modal.style.display = "flex";
  modal.style.opacity = "0";
  setTimeout(() => {
    modal.style.opacity = "1";
  }, 10);
  document.body.style.overflow = "hidden";
  trapFocus(modal);
}

// Enhanced Wishlist
function toggleWishlist(product, button) {
  const productId = product.dataset.name;
  const isInWishlist = wishlist.includes(productId);

  if (isInWishlist) {
    wishlist = wishlist.filter((id) => id !== productId);
    button.classList.remove("active");
    button.innerHTML = '<i class="far fa-heart"></i>';
    showToast("Removed from wishlist");
  } else {
    wishlist.push(productId);
    button.classList.add("active");
    button.innerHTML = '<i class="fas fa-heart"></i>';
    showToast("Added to wishlist");
  }

  saveToLocalStorage();
}

// Rating System
function updateRating(ratingElement, rating) {
  const stars = ratingElement.querySelectorAll("i");
  stars.forEach((star, index) => {
    if (index < rating) {
      star.className = "fas fa-star";
    } else {
      star.className = "far fa-star";
    }
  });

  // Save rating to reviews
  const productName = ratingElement
    .closest(".product-card")
    .querySelector("h3").textContent;
  if (!reviews[productName]) {
    reviews[productName] = [];
  }
  reviews[productName].push({
    rating,
    date: new Date().toISOString(),
  });
  saveToLocalStorage();
}

// Enhanced Search and Filter
function initializeSearchAndFilter() {
  const searchBar = document.getElementById("search-bar");
  const categoryFilter = document.getElementById("category-filter");
  const priceSort = document.getElementById("price-sort");

  // Debounced search
  searchBar.addEventListener(
    "input",
    debounce(() => {
      const searchTerm = searchBar.value.toLowerCase();
      filterProducts(searchTerm, categoryFilter.value, priceSort.value);
    }, 300)
  );

  // Category filter
  categoryFilter.addEventListener("change", () => {
    filterProducts(
      searchBar.value.toLowerCase(),
      categoryFilter.value,
      priceSort.value
    );
  });

  // Price sort
  priceSort.addEventListener("change", () => {
    filterProducts(
      searchBar.value.toLowerCase(),
      categoryFilter.value,
      priceSort.value
    );
  });
}

// Enhanced Product Filtering
function filterProducts(searchTerm, category, sortBy) {
  const products = Array.from(document.querySelectorAll(".product-card"));

  // Filter
  const filteredProducts = products.filter((product) => {
    const name = product.querySelector("h3").textContent.toLowerCase();
    const description = product.querySelector("p").textContent.toLowerCase();
    const productCategory = product.dataset.category;

    const matchesSearch =
      name.includes(searchTerm) || description.includes(searchTerm);
    const matchesCategory = category === "all" || productCategory === category;

    return matchesSearch && matchesCategory;
  });

  // Sort
  filteredProducts.sort((a, b) => {
    const priceA = parseFloat(a.dataset.price);
    const priceB = parseFloat(b.dataset.price);

    switch (sortBy) {
      case "low-high":
        return priceA - priceB;
      case "high-low":
        return priceB - priceA;
      case "popular":
        return getProductPopularity(b) - getProductPopularity(a);
      case "newest":
        return getProductDate(b) - getProductDate(a);
      default:
        return 0;
    }
  });

  // Update display
  updateProductDisplay(filteredProducts);
}

// Helper function for product popularity
function getProductPopularity(product) {
  const name = product.querySelector("h3").textContent;
  return reviews[name] ? reviews[name].length : 0;
}

// Helper function for product date
function getProductDate(product) {
  return new Date(product.dataset.date || Date.now()).getTime();
}

// Enhanced Product Display
function updateProductDisplay(filteredProducts) {
  const productGrid = document.querySelector(".product-grid");
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;

  // Clear grid
  productGrid.innerHTML = "";

  // Add filtered products
  filteredProducts.slice(start, end).forEach((product) => {
    productGrid.appendChild(product);
  });

  // Update pagination
  updatePagination(filteredProducts.length);
}

// Enhanced Pagination
function updatePagination(totalProducts) {
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const pageNumbers = document.querySelector(".page-numbers");

  pageNumbers.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.className = `page-number ${i === currentPage ? "active" : ""}`;
    button.textContent = i;
    button.addEventListener("click", () => goToPage(i));
    pageNumbers.appendChild(button);
  }

  // Update prev/next buttons
  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled = currentPage === totalPages;
}

// Initialize all features
document.addEventListener("DOMContentLoaded", () => {
  initializeProductFeatures();
  initializeSearchAndFilter();
  updateCartCount();
  checkDarkMode();
});

// Product Section Click Handlers
function initializeProductClickHandlers() {
  // Quick View Button
  document.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const product = btn.closest(".product-card");
      showQuickView(product);
    });
  });

  // Wishlist Button
  document.querySelectorAll(".wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const product = btn.closest(".product-card");
      toggleWishlist(product, btn);
    });
  });

  // Compare Button
  document.querySelectorAll(".compare-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const product = btn.closest(".product-card");
      toggleCompare(product, btn);
    });
  });

  // Add to Cart Button
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const product = btn.closest(".product-card");
      addToCart(product);
    });
  });

  // Quantity Buttons
  document.querySelectorAll(".quantity-decrease").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const input = btn.nextElementSibling;
      if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
        updateProductTotal(btn.closest(".product-card"));
      }
    });
  });

  document.querySelectorAll(".quantity-increase").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const input = btn.previousElementSibling;
      input.value = parseInt(input.value) + 1;
      updateProductTotal(btn.closest(".product-card"));
    });
  });

  // Product Card Click (for quick view)
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't trigger if clicking on buttons or their children
      if (!e.target.closest("button") && !e.target.closest("input")) {
        showQuickView(card);
      }
    });
  });

  // Category Badge Click
  document.querySelectorAll(".category-badge").forEach((badge) => {
    badge.addEventListener("click", (e) => {
      e.preventDefault();
      const category = badge.textContent.toLowerCase();
      document.getElementById("category-filter").value = category;
      filterProducts(
        document.getElementById("search-bar").value.toLowerCase(),
        category,
        document.getElementById("price-sort").value
      );
    });
  });

  // Rating Stars Click
  document.querySelectorAll(".rating i").forEach((star, index) => {
    star.addEventListener("click", (e) => {
      e.preventDefault();
      const rating = index + 1;
      const productCard = star.closest(".product-card");
      updateRating(productCard, rating);
    });
  });
}

// Enhanced Quick View
function showQuickView(product) {
  const modal = document.getElementById("details-modal");
  const name = product.querySelector("h3").textContent;
  const price = product.querySelector(".price-tag").textContent;
  const description = product.querySelector("p").textContent;
  const image = product.querySelector("img").src;
  const rating = product.querySelector(".rating").innerHTML;
  const category = product.querySelector(".category-badge").textContent;
  const size = product.querySelector(".product-size").textContent;

  modal.querySelector("#details-name").textContent = name;
  modal.querySelector("#details-price").textContent = price;
  modal.querySelector("#details-description").textContent = description;
  modal.querySelector("#details-image").src = image;
  modal.querySelector(".rating").innerHTML = rating;
  modal.querySelector(".category-badge").textContent = category;
  modal.querySelector(".product-size").textContent = size;

  // Load reviews
  loadProductReviews(name);

  // Show modal with animation
  modal.style.display = "flex";
  modal.style.opacity = "0";
  setTimeout(() => {
    modal.style.opacity = "1";
  }, 10);
  document.body.style.overflow = "hidden";
  trapFocus(modal);
}

// Enhanced Add to Cart
function addToCart(product) {
  const name = product.querySelector("h3").textContent;
  const price = parseFloat(
    product.querySelector(".price-tag").textContent.replace("$", "")
  );
  const quantity = parseInt(product.querySelector(".quantity-input").value);
  const image = product.querySelector("img").src;

  const cartItem = {
    name,
    price,
    quantity,
    image,
    total: price * quantity,
  };

  // Add to cart array
  cart.push(cartItem);
  updateCartCount();
  saveToLocalStorage();

  // Show success animation
  const addButton = product.querySelector(".add-to-cart");
  addButton.innerHTML = '<i class="fas fa-check"></i> Added!';
  addButton.classList.add("success");

  setTimeout(() => {
    addButton.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
    addButton.classList.remove("success");
  }, 2000);

  showToast("Added to cart successfully!");
}

// Enhanced Compare Functionality
function toggleCompare(product, button) {
  const productId = product.dataset.name;
  const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
  const isInCompare = compareList.includes(productId);

  if (isInCompare) {
    compareList.splice(compareList.indexOf(productId), 1);
    button.classList.remove("active");
    showToast("Removed from compare list");
  } else {
    if (compareList.length >= 3) {
      showToast("You can compare up to 3 products at a time", "error");
      return;
    }
    compareList.push(productId);
    button.classList.add("active");
    showToast("Added to compare list");
  }

  localStorage.setItem("compareList", JSON.stringify(compareList));
  updateCompareCount();
}

// Update Product Total
function updateProductTotal(product) {
  const price = parseFloat(
    product.querySelector(".price-tag").textContent.replace("$", "")
  );
  const quantity = parseInt(product.querySelector(".quantity-input").value);
  const total = price * quantity;

  // Update the price display with animation
  const priceTag = product.querySelector(".price-tag");
  priceTag.style.transform = "scale(1.1)";
  setTimeout(() => {
    priceTag.style.transform = "scale(1)";
  }, 200);
}

// Update Compare Count
function updateCompareCount() {
  const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
  const compareCount = document.querySelector(".compare-count");
  if (compareCount) {
    compareCount.textContent = compareList.length;
    compareCount.style.display = compareList.length > 0 ? "block" : "none";
  }
}

// Initialize all click handlers
document.addEventListener("DOMContentLoaded", () => {
  initializeProductClickHandlers();
  updateCompareCount();
  // ... existing initialization code ...
});

// Initialize all button click handlers
function initializeButtonHandlers() {
  // Menu Toggle Button
  const menuToggle = document.querySelector(".menu-toggle");
  menuToggle.addEventListener("click", () => {
    document.querySelector(".nav").classList.toggle("active");
    menuToggle.classList.toggle("active");
  });

  // Dark Mode Toggle
  const darkModeToggle = document.querySelector(".dark-mode-toggle");
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    darkModeToggle.textContent = isDarkMode ? "☀️" : "🌙";
    localStorage.setItem("darkMode", isDarkMode);
  });

  // CTA Button
  const ctaButton = document.querySelector(".cta-button");
  ctaButton.addEventListener("click", () => {
    document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
  });

  // Pagination Buttons
  document.querySelector("#prev-page").addEventListener("click", () => {
    const currentPage = document.querySelector(".page-number.active");
    const prevPage = currentPage.previousElementSibling;
    if (prevPage && prevPage.classList.contains("page-number")) {
      currentPage.classList.remove("active");
      prevPage.classList.add("active");
      updateProductDisplay(prevPage.textContent);
    }
  });

  document.querySelector("#next-page").addEventListener("click", () => {
    const currentPage = document.querySelector(".page-number.active");
    const nextPage = currentPage.nextElementSibling;
    if (nextPage && nextPage.classList.contains("page-number")) {
      currentPage.classList.remove("active");
      nextPage.classList.add("active");
      updateProductDisplay(nextPage.textContent);
    }
  });

  // Page Number Buttons
  document.querySelectorAll(".page-number").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".page-number.active").classList.remove("active");
      button.classList.add("active");
      updateProductDisplay(button.textContent);
    });
  });

  // Close Modal Button
  document.querySelector(".close-details").addEventListener("click", () => {
    const modal = document.getElementById("details-modal");
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }, 300);
  });

  // Contact Form Submit
  document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Here you would typically send the form data to a server
    showToast("Message sent successfully!");
    e.target.reset();
  });

  // Newsletter Form Submit
  document.querySelector(".newsletter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    // Here you would typically send the email to a server
    showToast("Thank you for subscribing!");
    e.target.reset();
  });

  // Review Form Submit
  document.getElementById("review-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const rating = document.getElementById("review-rating").value;
    const review = document.getElementById("review-text").value;
    const productName = document.getElementById("details-name").textContent;

    // Save review to localStorage
    const reviews = JSON.parse(localStorage.getItem("productReviews") || "{}");
    if (!reviews[productName]) {
      reviews[productName] = [];
    }
    reviews[productName].push({
      rating: parseInt(rating),
      review: review,
      date: new Date().toISOString(),
    });
    localStorage.setItem("productReviews", JSON.stringify(reviews));

    showToast("Review submitted successfully!");
    e.target.reset();
    loadProductReviews(productName);
  });

  // Social Media Links
  document.querySelectorAll(".social-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const platform = link.querySelector("i").classList[1].split("-")[1];
      showToast(`Redirecting to our ${platform} page...`);
      // Here you would typically redirect to the social media page
    });
  });

  // Footer Links
  document.querySelectorAll(".footer-section a").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href").startsWith("#")) {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  // Quick View Button
  document.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const product = btn.closest(".product-card");
      showQuickView(product);
    });
  });

  // Wishlist Button
  document.querySelectorAll(".wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const product = btn.closest(".product-card");
      toggleWishlist(product, btn);
    });
  });

  // Compare Button
  document.querySelectorAll(".compare-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const product = btn.closest(".product-card");
      toggleCompare(product, btn);
    });
  });

  // Add to Cart Button
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const product = btn.closest(".product-card");
      addToCart(product);
    });
  });

  // Quantity Buttons
  document.querySelectorAll(".quantity-decrease").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const input = btn.nextElementSibling;
      if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
        updateProductTotal(btn.closest(".product-card"));
      }
    });
  });

  document.querySelectorAll(".quantity-increase").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const input = btn.previousElementSibling;
      input.value = parseInt(input.value) + 1;
      updateProductTotal(btn.closest(".product-card"));
    });
  });

  // Category Badge
  document.querySelectorAll(".category-badge").forEach((badge) => {
    badge.addEventListener("click", (e) => {
      e.preventDefault();
      const category = badge.textContent.toLowerCase();
      document.getElementById("category-filter").value = category;
      filterProducts(
        document.getElementById("search-bar").value.toLowerCase(),
        category,
        document.getElementById("price-sort").value
      );
    });
  });

  // Rating Stars
  document.querySelectorAll(".rating i").forEach((star, index) => {
    star.addEventListener("click", (e) => {
      e.preventDefault();
      const rating = index + 1;
      const productCard = star.closest(".product-card");
      updateRating(productCard, rating);
    });
  });
}

// Initialize all handlers when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeButtonHandlers();
  initializeProductClickHandlers();
  updateCompareCount();
  loadCart();
  loadWishlist();
  checkDarkMode();
});

// Header Functionality
function initializeHeader() {
  const header = document.querySelector(".header");
  const searchToggle = document.querySelector(".search-toggle");
  const searchOverlay = document.querySelector(".search-overlay");
  const searchClose = document.querySelector(".search-close");
  const searchInput = document.querySelector(".search-container input");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const userBtn = document.querySelector(".user-btn");
  const wishlistBtn = document.querySelector(".wishlist-btn");
  const cartBtn = document.querySelector(".cart-btn");

  // Scroll Header Effect
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScroll = currentScroll;
  });

  // Search Toggle
  searchToggle.addEventListener("click", () => {
    searchOverlay.classList.add("active");
    searchInput.focus();
    document.body.style.overflow = "hidden";
  });

  searchClose.addEventListener("click", () => {
    searchOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
  });

  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      const searchTerm = searchInput.value.trim();
      if (searchTerm) {
        filterProducts(searchTerm.toLowerCase(), "all", "default");
        searchOverlay.classList.remove("active");
        document.body.style.overflow = "auto";
      }
    }
  });

  // Mobile Menu Toggle
  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    nav.classList.toggle("active");
    document.body.style.overflow = nav.classList.contains("active")
      ? "hidden"
      : "auto";
  });

  // Active Navigation Link
  function setActiveLink() {
    const sections = document.querySelectorAll("section[id]");
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", setActiveLink);
  window.addEventListener("load", setActiveLink);

  // Smooth Scroll for Navigation Links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        // Close mobile menu if open
        if (nav.classList.contains("active")) {
          menuToggle.classList.remove("active");
          nav.classList.remove("active");
          document.body.style.overflow = "auto";
        }

        // Smooth scroll to section
        targetSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // User Actions
  userBtn.addEventListener("click", () => {
    // Here you would typically show a user menu or redirect to login
    showToast("User menu coming soon!");
  });

  wishlistBtn.addEventListener("click", () => {
    // Here you would typically show the wishlist
    showToast("Wishlist coming soon!");
  });

  cartBtn.addEventListener("click", () => {
    // Here you would typically show the cart
    showToast("Cart coming soon!");
  });

  // Update Counts
  function updateHeaderCounts() {
    const cartCount = document.querySelector(".cart-count");
    const wishlistCount = document.querySelector(".wishlist-count");

    // Update cart count
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cartCount.textContent = cart.length;
    cartCount.classList.toggle("show", cart.length > 0);

    // Update wishlist count
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    wishlistCount.textContent = wishlist.length;
    wishlistCount.classList.toggle("show", wishlist.length > 0);
  }

  // Initialize counts
  updateHeaderCounts();

  // Update counts when cart or wishlist changes
  window.addEventListener("storage", (e) => {
    if (e.key === "cart" || e.key === "wishlist") {
      updateHeaderCounts();
    }
  });
}

// Initialize header when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeHeader();
  // ... existing initialization code ...
});

// Initialize Search Functionality
function initializeSearch() {
  const searchToggle = document.querySelector(".search-toggle");
  const searchOverlay = document.querySelector(".search-overlay");
  const searchClose = document.querySelector(".search-close");
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".search-btn");
  const clearRecentBtn = document.querySelector(".clear-recent");
  const recentList = document.querySelector(".recent-list");
  const searchResults = document.querySelector(".search-results");
  const searchLoading = document.querySelector(".search-loading");
  const suggestionTags = document.querySelectorAll(".tag");

  // Toggle search overlay
  searchToggle.addEventListener("click", () => {
    searchOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    setTimeout(() => searchInput.focus(), 100);
  });

  // Close search overlay
  searchClose.addEventListener("click", () => {
    searchOverlay.classList.remove("active");
    document.body.style.overflow = "";
    searchInput.value = "";
    searchResults.classList.remove("active");
  });

  // Close on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchOverlay.classList.contains("active")) {
      searchClose.click();
    }
  });

  // Handle search input
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    // Clear previous timeout
    clearTimeout(searchTimeout);

    if (query.length > 2) {
      searchLoading.classList.add("active");
      searchResults.classList.remove("active");

      // Simulate search delay
      searchTimeout = setTimeout(() => {
        performSearch(query);
        searchLoading.classList.remove("active");
        searchResults.classList.add("active");
      }, 500);
    } else {
      searchResults.classList.remove("active");
    }
  });

  // Handle search button click
  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      performSearch(query);
      addToRecentSearches(query);
    }
  });

  // Handle enter key
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query);
        addToRecentSearches(query);
      }
    }
  });

  // Handle suggestion tags
  suggestionTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      const query = tag.textContent.trim();
      searchInput.value = query;
      performSearch(query);
      addToRecentSearches(query);
    });
  });

  // Clear recent searches
  clearRecentBtn.addEventListener("click", () => {
    localStorage.removeItem("recentSearches");
    updateRecentSearches();
  });

  // Initialize recent searches
  updateRecentSearches();
}

// Perform search
function performSearch(query) {
  const searchResults = document.querySelector(".search-results");
  const resultItems = document.querySelector(".result-items");

  // Simulate search results (replace with actual API call)
  const results = [
    {
      category: "Products",
      items: [
        {
          image:
            "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500",
          title: "Floral Perfume",
          price: "$89.99",
        },
        {
          image:
            "https://images.unsplash.com/photo-1595425970375-1d1c8b13d3da?w=500",
          title: "Woody Fragrance",
          price: "$79.99",
        },
      ],
    },
    {
      category: "Categories",
      items: [
        {
          image:
            "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500",
          title: "Floral Collection",
          description: "12 products",
        },
        {
          image:
            "https://images.unsplash.com/photo-1595425970375-1d1c8b13d3da?w=500",
          title: "Woody Collection",
          description: "8 products",
        },
      ],
    },
  ];

  // Render results
  let html = "";
  results.forEach((category) => {
    html += `
            <div class="result-category">
                <h4>${category.category}</h4>
                <div class="result-items">
                    ${category.items
                      .map(
                        (item) => `
                        <div class="result-item">
                            <img src="${item.image}" alt="${item.title}">
                            <div class="result-item-content">
                                <h5>${item.title}</h5>
                                ${
                                  item.price
                                    ? `<p>${item.price}</p>`
                                    : `<p>${item.description}</p>`
                                }
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `;
  });

  resultItems.innerHTML = html;
  searchResults.classList.add("active");
}

// Add to recent searches
function addToRecentSearches(query) {
  let recentSearches = JSON.parse(
    localStorage.getItem("recentSearches") || "[]"
  );

  // Remove if already exists
  recentSearches = recentSearches.filter((item) => item !== query);

  // Add to beginning
  recentSearches.unshift(query);

  // Keep only last 5 searches
  recentSearches = recentSearches.slice(0, 5);

  localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  updateRecentSearches();
}

// Update recent searches list
function updateRecentSearches() {
  const recentList = document.querySelector(".recent-list");
  const recentSearches = JSON.parse(
    localStorage.getItem("recentSearches") || "[]"
  );

  if (recentSearches.length === 0) {
    recentList.innerHTML = '<li class="text-muted">No recent searches</li>';
    return;
  }

  recentList.innerHTML = recentSearches
    .map(
      (query) => `
        <li>
            <a href="#" class="recent-item">
                <i class="fas fa-history"></i>
                <span>${query}</span>
            </a>
            <button class="remove-search" onclick="removeRecentSearch('${query}')">
                <i class="fas fa-times"></i>
            </button>
        </li>
    `
    )
    .join("");
}

// Remove recent search
function removeRecentSearch(query) {
  let recentSearches = JSON.parse(
    localStorage.getItem("recentSearches") || "[]"
  );
  recentSearches = recentSearches.filter((item) => item !== query);
  localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  updateRecentSearches();
}

// Initialize Header Right Search
function initializeHeaderSearch() {
  const searchToggle = document.querySelector(".header-right .search-toggle");
  const searchBar = document.querySelector(".header-right .search-bar");
  const searchInput = searchBar.querySelector("input");
  const searchCategories = searchBar.querySelectorAll(".search-category");
  const quickResults = searchBar.querySelector(".quick-results");
  const searchLoading = searchBar.querySelector(".search-loading");
  const noResults = searchBar.querySelector(".no-results");

  let currentCategory = "all";
  let searchTimeout;

  // Toggle search bar
  searchToggle.addEventListener("click", () => {
    searchBar.classList.toggle("active");
    searchToggle.classList.toggle("active");
    if (searchBar.classList.contains("active")) {
      searchInput.focus();
    }
  });

  // Close search bar when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchBar.contains(e.target) && !searchToggle.contains(e.target)) {
      searchBar.classList.remove("active");
      searchToggle.classList.remove("active");
    }
  });

  // Handle search input
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    // Clear previous timeout
    clearTimeout(searchTimeout);

    if (query.length > 2) {
      searchLoading.classList.add("active");
      quickResults.style.display = "none";
      noResults.style.display = "none";

      // Simulate search delay
      searchTimeout = setTimeout(() => {
        performQuickSearch(query, currentCategory);
        searchLoading.classList.remove("active");
      }, 300);
    } else {
      quickResults.style.display = "none";
      noResults.style.display = "none";
    }
  });

  // Handle category selection
  searchCategories.forEach((category) => {
    category.addEventListener("click", () => {
      // Update active state
      searchCategories.forEach((cat) => cat.classList.remove("active"));
      category.classList.add("active");

      // Update current category
      currentCategory = category.textContent.toLowerCase();

      // Perform search with current query
      const query = searchInput.value.trim();
      if (query.length > 2) {
        performQuickSearch(query, currentCategory);
      }
    });
  });

  // Handle enter key
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        // Navigate to search results page
        window.location.href = `/search?q=${encodeURIComponent(
          query
        )}&category=${currentCategory}`;
      }
    }
  });
}

// Perform quick search
function performQuickSearch(query, category) {
  const quickResults = document.querySelector(".quick-results");
  const noResults = document.querySelector(".no-results");

  // Simulate search results (replace with actual API call)
  const results = [
    {
      image:
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500",
      title: "Floral Perfume",
      category: "Floral",
      price: "$89.99",
    },
    {
      image:
        "https://images.unsplash.com/photo-1595425970375-1d1c8b13d3da?w=500",
      title: "Woody Fragrance",
      category: "Woody",
      price: "$79.99",
    },
  ].filter((result) => {
    if (category === "all") return true;
    return result.category.toLowerCase() === category;
  });

  if (results.length > 0) {
    quickResults.innerHTML = results
      .map(
        (result) => `
            <a href="/product/${result.title
              .toLowerCase()
              .replace(/\s+/g, "-")}" class="quick-result-item">
                <img src="${result.image}" alt="${result.title}">
                <div class="quick-result-content">
                    <h6>${result.title}</h6>
                    <p>${result.category}</p>
                </div>
                <div class="quick-result-price">${result.price}</div>
            </a>
        `
      )
      .join("");
    quickResults.style.display = "block";
    noResults.style.display = "none";
  } else {
    quickResults.style.display = "none";
    noResults.style.display = "block";
  }
}
