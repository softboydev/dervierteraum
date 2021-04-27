const canvas = document.getElementById("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
let scale = 30
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

let world = new Zdog.Group({
  addTo: render
});
let avatar = {
  x: 0,
  y: 0,
  target: false,
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
    this.x += x
    this.y += y
    document.getElementById("footerMid").innerText = "X " + this.x + " | Y " + this.y
  },
  flash: function(){
    this.state = 1
  }
}


window.addEventListener("wheel",function(e){
  changeZoom(e.deltaY);
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
  if(avatar.state > 0){
    avatar.state -= avatar.cd
  }
  avatar.shape.color =  "rgb(" + 255 + "," + (1 - avatar.state) * 255 + "," + (1 - avatar.state) * 255 + ")"
  avatar.shape.path = [{x: 0, y: 0  , z: (points[scale * 0.5][scale * 0.5] * delta + avatar.d)}]
  avatar.shape.updatePath();
  world.updateGraph()
}
function animate() {
  kd.tick()
  update()
  render.updateRenderGraph();
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
(function(global){var module=window.noise={};function Grad(x,y,z){this.x=x;this.y=y;this.z=z}
Grad.prototype.dot2=function(x,y){return this.x*x+this.y*y};Grad.prototype.dot3=function(x,y,z){return this.x*x+this.y*y+this.z*z};var grad3=[new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];var p=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];var perm=new Array(512);var gradP=new Array(512);module.seed=function(seed){if(seed>0&&seed<1){seed*=65536}
seed=Math.floor(seed);if(seed<256){seed|=seed<<8}
for(var i=0;i<256;i++){var v;if(i&1){v=p[i]^(seed&255)}else{v=p[i]^((seed>>8)&255)}
perm[i]=perm[i+256]=v;gradP[i]=gradP[i+256]=grad3[v%12]}};module.seed(0);var F2=0.5*(Math.sqrt(3)-1);var G2=(3-Math.sqrt(3))/6;var F3=1/3;var G3=1/6;module.simplex2=function(xin,yin){var n0,n1,n2;var s=(xin+yin)*F2;var i=Math.floor(xin+s);var j=Math.floor(yin+s);var t=(i+j)*G2;var x0=xin-i+t;var y0=yin-j+t;var i1,j1;if(x0>y0){i1=1;j1=0}else{i1=0;j1=1}
var x1=x0-i1+G2;var y1=y0-j1+G2;var x2=x0-1+2*G2;var y2=y0-1+2*G2;i&=255;j&=255;var gi0=gradP[i+perm[j]];var gi1=gradP[i+i1+perm[j+j1]];var gi2=gradP[i+1+perm[j+1]];var t0=0.5-x0*x0-y0*y0;if(t0<0){n0=0}else{t0*=t0;n0=t0*t0*gi0.dot2(x0,y0)}
var t1=0.5-x1*x1-y1*y1;if(t1<0){n1=0}else{t1*=t1;n1=t1*t1*gi1.dot2(x1,y1)}
var t2=0.5-x2*x2-y2*y2;if(t2<0){n2=0}else{t2*=t2;n2=t2*t2*gi2.dot2(x2,y2)}
return 70*(n0+n1+n2)};module.simplex3=function(xin,yin,zin){var n0,n1,n2,n3;var s=(xin+yin+zin)*F3;var i=Math.floor(xin+s);var j=Math.floor(yin+s);var k=Math.floor(zin+s);var t=(i+j+k)*G3;var x0=xin-i+t;var y0=yin-j+t;var z0=zin-k+t;var i1,j1,k1;var i2,j2,k2;if(x0>=y0){if(y0>=z0){i1=1;j1=0;k1=0;i2=1;j2=1;k2=0}else if(x0>=z0){i1=1;j1=0;k1=0;i2=1;j2=0;k2=1}else{i1=0;j1=0;k1=1;i2=1;j2=0;k2=1}}else{if(y0<z0){i1=0;j1=0;k1=1;i2=0;j2=1;k2=1}else if(x0<z0){i1=0;j1=1;k1=0;i2=0;j2=1;k2=1}else{i1=0;j1=1;k1=0;i2=1;j2=1;k2=0}}
var x1=x0-i1+G3;var y1=y0-j1+G3;var z1=z0-k1+G3;var x2=x0-i2+2*G3;var y2=y0-j2+2*G3;var z2=z0-k2+2*G3;var x3=x0-1+3*G3;var y3=y0-1+3*G3;var z3=z0-1+3*G3;i&=255;j&=255;k&=255;var gi0=gradP[i+perm[j+perm[k]]];var gi1=gradP[i+i1+perm[j+j1+perm[k+k1]]];var gi2=gradP[i+i2+perm[j+j2+perm[k+k2]]];var gi3=gradP[i+1+perm[j+1+perm[k+1]]];var t0=0.6-x0*x0-y0*y0-z0*z0;if(t0<0){n0=0}else{t0*=t0;n0=t0*t0*gi0.dot3(x0,y0,z0)}
var t1=0.6-x1*x1-y1*y1-z1*z1;if(t1<0){n1=0}else{t1*=t1;n1=t1*t1*gi1.dot3(x1,y1,z1)}
var t2=0.6-x2*x2-y2*y2-z2*z2;if(t2<0){n2=0}else{t2*=t2;n2=t2*t2*gi2.dot3(x2,y2,z2)}
var t3=0.6-x3*x3-y3*y3-z3*z3;if(t3<0){n3=0}else{t3*=t3;n3=t3*t3*gi3.dot3(x3,y3,z3)}
return 32*(n0+n1+n2+n3)};function fade(t){return t*t*t*(t*(t*6-15)+10)}
function lerp(a,b,t){return(1-t)*a+t*b}
module.perlin2=function(x,y){var X=Math.floor(x),Y=Math.floor(y);x=x-X;y=y-Y;X=X&255;Y=Y&255;var n00=gradP[X+perm[Y]].dot2(x,y);var n01=gradP[X+perm[Y+1]].dot2(x,y-1);var n10=gradP[X+1+perm[Y]].dot2(x-1,y);var n11=gradP[X+1+perm[Y+1]].dot2(x-1,y-1);var u=fade(x);return lerp(lerp(n00,n10,u),lerp(n01,n11,u),fade(y))};module.perlin3=function(x,y,z){var X=Math.floor(x),Y=Math.floor(y),Z=Math.floor(z);x=x-X;y=y-Y;z=z-Z;X=X&255;Y=Y&255;Z=Z&255;var n000=gradP[X+perm[Y+perm[Z]]].dot3(x,y,z);var n001=gradP[X+perm[Y+perm[Z+1]]].dot3(x,y,z-1);var n010=gradP[X+perm[Y+1+perm[Z]]].dot3(x,y-1,z);var n011=gradP[X+perm[Y+1+perm[Z+1]]].dot3(x,y-1,z-1);var n100=gradP[X+1+perm[Y+perm[Z]]].dot3(x-1,y,z);var n101=gradP[X+1+perm[Y+perm[Z+1]]].dot3(x-1,y,z-1);var n110=gradP[X+1+perm[Y+1+perm[Z]]].dot3(x-1,y-1,z);var n111=gradP[X+1+perm[Y+1+perm[Z+1]]].dot3(x-1,y-1,z-1);var u=fade(x);var v=fade(y);var w=fade(z);return lerp(lerp(lerp(n000,n100,u),lerp(n001,n101,u),w),lerp(lerp(n010,n110,u),lerp(n011,n111,u),w),v)}})(this)
/*! keydrown - v1.2.7 - 2018-12-19 - http://jeremyckahn.github.com/keydrown */

!function(a){var f=function(){var n={forEach:function(n,e){var t;for(t in n)n.hasOwnProperty(t)&&e(n[t],t)}},e=n.forEach;n.getTranspose=function(n){var t={};return e(n,function(n,e){t[n]=e}),t},n.indexOf=function(n,e){if(n.indexOf)return n.indexOf(e);var t,o=n.length;for(t=0;t<o;t++)if(n[t]===e)return t;return-1};var o=n.indexOf;return n.pushUnique=function(n,e){return-1===o(n,e)&&(n.push(e),!0)},n.removeValue=function(n,e){var t=o(n,e);if(-1!==t)return n.splice(t,1)[0]},n.documentOn=function(n,e){a.addEventListener?a.addEventListener(n,e,!1):document.attachEvent&&document.attachEvent("on"+n,e)},n.requestAnimationFrame=a.requestAnimationFrame||a.webkitRequestAnimationFrame||a.mozRequestAnimationFrame||function(n){a.setTimeout(n,1e3/60)},n.noop=function(){},n}(),n={ZERO:48,ONE:49,TWO:50,THREE:51,FOUR:52,FIVE:53,SIX:54,SEVEN:55,EIGHT:56,NINE:57,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,ENTER:13,SHIFT:16,ESC:27,SPACE:32,LEFT:37,UP:38,RIGHT:39,DOWN:40,BACKSPACE:8,DELETE:46,TAB:9,TILDE:192},p=f.getTranspose(n),e=[],t=function(){"use strict";function n(n){this.keyCode=n,this.cachedKeypressEvent=null}function t(n,e,t,o){t?n[e]=t:n[e](o)}return n.prototype._downHandler=f.noop,n.prototype._upHandler=f.noop,n.prototype._pressHandler=f.noop,n.prototype.isDown=function(){return-1!==f.indexOf(e,this.keyCode)},n.prototype.down=function(n){t(this,"_downHandler",n,this.cachedKeypressEvent)},n.prototype.up=function(n,e){t(this,"_upHandler",n,e)},n.prototype.press=function(n,e){this.cachedKeypressEvent=e,t(this,"_pressHandler",n,e)},n.prototype.unbindDown=function(){this._downHandler=f.noop},n.prototype.unbindUp=function(){this._upHandler=f.noop},n.prototype.unbindPress=function(){this._pressHandler=f.noop},n}(),o=function(i){"use strict";var c={};c.Key=t;var o=!1,r=Date.now?Date.now:function(){return+new Date},u=r();return c.tick=function(){var n,e=i.length;for(n=0;n<e;n++){var t=i[n],o=p[t];o&&c[o].down()}},c.run=function(n){o=!0;var e=r(),t=e-u;f.requestAnimationFrame.call(a,function(){o&&(c.run(n),n(t,e))}),u=e},c.stop=function(){o=!1},f.forEach(n,function(n,e){c[e]=new t(n)}),f.documentOn("keydown",function(n){var e=n.keyCode,t=p[e],o=f.pushUnique(i,e),r=c[t];if(r){var u=r.cachedKeypressEvent||{};(u.ctrlKey||u.shiftKey||u.metaKey)&&(o=!0),o&&r.press(null,n)}}),f.documentOn("keyup",function(n){var e=f.removeValue(i,n.keyCode),t=p[e];t&&c[t].up(null,n)}),f.documentOn("blur",function(n){f.forEach(i,function(n){var e=p[n];e&&c[e].up()}),i.length=0}),c}(e);"object"==typeof module&&"object"==typeof module.exports?module.exports=o:"function"==typeof define&&define.amd?define(function(){return o}):a.kd=o}(window);
init()
animate();
