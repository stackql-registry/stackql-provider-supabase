--- 
title: queries
hide_title: false
hide_table_of_contents: false
keywords:
  - queries
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

Creates, updates, deletes, gets or lists a <code>queries</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="queries" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.database.queries" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

`SELECT` not supported for this resource, use `SHOW METHODS` to view available operations for the resource.


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
    <td><a href="#run"><CopyableCode code="run" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-query"><code>query</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#run_read_only"><CopyableCode code="run_read_only" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-query"><code>query</code></a></td>
    <td></td>
    <td>All entity references must be schema qualified.</td>
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

## `INSERT` examples

<Tabs
    defaultValue="run"
    values={[
        { label: 'run', value: 'run' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="run">

No description available.

```sql
INSERT INTO supabase.database.queries (
query,
parameters,
read_only,
ref
)
SELECT 
'{{ query }}' /* required */,
'{{ parameters }}',
{{ read_only }},
'{{ ref }}'
RETURNING
rows
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: queries
  props:
    - name: ref
      value: "{{ ref }}"
      description: Required parameter for the queries resource.
    - name: query
      value: "{{ query }}"
    - name: parameters
      value: "{{ parameters }}"
    - name: read_only
      value: {{ read_only }}
`}</CodeBlock>

</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="run_read_only"
    values={[
        { label: 'run_read_only', value: 'run_read_only' }
    ]}
>
<TabItem value="run_read_only">

All entity references must be schema qualified.

```sql
EXEC supabase.database.queries.run_read_only 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set 
@@json=
'{
"query": "{{ query }}", 
"parameters": "{{ parameters }}"
}'
;
```
</TabItem>
</Tabs>
