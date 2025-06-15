// // --- Imports ---
// import { auth, db } from './firebase-config.js';
// import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
// import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

// // --- Global Variables ---
// let currentUser = null;
// const storage = getStorage();

// // --- Auth State Observer (The "Auth Guard") ---
// onAuthStateChanged(auth, (user) => {
//     if (user && user.emailVerified) {
//         currentUser = user;
//         loadUserData();
//         loadTrips();
//         loadFriendRequests();
//     } else {
//         window.location.href = 'login.html';
//     }
// });

// // --- Load User Data ---
// async function loadUserData() {
//     if (!currentUser) return;

//     const userDocRef = doc(db, 'users', currentUser.uid);
//     try {
//         const userDoc = await getDoc(userDocRef);
//         if (userDoc.exists()) {
//             const userData = userDoc.data();
//             document.getElementById('userName').textContent = userData.name || 'User';
//             document.getElementById('userUsername').textContent = `@${userData.username || 'username'}`;
//             document.querySelector('.profile-card > p').textContent = userData.email;
//             document.getElementById('profilePhoto').src = userData.profilePhotoUrl || 'images/default-avatar.png';
//             document.querySelector('.info-box.friends span').textContent = userData.friends ? userData.friends.length : 0;
//         } else {
//             console.error("CRITICAL: User document not found in Firestore!");
//         }
//     } catch (error) {
//         console.error("Error loading user data:", error);
//     }
// }

// // --- Logout ---
// const logoutButton = document.querySelector('.logout-btn');
// logoutButton.addEventListener('click', () => openLogoutModal());

// // Make functions globally accessible on the window object
// window.confirmLogout = function() {
//     signOut(auth).catch((error) => console.error("Sign out error", error));
// };


// // --- Trip Management ---
// async function handleCreateTrip(event) {
//     event.preventDefault();
//     if (!currentUser) return;

//     const endDate = new Date(document.getElementById('endDate').value);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const tripData = {
//         name: document.getElementById('tripName').value,
//         location: document.getElementById('tripLocation').value,
//         startDate: document.getElementById('startDate').value,
//         endDate: document.getElementById('endDate').value,
//         status: endDate < today ? 'completed' : 'ongoing',
//         ownerId: currentUser.uid,
//         members: [currentUser.uid],
//         createdAt: serverTimestamp()
//     };

//     try {
//         await addDoc(collection(db, "trips"), tripData);
//         closeCreateTripModal();
//         loadTrips();
//     } catch (e) {
//         console.error("Error adding trip: ", e);
//         alert("Failed to create trip.");
//     }
// }

// async function loadTrips() {
//     if (!currentUser) return;
//     const currentTripsContainer = document.getElementById('currentTrips');
//     const pastTripsContainer = document.getElementById('pastTrips');
//     currentTripsContainer.innerHTML = '<p>Loading trips...</p>';
//     pastTripsContainer.innerHTML = '';

//     const q = query(collection(db, "trips"), where("members", "array-contains", currentUser.uid));

//     try {
//         const querySnapshot = await getDocs(q);
//         currentTripsContainer.innerHTML = '';
//         pastTripsContainer.innerHTML = '';

//         if (querySnapshot.empty) {
//             currentTripsContainer.innerHTML = '<p>No trips found. Create one to get started!</p>';
//         }

