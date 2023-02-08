import { readNextInt, readNextFloat, readNextInt8, readNextShort } from "./decoderUtils"


export type LandmarkIndex = {
  name: string
  data?: LandmarkFile
}[]

type EndBlock = {
    endA: number
    endB: number
    final0: number
  }
  
  export type LandmarkFile = {
    xmlLength: number
    xml: string
    unknownIntLabel: number
    meshCount: number
    bounds: number[]
    treeNodes: TreeNode[]
    end: {
      end1: number
      end2: number
      end3: number
      endCount: number
      endBlocks: EndBlock[]
    }
  }
  export const processLandmark = (file: Buffer): LandmarkFile => {
    var pos = 0
    const xmlLength = readNextInt(file, pos)
    pos += 4
  
    const xml = file.slice(pos, pos+xmlLength-1).toString() // the last character is null which firefox is sad about 
    pos += xmlLength
  
    const unknownIntLabel = readNextInt(file, pos)
    pos += 4
  
    const meshCount = readNextInt(file, pos)
    pos += 4
  
    const bounds = readNextBounds(file, pos)
    pos += 24
  
    var treeNodes: TreeNode[] = []
    for (let index = 0; index < meshCount; index++) {
      const treeNode = readNextTreeNode(file, pos)
      treeNodes.push(treeNode)
      pos += treeNode.totalLength
    }
    const end1 = readNextInt(file, pos)
    pos += 4
    const end2 = readNextInt(file, pos)
    pos += 4
    const end3 = readNextInt(file, pos)
    pos += 4
  
    const endCount = readNextInt(file, pos)
    pos += 4
  
    var endBlocks: EndBlock[] = []
    for (let index = 0; index < endCount; index++) {
      const endBlock = readNextEndBlock(file, pos)
      endBlocks.push(endBlock)
      pos += 12
    }
    //check
    if (pos !== file.length ) {
      throw new Error(`Did not completely parse landmark file`)
    }
  
    return { xmlLength, xml, unknownIntLabel, meshCount, bounds, treeNodes, end: { end1, end2, end3, endCount, endBlocks } }
  }
  
  
  // Bounds is 6 floats
  function readNextBounds(file: Buffer, pos: number): number[] {
    const bounds = []
    for (let index = 0; index < 6; index++) {
      const number = readNextFloat(file, pos + 4 * index)
      bounds.push(number)
    }
    return bounds
  }
  
  function readNextEndBlock(file: Buffer, pos: number): EndBlock {
    var currentPos = pos
    const endA = readNextFloat(file, currentPos)
    pos += 4
    const endB = readNextFloat(file, currentPos)
    pos += 4
    const final0 = readNextInt(file, currentPos)
    pos += 4
  
    return {endA, endB, final0}
  }
  
  // matrix is x * y floats
  function readNextMatrix(file: Buffer, pos: number, xSize: number, ySize: number): number[] {
    const values = []
    var currentPos = pos
    for (let i = 0; i < ySize; i++) {
      for (let j = 0; j < xSize; j++) {
        const number = readNextFloat(file, currentPos)
        currentPos += 4
        values.push(number)
      }
    }
    return values
  }
  
  export type TreeNode = {
    level: number
    unknownFEFF: Buffer
    index: number
    unknown0: number
    isLeafNode: number
    nameLength: number
    nodeName: Buffer
    matrix: number[]
    mesh?: Mesh
    totalLength: number
  }
  function readNextTreeNode(file: Buffer, pos: number): TreeNode {
    var currentPos = pos
    const level = readNextInt(file, currentPos)
    currentPos += 4
  
    const unknownFEFF = file.slice(currentPos, currentPos + 2)
    currentPos += 2
  
    const index = readNextInt8(file, currentPos)
    currentPos += 1
  
    const unknown0 = readNextInt8(file, currentPos)
    currentPos += 1
  
    const isLeafNode = readNextInt(file, currentPos)
    currentPos += 4
  
    const nameLength = readNextInt(file, currentPos)
    currentPos += 4
  
    const nodeName = file.slice(currentPos, currentPos + nameLength)
    currentPos += nameLength
  
    const matrix = readNextMatrix(file, currentPos, 4, 4)
    currentPos += 4 * 4 * 4
  
    const mesh = isLeafNode ? readNextMesh(file, currentPos) : undefined
    if (isLeafNode) currentPos += mesh!.totalLength 
  
    const totalLength = currentPos - pos
  
    return { level, unknownFEFF, index, unknown0, isLeafNode, nameLength, nodeName, matrix, mesh, totalLength }
  }
  
  export type Mesh = {
    vertexCount: number
    faceCount: number
    meshNameLength: number
    meshName: Buffer
    materialCount: number
    materialCountAgain: number
    unknown0: number
    materials: Material[]
    unknownSix0: Buffer
    bounds: number[]
    materialMapsCount: number
    materialMaps: MaterialMap[]
    unknown11ints: Buffer
    vertices: Vertex[]
    faces: Face[]
    totalLength: number
  }
  function readNextMesh(file: Buffer, pos: number): Mesh {
    var currentPos = pos
    const vertexCount = readNextInt(file, currentPos)
    currentPos += 4
    const faceCount = readNextInt(file, currentPos)
    currentPos += 4
    const meshNameLength = readNextInt(file, currentPos)
    currentPos += 4
    const meshName = file.slice(currentPos, currentPos + meshNameLength)
    currentPos += meshNameLength
  
    const materialCount = readNextInt(file, currentPos)
    currentPos += 4
    const materialCountAgain = readNextInt(file, currentPos)
    currentPos += 4
    const unknown0 = readNextInt(file, currentPos)
    currentPos += 4
  
    var materials: Material[] = []
    for (let index = 0; index < materialCount; index++) {
      const material = readNextMaterial(file, currentPos)
      currentPos += material.totalLength
      materials.push(material)
    }
  
    const unknownSix0 = file.slice(currentPos, currentPos + 6)
    currentPos += 6
  
    const bounds = readNextBounds(file, currentPos)
    currentPos += 24
  
    const materialMapsCount = readNextInt(file, currentPos)
    currentPos += 4
  
    var materialMaps: MaterialMap[] = []
    for (let index = 0; index < materialMapsCount; index++) {
      const materialMap = readNextMaterialMap(file, currentPos)
      currentPos += materialMap.totalLength
      materialMaps.push(materialMap)
    }
  
    // No idea what this is but it's always the same
    const unknown11ints = file.slice(currentPos, currentPos + 11 * 4)
    currentPos += 11 * 4
  
    var vertices: Vertex[] = []
    for (let index = 0; index < vertexCount; index++) {
      const vertex = readNextVertex(file, currentPos)
      currentPos += 7 * 4
      vertices.push(vertex)
    }
  
    var faces: Face[] = []
    for (let index = 0; index < faceCount; index++) {
      const face = readNextFace(file, currentPos)
      currentPos += 3 * 2
      faces.push(face)
    }
  
    const totalLength = currentPos - pos
    return {
      vertexCount,
      faceCount,
      meshNameLength,
      meshName,
      materialCount,
      materialCountAgain,
      unknown0,
      materials,
      unknownSix0,
      bounds,
      materialMapsCount,
      materialMaps,
      unknown11ints,
      vertices,
      faces,
      totalLength,
    }
  }
  
  type Face = {
    a: number
    b: number
    c: number
  }
  function readNextFace(file: Buffer, pos: number): Face {
    var currentPos = pos
    const a = readNextShort(file, currentPos)
    currentPos += 2
    const b = readNextShort(file, currentPos)
    currentPos += 2
    const c = readNextShort(file, currentPos)
    currentPos += 2
  
    return { a, b, c }
  }
  
  type Vertex = {
    x: number
    y: number
    z: number
    u: number
    v: number
    unknown1: number
    unknown2: number
  }
  function readNextVertex(file: Buffer, pos: number): Vertex {
    var currentPos = pos
    const x = readNextFloat(file, currentPos)
    currentPos += 4
    const y = readNextFloat(file, currentPos)
    currentPos += 4
    const z = readNextFloat(file, currentPos)
    currentPos += 4
    const u = readNextFloat(file, currentPos)
    currentPos += 4
    const v = readNextFloat(file, currentPos)
    currentPos += 4
    const unknown1 = readNextFloat(file, currentPos)
    currentPos += 4
    const unknown2 = readNextFloat(file, currentPos)
    currentPos += 4
  
    return { x, y, z, u, v, unknown1, unknown2 }
  }
  
  type Material = {
    nameLength: number
    name: Buffer
    totalLength: number
  }
  
  function readNextMaterial(file: Buffer, pos: number): Material {
    var currentPos = pos
  
    const nameLength = readNextInt(file, currentPos)
    currentPos += 4
  
    const name = file.slice(currentPos, currentPos + nameLength)
    currentPos += nameLength
  
    const totalLength = currentPos - pos
    return { nameLength, name, totalLength }
  }
  
  type MaterialMap = {
    index: number
    faceStartIndex: number
    faceCount: number
    vertexStartIndex: number
    vertexCount: number
    totalLength: number
  }
  function readNextMaterialMap(file: Buffer, pos: number): MaterialMap {
    var currentPos = pos
  
    const index = readNextInt(file, currentPos)
    currentPos += 4
    const faceStartIndex = readNextInt(file, currentPos)
    currentPos += 4
    const faceCount = readNextInt(file, currentPos)
    currentPos += 4
    const vertexStartIndex = readNextInt(file, currentPos)
    currentPos += 4
    const vertexCount = readNextInt(file, currentPos)
    currentPos += 4
  
    const totalLength = currentPos - pos
    return { index, faceStartIndex, faceCount, vertexStartIndex, vertexCount, totalLength }
  }
  