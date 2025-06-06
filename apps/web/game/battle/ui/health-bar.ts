import { HEALTH_BAR_ASSET_KEYS } from '../../assets/asset-keys';

interface HealthBarAnimationOptions {
  duration?: number;
  callback?: () => void;
  skipBattleAnimations?: boolean;
}

export class HealthBar {
  #scene: Phaser.Scene;
  #healthBarContainer: Phaser.GameObjects.Container;
  #fullWidth: number;
  #scaleY: number;
  #leftCap: Phaser.GameObjects.Image;
  #middle: Phaser.GameObjects.Image;
  #rightCap: Phaser.GameObjects.Image;
  #leftShadowCap: Phaser.GameObjects.Image;
  #middleShadow: Phaser.GameObjects.Image;
  #rightShadowCap: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.#scene = scene;
    this.#fullWidth = 360;
    this.#scaleY = 0.7;

    this.#healthBarContainer = this.#scene.add.container(x, y, []);
    this.#createHealthBarShadowImages(x, y);
    this.#createHealthBarImages(x, y);
    this.#setMeterPercentage(1);
  }

  get container() {
    return this.#healthBarContainer;
  }

  #createHealthBarShadowImages(x: number, y: number) {
    this.#leftShadowCap = this.#scene.add
      .image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#middleShadow = this.#scene.add
      .image(this.#leftShadowCap.x + this.#leftShadowCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);
    this.#middleShadow.displayWidth = this.#fullWidth;

    this.#rightShadowCap = this.#scene.add
      .image(this.#middleShadow.x + this.#middleShadow.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#healthBarContainer.add([this.#leftShadowCap, this.#middleShadow, this.#rightShadowCap]);
  }

  #createHealthBarImages(x: number, y: number) {
    this.#leftCap = this.#scene.add
      .image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#middle = this.#scene.add
      .image(this.#leftCap.x + this.#leftCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#rightCap = this.#scene.add
      .image(this.#middle.x + this.#middle.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#healthBarContainer.add([this.#leftCap, this.#middle, this.#rightCap]);
  }

  #setMeterPercentage(percent = 1) {
    const width = this.#fullWidth * percent;

    this.#middle.displayWidth = width;
    this.#updateHealthBarGameObjects();
  }

  #updateHealthBarGameObjects() {
    this.#rightCap.x = this.#middle.x + this.#middle.displayWidth;
    const isVisible = this.#middle.displayWidth > 0;
    this.#leftCap.visible = isVisible;
    this.#middle.visible = isVisible;
    this.#rightCap.visible = isVisible;
  }

  setMeterPercentageAnimated(percent: number = 1, options?: HealthBarAnimationOptions) {
    const width = this.#fullWidth * percent;

    if (options?.skipBattleAnimations) {
      this.#setMeterPercentage(percent);
      if (options?.callback) {
        options.callback();
      }
      return;
    }

    this.#scene.tweens.add({
      targets: this.#middle,
      displayWidth: width,
      duration: options?.duration || 1000,
      ease: Phaser.Math.Easing.Sine.Out,
      onUpdate: () => {
        this.#updateHealthBarGameObjects();
      },
      onComplete: options?.callback,
    });
  }
}
