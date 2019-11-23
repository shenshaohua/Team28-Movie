var express = require('express');
var router = express.Router();

var manager_controller =require('../Controller/manager_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Hello' });
});

// GET request for rendering a initial view
router.get('/theaterDetail', manager_controller.theater_detail_get);

// Get and post for manager schedule movie
router.get('/managerScheduleMoviePlay', manager_controller.schedule_movie_get);

// Get and post for manager schedule movie
router.post('/managerScheduleMoviePlay', manager_controller.schedule_movie_post);




module.exports = router;
