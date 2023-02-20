import { useLoader } from '@react-three/fiber'
import * as React from 'react'
import * as THREE from 'three'
import { FileLoader, Loader, ObjectLoader, TextureLoader } from 'three'
import { LevelJson } from '../typings/types'
import {
    terrainImagePath,
    tintImagePath,
    mudImagePath,
    snowImagePath,
    mapZonesJsonPath,
    levelJsonPath,
} from './pathUtils'
import Terrain from './terrain'
import { useFetchJson } from './useFetchJson'

interface LevelProps {
    levelFileName: string
    versionSuffix?: string
}

export default function Level({ levelFileName, versionSuffix }: LevelProps) {
    const [levelTexture, tintTexture, mudTexture] = useLoader(TextureLoader, [
        terrainImagePath(levelFileName),
        tintImagePath(levelFileName),
        mudImagePath(levelFileName),
    ])

    let snowTexture
    try {
        ;[snowTexture] = useLoader(TextureLoader, [snowImagePath(levelFileName)])
    } catch (error) {
        console.log(`Found no snow map for ${levelFileName}`)
    }

    const levelJson = useFetchJson<LevelJson>(levelJsonPath(levelFileName, versionSuffix))

    return (
        <Terrain
            levelTexture={levelTexture}
            tintTexture={tintTexture}
            mudTexture={mudTexture}
            snowTexture={snowTexture}
            levelJson={levelJson}
        />
    )
}
