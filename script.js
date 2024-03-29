// Define your Firebase Realtime Database URL
const databaseURL =
  "https://expense-tracker-9c5fb-default-rtdb.firebaseio.com/";
let transactions = [];

const inputFieldEl = document.getElementById("inputTitle");
const inputAmountEl = document.getElementById("inputAmount");

const listEl = document.getElementById("list");
const balanceAmtEl = document.getElementById("balanceAmountSect");
const incomeAmtEl = document.getElementById("incomeAmountSect");
const expenseAmtEl = document.getElementById("expenseAmountSect");
const amountTypeEl = document.getElementById("amountType");
const addTransactionBtnEl = document.getElementById("transaction-btn");

let income = 0;
let expense = 0;
let balance = 0;

// Function to show transactions on the UI
const showItem = (transactions, isNewTransaction = false) => {
  console.log("Showing items:", transactions);

  // Clear the list before appending the filtered transactions
  if (!isNewTransaction) {
    listEl.innerHTML = "";
  }

  transactions
    .filter((transaction) => !transaction.deleted)
    .forEach((transaction) => {
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
        <span class="amt">${amt}</span>
        <button class="btnDelete" onClick="deleteItem(${id})">X</button>
      `;

      // Append the list item to the transaction history list
      listEl.appendChild(listItem);

      // Add event listener to the delete button
      const deleteBtn = listItem.querySelector(".btnDelete");
      deleteBtn.addEventListener("click", () => deleteItem(id));
    });

  // Recalculate and update the balance after rendering the transactions
  calculateValue(transactions);
};

const updateBalance = () => {
  console.log("Showing items:", transactions);
  // Assuming you have defined elements like balanceAmtEl, incomeAmtEl, and expenseAmtEl
  balanceAmtEl.innerHTML = `₦ ${balance.toFixed(2)}`; // Display balance with two decimal places
  incomeAmtEl.innerHTML = `₦ ${income.toFixed(2)}`;
  expenseAmtEl.innerHTML = `₦ ${expense.toFixed(2)}`;
};

const calculateValue = (transactions) => {
  console.log("Calculating values:", transactions);
  // Initialize arrays to store income and expense amounts
  const incomeArray = [];
  const expenseArray = [];

  // Map through transactions and categorize amounts into incomeArray or expenseArray
  transactions.map((value) => {
    const number = Number(value.amount);
    if (!isNaN(number)) {
      if (value.amountType === "Income") {
        incomeArray.push(number);
      } else if (value.amountType === "Expense") {
        expenseArray.push(number);
      }
    }
  });

  // Calculate total income, total expense, and overall balance
  income = incomeArray.reduce((prev, val) => prev + val, 0);
  expense = expenseArray.reduce((prev, val) => prev + val, 0);
  balance = income - expense;

  updateBalance();
};

// Function to make a POST request to add a new transaction
const addTransaction = async (transactionData) => {
  try {
    // Validation: Check if the description and amount are provided
    if (!transactionData.description || !transactionData.amount) {
      throw new Error(
        "Please provide both description and amount for the transaction."
      );
    }

    const response = await fetch(`${databaseURL}/transaction.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      throw new Error("Failed to add transaction");
    }

    const responseData = await response.json();

    // Update the local transactions array only after a successful response
    const newTransaction = { ...transactionData, id: responseData.name };
    transactions.push(newTransaction);

    // Show the updated transactions on the UI
    showItem([newTransaction], true); // Pass true to clear the list before appending

    // Calculate and update the balance after adding a new transaction
    calculateValue(transactions);

    return responseData.name; // The unique ID generated by Firebase
  } catch (error) {
    console.error("Error adding transaction:", error.message);
  }
};

const getTransactions = async () => {
  try {
    const response = await fetch(`${databaseURL}/transaction.json`);

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const responseData = await response.json();

    // Filter out deleted transactions during initialization
    const filteredTransactions = responseData
      ? Object.values(responseData).filter(
          (transaction) => !transaction.deleted
        )
      : [];

    // Update the local transactions array
    transactions = filteredTransactions;

    return filteredTransactions;
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    return [];
  }
};

// Function to initialize the application with a Firebase listener
const init = async () => {
  console.log("Initializing...");

  try {
    // Attach a listener to the databaseURL/transaction.json
    const databaseRef = firebase.database().ref("transaction");
    databaseRef.on("value", (snapshot) => {
      // Update the local transactions array with the latest data from Firebase
      transactions = snapshot.val() ? Object.values(snapshot.val()) : [];

      // Remove deleted transactions from the local array
      transactions = transactions.filter((transaction) => !transaction.deleted);

      // Show existing transactions on the UI
      showItem(transactions, true); // Pass true to clear the list before appending

      // Calculate and update the balance based on existing transactions
      calculateValue(transactions);
    });
  } catch (error) {
    console.error("Initialization error:", error.message);
  }
};
// Function to delete a transaction
const deleteItem = async (id) => {
  try {
    // Make the DELETE request to remove the transaction from the database
    const response = await fetch(`${databaseURL}/transaction/${id}.json`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete transaction");
    }

    // Remove the transaction from the local transactions array
    transactions = transactions.filter((transaction) => transaction.id !== id);

    // Show the updated transactions on the UI
    showItem(transactions);

    // Recalculate and update the balance after deleting the transaction
    calculateValue(transactions);
  } catch (error) {
    console.error("Error deleting transaction:", error.message);
  }
};
// Event listener for the "Add transaction" button
addTransactionBtnEl.addEventListener("click", async (event) => {
  console.log("Add transaction button clicked.");

  event.preventDefault();

  try {
    // Prepare transaction data
    const transactionInput = inputFieldEl.value;
    const amountInput = inputAmountEl.value;
    const amountType = amountTypeEl.value;
    const date = new Date();
    const currentDate = `${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}`;

    const newTransaction = {
      id: Date.now(),
      date: currentDate,
      description: transactionInput,
      amount: amountInput,
      amountType,
    };

    // Add the new transaction to the database and update the UI
    await addTransaction(newTransaction);

    // Clear input fields
    inputFieldEl.value = "";
    inputAmountEl.value = "";
  } catch (error) {
    console.error("Error adding transaction:", error.message);
  }
});
// Initialize the application
init();
