import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import * as CANNON from 'cannon-es';

/**
 * Sets up a basic Three.js scene with a first-person camera, a ground plane, and floating 3D objects with basic collision detection.
 */
class BasicScene {
    constructor() {
        this.init();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.addEventListeners();
    }
    /**
     * Initializes the scene, camera, renderer, controls, physics world, and objects.
     */
    init() {
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.physicsWorld = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0), // Earth's gravity in the Y direction
        });

        this.createCamera();
        this.createRenderer();
        this.addLights();
        this.createControls();
        this.createObjects();
        this.animate();
    }

    /**
     * Creates the camera and sets its position.
     */
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1, 2);
    }

    /**
     * Creates the WebGL renderer.
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    /**
     * Adds ambient and directional lights to the scene.
     */
    addLights() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 10, 6);
        this.scene.add(directionalLight);
    }

    /**
     * Creates and sets up the first-person controls.
     */
    createControls() {
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
        document.addEventListener('click', () => {
            this.controls.lock();
        }, false);
    }

    /**
     * Creates floating 3D objects and a ground plane with basic collision detection.
     */
    createObjects() {
        // Ground
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
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
        const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        const boxGeometry = new THREE.BoxGeometry();
        for (let i = 0; i < 10; i++) {
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
            boxMesh.position.set(Math.random() * 10 - 5, Math.random() * 5 + 2, Math.random() * 10 - 5);
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

    addEventListeners() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;
            }
        }, false);

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;
            }
        }, false);
    }

    /**
     * Animation loop for the scene.
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        this.physicsWorld.step(delta);

        if (this.controls.isLocked === true) {
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize(); // this ensures consistent movements in all directions

            if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta;
            if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta;

            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

new BasicScene();
