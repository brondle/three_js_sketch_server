import {MathUtils, BoxGeometry, SphereGeometry, TorusKnotGeometry, Mesh, Vector2, Vector3, MeshPhongMaterial, MeshStandardMaterial, MeshLambertMaterial, RepeatWrapping, Quaternion, TextureLoader, PlaneGeometry, VideoTexture} from 'three'
import {ConvexObjectBreaker} from 'three/examples/jsm/misc/ConvexObjectBreaker.js'
import {ConvexGeometry} from 'three/examples/jsm/geometries/ConvexGeometry.js'
import { importSTLModel } from '../importSTLModel.js'
import { importGLTFModel } from '../importGLTFModel.js'
//code from https://github.com/mrdoob/three.js/blob/dev/examples/physics_ammo_break.html
const ballMaterial = new MeshPhongMaterial( { color: 0x202020 } );
const textureLoader = new TextureLoader()
let scene;
let camera
let crab;
let crabLoaded = false;
let raycaster
let rigidBodies = []
let playerBody
let playerHead
let moveDirection = { left: 0, right: 0, forward: 0, back: 0 }
let physicsWorld
const gravityConstant = 1;
const margin = 0.05
const convexBreaker = new ConvexObjectBreaker
const mouseCoords = new Vector2();
let clickRequest = false;
const pos = new Vector3();
		const quat = new Quaternion();
		let transformAux1;
		let tempBtVec3_1;

		const objectsToRemove = [];

		for ( let i = 0; i < 500; i ++ ) {

			objectsToRemove[ i ] = null;

		}

		let numObjectsToRemove = 0;

		const impactPoint = new Vector3();
		const impactNormal = new Vector3();

// terrain
let groundShape
let groundBody
let groundTransform
let groundMotionState
let groundMass
let groundLocalInertia

// Heightfield parameters
			let heightData = null;
			let ammoHeightData = null;

			const terrainWidthExtents = 100;
			const terrainDepthExtents = 100;
			const terrainWidth = 128;
			const terrainDepth = 128;
			const terrainHalfWidth = terrainWidth / 2;
			const terrainHalfDepth = terrainDepth / 2;
			let terrainMaxHeight = 4;
			let terrainMinHeight = -1;
const geometry = new PlaneGeometry( terrainWidthExtents, terrainDepthExtents, terrainWidth - 1, terrainDepth - 1 );

let terrainMesh
			let start = 0
			let inc = 3
			let depthMod = 2
			let widthMod = 2
let phaseMult = 8



		function initPhysics() {
			console.log('foo')
			scene = this.scene
      raycaster = this.raycaster
			camera = this.camera
			// Physics configuration

			this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		this.dispatcher = new Ammo.btCollisionDispatcher( this.collisionConfiguration );
			this.broadphase = new Ammo.btDbvtBroadphase();
		this.solver = new Ammo.btSequentialImpulseConstraintSolver();
		physicsWorld = new Ammo.btDiscreteDynamicsWorld( this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration );
		physicsWorld.setGravity( new Ammo.btVector3( 0, - gravityConstant, 0 ) );

			transformAux1 = new Ammo.btTransform();
			tempBtVec3_1 = new Ammo.btVector3( 0, 0, 0 );
        return physicsWorld;

		}

		function createObject(object, mass, pos, quat, shape ) {
			object.position.copy( pos );
			object.quaternion.copy( quat );
			convexBreaker.prepareBreakableObject( object, mass, new Vector3(), new Vector3(), true );
			createDebrisFromBreakableObject( object, shape );

		}

		function createPhysicsObjects() {

			//bodyModel
			let crabMat = new MeshPhongMaterial({color: 'red'})
			importSTLModel('/three/models/Crab_t.stl', crabMat, addBody)
      console.log('adding gun');
       let gun = importGLTFModel('/three/models/ar-181.glb', addGun)
		}
