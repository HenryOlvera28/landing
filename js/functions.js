'use strict';

/**
 * Obtiene y analiza un archivo XML desde una URL dada.
 * @async
 * @function fetchCategories
 * @param {string} url - URL del archivo XML que contiene las categorías.
 * @returns {Promise<{success: boolean, body: Document|string}>} 
 * Un objeto que indica si la solicitud fue exitosa y el contenido del XML o el mensaje de error.
 */
let fetchCategories = async (url) => {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        let text = await response.text();

        const parser = new DOMParser();
        const data = parser.parseFromString(text, "application/xml");

        return {
            success: true,
            body: data
        };

    } catch (error) {
        return {
            success: false,
            body: error.message
        };
    }
};

/**
 * Obtiene y analiza un archivo JSON desde una URL dada.
 * @function fetchProducts
 * @param {string} url - URL del archivo JSON que contiene los productos.
 * @returns {Promise<{success: boolean, body: any[]|string}>} 
 * Un objeto que indica si la solicitud fue exitosa y el arreglo de productos o el mensaje de error.
 */
let fetchProducts = (url) => {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return {
                success: true,
                body: data
            };
        })
        .catch(error => {
            return {
                success: false,
                body: error.message
            };
        });
};

export { fetchCategories, fetchProducts };
