--- 
title: branch_configs
hide_title: false
hide_table_of_contents: false
keywords:
  - branch_configs
  - branches
  - supabase
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
description: Query, deploy and manage supabase resources using SQL
custom_edit_url: null
image: /img/stackql-supabase-provider-featured-image.png
---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Creates, updates, deletes, gets or lists a <code>branch_configs</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="branch_configs" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.branches.branch_configs" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' }
    ]}
>
<TabItem value="get">

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><CopyableCode code="db_host" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="db_pass" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="db_port" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="db_user" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="jwt_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="postgres_engine" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="postgres_version" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="ref" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="release_channel" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td> (INACTIVE, ACTIVE_HEALTHY, ACTIVE_UNHEALTHY, COMING_UP, UNKNOWN, GOING_DOWN, INIT_FAILED, REMOVED, RESTORING, UPGRADING, PAUSING, RESTORE_FAILED, RESTARTING, PAUSE_FAILED, RESIZING)</td>
</tr>
</tbody>
</table>
</TabItem>
</Tabs>

## Methods

The following methods are available for this resource:

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Accessible by</th>
    <th>Required Params</th>
    <th>Optional Params</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><a href="#get"><CopyableCode code="get" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-branch_id_or_ref"><code>branch_id_or_ref</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Fetches configurations of the specified database branch</td>
</tr>
</tbody>
</table>

## Parameters

Parameters can be passed in the `WHERE` clause of a query. Check the [Methods](#methods) section to see which parameters are required or optional for each operation.

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr id="parameter-branch_id_or_ref">
    <td><CopyableCode code="branch_id_or_ref" /></td>
    <td><code></code></td>
    <td>Branch ref or deprecated branch ID</td>
</tr>
<tr id="parameter-ref">
    <td><CopyableCode code="ref" /></td>
    <td><code>string</code></td>
    <td>Supabase project reference (the Project ID shown in the dashboard under Settings -&gt; General; 20 lowercase letters). Resolved from the SUPABASE_PROJECT_ID environment variable when it is set (x-stackQL-envVar); otherwise it must be supplied on every project-scoped query as WHERE ref = '&lt;ref&gt;'. A WHERE value always takes precedence over the environment. (x-stackQL-envVar: SUPABASE_PROJECT_ID)</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' }
    ]}
>
<TabItem value="get">

Fetches configurations of the specified database branch

```sql
SELECT
db_host,
db_pass,
db_port,
db_user,
jwt_secret,
postgres_engine,
postgres_version,
ref,
release_channel,
status
FROM supabase.branches.branch_configs
WHERE branch_id_or_ref = '{{ branch_id_or_ref }}' -- required
AND ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
</Tabs>
