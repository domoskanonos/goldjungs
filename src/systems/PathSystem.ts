import { Vector3 } from "@babylonjs/core";

export class PathSystem {
    private waypoints: Vector3[];
    
    constructor(waypoints: Vector3[]) {
        this.waypoints = waypoints;
    }

    public getWaypoints(): Vector3[] {
        return this.waypoints;
    }

    public getWaypointCount(): number {
        return this.waypoints.length;
    }

    public getWaypoint(index: number): Vector3 {
        if (index < 0 || index >= this.waypoints.length) {
            throw new Error(`Invalid waypoint index: ${index}`);
        }
        return this.waypoints[index];
    }

    public getStartPosition(): Vector3 {
        return this.waypoints[0];
    }

    public getEndPosition(): Vector3 {
        return this.waypoints[this.waypoints.length - 1];
    }

    /**
     * Calculate the next position along the path for an entity
     * @param currentPosition Current position of the entity
     * @param currentWaypointIndex Current target waypoint index
     * @param speed Movement speed
     * @returns Object containing new position and waypoint index
     */
    public moveAlongPath(
        currentPosition: Vector3,
        currentWaypointIndex: number,
        speed: number
    ): { position: Vector3; waypointIndex: number; completed: boolean } {
        if (currentWaypointIndex >= this.waypoints.length) {
            return { position: currentPosition, waypointIndex: currentWaypointIndex, completed: true };
        }

        const targetWaypoint = this.waypoints[currentWaypointIndex];
        const direction = targetWaypoint.subtract(currentPosition);
        const distance = direction.length();

        if (distance <= speed) {
            // Reached waypoint, move to next
            const nextIndex = currentWaypointIndex + 1;
            return {
                position: targetWaypoint.clone(),
                waypointIndex: nextIndex,
                completed: nextIndex >= this.waypoints.length
            };
        } else {
            // Move toward waypoint
            const normalizedDirection = direction.normalize();
            const newPosition = currentPosition.add(normalizedDirection.scale(speed));
            return {
                position: newPosition,
                waypointIndex: currentWaypointIndex,
                completed: false
            };
        }
    }
}
