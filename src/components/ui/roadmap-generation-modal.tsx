import React, { useState, useRef, useEffect } from 'react';
import { View, Modal, Text, Animated, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface RoadmapGenerationModalProps {
  visible: boolean;
  topic?: string;
  onClose?: () => void;
  progress?: number; // 0-100
  stage?: 'analyzing' | 'structuring' | 'optimizing' | 'finalizing' | 'complete';
}

const stageMessages = {
  analyzing: "🧠 Analyzing learning requirements...",
  structuring: "📋 Structuring curriculum points...", 
  optimizing: "⚡ Optimizing learning path...",
  finalizing: "✨ Finalizing your roadmap...",
  complete: "🎉 Roadmap generated successfully!"
};

const stageColors: Record<string, [string, string]> = {
  analyzing: ['#667eea', '#764ba2'],
  structuring: ['#f093fb', '#f5576c'],
  optimizing: ['#4facfe', '#00f2fe'],
  finalizing: ['#43e97b', '#38f9d7'],
  complete: ['#fa709a', '#fee140']
};

export default function RoadmapGenerationModal({ 
  visible, 
  topic = "your topic", 
  onClose,
  progress = 0,
  stage = 'analyzing'
}: RoadmapGenerationModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Start pulse animation for loading states
      if (stage !== 'complete') {
        const pulse = Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]);
        
        Animated.loop(pulse).start();
      }
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      progressAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible, stage]);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleClose = () => {
    if (stage === 'complete' && onClose) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose();
      });
    }
  };

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <LinearGradient
            colors={stageColors[stage]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: Math.min(screenWidth * 0.85, 340),
              borderRadius: 24,
              padding: 32,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 10,
              },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            {/* Animation Container */}
            <Animated.View style={{
              width: 120,
              height: 120,
              marginBottom: 24,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 60,
              transform: [{ scale: pulseAnim }],
            }}>
              <Text style={{ fontSize: 48, textAlign: 'center' }}>
                {stage === 'analyzing' && '🧠'}
                {stage === 'structuring' && '📋'}
                {stage === 'optimizing' && '⚡'}
                {stage === 'finalizing' && '✨'}
                {stage === 'complete' && '🎉'}
              </Text>
            </Animated.View>

            {/* Main Message */}
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: 'white',
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {stageMessages[stage]}
            </Text>

            {/* Topic */}
            <Text style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              marginBottom: 24,
            }}>
              Creating your <Text style={{ fontWeight: '600' }}>{topic}</Text> learning path
            </Text>

            {/* Progress Bar */}
            <View style={{
              width: '100%',
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 16,
            }}>
              <Animated.View
                style={{
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: 4,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }}
              />
            </View>

            {/* Progress Text */}
            <Text style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              marginBottom: 16,
            }}>
              {Math.round(progress)}% complete
            </Text>

            {/* Close Button (only show when complete) */}
            {stage === 'complete' && onClose && (
              <Pressable
                onPress={handleClose}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  marginTop: 8,
                }}
              >
                <Text style={{
                  color: stageColors[stage][0],
                  fontWeight: '600',
                  fontSize: 16,
                }}>
                  Continue
                </Text>
              </Pressable>
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}
