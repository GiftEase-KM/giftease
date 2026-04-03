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
    const {
      first_name, last_name, phone, avatar_url,
      address_line1, address_line2, city, state, zip_code, country,
      automated_reminders, event_notifications, default_font_id,
    } = req.body;

    // Only include fields that were actually sent
    const updates = {};
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (address_line1 !== undefined) updates.address_line1 = address_line1;
    if (address_line2 !== undefined) updates.address_line2 = address_line2;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (zip_code !== undefined) updates.zip_code = zip_code;
    if (country !== undefined) updates.country = country;
    if (automated_reminders !== undefined) updates.automated_reminders = automated_reminders;
    if (event_notifications !== undefined) updates.event_notifications = event_notifications;
    if (default_font_id !== undefined) updates.default_font_id = default_font_id;

    const { data, error } = await req.supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;