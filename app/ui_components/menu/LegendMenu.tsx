import * as React from 'react';
export class LegendMenu extends React.Component<ILegendMenuProps, ILegendMenuStates>{
    constructor() {
        super();
        this.state =
            {
                showLegend: false,
                horizontal: false,
            };
    }
    showLegendChanged(e) {
        this.setState({
            showLegend: e.currentTarget.checked,
        });
    }
    horizontalChanged(e) {
        this.setState({
            horizontal: e.currentTarget.checked
        })
    }
    componentDidUpdate() {
        let info: ILegend = {
            horizontal: this.state.horizontal,
            visible: this.state.showLegend,
            title: 'Legend',
            meta: ''
        }
        this.props.valuesChanged(info);
    }
    render() {
        return (!this.props.isVisible ? null : <div>
            <label>Show legend</label>
            <input type='checkbox' checked={this.state.showLegend} onChange={this.showLegendChanged.bind(this) }/>
            <br/>
            <label>Align horizontally</label>
            <input type='checkbox' checked={this.state.horizontal} onChange={this.horizontalChanged.bind(this) }/>
        </div >)
    }
}
