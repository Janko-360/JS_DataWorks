function TechDiversityRace() {

  this.name = 'Race Diversity';
  this.id = 'tech-diversity-race';

  // Property to represent whether data has been loaded.
  this.loaded = false;

  this.preload = function() {
    let self = this;
    this.data = loadTable(
      './data/tech-diversity/race-2018.csv', 'csv', 'header',
      // Callback function to set the value
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    //Reposition the canvas
    c.position(250, 95);

    if (!this.loaded) {
        console.log('Data not yet loaded');
        return;
      }

    // Create a select DOM element.
    this.select = createSelect();
  
    // Set selecter position.
    for (let i = 1; i < this.data.getColumnCount(); i++) {
      this.select.option(this.data.columns[i]);
    }
    this.select.position(275, 65);

    // Add a descriptive label
    this.selectLable = createP('Select a company');
    this.selectLable.position(275, 20);

    // Add descriptive text
    this.infoText = createP('This graph shows the percentage of each race at the selected company. Hover over a sector to see the exact percentages.')
    this.infoText.position(450, 20);
    this.infoText.size(550);
  }

  this.destroy = function() {
    //remove all DOM elements
    this.select.remove();
    this.selectLable.remove();
    this.infoText.remove();
  };

  // Create a new pie chart object.
  this.pie = new PieChart(width / 2, height / 2, width * 0.3);

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Get and set all data
    let companyName = this.select.selected();
    let col = this.data.getColumn(companyName);
    col = stringsToNumbers(col);
    let labels = this.data.getColumn(0);

    let colours = ['blue', 'red', 'green', 'pink', 'purple', 'yellow'];

    let title = 'Employee diversity at ' + companyName;

    // Draw the pie chart!
    this.pie.draw(col, labels, colours, title);
  }
}


