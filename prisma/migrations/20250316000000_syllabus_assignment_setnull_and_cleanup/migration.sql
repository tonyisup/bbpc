-- Step 1: Clean existing orphaned Syllabus rows (assignmentId points to deleted Assignment)
-- Run this before altering FKs so referential integrity is satisfied.
DELETE FROM [dbo].[Syllabus]
WHERE [assignmentId] IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM [dbo].[Assignment] a WHERE a.[id] = [Syllabus].[assignmentId]);

-- Step 2: Syllabus.assignmentId -> ON DELETE SET NULL (clear assignmentId when Assignment is deleted)
ALTER TABLE [dbo].[Syllabus] DROP CONSTRAINT [Syllabus_assignmentId_fkey];
ALTER TABLE [dbo].[Syllabus] ADD CONSTRAINT [Syllabus_assignmentId_fkey] FOREIGN KEY ([assignmentId]) REFERENCES [dbo].[Assignment]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- Step 3: Syllabus.movieId -> ON DELETE NO ACTION (breaks cyclic referential actions with Assignment path)
ALTER TABLE [dbo].[Syllabus] DROP CONSTRAINT [Syllabus_movieId_fkey];
ALTER TABLE [dbo].[Syllabus] ADD CONSTRAINT [Syllabus_movieId_fkey] FOREIGN KEY ([movieId]) REFERENCES [dbo].[Movie]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
