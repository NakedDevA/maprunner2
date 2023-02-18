export const levelJsonPath = (levelFileName: string, versionSuffix: string = ''): string => {
    return `./leveljson/${levelFileName}.pak${versionSuffix}.json`
}
export const terrainImagePath = (levelFileName: string): string => {
    return `./terrainimages/${levelFileName}_map.png`
}
export const tintImagePath = (levelFileName: string): string => {
    return `./tint/${levelFileName}_tint_map__cmp_alpha.png`
}
export const mapZonesJsonPath = (levelFileName: string, versionSuffix: string = ''): string => {
    return `./mapZones/mapzones${levelFileName}.sso${versionSuffix}.json`
}

// Some trucks break convention for their lmk names. This can be looked up in the truck xml, but there are so few we hardcode them:
export const overrideTruckLandmarkNames: Record<string, string> = {
    semitrailer_heavy_oiltank: 'landmarks_semitrailer_heavy_oiltank_01_lmk',
    semitrailer_heavy_construction_equipment:
        'landmarks_semitrailer_heavy_construction_equipment_01_lmk',
    semitrailer_coiled_tubing: 'landmarks_semitrailer_coiled_tubing_01_lmk',
    semitrailer_oil_rig: 'landmarks_semitrailer_oil_rig_01_lmk',
    semitrailer_m747: 'landmarks_semitrailer_m747_01_lmk',
    trailer_watertank:'landmarks_trailer_oiltank_lmk',
    trailer_generator:'landmarks_trailer_flatbed_special_2_lmk',
    dan_96320: 'landmarks_dan_96320_01_lmk',
    step_310e: 'landmarks_step_310e_01_lmk',
    freightliner_114sd: 'landmarks_freightliner_114sd_01_lmk',
    semitrailer_stepdeck_plane_01: 'landmarks_semitrailer_stepdeck_plane_lmk',
    ank_mk38_ht: 'landmarks_ank_mk38_lmk',
}
