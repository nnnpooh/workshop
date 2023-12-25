// Init variables
let weightTxt = "";
let ageTxt = "";
let heightTxt = "";

// Get elements
const inputWeight = document.getElementById("weight");
const inputAge = document.getElementById("age");
const inputHeight = document.getElementById("height");
const btnPredict = document.getElementById("predict");
const results = document.getElementById("results");
const r1 = document.getElementById("r1");
const r2 = document.getElementById("r2");
const r3 = document.getElementById("r3");
const err = document.getElementById("error");

// Add event listeners for change
inputWeight.addEventListener("change", handleChange);
inputAge.addEventListener("change", handleChange);
inputHeight.addEventListener("change", handleChange);

// Add event listeners during typing
inputWeight.addEventListener("input", handleInput);
inputAge.addEventListener("input", handleInput);
inputHeight.addEventListener("input", handleInput);

// Disable inputs
inputWeight.setAttribute("disabled", "");
inputAge.setAttribute("disabled", "");
inputHeight.setAttribute("disabled", "");
btnPredict.setAttribute("disabled", "");

// Hide results
err.style.display = "none";
results.style.display = "none";

// Styling
err.style.color = "red";

// Load model and enable inputs
load_model()
  .then((model) => {
    model = model;
    console.log("Model loaded");
    inputWeight.removeAttribute("disabled");
    inputAge.removeAttribute("disabled");
    inputHeight.removeAttribute("disabled");
    btnPredict.removeAttribute("disabled");
    btnPredict.addEventListener("click", () => handleClick(model));
  })
  .catch((err) => {
    console.log(err);
  });

async function load_model() {
  const MODEL_URL = "model/model.json";
  const model = await tf.loadGraphModel(MODEL_URL);
  return model;
}

function handleInput(e) {
  err.style.display = "none";
  results.style.display = "none";
}

function handleChange(e) {
  if (e.target.id === "weight") weightTxt = e.target.value;
  if (e.target.id === "age") ageTxt = e.target.value;
  if (e.target.id === "height") heightTxt = e.target.value;
}

function handleClick(model) {
  if (!model) {
    console.log("Model not loaded");
    return;
  }
  console.log("Predicting", { weightTxt, ageTxt, heightTxt });
  const weight = parseFloat(weightTxt);
  const age = parseFloat(ageTxt);
  const height = parseFloat(heightTxt);
  const disabled = isNaN(weight) || isNaN(age) || isNaN(height);
  if (disabled) {
    err.style.display = "block";
    console.log("Invalid input");
    return;
  }
  const input = tf.tensor1d([weight, age, height]).reshape([-1, 3]);
  const output = model.predict(input).dataSync();
  const of = formatPrediction(output);
  console.log({ of });

  results.style.display = "block";
  [r1, r2, r3].forEach((r, idx) => {
    const size = of[idx].size;
    const prob = (of[idx].prob * 100).toFixed(2);
    r.textContent = `Size ${size} (มั่นใจ ${prob}%)`;
  });
}

function formatPrediction(pred) {
  const mapSize = {
    0: "XXS",
    1: "S",
    2: "M",
    3: "L",
    4: "XL",
    5: "XXL",
    6: "XXXL",
  };

  if (pred.length !== 7) return null;

  const outArr = [];
  pred.forEach((p, i) => {
    outArr.push({ prob: p, idx: i, size: mapSize[i] });
  });
  outArr.sort((a, b) => b.prob - a.prob);
  return outArr;
}
