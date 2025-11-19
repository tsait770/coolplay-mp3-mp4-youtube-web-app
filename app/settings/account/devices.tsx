import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Smartphone, Tablet, Monitor, Watch, Wifi, MoreVertical, Plus } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTranslation } from "@/hooks/useTranslation";
import { useMembership } from "@/providers/MembershipProvider";
import { DeviceBindingModal } from "@/components/DeviceBindingModal";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import QRCodeScanner from "@/components/QRCodeScanner";
import { trpc } from "@/lib/trpc";
import * as Device from "expo-device";

interface BoundDevice {
  id: string;
  device_id: string;
  device_name: string;
  last_login: string;
  created_at: string;
}

export default function DevicesScreen() {
  const { t } = useTranslation();
  const membership = useMembership();
  const membershipType = membership.tier || "free";

  const [devices, setDevices] = useState<BoundDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showBindingModal, setShowBindingModal] = useState<boolean>(false);
  const [showQRDisplay, setShowQRDisplay] = useState<boolean>(false);
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [qrData, setQrData] = useState<{
    qrCodeData: string;
    verificationCode: string;
    expiresAt: string;
  } | null>(null);

  const devicesQuery = trpc.device.listDevices.useQuery();
  const generateVerificationMutation = trpc.device.generateVerification.useMutation();
  const removeDeviceMutation = trpc.device.removeDevice.useMutation();

  useEffect(() => {
    const initDevice = async () => {
      const deviceId = Device.osInternalBuildId || Device.modelId || `${Platform.OS}-${Date.now()}`;
      setCurrentDeviceId(deviceId);
    };
    initDevice();
  }, []);

  useEffect(() => {
    if (devicesQuery.data?.devices) {
      setDevices(devicesQuery.data.devices);
      setIsLoading(false);
    }
  }, [devicesQuery.data]);

  const maxDevices = membershipType === "free" || membershipType === "free_trial" ? 1 : membershipType === "basic" ? 3 : 5;

  const handleRemoveDevice = async (deviceId: string, deviceName: string) => {
    Alert.alert(
      t("remove_device"),
      `${t("remove_device_confirm")} "${deviceName}"?`,
      [
        { text: t("cancel"), style: "cancel" },
        { 
          text: t("remove"), 
          style: "destructive", 
          onPress: async () => {
            try {
              await removeDeviceMutation.mutateAsync({ deviceId });
              await devicesQuery.refetch();
              Alert.alert(t("success"), t("device_removed_successfully"));
            } catch (err) {
              console.error('Failed to remove device:', err);
              Alert.alert(t("error"), t("device_removal_failed"));
            }
          } 
        },
      ]
    );
  };

  const handleAddDevice = () => {
    if (devices.length >= maxDevices) {
      const deviceList = devices
        .map(d => `• ${d.device_name} (${getFormattedDate(d.last_login)})`)
        .join('\n');
      
      Alert.alert(
        t("device_limit_reached"),
        `${t("device_limit_reached_message")}\n\n${t("current_devices")}:\n${deviceList}\n\n${t("remove_device_to_add_new")}`,
        [
          { text: t("cancel"), style: "cancel" },
        ]
      );
    } else {
      Alert.alert(
        t("add_device"),
        t("choose_binding_method"),
        [
          { text: t("cancel"), style: "cancel" },
          { 
            text: t("generate_qr_code"),
            onPress: handleGenerateQRCode,
          },
          { 
            text: t("scan_qr_code"),
            onPress: () => setShowQRScanner(true),
          },
          { 
            text: t("enter_code"),
            onPress: () => setShowBindingModal(true),
          },
        ]
      );
    }
  };

  const handleGenerateQRCode = async () => {
    try {
      const deviceId = currentDeviceId || `${Platform.OS}-${Date.now()}`;
      const deviceName = `${Device.brand || Platform.OS} ${Device.modelName || 'Device'}`;
      
      const result = await generateVerificationMutation.mutateAsync({
        deviceId,
        deviceName,
      });

      setQrData({
        qrCodeData: result.qrCodeData,
        verificationCode: result.verificationCode,
        expiresAt: result.expiresAt,
      });
      setShowQRDisplay(true);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      Alert.alert(t("error"), t("qr_generation_failed"));
    }
  };

  const handleQRScan = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.code) {
        setShowQRScanner(false);
        setShowBindingModal(true);
      }
    } catch (err) {
      console.error('Failed to parse QR code:', err);
      Alert.alert(t("error"), t("invalid_qr_code"));
    }
  };

  const handleBindingSuccess = async () => {
    setShowBindingModal(false);
    await devicesQuery.refetch();
    Alert.alert(t("success"), t("device_bound_successfully"));
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return t("just_now");
    if (diffMins < 60) return `${diffMins} ${t("minutes_ago")}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ${t("hours_ago")}`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ${t("days_ago")}`;
    
    return date.toLocaleDateString();
  };



  const getDeviceIcon = (deviceName: string) => {
    const name = deviceName.toLowerCase();
    if (name.includes('ipad') || name.includes('tablet')) {
      return <Tablet size={24} color={Colors.primary.text} />;
    }
    if (name.includes('mac') || name.includes('laptop')) {
      return <Monitor size={24} color={Colors.primary.text} />;
    }
    if (name.includes('watch')) {
      return <Watch size={24} color={Colors.primary.text} />;
    }
    return <Smartphone size={24} color={Colors.primary.text} />;
  };

  const isCurrentDevice = (deviceId: string) => {
    return deviceId === currentDeviceId;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary.accent} />
        <Text style={styles.loadingText}>{t("loading_devices")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t("device_management")}</Text>
            <Text style={styles.headerDescription}>
              {t("device_management_description")}
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("bound_devices")}</Text>
          </View>

          {devices.length === 0 ? (
            <View style={styles.emptyState}>
              <Smartphone size={48} color={Colors.primary.textSecondary} />
              <Text style={styles.emptyText}>{t("no_devices_bound")}</Text>
              <Text style={styles.emptySubtext}>{t("add_first_device")}</Text>
            </View>
          ) : (
            devices.map((device) => (
              <View key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceIconContainer}>
                  {getDeviceIcon(device.device_name)}
                </View>

                <View style={styles.deviceInfo}>
                  <View style={styles.deviceHeader}>
                    <Text style={styles.deviceName}>{device.device_name}</Text>
                    {isCurrentDevice(device.device_id) && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>{t("current_device")}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.deviceStatus}>
                    <Wifi size={14} color={Colors.success} />
                    <Text style={styles.deviceStatusText}>
                      {t("last_login")}: {getFormattedDate(device.last_login)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => handleRemoveDevice(device.device_id, device.device_name)}
                  disabled={isCurrentDevice(device.device_id)}
                >
                  <MoreVertical size={20} color={isCurrentDevice(device.device_id) ? Colors.primary.textSecondary + '50' : Colors.primary.textSecondary} />
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={styles.limitSection}>
            <Text style={styles.limitTitle}>{t("device_limit")}</Text>
            <Text style={styles.limitCount}>
              {`${t("used")} ${devices.length} / ${maxDevices} ${t("devices")}`}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(devices.length / maxDevices) * 100}%` },
                  devices.length >= maxDevices && styles.progressFillFull,
                ]}
              />
            </View>
            
            {devices.length >= maxDevices && (
              <View style={styles.limitWarning}>
                <Text style={styles.limitWarningText}>
                  {t("device_limit_reached_info")}
                </Text>
              </View>
            )}
            
            <Text style={styles.limitDescription}>
              {t("device_limit_upgrade_description")}
            </Text>
            
            <TouchableOpacity 
              style={styles.addDeviceButton}
              onPress={handleAddDevice}
            >
              <Plus size={20} color={Colors.primary.bg} style={{ marginRight: 8 }} />
              <Text style={styles.addDeviceButtonText}>
                {devices.length >= maxDevices ? t("manage_devices") : t("add_device")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <DeviceBindingModal
        visible={showBindingModal}
        onClose={() => setShowBindingModal(false)}
        onSuccess={handleBindingSuccess}
      />

      <Modal
        visible={showQRDisplay}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQRDisplay(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowQRDisplay(false)}
            >
              <Text style={styles.modalCloseText}>{t("close")}</Text>
            </TouchableOpacity>
            {qrData && (
              <QRCodeDisplay
                qrData={qrData.qrCodeData}
                verificationCode={qrData.verificationCode}
                expiresAt={qrData.expiresAt}
                isLoading={generateVerificationMutation.isPending}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showQRScanner}
        animationType="slide"
        onRequestClose={() => setShowQRScanner(false)}
      >
        <QRCodeScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
          onManualEntry={(code) => {
            setShowQRScanner(false);
            setShowBindingModal(true);
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.bg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.primary.text,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: Colors.primary.textSecondary,
    lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary.text,
  },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary.bg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  deviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.bg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary.text,
  },
  deviceStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deviceStatusText: {
    fontSize: 13,
    color: Colors.primary.textSecondary,
  },
  deviceSyncText: {
    fontSize: 13,
    color: Colors.primary.textSecondary,
  },
  currentBadge: {
    backgroundColor: Colors.primary.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.primary.text,
  },
  moreButton: {
    padding: 8,
  },
  limitSection: {
    marginTop: 24,
    backgroundColor: Colors.secondary.bg,
    borderRadius: 16,
    padding: 16,
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary.text,
    marginBottom: 8,
  },
  limitCount: {
    fontSize: 14,
    color: Colors.primary.textSecondary,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.primary.bg,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary.accent,
    borderRadius: 4,
  },
  limitDescription: {
    fontSize: 13,
    color: Colors.primary.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  progressFillFull: {
    backgroundColor: Colors.semantic.danger,
  },
  limitWarning: {
    backgroundColor: Colors.semantic.danger + '15',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.semantic.danger + '30',
  },
  limitWarningText: {
    fontSize: 13,
    color: Colors.semantic.danger,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  addDeviceButton: {
    backgroundColor: Colors.primary.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  addDeviceButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.primary.bg,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.primary.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.primary.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.primary.textSecondary,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.primary.bg,
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalCloseButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: Colors.primary.accent,
    fontWeight: "600" as const,
  },
});
