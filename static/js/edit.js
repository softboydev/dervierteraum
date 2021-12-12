
let pointerFlag = false
let pointerStamp = 0
let pointerRotation = {x:0,y:0,z:0}
let deltaPointerRotation = {x:0,y:0,z:0}
let lastPointer = false
let rotateX = 0
let rotateY = 0
let scale = 16
let size = 40
let shapes = []
let options = [
  "SPACE","CUBE","CONE","FUNNEL","BALL","DRUM"  
]
let render = new Zdog.Illustration({
  element: '.zdog-canvas',
  resize: true,
  rotate: {x: Zdog.TAU * (0.2 + ((pointerRotation.x + deltaPointerRotation.x) * 0.2)),y: pointerRotation.y,z: Zdog.TAU * 0.0625 +  Zdog.TAU * (pointerRotation.z + deltaPointerRotation.z)}
});

let anchor = new Zdog.Anchor({
    addTo: render,
    translate: {x: 0, y: 0, z: 0}
  })
let config = [
  {
    type: 3,
    color: "#ffffff"
  },
  {
    type: 0,
    color: "#ffffff"
  },
  {
    type: 0,
    color: "#ffffff"
  },
  {
    type: 0,
    color: "#ffffff"
  },
  {
    type: 0,
    color: "#ffffff"
  },
  {
    type: 0,
    color: "#ffffff"
  },
  {
    type: 0,
    color: "#ffffff"
  },
  {
    type: 0,
    color: "#ffffff"
  }
]
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
  }
}
function pointerUp(){
  if(pointerFlag){
    pointerRotation.z += deltaPointerRotation.z
    pointerRotation.x += deltaPointerRotation.x
    deltaPointerRotation = {x:0,y:0,z:0}
    pointerFlag = false
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
    render.rotate = {x: Zdog.TAU * 0.2 + (pointerRotation.x + deltaPointerRotation.x) * 0.6,y: pointerRotation.y,z: Zdog.TAU * 0.0625 + Zdog.TAU * (pointerRotation.z + deltaPointerRotation.z)}
    render.updateRenderGraph();
}
function init(){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  for(let c in config){
    let type = urlParams.get("type" + c)
    let color = urlParams.get("color" + c)
    console.log(type,color);
    if(type){
      config[c].type = Number(type)
    }
    if(color){
      config[c].color = "#" + color
    }
  }
  let editor = document.getElementById("editor")
  for(let c = config.length - 1; c >= 0; c--){
    let div = document.createElement("div")
    let type = document.createElement("select")
    type.addEventListener("change",function(e){
      console.log(e.target.value);
      config[c].type = Number(e.target.value)
      update()
    })
    for(let o in options){
      let opt = document.createElement("option")
      opt.setAttribute("value",o)
      opt.innerText = options[o]
      if(config[c].type == o){
        opt.setAttribute("selected","true")
      }
      type.appendChild(opt)
    }
    let color = document.createElement("input")
    color.setAttribute("type","color")
    color.setAttribute("value",config[c].color)
    color.addEventListener("change",function(e){
      config[c].color = e.target.value
      update()
    })
    div.appendChild(type)
    div.appendChild(color)
    editor.appendChild(div)
  }
  update()
}
function update(){
  for(let s in shapes){
    anchor.removeChild(shapes[s])
  }
  shapes = []
  let urlString = "?"
  for(let z in config){
    let block = config[z].type
    let color = config[z].color
    urlString += "type" + z + "=" + block + "&" + "color" + z + "=" + color.replace("#","") + "&"
    let shape
    let translate = {
      x: 0,
      y: 0,
      z: (-config.length * 0.5 * size) + z * size,
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
  render.updateRenderGraph();
  history.pushState({}, "", "/edit" + urlString)
}
