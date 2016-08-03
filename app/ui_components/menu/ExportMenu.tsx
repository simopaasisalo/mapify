import * as React from 'react';
import { AppState, ExportMenuState } from '../Stores/States';
import { observer } from 'mobx-react';

@observer
export class ExportMenu extends React.Component<{
    state: AppState,
    /** Save map as a .png image*/
    saveImage: () => void,
    /** Save map as a .mapify file*/
    saveFile: () => void,
}, {}>{
    onShowLegendChange = (e) => {
        this.props.state.exportMenuState.showLegend = e.currentTarget.checked;
    }
    onShowFiltersChange = (e) => {
        this.props.state.exportMenuState.showFilters = e.currentTarget.checked;
    }
    onSaveImage = () => {
        this.props.saveImage();
    }
    onSaveFile = () => {
        this.props.saveFile();
    }
    render() {
        return (
            this.props.state.visibleMenu === 7 ?
                <div>
                    <label htmlFor='showLegend'>Show legend on the image</label>
                    <input id='showLegend' type='checkbox' checked={this.props.state.exportMenuState.showLegend} onChange={this.onShowLegendChange}/>
                    <br/>
                    <label htmlFor='showFilters'>Show filters on the image</label>
                    <input id='showFilters' type='checkbox' checked={this.props.state.exportMenuState.showFilters} onChange={this.onShowFiltersChange}/>
                    <br/>
                    <button className='menuButton' onClick={this.onSaveImage}>Download map as image</button>
                    <br/>
                    Or
                    <br/>
                    <button className='menuButton' onClick={this.onSaveFile}>Download map as a file</button>

                </div>
                : null
        )
    }
}
