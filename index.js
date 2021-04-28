const socket = io()
const canvas = document.getElementById("canvas")
let controls = {}
canvas.width = window.innerWidth
canvas.height = window.innerHeight
let scale = 20
let size = 40
let delta = 14
let points = []
let enviroments = []
let avatarsAt = []
let enviromentColors = [
  "#0000ff",
  "#00ff00",
  "#000000",
  "#ff0000"
]
let enviromentsGrain = 0.01
let shapes = []
let speed = 0.0003
let grain = 0.5
let render = new Zdog.Illustration({
  element: '.zdog-canvas',
  dragRotate: true,
});

let avatar = {
  id: "",
  name: "",
  x: 0,
  y: 0,
  dX: 0,
  dY: 0,
  d: 40,
  state: 0,
  relD: 0,
  cd: 0.1,
  shape:new Zdog.Shape({
    addTo: render,
    path: [{x: size * scale * 0.5, y: size * scale * 0.5, z: 100}],
    stroke: size,
    color: "#fff"
  }),
  move: function(x,y){
    this.dX += x
    this.dY += y
  },
  flash: function(){
    // if(this.state <= 0){
      this.state = 2
    // }
  }
}
let avatars = {}
let avatarShapes = {}

window.addEventListener("load",init)
window.addEventListener("wheel",function(e){
  changeZoom(e.deltaY);
})
// window.addEventListener("mousemove",function(e){
//   pointer(e.clientX,e.clientY)
// })
window.addEventListener("resize",function(){
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})




