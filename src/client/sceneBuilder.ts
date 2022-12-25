import * as THREE from 'three'
import { LevelJson } from '../typings/types'
import {
    unknownLandmarkMaterial,
    greenTreeMaterial,
    autumnTreeMaterial,
    terrainMaterial,
    modelMaterial,
    zoneMaterial,
    truckMaterial,
} from './materials'
import { LAYERS } from './client'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'

export function setUpMeshesFromMap(scene: THREE.Scene, levelJson: LevelJson) {
    const { landmarks, models, zones, trucks, mapSize, heightMap } = levelJson

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

    // Draw Base terrain layer ------------------
    const combinePoints = heightMap.reverse().flat()
    const geometry = new THREE.PlaneGeometry(
        mapSize.mapX,
        mapSize.mapZ,
        heightMap.length - 1,
        heightMap[0].length - 1
    )

    geometry.rotateX(-Math.PI / 2) // flat plane
    geometry.rotateY(Math.PI) // SR measures from the opposite corner compared to threejs!

    const vertices = geometry.attributes.position
    for (let i = 0; i < vertices.count; i++) {
        const MAGIC_SCALING_FACTOR = 0.7
        vertices.setY(i, combinePoints[i] * MAGIC_SCALING_FACTOR)
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

function staticMergedMesh(mergedGeoms: THREE.BufferGeometry[], material: THREE.MeshPhongMaterial) {
    var mergedBoxes = BufferGeometryUtils.mergeBufferGeometries(mergedGeoms)
    const mesh = new THREE.Mesh(mergedBoxes, material)
    mesh.updateMatrix()
    mesh.matrixAutoUpdate = false
    return mesh
}
