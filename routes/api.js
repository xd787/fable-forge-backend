const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

// Etape 1: Définir les ensembles valides
const VALID_GENRES = ["Horreur", "Romance", "Aventure"];
const VALID_ENDINGS = ["Heureuse", "Tragique"];
const VALID_LENGTHS = ["1", "2", "3"];

// Backend endpoint for generating the story
router.post("/generate-story", async (req, res) => {
  const { genre, fin, longueur } = req.body;

    // Etape 2: Vérifiez si les données reçues appartiennent à ces ensembles valides
    if (!VALID_GENRES.includes(genre)) {
      return res.status(400).json({ error: "Invalid genre provided" });
    }
  
    if (!VALID_ENDINGS.includes(fin)) {
      return res.status(400).json({ error: "Invalid ending provided" });
    }
  
    if (!VALID_LENGTHS.includes(longueur)) {
      return res.status(400).json({ error: "Invalid length provided" });
    }

  console.log('Received request with body:', req.body); // 1. Log de la demande entrante

  let maxTokens;
  if (longueur === "1") {
    maxTokens = Math.floor(Math.random() * (800 - 600 + 1) + 600);
  } else if (longueur === "2") {
    maxTokens = Math.floor(Math.random() * (1500 - 800 + 1) + 800);
  } else if (longueur === "3") {
    maxTokens = Math.floor(Math.random() * (4000 - 1500 + 1) + 1500);
  } else {
    // Tokens par défaut si aucune sélection valide
    maxTokens = 1000;
  }

  try {
    // Demande envoyée à l'API
    const userMessage = `Je souhaite créer une histoire de genre ${genre} d'environ ${longueur} pages, soit environ 300 tokens par page A4. Assurez-vous que l'histoire a une fin ${fin} en accord avec le genre. M'inspirer pour le personnage principal, le lieu de départ et l'époque. Créer aussi un titre avant le texte de l'histoire.`;

    // Requête vers l'API
    const requestBody = {
      model: "gpt-3.5-turbo-16k",
      messages: [
        { role: "system", content: "You are the best storyteller there is." },
        { role: "user", content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature: 1,
    };

    console.log('Sending request to OpenAI with body:', JSON.stringify(requestBody, null, 2)); // 2. Log avant l'appel à l'API

    const storyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Received response from OpenAI with status:', storyResponse.status); // 2. Log après l'appel à l'API

    if (!storyResponse.ok) {
      console.error('Error from OpenAI API with status:', storyResponse.status);
      console.error('Error message from OpenAI API:', await storyResponse.text()); // 3. Logs en cas d'erreur
      throw new Error("Error generating the story");
    }

    const storyData = await storyResponse.json();
    const storyMessage = storyData.choices[0].message.content;

    // Recherche \n pour séparer le texte
    const newLineIndex = storyMessage.indexOf("\n");

    if (newLineIndex !== -1) {
      const title = storyMessage.slice(0, newLineIndex).trim();
      const storyWithoutTitle = storyMessage.slice(newLineIndex).trim();

      console.log('Parsed story title and content:', title, storyWithoutTitle); // 4. Logs après traitement

      res.json({ title, storyWithoutTitle }); // Envoyer le titre et le l'histoire séparé
    } else {
  
      res.json({ title: "Title not found", storyMessage });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error generating the story: ${error.message}` });
  }
});

module.exports = router;
