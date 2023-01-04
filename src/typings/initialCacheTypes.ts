//Objective data -------------------------------------
type GlobalZoneId = {
  globalZoneId: string //"level_us_04_01 || US_04_01_TSK_CAT_03",
  __type: "ZoneGlobalIdentificator"
}

export type TaskStage = {
  truckDelivery?: [
    {
      truckId: string
      afterStageFinished: "DESTROY" | "REWARD" //qqtas more
      globalZoneDeliveryId: GlobalZoneId
      uiDesc: string
    }
  ]
  repairTruck?: [
    {
      truckId: string
      afterStageFinished: "DESTROY" | "REWARD"
      uiDesc: string
    }
  ]
  actions?: {
    zoneToFill?: [
      {
        uiDesc: string
        globalZoneId: GlobalZoneId
        cargo: {
          name: "CargoMetalPlanks"
          count: number
          __type: "CargoPack"
        }
        model?: {
          levelName: string
          modelTag: string //"US_04_01_BRIDGE_01_OBJ"
          stagesProgress: {}
          __type: "ModelBuildingSettings"
        }
        additionalUnloadZones?: string[]
      }
    ]
    __type: "ActionPackSettings"
  }
  visitAllZones?: {
    zones: [
      {
        uiDesc: string
        globalZoneId: GlobalZoneId
      }
    ]
    __type: "VisitAllZonesSettings"
  }
}
type ContestResult = {
  timeLimit: number
  xp: number
  money: number
  __type: "ContestResultRewards"
}

export type TaskSettings = {
  uiDesc: string
  stages: TaskStage[]
  description: string
  recommendedTruck?: string
  rewards: {
    ObjectiveRewardExperience?: {
      amount: number
    }
    ObjectiveRewardMoney?: {
      amount: number
    }
    ContestRewards?: {
      timeSettings: {
        GOLD: ContestResult
        SILVER: ContestResult
        BRONZE: ContestResult
      }
      __type: "ObjectiveRewardsByTime"
    }
  }
  taskGiverZone: GlobalZoneId
  additionalTaskGivers?: string[]
  __type: string // usually "TaskSettings" or "ContractSettings" etc unless we have eg Us02_02PipelineObj
}
export type TaskSettingsLookup = {
  __type: string //eg Us02_02PipelineObj
}
export type ContractSettingsLookup = {
  __type: string //eg Us02_02PipelineObj
}
export type ContestSettingsLookup = {
  __type: string //eg Us02_02PipelineObj
}

export type ContractSettings = TaskSettings & {
  employer: string
  region: string //"us_02"
}
export type ContestSettings = TaskSettings & {
  failReasons: {}
}

export type BaseObjectivesFileJson = ObjectivesFileJson & {
  settingsByRegionMap: {}
}
export type ObjectivesFileJson = {
  tasksSettings: {
    [key: string]: TaskSettings | TaskSettingsLookup
  }
  contestSettings: {
    [key: string]: ContestSettings | ContestSettingsLookup
  }
  contractsSettings: {
    [key: string]: ContractSettings | ContractSettingsLookup
  }
}

// Zone data files

export type MapZonesJson = {
  zoneDesc: {
    [key: string]: {
      props: ZoneSettings
    }
  }
}

export type ZoneSettings = {
  ZonePropertyUnloadingCargo?: {}
  ZonePropertyCargoLoading?: {
    cargosSettings?: {
      name: string // "CargoBricks"
      count?: number
    }[]
    platformId?: string //  "US_01_01_WAREHOUSE_MANUAL"
  }
  ZonePropertyManualLoading?: {}
  ZonePropertyFuelStation?: {
    pricePerLiter?: number
  }
  ZonePropertyGateway?: {
    levelZoneLink: string //"level_us_01_02 || MAP_TRANSITION_01_01"
  }
  ZonePropertyWatchpoint?: {
    range: number
  }
  ZonePropertyUpgradesGiver?: {
    upgrades: string[] //"ru_truck_modern_engine_1"
  }
  ZonePropertyTrailerAttach?: {}
  ZonePropertyObjectiveZoneToVisit?: {}
  ZonePropertyGarageEntrance?: {}
  ZonePropertyGarageExit?: {}
  ZonePropertyResupplyRepairParts?: {}
  ZonePropertyAutoRepairAndRestore?: {}
  ZonePropertyStorehouseCraft?: {
    craftSettings: {
      name: string //"CargoMetalPlanks"
      cargoComponents: {
        name: string //  "CargoMetalRoll"
        count: number
      }[]
    }[]
    platformId: string
  }
  ZonePropertyFarmingArea?: {}
  ZonePropertyRecovery?: {} //trials
  ZonePropertyEnergy?: {}
  ZonePropertyLivingArea?: {}
  ZonePropertyCoopTaskGiver?: {}
  __type: "ZoneSettings"
}