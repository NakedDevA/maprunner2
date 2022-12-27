import { GUI } from 'dat.gui'
import * as THREE from 'three'
import { Layers } from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import { LevelJson } from '../typings/types'
import { setUpMeshesFromMap } from './sceneBuilder'

const maps = {
    us_01_01: async function () {
        await switchToLevel('./leveljson/level_us_01_01.pak.json', './terrainimages/level_us_01_01_map.png', false)
    },
    us_01_02: async function () {
        await switchToLevel('./leveljson/level_us_01_02.pak.json', './terrainimages/level_us_01_02_map.png', false)
    },
    us_01_03: async function () {
        await switchToLevel('./leveljson/level_us_01_03.pak.json', './terrainimages/level_us_01_03_map.png', false)
    },
    us_01_04: async function () {
        await switchToLevel('./leveljson/level_us_01_04_new.pak.json', './terrainimages/level_us_01_04_new_map.png', false)
    },
    us_02_01: async function () {
        await switchToLevel('./leveljson/level_us_02_01.pak.json', './terrainimages/level_us_02_01_map.png', true)
    },
    us_02_02: async function () {
        await switchToLevel('./leveljson/level_us_02_02_new.pak.json', './terrainimages/level_us_02_02_new_map.png', true)
    },
    us_02_03: async function () {
        await switchToLevel('./leveljson/level_us_02_03_new.pak.json', './terrainimages/level_us_02_03_new_map.png', true)
    },
    us_02_04: async function () {
        await switchToLevel('./leveljson/level_us_02_04_new.pak.json', './terrainimages/level_us_02_04_new_map.png', true)
    },
    clear: function () {
        clearScene(scene)
    },
    
}
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

// load initial map:
maps.us_01_01()

async function switchToLevel(levelJsonPath: string, terrainImagePath: string, isSnow: boolean) {
    const levelJson: LevelJson = await fetchLevelJson(levelJsonPath)
    clearScene(scene)
    setUpMeshesFromMap(scene, levelJson, terrainImagePath)
    setUpLights(scene, isSnow)
}

//-----------------------
function init() {
    scene.background = new THREE.Color(0x444444)
    camera.position.set(0, 800, -900) // qqtas may be based on map size

    camera.layers.enable(LAYERS.Trucks)
    camera.layers.enable(LAYERS.Zones)

    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    controls.enableDamping = false // an animation loop is required when either damping or auto-rotation are enabled
    controls.screenSpacePanning = false
    controls.minDistance = 10
    controls.maxDistance = 2000
    controls.maxPolarAngle = Math.PI / 2

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

    const gui = new GUI()
    const layersFolder = gui.addFolder('Layers')
    const mapsFolder = gui.addFolder('Maps')
    layersFolder.add(layers, 'toggleZones', true).name('Toggle Zones')
    layersFolder.add(layers, 'toggleTrucks', true).name('Toggle Trucks')
    layersFolder.open()
    mapsFolder.add(maps, 'us_01_01', true).name('Black River')
    mapsFolder.add(maps, 'us_01_02', true).name('Smithville Dam')
    mapsFolder.add(maps, 'us_01_03', true).name('Island Lake')
    mapsFolder.add(maps, 'us_01_04', true).name('Drummond Island')

    mapsFolder.add(maps, 'us_02_01', true).name('North Port')
    mapsFolder.add(maps, 'us_02_02', true).name('Mountain River')
    mapsFolder.add(maps, 'us_02_03', true).name('White Valley')
    mapsFolder.add(maps, 'us_02_04', true).name('Pedro Bay') 
    mapsFolder.open()
}

function setUpLights(scene: THREE.Scene, isWinter: boolean) {
    const dirLight1 = new THREE.DirectionalLight(0xffffff) // white from above
    dirLight1.position.set(0.5, 1, 0)
    dirLight1.intensity = isWinter ? 0.7 : 0.85 // avoid blowing eyes out on snow
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0xc44a04) // a sunsetty orange from the bottom corner. Not thought through at all
    dirLight2.position.set(-1, -1, -1)
    dirLight2.intensity = 0.2
    scene.add(dirLight2)

    if (isWinter) {
        const alaskaAmbient = new THREE.AmbientLight(0x209edf)
        alaskaAmbient.intensity = 0.1 // tinge of blue. Not sure how to make snow look good really
        scene.add(alaskaAmbient)
    } else {
        const michiganAmbientLight = new THREE.AmbientLight(0xf57373) //slightly red - colour corrects mud to brown rather than sickly green
        michiganAmbientLight.intensity = 0.5
        scene.add(michiganAmbientLight)
    }
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
    for (var i = scene.children.length - 1; i >= 0; i--) {
        var obj = scene.children[i]
        //console.log(`removing ${obj.name}`)
        scene.remove(obj)
    }
}

async function fetchLevelJson(path: string): Promise<LevelJson> {
    const response = await window.fetch(path)

    type JSONResponse = {
        data?: any
        errors?: Array<{ message: string }>
    }
    //const { data, errors }: JSONResponse = await response.json()
    const errors: any[] = []
    const json: LevelJson = await response.json()
    if (response.ok) {
        console.log('ok')

        return json
    } else {
        const error = new Error(errors?.map((e) => e.message).join('\n') ?? 'unknown')
        return Promise.reject(error)
    }
}
