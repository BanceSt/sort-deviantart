import React from 'react';
import "../styles/Box.css";

function Box({index, name ="DEFAULT", elements = [], choice = "", onClick = () => {}}) {
    return (
        <div className='box'>
            <div className="box_header">
                <span className="box_name">
                    {name}
                </span>
            </div>
            <div className="box_main">
                {
                    elements.map((element, ind) => {
                        return(
                            <div className={"box_element " + ((choice === element.name) ? "selected": "")} onClick={(event) => onClick(event, index)} id={ind}>
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