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

export const parseLandmarkFile = (
    landmarkFile: LandmarkFile
): {
    meshOverrideMatrix: number[]
    textureName?: string
    facesInts: Uint32Array
    verticesFloats: Float32Array
    uvsFloats: Float32Array
} => {
    const xml = new DOMParser().parseFromString(landmarkFile.xml, 'application/xml')
    const textureName =
        xml.getElementsByTagName('Material')[0].getAttribute('AlbedoMap') ?? undefined

    const meshNode = pickLastMeshNode(landmarkFile)
    const faces = meshNode.mesh!.faces.reduce<number[]>(
        (acc, face) => acc.concat(face.a, face.b, face.c),
        []
    )

    // Vertices and UVs are stored in the same array in the lmk file
    const { vertices, uvs } = meshNode.mesh!.vertices.reduce<{ vertices: number[]; uvs: number[] }>(
        (acc, vertex) => {
            acc.vertices.push(vertex.x, vertex.y, vertex.z)

            // UVs can be negative and bigger magnitude than 1, because SR hates me.
            // Take decimal portion then wrap it around 1 if negative
            const uFix = vertex.u < 0 ? (vertex.u % 1) + 1 : vertex.u % 1
            const vFix = vertex.v < 0 ? (vertex.v % 1) + 1 : vertex.v % 1
            acc.uvs.push(uFix, vFix)
            return acc
        },
        { vertices: [], uvs: [] }
    )

    const verticesFloats = new Float32Array([...vertices])
    const uvsFloats = new Float32Array([...uvs])
    const facesInts = new Uint32Array([...faces])
    const meshOverrideMatrix = meshNode.matrix
    return { meshOverrideMatrix, textureName, facesInts, verticesFloats, uvsFloats }
}
