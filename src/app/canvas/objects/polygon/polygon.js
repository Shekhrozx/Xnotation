// import fabric from 'fabric.js';
import polygonProperties from './properties.js';
import { setDrawCursorMode, resetObjectCursors } from '../../mouseInteractions/cursorModes/drawMode.js';
import { showLabellerModal } from '../../../tools/labellerModal/style.js';
import { prepareLabelShape } from '../../../tools/labellerModal/labellingProcess.js';
import {
  setPolygonDrawingInProgressState, setAddingPolygonPointsState,
  getMovableObjectsState, getAddingPolygonPointsState, setSessionDirtyState,
  setReadyToDrawShapeState, getCurrentZoomState, getDoubleScrollCanvasState,
  getTestDrawLineState, setTestDrawLineState,
} from '../../../tools/state.js';
import { preventOutOfBoundsPointsOnMove } from '../sharedUtils/moveBlockers.js';
import { preventOutOfBoundsOnNewObject } from '../sharedUtils/newObjectBlockers.js';
import {
  setAddPointsButtonToDefault, setRemovePointsButtonToDefault,
  setRemoveLabelsButtonToDefault, setCreatePolygonButtonToActive,
  setCreateNewLineButtonToActive,
} from '../../../tools/toolkit/styling/state.js';
import { getLastMouseMoveEvent } from '../../../keyEvents/mouse/mouseMove.js';

let canvas = null;
let pointArray = [];

let pointArrayNewLine = [];
let pointArrayNewLineCopyToClearCanvas = [];
let activeShape = null;
let activeShapeNewLineArray = [];

let polygonMode = true;
let lineMode = true;

let pointId = 0;
let mouseUpClick = null;
let lastMouseEvent = null;
let lastHoveredPoint = null;
let mouseMoved = false;
let invisiblePoint = null;
let drawingFinished = false;
let currentlyHoveredPoint = null;
let ignoredFirstMouseMovement = false;
let lastNewPointPosition = { x: -1, y: -1 };

let movedOverflowScroll = false;
let createdInvisiblePoint = false;
let mouseIsDownOnTempPoint = false;

// Being evoked in initialization and generation process of Polygon. At the second time Active shape is null.
// For Line Mode is evoked only initialization
// Active shape consider all grey lines and Active Line - for Polygon Mode.
// Active shape consider only last line with two points forming considered line.
// Removes the last Active Line for Line Mode and Polygon Mode.
function removeActiveShape() {
  // Polygon Mode
  if (!getTestDrawLineState()) {
    canvas.remove(activeShape);
    activeShape = null;
  }
  // Line Mode
  else {
    canvas.remove(activeShape);
    activeShape = null;
    activeShapeNewLineArray.forEach((points) => {
      canvas.remove(points);
    });
    pointArrayNewLine.forEach( (points) => {
      canvas.remove(points);
    });
  }
}

/* initial point should begin with one color and switch when there are 3
 points to indicate that a new polygon can be created
let points = [pointer.x, pointer.y, pointer.x, pointer.y];
if (pointArray.length === 0) {
  const polygon = new fabric.Polygon(points, polygonProperties.newTempPolygon);
  canvas.add(polygon);
}
if (pointArray.length === 2) {
  pointArray[0].set(polygonProperties.firstPoint);
}
*/

