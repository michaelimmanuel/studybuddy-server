# Missions Feature - Implementation Plan

## Overview
The Missions feature is a gamification system that tracks user progress across various learning activities and rewards completion with achievements. This document outlines the architecture, database design, API structure, and frontend implementation plan.

---

## 1. Feature Requirements

### Mission Types & Tiers

#### 1. Quiz Completion Missions
- **Tier 1**: Complete 3 quizzes
- **Tier 2**: Complete 5 quizzes  
- **Tier 3**: Complete 10 quizzes

#### 2. CBT Completion Missions
- **Tier 1**: Complete 3 CBTs
- **Tier 2**: Complete 5 CBTs
- **Tier 3**: Complete 10 CBTs

#### 3. OSCE Course Completion Missions
- **Tier 1**: Complete 1 OSCE course
- **Tier 2**: Complete 3 OSCE courses
- **Tier 3**: Complete 5 OSCE courses

#### 4. Daily CBT Mission
- Complete 2 CBTs today (resets daily)

#### 5. High Score Missions
- **Tier 1**: Get 1 score above 90
- **Tier 2**: Get 3 scores above 90
- **Tier 3**: Get 10 scores above 90

#### 6. Perfect Score Mission
- Get 1 perfect score (100)

#### 7. Study Streak Missions
- **Tier 1**: 5 consecutive days study streak
- **Tier 2**: 10 consecutive days study streak
- **Tier 3**: 15 consecutive days study streak

---

## 2. Database Schema Design

### New Tables

#### `Mission` Table
Stores mission definitions (seeded data).

```prisma
model Mission {
  id          String   @id @default(cuid())
  code        String   @unique // e.g., "QUIZ_COMPLETE_3", "CBT_COMPLETE_5"
  type        MissionType
  tier        Int      // 1, 2, or 3 (0 for non-tiered missions)
  title       String   // Display title
  description String   // Mission description
  requirement Json     // Flexible JSON for requirement data
  reward      Json?    // Optional: points, badges, etc.
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  userProgress UserMissionProgress[]
  
  @@index([type, tier])
}

enum MissionType {
  QUIZ_COMPLETION
  CBT_COMPLETION
  OSCE_COMPLETION
  DAILY_CBT
  HIGH_SCORE
  PERFECT_SCORE
  STUDY_STREAK
}
```

#### `UserMissionProgress` Table
Tracks individual user progress on each mission.

```prisma
model UserMissionProgress {
  id            String   @id @default(cuid())
  userId        String
  missionId     String
  progress      Int      @default(0) // Current progress count
  isCompleted   Boolean  @default(false)
  completedAt   DateTime?
  lastUpdatedAt DateTime @updatedAt
  metadata      Json?    // Flexible data (e.g., last active date for streaks)
  
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  mission Mission @relation(fields: [missionId], references: [id], onDelete: Cascade)
  
  @@unique([userId, missionId])
  @@index([userId, isCompleted])
  @@index([missionId])
}
```

#### `UserActivity` Table
Tracks daily user activity for streak calculation.

```prisma
model UserActivity {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @db.Date // Date only, no time
  actions   Json     // Store activity types: quiz, cbt, osce
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, date])
  @@index([userId, date])
}
```

### Schema Modifications
- Add `UserMissionProgress[]` relation to `User` model
- Add `UserActivity[]` relation to `User` model

---

## 3. Backend Architecture

### 3.1 Service Layer Structure

#### `MissionService` (`src/services/mission.service.ts`)
Core business logic for mission management.

**Responsibilities:**
- Seed mission definitions
- Retrieve missions for users
- Calculate progress
- Check mission completion

**Key Methods:**
- `getAllMissions()` - Get all active missions
- `getUserMissions(userId)` - Get missions with user progress
- `initializeUserMissions(userId)` - Create progress records for new user
- `updateProgress(userId, missionType, data)` - Update mission progress
- `checkAndCompleteMission(userId, missionId)` - Validate and mark complete

#### `ProgressTrackerService` (`src/services/progress-tracker.service.ts`)
Handles automatic progress updates based on user actions.

**Responsibilities:**
- Listen to quiz/CBT completion events
- Update mission progress
- Track daily activities
- Calculate streaks

**Key Methods:**
- `trackQuizAttempt(userId, attempt)` - After quiz completion
- `trackCBTAttempt(userId, attempt)` - After CBT completion
- `trackOSCECompletion(userId, courseId)` - After OSCE course completion
- `updateDailyActivity(userId, activityType)` - Log daily activity
- `calculateStreak(userId)` - Calculate current streak
- `checkDailyMissions(userId)` - Reset/check daily missions

#### `StreakService` (`src/services/streak.service.ts`)
Dedicated service for streak calculation.

