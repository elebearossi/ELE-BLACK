import * as THREE from 'three'
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js";
import {OrbitControls} from 'https://unpkg.com/three@0.140.1/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'https://unpkg.com/three@0.140.1/examples/jsm/loaders/GLTFLoader.js'
import {TWEEN} from 'https://unpkg.com/three@0.140.1/examples/jsm/libs/tween.module.min'
import { EffectComposer } from "https://unpkg.com/three@0.140.1/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.140.1/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.140.1/examples/jsm/postprocessing/UnrealBloomPass.js";
import { LoadingManager } from 'three';

import { GUI } from 'https://unpkg.com/three@0.140.1/examples/jsm/libs/lil-gui.module.min.js';

//FOR MAIN
const explore = $(".explore");
const MercuryFisica = $(".mPhys");
const VenusFisica = $(".vPhys");
const EarthFisica = $(".ePhys");
const MarsFisica = $(".marsPhys");
const jupiterFisica = $(".jPhys");
const saturnFisica = $(".sPhys");
const uranusFisica = $(".uPhys");
const neptuneFisica = $(".nPhys");
const plutoFisica = $(".pPhys");
const ButtBack = $(".ButtBack");
// For physics

let cube;
let physicsWorld, physicsCube;
const materials = [];
let parameters = [];
let letItSnow= false;

let particles;


let cubeBody, cubeMesh , cube2Body , cube2Mesh;
let ballBody , ballMesh, ball2Body, ball2Mesh , ball3Body , ball3Mesh , ball4Body , ball4Mesh;

let gui;

let spotLight;
let light2;
function buildGui() {

  gui = new GUI();

  const params = {
    'light color': spotLight.color.getHex(),
    intensity: spotLight.intensity,
    distance: spotLight.distance,
    angle: spotLight.angle,
    penumbra: spotLight.penumbra,
    decay: spotLight.decay,
    focus: spotLight.shadow.focus,
    intensityAmbient : light2.intensity,
    Snow : false
  };

  gui.addColor( params, 'light color' ).onChange( function ( val ) {

    spotLight.color.setHex( val );
    animate();

  } );

  gui.add( params, 'intensity', 0, 2 ).onChange( function ( val ) {

    spotLight.intensity = val;
    animate();

  } );


  gui.add( params, 'distance', 50, 200 ).onChange( function ( val ) {

    spotLight.distance = val;
    animate();

  } );

  gui.add( params, 'angle', 0, Math.PI / 3 ).onChange( function ( val ) {

    spotLight.angle = val;
    animate();

  } );

  gui.add( params, 'penumbra', 0, 1 ).onChange( function ( val ) {

    spotLight.penumbra = val;
    animate();

  } );

  gui.add( params, 'decay', 1, 2 ).onChange( function ( val ) {

    spotLight.decay = val;
    animate();

  } );

  gui.add( params, 'focus', 0, 1 ).onChange( function ( val ) {

    spotLight.shadow.focus = val;
    animate();

  } );

  gui.add( params, 'intensityAmbient', 0, 5 ).onChange( function ( val ) {

    light2.intensity = val;
    animate();

  } );
  gui.add( params, 'Snow' ).onChange( function ( val ) {

    letItSnow= val;
    if(letItSnow){
      scene.add(storm);
    }
    animate();

  } );

  gui.open();

}


// --------------------------



let camera;
let scene = new THREE.Scene();      //scena rendirizzata
let scena_new = new THREE.Scene();  //scena custom creata
let scena_aux = new THREE.Scene();  //scena ausiliaria per il salvataggio

const space_ship = new THREE.Object3D();
const ufo = new THREE.Object3D();
const ISS = new THREE.Object3D();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const objects = [];
let ball;
/*
function updatePhysics() {

    // Step the physics world
    world.step(timeStep);

    // Copy coordinates from Cannon.js to Three.js
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);

}
*/
/* EXPLORING VARIABLE ------------------------------------------------------------------------------------------*/
let flagScene = false;
let controls;
let flagIn=false;

let sunTexture,orbitTexture, mercuryTexture,venusTexture,earthTexture,marsTexture,jupiterTexture,saturnTexture,saturnRingTexture,uranusTexture, uranusRingTexture,neptuneTexture,plutoTexture,groundTexture;
function loadPlanetTextures(loadingManager){
    sunTexture = new THREE.TextureLoader(loadingManager).load( "./textures/sun.jpg" );
    mercuryTexture = new THREE.TextureLoader(loadingManager).load( "./textures/mercury.jpg" );
    venusTexture = new THREE.TextureLoader(loadingManager).load( "./textures/venus.jpg" );
    earthTexture = new THREE.TextureLoader(loadingManager).load( "./textures/earth.jpg" );
    marsTexture = new THREE.TextureLoader(loadingManager).load( "./textures/mars.jpg" );
    jupiterTexture = new THREE.TextureLoader(loadingManager).load( "./textures/jupiter.jpg" );
    saturnTexture = new THREE.TextureLoader(loadingManager).load( "./textures/saturn.jpg" );
    saturnRingTexture = new THREE.TextureLoader(loadingManager).load( "./textures/saturn_ring.png" );
    uranusTexture = new THREE.TextureLoader(loadingManager).load( "./textures/uranus.jpg" );
    uranusRingTexture = new THREE.TextureLoader(loadingManager).load( "./textures/uranus_ring.png" );
    neptuneTexture = new THREE.TextureLoader(loadingManager).load( "./textures/neptune.jpg" );
    plutoTexture = new THREE.TextureLoader(loadingManager).load( "./textures/pluto.jpg" );
    orbitTexture = new THREE.TextureLoader(loadingManager).load( "./textures/orbitTexture3.jpg" );
    groundTexture = new THREE.TextureLoader(loadingManager).load( "./textures/diocane.jpeg" );
}
function loadBackground(loadingManager){
    const loader = new THREE.CubeTextureLoader(loadingManager);
    const texture = loader.load([
        'assets/background/t_neg-x.png',
        'assets/background/t_pos-x.png',    
        'assets/background/t_pos-y.png',
        'assets/background/t_neg-y.png',
        'assets/background/t_pos-z.png',
        'assets/background/t_neg-z.png',
    ]);
    scene.background = texture;
}

