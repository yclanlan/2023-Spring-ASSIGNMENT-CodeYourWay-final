import * as THREE from 'three';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';
import {cloud} from "/cloud.js";


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
let audioListenerMesh;
let myObjects=[];
let CloudObjectArray=[];


let blocker = document.getElementById('blocker');
let instructions = document.getElementById('instructions');


init();
animate();

function init() {

// ============================ BASCI SETTING ==============================

	camera = new THREE.PerspectiveCamera(60,
		window.innerWidth / window.innerHeight,
		1,5000);

	camera.position.y = 300;
	camera.position.z = 1000;
	
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xE9F1FF);
	scene.fog = new THREE.FogExp2(0xE9F1FF, 0.0007);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);

// ============================== OBJECTS ==============================

	// #########1. Water Plane #########
	geometry = new THREE.PlaneGeometry(20000, 20000);
	geometry.rotateX(-Math.PI / 2);

	texture = new THREE.TextureLoader().load('/whitesky.jpg');
	material = new THREE.MeshBasicMaterial({
		color: 0xC9DEFF,
		map: texture,
	});

	waterMesh = new THREE.Mesh(geometry, material);
	waterMesh.rotation.y = Math.random() * 2000;
	scene.add(waterMesh);
	// CloudObjectArray.push(waterMesh);

	//  ######### 2. Clouds #########
	const names = [ 'cloud01','cloud02','cloud03','cloud04','cloud05','cloud06', 'cloud07', 'cloud08','cloud09','cloud10']
	// let index = 0;
	 
	for (let i = 0; i < 10; i++) {
		let ClassObject = new cloud(
			(Math.random() - 0.5) * i * 1000,
			(Math.random() - 0.5) * 1 * 40 + 400,
			(Math.random() - 0.5) * i * 1000,
			scene);
			// scene.add(ClassObject);
			CloudObjectArray.push(ClassObject);
			
			// CloudObjectArray.push({
			// 	names[i]: ClassObject
			// });
		}
		CloudObjectArray.forEach( (obj,i) => { obj['name'] = names[ i ]; } ); 
		// console.log(names);
		console.log(CloudObjectArray);

	addSpatialAudio();

//============================== Raycaster ==============================

mouse = new THREE.Vector2(0, 0);
let raycaster = new THREE.Raycaster();


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
// if (CloudObjectArray!= null){
let cloudMeshArray = CloudObjectArray.map((cloud)=>cloud.cloudMesh)
const intersects = raycaster.intersectObjects( cloudMeshArray );

// console.log(found);


if ( intersects.length > 0 ) { // hit
	let found = CloudObjectArray.find( (cloud) => { return cloud.cloudMesh === intersects[0].object});
	
	info.style.fontSize = '5vh';
	info.style.color = 'black';
	info.innerHTML = ' Hit => ' + found.name; 
	//  ...[ 0 ]  first intersected object
	console.log(intersects);
	console.log(found);
	// console.log( intersects[ 0 ].object.name + 'hit');
	
} else {
	
	info.style.fontSize = '1.9vh';
	info.style.color = 'black';
	info.innerHTML = 'Nothing !';
	
	
}},false);
// }


// names for some objects

// document.addEventListener(
//     "mousemove",
//     (ev) => {
//      // three.js expects 'normalized device coordinates' (i.e. between -1 and 1 on both axes)
//       mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
//       mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;

// 	  raycaster.setFromCamera(mouse,camera);
// 	//  const intersects = raycaster.intersectObjects(scene.children, true);
// 	  const intersects = raycaster.intersectObjects(scene.children);
// 	  if ( intersects.length > 0 ) {
// 		console.log('catch');
// 		console.log(intersects.length);
// 	  }
// 	//console.log(scene.children);
//     },false);
// }
};	
//============================== Sound ==============================

function addSpatialAudio() {

	// ################## LISTENER ##################

	// first lets add our audio listener.  This is our ear (or microphone) within the 3D space.
	audioListener = new THREE.AudioListener();

	// create a 3D mesh so we can see the location of the audio listener
	// this is not strictly necessary, but can be helpful for debugging
	audioListenerMesh = new THREE.Mesh(
		new THREE.BoxGeometry(2, 2, 2),
		new THREE.MeshBasicMaterial({})
	);
	audioListenerMesh.add(audioListener);
	audioListenerMesh.position.set(0, 0, 0);
	scene.add(audioListenerMesh);
	
	// #################### AUDIO ####################
	// LOADER-> LOAD SOURCE TO MESH -> ADD MESH TO SCENE 
	// 1. create an audio loader 
	let audioLoader = new THREE.AudioLoader();
	let audioLoader2 = new THREE.AudioLoader();

	// 2. create a source
	let audioSource = new THREE.PositionalAudio(audioListener);
	let audioSource2 = new THREE.PositionalAudio(audioListener);

	// 3.use loader load the audio file into the positional audio source
	audioLoader.load("wind_sound.mp3", function (buffer) {
	audioSource.setBuffer(buffer);
	// audioSource.setDistanceModel("exponential");
	// audioSource.setRefDistance(0.5);
	// audioSource.setRolloffFactor(3);
	audioSource.setLoop(true);
	audioSource.setVolume(0.6);
	audioSource.play();
	});

	audioLoader2.load("Cloud looking down on two warring cities.mp3", function (buffer) {
		audioSource2.setBuffer(buffer);
		// audioSource.setDistanceModel("exponential");
		// audioSource.setRefDistance(0.5);
		// audioSource.setRolloffFactor(3);
		// audioSource2.setLoop(ture);
		audioSource2.setVolume(0.6);
		audioSource2.play();
	});


	//4. add source to mesh!
	let audiomesh = new THREE.Mesh(
		new THREE.SphereGeometry(10000, 12, 12),
		new THREE.MeshBasicMaterial({
			color: "blue"
		})
	);

	audiomesh.add(audioSource);
	scene.add(audiomesh);


	let audiomesh2 = new THREE.Mesh(
		new THREE.SphereGeometry(15000, 12, 12),
		new THREE.MeshBasicMaterial({
			color: "yellow"

		})
	);
	audiomesh2.visible = false;
	audiomesh2.add(audioSource2);
	audiomesh2.position.x = 100;
	audiomesh2.position.y = 300;
	audiomesh2.position.z = 100;
	scene.add(audiomesh2);

	//   audioSources.push(mesh);


// ============================== CONTROL ==============================

controls = new PointerLockControls(camera, document.body);
scene.add( controls.getObject() );

instructions.addEventListener('click', function () {
controls.lock();
});

controls.addEventListener('lock', function () {
console.log('lock');
instructions.style.display = 'none';
blocker.style.display = 'none';
controls.pointerSpeed = 0.8;

});

controls.addEventListener('unlock', function () {
console.log('unlock');
instructions.style.display = '';
blocker.style.display = 'block';
controls.pointerSpeed = 0;

});

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
		direction.normalize(); // this ensures consistent movements in all directions

		if ( moveForward || moveBackward ) velocity.z -= direction.z * 1000.0 * delta;
		if ( moveLeft || moveRight ) velocity.x -= direction.x * 1000.0 * delta;

		controls.moveRight( - velocity.x * delta );
		controls.moveForward( - velocity.z * delta );

		controls.getObject().position.y += ( velocity.y * delta ); 

	}
	
	prevTime = time;
	renderer.render(scene, camera);


}

function render(){
	
	

	renderer.render( scene, camera );



}



//window Resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	};
