const APP = require('EXPRESS')();
const EXPRESS = require('EXPRESS')
const HTTP = require('http').Server(APP);
const IO = require('socket.io')(HTTP);
const PORT = process.env.PORT || 3000;
const KILL_PLAYERS_AFTER = 2000
const MONGOOSE = require('mongoose');
const expressEjsLayout = require('express-ejs-layouts')
const flash = require('connect-flash');
const session = require('express-session');
const passport = require("passport");
const bcrypt = require('bcrypt');
const User = require("./models/user");
MONGOOSE.connect('mongodb://localhost/test',{useNewUrlParser: true, useUnifiedTopology : true})
.then(() => {
  init()
}).catch((err)=> console.log(err));

function listen(){
  HTTP.listen(PORT, () => {
    console.log(`Socket.IO server running at http://localhost:${PORT}/`);
  });
}
async function init() {
  console.log("creating admin...");
  let username = "admin"
  let password = "admin"
  User.findOne({username: username}).exec((err,admin)=>{
   if(admin) {
     console.log("...admin already exists")
     listen()
   }
   else{
      const admin = new User({
        username: "admin",
        password: "admin",
        admin: true
      })
      bcrypt.genSalt(10,(err,salt)=>
      bcrypt.hash(admin.password,salt,
          (err,hash)=> {
              if(err) throw err;
                  admin.password = hash;
                  admin.save()
                  .then((value)=>{
                      console.log("...admin created");
                      listen()
                  })
                  .catch(value=> console.log(value));
      }));
    }
  })
}

