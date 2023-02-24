import * as React from 'react'
import * as THREE from 'three'
import { BoxGeometry, InstancedMesh } from 'three'
import { ModelCoords } from '../../typings/types'
import { LAYERS } from '../client'
import { LandmarkFile } from '../landmarkParser'
import {
    IDENTITY_MATRIX4,
    landmarkUVTexture,
    parseLandmarkFile,
} from './landmarkFileHelpers'

interface ModelKindProps {
    modelCoords: ModelCoords
    landmarkFile: LandmarkFile
}

// Renders all models of a single type, using an instanced mesh and shared material
export default function ModelKind({ modelCoords, landmarkFile }: ModelKindProps) {
    const instancedMeshRef = React.useRef<InstancedMesh>(null!)
    const bufferGeometryRef = React.useRef<BoxGeometry>(null!)

    const { meshOverrideMatrix, textureName, facesInts, verticesFloats, uvsFloats } =
        parseLandmarkFile(landmarkFile)

    const texture = textureName ? landmarkUVTexture(textureName) : undefined

    const entryMatrices = modelCoords.i.map((instance) => {
        const { a1, a2, a3, b1, b2, b3, c1, c2, c3 } = instance.r
        const matrix = new THREE.Matrix4()
        // prettier-ignore
        matrix.set(
            a1, b1, c1, instance.x, 
            a2, b2, c2, instance.y, 
            a3, b3, c3, instance.z, 
            0, 0, 0, 1)

        return matrix
    })

    React.useLayoutEffect(() => {
        //Almost everything has a default transform, however...
        if (meshOverrideMatrix.toString() !== IDENTITY_MATRIX4) {
            const specialGeometryMatrix = new THREE.Matrix4()
            specialGeometryMatrix.fromArray(meshOverrideMatrix)
            bufferGeometryRef.current.applyMatrix4(specialGeometryMatrix)
        }
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
                <bufferGeometry ref={bufferGeometryRef}>
                    <bufferAttribute attach="index" args={[facesInts, 1]} />
                    <bufferAttribute
                        attach={'attributes-position'}
                        args={[verticesFloats, 3]}
                    ></bufferAttribute>
                    <bufferAttribute
                        attach={'attributes-uv'}
                        args={[uvsFloats, 2]}
                    ></bufferAttribute>
                </bufferGeometry>
                <meshPhongMaterial map={texture} />
            </instancedMesh>
        </>
    )
}
