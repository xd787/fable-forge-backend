// Import mongoose module inside the code
const mongoose = require("mongoose");

// stockage de la variable d'environnement sous ce format pour des questions de sécurité
const connectionString = process.env.CONNECTION_STRING;

// connexion à la BDD si la connexion s'établit sous 2 secondes, sinon, renvoyer une erreur
// Console.log() pour afficher dans le terminal si la connexion est établie ou pas
mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log("Database connected"))
  .catch(error => console.error(error));
