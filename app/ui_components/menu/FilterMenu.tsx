import * as React from 'react';
import {LayerTypes, SymbolTypes} from './../common_items/common';
let Select = require('react-select');


export class FilterMenu extends React.Component<IFilterMenuProps, IFilterMenuStates>{
    constructor(props: IFilterMenuProps) {
        super(props);
        this.state =
            {
                selectedFilterId: -1,
                filterTitle: '',
                selectedField: '',
                useCustomSteps: false,
                useDistinctValues: false,
                customSteps: [],
                customStepCount: 5,
                remove: true,
            };
    }
    filterVariableChanged(val) {
        this.getMinMax(val.value)

        this.setState({
            selectedField: val.value,
            filterTitle: this.state.filterTitle ? this.state.filterTitle : val.value + '-filter'
        });
    }
    useStepsChanged(e) {
        this.setState({ useCustomSteps: e.target.checked });
    }

    useDistinctValuesChanged(e) {
        this.setState({
            useDistinctValues: e.target.checked,
            customStepCount: this.getDistinctValues(this.state.selectedField).length - 1,
        });

    }
    getMinMax(field: string) {
        let minVal: number; let maxVal: number;
        this.props.layer.geoJSON.features.map(function(feat) {
            let val = feat.properties[field];
            if (minVal === undefined && maxVal === undefined) {
                minVal = val;
                maxVal = val;
            }
            else {
                if (val < minVal)
                    minVal = val;
                if (val > maxVal)
                    maxVal = val;
            }
        });
        this.setState({
            minVal: minVal,
            maxVal: maxVal,
        });


    }

    getDistinctValues(field: string) {
        let values: number[] = [];
        this.props.layer.geoJSON.features.map(function(feat) {
            let val = feat.properties[field];
            if (values.indexOf(val) === -1)
                values.push(val)

        });

        return values.sort(function(a, b) { return a - b });
    }
    changeStepsCount(amount: number) {
        let newVal = this.state.customStepCount + amount;
        if (newVal > 0) {
            this.setState({
                customStepCount: newVal,
            });
        }
    }

    renderSteps() {
        let rows = [];
        let inputStyle = {
            display: 'inline',
            width: 100
        }
        if (this.state.customSteps.length === 0) {
            let steps: [number, number][] = [];

            if (!this.state.useDistinctValues) {
                for (let i = this.state.minVal; i < this.state.maxVal; i += (this.state.maxVal - this.state.minVal) / this.state.customStepCount) {
                    let step: [number, number] = [i, i + (this.state.maxVal - this.state.minVal) / this.state.customStepCount - 1];
                    steps.push(step);
                }
            }
            else {
                let values = this.getDistinctValues(this.state.selectedField);
                for (let i = 0; i < values.length - 1; i++) {
                    let step: [number, number] = [values[i], values[i + 1] - 1];
                    steps.push(step);
                }
            }
            let row = 0;
            for (let i of steps) {
                rows.push(
                    <li key={i}>
                        <input
                            id={row + 'min'}
                            type='number'
                            defaultValue={i[0].toFixed(2) }
                            style={inputStyle}
                            step='any'/>
                        -
                        <input
                            id={row + 'max'}
                            type='number'
                            defaultValue={i[1].toFixed(2) }
                            style={inputStyle}
                            step='any'/>
                    </li>);
                row++;
            }
        }
        return <div>
            <button onClick={this.changeStepsCount.bind(this, -1) }>-</button>
            <button onClick={this.changeStepsCount.bind(this, 1) }>+</button>
            <ul id='customSteps' style={{ listStyle: 'none', padding: 0 }}>{rows.map(function(r) { return r }) }</ul>
        </div>
    }
    filterTitleChanged(e) {
        this.setState({ filterTitle: e.target.value });
    }
    filterSelectChanged(id: ISelectData) {
        this.setState({
            selectedFilterId: id.value,
            filterTitle: this.props.filters.filter(function(f) { return f.id === id.value })[0].title
        });
    }
    createNewFilter() {
        this.setState({
            selectedFilterId: -1,
            filterTitle: '',
        });
    }
    saveFilter() {
        let steps;
        if (this.state.useCustomSteps) {
            steps = this.getStepValues();
        }
        let id = this.props.addFilterToMap({
            id: this.state.selectedFilterId,
            title: this.state.filterTitle,
            fieldToFilter: this.state.selectedField,
            totalMin: this.state.minVal,
            totalMax: this.state.maxVal,
            steps: steps,
            remove: this.state.remove,
            layerDataId: this.props.layer.id,
        });
        this.setState({
            selectedFilterId: id,

        });
    }
    deleteFilter() {
        this.props.deleteFilter(this.state.selectedFilterId);
        this.setState({ selectedFilterId: - 1 })
    }
    getStepValues() {
        let steps: [number, number][] = [];
        for (let i = 0; i < this.state.customStepCount; i++) {
            let step: [number, number] = [+(document.getElementById(i + 'min') as any).value,
                +(document.getElementById(i + 'max') as any).value];
            steps.push(step)
        }
        return steps;
    }
    changeFilterMethod(remove: boolean) {
        this.setState(
            {
                remove: remove
            });
    }

