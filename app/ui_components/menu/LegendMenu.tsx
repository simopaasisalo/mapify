import * as React from 'react';
import {AppState} from '../Stores/States';
import {Legend} from '../Stores/Legend';
import {observer} from 'mobx-react';
import {TextEditor} from '../misc/TextEditor';
let Modal = require('react-modal');
@observer
export class LegendMenu extends React.Component<{
    state: AppState,
}, {}>{

    onTitleChange = (e) => {
        this.props.state.legend.title = e.target.value;
    }

    onMetaEditChange = (e) => {
        this.props.state.legendMenuState.metaEditOpen = !this.props.state.legendMenuState.metaEditOpen;
    }

    onMetaChange = (e) => {
        this.props.state.legend.meta = e.target.value;
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
        return (this.props.state.visibleMenu !== 5 ? null :
            <div className="mapify-options">
                <label htmlFor='showLegend'>Show legend
                    <input id='showLegend' type='checkbox' checked={legend.visible} onChange={this.onVisibleChange }/>
                </label>
                <br/>
                <label>Title</label>
                <input type='text' style={{ width: '100%' }} value={legend.title} onChange={this.onTitleChange }/>
                <br/>
                <button onClick={this.onMetaEditChange}>Edit meta information</button>
                <Modal
                    isOpen={this.props.state.legendMenuState.metaEditOpen}
                    style={metaStyle}
                    >

                    <TextEditor
                        style={{ width: '100%', height: 50 }}
                        content={legend.meta}
                        onChange={this.onMetaChange }/>
                </Modal>

                <br/>
                <label htmlFor='showPercentages'>Show distribution
                    <input id='showPercentages' type='checkbox' checked={legend.showPercentages} onChange={this.onPercentageChange }/>
                </label>
                <br/>
                <label htmlFor='makeHorizontal'>Align horizontally
                    <input id='makeHorizontal' type='checkbox' checked={legend.horizontal} onChange={this.onHorizontalChange }/>
                </label>
                <br/>
                <i>TIP: drag the legend on screen to place it where you wish</i>
            </div >)
    }
}
