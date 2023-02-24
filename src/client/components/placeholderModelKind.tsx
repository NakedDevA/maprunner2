import * as React from 'react'
import * as THREE from 'three'
import { BoxGeometry, BufferGeometry, InstancedMesh, sRGBEncoding } from 'three'
import { LandmarkCoords, LevelJson, ModelCoords } from '../../typings/types'
import { LAYERS } from '../client'
import { LandmarkFile, LandmarkIndex, TreeNode } from '../landmarkParser'
import { lookUpLandmarkData } from './landmarkFileHelpers'

interface PlaceholderModelKindProps {
    modelCoords: ModelCoords
}

// Renders all models of a single type, using an instanced mesh and shared material
export default function PlaceholderModelKind({ modelCoords }: PlaceholderModelKindProps) {
    const instancedMeshRef = React.useRef<InstancedMesh>(null!)
    const bufferGeometryRef = React.useRef<BoxGeometry>(null!)

    
    //Draw box
    //data includes bounding box corners, which we use to give approx mesh size
    const width = modelCoords.c.b.x - modelCoords.c.a.x
    const height = modelCoords.c.b.y - modelCoords.c.a.y
    const depth = modelCoords.c.b.z - modelCoords.c.a.z
    // if (width>10) console.log(`type:${model.t} is ${width} x ${height} x ${depth}`)

    //Bounding boxes aren't symmetric, so we shift the mesh to account for this
    const xOffset = (modelCoords.c.b.x + modelCoords.c.a.x) / 2
    const yOffset = (modelCoords.c.b.y + modelCoords.c.a.y) / 2
    const zOffset = (modelCoords.c.b.z + modelCoords.c.a.z) / 2

    const entryMatrices = modelCoords.i.map((instance) => {
        const { a1, a2, a3, b1, b2, b3, c1, c2, c3 } = instance.r
        const matrix = new THREE.Matrix4()
        // prettier-ignore
        matrix.set(
            a1, b1, c1, instance.x + xOffset, 
            a2, b2, c2, instance.y + yOffset, 
            a3, b3, c3, instance.z + zOffset, 
            0, 0, 0, 1)
        return matrix
    })

    React.useLayoutEffect(() => {
        //Apply individual matrices to all individual boxes
        for (let index = 0; index < entryMatrices.length; index++) {
            const matrix = entryMatrices[index]
            instancedMeshRef.current.setMatrixAt(index, matrix)
        }
        bufferGeometryRef.current.computeVertexNormals()
    })

    

    //NB- random key on instancedmesh prevents react from reusing meshes from incomplete loads.
    // When this happens we get bad UVs, bad transforms etc on a handful of entities.
    return (
        <>
            <instancedMesh
                key={Math.random()}
                ref={instancedMeshRef}
                args={[undefined, undefined, modelCoords.i.length]}
                layers={LAYERS.Models}
                castShadow
                receiveShadow
            >
                <boxGeometry ref={bufferGeometryRef} args={[width, height, depth]}>
                    <meshPhongMaterial color={0xdedede} />
                </boxGeometry>
            </instancedMesh>
        </>
    )
}
