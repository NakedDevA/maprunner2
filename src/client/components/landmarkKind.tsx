import * as React from 'react'
import * as THREE from 'three'
import { BufferGeometry, InstancedMesh } from 'three'
import { LandmarkCoords, LevelJson } from '../../typings/types'
import { LAYERS } from '../client'
import { LandmarkIndex } from '../landmarkParser'
import {
    lookUpLandmarkData,
    landmarkUVTexture,
    pickLastMeshNode,
    IDENTITY_MATRIX4,
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

    const xml = new DOMParser().parseFromString(landmarkFile.xml, 'application/xml')
    const textureName = xml.getElementsByTagName('Material')[0].getAttribute('AlbedoMap')
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

    const meshNode = pickLastMeshNode(landmarkFile)
    const faces = meshNode.mesh!.faces.reduce<number[]>(
        (acc, face) => acc.concat(face.a, face.b, face.c),
        []
    )

    // Vertices and UVs are stored in the same array in the lmk file
    const { vertices, uvs } = meshNode.mesh!.vertices.reduce<{ vertices: number[]; uvs: number[] }>(
        (acc, vertex) => {
            acc.vertices.push(vertex.x, vertex.y, vertex.z)

            // UVs can be negative and bigger magnitude than 1, because SR hates me.
            // Take decimal portion then wrap it around 1 if negative
            const uFix = vertex.u < 0 ? (vertex.u % 1) + 1 : vertex.u % 1
            const vFix = vertex.v < 0 ? (vertex.v % 1) + 1 : vertex.v % 1
            acc.uvs.push(uFix, vFix)
            return acc
        },
        { vertices: [], uvs: [] }
    )

    const verticesFloats = new Float32Array([...vertices])
    const uvsFloats = new Float32Array([...uvs])
    const facesInts = new Uint32Array([...faces])

    React.useLayoutEffect(() => {
        //Almost everything has a default transform, however...
        if (meshNode.matrix.toString() !== IDENTITY_MATRIX4) {
            //console.log(`got weird matrix: ${landmarkCoords.name}`)
            const specialGeometryMatrix = new THREE.Matrix4()
            specialGeometryMatrix.fromArray(meshNode.matrix)
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
