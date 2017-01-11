var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'bamazon_db'
});

connection.connect(function(err) {
    if (err) throw err;
    new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products', function(err, res) {
            if (err) reject(err);
            resolve(res);
            console.log('Welcome manager!')
        });
    }).then(function() {
        return enterManagerApp();
    }).catch(function(err) {
        console.log(err);
    });
});

function enterManagerApp() {
    inquirer.prompt([{
        name: 'entrance',
        message: 'What would you like to do?',
        type: 'list',
        choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'EXIT']
    }]).then(function(answer) {
        switch (answer.entrance) {
            case 'View Products for Sale':
                itemsForSale();
                break;
            case 'View Low Inventory':
                lowInventory();
                break;
            case 'Add to Inventory':
                addInventory();
                break;
            case 'Add New Product':
                addProduct();
                break;
            case 'EXIT':
                console.log('Goodbye manager!');
                connection.destroy();
                return;
                break;
            default:
                enterManagerApp();
                break
        };
    });
}

function itemsForSale() {
    return new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products', function(err, res) {
            if (err) reject(err);
            resolve(res);
        });
    }).then(function(result) {
        result.forEach(function(item) {
            console.log('Item ID: ' + item.item_id + ' || Product Name: ' + item.product_name + ' || Department: ' +  item.department_name + ' || Price: ' + item.price + ' || Stock: ' + item.stock_quantity);
        });
    }).then(function() {
        enterManagerApp();
    }).catch(function(err) {
        console.log(err);
        connection.destroy();
    });
}

function lowInventory() {
    return new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products WHERE stock_quantity < 5', function(err, res) {
            if (err) reject(err);
            resolve(res);
        });
    }).then(function(result) {
        result.forEach(function(item) {
            console.log('Item ID: ' + item.item_id + ' || Product Name: ' + item.product_name + ' || Department: ' +  item.department_name + ' || Price: ' + item.price + ' || Stock: ' + item.stock_quantity);
        });
    }).then(function() {
        enterManagerApp();
    }).catch(function(err) {
        console.log(err);
        connection.destroy();
    });
}

function addInventory() {
    return inquirer.prompt([{
        name: 'item',
        message: 'Enter the item number of the product you would like to add stock to.',
        type: 'input',
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid item ID.');
                return false;
            }
        }
    }, {
        name: 'quantity',
        message: 'How much stock would you like to add?',
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
            connection.query('SELECT stock_quantity FROM products WHERE ?', {item_id: answer.item}, function(err, res) {
                if (err) reject(err);
                resolve(res);
            });
        }).then(function(result) {
            var updatedQuantity = parseInt(result[0].stock_quantity) + parseInt(answer.quantity);
            var itemId = answer.item
            connection.query('UPDATE products SET ? WHERE ?', [{
                stock_quantity: updatedQuantity
            }, {
                item_id: itemId
            }], function(err, res) {
                if (err) throw err;
                console.log('The total stock has been updated to: ' + updatedQuantity + '.');
                enterManagerApp();
            });
        }).catch(function(err) {
            console.log(err);
            connection.destroy();
        });
    }).catch(function(err) {
        console.log(err);
        connection.destroy();
    });
}

function addProduct() {
    return inquirer.prompt([{
        name: 'product',
        message: 'Enter the name of the product you would like to add.',
        type: 'input',
        validate: function(value) {
            if (value === '') {
                console.log('\nPlease enter a valid name.');
                return false;
            } else {
                return true;
            }
        }
    }, {
        name: 'department',
        message: 'Enter the name of the department where the product is located.',
        type: 'input',
        validate: function(value) {
            if (value === '') {
                console.log('\nPlease enter a valid name.');
                return false;
            } else {
                return true;
            }
        }
    }, {
        name: 'price',
        message: 'Enter the price of the product.',
        type: 'input',
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid price.');
                return false;
            }
        }
    }, {
        name: 'quantity',
        message: 'Enter the amount of initial stock quantity.',
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
            connection.query('INSERT INTO products SET ?', [{
                product_name: answer.product,
                department_name: answer.department,
                price: answer.price,
                stock_quantity: answer.quantity
            }], function(err, res) {
                if (err) reject(err);
                resolve(res);
            });
        }).then(function() {
            console.log('The product has been added to the inventory.');
            enterManagerApp();
        }).catch(function(err) {
            console.log(err);
            connection.destroy();
        });
    }).catch(function(err) {
        console.log(err);
        connection.destroy();
    });
}