//         querySnapshot.forEach((doc) => {
//             const trip = { id: doc.id, ...doc.data() };
//             const endDate = new Date(trip.endDate);
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             if (trip.status === 'ongoing' && endDate < today) {
//                 trip.status = 'completed';
//                 updateDoc(doc.ref, { status: 'completed' });
//             }
            
//             const tripCard = createTripCard(trip);
//             if (trip.status === 'ongoing') {
//                 currentTripsContainer.appendChild(tripCard);
//             } else {
//                 pastTripsContainer.appendChild(tripCard);
//             }
//         });
//         updateTripsCount();
//     } catch (error) {
//         console.error("Error getting trips: ", error);
//         currentTripsContainer.innerHTML = '<p>Error loading trips.</p>';
//     }
// }

// function createTripCard(tripData) {
//     const card = document.createElement('div');
//     card.className = 'trip-card';
//     card.dataset.tripId = tripData.id;
//     const startDate = new Date(tripData.startDate);
//     const endDate = new Date(tripData.endDate);
//     card.innerHTML = `
//     <div class="trip-header">
//       <h4>${tripData.name}</h4>
//       <span class="status ${tripData.status}">${tripData.status.charAt(0).toUpperCase() + tripData.status.slice(1)}</span>
//     </div>
//     <p>📍 ${tripData.location}</p>
//     <p>📅 ${formatDate(startDate)} - ${formatDate(endDate)}</p>
//     <p>💰 ${tripData.totalAmount || '$0.00'}</p>
//     <div class="trip-footer">
//         <span>👥 ${tripData.members.length} people</span>
//         <button onclick="viewTripDetails('${tripData.id}')">View Details</button>
//     </div>
//   `;
//     return card;
// }

// window.viewTripDetails = function(tripId) {
//     localStorage.setItem('currentTripId', tripId);
//     window.location.href = 'trip-details.html';
// };

// // --- Profile Photo Management ---
// async function handlePhotoChange(event) {
//     event.preventDefault();
//     const file = document.getElementById('photoFile').files[0];
//     if (!file || !currentUser) return;

//     const storageRef = ref(storage, `profile_photos/${currentUser.uid}/${file.name}`);
//     try {
//         await uploadBytes(storageRef, file);
//         const downloadURL = await getDownloadURL(storageRef);
//         await updateDoc(doc(db, "users", currentUser.uid), { profilePhotoUrl: downloadURL });
//         document.getElementById('profilePhoto').src = downloadURL;
//         closeChangePhotoModal();
//     } catch (error) {
//         console.error("Error uploading photo:", error);
//         alert("Photo upload failed.");
//     }
// }

// // --- Friend Management ---
// async function handleInvite(event) {
//     event.preventDefault();
//     const email = document.getElementById('friendEmail').value;
//     if (email === currentUser.email) {
//         alert("You can't invite yourself!");
//         return;
//     }
//     try {
//         const userQuery = await getDocs(query(collection(db, "users"), where("email", "==", email)));
//         if (userQuery.empty) {
//             alert("No user found with that email address.");
//             return;
//         }
//         const receiver = userQuery.docs[0];
//         const sender = await getDoc(doc(db, 'users', currentUser.uid));

//         await addDoc(collection(db, "friendRequests"), {
//             senderId: currentUser.uid,
//             senderName: sender.data().name,
//             receiverId: receiver.id,
//             status: 'pending',
//             createdAt: serverTimestamp()
//         });
//         alert("Friend request sent!");
//         closeInviteModal();
//     } catch (error) {
//         console.error("Error sending invite: ", error);
//         alert("Failed to send invite.");
//     }
// }

// async function loadFriendRequests() {
//     const requestsList = document.getElementById('requestsList');
//     requestsList.innerHTML = 'Loading...';
//     const q = query(collection(db, "friendRequests"), where('receiverId', '==', currentUser.uid), where('status', '==', 'pending'));
//     const snapshot = await getDocs(q);
//     if (snapshot.empty) {
//         requestsList.innerHTML = '<div class="no-requests">No pending friend requests</div>';
//         return;
//     }
//     requestsList.innerHTML = snapshot.docs.map(doc => {
//         const request = { id: doc.id, ...doc.data() };
//         return `
//         <div class="request-item">
//             <div class="request-info">
//                 <div class="request-details">
//                     <div class="request-name">${request.senderName} wants to be your friend.</div>
//                 </div>
//             </div>
//             <div class="request-actions">
//                 <button class="btn-accept" onclick="handleFriendRequest('${request.id}', '${request.senderId}', true)">Accept</button>
//                 <button class="btn-reject" onclick="handleFriendRequest('${request.id}', '${request.senderId}', false)">Reject</button>
//             </div>
//         </div>
//         `;
//     }).join('');
// }

// window.handleFriendRequest = async function(requestId, senderId, accepted) {
//     const requestRef = doc(db, 'friendRequests', requestId);
//     try {
//         if (accepted) {
//             const currentUserRef = doc(db, 'users', currentUser.uid);
//             const senderRef = doc(db, 'users', senderId);
//             await updateDoc(currentUserRef, { friends: arrayUnion(senderId) });
//             await updateDoc(senderRef, { friends: arrayUnion(currentUser.uid) });
//         }
//         await updateDoc(requestRef, { status: accepted ? 'accepted' : 'rejected' });
//         loadFriendRequests();
//         loadUserData(); // To update friend count
//     } catch (error) {
//         console.error("Error handling friend request: ", error);
//     }
// }

// // --- Edit Profile ---
// async function saveProfileChanges(event) {
//     event.preventDefault();
//     const newName = document.getElementById('editName').value;
//     const newUsername = document.getElementById('editUsername').value;
//     try {
//         await updateDoc(doc(db, 'users', currentUser.uid), {
//             name: newName,
//             username: newUsername
//         });
//         loadUserData();
//         closeEditProfileModal();
//     } catch(error) {
//         alert('Failed to update profile.');
//         console.error(error);
//     }
// }

// // --- Event Listeners & Global Functions ---
// // Assign event listeners
// document.getElementById('createTripForm').addEventListener('submit', handleCreateTrip);
// document.getElementById('inviteForm').addEventListener('submit', handleInvite);
// document.getElementById('changePhotoForm').addEventListener('submit', handlePhotoChange);
// document.getElementById('editProfileForm').addEventListener('submit', saveProfileChanges);
// document.getElementById('photoInput').addEventListener('change', (event) => {
//     // This is different from your original HTML, you need to call a function for the change photo modal
//     openChangePhotoModal();
//     // Preview logic
//     const file = event.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             document.getElementById('photoPreview').src = e.target.result;
//             document.getElementById('photoPreview').style.display = 'block';
//         }
//         reader.readAsDataURL(file);
//     }
// });


// // Helper Functions (make them globally available if called from HTML)
// function formatDate(date) { return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }); }
// function updateTripsCount() {
//     const currentTrips = document.querySelectorAll('#currentTrips .trip-card').length;
//     const pastTrips = document.querySelectorAll('#pastTrips .trip-card').length;
//     document.getElementById('currentTripsCount').textContent = currentTrips;
//     document.getElementById('pastTripsCount').textContent = pastTrips;
//     document.querySelector('.info-box.trips span').textContent = currentTrips + pastTrips;
// }
// function generateRandomUsername() {
//     const adjectives = ['Happy', 'Clever', 'Brave', 'Swift', 'Bright', 'Calm', 'Eager', 'Gentle', 'Kind', 'Lively'];
//     const nouns = ['Traveler', 'Explorer', 'Wanderer', 'Voyager', 'Nomad', 'Pilgrim', 'Rover', 'Globetrotter', 'Wayfarer', 'Adventurer'];
//     const randomNum = Math.floor(Math.random() * 1000);
//     const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
//     const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
//     return `${randomAdj}${randomNoun}${randomNum}`;
// }

// // Modal Management Functions (must be on window object to be called from HTML onclick)
// window.openInviteModal = () => document.getElementById('inviteModal').style.display = 'block';
// window.closeInviteModal = () => document.getElementById('inviteModal').style.display = 'none';
// window.openCreateTripModal = () => document.getElementById('createTripModal').style.display = 'block';
// window.closeCreateTripModal = () => document.getElementById('createTripModal').style.display = 'none';
// window.openChangePhotoModal = () => document.getElementById('changePhotoModal').style.display = 'block';
// window.closeChangePhotoModal = () => document.getElementById('changePhotoModal').style.display = 'none';
// window.openLogoutModal = () => document.getElementById('logoutModal').style.display = 'block';
// window.closeLogoutModal = () => document.getElementById('logoutModal').style.display = 'none';
// window.openRequestsModal = () => document.getElementById('requestsModal').style.display = 'block';
// window.closeRequestsModal = () => document.getElementById('requestsModal').style.display = 'none';
// window.openEditProfileModal = function() {
//     document.getElementById('editName').value = document.getElementById('userName').textContent;
//     document.getElementById('editUsername').value = document.getElementById('userUsername').textContent.replace('@', '');
//     document.getElementById('editProfileModal').style.display = 'block';
// }
// window.closeEditProfileModal = () => document.getElementById('editProfileModal').style.display = 'none';
// window.randomizeUsername = () => document.getElementById('editUsername').value = generateRandomUsername();

// window.onclick = function(event) {
//     if (event.target.className === 'modal') {
//         event.target.style.display = 'none';
//     }
// };

// --- Imports ---
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

// --- Global Variables ---
let currentUser = null;
const storage = getStorage();

// --- Auth State Observer (The "Auth Guard") ---
onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
        currentUser = user;
        loadUserData();
        loadTrips();
        loadFriendRequests();
    } else {
        window.location.href = 'login.html';
    }
});

