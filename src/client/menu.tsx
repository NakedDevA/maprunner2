import { MapZonesJson, ZoneSettings } from '../typings/initialCacheTypes'
import { CommonDOMRenderer } from 'render-jsx/dom'
import './menu.scss'
import { TruckCoords } from '../typings/types'

const renderer = new CommonDOMRenderer()

export const renderMenu = async (
    zonesJson: MapZonesJson,
    trucks: TruckCoords[],
    goToObject: (objectName: string) => void
) => {
    // Ugly hack to bin the entire menu before we re-render. Do two because our root element is a fragment which isn't in the DOM
    const menuElement = document.getElementById('menu')
    if (!menuElement) return
    menuElement.firstChild?.remove()
    menuElement.firstChild?.remove()

    const zoneIDList = Object.keys(zonesJson.zoneDesc).sort()

    // truck names aren't unique and they don't have ids, so we use the fixed index in the file
    const trucksWithIds = trucks
        .map((truck, index) => {
            return { ...truck, id: `${truck.name}_${index}` }
        })
        .sort((a, b) => (a.name > b.name ? 1 : -1))

    const truckIDList = trucksWithIds.map((truck) => truck.id)
    const jsx = (
        <>
            <div class="restoreButtonContainer hidden">
                <h2 onclick={showMenu}>{'>>>>'}</h2>
            </div>
            <div class="container">
                <div id={'headings'}>
                    <h2
                        id={'tabHeading-zones'}
                        class={'selected'}
                        onclick={() => onTabClicked('zones')}
                    >
                        Zones
                    </h2>
                    <h2 id={'tabHeading-trucks'} onclick={() => onTabClicked('trucks')}>
                        Trucks
                    </h2>
                    <h2 onclick={hideMenu}>{'<<<<'}</h2>
                </div>
                <div class={'tab'} id={'tab-zones'}>
                    <TabFilter idsToFilter={zoneIDList} idPrefix={'zoneEntry'} />
                    <ul>
                        {zoneIDList.map((zoneId) => {
                            const description = zoneDescription(zonesJson.zoneDesc[zoneId].props)
                            return (
                                <Entry
                                    entryId={`zoneEntry-${zoneId}`}
                                    entryClass={'zoneEntry'}
                                    goToHandler={() => goToObject(zoneId)}
                                    buttonText={zoneId}
                                >
                                    <ZoneDescriptionComponent
                                        zoneProps={zonesJson.zoneDesc[zoneId].props}
                                    ></ZoneDescriptionComponent>
                                </Entry>
                            )
                        })}
                    </ul>
                </div>
                <div class={['tab', 'hidden']} id={'tab-trucks'}>
                    <TabFilter idsToFilter={truckIDList} idPrefix={'truckEntry'} />
                    <ul>
                        {trucksWithIds.map((truck) => {
                            return (
                                <Entry
                                    entryId={`truckEntry-${truck.id}`}
                                    entryClass={'truckEntry'}
                                    goToHandler={() => goToObject(truck.id)}
                                    buttonText={truck.name}
                                >
                                    <p>Task name: {truck.task ? truck.task : 'none'}</p>
                                    <p>Fuel: {truck.fuel}%</p>
                                    <p>Damage: {truck.damage}%</p>
                                    <p>VisualDamage: {truck.visualDamage}%</p>
                                    <p>IsLocked: {truck.isLocked ? 'true' : 'false'}</p>
                                </Entry>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </>
    )
    return renderer.render(jsx).on(menuElement)
}

const Entry = (
    props: {
        entryId: string
        entryClass: string
        buttonText: string
        goToHandler: () => void
    },
    renderer: CommonDOMRenderer,
    children: any
) => {
    return (
        <li class={props.entryClass} id={props.entryId}>
            <button
                onclick={() => {
                    openInfoBox(props.entryId)
                    props.goToHandler()
                }}
            >
                {props.buttonText}
            </button>
            <div class={'infoBox'}>{children}</div>
        </li>
    )
}

const TabFilter = (
    props: {
        idsToFilter: string[]
        idPrefix: string
    },
    renderer: CommonDOMRenderer
) => {
    return (
        <input
            id={'tabFilter'}
            type={Text}
            placeholder={'filter'}
            oninput={(e: { target: HTMLInputElement }) =>
                filterEntries(e.target.value, props.idsToFilter, props.idPrefix)
            }
        ></input>
    )
}
const zoneDescription = (zoneProps: ZoneSettings): string => {
    if (!zoneProps) return 'No properties'
    const keys = Object.keys(zoneProps)
    const string = keys.filter((key) => key.startsWith('Zone')).toString()
    const multiline = string.replace(',', ',\n')
    return multiline
}
const ZoneDescriptionComponent = (
    props: { zoneProps: ZoneSettings },
    renderer: CommonDOMRenderer
) => {
    if (!props.zoneProps) return <p>No Zone Properties</p>
    const propNames = Object.keys(props.zoneProps)

    return (
        <>
            {props.zoneProps.ZonePropertyCargoLoading !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Cargo Loading</h3>
                    {props.zoneProps.ZonePropertyCargoLoading.cargosSettings?.map(
                        (cargoSetting) => {
                            return (
                                <p>
                                    <span>{cargoSetting.name}</span>
                                    <span style={'float:right'}>
                                        ({cargoSetting.count ? cargoSetting.count : 'unlimited'})
                                    </span>
                                </p>
                            )
                        }
                    )}
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyFuelStation !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Fuel Station</h3>
                    {props.zoneProps.ZonePropertyFuelStation.pricePerLiter !== undefined ? (
                        <p>${props.zoneProps.ZonePropertyFuelStation.pricePerLiter} per litre</p>
                    ) : (
                        ''
                    )}
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyUpgradesGiver !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Upgrade</h3>
                    <p>{props.zoneProps.ZonePropertyUpgradesGiver.upgrades[0]}</p>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyWatchpoint !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>WatchPoint</h3>
                    <p>Range: {props.zoneProps.ZonePropertyWatchpoint.range}</p>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyGateway !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Gateway</h3>
                    <p>Linked with: {props.zoneProps.ZonePropertyGateway.levelZoneLink}</p>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyStorehouseCraft !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Crafting</h3>
                    {props.zoneProps.ZonePropertyStorehouseCraft.craftSettings?.map(
                        (craftSetting) => {
                            return (
                                <>
                                    <p class={'craftSetting'}>
                                        <span>{craftSetting.name}</span>
                                        {craftSetting.energy !== undefined ? (
                                            <span
                                                style={'float:right'}
                                            >{`${craftSetting.energy} energy`}</span>
                                        ) : (
                                            ''
                                        )}
                                    </p>

                                    {craftSetting.cargoComponents !== undefined
                                        ? craftSetting.cargoComponents.map((requirement) => {
                                              return (
                                                  <p>
                                                      Requires
                                                      <span style={'float:right'}>
                                                          {`${requirement.name} x${
                                                              requirement.count ?? '1'
                                                          }`}
                                                      </span>
                                                  </p>
                                              )
                                          })
                                        : ''}
                                </>
                            )
                        }
                    )}
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyAutoRepairAndRestore !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>AutoRepairAndRestore</h3>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyCoopTaskGiver !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Coop Task Giver</h3>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyEnergy !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Energy</h3>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyFarmingArea !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Farming Area</h3>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyRecovery !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Recovery Point</h3>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyResupplyRepairParts !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Resupply Repair Point</h3>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyTrailerAttach !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Trailer Store</h3>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyGarageEntrance !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Garage Entrance</h3>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyGarageExit !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Garage Exit</h3>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyManualLoading !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Manual Loading</h3>
                </div>
            ) : (
                ''
            )}
            {props.zoneProps.ZonePropertyWaterStation !== undefined ? (
                <div class={'zoneProp'}>
                    <h3>Water Station</h3>
                    <p>Name: {props.zoneProps.ZonePropertyWaterStation.stationUIName}</p>
                    <p>PricePerLitre: {props.zoneProps.ZonePropertyWaterStation.pricePerLiter}</p>
                    <p>StationType: {props.zoneProps.ZonePropertyWaterStation.stationType}</p>
                    <p>Water: {props.zoneProps.ZonePropertyWaterStation.water ?? '0'}</p>
                    <p>WaterCapacity: {props.zoneProps.ZonePropertyWaterStation.waterCapacity}</p>
                    {props.zoneProps.ZonePropertyWaterStation.sharedZones?.map((zone) => {
                        return <p>SharedZone:{zone.globalZoneId}</p>
                    }) ?? ''}
                </div>
            ) : (
                ''
            )}
        </>
    )
}

const openInfoBox = (clickedId: string) => {
    const clickedZoneInfo = document.querySelector(`#${clickedId}`)
    if (!clickedZoneInfo) return

    //close this one if it's already open
    /* if (clickedZoneInfo.classList.contains('info-open')) {
        return clickedZoneInfo.classList.remove('info-open')
    }*/

    //else close all and open the chosen one
    const openZoneInfos = document.querySelectorAll('.info-open')
    openZoneInfos.forEach((element) => {
        element.classList.remove('info-open')
    })
    clickedZoneInfo.classList.add('info-open')
}

const filterEntries = (input: string, IDList: string[], candidateIDPrefix: string) => {
    for (const truckId of IDList) {
        const entry = document.querySelector(`#${candidateIDPrefix}-${truckId}`)
        if (truckId.toLowerCase().includes(input.toLowerCase())) {
            entry?.removeAttribute('hidden')
        } else {
            entry?.setAttribute('hidden', 'true')
        }
    }
}

const onTabClicked = (tabName: string) => {
    const allHeadings = document.querySelectorAll('#headings h2')
    allHeadings.forEach((heading) => {
        heading.classList.remove('selected')
    })
    const selectedHeading = document.querySelector(`#tabHeading-${tabName}`)
    selectedHeading?.classList.add('selected')

    const allTabs = document.querySelectorAll('.tab')
    allTabs.forEach((tab) => {
        tab.classList.add('hidden')
    })
    const selectedTab = document.querySelector(`#tab-${tabName}`)
    selectedTab?.classList.remove('hidden')
}

const showMenu = () => {
    document.querySelector('.container')?.classList.remove('slideAway')
    document.querySelector('.restoreButtonContainer')?.classList.add('hidden')
}

const hideMenu = () => {
    document.querySelector('.container')?.classList.add('slideAway')
    document.querySelector('.restoreButtonContainer')?.classList.remove('hidden')
}

export const mapIconClicked = (id: string, type: 'trucks' | 'zones') => {
    const elementId = type === 'trucks' ? `truckEntry-${id}` : `zoneEntry-${id}`

    //force select tab
    onTabClicked(type)

    //reset filter
    const filter = document.querySelector('#tabFilter') as HTMLInputElement | undefined
    if (filter) {
        filter.value = ''
        filter.dispatchEvent(new Event('input', { bubbles: true }))
    }

    //show content
    document.querySelector(`#${elementId}`)?.scrollIntoView()
    openInfoBox(elementId)
}
