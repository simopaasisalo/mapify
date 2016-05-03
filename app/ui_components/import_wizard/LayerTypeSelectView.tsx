import * as React from 'react';
import {LayerType} from "./LayerType";
import {LayerTypes} from "../common_items/common";

export class LayerTypeSelectView extends React.Component<ILayerTypeSelectProps, ILayerTypeSelectStates>{
    constructor() {
        super();
        this.state = { selectedType: null };
    }

    selectMapType(type: LayerTypes) {
        this.setState({ selectedType: type });

    }
    cancel() {
        this.props.cancel();
    }
    proceed() {
        if (this.state.selectedType != null) {
            this.props.saveValues(this.state.selectedType);
        }
        else {
            alert('Choose a layer type!');
        }
    }

    public render() {
        return (
            <div>
                <div style={{ height: '80%' }}>
                    <div className = 'dialogHeader'>
                        <h2>Select a map type to create</h2>
                    </div>
                    <LayerType
                        name = 'Choropleth'
                        type = {LayerTypes.ChoroplethMap}
                        imageLocation = 'app/images/choropreview.png'
                        description = 'Map type description TODO'
                        onClick = {this.selectMapType.bind(this) }
                        selected = {this.state.selectedType == LayerTypes.ChoroplethMap}
                        />
                    <LayerType
                        name = 'Symbol map'
                        type = {LayerTypes.SymbolMap}
                        imageLocation = 'app/images/symbolpreview.png'
                        description = 'All images are placeholders'
                        onClick = {this.selectMapType.bind(this) }
                        selected = {this.state.selectedType == LayerTypes.SymbolMap}
                        />


                </div>
                <button className='secondaryButton' style={{ position: 'absolute', left: 15, bottom: 15 }}  onClick={this.cancel.bind(this) }>Cancel</button>
                <button className='primaryButton' style={{ position: 'absolute', right: 15, bottom: 15 }}  onClick={this.proceed.bind(this) }>Continue</button>
            </div >
        );
    }

}
