const LEVER_POSITION_A = 'A';
const LEVER_POSITION_B = 'B';
const SIGNAL_A = '0';
const SIGNAL_B = '1';

let NUM_SCIENTISTS = 11;
let TIMESTEP = 500;

window.onload = async () => {
  const commands = document.getElementById('commands');
  const options = document.getElementById('options');
  updateParameters();
  options.addEventListener('change', (e) => {
    updateParameters();
    resetRiddle();
    runRiddle();
  });
  commands.addEventListener('change', (e) => updateParameters());

  runRiddle();
};

function updateParameters() {
  NUM_SCIENTISTS = document.querySelector('[name="numScientists"]').valueAsNumber;
  TIMESTEP = document.querySelector('[name="timestep"]').valueAsNumber;
}

async function runRiddle() {
  const view = document.getElementById('view');
  const scientists = [];
  const accountantIdx = pickRandomNumberInRange(NUM_SCIENTISTS);
  for (let i = 0; i < NUM_SCIENTISTS; i++) {
    const scientistElem = document.createElement('div');
    const scientist = i === accountantIdx ?
      new Accountant(scientistElem, NUM_SCIENTISTS) :
      new Scientist(scientistElem);
    
    view.appendChild(scientist.element);
    scientists.push(scientist);
  }

  // add the robot that will visit the scientists
  const robotElem = document.createElement('div');
  const robot = new Robot(robotElem, NUM_SCIENTISTS);

  while (!robot.terminated) {
    robot.visitDimension();
    const scientist = scientists[robot.dimension];
    scientist.element.appendChild(robot.element);
    await wait(TIMESTEP);
    scientist.handleVisit(robot);
    await wait(TIMESTEP);
    scientist.element.removeChild(robot.element);
  }

  view.appendChild(robot.element);
  view.classList.add('terminated');
}

function resetRiddle() {
  const main = document.getElementById('main')
  const view = document.getElementById('view');
  main.removeChild(view);

  const newView = document.createElement('div');
  newView.id = 'view';
  main.appendChild(newView);
}

function wait (timeInMs = 200) {
  return new Promise(res => setTimeout(res, timeInMs));
}


function pickRandomNumberInRange(range) {
  return Math.floor(Math.random() * range);
}

function leversToSignal (leftLever, rightLever) {
  return leftLever === LEVER_POSITION_A ?
    SIGNAL_A : SIGNAL_B;
}

class Robot {
  constructor(element, numDimensions) {
    element.classList.add('robot');
    this.element = element;
    this.numDimensions_ = numDimensions;
    this.dimension = null;
    this.leftLever = LEVER_POSITION_A;
    this.rightLever = LEVER_POSITION_A;
    this.terminated = false;


    this.leftLeverElement = document.createElement('div');
    this.leftLeverElement.classList.add('lever', this.leftLever);
    this.leftLeverElement.innerText = this.leftLever;
    this.element.appendChild(this.leftLeverElement);
    this.rightLeverElement = document.createElement('div');
    this.rightLeverElement.classList.add('lever', this.rightLever);
    this.rightLeverElement.innerText = this.rightLever;
    this.element.appendChild(this.rightLeverElement);
  }

  visitDimension() {
    this.dimension = pickRandomNumberInRange(this.numDimensions_);
    return this.dimension;
  }

  pullRightLever() {
    this.rightLeverElement.classList.remove(this.rightLever)
    if (this.rightLever === LEVER_POSITION_A) {
      this.rightLever = LEVER_POSITION_B;
    } else {
      this.rightLever = LEVER_POSITION_A;
    }
    this.rightLeverElement.innerText = this.rightLever;
    this.rightLeverElement.classList.add(this.rightLever)
  }

  pullLeftLever() {
    this.leftLeverElement.classList.remove(this.leftLever)
    if (this.leftLever === LEVER_POSITION_A) {
      this.leftLever = LEVER_POSITION_B;
    } else {
      this.leftLever = LEVER_POSITION_A;
    }
    this.leftLeverElement.innerText = this.leftLever;
    this.leftLeverElement.classList.add(this.leftLever)
  }

  pressButton() {
    this.terminated = true;
    this.element.classList.add('terminated')
  }
}



class Scientist {
  constructor(element) {
    element.classList.add('scientist');
    this.element = element;
    this.sentVisitedSignal_ = false;
    this.visited_ = false;
  }

  isVisited() {
    return this.visited_;
  }

  setToVisited() {
    this.visited_ = true;
    this.element.classList.add('visited');
  }

  handleVisit(robot) {
    if (!this.isVisited()) {
      this.setToVisited();
    }

    const signal = leversToSignal(robot.leftLever, robot.rightLever);
    switch (signal) {
      case SIGNAL_A:
        if (!this.sentVisitedSignal_) {
          this.sentVisitedSignal_ = true;
          robot.pullRightLever();
        } else {
          robot.pullLeftLever();
        }
        break;
      
      case SIGNAL_B:
        robot.pullRightLever();
        break;

      default:
        console.warn('Received invalid signal:', signal);
        break;
    }
  }
}

class Accountant extends Scientist {
  constructor(element, numScientists) {
    super(element);
    element.classList.add('accountant');
    this.numScientists_ = numScientists;
    this.numSignalsReceived_ = 0;
  }

  checkEveryoneHasBeenVisited() {
    return this.numSignalsReceived_ === this.numScientists_;
  }

  handleVisit(robot) {
    // if the accountant has not been visited before, count one
    // signal received form themselves
    if (!this.isVisited()) {
      this.numSignalsReceived_++;
      this.setToVisited();
    }

    const signal = leversToSignal(robot.leftLever, robot.rightLever);
    switch (signal) {
      case SIGNAL_A:
        if (this.checkEveryoneHasBeenVisited()) {
          robot.pressButton();
        } else {
          robot.pullRightLever();
        }
        break;
      
      case SIGNAL_B:
        // if receiving signal B, then count it as a visit signal
        // and increase the visit count
        this.numSignalsReceived_++;

        if (this.checkEveryoneHasBeenVisited()) {
          robot.pressButton();
        } else {
          robot.pullLeftLever();
        }
        break;

      default:
        console.warn('Received invalid signal:', signal);
        break;
    }
  }
}
