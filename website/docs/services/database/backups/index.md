--- 
title: backups
hide_title: false
hide_table_of_contents: false
keywords:
  - backups
  - database
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

Creates, updates, deletes, gets or lists a <code>backups</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="backups" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.database.backups" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="list"
    values={[
        { label: 'list', value: 'list' }
    ]}
>
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
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="inserted_at" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="is_physical_backup" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td> (COMPLETED, FAILED, PENDING, REMOVED, ARCHIVED, CANCELLED)</td>
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
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#restore_pitr"><CopyableCode code="restore_pitr" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-recovery_time_target_unix"><code>recovery_time_target_unix</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#restore"><CopyableCode code="restore" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-id"><code>id</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#undo"><CopyableCode code="undo" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-name"><code>name</code></a></td>
    <td></td>
    <td></td>
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
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="list"
    values={[
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="list">

No description available.

```sql
SELECT
id,
inserted_at,
is_physical_backup,
status
FROM supabase.database.backups
WHERE ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="restore_pitr"
    values={[
        { label: 'restore_pitr', value: 'restore_pitr' },
        { label: 'restore', value: 'restore' },
        { label: 'undo', value: 'undo' }
    ]}
>
<TabItem value="restore_pitr">

No description available.

```sql
EXEC supabase.database.backups.restore_pitr 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set 
@@json=
'{
"recovery_time_target_unix": {{ recovery_time_target_unix }}
}'
;
```
</TabItem>
<TabItem value="restore">

No description available.

```sql
EXEC supabase.database.backups.restore 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set 
@@json=
'{
"id": {{ id }}
}'
;
```
</TabItem>
<TabItem value="undo">

No description available.

```sql
EXEC supabase.database.backups.undo 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set 
@@json=
'{
"name": "{{ name }}"
}'
;
```
</TabItem>
</Tabs>
