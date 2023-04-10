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
let myClassObject=[];


let blocker = document.getElementById('blocker');
let instructions = document.getElementById('instructions');


init();
animate();

function init() {

	// =============== BASCI SETTING ===============
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

	// =============== OBJECTS ===============

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
	// myClassObject.push(waterMesh);

	//  ######### 2. Clouds #########
	
	// for (let i = 0; i < 2; i++) {
	
	// 	let cloudGeo = new THREE.PlaneGeometry(300, 300);
	// 	let cloudTexture = new THREE.TextureLoader().load("/smoke-1.png")
	// 	let cloudMaterial = new THREE.MeshBasicMaterial({
	// 		color: 0x0084ff,
	// 		map: cloudTexture,
	// 		transparent: true,
	// 		opacity: 0.09
	// 		});
	
	// 	for (let i = 0; i < 10; i++) {
	// 	let cloudMesh = new THREE.Mesh(cloudGeo, cloudMaterial);
	// 	cloudMesh.position.set(
	// 			// x,y,z
	// 			(Math.random()-0.5) * 3000 ,
	// 			(Math.random()-0.5) * 200 +800 ,
	// 			(Math.random()-0.5) * 3000 
	// 			);
	// 	cloudMesh.rotateZ( Math.random() * 4000);
	// 	cloudMesh.quaternion.copy(camera.quaternion);
	// 			myObjects.push(cloudMesh);
	// 			scene.add(cloudMesh);
	// 	}
	
	
	
	for (let i = 0; i < 10; i++) {
		let ClassObject = new cloud(
			(Math.random() - 0.5) * i * 1000,
			(Math.random() - 0.5) * 1 * 40 + 400,
			(Math.random() - 0.5) * i * 1000,
			scene);
			// scene.add(ClassObject);
			myClassObject.push(ClassObject);
		}
	
		console.log(myClassObject);

	addSpatialAudio();

// control
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

mouse = new THREE.Vector2(0, 0);
let raycaster = new THREE.Raycaster();




//   raycaster.layers.set(2); // only detect intesections on the 2nd layer

document.addEventListener(
    "mousemove",
    (ev) => {
//       // three.js expects 'normalized device coordinates' (i.e. between -1 and 1 on both axes)
      mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;

//       // update our raycaster
	//   planeNormal.copy(camera.position).normalize();
	//   plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
  
	  raycaster.setFromCamera(mouse,camera);
// 	//   raycaster.ray.intersectPlane(plane, intersectionPoint);

//       // run an intersection check with the grid objects
	//   const intersects = raycaster.intersectObjects(scene.children, true);
	  const intersects = raycaster.intersectObjects(myClassObject);
	  if ( intersects.length > 0 ) {
		console.log('catch');
	  }
// 	  console.log(scene.children);

// 	//   console.log(intersects);

// 	//   for (let i = 0; i < myClassObject.length; i++) {
//     //     myClassObject[i].position.y = 0;
//     //   }

	

    },
    false
  );

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
	let audioLoader = new THREE.AudioLoader();

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

//window Resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}