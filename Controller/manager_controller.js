let async = require('async');

const { body,validationResult, query } = require('express-validator/check');
const { sanitizeBody, sanitizeQuery } = require('express-validator/filter');

let dateFormat = require('dateformat');


exports.theater_detail_get = function (req, res, next) {
    if (req.session.isManager === null || req.session.isManager != 1) {
        res.render('index', { title: 'Hello',
            errors: [{msg: "You are not a manager, you have no right to view the page!"}], sess: req.session});
    } else {
        res.render('manager_theater_overview', {title: 'Manager peeking theaters\' detail',
            data: [], errors: [], sess: req.session});
    }
}

exports.theater_detail_update = [
    // Validate fields.
    //query('managerName', 'managerName must not be empty.').isLength({ min: 1 }).trim(),
    query('movieName', 'movieName must not be empty.').isLength({ min: 1 }).trim(),
    query('durationStart', 'durationStart must not be empty.').isLength({ min: 1 }).trim(),
    query('durationEnd', 'durationEnd must not be empty.').isLength({ min: 1 }).trim(),
    query('playDateStart', 'minMoviePlayDate must not be empty.').isLength({ min: 1 }).trim(),
    query('playDateEnd', 'maxMoviePlayDate must not be empty.').isLength({ min: 1 }).trim(),
    query('releaseStart', 'minReleaseDate must not be empty.').isLength({ min: 1 }).trim(),
    query('releaseEnd', 'maxReleaseDate must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),

    (req, res, next) => {
        if (req.session.isManager === null || req.session.isManager != 1) {
            res.render('index', { title: 'Hello',
                errors: [{msg: "You are not a manager, you have no right to view the page!"}], sess: req.session});
            return;
        }
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // if have logic errors
        if (!errors.isEmpty()) {
            res.render('manager_theater_overview', {title: 'Manager peeking theaters\' detail',
                data: [], errors: errors.array(), sess: req.session});
        }
        else if (isEmptyObj(req.query))    {

            // render with (viewPage, parameters)
            res.render('manager_theater_overview', {title: 'Manager peeking theaters\' detail',
                data: [], errors: [], sess: req.session});
        } else {
            //var managerName = req.query.managerName;
            var managerName = req.session.username;
            var movieName = req.query.movieName;
            var durationStartINT = parseInt(req.query.durationStart);
            var durationEndINT = parseInt(req.query.durationEnd);
            var minMoviePlayDate = dateFormat(req.query.playDateStart, "yyyy-mm-dd");
            var maxMoviePlayDate = dateFormat(req.query.playDateEnd, "yyyy-mm-dd");
            var minReleaseDate = dateFormat(req.query.releaseStart, "yyyy-mm-dd");
            var maxReleaseDate = dateFormat(req.query.releaseEnd, "yyyy-mm-dd");
            //console.log(maxReleaseDate);
            var includeNotPlayed = false;
            if (req.query.includeNotPlayed && req.query.includeNotPlayed === 'on') includeNotPlayed = true;
            console.log(includeNotPlayed);
            // call procedure first, create the table that has information
            var testSql = "call manager_filter_th(?, ?, ?, ?, ?, ?, ?, ?, ?)";
            //db.query(testSql, ['manager1', 'Spaceballs', 0, 500, '1800-01-01', '2020-01-01', '1990-01-01', '2020-01-01', false],
            db.query(testSql, [managerName, movieName, durationStartINT, durationEndINT, minReleaseDate, maxReleaseDate, minMoviePlayDate,
                maxMoviePlayDate, includeNotPlayed], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                //console.log("successfully create the info table 'manfilterth' ");
            });

            // poll from newly created table and send it to our view
            var pollSql = "Select * From manfilterth";
            db.query(pollSql,[] , (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                updatedResults = [];
                for (var i = 0; i < results.length; i++) {
                    updatedResults[i] = results[i];
                    updatedResults[i].ReleaseDate = dateFormat(updatedResults[i].ReleaseDate, "yyyy-mm-dd");
                    updatedResults[i].Date = dateFormat(updatedResults[i].Date, "yyyy-mm-dd");
                }
                console.log(results);
                res.render('manager_theater_overview', {title: 'Here comes your result!',
                    data: updatedResults, errors: [], sess: req.session});
            });
        }
    }
];