**Responsibilities:**
- Calculate consecutive days
- Handle timezone issues
- Validate streak continuity

**Key Methods:**
- `getCurrentStreak(userId)` - Get active streak count
- `getStreakHistory(userId, days)` - Get activity history
- `hasActivityToday(userId)` - Check if user was active today

---

### 3.2 API Endpoints

Base path: `/api/missions`

#### GET `/api/missions`
Get all missions with current user's progress.

**Response:**
```json
{
  "missions": [
    {
      "id": "cm_xxx",
      "code": "QUIZ_COMPLETE_3",
      "type": "QUIZ_COMPLETION",
      "tier": 1,
      "title": "Mengerjakan 3 Quiz",
      "description": "Selesaikan 3 quiz untuk membuka achievement ini",
      "requirement": {
        "count": 3,
        "type": "quiz"
      },
      "reward": {
        "points": 50,
        "badge": "quiz_starter"
      },
      "progress": {
        "current": 1,
        "required": 3,
        "isCompleted": false,
        "percentage": 33
      }
    }
  ],
  "stats": {
    "totalMissions": 16,
    "completedMissions": 3,
    "currentStreak": 5
  }
}
```

#### GET `/api/missions/:missionId`
Get specific mission details with progress.

#### GET `/api/missions/stats`
Get user mission statistics and streak info.

**Response:**
```json
{
  "totalCompleted": 3,
  "totalAvailable": 16,
  "completionRate": 18.75,
  "currentStreak": 5,
  "longestStreak": 12,
  "lastActivityDate": "2026-02-25T10:30:00Z",
  "recentCompletions": [
    {
      "missionId": "cm_xxx",
      "title": "Perfect Score",
      "completedAt": "2026-02-24T15:20:00Z"
    }
  ]
}
```

#### POST `/api/missions/sync` (Internal/Webhook)
Trigger mission progress update after an activity.

**Request Body:**
```json
{
  "userId": "user_123",
  "activityType": "QUIZ_ATTEMPT",
  "data": {
    "score": 95,
    "attemptId": "attempt_xxx"
  }
}
```

**Response:**
```json
{
  "updatedMissions": [
    {
      "missionId": "cm_xxx",
      "newProgress": 2,
      "isCompleted": false
    }
  ],
  "newCompletions": []
}
```

---

### 3.3 Integration Points

#### Quiz Attempt Handler
After a quiz attempt is completed, trigger mission updates:

**Location:** `src/routes/quiz-attempts.routes.ts` or controller

```javascript
// After saving quiz attempt
await progressTrackerService.trackQuizAttempt(userId, {
  score: calculatedScore,
  attemptId: attempt.id,
  courseId: attempt.courseId
});
```

#### CBT Completion Handler
Similar integration for CBT completions.

#### OSCE Course Tracking
Track when user completes all questions in an OSCE course.

---

### 3.4 Background Jobs / Cron Tasks

#### Daily Reset Job
**Schedule:** Every day at midnight (00:00)

**Tasks:**
- Reset daily mission progress
- Check streak continuity
- Update activity logs

**Implementation:** Use `node-cron` or Vercel Cron Jobs

```javascript
// src/jobs/daily-missions.job.ts
export async function resetDailyMissions() {
  // Reset all DAILY_CBT missions
  // Check if users maintained their streak
  // Update UserActivity records
}
```

---

## 4. Frontend Architecture

### 4.1 Page Structure

#### New Page: `/missions` or `/dashboard/missions`
**Location:** `studybuddy-web/src/app/missions/page.tsx`

**Components:**
```
MissionsPage
├── MissionHeader (stats overview)
├── MissionTabs (category filters)
│   ├── All
│   ├── Quiz
│   ├── CBT
│   ├── OSCE
│   ├── Daily
│   └── Streak
├── MissionGrid
│   └── MissionCard (multiple)
│       ├── Icon/Badge
│       ├── Title & Description
│       ├── ProgressBar
│       ├── Reward Display
│       └── Completion Status
└── StreakCalendar (visual streak tracker)
```

---

### 4.2 Component Design

#### `MissionCard.tsx`
**Props:**
```typescript
interface MissionCardProps {
  mission: Mission;
  progress: MissionProgress;
  onClaim?: () => void;
}
```

**States:**
- Not Started (0% progress)
- In Progress (1-99% progress)
- Completed (100%, unclaimed)
- Claimed (completed & reward claimed)

**Visual Design:**
- Progress bar with percentage
- Tier badge (I, II, III) for tiered missions
- Animated completion effect
- Disabled state for incomplete missions

#### `MissionHeader.tsx`
**Display:**
- Total missions completed / total available
- Current streak with fire emoji
- Quick stats cards

#### `StreakCalendar.tsx`
**Display:**
- Calendar grid showing last 30 days
- Highlight active days
- Show current streak visually
- Tooltip with activity details on hover

