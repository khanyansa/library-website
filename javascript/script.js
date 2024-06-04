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

    
    const description = book.description ? (typeof book.description === 'string' ? book.description : book.description.value) : "No description available.";
    const publishDate = book.created ? new Date(book.created.value).toLocaleDateString() : "Unknown";
    const authorKey = book.authors && book.authors.length > 0 ? book.authors[0].author.key : null;
    const author = authorKey ? await fetchAuthorName(authorKey) : "Unknown";

    const genres = book.subjects ? book.subjects.slice(0, 5).map(subject => `<li>${subject}</li>`).join('') : "<li>No genres available</li>";
    const readOrPurchaseLink = book.links && book.links.length > 0 
        ? book.links[0].url 
        : `https://openlibrary.org${bookId}`;
    
    
    const coverImage = book.covers && book.covers.length > 0 
        ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg` 
        : './images/Book.webp';

    
    const editions = await fetchApiData(`${bookId}/editions.json`);
    const firstEdition = editions && editions.entries && editions.entries.length > 0 ? editions.entries[0] : {};
    console.log(firstEdition);

    const editionKey = firstEdition.key.split('/')[2];

    // Fetch edition details
    const editionDetails = await fetchApiData(`/books/${editionKey}.json`);
    console.log('Edition Details:', editionDetails);

     // Fetch availability data
    const availabilityData = await fetchAvailabilityData(editionKey);
    console.log('Availability Data:', availabilityData);

    const availability = availabilityData.status || "N/A";


    const numberOfPages = firstEdition.number_of_pages || "N/A";
    const publishers = firstEdition.publishers ? firstEdition.publishers.join(", ") : "N/A";
    const edition = firstEdition.edition_name || "N/A";
    

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
                    ${genres}
                </ul>
                <a href="${readOrPurchaseLink}" target="_blank" class="purchase-btn">Read or Purchase</a>
            </div>
        </div>
              
    `;

    document.querySelector("#book-details").appendChild(div);

    const bookDiv = document.createElement("div");
    bookDiv.classList.add("more-details");
    bookDiv.innerHTML =`

             <h2>More Info</h2>
            <ul>
                <li><span class="text-secondary">Pages:</span> ${numberOfPages}</li>
                <li><span class="text-secondary">edition:</span> ${edition}</li>
                <li><span class="text-secondary">Status:</span> ${availability}</li>
            </ul>
            <h4>Publisher: </h4>
            <div class="list-group">${publishers}</div>

    `;

    document.querySelector("#book-details").appendChild(bookDiv);


    
}


// Fetch author name
async function fetchAuthorName(authorKey) {
    const authorData = await fetchApiData(`${authorKey}.json`);
    return authorData.name || "Unknown";
}


// Fetch availability data
async function fetchAvailabilityData(editionKey) { 
    const API_URL = `https://openlibrary.org/api/books?bibkeys=OLID:${editionKey}&jscmd=availability&format=json`;
    
    showSpinner();
    const response = await fetch(API_URL);
    const data = await response.json();
    hideSpinner();
    
    return data[`OLID:${editionKey}`] && data[`OLID:${editionKey}`].availability 
        ? data[`OLID:${editionKey}`].availability 
        : { status: "N/A" };
}

//Display Latest books swiper slide function
async function displaySlider(){
    const{ works } = await fetchApiData(`/subjects/recent.json?limit=10`);

    console.log(works);
    works.forEach((book) => {
        const div = document.createElement("div");
        div.classList.add("swiper-slide");
        div.innerHTML =`
        ${
                    book.cover_id ? `<img src="https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg" alt="book">` : `<img src="./images/Book.webp" alt="${book.title}">`
                }
        
                    <div class="content-container">
                        <h2>${book.title}</h2>
                        <a href="details.html?id=${book.key}">View Deatails</a>
                    </div>
        `;
        document.querySelector(".swiper-wrapper").appendChild(div);

        initSwiper();
    })
}

function initSwiper(){
    const swiper = new Swiper(".swiper", {
        slidesPerView: 3,
        spaceBetween: 30,
        freeMode: true,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteractive: false,
        },
        breakpoints: {

            320:{
                slidesPerView: 1
            },

            500: {
                slidesPerView: 2
                
            },
            800: {
                slidesPerView: 3
                
            }
            
        }
    });
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
            displaySlider();
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