function processClick() {

				if ( clickRequest && crabLoaded) {

					raycaster.setFromCamera( mouseCoords, camera );

					// Creates a crab
					const crabMass = 10;
					const crabRadius = 0.4;

//          let shape = new Ammo.btBoxShape(new Ammo.btVector3(2, 6, 1.5))

					crab.castShadow = true;
					crab.receiveShadow = true;
					const crabShape = new Ammo.btSphereShape( crabRadius );
					crabShape.setMargin( margin );
					pos.copy( raycaster.ray.direction );
          let origin = new THREE.Vector3()
            origin.copy(playerBody.position)
          origin.z = origin.z - 50
					pos.add( origin );
          console.log('origin: ', origin)
					quat.set( 0, 0, 0, 1 );
					const crabBody = createRigidBody( crab.clone(), crabShape, crabMass, playerBody.position, quat );
					crabBody.setFriction( 0.5 );

					pos.copy( raycaster.ray.direction );
					pos.multiplyScalar( 40 );
					crabBody.setLinearVelocity( new Ammo.btVector3( pos.x, pos.y, pos.z ) );

					clickRequest = false;

				}

			}
      function addGun(model) {
        console.log('scene: ', model);
        let obj = model.scene
        obj.scale.set(0.75, 0.75, 0.75);
        obj.rotation.y = MathUtils.degToRad(180)
				pos.set(0, 4, 0)
					quat.setFromAxisAngle(new Vector3(0, 1, 1), Math.PI)
				playerBody = obj
				let shape = new Ammo.btBoxShape(new Ammo.btVector3(2, 6, 1.5))
//				createObject(obj, 5.5, pos, quat, shape)
			createHead()
      scene.add(obj);
				return obj

      }
			function addBody(model, mat) {

				let obj = new Mesh(model, mat)
				obj.scale.set(0.05, 0.05, 0.05)
        crabLoaded = true
        crab = obj
				}

		function createHead() {
//			let video = document.getElementById('video')
//			let videoTex = new VideoTexture(video)
//			videoTex.wrapT = RepeatWrapping
//			videoTex.wrapS = RepeatWrapping
//			videoTex.repeat.set(0.9, 0.9, 0.9)
			let hankTex = textureLoader.load('/three/textures/hank.jpg')
			let headMat = new MeshPhongMaterial({ map: hankTex})
			const p = 2
			const q = 6

			let object = new Mesh( new SphereGeometry(4, 20, 20), headMat );
			let headMass = 0.1

			playerHead = object
			pos.set(0, 10, -5);
//		quat.set( 0, 0, 0, 1 );
			let shape = new Ammo.btSphereShape(4)
					createObject(object, headMass, pos, quat, shape);
		}
		function createParalellepipedWithPhysics( sx, sy, sz, mass, pos, quat, material ) {

			const object = new Mesh( new BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
			const shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
			shape.setMargin( margin );

			createRigidBody( object, shape, mass, pos, quat );

			return object;

		}

		function createDebrisFromBreakableObject( object, shape ) {

			object.castShadow = true;
			object.receiveShadow = true;

			shape.setMargin( margin );

			const body = createRigidBody( object, shape, object.userData.mass, null, null, object.userData.velocity, object.userData.angularVelocity );

			// Set pointer back to the three object only in the debris objects
			const btVecUserData = new Ammo.btVector3( 0, 0, 0 );
			btVecUserData.threeObject = object;
			body.setUserPointer( btVecUserData );

		}

		function removeDebris( object ) {

			scene.remove( object );

		physicsWorld.removeRigidBody( object.userData.physicsBody );

		}

		function createConvexHullPhysicsShape( coords ) {

			const shape = new Ammo.btConvexHullShape();

			for ( let i = 0, il = coords.length; i < il; i += 3 ) {

				tempBtVec3_1.setValue( coords[ i ], coords[ i + 1 ], coords[ i + 2 ] );
				const lastOne = ( i >= ( il - 3 ) );
				shape.addPoint( tempBtVec3_1, lastOne );

			}

			return shape;

		}

		function createRigidBody( object, physicsShape, mass, pos, quat, vel, angVel ) {

			if ( pos ) {

				object.position.copy( pos );

			} else {

				pos = object.position;

			}

			if ( quat ) {

				object.quaternion.copy( quat );

			} else {

				quat = object.quaternion;

			}

			const transform = new Ammo.btTransform();
			transform.setIdentity();
			transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
			transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
			const motionState = new Ammo.btDefaultMotionState( transform );

			const localInertia = new Ammo.btVector3( 0, 0, 0 );
			physicsShape.calculateLocalInertia( mass, localInertia );

			const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
			const body = new Ammo.btRigidBody( rbInfo );

			body.setFriction( 0.5 );

			if ( vel ) {

				body.setLinearVelocity( new Ammo.btVector3( vel.x, vel.y, vel.z ) );

			}

			if ( angVel ) {

				body.setAngularVelocity( new Ammo.btVector3( angVel.x, angVel.y, angVel.z ) );

			}

			object.userData.physicsBody = body;
			object.userData.collided = false;

			scene.add( object );

			if ( mass > 0 ) {

				rigidBodies.push( object );

				// Disable deactivation
				body.setActivationState( 4 );

			}

		physicsWorld.addRigidBody( body );

			return body;

		}

		function createRandomColor() {

			return Math.floor( Math.random() * ( 1 << 24 ) );

		}

		function createMaterial( color ) {

			color = color || createRandomColor();
			return new MeshPhongMaterial( { color: color } );

		}

		function initInput(raycaster) {
//			window.addEventListener('keydown', function(e) {
//				handleKeyDown(e)
//			})
//			window.addEventListener('keyup', function(e) {
//				handleKeyUp(e)
//			})
//
      window.addEventListener( 'pointerdown', function ( event ) {
				clickRequest = true

				mouseCoords.set(
					( event.clientX / window.innerWidth ) * 2 - 1,
					- ( event.clientY / window.innerHeight ) * 2 + 1
				);

				raycaster.setFromCamera( mouseCoords, camera );
        processClick();
      } );

			window.addEventListener( 'mousemove', function ( event ) {
//
				mouseCoords.set(
					( event.clientX / window.innerWidth ) * 2 - 1,
					- ( event.clientY / window.innerHeight ) * 2 + 1
				);
        if (playerBody != undefined){
//
				raycaster.setFromCamera( mouseCoords, camera );
        let distance = 5;
       const { origin, direction } = raycaster.ray;

       playerBody.position.copy(origin.clone().add(direction.multiplyScalar(distance)));
          console.log('playerBody pos: ', playerBody.position);
//          playerBody.rotation.set(MathUtils.degToRad(playerBody.position.x), ( MathUtils.degToRad(playerBody.position.y)), 0);
            playerBody.rotation.y = MathUtils.degToRad(180 - (playerBody.position.x * 15));
            playerBody.rotation.x = MathUtils.degToRad((0 - (playerBody.position.y*2)));
          }
			} );
//
		}
function updatePhysics( deltaTime ) {

			// Step world
		physicsWorld.stepSimulation( deltaTime, 10 );

			// Update rigid bodies
			for ( let i = 0, il = rigidBodies.length; i < il; i ++ ) {

				const objThree =rigidBodies[ i ];
				const objPhys = objThree.userData.physicsBody;
				const ms = objPhys.getMotionState();

				if ( ms ) {

					ms.getWorldTransform( transformAux1 );
					const p = transformAux1.getOrigin();
					const q = transformAux1.getRotation();
					objThree.position.set( p.x(), p.y(), p.z() );
					objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

					objThree.userData.collided = false;

				}

			}

			for ( let i = 0, il =this.dispatcher.getNumManifolds(); i < il; i ++ ) {

				const contactManifold =this.dispatcher.getManifoldByIndexInternal( i );
				const rb0 = Ammo.castObject( contactManifold.getBody0(), Ammo.btRigidBody );
				const rb1 = Ammo.castObject( contactManifold.getBody1(), Ammo.btRigidBody );

				const threeObject0 = Ammo.castObject( rb0.getUserPointer(), Ammo.btVector3 ).threeObject;
				const threeObject1 = Ammo.castObject( rb1.getUserPointer(), Ammo.btVector3 ).threeObject;

				if ( ! threeObject0 && ! threeObject1 ) {

					continue;

				}

				const userData0 = threeObject0 ? threeObject0.userData : null;
				const userData1 = threeObject1 ? threeObject1.userData : null;

				const breakable0 = userData0 ? userData0.breakable : false;
				const breakable1 = userData1 ? userData1.breakable : false;

				const collided0 = userData0 ? userData0.collided : false;
				const collided1 = userData1 ? userData1.collided : false;

				if ( ( ! breakable0 && ! breakable1 ) || ( collided0 && collided1 ) ) {

					continue;

				}

				let contact = false;
				let maxImpulse = 0;
				for ( let j = 0, jl = contactManifold.getNumContacts(); j < jl; j ++ ) {

					const contactPoint = contactManifold.getContactPoint( j );

					if ( contactPoint.getDistance() < 0 ) {

						contact = true;
						const impulse = contactPoint.getAppliedImpulse();

						if ( impulse > maxImpulse ) {

							maxImpulse = impulse;
							const pos = contactPoint.get_m_positionWorldOnB();
							const normal = contactPoint.get_m_normalWorldOnB();
							impactPoint.set( pos.x(), pos.y(), pos.z() );
							impactNormal.set( normal.x(), normal.y(), normal.z() );

						}

						break;

					}

				}

				// If no point has contact, abort
				if ( ! contact ) continue;

				// Subdivision

//				const fractureImpulse = 250;
//
//				if ( breakable0 && ! collided0 && maxImpulse > fractureImpulse ) {
//
//					const debris = convexBreaker.subdivideByImpact( threeObject0, impactPoint, impactNormal, 1, 2, 1.5 );
//
//					const numObjects = debris.length;
//					for ( let j = 0; j < numObjects; j ++ ) {
//
//						const vel = rb0.getLinearVelocity();
//						const angVel = rb0.getAngularVelocity();
//						const fragment = debris[ j ];
//						fragment.userData.velocity.set( vel.x(), vel.y(), vel.z() );
//						fragment.userData.angularVelocity.set( angVel.x(), angVel.y(), angVel.z() );
//
//						createDebrisFromBreakableObject( fragment );
//
//					}
//
//					objectsToRemove[ numObjectsToRemove ++ ] = threeObject0;
//					userData0.collided = true;
//
//				}
//
//				if ( breakable1 && ! collided1 && maxImpulse > fractureImpulse ) {
//
//					const debris = convexBreaker.subdivideByImpact( threeObject1, impactPoint, impactNormal, 1, 2, 1.5 );
//
//					const numObjects = debris.length;
//					for ( let j = 0; j < numObjects; j ++ ) {
//
//						const vel = rb1.getLinearVelocity();
//						const angVel = rb1.getAngularVelocity();
//						const fragment = debris[ j ];
//						fragment.userData.velocity.set( vel.x(), vel.y(), vel.z() );
//						fragment.userData.angularVelocity.set( angVel.x(), angVel.y(), angVel.z() );
//
//						createDebrisFromBreakableObject( fragment );
//
//					}
//
//					objectsToRemove[ numObjectsToRemove ++ ] = threeObject1;
//					userData1.collided = true;
//
//				}
//
			}

			for ( let i = 0; i < numObjectsToRemove; i ++ ) {

				removeDebris( objectsToRemove[ i ] );

			}

			numObjectsToRemove = 0;

  }
function setupEventHandlers(){

    window.addEventListener( 'keydown', handleKeyDown, false);
    window.addEventListener( 'keyup', handleKeyUp, false);

}


function handleKeyDown(event){

    let keyCode = event.keyCode;

    switch(keyCode){

        case 87: //W: FORWARD
            moveDirection.forward = 1
            break;

        case 83: //S: BACK
            moveDirection.back = 1
            break;

        case 65: //A: LEFT
            moveDirection.left = 1
            break;

        case 68: //D: RIGHT
            moveDirection.right = 1
            break;

    }
//	moveBody(playerBody)
}

function handleKeyUp(event){
    let keyCode = event.keyCode;

    switch(keyCode){
        case 87: //FORWARD
            moveDirection.forward = 0
            break;

        case 83: //BACK
            moveDirection.back = 0
            break;

        case 65: //LEFT
            moveDirection.left = 0
            break;

        case 68: //RIGHT
            moveDirection.right = 0
            break;

    }

}

function moveBody(body){
  console.log('moving: ')

    let scalingFactor = 20;

    let moveX =  moveDirection.right - moveDirection.left;
    let moveZ =  moveDirection.back - moveDirection.forward;
    let moveY =  0;

    if( moveX == 0 && moveY == 0 && moveZ == 0) return;

    let resultantImpulse = new Ammo.btVector3( moveX, moveY, moveZ )
    resultantImpulse.op_mul(scalingFactor);

    let physicsBody = body.userData.physicsBody;
    physicsBody.setLinearVelocity( resultantImpulse );

}
			function createTerrain() {

		const groundMaterial = new MeshLambertMaterial( { color: 0xC7C7C7 } );
				updateVertices()
				terrainMesh = new Mesh( geometry, groundMaterial );
				terrainMesh.receiveShadow = true;
				terrainMesh.castShadow = true;

				scene.add( terrainMesh );
				console.log('terrain mesh: ', terrainMesh)
				textureLoader.load( '/three/textures/grid.png', function ( texture ) {

					texture.wrapS = RepeatWrapping;
					texture.wrapT = RepeatWrapping;
					//texture.repeat.set( terrainWidth - 1, terrainDepth - 1 );
					texture.repeat.set(2, 2);
//					texture.offset.set(0, 1.2)

					groundMaterial.map = texture;
					groundMaterial.needsUpdate = true;

			})

}
			function createTerrainShape() {
				console.log('should be creating terrain')

				// This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
				const heightScale = 1;

				// Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
				const upAxis = 1;

				// hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
				const hdt = 'PHY_FLOAT';

				// Set this to your needs (inverts the triangles)
				const flipQuadEdges = false;

				// Creates height data buffer in Ammo heap
				ammoHeightData = Ammo._malloc( 4 * terrainWidth * terrainDepth );

				// Copy the javascript height data array to the Ammo one.
				let p = 0;
				let p2 = 0;

				for ( let j = 0; j < terrainDepth; j ++ ) {

					for ( let i = 0; i < terrainWidth; i ++ ) {

						// write 32-bit float data to memory
						Ammo.HEAPF32[ ammoHeightData + p2 >> 2 ] = heightData[ p ];

						p ++;

						// 4 bytes/float
						p2 += 4;

					}

				}

				// Creates the heightfield physics shape
				const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
					terrainWidth,
					terrainDepth,
					ammoHeightData,
					heightScale,
					terrainMinHeight,
					terrainMaxHeight,
					upAxis,
					hdt,
					flipQuadEdges
				);

				// Set horizontal scale
				const scaleX = terrainWidthExtents / ( terrainWidth - 1 );
				const scaleZ = terrainDepthExtents / ( terrainDepth - 1 );
				heightFieldShape.setLocalScaling( new Ammo.btVector3( scaleX, 1, scaleZ ) );

				heightFieldShape.setMargin( 0.05 );

				return heightFieldShape;

			}

			function updateVertices(){
				let vertices = geometry.attributes.position.array;

				for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j +=3 ) {

					// j + 1 because it is the y component that we modify
					vertices[ j + 1 ] = heightData[ i];

				}				heightData = generateHeight( terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight );

