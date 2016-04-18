/// <reference path="./MapType.tsx"/>

import * as React from 'react';
import {MapType} from "./MapType";
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
            <div className = 'dialog maptypeselection'>
                <div className = 'maptypelist'>
                    <h2>Select a map type to create</h2>
                    <MapType
                        name = 'Choropleth'
                        type = {LayerTypes.ChoroplethMap}
                        imageLocation = 'app/images/choropreview.png'
                        description = 'Map type description TODO'
                        enabled = {true}
                        onClick = {this.selectMapType.bind(this) }
                        />
                    <MapType
                        name = 'Symbol map'
                        type = {LayerTypes.SymbolMap}
                        imageLocation = 'app/images/symbolpreview.png'
                        description = 'All images are placeholders'
                        enabled = {true}
                        onClick = {this.selectMapType.bind(this) }

                        />


                </div>
                <button onClick={this.cancel.bind(this) }>Cancel</button>
                <button onClick={this.proceed.bind(this) }>Continue</button>
            </div>
        );
    }

    // <MapType
    //     name = 'Dot map'
    //     type = {LayerTypes.DotMap}
    //     imageLocation = 'app/images/dotpreview.png'
    //     description = 'make sideways scrollable'
    //     enabled = {false}
    //     onClick = {this.selectMapType.bind(this) }
    //
    //     />

}
