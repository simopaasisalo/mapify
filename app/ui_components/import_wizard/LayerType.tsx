import * as React from 'react';
import {LayerTypes} from "../common_items/common";

/**
 * The component shown in the map type selection window
 */
export class LayerType extends React.Component<ILayerTypeProps, {}>{
    public render() {
        let style = {
            display: 'inline-block',
            borderRadius: '25px',
            border: this.props.selected ? '4px solid #549341' : '2px solid gray',
            padding: '20px',
            margin: this.props.selected ? '13px' : '15px',
            width: '250px',
            height: '80%',
        };
        return (
            <div style = {style}
                onClick={this.props.onClick.bind(this, this.props.type) }>
                <h3>{this.props.name}</h3>
                <p>{this.props.description}</p>
            </div>
        )
    }
}
