"use strict";

import { fetchCategories, fetchProducts } from "./functions.js";
import { saveVote, getVotes } from "./firebase.js"; // ✅ Importar ambas funciones

/**
 * Muestra una notificación tipo "toast" si el elemento con el ID `toast-interactive` existe en el DOM.
 * @function showToast
 * @returns {void} No devuelve ningún valor.
 */
const showToast = () => {
    const toast = document.getElementById("toast-interactive");
    if (toast) {
        toast.classList.add("md:block");
    }
};

/**
 * Asigna un evento de clic al elemento con ID `demo` para abrir un video en una nueva pestaña.
 * @function showVideo
 * @returns {void} No devuelve ningún valor.
 */
const showVideo = () => {
    const demo = document.getElementById("demo");
    if (demo) {
        demo.addEventListener("click", () => {
            window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
        });
    }
};

/**
 * Obtiene los productos desde la API y los muestra dentro del contenedor con id `products-container`.
 * @function renderProducts
 * @returns {void} No devuelve ningún valor.
 */
const renderProducts = () => {
    fetchProducts("https://data-dawm.github.io/datum/reseller/products.json")
        .then(result => {
            if (result.success) {
                const container = document.getElementById("products-container");
                container.innerHTML = "";

                const products = result.body.slice(0, 6);

                products.forEach(product => {
                    let productHTML = `
                    <div class="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
                        <img
                            class="w-full h-40 bg-gray-300 dark:bg-gray-700 rounded-lg object-cover transition-transform duration-300 hover:scale-[1.03]"
                            src="[PRODUCT.IMGURL]" alt="[PRODUCT.TITLE]">
                        <h3
                            class="h-6 text-xl font-semibold tracking-tight text-gray-900 dark:text-white hover:text-black-600 dark:hover:text-white-400">
                            $[PRODUCT.PRICE]
                        </h3>
                        <div class="h-5 rounded w-full">[PRODUCT.TITLE]</div>
                        <div class="space-y-2">
                            <a href="[PRODUCT.PRODUCTURL]" target="_blank" rel="noopener noreferrer"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-full inline-block">
                                Ver en Amazon
                            </a>
                            <div class="hidden"><span class="1">[PRODUCT.CATEGORY_ID]</span></div>
                        </div>
                    </div>`;

                    productHTML = productHTML.replaceAll("[PRODUCT.IMGURL]", product.imgUrl);
                    productHTML = productHTML.replaceAll("[PRODUCT.TITLE]", product.title.length > 20 ? product.title.substring(0, 20) + "..." : product.title);
                    productHTML = productHTML.replaceAll("[PRODUCT.PRICE]", product.price);
                    productHTML = productHTML.replaceAll("[PRODUCT.PRODUCTURL]", product.productURL);
                    productHTML = productHTML.replaceAll("[PRODUCT.CATEGORY_ID]", product.category_id);

                    container.innerHTML += productHTML;
                });
            } else {
                alert(`Error al cargar productos: ${result.body}`);
            }
        });
};

/**
 * Obtiene las categorías desde la API XML y las muestra dentro del elemento `<select>` con id `categories`.
 * @async
 * @function renderCategories
 * @returns {Promise<void>} Una promesa que se resuelve cuando las categorías han sido cargadas.
 */
const renderCategories = async () => {
    try {
        const result = await fetchCategories('https://data-dawm.github.io/datum/reseller/categories.xml');

        if (result.success) {
            const container = document.getElementById("categories");
            container.innerHTML = `<option selected disabled>Seleccione una categoría</option>`;

            const categoriesXML = result.body;
            const categories = categoriesXML.getElementsByTagName("category");

            for (let category of categories) {
                let id = category.getElementsByTagName("id")[0].textContent;
                let name = category.getElementsByTagName("name")[0].textContent;

                let categoryHTML = `<option value="[ID]">[NAME]</option>`;
                categoryHTML = categoryHTML.replaceAll("[ID]", id);
                categoryHTML = categoryHTML.replaceAll("[NAME]", name);

                container.innerHTML += categoryHTML;
            }
        } else {
            alert(`Error al cargar categorías: ${result.body}`);
        }
    } catch (error) {
        alert(`Error al cargar categorías: ${error.message}`);
    }
};

/**
 * Habilita el formulario de votación y envía el voto seleccionado a Firebase.
 * @function enableForm
 * @returns {void} No devuelve ningún valor.
 */
const enableForm = () => {
    const form = document.getElementById("form_voting");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const select = document.getElementById("select_product");
        const productID = select?.value;

        if (!productID) {
            alert("Por favor, seleccione un producto antes de votar.");
            return;
        }

        const result = await saveVote(productID);
        alert(result.message);

        // Actualiza la tabla después de votar
        await displayVotes();
    });
};

/**
 * Obtiene los votos de Firebase y los muestra en una tabla HTML.
 * @async
 * @function displayVotes
 * @returns {Promise<void>}
 */
const displayVotes = async () => {
    const resultContainer = document.getElementById("results");
    if (!resultContainer) return;

    const result = await getVotes();

    if (!result.success) {
        resultContainer.innerHTML = `<p class="text-gray-500">${result.message}</p>`;
        return;
    }

    const votes = result.data;
    const voteCount = {};

    // Contar votos por productID
    Object.values(votes).forEach(vote => {
        voteCount[vote.productID] = (voteCount[vote.productID] || 0) + 1;
    });

    // Construir tabla
    let tableHTML = `
        <table class="min-w-full text-sm text-left text-gray-500 dark:text-gray-400 border">
            <thead class="text-xs uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                    <th class="px-6 py-3">Producto</th>
                    <th class="px-6 py-3">Total de votos</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const [productID, count] of Object.entries(voteCount)) {
        tableHTML += `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${productID}</td>
                <td class="px-6 py-4">${count}</td>
            </tr>
        `;
    }

    tableHTML += `
            </tbody>
        </table>
    `;

    resultContainer.innerHTML = tableHTML;
};

/**
 * Función de autoejecución principal que inicializa la página,
 * mostrando mensajes y cargando productos, categorías y votos.
 * @immediatelyInvokedFunctionExpression
 * @returns {void}
 */
(async () => {
    alert("¡Bienvenido a la página!");
    console.log("Mensaje de bienvenida mostrado.");

    showToast();
    showVideo();
    renderProducts();
    renderCategories();
    enableForm();
    await displayVotes(); // ✅ Muestra la tabla de votos al cargar la página
})();
