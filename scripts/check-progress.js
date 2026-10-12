#!/usr/bin/env node
'use strict';

// Regressionen für Backups, blockierten Speicher und verzögerte Initialisierung.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
const section = (start, end) => html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start)));
const values = new Map();
let failKey = null;
const context = vm.createContext({
  console, document: { body: null },
  localStorage: {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) {
      if (key === failKey) { failKey = null; throw new Error('QuotaExceededError'); }
      values.set(key, String(value));
    },
    removeItem(key) { values.delete(key); }
  }
});
vm.runInContext(
  section('const LEARNING_PATHS = [', '/* localStorage-Helper') +
  section('// Browser-Speicher darf', 'function getActivePath()') +
  section('const PROGRESS_KEYS = [', 'function exportProgress()') +
  section('function migrateProgress(', 'function importProgress('), context);
const run = code => vm.runInContext(code, context);

values.set('visitedModules', '{kaputt');
assert.equal(run("readStoredJSON('visitedModules', [], isStringArray).length"), 0);
values.set('visitedModules', '{}');
assert.equal(run("readStoredJSON('visitedModules', [], isStringArray).length"), 0);
values.set('visitedModules', '["geld"]');
assert.equal(run("readStoredJSON('visitedModules', [], isStringArray)[0]"), 'geld');
assert.equal(run("validateProgressField('checklistState', {seed_backup: true})"), true);
assert.equal(run("validateProgressField('satsWallet', {balance: -1})"), false);
assert.equal(run("validateProgressField('appStats', {dailyVisits: []})"), false);
assert.throws(() => run("persistProgressImport({visitedModules: ['inflation'], satsWallet: {answered: 'kaputt'}})"));
assert.equal(values.get('visitedModules'), '["geld"]', 'Ungültiger Import verändert keine Daten');
run("persistProgressImport({activeLearningPath:'basics', lastSeenVersion:'3.5.0', completedModules:['geld']})");
assert.equal(values.get('activeLearningPath'), 'basics');
assert.equal(values.get('lastSeenVersion'), '3.5.0');
assert.equal(values.get('completedModules'), '["geld"]');
run("persistProgressImport({learningProfile:{version:1,level:'some',goal:'custody',pace:'short'},walletTraining:{version:1,answers:[1,null,null,null,null]}})");
assert.equal(JSON.parse(values.get('learningProfile')).goal, 'custody');
assert.equal(JSON.parse(values.get('walletTraining')).answers[0], 1);
assert.throws(() => run("persistProgressImport({learningProfile:{version:1,level:'new',goal:'wrong',pace:'short'}})"));
assert.throws(() => run("persistProgressImport({walletTraining:{version:1,answers:[1,2,0,1,99]}})"));
failKey = 'completedModules';
assert.throws(() => run("persistProgressImport({visitedModules:['inflation'], completedModules:['inflation']})"));
assert.equal(values.get('visitedModules'), '["geld"]', 'Schreibfehler stellt vorherige Werte wieder her');
assert.equal(values.get('completedModules'), '["geld"]');
assert.equal(run("migrateProgress({schemaVersion:1,data:{visitedModules:['geld']}}).completedModules.length"), 0);
assert.throws(() => run("migrateProgress({schemaVersion:'2',data:{}})"));
assert.throws(() => run("migrateProgress({schemaVersion:3,data:{}})"));
context.localStorage.getItem = () => { throw new Error('SecurityError'); };
assert.equal(run("readStoredJSON('visitedModules', [], isStringArray).length"), 0);
context.localStorage.setItem = () => { throw new Error('SecurityError'); };
assert.equal(run("storageSetRaw('visitedModules', '[]')"), false);

const pump = section('  (function pumpIdle()', '\n\n  // Achievement-Check');
for (const mode of ['timeout', 'idle', 'fallback']) {
  const callbacks = [];
  let count = 0;
  const window = { _deferredInitQueue: Array.from({length: 7}, () => () => count++) };
  if (mode !== 'fallback') window.requestIdleCallback = cb => callbacks.push(() => cb({didTimeout: mode === 'timeout', timeRemaining: () => 50}));
  vm.runInNewContext(pump, {window, console, setTimeout: cb => callbacks.push(cb)});
  let iterations = 0;
  while (callbacks.length && iterations++ < 20) callbacks.shift()();
  assert.equal(count, 7, 'Initialisierung: ' + mode);
  assert.equal(callbacks.length, 0, 'Keine endlose Warteschlange: ' + mode);
}
console.log('✓ Fortschritt: Datenprüfung, Import-Rollback, Migration, blockierter Speicher und Idle-Initialisierung');
