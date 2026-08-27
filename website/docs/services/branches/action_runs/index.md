--- 
title: action_runs
hide_title: false
hide_table_of_contents: false
keywords:
  - action_runs
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

Creates, updates, deletes, gets or lists an <code>action_runs</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="action_runs" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.branches.action_runs" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
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
    <td><CopyableCode code="id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="branch_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="check_run_id" /></td>
    <td><code>number</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="git_config" /></td>
    <td><code></code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="run_steps" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="workdir" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
</tbody>
</table>
</TabItem>
<TabItem value="list">

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
    <td><CopyableCode code="id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="branch_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="check_run_id" /></td>
    <td><code>number</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="git_config" /></td>
    <td><code></code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="run_steps" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="workdir" /></td>
    <td><code>string</code></td>
    <td></td>
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
    <td><a href="#parameter-run_id"><code>run_id</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Returns the current status of the specified action run.</td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td><a href="#parameter-offset"><code>offset</code></a>, <a href="#parameter-limit"><code>limit</code></a></td>
    <td>Returns a paginated list of action runs of the specified project.</td>
</tr>
<tr>
    <td><a href="#update_status"><CopyableCode code="update_status" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-run_id"><code>run_id</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Updates the status of an ongoing action run.</td>
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
<tr id="parameter-ref">
    <td><CopyableCode code="ref" /></td>
    <td><code>string</code></td>
    <td>Supabase project reference (the Project ID shown in the dashboard under Settings -&gt; General; 20 lowercase letters). Resolved from the SUPABASE_PROJECT_ID environment variable when it is set (x-stackQL-envVar); otherwise it must be supplied on every project-scoped query as WHERE ref = '&lt;ref&gt;'. A WHERE value always takes precedence over the environment. (x-stackQL-envVar: SUPABASE_PROJECT_ID)</td>
</tr>
<tr id="parameter-run_id">
    <td><CopyableCode code="run_id" /></td>
    <td><code>string</code></td>
    <td>Action Run ID</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>number</code></td>
    <td></td>
</tr>
<tr id="parameter-offset">
    <td><CopyableCode code="offset" /></td>
    <td><code>number</code></td>
    <td></td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

Returns the current status of the specified action run.

```sql
SELECT
id,
branch_id,
check_run_id,
created_at,
git_config,
run_steps,
updated_at,
workdir
FROM supabase.branches.action_runs
WHERE run_id = '{{ run_id }}' -- required
AND ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
<TabItem value="list">

Returns a paginated list of action runs of the specified project.

```sql
SELECT
id,
branch_id,
check_run_id,
created_at,
git_config,
run_steps,
updated_at,
workdir
FROM supabase.branches.action_runs
WHERE ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
AND offset = '{{ offset }}'
AND limit = '{{ limit }}'
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="update_status"
    values={[
        { label: 'update_status', value: 'update_status' }
    ]}
>
<TabItem value="update_status">

Updates the status of an ongoing action run.

```sql
EXEC supabase.branches.action_runs.update_status 
@run_id='{{ run_id }}' --required, 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set 
@@json=
'{
"clone": "{{ clone }}", 
"pull": "{{ pull }}", 
"health": "{{ health }}", 
"configure": "{{ configure }}", 
"migrate": "{{ migrate }}", 
"seed": "{{ seed }}", 
"deploy": "{{ deploy }}"
}'
;
```
</TabItem>
</Tabs>
