const experimentDeck = document.querySelector("#experimentDeck");
const makeExperimentButton = document.querySelector("#makeExperimentButton");
const monsterCombo = document.querySelector("#monsterCombo");
const drawingPrompt = document.querySelector("#drawingPrompt");

const experimentState = {
  hasGenerated: false,
  selections: {},
};

const TWO_MONSTER_CHANCE = 0.78;
const PROP_CHANCE = 0.45;

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

  if (category.id === "prop") {
    experimentState.selections.prop = shouldIncludeProp()
      ? pickRandom(EXPERIMENT_OPTIONS.props)
      : "";
    return;
  }

  experimentState.selections[category.id] = pickRandom(
    EXPERIMENT_OPTIONS[category.optionsKey],
  );
}

function shouldIncludeSecondMonster() {
  return Math.random() < TWO_MONSTER_CHANCE;
}

function shouldIncludeProp() {
  return Math.random() < PROP_CHANCE;
}

function randomizeExperiment() {
  const monsterOne = pickRandom(EXPERIMENT_OPTIONS.monsters);
  const monsterTwo = shouldIncludeSecondMonster()
    ? pickRandom(monsterOptionsExcluding(monsterOne))
    : "";

  experimentState.selections = {
    monsterOne,
    monsterTwo,
    exaggerate: pickRandom(EXPERIMENT_OPTIONS.exaggerations),
    oddity: pickRandom(EXPERIMENT_OPTIONS.oddities),
    mayhem: pickRandom(EXPERIMENT_OPTIONS.mayhem),
    prop: shouldIncludeProp() ? pickRandom(EXPERIMENT_OPTIONS.props) : "",
  };
}

function phraseSlug(value) {
  return value.toLowerCase().replaceAll(" & ", " and ");
}

function oddityPhrase(oddity) {
  return `with ${phraseSlug(oddity)}`;
}

function mayhemPhrase(mayhem) {
  const lowerMayhem = phraseSlug(mayhem);

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

function propPhrase(prop) {
  const lowerProp = phraseSlug(prop);
  const article = /^[aeiou]/.test(lowerProp) ? "an" : "a";
  return `${article} ${lowerProp}`;
}

function selectedValue(category) {
  return experimentState.selections[category.id] || "Not picked yet";
}

function combinedMonsterName() {
  const { monsterOne, monsterTwo } = experimentState.selections;
  return monsterTwo ? `${monsterOne}-${monsterTwo}` : monsterOne;
}

function comboParts() {
  const { monsterOne, monsterTwo, exaggerate, oddity, mayhem, prop } =
    experimentState.selections;
  return [
    monsterOne,
    monsterTwo,
    `Exaggerate ${exaggerate}`,
    oddity,
    mayhem,
    prop,
  ].filter(Boolean);
}

function buildDrawingPrompt() {
  const { exaggerate, oddity, mayhem, prop } = experimentState.selections;
  const optionalProp = prop ? `, with ${propPhrase(prop)} nearby` : "";
  return `Draw a ${combinedMonsterName()} ${oddityPhrase(oddity)}. Exaggerate the ${phraseSlug(exaggerate)}. Show it ${mayhemPhrase(mayhem)}${optionalProp}.`;
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

  monsterCombo.textContent = comboParts().join(" + ");
  drawingPrompt.textContent = buildDrawingPrompt();
}

function renderExperiment() {
  const visibleCategories = EXPERIMENT_CATEGORIES.filter((category) => {
    if (category.id === "monsterTwo" || category.optional) {
      return !experimentState.hasGenerated || Boolean(experimentState.selections[category.id]);
    }

    return true;
  });

  experimentDeck.replaceChildren(
    ...visibleCategories.map(renderExperimentCard),
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
