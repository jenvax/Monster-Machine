const monsterGrid = document.querySelector("#monsterGrid");
const mayhemSlot = document.querySelector("#mayhemSlot");
const makeMonsterButton = document.querySelector("#makeMonsterButton");
const rerollMonsterButton = document.querySelector("#rerollMonsterButton");
const rerollMayhemButton = document.querySelector("#rerollMayhemButton");

const state = {
  hasGenerated: false,
  selections: {},
};

function randomOption(options) {
  return options[Math.floor(Math.random() * options.length)];
}

function randomizeCategory(category) {
  state.selections[category.id] = randomOption(category.options);
}

function randomizeMonster() {
  MONSTER_CATEGORIES.forEach(randomizeCategory);
}

function randomizeMayhem() {
  randomizeCategory(MAYHEM_CATEGORY);
}

function displayValue(category) {
  return state.selections[category.id] || "Not picked yet";
}

function setGenerated() {
  state.hasGenerated = true;
  makeMonsterButton.textContent = "MAKE ANOTHER MONSTER";
  rerollMonsterButton.disabled = false;
  rerollMayhemButton.disabled = false;
}

function renderMonsterCategory(category) {
  const item = document.createElement("article");
  item.className = "prompt-item";

  const copy = document.createElement("div");
  copy.className = "prompt-copy";

  const label = document.createElement("p");
  label.className = "prompt-label";
  label.textContent = category.resultLabel;

  const value = document.createElement("p");
  value.className = state.selections[category.id] ? "prompt-value" : "prompt-value empty";
  value.textContent = displayValue(category);

  copy.append(label, value);

  const button = document.createElement("button");
  button.className = "icon-button";
  button.type = "button";
  button.disabled = !state.hasGenerated;
  button.setAttribute("aria-label", `Shuffle ${category.label}`);
  button.title = `Shuffle ${category.label}`;
  button.textContent = "↻";
  button.addEventListener("click", () => {
    randomizeCategory(category);
    setGenerated();
    render();
  });

  item.append(copy, button);
  return item;
}

function renderMayhem() {
  const item = document.createElement("article");
  item.className = "mayhem-item";

  const value = document.createElement("p");
  value.className = state.selections[MAYHEM_CATEGORY.id]
    ? "mayhem-value"
    : "mayhem-value empty";
  value.textContent = displayValue(MAYHEM_CATEGORY);

  const button = document.createElement("button");
  button.className = "icon-button mayhem-shuffle";
  button.type = "button";
  button.disabled = !state.hasGenerated;
  button.setAttribute("aria-label", "Shuffle Spooky Thing");
  button.title = "Shuffle Spooky Thing";
  button.textContent = "↻";
  button.addEventListener("click", () => {
    randomizeMayhem();
    setGenerated();
    render();
  });

  item.append(value, button);
  return item;
}

function render() {
  monsterGrid.replaceChildren(...MONSTER_CATEGORIES.map(renderMonsterCategory));
  mayhemSlot.replaceChildren(renderMayhem());
}

makeMonsterButton.addEventListener("click", () => {
  randomizeMonster();
  randomizeMayhem();
  setGenerated();
  render();
});

rerollMonsterButton.addEventListener("click", () => {
  randomizeMonster();
  setGenerated();
  render();
});

rerollMayhemButton.addEventListener("click", () => {
  randomizeMayhem();
  setGenerated();
  render();
});

render();
