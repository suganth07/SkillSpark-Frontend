import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import userSettingsService from '~/services/userSettingsService';
import authService from '~/services/authService';

export default function UserSettingsTest() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      console.log('Current user:', user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const testGetSettings = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching settings for user:', currentUser.id);
      
      const userSettings = await userSettingsService.getUserSettings(currentUser.id);
      setSettings(userSettings);
      
      console.log('Fetched settings:', userSettings);
      Alert.alert('Success', 'Settings loaded successfully!');
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      Alert.alert('Error', `Failed to fetch settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateSettings = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    try {
      setLoading(true);
      const testUpdate = {
        full_name: 'Test User ' + new Date().getTime(),
        theme: (settings?.theme === 'light' ? 'dark' : 'light') as 'light' | 'dark'
      };

      console.log('Updating settings:', testUpdate);
      
      const updatedSettings = await userSettingsService.updateUserSettings(currentUser.id, testUpdate);
      setSettings(updatedSettings);
      
      console.log('Updated settings:', updatedSettings);
      Alert.alert('Success', 'Settings updated successfully!');
    } catch (error: any) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', `Failed to update settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        User Settings Test Component
      </Text>
      
      {currentUser && (
        <Text style={{ marginBottom: 10 }}>
          Current User ID: {currentUser.id}
        </Text>
      )}
      
      <Button 
        title="Test Get Settings"
        onPress={testGetSettings}
        disabled={loading || !currentUser}
      />
      
      <Button 
        title="Test Update Settings"
        onPress={testUpdateSettings}
        disabled={loading || !currentUser || !settings}
      />
      
      {loading && <Text style={{ marginTop: 10 }}>Loading...</Text>}
      
      {settings && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
          <Text style={{ fontWeight: 'bold' }}>Current Settings:</Text>
          <Text>Name: {settings.full_name || 'Not set'}</Text>
          <Text>Description: {settings.about_description || 'Not set'}</Text>
          <Text>Theme: {settings.theme}</Text>
          <Text>Roadmap Depth: {settings.default_roadmap_depth}</Text>
          <Text>Video Length: {settings.default_video_length}</Text>
        </View>
      )}
    </View>
  );
}
