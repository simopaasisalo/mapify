import * as React from 'react';
import {AppState} from '../Stores';
import {observer} from 'mobx-react';
@observer
export class LegendMenu extends React.Component<{
    state: AppState,
    /** Save the legend options. Is triggered any time a value is changed */
    valuesChanged: (values: ILegend) => void,
}, {}>{

    private legend = this.props.state.legend;
    onTitleChange = (e) => {
        this.legend.title = e.target.value;
    }
    onMetaChange = (e) => {
        this.legend.meta = e.target.value;
    }
    onVisibleChange = (e) => {
        this.legend.visible = e.currentTarget.checked;
    }
    onHorizontalChange = (e) => {
        this.legend.horizontal = e.currentTarget.checked;
    }
    onPercentageChange = (e) => {
        this.legend.showPercentages = e.currentTarget.checked;
    }
    // componentDidUpdate() {
    //     let info: ILegend = {
    //         horizontal: this.state.horizontal,
    //         showPercentages: this.state.showPercentages,
    //         visible: this.state.visible,
    //         title: this.state.title,
    //         meta: this.state.meta
    //     }
    //     this.props.valuesChanged(info);
    // }
    render() {
        return (this.props.state.visibleMenu !== 5 ? null :
            <div className="mapify-options">
                <label htmlFor='showLegend'>Show legend
                    <input id='showLegend' type='checkbox' checked={this.legend.visible} onChange={this.onVisibleChange }/>
                </label>
                <br/>
                <label>Title</label>
                <input type='text' style={{ width: '100%' }} value={this.legend.title} onChange={this.onTitleChange }/>
                <br/>
                <label>Meta</label>
                <textarea
                    style={{ width: '100%', height: 50 }}
                    rows={5}
                    value={this.legend.meta}
                    onChange={this.onMetaChange }/>
                <br/>
                <label htmlFor='showPercentages'>Show distribution
                    <input id='showPercentages' type='checkbox' checked={this.legend.showPercentages} onChange={this.onPercentageChange }/>
                </label>
                <br/>
                <label htmlFor='makeHorizontal'>Align horizontally
                    <input id='makeHorizontal' type='checkbox' checked={this.legend.horizontal} onChange={this.onHorizontalChange }/>
                </label>
                <br/>
                <i>TIP: drag the legend on screen to place it where you wish</i>
            </div >)
    }
}
