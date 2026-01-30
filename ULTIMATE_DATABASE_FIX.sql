-- 1. Ensure the applications table has the correct structure for chats
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES chats(id) ON DELETE SET NULL;

-- 2. Ensure Row Level Security (RLS) is enabled but permitted for our operations
-- We need to Allow Employers to update application status for jobs they own
-- We need to Allow Anyone (authenticated) to view applications they are part of

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Seeker can view their own applications
CREATE POLICY "Seekers can view their own applications"
ON applications FOR SELECT
USING (auth.uid() = seeker_id);

-- Employer can view applications for their jobs
CREATE POLICY "Employers can view applications for their jobs"
ON applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = applications.job_id
    AND jobs.employer_id = auth.uid()
  )
);

-- Employer can update application status and chat_id
CREATE POLICY "Employers can update their received applications"
ON applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = applications.job_id
    AND jobs.employer_id = auth.uid()
  )
);

-- Seeker can create applications
CREATE POLICY "Seekers can create applications"
ON applications FOR INSERT
WITH CHECK (auth.uid() = seeker_id);

-- 3. ENABLE REALTIME for these tables so the UI updates automatically
-- This is crucial for the "Pending" -> "Chat" transition to happen without refresh
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE applications;

-- 4. Just in case: Make sure the status column is not restricted by a constraint that prevents 'Accepted'
-- (Assuming it's a text column or an enum that includes 'Accepted')
-- If it's a text column, we're good. If it's an enum, we'd need to check it separately.
