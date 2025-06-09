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
const productsPerPage = 3;

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
