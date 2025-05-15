-- Create table for storing user recommendation preferences
CREATE TABLE IF NOT EXISTS public.user_recommendation_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Add an index on user_id for faster queries
  CONSTRAINT user_recommendation_preferences_user_id_idx UNIQUE (user_id, created_at)
);

-- Create table for recommendation history
CREATE TABLE IF NOT EXISTS public.recommendation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommended_courses UUID[] NOT NULL,
  preference_id UUID REFERENCES public.user_recommendation_preferences(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for recommendation feedback
CREATE TABLE IF NOT EXISTS public.recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL REFERENCES public.recommendation_history(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.user_recommendation_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;

-- Users can only see their own preferences
CREATE POLICY user_preferences_policy ON public.user_recommendation_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own recommendation history
CREATE POLICY recommendation_history_policy ON public.recommendation_history
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own feedback
CREATE POLICY recommendation_feedback_policy ON public.recommendation_feedback
  FOR ALL USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_recommendation_preferences TO authenticated;
GRANT SELECT, INSERT ON public.recommendation_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.recommendation_feedback TO authenticated;

-- ML Model integration table (placeholder for future integration)
CREATE TABLE IF NOT EXISTS public.recommendation_ml_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_vector JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS for ML features table
ALTER TABLE public.recommendation_ml_features ENABLE ROW LEVEL SECURITY;

-- Users can only see their own ML features
CREATE POLICY ml_features_policy ON public.recommendation_ml_features
  FOR ALL USING (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.recommendation_ml_features TO authenticated; 