function AppleStocks() {
  this.name = 'Apple Stocks';
  this.id = 'apple-stocks';

  let marginSize = 30;
  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,
    plotWidth: () => this.rightMargin - this.leftMargin,
    plotHeight: () => this.bottomMargin - this.topMargin,
    grid: false,
    numYTickLabels: 8,
  };

  this.loaded = false;

  // preload the data from csv file 
  this.preload = function() {
    let self = this
    this.data = loadTable(
      './data/mine/AAPL.csv', 'csv', 'header', 
      table => self.loaded=true
    )
  };

  // Remove all dom elements
  this.destroy = function() {
    this.xSlider.remove();
    this.infoText.remove();
    this.timeSlider.remove();
  };

  this.setup = function() {
    // reposition the canvas
    c.position(250, 105);

    this.dayCount = this.data.getRowCount()

    // +/- 10 for a top and bottom margin in the data representation
    this.minVal = min(this.data.getColumn('Low')) -10;
    this.maxVal = max(this.data.getColumn('Open')) +10;

    //add descriptive text
    this.infoText = createP('Here are the Apple stock prices from the 24 October 2019 till the 23 October 2020, showng daly change. Seeing the price per share rising almost three fold')
    this.infoText.position(450, 20);
    this.infoText.size(550);

    this.timeSlider = createP("Time slider");
    this.timeSlider.position(300, 20);

    // The translation slider
    this.xSlider = createSlider(30, 2100, 30);
    this.xSlider.position(275, 60);
  };

  this.draw = function() {
    let translateX = map(this.xSlider.value(), 30, 2100, 30, -2100);
    let runningMonth = 10;

    // Translate only this part, the rest will stay in place
    push();
    translate(translateX, 0);
    for (let i = 0; i < this.dayCount; i++)
    {
      this.drawCandle(i, this.data.getRow(i))

      stroke(0)
      fill(0)
      let monthRaw = this.data.getRow(i).obj.Date.slice(3, 5)
      let monthFormated = parseInt(monthRaw);
  
      if (monthFormated== runningMonth) {
        textAlign(CENTER)
        noStroke();
        if (this.data.getRow(i).obj.Date.slice(8, 10) == 19) {
          text(monthRaw + '-2019', i * 12 + 50, this.layout.bottomMargin + 10);
        }
        else{
          text(monthRaw + '-2020', i * 12 + 50, this.layout.bottomMargin + 10);
        }

        runningMonth+=1
      };
      // reset the month counter
      if (runningMonth==13) {
        runningMonth=1;
      };
    };
    pop();

    // x-axis
    stroke(0);
    line(0, this.layout.bottomMargin, 2400, this.layout.bottomMargin);
    // y-axis
    stroke(150);
    line(this.layout.leftMargin,
        this.layout.topMargin,
        this.layout.leftMargin,
        this.layout.bottomMargin);
    drawAxisLabels("", "$", this.layout);
    drawYAxisTickLabels(this.minVal, this.maxVal, this.layout, this.mapPriceToHeight.bind(this), 1);
    drawTitle('Apple Inc. price per share', width/2,
         this.layout.topMargin - (this.layout.marginSize / 2));
  };

  this.mapPriceToHeight = function (value) {
    return map(value,
        this.minVal,
        this.maxVal,
        this.layout.bottomMargin, 
        this.layout.topMargin);
  };

  this.drawCandle = function(i, dataPoint) {
    // set all data points
    let openValMapped = map(dataPoint.obj.Open, this.minVal, this.maxVal, height, 0)
    let closeValMapped = map(dataPoint.obj.Close, this.minVal, this.maxVal,height, 0)

    let difRed = (openValMapped-closeValMapped)
    let difGreen = (closeValMapped-openValMapped)

    let highValMapped = map(dataPoint.obj.High, this.minVal, this.maxVal, height, 0)
    let lowValMapped = map(dataPoint.obj.Low, this.minVal, this.maxVal, height, 0)

    // wick
    stroke(0);
    strokeWeight(1);
    line(i * 12 + 50, highValMapped, i*12+50, lowValMapped)
    // candle
    noStroke();
    if (dataPoint.obj.Open >= dataPoint.obj.Close) {
      fill(255, 0, 0)
      rect(i * 12 + 50, openValMapped, -5, difRed)
      rect(i * 12 + 50, openValMapped, 5, difRed)
    }
    else {
      fill(0, 255, 0)
      rect(i * 12 + 50, closeValMapped, -5, difGreen)
      rect(i * 12 + 50, closeValMapped, 5, difGreen)
    };
  };
};