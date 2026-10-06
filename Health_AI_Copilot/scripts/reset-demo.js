/**
 * Quick Reset Script for Hackathon Live Demos
 * Cleans the database and reseeds with canonical demo data.
 */

const seedDatabase = require('../database/seed/seedData');

console.log('Resetting Paavai Demo Hospital database...');
seedDatabase();
console.log('Reset complete! Ready for demo.');
