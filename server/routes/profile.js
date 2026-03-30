import { Router } from 'express';
const router = Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await req.supabase.from('profiles').select('*').eq('id', req.user.id).single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/', async (req, res) => {
  try {
    const { first_name, last_name, phone, avatar_url, address_line1, address_line2, city, state, zip_code, country, automated_reminders, event_notifications } = req.body;
    const { data, error } = await req.supabase.from('profiles').update({ first_name, last_name, phone, avatar_url, address_line1, address_line2, city, state, zip_code, country, automated_reminders, event_notifications }).eq('id', req.user.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
