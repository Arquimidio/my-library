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

const bookForEdition = (function(){
	let bookId;
	let setId = (elt) => bookId = elt.dataset.in
	let getId = () => bookId
	return{setId, getId}
})()

function changeEditingId(child){
	let element = child.closest('.bookInfoWrapper')
	bookForEdition.setId(element)
}


let showModal = document.getElementById('showModal')

showModal.addEventListener('click', (e) => makeModalVisible(e, modals.add.container, modals.add.modal))
window.addEventListener('click', hideModal)

function makeModalVisible(e, container, modal, editing=false){
	container.style.display = 'flex'
	if(editing){
		changeEditingId(e.target)
		fillModal(bookForEdition.getId())
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
	return{getBookAddedList, getBookEditedList, getEditButton, getBookButton, getBookContainer, getNavSelectors, getBookCards}
})()

const modularNum = (function(){
	const desiredNum = 8
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

//Event listeners definition
window.addEventListener('resize', verifySize)
window.addEventListener('load', loadBooks)
window.addEventListener('click', verifyClick)
DOM.getBookButton().addEventListener('click', addBookToLibrary)
DOM.getEditButton().addEventListener('click', () => editBookInfo(bookForEdition.getId()))
DOM.getNavSelectors().map(elt => {
	elt.addEventListener('click', (e) => filterBooks(e))
	elt.addEventListener('click', changeNavLiColor)
})

function createIntersectionObserver(entryList){
	let options = {threshold: [1.0]}
	let callback = (entries, observer) => {
		entries.forEach(entry => {
			let childNode = [...entry.target.childNodes].filter(elt => [...elt.classList].includes('dynamicButtonsWrapper'))[0]
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

function verifyClick(e){
	if(e.target.className === 'paginationLi'){
		let cards = list
		showFraction(cards, e.target.dataset.pag - 1)
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

function createDynamicButtonsWrapper(){
	const wrapper = document.createElement('div')
	wrapper.className = 'dynamicButtonsWrapper hideBookButton'
	return wrapper
}

function createRemoveButton(){
	let button = document.createElement('button')
	button.type = 'button'
	button.className = 'bookButton removeButton'
	button.textContent = 'X'
	button.addEventListener('click', removeBook)
	return button
}

function removeBook(e){
	DOM.getBookContainer().removeChild(this.closest('.bookInfoWrapper'))
	localStorage.removeItem(this.closest('.bookInfoWrapper').dataset.in)
}

function createEditButton(){
	let button = document.createElement('div')
	button.className = 'bookButton editButton'
	button.addEventListener('click', (e) => makeModalVisible(e, modals.edit.container, modals.edit.modal, true))
	let icon = document.createElement('i')
	icon.className = 'far fa-edit'
	button.appendChild(icon)
	return button
}

function fillModal(index){
	let inputs = DOM.getBookEditedList()
	const storageItem = JSON.parse(localStorage.getItem(`${index}`))
	inputs.forEach(elt => {
		elt.value = storageItem[elt.id.replace('Edited', '')]
	})
	modals.edit.selector.value = storageItem.category
	storageItem.wasRead? 
	modals.edit.yesWasRead.checked = true
	:modals.edit.noWasRead.checked = true
}

function editBookInfo(num){
	let inputs = DOM.getBookEditedList()
	let obj = JSON.parse(localStorage.getItem(`${num}`))
	inputs.forEach(elt => obj[elt.id.replace('Edited', '')] = elt.value)
	localStorage.setItem(`${num}`, JSON.stringify(obj))

	let bookVisual = document.querySelector(`[data-in="${num}"]`)
	let bookVisualInfo = [...bookVisual.querySelectorAll('.bookVisualInfo')]
	bookVisualInfo.forEach((info, i) => info.textContent = inputs[i].value)
}

function createReadButton(wasRead){
	let button = document.createElement('span')
	let icon = document.createElement('i')
	button.className = 'readButton' + (wasRead? ' wasReadTrue': ' wasReadFalse')
	icon.className = 'fas fa-check-circle'
	button.appendChild(icon)
	button.addEventListener('click', markBookAsRead)
	return button
}

function createInfoButton(){
	let button = document.createElement('div')
	button.className = 'bookButton infoButton'
	let icon = document.createElement('i')
	icon.className = 'fas fa-info-circle'
	button.appendChild(icon)
	button.addEventListener('click', removeBook)
	return button
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
	let childList = [...e.target.childNodes]
	childList.forEach(elt =>{
		if(/dynamicButtonsWrapper/.test(elt.className)){
			elt.classList.remove('hideBookButton')
		}
	})
}

function hideBookButtons(e){
	let childList = [...e.target.childNodes]
	childList.forEach(elt =>{
		if(/dynamicButtonsWrapper/.test(elt.className)){
			elt.classList.add('hideBookButton')
		}
	})
}	

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

////////////////////////////// FORM (MODAL) AREA //////////////////////////////////

//Manipulate modal info
const getInfoFromForm = function(){
	let bookList = DOM.getBookAddedList()
	let valueList = bookList.map(elt => elt.value)
	return [valueList, bookList]
}

function clearInfoFromForm(){
	const bookAddedList = getInfoFromForm()[1]
	bookAddedList.map(elt => elt.value = '')
	let select = getDropdown()
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
///////////////////////// BOOK CREATION, RENDERING AND FILTERING AREA /////////////////////////////////

//Creates book visual representation with it's informations on the user's screen
function createBookVisual(elt, index, isHidden=false){
	let bookInfoWrapper = document.createElement('div')
	bookInfoWrapper.dataset.in = index
	let bookParagraph = document.createElement('p')
	bookParagraph.innerHTML = `<span class='bookVisualInfo titleSpan'>${reduceBigStrings(elt.name)}</span><br>
							   <span class='bookVisualInfo'>${reduceBigStrings(elt.author)}</span><br>
							   <span class='bookVisualInfo'>Pages: ${reduceBigStrings(elt.pageNumber)}</span>`

	bookInfoWrapper.className = 'bookInfoWrapper' + (isHidden? ' hideWrapper': '')
	const bookVisual = document.createElement('div')
	bookVisual.className = 'book'
	bookVisual.style.backgroundImage = `url('${elt.imgUrl}')`
	const dynamicButtons = [createRemoveButton(), createEditButton(), createInfoButton()]
	const dynamicButtonsWrapper = createDynamicButtonsWrapper()
	dynamicButtons.forEach(button => dynamicButtonsWrapper.appendChild(button))
	const wrapperChild = [
						bookVisual,
						bookParagraph,
						dynamicButtonsWrapper,
						createReadButton(elt.wasRead)
						]
	wrapperChild.forEach(elt => bookInfoWrapper.appendChild(elt))
	bookInfoWrapper.addEventListener('mouseover', showBookButtons)
	bookInfoWrapper.addEventListener('mouseleave', hideBookButtons)
	DOM.getBookContainer().appendChild(bookInfoWrapper)
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
	let infoList = getInfoFromForm()[0]
	let [name, author, pageNumber, pagesRead, imgUrl] = infoList
	let select = getDropdown()
	let wasRead = getRadio()
	if(infoList.every(elt => elt) && select.value !== 'Category'){
		let book = new Book(name, author, pageNumber, select.value, wasRead, pagesRead, imgUrl)
		let index = createBaseIndex()
		localStorage.setItem(`${index}`, JSON.stringify(book))
		if(selectedLi === 'Home' || selectedLi === select.value){
			createBookVisual(book, index)
		}else{
			createBookVisual(book, index, true)
		}
		clearInfoFromForm()
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
		let fragmented = createPaginationArray(books)
		list = fragmented
		createPagination(fragmented)
		showFraction(fragmented, 0)
	}

}

function showFraction(list, fractionToBeShowed){
	let cards = [...document.getElementsByClassName('bookInfoWrapper')]
	cards.forEach(elt => elt.classList.add('hideWrapper'))
	list[fractionToBeShowed].forEach(elt => elt.classList.remove('hideWrapper'))
}

//Filters books by category
function filterBooks(e){
	removePagination()
	let target = e.target.textContent
	selectedLi = target
	let cards = [...document.getElementsByClassName('bookInfoWrapper')]
	cards.forEach(elt => {
		if(target === JSON.parse(localStorage.getItem(elt.dataset.in)).category || target === 'Home'){
			elt.classList.add('notHidden')
			elt.classList.remove('hideWrapper')
		}else{
			elt.classList.add('hideWrapper')
			elt.classList.remove('notHidden')
		}
	})
	let displaying = [...document.getElementsByClassName('notHidden')]
	if(displaying.length > modularNum.getDesiredNum()){
		let fragmented = createPaginationArray(displaying)
		list = fragmented
		createPagination(fragmented)
		showFraction(fragmented, 0)
	}
}

//Protótipo de paginação (DÁ PARA MELHORAR)
function createPaginationArray(list){
	const desiredNum = modularNum.getDesiredNum()
	let acc = []
	for(let i = desiredNum; i < list.length; i+= desiredNum){
		acc.push(list.slice(i - desiredNum, i))
	}
  
    if(acc.length < list.length/desiredNum) {
  	  let lastElement = acc[acc.length - 1]
  	  let lastIndex = lastElement[lastElement.length - 1]
  	  acc.push(list.slice(list.indexOf(lastIndex) + 1, list.length))
    }

    return acc
}






