// window.onload=function () {
let rows = [];
const width = 63;
const height = 19;
const borderColor = "d4d4d4";
const selectColor = "217346";
let globalCanvas = null;
let globalCtx = null;
let styles = {};
const headerBorderColor = "#c0c0c0";
const headerBackground = "e6e6e6";
const selectedToolbarBackgroundColor = "#E8F9FF";
const offset = 3;
const headerHover = "9fd5b7";
let numberOfAddedColumn = 0;
let clickedMode = false;
let toolbarNode = { size: null };
let heightRange = 100;
let widthRange = 200;
let selectedFont = {
  size: 10,
  fontFamily: "Arial",
  color: "#393E46",
  bold: false,
  italic: false,
};
let sheetData = {};
let maxUsedCol = 0;
let maxUsedRow = 0;
let sheetStyle = {};
const selectedRow = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  row: 0,
  col: 0,
};
let canvasHight = 0;
let canvasWidth = 0;
let filledUntil = 1;
let refresh = false;
let columnHeadElement;
let numberOfRows = 150;
let inFillMode = false;
let headerNodes = [];
let rangeColumnMap = {};
let cellColumnMap = {};
let rangeRowMap = {};
let cellRowMap = {};
let changedSizedColumn = {};
let changedSizedRow = {};
let filledCellOfColumnMap = {};
let changeCanvasWidth = 0;
let changeCanvasHeight = 0;
let column = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
const config = {
  width: "100%",
  height: "100%",
  containerQuery: "#tableContainer",
};
function repaint() {
  if (changeCanvasWidth) {
    globalCanvas.width = globalCanvas.width + changeCanvasWidth;
    canvasWidth = globalCanvas.width;
  }
  if (changeCanvasHeight) {
    globalCanvas.height = globalCanvas.height + changeCanvasHeight;
    canvasHight = globalCanvas.height;
  }
  globalCtx.clearRect(0, 0, globalCanvas.width, globalCanvas.height);
  let startCell = 0;
  let rangeCounter = heightRange;
  rangeRowMap[rangeCounter] = [];
  let rowCoordinations = [];
  rowCoordinations.push({
    y: 0,
    height: -1,
  });
  for (let index = 1; index <= numberOfRows; index++) {
    let cellSize = changedSizedRow[index - 1];
    if (!cellSize) {
      cellSize = height;
    }
    const calcHeight = startCell + cellSize;
    rowCoordinations[index - 1].height = cellSize;
    rowCoordinations.push({
      y: calcHeight,
      height: -1,
    });
    rangeRowMap[rangeCounter].push(index - 1);
    if (calcHeight > rangeCounter) {
      rangeCounter += heightRange;
      rangeRowMap[rangeCounter] = [];
      rangeRowMap[rangeCounter].push(index - 1);
    } else if (calcHeight == rangeCounter && index !== numberOfRows) {
      rangeCounter += heightRange;
      rangeRowMap[rangeCounter] = [];
    }
    cellRowMap[index - 1] = {
      start: startCell,
      end: calcHeight,
    };
    globalCtx.beginPath();
    globalCtx.strokeStyle = "#" + borderColor;
    globalCtx.lineWidth = 1;
    globalCtx.lineCap = "round";
    globalCtx.moveTo(0, calcHeight);
    globalCtx.lineTo(canvasWidth, calcHeight);
    globalCtx.stroke();
    globalCtx.closePath();
    startCell = calcHeight;
  }
  rowCoordinations.pop();
  startCell = 0;
  rangeCounter = widthRange;
  rangeColumnMap[rangeCounter] = [];
  const currentFontStyle = Object.assign({}, selectedFont);
  for (let index = 1; index <= numberOfAddedColumn; index++) {
    let cellSize = changedSizedColumn[index - 1];
    let filledCells = filledCellOfColumnMap[index - 1];
    if (!cellSize) {
      cellSize = width;
    }
    if (filledCells) {
      filledCells.forEach((rowIndex) => {
        let rowCoordinate = rowCoordinations[rowIndex];
        let path1 = new Path2D();
        path1.rect(startCell, rowCoordinate.y, cellSize, rowCoordinate.height);
        globalCtx.save();
        globalCtx.beginPath();
        globalCtx.clip(path1);
        const resultStyle = sheetStyle[rowIndex + "-" + (index - 1)];
        if (resultStyle) {
          if (resultStyle.color) {
            globalCtx.fillStyle = resultStyle.color;
          } else {
            globalCtx.fillStyle = "#393E46";
          }
          selectedFont = Object.assign({}, resultStyle);
          setContextFont();
        } else {
          globalCtx.fillStyle = "#393E46";
        }
        globalCtx.textBaseline = "middle";
        globalCtx.fillText(
          sheetData[rowIndex + "-" + (index - 1)],
          startCell + offset,
          rowCoordinate.y + rowCoordinate.height / 2
        );
        globalCtx.closePath();
        globalCtx.restore();
      });
    }
    const calcWidth = startCell + cellSize;
    rangeColumnMap[rangeCounter].push(index - 1);
    if (calcWidth > rangeCounter) {
      rangeCounter += widthRange;
      rangeColumnMap[rangeCounter] = [];
      rangeColumnMap[rangeCounter].push(index - 1);
    } else if (calcWidth == rangeCounter && index !== numberOfAddedColumn) {
      rangeCounter += widthRange;
      rangeColumnMap[rangeCounter] = [];
    }
    cellColumnMap[index - 1] = {
      start: startCell,
      end: calcWidth,
    };
    globalCtx.beginPath();
    globalCtx.strokeStyle = "#" + borderColor;
    globalCtx.lineWidth = 1;
    globalCtx.lineCap = "round";
    globalCtx.moveTo(calcWidth, 0);
    globalCtx.lineTo(calcWidth, canvasHight);
    globalCtx.stroke();
    globalCtx.closePath();
    startCell = calcWidth;
  }
  selectedFont = Object.assign({}, currentFontStyle);
}
function setContextFont() {
  let font = "";
  if (selectedFont.italic) {
    font += "italic ";
  }
  if (selectedFont.bold) {
    font += "bold ";
  }
  font += selectedFont.size + "pt " + selectedFont.fontFamily;
  globalCtx.font = font;
}
function toolbars() {
  const size = document.querySelector("#size");
  const bold = document.querySelector("#bold");
  const italic = document.querySelector("#italic");
  const colorPicker = document.querySelector("#colorPicker");
  const colorPickerContainer = document.querySelector("#color");
  toolbarNode["size"] = size;
  toolbarNode["bold"] = bold;
  toolbarNode["italic"] = italic;
  toolbarNode["color"] = colorPicker;
  colorPicker.addEventListener("input", function () {
    colorPickerContainer.style.borderColor = colorPicker.value;
    selectedFont.color = colorPicker.value;
  });
  bold.addEventListener("click", function () {
    let bg = bold.style.backgroundColor;
    if (bg == "transparent") {
      bold.style.backgroundColor = selectedToolbarBackgroundColor;
      selectedFont.bold = true;
    } else {
      bold.style.backgroundColor = "transparent";
      selectedFont.bold = false;
    }
    setContextFont();
  });
  italic.addEventListener("click", function () {
    let bg = italic.style.backgroundColor;
    if (bg == "transparent") {
      italic.style.backgroundColor = selectedToolbarBackgroundColor;
      selectedFont.italic = true;
    } else {
      italic.style.backgroundColor = "transparent";
      selectedFont.italic = false;
    }
    setContextFont();
  });
  size.addEventListener("input", function (e) {
    const val = e.target.value;
    if (+val > 1) {
      selectedFont = {
        ...selectedFont,
        size: +val,
      };
    } else {
      size.value = "10";
      selectedFont = {
        ...selectedFont,
        size: 10,
      };
    }
    setContextFont();
  });
  setContextFont();
}
function createTableContainer(init) {
  let element;
  if (!init) {
    element = document.querySelector("body");
  } else {
    element = init;
  }
  let table = document.createElement("table");
  element.appendChild(table);
  return table;
}
function setElementDefault(element) {
  element.style.minWidth = width + "px";
  element.style.minHeight = height + "px";
  element.style.width = width + "px";
  element.style.height = height + "px";
  element.style.display = "flex";
  element.style.justifyContent = "center";
  element.style.alignItems = "center";
  element.style.boxShadow =
    "0 0 0 0.5px " +
    headerBorderColor +
    ",0px 1px 0px 0.5px " +
    headerBorderColor;
}
function addTableHeader(table, num) {
  column = generateColumnName(column, num);
  let header;
  if (columnHeadElement) {
    header = columnHeadElement;
  } else {
    header = document.createElement("div");
    header.style.position = "sticky";
    header.style.position = "relative";
    header.style.top = "0";
    header.style.left = "0";
    header.style.display = "flex";
    header.style.flexWrap = "nowrap";
    header.setAttribute("type", "header-container");
    table.appendChild(header);
    columnHeadElement = header;
    let thEmpty = document.createElement("div");
    setElementDefault(thEmpty);
    header.appendChild(thEmpty);
  }
  const columnLength = column.length;
  let selectedElement;
  let startResizing = false;
  let xOffset = 0;
  let defWidth = 0;
  let selectedIndex = 0;
  let baseSize = 0;
  for (let index = numberOfAddedColumn; index < columnLength; index++) {
    const element = column[index];
    let th = document.createElement("div");
    setElementDefault(th);
    let selectableContent = document.createElement("div");
    selectableContent.style.minWidth = "2px";
    selectableContent.style.width = "2px";
    selectableContent.style.minHeight = height + "px";
    selectableContent.style.height = height + "px";
    selectableContent.style.marginLeft = "-2px";
    selectableContent.classList.add("hover-able-col");
    th.innerText = element;
    th.style.userSelect = "none";
    header.appendChild(th);
    header.appendChild(selectableContent);
    selectableContent.addEventListener("mousedown", function (e) {
      xOffset = selectableContent.offsetLeft;
      selectedElement = th;
      defWidth = th.getBoundingClientRect().width;
      startResizing = true;
      selectedIndex = index;
      if (changedSizedColumn[selectedIndex]) {
        baseSize = changedSizedColumn[selectedIndex];
      } else {
        baseSize = width;
      }
    });
    headerNodes.push(th);
  }
  let differentSize = 0;
  header.addEventListener("mousemove", function (e) {
    if (selectedElement && startResizing) {
      let size = defWidth + (e.layerX - xOffset);
      differentSize = e.layerX - xOffset;
      if (size >= width) {
        selectedElement.style.width = size + "px";
        selectedElement.style.minWidth = size + "px";
        changedSizedColumn[selectedIndex] = size;
      } else {
        changedSizedColumn[selectedIndex] = width;
        selectedElement.style.width = width + "px";
        selectedElement.style.minWidth = width + "px";
      }
    }
  });
  ["mouseup", "mouseleave"].forEach((eventType) => {
    header.addEventListener(eventType, function (e) {
      if (startResizing) {
        changeCanvasWidth = changedSizedColumn[selectedIndex] - baseSize;
        changeCanvasHeight = 0;
        repaint();
        startResizing = false;
      }
    });
  });
  numberOfAddedColumn = column.length;
}
function fillRows() {
  if (inFillMode) {
    refresh = true;
    return;
  }
  refresh = false;
  inFillMode = true;
  const length = column.length;
  rows.forEach((row) => {
    for (let index = filledUntil; index < length; index++) {
      let td = document.createElement("td");
      row.appendChild(td);
    }
  });
  filledUntil = length;
  inFillMode = false;
  if (refresh) {
    fillRows();
  }
}
function addRowIdentifier(table, numberOfRow) {
  const rowsLength = rows.length;
  let container = document.createElement("div");
  container.style.position = "sticky";
  container.style.top = "0";
  container.style.left = "0";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.flexWrap = "nowrap";
  table.appendChild(container);
  let selectedElement;
  let startResizing = false;
  let yOffset = 0;
  let defHeight = 0;
  let selectedIndex = 0;
  let baseSize = 0;
  for (let index = rowsLength; index < numberOfRow; index++) {
    let rowElement = document.createElement("div");
    let selectableContent = document.createElement("div");
    selectableContent.style.width = "100%";
    selectableContent.style.height = "2px";
    selectableContent.style.marginTop = "-2px";
    selectableContent.classList.add("hover-able");
    setElementDefault(rowElement);
    rowElement.innerText = index + 1;
    rowElement.style.userSelect = "none";
    container.appendChild(rowElement);
    container.appendChild(selectableContent);
    selectableContent.addEventListener("mousedown", function (e) {
      yOffset = selectableContent.offsetTop;
      selectedElement = rowElement;
      defHeight = rowElement.getBoundingClientRect().height;
      startResizing = true;
      selectedIndex = index;
      if (changedSizedRow[selectedIndex]) {
        baseSize = changedSizedRow[selectedIndex];
      } else {
        baseSize = height;
      }
    });
    rows.push(rowElement);
  }
  container.addEventListener("mousemove", function (e) {
    if (selectedElement && startResizing) {
      const size = defHeight + (e.layerY - yOffset);
      if (size > height) {
        selectedElement.style.height = size + "px";
        changedSizedRow[selectedIndex] = size;
      } else {
        selectedElement.style.height = height + "px";
        changedSizedRow[selectedIndex] = height;
      }
    }
  });
  ["mouseup", "mouseleave"].forEach((eventType) => {
    container.addEventListener(eventType, function (e) {
      if (startResizing) {
        changeCanvasHeight = changedSizedRow[selectedIndex] - baseSize;
        changeCanvasWidth = 0;
        repaint();
      }
      startResizing = false;
    });
  });
}
function generateColumnName(
  cols,
  num,
  startLetter = "",
  result = [],
  nextIndex = -1
) {
  const length = cols.length;
  for (let index = 0; index < length; index++) {
    result.push(startLetter + cols[index]);
  }
  if (num < result.length) {
    return result;
  } else {
    return generateColumnName(
      cols,
      num,
      result[nextIndex + 1],
      result,
      nextIndex + 1
    );
  }
}
function generateKey(selectedFontItem) {
  if (!selectedFontItem) {
    return null;
  }
  let initFont = "";
  if (selectedFontItem.italic) {
    initFont += "italic ";
  }
  if (selectedFontItem.bold) {
    initFont += "bold ";
  }
  return (
    initFont +
    selectedFontItem.fontFamily +
    selectedFontItem.size +
    selectedFontItem.color
  );
}
function addStyle(selectedFontItem) {
  styles[generateKey(selectedFontItem)] = {
    fontFamily: selectedFontItem.fontFamily,
    size: selectedFontItem.size,
    bold: selectedFontItem.bold,
    italic: selectedFontItem.italic,
  };
}
function checkStyles() {
  let key = generateKey(selectedFont);
  if (!styles[key]) {
    styles[key] = selectedFont;
  }
}
function getColumnCellIndex(value) {
  return rangeColumnMap[Math.ceil(value / widthRange) * widthRange];
}
function getRowCellIndex(value) {
  return rangeRowMap[Math.ceil(value / heightRange) * heightRange];
}
function checkOverLap(value, score, type) {
  if (!Array.isArray(value)) {
    throw Error("value most be array");
  }
  if (value.length == 1) {
    return value[0];
  } else {
    let mapItems = type == "column" ? cellColumnMap : cellRowMap;
    for (let index = 0; index < value.length; index++) {
      const element = value[index];
      const cellActualValue = mapItems[element];
      if (cellActualValue.start <= score && cellActualValue.end >= score) {
        return {
          index: element,
          value: cellActualValue,
        };
      }
    }
  }
}
window.onload = function () {
  addStyle(selectedFont);
  let node = document.querySelector(config.containerQuery);
  let head = document.querySelector("head");
  if (head) {
    let style = document.createElement("style");
    head.appendChild(style);
    style.innerHTML = `.hover-able:hover{
    background-color:rgb(82 78 78);;
    cursor: row-resize;
    }
    .hover-able-col:hover{
    background-color:rgb(82 78 78);;
    cursor: col-resize;
    }
    `;
  }
  if (!node) {
    node = document.createElement("div");
    document.querySelector("body").appendChild(node);
  }
  node.style.display = "flex";
  node.style.flexDirection = "column";
  addTableHeader(node, 100);
  let rowContainer = document.createElement("div");
  rowContainer.style.display = "flex";
  rowContainer.style.width = "fit-content";
  rowContainer.style.height = "fit-content";
  rowContainer.style.position = "relative";
  rowContainer.style.borderTop = "1px solid " + headerBorderColor;
  let backgroundContainer = document.createElement("div");
  backgroundContainer.style.position = "absolute";
  backgroundContainer.style.left = width + "px";
  backgroundContainer.style.right = "0";
  backgroundContainer.style.top = "0";
  backgroundContainer.style.bottom = "0";
  let inputContainer = document.createElement("div");
  inputContainer.style.position = "relative";
  inputContainer.style.width = "100%";
  inputContainer.style.height = "100%";
  node.appendChild(rowContainer);
  rowContainer.appendChild(backgroundContainer);
  backgroundContainer.appendChild(inputContainer);
  function clearCell() {
    ctx.clearRect(
      selectedRow.x - offset / 2,
      selectedRow.y - offset / 2,
      selectedRow.width + offset,
      selectedRow.height + offset
    );
  }
  inputContainer.addEventListener("click", function (event) {
    if (!clickedMode) {
      clickedMode = true;
      inputContainer.innerText = "";
      selectCell(event);
      let input = document.createElement("input");
      input.style.position = "absolute";
      input.style.top = selectedRow.y + "px";
      input.style.left = selectedRow.x + "px";
      input.style.width = selectedRow.width + "px";
      input.style.height = selectedRow.height + "px";
      input.style.color = selectedFont.color;
      const selItem = {
        x: selectedRow.x,
        y: selectedRow.y,
        width: selectedRow.width,
        height: selectedRow.height,
      };
      input.style.background = "transparent";
      input.style.border = "none";
      input.style.outline = "none";
      let resultValue = sheetData[selectedRow.row + "-" + selectedRow.col];
      maxUsedCol = Math.max(selectedRow.col, maxUsedCol);
      maxUsedRow = Math.max(selectedRow.row, maxUsedRow);
      let resultStyle = sheetStyle[selectedRow.row + "-" + selectedRow.col];
      if (resultStyle && toolbarNode.size) {
        toolbarNode.size.value = resultStyle.size;
        selectedFont.size = resultStyle.size;
      }
      inputContainer.appendChild(input);
      if (typeof resultValue !== "undefined") {
        clearCell();
        selectCell(event);
        input.value = resultValue;
      }
      input.focus();
      input.addEventListener("input", function () {
        sheetData[selectedRow.row + "-" + selectedRow.col] = input.value;
        if (!filledCellOfColumnMap[selectedRow.col]) {
          filledCellOfColumnMap[selectedRow.col] = [];
        }
        if (
          filledCellOfColumnMap[selectedRow.col].indexOf(selectedRow.row) < 0
        ) {
          filledCellOfColumnMap[selectedRow.col].push(selectedRow.row);
        }
      });
      input.addEventListener("focus", function () {
        clearCell();
      });
      input.addEventListener("blur", function () {
        checkStyles();
        clearCell();
        let path1 = new Path2D();
        path1.rect(selItem.x, selItem.y, selItem.width, selItem.height);
        ctx.save();
        ctx.beginPath();
        ctx.clip(path1);
        ctx.fillStyle = selectedFont.color;
        ctx.textBaseline = "middle";
        ctx.fillText(
          input.value,
          selectedRow.x,
          selectedRow.y + selectedRow.height / 2
        );
        ctx.closePath();
        ctx.restore();
        input.remove();
        sheetStyle[selectedRow.row + "-" + selectedRow.col] = Object.assign(
          {},
          selectedFont
        );
        clickedMode = false;
      });
    }
  });
  addRowIdentifier(rowContainer, numberOfRows);
  let canvas = document.createElement("canvas");
  globalCanvas = canvas;
  canvasHight = numberOfRows * height;
  canvasWidth = numberOfAddedColumn * width;
  canvas.width = numberOfAddedColumn * width;
  canvas.height = canvasHight;
  rowContainer.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  ctx.scale(1, 1);
  globalCtx = ctx;
  function selectCell(event) {
    let xDetail = checkOverLap(
      getColumnCellIndex(event.offsetX),
      event.offsetX,
      "column"
    );
    const startX = xDetail.value.start;
    let yDetail = checkOverLap(
      getRowCellIndex(event.offsetY),
      event.offsetY,
      "row"
    );
    const startY = yDetail.value.start;
    let cellWidth = xDetail.value.end - xDetail.value.start;
    let cellHeight = yDetail.value.end - yDetail.value.start;
    if (selectedRow.width > 0) {
    }
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.rect(
      startX + offset,
      startY + offset,
      cellWidth - offset * 2,
      cellHeight - offset * 2
    );
    selectedRow.x = startX + offset;
    selectedRow.y = startY + offset;
    selectedRow.width = cellWidth - offset * 2;
    selectedRow.height = cellHeight - offset * 2;
    selectedRow.row = yDetail.index;
    selectedRow.col = xDetail.index;
    ctx.stroke();
    ctx.closePath();
  }
  canvas.addEventListener("click", function (event) {});
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvasWidth * width, canvasHight);
  let startCell = 0;
  let rangeCounter = heightRange;
  rangeRowMap[rangeCounter] = [];
  for (let index = 1; index <= numberOfRows; index++) {
    const calcHeight = startCell + height;
    rangeRowMap[rangeCounter].push(index - 1);
    if (calcHeight > rangeCounter) {
      rangeCounter += heightRange;
      rangeRowMap[rangeCounter] = [];
      rangeRowMap[rangeCounter].push(index - 1);
    } else if (calcHeight == rangeCounter && index !== numberOfRows) {
      rangeCounter += heightRange;
      rangeRowMap[rangeCounter] = [];
    }
    cellRowMap[index - 1] = {
      start: startCell,
      end: calcHeight,
    };
    ctx.beginPath();
    ctx.strokeStyle = "#" + borderColor;
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.moveTo(0, calcHeight);
    ctx.lineTo(canvasWidth, calcHeight);
    ctx.stroke();
    ctx.closePath();
    startCell = calcHeight;
  }
  startCell = 0;
  rangeCounter = widthRange;
  rangeColumnMap[rangeCounter] = [];
  for (let index = 1; index <= numberOfAddedColumn; index++) {
    const calcWidth = startCell + width;
    rangeColumnMap[rangeCounter].push(index - 1);
    if (calcWidth > rangeCounter) {
      rangeCounter += widthRange;
      rangeColumnMap[rangeCounter] = [];
      rangeColumnMap[rangeCounter].push(index - 1);
    } else if (calcWidth == rangeCounter && index !== numberOfAddedColumn) {
      rangeCounter += widthRange;
      rangeColumnMap[rangeCounter] = [];
    }
    cellColumnMap[index - 1] = {
      start: startCell,
      end: calcWidth,
    };
    ctx.beginPath();
    ctx.strokeStyle = "#" + borderColor;
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.moveTo(calcWidth, 0);
    ctx.lineTo(calcWidth, canvasHight);
    ctx.stroke();
    ctx.closePath();
    startCell = calcWidth;
  }
  toolbars();
  document.querySelector("#download").addEventListener("click", function (e) {
    const headerObj = [];
    for (let index = 0; index <= maxUsedCol; index++) {
      let option = {};
      if (changedSizedColumn[index]) {
        option = {
          size: Number((changedSizedColumn[index] / 4.5) * 0.75).toFixed(0) * 1,
        };
      } else {
        option = {
          size: Number((width / 4.5) * 0.75).toFixed(0) * 1,
        };
      }
      headerObj.push(
        Object.assign(
          {
            label: "col" + index,
            text: "col" + index,
          },
          option
        )
      );
    }
    let defSheet = [];
    for (let index = 0; index <= maxUsedRow; index++) {
      defSheet.push([]);
    }
    let sheets = Object.keys(sheetData).reduce((result, current) => {
      const curSplit = current.split("-");
      const rowIndex = curSplit[0] * 1;
      const colIndex = "col" + curSplit[1];
      if (!result[rowIndex]) {
        result[rowIndex] = {};
      }
      if (changedSizedRow[rowIndex]) {
        result[rowIndex].height =
          Number(changedSizedRow[rowIndex] * 0.75).toFixed(0) * 1;
      }
      result[rowIndex][colIndex] = sheetData[current];
      return result;
    }, defSheet);
    ExcelTable.generateExcel({
      styles,
      sheet: [
        {
          withoutHeader: true,
          styleCellCondition(data, fullData, rowIndex, colIndex, fromHeader) {
            const styl = generateKey(sheetStyle[rowIndex - 1 + "-" + colIndex]);
            if (styl) {
              return styl;
            }
            return "col0";
          },
          headers: headerObj,
          data: sheets,
        },
      ],
    });
  });
};

// }
