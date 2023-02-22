import * as React from 'react'
import * as THREE from 'three'
import { InstancedMesh } from 'three'
import { mergeBufferGeometries } from 'three-stdlib/utils/BufferGeometryUtils'
import { LevelJson } from '../typings/types'
import { LAYERS } from './client'
import { LandmarkIndex } from './landmarkParser'
import { modelMaterial } from './materials'

interface MergedLandmarkProps {
    levelJson: LevelJson
    landmarkIndex: LandmarkIndex
}

export default function MergedLandmarks({ levelJson, landmarkIndex }: MergedLandmarkProps) {
    const instancedMeshRef = React.useRef<InstancedMesh>(null!)
    const allLandmarks = levelJson.landmarks

    const allmatrices = allLandmarks.flatMap((landmark) => {
        return landmark.entries.map((entry) => {
            const rotateQuat = new THREE.Quaternion()
            rotateQuat.fromArray(entry.q)
            rotateQuat.normalize()
            const matrix = new THREE.Matrix4()
            matrix.makeRotationFromQuaternion(rotateQuat)
            matrix.setPosition(entry.x, entry.y, entry.z)

            return matrix
        })
    })

    React.useLayoutEffect(() => {
        for (let index = 0; index < allmatrices.length; index++) {
            const matrix = allmatrices[index]
            instancedMeshRef.current.setMatrixAt(index, matrix)
        }
    })

    return (
        <>
            <instancedMesh
                ref={instancedMeshRef}
                args={[undefined, modelMaterial, allmatrices.length]}
                layers={LAYERS.Zones}
            >
                <boxGeometry args={[3, 3, 3]}></boxGeometry>
                <meshPhongMaterial color={0x3a3c42} flatShading />
            </instancedMesh>
        </>
    )
}
