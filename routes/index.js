var express = require('express');
var router = express.Router();

var func_controller = require('../Controller/func_controller');
var manager_controller = require('../Controller/manager_controller');
var admin_controller = require('../Controller/admin_controller');
var login_controller = require('../Controller/login_controller');
const customer_controller = require("../Controller/customer_controller");
const user_controller = require("../Controller/user_controller");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Hello', errors: [], sess: req.session});
            //sess: {username: "yo", status: "approved", identites: "??"}
});


router.get('/login', login_controller.login_get);
// User entered login information
router.post('/login', login_controller.login_post);

// logout page
router.get('/logout', login_controller.logout_page);

//admin-only(screen 7)
router.get('/adminOnly', func_controller.admin_only);

//admin-costomer(screen 8)
router.get('/adminCustomer', func_controller.admin_customer);

//manager-only(screen 9)
router.get('/managerOnly', func_controller.manager_only);

//manager-costomer(screen 10)
router.get('/managerCustomer', func_controller.manager_customer);

//customer(screen 11)
router.get('/customer', func_controller.customer);

//customer(screen 12)
router.get('/user', func_controller.user);


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

// Get and post for admin manage company (screen 14)
router.get('/adminManageCompany/getInfo', admin_controller.manage_company_get);
router.get('/adminManageCompany/sort', admin_controller.company_detail_sort);

// Get and post for admin manage company (screen 16 is connected to screen 14 with button "Detail", will go back to screen 14 with button "Back")
router.get('/adminCompanyDetail/getInfo', admin_controller.comDetail_get);



// GET request for rendering a initial view
router.get('/theaterDetail', manager_controller.theater_detail_get);

// If manager requests to list info about theaters
router.get('/theaterDetail/getInfo', manager_controller.theater_detail_update);

// Get and post for manager schedule movie
router.get('/managerScheduleMoviePlay', manager_controller.schedule_movie_get);

// Get and post for manager schedule movie
router.post('/managerScheduleMoviePlay', manager_controller.schedule_movie_post);


//20
router.get('/customer_explore_movie',customer_controller.customerMovieFilterGet);
router.get('/customer_explore_movie/view_movie',customer_controller.customerViewMovie);
//21
router.get('/view_history',customer_controller.customerViewHistory);


//22
router.get('/user_explore_theater',user_controller.userExploreTheaterGet);
router.get('/user_explore_theater/visit_theater',user_controller.userVisitTheater);

//23
router.get('/user_visit_history',user_controller.userVisitHistoryGet);
router.get('/user_visit_history/visitInfo',user_controller.userVisitHistoryFilter);


module.exports = router;
