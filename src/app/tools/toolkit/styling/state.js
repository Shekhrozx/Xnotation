import {
  setButtonToActive, 
  setButtonToDefault, 
  setButtonToDisabled, 
  setButtonToGreyDefault,
} from './styling.js';
import { 
  getPolygonDrawingInProgressState, 
  getTestDrawLineState, 
} from '../../state.js';

import { getAllExistingShapes } from '../../../canvas/objects/allShapes/allShapes.js';

const state = { 
  ACTIVE: 'active', 
  DEFAULT: 'default', 
  DISABLED: 'disabled' 
};

let removePointsState = state.DEFAULT;
let createLineState = state.DEFAULT;
let addPointsState = state.DEFAULT;
let createBoundingBoxState = state.DEFAULT;
let createPolygonState = state.DEFAULT;
let editShapesState = state.DEFAULT;

let removePolygonPointsButtonElement = null;
let addPolygonPointsButtonElement = null;
let removeLabelsButtonElement = null;
let editShapesButtonElement = null;
let createLineButtonElement = null;
let zoomInButtonElement = null;
let zoomOutButtonElement = null;
let createBoundingBoxButtonElement = null;
let createPolygonButtonElement = null;
let removeImagesButtonElement = null;

function polygonsPresentInCurrentImage() {
  const currentShapes = getAllExistingShapes();
  const shapeIds = Object.keys(currentShapes);
  for (let i = 0; i < shapeIds.length; i += 1) {
    if (currentShapes[shapeIds[i]].shapeRef.shapeName === 'polygon') return true;
  }
  return false;
}

function setEditShapesButtonToDefault() {
  setButtonToDefault(editShapesButtonElement);
  editShapesState = state.DEFAULT;
}

function setEditShapesButtonToDisabled() {
  setButtonToDisabled(editShapesButtonElement);
  editShapesState = state.DISABLED;
}

function getEditShapesButtonState() {
  return editShapesState;
}

// Box
function setCreateBoundingBoxButtonToDefault() {
  setButtonToDefault(createBoundingBoxButtonElement);
  createBoundingBoxState = state.DEFAULT;
}
function setCreateBoundingBoxButtonToDisabled() {
  setButtonToDisabled(createBoundingBoxButtonElement);
  createBoundingBoxState = state.DISABLED;
  setCreateNewLineToDisabled();
}
function getCreateBoundingBoxButtonState() {
  return createBoundingBoxState;
}

//// Polygon
// Polygon Default
function setCreatePolygonButtonToDefault() {
  setButtonToDefault(createPolygonButtonElement);
  createPolygonState = state.DEFAULT;
}
// Polygon Disabled
function setCreatePolygonButtonToDisabled() {
  setButtonToDisabled(createPolygonButtonElement);
  createPolygonState = state.DISABLED;
}
// Polygon get state
function getCreatePolygonButtonState() {
  return createPolygonState;
}

//// New Line
// New Line Default
function setCreateNewLineToDefault(){
  setButtonToDefault(createLineButtonElement);
  createLineState = state.DEFAULT;
}
// New line Disabled
function setCreateNewLineToDisabled() {
  setButtonToDisabled(createLineButtonElement);
  createLineState = state.DISABLED;
}
// New line get state
function getCreateLineState() {
  return createLineState;
}

// Active states!!!
function setCreateNewLineButtonToActive() {
  setButtonToActive(createLineButtonElement);
  createLineState = state.ACTIVE;
  editShapesState = state.DEFAULT;
  if (createBoundingBoxState === state.ACTIVE) setCreateBoundingBoxButtonToDefault();
  if (createPolygonState === state.ACTIVE) setCreatePolygonButtonToDefault();
  if (addPointsState === state.ACTIVE) setAddPointsButtonToDefault();
  if (removePointsState === state.ACTIVE) setRemovePointsDefault();
  //if (editShapesState === state.ACTIVE) setEditShapesButtonToDefault();
  //testDrawLine();
}

function setAddPointsActive() {
  setButtonToActive(addPolygonPointsButtonElement);
  addPointsState = state.ACTIVE;
  if (createPolygonState === state.ACTIVE) setCreatePolygonButtonToDefault();
  if (createLineState === state.ACTIVE) setCreateNewLineToDefault();
}

