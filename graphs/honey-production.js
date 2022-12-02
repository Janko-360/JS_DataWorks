function HoneyProd() {

  this.name = 'Honey Production';
  this.id = 'honey-prod';

  var marginSize = 35;
  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2.5,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,
    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },
    grid: false,
    numXTickLabels: 8,
    numYTickLabels: 9,
  };

  this.loaded = false;
  
  this.preload = function() {
    this.data = loadJSON('./data/mine/honeyInfo.json');
  };

  this.setup = function() {
    // Font defaults.
    textSize(16);
    textAlign('center', 'center');

    // Start the amination emitter 
    this.emit = new Emitter();
    this.emit.startEmitter();

    // reposition the canvas
    c.position(250, 100);

    // Add descriptive text and time slider
    this.infoText = createP('Displayed is the five number summary as cat and whisker diagram. The data represents the yield per colony in pounds for all American states. In the background is the average over all the years.')
    this.infoText.position(450, 15);
    this.infoText.size(550);
    this.infoText1 = createP('Time slider')
    this.infoText1.position(300, 20);
    this.infoText1.size(700);

    this.xSlider = createSlider(0, 700, 0);
    this.xSlider.position(275, 65);
  };

  this.destroy = function() { 
      // Remove the discriptive text and the emitter to clear up space
      this.infoText.remove();
      this.infoText1.remove();
      this.xSlider.remove();

      delete this.emit;
  };

  this.draw = function() {
    let translateX = map(this.xSlider.value(), 700, 0, -700, 0) 
    let transMouseX = mouseX - translateX

    // Reset hover data to not grow infinitley
    let hoverData = [];

    push();
    translate(translateX, 0);
    // Update the amimated average line 
    this.emit.updatePrticles(this.drawAvgLine.bind(this));
    // Itterate for all years
    for (let i = 1989; i <= 2019; i++) {
      drawXAxisTickLabel(i, this.layout, this.mapYearToWidth.bind(this))

      let currentYear = this.data[i]

      let mappedMin = this.mapValueToHeight(currentYear.fiveNumSum.min.value) 
      let mappedQ1 = this.mapValueToHeight(currentYear.fiveNumSum.q1.value)
      let mappedQ2 = this.mapValueToHeight(currentYear.fiveNumSum.q2.value)
      let mappedQ3 = this.mapValueToHeight(currentYear.fiveNumSum.q3.value)
      let mappedMax = this.mapValueToHeight(currentYear.fiveNumSum.max.value)
      let mappedYear = this.mapYearToWidth(i)

      let singleIndex = i%1989 
      let offset = 15
      
      //Draw the individual boxes and wishkers 
      stroke(0);
      strokeWeight(1)
      line(mappedYear, mappedMin,
          mappedYear, mappedMax);
      strokeWeight(5); 
      point(mappedYear, mappedMin);
      point(mappedYear, mappedMax);
      strokeWeight(1);
      noStroke();
      fill(0, map(singleIndex,0,31, 50, 200), 0)
      rect(mappedYear - offset, 
          mappedQ3, 
          offset*2, 
          mappedQ1-mappedQ3, 2);
      stroke(map(singleIndex,0,31, 200, 50))
      strokeWeight(1);
      line(mappedYear - offset, mappedQ2,
          mappedYear + offset, mappedQ2);

      // Hover detection and savig of info
      if (dist(transMouseX, mouseY, mappedYear, mappedMax) < 15) {
        hoverData = [i, 'max', mappedYear, mappedMax, translateX]
      } else if (dist(transMouseX, mouseY, mappedYear-offset, mappedQ3) < 15 || 
              dist(transMouseX, mouseY, mappedYear+offset, mappedQ3) < 15) {
        hoverData = [i, 'q3', mappedYear, mappedQ3, translateX];
      } else if (dist(transMouseX, mouseY, mappedYear-offset, mappedQ2) < 15 || 
              dist(transMouseX, mouseY, mappedYear+offset, mappedQ2) < 15) {
        hoverData = [i, 'q2', mappedYear, mappedQ2, translateX]
      } else if (dist(transMouseX, mouseY, mappedYear-offset, mappedQ1) < 15 || 
              dist(transMouseX, mouseY, mappedYear+offset, mappedQ1) < 15) {
        hoverData = [i, 'q1', mappedYear, mappedQ1, translateX]
      } else if (dist(transMouseX, mouseY, mappedYear, mappedMin) < 15) {
        hoverData = [i, 'min', mappedYear, mappedMin, translateX]
      } else {}; // Do nothing 
    };
    line(this.layout.leftMargin, this.layout.bottomMargin, width+665, this.layout.bottomMargin)
    pop();


    // only call the hover text function if we have hover data
    if(hoverData.length != 0) {
      this.hoverInfoBox(hoverData)
    }

    //draw basics
    drawAxis(this.layout, colour=0);
    drawAxisLabels('Year', 'Yield \n (pounds)', this.layout)
    drawYAxisTickLabels(0, 190, this.layout, this.mapValueToHeight.bind(this), 0) 
    drawTitle('Yield per year for all states',
         (this.layout.plotWidth() / 2) + this.layout.leftMargin,
         this.layout.topMargin - (this.layout.marginSize / 2));
  };

  // This is called only when we have hover data 
  this.hoverInfoBox = function(hoverData) {
    let i = hoverData[0];
    let valueType = hoverData[1]; 
    let x = hoverData[2];
    let y = hoverData[3];
    let translateX = hoverData[4];

    let offsetX = 40;
    let offsetY = 60;     

    textAlign('left', 'center')
    if(this.data[i].fiveNumSum[valueType].name != undefined) {
      fill(50, 150, 250, 150);
      stroke(0);
      rect(x-offsetX+translateX, y-offsetY-5, offsetX*2, offsetY, 5);

      noStroke();
      fill(0);
      textAlign('center')
      text(valueType.toUpperCase(), x+translateX, y-offsetY+5)
      textSize(14)
      text('State: ' + String(this.data[i].fiveNumSum[valueType].name) ,x+translateX, y-offsetY+25);
      text('Value: ' + String(this.data[i].fiveNumSum[valueType].value),x+translateX, y-offsetY+40);
      textSize(16)
    } else {
      offsetY = 75
      fill(50, 150, 250, 150);
      stroke(0);
      rect(x-offsetX+translateX, y-offsetY-5, offsetX*2, offsetY, 5);

      noStroke();
      fill(0);
      textAlign('center')
      text(valueType.toUpperCase(), x+translateX, y-offsetY+5)
      textSize(14)
      text('State 1: ' + String(this.data[i].fiveNumSum[valueType].stateHigh), x+translateX, y-offsetY+25);
      text('State 2: ' + String(this.data[i].fiveNumSum[valueType].stateLow), x+translateX, y-offsetY+40);
      text('Value: ' + String(this.data[i].fiveNumSum[valueType].value), x+translateX, y-offsetY+55);
      textSize(16)
    };
  };

  // The function that wil be called from drawParticle
  this.drawAvgLine = function() { 
    beginShape();
    curveVertex(this.mapYearToWidth(1989, this.mapValueToHeight(this.data[1989].avrge)));
    for (let i = 1989; i <= 2019; i++) {
      let currentYear = this.data[i]

      let mappedAvg = this.mapValueToHeight(currentYear.fiveNumSum.avrge);
      let mappedYear = this.mapYearToWidth(i);
      curveVertex(mappedYear, mappedAvg);
    }
    curveVertex(this.mapYearToWidth(2019), 
                this.mapValueToHeight(this.data[2019].fiveNumSum.avrge));
    endShape();
  }

  this.mapYearToWidth = function(value) {
    return map(value,
               1989,
               2019,
               this.layout.leftMargin + 30,  
               this.layout.leftMargin + 30 + 1550);
  };

  this.mapValueToHeight = function(value) {
      return map(value,
                0,
                190,
                this.layout.bottomMargin, 
                this.layout.topMargin);
  };
};