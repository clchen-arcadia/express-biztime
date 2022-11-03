'use strict';

const express = require('express');
const router = new express.Router();

const { BadRequestError, NotFoundError } = require("../expressError");

const db = require('../db');


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

  if(company === undefined) {
    throw new NotFoundError();
  }

  return res.json({company});
});

/** Make a POST request. Adds a company to the database */
router.post('/', async function (req, res, next) {
  const { code, name, description } = req.body;

  if(!code || !name || !description) {
    throw new BadRequestError(
    "Invalid Input: Please input code, name, and description"
  )};

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
      VALUES ($1,$2,$3)
      RETURNING code, name, description`,
      [code,name,description]
  );
  const company = result.rows[0];

  return res.status(201).json({ company });
});

module.exports = router;
