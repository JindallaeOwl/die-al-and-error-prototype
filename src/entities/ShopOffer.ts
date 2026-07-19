import Phaser from 'phaser';
import { itemIconKey, TextureKeys } from '../config/assets';
import { DEPTH } from '../config/gameConfig';
import { getShopProduct, type ShopOfferState } from '../data/shop';
import { gameFontStack } from '../i18n';
import { getRenderScale } from '../systems/GameSettings';

export class ShopOffer extends Phaser.GameObjects.Container {
  readonly offer: ShopOfferState;

  constructor(scene: Phaser.Scene, x: number, y: number, offer: ShopOfferState) {
    super(scene, x, y);
    this.offer = offer;

    const product = getShopProduct(offer.productId);

    if (!product) {
      throw new Error(`Unknown shop product: ${offer.productId}`);
    }

    const icon = scene.add.image(0, 0, textureForProduct(product));
    icon.setDisplaySize(28, 28);

    const coinIcon = scene.add.image(-8, 24, TextureKeys.hudCoin);
    coinIcon.setDisplaySize(10, 10);

    const priceText = scene.add.text(0, 19, `${offer.price}`, {
      fontFamily: gameFontStack(),
      fontSize: '8px',
      color: offer.discounted ? '#ff5d72' : '#ffd166',
      stroke: '#090b10',
      strokeThickness: 2,
      resolution: getRenderScale(),
    });
    priceText.setOrigin(0, 0);

    this.add([icon, coinIcon, priceText]);
    this.setDepth(DEPTH.item);
    this.setSize(34, 48);
    scene.add.existing(this);
  }
}

function textureForProduct(product: NonNullable<ReturnType<typeof getShopProduct>>): string {
  if (product.kind === 'passive') {
    return itemIconKey(product.itemId);
  }

  if (product.kind === 'heal') {
    return TextureKeys.hudHeart;
  }

  return product.consumable === 'keys' ? TextureKeys.hudKey : TextureKeys.hudBomb;
}
