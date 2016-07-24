import * as React from 'react';

export class TextEditor extends React.Component<{ content: string, style: any, onChange }, { html: string }>{

    componentWillMount() {
        this.state = { html: this.props.content ? this.props.content : '' }
    }
    emitChange() {
        let editor = this.refs['editor'];
        let newHtml = (editor as any).innerHTML;
        this.props.onChange({
            target: {
                value: newHtml
            }
        });
        this.setState({ html: newHtml });

    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            html: nextProps.content
        });
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.content !== this.state.html;
    }

    addLink() {
        let linkURL = prompt('Enter a URL:', 'http://');
        if (linkURL !== null) {
            let selection = document.getSelection().toString();
            let linkText = selection === '' ? prompt('Enter the link text:', linkURL) : selection;
            if (linkText != null)
                this.execCommand('insertHTML', '<a href="' + linkURL + '" target="_blank">' + linkText + '</a>');
        }
    }

    execCommand(command, arg) {
        document.execCommand(command, false, arg);
    }

    render() {
        // customize css rules here
        var buttonSpacing = { marginRight: 2 },
            toolbarStyle = { marginBottom: 3 };

        return (
            <div>
                <div style={toolbarStyle}>

                    <div className="btn-group" style={buttonSpacing}>
                        <button
                            className="btn btn-default btn-xs dropdown-toggle"
                            type="button" data-toggle="dropdown"
                            aria-expanded="true">
                            <i className="fa fa-paragraph"></i> <i className="fa fa-caret-down"></i>
                        </button>
                        <ul className="dropdown-menu" role="menu">
                            <li>
                                <a href="javascript:;" onClick={this.execCommand.bind(this, 'formatBlock', 'P') }>
                                    Paragraph
                                </a>
                                <a href="javascript:;" onClick={this.execCommand.bind(this, 'formatBlock', 'BLOCKQUOTE') }>
                                    Block Quote
                                </a>
                                <a href="javascript:;" onClick={this.execCommand.bind(this, 'formatBlock', 'H1') }>
                                    Header 1
                                </a>
                                <a href="javascript:;" onClick={this.execCommand.bind(this, 'formatBlock', 'H2') }>
                                    Header 2
                                </a>
                                <a href="javascript:;" onClick={this.execCommand.bind(this, 'formatBlock', 'H3') }>
                                    Header 3
                                </a>
                                <a href="javascript:;" onClick={this.execCommand.bind(this, 'formatBlock', 'H4') }>
                                    Header 4
                                </a>
                                <a href="javascript:;" onClick={this.execCommand.bind(this, 'formatBlock', 'H5') }>
                                    Header 5
                                </a>
                                <a href="javascript:;" onClick={this.execCommand.bind(this, 'formatBlock', 'H6') }>
                                    Header 6
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="btn-group btn-group-xs" role="group" style={buttonSpacing}>
                        <button type="button" className="btn btn-default" onClick={this.execCommand.bind(this, 'bold') }>
                            <i className="fa fa-bold"></i>
                        </button>
                        <button type="button" className="btn btn-default" onClick={this.execCommand.bind(this, 'italic') }>
                            <i className="fa fa-italic"></i>
                        </button>
                        <button type="button" className="btn btn-default" onClick={this.execCommand.bind(this, 'underline') }>
                            <i className="fa fa-underline"></i>
                        </button>
                        <button type="button" className="btn btn-default" onClick={this.execCommand.bind(this, 'strikeThrough') }>
                            <i className="fa fa-strikethrough"></i>
                        </button>

                        <div className="btn-group" role="group">
                            <button
                                className="btn btn-default btn-xs dropdown-toggle"
                                type="button" data-toggle="dropdown"
                                aria-expanded="true">
                                <i className="fa fa-text-height"></i> <i className="fa fa-caret-down"></i>
                            </button>
                            <ul className="dropdown-menu" role="menu">
                                <li>
                                    <a href="javascript:;" onClick={this.execCommand.bind(this, 'fontSize', 1) }>1</a>
                                </li>
                                <li>
                                    <a href="javascript:;" onClick={this.execCommand.bind(this, 'fontSize', 2) }>2</a>
                                </li>
                                <li>
                                    <a href="javascript:;" onClick={this.execCommand.bind(this, 'fontSize', 3) }>3</a>
                                </li>
                                <li>
                                    <a href="javascript:;" onClick={this.execCommand.bind(this, 'fontSize', 4) }>4</a>
                                </li>
                                <li>
                                    <a href="javascript:;" onClick={this.execCommand.bind(this, 'fontSize', 5) }>5</a>
                                </li>
                                <li>
                                    <a href="javascript:;" onClick={this.execCommand.bind(this, 'fontSize', 6) }>6</a>
                                </li>
                                <li>
                                    <a href="javascript:;" onClick={this.execCommand.bind(this, 'fontSize', 7) }>7</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="btn-group btn-group-xs" role="group" style={buttonSpacing}>
                        <button type="button" className="btn btn-default" onClick={this.execCommand.bind(this, 'insertOrderedList') }>
                            <i className="fa fa-list-ol"></i>
                        </button>
                        <button type="button" className="btn btn-default" onClick={this.execCommand.bind(this, 'insertUnorderedList') }>
                            <i className="fa fa-list-ul"></i>
                        </button>
                    </div>

                    <div className="btn-group" style={buttonSpacing}>
                        <button
                            className="btn btn-default btn-xs dropdown-toggle"
                            type="button"
                            data-toggle="dropdown"
                            aria-expanded="false">
                            <i className="fa fa-align-left"></i> <i className="fa fa-caret-down"></i>
                        </button>
                        <ul className="dropdown-menu" role="menu">
                            <li>
                                <a href="javascript:;" onClick={this.execCommand.bind(this, 'justifyLeft') }>Align Left</a>
                            </li>
                            <li>
                                <a href="javascript:;" onClick={this.execCommand.bind(this, 'justifyRight') }>Align Right</a>
                            </li>
                            <li>
                                <a href="javascript:;" onClick={this.execCommand.bind(this, 'justifyCenter') }>Align Center</a>
                            </li>
                            <li>
                                <a href="javascript:;" onClick={this.execCommand.bind(this, 'justifyFull') }>Align Justify</a>
                            </li>
                        </ul>
                    </div>

                    <button
                        type="button"
                        className="btn btn-default btn-xs"
                        onClick={this.addLink.bind(this) }>
                        <i className="fa fa-link"></i>
                    </button>

                    <button
                        type="button"
                        className="btn btn-default btn-xs"
                        onClick={this.execCommand.bind(this, 'removeFormat') }>
                        <i className="fa fa-eraser"></i>
                    </button>
                </div>

                <div
                    ref="editor"
                    className="form-control"
                    {...this.props}
                    contentEditable="true"
                    dangerouslySetInnerHTML={{ __html: this.props.content }}
                    onInput={this.emitChange.bind(this) } />
            </div>
        );
    }
};