function init(){
  // kd.LEFT.down(function () {
  //   avatar.move(-1,0)
  // })
  // kd.RIGHT.down(function () {
  //   avatar.move(1,0)
  // })
  // kd.UP.down(function () {
  //   avatar.move(0,-1)
  // })
  // kd.DOWN.down(function () {
  //   avatar.move(0,1)
  // })
  kd.SPACE.down(function () {
    avatar.flash()
  })
  document.getElementById("controlsUp").addEventListener("mousedown",function(){
    controls.up = setInterval(function(){
      avatar.move(0,-1)
    },100)
  })
  document.getElementById("controlsUp").addEventListener("mouseup",function(){
    clearInterval(controls.up)
  })
  document.getElementById("controlsDown").addEventListener("mousedown",function(){
    controls.down = setInterval(function(){
      avatar.move(0,1)
    },100)
  })
  document.getElementById("controlsDown").addEventListener("mouseup",function(){
    clearInterval(controls.down)
  })
  document.getElementById("controlsLeft").addEventListener("mousedown",function(){
    controls.left = setInterval(function(){
      avatar.move(-1,0)
    },100)
  })
  document.getElementById("controlsLeft").addEventListener("mouseup",function(){
    clearInterval(controls.left)
  })
  document.getElementById("controlsRight").addEventListener("mousedown",function(){
    controls.right = setInterval(function(){
      avatar.move(1,0)
    },100)
  })
  document.getElementById("controlsRight").addEventListener("mouseup",function(){
    clearInterval(controls.right)
  })
  document.getElementById("controlsSpace").addEventListener("mousedown",function(){
    controls.space = setInterval(function(){
      avatar.flash()
    },100)
  })
  document.getElementById("controlsSpace").addEventListener("mouseup",function(){
    clearInterval(controls.space)
  })
  window.addEventListener("keydown",function(e){
    switch(e.keyCode){
      case 37:
        avatar.move(-1,0)
        break
      case 38:
        avatar.move(0,-1)
        break
      case 39:
        avatar.move(1,0)
        break
      case 40:
        avatar.move(0,1)
        break
      // case 32:
      //   avatar.flash()
      //   break
    }
  })
  for(let y = 0; y < scale + 1; y ++){
    let row = []
    let env = []
    let a = []
    for(let x = 0; x < scale + 1; x ++){
      row.push(0)
      env.push(0)
      a.push(0)
    }
    points.push(row)
    enviroments.push(env)
    avatarsAt.push(a)
  }
  for(let y = 0; y <= scale; y ++){
    let row = []
    for(let x = 0; x <= scale; x ++){
      if(x == scale && y == scale){
        //
      }
      else if(x == scale || y == scale){
        row.push([
          new Zdog.Shape({
            addTo: render,
            path: [{x: 0, y: 0, z: 0}],
            stroke: 4 ,
            color: "#fff",
          })
        ])
      }
      else{
        row.push([
          new Zdog.Shape({
            addTo: render,
            path: [{x: 0, y: 0, z: 0}],
            stroke: 4 ,
            color: "#fff",
          }),
          new Zdog.Shape({
            addTo: render,
            path: [{x: 0, y: 0, z: 0}],
            stroke: 4 ,
            color: "#fff",
          }),
          new Zdog.Shape({
            addTo: render,
            path: [{x: 0, y: 0, z: 0},{x: 0, y: 0, z: 0},{x: 0, y: 0, z: 0},{x: 0, y: 0, z: 0}],
            stroke: 0,
            fill: true,
            color: "#f00",
          })
        ])
      }
    }
    shapes.push(row)
  }
  avatar.name = prompt("Nickname?")
  avatar.id = "id_" + performance.now() + "_" + Math.floor(Math.random() * 1000000)
  socket.emit('join', {name:avatar.name,id:avatar.id})
  socket.on('update', function(msg) {
    kd.tick()
    socket.emit('alive', {id:avatar.id,x:avatar.dX,y:avatar.dY,state:avatar.state})
    avatar.dX = 0
    avatar.dY = 0
    if(avatar.state > 0){
      avatar.state -= avatar.cd
    }
    avatars = msg
    if(avatar.state > 0){
      avatar.state -= avatar.cd
    }
    for(let s in avatarShapes){
      if(!avatars[s]){
        avatarShapes[s].remove()
      }
    }
    for(let y = 0; y <= scale; y++){
      for(let x = 0; x <= scale; x++){
        avatarsAt[y][x] = 0
      }
    }
    for(let a in avatars){ // for each avatar in the list of avatars
        let relX = scale * 0.5 + avatars[a].x - avatar.x //determine the relative position
        let relY = scale * 0.5 + avatars[a].y - avatar.y //relative to avatar position and virtual center, range 0 - scale
        if(relX >= 0 && relX <= scale && relY >= 0 && relY <= scale){ //when the relative position is within the view
          avatarsAt[relY][relX] += 1
        }
    }
    for(let a in avatars){ // for each avatar in the list of avatars
      let relX = scale * 0.5 + avatars[a].x - avatar.x //determine the relative position
      let relY = scale * 0.5 + avatars[a].y - avatar.y //relative to avatar position and virtual center, range 0 - scale
      if(a != avatar.id){ //when the current avatar is not the users avatar
        if(relX >= 0 && relX <= scale && relY >= 0 && relY <= scale){ //when the relative position is within the view
          if(!avatarShapes[a]){
            avatarShapes[a] = new Zdog.Shape({
              addTo: render,
              path: [{x: (avatars[a].x - avatar.x) * size, y: (avatars[a].y - avatar.y) * size, z: points[relY][relX] * delta + avatar.d + size * 0.5 * avatarsAt[relY][relX]}],
              stroke: size * avatarsAt[relY][relX],
              color: avatars[a].state >= 1 ? "#f00" : "rgb(" + 255 + "," + (1 - avatars[a].state) * 255 + "," + (1 - avatars[a].state) * 255 + ")"
            })
          }
          else{
            avatarShapes[a].path = [{x: (avatars[a].x - avatar.x) * size, y: (avatars[a].y - avatar.y) * size, z: points[relY][relX] * delta + avatar.d + size * 0.5 * avatarsAt[relY][relX]}]
            avatarShapes[a].color = avatars[a].state >= 1 ? "#f00" : "rgb(" + 255 + "," + (1 - avatars[a].state) * 255 + "," + (1 - avatars[a].state) * 255 + ")"
            avatarShapes[a].stroke = size * avatarsAt[relY][relX],
            avatarShapes[a].updatePath();
          }
        }
        else if(avatarShapes[a]){ //when it is not but there is still a shape representing it
          avatarShapes[a].remove()
          delete avatarShapes[a]
        }
      }
    }

    if(avatars[avatar.id]){
      avatar.x = avatars[avatar.id].x
      avatar.y = avatars[avatar.id].y
      avatar.shape.path = [{x: 0, y: 0, z: (points[scale * 0.5][scale * 0.5] * delta + avatar.d + size * avatarsAt[scale * 0.5][scale * 0.5] * 0.5)}]
      avatar.shape.color = avatars[avatar.id].state >= 1 ? "#f00" : "rgb(" + 255 + "," + (1 - avatars[avatar.id].state) * 255 + "," + (1 - avatars[avatar.id].state) * 255 + ")"
      avatar.shape.stroke =  size * Math.max(1,avatarsAt[scale * 0.5][scale * 0.5])
      avatar.shape.updatePath();
      document.getElementById("footerMid").innerText = "X " + avatar.x + " | Y " + avatar.y
    }
  });
  animate()
}
function update(){
  for(let y = 0; y < scale + 1; y++){
    for(let x = 0; x < scale + 1; x++){
      let n = 0
      let d = (1 + noise.simplex3((1000 + x + avatar.x) * 0.01,(1000 + y + avatar.y) * 0.01,1000) * 10) * 0.5
      let e = Math.floor((1 + noise.simplex3((10000 + x + avatar.x) * enviromentsGrain,(10000 + y + avatar.y) * enviromentsGrain,1000)) * 2) // 0 - 3
      switch(e){
        case 0: //water at sea level 0 - 1
          n = (1 + Math.sin(y + performance.now() * 0.001) * 0.5)
          break
        case 1: //moving planes 2 - 3
          n = 2 + ((1 + noise.simplex3(x + avatar.x * grain,y + avatar.y * grain,performance.now() * speed)) * 0.5)
          break
        case 2: //cityblocks 3 - 8
          n = 2 + Math.pow(1 + ((1 + noise.simplex3(((x + avatar.x) + ((x + avatar.x) % 2)) * grain,((y + avatar.y) + ((y + avatar.y) % 2)) * grain,0)) * 0.5),4)
          break
        case 3: // mountains 0 - 16
          n = 2 + Math.pow(((1 + noise.simplex3(x + avatar.x * grain * 0.1,y + avatar.y * grain * 0.1,performance.now() * speed * 0.1)) * 0.5),2) * 16
          break
      }
      points[y][x] = n - 12 + d
      enviroments[y][x] = e
    }
  }
  for(let y = 0; y <= scale; y++){
    for(let x = 0; x <= scale; x++){
      if(x == scale && y == scale){
        //
      }
      else if(x == scale){
        shapes[x][y][0].stroke = 2 / render.zoom
        shapes[x][y][0].path = [{ x: (-0.5 * size * scale) + x * size,y:(-0.5 * size * scale) + y*size,z:points[y][x] * delta },{ x: (-0.5 * size * scale) + x * size,y:(-0.5 * size * scale) + (y + 1)*size,z:points[y + 1][x] * delta }]
        shapes[x][y][0].updatePath();
      }
      else if(y == scale){
        shapes[x][y][0].stroke = 2 / render.zoom
        shapes[x][y][0].path = [{ x: (-0.5 * size * scale) + x * size,y:(-0.5 * size * scale) + y*size,z:points[y][x] * delta },{ x: (-0.5 * size * scale) + (x + 1) * size,y:(-0.5 * size * scale) + y*size,z:points[y][x + 1] * delta }]
        shapes[x][y][0].updatePath();
      }
      else{
        shapes[x][y][0].stroke = 2 / render.zoom
        shapes[x][y][0].path = [{ x: (-0.5 * size * scale) + x * size,y:(-0.5 * size * scale) + y*size,z:points[y][x] * delta },{ x: (-0.5 * size * scale) + (x + 1) * size,y:(-0.5 * size * scale) + y*size,z:points[y][x + 1] * delta }]
        shapes[x][y][0].updatePath();
        shapes[x][y][1].stroke = 2 / render.zoom
        shapes[x][y][1].path = [{ x: (-0.5 * size * scale) + x * size,y:(-0.5 * size * scale) + y*size,z:points[y][x] * delta },{ x: (-0.5 * size * scale) + x * size,y:(-0.5 * size * scale) + (y + 1)*size,z:points[y + 1][x] * delta }]
        shapes[x][y][1].updatePath();
        shapes[x][y][2].path = [
          { x: (-0.5 * size * scale) + x * size,
            y:(-0.5 * size * scale) + y*size,
            z:points[y][x] * delta
          },
          { x: (-0.5 * size * scale) + (x + 1) * size,
            y:(-0.5 * size * scale) + y*size,
            z:points[y][x + 1] * delta
          },
          { x: (-0.5 * size * scale) + (x + 1) * size,
            y:(-0.5 * size * scale) + (y + 1) *size,
            z:points[y + 1][x + 1] * delta
          },
          { x: (-0.5 * size * scale) + x * size,
            y:(-0.5 * size * scale) + (y + 1)*size,
            z:points[y + 1][x] * delta
          }
        ]
        shapes[x][y][2].color = enviromentColors[enviroments[y][x]]
        shapes[x][y][2].updatePath();
      }
    }
  }
  render.updateRenderGraph();
}
function animate() {
  update()
  requestAnimationFrame( animate );
}
function changeZoom(d){
  const config = {
    min: 0.1,
    max: 10,
    steps: 0.001
  }
  render.zoom = Math.min(config.max,Math.max(config.min,render.zoom + d * config.steps))
}
