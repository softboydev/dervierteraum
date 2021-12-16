const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const express = require('express');
const KILL_PLAYERS_AFTER = 2000
let poi = {
  "0;0": {
    name: "Frappant",
    id: "frappant",
    x: 0,
    y: 0,
    poi: true,
    vip: true,
    state: {
      plan: [[1,5,2,0,1,0,3,1],["#fff","#fff","#fff","#000","#fff","#000","#fff","#fff"]],
      artists:false,
      date:false,
      description:"Frappant is an art gallery and off-space in Hamburg, Germany. This virtual exhibition room was founded within it by members of it. Visit the Frappant website to learn more:",
      link: "https://frappant.org",
      linktitle: "Visit Website"
    }
  },
  "8;8": {
    name: "About",
    id: "about",
    x: 8,
    y: 8,
    poi: true,
    vip: true,
    state: {
      plan: [[1,5,5,5,5,1,0,4],["#fff","#fff","#fff","#fff","#fff","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"Die Frappant Galerie ist ein nicht-kommerzieller white cube inmitten des größeren, genossenschaftlich verwalteten Zentrums für Kunst, alternative Kultur, Bildung, Kreativwirtschaft und Soziales in der ehemaligen Viktoria-Kaserne in Hamburg-Altona. In den drei Räumen der Galerie bieten wir auf 145 qm ein fortlaufendes Programm von jährlich etwa 20 Ausstellungen zeitgenössischer, experimenteller bildender Kunst. Ausgehend von den Beschränkungen der aktuellen Pandemie haben wir das Konzept eines zusätzlichen 4., web-basierten Galerieraums entwickelt, der ein kuratiertes Programm bietet und im Netz dauerhaft besucht werden kann. Wir möchten damit unser Ausstellungsprogramm dauerhaft um zusätzliche Kunst-Formate erweitern. Den 4. Raum stellen wir für digitale oder hybride Projekte von Künstler:innen zur Verfügung, die sich über ein Auswahlverfahren bei uns beworben haben und ausgewählt wurden. Mit Frappant 4. Raum wollen wir die Bandbreite der von uns präsentierten künstlerischen Formate und Medien erweitern, nationale und internationale Medienkünstlerinnen einladen, ihr künstlerisches Konzept bei uns zu realisieren, interaktive und hybride Kunstformate ermöglichen und kunstinteressierte Besucher:innen außerhalb von Hamburg erreichen.",
      link: false,
    }
  },
  "4;12": {
    name: "Funders",
    id: "funders",
    x: 4,
    y: 12,
    poi: true,
    vip: true,
    state: {
      plan: [[1,4,4,4,4,1,0,4],["#fff","#fff","#fff","#fff","#fff","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"Dieses Projekt wird aus Mitteln von KULTUR.GEMEINSCHAFTEN – Förderprogramm für digitale Content-Produktion von Kultureinrichtungen und NEUSTART KULTUR – Programm 2 gefördert. Für die freundliche Unterstützung durch die Beauftragte der Bundesregierung für Kultur und Medien, die Kulturstiftung der Länder, den Bundesverband Soziokultur e.V., die Behörde für Kultur und Medien Hamburg sowie den Frappant e.V. bedanken wir uns.",
      link: false,
    }
  },
  "0;8": {
    name: "Contact",
    id: "contact",
    x: 0,
    y: 8,
    poi: true,
    vip: true,
    state: {
      plan: [[1,5,5,1,0,1,0,1],["#fff","#fff","#fff","#fff","#000","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"Get in touch if you would like to exhibit here or become a part of the 'Vierter Raum' Team",
      link: "mailto:info@frappant.org",
      linktitle: "Send a mail"
    }
  },
  "8;0": {
    name: "Instagram",
    id: "instagram",
    x: 8,
    y: 0,
    poi: true,
    vip: true,
    state: {
      plan: [[5,1,0,3,0,4,0,2],["#fff","#fff","#000","#fff","#000","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"Follow us on Instagram to stay up to date about upcoming exhibitions and more.",
      link: "https://instagram.com/frappantev",
      linktitle: "Follow on Instagram"
    }
  },
  "16;3": {
    name: "Rabbithole",
    id: "rabbithole",
    x: 16,
    y: 3,
    poi: true,
    vip: false,
    exhibit: true,
    state: {
      plan: [[1,2,4,2,3,4,2,1],["#db2109","#1847f2","#e620e6","#db2109","#e620e6","#db2109","#1847f2","#59b020"]],
      artists:"Michael, Alain, Various Artists",
      date:"15.12.21 - 15.09.22",
      description:"10 years after the first rabbithole we once again revisit this collection of pieces of pop culture.",
      link: "https://acidatm.de"
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
