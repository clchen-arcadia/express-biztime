'use strict';

const express = require('express');
const router = new express.Router();

const { BadRequestError, NotFoundError } = require("../expressError");

const db = require('../db');

/** Make a GET request
 * Returns list of companies
 * Returns JSON object
 *  {company: [{code : apple, name : APPLE , description : "This is apple"},
 *            {code : ibm, name : IBM , description : "This is IBM"}]}
 */

router.get('/', async function (req, res, next) {

  const result = await db.query(
    `SELECT code, name
      FROM companies`);

  const companies = result.rows;

  return res.json({ companies });
});


/** Make a GET request.
 * Pass in code of company in URL
 * Returns JSON object
 *  {company: {code : apple, name : APPLE , description : "This is apple"}}
 */

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

/** Make a POST request. Adds a company to the database
 * Input: JSON {code: apple, name: apple, description: This is apple}
 * Returns JSON obj:
 *  {company: {code : apple, name : APPLE , description : "This is apple"}}
*/

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


/** Make a PUT request. Edit existing company
 * Input: JSON {code : apple, name: APPLE, description: "This is apple"}
 * Returns
 *  {company : {code : apple, name : APPLE , description : "This is apple"}}
*/

router.put("/:code", async function(req,res,next){
  //debugger;
  if (req.body === undefined) throw new BadRequestError(); //TODO: specific error

  const { name, description } = req.body;
  const code = req.params.code;

  if(!name || !description) {
    throw new BadRequestError(
    "Invalid Input: Please input name and description"
  )};

  const result = await db.query(
      `UPDATE companies
        SET name = $1,
            description = $2
        WHERE code = $3
        RETURNING code, name, description`, [name, description, code]);

  const company = result.rows[0];

  if(company === undefined) {
    throw new NotFoundError();
  }

  return res.json({company});
})

/** Makes DELETE request. Deletes company and returns JSON {status:"deleted"}
 * If company does not exist, returns 404 error
*/

router.delete("/:code", async function(req, res, next){
  debugger;
  const result = await db.query(
    `DELETE FROM companies
      WHERE code = $1
      RETURNING code, name, description`, [req.params.code]
  );

  if(result.rows.length === 0) throw new NotFoundError();

  return res.json({status:"deleted"});
});



module.exports = router;
