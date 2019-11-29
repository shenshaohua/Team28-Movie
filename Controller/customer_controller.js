let async = require('async');
let dateFormat = require('dateformat');
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
    res.render('customer_explore_movie', {title: "Explore Movie", sess: req.session, movies: movies, companies: companies,states: states,data: data, cards: cards});
};
exports.customerViewMovie = [
    async (req, res, next) => {
        var username = req.session.username;
        if (!req.query.view_movie) {
            res.render('view_movie', {error: 1, movName: "",left:0});
        } else {
            var view_movie = req.query.view_movie;
            var selected = data[parseInt(view_movie)];
            var playDate = dateFormat(selected['movPlayDate'],"yyyy-mm-dd");
            var sql = "select count(*) from (select * from creditcardusage natural join creditcard) t where creditcardowner = \"" + username + "\" and date = \"" + playDate + "\";";
            var count = await dbquery(sql, []);
            if (parseInt(count[0]['count(*)']) == 3) {
                res.render('view_movie', {error: 2, movName: "", left: 0});
            } else {
                var view_movie = req.query.view_movie;
                var card = req.query.cardNumber;
                var selected = data[parseInt(view_movie)];
                var sql = "call customer_view_mov(?,?,?,?,?,?);";
                db.query(sql, [card, selected['movName'], selected['movReleaseDate'], selected['thName'], selected['comName'], selected['movPlayDate']], (error, results, fields) => {
                    if (error) {
                        return console.error(error.message);
                    }
                });
                res.render('view_movie', {error: 0, movName: selected['movName']});
            }
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
        res.render('view_history', {title: "Explore Movie", sess: req.session, data: results});
    });
};