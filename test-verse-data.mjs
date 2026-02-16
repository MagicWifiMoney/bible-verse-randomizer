import versesData from './lib/verses-data.json' with { type: 'json' };

console.log('Loaded verses:', Object.keys(versesData).length);
console.log('First key:', Object.keys(versesData)[0]);
console.log('john-3-16 exists:', 'john-3-16' in versesData);
console.log('john-3-16 data:', versesData['john-3-16']?.book);