loadBackground();
loadPlanetTextures();

const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
    map: sunTexture
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

function createPlanete(size, texture, position, name, ring) {
    const geo = new THREE.SphereGeometry(size, 30, 30);
    const mat = new THREE.MeshStandardMaterial({
        map: texture                });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.name = name;
    mesh.name = name;
    obj.add(mesh);
    if(ring) {
        const ringGeo = new THREE.RingGeometry(
            ring.innerRadius,
            ring.outerRadius,
            32);
        const ringMat = new THREE.MeshBasicMaterial({
            map: (ring.texture),
            side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        mesh.add(ringMesh);
        ringMesh.position.x = 0;
        ringMesh.rotation.x = -0.5 * Math.PI;
    }
    scene.add(obj);
    objects.push(mesh);
    mesh.position.x = position;

    
    return {mesh, obj}
}
function createMoon(size, texture, position,segmentsW,segmentsH){
    const geo = new THREE.SphereGeometry(size, segmentsW, segmentsH);
    const mat = new THREE.MeshStandardMaterial({
        map: texture                });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    mesh.position.x = position;
    obj.add(mesh);

    return {mesh,obj}

}
function createOrbit(distance){
    let orbit = new THREE.RingGeometry(
        distance,
        distance+0.5,
        64);
    let orbitMat = new THREE.MeshBasicMaterial({
        map: (orbitTexture),
        side: THREE.DoubleSide
    });
    const orbitMesh = new THREE.Mesh(orbit, orbitMat);
    const obj = new THREE.Object3D();
    obj.add(orbitMesh);
    orbitMesh.position.x = 0;
    orbitMesh.rotation.x = -0.5 * Math.PI;
    sun.add(obj);
}
function createEllipseOrbit(distance){
    const curve = new THREE.EllipseCurve(
        0,  0,            // ax, aY
        distance, (distance/2),           // xRadius, yRadius
        0,  2 * Math.PI,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
    );
    
    const points = curve.getPoints( 80 );
    const orbit = new THREE.BufferGeometry().setFromPoints( points );
    
    let orbitMat = new THREE.MeshBasicMaterial({
        map: (orbitTexture),
        side: THREE.DoubleSide
    });
    
    // Create the final object to add to the scene
    const ellipse = new THREE.Line( orbit, orbitMat );
    
    ellipse.rotation.x=-0.5 * Math.PI;
    scene.add(ellipse);
}

// DEFAULT ANGLE FOR THE ORBIT
let orbitAngleEarth = - 4.280000000000003;
let orbitAngleMercury = 27.109942114712243
let orbitAngleVenus =  3.5188146928204262
let orbitAngleMars = - 1.1648146928204395
let orbitAngleJupiter = - 4.280000000000003;
let orbitAngleUranus =  4.398814692820427
let orbitAngleSaturn = - 0;
let orbitAngleNeptune =  4.280000000000003;
let orbitAnglePluto =  1.481629385640862
let Speed = 0.007;

// Variabili della nave - da settare
let JumpHeight = 20;
let jumpAngle = 0.0;

//ADD COSMETIC THINGS---------------------------------------------------------------
/*const loader1 = new GLTFLoader();
loader1.load( 'assets/models/ufo_3.glb', ( ufos ) =>  {    
    ufos.scene.position.set(0,40,0);
    //scene.add(ufos.scene);
    ufo.add( ufos.scene.clone());
    ufo.add( ufos.scene.clone());
},
(xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
},
(error ) => {
    console.error( error );
} );
const loader2 = new GLTFLoader();
loader2.load( 'assets/models/SpaceShip.glb', ( gltf2 ) =>  {    
    gltf2.scene.position.set(0,40,0);
    //scene.add( gltf2.scene );
    space_ship.add(gltf2.scene.clone());
},
(xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
},
    (error ) => {
        console.error( error );
} );
const loader3 = new GLTFLoader();
loader3.load( 'assets/models/ISS.glb', ( iss ) =>  {    
    iss.scene.position.set(0,40,0);
    //scene.add( gltf2.scene );
    ISS.add(iss.scene.clone());
},
(xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
},
(error ) => {
    console.error( error );
} );

*/

/* ADDING SPHERE AS PLANET */
const mercury = createPlanete(3.2, mercuryTexture, 28,"mercury");
const venus = createPlanete(5.8, venusTexture, 44,"venus");
const earth = createPlanete(6, earthTexture, 62,"earth");         
const mars = createPlanete(4, marsTexture, 78,"mars");
const jupiter = createPlanete(12, jupiterTexture, 100,"jupiter");
const saturn = createPlanete(10, saturnTexture, 138, "saturn", {
    innerRadius: 10,
    outerRadius: 20,
    texture: saturnRingTexture
});
const uranus = createPlanete(7, uranusTexture, 176, "uranus", {
    innerRadius: 7,
    outerRadius: 12,
    texture: uranusRingTexture
});
const neptune = createPlanete(7, neptuneTexture, 200, "neptune");
const pluto = createPlanete(2.8, plutoTexture, 216, "pluto");

/* ADDING SOME MOON ON THE PLANET */ 
const moon = createMoon(2,plutoTexture,10,20,20);
earth.mesh.add(moon.mesh);
const phobos = createMoon(1,plutoTexture,6,5,6);
const deimos = createMoon(1.5,plutoTexture,-7,10,10);
deimos.mesh.position.y=3;
        
mars.mesh.add(phobos.mesh);
mars.mesh.add(deimos.mesh);


let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let pointLight;


function MenuButton(array){
//MENU BUTTON
for(var i = 0; i<array.length;i++){
    var mnuItem = document.createElement("button");
    mnuItem.name = array[i].id;
    if(array[i].id == 13){
    mnuItem.innerHTML = "Mercury";
    }
    if(array[i].id == 15){
      mnuItem.innerHTML = "Venus";
      }
    if(array[i].id == 17){
      mnuItem.innerHTML = "Earth";
      }
    if(array[i].id == 19){
      mnuItem.innerHTML = "Mars";
      }
    if(array[i].id == 21){
      mnuItem.innerHTML = "Jupiter";
      }
    if(array[i].id == 23){
      mnuItem.innerHTML = "Saturn";
      }
    if(array[i].id == 26){
        mnuItem.innerHTML = "Uranus";
      }
    if(array[i].id == 29){
        mnuItem.innerHTML = "Neptune";
        }
    if(array[i].id == 31){
      mnuItem.innerHTML = "Pluto";
      }
    mnuItem.addEventListener("click", onClick);
    rightMenu.appendChild(mnuItem);
    console.log(array[i].id)
  }
  //--------------------------------------------------------------------------------------------------------------------------------
  //CLICK SUL PIANETA-------------------------------------------------------------------
  function onClick(event) {
   // renderer.setAnimationLoop(null);
    let explorer = true;
    var name = event.target.name.trim(); // get the name of the button
    array.forEach(function(obj) { 
      // loop through array of objects
      obj.material.emissive.setRGB(0, 0, 0); // reset to default (black)
     if (obj.id == name) {obj.material.emissive.setRGB(.1, .1, 1); // highlighting
     if(obj.id == 13){
      explore[0].innerHTML = "Explore: Mercury";
     }
     if(obj.id == 15){
      explore[0].innerHTML = "Explore: Venus";
     }
     if(obj.id == 17){
      explore[0].innerHTML = "Explore: Earth";
     }
     if(obj.id == 19){
      explore[0].innerHTML = "Explore: Mars";
     }
     if(obj.id == 21){
      explore[0].innerHTML = "Explore: Jupiter";
     }
     if(obj.id == 23){
      explore[0].innerHTML = "Explore: Saturn";
     }
     if(obj.id == 26){
      explore[0].innerHTML = "Explore: Uranus";
     }
     if(obj.id == 29){
      explore[0].innerHTML = "Explore: Neptune";
     }
     if(obj.id == 31){
      explore[0].innerHTML = "Explore: Pluto";
     }
     
    //CLICK SU ESPOLORA---------------------------------------------------------------------------------------------------------
     explore.click(() => {
     
    //explore[0].innerHTML = "start exploring" ;
     explorer = !explorer;
     if(explorer){
      //HideDiv(obj);
     flagIn = false;
     fitCameraToSelection(camera, controls, scene, 0.8);
     if(obj.id == 13){
      explore[0].innerHTML = "Explore: Mercury";
     }
     if(obj.id == 15){
      explore[0].innerHTML = "Explore: Venus";
     }
     if(obj.id == 17){
      explore[0].innerHTML = "Explore: Earth";
     }
     if(obj.id == 19){
      explore[0].innerHTML = "Explore: Mars";
     }
     if(obj.id == 21){
      explore[0].innerHTML = "Explore: Jupiter";
     }
     if(obj.id == 23){
      explore[0].innerHTML = "Explore: Saturn";
     }
     if(obj.id == 26){
      explore[0].innerHTML = "Explore: Uranus";
     }
     if(obj.id == 29){
      explore[0].innerHTML = "Explore: Neptune";
     }
     if(obj.id == 31){
      explore[0].innerHTML = "Explore: Pluto";
     }
     
     //explorer = !explorer;
     }
     else{
      if(obj.id == name){
        obj.material.emissive.setRGB(.1, .1, 1)
        }
        else{
         obj.material.emissive.setRGB(.0, .0, 0)
        }
     flagIn = true;
     obj.material.emissive.setRGB(0, 0, 0);
     fitCameraToSelection(camera, controls, obj, 1.5); //ZOOM
     explore[0].innerHTML = "Go Back to The Solar System" ;
    
    }
   
     //explore[0].innerHTML = explorer ? "start exploring" : "go back";
    })
    
  }
   
    });
   
  };
  
  //ZOOM ANIMATION----------------------------------------------------------------------------------------------------------
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  const box = new THREE.Box3();
  
  function fitCameraToSelection(camera, controls, selection, fitOffset = 1.2) {
    //HideDiv(selection);
    box.makeEmpty();
    box.expandByObject(selection);
    box.getSize(size);
    box.getCenter(center);
   
    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);
    const direction = controls.target.clone()
    
      .sub(camera.position)
      .normalize()
      .multiplyScalar(distance);
      var to = {
        x: center.x - direction.x + fitOffset,
        y: center.y - direction.y + fitOffset,
        z: center.z - direction.z + fitOffset
    };
     var tween = new TWEEN.Tween(camera.position)
     .to(to, 2000)
     .easing(TWEEN.Easing.Linear.None)
     .onUpdate(function () {
      if(selection == scene){
        document.getElementById("MercuryInfo").style.display = "none";
    document.getElementById("VenusInfo").style.display = "none";
    document.getElementById("EarthInfo").style.display = "none";
    document.getElementById("MarsInfo").style.display = "none";
    document.getElementById("JupiterInfo").style.display = "none";
    document.getElementById("SaturnInfo").style.display = "none";
    document.getElementById("UranusInfo").style.display = "none";
    document.getElementById("NeptuneInfo").style.display = "none";
    document.getElementById("PlutoInfo").style.display = "none";
   
    }
    else{
        document.getElementById("MercuryInfo").style.display = "none";
        document.getElementById("VenusInfo").style.display = "none";
        document.getElementById("EarthInfo").style.display = "none";
        document.getElementById("MarsInfo").style.display = "none";
        document.getElementById("JupiterInfo").style.display = "none";
        document.getElementById("SaturnInfo").style.display = "none";
        document.getElementById("UranusInfo").style.display = "none";
        document.getElementById("NeptuneInfo").style.display = "none";
        document.getElementById("PlutoInfo").style.display = "none";
       

    }
      camera.lookAt(center);
      camera.near = distance / 100;
      camera.far = distance * 100;
      controls.maxDistance = distance * 10;
      controls.target.copy(center);
      
      
  })
     .onComplete(function () { 
     camera.position.copy(controls.target).sub(direction);
     controls.update()  
     showDiv(selection); 
       
  })
     .start();
     
     
     
     
      //camera.position.copy(controls.target).sub(direction);
      //controls.update()   
    
     
  }
  
  //------------------------------------------------------------------------------------------------------------------------------
  //DISPLAY INFO---------------------------------------------------------------------------------------------------------------
  //Change Texture On Button click ok 
    //pianetà più limunoso quindi shinisess of the mesh no
    //terra - ombra luna
    //gltf curiosity
    //60 lune campo magnetico più forte
    //luci di saturno
    //su urano pioggia di diamanti 
    //luna compagna di plutone
  
    
  
    function showDiv(idPlanet) {
   
      //MERCURIO
      if(idPlanet.id == 13){
          document.getElementById("VenusInfo").style.display = "none";
          document.getElementById("EarthInfo").style.display = "none";
          document.getElementById("MarsInfo").style.display = "none";
          document.getElementById("JupiterInfo").style.display = "none";
          document.getElementById("SaturnInfo").style.display = "none";
          document.getElementById("UranusInfo").style.display = "none";
          document.getElementById("NeptuneInfo").style.display = "none";
          document.getElementById("PlutoInfo").style.display = "none";
      document.getElementById("MercuryInfo").style.display = "block";
    
      MercuryFisica.click(() => {
        nuovascena(idPlanet.id);
    
      });
    }
      //VENERE
      if(idPlanet.id == 15){
        //console.log("qui")
        document.getElementById("MercuryInfo").style.display = "none";
        document.getElementById("EarthInfo").style.display = "none";
        document.getElementById("MarsInfo").style.display = "none";
        document.getElementById("JupiterInfo").style.display = "none";
        document.getElementById("SaturnInfo").style.display = "none";
        document.getElementById("UranusInfo").style.display = "none";
        document.getElementById("NeptuneInfo").style.display = "none";
        document.getElementById("PlutoInfo").style.display = "none";
      document.getElementById("VenusInfo").style.display = "block";
      VenusFisica.click(() => {
          nuovascena(idPlanet.id);
        });
      }
      //TERRA
      if(idPlanet.id == 17){
          document.getElementById("MercuryInfo").style.display = "none";
          document.getElementById("VenusInfo").style.display = "none";
          document.getElementById("MarsInfo").style.display = "none";
          document.getElementById("JupiterInfo").style.display = "none";
          document.getElementById("SaturnInfo").style.display = "none";
          document.getElementById("UranusInfo").style.display = "none";
          document.getElementById("NeptuneInfo").style.display = "none";
          document.getElementById("PlutoInfo").style.display = "none";
          //console.log("qui")
        document.getElementById("EarthInfo").style.display = "block";
        EarthFisica.click(() => {
            nuovascena(idPlanet.id);
          });
        }
        //MARTE
        if(idPlanet.id == 19){
          document.getElementById("MercuryInfo").style.display = "none";
          document.getElementById("VenusInfo").style.display = "none";
          document.getElementById("EarthInfo").style.display = "none";
          document.getElementById("JupiterInfo").style.display = "none";
          document.getElementById("SaturnInfo").style.display = "none";
          document.getElementById("UranusInfo").style.display = "none";
          document.getElementById("NeptuneInfo").style.display = "none";
          document.getElementById("PlutoInfo").style.display = "none";
          //console.log("qui")
        document.getElementById("MarsInfo").style.display = "block";
        MarsFisica.click(() => {
            nuovascena(idPlanet.id);
          });
        }
  
        if(idPlanet.id == 21){
          document.getElementById("MercuryInfo").style.display = "none";
          document.getElementById("VenusInfo").style.display = "none";
          document.getElementById("EarthInfo").style.display = "none";
          document.getElementById("MarsInfo").style.display = "none";
          document.getElementById("SaturnInfo").style.display = "none";
          document.getElementById("UranusInfo").style.display = "none";
          document.getElementById("NeptuneInfo").style.display = "none";
          document.getElementById("PlutoInfo").style.display = "none";
          //console.log("qui")
        document.getElementById("JupiterInfo").style.display = "block";
        jupiterFisica.click(() => {
            nuovascena(idPlanet.id);
          });
        }
  
        if(idPlanet.id == 23){
          document.getElementById("MercuryInfo").style.display = "none";
          document.getElementById("VenusInfo").style.display = "none";
          document.getElementById("EarthInfo").style.display = "none";
          document.getElementById("MarsInfo").style.display = "none";
          document.getElementById("JupiterInfo").style.display = "none";
          document.getElementById("UranusInfo").style.display = "none";
          document.getElementById("NeptuneInfo").style.display = "none";
          document.getElementById("PlutoInfo").style.display = "none";
          //console.log("qui")
        document.getElementById("SaturnInfo").style.display = "block";
        saturnFisica.click(() => {
            nuovascena(idPlanet.id);
          });
        }
  
  
        if(idPlanet.id == 26){
          document.getElementById("MercuryInfo").style.display = "none";
          document.getElementById("VenusInfo").style.display = "none";
          document.getElementById("EarthInfo").style.display = "none";
          document.getElementById("MarsInfo").style.display = "none";
          document.getElementById("JupiterInfo").style.display = "none";
          document.getElementById("SaturnInfo").style.display = "none";
          document.getElementById("NeptuneInfo").style.display = "none";
          document.getElementById("PlutoInfo").style.display = "none";
          //console.log("qui")
        document.getElementById("UranusInfo").style.display = "block";
        uranusFisica.click(() => {
            nuovascena(idPlanet.id);
          });
        }
      
  
        if(idPlanet.id == 29){
          document.getElementById("MercuryInfo").style.display = "none";
          document.getElementById("VenusInfo").style.display = "none";
          document.getElementById("EarthInfo").style.display = "none";
          document.getElementById("MarsInfo").style.display = "none";
          document.getElementById("JupiterInfo").style.display = "none";
          document.getElementById("SaturnInfo").style.display = "none";
          document.getElementById("UranusInfo").style.display = "none";
          document.getElementById("PlutoInfo").style.display = "none";
          //console.log("qui")
        document.getElementById("NeptuneInfo").style.display = "block";
        saturnFisica.click(() => {
            nuovascena(idPlanet.id);
          });
        }
  
  
        if(idPlanet.id == 31){
          //console.log("qui")
          document.getElementById("MercuryInfo").style.display = "none";
          document.getElementById("VenusInfo").style.display = "none";
          document.getElementById("EarthInfo").style.display = "none";
          document.getElementById("MarsInfo").style.display = "none";
          document.getElementById("JupiterInfo").style.display = "none";
          document.getElementById("SaturnInfo").style.display = "none";
          document.getElementById("UranusInfo").style.display = "none";
          document.getElementById("NeptuneInfo").style.display = "none";
        document.getElementById("PlutoInfo").style.display = "block";
        uranusFisica.click(() => {
            nuovascena(idPlanet.id);
          });
        }
  
        if(idPlanet == scene){
          document.getElementById("MercuryInfo").style.display = "none";
          document.getElementById("VenusInfo").style.display = "none";
          document.getElementById("EarthInfo").style.display = "none";
          document.getElementById("MarsInfo").style.display = "none";
          document.getElementById("JupiterInfo").style.display = "none";
          document.getElementById("SaturnInfo").style.display = "none";
          document.getElementById("UranusInfo").style.display = "none";
          document.getElementById("NeptuneInfo").style.display = "none";
          document.getElementById("PlutoInfo").style.display = "none";
        }
      
  
  
  
  
  
  
      }
  
  }


  let storm = new THREE.Object3D();
  
  function nuovascena(id){
      flagScene = true;
      document.getElementById("rightMenu").style.display = "none";
      document.getElementById("MercuryInfo").style.display = "none";
      document.getElementById("VenusInfo").style.display = "none";
      document.getElementById("EarthInfo").style.display = "none";
      document.getElementById("MarsInfo").style.display = "none";
      document.getElementById("JupiterInfo").style.display = "none";
      document.getElementById("SaturnInfo").style.display = "none";
      document.getElementById("UranusInfo").style.display = "none";
      document.getElementById("NeptuneInfo").style.display = "none";
      document.getElementById("PlutoInfo").style.display = "none";
      document.getElementById("title").style.display = "none";
      document.getElementById("Back").style.display = "grid";
      const scene2 = new THREE.Scene();
      const sceneOriginal = new THREE.Scene();
     
      scene.position.set(0,0,0);
      //scene = scene2;
    
    let mercuryGravity;
    let earthGravity;
    let venusGravity;
    let marsGravity;
    let uranusGravity;
    let jupiterGravity;
    let saturnGravity;
    let neptuneGravity;
    let plutoGravity;
    let gravity;

    ///////////      STARS EFFECT


        

    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    const texture2Loader = new THREE.TextureLoader();

    const sprite1 = texture2Loader.load( './textures/snowflake1.png' );
    const sprite2 = texture2Loader.load( './textures/snowflake2.png' );
    const sprite3 = texture2Loader.load( './textures/snowflake3.png' );
    const sprite4 = texture2Loader.load( './textures/snowflake4.png' );
    const sprite5 = texture2Loader.load( './textures/snowflake5.png' );

    for ( let i = 0; i < 2000; i ++ ) {

      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000 - 1000;
      const z = Math.random() * 2000 - 1000;

      vertices.push( x, y, z );

    }
           

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    parameters = [
      [[ 1.0, 0.2, 0.5 ], sprite2, 20 ],
      [[ 0.95, 0.1, 0.5 ], sprite3, 15 ],
      [[ 0.90, 0.05, 0.5 ], sprite1, 10 ],
      [[ 0.85, 0, 0.5 ], sprite5, 8 ],
      [[ 0.80, 0, 0.5 ], sprite4, 5 ]
    ];

    for ( let i = 0; i < parameters.length; i ++ ) {

      const color = 0xfffff;
      const sprite = parameters[ i ][ 1 ];
      const size = parameters[ i ][ 2 ];

      materials[ i ] = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );
      materials[ i ].color.setHSL(color );

      particles = new THREE.Points( geometry, materials[ i ] );

      particles.rotation.x = Math.random() * 6;
      particles.rotation.y = Math.random() * 6;
      particles.rotation.z = Math.random() * 6;
      
      storm.add(particles);

    }
    
    
    switch(id){

      case 13:
        gravity=mercuryGravity;

      case 15:
        gravity=venusGravity;

      case 17:
        gravity=earthGravity;

      case 19:
        gravity=marsGravity;
      
      case 21:
        gravity=jupiterGravity;
      
      case 23:
        gravity=saturnGravity;

      case 26:
        gravity=uranusGravity;

      case 29:
        gravity=neptuneGravity;

      case 31: 
        gravity=plutoGravity;

    }

    

      const color = 0x333333;
      const intensity = 0.5;
      light2 = new THREE.AmbientLight(color, intensity);
      light2.position.set(0, 20, 0);
      scene2.add(light2);

/*
      const spotLight = new THREE.SpotLight( 0xbbbbb );
      spotLight.position.set( 0, 30, 0 );

      spotLight.castShadow = true;
      spotLight.decay = 2;

      spotLight.shadow.mapSize.width = 1024;
      spotLight.shadow.mapSize.height = 1024;

      spotLight.shadow.camera.near = 500;
      spotLight.shadow.camera.far = 4000;
      spotLight.shadow.camera.fov = 30;

      scene2.add( spotLight );

  */
        spotLight = new THREE.SpotLight( 0xffffff, 1.6 );
				spotLight.position.set( -35, 24, -30 );
				spotLight.angle = Math.PI / 4;
				spotLight.penumbra = 0.8;
				spotLight.decay = 2;
				spotLight.distance = 200;

				spotLight.castShadow = true;
				spotLight.shadow.mapSize.width = 512;
				spotLight.shadow.mapSize.height = 512;
				spotLight.shadow.camera.near = 10;
				spotLight.shadow.camera.far = 200;
				spotLight.shadow.focus = 1;
				scene2.add( spotLight );

				//let lightHelper = new THREE.SpotLightHelper( spotLight );
				//scene2.add( lightHelper );

				//let shadowCameraHelper = new THREE.CameraHelper( spotLight.shadow.camera );
				//scene2.add( shadowCameraHelper );
      /*
      const geometry = new THREE.BoxGeometry( 10, 10, 10 );
      const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
      cube = new THREE.Mesh( geometry, material );
      scene2.add( cube );
      */

      const ballMat = new THREE.MeshPhongMaterial();
      const ballTexture = new THREE.TextureLoader().load("./textures/worldColour.5400x2700.jpg");
      ballMat.map = ballTexture;
      const displacementMapBall = new THREE.TextureLoader().load("./textures/earthOk.jpg");
      ballMat.displacementMapBall = displacementMapBall;
      ballMat.displacementScale = .1;

      const floorMat = new THREE.MeshPhongMaterial();
      const floorTexture = new THREE.TextureLoader().load("./textures/rollingHillsBitMap.png");
      floorMat.map = floorTexture;
      const displacementMap = new THREE.TextureLoader().load("./textures/HeightMap.png");
      floorMat.displacementMap = displacementMap;
      floorMat.displacementScale = 2;

      const cubeMat = new THREE.MeshPhongMaterial();
      
      const cubeTexture = new THREE.TextureLoader().load("./textures/steel.jpg");
      cubeMat.map = cubeTexture;
      const displacementMapCube = new THREE.TextureLoader().load("./textures/HeightMap.jpg");
      cubeMat.displacementMapCube = displacementMapCube;
      cubeMat.displacementScale = .1;



        physicsWorld = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.81, 0),
      });

      physicsWorld.broadphase = new CANNON.NaiveBroadphase();
      const normalMaterial = new THREE.MeshNormalMaterial()
      const phongMaterial = new THREE.MeshPhongMaterial()
      const shadowMat = new THREE.MeshPhongMaterial( { color: 0x4080ff, dithering: true } );

      // Cube 1

      const cubeGeometry = new THREE.BoxGeometry(3, 3, 3)
      cubeMesh = new THREE.Mesh(cubeGeometry, cubeMat)
      cubeMesh.position.x = 22;
      cubeMesh.position.y = 18;
      cubeMesh.castShadow = true
      console.log(cubeMesh);
      scene2.add(cubeMesh)

      const cubeShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5 ))
      cubeBody = new CANNON.Body({ mass: 10 })
      cubeBody.addShape(cubeShape)
      cubeBody.position.x = cubeMesh.position.x
      cubeBody.position.y = cubeMesh.position.y
      cubeBody.position.z = cubeMesh.position.z
      physicsWorld.addBody(cubeBody)

  
      // Cube 2

      cube2Mesh = new THREE.Mesh(cubeGeometry, cubeMat)
      cube2Mesh.position.x = 22;
      cube2Mesh.position.y = 28;
      cube2Mesh.castShadow = true
      console.log(cubeMesh);
      scene2.add(cube2Mesh)

      const cube2Shape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5 ))
      cube2Body = new CANNON.Body({ mass: 10 })
      cube2Body.addShape(cube2Shape)
      cube2Body.position.x = cube2Mesh.position.x
      cube2Body.position.y = cube2Mesh.position.y
      cube2Body.position.z = cube2Mesh.position.z
      physicsWorld.addBody(cube2Body)

      // BALL 1

      const ballGeometry = new THREE.SphereGeometry(3,16,32);
      const ballMaterial = new THREE.MeshNormalMaterial();
      ballMesh = new THREE.Mesh(ballGeometry,ballMat);
      ballMesh.position.x = 21;
      ballMesh.position.y =  10;
      ballMesh.position.z =  0;
      ballMesh.castShadow = true;
      scene2.add(ballMesh);

      let mat1 =new CANNON.Material();
      let damping =0.01;
      const ballShape = new CANNON.Sphere(3);
      ballBody = new CANNON.Body({ mass: 10 })
      ballBody.material = mat1;
      ballBody.addShape(ballShape)
      ballBody.linearDamping = damping
      ballBody.position.x = ballMesh.position.x
      ballBody.position.y = ballMesh.position.y
      ballBody.position.z = ballMesh.position.z
      physicsWorld.addBody(ballBody);

      // BALL 2

      const ball2Geometry = new THREE.SphereGeometry(2,16,32);
      ball2Mesh = new THREE.Mesh(ball2Geometry,ballMat);
      ball2Mesh.position.x = 20;
      ball2Mesh.position.y =  10;
      ball2Mesh.position.z =  -20;
      ball2Mesh.castShadow = true;
      scene2.add(ball2Mesh);

      let mat2 =new CANNON.Material();
      const ball2Shape = new CANNON.Sphere(2);
      ball2Body = new CANNON.Body({ mass: 10 })
      ball2Body.material = mat2;
      ball2Body.addShape(ball2Shape)
      ball2Body.linearDamping = damping
      ball2Body.position.x = ball2Mesh.position.x;
      ball2Body.position.y =  ball2Mesh.position.y;
      ball2Body.position.z =  ball2Mesh.position.z;
      physicsWorld.addBody(ball2Body);

      // Ball 3

      ball3Mesh = new THREE.Mesh(ball2Geometry,ballMat);
      ball3Mesh.position.x =0;
      ball3Mesh.position.y =  10;
      ball3Mesh.position.z =  -20;
      ball3Mesh.castShadow = true;
      scene2.add(ball3Mesh);

      let mat3 =new CANNON.Material();
      const ball3Shape = new CANNON.Sphere(2);
      ball3Body = new CANNON.Body({ mass: 10 })
      ball3Body.material = mat3;
      ball3Body.addShape(ball3Shape)
      ball3Body.linearDamping = damping
      ball3Body.position.x = ball3Mesh.position.x;
      ball3Body.position.y =  ball3Mesh.position.y;
      ball3Body.position.z =  ball3Mesh.position.z;
      physicsWorld.addBody(ball3Body);

      // Ball 4

      ball4Mesh = new THREE.Mesh(ball2Geometry,ballMat);
      ball4Mesh.position.x = -20;
      ball4Mesh.position.y =  10;
      ball4Mesh.position.z =  -20;
      ball4Mesh.castShadow = true;
      scene2.add(ball4Mesh);

      let mat4 =new CANNON.Material();
      const ball4Shape = new CANNON.Sphere(2);
      ball4Body = new CANNON.Body({ mass: 10 })
      ball4Body.material = mat4;
      ball4Body.addShape(ball4Shape)
      ball4Body.linearDamping = damping
      ball4Body.position.x = ball4Mesh.position.x;
      ball4Body.position.y =  ball4Mesh.position.y;
      ball4Body.position.z =  ball4Mesh.position.z;
      physicsWorld.addBody(ball4Body);



      
      


      
      /*
      physicsCube = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(5, 5, 5)),
      });
      physicsCube.position.set(0, 0, 0);
      physicsWorld.addBody(physicsCube);
      */


      const planeGeometry = new THREE.PlaneGeometry(200, 200)
      const planeMesh = new THREE.Mesh(planeGeometry, floorMat)
      planeMesh.position.y = 0;
      planeMesh.rotateX(-Math.PI / 2)
      planeMesh.receiveShadow = true
      scene2.add(planeMesh)

      const planeMaterial= new CANNON.Material();
      const planeShape = new CANNON.Plane()
      const planeBody = new CANNON.Body({ mass: 0 , material:planeMaterial })

      planeBody.position.y = 0;
      planeBody.addShape(planeShape)
      planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
      physicsWorld.addBody(planeBody)
     
      //let mat1_ground = new CANNON.ContactMaterial(planeMaterial, mat1, { friction: 0.1, restitution: 0.9 });
      let mat2_ground = new CANNON.ContactMaterial(planeMaterial, mat2, { friction: 0.2, restitution: 0.3 });
      let mat3_ground = new CANNON.ContactMaterial(planeMaterial, mat3, { friction: 0.2, restitution: 0.5 });
      let mat4_ground = new CANNON.ContactMaterial(planeMaterial, mat4, { friction: 0.2, restitution: 0.8 });
      
      //physicsWorld.addContactMaterial(mat1_ground);
      physicsWorld.addContactMaterial(mat2_ground);
      physicsWorld.addContactMaterial(mat3_ground);
      physicsWorld.addContactMaterial(mat4_ground);
      
      buildGui();
      scene = scene2;


      document.getElementById('ButtBack').onclick = () => {
        console.log("ciao");
        scene = sceneOriginal;
        document.getElementById("rightMenu").style.display = "block";
        document.getElementById("MercuryInfo").style.display = "none";
        document.getElementById("VenusInfo").style.display = "none";
        document.getElementById("EarthInfo").style.display = "none";
        document.getElementById("MarsInfo").style.display = "none";
        document.getElementById("JupiterInfo").style.display = "none";
        document.getElementById("SaturnInfo").style.display = "none";
        document.getElementById("UranusInfo").style.display = "none";
        document.getElementById("NeptuneInfo").style.display = "none";
        document.getElementById("PlutoInfo").style.display = "none";
        document.getElementById("title").style.display = "block";
        document.getElementById("Back").style.display = "none";
        flagScene = false;
      }
     
      
  }
  MenuButton(objects);
  
  


