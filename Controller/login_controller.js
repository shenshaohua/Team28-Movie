const { body,validationResult, query } = require('express-validator/check');
const { sanitizeBody, sanitizeQuery } = require('express-validator/filter');

exports.login_get = function(req, res, next) {
    //var sql = "get login info"
    res.render('login', {title: "Atlanta Movie Login", errors: []});
}


exports.login_post = [

    body('username', 'username must not be empty.').isLength({ min: 1 }).trim(),
    body('password', 'password must not be empty.').isLength({ min: 1 }).trim(),
    
    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),


    (req, res, next) => {
        var select = req.body.select;
        if (select == "register") {
            res.redirect('/nevigate');
        } else {
            // Extract the validation errors from a request.
            const errors = validationResult(req);

            // if have logic errors
            
            var u = req.query.username;
            var p = req.query.password;
        
            console.log(req.body);
            var testSql = "user_login(?, ?)";
            db.query(testSql, [u, p], (error, result, fields=> {
                if (error) {
                    return console.error(error.message);
                }
                if (!result[0][2] == 0 && !result[0][3] == 0 && !result[0][4] == 0) {
                    res.render('login', {message: "Invalid credentials!"});
                }
            }));
            
        }
        
    }
       
]

exports.nevigate_get = function(req, res, next) {
    //var sql = "get login info"
    res.render('nevigate', {title: "Register Nevigation", errors: []});
}




