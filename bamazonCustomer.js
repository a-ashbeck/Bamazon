var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'tedward!!!',
    database: 'bamazon_db'
});

connection.connect(function(err) {
    if (err) throw err;
    new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products', function(err, res) {
            if (err) reject(err);
            resolve(res);
            console.log('Welcome to Bamazon! Here are our products:')
        });
    }).then(function(result) {
        result.forEach(function(item) {
            console.log('Item ID: ' + item.item_id + ' || Product Name: ' + item.product_name + ' || Price: ' + item.price);
        });
    }).then(function() {
        return enterStore();
    }).catch(function(err) {
        console.log(err);
    });
});

function enterStore() {
    inquirer.prompt([{
        name: 'entrance',
        message: 'Would you like to shop with us today?',
        type: 'list',
        choices: ['Yes', 'No']
    }]).then(function(answer) {
        if (answer.entrance === 'Yes') {
            menu();
        } else {
            console.log('Please come back soon! --Bamazon');
            connection.destroy();
            return;
        }
    });
}

function menu() {
    return inquirer.prompt([{
        name: 'item',
        message: 'Enter the item number of the product you would like to purchase.',
        type: 'input',
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid ID.');
                return false;
            }
        }
    }, {
        name: 'quantity',
        message: 'How many would you like to buy?',
        type: 'input',
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid quantity.');
                return false;
            }
        }
    }]).then(function(answer) {
        return new Promise(function(resolve, reject) {
            connection.query('SELECT * FROM products WHERE ?', { item_id: answer.item }, function(err, res) {
                if (err) reject(err);
                resolve(res);
            });
        }).then(function(result) {
            if (parseInt(answer.quantity) <= parseInt(result[0].stock_quantity)) {
                var savedData = {};
                savedData.answer = answer;
                savedData.result = result;
                return savedData;
            } else if (parseInt(answer.quantity) > parseInt(result[0].stock_quantity)) {
                console.log('Insufficient quantity!');
                menu();
            } else {
                console.log('An error occurred, exiting Bamazon, your order is not complete.');
            }
        }).catch(function(err) {
            console.log(err);
            connection.destroy();
        }).then(function(savedData) {
            if (savedData.answer) {
                var updatedQuantity = parseInt(savedData.result[0].stock_quantity) - parseInt(savedData.answer.quantity);
                var itemId = savedData.answer.item;
                var totalCost = parseInt(savedData.result[0].price) * parseInt(savedData.answer.quantity);
                connection.query('UPDATE products SET ? WHERE ?', [{
                    stock_quantity: updatedQuantity,
                    product_sales: totalCost
                }, {
                    item_id: itemId
                }], function(err, res) {
                    if (err) throw err;
                    console.log('Your order total cost $' + totalCost + '. Thank you for shopping with Bamazon!');
                    connection.destroy();
                });
            } else {
                console.log('An error occurred while saving the data temporarily!');
                connection.destroy();
            }
        });
    });
}
