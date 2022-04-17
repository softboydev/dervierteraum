const express = require('express');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const router = express.Router();
const User = require("./models/user");
const Project = require("./models/project");
const bcrypt = require('bcrypt');
var passport = require('passport')
require('./config/passport')(passport);
const {ensureAuthenticatedAdmin} = require('./config/auth')
//DASHBOARD
router.get('/',(req,res)=>{
    res.redirect('/admin/dashboard');
})
router.get('/dashboard',ensureAuthenticatedAdmin,async (req,res)=>{
  const projects =  await Project.find({})
  const users =  await User.find({})
    res.render('admin/dashboard',{
        projects: projects,
        users: users,
        user: req.user
    });
})
//LOGIN
router.get('/login',(req,res)=>{
    res.render("admin/login")
})
router.post('/login',urlencodedParser,(req,res,next)=>{
  passport.authenticate('local',{
      successRedirect : '/admin/dashboard',
      failureRedirect: '/admin/login',
      failureFlash : true
  })(req,res,next)
})
//LOGOUT
router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success_msg','Now logged out');
  res.redirect('/admin/login');
})
//USERS
router.get('/user/create',ensureAuthenticatedAdmin,(req,res)=>{
    res.render("admin/user/create")
})
router.post('/user/create',urlencodedParser,(req,res)=>{
  const {username, password, password2} = req.body
  let errors = []
  if(!username || !password || !password2) {
      errors.push({msg : "Please fill in all fields"})
  }
  //check if match
  if(password !== password2) {
      errors.push({msg : "passwords dont match"})
  }
  if(errors.length > 0 ) {
    res.render('admin/(reate', {
        errors : errors,
        projectname: projectname
      })
   } else {
     User.findOne({username: username}).exec((err,user)=>{
      if(user) {
        errors.push({msg: 'projectname already registered'});
        res.render('admin/user/create',{errors,projectname})
      }
      else {
          const newUser = new User({
              username: username,
              password: password,
              admin: false
          })
          bcrypt.genSalt(10,(err,salt)=>
          bcrypt.hash(newUser.password,salt,
              (err,hash)=> {
                  if(err) throw err
                  newUser.password = hash
                  newUser.save()
                  .then((value)=>{
                      req.flash('success_msg','User created!');
                      res.redirect('/admin/dashboard');
                  })
                  .catch(value=> console.log(value));
              }));
           }
     })
  }
})
//PROJECTS
//Create
router.get('/project/create',ensureAuthenticatedAdmin,(req,res)=>{
    res.render("admin/project/create")
})
router.post('/project/create',urlencodedParser,(req,res)=>{
  let errors = []
  const {projectname} = req.body
  if(!projectname) {
      errors.push({msg : "Please fill in all fields"})
  }
  if(errors.length > 0 ) {
    res.render('admin/project/create', {
        errors : errors,
        projectname: projectname
      })
   }
   else{
     Project.findOne({projectname: projectname}).exec((err,project)=>{
      if(project) {
        console.log(projectname,project)
          errors.push({msg: 'projectname already registered'});
          res.render('admin/project/create',{errors,projectname})
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
//Edit
router.get('/project/edit/:project',ensureAuthenticatedAdmin,(req,res)=>{
  let errors = []
  let projectname = req.params.project
  Project.findOne({projectname: projectname}).exec((err,project)=>{
    if(project) {
      res.render("admin/project/edit",{
        project: {
          projectname: project.projectname,
          admin: project.admin,
          enabled: project.administration.enabled,
          x: project.administration.x,
          y: project.administration.y,
          visible: project.visible,
          title: project.metadata.title,
          path: project.metadata.path,
          description: project.metadata.description,
          artists: project.metadata.artists,
          date: project.metadata.date,
          link: project.metadata.link,
          linktitle: project.metadata.linktitle,
          config: project.config
        }
      })
    }
    else {
      res.status(404);
      res.send('The specified project does not exist')
    }
  })
})
router.get('/project/delete/:project',ensureAuthenticatedAdmin,(req,res)=>{
  let projectname = req.params.project
  Project.findOne({projectname: projectname}).exec((err,project)=>{
    if(project) {
      Project.deleteOne({projectname: projectname}).then(function(){
          console.log("Project deleted"); // Success
          req.flash('success_msg','Project removed!')
          res.redirect('/admin/dashboard')
      }).catch(function(error){
          console.log(error); // Failure
          req.flash('success_msg','Project couldnt be removed!')
          res.redirect('/admin/dashboard')
      });
    }
    else {
      req.flash('success_msg','Project couldnt be removed!')
      res.redirect('/admin/dashboard')
    }
  })

})
router.post('/project/update',urlencodedParser,(req,res)=>{
  const project = req.body
  console.log(project)
  let {
      projectname,
      admin,
      enabled,
      x,
      y,
      visible,
      title,
      path,
      description,
      artists,
      date,
      link,
      linktitle,
      config
  } = project
  let errors = []
  Project.findOne({projectname: projectname}).exec((err,target)=>{
    if(target){
      if(!admin || admin == ""){ //remove admin user
        target.admin = ""
        target.administration.enabled = enabled == "true"
        target.administration.x = x
        target.administration.y = y
        target.visible = visible == "true"
        target.metadata.title = title
        target.metadata.path = path
        target.metadata.description = description
        target.metadata.artists = artists
        target.metadata.date = date
        target.metadata.link = link
        target.metadata.linktitle = linktitle
        target.config = config
        target.save().then(savedDoc => {
          req.flash('success_msg','Project updated!')
          res.redirect('/admin/dashboard')
        })
      }
      else{
        User.findOne({username: admin}).exec((err,user)=>{
          if(!user) {
            errors.push({msg: 'selected administrator does not exist registered'});
            res.render('admin/project/edit',{errors,project})
          }
          else{
            target.admin = user.username
            target.administration.enabled = enabled
            target.administration.x = x
            target.administration.y = y
            target.visible = visible
            target.metadata.title = title
            target.metadata.path = path
            target.metadata.description = description
            target.metadata.artists = artists
            target.metadata.date = date
            target.metadata.link = link
            target.metadata.linktitle = linktitle
            target.config = config
            target.save().then(savedDoc => {
              req.flash('success_msg','Project updated!')
              res.redirect('/admin/dashboard')
            })
          }
        })
      }
    }
    else{
      res.status(404);
      res.send('The specified project does not exist')
    }
  })
})
module.exports  = router;
