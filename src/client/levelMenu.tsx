import * as React from 'react'
import { useState } from 'react'
import './levelMenu.scss'

type LevelMenuProps = {
    pickLevel: (levelId: string) => void
}

const michigan = ['level_us_01_01', 'level_us_01_02', 'level_us_01_03', , 'level_us_01_04_new']
const don = ['level_ru_05_01', 'level_ru_05_02']
const amur = ['level_ru_04_01', 'level_ru_04_02', 'level_ru_04_03', , 'level_ru_04_04']
export default function LevelMenu({ pickLevel }: LevelMenuProps) {
    return (
        <div id="levelMenu" className="levelMenuContainer">
            <div className="levelList">
                <span>
                    {michigan.map((levelId) => (
                        <button key={levelId} onClick={() => pickLevel(levelId!)}>
                            {levelId}
                        </button>
                    ))}
                </span>
                <span>
                    {don.map((levelId) => (
                        <button key={levelId} onClick={() => pickLevel(levelId!)}>
                            {levelId}
                        </button>
                    ))}
                </span>
                <span>
                    {amur.map((levelId) => (
                        <button key={levelId} onClick={() => pickLevel(levelId!)}>
                            {levelId}
                        </button>
                    ))}
                </span>
            </div>
        </div>
    )
}
