const socket = io()
const canvas = document.getElementById("canvas")
let controls = {}
let moveInterval = false
let pointerFlag = false
let pointerRotation = {x:0,y:0,z:0}
let deltaPointerRotation = {x:0,y:0,z:0}
let lastPointer = false
let rotateX = 0
let rotateY = 0
canvas.width = window.innerWidth
canvas.height = window.innerHeight
let scale = 32
let size = 40
let delta = 14
let points = []
let enviromentsGrain = 0.01
let shapes = []
let speed = 0.0003
let grain = 0.5
let render = new Zdog.Illustration({
  element: '.zdog-canvas',
  rotate: {x: Zdog.TAU * (0.2 + ((pointerRotation.x + deltaPointerRotation.x) * 0.2)),y: pointerRotation.y,z: Zdog.TAU * (pointerRotation.z + deltaPointerRotation.z)}
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
  shape: new Zdog.Anchor({
    addTo: render,
    translate: {x: size * scale * 0.5, y: size * scale * 0.5, z: 100}
  }),
  shapes: {},
  // ball:new Zdog.Shape({
  //   addTo: this.shape,
  //   // path: [{x: size * scale * 0.5, y: size * scale * 0.5, z: 100}],
  //   path: [{x:0,y:0,z:0}],
  //   stroke: size,
  //   color: "#fff"
  // }),
  move: function(v){
    this.dX += v.x
    this.dY += v.y
  },
  flash: function(){
    // if(this.state <= 0){
      this.state = 2
    // }
  }
}
let oldAvatars = false
let avatars = false
let avatarShapes = {}
let timestamp = performance.now()
let lastResponseTime = 1000

avatar.shapes.ball = {
  group: new Zdog.Group({addTo:avatar.shape,visible:false})
}
avatar.shapes.ball.anchor = new Zdog.Anchor({
  addTo: avatar.shapes.ball.group
})


new Zdog.Hemisphere({
  addTo: avatar.shapes.ball.anchor,
  diameter: size,
  stroke: false,
  color: '#f00'
});
new Zdog.Hemisphere({
  addTo: avatar.shapes.ball.anchor,
  diameter: size,
  stroke: false,
  color: '#00f',
  rotate: { x: Zdog.TAU/2 }
});
// avatar.shapes.tri = new Zdog.Anchor({
//   addTo: avatar.shape
// })
// new Zdog.Shape({
//   addTo: avatar.shapes.tri,
//   path: [{x:0,y:0,z:-size},{x:size*0.5,y:-size*0.5,z:0},{x:size*0.5,y:size*0.5,z:0}],
//   stroke: 0,
//   fill: true,
//   color: "#000"
// })
// new Zdog.Shape({
//   addTo: avatar.shapes.tri,
//   path: [{x:0,y:0,z:-size},{x:size*0.5,y:size*0.5,z:0},{x:-size*0.5,y:size*0.5,z:0}],
//   stroke: 0,
//   fill: true,
//   color: "#000"
// })
// new Zdog.Shape({
//   addTo: avatar.shapes.tri,
//   path: [{x:0,y:0,z:-size},{x:-size*0.5,y:size*0.5,z:0},{x:-size*0.5,y:-size*0.5,z:0}],
//   stroke: 0,
//   fill: true,
//   color: "#f00"
// })
// new Zdog.Shape({
//   addTo: avatar.shapes.tri,
//   path: [{x:0,y:0,z:-size},{x:-size*0.5,y:-size*0.5,z:0},{x:size*0.5,y:-size*0.5,z:0}],
//   stroke: 0,
//   fill: true,
//   color: "#000"
// })
// new Zdog.Shape({
//   addTo: avatar.shapes.tri,
//   path: [{x:0,y:0,z:size},{x:size*0.5,y:-size*0.5,z:0},{x:size*0.5,y:size*0.5,z:0}],
//   stroke: 0,
//   fill: true,
//   color: "#000"
// })
// new Zdog.Shape({
//   addTo: avatar.shapes.tri,
//   path: [{x:0,y:0,z:size},{x:size*0.5,y:size*0.5,z:0},{x:-size*0.5,y:size*0.5,z:0}],
//   stroke: 0,
//   fill: true,
//   color: "#f00"
// })
// new Zdog.Shape({
//   addTo: avatar.shapes.tri,
//   path: [{x:0,y:0,z:size},{x:-size*0.5,y:size*0.5,z:0},{x:-size*0.5,y:-size*0.5,z:0}],
//   stroke: 0,
//   fill: true,
//   color: "#fff"
// })
// new Zdog.Shape({
//   addTo: avatar.shapes.tri,
//   path: [{x:0,y:0,z:size},{x:-size*0.5,y:-size*0.5,z:0},{x:size*0.5,y:-size*0.5,z:0}],
//   stroke: 0,
//   fill: true,
//   color: "#f00"
// })

window.addEventListener("load",init)
window.addEventListener("mousemove",function(e){
  handleRotate(e.clientX,e.clientY)
})
window.addEventListener("touchmove", function(e){
  handleRotate(e.targetTouches[0].clientX,e.targetTouches[0].clientY)
})
window.addEventListener("mousedown",function(e){
  pointerDown(e.clientX,e.clientY)
})
window.addEventListener("touchstart",function(e){
  pointerDown(e.targetTouches[0].clientX,e.targetTouches[0].clientY)
})
window.addEventListener("mouseup",pointerUp)
window.addEventListener("touchend",pointerUp)
window.addEventListener("resize",function(){
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})

function pointerDown(x,y){
  if(!pointerFlag){
    lastPointer = {x:x,y:y}
    pointerFlag = true
    if(!moveInterval){
      moveInterval = setInterval(function(){
        let d = new Zdog.Vector({ x: 0, y: -1 }).rotate({ z: Zdog.TAU - render.rotate.z });
        avatar.move(d)
      },30)
    }
  }
}
function pointerUp(){
  if(pointerFlag){
    pointerRotation.z += deltaPointerRotation.z
    pointerRotation.x += deltaPointerRotation.x
    deltaPointerRotation = {x:0,y:0,z:0}
    pointerFlag = false
    if(moveInterval){
      clearInterval(moveInterval)
      moveInterval = false
    }
  }
}
function handleRotate(x,y){
  if(pointerFlag){
    let dX =  (lastPointer.x - x) / window.innerWidth
    let dY =  (lastPointer.y - y) / window.innerHeight
    deltaPointerRotation.z = dX
    deltaPointerRotation.x = (-0.5 < (pointerRotation.x + dY) && (pointerRotation.x + dY) < 0.5) ? dY : (pointerRotation.x + dY) > 0.5 ? 0.5 - pointerRotation.x : -0.5 - pointerRotation.x
  }
  render.zoom = 1 + pointerRotation.x + deltaPointerRotation.x
  render.rotate = {x: Zdog.TAU * 0.2,y: pointerRotation.y,z: Zdog.TAU * (pointerRotation.z + deltaPointerRotation.z)}
}

function init(){
  kd.SPACE.down(function () {
    avatar.flash()
  })
  // document.getElementById("chatToggle").addEventListener("click",function(){
  //   document.body.classList.toggle("chat-is-active")
  // })
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
          }),
          new Zdog.Shape({
            addTo: render,
            path: [{x: 0, y: 0, z: 0},{x: 0, y: 0, z: 0},{x: 0, y: 0, z: 0},{x: 0, y: 0, z: 0}],
            stroke: 0,
            fill: true,
            color: "#000"
          })
        ])
      }
    }
    shapes.push(row)
  }
  avatar.name = "A"
  avatar.id = "id_" + performance.now() + "_" + Math.floor(Math.random() * 1000000)
  socket.emit('join', {name:avatar.name,id:avatar.id})
  socket.on('update', function(msg) {
    timestamp = performance.now()
    kd.tick()
    socket.emit('alive', {id:avatar.id,x:avatar.dX,y:avatar.dY,state:avatar.state})
    avatar.dX = 0
    avatar.dY = 0
    if(avatar.state > 0){
      avatar.state -= avatar.cd
    }
    oldAvatars = avatars || msg
    avatars = msg
    if(avatar.state > 0){
      avatar.state -= avatar.cd
    }
    if(avatars[avatar.id]){
      avatar.x = avatars[avatar.id].x
      avatar.y = avatars[avatar.id].y
      avatar.shapes.ball.group.visible = true
    }
    for(let s in avatarShapes){
      if(!avatars[s]){
        avatarShapes[s].remove()
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
              path: [{x: (avatars[a].x - avatar.x) * size, y: (avatars[a].y - avatar.y) * size, z: getZAt(relX,relY) * delta + avatar.d + size}],
              stroke: size,
              color: avatars[a].state >= 1 ? "#f00" : "rgb(" + 255 + "," + (1 - avatars[a].state) * 255 + "," + (1 - avatars[a].state) * 255 + ")"
            })
          }
          else{
            avatarShapes[a].path = [{x: (avatars[a].x - avatar.x) * size, y: (avatars[a].y - avatar.y) * size, z: getZAt(relX,relY) * delta + avatar.d + size}]
            avatarShapes[a].color = avatars[a].state >= 1 ? "#f00" : "rgb(" + 255 + "," + (1 - avatars[a].state) * 255 + "," + (1 - avatars[a].state) * 255 + ")"
            avatarShapes[a].stroke = size,
            avatarShapes[a].updatePath();
          }
        }
        else if(avatarShapes[a]){ //when it is not but there is still a shape representing it
          avatarShapes[a].remove()
          delete avatarShapes[a]
        }
      }
    }

    // if(avatars[avatar.id]){
    //   avatar.x = avatars[avatar.id].x
    //   avatar.y = avatars[avatar.id].y
    //   avatar.shape.translate = {x: 0, y: 0, z: getZAt(scale * 0.5,scale * 0.5) * delta + avatar.d + size}
    //   avatar.shape.rotate = { x: Zdog.TAU * performance.now() * 0.0001, y: Zdog.TAU * performance.now() * 0.0001,z: Zdog.TAU * performance.now() * 0.0001 }
    //   // avatar.shape.path = [{x: 0, y: 0, z: getZAt(scale * 0.5,scale * 0.5) * delta + avatar.d + size}]
    //   // avatar.shape.color = avatars[avatar.id].state >= 1 ? "#f00" : "rgb(" + 255 + "," + (1 - avatars[avatar.id].state) * 255 + "," + (1 - avatars[avatar.id].state) * 255 + ")"
    //   // avatar.shape.stroke =  size
    //   // avatar.shape.updatePath();
    // }
  });
  update()
}
function getZAt(x,y,q){
  let n = 0
  let _x = q ? Math.round(avatar.x) : avatar.x
  let _y = q ? Math.round(avatar.y) : avatar.y
  let d = (1 + noise.simplex3((1000 + x + _x) * 0.01,(1000 + y + _y) * 0.01,1000) * 10) * 0.5
  let e = Math.floor((1 + noise.simplex3((10000 + x + _x) * enviromentsGrain,(10000 + y + _y) * enviromentsGrain,1000)) * 2) // 0 - 3
  switch(e){
    case 0: //water at sea level 0 - 1
      n = (1 + Math.sin(y + performance.now() * 0.001) * 0.5)
      break
    case 1: //moving planes 2 - 3
      n = 2 + ((1 + noise.simplex3(x + _x * grain,y + _y * grain,performance.now() * speed)) * 0.5)
      break
    case 2: //cityblocks 3 - 8
      n = 2 + Math.pow(1 + ((1 + noise.simplex3(((x + _x) + ((x + _x) % 2)) * grain,((y + _y) + ((y + _y) % 2)) * grain,0)) * 0.5),4)
      break
    case 3: // mountains 0 - 16
      n = 2 + Math.pow(((1 + noise.simplex3(x + _x * grain * 0.1,y + _y * grain * 0.1,performance.now() * speed * 0.1)) * 0.5),2) * 16
      break
  }
  return n - 12
}
function update(){
  if(avatars[avatar.id]){
    avatar.shape.translate = {z: getZAt(scale * 0.5,scale * 0.5) * delta + size + avatar.d * Math.abs(-1 + ((performance.now() * 0.0005) % 2))}
    avatar.shape.rotate = { x: Zdog.TAU * performance.now() * 0.0001, y: Zdog.TAU * performance.now() * 0.0001,z: Zdog.TAU * performance.now() * 0.0001 }
  }
  // if(avatars[avatar.id]){
  //   // let d = Math.min(1,(performance.now() - timestamp) / lastResponseTime)
  //   // avatar.x = d * oldAvatars[avatar.id].x + (1 - d) * avatars[avatar.id].x
  //   // avatar.y = d * oldAvatars[avatar.id].y + (1 - d) * avatars[avatar.id].y
  //   avatar.x = avatars[avatar.id].x
  //   avatar.y = avatars[avatar.id].y
  //   avatar.shape.translate = {z: getZAt(scale * 0.5,scale * 0.5) * delta + size + avatar.d * Math.abs(-1 + ((performance.now() * 0.0005) % 2))}
  //   avatar.shape.rotate = { x: Zdog.TAU * performance.now() * 0.0001, y: Zdog.TAU * performance.now() * 0.0001,z: Zdog.TAU * performance.now() * 0.0001 }
  //   avatar.shapes.ball.group.visible = true
  // }
  for(let y = 0; y < scale + 1; y++){
    for(let x = 0; x < scale + 1; x++){
      points[y][x] = getZAt(x,y,true)
    }
  }
  for(let y = 0; y <= scale; y++){
    for(let x = 0; x <= scale; x++){
      let X = x + (avatar.x % 1)
      let Y = y + (avatar.y % 1)
      if(x == scale && y == scale){
        //
      }
      else if(x == scale){
        shapes[x][y][0].stroke = 2 / render.zoom
        shapes[x][y][0].path = [{ x: (-0.5 * size * scale) + X * size,y:(-0.5 * size * scale) + Y*size,z:points[y][x] * delta },{ x: (-0.5 * size * scale) + X * size,y:(-0.5 * size * scale) + (Y + 1)*size,z:points[y + 1][x] * delta }]
        shapes[x][y][0].updatePath();
      }
      else if(y == scale){
        shapes[x][y][0].stroke = 2 / render.zoom
        shapes[x][y][0].path = [{ x: (-0.5 * size * scale) + X * size,y:(-0.5 * size * scale) + Y*size,z:points[y][x] * delta },{ x: (-0.5 * size * scale) + (X + 1) * size,y:(-0.5 * size * scale) + Y*size,z:points[y][x + 1] * delta }]
        shapes[x][y][0].updatePath();
      }
      else{
        shapes[x][y][0].stroke = 2 / render.zoom
        shapes[x][y][0].path = [{ x: (-0.5 * size * scale) + X * size,y:(-0.5 * size * scale) + Y*size,z:points[y][x] * delta },{ x: (-0.5 * size * scale) + (X + 1) * size,y:(-0.5 * size * scale) + Y*size,z:points[y][x + 1] * delta }]
        shapes[x][y][0].updatePath();
        shapes[x][y][1].stroke = 2 / render.zoom
        shapes[x][y][1].path = [{ x: (-0.5 * size * scale) + X * size,y:(-0.5 * size * scale) + Y*size,z:points[y][x] * delta },{ x: (-0.5 * size * scale) + X * size,y:(-0.5 * size * scale) + (Y + 1)*size,z:points[y + 1][x] * delta }]
        shapes[x][y][1].updatePath();
        shapes[x][y][2].path = [
          { x: (-0.5 * size * scale) + X * size,
            y:(-0.5 * size * scale) + Y*size,
            z:points[y][x] * delta
          },
          { x: (-0.5 * size * scale) + (X + 1) * size,
            y:(-0.5 * size * scale) + Y*size,
            z:points[y][x + 1] * delta
          },
          { x: (-0.5 * size * scale) + (X + 1) * size,
            y:(-0.5 * size * scale) + (Y + 1) *size,
            z:points[y + 1][x + 1] * delta
          },
          { x: (-0.5 * size * scale) + X * size,
            y:(-0.5 * size * scale) + (Y + 1)*size,
            z:points[y + 1][x] * delta
          }
        ]
        // let lp = Math.min(points[y][x],points[y+1][x],points[y][x+1],points[y+1][x+1])
        // let hp = Math.max(points[y][x],points[y+1][x],points[y][x+1],points[y+1][x+1])
        // let dp = hp - lp > 3 ? 255 : 0
        // shapes[x][y][2].color = "rgb("+dp+","+dp+","+dp+")"
        shapes[x][y][2].updatePath();
      }
    }
  }
  render.updateRenderGraph();
  requestAnimationFrame(update);
}