////////////// Also for New Line
function addPoint(pointer) {
  const isNewPoint = true;
  const point = new fabric.Circle(polygonProperties.newPoint(pointId, pointer, isNewPoint));
  setPolygonDrawingInProgressState(true);
  pointId += 1;
  let points = [pointer.x, pointer.y, pointer.x, pointer.y];

  if (getTestDrawLineState()){
    setCreateNewLineButtonToActive();
    setTestDrawLineState(true);
    point.stroke = 'violet';
    point.fill = 'white';
  }

  else
  {
    setCreatePolygonButtonToActive();
    setTestDrawLineState(false);
  }

  // Only for polygon mode. Activates, if it has 2 points as minimum
  if ( (activeShape) && (!getTestDrawLineState()) ) {
    points = activeShape.get('points');
    points.push({
      x: pointer.x,
      y: pointer.y,
    });
    const polygon = new fabric.Polygon(points, polygonProperties.newTempPolygon());

    // Reduces the opacity of temporary Polygon and removes at the end the temporary Polygon
    canvas.remove(activeShape);
    canvas.add(polygon); // Adds lines and temporary polygon
    activeShape = polygon;
    currentlyHoveredPoint = point;
    canvas.renderAll();
  }

  // Line mode + polygon mode
  // if there is 1 point on the scene
  else {
    // polyPoint array keeps for line in i=0 - the active Line's direction, the pointer (mouse move), in i=1 - the yellow point of line
    // polyPoint array keeps for Polygon its points, within last point, instead of last point - another point?
    const polyPoint = [{
      x: pointer.x,
      y: pointer.y,
    }];
    const polygon = new fabric.Polygon(polyPoint, polygonProperties.newTempPolygon()); /// activeLine
    activeShape = polygon;
    activeShapeNewLineArray.push(polygon);

    // Line mode
    if (getTestDrawLineState())
    {
      canvas.add(polygon);
      points.push({
        x: pointer.x,
        y: pointer.y,
      });

      // for Line Mode it is essential
      pointArray = [];
    }
    else{
      canvas.add(polygon);
    }
  }
  canvas.add(point); // adds the points where the 'mouse down' event happened
  // if only 1 point on the scene
  // Polygon mode
  if ((pointArray.length === 0) && (!getTestDrawLineState()) ) {
    invisiblePoint = new fabric.Circle(polygonProperties.invisiblePoint(pointer));
    canvas.add(invisiblePoint);
    point.set(polygonProperties.firstPoint());
    setAddPointsButtonToDefault();
    setRemovePointsButtonToDefault();
    setRemoveLabelsButtonToDefault();
  }

  // Line Mode
  if (getTestDrawLineState()){
    invisiblePoint = new fabric.Circle(polygonProperties.invisiblePoint(pointer));
    canvas.add(invisiblePoint);
    setAddPointsButtonToDefault();
    setRemovePointsButtonToDefault();
    setRemoveLabelsButtonToDefault();
    pointArrayNewLine.push(point);
    pointArrayNewLineCopyToClearCanvas.push(point);
  }
  preventOutOfBoundsPointsOnMove(point, canvas);
  pointArray.push(point);
  drawTemporaryShape(pointer);
  activeShape.sendToBack();
  canvas.selection = false;
  const { x, y } = pointer;
  lastNewPointPosition = { x, y };
  if (getTestDrawLineState()){
    pointArray = []; // to delete last point of New line
  }
}

// To delete points on new canvas
// Only after uploading new image
function clearLineData(){
  if (pointArrayNewLine[0]) {
    pointArrayNewLine.forEach((point) => {
      canvas.remove(point);
    });
  }
}

// at the beginning, after choosing Line or Polygon option
function resetNewPolygonData() {
  if (canvas) resetObjectCursors(canvas);
  clearPolygonData();
}

function changeInitialPointColour(colour) {
  if (pointArray.length > 2) {
    pointArray[0].stroke = colour;
  }
}

// draws Polygon with green borders
// Activates by 'enter' event
function generatePolygon() {

  const points = [];
  pointArray.forEach((point) => {
    points.push({
      x: point.left,
      y: point.top,
    });
    canvas.remove(point);
  });
  const pointsNewLine = [];
  pointArrayNewLineCopyToClearCanvas.forEach((point) => {
    pointsNewLine.push({
      x: point.left,
      y: point.top,
    });
    //canvas.remove(point);
  });

  let polygon = null; // the entire polygon, and New line
  // For Polygon mode
  if (!getTestDrawLineState()) {
    // if to comment further line, the active shape remains on the scene, but it implies that it doesn't move with main polygon
    removeActiveShape();
    polygon = new fabric.Polygon(points, polygonProperties.newPolygon(polygon)); // for now, got it from if cycle above
    lockMovementIfAssertedByState(polygon);
    canvas.add(polygon);
  }

  // For Line Mode
  else {
    // essential to remove Active shape - it is an Active line, otherwise the red line with mouse pointer remains
    removeActiveShape();
    const lengthArray = pointsNewLine.length;
    let i;
    let tempArrayLine = [];
    tempArrayLine.push(...pointsNewLine);
    for (i = lengthArray- 1; i>-1; i--) {
        tempArrayLine.push(pointsNewLine[i]);
    }
    polygon = new fabric.Polygon(tempArrayLine, polygonProperties.newPolygon(polygon));
    canvas.add(polygon);
    lockMovementIfAssertedByState(polygon);
    pointId = 0;
    resetDrawLineMode();
  }

  activeShape = null;
  polygonMode = false;
  lineMode = false;
  drawingFinished = true;
  prepareLabelShape(polygon, canvas);
  showLabellerModal();
  setPolygonDrawingInProgressState(false);
  setSessionDirtyState(true);
  pointArrayNewLine = [];
  pointArrayNewLineCopyToClearCanvas = [];
}

