var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


//GET genre: renvoie tous les genres

//GET abonnement: renvoie tous les abonnements


module.exports = router;