    render() {
        let filters = [];
        for (let i in this.props.filters) {
            filters.push({ value: this.props.filters[i].id, label: this.props.filters[i].title });
        }

        return !this.props.isVisible ? null :
            <div className="mapify-options">
                <label>Give a name to the filter</label>
                <input type="text" onChange={this.filterTitleChanged.bind(this) } value={this.state.filterTitle}/>
                {filters.length > 0 && this.state.selectedFilterId !== -1 ?
                    <div>
                        <label>Select the filter to update</label>
                        <Select
                            options={filters}
                            onChange={this.filterSelectChanged.bind(this) }
                            value={this.state.selectedFilterId}
                            />
                        Or
                        <button onClick={this.createNewFilter.bind(this) }>Create new filter</button>
                    </div>
                    : null}
                {this.state.selectedFilterId === -1 ?
                    <div>
                        <label>Select the variable by which to filter</label>
                        <Select
                            options={this.props.layer.headers}
                            onChange={this.filterVariableChanged.bind(this) }
                            value={this.state.selectedField}
                            />
                    </div>
                    : null}
                <label forHTML='steps'>
                    Use predefined steps
                    <input
                        type='checkbox'
                        onChange={this.useStepsChanged.bind(this) }
                        checked={this.state.useCustomSteps}
                        id='steps'
                        />
                    <br/>
                </label>
                {this.state.useCustomSteps && this.state.minVal !== undefined && this.state.maxVal !== undefined ?
                    <div>
                        <label forHTML='dist'>
                            Use distinct values
                            <input
                                type='checkbox'
                                onChange={this.useDistinctValuesChanged.bind(this) }
                                checked={this.state.useDistinctValues}
                                id='dist'
                                />
                            <br/>
                        </label>
                        {this.renderSteps() }
                    </div>
                    : null}
                {this.props.layer.layerType === LayerTypes.HeatMap ||
                    (this.props.layer.visOptions.symbolOptions.symbolType === SymbolTypes.Icon ||
                        this.props.layer.visOptions.symbolOptions.symbolType === SymbolTypes.Chart) ? null :
                    < div >
                        <label forHTML='remove'>
                            Remove filtered items
                            <input
                                type='radio'
                                onChange={this.changeFilterMethod.bind(this, true) }
                                checked={this.state.remove}
                                name='filterMethod'
                                id='remove'
                                />
                        </label>
                        <br/>
                        Or
                        <br/>

                        <label forHTML='opacity'>
                            Change opacity
                            <input
                                type='radio'
                                onChange={this.changeFilterMethod.bind(this, false) }
                                checked={!this.state.remove}
                                name='filterMethod'
                                id='opacity'
                                />

                        </label>
                    </div>
                }
                <button className='menuButton' onClick={this.saveFilter.bind(this) }>Save filter</button>
                {filters.length > 0 && this.state.selectedFilterId !== -1 ?
                    <button className='menuButton' onClick={this.deleteFilter.bind(this) }>Delete filter</button>
                    : null}
            </div >
    }
}
