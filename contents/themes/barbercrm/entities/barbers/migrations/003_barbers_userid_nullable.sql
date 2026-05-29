-- Allow barbers to exist without a linked user account (owner creates barber first,
-- links a team member account later via the barber edit form).
ALTER TABLE public."barbers"
  DROP CONSTRAINT IF EXISTS barbers_userid_fkey,
  ALTER COLUMN "userId" DROP NOT NULL;

-- Re-add the FK as nullable (no ON DELETE CASCADE — just SET NULL)
ALTER TABLE public."barbers"
  ADD CONSTRAINT barbers_userid_fkey
    FOREIGN KEY ("userId") REFERENCES public."users"(id) ON DELETE SET NULL;

-- Index for the user→barber lookup used by the calendar API
CREATE INDEX IF NOT EXISTS idx_barbers_user_id ON public."barbers"("userId");
