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

            if (req.session.isAdmin === null || req.session.isAdmin != 1) {
                res.render('index', { title: 'Hello',
                    errors: [{msg: "You are not an administrator, you have no right to view the page!"}], sess: req.session});
            } else {
                res.render('admin_manage_user', {title: 'Manage User',
                data: [], errors: []});
            }
            
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

    async (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // if have logic errors
        if (!errors.isEmpty()) {
            res.render('admin_manage_user', {title: "Wrong info typed!", data:[], errors:[]});
        } else {
            var sql1 = "call admin_approve_user(?)";
            var sql2 = "call admin_decline_user(?)";            
            var choose = req.body.choose;
            var target_username = req.body.target_username;

            if (choose == "Approve") {
                sql = sql1;
            } else {
                //logic constrain
                sql3 = "select status from user where username = '" + target_username + "'";
                //console.log(sql3);
                const target_status = await dbQuery(sql3);
                console.log(target_status[0]['status']);
                if(target_status[0]['status'] === 'Approved') {
                    res.render('admin_manage_user', {title: "You cannot decline an approved user.", data:[], errors:[]});
                } else {
                    sql = sql2;
                }

            }
            
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
    if (req.session.isAdmin === null || req.session.isAdmin != 1) {
        res.render('index', { title: 'Hello',
            errors: [{msg: "You are not an administrator, you have no right to view the page!"}], sess: req.session});
    } else {
        //set the first value in the dropdown list
        var target_companyName = req.query.target_companyName;
        // console.log('target_companyName is');
        // console.log(target_companyName);
        if (typeof(target_companyName) == "undefined") {
            target_companyName = "4400 Theater Company";
        }
        console.log(target_companyName);
        //success!

        var sql1 = "Select Name from company order by Name = ? desc";
        var sql2 = "SELECT UserName, Works_In FROM manager WHERE UserName NOT IN (SELECT ManagerUsername FROM theater) AND Works_In = ? ";
        const companys = await dbQuery(sql1);
        const managerNames = await dbQuery(sql2);
        res.render('admin_create_theater', {title: "Create Theater", companys: companys, managerNames: managerNames, errors: []});
    }
    
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

    async (req, res, next) => {
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
            //var thnameConstrain = true;

            
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
    if (req.session.isAdmin === null || req.session.isAdmin != 1) {
        res.render('index', { title: 'Hello',
            errors: [{msg: "You are not an administrator, you have no right to view the page!"}], sess: req.session});
    }  else {
        res.render('admin_create_movie', {title: 'Create Movie', errors: []});

    }
    
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

// screen 14
let companys1 = [];
exports.manage_company_get = [
    //(ignore Validate fields.in this case)
    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),
(req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('admin_filter_company', {title: 'Manage Company',
                data: [], errors: errors.array()});
        }
        else if (isEmptyObj(req.query)) {
            var sql = "Select Name from company";

            db.query(sql, [], (error, results1, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                console.log("successfully retrieved the company list!");
                //console.log(results);
                companys1 = companys1.concat(results1);
                //console.log(companys1);
            });


            var testSql = "call admin_filter_company('ALL', 1, 100, 1, 100, 1, 100, '', '')";
            //
            
            db.query(testSql, [companyName, mincityCovered, maxcityCovered, mintheaters, maxtheaters, minemployees, maxemployees, sortBy, sortDirection], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
            });

            // poll from newly created table and send it to our view
            var pollSql = "Select * From AdFilterCom";
            db.query(pollSql, [], (error, results2, fields) => {
                if (error) {
                    return console.error(error.message);
                }

            //console.log(results2);
            //success!

            res.render('admin_filter_company', {title: 'Manage Company', companys: companys1, data: results2, errors: []})
            });



        } else {

            var companyName = req.query.companyName;

            var mincityCovered = parseInt(req.query.mincityCovered);
            if (isNaN(mincityCovered)) {
                mincityCovered = null;
            }
            var maxcityCovered = parseInt(req.query.maxcityCovered);
            if (isNaN(maxcityCovered)) {
                maxcityCovered = null;
            }
            var mintheaters = parseInt(req.query.mintheaters);
            if (isNaN(mintheaters)) {
                mintheaters = null;
            }
            var maxtheaters = parseInt(req.query.maxtheaters);
            if (isNaN(maxtheaters)) {
                maxtheaters = null;
            }
            var minemployees = parseInt(req.query.minemployees);
            if (isNaN(minemployees)) {
                minemployees = null;
            }
            var maxemployees = parseInt(req.query.maxemployees);
            if (isNaN(maxemployees)) {
                maxemployees = null;
            }


            var sortBy = '';
            var sortDirection = '';

            // for sort use
            req.session.screen14Combination = [companyName, mincityCovered, maxcityCovered, mintheaters, maxtheaters, minemployees, maxemployees, sortBy, sortDirection];
            //console.log(req.session.screen14Combination);

            // call procedure first, create the table that has information
            var testSql = "call admin_filter_company(?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
            db.query(testSql, [companyName, mincityCovered, maxcityCovered, mintheaters, maxtheaters, minemployees, maxemployees, sortBy, sortDirection], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
            });

            // poll from newly created table and send it to our view
            var pollSql = "Select * From AdFilterCom";
            db.query(pollSql, [], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
            //console.log(results);

            res.render('admin_filter_company', {title: 'Manage Company', companys: companys1,
                data: results, errors: []});
            });
        }
    }
]