groundShape = createTerrainShape();
//				geometry.rotateX( - Math.PI / 2 );
				groundTransform = new Ammo.btTransform();
				groundTransform.setIdentity();
			// Shifts the terrain, since bullet re-centers it on its bounding box.
				groundTransform.setOrigin( new Ammo.btVector3( 0, ( terrainMaxHeight + terrainMinHeight ) / 2, 0 ) );
				groundMass = 0;
				groundLocalInertia = new Ammo.btVector3( 0, 0, 0 );
				groundMotionState = new Ammo.btDefaultMotionState( groundTransform );
				groundShape.calculateLocalInertia(groundMass, groundLocalInertia)

				groundBody = new Ammo.btRigidBody( new Ammo.btRigidBodyConstructionInfo( groundMass, groundMotionState, groundShape, groundLocalInertia ) );
				groundBody.setRestitution(1.5)
				groundBody.setDamping(0.8, 0)
				physicsWorld.addRigidBody( groundBody );


				geometry.attributes.position.needsUpdate = true
				geometry.computeVertexNormals();

			}


			function generateHeight( width, depth, minHeight, maxHeight ) {

				// Generates the height data (a sinus wave)

				const size = width * depth;
				const data = new Float32Array( size );

				const hRange = maxHeight - minHeight;
				// good setting: w2: 2, d2: 6, phaseMult: 9, pow: 1.5, height: cos
				const w2 = width / 2;
				const d2 = depth / 4;
				;

				let p = 0;

				for ( let j = 0; j < depth; j ++ ) {

					for ( let i = 0; i < width; i ++ ) {

						const radius = Math.sqrt(
							Math.pow( ( i - w2 ) / w2, 2.0 ) +
								Math.pow( ( j - d2 ) / d2, 2.0 ) );

						const height = ( Math.sin( radius * phaseMult ) + 1 ) * 0.5 * hRange + minHeight;

						data[ p ] = height;

						p ++;

					}

				}
				return data;

			}


export { initPhysics, createParalellepipedWithPhysics, createRigidBody, createPhysicsObjects, initInput, updatePhysics, processClick}
