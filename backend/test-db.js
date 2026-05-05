const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI?.replace(/:([^:@]+)@/, ':****@'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ SUCCESS! MongoDB Connected');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ FAILED:', err.message);
    process.exit(1);
  });
