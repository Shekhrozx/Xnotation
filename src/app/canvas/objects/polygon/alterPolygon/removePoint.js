import { getLabelById, setPolygonLabelOffsetProps } from '../../label/label.js';
import polygonProperties from '../properties.js';
import labelProperties from '../../label/properties.js';

function realignLabelToLowestPointLocation(polygon) {
  let lowestPointIndex = 0;
  while (Object.keys(polygon.points[lowestPointIndex]).length === 0) {
    lowestPointIndex += 1;
  }
  const labelObject = getLabelById(polygon.id);
  labelObject.left = polygon.points[lowestPointIndex].x
    - labelProperties.pointOffsetProperties().left;
  labelObject.top = polygon.points[lowestPointIndex].y
    - labelProperties.pointOffsetProperties().top;
  setPolygonLabelOffsetProps(polygon, polygon.points[lowestPointIndex]);
}

function checkIfLowestPoint(polygon, pointId) {
  for (let i = 0; i < pointId; i += 1) {
    if (Object.keys(polygon.points[i]).length !== 0) {
      return false;
    }
  }
  return true;
}

function ifExistingPolygonIsLowestPoint(existingPolygon, polygon, pointId) {
  if (existingPolygon) {
    return checkIfLowestPoint(polygon, pointId);
  }
  return false;
}

// handles invocation of removing points, when the shape has more than 3 points
function removePolygonPointImpl(canvas, polygon, polygonPoints, pointId, existingPolygon) {
  const realignLabel = ifExistingPolygonIsLowestPoint(existingPolygon, polygon, pointId);
  if (polygon.previousShapeName === 'polygon') {
    if (polygon.points.length - polygon.numberOfNullPolygonPoints > 3) {
      // the final point is removed already
      if (Object.keys(polygon.points[pointId]).length === 0) {
        /* when the last polygons are removed, the ones before it are moved
        // to the last position - thus causing the possibility of getting nulls
         TIP - when point is null - it was already moved to the last element */
        for (let i = pointId - 1; i > -1; i -= 1) {
          if (Object.keys(polygon.points[i]).length !== 0) {
            polygon.points[polygon.points.length - 1] = polygon.points[i];
            polygon.points[i] = {};
            break;
          }
        }
      }
      // the final point is equal to point id
      else if ((polygon.points.length - 1) === pointId) {
        /* when last element - remove and find the next not null below it to
        to be the last element in order to enable the polygon to stay */
        for (let i = pointId - 1; i > -1; i -= 1) {
          if (Object.keys(polygon.points[i]).length !== 0) {
            polygon.points[pointId] = polygon.points[i];
            polygon.points[i] = {};
            break;
          }
        }
      }
      // if pointID is not final point, even it is the fourth point to remove
      //
      else {
        polygon.points[pointId] = {};
      }
      canvas.remove(polygonPoints[pointId]);
      polygonPoints[pointId] = null;
      polygon.numberOfNullPolygonPoints += 1;
      if (polygon.points.length - polygon.numberOfNullPolygonPoints === 3) {
          polygonPoints.forEach((point) => {
            if (point) point.set(polygonProperties.disabledRemovePoint());
          });
      }
    }
  }
// Line Mode
  if (polygon.previousShapeName === 'newLine'){
    let extraPointRemoveFromLine = polygon.points.length - 1 - pointId;
    if (polygon.points.length - polygon.numberOfNullPolygonPoints > 4) {
      // we do not use this condition, because, if it is final point, the initial points becomes null;
      // therefore pointID = pointID -1, and it is not empty
      if (Object.keys(polygon.points[pointId]).length === 0) {
        for (let i = pointId - 1; i > -1; i -= 1) {
          if (Object.keys(polygon.points[i]).length !== 0) {
            polygon.points[polygon.points.length - 1] = polygon.points[i];
            polygon.points[i] = {};
            break;
          }
        }
      }
      // if it is final point of the line
      else if ((polygon.points.length - 1) === pointId){
        for (let i = pointId - 1; i > -1; i -= 1) {
          if (Object.keys(polygon.points[i]).length !== 0) {
            polygon.points[pointId] = polygon.points[i];
            polygon.points[i] = {};
            polygon.points[extraPointRemoveFromLine] = {};
            break;
          }
        }
      }
      // if it is not the last point
      else //if ( (pointId !== 0) || (pointId !== polygon.points.length-1) )//|| (pointId !== ) )
      {
        polygon.points[pointId] = {};
        polygon.points[extraPointRemoveFromLine] = {};
      }
      canvas.remove(polygonPoints[pointId]);
      canvas.remove(polygonPoints[extraPointRemoveFromLine]);
      polygonPoints[pointId] = null;
      polygonPoints[extraPointRemoveFromLine] = null;
      polygon.numberOfNullPolygonPoints += 2;
      if (polygon.points.length - polygon.numberOfNullPolygonPoints === 4) {
        polygonPoints.forEach((point) => {
          if (point) {
            point.set(polygonProperties.disabledRemovePoint());
          }
        });
      }
    }
  }

  if (realignLabel) {
    realignLabelToLowestPointLocation(polygon);
  }
  canvas.renderAll();
}

function refreshPolygonPointIds(noNullPointsRef) {
  let pointId = 0;
  noNullPointsRef.forEach((point) => {
    point.pointId = pointId;
    pointId += 1;
  });
  return noNullPointsRef;
}

function getCleanPolygonPointsArrayImpl(polygon, pointsObjects) {
  const noNullPointsRef = [];
  pointsObjects.forEach((point) => {
    if (point) noNullPointsRef.push(point);
  });
  if (!polygon) return [];
  const polygonPoints = polygon.points;
  const noNullPolygonPoints = [];
  for (let i = 0; i < polygonPoints.length; i += 1) {
    if (Object.keys(polygonPoints[i]).length !== 0) {
      noNullPolygonPoints.push(polygonPoints[i]);
    }
  }
  polygon.set('points', noNullPolygonPoints);
  polygon.numberOfNullPolygonPoints = 0;
  refreshPolygonPointIds(noNullPointsRef);
  return noNullPointsRef;
}

/* function getCleanPolygonPointsArrayImpl(polygon, pointObjects) {
  const noNullPointObjects = [];
  pointObjects.forEach((point) => {
    if (point) noNullPointObjects.push(point);
  });
  pointObjects = [];
  if (!polygon) return [];
  const polygonPoints = polygon.points;
  const noNullPolygonPoints = [];
  for (let i = 0; i < polygonPoints.length; i += 1) {
    if (Object.keys(polygonPoints[i]).length !== 0) {
      noNullPolygonPoints.push(polygonPoints[i]);
    }
  }
  polygon.set('points', noNullPolygonPoints);
  polygon.numberOfNullPolygonPoints = 0;
  for (let i = 0; i < noNullPointObjects.length; i += 1) {
    noNullPointObjects[i].pointId = noNullPointObjects[i].pointId;
  }
  return noNullPointObjects;
}
*/
export { removePolygonPointImpl, getCleanPolygonPointsArrayImpl };
