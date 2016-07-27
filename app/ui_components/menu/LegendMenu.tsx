import * as React from 'react';
import { AppState } from '../Stores/States';
import { Legend } from '../Stores/Legend';
import { observer } from 'mobx-react';
import { TextEditor } from '../misc/TextEditor';
let Modal = require('react-modal');
@observer
export class LegendMenu extends React.Component<{
    state: AppState,
}, {}>{

    onTitleChange = (e) => {
        this.props.state.legend.title = e.target.value;
    }

    onEditChange = (e) => {
        this.props.state.legend.edit = e.currentTarget.checked;
    }
    onVisibleChange = (e) => {
        this.props.state.legend.visible = e.currentTarget.checked;
    }
    onHorizontalChange = (e) => {
        this.props.state.legend.horizontal = e.currentTarget.checked;
    }
    onPercentageChange = (e) => {
        this.props.state.legend.showPercentages = e.currentTarget.checked;
    }
    render() {
        if (this.props.state.visibleMenu !== 5)
            return <div/>
        let legend = this.props.state.legend;
        let metaStyle = {
            overlay: {
                position: 'fixed',
                height: 600,
                width: 300,
                right: 230,
                bottom: '',
                top: 20,
                left: '',
                backgroundColor: ''

            },
            content: {
                border: '4px solid #6891e2',
                borderRadius: '15px',
                padding: '0px',
                height: 650,
                width: 300,
                right: '',
                bottom: '',
                top: '',
                left: '',
            }
        }
        return (
            <div className="mapify-options">
                <label htmlFor='showLegend'>Show legend
                    <input id='showLegend' type='checkbox' checked={legend.visible} onChange={this.onVisibleChange}/>
                </label>
                <br/>
                <label>Title</label>
                <input type='text' style={{ width: '100%' }} value={legend.title} onChange={this.onTitleChange}/>
                <br/>
                <label htmlFor='showEdit'>Show legend edit options
                    <input id='showEdit' type='checkbox' checked={legend.edit} onChange={this.onEditChange}/>
                </label>
                <br/>
                <label htmlFor='showPercentages'>Show distribution
                    <input id='showPercentages' type='checkbox' checked={legend.showPercentages} onChange={this.onPercentageChange}/>
                </label>
                <br/>
                <label htmlFor='makeHorizontal'>Align horizontally
                    <input id='makeHorizontal' type='checkbox' checked={legend.horizontal} onChange={this.onHorizontalChange}/>
                </label>
                <br/>
                <i>TIP: drag the legend on screen to place it where you wish</i>
            </div >)
    }
}
