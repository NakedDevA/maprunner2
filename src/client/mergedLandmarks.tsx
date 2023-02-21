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
import { modelMaterial } from './materials'

interface MergedLandmarkProps {
    levelJson: LevelJson
    landmarkIndex: LandmarkIndex
}

const NO_TEXTURE_KEY = 'qqtas'
export default function MergedLandmarks({ levelJson, landmarkIndex }: MergedLandmarkProps) {
    const landmarks = levelJson.landmarks

    const geometriesByMaterial = React.useMemo(() => {
        const geometriesByMaterial: Record<string, THREE.BufferGeometry[]> = {}

        //force these to use the standard lmk material
        for (const landmark of landmarks) {
            const landmarkData = lookUpLandmarkData(landmark.name.replace('/', '_'), landmarkIndex)
            if (!landmarkData) {
                console.log(`Missing landmark data for ${landmark.name}`)
                continue
            }
            const landmarkGeometry = makeLandmarkGeometry(landmarkData)
            const xml = new DOMParser().parseFromString(landmarkData.xml, 'application/xml')
            const textureName = xml.getElementsByTagName('Material')[0].getAttribute('AlbedoMap')

            for (const entry of landmark.entries) {
                const geom = landmarkGeometry.clone()
                geom.scale(entry.s, entry.s, entry.s)

                const rotateQuat = new THREE.Quaternion()
                rotateQuat.fromArray(entry.q)
                rotateQuat.normalize()

                const matrix = new THREE.Matrix4()
                matrix.makeRotationFromQuaternion(rotateQuat)
                matrix.setPosition(entry.x, entry.y, entry.z)

                geom.applyMatrix4(matrix)

                const keystring = textureName ?? NO_TEXTURE_KEY
                if (geometriesByMaterial[keystring]) geometriesByMaterial[keystring].push(geom)
                else geometriesByMaterial[keystring] = [geom]
            }
        }

        return geometriesByMaterial
    }, [levelJson, landmarkIndex])

    const meshJSX = React.useMemo(() => {
        const meshJSX: JSX.Element[] = []

        for (const textureName in geometriesByMaterial) {
            const geoms = geometriesByMaterial[textureName]
            const material =
                textureName === NO_TEXTURE_KEY ? modelMaterial : landmarkUVMaterial(textureName)
            const mergedBoxes = BufferGeometryUtils.mergeBufferGeometries(geoms)

            meshJSX.push(
                <mesh
                    key={textureName}
                    geometry={mergedBoxes}
                    material={material}
                    name={textureName}
                    layers={LAYERS.Landmarks}
                    castShadow
                    receiveShadow
                ></mesh>
            )
        }

        return meshJSX
    }, [geometriesByMaterial])

    return <>{meshJSX}</>
}
