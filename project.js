const express = require('express');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const router = express.Router();
const User = require("./models/user");
const Project = require("./models/project");
const bcrypt = require('bcrypt');
const Passport = require('passport').Passport
var passport = require('passport')
require('./config/passport')(passport);
const {ensureAuthenticated,ensureAuthenticatedAdmin} = require('./config/auth')
//login handle
router.get('/login',(req,res)=>{
    res.render("project/login")
})
router.get('/',(req,res)=>{
    res.redirect('/project/dashboard');
})
router.get('/dashboard',ensureAuthenticated,(req,res)=>{
  if(req.user.admin){
    res.redirect('/admin/dashboard');
  }
  else{
    res.render('project/dashboard',{
        user: req.user
    });
  }
})
//Register handle
router.post('/login',urlencodedParser,(req,res,next)=>{
  passport.authenticate('local',{
      successRedirect : '/project/dashboard',
      failureRedirect: '/project/login',
      failureFlash : true
  })(req,res,next)
})
//register post handle
router.post('/create',urlencodedParser,(req,res)=>{
  let errors = []
  const {projectname} = req.body
  if(!projectname) {
      errors.push({msg : "Please fill in all fields"})
  }
  if(errors.length > 0 ) {
    res.render('project/create', {
        errors : errors,
        projectname: projectname
      })
   }
   else{
     Project.findOne({projectname: projectname}).exec((err,project)=>{
      if(project) {
        console.log(projectname,project)
          errors.push({msg: 'projectname already registered'});
          res.render('project/create',{errors,projectname})
       }
       else {
          const newProject = new Project({
              projectname: projectname
          })
          newProject.save()
          .then((value)=>{
              req.flash('success_msg','Project created!');
              res.redirect('/admin/dashboard');
          })
        }
      })
   }
  })
//logout
router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success_msg','Now logged out');
  res.redirect('/project/login');
})
module.exports  = router;
