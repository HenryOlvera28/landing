// js/firebase.js
"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, push, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Configuración del proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA91sUiixZ-cM6yxNX4TKsy9wvrfc1EaIE",
  authDomain: "landing-eeb1c.firebaseapp.com",
  projectId: "landing-eeb1c",
  storageBucket: "landing-eeb1c.firebasestorage.app",
  messagingSenderId: "336048948141",
  appId: "1:336048948141:web:fc0d098dc83d29bd519724"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Obtiene una referencia a la base de datos
const database = getDatabase(app);

/**
 * Guarda un voto en la base de datos de Firebase.
 * @async
 * @function saveVote
 * @param {string} productID - ID del producto votado.
 * @returns {Promise<{success: boolean, message: string}>}
 * Devuelve un objeto que indica el resultado de la operación.
 */
const saveVote = async (productID) => {
  try {
    const votesRef = ref(database, "votes");
    const newVoteRef = push(votesRef);

    await set(newVoteRef, {
      productID: productID,
      date: new Date().toISOString()
    });

    return {
      success: true,
      message: "Voto guardado correctamente."
    };

  } catch (error) {
    return {
      success: false,
      message: `Error al guardar el voto: ${error.message}`
    };
  }
};

/**
 * Obtiene los votos almacenados en la base de datos de Firebase.
 * @async
 * @function getVotes
 * @returns {Promise<{success: boolean, data?: Object, message?: string}>}
 * Devuelve un objeto con los votos si existen, o un mensaje si no hay datos.
 */
const getVotes = async () => {
  try {
    const votesRef = ref(database, "votes");
    const snapshot = await get(votesRef);

    if (snapshot.exists()) {
      return {
        success: true,
        data: snapshot.val()
      };
    } else {
      return {
        success: false,
        message: "No hay datos disponibles en la colección 'votes'."
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error al obtener los votos: ${error.message}`
    };
  }
};

// Exportar las funciones para su uso en otros módulos
export { saveVote, getVotes };
