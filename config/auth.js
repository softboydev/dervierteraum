module.exports = {
    ensureAuthenticated : function(req,res,next) {
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg' , 'please login to view this resource');
        res.redirect('/project/login');
    },
    ensureAuthenticatedAdmin : function(req,res,next) {
        if(req.isAuthenticated() && req.user.admin) {
            return next();
        }
        req.flash('error_msg' , 'please login as admin to view this resource');
        res.redirect('/admin/login');
    }
}
