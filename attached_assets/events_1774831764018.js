import { Router } from 'express';

const router = Router();

// GET /api/events/types — dropdown options for event type selector
router.get('/types', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('event_types')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events — all events for current user, chronologically
router.get('/', async (req, res) => {
  try {
    const { status } = req.query; // optional filter: upcoming, completed, paused

    let query = req.supabase
      .from('events')
      .select(`
        *,
        persons!inner (id, full_name, nickname, relationship, avatar_url),
        event_types!inner (label, requires_date_input, fixed_month, fixed_day, is_calculated)
      `)
      .order('event_date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/upcoming — dashboard: next N upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const { data, error } = await req.supabase
      .from('event_occurrences')
      .select(`
        *,
        events!inner (
          *,
          persons!inner (id, full_name, nickname, relationship, avatar_url),
          event_types!inner (label)
        )
      `)
      .gte('occurrence_date', new Date().toISOString().split('T')[0])
      .in('status', ['pending', 'reminded'])
      .order('occurrence_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id — single event with occurrences
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('events')
      .select(`
        *,
        persons (id, full_name, nickname, relationship, avatar_url),
        event_types (label, requires_date_input, fixed_month, fixed_day, is_calculated),
        event_occurrences (*)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events — create a new event
router.post('/', async (req, res) => {
  try {
    const {
      person_id, event_name, event_type_id,
      event_theme, event_date, frequency, budget_per_card,
    } = req.body;

    const { data, error } = await req.supabase
      .from('events')
      .insert({
        user_id: req.user.id,
        person_id,
        event_name,
        event_type_id,
        event_theme,
        event_date: event_date || null,
        frequency: frequency || 'annually',
        budget_per_card: budget_per_card || 3.98,
      })
      .select(`
        *,
        persons (id, full_name, nickname, relationship, avatar_url),
        event_types (label, requires_date_input, fixed_month, fixed_day, is_calculated)
      `)
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id — update an event
router.put('/:id', async (req, res) => {
  try {
    const {
      event_name, event_type_id, event_theme,
      event_date, frequency, status, budget_per_card,
    } = req.body;

    const { data, error } = await req.supabase
      .from('events')
      .update({
        event_name, event_type_id, event_theme,
        event_date, frequency, status, budget_per_card,
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id — delete an event (cascades to occurrences)
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('events')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