/**************************************************************************************************************** */


    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({canvas});
    renderer.autoClearColor = true;
    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    let fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = -70;
    camera.position.y = 160;
    camera.position.x = 0;

    let camera2 = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera2.position.z = -45;
    camera2.position.y = 20;
    camera2.position.x = 0;
    camera2.lookAt(0,0,0);

    let controls2 = new OrbitControls(camera2, canvas);
    controls2.target.set(0, 0, 0);
    controls2.update();

    //console.log(camera.position)
    
    //  camera.position.set(-90, 140, 140);

  
    controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();
    const pointLightUfo = new THREE.PointLight(0xFFFFFF, 2, 1);
  
    scene 
    {
      //const color = 0xFFFFFF;
      const color = 0x333333;
      const intensity = 1;
      const light = new THREE.AmbientLight(color, intensity);
      light.position.set(-1, 2, 4);
      scene.add(light);
      const pointLight = new THREE.PointLight(0xFFFFFF, 2, 800,2);
      scene.add(pointLight);
      
    }
  

    const loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = function(url, item, total){
        console.log(`Started loading : ${url}`);
    }
    loadingManager.onProgress = function(url, loaded, total){
        console.log(`Started loading : ${url}`);
    }
    loadingManager.onLoad = function(){
        console.log(`Just finished loading`);
    }
    loadingManager.onError = function(url){
        console.log(`Problem on : ${url}`);
    }


    
    //load planets ?
    createEllipseOrbit(56);
    createEllipseOrbit(88);
    createEllipseOrbit(124);
    createEllipseOrbit(156);
    createEllipseOrbit(200);
    createEllipseOrbit(276);
    createEllipseOrbit(352);
    createEllipseOrbit(400);
    createEllipseOrbit(432);


    space_ship.position.set(0,40,0);
    scene.add(space_ship);

    ufo.add(pointLightUfo);
    scene.add(ufo);
    ISS.position.set(10,10,0);
    ISS.scale.set(0.025,0.025,0.025);
    earth.mesh.add(ISS);   

    




