import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function OneRMCalculatorScreen() {
  const router = useRouter();
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [results, setResults] = useState<any>(null);

  // 1RM Calculation Formulas
  const calculateOneRM = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);

    if (!w || !r || w <= 0 || r <= 0 || r > 12) {
      alert('Please enter valid weight and reps (1-12 reps)');
      return;
    }

    // Multiple formulas for comparison
    const formulas = {
      epley: w * (1 + r / 30), // Most popular
      brzycki: w * (36 / (37 - r)),
      lander: (100 * w) / (101.3 - 2.67123 * r),
      lombardi: w * Math.pow(r, 0.1),
      mayhew: (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r)),
      oconner: w * (1 + r / 40),
      wathan: (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r)),
    };

    // Average of all formulas
    const average =
      Object.values(formulas).reduce((sum, val) => sum + val, 0) /
      Object.keys(formulas).length;

    // Percentages for training
    const percentages = [
      { percent: 100, label: '100% (1RM)' },
      { percent: 95, label: '95% (1-2 reps)' },
      { percent: 90, label: '90% (2-4 reps)' },
      { percent: 85, label: '85% (4-6 reps)' },
      { percent: 80, label: '80% (6-8 reps)' },
      { percent: 75, label: '75% (8-10 reps)' },
      { percent: 70, label: '70% (10-12 reps)' },
      { percent: 65, label: '65% (12-15 reps)' },
      { percent: 60, label: '60% (15+ reps)' },
    ];

    setResults({
      formulas,
      average,
      percentages: percentages.map((p) => ({
        ...p,
        weight: Math.round((average * p.percent) / 100),
      })),
    });
  };

  const reset = () => {
    setWeight('');
    setReps('');
    setResults(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>1RM Calculator</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={24} color="#ff1e00" />
          <Text style={styles.infoText}>
            Calculate your One-Rep Max (1RM) using proven formulas. Enter weight and
            reps from your last set.
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>ENTER YOUR LIFT</Text>
          
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Weight Lifted (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="100"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Reps Performed (1-12)</Text>
            <TextInput
              style={styles.input}
              value={reps}
              onChangeText={setReps}
              keyboardType="number-pad"
              placeholder="8"
              placeholderTextColor="#666"
            />
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateOneRM}>
            <MaterialCommunityIcons name="calculator" size={24} color="#ffffff" />
            <Text style={styles.calculateButtonText}>CALCULATE 1RM</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {results && (
          <>
            {/* Average 1RM */}
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>YOUR ESTIMATED 1RM</Text>
              <Text style={styles.resultValue}>{Math.round(results.average)} kg</Text>
              <Text style={styles.resultSubtext}>
                Based on {weight} kg × {reps} reps
              </Text>
            </View>

            {/* Formulas Comparison */}
            <Text style={styles.sectionTitle}>FORMULA COMPARISON</Text>
            <View style={styles.formulasCard}>
              {Object.entries(results.formulas).map(([name, value]: [string, any]) => (
                <View key={name} style={styles.formulaRow}>
                  <Text style={styles.formulaName}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Text>
                  <Text style={styles.formulaValue}>{Math.round(value)} kg</Text>
                </View>
              ))}
            </View>

            {/* Training Percentages */}
            <Text style={styles.sectionTitle}>TRAINING PERCENTAGES</Text>
            <View style={styles.percentagesCard}>
              {results.percentages.map((item: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.percentageRow,
                    index === 0 && styles.percentageRowHighlight,
                  ]}
                >
                  <View style={styles.percentageLeft}>
                    <Text
                      style={[
                        styles.percentagePercent,
                        index === 0 && styles.percentageTextHighlight,
                      ]}
                    >
                      {item.percent}%
                    </Text>
                    <Text
                      style={[
                        styles.percentageLabel,
                        index === 0 && styles.percentageTextHighlight,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.percentageWeight,
                      index === 0 && styles.percentageTextHighlight,
                    ]}
                  >
                    {item.weight} kg
                  </Text>
                </View>
              ))}
            </View>

            {/* Training Recommendations */}
            <View style={styles.recommendationsCard}>
              <Text style={styles.sectionTitle}>TRAINING RECOMMENDATIONS</Text>
              
              <View style={styles.recommendationItem}>
                <MaterialCommunityIcons name="weight-lifter" size={20} color="#ff1e00" />
                <View style={styles.recommendationText}>
                  <Text style={styles.recommendationTitle}>Strength (85-100%)</Text>
                  <Text style={styles.recommendationDesc}>1-5 reps, 3-5 sets, 3-5 min rest</Text>
                </View>
              </View>

              <View style={styles.recommendationItem}>
                <MaterialCommunityIcons name="arm-flex" size={20} color="#ffa502" />
                <View style={styles.recommendationText}>
                  <Text style={styles.recommendationTitle}>Hypertrophy (70-85%)</Text>
                  <Text style={styles.recommendationDesc}>6-12 reps, 3-5 sets, 60-90s rest</Text>
                </View>
              </View>

              <View style={styles.recommendationItem}>
                <MaterialCommunityIcons name="run-fast" size={20} color="#00a8ff" />
                <View style={styles.recommendationText}>
                  <Text style={styles.recommendationTitle}>Endurance (50-70%)</Text>
                  <Text style={styles.recommendationDesc}>12-20+ reps, 2-3 sets, 30-60s rest</Text>
                </View>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <MaterialCommunityIcons name="refresh" size={20} color="#ff1e00" />
              <Text style={styles.resetButtonText}>New Calculation</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Common Lifts Reference */}
        <View style={styles.referenceCard}>
          <Text style={styles.sectionTitle}>STRENGTH STANDARDS (MALE)</Text>
          <Text style={styles.referenceSubtitle}>Based on bodyweight multiples</Text>
          
          <View style={styles.referenceTable}>
            <View style={styles.referenceHeaderRow}>
              <Text style={styles.referenceHeaderCell}>Lift</Text>
              <Text style={styles.referenceHeaderCell}>Beginner</Text>
              <Text style={styles.referenceHeaderCell}>Inter</Text>
              <Text style={styles.referenceHeaderCell}>Advanced</Text>
            </View>

            {[
              { name: 'Bench', beginner: '0.75x', inter: '1.25x', advanced: '1.75x' },
              { name: 'Squat', beginner: '1.0x', inter: '1.75x', advanced: '2.5x' },
              { name: 'Deadlift', beginner: '1.25x', inter: '2.0x', advanced: '2.75x' },
              { name: 'OHP', beginner: '0.5x', inter: '0.85x', advanced: '1.2x' },
            ].map((lift, index) => (
              <View key={index} style={styles.referenceRow}>
                <Text style={styles.referenceCell}>{lift.name}</Text>
                <Text style={styles.referenceCell}>{lift.beginner}</Text>
                <Text style={styles.referenceCell}>{lift.inter}</Text>
                <Text style={styles.referenceCell}>{lift.advanced}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.referenceNote}>
            * Multiply by your bodyweight. Example: 80kg × 1.25x = 100kg Bench Press (Intermediate)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff1e00',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ff1e00',
    marginBottom: 12,
    letterSpacing: 1,
  },
  inputCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 8,
  },
  input: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#ff1e00',
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
  },
  resultCard: {
    backgroundColor: '#1a1a1a',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#ff1e00',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888888',
    marginBottom: 12,
    letterSpacing: 1,
  },
  resultValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#ff1e00',
    marginBottom: 8,
  },
  resultSubtext: {
    fontSize: 13,
    color: '#666666',
  },
  formulasCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  formulaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  formulaName: {
    fontSize: 15,
    color: '#cccccc',
    textTransform: 'capitalize',
  },
  formulaValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  percentagesCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  percentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  percentageRowHighlight: {
    backgroundColor: '#ff1e00',
  },
  percentageLeft: {
    flex: 1,
  },
  percentagePercent: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  percentageLabel: {
    fontSize: 13,
    color: '#888888',
  },
  percentageWeight: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  percentageTextHighlight: {
    color: '#ffffff',
  },
  recommendationsCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  recommendationText: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  recommendationDesc: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#252525',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ff1e00',
  },
  referenceCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  referenceSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 16,
  },
  referenceTable: {
    marginBottom: 16,
  },
  referenceHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#ff1e00',
    marginBottom: 8,
  },
  referenceHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#ff1e00',
    textTransform: 'uppercase',
  },
  referenceRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  referenceCell: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
  },
  referenceNote: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
