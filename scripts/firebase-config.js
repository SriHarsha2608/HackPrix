// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
// // import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// import {
//     getFirestore,
//     collection,
//     addDoc,
//     getDocs,
//     updateDoc,
//     deleteDoc,
//     doc
//   } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


// const firebaseConfig = {
//     apiKey: "AIzaSyCyzY3dvSw9ZuRUxZM7mnvPqyRm06u0F18",
//     authDomain: "tripmate-18ab0.firebaseapp.com",
//     projectId: "tripmate-18ab0",
//     storageBucket: "tripmate-18ab0.appspot.com",
//     messagingSenderId: "1014181772904",
//     appId: "1:1014181772904:web:0391ea0a7a5de49a3845dd",
//     measurementId: "G-ZSB3K4VSRY"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// export { auth, db };

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
// Corrected: Removed redundant imports and consolidated into one
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCyzY3dvSw9ZuRUxZM7mnvPqyRm06u0F18",
    authDomain: "tripmate-18ab0.firebaseapp.com",
    projectId: "tripmate-18ab0",
    storageBucket: "tripmate-18ab0.appspot.com",
    messagingSenderId: "1014181772904",
    appId: "1:1014181772904:web:0391ea0a7a5de49a3845dd",
    measurementId: "G-ZSB3K4VSRY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
