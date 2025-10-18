import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const MUSCLE_GROUPS = [
  { value: 'chest', label: 'Chest', icon: 'arm-flex' },
  { value: 'back', label: 'Back', icon: 'shield' },
  { value: 'legs', label: 'Legs', icon: 'run' },
  { value: 'shoulders', label: 'Shoulders', icon: 'triangle' },
  { value: 'arms', label: 'Arms', icon: 'arm-flex-outline' },
  { value: 'core', label: 'Core', icon: 'ab-testing' },
];

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [selectedMuscle, searchQuery, exercises]);

  const loadExercises = async () => {
    try {
      // First check if we have exercises
      const response = await axios.get(`${BACKEND_URL}/api/exercises`);
      
      if (response.data.length === 0) {
        // Seed some initial exercises
        await seedExercises();
        const newResponse = await axios.get(`${BACKEND_URL}/api/exercises`);
        setExercises(newResponse.data);
        setFilteredExercises(newResponse.data);
      } else {
        setExercises(response.data);
        setFilteredExercises(response.data);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedExercises = async () => {
    const sampleExercises = [
      {
        name: 'Barbell Bench Press',
        muscle_groups: ['chest', 'shoulders', 'arms'],
        equipment: 'barbell',
        difficulty: 'intermediate',
        description: 'The king of chest exercises. Builds massive pecs and overall upper body strength.',
        instructions: [
          'Lie flat on bench with feet planted firmly on ground',
          'Grip bar slightly wider than shoulder width',
          'Lower bar to mid-chest with control',
          'Press explosively back to start position',
          'Keep elbows at 45-degree angle'
        ],
        tips: ['Retract shoulder blades', 'Drive through heels', 'Control the negative']
      },
      {
        name: 'Deadlift',
        muscle_groups: ['back', 'legs', 'core'],
        equipment: 'barbell',
        difficulty: 'advanced',
        description: 'The ultimate mass builder. Works entire posterior chain and builds raw strength.',
        instructions: [
          'Stand with feet hip-width apart, bar over mid-foot',
          'Bend and grip bar just outside legs',
          'Chest up, back straight, engage lats',
          'Drive through heels, extend hips and knees',
          'Lock out at top, control descent'
        ],
        tips: ['Keep bar close to body', 'Neutral spine', 'Breathe and brace core']
      },
      {
        name: 'Barbell Squat',
        muscle_groups: ['legs', 'core'],
        equipment: 'barbell',
        difficulty: 'intermediate',
        description: 'Build massive legs and overall strength. The foundation of any serious program.',
        instructions: [
          'Bar on upper traps, feet shoulder-width',
          'Break at hips and knees simultaneously',
          'Descend until thighs parallel or below',
          'Drive through heels to stand',
          'Keep chest up, core tight'
        ],
        tips: ['Knees track over toes', 'Full depth', 'Controlled tempo']
      },
      {
        name: 'Overhead Press',
        muscle_groups: ['shoulders', 'arms', 'core'],
        equipment: 'barbell',
        difficulty: 'intermediate',
        description: 'Build boulder shoulders and pressing strength.',
        instructions: [
          'Start with bar at shoulder height',
          'Feet shoulder-width, core braced',
          'Press bar overhead in straight line',
          'Lock out arms at top',
          'Lower with control'
        ],
        tips: ['Tight core', 'Bar path over mid-foot', 'Full lockout']
      },
      {
        name: 'Pull-ups',
        muscle_groups: ['back', 'arms'],
        equipment: 'bodyweight',
        difficulty: 'intermediate',
        description: 'Build a wide, thick back and powerful grip.',
        instructions: [
          'Hang from bar with overhand grip',
          'Engage lats, retract shoulder blades',
          'Pull until chin over bar',
          'Lower with control',
          'Full extension at bottom'
        ],
        tips: ['Lead with chest', 'Control descent', 'Full range of motion']
      },
      {
        name: 'Barbell Row',
        muscle_groups: ['back', 'arms'],
        equipment: 'barbell',
        difficulty: 'intermediate',
        description: 'Build thick back muscles and improve posture.',
        instructions: [
          'Hinge at hips, back straight',
          'Grip bar shoulder-width',
          'Pull bar to lower chest',
          'Squeeze shoulder blades',
          'Lower with control'
        ],
        tips: ['Keep core tight', 'Row to sternum', 'Retract scapula']
      },
      {
        name: 'Dumbbell Shoulder Press',
        muscle_groups: ['shoulders', 'arms'],
        equipment: 'dumbbell',
        difficulty: 'beginner',
        description: 'Isolate and build shoulder mass with greater range of motion.',
        instructions: [
          'Sit with back supported',
          'Start with dumbbells at shoulder height',
          'Press up until arms extended',
          'Lower with control',
          'Keep core engaged'
        ],
        tips: ['Full range of motion', 'Control the weight', 'Neutral wrists']
      },
      {
        name: 'Romanian Deadlift',
        muscle_groups: ['legs', 'back'],
        equipment: 'barbell',
        difficulty: 'intermediate',
        description: 'Target hamstrings and glutes, build posterior chain.',
        instructions: [
          'Start standing with bar at hip height',
          'Hinge at hips, slight knee bend',
          'Lower bar along legs',
          'Feel stretch in hamstrings',
          'Return to start by extending hips'
        ],
        tips: ['Soft knees', 'Neutral spine', 'Feel the stretch']
      },
      {
        name: 'Plank',
        muscle_groups: ['core'],
        equipment: 'bodyweight',
        difficulty: 'beginner',
        description: 'Build core stability and endurance.',
        instructions: [
          'Start in push-up position',
          'Lower to forearms',
          'Keep body in straight line',
          'Engage core, glutes',
          'Hold for time'
        ],
        tips: ['Don\'t sag hips', 'Squeeze glutes', 'Breathe steadily']
      },
      {
        name: 'Dips',
        muscle_groups: ['chest', 'arms', 'shoulders'],
        equipment: 'bodyweight',
        difficulty: 'intermediate',
        description: 'Build lower chest and triceps with bodyweight.',
        instructions: [
          'Support body on parallel bars',
          'Lean forward slightly',
          'Lower until upper arms parallel',
          'Press back to start',
          'Keep core tight'
        ],
        tips: ['Control descent', 'Full range', 'Shoulder-friendly position']
      },
    ];

    for (const ex of sampleExercises) {
      try {
        await axios.post(`${BACKEND_URL}/api/exercises`, ex);
      } catch (error) {
        console.error('Error seeding exercise:', error);
      }
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (selectedMuscle) {
      filtered = filtered.filter((ex) =>
        ex.muscle_groups.includes(selectedMuscle)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
  };

  if (selectedExercise) {
    return (
      <View style={styles.detailContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedExercise(null)}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <ScrollView style={styles.detailScroll}>
          <Text style={styles.detailTitle}>{selectedExercise.name}</Text>
          
          <View style={styles.detailTags}>
            {selectedExercise.muscle_groups.map((muscle: string) => (
              <View key={muscle} style={styles.tag}>
                <Text style={styles.tagText}>{muscle.toUpperCase()}</Text>
              </View>
            ))}
            <View style={[styles.tag, styles.equipmentTag]}>
              <Text style={styles.tagText}>{selectedExercise.equipment}</Text>
            </View>
            <View style={[styles.tag, getDifficultyColor(selectedExercise.difficulty)]}>
              <Text style={styles.tagText}>{selectedExercise.difficulty}</Text>
            </View>
          </View>

          <Text style={styles.detailDescription}>{selectedExercise.description}</Text>

          <Text style={styles.detailSectionTitle}>INSTRUCTIONS</Text>
          {selectedExercise.instructions.map((instruction: string, index: number) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}

          {selectedExercise.tips && selectedExercise.tips.length > 0 && (
            <>
              <Text style={styles.detailSectionTitle}>PRO TIPS</Text>
              {selectedExercise.tips.map((tip: string, index: number) => (
                <View key={index} style={styles.tipItem}>
                  <MaterialCommunityIcons name="lightning-bolt" size={16} color="#ff1e00" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff1e00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
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

      {/* Muscle Group Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedMuscle && styles.filterChipActive,
          ]}
          onPress={() => setSelectedMuscle(null)}
        >
          <Text style={styles.filterChipText}>All</Text>
        </TouchableOpacity>
        {MUSCLE_GROUPS.map((group) => (
          <TouchableOpacity
            key={group.value}
            style={[
              styles.filterChip,
              selectedMuscle === group.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedMuscle(group.value)}
          >
            <MaterialCommunityIcons
              name={group.icon as any}
              size={16}
              color={selectedMuscle === group.value ? '#ffffff' : '#888'}
            />
            <Text style={styles.filterChipText}>{group.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise List */}
      <ScrollView style={styles.exerciseList}>
        <Text style={styles.resultCount}>
          {filteredExercises.length} exercises found
        </Text>
        {filteredExercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => setSelectedExercise(exercise)}
          >
            <View style={styles.exerciseIconContainer}>
              <MaterialCommunityIcons name="dumbbell" size={32} color="#ff1e00" />
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseMuscles}>
                {exercise.muscle_groups.join(', ')}
              </Text>
              <View style={styles.exerciseMeta}>
                <Text style={styles.exerciseEquipment}>{exercise.equipment}</Text>
                <Text style={styles.exerciseDifficulty}>
                  {exercise.difficulty}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'beginner':
      return { backgroundColor: '#27ae60' };
    case 'intermediate':
      return { backgroundColor: '#f39c12' };
    case 'advanced':
      return { backgroundColor: '#e74c3c' };
    default:
      return { backgroundColor: '#666' };
  }
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
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#ff1e00',
  },
  filterChipText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  exerciseIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#252525',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  exerciseMuscles: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  exerciseEquipment: {
    fontSize: 11,
    color: '#ff1e00',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  exerciseDifficulty: {
    fontSize: 11,
    color: '#ffa502',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
  detailTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  detailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#ff1e00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  equipmentTag: {
    backgroundColor: '#27ae60',
  },
  tagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailDescription: {
    fontSize: 15,
    color: '#cccccc',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ff1e00',
    marginBottom: 12,
    letterSpacing: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff1e00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionNumberText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#cccccc',
  },
});