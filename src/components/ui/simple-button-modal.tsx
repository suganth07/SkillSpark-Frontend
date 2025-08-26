import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

interface SimpleButtonModalProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'confirm' | 'regenerate';
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function SimpleButtonModal({
  visible,
  title,
  message,
  type,
  onClose,
  onConfirm,
  onCancel,
}: SimpleButtonModalProps) {
  
  const handleClose = () => {
    console.log('✅ Close button pressed');
    Alert.alert('Debug', 'Close button works!');
    if (onClose) {
      onClose();
    }
  };

  const handleConfirm = () => {
    console.log('✅ Confirm button pressed');
    Alert.alert('Debug', 'Confirm button works!');
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    console.log('✅ Cancel button pressed');
    Alert.alert('Debug', 'Cancel button works!');
    if (onCancel) {
      onCancel();
    }
  };

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 24,
          margin: 24,
          minWidth: 300,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
          {title}
        </Text>
        
        <Text style={{ fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
          {message}
        </Text>

        {type === 'success' ? (
          <TouchableOpacity
            onPress={handleClose}
            style={{
              backgroundColor: '#10b981',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Awesome!
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={handleCancel}
              style={{
                flex: 1,
                backgroundColor: '#f3f4f6',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#4b5563', fontSize: 16, fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                flex: 1,
                backgroundColor: type === 'confirm' ? '#ef4444' : '#3b82f6',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                {type === 'confirm' ? 'Delete' : 'Regenerate'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
