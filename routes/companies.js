'use strict';

const express = require('express');
const router = new express.Router();

const db = require('../db');

const { BadRequestError, NotFoundError } = require("../expressError");


router.get('/', async function (req, res, next) {

  const results = await db.query(
    `SELECT code, name
      FROM companies`);

  const companies = results.rows;

  return res.json({ companies });
});