// Being invoked only in Line Mode.
// Only after button 'enter' being hit for Polygon.
// But before choosing an option for label name
function resetDrawLineMode() {
  lineMode = true;
  setTestDrawLineState(true);
  setCreateNewLineButtonToActive();
  polygonMode = true;
  setReadyToDrawShapeState(true);
  drawingFinished = false;
  clearPolygonData();
  setDrawCursorMode(canvas);
}

// Being invoked only in Polygon Mode.
// Only after button 'enter' being hit for Polygon.
function resetDrawPolygonMode() {
    polygonMode = true;
    setCreatePolygonButtonToActive();
    setReadyToDrawShapeState(true);
    drawingFinished = false;
    clearPolygonData();
    setDrawCursorMode(canvas);
}

// at the end and the beginning of drawing polygon, line
// at the beginning for rectangle
function clearPolygonData() {
  pointId = 0;
  if (pointArray[0]) {
    pointArray.forEach((point) => {
      canvas.remove(point);
    });
    invisiblePoint = null;
    removeActiveShape();
    pointArray = [];
    activeShape = null;
    mouseMoved = false;
    drawingFinished = false;
    ignoredFirstMouseMovement = false;
    setPolygonDrawingInProgressState(false);
    lastMouseEvent = null;
    createdInvisiblePoint = false;
    lastNewPointPosition = { x: -1, y: -1 };
  }
}

// ???
function getTempPolygon() {
  if (activeShape) {
    const points = activeShape.get('points');
    points.length -= 1;
    return activeShape;
  }
  return null;
}
// ???
function getCurrentlyHoveredDrawPoint() {
  return currentlyHoveredPoint;
}
// ???
function isPolygonDrawingFinished() {
  return drawingFinished;
}

// mouse over the shape
function polygonMouseOverEvents(event) {
  if (event.target && event.target.selectable && event.target.shapeName === 'invisiblePoint') {
    changeInitialPointColour('red');
  }
}

function polygonMouseOutEvents(event) {
  if (event.target) {
    const { target } = event;
    if (target.shapeName === 'invisiblePoint') {
      changeInitialPointColour('#333333');
    } else if (target.shapeName === 'tempPoint' && target.hoverCursor === 'default') {
      target.hoverCursor = 'move';
    }
    if (!mouseMoved) {
      lastHoveredPoint = event.target;
    }
    currentlyHoveredPoint = null;
  }
}

function generatePolygonViaKeyboard() {
  if ( (pointArray.length > 2) || (getTestDrawLineState() && (pointArrayNewLine.length > 1)) )
  {
    generatePolygon();
    //pointArrayNewLine = [];
  }
}

function addPointViaKeyboard() {
  if (!mouseMoved) {
    if (lastHoveredPoint && lastHoveredPoint.shapeName === 'tempPoint') {
      return;
    }
    mouseMoved = true;
  }
  if (lastMouseEvent) {
    let pointer = canvas.getPointer(lastMouseEvent.e || lastMouseEvent);
    if (lastMouseEvent.target && lastMouseEvent.target.shapeName === 'invisiblePoint') {
      if (pointArray.length > 2) {
        generatePolygon();
      }
    } else if (
        (pointer.x === lastNewPointPosition.x && pointer.y === lastNewPointPosition.y)
        || (lastMouseEvent.target && lastMouseEvent.target.shapeName === 'tempPoint')
        || (createdInvisiblePoint && Number.isNaN(pointer.x))) {
      // placeholder
    } else {
      if (!pointer.x || !pointer.y) {
        const lastMouseMoveEvent = getLastMouseMoveEvent();
        const lastCanvasPointer = canvas.getPointer(lastMouseMoveEvent);
        if (!lastCanvasPointer.x || !lastCanvasPointer.y) return;
        pointer = canvas.getPointer(lastMouseMoveEvent);
      }
      setReadyToDrawShapeState(false);
      addPoint(pointer);
      createdInvisiblePoint = true;
    }
  }
}

