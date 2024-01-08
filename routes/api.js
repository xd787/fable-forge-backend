const fetch = require("node-fetch");
const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

function initializeWebSocket(server) {
  server.on("connection", (socket) => {
    console.log("Client API connected");

    socket.on("message", async (data) => {
      // RECEPTION DATA
      const parsedData = JSON.parse(data);
      const { type, endingType, length, selectedCharacter } = parsedData.data;

      //CALCULE LENGTH STORY
      const LENGTH_MAP = {
        Courte: { min: 800, max: 1300 },
        Moyenne: { min: 1500, max: 2000 },
        Longue: { min: 2000, max: 2500 },
      };

      const totalTokenCount =
        Math.floor(
          Math.random() * (LENGTH_MAP[length].max - LENGTH_MAP[length].min + 1)
        ) + LENGTH_MAP[length].min;

      let tokenGenerated = 0;
      let generatedStory = "";

      while (tokenGenerated < totalTokenCount) {
        let remainingTokens = totalTokenCount - tokenGenerated;
        const maxTokensForChunk = remainingTokens > 250 ? 250 : remainingTokens;

        //PROMPT
        let prompt = `Je souhaite créer une histoire de genre ${type}, avec une ${endingType}. Le personnage principal est ${selectedCharacter.firstName}, qui se distingue par les traits suivants : ${selectedCharacter.traits.join(", ")}. ${selectedCharacter.firstName} est également connu(e) pour ${selectedCharacter.description}.`;
        let apiMessage = `
        Tu es un conteur d'histoires français, avec les consignes suivantes :\n\n-
        Tu vas créer une seule et unique histoire avec une fin qui ne dépassera pas le nombre maximum de tokens.\n-
        Tu ne commenceras pas les histoires par \"il était une fois\".\n- 
        Créer aussi un titre avant le texte de l'histoire que tu mettras entre des balises \"!\".\n-`

        if (generatedStory.length > 0) {
          prompt = `Continues la suite de l'histoire en respectant le genre ${type} et la ${endingType}: ${generatedStory}`;
          apiMessage = `
          Tu es un conteur d'histoires français, avec les consignes suivantes :\n\n-
          Tu vas créer une seule et unique histoire avec une fin qui ne dépassera pas le nombre maximum de tokens.\n-
          Tu ne commenceras pas les histoires par \"il était une fois\".\n- `
        }
        if(remainingTokens < 250 ){
          prompt = `Ecris la fin de l'histoire en respectant le genre ${type} et la ${endingType}: ${generatedStory}`;
        }

        //MESSAGE TO API
        const messageAPI = {
          model: "gpt-3.5-turbo-16k",
          messages: [
            {
              role: "system",
              content: apiMessage,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 1,
          max_tokens: maxTokensForChunk,
          top_p: 1,
          frequency_penalty: 1,
          presence_penalty: 1,
        };

        //APPEL TO API
        try {
          console.log("send to api");
          const response = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(messageAPI),
          });

          const responseData = await response.json();

          // NO REPONSE DE L'API
          if (
            !response.ok ||
            !responseData.choices ||
            !responseData.choices[0]
          ) {
            socket.send(
              JSON.stringify({
                type: "storyChunk",
                data: {
                  result: "Erreur lors de la génération de l'histoire",
                },
              })
            );
            return;
          }

          // REPONSE API POSITIVE
          const generatedContent =
            responseData.choices[0].message.content.trim();
          const generatedTokens = generatedContent.split(" ").length;
          
          //TITLE
          const titleRegex = /!(.*?)!/;
          const titleMatch = titleRegex.exec(generatedContent);
          const contentWithoutTitle = generatedContent.replace(titleRegex, "");
          generatedStory = contentWithoutTitle;

          //SEND STORY TO FRONT
          let chunkData = {};

          if (tokenGenerated === 0) {
            chunkData = {
              type: "storyChunk",
              data: { chunk: contentWithoutTitle, title: titleMatch[1]},
            };
          }else {
            chunkData = {
              type: "storyChunk",
              data: {chunk: contentWithoutTitle},
            };
          }
          console.log("tokenGenerated", tokenGenerated, "total", totalTokenCount)

          tokenGenerated += generatedTokens;
          socket.send(JSON.stringify(chunkData));

    
          // ERROR DE GENERATION
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: "storyChunk",
              data: { error: "Error generating story", details: error.message },
            })
          );
        }
      }
      console.log("end of the story")
      socket.send(JSON.stringify({type: "storyEnd",
      data: {end:"the end"}}));
    });

    // CLIENT DISCONNECTED
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}

module.exports = { initializeWebSocket };
