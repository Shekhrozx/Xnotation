import { registerHotKeys } from './keyEvents/keyboard/hotKeys.js';
import registerWindowMouseEvents from './keyEvents/mouse/registerEvents.js';
import { findUserOS } from './tools/OS/OSManager.js';
import { constructCanvas } from './canvas/canvas.js';
import initialiseToolkit from './tools/toolkit/init.js';
// import initialiseWelcomeModal from './tools/welcomeModal/init.js';
import initialiseLabellerModal from './tools/labellerModal/buttons.js';
// import { initialiseUploadDatasetsModal } from './tools/uploadDatasetsModal/views/viewManager.js';
// import { initialiseMachineLearningModal } from './tools/machineLearningModal/views/viewManager.js';
// import initialiseExportDatasetsPopup from './tools/exportDatasetsPopup/init.js';
import { initialiseSettingsPopup } from './tools/settingsPopup/init.js';
import assignPassiveEventListeners from './tools/passiveEventListeners/passiveEventListeners.js';
import initialiseShapeManipulationDeltas from './canvas/objects/deltaValueSetters/initialiseShapeManipulationDeltas.js';
import initialiseDragAndDropFunctionality from './tools/dragAndDrop/dragAndDrop.js';
import initialiseImageListFunctionality from './tools/imageList/init.js';
import initialiseLabelListFunctionality from './tools/labelList/init.js';
import initialiseRemoveImagesModal from './tools/imageList/removeImages/modal/init.js';
import { initialiseCoreButtonPopovers } from './tools/globalStyling/buttons/popovers.js';
import { applyStyling } from './tools/globalStyling/style.js';
import { initialiseImageSwitchPanelFunctionality } from './tools/imageSwitchPanel/style.js';
import { initialisePulseAnimationCancelling } from './tools/utils/buttons/pulseAnimation.js';
import { initialiseWindowDimService } from './tools/dimWindow/dimWindowService.js';
import initialiseBrowserExitHandler from './tools/browserExit/browserExitHandler.js';

// Debugging Mode
window.DEBUG = true;



findUserOS();
applyStyling();
constructCanvas();
registerHotKeys();
initialiseToolkit();
initialiseLabellerModal();
initialiseSettingsPopup();
registerWindowMouseEvents();
initialiseWindowDimService();
initialiseCoreButtonPopovers();

// initialiseExportDatasetsPopup();
// initialiseUploadDatasetsModal();
// initialiseMachineLearningModal();

assignPassiveEventListeners();
initialiseRemoveImagesModal();
initialiseImageListFunctionality();
initialiseLabelListFunctionality();
initialiseDragAndDropFunctionality();
initialiseImageSwitchPanelFunctionality();
initialisePulseAnimationCancelling();
initialiseShapeManipulationDeltas();
initialiseBrowserExitHandler();

// initialiseWelcomeModal();
