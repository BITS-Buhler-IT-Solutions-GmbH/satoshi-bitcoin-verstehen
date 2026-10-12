#!/usr/bin/env node
'use strict';

// Empfehlungen, Antwortsperren, Wiederholung und Speicherfehler prüfen.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
function section(start, end) {
  const offset = html.indexOf(start);
  assert.ok(offset >= 0, 'Quellabschnitt fehlt: ' + start);
  return html.slice(offset, html.indexOf(end, offset));
}
const stored = new Map();
const elements = Object.fromEntries(['personalLearningStart', 'walletTraining', 'walletHomeStatus'].map(id => [id, {innerHTML: '', textContent: ''}]));
let failStorage = false;
const context = vm.createContext({
  console, document: {body: null, getElementById: id => elements[id] || null},
  window: {matchMedia: () => ({matches: true})},
  localStorage: {
    getItem: key => stored.get(key) ?? null,
    setItem(key, value) { if (failStorage) throw new Error('QuotaExceededError'); stored.set(key, value); },
    removeItem: key => stored.delete(key)
  },
  completedModules: [], MODULES: [{key: 'geld', name: 'Geld'}],
  escapeHtml: value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;'),
  navigateTo: key => { context.destination = key; },
  setActivePath: id => { context.activePath = id; }
});
vm.runInContext(
  section('const LEARNING_PATHS = [', '/* localStorage-Helper') +
  section('// Browser-Speicher darf', 'function validateProgressField(') +
  section('const WALLET_SCENARIOS = [', 'function renderHomeLearningEntry('), context);
const run = code => vm.runInContext(code, context);

for (const level of ['new', 'some', 'advanced']) {
  for (const [goal, expected] of [['understand', 'basics'], ['custody', 'self-custody'], ['tech', 'tech'], ['swiss', 'schweiz']]) {
    for (const pace of ['short', 'deep']) {
      context.profileFixture = {version: 1, level, goal, pace};
      assert.equal(run('recommendLearningPath(profileFixture).id'), level === 'new' ? 'basics' : expected);
    }
  }
}
assert.equal(run('recommendLearningPath({})'), null);
assert.equal(run("isLearningProfile({version:1,level:'new',goal:'bad',pace:'short'})"), false);
assert.equal(run('isWalletTraining({version:1,answers:[null,null,null,null,3]})'), false);
assert.equal(run('isWalletTraining({version:1,answers:[null,null]})'), false);
assert.equal(run("isWalletTraining({version:1,answers:[null,null,null,null,'1']})"), false);
run('renderLearningLab()');
assert.match(elements.personalLearningStart.innerHTML, /name="level"/);
assert.match(elements.personalLearningStart.innerHTML, /name="goal"/);
assert.match(elements.personalLearningStart.innerHTML, /name="pace"/);
assert.match(elements.walletTraining.innerHTML, /SITUATION 1/);
run('nextWalletScenario()');
assert.equal(run('walletTrainingStep'), 0, 'Unbeantwortete Situation wird nicht übersprungen');
run('answerWalletScenario(1, 2); answerWalletScenario(0, 9)');
assert.equal(run('walletTraining.answers[0]'), null, 'Ungültige Antworten werden ignoriert');
run('answerWalletScenario(0, 0); answerWalletScenario(0, 1)');
assert.equal(run('walletTraining.answers[0]'), 0, 'Erste Antwort ist gesperrt');
assert.match(elements.walletTraining.innerHTML, /disabled/);
assert.match(elements.walletTraining.innerHTML, /genauerer Blick/);
assert.equal(JSON.parse(stored.get('walletTraining')).answers[0], 0);
run('nextWalletScenario()');
for (let index = 1; index < 5; index++) {
  run('answerWalletScenario(walletTrainingStep, WALLET_SCENARIOS[walletTrainingStep].correct); nextWalletScenario()');
}
assert.equal(run('walletTrainingScore()'), 4);
assert.equal(run('walletTrainingStep'), 5);
assert.match(elements.walletTraining.innerHTML, /Offene Themen erneut üben/);
run('retryWalletMistakes()');
assert.equal(run('walletTrainingStep'), 0);
assert.equal(run('walletTraining.answers.filter(v => v === null).length'), 1, 'Nur Fehler werden zurückgesetzt');
failStorage = true;
run('answerWalletScenario(0, 1); nextWalletScenario()');
assert.equal(run('walletTrainingScore()'), 5, 'Training funktioniert bei blockiertem Speicher in der Sitzung');
assert.match(elements.walletTraining.innerHTML, /Übungen bestanden/);
assert.match(elements.walletHomeStatus.textContent, /5 von 5/);
run('reviewWalletScenario(2)');
assert.match(elements.walletTraining.innerHTML, /280 Sats/);
run('nextWalletScenario()');
assert.equal(run('walletTrainingStep'), 5);
assert.equal(context.completedModules.length, 0, 'Übungen verändern keine Modulabschlüsse');
run("learningProfile={version:1,level:'some',goal:'custody',pace:'deep'}; activateRecommendedPath()");
assert.equal(context.activePath, 'self-custody');
assert.equal(context.destination, 'kaufen');
context.completedModules = ['kaufen', 'sicherheit', 'privacy', 'nodes', 'bitcoin-schweiz'];
assert.match(run("renderLearningRecommendation(LEARNING_PATHS[1], learningProfile)"), /Alle Module dieses Pfads abgeschlossen/);
console.log('✓ Lernstart und Wallet-Training: Empfehlungen, Antwortsperren, Wiederholung, Ergebnisse und Speicherfehler');
