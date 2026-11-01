'use strict';

// User-supplied scene and evidence images. Keep file paths relative for offline use.
const images = {
  office: 'detective-office.png',
  house: 'briar-lane-house.png',
  hospital: 'briar-hospital.png',
  detective: 'jonah-confession-file.png',
  camera: 'camera-and-negative.png',
  letter: 'evelyn-unsent-letter.png',
  confession: 'jonah-confession-file.png',
  evelynPortrait: 'evelyn-portrait.png',
  patientPortrait: 'patient-17-portrait.png',
  jonahPortrait: 'jonah-vale-portrait.png'
};

const cases = [
  {
    id: 'evelyn', number: '001', name: 'Evelyn Hart', role: 'The missing photographer', image: 'house', portrait: 'evelynPortrait', scene: 'house', evidence: 'letter', gallery: ['camera', 'letter'],
    summary: 'A photographer vanishes after visiting an abandoned house.',
    story: 'On 17 October 1986, Evelyn visited 17 Briar Lane to photograph an old house. Detective Jonah Vale had sent her there. Her camera was recovered, but Evelyn never returned.',
    clueTitle: 'The unsent letter',
    clue: '17 October 1986\n\nJonah,\nThe house is not empty. I found a photograph of myself inside. You told me this happened on the same day ten years ago.\n\nIf the room changes, remember your name.\nEvelyn',
    observation: 'The important date is 17 October: month 10, day 17.'
  },
  {
    id: 'patient', number: '017', name: 'Patient 17', role: 'The unidentified witness', image: 'hospital', portrait: 'patientPortrait', scene: 'hospital', evidence: 'hospital', gallery: [],
    summary: 'An unnamed patient leaves a strange written statement.',
    story: 'Patient 17 arrived at Briar Hospital on the day Evelyn disappeared. He carried a picture of the house and repeatedly drew its east window. The hospital record gives an unexpected address.',
    clueTitle: 'The written statement',
    clue: 'BRIAR HOSPITAL ANNEX\nAddress: 17 Briar Lane\nAdmitted: 17 October 1986\n\n“I saw Vale take the photograph. This ward is the room in the house. The building changes, but the window stays.”',
    observation: 'The hospital and the house share the same address.'
  },
  {
    id: 'jonah', number: '003', name: 'Jonah Vale', role: 'The last detective', image: 'detective', portrait: 'jonahPortrait', scene: 'office', evidence: 'confession', gallery: ['confession'],
    summary: 'The detective leaves a confession in his abandoned office.',
    story: 'Ten years later, Jonah worked from an office at 17 Briar Lane. He reopened the records, then disappeared. A single page remained on his desk.',
    clueTitle: 'The final confession',
    clue: '17 October 1996\nVALE INVESTIGATIONS / 17 BRIAR LANE\n\nI sent Evelyn to the house. After she disappeared, I hid her photograph and the patient’s statement.\n\nThe event began before me. It returns every ten years. The house, hospital and office are the same place.\n\nIf someone opens this file, I have failed.\nJonah Vale',
    observation: 'Vale concealed one recurring event. He did not create the archive.'
  }
];

const storageKey = 'black-file-easy-v1';
const imageLabels = { office: 'Vale’s abandoned office', house: '17 Briar Lane', hospital: 'Briar Hospital annex', camera: 'Evelyn’s camera and last negative', letter: 'The unsent letter', confession: 'Jonah’s confession file', detective: 'Jonah’s confession file' };

function galleryItem(image) {
  return `<button class="gallery-item" data-image="${image}"><img src="${images[image]}" alt="${imageLabels[image]}"><span>${imageLabels[image]} <b>＋</b></span></button>`;
}
const initialState = () => ({ collected: [], connected: false, unlocked: false, ending: null, alias: 'Investigator' });
let state = initialState();
let storageAvailable = true;
let currentCase = null;
let messageTimer;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && Array.isArray(saved.collected)) {
    state = { ...initialState(), ...saved };
    state.collected = [...new Set(saved.collected.filter(id => cases.some(file => file.id === id)))];
    state.connected = state.collected.length === 3 && saved.connected === true;
    state.unlocked = state.connected && saved.unlocked === true;
    state.ending = state.unlocked && ['release', 'destroy', 'accept'].includes(saved.ending) ? saved.ending : null;
    state.alias = typeof saved.alias === 'string' ? saved.alias.slice(0, 40) : 'Investigator';
  }
} catch { storageAvailable = false; }

