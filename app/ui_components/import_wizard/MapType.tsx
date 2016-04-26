import * as React from 'react';
import {LayerTypes} from "../common_items/common";

/**
 * The component shown in the map type selection window
 */
export class MapType extends React.Component<IMapTypeProps, {}>{
    public render() {
        let style = {
            float: 'left',
            borderRadius: '25px',
            border: '2px solid gray',
            padding: '20px',
            margin: '15px',
            width: '250px',
            height: '80%',
        };
        return (
            <div style = {style}
                onClick={this.props.onClick.bind(this, this.props.type) }>
                <h3>{this.props.name}</h3>
                <img src={this.props.imageLocation} alt={this.props.name} style={{ width: '100%' }}/>
                <p>{this.props.description}</p>
            </div>
        )
    }
}
