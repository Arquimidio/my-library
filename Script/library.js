'use strict'
////////////////////////////////////// MODAIS ///////////////////////////////////////////////////////////////////////
const modals = {
	add: {
		container: document.getElementById('addBookModalContainer'), 
		modal: document.getElementById('modal-book-form')
	},
	edit: {
		container: document.getElementById('editBookModalContainer'), 
		modal: document.getElementById('modal-edit-form'),
		selector: document.getElementById('categoryEdited'),
		yesWasRead: document.getElementById('yesWasReadEdited'),
		noWasRead: document.getElementById('noWasReadEdited')
	},
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const DOM = (function(){
	const bookButton = document.getElementById('addBook')
	const editButton = document.getElementById('editBook')
	const bookContainer = document.getElementById('bookContainer')
	const navSelectors = [...document.getElementsByClassName('navSelector')]
	const bookAddedList = [...document.getElementsByClassName('bookAdded')]
	const bookEditedList = [...document.getElementsByClassName('bookEdited')]
	const bookCards = document.getElementsByClassName('bookInfoWrapper')
	const getBookAddedList = () => bookAddedList
	const getBookEditedList = () => bookEditedList
	const getEditButton = () => editButton
	const getBookButton = () => bookButton
	const getBookContainer = () => bookContainer
	const getNavSelectors = () => navSelectors
	const getBookCards = () => bookCards
	return{
		getBookAddedList, 
		getBookEditedList, 
		getEditButton, 
		getBookButton, 
		getBookContainer, 
		getNavSelectors, 
		getBookCards
	}
})()

const modularNum = (function(){
	const desiredNum = 8;
	const getDesiredNum = () => desiredNum
	return {getDesiredNum}
})()


const observerState = (function(){
	let active = false
	const changeObserverState = (state) =>{
		if(state === true || state === false){
			active = state
		}
	}
	const verifyState = () => active
	return {changeObserverState, verifyState}
})()


//Here goes the lists preloading////////////////




///////////////////////////////////////////////

//Flag variables that may be changed
let selectedLi = 'Home'
let list;


function createIntersectionObserver(entryList){
	let options = {threshold: [1.0]}
	let callback = (entries, observer) => {
		entries.forEach(entry => {
			let childNode = entry.target.querySelector('.dynamicButtonsWrapper')
			if(entry.isIntersecting && entry.intersectionRatio >= 1){
				childNode.classList.remove('hideBookButton')
			}else{
				childNode.classList.add('hideBookButton')
			}
			if(window.innerWidth > 640){
				childNode.classList.add('hideBookButton')
				observerState.changeObserverState(false)
				observer.disconnect()
			}
		})
	}
	const observer = new IntersectionObserver(callback, options)
	entryList.forEach(elt => observer.observe(elt))
	
}

function verifySize(){
	let width = window.innerWidth
	const bookWrappers = [...DOM.getBookCards()]
	if(width < 640 && !observerState.verifyState()){
		createIntersectionObserver(bookWrappers)
		observerState.changeObserverState(true)
	}
}

//Changes NAV buttons background and color when clicked
function changeNavLiColor(){
	if(this.textContent === selectedLi){
		DOM.getNavSelectors().map(elt => elt.classList.remove('highlightBackground'));
		this.classList.add('highlightBackground')
	}
}

// Constructor function to create Book objects
const Book = function(name, author, pageNumber, category, wasRead, actualPage, imgUrl){
	this.name = name
	this.author = author
	this.pageNumber = pageNumber
	this.category = category
	this.wasRead = wasRead
	this.actualPage = actualPage
	this.imgUrl = imgUrl
}

///////////////////// BUTTON CREATION AREA///////////////////////////////////////////
const bookForEdition = (function(){
	let bookId;
	const setId = (elt) => bookId = elt.dataset.in
	const getId = () => bookId

	function changeEditingId(child){
		let element = child.closest('.bookInfoWrapper')
		bookForEdition.setId(element)
	}

	return {
		setId, 
		getId,
		changeEditingId
	}
})()


//MODULE TO CREATE THE BUTTONS IN THE DOM
const makeBtn = (function(){

	function createDynamicButtonsWrapper(){
		const wrapper = document.createElement('div')
		wrapper.className = 'dynamicButtonsWrapper hideBookButton'
		return wrapper
	}

	function createRemoveButton(){
		const button = document.createElement('button')
		button.type = 'button'
		button.className = 'bookButton removeButton'
		button.textContent = 'X'
		button.addEventListener('click', btnFunctionality.removeBook)
		return button
	}

	function createEditButton(){
		const button = document.createElement('div')
		const icon = document.createElement('i')
		button.className = 'bookButton editButton'
		button.addEventListener('click', (e) => form.makeModalVisible(e, 
																 modals.edit.container,
																 modals.edit.modal, 
																 true))
		icon.className = 'far fa-edit'
		button.appendChild(icon)
		return button
	}

	function createReadButton(wasRead){
		const button = document.createElement('span')
		const icon = document.createElement('i')
		button.className = 'readButton' + (wasRead? ' wasReadTrue': ' wasReadFalse')
		icon.className = 'fas fa-check-circle'
		button.appendChild(icon)
		button.addEventListener('click', btnFunctionality.markBookAsRead)
		return button
	}

	function createInfoButton(){
		const button = document.createElement('div')
		const icon = document.createElement('i')
		button.className = 'bookButton infoButton'
		icon.className = 'fas fa-info-circle'
		button.appendChild(icon)
		return button
	}

	return{
		createDynamicButtonsWrapper,
		createRemoveButton,
		createEditButton,
		createReadButton,
		createInfoButton
	}
})()

//GIVES FUNCTIONALITY TO THE BUTTONS
const btnFunctionality = (function(){

	function removeBook(e){
		DOM.getBookContainer().removeChild(this.closest('.bookInfoWrapper'))
		localStorage.removeItem(this.closest('.bookInfoWrapper').dataset.in)
	}

	function editBookInfo(num){
		const inputs = DOM.getBookEditedList()
		const editingCategory = document.getElementById('categoryEdited')
		const obj = JSON.parse(localStorage.getItem(`${num}`))
		const bookVisual = document.querySelector(`[data-in="${num}"]`)
		const bookVisualInfo = [...bookVisual.querySelectorAll('.bookVisualInfo')]
		inputs.forEach(elt => obj[elt.id.replace('Edited', '')] = elt.value)
		obj['category'] = editingCategory.value
		localStorage.setItem(`${num}`, JSON.stringify(obj))
		bookVisualInfo.forEach((info, i) => info.textContent = inputs[i].value)
	}

	function markBookAsRead(){
		let index = this.parentElement.dataset.in
		let bookOnStorage = JSON.parse(localStorage.getItem(index))
		let bookWasRead = bookOnStorage.wasRead
		if(bookWasRead){
			bookOnStorage.actualPage = '0'
			bookOnStorage.wasRead = false;
			this.classList.remove('wasReadTrue')
			this.classList.add('wasReadFalse')
		} else{
			bookOnStorage.actualPage = bookOnStorage.pageNumber
			bookOnStorage.wasRead = true
			this.classList.add('wasReadTrue')
			this.classList.remove('wasReadFalse')
		}
		localStorage.setItem(index, JSON.stringify(bookOnStorage))
	}

	function showBookButtons(e){
		let child = e.target.querySelector('.dynamicButtonsWrapper')
		child.classList.remove('hideBookButton')
	}

	function hideBookButtons(e){
		let childList = [...e.target.childNodes]
		childList.forEach(elt =>{
			if(/dynamicButtonsWrapper/.test(elt.className)){
				elt.classList.add('hideBookButton')
			}
		})
	}	

	return {
		removeBook,
		editBookInfo,
		markBookAsRead,
		showBookButtons,
		hideBookButtons
	}
})()



//CREATES DINAMIC PAGINATION, IF NEEDED
const pagination = (function(){

	function createPagination(list){
		let ul = document.getElementById('pagination')
		for(let i = 0; i < list.length; i++){
			let li = document.createElement('li')
			li.dataset.pag = `${i + 1}`
			li.textContent = li.dataset.pag
			li.className = 'paginationLi'
			ul.appendChild(li)
		}
	}

	function removePagination(){
		let ul = document.getElementById('pagination')
		while(ul.firstChild){
			ul.removeChild(ul.firstChild);
		}
	}

	function showFraction(list, fractionToBeShowed){
		let cards = [...document.getElementsByClassName('bookInfoWrapper')]
		cards.forEach(elt => elt.classList.add('hideWrapper'))
		list[fractionToBeShowed].forEach(elt => elt.classList.remove('hideWrapper'))
	}

	function createPaginationArray(arr){
		const len = modularNum.getDesiredNum()
		return Array.from({length: Math.ceil(arr.length/len)}, (_, e) => arr.slice(e*len, e*len + len))
	}

	function verifyClick(e){
		if(e.target.className === 'paginationLi'){
			let cards = list
			pagination.showFraction(cards, e.target.dataset.pag - 1)
		}
	}

	return {
		createPagination,
		removePagination,
		showFraction,
		createPaginationArray,
		verifyClick
	}
})()

////////////////////////////// FORM (MODAL) AREA //////////////////////////////////

//Manipulate modal info

const form = (function(){
	const getInfoFromForm = function(){
		let bookList = DOM.getBookAddedList()
		let valueList = bookList.map(elt => elt.value)
		return [valueList, bookList]
	}

	function clearInfoFromForm(){
		const bookAddedList = getInfoFromForm()[1]
		const select = getDropdown()
		bookAddedList.map(elt => elt.value = '')
		select.value = 'Category'
	}

	function getDropdown(){
		return document.getElementById('category')
	} 

	function getRadio(){
		return document.getElementById('yesWasRead').checked
	}

	function reduceBigStrings(phrase){
		if(phrase.length > 30){
			return phrase.slice(0, 30) + '...'
		}
		else{
			return phrase
		}
	}

	function fillModal(index){
		const storageItem = JSON.parse(localStorage.getItem(`${index}`))
		const inputs = DOM.getBookEditedList()
		inputs.forEach(elt => {
			elt.value = storageItem[elt.id.replace('Edited', '')]
		})
		modals.edit.selector.value = storageItem.category
		storageItem.wasRead? 
		modals.edit.yesWasRead.checked = true
		:modals.edit.noWasRead.checked = true
	}

	function makeModalVisible(e, container, modal, editing=false){
		container.style.display = 'flex'
		if(editing){
			bookForEdition.changeEditingId(e.target)
			let bookToEdit = bookForEdition.getId()
			form.fillModal(bookToEdit)
		}
		setTimeout(() => {
			container.style.opacity = '1'
			modal.classList.add('modal-scale')
		}, 0.2)
	}

	function hideModal(e){
		if([...e.target.classList].includes('modal-container')){
			e.target.firstElementChild.classList.remove('modal-scale')
			e.target.style.opacity = '0'
			setTimeout(() => e.target.style.display = 'none', 650)
		}
	}

	return {
		getInfoFromForm,
		clearInfoFromForm,
		getRadio,
		getDropdown,
		reduceBigStrings,
		fillModal,
		makeModalVisible,
		hideModal
	}
})()




///////////////////////// BOOK CREATION, RENDERING AND FILTERING AREA /////////////////////////////////

//Creates book visual representation with it's informations on the user's screen
function createBookVisual(elt, index, isHidden=false){
	const bookInfoWrapper = document.createElement('div')
	const bookParagraph = document.createElement('p')
	const bookVisual = document.createElement('div')
	const dynamicButtonsWrapper = makeBtn.createDynamicButtonsWrapper()
	const bookContainer = DOM.getBookContainer()
	const dynamicButtons = [
		makeBtn.createRemoveButton(),
		makeBtn.createEditButton(), 
		makeBtn.createInfoButton()
	]
	const wrapperChild = [
		bookVisual,
		bookParagraph,
		dynamicButtonsWrapper,
		makeBtn.createReadButton(elt.wasRead)
		]
	bookInfoWrapper.dataset.in = index
	bookInfoWrapper.className = 'bookInfoWrapper' + (isHidden? ' hideWrapper': '')
	bookInfoWrapper.addEventListener('mouseenter', btnFunctionality.showBookButtons)
	bookInfoWrapper.addEventListener('mouseleave', btnFunctionality.hideBookButtons)
	bookParagraph.innerHTML = 
	`<span class='bookVisualInfo titleSpan'>${form.reduceBigStrings(elt.name)}</span><br>	   
	 <span class='bookVisualInfo'>${form.reduceBigStrings(elt.author)}</span><br>
	 <span class='bookVisualInfo'>Pages: ${form.reduceBigStrings(elt.pageNumber)}</span>`
	bookVisual.className = 'book'
	bookVisual.style.backgroundImage = `url('${elt.imgUrl}')`
	dynamicButtons.forEach(button => dynamicButtonsWrapper.appendChild(button))
	wrapperChild.forEach(elt => bookInfoWrapper.appendChild(elt))
	bookContainer.appendChild(bookInfoWrapper)
}

//Creates an index to associate the books to the localStorage
function createBaseIndex(){
	if(!localStorage.index){
		localStorage.index = 0
	}else{
		localStorage.index = +localStorage.index + 1
	}
	return localStorage.index
}


//Adds book to the library (the JSON and the visual representantion (card))
function addBookToLibrary(){
	let infoList = form.getInfoFromForm()[0]
	let [name, author, pageNumber, pagesRead, imgUrl] = infoList
	let select = form.getDropdown()
	let wasRead = form.getRadio()
	if(infoList.every(elt => elt) && select.value !== 'Category'){
		let book = new Book(name, author, pageNumber, select.value, wasRead, pagesRead, imgUrl)
		let index = createBaseIndex()
		localStorage.setItem(`${index}`, JSON.stringify(book))
		if(selectedLi === 'Home' || selectedLi === select.value){
			createBookVisual(book, index)
		}else{
			createBookVisual(book, index, true)
		}
		form.clearInfoFromForm()
	}else{
		alert("Please, fill all the info!")
	}
}


//Loads books into the homepage when the site is loaded
function loadBooks(e){
	let keys = Object.keys(localStorage)
	let desiredNum = modularNum.getDesiredNum()
	keys.splice(keys.indexOf('index'), 1)

	if(keys.length <= desiredNum){
		keys.map(elt => createBookVisual(JSON.parse(localStorage[elt]), elt))
	}else{
		keys.map(elt => createBookVisual(JSON.parse(localStorage[elt]), elt, true))
		let books = [...document.getElementsByClassName('bookInfoWrapper')]
		let fragmented = pagination.createPaginationArray(books)
		list = fragmented
		pagination.createPagination(fragmented)
		pagination.showFraction(fragmented, 0)
	}

}



//Filters books by category
function filterBooks(e){
	pagination.removePagination()
	let cards = [...document.getElementsByClassName('bookInfoWrapper')]
	let targetCategory = e.target.textContent
	selectedLi = e.target
	cards.forEach(elt => {
		let index = elt.dataset.in
		if(targetCategory === JSON.parse(localStorage.getItem(index)).category || 
		   targetCategory === 'Home'){
			elt.classList.add('shoWrapper')
			elt.classList.remove('hideWrapper')
		}else{
			elt.classList.add('hideWrapper')
			elt.classList.remove('shoWrapper')
		}
	})
	let displaying = [...document.getElementsByClassName('shoWrapper')]
	if(displaying.length > modularNum.getDesiredNum()){
		let fragmented = pagination.createPaginationArray(displaying)
		list = fragmented
		pagination.createPagination(fragmented)
		pagination.showFraction(fragmented, 0)
	}
}

//EVENT LISTENERS
window.addEventListener('resize', verifySize)
window.addEventListener('load', loadBooks)
window.addEventListener('click', pagination.verifyClick)
DOM.getBookButton().addEventListener('click', addBookToLibrary)
DOM.getEditButton().addEventListener('click', () =>{
	return btnFunctionality.editBookInfo(bookForEdition.getId())
})
DOM.getNavSelectors().map(elt => {
	elt.addEventListener('click', (e) => filterBooks(e))
	elt.addEventListener('click', changeNavLiColor)
})
let showModal = document.getElementById('showModal')
showModal.addEventListener('click', (e) => form.makeModalVisible(e, 
																 modals.add.container,
																 modals.add.modal
																 ))
window.addEventListener('click', form.hideModal)






