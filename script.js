// Modal Management
function openInviteModal() {
    document.getElementById('inviteModal').style.display = 'block';
}

function closeInviteModal() {
    document.getElementById('inviteModal').style.display = 'none';
}

function openCreateTripModal() {
    document.getElementById('createTripModal').style.display = 'block';
    populateFriendsList();
}

function closeCreateTripModal() {
    document.getElementById('createTripModal').style.display = 'none';
}

// Close modals when clicking outside
window.onclick = function (event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}

// Handle Invite Form Submission
function handleInvite(event) {
    event.preventDefault();
    const email = document.getElementById('friendEmail').value;
    const name = document.getElementById('friendName').value;

    // Add to friend requests
    const requests = JSON.parse(localStorage.getItem('friendRequests') || '[]');
    requests.push({ name, email });
    localStorage.setItem('friendRequests', JSON.stringify(requests));

    // Close modal and reset form
    closeInviteModal();
    event.target.reset();
}

// Handle Create Trip Form Submission
function handleCreateTrip(event) {
    event.preventDefault();

    const endDate = new Date(document.getElementById('endDate').value);
    const today = new Date();
    const status = endDate < today ? 'completed' : 'ongoing';

    const tripData = {
        id: Date.now(),
        name: document.getElementById('tripName').value,
        location: document.getElementById('tripLocation').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        status: status,
        totalAmount: '$0.00',
        members: '0 people'
    };

    // Save trip to localStorage
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    trips.push(tripData);
    localStorage.setItem('trips', JSON.stringify(trips));

    // Create new trip card
    const tripCard = createTripCard(tripData);

    // Add to appropriate container based on status
    if (status === 'ongoing') {
        document.getElementById('currentTrips').appendChild(tripCard);
    } else {
        document.getElementById('pastTrips').appendChild(tripCard);
    }

    // Update trips count
    updateTripsCount();

    // Close modal and reset form
    closeCreateTripModal();
    event.target.reset();
}

// Create Trip Card Element
function createTripCard(tripData) {
    const card = document.createElement('div');
    card.className = 'trip-card';
    card.dataset.tripId = tripData.id; // Add trip ID to card

    const startDate = new Date(tripData.startDate);
    const endDate = new Date(tripData.endDate);

    card.innerHTML = `
    <div class="trip-header">
      <h4>${tripData.name}</h4>
      <span class="status ${tripData.status}">${tripData.status.charAt(0).toUpperCase() + tripData.status.slice(1)}</span>
    </div>
    <p>📍 ${tripData.location}</p>
    <p>📅 ${formatDate(startDate)} - ${formatDate(endDate)}</p>
    <p>💰 ${tripData.totalAmount}</p>
    <p>👥 ${tripData.members}</p>
    <div class="trip-footer">
      <button onclick="toggleDetails(this)">View Details</button>
    </div>
  `;

    return card;
}

// Helper Functions
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    });
}

function updateTripsCount() {
    const currentTrips = document.getElementById('currentTrips').children.length;
    const pastTrips = document.getElementById('pastTrips').children.length;
    const totalTrips = currentTrips + pastTrips;

    // Update individual counts
    document.getElementById('currentTripsCount').textContent = currentTrips;
    document.getElementById('pastTripsCount').textContent = pastTrips;

    // Update total trips count in profile section
    const tripsCountElement = document.querySelector('.info-box.trips span');
    if (tripsCountElement) {
        tripsCountElement.textContent = totalTrips;
    }
}

function toggleDetails(button) {
    const card = button.closest('.trip-card');
    const tripId = card.dataset.tripId;
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const tripData = trips.find(trip => trip.id === parseInt(tripId));

    if (tripData) {
        // Store trip data in localStorage
        localStorage.setItem('currentTrip', JSON.stringify(tripData));

        // Navigate to trip details page
        window.location.href = 'trip-details.html';
    }
}

// Populate Friends List in Create Trip Modal
function populateFriendsList() {
    const friendsList = document.getElementById('tripMembers');
    // This would typically come from your backend
    const friends = [
        { id: 1, name: 'Jane Smith' },
        { id: 2, name: 'Mike Johnson' },
        { id: 3, name: 'Sarah Williams' }
    ];

    friendsList.innerHTML = friends.map(friend =>
        `<option value="${friend.id}">${friend.name}</option>`
    ).join('');
}

