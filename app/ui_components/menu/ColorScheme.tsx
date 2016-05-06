import * as React from 'react';
let chroma = require('chroma-js');

export class ColorScheme extends React.Component<IColorSchemeProps, {}>{

    render() {
        let style = {
            display: 'flex',
            flexDirection: 'row',
            color: 'rgba(0,0,0,0)',
            margin: 0
        }
        return <div style={style} key={name}>{this.getChromaScale(this.props.revert, this.props.gradientName, 100) }</div>;
    }
    shouldComponentUpdate(nextProps: IColorSchemeProps, nextState) {
        return nextProps.gradientName != this.props.gradientName ||
            nextProps.revert != this.props.revert;
    }

    getChromaScale(revert: boolean, chromaString: string, steps: number) {
        let inDivs = [];
        let cs = chroma.scale(chromaString).mode('lab').correctLightness(true).domain([0, steps]);
        for (let i = 0; i < steps; i++) {
            let style = {
                background: revert ? cs(steps - i).hex() : cs(i).hex(),
                height: 40,
                width: '100%', //total width of item / steps
                display: 'inline-block'
            }
            inDivs.push(<div key={cs(i) + i} style={style}/>);
        }

        return inDivs;
    }


}
