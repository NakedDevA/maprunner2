import { useLoader } from '@react-three/fiber'
import * as React from 'react'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import {
    terrainImagePath,
    tintImagePath,
    mudImagePath,
    snowImagePath,
    mapZonesJsonPath,
} from './pathUtils'
import Terrain from './terrain'

interface IProps {
    levelFileName: string
}

export default function Level({ levelFileName }: IProps) {
    const [levelTexture, tintTexture, mudTexture] = useLoader(TextureLoader, [
        terrainImagePath(levelFileName),
        tintImagePath(levelFileName),
        mudImagePath(levelFileName),
    ])

    let snowTexture
    try {
        [snowTexture] = useLoader(TextureLoader, [snowImagePath(levelFileName)])
    } catch (error) {}
    return (
        <Terrain
            levelTexture={levelTexture}
            tintTexture={tintTexture}
            mudTexture={mudTexture}
            snowTexture={snowTexture}
        />
    )
}
