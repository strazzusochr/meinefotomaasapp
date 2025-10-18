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
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisWeekWorkouts: 0,
    totalVolume: 0,
    level: 'Rookie',
    performancePoints: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      let userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        // Create a guest user
        const response = await axios.post(`${BACKEND_URL}/api/users`, {
          name: 'Guest User',
          email: 'guest@ironreign.app',
        });
        userId = response.data.id;
        await AsyncStorage.setItem('userId', userId);
      }

      // Load user data
      const userResponse = await axios.get(`${BACKEND_URL}/api/users/${userId}`);
      setUser(userResponse.data);

      // Load workout stats
      const workoutsResponse = await axios.get(
        `${BACKEND_URL}/api/workouts/user/${userId}`
      );
      const workouts = workoutsResponse.data;

      const totalWorkouts = workouts.length;
      const totalVolume = workouts.reduce(
        (sum: number, w: any) => sum + (w.total_volume || 0),
        0
      );

      // Count this week's workouts
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekWorkouts = workouts.filter(
        (w: any) => new Date(w.date) >= oneWeekAgo
      ).length;

      setStats({
        totalWorkouts,
        thisWeekWorkouts,
        totalVolume: Math.round(totalVolume),
        level: userResponse.data.level || 'Rookie',
        performancePoints: userResponse.data.performance_points || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome Back,</Text>
            <Text style={styles.userName}>{user?.name || 'Champion'}</Text>
          </View>
          <View style={styles.levelBadge}>
            <MaterialCommunityIcons name="trophy" size={24} color="#ff1e00" />
            <Text style={styles.levelText}>{stats.level}</Text>
          </View>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Performance Points</Text>
          <Text style={styles.pointsValue}>{stats.performancePoints}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="weight-lifter"
          label="Total Workouts"
          value={stats.totalWorkouts.toString()}
          color="#ff1e00"
        />
        <StatCard
          icon="calendar-week"
          label="This Week"
          value={stats.thisWeekWorkouts.toString()}
          color="#00a8ff"
        />
        <StatCard
          icon="chart-line"
          label="Total Volume"
          value={`${(stats.totalVolume / 1000).toFixed(1)}k`}
          color="#ffa502"
          unit="kg"
        />
        <StatCard
          icon="fire"
          label="Streak"
          value="0"
          color="#ff4757"
          unit="days"
        />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        <QuickAction
          icon="plus-circle"
          label="Start Workout"
          onPress={() => router.push('/(tabs)/workout')}
        />
        <QuickAction
          icon="robot"
          label="AI Training Plan"
          onPress={() => router.push('/ai-plan')}
        />
        <QuickAction
          icon="food-apple"
          label="Nutrition Plan"
          onPress={() => router.push('/(tabs)/nutrition')}
        />
        <QuickAction
          icon="camera"
          label="Log Progress"
          onPress={() => router.push('/(tabs)/progress')}
        />
      </View>

      {/* Motivational Quote */}
      <View style={styles.quoteCard}>
        <MaterialCommunityIcons name="format-quote-open" size={32} color="#ff1e00" />
        <Text style={styles.quoteText}>
          "The Iron never lies to you. You can walk outside and listen to all kinds of
          talk, get told that you're a god or a total bastard. The Iron will always kick
          you the real deal."
        </Text>
        <Text style={styles.quoteAuthor}>- Henry Rollins</Text>
      </View>
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  unit,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  unit?: string;
}) {
  return (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon as any} size={28} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      {unit && <Text style={styles.statUnit}>{unit}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <MaterialCommunityIcons name={icon as any} size={32} color="#ff1e00" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#888888',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  levelText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  pointsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: {
    color: '#888888',
    fontSize: 14,
  },
  pointsValue: {
    color: '#ff1e00',
    fontSize: 24,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 8,
  },
  statUnit: {
    fontSize: 12,
    color: '#888888',
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff1e00',
  },
  quoteText: {
    fontSize: 15,
    color: '#cccccc',
    lineHeight: 24,
    marginTop: 12,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 13,
    color: '#888888',
    marginTop: 12,
    fontWeight: '600',
  },
});