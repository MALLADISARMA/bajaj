const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
let USER_INFO;
try {
    // First try to load from environment variables (for production)
    if (process.env.FULL_NAME && process.env.BIRTH_DATE && process.env.EMAIL && process.env.ROLL_NUMBER) {
        USER_INFO = {
            full_name: process.env.FULL_NAME,
            birth_date: process.env.BIRTH_DATE,
            email: process.env.EMAIL,
            roll_number: process.env.ROLL_NUMBER
        };
        console.log('✅ User configuration loaded from environment variables');
    } else {
        // Fallback to config file (for local development)
        const configPath = path.join(__dirname, 'user-config.json');
        if (fs.existsSync(configPath)) {
            USER_INFO = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log('✅ User configuration loaded from file:', USER_INFO.full_name);
        } else {
            // Default values if nothing is found
            USER_INFO = {
                full_name: "john_doe",
                birth_date: "17091999",
                email: "john@xyz.com",
                roll_number: "ABCD123"
            };
            console.log('⚠️ Using default configuration');
        }
    }
} catch (error) {
    console.error('❌ Error loading user configuration:', error.message);
    process.exit(1);
}

// Load user configuration
let USER_INFO;
try {
    const configPath = path.join(__dirname, 'user-config.json');
    if (fs.existsSync(configPath)) {
        USER_INFO = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('✅ User configuration loaded:', USER_INFO.full_name);
    } else {
        console.log('⚠️  No user configuration found. Run "npm run setup" first.');
        USER_INFO = {
            full_name: "john_doe",
            birth_date: "17091999",
            email: "john@xyz.com",
            roll_number: "ABCD123"
        };
    }
} catch (error) {
    console.error('❌ Error loading user configuration:', error.message);
    process.exit(1);
}

// Helper function to check if a character is a number
function isNumber(char) {
    return !isNaN(char) && !isNaN(parseFloat(char));
}

// Helper function to check if a character is an alphabet
function isAlphabet(char) {
    return /^[A-Za-z]$/.test(char);
}

// Helper function to check if a character is a special character
function isSpecialCharacter(char) {
    return !isNumber(char) && !isAlphabet(char);
}

// Helper function to process alphabets for concatenation
function processAlphabetsForConcat(alphabets) {
    // Extract all individual characters from alphabetic strings
    let allChars = [];
    alphabets.forEach(item => {
        for (let char of item) {
            if (isAlphabet(char)) {
                allChars.push(char.toLowerCase());
            }
        }
    });
    
    // Reverse the array
    allChars.reverse();
    
    // Apply alternating caps (first char uppercase, second lowercase, etc.)
    return allChars.map((char, index) => {
        return index % 2 === 0 ? char.toUpperCase() : char.toLowerCase();
    }).join('');
}

// POST /bfhl endpoint
app.post('/bfhl', (req, res) => {
    try {
        // Validate request body
        if (!req.body || !req.body.data || !Array.isArray(req.body.data)) {
            return res.status(400).json({
                is_success: false,
                error: "Invalid input. 'data' field must be an array."
            });
        }

        const inputData = req.body.data;
        
        // Initialize response arrays
        let oddNumbers = [];
        let evenNumbers = [];
        let alphabets = [];
        let specialCharacters = [];
        let numbers = [];

        // Process each item in the input array
        inputData.forEach(item => {
            const itemStr = String(item);
            
            // Check if entire item is a number
            if (isNumber(itemStr)) {
                const num = parseInt(itemStr);
                numbers.push(num);
                if (num % 2 === 0) {
                    evenNumbers.push(itemStr);
                } else {
                    oddNumbers.push(itemStr);
                }
            }
            // Check if entire item contains only alphabets
            else if (/^[A-Za-z]+$/.test(itemStr)) {
                alphabets.push(itemStr.toUpperCase());
            }
            // Check if it's a single special character
            else if (itemStr.length === 1 && isSpecialCharacter(itemStr)) {
                specialCharacters.push(itemStr);
            }
            // Handle mixed content (like "ABcD" which should go to alphabets)
            else {
                let hasOnlyAlphabets = true;
                for (let char of itemStr) {
                    if (!isAlphabet(char)) {
                        hasOnlyAlphabets = false;
                        break;
                    }
                }
                if (hasOnlyAlphabets) {
                    alphabets.push(itemStr.toUpperCase());
                } else {
                    // If it contains mixed characters, treat as special
                    specialCharacters.push(itemStr);
                }
            }
        });

        // Calculate sum of all numbers
        const sum = numbers.reduce((acc, num) => acc + num, 0).toString();

        // Generate concatenated string
        const concatString = processAlphabetsForConcat(alphabets);

        // Generate user_id
        const userId = `${USER_INFO.full_name}_${USER_INFO.birth_date}`;

        // Prepare response
        const response = {
            is_success: true,
            user_id: userId,
            email: USER_INFO.email,
            roll_number: USER_INFO.roll_number,
            odd_numbers: oddNumbers,
            even_numbers: evenNumbers,
            alphabets: alphabets,
            special_characters: specialCharacters,
            sum: sum,
            concat_string: concatString
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            is_success: false,
            error: "Internal server error"
        });
    }
});

// GET /bfhl endpoint (optional - for testing)
app.get('/bfhl', (req, res) => {
    res.status(200).json({
        operation_code: 1,
        user_id: `${USER_INFO.full_name}_${USER_INFO.birth_date}`
    });
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: "BFHL API is running",
        user_info: {
            user_id: `${USER_INFO.full_name}_${USER_INFO.birth_date}`,
            email: USER_INFO.email,
            roll_number: USER_INFO.roll_number
        },
        endpoints: {
            "POST /bfhl": "Main API endpoint",
            "GET /bfhl": "Get operation code",
            "GET /config": "View current configuration"
        }
    });
});

// Configuration endpoint
app.get('/config', (req, res) => {
    res.json({
        user_info: USER_INFO,
        user_id: `${USER_INFO.full_name}_${USER_INFO.birth_date}`,
        message: "Current user configuration"
    });
});

// Update configuration endpoint (for convenience)
app.post('/config', (req, res) => {
    try {
        const { full_name, birth_date, email, roll_number } = req.body;
        
        if (!full_name || !birth_date || !email || !roll_number) {
            return res.status(400).json({
                error: "All fields are required: full_name, birth_date, email, roll_number"
            });
        }

        if (!/^\d{8}$/.test(birth_date)) {
            return res.status(400).json({
                error: "Birth date must be in DDMMYYYY format (8 digits)"
            });
        }

        const newConfig = {
            full_name: full_name.toLowerCase().replace(/\s+/g, '_'),
            birth_date,
            email,
            roll_number
        };

        // Update global config
        USER_INFO = newConfig;
        
        // Save to file
        fs.writeFileSync('user-config.json', JSON.stringify(newConfig, null, 2));

        res.json({
            message: "Configuration updated successfully",
            user_info: newConfig,
            user_id: `${newConfig.full_name}_${newConfig.birth_date}`
        });

    } catch (error) {
        console.error('Error updating configuration:', error);
        res.status(500).json({
            error: "Failed to update configuration"
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        is_success: false,
        error: 'Something went wrong!'
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({
        is_success: false,
        error: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 API endpoint: http://localhost:${PORT}/bfhl`);
    console.log(`👤 User ID: ${USER_INFO.full_name}_${USER_INFO.birth_date}`);
    console.log(`📧 Email: ${USER_INFO.email}`);
    console.log(`🎓 Roll Number: ${USER_INFO.roll_number}`);
});

module.exports = app;