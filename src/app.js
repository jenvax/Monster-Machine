const modeButtons = document.querySelectorAll("[data-mode-button]");
const modeHelper = document.querySelector("#modeHelper");
const rollButton = document.querySelector("#rollButton");
const rollOneMonsterButton = document.querySelector("#rollOneMonsterButton");
const rollTwoMonsterButton = document.querySelector("#rollTwoMonsterButton");
const generatorControls = document.querySelector(".production-controls");
const generatorDeck = document.querySelector("#generatorDeck");
const drawingPrompt = document.querySelector("#drawingPrompt");

const TWO_MONSTER_CHANCE = 0.78;
const PROP_CHANCE = 0.45;

const appState = {
  mode: "make",
  hasGenerated: {
    make: false,
    mash: false,
  },
  selections: {
    make: {},
    mash: {},
  },
  locked: {
    mash: {
      monsterOne: false,
      monsterTwo: false,
    },
  },
};

function pickRandom(options) {
  return options[Math.floor(Math.random() * options.length)];
}

function phraseSlug(value) {
  return value.toLowerCase().replaceAll(" & ", " and ");
}

function selectedValue(category) {
  return appState.selections[appState.mode][category.id] || "Not picked yet";
}

function makeCategories() {
  return MAKE_OPTIONS.categories;
}

function mashCategories() {
  return EXPERIMENT_CATEGORIES.filter((category) => {
    const mashSelections = appState.selections.mash;

    if (category.id === "monsterTwo") {
      return !appState.hasGenerated.mash || Boolean(mashSelections.monsterTwo);
    }

    if (category.optional) {
      return !appState.hasGenerated.mash || Boolean(mashSelections[category.id]);
    }

    return true;
  });
}

function currentCategories() {
  return appState.mode === "make" ? makeCategories() : mashCategories();
}

function monsterOptionsExcluding(excludedMonster) {
  return EXPERIMENT_OPTIONS.monsters.filter((monster) => monster !== excludedMonster);
}

function shouldIncludeSecondMonster() {
  return Math.random() < TWO_MONSTER_CHANCE;
}

function shouldIncludeProp() {
  return Math.random() < PROP_CHANCE;
}

