const fs = require('fs'); 
//import fs from ('fs'); 
const path = require('path');


function countWords(text) {
    return text
    .split(/\s+/) // Split text by spaces
    .filter(word => word.length > 0 && isNaN(word)) // Exclude empty strings and numbers
    .length;
}

function processFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                // Handle file not found or any other read errors
                return reject(`Error reading ${filePath}: ${err.message}`);
            }
            // Count the number of words
            const wordCount = countWords(data);
            resolve({ filePath, wordCount });//
        });
    });
}

//read config and process all files
function processFiles() {
    const configPath = path.join(__dirname, 'config.json');

    // Read the configuration file to get file paths
    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading config file: ${err.message}`);
            return;
        }

        let config;
        try {
            config = JSON.parse(data); // Parse the JSON config file
        } catch (parseErr) {
            console.error(`Error parsing config file: ${parseErr.message}`);
            return;
        }

        const files = config.files || [];
        if (files.length === 0) {
            console.error('No files to process.');
            return;
        }

        // Process each file asynchronously
        const promises = files.map(filePath => processFile(filePath));

        // Wait for all files to be processed
        Promise.allSettled(promises).then(results => {
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    console.log(`${result.value.filePath}: ${result.value.wordCount} words`);
                } else {
                    console.error(result.reason);
                }
            });
        });
    });
}

// Run the process
processFiles();
