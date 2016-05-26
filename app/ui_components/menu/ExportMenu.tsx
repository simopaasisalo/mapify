import * as React from 'react';

export class ExportMenu extends React.Component<IExportMenuProps, IExportMenuStates>{
    constructor() {
        super();
        this.state =
            {
                showLegend: true,
                showFilters: false,

            };
    }
    showLegendChanged(e) {
        this.setState({
            showLegend: e.currentTarget.checked
        });
    }
    showFiltersChanged(e) {
        this.setState({
            showFilters: e.currentTarget.checked
        });
    }
    saveImage() {
        this.props.saveImage(this.state);
    }
    saveFile() {
        this.props.saveFile();
    }
    render() {
        return (
            this.props.isVisible ?
                <div>
                    <label htmlFor='showLegend'>Show legend on the image</label>
                    <input id='showLegend' type='checkbox' checked={this.state.showLegend} onChange={this.showLegendChanged.bind(this) }/>
                    <br/>
                    <label htmlFor='showFilters'>Show filters on the image</label>
                    <input id='showFilters' type='checkbox' checked={this.state.showFilters} onChange={this.showFiltersChanged.bind(this) }/>
                    <br/>
                    <button className='menuButton' onClick={this.saveImage.bind(this) }>Export map as image</button>
                    <br/>
                    Or
                    <br/>
                    <button className='menuButton' onClick={this.saveFile.bind(this) }>Export map as a file</button>

                </div>
                : null
        )
    }
}
