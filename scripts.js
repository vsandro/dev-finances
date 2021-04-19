const Modal = {
  toggle() {
    document.querySelector('.modal-overlay').classList.toggle('active');
  },
};

const Storage = {
  name: 'dev.finances:transactions',

  get() {
    return JSON.parse(localStorage.getItem(Storage.name)) || [];
  },

  set(transactions) {
    localStorage.setItem(Storage.name, JSON.stringify(transactions));
  },
};

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },

  incomes() {
    let incomes = 0;
    Transaction.all.map(item => {
      item.amount > 0 ? (incomes += item.amount) : null;
    });
    return incomes;
  },

  expenses() {
    let expenses = 0;
    Transaction.all.map(item => {
      item.amount < 0 ? (expenses += item.amount) : null;
    });
    return expenses;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  },
};

const DOM = {
  transactionContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSClass = transaction.amount > 0 ? 'income' : 'expense';
    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
    <tr>
      <td class="description">${transaction.description}</td>
      <td class=${CSSClass}>${amount}</td>
      <td class="date">${transaction.date}</td>
      <td><img class="remove-transaction" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" /></td>
    </tr>
    `;
    return html;
  },

  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionContainer.innerHTML = '';
  },
};

const Utils = {
  formatAmount(amount) {
    amount = Number(amount) * 100;
    return amount;
  },

  formatDate(date) {
    const splittedDate = date.split('-');
    date = `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    return date;
  },

  formatCurrency(currency) {
    const signal = Number(currency) < 0 ? '-' : '';

    currency = String(currency).replace(/\D/g, '');

    currency = Number(currency) / 100;

    currency = currency.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return signal + currency;
  },
};

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateInputs() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Por favor, preencha todos os campos');
    }
  },

  formatInputs() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return { description, amount, date };
  },

  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  clearInputs() {
    Form.description.value = '';
    Form.amount.value = '';
    Form.date.value = '';
  },

  submit(event) {
    event.preventDefault();

    try {
      Form.validateInputs();

      const transaction = Form.formatInputs();

      Form.saveTransaction(transaction);

      Form.clearInputs();

      Modal.toggle();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.map(item => DOM.addTransaction(item));

    // rendering
    DOM.updateBalance();

    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
