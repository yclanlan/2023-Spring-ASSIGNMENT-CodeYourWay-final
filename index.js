import * as THREE from 'three';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';
import {FirstPersonControls} from 'three/addons/controls/FirstPersonControls.js';
import {cloud} from "./cloud.js";
import {cloud2} from './cloud2.js';
import {cloud3} from './cloud3.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


let camera, scene, renderer;
let controls, raycaster, mouse; 
let geometry, texture, material, waterMesh;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let prevTime = performance.now();
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

let audioListener;
// let audioListenerMesh;
let CloudObjectArray=[];


let blocker = document.getElementById('blocker');
let instructions = document.getElementById('instructions');



init();
animate();

function init() {

// ============================ BASIC SETTING ==============================

	camera = new THREE.PerspectiveCamera(
		30,
		window.innerWidth / window.innerHeight,
		1,
		5000);

	camera.position.y = 400;
	camera.position.z = 1000;
	
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xE9F1FF);
	scene.fog = new THREE.FogExp2(0xE9F1FF, 0.000358);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);

// ============================== OBJECTS ==============================

	// #########  1. Water Plane   #########
	geometry = new THREE.PlaneGeometry(50000, 50000);
	geometry.rotateX(-Math.PI / 2);

	texture = new THREE.TextureLoader().load('/whitesky.jpg');
	material = new THREE.MeshBasicMaterial({
		// color: 0xC9DEFF,
		color: "rgb(200,220,250,100)",
		map: texture,
	});

	waterMesh = new THREE.Mesh(geometry, material);
	waterMesh.rotation.y = Math.random() * 2000;
	waterMesh.position.y = -300;
	scene.add(waterMesh);


	//  ######### 2. Clouds #########
	const poemContent = [ 
		"<h3>The Vanishing Act</h3> 	 The clouds that once hung overhead <br> Now fade away like dreams once dreamed <br> Their wispy forms, like fading ghosts<br> Disappear into the blue expanse",
		"<h3>The Heavy Heart</h3> 		 Grey clouds loom above like weights,<br> Heavy with sorrow and despair.<br> They mirror the heart's heavy ache <br> A burden too great to bear.",
		"<h3>The Lost Wanderer</h3> 	 The clouds are a guide for the lost,<br>A beacon in the sky's vast expanse.<br>They lead the way through storm and frost,<br>A compass for the wandering nomad.",
		"<h3>The Reflection</h3>		 The clouds reflect the soul's turmoil,<br>A mirror of our innermost fears.<br>Their fleeting forms a constant reminder,<br>That all must pass, even our tears.",
		"<h3>The Love Letter</h3>		 The clouds above, a love letter to the earth,<br>A tender embrace from heaven's berth.<br>Their gentle touch, a reminder of grace,<br>A promise that love never leaves its place.",
		"<h3>The Hopeful</h3> 			 The clouds above, a sign of hope,<br>A symbol of a brighter tomorrow.<br>Their fleeting nature a testament,<br>To the ever-changing nature of our sorrows.",
		"<h3>The Starry Night</h3> 		 The clouds above, a canvas of the night,<br>A backdrop for the stars' brilliant light.<br>Their fleeting forms a reminder,<br>That even the sky can change in time.",
		"<h3>Mourning Skies</h3>		 Gray clouds drift in the sky,<br>A somber mood they imply,<br>Heavy with tears they cry,<br>A mournful melody they supply.",
		"<h3>Impending Storm</h3>      	 The clouds gather in the sky,<br> A foreboding sight up high,<br>A storm is coming I sigh,<br>A feeling of impending goodbye.<br>",
		"<h3>Lonely Clouds</h3>			 Wispy clouds float on by,<br>A peaceful scene they imply,<br>But my heart cannot deny,<br>The loneliness I feel inside."
]

	for (let i = 0; i < 3; i++) {
		let ClassObject = new cloud(
			(Math.random() - 0.5)  * 10000,
			(Math.random() - 0.5)  * 100 + 400,
			(Math.random() - 0.5)  * 8000,
			scene,
			);
			
			CloudObjectArray.push(ClassObject);

		}

	for (let i = 0; i < 4; i++) {
		let ClassObject = new cloud2(
			(Math.random() - 0.5)  * 10000,
			(Math.random() - 0.5)  * 100 + 400,
			(Math.random() - 0.5)  * 8000,
			scene,
			// camera.position
			);
			
			CloudObjectArray.push(ClassObject);

		}


	for (let i = 0; i < 3; i++) {
		let ClassObject = new cloud3(
				(Math.random() - 0.5)  * 10000,
				(Math.random() - 0.5)  * 100 + 400,
				(Math.random() - 0.5)  * 8000,
				scene);
				
				CloudObjectArray.push(ClassObject);
	
			}

			CloudObjectArray.forEach( (obj,i) => { obj['name'] = poemContent[ i ]; } ); 
			// console.log(CloudObjectArray);
			
	addSpatialAudio();

//============================== Raycaster ==============================

mouse = new THREE.Vector2(0, 0);
raycaster = new THREE.Raycaster();


