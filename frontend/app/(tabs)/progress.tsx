import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { format } from 'date-fns';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [progressEntries, setProgressEntries] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  useEffect(() => {
    loadProgress();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to add progress photos!');
    }
  };

  const loadProgress = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/progress/user/${userId}`
      );
      setProgressEntries(response.data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff1e00" />
      </View>
    );
  }

  if (!showAddModal && progressEntries.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="chart-line" size={80} color="#ff1e00" />
          <Text style={styles.emptyTitle}>Track Your Progress</Text>
          <Text style={styles.emptySubtitle}>
            Record measurements and photos to see your transformation
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>ADD FIRST ENTRY</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (selectedEntry) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedEntry(null)}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <ScrollView style={styles.detailScroll}>
          <Text style={styles.detailDate}>
            {format(new Date(selectedEntry.date), 'MMMM dd, yyyy')}
          </Text>

          {selectedEntry.photo_base64 && (
            <Image
              source={{ uri: selectedEntry.photo_base64 }}
              style={styles.detailPhoto}
            />
          )}

          <View style={styles.measurementsGrid}>
            {selectedEntry.weight && (
              <MeasurementCard
                icon="weight"
                label="Weight"
                value={selectedEntry.weight}
                unit="kg"
              />
            )}
            {selectedEntry.body_fat_percentage && (
              <MeasurementCard
                icon="percent"
                label="Body Fat"
                value={selectedEntry.body_fat_percentage}
                unit="%"
              />
            )}
            {selectedEntry.chest_cm && (
              <MeasurementCard
                icon="tape-measure"
                label="Chest"
                value={selectedEntry.chest_cm}
                unit="cm"
              />
            )}
            {selectedEntry.waist_cm && (
              <MeasurementCard
                icon="tape-measure"
                label="Waist"
                value={selectedEntry.waist_cm}
                unit="cm"
              />
            )}
            {selectedEntry.arms_cm && (
              <MeasurementCard
                icon="arm-flex"
                label="Arms"
                value={selectedEntry.arms_cm}
                unit="cm"
              />
            )}
            {selectedEntry.legs_cm && (
              <MeasurementCard
                icon="human"
                label="Legs"
                value={selectedEntry.legs_cm}
                unit="cm"
              />
            )}
          </View>

          {selectedEntry.notes && (
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{selectedEntry.notes}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Summary Stats */}
        {progressEntries.length > 1 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your Progress</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Entries</Text>
                <Text style={styles.summaryValue}>{progressEntries.length}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Latest Weight</Text>
                <Text style={styles.summaryValue}>
                  {progressEntries[0]?.weight || '-'} kg
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Timeline</Text>
        {progressEntries.map((entry) => (
          <TouchableOpacity
            key={entry.id}
            style={styles.timelineCard}
            onPress={() => setSelectedEntry(entry)}
          >
            {entry.photo_base64 ? (
              <Image
                source={{ uri: entry.photo_base64 }}
                style={styles.timelinePhoto}
              />
            ) : (
              <View style={styles.timelinePlaceholder}>
                <MaterialCommunityIcons name="image-outline" size={32} color="#666" />
              </View>
            )}
            <View style={styles.timelineInfo}>
              <Text style={styles.timelineDate}>
                {format(new Date(entry.date), 'MMM dd, yyyy')}
              </Text>
              <View style={styles.timelineMeta}>
                {entry.weight && (
                  <Text style={styles.timelineMetaText}>{entry.weight} kg</Text>
                )}
                {entry.body_fat_percentage && (
                  <Text style={styles.timelineMetaText}>
                    {entry.body_fat_percentage}% BF
                  </Text>
                )}
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Modal */}
      <AddProgressModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadProgress();
        }}
      />
    </View>
  );
}

function MeasurementCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: string;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <View style={styles.measurementCard}>
      <MaterialCommunityIcons name={icon as any} size={24} color="#ff1e00" />
      <View style={styles.measurementValues}>
        <Text style={styles.measurementValue}>{value}</Text>
        <Text style={styles.measurementUnit}>{unit}</Text>
      </View>
      <Text style={styles.measurementLabel}>{label}</Text>
    </View>
  );
}

function AddProgressModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    weight: '',
    body_fat: '',
    chest: '',
    waist: '',
    arms: '',
    legs: '',
    notes: '',
    photo: null as string | null,
  });
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setFormData({
        ...formData,
        photo: `data:image/jpeg;base64,${result.assets[0].base64}`,
      });
    }
  };

  const saveProgress = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        alert('Please set up your profile first');
        return;
      }

      const progressData = {
        user_id: userId,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        body_fat_percentage: formData.body_fat
          ? parseFloat(formData.body_fat)
          : undefined,
        chest_cm: formData.chest ? parseFloat(formData.chest) : undefined,
        waist_cm: formData.waist ? parseFloat(formData.waist) : undefined,
        arms_cm: formData.arms ? parseFloat(formData.arms) : undefined,
        legs_cm: formData.legs ? parseFloat(formData.legs) : undefined,
        notes: formData.notes || undefined,
        photo_base64: formData.photo || undefined,
      };

      await axios.post(`${BACKEND_URL}/api/progress`, progressData);
      onSuccess();
      // Reset form
      setFormData({
        weight: '',
        body_fat: '',
        chest: '',
        waist: '',
        arms: '',
        legs: '',
        notes: '',
        photo: null,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Failed to save progress entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Progress Entry</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {/* Photo */}
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              {formData.photo ? (
                <Image source={{ uri: formData.photo }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <MaterialCommunityIcons name="camera" size={40} color="#666" />
                  <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Measurements */}
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.weight}
                  onChangeText={(text) =>
                    setFormData({ ...formData, weight: text })
                  }
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Body Fat (%)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.body_fat}
                  onChangeText={(text) =>
                    setFormData({ ...formData, body_fat: text })
                  }
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Chest (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.chest}
                  onChangeText={(text) => setFormData({ ...formData, chest: text })}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Waist (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.waist}
                  onChangeText={(text) => setFormData({ ...formData, waist: text })}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Arms (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.arms}
                  onChangeText={(text) => setFormData({ ...formData, arms: text })}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Legs (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.legs}
                  onChangeText={(text) => setFormData({ ...formData, legs: text })}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.notesInputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="How are you feeling?"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveProgress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>SAVE ENTRY</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  addButton: {
    backgroundColor: '#ff1e00',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#333333',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ff1e00',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  timelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  timelinePhoto: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  timelinePlaceholder: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineInfo: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  timelineMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineMetaText: {
    fontSize: 13,
    color: '#888888',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ff1e00',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  backText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  detailDate: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  detailPhoto: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    marginBottom: 24,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  measurementCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  measurementValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    gap: 4,
  },
  measurementValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  measurementUnit: {
    fontSize: 14,
    color: '#666666',
  },
  measurementLabel: {
    fontSize: 13,
    color: '#888888',
    marginTop: 4,
  },
  notesCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  notesText: {
    fontSize: 15,
    color: '#cccccc',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalScroll: {
    padding: 16,
  },
  photoButton: {
    marginBottom: 20,
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#252525',
    borderWidth: 2,
    borderColor: '#333333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  photoPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#252525',
    padding: 14,
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  notesInputContainer: {
    marginBottom: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#ff1e00',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
});