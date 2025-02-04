const express = require('express');
const fs = require('fs');
const path = require('path');

// Initialize express app
const app = express();
const port = 3000;

// Middleware to serve static files (CSS, JS)
app.use(express.static('public'));
app.use(express.json());  // Use express's built-in JSON parser

// Serve HTML, CSS, and JavaScript together
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>File Organizer</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f4f4f4;
                    margin: 0;
                }
                .container {
                    text-align: center;
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                input {
                    padding: 10px;
                    margin: 10px 0;
                    width: 80%;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                }
                button {
                    padding: 10px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    cursor: pointer;
                    border-radius: 5px;
                }
                button:hover {
                    background-color: #0056b3;
                }
                #status {
                    margin-top: 20px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
        <div class="container">
            <h1>File Organizer Tool</h1>
            <p>Enter the directory path to organize files:</p>
            <input type="text" id="directoryPath" placeholder="Enter directory path">
            <button onclick="organize()">Organize Files</button>
            <p id="status"></p>
        </div>
        <script>
            function organize() {
                const directoryPath = document.getElementById("directoryPath").value;

                fetch('/organize', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ path: directoryPath })
                })
                .then(response => response.text())
                .then(data => document.getElementById("status").innerText = data);
            }
        </script>
        </body>
        </html>
    `);
});

// Define file extensions for each category
const categories = {
    Images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
    Documents: ['.pdf', '.docx', '.txt', '.pptx', '.xlsx'],
    Videos: ['.mp4', '.mkv', '.avi', '.mov', '.wmv']
};

// Function to organize files
function organizeFiles(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
        return 'Directory not found!';
    }

    const files = fs.readdirSync(directoryPath);
    const summary = [];

    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const fileExtension = path.extname(file).toLowerCase();

        let category = 'Others'; // Default category

        // Identify the category of the file
        for (const [key, extensions] of Object.entries(categories)) {
            if (extensions.includes(fileExtension)) {
                category = key;
                break;
            }
        }

        const categoryFolderPath = path.join(directoryPath, category);

        // Create the category folder if it doesn't exist
        if (!fs.existsSync(categoryFolderPath)) {
            fs.mkdirSync(categoryFolderPath);
            summary.push(`Created folder: ${category}`);
        }

        // Move the file to the respective category folder
        const newFilePath = path.join(categoryFolderPath, file);
        fs.renameSync(filePath, newFilePath);
        summary.push(`Moved file: ${file} to ${category}`);
    });

    // Log operations to a summary.txt file
    const summaryText = summary.join('\n');
    fs.writeFileSync(path.join(directoryPath, 'summary.txt'), summaryText);

    return 'Files have been organized successfully. Operations logged in summary.txt.';
}

// Handle file organization request
app.post('/organize', (req, res) => {
    const directoryPath = req.body.path;
    const result = organizeFiles(directoryPath);
    res.send(result);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
