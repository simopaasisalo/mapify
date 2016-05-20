import * as React from 'react';
let Slider = require('react-slider');
let Draggable = require('react-draggable');
export class Filter extends React.Component<IOnScreenFilterProps, IOnScreenFilterStates>{
    constructor(props: IOnScreenFilterProps) {
        super(props);
        this.state =
            {
                lowerLimit: this.props.minValue - 1,
                upperLimit: this.props.maxValue + 1,
                step: -1,
                lockDistance: false,
            };

    }
    shouldComponentUpdate(nextProps: IOnScreenFilterProps, nextState: IOnScreenFilterStates) {
        return this.props.title !== nextProps.title ||
            this.props.minValue !== nextProps.minValue ||
            this.props.maxValue !== nextProps.maxValue ||
            this.props.steps !== nextProps.steps ||
            this.state.lowerLimit !== nextState.lowerLimit ||
            this.state.upperLimit !== nextState.upperLimit ||
            this.state.step !== nextState.step ||
            this.state.lockDistance !== nextState.lockDistance;
    }
    componentDidUpdate() {
        this.props.valueChanged(this.props.id, this.state.lowerLimit, this.state.upperLimit)

    }
    advanceSliderWhenLocked(lower, upper) {
        let minValDiff = this.state.lowerLimit - lower;
        let maxValDiff = this.state.upperLimit - upper;
        if (minValDiff != 0) {
            if (this.state.lowerLimit - minValDiff > this.props.minValue &&
                this.state.upperLimit - minValDiff < this.props.maxValue) {
                this.setState({
                    lowerLimit: this.state.lowerLimit - minValDiff,
                    upperLimit: this.state.upperLimit - minValDiff,
                });
            }
        }
        else if (maxValDiff != 0) {
            if (this.state.lowerLimit - maxValDiff > this.props.minValue &&
                this.state.upperLimit - maxValDiff < this.props.maxValue) {
                this.setState({
                    lowerLimit: this.state.lowerLimit - maxValDiff,
                    upperLimit: this.state.upperLimit - maxValDiff,
                });
            }
        }
    }
    filterScaleChanged(values) {

        if (this.state.lockDistance) {
            this.advanceSliderWhenLocked(values[0], values[1]);
        }
        else {
            this.setState({
                lowerLimit: values[0],
                upperLimit: values[1],
            })
        }
    }
    lowerLimitChanged(e) {
        let val = e.currentTarget.valueAsNumber
        if (val !== this.state.lowerLimit) {
            if (this.state.lockDistance) {
                this.advanceSliderWhenLocked(val, this.state.upperLimit);
            }
            else {
                this.setState({
                    lowerLimit: val
                });
            }

        }
    }
    upperLimitChanged(e) {
        let val = e.currentTarget.valueAsNumber
        if (val !== this.state.upperLimit) {
            if (this.state.lockDistance) {
                this.advanceSliderWhenLocked(this.state.lowerLimit, val);
            }
            else {
                this.setState({
                    upperLimit: val
                });
            }

        }
    }
    lockDistanceChanged(e) {
        this.setState({
            lockDistance: e.currentTarget.checked,
        });
    }
    customStepClicked(i: number) {
        let minVal = this.props.steps[i][0];
        let maxVal = this.props.steps[i][1];
        this.setState({
            lowerLimit: minVal,
            upperLimit: maxVal,
            step: i,
        });
    }
    renderSteps() {
        let rows = [];
        if (this.props.steps) {
            let index = 0;
            this.props.steps.forEach(function(step) {
                rows.push(
                    <div
                        style={{
                            borderBottom: '1px solid #6891e2',
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderLeft: this.state.step === index ? '6px solid #6891e2' : '',
                            borderRight: this.state.step === index ? '6px solid #6891e2' : ''

                        }}
                        key={step}
                        onClick={this.customStepClicked.bind(this, index) }
                        >{step[0] + '-' + step[1]}
                    </div>)
                index++;
            }, this);

        }
        return <div> {rows.map(function(e) { return e }) } </div>
    }

    onKeyDown(e) {
        if (e.keyCode == '38') {
            if (this.state.step) {
                this.setState({ step: this.state.step - 1 })
            }
        }
        else if (e.keyCode == '40') {
            if (this.state.step !== undefined) {
                this.setState({ step: this.state.step + 1 })
            }
        }
    }

    render() {
        return <Draggable
            handle={'.draggableHeader'}
            >
            <div className='filter'>
                <h2 className='draggableHeader'>{this.props.title}</h2>
                {this.renderSteps.call(this) }
                <span>
                    <input type='number' style={{ width: '60px' }} value={this.state.lowerLimit.toFixed(0) } onChange={this.lowerLimitChanged.bind(this) }/>
                    <label>Lock distance</label>
                    <input type='checkbox' checked={this.state.lockDistance} onChange={this.lockDistanceChanged.bind(this) }/>
                    <input type='number' style={{ float: 'right', width: '60px' }} value={this.state.upperLimit.toFixed(0) } onChange={this.upperLimitChanged.bind(this) }/>
                </span>
                <Slider className='horizontal-slider'
                    onChange={this.filterScaleChanged.bind(this) }
                    value={[this.state.lowerLimit, this.state.upperLimit]}
                    min={this.props.minValue - 1}
                    max={this.props.maxValue + 1}
                    withBars>
                    <div className='minHandle'></div>
                    <div className='maxHandle'></div>

                </Slider>

            </div>
        </Draggable>
    }
}
