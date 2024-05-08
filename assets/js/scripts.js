//PARAMS
var T = 0 //Starttimestamp in ms since 1970
var X = 0 //Avatar X Position in grid coord
var Y = 0 //Avatar Y Position in grid coord
var _X = 0
var _Y = 0
var Z = 0
var A = 0 //View Angle, relative 0-1
var R = 0 //Rotation Angle, relative 0-1
var C = "#ffffff"
//FLAGS
var POINTER_FLAG = false //Used to determine if the user is currently holding the mouse/finger down
var INFO_FLAG = 0 //stores the state of the info popup. 1 = Popup open, 0 = Popup closed, -X = Popup closed, may not open. Will be reset to negative INFO_CD
var USER_HAS_MOVED_AFTER_CLOSE = false //stores wether the user has moved after a popup was closed
//TIMERS
var MOVE_INTERVAL = false //Stores reference to the interval used for user movement
var INFO_INTERVAL = false //Stores reference to the interval that is used to display the info popup conditionally
var UI_UPDATE_CLOCK = 0
//RAM
var LAST_POINTER = {x:0,y:0} //Stores the coordinates of the last pointer that was registered
var LAST_POINTER_TIMESTAMP = 0 //Stores the timestamp of the last touch/click
var POINTER_ROTATION = {x:0,y:0,z:0} //Stores the basis for the 3d rotation based on the pointer
var POINTER_ROTATION_DELTA = {x:0,y:0,z:0} //Stores a momentary difference in pointer position relative to POINTER_ROTATION as a base
//ENV
const FPS = 12 //target framerate
const UNIT = 60 //virtual grid units to onscreen units
const FOV = 12 //size of the displayed grid
const SPEED = 0.9 //moving speed in grid units per second
var LIMES = 0 //virtual border for repeating objects, set dynamically
const SPACING = Math.floor(FOV * 0.8) //average spacing between pillars
const SEED = 42069
const UPDATE_UI_AFTER = 10
const INFO_CD = 10
const JOIN_SPREAD = FOV
const INFO_AREA = 3
const COLOR_POOL = [ //list of preselected colors the user AVATAR is randomly assigned
      "#87cded","#0165fc","#41fdfe","#1974d2","#24a0ed","#1ac1dd","#c4fff7","#7df9ff","#3f00ff","#00fdff","#1166ff","#15f2fd","#04d9ff","#0203e2","#0044ff","#00bffe","#010fcc","#d0ff14","#8cff9e","#cfff00","#66ff00","#87fd05","#9dff00","#c1f80a","#21fc0d","#08ff08","#00ff00","#aeff6e","#53fe5c","#56fca2","#4efd54","#aaff32","#7af9ab","#a0d404","#00fa9a","#45cea2","#39ff14","#77dd77","#19a700","#68e52f","#7ded17","#00f900","#00ff7c","#06c2ac","#0add08","#2fef10","#fea051","#fe6700","#ff7034","#ffc82a","#ff7124","#eb5030","#ed872d","#fd6f3b","#ffa600","#ee8800","#ff7f50","#ffa812","#fc642d","#ff3503","#ffcf00","#eb6123","#ff8d28","#ffa62b","#f08300","#ffa368","#ff9889","#ff9933","#ff5721","#ffa500","#ff7f00","#ffa000","#ff6f52","#fa5b3d","#fc845d","#ff7518","#fc9e21","#ff6600","#ff9300","#ff7420","#ff5f00","#fe01b1","#ff85ff","#ff7fa7","#d90166","#f4bfff","#ff0490","#fe1493","#fd3f92","#ee6d8a","#ff00cc","#ff028d","#ffb3de","#ff00ff","#ff2feb","#fe4164","#fe019a","#ff66ff","#ff1476","#f62681","#d648d7","#df4ec8","#e25098","#f6688e","#ca2c92","#fe02a2","#ff1cae","#ff6ffc","#ff878d","#f06fff","#fb5ffc","#be03fd","#ad0afd","#6600ff","#bf00ff","#8f00f1","#cb00f5","#b56edc","#bc13fe","#e0b0ff","#65318e","#b80ce3","#9f00ff","#ff000d","#e30022","#f7022a","#f2013f","#ff4040","#e60000","#d01c1f","#fe0002","#ff5555","#eb5406","#fd5956","#f1172f","#cf1020","#bc2731","#fc2847","#ff073a","#ff1b2d","#fe4401","#f43605","#f10c45","#d22d1d","#b0054b","#dd1133","#b00149","#e30b5d","#ff0000","#ee204d","#ff3f34","#fa2a55","#e40078","#fe2713","#f8481c","#fe2c54","#ca0147","#ff2400","#bb1237","#d73c26","#ff1111","#ec2d01","#b21807","#fd0d35","#bf1932","#c6174e","#ef3939","#cc0033","#ff006c","#f70d1a","#e56024","#eddd59","#fffc79","#fffd01","#ffff81","#fff600","#fcfc5d","#fcd116","#ffff31","#fedf08","#ffff33","#fffc00","#ffd700","#fff700","#f1ff62","#f0e681","#cfff04","#d1e231","#ffc324","#fada50","#eed202","#f4c430","#ffd800","#f7b718","#e8ff2a","#ffdc41","#dfff4f","#ffe302","#f7c114","#ffff00","#ffef00","#ffff11","#ffcc3a","#fcfd74","#fff000","#ffff14"]
