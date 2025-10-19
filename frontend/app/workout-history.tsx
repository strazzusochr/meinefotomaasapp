import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<any[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [filter, setFilter] = useState('all'); // all, week, month
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    filterWorkouts();
  }, [filter, searchQuery, workouts]);

  const loadWorkouts = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/workouts/user/${userId}`
      );
      setWorkouts(response.data);
      setFilteredWorkouts(response.data);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWorkouts = () => {
    let filtered = [...workouts];

    // Time filter
    if (filter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter((w) => new Date(w.date) >= oneWeekAgo);
    } else if (filter === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter((w) => new Date(w.date) >= oneMonthAgo);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((w) =>
        w.workout_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.exercises.some((ex: any) =>
          ex.exercise_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredWorkouts(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getWorkoutTypeIcon = (type: string) => {
    const icons: any = {
      push: 'arrow-up-bold',
      pull: 'arrow-down-bold',
      legs: 'run',
      upper: 'arm-flex',
      lower: 'leg',
      full_body: 'human',
      custom: 'dumbbell',
    };
    return icons[type] || 'dumbbell';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff1e00" />
      </View>
    );
  }

  if (selectedWorkout) {
    return (
      <View style={styles.container}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedWorkout(null)}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle}>Workout Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.detailScroll}>
          {/* Date & Type */}
          <View style={styles.detailDateCard}>
            <Text style={styles.detailDate}>
              {new Date(selectedWorkout.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            <View style={styles.detailTypeChip}>
              <MaterialCommunityIcons
                name={getWorkoutTypeIcon(selectedWorkout.workout_type)}
                size={20}
                color="#ff1e00"
              />
              <Text style={styles.detailTypeText}>
                {selectedWorkout.workout_type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.detailStatsCard}>
            <View style={styles.detailStat}>
              <MaterialCommunityIcons name="timer" size={24} color="#ff1e00" />
              <Text style={styles.detailStatValue}>
                {selectedWorkout.duration_minutes || 0} min
              </Text>
              <Text style={styles.detailStatLabel}>Duration</Text>
            </View>
            <View style={styles.detailStatDivider} />
            <View style={styles.detailStat}>
              <MaterialCommunityIcons name="weight-kilogram" size={24} color="#ff1e00" />
              <Text style={styles.detailStatValue}>
                {Math.round(selectedWorkout.total_volume || 0)} kg
              </Text>
              <Text style={styles.detailStatLabel}>Total Volume</Text>
            </View>
            <View style={styles.detailStatDivider} />
            <View style={styles.detailStat}>
              <MaterialCommunityIcons name="dumbbell" size={24} color="#ff1e00" />
              <Text style={styles.detailStatValue}>
                {selectedWorkout.exercises.length}
              </Text>
              <Text style={styles.detailStatLabel}>Exercises</Text>
            </View>
          </View>

          {/* Exercises */}
          <Text style={styles.detailSectionTitle}>EXERCISES</Text>
          {selectedWorkout.exercises.map((exercise: any, index: number) => (
            <View key={index} style={styles.detailExerciseCard}>
              <Text style={styles.detailExerciseName}>{exercise.exercise_name}</Text>
              
              {/* Sets */}
              <View style={styles.detailSetsContainer}>
                {exercise.sets.map((set: any, setIndex: number) => (
                  <View key={setIndex} style={styles.detailSetRow}>
                    <View style={styles.detailSetNumber}>
                      <Text style={styles.detailSetNumberText}>{set.set_number}</Text>
                    </View>
                    <Text style={styles.detailSetText}>
                      {set.weight} kg × {set.reps} reps
                    </Text>
                    <Text style={styles.detailSetVolume}>
                      {Math.round(set.weight * set.reps)} kg
                    </Text>
                  </View>
                ))}
              </View>

              {/* Exercise Notes */}
              {exercise.notes && (
                <View style={styles.detailExerciseNotes}>
                  <MaterialCommunityIcons name="note-text" size={16} color="#888" />
                  <Text style={styles.detailExerciseNotesText}>{exercise.notes}</Text>
                </View>
              )}
            </View>
          ))}

          {/* Workout Notes */}
          {selectedWorkout.notes && (
            <View style={styles.detailNotesCard}>
              <Text style={styles.detailSectionTitle}>NOTES</Text>
              <Text style={styles.detailNotesText}>{selectedWorkout.notes}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search workouts..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {['all', 'week', 'month'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={styles.filterChipText}>
              {f === 'all' ? 'All Time' : f === 'week' ? 'This Week' : 'This Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Workouts</Text>
          <Text style={styles.summaryValue}>{filteredWorkouts.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Volume</Text>
          <Text style={styles.summaryValue}>
            {Math.round(
              filteredWorkouts.reduce((sum, w) => sum + (w.total_volume || 0), 0) / 1000
            )}k kg
          </Text>
        </View>
      </View>

      {/* Workout List */}
      <ScrollView style={styles.workoutList}>
        {filteredWorkouts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="weight-lifter" size={60} color="#666" />
            <Text style={styles.emptyText}>No workouts found</Text>
          </View>
        ) : (
          filteredWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
              onPress={() => setSelectedWorkout(workout)}
            >
              <View style={styles.workoutIconContainer}>
                <MaterialCommunityIcons
                  name={getWorkoutTypeIcon(workout.workout_type)}
                  size={28}
                  color="#ff1e00"
                />
              </View>

              <View style={styles.workoutInfo}>
                <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
                <Text style={styles.workoutType}>
                  {workout.workout_type.replace('_', ' ').toUpperCase()}
                </Text>
                <View style={styles.workoutMeta}>
                  <Text style={styles.workoutMetaText}>
                    {workout.exercises.length} exercises
                  </Text>
                  <Text style={styles.workoutMetaDot}>•</Text>
                  <Text style={styles.workoutMetaText}>
                    {Math.round(workout.total_volume || 0)} kg
                  </Text>
                  {workout.duration_minutes && (
                    <>
                      <Text style={styles.workoutMetaDot}>•</Text>
                      <Text style={styles.workoutMetaText}>
                        {workout.duration_minutes} min
                      </Text>
                    </>
                  )}
                </View>
              </View>

              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
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
  filterScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#ff1e00',
  },
  filterChipText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
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
  workoutList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  workoutIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  workoutType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff1e00',
    marginBottom: 6,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workoutMetaText: {
    fontSize: 12,
    color: '#888888',
  },
  workoutMetaDot: {
    fontSize: 12,
    color: '#666666',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  detailScroll: {
    flex: 1,
    padding: 16,
  },
  detailDateCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  detailDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  detailTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  detailTypeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  detailStatsCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  detailStat: {
    flex: 1,
    alignItems: 'center',
  },
  detailStatDivider: {
    width: 1,
    backgroundColor: '#333333',
  },
  detailStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
  },
  detailStatLabel: {
    fontSize: 12,
    color: '#888888',
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ff1e00',
    marginBottom: 12,
    letterSpacing: 1,
  },
  detailExerciseCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  detailExerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  detailSetsContainer: {
    gap: 8,
  },
  detailSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailSetNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailSetNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  detailSetText: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
  },
  detailSetVolume: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
  },
  detailExerciseNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#252525',
    gap: 8,
  },
  detailExerciseNotesText: {
    flex: 1,
    fontSize: 13,
    color: '#888888',
    fontStyle: 'italic',
  },
  detailNotesCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  detailNotesText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
});
