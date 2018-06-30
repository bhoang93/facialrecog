import React from 'react';
import Tilt from 'react-tilt'
import './Logo.css'

const Logo = () => {
	return (
		<div className='ma4 mt0'>
			<Tilt className="Tilt br2 shadow-2 pa3" options={{ max : 25 }} style={{ height: 250, width: 250 }} >
 				<div className="Tilt-inner emoji"> 🤩 </div>
 				<div className="Tilt-inner logotext"> CHECK <br /> YO <br /> FACE </div>
			</Tilt>
		</div>)}


export default Logo;