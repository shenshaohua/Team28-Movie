let async = require('async');

const { body,validationResult, query } = require('express-validator/check');
const { sanitizeBody, sanitizeQuery } = require('express-validator/filter');

let dateFormat = require('dateformat');


exports.theater_detail_get = function (req, res, next) {
    res.render('manager_theater_overview', {title: 'Manager peeking theaters\' detail',
        data: [], errors: []});
}

exports.theater_detail_update = [
    // Validate fields.
    query('managerName', 'managerName must not be empty.').isLength({ min: 1 }).trim(),
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

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // if have logic errors
        if (!errors.isEmpty()) {
            res.render('manager_theater_overview', {title: 'Manager peeking theaters\' detail',
                data: [], errors: errors.array()});
        }
        else if (isEmptyObj(req.query))    {

            // render with (viewPage, parameters)
            res.render('manager_theater_overview', {title: 'Manager peeking theaters\' detail',
                data: [], errors: []});
        } else {
            var managerName = req.query.managerName;
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
                    data: updatedResults, errors: []});
            });
        }
    }
];

exports.schedule_movie_get = function (req, res, next) {
    var sql = "Select Name from movie";
    var movies = [];
    db.query(sql, [], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        console.log("successfully retrieved the movie list!");
        //console.log(results);
       // console.log(results.length);
        movies = results;
        console.log(movies);
        res.render('manager_schedule_movie', {title: "Dear manager, you're welcome to schedule some movies!", movies: movies, errors: []});
    });
}

exports.schedule_movie_post = [
    // validate fields
    body('managerName', 'managerName must not be empty.').isLength({ min: 1 }).trim(),
    body('movieName', 'movieName must not be empty.').isLength({ min: 1 }).trim(),
    body('releaseDate', 'releaseDate must not be empty.').isLength({ min: 1 }).trim(),
    body('playDate', 'playDate must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields (using wildcard).
    sanitizeQuery('*').escape(),

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // if have logic errors
        if (!errors.isEmpty()) {
            var sql = "Select Name from movie";
            var movies = [];
            db.query(sql, [], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                console.log("successfully retrieved the movie list!");
                movies = results;
                res.render('manager_schedule_movie', {title: "Wrong info typed!", movies: movies, errors: errors.array()});
            });
        } else {
            var managerName = req.body.managerName;
            var movieName = req.body.movieName;
            var releaseDate = req.body.releaseDate;
            var playDate = req.body.playDate;

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
