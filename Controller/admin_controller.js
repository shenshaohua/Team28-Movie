const { body,validationResult, query } = require('express-validator/check');
const { sanitizeBody, sanitizeQuery } = require('express-validator/filter');

let dateFormat = require('dateformat');

// exports.user_detail_get = function (req, res, next) {
//     res.render('admin_manage_user', {title: 'Manage User',
//         data: [], errors: []});
// }

// //
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
            var column;
            var sortBy;
            var sortDirection;
            var direct = 1;
            if(isEmptyObj(updatedResults)){
                sortBy = '';
                sortDirection = '';

            } else {
                column = req.qeury.column;
                sortBy = column;
                direct *= -1;
                if(direct == -1) {
                    sortDirection = 'DESC';
                } else {
                    sortDirection = 'ASC';
                }
                
            }

            //CREATE DEFINER=`root`@`localhost` PROCEDURE `admin_filter_user`(IN i_username VARCHAR(50), IN i_status CHAR(8), IN i_sortBy CHAR(50), IN i_sortDirection CHAR(4))
            var testSql = "call admin_filter_user(?,?,?,?)";
            db.query(testSql, [userName, status, sortBy, sortDirection],(error, results, fields) => {
                //'userType','ASC'
                if (error) {
                    return console.error(error.message);
                }
                //console.log("successfully create the info table 'manfilterth' ");
            });

            var pollSql = "Select * From AdminFilterUser";
            db.query(pollSql,[] , (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                //updatedResults = [];
                for (var i = 0; i < results.length; i++) {
                    updatedResults[i] = results[i];
                    
                }
                console.log(results);
                res.render('admin_manage_user', {title: 'Here comes your result!',
                    data: updatedResults, errors: []});
            });

        }
    }

]

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
                res.redirect('/adminManageUser/getInfo');
            })
            
        }
    }

]

exports.company_detail_update = [
    // Validate fields.
    //query('userName', 'userName must not be empty.').isLength({ min: 1 }).trim(),
    
    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),

    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('admin_manage_user', {title: 'Manage Company',
                data: [], errors: errors.array()});
        }
        else if (isEmptyObj(req.query))    {

            // render with (viewPage, parameters)
            res.render('admin_manage_user', {title: 'Manage Company',
                data: [], errors: []});
        } else {
            updatedResults = [];
            var userName = req.query.userName;
            var status = req.query.status;
            var column;
            var sortBy;
            var sortDirection;
            var direct = 1;
            if(isEmptyObj(updatedResults)){
                sortBy = '';
                sortDirection = '';

            } else {
                column = req.qeury.column;
                sortBy = column;
                direct *= -1;
                if(direct == -1) {
                    sortDirection = 'DESC';
                } else {
                    sortDirection = 'ASC';
                }
                
            }

            //CREATE DEFINER=`root`@`localhost` PROCEDURE `admin_filter_user`(IN i_username VARCHAR(50), IN i_status CHAR(8), IN i_sortBy CHAR(50), IN i_sortDirection CHAR(4))
            var testSql = "call admin_filter_user(?,?,?,?)";
            db.query(testSql, [userName, status, sortBy, sortDirection],(error, results, fields) => {
                //'userType','ASC'
                if (error) {
                    return console.error(error.message);
                }
                //console.log("successfully create the info table 'manfilterth' ");
            });

            var pollSql = "Select * From AdminFilterUser";
            db.query(pollSql,[] , (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                //updatedResults = [];
                for (var i = 0; i < results.length; i++) {
                    updatedResults[i] = results[i];
                    
                }
                console.log(results);
                res.render('admin_manage_user', {title: 'Here comes your result!',
                    data: updatedResults, errors: []});
            });

        }
    }

]



// Some helper functions:

// this is a function that validates whether a javascript object is empty
function isEmptyObj(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