const main = document.querySelector('#main');
const viewer = document.querySelector('#viewer');
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function updateProgress() {
  document.querySelector('#progress').textContent = `${state.collected.length} / 3 clues collected`;
  document.querySelector('#storage-note').textContent = storageAvailable ? 'Progress stays in this browser.' : 'Browser storage unavailable. Progress stays for this session.';
}

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); }
  catch { storageAvailable = false; }
  updateProgress();
}

function notify(text) {
  clearTimeout(messageTimer);
  const message = document.querySelector('#message');
  message.textContent = text;
  message.classList.add('visible');
  messageTimer = setTimeout(() => message.classList.remove('visible'), 4000);
}

function go(scene) { location.hash = scene; }
function heading(title, description) { return `<p class="eyebrow">VALE INVESTIGATIONS / RESTRICTED RECORDS</p><h2>${title}</h2><p class="intro">${description}</p>`; }

function fileCards() {
  return `<div class="cards">${cases.map(file => `
    <button class="card" data-case="${file.id}">
      <div class="card-image"><img src="${images[file.image]}" alt="${imageLabels[file.image]}"><span class="file-number">FILE ${file.number}</span></div>
      <div><span class="label">${file.role.toUpperCase()}</span><h3>${file.name}</h3><p>${file.summary}</p>
      <p class="count">${state.collected.includes(file.id) ? 'CLUE COLLECTED ✓' : '1 CLUE TO FIND'} · OPEN FILE</p></div>
    </button>`).join('')}</div>`;
}

function office() {
  main.innerHTML = heading('The office', 'You enter an abandoned detective office. Three files wait on the desk. Read them in any order, collect three clues, and uncover their connection.') + `
    <figure class="office-scene"><img class="office-photo" src="${images.office}" alt="An abandoned detective office: old computer, lamp, filing cabinets and evidence wall"><figcaption>17 BRIAR LANE <span>THE TERMINAL IS STILL ON.</span></figcaption></figure>
    <div class="actions"><a class="primary" href="#archive">Open case files</a><a class="secondary" href="#board">View evidence board</a></div>
    <p class="small">A short mystery with one simple date code. No time limit.</p>` + fileCards();
}

function archive() {
  main.innerHTML = heading('Case archive', 'Choose any file. Each person has one important clue. You can return to a file at any time.') + fileCards();
}

function openCase(id) {
  const file = cases.find(item => item.id === id);
  if (!file) return;
  currentCase = id;
  main.innerHTML = `<button class="secondary" data-action="back">← All files</button>` + heading(file.name, file.story) + `
    <div class="case-subject"><img src="${images[file.portrait]}" alt="Portrait of ${file.name}"><div><span class="label">CASE SUBJECT</span><h3>${file.name}</h3><p>${file.role}</p></div></div>
    <div class="columns"><div>
      <button class="photo-button" data-image="${file.scene}" aria-label="Enlarge ${imageLabels[file.scene]}"><img class="cover" src="${images[file.scene]}" alt="${imageLabels[file.scene]}"></button>
      <p class="small">Click an image to examine it.</p>
      ${file.gallery.length ? `<div class="evidence-gallery">${file.gallery.map(galleryItem).join('')}</div>` : `<div class="ward-note"><span class="room-symbol" aria-hidden="true"></span><div><span class="label">PATIENT’S SKETCH</span><p>“The building changes. The window stays.”</p></div></div>`}
    </div><article class="paper"><span class="label">THE MAIN CLUE</span><h3>${file.clueTitle}</h3><p class="document">${escapeHTML(file.clue)}</p>
      <p class="small">${file.observation}</p>
      <button class="primary" data-collect="${id}" ${state.collected.includes(id) ? 'disabled' : ''}>${state.collected.includes(id) ? 'Collected ✓' : 'Collect this clue'}</button>
      <p><a href="#board">Go to the evidence board →</a></p>
    </article></div>`;
}

