const global ={
    currentPage: window.location.pathname
}

async function displayPopularBooks(){
    const {works} = await fetchApiData("/subjects/popular.json");
    
    works.forEach((book) => {
        const div = document.createElement("div");
        div.classList.add("book");

        const author = book.authors && book.authors.length > 0 ? book.authors[0].name : "Unknown";
        div.innerHTML = ` 
                
                ${
                    book.cover_id ? `<img src="https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg" alt="book">` : `<img src="./images/Book.webp" alt="${book.title}">`
                }
                <h2>${book.title}</h2>
                <p>By ${author}</p>
                <a href="details.html?id=${book.key}">View Details</a>
                `;
        document.querySelector("#popular-wrapper").appendChild(div);
    });
}

// Display book details
async function displayBookDetails(){
    const bookId = window.location.search.split("=")[1];
    
    const book = await fetchApiData(`${bookId}.json`);
    console.log(book);

    const author = book.authors && book.authors.length > 0 ? book.authors[0].name : "Unknown";
    const description = book.description ? (typeof book.description === 'string' ? book.description : book.description.value) : "No description available.";
    const publishDate = book.created ? new Date(book.created.value).toLocaleDateString() : "Unknown";
    const genres = book.subjects ? book.subjects : ["No genres available."];
    
    const coverImage = book.covers && book.covers.length > 0 
        ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg` 
        : './images/Book.webp';

    const div = document.createElement("div");
    div.classList.add("book-container");
    div.innerHTML = `

            <div class="book-image">
                <img src="${coverImage}" alt="${book.title}">
            </div>
            <div class="details-text">
                <h2>${book.title}</h2>
                <p>
                    <span>Author: </span> ${author}
                </p>
                <p ><span>Publishing Date: </span> ${publishDate}</p>
                <p class="description"> <span>Description:</span> ${description}
                    
                </p>
                <h5>Genres:</h5>
                <ul class="list-group">
                    <li>Genre 1</li>
                    <li>Genre 2</li>
                    <li>Genre 3</li>
                </ul>
                <a href="#" target="_blank" class="purchase-btn">Read or Purchase</a>
            </div>
        </div>
              
    `;
    document.querySelector("#book-details").appendChild(div);
}

// Fetch Data from API
async function fetchApiData(endpoint){
    const API_URL ="https://openlibrary.org";
    
    showSpinner();
    const response = await fetch(`${API_URL}${endpoint}`);
    const data = await response.json();

    hideSpinner();
    return data;
}

function showSpinner(){
    document.querySelector(".spinner").classList.add("show");
}
function hideSpinner(){
    document.querySelector(".spinner").classList.remove("show");
}

// Init Website
function init (){
    switch (global.currentPage){
        case "/":
        case "/index.html": 
            displayPopularBooks();
            break;
        case "/details.html": 
            displayBookDetails();
            break;
        case "/search.html": 
            console.log("Search");
            break;
    }
}

document.addEventListener("DOMContentLoaded", init);