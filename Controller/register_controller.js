let async = require('async');
const { body,validationResult, query } = require('express-validator/check');
const { sanitizeBody, sanitizeQuery } = require('express-validator/filter');
//let session = require("express-session");
//req.session.card = [];
var cards = [];
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
        if (select == 'register') {
            // Extract the validation errors from a request.
            const errors = validationResult(req);

            // if have logic errors
            if (!errors.isEmpty()) {
                cards = [];
                res.render('customer_register', {title: "Wrong info typed!", errors: errors.array()});
                
            } else {
                var fName = req.body.fName;
                var lName = req.body.lName;
                var username = req.body.username;
                var password = req.body.password;
                var cpassword = req.body.cpassword;
                alert(fName);

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
                } else {
                    console.log(req.body);
                    var sql = "call user_register(?, ?, ?, ?)";
                    db.query(sql, [username, password, fName, lName], (error, results, fields) => {
                        if (error) {
                            return console.error(error.message);
                        }
                        //res.redirect('/login');
                    });
                    if (!cards.isEmpty()) {
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
            cards.push(num);
            console.log(cards);
            res.render('customer_register', {title: "Customer Register", data: cards, errors: []});
        } else {

        };
        
    }
];

exports.customer_add_post = [
    body('cardNum', 'Card number must not be empty.').isLength({ min: 1 }).trim(),
    sanitizeQuery('*').escape(),

    (req, res, next) => {
        var num = req.body.cardNumber;
        cards.push(num);
        console.log(cards);
        res.render('customer_register', {title: "Customer Register", data: cards, errors: []});
    }
];

function isEmptyObj(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}