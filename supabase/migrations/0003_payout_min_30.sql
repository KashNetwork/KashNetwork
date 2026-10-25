-- Cashout minimum lowered from $50 to $30 (client request).
update app_settings set value = '3000'::jsonb, updated_at = now() where key = 'payout_min_cents';
