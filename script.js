import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
const appSettings = {
  databaseURL: "https://expense-tracker-9c5fb-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const transactionInDB = ref(database, "transaction");

const inputFieldEl = document.getElementById("inputTitle");
const inputAmountEl = document.getElementById("inputAmount");
const addTransactionBtnEl = document.getElementById("transaction-btn");
const amountTypeEl = document.getElementById("amountType");
const listEl = document.getElementById("list");

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

  push(transactionInDB, {
    id: Date.now(),
    date: currentDate,
    description: transactionInput,
    amount: amountInput,
    amountType, // You may need to add an amount field to your input form
  });

  inputFieldEl.value = "";
  inputAmountEl.value = "";
});
