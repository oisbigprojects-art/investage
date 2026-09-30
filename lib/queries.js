// Startap kabinetida so'rovlar bilan birga investor tanishtiruvi ham olinadi
export const STARTUP_REQUESTS_SELECT =
  'id, status, message, created_at, decided_at, investor:profiles!access_requests_investor_id_fkey(full_name, email, company, interests, bio)';