#### `MissionProgressBar.tsx`
Reusable progress bar component with animations.

---

### 4.3 State Management

#### API Service: `src/services/missions.service.ts`

```typescript
export const missionsService = {
  getMissions: async () => {
    // GET /api/missions
  },
  
  getMissionStats: async () => {
    // GET /api/missions/stats
  },
  
  claimReward: async (missionId: string) => {
    // POST /api/missions/:id/claim (future feature)
  }
};
```

#### React Query / SWR Integration

```typescript
// In page component
const { data: missions, isLoading } = useQuery({
  queryKey: ['missions'],
  queryFn: missionsService.getMissions
});

const { data: stats } = useQuery({
  queryKey: ['mission-stats'],
  queryFn: missionsService.getMissionStats
});
```

---

### 4.4 UI/UX Considerations

#### Visual Design
- Use progress bars with smooth animations
- Color coding by mission type
- Badge/trophy icons for completed missions
- Celebration animation on completion
- Responsive grid layout (1-2-3 columns)

#### User Experience
- Show nearest achievable missions first
- Filter/sort options (by type, completion, tier)
- Clear call-to-action for incomplete missions
- Tooltips explaining requirements
- Notification when mission completed
- Link directly to relevant activities (e.g., "Start Quiz" button)

#### Accessibility
- ARIA labels for progress bars
- Keyboard navigation support
- Color-blind friendly colors
- Screen reader friendly descriptions

---

## 5. Implementation Phases

### Phase 1: Database & Core Backend (Week 1)
1. Create Prisma schema migrations
2. Seed mission definitions
3. Implement `MissionService` core methods
4. Create API endpoints (read-only first)
5. Write unit tests for services

### Phase 2: Progress Tracking Integration (Week 1-2)
1. Implement `ProgressTrackerService`
2. Implement `StreakService`
3. Integrate with quiz attempt routes
4. Integrate with CBT routes (if separate)
5. Add OSCE completion tracking
6. Set up daily activity logging
7. Test progress updates end-to-end

### Phase 3: Frontend Implementation (Week 2)
1. Create mission page structure
2. Build reusable components
3. Implement API service layer
4. Add state management (React Query)
5. Style components with Tailwind
6. Add animations and transitions

### Phase 4: Daily Missions & Cron Jobs (Week 3)
1. Implement daily reset logic
2. Set up cron job (Vercel Cron or node-cron)
3. Add streak calculation and validation
4. Test timezone handling
5. Handle edge cases (midnight crossover)

### Phase 5: Polish & Optimization (Week 3)
1. Add loading states and error handling
2. Optimize database queries (indexes, N+1)
3. Add caching layer (if needed)
4. Performance testing
5. Cross-browser testing
6. Mobile responsive testing

### Phase 6: Launch & Monitor (Week 4)
1. Deploy backend changes
2. Run database migrations in production
3. Seed production missions
4. Deploy frontend
5. Monitor error logs
6. Gather user feedback

---

## 6. Technical Best Practices

### 6.1 Database
- **Indexes:** Add indexes on frequently queried fields (`userId`, `missionId`, `date`)
- **Cascade Deletes:** Ensure user mission progress is deleted when user is deleted
- **JSON Fields:** Use for flexible requirement/reward data that may evolve
- **Date Handling:** Store dates as `@db.Date` for streak tracking to avoid timezone issues
- **Transactions:** Use Prisma transactions when updating multiple records

