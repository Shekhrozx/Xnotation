import { setPolygonLabelOffsetProps } from '../../label/label.js';
import { removeShape, addShape, getShapeColorById } from '../../allShapes/allShapes.js';

let currentPolygon = null;
let polygonPoints = [];
let canvas = null;
let polygonProperties = null;
let movePolygonPointOffsetReduction = 0;

///////////
function setObjets(polygonObj, polygonPointsArray, canvasObj, polygonPropertiesObj) {
  currentPolygon = polygonObj;
  polygonPoints = polygonPointsArray;
  canvas = canvasObj;
  polygonProperties = polygonPropertiesObj;
}
// for building up the polygon only after moving
function generateNewPolygon() {
  // Polygon edited
  // fabric does ot build up offset of polygon
  const newPolygon = new fabric.Polygon([], polygonProperties.newPolygon(currentPolygon));
  if (currentPolygon.previousShapeName === 'newLine') {
    newPolygon.set({
      previousShapeName: 'newLine'
    });
  }
  else {
    newPolygon.set({
      previousShapeName: 'polygon'
    });
  }
  newPolygon.set({
    id: currentPolygon.id,
    selectable: true,
    hoverCursor: 'move',
    shapeLabelText: currentPolygon.shapeLabelText,
  });
  return newPolygon;
}
// building up only while moving polygon
function calculateMovedPointsCoordinates() {
  const matrix = currentPolygon.calcTransformMatrix();
  const movedPoints = currentPolygon.get('points')
    .map(p => new fabric.Point(
      p.x - currentPolygon.pathOffset.x,
      p.y - currentPolygon.pathOffset.y,
    ))
    .map(p => fabric.util.transformPoint(p, matrix));
  return movedPoints;
}
function generateNewPoints(movedPoints) {
  let pointId = 0;
  const movedPointsCoordinates = [];
  movedPoints.forEach((p) => {
    const point = new fabric.Circle(polygonProperties.existingPolygonPoint(pointId, p, true));
    point.set('polygonMoved', true);
    canvas.add(point);
    polygonPoints.push(point);
    movedPointsCoordinates.push({ x: point.left - 1, y: point.top - 1 });
    pointId += 1;
  });
  return movedPointsCoordinates;
}
// Evoked after moving whole Polygon, not only one point
// Works for Line too
// Builds up new coordinates of polygon
function movePolygonToNewPosition() {
  const newPosition = currentPolygon._calcDimensions();
  currentPolygon.set({
    left: newPosition.left,
    top: newPosition.top,
    height: newPosition.height,
    width: newPosition.width,
    pathOffset: {
      x: newPosition.left + newPosition.width / 2 - movePolygonPointOffsetReduction,
      y: newPosition.top + newPosition.height / 2 - movePolygonPointOffsetReduction,
    },
  });
  currentPolygon.setCoords();
  canvas.renderAll();
}
/////

function generatePolygonAfterMove(polygonObj, polygonPointsArray, canvasObj, polygonPropertiesObj) {
  setObjets(polygonObj, polygonPointsArray, canvasObj, polygonPropertiesObj);
  const newPolygon = generateNewPolygon();
  canvas.add(newPolygon);
  const movedPoints = calculateMovedPointsCoordinates();
  const polygonPointsCoordinates = generateNewPoints(movedPoints);
  const currentPolygonColor = getShapeColorById(currentPolygon.id);
  removeShape(currentPolygon.id);
  addShape(newPolygon, currentPolygonColor, newPolygon.id);
  currentPolygon = newPolygon;
  currentPolygon.set('polygonMoved', true);
  currentPolygon.set('points', polygonPointsCoordinates);
  movePolygonToNewPosition(currentPolygon, canvas);
  setPolygonLabelOffsetProps(currentPolygon, currentPolygon.points[0]);
  return currentPolygon;
}

function changeMovePolygonPathOffset(newOffsetReduction) {
  movePolygonPointOffsetReduction = newOffsetReduction;
}

export { generatePolygonAfterMove, changeMovePolygonPathOffset };