let directC =  1;
exports.company_detail_sort = function(req, res, next) {

    var sortBy = req.query.sortBy;
    var sortDirection;
    directC *= -1;
            
    if(!sortBy) {
        sortBy = '';
    }
    console.log(directC);
    if(directC == -1) {
        sortDirection = 'DESC';
    } else {
        sortDirection = 'ASC';
    }
    console.log(sortDirection);

    var combination = req.session.screen14Combination;
    console.log(combination);
    if (typeof(combination) == "undefined") {
        combination = ['ALL', 1, 100, 1, 100, 1, 100, '', ''];
        ;
    } 
    combination[7] = sortBy;
    combination[8] = sortDirection;

    var sql = "Select Name from company";

    db.query(sql, [], (error, results1, fields) => {
        if (error) {
            return console.error(error.message);
        }
        console.log("successfully retrieved the company list!");
        //console.log(results);
       // console.log(results.length);
        companys1 = companys1.concat(results1);
        //console.log(companys1);
    });


    // call procedure first, create the table that has information
    var testSql = "call admin_filter_company(?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(testSql, combination, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
    });

    // poll from newly created table and send it to our view
    var pollSql = "Select * From AdFilterCom";
    db.query(pollSql, [], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }

    console.log(results);
    res.render('admin_filter_company', {title: 'Manage Company', companys: companys1,
        data: results, errors: []});
    });

}


//screen 16
exports.comDetail_get =  async (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // if have logic errors
        if (!errors.isEmpty()) {
            res.render('company_detail', {title: "Wrong info typed!", data:[], errors:[]});
        } else {
            let target_companyName = req.query.target_companyName;
            // console.log(target_companyName);

            if (typeof(target_companyName) == "undefined") {
                target_companyName = "4400 Theater Company";
            }
            console.log(target_companyName);

            const sql1 = "call admin_view_comDetail_emp(?)";
            db.query(sql1, [target_companyName], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
            });
            const pollSql1 = "SELECT * FROM team28.adcomdetailemp";
            let comDetailEmp = await dbQuery(pollSql1, [target_companyName]);

            const sql2 = "call admin_view_comDetail_th(?)";
            db.query(sql2, [target_companyName], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
            });
            const pollSql2 = "SELECT * FROM team28.adcomdetailth;";
            let comDetailTh = await dbQuery(pollSql2, [target_companyName]);
            
            // console.log(comDetailEmp);
            // console.log(comDetailTh);
            res.render('company_detail', {title: "Company Detail", cop: target_companyName, dataE: comDetailEmp, dataT: comDetailTh, errors:[]});

            
        }
    }

// Some helper functions:

// this is a function that validates whether a javascript object is empty
function isEmptyObj(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}



