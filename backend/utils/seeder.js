/**
 * utils/seeder.js
 *
 * Seeds the database with:
 * - 1 Admin user
 * - 8 Team members: Amit, Amod, Aniket, Anupama, Antara, Anuj, Anand, Ankita
 * - Sample questions across topics
 * - Badges
 * - Sample notes
 *
 * Run with: npm run seed
 * WARNING: This CLEARS all existing users, questions, badges, notes before seeding.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const { Note, Badge } = require("../models/Note");
const Question = require("../models/Question");
const { Result } = require("../models/Quiz");

// ── Team Members ───────────────────────────────────────────────
const teamMembers = [
  { name: "Amit", email: "amit@aptitude.com", password: "Team@123" },
  { name: "Amod", email: "amod@aptitude.com", password: "Team@123" },
  { name: "Aniket", email: "aniket@aptitude.com", password: "Team@123" },
  { name: "Anupama", email: "anupama@aptitude.com", password: "Team@123" },
  { name: "Antara", email: "antara@aptitude.com", password: "Team@123" },
  { name: "Anuj", email: "anuj@aptitude.com", password: "Team@123" },
  { name: "Anand", email: "anand@aptitude.com", password: "Team@123" },
  { name: "Ankita", email: "ankita@aptitude.com", password: "Team@123" },
  { name: "Kedar", email: "Kedar@aptitude.com", password: "Team@123" },
];

// ── Sample Questions ───────────────────────────────────────────
const sampleQuestions = [
  {
    questionText:
      "A shopkeeper sells an article at 20% profit. If the cost price is ₹500, find the selling price.",
    options: ["₹580", "₹600", "₹620", "₹640"],
    correctOption: 1,
    explanation:
      "Selling Price = Cost Price × (1 + Profit%/100) = 500 × 1.20 = ₹600",
    topic: "Quantitative Aptitude",
    subtopic: "Profit & Loss",
    difficulty: "Easy",
    suggestedTime: 45,
  },
  {
    questionText:
      "A train 150m long passes a pole in 15 seconds. What is the speed of the train in km/h?",
    options: ["36 km/h", "40 km/h", "54 km/h", "60 km/h"],
    correctOption: 0,
    explanation:
      "Speed = Distance/Time = 150/15 = 10 m/s = 10 × 18/5 = 36 km/h",
    topic: "Quantitative Aptitude",
    subtopic: "Speed, Time & Distance",
    difficulty: "Easy",
    suggestedTime: 60,
  },
  {
    questionText:
      "If 15 workers can complete a job in 12 days, how many days will 20 workers take?",
    options: ["7 days", "8 days", "9 days", "10 days"],
    correctOption: 2,
    explanation:
      "Workers × Days = constant. 15 × 12 = 20 × D → D = 180/20 = 9 days",
    topic: "Quantitative Aptitude",
    subtopic: "Time & Work",
    difficulty: "Medium",
    suggestedTime: 75,
  },
  {
    questionText: "What percentage of 240 is 60?",
    options: ["20%", "25%", "30%", "40%"],
    correctOption: 1,
    explanation: "(60/240) × 100 = 25%",
    topic: "Quantitative Aptitude",
    subtopic: "Percentages",
    difficulty: "Easy",
    suggestedTime: 30,
  },
  {
    questionText:
      "A sum of money doubles itself in 8 years at simple interest. Find the rate of interest per annum.",
    options: ["10%", "12%", "12.5%", "15%"],
    correctOption: 2,
    explanation: "SI = P, so P = PRT/100 → 100 = R×8 → R = 12.5%",
    topic: "Quantitative Aptitude",
    subtopic: "Simple Interest",
    difficulty: "Medium",
    suggestedTime: 60,
  },
  {
    questionText:
      "The ratio of ages of A and B is 3:5. After 10 years, the ratio becomes 5:7. What is the current age of A?",
    options: ["15 years", "20 years", "25 years", "30 years"],
    correctOption: 0,
    explanation:
      "Let A=3x, B=5x. (3x+10)/(5x+10) = 5/7 → 21x+70 = 25x+50 → 4x=20 → x=5. A=3×5=15",
    topic: "Quantitative Aptitude",
    subtopic: "Ratio & Proportion",
    difficulty: "Hard",
    suggestedTime: 90,
  },
  {
    questionText:
      "Find the compound interest on ₹8000 at 10% per annum for 2 years.",
    options: ["₹1600", "₹1680", "₹1700", "₹1750"],
    correctOption: 1,
    explanation:
      "CI = P[(1+r/100)^n - 1] = 8000[(1.1)^2 - 1] = 8000[1.21 - 1] = 8000 × 0.21 = ₹1680",
    topic: "Quantitative Aptitude",
    subtopic: "Compound Interest",
    difficulty: "Medium",
    suggestedTime: 75,
  },
  {
    questionText: "In how many ways can 5 people be arranged in a line?",
    options: ["60", "100", "120", "150"],
    correctOption: 2,
    explanation: "5! = 5 × 4 × 3 × 2 × 1 = 120",
    topic: "Quantitative Aptitude",
    subtopic: "Permutation & Combination",
    difficulty: "Easy",
    suggestedTime: 30,
  },
  {
    questionText:
      "All cats are animals. All animals are living beings. Which conclusion definitely follows?",
    options: [
      "All living beings are cats",
      "All cats are living beings",
      "Some living beings are not animals",
      "No cats are living beings",
    ],
    correctOption: 1,
    explanation:
      "By syllogism: Cats → Animals → Living beings. Therefore all cats are living beings.",
    topic: "Logical Reasoning",
    subtopic: "Syllogisms",
    difficulty: "Easy",
    suggestedTime: 45,
  },
  {
    questionText:
      "In a row of 20 students, Ravi is 8th from the left. What is his position from the right?",
    options: ["11th", "12th", "13th", "14th"],
    correctOption: 2,
    explanation:
      "Position from right = (Total + 1) - Position from left = 21 - 8 = 13th",
    topic: "Logical Reasoning",
    subtopic: "Ranking & Arrangement",
    difficulty: "Easy",
    suggestedTime: 30,
  },
  {
    questionText: "If APPLE is coded as BQQMF, how is MANGO coded?",
    options: ["NBOHI", "NBOHP", "NCOHI", "LZMFN"],
    correctOption: 1,
    explanation: "Each letter is shifted +1. M→N, A→B, N→O, G→H, O→P = NBOHP",
    topic: "Logical Reasoning",
    subtopic: "Coding-Decoding",
    difficulty: "Medium",
    suggestedTime: 60,
  },
  {
    questionText:
      "A is the father of B. B is the sister of C. C is the son of D. How is A related to D?",
    options: ["Brother", "Father-in-law", "Son-in-law", "Husband"],
    correctOption: 3,
    explanation:
      "A is father of B (daughter) and C (son). D is mother of C. So A is husband of D.",
    topic: "Logical Reasoning",
    subtopic: "Blood Relations",
    difficulty: "Medium",
    suggestedTime: 60,
  },
  {
    questionText: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    correctOption: 1,
    explanation: "Differences: 4, 6, 8, 10, 12. So next = 30 + 12 = 42",
    topic: "Logical Reasoning",
    subtopic: "Series",
    difficulty: "Easy",
    suggestedTime: 45,
  },
  {
    questionText: "Choose the word most similar in meaning to 'BENEVOLENT':",
    options: ["Hostile", "Charitable", "Stingy", "Reckless"],
    correctOption: 1,
    explanation:
      "Benevolent means well-meaning and kind; charitable is the closest synonym.",
    topic: "Verbal Ability",
    subtopic: "Synonyms",
    difficulty: "Easy",
    suggestedTime: 30,
  },
  {
    questionText: "Choose the word most OPPOSITE in meaning to 'ELOQUENT':",
    options: ["Fluent", "Expressive", "Inarticulate", "Persuasive"],
    correctOption: 2,
    explanation:
      "Eloquent means fluent or persuasive in speaking; inarticulate is its antonym.",
    topic: "Verbal Ability",
    subtopic: "Antonyms",
    difficulty: "Easy",
    suggestedTime: 30,
  },
  {
    questionText: "Fill in the blank: She _____ to the market yesterday.",
    options: ["go", "goes", "went", "going"],
    correctOption: 2,
    explanation:
      "'Yesterday' indicates past tense, so 'went' (past tense of go) is correct.",
    topic: "Verbal Ability",
    subtopic: "Fill in the Blanks",
    difficulty: "Easy",
    suggestedTime: 20,
  },
  {
    questionText:
      "Identify the error: 'He don't know the answer to the question.'",
    options: ["He don't", "know the answer", "to the question", "No error"],
    correctOption: 0,
    explanation:
      "'He' is third person singular, so it should be 'doesn't' not 'don't'.",
    topic: "Verbal Ability",
    subtopic: "Error Correction",
    difficulty: "Easy",
    suggestedTime: 30,
  },
  {
    questionText:
      "The following bar chart shows sales for Q1-Q4. If Q1=100, Q2=150, Q3=120, Q4=180, what is the average?",
    options: ["130", "135", "137.5", "140"],
    correctOption: 2,
    explanation: "Average = (100 + 150 + 120 + 180) / 4 = 550 / 4 = 137.5",
    topic: "Data Interpretation",
    subtopic: "Bar Graph",
    difficulty: "Easy",
    suggestedTime: 45,
  },
  {
    questionText:
      "In a pie chart, if the angle for 'Sports' is 72°, what percentage does it represent?",
    options: ["15%", "20%", "25%", "30%"],
    correctOption: 1,
    explanation: "Percentage = (angle / 360) × 100 = (72/360) × 100 = 20%",
    topic: "Data Interpretation",
    subtopic: "Pie Chart",
    difficulty: "Easy",
    suggestedTime: 30,
  },
  {
    questionText:
      "A train travels from A to B at 60 km/h and returns at 40 km/h. Find average speed for the entire journey.",
    options: ["48 km/h", "50 km/h", "52 km/h", "54 km/h"],
    correctOption: 0,
    explanation:
      "Average speed = 2xy/(x+y) = 2×60×40/(60+40) = 4800/100 = 48 km/h",
    topic: "Quantitative Aptitude",
    subtopic: "Speed, Time & Distance",
    difficulty: "Medium",
    suggestedTime: 60,
  },
];

// ── Sample Badges ──────────────────────────────────────────────
const sampleBadges = [
  {
    name: "First Step",
    description: "Complete your first quiz",
    icon: "🎯",
    color: "#4CAF50",
    category: "completion",
    criteria: { type: "quiz_count", value: 1 },
  },
  {
    name: "Quiz Enthusiast",
    description: "Complete 10 quizzes",
    icon: "📚",
    color: "#2196F3",
    category: "completion",
    criteria: { type: "quiz_count", value: 10 },
  },
  {
    name: "Quiz Master",
    description: "Complete 25 quizzes",
    icon: "🎓",
    color: "#9C27B0",
    category: "completion",
    criteria: { type: "quiz_count", value: 25 },
  },
  {
    name: "Accuracy King",
    description: "Achieve 90%+ average accuracy",
    icon: "👑",
    color: "#FFD700",
    category: "accuracy",
    criteria: { type: "accuracy_threshold", value: 90 },
  },
  {
    name: "Perfect Score",
    description: "Get 100% on any quiz",
    icon: "⭐",
    color: "#FF9800",
    category: "accuracy",
    criteria: { type: "perfect_score", value: 100 },
  },
  {
    name: "7-Day Streak",
    description: "Practice for 7 consecutive days",
    icon: "🔥",
    color: "#F44336",
    category: "streak",
    criteria: { type: "streak_days", value: 7 },
  },
  {
    name: "30-Day Streak",
    description: "Practice for 30 consecutive days",
    icon: "💪",
    color: "#9C27B0",
    category: "streak",
    criteria: { type: "streak_days", value: 30 },
  },
  {
    name: "Speed Demon",
    description: "Complete a 10-question quiz in under 3 minutes",
    icon: "⚡",
    color: "#00BCD4",
    category: "speed",
    criteria: { type: "speed_demon", value: 180 },
  },
];

// ── Sample Notes ───────────────────────────────────────────────



const getSampleNotes = (adminId) => [

  {
  title: "Multiplication Tables 1 to 30",
  content: `# Multiplication Tables 1 to 30

## Tables 1 to 10

| × | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| **1** | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| **2** | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20 |
| **3** | 3 | 6 | 9 | 12 | 15 | 18 | 21 | 24 | 27 | 30 |
| **4** | 4 | 8 | 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40 |
| **5** | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 |
| **6** | 6 | 12 | 18 | 24 | 30 | 36 | 42 | 48 | 54 | 60 |
| **7** | 7 | 14 | 21 | 28 | 35 | 42 | 49 | 56 | 63 | 70 |
| **8** | 8 | 16 | 24 | 32 | 40 | 48 | 56 | 64 | 72 | 80 |
| **9** | 9 | 18 | 27 | 36 | 45 | 54 | 63 | 72 | 81 | 90 |
| **10** | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 |

## Tables 11 to 20

| n | ×1 | ×2 | ×3 | ×4 | ×5 | ×6 | ×7 | ×8 | ×9 | ×10 |
|---|---|---|---|---|---|---|---|---|---|---|
| **11** | 11 | 22 | 33 | 44 | 55 | 66 | 77 | 88 | 99 | 110 |
| **12** | 12 | 24 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
| **13** | 13 | 26 | 39 | 52 | 65 | 78 | 91 | 104 | 117 | 130 |
| **14** | 14 | 28 | 42 | 56 | 70 | 84 | 98 | 112 | 126 | 140 |
| **15** | 15 | 30 | 45 | 60 | 75 | 90 | 105 | 120 | 135 | 150 |
| **16** | 16 | 32 | 48 | 64 | 80 | 96 | 112 | 128 | 144 | 160 |
| **17** | 17 | 34 | 51 | 68 | 85 | 102 | 119 | 136 | 153 | 170 |
| **18** | 18 | 36 | 54 | 72 | 90 | 108 | 126 | 144 | 162 | 180 |
| **19** | 19 | 38 | 57 | 76 | 95 | 114 | 133 | 152 | 171 | 190 |
| **20** | 20 | 40 | 60 | 80 | 100 | 120 | 140 | 160 | 180 | 200 |

## Tables 21 to 30

| n | ×1 | ×2 | ×3 | ×4 | ×5 | ×6 | ×7 | ×8 | ×9 | ×10 |
|---|---|---|---|---|---|---|---|---|---|---|
| **21** | 21 | 42 | 63 | 84 | 105 | 126 | 147 | 168 | 189 | 210 |
| **22** | 22 | 44 | 66 | 88 | 110 | 132 | 154 | 176 | 198 | 220 |
| **23** | 23 | 46 | 69 | 92 | 115 | 138 | 161 | 184 | 207 | 230 |
| **24** | 24 | 48 | 72 | 96 | 120 | 144 | 168 | 192 | 216 | 240 |
| **25** | 25 | 50 | 75 | 100 | 125 | 150 | 175 | 200 | 225 | 250 |
| **26** | 26 | 52 | 78 | 104 | 130 | 156 | 182 | 208 | 234 | 260 |
| **27** | 27 | 54 | 81 | 108 | 135 | 162 | 189 | 216 | 243 | 270 |
| **28** | 28 | 56 | 84 | 112 | 140 | 168 | 196 | 224 | 252 | 280 |
| **29** | 29 | 58 | 87 | 116 | 145 | 174 | 203 | 232 | 261 | 290 |
| **30** | 30 | 60 | 90 | 120 | 150 | 180 | 210 | 240 | 270 | 300 |
`,
  topic: "Quantitative Aptitude",
  subtopic: "Tables",
  noteType: "formula",
  isPublic: true,
  createdBy: adminId,
  tags: ["tables", "multiplication", "mental math"],
},
{
  title: "Squares, Cubes & Roots — 1 to 30",
  content: `# Squares, Cubes & Square Roots

## 1 to 30 Complete Reference

| n | n² | n³ | √n |
|---|----|----|-----|
| 1 | 1 | 1 | 1.000 |
| 2 | 4 | 8 | 1.414 |
| 3 | 9 | 27 | 1.732 |
| 4 | 16 | 64 | 2.000 |
| 5 | 25 | 125 | 2.236 |
| 6 | 36 | 216 | 2.449 |
| 7 | 49 | 343 | 2.646 |
| 8 | 64 | 512 | 2.828 |
| 9 | 81 | 729 | 3.000 |
| 10 | 100 | 1000 | 3.162 |
| 11 | 121 | 1331 | 3.317 |
| 12 | 144 | 1728 | 3.464 |
| 13 | 169 | 2197 | 3.606 |
| 14 | 196 | 2744 | 3.742 |
| 15 | 225 | 3375 | 3.873 |
| 16 | 256 | 4096 | 4.000 |
| 17 | 289 | 4913 | 4.123 |
| 18 | 324 | 5832 | 4.243 |
| 19 | 361 | 6859 | 4.359 |
| 20 | 400 | 8000 | 4.472 |
| 21 | 441 | 9261 | 4.583 |
| 22 | 484 | 10648 | 4.690 |
| 23 | 529 | 12167 | 4.796 |
| 24 | 576 | 13824 | 4.899 |
| 25 | 625 | 15625 | 5.000 |
| 26 | 676 | 17576 | 5.099 |
| 27 | 729 | 19683 | 5.196 |
| 28 | 784 | 21952 | 5.292 |
| 29 | 841 | 24389 | 5.385 |
| 30 | 900 | 27000 | 5.477 |

## Key Shortcuts to Remember

### Perfect Squares (must memorize)
> 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400

### Perfect Cubes (must memorize)
> 1, 8, 27, 64, 125, 216, 343, 512, 729, 1000

### Cube Roots Quick Reference
| ∛n | = |
|----|---|
| ∛1 | 1 |
| ∛8 | 2 |
| ∛27 | 3 |
| ∛64 | 4 |
| ∛125 | 5 |
| ∛216 | 6 |
| ∛343 | 7 |
| ∛512 | 8 |
| ∛729 | 9 |
| ∛1000 | 10 |

## Trick — Square numbers ending in 5
**(n5)² = n×(n+1) followed by 25**

Examples:
- 25² = 2×3 | 25 = **625**
- 35² = 3×4 | 25 = **1225**
- 45² = 4×5 | 25 = **2025**
- 75² = 7×8 | 25 = **5625**
`,
  topic: "Quantitative Aptitude",
  subtopic: "Number System",
  noteType: "formula",
  isPublic: true,
  createdBy: adminId,
  tags: ["squares", "cubes", "roots", "number system"],
},
  {
    title: "Percentage - Key Formulas",
    content: `# Percentage Formulas

## Basic Formula
Percentage = (Part / Whole) × 100

## Common Shortcuts

### Percentage Change
Change% = ((New - Old) / Old) × 100

### Fraction to Percentage Quick Reference
| Fraction | Percentage |
|----------|------------|
| 1/2      | 50%        |
| 1/3      | 33.33%     |
| 1/4      | 25%        |
| 1/5      | 20%        |
| 1/6      | 16.67%     |
| 1/8      | 12.5%      |
| 1/10     | 10%        |

## Key Tips
- **X% of Y = Y% of X** — very useful for mental math!
- If A is X% more than B: B is less than A by **(X / (100+X)) × 100 %**
- If A is X% less than B: B is more than A by **(X / (100-X)) × 100 %**
`,
    topic: "Quantitative Aptitude",
    subtopic: "Percentages",
    noteType: "formula",
    isPublic: true,
    createdBy: adminId,
    hasFormulas: true,
    tags: ["percentage", "formula", "shortcut"],
  },
  {
    title: "Time & Work - LCM Method (Fastest Approach)",
    content: `# Time & Work - LCM Shortcut

## Why LCM Method?
It's the fastest way — no fractions needed!

## Steps
1. Find **LCM** of all given days
2. **Efficiency** = LCM ÷ Days taken by each person
3. **Combined efficiency** = sum of individual efficiencies
4. **Total time** = LCM ÷ Combined efficiency

## Example
- A finishes in **12 days**, B in **8 days**
- LCM(12, 8) = **24**
- A's efficiency = 24/12 = **2 units/day**
- B's efficiency = 24/8 = **3 units/day**
- Together = **5 units/day**
- Time together = 24/5 = **4.8 days**

## Common Formulas
| Scenario | Formula |
|----------|---------|
| A and B together | (a × b) / (a + b) |
| A, B, C together | (abc) / (ab + bc + ca) |
| A does, B undoes | (a × b) / (b - a) |
`,
    topic: "Quantitative Aptitude",
    subtopic: "Time & Work",
    noteType: "shortcut",
    isPublic: true,
    createdBy: adminId,
    hasFormulas: true,
    tags: ["time and work", "LCM method"],
  },
  {
    title: "Speed, Time & Distance - Complete Guide",
    content: `# Speed, Time & Distance

## Core Formula
**Speed = Distance / Time**

## Unit Conversions
- **km/h → m/s**: multiply by **5/18**
- **m/s → km/h**: multiply by **18/5**

## Key Shortcuts

### Average Speed
When same **distance** is covered at two speeds x and y:

> Average Speed = **2xy / (x + y)**

### Relative Speed
| Direction | Relative Speed |
|-----------|---------------|
| Opposite  | x + y         |
| Same      | \|x - y\|     |

### Train Problems
- Train crossing a **pole/person** → Distance = Length of train
- Train crossing a **platform** → Distance = Length of train + Length of platform
- Two trains crossing each other → Distance = Sum of lengths

## Quick Conversions Table
| km/h | m/s  |
|------|------|
| 18   | 5    |
| 36   | 10   |
| 54   | 15   |
| 72   | 20   |
| 90   | 25   |
`,
    topic: "Quantitative Aptitude",
    subtopic: "Speed, Time & Distance",
    noteType: "formula",
    isPublic: true,
    createdBy: adminId,
    hasFormulas: true,
    tags: ["speed", "distance", "train problems"],
  },
  {
    title: "Syllogisms - Rules & Tricks",
    content: `# Syllogisms - Quick Rules

## Types of Statements
| Type | Form | Example |
|------|------|---------|
| Universal Positive (A) | All S are P | All cats are animals |
| Universal Negative (E) | No S is P | No cats are dogs |
| Particular Positive (I) | Some S are P | Some cats are white |
| Particular Negative (O) | Some S are not P | Some cats are not white |

## Golden Rules
1. **All + All = All** → "All A are B" + "All B are C" → "All A are C" ✅
2. **All + Some = Some** → "All A are B" + "Some B are C" → **No conclusion** ❌
3. **Some + All = Some** → "Some A are B" + "All B are C" → "Some A are C" ✅
4. **No + All = No** → "No A is B" + "All B are C" → "No A is C" ✅
5. **Some + No = Some not** → "Some A are B" + "No B is C" → "Some A are not C" ✅

## Complementary Pairs (Either-Or)
If neither "Some A are B" nor "No A is B" follows individually,
the conclusion is: **"Either some A are B OR no A is B"**
`,
    topic: "Logical Reasoning",
    subtopic: "Syllogisms",
    noteType: "concept",
    isPublic: true,
    createdBy: adminId,
    tags: ["syllogisms", "logical reasoning", "rules"],
  },
];

// ── Main Seed Function ─────────────────────────────────────────
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear ALL existing data
    await Promise.all([
      User.deleteMany({}),
      Question.deleteMany({}),
      Badge.deleteMany({}),
      Note.deleteMany({}),
      Result.deleteMany({}),
    ]);
    console.log("🗑️  Cleared all existing data");

    // Create admin
    const admin = await User.create({
      name: "Admin",
      email: "admin@aptitude.com",
      password: "Admin@123",
      role: "admin",
    });
    console.log("👤 Admin created: admin@aptitude.com / Admin@123");

    // Create 8 team members
    const createdUsers = await User.create(
      teamMembers.map((u) => ({ ...u, role: "user" })),
    );
    console.log(`👥 ${createdUsers.length} team members created`);

    // Create questions
    const createdQuestions = await Question.insertMany(
      sampleQuestions.map((q) => ({ ...q, createdBy: admin._id })),
    );
    console.log(`❓ ${createdQuestions.length} questions created`);

    // Create badges
    await Badge.insertMany(sampleBadges);
    console.log(`🏆 ${sampleBadges.length} badges created`);

    // Create notes
    await Note.insertMany(getSampleNotes(admin._id));
    console.log(`📝 ${getSampleNotes(admin._id).length} notes created`);

    // Print summary
    console.log("\n" + "═".repeat(50));
    console.log("✅  DATABASE SEEDED SUCCESSFULLY");
    console.log("═".repeat(50));
    console.log("\n🔑 LOGIN CREDENTIALS\n");
    console.log("  ADMIN");
    console.log("  Email   : admin@aptitude.com");
    console.log("  Password: Admin@123\n");
    console.log("  TEAM MEMBERS (all use password: Team@123)");
    teamMembers.forEach((u) => {
      console.log(`  ${u.name.padEnd(10)} → ${u.email}`);
    });
    console.log("\n" + "═".repeat(50) + "\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seedDatabase();
