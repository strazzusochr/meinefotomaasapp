import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#0a0a0a']}
        style={styles.gradient}
      >
        {/* Logo/Title */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="dumbbell" size={80} color="#ff1e00" />
          <Text style={styles.title}>IRONREIGN</Text>
          <Text style={styles.subtitle}>The Ultimate Hardcore Bodybuilding App</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem icon="weight-lifter" text="500+ Exercise Library" />
          <FeatureItem icon="chart-line" text="AI Training Plans" />
          <FeatureItem icon="food-apple" text="Nutrition Calculator" />
          <FeatureItem icon="camera" text="Progress Tracking" />
        </View>

        {/* CTA Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/setup')}
          >
            <Text style={styles.primaryButtonText}>START YOUR JOURNEY</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.motto}>"FROM ROOKIE TO TITAN"</Text>
      </LinearGradient>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <MaterialCommunityIcons name={icon as any} size={24} color="#ff1e00" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
    textAlign: 'center',
  },
  features: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#ff1e00',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444444',
  },
  secondaryButtonText: {
    color: '#cccccc',
    fontSize: 14,
    fontWeight: '600',
  },
  motto: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 20,
  },
});