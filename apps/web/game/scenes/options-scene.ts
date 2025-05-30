import { SCENE_KEYS } from './scene-keys';
import { UI_ASSET_KEYS } from '../assets/asset-keys';
import { NineSlice } from '../utils/nine-slice';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import {
  BATTLE_SCENE_OPTIONS,
  BATTLE_STYLE_OPTIONS,
  OPTION_MENU_OPTIONS,
  SOUND_OPTIONS,
  TEXT_SPEED_OPTIONS,
} from '../common/options';
import { DIRECTION, Direction } from '../common/direction';
import { exhaustiveGuard } from '../utils/guard';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager';
import { BaseScene } from './base-scene';
import { setGlobalSoundSettings } from '../utils/audio-utils';
import {
  OptionMenuOptions,
  TextSpeedMenuOptions,
  BattleSceneMenuOptions,
  BattleStyleMenuOptions,
  SoundMenuOptions,
  VolumeMenuOptions,
  MenuColorOptions,
} from '../common/options';

const OPTIONS_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: '#FFFFFF',
  fontSize: '30px',
};

const OPTION_MENU_OPTION_INFO_MSG = Object.freeze({
  TEXT_SPEED: 'Choose one of three text display speeds.',
  BATTLE_SCENE: 'Choose to display battle animations and effects or not.',
  BATTLE_STYLE: 'Choose to allow your monster to be recalled between rounds.',
  SOUND: 'Choose to enable or disable the sound.',
  VOLUME: 'Choose the volume of the music and sound effects of the game.',
  MENU_COLOR: 'Choose one of the three menu color options.',
  CONFIRM: 'Save your changes and go back to the main menu.',
});

const TEXT_FONT_COLORS = Object.freeze({
  NOT_SELECTED: '#FFFFFF',
  SELECTED: '#FF2222',
});

export class OptionsScene extends BaseScene {
  #mainContainer: Phaser.GameObjects.Container;
  #nineSliceMainContainer: NineSlice;
  #textSpeedOptionTextGameObjects: Phaser.GameObjects.Group;
  #battleSceneOptionTextGameObjects: Phaser.GameObjects.Group;
  #battleStyleOptionTextGameObjects: Phaser.GameObjects.Group;
  #soundOptionTextGameObjects: Phaser.GameObjects.Group;
  #volumeOptionsMenuCursor: Phaser.GameObjects.Rectangle;
  #volumeOptionsValueText: Phaser.GameObjects.Text;
  #selectedMenuColorTextGameObject: Phaser.GameObjects.Text;
  #infoContainer: Phaser.GameObjects.Container;
  #selectedOptionInfoMsgTextGameObject: Phaser.GameObjects.Text;
  #optionsMenuCursor: Phaser.GameObjects.Rectangle;
  #selectedOptionMenu: OptionMenuOptions;
  #selectedTextSpeedOption: TextSpeedMenuOptions;
  #selectedBattleSceneOption: BattleSceneMenuOptions;
  #selectedBattleStyleOption: BattleStyleMenuOptions;
  #selectedSoundMenuOption: SoundMenuOptions;
  #selectedVolumeOption: VolumeMenuOptions;
  #selectedMenuColorOption: MenuColorOptions;

  constructor() {
    super({ key: SCENE_KEYS.OPTIONS_SCENE });
  }

