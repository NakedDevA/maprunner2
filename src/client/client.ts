import { GUI } from 'dat.gui'
import * as THREE from 'three'
import { Box3, Layers, Vector3 } from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import { LevelJson } from '../typings/types'
import { MapZonesJson } from '../typings/initialCacheTypes'
import { setUpMeshesFromMap } from './sceneBuilder'
import { renderMenu } from './menu'

const maps = {
    //trials:
    trial_01_01: async function () {
        await switchToLevel(
            './leveljson/level_trial_01_01.pak.json',
            './terrainimages/level_trial_01_01_map.png',
            './tint/level_trial_01_01_tint_map__cmp.png',
            false
        )
    },
    trial_01_02: async function () {
        await switchToLevel(
            './leveljson/level_trial_01_02.pak.json',
            './terrainimages/level_trial_01_02_map.png',
            './tint/level_trial_01_02_tint_map__cmp.png',
            false
        )
    },
    trial_02_01: async function () {
        await switchToLevel(
            './leveljson/level_trial_02_01.pak.json',
            './terrainimages/level_trial_02_01_map.png',
            './tint/level_trial_02_01_tint_map__cmp.png',
            true
        )
    },
    trial_02_02: async function () {
        await switchToLevel(
            './leveljson/level_trial_02_02.pak.json',
            './terrainimages/level_trial_02_02_map.png',
            './tint/level_trial_02_02_tint_map__cmp.png',
            true
        )
    },
    trial_03_01: async function () {
        await switchToLevel(
            './leveljson/level_trial_03_01.pak.json',
            './terrainimages/level_trial_03_01_map.png',
            './tint/level_trial_03_01_tint_map__cmp.png',
            true
        )
    },
    trial_03_02: async function () {
        await switchToLevel(
            './leveljson/level_trial_03_02.pak.json',
            './terrainimages/level_trial_03_02_map.png',
            './tint/level_trial_03_02_tint_map__cmp.png',
            false
        )
    },
    trial_03_03: async function () {
        await switchToLevel(
            './leveljson/level_trial_03_03.pak.json',
            './terrainimages/level_trial_03_03_map.png',
            './tint/level_trial_03_03_tint_map__cmp.png',
            false
        )
    },
    trial_04_01: async function () {
        await switchToLevel(
            './leveljson/level_trial_04_01.pak.json',
            './terrainimages/level_trial_04_01_map.png',
            './tint/level_trial_04_01_tint_map__cmp.png',
            false
        )
    },
    trial_04_02: async function () {
        await switchToLevel(
            './leveljson/level_trial_04_02.pak.json',
            './terrainimages/level_trial_04_02_map.png',
            './tint/level_trial_04_02_tint_map__cmp.png',
            true
        )
    },
    trial_05_01: async function () {
        await switchToLevel(
            './leveljson/level_trial_05_01.pak.json',
            './terrainimages/level_trial_05_01_map.png',
            './tint/level_trial_05_01_tint_map__cmp.png',
            false
        )
    },
    //michigan
    us_01_01: async function () {
        await switchToLevel(
            './leveljson/level_us_01_01.pak.json',
            './terrainimages/level_us_01_01_map.png',
            './tint/level_us_01_01_tint_map__cmp.png',
            false
        )
    },
    us_01_02: async function () {
        await switchToLevel(
            './leveljson/level_us_01_02.pak.json',
            './terrainimages/level_us_01_02_map.png',
            './tint/level_us_01_02_tint_map__cmp.png',
            false
        )
    },
    us_01_03: async function () {
        await switchToLevel(
            './leveljson/level_us_01_03.pak.json',
            './terrainimages/level_us_01_03_map.png',
            './tint/level_us_01_03_tint_map__cmp.png',
            false
        )
    },
    us_01_04: async function () {
        await switchToLevel(
            './leveljson/level_us_01_04_new.pak.json',
            './terrainimages/level_us_01_04_new_map.png',
            './tint/level_us_01_04_new_tint_map__cmp.png',
            false
        )
    },
    //alaska
    us_02_01: async function () {
        await switchToLevel(
            './leveljson/level_us_02_01.pak.json',
            './terrainimages/level_us_02_01_map.png',
            './tint/level_us_02_01_tint_map__cmp.png',
            true
        )
    },
    us_02_02: async function () {
        await switchToLevel(
            './leveljson/level_us_02_02_new.pak.json',
            './terrainimages/level_us_02_02_new_map.png',
            './tint/level_us_02_02_new_tint_map__cmp.png',
            true
        )
    },
    us_02_03: async function () {
        await switchToLevel(
            './leveljson/level_us_02_03_new.pak.json',
            './terrainimages/level_us_02_03_new_map.png',
            './tint/level_us_02_03_new_tint_map__cmp.png',
            true
        )
    },
    us_02_04: async function () {
        await switchToLevel(
            './leveljson/level_us_02_04_new.pak.json',
            './terrainimages/level_us_02_04_new_map.png',
            './tint/level_us_02_04_new_tint_map__cmp.png',
            true
        )
    },
    // taymyr
    ru_02_01: async function () {
        await switchToLevel(
            './leveljson/level_ru_02_01_crop.pak.json',
            './terrainimages/level_ru_02_01_crop_map.png',
            './tint/level_ru_02_01_crop_tint_map__cmp.png',
            false
        )
    },
    ru_02_02: async function () {
        await switchToLevel(
            './leveljson/level_ru_02_02.pak.json',
            './terrainimages/level_ru_02_02_map.png',
            './tint/level_ru_02_02_tint_map__cmp.png',
            false
        )
    },
    ru_02_03: async function () {
        await switchToLevel(
            './leveljson/level_ru_02_03.pak.json',
            './terrainimages/level_ru_02_03_map.png',
            './tint/level_ru_02_03_tint_map__cmp.png',
            false
        )
    },
    ru_02_04: async function () {
        await switchToLevel(
            './leveljson/level_ru_02_04.pak.json',
            './terrainimages/level_ru_02_04_map.png',
            './tint/level_ru_02_04_tint_map__cmp.png',
            false
        )
    },
    // kola
    ru_03_01: async function () {
        await switchToLevel(
            './leveljson/level_ru_03_01.pak.json',
            './terrainimages/level_ru_03_01_map.png',
            './tint/level_ru_03_01_tint_map__cmp.png',
            true
        )
    },
    ru_03_02: async function () {
        await switchToLevel(
            './leveljson/level_ru_03_02.pak.json',
            './terrainimages/level_ru_03_02_map.png',
            './tint/level_ru_03_02_tint_map__cmp.png',
            true
        )
    },
    // amur
    ru_04_01: async function () {
        await switchToLevel(
            './leveljson/level_ru_04_01.pak.json',
            './terrainimages/level_ru_04_01_map.png',
            './tint/level_ru_04_01_tint_map__cmp.png',
            true
        )
    },
    ru_04_02: async function () {
        await switchToLevel(
            './leveljson/level_ru_04_02.pak.json',
            './terrainimages/level_ru_04_02_map.png',
            './tint/level_ru_04_02_tint_map__cmp.png',
            true
        )
    },
    ru_04_03: async function () {
        await switchToLevel(
            './leveljson/level_ru_04_03.pak.json',
            './terrainimages/level_ru_04_03_map.png',
            './tint/level_ru_04_03_tint_map__cmp.png',
            true
        )
    },
    ru_04_04: async function () {
        await switchToLevel(
            './leveljson/level_ru_04_04.pak.json',
            './terrainimages/level_ru_04_04_map.png',
            './tint/level_ru_04_04_tint_map__cmp.png',
            true
        )
    },
    // don
    ru_05_01: async function () {
        await switchToLevel(
            './leveljson/level_ru_05_01.pak.json',
            './terrainimages/level_ru_05_01_map.png',
            './tint/level_ru_05_01_tint_map__cmp.png',
            false
        )
    },
    ru_05_02: async function () {
        await switchToLevel(
            './leveljson/level_ru_05_02.pak.json',
            './terrainimages/level_ru_05_02_map.png',
            './tint/level_ru_05_02_tint_map__cmp.png',
            false
        )
    },
    // belozersk
    ru_08_01: async function () {
        await switchToLevel(
            './leveljson/level_ru_08_01.pak.json',
            './terrainimages/level_ru_08_01_map.png',
            './tint/level_ru_08_01_tint_map__cmp.png',
            false
        )
    },
    ru_08_02: async function () {
        await switchToLevel(
            './leveljson/level_ru_08_02.pak.json',
            './terrainimages/level_ru_08_02_map.png',
            './tint/level_ru_08_02_tint_map__cmp.png',
            false
        )
    },
    ru_08_03: async function () {
        await switchToLevel(
            './leveljson/level_ru_08_03.pak.json',
            './terrainimages/level_ru_08_03_map.png',
            './tint/level_ru_08_03_tint_map__cmp.png',
            false
        )
    },
    ru_08_04: async function () {
        await switchToLevel(
            './leveljson/level_ru_08_04.pak.json',
            './terrainimages/level_ru_08_04_map.png',
            './tint/level_ru_08_04_tint_map__cmp.png',
            false
        )
    },
    //wisconsin
    us_03_01: async function () {
        await switchToLevel(
            './leveljson/level_us_03_01.pak.json',
            './terrainimages/level_us_03_01_map.png',
            './tint/level_us_03_01_tint_map__cmp.png',
            false
        )
    },
    us_03_02: async function () {
        await switchToLevel(
            './leveljson/level_us_03_02.pak.json',
            './terrainimages/level_us_03_02_map.png',
            './tint/level_us_03_02_tint_map__cmp.png',
            false
        )
    },
    //yukon
    us_04_01: async function () {
        await switchToLevel(
            './leveljson/level_us_04_01.pak.json',
            './terrainimages/level_us_04_01_map.png',
            './tint/level_us_04_01_tint_map__cmp.png',
            false
        )
    },
    us_04_02: async function () {
        await switchToLevel(
            './leveljson/level_us_04_02.pak.json',
            './terrainimages/level_us_04_02_map.png',
            './tint/level_us_04_02_tint_map__cmp.png',
            true
        )
    },
    //Maine
    us_06_01: async function () {
        await switchToLevel(
            './leveljson/level_us_06_01.pak.json',
            './terrainimages/level_us_06_01_map.png',
            './tint/level_us_06_01_tint_map__cmp.png',
            false
        )
    },
    us_06_02: async function () {
        await switchToLevel(
            './leveljson/level_us_06_02.pak.json',
            './terrainimages/level_us_06_02_map.png',
            './tint/level_us_06_02_tint_map__cmp.png',
            true
        )
    },
    //Tennessee
    us_07_01: async function () {
        await switchToLevel(
            './leveljson/level_us_07_01.pak.json',
            './terrainimages/level_us_07_01_map.png',
            './tint/level_us_07_01_tint_map__cmp.png',
            false
        )
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
renderer.shadowMap.enabled = true

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
const controls = new MapControls(camera, renderer.domElement)

init()
animate()

// load initial map:
maps.us_01_01()

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

    const allMapFunctionNames = Object.getOwnPropertyNames(maps)
    for (const functionName of allMapFunctionNames) {
        mapsFolder.add(maps, functionName, true)
    }
    mapsFolder.open()

    const truckbutton = document.getElementById('truckbutton')
    if (truckbutton)
        truckbutton.onclick = () => {
            moveCameraToObject('FUEL_FACTORY', scene)
        }
}

function setUpLights(scene: THREE.Scene, isWinter: boolean) {
    const dirLight1 = new THREE.DirectionalLight(0xffffff) // white from above
    dirLight1.position.set(2000, 1250, 0)
    dirLight1.intensity = isWinter ? 0.9 : 1.2 // avoid blowing eyes out on snow
    dirLight1.castShadow = true
    const r = 3
    const d = 1000
    const mapSize = 4000
    dirLight1.shadow.radius = r
    dirLight1.shadow.mapSize.width = mapSize
    dirLight1.shadow.mapSize.height = mapSize
    dirLight1.shadow.camera.top = dirLight1.shadow.camera.right = d
    dirLight1.shadow.camera.bottom = dirLight1.shadow.camera.left = -d
    dirLight1.shadow.camera.near = 1
    dirLight1.shadow.camera.far = 20000
    dirLight1.shadow.blurSamples = 16
    dirLight1.shadow.bias = 0.0005
    //dirLight1.shadow.normalBias = 2.5 // 2.5 removes all banding
    //scene.add(new THREE.DirectionalLightHelper(dirLight1))
    scene.add(dirLight1)
    //scene.add( new THREE.CameraHelper( dirLight1.shadow.camera ) )

    if (isWinter) {
        const alaskaAmbient = new THREE.AmbientLight(0xaaedff)
        alaskaAmbient.intensity = 0.2 // tinge of blue. Not sure how to make snow look good really
        scene.add(alaskaAmbient)
    } else {
        const michiganAmbientLight = new THREE.AmbientLight(0xffadad) //slightly yellow - colour corrects mud to brown rather than sickly green
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
                    return acc.concat(`${intersection.object.userData.displayName}\n`)
                }, '')
                infoElement.innerText = allIntersects
                infoElement.style.display = 'inline-block'
            }
        }
    } else {
        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex)
        INTERSECTED = null
        if (infoElement) infoElement.style.display = 'none'
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
export function moveCameraToObject(objName: string, scene: THREE.Scene) {
    const object = scene.getObjectByName(objName)
    if (!object) return
    //centre controls around our obj
    const __box = new Box3().setFromObject(object)
    const center = __box.getCenter(new Vector3())
    controls.target = center

    // focus camera to obj
    camera.lookAt(object.position)
    // position camera offset from object. NB the flipped coords are starting to mount up here.
    camera.position.set(object.position.x + 150, object.position.y + 250, object.position.z - 250)
}

