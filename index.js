const view = document.getElementById('view');
const commands = document.getElementById('commands');
const options = document.getElementById('options');

const NUM_SCIENTISTS = 11;

const scientists = [];

for (let i = 0; i < NUM_SCIENTISTS; i++) {
  const scientist = document.createElement('div');
  scientist.classList.add('scientist')
  view.appendChild(scientist);
  scientists.push(scientist);
}
