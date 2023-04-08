import * as THREE from "three";

export class cloud{

    constructor(x, y, z, scene){

    let cloudGeo = new THREE.PlaneGeometry(300, 300);
	let cloudTexture = new THREE.TextureLoader().load("/smoke-1.png")
	let cloudMaterial = new THREE.MeshBasicMaterial({
		color: 0x0084ff,
		map: cloudTexture,
		transparent: true,
		opacity: 0.09
		});


	for (let i = 0; i < 10; i++) {
		this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMaterial);
		this.cloudMesh.position.set(
            // x,y,z
            (Math.random()-0.5) * 200 +x,
            (Math.random()-0.5) * 100 + y,
            (Math.random()-0.5) * 100 +z
			// (Math.random()-0.5) * 2,
			// 300+Math.random() * 4,
			// (Math.random()-0.5) * 2
			);

        this.cloudMesh.rotateZ( Math.random() * 4000);
			
			scene.add(this.cloudMesh);
            this.frameCount = 0;
	
			}
    }

    update() {

            this.frameCount++;
            
            this.cloudMesh.rotateZ(0.001);
            // this.cloudMesh.rotateY(0.05);
            // this.cloudMesh.rotation.x = 5000;
			// this.cloudMesh.rotation.y = 5000;
			// this.cloudMesh.rotation.z = Math.random() *1000;
	
            }
}