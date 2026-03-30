import { Router } from 'express';

const router = Router();

// GET /api/persons — list all persons for current user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('persons')
      .select(`
        *,
        person_addresses (*),
        events (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/persons/favorites — just favorites for dashboard
router.get('/favorites', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('persons')
      .select('id, full_name, nickname, relationship, avatar_url')
      .eq('is_favorite', true)
      .order('full_name');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/persons/:id — single person with addresses and events
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('persons')
      .select(`
        *,
        person_addresses (*),
        events (
          *,
          event_occurrences (*)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/persons — create a new person
router.post('/', async (req, res) => {
  try {
    const { full_name, nickname, relationship, avatar_url, is_favorite, notes, addresses } = req.body;

    // Insert person
    const { data: person, error: personError } = await req.supabase
      .from('persons')
      .insert({
        user_id: req.user.id,
        full_name,
        nickname,
        relationship,
        avatar_url,
        is_favorite: is_favorite || false,
        notes,
      })
      .select()
      .single();

    if (personError) throw personError;

    // Insert addresses if provided
    if (addresses && addresses.length > 0) {
      const addressRows = addresses.map((addr) => ({
        person_id: person.id,
        ...addr,
      }));

      const { error: addrError } = await req.supabase
        .from('person_addresses')
        .insert(addressRows);

      if (addrError) throw addrError;
    }

    // Return person with addresses
    const { data: fullPerson, error: fetchError } = await req.supabase
      .from('persons')
      .select('*, person_addresses(*)')
      .eq('id', person.id)
      .single();

    if (fetchError) throw fetchError;
    res.status(201).json(fullPerson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/persons/:id — update a person
router.put('/:id', async (req, res) => {
  try {
    const { full_name, nickname, relationship, avatar_url, is_favorite, notes } = req.body;

    const { data, error } = await req.supabase
      .from('persons')
      .update({ full_name, nickname, relationship, avatar_url, is_favorite, notes })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/persons/:id — delete a person (cascades to addresses + events)
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('persons')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
