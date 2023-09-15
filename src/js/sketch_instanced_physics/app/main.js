// Global imports -
import * as THREE from 'three';
import {createCamera} from 'components/Three/camera.js'
import {createLights} from 'components/Three/lights.js'
import {createRenderer} from 'components/Three/renderer.js'
import {createControls, addToGUI} from 'components/Three/controls.js'
//GUI
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
//PostProcessing
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { AmmoPhysics } from 'three/addons/physics/AmmoPhysics.js';
  let physics, position;

  let boxes, spheres;

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop

export default class Sketch {
    constructor() {
      this.render = this.render.bind(this) //bind to class instead of window object
      this.setup = this.setup.bind(this)
      this.animate = this.animate.bind(this)
      this.addObjects = this.addObjects.bind(this)
      this.loadPhysics = this.loadPhysics.bind(this)

       // set up scene
      this.setup()
      this.loadPhysics()
    }

setup() {
  // CLOCK
        this.clock = new THREE.Clock()
  // CAMERA
        this.camera = createCamera()
        this.camera.position.set(0, 2, 5)
        // SCENE & RENDER
        this.renderer = createRenderer();
				this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.scene = new THREE.Scene();
        //EFFECTS
       //LIGHTS
        const color = 0xFFFFFF
        const intensity = 1.5
        this.light = createLights({color: color, intensity: intensity})
        this.light[0].position.set(0, 100, 50)
        this.light[0].castShadow = true
        this.scene.add(this.light[0])
        this.scene.add(new THREE.AmbientLight({color: 'white', intensity: 1}))

        //BACKGROUND & FOG
        this.textureLoader = new THREE.TextureLoader()
        let backgroundImg = this.textureLoader.load('/three/studio-bg.jpg')
        this.scene.background = backgroundImg
        // CONTROLS
        this.controls = createControls(this.camera, this.renderer)
  //    this.controls.target.set(0, 0, 0)
     }
    async loadPhysics() {

				physics = await AmmoPhysics();
        const floor = new THREE.Mesh(
					new THREE.BoxGeometry( 10, 5, 10 ),
					new THREE.ShadowMaterial( { color: 0x444444 } )
				);
				floor.position.y = - 2.5;
				floor.receiveShadow = true;
				this.scene.add( floor );
				physics.addMesh( floor );
      const material = new THREE.MeshLambertMaterial();

				const matrix = new THREE.Matrix4();
				const color = new THREE.Color();

				// Boxes

				const geometryBox = new THREE.BoxGeometry( 0.075, 0.075, 0.075 );
				boxes = new THREE.InstancedMesh( geometryBox, material, 400 );
				boxes.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
				boxes.castShadow = true;
				boxes.receiveShadow = true;
				this.scene.add( boxes );

				for ( let i = 0; i < boxes.count; i ++ ) {

					matrix.setPosition( Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5 );
					boxes.setMatrixAt( i, matrix );
					boxes.setColorAt( i, color.setHex( 0xffffff * Math.random() ) );

				}

				physics.addMesh( boxes, 1 );
      		setInterval( () => {

					let index = Math.floor( Math.random() * boxes.count );

					position.set( 0, Math.random() + 1, 0 );
					physics.setMeshPosition( boxes, position, index );

				}, 1000 / 60 );

        this.addObjects()
      this.render()

    }

    addObjects() {
        // effects
        this.composer = new EffectComposer( this.renderer);
        this.composer.addPass( new RenderPass( this.scene, this.camera ) );
        let gui = new GUI();
    }
    animate() {
          this.render()
    }
    render(time, i) {
          requestAnimationFrame(this.animate)

          this.renderer.render(this.scene, this.camera)
          this.composer.render()
    }
}


