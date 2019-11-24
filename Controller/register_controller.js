let async = require('async');
const { body,validationResult, query } = require('express-validator/check');
const { sanitizeBody, sanitizeQuery } = require('express-validator/filter');

exports.user_register_get = function(req, res, next) {
    //var sql = "get login info"
    res.render('user_register', {title: "User Register", errors: []});
}

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
       // if (!errors.isEmpty()) {
            
                //res.render('user_register', {title: "Wrong info typed!", errors: errors.array()});
            
       // } else {
            var fName = req.body.fName;
            var lName = req.body.lName;
            var username = req.body.username;
            var password = req.body.password;
            var cpassword = req.body
            
            var users = [];
            var query = "select distinct username from user"
            db.query(query, [], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                console.log("successfully get the user names!");
                users = results;
            });
            if (users.includes(username)) {
                res.render('user_register', {title: "User name has been used!", errors: []});
            }else if (password.length < 8) {
                //console.log(password.length)
                res.render('user_register', {title: "Password must be at least 8 characters!", errors: []});
            } else if (password != cpassword) {
                res.render('user_register', {title: "Confirm password and password must be same!", errors: []});
            } else {
                console.log(req.body);
                var sql = "call user_register(?, ?, ?, ?)";
                db.query(sql, [username, password, fName, lName], (error, results, fields) => {
                    if (error) {
                        return console.error(error.message);
                    }
                    res.redirect('/login');
                })
            }
            
        }
    //}
]

function isEmptyObj(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}