// React on each mouse down, after new point
// Both for Polygon and Line modes
// Checks whether mouse down occurs on Polygon, invisible point or temporary point of inferior polygon
function instantiatePolygon(event) {
  const pointer = canvas.getPointer(event.e);
  if (!isRightMouseButtonClicked(pointer)) {
    //started to draw
    setReadyToDrawShapeState(false);
    // only if polygon exists and we draw on it new points of polygon, place of intersection
    if (event.target && event.target.shapeName) {
      if (event.target.shapeName === 'invisiblePoint') {
        // if to press on the beginning point of the Polygon, it finishes the Polygon
        // does not work with Line Mode
        if ( (pointArray.length > 2) ) {
          generatePolygon();
        }
      }

      else if (event.target.shapeName === 'tempPoint') {
        mouseIsDownOnTempPoint = true;
      }

      // works inside the polygon
      else if (polygonMode) {
        addPoint(pointer);
      }
    }

    // Here the place of drawing line for polygon
    else if (polygonMode) {
      addPoint(pointer);
    }
    lastMouseEvent = event;
  }
}

function isRightMouseButtonClicked(pointer) {
  if (activeShape && (canvas.getPointer(lastMouseEvent.e).x !== pointer.x)) {
    return true;
  }
  return false;
}

// Active for each movement of mouse
// Active Shape for polygon consists of all points
// Active Shape for line consists of 1 or 2 points
function drawTemporaryShape(pointer) {
  if (activeShape) {
    if (!movedOverflowScroll) {
      const points = activeShape.get('points');
      points[pointArray.length] = {
        x: pointer.x,
        y: pointer.y,
      };
      activeShape.set({
        points,
      });
      canvas.renderAll();
    } else {
      repositionCrosshair(pointer);
      movedOverflowScroll = false;
    }
  }
}

// Reacts on each mouse move, while drawing polygon and line, until 'enter'
// draws the line for New line process
function drawPolygon(event) {
  if (ignoredFirstMouseMovement) {
    mouseMoved = true;
  } else {
    ignoredFirstMouseMovement = true;
  }
  lastMouseEvent = event;
  const pointer = canvas.getPointer(event.e);
  drawTemporaryShape(pointer);
}

// sets the points of polygon or line as immovable object
// for setting this property, need to hit check box in settings - 'movable object'
function lockMovementIfAssertedByState(polygon) {
  if (!getMovableObjectsState()) {
    const immovableObjectProps = {
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: 'default',
    };
    polygon.set(immovableObjectProps);
  }
}

// Being evoked 2 times before Polygon Mode
// Being evoked 2 times before Line Mode + after 'enter' at the end of process
// Being evoked 2 times after loading new image
function prepareCanvasForNewPolygon(canvasObj) {
  canvas = canvasObj;
  polygonMode = true;
  lineMode = true;
  drawingFinished = false;
  canvas.discardActiveObject();
  setDrawCursorMode(canvas);
  setReadyToDrawShapeState(true);
  if (getAddingPolygonPointsState()){ //|| getTestDrawLineState() ) {
    setAddPointsButtonToDefault();
    setAddingPolygonPointsState(false);
    mouseUpClick = skipMouseUpEvent;
  } else {
    mouseUpClick = placeHolderFunc;
  }
}

function repositionCrosshair(pointer) {
  const points = activeShape.get('points');
  points[pointArray.length] = {
    x: pointer.x,
    y: pointer.y,
  };
  activeShape.set({
    points,
  });
  const polygon = new fabric.Polygon(activeShape.get('points'), polygonProperties.newTempPolygon());
  removeActiveShape();
  activeShape = polygon;
  canvas.add(polygon);
  polygon.sendToBack();
  setPolygonDrawingInProgressState(true);
}

