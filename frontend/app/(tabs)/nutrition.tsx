import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function NutritionScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const [selectedGoal, setSelectedGoal] = useState('muscle_gain');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }

      const userResponse = await axios.get(`${BACKEND_URL}/api/users/${userId}`);
      setUser(userResponse.data);

      const plansResponse = await axios.get(
        `${BACKEND_URL}/api/nutrition/user/${userId}`
      );
      if (plansResponse.data.length > 0) {
        setNutritionPlan(plansResponse.data[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNutrition = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        alert('Please set up your profile first');
        return;
      }

      if (!user?.weight || !user?.height || !user?.age) {
        alert('Please complete your profile with weight, height, and age');
        return;
      }

      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/nutrition/calculate`, {
        user_id: userId,
        goal: selectedGoal,
      });
      
      setNutritionPlan(response.data);
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      alert('Failed to calculate nutrition plan');
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

  if (!nutritionPlan) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="food-apple" size={80} color="#ff1e00" />
          <Text style={styles.emptyTitle}>Nutrition Calculator</Text>
          <Text style={styles.emptySubtitle}>
            Calculate your personalized macro goals based on your stats and goals
          </Text>

          <Text style={styles.label}>Select Your Goal</Text>
          <View style={styles.goalsContainer}>
            {[
              { value: 'muscle_gain', label: 'Muscle Gain', icon: 'arm-flex' },
              { value: 'fat_loss', label: 'Fat Loss', icon: 'fire' },
              { value: 'maintenance', label: 'Maintenance', icon: 'scale-balance' },
            ].map((goal) => (
              <TouchableOpacity
                key={goal.value}
                style={[
                  styles.goalCard,
                  selectedGoal === goal.value && styles.goalCardActive,
                ]}
                onPress={() => setSelectedGoal(goal.value)}
              >
                <MaterialCommunityIcons
                  name={goal.icon as any}
                  size={40}
                  color={selectedGoal === goal.value ? '#ffffff' : '#ff1e00'}
                />
                <Text style={styles.goalText}>{goal.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.calculateButton}
            onPress={calculateNutrition}
          >
            <Text style={styles.calculateButtonText}>CALCULATE PLAN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const macroPercentages = {
    protein:
      (nutritionPlan.protein_grams * 4) / nutritionPlan.target_calories * 100,
    carbs: (nutritionPlan.carbs_grams * 4) / nutritionPlan.target_calories * 100,
    fats: (nutritionPlan.fats_grams * 9) / nutritionPlan.target_calories * 100,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <Text style={styles.planTitle}>Your Nutrition Plan</Text>
        <Text style={styles.planGoal}>
          {nutritionPlan.goal.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      {/* Calories Card */}
      <View style={styles.caloriesCard}>
        <Text style={styles.caloriesLabel}>Daily Calories</Text>
        <Text style={styles.caloriesValue}>
          {Math.round(nutritionPlan.target_calories)}
        </Text>
        <Text style={styles.caloriesSubtext}>
          TDEE: {Math.round(nutritionPlan.tdee)} kcal
        </Text>
      </View>

      {/* Macros Grid */}
      <View style={styles.macrosGrid}>
        <MacroCard
          label="Protein"
          value={Math.round(nutritionPlan.protein_grams)}
          unit="g"
          percentage={Math.round(macroPercentages.protein)}
          color="#ff1e00"
          icon="food-steak"
        />
        <MacroCard
          label="Carbs"
          value={Math.round(nutritionPlan.carbs_grams)}
          unit="g"
          percentage={Math.round(macroPercentages.carbs)}
          color="#ffa502"
          icon="bread-slice"
        />
        <MacroCard
          label="Fats"
          value={Math.round(nutritionPlan.fats_grams)}
          unit="g"
          percentage={Math.round(macroPercentages.fats)}
          color="#00a8ff"
          icon="butter"
        />
      </View>

      {/* Meal Suggestions */}
      <Text style={styles.sectionTitle}>Meal Distribution</Text>
      {nutritionPlan.meal_suggestions?.map((meal: string, index: number) => (
        <View key={index} style={styles.mealCard}>
          <View style={styles.mealIconContainer}>
            <MaterialCommunityIcons
              name={getMealIcon(index)}
              size={24}
              color="#ff1e00"
            />
          </View>
          <Text style={styles.mealText}>{meal}</Text>
        </View>
      ))}

      {/* Recalculate Button */}
      <TouchableOpacity
        style={styles.recalculateButton}
        onPress={() => {
          setNutritionPlan(null);
        }}
      >
        <MaterialCommunityIcons name="refresh" size={20} color="#ff1e00" />
        <Text style={styles.recalculateText}>Recalculate Plan</Text>
      </TouchableOpacity>

      {/* Tips Card */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Nutrition Tips</Text>
        <TipItem text="Eat protein with every meal to support muscle growth" />
        <TipItem text="Time carbs around your workouts for optimal performance" />
        <TipItem text="Stay hydrated - aim for 3-4 liters of water daily" />
        <TipItem text="Track your progress and adjust macros as needed" />
      </View>
    </ScrollView>
  );
}

function MacroCard({
  label,
  value,
  unit,
  percentage,
  color,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  percentage: number;
  color: string;
  icon: string;
}) {
  return (
    <View style={styles.macroCard}>
      <MaterialCommunityIcons name={icon as any} size={32} color={color} />
      <View style={styles.macroValueContainer}>
        <Text style={styles.macroValue}>{value}</Text>
        <Text style={styles.macroUnit}>{unit}</Text>
      </View>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroPercentageContainer}>
        <View style={[styles.macroPercentageBar, { backgroundColor: color }]}>
          <View
            style={[
              styles.macroPercentageFill,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={styles.macroPercentage}>{percentage}%</Text>
      </View>
    </View>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <View style={styles.tipItem}>
      <MaterialCommunityIcons name="check-circle" size={16} color="#27ae60" />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

function getMealIcon(index: number): string {
  const icons = [
    'weather-sunny',
    'weather-partly-cloudy',
    'lightning-bolt',
    'food-drumstick',
    'weather-night',
  ];
  return icons[index] || 'silverware-fork-knife';
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 32,
    marginBottom: 16,
  },
  goalsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  goalCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#333333',
  },
  goalCardActive: {
    backgroundColor: '#ff1e00',
    borderColor: '#ff1e00',
  },
  goalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  calculateButton: {
    backgroundColor: '#ff1e00',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  planGoal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff1e00',
    marginTop: 4,
    letterSpacing: 2,
  },
  caloriesCard: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ff1e00',
    marginTop: 8,
  },
  caloriesSubtext: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  macroValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    gap: 4,
  },
  macroValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  macroUnit: {
    fontSize: 14,
    color: '#666666',
  },
  macroLabel: {
    fontSize: 13,
    color: '#888888',
    marginTop: 4,
    marginBottom: 8,
  },
  macroPercentageContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  macroPercentageBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#252525',
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroPercentageFill: {
    height: '100%',
  },
  macroPercentage: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  mealIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  recalculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#252525',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  recalculateText: {
    color: '#ff1e00',
    fontSize: 15,
    fontWeight: '700',
  },
  tipsCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
});