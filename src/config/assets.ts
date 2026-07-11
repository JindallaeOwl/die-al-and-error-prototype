export const TextureKeys = {
  player: 'player',
  playerHit: 'player-hit',
  playerBullet: 'player-bullet',
  enemyBullet: 'enemy-bullet',
  enemyChaser: 'enemy-chaser',
  enemyShooter: 'enemy-shooter',
  enemyDasher: 'enemy-dasher',
  enemyBoss: 'enemy-boss',
  doorHorizontal: 'door-horizontal',
  doorVertical: 'door-vertical',
  keyPickup: 'key-pickup',
  bombPickup: 'bomb-pickup',
  coinPickup: 'coin-pickup',
  chestPickup: 'chest-pickup',
  floorTile: 'floor-tile',
  wall: 'wall',
  obstacleCrate: 'obstacle-crate',
} as const;

// Passive item pickups each get their own generated icon (see AssetFactory)
// so players can tell them apart by shape, not just tint color.
export function itemIconKey(itemId: string): string {
  return `item-icon-${itemId}`;
}
