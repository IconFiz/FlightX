// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Function to update UTC time
    function updateUTCTime() {
        const now = new Date();
        const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
        const timeInput = document.getElementById('time');
        timeInput.value = utcTime.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Update time immediately and then every minute
    updateUTCTime();
    setInterval(updateUTCTime, 60000);

    // Get the form element and audio button
    const form = document.getElementById('atisForm');
    const audioBtn = document.getElementById('audioBtn');
    let currentUtterance = null;
    let currentLetter = 'A';

    // Function to generate random wind conditions
    function generateWind() {
        const windSpeeds = [
            { range: '0', text: 'Calm' },
            { range: '1-5', text: 'Light winds' },
            { range: '6-15', text: 'Moderate winds' },
            { range: '16-25', text: 'Windy conditions' }
        ];
        
        const speed = windSpeeds[Math.floor(Math.random() * windSpeeds.length)];
        const direction = Math.floor(Math.random() * 360);
        const variable = Math.random() > 0.5;
        
        let windText = `Wind ${direction} at ${speed.range} knots`;
        if (variable) {
            const varRange = 20;
            const varStart = (direction - varRange + 360) % 360;
            const varEnd = (direction + varRange) % 360;
            windText += `, variable between ${varStart} and ${varEnd} degrees`;
        }
        
        return windText;
    }

    // Function to format runway names
    function formatRunway(rwy) {
        const number = rwy.match(/\d+/)[0];
        const suffix = rwy.match(/[A-Z]+/)?.[0] || '';
        const suffixMap = {
            'L': 'Left',
            'R': 'Right',
            'C': 'Center'
        };
        return `Runway ${number} ${suffixMap[suffix] || suffix}`;
    }

    // Function to spell out ICAO code phonetically
    function spellICAO(icao) {
        const phonetic = {
            'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta',
            'E': 'Echo', 'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel',
            'I': 'India', 'J': 'Juliet', 'K': 'Kilo', 'L': 'Lima',
            'M': 'Mike', 'N': 'November', 'O': 'Oscar', 'P': 'Papa',
            'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
            'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-Ray',
            'Y': 'Yankee', 'Z': 'Zulu'
        };
        return icao.toUpperCase().split('').map(char => phonetic[char]).join(' ');
    }

    // Function to fetch airport name
    function fetchAirportName(icao) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.withCredentials = true;

            xhr.addEventListener('readystatechange', function () {
                if (this.readyState === this.DONE) {
                    try {
                        const data = JSON.parse(this.responseText);
                        const airport = data.find(airport => airport.icao === icao);
                        if (airport) {
                            resolve(airport.name);
                        } else {
                            resolve(spellICAO(icao)); // Return phonetic spelling if airport not found
                        }
                    } catch (error) {
                        console.error('Error parsing airport data:', error);
                        resolve(spellICAO(icao)); // Return phonetic spelling if parsing fails
                    }
                }
            });

            xhr.addEventListener('error', function() {
                console.error('Error fetching airport data');
                resolve(spellICAO(icao)); // Return phonetic spelling if request fails
            });

            xhr.open('GET', 'https://iata-and-icao-codes.p.rapidapi.com/airlines');
            xhr.setRequestHeader('x-rapidapi-key', 'Sign Up for Key');
            xhr.setRequestHeader('x-rapidapi-host', 'iata-and-icao-codes.p.rapidapi.com');

            xhr.send(null);
        });
    }

    // Function to process numbers for speech
    function processNumbersForSpeech(text) {
        // Replace numbers with their spoken equivalents
        return text.replace(/\d+/g, (match) => {
            // Split the number into individual digits
            return match.split('').map(digit => {
                // Special case for 9
                if (digit === '9') return 'niner';
                // For other digits, return the digit with a space
                return digit + ' ';
            }).join('').trim();
        });
    }

    // Function to speak ATIS
    function speakATIS(text) {
        // Cancel any ongoing speech
        if (currentUtterance) {
            window.speechSynthesis.cancel();
        }

        // Process the text to handle numbers
        const processedText = processNumbersForSpeech(text);

        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(processedText);
        
        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        
        // Try to find a male voice (similar to ATIS)
        const maleVoice = voices.find(voice => 
            voice.name.includes('Male') || 
            voice.name.includes('US') || 
            voice.name.includes('English')
        );

        if (maleVoice) {
            utterance.voice = maleVoice;
        }

        // Set speech parameters
        utterance.rate = 0.9; // Slightly slower than normal
        utterance.pitch = 0.9; // Slightly lower pitch
        utterance.volume = 1;

        // Store current utterance
        currentUtterance = utterance;

        // Speak the text
        window.speechSynthesis.speak(utterance);
    }

    // Load voices when they become available
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = function() {
            window.speechSynthesis.getVoices();
        };
    }

    // Add ICAO input event listener
    const icaoInput = document.getElementById('icao');
    icaoInput.addEventListener('input', async function() {
        const icao = this.value.toUpperCase();
        if (icao.length === 4) {
            const airportName = await fetchAirportName(icao);
            document.getElementById('airportName').textContent = airportName;
        } else {
            document.getElementById('airportName').textContent = '';
        }
    });

    // Function to get phonetic name for letter
    function getPhoneticName(letter) {
        const phonetic = {
            'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta',
            'E': 'Echo', 'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel',
            'I': 'India', 'J': 'Juliett', 'K': 'Kilo', 'L': 'Lima',
            'M': 'Mike', 'N': 'November', 'O': 'Oscar', 'P': 'Papa',
            'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
            'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray',
            'Y': 'Yankee', 'Z': 'Zulu'
        };
        return phonetic[letter.toUpperCase()];
    }

    // Add submit event listener
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get all form values
        const discordUsername = document.getElementById('discordUsername').value;
        const icao = document.getElementById('icao').value.toUpperCase();
        const airportName = document.getElementById('airportName').textContent || spellICAO(icao);
        const time = document.getElementById('time').value;
        const depRunways = document.getElementById('depRunways').value.split(',').map(r => r.trim());
        const arrRunways = document.getElementById('arrRunways').value.split(',').map(r => r.trim());
        const approach = document.getElementById('approach').value;
        const altimeter = document.getElementById('altimeter').value;
        const infoLetter = document.getElementById('infoLetter').value;
        const notams = document.getElementById('notams').value;

        // Generate wind conditions
        const wind = generateWind();

        // Format runways
        const formattedDepRunways = depRunways.map(formatRunway).join(', ');
        const formattedArrRunways = arrRunways.map(formatRunway).join(', ');

        // Get phonetic name for information letter
        const phoneticLetter = getPhoneticName(infoLetter);

        // Generate ATIS text with Discord username
        const atisText = `@${discordUsername}

${airportName} Information ${phoneticLetter}
${time} Zulu

${wind}
QNH ${altimeter}

${approach === 'Simultaneous' ? 'Simultaneous ILS and visual approaches in use.' : `${approach} approaches in use.`}

Departing ${formattedDepRunways}
Landing ${formattedArrRunways}

${notams ? `${notams}\n` : ''}Advise controller on initial contact that you have Information ${phoneticLetter}.`;

        // Display the generated ATIS
        const outputDiv = document.getElementById('atisOutput');
        outputDiv.textContent = atisText;

        // Enable audio button
        audioBtn.disabled = false;
    });

    // Add click event listener for audio button
    audioBtn.addEventListener('click', function() {
        const atisText = document.getElementById('atisOutput').textContent;
        speakATIS(atisText);
    });
}); 