const fs = require('fs');
const crypto = require('crypto');

const fileSizeInBytes = 1024 * 1024; // 1MB
const filePath = 'randomFile.txt';

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    console.log("Generating random " + length)
    console.log("charactersLength " + charactersLength)
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Function to create and write the random file
const createRandomFile = () => {
  // Generate a random string
    const randomString = generateRandomString(fileSizeInBytes);
    // var randomString = crypto.randomBytes(fileSizeInBytes)    

  // Write the random string to the file
  fs.writeFileSync(filePath, randomString);

  console.log(`File created successfully at ${filePath}`);
};

// Run the function to create the random file
createRandomFile();