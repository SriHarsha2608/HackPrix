// import { auth } from './firebase-config.js';
// import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// // Toggle password visibility
// function toggleSignupPassword() {
//   const passField = document.getElementById("signup-password");
//   passField.type = passField.type === "password" ? "text" : "password";
// }
// window.toggleSignupPassword = toggleSignupPassword;

// const form = document.getElementById("signup-form");

// // Create a message box if it doesn't exist
// let messageBox = document.createElement("p");
// messageBox.id = "signup-message";
// messageBox.style.marginTop = "10px";
// form.appendChild(messageBox);

// form.addEventListener("submit", (e) => {
//   e.preventDefault();

//   const email = form.email.value.trim();
//   const password = form.password.value;
//   const confirmPassword = form.querySelector('input[placeholder="Confirm your password"]').value;

//   // Step 1: Confirm password check
//   if (password !== confirmPassword) {
//     messageBox.textContent = "❌ Passwords do not match.";
//     messageBox.style.color = "red";
//     return;
//   }

//   // Step 2: Password rule checks
//   const issues = [];
//   if (password.length < 8) issues.push("at least 8 characters");
//   if (!/[A-Z]/.test(password)) issues.push("an uppercase letter");
//   if (!/[a-z]/.test(password)) issues.push("a lowercase letter");
//   if (!/[0-9]/.test(password)) issues.push("a number");
//   if (!/[\W_]/.test(password)) issues.push("a special character");

//   if (issues.length > 0) {
//     messageBox.textContent = "❌ Password must include: " + issues.join(", ") + ".";
//     messageBox.style.color = "red";
//     return;
//   }

//   // Step 3: Firebase signup
//   createUserWithEmailAndPassword(auth, email, password)
//     .then(userCredential => {
//       messageBox.textContent = "✅ Signup successful! Redirecting to login...";
//       messageBox.style.color = "green";
//       setTimeout(() => {
//         window.location.href = "login.html";
//       }, 2000);
//     })
//     .catch(error => {
//       let msg = "❌ Signup failed: ";
//       switch (error.code) {
//         case "auth/email-already-in-use":
//           msg += "This email is already registered.";
//           break;
//         case "auth/invalid-email":
//           msg += "Invalid email address.";
//           break;
//         case "auth/weak-password":
//           msg += "Password is too weak.";
//           break;
//         default:
//           msg += error.message;
//       }
//       messageBox.textContent = msg;
//       messageBox.style.color = "red";
//     });
// });


import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Toggle password visibility
function toggleSignupPassword() {
  const passField = document.getElementById("signup-password");
  passField.type = passField.type === "password" ? "text" : "password";
}
window.toggleSignupPassword = toggleSignupPassword;

const form = document.getElementById("signup-form");

// Create or select message box
let messageBox = document.createElement("p");
messageBox.id = "signup-message";
messageBox.style.marginTop = "10px";
form.appendChild(messageBox);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form.querySelector('input[placeholder="Confirm your password"]').value;

  // Step 1: Confirm password check
  if (password !== confirmPassword) {
    messageBox.textContent = "❌ Passwords do not match.";
    messageBox.style.color = "red";
    return;
  }

  // Step 2: Password rule checks
  const issues = [];
  if (password.length < 8) issues.push("at least 8 characters");
  if (!/[A-Z]/.test(password)) issues.push("an uppercase letter");
  if (!/[a-z]/.test(password)) issues.push("a lowercase letter");
  if (!/[0-9]/.test(password)) issues.push("a number");
  if (!/[\W_]/.test(password)) issues.push("a special character");

  if (issues.length > 0) {
    messageBox.textContent = "❌ Password must include: " + issues.join(", ") + ".";
    messageBox.style.color = "red";
    return;
  }

  // Step 3: Firebase signup and email verification
  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const user = userCredential.user;

      sendEmailVerification(user)
        .then(() => {
          messageBox.textContent = "✅ Signup successful! A verification email has been sent. Please check your inbox.";
          messageBox.style.color = "green";

          setTimeout(() => {
            window.location.href = "login.html";
          }, 4000);
        })
        .catch(error => {
          messageBox.textContent = "⚠️ Signed up but couldn't send verification email: " + error.message;
          messageBox.style.color = "orange";
        });
    })
    .catch(error => {
      let msg = "❌ Signup failed: ";
      switch (error.code) {
        case "auth/email-already-in-use":
          msg += "This email is already registered.";
          break;
        case "auth/invalid-email":
          msg += "Invalid email address.";
          break;
        case "auth/weak-password":
          msg += "Password is too weak.";
          break;
        default:
          msg += error.message;
      }
      messageBox.textContent = msg;
      messageBox.style.color = "red";
    });
});
