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
