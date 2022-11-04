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
      JOIN companies AS c on i.comp_code = c.code
      WHERE i.id = $1`, [req.params.id]);

  const compositeResult = result.rows[0];

  if(compositeResult === undefined) throw new NotFoundError();

  const {id, amt, paid, add_date, paid_date,
    code, name, description} = compositeResult;
  // TODO: Another/better way to do this?

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
    throw new BadRequestError('Company code does not exist in the database');
  }
  const invoice = result.rows[0];

  return res.status(201).json({ invoice });

});

module.exports = router;
