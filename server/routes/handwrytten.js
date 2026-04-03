import { Router } from 'express';
const router = Router();

const HW_BASE = 'https://api.handwrytten.com/v2';
const HW_KEY = process.env.HANDWRYTTEN_API_KEY;

async function hwFetch(path, options = {}) {
  const url = `${HW_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': HW_KEY,
      ...options.headers,
    },
  });
  return res.json();
}

// GET /api/handwrytten/categories
router.get('/categories', async (req, res) => {
  try {
    const data = await hwFetch('/categories/list');
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/handwrytten/cards?category_id=X&page=0
router.get('/cards', async (req, res) => {
  try {
    const { category_id, page = 0 } = req.query;
    let path = `/cards/list?with_images=true&page=${page}`;
    if (category_id) path += `&category_id=${category_id}`;
    const data = await hwFetch(path);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/handwrytten/cards/:id
router.get('/cards/:id', async (req, res) => {
  try {
    const data = await hwFetch(`/cards/view?card_id=${req.params.id}`);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/handwrytten/fonts
router.get('/fonts', async (req, res) => {
  try {
    const data = await hwFetch('/fonts/list');
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/handwrytten/order — place a single-step order
router.post('/order', async (req, res) => {
  try {
    const data = await hwFetch('/orders/singleStepOrder', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/handwrytten/order/:id — check order status
router.get('/order/:id', async (req, res) => {
  try {
    const data = await hwFetch(`/orders/details?order_id=${req.params.id}`);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
