import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import PlayerControls from './PlayerControls';

class BasicScene {
    constructor() {
        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.physicsWorld = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0),
        });

        this.createCamera();
        this.createRenderer();
        this.addLights();
        this.createObjects();
        this.createControls();
        this.animate();
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1, 2);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    /**
     * Adds ambient and directional lights to the scene.
     */
    addLights() {
        const ambientLight = new THREE.AmbientLight(0xf0f0f0);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 100, 6);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.rotateX(-Math.PI / 2);
        this.scene.add(directionalLight);
    }

    /**
     * Creates and sets up the first-person controls.
     */
    createControls() {
        this.controls = new PlayerControls(this.camera, this.renderer.domElement);
    }

    /**
     * Creates floating 3D objects and a ground plane with basic collision detection.
     */
    createObjects() {
        // Ground
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x00aa00 });
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;
        this.scene.add(groundMesh);

        // Ground physics
        const groundBody = new CANNON.Body({
            mass: 0, // static
            shape: new CANNON.Plane(),
            material: new CANNON.Material({ friction: 0.5, restitution: 0.7 }),
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.physicsWorld.addBody(groundBody);

        // Floating objects
        const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x00ffff });
        const boxGeometry = new THREE.BoxGeometry();
        for (let i = 0; i < 1000; i++) {
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
            boxMesh.position.set(Math.random() * 100 - 50, Math.random() * 50 + 20, Math.random() * 100 - 50);
            this.scene.add(boxMesh);

            // Box physics
            const boxBody = new CANNON.Body({
                mass: 1,
                shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
                material: new CANNON.Material({ friction: 0.5, restitution: 0.7 }),
            });
            boxBody.position.copy(boxMesh.position);
            this.physicsWorld.addBody(boxBody);
        }
    }

    /**
     * Animation loop for the scene.
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        this.physicsWorld.step(delta);
        this.controls.update(delta); // Make sure this is being called
        this.renderer.render(this.scene, this.camera);
    }

}

export default BasicScene;
