function PayGapTimeSeries() {

  this.name = 'Pay gap';
  this.id = 'pay-gap-timeseries';
  this.title = 'Gender Pay Gap: Average difference between male and female pay.';
  this.xAxisLabel = 'year';
  this.yAxisLabel = '%';

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

    grid: true,

    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  this.preload = function() {
    let self = this;
    this.data = loadTable(
      './data/pay-gap/all-employees-hourly-pay-by-gender-1997-2017.csv', 'csv', 'header',
      // Callback function to set the value
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    // Font defaults.
    textSize(16);

    // Reposition the canvas
    c.position(250, 40);

    // Inititate and start the emiter 
    this.emit = new Emitter();
    this.emit.startEmitter();

    // Set min and max years: assumes data is sorted by date.
    this.startYear = this.data.getNum(0, 'year');
    this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');

    // Find min and max pay gap for mapping to canvas height.
    this.minPayGap = 0;
    this.maxPayGap = max(this.data.getColumn('pay_gap'));
  };

  // reset all animation related properites 
  this.destroy = function() {
    frameCount = 0;
    finalLine = false;
    delete this.emit;
  };

  let frameCount = 0;
  let finalLine = false;
  let finalYValues = [];

  this.draw = function() {
    // Draw the basics
    drawTitle(this.title,
      (this.layout.plotWidth() / 2) + this.layout.leftMargin,
      this.layout.topMargin - (this.layout.marginSize / 2));
    drawYAxisTickLabels(this.minPayGap,
                        this.maxPayGap,
                        this.layout,
                        this.mapPayGapToHeight.bind(this),
                        0);
    drawAxis(this.layout);
    drawAxisLabels(this.xAxisLabel,
                   this.yAxisLabel,
                   this.layout);

    let previous;
    let numYears = this.endYear - this.startYear;

    // Reset the array, else it will just grow without any end
    finalYValues = [];

    // Loop over all rows and draw a line from the previous value to
    // the current.
    for (let i = 0; i < this.data.getRowCount(); i++) {
      // Create an object to store data for the current year.
      let current = {
        // Convert strings to numbers.
        'year': this.data.getNum(i, 'year'),
        'payGap': this.data.getNum(i, 'pay_gap')
      };
      
      // add data to be used later
      finalYValues.push(current);

      if (previous != null) {
        this.drawLine(current, previous);

        // The number of x-axis labels to skip so that only
        // numXTickLabels are drawn.
        let xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

        // Draw the tick label marking the start of the previous year.
        if (i % xLabelSkip == 0) {
          drawXAxisTickLabel(previous.year, this.layout,
                             this.mapYearToWidth.bind(this));
        };
      };

      previous = current;
      frameCount+=1;
    };
    
    // Only draw the final line if the transition animation ended 
    if (finalLine) {
      this.emit.updatePrticles(this.drawFinalLine.bind(this)); 
    };
  };

  // This is responcible to draw the final animated line, in the particel system
  this.drawFinalLine = function() {
    beginShape();
    curveVertex(this.mapYearToWidth(finalYValues[0].year, 
                                    this.mapPayGapToHeight(finalYValues[0].payGap)));
    for (let i = 0; i < finalYValues.length; i++) {
      curveVertex(this.mapYearToWidth(finalYValues[i].year), 
                  this.mapPayGapToHeight(finalYValues[i].payGap));
    };
    curveVertex(this.mapYearToWidth(finalYValues[finalYValues.length-1].year), 
                this.mapPayGapToHeight(finalYValues[finalYValues.length-1].payGap));
    endShape();
  };

  this.drawLine = function(current, previous) {
    // Only draw the transition line if the framecount is small enough
    if (frameCount < 2400)
    {
      // scale the lines y-value, with respect to the center line, according to the frame count.
      let scale = ((0.5*(pow(0.5, frameCount/300) -1))/(0.5-1))

      let centerY = this.layout.topMargin+this.layout.bottomMargin/2
      let distanceCurrent = this.mapPayGapToHeight(current.payGap) - centerY
      let distancePrevious = this.mapPayGapToHeight(previous.payGap) - centerY

      strokeWeight(5);
      stroke(0);
      line(this.mapYearToWidth(previous.year), centerY + distancePrevious*scale,
        this.mapYearToWidth(current.year), centerY + distanceCurrent*scale);
    } else {
      finalLine = true;
    };
    strokeWeight(1);
  };

  // Importiant mapping functions
  this.mapYearToWidth = function(value) {
    return map(value,
               this.startYear,
               this.endYear,
               this.layout.leftMargin,   
               this.layout.rightMargin);
  };

  this.mapPayGapToHeight = function(value) {
      return map(value,
                this.minPayGap,
                this.maxPayGap,
                this.layout.bottomMargin,
                this.layout.topMargin);
  };
};
