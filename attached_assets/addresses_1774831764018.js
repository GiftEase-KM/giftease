import { Router } from 'express';

const router = Router();

// POST /api/persons/:personId/addresses — add address to a person
router.post('/:personId/addresses', async (req, res) => {
  try {
    const { address_type, address_line1, address_line2, city, state, zip_code, country, is_default } = req.body;

    // If this is being set as default, unset other defaults first
    if (is_default) {
      await req.supabase
        .from('person_addresses')
        .update({ is_default: false })
        .eq('person_id', req.params.personId);
    }

    const { data, error } = await req.supabase
      .from('person_addresses')
      .insert({
        person_id: req.params.personId,
        address_type,
        address_line1,
        address_line2,
        city,
        state,
        zip_code,
        country: country || 'US',
        is_default: is_default || false,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/persons/:personId/addresses/:id — update an address
router.put('/:personId/addresses/:id', async (req, res) => {
  try {
    const { address_type, address_line1, address_line2, city, state, zip_code, country, is_default } = req.body;

    if (is_default) {
      await req.supabase
        .from('person_addresses')
        .update({ is_default: false })
        .eq('person_id', req.params.personId);
    }

    const { data, error } = await req.supabase
      .from('person_addresses')
      .update({ address_type, address_line1, address_line2, city, state, zip_code, country, is_default })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/persons/:personId/addresses/:id — remove an address
router.delete('/:personId/addresses/:id', async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('person_addresses')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
