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

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  listProducts();
});

var productsTable; 

function listProducts() {
        connection.query("SELECT * FROM products", function(err, res) {
            if (err) throw err;

            console.log("\nAll Products\n");
            // var products = [
            //   ["James", "blue"],
            //   ["elena", "purple"]
            // ];
            // for (let i = 0; i < res.length; i++) {
            //     products.push([res[i].item_id, res[i].product_name, res[i].department_name,res[i].price, res[i].stock_quantity])
            // };
            // // var headings = ["Item ID", "Product", "Department", "Price", "Quantity"];
            // var headings = ["Names", "fav color"];
            // console.table(products, headings);
            console.table(res);
            productsTable = res;
            connection.end();
            askQuestion1();
          });
}

function askQuestion1() {
  inquirer
  .prompt([
    {
      type: "input",
      message: "What is the ID of the product you would like to buy?",
      name: "product_id"
    },
    {
      type: "input",
      message: "How many would you like to buy?",
      name: "product_quantity"
    }
  ]).then(function(response){
    console.log("You are purchasing " + response.product_quantity + " " + productsTable[response.product_quantity-1].product_name);
    let userPurchase = response.product_id;
    let userAmount = response.product_quantity;
    if (userAmount < productsTable[userPurchase - 1].stock_quantity) {
      console.log("OK!");
    }
  })
}