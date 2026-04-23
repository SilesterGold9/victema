const budgetData = {
    income: 100000,
    categories: {
        tuition: { name: 'TUITION', budget: 54500, spent: 0 },
        transport: { name: 'TRANSPORT', budget: 8000, spent: 0 },
        data: { name: 'DATA', budget: 3500, spent: 0 },
        food: { name: 'FOOD', budget: 10000, spent: 0 },
        personal: { name: 'PERSONAL CARE', budget: 4400, spent: 0 }
    },
    savings: {
        academic: { name: 'ACADEMIC', budget: 8000, spent: 0 },
        contingency: { name: 'CONTINGENCY', budget: 6600, spent: 0 },
        lifestyle: { name: 'LIFESTYLE', budget: 5000, spent: 0 }
    },
    transactionHistory: [],
    cycleStart: new Date(),
    cycleEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
};

function init() {
    setupCycleDates();
    renderAllocationVault();
    renderSavingsPillars();
    setupEventListeners();
    updateDisplay();
}

function setupCycleDates() {
    document.getElementById('cycle-start').textContent = budgetData.cycleStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('cycle-end').textContent = budgetData.cycleEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    updateRemainingDays();
}

function updateRemainingDays() {
    const today = new Date();
    const end = budgetData.cycleEnd;
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    document.getElementById('remaining-days').textContent = diffDays > 0 ? diffDays : 0;
}

function renderAllocationVault() {
    const grid = document.getElementById('vault-grid');
    grid.innerHTML = '';

    Object.entries(budgetData.categories).forEach(([key, cat]) => {
        const remaining = cat.budget - cat.spent;
        const percentSpent = Math.min((cat.spent / cat.budget) * 100, 100);
        const isExceeded = remaining < 0;
        const isWarning = remaining > 0 && remaining < cat.budget * 0.2;

        let progressClass = '';
        if (isExceeded) progressClass = 'progress-fill--danger';
        else if (isWarning) progressClass = 'progress-fill--warning';

        const div = document.createElement('div');
        div.className = `vault-category${isExceeded ? ' vault-category--exceeded' : ''}`;
        div.id = `vault-${key}`;
        div.innerHTML = `
            <div class="category-name">${cat.name}</div>
            <div class="category-budget">BUDGET: ${cat.budget.toLocaleString()} KZS</div>
            <div class="category-balance${remaining < 0 ? ' category-balance--low' : ''}">${Math.abs(remaining).toLocaleString()} KZS</div>
            <div class="progress-bar">
                <div class="progress-fill ${progressClass}" style="width: ${percentSpent}%"></div>
            </div>
            <div class="category-progress-text">${cat.spent.toLocaleString()} / ${cat.budget.toLocaleString()} SPENT</div>
        `;
        grid.appendChild(div);
    });
}

function renderSavingsPillars() {
    const grid = document.getElementById('pillars-grid');
    grid.innerHTML = '';

    Object.entries(budgetData.savings).forEach(([key, pillar]) => {
        const remaining = pillar.budget - pillar.spent;
        const percentFunded = Math.min((pillar.spent / pillar.budget) * 100, 100);
        const isComplete = remaining <= 0;

        let progressClass = 'pillar-progress-fill';
        if (isComplete) progressClass += ' pillar-progress-fill--complete';

        const div = document.createElement('div');
        div.className = 'pillar-widget';
        div.id = `pillar-${key}`;
        div.innerHTML = `
            <div class="pillar-header">
                <div class="pillar-name">${pillar.name}</div>
                <div class="pillar-target">TARGET: ${pillar.budget.toLocaleString()} KZS</div>
            </div>
            <div class="pillar-balance">${remaining.toLocaleString()} <span>KZS LEFT</span></div>
            <div class="pillar-progress">
                <div class="${progressClass}" style="width: ${percentFunded}%"></div>
            </div>
            <div class="pillar-percentage">${percentFunded.toFixed(1)}% FUNDED</div>
        `;
        grid.appendChild(div);
    });
}

function updateDisplay() {
    let totalSpent = 0;
    Object.values(budgetData.categories).forEach(cat => totalSpent += cat.spent);
    
    const totalRemaining = budgetData.income - totalSpent;
    
    document.getElementById('total-remaining').textContent = totalRemaining.toLocaleString();
    document.getElementById('total-remaining').style.color = totalRemaining > 0 ? '#FF6600' : '#FF0000';
    
    updateRemainingDays();
    renderAllocationVault();
    renderSavingsPillars();
}

function setupEventListeners() {
    const btn = document.getElementById('log-expense-btn');
    const input = document.getElementById('amount-input');
    
    btn.addEventListener('click', logExpense);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') logExpense();
    });
}

function logExpense() {
    const amountInput = document.getElementById('amount-input');
    const categorySelect = document.getElementById('category-select');
    const alertContainer = document.getElementById('alert-container');
    
    const amount = parseInt(amountInput.value);
    const category = categorySelect.value;
    
    alertContainer.innerHTML = '';
    
    if (!amount || amount <= 0) {
        showAlert('ENTER A VALID AMOUNT', 'error');
        return;
    }
    
    const cat = budgetData.categories[category];
    
    if (amount > cat.budget - cat.spent) {
        showAlert(`WARNING: EXCEEDED BUDGET LIMIT FOR ${cat.name}!`, 'error');
    }
    
    cat.spent += amount;
    
    const entry = {
        date: new Date().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        category: cat.name,
        amount: amount
    };
    
    budgetData.transactionHistory.unshift(entry);
    
    renderTransactionLog();
    
    amountInput.value = '';
    amountInput.focus();
    
    showAlert(`EXPENSE LOGGED: ${amount.toLocaleString()} KZS → ${cat.name}`, 'success');
    
    updateDisplay();
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container');
    const div = document.createElement('div');
    div.className = `alert alert--${type}`;
    div.textContent = message;
    alertContainer.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, 3000);
}

function renderTransactionLog() {
    const container = document.getElementById('log-container');
    
    if (budgetData.transactionHistory.length === 0) {
        container.innerHTML = '<div class="log-empty">NO TRANSACTIONS LOGGED YET</div>';
        return;
    }
    
    container.innerHTML = budgetData.transactionHistory.map(entry => `
        <div class="log-entry">
            <div class="log-date">${entry.date}</div>
            <div class="log-category">${entry.category}</div>
            <div class="log-amount">${entry.amount.toLocaleString()} KZS</div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', init);