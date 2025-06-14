// function togglePassword() {
//   const passField = document.getElementById("password");
//   if (passField.type === "password") {
//     passField.type = "text";
//   } else {
//     passField.type = "password";
//   }
// }

// // function login() {
// //   alert("Logged in! Redirecting to dashboard...");
// //   // Simulate login success
// //   window.location.href = "dashboard.html"; // Replace this as needed
// //   return false;
// // }

// import { auth } from './firebase-config.js';
//     import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

//     window.togglePassword = function () {
//       const passField = document.getElementById("password");
//       passField.type = passField.type === "password" ? "text" : "password";
//     };

//     const form = document.getElementById("login-form");

//     form.addEventListener("submit", (e) => {
//       e.preventDefault();
//       const email = form.email.value;
//       const password = form.password.value;

//       signInWithEmailAndPassword(auth, email, password)
//         .then(userCredential => {
//           alert("Login successful!");
//           window.location.href = "dashboard.html";
//         })
//         .catch(error => {
//           alert("Login failed: " + error.message);
//         });
//     });

// firebase-login.js
import { auth } from './firebase-config.js';
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

  const email = form.email.value;
  const password = form.password.value;
  const messageBox = document.getElementById("login-message");

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      // messageBox.textContent = "✅ Login successful! Redirecting...";
      // messageBox.style.color = "green";
      // setTimeout(() => {
      //   window.location.href = "dashboard.html";
      // }, 1500);
      window.location.href = "dashboard.html";
    })
    .catch(error => {
      messageBox.textContent = "❌ Login failed: Invalid email or password.";
      messageBox.style.color = "red";
    });
});
