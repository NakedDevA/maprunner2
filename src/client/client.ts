import * as THREE from 'three'
import { MapControls, OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

type LandmarkCoords = {
    x:number
    y:number
    z:number
}
const testJson:LandmarkCoords[] = require('./data/level_us_01_01.pak.json')

const scene = new THREE.Scene()


scene.background = new THREE.Color(0x444444)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
camera.position.set( 400, 200, 0 );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new MapControls(camera, renderer.domElement)

controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05

controls.screenSpacePanning = false

controls.minDistance = 10
controls.maxDistance = 999

controls.maxPolarAngle = Math.PI / 2
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: false,
})

console.log(testJson)
// world

const landmarkGeometry = new THREE.BoxGeometry(1, 1, 1)
landmarkGeometry.translate(0, 0.5, 0)
const landmarkMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: false })

for (const lmk of testJson) {
    const mesh = new THREE.Mesh(landmarkGeometry, landmarkMaterial)
    //const point = new THREE.Points(landmarkGeometry, landmarkMaterial)
    mesh.position.x = lmk.x
    mesh.position.y = lmk.y
    mesh.position.z = lmk.z
    mesh.scale.x = 1
    mesh.scale.y = 1
    mesh.scale.z = 1
    mesh.updateMatrix()
    mesh.matrixAutoUpdate = false
    scene.add(mesh)
}

/*
for (let i = 0; i < 500; i++) {
    const mesh = new THREE.Mesh(landmarkGeometry, landmarkMaterial)
    mesh.position.x = Math.random() * 1600 - 800
    mesh.position.y = 0
    mesh.position.z = Math.random() * 1600 - 800
    mesh.scale.x = 20
    mesh.scale.y = Math.random() * 80 + 10
    mesh.scale.z = 20
    mesh.updateMatrix()
    mesh.matrixAutoUpdate = false
    scene.add(mesh)
}*/

// lights

const dirLight1 = new THREE.DirectionalLight(0xffffff)
dirLight1.position.set(1, 1, 1)
scene.add(dirLight1)

const dirLight2 = new THREE.DirectionalLight(0x002288)
dirLight2.position.set(-1, -1, -1)
//scene.add(dirLight2)

const ambientLight = new THREE.AmbientLight(0x222222)
scene.add(ambientLight)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()
}

function render() {
    renderer.render(scene, camera)
}
animate()