// Function to move trip from current to past
function completeTrip(tripCard) {
    const tripId = parseInt(tripCard.dataset.tripId);
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const tripIndex = trips.findIndex(trip => trip.id === tripId);

    if (tripIndex !== -1) {
        // Update trip status
        trips[tripIndex].status = 'completed';
        localStorage.setItem('trips', JSON.stringify(trips));

        // Update UI
        const statusSpan = tripCard.querySelector('.status');
        statusSpan.className = 'status completed';
        statusSpan.textContent = 'Completed';

        // Move to past trips
        document.getElementById('pastTrips').appendChild(tripCard);

        // Update counts
        updateTripsCount();
    }
}

// Load trips when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTrips();
    loadProfilePhoto();
});

function loadTrips() {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const currentTripsContainer = document.getElementById('currentTrips');
    const pastTripsContainer = document.getElementById('pastTrips');

    // Clear existing trips
    currentTripsContainer.innerHTML = '';
    pastTripsContainer.innerHTML = '';

    // Sort trips by status and date
    trips.sort((a, b) => {
        if (a.status === b.status) {
            return new Date(b.startDate) - new Date(a.startDate);
        }
        return a.status === 'ongoing' ? -1 : 1;
    });

    // Add trips to appropriate containers
    trips.forEach(trip => {
        const tripCard = createTripCard(trip);
        if (trip.status === 'ongoing') {
            currentTripsContainer.appendChild(tripCard);
        } else {
            pastTripsContainer.appendChild(tripCard);
        }
    });

    updateTripsCount();
}

// Profile Photo Management
function openChangePhotoModal() {
    document.getElementById('changePhotoModal').style.display = 'block';
}

function closeChangePhotoModal() {
    document.getElementById('changePhotoModal').style.display = 'none';
    document.getElementById('changePhotoForm').reset();
    document.getElementById('photoPreview').style.display = 'none';
}

// Load profile photo when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTrips();
    loadProfilePhoto();
});

function loadProfilePhoto() {
    const savedPhoto = localStorage.getItem('profilePhoto');
    const profilePhoto = document.getElementById('profilePhoto');

    if (savedPhoto && savedPhoto !== 'default') {
        profilePhoto.src = savedPhoto;
    } else {
        profilePhoto.src = 'images/default.jpeg'; // Default image from images folder
        localStorage.setItem('profilePhoto', 'default');
    }
}

// Preview photo before upload
document.getElementById('photoFile').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('photoPreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

function removeProfilePhoto() {
    // Set profile photo to default state
    const profilePhoto = document.getElementById('profilePhoto');
    profilePhoto.src = 'images/default.jpeg'; // Default image from images folder
    localStorage.setItem('profilePhoto', 'default');

    // Close modal and reset form
    closeChangePhotoModal();
}

function handlePhotoChange(event) {
    event.preventDefault();

    const file = document.getElementById('photoFile').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Save photo to localStorage
            localStorage.setItem('profilePhoto', e.target.result);

            // Update profile photo
            document.getElementById('profilePhoto').src = e.target.result;

            // Close modal and reset form
            closeChangePhotoModal();
        };
        reader.readAsDataURL(file);
    } else {
        // If no file is selected, just close the modal
        closeChangePhotoModal();
    }
}

// Logout functionality
document.querySelector('.logout-btn').addEventListener('click', function () {
    openLogoutModal();
});

function openLogoutModal() {
    document.getElementById('logoutModal').style.display = 'block';
}

function closeLogoutModal() {
    document.getElementById('logoutModal').style.display = 'none';
}

function confirmLogout() {
    // Clear any session data if needed
    localStorage.removeItem('currentTrip');

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Logged out successfully!';
    document.body.appendChild(successMessage);

    // Remove success message after 2 seconds and redirect
    setTimeout(() => {
        successMessage.remove();
        window.location.href = 'login.html';
    }, 2000);
}

// Close modal when clicking outside
window.onclick = function (event) {
    const logoutModal = document.getElementById('logoutModal');
    if (event.target === logoutModal) {
        closeLogoutModal();
    }
}

