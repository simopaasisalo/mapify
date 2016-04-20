import * as React from 'react';
let Slider = require('react-slider');
let Draggable = require('react-draggable');
export class Filter extends React.Component<IOnScreenFilterProps, IOnScreenFilterStates>{
    constructor(props: IOnScreenFilterProps) {
        super(props);
        this.state =
            {
                lowerLimit: this.props.minValue,
                upperLimit: this.props.maxValue,
                step: 1,
                lockDistance: false,
            };

    }
    filterScaleChanged(values) {

        if (this.state.lockDistance) {
            let minValDiff = this.state.lowerLimit - values[0];
            let maxValDiff = this.state.upperLimit - values[1];
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
        else {
            this.setState({
                lowerLimit: values[0],
                upperLimit: values[1],
            })
        }
        this.props.valueChanged(this.props.title, this.state.lowerLimit, this.state.upperLimit)
    }
    stepChanged(val) {
        this.setState({
            step: val.currentTarget.valueAsNumber
        });
    }
    lockDistanceChanged(val) {
        this.setState({
            lockDistance: val.currentTarget.checked,
        });
    }

    render() {
        return <Draggable
            handle={'.filterTitle'}
            >

            <div className='filter'>
                <h2 className='filterTitle'>{this.props.title}</h2>
                <i>{this.state.lowerLimit }</i>
                <i style={{ float: 'right' }}>{this.state.upperLimit }</i>
                <Slider className='horizontal-slider'
                    onChange={this.filterScaleChanged.bind(this) }
                    value={[this.state.lowerLimit, this.state.upperLimit]}
                    min={this.props.minValue}
                    max={this.props.maxValue}
                    step={this.state.step}
                    withBars>
                    <div className='minHandle'></div>
                    <div className='maxHandle'></div>

                </Slider>
                <div>
                    <div>
                        <h4>Slider step</h4>
                        <input type="number" value={this.state.step} onChange={this.stepChanged.bind(this) }/>
                    </div>
                    <div>
                        <h4>Lock distance</h4>
                        <input type="checkbox" checked={this.state.lockDistance} onChange={this.lockDistanceChanged.bind(this) }/>
                    </div>
                </div>

            </div>
        </Draggable>
    }
}
