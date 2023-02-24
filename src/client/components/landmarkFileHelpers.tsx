import * as THREE from 'three'
import { sRGBEncoding } from 'three'
import { LandmarkFile, LandmarkIndex, TreeNode } from '../landmarkParser'

export const IDENTITY_MATRIX4 = '1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1'
export const pickLastMeshNode = (landmark: LandmarkFile): TreeNode => {
    const allNodesWithMeshes = landmark.treeNodes.filter((node) => node.mesh !== undefined)
    const lastMeshNode = allNodesWithMeshes[allNodesWithMeshes.length - 1]
    return lastMeshNode
}
export const lookUpLandmarkData = (name: string, data: LandmarkIndex): LandmarkFile | undefined => {
    const selected = data.find((data) => data.name === name)
    return selected?.data
}
export const landmarkUVTexture = (landmarkTextureName: string) => {
    const loader = new THREE.TextureLoader()
    const fileName = landmarkTextureName.replace('/', '_').replace('.tga', '.png')
    const texture = loader.load(`landmarkTextures/${fileName}`)
    texture.flipY = false
    texture.encoding = sRGBEncoding
    return texture
}
