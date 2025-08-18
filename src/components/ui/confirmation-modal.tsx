import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-4">
        <Card className="w-full max-w-sm">
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
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={onCancel}
                disabled={isLoading}
                className="flex-1 flex-row items-center justify-center px-4 py-3 bg-muted rounded-lg"
              >
                <Text className="text-muted-foreground font-medium">
                  {cancelText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirm}
                disabled={isLoading}
                className={`flex-1 flex-row items-center justify-center px-4 py-3 rounded-lg ${
                  isLoading ? 'bg-primary/50' : 'bg-primary'
                }`}
              >
                {isLoading ? (
                  <>
                    <View className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    <Text className="text-primary-foreground font-medium">
                      Processing...
                    </Text>
                  </>
                ) : (
                  <>
                    <Icon name="Check" size={16} color="#ffffff" />
                    <Text className="text-primary-foreground font-medium ml-2">
                      {confirmText}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>
      </View>
    </Modal>
  );
}
