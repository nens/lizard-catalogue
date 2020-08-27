import { Location } from "./../interface";

export const getSpatialBounds = (locations: Location[]) => {
    const coordinatesArray = locations.filter(
        location => location.geometry !== null
    ).map(
        location => location.geometry!.coordinates
    );

    const x: number[] = coordinatesArray.map(coordinates => coordinates[0]);
    const y: number[] = coordinatesArray.map(coordinates => coordinates[1]);
    const north = Math.max(...y);
    const east = Math.max(...x);
    const south = Math.min(...y);
    const west = Math.min(...x);
    const spatialBounds = locations.length && coordinatesArray.length ? [[north, east], [south, west]] : [[85, 180], [-85, -180]];

    return spatialBounds;
};

export const getGeometry = (location: Location): Location['geometry'] => {
    const { geometry } = location;
    if (geometry) {
        return {
            ...geometry,
            // re-order the coordinates to [lat, lng] instead of [lng, lat] from the API to easily show on map
            coordinates: [geometry.coordinates[1], geometry.coordinates[0]]
        };
    } else {
        return null;
    };
};