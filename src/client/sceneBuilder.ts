import * as THREE from 'three'
import { LevelJson } from '../typings/types'
import {
    unknownLandmarkMaterial,
    greenTreeMaterial,
    autumnTreeMaterial,
    modelMaterial,
    zoneMaterial,
    truckMaterial,
    terrainFromFileMaterial as terrainMaterialFromFile,
} from './materials'
import { LAYERS } from './client'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'

export function setUpMeshesFromMap(scene: THREE.Scene, levelJson: LevelJson, terrainPath: string) {
    const { landmarks, models, zones, trucks, mapSize, heightMap } = levelJson

    addLandmarks(landmarks, scene)
    addTerrain(heightMap, mapSize, terrainPath, scene)
    addModels(models, scene)
    addZones(zones, scene)
    addTrucks(trucks, scene)
}

function addTrucks(
    trucks: { name: string; x: number; y: number; z: number; task: string }[],
    scene: THREE.Scene
) {
    for (const truck of trucks) {
        //console.log(zone.name)
        var newBox1 = new THREE.BoxGeometry(16, 8, 8)
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
    zones: {
        name: string
        x: number
        y: number
        z: number
        angleA: number
        angleB: number
        sizeX: number
        sizeZ: number
    }[],
    scene: THREE.Scene
) {
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
}

function addModels(
    models: { type: string; landmark: string; models: { x: number; y: number; z: number }[] }[],
    scene: THREE.Scene
) {
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
    scene.add(modelsMesh)
}

function addTerrain(
    heightMap: number[][],
    mapSize: { mapX: number; mapZ: number },
    terrainPath: string,
    scene: THREE.Scene
) {
    const pointsToReverse = [...heightMap] // reversing the array mutates the original, so we copy
    const combinePoints = pointsToReverse.reverse().flat()

    const geometry = new THREE.PlaneGeometry(
        mapSize.mapX,
        mapSize.mapZ,
        pointsToReverse.length - 1,
        pointsToReverse[0].length - 1
    )
    geometry.name = terrainPath + 'terraingeom'

    geometry.rotateX(-Math.PI / 2) // flat plane
    geometry.rotateY(Math.PI) // SR measures from the opposite corner compared to threejs!

    const vertices = geometry.attributes.position
    for (let i = 0; i < vertices.count; i++) {
        const MAGIC_SCALING_FACTOR = 0.7
        vertices.setY(i, combinePoints[i] * MAGIC_SCALING_FACTOR)
    }

    const terrainMesh = new THREE.Mesh(geometry, terrainMaterialFromFile(terrainPath))
    terrainMesh.name = terrainPath + 'mesh'
    scene.add(terrainMesh)
}

function addLandmarks(
    landmarks: { name: string; entries: { x: number; y: number; z: number }[] }[],
    scene: THREE.Scene
) {
    var mergedLandmarkGeoms = []
    var mergedGreenTreeGeoms = []
    var mergedAutumnTreeGeoms = []
    for (const landmark of landmarks) {
        //console.log(landmark.name)
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
            } else mergedLandmarkGeoms.push(newBox1)
        }
    }
    const landmarksMesh = staticMergedMesh(mergedLandmarkGeoms, unknownLandmarkMaterial)
    scene.add(landmarksMesh)

    const landmarkSpruceTreesMesh = staticMergedMesh(mergedGreenTreeGeoms, greenTreeMaterial)
    scene.add(landmarkSpruceTreesMesh)

    const landmarkBirchTreesMesh = staticMergedMesh(mergedAutumnTreeGeoms, autumnTreeMaterial)
    scene.add(landmarkBirchTreesMesh)
}

function staticMergedMesh(mergedGeoms: THREE.BufferGeometry[], material: THREE.MeshPhongMaterial) {
    var mergedBoxes = BufferGeometryUtils.mergeBufferGeometries(mergedGeoms)
    const mesh = new THREE.Mesh(mergedBoxes, material)
    mesh.updateMatrix()
    mesh.matrixAutoUpdate = false
    return mesh
}
