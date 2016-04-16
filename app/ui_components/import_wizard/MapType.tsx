import * as React from 'react';
import {LayerTypes} from "../common_items/common";

/**
 * The component shown in the map type selection window
 */
export class MapType extends React.Component<IMapTypeProps, {}>{
    public render() {
        return (
            <div className={this.props.enabled ? 'maptypeselect' : 'maptypeselect disabled' }
                onClick={this.props.onClick.bind(this, this.props.type) }>
                <h3>{this.props.name}</h3>
                <img src={this.props.imageLocation} alt={this.props.name} className='maptypepreviewimage'/>
                <p>{this.props.description}</p>
            </div>
        )
    }
}