//---------------- fetchies:

async function switchToLevel(
    levelJsonPath: string,
    terrainImagePath: string,
    tintImagePath: string,
    isSnow: boolean
) {
    console.log(camera.position)
    const levelJson: LevelJson = await fetchJson<LevelJson>(levelJsonPath)
    const levelTexture = await fetchLevelTexture(terrainImagePath)
    const tintTexture = await fetchLevelTexture(tintImagePath)
    clearScene(scene)
    setUpMeshesFromMap(scene, levelJson, levelTexture, tintTexture)
    setUpLights(scene, isSnow)

    const goToObject = (zoneName: string) => moveCameraToObject(zoneName, scene)
    //set zone menu:
    renderMenu('./mapZones/mapzoneslevel_us_01_01.sso.json', goToObject)
}

export async function fetchJson<T>(path: string): Promise<T> {
    const response = await window.fetch(path)
    const json: T = await response.json()
    if (response.ok) {
        return json
    } else {
        const error = new Error(
            `Failed to fetch level JSON from path ${path}, ${response.statusText}`
        )
        return Promise.reject(error)
    }
}

async function fetchLevelTexture(terrainImagePath: string) {
    const loadManager = new THREE.LoadingManager()
    const loader = new THREE.TextureLoader(loadManager)

    const loadingSpinner = document.getElementById('loading-spinner')
    loadManager.onError = () => {
        //console.log('error')
    }
    loadManager.onLoad = () => {
        //console.log('load')
        if (loadingSpinner !== null) {
            loadingSpinner.style.display = 'none'
        }
    }
    loadManager.onStart = () => {
        //console.log('start')
        if (loadingSpinner !== null) {
            loadingSpinner.style.display = 'block'
        }
    }
    loadManager.onProgress = () => {
        //console.log('progress')
    }
    try {
        const levelTexture = await loader.loadAsync(terrainImagePath)
        levelTexture.flipY = false
        console.log(levelTexture?.name)
        return levelTexture
    } catch (error) {
        console.log('Failed to load texture! Have you set the filenames correctly?')
        console.log(error)
        return new THREE.Texture()
    }
}
