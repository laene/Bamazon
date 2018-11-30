var mysql = require("mysql");
var inquirer = require("inquirer");

//Could use to make table prettier, but haven't done so yet.
var table = require("console.table");
var colors = require("colors");

//Global Variables 
var productsTable;
var userPurchase;
var userAmount;
var userCost = 0;
//Could use to track customer's purchases, but haven't done so yet.
var userCart = {};

//Connection Info
var connection = mysql.createConnection({
  host: "localhost",

  port: 8889,

  user: "root",

  password: "root",

  database: "bamazon"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  listProducts();
});


//Make Table in Console
function listProducts() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    console.log("\nAll Products\n");
    var products = [];
    for (var i = 0; i < res.length; i++) {
      products.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
    }
    var headings = ["Item ID", "Product", "Department", "Price $", "In Stock"];
    console.table(headings, products);
    productsTable = res;
    askQuestion();
  });
}

//Take in CUSTOMER input
function askQuestion() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "How can I help you today?",
        choices: ["Make a Purchase", "Check Cart", "Check Out", "Leave Store"],
        name: "command"
      }
    ]).then(function (response) {
      if (response.command === "Make a Purchase") {
        inquirer
          .prompt([{
            type: "input",
            message: "What is the ID of the product you would like to buy?",
            name: "product_id"
          },
          ]).then(function (response) {
            userPurchase = response.product_id;
            inquirer
              .prompt([
                {
                  type: "input",
                  message: "How many " + productsTable[userPurchase-1].product_name + " would you like to buy?",
                  name: "product_quantity"
                }
              ]).then(function (response) {
                console.log("You are purchasing " + response.product_quantity + " " + productsTable[response.product_quantity - 1].product_name + ".");
                userAmount = response.product_quantity;
                userCost = userCost + (userAmount * productsTable[userPurchase - 1].price);
                if (userAmount <= productsTable[userPurchase - 1].stock_quantity) {
                  let newStock = productsTable[userPurchase - 1].stock_quantity - userAmount;
                  connection.query("UPDATE products SET stock_quantity = " + newStock + " WHERE item_id = " + userPurchase, function (err, res) {
                    if (err) throw err;
                    listProducts();
                  });
                  console.log("Thank you for shopping with us! Your total is currently $" + userCost);
                } else {
                  console.log("We do not have enough in stock. Please contact our office for a special order. Goodbye!")
                  askQuestion();
                }
              })
          })
      } else if (response.command === "Check Cart") {
        //Insert code for array and console logging cart
        connection.end();
      } else if (response.command === "Check Out") {
        console.log("Your total is $" + userCost);
        connection.end();
      }
       else {
        userCart = {};
        console.log("Have a nice day!");
        console.log("Your cart has been emptied.");
        //add in code to replace inventory for items in cart but not actually purchased.
        connection.end();
      }

    })
}