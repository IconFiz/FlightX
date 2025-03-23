document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const digits = document.querySelectorAll('.digit');
    const squawkInfo = document.querySelector('.squawk-info');

    // Emergency codes to exclude
    const emergencyCodes = ['7500', '7600', '7700'];

    // Function to generate a random digit (0-7)
    function generateDigit() {
        return Math.floor(Math.random() * 8);
    }

    // Function to generate a valid squawk code
    function generateSquawkCode() {
        let code;
        do {
            code = Array.from({length: 4}, generateDigit).join('');
        } while (emergencyCodes.includes(code) || code === '0000');
        return code;
    }

    // Function to animate digit change
    function animateDigitChange(digit, newValue) {
        digit.classList.add('changing');
        setTimeout(() => {
            digit.textContent = newValue;
            digit.classList.remove('changing');
        }, 150);
    }

    // Function to update the display with a new code
    function updateDisplay(code) {
        const codeArray = code.split('');
        digits.forEach((digit, index) => {
            setTimeout(() => {
                animateDigitChange(digit, codeArray[index]);
            }, index * 100);
        });
    }

    // Click handler for generate button
    generateBtn.addEventListener('click', function() {
        const newCode = generateSquawkCode();
        updateDisplay(newCode);
        squawkInfo.textContent = 'New code generated';

        // Reset info text after 2 seconds
        setTimeout(() => {
            squawkInfo.textContent = 'Click generate to create a new code';
        }, 2000);
    });

    // Hover effect for digits
    digits.forEach(digit => {
        digit.addEventListener('mouseenter', () => {
            digit.style.transform = 'scale(1.1)';
        });

        digit.addEventListener('mouseleave', () => {
            digit.style.transform = 'scale(1)';
        });
    });
}); 