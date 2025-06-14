// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// function toggleSignupPassword() {
//   const passField = document.getElementById("signup-password");
//   passField.type = passField.type === "password" ? "text" : "password";
// }

// // function signup() {
// //   alert("Account created! Redirecting to dashboard...");
// //   window.location.href = "login.html"; // Replace this with actual route
// //   return false;
// // }



// const auth = getAuth();
// createUserWithEmailAndPassword(auth, email, password)
//   .then(userCredential => {
//     // Signed up
//     console.log(userCredential.user);
//   })
//   .catch(error => {
//     console.error(error.message);
//   });

// // /js/signup.js
// import { auth } from './firebase-config.js';
// import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// const form = document.getElementById("signup-form");

// form.addEventListener("submit", (e) => {
//   e.preventDefault();
  
//   const email = form.email.value;
//   const password = form.password.value;

//   createUserWithEmailAndPassword(auth, email, password)
//     .then(userCredential => {
//       alert("Signup successful!");
//       window.location.href = "./login.html"; // redirect
//     })
//     .catch(error => {
//       alert(error.message);
//     });
// });

// scripts/signup.js
import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

function toggleSignupPassword() {
  const passField = document.getElementById("signup-password");
  passField.type = passField.type === "password" ? "text" : "password";
}

// Attach toggle to global scope
window.toggleSignupPassword = toggleSignupPassword;

const form = document.getElementById("signup-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = form.email.value;
  const password = form.password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      alert("Signup successful!");
      window.location.href = "login.html";
    })
    .catch(error => {
      alert("Signup failed: " + error.message);
    });
});
