const readlineSync = require('readline-sync');
const fs = require('fs');

console.log('🚀 BFHL API Setup - Enter Your Details\n');

// Get user input
const fullName = readlineSync.question('Enter your full name (e.g., John Doe): ').toLowerCase().replace(/\s+/g, '_');
const birthDate = readlineSync.question('Enter your birth date (DDMMYYYY format, e.g., 17091999): ');
const email = readlineSync.question('Enter your email address: ');
const rollNumber = readlineSync.question('Enter your college roll number: ');

// Validate inputs
if (!fullName || !birthDate || !email || !rollNumber) {
    console.error('❌ All fields are required!');
    process.exit(1);
}

if (!/^\d{8}$/.test(birthDate)) {
    console.error('❌ Birth date must be in DDMMYYYY format (8 digits)');
    process.exit(1);
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('❌ Please enter a valid email address');
    process.exit(1);
}

// Create user config
const userConfig = {
    full_name: fullName,
    birth_date: birthDate,
    email: email,
    roll_number: rollNumber
};

// Save to config file
fs.writeFileSync('user-config.json', JSON.stringify(userConfig, null, 2));

console.log('\n✅ Configuration saved successfully!');
console.log('📝 Your details:');
console.log(`   Name: ${fullName}`);
console.log(`   Birth Date: ${birthDate}`);
console.log(`   Email: ${email}`);
console.log(`   Roll Number: ${rollNumber}`);
console.log(`   User ID: ${fullName}_${birthDate}`);
console.log('\n🚀 You can now start the server with: npm start');