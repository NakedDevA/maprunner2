import { GUI } from 'dat.gui'
import * as THREE from 'three'
import { Box3, Layers, Vector3 } from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import { LevelJson } from '../typings/types'
import { MapZonesJson } from '../typings/initialCacheTypes'
import { setUpMeshesFromMap } from './sceneBuilder'
import { renderMenu } from './menu'
import { levelJsonPath, terrainImagePath, tintImagePath, mapZonesJsonPath } from './pathUtils'

const maps = {
    //trials:
    trial_01_01: async function () {
        await switchToLevel('level_trial_01_01', false)
    },
    trial_01_02: async function () {
        await switchToLevel('level_trial_01_02', false)
    },
    trial_02_01: async function () {
        await switchToLevel('level_trial_02_01', true)
    },
    trial_02_02: async function () {
        await switchToLevel('level_trial_02_02', true)
    },
    trial_03_01: async function () {
        await switchToLevel('level_trial_03_01', true)
    },
    trial_03_02: async function () {
        await switchToLevel('level_trial_03_02', false)
    },
    trial_03_03: async function () {
        await switchToLevel('level_trial_03_03', false)
    },
    trial_04_01: async function () {
        await switchToLevel('level_trial_04_01', false)
    },
    trial_04_02: async function () {
        await switchToLevel('level_trial_04_02', true)
    },
    trial_05_01: async function () {
        await switchToLevel('level_trial_05_01', false)
    },
    //michigan
    us_01_01: async function () {
        await switchToLevel('level_us_01_01', false)
    },
    us_01_02: async function () {
        await switchToLevel('level_us_01_02', false)
    },
    us_01_03: async function () {
        await switchToLevel('level_us_01_03', false)
    },
    us_01_04: async function () {
        await switchToLevel('level_us_01_04_new', false)
    },
    //alaska
    us_02_01: async function () {
        await switchToLevel('level_us_02_01', true)
    },
    us_02_02: async function () {
        await switchToLevel('level_us_02_02_new', true)
    },
    us_02_03: async function () {
        await switchToLevel('level_us_02_03_new', true)
    },
    us_02_04: async function () {
        await switchToLevel('level_us_02_04_new', true)
    },
    // taymyr
    ru_02_01: async function () {
        await switchToLevel('level_ru_02_01_crop', false)
    },
    ru_02_02: async function () {
        await switchToLevel('level_ru_02_02', false)
    },
    ru_02_03: async function () {
        await switchToLevel('level_ru_02_03', false)
    },
    ru_02_04: async function () {
        await switchToLevel('level_ru_02_04', false)
    },
    // kola
    ru_03_01: async function () {
        await switchToLevel('level_ru_03_01', true)
    },
    ru_03_02: async function () {
        await switchToLevel('level_ru_03_02', true)
    },
    // amur
    ru_04_01: async function () {
        await switchToLevel('level_ru_04_01', true)
    },
    ru_04_02: async function () {
        await switchToLevel('level_ru_04_02', true)
    },
    ru_04_03: async function () {
        await switchToLevel('level_ru_04_03', true)
    },
    ru_04_04: async function () {
        await switchToLevel('level_ru_04_04', true)
    },
    // don
    ru_05_01: async function () {
        await switchToLevel('level_ru_05_01', false)
    },
    ru_05_02: async function () {
        await switchToLevel('level_ru_05_02', false)
    },
    // belozersk
    ru_08_01: async function () {
        await switchToLevel('level_ru_08_01', false)
    },
    ru_08_02: async function () {
        await switchToLevel('level_ru_08_02', false)
    },
    ru_08_03: async function () {
        await switchToLevel('level_ru_08_03', false)
    },
    ru_08_04: async function () {
        await switchToLevel('level_ru_08_04', false)
    },
    //wisconsin
    us_03_01: async function () {
        await switchToLevel('level_us_03_01', false)
    },
    us_03_02: async function () {
        await switchToLevel('level_us_03_02', false)
    },
    //yukon
    us_04_01: async function () {
        await switchToLevel('level_us_04_01', false)
    },
    us_04_02: async function () {
        await switchToLevel('level_us_04_02', true)
    },
    //Maine
    us_06_01: async function () {
        await switchToLevel('level_us_06_01', false)
    },
    us_06_02: async function () {
        await switchToLevel('level_us_06_02', true)
    },
    //Tennessee
    us_07_01: async function () {
        await switchToLevel('level_us_07_01', false)
    },
    //PTS - Ontario
    us_09_01: async function () {
        await switchToLevel('level_us_09_01', false)
    },
    us_09_02: async function () {
        await switchToLevel('level_us_09_02', false)
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
const defaultCameraOffset = new Vector3(0, 800, -900)

init()
animate()

// load initial map:
maps.us_01_01()

//-----------------------
function init() {
    scene.background = new THREE.Color(0x444444)

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
    const layersFolder = gui.addFolder('Debug Layers')
    layersFolder.add(layers, 'toggleZones', true).name('Toggle Zones')
    layersFolder.add(layers, 'toggleTrucks', true).name('Toggle Trucks')

    const michiganFolder = gui.addFolder('Michigan')
    const alaskaFolder = gui.addFolder('Alaska')
    const taymyrFolder = gui.addFolder('Taymyr')
    const kolaFolder = gui.addFolder('Kola')
    const yukonFolder = gui.addFolder('Yukon')
    const wisonsinFolder = gui.addFolder('Wisconsin')
    const amurFolder = gui.addFolder('Amur')
    const donFolder = gui.addFolder('Don')
    const maineFolder = gui.addFolder('Maine')
    const tennesseeFolder = gui.addFolder('Tennessee')
    const belozerskFolder = gui.addFolder('Belozersk')
    const ptsFolder = gui.addFolder('PTS_ONTARIO')
    const trialsFolder = gui.addFolder('Trials')

    const allMapFunctionNames = Object.getOwnPropertyNames(maps)
    for (const functionName of allMapFunctionNames) {
        switch (functionName.substring(0, 5)) {
            case 'us_01':
                michiganFolder.add(maps, functionName)
                break
            case 'us_02':
                alaskaFolder.add(maps, functionName)
                break
            case 'ru_02':
                taymyrFolder.add(maps, functionName)
                break
            case 'ru_03':
                kolaFolder.add(maps, functionName)
                break
            case 'us_04':
                yukonFolder.add(maps, functionName)
                break
            case 'us_03':
                wisonsinFolder.add(maps, functionName)
                break
            case 'ru_04':
                amurFolder.add(maps, functionName)
                break
            case 'ru_05':
                donFolder.add(maps, functionName)
                break
            case 'us_06':
                maineFolder.add(maps, functionName)
                break
            case 'us_07':
                tennesseeFolder.add(maps, functionName)
                break
            case 'ru_08':
                belozerskFolder.add(maps, functionName)
                break
            case 'us_09':
                ptsFolder.add(maps, functionName)
                break
            case 'trial':
                trialsFolder.add(maps, functionName)
                break

            default:
                break
        }
    }
    michiganFolder.open()
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
export function moveCameraToObject(objName: string, scene: THREE.Scene, offset: THREE.Vector3) {
    const object = scene.getObjectByName(objName)
    if (!object) return
    //centre controls around our obj
    const __box = new Box3().setFromObject(object)
    const center = __box.getCenter(new Vector3())
    controls.target = center

    // focus camera to obj
    camera.lookAt(object.position)
    // position camera offset from object. NB the flipped coords are starting to mount up here.
    camera.position.set(
        object.position.x + offset.x * -1,
        object.position.y + offset.y,
        object.position.z + offset.z
    )
}

//---------------- fetchies:

async function switchToLevel(levelFileName: string, isSnow: boolean) {
    const loadingSpinner = document.getElementById('loading-spinner')
    if (loadingSpinner !== null) {
        loadingSpinner.style.display = 'block'
    }

    const [levelJson, levelTexture, tintTexture, zonesJson] = await Promise.all([
        fetchJson<LevelJson>(levelJsonPath(levelFileName)),
        fetchLevelTexture(terrainImagePath(levelFileName)),
        fetchLevelTexture(tintImagePath(levelFileName)),
        fetchJson<MapZonesJson>(mapZonesJsonPath(levelFileName)),
    ])
    clearScene(scene)
    setUpMeshesFromMap(scene, levelJson, levelTexture, tintTexture)
    setUpLights(scene, isSnow)

    const goToObject = (objectName: string) =>
        moveCameraToObject(objectName, scene, new THREE.Vector3(-150, 250, -250))
    renderMenu(zonesJson, levelJson.trucks, goToObject)

    moveCameraToObject('terrainMesh', scene, defaultCameraOffset)
    if (loadingSpinner !== null) {
        loadingSpinner.style.display = 'none'
    }
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
