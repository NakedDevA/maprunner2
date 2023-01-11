export const levelJsonPath = (levelFileName: string): string => {
    return `./leveljson/${levelFileName}.pak.json`
}
export const terrainImagePath = (levelFileName: string): string => {
    return `./terrainimages/${levelFileName}_map.png`
}
export const tintImagePath = (levelFileName: string): string => {
    return `./tint/${levelFileName}_tint_map__cmp.png`
}
export const mapZonesJsonPath = (levelFileName: string): string => {
    return `./mapZones/mapzones${levelFileName}.sso.json`
}
