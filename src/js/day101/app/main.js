// Global imports -
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { randomColor } from 'randomcolor'
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {getRandomInt} from 'components/utils/RandomInt.js'
import {createSky} from 'components/Three/sun.js'
import {createText} from 'components/Three/createText.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json'
import {createCamera} from 'components/Three/camera.js'
import {createLights} from 'components/Three/lights.js'
import {createRenderer} from 'components/Three/renderer.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { createFog} from 'components/Three/fog.js'
import { proceduralTree} from 'components/Three/proceduralTree.js'
import { morph} from 'components/Three/morph.js'
import {createControls, addToGUI} from 'components/Three/controls.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import {raycastSelector, onPointerMove} from 'components/Three/raycastSelector'
import {initPhysics, createPhysicsObjects, initInput, updatePhysics} from 'components/Three/Physics/PhysicsUtils.js'
import { createCity, addBuilding } from 'components/Three/City/city.js'
import { createFloor } from 'components/Three/Floor.js'
import {orbit} from 'components/Three/Physics/orbit.js'
import {createBall} from 'components/Three/ball.js'
import {createParticles, animate} from 'components/Three/particleSystem.js'
import {createSphere} from 'components/Three/ProceduralSphere/Sphere.js'
import randomstring from 'randomstring'
import { initFlocking, renderFlocking } from 'components/Three/flocking.js'

//PostProcessing
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';


import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { DotScreenShader } from 'three/examples/jsm/shaders/DotScreenShader.js';

//NLP Stuff
import natural from 'natural'
//
//Marching Cubes
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js'
import { ToonShader1, ToonShader2, ToonShaderHatching, ToonShaderDotted } from 'three/examples/jsm/shaders/ToonShader.js';
const clock = new THREE.Clock()
let mouse = new THREE.Vector2()
let effectController
let effect, resolution, light, ambientLight, materials
let current_material = 'shiny';
let time = 0
let stringDistance = 0

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
export default class Texture {
    constructor() {
      this.render = this.render.bind(this) //bind to class instead of window object
      this.setup = this.setup.bind(this)
      this.animate = this.animate.bind(this)
      this.updateText = this.updateText.bind(this)
      this.addObjects = this.addObjects.bind(this)
      this.addBody = this.addBody.bind(this)
      this.initPhysics = initPhysics.bind(this)
      this.createPhysicsObjects = createPhysicsObjects.bind(this)
      this.initInput = initInput.bind(this)
      this.updatePhysics = updatePhysics.bind(this)
      this.initFlocking = initFlocking.bind(this)
      this.renderFlocking = renderFlocking.bind(this)

        // set up scene
        this.setup()
        this.addObjects()
      //  this.initPhysics()
       // this.createPhysicsObjects()
  //      this.initInput(this.raycaster)
        this.render()


        //GROUND
//        document.addEventListener('mouseclick', onDocumentMouseClick, false)

}

setup() {
  // CAMERA
        // fov, aspect, near, far

        this.camera = createCamera()
        this.camera.position.set(0, 50, 1000)
        this.camera.lookAt(0, -50, 0)
   //     this.camera.up.set(0, 0, -1)
        // SCENE & RENDER
        this.renderer = createRenderer()
        this.scene = new THREE.Scene();
        this.raycaster = new THREE.Raycaster()

        //LIGHTS
        const color = 0xFFFFFF
        const intensity = 1.5
        this.light = createLights({color: color, intensity: intensity})
        this.light[0].position.set(0, 500, 250)
       this.light[0].target.position.set(0, 0, 0)
        this.light[0].castShadow = true
        light = this.light[0]
        this.scene.add(this.light[0])
//        this.light[0].position.setScalar(1)
        ambientLight = new THREE.AmbientLight(color, 0.2)
        this.scene.add( ambientLight)
        this.scene.add( this.light[0])
        const helper = new THREE.DirectionalLightHelper(this.light[0], 5, 0xff0008)
//      this.scene.add(helper)

				// lights
        //BACKGROUND & FOG
        let backgroundColor = new THREE.Color(0xfcba03)
//       this.scene.background = backgroundColor
        this.textureLoader = new THREE.TextureLoader()
        let backgroundImg = this.textureLoader.load('/three/studio-bg.jpg')
        this.scene.background = backgroundImg
//        this.scene.fog = createFog(0xfcba03, 1, 1000)
        // CONTROLS
  this.controls = createControls(this.camera, this.renderer/*, {center: {x: 0, y: 0, z: 0}, autorotate: true}*/)
         }


