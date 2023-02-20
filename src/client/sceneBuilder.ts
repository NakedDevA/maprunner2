import * as THREE from 'three'
import {
    LandmarkCoords,
    LevelJson,
    MapSize,
    ModelCoords,
    TruckCoords,
    ZoneCoords,
} from '../typings/types'
import { zoneMaterial, modelMaterial } from './materials'
import { LAYERS } from './client'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'
import { LandmarkIndex } from './landmarkParser'
import {
    lookUpLandmarkData,
    landmarkUVMaterial,
    makeLandmarkGeometry,
} from './makeLandmarkGeometry'
import { overrideTruckLandmarkNames } from './pathUtils'

const NO_TEXTURE_KEY = 'untextured'

export function setUpMeshesFromMap(
    scene: THREE.Scene,
    levelJson: LevelJson,
    levelTexture: THREE.Texture,
    tintTexture: THREE.Texture,
    mudTexture: THREE.Texture,
    snowTexture: THREE.Texture,
    landmarkModels: LandmarkIndex
) {
    const { landmarks, models, zones, trucks, mapSize, heightMapList } = levelJson

    addLandmarks(landmarks, scene, landmarkModels)
    addTerrain(mapSize, levelTexture, tintTexture, mudTexture, snowTexture, scene, heightMapList)
    addModels(models, scene, landmarkModels)
    addZones(zones, scene, heightMapList, mapSize)
    addTrucks(trucks, scene, landmarkModels)
}

function addTrucks(trucks: TruckCoords[], scene: THREE.Scene, landmarkModels: LandmarkIndex) {
    for (let index = 0; index < trucks.length; index++) {
        const truck = trucks[index]

        const truckLandmarkID =
            overrideTruckLandmarkNames[truck.name] ?? `landmarks_${truck.name}_lmk`
        const landmarkData = lookUpLandmarkData(truckLandmarkID, landmarkModels)
        if (!landmarkData) {
            console.log(`Missing landmark file for ${truck.name}`)
            continue
        }

        // Draw landmark model on map
        const landmarkGeometry = makeLandmarkGeometry(landmarkData)
        const xml = new DOMParser().parseFromString(landmarkData.xml, 'application/xml')
        const textureName = xml.getElementsByTagName('Material')[0].getAttribute('AlbedoMap')

        const { a1, a2, a3, b1, b2, b3, c1, c2, c3 } = truck.rotation
        const matrix = new THREE.Matrix4()
        // prettier-ignore
        matrix.set(
            a1, b1, c1, 0, 
            a2, b2, c2, 0, 
            a3, b3, c3, 0, 
            0, 0, 0, 1)

        // some models correspond to the landmarks we're already drawing, potential for duplicates!
        const geom = landmarkGeometry.clone()
        geom.applyMatrix4(matrix)

        const mesh = new THREE.Mesh(geom, landmarkUVMaterial(textureName!))
        mesh.position.set(truck.x, truck.y, truck.z) 
        mesh.updateMatrix()
        mesh.matrixAutoUpdate = false
        mesh.layers.set(LAYERS.Trucks)
        mesh.name = `${truck.name}_${index}`
        mesh.userData = { displayName: truck.name, type: 'trucks' }
        scene.add(mesh)
    }
}

function addZones(
    zones: ZoneCoords[],
    scene: THREE.Scene,
    heightMapList: number[],
    mapSize: MapSize
) {
    for (const zone of zones) {
        //console.log(zone.name)
        var newBox1 = new THREE.BoxGeometry(zone.sizeX, 20, zone.sizeZ)
        // The map file lists two random angles, which seem to correspond to the rotation matrix like this:
        const quaternion = new THREE.Quaternion()
        const matrix = new THREE.Matrix4()
        // prettier-ignore
        matrix.set(
            zone.angleA, 0, -zone.angleB, 0, 
            0, 1, 0, 0, 
            zone.angleB, 0, zone.angleA, 0, 
            0, 0, 0, 1)
        quaternion.setFromRotationMatrix(matrix)
        newBox1.applyQuaternion(quaternion)

        const approxHeight = approxTerrainHeightAtPoint(zone.x, zone.z, mapSize, heightMapList)
        const mesh = new THREE.Mesh(newBox1, zoneMaterial.clone())
        mesh.position.set(zone.x, approxHeight, zone.z)
        mesh.updateMatrix()
        mesh.matrixAutoUpdate = false
        mesh.layers.set(LAYERS.Zones)
        mesh.name = zone.name
        mesh.userData = { displayName: zone.name, type: 'zones' }
        scene.add(mesh)
    }
}

