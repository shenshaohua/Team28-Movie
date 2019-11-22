let async = require('async');

const { validator } = require('express-validator');

exports.theater_detail_get = function (req, res, next) {

    if (isEmpty(req.query))    {

        // render with (viewPage, parameters)
        res.render('manager_theater_overview', {title: 'Manager peeking theaters\' detail',
                                                data: []});
    } else {
        var managerName = req.query.managerName;
        var movieName = req.query.movieName;
        var durationStartINT = parseInt(req.query.durationStart);
        var durationEndINT = parseInt(req.query.durationEnd);
        var minMoviePlayDate = req.query.playDateStart;
        var maxMoviePlayDate = req.query.playDateEnd;
        var minReleaseDate = req.query.releaseStart;
        var maxReleaseDate = req.query.releaseEnd;
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
            //console.log(results);
            res.render('manager_theater_overview', {title: 'Here comes your result!',
                data: results});
        });
    }

}


// Some helper functions:

// this is a function that validates whether a javascript object is empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
