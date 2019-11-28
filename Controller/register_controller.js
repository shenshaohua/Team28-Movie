let async = require('async');
const { body,validationResult, query } = require('express-validator/check');
const { sanitizeBody, sanitizeQuery } = require('express-validator/filter');

let session = require("express-session");

var cards = [];
var companyList = [];
exports.user_register_get = function(req, res, next) {
    //var sql = "get login info"
    res.render('user_register', {title: "User Register", errors: []});
};

exports.user_register_post = [
    // validate fields
    body('fName', 'First name must not be empty.').isLength({ min: 1 }).trim(),
    body('lName', 'Last name must not be empty.').isLength({ min: 1 }).trim(),
    body('username', 'User name must not be empty.').isLength({ min: 1 }).trim(),
    body('password', 'Password must not be empty.').isLength({ min: 1 }).trim(),
    body('cpassword', 'Confirm password must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // if have logic errors
        if (!errors.isEmpty()) {
            
            res.render('user_register', {title: "Wrong info typed!", errors: errors.array()});
            
        } else {
            var fName = req.body.fName;
            var lName = req.body.lName;
            var username = req.body.username;
            var password = req.body.password;
            var cpassword = req.body.cpassword;
            
            var users = [];
            var query = "select distinct username from user"
            db.query(query, [], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                console.log("successfully get the user names!");
                users = results;
                for (var i = 0; i < users.length; i++) {
                    if (users[i]['username'] == username) {
                        res.render('user_register', {title: "User name has been used!", errors: []});
                        break;
                    }
                }
            });
            //console.log(users);
            if (password.length < 8) {
                //console.log(password.length)
                res.render('user_register', {title: "Password must be at least 8 characters!", errors: []});
            } else if (password!==cpassword) {
                //console.log(password);
                //console.log(cpassword);
                res.render('user_register', {title: "Confirm password and password must be same!", errors: []});
            } else {
                console.log(req.body);
                var sql = "call user_register(?, ?, ?, ?)";
                db.query(sql, [username, password, fName, lName], (error, results, fields) => {
                    if (error) {
                        return console.error(error.message);
                    }
                    res.redirect('/login');
                });
            }
            
        }
    }
];

exports.customer_register_get = function(req, res, next) {
    cards = [];
    res.render('customer_register', {title: "Customer Register", data:cards, errors: []});
    
};

exports.customer_register_post = [
    
    // validate fields
    body('fName', 'First name must not be empty.').isLength({ min: 1 }).trim(),
    body('lName', 'Last name must not be empty.').isLength({ min: 1 }).trim(),
    body('username', 'User name must not be empty.').isLength({ min: 1 }).trim(),
    body('password', 'Password must not be empty.').isLength({ min: 1 }).trim(),
    body('cpassword', 'Confirm password must not be empty.').isLength({ min: 1 }).trim(),
    
    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),

    (req, res, next) => {
        var select = req.body.select;
        console.log(select);
        if (select == 'register') {
            // Extract the validation errors from a request.
            const errors = validationResult(req);
            
            // if have logic errors
            if (!errors.isEmpty()) {
                cards = [];
                res.render('customer_register', {title: "Wrong info typed!", data:cards, errors: errors.array()});
                
            } else {
                var fName = req.body.fName;
                var lName = req.body.lName;
                var username = req.body.username;
                var password = req.body.password;
                var cpassword = req.body.cpassword;
                

                var users = [];
                var query = "select distinct username from user"
                db.query(query, [], (error, results, fields) => {
                    if (error) {
                        return console.error(error.message);
                    }
                    console.log("successfully get the user names!");
                    users = results;
                    for (var i = 0; i < users.length; i++) {
                        if (users[i]['username'] == username) {
                            res.render('customer_register', {title: "User name has been used!",  data:cards, errors: []});
                            break;
                        }
                    }
                });
                //console.log(users);
                if (password.length < 8) {
                    //console.log(password.length)
                    res.render('customer_register', {title: "Password must be at least 8 characters!",  data:cards, errors: []});
                } else if (password!==cpassword) {
                    //console.log(password);
                    //console.log(cpassword);
                    res.render('customer_register', {title: "Confirm password and password must be same!",  data:cards, errors: []});
                } else if (cards.length == 0) {
                    res.render('customer_register', {title: "You must enter a credit card!", data: cards, errors: []});
                } else {
                    console.log(req.body);
                    var sql = "call customer_only_register(?, ?, ?, ?)";
                    db.query(sql, [username, password, fName, lName], (error, results, fields) => {
                        if (error) {
                            return console.error(error.message);
                        }
                        //res.redirect('/login');
                    });
                    if (cards.length != 0) {
                        var sql = "call customer_add_creditcard(?, ?)";
                        for (var i = 0; i < cards.length; i++) {
                            db.query(sql, [username, cards[i]], (error, results, fields) => {
                                if (error) {
                                    return console.error(error.message);
                                }
                            });
                        }
                    }
                    cards = [];
                    res.redirect('/login');
                }
                
            }
        } else if (select == 'add'){
            
            var num = req.body.cardNumber;
            if (cards.length == 5) {
                res.render('customer_register', {title: "You can only add 5 credit cards!", data: cards, errors: []});
            } else if(num.length != 16) {
                res.render('customer_register', {title: "Credit card number must be 16 digits!", data: cards, errors: []});
            } else {
                cards.push(num);
                console.log(cards);
                res.render('customer_register', {title: "Customer Register", data: cards, errors: []});
            }
            
            
        } else if (select == 'remove0'){
            cards.splice(0, 1);
            res.render('customer_register', {title: "Customer Register", data: cards, errors: []});
        } else if (select == 'remove1'){
            cards.splice(1, 1);
            res.render('customer_register', {title: "Customer Register", data: cards, errors: []});
        } else if (select == 'remove1'){
            cards.splice(2, 1);
            res.render('customer_register', {title: "Customer Register", data: cards, errors: []});
        } else if (select == 'remove1'){
            cards.splice(3, 1);
            res.render('customer_register', {title: "Customer Register", data: cards, errors: []});
        } else if (select == 'remove1'){
            cards.splice(4, 1);
            res.render('customer_register', {title: "Customer Register", data: cards, errors: []});
        } else {

        };
        
    }
];

