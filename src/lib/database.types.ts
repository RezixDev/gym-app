export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    updated_at: string | null
                    calorie_goal: number | null
                    protein_goal: number | null
                    unit_preference: string | null
                    weight: number | null
                    height: number | null
                }
                Insert: {
                    id: string
                    username?: string | null
                    updated_at?: string | null
                    calorie_goal?: number | null
                    protein_goal?: number | null
                    unit_preference?: string | null
                    weight?: number | null
                    height?: number | null
                }
                Update: {
                    id?: string
                    username?: string | null
                    updated_at?: string | null
                    calorie_goal?: number | null
                    protein_goal?: number | null
                    unit_preference?: string | null
                    weight?: number | null
                    height?: number | null
                }
            }
            exercises: {
                Row: {
                    id: string
                    name: string
                    muscle_group: string | null
                    equipment_type: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    muscle_group?: string | null
                    equipment_type?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    muscle_group?: string | null
                    equipment_type?: string | null
                    created_at?: string | null
                }
            }
            workouts: {
                Row: {
                    id: string
                    user_id: string
                    start_time: string | null
                    end_time: string | null
                    notes: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    start_time?: string | null
                    end_time?: string | null
                    notes?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    start_time?: string | null
                    end_time?: string | null
                    notes?: string | null
                    created_at?: string | null
                }
            }
            workout_sets: {
                Row: {
                    id: string
                    workout_id: string
                    exercise_id: string
                    reps: number
                    weight: number
                    set_number: number
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    workout_id: string
                    exercise_id: string
                    reps: number
                    weight: number
                    set_number: number
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    workout_id?: string
                    exercise_id?: string
                    reps?: number
                    weight?: number
                    set_number?: number
                    created_at?: string | null
                }
            }
            body_measurements: {
                Row: {
                    id: string
                    user_id: string
                    part_name: string
                    value: number
                    unit: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    part_name: string
                    value: number
                    unit?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    part_name?: string
                    value?: number
                    unit?: string | null
                    created_at?: string | null
                }
            }
            daily_nutrition: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    calories: number
                    protein: number
                    carbs: number
                    fats: number
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    date?: string
                    calories?: number
                    protein?: number
                    carbs?: number
                    fats?: number
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    calories?: number
                    protein?: number
                    carbs?: number
                    fats?: number
                    created_at?: string | null
                }
            }
        }
    }
}
