const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

// Backend endpoint pour générer l'histoire
router.post('/generate-story', async (req, res) => {
  const { genre, longueur, fin, epoque } = req.body;

  let maxTokens;
  if (longueur === 'Courte') {
    maxTokens = Math.floor(Math.random() * (800 - 600 + 1) + 600);
  } else if (longueur === 'Moyenne') {
    maxTokens = Math.floor(Math.random() * (1500 - 800 + 1) + 800);
  } else if (longueur === 'Longue') {
    maxTokens = Math.floor(Math.random() * (4000 - 1500 + 1) + 1500);
  } else {
    // Valeur par défaut si la sélection n'est pas valide
    maxTokens = 1000;
  }

  // Construisez le message utilisateur à partir des données reçues
  const userMessage = `Je souhaite créer une histoire de genre ${genre} d'environ ${longueur} pages. Je préfère une fin ${fin}. M'inspirer pour le personnage principal et le lieu de départ. L'époque de l'histoire sera ${epoque}. Créer aussi un titre avant le texte de l'histoire`;

  // Utilisez ces informations pour créer la requête à l'API OpenAI
  const requestBody = {
    model: 'gpt-3.5-turbo-16k',
    messages: [
      {
        role: 'system',
        content: 'You are the best storyteller there is.'
      },
      {
        role: 'user',
        content: userMessage
      }
    ],
    max_tokens: maxTokens,
    temperature: 1
  };

  try {
    // Effectuez la requête à l'API OpenAI en utilisant les informations stockées sur le serveur
    const storyResponse = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!storyResponse.ok) {
      throw new Error('Erreur lors de la génération de l\'histoire');
    }

    const storyData = await storyResponse.json();
    const story = storyData.choices[0].message.content;

    // Renvoyez l'histoire générée au frontend
    res.json({ story: story.trim() });

  } catch (error) {
    console.error("Détails de l'erreur:", error);
    res.status(500).json({ error: 'Erreur lors de l’appel à l’API : ' + error.message });
  }
});

module.exports = router;

API_KEY = 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
API_URL = https://api.openai.com/v1/chat/completions