function movePoints(event) {
  if (activeShape) {
    preventOutOfBoundsPointsOnMove(event.target, canvas);
    const xCenterPoint = event.target.getCenterPoint().x;
    const yCenterPoint = event.target.getCenterPoint().y;
    activeShape.points[event.target.pointId] = {
      x: xCenterPoint, y: yCenterPoint,
    };
  }
}

function placeHolderFunc() {}

function assignMouseUpClickFunc() {
  mouseUpClick = placeHolderFunc;
}

function placeholderToAddMouseDownEvents() {
  mouseIsDownOnTempPoint = false;
  mouseUpClick();
}

function skipMouseUpEvent() {
  canvas.__eventListeners['mouse:down'] = [];
  canvas.on('mouse:down', (e) => {
    if (!e.target || (e.target && e.target.shapeName !== 'tempPoint')) {
      instantiatePolygon(e);
    }
  });
  assignMouseUpClickFunc();
}

function prepareCanvasForNewPolygonsFromExternalSources(canvasObj) {
  canvas = canvasObj;
  setDrawCursorMode(canvas);
}
function cleanPolygonFromEmptyPoints() {
  const polygonPoints = activeShape.get('points');
  const points = [];
  polygonPoints.forEach((point) => {
    if (Object.keys(point).length > 0) {
      points.push({
        x: point.x,
        y: point.y,
      });
    }
  });
  activeShape.set({
    points,
  });
  canvas.renderAll();
  let currentPointId = 0;
  const tempPointArray = [];
  canvas.forEachObject((iteratedObj) => {
    if (iteratedObj.shapeName === 'point') {
      iteratedObj.set(polygonProperties.changeRemovablePointToTemp(currentPointId));
      if (currentPointId === 0) {
        iteratedObj.set(polygonProperties.firstPoint());
      }
      currentPointId += 1;
      tempPointArray.push(iteratedObj);
    }
  });
  pointArray = tempPointArray;
  pointId = currentPointId;
  canvas.renderAll();
  points[pointArray.length] = {
    x: points[0].x,
    y: points[0].y,
  };
  activeShape.set({
    points,
  });
  canvas.renderAll();
}

function resumeDrawingAfterRemovePoints() {
  mouseMoved = false;
  ignoredFirstMouseMovement = false;
  activeShape.numberOfNullPolygonPoints = 0;
  cleanPolygonFromEmptyPoints();
  setDrawCursorMode(canvas);
  if (pointArray.length !== 0) {
    const position = { x: pointArray[0].left, y: pointArray[0].top };
    invisiblePoint = new fabric.Circle(polygonProperties.invisiblePoint(position));
    canvas.add(invisiblePoint);
  }
  setTimeout(() => {
    const lastMouseMoveEvent = getLastMouseMoveEvent();
    if (currentlyHoveredPoint && currentlyHoveredPoint.state === 'removed') lastNewPointPosition = { x: -1, y: -1 };
    currentlyHoveredPoint = null;
    lastMouseEvent = lastMouseMoveEvent;
    const pointer = canvas.getPointer(lastMouseMoveEvent);
    drawTemporaryShape(pointer);
  });
}

function removeInvisiblePoint() {
  invisiblePoint = null;
}

function getScrollWidth() {
  // create a div with the scroll
  const div = document.createElement('div');
  div.style.overflowY = 'scroll';
  div.style.width = '50px';
  div.style.height = '50px';

  // must put it in the document, otherwise sizes will be 0
  document.body.append(div);
  const scrollWidth = div.offsetWidth - div.clientWidth;
  div.remove();
  return scrollWidth * 2;
}

function topOverflowScroll(event, zoomOverflowElement) {
  const currentScrollTopOffset = zoomOverflowElement.scrollTop / getCurrentZoomState();
  const newPositionTop = canvas.getPointer(event.e).y - currentScrollTopOffset;
  if (mouseIsDownOnTempPoint) {
    if (event.target.shapeName === 'tempPoint') {
      event.target.top = newPositionTop;
      activeShape.points[event.target.pointId].y = event.target.top;
    }
  }
  const points = activeShape.get('points');
  points[pointArray.length].y = newPositionTop;
  activeShape.set({
    points,
  });
}

