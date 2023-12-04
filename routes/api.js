const fetch = require("node-fetch");
const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

function initializeWebSocket(server) {
  server.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("message", async (data) => {
      // RECEPTION DATA
      const parsedData = JSON.parse(data);
      const { type, endingType, length } = parsedData.data;

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
        const maxTokensForChunk = Math.min(remainingTokens, 200);

        //PROMPT
        let prompt = `Je souhaite créer une histoire de genre ${type}. Je veux une ${endingType}.`;
        let apiMessage = `
        Tu es un conteur d'histoires français, avec les consignes suivantes :\n\n-
        Tu vas créer une seule et unique histoire avec une fin et qui ne dépassera pas le nombre maximum de tokens.\n-
        Tu ne commenceras pas les histoires par \"il était une fois\".\n- 
        Créer aussi un titre avant le texte de l'histoire que tu mettras entre des balises \"!\".\n-`

        if (generatedStory.length > 0) {
          prompt = `Continues la suite de l'histoire en respectant le genre ${type} et la ${endingType}: ${generatedStory}`;
          apiMessage = `
          Tu es un conteur d'histoires français, avec les consignes suivantes :\n\n-
          Tu vas créer une seule et unique histoire avec une fin et qui ne dépassera pas le nombre maximum de tokens.\n-
          Tu ne commenceras pas les histoires par \"il était une fois\".\n- `
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
          tokenGenerated += generatedTokens;

          //TITLE
          const titleRegex = /!(.*?)!/;
          const titleMatch = titleRegex.exec(generatedContent);
          const title = titleMatch ? titleMatch[1] : "No title";
          const contentWithoutTitle = generatedContent.replace(titleRegex, "");
          generatedStory = contentWithoutTitle;

          //SEND STORY TO FRONT
          const chunkData = {
            type: "storyChunk",
            data: { chunk: contentWithoutTitle },
          };

          if (title !== "No title" && title) {
            chunkData.data.title = title;
          }
          socket.send(JSON.stringify(chunkData));

          console.log(tokenGenerated);

          if (tokenGenerated >= totalTokenCount) {
            console.log("Story ended");
            socket.send(JSON.stringify({type:"Story ended"}))
            break;
          }

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
    });

    // CLIENT DISCONNECTED
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}

module.exports = { initializeWebSocket };
