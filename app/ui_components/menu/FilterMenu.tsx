import * as React from 'react';
let Select = require('react-select');

export class FilterMenu extends React.Component<IFilterMenuProps, IFilterMenuStates>{
    constructor(props: IFilterMenuProps) {
        super(props);
        this.state =
            {
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
            filterTitle: this.state.filterTitle ? this.state.filterTitle : val.value
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
        return <ul id='customSteps' style={{ listStyle: 'none' }}>{rows.map(function(r) { return r }) }</ul>
    }
    filterTitleChanged(e) {
        this.setState({ filterTitle: e.target.value });
    }
    createFilter() {
        let steps;
        if (this.state.useCustomSteps) {
            steps = this.getStepValues();
        }
        this.props.addFilterToMap({ id: 0, title: this.state.filterTitle, fieldToFilter: this.state.selectedField, minValue: this.state.minVal, maxValue: this.state.maxVal, steps: steps });
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
        return !this.props.isVisible ? null :
            <div className="mapify-options">
                <label>Select the variable by which to filter</label>
                <Select
                    options={this.props.layer.headers}
                    onChange={this.filterVariableChanged.bind(this) }
                    value={this.state.selectedField}
                    />
                <label forHTML='steps'>
                    Set steps
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
                <button onClick={this.createFilter.bind(this) }>Create filter</button>
            </div>
    }
}