// --- Load User Data ---
async function loadUserData() {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById('userName').textContent = userData.name || 'User';
            document.getElementById('userUsername').textContent = `@${userData.username || 'username'}`;
            // Corrected: Use a specific ID to update the email
            document.getElementById('userEmail').textContent = userData.email;
            document.getElementById('profilePhoto').src = userData.profilePhotoUrl || 'images/default-avatar.png';
            document.querySelector('.info-box.friends span').textContent = userData.friends ? userData.friends.length : 0;
        } else {
            console.error("CRITICAL: User document not found in Firestore!");
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

// --- Logout ---
const logoutButton = document.querySelector('.logout-btn');
logoutButton.addEventListener('click', () => openLogoutModal());

window.confirmLogout = function() {
    signOut(auth).catch((error) => console.error("Sign out error", error));
};

// --- Trip Management ---
async function handleCreateTrip(event) {
    event.preventDefault();
    if (!currentUser) return;

    const endDate = new Date(document.getElementById('endDate').value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tripData = {
        name: document.getElementById('tripName').value,
        location: document.getElementById('tripLocation').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        status: endDate < today ? 'completed' : 'ongoing',
        ownerId: currentUser.uid,
        members: [currentUser.uid],
        createdAt: serverTimestamp()
    };

    try {
        await addDoc(collection(db, "trips"), tripData);
        closeCreateTripModal();
        loadTrips();
    } catch (e) {
        console.error("Error adding trip: ", e);
        alert("Failed to create trip.");
    }
}

async function loadTrips() {
    if (!currentUser) return;
    const currentTripsContainer = document.getElementById('currentTrips');
    const pastTripsContainer = document.getElementById('pastTrips');
    currentTripsContainer.innerHTML = '<p>Loading trips...</p>';
    pastTripsContainer.innerHTML = '<p>Loading trips...</p>';

    const q = query(collection(db, "trips"), where("members", "array-contains", currentUser.uid));

    try {
        const querySnapshot = await getDocs(q);
        currentTripsContainer.innerHTML = '';
        pastTripsContainer.innerHTML = '';

        if (querySnapshot.empty) {
            currentTripsContainer.innerHTML = '<p>No trips found. Create one to get started!</p>';
        }

        let currentCount = 0;
        let pastCount = 0;

        querySnapshot.forEach((doc) => {
            const trip = { id: doc.id, ...doc.data() };
            const endDate = new Date(trip.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let effectiveStatus = trip.status;
            if (trip.status === 'ongoing' && endDate < today) {
                effectiveStatus = 'completed';
                updateDoc(doc.ref, { status: 'completed' });
            }
            
            const tripCard = createTripCard(trip, effectiveStatus);
            if (effectiveStatus === 'ongoing') {
                currentTripsContainer.appendChild(tripCard);
                currentCount++;
            } else {
                pastTripsContainer.appendChild(tripCard);
                pastCount++;
            }
        });

        if (currentCount === 0) {
            currentTripsContainer.innerHTML = '<p>No current trips found.</p>';
        }
        if (pastCount === 0) {
            pastTripsContainer.innerHTML = '<p>No past trips found.</p>';
        }

        updateTripsCount();
    } catch (error) {
        console.error("Error getting trips: ", error);
        currentTripsContainer.innerHTML = '<p>Error loading trips.</p>';
        pastTripsContainer.innerHTML = '<p>Error loading trips.</p>';
    }
}

function createTripCard(tripData, status) {
    const card = document.createElement('div');
    card.className = 'trip-card';
    card.dataset.tripId = tripData.id;
    const startDate = new Date(tripData.startDate);
    const endDate = new Date(tripData.endDate);
    card.innerHTML = `
    <div class="trip-header">
      <h4>${tripData.name}</h4>
      <span class="status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
    <p>📍 ${tripData.location}</p>
    <p>📅 ${formatDate(startDate)} - ${formatDate(endDate)}</p>
    <p>💰 ${tripData.totalAmount || '$0.00'}</p>
    <div class="trip-footer">
        <span>👥 ${tripData.members.length} people</span>
        <button onclick="viewTripDetails('${tripData.id}')">View Details</button>
    </div>
  `;
    return card;
}

window.viewTripDetails = function(tripId) {
    localStorage.setItem('currentTripId', tripId);
    window.location.href = 'trip-details.html';
};

// --- Profile Photo Management ---
async function handlePhotoChange(event) {
    event.preventDefault();
    const file = document.getElementById('photoFile').files[0];
    if (!file || !currentUser) return;

    const storageRef = ref(storage, `profile_photos/${currentUser.uid}/${file.name}`);
    try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        await updateDoc(doc(db, "users", currentUser.uid), { profilePhotoUrl: downloadURL });
        document.getElementById('profilePhoto').src = downloadURL;
        closeChangePhotoModal();
    } catch (error) {
        console.error("Error uploading photo:", error);
        alert("Photo upload failed.");
    }
}

// --- Friend Management ---
async function handleInvite(event) {
    event.preventDefault();
    const email = document.getElementById('friendEmail').value.trim().toLowerCase();
    if (!email) {
        alert("Please enter an email address.");
        return;
    }
    if (email === currentUser.email) {
        alert("You can't invite yourself!");
        return;
    }

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const userQuerySnapshot = await getDocs(q);

        if (userQuerySnapshot.empty) {
            alert("No user found with that email address.");
            return;
        }

        const receiverDoc = userQuerySnapshot.docs[0];
        const receiverId = receiverDoc.id;
        const receiverData = receiverDoc.data();

        const senderDocRef = doc(db, 'users', currentUser.uid);
        const senderDoc = await getDoc(senderDocRef);
        const senderData = senderDoc.data();

        if (senderData.friends && senderData.friends.includes(receiverId)) {
            alert(`You are already friends with ${receiverData.name}.`);
            return;
        }

        const requestsRef = collection(db, "friendRequests");
        const q1 = query(requestsRef, where('senderId', '==', currentUser.uid), where('receiverId', '==', receiverId), where('status', '==', 'pending'));
        const q2 = query(requestsRef, where('senderId', '==', receiverId), where('receiverId', '==', currentUser.uid), where('status', '==', 'pending'));
        const [req1Snapshot, req2Snapshot] = await Promise.all([getDocs(q1), getDocs(q2)]);

        if (!req1Snapshot.empty) {
            alert("You have already sent a friend request to this user.");
            return;
        }
        if (!req2Snapshot.empty) {
            alert(`${receiverData.name} has already sent you a friend request. Check your requests!`);
            return;
        }

        await addDoc(requestsRef, {
            senderId: currentUser.uid,
            senderName: senderData.name,
            receiverId: receiverId,
            status: 'pending',
            createdAt: serverTimestamp()
        });

        alert(`Friend request sent to ${receiverData.name}!`);
        closeInviteModal();
    } catch (error) {
        console.error("Error sending invite: ", error);
        alert("Failed to send invite. Please try again.");
    }
}


async function loadFriendRequests() {
    const requestsList = document.getElementById('requestsList');
    requestsList.innerHTML = 'Loading...';
    const q = query(collection(db, "friendRequests"), where('receiverId', '==', currentUser.uid), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        requestsList.innerHTML = '<div class="no-requests">No pending friend requests</div>';
        return;
    }
    requestsList.innerHTML = snapshot.docs.map(doc => {
        const request = { id: doc.id, ...doc.data() };
        return `
        <div class="request-item">
            <div class="request-info">
                <div class="request-details">
                    <div class="request-name">${request.senderName} wants to be your friend.</div>
                </div>
            </div>
            <div class="request-actions">
                <button class="btn-accept" onclick="handleFriendRequest('${request.id}', '${request.senderId}', true)">Accept</button>
                <button class="btn-reject" onclick="handleFriendRequest('${request.id}', '${request.senderId}', false)">Reject</button>
            </div>
        </div>
        `;
    }).join('');
}

window.handleFriendRequest = async function(requestId, senderId, accepted) {
    const requestRef = doc(db, 'friendRequests', requestId);
    try {
        if (accepted) {
            const currentUserRef = doc(db, 'users', currentUser.uid);
            const senderRef = doc(db, 'users', senderId);
            await updateDoc(currentUserRef, { friends: arrayUnion(senderId) });
            await updateDoc(senderRef, { friends: arrayUnion(currentUser.uid) });
        }
        await updateDoc(requestRef, { status: accepted ? 'accepted' : 'rejected' });
        loadFriendRequests();
        loadUserData(); // To update friend count
    } catch (error) {
        console.error("Error handling friend request: ", error);
    }
}

// --- Edit Profile ---
async function saveProfileChanges(event) {
    event.preventDefault();
    const newName = document.getElementById('editName').value;
    const newUsername = document.getElementById('editUsername').value;
    try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
            name: newName,
            username: newUsername
        });
        loadUserData();
        closeEditProfileModal();
    } catch(error) {
        alert('Failed to update profile.');
        console.error(error);
    }
}