function approxTerrainHeightAtPoint(
    objectX: number,
    objectZ: number,
    mapSize: MapSize,
    heightMapList: number[]
) {
    // Coords are around the centre of the map by default, centre them about 0 instead
    const absoluteObjectX = objectX + mapSize.mapX / 2
    const absoluteObjectZ = objectZ + mapSize.mapZ / 2

    // If the heightMap is a 2d array, find the approximate column and row out object coordinates would be in
    const approxColumn = Math.floor((mapSize.pointsX * absoluteObjectX) / mapSize.mapX)
    const approxRow = Math.floor((mapSize.pointsZ * absoluteObjectZ) / mapSize.mapZ)

    // Get the value at this location in the 2d array
    const approxIndexInArray = approxColumn + approxRow * mapSize.pointsX
    const approxHeight = (heightMapList[approxIndexInArray] * mapSize.mapHeight) / 256
    return approxHeight
}

async function addModels(models: ModelCoords[], scene: THREE.Scene, landmarkModels: LandmarkIndex) {
    var geometriesByMaterial: Record<string, THREE.BufferGeometry[]> = {}
    var backupBoxGeometries: THREE.BufferGeometry[] = []

    for (const model of models) {
        // Farplane is the skybox, which is stupid to render because it is larger than everything else
        if (
            model.t.includes('farplane') ||
            model.t.includes('birds_flying') ||
            model.t.includes('birds_sea') ||
            model.t.includes('air_balloon') ||
            model.t.includes('fireflies_animated_01')
        )
            continue

        const landmarkData = lookUpLandmarkData(model.lmk.replace('/', '_'), landmarkModels)

        if (!landmarkData) {
            //Draw box
            //data includes bounding box corners, which we use to give approx mesh size
            const width = model.c.b.x - model.c.a.x
            const height = model.c.b.y - model.c.a.y
            const depth = model.c.b.z - model.c.a.z
            // if (width>10) console.log(`type:${model.t} is ${width} x ${height} x ${depth}`)

            //Bounding boxes aren't symmetric, so we shift the mesh to account for this
            const xOffset = (model.c.b.x + model.c.a.x) / 2
            const yOffset = (model.c.b.y + model.c.a.y) / 2
            const zOffset = (model.c.b.z + model.c.a.z) / 2

            for (const instance of model.i) {
                const { a1, a2, a3, b1, b2, b3, c1, c2, c3 } = instance.r
                const matrix = new THREE.Matrix4()
                // prettier-ignore
                matrix.set(
                    a1, b1, c1, instance.x + xOffset, 
                    a2, b2, c2, instance.y + yOffset, 
                    a3, b3, c3, instance.z + zOffset, 
                    0, 0, 0, 1)

                // some models correspond to the landmarks we're already drawing, potential for duplicates!
                const geom = new THREE.BoxGeometry(width, height, depth)
                geom.applyMatrix4(matrix)

                backupBoxGeometries.push(geom)
            }
        } else {
            // Draw landmark model on map
            const landmarkGeometry = makeLandmarkGeometry(landmarkData)
            const xml = new DOMParser().parseFromString(landmarkData.xml, 'application/xml')
            const textureName = xml.getElementsByTagName('Material')[0].getAttribute('AlbedoMap')

            for (const instance of model.i) {
                const { a1, a2, a3, b1, b2, b3, c1, c2, c3 } = instance.r
                const matrix = new THREE.Matrix4()
                // prettier-ignore
                matrix.set(
                    a1, b1, c1, instance.x, 
                    a2, b2, c2, instance.y, 
                    a3, b3, c3, instance.z, 
                    0, 0, 0, 1)

                // some models correspond to the landmarks we're already drawing, potential for duplicates!
                const geom = landmarkGeometry.clone()
                geom.applyMatrix4(matrix)
                const keystring = textureName ?? NO_TEXTURE_KEY
                if (geometriesByMaterial[keystring]) geometriesByMaterial[keystring].push(geom)
                else geometriesByMaterial[keystring] = [geom]
            }
        }
    }
    for (const textureName in geometriesByMaterial) {
        const geoms = geometriesByMaterial[textureName]
        const material =
            textureName === NO_TEXTURE_KEY ? modelMaterial : landmarkUVMaterial(textureName)
        addStaticMergedMesh(geoms, material, scene, true, LAYERS.Models)
    }
    addStaticMergedMesh(backupBoxGeometries, modelMaterial, scene, false, LAYERS.BackupModels)
}