    addObjects() {

				this.composer = new EffectComposer( this.renderer );
				this.composer.addPass( new RenderPass( this.scene, this.camera ) );
        // (noise intensity, scanline intensity, scanline count, grayscale)
        this.effect1 = new AfterimagePass(0.8)
        this.composer.addPass(this.effect1)
      let sky = createSky(this.scene, this.renderer)
      this.sky = sky[0]
      this.sun = sky[1]
      //add marching cubes

			// MATERIALS

			materials = generateMaterials();

			// MARCHING CUBES

			let resolution = 28;

			effect = new MarchingCubes( resolution, materials[ current_material ], true, true, 100000 );
			effect.position.set( 0, 0, 0 );
			effect.scale.set( 700, 700, 700 );

			effect.enableUvs = false;
			effect.enableColors = false;

			this.scene.add( effect );
//			this.renderer.outputEncoding = THREE.sRGBEncoding;
      setupGui()
      console.log('effect controller: ', effectController)

      //marching cubes code from [200~https://github.com/mrdoob/three.js/blob/dev/examples/webgl_marchingcubes.html
      function generateMaterials() {
			const cubeTextureLoader = new THREE.CubeTextureLoader();
          // camera texture
            let video = document.getElementById('video')
            console.log('video: ', video)
            let videoTex = new THREE.VideoTexture(video)
            console.log('videoTEx', videoTex)


			videoTex.wrapS = THREE.RepeatWrapping;
			videoTex.wrapT = THREE.RepeatWrapping;

//            videoTex.offset.set(0.50, 0.50)
            videoTex.repeat.set(2, 4)
            let videoCube = cubeTextureLoader.load([videoTex, videoTex, videoTex, videoTex, videoTex, videoTex])

			const path = '/three/textures/cube/SwedishRoyalCastle/';
			const format = '.jpg';
			const urls = [
				path + 'px' + format, path + 'nx' + format,
				path + 'py' + format, path + 'ny' + format,
				path + 'pz' + format, path + 'nz' + format
			];


			const reflectionCube = cubeTextureLoader.load( urls );
			const refractionCube = cubeTextureLoader.load( urls );
			refractionCube.mapping = THREE.CubeRefractionMapping;

			// toons

			const toonMaterial1 = createShaderMaterial( ToonShader1, light, ambientLight );
			const toonMaterial2 = createShaderMaterial( ToonShader2, light, ambientLight );
			const hatchingMaterial = createShaderMaterial( ToonShaderHatching, light, ambientLight );
			const dottedMaterial = createShaderMaterial( ToonShaderDotted, light, ambientLight );

			const texture = new THREE.TextureLoader().load( '/three/textures/uv_grid_opengl.jpg' );
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
          console.log('texture ', texture)
      let hank = cubeTextureLoader.load(['/three/textures/hank.jpg', '/three/textures/hank.jpg','/three/textures/hank.jpg','/three/textures/hank.jpg','/three/textures/hank.jpg','/three/textures/hank.jpg'])
			const materials = {
				'shiny': new THREE.MeshStandardMaterial( { color: 0x550000, envMap: reflectionCube, roughness: 0.1, metalness: 1.0 } ),
        'hank': new THREE.MeshPhongMaterial({color: 'pink', envMap: hank, shininess: 1}),
/*				'chrome': new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } ),
        'liquid': new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: refractionCube, refractionRatio: 0.85 } ),*/
        /*				'matte': new THREE.MeshPhongMaterial( { specular: 0x111111, shininess: 1 } ), */
        'flat': new THREE.MeshLambertMaterial( { flatShading: true } ),
				'textured': new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 1, map: texture } ),
				'colors': new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 2, vertexColors: true } ),
				'multiColors': new THREE.MeshPhongMaterial( { shininess: 2, vertexColors: true } ),
				'plastic': new THREE.MeshPhongMaterial( { specular: 0x888888, shininess: 250 } ),
                'webcam': new THREE.MeshLambertMaterial({  map: videoTex})
