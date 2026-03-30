import { Router } from 'express';

const router = Router();

// GET /api/payment-methods — list user's payment methods
router.get('/', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment-methods — save a new payment method reference
router.post('/', async (req, res) => {
  try {
    const { stripe_payment_method_id, card_brand, last_four, is_default } = req.body;

    // If setting as default, unset others first
    if (is_default) {
      await req.supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', req.user.id);
    }

    const { data, error } = await req.supabase
      .from('payment_methods')
      .insert({
        user_id: req.user.id,
        stripe_payment_method_id,
        card_brand,
        last_four,
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

// DELETE /api/payment-methods/:id — remove a payment method
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('payment_methods')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
