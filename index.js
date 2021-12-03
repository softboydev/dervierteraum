const socket = io()
let controls = {}
let moveInterval = false
let pointerFlag = false
let pointerStamp = 0
let clickTime = 150
let pointerRotation = {x:0,y:0,z:0}
let deltaPointerRotation = {x:0,y:0,z:0}
let lastPointer = false
let rotateX = 0
let rotateY = 0
let updateUIAfter = 10
let uiUpdateClock = 0
let infoFlag = 0
let infoCD = 10
let hasMovedAfterClose = false
let infoArea = 2
let colors = ['#87CEFA','#483D8B','#9370DB','#8B0000','#F0FFFF','#2E8B57','#FFF8DC','#000080','#778899','#A9A9A9','#DA70D6','#FFF5EE','#A0522D','#B0E0E6','#B8860B','#6B8E23','#5F9EA0','#FFF0F5','#FFE4E1','#DC143C','#90EE90','#FFFF00','#FF1493','#556B2F','#E6E6FA','#D2B48C','#FF69B4','#E9967A','#708090','#DDA0DD','#EE82EE','#9400D3','#DCDCDC','#4682B4','#008B8B','#3CB371','#6A5ACD','#F5F5DC','#808000','#FFD700','#9ACD32','#FFDEAD','#DAA520','#696969','#9932CC','#FFE4B5','#800080','#F5DEB3','#E0FFFF','#FFFFE0','#191970','#00FFFF','#B0C4DE','#F5F5F5','#006400','#7FFFD4','#20B2AA','#7FFF00','#C0C0C0','#FFDAB9','#FFE4C4','#40E0D0','#D2691E','#BA55D3','#FFB6C1','#A52A2A','#D8BFD8','#FFFAFA','#FFFFFF','#AFEEEE','#7CFC00','#FF7F50','#32CD32','#F8F8FF','#6495ED','#F0FFF0','#00FF00','#4169E1','#BC8F8F','#00BFFF','#00008B','#00FF7F','#DB7093','#FF00FF','#808080','#00CED1','#ADFF2F','#FFA500','#FF00FF','#66CDAA','#800000','#2F4F4F','#00FFFF','#FFA07A','#F0F8FF','#DEB887','#FDF5E6','#FF0000','#CD853F','#0000FF','#7B68EE','#FFFAF0','#48D1CC','#FAEBD7','#F08080','#EEE8AA','#F0E68C','#FFEFD5','#9966CC','#FF6347','#1E90FF','#FF8C00','#CD5C5C','#00FA9A','#228B22','#8FBC8F','#FF4500','#7B68EE','#FFFFF0','#B22222','#000000','#FA8072','#ADD8E6','#8B008B','#D3D3D3','#FFA07A','#8A2BE2','#FFEBCD','#0000CD','#F4A460','#FFC0CB','#4B0082','#F5FFFA','#BDB76B','#87CEEB','#008080','#C71585','#FAF0E6','#008000','#8B4513','#FAFAD2','#FFFACD','#98FB98']
let scale = 24
let virtualSize = 24
let size = 40
let delta = 14
let points = []
let enviromentsGrain = 0.01
let shapes = []
let speed = 0.0003
let grain = 0.5
let render = new Zdog.Illustration({
  element: '.zdog-canvas',
  resize: true,
  rotate: {x: Zdog.TAU * (0.2 + ((pointerRotation.x + deltaPointerRotation.x) * 0.2)),y: pointerRotation.y,z: Zdog.TAU * (pointerRotation.z + deltaPointerRotation.z)}
});
let ui = {
  x:false,
  y:false,
  clock:false,
  people:false,
  colorA:false,
  colorB:false
}
let info = {
  title: false,
  artists: false,
  date: false,
  desc: false,
  link: false
}
let avatar = {
  joined: false,
  id: "",
  name: "",
  x: -10 + Math.floor(Math.random() * 20),
  y: -10 + Math.floor(Math.random() * 20),
  // dX: 0,
  // dY: 0,
  d: 40,
  state: 0,
  relD: 0,
  cd: 0.1,
  speed: 0.5,
  shape: new Zdog.Anchor({
    addTo: render,
    translate: {x: size * scale * 0.5, y: size * scale * 0.5, z: 100}
  }),
  shapes: {},
  coloredShapes: {},
  // ball:new Zdog.Shape({
  //   addTo: this.shape,
  //   // path: [{x: size * scale * 0.5, y: size * scale * 0.5, z: 100}],
  //   path: [{x:0,y:0,z:0}],
  //   stroke: size,
  //   color: "#fff"
  // }),
  move: function(v){
    // this.dX += v.x
    // this.dY += v.y
    if(infoFlag != 1){
      this.x += v.x * this.speed
      this.y += v.y * this.speed
    }

  },
  // flash: function(){
  //   if(this.state.flash <= 0){
  //     this.state.flash = 1
  //   }
  // }
}
let oldAvatars = false
let avatars = false
let avatarShapes = {}
let poiInView = {}
let timestamp = performance.now()
let lastResponseTime = 1000

