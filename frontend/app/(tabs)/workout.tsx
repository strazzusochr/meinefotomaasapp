import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface WorkoutSet {
  set_number: number;
  reps: number;
  weight: number;
  rest_seconds: number;
  completed: boolean;
}

interface WorkoutExercise {
  exercise_id: string;
  exercise_name: string;
  sets: WorkoutSet[];
  notes?: string;
}

export default function WorkoutScreen() {
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [exercises, setExercises] = useState<any[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [workoutType, setWorkoutType] = useState('custom');
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    let interval: any;
    if (workoutInProgress && startTime) {
      interval = setInterval(() => {
        const diff = Date.now() - startTime.getTime();
        setElapsedMinutes(Math.floor(diff / 60000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutInProgress, startTime]);

  const loadExercises = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/exercises`);
      setExercises(response.data);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const startWorkout = () => {
    setWorkoutInProgress(true);
    setStartTime(new Date());
    setElapsedMinutes(0);
  };

  const addExercise = (exercise: any) => {
    const newExercise: WorkoutExercise = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      sets: [
        { set_number: 1, reps: 8, weight: 0, rest_seconds: 60, completed: false },
      ],
    };
    setWorkoutExercises([...workoutExercises, newExercise]);
    setShowExercisePicker(false);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...workoutExercises];
    const exercise = updated[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    exercise.sets.push({
      set_number: exercise.sets.length + 1,
      reps: lastSet.reps,
      weight: lastSet.weight,
      rest_seconds: 60,
      completed: false,
    });
    setWorkoutExercises(updated);
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    value: any
  ) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setWorkoutExercises(updated);
  };

  const removeExercise = (exerciseIndex: number) => {
    const updated = workoutExercises.filter((_, i) => i !== exerciseIndex);
    setWorkoutExercises(updated);
  };

  const saveWorkout = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        alert('Please set up your profile first');
        return;
      }

      const workoutData = {
        user_id: userId,
        workout_type: workoutType,
        exercises: workoutExercises,
        duration_minutes: elapsedMinutes,
      };

      await axios.post(`${BACKEND_URL}/api/workouts`, workoutData);
      
      alert('Workout saved! +10 performance points');
      setWorkoutInProgress(false);
      setWorkoutExercises([]);
      setStartTime(null);
      setElapsedMinutes(0);
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout');
    }
  };

  const cancelWorkout = () => {
    setWorkoutInProgress(false);
    setWorkoutExercises([]);
    setStartTime(null);
    setElapsedMinutes(0);
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!workoutInProgress) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="weight-lifter" size={80} color="#ff1e00" />
          <Text style={styles.emptyTitle}>Ready to Train?</Text>
          <Text style={styles.emptySubtitle}>
            Start a workout and track your sets, reps, and weight
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
            <Text style={styles.startButtonText}>START WORKOUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.workoutHeader}>
        <View style={styles.timerContainer}>
          <MaterialCommunityIcons name="timer" size={20} color="#ff1e00" />
          <Text style={styles.timerText}>{elapsedMinutes} min</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={cancelWorkout}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.finishButton}
            onPress={saveWorkout}
            disabled={workoutExercises.length === 0}
          >
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.workoutContent}>
        {/* Exercises */}
        {workoutExercises.map((exercise, exerciseIndex) => (
          <View key={exerciseIndex} style={styles.exerciseBlock}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
              <TouchableOpacity onPress={() => removeExercise(exerciseIndex)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Sets */}
            {exercise.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setRow}>
                <Text style={styles.setNumber}>{set.set_number}</Text>
                
                <View style={styles.setInputContainer}>
                  <TextInput
                    style={styles.setInput}
                    value={set.weight.toString()}
                    onChangeText={(text) =>
                      updateSet(exerciseIndex, setIndex, 'weight', parseFloat(text) || 0)
                    }
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="#666"
                  />
                  <Text style={styles.setUnit}>kg</Text>
                </View>

                <Text style={styles.setX}>×</Text>

                <View style={styles.setInputContainer}>
                  <TextInput
                    style={styles.setInput}
                    value={set.reps.toString()}
                    onChangeText={(text) =>
                      updateSet(exerciseIndex, setIndex, 'reps', parseInt(text) || 0)
                    }
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="#666"
                  />
                  <Text style={styles.setUnit}>reps</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    set.completed && styles.checkButtonCompleted,
                  ]}
                  onPress={() =>
                    updateSet(exerciseIndex, setIndex, 'completed', !set.completed)
                  }
                >
                  <MaterialCommunityIcons
                    name={set.completed ? 'check' : 'checkbox-blank-outline'}
                    size={24}
                    color={set.completed ? '#ffffff' : '#666'}
                  />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => addSet(exerciseIndex)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#ff1e00" />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setShowExercisePicker(true)}
        >
          <MaterialCommunityIcons name="plus-circle" size={24} color="#ff1e00" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Exercise Picker Modal */}
      <Modal
        visible={showExercisePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExercisePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Exercise</Text>
              <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView style={styles.exercisePickerList}>
              {filteredExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exercisePickerItem}
                  onPress={() => addExercise(exercise)}
                >
                  <Text style={styles.exercisePickerName}>{exercise.name}</Text>
                  <Text style={styles.exercisePickerMuscles}>
                    {exercise.muscle_groups.join(', ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
  startButton: {
    backgroundColor: '#ff1e00',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#ff1e00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  workoutContent: {
    flex: 1,
    padding: 16,
  },
  exerciseBlock: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  setNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#252525',
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
    color: '#ffffff',
    fontWeight: '700',
  },
  setInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 8,
    paddingHorizontal: 12,
    flex: 1,
    gap: 4,
  },
  setInput: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 10,
    flex: 1,
  },
  setUnit: {
    color: '#666666',
    fontSize: 12,
  },
  setX: {
    color: '#666666',
    fontSize: 18,
    fontWeight: '700',
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: '#27ae60',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    marginTop: 8,
  },
  addSetText: {
    color: '#ff1e00',
    fontSize: 14,
    fontWeight: '700',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333333',
    borderStyle: 'dashed',
  },
  addExerciseText: {
    color: '#ff1e00',
    fontSize: 16,
    fontWeight: '700',
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
    maxHeight: '80%',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  exercisePickerList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  exercisePickerItem: {
    padding: 16,
    backgroundColor: '#252525',
    borderRadius: 12,
    marginBottom: 12,
  },
  exercisePickerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  exercisePickerMuscles: {
    fontSize: 13,
    color: '#888888',
  },
});