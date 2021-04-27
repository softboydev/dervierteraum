const socket = io()
const canvas = document.getElementById("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
let scale = 10
let size = 20
let delta = 14
let points = []
let shapes = []
let speed = 0.0001
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
  d: 20,
  state: 0,
  cd: 0.1,
  shape:new Zdog.Shape({
    addTo: render,
    path: [{x: size * scale * 0.5, y: size * scale * 0.5, z: 100}],
    stroke: 10,
    color: "#fff"
  }),
  move: function(x,y){
    this.dX += x
    this.dY += y
  },
  flash: function(){
    this.state = 1
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
  kd.LEFT.down(function () {
    avatar.move(-1,0)
  })
  kd.RIGHT.down(function () {
    avatar.move(1,0)
  })
  kd.UP.down(function () {
    avatar.move(0,-1)
  })
  kd.DOWN.down(function () {
    avatar.move(0,1)
  })
  kd.SPACE.down(function () {
    avatar.flash()
  })
  for(let y = 0; y < scale + 1; y ++){
    let row = []
    for(let x = 0; x < scale + 1; x ++){
      row.push(0)
    }
    points.push(row)
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
    socket.emit('alive', {id:avatar.id,x:avatar.dX,y:avatar.dY})
    avatar.dX = 0
    avatar.dY = 0
    avatars = msg
    for(let s in avatarShapes){
      if(!avatars[s]){
        avatarShapes[s].remove()
      }
    }
    for(let a in avatars){
      let relX = scale * 0.5 + avatars[a].x - avatar.x
      let relY = scale * 0.5 + avatars[a].y - avatar.y
      if(a != avatar.id){
        if(relX >= 0 && relX < scale && relY >= 0 && relY < scale){
          if(!avatarShapes[a]){
            avatarShapes[a] = new Zdog.Shape({
              addTo: render,
              path: [{x: (avatars[a].x - avatar.x) * scale, y: (avatars[a].y - avatar.y) * scale, z: points[relY][relX] * delta + avatar.d}],
              stroke: 10,
              color: "#00f"
            })
          }
          else{
            avatarShapes[a].path = [{x: (avatars[a].x - avatar.x) * scale, y: (avatars[a].y - avatar.y) * scale, z: points[relY][relX] * delta + avatar.d}]
            avatarShapes[a].updatePath();
          }
        }
        else if(avatarShapes[a]){
          avatarShapes[a].remove()
        }
      }
    }
    if(avatars[avatar.id]){
      avatar.x = avatars[avatar.id].x
      avatar.y = avatars[avatar.id].y
      avatar.shape.path = [{x: 0, y: 0, z: (points[scale * 0.5][scale * 0.5] * delta + avatar.d)}]
      avatar.shape.updatePath();
      document.getElementById("footerMid").innerText = "X " + avatar.x + " | Y " + avatar.y
    }
  });
  animate()
}
function update(){
  for(let y = 0; y < scale + 1; y++){
    for(let x = 0; x < scale + 1; x++){
      let d = noise.simplex3((1000 + x + avatar.x) * 0.01,(2000 + y + avatar.y) * 0.01,1000) * 10
      points[y][x] = noise.simplex3(x + avatar.x * grain,y + avatar.y * grain,performance.now() * speed) + d
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
      }
    }
  }
  // if(avatar.state > 0){
  //   avatar.state -= avatar.cd
  // }
  // avatar.shape.color =  "rgb(" + 255 + "," + (1 - avatar.state) * 255 + "," + (1 - avatar.state) * 255 + ")"

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