//OBJECTS
const PLAYER = {
  colors: [],
  shapes: [[0.11,0.22,0.33,0.44,0.55,0.66,0.77,0.88,0.99],[0.99,0.88,0.77,0.66,0.55,0.44,0.33,0.22,0.11]]
}
var PILLARS = []
var POI_IN_VIEW = []

//GLOBALS
const G = {
  openInfo: function(poi,force){
    if(!INFO_FLAG || force){
      USER_HAS_MOVED_AFTER_CLOSE = false
      INFO_FLAG = 1
      UI.title.innerText = poi.name
      if(poi.artists){
        UI.artists.innerText = poi.artists
        UI.artists.style.display = "block"
      }
      else{
        UI.artists.style.display = "none"
      }
      if(poi.date){
        UI.date.innerText = poi.date
        UI.date.style.display = "block"
      }
      else{
        UI.date.style.display = "none"
      }
      UI.desc.innerHTML = poi.description
      if(poi.link){
        UI.link.setAttribute("data-href",poi.link)
        if(poi.noconnect){
          UI.link.setAttribute("data-noconnect",true)
        }
        else{
          UI.link.setAttribute("data-noconnect",false)
        }
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
      if(poi.linktitle){
        UI.link.innerText = poi.linktitle
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
    let noconnect = link.getAttribute("data-noconnect") == "true"
    if(target == "external"){
      window.open(href, '_blank')
    }
    else if(target == "exhibit"){
      document.body.classList.remove("curtain-open")
      setTimeout(function () {
        let x = Math.round((LIMES + (_X % LIMES)) % LIMES)
        let y = Math.round((LIMES + (_Y % LIMES)) % LIMES)
        window.location.href = noconnect ? href : href + "?color=" + COLOR.replace("#","") + "&x=" + x  + "&y=" + y
      }, 1500);
    }
  },
  toggleMenu: function(){
    document.body.classList.toggle("menu-open")
  },
  openInfoDirect: function(target,forcePoi){
    if(forcePoi){
      G.openInfo(forcePoi,true)
      document.body.classList.remove("menu-open")
      document.body.classList.remove("tutorial-open")
    }
    else{
      let poi = false
      if(typeof target === "object"){
        poi = target
      }
      else{
        for(let _p in PILLARS){
          let p = PILLARS[_p]
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
}
//UI
const UI = {
  connect: function(){
    this.x = document.getElementById("avatarX")
    this.y = document.getElementById("avatarY")
    this.colorA = document.getElementById("avatarFirstColor")
    this.colorB = document.getElementById("avatarSecondColor")
    this.container = document.getElementById("info")
    this.title = document.getElementById("infoTitle")
    this.artists = document.getElementById("infoArtists")
    this.date = document.getElementById("infoDate")
    this.desc = document.getElementById("infoDesc")
    this.link = document.getElementById("infoOpen")
    this.pois = document.getElementById("outputPOI")
  },
  events: function(){
    document.getElementById("aboutLink").addEventListener("click",() => G.openInfoDirect('about'))
    document.getElementById("fundersLink").addEventListener("click",() => G.openInfoDirect('funders'))
    document.getElementById("programLink").addEventListener("click",() => G.openInfoDirect('program',))
    document.getElementById("archiveLink").addEventListener("click",() => G.openInfoDirect('archive',))
    document.getElementById("logos").addEventListener("click",() => G.openInfoDirect('funders'))
    document.getElementById("menubutton").addEventListener("click",() => G.toggleMenu())
    document.getElementById("infoOpen").addEventListener("click",() => G.openLink())
    document.getElementById("infoExit").addEventListener("click",() => G.closeInfo())
  },
  init: function(){
    this.connect()
    this.events()
  },
  update: function(){
    let time = Math.floor(performance.now() / 1000) //gets the time since join
    this.x.innerText = Math.round((LIMES + (_X % LIMES)) % LIMES) //updates x position
    this.y.innerText = Math.round((LIMES + (_Y % LIMES)) % LIMES) //updates y position
    this.pois.innerHTML = "" //resets the poilist
    for(let POIS in POI_IN_VIEW){ //for every POI in view
      let tr = document.createElement("tr") //creates a tr wrapper
      let th = document.createElement("th") //creates a th for title
      let td = document.createElement("td") //creates a td for colorcode
      let a = document.createElement("a") //creates a link
      a.addEventListener("mousedown",e => {G.openInfoDirect(POI_IN_VIEW[POIS])}) //attaches event handler to wrapper
      let name = POI_IN_VIEW[POIS].name
      a.innerText = name.substring(0,20) + (name.length > 20 ? "..." : "")//sets linktitle to poi title
      for(let c in POI_IN_VIEW[POIS].pillar.colors){ //iterates over all colors in plan
        let span = document.createElement("span") //creates a span to hold show the color value
        span.classList.add("color") //adds class to span for css
        span.style.background = M.rgbToHex(POI_IN_VIEW[POIS].pillar.colors[c]) //sets background inline
        td.appendChild(span) //appends to data
      }
      tr.appendChild(td) //appends data before th to row so its is displayed on the left
      th.appendChild(a) //appends link to th
      tr.appendChild(th) //appends th
      this.pois.appendChild(tr) //appends row to list
    }
  }
}
//INPUTS
const I = {
  init: function(){
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
  },
  pointerDown: function(x,y){
    document.body.classList.remove("tutorial-open")
    LAST_POINTER_TIMESTAMP = performance.now()
    if(!POINTER_FLAG && INFO_FLAG != 1){
      LAST_POINTER = {x:x,y:y}
      POINTER_FLAG = true
      if(!MOVE_INTERVAL){
        MOVE_INTERVAL = true
        USER_HAS_MOVED_AFTER_CLOSE = true
      }
    }
  },
  pointerUp: function(){
    if(POINTER_FLAG){
      POINTER_ROTATION.z += POINTER_ROTATION_DELTA.z
      POINTER_ROTATION.x += POINTER_ROTATION_DELTA.x
      POINTER_ROTATION_DELTA = {x:0,y:0,z:0}
      POINTER_FLAG = false
      MOVE_INTERVAL = false
    }
  },
  handleRotate: function (x,y){
    if(INFO_FLAG != 1){
      if(POINTER_FLAG){
        let dX =  (LAST_POINTER.x - x) / window.innerWidth
        let dY =  (LAST_POINTER.y - y) / window.innerHeight
        POINTER_ROTATION_DELTA.z = dX
        POINTER_ROTATION_DELTA.x = (-0.5 < (POINTER_ROTATION.x + dY) && (POINTER_ROTATION.x + dY) < 0.5) ? dY : (POINTER_ROTATION.x + dY) > 0.5 ? 0.5 - POINTER_ROTATION.x : -0.5 - POINTER_ROTATION.x
      }
    }
  }
}
//PROJECTIONMATRIX
const M = {
  hexToRgb: function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16)] : [0,0,0]
  },
  rgbToHex: function(rgb) {
    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
  },
  invertHex: function(hex){ //inverts given hex color
    hex = hex.replace("#","")
    return "#" + (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
  },
  randomColor: function(){ //returns a random color from color pool
      return COLOR_POOL[Math.floor(COLOR_POOL.length * Math.random())]
  },
  shapes: {
    ball: [
      0.5848248826150173,
      0.8017403630144483,
      0.9306048591020996,
      0.9923748047044564,
      0.9923748047044564,
      0.9306048591020997,
      0.8017403630144484,
      0.5848248826150174
    ],
    cube: [ 1, 1],
    space: [ 0, 0],
    drum: [ 0.66, 0.66],
    cone: [
      0.1111111111111111,
      0.2222222222222222,
      0.3333333333333333,
      0.4444444444444444,
      0.5555555555555556,
      0.6666666666666666,
      0.7777777777777778,
      0.8888888888888888
    ],
    funnel: [
      0.8888888888888888,
      0.7777777777777778,
      0.6666666666666667,
      0.5555555555555556,
      0.4444444444444444,
      0.33333333333333337,
      0.2222222222222222,
      0.11111111111111116
    ]
  },
  shapeFromIndex: function(i){
    switch(i){
      case 1:
        return this.shapes.cube
      case 2:
        return this.shapes.cone
      case 3:
        return this.shapes.funnel
      case 4:
        return this.shapes.ball
      case 5:
        return this.shapes.drum
      default:
        return this.shapes.space

    }
  },
  radToDeg: function(r) {
    return r * 180 / Math.PI;
  },
  degToRad: function(d) {
    return d * Math.PI / 180;
  },
  projection: function(width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
       2 / width, 0, 0, 0,
       0, -2 / height, 0, 0,
       0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function(tx, ty, tz) {
    return [
       1,  0,  0,  0,
       0,  1,  0,  0,
       0,  0,  1,  0,
       tx, ty, tz, 1,
    ];
  },

  xRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
       c, s, 0, 0,
      -s, c, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1,
    ];
  },

  scaling: function(sx, sy, sz) {
    return [
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1,
    ];
  },

  translate: function(m, tx, ty, tz) {
    return M.multiply(m, M.translation(tx, ty, tz));
  },

  xRotate: function(m, angleInRadians) {
    return M.multiply(m, M.xRotation(angleInRadians));
  },

  yRotate: function(m, angleInRadians) {
    return M.multiply(m, M.yRotation(angleInRadians));
  },

  zRotate: function(m, angleInRadians) {
    return M.multiply(m, M.zRotation(angleInRadians));
  },
  vRotate: function(v, angleInDegrees){
    let ang = -angleInDegrees * (Math.PI/180);
    let cos = Math.cos(ang);
    let sin = Math.sin(ang);
    return new Array(Math.round(10000*(v[0] * cos - v[1] * sin))/10000, Math.round(10000*(v[0] * sin + v[1] * cos))/10000);
  },
  scale: function(m, sx, sy, sz) {
    return M.multiply(m, M.scaling(sx, sy, sz));
  },

};



//MAIN
function main() {
  noise.seed(0)
  I.init()
  UI.init()
  T = Date.now()
  initPillars()
  const urlParams = new URLSearchParams(window.location.search) //gets any url parameters
  let color = urlParams.get('color') ? "#" + urlParams.get('color') : M.randomColor() //either stores the color given by url parameter or generates a random one when none is given
  let position = urlParams.get('x') && urlParams.get('y') ? {x:Number(urlParams.get('x')),y:Number(urlParams.get('y'))} : {x:noise.simplex2(performance.now(),10000)*JOIN_SPREAD,y:noise.simplex2(10000,performance.now())*JOIN_SPREAD} //either stores the position given by url parameter or generates a random one when none is given
  const flag = urlParams.get("color") && urlParams.get("x") && urlParams.get("y") //if all params are present
  let anchor = window.location.href.split('#').pop()
  let poi = urlParams.get('poi') ? urlParams.get('poi').toLowerCase() : anchor ? anchor.toLowerCase() : false //gets poi param or false
  let found = false //search result flag
  if(poi){ //when a param was present
  for(let _p in PILLARS){ //for every poi
    let p = PILLARS[_p]
      if(!found && (p.name.toLowerCase() == poi || p.id.toLowerCase() == poi)){ //if none was found yet and the poi matches with id or name
        poi = p //stores reference
        found = true //sets flag
      }
    }
  }
  if(!found){ //when none was found
    poi = false //reset poi to false, param was present but no poi could be identified
  }
  if(!flag){ //when not all parameters are present
    document.body.classList.add("tutorial-open") //show the tutorial
  }
  if(poi){ //when a poi was found
    X = poi.x - FOV * 0.5 + 2//set avatar pos
    Y = poi.y - FOV * 0.5
    G.openInfoDirect(poi) //open the pois info
  }
  else{
    X = position.x
    Y = position.y
  }

  _X = Math.floor(X)
  _Y = Math.floor(Y)
  let cA = color
  let cB = M.invertHex(color)
  UI.colorA.style.background = cA
  UI.colorB.style.background = cB
  PLAYER.colors = [M.hexToRgb(cA),M.hexToRgb(cB)]

  var canvas = document.querySelector("#canvas")
  var gl = canvas.getContext("webgl")
  if (!gl) {
    return
  }
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"])
  var positionLocation = gl.getAttribLocation(program, "a_position")
  var colorLocation = gl.getAttribLocation(program, "a_color")
  var matrixLocation = gl.getUniformLocation(program, "u_matrix")
  document.body.classList.add("curtain-open")
  initInfoInterval()
  render() //first rendercall
  function initPillars(){
    PILLARS = mapPillarArray(displacePillarsAndSetLimes(parseContentToPillars(),SPACING))
  }
  function parseContentToPillars(){
    let content = document.getElementById("content")
    let pillars = [].slice.call(content.getElementsByClassName("pillar"))
    let r = []
    for(let _p in pillars){
      let p = pillars[_p]
      let title = [].slice.call(p.getElementsByClassName("pillar_title"))[0].innerText
      let id = p.getAttribute("data-id")
      let pillar = p.getAttribute("data-pillar") ? JSON.parse(p.getAttribute("data-pillar")) : false
      let dateNode = [].slice.call(p.getElementsByClassName("pillar_date"))[0] //optional
      let date = dateNode ? dateNode.innerText : false
      let artistsNode = [].slice.call(p.getElementsByClassName("pillar_artists"))[0] //optional
      let artists = artistsNode ? artistsNode.innerText : false
      let description = [].slice.call(p.getElementsByClassName("pillar_description"))[0].innerText
      let linkNode = [].slice.call(p.getElementsByClassName("pillar_link"))[0] //optional
      let linktarget = linkNode ? linkNode.getAttribute("href") : false
      let linktitle = linkNode ? linkNode.innerText : false
      let exhibit = p.getAttribute("data-poi") == null
      let poi = p.getAttribute("data-type") != "illusions"
      r.push({
        name: title,
        id: id,
        artists: artists,
        date: date,
        description: description,
        link: linktarget,
        linktitle: linktitle,
        exhibit: exhibit,
        pillar: pillar,
        poi: poi
      })
    }
    return r
  }
  function mapPillarArray(array){
    let obj = {}
    for(let i in array){
      let index = array[i]
      for(let s in index.pillar.shapes){
        let shape = index.pillar.shapes[s]
        index.pillar.shapes[s] = M.shapeFromIndex(shape)
      }
      for(let c in index.pillar.colors){
        let color = index.pillar.colors[c]
        if(typeof color != "object"){
          index.pillar.colors[c] = M.hexToRgb(color)
        }
      }
      let key = index.poi ? index.x + ";" + index.y : index.id
      obj[key] = index
    }
    return obj
  }
  function displacePillarsAndSetLimes(array,spacing){
    let l = Math.ceil(Math.sqrt(array.length))
    let d = 0.5
    for(let y = 0; y < l; y++){
      for(let x = 0; x < l; x++){
        let p = y * l + x
        if(array[p]){
          let _x = Math.abs(Math.round(x * SPACING + noise.simplex3(p/array.length,2,SEED) * SPACING * d))
          let _y = Math.abs(Math.round(y * SPACING + noise.simplex3(2,p/array.length,SEED) * SPACING * d))
          array[p].x = _x
          array[p].y = _y
        }
      }
    }
    LIMES = (l-1) * SPACING + Math.ceil(SPACING * d)
    console.log(LIMES);
    return array
  }

  // Draw the scene.
  function render() {
    R =  (0.55 + (1 - ((1 - ((POINTER_ROTATION.z+POINTER_ROTATION_DELTA.z) % 1)) % 1))) % 1
    A = POINTER_ROTATION.x+POINTER_ROTATION_DELTA.x
    if(MOVE_INTERVAL){
      let v = M.vRotate([0,-1],180 + R*360)
      X += v[0] * SPEED
      Y += v[1] * SPEED
      _X = Math.floor(X)
      _Y = Math.floor(Y)
      Z += SPEED * (v[0] + v[1])
    }
    let t = Date.now() - T //calcs timestamp since start
    rotation = [M.degToRad(125-25*A), M.degToRad(0), M.degToRad(R*360)]
    translation = [window.innerWidth*0.5, window.innerHeight*0.7, 1]
    let s = window.innerWidth / 1920 * Math.max(1,window.innerHeight / window.innerWidth * 2) * (0.8 + 0.2 * A)
    var scale = [s,s,s] //3d scale
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    let objects = generateGeometryAndReturnObjects(gl)
    let obj = objects.obj
    POI_IN_VIEW = obj
    let objectColors = objects.objectColors
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    setColors(gl,objectColors);
    var desiredCSSWidth = 400;
    var devicePixelRatio = window.devicePixelRatio || 1;
    webglUtils.resizeCanvasToDisplaySize(gl.canvas,devicePixelRatio);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var size = 3;                 // 3 components per iteration
    var type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
    var normalize = true;         // normalize the data (convert from 0-200 to 0-1)
    var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;               // start at the beginning of the buffer
    gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);
    var matrix = M.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, Math.max(gl.canvas.clientHeight,gl.canvas.clientWidth));
    matrix = M.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = M.xRotate(matrix, rotation[0]);
    matrix = M.yRotate(matrix, rotation[1]);
    matrix = M.zRotate(matrix, rotation[2]);
    matrix = M.scale(matrix, scale[0], scale[1], scale[2]);
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = FOV * FOV * 6 * 2 + objects.polygonCount * 6;
    gl.drawArrays(primitiveType, offset, count)
    UI_UPDATE_CLOCK++ //ups the UI update clock
    if(UI_UPDATE_CLOCK == UPDATE_UI_AFTER ){ //when the clock is to be reset
      UI_UPDATE_CLOCK = 0 //resets the clock
      UI.update() //calls update on the UI
    }
    let rendertime = Date.now() - T - t //the time it took for the whole rendercall to run through
    setTimeout(render, 1000 / FPS - rendertime) //call render recursive with target fps for timeout
  }
  function generateGeometryAndReturnObjects(gl) {
    let faces = []
    let lines = []
    let objects = []
    let objectColors = []
    let lineWidth = 0.05
    let iY = ((0.25 + R) % 1) < 0.5  //when rotation between 45 and 225 invert y
    let iX = ((0.5 + R) % 1) > 0.5  //when rotation between 135 and 315 invert x
    let fX = iX ? FOV-1 : 0 //floorvalue for x
    let fY = iY ? FOV-1 : 0 //floorvalue for y
    let x = fX //real value for x
    let y = fY //floor and real value for y
    let cX = iX ? -1 : FOV //ceiling value for x
    let cY = iY ? -1 : FOV//ceiling value for y
    let pX = Math.floor(FOV * 0.5) //player x pos
    let pY = Math.floor(FOV * 0.5) //player y pos
    let dX = iX ? -1 : 1//delta for x
    let dY = iY ? -1 : 1 //delta for y
    let obj = {}
    let objPolygons = 0

    let __X = (LIMES - (_X % LIMES)) % LIMES
    let __Y = (LIMES - (_Y % LIMES)) % LIMES
    while(y != cY){  //will detect all objects in view
      x = fX
      while(x != cX){
        let _x = (x + LIMES - __X) % LIMES
        let _y = (y + LIMES - __Y) % LIMES
        let key = _x + ";" + _y
        if(PILLARS[key] != undefined){
          obj[x + ";" + y] = PILLARS[key]
        }
        x += dX
      }
      y += dY
    }
    y = fY
    while(y != cY){
      x = fX
      while(x != cX){
        let _x = x //we store backups of virutal coordinate for Z value generation and object detection
        let _y = y
        x -= X % 1 //real position coordinates take remainder of player movememnt into account
        y -= Y % 1
        if(obj[_x + ";" + _y]){
          let z = getLowestZ(_X+_x,_Y+_y) + 0.2
          let object = obj[_x + ";" + _y]
          renderObjectShapes(x,y,z,object.pillar)
        }
        if(_x == pX && _y == pY){
          let z = Z(_x-0.5,_y-0.5) + 1.5 + Math.sin(performance.now() * 0.0005) * 0.5
          let object = PLAYER
          renderObjectShapes(x-0.5,y-0.5,z,object)
        }
        faces = faces.concat([
          -FOV*0.5*UNIT+x*UNIT+lineWidth*UNIT, -FOV*0.5*UNIT+y*UNIT+lineWidth*UNIT, Z(_x+_X,_y+_Y)*UNIT, //topleft
          -FOV*0.5*UNIT+x*UNIT+lineWidth*UNIT, -FOV*0.5*UNIT+(y+1)*UNIT-lineWidth*UNIT, Z(_x+_X,_y+1+_Y)*UNIT, //bottomleft
          -FOV*0.5*UNIT+(x+1)*UNIT-lineWidth*UNIT, -FOV*0.5*UNIT+y*UNIT+lineWidth*UNIT, Z(_x+1+_X,_y+_Y)*UNIT, //topright
          -FOV*0.5*UNIT+x*UNIT+lineWidth*UNIT, -FOV*0.5*UNIT+(y+1)*UNIT-lineWidth*UNIT, Z(_x+_X,_y+1+_Y)*UNIT, //bottomleft
          -FOV*0.5*UNIT+(x+1)*UNIT-lineWidth*UNIT, -FOV*0.5*UNIT+(y+1)*UNIT-lineWidth*UNIT, Z(_x+1+_X,_y+1+_Y)*UNIT, //bottomright
          -FOV*0.5*UNIT+(x+1)*UNIT-lineWidth*UNIT, -FOV*0.5*UNIT+y*UNIT+lineWidth*UNIT, Z(_x+1+_X,_y+_Y)*UNIT, //topright
        ])
        lines = lines.concat([
          -FOV*0.5*UNIT+x*UNIT, -FOV*0.5*UNIT+y*UNIT, Z(_x+_X,_y+_Y)*UNIT,
          -FOV*0.5*UNIT+x*UNIT, -FOV*0.5*UNIT+(y+1)*UNIT, Z(_x+_X,_y+1+_Y)*UNIT,
          -FOV*0.5*UNIT+(x+1)*UNIT, -FOV*0.5*UNIT+y*UNIT, Z(_x+1+_X,_y+_Y)*UNIT,
          -FOV*0.5*UNIT+x*UNIT, -FOV*0.5*UNIT+(y+1)*UNIT, Z(_x+_X,_y+1+_Y)*UNIT,
          -FOV*0.5*UNIT+(x+1)*UNIT, -FOV*0.5*UNIT+(y+1)*UNIT, Z(_x+1+_X,_y+1+_Y)*UNIT,
          -FOV*0.5*UNIT+(x+1)*UNIT, -FOV*0.5*UNIT+y*UNIT, Z(_x+1+_X,_y+_Y)*UNIT,
        ])
        x = _x //reset looping coordinates back to stored values
        y = _y
        x += dX
      }
      y += dY
    }
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(lines.concat(faces).concat(objects)),gl.STATIC_DRAW)
    function Z(x,y){ //will return elevation z for point x,y
      let s = 0.00005
      let g = 0.2
      let d = 0.01
      let e = Math.round( ((1 + noise.simplex2(10000+x*d,10000+y*d)) * 0.5) * 9)
      switch(e){
        case 0: //water
          return (1 + Math.sin(y + performance.now() * s)) * 0.5
        case 1: //moving planes
          return (1 + noise.simplex3(x*g,y*g,performance.now() * s)) * 0.5
        case 2: //wide plane
          return (1 + noise.simplex2(x*g,y*g) * 0.5)
        case 3: //moving plane
          return (1 + noise.simplex3(x*g*0.1,y*g*0.1,performance.now() * s*0.5)) * 0.5
        case 4: //plane
          return 0
        case 5: //craters
         return noise.simplex2(x*g,y*g) > 0.5 ? 0 : 1
        case 6:  //geometry hills
          return noise.simplex2((x*g*0.2)%2,(y*g*0.2)%2) < 0 ? 0 : 1
        case 7: //hills
          return Math.round(Math.pow((1 + noise.simplex2(x*g,y*g) * 0.5),3) * 3) * 0.333 * 0.5
        case 8: //mountains
          return  Math.pow((1 + noise.simplex2(x*g,y*g) * 0.5),3)
        case 9: //moving mountains
          return Math.pow((1 + noise.simplex3(x*g,y*g,performance.now() * s) * 0.5),3)
      }
    }
    function getLowestZ(x,y){
      return Math.max(Z(x,y),Z(x+1,y),Z(x,y+1),Z(x+1,y+1))
    }
    function mixPillarColor(progress,colors){
      if(colors.length == 1){
        return colors[0]
      }
      else{
        let _p = Math.floor((colors.length-1) * progress)
        let fC = colors[_p]
        let cC = colors[_p +1]
        let rP = progress * (colors.length-1) % 1
        let c = [fC[0]*(1-rP)+cC[0]*rP,fC[1]*(1-rP)+cC[1]*rP,fC[2]*(1-rP)+cC[2]*rP]
        return c
      }
    }
    function renderObjectShapes(x,y,z,object){
      for(let s = 0; s < object.shapes.length;s++){
        let c =  Math.floor(object.colors.length / object.shapes.length)
        let _x = 0
        let _y = 0
        let _z = 0
        let o = {
          shapes: object.shapes[s],
          colors:[object.colors[s*c],object.colors[s*c+c-1]]
        }
        if(object.animations){
          if(object.animations[""+s]){
            let a = object.animations[""+s]
            let sp = a.speed || 1
            let aP = (performance.now() * 0.0001 / sp) % 1
            let rP = (aP * (a.keys.length-1)) % 1

            let k = Math.floor(aP * (a.keys.length-1))
            let fK = a.keys[k]
            let cK = a.keys[k+1]
            _x = fK.x * (1-rP) + cK.x * rP
            _y = fK.y * (1-rP) + cK.y * rP
            _z = fK.z * (1-rP) + cK.z * rP
          }
        }
        renderObject(o,x+_x,y+_y,z+s+_z,[1,1])
      }
    }
    function renderObject(value,x,y,z,scale,flat){
      const h = scale[1]
      let stepheight = 1 / value.shapes.length
      for(let s = 0; s < value.shapes.length; s++){
        let step = value.shapes[s]
        let stepD = (1-step) * 0.5 * scale[1]
        if(step != 0){
          let fH = s * stepheight * h
          let cH = (s+1) * stepheight * h
          if(flat){
            let color = value.colors[0]
            objects = objects.concat([
              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side1 topright-topleft
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT,
              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT,

              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side2 topleft-bottomleft
              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT, //side3 bottomleft-bottomright
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side4 bottomright-topright
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topleft //top
              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomleft
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topright
              -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomleft
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomright
              -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topright
            ])
            objectColors.push(

              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],

              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],

              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],

              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],

              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
              color[0],color[1],color[2],
            )
          }
          else{
            let fColor = mixPillarColor(s / (value.shapes.length+1), value.colors)
            let cColor = mixPillarColor((s+1) / (value.shapes.length+1), value.colors)
            if(!iX && !iY){ // !iX && !iY: 4,1,2,3; iY && !iX: 1,2,3,4; iY && iX: 2,3,4,1; !iY && iX: 3,4,1,2
              objects = objects.concat([
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side1 topright-topleft
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side2 topleft-bottomleft
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT, //side3 bottomleft-bottomright
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side4 bottomright-topright
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topleft //top
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomleft
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topright
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomleft
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomright
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topright
              ])
            }
            else if(iY && !iX){
              objects = objects.concat([
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side2 topleft-bottomleft
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT, //side3 bottomleft-bottomright
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side4 bottomright-topright
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side1 topright-topleft
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topleft //top
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomleft
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topright
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomleft
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomright
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topright
              ])
            }
            else if(iY && iX){
              objects = objects.concat([
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT, //side3 bottomleft-bottomright
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side4 bottomright-topright
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side1 topright-topleft
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side2 topleft-bottomleft
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,



                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topleft //top
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomleft
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topright
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomleft
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomright
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topright
              ])
            }
            else if(!iY && iX){
              objects = objects.concat([
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side4 bottomright-topright
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side1 topright-topleft
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+fH)*UNIT, //side2 topleft-bottomleft
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT, //side3 bottomleft-bottomright
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT,
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+fH)*UNIT,

                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topleft //top
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomleft
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topright
                -FOV*0.5*UNIT+(x+0+stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomleft
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+1-stepD)*UNIT, (z+cH)*UNIT, //bottomright
                -FOV*0.5*UNIT+(x+1-stepD)*UNIT, -FOV*0.5*UNIT+(y+0+stepD)*UNIT, (z+cH)*UNIT, //topright
              ])
            }
            let b = 0.5
            let d = 1 / (1 + b)
            let l1 = 1 + ((0.0 + R) % 1) * b
            let l2 = 1 + ((0.25 + R) % 1) * b
            let l3 = 1 + ((0.5 + R) % 1) * b
            let l4 = 1 + ((0.75 + R) % 1) * b
            let l5 = 1 + b
            objectColors.push(
              fColor[0]*d*l1,fColor[1]*d*l1,fColor[2]*d*l1,
              fColor[0]*d*l1,fColor[1]*d*l1,fColor[2]*d*l1,
              cColor[0]*d*l1,cColor[1]*d*l1,cColor[2]*d*l1,
              cColor[0]*d*l1,cColor[1]*d*l1,cColor[2]*d*l1,
              cColor[0]*d*l1,cColor[1]*d*l1,cColor[2]*d*l1,
              fColor[0]*d*l1,fColor[1]*d*l1,fColor[2]*d*l1,

              fColor[0]*d*l2,fColor[1]*d*l2,fColor[2]*d*l2,
              fColor[0]*d*l2,fColor[1]*d*l2,fColor[2]*d*l2,
              cColor[0]*d*l2,cColor[1]*d*l2,cColor[2]*d*l2,
              cColor[0]*d*l2,cColor[1]*d*l2,cColor[2]*d*l2,
              cColor[0]*d*l2,cColor[1]*d*l2,cColor[2]*d*l2,
              fColor[0]*d*l2,fColor[1]*d*l2,fColor[2]*d*l2,

              fColor[0]*d*l3,fColor[1]*d*l3,fColor[2]*d*l3,
              fColor[0]*d*l3,fColor[1]*d*l3,fColor[2]*d*l3,
              cColor[0]*d*l3,cColor[1]*d*l3,cColor[2]*d*l3,
              cColor[0]*d*l3,cColor[1]*d*l3,cColor[2]*d*l3,
              cColor[0]*d*l3,cColor[1]*d*l3,cColor[2]*d*l3,
              fColor[0]*d*l3,fColor[1]*d*l3,fColor[2]*d*l3,

              fColor[0]*d*l4,fColor[1]*d*l4,fColor[2]*d*l4,
              fColor[0]*d*l4,fColor[1]*d*l4,fColor[2]*d*l4,
              cColor[0]*d*l4,cColor[1]*d*l4,cColor[2]*d*l4,
              cColor[0]*d*l4,cColor[1]*d*l4,cColor[2]*d*l4,
              cColor[0]*d*l4,cColor[1]*d*l4,cColor[2]*d*l4,
              fColor[0]*d*l4,fColor[1]*d*l4,fColor[2]*d*l4,

              fColor[0]*d*l5,fColor[1]*d*l5,fColor[2]*d*l5,
              fColor[0]*d*l5,fColor[1]*d*l5,fColor[2]*d*l5,
              cColor[0]*d*l5,cColor[1]*d*l5,cColor[2]*d*l5,
              cColor[0]*d*l5,cColor[1]*d*l5,cColor[2]*d*l5,
              cColor[0]*d*l5,cColor[1]*d*l5,cColor[2]*d*l5,
              fColor[0]*d*l5,fColor[1]*d*l5,fColor[2]*d*l5,
            )
          }

          objPolygons += 5
        }

      }
    }
    return {
      obj: obj,
      objectColors: objectColors,
      polygonCount: objPolygons
    }
  }
  function setColors(gl,objectColors) {
    let faceColors = new Array(FOV*FOV).fill([
          0,0,0,
          0,0,0,
          0,0,0,
          0,0,0,
          0,0,0,
          0,0,0,
        ]).flat()
      let lineColors = new Array(FOV*FOV).fill([
            200,200,200,
            200,200,200,
            200,200,200,
            200,200,200,
            200,200,200,
            200,200,200,
          ]).flat()
      gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(lineColors.concat(faceColors).concat(objectColors)),
        gl.STATIC_DRAW);
  }
  function initInfoInterval(){
    INFO_INTERVAL = setInterval(function () {
    if(INFO_FLAG == 0 && !MOVE_INTERVAL && USER_HAS_MOVED_AFTER_CLOSE){
      let pos = {
        x: Math.round((LIMES + ((X + FOV * 0.5) % LIMES)) % LIMES),
        y: Math.round((LIMES + ((Y + FOV * 0.5) % LIMES)) % LIMES)
      }
      for(let _p in PILLARS){
        let p = PILLARS[_p]
        let _x = Math.round((LIMES + (p.x % LIMES)) % LIMES)
        let _y = Math.round((LIMES + (p.y % LIMES)) % LIMES)
        if(pos.x > (_x - INFO_AREA) && pos.x < (_x + INFO_AREA) && pos.y > (_y - INFO_AREA)  && pos.y < (_y + INFO_AREA) ){
          G.openInfo(p)
          return
        }
      }

    }
    else if(INFO_FLAG < 0){
      INFO_FLAG += 1
    }
  }, 250);
  }
}

main()
