// Example data for expenses
const expenses = [
  {
    icon: '🚗',
    title: 'Uber rides',
    category: 'Auto',
    amount: 450.00,
    paidBy: 'John Doe',
    sharedWith: ['Alice Johnson', 'Bob Smith', 'Carol White'],
    date: '6/15/2024'
  },
  {
    icon: '🥐',
    title: 'Breakfast pastries',
    category: 'Bakery',
    amount: 85.50,
    paidBy: 'Alice Johnson',
    sharedWith: ['Alice Johnson', 'Bob Smith'],
    date: '6/16/2024'
  },
  {
    icon: '🍽️',
    title: 'Dinner at Italian place',
    category: 'Restaurant',
    amount: 715.00,
    paidBy: 'Bob Smith',
    sharedWith: ['Alice Johnson', 'Bob Smith', 'Carol White'],
    date: '6/16/2024'
  }
];

function renderExpenses() {
  const container = document.getElementById('expenses-list');
  container.innerHTML = '';
  expenses.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'expense-card';
    card.innerHTML = `
        <div class="expense-icon">${exp.icon}</div>
        <div class="expense-details">
          <div class="expense-title">${exp.title} <span class="expense-amount">$${exp.amount.toFixed(2)}</span></div>
          <div class="expense-category">${exp.category}</div>
          <div class="expense-meta">Paid by ${exp.paidBy}</div>
          <div class="expense-meta">Shared with: ${exp.sharedWith.join(', ')}</div>
          <div class="expense-meta">Date: ${exp.date}</div>
        </div>
      `;
    container.appendChild(card);
  });
}

function addFriend() {
  alert('Add Friends functionality coming soon!');
}
function addExpense() {
  alert('Add Expense functionality coming soon!');
}

