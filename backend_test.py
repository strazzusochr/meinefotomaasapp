#!/usr/bin/env python3
"""
UMFASSENDE IronReign Backend API Test Suite - A bis Z
Comprehensive testing for all backend endpoints with real-world scenarios
"""

import requests
import json
import uuid
from datetime import datetime
import base64
import os
import time
from typing import Dict, List, Any

# Get backend URL from environment
BACKEND_URL = "https://gymwarrior.preview.emergentagent.com/api"

class IronReignAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_user_id = None
        self.test_exercise_id = None
        self.test_workout_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                self.log_test("API Root", True, f"Message: {data.get('message', 'No message')}")
                return True
            else:
                self.log_test("API Root", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("API Root", False, f"Exception: {str(e)}")
            return False

    def test_create_user(self):
        """Test POST /api/users - Create new user with all fields"""
        try:
            user_data = {
                "name": "Marcus Steel",
                "email": "marcus.steel@ironreign.com",
                "age": 28,
                "weight": 85.5,
                "height": 180.0,
                "gender": "male"
            }
            
            response = requests.post(f"{self.base_url}/users", json=user_data)
            
            if response.status_code == 200:
                data = response.json()
                self.test_user_id = data.get('id')
                
                # Verify all fields are present
                required_fields = ['id', 'name', 'email', 'level', 'performance_points', 'created_at']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Create User", False, f"Missing fields: {missing_fields}", data)
                    return False
                
                # Verify default values
                if data.get('level') != 'Rookie' or data.get('performance_points') != 0:
                    self.log_test("Create User", False, "Default values incorrect", data)
                    return False
                
                self.log_test("Create User", True, f"Created user with ID: {self.test_user_id}")
                return True
            else:
                self.log_test("Create User", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create User", False, f"Exception: {str(e)}")
            return False

    def test_get_user(self):
        """Test GET /api/users/{user_id}"""
        if not self.test_user_id:
            self.log_test("Get User", False, "No test user ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/users/{self.test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('id') == self.test_user_id and data.get('name') == 'Marcus Steel':
                    self.log_test("Get User", True, f"Retrieved user: {data.get('name')}")
                    return True
                else:
                    self.log_test("Get User", False, "User data mismatch", data)
                    return False
            else:
                self.log_test("Get User", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get User", False, f"Exception: {str(e)}")
            return False

    def test_update_user(self):
        """Test PUT /api/users/{user_id} - Update profile"""
        if not self.test_user_id:
            self.log_test("Update User", False, "No test user ID available")
            return False
            
        try:
            update_data = {
                "experience_level": "intermediate",
                "goal": "muscle_gain",
                "activity_level": "active"
            }
            
            response = requests.put(f"{self.base_url}/users/{self.test_user_id}", json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get('experience_level') == 'intermediate' and 
                    data.get('goal') == 'muscle_gain' and 
                    data.get('activity_level') == 'active'):
                    self.log_test("Update User", True, "User profile updated successfully")
                    return True
                else:
                    self.log_test("Update User", False, "Update data not reflected", data)
                    return False
            else:
                self.log_test("Update User", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Update User", False, f"Exception: {str(e)}")
            return False

    def test_get_exercises(self):
        """Test GET /api/exercises - Should auto-seed if empty and return at least 10 exercises"""
        try:
            response = requests.get(f"{self.base_url}/exercises")
            
            if response.status_code == 200:
                data = response.json()
                
                if len(data) >= 10:
                    self.log_test("Get Exercises", True, f"Retrieved {len(data)} exercises")
                    if data:
                        self.test_exercise_id = data[0].get('id')
                    return True
                else:
                    # Check if exercises exist at all
                    if len(data) == 0:
                        self.log_test("Get Exercises", False, "No exercises found - auto-seeding not implemented")
                    else:
                        self.log_test("Get Exercises", False, f"Only {len(data)} exercises found, expected at least 10")
                    return False
            else:
                self.log_test("Get Exercises", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Exercises", False, f"Exception: {str(e)}")
            return False

    def test_filter_exercises_by_muscle_group(self):
        """Test filtering exercises by muscle_group parameter"""
        try:
            response = requests.get(f"{self.base_url}/exercises?muscle_group=chest")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if filtering works (should return exercises with chest in muscle_groups)
                if data:
                    chest_exercises = [ex for ex in data if 'chest' in ex.get('muscle_groups', [])]
                    if len(chest_exercises) == len(data):
                        self.log_test("Filter Exercises by Muscle Group", True, f"Found {len(data)} chest exercises")
                        return True
                    else:
                        self.log_test("Filter Exercises by Muscle Group", False, "Filtering not working correctly")
                        return False
                else:
                    self.log_test("Filter Exercises by Muscle Group", False, "No chest exercises found")
                    return False
            else:
                self.log_test("Filter Exercises by Muscle Group", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Filter Exercises by Muscle Group", False, f"Exception: {str(e)}")
            return False

    def test_create_workout(self):
        """Test POST /api/workouts - Create workout with multiple exercises and sets"""
        if not self.test_user_id:
            self.log_test("Create Workout", False, "No test user ID available")
            return False
            
        try:
            workout_data = {
                "user_id": self.test_user_id,
                "workout_type": "push",
                "exercises": [
                    {
                        "exercise_id": str(uuid.uuid4()),
                        "exercise_name": "Bench Press",
                        "sets": [
                            {"set_number": 1, "reps": 12, "weight": 80.0, "rest_seconds": 90, "completed": True},
                            {"set_number": 2, "reps": 10, "weight": 85.0, "rest_seconds": 90, "completed": True},
                            {"set_number": 3, "reps": 8, "weight": 90.0, "rest_seconds": 120, "completed": True}
                        ],
                        "notes": "Good form, felt strong"
                    },
                    {
                        "exercise_id": str(uuid.uuid4()),
                        "exercise_name": "Incline Dumbbell Press",
                        "sets": [
                            {"set_number": 1, "reps": 12, "weight": 35.0, "rest_seconds": 60, "completed": True},
                            {"set_number": 2, "reps": 10, "weight": 37.5, "rest_seconds": 60, "completed": True},
                            {"set_number": 3, "reps": 8, "weight": 40.0, "rest_seconds": 90, "completed": True}
                        ]
                    }
                ],
                "duration_minutes": 75,
                "notes": "Great push session, progressive overload working"
            }
            
            response = requests.post(f"{self.base_url}/workouts", json=workout_data)
            
            if response.status_code == 200:
                data = response.json()
                self.test_workout_id = data.get('id')
                
                # Verify total volume calculation
                expected_volume = (12*80 + 10*85 + 8*90) + (12*35 + 10*37.5 + 8*40)  # 3490
                actual_volume = data.get('total_volume')
                
                if abs(actual_volume - expected_volume) < 0.1:  # Allow small floating point differences
                    self.log_test("Create Workout", True, f"Workout created with correct volume: {actual_volume}")
                    return True
                else:
                    self.log_test("Create Workout", False, f"Volume calculation incorrect. Expected: {expected_volume}, Got: {actual_volume}")
                    return False
            else:
                self.log_test("Create Workout", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create Workout", False, f"Exception: {str(e)}")
            return False

    def test_get_user_workouts(self):
        """Test GET /api/workouts/user/{user_id}"""
        if not self.test_user_id:
            self.log_test("Get User Workouts", False, "No test user ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/workouts/user/{self.test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                if len(data) > 0:
                    # Verify the workout we created is in the list
                    workout_found = any(w.get('id') == self.test_workout_id for w in data)
                    if workout_found:
                        self.log_test("Get User Workouts", True, f"Retrieved {len(data)} workouts for user")
                        return True
                    else:
                        self.log_test("Get User Workouts", False, "Created workout not found in user workouts")
                        return False
                else:
                    self.log_test("Get User Workouts", False, "No workouts found for user")
                    return False
            else:
                self.log_test("Get User Workouts", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get User Workouts", False, f"Exception: {str(e)}")
            return False

    def test_calculate_nutrition_muscle_gain(self):
        """Test POST /api/nutrition/calculate with goal: muscle_gain"""
        if not self.test_user_id:
            self.log_test("Calculate Nutrition (Muscle Gain)", False, "No test user ID available")
            return False
            
        try:
            nutrition_request = {
                "user_id": self.test_user_id,
                "goal": "muscle_gain"
            }
            
            response = requests.post(f"{self.base_url}/nutrition/calculate", json=nutrition_request)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify required fields are present
                required_fields = ['tdee', 'target_calories', 'protein_grams', 'carbs_grams', 'fats_grams', 'meal_suggestions']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Calculate Nutrition (Muscle Gain)", False, f"Missing fields: {missing_fields}")
                    return False
                
                # Verify calculations make sense
                tdee = data.get('tdee')
                target_calories = data.get('target_calories')
                
                # For muscle gain, target should be TDEE + surplus
                if target_calories > tdee:
                    self.log_test("Calculate Nutrition (Muscle Gain)", True, 
                                f"TDEE: {tdee:.0f}, Target: {target_calories:.0f}, Protein: {data.get('protein_grams'):.0f}g")
                    return True
                else:
                    self.log_test("Calculate Nutrition (Muscle Gain)", False, 
                                f"Target calories ({target_calories}) not higher than TDEE ({tdee}) for muscle gain")
                    return False
            else:
                self.log_test("Calculate Nutrition (Muscle Gain)", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Calculate Nutrition (Muscle Gain)", False, f"Exception: {str(e)}")
            return False

    def test_calculate_nutrition_fat_loss(self):
        """Test POST /api/nutrition/calculate with goal: fat_loss"""
        if not self.test_user_id:
            self.log_test("Calculate Nutrition (Fat Loss)", False, "No test user ID available")
            return False
            
        try:
            nutrition_request = {
                "user_id": self.test_user_id,
                "goal": "fat_loss"
            }
            
            response = requests.post(f"{self.base_url}/nutrition/calculate", json=nutrition_request)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify required fields are present
                required_fields = ['tdee', 'target_calories', 'protein_grams', 'carbs_grams', 'fats_grams']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Calculate Nutrition (Fat Loss)", False, f"Missing fields: {missing_fields}")
                    return False
                
                # For fat loss, target should be TDEE - deficit
                tdee = data.get('tdee')
                target_calories = data.get('target_calories')
                
                if target_calories < tdee:
                    self.log_test("Calculate Nutrition (Fat Loss)", True, 
                                f"TDEE: {tdee:.0f}, Target: {target_calories:.0f} (deficit: {tdee-target_calories:.0f})")
                    return True
                else:
                    self.log_test("Calculate Nutrition (Fat Loss)", False, 
                                f"Target calories ({target_calories}) not lower than TDEE ({tdee}) for fat loss")
                    return False
            else:
                self.log_test("Calculate Nutrition (Fat Loss)", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Calculate Nutrition (Fat Loss)", False, f"Exception: {str(e)}")
            return False

    def test_create_progress_entry(self):
        """Test POST /api/progress with measurements and optional photo"""
        if not self.test_user_id:
            self.log_test("Create Progress Entry", False, "No test user ID available")
            return False
            
        try:
            # Create a small test image (1x1 pixel PNG in base64)
            test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            
            progress_data = {
                "user_id": self.test_user_id,
                "weight": 86.2,
                "body_fat_percentage": 12.5,
                "chest_cm": 108.0,
                "waist_cm": 82.0,
                "arms_cm": 38.5,
                "legs_cm": 62.0,
                "photo_base64": test_image_b64,
                "notes": "Feeling stronger, weight up slightly but waist down"
            }
            
            response = requests.post(f"{self.base_url}/progress", json=progress_data)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify all measurements are saved
                if (data.get('weight') == 86.2 and 
                    data.get('body_fat_percentage') == 12.5 and
                    data.get('chest_cm') == 108.0):
                    self.log_test("Create Progress Entry", True, "Progress entry created with all measurements")
                    return True
                else:
                    self.log_test("Create Progress Entry", False, "Measurement data not saved correctly", data)
                    return False
            else:
                self.log_test("Create Progress Entry", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create Progress Entry", False, f"Exception: {str(e)}")
            return False

    def test_get_user_progress(self):
        """Test GET /api/progress/user/{user_id}"""
        if not self.test_user_id:
            self.log_test("Get User Progress", False, "No test user ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/progress/user/{self.test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                if len(data) > 0:
                    # Verify the progress entry we created is in the list
                    progress_found = any(p.get('weight') == 86.2 for p in data)
                    if progress_found:
                        self.log_test("Get User Progress", True, f"Retrieved {len(data)} progress entries")
                        return True
                    else:
                        self.log_test("Get User Progress", False, "Created progress entry not found")
                        return False
                else:
                    self.log_test("Get User Progress", False, "No progress entries found for user")
                    return False
            else:
                self.log_test("Get User Progress", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get User Progress", False, f"Exception: {str(e)}")
            return False

    def test_generate_ai_training_plan(self):
        """Test POST /api/training-plans/generate - 4-day plan with AI"""
        if not self.test_user_id:
            self.log_test("Generate AI Training Plan", False, "No test user ID available")
            return False
            
        try:
            plan_request = {
                "user_id": self.test_user_id,
                "days_per_week": 4,
                "duration_weeks": 12,
                "equipment_available": ["barbell", "dumbbell", "cable", "machine"]
            }
            
            response = requests.post(f"{self.base_url}/training-plans/generate", json=plan_request)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify required fields
                required_fields = ['plan_name', 'plan_type', 'days_per_week', 'weekly_split', 'ai_recommendations']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Generate AI Training Plan", False, f"Missing fields: {missing_fields}")
                    return False
                
                # Verify AI content is present and substantial
                ai_content = data.get('ai_recommendations', '')
                if len(ai_content) > 100:  # Should be a substantial response
                    self.log_test("Generate AI Training Plan", True, 
                                f"Generated {data.get('days_per_week')}-day plan: {data.get('plan_name')}")
                    return True
                else:
                    self.log_test("Generate AI Training Plan", False, "AI recommendations too short or missing")
                    return False
            else:
                self.log_test("Generate AI Training Plan", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Generate AI Training Plan", False, f"Exception: {str(e)}")
            return False

    def test_performance_points_increment(self):
        """Test that performance points increment after workouts"""
        if not self.test_user_id:
            self.log_test("Performance Points Increment", False, "No test user ID available")
            return False
            
        try:
            # Get current user data
            response = requests.get(f"{self.base_url}/users/{self.test_user_id}")
            
            if response.status_code == 200:
                user_data = response.json()
                current_points = user_data.get('performance_points', 0)
                
                # Should have points from the workout we created earlier
                if current_points >= 10:  # Should have at least 10 points from one workout
                    self.log_test("Performance Points Increment", True, f"User has {current_points} performance points")
                    return True
                else:
                    self.log_test("Performance Points Increment", False, f"Expected at least 10 points, got {current_points}")
                    return False
            else:
                self.log_test("Performance Points Increment", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Performance Points Increment", False, f"Exception: {str(e)}")
            return False

    def test_error_handling_missing_user(self):
        """Test error handling for missing user profiles"""
        try:
            fake_user_id = str(uuid.uuid4())
            
            # Test nutrition calculation with non-existent user
            nutrition_request = {
                "user_id": fake_user_id,
                "goal": "muscle_gain"
            }
            
            response = requests.post(f"{self.base_url}/nutrition/calculate", json=nutrition_request)
            
            if response.status_code == 404:
                self.log_test("Error Handling (Missing User)", True, "Correctly returned 404 for missing user")
                return True
            else:
                self.log_test("Error Handling (Missing User)", False, f"Expected 404, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Error Handling (Missing User)", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🏋️ Starting IronReign Backend API Tests")
        print("=" * 50)
        
        # Test order matters - some tests depend on previous ones
        tests = [
            self.test_api_root,
            self.test_create_user,
            self.test_get_user,
            self.test_update_user,
            self.test_get_exercises,
            self.test_filter_exercises_by_muscle_group,
            self.test_create_workout,
            self.test_get_user_workouts,
            self.test_calculate_nutrition_muscle_gain,
            self.test_calculate_nutrition_fat_loss,
            self.test_create_progress_entry,
            self.test_get_user_progress,
            self.test_generate_ai_training_plan,
            self.test_performance_points_increment,
            self.test_error_handling_missing_user
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 50)
        print(f"🏁 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! IronReign API is working correctly.")
        else:
            print(f"⚠️  {total - passed} tests failed. Check the details above.")
        
        return passed, total, self.test_results

if __name__ == "__main__":
    tester = IronReignAPITester()
    passed, total, results = tester.run_all_tests()
    
    # Print summary of failed tests
    failed_tests = [r for r in results if not r['success']]
    if failed_tests:
        print("\n❌ Failed Tests Summary:")
        for test in failed_tests:
            print(f"  - {test['test']}: {test['details']}")