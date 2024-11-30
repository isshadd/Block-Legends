import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';
import { Vec2 } from '@common/interfaces/vec2';
import { GameMapDataManagerService } from './game-map-data-manager.service';
// import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
export interface PathNode {
    tile: Tile;
    cost: number;
    path: Tile[];
}

export class Pathfinder {
    gameMapDataManagerService: GameMapDataManagerService;
    movementPoints: number;

    constructor(grid: GameMapDataManagerService, movementPoints: number) {
        this.gameMapDataManagerService = grid;
        this.movementPoints = movementPoints;
    }

    findAllReachableTiles(startCoordinates: Vec2): Map<Tile, Tile[]> {
        const startTile = this.gameMapDataManagerService.getTileAt(startCoordinates);
        if (!startTile || !startTile.isWalkable()) {
            return new Map();
        }

        const visited = new Map<Tile, PathNode>();
        const priorityQueue: PathNode[] = [];

        priorityQueue.push({
            tile: startTile,
            cost: 0,
            path: [startTile],
        });

        while (priorityQueue.length > 0) {
            priorityQueue.sort((a, b) => a.cost - b.cost);
            const currentNode = priorityQueue.shift();
            if (!currentNode) {
                continue;
            }
            const currentKey = currentNode.tile;

            const visitedNode = visited.get(currentKey);
            if (visited.has(currentKey) && visitedNode && visitedNode.cost <= currentNode.cost) {
                continue;
            }

            visited.set(currentKey, currentNode);

            const neighbors = this.gameMapDataManagerService.getNeighbours(currentNode.tile);
            neighbors.forEach((neighbor) => {
                if (!neighbor.isWalkable()) {
                    return;
                }
                const walkableTile = neighbor as WalkableTile;

                if (walkableTile.hasPlayer()) {
                    return;
                }

                const newCost = currentNode.cost + walkableTile.moveCost;
                if (newCost > this.movementPoints) {
                    return;
                }

                const neighborNode = visited.get(neighbor);
                if (visited.has(neighbor) && neighborNode && neighborNode.cost <= newCost) {
                    return;
                }

                priorityQueue.push({
                    tile: walkableTile,
                    cost: newCost,
                    path: [...currentNode.path, walkableTile],
                });
            });
        }

        const reachableTiles = new Map<Tile, Tile[]>();
        visited.forEach((node, key) => {
            if (node.cost <= this.movementPoints) {
                reachableTiles.set(key, node.path);
            }
        });

        return reachableTiles;
    }
}