  init() {
    super.init();

    this.#nineSliceMainContainer = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKeys: [
        UI_ASSET_KEYS.MENU_BACKGROUND,
        UI_ASSET_KEYS.MENU_BACKGROUND_GREEN,
        UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE,
      ],
    });

    this.#selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED;
    this.#selectedTextSpeedOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED);
    this.#selectedBattleSceneOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS);
    this.#selectedBattleStyleOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE);
    this.#selectedSoundMenuOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND);
    this.#selectedVolumeOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME);
    this.#selectedMenuColorOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR);
  }

  async create() {
    super.create();

    const { width, height } = this.scale;
    const optionMenuWidth = width - 200;

    // main options container
    this.#mainContainer = this.#nineSliceMainContainer.createNineSliceContainer(
      this,
      optionMenuWidth,
      432,
      UI_ASSET_KEYS.MENU_BACKGROUND,
    );
    this.#mainContainer.setX(100).setY(20);

    // create main option sections
    this.add.text(width / 2, 40, 'Options', OPTIONS_TEXT_STYLE).setOrigin(0.5);
    const menuOptionsPosition = {
      x: 25,
      yStart: 55,
      yIncrement: 55,
    };
    const menuOptions = ['Text Speed', 'Battle Scene', 'Battle Style', 'Sound', 'Volume', 'Menu Color', 'Close'];
    menuOptions.forEach((option, index) => {
      const x = menuOptionsPosition.x;
      const y = menuOptionsPosition.yStart + menuOptionsPosition.yIncrement * index;
      const textGameObject = this.add.text(x, y, option, OPTIONS_TEXT_STYLE);
      this.#mainContainer.add(textGameObject);
    });

    // create text speed options
    this.#textSpeedOptionTextGameObjects = this.add.group([
      this.add.text(420, 75, 'Slow', OPTIONS_TEXT_STYLE),
      this.add.text(590, 75, 'Mid', OPTIONS_TEXT_STYLE),
      this.add.text(760, 75, 'Fast', OPTIONS_TEXT_STYLE),
    ]);

    // create battle scene options
    this.#battleSceneOptionTextGameObjects = this.add.group([
      this.add.text(420, 130, 'On', OPTIONS_TEXT_STYLE),
      this.add.text(590, 130, 'Off', OPTIONS_TEXT_STYLE),
    ]);

    // create battle style options
    this.#battleStyleOptionTextGameObjects = this.add.group([
      this.add.text(420, 185, 'Set', OPTIONS_TEXT_STYLE),
      this.add.text(590, 185, 'Shift', OPTIONS_TEXT_STYLE),
    ]);

    // create sound options
    this.#soundOptionTextGameObjects = this.add.group([
      this.add.text(420, 240, 'On', OPTIONS_TEXT_STYLE),
      this.add.text(590, 240, 'Off', OPTIONS_TEXT_STYLE),
    ]);

    // volume options
    this.add.rectangle(420, 312, 300, 4, 0xffffff, 1).setOrigin(0, 0.5);
    this.#volumeOptionsMenuCursor = this.add.rectangle(710, 312, 10, 25, 0xff2222, 1).setOrigin(0, 0.5);
    this.#volumeOptionsValueText = this.add.text(760, 295, '100%', OPTIONS_TEXT_STYLE);

    // frame options
    this.#selectedMenuColorTextGameObject = this.add.text(590, 350, '', OPTIONS_TEXT_STYLE);
    this.add.image(530, 352, UI_ASSET_KEYS.CURSOR_WHITE).setOrigin(1, 0).setScale(2.5).setFlipX(true);
    this.add.image(660, 352, UI_ASSET_KEYS.CURSOR_WHITE).setOrigin(0, 0).setScale(2.5);

    // option details container
    this.#infoContainer = this.#nineSliceMainContainer.createNineSliceContainer(
      this,
      optionMenuWidth,
      100,
      UI_ASSET_KEYS.MENU_BACKGROUND,
    );
    this.#infoContainer.setX(100).setY(height - 110);
    this.#selectedOptionInfoMsgTextGameObject = this.add.text(125, 480, OPTION_MENU_OPTION_INFO_MSG.TEXT_SPEED, {
      ...OPTIONS_TEXT_STYLE,
      ...{
        wordWrap: { width: width - 250 },
      },
    });

    this.#optionsMenuCursor = this.add
      .rectangle(110, 70, optionMenuWidth - 20, 40, 0xffffff, 0)
      .setOrigin(0)
      .setStrokeStyle(4, 0xe4434a, 1);

    this.#updateTextSpeedGameObjects();
    this.#updateBattleSceneOptionGameObjects();
    this.#updateBattleStyleOptionGameObjects();
    this.#updateSoundOptionGameObjects();
    this.#updateVolumeSlider();
    this.#updateMenuColorDisplayText();

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.TITLE_SCENE);
    });
  }

  update() {
    super.update();

    if (this._controls.isInputLocked) {
      return;
    }

    if (this._controls.wasBackKeyPressed()) {
      this._controls.lockInput = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      return;
    }

    if (this._controls.wasSpaceKeyPressed() && this.#selectedOptionMenu === OPTION_MENU_OPTIONS.CONFIRM) {
      this._controls.lockInput = true;
      this.#updateOptionDataInDataManager();

      // update the global sound volume
      setGlobalSoundSettings(this);

      this.cameras.main.fadeOut(500, 0, 0, 0);
      return;
    }

    const selectedDirection = this._controls.getDirectionKeyJustPressed();
    if (selectedDirection !== DIRECTION.NONE) {
      this.#moveOptionMenuCursor(selectedDirection);
    }
  }

  #updateOptionDataInDataManager() {
    dataManager.store.set({
      [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]: this.#selectedTextSpeedOption,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS]: this.#selectedBattleSceneOption,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE]: this.#selectedBattleStyleOption,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND]: this.#selectedSoundMenuOption,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME]: this.#selectedVolumeOption,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR]: this.#selectedMenuColorOption,
    });
    dataManager.saveData();
  }

  #moveOptionMenuCursor(direction: Direction) {
    if (direction === DIRECTION.NONE) {
      return;
    }

    this.#updateSelectedOptionMenuFromInput(direction);

    switch (this.#selectedOptionMenu) {
      case OPTION_MENU_OPTIONS.TEXT_SPEED:
        this.#optionsMenuCursor.setY(70);
        break;
      case OPTION_MENU_OPTIONS.BATTLE_SCENE:
        this.#optionsMenuCursor.setY(125);
        break;
      case OPTION_MENU_OPTIONS.BATTLE_STYLE:
        this.#optionsMenuCursor.setY(180);
        break;
      case OPTION_MENU_OPTIONS.SOUND:
        this.#optionsMenuCursor.setY(235);
        break;
      case OPTION_MENU_OPTIONS.VOLUME:
        this.#optionsMenuCursor.setY(290);
        break;
      case OPTION_MENU_OPTIONS.MENU_COLOR:
        this.#optionsMenuCursor.setY(345);
        break;
      case OPTION_MENU_OPTIONS.CONFIRM:
        this.#optionsMenuCursor.setY(400);
        break;
      default:
        exhaustiveGuard(this.#selectedOptionMenu);
    }
    this.#selectedOptionInfoMsgTextGameObject.setText(OPTION_MENU_OPTION_INFO_MSG[this.#selectedOptionMenu]);
  }

  #updateSelectedOptionMenuFromInput(direction: Direction) {
    if (direction === DIRECTION.NONE) {
      return;
    }

    if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.TEXT_SPEED) {
      switch (direction) {
        case DIRECTION.DOWN:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_SCENE;
          return;
        case DIRECTION.UP:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.CONFIRM;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
          this.#updateTextSpeedOption(direction);
          this.#updateTextSpeedGameObjects();
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.BATTLE_SCENE) {
      switch (direction) {
        case DIRECTION.DOWN:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_STYLE;
          return;
        case DIRECTION.UP:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
          this.#updateBattleSceneOption(direction);
          this.#updateBattleSceneOptionGameObjects();
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.BATTLE_STYLE) {
      switch (direction) {
        case DIRECTION.DOWN:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.SOUND;
          return;
        case DIRECTION.UP:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_SCENE;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
          this.#updateBattleStyleOption(direction);
          this.#updateBattleStyleOptionGameObjects();
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.SOUND) {
      switch (direction) {
        case DIRECTION.DOWN:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.VOLUME;
          return;
        case DIRECTION.UP:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_STYLE;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
          this.#updateSoundOption(direction);
          this.#updateSoundOptionGameObjects();
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.VOLUME) {
      switch (direction) {
        case DIRECTION.DOWN:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.MENU_COLOR;
          return;
        case DIRECTION.UP:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.SOUND;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
          this.#updateVolumeOption(direction);
          this.#updateVolumeSlider();
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.MENU_COLOR) {
      switch (direction) {
        case DIRECTION.DOWN:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.CONFIRM;
          return;
        case DIRECTION.UP:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.VOLUME;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
          this.#updateMenuColorOption(direction);
          this.#updateMenuColorDisplayText();
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.CONFIRM) {
      switch (direction) {
        case DIRECTION.DOWN:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED;
          return;
        case DIRECTION.UP:
          this.#selectedOptionMenu = OPTION_MENU_OPTIONS.MENU_COLOR;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    exhaustiveGuard(this.#selectedOptionMenu);
  }

  #updateTextSpeedOption(direction: 'LEFT' | 'RIGHT') {
    if (direction === 'LEFT') {
      if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
        return;
      }
      if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID) {
        this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.SLOW;
        return;
      }
      if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST) {
        this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID;
        return;
      }
      exhaustiveGuard(this.#selectedTextSpeedOption);
      return;
    }

    if (direction === DIRECTION.RIGHT) {
      if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST) {
        return;
      }
      if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID) {
        this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.FAST;
        return;
      }
      if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
        this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID;
        return;
      }
      exhaustiveGuard(this.#selectedTextSpeedOption);
      return;
    }

    exhaustiveGuard(direction);
  }

  #updateTextSpeedGameObjects() {
    const textGameObjects = this.#textSpeedOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[];

    textGameObjects.forEach(obj => {
      obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
    });

    if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
      textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID) {
      textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST) {
      textGameObjects[2].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    exhaustiveGuard(this.#selectedTextSpeedOption);
  }

  #updateBattleSceneOption(direction: 'LEFT' | 'RIGHT') {
    if (direction === 'LEFT' && this.#selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.ON) {
      return;
    }
    if (direction === DIRECTION.LEFT) {
      this.#selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.ON;
      return;
    }

    if (direction === DIRECTION.RIGHT && this.#selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.OFF) {
      return;
    }
    if (direction === DIRECTION.RIGHT) {
      this.#selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.OFF;
      return;
    }

    exhaustiveGuard(direction);
  }

  #updateBattleSceneOptionGameObjects() {
    const textGameObjects = this.#battleSceneOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[];

    textGameObjects.forEach(obj => {
      obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
    });

    if (this.#selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.OFF) {
      textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.#selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.ON) {
      textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    exhaustiveGuard(this.#selectedBattleSceneOption);
  }

  #updateBattleStyleOption(direction: 'LEFT' | 'RIGHT') {
    if (direction === 'LEFT' && this.#selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SET) {
      return;
    }
    if (direction === DIRECTION.LEFT) {
      this.#selectedBattleStyleOption = BATTLE_STYLE_OPTIONS.SET;
      return;
    }

    if (direction === DIRECTION.RIGHT && this.#selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SHIFT) {
      return;
    }
    if (direction === DIRECTION.RIGHT) {
      this.#selectedBattleStyleOption = BATTLE_STYLE_OPTIONS.SHIFT;
      return;
    }

    exhaustiveGuard(direction);
  }

  #updateBattleStyleOptionGameObjects() {
    const textGameObjects = this.#battleStyleOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[];

    textGameObjects.forEach(obj => {
      obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
    });

    if (this.#selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SHIFT) {
      textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.#selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SET) {
      textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    exhaustiveGuard(this.#selectedBattleStyleOption);
  }

  #updateSoundOption(direction: 'LEFT' | 'RIGHT') {
    if (direction === 'LEFT' && this.#selectedSoundMenuOption === SOUND_OPTIONS.ON) {
      return;
    }
    if (direction === DIRECTION.LEFT) {
      this.#selectedSoundMenuOption = SOUND_OPTIONS.ON;
      return;
    }

    if (direction === DIRECTION.RIGHT && this.#selectedSoundMenuOption === SOUND_OPTIONS.OFF) {
      return;
    }
    if (direction === DIRECTION.RIGHT) {
      this.#selectedSoundMenuOption = SOUND_OPTIONS.OFF;
      return;
    }

    exhaustiveGuard(direction);
  }

  #updateSoundOptionGameObjects() {
    const textGameObjects = this.#soundOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[];

    textGameObjects.forEach(obj => {
      obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
    });

    if (this.#selectedSoundMenuOption === SOUND_OPTIONS.OFF) {
      textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.#selectedSoundMenuOption === SOUND_OPTIONS.ON) {
      textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    exhaustiveGuard(this.#selectedSoundMenuOption);
  }

  #updateVolumeOption(direction: 'LEFT' | 'RIGHT') {
    if (direction === DIRECTION.LEFT && this.#selectedVolumeOption === 0) {
      return;
    }
    if (direction === DIRECTION.LEFT) {
      this.#selectedVolumeOption = (this.#selectedVolumeOption - 1) as VolumeMenuOptions;
      return;
    }

    if (direction === DIRECTION.RIGHT && this.#selectedVolumeOption === 4) {
      return;
    }
    if (direction === DIRECTION.RIGHT) {
      this.#selectedVolumeOption = (this.#selectedVolumeOption + 1) as VolumeMenuOptions;
      return;
    }

    exhaustiveGuard(direction);
  }

  #updateVolumeSlider() {
    switch (this.#selectedVolumeOption) {
      case 0:
        this.#volumeOptionsMenuCursor.setX(420);
        this.#volumeOptionsValueText.setText('0%');
        break;
      case 1:
        this.#volumeOptionsMenuCursor.setX(490);
        this.#volumeOptionsValueText.setText('25%');
        break;
      case 2:
        this.#volumeOptionsMenuCursor.setX(560);
        this.#volumeOptionsValueText.setText('50%');
        break;
      case 3:
        this.#volumeOptionsMenuCursor.setX(630);
        this.#volumeOptionsValueText.setText('75%');
        break;
      case 4:
        this.#volumeOptionsMenuCursor.setX(710);
        this.#volumeOptionsValueText.setText('100%');
        break;
      default:
        exhaustiveGuard(this.#selectedVolumeOption);
    }
  }

  #updateMenuColorOption(direction: 'LEFT' | 'RIGHT') {
    if (direction === DIRECTION.LEFT && this.#selectedMenuColorOption === 0) {
      this.#selectedMenuColorOption = 2;
      return;
    }
    if (direction === DIRECTION.RIGHT && this.#selectedMenuColorOption === 2) {
      this.#selectedMenuColorOption = 0;
      return;
    }
    if (direction === DIRECTION.LEFT) {
      this.#selectedMenuColorOption -= 1;
      return;
    }
    if (direction === DIRECTION.RIGHT) {
      this.#selectedMenuColorOption += 1;
      return;
    }
    exhaustiveGuard(direction);
  }

  #updateMenuColorDisplayText() {
    switch (this.#selectedMenuColorOption) {
      case 0:
        this.#selectedMenuColorTextGameObject.setText('1');
        this.#nineSliceMainContainer.updateNineSliceContainerTexture(
          this.sys.textures,
          this.#mainContainer,
          UI_ASSET_KEYS.MENU_BACKGROUND,
        );
        this.#nineSliceMainContainer.updateNineSliceContainerTexture(
          this.sys.textures,
          this.#infoContainer,
          UI_ASSET_KEYS.MENU_BACKGROUND,
        );
        break;
      case 1:
        this.#selectedMenuColorTextGameObject.setText('2');
        this.#nineSliceMainContainer.updateNineSliceContainerTexture(
          this.sys.textures,
          this.#mainContainer,
          UI_ASSET_KEYS.MENU_BACKGROUND_GREEN,
        );
        this.#nineSliceMainContainer.updateNineSliceContainerTexture(
          this.sys.textures,
          this.#infoContainer,
          UI_ASSET_KEYS.MENU_BACKGROUND_GREEN,
        );
        break;
      case 2:
        this.#selectedMenuColorTextGameObject.setText('3');
        this.#nineSliceMainContainer.updateNineSliceContainerTexture(
          this.sys.textures,
          this.#mainContainer,
          UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE,
        );
        this.#nineSliceMainContainer.updateNineSliceContainerTexture(
          this.sys.textures,
          this.#infoContainer,
          UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE,
        );
        break;
      default:
        exhaustiveGuard(this.#selectedMenuColorOption);
    }
  }
}
