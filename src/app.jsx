/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import cockpit from "cockpit";
import React from "react";
import {
    SimpleList,
    SimpleListItem,
    SimpleListGroup,
    Title,
    EmptyState,
    CardHeader,
    Button,
} from '@patternfly/react-core';
import { Alert } from "@patternfly/react-core/dist/esm/components/Alert/index.js";
import {
    Card,
    CardBody,
    CardTitle,
} from "@patternfly/react-core/dist/esm/components/Card/index.js";

const _ = cockpit.gettext;

export const EmptyStateSpinner = () =>
    <EmptyState>

        <Title size="lg" headingLevel="h4">
            Loading
        </Title>
    </EmptyState>;

export class Application extends React.Component {
    constructor() {
        super();
        this.state = { status: _("Unknown"), banned: [] };
    }

    componentDidMount() {
        cockpit.spawn(["fail2ban-client", "status"]).done((output) => {
            this.setState({ status: output.trim() });
        });
        this.loadBanned();
    }

    loadBanned() {
        this.setState({ banned: [] });
        cockpit.spawn(["fail2ban-client", "banned"]).done((output) => {
            this.setState({ banned: JSON.parse(output.trim().replace(/'/g, '"')) });
        });
    }

    unban(ip) {
        console.log('unban');
        cockpit.spawn(["fail2ban-client", "unban", ip]).done((output) => {
            this.loadBanned();
        });
    }

    render() {
        const self = this;
        const groups = this.state.banned
                .map(function(e, i) {
                    return Object.keys(e).map(function(key) {
                        const items = e[key].map(function(item, index) {
                            return <SimpleListItem key={index} title="Click to unban" onClick={() => self.unban(item)}>{item}</SimpleListItem>;
                        });
                        const title = `Jail: ${key}`;
                        return <SimpleListGroup key={key} title={title}>{items}</SimpleListGroup>;
                    });
                }).flat(1);

        const list = groups.length > 0 ? <SimpleList>{groups}</SimpleList> : <EmptyStateSpinner />;
        return (
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Fail2ban status</CardTitle>
                        <Button onClick={() => this.loadBanned()}>Reload</Button>
                    </CardHeader>

                    <CardBody>
                        <Alert variant="info" title={this.state.status} />
                        {list}
                    </CardBody>
                </Card>

            </div>
        );
    }
}
