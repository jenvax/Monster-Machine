const experimentDeck = document.querySelector("#experimentDeck");
const makeExperimentButton = document.querySelector("#makeExperimentButton");
const monsterCombo = document.querySelector("#monsterCombo");
const drawingPrompt = document.querySelector("#drawingPrompt");

const experimentState = {
  hasGenerated: false,
  selections: {},
};

function pickRandom(options) {
  return options[Math.floor(Math.random() * options.length)];
}

function monsterOptionsExcluding(excludedMonster) {
  return EXPERIMENT_OPTIONS.monsters.filter((monster) => monster !== excludedMonster);
}

function randomizeExperimentCategory(category) {
  if (category.id === "monsterOne") {
    experimentState.selections.monsterOne = pickRandom(
      monsterOptionsExcluding(experimentState.selections.monsterTwo),
    );
    return;
  }

  if (category.id === "monsterTwo") {
    experimentState.selections.monsterTwo = pickRandom(
      monsterOptionsExcluding(experimentState.selections.monsterOne),
    );
    return;
  }

  experimentState.selections[category.id] = pickRandom(
    EXPERIMENT_OPTIONS[category.optionsKey],
  );
}

function randomizeExperiment() {
  const monsterOne = pickRandom(EXPERIMENT_OPTIONS.monsters);
  const monsterTwo = pickRandom(monsterOptionsExcluding(monsterOne));

  experimentState.selections = {
    monsterOne,
    monsterTwo,
    look: pickRandom(EXPERIMENT_OPTIONS.looks),
    twist: pickRandom(EXPERIMENT_OPTIONS.twists),
    mayhem: pickRandom(EXPERIMENT_OPTIONS.mayhem),
  };
}

function lowerFirst(value) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function phraseSlug(value) {
  return value.toLowerCase().replaceAll(" & ", " and ");
}

function twistPhrase(twist) {
  const wearableTwists = [
    "Giant Glasses",
    "Huge Teeth",
    "Tiny Wings",
    "Curly Horns",
    "Long Tongue",
    "Crown",
    "Bow Tie",
    "Boots",
    "Giant Eyebrows",
    "One Giant Eye",
  ];

  if (wearableTwists.includes(twist)) {
    return `with ${phraseSlug(twist)}`;
  }

  return `who is unusually ${phraseSlug(twist)}`;
}

function mayhemPhrase(mayhem) {
  const lowerMayhem = lowerFirst(mayhem);

  if (
    mayhem.startsWith("Tangled") ||
    mayhem.startsWith("Covered") ||
    mayhem.startsWith("Surrounded") ||
    mayhem.startsWith("Chased") ||
    mayhem.startsWith("Being") ||
    mayhem.startsWith("Standing")
  ) {
    return lowerMayhem;
  }

  return `with ${lowerMayhem}`;
}

function selectedValue(category) {
  return experimentState.selections[category.id] || "Not picked yet";
}

function combinedMonsterName() {
  const { monsterOne, monsterTwo } = experimentState.selections;
  return `${monsterOne}-${monsterTwo}`;
}

function buildDrawingPrompt() {
  const { look, twist, mayhem } = experimentState.selections;
  return `Draw a ${phraseSlug(look)} ${combinedMonsterName()} ${twistPhrase(twist)}, ${mayhemPhrase(mayhem)}.`;
}

function renderExperimentCard(category) {
  const card = document.createElement("article");
  card.className = "experiment-card";

  const copy = document.createElement("div");
  copy.className = "prompt-copy";

  const label = document.createElement("p");
  label.className = "prompt-label";
  label.textContent = category.label;

  const value = document.createElement("p");
  value.className = experimentState.selections[category.id]
    ? "experiment-value"
    : "experiment-value empty";
  value.textContent = selectedValue(category);

  copy.append(label, value);

  const button = document.createElement("button");
  button.className = "icon-button";
  button.type = "button";
  button.disabled = !experimentState.hasGenerated;
  button.setAttribute("aria-label", `Shuffle ${category.label}`);
  button.title = `Shuffle ${category.label}`;
  button.textContent = "↻";
  button.addEventListener("click", () => {
    randomizeExperimentCategory(category);
    experimentState.hasGenerated = true;
    renderExperiment();
  });

  card.append(copy, button);
  return card;
}

function renderResult() {
  if (!experimentState.hasGenerated) {
    monsterCombo.textContent = "Not picked yet";
    drawingPrompt.textContent = "Make a monster to reveal the drawing prompt.";
    return;
  }

  const { monsterOne, monsterTwo, look, twist, mayhem } = experimentState.selections;
  monsterCombo.textContent = `${monsterOne} + ${monsterTwo} + ${look} + ${twist} + ${mayhem}`;
  drawingPrompt.textContent = buildDrawingPrompt();
}

function renderExperiment() {
  experimentDeck.replaceChildren(
    ...EXPERIMENT_CATEGORIES.map(renderExperimentCard),
  );
  renderResult();
}

makeExperimentButton.addEventListener("click", () => {
  randomizeExperiment();
  experimentState.hasGenerated = true;
  makeExperimentButton.textContent = "MAKE ANOTHER MONSTER";
  renderExperiment();
});

renderExperiment();
