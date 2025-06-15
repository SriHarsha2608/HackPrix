import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

window.togglePassword = function () {
  const passField = document.getElementById("password");
  const toggleIcon = document.getElementById("togglePassword");

  const isPassword = passField.type === "password";
  passField.type = isPassword ? "text" : "password";
  toggleIcon.textContent = isPassword ? "🙈" : "👁";
};

const form = document.getElementById("login-form");
const messageBox = document.getElementById("login-message");
const resendBtn = document.getElementById("resend-verification-btn");
let unverifiedUser = null;

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value;
  messageBox.textContent = "";
  resendBtn.style.display = "none";
  unverifiedUser = null;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      if (!user.emailVerified) {
        unverifiedUser = user;
        messageBox.textContent =
          "📧 Please verify your email before logging in.";
        messageBox.style.color = "orange";
        resendBtn.style.display = "inline-block";
        return;
      }

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
          userMessage =
            "⚠️ Invalid credentials. Please check your email and password.";
          break;
        default:
          userMessage = "❌ Login failed: " + error.message;
      }

      messageBox.textContent = userMessage;
      messageBox.style.color = "red";
    });
});
// resendBtn.addEventListener("click", () => {
//   if (unverifiedUser) {
//     sendEmailVerification(unverifiedUser)
//       .then(() => {
//         messageBox.textContent = "✅ Verification email resent. Please check your inbox.";
//         messageBox.style.color = "green";
//         resendBtn.style.display = "none";
//       })
//       .catch((error) => {
//         messageBox.textContent = "❌ Failed to resend: " + error.message;
//         messageBox.style.color = "red";
//       });
//   }
// });

resendBtn.addEventListener("click", () => {
  if (unverifiedUser) {
    resendBtn.disabled = true;
    resendBtn.textContent = "Sending... ⏳";
    resendBtn.style.opacity = "0.6";
    resendBtn.style.cursor = "not-allowed";

    sendEmailVerification(unverifiedUser)
      .then(() => {
        messageBox.textContent =
          "✅ Verification email resent. Please check your inbox.";
        messageBox.style.color = "green";

        let countdown = 30;
        resendBtn.textContent = `Wait ${countdown}s`;
        const interval = setInterval(() => {
          countdown--;
          resendBtn.textContent = `Wait ${countdown}s`;
          if (countdown <= 0) {
            clearInterval(interval);
            resendBtn.textContent = "Resend Verification Email";
            resendBtn.disabled = false;
            resendBtn.style.opacity = "1";
            resendBtn.style.cursor = "pointer";
          }
        }, 1000);
      })
      .catch((error) => {
        messageBox.textContent = "❌ Failed to resend: " + error.message;
        messageBox.style.color = "red";

        resendBtn.textContent = "Resend Verification Email";
        resendBtn.disabled = false;
        resendBtn.style.opacity = "1";
        resendBtn.style.cursor = "pointer";
      });
  }
});

import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const forgotPasswordLink = document.getElementById("forgot-password-link");
const forgotPasswordSection = document.getElementById(
  "forgot-password-section"
);
const resetEmailInput = document.getElementById("reset-email");
const resetPasswordBtn = document.getElementById("reset-password-btn");

forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  forgotPasswordSection.style.display = "block";
});

resetPasswordBtn.addEventListener("click", () => {
  const email = resetEmailInput.value.trim();
  if (!email) {
    messageBox.textContent = "⚠️ Please enter your email address.";
    messageBox.style.color = "orange";
    return;
  }

  resetPasswordBtn.disabled = true;
  resetPasswordBtn.textContent = "Sending...";

  sendPasswordResetEmail(auth, email)
    .then(() => {
      messageBox.textContent =
        "✅ Password reset email sent! Please check your inbox.";
      messageBox.style.color = "green";
      resetPasswordBtn.style.display = "none";
    })
    .catch((error) => {
      let msg = "❌ Error: " + error.message;
      if (error.code === "auth/user-not-found") {
        msg = "❌ If this email is registered, a reset link will be sent.";
      }

      messageBox.textContent = msg;
      messageBox.style.color = "red";
      resetPasswordBtn.disabled = false;
      resetPasswordBtn.textContent = "Send Reset Link";
    });
});
