// ============================================================
// StudentHub - Frontend JavaScript
// Handles: form validation, fetch() calls to the backend,
// localStorage for the logged-in session, and dashboard rendering.
// This one file is shared by register.html, login.html and
// dashboard.html — each section below only runs if the relevant
// element exists on the current page.
// ============================================================

// ------------------------------------------------------------
// Small shared helpers
// ------------------------------------------------------------

/** Shows a message box (success or error) at the top of a form. */
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = "message-box show " + type;
}

/** Clears any message currently shown. */
function hideMessage(element) {
  element.className = "message-box";
  element.textContent = "";
}

/** Displays an inline error under a specific field, and highlights it. */
function setFieldError(fieldName, message) {
  const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
  const inputEl = document.getElementById(fieldName);
  if (errorEl) errorEl.textContent = message || "";
  if (inputEl) {
    const wrapper = inputEl.closest(".field");
    if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
  }
}

/** Clears all inline field errors within a form. */
function clearFieldErrors(form) {
  form.querySelectorAll(".field-error-text").forEach((el) => (el.textContent = ""));
  form.querySelectorAll(".field.has-error").forEach((el) => el.classList.remove("has-error"));
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================
// REGISTRATION PAGE LOGIC
// ============================================================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  const formMessage = document.getElementById("formMessage");
  const registerBtn = document.getElementById("registerBtn");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideMessage(formMessage);
    clearFieldErrors(registerForm);

    // ---- Gather field values ----
    const data = {
      name: document.getElementById("name").value.trim(),
      age: document.getElementById("age").value.trim(),
      dob: document.getElementById("dob").value,
      gender: document.getElementById("gender").value,
      email: document.getElementById("email").value.trim(),
      mobile: document.getElementById("mobile").value.trim(),
      address: document.getElementById("address").value.trim(),
      course: document.getElementById("course").value.trim(),
      year: document.getElementById("year").value,
      username: document.getElementById("username").value.trim(),
      password: document.getElementById("password").value,
    };

    // ---- Frontend validation ----
    let isValid = true;

    const requiredFields = [
      "name", "age", "dob", "gender", "email",
      "mobile", "address", "course", "year", "username", "password",
    ];

    requiredFields.forEach((field) => {
      if (!data[field]) {
        setFieldError(field, "This field is required.");
        isValid = false;
      }
    });

    if (data.age && (Number(data.age) < 10 || Number(data.age) > 100)) {
      setFieldError("age", "Enter a realistic age.");
      isValid = false;
    }

    if (data.email && !EMAIL_REGEX.test(data.email)) {
      setFieldError("email", "Enter a valid email address.");
      isValid = false;
    }

    const mobileDigits = data.mobile.replace(/\D/g, "");
    if (data.mobile && (mobileDigits.length < 7 || mobileDigits.length > 15)) {
      setFieldError("mobile", "Enter a valid mobile number.");
      isValid = false;
    }

    if (data.password && data.password.length < 6) {
      setFieldError("password", "Password must be at least 6 characters.");
      isValid = false;
    }

    if (!isValid) {
      showMessage(formMessage, "Please fix the highlighted fields.", "error");
      return;
    }

    // ---- Send to backend ----
    registerBtn.disabled = true;
    registerBtn.textContent = "Creating account...";

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        showMessage(formMessage, "Registration successful! Redirecting to login...", "success");
        registerForm.reset();
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      } else {
        showMessage(formMessage, result.message || "Registration failed.", "error");
      }
    } catch (err) {
      console.error("Registration request failed:", err);
      showMessage(formMessage, "Could not reach the server. Please try again.", "error");
    } finally {
      registerBtn.disabled = false;
      registerBtn.textContent = "Create Account";
    }
  });
}

// ============================================================
// LOGIN PAGE LOGIC
// ============================================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const formMessage = document.getElementById("formMessage");
  const loginBtn = document.getElementById("loginBtn");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideMessage(formMessage);
    clearFieldErrors(loginForm);

    const identifier = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value;

    let isValid = true;
    if (!identifier) {
      setFieldError("identifier", "Enter your username or email.");
      isValid = false;
    }
    if (!password) {
      setFieldError("password", "Enter your password.");
      isValid = false;
    }

    if (!isValid) {
      showMessage(formMessage, "Please fill in both fields.", "error");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Store the logged-in user's info for the dashboard to read
        localStorage.setItem("loggedInUser", JSON.stringify(result.user));
        showMessage(formMessage, "Login successful! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "/dashboard.html";
        }, 600);
      } else {
        showMessage(formMessage, result.message || "Invalid username/email or password", "error");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      showMessage(formMessage, "Could not reach the server. Please try again.", "error");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  });
}

// ============================================================
// DASHBOARD PAGE LOGIC
// ============================================================
const dashboardContent = document.getElementById("dashboardContent");

if (dashboardContent) {
  const loadingState = document.getElementById("loadingState");
  const logoutBtn = document.getElementById("logoutBtn");

  function formatDob(dobString) {
    if (!dobString) return "—";
    const date = new Date(dobString);
    if (Number.isNaN(date.getTime())) return dobString;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  function loadDashboard() {
    const stored = localStorage.getItem("loggedInUser");

    // No logged-in user found -> send back to login
    if (!stored) {
      window.location.href = "/login";
      return;
    }

    let user;
    try {
      user = JSON.parse(stored);
    } catch (err) {
      console.error("Corrupted session data:", err);
      localStorage.removeItem("loggedInUser");
      window.location.href = "/login";
      return;
    }

    if (!user || !user.username) {
      window.location.href = "/login";
      return;
    }

    // Populate the dashboard with this user's own information only
    document.getElementById("welcomeHeading").textContent = `Welcome, ${user.name}!`;
    document.getElementById("avatarInitial").textContent = user.name.charAt(0).toUpperCase();
    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileCourseYear").textContent = `${user.course} • ${user.year}`;

    document.getElementById("fieldName").textContent = user.name || "—";
    document.getElementById("fieldEmail").textContent = user.email || "—";
    document.getElementById("fieldUsername").textContent = user.username || "—";
    document.getElementById("fieldMobile").textContent = user.mobile || "—";
    document.getElementById("fieldDob").textContent = formatDob(user.dob);
    document.getElementById("fieldGender").textContent = user.gender || "—";
    document.getElementById("fieldCourse").textContent = user.course || "—";
    document.getElementById("fieldYear").textContent = user.year || "—";
    document.getElementById("fieldAddress").textContent = user.address || "—";

    loadingState.style.display = "none";
    dashboardContent.style.display = "block";
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "/login";
  });

  loadDashboard();
}
