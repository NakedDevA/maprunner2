import * as React from 'react'
import * as THREE from 'three'

import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'
import { LevelJson } from '../typings/types'
import { LAYERS } from './client'
import { LandmarkIndex } from './landmarkParser'
import {
    lookUpLandmarkData,
    makeLandmarkGeometry,
    landmarkUVMaterial,
} from './makeLandmarkGeometry'
import { modelMaterial, zoneMaterial } from './materials'

interface MergedLandmarkProps {
    levelJson: LevelJson
    landmarkIndex: LandmarkIndex
}

const NO_TEXTURE_KEY = 'qqtas'
export default function MergedLandmarks({ levelJson, landmarkIndex }: MergedLandmarkProps) {
    const allLandmarks = levelJson.landmarks
    const geomsToMerge = allLandmarks.flatMap((landmark) => {
        return landmark.entries.map((entry) => {
            const geom = new THREE.BoxGeometry(3, 3, 3)

            const rotateQuat = new THREE.Quaternion()
            rotateQuat.fromArray(entry.q)
            rotateQuat.normalize()

            const matrix = new THREE.Matrix4()
            matrix.makeRotationFromQuaternion(rotateQuat)
            matrix.setPosition(entry.x, entry.y, entry.z)

            geom.applyMatrix4(matrix)
            return geom
        })
    })
    const merged = React.useMemo(() => {
        return BufferGeometryUtils.mergeBufferGeometries(geomsToMerge)
    }, [geomsToMerge])

    geomsToMerge.forEach(geom=>geom.dispose())


    return <mesh material={modelMaterial} geometry={merged} layers={LAYERS.Zones}></mesh>
}
