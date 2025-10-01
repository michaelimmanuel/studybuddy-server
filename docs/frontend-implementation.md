# 🎯 Frontend Implementation Guide

Complete guide for implementing the StudyBuddy question system with question-level explanations on the frontend.

## 📋 Overview

This guide covers implementing the question management system with single explanations per question that provide educational context for the entire question.

### 🆕 Key Features to Implement

1. **Question-level Explanations**: Single educational explanation per question
2. **Role-based Question Management**: Different views for students vs admins
3. **Enhanced Learning Modes**: Study, quiz, and review modes
4. **Question Statistics**: Admin analytics and insights

---

## 🔧 API Integration

### Authentication Headers

All authenticated requests require session token:

```typescript
// Add to all API calls
const headers = {
  'Content-Type': 'application/json',
  'Cookie': `better-auth.session_token=${sessionToken}`
};
```

### TypeScript Interfaces

```typescript
// Core Types
interface Answer {
  id: string;
  text: string;
  isCorrect?: boolean;    // Only visible to admins
}

interface Question {
  id: string;
  text: string;
  courseId: string;
  explanation?: string;   // Only visible to admins or in reveal mode
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
  };
  answers: Answer[];
}

interface QuestionResponse {
  questions: Question[];
  course: {
    id: string;
    title: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Admin-specific types
interface AdminAnswer extends Answer {
  isCorrect: boolean;
}

interface AdminQuestion extends Question {
  explanation: string | null;
  answers: AdminAnswer[];
}

// Question creation/update payload
interface QuestionPayload {
  text: string;
  explanation?: string;
  answers: {
    text: string;
    isCorrect: boolean;
  }[];
}

// Statistics
interface QuestionStats {
  course: {
    id: string;
    title: string;
  };
  stats: {
    totalQuestions: number;
    questionsWithMultipleCorrectAnswers: number;
    averageAnswersPerQuestion: number;
    questionsCreatedThisWeek: number;
    questionsCreatedThisMonth: number;
  };
}
```

---

## 🏗️ Component Structure

### Recommended Component Hierarchy

```
src/
├── components/
│   ├── questions/
│   │   ├── QuestionList.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── QuestionForm.tsx (Admin)
│   │   ├── AnswersList.tsx
│   │   ├── AnswerExplanation.tsx
│   │   └── QuestionStats.tsx (Admin)
│   ├── learning/
│   │   ├── StudyMode.tsx
│   │   ├── QuizMode.tsx
│   │   └── ReviewMode.tsx
│   └── common/
│       ├── Pagination.tsx
│       └── LoadingSpinner.tsx
├── hooks/
│   ├── useQuestions.ts
│   ├── useQuestionStats.ts
│   └── useAuth.ts
├── services/
│   └── api.ts
└── types/
    └── question.types.ts
```

---

## 🔌 API Service Layer

