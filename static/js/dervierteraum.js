window.addEventListener("DOMContentLoaded",function(){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let color = urlParams.get('color')
  let x = urlParams.get('x')
  let y = urlParams.get('y')
  if(color && x && y){
    let c = document.createElement("div")
    c.id = "derVierteRaumCurtain"
    document.body.appendChild(c)
    setTimeout(function () {
      document.body.classList.add("curtain-open")
    }, 500)
    localStorage.setItem('rrrr', "?color=" + color + "&x=" + x  + "&y=" + y)
  }
  let b = document.createElement("div")
  b.title = "return to Der Vierte Raum"
  b.id = "derVierteRaumButton"
  b.addEventListener("click",function(){
    let p = localStorage.getItem("rrrr")
    window.location.href = "https://dervierteraum.org" + (p ? p : "")
  })
  let f = document.createElement("div")
  f.title = "Der Vierte Raum Funders"
  f.id = "derVierteRaumFunders"
  f.addEventListener("click",function(){
    let p = localStorage.getItem("rrrr")
    window.location.href = "https://dervierteraum.org/#funders" + (p ? p : "")
  })
  document.head.insertAdjacentHTML("beforeend", `<style>#derVierteRaumCurtain{position: fixed;top: 50%;left: 50%;transform: translate(-50%,-50%);width: 0%;height: 0%;outline: 10000px solid black;z-index: 1000000;transition: all 1s ease-in-out;pointer-events: none;user-select: none;}.curtain-open #derVierteRaumCurtain{width: 100%;height: 100%;}#derVierteRaumButton{z-index:999999;position:fixed;top:10px;left:0; width: 63px; height: 55px; cursor: pointer; background: transparent; background-image: url(https://dervierteraum.org/button); background-size:63px 55px; background-position: -28px 0; background-repeat: no-repeat;image-rendering: crisp-edges;transition: all 0.2s ease-in-out;}#derVierteRaumButton:hover{background-position: 0 0;}#derVierteRaumFunders{z-index:999999;position:fixed;bottom:10px;left:-802px; width: 837px; height: 55px; cursor: pointer; background: transparent; background-image: url(https://dervierteraum.org/funders); background-size:837px 55px; background-position: 0 0; background-repeat: no-repeat;image-rendering: crisp-edges;transition: all 0.2s ease-in-out;}#derVierteRaumFunders:hover{left:0;}
</style>`)
  document.body.appendChild(b)
  document.body.appendChild(f)
})