function addTerrain(
    mapSize: MapSize,
    levelTexture: THREE.Texture,
    tintTexture: THREE.Texture,
    mudTexture: THREE.Texture,
    snowTexture: THREE.Texture,
    scene: THREE.Scene,
    heightMapList: number[]
) {
    const geometry = new THREE.PlaneGeometry(
        mapSize.mapX,
        mapSize.mapZ,
        mapSize.pointsX - 1,
        mapSize.pointsZ - 1
    )
    geometry.name = 'terraingeom'

    geometry.rotateX(-Math.PI / 2) // flat plane

    const vertices = geometry.attributes.position
    for (let i = 0; i < vertices.count; i++) {
        const MAGIC_SCALING_FACTOR = mapSize.mapHeight / 256
        vertices.setY(i, heightMapList[i] * MAGIC_SCALING_FACTOR)
    }

    const material = new THREE.MeshPhongMaterial({
        name: 'terrainMaterial',
        map: levelTexture,
        specularMap: tintTexture,
        shininess: 50,
        displacementMap:snowTexture,
        displacementScale:5,
        emissiveMap:mudTexture,
        emissive:0xb30000,
        emissiveIntensity: 0,
        //color is used to toggle with the emissive intensity for showing the mud texture more clearly
        //wireframe:true
    })
    const terrainMesh = new THREE.Mesh(geometry, material)

    terrainMesh.name = 'terrainMesh'
    terrainMesh.castShadow = true
    terrainMesh.receiveShadow = true
    scene.add(terrainMesh)
}

function addLandmarks(
    landmarks: LandmarkCoords[],
    scene: THREE.Scene,
    landmarkModels: LandmarkIndex
) {
    var geometriesByMaterial: Record<string, THREE.BufferGeometry[]> = {}

    //force these to use the standard lmk material
    for (const landmark of landmarks) {
        //console.log(`${landmark.name} x ${landmark.entries.length}`)

        const landmarkData = lookUpLandmarkData(landmark.name.replace('/', '_'), landmarkModels)
        if (!landmarkData) {
            console.log(`Missing landmark data for ${landmark.name}`)
            continue
        }
        const landmarkGeometry = makeLandmarkGeometry(landmarkData)
        const xml = new DOMParser().parseFromString(landmarkData.xml, 'application/xml')
        const textureName = xml.getElementsByTagName('Material')[0].getAttribute('AlbedoMap')

        for (const entry of landmark.entries) {
            const geom = landmarkGeometry.clone()
            geom.scale(entry.s, entry.s, entry.s)

            const rotateQuat = new THREE.Quaternion()
            rotateQuat.fromArray(entry.q)
            rotateQuat.normalize()

            const matrix = new THREE.Matrix4()
            matrix.makeRotationFromQuaternion(rotateQuat)
            matrix.setPosition(entry.x, entry.y, entry.z)

            geom.applyMatrix4(matrix)

            const keystring = textureName ?? NO_TEXTURE_KEY
            if (geometriesByMaterial[keystring]) geometriesByMaterial[keystring].push(geom)
            else geometriesByMaterial[keystring] = [geom]
        }
    }
    for (const textureName in geometriesByMaterial) {
        const geoms = geometriesByMaterial[textureName]
        const material =
            textureName === NO_TEXTURE_KEY ? modelMaterial : landmarkUVMaterial(textureName)
        addStaticMergedMesh(geoms, material, scene, true, LAYERS.Landmarks)
    }
}

function addStaticMergedMesh(
    mergedGeoms: THREE.BufferGeometry[],
    material: THREE.MeshPhongMaterial,
    scene: THREE.Scene,
    castShadow = false,
    layer?: number
) {
    if (!mergedGeoms.length) return
    var mergedBoxes = BufferGeometryUtils.mergeBufferGeometries(mergedGeoms)
    const mesh = new THREE.Mesh(mergedBoxes, material)
    mesh.updateMatrix()
    mesh.matrixAutoUpdate = false
    mesh.castShadow = castShadow
    mesh.receiveShadow = false

    if (layer) mesh.layers.set(layer)
    scene.add(mesh)
}

function chunk<T>(array: T[], chunkSize: number): T[][] {
    const R = []
    for (let i = 0, len = array.length; i < len; i += chunkSize)
        R.push(array.slice(i, i + chunkSize))
    return R
}
