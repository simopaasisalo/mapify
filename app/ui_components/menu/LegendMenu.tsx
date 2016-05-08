import * as React from 'react';
export class LegendMenu extends React.Component<ILegendMenuProps, ILegend>{
    constructor() {
        super();
        this.state =
            {
                visible: false,
                horizontal: false,
                title: 'Legend',
                meta: 'Map created with Mapify'
            };
    }
    titleChanged(e) {
        this.setState({
            title: e.target.value
        })
    }
    metaChanged(e) {
        this.setState({
            meta: e.target.value
        })
    }
    showLegendChanged(e) {
        this.setState({
            visible: e.currentTarget.checked,
        });
    }
    horizontalChanged(e) {
        this.setState({
            horizontal: e.currentTarget.checked
        });
    }
    componentDidUpdate() {
        let info: ILegend = {
            horizontal: this.state.horizontal,
            visible: this.state.visible,
            title: this.state.title,
            meta: this.state.meta
        }
        this.props.valuesChanged(info);
    }
    render() {
        return (!this.props.isVisible ? null :
            <div className="mapify-options">
                <label htmlFor='showLegend'>Show legend</label>
                <input id='showLegend' type='checkbox' checked={this.state.visible} onChange={this.showLegendChanged.bind(this) }/>
                <br/>
                <label>Title</label>
                <input type='text' style={{ width: '100%' }} value={this.state.title} onChange={this.titleChanged.bind(this) }/>
                <br/>
                <label>Meta</label>
                <textarea
                    style={{ width: '100%', height: 50 }}
                    rows={5}
                    value={this.state.meta}
                    onChange={this.metaChanged.bind(this) }/>
                <br/>
                <label htmlFor='makeHorizontal'>Align horizontally</label>
                <input id='makeHorizontal' type='checkbox' checked={this.state.horizontal} onChange={this.horizontalChanged.bind(this) }/>
            </div >)
    }
}
