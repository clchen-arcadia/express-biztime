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
 *  {company: {code : apple, name : APPLE , description : "This is apple", 
 *    invoices : {id, comp_code, amt, paid, add_date, paid_date}}}
 */

router.get('/:code', async function (req, res, next) {

  const company_code = req.params.code;

  const result = await db.query(
    `SELECT c.code, c.name, c.description,
            i.id, i.amt, i.paid, i.add_date, i.paid_date
      FROM companies AS c
      JOIN invoices AS i ON c.code = i.comp_code
      WHERE code = $1`, [company_code]);

  const compositeResult = result.rows[0];

  if(compositeResult === undefined) {
    throw new NotFoundError();
  }

  const {code, name, description} = compositeResult;
  
  const company = {code, name, description};

  //When we get the joined table, map through rows and construct objects and append 
  //to company.invoices
  // company.invoices = result.rows.map(r => { 
  //   return {
  //   "id":r.id, 'amt':r.amt, "paid": r.paid, "add_date": r.add_date, "paid_date":r.paid_date
  //   };
  // });
  
  company.invoices = result.rows.map(r => r.id);

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
