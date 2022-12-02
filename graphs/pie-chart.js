function PieChart(x, y, diameter) {

  this.x = x;
  this.y = y;
  this.diameter = diameter;
  this.labelSpace = 30;

  // Initiate the particle system
  this.emit = new Emitter();
  this.emit.startEmitter();

  // Data the animation function will use to draw the arcs
  this.emitData = {hover: false, arcData: {}};

  this.get_radians = function(data) {
    let total = sum(data);
    let radians = [];

    for (let i = 0; i < data.length; i++) {
      radians.push((data[i] / total) * 360);
    }

    return radians;
  };

  this.draw = function(data, labels, colours, title) {
    if (data.length == 0) {
      alert('Data has length zero!');
    } else if (![labels, colours].every((array) => {
      return array.length == data.length;
    })) {
      alert(`Data (length: ${data.length})
            Labels (length: ${labels.length})
            Colours (length: ${colours.length})
            Arrays must be the same length!`);
    };

    // https://p5js.org/examples/form-pie-chart.html

    let angles = this.get_radians(data);
    let lastAngle = 0;
    let colour;
    var scale = scale;

    // initiale hover to false before every check
    this.emitData.hover = false;

    for (let i = 0; i < data.length; i++) {
      if (colours) {
        colour = colours[i];
      } 
      else {
        colour = map(i, 0, data.length, 0, 255);
      };

      // get the angle from the start of the pie chart to the mouse position
      let mouseAngle = atan2(mouseY - this.y, mouseX - this.x)

      // when the mouse is in the angle range of 0 to -180 map it to 180 to 360
      if (mouseAngle < 0 && mouseAngle > -180)
      {
        mouseAngle = map(mouseAngle, -0.001, -179.999, 360, 180);
      };

      // when the mouse is in a sector, engage hover actions 
      if((mouseAngle > lastAngle && mouseAngle < (lastAngle + angles[i])) &&
        dist(mouseX, mouseY, this.x, this.y) <= this.diameter/2) {
        let scale = 1.3

        // set the hover data to be used later
        this.emitData.hover = true, 
        this.emitData.arcData = {fillCol: colour, 
                              arcX: this.x, 
                              arcY: this.y, 
                              arcDiam: this.diameter * scale, 
                              arcStartAngl: lastAngle,
                              arcEndAngl: lastAngle + angles[i]};

        // base arc
        fill(colour);
        noStroke();
        arc(this.x, this.y,
            this.diameter * scale, this.diameter * scale,
            lastAngle, lastAngle + angles[i]); 
        // Overlay arc
        fill(230);
        noStroke();
        arc(this.x, this.y,
          (this.diameter - 50)*scale, (this.diameter - 50)*scale,
          lastAngle-1, lastAngle + angles[i]+0.5);

        // Hover text
        fill(0)
        textSize(24);
        if ((lastAngle) < 270) {
          let constant = 70
          textAlign('right');
          text(labels[i].toUpperCase() + ': '+ data[i].toFixed(2)+ '%' , 
              map(cos(lastAngle+angles[i]/2), -1, 1, this.x-this.diameter/2-constant, 
              this.x+this.diameter/2+constant),
              map(sin(lastAngle + angles[i]/2), -1, 1, this.y-this.diameter/2-constant, 
              this.y+this.diameter/2+constant));
        } else {
          let constant = 130
          textAlign('center');
          text(labels[i].toUpperCase() + ': '+ data[i].toFixed(2)+ '%' , 
              map(cos(lastAngle+angles[i]/2), -1, 1, this.x-this.diameter/2-constant, 
              this.x+this.diameter/2+constant),
              map(sin(lastAngle + angles[i]/2), -1, 1, this.y-this.diameter/2-constant, 
              this.y+this.diameter/2+constant));
        };
      } else {
        let scale = 1

        // Don't draw anthing if teh category is empty
        if (angles[i] != 0)
        {
          fill(colour);
          noStroke();
          arc(this.x, this.y,
              this.diameter * scale, this.diameter * scale,
              lastAngle, lastAngle + angles[i]); 
          // Overlay arc
          fill(230);
          noStroke();
          arc(this.x, this.y,
            (this.diameter - 50)*scale, (this.diameter - 50)*scale,
            lastAngle-1, lastAngle + angles[i] );
        };
        fill(230);
        ellipse(this.x, this.y, 50);
      };

      if (labels) {
        this.makeLegendItem(labels[i], i, colour);
      };

      lastAngle += angles[i];
    };

    drawTitle(title, this.x, this.y - this.diameter * 0.8);

    // Call the hover animation only if it is active
    if (this.emitData.hover) {
      this.emit.updatePrticles(this.arcRender.bind(this))
    };
  };

  this.makeLegendItem = function(label, i, colour) {
    let x = this.x + (this.labelSpace * i)*2 - this.diameter / 3 - 100;
    let y = this.y + 90 + this.diameter / 2; 
    let boxWidth = this.labelSpace / 2;
    let boxHeight = this.labelSpace / 2;

    fill(colour);
    rect(x + 40, y, boxWidth, boxHeight);

    fill('black');
    noStroke();
    textAlign('left', 'center');
    textSize(12);
    text(label, x + boxWidth + 50, y + boxWidth / 2);
  };


  // The function that will draw the arc for every particle
  this.arcRender = function() {
    let data = this.emitData.arcData;

    arc(data.arcX, data.arcY, data.arcDiam, data.arcDiam, data.arcStartAngl, data.arcEndAngl);
    arc(data.arcX, data.arcY, data.arcDiam-65, data.arcDiam-65, data.arcStartAngl, data.arcEndAngl);
  };
};