function board() {
  main.innerHTML = heading('Evidence board', 'Your collected clues appear here automatically. Collect all three, then press “Show the connection.” Follow the repeated date and address.') + `
    <div class="board ${state.connected ? 'connected' : ''}">${state.connected ? '<svg class="threads" viewBox="0 0 900 220" preserveAspectRatio="none" aria-hidden="true"><path d="M150 30L450 30L750 30" fill="none" stroke="#ae4c3b" stroke-width="3"/></svg>' : ''}${state.collected.length ? state.collected.map(id => {
      const file = cases.find(item => item.id === id);
      return `<article class="clue"><span class="pin" aria-hidden="true"></span><img class="clue-photo" src="${images[file.evidence]}" alt="${imageLabels[file.evidence]}"><small>${file.name.toUpperCase()}</small><strong>${file.clueTitle}</strong><p>${file.observation}</p></article>`;
    }).join('') : '<p class="empty">No clues yet. <a href="#archive">Open a file to start.</a></p>'}</div>
    <div class="actions"><button class="primary" data-action="connect" ${state.collected.length < 3 ? 'disabled' : ''}>${state.connected ? 'Connection revealed ✓' : 'Show the connection'}</button><a class="secondary" href="#archive">Return to the files</a></div>
    ${state.collected.length < 3 ? `<p class="small">${3 - state.collected.length} more clue${3 - state.collected.length === 1 ? '' : 's'} to collect. Each file contains one.</p>` : ''}
    ${state.connected ? `<article class="paper"><h3>One place. One recurring event.</h3><p>The house, hospital and office are all at <strong>17 Briar Lane</strong>. The event repeats on <strong>17 October</strong>, ten years apart. Vale sent Evelyn there and later hid the evidence.</p><p>The date is the key: <strong>month 10 + day 17 = 1017</strong>.</p><a class="primary" href="#locked">Open the locked file</a></article>` : ''}`;
}

function locked() {
  main.innerHTML = heading('The locked file', 'Vale protected his final report with a date. Use the date from Evelyn’s letter.') + `
    <div class="columns"><div><img class="lock-photo" src="${images.confession}" alt="The sealed confession file with a brass key"><article class="paper"><h3>A simple date code</h3><p>“17 October. The month first, then the day.”</p><p class="document">Month: 10\nDay: 17\nCode: 1017</p><p class="small">First collect the three clues and reveal their connection on the evidence board.</p><a href="#board">Return to the board →</a></article></div>
    <form class="paper" id="unlock-form"><label for="password">FOUR-DIGIT DATE CODE</label><input id="password" name="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="1017" required>
    <button class="primary">${state.unlocked ? 'Open final report' : 'Unlock final report'}</button><p id="unlock-result" class="small" role="status"></p></form></div>`;
}

function report() {
  if (state.ending) { showEnding(); return; }
  main.innerHTML = heading('Final report', 'You have uncovered the connection. Now decide what happens to the archive.');
  if (!state.unlocked) {
    main.innerHTML += '<article class="paper"><h3>The report is still locked.</h3><p>Collect three clues, reveal their connection, then use the date code.</p><div class="actions"><a class="primary" href="#archive">Visit the files</a><a class="secondary" href="#locked">Enter the code</a></div></article>';
    return;
  }
  main.innerHTML += `<div class="columns"><article class="paper"><h3>Jonah’s final message</h3><p class="document">The archive existed before me. Every ten years it changes the building and finds another witness.\n\nEvelyn photographed it. Patient 17 survived it. I hid their evidence.\n\nIf you have put these records together, it has already noticed you.\n\nJonah Vale</p><p class="label">NEW ENTRY: ${escapeHTML(new Date().toLocaleDateString('en-CA'))}</p></article>
    <form class="paper" id="ending-form"><label for="alias">YOUR INVESTIGATOR ALIAS (OPTIONAL)</label><input id="alias" name="alias" maxlength="40" placeholder="Investigator" value="${state.alias === 'Investigator' ? '' : escapeHTML(state.alias)}"><label for="choice">WHAT WILL YOU DO?</label>
    <select id="choice" name="choice"><option value="release">Release the archive</option><option value="destroy">Destroy the records</option><option value="accept">Become the next investigator</option></select><button class="primary">See my ending</button><p class="small">Every choice has an ending. Your alias stays in this browser.</p></form></div>`;
}

