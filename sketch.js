
// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;
var c

function setup() {
  // Create a canvas to fill the content div from index.html.
  c = createCanvas(1024, 576);
  c.parent('app');
  c.position(250, 40);

  frameRate(60);

  angleMode(DEGREES);

  // Create a new gallery object.
  gallery = new Gallery();

  // Add the visualisation objects here.
  gallery.addVisual(new TechDiversityRace());
  gallery.addVisual(new PayGapTimeSeries());
  gallery.addVisual(new AppleStocks());
  gallery.addVisual(new AmzDef());
  gallery.addVisual(new HoneyProd());
}

function draw() {
  background(230);

  if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
  } else {
    // add intro text
    textAlign('center', 'center')
    textSize(30);
    fill(0, 190, 0)
    text('Welcome to DATA WORKS', width/2, height/2);
    textSize(16);
    text('To start, select a data set', width/2 , height/2 + 30)
  };
}