import * as React from 'react';

export class LayerMenuItem extends React.Component<{ sortData: string, className: string }, {}>{
    render() {
        return (
            <div {...this.props}>
                {this.props.children}
            </div>
        );
    }
}
