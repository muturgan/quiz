let { Router } = require('express');
let { pool } = require('../db');
let PromoService = require('../services/promo');
let { InsuranceOffer } = require('../models/InsuranceOffer');

let router = new Router();

router.get('/price/:type', async (req, res) => {
   try {
      let userId = res.locals.userId;
      let insuranceType = req.params.type;

      let conn = await pool.getConnection();
      let price = await conn.query(
         `SELECT * FROM insurance WHERE type = '${insuranceType}'`
      );
      let count = await conn.query(`
         SELECT COUNT(*) AS count FROM agreements
         WHERE userId = ${userId} AND status = 1
      `);

      price = price[0].price;
      count = count[0].count;
      // за каждую завершенную сделку
      // клиент получает скидку в 1 процент
      price = price * (100 - count) / 100;

      let insuranceOffer = new InsuranceOffer();
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
   let promo = await PromoService.getPromo();
   if (promo) {
      offer.price = offer.price * promo.discount;
      offer.promo = true;
   }
}

module.exports = router;