/*				'toon1': toonMaterial1,
				'toon2': toonMaterial2,
				'hatching': hatchingMaterial,
        'dotted': dottedMaterial */
			};

			return materials;

		}

		function createShaderMaterial( shader, light, ambientLight ) {

			const u = THREE.UniformsUtils.clone( shader.uniforms );

			const vs = shader.vertexShader;
			const fs = shader.fragmentShader;

			const material = new THREE.ShaderMaterial( { uniforms: u, vertexShader: vs, fragmentShader: fs } );

			material.uniforms[ 'uDirLightPos' ].value = light.position;
			material.uniforms[ 'uDirLightColor' ].value = light.color;

			material.uniforms[ 'uAmbientLightColor' ].value = ambientLight.color;

			return material;

		}

		//

		function setupGui() {

			const createHandler = function ( id ) {

				return function () {

					current_material = id;
                    console.log('current_material: ', current_material)

					effect.material = materials[ current_material ];
					effect.enableUvs = ( current_material === 'textured' ) ? true : false;
					effect.enableColors = ( current_material === 'colors' || current_material === 'multiColors' ) ? true : false;
                    console.log('effect: ', effect)

				};

			};

			effectController = {

				material: 'shiny',

				speed: 1.0,
				numBlobs: 5,
				resolution: 28,
				isolation: 80,

				floor: true,
				wallx: false,
				wallz: false,

				dummy: function () {}

			};

			let h;

			const gui = new GUI();

			// material (type)

			h = gui.addFolder( 'Materials' );

			for ( const m in materials ) {

				effectController[ m ] = createHandler( m );
				h.add( effectController, m ).name( m );

			}

			// simulation

			h = gui.addFolder( 'Simulation' );

			h.add( effectController, 'speed', 0.1, 8.0, 0.05 );
			h.add( effectController, 'numBlobs', 1, 50, 1 );
			h.add( effectController, 'resolution', 14, 100, 1 );
			h.add( effectController, 'isolation', 10, 300, 1 );

			h.add( effectController, 'floor' );
			h.add( effectController, 'wallx' );
			h.add( effectController, 'wallz' );

		}

		// this controls content of marching cubes voxel field

    }
    updateText(text) {
      //effect controller args
    }
    animate() {


			const delta = clock.getDelta();

			time += delta * effectController.speed * 0.5;

			// marching cubes

			if ( effectController.resolution !== resolution ) {

				resolution = effectController.resolution;
				effect.init( Math.floor( resolution ) );

			}

			if ( effectController.isolation !== effect.isolation ) {

				effect.isolation = effectController.isolation;

			}

			updateCubes( effect, time, effectController.numBlobs, effectController.floor, effectController.wallx, effectController.wallz );
		function updateCubes( object, time, numblobs, floor, wallx, wallz ) {

		object.reset();

			// fill the field with some metaballs

			const rainbow = [
				new THREE.Color( 0xff0000 ),
				new THREE.Color( 0xff7f00 ),
				new THREE.Color( 0xffff00 ),
				new THREE.Color( 0x00ff00 ),
				new THREE.Color( 0x0000ff ),
				new THREE.Color( 0x4b0082 ),
				new THREE.Color( 0x9400d3 )
			];
			const subtract = 12;
			const strength = 1.2 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );

			for ( let i = 0; i < numblobs; i ++ ) {

				const ballx = Math.sin( i + 1.26 * time * ( 1.03 + 0.5 * Math.cos( 0.21 * i ) ) ) * 0.27 + 0.5;
				const bally = Math.abs( Math.cos( i + 1.12 * time * Math.cos( 1.22 + 0.1424 * i ) ) ) * 0.77; // dip into the floor
				const ballz = Math.cos( i + 1.32 * time * 0.1 * Math.sin( ( 0.92 + 0.53 * i ) ) ) * 0.27 + 0.5;

				if ( current_material === 'multiColors' ) {

					object.addBall( ballx, bally, ballz, strength, subtract, rainbow[ i % 7 ] );

				} else {

					object.addBall( ballx, bally, ballz, strength, subtract );

				}

			}

			if ( floor ) object.addPlaneY( 2, 12 );
			if ( wallz ) object.addPlaneZ( 2, 12 );
			if ( wallx ) object.addPlaneX( 2, 12 );
            object.update()
			 }

    }
    render(time, i) {
          requestAnimationFrame(this.render)

	      this.animate()
          this.renderer.render(this.scene, this.camera)
//        this.renderer.outputEncoding = THREE.sRGBEncoding;
    }

   addBody(output) {

    let model = output
    model.traverse(child => {
      if (child.geometry != undefined) {
        child.material = this.bodyMat

      }
    })
    model.position.y = 1
    model.scale.set(0.02, 0.02, 0.02)
    model.position.x = this.modX
    model.position.z = this.modZ
      this.modX+=5
    model.rotation.y = THREE.MathUtils.degToRad(-45)
    model.orbitRadius = getRandomInt(20, 40)
    this.model = model
    //remove prebuilt lighting
//    this.model.children.splice(3, 1)
//    model.scale.set(0.001, 0.001, 0.001)
    let mixer = new THREE.AnimationMixer(model)
    let newAnim = mixer.clipAction(output.animations[this.animNum])
//    newAnim.setLoop(THREE.LoopOnce)
//    newAnim.clampWhenFinished = true
    this.mixers.push(mixer)
    newAnim.setEffectiveTimeScale(0.5)
    newAnim.play()
    this.models.push(model)
    this.scene.add(model)
    this.animNum++
    return model
}
}



function onDocumentMouseClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

