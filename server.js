const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Your personal details - UPDATE THESE WITH YOUR ACTUAL INFO
const USER_INFO = {
    full_name: "john_doe", // Replace with your actual name in lowercase
    birth_date: "17091999", // Replace with your birth date in ddmmyyyy format
    email: "john@xyz.com", // Replace with your actual email
    roll_number: "ABCD123" // Replace with your actual roll number
};

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
        endpoints: {
            "POST /bfhl": "Main API endpoint",
            "GET /bfhl": "Get operation code"
        }
    });
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
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/bfhl`);
});

module.exports = app;
