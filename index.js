import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {FirstPersonControls} from 'three/addons/controls/FirstPersonControls.js';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';
import {cloud} from "/cloud.js";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

let camera, scene, renderer;

//control
let controls, // Point Lock
	raycaster,
    control; //

//helper
// let gridHelper, 
	// axesHelper;

//plane
let geometry, texture, material, waterMesh;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();


// //cloud
// let cloudGeo, cloudTexture, cloudMaterial ;

//clock
//https://discoverthreejs.com/book/first-steps/animation-loop/

let clock;

//add audio
let audioListener;
let audioListenerMesh;
// let audioSources = [];
let object = [];


const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

init();
animate();

function init() {

	// clock = new THREE.Clock();

	camera = new THREE.PerspectiveCamera(
		60,
		window.innerWidth / window.innerHeight,
		1,
		5000);

	camera.position.y = 300;
	camera.position.z = 1000;


	// raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);


	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xE9F1FF);
	scene.fog = new THREE.FogExp2(0xE9F1FF, 0.0007);

	addSpatialAudio();

	// gridHelper = new THREE.GridHelper(20000, 50, 0xffffff, 0xffffff);
	// axesHelper = new THREE.AxesHelper(2000);

	// scene.add(gridHelper,
		//   axesHelper
	// );



	renderer = new THREE.WebGLRenderer();

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);


//~~~~~ first person control ~~~~~~
// control = new FirstPersonControls(camera, document.body);
// control.movementSpeed = 500;
// control.lookSpeed = 0.05;

//~~~~~ orbitControl ~~~~~~
// control = new OrbitControls(camera, renderer.domElement);

//~~~~~ PointerLockControls ~~~~~~
controls = new PointerLockControls(camera, document.body);

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

scene.add( controls.getObject() );

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

		case 'Space':
			if ( canJump === true ) velocity.y += 350;
			canJump = false;
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


	//~~~~~~~~~~~~~~ Water Plane ~~~~~~~~~~~~~~

	geometry = new THREE.PlaneGeometry(20000, 20000);
	geometry.rotateX(-Math.PI / 2);

	//load the texture -> a matarial
	texture = new THREE.TextureLoader().load('/whitesky.jpg');
	material = new THREE.MeshBasicMaterial({
		color: 0xC9DEFF,
		map: texture,
	});

	waterMesh = new THREE.Mesh(geometry, material);
	waterMesh.rotation.y = Math.random() * 2000;

	scene.add(waterMesh);

	for (let i = 0; i < 100; i++) {
		let myClassObject = new cloud(
			(Math.random() - 0.5) * i * 600,
			(Math.random() - 0.5) * 1 * 400 + 700,
			(Math.random() - 0.5) * i * 600,
			scene);
		object.push(myClassObject);
	}



}


//~~~~~~~~~~~~~~~add sound~~~~~~~~~~~~~~~~~~
function addSpatialAudio() {
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

	// create an audio loader which will load our audio files:
	const audioLoader = new THREE.AudioLoader();

	// then let's add some audio sources

	let audiomesh = new THREE.Mesh(
		new THREE.SphereGeometry(10000, 12, 12),
		new THREE.MeshBasicMaterial({
			color: "blue"
		})
	);

	let audioSource = new THREE.PositionalAudio(audioListener);

	// load the audio file into the positional audio source
	audioLoader.load("wind_sound.mp3", function (buffer) {
		audioSource.setBuffer(buffer);
		// audioSource.setDistanceModel("exponential");
		// audioSource.setRefDistance(0.5);
		// audioSource.setRolloffFactor(3);
		audioSource.setLoop(true);
		audioSource.setVolume(0.6);
		audioSource.play();

	});

	audiomesh.add(audioSource);
	scene.add(audiomesh);
	//   audioSources.push(mesh);

}






function animate() {
	// render();
	// const delta = clock.getDelta();
	requestAnimationFrame(animate);


	const time = performance.now();

	if ( controls.isLocked === true ) {

		const delta = ( time - prevTime ) / 100;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		direction.z = Number( moveForward ) - Number( moveBackward );
		direction.x = Number( moveRight ) - Number( moveLeft );
		direction.normalize(); // this ensures consistent movements in all directions

		if ( moveForward || moveBackward ) velocity.z -= direction.z * 1000.0 * delta;
		if ( moveLeft || moveRight ) velocity.x -= direction.x * 1000.0 * delta;


		controls.moveRight( - velocity.x * delta );
		controls.moveForward( - velocity.z * delta );
		// controls.moveLeft( - velocity.x * delta );
		// controls.moveBackward( - velocity.z * delta );
		// controls.getObject().position.y += ( velocity.y * delta ); 

	}



	// for (let i = 0; i < object.length; i++) {
	// 	object[i].update();
	// }

	// let delta = clock.getDelta();
	// control.update(delta);


	prevTime = time;
	renderer.render(scene, camera);
	// render();
}

function render() {

	// let delta = clock.getDelta();
	//first person

	//orbit
	// control.update(delta);

	// prevTime = time;
	// renderer.render(scene, camera);

}

// init();


//window Resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}