exports.schedule_movie_get = function (req, res, next) {
    if (req.session.isManager === null || req.session.isManager != 1) {
        res.render('index', { title: 'Hello',
            errors: [{msg: "You are not a manager, you have no right to view the page!"}], sess: req.session});
        return;
    }
    var sql = "Select Name from movie";
    var movies = [];
    db.query(sql, [], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        console.log("successfully retrieved the movie list!");
        movies = results;
        console.log(movies);
        res.render('manager_schedule_movie', {title: "Dear manager, you're welcome to schedule some movies!",
            movies: movies, errors: [], sess: req.session});
    });
};


exports.schedule_movie_post = [
    // validate fields
    //body('managerName', 'managerName must not be empty.').isLength({ min: 1 }).trim(),
    body('movieName', 'movieName must not be empty.').isLength({ min: 1 }).trim(),
    body('releaseDate', 'releaseDate must not be empty.').isLength({ min: 1 }).trim(),
    body('playDate', 'playDate must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),

    (req, res, next) => {
        // check privilage
        if (req.session.isManager === null || req.session.isManager != 1) {
            res.render('index', { title: 'Hello',
                errors: [{msg: "You are not a manager, you have no right to view the page!"}], sess: req.session});
            return;
        }
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        console.log(errors);

        // if have logic errors
        if (!errors.isEmpty() || req.body.playDate < req.body.releaseDate) {
            var sql = "Select Name from movie";
            var movies = [];
            db.query(sql, [], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                console.log("successfully retrieved the movie list!");
                movies = results;
                var errorsToDisplay = (req.body.playDate < req.body.releaseDate) ? [{msg: 'play date must be after release date'}] : errors.array();
                res.render('manager_schedule_movie', {title: "Wrong info typed!",
                    movies: movies, errors: errorsToDisplay, sess: req.session});
            });
        } else {
            //var managerName = req.body.managerName;
            var managerName = req.session.username;
            var movieName = req.body.movieName;
            var releaseDate = req.body.releaseDate;
            var playDate = req.body.playDate;

            var testCapacitySql = "Select Capacity From theater Where theater.ManagerUsername = '" + managerName + "';";
            console.log(testCapacitySql);
            db.query(testCapacitySql, [], (error, results, fields) => {
                var capacity = results[0]['Capacity']; // get the capacity
                //var getCurCapacitySql = "Select Count(*) From theater Where theater.ManagerUsername = '" + managerName + "'" + " and " + "theater."     ";";
                var getCurCapacitySql = 'SELECT COUNT(*) AS Capacity \n' +
                    '\tFROM theater AS t, movieplay AS m\n' +
                    '    WHERE t.ManagerUsername = \'' + managerName + '\' AND t.TheaterName = m.TheaterName AND m.DATE = \' '+ playDate + '\';';
                console.log(getCurCapacitySql);
                db.query(getCurCapacitySql, [], (error, results, fields) => {
                    var curCapacity = results[0]['Capacity'];
                    console.log(curCapacity);
                    if (curCapacity >= capacity) {
                        var sql = "Select Name from movie";
                        var movies = [];
                        db.query(sql, [], (error, results, fields) => {
                            if (error) {
                                return console.error(error.message);
                            }
                            console.log("successfully retrieved the movie list!");
                            movies = results;
                            var errorsToDisplay = (req.body.playDate < req.body.releaseDate) ? [{msg: 'play date must be after release date'}] : errors.array();
                            res.render('manager_schedule_movie', {title: "Wrong info typed!",
                                movies: movies, errors: [{msg: "Theater capacity exceeded, you cannot schedule more movies to that day!"}], sess: req.session});
                            return;
                        });
                    }
                });
            });

            console.log(req.body);
            var sql = "call manager_schedule_mov(?, ?, ?, ?)";
            db.query(sql, [managerName, movieName, releaseDate, playDate], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                res.redirect('/managerScheduleMoviePlay');
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