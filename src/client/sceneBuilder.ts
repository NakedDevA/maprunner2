import * as THREE from 'three'
import {
    LandmarkCoords,
    LevelJson,
    MapSize,
    ModelCoords,
    TruckCoords,
    ZoneCoords,
} from '../typings/types'
import {
    unknownLandmarkMaterial,
    greenTreeMaterial,
    autumnTreeMaterial,
    modelMaterial,
    zoneMaterial,
    truckMaterial,
    brownsMaterial,
    greysMaterial,
} from './materials'
import { LAYERS } from './client'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'
import { Scene } from 'three'

export function setUpMeshesFromMap(scene: THREE.Scene, levelJson: LevelJson, levelTexture:THREE.Texture, tintTexture:THREE.Texture) {
    const { landmarks, models, zones, trucks, mapSize, heightMapList } = levelJson

    //SR map points run bottom to top, right to left. So we have to reverse points in both axes
    // All the coordinate weirdness is done to the terrain mesh so we can be in sane happy land for objects ON the map
    const listToReverse = [...heightMapList]
    const reversedList = listToReverse.reverse()
    const chunked = chunk(reversedList, mapSize.pointsX)
    const fixedHeightMap = chunked.map((row) => row.reverse()).flat()

    addLandmarks(landmarks, scene)
    addTerrain(mapSize, levelTexture,tintTexture, scene, fixedHeightMap)
    addModels(models, scene)
    addZones(zones, scene, fixedHeightMap, mapSize)
    addTrucks(trucks, scene)
}

function addTrucks(trucks: TruckCoords[], scene: THREE.Scene) {
    for (const truck of trucks) {
        //console.log(zone.name)
        const { a1, a2, a3, b1, b2, b3, c1, c2, c3 } = truck.rotation
        var newBox1 = new THREE.BoxGeometry(16, 8, 8)
        const quaternion = new THREE.Quaternion()
        const matrix = new THREE.Matrix4()
        // prettier-ignore
        matrix.set(
            a1, a2, a3, 0, 
            b1, b2, b3, 0, 
            c1, c2, c3, 0, 
            0, 0, 0, 1)
        quaternion.setFromRotationMatrix(matrix)
        newBox1.applyQuaternion(quaternion)

        newBox1.translate(-truck.x, truck.y, truck.z)

        const mesh = new THREE.Mesh(newBox1, truckMaterial.clone())
        mesh.updateMatrix()
        mesh.matrixAutoUpdate = false
        mesh.layers.set(LAYERS.Trucks)
        mesh.name = truck.name
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
            zone.angleA, 0, zone.angleB, 0, 
            0, 1, 0, 0, 
            -zone.angleB, 0, zone.angleA, 0, 
            0, 0, 0, 1)
        quaternion.setFromRotationMatrix(matrix)
        newBox1.applyQuaternion(quaternion)

        const approxHeight = approxTerrainHeightAtPoint(zone.x, zone.z, mapSize, heightMapList)
        newBox1.translate(-zone.x, approxHeight, zone.z)

        const mesh = new THREE.Mesh(newBox1, zoneMaterial.clone())
        mesh.updateMatrix()
        mesh.matrixAutoUpdate = false
        mesh.layers.set(LAYERS.Zones)
        mesh.name = zone.name
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
    const approxRow =
        mapSize.pointsZ - Math.floor((mapSize.pointsZ * absoluteObjectZ) / mapSize.mapZ)

    // Get the value at this location in the 2d array
    const approxIndexInArray = approxColumn + approxRow * mapSize.pointsX
    const approxHeight = (heightMapList[approxIndexInArray] * mapSize.mapHeight) / 256
    return approxHeight
}

function addModels(models: ModelCoords[], scene: THREE.Scene) {
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

    const modelsMesh = addStaticMergedMesh(mergedModelGeoms, modelMaterial, scene)
}

function addTerrain(
    mapSize: MapSize,
    levelTexture: THREE.Texture,
    tintTexture: THREE.Texture,
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
    geometry.rotateY(Math.PI) // SR measures from the opposite corner compared to threejs!

    const vertices = geometry.attributes.position
    for (let i = 0; i < vertices.count; i++) {
        const MAGIC_SCALING_FACTOR = mapSize.mapHeight / 256
        vertices.setY(i, heightMapList[i] * MAGIC_SCALING_FACTOR)
    }

    const material =  new THREE.MeshPhongMaterial({
        name: 'terrainMaterial',
        map: levelTexture,
        specularMap:tintTexture,
        shininess: 50
    })
    const terrainMesh = new THREE.Mesh(geometry, material)
    terrainMesh.name = 'terrainMesh'
    scene.add(terrainMesh)
}

function addLandmarks(landmarks: LandmarkCoords[], scene: THREE.Scene) {
    var mergedLandmarkGeoms = []
    var mergedGreenTreeGeoms = []
    var mergedAutumnTreeGeoms = []
    var mergedBrownGeoms = []
    var mergedGreyGeoms = []
    for (const landmark of landmarks) {
        //console.log(`${landmark.name} x ${landmark.entries.length}`)
        for (const entry of landmark.entries) {
            var newBox1 = new THREE.BoxGeometry(3, 2, 3)
            newBox1.translate(-entry.x, entry.y, entry.z)
            if (landmark.name.includes('spruce_') || landmark.name.includes('tsuga')) {
                mergedGreenTreeGeoms.push(newBox1)
            } else if (
                landmark.name.includes('birch_') ||
                landmark.name.includes('aspen') ||
                landmark.name.includes('sugar_maple')
            ) {
                mergedAutumnTreeGeoms.push(newBox1)
            } else if (landmark.name.includes('swamp_')) {
                mergedBrownGeoms.push(newBox1)
            } else if (landmark.name.includes('concrete') || landmark.name.includes('rock')) {
                mergedGreyGeoms.push(newBox1)
            } else mergedLandmarkGeoms.push(newBox1)
        }
    }
    const landmarksMesh = addStaticMergedMesh(mergedLandmarkGeoms, unknownLandmarkMaterial, scene)
    const landmarkSpruceTreesMesh = addStaticMergedMesh(
        mergedGreenTreeGeoms,
        greenTreeMaterial,
        scene
    )
    const landmarkBirchTreesMesh = addStaticMergedMesh(
        mergedAutumnTreeGeoms,
        autumnTreeMaterial,
        scene
    )
    const landmarkBrownsMesh = addStaticMergedMesh(mergedBrownGeoms, brownsMaterial, scene)
    const landmarkGreysMesh = addStaticMergedMesh(mergedGreyGeoms, greysMaterial, scene)
}

function addStaticMergedMesh(
    mergedGeoms: THREE.BufferGeometry[],
    material: THREE.MeshPhongMaterial,
    scene: THREE.Scene
) {
    if (!mergedGeoms.length) return
    var mergedBoxes = BufferGeometryUtils.mergeBufferGeometries(mergedGeoms)
    const mesh = new THREE.Mesh(mergedBoxes, material)
    mesh.updateMatrix()
    mesh.matrixAutoUpdate = false
    scene.add(mesh)
}

function chunk<T>(array: T[], chunkSize: number): T[][] {
    const R = []
    for (let i = 0, len = array.length; i < len; i += chunkSize)
        R.push(array.slice(i, i + chunkSize))
    return R
}
