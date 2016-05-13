import * as React from 'react';
import {LayerTypes} from "../common_items/common";

/**
 * The component shown in the map type selection window
 */
export class LayerType extends React.Component<ILayerTypeProps, {}>{
    loadDemo() {
        this.props.loadDemo(this.props.type);
    }
    render() {
        let style = {
            float: 'left',
            borderRadius: '25px',
            border: this.props.selected ? '4px solid #549341' : '2px solid gray',
            padding: 20,
            margin: this.props.selected ? 13 : 15,
            width: 250,
            height: 520,
            position: 'relative'
        };
        let buttonStyle = {
            position: 'absolute',
            bottom: 5,
            left: 79
        }
        return (
            <div style = {style}
                onClick={this.props.onClick.bind(this, this.props.type) }>
                <h3>{this.props.name}</h3>
                <img src={this.props.imageLocation} alt={this.props.name} style={{ width: '100%' }}/>
                <p>{this.props.description}</p>
                <button
                    style={buttonStyle}
                    onClick={this.loadDemo.bind(this) }
                    className='primaryButton'>Try demo</button>
            </div>
        )
    }
}
