"use strict";

const request = require("supertest");

const app = require("../app");
let db = require("../db");

// INSERT INTO companies
// VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
//        ('ibm', 'IBM', 'Big blue.');

// INSERT INTO invoices (comp_code, amt, paid, paid_date)
// VALUES ('apple', 100, FALSE, NULL),
//        ('apple', 200, FALSE, NULL),
//        ('apple', 300, TRUE, '2018-01-01'),
//        ('ibm', 400, FALSE, NULL);


beforeEach(function() {
  db.query(`INSERT INTO companies
        VALUES ('app', 'Apple Computer', 'Maker of OSX.'),
        ('ib', 'IBM', 'Big blue.');`);
});

afterEach(function() {
  db.query(`DELETE TABLE IF EXISTS companies;
            CREATE TABLE companies (
            code TEXT PRIMARY KEY,
            name  TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL);`
            );

});
debugger;
/** Testing GET route */
describe("GET /companies", function(){
    debugger;
    it("Gets list of companies", async function() {
        const resp = await request(app).get(`/companies`);

        expect(resp.json.length).toEqual(2);
    })
})
