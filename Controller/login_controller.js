const { body,validationResult, query } = require('express-validator');
const { sanitizeBody, sanitizeQuery } = require('express-validator');

let session = require("express-session");

exports.login_get = function(req, res, next) {
    //var sql = "get login info"
    res.render('login', {title: "Please Login into your account", errors: []});
};

exports.login_post = [
    body('username', 'username must not be empty.').isLength({ min: 1 }).trim(),
    body('password', 'password must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),


    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // if have logic errors
        if (!errors.isEmpty()) {
            res.render('login', {title: "Please Login into your account", errors: errors.array()});
        } else {
            var username = req.body.username;
            var password = req.body.password;

            var testSql = "call user_login(?, ?)";
            db.query(testSql, [username, password], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                    var tempErrors = [{msg: "Your username or password doesn't exist or match"}];
                    res.render('login', {title: "Please Login into your account", errors: tempErrors});
                }
                // set some session staff (by polling from table)
                // Seems like a callback hell!! (should figure out a way to use .next())
                else {
                    var pollSql = "Select * from userlogin";
                    db.query(pollSql, [], (error, results, fields) => {
                        if (error) {
                            return console.error(error.message);
                        }
                        if (results == null || results.length == 0) {
                            var tempErrors = [{msg: "Your username or password doesn't exist or match"}];
                            res.render('login', {title: "Please Login into your account", errors: tempErrors});
                        } else { // successfully fetched the data(meaning the username and password combination exist)
                            req.session.username = results[0]['UserName'];
                            req.session.status = results[0]['Status'];
                            req.session.isCustomer = results[0]['isCustomer'];
                            req.session.isAdmin = results[0]['isAdmin'];
                            req.session.isManager = results[0]['isManager'];
                            var identities = "";
                            if (req.session.isCustomer && req.session.isCustomer === 1) identities += "Customer ";
                            if (req.session.isAdmin && req.session.isCustomer === 1) identities += "Admin ";
                            if (req.session.isManager && req.session.isCustomer === 1) identities += "Manager";
                            if (identities === "") identities = "User";
                            req.session.identities = identities;
                            res.redirect('/');
                        }
                    });
                }
            });
        }
    }
];

exports.logout_page = function(req, res, next) {
    req.session.username = null;
    req.session.status = null;
    req.session.isCustomer = null;
    req.session.isAdmin = null;
    req.session.isManager = null;
    req.session.identities = null;
    res.render('logout_view');
};
