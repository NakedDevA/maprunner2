import { GUI } from 'dat.gui'
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'
import { LevelJson } from '../typings/types'

const {
    landmarks,
    models,
    zones,
    trucks,
    heightMap,
}: LevelJson = require('./data/level_us_01_01.pak.json')

const scene = new THREE.Scene()

scene.background = new THREE.Color(0x444444)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
camera.position.set(600, 1200, 600)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new MapControls(camera, renderer.domElement)

controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05
controls.screenSpacePanning = false
controls.minDistance = 10
controls.maxDistance = 2000
controls.maxPolarAngle = Math.PI / 2

// world -----------------------

// Landmarks--------------------
const landmarkMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })
const landmarkSpruceTreeMaterial = new THREE.MeshPhongMaterial({
    color: 0x188c37,
    flatShading: true,
})
const landmarkBirchTreeMaterial = new THREE.MeshPhongMaterial({
    color: 0x8c6f18,
    flatShading: true,
})
const modelMaterial = new THREE.MeshPhongMaterial({ color: 0x3a3c42, flatShading: true })
const zoneMaterial = new THREE.MeshPhongMaterial({
    color: 0xd007de,
    opacity: 0.5,
    transparent: true,
})
const truckMaterial = new THREE.MeshPhongMaterial({ color: 0xff0303, flatShading: true })

const loader = new THREE.TextureLoader()
const terrainMaterial = new THREE.MeshPhongMaterial({
    map: loader.load('./level_us_01_01.pak.png'),
})

var mergedLandmarkGeoms = []
var mergedSpruceTreeGeoms = []
var mergedBirchTreeGeoms = []
for (const landmark of landmarks) {
    //console.log(landmark.name)
    for (const entry of landmark.entries) {
        var newBox1 = new THREE.BoxGeometry(2, 2, 2)
        newBox1.translate(-entry.x, entry.y, entry.z)
        if (landmark.name.includes('spruce_')) {
            mergedSpruceTreeGeoms.push(newBox1)
        } else if (landmark.name.includes('birch_')) {
            mergedBirchTreeGeoms.push(newBox1)
        } else mergedLandmarkGeoms.push(newBox1)
    }
}
const landmarksMesh = staticMergedMesh(mergedLandmarkGeoms, landmarkMaterial)
scene.add(landmarksMesh)

const landmarkSpruceTreesMesh = staticMergedMesh(mergedSpruceTreeGeoms, landmarkSpruceTreeMaterial)
scene.add(landmarkSpruceTreesMesh)

const landmarkBirchTreesMesh = staticMergedMesh(mergedBirchTreeGeoms, landmarkBirchTreeMaterial)
scene.add(landmarkBirchTreesMesh)

// Draw Base terrain layer ------------------

const combinePoints = heightMap.reverse().flat()
const geometry = new THREE.PlaneGeometry(2000, 2000, heightMap.length - 1, heightMap[0].length - 1)

geometry.rotateX(-Math.PI / 2) // flat plane
geometry.rotateY(Math.PI) // SR measures from the opposite corner compared to threejs!

const vertices = geometry.attributes.position
console.log(vertices.count)
for (let i = 0; i < vertices.count; i++) {
    const MAGIC_SCALING_FACTOR = 1.5
    vertices.setY(i, combinePoints[i] / MAGIC_SCALING_FACTOR)
}

const terrainMesh = new THREE.Mesh(geometry, terrainMaterial)
scene.add(terrainMesh)

// Models--------------------
var mergedModelGeoms = []
for (const model of models) {
    //console.log(model.type)
    for (const entry of model.models) {
        // some models correspond to the landmarks we're already drawing, don't duplicate
        if (!model.landmark.length) {
            var newBox1 = new THREE.BoxGeometry(2, 2, 2)
            newBox1.translate(-entry.x, entry.y, entry.z)
            mergedModelGeoms.push(newBox1)
        }
    }
}

const modelsMesh = staticMergedMesh(mergedModelGeoms, modelMaterial)
modelsMesh.renderOrder = 99
scene.add(modelsMesh)

// Zones--------------------
const ZONEHEIGHT = 70
var mergedZoneGeoms = []
for (const zone of zones) {
    //console.log(zone.name)
    var newBox1 = new THREE.BoxGeometry(zone.sizeX, 30, zone.sizeZ)
    newBox1.translate(-zone.x, ZONEHEIGHT, zone.z)
    mergedZoneGeoms.push(newBox1)
}
const zonesMesh = staticMergedMesh(mergedZoneGeoms, zoneMaterial)
zonesMesh.visible = false
scene.add(zonesMesh)

// Trucks--------------------
var mergedTruckGeoms = []
for (const truck of trucks) {
    //console.log(zone.name)
    var newBox1 = new THREE.BoxGeometry(8, 4, 4)
    newBox1.translate(-truck.x, truck.y, truck.z)
    mergedTruckGeoms.push(newBox1)
}
const trucksMesh = staticMergedMesh(mergedTruckGeoms, truckMaterial)
scene.add(trucksMesh)

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
layersFolder.add(landmarksMesh, 'visible', true).name('Landmarks')
layersFolder.add(modelsMesh, 'visible', true).name('Models')
layersFolder.add(zonesMesh, 'visible', true).name('Zones')
layersFolder.add(trucksMesh, 'visible', true).name('Trucks')
layersFolder.add(terrainMesh, 'visible', true).name('Terrain')

layersFolder.open()

function staticMergedMesh(mergedGeoms: THREE.BufferGeometry[], material: THREE.MeshPhongMaterial) {
    var mergedBoxes = BufferGeometryUtils.mergeBufferGeometries(mergedGeoms)
    const mesh = new THREE.Mesh(mergedBoxes, material)
    mesh.updateMatrix()
    mesh.matrixAutoUpdate = false
    return mesh
}

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
