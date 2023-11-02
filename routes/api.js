// file that calls the API from the backend
// Not used for the moment, to be kept for future development of the mobile application.

const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const API_KEY = process.env.API_KEY;
const MAX_TOKENS = {
  "1": { min: 600, max: 800 },
  "2": { min: 800, max: 1500 },
  "3": { min: 1500, max: 4000 },
};

// POST: Generate a story with all settings (typend, style, length)
router.post("/generate-story", async (req, res) => {
  const { genre, fin, longueur, messages } = req.body;

  // Vérifiez si la longueur est valide, sinon définissez-la sur 1
  const lengthKey = ["1", "2", "3"].includes(longueur) ? longueur : "1";

  // Générez un nombre aléatoire de tokens en fonction de la longueur choisie
  const { min, max } = MAX_TOKENS[lengthKey];
  const maxTokens = Math.floor(Math.random() * (max - min + 1) + min);

  const conversation = messages || [
    { role: "system", content: "You are the best storyteller there is." },
    {
      role: "user",
      content: `Je souhaite créer une histoire de genre ${genre} d'environ ${longueur} pages, soit environ 300 tokens par page A4. Assurez-vous que l'histoire a une fin ${fin} en accord avec le genre. M'inspirer pour le personnage principal, le lieu de départ et l'époque. Créer aussi un titre avant le texte de l'histoire.`,
    },
  ];

  try {
    let totalGenerated = "";

    // Utilisez une boucle pour obtenir plusieurs segments de texte jusqu'à ce que vous atteigniez maxTokens
    while (totalGenerated.split(" ").length < maxTokens) {
      const storyResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-16k",
          messages: conversation,
          max_tokens: Math.min(20, maxTokens - totalGenerated.split(" ").length), // Demandez uniquement les tokens nécessaires
          temperature: 1,
        }),
      });

      if (!storyResponse.ok) {
        throw new Error("Error generating the story");
      }

      const storyData = await storyResponse.json();
      const storyPart = storyData.choices[0].message.content;
      totalGenerated += storyPart;

      // Ajoutez le contenu généré à l'historique de la conversation pour la prochaine requête
      conversation.push({ role: "user", content: storyPart });
    }

    // Traitement pour séparer le titre et l'histoire
    const newLineIndex = totalGenerated.indexOf("\n");
    if (newLineIndex !== -1) {
      const title = totalGenerated.slice(0, newLineIndex).trim();
      const storyWithoutTitle = totalGenerated.slice(newLineIndex).trim();
      res.json({ title, storyWithoutTitle });
    } else {
      res.json({ title: "Title not found", storyWithoutTitle: totalGenerated });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error generating the story: ${error.message}` });
  }
});

module.exports = router;
