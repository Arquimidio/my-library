let modalContainer = document.getElementById('modalContainer')
let showModal = document.getElementById('showModal')
let modal = document.getElementsByClassName('modal')[0]

showModal.addEventListener('click', makeModalVisible)
window.addEventListener('click', hideModal)

function makeModalVisible(){
	modalContainer.style.display = 'flex'
	setTimeout(() => {
		modalContainer.style.opacity = '1'
		modal.classList.add('modal-scale')
	}, 0.2)
}

function hideModal(e){
	if(e.target === modalContainer){
		modal.classList.remove('modal-scale')
		modalContainer.style.opacity = '0'
		setTimeout(() => modalContainer.style.display = 'none', 650)
	}
}
