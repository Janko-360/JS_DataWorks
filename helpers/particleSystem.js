function Particle(partSize, growFactor)
{
  this.partSize = partSize;
  this.growFactor = growFactor;

  this.drawParticle = function(drawFunc)
  {
    if (this.partSize >= 0) {
      stroke( map(this.partSize, 0, 50, 50, 250), map(this.partSize, 0, 50, 50, 250), map(this.partSize, 0, 50, 50, 250), map(this.partSize, 0, 25, 250, 0));
      strokeWeight(this.partSize);
      noFill();

      // Calling the function to draw the required shapes. 
      drawFunc();

      // Reseting the stroke to not influence the next item 
      strokeWeight(1);
    };
  };

  // Updating the particle properites 
  this.updatePrticle = function()
  {
    if (this.partSize > 50) {
      this.partSize = 0;
    } else {
      this.partSize += this.growFactor;
    };
  };
};

function Emitter()
{
  let growFactor = 1/4;

  // Initiate the linked list
  this.partList = new LinkedList();

  this.addParticle = function(partSize, growFactor)
  {
    var particlesCall = new Particle(partSize, growFactor);
    return particlesCall;
  };

  // Start with 5 particles in the negative to have a bit of delay at the start
  this.startEmitter = function()
  {
    //initiate a full emitter 
    for (let i = 0; i >= - 50; i -= 10) {
      this.partList.insertLast(this.addParticle(i, growFactor));
    };
  };

  this.updatePrticles = function(drawFunc)
  {
    let current = this.partList.head;

    while (current) {
      current.data.drawParticle(drawFunc);
      current.data.updatePrticle();

      current = current.next;
    };
  };
};