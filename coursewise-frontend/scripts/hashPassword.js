/**
 * Simple script to hash passwords with bcrypt
 * Usage: node hashPassword.js [password]
 */

import bcrypt from 'bcryptjs';

// Get password from command line arguments
const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument: node hashPassword.js YOUR_PASSWORD');
  process.exit(1);
}

// Generate salt
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

// Hash password
const hashedPassword = bcrypt.hashSync(password, salt);

console.log('Original password:', password);
console.log('Hashed password:', hashedPassword);

// Verify the hash
const isMatch = bcrypt.compareSync(password, hashedPassword);
console.log('Verification:', isMatch ? 'Success' : 'Failed'); 