var express = require('express');
var router = express.Router();
require('../models/connection');
const Stories= require('../models/stories');


//DELETE histoire selon l’ID de l’histoire 

router.delete('/:storyID', (req, res) => {

    Stories.deleteOne({ _id: req.params.storyID })
        .then(deletedDoc => {
            if (deletedDoc.deletedCount > 0) {
            // User successfully deleted
            User.find().then(data => {
              res.json({ result: true });
            });
            } else {
            res.json({ result: false, error: "Story not found" });
            }
        });
  });


//POST poster une histoire selon l’utilisateur 
router.post('/newStory', (req, res) => {

        const newStory = new Stories({
            interaction: false,
            length : String,
            title : String,
            ending : String ,
            character: null,
            startPlace: null,
            user: null,
            token: null,
            done: false,
            image: null,
            prompt: [null]
            
            // Sous document - Choix : 
            // Pour chaque choix : id et texte 
            
            // Sous document - Personnage :
            // Nom du personnage : String
            // Caractéristiques : Array de String
            // Description : String
            // Image : String
        });
  
        newStory.save().then(newDoc => {
          res.json({ result: true, token: newDoc.token });
        });

});


//PUT modifier une histoire selon l’ID de l’histoire + ID du choix (ou index) 
router.put("/", (req,res)=> {
  
    Stories.updateOne({ _id: req.body.id }, {choice: req.body.modify}).then(data => {
      res.json({data})
  
    });
  
})


//GET une histoire spécifique 
router.get("/story", (req,res)=> { 
   Stories.findOne({ _id: req.body.id })
      .then(data => {
      res.json({result: true, story: data})
  
    });
})
  



module.exports = router;