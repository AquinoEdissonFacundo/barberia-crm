-- When a user joins a team, automatically link their account to a barber
-- record in that team if the barber's email matches the user's email.
CREATE OR REPLACE FUNCTION auto_link_barber_on_team_join()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public."barbers" b
  SET    "userId"    = NEW."userId",
         "updatedAt" = now()
  FROM   public."users" u
  WHERE  u.id              = NEW."userId"
    AND  lower(u.email)    = lower(b.email)
    AND  b."teamId"        = NEW."teamId"
    AND  b."userId"        IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_link_barber ON public."team_members";

CREATE TRIGGER trg_auto_link_barber
  AFTER INSERT ON public."team_members"
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_barber_on_team_join();
