var express = require('express');
var router = express.Router();

var manager_controller =require('../Controller/manager_controller');
var admin_controller = require('../Controller/admin_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Hello' });
});

// GET request for rendering a initial view
router.get('/theaterDetail', manager_controller.theater_detail_get);

// If manager requests to list info about theaters
router.get('/theaterDetail/getInfo', manager_controller.theater_detail_update);

// Get and post for manager schedule movie
router.get('/managerScheduleMoviePlay', manager_controller.schedule_movie_get);

// Get and post for manager schedule movie
router.post('/managerScheduleMoviePlay', manager_controller.schedule_movie_post);


// Get and post for admin manage user (screen 13)
router.get('/adminManageUser', admin_controller.user_detail_update);
router.post('/adminManageUser', admin_controller.user_detail_changestatus);
router.get('/adminManageUser/sort', admin_controller.user_detail_sort);


// Get and post for admin create theater (screen 15)
router.get('/adminCreateTheater', admin_controller.create_theater_get);
router.post('/adminCreateTheater', admin_controller.create_theater_post);

// Get and post for admin create movie (screen 17)
router.get('/adminCreateMovie', admin_controller.create_movie_get);
router.post('/adminCreateMovie', admin_controller.create_movie_post);


module.exports = router;
