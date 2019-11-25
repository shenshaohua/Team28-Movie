var express = require('express');
var router = express.Router();

var manager_controller =require('../Controller/manager_controller');
const customer_controller = require("../Controller/customer_controller");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Hello' });
});

// GET request for rendering a initial view
router.get('/theaterDetail', manager_controller.theater_detail_get);

router.get('/customer_explore_movie',customer_controller.customerMovieFilterGet);
router.get('/customer_explore_movie/movieInfo',customer_controller.customerMovieFilter);
router.get('/view_history',customer_controller.customerViewHistory);


module.exports = router;
