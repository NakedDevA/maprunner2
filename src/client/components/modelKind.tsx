import * as React from 'react'
import * as THREE from 'three'
import { BoxGeometry, BufferGeometry, InstancedMesh, sRGBEncoding } from 'three'
import { LandmarkCoords, LevelJson, ModelCoords } from '../../typings/types'
import { LAYERS } from '../client'
import { LandmarkFile, LandmarkIndex, TreeNode } from '../landmarkParser'

interface ModelKindProps {
    modelCoords: ModelCoords
    landmarkIndex: LandmarkIndex
}

// Renders all models of a single type, using an instanced mesh and shared material
export default function ModelKind({ modelCoords, landmarkIndex }: ModelKindProps) {
    const instancedMeshRef = React.useRef<InstancedMesh>(null!)
    const bufferGeometryRef = React.useRef<BoxGeometry>(null!)

    const model = modelCoords
    
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
        //Almost everything has a default transform, however...
        /*   if (meshNode.matrix.toString() !== IDENTITY_MATRIX4) {
            //console.log(`got weird matrix: ${landmarkCoords.name}`)
            const specialGeometryMatrix = new THREE.Matrix4()
            specialGeometryMatrix.fromArray(meshNode.matrix)
            bufferGeometryRef.current.applyMatrix4(specialGeometryMatrix)
        }
        */
        //Apply individual matrices to all individual trees
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
                <boxGeometry ref={bufferGeometryRef} args={[1, 1, 1]}>
                    <meshPhongMaterial color={0xdedede} />
                </boxGeometry>
            </instancedMesh>
        </>
    )
}