### 6.2 Backend
- **Service Layer Pattern:** Separate business logic from route handlers
- **Error Handling:** Use consistent error responses with proper HTTP codes
- **Validation:** Validate all inputs with Zod or similar
- **Logging:** Log all mission completions and progress updates
- **Idempotency:** Ensure progress updates are idempotent (don't double-count)
- **Caching:** Cache mission definitions (change infrequently)
- **Background Processing:** Consider queue system for progress updates if high volume

### 6.3 Progress Tracking
- **Event-Driven:** Trigger mission updates after actual events (quiz saved, etc.)
- **Atomic Updates:** Use database constraints to prevent race conditions
- **Batch Processing:** Update multiple missions in one transaction
- **Streak Logic:** Calculate streaks server-side, don't trust client
- **Timezone:** Store user timezone preference or use UTC consistently

### 6.4 Frontend
- **Loading States:** Show skeleton loaders while fetching
- **Error Boundaries:** Gracefully handle component errors
- **Optimistic Updates:** Show immediate feedback, rollback if fails
- **Animations:** Use CSS transitions for performance
- **Lazy Loading:** Load mission icons/images lazily
- **Accessibility:** Follow WCAG guidelines
- **Performance:** Virtualize long mission lists if needed

### 6.5 Testing
- **Unit Tests:** Test service methods with mocked Prisma
- **Integration Tests:** Test API endpoints with test database
- **E2E Tests:** Test critical user flows (complete quiz → mission updates)
- **Edge Cases:** Test streak breaks, timezone boundaries, concurrent updates
- **Load Testing:** Test with realistic data volumes

---

## 7. Data Seeding

### Mission Seed Data Structure

Create seed script: `prisma/seeds/missions.seed.ts`

```typescript
const missions = [
  // Quiz Completion Missions
  {
    code: 'QUIZ_COMPLETE_3',
    type: 'QUIZ_COMPLETION',
    tier: 1,
    title: 'Mengerjakan 3 Quiz',
    description: 'Selesaikan 3 quiz untuk membuka achievement ini',
    requirement: { count: 3 },
    reward: { points: 50 }
  },
  {
    code: 'QUIZ_COMPLETE_5',
    type: 'QUIZ_COMPLETION',
    tier: 2,
    title: 'Mengerjakan 5 Quiz',
    description: 'Selesaikan 5 quiz untuk membuka achievement ini',
    requirement: { count: 5 },
    reward: { points: 100 }
  },
  // ... more missions
];
```

---

## 8. Security Considerations

1. **Authorization:** Ensure users can only view/update their own missions
2. **Rate Limiting:** Prevent abuse of progress sync endpoints
3. **Input Validation:** Validate all mission progress updates
4. **SQL Injection:** Use Prisma's parameterized queries
5. **Data Privacy:** Don't expose other users' mission data

---

## 9. Scalability Considerations

1. **Caching:** Cache mission definitions (Redis/in-memory)
2. **Database Indexes:** Proper indexing for fast queries
3. **Query Optimization:** Use `include` selectively, paginate results
4. **Background Jobs:** Queue progress updates for async processing
5. **CDN:** Serve mission icons/images from CDN
6. **Monitoring:** Track slow queries and API response times

---

## 10. Future Enhancements

1. **Rewards System:** Points, badges, leaderboards
2. **Social Features:** Share mission completions
3. **Notifications:** Push notifications on mission completion
4. **Custom Missions:** Admin-created dynamic missions
5. **Time-Limited Missions:** Weekly/monthly special missions
6. **Mission Chains:** Complete Mission A to unlock Mission B
7. **Difficulty Levels:** Easy/Medium/Hard missions
8. **Achievements Gallery:** Display all earned achievements
9. **Reward Shop:** Spend earned points on items
10. **Friend Challenges:** Compete with friends on missions

---

## 11. Open Questions & Decisions Needed

1. **Reward System:** What do users get for completing missions? (Points? Badges? Unlocks?)
2. **Retroactive Progress:** Should we count existing quiz attempts toward missions, or only new ones?
3. **CBT Definition:** What exactly is a "CBT" in the context of this app? Different from quiz?
4. **OSCE Completion:** What defines "completing" an OSCE course? (All questions answered? Passing score?)
5. **Daily Reset Time:** What time should daily missions reset? (User's local midnight? UTC midnight?)
6. **Streak Grace Period:** Do users get a grace period if they miss a day? (e.g., 24-hour window)
7. **Mission Discovery:** Are all missions visible immediately, or do they unlock progressively?
8. **Claim Rewards:** Do users need to manually claim rewards, or auto-claimed?
9. **Multiple Tiers:** Can users complete all tiers (3, 5, 10 quizzes) or only the highest they've reached?
10. **Navigation:** Where does the missions tab appear? (Main nav? Dashboard? Bottom tab bar?)

---

## 12. Risk Assessment

### High Risk
- **Streak Calculation Bugs:** Complex date logic across timezones
- **Race Conditions:** Concurrent progress updates from multiple quiz attempts
- **Performance:** N+1 queries when loading missions with progress

### Medium Risk
- **Data Migration:** Retroactive progress calculation for existing users
- **Cron Job Reliability:** Daily reset job failures
- **UI Complexity:** Too many missions overwhelming users

### Low Risk
- **Icon Assets:** Missing or inconsistent mission icons
- **Copy Changes:** Mission titles/descriptions may need iteration

### Mitigation Strategies
- Thorough testing of date/timezone logic
- Use database constraints and transactions
- Add comprehensive logging
- Implement feature flags for gradual rollout
- Start with MVP mission set, add more later

---

## Conclusion

This missions feature will add significant gamification and engagement to StudyBuddy. The modular architecture allows for easy expansion with new mission types. The tiered approach provides clear progression paths for users.

Next steps:
1. **Review this plan** and address open questions
2. **Confirm mission definitions** and reward structure
3. **Approve database schema** changes
4. Begin Phase 1 implementation

---

**Document Version:** 1.0  
**Created:** 2026-02-25  
**Author:** GitHub Copilot  
**Status:** Pending Review
