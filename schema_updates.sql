-- Add missing fields to courses table
ALTER TABLE public.courses
ADD COLUMN instructor VARCHAR(255),
ADD COLUMN duration VARCHAR(50),
ADD COLUMN difficulty VARCHAR(50),
ADD COLUMN enrollment_status VARCHAR(50) DEFAULT 'open',
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create course_tags table
CREATE TABLE public.course_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, tag)
);

-- Create course_anti_requisites table
CREATE TABLE public.course_anti_requisites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    anti_requisite_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, anti_requisite_id)
);

-- Add indexes for better performance
CREATE INDEX idx_courses_stream_semester ON public.courses(stream_id, semester);
CREATE INDEX idx_courses_code ON public.courses(code);
CREATE INDEX idx_course_tags_tag ON public.course_tags(tag);
CREATE INDEX idx_course_anti_requisites_course ON public.course_anti_requisites(course_id);
CREATE INDEX idx_course_anti_requisites_anti ON public.course_anti_requisites(anti_requisite_id);

-- Update RLS policies
ALTER TABLE public.course_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_anti_requisites ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_tags
CREATE POLICY "Anyone can view course tags"
    ON public.course_tags FOR SELECT
    USING (true);

CREATE POLICY "Only authenticated users can insert course tags"
    ON public.course_tags FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update course tags"
    ON public.course_tags FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete course tags"
    ON public.course_tags FOR DELETE
    USING (auth.role() = 'authenticated');

-- RLS policies for course_anti_requisites
CREATE POLICY "Anyone can view course anti-requisites"
    ON public.course_anti_requisites FOR SELECT
    USING (true);

CREATE POLICY "Only authenticated users can insert course anti-requisites"
    ON public.course_anti_requisites FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update course anti-requisites"
    ON public.course_anti_requisites FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete course anti-requisites"
    ON public.course_anti_requisites FOR DELETE
    USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for course details with tags and anti-requisites
CREATE OR REPLACE VIEW public.course_details AS
SELECT 
    c.*,
    array_agg(DISTINCT ct.tag) as tags,
    array_agg(DISTINCT car.anti_requisite_id) as anti_requisite_ids
FROM public.courses c
LEFT JOIN public.course_tags ct ON c.id = ct.course_id
LEFT JOIN public.course_anti_requisites car ON c.id = car.course_id
GROUP BY c.id;

-- Create function to check schedule conflicts
CREATE OR REPLACE FUNCTION check_schedule_conflicts(
    p_course_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_conflict BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.course_schedules cs1
        JOIN public.selected_courses sc ON cs1.course_id = sc.course_id
        JOIN public.course_schedules cs2 ON cs1.day = cs2.day
        WHERE sc.user_id = p_user_id
        AND cs2.course_id = p_course_id
        AND (
            (cs1.start_time <= cs2.end_time AND cs1.end_time >= cs2.start_time)
        )
    ) INTO v_has_conflict;

    RETURN v_has_conflict;
END;
$$ LANGUAGE plpgsql;

-- Create function to check prerequisites
CREATE OR REPLACE FUNCTION check_prerequisites(
    p_course_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_prerequisites BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.course_prerequisites cp
        WHERE cp.course_id = p_course_id
        AND cp.prerequisite_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1
            FROM public.selected_courses sc
            WHERE sc.user_id = p_user_id
            AND sc.course_id = cp.prerequisite_id
        )
    ) INTO v_has_prerequisites;

    RETURN NOT v_has_prerequisites;
END;
$$ LANGUAGE plpgsql;

-- Create function to check anti-requisites
CREATE OR REPLACE FUNCTION check_anti_requisites(
    p_course_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_anti_requisites BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.course_anti_requisites car
        WHERE car.course_id = p_course_id
        AND EXISTS (
            SELECT 1
            FROM public.selected_courses sc
            WHERE sc.user_id = p_user_id
            AND sc.course_id = car.anti_requisite_id
        )
    ) INTO v_has_anti_requisites;

    RETURN NOT v_has_anti_requisites;
END;
$$ LANGUAGE plpgsql; 