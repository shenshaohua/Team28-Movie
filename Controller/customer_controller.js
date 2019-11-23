let async = require('async');

const { validator } = require('express-validator');

exports.customerMovieFilter = function (req, res, next) {

    if (isEmpty(req.query))    {

        // render with (viewPage, parameters)
        res.render('customer_explore_movie', {title: 'Explore Movie',
                                                data: []});
    } else {
        var companyName = req.query.companyName;
        var movieName = req.query.movieName;
        var playStartDate = req.query.playStartDate;
        var playEndDate = req.query.playEndDate;
        var city = req.query.city;
        var state = req.query.state;
        // call procedure first, create the table that has information
        var testSql = "call customer_filter_mov(?, ?, ?, ?, ?, ?)";
        db.query(testSql, [movieName, companyName, city, state, playStartDate, playEndDate], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
                //console.log("successfully create the info table 'manfilterth' ");
        });

        // poll from newly created table and send it to our view
        var pollSql = "Select * From CosFilterMovie";
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