document.addEventListener(
	    "mousemove",
	    (ev) => {
	     // three.js expects 'normalized device coordinates' (i.e. between -1 and 1 on both axes)
	      mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
	      mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;

// update the picking ray with the camera and pointer position
raycaster.setFromCamera( mouse, camera );

// calculate objects intersecting the picking ray
// const intersects = raycaster.intersectObjects( scene.children );
// console.log(scene.children)
// console.log(CloudObjectArray);

let cloudMeshArray = CloudObjectArray.map((cloud)=>cloud.cloudMesh)
const intersects = raycaster.intersectObjects( cloudMeshArray );
// console.log(controls); 
// console.log(found);


if ( intersects.length > 0 && controls.isLocked == true) { // hit
	let found = CloudObjectArray.find( (cloud) => { return cloud.cloudMesh === intersects[0].object});
	
	info.style.color = 'black';
	info.innerHTML =  found.name; 
	info.style.display="block";

} else {
	info.innerHTML=" ";
	info.style.display="none";

	
}},false);
	
// ============================== CONTROL ==============================

controls = new PointerLockControls(camera, document.body);
initHTMLlayer();
initControlMove();

};

//============================== SOUND ==============================

function addSpatialAudio() {

	//Listener
	audioListener = new THREE.AudioListener();
	camera.add(audioListener);

	///// background Sound /////
	let audioSource = new THREE.Audio(audioListener);
	let audioLoader = new THREE.AudioLoader();
	// console.log(audioSource);

	audioLoader.load("wind_sound.mp3", 
	function (buffer) {
	audioSource.setBuffer(buffer);
	audioSource.setLoop(true);
	audioSource.setVolume(1.3);
	audioSource.play();
	});


	///// Thunder Sound /////
	let ThunderAudioSound = new THREE.PositionalAudio(audioListener);
	let audioLoader2 = new THREE.AudioLoader();

	audioLoader2.load("ThunderSound.mp3", 
	function (buffer) {
		ThunderAudioSound.setBuffer(buffer);
		ThunderAudioSound.setRefDistance( 50 );
		ThunderAudioSound.setLoop(true);
		ThunderAudioSound.setVolume(2);  
		ThunderAudioSound.play();
		ThunderAudioSound.setMaxDistance(500);
	});

	for(let i=7; i<10 ;i++){
	let audiomesh = new THREE.Mesh(
		new THREE.SphereGeometry(300, 12, 12),
		new THREE.MeshPhongMaterial({color: "red"})
	);

	audiomesh.position.x=(CloudObjectArray[i].cloudMesh.position.x);
	audiomesh.position.y=(CloudObjectArray[i].cloudMesh.position.y);
	audiomesh.position.z=(CloudObjectArray[i].cloudMesh.position.z);

		// console.log(audiomesh.position);
	scene.add(audiomesh);
	audiomesh.add(ThunderAudioSound);
	audiomesh.visible = false;
	};
	

}



function animate() {

	requestAnimationFrame(animate);
	
	const time = performance.now();

	if ( controls.isLocked === true ) {

		const delta = ( time - prevTime ) / 100;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;
		// velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		direction.z = Number( moveForward ) - Number( moveBackward );
		direction.x = Number( moveRight ) - Number( moveLeft );
		direction.normalize(); 
		// this ensures consistent movements in all directions

		if ( moveForward || moveBackward ) velocity.z -= direction.z * 1000.0 * delta;
		if ( moveLeft || moveRight ) velocity.x -= direction.x * 1000.0 * delta;

		controls.moveRight( - velocity.x * delta );
		controls.moveForward( - velocity.z * delta );
		controls.getObject().position.y += ( velocity.y * delta ); 

	}

	CloudObjectArray.forEach( (obj) => { 
		if(obj.cloudMesh.up.distanceTo(camera.position)>1000){
			// console.log(obj.cloudMesh.up.distanceTo(camera.position));
			obj.cloudMesh.lookAt(camera.position) ;	
			}
		} )

	prevTime = time;
	renderer.render(scene, camera);
	


}


//window Resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

	};

function initControlMove(){
	const onKeyDown = function ( event ) {

		switch ( event.code ) {
		
			case 'ArrowUp':
			case 'KeyW':
				moveForward = true;
				break;
		
			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = true;
				break;
		
			case 'ArrowDown':
			case 'KeyS':
				moveBackward = true;
				break;
		
			case 'ArrowRight':
			case 'KeyD':
				moveRight = true;
				break;
		
		}
		};
		const onKeyUp = function ( event ) {
		
		switch ( event.code ) {
		
			case 'ArrowUp':
			case 'KeyW':
				moveForward = false;
				break;
		
			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = false;
				break;
		
			case 'ArrowDown':
			case 'KeyS':
				moveBackward = false;
				break;
		
			case 'ArrowRight':
			case 'KeyD':
				moveRight = false;
				break;
		
		}
		
		};
		
		document.addEventListener( 'keydown', onKeyDown );
		document.addEventListener( 'keyup', onKeyUp );

}

function initHTMLlayer(){

		instructions.addEventListener('click', function () {
		controls.lock();
		});
		
		controls.addEventListener('lock', function () {
		console.log('view control lock to mouse');
		instructions.style.display = 'none';
		blocker.style.display = 'none';
		info.style.display='block';
		controls.pointerSpeed = 0.8;
		
		});
		
		controls.addEventListener('unlock', function () {
		console.log('view control unlock');
		instructions.style.display = '';
		blocker.style.display = 'block';
		info.style.display='none';
		controls.pointerSpeed = 0;
		
		});
}