function setCreatePolygonButtonToActive() {
  if (!getTestDrawLineState()) {
    setButtonToActive(createPolygonButtonElement);
    createPolygonState = state.ACTIVE;
  }
  if (createBoundingBoxState === state.ACTIVE) {
    setCreateBoundingBoxButtonToDefault();
  }
  if (editShapesState === state.ACTIVE) {
    setEditShapesButtonToDefault();
  }
  if (createLineState === state.ACTIVE) setCreateNewLineToDefault();
}

function setRemovePointsActive() {
  setButtonToActive(removePolygonPointsButtonElement);
  removePointsState = state.ACTIVE;
  if (createLineState === state.ACTIVE) setCreateNewLineToDefault();
}


function setEditShapesButtonToActive() {
  setButtonToActive(editShapesButtonElement);
  editShapesState = state.ACTIVE;
  if (createBoundingBoxState === state.ACTIVE) {
    setCreateBoundingBoxButtonToDefault();
  }
  if (createPolygonState === state.ACTIVE) {
    setCreatePolygonButtonToDefault();
  }
  if (createLineState === state.ACTIVE) setCreateNewLineToDefault();
}

function setCreateBoundingBoxButtonToActive() {
  setButtonToActive(createBoundingBoxButtonElement);
  createBoundingBoxState = state.ACTIVE;
  if (editShapesState === state.ACTIVE) setEditShapesButtonToDefault();
  if (createPolygonState === state.ACTIVE) setCreatePolygonButtonToDefault();
  if (createLineState === state.ACTIVE) setCreateNewLineToDefault();
}

function setAddPointsButtonToActive() {
  setAddPointsActive();
  if (createBoundingBoxState === state.ACTIVE) setCreateBoundingBoxButtonToDefault();
  if (createPolygonState === state.ACTIVE) setCreatePolygonButtonToDefault();
  if (removePointsState === state.ACTIVE) setRemovePointsDefault();
  if (createLineState === state.ACTIVE) setCreateNewLineToDefault();
}

function setRemovePointsButtonToActive() {
  setRemovePointsActive();
  if (createBoundingBoxState === state.ACTIVE) setCreateBoundingBoxButtonToDefault();
  if (createPolygonState === state.ACTIVE
      && !getPolygonDrawingInProgressState()) setCreatePolygonButtonToDefault();
  if (addPointsState === state.ACTIVE) setAddPointsDefault();
  if (createLineState === state.ACTIVE) setCreateNewLineToDefault();
}

// New Line state ???/
function setCreateNewLineToGrey(){
  setButtonToGreyDefault(createLineButtonElement);
}

//
function setRemoveImagesButtonDefault() {
  setButtonToGreyDefault(removeImagesButtonElement);
}

function setRemoveImagesButtonsDisabled() {
  setButtonToDisabled(removeImagesButtonElement);
}

function setAddPointsDefault() {
  setButtonToDefault(addPolygonPointsButtonElement);
  addPointsState = state.DEFAULT;
}

function setAddPointsDisabled() {
  setButtonToDisabled(addPolygonPointsButtonElement);
  addPointsState = state.DISABLED;
}

function getAddPointsButtonState() {
  return addPointsState;
}

// Remove Points
function setRemovePointsDefault() {
  setButtonToDefault(removePolygonPointsButtonElement);
  removePointsState = state.DEFAULT;
}

function setRemovePointsDisabled() {
  setButtonToDisabled(removePolygonPointsButtonElement);
  removePointsState = state.DISABLED;
}

function getRemovePointsButtonState() {
  return removePointsState;
}
// Label
function setRemoveLabelsButtonToDefault() {
  setButtonToDefault(removeLabelsButtonElement);
}
function setRemoveLabelsButtonToDisabled() {
  setButtonToDisabled(removeLabelsButtonElement);
}
// Zoom
function setZoomInButtonToDefault() {
  setButtonToDefault(zoomInButtonElement);
}
function setZoomInButtonToDisabled() {
  setButtonToDisabled(zoomInButtonElement);
}
function setZoomOutButtonToDefault() {
  setButtonToDefault(zoomOutButtonElement);
}
function setZoomOutButtonToDisabled() {
  setButtonToDisabled(zoomOutButtonElement);
}

