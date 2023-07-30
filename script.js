// The rest of your existing code...

const URL = "./";
const TIMER_DURATION = 30;

let model, webcam, labelContainer, maxPredictions;
let countdown = TIMER_DURATION;
let timerId;
const words = [   ['A', 'B', 'C'],
                ['A', 'C', 'B'],
                ['B', 'A', 'C'],
                ['B', 'C', 'A'],
                ['C', 'A', 'B'],
                ['C', 'B', 'A']
            ]

const randInd = Math.floor(Math.random() * words.length);
const word = words[randInd];

async function init() {
    
    const title = document.getElementById("title");
    title.style.display = "none";
    const hideButton = document.getElementById("start-btn");
    hideButton.style.display = "none";

    displayWord();

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    
    // Setup webcam
    const flip = true; // Whether to flip the webcam
    webcam = new tmImage.Webcam(500, 500, flip); // Width, height, flip
    await webcam.setup(); // Request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);
    // Append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
    const info = document.getElementById("info");
    info.style.display = "flex";
    startTimer();
}

function displayWord() {
    let completeWord = "";
    for (let i = 0; i < word.length; i++) {
        completeWord += word[i];
    }
    const letters = document.getElementById("letters");
    letters.innerHTML = completeWord;
    const textContent = letters.textContent.trim();

    // Clear the content of the div element
    letters.innerHTML = '';

    // Wrap each letter in a <span> element and apply styles
    for (let i = 0; i < textContent.length; i++) {
        const letter = textContent[i];
        const spanElement = document.createElement('span');
        spanElement.textContent = letter;
        // spanElement.style.color = "green";
        letters.appendChild(spanElement);
    }
}

function startTimer() {
    countdown = TIMER_DURATION;
    timerId = setInterval(updateTimer, 1000); // Update the timer every second
}

function updateTimer() {
    countdown--;
    if (countdown <= 0) {
        clearInterval(timerId); // Stop the timer
        labelContainer.innerHTML = "Time's up!"; // Display the message
    }
    displayTime();
}

function displayTime() {
    const timerContainer = document.getElementById("timer");
    timerContainer.style.color = "#32A432";
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    timerContainer.innerHTML = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    if (seconds < 10) {
        timerContainer.style.color = "red";
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    if (countdown <= 0) {
        clearInterval(timerId); // Stop the timer
        labelContainer.innerHTML = "Time's up!"; // Display the message
    }
    // predict can take in an image, video, or canvas HTML element
    const prediction = await model.predict(webcam.canvas);

    // Find the class with the highest probability
    let maxProbability = 0;
    let maxPredictionIndex = 0;
    for (let i = 0; i < maxPredictions; i++) {
        const probability = prediction[i].probability;
        if (probability > maxProbability) {
            maxProbability = probability;
            maxPredictionIndex = i;
        }
    }
    // Display only the maximum prediction
    const maxPrediction = prediction[maxPredictionIndex];
    const classPrediction = "Letter: " + maxPrediction.className;
    labelContainer.innerHTML = classPrediction;
    const letters = document.getElementById("letters");
    const spans = letters.getElementsByTagName("span");
    // for (let i = 0; i < spans.length; i++) {
    //     if (maxPrediction.className === spans[i].textContent) {
    //         if (spans[i].style.color !== "green") {
    //             spans[i].style.color = "green";
    //             break;
    //         };
    //     }
    // }
    
    if (maxPrediction.className === getCurrentLetter().textContent) {
        getCurrentLetter().style.color = "green";
    }

}

function getCurrentLetter() {
    const letters = document.getElementById("letters");
    const spans = letters.getElementsByTagName("span");
    for (let i = 0; i < spans.length; i++) {
        if (spans[i].style.color !== "green") {
            return spans[i];
        }
    }
}
