export const levelJsonPath = (levelFileName: string, versionSuffix: string = ''): string => {
    return `./leveljson/${levelFileName}.pak${versionSuffix}.json`
}
export const terrainImagePath = (levelFileName: string): string => {
    return `./terrainimages/${levelFileName}_map.png`
}
export const tintImagePath = (levelFileName: string): string => {
    return `./tint/${levelFileName}_tint_map__cmp.png`
}
export const mapZonesJsonPath = (levelFileName: string, versionSuffix: string = ''): string => {
    return `./mapZones/mapzones${levelFileName}.sso${versionSuffix}.json`
}
