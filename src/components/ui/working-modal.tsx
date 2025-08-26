import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useColorScheme } from '~/lib/utils/useColorScheme';

interface WorkingModalProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'confirm' | 'regenerate';
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function WorkingModal({
  visible,
  title,
  message,
  type,
  onClose,
  onConfirm,
  onCancel,
}: WorkingModalProps) {
  const { isDarkColorScheme } = useColorScheme();
  
  const handleClose = () => {
    console.log('✅ Close button pressed');
    if (onClose) {
      onClose();
    }
  };

  const handleConfirm = () => {
    console.log('✅ Confirm button pressed');
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    console.log('✅ Cancel button pressed');
    if (onCancel) {
      onCancel();
    }
  };

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✓', color: '#10b981' };
      case 'confirm':
        return { icon: '⚠️', color: '#ef4444' };
      case 'regenerate':
        return { icon: '🔄', color: '#3b82f6' };
      default:
        return { icon: '✓', color: '#10b981' };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel || onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: isDarkColorScheme ? '#1f2937' : '#ffffff',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 350,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 60,
              height: 60,
              backgroundColor: color,
              borderRadius: 30,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 24, color: 'white' }}>
              {icon}
            </Text>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: isDarkColorScheme ? '#ffffff' : '#000000',
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
              lineHeight: 22,
              marginBottom: 24,
            }}
          >
            {message}
          </Text>

          {/* Buttons */}
          {type === 'success' ? (
            <TouchableOpacity
              onPress={handleClose}
              style={{
                backgroundColor: color,
                paddingVertical: 12,
                paddingHorizontal: 32,
                borderRadius: 12,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Awesome!
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  flex: 1,
                  backgroundColor: isDarkColorScheme ? '#374151' : '#f3f4f6',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: isDarkColorScheme ? '#d1d5db' : '#4b5563',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                style={{
                  flex: 1,
                  backgroundColor: color,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600',
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
