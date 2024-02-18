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

addTransactionBtnEl.addEventListener("click", function () {
  let transactionInput = inputFieldEl.value;

  push(transactionInDB, {
    description: transactionInput,
    amount: 0, // You may need to add an amount field to your input form
    type: "Expense", // Set default type to Expense, modify based on your UI
    date: new Date().toString(), // Set the date to the current date
  });

  console.log(transactionInput);
});
