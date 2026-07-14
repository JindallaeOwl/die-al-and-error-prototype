export const TextureKeys = {
  player: 'player',
  playerHit: 'player-hit',
  playerIdle: 'player-idle',
  playerWalkA: 'player-walk-a',
  playerWalkMid: 'player-walk-mid',
  playerWalkB: 'player-walk-b',
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
  bombPlaced: 'bomb-placed',
  coinPickup: 'coin-pickup',
  chestPickup: 'chest-pickup',
  floorTile: 'floor-tile',
  wall: 'wall',
  obstacleCrate: 'obstacle-crate',
} as const;

export const AnimationKeys = {
  playerWalk: 'player-walk',
} as const;

// Passive item pickups each get their own generated icon (see AssetFactory)
// so players can tell them apart by shape, not just tint color.
export function itemIconKey(itemId: string): string {
  return `item-icon-${itemId}`;
}
