/**
 * @fileoverview jsui-scroll-bar.js - jsui script for control offset of subpatchers
 * @version 0.1.0
 * 
 * @param {array} jsarguments<br>
 * 0: this file name<br>
 * 1: whole width of target subpathcer<br>
 * 2: width of scroll bar area<br>
 * 3: draw vertical bar when 1, otherwise horizontal *TODO*
 *
 * outlet: offset number for thispatcher objects in subpathcer
 */

// global parameters for Max js
autowatch = 1;
inlets = 1;
outlets = 1;

// initialize mgraphics
mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

/** @constant must be even */
var LINE_WIDTH = 6;
/** @constant round part of */
var LINE_MARGIN = LINE_WIDTH / 2;
/** @constant @type {number} */
var TARGET_LENGTH = jsarguments[1];
/** @constant @type {number} */
var TOTAL_LENGTH = jsarguments[2]; // this.box.rect[2] - this.box.rect[0] - LINE_MARGIN;
/** @constant @type {number} */
var BAR_LENGTH = (TOTAL_LENGTH - LINE_MARGIN) * TOTAL_LENGTH / TARGET_LENGTH;

/** @global @type {Array<number>}*/
var color = [1.0, 1.0, 1.0, 0.4];

/** @global @type {number} */
var offset = 0;
/** @global @type {number} */
var oldOffset = 0;
/** @global @type {number} */
var clickPosition = -1;
/** @global @type {number} */
var fgAlpha = 0.5;
/** @global @type {number} */
var bgAlpha = 0;

// TODO examine jsarguments[3] as direction and assign callback functions

mgraphics.redraw();

// public methods
/**
 * set the color of scrollbar
 * @param {number} r red [0, 1]
 * @param {number} g green [0, 1]
 * @param {number} b blue [0, 1]
 * @param {number} a alpha [0, 1]
 */
function setcolor(r, g, b, a) {
  color = [r, g, b, a];
}

// TODO function setoffset(number) to set 

// local methods
paint.local = 1;
function paint() {
  mgraphics.set_line_cap('round');
  mgraphics.set_line_width(LINE_WIDTH);
  mgraphics.set_source_rgba(color[0], color[1], color[2], bgAlpha * color[3]);
  mgraphics.move_to(LINE_MARGIN, LINE_MARGIN);
  mgraphics.line_to(TOTAL_LENGTH - LINE_MARGIN, LINE_MARGIN);
  mgraphics.stroke();
  mgraphics.close_path();
  
  mgraphics.set_source_rgba(color[0], color[1], color[2], fgAlpha * color[3]);
  mgraphics.move_to(offset + LINE_MARGIN, LINE_MARGIN);
  mgraphics.line_to(Math.round(offset + BAR_LENGTH - LINE_MARGIN), LINE_MARGIN);
  mgraphics.stroke();
  mgraphics.close_path();
}

onclick.local = 1;
function onclick(x, y, button) {
  clickPosition = -1;
  if (button != 1 || (y >= LINE_WIDTH)) {
    return;
  } else if (x < offset) {
    // click outside of the current range -> move with range
    offset = clip(offset - BAR_LENGTH, 0, TOTAL_LENGTH - BAR_LENGTH);
    outputOffset();
    changeAlpha(x, y);
  } else if (x > (offset + BAR_LENGTH) + LINE_MARGIN) {
    offset = clip(offset + BAR_LENGTH, 0, TOTAL_LENGTH - BAR_LENGTH);
    outputOffset();
    changeAlpha(x, y);
  } else {
    // beginning of drag
    oldOffset = offset;
    clickPosition = x; // TODO (MODE == ModeType.HORIZONTAL) ? x : y;
    changeAlpha(x, y);
  }
}

ondrag.local = 1;
function ondrag(x, y, button) {
  if (clickPosition == -1) return;
  offset = clip(oldOffset + x - clickPosition, 0, TOTAL_LENGTH - BAR_LENGTH);
  mgraphics.redraw();
  outputOffset();
}

onidle.local = 1;
function onidle(x, y) {
  changeAlpha(x, y);
}

onidleout.local = 1;
function onidleout(x, y, button) {
  clickPosition = -1;
  fgAlpha = 0.5;
  bgAlpha = 0;
  mgraphics.redraw();
}

outputOffset.local = 1;
function outputOffset() {
  outlet(0, - Math.round(offset / (TOTAL_LENGTH + LINE_MARGIN) * (TARGET_LENGTH + LINE_MARGIN + 1)));
}

clip.local = 1;
function clip(x, min, max) {
  return Math.max(Math.min(x, max), min);
}

changeAlpha.local = 1;
function changeAlpha(x, y) {
  if (y < LINE_WIDTH && x >= offset && x <= (offset + BAR_LENGTH + LINE_MARGIN)) {
    fgAlpha = 1.0;
  } else {
    fgAlpha = 0.50;
  }
  bgAlpha = (y < LINE_WIDTH) ? 0.25 : 0;
  mgraphics.redraw();
}
