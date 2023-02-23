import * as React from 'react'
import { LandmarkCoords } from '../../typings/types'
import { LandmarkIndex } from '../landmarkParser'
import LandmarkKind from './landmarkKind'

interface LandmarksProps {
    landmarkCoords: LandmarkCoords[]
    landmarkIndex: LandmarkIndex
    levelFileName: string
}

export const Landmarks = ({ landmarkCoords, landmarkIndex, levelFileName }: LandmarksProps) => {
    return (
        <>
            {landmarkCoords.map((landmark, index) => (
                <LandmarkKind
                    key={`${levelFileName}_lmkkinds_${index}`}
                    landmarkCoords={landmark}
                    landmarkIndex={landmarkIndex}
                ></LandmarkKind>
            ))}
        </>
    )
}