// BLOOOOOM------------------------------------------
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
new THREE.Vector2(window.innerWidth, window.innerHeight),
1.5,
0.4,
0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 1.2; //intensity of glow
bloomPass.radius = 0;
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

//-------------------------

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
} 
  

function animate(){
 

    if(flagScene){
        
        physicsWorld.step(1/60);
        /*
        cube.position.copy(physicsCube.position);
        
        cube.quaternion.copy(physicsCube.position);
        */
        renderer.render(scene, camera2);
        //cube.position.y -= 0.5;
        //console.log(cube.quaternion);

        cubeMesh.position.set(cubeBody.position.x, cubeBody.position.y, cubeBody.position.z)

        cubeMesh.quaternion.set(
            cubeBody.quaternion.x,
            cubeBody.quaternion.y,
            cubeBody.quaternion.z,
            cubeBody.quaternion.w
        )

        cube2Mesh.position.set(cube2Body.position.x, cube2Body.position.y, cube2Body.position.z)

        cube2Mesh.quaternion.set(
            cube2Body.quaternion.x,
            cube2Body.quaternion.y,
            cube2Body.quaternion.z,
            cube2Body.quaternion.w
        )

        ballMesh.position.set(ballBody.position.x, ballBody.position.y, ballBody.position.z)

        ballMesh.quaternion.set(
            ballBody.quaternion.x,
            ballBody.quaternion.y,
            ballBody.quaternion.z,
            ballBody.quaternion.w
        )

        ball2Mesh.position.set(ball2Body.position.x, ball2Body.position.y, ball2Body.position.z)

        ball2Mesh.quaternion.set(
            ball2Body.quaternion.x,
            ball2Body.quaternion.y,
            ball2Body.quaternion.z,
            ball2Body.quaternion.w
        )

        
        ball3Mesh.position.set(ball3Body.position.x, ball3Body.position.y, ball3Body.position.z)

        ball3Mesh.quaternion.set(
            ball3Body.quaternion.x,
            ball3Body.quaternion.y,
            ball3Body.quaternion.z,
            ball3Body.quaternion.w
        )

        
        ball4Mesh.position.set(ball4Body.position.x, ball4Body.position.y, ball4Body.position.z)

        ball4Mesh.quaternion.set(
            ball4Body.quaternion.x,
            ball4Body.quaternion.y,
            ball4Body.quaternion.z,
            ball4Body.quaternion.w
        )

        // PArticle related part 
        
        if(letItSnow){
          
             
              const time = Date.now() * 0.00005;

              for ( let i = 0; i < storm.children.length; i ++ ) {
                

                  const object = storm.children[ i ];
                  console.log(object);

                  if ( object instanceof THREE.Points ) {

                      object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );

                  }

              }

              for ( let i = 0; i < materials.length; i ++ ) {

                  const color = 0xffffff;

                  const h = ( 360 * ( color + time ) % 360 ) / 360;
                  materials[ i ].color.setHSL( h, color, color);
              }

        }
        else{
          scene.remove(storm);
        }

        //stats.update();
    }
    else{
          //Self-rotation
      sun.rotateY(0.004);
      mercury.mesh.rotateY(0.004);
      venus.mesh.rotateY(0.002);
      earth.mesh.rotateY(0.02);
      mars.mesh.rotateY(0.018);
      jupiter.mesh.rotateY(0.04);
      saturn.mesh.rotateY(0.038);
      uranus.mesh.rotateY(0.03);
      neptune.mesh.rotateY(0.032);
      pluto.mesh.rotateY(0.008);
      
    if (!flagIn){
      //  Around-sun-rotation
    
      // Earth
      orbitAngleEarth = (orbitAngleEarth - 0.004) % (2 * Math.PI);  
      earth.mesh.position.x = 124 * Math.cos(orbitAngleEarth);
      earth.mesh.position.z = 62 * Math.sin(orbitAngleEarth);

      // Mercury
      orbitAngleMercury = (orbitAngleMercury - 0.016) % (2 * Math.PI);
      mercury.mesh.position.x = 56 * Math.cos(orbitAngleMercury);
      mercury.mesh.position.z = 28 * Math.sin(orbitAngleMercury);

      // Mars
      orbitAngleMars = (orbitAngleMars - 0.012) % (2 * Math.PI);
      mars.mesh.position.x = 156 * Math.cos(orbitAngleMars);
      mars.mesh.position.z = 78 * Math.sin(orbitAngleMars);

      // Venus
      orbitAngleVenus = (orbitAngleVenus - 0.009) % (2 * Math.PI);
      venus.mesh.position.x = 88 * Math.cos(orbitAngleVenus);
      venus.mesh.position.z = 44 * Math.sin(orbitAngleVenus);

      // Jupiter
      orbitAngleJupiter = (orbitAngleJupiter - 0.008) % (2 * Math.PI);
      jupiter.mesh.position.x = 200 * Math.cos(orbitAngleJupiter);
      jupiter.mesh.position.z = 100 * Math.sin(orbitAngleJupiter);

      // Saturn
      orbitAngleSaturn = (orbitAngleSaturn - 0.0024) % (2 * Math.PI);
      saturn.mesh.position.x = 276 * Math.cos(orbitAngleSaturn);
      saturn.mesh.position.z = 138 * Math.sin(orbitAngleSaturn);

      // Uranus
      orbitAngleUranus = (orbitAngleUranus - 0.004) % (2 * Math.PI); 
      uranus.mesh.position.x = 352 * Math.cos(orbitAngleUranus);
      uranus.mesh.position.z = 176 * Math.sin(orbitAngleUranus);

      // Neptune
      orbitAngleNeptune = (orbitAngleNeptune - 0.0099) % (2 * Math.PI); 
      neptune.mesh.position.x = 400 * Math.cos(orbitAngleNeptune);
      neptune.mesh.position.z = 200 * Math.sin(orbitAngleNeptune);

      // Pluto
      orbitAnglePluto = (orbitAnglePluto - 0.0078) % (2 * Math.PI);
      pluto.mesh.position.x = 432 * Math.cos(orbitAnglePluto);
      pluto.mesh.position.z = 216 * Math.sin(orbitAnglePluto);
      }
    
      // SpaceShip animation
      space_ship.position.x = 100 * Math.cos(orbitAngleEarth);
      space_ship.position.z = 100 * Math.sin(orbitAngleEarth);
      space_ship.rotation.y += 0.0025;
      // Ufo animation
      ufo.position.x = 100 * Math.cos(-orbitAngleJupiter);
      ufo.position.z = 100 * Math.sin(-orbitAngleJupiter);
      ufo.rotation.y += 0.5;

      jumpAngle = ((jumpAngle + Speed) % (Math.PI )) -3.14;
      space_ship.position.y = JumpHeight* Math.sin(jumpAngle);

      ufo.position.y = JumpHeight* Math.sin(jumpAngle);
      

      raycaster.setFromCamera( pointer, camera );
    
      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
      controls.update();
      TWEEN.update();   
        bloomComposer.render();
    }

    
    
    
    
}

renderer.setAnimationLoop(animate);
