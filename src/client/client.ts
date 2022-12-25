import { GUI } from 'dat.gui'
import * as THREE from 'three'
import { Layers } from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import { LevelJson } from '../typings/types'
import { setUpMeshesFromMap } from './sceneBuilder'

const us_01_01Json: LevelJson = require('./data/level_us_01_01.pak.json')
const us_01_02Json: LevelJson = require('./data/level_us_01_02.pak.json')

const scene = new THREE.Scene()

const pointer = new THREE.Vector2()
var cssPointerLocation: { clientX: number; clientY: number }
const raycaster = new THREE.Raycaster()
export const enum LAYERS {
    Terrain = 1,
    Landmarks,
    Models,
    Zones,
    Trucks,
}
var INTERSECTED: any //currently hovered item
const renderer = new THREE.WebGLRenderer({ antialias: true })
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
const controls = new MapControls(camera, renderer.domElement)

init()
animate()
setUpMeshesFromMap(scene, us_01_01Json, './us1HD.jpg' )

//-----------------------
function init() {
    scene.background = new THREE.Color(0x444444)
    camera.position.set(600, 1200, 600) // qqtas may be based on map size

    camera.layers.enable(LAYERS.Trucks)
    camera.layers.enable(LAYERS.Zones)

    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    controls.enableDamping = false // an animation loop is required when either damping or auto-rotation are enabled
    controls.screenSpacePanning = false
    controls.minDistance = 10
    controls.maxDistance = 2000
    controls.maxPolarAngle = Math.PI / 2

    // lights
    setUpLights(scene)

    window.addEventListener('resize', onWindowResize, false)
    document.addEventListener('mousemove', onPointerMove)

    const layers = {
        toggleZones: function () {
            camera.layers.toggle(LAYERS.Zones)
        },
        toggleTrucks: function () {
            camera.layers.toggle(LAYERS.Trucks)
        },
    }
    const maps = {
        us_01_01: function () {
            setUpMeshesFromMap(scene, us_01_01Json, './us1HD.jpg' )
        },
        us_01_02: function () {
            setUpMeshesFromMap(scene, us_01_02Json, './level_us_01_02_map.png')
        },
        clear: function () {
            clearScene(scene)
        },
    }

    const gui = new GUI()
    const layersFolder = gui.addFolder('Layers')
    const mapsFolder = gui.addFolder('Maps')
    layersFolder.add(layers, 'toggleZones', true).name('Toggle Zones')
    layersFolder.add(layers, 'toggleTrucks', true).name('Toggle Trucks')
    layersFolder.open()
    mapsFolder.add(maps, 'us_01_01', true).name('Black River')
    mapsFolder.add(maps, 'us_01_02', true).name('Smithville Dam')
    mapsFolder.add(maps, 'clear', true).name('Clear Map')
    mapsFolder.open()
}

function setUpLights(scene: THREE.Scene) {
    const dirLight1 = new THREE.DirectionalLight(0xffffff) // white from above
    dirLight1.position.set(0.5, 1, 0)
    dirLight1.intensity = 0.8
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0xc44a04) // a sunsetty orange from the bottom corner. Not thought through at all
    dirLight2.position.set(-1, -1, -1)
    scene.add(dirLight2)

    const ambientLight = new THREE.AmbientLight(0xf57373) //slightly red - colour corrects mud to brown rather than sickly green
    ambientLight.intensity = 0.5
    scene.add(ambientLight)
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
    cssPointerLocation = event

    const infoElement = document.getElementById('info')
    if (infoElement !== null) {
        infoElement.style.top = `${cssPointerLocation.clientY + 20}px`
        infoElement.style.left = `${cssPointerLocation.clientX + 20}px`
    }
}

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
}

function render() {
    checkMouseIntersections()
    renderer.render(scene, camera)
}

function checkMouseIntersections() {
    raycaster.setFromCamera(pointer, camera)
    const objectsToCheck = scene.children
    raycaster.layers.set(LAYERS.Trucks)
    raycaster.layers.enable(LAYERS.Zones)

    const infoElement = document.getElementById('info')

    const intersects = raycaster.intersectObjects(objectsToCheck, false)
    if (intersects.length > 0) {
        const intersectedItem = pickPriorityIntersection(intersects)
        if (INTERSECTED != intersectedItem) {
            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex)
            INTERSECTED = intersectedItem
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex()
            INTERSECTED.material.emissive.setHex(0xff0000)

            // update info box
            if (infoElement !== null) {
                const allIntersects = intersects.reduce((acc, intersection) => {
                    return acc.concat(`${intersection.object.name}\n`)
                }, '')
                infoElement.innerText = allIntersects
                infoElement.style.opacity = '1'
            }
        }
    } else {
        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex)
        INTERSECTED = null
        if (infoElement) infoElement.style.opacity = '0'
    }
}

function pickPriorityIntersection(intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[]) {
    const testTruckLayers = new Layers()
    testTruckLayers.set(LAYERS.Trucks)
    const truckIntersect = intersects.filter((intersection) =>
        intersection.object.layers.test(testTruckLayers)
    )

    return truckIntersect.length ? truckIntersect[0].object : intersects[0].object
}

function clearScene(scene: THREE.Scene) {
    for( var i = scene.children.length - 1; i >= 0; i--) { 
        var obj = scene.children[i];
        console.log(`removing ${obj.name}`)
        scene.remove(obj); 
   }
   setUpLights(scene)
}
