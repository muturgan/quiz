const { Router } = require('express');
const { pool } = require('../db');
const { InsuranceOffer } = require('../models/InsuranceOffer');

const insuranceRouter = new Router();


const calculatePrice = function(res, basePrice, completedAgreementsCount) {
   const discount = (100 - completedAgreementsCount) / 100;
   res.locals.discount = discount;
   const price = basePrice * discount;
   return price;
};


insuranceRouter.get('/price/:type', async (req, res) => {
   try {
      const userId = res.locals.userId;
      const insuranceType = req.params.type;

      const conn = await pool.getConnection();
      const insuranceRows = await conn.query(
         `SELECT * FROM insurance WHERE type = '${insuranceType}'`
      );
      const agreementsRows = await conn.query(`
         SELECT COUNT(*) AS count FROM agreements
         WHERE userId = ${userId} AND status = 1
      `);
      conn.release();

      const basePrice = insuranceRows[0].price;
      const completedAgreementsCount = agreementsRows[0].count;
      const price = calculatePrice(res, basePrice, completedAgreementsCount);

      const insuranceOffer = new InsuranceOffer();
      insuranceOffer.type = insuranceType;
      insuranceOffer.price = price;

      res.status(200).send(insuranceOffer);
   }
   catch (err) {
      console.error(err);
      res.status(500).send(err);
   }
});

module.exports = usersRouter;