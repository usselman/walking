import {
    Scene,
    Clock,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    TextureLoader,
    RepeatWrapping,
    MeshLambertMaterial,
    PlaneGeometry,
    Mesh,
    BoxGeometry,
    SphereGeometry,
    MeshBasicMaterial,
    EquirectangularReflectionMapping,
} from 'three';
import * as CANNON from 'cannon-es';
import PlayerControls from './PlayerControls';
import { calculateRandomRange } from './utils/utility';
import skyboxPx from './assets/materials/sky.jpg';


class BasicScene {
    constructor() {
        this.init();
        this.boxMeshes = [];
        this.animate = this.animate.bind(this);
    }

    async init() {
        this.scene = new Scene();
        this.clock = new Clock();
        this.physicsWorld = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0),
        });

        // Initialize the TextureLoader instead of CubeTextureLoader for a single image
        const loader = new TextureLoader();

        try {
            const texture = await new Promise((resolve, reject) => {
                loader.load(skyboxPx, (loadedTexture) => {
                    loadedTexture.mapping = EquirectangularReflectionMapping;
                    resolve(loadedTexture);
                }, undefined, reject);
            });

            this.scene.background = texture;
        } catch (error) {
            console.error('An error occurred while loading the skybox:', error);
        }


        this.createCamera();
        this.addLights();
        this.createRenderer();
        this.createObjects();
        this.createControls();
        this.animate();
    }

    createCamera() {
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(50, 8, 100);
    }

    createRenderer() {
        this.renderer = new WebGLRenderer(
            { canvas: document.getElementById('c') },
        );

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    addLights() {
        const ambientLight = new AmbientLight(0xb0b0b0);
        this.scene.add(ambientLight);

        const directionalLight = new DirectionalLight(0x000fff, 1.0);
        directionalLight.position.set(100, 50, 6);
        directionalLight.castShadow = true;
        //directionalLight.rotateX(-Math.PI / 2);
        this.scene.add(directionalLight);
    }

    createControls() {
        this.controls = new PlayerControls(this.camera, this.renderer.domElement);
    }

    createObjects() {
        const grassTexturePath = new URL('./assets/materials/mw.jpg', import.meta.url);
        const boxTexturePath = new URL('./assets/materials/mw.jpg', import.meta.url);

        const loader = new TextureLoader();

        loader.load(grassTexturePath.href, (texture) => {
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
            texture.repeat.set(10, 10);

            const groundMaterial = new MeshLambertMaterial({ map: texture });
            const groundGeometry = new PlaneGeometry(10000, 10000, 1, 1);

            const vertices = groundGeometry.attributes.position.array;
            for (let i = 0; i <= vertices.length; i += 100) {
                vertices[i + 2] = Math.random() * 10 - 5;
            }
            groundGeometry.computeVertexNormals();

            const groundMesh = new Mesh(groundGeometry, groundMaterial);
            groundMesh.rotation.x = -Math.PI / 2;
            groundMesh.receiveShadow = true;
            this.scene.add(groundMesh);
        });

        loader.load(boxTexturePath.href, (texture) => {
            const boxMaterial = new MeshLambertMaterial({ map: texture });
            const sphereGeometry = new SphereGeometry(5, 250, 50);

            for (let i = 0; i < 500; i++) {
                const boxMesh = new Mesh(sphereGeometry, boxMaterial);
                boxMesh.position.set(calculateRandomRange(-1000, 1000), calculateRandomRange(-500, 500), calculateRandomRange(-500, 500));
                this.scene.add(boxMesh);
                this.boxMeshes.push(boxMesh); // This should work correctly now

                const boxBody = new CANNON.Body({
                    mass: 1,
                    shape: new CANNON.Box(new CANNON.Vec3(5, 5, 5)), // Adjusted to match BoxGeometry size
                    material: new CANNON.Material({ friction: 0.5, restitution: 0.7 }),
                });
                boxBody.position.copy(boxMesh.position);
                this.physicsWorld.addBody(boxBody);
            }
        });
    }


    animate = () => {
        const delta = this.clock.getDelta();
        this.physicsWorld.step(delta);
        this.controls.update(delta);
        this.boxMeshes.forEach((boxMesh) => {
            boxMesh.rotation.x += delta; // Adjust the rotation speed if necessary
            boxMesh.position.y += delta;
            boxMesh.position.z -= delta;
        });
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
    }
}

export default BasicScene;
