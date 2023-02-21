import * as THREE from 'three'
import { sRGBEncoding } from 'three'
import { LandmarkFile, LandmarkIndex, Mesh, TreeNode } from './landmarkParser'
const IDENTITY_MATRIX4 = '1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1'

export const lookUpLandmarkData = (name: string, data: LandmarkIndex): LandmarkFile | undefined => {
    const selected = data.find((data) => data.name === name)
    return selected?.data
}

export const makeLandmarkGeometry = (landmark: LandmarkFile): THREE.BufferGeometry => {
    const meshNode = pickLastMeshNode(landmark)
    const mesh = meshNode.mesh!

    const faces = mesh.faces.reduce<number[]>((acc, face) => acc.concat(face.a, face.b, face.c), []) 

    // Vertices and UVs are stored in the same array in the lmk file
    const { vertices, uvs } = mesh.vertices.reduce<{ vertices: number[]; uvs: number[] }>(
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

    const manualGeometry = new THREE.BufferGeometry()
    manualGeometry.setIndex(faces)
    manualGeometry.setAttribute('position', new THREE.BufferAttribute(verticesFloats, 3))
    manualGeometry.setAttribute('uv', new THREE.BufferAttribute(uvsFloats, 2))

    //Almost everything has a default transform, however...
    if (meshNode.matrix.toString() !== IDENTITY_MATRIX4) {
        const matrix = new THREE.Matrix4()
        matrix.fromArray(meshNode.matrix)
        manualGeometry.applyMatrix4(matrix)
    }
    manualGeometry.computeVertexNormals()
    return manualGeometry
}

const pickLastMeshNode = (landmark: LandmarkFile): TreeNode => {
    const allNodesWithMeshes = landmark.treeNodes.filter((node) => node.mesh !== undefined)
    const lastMeshNode = allNodesWithMeshes[allNodesWithMeshes.length - 1]
    return lastMeshNode
}

export const landmarkUVMaterial = (landmarkTextureName: string) => {
    const loader = new THREE.TextureLoader()
    const fileName = landmarkTextureName.replace('/', '_').replace('.tga', '.png')
    const texture = loader.load(`landmarkTextures/${fileName}`)
    texture.flipY = false
    texture.encoding = sRGBEncoding
    
    const uvMaterial = new THREE.MeshPhongMaterial({
        name: landmarkTextureName,
        map: texture,
    })
    return uvMaterial
}
