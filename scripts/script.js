// import { auth } from "./firebase-config.js";
// import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// // Toggle password visibility
// window.togglePassword = function () {
//   const passField = document.getElementById("password");
//   passField.type = passField.type === "password" ? "text" : "password";
// };

// // Handle login form submission
// const form = document.getElementById("login-form");
// form.addEventListener("submit", (e) => {
//   e.preventDefault();

//   const email = form.email.value;
//   const password = form.password.value;
//   const messageBox = document.getElementById("login-message");

//   signInWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {
//       window.location.href = "dashboard.html";
//     })
//     .catch((error) => {
//       const messageBox = document.getElementById("login-message");

//       let userMessage = "";
//       switch (error.code) {
//         case "auth/invalid-email":
//           userMessage = "⚠️ Please enter a valid email address.";
//           break;
//         case "auth/user-not-found":
//           userMessage = "❌ No account found with that email.";
//           break;
//         case "auth/wrong-password":
//           userMessage = "❌ Incorrect password. Try again.";
//           break;
//         case "auth/too-many-requests":
//           userMessage = "⚠️ Too many attempts. Please try again later.";
//           break;
//         case "auth/invalid-credential":
//           userMessage = "⚠️ Invalid credentials. Please check your email and password.";
//           break;
//         default:
//           userMessage = "❌ Login failed: " + error.message;
//           break;
//       }

//       messageBox.textContent = userMessage;
//       messageBox.style.color = "red";
//     });
// });


import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Toggle password visibility
window.togglePassword = function () {
  const passField = document.getElementById("password");
  passField.type = passField.type === "password" ? "text" : "password";
};

// Handle login form submission
const form = document.getElementById("login-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value;
  const messageBox = document.getElementById("login-message");

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      if (!user.emailVerified) {
        messageBox.textContent = "📧 Please verify your email before logging in.";
        messageBox.style.color = "orange";
        return;
      }

      // Redirect to dashboard only if email is verified
      messageBox.textContent = "✅ Login successful! Redirecting...";
      messageBox.style.color = "green";
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    })
    .catch((error) => {
      let userMessage = "";
      switch (error.code) {
        case "auth/invalid-email":
          userMessage = "⚠️ Please enter a valid email address.";
          break;
        case "auth/user-not-found":
          userMessage = "❌ No account found with that email.";
          break;
        case "auth/wrong-password":
          userMessage = "❌ Incorrect password. Try again.";
          break;
        case "auth/too-many-requests":
          userMessage = "⚠️ Too many attempts. Please try again later.";
          break;
        case "auth/invalid-credential":
          userMessage = "⚠️ Invalid credentials. Please check your email and password.";
          break;
        default:
          userMessage = "❌ Login failed: " + error.message;
          break;
      }

      messageBox.textContent = userMessage;
      messageBox.style.color = "red";
    });
});
