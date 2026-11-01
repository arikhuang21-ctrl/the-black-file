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
