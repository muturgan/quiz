var { Router } = require('express');
var { pool } = require('../db');
var redisClient = require('../redis');
var { InsuranceOffer } = require('../models/InsuranceOffer');

var router = new Router();


router.get('/price/:type', async (req, res) => {
   try {
      var userId = res.locals.userId;
      var insuranceType = req.params.type;

      var conn = await pool.getConnection();
      var price = await conn.query(
         `SELECT * FROM insurance WHERE type = '${insuranceType}'`
      );
      var count = await conn.query(`
         SELECT COUNT(*) AS count FROM agreements
         WHERE userId = ${userId} AND status = 1
      `);

      price = price[0].price;
      count = count[0].count;
      // for each successfully completed agreement
      // the client receives a 1 percent discount
      price = price * (100 - count) / 100;

      var insuranceOffer = new InsuranceOffer();
      insuranceOffer.type = insuranceType;
      insuranceOffer.price = price;

      await applyPromo(insuranceOffer);

      res.status(200).send(insuranceOffer);
   }
   catch (err) {
      console.error(err);
      res.status(500).send(err);
   }
});

async function applyPromo(offer) {
   var promo = await redisClient.getPromo();
   if (promo) {
      offer.price = offer.price * promo.discount;
      offer.promo = true;
   }
}

module.exports = router;