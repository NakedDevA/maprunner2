import * as React from 'react'
import { useState } from 'react'
import './levelMenu.scss'

type LevelMenuProps = {
    pickLevel: (levelId: string) => void
}

const testLevelList = ['level_us_01_01', 'level_us_01_02', 'level_us_01_03', , 'level_us_01_04_new']
export default function LevelMenu({ pickLevel }: LevelMenuProps) {
    return (
        <div id="levelMenu" className="levelMenuContainer">
            <div className="levelList">
                {testLevelList.map((levelId) => {
                    return (
                        <button key={levelId} onClick={() => pickLevel(levelId!)}>
                            {levelId}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
