import { UI_ASSET_KEYS } from '../../../assets/asset-keys';
import { DIRECTION, Direction } from '../../../common/direction';
import { exhaustiveGuard } from '../../../utils/guard';
import { ACTIVE_BATTLE_MENU, ATTACK_MOVE_OPTIONS, BATTLE_MENU_OPTIONS } from './battle-menu-options';
import { BATTLE_UI_TEXT_STYLE } from './battle-menu-config';
import { BattleMonster } from '../../monsters/battle-monster';
import { animateText } from '../../../utils/text-utils';
import { dataManager } from '../../../utils/data-manager';
import { SCENE_KEYS } from '../../../scenes/scene-keys';
import { Item } from '../../../types/typedef';
import { BattleMenuOptions, AttackMoveOptions, ActiveBattleMenu } from './battle-menu-options';
import { InventorySceneData } from '../../../scenes/inventory-scene';
import { BattleSceneWasResumedData } from '../../../scenes/battle-scene';

const BATTLE_MENU_CURSOR_POS = Object.freeze({
  x: 42,
  y: 38,
});

const ATTACK_MENU_CURSOR_POS = Object.freeze({
  x: 42,
  y: 38,
});

const PLAYER_INPUT_CURSOR_POS = Object.freeze({
  y: 488,
});

export class BattleMenu {
  #scene: Phaser.Scene;
  #mainBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container;
  #moveSelectionSubBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container;
  #battleTextGameObjectLine1: Phaser.GameObjects.Text;
  #battleTextGameObjectLine2: Phaser.GameObjects.Text;
  #mainBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
  #attackBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
  #selectedBattleMenuOption: BattleMenuOptions;
  #selectedAttackMenuOption: AttackMoveOptions;
  #activeBattleMenu: ActiveBattleMenu;
  #queuedInfoPanelMessages: string[];
  #queuedInfoPanelCallback: (() => void) | undefined;
  #waitingForPlayerInput: boolean;
  #selectedAttackIndex: number | undefined;
  #activePlayerMonster: BattleMonster;
  #userInputCursorPhaserImageGameObject: Phaser.GameObjects.Image;
  #userInputCursorPhaserTween: Phaser.Tweens.Tween;
  #skipAnimations: boolean;
  #queuedMessageAnimationPlaying: boolean;
  #usedItem: Item | undefined;
  #fleeAttempt: boolean;
  #switchMonsterAttempt: boolean;
  #wasItemUsed: boolean;

