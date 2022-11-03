'use strict';

const express = require('express');
const router = new express.Router();

const db = require('../db');

const { BadRequestError, NotFoundError } = require("../expressError");


router.get('/', function (req, res) {

  

  return res.json({ companies });
});
