import { Polygon } from 'geojson';

interface NWESBounds {
  north: number,
  east: number,
  south: number,
  west: number
}

export const getSpatialBoundsIntersect = (bounds1: NWESBounds, bounds2: NWESBounds) => {
  const intersectSpatialBounds = {
    north: bounds1.north < bounds2.north ? bounds1.north : bounds2.north,
    east: bounds1.east < bounds2.east ? bounds1.east : bounds2.east,
    south: bounds1.south > bounds2.south ? bounds1.south : bounds2.south,
    west: bounds1.west > bounds2.west ? bounds1.west : bounds2.west,
  }
  if (
      intersectSpatialBounds.north < intersectSpatialBounds.south ||
      intersectSpatialBounds.east < intersectSpatialBounds.west
      ) {
      return null;
  } else {
    return intersectSpatialBounds;
  }
}

interface HasPolygonGeometry {
  geometry: Polygon
}

export const gridPolygonToSpatialBounds = (polygon: HasPolygonGeometry): NWESBounds => {
  const coordinates = polygon.geometry.coordinates[0];
  const eastWests = coordinates.map(e=>e[0]);
  const northSouths = coordinates.map(e=>e[1]);

  return {
    north: Math.max(...northSouths),
    east: Math.max(...eastWests),
    south: Math.min(...northSouths),
    west: Math.min(...eastWests),
  }

}
