import { MONSTER_PARTY_ASSET_KEYS } from '../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import { ExpBar } from '../common/exp-bar';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager';
import { DataUtils } from '../utils/data-utils';
import { calculateExpBarCurrentValue, expNeededForNextLevel } from '../utils/leveling-utils';
import { BaseScene } from './base-scene';
import { SCENE_KEYS } from './scene-keys';
import { Monster, Attack } from '../types/typedef';

const UI_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: '#FFFFFF',
  fontSize: '24px',
};

const MONSTER_MOVE_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: '#000000',
  fontSize: '40px',
};

const MONSTER_EXP_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: '#000000',
  fontSize: '22px',
};

export type MonsterDetailsSceneData = {
  monster: Monster;
};

export class MonsterDetailsScene extends BaseScene {
  #monsterDetails: Monster;
  #monsterAttacks: Attack[];

  constructor() {
    super({
      key: SCENE_KEYS.MONSTER_DETAILS_SCENE,
    });
  }

  init(data: MonsterDetailsSceneData) {
    super.init(data);

    this.#monsterDetails = data.monster;

    // added for testing from preload scene directly
    if (this.#monsterDetails === undefined) {
      this.#monsterDetails = dataManager.store.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY)[0];
    }

    this.#monsterAttacks = [];
    this.#monsterDetails.attackIds.forEach(attackId => {
      const monsterAttack = DataUtils.getMonsterAttack(this, attackId);
      if (monsterAttack !== undefined) {
        this.#monsterAttacks.push(monsterAttack);
      }
    });
  }

  async create() {
    super.create();

    // create main background and title
    this.add.image(0, 0, MONSTER_PARTY_ASSET_KEYS.MONSTER_DETAILS_BACKGROUND).setOrigin(0);
    this.add.text(10, 0, 'Monster Details', {
      ...UI_TEXT_STYLE,
      fontSize: '48px',
    });

    // add monster details
    this.add.text(20, 60, `Lv. ${this.#monsterDetails.currentLevel}`, {
      ...UI_TEXT_STYLE,
      fontSize: '40px',
    });
    this.add.text(200, 60, this.#monsterDetails.name, {
      ...UI_TEXT_STYLE,
      fontSize: '40px',
    });
    this.add.image(160, 310, this.#monsterDetails.assetKey).setOrigin(0, 1).setScale(0.7);

    if (this.#monsterAttacks[0] !== undefined) {
      this.add.text(560, 82, this.#monsterAttacks[0].name, MONSTER_MOVE_TEXT_STYLE);
    }

    if (this.#monsterAttacks[1] !== undefined) {
      this.add.text(560, 162, this.#monsterAttacks[1].name, MONSTER_MOVE_TEXT_STYLE);
    }

    if (this.#monsterAttacks[2] !== undefined) {
      this.add.text(560, 242, this.#monsterAttacks[2].name, MONSTER_MOVE_TEXT_STYLE);
    }

    if (this.#monsterAttacks[3] !== undefined) {
      this.add.text(560, 322, this.#monsterAttacks[3].name, MONSTER_MOVE_TEXT_STYLE);
    }

    // add monster exp details
    this.add.text(20, 340, 'Current Exp.', MONSTER_EXP_TEXT_STYLE).setOrigin(0, 0);
    this.add.text(516, 340, `${this.#monsterDetails.currentExp}`, MONSTER_EXP_TEXT_STYLE).setOrigin(1, 0);
    this.add.text(20, 365, 'Exp. to next level', MONSTER_EXP_TEXT_STYLE);
    this.add
      .text(
        516,
        365,
        `${expNeededForNextLevel(this.#monsterDetails.currentLevel, this.#monsterDetails.currentExp)}`,
        MONSTER_EXP_TEXT_STYLE,
      )
      .setOrigin(1, 0);
    this.add.text(108, 392, 'EXP', {
      fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
      color: '#6505FF',
      fontSize: '14px',
      fontStyle: 'italic',
    });
    const expBar = new ExpBar(this, 70, 200);
    expBar.setMeterPercentageAnimated(
      calculateExpBarCurrentValue(this.#monsterDetails.currentLevel, this.#monsterDetails.currentExp),
      { skipBattleAnimations: true },
    );

    this.scene.bringToTop(SCENE_KEYS.MONSTER_DETAILS_SCENE);
  }

  update() {
    super.update();

    if (this._controls.isInputLocked) {
      return;
    }

    if (this._controls.wasBackKeyPressed()) {
      this.#goBackToPreviousScene();
      return;
    }

    if (this._controls.wasSpaceKeyPressed()) {
      this.#goBackToPreviousScene();
      return;
    }
  }

  #goBackToPreviousScene() {
    this._controls.lockInput = true;
    this.scene.stop(SCENE_KEYS.MONSTER_DETAILS_SCENE);
    this.scene.resume(SCENE_KEYS.MONSTER_PARTY_SCENE);
  }
}
