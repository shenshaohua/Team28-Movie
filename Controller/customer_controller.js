let async = require('async');

const { validator } = require('express-validator');
exports.customerMovieFilterGet = function (req, res, next) {
    // call procedure first, create the table that has information
    var testSql = "call customer_filter_mov(?, ?, ?, ?, ?, ?)";
    db.query(testSql, ["ALL","ALL","","ALL",null,null], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
    });
    var pollSql = "Select * From CosFilterMovie";
    db.query(pollSql,[] , (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        var movies = ["ALL"];
        var states = ["ALL"];
        var companies = ["ALL"];
        for (var i = 0; i < results.length; i++) {
            if (!movies.includes(results[i]['movName'])) {
                movies.push(results[i]['movName']);
            }
            if (!states.includes(results[i]['thState'])) {
                states.push(results[i]['thState']);
            }
            if (!companies.includes(results[i]['comName'])) {
                companies.push(results[i]['comName']);
            }
        }
        res.render('customer_explore_movie', {title: "Explore Movie", movies: movies, companies: companies,states: states,data: []});
    });
}

exports.customerMovieFilter = [
    (req, res, next) => {
        var testSql = "call customer_filter_mov(?, ?, ?, ?, ?, ?)";
        var movieName = req.body.movieName;
        var city = req.query.city;
        var state = req.query.state;
        var companyName = req.query.companyName;
        var start = req.query.playStartDate;
        var end = req.query.playEndDate;
        console.log(req.query);
        db.query(testSql, [movieName, companyName, city,state,start,end], (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
        });
        var pollSql = "Select * From CosFilterMovie";
        db.query(pollSql,[] , (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            res.render('customer_explore_movie', {title: "Explore Movie", movies: movies, companies: companies,states: states,data: []});
        });
    }
]
