import * as React from 'react'
import { ModelCoords } from '../../typings/types'
import { LandmarkIndex } from '../landmarkParser'
import { lookUpLandmarkData } from './landmarkFileHelpers'
import ModelKind from './modelKind'
import PlaceholderModelKind from './placeholderModelKind'

interface ModelsProps {
    allModelCoords: ModelCoords[]
    landmarkIndex: LandmarkIndex
    levelFileName: string
}
export const Models = ({ allModelCoords, landmarkIndex, levelFileName }: ModelsProps) => {
    //farplane is variable between maps but other problematic geometries are predictable:
    const bannedModelList = [
        'birds_flying_01',
        'birds_sea_01',
        'air_balloon1',
        'air_balloon2',
        'air_balloon3',
        'air_balloon4',
        'air_balloon5',
        'fireflies_animated_01',
    ]

    const filteredModelCoords = allModelCoords.filter(
        (mc) => !bannedModelList.includes(mc.t) && !mc.t.includes('farplane')
    )
    return (
        <>
            {filteredModelCoords.map((modelCoords, index) => {
                const landmarkFile = lookUpLandmarkData(
                    modelCoords.lmk.replace('/', '_'),
                    landmarkIndex
                )
                return landmarkFile ? (
                    <ModelKind
                        key={`${levelFileName}_model_${index}`}
                        modelCoords={modelCoords}
                        landmarkFile={landmarkFile}
                    />
                ) : (
                    <PlaceholderModelKind
                        key={`${levelFileName}_nomodel_${index}`}
                        modelCoords={modelCoords}
                    ></PlaceholderModelKind>
                )
            })}
        </>
    )
}
