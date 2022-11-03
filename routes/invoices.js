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



module.exports = router;
