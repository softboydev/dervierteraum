(function(){
//GLOBAL CONSTANTS
const IO = io() //Socket connection
const POS = function(x,y){ //Positional object
  this.x = x || 0 //stores x and y coordinates, defaults to 0
  this.y = y || 0
  this.random = function(center,diviation){ //sets coordinates to random value around center with given diviation and returns self
    this.x = center + (-diviation + Math.floor(Math.random() * diviation * 2))
    this.y = center + (-diviation + Math.floor(Math.random() * diviation * 2))
    return this
  },
  this.virtual = function(){ //returns an object contauning the virtualised coordinates
    let vx = (FOV * 0.5 + BOUNDS + ((this.x - AVATAR.x) % BOUNDS)) % BOUNDS
    let vy = (FOV * 0.5 + BOUNDS + ((this.y - AVATAR.y) % BOUNDS)) % BOUNDS
    return {x:vx,y:vy}
  }
}
const Z = Zdog //Writes into a single letter variable
const TAU = Z.TAU //Stores into own variable
const WORLD = new Z.Illustration({ //Main render object
  element: '.zdog-canvas', //selector for DOM element
  resize: true, //enables dynamic resize
  rotate: {x: TAU * 0.2,y: 0,z: TAU * 0.0625}//sets base rotation for first render
});
const U = { //UTILS
  invertHex: function(hex){ //inverts given hex color
    hex = hex.replace("#","")
    return "#" + (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
  },
  randomColor: function(){ //returns a random color from color pool
      return COLOR_POOL[Math.floor(COLOR_POOL.length * Math.random())]
  },
  getZAt: function(x,y,q){ //gets the z value at the given coordinates, has a flag for rounded player position
      let resolution = 18 //amount of different steps the noise function should return
      let n = 0 //return value
      let _x = q ? Math.round(AVATAR.x) : AVATAR.x //processed player x, might be rounded through flag
      let _y = q ? Math.round(AVATAR.y) : AVATAR.y //processed player y, might be rounded through flag
      let e = Math.floor((0.5 + noise.simplex3((10000 + x + _x) * VARIETY,(10000 + y + _y) * VARIETY,1000) * 0.5) * resolution) //generates a noise based value based on coordinates that is then mapped
      switch(e){ //// TODO: Add spike world, see screenshot
        case 0: //water at sea level
        case 1:
        case 2:
        case 3:
          n = (1 + Math.sin(y + performance.now() * 0.001) * 0.5)
          break
        case 4: //moving planes
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
        case 13: //cityblocks
        case 14:
        case 15:
        case 16:
          n = 2 + Math.pow(1 + ((1 + noise.simplex3(((x + _x) + ((x + _x) % 2)) * GRAIN,((y + _y) + ((y + _y) % 2)) * GRAIN,0)) * 0.5),3)
          break
        case 17: // mountains
        case 18:
          n = 2 + Math.pow(((1 + noise.simplex3(x + _x * GRAIN * 0.1,y + _y * GRAIN * 0.1,performance.now() * ANIMATION_SPEED * 0.1)) * 0.5),2) * 8
          break
      }
      return n - 10 - ELEVATION //returns final value, substracting a fixed value for internal translation and a constant value for external translation
  },
  calcDiagonal: function(){ //returns the relative screen diagonal up to 1, in relation to LARGEST_DIAGONAL
    return Math.min(((window.innerWidth + window.innerHeight) * 0.5) / LARGEST_DIAGONAL,1)
  },
  calcFov: function(){ //calculates and returns dynamic FOV based on diagonal and min max
    return Math.min(Math.round((FOV_MIN + U.calcDiagonal() * (FOV_MAX - FOV_MIN)) * 0.5) * 2, FOV_MAX)
  }
}
const I = { //INPUTS
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
    // window.addEventListener("resize",resize)
  },
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
const G = { //GLOBALS
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
    let noconnect = link.getAttribute("data-noconnect") == "true"
    if(target == "external"){
      window.open(href, '_blank')
    }
    else if(target == "exhibit"){
      document.body.classList.remove("curtain-open")
      setTimeout(function () {
        IO.emit('kill', {id:AVATAR.id})
        let x = Math.round((BOUNDS + (AVATAR.x % BOUNDS)) % BOUNDS)
        let y = Math.round((BOUNDS + (AVATAR.y % BOUNDS)) % BOUNDS)
        window.location.href = noconnect ? href : href + "?color=" + AVATAR.state.colorA.replace("#","") + "&x=" + x  + "&y=" + y
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
        for(let _p in POIS.grid){
          let p = POIS.grid[_p]
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
//ENV CONSTANTS
const INFO_CD = 10 //cooldown in frames before the info popup may be shown again
const UPDATE_UI_AFTER = 10 //mod to update the UI after X frames
const CLICK_TIME = 150 //Ms that have to pass before a touch/click is considered holded
const INFO_AREA = 3 //radius around pillars that lead to the info being open. Radius is in virtual grid coordinates
const FOV_MIN = 8 //minimum FOV with worst framerate and smallest device
const FOV_MAX = 16 //maximum FOV with large device and very good framerate
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
let FOV = FOV_MAX //amount of grid coordinates in view
let DIAGONAL = 1 //display diagonal
let DYNAMIC_SHAPES = {} //stores reference to all shapes that are rendered dynamically. Accessed by key/id
let POI_IN_VIEW = {}  //stores list of all POI currently in the view. Accessed by key
let OLD_AVATARS = {} //buffer array to compare newly sent buffers with
//DATA
const PROGRAM_POI = {
  name: "Program 2023",
  id: "program",
  poi: true,
  state:{
    exhibit: false,
    artists:false,
    date:false,
    description:"TV—PHASE ONLINE<br>Heiko Wommelsdorf<br>10.03.23<br><br>SWORDS AND KISSES<br>Yifan He, Nuka Nayu, Axe Binondo, Chaney Diao, Zhuyang Liu, Nitesh Tailor, Nikki C<br>18.04.23<br><br>IDENTITY CRISIS<br>Noa Brosh<br>05.05.23<br><br>GINESTRA<br>Ava rasti<br>12.05.23<br><br>MAPS AND MARKS<br>Lily McCraith and Pheobe Riley Law<br>09.09.23<br><br>RICONOSCERSI IN ATTIMI SOSPESI DI FRAGILITA' IN DIVENIRE DISTURBA<br>Riccardo Androni<br>17.11.23<br><br>",
    link: false
  }
}
const ARCHIVE_POI = {
  name: "Archive",
  id: "archive",
  poi: true,
  state:{
    exhibit: false,
    artists:false,
    date:false,
    description:"RAPID RABBIT RELOADED<br>Stefan Moos & Allan Door<br>19.12.21<br><br>SIMULACRUM 24/7<br>Stefano Dealessandri Gina Bartzok, Lukas Besenfelder, Lucia Girardet, Charlotte Hafke, Julia Löffler, Godje Loof, Chiara Mizaikoff, Laurin Schuh, Rebecca Söhlke & Vito Schöneberger<br>24.06.22<br><br>GUTE GERÄTSCHAFT<br>Nick Guse, Sanna Leone, Hye-Eun Kim, Helene Kummer, Saray Purto Hoffmann, Julian Slagman, Sophia Tartler, Prateek Vijan & Kastania Waldmüller<br>06.08.22<br><br",
    link: false
  }
}
//OBJECTS
const UI = {  //stores references to DOM elements for UI purposes. Accessed as keys. also holds related functions
  connect: function(){
    this.x = document.getElementById("avatarX")
    this.y = document.getElementById("avatarY")
    this.clock = document.getElementById("timeOnServer")
    this.people = document.getElementById("peopleOnServer")
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
    document.getElementById("programLink").addEventListener("click",() => G.openInfoDirect('program',PROGRAM_POI))
    document.getElementById("archiveLink").addEventListener("click",() => G.openInfoDirect('archive',ARCHIVE_POI))
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
    let timestamp = ("" + Math.floor(time / 60 / 60)).padStart(2, '0') + ":" + ("" + (Math.floor(time / 60) % 60)).padStart(2, '0') + ":" + ("" + (time % 60)).padStart(2, '0') //converts to a hh:mm:ss timestamp
    this.x.innerText = Math.round(AVATAR.x % BOUNDS) //updates x position
    this.y.innerText = Math.round(AVATAR.y % BOUNDS) //updates y position
    this.clock.innerText = timestamp //updates the clock
    this.people.innerText = Object.keys(AVATARS).length //updates the number of people on server
    this.pois.innerHTML = "" //resets the poilist
    for(let POIS in POI_IN_VIEW){ //for every POI in view
      let tr = document.createElement("tr") //creates a tr wrapper
      let th = document.createElement("th") //creates a th for title
      let td = document.createElement("td") //creates a td for colorcode
      let a = document.createElement("a") //creates a link
      a.addEventListener("mousedown",e => {G.openInfoDirect(POI_IN_VIEW[POIS])}) //attaches event handler to wrapper
      a.innerText = POI_IN_VIEW[POIS].name //sets linktitle to poi title
      for(let c in POI_IN_VIEW[POIS].state.plan[1]){ //iterates over all colors in plan
        let span = document.createElement("span") //creates a span to hold show the color value
        span.classList.add("color") //adds class to span for css
        span.style.background = POI_IN_VIEW[POIS].state.plan[1][c] //sets background inline
        td.appendChild(span) //appends to data
      }
      tr.appendChild(td) //appends data before th to row so its is displayed on the left
      th.appendChild(a) //appends link to th
      tr.appendChild(th) //appends th
      this.pois.appendChild(tr) //appends row to list
    }
  }
}
const POINTS = {
  grid: [],
  update: function(){
    if(this.grid){ //to prevent errors
      for(let y = 0; y < FOV + 1; y++){ //updates the z values for the whole grid in the POINTS buffer
        for(let x = 0; x < FOV + 1; x++){
          this.grid[y][x] = U.getZAt(x,y,true)
        }
      }
    }
  },
  init: function(){
    this.grid = []
    for(let y = 0; y < FOV + 1; y ++){ //for the whole grid in view
      let row = [] //create y rows
      for(let x = 0; x < FOV + 1; x ++){
        row.push(0) //push an int for each x
      }
      this.grid.push(row)
    }
  }
}
const POLYGONS = {
  grid: [],
  update: function(){
    let stroke = STROKE / WORLD.zoom
    for(let y = 0; y <= FOV; y++){ //for all points in grid
      for(let x = 0; x <= FOV; x++){
        let X = x + (AVATAR.x % 1) //add the modded avatar position to get smooth scrolling effect
        let Y = y + (AVATAR.y % 1)
        if(x == FOV && y == FOV){ //on the outermost corner
        //           //no need to add a path, no need to move
        }
        else if(x == FOV){ //on the left side add a vertial line but no tile
          this.grid[x][y][0].path = [
            { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS.grid[y][x] * DELTA },
            { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + (Y+1)*SIZE,z:POINTS.grid[y+1][x] * DELTA }
          ]
          this.grid[x][y][0].stroke = stroke
          this.grid[x][y][0].updatePath();
        }
        else if(y == FOV){ //on the topside add a horizontal line but no tile
          this.grid[x][y][0].path = [
            { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS.grid[y][x] * DELTA },
            { x: (-0.5 * SIZE * FOV) + (X+1) * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS.grid[y][x+1] * DELTA }
          ]
          this.grid[x][y][0].stroke = stroke
          this.grid[x][y][0].updatePath();
        }
        else{ //anywhere else add a vertival and a horizontal line and a filled tile
          this.grid[x][y][0].path = [
            { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS.grid[y][x] * DELTA },
            { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + (Y+1)*SIZE,z:POINTS.grid[y+1][x] * DELTA }
          ]
          this.grid[x][y][1].path = [
            { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS.grid[y][x] * DELTA },
            { x: (-0.5 * SIZE * FOV) + (X+1) * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS.grid[y][x+1] * DELTA }
          ]
          this.grid[x][y][2].path = [
            { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS.grid[y][x] * DELTA},
            { x: (-0.5 * SIZE * FOV) + (X + 1) * SIZE,y:(-0.5 * SIZE * FOV) + Y*SIZE,z:POINTS.grid[y][x + 1] * DELTA},
            { x: (-0.5 * SIZE * FOV) + (X + 1) * SIZE,y:(-0.5 * SIZE * FOV) + (Y + 1) *SIZE,z:POINTS.grid[y + 1][x + 1] * DELTA},
            { x: (-0.5 * SIZE * FOV) + X * SIZE,y:(-0.5 * SIZE * FOV) + (Y + 1)*SIZE,z:POINTS.grid[y + 1][x] * DELTA}
          ]
          this.grid[x][y][0].stroke = stroke
          this.grid[x][y][1].stroke = stroke
          this.grid[x][y][0].updatePath()
          this.grid[x][y][1].updatePath()
          this.grid[x][y][2].updatePath()
        }
      }
    }
  },
  init: function(){
    this.grid = []
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
      this.grid.push(row)
    }
  }
}
const AVATARS = {
  grid: {},
  update: function(msg){
    OLD_AVATARS = this.grid || msg //copy over current this.grid into buffer. If there are none us the new ones
    this.grid = msg //overwrite this.grid with the new ones
    if(this.grid[AVATAR.id]){ //when the user avatar could be found
      this.grid[AVATAR.id].x = AVATAR.x //sync with server information
      this.grid[AVATAR.id].y = AVATAR.y
      AVATAR.shapes.ball.group.visible = true //enables the render of the user avatar
    }
    for(let s in DYNAMIC_SHAPES){ //for all dynamic shapes
      if(!this.grid[s] && !POIS.grid[s]){ //when there is no avatar or poi connected to the shape
        DYNAMIC_SHAPES[s].group.remove() //remove the shape
        delete DYNAMIC_SHAPES[s]
      }
    }
    for(let a in this.grid){ // for each AVATAR in the list of this.grid
      if(a != AVATAR.id){ //when the current AVATAR is not the users AVATAR
        let p = (new POS(this.grid[a].x,this.grid[a].y)).virtual()
        if(p.x >= 0 && p.x <= FOV && p.y >= 0 && p.y <= FOV){ //when the relative position is within the view
          let x = (-FOV * 0.5 + p.x) * SIZE
          let y =  (-FOV * 0.5 + p.y) * SIZE
          let z = 4 + U.getZAt(p.x,p.y) * 0.5 * DELTA + SIZE + AVATAR_HOVER * Math.abs(-1 + ((performance.now() * 0.0005) % 2))
          if(!DYNAMIC_SHAPES[a]){ //when there is no shape for the AVATAR
            let group = new Z.Group({
              addTo:WORLD,
              visible:true
            })
            let anchor = new Z.Anchor({
              // translate: this.grid[a].POIS ? {x: (((FOV * 0.5 + this.grid[a].x - 0.5 - AVATAR.x) % BOUNDS)) * SIZE , y: (((FOV * 0.5 + this.grid[a].y - 0.5 - AVATAR.y) % BOUNDS)) * SIZE, z: U.getZAt(relX,relY) * DELTA + AVATAR.d + SIZE} : {x: (((FOV * 0.5 + this.grid[a].x - AVATAR.x) % BOUNDS) - FOV * 0.5) * SIZE, y: (((FOV * 0.5 + this.grid[a].y - AVATAR.y) % BOUNDS) - FOV * 0.5) * SIZE, z: 4 + U.getZAt(relX,relY) * 0.5 * DELTA + AVATAR.d + SIZE},
              translate: {x: x, y: y, z: 4 + z},
              addTo: group
            })
              let sphereA = new Z.Hemisphere({
                addTo: anchor,
                diameter: SIZE,
                stroke: false,
                color: this.grid[a].state.colorA
              });
              let sphereB = new Z.Hemisphere({
                addTo: anchor,
                diameter: SIZE,
                stroke: false,
                color: this.grid[a].state.colorB,
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
            DYNAMIC_SHAPES[a].anchor.translate = {x: x, y: y, z: z}
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
  }
}
const POIS = {
  grid: false,
  init: function(msg){
    POIS.grid = msg //store msg as poi
    const urlParams = new URLSearchParams(window.location.search) //gets any url parameters TODO make this way more elegant
    let anchor = window.location.href.split('#').pop()
    let poi = urlParams.get('poi') ? urlParams.get('poi').toLowerCase() : anchor ? anchor.toLowerCase() : false //gets poi param or false
    let found = false //search result flag
    if(poi){ //when a param was present
      for(let _p in POIS.grid){ //for every poi
        let p = POIS.grid[_p]
        if(!found && (p.name.toLowerCase() == poi || p.id.toLowerCase() == poi)){ //if none was found yet and the poi matches with id or name
          poi = p //stores reference
          found = true //sets flag
        }
      }
    }
    if(!found){ //when none was found
      poi = false //reset poi to false, param was present but no poi could be identified
    }
    if(poi){ //when a poi was found
      AVATAR.x = poi.x //set avatar pos
      AVATAR.y = poi.y
      G.openInfoDirect(poi) //open the pois info
    }
  },
  update: function(){
    for(let a in this.grid){ // for each POIS in the list of POISs
      let p = (new POS(POIS.grid[a].x,POIS.grid[a].y)).virtual()
      let relX = Math.round(p.x)
      let relY = Math.round(p.y)
        let _x = ((-FOV * 0.5 + relX + Math.abs(AVATAR.x % 1)) + (AVATAR.x % 1) - 0.5) * SIZE
        let _y =  ((-FOV * 0.5 + relY + Math.abs(AVATAR.y % 1)) + (AVATAR.y % 1) - 0.5) * SIZE
        // let _z = U.getZAt(relX,relY)
        let _z = 0
        if(relX >= 0 && relX < FOV && relY >= 0 && relY < FOV){ //when the relative position is within the view
          _z = (POINTS.grid[relY][relX] + 1) * DELTA
          if(!DYNAMIC_SHAPES[a]){ //when there is no shape for the AVATAR
              let anchor = new Z.Group({
                translate: {x: _x, y: _y, z: _z},
                addTo:WORLD
              })
              let SHAPES = []
              for(let z = 0; z < 8; z++){ //TODO central building template
                let block = POIS.grid[a].state.plan[0][z]
                let color = POIS.grid[a].state.plan[1][z]
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
              POI_IN_VIEW[POIS.grid[a].id] = POIS.grid[a]
          }
          else{ //when there is a shape
            DYNAMIC_SHAPES[a].anchor.translate = {x: _x, y: _y, z: _z}
          }
        }
        else if(DYNAMIC_SHAPES[a]){ //when it is not but there is still a shape representing it
          delete POI_IN_VIEW[POIS.grid[a].id]
          DYNAMIC_SHAPES[a].anchor.remove()
          delete DYNAMIC_SHAPES[a]
        }
    }
  }
}
const AVATAR = { //stores all properties and methods directly related to the users avatar
  id: "", //unique id
  x: 0, //x position
  y: 0, //y position
  state: {}, //object based general purpose data storage that is exposed to other users
  speed: 0.5, //speed multiplier
  join: function(){
    const urlParams = new URLSearchParams(window.location.search) //gets any url parameters
    let color = urlParams.get('color') ? "#" + urlParams.get('color') : U.randomColor() //either stores the color given by url parameter or generates a random one when none is given
    let position = urlParams.get('x') && urlParams.get('y') ? {x:Number(urlParams.get('x')),y:Number(urlParams.get('y'))} : (new POS).random(0,JOIN_SPREAD) //either stores the position given by url parameter or generates a random one when none is given
    const flag = urlParams.get("color") && urlParams.get("x") && urlParams.get("y") //if all params are present
    if(!flag){ //when not all parameters are present
      document.body.classList.add("tutorial-open") //show the tutorial
    }
    this.x = position.x
    this.y = position.y
    this.shapes.ball = {
      group: new Z.Group({addTo:this.shape,visible:false})
    }
    this.shapes.anchor = new Z.Anchor({
      addTo: this.shapes.ball.group
    })
    this.shapes.shellA = new Z.Hemisphere({
      addTo: this.shapes.anchor,
      diameter: SIZE,
      stroke: false,
      color: "#ffffff"
    });
    this.shapes.shellB = new Z.Hemisphere({
      addTo: this.shapes.anchor,
      diameter: SIZE,
      stroke: false,
      color: "#0000ff",
      rotate: { x: TAU/2 }
    });
    this.state = {
      colorA: color,
      colorB: U.invertHex(color),
    }
    this.shapes.shellA.color = this.state.colorA
    this.shapes.shellB.color = this.state.colorB
    UI.colorA.style.background = this.state.colorA
    UI.colorB.style.background = this.state.colorB
    this.id = "" + Math.floor(performance.now()) + Math.floor(Math.random() * 1000000)
    IO.emit('join', {name:this.name,id:this.id,state:this.state,position:position})
    JOINED = true

  },
  shape: new Z.Anchor({ //main anchor that all other shapes are added to
    addTo: WORLD,
    translate: {x: 0, y: 0, z: 0}
  }),
  update: function(){ //updating render function
    this.shape.translate = {z: 4 + U.getZAt(FOV * 0.5,FOV * 0.5) * 0.5 * DELTA + SIZE + AVATAR_HOVER * Math.abs(-1 + ((performance.now() * 0.0005) % 2))} //sets z translatiom based on z and hover animation clock
    this.shape.rotate = { x: TAU * performance.now() * 0.0001, y: TAU * performance.now() * 0.0001,z: TAU * performance.now() * 0.0001 } //sets rotation based on elapsed time
  },
  shapes: {}, //stores reference to rendered shapes
  move: function(v){ //moving function, takes a 2d vector object with delta for both axis
    if(INFO_FLAG != 1){ //only allow movement while info popup is closed
      this.x += v.x * this.speed //adds delta multiplied by speed to position
      this.y += v.y * this.speed //adds delta multiplied by speed to position
    }
  }
}
//LIFECYCLE
function resize(){
  FOV = U.calcFov()
  DIAGONAL = U.calcDiagonal()
  // POINTS.init() //only needed when resize events are used
  // POLYGONS.init() //only needed when resize events are used
}
function setup(){
  INFO_INTERVAL = setInterval(function () {
    if(INFO_FLAG == 0 && !MOVE_INTERVAL && USER_HAS_MOVED_AFTER_CLOSE){
      let pos = {
        x: Math.round((BOUNDS + (AVATAR.x % BOUNDS)) % BOUNDS),
        y: Math.round((BOUNDS + (AVATAR.y % BOUNDS)) % BOUNDS)
      }
      if(POIS.grid){
        for(let _p in POIS.grid){
          let p = POIS.grid[_p]
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
function init(){
  setup()
  I.init() //inits Inputs with own initializer
  UI.init() //inits the ui with its own function
  POINTS.init() //disable when resize() listens to event
  POLYGONS.init() //disable when resize() listens to event
  resize() //call resize once, put into own function to handle resize events one day
  IO.on('poi',function(msg){
    if(!POIS.grid){ //when pois havent been downloaded yet
      POIS.init(msg) //init pois with message
    }
  })
  IO.on('update', function(msg) {
    if(JOINED){ //when the user has already joined upon recieval of message
      IO.emit('alive', {id:AVATAR.id,x:AVATAR.x,y:AVATAR.y,state:AVATAR.state}) //emit the keep alive message with needed info
    }
    AVATARS.update(msg)
  })
  AVATAR.join() //joins to server
  update() //initial call to update function
  document.body.classList.add("curtain-open") //opens the curtain via css animation
}
function update(){
  POINTS.update()
  UI_UPDATE_CLOCK++ //ups the UI update clock
  POLYGONS.update() //updates the rendering of all polygons
  POIS.update() //updates the rendering of all POI
  AVATAR.update()
  if(UI_UPDATE_CLOCK == UPDATE_UI_AFTER ){ //when the clock is to be reset
    UI_UPDATE_CLOCK = 0 //resets the clock
    UI.update() //calls update on the UI
  }
  // if(AVATARS[AVATAR.id]){ //only needed when state is being manipulated by server
  //   AVATAR.state = AVATARS[AVATAR.id].state
  // }
  WORLD.updateRenderGraph() //updates the render graph on the Z World object so virtual changes are being displayed
  requestAnimationFrame(update) //enqueues next update call
}
window.addEventListener("DOMContentLoaded",init)
})()
