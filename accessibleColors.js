var initialColor = {
    h:274,
    s:49,
    v:63
}

var white = {
  h: 0,
  s: 0,
  v: 100,
}

var currentColor = initialColor;
var currentTextColor = white;
var accessibilityValue = 4.5;

function accessibleColors() {

  // canvas start
  var colorSpaceCanvas = document.querySelector('#colorSpace'),
      cSWidth = colorSpaceCanvas.width,
      cSHeight = colorSpaceCanvas.height,
      cSContext = colorSpaceCanvas.getContext('2d'),
      cSImage = cSContext.createImageData(cSWidth,cSHeight);

  // generate image data
  function gridImageData(hue) {
    // iterate over rows
    for (var row = 0, i=-1; row < cSHeight; ++row) {
      // interate for cells
      for (var column = 0; column < cSWidth; ++column) {
        var tempColor = {
          h: hue,
          s: column,
          v: cSHeight - row
        }
        var tempRGBColor = HSVtoRGB(normHSV(tempColor));
        cSImage.data[++i] = Math.round(tempRGBColor.r*255);
        cSImage.data[++i] = Math.round(tempRGBColor.g*255);
        cSImage.data[++i] = Math.round(tempRGBColor.b*255);
        cSImage.data[++i] = 255;
      }
    }
    cSContext.putImageData(cSImage,0,0);
  }

  // generate accessibility curve
  function getAccessibilityCurve(hue) {
    var accessibilityPath = "M";
    var firstCheck; // store the first point in each row (true or false)
    for (var column = 0; column <= 100; column++) {
      for (var row = 0; row <= 100; row++) {
        if (row == 0) {
          firstCheck = checkColorContrast(hue, column, row);
        }

        // check if the contrast has changed from false to true or true to false (boundary condition)
        if (checkColorContrast(hue, column, row) != firstCheck) {
          var scaledRow = (100 - row) * 2;
          var scaledColumn = column * 2;
          accessibilityPath = accessibilityPath + " " + scaledColumn + " " + scaledRow;
          break;
        }
      }
    }
    return accessibilityPath;
  }

  // canvas start
  var hueChannelCanvas = document.querySelector('#hueChannel'),
      hCWidth = hueChannelCanvas.width,
      hCHeight = hueChannelCanvas.height,
      hCContext = hueChannelCanvas.getContext('2d'),
      hCImage = hCContext.createImageData(hCWidth, hCHeight);

  // generate hue selector data
  function hueChannelData() {
    for (var column = 0, i=-1; column < 360; ++column) {
      var tempColor = {
        h: column,
        s: 100,
        v: 100
      }
      var tempRGBColor = HSVtoRGB(normHSV(tempColor));
      hCImage.data[++i] = Math.round(tempRGBColor.r*255);
      hCImage.data[++i] = Math.round(tempRGBColor.g*255);
      hCImage.data[++i] = Math.round(tempRGBColor.b*255);
      hCImage.data[++i] = 255;
    }
    hCContext.putImageData(hCImage,0,0);
  }


  var satBrightSpaceSVG = d3.select('#satBrightSpace');
  satBrightSpaceSVG.call(d3.drag()
    .on('start', dragstartedSatBrightSpace)
    .on('drag', draggedSatBrightSpace)
    .on('end', dragendedSatBrightSpace)
  );

  function dragstartedSatBrightSpace() {
    d3.select(this).raise().classed('active', true);
    d3.select('#currentColorCircle')
      .attr('cx', Math.floor(d3.event.x))
      .attr('cy', Math.floor(d3.event.y));

    currentColor.s = Math.floor(d3.event.x / 2.0)
    currentColor.v = Math.floor((200.0 - d3.event.y) / 2.0);
    update(currentColor, currentTextColor);
  }

  function draggedSatBrightSpace() {
    var colorCircleX, colorCircleY;

    if (d3.event.x > 200) {
      colorCircleX = 200;
    } else if (d3.event.x < 0) {
      colorCircleX = 0;
    } else {
      colorCircleX = Math.floor(d3.event.x);
    }

    if (d3.event.y > 200) {
      colorCircleY = 200;
    } else if (d3.event.y < 0) {
      colorCircleY = 0;
    } else {
      colorCircleY = Math.floor(d3.event.y);
    }
    d3.select('#currentColorCircle')
      .attr('cx', colorCircleX)
      .attr('cy', colorCircleY);

    currentColor.s = Math.floor(d3.event.x / 2.0)
    currentColor.v = Math.floor((200.0 - d3.event.y) / 2.0);
    update(currentColor, currentTextColor);
  }

  function dragendedSatBrightSpace() {
    d3.select(this).classed('active', false);
  }



  // create the accessibility path
  satBrightSpaceSVG.append('path')
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('id', 'accessibilityPath')
    .attr('d', getAccessibilityCurve(currentColor.h))
    .attr('stroke-width', '1')

  // create the saturation & brightness selector
  satBrightSpaceSVG.append('circle')
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('id', 'currentColorCircle')
    .attr('cx', currentColor.s*2)
    .attr('cy', 200 -(currentColor.v*2))
    .attr('r', 5)
    .attr('stroke-width', 2);

  // create the hue selector nub
  var hueNubSpaceSVG = d3.select('#hueNubSpace');
  hueNubSpaceSVG.append('rect')
    .attr('x', currentColor.h / 1.8)
    .attr('y', '0')
    .attr('width', '5')
    .attr('height', '10')
    .attr('id', 'hueSelectorNub')
    .attr('fill', 'white');

  // Initialize Static Items
  hueChannelData();

  // Initialize Items that Update
  update(initialColor, white)

  // Global Update
  function update(currentColor, currentTextColor) {
    updateExampleButton(currentColor, currentTextColor);
    updateContrastWarning(currentColor, currentTextColor);
    updateInputs(currentColor, currentTextColor);
    updateHues(currentColor.h);
    updateCurrentColorCircle(currentColor);
  }

  function updateExampleButton(currentColor, currentTextColor) {
    var normCurrentColorRGB = HSVtoRGB(normHSV(currentColor));

    var cCR = Math.round(normCurrentColorRGB.r*255);
    var cCG = Math.round(normCurrentColorRGB.g*255);
    var cCB = Math.round(normCurrentColorRGB.b*255);

    var normCurrentTextColorRGB = HSVtoRGB(normHSV(currentTextColor));
    var cTCR = Math.round(normCurrentTextColorRGB.r*255);
    var cTCG = Math.round(normCurrentTextColorRGB.g*255);
    var cTCB = Math.round(normCurrentTextColorRGB.b*255);

    var cCString = 'background-color: rgb(' + cCR + ',' + cCG + ',' + cCB +')';
    var cTCString = 'color: rgb(' + cTCR + ',' + cTCG + ',' + cTCB +')';

    d3.select('#myButton').attr('style', cCString + "; " + cTCString);
  }

  function updateContrastWarning(currentColor, currentTextColor) {
    var contrastVal = getColorContrastHSV(currentColor, currentTextColor);
    var floored = (contrastVal.toString().match(/^-?\d+(?:\.\d{0,1})?/)[0]*1).toFixed(1)
    d3.select('#contrastValue').text('Contrast: ' + floored + ':1');
    if (contrastVal >= accessibilityValue) {
      d3.select('#optionalWarning').attr('style', "display:none");
    } else {
      d3.select('#optionalWarning').attr('style', "display:inherit");
    }
  }

  function updateInputs(currentColor, currentTextColor) {
    d3.select('#hueInput').property('value', currentColor.h);
    d3.select('#satInput').property('value', currentColor.s);
    d3.select('#brightInput').property('value', currentColor.v);

    d3.select('#textHueInput').property('value', currentTextColor.h);
    d3.select('#textSatInput').property('value', currentTextColor.s);
    d3.select('#textBrightInput').property('value', currentTextColor.v);
  }

  function updateHues(hue) {
    d3.select('#hueSelectorNub').attr('x', hue / 1.8).attr('hue', hue);
    gridImageData(hue);
    d3.select('#accessibilityPath').attr('d', getAccessibilityCurve(hue));
  }

  function updateCurrentColorCircle(currentColor) {
    d3.select('#currentColorCircle')
      .attr('cx', currentColor.s*2)
      .attr('cy', 200 - (currentColor.v*2))
  }

  // Interaction handlers
  d3.select('#hueInput').on('input', function() {
    currentColor.h = this.value;
    update(currentColor, currentTextColor);
  });

  d3.select('#satInput').on('input', function() {
    currentColor.s = this.value;
    update(currentColor, currentTextColor);
  });

  d3.select('#brightInput').on('input', function() {
    currentColor.v = this.value;
    update(currentColor, currentTextColor);
  });

  d3.select('#textHueInput').on('input', function() {
    currentTextColor.h = this.value;
    update(currentColor, currentTextColor);
  });

  d3.select('#textSatInput').on('input', function() {
    currentTextColor.s = this.value;
    update(currentColor, currentTextColor);
  });

  d3.select('#textBrightInput').on('input', function() {
    currentTextColor.v = this.value;
    update(currentColor, currentTextColor);
  });

}

function checkColorContrast(hue, x, y) {
  var tempColor = {
    h: hue,
    s: x,
    v: y
  }
  var contrast = getColorContrastHSV(tempColor, currentTextColor);
  return (contrast >= accessibilityValue)
}
