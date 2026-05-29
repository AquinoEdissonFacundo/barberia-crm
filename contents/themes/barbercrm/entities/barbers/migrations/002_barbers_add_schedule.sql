ALTER TABLE public."barbers"
  ADD COLUMN IF NOT EXISTS schedule JSONB NOT NULL DEFAULT '{
    "mon": {"enabled": true,  "start": "09:00", "end": "19:00"},
    "tue": {"enabled": true,  "start": "09:00", "end": "19:00"},
    "wed": {"enabled": true,  "start": "09:00", "end": "19:00"},
    "thu": {"enabled": true,  "start": "09:00", "end": "19:00"},
    "fri": {"enabled": true,  "start": "09:00", "end": "19:00"},
    "sat": {"enabled": false, "start": "09:00", "end": "14:00"},
    "sun": {"enabled": false, "start": "09:00", "end": "14:00"}
  }';
