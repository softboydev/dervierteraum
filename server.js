const APP = require('express')();
const HTTP = require('http').Server(APP);
const IO = require('socket.io')(HTTP);
const PORT = process.env.PORT || 3000;
const EXPRESS = require('express')
const KILL_PLAYERS_AFTER = 2000
const poi = {
  "17;19": {
    name: "Frappant",
    id: "frappant",
    x: 17,
    y: 19,
    poi: true,
    state: {
      plan: [[1,5,2,0,1,0,3,1],["#fff","#fff","#fff","#000","#fff","#000","#fff","#fff"]],
      artists:false,
      date:false,
      description:"The Frappant Gallery is a non-commercial white cube situated directly in the middle of the larger, cooperatively administrated center for art, alternative culture, education, creative industries and social policy located at the former Viktoria Barracks in Hamburg Altona.<br>Every year, in its three rooms, the 145 m2 gallery offers a continuous program of 20 exhibits of contemporary and experimental visual art.",
      link: "https://frappant.org",
      linktitle: "Open Website"
    }
  },
  "6;18": {
    name: "About",
    id: "about",
    x: 7,
    y: 17,
    poi: true,
    state: {
      plan: [[1,5,5,5,5,1,0,4],["#fff","#fff","#fff","#fff","#fff","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"Arising out of the constraints of the current pandemic, we developed the concept of an additional 4th, web-based gallery room, which offers a curated program and can be visited in perpetuity. We would like to permanently expand our exhibition program by adding additional art formats.<br>We are making the 4th room available for digital or hybrid projects by artists who have gone through our APPlication and selection process.<br>We would like to utilize Frappant’s 4th Room in order to expand the range of artistic formats and media we present, to invite national and international media artists to realize their artistic concepts with us, to enable interactive and hybrid art formats and reach art-interested visitors in and beyond Hamburg.<br>In December 2021, Frappant 4th Room will be kicking off with the following pilot projects:<br><br>RAPID RABBIT RELOADED<br>by Stefan Moos & Allan Dorr<br>Project start: December 19, 2021<br><br>GECLOUDTE SPUREN<br>Digital art project by students in Prof. Aram Bartholl’s Digital Media Art class, University of Applied Sciences, Hamburg.<br>Project start: June 24, 2022",
      link: false,
    }
  },
  "6;6": {
    name: "Funders",
    id: "funders",
    x: 6,
    y: 6,
    poi: true,
    state: {
      plan: [[1,4,4,4,4,1,0,4],["#fff","#fff","#fff","#fff","#fff","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description: "Frappant 4th Room and the pilot art projects are being supPORTed by <a href='https://www.kulturgemeinschaften.de/' target='_blank'>KULTUR.GEMEINSCHAFTEN</a> – sponsorship program for digital content production at cultural institutions and by <a href='https://neustartkultur.de/' target='_blank'>NEUSTART KULTUR</a> – Program 2.<br>We would like to thank the <a href='https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/staatsministerin-fuer-kultur-und-medien' target='_blank'>Federal Commission for Culture and Media</a>, the <a href='https://www.kulturstiftung.de/' target='_blank'>Cultural Foundation of the German States</a>, the <a href='https://www.soziokultur.de/' target='_blank'>Federal Association for Socioculture e.V.</a>, the <a href='https://www.hamburg.de/bkm/' target='_blank'>Hamburg Authority for Culture and Media</a>, as well as the <a href='https://frappant.org' target='_blank'>Frappant e.V</a> for their friendly supPORT.",
      link: false,
    }
  },
  "0;11": {
    name: "Contact",
    id: "contact",
    x: 0,
    y: 11,
    poi: true,
    state: {
      plan: [[1,5,5,1,0,1,0,1],["#fff","#fff","#fff","#fff","#000","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"Get in touch if you would like to exhibit here or become a part of the 'Vierter Raum' Team",
      link: "mailto:ausstellung@frappant.org",
      linktitle: "Write Us"
    }
  },
  "6;12": {
    name: "Instagram",
    id: "instagram",
    x: 8,
    y: 11,
    poi: true,
    state: {
      plan: [[5,1,0,3,0,4,0,2],["#fff","#fff","#000","#fff","#000","#fff","#000","#fff"]],
      artists:false,
      date:false,
      description:"Follow us on Instagram to stay up to date about upcoming exhibitions and more.",
      link: "https://instagram.com/dervierteraum",
      linktitle: "Follow Us"
    }
  },
  "12;12": {
    name: "Rapid Rabbit Reloaded",
    id: "raprab",
    x: 14,
    y: 13,
    poi: true,
    exhibit: true,
    state: {
      plan: [[3,0,4,3,2,4,0,2],["#d3af4d","#000000","#ffffff","#ee2a8b","#ee2a8b","#ffffff","#000000","#d8ab4b"]],
      artists:"Various Artists",
      date:"19.12.21 – 15.09.22",
      description:"Exhibition, Talks, Sound, Chat, Archive<br>Observations of the works of artists, scientists, musicians, people, and internet findings from the digital age.<br><br>Sonntag, 9. Januar 2022, 15h: Kathrin Wildner & Michael Maierhof<br><br>Sonntag, 6. Februar 2022, 15h, Nina Lucia Groß & Magdalena Grüner<br><br>Sonntag, 6. März 2022, 15h Martin Zellerhoff<br><br>Sonntag, 10. April 2022, 15h Petra Bopp<br><br>Sonntag, 24. April 2022, 15h, Franziska Beyer<br><br>Sonntag, 15. Mai 2022, 15h, HFBK-Klassen Jeanne Faust, Michaela Melián<br><br>Sonntag, 5. Juni 2022, 15h, Ansgar Wilken (Konzert)<br><br>Sonntag, 12. Juni 2022, 15h, Claudia Reiche",
      link: "https://raprab.net/22"
    }
  },
  "16;7": {
    name: "Gute Gerätschaft",
    id: "gutegeraetschaft",
    x: 16,
    y: 7,
    poi: true,
    exhibit: true,
    state: {
      plan: [
        [
          0,
          4,
          0,
          5,
          5,
          5,
          5,
          5
        ],
        [
          "#000000",
          "#ffee3d",
          "#000000",
          "#ffee3d",
          "#ffee3d",
          "#ffee3d",
          "#ffee3d",
          "#ffee3d"
        ]
      ],
      artists:"Nick Guse, Sanna Leone, Hye-Eun Kim, Helene Kummer, Saray Purto Hoffmann, Julian Slagman, Sophia Tartler, Prateek Vijan, Kastania Waldmüller",
      date:"6.8.22 - 14.8.22",
      description:"Bedürfnisse wollen gestillt werden. Vor allem jene, die weiteres Überleben sichern. Der Magen knurrt seit Stunden und mir ist etwas auf den Kopf gefallen, das ich letztens jemanden habe essen sehen. Wie das vonstatten ging, ist mir jedoch schleierhaft. Meine Zähne sind zu weich und die Faust zu schwach. Durch eine geschickte Körperverlängerung wird die Vision von der geknackten Nuss wahr — und ein unscheinbarer Stein zum ersten Gerät. Mittlerweile umgeben mich mehr Geräte als ich Zähne habe und ich möchte nicht ohne sie leben. Sie fühlen sich bereits an wie Zähne, nur dass sie nicht in mir wachsen. Viele meiner gewohnten Bewegungen habe ich so präzise an sie angepasst, dass ich mich frage, was ich ohne sie eigentlich kann. Was also ist ein Gerät? Aus der Frage nach dem Wesen, den Eigenschaften oder überhaupt der Definition des Begriffes Gerät ergaben sich eine Bandbreite an weiteren Gedanken und möglichen Antworten; je konkreter wir als Gruppe versuchten das Gerät zu umranden, desto grenzenloser schien es zu sein. Anfangs kreisten wir noch um tatsächliche Gebrauchsgegenstände: Hilfsvorrichtungen, durch die sich ein Körper temporär erweitern lässt, um eine bestimmte Tätigkeit auf eine bestimmte Weise auszuführen. Doch bereits bei diesem sehr naheliegenden Beispiel wird offensichtlich, dass sich die Beziehung zwischen Gerät und Körper nicht so scharf definieren lässt, wie zunächst angenommen. Die Grenzen der aufeinander treffenden Entitäten sind nicht klar umrissen. Jede noch so kurzlebige Interaktion mit oder durch Geräte bedeutet mehr als rein materielle Umwälzungen. Denn indem wir unseren Körper um einen Fortsatz erweitern mit dem wir umzugehen lernen, verändert sich auch der gedankliche Zugang zum eigenen Handlungsspielraum. Für uns stellt diese Beziehung, die die nutzende Person mit dem Gerät eingeht, eine Schlüsselstelle dar. Ein neues Gerät kennenzulernen ist gleichbedeutend mit einer Art kulturellem Update. Auf rationaler Ebene haben wir die nötigen Informationen erhalten, um mit diesem Gerät ein Vorhaben zu planen. Auch kann es genutzt werden um weitere Informationen zu generieren. In Kombination mit anderen Geräten kann eine neue Methode entwickelt werden. Sie prägen also die Art wie wir uns Wissen aneignen und sind selbst Teil des Prozesses. Mit der Konditionierung des Körpers, die gleichermaßen das intuitive Denken und körperliches Wissen umfasst, hinterlässt das Gerät physiologische Schnittstellen. Auch in Abwesenheit ist es Teil des Körpergefüges. Die bei der Nutzung eines Geräts häufig wiederholten Bewegungen prägen sich nachhaltig in das Muskelgedächtnis ein. Es wird also anschaulich, dass Geräte mit unseren Vorstellungen von der Welt und von uns selbst fest verflochten sind und, dass sie sich als Teil unserer Welt auch in unsere Körper eingefleischt haben. Dazu konstituieren sie die Weise wie wir Wissen produzieren. Anders herum werden Geräte ausgehend von bereits gesammeltem Wissen entwickelt. Das in den Geräten materialisierte Wissen ist uns als Nutzende nicht immer bekannt, und so werden manche Funktionsweisen einfach hingenommen. Es sind menschliche Interessen, ein forschendes oder planendes Streben, das in Geräten eine Form findet. Die Kontexte der Entstehung eines Geräts, beeinflussen somit auch alle anderen Bereiche in die es mit seinen Folgegeräten Einzug findet. Für eine kritische Auseinandersetzung mit „Technologie“ halten wir es für produktiv die Genealogie eines Geräts oder Geräte- systems zu verstehen, anstatt in den Kategorien „befreiend“ oder „einschränkend“ zu denken. Wir betrachten Geräte als Infrastruktur, die zwischen selbst und nicht-selbst verschiedene Aktivitäten ausrichtet, und intensiviert oder abschwächt. Nachdem wir uns im Diskurs einen thematischem Überblick verschafft haben, möchten wir diese Auseinandersetzung nun in Material übertragen und auf eine körperlich erfahrbare Weise zugänglich machen. Sanna Leone und Nick Guse konzipieren einen Roboter, der sich unter eigener Agenda durch die Ausstellung bewegt und dabei die vorgefundene Infrastruktur, den Boden, die Wände und die Besuchenden auch Teil des Geräts werden lässt. Wie sehr die menschliche Perspektive in Geräte eingeschrieben ist, untersucht Helene Kummer am Beispiel des 'Riggings' bei 3D Animation, wo selbst in der Simulation nicht-menschlicher Körper ein am Menschen orientiertes Skelett eingesetzt wird, um Bewegung zu erzeugen. Ob ein Gerät eine ganz und gar immaterielle Form annehmen kann, untersucht Prateek Vijan in seiner Auseinadersetzung mit dem Aberglauben, einer mythologischen und gedanklichen Rahmenstruktur, welche die Handlungsmöglichkeiten bedingt. Im Bereich des Gegenständlichen bleibt wiederum das Ornament, ein scheinbar bedeutungsloser Überfluss an Formsprache, dem sich Kastania Waldmüller mit ihrer Paragerätschaft widmet. Hye-Eun Kim zeigt keramische Cyborgs, die die gesellschaftliche Fixierung auf- und Bewertung aufgrund von messbaren Einheiten thematisieren. Sophia Tartler untersucht in Form von balzenden Broschen, wie sexuelle Attraktivität vom Körper ausgelagert, das Werben um Aufmerksamkeit und Zuwendung von einem Gerät übernommen wird. Die immerwährende Verlagerung von Körpern und das Gefühl von Zuhause thematisiert Saray Purto mit dem Gefährt, das als Entwurfszeichnung aus ihrer Kindheit die Jahre überdauert hat. Julian Slagman erschließt das Thema auf visuelle Weise mit einer Kamera, dem Gerät das seinen Beruf erst hervorbrachte.",
      link: "https://gutegeraetschaft.dervierteraum.org"
    }
  },
  "24;24": {
    name: "Simulacrum 24/7",
    id: "simulacrum247",
    x: 22,
    y: 24,
    poi: true,
    exhibit: true,
    state: {
      plan: [[1,1,5,4,5,5,0,3],["#ff40ff","#ff40ff","#00f900","#b18cfe","#00f900","#00f900","#000000","#ff40ff"]],
      artists:"Gina Bartzok, Lukas Besenfelder, Stefano Dealessandri, Charlotte Hafke, Lucia Köhn, Julia Löffler, Godje Loof, Chiara Mizaikoff, Vito Schöneberger, Laurin Schuh, Rebecca Söhlke",
      date:"25.06.—10.07.22",
      description:"Kunstrasen, 3D-gedruckte Wearables, Fake Lashes und projizierte Texturen erwarten die Besuchenden von Simulacrum24/7 — einem interdisziplinären, medien- und raumübergreifenden Gruppenprojekt, das eine symbiotische Interaktion des neu entstandenen digitalen »4. Raums« der Frappant Galerie mit ihren bereits bestehenden haptischen Räumlichkeiten erforscht und hinterfragt.<br>Sowohl für den analogen als auch für den digitalen Raum eigens geschaffene Arbeiten treten in einen Dialog, der die Grenzen und Möglichkeiten der unterschiedlichen Welten erkennt und mit ihnen arbeitet.<br>Die Verbindung von digitalem und haptischem Raum äußert sich in der Idee des Mockups als ultimative IRL-URL-Verschmelzung.<br>Mockups sind auf einen Teilaspekt ausgestaltete Anschauungsobjekte, die eine Idee oder einen Prozess visuell erfahrbar machen. Der Akt des skizzenhaften Vorstellens eines in der Zukunft liegenden Umstands oder einer Verdinglichung macht das Mockup zu einer halb gewissen Prophezeiung und treibt spekulative Gedanken voran.<br>Als spekulatives Objekt mit klarer, aber erst noch herauszufindender Funktion wird es in dieser Ausstellung selbst zum autonomen Kunstwerk, das keinen Start- und keinen Endpunkt kennt und in seiner fluidität die Grenzen von Zeit und Raum neu verhandelt. Das Mockup als Fiktion ersetzt das eigentliche Produkt, während es sich als gleichzeitige Zukunftsfantasie und Realitätsnachahmung stets zwischen Realität und Fiktion, Funktion und Spekulation bewegt.<br>Die vier Räume werden in einem gegenseitigen Wechselspiel gestaltet und ergänzt. So werden sowohl die drei analogen als auch der vierte, digitale Raum zu interaktiven Oberflächen, die den Grundriss für eine online und AFK (Away From Keyboard) Interaktion zwischen den Besucher:innen, User:innen und künstlerischen Positionen bilden.<br>Die Transformation durch den Raumwechsel und new/old Possibilities stellt die Darstellung von Werk und Wirkung auf die Probe. Auf der Suche nach real Reality und im Aufspüren leerer Hüllen wird eine Fusion und Diffusion der Räume gewagt.<br>Simulacrum24/7 versucht eine Vorbildfunktion für zukünftige synergetische Ausstellungsformen einzunehmen. Die Ausstellung selbst wird zum Mockup.<br>Dieses Projekt wird aus Mitteln von der »ZEIT-Stiftung Ebelin und Gerd Bucerius« sowie KULTUR.GEMEINSCHAFTEN – Förderprogramm für digitale Content-Produktion von Kultureinrichtungen und NEUSTART KULTUR – Programm 2 gefördert. Für die freundliche Unterstützung durch die Beauftragte der Bundesregierung für Kultur und Medien, die Kulturstiftung der Länder, den Bundesverband Soziokultur e.V., die Behörde für Kultur und Medien Hamburg sowie den Frappant e.V. bedanken wir uns.",
      link: "https://simulacrum247.dervierteraum.org"
    }
  }
}
let PLAYERS = {}

APP.use('/static', EXPRESS.static(__dirname + '/static'));
APP.get('/', (req, res) => { //index page
  res.sendFile(__dirname + '/index.html');
});
APP.get('/edit', (req, res) => { //editor
  res.sendFile(__dirname + '/edit.html');
});
APP.get('/connect', (req, res) => { //connection script
  res.sendFile(__dirname + '/static/js/dervierteraum.js');
});
APP.get('/button', (req, res) => { //externally available graphics
  res.sendFile(__dirname + '/static/img/back.jpg');
});
IO.on("connection", (socket) => {
  socket.on("join", msg => { //when a players joins
    PLAYERS[msg.id] = { //save to player object
      id: msg.id,
      x: msg.positIOn && msg.positIOn.x ? msg.positIOn.x : -10 + Math.floor(Math.random() * 20),
      y: msg.positIOn && msg.positIOn.y ? msg.positIOn.y : -10 + Math.floor(Math.random() * 20),
      state: msg.state,
      alive: KILL_PLAYERS_AFTER //resetted alive flag
    }
    IO.emit('poi', poi) //emit poi once, only players that havent downloaded it yet will store it
  });
  socket.on("alive", msg => { //upon alive callback
    if(PLAYERS[msg.id]){
      PLAYERS[msg.id].alive = KILL_PLAYERS_AFTER //reset the clock
      PLAYERS[msg.id].x = msg.x //copy over position and state
      PLAYERS[msg.id].y = msg.y
      PLAYERS[msg.id].state = msg.state
    }
    // else{
    //   IO.emit('logout', msg);
    // }
  })
  socket.on("kill", msg => { //when a player exits
    if(PLAYERS[msg.id]){ //remove from object
      delete PLAYERS[msg.id]
    }
  })
  setInterval(update, 100) //set up update interval
});
function update(){
  for(let p in PLAYERS){ //for every player
    if(PLAYERS[p].alive <= 0){ //when callback didnt return for too lonbg
      delete PLAYERS[p] //kill it with fire
    }
    else{
      PLAYERS[p].alive-- //else count down the clock
    }
    // if(PLAYERS[p].state.flash > 0){
    //   PLAYERS[p].state.flash = PLAYERS[p].state.flash - 0.01
    // }
  }
  IO.emit('update', PLAYERS) //send an update with new player object
}

HTTP.listen(PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${PORT}/`);
});
