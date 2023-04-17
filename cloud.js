import * as THREE from "three";

export class cloud{

    constructor(x, y, z, scene, id){

    let cloudGeo = new THREE.PlaneGeometry(300, 300);
	let cloudTexture = new THREE.TextureLoader().load("/smoke-1.png")
	let cloudMaterial = new THREE.MeshBasicMaterial({
		color: 0x0084ff,
		map: cloudTexture,
		transparent: true,
		opacity: 0.05
		});




	for (let i = 0; i < 10; i++) {
		this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMaterial);
		this.cloudMesh.position.set(
            // x,y,z
            (Math.random()-0.5) * 200 + x,
            (Math.random()-0.5) * 100 + y,
            (Math.random()-0.5) * 100 + z

			);
		

	// 	this.center = new THREE.Vector3(
	// (Math.random()-0.5) * 200 + x,
	// (Math.random()-0.5) * 100 + y,
	// (Math.random()-0.5) * 100 + z);

        this.cloudMesh.rotateZ( Math.random() * 4000);
			
		scene.add(this.cloudMesh);
        this.frameCount = 0;
	
		}

		//display information
        this.popup = false;
        this.id = id;
    }

    update() {

            this.frameCount++;
            this.cloudMesh.rotateZ(1);

            }


// checkDistance(camera) {
// 	let d = camera.position.distanceTo(this.center);
// 	console.log(d);
// 	if (d < 50) {
// 		this.popup = true;
// 		console.log('catch');
// 	} else {
// 		this.popup = false;
	// }
// 	}

}