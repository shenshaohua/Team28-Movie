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
var theaters = ["ALL"];
var companies = ["ALL"];
var companyVisit = ["ALL"];
var states = ["ALL"];
var data;
//Screen 22 implementation
exports.userExploreTheaterGet = async function (req, res, next) {
    var sql = "select * from theater;";
    var results = await dbquery(sql,[]);
    for (var i = 0; i < results.length; i++) {
        if (!theaters.includes(results[i]['TheaterName'])) {
            theaters.push(results[i]['TheaterName']);
        }
        if (!states.includes(results[i]['State'])) {
            states.push(results[i]['State']);
        }
        if (!companies.includes(results[i]['CompanyName'])) {
            companies.push(results[i]['CompanyName']);
        }
    }
    var theater = req.query.theaters;
    var company = req.query.companies;
    var city = req.query.city;
    var state = req.query.states;
    sql = "call user_filter_th(?,?,?,?);";
    db.query(sql, [theater,company,city,state], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
    });
    sql = "select * from UserFilterTh;";
    data = await dbquery(sql, []);
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    }
    if(mm<10){
        mm='0'+mm
    }
    today = yyyy+'-'+mm+'-'+dd;
    res.render('user_explore_theater',{title: "Explore Theater", sess:req.session, theaters:theaters, states: states, companies: companies, data: data, today: today});
};
exports.userVisitTheater = [
    (req, res, next) => {
        var username = req.session.username;
        if (!req.query.visit_theater) {
            res.render('visit_theater', {error: 2, theaterName: ""});
        } else if (!req.query.visitDate) {
            res.render('visit_theater', {error: 1, theaterName: ""});
        } else {
            var view_movie = req.query.visit_theater;
            var date = req.query.visitDate;
            var selected = data[parseInt(view_movie)];
            var sql = "call user_visit_th(?,?,?,?);";
            db.query(sql, [selected['thName'], selected['comName'], date, username], (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }
            });
            res.render('visit_theater', {error: 0, theaterName: selected['thName']});
        }
    }
];

//Screen 23 implementation
exports.userVisitHistoryGet = async function (req, res, next) {
    var username = req.session.username;
    // call procedure first, create the table that has information
    var testSql = "call user_filter_visitHistory(?, ?, ?)";
    db.query(testSql, [username, null, null], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
    });
    testSql = "Select * From UserVisitHistory";
    var rows = await dbquery(testSql, []);
    for (var i = 0; i < rows.length; i++) {
        if (!companyVisit.includes(rows[i]['comName'])) {
            companyVisit.push(rows[i]['comName']);
        }
    }
    var sess = req.session;
    db.query(testSql, [], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        res.render('user_visit_history', {
            title: "Visit History",
            companyName: "ALL",
            companies: companyVisit,
            data: [],
            sess: req.session
        });
    });
};
exports.userVisitHistoryFilter = [
    async (req, res, next) => {
        var username = req.session.username;
        var testSql = "call user_filter_visitHistory(?, ?, ?)";
        var start = dateFormat(req.query.visitStartDate, "yyyy-mm-dd");
        var companyName = req.query.company;
        var end = dateFormat(req.query.visitEndDate, "yyyy-mm-dd");
        if (!req.query.visitStartDate) {
            start = null
        }
        if (!req.query.visitEndDate) {
            end = null
        }
        db.query(testSql, [username, start, end], (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
        });
        testSql = "Select * From UserVisitHistory";
        db.query(testSql, [], (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            res.render('user_visit_history', {
                title: "Visit History",
                companyName: companyName,
                companies : companies,
                data: results,
                sess: req.session
            });
        });
    }
];