exports.manager_register_get = function(req, res, next) {
    var sql = "Select Name from company";
    //var company = [];
    db.query(sql, [], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        console.log("successfully retrieved the company list!");
        //console.log(results);
        // console.log(results.length);
        companyList = results;
        //console.log(movies);
        res.render('manager_register', {title: "Manager-Only Register", company: companyList, errors: []});
    });
    
};

exports.manager_register_post = [
    body('fName', 'First name must not be empty.').isLength({ min: 1 }).trim(),
    body('lName', 'Last name must not be empty.').isLength({ min: 1 }).trim(),
    body('username', 'User name must not be empty.').isLength({ min: 1 }).trim(),
    body('password', 'Password must not be empty.').isLength({ min: 1 }).trim(),
    body('cpassword', 'Confirm password must not be empty.').isLength({ min: 1 }).trim(),
    body('company', 'Company must not be empty.').isLength({ min: 1 }).trim(),
    body('street', 'Street address must not be empty.').isLength({ min: 1 }).trim(),
    body('city', 'City must not be empty.').isLength({ min: 1 }).trim(),
    body('state', 'state must not be empty.').isLength({ min: 1 }).trim(),
    body('zipcode', 'Zipcode must not be empty.').isLength({ min: 1 }).trim(),


    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // if have logic errors
        if (!errors.isEmpty()) {
            
            res.render('manager_register', {title: "Wrong info typed!", company: companyList, errors: errors.array()});
            
        } else {
            var fName = req.body.fName;
            var lName = req.body.lName;
            var username = req.body.username;
            var password = req.body.password;
            var cpassword = req.body.cpassword;
            var company = req.body.company;
            var street = req.body.street;
            var city = req.body.city;
            var state = req.body.state;
            var zipcode = req.body.zipcode;
            var address = street + city + state + zipcode;
            console.log(address);

            var haveError = false;

            var users = [];
            var query = "select distinct username from user";
            db.query(query, [], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                console.log("successfully get the user names!");
                users = results;
                for (var i = 0; i < users.length; i++) {
                    if (users[i]['username'] == username) {
                        haveError = true;
                        res.render('manager_register', {title: "User name has been used!", company: companyList, errors: []});
                        break;
                    }
                }
            });
            var addresses = []
            var query2 = "select Street, City, State, Zipcode from manager";
            db.query(query2, [], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                console.log("successfully get the address!");
                addresses = results;
                //console.log(addresses);
                for (var i = 0; i < addresses.length; i++) {
                    var place = addresses[i]['Street'] + addresses[i]['City'] + addresses[i]['State'] + addresses[i]['Zipcode'];
                    //console.log(place);
                    if (address == place) {
                        haveError = true;
                        //console.log("found");
                        res.render('manager_register', {title: "Address has been used!", company: companyList, errors: []});
                        break;
                    }
                }
            });
            //console.log(users);
            if (haveError === false) {
                if (password.length < 8) {
                    //console.log(password.length)
                    res.render('manager_register', {title: "Password must be at least 8 characters!", company: companyList, errors: []});
                } else if (zipcode.length != 5){
                    res.render('manager_register', {title: "Zipcode must be 5 digits!", errors: []});
                } else if (password!==cpassword) {
                    //console.log(password);
                    //console.log(cpassword);
                    res.render('manager_register', {title: "Confirm password and password must be same!", company: companyList, errors: []});
                } else {
                    console.log(req.body);
                    var sql = "call manager_only_register(?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    db.query(sql, [username, password, fName, lName, company, street, city, state, zipcode], (error, results, fields) => {
                        if (error) {
                            return console.error(error.message);
                        }
                        res.redirect('/login');
                    });
                }
            }          
        }
    }
];

function isEmptyObj(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

