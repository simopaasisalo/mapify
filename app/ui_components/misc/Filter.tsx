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
                step: 1,
                lockDistance: false,
            };

    }
    componentDidUpdate() {
        this.props.valueChanged(this.props.title, this.state.lowerLimit, this.state.upperLimit)

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
    stepChanged(e) {
        this.setState({
            step: e.currentTarget.valueAsNumber
        });
    }
    lockDistanceChanged(e) {
        this.setState({
            lockDistance: e.currentTarget.checked,
        });
    }

    render() {
        return <Draggable
            handle={'.filterTitle'}
            >

            <div className='draggable'>
                <h2 className='filterTitle'>{this.props.title}</h2>
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
                    step={this.state.step}
                    withBars>
                    <div className='minHandle'></div>
                    <div className='maxHandle'></div>

                </Slider>
                <div>

                </div>

            </div>
        </Draggable>
    }
}