function bottomOverflowScroll(event, zoomOverflowElement, stubHeight, scrollWidth) {
  const canvasHeight = stubHeight + scrollWidth;
  const canvasBottom = zoomOverflowElement.scrollTop + zoomOverflowElement.offsetHeight;
  const result = canvasHeight - canvasBottom;
  const newPositionTop = canvas.getPointer(event.e).y + (result / getCurrentZoomState());
  if (mouseIsDownOnTempPoint) {
    if (event.target.shapeName === 'tempPoint') {
      event.target.top = newPositionTop;
      activeShape.points[event.target.pointId].y = newPositionTop;
    }
  }
  const points = activeShape.get('points');
  points[pointArray.length] = {
    x: canvas.getPointer(event.e).x,
    y: newPositionTop,
  };
  activeShape.set({
    points,
  });
}

function defaultScroll(event) {
  const currentVerticalScrollDelta = event.e.deltaY / getCurrentZoomState();
  const newPositionTop = canvas.getPointer(event.e).y + currentVerticalScrollDelta;
  const currentHorizontalScrollDelta = event.e.deltaX / getCurrentZoomState();
  if (mouseIsDownOnTempPoint) {
    if (event.target.shapeName === 'tempPoint') {
      event.target.left = canvas.getPointer(event.e).x + currentHorizontalScrollDelta;
      event.target.top = newPositionTop;
      activeShape.points[event.target.pointId] = {
        x: event.target.left, y: event.target.top,
      };
    }
  }
  const points = activeShape.get('points');
  points[pointArray.length] = {
    x: canvas.getPointer(event.e).x + currentHorizontalScrollDelta,
    y: newPositionTop,
  };
  activeShape.set({
    points,
  });
}

function shapeScrollEvents(event) {
  const currentZoom = getCurrentZoomState();
  if (currentZoom > 1.00001) {
    if (activeShape || (mouseIsDownOnTempPoint && event.target.shapeName === 'tempPoint')) {
      const stubElement = document.getElementById('stub');
      const stubMarginTop = stubElement.style.marginTop;
      const stubHeightSubstring = stubMarginTop.substring(0, stubMarginTop.length - 2);
      const stubHeight = parseInt(stubHeightSubstring, 10);
      const zoomOverflowElement = document.getElementById('zoom-overflow');
      const currentBotLocation = zoomOverflowElement.scrollTop + zoomOverflowElement.offsetHeight;
      const futureBotLocation = currentBotLocation + event.e.deltaY;
      const scrollWidth = getDoubleScrollCanvasState() ? getScrollWidth() : getScrollWidth() / 2;
      if (zoomOverflowElement.scrollTop + event.e.deltaY < 0) {
        topOverflowScroll(event, zoomOverflowElement);
      } else if (futureBotLocation > stubHeight + scrollWidth) {
        bottomOverflowScroll(event, zoomOverflowElement, stubHeight, scrollWidth);
      } else {
        defaultScroll(event);
      }
      const polygon = new fabric.Polygon(activeShape.get('points'), polygonProperties.newTempPolygon());
      removeActiveShape();
      activeShape = polygon;
      canvas.add(polygon);
      polygon.sendToBack();
    }
  }
}

function scrolledViaScrollbar() {
  if (activeShape) {
    movedOverflowScroll = true;
  }
}

function createNewPolygonFromCoordinates(points, imageScalingDimensions, imageLengthDimensions) {
  const polygon = new fabric.Polygon(points, polygonProperties.newPolygon());
  preventOutOfBoundsOnNewObject(polygon, imageScalingDimensions, imageLengthDimensions);
  lockMovementIfAssertedByState(polygon);
  return polygon;
}

export {
  movePoints,
  drawPolygon,
  getTempPolygon,
  shapeScrollEvents,
  instantiatePolygon,
  addPointViaKeyboard,
  resetNewPolygonData,
  scrolledViaScrollbar,
  removeInvisiblePoint,
  resetDrawPolygonMode,
  polygonMouseOutEvents,
  polygonMouseOverEvents,
  changeInitialPointColour,
  isPolygonDrawingFinished,
  prepareCanvasForNewPolygon,
  generatePolygonViaKeyboard,
  getCurrentlyHoveredDrawPoint,
  resumeDrawingAfterRemovePoints,
  placeholderToAddMouseDownEvents,
  createNewPolygonFromCoordinates,
  prepareCanvasForNewPolygonsFromExternalSources,
  clearLineData,
};