import React, { cloneElement } from 'react';
import classNames from 'classnames';
import Collapse from './fixtures/Collapse';
import ClassNameMixin from './mixins/ClassNameMixin';


let Panel = React.createClass({
    mixins: [ClassNameMixin],
    propTypes: {
        collapsible: React.PropTypes.bool,
        header: React.PropTypes.node,
        id: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        defaultExpanded: React.PropTypes.bool,
        expanded: React.PropTypes.bool,
        eventKey: React.PropTypes.any,
        headerRole: React.PropTypes.string,
        panelRole: React.PropTypes.string,
        classPrefix: React.PropTypes.string,

        //Events
        onSelect: React.PropTypes.func,
        onEnter: Collapse.propTypes.onEnter,
        onEntering: Collapse.propTypes.onEntering,
        onEntered: Collapse.propTypes.onEntered,
        onExit: Collapse.propTypes.onExit,
        onExiting: Collapse.propTypes.onExiting,
        onExited: Collapse.propTypes.onExited
    },

    getDefaultProps() {
        return {
            defaultExpanded: false,
            shape:'default',
            classPrefix:'panel'
        };
    },

    getInitialState() {
        return {
            expanded: this.props.defaultExpanded
        };
    },

    handleSelect(e) {
        e.persist();
        e.selected = true;

        if (this.props.onSelect) {
            this.props.onSelect(this.props.eventKey, e);
        } else {
            e.preventDefault();
        }

        if (e.selected) {
            this.handleToggle();
        }
    },

    handleToggle() {
        this.setState({
            expanded: !this.state.expanded
        });
    },

    isExpanded() {
        return this.props.expanded !== null ? this.props.expanded : this.state.expanded;
    },

    renderCollapsibleBody(panelRole) {
        let collapseProps = {
            onEnter: this.props.onEnter,
            onEntering: this.props.onEntering,
            onEntered: this.props.onEntered,
            onExit: this.props.onExit,
            onExiting: this.props.onExiting,
            onExited: this.props.onExited,
            in: this.isExpanded()
        };
        let props = {
            className: this.prefix('collapse'),
            id: this.props.id,
            ref: 'panel',
            'aria-hidden': !this.isExpanded()
        };
        if (panelRole) {
            props.role = panelRole;
        }

        return (
            <Collapse {...collapseProps}>
                <div {...props}>
                    {this.renderBody() }

                </div>
            </Collapse>
        );
    },

    renderBody() {
        let allChildren = this.props.children;
        let bodyElements = [];
        let panelBodyChildren = [];
        let bodyClass = this.prefix('body');

        function getProps() {
            return {
                key: bodyElements.length
            };
        }

        function addPanelChild(child) {
            bodyElements.push(cloneElement(child, getProps()));
        }

        function addPanelBody(children) {
            bodyElements.push(
                <div className={bodyClass} {...getProps() }>
                    {children}
                </div>
            );
        }

        function maybeRenderPanelBody() {
            if (panelBodyChildren.length === 0) {
                return;
            }

            addPanelBody(panelBodyChildren);
            panelBodyChildren = [];
        }

        // Handle edge cases where we should not iterate through children.
        if (!Array.isArray(allChildren) || allChildren.length === 0) {
            if (this.shouldRenderFill(allChildren)) {
                addPanelChild(allChildren);
            } else {
                addPanelBody(allChildren);
            }
        } else {
            allChildren.forEach(child => {
                if (this.shouldRenderFill(child)) {
                    maybeRenderPanelBody();

                    // Separately add the filled element.
                    addPanelChild(child);
                } else {
                    panelBodyChildren.push(child);
                }
            });

            maybeRenderPanelBody();
        }

        return bodyElements;
    },

    shouldRenderFill(child) {
        return React.isValidElement(child) && child.props.fill !== null;
    },

    renderHeading(headerRole) {
        let header = this.props.header;

        if (!header) {
            return null;
        }

        if (!React.isValidElement(header) || Array.isArray(header)) {
            header = this.props.collapsible ? this.renderCollapsibleTitle(header, headerRole) : header;
        } else {
            const className = classNames(
                this.prefix('title'),
                header.props.className
            );

            if (this.props.collapsible) {
                header = cloneElement(header, {
                    className,
                    children: this.renderAnchor(header.props.children, headerRole)
                });
            } else {
                header = cloneElement(header, { className });
            }
        }
        return (
            <div
                className={this.prefix('heading')}
                onClick={this.handleSelect}
                >
                {header}
            </div>
        );
    },

    renderAnchor(header, headerRole) {
        return (
            <a
                href={'#' + (this.props.id || '') }
                aria-controls={this.props.collapsible ? this.props.id : null}
                className={this.isExpanded() ? null : 'collapsed'}
                aria-expanded={this.isExpanded() }
                aria-selected={this.isExpanded() }
                role={headerRole}
                >
                {header}
            </a>
        );
    },
    renderCollapsibleTitle(header, headerRole) {
        return (
            <h4 className={this.prefix('title') } role="presentation">
                {this.renderAnchor(header, headerRole) }
            </h4>
        );
    },
    render() {
        const {
            headerRole,
            panelRole,
            className,
            collapsible,
            id,
            ...props
        } = this.props;

        const clesses = classNames(
            'panel',
            className,
            ...this.getClassNames()
        );

        return (
            <div {...props}
                className={clesses}
                id={collapsible ? null : id} onSelect={null}
                >
                {this.renderHeading(headerRole) }
                {collapsible ? this.renderCollapsibleBody(panelRole) : this.renderBody() }
            </div>
        );
    }
});

export default Panel;
