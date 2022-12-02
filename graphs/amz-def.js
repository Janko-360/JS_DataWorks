function AmzDef() {

  this.name = 'Amazon Deforestation';
  this.id = 'amazon-deforestation';

  let marginSize = 35;

  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
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

  this.provinceColour = ['red', 'green', 'pink', 'blue', 'purple', 'yellow', 'grey', 'orange', 'lightgreen'];

  this.preload = function() {
    let self = this;
    this.data = loadTable(
      './data/mine/def_area_2004_2019.csv', 'csv', 'header',
      table => self.loaded=true
      );
  };

  this.setup = function() {
    // Font defaults.
    textSize(16);
    textAlign('center', 'center');

    //repositioning of the canvas 
    c.position(250, 95);

    this.animating = false;
    this.yearIndex = 0; 
    this.animatingProgress = 0;

    this.oldMax = null; 
    this.oldDataVal
    this.oldBoxWidth = null;

    this.min = 30000;
    this.max = 0;

    // adding descriptive text
    this.infoText1 = createP('The bar graph displays the deforestation area per year in the Amazon rain forest. Focusing on the change year on year and not on the change over all years.')
    this.infoText1.position(260, 10);
    this.infoText1.size(700);
    this.infoText2 = createP('The provinces are: ')
    this.infoText2.position(260, 45);
    this.infoText2.size(700);
    // State Names form https://brazil-help.com/brazilian_states.htm, Accessed: 02-02-2022
    this.infoText3 = createP('AC: Acre, AM: Amazonas, AP: Amapa, MA: Maranhao, MT: MatoGrosso, PA: Para, RO: Rondonia, RR: Roraima and TO: Tocantins')
    this.infoText3.position(260, 65);
  };

  this.destroy = function() {
    // year counter reset 
    this.yearIndex = 0;   

    // removing the descriptive text
    this.infoText1.remove();
    this.infoText2.remove();
    this.infoText3.remove();
  };

  this.draw = function() {
    // Manual itteration that is timed to step foward only every one and a half seconds 
    if (frameCount%120 == 0 && this.animating==false) { 
      if (this.yearIndex<15) {
        this.yearIndex ++;
        this.animating = true;
      } else {
        this.yearIndex=15;
      };
    } else if (frameCount%120 == 0 && this.animating) { 
      this.animating = false;
      this.animatingProgress = 0;
    } else {}; // The empty else is needed to do nothing as the third condidtion 

    // Call the actual draw function from one of the two animating states
    if(this.animating) {
      this.animatingProgress++;
      this.drawAll(this.yearIndex, this.animatingProgress);
    } else {
      this.drawAll(this.yearIndex, this.animatingProgress);
    };

    // draw the layout basics 
    drawAxis(this.layout, colour=0);
    drawAxisLabels('Area (km²)', '', this.layout);
  };

  this.drawAll = function(i, animateProg) {
      let currentYear = this.data.getRow(i);
      let currentValues = [];

      //reset the min and max values for every year 
      this.min = 30000;
      this.max = 0;
      this.oldMax = 0;
  
      // custom min and max search functions since p5 or js can't find the value over several inputs
      // Province by province loop for max and min 
      for (let j = 1; j < currentYear.arr.length-1; j++) {
        this.getData(j, currentYear, i);

        //fill the list of all province values 
        currentValues.push(Number(currentYear.arr[j]));
      };

      //sort the list so the bars can be drawn in decending order
      //sorting function from https://www.w3schools.com/js/js_array_sort.asp 01-02-2022
      // I modefied it to a arrow function 
      currentValues.sort((a, b)=> b-a);

      drawTitle('Deforestation for year: '+currentYear.arr[0], width/2, this.layout.topMargin - 10);

      // Draw the Y-AXIS with provinces and BAR GRAPH rectangle 
      let spacing = (this.layout.bottomMargin + marginSize - this.layout.topMargin)/10

      //iteration of all provinces for every year 
      // first i got all data then loop again to draw, can't get data and draw in one go 
      for (let j = 1; j <= 9; j++) {
        for (let k = 0; k < currentValues.length; k++) {
          // draw the bars in decending order, coordinated by the sorted list: currentValues
          if(currentValues[k] == currentYear.arr[j]) {
            //Map data to graph area 
            let boxWidth = map(currentYear.arr[j], 0, this.max, 0, width - 105);

            // Y-axis label
            this.drawYLabels(j, k, spacing);

            //Bars and bar labels
            this.drawBars(j, k, spacing, boxWidth, currentYear, animateProg);
          };
        };
      };

      // X-AXIS labels with updated def area values.        
      // update every x axis label per year 
      let xDataSpacing = Number(this.max)/9;
      let xLableSpacing = (width)/10;

      for (let j = 0; j < 10; j++) {
        let value = xDataSpacing*(j)

        fill(0);
        text(value.toFixed(0), 
            this.layout.leftMargin + xLableSpacing*j,
            this.layout.bottomMargin+10);
      };
  };

  this.getData = function(j, currentYear, i) {
    // min
    if (Number(currentYear.arr[j]) < this.min) { 
      this.min = currentYear.arr[j]
    }
    //max
    if (Number(currentYear.arr[j]) > this.max) {
      this.max = currentYear.arr[j]
    }

    // find the max of the previous year, 
    // can't just save the current year data to a previous varabale since I often iterate with out changing any data.  
    if (this.animating) {
      let prevYear = this.data.getRow(i-1)
      //max
      if (Number(prevYear.arr[j]) > this.oldMax) {
        this.oldMax = prevYear.arr[j]
      };
    };
  };

  this.drawYLabels = function(j, k, spacing) {
    fill(this.provinceColour[j-1])
    noStroke();
    textAlign('center', 'center');
    text(this.data.columns[j],
        this.layout.leftMargin - 25, 
        this.layout.topMargin + spacing*(k+0.5));
    ellipse(this.layout.leftMargin-1, this.layout.topMargin + spacing*(k+0.5), 5);
  };

  this.drawBars = function(j, k, spacing, boxWidth, currentYear, animateProg) {
    // year to year animation 
    if (this.animating) {
      let prevVal = this.data.getRow(k).arr[j];  //data value
      let prevMapped = map(prevVal, 0, this.oldMax, 0, width - 105); //drawable value
      let difVal = boxWidth - prevMapped;

      fill(this.provinceColour[j-1]);
      rect(this.layout.leftMargin,  
        this.layout.topMargin + spacing*(k+0.5) - spacing/4,
        prevMapped + (difVal*(animateProg/120)),
        spacing*0.5, 
        2);
    } 
    // normal bar with label 
    else{
      fill(this.provinceColour[j-1]);
      rect(this.layout.leftMargin, 
        this.layout.topMargin + spacing*(k+0.5) - spacing/4,
        boxWidth, 
        spacing*0.5, 
        2);

      //Bar data label
      fill(0);
      if ((boxWidth+35) < 120) {
        text(currentYear.arr[j],
          this.layout.leftMargin + boxWidth + 20, 
          this.layout.topMargin + spacing*(k+0.5));
      } else {
        text(currentYear.arr[j],
          boxWidth + 35, 
          this.layout.topMargin + spacing*(k+0.5));
      };              
    };
  };
};