avatar.shapes.ball = {
  group: new Zdog.Group({addTo:avatar.shape,visible:false})
}
avatar.shapes.ball.anchor = new Zdog.Anchor({
  addTo: avatar.shapes.ball.group
})
avatar.coloredShapes.ballA = new Zdog.Hemisphere({
  addTo: avatar.shapes.ball.anchor,
  diameter: size,
  stroke: false,
  color: "#ffffff"
});
avatar.coloredShapes.ballB = new Zdog.Hemisphere({
  addTo: avatar.shapes.ball.anchor,
  diameter: size,
  stroke: false,
  color: "#0000ff",
  rotate: { x: Zdog.TAU/2 }
});

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

function pointerDown(x,y){
  pointerStamp = performance.now()
  if(!pointerFlag){
    lastPointer = {x:x,y:y}
    pointerFlag = true
    if(!moveInterval){
      setTimeout(function () {
        if(pointerFlag){
          hasMovedAfterClose = true
          document.body.classList.remove("tutorial-open")
          moveInterval = setInterval(function(){
            let d = new Zdog.Vector({ x: 0, y: -1 }).rotate({ z: Zdog.TAU - render.rotate.z });
            avatar.move(d)
          },30)
        }
      }, clickTime);
    }
  }
}
function pointerUp(){
  // if(performance.now() - pointerStamp < clickTime){
  //   avatar.flash()
  // }
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
  if(infoFlag != 1){
    if(pointerFlag){
      let dX =  (lastPointer.x - x) / window.innerWidth
      let dY =  (lastPointer.y - y) / window.innerHeight
      deltaPointerRotation.z = dX
      deltaPointerRotation.x = (-0.5 < (pointerRotation.x + dY) && (pointerRotation.x + dY) < 0.5) ? dY : (pointerRotation.x + dY) > 0.5 ? 0.5 - pointerRotation.x : -0.5 - pointerRotation.x
    }
    render.zoom = 1 + pointerRotation.x + deltaPointerRotation.x
    render.rotate = {x: Zdog.TAU * 0.2 + (pointerRotation.x + deltaPointerRotation.x) * 0.6,y: pointerRotation.y,z: Zdog.TAU * (pointerRotation.z + deltaPointerRotation.z)}
  }
}

function popup(){
  // document.getElementById("buttonJoin").addEventListener("click",join)
  // document.getElementById("popupJoin").classList.add("is-active")
  join()
}

function join(){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  // document.getElementById("popupJoin").classList.remove("is-active")
  let colorA = urlParams.get('color') ? "#" + urlParams.get('color') : rainbow()
  let position = urlParams.get('x') && urlParams.get('y') ? {x:Number(urlParams.get('x')),y:Number(urlParams.get('x'))} : false
  if(position){
    avatar.x = position.x
    avatar.y = position.y
  }
  else{
    document.body.classList.add("tutorial-open")
  }
  avatar.state = {
    // colorA: document.getElementById("inputColorFirst").value,
    // colorB: document.getElementById("inputColorSecond").value,
    // invertA: "#" + invertHex(document.getElementById("inputColorFirst").value.replace("#","")),
    // invertB: "#" + invertHex(document.getElementById("inputColorSecond").value.replace("#","")),
    colorA: colorA,
    colorB: colorA,
    invertA: "#" + invertHex(colorA.replace("#","")),
    invertB: "#" + invertHex(colorA.replace("#",""))
  }
  avatar.coloredShapes.ballA.color = avatar.state.colorA
  avatar.coloredShapes.ballB.color = avatar.state.invertA
  avatar.name = "unknown"
  avatar.id = "" + performance.now() + Math.floor(Math.random() * 1000000)
  // avatar.shapes.ball.group.visible = true
  socket.emit('join', {name:avatar.name,id:avatar.id,state:avatar.state,position:position})
  avatar.joined = true
}

