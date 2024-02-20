import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
const appSettings = {
  databaseURL: "https://expense-tracker-9c5fb-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const transactionInDB = ref(database, "transaction");

const balanceAmtEl = document.getElementById("balanceAmount");
const incomeAmtEl = document.getElementById("incomeAmount");
const expenseAmtEl = document.getElementById("expenseAmount");

const inputFieldEl = document.getElementById("inputTitle");
const inputAmountEl = document.getElementById("inputAmount");
const addTransactionBtnEl = document.getElementById("transaction-btn");
const amountTypeEl = document.getElementById("amountType");
const listEl = document.getElementById("list");
let transactions = [];

let income = 0;
let expense = 0;
let balance = 0;

const showItem = (transactions) => {
  transactions.map((transaction) => {
    const { id, date, description, amount, amountType } = transaction;
    let amt = "";
    const listItem = document.createElement("li");

    // Check the type of transaction (Income or Expense)
    if (amountType === "Income") {
      listItem.className = "income"; // Set class to "income" for styling
      amt = `${amount}`; // Set the amount for display
    } else {
      listItem.className = "expense"; // Set class to "expense" for styling
      amt = `- ${amount}`; // Set the amount with a '-' sign for display
    }

    // Update the list item's HTML content
    listItem.innerHTML = `
      <span class="date">${date}</span>
      <span class="descriptionInput">${description}</span>
      <span class="amt">${amount}</span>
      <button class="btnDelete" onClick="deleteItem(${id})">X</button>
    `;

    // Append the list item to the transaction history list
    listEl.appendChild(listItem);
  });
};

const updateBalance = () => {
  // Assuming you have defined elements like balanceAmtEl, incomeAmtEl, and expenseAmtEl
  balanceAmtEl.innerHTML = `₹ ${balance.toFixed(2)}`; // Display balance with two decimal places
  incomeAmtEl.innerHTML = `₹ ${income.toFixed(2)}`;
  expenseAmtEl.innerHTML = `₹ ${expense.toFixed(2)}`;
};

const calculateValue = (transactions) => {
  // Initialize arrays to store income and expense amounts
  const incomeArray = [];
  const expenseArray = [];

  // Map through transactions and categorize amounts into incomeArray or expenseArray
  transactions.map((value) => {
    const number = Number(value.amount);
    value.amountType === "Income"
      ? incomeArray.push(number)
      : expenseArray.push(number);
  });

  // Calculate total income, total expense, and overall balance
  income = incomeArray.reduce((prev, val) => prev + val, 0);
  expense = expenseArray.reduce((prev, val) => prev + val, 0);
  balance = income - expense;

  // Update the display with new values
  updateBalance();
};

const init = () => {
  onValue(ref(transactionInDB), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      transactions = data ? Object.values(data) : [];
      showItem(transactions);
      calculateValue(transactions);
    }
  });
};

addTransactionBtnEl.addEventListener("click", function (event) {
  if (
    !inputFieldEl ||
    !inputAmountEl ||
    !addTransactionBtnEl ||
    !amountTypeEl
  ) {
    console.error("One or more input elements not found.");
    return;
  }

  event.preventDefault();

  let transactionInput = inputFieldEl.value;
  let amountInput = inputAmountEl.value;
  let amountType = amountTypeEl.value;
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  const currentDate = `${day}-${month}-${year}`;
  console.log(currentDate);

  // Using .then() to handle the asynchronous nature of push
  push(transactionInDB, {
    id: Date.now(),
    date: currentDate,
    description: transactionInput,
    amount: amountInput,
    amountType, // You may need to add an amount field to your input form
  }).then(() => {
    // Update the balance after adding a new transaction
    calculateValue(transactions);

    inputFieldEl.value = "";
    inputAmountEl.value = "";
  });
});

init();
