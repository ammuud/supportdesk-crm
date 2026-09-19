// routes/tickets.js
// The 4 endpoints the assignment asks for, nothing more:
//   POST   /api/tickets
//   GET    /api/tickets
//   GET    /api/tickets/:ticket_id
//   PUT    /api/tickets/:ticket_id

const express = require('express');
const router = express.Router();
const db = require('../db');

// Figures out the next ticket id, e.g. the highest existing TKT-004 -> TKT-005.
async function nextTicketId() {
  const { data, error } = await db
    .from('tickets')
    .select('ticket_id')
    .order('id', { ascending: false })
    .limit(1);
    
  let n = 1;
  if (!error && data && data.length > 0 && data[0].ticket_id) {
    const match = data[0].ticket_id.match(/(\d+)$/);
    if (match) n = parseInt(match[1], 10) + 1;
  }
  return 'TKT-' + String(n).padStart(3, '0');
}

/**
 * POST /api/tickets
 * Body:  { customer_name, customer_email, subject, description }
 * Returns: { ticket_id, created_at }
 */
router.post('/', async (req, res) => {
  const { customer_name, customer_email, subject, description } = req.body || {};

  if (!customer_name || !customer_email || !subject || !description) {
    return res.status(400).json({
      error: 'customer_name, customer_email, subject and description are all required.'
    });
  }

  const ticket_id = await nextTicketId();
  const now = new Date().toISOString();

  const { error } = await db
    .from('tickets')
    .insert([{
      ticket_id, 
      customer_name, 
      customer_email, 
      subject, 
      description, 
      status: 'Open', 
      created_at: now, 
      updated_at: now
    }]);

  if (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  res.status(201).json({ ticket_id, created_at: now });
});

/**
 * GET /api/tickets?status=Open&search=aisha
 * Returns: [{ ticket_id, customer_name, subject, status, created_at }]
 * (customer_email and description are also included so the frontend's
 * search bar can match on them without an extra round trip per keystroke.)
 */
router.get('/', async (req, res) => {
  const { status, search } = req.query;

  let query = db
    .from('tickets')
    .select('ticket_id, customer_name, customer_email, subject, description, status, created_at')
    .order('created_at', { ascending: false });

  if (status && status !== 'All') {
    query = query.eq('status', status);
  }
  if (search) {
    // Supabase ilike allows case-insensitive search
    const q = `%${search}%`;
    query = query.or(`customer_name.ilike.${q},customer_email.ilike.${q},ticket_id.ilike.${q},subject.ilike.${q},description.ilike.${q}`);
  }

  const { data: tickets, error } = await query;
  
  if (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  res.json(tickets || []);
});

/**
 * GET /api/tickets/:ticket_id
 * Returns: { ticket_id, customer_name, customer_email, subject, description, status, notes }
 */
router.get('/:ticket_id', async (req, res) => {
  const { data: ticket, error: ticketError } = await db
    .from('tickets')
    .select('*')
    .eq('ticket_id', req.params.ticket_id)
    .single();
    
  if (ticketError || !ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }
  
  const { data: notes, error: notesError } = await db
    .from('notes')
    .select('note_text, created_at')
    .eq('ticket_id', req.params.ticket_id)
    .order('created_at', { ascending: true });

  if (notesError) {
    console.error('Error fetching notes:', notesError);
  }

  res.json({ ...ticket, notes: notes || [] });
});

/**
 * PUT /api/tickets/:ticket_id
 * Body: { status, notes }  (both optional — send whichever changed)
 * Returns: { success: true, updated_at }
 */
router.put('/:ticket_id', async (req, res) => {
  const { data: ticket, error: ticketError } = await db
    .from('tickets')
    .select('*')
    .eq('ticket_id', req.params.ticket_id)
    .single();
    
  if (ticketError || !ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  const { status, notes } = req.body || {};
  const now = new Date().toISOString();
  const VALID_STATUSES = ['Open', 'In Progress', 'Closed'];

  const updates = { updated_at: now };

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    updates.status = status;
  }
  
  const { error: updateError } = await db
    .from('tickets')
    .update(updates)
    .eq('ticket_id', req.params.ticket_id);
    
  if (updateError) {
    console.error('Error updating ticket:', updateError);
    return res.status(500).json({ error: 'Internal server error' });
  }

  if (notes && String(notes).trim()) {
    const { error: insertNoteError } = await db
      .from('notes')
      .insert([{
        ticket_id: req.params.ticket_id, 
        note_text: String(notes).trim(), 
        created_at: now
      }]);
      
    if (insertNoteError) {
      console.error('Error inserting note:', insertNoteError);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.json({ success: true, updated_at: now });
});

module.exports = router;