const endings = {
  release: { title: 'The truth gets out.', text: 'You release the evidence. The cases reopen and the witnesses are finally heard. Then you examine the last photograph. A new figure stands beside the window. You recognise your own coat.', label: 'NEW PHOTOGRAPH IDENTIFIED' },
  destroy: { title: 'Paper burns. Records remain.', text: 'You burn the files. The office falls silent. A minute later, the computer lights up and creates a new folder. Your alias is written on the tab.', label: 'NEW SUBJECT FILE' },
  accept: { title: 'The next investigator.', text: 'You open the final file. Every investigator has left a message for the next. You switch on the desk lamp. Someone stops outside the door. Your first case has arrived.', label: 'CASE ACCEPTED. NEW INVESTIGATOR ASSIGNED' }
};

function showEnding() {
  const ending = endings[state.ending];
  main.innerHTML = `<div class="ending-scene"><img src="${images.office}" alt="The office awaits its next investigator"></div><article class="paper ending"><span class="label">YOUR ENDING</span><h2>${ending.title}</h2><p>${ending.text}</p><p class="alias">${ending.label}: ${escapeHTML(state.alias)}</p><button class="primary" data-action="reconsider">Try another ending</button></article>`;
}

const scenes = { office, archive, board, locked, report };
function render() {
  let scene = location.hash.slice(1) || 'office';
  if (!scenes[scene]) scene = 'office';
  currentCase = null;
  document.querySelectorAll('nav a').forEach(link => {
    link.removeAttribute('aria-current');
    if (link.hash === '#' + scene) link.setAttribute('aria-current', 'page');
  });
  scenes[scene]();
  updateProgress();
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.case) {
    if (location.hash !== '#archive') { history.pushState(null, '', '#archive'); render(); }
    openCase(button.dataset.case);
    return;
  }
  if (button.dataset.collect) {
    const id = button.dataset.collect;
    if (!state.collected.includes(id)) { state.collected.push(id); save(); openCase(id); notify('Clue added to the evidence board.'); }
    return;
  }
  if (button.dataset.image && images[button.dataset.image]) {
    const image = button.dataset.image;
    document.querySelector('#content').innerHTML = `<span class="label">ARCHIVED IMAGE / EXAMINE</span><h3>${imageLabels[image]}</h3><img class="enlarged-photo" src="${images[image]}" alt="${imageLabels[image]}"><p class="small">The readable record is on the case page.</p>`;
    viewer.showModal();
    return;
  }
  if (button.id === 'close') { viewer.close(); return; }
  if (button.id === 'restart') {
    document.querySelector('#content').innerHTML = '<h3>Start again?</h3><p>This clears only this story’s saved progress.</p><button class="primary" data-action="reset">Clear and restart</button>';
    viewer.showModal();
    return;
  }
  switch (button.dataset.action) {
    case 'back': currentCase = null; archive(); break;
    case 'connect': if (state.collected.length === 3) { state.connected = true; save(); board(); } break;
    case 'reconsider': state.ending = null; save(); report(); break;
    case 'reset': state = initialState(); currentCase = null; save(); viewer.close(); if (location.hash === '#office') render(); else go('office'); break;
  }
});

document.addEventListener('submit', event => {
  if (event.target.id === 'unlock-form') {
    event.preventDefault();
    const code = new FormData(event.target).get('password');
    const result = document.querySelector('#unlock-result');
    if (!state.connected) result.textContent = 'Collect the three clues and click “Show the connection” on the board first.';
    else if (code !== '1017') result.textContent = 'Try 1017: October is 10, followed by day 17. Your progress is safe.';
    else { state.unlocked = true; save(); go('report'); }
  }
  if (event.target.id === 'ending-form') {
    event.preventDefault();
    const data = new FormData(event.target);
    state.alias = String(data.get('alias')).trim().slice(0, 40) || 'Investigator';
    state.ending = data.get('choice');
    save(); showEnding(); window.scrollTo(0, 0);
  }
});

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); main.focus({ preventScroll: true }); });
window.addEventListener('popstate', render);
render();
