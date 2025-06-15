import { auth, db } from './firebase-config.js'; // db is needed for Firestore
import { createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


function toggleSignupPassword() {
  const passField = document.getElementById("signup-password");
  const isPassword = passField.type === "password";
  passField.type = isPassword ? "text" : "password";
}

window.toggleSignupPassword = toggleSignupPassword;


const form = document.getElementById("signup-form");
let messageBox = document.getElementById("signup-message");
if (!messageBox) {
    messageBox = document.createElement("p");
    messageBox.id = "signup-message";
    messageBox.style.marginTop = "10px";
    messageBox.style.color = "red";
    form.appendChild(messageBox);
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const confirmPassword = form.querySelector('input[placeholder="Confirm your password"]').value;

    if (password !== confirmPassword) {
        messageBox.textContent = "❌ Passwords do not match.";
        return;
    }
    
    const issues = [];
    if (password.length < 8) issues.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) issues.push("an uppercase letter");
    if (!/[a-z]/.test(password)) issues.push("a lowercase letter");
    if (!/[0-9]/.test(password)) issues.push("a number");
    if (!/[\W_]/.test(password)) issues.push("a special character");

    if (issues.length > 0) {
        messageBox.textContent = "❌ Password must include: " + issues.join(", ") + ".";
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            
            return setDoc(userDocRef, {
                uid: user.uid,
                name: name,
                email: email,
                username: `user${Math.floor(Math.random() * 10000)}`,
                profilePhotoUrl: 'images/default-avatar.png',
                friends: [],
                createdAt: serverTimestamp()
            }).then(() => {
                return sendEmailVerification(user);
            });
        })
        .then(() => {
            messageBox.textContent = "✅ Signup successful! A verification email has been sent. Please check your inbox.";
            messageBox.style.color = "green";
            setTimeout(() => { window.location.href = "login.html"; }, 5000);
        })
        .catch(error => {
            let msg = "❌ Signup failed: ";
            switch (error.code) {
                case "auth/email-already-in-use": msg += "This email is already registered."; break;
                case "auth/invalid-email": msg += "Invalid email address."; break;
                case "auth/weak-password": msg += "Password is too weak."; break;
                default: msg += error.message; break;
            }
            messageBox.textContent = msg;
            messageBox.style.color = "red";
        });
});