import React from 'react';
import "../styles/Box.css";

function Box({name ="DEFAULT", elements = []}) {
    return (
        <div className='box'>
            <div className="box_header">
                <span className="box_name">
                    {name}
                </span>
            </div>
            <div className="box_main">
                {
                    elements.map((element) => {
                        return(
                            <div className="box_element">
                                {element.name}
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
}

export default Box;