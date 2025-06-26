const bcrypt = require('bcryptjs');

async function createHashedPassword() {
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed password for admin123:', hashedPassword);
}

createHashedPassword();