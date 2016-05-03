import * as React from 'react';
let Sortable = require('react-sortablejs')
export class LayerMenu extends React.Component<ILayerMenuProps, ILayerMenuStates>{
    constructor(props: ILayerMenuProps) {
        super(props);

        this.state =
            {
                order: this.getOriginalOrder()
            };
    }
    shouldComponentUpdate(nextProps: ILayerMenuProps, nextState: ILayerMenuStates) {
        return this.props.isVisible !== nextProps.isVisible ||
            this.props.layers !== nextProps.layers ||
            this.areOrdersDifferent(this.state.order, nextState.order);
    }

    componentWillReceiveProps(nextProps: ILayerMenuProps) {
        this.setState({
            order: this.getOriginalOrder(nextProps.layers)
        })
    }

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
    getOriginalOrder(layers?: ILayerData[]) {
        if (!layers) layers = this.props.layers;

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
        for (let lyr of this.state.order) {
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
        for (let lyr of this.state.order) {
            arr.push(lyr.id);
        }
        this.props.saveOrder(arr);
    }
    render() {
        let style = {
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
        return (!this.props.isVisible ? null :
            <div className="mapify-options">
                <label>Drag and drop to reorder layers on map</label>
                <Sortable className='layerList' onChange={this.handleSort.bind(this) }>
                    {this.state.order.map(function(layer) {
                        return <div style={style} key={layer.id} data-id={layer.id} >
                            {layer.name}
                            <i className="fa fa-times" onClick = {this.deleteLayer.bind(this, layer.id) }/>
                        </div>;
                    }, this) }
                </Sortable>
                <button onClick={this.saveOrder.bind(this) }>Save</button>
                <button onClick={this.addNewLayer.bind(this) }>Add new layer</button>

            </div>
        );
    }


}
