import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import QuizContainer from '~/components/quiz/QuizContainer';

export default function QuizScreen() {
  const { userRoadmapId, topic } = useLocalSearchParams();
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <QuizContainer
      userRoadmapId={userRoadmapId as string}
      topic={topic as string}
      onClose={handleClose}
    />
  );
}
