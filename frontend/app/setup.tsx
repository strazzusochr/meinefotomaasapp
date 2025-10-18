import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function SetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    experience_level: 'beginner',
    goal: 'muscle_gain',
    activity_level: 'moderate',
  });

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const createUser = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/users`, {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        gender: formData.gender,
      });

      const userId = response.data.id;
      await AsyncStorage.setItem('userId', userId);

      // Update user preferences
      await axios.put(`${BACKEND_URL}/api/users/${userId}`, {
        experience_level: formData.experience_level,
        goal: formData.goal,
        activity_level: formData.activity_level,
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create profile. Please try again.');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Info</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#666"
        value={formData.name}
        onChangeText={(text) => updateField('name', text)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={formData.email}
        onChangeText={(text) => updateField('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Age"
          placeholderTextColor="#666"
          value={formData.age}
          onChangeText={(text) => updateField('age', text)}
          keyboardType="numeric"
        />
        
        <View style={[styles.input, styles.halfInput, styles.genderContainer]}>
          <TouchableOpacity
            style={[styles.genderButton, formData.gender === 'male' && styles.genderButtonActive]}
            onPress={() => updateField('gender', 'male')}
          >
            <Text style={styles.genderText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, formData.gender === 'female' && styles.genderButtonActive]}
            onPress={() => updateField('gender', 'female')}
          >
            <Text style={styles.genderText}>Female</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Weight (kg)"
          placeholderTextColor="#666"
          value={formData.weight}
          onChangeText={(text) => updateField('weight', text)}
          keyboardType="decimal-pad"
        />
        
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Height (cm)"
          placeholderTextColor="#666"
          value={formData.height}
          onChangeText={(text) => updateField('height', text)}
          keyboardType="decimal-pad"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Training Profile</Text>
      
      <Text style={styles.label}>Experience Level</Text>
      <View style={styles.optionsRow}>
        {['beginner', 'intermediate', 'advanced', 'pro'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.optionButton,
              formData.experience_level === level && styles.optionButtonActive,
            ]}
            onPress={() => updateField('experience_level', level)}
          >
            <Text style={styles.optionText}>{level.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Primary Goal</Text>
      <View style={styles.optionsColumn}>
        {[
          { value: 'muscle_gain', label: 'Muscle Gain' },
          { value: 'strength', label: 'Max Strength' },
          { value: 'fat_loss', label: 'Fat Loss' },
          { value: 'maintenance', label: 'Maintenance' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButtonLarge,
              formData.goal === option.value && styles.optionButtonActive,
            ]}
            onPress={() => updateField('goal', option.value)}
          >
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Activity Level</Text>
      <View style={styles.optionsColumn}>
        {[
          { value: 'sedentary', label: 'Sedentary (Little/No Exercise)' },
          { value: 'light', label: 'Light (1-3 days/week)' },
          { value: 'moderate', label: 'Moderate (3-5 days/week)' },
          { value: 'active', label: 'Active (6-7 days/week)' },
          { value: 'very_active', label: 'Very Active (2x per day)' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButtonLarge,
              formData.activity_level === option.value && styles.optionButtonActive,
            ]}
            onPress={() => updateField('activity_level', option.value)}
          >
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="dumbbell" size={40} color="#ff1e00" />
          <Text style={styles.title}>Profile Setup</Text>
          <Text style={styles.subtitle}>Step {step} of 2</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 2) * 100}%` }]} />
        </View>

        {/* Steps */}
        {step === 1 ? renderStep1() : renderStep2()}

        {/* Navigation */}
        <View style={styles.navigation}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.nextButton, step === 1 && styles.nextButtonFull]}
            onPress={() => {
              if (step === 1) {
                if (!formData.name || !formData.email) {
                  alert('Please fill in all required fields');
                  return;
                }
                setStep(2);
              } else {
                createUser();
              }
            }}
          >
            <Text style={styles.nextButtonText}>
              {step === 2 ? 'COMPLETE SETUP' : 'NEXT'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    marginBottom: 32,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff1e00',
    borderRadius: 2,
  },
  stepContainer: {
    gap: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#252525',
    padding: 16,
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  genderButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#ff1e00',
  },
  genderText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionsColumn: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#252525',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
  },
  optionButtonLarge: {
    backgroundColor: '#252525',
    padding: 16,
    borderRadius: 12,
  },
  optionButtonActive: {
    backgroundColor: '#ff1e00',
  },
  optionText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#333333',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#ff1e00',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});