// --- Event Listeners & Global Functions ---
document.getElementById('createTripForm').addEventListener('submit', handleCreateTrip);
document.getElementById('inviteForm').addEventListener('submit', handleInvite);
document.getElementById('changePhotoForm').addEventListener('submit', handlePhotoChange);
document.getElementById('editProfileForm').addEventListener('submit', saveProfileChanges);
document.getElementById('photoInput').addEventListener('change', (event) => {
    openChangePhotoModal();
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photoPreview').src = e.target.result;
            document.getElementById('photoPreview').style.display = 'block';
            document.getElementById('photoFile').files = event.target.files;
        }
        reader.readAsDataURL(file);
    }
});

function formatDate(date) { return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }); }
function updateTripsCount() {
    const currentTrips = document.querySelectorAll('#currentTrips .trip-card').length;
    const pastTrips = document.querySelectorAll('#pastTrips .trip-card').length;
    document.getElementById('currentTripsCount').textContent = currentTrips;
    document.getElementById('pastTripsCount').textContent = pastTrips;
    document.querySelector('.info-box.trips span').textContent = currentTrips + pastTrips;
}
function generateRandomUsername() {
    const adjectives = ['Happy', 'Clever', 'Brave', 'Swift', 'Bright', 'Calm', 'Eager', 'Gentle', 'Kind', 'Lively'];
    const nouns = ['Traveler', 'Explorer', 'Wanderer', 'Voyager', 'Nomad', 'Pilgrim', 'Rover', 'Globetrotter', 'Wayfarer', 'Adventurer'];
    const randomNum = Math.floor(Math.random() * 1000);
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdj}${randomNoun}${randomNum}`;
}

// Modal Management Functions
window.openInviteModal = () => {
    document.getElementById('inviteModal').style.display = 'block';
    document.getElementById('inviteForm').reset();
}
window.closeInviteModal = () => document.getElementById('inviteModal').style.display = 'none';
window.openCreateTripModal = () => document.getElementById('createTripModal').style.display = 'block';
window.closeCreateTripModal = () => document.getElementById('createTripModal').style.display = 'none';
window.openChangePhotoModal = () => document.getElementById('changePhotoModal').style.display = 'block';
window.closeChangePhotoModal = () => document.getElementById('changePhotoModal').style.display = 'none';
window.openLogoutModal = () => document.getElementById('logoutModal').style.display = 'block';
window.closeLogoutModal = () => document.getElementById('logoutModal').style.display = 'none';
window.openRequestsModal = () => document.getElementById('requestsModal').style.display = 'block';
window.closeRequestsModal = () => document.getElementById('requestsModal').style.display = 'none';
window.openEditProfileModal = function() {
    document.getElementById('editName').value = document.getElementById('userName').textContent;
    document.getElementById('editUsername').value = document.getElementById('userUsername').textContent.replace('@', '');
    document.getElementById('editProfileModal').style.display = 'block';
}
window.closeEditProfileModal = () => document.getElementById('editProfileModal').style.display = 'none';
window.randomizeUsername = () => document.getElementById('editUsername').value = generateRandomUsername();

window.onclick = function(event) {
    if (event.target.className.includes('modal')) {
        event.target.style.display = 'none';
    }
};