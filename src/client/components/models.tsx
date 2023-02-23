import * as React from 'react'
import { ModelCoords } from '../../typings/types'
import { LandmarkIndex } from '../landmarkParser'
import LandmarkKind from './landmarkKind'
import ModelKind from './modelKind'

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
    // Farplane is the skybox, which is stupid to render because it is larger than everything else
    //qqtas filter banned models
    return (
        <>
            {filteredModelCoords.map((modelCoords, index) => (
                <ModelKind
                    key={`${levelFileName}_lmkkinds_${index}`}
                    modelCoords={modelCoords}
                    landmarkIndex={landmarkIndex}
                ></ModelKind>
            ))}
        </>
    )
}
