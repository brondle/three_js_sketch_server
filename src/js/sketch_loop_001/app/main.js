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
import {importSTLModel} from 'components/Three/importSTLModel.js'
import {initPhysics, createParalellepipedWithPhysics, createRigidBody, updatePhysics } from 'components/Three/Physics/PhysicsUtils.js'
import {createText} from 'components/Three/createText.js'
import { randomColor } from 'randomcolor'
import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json'
			// Physics variables
// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
let physicsWorld
const clock = new THREE.Clock()

  let textMat = new THREE.MeshStandardMaterial({color: 'black'})
export default class Sketch {
    constructor() {
      this.render = this.render.bind(this) //bind to class instead of window object
      this.setup = this.setup.bind(this)
      this.animate = this.animate.bind(this)
      this.addObjects = this.addObjects.bind(this)
      this.loadPhysics = this.loadPhysics.bind(this)
      this.initPhysics = initPhysics.bind(this)
      this.updatePhysics = updatePhysics.bind(this)

       // set up scene
      this.setup()
      this.loadPhysics()
    }

setup() {
  // CLOCK
        this.clock = new THREE.Clock()
  // CAMERA
        this.camera = createCamera()
        this.camera.position.set(0, 3, 15)
        // SCENE & RENDER
        this.renderer = createRenderer();
				this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.scene = new THREE.Scene();
        //EFFECTS
       //LIGHTS
        const color = 0xFFFFFF
        const intensity = 0.75
        this.light = createLights({color: color, intensity: intensity})
        this.light[0].position.set(0, 100, 50)
        this.light[0].castShadow = true
        this.scene.add(this.light[0])
//        this.scene.add(new THREE.AmbientLight({color: 'white', intensity: 0.5}))

        //BACKGROUND & FOG
        this.textureLoader = new THREE.TextureLoader()
        let backgroundImg = this.textureLoader.load('/three/studio-bg.jpg')
        this.scene.background = backgroundImg
        // CONTROLS
        this.controls = createControls(this.camera, this.renderer)
  //    this.controls.target.set(0, 0, 0)
  let text = createText("While X is less than 50, draw a crab.\n X = ", helvetiker, textMat, 0.004);
  text.position.y = 5
  this.scene.add(text)
     }
    async loadPhysics() {

				Ammo = await Ammo();
        physicsWorld = this.initPhysics();

				const pos = new THREE.Vector3();
				const quat = new THREE.Quaternion();

				// Ground
				pos.set( 0, - 0.5, 0 );
				quat.set( 0, 0, 0, 1 );
				const ground = createParalellepipedWithPhysics( 40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
				ground.castShadow = true;
				ground.receiveShadow = true;
      const material = new THREE.MeshLambertMaterial();

				const matrix = new THREE.Matrix4();
				const color = new THREE.Color();
      let crab;
      const addSTLModel = (geo, mat) => {
        geo.scale(0.015, 0.015, 0.015);
        let i = 0;

   let dadcrab = new THREE.Mesh(geo, mat)
        dadcrab.castShadow = true
        const crabShape = new Ammo.btSphereShape(0.5);
        const crabMass = 0.05
        let updatingText;
        setInterval(() => {
          if (i <= 50) {
          if (updatingText != undefined) {
          this.scene.remove(updatingText)
          }
   updatingText = createText(i.toString(), helvetiker, textMat, 0.004);
  updatingText.position.y = 4.7
          updatingText.position.x = -3
          this.scene.add(updatingText)
     let crab = dadcrab.clone()
        crab.position.set(pos)
      let newMat = new THREE.MeshPhongMaterial({color: randomColor()})
     crab.material = newMat;
        pos.set(getRandomArbitrary(-7, 7), 5, 0)
        this.scene.add(crab)
        createRigidBody(crab,  crabShape, crabMass, pos, quat)
       i++
   }
 }, getRandomArbitrary(100, 500))
        return crab
      }
      let crabMat = new THREE.MeshLambertMaterial({color: 'red'})
        importSTLModel('/three/models/Crab_t.stl', crabMat, addSTLModel)
        this.addObjects()
      this.render()
      function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
      }

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
          const deltaTime = clock.getDelta()
          this.updatePhysics(deltaTime)
          this.renderer.render(this.scene, this.camera)
          this.composer.render()
    }
}