function setMode(mode) {
  appState.mode = mode;
  modeButtons.forEach((button) => {
    const isSelected = button.dataset.modeButton === mode;
    button.classList.toggle("active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  modeHelper.textContent =
    mode === "make"
      ? "Build a monster one playful decision at a time."
      : "Combine two creatures, then push the weirdness.";
  rollButton.textContent = appState.hasGenerated[mode]
    ? "ROLL ANOTHER MONSTER"
    : "ROLL MONSTER";
  rollOneMonsterButton.hidden = mode !== "mash";
  rollTwoMonsterButton.hidden = mode !== "mash";
  generatorControls.dataset.mode = mode;
  render();
}

function rollMakeCategory(category) {
  appState.selections.make[category.id] = pickRandom(category.options);
}

function rollMakeAll() {
  MAKE_OPTIONS.categories.forEach(rollMakeCategory);
}

function rollMashMonsterOne() {
  const mashSelections = appState.selections.mash;
  mashSelections.monsterOne = pickRandom(
    monsterOptionsExcluding(mashSelections.monsterTwo),
  );
}

function rollMashMonsterTwo() {
  const mashSelections = appState.selections.mash;
  mashSelections.monsterTwo = pickRandom(
    monsterOptionsExcluding(mashSelections.monsterOne),
  );
}

function rollMashCategory(category) {
  const mashSelections = appState.selections.mash;

  if (category.id === "monsterOne") {
    rollMashMonsterOne();
    return;
  }

  if (category.id === "monsterTwo") {
    rollMashMonsterTwo();
    return;
  }

  if (category.id === "prop") {
    mashSelections.prop = shouldIncludeProp()
      ? pickRandom(EXPERIMENT_OPTIONS.props)
      : "";
    return;
  }

  mashSelections[category.id] = pickRandom(EXPERIMENT_OPTIONS[category.optionsKey]);
}

function rollMashAll() {
  const mashSelections = appState.selections.mash;
  const useSecondMonster = shouldIncludeSecondMonster();

  if (!appState.locked.mash.monsterOne) {
    mashSelections.monsterOne = pickRandom(EXPERIMENT_OPTIONS.monsters);
  }

  if (useSecondMonster) {
    if (!appState.locked.mash.monsterTwo) {
      rollMashMonsterTwo();
    }
  } else if (!appState.locked.mash.monsterTwo) {
    mashSelections.monsterTwo = "";
  }

  ["exaggerate", "oddity", "mayhem", "prop"].forEach((id) => {
    const category = EXPERIMENT_CATEGORIES.find((item) => item.id === id);
    rollMashCategory(category);
  });
}

function rollCurrentCategory(category) {
  if (appState.mode === "make") {
    rollMakeCategory(category);
  } else {
    rollMashCategory(category);
  }

  appState.hasGenerated[appState.mode] = true;
  rollButton.textContent = "ROLL ANOTHER MONSTER";
  render();
}

function rollCurrentAll() {
  if (appState.mode === "make") {
    rollMakeAll();
  } else {
    rollMashAll();
  }

  appState.hasGenerated[appState.mode] = true;
  rollButton.textContent = "ROLL ANOTHER MONSTER";
  render();
}

function forceOneMonsterMash() {
  if (!appState.hasGenerated.mash) {
    rollMashAll();
  }

  appState.selections.mash.monsterTwo = "";
  appState.locked.mash.monsterTwo = false;
  appState.hasGenerated.mash = true;
  rollButton.textContent = "ROLL ANOTHER MONSTER";
  render();
}

function forceTwoMonsterMash() {
  if (!appState.hasGenerated.mash) {
    rollMashAll();
  }

  const mashSelections = appState.selections.mash;

  if (!appState.locked.mash.monsterOne || !mashSelections.monsterOne) {
    mashSelections.monsterOne = pickRandom(
      monsterOptionsExcluding(mashSelections.monsterTwo),
    );
  }

  if (!appState.locked.mash.monsterTwo || !mashSelections.monsterTwo) {
    rollMashMonsterTwo();
  }

  appState.hasGenerated.mash = true;
  rollButton.textContent = "ROLL ANOTHER MONSTER";
  render();
}

function toggleMonsterLock(category) {
  appState.locked.mash[category.id] = !appState.locked.mash[category.id];
  render();
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

function combinedMonsterName() {
  const { monsterOne, monsterTwo } = appState.selections.mash;
  return monsterTwo ? `${monsterOne}-${monsterTwo}` : monsterOne;
}

function buildMakePrompt() {
  if (!appState.hasGenerated.make) {
    return "Roll a monster to reveal your creative recipe.";
  }

  return "Start with the shape, add the face and feature, then push the exaggeration until the personality starts to show.";
}

function buildMashPrompt() {
  if (!appState.hasGenerated.mash) {
    return "Roll a monster mash to reveal the drawing prompt.";
  }

  const { exaggerate, oddity, mayhem, prop } = appState.selections.mash;
  const optionalProp = prop ? `, with ${propPhrase(prop)} nearby` : "";
  return `Draw a ${combinedMonsterName()} ${oddityPhrase(oddity)}. Exaggerate the ${phraseSlug(exaggerate)}. Show it ${mayhemPhrase(mayhem)}${optionalProp}.`;
}

function renderPrompt() {
  drawingPrompt.textContent =
    appState.mode === "make" ? buildMakePrompt() : buildMashPrompt();
}

function renderCard(category) {
  const card = document.createElement("article");
  card.className = "experiment-card";
  card.dataset.category = category.id;

  const copy = document.createElement("div");
  copy.className = "prompt-copy";

  const label = document.createElement("p");
  label.className = "prompt-label";
  label.textContent = category.label;

  const value = document.createElement("p");
  value.className = appState.hasGenerated[appState.mode]
    ? "experiment-value"
    : "experiment-value empty";
  value.textContent = selectedValue(category);

  copy.append(label, value);

  const controls = document.createElement("div");
  controls.className = "card-actions";

  if (
    appState.mode === "mash" &&
    (category.id === "monsterOne" || category.id === "monsterTwo") &&
    appState.hasGenerated.mash &&
    appState.selections.mash[category.id]
  ) {
    const lockButton = document.createElement("button");
    lockButton.className = "mini-button";
    lockButton.type = "button";
    lockButton.textContent = appState.locked.mash[category.id] ? "UNLOCK" : "LOCK";
    lockButton.setAttribute("aria-pressed", String(appState.locked.mash[category.id]));
    lockButton.addEventListener("click", () => toggleMonsterLock(category));
    controls.append(lockButton);
  }

  const shuffleButton = document.createElement("button");
  shuffleButton.className = "icon-button";
  shuffleButton.type = "button";
  shuffleButton.disabled = !appState.hasGenerated[appState.mode];
  shuffleButton.setAttribute("aria-label", `Shuffle ${category.label}`);
  shuffleButton.title = `Shuffle ${category.label}`;
  shuffleButton.textContent = "↻";
  shuffleButton.addEventListener("click", () => rollCurrentCategory(category));
  controls.append(shuffleButton);

  card.append(copy, controls);
  return card;
}

function render() {
  generatorDeck.replaceChildren(...currentCategories().map(renderCard));
  generatorDeck.dataset.mode = appState.mode;
  renderPrompt();
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.modeButton));
});

rollButton.addEventListener("click", rollCurrentAll);
rollOneMonsterButton.addEventListener("click", forceOneMonsterMash);
rollTwoMonsterButton.addEventListener("click", forceTwoMonsterMash);

setMode("make");
