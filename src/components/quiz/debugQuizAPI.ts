// Debug Test for Quiz API
import { QuizAPI } from '~/lib/api';

export const debugQuizAPI = async () => {
  const userRoadmapId = '038fc686-7b2b-4aa8-b3e7-5b9fbdd39c42';
  const userId = '9f8815ec-8f1d-4b8d-9e76-508b95f6ef92';
  
  console.log('🔍 Testing Quiz API...');
  console.log('Backend URL:', process.env.EXPO_PUBLIC_BACKEND_URL);
  console.log('UserRoadmapId:', userRoadmapId);
  console.log('UserId:', userId);
  
  try {
    // Test 1: Try to get existing quiz first
    console.log('📋 Test 1: Getting existing quiz...');
    const existingQuiz = await QuizAPI.getQuiz(userRoadmapId, userId);
    console.log('✅ Existing quiz found:', existingQuiz);
    return existingQuiz;
  } catch (getError) {
    console.log('📭 No existing quiz, trying to generate...');
    console.log('Get error details:', getError);
    
    try {
      // Test 2: Generate new quiz
      console.log('🎯 Test 2: Generating new quiz...');
      const newQuiz = await QuizAPI.generateQuiz(userRoadmapId, userId);
      console.log('✅ Quiz generated successfully:', newQuiz);
      return newQuiz;
    } catch (generateError) {
      console.error('❌ Quiz generation failed:', generateError);
      
      // Test 3: Direct fetch test
      console.log('🌐 Test 3: Direct fetch test...');
      try {
        const directResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/quizzes/generate/${userRoadmapId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        });
        
        console.log('Direct fetch status:', directResponse.status);
        console.log('Direct fetch headers:', directResponse.headers);
        
        const directResult = await directResponse.json();
        console.log('Direct fetch result:', directResult);
        
        return directResult;
      } catch (directError) {
        console.error('❌ Direct fetch also failed:', directError);
        throw directError;
      }
    }
  }
};