  /**
   *
   * @param {Phaser.Scene} scene the Phaser 3 Scene the battle menu will be added to
   * @param {BattleMonster} activePlayerMonster the players current active monster in the current battle
   * @param {boolean} [skipBattleAnimations=false] used to skip all animations tied to the battle
   */
  constructor(scene, activePlayerMonster, skipBattleAnimations = false) {
    this.#scene = scene;
    this.#activePlayerMonster = activePlayerMonster;
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
    this.#queuedInfoPanelCallback = undefined;
    this.#queuedInfoPanelMessages = [];
    this.#waitingForPlayerInput = false;
    this.#selectedAttackIndex = undefined;
    this.#skipAnimations = skipBattleAnimations;
    this.#queuedMessageAnimationPlaying = false;
    this.#wasItemUsed = false;
    this.#usedItem = undefined;
    this.#fleeAttempt = false;
    this.#switchMonsterAttempt = false;
    this.#createMainInfoPane();
    this.#createMainBattleMenu();
    this.#createMonsterAttackSubMenu();
    this.#createPlayerInputCursor();

    this.#scene.events.on(Phaser.Scenes.Events.RESUME, this.#handleSceneResume, this);
    this.#scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        this.#scene.events.off(Phaser.Scenes.Events.RESUME, this.#handleSceneResume, this);
      },
      this,
    );
  }

  get selectedAttack(): number | undefined {
    if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return this.#selectedAttackIndex;
    }
    return undefined;
  }

  get wasItemUsed(): boolean {
    return this.#wasItemUsed;
  }

  get itemUsed(): Item | undefined {
    return this.#usedItem;
  }

  get isAttemptingToFlee(): boolean {
    return this.#fleeAttempt;
  }

  get isAttemptingToSwitchMonsters(): boolean {
    return this.#switchMonsterAttempt;
  }

  updateMonsterAttackSubMenu() {
    this.#moveSelectionSubBattleMenuPhaserContainerGameObject
      .getAll()
      .forEach((gameObject: Phaser.GameObjects.Text) => {
        if (gameObject.type === 'text') {
          gameObject.setText('-');
        }
      });
    this.#activePlayerMonster.attacks.forEach((attack, index) => {
      (this.#moveSelectionSubBattleMenuPhaserContainerGameObject.getAt(index) as Phaser.GameObjects.Text).setText(
        attack.name,
      );
    });
  }

  showMainBattleMenu() {
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.#battleTextGameObjectLine1.setText('what should');
    this.#mainBattleMenuPhaserContainerGameObject.setAlpha(1);
    this.#battleTextGameObjectLine1.setAlpha(1);
    this.#battleTextGameObjectLine2.setAlpha(1);

    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(BATTLE_MENU_CURSOR_POS.x, BATTLE_MENU_CURSOR_POS.y);
    this.#selectedAttackIndex = undefined;
    this.#wasItemUsed = false;
    this.#fleeAttempt = false;
    this.#switchMonsterAttempt = false;
    this.#usedItem = undefined;
  }

  hideMainBattleMenu() {
    this.#mainBattleMenuPhaserContainerGameObject.setAlpha(0);
    this.#battleTextGameObjectLine1.setAlpha(0);
    this.#battleTextGameObjectLine2.setAlpha(0);
  }

  showMonsterAttackSubMenu() {
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
    this.#moveSelectionSubBattleMenuPhaserContainerGameObject.setAlpha(1);
  }

  hideMonsterAttackSubMenu() {
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.#moveSelectionSubBattleMenuPhaserContainerGameObject.setAlpha(0);
  }

  playInputCursorAnimation() {
    this.#userInputCursorPhaserImageGameObject.setPosition(
      this.#battleTextGameObjectLine1.displayWidth + this.#userInputCursorPhaserImageGameObject.displayWidth * 2.7,
      this.#userInputCursorPhaserImageGameObject.y,
    );
    this.#userInputCursorPhaserImageGameObject.setAlpha(1);
    this.#userInputCursorPhaserTween.restart();
  }

  hideInputCursor() {
    this.#userInputCursorPhaserImageGameObject.setAlpha(0);
    this.#userInputCursorPhaserTween.pause();
  }

  handlePlayerInput(input: Direction | 'OK' | 'CANCEL') {
    if (this.#queuedMessageAnimationPlaying && input === 'OK') {
      return;
    }

    if (this.#waitingForPlayerInput && (input === 'CANCEL' || input === 'OK')) {
      this.#updateInfoPaneWithMessage();
      return;
    }

    if (input === 'CANCEL') {
      this.#switchToMainBattleMenu();
      return;
    }
    if (input === 'OK') {
      if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
        this.#handlePlayerChooseMainBattleOption();
        return;
      }
      if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
        this.#handlePlayerChooseAttack();
        return;
      }
      return;
    }
    this.#updateSelectedBattleMenuOptionFromInput(input);
    this.#updateSelectedMoveMenuOptionFromInput(input);
    this.#moveMainBattleMenuCursor();
    this.#moveMoveSelectBattleMenuCursor();
  }

  updateInfoPaneMessageNoInputRequired(message: string, callback?: () => void) {
    this.#battleTextGameObjectLine1.setText('').setAlpha(1);

    if (this.#skipAnimations) {
      this.#battleTextGameObjectLine1.setText(message);
      this.#waitingForPlayerInput = false;
      if (callback) {
        callback();
      }
      return;
    }

    animateText(this.#scene, this.#battleTextGameObjectLine1, message, {
      delay: dataManager.getAnimatedTextSpeed(),
      callback: () => {
        this.#waitingForPlayerInput = false;
        if (callback) {
          callback();
        }
      },
    });
  }

  updateInfoPaneMessagesAndWaitForInput(messages: string[], callback?: () => void) {
    this.#queuedInfoPanelMessages = messages;
    this.#queuedInfoPanelCallback = callback;

    this.#updateInfoPaneWithMessage();
  }

  #updateInfoPaneWithMessage() {
    this.#waitingForPlayerInput = false;
    this.#battleTextGameObjectLine1.setText('').setAlpha(1);
    this.hideInputCursor();

    // check if all messages have been displayed from the queue and call the callback
    if (this.#queuedInfoPanelMessages.length === 0) {
      if (this.#queuedInfoPanelCallback) {
        this.#queuedInfoPanelCallback();
        this.#queuedInfoPanelCallback = undefined;
      }
      return;
    }

    // get first message from queue and animate message
    const messageToDisplay = this.#queuedInfoPanelMessages.shift();

    if (this.#skipAnimations) {
      this.#battleTextGameObjectLine1.setText(messageToDisplay);
      this.#queuedMessageAnimationPlaying = false;
      this.#waitingForPlayerInput = true;
      this.playInputCursorAnimation();
      return;
    }

    this.#queuedMessageAnimationPlaying = true;
    animateText(this.#scene, this.#battleTextGameObjectLine1, messageToDisplay, {
      delay: dataManager.getAnimatedTextSpeed(),
      callback: () => {
        this.playInputCursorAnimation();
        this.#waitingForPlayerInput = true;
        this.#queuedMessageAnimationPlaying = false;
      },
    });
  }

  #createMainBattleMenu() {
    this.#battleTextGameObjectLine1 = this.#scene.add.text(20, 468, 'what should', {
      ...BATTLE_UI_TEXT_STYLE,
      ...{
        wordWrap: {
          width: this.#scene.scale.width - 55,
        },
      },
    });
    this.#battleTextGameObjectLine2 = this.#scene.add.text(
      20,
      512,
      `${this.#activePlayerMonster.name} do next?`,
      BATTLE_UI_TEXT_STYLE,
    );

    this.#mainBattleMenuCursorPhaserImageGameObject = this.#scene.add
      .image(BATTLE_MENU_CURSOR_POS.x, BATTLE_MENU_CURSOR_POS.y, UI_ASSET_KEYS.CURSOR, 0)
      .setOrigin(0.5)
      .setScale(2.5);

    this.#mainBattleMenuPhaserContainerGameObject = this.#scene.add.container(520, 448, [
      this.#createMainInfoSubPane(),
      this.#scene.add.text(55, 22, BATTLE_MENU_OPTIONS.FIGHT, BATTLE_UI_TEXT_STYLE),
      this.#scene.add.text(240, 22, BATTLE_MENU_OPTIONS.SWITCH, BATTLE_UI_TEXT_STYLE),
      this.#scene.add.text(55, 70, BATTLE_MENU_OPTIONS.ITEM, BATTLE_UI_TEXT_STYLE),
      this.#scene.add.text(240, 70, BATTLE_MENU_OPTIONS.FLEE, BATTLE_UI_TEXT_STYLE),
      this.#mainBattleMenuCursorPhaserImageGameObject,
    ]);

    this.hideMainBattleMenu();
  }

  #createMonsterAttackSubMenu() {
    this.#attackBattleMenuCursorPhaserImageGameObject = this.#scene.add
      .image(ATTACK_MENU_CURSOR_POS.x, ATTACK_MENU_CURSOR_POS.y, UI_ASSET_KEYS.CURSOR, 0)
      .setOrigin(0.5)
      .setScale(2.5);

    /** @type {string[]} */
    const attackNames = [];
    for (let i = 0; i < 4; i += 1) {
      attackNames.push(this.#activePlayerMonster.attacks[i]?.name || '-');
    }

    this.#moveSelectionSubBattleMenuPhaserContainerGameObject = this.#scene.add.container(0, 448, [
      this.#scene.add.text(55, 22, attackNames[0], BATTLE_UI_TEXT_STYLE),
      this.#scene.add.text(240, 22, attackNames[1], BATTLE_UI_TEXT_STYLE),
      this.#scene.add.text(55, 70, attackNames[2], BATTLE_UI_TEXT_STYLE),
      this.#scene.add.text(240, 70, attackNames[3], BATTLE_UI_TEXT_STYLE),
      this.#attackBattleMenuCursorPhaserImageGameObject,
    ]);
    this.hideMonsterAttackSubMenu();
  }

  #createMainInfoPane() {
    const padding = 4;
    const rectHeight = 124;

    this.#scene.add
      .rectangle(
        padding,
        this.#scene.scale.height - rectHeight - padding,
        this.#scene.scale.width - padding * 2,
        rectHeight,
        0xede4f3,
        1,
      )
      .setOrigin(0)
      .setStrokeStyle(8, 0xe4434a, 1);
  }

  #createMainInfoSubPane(): Phaser.GameObjects.Rectangle {
    const rectWidth = 500;
    const rectHeight = 124;

    return this.#scene.add
      .rectangle(0, 0, rectWidth, rectHeight, 0xede4f3, 1)
      .setOrigin(0)
      .setStrokeStyle(8, 0x905ac2, 1);
  }

  #updateSelectedBattleMenuOptionFromInput(direction: Direction) {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
          return;
        case DIRECTION.DOWN:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
          return;
        case DIRECTION.DOWN:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
          return;
        case DIRECTION.UP:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
          return;
        case DIRECTION.UP:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    exhaustiveGuard(this.#selectedBattleMenuOption);
  }

  #moveMainBattleMenuCursor() {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      return;
    }

    switch (this.#selectedBattleMenuOption) {
      case BATTLE_MENU_OPTIONS.FIGHT:
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(BATTLE_MENU_CURSOR_POS.x, BATTLE_MENU_CURSOR_POS.y);
        return;
      case BATTLE_MENU_OPTIONS.SWITCH:
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(228, BATTLE_MENU_CURSOR_POS.y);
        return;
      case BATTLE_MENU_OPTIONS.ITEM:
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(BATTLE_MENU_CURSOR_POS.x, 86);
        return;
      case BATTLE_MENU_OPTIONS.FLEE:
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(228, 86);
        return;
      default:
        exhaustiveGuard(this.#selectedBattleMenuOption);
    }
  }

  #updateSelectedMoveMenuOptionFromInput(direction: Direction) {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return;
    }

    if (this.#selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_1) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
          return;
        case DIRECTION.DOWN:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_2) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
          return;
        case DIRECTION.DOWN:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_3) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
          return;
        case DIRECTION.UP:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    if (this.#selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_4) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
          return;
        case DIRECTION.UP:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    exhaustiveGuard(this.#selectedAttackMenuOption);
  }

  #moveMoveSelectBattleMenuCursor() {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return;
    }

    switch (this.#selectedAttackMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
        this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(
          ATTACK_MENU_CURSOR_POS.x,
          ATTACK_MENU_CURSOR_POS.y,
        );
        return;
      case ATTACK_MOVE_OPTIONS.MOVE_2:
        this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(228, ATTACK_MENU_CURSOR_POS.y);
        return;
      case ATTACK_MOVE_OPTIONS.MOVE_3:
        this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(ATTACK_MENU_CURSOR_POS.x, 86);
        return;
      case ATTACK_MOVE_OPTIONS.MOVE_4:
        this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(228, 86);
        return;
      default:
        exhaustiveGuard(this.#selectedAttackMenuOption);
    }
  }

  #switchToMainBattleMenu() {
    this.#waitingForPlayerInput = false;
    this.hideInputCursor();
    this.hideMonsterAttackSubMenu();
    this.showMainBattleMenu();
  }

  #handlePlayerChooseMainBattleOption() {
    this.hideMainBattleMenu();

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
      this.showMonsterAttackSubMenu();
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
      this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_ITEM;

      // pause this scene and launch the inventory scene
      const sceneDataToPass: InventorySceneData = {
        previousSceneName: SCENE_KEYS.BATTLE_SCENE,
        isBattling: true,
      };
      this.#scene.scene.launch(SCENE_KEYS.INVENTORY_SCENE, sceneDataToPass);
      this.#scene.scene.pause(SCENE_KEYS.BATTLE_SCENE);
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
      this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_SWITCH;
      this.#switchMonsterAttempt = true;
      return;
    }

    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
      this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_FLEE;
      this.#fleeAttempt = true;
      return;
    }

    exhaustiveGuard(this.#selectedBattleMenuOption);
  }

  #handlePlayerChooseAttack() {
    let selectedMoveIndex = 0;
    switch (this.#selectedAttackMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
        selectedMoveIndex = 0;
        break;
      case ATTACK_MOVE_OPTIONS.MOVE_2:
        selectedMoveIndex = 1;
        break;
      case ATTACK_MOVE_OPTIONS.MOVE_3:
        selectedMoveIndex = 2;
        break;
      case ATTACK_MOVE_OPTIONS.MOVE_4:
        selectedMoveIndex = 3;
        break;
      default:
        exhaustiveGuard(this.#selectedAttackMenuOption);
    }

    this.#selectedAttackIndex = selectedMoveIndex;
  }

  #createPlayerInputCursor() {
    this.#userInputCursorPhaserImageGameObject = this.#scene.add.image(0, 0, UI_ASSET_KEYS.CURSOR);
    this.#userInputCursorPhaserImageGameObject.setAngle(90).setScale(2.5, 1.25);
    this.#userInputCursorPhaserImageGameObject.setAlpha(0);

    this.#userInputCursorPhaserTween = this.#scene.add.tween({
      delay: 0,
      duration: 500,
      repeat: -1,
      y: {
        from: PLAYER_INPUT_CURSOR_POS.y,
        start: PLAYER_INPUT_CURSOR_POS.y,
        to: PLAYER_INPUT_CURSOR_POS.y + 6,
      },
      targets: this.#userInputCursorPhaserImageGameObject,
    });
    this.#userInputCursorPhaserTween.pause();
  }

  #handleSceneResume(sys: Phaser.Scenes.Systems, data: BattleSceneWasResumedData) {
    console.log(
      `[${BattleMenu.name}:handleSceneResume] scene has been resumed, data provided: ${JSON.stringify(data)}`,
    );

    if (data && data.wasMonsterSelected) {
      // do nothing since new active monster was chosen to switch to
      return;
    }

    if (!data || !data.wasItemUsed) {
      this.#switchToMainBattleMenu();
      return;
    }

    this.#wasItemUsed = true;
    this.#usedItem = data.item;
    this.updateInfoPaneMessagesAndWaitForInput([`You used the following item: ${data.item.name}`]);
  }
}
