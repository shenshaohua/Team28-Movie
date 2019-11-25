var express = require('express');
var router = express.Router();

var manager_controller =require('../Controller/manager_controller');
var login_controller =require('../Controller/login_controller');
var register_controller =require('../Controller/register_controller');

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

router.get('/login', login_controller.login_get);

router.post('/login', login_controller.login_post);

router.get('/nevigate', login_controller.nevigate_get);

router.get('/userRegister', register_controller.user_register_get);

router.post('/userRegister', register_controller.user_register_post);

router.get('/customerRegister', register_controller.customer_register_get);

router.post('/customerRegister', register_controller.customer_register_post);


module.exports = router;
