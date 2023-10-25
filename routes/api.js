const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

// Backend endpoint pour générer l'histoire
router.post("/generate-story", async (req, res) => {
  const { genre, fin, longueur } = req.body;

  let maxTokens;
  if (longueur === "1") {
    maxTokens = Math.floor(Math.random() * (800 - 600 + 1) + 600);
  } else if (longueur === "2") {
    maxTokens = Math.floor(Math.random() * (1500 - 800 + 1) + 800);
  } else if (longueur === "3") {
    maxTokens = Math.floor(Math.random() * (4000 - 1500 + 1) + 1500);
  } else {
    // Valeur par défaut si la sélection n'est pas valide
    maxTokens = 1000;
  }

  try {
    // Construisez le message utilisateur à partir des données reçues
    const userMessage = `Je souhaite créer une histoire de genre ${genre} d'environ ${longueur} pages, soit environ 300 tokens par page A4. Assurez-vous que l'histoire a une fin ${fin} en accord avec le genre. M'inspirer pour le personnage principal, le lieu de départ et l'époque. Créer aussi un titre avant le texte de l'histoire. `;

    // Utilisez ces informations pour créer la requête à l'API OpenAI
    const requestBody = {
      model: "gpt-3.5-turbo-16k",
      messages: [
        { role: "system", content: "You are the best storyteller there is." },
        { role: "user", content: userMessage},
      ],
      max_tokens: maxTokens, // Define maxTokens based on longueur
      temperature: 1,
    };

    const storyResponse = await fetch(
      `https://api.openai.com/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!storyResponse.ok) {
      throw new Error("Erreur lors de la génération de l'histoire");
    }




    const storyData = await storyResponse.json();
    const storyMessage = storyData.choices[0].message.content;
    
    // Extract the title from the story text
    const titleMatch = storyMessage.match(/Titre\s*:\s*"(.*?)"/);
    
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1];
      // Remove the title from the story content
      const storyWithoutTitle = storyMessage.replace(titleMatch[0], '').trim();
      res.json({ title, storyWithoutTitle });
    } else {
      console.log('Title not found');
    }

  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la génération de l'histoire" });
  }
});

module.exports = router;
