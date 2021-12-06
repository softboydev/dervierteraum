const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const express = require('express');
const KILL_PLAYERS_AFTER = 2000

const bots = 0
function rainbow() {
    return colors[Math.floor(colors.length * Math.random())]
}
function invertHex(hex) {
  return (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
}
let colors = ['#87CEFA','#483D8B','#9370DB','#8B0000','#F0FFFF','#2E8B57','#FFF8DC','#000080','#778899','#A9A9A9','#DA70D6','#FFF5EE','#A0522D','#B0E0E6','#B8860B','#6B8E23','#5F9EA0','#FFF0F5','#FFE4E1','#DC143C','#90EE90','#FFFF00','#FF1493','#556B2F','#E6E6FA','#D2B48C','#FF69B4','#E9967A','#708090','#DDA0DD','#EE82EE','#9400D3','#DCDCDC','#4682B4','#008B8B','#3CB371','#6A5ACD','#F5F5DC','#808000','#FFD700','#9ACD32','#FFDEAD','#DAA520','#696969','#9932CC','#FFE4B5','#800080','#F5DEB3','#E0FFFF','#FFFFE0','#191970','#00FFFF','#B0C4DE','#F5F5F5','#006400','#7FFFD4','#20B2AA','#7FFF00','#C0C0C0','#FFDAB9','#FFE4C4','#40E0D0','#D2691E','#BA55D3','#FFB6C1','#A52A2A','#D8BFD8','#FFFAFA','#FFFFFF','#AFEEEE','#7CFC00','#FF7F50','#32CD32','#F8F8FF','#6495ED','#F0FFF0','#00FF00','#4169E1','#BC8F8F','#00BFFF','#00008B','#00FF7F','#DB7093','#FF00FF','#808080','#00CED1','#ADFF2F','#FFA500','#FF00FF','#66CDAA','#800000','#2F4F4F','#00FFFF','#FFA07A','#F0F8FF','#DEB887','#FDF5E6','#FF0000','#CD853F','#0000FF','#7B68EE','#FFFAF0','#48D1CC','#FAEBD7','#F08080','#EEE8AA','#F0E68C','#FFEFD5','#9966CC','#FF6347','#1E90FF','#FF8C00','#CD5C5C','#00FA9A','#228B22','#8FBC8F','#FF4500','#7B68EE','#FFFFF0','#B22222','#000000','#FA8072','#ADD8E6','#8B008B','#D3D3D3','#FFA07A','#8A2BE2','#FFEBCD','#0000CD','#F4A460','#FFC0CB','#4B0082','#F5FFFA','#BDB76B','#87CEEB','#008080','#C71585','#FAF0E6','#008000','#8B4513','#FAFAD2','#FFFACD','#98FB98']
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
    exhibit: true,
    state: {
      plan: [["X","V","O","A","V","O","A","X"],["#db2109","#1847f2","#e620e6","#db2109","#e620e6","#db2109","#1847f2","#59b020"]],
      artists:"Michael, Alain, Various Artists",
      date:"15.12.21 - 15.09.22",
      description:"10 years after the first rabbithole we once again revisit this collection of pieces of pop culture.",
      link: "https://acidatm.de"
    }
  }
}
// for(let i = 0; i < bots; i++){
//   let colorA = rainbow()
//   players["bot" + i] = {
//     name: "bot" + i,
//     id: "bot" + i,
//     x: -10 + Math.floor(Math.random() * 20),
//     y: -10 + Math.floor(Math.random() * 20),
//     alive: KILL_PLAYERS_AFTER,
//     poi: false,
//     state: {
//       colorA: colorA,
//       colorB: colorA,
//       invertA: "#" + invertHex(colorA.replace("#","")),
//       invertB: "#" + invertHex(colorA.replace("#",""))
//     }
//   }
// }

app.use('/static', express.static(__dirname + '/static'));
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
app.get('/compass.png',function(req,res){
    res.sendFile(__dirname + '/compass.png');
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
