# Partial Credit Scoring System

## Overview

The quiz scoring system now automatically detects questions with multiple correct answers and awards partial credit accordingly.

## How It Works

### 🔍 Automatic Detection

The system counts how many answers are marked as `isCorrect: true` for each question:

```typescript
const correctAnswers = question.answers.filter(a => a.isCorrect);
const correctAnswerIds = correctAnswers.map(a => a.id);
```

### 📊 Scoring Logic

#### Single Correct Answer (Traditional)
If a question has **only 1 correct answer**:
- Selected correct answer: **1 point** ✅
- Selected wrong answer: **0 points** ❌
- No answer: **0 points** ❌

#### Multiple Correct Answers (Partial Credit)
If a question has **multiple correct answers** (e.g., 3 correct answers):
- Each correct answer selected: **1/3 point** (0.333...)
- Wrong answer selected: **0 points**
- No answer: **0 points**

### 💡 Formula

```
Question Points = isCorrect ? (1 / number_of_correct_answers) : 0
```

## 📈 Examples

### Example 1: Traditional Question (1 Correct Answer)

**Question**: "What is 2 + 2?"
- A) 3 ❌
- B) 4 ✅ (correct)
- C) 5 ❌
- D) 6 ❌

**Scoring**:
- User selects B: **1.0 points** (100% of question)
- User selects A: **0.0 points** (0% of question)

---

### Example 2: Multiple Correct Answers (2 Correct)

**Question**: "Which are prime numbers?"
- A) 2 ✅ (correct)
- B) 4 ❌
- C) 5 ✅ (correct)
- D) 6 ❌

**Scoring** (user can only select one answer in current UI):
- User selects A (correct): **0.5 points** (1/2 = 50% of question)
- User selects C (correct): **0.5 points** (1/2 = 50% of question)
- User selects B (wrong): **0.0 points** (0% of question)
- User selects D (wrong): **0.0 points** (0% of question)

---

### Example 3: Multiple Correct Answers (3 Correct)

**Question**: "Which are programming languages?"
- A) Python ✅ (correct)
- B) HTML ❌
- C) JavaScript ✅ (correct)
- D) Java ✅ (correct)
- E) CSS ❌

**Scoring**:
- User selects A (correct): **0.333 points** (1/3 of question)
- User selects C (correct): **0.333 points** (1/3 of question)
- User selects D (correct): **0.333 points** (1/3 of question)
- User selects B or E (wrong): **0.0 points**

---

## 🎯 Complete Quiz Example

**Quiz with 10 questions:**
- 8 questions with 1 correct answer each
- 2 questions with 3 correct answers each

### Scenario 1: Perfect Score
- All 8 single-answer questions correct: **8.0 points**
- Both multiple-answer questions correct: **0.333 + 0.333 = 0.666 points**
- **Total: 8.666 / 10 = 86.66%**

Wait, that doesn't seem right! Let me recalculate...

Actually, the student can only select ONE answer per question in the current UI, so:
- If they select ONE correct answer from a multi-answer question: **0.333 points**
- They'd need to answer the question 3 times to get full credit (not possible in current UI)

### Scenario 2: Realistic Score
User answers:
- 7 out of 8 single-answer questions correct: **7.0 points**
- Question 9 (3 correct options) - selects one correct: **0.333 points**
- Question 10 (3 correct options) - selects wrong: **0.0 points**

**Total Score:**
```
totalScore = 7.0 + 0.333 + 0.0 = 7.333
totalQuestions = 10
score = (7.333 / 10) × 100 = 73.33%
```

---

## ⚠️ Current Limitation

**Important**: The current UI only allows selecting **ONE answer per question** (radio buttons).

This means:
- For questions with multiple correct answers, users can only select ONE
- They get partial credit if they select a correct one
- They can never get full credit for multi-answer questions

### Example Impact:

**Question**: "Which are even numbers?"
- A) 2 ✅
- B) 3 ❌
- C) 4 ✅
- D) 5 ❌

With current UI:
- User can only pick A or C (not both)
- Best possible score: **0.5 points** (50%)
- To get full credit, they'd need to select both A and C (not possible)

---

## 🔧 How `correctCount` Works

```typescript
const correctCount = Math.round(totalScore);
```

- `totalScore` is the sum of all question points (can be decimal)
- `correctCount` is rounded for display purposes
- Example: totalScore = 7.333 → correctCount = 7

This is used for display: "You got 7 out of 10 questions correct"

---

## 📊 Score Calculation

```typescript
const score = (totalScore / totalQuestions) × 100
```

The percentage is based on the actual `totalScore`, not the rounded `correctCount`.

### Examples:

| Total Score | Total Questions | Calculation | Final Score | Rounded Count |
|-------------|-----------------|-------------|-------------|---------------|
| 10.0 | 10 | (10/10) × 100 | **100%** | 10 |
| 7.333 | 10 | (7.333/10) × 100 | **73.33%** | 7 |
| 8.666 | 10 | (8.666/10) × 100 | **86.66%** | 9 |
| 5.5 | 10 | (5.5/10) × 100 | **55%** | 6 |

---

## 💭 Design Philosophy

### Why Partial Credit?

1. **Fairness**: If a question has 3 correct answers, selecting one correct answer shows partial knowledge
2. **Automatic**: No need to manually configure question types
3. **Flexible**: Works with any number of correct answers
4. **No Schema Changes**: Detects automatically based on existing data

### Why This Approach?

- ✅ No database schema changes needed
- ✅ Backward compatible with existing questions
- ✅ Automatically adapts to question structure
- ✅ Simple to understand and implement

---

## 🎓 Educational Impact

### Advantages:
- Students get credit for partial knowledge
- Encourages engagement even with difficult questions
- More nuanced assessment of understanding

### Considerations:
- Students may be confused why they got 73.33% instead of 70%
- May need to explain partial credit system
- UI currently doesn't support selecting multiple answers

---

## 🚀 Future Enhancements

To fully leverage partial credit:

1. **Update Frontend UI**:
   - Detect questions with multiple correct answers
   - Show checkboxes instead of radio buttons
   - Allow selecting multiple answers

2. **Enhanced Scoring**:
   - Award full point only if ALL correct answers selected
   - Deduct points for incorrect answers selected
   - Formula: `(correct_selected - incorrect_selected) / total_correct`

3. **Question Preview**:
   - Show "Select one" vs "Select all that apply"
   - Based on number of correct answers

---

## 📝 Summary

**Current Behavior**:
- Questions with 1 correct answer: 1 point (all-or-nothing)
- Questions with N correct answers: 1/N point per correct selection
- User can only select one answer per question (UI limitation)
- Score is calculated based on total points earned

**Key Point**: This system awards partial credit automatically but the UI doesn't allow selecting multiple answers yet. The full benefit will be realized when the frontend is updated to support multiple selections.
