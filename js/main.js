import * as THREE from 'three'
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js";
import {OrbitControls} from 'https://unpkg.com/three@0.140.1/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'https://unpkg.com/three@0.140.1/examples/jsm/loaders/GLTFLoader.js'
import {TWEEN} from 'https://unpkg.com/three@0.140.1/examples/jsm/libs/tween.module.min'
import { EffectComposer } from "https://unpkg.com/three@0.140.1/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.140.1/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.140.1/examples/jsm/postprocessing/UnrealBloomPass.js";
import { LoadingManager } from 'three';


// For physics


var world, mass, body, shape, timeStep=1/60,  geometry, material, mesh;

let phyBall1 , phyBall2 , phyBall3 , realBall1 , realBall2 , realBall3 , physicsWorld;




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

function updatePhysics() {

    // Step the physics world
    world.step(timeStep);

    // Copy coordinates from Cannon.js to Three.js
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);

}

/* EXPLORING VARIABLE ------------------------------------------------------------------------------------------*/
let flagScene = false;
const explore = $(".explore");
const MercuryAnim = $(".M_A");
const MercuryFisica = $(".m2");
const VenusAnim = $(".V_A");
let MercuryTex = 0;
let controls;
let flagIn=false;

let sunTexture,orbitTexture, mercuryTexture,venusTexture,earthTexture,marsTexture,jupiterTexture,saturnTexture,saturnRingTexture,uranusTexture, uranusRingTexture,neptuneTexture,plutoTexture,groundTexture;
function loadPlanetTextures(loadingManager){
    sunTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/sun.jpg" );
    mercuryTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/mercury.jpg" );
    venusTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/venus.jpg" );
    earthTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/earth.jpg" );
    marsTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/mars.jpg" );
    jupiterTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/jupiter.jpg" );
    saturnTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/saturn.jpg" );
    saturnRingTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/saturn_ring.png" );
    uranusTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/uranus.jpg" );
    uranusRingTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/uranus_ring.png" );
    neptuneTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/neptune.jpg" );
    plutoTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/pluto.jpg" );
    orbitTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/orbitTexture3.jpg" );
    groundTexture = new THREE.TextureLoader(loadingManager).load( "assets/textures/diocane.jpeg" );
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
const loader1 = new GLTFLoader();
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
      HideDiv(obj);
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
    HideDiv(selection);
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
    document.getElementById("MercuryInfo").style.display = "block";
   /* MercuryAnim.click(() => {
   if(MercuryTex == 4) {MercuryTex = 0};
    const tex1 = new THREE.TextureLoader().load( "assets/textures/tex1.jpg" );
    const tex2 = new THREE.TextureLoader().load( "assets/textures/tex2.jpg" );
    const tex3 = new THREE.TextureLoader().load( "assets/textures/tex3.jpg" );
    
    if(MercuryTex == 0){
      idPlanet.material.map= tex1;
      idPlanet.material.needsUpdate = true;
      MercuryAnim[0].innerHTML = "1";
    }
    if(MercuryTex == 1){
      idPlanet.material.map= tex2;
      idPlanet.material.needsUpdate = true;
      MercuryAnim[0].innerHTML = "2";
    
    }
    if(MercuryTex == 2){
      idPlanet.material.map= tex3;
      idPlanet.material.needsUpdate = true;
      MercuryAnim[0].innerHTML = "3";
    
    }
    if(MercuryTex ==3){
    idPlanet.material.map= mercuryTexture;
      idPlanet.material.needsUpdate = true;
      MercuryAnim[0].innerHTML = "0";
    }
    MercuryTex++;
    })
    */
    MercuryFisica.click(() => {
      nuovascena(idPlanet.id);
      
     
      
  
    });
  }
    //VENERE
    if(idPlanet.id == 15){
      console.log("qui")
    document.getElementById("VenusInfo").style.display = "block";
    
    
    }
    //URANO
    
    }
  
  
  }
  //NASCONDI INFO----------------------------------------------------------------------------------------------------------------
  function HideDiv(idPlanet){
  //MERCURIO
    if(idPlanet.id == 13){
      idPlanet.material.map= mercuryTexture;
      idPlanet.material.needsUpdate = true;
      document.getElementById("MercuryInfo").style.display = "none";
      MercuryAnim[0].innerHTML = "Cambia Texture";
    }
  //VENERE
  if(idPlanet.id == 15){
    document.getElementById("VenusInfo").style.display = "none";
  }
  if(idPlanet == scene){
    document.getElementById("MercuryInfo").style.display = "none";
    document.getElementById("VenusInfo").style.display = "none";
  }
  
  //URANO
  
  //----------------------------------------------------------------------------------------------------------------------------
  }
  
  function nuovascena(id){
    flagScene = true;
      document.getElementById("rightMenu").style.display = "none";
      document.getElementById("title").style.display = "none";
      document.getElementById("MercuryInfo").style.display = "none";
      const scene2 = new THREE.Scene();
      const sceneOriginal = new THREE.Scene();
     
      scene.position.set(0,0,0);
      scene = scene2;
      
    
      
     
     
    if(id == 13){
        
        const color = 0xaaaaaa;
        const intensity = 1;
        const light = new THREE.AmbientLight(color, intensity);
        let groundMaterial = new THREE.MeshStandardMaterial( { map: groundTexture } );
        const terrainGeometry = new THREE.BoxGeometry(550,550,10 );
        const terrainMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const terrain = new THREE.Mesh( terrainGeometry, groundMaterial );
        scene.add(light);
/*
        const ballGeometry = new THREE.SphereGeometry( 10, 32, 16 );
        const ballMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        ball = new THREE.Mesh( ballGeometry, ballMaterial );
        ball.position.set(0,10,0);
*/
        

       terrain.position.y = 0.0;
	     terrain.rotation.x = - Math.PI /2 ;
       // scene.add( ball );
        //scene.add( terrain );
        const loader = new THREE.CubeTextureLoader(loadingManager);
        const sky = new THREE.TextureLoader(loadingManager).load( "assets/background/mercurySky.jpg" );
        //scene.background = sky;
        console.log(camera2);
        console.log(scene);


/*
     

      function initCannon() {

          world = new CANNON.World();
          world.gravity.set(0,0,0);
          world.broadphase = new CANNON.NaiveBroadphase();
          world.solver.iterations = 10;

          shape = new CANNON.Box(new CANNON.Vec3(1,1,1));
          mass = 1;
          body = new CANNON.Body({
            mass: 1
          });
          body.addShape(shape);
          body.angularVelocity.set(0,10,0);
          body.angularDamping = 0.5;
          world.addBody(body);

      }

      
      initCannon();
      geometry = new THREE.BoxGeometry( 2, 2, 2 );
      material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

      mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh );

      */

      // Creating a physics World

       physicsWorld = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0),          // Setting Gravity
      });

      // create a ground body with a static plane

      const groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        // infinte geometric plane
        shape: new CANNON.Plane(),
      });
      // rotate ground body by 90 degrees
      groundBody.position.x= -Math.PI / 2 ;
      physicsWorld.addBody(groundBody);

      // create a sphere and set it at y=10
        const radius = 20;
        phyBall1 = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Sphere(radius),
        });
        phyBall1.position.set(0, 10, 0);
        physicsWorld.addBody(phyBall1);

        // Building Real Ball

        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshNormalMaterial();
        realBall1 = new THREE.Mesh(geometry, material);
        realBall1.position.set(0,10,0);
        scene.add(realBall1);
        console.log(phyBall1);
        console.log(realBall1);
        //console.log(ball);
        
    

        




      
    }
     
      
  }
  MenuButton(objects);
  
  


/**************************************************************************************************************** */


    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({canvas});
    renderer.autoClearColor = true;
    let fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = -70;
    camera.position.y = 160;
    camera.position.x = 0;

    let camera2 = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera2.position.z = -30;
    camera2.position.y = 0;
    camera2.position.x = 0;
    //camera2.lookAt(0,0,0);

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

    if(flagScene){
        
        //ball.position.y +=1;
        physicsWorld.step(1/60);
        realBall1.position.copy(phyBall1.position);
        realBall1.quaternion.copy(phyBall1.quaternion);
        //realBall1.position.y-=1;

        renderer.render(scene, camera2);
        console.log(realBall1.position);
       // console.log(phyBall1.position);
    }
    else{
        bloomComposer.render();
    }

    
    
    
    
}

renderer.setAnimationLoop(animate);
