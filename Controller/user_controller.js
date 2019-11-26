let async = require('async');
let dateFormat = require('dateformat');
let session = require("express-session");
var companies = [];
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
        companies.push(rows[i]['CompanyName']);
    }
    db.query(testSql, [], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        res.render('user_visit_history', {
            title: "Visit History",
            companyName: "ALL",
            companies: companies,
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