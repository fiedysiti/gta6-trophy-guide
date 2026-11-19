// Sunset Platinum — shared constants for the guide app.
//
// One file, one job: every magic string the views and the store agree on
// lives here, so a rename touches exactly one place.

export const STORAGE_KEY = 'sunset-platinum-progress-v1';
export const SETTINGS_KEY = 'sunset-platinum-settings-v1';

export const EXOPHASE_URL = 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/';
export const PSNPROFILES_URL = 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi';

export const TOTAL_TROPHIES = 55;

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
};

export const DIFFICULTY_ORDER = { Easy: 0, Medium: 1, Hard: 2, Grind: 3 };
export const DIFFICULTY_LABELS = ['Easy', 'Medium', 'Hard', 'Grind'];

// Roadmap stages, in the order a player should work through them. Each
// stage names only what the official trophy descriptions name — no mission
// is assigned to a chapter the descriptions do not give it.
export const ROADMAP_STAGES = [
  {
    id: 'story',
    title: 'Play the story — chapters 1 to 4 and the finale',
    blurb: 'The backbone of the platinum. Finish Gone Fishing, then each chapter in turn, then the final mission. Story trophies cannot be missed by playing through.',
    trophyIds: [2, 3, 4, 5, 6, 7],
  },
  {
    id: 'missions',
    title: 'Named story missions, as they appear',
    blurb: 'Six missions carry their own trophies. Do each one carefully on your first pass — there is no confirmed mission replay at launch.',
    trophyIds: [8, 9, 10, 11, 12, 13],
  },
  {
    id: 'strangers',
    title: 'Stranger strands — Andy, Kenton, Billy, Randy, Tyrone, Bret',
    blurb: 'Finish each stranger\'s final mission, then complete 8 strands in total. Bret\'s hunt is the one that needs a specific animal.',
    trophyIds: [22, 23, 24, 26, 27, 29, 25],
  },
  {
    id: 'activities',
    title: 'Activities, skills and one-off moments',
    blurb: 'Races, the shooting range, fishing, the arcade, stunts, Combat Focus, wanted-level escapes and the small flavour moments — most of it repeatable, so it fits anywhere after the story.',
    trophyIds: [16, 20, 21, 18, 19, 15, 17, 36, 33, 34, 37, 38, 39, 41, 28, 32, 44, 45, 46, 47, 48, 49, 50, 51],
  },
  {
    id: 'collectibles',
    title: 'Collectibles, exploration and money',
    blurb: 'Cards, WAiNK spots, vehicles, the whole map of Leonida, bank vaults, gang operations, and the big spends. The long tail — chip away at it while you play.',
    trophyIds: [30, 31, 35, 42, 43, 40, 52, 53, 54, 55],
  },
  {
    id: 'cleanup',
    title: 'Cleanup — 100% completion, then the platinum',
    blurb: 'Attain 100% Completion and the platinum pops with it. Check the in-game completion tracker for whatever is left.',
    trophyIds: [14, 1],
  },
];
