const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const KILL_PLAYERS_AFTER = 100

let players = {
  poi1: {
    name: "Frappant e.V. Webseite",
    id: "poi1",
    x: 0,
    y: 0,
    poi: true,
    state: {
      colors: ["#0F2C67","#CD1818","#F3950D"],
      link: "https://example.com"
    }
  },
  poi2: {
    name: "Was ist der vierte Raum?",
    id: "poi2",
    x: 2,
    y: -6,
    poi: true,
    state: {
      colors: ["#FF0075","#172774","77D970"],
      link: "https://example.com"
    }
  },
  poi3: {
    name: "Rabbithole",
    id: "poi3",
    x: -10,
    y: 12,
    poi: true,
    state: {
      colors: ["#ff0000","#00ff00","#0000ff"],
      link: "https://example.com"
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
io.on("connection", (socket) => {
  socket.on("join", msg => {
    players[msg.id] = {
      name: msg.name,
      id: msg.id,
      x: -10 + Math.floor(Math.random() * 20),
      y: -10 + Math.floor(Math.random() * 20),
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
