import { GUI } from 'dat.gui'
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'

type LandmarkCoords = {
    name: string
    entries: {
        x: number
        y: number
        z: number
    }[]
}
type ModelCoords = {
    type: string
    models: {
        x: number
        y: number
        z: number
    }[]
}
type ZoneCoords = {
    name: string
    x: number
    y: number
    z: number
    angleA: number
    angleB: number
    sizeX: number
    sizeZ: number
}

type TruckCoords = {
    name: string
    x: number
    y: number
    z: number
    task: string
}
type LevelJson = {
    landmarks: LandmarkCoords[]
    models: ModelCoords[]
    zones: ZoneCoords[]
    trucks: TruckCoords[]
}
const {landmarks, models, zones, trucks}: LevelJson = require('./data/level_us_01_01.pak.json')

const scene = new THREE.Scene()

scene.background = new THREE.Color(0x444444)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
camera.position.set(400, 200, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new MapControls(camera, renderer.domElement)

controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05

controls.screenSpacePanning = false

controls.minDistance = 10
controls.maxDistance = 999

controls.maxPolarAngle = Math.PI / 2

// world
const landmarkMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })
const landmarkSpruceTreeMaterial = new THREE.MeshPhongMaterial({
    color: 0x188c37,
    flatShading: true,
})
const landmarkBirchTreeMaterial = new THREE.MeshPhongMaterial({
    color: 0x8c6f18,
    flatShading: true,
})

var mergedGeoms = []
var mergedSpruceTreeGeoms = []
var mergedBirchTreeGeoms = []
for (const landmark of landmarks) {
    console.log(landmark.name)
    for (const entry of landmark.entries) {
        var newBox1 = new THREE.BoxGeometry(2, 2, 2)
        newBox1.translate(entry.x, entry.y, entry.z)
        if (landmark.name.includes('spruce_')) {
            mergedSpruceTreeGeoms.push(newBox1)
        } else if (landmark.name.includes('birch_')) {
            mergedBirchTreeGeoms.push(newBox1)
        } else mergedGeoms.push(newBox1)
    }
}

var mergedBoxes = BufferGeometryUtils.mergeBufferGeometries(mergedGeoms)
const landmarksMesh = new THREE.Mesh(mergedBoxes, landmarkMaterial)
landmarksMesh.updateMatrix()
landmarksMesh.matrixAutoUpdate = false
scene.add(landmarksMesh)

//trees:
var mergedSpruceTreeBoxes = BufferGeometryUtils.mergeBufferGeometries(mergedSpruceTreeGeoms)
const landmarkSpruceTreesMesh = new THREE.Mesh(mergedSpruceTreeBoxes, landmarkSpruceTreeMaterial)
landmarkSpruceTreesMesh.updateMatrix()
landmarkSpruceTreesMesh.matrixAutoUpdate = false
scene.add(landmarkSpruceTreesMesh)

var mergedBirchTreeBoxes = BufferGeometryUtils.mergeBufferGeometries(mergedBirchTreeGeoms)
const landmarkBirchTreesMesh = new THREE.Mesh(mergedBirchTreeBoxes, landmarkBirchTreeMaterial)
landmarkBirchTreesMesh.updateMatrix()
landmarkBirchTreesMesh.matrixAutoUpdate = false
scene.add(landmarkBirchTreesMesh)

// lights
const dirLight1 = new THREE.DirectionalLight(0xffffff)
dirLight1.position.set(1, 1, 1)
scene.add(dirLight1)

const dirLight2 = new THREE.DirectionalLight(0xc4a704)
dirLight2.position.set(-1, -1, -1)
scene.add(dirLight2)

const ambientLight = new THREE.AmbientLight(0x222222)
scene.add(ambientLight)

window.addEventListener('resize', onWindowResize, false)

const gui = new GUI()
const layersFolder = gui.addFolder('Layers')
layersFolder.add(landmarksMesh, 'visible', true)
layersFolder.open()

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
