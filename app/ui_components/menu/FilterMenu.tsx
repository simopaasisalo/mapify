import * as React from 'react';
let Select = require('react-select');

export class FilterMenu extends React.Component<IFilterMenuProps, IFilterMenuStates>{
    constructor(props: IFilterMenuProps) {
        super(props);
        this.state =
            {
                filterTitle: '',
                selectedField: '',

            };
    }
    shouldComponentUpdate(nextProps: IFilterMenuProps, nextState: IFilterMenuStates) {
        return nextProps.isVisible !== this.props.isVisible ||
            nextProps.headers !== this.props.headers ||
            nextState.selectedField !== this.state.selectedField ||
            nextState.filterTitle !== this.state.filterTitle;
    }
    filterVariableChanged(val) {
        this.setState({
            selectedField: val.value,
            filterTitle: this.state.filterTitle ? this.state.filterTitle : val.value
        });
    }
    filterTitleChanged(e) {
        this.setState({ filterTitle: e.target.value })
    }
    createFilter() {
        this.props.addFilterToMap({ title: this.state.filterTitle, layer: null, fieldToFilter: this.state.selectedField });
    }
    render() {
        return !this.props.isVisible ? null :
            <div>
                <h4>Select the variable by which to filter</h4>
                <Select
                    options={this.props.headers}
                    onChange={this.filterVariableChanged.bind(this) }
                    value={this.state.selectedField}
                    />
                <h4>Give a name to the filter</h4>
                <input type="text" onChange={this.filterTitleChanged.bind(this) } value={this.state.filterTitle}/>
                <button onClick={this.createFilter.bind(this) }>Create filter</button>
            </div>
    }
}
