import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

interface BasicModalProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'confirm' | 'regenerate';
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function BasicModal({
  visible,
  title,
  message,
  type,
  onClose,
  onConfirm,
  onCancel,
}: BasicModalProps) {

  const handleClose = () => {
    console.log('Close pressed');
    onClose?.();
  };

  const handleConfirm = () => {
    console.log('Confirm pressed');
    onConfirm?.();
  };

  const handleCancel = () => {
    console.log('Cancel pressed');
    onCancel?.();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel || handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          
          {/* Icon */}
          <View style={[styles.icon, { backgroundColor: type === 'success' ? '#22c55e' : type === 'confirm' ? '#ef4444' : '#3b82f6' }]}>
            <Text style={styles.iconText}>
              {type === 'success' ? '✓' : type === 'confirm' ? '!' : '↻'}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          {type === 'success' ? (
            <TouchableOpacity style={[styles.button, styles.successButton]} onPress={handleClose}>
              <Text style={styles.buttonText}>Awesome!</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, type === 'confirm' ? styles.deleteButton : styles.confirmButton]} 
                onPress={handleConfirm}
              >
                <Text style={styles.buttonText}>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  successButton: {
    backgroundColor: '#22c55e',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
});