(function () {
  // Global variables
  let tripMembers = [
    { id: 1, name: 'John Doe', avatar: 'JD' },
    { id: 2, name: 'Jane Smith', avatar: 'JS' },
    { id: 3, name: 'Mike Johnson', avatar: 'MJ' }
  ];
  let expenses = [];
  let paymentConfirmations = [];

  // Load trip data when page loads
  document.addEventListener('DOMContentLoaded', () => {
    const tripData = JSON.parse(localStorage.getItem('currentTrip'));
    if (!tripData) {
      window.location.href = 'dashboard.html';
      return;
    }

    // Update page title
    document.title = `Trip Details - ${tripData.name}`;

    // Update main heading
    document.querySelector('h1').textContent = tripData.name;

    // Update trip summary section
    const summarySection = document.querySelector('.trip-summary');
    summarySection.innerHTML = `
            <div>
                <span>📍</span>
                <div>
                    <div class="label">Destination</div>
                    <div class="value">${tripData.location}</div>
                </div>
            </div>
            <div>
                <span>📅</span>
                <div>
                    <div class="label">Duration</div>
                    <div class="value">${tripData.dates}</div>
                </div>
            </div>
            <div>
                <span>👥</span>
                <div>
                    <div class="label">Participants</div>
                    <div class="value">${tripData.members}</div>
                </div>
            </div>
            <div>
                <span>💰</span>
                <div>
                    <div class="label">Total Spent</div>
                    <div class="value total-spent">${tripData.totalAmount}</div>
                </div>
            </div>
        `;

    // Initialize trip members
    initializeTripMembers();

    // Load existing expenses
    loadExpenses();

    // Load saved trip members
    loadTripMembers();

    // Load payment confirmations
    loadPaymentConfirmations();
  });

  function initializeTripMembers() {
    // Populate the "Paid by" dropdown
    const paidBySelect = document.getElementById('expensePaidBy');
    paidBySelect.innerHTML = '<option value="">Select who paid</option>' +
      tripMembers.map(member =>
        `<option value="${member.id}">${member.name}</option>`
      ).join('');

    // Populate the split members checkboxes
    const splitMembersDiv = document.getElementById('splitMembers');
    splitMembersDiv.innerHTML = tripMembers.map(member => `
            <label class="member-checkbox">
                <input type="checkbox" name="splitMembers" value="${member.id}" checked>
                ${member.name}
            </label>
        `).join('');
  }

  // Make functions available globally
  window.addExpense = function () {
    document.getElementById('expenseModal').style.display = 'block';
    // Set default date to today
    document.getElementById('expenseDate').valueAsDate = new Date();
  };

  window.closeExpenseModal = function () {
    document.getElementById('expenseModal').style.display = 'none';
    document.getElementById('expenseForm').reset();
  };

  window.handleAddExpense = function (event) {
    event.preventDefault();

    const expense = {
      id: Date.now(), // Simple unique ID
      title: document.getElementById('expenseTitle').value,
      amount: parseFloat(document.getElementById('expenseAmount').value),
      category: document.getElementById('expenseCategory').value,
      date: document.getElementById('expenseDate').value,
      paidBy: parseInt(document.getElementById('expensePaidBy').value),
      splitBetween: Array.from(document.querySelectorAll('input[name="splitMembers"]:checked'))
        .map(checkbox => parseInt(checkbox.value))
    };

    // Add to expenses array
    expenses.push(expense);

    // Save to localStorage (in a real app, this would be saved to a backend)
    localStorage.setItem(`expenses_${JSON.parse(localStorage.getItem('currentTrip')).name}`, JSON.stringify(expenses));

    // Update UI
    renderExpenses();
    updateTotalSpent();

    // Close modal and reset form
    closeExpenseModal();
  };

  // Friend management functions
  window.addFriend = function () {
    document.getElementById('friendModal').style.display = 'block';
  };

  window.closeFriendModal = function () {
    document.getElementById('friendModal').style.display = 'none';
    document.getElementById('friendForm').reset();
  };

  window.handleAddFriend = function (event) {
    event.preventDefault();

    const newFriend = {
      id: Date.now(), // Simple unique ID
      name: document.getElementById('friendName').value,
      email: document.getElementById('friendEmail').value,
      avatar: document.getElementById('friendInitials').value.toUpperCase()
    };

    // Add to trip members array
    tripMembers.push(newFriend);

    // Save to localStorage
    localStorage.setItem(`members_${JSON.parse(localStorage.getItem('currentTrip')).name}`, JSON.stringify(tripMembers));

    // Update UI
    initializeTripMembers();
    updateTripMembersCount();

    // Close modal and reset form
    closeFriendModal();
  };

  function loadTripMembers() {
    const savedMembers = localStorage.getItem(`members_${JSON.parse(localStorage.getItem('currentTrip')).name}`);
    if (savedMembers) {
      tripMembers = JSON.parse(savedMembers);
      initializeTripMembers();
      updateTripMembersCount();
    }
  }

  function updateTripMembersCount() {
    const membersCount = tripMembers.length;
    document.querySelector('.trip-summary .value:nth-of-type(3)').textContent = `${membersCount} people`;
  }

  function loadExpenses() {
    const savedExpenses = localStorage.getItem(`expenses_${JSON.parse(localStorage.getItem('currentTrip')).name}`);
    if (savedExpenses) {
      expenses = JSON.parse(savedExpenses);
      renderExpenses();
    }
  }

  function renderExpenses() {
    const expensesList = document.getElementById('expenses-list');
    if (!expenses || expenses.length === 0) {
      expensesList.innerHTML = '<p class="no-expenses">No expenses added yet. Click "Add Expense" to get started!</p>';
      return;
    }

    expensesList.innerHTML = expenses.map(expense => {
      const paidBy = tripMembers.find(m => m.id === expense.paidBy);
      const splitCount = expense.splitBetween.length;
      const amountPerPerson = (expense.amount / splitCount).toFixed(2);

      return `
                <div class="expense-item">
                    <div class="expense-info">
                        <div class="expense-title">
                            ${expense.title}
                            <span class="expense-category category-${expense.category}">${expense.category}</span>
                        </div>
                        <div class="expense-meta">
                            Paid by ${paidBy.name} • Split between ${splitCount} people ($${amountPerPerson} each)
                        </div>
                    </div>
                    <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                </div>
            `;
    }).join('');
  }

  function updateTotalSpent() {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.querySelector('.total-spent').textContent = `$${total.toFixed(2)}`;
  }

  // Close modal when clicking outside
  window.onclick = function (event) {
    if (event.target.className === 'modal') {
      event.target.style.display = 'none';
    }
  };

  // Payment Confirmation Functions
  window.markAsPaid = function (button) {
    const friendId = button.getAttribute('data-friend-id');
    const friendElement = button.closest('.friend-owe');
    const amount = friendElement.querySelector('.owe-label').textContent.match(/\$[\d.]+/)[0];

    // Set the friend ID and amount in the hidden inputs
    document.getElementById('confirmationFriendId').value = friendId;
    document.getElementById('confirmationAmount').value = amount;

    // Show the confirmation modal
    document.getElementById('confirmationModal').style.display = 'block';
  };

  window.closeConfirmationModal = function () {
    document.getElementById('confirmationModal').style.display = 'none';
    document.getElementById('confirmationForm').reset();
  };

  window.handleConfirmation = function (event) {
    event.preventDefault();

    const friendId = document.getElementById('confirmationFriendId').value;
    const amount = document.getElementById('confirmationAmount').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const note = document.getElementById('confirmationNote').value;

    const confirmation = {
      id: Date.now(),
      friendId: parseInt(friendId),
      amount: amount,
      paymentMethod: paymentMethod,
      note: note,
      status: 'pending',
      date: new Date().toISOString()
    };

    // Add to confirmations array
    paymentConfirmations.push(confirmation);

    // Save to localStorage
    localStorage.setItem(`confirmations_${JSON.parse(localStorage.getItem('currentTrip')).name}`,
      JSON.stringify(paymentConfirmations));

    // Update UI
    renderPaymentConfirmations();
    updatePaymentButton(friendId);

    // Close modal and reset form
    closeConfirmationModal();
  };

  function loadPaymentConfirmations() {
    const savedConfirmations = localStorage.getItem(`confirmations_${JSON.parse(localStorage.getItem('currentTrip')).name}`);
    if (savedConfirmations) {
      paymentConfirmations = JSON.parse(savedConfirmations);
      renderPaymentConfirmations();
    }
  }

  function renderPaymentConfirmations() {
    const confirmationsList = document.getElementById('confirmations-list');
    if (!paymentConfirmations || paymentConfirmations.length === 0) {
      confirmationsList.innerHTML = '<p class="no-confirmations">No payment confirmations yet.</p>';
      return;
    }

    confirmationsList.innerHTML = paymentConfirmations.map(confirmation => {
      const friend = tripMembers.find(m => m.id === confirmation.friendId);
      const date = new Date(confirmation.date).toLocaleDateString();

      return `
        <div class="confirmation-item">
          <div class="confirmation-info">
            <div class="confirmation-title">
              Payment to ${friend.name}
              <span class="confirmation-status status-${confirmation.status}">${confirmation.status}</span>
            </div>
            <div class="confirmation-meta">
              ${confirmation.amount} via ${confirmation.paymentMethod} • ${date}
              ${confirmation.note ? `<br>Note: ${confirmation.note}` : ''}
            </div>
          </div>
          ${confirmation.status === 'pending' ? `
            <div class="confirmation-actions">
              <button class="btn-secondary" onclick="confirmPayment(${confirmation.id})">Accept</button>
              <button class="btn-secondary" onclick="rejectPayment(${confirmation.id})">Reject</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  function updatePaymentButton(friendId) {
    const button = document.querySelector(`button[data-friend-id="${friendId}"]`);
    if (button) {
      button.textContent = 'Confirmation Sent';
      button.classList.add('confirmed');
      button.disabled = true;
    }
  }

  window.confirmPayment = function (confirmationId) {
    const confirmation = paymentConfirmations.find(c => c.id === confirmationId);
    if (confirmation) {
      confirmation.status = 'confirmed';
      localStorage.setItem(`confirmations_${JSON.parse(localStorage.getItem('currentTrip')).name}`,
        JSON.stringify(paymentConfirmations));
      renderPaymentConfirmations();
    }
  };

  window.rejectPayment = function (confirmationId) {
    const confirmation = paymentConfirmations.find(c => c.id === confirmationId);
    if (confirmation) {
      confirmation.status = 'rejected';
      localStorage.setItem(`confirmations_${JSON.parse(localStorage.getItem('currentTrip')).name}`,
        JSON.stringify(paymentConfirmations));
      renderPaymentConfirmations();
    }
  };
})();