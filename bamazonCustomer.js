var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 8889,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  listProducts();
});

var productsTable;

function listProducts() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;

    console.log("\nAll Products\n");
    console.table(res);
    productsTable = res;
    askQuestion();
  });
}


function askQuestion() {
  inquirer
    .prompt([
      {
        type: "confirm",
        message: "Do you want to make a purchase?",
        name: "confirm"
      }
    ]).then(function (response) {
      if (response.confirm === true) {
        inquirer
          .prompt([{
            type: "input",
            message: "What is the ID of the product you would like to buy?",
            name: "product_id"
          },
          {
            type: "input",
            message: "How many would you like to buy?",
            name: "product_quantity"
          }
        ]).then(function (response) {
          console.log("You are purchasing " + response.product_quantity + " " + productsTable[response.product_quantity - 1].product_name);
          let userPurchase = response.product_id;
          let userAmount = response.product_quantity;
          if (userAmount <= productsTable[userPurchase - 1].stock_quantity) {
            console.log("OK!");
            let newStock = productsTable[userPurchase - 1].stock_quantity - userAmount;
            connection.query("UPDATE products SET stock_quantity = " + newStock + " WHERE item_id = " + userPurchase, function (err, res) {
              if (err) throw err;
              listProducts();
            })
          } else {
            console.log("We do not have enough in stock. Please contact our office for a special order. Goodbye!")
            connection.end();
          }
        })
      } else {
        console.log("Have a nice day!");              
        connection.end();
      }

    })
}