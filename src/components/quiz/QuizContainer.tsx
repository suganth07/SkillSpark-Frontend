import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { QuizAPI, Quiz as QuizType, QuizAttemptResponse, QuizData } from '~/lib/api';
import authService from '~/services/authService';
import Icon from '~/lib/icons/Icon';

interface QuizContainerProps {
  userRoadmapId: string;
  topic: string;
  onClose: () => void;
}

interface QuizState {
  quiz: QuizType | null;
  currentQuestionIndex: number;
  userAnswers: Array<{selectedOption: number, timeSpent: number}>;
  startTime: Date;
  questionStartTime: Date;
  isSubmitting: boolean;
  results: QuizAttemptResponse | null;
  showResults: boolean;
}

const QuizContainer: React.FC<QuizContainerProps> = ({ 
  userRoadmapId, 
  topic, 
  onClose 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<QuizState>({
    quiz: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    startTime: new Date(),
    questionStartTime: new Date(),
    isSubmitting: false,
    results: null,
    showResults: false
  });

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🚀 Starting quiz load...');
      console.log('UserRoadmapId:', userRoadmapId);
      console.log('UserId:', user.id);
      
      try {
        // First try to get existing quiz
        const existingQuiz = await QuizAPI.getQuiz(userRoadmapId, user.id);
        console.log('✅ Found existing quiz');
        
        // Load any existing progress
        try {
          const progressResponse = await QuizAPI.getQuizProgress(existingQuiz.data.id, user.id);
          if (progressResponse.success && progressResponse.data && progressResponse.data.length > 0) {
            // Convert progress to userAnswers format
            const savedAnswers: Array<{selectedOption: number, timeSpent: number}> = [];
            let maxQuestionIndex = -1;
            
            progressResponse.data.forEach((progress: any) => {
              savedAnswers[progress.question_index] = {
                selectedOption: progress.selected_option,
                timeSpent: progress.time_spent
              };
              maxQuestionIndex = Math.max(maxQuestionIndex, progress.question_index);
            });
            
            // Resume from the next unanswered question or stay at current if all answered
            const nextQuestionIndex = Math.min(maxQuestionIndex + 1, existingQuiz.data.quiz_data.questions.length - 1);
            
            setState(prev => ({
              ...prev,
              quiz: existingQuiz.data,
              userAnswers: savedAnswers,
              currentQuestionIndex: nextQuestionIndex
            }));
            
            console.log(`📊 Loaded quiz progress: ${savedAnswers.length} answers, resuming at question ${nextQuestionIndex + 1}`);
          } else {
            setState(prev => ({
              ...prev,
              quiz: existingQuiz.data
            }));
          }
        } catch (progressError) {
          console.log('No saved progress found, starting fresh');
          setState(prev => ({
            ...prev,
            quiz: existingQuiz.data
          }));
        }
        
      } catch (getError: any) {
        // Only generate new quiz if we get a 404 (quiz doesn't exist)
        if (getError.message?.includes('404')) {
          console.log('📭 No existing quiz found, will wait for generation or generate if not already started...');
          
          // First, wait a bit and try again in case generation is already in progress
          let retryCount = 0;
          const maxRetries = 3;
          let quizFound = false;
          
          while (retryCount < maxRetries && !quizFound) {
            console.log(`🔄 Retry ${retryCount + 1}/${maxRetries}: Checking for quiz...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            
            try {
              const retryQuiz = await QuizAPI.getQuiz(userRoadmapId, user.id);
              console.log('✅ Found quiz on retry!');
              setState(prev => ({
                ...prev,
                quiz: retryQuiz.data
              }));
              quizFound = true;
            } catch (retryError) {
              retryCount++;
            }
          }
          
          // If still no quiz found after retries, generate new one
          if (!quizFound) {
            console.log('🧠 Generating new quiz as fallback...');
            const newQuiz = await QuizAPI.generateQuiz(userRoadmapId, user.id);
            console.log('✅ Generated new quiz');
            
            setState(prev => ({
              ...prev,
              quiz: newQuiz.data
            }));
          }
        } else {
          // For other errors, throw them
          throw getError;
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error loading quiz:', error);
      setError(error.message || 'Failed to load quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnswerToDatabase = async (questionIndex: number, selectedOption: number, timeSpent: number, retryCount = 0) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user || !state.quiz) return;
      
      await QuizAPI.saveQuizProgress(state.quiz.id, user.id, questionIndex, selectedOption, timeSpent);
      
      console.log(`💾 Saved answer for question ${questionIndex + 1}`);
    } catch (error: any) {
      console.error('❌ Failed to save answer:', error);
      
      // Handle rate limiting with retry
      if (error.message?.includes('429') || error.message?.includes('RATE_LIMIT_EXCEEDED')) {
        if (retryCount < 2) { // Retry up to 2 times
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`⏳ Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1})`);
          
          setTimeout(() => {
            saveAnswerToDatabase(questionIndex, selectedOption, timeSpent, retryCount + 1);
          }, delay);
        } else {
          console.error('--------------- Max retries reached for saving answer');
        }
      }
    }
  };

  const handleAnswer = async (selectedOption: number) => {
    if (!state.quiz) return;
    
    const timeSpent = Date.now() - state.questionStartTime.getTime();
    const newAnswer = { selectedOption, timeSpent };
    
    // Update local state immediately
    const updatedAnswers = [...state.userAnswers];
    updatedAnswers[state.currentQuestionIndex] = newAnswer;
    
    setState(prev => ({
      ...prev,
      userAnswers: updatedAnswers
    }));
    
    // Save to database immediately
    await saveAnswerToDatabase(state.currentQuestionIndex, selectedOption, timeSpent);
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      setState(prev => {
        if (!prev.quiz || !prev.quiz.quiz_data || !prev.quiz.quiz_data.questions) return prev;
        
        if (prev.currentQuestionIndex < prev.quiz.quiz_data.questions.length - 1) {
          return {
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
            questionStartTime: new Date()
          };
        }
        return prev;
      });
    }, 500);
  };

  const goToQuestion = (questionIndex: number) => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: questionIndex,
      questionStartTime: new Date()
    }));
  };

  const submitQuiz = async () => {
    if (!state.quiz) return;
    
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const answers = state.userAnswers.map((answer, index) => ({
        selectedOption: answer.selectedOption,
        timeSpent: answer.timeSpent
      }));

      const totalTimeSeconds = Math.floor((Date.now() - state.startTime.getTime()) / 1000);
      
      const results = await QuizAPI.submitQuizAttempt(state.quiz.id, user.id, answers, totalTimeSeconds);
      
      console.log('🎯 Full API Response:', results);
      console.log('🎯 Results.data:', results.data);
      console.log('🎯 Results.data keys:', Object.keys(results.data || {}));
      
      setState(prev => ({
        ...prev,
        results: results.data,
        showResults: true
      }));
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit quiz');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const resetQuiz = () => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: 0,
      userAnswers: [],
      startTime: new Date(),
      questionStartTime: new Date(),
      results: null,
      showResults: false
    }));
  };

  const renderProgressBar = () => {
    if (!state.quiz) return null;
    
    const totalQuestions = state.quiz.quiz_data.questions.length;
    const answeredQuestions = state.userAnswers.filter(answer => answer != null).length;
    const progressPercentage = (answeredQuestions / totalQuestions) * 100;
    
    return (
      <View style={{ padding: 16, backgroundColor: '#f8fafc' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
            Quiz Progress
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b' }}>
            {answeredQuestions}/{totalQuestions} questions
          </Text>
        </View>
        
        <View style={{ backgroundColor: '#e2e8f0', height: 8, borderRadius: 4, overflow: 'hidden' }}>
          <View 
            style={{ 
              backgroundColor: '#3b82f6', 
              height: '100%', 
              width: `${progressPercentage}%`,
              borderRadius: 4
            }} 
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {state.quiz.quiz_data.questions.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToQuestion(index)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                marginHorizontal: 4,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: state.userAnswers[index] 
                  ? '#10b981' 
                  : index === state.currentQuestionIndex 
                    ? '#3b82f6' 
                    : '#e5e7eb',
                borderWidth: index === state.currentQuestionIndex ? 2 : 0,
                borderColor: '#1e40af'
              }}
            >
              <Text style={{
                color: state.userAnswers[index] || index === state.currentQuestionIndex ? 'white' : '#6b7280',
                fontSize: 12,
                fontWeight: '600'
              }}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderQuestion = () => {
    if (!state.quiz) return null;
    
    const currentQuestion = state.quiz.quiz_data.questions[state.currentQuestionIndex];
    const currentAnswer = state.userAnswers[state.currentQuestionIndex];
    
    return (
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              backgroundColor: '#3b82f6',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              marginRight: 12
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                Question {state.currentQuestionIndex + 1} of {state.quiz.quiz_data.questions.length}
              </Text>
            </View>
            <View style={{
              backgroundColor: currentQuestion.difficulty === 'beginner' ? '#10b981' : 
                              currentQuestion.difficulty === 'intermediate' ? '#f59e0b' : '#ef4444',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' }}>
                {currentQuestion.difficulty}
              </Text>
            </View>
          </View>
          
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', lineHeight: 26, marginBottom: 20 }}>
            {currentQuestion.question}
          </Text>
          
          {currentQuestion.options.map((option, optionIndex) => (
            <TouchableOpacity
              key={optionIndex}
              onPress={() => handleAnswer(optionIndex)}
              style={{
                backgroundColor: currentAnswer?.selectedOption === optionIndex ? '#dbeafe' : '#f8fafc',
                borderColor: currentAnswer?.selectedOption === optionIndex ? '#3b82f6' : '#e2e8f0',
                borderWidth: 2,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: currentAnswer?.selectedOption === optionIndex ? '#3b82f6' : 'transparent',
                borderColor: currentAnswer?.selectedOption === optionIndex ? '#3b82f6' : '#d1d5db',
                borderWidth: 2,
                marginRight: 12,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {currentAnswer?.selectedOption === optionIndex && (
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>✓</Text>
                )}
              </View>
              <Text style={{
                flex: 1,
                fontSize: 16,
                color: currentAnswer?.selectedOption === optionIndex ? '#1e40af' : '#374151',
                fontWeight: currentAnswer?.selectedOption === optionIndex ? '600' : '400'
              }}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => goToQuestion(Math.max(0, state.currentQuestionIndex - 1))}
            disabled={state.currentQuestionIndex === 0}
            style={{
              backgroundColor: state.currentQuestionIndex === 0 ? '#f3f4f6' : '#6b7280',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Icon name="ChevronLeft" size={16} color={state.currentQuestionIndex === 0 ? '#9ca3af' : 'white'} />
            <Text style={{
              color: state.currentQuestionIndex === 0 ? '#9ca3af' : 'white',
              marginLeft: 8,
              fontWeight: '600'
            }}>
              Previous
            </Text>
          </TouchableOpacity>
          
          {state.currentQuestionIndex === state.quiz.quiz_data.questions.length - 1 ? (
            <TouchableOpacity
              onPress={submitQuiz}
              disabled={state.isSubmitting || state.userAnswers.filter(a => a != null).length !== state.quiz.quiz_data.questions.length}
              style={{
                backgroundColor: (state.userAnswers.filter(a => a != null).length === state.quiz.quiz_data.questions.length && !state.isSubmitting) ? '#10b981' : '#f3f4f6',
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              {state.isSubmitting ? (
                <ActivityIndicator size="small" color="#9ca3af" />
              ) : (
                <Icon name="Check" size={16} color={(state.userAnswers.filter(a => a != null).length === state.quiz.quiz_data.questions.length) ? 'white' : '#9ca3af'} />
              )}
              <Text style={{
                color: (state.userAnswers.filter(a => a != null).length === state.quiz.quiz_data.questions.length && !state.isSubmitting) ? 'white' : '#9ca3af',
                marginLeft: 8,
                fontWeight: '600'
              }}>
                Submit Quiz
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => goToQuestion(Math.min(state.quiz!.quiz_data.questions.length - 1, state.currentQuestionIndex + 1))}
              style={{
                backgroundColor: '#3b82f6',
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', marginRight: 8, fontWeight: '600' }}>Next</Text>
              <Icon name="ChevronRight" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderResults = () => {
    if (!state.results || !state.quiz) return null;
    
    console.log('🔍 Debug - state.results structure:', state.results);
    
    // Handle different possible API response structures
    let results: any, userAnswers: any;
    
    // Type assertion to handle the nested API response structure
    const resultsData = state.results as any;
    
    if (resultsData.data && resultsData.data.results) {
      // Nested structure: state.results.data.results and state.results.data.userAnswers
      results = resultsData.data.results;
      userAnswers = resultsData.data.userAnswers;
    } else if (resultsData.results) {
      // Direct structure: state.results.results and state.results.userAnswers
      results = resultsData.results;
      userAnswers = resultsData.userAnswers;
    } else {
      console.error('Results data not found in state.results:', state.results);
      console.error('Available keys in state.results:', Object.keys(state.results));
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: '#ef4444', textAlign: 'center' }}>
            Error loading quiz results. Please try again.
          </Text>
        </View>
      );
    }
    
    if (!results) {
      console.error('Results object is null or undefined');
      return null;
    }
    
    console.log('🎯 Results found:', results);
    console.log('👤 UserAnswers found:', userAnswers ? userAnswers.length : 'none');
    
    return (
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: results.percentage >= 70 ? '#10b981' : results.percentage >= 50 ? '#f59e0b' : '#ef4444',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                {results.percentage}%
              </Text>
            </View>
            
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 }}>
              {results.percentage >= 70 ? 'Excellent!' : results.percentage >= 50 ? 'Good Job!' : 'Keep Learning!'}
            </Text>
            
            <Text style={{ fontSize: 16, color: '#64748b', textAlign: 'center' }}>
              You scored {results.score} out of {results.totalQuestions} questions correctly
            </Text>
          </View>
          
          <View style={{ borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, color: '#64748b' }}>Correct Answers</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#10b981' }}>
                {results.score}/{results.totalQuestions}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, color: '#64748b' }}>Time Taken</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280' }}>
                {Math.floor(results.timeInSeconds / 60)}:{String(results.timeInSeconds % 60).padStart(2, '0')}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, color: '#64748b' }}>Accuracy</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#3b82f6' }}>
                {results.percentage}%
              </Text>
            </View>
          </View>
        </View>

        {/* Question Review */}
        {userAnswers && userAnswers.map((userAnswer: any, index: number) => {
          const question = state.quiz!.quiz_data.questions[index];
          const isCorrect = userAnswer.isCorrect;
          
          return (
            <View key={index} style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280', marginRight: 8 }}>
                  Question {index + 1}
                </Text>
                <View style={{
                  backgroundColor: isCorrect ? '#10b981' : '#ef4444',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 10
                }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                    {isCorrect ? 'CORRECT' : 'INCORRECT'}
                  </Text>
                </View>
              </View>
              
              <Text style={{ fontSize: 16, color: '#1e293b', marginBottom: 12, fontWeight: '500' }}>
                {question.question}
              </Text>
              
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Your Answer:</Text>
                <Text style={{
                  fontSize: 14,
                  color: isCorrect ? '#10b981' : '#ef4444',
                  fontWeight: '500'
                }}>
                  {question.options[userAnswer.selectedOption]}
                </Text>
              </View>
              
              {!isCorrect && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Correct Answer:</Text>
                  <Text style={{ fontSize: 14, color: '#10b981', fontWeight: '500' }}>
                    {question.options[question.correctAnswer]}
                  </Text>
                </View>
              )}
              
              {question.explanation && (
                <View style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: '600' }}>
                    EXPLANATION
                  </Text>
                  <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
                    {question.explanation}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
        
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <TouchableOpacity
            onPress={resetQuiz}
            style={{
              flex: 1,
              backgroundColor: '#6b7280',
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Retake Quiz</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onClose}
            style={{
              flex: 1,
              backgroundColor: '#3b82f6',
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#64748b' }}>Loading Quiz...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' }}>
        <View style={{ alignItems: 'center' }}>
          <Icon name="Shield" size={48} color="#ef4444" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginTop: 16, marginBottom: 8, textAlign: 'center' }}>
            Oops! Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              loadQuiz();
            }}
            style={{
              backgroundColor: '#3b82f6',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 12 }}
          >
            <Text style={{ color: '#64748b', fontSize: 14 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View style={{ backgroundColor: 'white', paddingTop: 44, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b' }}>
              {topic} Quiz
            </Text>
            <Text style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>
              Test your knowledge
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <Icon name="X" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      {!state.showResults && renderProgressBar()}
      
      {/* Content */}
      {state.showResults ? renderResults() : renderQuestion()}
    </View>
  );
};

export default QuizContainer;
