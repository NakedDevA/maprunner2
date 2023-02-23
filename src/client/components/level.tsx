import * as React from 'react'
import { LandmarkCoords } from '../../typings/types'
import { LandmarkIndex } from '../landmarkParser'
import { Landmarks } from './landmarks'
import Terrain from './terrain'
import { useLevelResources } from './useFetchForLevel'
import Zones from './zones'

interface LevelProps {
    levelFileName: string
    versionSuffix?: string
}

export default function Level({ levelFileName, versionSuffix }: LevelProps) {
    const levelResources = useLevelResources(levelFileName, versionSuffix)

    if (!levelResources) {
        return <></>
    }

    //qqtas turcks lmks models
    return (
        <>
            <Zones levelJson={levelResources.levelJson} />
            <Landmarks
                landmarkCoords={levelResources.levelJson.landmarks}
                landmarkIndex={levelResources.landmarkModels}
                levelFileName={levelFileName}
            ></Landmarks>
            <Terrain
                levelTexture={levelResources.levelTexture}
                tintTexture={levelResources.tintTexture}
                mudTexture={levelResources.mudTexture}
                snowTexture={levelResources.snowTexture}
                levelJson={levelResources.levelJson}
            />
        </>
    )
}

export interface LandmarksProps {
    landmarkCoords: LandmarkCoords[]
    landmarkIndex: LandmarkIndex
    levelFileName: string
}
