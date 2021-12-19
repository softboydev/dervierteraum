//GLOBAL
// if(location.protocol !== 'https:') {
//     location.replace(`https:${location.href.substring(location.protocol.length)}`);
// }
const IO = io() //Socket connection
const POS = function(x,y,z){
  this.x = x || 0
  this.y = y || 0
  this.z = z || 0
}
const Z = Zdog //Writes into a single letter variable
const TAU = Z.TAU //Stores into own variable
const WORLD = new Z.Illustration({ //Main render object
  element: '.zdog-canvas', //selector for DOM element
  resize: true, //enables dynamic resize
  rotate: {x: TAU * 0.2,y: 0,z: TAU * 0.0625}//sets base rotation for first render
});
const U = { //UTILS
  invertHex: function(hex){
    hex = hex.replace("#","")
    return "#" + (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
  },
  randomColor: function(){
      return COLOR_POOL[Math.floor(COLOR_POOL.length * Math.random())]
  },
  randomJoinPos: function(){
    let x = -JOIN_SPREAD + Math.floor(Math.random() * JOIN_SPREAD * 2)
    let y = -JOIN_SPREAD + Math.floor(Math.random() * JOIN_SPREAD * 2)
    return {x:x,y:y}
  },
  getVPos: function(pos,q){
    let vx,vy
    if(q){
      vx = (FOV * 0.5 + BOUNDS + ((pos.x - Math.round(AVATAR.x)) % BOUNDS)) % BOUNDS
      vy = (FOV * 0.5 + BOUNDS + ((pos.y - Math.round(AVATAR.y)) % BOUNDS)) % BOUNDS
    }
    else{
      vx = (FOV * 0.5 + BOUNDS + ((pos.x - AVATAR.x) % BOUNDS)) % BOUNDS
      vy = (FOV * 0.5 + BOUNDS + ((pos.y - AVATAR.y) % BOUNDS)) % BOUNDS
    }
    return {x:vx,y:vy}
  },
  getZAt: function(x,y,q){
      let n = 0
      let _x = q ? Math.round(AVATAR.x) : AVATAR.x
      let _y = q ? Math.round(AVATAR.y) : AVATAR.y
      let d = (1 + noise.simplex3((1000 + x + _x) * 0.01,(1000 + y + _y) * 0.01,1000) * 10) * 0.5
      let e = Math.floor((0.5 + noise.simplex3((10000 + x + _x) * VARIETY,(10000 + y + _y) * VARIETY,1000) * 0.5) * 18) // 0 - 3
      switch(e){ //// TODO: Add spike world, see screenshot
        case 0: //water at sea level 0 - 1
        case 1:
        case 2:
        case 3:
          n = (1 + Math.sin(y + performance.now() * 0.001) * 0.5)
          break
        case 4: //moving planes 2 - 3
        case 5:
          n = 2 + ((1 + noise.simplex3(x + _x * GRAIN,y + _y * GRAIN,performance.now() * ANIMATION_SPEED)) * 0.5)
          break
        case 6: //still planes
          n = 3
          break
        case 7: //trees
        case 8:
          n = (noise.simplex3(((x + _x) + ((x + _x))) * GRAIN,((y + _y) + ((y + _y))) * GRAIN,0) > 0.8) ? 8 : 3
          break
        case 9: //rocky desert
        case 10:
          n = (noise.simplex3(((x + _x) + ((x + _x))) * GRAIN,((y + _y) + ((y + _y))) * GRAIN,0) > 0.5) ? 6 : 3
          break
        case 11: //suburb
        case 12:
          n = (noise.simplex3(((x + _x) + ((x + _x) % 2)) * GRAIN,((y + _y) + ((y + _y) % 2)) * GRAIN,0) > 0.5) ? 6 : 3
          break
        case 13: //cityblocks 3 - 8
        case 14:
        case 15:
        case 16:
          // n = 2 + Math.pow(1 + ((1 + noise.simplex3(((x + _x) + ((x + _x) % 2)) * GRAIN,((y + _y) + ((y + _y) % 2)) * GRAIN,0)) * 0.5),4)
          n = 2 + Math.pow(1 + ((1 + noise.simplex3(((x + _x) + ((x + _x) % 2)) * GRAIN,((y + _y) + ((y + _y) % 2)) * GRAIN,0)) * 0.5),3)
          break
        case 17: // mountains 0 - 16
        case 18:
          // n = 2 + Math.pow(((1 + noise.simplex3(x + _x * GRAIN * 0.1,y + _y * GRAIN * 0.1,performance.now() * speed * 0.1)) * 0.5),2) * 16
          n = 2 + Math.pow(((1 + noise.simplex3(x + _x * GRAIN * 0.1,y + _y * GRAIN * 0.1,performance.now() * ANIMATION_SPEED * 0.1)) * 0.5),2) * 8
          break
      }
      return n - 10 - ELEVATION
  },
  calcDiagonal: function(){
    return Math.min(((window.innerWidth + window.innerHeight) * 0.5) / LARGEST_DIAGONAL,1)
  },
  calcFov: function(){
    // let fr = 1000 / FRAMETIME_AVG
    // let d = 0
    // if(fr < FRAME_LOWERGOAL){
    //   d = -2
    // }
    // else if(fr > FRAME_UPPERGOAL){
    //   d = 2
    // }
    //divided by two for average and divided by 500 for steps in one
    return Math.min(Math.round((FOV_MIN + U.calcDiagonal() * (FOV_MAX - FOV_MIN)) * 0.5) * 2, FOV_MAX)
  }
}
const I = { //INPUTHANDLING
  pointerDown: function(x,y){
    LAST_POINTER_TIMESTAMP = performance.now()
    if(!POINTER_FLAG){
      LAST_POINTER = {x:x,y:y}
      POINTER_FLAG = true
      if(!MOVE_INTERVAL){
        setTimeout(function () {
          if(POINTER_FLAG){
            USER_HAS_MOVED_AFTER_CLOSE = true
            document.body.classList.remove("tutorial-open")
            MOVE_INTERVAL = setInterval(function(){
              let d = new Z.Vector({ x: 0, y: -1 }).rotate({ z: TAU - WORLD.rotate.z });
              AVATAR.move(d)
            },30)
          }
        }, CLICK_TIME);
      }
    }
  },
  pointerUp: function(){
    if(POINTER_FLAG){
      POINTER_ROTATION.z += POINTER_ROTATION_DELTA.z
      POINTER_ROTATION.x += POINTER_ROTATION_DELTA.x
      POINTER_ROTATION_DELTA = {x:0,y:0,z:0}
      POINTER_FLAG = false
      if(MOVE_INTERVAL){
        clearInterval(MOVE_INTERVAL)
        MOVE_INTERVAL = false
      }
    }
  },
  handleRotate: function (x,y){
    if(INFO_FLAG != 1){
      if(POINTER_FLAG){
        let dX =  (LAST_POINTER.x - x) / window.innerWidth
        let dY =  (LAST_POINTER.y - y) / window.innerHeight
        POINTER_ROTATION_DELTA.z = dX * DIAGONAL
        POINTER_ROTATION_DELTA.x = (-0.5 < (POINTER_ROTATION.x + dY) && (POINTER_ROTATION.x + dY) < 0.5) ? dY : (POINTER_ROTATION.x + dY) > 0.5 ? 0.5 - POINTER_ROTATION.x : -0.5 - POINTER_ROTATION.x
      }
      WORLD.zoom = 1 + POINTER_ROTATION.x + POINTER_ROTATION_DELTA.x
      WORLD.rotate = {x: TAU * 0.2 + (POINTER_ROTATION.x + POINTER_ROTATION_DELTA.x) * 0.6,y: POINTER_ROTATION.y,z: TAU * 0.0625 + TAU * (POINTER_ROTATION.z + POINTER_ROTATION_DELTA.z)}
      // UI.compass.style.backgroundPositionX = Math.round((0.125 + (POINTER_ROTATION.z + POINTER_ROTATION_DELTA.z)) * 200) + "%"
    }
  }
}
const G = { //GLOBAL
  openInfo: function(poi,force){
    if(!INFO_FLAG || force){
      USER_HAS_MOVED_AFTER_CLOSE = false
      INFO_FLAG = 1
      UI.title.innerText = poi.name
      if(poi.state.artists){
        UI.artists.innerText = poi.state.artists
        UI.artists.style.display = "block"
      }
      else{
        UI.artists.style.display = "none"
      }
      if(poi.state.date){
        UI.date.innerText = poi.state.date
        UI.date.style.display = "block"
      }
      else{
        UI.date.style.display = "none"
      }
      UI.desc.innerHTML = poi.state.description
      if(poi.state.link){
        UI.link.setAttribute("data-href",poi.state.link)
        if(poi.exhibit){
          UI.link.setAttribute("data-target","exhibit")
        }
        else{
          UI.link.setAttribute("data-target","external")
        }
        UI.container.classList.remove("no-link")
      }
      else{
        UI.container.classList.add("no-link")
      }
      if(poi.state.linktitle){
        UI.link.innerText = poi.state.linktitle
      }
      else{
        UI.link.innerText = "Enter"
      }
      document.body.classList.add("info-open")
    }
  },
  closeInfo: function(){
    document.body.classList.remove("info-open")
    INFO_FLAG = -INFO_CD
  },
  openLink: function (e){
    let link = document.getElementById("infoOpen")
    let target = link.getAttribute("data-target")
    let href = link.getAttribute("data-href")
    if(target == "external"){
      window.open(href, '_blank')
    }
    else if(target == "exhibit"){
      document.body.classList.remove("curtain-open")
      setTimeout(function () {
        IO.emit('kill', {id:AVATAR.id})
        let x = Math.round((BOUNDS + (AVATAR.x % BOUNDS)) % BOUNDS)
        let y = Math.round((BOUNDS + (AVATAR.y % BOUNDS)) % BOUNDS)
        window.location.href = href + "?color=" + AVATAR.state.colorA.replace("#","") + "&x=" + x  + "&y=" + y
      }, 1500);
    }
  },
  toggleMenu: function(){
    document.body.classList.toggle("menu-open")
  },
  openInfoDirect: function(target){
    let poi = false
    if(typeof target === "object"){
      poi = target
    }
    else{
      for(let _p in POIS){
        let p = POIS[_p]
        if(p.id == target){
          poi = p
        }
      }
    }
    if(poi){
      G.openInfo(poi,true)
      document.body.classList.remove("menu-open")
      document.body.classList.remove("tutorial-open")
    }
  }
}
//ENV
const INFO_CD = 10 //cooldown in frames before the info popup may be shown again
const UPDATE_UI_AFTER = 10 //mod to update the UI after X frames
const CLICK_TIME = 150 //Ms that have to pass before a touch/click is considered holded
const INFO_AREA = 3 //radius around pillars that lead to the info being open. Radius is in virtual grid coordinates
const FOV_MIN = 8 //minimum FOV with worst framerate and smallest device
const FOV_MAX = 18 //maximum FOV with large device and very good framerate
const FRAMETIME = 0 //stores timestamp of last rendered frame
const FRAMETIME_AVG = 1 //average frametime storage
const FRAMETIME_RECALC = 1000 //amount of ms after which frametime is averaged and FOV is calculated
const FRAME_LOWERGOAL = 10 //if framerate fall below this treshold FOV will be adjusted
const FRAME_UPPERGOAL = 24 //if framerate goes above this treshold FOV will be adjusted
const BOUNDS = 24 //virtual bounds after which the dynamic elements are looped
const SIZE = 40 //virtual size of all elements, no unit
const AVATAR_HOVER = 40 //dynamic range of hover effects for avatars
const DELTA = 14 //virtual maximum height difference or dynamic range of enviroment on the y axis, multiplied by size
const VARIETY = 0.01 //used as a grain multiplier for the noise function that determines the terrain type
const JOIN_SPREAD = 10 //maximum deviance from 0,0 a newly joined avatar can have
const GRAIN = 0.2 //general noise grain for enviroment rendering
const ANIMATION_SPEED = 0.0003 //frame multiplier to set the animation speed of the enviroment
const COLOR_POOL = [ //list of preselected colors the user AVATAR is randomly assigned
      "#87cded","#0165fc","#41fdfe","#1974d2","#24a0ed","#1ac1dd","#c4fff7","#7df9ff","#3f00ff","#00fdff","#1166ff","#15f2fd","#04d9ff","#0203e2","#0044ff","#00bffe","#010fcc","#d0ff14","#8cff9e","#cfff00","#66ff00","#87fd05","#9dff00","#c1f80a","#21fc0d","#08ff08","#00ff00","#aeff6e","#53fe5c","#56fca2","#4efd54","#aaff32","#7af9ab","#a0d404","#00fa9a","#45cea2","#39ff14","#77dd77","#19a700","#68e52f","#7ded17","#00f900","#00ff7c","#06c2ac","#0add08","#2fef10","#fea051","#fe6700","#ff7034","#ffc82a","#ff7124","#eb5030","#ed872d","#fd6f3b","#ffa600","#ee8800","#ff7f50","#ffa812","#fc642d","#ff3503","#ffcf00","#eb6123","#ff8d28","#ffa62b","#f08300","#ffa368","#ff9889","#ff9933","#ff5721","#ffa500","#ff7f00","#ffa000","#ff6f52","#fa5b3d","#fc845d","#ff7518","#fc9e21","#ff6600","#ff9300","#ff7420","#ff5f00","#fe01b1","#ff85ff","#ff7fa7","#d90166","#f4bfff","#ff0490","#fe1493","#fd3f92","#ee6d8a","#ff00cc","#ff028d","#ffb3de","#ff00ff","#ff2feb","#fe4164","#fe019a","#ff66ff","#ff1476","#f62681","#d648d7","#df4ec8","#e25098","#f6688e","#ca2c92","#fe02a2","#ff1cae","#ff6ffc","#ff878d","#f06fff","#fb5ffc","#be03fd","#ad0afd","#6600ff","#bf00ff","#8f00f1","#cb00f5","#b56edc","#bc13fe","#e0b0ff","#65318e","#b80ce3","#9f00ff","#ff000d","#e30022","#f7022a","#f2013f","#ff4040","#e60000","#d01c1f","#fe0002","#ff5555","#eb5406","#fd5956","#f1172f","#cf1020","#bc2731","#fc2847","#ff073a","#ff1b2d","#fe4401","#f43605","#f10c45","#d22d1d","#b0054b","#dd1133","#b00149","#e30b5d","#ff0000","#ee204d","#ff3f34","#fa2a55","#e40078","#fe2713","#f8481c","#fe2c54","#ca0147","#ff2400","#bb1237","#d73c26","#ff1111","#ec2d01","#b21807","#fd0d35","#bf1932","#c6174e","#ef3939","#cc0033","#ff006c","#f70d1a","#e56024","#eddd59","#fffc79","#fffd01","#ffff81","#fff600","#fcfc5d","#fcd116","#ffff31","#fedf08","#ffff33","#fffc00","#ffd700","#fff700","#f1ff62","#f0e681","#cfff04","#d1e231","#ffc324","#fada50","#eed202","#f4c430","#ffd800","#f7b718","#e8ff2a","#ffdc41","#dfff4f","#ffe302","#f7c114","#ffff00","#ffef00","#ffff11","#ffcc3a","#fcfd74","#fff000","#ffff14"]
const STROKE = 2 //strokesize for render
const COLOR = "#ffffff" //color for render
const BACKGROUND = "#000000" //background for render
const ELEVATION = 12
const LARGEST_DIAGONAL = 1500 //value to get highest FOV, in px, avg of width and height of device

//FLAGS
let POINTER_FLAG = false //Used to determine if the user is currently holding the mouse/finger down
let INFO_FLAG = 0 //stores the state of the info popup. 1 = Popup open, 0 = Popup closed, -X = Popup closed, may not open. Will be reset to negative INFO_CD
let USER_HAS_MOVED_AFTER_CLOSE = false //stores wether the user has moved after a popup was closed
let JOINED = false //will be set to true after join and will enable sending of alive messages
//TIMERS
let MOVE_INTERVAL = false //Stores reference to the interval used for user movement
let INFO_INTERVAL = false //Stores reference to the interval that is used to display the info popup conditionally
let UI_UPDATE_CLOCK = 0 //counts up animation frames, used to time UI updates
//RAM
let LAST_POINTER = {x:0,y:0} //Stores the coordinates of the last pointer that was registered
let LAST_POINTER_TIMESTAMP = 0 //Stores the timestamp of the last touch/click
let POINTER_ROTATION = {x:0,y:0,z:0} //Stores the basis for the 3d rotation based on the pointer
let POINTER_ROTATION_DELTA = {x:0,y:0,z:0} //Stores a momentary difference in pointer position relative to POINTER_ROTATION as a base
let FOV = 16 //amount of grid coordinates in view
let DIAGONAL = 1
let POINTS = [] //buffer array to store z values for a frame and position. Accessed as POINTS[X][Y]
// let FILL_POLYGON //reference to filled polygon
// let STROKE_POLYGON //reference to stroked polygon
let POLYGONS = []
let DYNAMIC_SHAPES = {} //stores reference to all shapes that are rendered dynamically. Accessed by key/id
// let DYNAMICS = WORLD //stores reference to group for all dynamic shapes
let UI = {} //stores references to DOM elements for UI purposes. Accessed as keys
let POI_IN_VIEW = {}  //stores list of all POI currently in the view. Accessed by key
let OLD_AVATARS = {} //buffer array to compare newly sent buffers with
let AVATARS = {} //stores local list of all avatars on the server
let POIS = false //stores list of all POISs once
let AVATAR = { //stores all properties and methods directly related to the users avatar
  id: "", //unique id
  x: 0, //x position
  y: 0, //y position
  state: {}, //object based general purpose data storage that is exposed to other users
  speed: 0.5, //speed multiplier
  shape: new Z.Anchor({ //main anchor that all other shapes are added to
    addTo: WORLD,
    translate: {x: 0, y: 0, z: 0}
  }),
  shapes: {}, //stores reference to rendered shapes
  move: function(v){ //moving function, takes a 2d vector object with delta for both axis
    if(INFO_FLAG != 1){ //only allow movement while info popup is closed
      this.x += v.x * this.speed //adds delta multiplied by speed to position
      this.y += v.y * this.speed //adds delta multiplied by speed to position
    }
  }
}

window.addEventListener("load",init)


//FUNCTIONS
function registerEvents(){
  window.addEventListener("mousemove",function(e){
    I.handleRotate(e.clientX,e.clientY)
  })
  window.addEventListener("touchmove", function(e){
    I.handleRotate(e.targetTouches[0].clientX,e.targetTouches[0].clientY)
  })
  window.addEventListener("mousedown",function(e){
    I.pointerDown(e.clientX,e.clientY)
  })
  window.addEventListener("touchstart",function(e){
    I.pointerDown(e.targetTouches[0].clientX,e.targetTouches[0].clientY)
  })
  window.addEventListener("mouseup",I.pointerUp)
  window.addEventListener("touchend",I.pointerUp)
  // window.addEventListener("resize",resize)
}
function conditionalTutorialDisplay(){
  const urlParams = new URLSearchParams(window.location.search) //gets any url parameters
  const flag = urlParams.get("color") && urlParams.get("x") && urlParams.get("y") //if all params are present
  if(!flag){ //when not all parameters are present
    document.body.classList.add("tutorial-open") //show the tutorial
  }
}
function connectUI(){
  UI.x = document.getElementById("avatarX")
  UI.y = document.getElementById("avatarY")
  UI.clock = document.getElementById("timeOnServer")
  UI.people = document.getElementById("peopleOnServer")
  UI.colorA = document.getElementById("avatarFirstColor")
  UI.colorB = document.getElementById("avatarSecondColor")
  UI.container = document.getElementById("info")
  UI.title = document.getElementById("infoTitle")
  UI.artists = document.getElementById("infoArtists")
  UI.date = document.getElementById("infoDate")
  UI.desc = document.getElementById("infoDesc")
  UI.link = document.getElementById("infoOpen")
  // UI.compass = document.getElementById("compass")
}
function setupIntervals(){
  INFO_INTERVAL = setInterval(function () {
    if(INFO_FLAG == 0 && !MOVE_INTERVAL && USER_HAS_MOVED_AFTER_CLOSE){
      let pos = {
        x: Math.round((BOUNDS + (AVATAR.x % BOUNDS)) % BOUNDS),
        y: Math.round((BOUNDS + (AVATAR.y % BOUNDS)) % BOUNDS)
      }
      if(POIS){
        for(let _p in POIS){
          let p = POIS[_p]
          let _x = Math.round((BOUNDS + (p.x % BOUNDS)) % BOUNDS)
          let _y = Math.round((BOUNDS + (p.y % BOUNDS)) % BOUNDS)
          if(pos.x > (_x - INFO_AREA) && pos.x < (_x + INFO_AREA) && pos.y > (_y - INFO_AREA)  && pos.y < (_y + INFO_AREA) ){
            G.openInfo(p)
            return
          }
        }
      }

    }
    else if(INFO_FLAG < 0){
      INFO_FLAG += 1
    }
  }, 250);
}

function join(){
  const urlParams = new URLSearchParams(window.location.search) //gets any url parameters
  let color = urlParams.get('color') ? "#" + urlParams.get('color') : U.randomColor() //either stores the color given by url parameter or generates a random one when none is given
  let position = urlParams.get('x') && urlParams.get('y') ? {x:Number(urlParams.get('x')),y:Number(urlParams.get('y'))} : U.randomJoinPos() //either stores the position given by url parameter or generates a random one when none is given
  AVATAR.x = position.x
  AVATAR.y = position.y
  AVATAR.shapes.ball = {
    group: new Z.Group({addTo:AVATAR.shape,visible:false})
  }
  AVATAR.shapes.anchor = new Z.Anchor({
    addTo: AVATAR.shapes.ball.group
  })
  AVATAR.shapes.shellA = new Z.Hemisphere({
    addTo: AVATAR.shapes.anchor,
    diameter: SIZE,
    stroke: false,
    color: "#ffffff"
  });
  AVATAR.shapes.shellB = new Z.Hemisphere({
    addTo: AVATAR.shapes.anchor,
    diameter: SIZE,
    stroke: false,
    color: "#0000ff",
    rotate: { x: TAU/2 }
  });
  AVATAR.state = {
    colorA: color,
    colorB: U.invertHex(color),
  }
  AVATAR.shapes.shellA.color = AVATAR.state.colorA
  AVATAR.shapes.shellB.color = AVATAR.state.colorB
  UI.colorA.style.background = AVATAR.state.colorA
  UI.colorB.style.background = AVATAR.state.colorB
  AVATAR.id = "" + Math.floor(performance.now()) + Math.floor(Math.random() * 1000000)
  IO.emit('join', {name:AVATAR.name,id:AVATAR.id,state:AVATAR.state,position:position})
  JOINED = true
  conditionalTutorialDisplay()
}
function initPoints(){
  POINTS = []
  for(let y = 0; y < FOV + 1; y ++){ //for the whole grid in view
    let row = [] //create y rows
    for(let x = 0; x < FOV + 1; x ++){
      row.push(0) //push an int for each x
    }
    POINTS.push(row)
  }
}
function initPolygons(){
  POLYGONS = []
  for(let y = 0; y <= FOV; y++){ //for all points in grid
    let row = []
    for(let x = 0; x <= FOV; x++){
      if(x == FOV && y == FOV){ //on the outermost corner
        //no need to add a path, no need to move
      }
      else if(x == FOV || y == FOV){
        row.push([new Z.Shape({addTo: WORLD,path: [{x: 0, y: 0, z: 0}],stroke: 1,color: COLOR})])
      }
      else{
        row.push([
          new Z.Shape({addTo: WORLD,path: [{x: 0, y: 0, z: 0}],stroke: 1,color: COLOR}),
          new Z.Shape({addTo: WORLD,path: [{x: 0, y: 0, z: 0}],stroke: 1,color: COLOR}),
          new Z.Shape({addTo: WORLD,path: [{x: 0, y: 0, z: 0},{x: 1, y: 0, z: 0},{x: 0, y: 1, z: 0},{x: 1, y: 1, z: 0}],stroke: 0,fill: true,color: BACKGROUND})
        ])
      }
    }
    POLYGONS.push(row)
  }
}
// function initPolygons(){
//   let group = new Z.Group({ //added to a unreferened to group to stop z fighting
//     addTo:WORLD,
//     visible:true
//   })
//   FILL_POLYGON = new Z.Shape({
//     addTo: group,
//     path: [],
//     closed: false,
//     stroke: false,
//     fill: true,
//     color: BACKGROUND
//   })
//   STROKE_POLYGON = new Z.Shape({
//     addTo: group,
//     path: [],
//     closed: false,
//     stroke: STROKE,
//     color: COLOR,
//   })
// }
function updatePolygons(){
  let stroke = STROKE / WORLD.zoom
  for(let y = 0; y <= FOV; y++){ //for all points in grid
    for(let x = 0; x <= FOV; x++){
      let X = x + (AVATAR.x % 1) //add the modded avatar position to get smooth scrolling effect
      let Y = y + (AVATAR.y % 1)
      if(x == FOV && y == FOV){ //on the outermost corner
      //           //no need to add a path, no need to move
      }
      else if(x == FOV){ //on the left side add a vertial line but no tile
        POLYGONS[x][y][0].path = [
          { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA },
          { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + (Y+1)*SIZE,z:POINTS[y+1][x] * DELTA }
        ]
        POLYGONS[x][y][0].stroke = stroke
        POLYGONS[x][y][0].updatePath();
      }
      else if(y == FOV){ //on the topside add a horizontal line but no tile
        POLYGONS[x][y][0].path = [
          { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA },
          { x: (-0.5 * SIZE * FOV) + (X+1) * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x+1] * DELTA }
        ]
        POLYGONS[x][y][0].stroke = stroke
        POLYGONS[x][y][0].updatePath();
      }
      else{ //anywhere else add a vertival and a horizontal line and a filled tile
        POLYGONS[x][y][0].path = [
          { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA },
          { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + (Y+1)*SIZE,z:POINTS[y+1][x] * DELTA }
        ]
        POLYGONS[x][y][1].path = [
          { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA },
          { x: (-0.5 * SIZE * FOV) + (X+1) * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x+1] * DELTA }
        ]
        POLYGONS[x][y][2].path = [
          { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA},
          { x: (-0.5 * SIZE * FOV) + (X + 1) * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x + 1] * DELTA},
          { x: (-0.5 * SIZE * FOV) + (X + 1) * SIZE,y:(-0.5 * SIZE * FOV) + (Y + 1) *SIZE,z:POINTS[y + 1][x + 1] * DELTA},
          { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + (Y + 1)*SIZE,z:POINTS[y + 1][x] * DELTA}
        ]
        POLYGONS[x][y][0].stroke = stroke
        POLYGONS[x][y][1].stroke = stroke
        POLYGONS[x][y][0].updatePath()
        POLYGONS[x][y][1].updatePath()
        POLYGONS[x][y][2].updatePath()
      }
    }
  }
  WORLD.updateRenderGraph();
}
// function updatePolygons(){
//   let strokePath = [] //stores the path for the stroke polygon
//   let fillPath = [] //stores the path for the fill polygon
//   let stroke = e => strokePath.push(e) //utility assignemt
//   let fill = e => fillPath.push(e) //utility assignemt
//   for(let y = 0; y <= FOV; y++){ //for all points in grid
//       for(let x = 0; x <= FOV; x++){
//         let X = x + (AVATAR.x % 1)
//         let Y = y + (AVATAR.y % 1)
//         if(x == FOV && y == FOV){ //on the outermost corner
//           //no need to add a path, no need to move
//         }
//         else if(x == FOV){ //on the left side add a vertial line but no tile
//           stroke({move:{ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA }}) //move to start
//           stroke({ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA }) //start
//           stroke({ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + (Y + 1)*SIZE,z:POINTS[y + 1][x] * DELTA }) //end
//         }
//         else if(y == FOV){ //on the topside add a horizontal line but no tile
//           stroke({move:{ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA }}) //move to start
//           stroke({ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA }) //start
//           stroke({ x: (-0.5 * SIZE * FOV) + (X + 1) * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x + 1] * DELTA }) //end
//         }
//         else{ //anywhere else add a vertival and a horizontal line and a filled tile
//           stroke({move:{ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA }})  //move to h start
//           stroke({ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA }) //h start
//           stroke({ x: (-0.5 * SIZE * FOV) + (X + 1) * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x + 1] * DELTA }) //h end
//           stroke({move:{ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA }}) //move to v start
//           stroke({ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA }) //v start
//           stroke({ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + (Y + 1)*SIZE,z:POINTS[y + 1][x] * DELTA }) //v end
//           fill({move:{ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA}})
//           fill({ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x] * DELTA})
//           fill({ x: (-0.5 * SIZE * FOV) + (X + 1) * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS[y][x + 1] * DELTA})
//           fill({ x: (-0.5 * SIZE * FOV) + (X + 1) * SIZE,y:(-0.5 * SIZE * FOV) + (Y + 1) *SIZE,z:POINTS[y + 1][x + 1] * DELTA})
//           fill({ x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + (Y + 1)*SIZE,z:POINTS[y + 1][x] * DELTA})
//         }
//       }
//     }
//     STROKE_POLYGON.stroke = STROKE / WORLD.zoom //sets stroke based on base and zoom
//     STROKE_POLYGON.path = strokePath //sets new path
//     FILL_POLYGON.path = fillPath //sets new path
//     STROKE_POLYGON.updatePath() //updates the path
//     FILL_POLYGON.updatePath() //updates the path
// }
function updatePoiRender(){
  for(let a in POIS){ // for each POIS in the list of POISs
    let vPos = U.getVPos({x:POIS[a].x,y:POIS[a].y},true)
    let relX = vPos.x
    let relY = vPos.y
      let _x = ((-FOV * 0.5 + relX + Math.abs(AVATAR.x % 1)) + (AVATAR.x % 1) - 0.5) * SIZE
      let _y =  ((-FOV * 0.5 + relY + Math.abs(AVATAR.y % 1)) + (AVATAR.y % 1) - 0.5) * SIZE
      // let _z = U.getZAt(relX,relY)
      let _z = 0
      if(relX >= 0 && relX < FOV && relY >= 0 && relY < FOV){ //when the relative position is within the view
        _z = (POINTS[relY][relX] + 1) * DELTA
        if(!DYNAMIC_SHAPES[a]){ //when there is no shape for the AVATAR
            let anchor = new Z.Group({
              translate: {x: _x, y: _y, z: _z},
              addTo:WORLD
            })
            let SHAPES = []
            for(let z = 0; z < 8; z++){
              let block = POIS[a].state.plan[0][z]
              let color = POIS[a].state.plan[1][z]
              let shape = false
              let translate = {
                x: 0,
                y: 0,
                z: z * SIZE,
              }
              switch(block){
                case 1:
                shape = new Z.Box({
                  addTo: anchor,
                  width: SIZE,
                  height: SIZE,
                  depth: SIZE,
                  stroke: false,
                  color: color,
                  translate: translate
                });
                break
                case 2:
                translate.z = translate.z - 0.5 * SIZE
                shape = new Z.Cone({
                  addTo: anchor,
                  diameter: SIZE,
                  length: SIZE,
                  stroke: false,
                  color: color,
                  translate: translate
                });
                break
                case 3:
                translate.z = translate.z - 0.5 * SIZE
                shape = new Z.Cone({
                  addTo: anchor,
                  diameter: SIZE,
                  length: SIZE,
                  stroke: false,
                  color: color,
                  translate: {
                    x: 0,
                    y: 0,
                    z: translate.z + SIZE,
                  },
                  rotate: {x:0,y:TAU/2,z:0}
                });
                break
                case 4:
                shape = new Z.Shape({
                  addTo: anchor,
                  stroke: SIZE,
                  color: color,
                  translate: translate
                });
                break
                case 5:
                shape = new Z.Cylinder({
                  addTo: anchor,
                  diameter: SIZE,
                  length: SIZE,
                  stroke: false,
                  color: color,
                  translate:translate
                });
                break
              }
              if(shape){
                SHAPES.push(shape)
              }
            }
            DYNAMIC_SHAPES[a] = {
              shape: SHAPES,
              // group: group,
              anchor: anchor
            }
            POI_IN_VIEW[POIS[a].id] = POIS[a]
        }
        else{ //when there is a shape
          DYNAMIC_SHAPES[a].anchor.translate = {x: _x, y: _y, z: _z}
        }
      }
      else if(DYNAMIC_SHAPES[a]){ //when it is not but there is still a shape representing it
        delete POI_IN_VIEW[POIS[a].id]
        DYNAMIC_SHAPES[a].anchor.remove()
        delete DYNAMIC_SHAPES[a]
      }
  }
}
function resize(){
  FOV = U.calcFov()
  DIAGONAL = U.calcDiagonal()
  initPoints()
  initPolygons()
}
function init(){
  registerEvents()
  connectUI()
  setupIntervals()
  resize()
  IO.on('poi',function(msg){
    if(!POIS){
      POIS = msg
      const urlParams = new URLSearchParams(window.location.search) //gets any url parameters TODO make this way more elegant
      let poi = urlParams.get('poi') ? urlParams.get('poi') : false
      let found = false
      if(poi){
        for(let p in POIS){
          if(!found && (POIS[p].name == poi || POIS[p].id == poi)){
            poi = POIS[p]
            found = true
          }
        }
      }
      if(!found){
        poi = false
      }
      if(poi){
        AVATAR.x = poi.x
        AVATAR.y = poi.y
        G.openInfoDirect(poi)
      }
    }
  })
  IO.on('update', function(msg) {
    if(JOINED){ //when the user has already joined upon recieval of message
      IO.emit('alive', {id:AVATAR.id,x:AVATAR.x,y:AVATAR.y,state:AVATAR.state}) //emit the keep alive message with needed info
    }
    OLD_AVATARS = AVATARS || msg //copy over current avatars into buffer. If there are none us the new ones
    AVATARS = msg //overwrite avatars with the new ones
    if(AVATARS[AVATAR.id]){ //when the user avatar could be found
      AVATARS[AVATAR.id].x = AVATAR.x //sync with server information
      AVATARS[AVATAR.id].y = AVATAR.y
      AVATAR.shapes.ball.group.visible = true //enables the render of the user avatar
    }
    for(let s in DYNAMIC_SHAPES){ //for all dynamic shapes
      if(!AVATARS[s] && !POIS[s]){ //when there is no avatar or poi connected to the shape
        DYNAMIC_SHAPES[s].group.remove() //remove the shape
        delete DYNAMIC_SHAPES[s]
      }
    }
    for(let a in AVATARS){ // for each AVATAR in the list of AVATARS
      if(a != AVATAR.id){ //when the current AVATAR is not the users AVATAR
        let vPos = U.getVPos({x:AVATARS[a].x,y:AVATARS[a].y})
        let relX = vPos.x
        let relY = vPos.y
        let _x = (-FOV * 0.5 + relX) * SIZE
        let _y =  (-FOV * 0.5 + relY) * SIZE
        let _z = U.getZAt(relX,relY) * DELTA + AVATAR_HOVER + SIZE
        let _az = 4 + U.getZAt(relX,relY) * 0.5 * DELTA + SIZE + AVATAR_HOVER * Math.abs(-1 + ((performance.now() * 0.0005) % 2))
        if(relX >= 0 && relX <= FOV && relY >= 0 && relY <= FOV){ //when the relative position is within the view
          if(!DYNAMIC_SHAPES[a]){ //when there is no shape for the AVATAR
            let group = new Z.Group({
              addTo:WORLD,
              visible:true
            })
            let anchor = new Z.Anchor({
              // translate: AVATARS[a].POIS ? {x: (((FOV * 0.5 + AVATARS[a].x - 0.5 - AVATAR.x) % BOUNDS)) * SIZE , y: (((FOV * 0.5 + AVATARS[a].y - 0.5 - AVATAR.y) % BOUNDS)) * SIZE, z: U.getZAt(relX,relY) * DELTA + AVATAR.d + SIZE} : {x: (((FOV * 0.5 + AVATARS[a].x - AVATAR.x) % BOUNDS) - FOV * 0.5) * SIZE, y: (((FOV * 0.5 + AVATARS[a].y - AVATAR.y) % BOUNDS) - FOV * 0.5) * SIZE, z: 4 + U.getZAt(relX,relY) * 0.5 * DELTA + AVATAR.d + SIZE},
              translate: {x: _x, y: _y, z: 4 + _az},
              addTo: group
            })
              let sphereA = new Z.Hemisphere({
                addTo: anchor,
                diameter: SIZE,
                stroke: false,
                color: AVATARS[a].state.colorA
              });
              let sphereB = new Z.Hemisphere({
                addTo: anchor,
                diameter: SIZE,
                stroke: false,
                color: AVATARS[a].state.colorB,
                rotate: { x: TAU/2 }
              });
              DYNAMIC_SHAPES[a] = {
                group: group,
                anchor: anchor,
                sphereA: sphereA,
                sphereB: sphereB
              }
          }
          else{ //when there is a shape
            let z = _az
            DYNAMIC_SHAPES[a].anchor.translate = {x: _x, y: _y, z: z}
            rotation = TAU * performance.now() * 0.0001
            DYNAMIC_SHAPES[a].anchor.rotate = { x: rotation, y: rotation,z:rotation}
          }
        }
        else if(DYNAMIC_SHAPES[a]){ //when it is not but there is still a shape representing it
          DYNAMIC_SHAPES[a].group.remove()
          delete DYNAMIC_SHAPES[a]
        }
      }
    }
  })
  join()
  update()
  document.body.classList.add("curtain-open")
}


