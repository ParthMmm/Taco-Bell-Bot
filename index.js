"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { WebhookClient } = require("dialogflow-fulfillment");

// process.env.DEBUG = "dialogflow:*"; // enables lib debugging statements
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  (request, response) => {
    const agent = new WebhookClient({ request, response });

    function getCalories(agent) {
      var foodEntry = "";
      if (agent.parameters.foodItem) {
        foodEntry = agent.parameters.foodItem;
      }
      if (agent.parameters.drinkItem) {
        foodEntry = agent.parameters.drinkItem;
      }
      const dialogflowAgentDoc = db
        .collection("Taco Bell")
        .doc(foodEntry.toLowerCase());

      return dialogflowAgentDoc
        .get()
        .then((doc) => {
          if (!doc.exists) {
            agent.add("Sorry, I couldn't find that.");
          } else {
            var x = doc.data().calories;
            agent.add(`A ${foodEntry} has ${x} calories.`);
          }
          return Promise.resolve("Read complete");
        })
        .catch(() => {
          agent.add("Error reading entry from the Firestore database.");
        });
    }

    function getIngredients(agent) {
      if (!agent.parameters.foodItem && agent.parameters.drinkItem) {
        agent.add("Sorry, soda ingredients are too complex.");
        return;
      }
      const foodEntry = agent.parameters.foodItem;
      const dialogflowAgentDoc = db
        .collection("Taco Bell")
        .doc(foodEntry.toLowerCase());
      return dialogflowAgentDoc
        .get()
        .then((doc) => {
          if (!doc.exists) {
            agent.add("Sorry, I couldn't find that.");
          } else {
            var x = doc.data().ingredients;
            agent.add(`A ${foodEntry} has ${x}.`);
          }
          return Promise.resolve("Read complete");
        })
        .catch(() => {
          agent.add("Error reading entry from the Firestore database.");
        });
    }
    function getIngredientsContext(agent) {
      if (
        !agent.context.get("totalorder").parameters.foodItem &&
        agent.context.get("totalorder").parameters.drinkItem
      ) {
        agent.add("Sorry, soda ingredients are too complex.");
        return;
      }
      const foodEntry = agent.context.get("totalorder").parameters.foodItem;
      const dialogflowAgentDoc = db
        .collection("Taco Bell")
        .doc(foodEntry.toLowerCase());
      return dialogflowAgentDoc
        .get()
        .then((doc) => {
          if (!doc.exists) {
            agent.add("Sorry, I couldn't find that.");
          } else {
            var x = doc.data().ingredients;
            agent.add(`A ${foodEntry} has ${x} in it .`);
          }
          return Promise.resolve("Read complete");
        })
        .catch(() => {
          agent.add("Error reading entry from the Firestore database.");
        });
    }
    function getOrderCaloriesContext(agent) {
      console.log(agent.context.get("totalorder").parameters.foodItem);
      console.log(agent.context.get("totalorder").parameters.drinkItem);

      var foodEntry = "";
      if (agent.parameters.drinkItem) {
        foodEntry = agent.context.get("totalorder").parameters.drinkItem;
      } else {
        foodEntry = agent.context.get("totalorder").parameters.foodItem;
      }

      const dialogflowAgentDoc = db
        .collection("Taco Bell")
        .doc(foodEntry.toLowerCase());

      return dialogflowAgentDoc
        .get()
        .then((doc) => {
          if (!doc.exists) {
            agent.add("Sorry, I couldn't find that.");
          } else {
            var x = doc.data().calories;
            agent.add(`A ${foodEntry} has ${x} calories.`);
          }
          return Promise.resolve("Read complete");
        })
        .catch(() => {
          agent.add("Error reading entry from the Firestore database.");
        });
    }

    // Map from Dialogflow intent names to functions to be run when the intent is matched
    let intentMap = new Map();
    intentMap.set("GetCalories", getCalories);
    intentMap.set("GetIngredients", getIngredients);
    intentMap.set("orderIngredients", getIngredientsContext);
    intentMap.set("orderCalories", getOrderCaloriesContext);

    agent.handleRequest(intentMap);
  }
);
