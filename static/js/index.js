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
let colors = [
  "rgb(135, 205, 237)",
  "rgb(1, 101, 252)",
  "rgb(65, 253, 254)",
  "rgb(25, 116, 210)",
  "rgb(36, 160, 237)",
  "rgb(26, 193, 221)",
  "rgb(196, 255, 247)",
  "rgb(125, 249, 255)",
  "rgb(63, 0, 255)",
  "rgb(0, 253, 255)",
  "rgb(17, 102, 255)",
  "rgb(21, 242, 253)",
  "rgb(4, 217, 255)",
  "rgb(2, 3, 226)",
  "rgb(0, 68, 255)",
  "rgb(0, 191, 254)",
  "rgb(1, 15, 204)",
  "rgb(208, 255, 20)",
  "rgb(140, 255, 158)",
  "rgb(207, 255, 0)",
  "rgb(102, 255, 0)",
  "rgb(135, 253, 5)",
  "rgb(157, 255, 0)",
  "rgb(193, 248, 10)",
  "rgb(33, 252, 13)",
  "rgb(8, 255, 8)",
  "rgb(0, 255, 0)",
  "rgb(174, 255, 110)",
  "rgb(83, 254, 92)",
  "rgb(86, 252, 162)",
  "rgb(78, 253, 84)",
  "rgb(170, 255, 50)",
  "rgb(122, 249, 171)",
  "rgb(160, 212, 4)",
  "rgb(0, 250, 154)",
  "rgb(69, 206, 162)",
  "rgb(57, 255, 20)",
  "rgb(119, 221, 119)",
  "rgb(25, 167, 0)",
  "rgb(104, 229, 47)",
  "rgb(125, 237, 23)",
  "rgb(0, 249, 0)",
  "rgb(0, 255, 124)",
  "rgb(6, 194, 172)",
  "rgb(10, 221, 8)",
  "rgb(47, 239, 16)",
  "rgb(254, 160, 81)",
  "rgb(254, 103, 0)",
  "rgb(255, 112, 52)",
  "rgb(255, 200, 42)",
  "rgb(255, 113, 36)",
  "rgb(235, 80, 48)",
  "rgb(237, 135, 45)",
  "rgb(253, 111, 59)",
  "rgb(255, 166, 0)",
  "rgb(238, 136, 0)",
  "rgb(255, 127, 80)",
  "rgb(255, 168, 18)",
  "rgb(252, 100, 45)",
  "rgb(255, 53, 3)",
  "rgb(255, 207, 0)",
  "rgb(235, 97, 35)",
  "rgb(255, 141, 40)",
  "rgb(255, 166, 43)",
  "rgb(240, 131, 0)",
  "rgb(255, 163, 104)",
  "rgb(255, 152, 137)",
  "rgb(255, 153, 51)",
  "rgb(255, 87, 33)",
  "rgb(255, 165, 0)",
  "rgb(255, 127, 0)",
  "rgb(255, 160, 0)",
  "rgb(255, 111, 82)",
  "rgb(250, 91, 61)",
  "rgb(252, 132, 93)",
  "rgb(255, 117, 24)",
  "rgb(252, 158, 33)",
  "rgb(255, 102, 0)",
  "rgb(255, 147, 0)",
  "rgb(255, 116, 32)",
  "rgb(255, 95, 0)",
  "rgb(254, 1, 177)",
  "rgb(255, 133, 255)",
  "rgb(255, 127, 167)",
  "rgb(217, 1, 102)",
  "rgb(244, 191, 255)",
  "rgb(255, 4, 144)",
  "rgb(254, 20, 147)",
  "rgb(253, 63, 146)",
  "rgb(238, 109, 138)",
  "rgb(255, 0, 204)",
  "rgb(255, 2, 141)",
  "rgb(255, 179, 222)",
  "rgb(255, 0, 255)",
  "rgb(255, 47, 235)",
  "rgb(254, 65, 100)",
  "rgb(254, 1, 154)",
  "rgb(255, 102, 255)",
  "rgb(255, 20, 118)",
  "rgb(246, 38, 129)",
  "rgb(214, 72, 215)",
  "rgb(223, 78, 200)",
  "rgb(226, 80, 152)",
  "rgb(246, 104, 142)",
  "rgb(202, 44, 146)",
  "rgb(254, 2, 162)",
  "rgb(255, 28, 174)",
  "rgb(255, 111, 252)",
  "rgb(255, 135, 141)",
  "rgb(240, 111, 255)",
  "rgb(251, 95, 252)",
  "rgb(190, 3, 253)",
  "rgb(173, 10, 253)",
  "rgb(102, 0, 255)",
  "rgb(191, 0, 255)",
  "rgb(143, 0, 241)",
  "rgb(203, 0, 245)",
  "rgb(181, 110, 220)",
  "rgb(188, 19, 254)",
  "rgb(224, 176, 255)",
  "rgb(101, 49, 142)",
  "rgb(184, 12, 227)",
  "rgb(159, 0, 255)",
  "rgb(255, 0, 13)",
  "rgb(227, 0, 34)",
  "rgb(247, 2, 42)",
  "rgb(242, 1, 63)",
  "rgb(255, 64, 64)",
  "rgb(230, 0, 0)",
  "rgb(208, 28, 31)",
  "rgb(254, 0, 2)",
  "rgb(255, 85, 85)",
  "rgb(235, 84, 6)",
  "rgb(253, 89, 86)",
  "rgb(241, 23, 47)",
  "rgb(207, 16, 32)",
  "rgb(188, 39, 49)",
  "rgb(252, 40, 71)",
  "rgb(255, 7, 58)",
  "rgb(255, 27, 45)",
  "rgb(254, 68, 1)",
  "rgb(244, 54, 5)",
  "rgb(241, 12, 69)",
  "rgb(210, 45, 29)",
  "rgb(176, 5, 75)",
  "rgb(221, 17, 51)",
  "rgb(176, 1, 73)",
  "rgb(227, 11, 93)",
  "rgb(255, 0, 0)",
  "rgb(238, 32, 77)",
  "rgb(255, 63, 52)",
  "rgb(250, 42, 85)",
  "rgb(228, 0, 120)",
  "rgb(254, 39, 19)",
  "rgb(248, 72, 28)",
  "rgb(254, 44, 84)",
  "rgb(202, 1, 71)",
  "rgb(255, 36, 0)",
  "rgb(187, 18, 55)",
  "rgb(215, 60, 38)",
  "rgb(255, 17, 17)",
  "rgb(236, 45, 1)",
  "rgb(178, 24, 7)",
  "rgb(253, 13, 53)",
  "rgb(191, 25, 50)",
  "rgb(198, 23, 78)",
  "rgb(239, 57, 57)",
  "rgb(204, 0, 51)",
  "rgb(255, 0, 108)",
  "rgb(247, 13, 26)",
  "rgb(229, 96, 36)",
  "rgb(237, 221, 89)",
  "rgb(255, 252, 121)",
  "rgb(255, 253, 1)",
  "rgb(255, 255, 129)",
  "rgb(255, 246, 0)",
  "rgb(252, 252, 93)",
  "rgb(252, 209, 22)",
  "rgb(255, 255, 49)",
  "rgb(254, 223, 8)",
  "rgb(255, 255, 51)",
  "rgb(255, 252, 0)",
  "rgb(255, 215, 0)",
  "rgb(255, 247, 0)",
  "rgb(241, 255, 98)",
  "rgb(240, 230, 129)",
  "rgb(207, 255, 4)",
  "rgb(209, 226, 49)",
  "rgb(255, 195, 36)",
  "rgb(250, 218, 80)",
  "rgb(238, 210, 2)",
  "rgb(244, 196, 48)",
  "rgb(255, 216, 0)",
  "rgb(247, 183, 24)",
  "rgb(232, 255, 42)",
  "rgb(255, 220, 65)",
  "rgb(223, 255, 79)",
  "rgb(255, 227, 2)",
  "rgb(247, 193, 20)",
  "rgb(255, 255, 0)",
  "rgb(255, 239, 0)",
  "rgb(255, 255, 17)",
  "rgb(255, 204, 58)",
  "rgb(252, 253, 116)",
  "rgb(255, 240, 0)",
  "rgb(255, 255, 20)"
]
let scale = 16
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
  rotate: {x: Zdog.TAU * (0.2 + ((pointerRotation.x + deltaPointerRotation.x) * 0.2)),y: pointerRotation.y,z: Zdog.TAU * 0.0625 +  Zdog.TAU * (pointerRotation.z + deltaPointerRotation.z)}
});
// let ui = {
//   x:false,
//   y:false,
//   clock:false,
//   people:false,
//   colorA:false,
//   colorB:false
// }
let ui = {}
let avatar = {
  joined: false,
  id: "",
  name: "",
  x: -10 + Math.floor(Math.random() * 20),
  y: -10 + Math.floor(Math.random() * 20),
  // x: 0,
  // y: 0,
  // dX: 0,
  // dY: 0,
  d: 40,
  state: 0,
  relD: 0,
  cd: 0.1,
  speed: 0.5,
  shape: new Zdog.Anchor({
    addTo: render,
    translate: {x: 0, y: 0, z: 100}
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
let poi = false
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
    render.rotate = {x: Zdog.TAU * 0.2 + (pointerRotation.x + deltaPointerRotation.x) * 0.6,y: pointerRotation.y,z: Zdog.TAU * 0.0625 + Zdog.TAU * (pointerRotation.z + deltaPointerRotation.z)}
    ui.compass.style.backgroundPositionX = (0.0625 +(pointerRotation.z + deltaPointerRotation.z)) * 200 + "%"
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
    invertA: invertHex(colorA),
    invertB: invertHex(colorA)
  }
  avatar.coloredShapes.ballA.color = avatar.state.colorA
  avatar.coloredShapes.ballB.color = avatar.state.invertA
  avatar.name = "unknown"
  avatar.id = "" + Math.floor(performance.now()) + Math.floor(Math.random() * 1000000)
  // avatar.shapes.ball.group.visible = true
  socket.emit('join', {name:avatar.name,id:avatar.id,state:avatar.state,position:position})
  avatar.joined = true
  ui.colorA.style.background = avatar.state.colorA
  ui.colorB.style.background = avatar.state.invertA
}

function rainbow() {
    return colors[Math.floor(colors.length * Math.random())]
}

function init(){
  // kd.SPACE.down(function () {
  //   avatar.flash()
  // })
  ui.x = document.getElementById("avatarX")
  ui.y = document.getElementById("avatarY")
  ui.clock = document.getElementById("timeOnServer")
  ui.people = document.getElementById("peopleOnServer")
  ui.colorA = document.getElementById("avatarFirstColor")
  ui.colorB = document.getElementById("avatarSecondColor")
  ui.container = document.getElementById("info")
  ui.title = document.getElementById("infoTitle")
  ui.artists = document.getElementById("infoArtists")
  ui.date = document.getElementById("infoDate")
  ui.desc = document.getElementById("infoDesc")
  ui.link = document.getElementById("infoOpen")
  ui.compass = document.getElementById("compass")
  setInterval(function () {
    if(infoFlag == 0 && !moveInterval && hasMovedAfterClose){
      let pos = {
        x: Math.round((virtualSize + (avatar.x % virtualSize)) % virtualSize),
        y: Math.round((virtualSize + (avatar.y % virtualSize)) % virtualSize)
      }
      if(poi){
        for(let _p in poi){
          let p = poi[_p]
          let _x = Math.round((virtualSize + (p.x % virtualSize)) % virtualSize)
          let _y = Math.round((virtualSize + (p.y % virtualSize)) % virtualSize)
          if(pos.x > (_x - infoArea) && pos.x < (_x + infoArea) && pos.y > (_y - infoArea)  && pos.y < (_y + infoArea) ){
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
  socket.on('poi',function(msg){
    if(!poi){
      poi = msg
    }
  })
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
      if(!avatars[s] && !poi[s] && avatarShapes[s]){
        avatarShapes[s].group.remove()
        delete avatarShapes[s]
        // delete poiInView[avatars[s].id]
      }
    }
    for(let a in poi){ // for each poi in the list of pois
        let relX = (scale * 0.5 + virtualSize + (poi[a].x - ((virtualSize + avatar.x) % virtualSize))) % virtualSize
        let relY = (scale * 0.5 + virtualSize + (poi[a].y - ((virtualSize + avatar.y) % virtualSize))) % virtualSize//relative to avatar position and virtual center, range 0 - scale
        let _x = (-scale * 0.5 + relX) * size
        let _y =  (-scale * 0.5 + relY) * size
        let _z = getZAt(relX,relY)* delta + avatar.d + size
        let _az = 4 + _z * Math.abs(-1 + ((performance.now() * 0.0005) % 2))
        if(relX >= 0 && relX <= scale && relY >= 0 && relY <= scale){ //when the relative position is within the view
          if(!avatarShapes[a]){ //when there is no shape for the avatar
            let group = new Zdog.Group({
              addTo:render,
              visible:true
            })
            let anchor = new Zdog.Anchor({
              // translate: poi[a].poi ? {x: (((scale * 0.5 + poi[a].x - 0.5 - avatar.x) % virtualSize)) * size , y: (((scale * 0.5 + poi[a].y - 0.5 - avatar.y) % virtualSize)) * size, z: getZAt(relX,relY) * delta + avatar.d + size} : {x: (((scale * 0.5 + poi[a].x - avatar.x) % virtualSize) - scale * 0.5) * size, y: (((scale * 0.5 + poi[a].y - avatar.y) % virtualSize) - scale * 0.5) * size, z: 4 + getZAt(relX,relY) * 0.5 * delta + avatar.d + size},
              translate: {x: _x, y: _y, z: 4 + _az},
              addTo: group
            })
              anchor = new Zdog.Anchor({
                translate: {x: _x, y: _y, z: _z},
                addTo: render
              })
              let shapes = []
              for(let z = 0; z < 8; z++){
                let block = poi[a].state.plan[0][z]
                let color = poi[a].state.plan[1][z]
                let shape
                let translate = {
                  x: 0,
                  y: 0,
                  z: _z + z * size,
                }
                switch(block){
                  case 1:
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
                  case 2:
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
                  case 3:
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
                  case 4:
                  shape = new Zdog.Shape({
                    addTo: anchor,
                    stroke: size,
                    color: color,
                    translate: translate
                  });
                  break
                  case 5:
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
              avatarShapes[a] = {
                shape: shapes,
                group: group,
                anchor: anchor
              }
              poiInView[poi[a].id] = poi[a]
          }
          else{ //when there is a shape
            let z = poi[a].poi ? _z : _az
            avatarShapes[a].anchor.translate = {x: _x, y: _y, z: z}
          }
        }
        else if(avatarShapes[a]){ //when it is not but there is still a shape representing it
          delete poiInView[poi[a].id]
          avatarShapes[a].anchor.remove()
          delete avatarShapes[a]
        }
    }
    for(let a in avatars){ // for each avatar in the list of avatars
      if(a != avatar.id){ //when the current avatar is not the users avatar
        let relX = (scale * 0.5 + virtualSize + (avatars[a].x - ((virtualSize + avatar.x) % virtualSize))) % virtualSize
        let relY = (scale * 0.5 + virtualSize + (avatars[a].y - ((virtualSize + avatar.y) % virtualSize))) % virtualSize//relative to avatar position and virtual center, range 0 - scale
        let _x = (-scale * 0.5 + relX) * size
        let _y =  (-scale * 0.5 + relY) * size
        let _z = getZAt(relX,relY)* delta + avatar.d + size
        let _az = 4 + _z * Math.abs(-1 + ((performance.now() * 0.0005) % 2))
        if(relX >= 0 && relX <= scale && relY >= 0 && relY <= scale){ //when the relative position is within the view
          if(!avatarShapes[a]){ //when there is no shape for the avatar
            let group = new Zdog.Group({
              addTo:render,
              visible:true
            })
            let anchor = new Zdog.Anchor({
              // translate: avatars[a].poi ? {x: (((scale * 0.5 + avatars[a].x - 0.5 - avatar.x) % virtualSize)) * size , y: (((scale * 0.5 + avatars[a].y - 0.5 - avatar.y) % virtualSize)) * size, z: getZAt(relX,relY) * delta + avatar.d + size} : {x: (((scale * 0.5 + avatars[a].x - avatar.x) % virtualSize) - scale * 0.5) * size, y: (((scale * 0.5 + avatars[a].y - avatar.y) % virtualSize) - scale * 0.5) * size, z: 4 + getZAt(relX,relY) * 0.5 * delta + avatar.d + size},
              translate: {x: _x, y: _y, z: 4 + _az},
              addTo: group
            })
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
          else{ //when there is a shape
            let z = _az
            avatarShapes[a].anchor.translate = {x: _x, y: _y, z: z}
            rotation = Zdog.TAU * (performance.now()) * 0.0001
            avatarShapes[a].anchor.rotate = { x: rotation, y: rotation,z:rotation}
          }
        }
        else if(avatarShapes[a]){ //when it is not but there is still a shape representing it
          avatarShapes[a].group.remove()
          delete avatarShapes[a]
        }
      }
    }
  });
  popup()
  update()
  document.body.classList.add("curtain-open")
}
function getZAt(x,y,q){
    let n = 0
    let _x = q ? Math.round(avatar.x) : avatar.x
    let _y = q ? Math.round(avatar.y) : avatar.y
    // let px = (scale + virtualSize + ((Math.round(avatar.x) + x) % virtualSize)) % virtualSize
    // let py = (scale + virtualSize + ((Math.round(avatar.y) + y) % virtualSize)) % virtualSize
    // if(poi[px + ";" + py] || poi[(px+1) + ";" + py] || poi[px + ";" + (py+1)] || poi[(px+1) + ";" + (py+1)]){
    //   return 0
    // }
    let d = (1 + noise.simplex3((1000 + x + _x) * 0.01,(1000 + y + _y) * 0.01,1000) * 10) * 0.5
    let e = Math.round((0.5 + noise.simplex3((10000 + x + _x) * enviromentsGrain,(10000 + y + _y) * enviromentsGrain,1000) * 0.5) * 4) // 0 - 3
    switch(e){ //// TODO: Add spike world, see screenshot
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
function openInfoDirect(id){
  for(let _p in poi){
    let p = poi[_p]
    if(p.id == id){
      openInfo(p)
      document.body.classList.remove("menu-open")
      document.body.classList.remove("tutorial-open")
      return
    }
  }
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
    if(poi.state.link){
      ui.link.setAttribute("data-href",poi.state.link)
      if(poi.exhibit){
        ui.link.setAttribute("data-target","exhibit")
      }
      else{
        ui.link.setAttribute("data-target","external")
      }
      ui.container.classList.remove("no-link")
    }
    else{
      ui.container.classList.add("no-link")
    }
    if(poi.state.linktitle){
      ui.link.innerText = poi.state.linktitle
    }
    else{
      ui.link.innerText = "Enter"
    }
    document.body.classList.add("info-open")
  }
}
function closeInfo(){
  document.body.classList.remove("info-open")
  infoFlag = -infoCD
}
function openLink(e){
  let link = document.getElementById("infoOpen")
  let target = link.getAttribute("data-target")
  let href = link.getAttribute("data-href")
  if(target == "external"){
    window.open(href, '_blank')
  }
  else if(target == "exhibit"){
    document.body.classList.remove("curtain-open")
    setTimeout(function () {
      socket.emit('kill', {id:avatar.id})
      window.location.href = href + "?color=" + avatar.state.colorA.replace("#","") + "&x=" + Math.round(avatar.x)  + "&y=" + Math.round(avatar.x)
    }, 1500);
  }
}
function toggleMenu(){
  document.body.classList.toggle("menu-open")
  // infoFlag = document.body.classList.contains("menu-open") ? 1 : 0
}
function update(){
  uiUpdateClock++
  if((uiUpdateClock % updateUIAfter) == 0){
    let time = Math.floor(performance.now() / 1000)
    ui.x.innerText = Math.round(avatar.x % virtualSize)
    ui.y.innerText = Math.round(avatar.y % virtualSize)
    ui.clock.innerText = ("" + Math.floor(time / 60 / 60)).padStart(2, '0') + ":" + ("" + (Math.floor(time / 60) % 60)).padStart(2, '0') + ":" + ("" + (time % 60)).padStart(2, '0')
    ui.people.innerText = Object.keys(avatars).length
    let poiList = document.getElementById("outputPOI")
    poiList.innerHTML = ""
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
  }
    avatar.shape.translate = {z: 4 + getZAt(scale * 0.5,scale * 0.5) * 0.5 * delta + size + avatar.d * Math.abs(-1 + ((performance.now() * 0.0005) % 2))}
    avatar.shape.rotate = { x: Zdog.TAU * performance.now() * 0.0001, y: Zdog.TAU * performance.now() * 0.0001,z: Zdog.TAU * performance.now() * 0.0001 }

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
// function invertHex(hex) {
//   return (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
// }
function invertHex(rgb){
  rgb = [].slice.call(arguments).join(",").replace(/rgb\(|\)|rgba\(|\)|\s/gi, '').split(',');
  for (var i = 0; i < rgb.length; i++) rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
  return "rgb(" + rgb.join(", ") + ")";
}
