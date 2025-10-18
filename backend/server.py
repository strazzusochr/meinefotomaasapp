from fastapi import FastAPI, APIRouter, HTTPException, Body
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, date
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Get LLM key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app
app = FastAPI(title="IronReign API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    age: Optional[int] = None
    weight: Optional[float] = None  # kg
    height: Optional[float] = None  # cm
    gender: Optional[str] = None
    experience_level: Optional[str] = "beginner"  # beginner, intermediate, advanced, pro
    goal: Optional[str] = "muscle_gain"  # muscle_gain, strength, fat_loss, maintenance
    activity_level: Optional[str] = "moderate"  # sedentary, light, moderate, active, very_active
    level: str = "Rookie"  # Rookie -> Warrior -> Beast -> Titan
    performance_points: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: str
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    gender: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    gender: Optional[str] = None
    experience_level: Optional[str] = None
    goal: Optional[str] = None
    activity_level: Optional[str] = None

class Exercise(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    muscle_groups: List[str]  # chest, back, legs, shoulders, arms, core
    equipment: str  # barbell, dumbbell, cable, bodyweight, machine
    difficulty: str  # beginner, intermediate, advanced
    description: str
    instructions: List[str]
    image_base64: Optional[str] = None  # Base64 encoded image
    tips: Optional[List[str]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ExerciseCreate(BaseModel):
    name: str
    muscle_groups: List[str]
    equipment: str
    difficulty: str
    description: str
    instructions: List[str]
    image_base64: Optional[str] = None
    tips: Optional[List[str]] = None

class WorkoutSet(BaseModel):
    set_number: int
    reps: int
    weight: float  # kg
    rest_seconds: Optional[int] = 60
    completed: bool = True

class WorkoutExercise(BaseModel):
    exercise_id: str
    exercise_name: str
    sets: List[WorkoutSet]
    notes: Optional[str] = None

class Workout(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: datetime = Field(default_factory=datetime.utcnow)
    workout_type: str  # push, pull, legs, upper, lower, full_body, custom
    exercises: List[WorkoutExercise]
    duration_minutes: Optional[int] = None
    total_volume: Optional[float] = None  # sets * reps * weight
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WorkoutCreate(BaseModel):
    user_id: str
    workout_type: str
    exercises: List[WorkoutExercise]
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None

class NutritionPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    tdee: float  # Total Daily Energy Expenditure
    target_calories: float
    protein_grams: float
    carbs_grams: float
    fats_grams: float
    goal: str  # bulk, cut, maintenance
    meal_suggestions: Optional[List[str]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NutritionRequest(BaseModel):
    user_id: str
    goal: str = "muscle_gain"  # muscle_gain, fat_loss, maintenance

class ProgressEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: datetime = Field(default_factory=datetime.utcnow)
    weight: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    arms_cm: Optional[float] = None
    legs_cm: Optional[float] = None
    photo_base64: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProgressCreate(BaseModel):
    user_id: str
    weight: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    arms_cm: Optional[float] = None
    legs_cm: Optional[float] = None
    photo_base64: Optional[str] = None
    notes: Optional[str] = None

class TrainingPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_name: str
    plan_type: str  # push_pull_legs, upper_lower, full_body, bro_split
    days_per_week: int
    duration_weeks: int
    weekly_split: Dict[str, Any]  # AI-generated split
    ai_recommendations: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TrainingPlanRequest(BaseModel):
    user_id: str
    days_per_week: int = 4
    duration_weeks: int = 12
    equipment_available: Optional[List[str]] = None

# ============= ROUTES =============

@api_router.get("/")
async def root():
    return {"message": "IronReign API - Built for Champions"}

# ========== USER ROUTES ==========

@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    user_obj = User(**user.dict())
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

@api_router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_update: UserUpdate):
    existing_user = await db.users.find_one({"id": user_id})
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user_id})
    return User(**updated_user)

@api_router.get("/users", response_model=List[User])
async def list_users():
    users = await db.users.find().to_list(1000)
    return [User(**user) for user in users]

# ========== EXERCISE ROUTES ==========

@api_router.post("/exercises", response_model=Exercise)
async def create_exercise(exercise: ExerciseCreate):
    exercise_obj = Exercise(**exercise.dict())
    await db.exercises.insert_one(exercise_obj.dict())
    return exercise_obj

@api_router.get("/exercises", response_model=List[Exercise])
async def list_exercises(muscle_group: Optional[str] = None, difficulty: Optional[str] = None):
    query = {}
    if muscle_group:
        query["muscle_groups"] = muscle_group
    if difficulty:
        query["difficulty"] = difficulty
    
    exercises = await db.exercises.find(query).to_list(1000)
    return [Exercise(**ex) for ex in exercises]

@api_router.get("/exercises/{exercise_id}", response_model=Exercise)
async def get_exercise(exercise_id: str):
    exercise = await db.exercises.find_one({"id": exercise_id})
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return Exercise(**exercise)

# ========== WORKOUT ROUTES ==========

@api_router.post("/workouts", response_model=Workout)
async def create_workout(workout: WorkoutCreate):
    # Calculate total volume
    total_volume = 0
    for exercise in workout.exercises:
        for set_data in exercise.sets:
            total_volume += set_data.reps * set_data.weight
    
    workout_dict = workout.dict()
    workout_dict["total_volume"] = total_volume
    workout_obj = Workout(**workout_dict)
    
    await db.workouts.insert_one(workout_obj.dict())
    
    # Update user performance points
    await db.users.update_one(
        {"id": workout.user_id},
        {"$inc": {"performance_points": 10}}
    )
    
    return workout_obj

@api_router.get("/workouts/user/{user_id}", response_model=List[Workout])
async def get_user_workouts(user_id: str, limit: int = 50):
    workouts = await db.workouts.find({"user_id": user_id}).sort("date", -1).to_list(limit)
    return [Workout(**w) for w in workouts]

@api_router.get("/workouts/{workout_id}", response_model=Workout)
async def get_workout(workout_id: str):
    workout = await db.workouts.find_one({"id": workout_id})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return Workout(**workout)

# ========== NUTRITION ROUTES ==========

@api_router.post("/nutrition/calculate", response_model=NutritionPlan)
async def calculate_nutrition(request: NutritionRequest):
    user = await db.users.find_one({"id": request.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_obj = User(**user)
    
    # Calculate BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation
    if user_obj.weight and user_obj.height and user_obj.age:
        if user_obj.gender == "male":
            bmr = 10 * user_obj.weight + 6.25 * user_obj.height - 5 * user_obj.age + 5
        else:
            bmr = 10 * user_obj.weight + 6.25 * user_obj.height - 5 * user_obj.age - 161
        
        # Activity multipliers
        activity_multipliers = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
            "very_active": 1.9
        }
        
        tdee = bmr * activity_multipliers.get(user_obj.activity_level, 1.55)
        
        # Adjust based on goal
        if request.goal == "muscle_gain":
            target_calories = tdee + 300
            protein_multiplier = 2.2  # g per kg body weight
            fat_percentage = 0.25
        elif request.goal == "fat_loss":
            target_calories = tdee - 500
            protein_multiplier = 2.5
            fat_percentage = 0.25
        else:  # maintenance
            target_calories = tdee
            protein_multiplier = 2.0
            fat_percentage = 0.25
        
        protein_grams = user_obj.weight * protein_multiplier
        protein_calories = protein_grams * 4
        
        fats_calories = target_calories * fat_percentage
        fats_grams = fats_calories / 9
        
        carbs_calories = target_calories - protein_calories - fats_calories
        carbs_grams = carbs_calories / 4
        
        meal_suggestions = [
            f"Breakfast: {protein_grams/4:.0f}g protein, {carbs_grams/4:.0f}g carbs, {fats_grams/4:.0f}g fats",
            f"Lunch: {protein_grams/4:.0f}g protein, {carbs_grams/4:.0f}g carbs, {fats_grams/4:.0f}g fats",
            f"Pre-workout: {protein_grams/8:.0f}g protein, {carbs_grams/4:.0f}g carbs",
            f"Post-workout: {protein_grams/6:.0f}g protein, {carbs_grams/6:.0f}g carbs",
            f"Dinner: {protein_grams/4:.0f}g protein, {carbs_grams/6:.0f}g carbs, {fats_grams/4:.0f}g fats"
        ]
        
        nutrition_plan = NutritionPlan(
            user_id=request.user_id,
            tdee=tdee,
            target_calories=target_calories,
            protein_grams=protein_grams,
            carbs_grams=carbs_grams,
            fats_grams=fats_grams,
            goal=request.goal,
            meal_suggestions=meal_suggestions
        )
        
        await db.nutrition_plans.insert_one(nutrition_plan.dict())
        return nutrition_plan
    else:
        raise HTTPException(status_code=400, detail="User must have weight, height, and age set")

@api_router.get("/nutrition/user/{user_id}", response_model=List[NutritionPlan])
async def get_user_nutrition_plans(user_id: str):
    plans = await db.nutrition_plans.find({"user_id": user_id}).sort("created_at", -1).to_list(10)
    return [NutritionPlan(**p) for p in plans]

# ========== PROGRESS ROUTES ==========

@api_router.post("/progress", response_model=ProgressEntry)
async def create_progress_entry(progress: ProgressCreate):
    progress_obj = ProgressEntry(**progress.dict())
    await db.progress.insert_one(progress_obj.dict())
    return progress_obj

@api_router.get("/progress/user/{user_id}", response_model=List[ProgressEntry])
async def get_user_progress(user_id: str, limit: int = 50):
    entries = await db.progress.find({"user_id": user_id}).sort("date", -1).to_list(limit)
    return [ProgressEntry(**e) for e in entries]

# ========== AI TRAINING PLAN ROUTES ==========

@api_router.post("/training-plans/generate", response_model=TrainingPlan)
async def generate_training_plan(request: TrainingPlanRequest):
    user = await db.users.find_one({"id": request.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_obj = User(**user)
    
    # Create AI prompt for training plan generation
    prompt = f"""
You are an expert bodybuilding coach. Create a detailed {request.days_per_week}-day per week training plan for:

User Profile:
- Experience Level: {user_obj.experience_level}
- Goal: {user_obj.goal}
- Duration: {request.duration_weeks} weeks
- Equipment: {', '.join(request.equipment_available) if request.equipment_available else 'Full gym access'}

Provide a structured weekly training split with:
1. Training days (Day 1, Day 2, etc.)
2. Muscle groups for each day
3. 4-6 key exercises per day with set/rep ranges
4. Training principles (progressive overload, deload weeks, etc.)

Format as a structured plan suitable for a hardcore bodybuilder.
"""
    
    try:
        # Initialize LLM chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"training_plan_{user_obj.id}_{datetime.utcnow().isoformat()}",
            system_message="You are an expert bodybuilding and strength training coach with deep knowledge of exercise science, periodization, and muscle hypertrophy."
        )
        
        # Use GPT-4o for high-quality plans
        chat.with_model("openai", "gpt-4o")
        
        # Send message
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Create training plan structure
        plan_type_map = {
            3: "push_pull_legs",
            4: "upper_lower",
            5: "push_pull_legs",
            6: "push_pull_legs"
        }
        
        training_plan = TrainingPlan(
            user_id=request.user_id,
            plan_name=f"{request.days_per_week}-Day {user_obj.goal.replace('_', ' ').title()} Plan",
            plan_type=plan_type_map.get(request.days_per_week, "custom"),
            days_per_week=request.days_per_week,
            duration_weeks=request.duration_weeks,
            weekly_split={"ai_generated_plan": response},
            ai_recommendations=response
        )
        
        await db.training_plans.insert_one(training_plan.dict())
        return training_plan
        
    except Exception as e:
        logging.error(f"Error generating training plan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate training plan: {str(e)}")

@api_router.get("/training-plans/user/{user_id}", response_model=List[TrainingPlan])
async def get_user_training_plans(user_id: str):
    plans = await db.training_plans.find({"user_id": user_id}).sort("created_at", -1).to_list(10)
    return [TrainingPlan(**p) for p in plans]

@api_router.get("/training-plans/{plan_id}", response_model=TrainingPlan)
async def get_training_plan(plan_id: str):
    plan = await db.training_plans.find_one({"id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Training plan not found")
    return TrainingPlan(**plan)

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
