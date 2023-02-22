import { useState, useEffect } from 'react'
import * as THREE from 'three'
import { sRGBEncoding, TextureLoader } from 'three'
import { MapZonesJson } from '../typings/initialCacheTypes'
import { LevelJson } from '../typings/types'
import { LandmarkFile, LandmarkIndex, processLandmark } from './landmarkParser'
import {
    levelJsonPath,
    terrainImagePath,
    tintImagePath,
    mudImagePath,
    snowImagePath,
    mapZonesJsonPath,
    overrideTruckLandmarkNames,
} from './pathUtils'

type LevelResources = {
    levelJson: LevelJson
    levelTexture: THREE.Texture
    tintTexture: THREE.Texture
    mudTexture: THREE.Texture
    snowTexture: THREE.Texture
    zonesJson: MapZonesJson
    landmarkModels: LandmarkIndex
}

export const useLevelResources = (
    levelFileName: string,
    versionSuffix?: string
): LevelResources | undefined => {
    const [resources, setResources] = useState<LevelResources | undefined>(undefined)

    useEffect(() => {
        const loadManager = new THREE.LoadingManager()
        const loader = new THREE.TextureLoader(loadManager)

        async function switchToLevel(levelFileName: string, versionSuffix?: string) {
            const [levelJson, levelTexture, tintTexture, mudTexture, snowTexture, zonesJson] =
                await Promise.all([
                    fetchJson<LevelJson>(levelJsonPath(levelFileName, versionSuffix)),
                    fetchLevelTexture(terrainImagePath(levelFileName), loader),
                    fetchLevelTexture(tintImagePath(levelFileName), loader),
                    fetchLevelTexture(mudImagePath(levelFileName), loader),
                    fetchLevelTexture(snowImagePath(levelFileName), loader),
                    fetchJson<MapZonesJson>(mapZonesJsonPath(levelFileName, versionSuffix)),
                ])
            const landmarkModels = await fetchRequiredLandmarks(levelJson)
            setResources({
                levelJson,
                levelTexture,
                tintTexture,
                mudTexture,
                snowTexture,
                zonesJson,
                landmarkModels,
            })
        }
        switchToLevel(levelFileName, versionSuffix)
    }, [levelFileName])

    return resources
}

async function fetchJson<T>(path: string): Promise<T> {
    const response = await window.fetch(path)
    const json: T = await response.json()
    if (response.ok) {
        return json
    } else {
        const error = new Error(
            `Failed to fetch level JSON from path ${path}, ${response.statusText}`
        )
        return Promise.reject(error)
    }
}

async function fetchLevelTexture(terrainImagePath: string, loader: TextureLoader) {
    try {
        const levelTexture = await loader.loadAsync(terrainImagePath)
        levelTexture.encoding = sRGBEncoding
        //console.log(levelTexture?.name)
        return levelTexture
    } catch (error) {
        console.log('Failed to load texture! Have you set the filenames correctly?')
        console.log(error)
        return new THREE.Texture()
    }
}

async function fetchRequiredLandmarks(levelJson: LevelJson) {
    const pathsFromModels: string[] = levelJson.models.reduce<string[]>((acc, model) => {
        if (model.lmk.length) acc.push(model.lmk.replace('/', '_'))
        return acc
    }, [])
    const pathsFromLandmarks = levelJson.landmarks.reduce<string[]>((acc, landmark) => {
        if (landmark.name) acc.push(landmark.name.replace('/', '_'))
        return acc
    }, [])
    const pathsFromTrucks = levelJson.trucks.reduce<string[]>((acc, truck) => {
        if (truck.name) {
            const truckLmkName =
                overrideTruckLandmarkNames[truck.name] ?? `landmarks_${truck.name}_lmk`
            acc.push(truckLmkName)
        }
        return acc
    }, [])

    const uniquePaths = [
        ...new Set([...pathsFromLandmarks, ...pathsFromModels, ...pathsFromTrucks]),
    ]

    const landmarkFiles = await Promise.all(
        uniquePaths.map(async (path) => {
            const data = await fetchLandmarkData(path)
            return { name: path, data }
        })
    )

    return landmarkFiles
}

function arrayBufferToBufferCycle(ab: ArrayBuffer) {
    var buffer = Buffer.alloc(ab.byteLength)
    var view = new Uint8Array(ab)
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i]
    }
    return buffer
}

async function fetchLandmarkData(landmarkPath: string): Promise<LandmarkFile | undefined> {
    try {
        const response = await window.fetch(`landmarks/${landmarkPath}`)
        const arrayBuffer = await response.arrayBuffer()
        if (response.status !== 200) return undefined

        const buffer = arrayBufferToBufferCycle(arrayBuffer)
        const landmark = processLandmark(buffer)

        return landmark
    } catch (error) {
        console.log(
            `Failed to load landmark data for ${landmarkPath}! Have you set the filenames correctly?`
        )
        console.log(error)
        return
    }
}
