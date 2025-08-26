import React from 'react';
import { View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useColorScheme } from '~/lib/utils/useColorScheme';

interface SimpleModalProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'confirm' | 'regenerate';
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function SimpleModal({
  visible,
  title,
  message,
  type,
  onClose,
  onConfirm,
  onCancel,
}: SimpleModalProps) {
  const { isDarkColorScheme } = useColorScheme();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✓', color: '#10b981' };
      case 'confirm':
        return { icon: '!', color: '#ef4444' };
      case 'regenerate':
        return { icon: '↻', color: '#3b82f6' };
      default:
        return { icon: '✓', color: '#10b981' };
    }
  };

  const { icon, color } = getIconAndColor();

  const handleClose = () => {
    console.log('Close button pressed');
    if (onClose) {
      onClose();
    }
  };

  const handleConfirm = () => {
    console.log('Confirm button pressed');
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    console.log('Cancel button pressed');
    if (onCancel) {
      onCancel();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel || onClose}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: screenWidth,
          height: screenHeight,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            backgroundColor: isDarkColorScheme ? '#1f2937' : '#ffffff',
            borderRadius: 16,
            padding: 32,
            width: '100%',
            maxWidth: 340,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 64,
              height: 64,
              backgroundColor: color,
              borderRadius: 32,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>
              {icon}
            </Text>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: isDarkColorScheme ? '#ffffff' : '#111827',
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            style={{
              fontSize: 16,
              color: isDarkColorScheme ? '#9ca3af' : '#6b7280',
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 28,
            }}
          >
            {message}
          </Text>

          {/* Buttons */}
          {type === 'success' ? (
            // Single button for success
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              style={{
                backgroundColor: color,
                paddingHorizontal: 32,
                paddingVertical: 12,
                borderRadius: 12,
                width: '100%',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                Awesome!
              </Text>
            </TouchableOpacity>
          ) : (
            // Two buttons for confirm/regenerate
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={handleCancel}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: isDarkColorScheme ? '#374151' : '#f3f4f6',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    color: isDarkColorScheme ? '#d1d5db' : '#4b5563',
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: color,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  {type === 'confirm' ? 'Delete' : 'Regenerate'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
