import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// API Service für alle Backend-Calls
class APIService {
  private baseURL: string;

  constructor() {
    this.baseURL = BACKEND_URL || '';
  }

  // ========== USER API ==========
  async createUser(data: any) {
    const response = await axios.post(`${this.baseURL}/api/users`, data);
    return response.data;
  }

  async getUser(userId: string) {
    const response = await axios.get(`${this.baseURL}/api/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: string, data: any) {
    const response = await axios.put(`${this.baseURL}/api/users/${userId}`, data);
    return response.data;
  }

  async listUsers() {
    const response = await axios.get(`${this.baseURL}/api/users`);
    return response.data;
  }

  // ========== EXERCISE API ==========
  async createExercise(data: any) {
    const response = await axios.post(`${this.baseURL}/api/exercises`, data);
    return response.data;
  }

  async getExercises(params?: { muscle_group?: string; difficulty?: string }) {
    const response = await axios.get(`${this.baseURL}/api/exercises`, { params });
    return response.data;
  }

  async getExercise(exerciseId: string) {
    const response = await axios.get(`${this.baseURL}/api/exercises/${exerciseId}`);
    return response.data;
  }

  // ========== WORKOUT API ==========
  async createWorkout(data: any) {
    const response = await axios.post(`${this.baseURL}/api/workouts`, data);
    return response.data;
  }

  async getUserWorkouts(userId: string, limit: number = 50) {
    const response = await axios.get(`${this.baseURL}/api/workouts/user/${userId}`, {
      params: { limit },
    });
    return response.data;
  }

  async getWorkout(workoutId: string) {
    const response = await axios.get(`${this.baseURL}/api/workouts/${workoutId}`);
    return response.data;
  }

  // ========== NUTRITION API ==========
  async calculateNutrition(userId: string, goal: string) {
    const response = await axios.post(`${this.baseURL}/api/nutrition/calculate`, {
      user_id: userId,
      goal,
    });
    return response.data;
  }

  async getUserNutritionPlans(userId: string) {
    const response = await axios.get(`${this.baseURL}/api/nutrition/user/${userId}`);
    return response.data;
  }

  // ========== PROGRESS API ==========
  async createProgress(data: any) {
    const response = await axios.post(`${this.baseURL}/api/progress`, data);
    return response.data;
  }

  async getUserProgress(userId: string, limit: number = 50) {
    const response = await axios.get(`${this.baseURL}/api/progress/user/${userId}`, {
      params: { limit },
    });
    return response.data;
  }

  // ========== AI TRAINING PLAN API ==========
  async generateTrainingPlan(data: any) {
    const response = await axios.post(`${this.baseURL}/api/training-plans/generate`, data, {
      timeout: 30000, // 30 seconds for AI generation
    });
    return response.data;
  }

  async getUserTrainingPlans(userId: string) {
    const response = await axios.get(`${this.baseURL}/api/training-plans/user/${userId}`);
    return response.data;
  }

  async getTrainingPlan(planId: string) {
    const response = await axios.get(`${this.baseURL}/api/training-plans/${planId}`);
    return response.data;
  }

  // ========== STATS API ==========
  async getUserStats(userId: string) {
    try {
      const [workouts, progress] = await Promise.all([
        this.getUserWorkouts(userId, 100),
        this.getUserProgress(userId, 100),
      ]);

      const totalWorkouts = workouts.length;
      const totalVolume = workouts.reduce((sum: number, w: any) => sum + (w.total_volume || 0), 0);

      // This week's workouts
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekWorkouts = workouts.filter(
        (w: any) => new Date(w.date) >= oneWeekAgo
      ).length;

      // Streak calculation
      const sortedWorkouts = [...workouts].sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const workout of sortedWorkouts) {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor(
          (today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === streak) {
          streak++;
        } else if (daysDiff > streak) {
          break;
        }
      }

      return {
        totalWorkouts,
        totalVolume: Math.round(totalVolume),
        thisWeekWorkouts,
        streak,
        totalProgressEntries: progress.length,
        latestWeight: progress[0]?.weight || null,
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalWorkouts: 0,
        totalVolume: 0,
        thisWeekWorkouts: 0,
        streak: 0,
        totalProgressEntries: 0,
        latestWeight: null,
      };
    }
  }
}

export default new APIService();
