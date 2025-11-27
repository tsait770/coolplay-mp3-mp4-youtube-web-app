import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = '@device_id';

export async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      deviceId = await generateDeviceId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return generateFallbackDeviceId();
  }
}

async function generateDeviceId(): Promise<string> {
  try {
    const parts: string[] = [];
    
    // 使用 expo-device 和 expo-constants 獲取裝置資訊
    const deviceModel = Device.modelName || Device.deviceName || 'unknown-device';
    const installationId = Constants.installationId || Constants.sessionId || 'unknown-installation';
    
    parts.push(Platform.OS);
    parts.push(deviceModel);
    parts.push(installationId);
    
    if (parts.length === 0) {
      return generateFallbackDeviceId();
    }
    
    return parts.join('-');
  } catch (error) {
    console.error('Error generating device ID:', error);
    return generateFallbackDeviceId();
  }
}

function generateFallbackDeviceId(): string {
  return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export async function getDeviceInfo() {
  const deviceId = await getDeviceId();
  
  return {
    deviceId,
    deviceName: await getDeviceName(),
    platform: Platform.OS,
    version: Platform.Version,
  };
}

async function getDeviceName(): Promise<string> {
  try {
    const deviceName = Device.modelName || Device.deviceName || 'Unknown Device';
    const brand = Device.brand || '';
    return brand ? `${brand} ${deviceName}` : deviceName;
  } catch {
    return 'Unknown Device';
  }
}
