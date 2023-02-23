import * as React from 'react'
import LandmarkKind from './landmarkKind'
import { LandmarksProps } from './level'

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
