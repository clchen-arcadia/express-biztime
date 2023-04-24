'use strict';

const express = require('express');
const router = new express.Router();

const { BadRequestError, NotFoundError } = require("../expressError");

const db = require('../db');

/** Make GET request
 * Returns list of invoices. from the database as an array of objects
 */
router.get('/', async function (req, res, next) {

  const result = await db.query(
    `SELECT id, comp_code
      FROM invoices`);

  const invoices = result.rows;

  return res.json({ invoices });
});

/** Make GET request to specific invoice by id
 * Returns full information on invoice in format:
 * {invoice: {..., company: {...}}}
 */
router.get('/:id', async function (req, res, next) {

  const result = await db.query(
    `SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date,
            c.code, c.name, c.description
      FROM invoices AS i
      JOIN companies AS c ON i.comp_code = c.code
      WHERE i.id = $1`, [req.params.id]);

  const compositeResult = result.rows[0];

  if(compositeResult === undefined) throw new NotFoundError();

  const {id, amt, paid, add_date, paid_date,
    code, name, description} = compositeResult;
  // TODO: Another/better way to do this? can write two queries

  const company = {code, name, description};
  const invoice = {id, amt, paid, add_date, paid_date, company};

  return res.json({ invoice });
});

/** Route to POST new invoice,
 *  Request must have body JSON with keys comp_code (refers to companies table), amt
 *  Returns information about created invoice {invoice: {...}}
 */
router.post('/', async function (req, res, next) {

  const {comp_code, amt} = req.body;

  if(!comp_code || !amt) {
    throw new BadRequestError(
    "Invalid Input: Please input comp_code and amt"
  )};

  try {
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [comp_code, amt]
    );
  }
  catch (IntegrityError) {
    console.log(IntegrityError.message);
    throw new BadRequestError('Company code does not exist in the database'); //TODO: Error message
  }
  const invoice = result.rows[0];

  return res.status(201).json({ invoice });

});

/** Route to PUT request at invoice id
 * Updates an invoice. If invoice cannot be found, return 404
 * Input: JSON {amt}
 * Returns : {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

router.put('/:id', async function(req,res,next){
  const {amt} = req.body;
  const id = req.params.id;

  if(amt === undefined) {
    throw new BadRequestError("Invalid Input: Enter invoice amount");
  }

  const result = await db.query(
    `UPDATE invoices
        SET amt = $1
        WHERE id = $2
        RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]);

  const invoice = result.rows[0];

  if(invoice === undefined) {
    throw new NotFoundError();
  }

  return res.json({invoice});

});

/** Route to DELETE request at invoice id
 * Deletes an invoice. If invoice cannot be found with the id, return 404
 * Returns: JSON {status: "deleted"}
 */

router.delete('/:id', async function(req,res,next){
  const id = req.params.id;

  const result = await db.query(
    `DELETE FROM invoices
      WHERE id = $1
      RETURNING id, comp_code`, [id]
  );
//Can give result.rows a name
  if(result.rows.length === 0) throw new NotFoundError();

  return res.json({status:"deleted"});
});


module.exports = router;
