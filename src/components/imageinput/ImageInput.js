import React from 'react'
import './ImageInput.css'

const ImageInput = ({ onInputChange, onSubmit }) => {
	return (
		<div>
			<p className='f3'>{'Magic Age Gender Ethnicity Calculator'}</p>
		<div className='center'>
			<div className='form center pa4 br3 shadow-5'>
				<input className='center f4 pa2 w-70 center' type='text' onChange={onInputChange}/>
				<button onClick={onSubmit} className='w-30 grow f4 link ph3 pv2 dib white bg-light-blue'>Detect</button>
			</div>
		</div>
		</div>)}

export default ImageInput;