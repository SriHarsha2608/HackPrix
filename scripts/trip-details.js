// --- Imports ---
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, getDoc, collection, addDoc, getDocs, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// --- Global Variables ---
let currentUser = null;
let tripData = null;
let tripMembers = []; // Will store member data {id, name, ...}
const tripId = localStorage.getItem('currentTripId');

// --- Auth Guard and Initial Load ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        if (!tripId) {
            alert("No trip selected!");
            window.location.href = 'dashboard.html';
            return;
        }
        loadTripDetails();
    } else {
        window.location.href = 'login.html';
    }
});

async function loadTripDetails() {
    const tripDocRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripDocRef);

    if (!tripDoc.exists()) {
        alert("Trip not found!");
        window.location.href = 'dashboard.html';
        return;
    }

    tripData = tripDoc.data();

    // Client-side security check
    if (!tripData.members.includes(currentUser.uid)) {
        alert("Access Denied: You are not a member of this trip.");
        window.location.href = 'dashboard.html';
        return;
    }

    // Populate the page with trip data
    document.querySelector('h1').textContent = tripData.name;
    const summary = document.querySelector('.trip-summary');
    summary.querySelector('.value').textContent = tripData.location; // First value
    summary.querySelectorAll('.value')[1].textContent = `${tripData.startDate} - ${tripData.endDate}`;
    summary.querySelectorAll('.value')[2].textContent = `${tripData.members.length} people`;
    
    // Fetch member details and then load expenses
    await loadTripMembers();
    loadExpenses();
}

async function loadTripMembers() {
    if (!tripData || tripData.members.length === 0) return;
    
    // Fetch documents for all member UIDs
    const membersQuery = query(collection(db, 'users'), where('uid', 'in', tripData.members));
    const membersSnapshot = await getDocs(membersQuery);
    
    tripMembers = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Now that we have members, populate the modals
    populateExpenseModalDropdowns();
}

function populateExpenseModalDropdowns() {
    const paidBySelect = document.getElementById('expensePaidBy');
    const splitMembersDiv = document.getElementById('splitMembers');
    
    paidBySelect.innerHTML = '<option value="">Select who paid</option>' + 
        tripMembers.map(member => `<option value="${member.uid}">${member.name}</option>`).join('');

    splitMembersDiv.innerHTML = tripMembers.map(member => `
        <label class="member-checkbox">
            <input type="checkbox" name="splitMembers" value="${member.uid}" checked>
            ${member.name}
        </label>
    `).join('');
}


async function loadExpenses() {
    const expensesList = document.getElementById('expenses-list');
    expensesList.innerHTML = '<p>Loading expenses...</p>';

    const expensesColRef = collection(db, 'trips', tripId, 'expenses');
    const querySnapshot = await getDocs(expensesColRef);

    expensesList.innerHTML = '';
    let totalSpent = 0;

    if (querySnapshot.empty) {
        expensesList.innerHTML = '<p>No expenses recorded for this trip yet.</p>';
        document.querySelector('.total-spent').textContent = '$0.00';
        return;
    }

    querySnapshot.forEach((doc) => {
        const expense = { id: doc.id, ...doc.data() };
        totalSpent += expense.amount;
        const expenseCard = createExpenseCard(expense);
        expensesList.appendChild(expenseCard);
    });
    
    // Update total spent in summary
    document.querySelector('.total-spent').textContent = `$${totalSpent.toFixed(2)}`;
}

function createExpenseCard(expense) {
    const card = document.createElement('div');
    card.className = 'expense-item';
    const paidByMember = tripMembers.find(m => m.uid === expense.paidBy);
    const paidByName = paidByMember ? paidByMember.name : 'A member';
    const splitCount = expense.splitBetween.length;
    const amountPerPerson = (expense.amount / splitCount).toFixed(2);

    card.innerHTML = `
        <div class="expense-info">
            <div class="expense-title">
                ${expense.title}
                <span class="expense-category category-${expense.category}">${expense.category}</span>
            </div>
            <div class="expense-meta">
                Paid by ${paidByName} • Split between ${splitCount} people ($${amountPerPerson} each)
            </div>
        </div>
        <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
    `;
    return card;
}

async function handleAddExpense(event) {
    event.preventDefault();
    const splitBetween = Array.from(document.querySelectorAll('input[name="splitMembers"]:checked')).map(cb => cb.value);
    
    if (splitBetween.length === 0) {
        alert("You must split the expense with at least one person.");
        return;
    }

    const expenseData = {
        title: document.getElementById('expenseTitle').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        date: document.getElementById('expenseDate').value,
        paidBy: document.getElementById('expensePaidBy').value,
        splitBetween: splitBetween,
        createdAt: serverTimestamp()
    };

    try {
        const expensesColRef = collection(db, 'trips', tripId, 'expenses');
        await addDoc(expensesColRef, expenseData);
        loadExpenses();
        closeExpenseModal();
    } catch (error) {
        console.error("Error adding expense:", error);
        alert("Failed to add expense.");
    }
}

// --- Event Listeners and Global Functions ---
document.getElementById('expenseForm').addEventListener('submit', handleAddExpense);

// Modal functions
window.addExpense = function() {
    document.getElementById('expenseModal').style.display = 'block';
    document.getElementById('expenseDate').valueAsDate = new Date();
};
window.closeExpenseModal = function() {
    document.getElementById('expenseModal').style.display = 'none';
    document.getElementById('expenseForm').reset();
};
window.addFriend = function() {
    // This is more complex now. You'd open a modal to invite a friend
    // which would add their UID to the trip's `members` array.
    alert('Add Friends to Trip functionality requires inviting existing platform friends.');
};