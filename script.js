const distances = [50, 100, 200, 400, 800, 1500];
const buttonsContainer = document.getElementById('buttons-container');
const calculatorContainer = document.getElementById('calculator-container');

distances.forEach(distance => {
    const button = document.createElement('button');
    button.textContent = `${distance}m`;
    button.style.padding = '10px';
    button.style.margin = '5px';
    button.style.color = 'white';
    button.style.backgroundColor = 'blue';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.addEventListener('click', () => showCalculator(distance));
    buttonsContainer.appendChild(button);
});

function showCalculator(distance) {
    calculatorContainer.innerHTML = `
        <h2>Calculate Lap Time for ${distance}m</h2>
        ${generateSplitInputs(distance)}
        <div class="total-time">
            <label for="total-time">Total Time (mm:ss.ss or ss.ss):</label>
            <input type="text" id="total-time" inputmode="numeric" pattern="[0-9]*">
        </div>
        <input type="button" value="Calculate Lap Times" onclick="calculateLapTimes(${distance})" style="background-color: blue; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer;">
        <div id="lap-times"></div>
    `;
}

function generateSplitInputs(distance) {
    let html = '';
    const numberOfSplits = Math.floor(distance / 50) - 1;
    for (let i = 0; i < numberOfSplits; i++) {
        html += `
            <div class="split-time">
                <label for="split-time-${i + 1}">${50 * (i + 1)}m Split Time (mm:ss.ss or ss.ss):</label>
                <input type="text" id="split-time-${i + 1}" inputmode="numeric" pattern="[0-9]*">
            </div>
        `;
    }
    return html;
}

function formatTimeString(timeString) {
    const cleanedString = timeString.replace(/[^0-9]/g, '');
    const length = cleanedString.length;
    switch (length) {
        case 4:
            return `${cleanedString.substring(0, 2)}.${cleanedString.substring(2, 4)}`;
        case 5:
            return `${cleanedString.substring(0, 1)}:${cleanedString.substring(1, 3)}.${cleanedString.substring(3, 5)}`;
        case 6:
            return `${cleanedString.substring(0, 2)}:${cleanedString.substring(2, 4)}.${cleanedString.substring(4, 6)}`;
        default:
            return timeString;
    }
}

function convertToSeconds(timeString) {
    if (timeString === '') return 0.0;

    const formattedTime = formatTimeString(timeString);
    const components = formattedTime.split(':');
    if (components.length === 2) {
        const minutes = parseFloat(components[0]);
        const seconds = parseFloat(components[1]);
        return minutes * 60 + seconds;
    } else if (components.length === 1) {
        return parseFloat(components[0]);
    }
    return 0.0;
}

function formatTime(seconds) {
    const validSeconds = Math.max(seconds, 0.0);
    if (validSeconds >= 60) {
        const minutes = Math.floor(validSeconds / 60);
        const remainingSeconds = validSeconds % 60;
        return `${minutes}:${remainingSeconds.toFixed(2).padStart(5, '0')}`;
    } else {
        return `${validSeconds.toFixed(2)}`;
    }
}

function calculateLapTimes(distance) {
    const totalTimeString = document.getElementById('total-time').value;
    const totalTime = convertToSeconds(totalTimeString);

    let lapTimes50m = [];
    let lapTimes100m = [];
    let lapTimes200m = [];
    let cumulativeTime = 0.0;
    
    const numberOfSplits = Math.floor(distance / 50) - 1;
    for (let i = 0; i < numberOfSplits; i++) {
        const splitTimeString = document.getElementById(`split-time-${i + 1}`).value;
        const splitTime = convertToSeconds(splitTimeString);
        const lapTime = splitTime - cumulativeTime;
        lapTimes50m.push(lapTime);
        cumulativeTime = splitTime;
    }

    // Calculate last lap time
    const lastLapTime = totalTime - cumulativeTime;
    lapTimes50m.push(lastLapTime);

    // Calculate 100m lap times if applicable
    if (distance >= 100) {
        for (let i = 0; i < lapTimes50m.length; i += 2) {
            const lapTime100m = (lapTimes50m[i] || 0) + (lapTimes50m[i + 1] || 0);
            lapTimes100m.push(lapTime100m);
        }
    }

    // Calculate 200m lap times for 800m event
    if (distance === 800) {
        for (let i = 0; i < lapTimes100m.length; i += 2) {
            const lapTime200m = (lapTimes100m[i] || 0) + (lapTimes100m[i + 1] || 0);
            lapTimes200m.push(lapTime200m);
        }
    }

    displayLapTimes(distance, lapTimes50m, lapTimes100m, lapTimes200m);
}

function displayLapTimes(distance, lapTimes50m, lapTimes100m, lapTimes200m) {
    const lapTimesContainer = document.getElementById('lap-times');
    lapTimesContainer.innerHTML = '';

    let html = '<div style="display: flex; justify-content: space-around;">';
    let html50m = '<div>';
    let html100m = '<div>';
    let html200m = '<div>';

    if (distance === 50) {
        html50m += `<p class="lap-time">0m〜50m: ${formatTime(lapTimes50m[0])}</p>`;
    } else {
        for (let i = 0; i < lapTimes50m.length; i++) {
            const start = 50 * i;
            const end = 50 * (i + 1);
            html50m += `<p class="lap-time">${start}m〜${end}m: ${formatTime(lapTimes50m[i])}</p>`;
        }
    }

    if (distance >= 100) {
        for (let i = 0; i < lapTimes100m.length; i++) {
            const start = 100 * i;
            const end = 100 * (i + 1);
            html100m += `<p class="lap-time">${start}m〜${end}m: ${formatTime(lapTimes100m[i])}</p>`;
        }
    }

    if (distance === 800) {
        for (let i = 0; i < lapTimes200m.length; i++) {
            const start = 200 * i;
            const end = 200 * (i + 1);
            html200m += `<p class="lap-time">${start}m〜${end}m: ${formatTime(lapTimes200m[i])}</p>`;
        }
    }

    html50m += '</div>';
    html100m += '</div>';
    html200m += '</div>';

    html += html50m + html100m;
    if (distance === 800) {
        html += html200m;
    }
    html += '</div>';

    lapTimesContainer.innerHTML = html;
}







