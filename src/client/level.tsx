import * as React from 'react'
import Terrain from './terrain'
import { useLevelResources } from './useFetchForLevel'
import Zones from './zones'

interface LevelProps {
    levelFileName: string
    versionSuffix?: string
}

export default function Level({ levelFileName, versionSuffix }: LevelProps) {
    const levelResources = useLevelResources(levelFileName, versionSuffix)

    console.log(levelResources?.landmarkModels?.length)

    if (!levelResources) {
        return <></>
    }

    //qqtas turcks lmks models
    return (
        <>
            <Zones levelJson={levelResources.levelJson} />
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