// Friend Requests Management
function openRequestsModal() {
    document.getElementById('requestsModal').style.display = 'block';
    loadFriendRequests();
}

function closeRequestsModal() {
    document.getElementById('requestsModal').style.display = 'none';
}

function loadFriendRequests() {
    const requestsList = document.getElementById('requestsList');
    const requests = JSON.parse(localStorage.getItem('friendRequests') || '[]');

    if (requests.length === 0) {
        requestsList.innerHTML = '<div class="no-requests">No pending friend requests</div>';
        return;
    }

    requestsList.innerHTML = requests.map(request => `
        <div class="request-item">
            <div class="request-info">
                <div class="request-avatar">${getInitials(request.name)}</div>
                <div class="request-details">
                    <div class="request-name">${request.name}</div>
                    <div class="request-email">${request.email}</div>
                </div>
            </div>
            <div class="request-actions">
                <button class="btn-accept" onclick="handleFriendRequest('${request.email}', true)">Accept</button>
                <button class="btn-reject" onclick="handleFriendRequest('${request.email}', false)">Reject</button>
            </div>
        </div>
    `).join('');
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function handleFriendRequest(email, accepted) {
    const requests = JSON.parse(localStorage.getItem('friendRequests') || '[]');
    const requestIndex = requests.findIndex(req => req.email === email);

    if (requestIndex !== -1) {
        if (accepted) {
            // Add to friends list
            const friends = JSON.parse(localStorage.getItem('friends') || '[]');
            friends.push(requests[requestIndex]);
            localStorage.setItem('friends', JSON.stringify(friends));

            // Update friends count
            const friendsCount = document.querySelector('.friends span');
            friendsCount.textContent = parseInt(friendsCount.textContent) + 1;
        }

        // Remove from requests
        requests.splice(requestIndex, 1);
        localStorage.setItem('friendRequests', JSON.stringify(requests));

        // Reload requests list
        loadFriendRequests();
    }
}

function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    const currentName = document.getElementById('userName').textContent;
    const currentUsername = document.getElementById('userUsername').textContent.replace('@', '');

    document.getElementById('editName').value = currentName;
    document.getElementById('editUsername').value = currentUsername;

    modal.style.display = 'block';
}

function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    modal.style.display = 'none';
}

function generateRandomUsername() {
    const adjectives = ['Happy', 'Clever', 'Brave', 'Swift', 'Bright', 'Calm', 'Eager', 'Gentle', 'Kind', 'Lively'];
    const nouns = ['Traveler', 'Explorer', 'Wanderer', 'Voyager', 'Nomad', 'Pilgrim', 'Rover', 'Globetrotter', 'Wayfarer', 'Adventurer'];
    const randomNum = Math.floor(Math.random() * 1000);
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdj}${randomNoun}${randomNum}`;
}

function randomizeUsername() {
    const newUsername = generateRandomUsername();
    document.getElementById('editUsername').value = newUsername;
}

function saveProfileChanges(event) {
    event.preventDefault();

    const newName = document.getElementById('editName').value.trim();
    const newUsername = document.getElementById('editUsername').value.trim();

    if (!newName || !newUsername) {
        alert('Please fill in all fields');
        return;
    }

    // Update the profile display
    document.getElementById('userName').textContent = newName;
    document.getElementById('userUsername').textContent = `@${newUsername}`;

    // Save to localStorage
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    userData.name = newName;
    userData.username = newUsername;
    localStorage.setItem('userData', JSON.stringify(userData));

    // Close the modal
    closeEditProfileModal();

    // Show success message
    showSuccessMessage('Profile updated successfully!');
}

// Initialize profile data on page load
function initializeProfile() {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    if (userData.name) {
        document.getElementById('userName').textContent = userData.name;
    }
    if (userData.username) {
        document.getElementById('userUsername').textContent = `@${userData.username}`;
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function () {
    // ... existing event listeners ...

    // Profile modal event listeners
    const editProfileModal = document.getElementById('editProfileModal');
    if (editProfileModal) {
        editProfileModal.addEventListener('click', function (event) {
            if (event.target === editProfileModal) {
                closeEditProfileModal();
            }
        });
    }

    // Initialize profile
    initializeProfile();
});
