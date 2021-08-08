const LEVER_POSITION_A = 'A';
const LEVER_POSITION_B = 'B';
const SIGNAL_A = '0';
const SIGNAL_B = '1';

window.onload = () => {
  const view = document.getElementById('view');
  const commands = document.getElementById('commands');
  const options = document.getElementById('options');

  const NUM_SCIENTISTS = 11;

  const scientists = [];
  const accountantIdx = pickRandomNumberInRange(NUM_SCIENTISTS);
  for (let i = 0; i < NUM_SCIENTISTS; i++) {
    const scientistElem = document.createElement('div');
    const scientist = i === accountantIdx ?
      new Accountant(scientistElem, NUM_SCIENTISTS) :
      new Scientist(scientistElem);
    
    view.appendChild(scientistElem);
    scientists.push(scientist);
  }

  // add the robot that will visit the scientists
  const robotElem = document.createElement('div');
  const robot = new Robot(robotElem, NUM_SCIENTISTS);
  view.appendChild(robotElem);

  while (!robot.terminated) {
    robot.visitDimension();
    const scientist = scientists[robot.dimension];
    scientist.handleVisit(robot);    
  }
};


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
    this.elem_ = element;
    this.numDimensions_ = numDimensions;
    this.dimension = null;
    this.leftLever = LEVER_POSITION_A;
    this.rightLever = LEVER_POSITION_B;
    this.terminated = false;
  }

  visitDimension() {
    this.dimension = pickRandomNumberInRange(this.numDimensions_);
    return this.dimension;
  }

  pullRightLever() {
    if (this.rightLever === LEVER_POSITION_A) {
      this.rightLever = LEVER_POSITION_B;
    } else {
      this.rightLever = LEVER_POSITION_A;
    }
  }

  pullLeftLever() {
    if (this.leftLever === LEVER_POSITION_A) {
      this.leftLever = LEVER_POSITION_B;
    } else {
      this.leftLever = LEVER_POSITION_A;
    }
  }

  pressButton() {
    this.terminated = true;
  }
}



class Scientist {
  constructor(element) {
    element.classList.add('scientist');
    this.elem_ = element;
    this.sentVisitedSignal_ = false;
  }

  handleVisit(robot) {
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

  handleVisit(robot) {
    const signal = leversToSignal(robot.leftLever, robot.rightLever);
    switch (signal) {
      case SIGNAL_A:
        robot.pullRightLever();
        break;
      
      case SIGNAL_B:
        this.numSignalsReceived_++;

        if (this.numSignalsReceived_ === this.numScientists_ - 1) {
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
