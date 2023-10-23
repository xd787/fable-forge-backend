var express = require('express');
var router = express.Router();
require('../models/connection');
const Stories= require('../models/story');
const User = require('../models/user')
const uid2 = require("uid2");


//DELETE histoire selon l’ID de l’histoire 

router.delete('/:storyID', (req, res) => {
    Stories.deleteOne({ _id: req.params.storyID })
        .then(deletedDoc => {
            if (deletedDoc.deletedCount > 0) {
            // User successfully deleted
            Stories.find().then(data => {
              res.json({ result: true });
            });
            } else {
            res.json({ result: false, error: "Story not found" });
            }
        });
});


//POST poster une histoire selon l’utilisateur 
router.post('/new/:token', (req, res) => {
  User.findOne({ token: req.params.token }).then(data => {
    if (data) {
        const newStory = new Stories({
            interactivity: false,
            length : req.body.length,
            title : req.body.title,
            endingType : req.body.ending,
            character:{
              characterName: null,
              characterPersonality: [],
              characterDescription: null,
              characterImage: null
            },
            departureLocation: req.body.startPlace,
            user: data._id,
            completed: false,
            image: null,
            choicePrompt: [{choiceText: null}]
       });

        newStory.save().then(newDoc => {
          res.json({ result: true, token: newDoc.token });
        });

      }
  })
});

//PUT modifier une histoire selon l’ID de l’histoire + ID du choix (ou index) 
router.put("/", (req,res)=> {
    Stories.updateOne({ token: req.body.token }, {prompt: req.body.modify}).then(data => {
      res.json({data})
    });
})


//GET une histoire spécifique 
router.get("/story", (req,res)=> { 
   Stories.findOne({ token: req.body.token })
      .then(data => {
      res.json({result: true, story: data})
  
    });
})
  



module.exports = router;