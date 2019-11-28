exports.admin_only = function(req, res, next){
    if (req.session.isAdmin === null || req.session.isAdmin != 1) {
        res.render('index', { title: 'Hello',
            errors: [{msg: "You are not an administrator, you have no right to view the page!"}], sess: req.session});
    }  else {
        res.render('admin_only_functionality', {errors: []});

    }
}

exports.admin_customer = function(req, res, next){
    if (req.session.isAdmin === null || req.session.isAdmin != 1 || req.session.isCustomer === null || req.session.isCustomer != 1) {
        res.render('index', { title: 'Hello',
            errors: [{msg: "You are not an administrator&customer, you have no right to view the page!"}], sess: req.session});
    }  else {
        res.render('admin_customer_functionality', {errors: []});

    }
}

exports.manager_only = function(req, res, next){
    if (req.session.isManager === null || req.session.isManager != 1) {
        res.render('index', { title: 'Hello',
            errors: [{msg: "You are not a manager, you have no right to view the page!"}], sess: req.session});
    }  else {
        res.render('manager_only_functionality', {errors: []});

    }
}

exports.manager_customer = function(req, res, next){
    if (req.session.isManager === null || req.session.isManager != 1 || req.session.isCustomer === null || req.session.isCustomer != 1) {
        res.render('index', { title: 'Hello',
            errors: [{msg: "You are not a manager&customer, you have no right to view the page!"}], sess: req.session});
    }  else {
        res.render('manager_customer_functionality', {errors: []});

    }
}

exports.customer = function(req, res, next){
    if (req.session.isCustomer === null || req.session.isCustomer != 1) {
        res.render('index', { title: 'Hello',
            errors: [{msg: "You are not a customer, you have no right to view the page!"}], sess: req.session});
    }  else {
        res.render('customer_functionality', {errors: []});

    }
}

exports.user = function(req, res, next){
    res.render('user_functionality', {errors: []});

}