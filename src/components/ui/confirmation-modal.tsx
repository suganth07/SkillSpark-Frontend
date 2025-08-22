import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Card, CardContent } from "./card";
import Icon from "~/lib/icons/Icon";
import { useColorScheme } from "~/lib/utils/useColorScheme";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  const { isDarkColorScheme } = useColorScheme();

  // Platform-specific styles to ensure proper rendering
  const overlayStyle = [
    styles.overlay,
    Platform.OS === 'web' && styles.webOverlay
  ];

  const modalContainerStyle = [
    styles.modalContainer,
    Platform.OS === 'web' && styles.webModalContainer
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={overlayStyle}>
        <View style={modalContainerStyle}>
          <Card className="w-full max-w-sm" style={styles.card}>
            <CardContent className="p-6">
              {/* Header */}
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                  <Icon name="RotateCcw" size={20} color="#4f46e5" />
                </View>
                <Text className="text-xl font-semibold text-foreground flex-1">
                  {title}
                </Text>
              </View>

              {/* Message */}
              <Text className="text-base text-muted-foreground mb-6 leading-relaxed">
                {message}
              </Text>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={onCancel}
                  disabled={isLoading}
                  style={[styles.button, styles.cancelButton]}
                  className="bg-muted rounded-lg"
                >
                  <Text className="text-muted-foreground font-medium">
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  disabled={isLoading}
                  style={[
                    styles.button,
                    styles.confirmButton,
                    isLoading && styles.confirmButtonLoading
                  ]}
                  className={`rounded-lg ${
                    isLoading ? 'bg-primary/50' : 'bg-primary'
                  }`}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <View style={styles.spinner} className="border-white/30 border-t-white" />
                      <Text className="text-primary-foreground font-medium ml-2">
                        Processing...
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.confirmContainer}>
                      <Icon name="Check" size={16} color="#ffffff" />
                      <Text className="text-primary-foreground font-medium ml-2">
                        {confirmText}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>
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
    padding: 16,
  },
  webOverlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  modalContainer: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 400 : screenWidth - 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webModalContainer: {
    position: 'relative' as any,
  },
  card: {
    width: '100%',
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  cancelButton: {
    // Additional cancel button styles if needed
  },
  confirmButton: {
    // Additional confirm button styles if needed
  },
  confirmButtonLoading: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 8,
    borderTopColor: '#ffffff',
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
});
