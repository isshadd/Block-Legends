import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';
import { Vec2 } from '@common/interfaces/vec2';
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
        const startTile = this.getStartTile(startCoordinates);
        if (!this.isValidStartTile(startTile)) {
            return new Map();
        }

        const visited = new Map<Tile, PathNode>();
        if (!startTile) {
            return new Map();
        }
        const priorityQueue: PathNode[] = [this.createInitialNode(startTile)];

        this.processTiles(priorityQueue, visited);

        return this.getReachableTiles(visited);
    }

    private getStartTile(startCoordinates: Vec2): Tile | null {
        return this.gameMapDataManagerService.getTileAt(startCoordinates);
    }

    private isValidStartTile(tile: Tile | null): boolean {
        return tile !== null && tile.isWalkable();
    }

    private createInitialNode(tile: Tile): PathNode {
        return {
            tile,
            cost: 0,
            path: [tile],
        };
    }

    private processTiles(priorityQueue: PathNode[], visited: Map<Tile, PathNode>): void {
        while (priorityQueue.length > 0) {
            priorityQueue.sort((a, b) => a.cost - b.cost);
            const currentNode = priorityQueue.shift();
            if (!currentNode) {
                continue;
            }

            if (this.shouldSkipNode(currentNode, visited)) {
                continue;
            }

            visited.set(currentNode.tile, currentNode);
            this.addNeighboringNodes(currentNode, priorityQueue, visited);
        }
    }

    private shouldSkipNode(currentNode: PathNode, visited: Map<Tile, PathNode>): boolean {
        const visitedNode = visited.get(currentNode.tile);
        return visited.has(currentNode.tile) && visitedNode !== undefined && visitedNode.cost <= currentNode.cost;
    }

    private addNeighboringNodes(currentNode: PathNode, priorityQueue: PathNode[], visited: Map<Tile, PathNode>): void {
        const neighbors = this.gameMapDataManagerService.getNeighbours(currentNode.tile);
        neighbors.forEach((neighbor) => {
            if (!this.isValidNeighbor(neighbor, currentNode, visited)) {
                return;
            }

            const walkableTile = neighbor as WalkableTile;
            const newCost = currentNode.cost + walkableTile.moveCost;

            priorityQueue.push({
                tile: walkableTile,
                cost: newCost,
                path: [...currentNode.path, walkableTile],
            });
        });
    }

    private isValidNeighbor(neighbor: Tile, currentNode: PathNode, visited: Map<Tile, PathNode>): boolean {
        if (!neighbor.isWalkable()) {
            return false;
        }

        const walkableTile = neighbor as WalkableTile;
        if (walkableTile.hasPlayer()) {
            return false;
        }

        const newCost = currentNode.cost + walkableTile.moveCost;
        if (newCost > this.movementPoints) {
            return false;
        }

        const neighborNode = visited.get(neighbor);
        return !(visited.has(neighbor) && neighborNode && neighborNode.cost <= newCost);
    }

    private getReachableTiles(visited: Map<Tile, PathNode>): Map<Tile, Tile[]> {
        const reachableTiles = new Map<Tile, Tile[]>();
        visited.forEach((node, key) => {
            if (node.cost <= this.movementPoints) {
                reachableTiles.set(key, node.path);
            }
        });
        return reachableTiles;
    }
}
