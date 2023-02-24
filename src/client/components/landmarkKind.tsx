import * as React from 'react'
import * as THREE from 'three'
import { BufferGeometry, InstancedMesh } from 'three'
import { LandmarkCoords } from '../../typings/types'
import { LAYERS } from '../client'
import { LandmarkIndex } from '../landmarkParser'
import {
    lookUpLandmarkData,
    landmarkUVTexture,
    IDENTITY_MATRIX4,
    parseLandmarkFile,
} from './landmarkFileHelpers'

interface LandmarkKindProps {
    landmarkIndex: LandmarkIndex
    landmarkCoords: LandmarkCoords
}

// Renders all landmarks of a single type, using an instanced mesh and shared material
export default function LandmarkKind({ landmarkIndex, landmarkCoords }: LandmarkKindProps) {
    const instancedMeshRef = React.useRef<InstancedMesh>(null!)
    const bufferGeometryRef = React.useRef<BufferGeometry>(null!)

    const landmarkFile = lookUpLandmarkData(landmarkCoords.name.replace('/', '_'), landmarkIndex)
    if (!landmarkFile) {
        console.error(`Missing landmark data for ${landmarkCoords.name}`)
        return <></>
    }
    const { meshOverrideMatrix, textureName, facesInts, verticesFloats, uvsFloats } =
        parseLandmarkFile(landmarkFile)

    const texture = textureName ? landmarkUVTexture(textureName) : undefined

    const entryMatrices = landmarkCoords.entries.map((entry) => {
        const rotateQuat = new THREE.Quaternion()
        rotateQuat.fromArray(entry.q)
        rotateQuat.normalize()
        const matrix = new THREE.Matrix4()
        matrix.makeRotationFromQuaternion(rotateQuat)
        matrix.setPosition(entry.x, entry.y, entry.z)
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
                args={[undefined, undefined, landmarkCoords.entries.length]}
                layers={LAYERS.Landmarks}
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
