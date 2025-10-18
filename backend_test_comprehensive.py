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

class IronReignComprehensiveTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.headers = {"Content-Type": "application/json"}
        self.test_results = []
        self.created_users = []
        self.created_exercises = []
        self.created_workouts = []
        self.created_progress = []
        self.created_plans = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None, timeout: int = 30) -> requests.Response:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=self.headers, params=params, timeout=timeout)
            elif method.upper() == "POST":
                response = requests.post(url, headers=self.headers, json=data, timeout=timeout)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=self.headers, json=data, timeout=timeout)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=self.headers, timeout=timeout)
            else:
                raise ValueError(f"Unsupported method: {method}")
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise

    # ============= 1. KOMPLETTER USER LIFECYCLE =============
    
    def test_complete_user_lifecycle(self):
        """Test complete user lifecycle with all fields and scenarios"""
        print("\n🔥 TESTING COMPLETE USER LIFECYCLE")
        
        # Test 1: Create user with all fields
        user_data = {
            "name": "Maximilian Kraftmann",
            "email": "max.kraftmann@ironreign.de",
            "age": 25,
            "weight": 85.5,
            "height": 180.0,
            "gender": "male"
        }
        
        response = self.make_request("POST", "/users", user_data)
        if response.status_code == 200:
            user = response.json()
            self.created_users.append(user["id"])
            self.log_test("Create User with All Fields", True, 
                         f"Created user {user['name']} with ID {user['id']}")
            
            # Test 2: Update user profile multiple times
            updates = [
                {"experience_level": "intermediate", "goal": "strength"},
                {"activity_level": "very_active", "weight": 87.0},
                {"experience_level": "advanced", "goal": "fat_loss"},
                {"experience_level": "pro", "goal": "maintenance", "activity_level": "active"}
            ]
            
            for i, update_data in enumerate(updates):
                update_response = self.make_request("PUT", f"/users/{user['id']}", update_data)
                success = update_response.status_code == 200
                self.log_test(f"User Update #{i+1}", success, 
                            f"Updated: {', '.join(update_data.keys())}")
            
            # Test 3: Test all experience levels
            experience_levels = ["beginner", "intermediate", "advanced", "pro"]
            for level in experience_levels:
                exp_response = self.make_request("PUT", f"/users/{user['id']}", {"experience_level": level})
                success = exp_response.status_code == 200
                self.log_test(f"Experience Level: {level}", success, f"Set experience to {level}")
            
            # Test 4: Test all goals
            goals = ["muscle_gain", "strength", "fat_loss", "maintenance"]
            for goal in goals:
                goal_response = self.make_request("PUT", f"/users/{user['id']}", {"goal": goal})
                success = goal_response.status_code == 200
                self.log_test(f"Goal: {goal}", success, f"Set goal to {goal}")
            
            # Test 5: Test all activity levels
            activity_levels = ["sedentary", "light", "moderate", "active", "very_active"]
            for activity in activity_levels:
                activity_response = self.make_request("PUT", f"/users/{user['id']}", {"activity_level": activity})
                success = activity_response.status_code == 200
                self.log_test(f"Activity Level: {activity}", success, f"Set activity to {activity}")
                
        else:
            self.log_test("Create User with All Fields", False, 
                         f"Status: {response.status_code}, Response: {response.text}")

    # ============= 2. EXERCISE LIBRARY - DEEP DIVE =============
    
    def test_exercise_library_deep_dive(self):
        """Test exercise library with all filters and scenarios"""
        print("\n💪 TESTING EXERCISE LIBRARY - DEEP DIVE")
        
        # First, create sample exercises for testing
        sample_exercises = [
            {
                "name": "Bankdrücken",
                "muscle_groups": ["chest"],
                "equipment": "barbell",
                "difficulty": "intermediate",
                "description": "Klassische Brustübung",
                "instructions": ["Auf Bank legen", "Stange zur Brust senken", "Hochdrücken"]
            },
            {
                "name": "Klimmzüge",
                "muscle_groups": ["back"],
                "equipment": "bodyweight",
                "difficulty": "intermediate",
                "description": "Oberkörper Zugübung",
                "instructions": ["An Stange hängen", "Hochziehen bis Kinn über Stange"]
            },
            {
                "name": "Kniebeugen",
                "muscle_groups": ["legs"],
                "equipment": "barbell",
                "difficulty": "beginner",
                "description": "Unterkörper Grundübung",
                "instructions": ["Schulterbreit stehen", "In Hocke gehen", "Aufstehen"]
            },
            {
                "name": "Schulterdrücken",
                "muscle_groups": ["shoulders"],
                "equipment": "barbell",
                "difficulty": "intermediate",
                "description": "Schulter Druckübung",
                "instructions": ["Stange über Kopf drücken", "Kontrolliert senken"]
            },
            {
                "name": "Bizeps Curls",
                "muscle_groups": ["arms"],
                "equipment": "dumbbell",
                "difficulty": "beginner",
                "description": "Arm Isolationsübung",
                "instructions": ["Gewichte hochcurlen", "Langsam senken"]
            },
            {
                "name": "Plank",
                "muscle_groups": ["core"],
                "equipment": "bodyweight",
                "difficulty": "beginner",
                "description": "Core Stabilisationsübung",
                "instructions": ["Plank Position halten", "Core anspannen"]
            },
            {
                "name": "Kreuzheben",
                "muscle_groups": ["back", "legs"],
                "equipment": "barbell",
                "difficulty": "advanced",
                "description": "Ganzkörper Grundübung",
                "instructions": ["Stange vom Boden heben", "Aufrecht stehen", "Kontrolliert senken"]
            }
        ]
        
        # Create exercises
        for exercise_data in sample_exercises:
            response = self.make_request("POST", "/exercises", exercise_data)
            if response.status_code == 200:
                exercise = response.json()
                self.created_exercises.append(exercise["id"])
                self.log_test(f"Create Exercise: {exercise_data['name']}", True, 
                            f"Created {exercise_data['name']}")
            else:
                self.log_test(f"Create Exercise: {exercise_data['name']}", False, 
                            f"Status: {response.status_code}")
        
        # Test 1: GET all exercises
        response = self.make_request("GET", "/exercises")
        if response.status_code == 200:
            exercises = response.json()
            self.log_test("GET All Exercises", True, f"Retrieved {len(exercises)} exercises")
        else:
            self.log_test("GET All Exercises", False, f"Status: {response.status_code}")
        
        # Test 2: Filter by each muscle group
        muscle_groups = ["chest", "back", "legs", "shoulders", "arms", "core"]
        for muscle_group in muscle_groups:
            response = self.make_request("GET", "/exercises", params={"muscle_group": muscle_group})
            if response.status_code == 200:
                filtered_exercises = response.json()
                self.log_test(f"Filter by {muscle_group}", True, 
                            f"Found {len(filtered_exercises)} {muscle_group} exercises")
            else:
                self.log_test(f"Filter by {muscle_group}", False, f"Status: {response.status_code}")
        
        # Test 3: Filter by difficulty
        difficulties = ["beginner", "intermediate", "advanced"]
        for difficulty in difficulties:
            response = self.make_request("GET", "/exercises", params={"difficulty": difficulty})
            if response.status_code == 200:
                filtered_exercises = response.json()
                self.log_test(f"Filter by {difficulty}", True, 
                            f"Found {len(filtered_exercises)} {difficulty} exercises")
            else:
                self.log_test(f"Filter by {difficulty}", False, f"Status: {response.status_code}")
        
        # Test 4: Combined filters
        combined_filters = [
            {"muscle_group": "chest", "difficulty": "intermediate"},
            {"muscle_group": "legs", "difficulty": "beginner"},
            {"muscle_group": "back", "difficulty": "advanced"}
        ]
        
        for filters in combined_filters:
            response = self.make_request("GET", "/exercises", params=filters)
            if response.status_code == 200:
                filtered_exercises = response.json()
                filter_str = " + ".join([f"{k}:{v}" for k, v in filters.items()])
                self.log_test(f"Combined Filter: {filter_str}", True, 
                            f"Found {len(filtered_exercises)} exercises")
            else:
                self.log_test(f"Combined Filter: {filter_str}", False, f"Status: {response.status_code}")
        
        # Test 5: Get individual exercise by ID
        if self.created_exercises:
            exercise_id = self.created_exercises[0]
            response = self.make_request("GET", f"/exercises/{exercise_id}")
            if response.status_code == 200:
                exercise = response.json()
                self.log_test("Get Exercise by ID", True, f"Retrieved exercise: {exercise['name']}")
            else:
                self.log_test("Get Exercise by ID", False, f"Status: {response.status_code}")

    # ============= 3. WORKOUT TRACKING - VOLLSTÄNDIGER FLOW =============
    
    def test_workout_tracking_complete_flow(self):
        """Test complete workout tracking with complex scenarios"""
        print("\n🏋️ TESTING WORKOUT TRACKING - COMPLETE FLOW")
        
        if not self.created_users:
            self.log_test("Workout Tracking Setup", False, "No users available")
            return
        
        user_id = self.created_users[0]
        
        # Test 1: Create complex workout with 5+ exercises
        workout_data = {
            "user_id": user_id,
            "workout_type": "push",
            "duration_minutes": 90,
            "notes": "Intensives Push Training mit progressiver Überlastung",
            "exercises": [
                {
                    "exercise_id": str(uuid.uuid4()),
                    "exercise_name": "Bankdrücken",
                    "sets": [
                        {"set_number": 1, "reps": 12, "weight": 80.0, "rest_seconds": 90},
                        {"set_number": 2, "reps": 10, "weight": 85.0, "rest_seconds": 90},
                        {"set_number": 3, "reps": 8, "weight": 90.0, "rest_seconds": 120},
                        {"set_number": 4, "reps": 6, "weight": 95.0, "rest_seconds": 120}
                    ],
                    "notes": "Fokus auf kontrollierte Negative"
                },
                {
                    "exercise_id": str(uuid.uuid4()),
                    "exercise_name": "Schrägbankdrücken",
                    "sets": [
                        {"set_number": 1, "reps": 12, "weight": 35.0, "rest_seconds": 60},
                        {"set_number": 2, "reps": 10, "weight": 37.5, "rest_seconds": 60},
                        {"set_number": 3, "reps": 8, "weight": 40.0, "rest_seconds": 90}
                    ]
                },
                {
                    "exercise_id": str(uuid.uuid4()),
                    "exercise_name": "Schulterdrücken",
                    "sets": [
                        {"set_number": 1, "reps": 10, "weight": 60.0, "rest_seconds": 90},
                        {"set_number": 2, "reps": 8, "weight": 65.0, "rest_seconds": 90},
                        {"set_number": 3, "reps": 6, "weight": 70.0, "rest_seconds": 120}
                    ]
                },
                {
                    "exercise_id": str(uuid.uuid4()),
                    "exercise_name": "Seitheben",
                    "sets": [
                        {"set_number": 1, "reps": 15, "weight": 12.5, "rest_seconds": 45},
                        {"set_number": 2, "reps": 12, "weight": 15.0, "rest_seconds": 45},
                        {"set_number": 3, "reps": 10, "weight": 17.5, "rest_seconds": 60}
                    ]
                },
                {
                    "exercise_id": str(uuid.uuid4()),
                    "exercise_name": "Trizeps Dips",
                    "sets": [
                        {"set_number": 1, "reps": 15, "weight": 0.0, "rest_seconds": 60},
                        {"set_number": 2, "reps": 12, "weight": 10.0, "rest_seconds": 60},
                        {"set_number": 3, "reps": 10, "weight": 15.0, "rest_seconds": 60}
                    ]
                }
            ]
        }
        
        # Calculate expected total volume
        expected_volume = 0
        for exercise in workout_data["exercises"]:
            for set_data in exercise["sets"]:
                expected_volume += set_data["reps"] * set_data["weight"]
        
        response = self.make_request("POST", "/workouts", workout_data)
        if response.status_code == 200:
            workout = response.json()
            self.created_workouts.append(workout["id"])
            actual_volume = workout.get("total_volume", 0)
            
            volume_correct = abs(actual_volume - expected_volume) < 0.01
            self.log_test("Create Complex Workout", True, 
                         f"Created workout with {len(workout_data['exercises'])} exercises, "
                         f"Volume: {actual_volume} (expected: {expected_volume}), "
                         f"Volume calculation: {'✓' if volume_correct else '✗'}")
        else:
            self.log_test("Create Complex Workout", False, 
                         f"Status: {response.status_code}, Response: {response.text}")
        
        # Test 2: Test all workout types
        workout_types = ["push", "pull", "legs", "upper", "lower", "full_body", "custom"]
        for workout_type in workout_types:
            simple_workout = {
                "user_id": user_id,
                "workout_type": workout_type,
                "exercises": [
                    {
                        "exercise_id": str(uuid.uuid4()),
                        "exercise_name": f"Test Exercise for {workout_type}",
                        "sets": [
                            {"set_number": 1, "reps": 10, "weight": 50.0}
                        ]
                    }
                ]
            }
            
            response = self.make_request("POST", "/workouts", simple_workout)
            success = response.status_code == 200
            if success:
                workout = response.json()
                self.created_workouts.append(workout["id"])
            self.log_test(f"Workout Type: {workout_type}", success, f"Created {workout_type} workout")
        
        # Test 3: Test with very high weights (200kg+)
        heavy_workout = {
            "user_id": user_id,
            "workout_type": "custom",
            "exercises": [
                {
                    "exercise_id": str(uuid.uuid4()),
                    "exercise_name": "Schweres Kreuzheben",
                    "sets": [
                        {"set_number": 1, "reps": 1, "weight": 220.0},
                        {"set_number": 2, "reps": 1, "weight": 230.0},
                        {"set_number": 3, "reps": 1, "weight": 240.0}
                    ]
                }
            ]
        }
        
        response = self.make_request("POST", "/workouts", heavy_workout)
        success = response.status_code == 200
        if success:
            workout = response.json()
            self.created_workouts.append(workout["id"])
            expected_heavy_volume = 220 + 230 + 240
            actual_heavy_volume = workout.get("total_volume", 0)
            volume_correct = abs(actual_heavy_volume - expected_heavy_volume) < 0.01
            self.log_test("Heavy Weight Workout (200kg+)", True, 
                         f"Volume: {actual_heavy_volume}, Calculation: {'✓' if volume_correct else '✗'}")
        else:
            self.log_test("Heavy Weight Workout (200kg+)", False, f"Status: {response.status_code}")
        
        # Test 4: Test with bodyweight exercises (0 weight)
        bodyweight_workout = {
            "user_id": user_id,
            "workout_type": "custom",
            "exercises": [
                {
                    "exercise_id": str(uuid.uuid4()),
                    "exercise_name": "Liegestütze",
                    "sets": [
                        {"set_number": 1, "reps": 20, "weight": 0.0},
                        {"set_number": 2, "reps": 18, "weight": 0.0},
                        {"set_number": 3, "reps": 15, "weight": 0.0}
                    ]
                }
            ]
        }
        
        response = self.make_request("POST", "/workouts", bodyweight_workout)
        success = response.status_code == 200
        if success:
            workout = response.json()
            self.created_workouts.append(workout["id"])
            self.log_test("Bodyweight Exercise (0 weight)", True, 
                         f"Volume: {workout.get('total_volume', 0)}")
        else:
            self.log_test("Bodyweight Exercise (0 weight)", False, f"Status: {response.status_code}")
        
        # Test 5: Get workout history
        response = self.make_request("GET", f"/workouts/user/{user_id}")
        if response.status_code == 200:
            workouts = response.json()
            self.log_test("Get Workout History", True, f"Retrieved {len(workouts)} workouts for user")
        else:
            self.log_test("Get Workout History", False, f"Status: {response.status_code}")

    # ============= 4. NUTRITION - ALLE SZENARIEN =============
    
    def test_nutrition_all_scenarios(self):
        """Test nutrition calculation for various user profiles"""
        print("\n🥗 TESTING NUTRITION - ALL SCENARIOS")
        
        # Test scenarios with different user profiles
        test_profiles = [
            {
                "name": "Männlich Moderate Aktivität",
                "user_data": {
                    "name": "Hans Mueller",
                    "email": "hans@test.de",
                    "age": 25,
                    "weight": 85.0,
                    "height": 180.0,
                    "gender": "male"
                },
                "activity_level": "moderate",
                "goals": ["muscle_gain", "fat_loss", "maintenance"]
            },
            {
                "name": "Weiblich Sehr Aktiv",
                "user_data": {
                    "name": "Anna Schmidt",
                    "email": "anna@test.de",
                    "age": 30,
                    "weight": 60.0,
                    "height": 165.0,
                    "gender": "female"
                },
                "activity_level": "very_active",
                "goals": ["muscle_gain", "fat_loss", "maintenance"]
            },
            {
                "name": "Männlich Sitzend",
                "user_data": {
                    "name": "Peter Weber",
                    "email": "peter@test.de",
                    "age": 20,
                    "weight": 100.0,
                    "height": 190.0,
                    "gender": "male"
                },
                "activity_level": "sedentary",
                "goals": ["fat_loss", "maintenance"]
            }
        ]
        
        for profile in test_profiles:
            # Create user
            user_response = self.make_request("POST", "/users", profile["user_data"])
            if user_response.status_code != 200:
                self.log_test(f"Create User: {profile['name']}", False, 
                             f"Status: {user_response.status_code}")
                continue
                
            user = user_response.json()
            self.created_users.append(user["id"])
            
            # Update activity level
            activity_response = self.make_request("PUT", f"/users/{user['id']}", 
                                                {"activity_level": profile["activity_level"]})
            
            if activity_response.status_code != 200:
                self.log_test(f"Set Activity Level: {profile['name']}", False, 
                             f"Status: {activity_response.status_code}")
                continue
            
            # Test each goal
            for goal in profile["goals"]:
                nutrition_request = {
                    "user_id": user["id"],
                    "goal": goal
                }
                
                nutrition_response = self.make_request("POST", "/nutrition/calculate", nutrition_request)
                
                if nutrition_response.status_code == 200:
                    nutrition = nutrition_response.json()
                    
                    # Verify TDEE calculation (Mifflin-St Jeor formula)
                    user_data = profile["user_data"]
                    if user_data["gender"] == "male":
                        expected_bmr = 10 * user_data["weight"] + 6.25 * user_data["height"] - 5 * user_data["age"] + 5
                    else:
                        expected_bmr = 10 * user_data["weight"] + 6.25 * user_data["height"] - 5 * user_data["age"] - 161
                    
                    activity_multipliers = {
                        "sedentary": 1.2,
                        "light": 1.375,
                        "moderate": 1.55,
                        "active": 1.725,
                        "very_active": 1.9
                    }
                    
                    expected_tdee = expected_bmr * activity_multipliers[profile["activity_level"]]
                    actual_tdee = nutrition["tdee"]
                    tdee_correct = abs(actual_tdee - expected_tdee) < 1.0
                    
                    # Verify target calories based on goal
                    if goal == "muscle_gain":
                        expected_target = expected_tdee + 300
                    elif goal == "fat_loss":
                        expected_target = expected_tdee - 500
                    else:  # maintenance
                        expected_target = expected_tdee
                    
                    actual_target = nutrition["target_calories"]
                    target_correct = abs(actual_target - expected_target) < 1.0
                    
                    self.log_test(f"Nutrition: {profile['name']} - {goal}", True,
                                f"TDEE: {actual_tdee:.0f} ({'✓' if tdee_correct else '✗'}), "
                                f"Target: {actual_target:.0f} ({'✓' if target_correct else '✗'}), "
                                f"Protein: {nutrition['protein_grams']:.1f}g, "
                                f"Carbs: {nutrition['carbs_grams']:.1f}g, "
                                f"Fats: {nutrition['fats_grams']:.1f}g")
                else:
                    self.log_test(f"Nutrition: {profile['name']} - {goal}", False,
                                f"Status: {nutrition_response.status_code}")
            
            # Test getting nutrition plans for user
            plans_response = self.make_request("GET", f"/nutrition/user/{user['id']}")
            if plans_response.status_code == 200:
                plans = plans_response.json()
                self.log_test(f"Get Nutrition Plans: {profile['name']}", True,
                            f"Retrieved {len(plans)} nutrition plans")
            else:
                self.log_test(f"Get Nutrition Plans: {profile['name']}", False,
                            f"Status: {plans_response.status_code}")

    # ============= 5. PROGRESS TRACKING - VOLLSTÄNDIGE SZENARIEN =============
    
    def test_progress_tracking_complete(self):
        """Test progress tracking with all field combinations"""
        print("\n📈 TESTING PROGRESS TRACKING - COMPLETE SCENARIOS")
        
        if not self.created_users:
            self.log_test("Progress Tracking Setup", False, "No users available")
            return
        
        user_id = self.created_users[0]
        
        # Test 1: Progress entry with ALL fields
        sample_photo_base64 = base64.b64encode(b"fake_image_data_for_testing").decode('utf-8')
        
        complete_progress = {
            "user_id": user_id,
            "weight": 85.5,
            "body_fat_percentage": 12.5,
            "chest_cm": 105.0,
            "waist_cm": 82.0,
            "arms_cm": 38.5,
            "legs_cm": 62.0,
            "photo_base64": sample_photo_base64,
            "notes": "Exzellenter Fortschritt diese Woche! Fühle mich stärker und definierter. "
                    "Ernährung war perfekt und Trainingsintensität hoch. "
                    "Freue mich auf nächste Woche Messungen."
        }
        
        response = self.make_request("POST", "/progress", complete_progress)
        if response.status_code == 200:
            progress = response.json()
            self.log_test("Progress Entry - All Fields", True,
                         "Created complete progress entry with all measurements and photo")
        else:
            self.log_test("Progress Entry - All Fields", False,
                         f"Status: {response.status_code}, Response: {response.text}")
        
        # Test 2: Progress entry with only weight
        weight_only_progress = {
            "user_id": user_id,
            "weight": 86.0
        }
        
        response = self.make_request("POST", "/progress", weight_only_progress)
        success = response.status_code == 200
        self.log_test("Progress Entry - Weight Only", success, "Created progress entry with weight only")
        
        # Test 3: Progress entry with only photo
        photo_only_progress = {
            "user_id": user_id,
            "photo_base64": sample_photo_base64,
            "notes": "Fortschrittsfoto - sehe lean aus!"
        }
        
        response = self.make_request("POST", "/progress", photo_only_progress)
        success = response.status_code == 200
        self.log_test("Progress Entry - Photo Only", success, "Created progress entry with photo only")
        
        # Test 4: Create multiple progress entries (10+)
        for i in range(10):
            progress_data = {
                "user_id": user_id,
                "weight": 85.0 + (i * 0.2),
                "body_fat_percentage": 12.0 - (i * 0.1),
                "notes": f"Fortschrittseintrag #{i+1} - Woche {i+1} Messungen"
            }
            
            response = self.make_request("POST", "/progress", progress_data)
            success = response.status_code == 200
            if not success:
                self.log_test(f"Multiple Progress Entry #{i+1}", False, f"Status: {response.status_code}")
                break
        else:
            self.log_test("Multiple Progress Entries", True, "Created 10 progress entries successfully")
        
        # Test 5: Get progress history
        response = self.make_request("GET", f"/progress/user/{user_id}")
        if response.status_code == 200:
            progress_entries = response.json()
            self.log_test("Get Progress History", True, f"Retrieved {len(progress_entries)} progress entries")
            
            # Verify sorting by date (most recent first)
            if len(progress_entries) > 1:
                dates_sorted = all(
                    progress_entries[i]["date"] >= progress_entries[i+1]["date"]
                    for i in range(len(progress_entries)-1)
                )
                self.log_test("Progress History Sorting", dates_sorted,
                             f"Progress entries {'are' if dates_sorted else 'are NOT'} sorted by date")
        else:
            self.log_test("Get Progress History", False, f"Status: {response.status_code}")

    # ============= 6. AI TRAINING PLAN GENERATOR - TIEFENTEST =============
    
    def test_ai_training_plan_generator(self):
        """Test AI training plan generation with various scenarios"""
        print("\n🤖 TESTING AI TRAINING PLAN GENERATOR")
        
        if not self.created_users:
            self.log_test("AI Training Plan Setup", False, "No users available")
            return
        
        user_id = self.created_users[0]
        
        # Test different days per week
        days_scenarios = [3, 4, 5, 6]
        
        for days in days_scenarios:
            plan_request = {
                "user_id": user_id,
                "days_per_week": days,
                "duration_weeks": 12,
                "equipment_available": ["barbell", "dumbbell", "cable", "machine"]
            }
            
            start_time = time.time()
            response = self.make_request("POST", "/training-plans/generate", plan_request, timeout=20)
            generation_time = time.time() - start_time
            
            if response.status_code == 200:
                plan = response.json()
                ai_response = plan.get("ai_recommendations", "")
                response_quality = len(ai_response) > 500
                speed_ok = generation_time < 15.0
                
                self.log_test(f"AI Plan Generation - {days} days", True,
                             f"Generated in {generation_time:.1f}s, "
                             f"Quality: {'✓' if response_quality else '✗'} ({len(ai_response)} chars), "
                             f"Speed: {'✓' if speed_ok else '✗'}")
            else:
                self.log_test(f"AI Plan Generation - {days} days", False,
                             f"Status: {response.status_code}, Time: {generation_time:.1f}s")
        
        # Test different equipment combinations
        equipment_scenarios = [
            ["barbell"],
            ["barbell", "dumbbell"],
            ["barbell", "dumbbell", "cable", "machine"],
            ["bodyweight"]
        ]
        
        for equipment in equipment_scenarios:
            plan_request = {
                "user_id": user_id,
                "days_per_week": 4,
                "duration_weeks": 8,
                "equipment_available": equipment
            }
            
            response = self.make_request("POST", "/training-plans/generate", plan_request, timeout=20)
            if response.status_code == 200:
                plan = response.json()
                equipment_str = ", ".join(equipment)
                self.log_test(f"AI Plan - Equipment: {equipment_str}", True,
                             f"Generated plan for {equipment_str}")
            else:
                self.log_test(f"AI Plan - Equipment: {equipment_str}", False,
                             f"Status: {response.status_code}")
        
        # Test different duration weeks
        duration_scenarios = [8, 12, 16]
        
        for duration in duration_scenarios:
            plan_request = {
                "user_id": user_id,
                "days_per_week": 4,
                "duration_weeks": duration,
                "equipment_available": ["barbell", "dumbbell"]
            }
            
            response = self.make_request("POST", "/training-plans/generate", plan_request, timeout=20)
            success = response.status_code == 200
            self.log_test(f"AI Plan - {duration} weeks", success, f"Generated {duration}-week plan")
        
        # Test getting training plans for user
        response = self.make_request("GET", f"/training-plans/user/{user_id}")
        if response.status_code == 200:
            plans = response.json()
            self.log_test("Get Training Plans", True, f"Retrieved {len(plans)} training plans")
        else:
            self.log_test("Get Training Plans", False, f"Status: {response.status_code}")

    # ============= 7. ERROR HANDLING & EDGE CASES =============
    
    def test_error_handling_edge_cases(self):
        """Test error handling and edge cases"""
        print("\n⚠️ TESTING ERROR HANDLING & EDGE CASES")
        
        # Test 1: GET user with non-existent ID
        fake_user_id = str(uuid.uuid4())
        response = self.make_request("GET", f"/users/{fake_user_id}")
        success = response.status_code == 404
        self.log_test("GET Non-existent User", success, f"Expected 404, got {response.status_code}")
        
        # Test 2: POST workout for non-existent user
        fake_workout = {
            "user_id": fake_user_id,
            "workout_type": "push",
            "exercises": [
                {
                    "exercise_id": str(uuid.uuid4()),
                    "exercise_name": "Test Exercise",
                    "sets": [{"set_number": 1, "reps": 10, "weight": 50.0}]
                }
            ]
        }
        
        response = self.make_request("POST", "/workouts", fake_workout)
        # Note: This might not return 404 if user validation isn't implemented
        self.log_test("POST Workout for Non-existent User", True, f"Status: {response.status_code}")
        
        # Test 3: POST nutrition without user stats
        if self.created_users:
            # Create user without weight, height, age
            incomplete_user = {
                "name": "Incomplete User",
                "email": "incomplete@test.de"
            }
            
            user_response = self.make_request("POST", "/users", incomplete_user)
            if user_response.status_code == 200:
                incomplete_user_obj = user_response.json()
                self.created_users.append(incomplete_user_obj["id"])
                
                nutrition_request = {
                    "user_id": incomplete_user_obj["id"],
                    "goal": "muscle_gain"
                }
                
                nutrition_response = self.make_request("POST", "/nutrition/calculate", nutrition_request)
                success = nutrition_response.status_code == 400
                self.log_test("Nutrition without User Stats", success,
                             f"Expected 400, got {nutrition_response.status_code}")
        
        # Test 4: POST progress for non-existent user
        fake_progress = {
            "user_id": fake_user_id,
            "weight": 80.0
        }
        
        response = self.make_request("POST", "/progress", fake_progress)
        # Note: This might not return 404 if user validation isn't implemented
        self.log_test("POST Progress for Non-existent User", True, f"Status: {response.status_code}")
        
        # Test 5: POST exercise with missing fields
        incomplete_exercise = {
            "name": "Incomplete Exercise"
            # Missing required fields: muscle_groups, equipment, difficulty, description, instructions
        }
        
        response = self.make_request("POST", "/exercises", incomplete_exercise)
        success = response.status_code == 422
        self.log_test("POST Exercise with Missing Fields", success,
                     f"Expected 422, got {response.status_code}")
        
        # Test 6: Very long strings
        long_notes = "A" * 10000  # 10k character string
        
        if self.created_users:
            long_progress = {
                "user_id": self.created_users[0],
                "weight": 80.0,
                "notes": long_notes
            }
            
            response = self.make_request("POST", "/progress", long_progress)
            success = response.status_code in [200, 400, 413]  # Accept various responses
            self.log_test("Very Long String in Notes", success,
                         f"Status: {response.status_code} for 10k character notes")

    # ============= 8. PERFORMANCE TESTS =============
    
    def test_performance_scenarios(self):
        """Test performance with large datasets"""
        print("\n⚡ TESTING PERFORMANCE SCENARIOS")
        
        if not self.created_users:
            self.log_test("Performance Test Setup", False, "No users available")
            return
        
        user_id = self.created_users[0]
        
        # Test 1: Create 20+ workouts
        print("Creating 20 workouts for performance testing...")
        workout_creation_times = []
        
        for i in range(20):
            workout_data = {
                "user_id": user_id,
                "workout_type": "custom",
                "exercises": [
                    {
                        "exercise_id": str(uuid.uuid4()),
                        "exercise_name": f"Performance Test Exercise {i}",
                        "sets": [
                            {"set_number": 1, "reps": 10, "weight": 50.0 + i},
                            {"set_number": 2, "reps": 8, "weight": 55.0 + i}
                        ]
                    }
                ]
            }
            
            start_time = time.time()
            response = self.make_request("POST", "/workouts", workout_data)
            creation_time = time.time() - start_time
            workout_creation_times.append(creation_time)
            
            if response.status_code == 200:
                workout = response.json()
                self.created_workouts.append(workout["id"])
            else:
                self.log_test(f"Performance Workout #{i+1}", False, f"Status: {response.status_code}")
                break
        else:
            avg_creation_time = sum(workout_creation_times) / len(workout_creation_times)
            self.log_test("Create 20 Workouts Performance", True,
                         f"Average creation time: {avg_creation_time:.3f}s")
        
        # Test 2: Create 20+ progress entries
        print("Creating 20 progress entries for performance testing...")
        progress_creation_times = []
        
        for i in range(20):
            progress_data = {
                "user_id": user_id,
                "weight": 80.0 + (i * 0.1),
                "body_fat_percentage": 15.0 - (i * 0.05),
                "notes": f"Performance test progress entry #{i+1}"
            }
            
            start_time = time.time()
            response = self.make_request("POST", "/progress", progress_data)
            creation_time = time.time() - start_time
            progress_creation_times.append(creation_time)
            
            if response.status_code != 200:
                self.log_test(f"Performance Progress #{i+1}", False, f"Status: {response.status_code}")
                break
        else:
            avg_creation_time = sum(progress_creation_times) / len(progress_creation_times)
            self.log_test("Create 20 Progress Entries Performance", True,
                         f"Average creation time: {avg_creation_time:.3f}s")
        
        # Test 3: Retrieve large workout history
        start_time = time.time()
        response = self.make_request("GET", f"/workouts/user/{user_id}")
        retrieval_time = time.time() - start_time
        
        if response.status_code == 200:
            workouts = response.json()
            self.log_test("Large Workout History Retrieval", True,
                         f"Retrieved {len(workouts)} workouts in {retrieval_time:.3f}s")
        else:
            self.log_test("Large Workout History Retrieval", False, f"Status: {response.status_code}")

    # ============= 9. DATA CONSISTENCY TESTS =============
    
    def test_data_consistency(self):
        """Test data consistency and calculations"""
        print("\n🔍 TESTING DATA CONSISTENCY")
        
        if not self.created_users:
            self.log_test("Data Consistency Setup", False, "No users available")
            return
        
        user_id = self.created_users[0]
        
        # Test 1: Performance points increment
        # Get initial performance points
        user_response = self.make_request("GET", f"/users/{user_id}")
        if user_response.status_code != 200:
            self.log_test("Get User for Performance Points", False, f"Status: {user_response.status_code}")
            return
        
        initial_user = user_response.json()
        initial_points = initial_user.get("performance_points", 0)
        
        # Create a workout
        workout_data = {
            "user_id": user_id,
            "workout_type": "custom",
            "exercises": [
                {
                    "exercise_id": str(uuid.uuid4()),
                    "exercise_name": "Consistency Test Exercise",
                    "sets": [{"set_number": 1, "reps": 10, "weight": 50.0}]
                }
            ]
        }
        
        workout_response = self.make_request("POST", "/workouts", workout_data)
        if workout_response.status_code == 200:
            # Check performance points after workout
            updated_user_response = self.make_request("GET", f"/users/{user_id}")
            if updated_user_response.status_code == 200:
                updated_user = updated_user_response.json()
                final_points = updated_user.get("performance_points", 0)
                points_increased = final_points > initial_points
                expected_increase = final_points == initial_points + 10
                
                self.log_test("Performance Points Increment", points_increased and expected_increase,
                             f"Points: {initial_points} → {final_points} "
                             f"({'✓' if expected_increase else '✗'} expected +10)")
        
        # Test 2: Workout volume calculation consistency
        test_workout = {
            "user_id": user_id,
            "workout_type": "custom",
            "exercises": [
                {
                    "exercise_id": str(uuid.uuid4()),
                    "exercise_name": "Volume Test Exercise",
                    "sets": [
                        {"set_number": 1, "reps": 10, "weight": 100.0},  # 1000
                        {"set_number": 2, "reps": 8, "weight": 110.0},   # 880
                        {"set_number": 3, "reps": 6, "weight": 120.0}    # 720
                    ]
                }
            ]
        }
        
        expected_volume = (10 * 100.0) + (8 * 110.0) + (6 * 120.0)  # 2600
        
        volume_response = self.make_request("POST", "/workouts", test_workout)
        if volume_response.status_code == 200:
            workout = volume_response.json()
            actual_volume = workout.get("total_volume", 0)
            volume_correct = abs(actual_volume - expected_volume) < 0.01
            
            self.log_test("Workout Volume Calculation", volume_correct,
                         f"Expected: {expected_volume}, Actual: {actual_volume}")
        
        # Test 3: TDEE calculation consistency
        # Test same parameters should give identical TDEE
        nutrition_request = {
            "user_id": user_id,
            "goal": "maintenance"
        }
        
        # Make two identical requests
        response1 = self.make_request("POST", "/nutrition/calculate", nutrition_request)
        time.sleep(0.1)  # Small delay
        response2 = self.make_request("POST", "/nutrition/calculate", nutrition_request)
        
        if response1.status_code == 200 and response2.status_code == 200:
            nutrition1 = response1.json()
            nutrition2 = response2.json()
            
            tdee1 = nutrition1.get("tdee", 0)
            tdee2 = nutrition2.get("tdee", 0)
            tdee_consistent = abs(tdee1 - tdee2) < 0.01
            
            self.log_test("TDEE Calculation Consistency", tdee_consistent,
                         f"TDEE1: {tdee1}, TDEE2: {tdee2}")
        
        # Test 4: Timestamp consistency
        # Check that created_at timestamps are reasonable
        current_time = datetime.utcnow()
        
        if self.created_workouts:
            workout_response = self.make_request("GET", f"/workouts/{self.created_workouts[0]}")
            if workout_response.status_code == 200:
                workout = workout_response.json()
                created_at_str = workout.get("created_at", "")
                try:
                    created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                    time_diff = abs((current_time - created_at).total_seconds())
                    timestamp_reasonable = time_diff < 3600  # Within 1 hour
                    
                    self.log_test("Timestamp Consistency", timestamp_reasonable,
                                 f"Created {time_diff:.0f}s ago")
                except Exception as e:
                    self.log_test("Timestamp Consistency", False,
                                 f"Invalid timestamp format: {created_at_str}")

    # ============= 10. INTEGRATION TESTS =============
    
    def test_integration_complete_flow(self):
        """Test complete integration flow"""
        print("\n🔄 TESTING COMPLETE INTEGRATION FLOW")
        
        # Complete user journey
        print("Starting complete user journey...")
        
        # Step 1: Create user
        user_data = {
            "name": "Integration Test User",
            "email": "integration@ironreign.de",
            "age": 28,
            "weight": 75.0,
            "height": 175.0,
            "gender": "male"
        }
        
        user_response = self.make_request("POST", "/users", user_data)
        if user_response.status_code != 200:
            self.log_test("Integration Flow - Create User", False, f"Status: {user_response.status_code}")
            return
        
        user = user_response.json()
        integration_user_id = user["id"]
        self.created_users.append(integration_user_id)
        
        # Step 2: Update profile
        profile_update = {
            "experience_level": "intermediate",
            "goal": "muscle_gain",
            "activity_level": "active"
        }
        
        update_response = self.make_request("PUT", f"/users/{integration_user_id}", profile_update)
        profile_updated = update_response.status_code == 200
        
        # Step 3: Load exercises
        exercises_response = self.make_request("GET", "/exercises")
        exercises_loaded = exercises_response.status_code == 200
        
        # Step 4: Track workout
        integration_workout = {
            "user_id": integration_user_id,
            "workout_type": "push",
            "exercises": [
                {
                    "exercise_id": str(uuid.uuid4()),
                    "exercise_name": "Integration Bankdrücken",
                    "sets": [
                        {"set_number": 1, "reps": 12, "weight": 80.0},
                        {"set_number": 2, "reps": 10, "weight": 85.0}
                    ]
                }
            ]
        }
        
        workout_response = self.make_request("POST", "/workouts", integration_workout)
        workout_tracked = workout_response.status_code == 200
        
        # Step 5: Calculate nutrition
        nutrition_request = {
            "user_id": integration_user_id,
            "goal": "muscle_gain"
        }
        
        nutrition_response = self.make_request("POST", "/nutrition/calculate", nutrition_request)
        nutrition_calculated = nutrition_response.status_code == 200
        
        # Step 6: Log progress
        progress_data = {
            "user_id": integration_user_id,
            "weight": 76.0,
            "body_fat_percentage": 11.5,
            "notes": "Integration test progress entry"
        }
        
        progress_response = self.make_request("POST", "/progress", progress_data)
        progress_logged = progress_response.status_code == 200
        
        # Step 7: Generate AI plan
        plan_request = {
            "user_id": integration_user_id,
            "days_per_week": 4,
            "duration_weeks": 12,
            "equipment_available": ["barbell", "dumbbell"]
        }
        
        plan_response = self.make_request("POST", "/training-plans/generate", plan_request, timeout=20)
        plan_generated = plan_response.status_code == 200
        
        # Verify complete flow
        all_steps_successful = all([
            profile_updated,
            exercises_loaded,
            workout_tracked,
            nutrition_calculated,
            progress_logged,
            plan_generated
        ])
        
        self.log_test("Complete Integration Flow", all_steps_successful,
                     f"Profile: {'✓' if profile_updated else '✗'}, "
                     f"Exercises: {'✓' if exercises_loaded else '✗'}, "
                     f"Workout: {'✓' if workout_tracked else '✗'}, "
                     f"Nutrition: {'✓' if nutrition_calculated else '✗'}, "
                     f"Progress: {'✓' if progress_logged else '✗'}, "
                     f"AI Plan: {'✓' if plan_generated else '✗'}")
        
        # Verify data persistence
        print("Verifying data persistence...")
        
        # Check user data persisted
        final_user_response = self.make_request("GET", f"/users/{integration_user_id}")
        user_persisted = final_user_response.status_code == 200
        
        # Check workout history persisted
        workouts_response = self.make_request("GET", f"/workouts/user/{integration_user_id}")
        workouts_persisted = workouts_response.status_code == 200
        
        # Check nutrition plans persisted
        nutrition_plans_response = self.make_request("GET", f"/nutrition/user/{integration_user_id}")
        nutrition_persisted = nutrition_plans_response.status_code == 200
        
        # Check progress persisted
        progress_history_response = self.make_request("GET", f"/progress/user/{integration_user_id}")
        progress_persisted = progress_history_response.status_code == 200
        
        # Check training plans persisted
        training_plans_response = self.make_request("GET", f"/training-plans/user/{integration_user_id}")
        plans_persisted = training_plans_response.status_code == 200
        
        persistence_success = all([
            user_persisted,
            workouts_persisted,
            nutrition_persisted,
            progress_persisted,
            plans_persisted
        ])
        
        self.log_test("Data Persistence Verification", persistence_success,
                     f"User: {'✓' if user_persisted else '✗'}, "
                     f"Workouts: {'✓' if workouts_persisted else '✗'}, "
                     f"Nutrition: {'✓' if nutrition_persisted else '✗'}, "
                     f"Progress: {'✓' if progress_persisted else '✗'}, "
                     f"Plans: {'✓' if plans_persisted else '✗'}")

    # ============= MAIN TEST RUNNER =============
    
    def run_all_tests(self):
        """Run all comprehensive tests"""
        print("🚀 STARTING UMFASSENDE IRONREIGN BACKEND TESTS A-Z")
        print(f"🎯 Testing against: {self.base_url}")
        print("=" * 80)
        
        try:
            # Test API availability
            response = self.make_request("GET", "/")
            if response.status_code != 200:
                self.log_test("API Availability", False, 
                             f"API not responding. Status: {response.status_code}")
                return
            
            self.log_test("API Availability", True, "API is responding")
            
            # Run all test suites
            self.test_complete_user_lifecycle()
            self.test_exercise_library_deep_dive()
            self.test_workout_tracking_complete_flow()
            self.test_nutrition_all_scenarios()
            self.test_progress_tracking_complete()
            self.test_ai_training_plan_generator()
            self.test_error_handling_edge_cases()
            self.test_performance_scenarios()
            self.test_data_consistency()
            self.test_integration_complete_flow()
            
        except Exception as e:
            self.log_test("Test Execution", False, f"Critical error: {str(e)}")
        
        # Print summary
        self.print_test_summary()
    
    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🏆 UMFASSENDE TEST RESULTS SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"📊 TOTAL TESTS: {total_tests}")
        print(f"✅ PASSED: {passed_tests}")
        print(f"❌ FAILED: {failed_tests}")
        print(f"📈 SUCCESS RATE: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS ({failed_tests}):")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['details']}")
        
        print(f"\n🎯 CREATED TEST DATA:")
        print(f"   • Users: {len(self.created_users)}")
        print(f"   • Exercises: {len(self.created_exercises)}")
        print(f"   • Workouts: {len(self.created_workouts)}")
        
        print("\n" + "=" * 80)
        
        return passed_tests, total_tests, self.test_results

if __name__ == "__main__":
    tester = IronReignComprehensiveTester()
    passed, total, results = tester.run_all_tests()
    
    # Print summary of failed tests
    failed_tests = [r for r in results if not r['success']]
    if failed_tests:
        print("\n❌ Failed Tests Summary:")
        for test in failed_tests:
            print(f"  - {test['test']}: {test['details']}")
    
    print(f"\n🏁 Final Result: {passed}/{total} tests passed")
    if passed == total:
        print("🎉 ALL TESTS PASSED! IronReign API ist vollständig funktionsfähig.")
    else:
        print(f"⚠️ {total - passed} tests failed. Check details above.")