// Global imports -
import * as THREE from 'three';
import {createCamera} from 'components/Three/camera.js'
import {createLights} from 'components/Three/lights.js'
import {createRenderer} from 'components/Three/renderer.js'
import {createControls, addToGUI} from 'components/Three/controls.js'
import { randomColor } from 'randomcolor'
//GUI
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
//PostProcessing
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
import { getRandomInt } from 'utils/RandomInt.js'

import {spriteDialogueBox } from 'components/Three/createSpriteText.js'

export default class Sketch {
    constructor() {
      this.render = this.render.bind(this) //bind to class instead of window object
      this.setup = this.setup.bind(this)
      this.animate = this.animate.bind(this)
      this.addObjects = this.addObjects.bind(this)

       // set up scene
      this.setup()
      this.addObjects()
      this.render()

    }

setup() {
  // CLOCK
        this.clock = new THREE.Clock()
  // CAMERA
        this.camera = createCamera()
        this.camera.position.set(0, 0, 100)
        // SCENE & RENDER
        this.renderer = createRenderer();
				this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.scene = new THREE.Scene();
        //EFFECTS
       //LIGHTS
        const color = 0xFFFFFF
        const intensity = 1
        this.light = createLights({color: color, intensity: intensity})
        this.light[0].position.set(0, 100, 50)
        this.light[0].castShadow = true
        this.scene.add(this.light[0])
//        this.scene.add(new THREE.AmbientLight({color: 'white', intensity: 1}))

        //BACKGROUND & FOG
        this.textureLoader = new THREE.TextureLoader()
        let backgroundImg = this.textureLoader.load('/three/studio-bg.jpg')
        this.scene.background = backgroundImg
        // CONTROLS
        this.controls = createControls(this.camera, this.renderer)
  //    this.controls.target.set(0, 0, 0)
     }


    addObjects() {
        // effects
        this.composer = new EffectComposer( this.renderer);
        this.composer.addPass( new RenderPass( this.scene, this.camera ) );
        this.composer.addPass(new FilmPass(0.75, 0.4, 8, 0))
        let gui = new GUI();
        let knotGeometry = new THREE.TorusKnotGeometry(15, 3, 100, 16)
        let knotMaterial = new THREE.MeshPhongMaterial({color: randomColor()})
        let knot = new THREE.Mesh(knotGeometry, knotMaterial)
        let gui_stuff = {
          newKnot: function() {
          knot.geometry.dispose()
          knot.material.dispose()
          knot.geometry = new THREE.TorusKnotGeometry(getRandomInt(10, 15), getRandomInt(1, 10), getRandomInt(24, 148), getRandomInt(4, 16), getRandomInt(1, 10), getRandomInt(1, 12));
          knot.material =  new THREE.MeshPhongMaterial({color: randomColor()})
        }
        }
        gui.add(gui_stuff, 'newKnot').name('unknot me, baby')
      this.scene.add(knot);
      let text = spriteDialogueBox('Fig. 6: Torus Knot')
      text.position.y = -30
      this.scene.add(text)
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


