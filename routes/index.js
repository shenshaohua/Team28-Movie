var express = require('express');
var router = express.Router();

var manager_controller =require('../Controller/manager_controller');
const customer_controller = require("../Controller/customer_controller");
var login_controller = require('../Controller/login_controller');
const user_controller = require("../Controller/user_controller");
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Hello', errors:[], sess: req.session} );
});

// GET request for rendering a initial view
router.get('/theaterDetail', manager_controller.theater_detail_get);

router.get('/customer_explore_movie',customer_controller.customerMovieFilterGet);
router.get('/customer_explore_movie/view_movie',customer_controller.customerViewMovie);

router.get('/view_history',customer_controller.customerViewHistory);

router.get('/login', login_controller.login_get);

// User entered login information
router.post('/login', login_controller.login_post);

// logout page
router.get('/logout', login_controller.logout_page);

router.get('/user_visit_history',user_controller.userVisitHistoryGet);
router.get('/user_visit_history/visitInfo',user_controller.userVisitHistoryFilter);

module.exports = router;
