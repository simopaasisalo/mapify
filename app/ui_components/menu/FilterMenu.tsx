import * as React from 'react';
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
                customSteps: [],
                customStepCount: 5,
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
    getMinMax(field: string) {
        let minVal: number; let maxVal: number;
        this.props.layer.geoJSON.features.map(function(feat) {
            let val = feat.properties[field];
            if (!minVal && !maxVal) {
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
        if (this.state.customSteps.length == 0) {
            let steps: [number, number][] = [];

            for (let i = this.state.minVal; i < this.state.maxVal; i += (this.state.maxVal - this.state.minVal) / this.state.customStepCount) {
                let step: [number, number] = [i, i + (this.state.maxVal - this.state.minVal) / this.state.customStepCount];
                steps.push(step);
            }
            let row = 0;
            for (let i of steps) {
                rows.push(
                    <li key={i}>
                        <input
                            id={row + 'min'}
                            type='number'
                            defaultValue={i[0].toFixed(2) }
                            style={inputStyle}/>
                        -
                        <input
                            id={row + 'max'}
                            type='number'
                            defaultValue={i[1].toFixed(2) }
                            style={inputStyle}/>
                    </li>);
                row++;
            }
        }
        return <div>
            <button onClick={this.changeStepsCount.bind(this, -1) }>-</button>
            <button onClick={this.changeStepsCount.bind(this, 1) }>+</button>
            <ul id='customSteps' style={{ listStyle: 'none' }}>{rows.map(function(r) { return r }) }</ul>
        </div>
    }
    filterTitleChanged(e) {
        this.setState({ filterTitle: e.target.value });
    }
    filterChanged(id: number) {
        this.setState({
            selectedFilterId: id,
            filterTitle: this.props.filters.filter(function(f) { return f.id = id })[0].title
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
        let id = this.props.addFilterToMap({ id: this.state.selectedFilterId, title: this.state.filterTitle, fieldToFilter: this.state.selectedField, minValue: this.state.minVal, maxValue: this.state.maxVal, steps: steps });
        this.setState({
            selectedFilterId: id,

        });
    }

    getStepValues() {
        let steps: [number, number][] = [];

        let list = document.getElementById('customSteps');
        for (let i = 0; i < this.state.customStepCount; i++) {
            let step: [number, number] = [+list.childNodes[i].childNodes.item(0).attributes['value'].nodeValue,
                +list.childNodes[i].childNodes.item(2).attributes['value'].nodeValue];
            steps.push(step)
        }
        return steps;
    }
    render() {
        let filters = [];
        for (let i in this.props.filters) {
            filters.push({ value: this.props.filters[i].id, label: this.props.filters[i].title });
        }

        return !this.props.isVisible ? null :
            <div className="mapify-options">
                {filters.length > 0 && this.state.selectedFilterId !== -1 ?
                    <div>
                        <label>Select the filter to update</label>
                        <Select
                            options={filters}
                            onChange={this.filterChanged.bind(this) }
                            value={this.state.selectedFilterId}
                            />
                        <p>Or</p>
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
                {this.state.useCustomSteps && this.state.minVal && this.state.maxVal ?
                    <div>
                        {this.renderSteps() }
                    </div>
                    : null}
                <label>Give a name to the filter</label>
                <input type="text" onChange={this.filterTitleChanged.bind(this) } value={this.state.filterTitle}/>
                <button onClick={this.saveFilter.bind(this) }>Create filter</button>
            </div>
    }
}
