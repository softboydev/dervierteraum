const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const KILL_PLAYERS_AFTER = 100

let players = {
  frappant: {
    name: "Frappant",
    id: "frappant",
    x: 0,
    y: 0,
    poi: true,
    vip: true,
    state: {
      plan: [["X","I","A","","X","","V","X"],["#fff","#fff","#fff","#000","#fff","#000","#fff","#fff"]],
      artists:false,
      date:false,
      description:"Frappant is an art gallery and off-space in Hamburg, Germany. This virtual exhibition room was founded within it by members of it. Visit the Frappant website to learn more:",
      link: "https://frappant.org",
      linktitle: "Visit Website"
    }
  },
  about: {
    name: "About",
    id: "about",
    x: 8,
    y: 8,
    poi: true,
    vip: true,
    state: {
      plan: [["X","I","I","I","I","X","","O"],["#fff","#fff","#fff","#fff","#fff","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"The 'Vierter Raum' is an exhibition space founded by Frappant e.V. to showcase digital and hybrid exhibitions. Go to the contact pillar to get in touch, follow us on Instagram or visit the Frappant website to learn more about our physical sibling.",
      link: false,
    }
  },
  contact: {
    name: "Contact",
    id: "contact",
    x: 0,
    y: 8,
    poi: true,
    vip: true,
    state: {
      plan: [["X","I","I","X","","X","","X"],["#fff","#fff","#fff","#fff","#000","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"Get in touch if you would like to exhibit here or become a part of the 'Vierter Raum' Team",
      link: "mailto:info@frappant.org",
      linktitle: "Send a mail"
    }
  },
  instagram: {
    name: "Instagram",
    id: "instagram",
    x: 8,
    y: 0,
    poi: true,
    vip: true,
    state: {
      plan: [["I","X","","V","","O","","A"],["#fff","#fff","#000","#fff","#000","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"Follow us on Instagram to stay up to date about upcoming exhibitions and more.",
      link: "https://instagram.com/frappantev",
      linktitle: "Follow on Instagram"
    }
  },
  rabbithole: {
    name: "Rabbithole",
    id: "rabbithole",
    x: 16,
    y: 3,
    poi: true,
    vip: false,
    state: {
      plan: [["X","V","O","A","V","O","A","X"],["#db2109","#1847f2","#e620e6","#db2109","#e620e6","#db2109","#1847f2","#59b020"]],
      artists:"Michael, Alain, Various Artists",
      date:"15.12.21 - 15.09.22",
      description:"10 years after the first rabbithole we once again revisit this collection of pieces of pop culture.",
      link: "https://rabbithole.com/2021"
    }
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/index.js',function(req,res){
    res.sendFile(__dirname + '/index.js');
});
app.get('/scripts.js',function(req,res){
    res.sendFile(__dirname + '/scripts.js');
});
app.get('/fonts/SpaceMono-Regular.ttf',function(req,res){
    res.sendFile(__dirname + '/fonts/SpaceMono-Regular.ttf');
});
app.get('/logo.png',function(req,res){
    res.sendFile(__dirname + '/logo.png');
});
app.get('/logo_inverted.png',function(req,res){
    res.sendFile(__dirname + '/logo_inverted.png');
});
io.on("connection", (socket) => {
  socket.on("join", msg => {
    players[msg.id] = {
      name: msg.name,
      id: msg.id,
      x: msg.position && msg.position.x ? msg.position.x : -10 + Math.floor(Math.random() * 20),
      y: msg.position && msg.position.y ? msg.position.y : -10 + Math.floor(Math.random() * 20),
      state: msg.state,
      alive: KILL_PLAYERS_AFTER,
      poi: false
    }
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
  setInterval(update, 100);
});

function update(){
  for(let p in players){
    if(players[p].alive <= 0){
      delete players[p]
    }
    else{
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