```typescript
// services/api.ts
class QuestionAPI {
  private baseURL = 'http://localhost:8000/api';

  // Get course questions with pagination
  async getCourseQuestions(
    courseId: string, 
    page = 1, 
    limit = 10, 
    search = ''
  ): Promise<QuestionResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    const response = await fetch(
      `${this.baseURL}/courses/${courseId}/questions?${params}`,
      {
        headers: this.getAuthHeaders(),
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    return response.json();
  }

  // Create new question (Admin only)
  async createQuestion(courseId: string, payload: QuestionPayload): Promise<Question> {
    const response = await fetch(
      `${this.baseURL}/courses/${courseId}/questions`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create question');
    }

    const result = await response.json();
    return result.question;
  }

  // Update question (Admin only)
  async updateQuestion(questionId: string, payload: QuestionPayload): Promise<Question> {
    const response = await fetch(
      `${this.baseURL}/questions/${questionId}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update question');
    }

    const result = await response.json();
    return result.question;
  }

  // Delete question (Admin only)
  async deleteQuestion(questionId: string): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/questions/${questionId}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete question');
    }
  }

  // Get question statistics (Admin only)
  async getQuestionStats(courseId: string): Promise<QuestionStats> {
    const response = await fetch(
      `${this.baseURL}/courses/${courseId}/questions/stats`,
      {
        headers: this.getAuthHeaders(),
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch question stats: ${response.statusText}`);
    }

    return response.json();
  }

  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }
}

export const questionAPI = new QuestionAPI();
```

---

## 🪝 React Hooks

### useQuestions Hook

```typescript
// hooks/useQuestions.ts
import { useState, useEffect } from 'react';
import { questionAPI } from '../services/api';

export const useQuestions = (courseId: string, page = 1, search = '') => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await questionAPI.getCourseQuestions(courseId, page, 10, search);
      
      setQuestions(response.questions);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchQuestions();
    }
  }, [courseId, page, search]);

  const refetch = () => {
    fetchQuestions();
  };

  return {
    questions,
    loading,
    error,
    pagination,
    refetch
  };
};
```

### useQuestionStats Hook (Admin)

```typescript
// hooks/useQuestionStats.ts
import { useState, useEffect } from 'react';
import { questionAPI } from '../services/api';

export const useQuestionStats = (courseId: string) => {
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await questionAPI.getQuestionStats(courseId);
        setStats(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchStats();
    }
  }, [courseId]);

  return { stats, loading, error };
};
```

---

## 🎨 Component Examples

### QuestionCard Component

```typescript
// components/questions/QuestionCard.tsx
import React, { useState } from 'react';
import { Question } from '../../types/question.types';
import { AnswerExplanation } from './AnswerExplanation';

interface QuestionCardProps {
  question: Question;
  mode: 'study' | 'quiz' | 'review' | 'admin';
  onAnswerSelect?: (answerId: string) => void;
  showExplanations?: boolean;
  userAnswer?: string | null;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  mode,
  onAnswerSelect,
  showExplanations = false,
  userAnswer
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(userAnswer || null);
  const [revealed, setRevealed] = useState(false);

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    onAnswerSelect?.(answerId);
  };

  const toggleReveal = () => {
    setRevealed(!revealed);
  };

  const shouldShowExplanations = () => {
    return mode === 'admin' || 
           mode === 'review' || 
           (mode === 'study' && revealed) ||
           (mode === 'quiz' && showExplanations);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {question.text}
        </h3>
        {question.course && (
          <p className="text-sm text-gray-500">
            Course: {question.course.title}
          </p>
        )}
      </div>

      {/* Answers */}
      <div className="space-y-3">
        {question.answers.map((answer, index) => (
          <div key={answer.id} className="relative">
            {/* Answer Option */}
            <div
              className={`
                border-2 rounded-lg p-4 cursor-pointer transition-colors
                ${selectedAnswer === answer.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${shouldShowExplanations() && answer.isCorrect 
                  ? 'border-green-500 bg-green-50' 
                  : ''
                }
                ${shouldShowExplanations() && selectedAnswer === answer.id && !answer.isCorrect 
                  ? 'border-red-500 bg-red-50' 
                  : ''
                }
              `}
              onClick={() => handleAnswerSelect(answer.id)}
            >
              <div className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-gray-800">{answer.text}</span>
                
                {/* Correct/Incorrect Indicators (Admin/Review mode) */}
                {shouldShowExplanations() && (
                  <span className="ml-auto">
                    {answer.isCorrect ? (
                      <span className="text-green-600 font-semibold">✓ Correct</span>
                    ) : (
                      <span className="text-red-600 font-semibold">✗ Incorrect</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Answer Explanation */}
            {shouldShowExplanations() && answer.explanation && (
              <AnswerExplanation
                explanation={answer.explanation}
                isCorrect={answer.isCorrect || false}
                className="mt-2"
              />
            )}
          </div>
        ))}
      </div>

      {/* Study Mode Controls */}
      {mode === 'study' && selectedAnswer && !revealed && (
        <div className="mt-6 text-center">
          <button
            onClick={toggleReveal}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Show Explanation
          </button>
        </div>
      )}

      {/* Quiz Mode - Hide explanations until quiz completion */}
      {mode === 'quiz' && selectedAnswer && !showExplanations && (
        <div className="mt-4 text-center text-gray-500">
          <p>Answer selected. Explanations will be shown after quiz completion.</p>
        </div>
      )}
    </div>
  );
};
```

### AnswerExplanation Component

```typescript
// components/questions/AnswerExplanation.tsx
import React from 'react';

interface AnswerExplanationProps {
  explanation: string;
  isCorrect: boolean;
  className?: string;
}

export const AnswerExplanation: React.FC<AnswerExplanationProps> = ({
  explanation,
  isCorrect,
  className = ''
}) => {
  return (
    <div className={`
      rounded-lg p-3 border-l-4 
      ${isCorrect 
        ? 'bg-green-50 border-green-400 text-green-800' 
        : 'bg-red-50 border-red-400 text-red-800'
      }
      ${className}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-2">
          {isCorrect ? (
            <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">
            {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
          </p>
          <p className="text-sm">{explanation}</p>
        </div>
      </div>
    </div>
  );
};
```

### QuestionForm Component (Admin)

```typescript
// components/questions/QuestionForm.tsx
import React, { useState } from 'react';
import { QuestionPayload } from '../../types/question.types';

interface QuestionFormProps {
  onSubmit: (payload: QuestionPayload) => Promise<void>;
  initialData?: QuestionPayload | null;
  loading?: boolean;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  onSubmit,
  initialData = null,
  loading = false
}) => {
  const [formData, setFormData] = useState<QuestionPayload>(
    initialData || {
      text: '',
      answers: [
        { text: '', isCorrect: true, explanation: '' },
        { text: '', isCorrect: false, explanation: '' }
      ]
    }
  );

  const handleQuestionTextChange = (text: string) => {
    setFormData(prev => ({ ...prev, text }));
  };

  const handleAnswerChange = (index: number, field: keyof typeof formData.answers[0], value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.map((answer, i) => 
        i === index ? { ...answer, [field]: value } : answer
      )
    }));
  };

  const addAnswer = () => {
    if (formData.answers.length < 6) {
      setFormData(prev => ({
        ...prev,
        answers: [...prev.answers, { text: '', isCorrect: false, explanation: '' }]
      }));
    }
  };

  const removeAnswer = (index: number) => {
    if (formData.answers.length > 2) {
      setFormData(prev => ({
        ...prev,
        answers: prev.answers.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.text.length < 10 || formData.text.length > 1000) {
      alert('Question text must be between 10-1000 characters');
      return;
    }

    if (!formData.answers.some(a => a.isCorrect)) {
      alert('At least one answer must be marked as correct');
      return;
    }

    if (formData.answers.some(a => a.text.length === 0)) {
      alert('All answer texts are required');
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Question Text */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text *
        </label>
        <textarea
          value={formData.text}
          onChange={(e) => handleQuestionTextChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Enter your question here..."
          minLength={10}
          maxLength={1000}
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.text.length}/1000 characters
        </p>
      </div>

      {/* Answers */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answers (2-6 required) *
        </label>
        
        {formData.answers.map((answer, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700 mr-2">
                Answer {index + 1}:
              </span>
              <label className="flex items-center ml-auto">
                <input
                  type="checkbox"
                  checked={answer.isCorrect}
                  onChange={(e) => handleAnswerChange(index, 'isCorrect', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Correct Answer</span>
              </label>
              {formData.answers.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeAnswer(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Answer Text */}
            <input
              type="text"
              value={answer.text}
              onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Enter answer text..."
              maxLength={500}
              required
            />

            {/* Answer Explanation */}
            <textarea
              value={answer.explanation || ''}
              onChange={(e) => handleAnswerChange(index, 'explanation', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={2}
              placeholder="Optional: Explain why this answer is correct or incorrect..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              Explanation: {(answer.explanation || '').length}/1000 characters
            </p>
          </div>
        ))}

        {formData.answers.length < 6 && (
          <button
            type="button"
            onClick={addAnswer}
            className="mt-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            Add Another Answer
          </button>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : (initialData ? 'Update Question' : 'Create Question')}
        </button>
      </div>
    </form>
  );
};
```

---

## 📚 Learning Modes Implementation

### Study Mode

```typescript
// components/learning/StudyMode.tsx
import React, { useState } from 'react';
import { useQuestions } from '../../hooks/useQuestions';
import { QuestionCard } from '../questions/QuestionCard';

interface StudyModeProps {
  courseId: string;
}

export const StudyMode: React.FC<StudyModeProps> = ({ courseId }) => {
  const { questions, loading, error } = useQuestions(courseId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  const handleAnswerSelect = (answerId: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerId
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div>Error: {error}</div>;
  if (questions.length === 0) return <div>No questions available.</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Study Mode</h2>
          <span className="text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        mode="study"
        onAnswerSelect={handleAnswerSelect}
        userAnswer={userAnswers[currentQuestion.id]}
      />

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button
          onClick={nextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

### Quiz Mode

```typescript
// components/learning/QuizMode.tsx
import React, { useState } from 'react';
import { useQuestions } from '../../hooks/useQuestions';
import { QuestionCard } from '../questions/QuestionCard';

interface QuizModeProps {
  courseId: string;
  timeLimit?: number; // in minutes
}

export const QuizMode: React.FC<QuizModeProps> = ({ courseId, timeLimit }) => {
  const { questions, loading, error } = useQuestions(courseId);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : null);

  // Timer logic would go here...

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const submitQuiz = () => {
    setQuizCompleted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      const correctAnswer = question.answers.find(a => a.isCorrect);
      if (userAnswer === correctAnswer?.id) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    };
  };

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div>Error: {error}</div>;

  if (quizCompleted) {
    const score = calculateScore();
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Quiz Results */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-6">
          <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
          <div className="text-6xl font-bold mb-4 text-blue-600">
            {score.percentage}%
          </div>
          <p className="text-xl text-gray-600 mb-6">
            You got {score.correct} out of {score.total} questions correct
          </p>
        </div>

        {/* Review Questions with Explanations */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Review Your Answers</h3>
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              mode="quiz"
              showExplanations={true}
              userAnswer={userAnswers[question.id]}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Quiz Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Quiz Mode</h2>
          {timeRemaining && (
            <div className="text-xl font-mono">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        <p className="text-gray-600 mt-2">
          Answer all questions and submit when ready. Explanations will be shown after submission.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            mode="quiz"
            onAnswerSelect={(answerId) => handleAnswerSelect(question.id, answerId)}
            userAnswer={userAnswers[question.id]}
          />
        ))}
      </div>

      {/* Submit Quiz */}
      <div className="mt-8 text-center">
        <button
          onClick={submitQuiz}
          className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700"
        >
          Submit Quiz ({Object.keys(userAnswers).length}/{questions.length} answered)
        </button>
      </div>
    </div>
  );
};
```

---

## 🔐 Permission Handling

### Role-based Component Rendering

```typescript
// components/common/RoleGuard.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = <div>Access denied</div>
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Usage example:
<RoleGuard allowedRoles={['admin']}>
  <QuestionForm onSubmit={handleCreateQuestion} />
</RoleGuard>
```

---

## 🚀 Implementation Checklist

### Phase 1: Basic Question Display
- [ ] Set up TypeScript interfaces
- [ ] Create API service layer
- [ ] Implement `useQuestions` hook
- [ ] Create `QuestionCard` component (student view)
- [ ] Add pagination support

### Phase 2: Question Explanations
- [ ] Create `QuestionExplanation` component
- [ ] Implement role-based explanation visibility
- [ ] Add explanation display in different modes
- [ ] Test explanation character limits

### Phase 3: Learning Modes
- [ ] Implement Study Mode component
- [ ] Create Quiz Mode with timer
- [ ] Add Review Mode
- [ ] Implement score calculation

### Phase 4: Admin Features
- [ ] Create `QuestionForm` component
- [ ] Implement question CRUD operations
- [ ] Add question statistics dashboard
- [ ] Create role-based route guards

### Phase 5: Enhanced Features
- [ ] Add search functionality
- [ ] Implement question categories/tags
- [ ] Add bulk question import
- [ ] Create question analytics

---

## 🎯 UI/UX Recommendations

### Visual Design
1. **Color Coding**: Green for correct, red for incorrect, blue for neutral
2. **Icons**: Use clear check/X marks for answer feedback
3. **Typography**: Readable fonts with good contrast
4. **Spacing**: Adequate white space for readability

### User Experience
1. **Progressive Disclosure**: Show explanations on demand
2. **Clear Navigation**: Easy movement between questions
3. **Feedback**: Immediate visual feedback for interactions
4. **Loading States**: Show loading indicators for API calls

### Accessibility
1. **Keyboard Navigation**: Full keyboard support
2. **Screen Readers**: Proper ARIA labels
3. **Color Contrast**: Meet WCAG guidelines
4. **Focus Management**: Clear focus indicators

---

## 🧪 Testing Guide

### Unit Tests
```typescript
// Example test for QuestionCard component
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from '../QuestionCard';

const mockQuestion = {
  id: '1',
  text: 'Test question?',
  courseId: 'course-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  answers: [
    { id: 'a1', text: 'Answer 1', isCorrect: true, explanation: 'Correct!' },
    { id: 'a2', text: 'Answer 2', isCorrect: false, explanation: 'Wrong!' }
  ]
};

test('shows explanations in admin mode', () => {
  render(
    <QuestionCard 
      question={mockQuestion} 
      mode="admin" 
    />
  );
  
  expect(screen.getByText('Correct!')).toBeInTheDocument();
  expect(screen.getByText('Wrong!')).toBeInTheDocument();
});
```

### Integration Tests
- Test API integration with mock responses
- Test role-based functionality
- Test explanation visibility logic
- Test quiz completion flow

---

## 📈 Performance Optimization

### API Optimization
1. **Pagination**: Implement efficient pagination
2. **Caching**: Cache frequently accessed questions
3. **Lazy Loading**: Load explanations on demand
4. **Debouncing**: Debounce search inputs

### React Optimization
1. **Memoization**: Use `React.memo` for question cards
2. **Virtual Scrolling**: For large question lists
3. **Code Splitting**: Lazy load learning mode components
4. **State Management**: Consider Redux for complex state

---

This implementation guide provides a comprehensive foundation for building the StudyBuddy frontend with the new question-level explanation feature. The modular approach allows for incremental implementation and easy maintenance.

## 🔗 Related Documentation

- [Questions API Documentation](./questions-api.md)
- [Authentication API Documentation](./auth-api.md)
- [Users API Documentation](./users-api.md)
- [Courses API Documentation](./courses-api.md)