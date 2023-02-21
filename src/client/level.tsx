import * as React from 'react'
import MergedLandmarks from './mergedLandmarks'
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
            <MergedLandmarks levelJson={levelResources.levelJson} landmarkIndex={levelResources.landmarkModels}></MergedLandmarks>
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