const poi = {
  "6;8": {
    name: "Frappant",
    id: "frappant",
    x: 18,
    y: 18,
    poi: true,
    state: {
      plan: [[1,5,2,0,1,0,3,1],["#fff","#fff","#fff","#000","#fff","#000","#fff","#fff"]],
      artists:false,
      date:false,
      description:"The Frappant Gallery is a non-commercial white cube situated directly in the middle of the larger, cooperatively administrated center for art, alternative culture, education, creative industries and social policy located at the former Viktoria Barracks in Hamburg Altona.<br>Every year, in its three rooms, the 145 m2 gallery offers a continuous program of 20 exhibits of contemporary and experimental visual art.",
      link: "https://frappant.org",
      linktitle: "Open Website"
    }
  },
  "12;12": {
    name: "About",
    id: "about",
    x: 6,
    y: 18,
    poi: true,
    state: {
      plan: [[1,5,5,5,5,1,0,4],["#fff","#fff","#fff","#fff","#fff","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"Arising out of the constraints of the current pandemic, we developed the concept of an additional 4th, web-based gallery room, which offers a curated program and can be visited in perpetuity. We would like to permanently expand our exhibition program by adding additional art formats.<br>We are making the 4th room available for digital or hybrid projects by artists who have gone through our APPlication and selection process.<br>We would like to utilize Frappant’s 4th Room in order to expand the range of artistic formats and media we present, to invite national and international media artists to realize their artistic concepts with us, to enable interactive and hybrid art formats and reach art-interested visitors in and beyond Hamburg.<br>In December 2021, Frappant 4th Room will be kicking off with the following pilot projects:<br><br>RAPID RABBIT RELOADED<br>by Stefan Moos & Allan Dorr<br>Project start: December 19, 2021<br><br>GECLOUDTE SPUREN<br>Digital art project by students in Prof. Aram Bartholl’s Digital Media Art class, University of Applied Sciences, Hamburg.<br>Project start: June 24, 2022",
      link: false,
    }
  },
  "4;12": {
    name: "Funders",
    id: "funders",
    x: 6,
    y: 6,
    poi: true,
    state: {
      plan: [[1,4,4,4,4,1,0,4],["#fff","#fff","#fff","#fff","#fff","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description: "Frappant 4th Room and the pilot art projects are being supPORTed by <a href='https://www.kulturgemeinschaften.de/' target='_blank'>KULTUR.GEMEINSCHAFTEN</a> – sponsorship program for digital content production at cultural institutions and by <a href='https://neustartkultur.de/' target='_blank'>NEUSTART KULTUR</a> – Program 2.<br>We would like to thank the <a href='https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/staatsministerin-fuer-kultur-und-medien' target='_blank'>Federal Commission for Culture and Media</a>, the <a href='https://www.kulturstiftung.de/' target='_blank'>Cultural Foundation of the German States</a>, the <a href='https://www.soziokultur.de/' target='_blank'>Federal Association for Socioculture e.V.</a>, the <a href='https://www.hamburg.de/bkm/' target='_blank'>Hamburg Authority for Culture and Media</a>, as well as the <a href='https://frappant.org' target='_blank'>Frappant e.V</a> for their friendly supPORT.",
      link: false,
    }
  },
  "18;12": {
    name: "Contact",
    id: "contact",
    x: 0,
    y: 11,
    poi: true,
    state: {
      plan: [[1,5,5,1,0,1,0,1],["#fff","#fff","#fff","#fff","#000","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"Get in touch if you would like to exhibit here or become a part of the 'Vierter Raum' Team",
      link: "mailto:ausstellung@frappant.org",
      linktitle: "Write Us"
    }
  },
  "8;0": {
    name: "Instagram",
    id: "instagram",
    x: 6,
    y: 12,
    poi: true,
    state: {
      plan: [[5,1,0,3,0,4,0,2],["#fff","#fff","#000","#fff","#000","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"Follow us on Instagram to stay up to date about upcoming exhibitions and more.",
      link: "https://instagram.com/dervierteraum",
      linktitle: "Follow Us"
    }
  },
  "16;7": {
    name: "Rapid Rabbit Reloaded",
    id: "raprab",
    x: 12,
    y: 12,
    poi: true,
    exhibit: true,
    state: {
      plan: [[3,0,4,3,2,4,0,2],["#d3af4d","#000000","#ffffff","#ee2a8b","#ee2a8b","#ffffff","#000000","#d8ab4b"]],
      artists:"Various Artists",
      date:"19.12.21 – 15.09.22",
      description:"Exhibition, Talks, Sound, Chat, Archive<br>Observations of the works of artists, scientists, musicians, people, and internet findings from the digital age.<br><br>Sonntag, 9. Januar 2022, 15h: Kathrin Wildner & Michael Maierhof<br><br>Sonntag, 6. Februar 2022, 15h, Nina Lucia Groß & Magdalena Grüner<br><br>Sonntag, 6. März 2022, 15h Martin Zellerhoff<br><br>Sonntag, 10. April 2022, 15h Petra Bopp<br><br>Sonntag, 24. April 2022, 15h, Franziska Beyer<br><br>Sonntag, 15. Mai 2022, 15h, HFBK-Klassen Jeanne Faust, Michaela Melián<br><br>Sonntag, 5. Juni 2022, 15h, Ansgar Wilken (Konzert)<br><br>Sonntag, 12. Juni 2022, 15h, Claudia Reiche",
      link: "https://raprab.net/22"
    }
  }
}
let PLAYERS = {}
APP.set('view engine','ejs');
APP.use(expressEjsLayout);
//BodyParser
APP.use(EXPRESS.urlencoded({extended : false}));
//express session
APP.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}));
APP.use(passport.initialize());
APP.use(passport.session());
APP.use(flash());
APP.use((req,res,next)=> {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error  = req.flash('error');
    next();
    })
APP.use('/static', EXPRESS.static(__dirname + '/static'));
APP.use('/project',require('./project'));
APP.use('/admin',require('./admin'));
APP.get('/', (req, res) => { //index page
  res.sendFile(__dirname + '/views/index.html');
});
APP.get('/connect', (req, res) => { //connection script
  res.sendFile(__dirname + '/static/js/dervierteraum.js');
});
APP.get('/button', (req, res) => { //externally available graphics
  res.sendFile(__dirname + '/static/img/back.jpg');
});
IO.on("connection", (socket) => {
  socket.on("join", msg => { //when a players joins
    PLAYERS[msg.id] = { //save to player object
      id: msg.id,
      x: msg.positIOn && msg.positIOn.x ? msg.positIOn.x : -10 + Math.floor(Math.random() * 20),
      y: msg.positIOn && msg.positIOn.y ? msg.positIOn.y : -10 + Math.floor(Math.random() * 20),
      state: msg.state,
      alive: KILL_PLAYERS_AFTER //resetted alive flag
    }
    IO.emit('poi', poi) //emit poi once, only players that havent downloaded it yet will store it
  });
  socket.on("alive", msg => { //upon alive callback
    if(PLAYERS[msg.id]){
      PLAYERS[msg.id].alive = KILL_PLAYERS_AFTER //reset the clock
      PLAYERS[msg.id].x = msg.x //copy over position and state
      PLAYERS[msg.id].y = msg.y
      PLAYERS[msg.id].state = msg.state
    }
    // else{
    //   IO.emit('logout', msg);
    // }
  })
  socket.on("kill", msg => { //when a player exits
    if(PLAYERS[msg.id]){ //remove from object
      delete PLAYERS[msg.id]
    }
  })
  setInterval(update, 100) //set up update interval
});
function update(){
  for(let p in PLAYERS){ //for every player
    if(PLAYERS[p].alive <= 0){ //when callback didnt return for too lonbg
      delete PLAYERS[p] //kill it with fire
    }
    else{
      PLAYERS[p].alive-- //else count down the clock
    }
    // if(PLAYERS[p].state.flash > 0){
    //   PLAYERS[p].state.flash = PLAYERS[p].state.flash - 0.01
    // }
  }
  IO.emit('update', PLAYERS) //send an update with new player object
}
