'use strict';

const express = require('express');
const router = new express.Router();

const db = require('../db');

const { BadRequestError, NotFoundError } = require("../expressError");

router.get('/', async function (req, res, next) {

  const result = await db.query(
    `SELECT code, name
      FROM companies`);

  const companies = result.rows;

  return res.json({ companies });
});

router.get('/:code', async function (req, res, next) {

  const code = req.params.code;

  const result = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]);

  const company = result.rows[0];
  debugger;
  res.json({company});
});


module.exports = router;
