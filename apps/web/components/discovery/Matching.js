/* USER PREFERENCES */

const userPreferences = {

ageMin: 22,
ageMax: 30,

interests: [
"Travel",
"Fitness",
"Tech"
],

dealbreakers: [
"Smoking"
]

};

/* SAMPLE PROFILES */

const profiles = [

{
name: "Jordan",
age: 27,
interests: ["Travel","Art","Tech"],
traits: ["Non-Smoker"]
},

{
name: "Taylor",
age: 25,
interests: ["Fitness","Food","Travel"],
traits: ["Non-Smoker"]
},

{
name: "Casey",
age: 31,
interests: ["Gaming","Tech"],
traits: ["Smoker"]
},

{
name: "Alex",
age: 26,
interests: ["Fitness","Tech"],
traits: ["Non-Smoker"]
}

];

/* MATCHING ENGINE */

/** Standalone browser demo; not wired into the Next app. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for static HTML demo
function runMatching() {

const results = [];

profiles.forEach(profile => {

let score = 0;

/* AGE MATCH */

if (
profile.age >= userPreferences.ageMin &&
profile.age <= userPreferences.ageMax
) {

score += 30;

}

/* INTEREST MATCH */

profile.interests.forEach(interest => {

if (
userPreferences.interests.includes(interest)
) {

score += 15;

}

});

/* DEALBREAKER CHECK */

profile.traits.forEach(trait => {

if (
trait === "Smoker" &&
userPreferences.dealbreakers.includes("Smoking")
) {

score -= 40;

}

});

/* SAVE RESULT */

results.push({

name: profile.name,
score: score

});

});

/* SORT BEST MATCHES */

results.sort((a,b) =>
b.score - a.score
);

/* DISPLAY MATCHES */

const list =
document.getElementById("match-list");

list.innerHTML = "";

results.forEach(match => {

const div =
document.createElement("div");

div.classList.add("match-item");

div.textContent =
match.name +
" — " +
match.score +
"% Match";

list.appendChild(div);

});

}