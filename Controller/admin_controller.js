let async = require('async');
let session = require('express-session');

const { body,validationResult, query } = require('express-validator/check');
const { sanitizeBody, sanitizeQuery } = require('express-validator/filter');

//const e = document.getElementById('1');

const dbQuery = function( sql, values ) {
    return new Promise(( resolve, reject ) => {
        db.query(sql, values, ( err, rows) => {
  
           if ( err ) {
              reject( err )
            } else {
              resolve( rows )
            }
        });
    })
    
}
let dateFormat = require('dateformat');
var direct = 1;


//screen 13
exports.user_detail_update = [
    // Validate fields.
    //query('userName', 'userName must not be empty.').isLength({ min: 1 }).trim(),
    
    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),

    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('admin_manage_user', {title: 'Manage User',
                data: [], errors: errors.array()});
        }
        else if (isEmptyObj(req.query))    {

            // render with (viewPage, parameters)
            res.render('admin_manage_user', {title: 'Manage User',
                data: [], errors: []});
        } else {
            updatedResults = [];
            var userName = req.query.userName;
            var status = req.query.status;
            
            req.session.userName = userName;
            req.session.status = status;
             

            //CREATE DEFINER=`root`@`localhost` PROCEDURE `admin_filter_user`(IN i_username VARCHAR(50), IN i_status CHAR(8), IN i_sortBy CHAR(50), IN i_sortDirection CHAR(4))
            var testSql = "call admin_filter_user(?,?,?,?)";
            db.query(testSql, [userName, status, '', ''],(error, results, fields) => {
                //'userType','ASC'
                if (error) {
                    return console.error(error.message);
                }
            });

            var pollSql = "Select * From AdFilterUser";
            db.query(pollSql,[] , (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                updatedResults = [];
                for (var i = 0; i < results.length; i++) {
                    updatedResults[i] = results[i];
                    
                }
                //console.log(results);
                res.render('admin_manage_user', {title: 'Manage User', 
                    data: updatedResults, errors: []});
            });


        }
    }

];

exports.user_detail_sort = function(req, res, next) {
    var userName = req.session.userName;
    console.log(userName);
    var status = req.session.status;
    var sortBy = req.query.sortBy;
    var sortDirection;
    direct *= -1;
            
    if(!sortBy) {
        sortBy = '';
    }
    console.log(direct);
    if(direct == -1) {
        sortDirection = 'DESC';
    } else {
        sortDirection = 'ASC';
    }
    console.log(sortDirection);

    var testSql = "call admin_filter_user(?,?,?,?)";
            db.query(testSql, [userName, status, sortBy, sortDirection],(error, results, fields) => {
                //'userType','ASC'
                if (error) {
                    return console.error(error.message);
                }
            });

            var pollSql = "Select * From AdFilterUser";
            db.query(pollSql,[] , (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                updatedResults = [];
                for (var i = 0; i < results.length; i++) {
                    updatedResults[i] = results[i];
                    
                }
                //console.log(results);
                res.render('admin_manage_user', {title: 'Manage User',
                    data: updatedResults, errors: []});
            });

}

exports.user_detail_changestatus = [
    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // if have logic errors
        if (!errors.isEmpty()) {
            res.render('manager_schedule_movie', {title: "Wrong info typed!"});
        } else {
            var sql1 = "call admin_approve_user(?)";
            var sql2 = "call admin_decline_user(?)";            
            var choose = req.body.choose;

            if (choose == "Approve") {
                sql = sql1;
            } else {
                sql = sql2;
            }
            var target_username = req.body.target_username;
            //console.log(req.body);

            db.query(sql, [target_username], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                res.redirect('/adminManageUser');
            })
            
        }
    }

];

//screen 15
exports.create_theater_get = async function (req, res, next) {
    var sql1 = "Select Name from company";
    var sql2 = "Select UserName from manager";
    const companys = await dbQuery(sql1);
    const managerNames = await dbQuery(sql2);
    res.render('admin_create_theater', {title: "Create Theater", companys: companys, managerNames: managerNames, errors: []});
}
exports.create_theater_post = [
    // validate fields
    body('theaterName', 'theaterName must not be empty.').isLength({ min: 1 }).trim(),
    body('companyName', 'companyName must not be empty.').isLength({ min: 1 }).trim(),
    body('address', 'address must not be empty.').isLength({ min: 1 }).trim(),
    body('city', 'city must not be empty.').isLength({ min: 1 }).trim(),
    body('zipcode', 'zipcode must not be empty.').isLength({ min: 1 }).trim(),
    body('capacity', 'capacity must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),

    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('admin_create_theater', {title: 'Create Theater',
                errors: errors.array()});
        } else {
            var theaterName = req.body.theaterName;
            var companyName = req.body.companyName;
            var address = req.body.address;
            var city = req.body.city;
            var state = req.body.state;
            var zipcode = req.body.zipcode;
            var capacity = req.body.capacity;
            var managerName = req.body.managerName;

            console.log(req.body);
            
            var sql = "call admin_create_theater(?,?,?,?,?,?,?,?)";
            db.query(sql, [theaterName, companyName, address, city, state, zipcode, capacity, managerName], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                res.redirect('/adminCreateTheater');
            })

        }
    }

]


//screen 17
exports.create_movie_get = function (req, res, next) {
    res.render('admin_create_movie', {title: 'Create Movie', errors: []});
}
exports.create_movie_post = [
    // validate fields
    body('movieName', 'movieName must not be empty.').isLength({ min: 1 }).trim(),
    body('duration', 'duration must not be empty.').isLength({ min: 1 }).trim(),
    body('releaseDate', 'releaseDate must not be empty.').isLength({ min: 1 }).trim(),
    
    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // if have logic errors
        if (!errors.isEmpty()) {
            res.render('admin_create_movie', {title: "Wrong info typed!", errors: errors.array()});
        } else {
            var movieName = req.body.movieName;
            var duration = req.body.duration;
            var releaseDate = req.body.releaseDate;
            console.log(req.body);

            var sql = "call admin_create_mov(?,?,?)";
            db.query(sql, [movieName, duration, releaseDate], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                res.redirect('/adminCreateMovie');
            })
        }
    }
];

// Some helper functions:

// this is a function that validates whether a javascript object is empty
function isEmptyObj(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}



