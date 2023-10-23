var express = require('express');
var router = express.Router();
require('../models/connection');
const Genre= require('../models/genre');
const abonnement= require('../models/abonnement');
const Abonnement = require('../models/abonnement');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


//GET genre: renvoie tous les genres
router.get("/genre", (req,res)=> { 
  Genre.find()
    .then(data => {
    res.json({result: true, genre: data})

  });
})


//GET abonnement: renvoie tous les abonnements
router.get("/abonnement", (req,res)=> { 
  Abonnement.find()
    .then(data => {
    res.json({result: true, abonnement: data})

  });
})

module.exports = router;
