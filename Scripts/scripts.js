
const mealDiv = document.getElementById("meals");
const mealUl = document.getElementById("myul");
const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search-btn');
const mealPopup = document.getElementById('meal-popup');
const closeButton = document.getElementById('close-info');
const mealInfo = document.getElementById('meal-info');

/*----------------------------------------- Calling Function ----------------------------------------------*/
FetchFavMeals();
getRandomMeal();

async function getMealById(id){
	const mealByID = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);
	const mealDataID = await mealByID.json();
	const meal = mealDataID.meals[0];
	return meal;
}

/* Finished ----------------------------------------------------------------------------------------------*/
async function getRandomMeal(){
	const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
	const respData = await resp.json();
	const randomMeal = respData.meals[0];

	DisplayMeal(randomMeal, true);
}


async function getMealsBySearch(term){
	const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);
	const respData = await resp.json();
	const meals = respData.meals;
	return meals;
}


/* Finished ----------------------------------------------------------------------------------------------*/
async function DisplayMeal(mealData, random = false){
	const meal = document.createElement('div');
	meal.classList.add('meal');

	meal.innerHTML = `
		<div class="meal-header">
				${random ? `
				<span class="random">Random Recipe</span>
				` : ''}
				<img 
					src = "${mealData.strMealThumb}"
					alt = ${mealData.strMeal}
					class = "meal-picture"
				/>
		</div>
		<div class="meal-body">
			<h4>${mealData.strMeal}</h4>
			<button class="fav-button">
				<i class="fas fa-heart"></i>
			</button>
		</div>
	`;

	const likebutton = meal.querySelector('.meal .fav-button');
	likebutton.addEventListener('click', ()=>{
		if(likebutton.classList.contains('active')){
			removeFavMeal(mealData.idMeal);
			likebutton.classList.remove('active');
		} else{
			addFavMeal(mealData.idMeal);
			likebutton.classList.add('active');
		}
		FetchFavMeals();
	});



	const targetedEl = await meal.querySelector('.meal .meal-picture');

	mealDiv.appendChild(meal);


	targetedEl.addEventListener('click', ()=>{
		DisplayMealInfo(mealData);
	});
}


/*---------------------------------------- Function for adding the meal to favourite list -----------------*/
function addFavMeal(mealID){
	const allMeals = getFavMeals();
	localStorage.setItem('favmeals', JSON.stringify([...allMeals, mealID]));
}

/*---------------------------------------- Function for getting all meals from favourite list -------------*/
function getFavMeals(){
	const allMeals = JSON.parse(localStorage.getItem('favmeals'));
	return allMeals === null? []: allMeals;
}

/*---------------------------------------- Function for removing chosen meal from favourites list ---------*/
function removeFavMeal(mealID){
	const allMeals = getFavMeals();

	localStorage.setItem("favmeals",
		JSON.stringify(allMeals.filter((id) => id !== mealID))
	)
}


/*--------------------------------------- Function for displaying favourite meals -------------------------*/

async function FetchFavMeals(){
	const allFavMeals = getFavMeals();
	mealUl.innerHTML = "";

	for(let i=0; i<allFavMeals.length; i++){
		const elementnow = await getMealById(allFavMeals[i]);
		displayFavMeal(elementnow);
	}
}

/*--------------------------------------Function for displaying favourite dishes --------------------------*/

function displayFavMeal(mealdata){
	const lielement = document.createElement('li');

	lielement.innerHTML =`
		<img src="${mealdata.strMealThumb}" id = "fav-picture">
		<span>${mealdata.strMeal}</span>
		<button class="clear"><i class="fas fa-window-close"></i></button>
	`;

	const btn = lielement.querySelector('.clear');
	btn.addEventListener('click', ()=>{
		removeFavMeal(mealdata.idMeal);

		FetchFavMeals();
	})

	mealUl.appendChild(lielement);

	const targetedEl = lielement.children[0];

	targetedEl.addEventListener('click', ()=>{
		DisplayMealInfo(mealdata);
	});
}

/*--------------- Function for searching the meal ---------------------------------------------------------*/

searchBtn.addEventListener('click', async ()=>{
	const search = searchTerm.value;

	const searchResult = await getMealsBySearch(search);

	if(searchResult){
			mealDiv.innerHTML = "";
			searchResult.forEach((meal)=>{
			DisplayMeal(meal);
			searchTerm.value = "";
		})
	} else {
		alert("No results found for this search!");
		searchTerm.value = "";
	}
})

/*--------------------------------Event Listener for closing the popup------------------------------------*/

closeButton.addEventListener('click', ()=>{
	mealPopup.classList.add('hidden');
})


/*-----------------------------Function for displaying meal info -----------------------------------------*/
function DisplayMealInfo(mealData){

	const ingredients = [];

	for(let i=1; i<=20; i++){
		if(mealData["strIngredient"+i]){
			ingredients.push(`${mealData["strIngredient"+i]} - ${mealData["strMeasure"+i]}`);
		} else {
			break;
		}
	}


	mealInfo.innerHTML = `
			<h1>${mealData.strMeal}</h1>
			<img src="${mealData.strMealThumb}" alt="the meal">
			<p>${mealData.strInstructions}</p>

			<h3>Ingredients</h3>

			<ul>
				${ingredients
					.map(
						ing =>	`
						<li>${ing}</li>`)
					.join("")}

			</ul>
	`;

	mealPopup.classList.remove('hidden');
}

function nextMeal(){
	mealDiv.innerHTML = "";
	getRandomMeal();
}

/*---------------- Event Listener to set "Enter" key as an alternative key for search -----------------------*/
searchTerm.addEventListener('keyup', function(event){
	// Number 13 is the "Enter" key on the keyboard
	if(event.keyCode === 13){
		//Cancel the default action. If needed
		event.preventDefault();
		//Trigger the button element with a click
		searchBtn.click();
	}
})