function update(){
  updatePoiRender()
  UI_UPDATE_CLOCK++
  if((UI_UPDATE_CLOCK % UPDATE_UI_AFTER) == 0){
    let time = Math.floor(performance.now() / 1000)
    UI.x.innerText = Math.round(AVATAR.x % BOUNDS)
    UI.y.innerText = Math.round(AVATAR.y % BOUNDS)
    UI.clock.innerText = ("" + Math.floor(time / 60 / 60)).padStart(2, '0') + ":" + ("" + (Math.floor(time / 60) % 60)).padStart(2, '0') + ":" + ("" + (time % 60)).padStart(2, '0')
    UI.people.innerText = Object.keys(AVATARS).length
    let POISList = document.getElementById("outputPOI")
    POISList.innerHTML = ""
    for(let POIS in POI_IN_VIEW){
      let tr = document.createElement("tr")
      let th = document.createElement("th")
      let td = document.createElement("td")
      let a = document.createElement("a")
      a.addEventListener("mousedown",e => {G.openInfoDirect(POI_IN_VIEW[POIS])})
      a.innerText = POI_IN_VIEW[POIS].name
      for(let c in POI_IN_VIEW[POIS].state.plan[1]){
        let span = document.createElement("span")
        span.classList.add("color")
        span.style.background = POI_IN_VIEW[POIS].state.plan[1][c]
        td.appendChild(span)
      }
      tr.appendChild(td)
      th.appendChild(a)
      tr.appendChild(th)
      POISList.appendChild(tr)
    }
  }
  if(AVATARS[AVATAR.id]){
    AVATAR.state = AVATARS[AVATAR.id].state
  }
  AVATAR.shape.translate = {z: 4 + U.getZAt(FOV * 0.5,FOV * 0.5) * 0.5 * DELTA + SIZE + AVATAR_HOVER * Math.abs(-1 + ((performance.now() * 0.0005) % 2))}
  AVATAR.shape.rotate = { x: TAU * performance.now() * 0.0001, y: TAU * performance.now() * 0.0001,z: TAU * performance.now() * 0.0001 }
  for(let y = 0; y < FOV + 1; y++){ //updates the z values for the whole grid in the POINTS buffer
    for(let x = 0; x < FOV + 1; x++){
      POINTS[y][x] = U.getZAt(x,y,true)
    }
  }
  updatePolygons()
  WORLD.updateRenderGraph()
  requestAnimationFrame(update)
}
