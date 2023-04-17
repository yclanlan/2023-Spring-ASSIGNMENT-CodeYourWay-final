import * as THREE from 'three';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';
import {FirstPersonControls} from 'three/addons/controls/FirstPersonControls.js';
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
let CloudObjectArray=[];


let blocker = document.getElementById('blocker');
let instructions = document.getElementById('instructions');



init();
animate();

function init() {

// ============================ BASIC SETTING ==============================

	camera = new THREE.PerspectiveCamera(60,
		window.innerWidth / window.innerHeight,
		1,5000);

	camera.position.y = 400;
	camera.position.z = 1000;
	
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xE9F1FF);
	scene.fog = new THREE.FogExp2(0xE9F1FF, 0.0007);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);

// ============================== OBJECTS ==============================

	// #########  1. Water Plane   #########
	geometry = new THREE.PlaneGeometry(20000, 20000);
	geometry.rotateX(-Math.PI / 2);

	texture = new THREE.TextureLoader().load('/whitesky.jpg');
	material = new THREE.MeshBasicMaterial({
		// color: 0xC9DEFF,
		color: "rgb(200,220,250,10)",
		map: texture,
	});

	waterMesh = new THREE.Mesh(geometry, material);
	waterMesh.rotation.y = Math.random() * 2000;
	waterMesh.position.y = -300;
	scene.add(waterMesh);


	//  ######### 2. Clouds #########
	// const names = [ 'cloud01','cloud02','cloud03','cloud04','cloud05','cloud06', 'cloud07', 'cloud08','cloud09','cloud10']
	const names = [ 
		"The Vanishing Act <br> The clouds that once hung overhead <br> Now fade away like dreams once dreamed <br> Their wispy forms, like fading ghosts<br> Disappear into the blue expanse",
		"The Heavy Heart <br> Grey clouds loom above like weights,<br> Heavy with sorrow and despair.<br> They mirror the heart's heavy ache <br> A burden too great to bear.",
		"The Lost Wanderer <br>The clouds are a guide for the lost,<br>A beacon in the sky's vast expanse.<br>They lead the way through storm and frost,<br>A compass for the wandering nomad.",
		"The Reflection <br>The clouds reflect the soul's turmoil,<br>A mirror of our innermost fears.<br>Their fleeting forms a constant reminder,<br>That all must pass, even our tears.",
		"The Love Letter<br>The clouds above, a love letter to the earth,<br>A tender embrace from heaven's berth.<br>Their gentle touch, a reminder of grace,<br>A promise that love never leaves its place.",
		"The Hopeful<br>The clouds above, a sign of hope,<br>A symbol of a brighter tomorrow.<br>Their fleeting nature a testament,<br>To the ever-changing nature of our sorrows.",
		"The Starry Night<br>The clouds above, a canvas of the night,<br>A backdrop for the stars' brilliant light.<br>Their fleeting forms a reminder,<br>That even the sky can change in time.",
		"The Journey<br>The clouds above, a journey through life,<br>A metaphor for all that we strive.<br>Their ever-changing forms a lesson,<br>That in life, we must learn to listen.",
		"The Whispering Wind<br>The clouds that sail on the whispering wind,<br>Carry with them secrets yet to be revealed.<br>Their silent forms, a messenger of fate,<br>A hint of what lies ahead, a promise to wait.",
		"The Freedom<br>The clouds above, a symbol of freedom,<br>A reminder that our minds can roam.<br>Their ever-changing forms, a release,<br>From the cages that bind us to our homes."
]

	 
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

	// addSpatialAudio();

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
// if (CloudObjectArray!= null){
let cloudMeshArray = CloudObjectArray.map((cloud)=>cloud.cloudMesh)
const intersects = raycaster.intersectObjects( cloudMeshArray );
console.log(controls);
// console.log(found);


if ( intersects.length > 0 && controls.isLocked ==true) { // hit
	let found = CloudObjectArray.find( (cloud) => { return cloud.cloudMesh === intersects[0].object});
	
	// info.style.fontSize = '5vh';
	// info.style.color = 'black';
	// info.style.animation =  "fadeInAnimation, ease, 3s"; 
	info.innerHTML =  found.name; 
	//  ...[ 0 ]  first intersected object
	console.log(intersects);
	console.log(found);
	// console.log( intersects[ 0 ].object.name + 'hit');
	
} else {
	
	info.style.fontSize = '1.9vh';
	info.style.color = 'black';
	info.innerHTML = '';
	
	
}},false);
	
// ============================== CONTROL ==============================

controls = new PointerLockControls(camera, document.body);
initHTMLlayer();
initControlMove();

};

//============================== SOUND ==============================

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
	

	// 2. create a source
	let audioSource = new THREE.PositionalAudio(audioListener);
	

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


	//4. add source to mesh!
	let audiomesh = new THREE.Mesh(
		new THREE.SphereGeometry(10000, 12, 12),
		new THREE.MeshBasicMaterial({
			color: "blue"
		})
	);

	audiomesh.add(audioSource);
	audiomesh.visible = false;
	scene.add(audiomesh);

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
	
	controls.update(time);

	renderer.render( scene, camera );



}



//window Resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	};

//edit text

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



async function getData() {
    const requestURL = "./poem.json";
    const request = new Request(requestURL);
    const response = await fetch(request);
    data = await response.json();

    if (data.length > 0) {

        for (let i = 0; i < data.length; i++) {
            let p = new Portal(i * 20 - data.length * 20 / 2, 5, i * 20 - data.length * 20 / 2, scene, i);
            let particle_num = data[i].comments.length;
            p.centerFrame();
            p.createParticles(particle_num);
            portals.push(p);
        }
    }
}


	function populateInfo(data) {
		if (data) {
			let container = document.querySelector("#info");
			container.style.display = "block";
	
			let title = document.createElement("h1");
			let author = document.createElement("h2");
	
			title.textContent = data.name;
			author.textContent = data.author;
	
			container.appendChild(title);
			container.appendChild(author);
			container.appendChild(isbn);
			container.appendChild(status);
		}
	}
	
	function populateComment(data) {
		if (data) {
	
			let container = document.querySelector("#commentContainer");
			let header = document.createElement("h2");
			header.textContent = "activity logs";
			container.appendChild(header);
	
			container.style.display = "block";
			for (let i = 0; i < data.comments.length; i++) {
	
				let p = document.createElement("p");
				p.className = "comment"
				p.textContent = data.comments[i];
				container.appendChild(p);
	
	
			}
	
		}
	}