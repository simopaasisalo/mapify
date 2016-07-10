import * as React from 'react';
import {LayerType} from "./LayerType";
import {LayerTypes} from "../common_items/common";
import {ImportWizardState} from '../Stores';
import {observer} from 'mobx-react';

@observer
export class LayerTypeSelectView extends React.Component<{
    state: ImportWizardState,
    /** cancels the layer import wizard */
    cancel: () => void,
}, {}>{
    private activeLayer = this.props.state.layer;

    onMapTypeClick = (type: LayerTypes) => {
        this.activeLayer.layerType = type;
    }
    cancel = () => {
        this.props.cancel();
    }
    proceed = () => {
        if (this.activeLayer.layerType === null) {
            alert('Choose a layer type!');
        }
        else { this.props.state.step++ }
    }

    public render() {

        return (
            <div>
                <div>
                    <div className = 'dialogHeader'>
                        <h2>Select a map type to create</h2>
                    </div>
                    <div style = {{ height: 600 }}>
                        <LayerType
                            name = 'Choropleth'
                            type = {LayerTypes.ChoroplethMap}
                            imageURL = 'app/images/choropreview.png'
                            description = 'Use this type to create clean and easy to read maps from your polygon data. Color the areas by a single value by selecting a predefined color scheme or define your own.'
                            onClick = {this.onMapTypeClick }
                            selected = {this.activeLayer.layerType == LayerTypes.ChoroplethMap}
                            />
                        <LayerType
                            name = 'Symbol map'
                            type = {LayerTypes.SymbolMap}
                            imageURL = 'app/images/symbolpreview.png'
                            description = 'Use icons and charts to bring your point data to life! Scale symbol size by a value and give them choropleth-style coloring to create multi-value maps.'
                            onClick = {this.onMapTypeClick }
                            selected = {this.activeLayer.layerType == LayerTypes.SymbolMap}

                            />
                        <LayerType
                            name = 'Heatmap'
                            type = {LayerTypes.HeatMap}
                            imageURL = 'app/images/heatpreview.png'
                            description = 'Turn your point data into an intensity map with this layer type. In development!'
                            onClick = {this.onMapTypeClick }
                            selected = {this.activeLayer.layerType === LayerTypes.HeatMap}
                            />
                    </div>

                </div>
                <button className='secondaryButton' style={{ position: 'absolute', left: 15, bottom: 15 }}  onClick={this.cancel }>Cancel</button>
                <button className='primaryButton' disabled={this.activeLayer.layerType === null} style={{ position: 'absolute', right: 15, bottom: 15 }}  onClick={this.proceed }>Continue</button>
            </div >
        );
    }

}
