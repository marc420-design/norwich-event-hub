#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const exportsPath = path.join(__dirname, '..', 'exports', 'events.json');
const requiredEventFields = ['name', 'date', 'category', 'venue', 'status'];
const linkFields = ['ticketLink', 'sourceUrl', 'officialUrl', 'primaryUrl'];

function fail(message) {
  console.error(`[verify] ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`Failed to read/parse JSON at ${filePath}: ${error.message}`);
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

const payload = readJson(exportsPath);

if (!payload || typeof payload !== 'object') {
  fail('exports/events.json must be a JSON object.');
}

if (!Array.isArray(payload.events)) {
  fail("exports/events.json must include an 'events' array.");
}

if (!isNonEmptyString(payload.generated_at)) {
  fail("exports/events.json must include a non-empty 'generated_at' string.");
}

if (typeof payload.count !== 'number') {
  fail("exports/events.json must include numeric 'count'.");
}

if (payload.count !== payload.events.length) {
  fail(`'count' (${payload.count}) does not match events length (${payload.events.length}).`);
}

const issues = [];
payload.events.forEach((event, index) => {
  if (!event || typeof event !== 'object') {
    issues.push(`event[${index}] is not an object`);
    return;
  }

  for (const field of requiredEventFields) {
    if (!isNonEmptyString(event[field])) {
      issues.push(`event[${index}] missing required field '${field}'`);
    }
  }

  const hasAtLeastOneLink = linkFields.some((field) => isNonEmptyString(event[field]));
  if (!hasAtLeastOneLink) {
    issues.push(`event[${index}] missing all link fields (${linkFields.join(', ')})`);
  }
});

if (issues.length > 0) {
  console.error('[verify] exports/events.json validation failed.');
  issues.slice(0, 20).forEach((issue) => console.error(`- ${issue}`));
  if (issues.length > 20) {
    console.error(`- ...and ${issues.length - 20} more issue(s)`);
  }
  process.exit(1);
}

console.log(`[verify] OK: ${payload.events.length} event(s) validated in exports/events.json`);
