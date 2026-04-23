// Simple user preferences logic matching engine 
const currentUserPrefs = {
  ageMin: 22,
  ageMax: 30,
  dealbreakers: ["Smoking", "Cats"],
  interests: ["Coffee", "Web3", "Travel", "Tech", "Foodie", "Fitness"]
};

class MatchingEngine {
  static scoreProfile(profile, prefs) {
    let score = 50; // base score

    // Age proximity
    if (profile.age >= prefs.ageMin && profile.age <= prefs.ageMax) {
      score += 15;
    } else {
      score -= Math.abs(profile.age - 26) * 2; // Penalize for age difference from arbitrary user age
    }

    // Shared interests heavily weighted
    let sharedInterestsCount = 0;
    profile.interests.forEach(interest => {
      if (prefs.interests.includes(interest)) {
        score += 10;
        sharedInterestsCount++;
      }
    });

    // Ghost Score weighting (A lower ghost score is much better)
    // score penalty = raw ghost score because 1% ghost means basically full points!
    score -= profile.ghostScore;

    // Cap score at 99%
    if (score > 99) score = 99;
    if (score < 1) score = 1;

    return {
      profile: profile,
      score: score,
      sharedInterestsCount: sharedInterestsCount
    };
  }

  static getTopMatches() {
    if (!window.DEMO_USERS) {
      console.error("No DEMO_USERS found. Ensure users.js is loaded first.");
      return [];
    }

    const matches = window.DEMO_USERS.map(user => this.scoreProfile(user, currentUserPrefs));
    
    // Sort descending by score
    matches.sort((a, b) => b.score - a.score);
    
    return matches;
  }
}
