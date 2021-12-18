const app = require('express')();
const http = require('http').Server(app);
const https = require('https')
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const express = require('express')
const KILL_PLAYERS_AFTER = 2000
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
      description:"Arising out of the constraints of the current pandemic, we developed the concept of an additional 4th, web-based gallery room, which offers a curated program and can be visited in perpetuity. We would like to permanently expand our exhibition program by adding additional art formats.<br>We are making the 4th room available for digital or hybrid projects by artists who have gone through our application and selection process.<br>We would like to utilize Frappant’s 4th Room in order to expand the range of artistic formats and media we present, to invite national and international media artists to realize their artistic concepts with us, to enable interactive and hybrid art formats and reach art-interested visitors in and beyond Hamburg.<br>In December 2021, Frappant 4th Room will be kicking off with the following pilot projects:<br><br>RAPID RABBIT RELOADED<br>by Stefan Moos & Allan Dorr<br>Project start: December 19, 2021<br><br>GECLOUDTE SPUREN<br>Digital art project by students in Prof. Aram Bartholl’s Digital Media Art class, University of Applied Sciences, Hamburg.<br>Project start: June 24, 2022",
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
      description: "Frappant 4th Room and the pilot art projects are being supported by <a href='https://www.kulturgemeinschaften.de/' target='_blank'>KULTUR.GEMEINSCHAFTEN</a> – sponsorship program for digital content production at cultural institutions and by <a href='https://neustartkultur.de/' target='_blank'>NEUSTART KULTUR</a> – Program 2.<br>We would like to thank the <a href='https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/staatsministerin-fuer-kultur-und-medien' target='_blank'>Federal Commission for Culture and Media</a>, the <a href='https://www.kulturstiftung.de/' target='_blank'>Cultural Foundation of the German States</a>, the <a href='https://www.soziokultur.de/' target='_blank'>Federal Association for Socioculture e.V.</a>, the <a href='https://www.hamburg.de/bkm/' target='_blank'>Hamburg Authority for Culture and Media</a>, as well as the <a href='https://frappant.org' target='_blank'>Frappant e.V</a> for their friendly support.",
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
    id: "rapidrabbit",
    x: 12,
    y: 12,
    poi: true,
    exhibit: true,
    state: {
      plan: [[3,0,4,3,2,4,0,2],["#d3af4d","#000000","#ffffff","#ee2a8b","#ee2a8b","#ffffff","#000000","#d8ab4b"]],
      artists:"Various Artists",
      date:"19.12.21 – 15.09.22",
      description:"The actual impact of digitalization on our work as artists, scientists, musicians, people.<br>Exhibition, Talks, Sound, Chat, Archive<br>Observations of the works of artists, scientists, musicians, people, and internet findings from the digital age.<br><br>Sonntag, 9. Januar 2022, 15h: Kathrin Wildner & Michael Maierhof<br><br>Sonntag, 6. Februar 2022, 15h, Nina Lucia Groß & Magdalena Grüner<br><br>Sonntag, 6. März 2022, 15h Martin Zellerhoff<br><br>Sonntag, 10. April 2022, 15h Petra Bopp<br><br>Sonntag, 24. April 2022, 15h, Franziska Beyer<br><br>Sonntag, 15. Mai 2022, 15h, HFBK-Klassen Jeanne Faust, Michaela Melián<br><br>Sonntag, 5. Juni 2022, 15h, Ansgar Wilken (Konzert)<br><br>Sonntag, 12. Juni 2022, 15h, Claudia Reiche",
      link: "https://raprab.net/22"
    }
  }
}
let players = {}

app.use('/static', express.static(__dirname + '/static'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/edit', (req, res) => {
  res.sendFile(__dirname + '/edit.html');
});
app.get('/connect', (req, res) => {
  res.sendFile(__dirname + '/dervierteraum.js');
});
app.get('/button', (req, res) => {
  res.sendFile(__dirname + '/back.jpg');
});
io.on("connection", (socket) => {
  socket.on("join", msg => {
    players[msg.id] = {
      id: msg.id,
      x: msg.position && msg.position.x ? msg.position.x : -10 + Math.floor(Math.random() * 20),
      y: msg.position && msg.position.y ? msg.position.y : -10 + Math.floor(Math.random() * 20),
      state: msg.state,
      alive: KILL_PLAYERS_AFTER,
      poi: false
    }
    io.emit('poi', poi);
  });
  socket.on("alive", msg => {
    if(players[msg.id]){
      players[msg.id].alive = KILL_PLAYERS_AFTER
      players[msg.id].x = msg.x
      players[msg.id].y = msg.y
      players[msg.id].state = msg.state
    }

    // else{
    //   io.emit('logout', msg);
    // }
  })
  socket.on("kill", msg => {
    if(players[msg.id]){
      delete players[msg.id]
    }
  })
  setInterval(update, 100);
});
function update(){
  for(let p in players){
    if(players[p].alive <= 0){
      delete players[p]
    }
    else if(!players[p].bot){
      players[p].alive--
    }
    // if(players[p].state.flash > 0){
    //   players[p].state.flash = players[p].state.flash - 0.01
    // }
  }
  io.emit('update', players);
}

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
