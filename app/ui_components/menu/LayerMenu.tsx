import * as React from 'react';
let Sortable = require('react-sortablejs')
import {AppState, Layer} from '../Stores';
import {observer} from 'mobx-react';

@observer
export class LayerMenu extends React.Component<{
    state: AppState,
    /** Function to signal the opening of the layer import wizard. Triggered by button press*/
    addNewLayer: () => void,
    /** Function to remove a layer from the map. Triggered by button press*/
    deleteLayer: (id: number) => void,
    /** Save the current order to the map. Triggered by button press*/
    saveOrder: (order: number[]) => void,
}, {}>{
    private UIState = this.props.state.layerMenuState;
    // shouldComponentUpdate(nextProps: ILayerMenuProps, nextState: ILayerMenuStates) {
    //     return this.props.isVisible !== nextProps.isVisible ||
    //         this.props.layers !== nextProps.layers ||
    //         this.areOrdersDifferent(this.state.order, nextState.order);
    // }

    // componentWillReceiveProps(nextProps: ILayerMenuProps) {
    //     this.setState({
    //         order: this.getOriginalOrder(nextProps.layers)
    //     })
    // }

    areOrdersDifferent(first: { name: string, id: number }[], second: { name: string, id: number }[]) {
        if (first.length !== second.length)
            return true;
        for (let i = 0; i < first.length; i++) {
            if (first[i].id !== second[i].id) {
                return true;
            }
        }
        return false;
    }
    getOriginalOrder(layers?: Layer[]) {
        if (!layers) layers = this.props.state.layers;

        let arr = [];
        for (let lyr of layers) {
            arr.push({ name: lyr.layerName, id: lyr.id });
        }
        return arr;
    }
    handleSort(items: string[]) {
        let arr: { name: string, id: number }[] = [];
        for (let i of items) {
            arr.push(this.getLayerInfoById(i));
        }
        this.setState({
            order: arr
        });

    }
    getLayerInfoById(id: string) {
        for (let lyr of this.UIState.order) {
            if (lyr.id === +id) {
                return lyr;
            }
        }
    }
    addNewLayer() {
        this.props.addNewLayer();
    }
    deleteLayer(id: number) {
        this.props.deleteLayer(id);
    }
    saveOrder() {
        let arr: number[] = [];
        for (let lyr of this.UIState.order) {
            arr.push(lyr.id);
        }
        this.props.saveOrder(arr); //unnecessary? just set the state?
    }
    render() {
        let layerStyle = {
            cursor: 'pointer',
            width: '90%',
            background: 'white',
            color: 'black',
            borderColor: 'white',
            borderWidth: '3px',
            borderStyle: 'double',
            borderRadius: '15px',
            textAlign: 'center',
            lineHeight: '20px',
        }
        return (this.props.state.visibleMenu !== 1 ? null :
            <div className="mapify-options">
                <label>Drag and drop to reorder</label>
                <Sortable className='layerList' onChange={this.handleSort.bind(this) }>
                    {this.UIState.order.map(function(layer) {
                        return <div style={layerStyle} key={layer.id} data-id={layer.id} >
                            {layer.name}
                            <i className="fa fa-times" onClick = {this.deleteLayer.bind(this, layer.id) }/>
                        </div>;
                    }, this) }
                </Sortable>
                <button className='menuButton' onClick={this.saveOrder.bind(this) }>Save</button>
                <button className='menuButton' onClick={this.addNewLayer.bind(this) }>Add new layer</button>

            </div>
        );
    }


}
