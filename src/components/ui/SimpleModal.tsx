import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface SimpleModalProps {
  visible: boolean;
  title: string;
  message: string;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const SimpleModal: React.FC<SimpleModalProps> = ({
  visible,
  title,
  message,
  showCancel = false,
  confirmText = "OK",
  cancelText = "Cancel", 
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          width: '100%',
          maxWidth: 320,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 16,
            color: '#333',
          }}>
            {title}
          </Text>
          
          <Text style={{
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 24,
            color: '#666',
            lineHeight: 22,
          }}>
            {message}
          </Text>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: showCancel ? 'space-between' : 'center',
            gap: 12,
          }}>
            {showCancel && onCancel && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={{
                flex: showCancel ? 1 : 0,
                backgroundColor: confirmText === 'Delete' ? '#ef4444' : '#3b82f6',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
                minWidth: showCancel ? undefined : 120,
              }}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: 'white',
              }}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
