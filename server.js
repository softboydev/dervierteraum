const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const KILL_PLAYERS_AFTER = 2000

let players = {}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/index.js',function(req,res){
    res.sendFile(__dirname + '/index.js');
});
app.get('/scripts.js',function(req,res){
    res.sendFile(__dirname + '/scripts.js');
});
io.on("connection", (socket) => {
  socket.on("join", msg => {
    players[msg.id] = {
      name: msg.name,
      id: msg.id,
      x: -10 + Math.floor(Math.random() * 20),
      y: -10 + Math.floor(Math.random() * 20),
      state: 0,
      alive: KILL_PLAYERS_AFTER
    }
  });
  socket.on("alive", msg => {
    if(players[msg.id]){
      players[msg.id].alive = KILL_PLAYERS_AFTER
      players[msg.id].x += msg.x
      players[msg.id].y += msg.y
      players[msg.id].state = msg.state
    }

    // else{
    //   io.emit('logout', msg);
    // }
  })
  setInterval(update, 200);
});

function update(){
  for(let p in players){
    if(players[p].alive <= 0){
      delete players[p]
    }
    else{
      players[p].alive--
    }
  }
  io.emit('update', players);
}

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
