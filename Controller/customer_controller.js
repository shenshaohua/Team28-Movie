let async = require('async');
let dateFormat = require('dateformat');
let session = require("express-session");
const { body, validationResult, query,sanitizeBody, sanitizeQuery } = require('express-validator');
const dbquery = function (sql, values) {
    return new Promise((resolve, reject) => {
        db.query(sql,values, (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        });
    })
};
var movies = ["ALL"];
var companies = ["ALL"];
var states = ["ALL"];
var cards = [];
var data;
var count = 0;
//Screen 20 implementation
exports.customerMovieFilterGet = async function (req, res, next) {
    // call procedure first, create the table that has information
    var testSql = "call customer_filter_mov(?, ?, ?, ?, ?, ?);";
    var username = req.session.username;
    db.query(testSql, ["ALL","ALL","","ALL",null,null], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
    });
    var pollSql = "Select * From CosFilterMovie;";
    var results = await dbquery(pollSql, []);
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
    var movieName = req.query.movieName;
    var city = req.query.city;
    var state = req.query.state;
    var companyName = req.query.companyName;
    var start = dateFormat(req.query.playStartDate, "yyyy-mm-dd");
    var end = dateFormat(req.query.playEndDate, "yyyy-mm-dd");
    if (!req.query.playStartDate) {
        start = null;
    }
    if (!req.query.playEndDate) {
        end = null;
    }
    db.query(testSql, [movieName, companyName, city, state, start, end], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
    });
    data = await dbquery(pollSql, []);
    pollSql = "select CreditCardNum from creditcard where CreditCardOwner = \"" + username + "\";";
    cards = await dbquery(pollSql, []);
    res.render('customer_explore_movie', {title: "Explore Movie", movies: movies, companies: companies,states: states,data: data, cards: cards});
};
exports.customerViewMovie = [
    (req, res, next) => {
        var today = new Date();
        var time = today.getHours() + today.getMinutes() + today.getSeconds();
        if (time == 0) {
            count = 0;
        }
        if (!req.query.view_movie) {
            res.render('view_movie', {error: 1, movName: "",left:0});
        } else if (count == 3) {
            res.render('view_movie', {error: 2, movName: "",left:0});
        } else {
            count ++;
            var view_movie = req.query.view_movie;
            var card = req.query.cardNumber;
            var selected = data[parseInt(view_movie)];
            var sql = "call customer_view_mov(?,?,?,?,?,?);";
            db.query(sql, [card, selected['movName'], selected['movReleaseDate'], selected['thName'], selected['comName'], selected['movPlayDate']], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
            });
            res.render('view_movie', {error: 0, movName: selected['movName'],left:3-count});
        }
    }
];
//Screen 21 implementation
exports.customerViewHistory = function (req, res, next) {
    var username = req.session.username;
    var testSql = "call customer_view_history(?);";
    db.query(testSql, [username], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
    });
    testSql = "select * from cosviewhistory;";
    db.query(testSql, [username], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        res.render('view_history', {title: "Explore Movie", data: results});
    });
};