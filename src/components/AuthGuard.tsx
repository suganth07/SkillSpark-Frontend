import React from 'react';
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '~/lib/utils/AuthContext';
import { Spinner } from '~/components/ui/spinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();

  // Set to false to enable authentication
  const DISABLE_AUTH_FOR_TESTING = false;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size={48} />
        <Text className="text-foreground mt-4">Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated && !DISABLE_AUTH_FOR_TESTING) {
    return <Redirect href="/auth/login" />;
  }

  return <>{children}</>;
}
