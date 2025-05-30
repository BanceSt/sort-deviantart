import React from 'react';
import '../styles/LoadingBar.css';
/**
 * LoadingBar component displays a loading bar with a specified progress percentage.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.progress - The progress percentage (0 to 100).
 * @returns {JSX.Element} The rendered loading bar component.
 */

function LoadingBar(props) {
    if (props.activated === false) {
        return null; // Do not render the loading bar if not activated
    }
    return (
        <div className='loading-bar-container'>
            <div className='loading-bar'>
                <div className='loading-bar-fill' style={{ width: props.progress + '%' }}></div>
            </div>
        </div>
    );
}

export default LoadingBar;