// Polygon Editing = Remove + Add Points
function setPolygonEditingButtonsToDisabled() {
  if (!polygonsPresentInCurrentImage()) {
    setRemovePointsDisabled();
    setAddPointsDisabled();
    return true;
  }
  return false;
}

function setAddPointsButtonToDefault() {
  if (polygonsPresentInCurrentImage() && !getPolygonDrawingInProgressState()) {
    setAddPointsDefault();
  } else {
    setAddPointsDisabled();
  }
}

function setRemovePointsButtonToDefault() {
  if (polygonsPresentInCurrentImage() || getPolygonDrawingInProgressState()) {
    setRemovePointsDefault();
  } else {
    setRemovePointsDisabled();
  }
}

function setPolygonEditingButtonsToDefault() {
  setAddPointsButtonToDefault();
  setRemovePointsButtonToDefault();
}

function setInitialToolkitButtonStyling() {
  setAddPointsDisabled();
  setRemovePointsDisabled();
  setZoomInButtonToDisabled();
  setZoomOutButtonToDisabled();
  setEditShapesButtonToDisabled();
  setRemoveImagesButtonsDisabled();

  setCreatePolygonButtonToActive();

  setRemoveLabelsButtonToDisabled();
  setCreatePolygonButtonToDisabled();
  setCreateBoundingBoxButtonToDisabled();

  setCreateNewLineToDisabled();
}

function identifyToolkitButtons() {
  editShapesButtonElement = document.getElementById('edit-shapes-button');

  createLineButtonElement = document.getElementById('create-line-button');

  removePolygonPointsButtonElement = document.getElementById('remove-points-button');
  addPolygonPointsButtonElement = document.getElementById('add-points-button');
  removeLabelsButtonElement = document.getElementById('remove-labels-button');
  zoomInButtonElement = document.getElementById('zoom-in-button');
  zoomOutButtonElement = document.getElementById('zoom-out-button');
  createBoundingBoxButtonElement = document.getElementById('create-bounding-box-button');
  createPolygonButtonElement = document.getElementById('create-polygon-button');
  removeImagesButtonElement = document.getElementById('remove-images-button');
}

function initiateToolkitButtonsStyling() {
  identifyToolkitButtons();
  setInitialToolkitButtonStyling();
}

export {
  getAddPointsButtonState,
  getEditShapesButtonState,

  setZoomInButtonToDefault,
  setZoomInButtonToDisabled,
  setZoomOutButtonToDefault,

  getRemovePointsButtonState,
  setZoomOutButtonToDisabled,
  setAddPointsButtonToActive,
  getCreatePolygonButtonState,
  setAddPointsButtonToDefault,
  setEditShapesButtonToActive,
  setRemoveImagesButtonDefault,
  setEditShapesButtonToDefault,
  setRemovePointsButtonToActive,
  setEditShapesButtonToDisabled,
  initiateToolkitButtonsStyling,
  setRemoveLabelsButtonToDefault,
  setRemoveImagesButtonsDisabled,
  setRemovePointsButtonToDefault,
  setCreatePolygonButtonToActive,
  setRemoveLabelsButtonToDisabled,
  getCreateBoundingBoxButtonState,

  setCreatePolygonButtonToDefault,
  setCreatePolygonButtonToDisabled,
  setPolygonEditingButtonsToDefault,
  setPolygonEditingButtonsToDisabled,

  setCreateBoundingBoxButtonToActive,
  setCreateBoundingBoxButtonToDefault,
  setCreateBoundingBoxButtonToDisabled,

  setCreateNewLineToDisabled,
  setCreateNewLineToDefault,
  setCreateNewLineToGrey,
  setCreateNewLineButtonToActive,
  getCreateLineState,
};


// function getSetterFunc(newState) {
//   if (newState === state.ACTIVE) {
//     return setButtonToActive;
//   }
//   if (newState === state.DEFAULT) {
//     return setButtonToDefault;
//   }
//   return setButtonToDisabled;
// }

// function setPolygonEditingButtonsState(newState) {
//   const setterFunc = getSetterFunc(state);
//   setterFunc(removePolygonPointsButtonElement);
//   removePointsState = newState;
//   setterFunc(addPolygonPointsButtonElement);
//   addPointsState = newState;
// }