function rainbow() {
    return colors[Math.floor(colors.length * Math.random())]
}

function init(){
  // kd.SPACE.down(function () {
  //   avatar.flash()
  // })
  // ui.x = document.getElementById("avatarX")
  // ui.y = document.getElementById("avatarY")
  // ui.clock = document.getElementById("timeOnServer")
  // ui.people = document.getElementById("peopleOnServer")
  // ui.colorA = document.getElementById("avatarFirstColor")
  // ui.colorB = document.getElementById("avatarSecondColor")
  ui.title = document.getElementById("infoTitle")
  ui.artists = document.getElementById("infoArtists")
  ui.date = document.getElementById("infoDate")
  ui.desc = document.getElementById("infoDesc")
  ui.link = document.getElementById("infoOpen")
  setInterval(function () {
    if(infoFlag == 0 && !moveInterval && hasMovedAfterClose){
      let pos = {
        x: Math.round((virtualSize + (avatar.x % virtualSize)) % virtualSize),
        y: Math.round((virtualSize + (avatar.y % virtualSize)) % virtualSize)
      }
      for(let a in avatars){
        let p = avatars[a]
        if(p.poi){
          let _x = Math.round((virtualSize + (p.x % virtualSize)) % virtualSize)
          let _y = Math.round((virtualSize + (p.y % virtualSize)) % virtualSize)
          if(pos.x > (_x - infoArea)  && pos.x < (_x + infoArea) && pos.y > (_y - infoArea)  && pos.y < (_y + infoArea) ){
            openInfo(p)
            return
          }
        }
      }
    }
    else if(infoFlag < 0){
      infoFlag += 1
    }
  }, 250);
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
  socket.on('update', function(msg) {
    timestamp = performance.now()
    kd.tick()
    if(avatar.joined){
      // socket.emit('alive', {id:avatar.id,x:avatar.dX,y:avatar.dY,state:avatar.state})
      socket.emit('alive', {id:avatar.id,x:avatar.x,y:avatar.y,state:avatar.state})
    }
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
      avatars[avatar.id].x = avatar.x
      avatars[avatar.id].y = avatar.y
      avatar.shapes.ball.group.visible = true
    }
    for(let s in avatarShapes){
      if(!avatars[s] && avatarShapes[s]){
        avatarShapes[s].group.remove()
        delete avatarShapes[s]
        // delete poiInView[avatars[s].id]
      }
    }
    for(let a in avatars){ // for each avatar in the list of avatars
      let relX = (scale * 0.5 + avatars[a].x - avatar.x) % virtualSize //determine the relative position
      let relY = (scale * 0.5 + avatars[a].y - avatar.y) % virtualSize //relative to avatar position and virtual center, range 0 - scale
      if(a != avatar.id){ //when the current avatar is not the users avatar
        if(relX >= 0 && relX <= scale && relY >= 0 && relY <= scale){ //when the relative position is within the view
          if(!avatarShapes[a]){ //when there is no shape for the avatar
            let group = new Zdog.Group({
              addTo:render,
              visible:true
            })
            let anchor = new Zdog.Anchor({
              // translate: avatars[a].poi ? {x: (((scale * 0.5 + avatars[a].x - 0.5 - avatar.x) % virtualSize)) * size , y: (((scale * 0.5 + avatars[a].y - 0.5 - avatar.y) % virtualSize)) * size, z: getZAt(relX,relY) * delta + avatar.d + size} : {x: (((scale * 0.5 + avatars[a].x - avatar.x) % virtualSize) - scale * 0.5) * size, y: (((scale * 0.5 + avatars[a].y - avatar.y) % virtualSize) - scale * 0.5) * size, z: 4 + getZAt(relX,relY) * 0.5 * delta + avatar.d + size},
                            translate: {x: (((scale * 0.5 + avatars[a].x - avatar.x) % virtualSize) - scale * 0.5) * size, y: (((scale * 0.5 + avatars[a].y - avatar.y) % virtualSize) - scale * 0.5) * size, z: 4 + getZAt(relX,relY) * 0.5 * delta + avatar.d + size},
              addTo: group
            })
            if(avatars[a].poi){
              // let shape = new Zdog.Box({
              //   addTo: anchor,
              //   width: size,
              //   height: size,
              //   depth: size,
              //   stroke: false,
              //   color: avatars[a].state.colors[0],
              //   leftFace: avatars[a].state.colors[1],
              //   rightFace: avatars[a].state.colors[1],
              //   rearFace: avatars[a].state.colors[0],
              //   topFace: avatars[a].state.colors[2],
              //   bottomFace: avatars[a].state.colors[2]
              // });
              let _z = getZAt(relX,relY) * delta + avatar.d + size
              anchor = new Zdog.Anchor({
                translate: {x: (((scale * 0.5 + avatars[a].x - avatar.x) % virtualSize) - scale * 0.5) * size, y: (((scale * 0.5 + avatars[a].y - avatar.y) % virtualSize) - scale * 0.5) * size, z: _z},
                addTo: render
              })
              let shapes = []
              for(let z = 0; z < 8; z++){
                let block = avatars[a].state.plan[0][z]
                let color = avatars[a].state.plan[1][z]
                let shape
                let translate = {
                  x: 0,
                  y: 0,
                  z: _z + z * size,
                }
                switch(block){
                  case "X":
                  shape = new Zdog.Box({
                    addTo: anchor,
                    width: size,
                    height: size,
                    depth: size,
                    stroke: false,
                    color: color,
                    translate: translate
                  });
                  break
                  case "A":
                  translate.z = translate.z - 0.5 * size
                  shape = new Zdog.Cone({
                    addTo: anchor,
                    diameter: size,
                    length: size,
                    stroke: false,
                    color: color,
                    translate: translate
                  });
                  break
                  case "V":
                  translate.z = translate.z - 0.5 * size
                  shape = new Zdog.Cone({
                    addTo: anchor,
                    diameter: size,
                    length: size,
                    stroke: false,
                    color: color,
                    translate: {
                      x: 0,
                      y: 0,
                      z: translate.z + size,
                    },
                    rotate: {x:0,y:Zdog.TAU/2,z:0}
                  });
                  break
                  case "O":
                  shape = new Zdog.Shape({
                    addTo: anchor,
                    stroke: size,
                    color: color,
                    translate: translate
                  });
                  break
                  case "I":
                  shape = new Zdog.Cylinder({
                    addTo: anchor,
                    diameter: size,
                    length: size,
                    stroke: false,
                    color: color,
                    translate:translate
                  });
                  break
                }
                shapes.push(shape)
              }
              // let shape = new Zdog.Cylinder({
              //   addTo: anchor,
              //   diameter: size,
              //   length: size,
              //   stroke: false,
              //   color: avatars[a].state.colors[0],
              //   frontFace: avatars[a].state.colors[1],
              //   backface: avatars[a].state.colors[2],
              // });
              // var tetrahedron = new Zdog.Anchor({
              //   addTo: anchor,
              //   translate: { x: 0, y: 0 },
              //   scale: 60,
              // });
              // var TAU = Zdog.TAU;
              // var radius = 0.5;
              // var inradius = Math.cos( TAU/6 ) * radius;
              // var height = radius + inradius;
              // var triangle = new Zdog.Polygon({
              //   sides: 3,
              //   radius: radius,
              //   addTo: tetrahedron,
              //   translate: { y: height/2 },
              //   fill: true,
              //   stroke: false,
              //   color: avatars[a].state.colors[3] || "#000000"
              // });
              // for ( var i=0; i < 3; i++ ) {
              //   var rotor1 = new Zdog.Anchor({
              //     addTo: tetrahedron,
              //     rotate: { y: TAU/3 * -i },
              //   });
              //   var rotor2 = new Zdog.Anchor({
              //     addTo: rotor1,
              //     translate: { z: inradius, y: height/2 },
              //     rotate: { x: Math.acos(1/3) * -1 + TAU/4  },
              //   });
              //   triangle.copy({
              //     addTo: rotor2,
              //     translate: { y: -inradius },
              //     color: avatars[a].state.colors[i]
              //   });
              // }
              // triangle.rotate.set({ x: -TAU/4, z: -TAU/2 });
              avatarShapes[a] = {
                shape: shapes,
                group: group,
                anchor: anchor
              }
              poiInView[avatars[a].id] = avatars[a]
            }
            else{
              let sphereA = new Zdog.Hemisphere({
                addTo: anchor,
                diameter: size,
                stroke: false,
                color: avatars[a].state.colorA
              });
              let sphereB = new Zdog.Hemisphere({
                addTo: anchor,
                diameter: size,
                stroke: false,
                color: avatars[a].state.invertA,
                rotate: { x: Zdog.TAU/2 }
              });
              avatarShapes[a] = {
                group: group,
                anchor: anchor,
                sphereA: sphereA,
                sphereB: sphereB
              }
            }
          }
          else{ //when there is a shape
            (((scale * 0.5 + avatars[a].x - avatar.x) % virtualSize) - scale * 0.5)
            if(avatars[a].poi){
              avatarShapes[a].anchor.translate = {x: (((scale * 0.5 + avatars[a].x - avatar.x) % virtualSize) - scale * 0.5) * size, y: (((scale * 0.5 + avatars[a].y - avatar.y) % virtualSize) - scale * 0.5) * size, z: getZAt(relX,relY) * delta + avatar.d + size}
              // for(let s in avatarShapes[a].shape){
              //   let shape = avatarShapes[a].shape[s]
              //   rotation = Zdog.TAU * (performance.now()) * 0.0001
              //   shape.rotate = { x: 0, y: 0,z: rotation}
              // }
            }
            else{
              avatarShapes[a].anchor.translate = {x: (((scale * 0.5 + avatars[a].x - avatar.x) % virtualSize) - scale * 0.5) * size, y: (((scale * 0.5 + avatars[a].y - avatar.y) % virtualSize) - scale * 0.5) * size, z: 4 + getZAt(relX,relY) * 0.5 * delta + avatar.d + size}
              rotation = Zdog.TAU * (performance.now()) * 0.0001
              avatarShapes[a].anchor.rotate = { x: rotation, y: rotation,z:rotation}
            }
          }
        }
        else if(avatarShapes[a]){ //when it is not but there is still a shape representing it
          if(avatars[a].poi){
            delete poiInView[avatars[a].id]
            avatarShapes[a].anchor.remove()
          }
          else{
            avatarShapes[a].group.remove()
          }

          delete avatarShapes[a]
        }
      }
    }
  });
  popup()
  update()
}
function getZAt(x,y,q){
  let n = 0
  let _x = q ? Math.round(avatar.x) : avatar.x
  let _y = q ? Math.round(avatar.y) : avatar.y
  let d = (1 + noise.simplex3((1000 + x + _x) * 0.01,(1000 + y + _y) * 0.01,1000) * 10) * 0.5
  let e = Math.round((0.5 + noise.simplex3((10000 + x + _x) * enviromentsGrain,(10000 + y + _y) * enviromentsGrain,1000) * 0.5) * 4) // 0 - 3
  switch(e){
    case 0: //water at sea level 0 - 1
      n = (1 + Math.sin(y + performance.now() * 0.001) * 0.5)
      break
    case 1: //moving planes 2 - 3
      n = 2 + ((1 + noise.simplex3(x + _x * grain,y + _y * grain,performance.now() * speed)) * 0.5)
      break
    case 2: //still planes
      n = 3
      break
    case 3: //cityblocks 3 - 8
      // n = 2 + Math.pow(1 + ((1 + noise.simplex3(((x + _x) + ((x + _x) % 2)) * grain,((y + _y) + ((y + _y) % 2)) * grain,0)) * 0.5),4)
      n = 2 + Math.pow(1 + ((1 + noise.simplex3(((x + _x) + ((x + _x) % 2)) * grain,((y + _y) + ((y + _y) % 2)) * grain,0)) * 0.5),3)
      break
    case 3: // mountains 0 - 16
      // n = 2 + Math.pow(((1 + noise.simplex3(x + _x * grain * 0.1,y + _y * grain * 0.1,performance.now() * speed * 0.1)) * 0.5),2) * 16
      n = 2 + Math.pow(((1 + noise.simplex3(x + _x * grain * 0.1,y + _y * grain * 0.1,performance.now() * speed * 0.1)) * 0.5),2) * 8
      break
  }
  return n - 12
}
function openInfo(poi){
  if(!infoFlag){
    hasMovedAfterClose = false
    infoFlag = 1
    ui.title.innerText = poi.name
    if(poi.state.artists){
      ui.artists.innerText = poi.state.artists
      ui.artists.style.display = "block"
    }
    else{
      ui.artists.style.display = "none"
    }
    if(poi.state.date){
      ui.date.innerText = poi.state.date
      ui.date.style.display = "block"
    }
    else{
      ui.date.style.display = "none"
    }
    ui.desc.innerText = poi.state.description
    ui.link.setAttribute("href",poi.state.link)
    document.body.classList.add("info-open")
  }
}
function closeInfo(){
  document.body.classList.remove("info-open")
  infoFlag = -infoCD
}
function update(){
  uiUpdateClock++
  if((uiUpdateClock % updateUIAfter) == 0){
    let time = Math.floor(performance.now() / 1000)
    // ui.x.innerText = Math.round(avatar.x % virtualSize)
    // ui.y.innerText = Math.round(avatar.y % virtualSize)
    // ui.clock.innerText = Math.floor(time / 60 / 60) + ":" + Math.floor(time / 60) % 60 + ":" + time % 60
    // ui.people.innerText = Object.keys(avatars).length
    // ui.colorA.style.background = avatar.state.colorA
    // ui.colorB.style.background = avatar.state.invertA
    let poiList = document.getElementById("outputPOI")
    poiList.innerHTML = ""
    let tr = document.createElement("tr")
    let th = document.createElement("th")
    let td = document.createElement("td")
    let a = document.createElement("a")
    a.href = "https://frappant.org/kontakt/"
    a.innerText = "Imprint"
    tr.appendChild(td)
    th.appendChild(a)
    tr.appendChild(th)
    poiList.appendChild(tr)
    for(let poi in poiInView){
      let tr = document.createElement("tr")
      let th = document.createElement("th")
      let td = document.createElement("td")
      let a = document.createElement("a")
      a.href = poiInView[poi].state.link
      a.innerText = poiInView[poi].name
      for(let c in poiInView[poi].state.plan[1]){
        let span = document.createElement("span")
        span.classList.add("color")
        span.style.background = poiInView[poi].state.plan[1][c]
        td.appendChild(span)
      }
      tr.appendChild(td)
      th.appendChild(a)
      tr.appendChild(th)
      poiList.appendChild(tr)
    }
  }
  if(avatars[avatar.id]){
    avatar.state = avatars[avatar.id].state
    avatar.shape.translate = {z: 4 + getZAt(scale * 0.5,scale * 0.5) * 0.5 * delta + size + avatar.d * Math.abs(-1 + ((performance.now() * 0.0005) % 2))}
    avatar.shape.rotate = { x: Zdog.TAU * performance.now() * 0.0001, y: Zdog.TAU * performance.now() * 0.0001,z: Zdog.TAU * performance.now() * 0.0001 }
  }
  // if(avatar.state.flash > 0){
  //   avatar.coloredShapes.ballA.color = avatar.state.invertA
  //   avatar.coloredShapes.ballB.color = avatar.state.invertB
  // }
  // else{
  //   avatar.coloredShapes.ballA.color = avatar.state.colorA
  //   avatar.coloredShapes.ballB.color = avatar.state.colorB
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
        shapes[x][y][2].updatePath();
      }
    }
  }
  render.updateRenderGraph();
  requestAnimationFrame(update);
}
function invertHex(hex) {
  return (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
}
