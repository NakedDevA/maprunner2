import { GUI } from 'dat.gui'
import * as THREE from 'three'
import { Layers } from 'three'
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

const pointer = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
const enum LAYERS {
    Terrain = 1,
    Landmarks,
    Models,
    Zones,
    Trucks
  }
var INTERSECTED: any //currently hovered item

scene.background = new THREE.Color(0x444444)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
camera.position.set(600, 1200, 600)

camera.layers.enable(LAYERS.Trucks)
camera.layers.enable(LAYERS.Zones)

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
for (const zone of zones) {
    //console.log(zone.name)
    var newBox1 = new THREE.BoxGeometry(zone.sizeX, 30, zone.sizeZ)
    newBox1.translate(-zone.x, ZONEHEIGHT, zone.z)
    
    const mesh = new THREE.Mesh(newBox1, zoneMaterial.clone())
    mesh.updateMatrix()
    mesh.matrixAutoUpdate = false
    mesh.layers.set(LAYERS.Zones)
    mesh.name = zone.name
    scene.add(mesh)
}

// Trucks--------------------
for (const truck of trucks) {
    //console.log(zone.name)
    var newBox1 = new THREE.BoxGeometry(8, 4, 4)
    newBox1.translate(-truck.x, truck.y, truck.z)

    const mesh = new THREE.Mesh(newBox1, truckMaterial.clone())
    mesh.updateMatrix()
    mesh.matrixAutoUpdate = false
    mesh.layers.set(LAYERS.Trucks)
    mesh.name = truck.name
    scene.add(mesh)
}

// lights
const dirLight1 = new THREE.DirectionalLight(0xffffff)
dirLight1.position.set(1, 1, 1)
scene.add(dirLight1)

const dirLight2 = new THREE.DirectionalLight(0xc4a704)
dirLight2.position.set(-1, -1, -1)
scene.add(dirLight2)

const ambientLight = new THREE.AmbientLight(0x222222)
scene.add(ambientLight)

console.log(scene.children)

window.addEventListener('resize', onWindowResize, false)
document.addEventListener('mousemove', onPointerMove)

const gui = new GUI()
const layersFolder = gui.addFolder('Layers')
layersFolder.add(landmarksMesh, 'visible', true).name('Landmarks')
layersFolder.add(modelsMesh, 'visible', true).name('Models')
//layersFolder.add(zonesMesh, 'visible', true).name('Zones')
//layersFolder.add(trucksMesh, 'visible', true).name('Trucks') //qqtas layer visibility
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

function onPointerMove(event: { clientX: number; clientY: number }) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
}

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
}

function render() {
    // find intersections
    raycaster.setFromCamera(pointer, camera)
    const objectsToCheck = scene.children // qqtas was scene.children
    raycaster.layers.set(LAYERS.Trucks)
    raycaster.layers.enable(LAYERS.Zones)
    const intersects = raycaster.intersectObjects(objectsToCheck, false)
    if (intersects.length > 0) {
        const intersectedItem = pickPriorityIntersection(intersects)
        if (INTERSECTED != intersectedItem) {
            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex)
            INTERSECTED = intersectedItem
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex()
            INTERSECTED.material.emissive.setHex(0xff0000)
            console.log(INTERSECTED.name)
        }
    } else {
        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex)
        INTERSECTED = null
    }

    renderer.render(scene, camera)
}
animate()
function pickPriorityIntersection(intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[]) {
    const testTruckLayers = new Layers()
    testTruckLayers.set(LAYERS.Trucks)
    const truckIntersect = intersects.filter(intersection => intersection.object.layers.test(testTruckLayers))

    return truckIntersect.length? truckIntersect[0].object : intersects[0].object
}

