--- 
title: migrations
hide_title: false
hide_table_of_contents: false
keywords:
  - migrations
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

Creates, updates, deletes, gets or lists a <code>migrations</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="migrations" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.database.migrations" /></td></tr>
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
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="created_by" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="idempotency_key" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="rollback" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="statements" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="version" /></td>
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
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="version" /></td>
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
    <td><a href="#parameter-version"><code>version</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-query"><code>query</code></a></td>
    <td><a href="#parameter-Idempotency-Key"><code>Idempotency-Key</code></a></td>
    <td></td>
</tr>
<tr>
    <td><a href="#update"><CopyableCode code="update" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-version"><code>version</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-gte"><code>gte</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#upsert"><CopyableCode code="upsert" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-query"><code>query</code></a></td>
    <td><a href="#parameter-Idempotency-Key"><code>Idempotency-Key</code></a></td>
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
<tr id="parameter-gte">
    <td><CopyableCode code="gte" /></td>
    <td><code>string</code></td>
    <td>Rollback migrations greater or equal to this version</td>
</tr>
<tr id="parameter-ref">
    <td><CopyableCode code="ref" /></td>
    <td><code>string</code></td>
    <td>Supabase project reference (the Project ID shown in the dashboard under Settings -&gt; General; 20 lowercase letters). Resolved from the SUPABASE_PROJECT_ID environment variable when it is set (x-stackQL-envVar); otherwise it must be supplied on every project-scoped query as WHERE ref = '&lt;ref&gt;'. A WHERE value always takes precedence over the environment. (x-stackQL-envVar: SUPABASE_PROJECT_ID)</td>
</tr>
<tr id="parameter-version">
    <td><CopyableCode code="version" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr id="parameter-Idempotency-Key">
    <td><CopyableCode code="Idempotency-Key" /></td>
    <td><code>string</code></td>
    <td>A unique key to ensure the same migration is tracked only once.</td>
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

No description available.

```sql
SELECT
name,
created_by,
idempotency_key,
rollback,
statements,
version
FROM supabase.database.migrations
WHERE version = '{{ version }}' -- required
AND ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
<TabItem value="list">

No description available.

```sql
SELECT
name,
version
FROM supabase.database.migrations
WHERE ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
</Tabs>


## `INSERT` examples

<Tabs
    defaultValue="create"
    values={[
        { label: 'create', value: 'create' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create">

No description available.

```sql
INSERT INTO supabase.database.migrations (
query,
name,
rollback,
ref,
Idempotency-Key
)
SELECT 
'{{ query }}' /* required */,
'{{ name }}',
'{{ rollback }}',
'{{ ref }}',
'{{ Idempotency-Key }}'
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: migrations
  props:
    - name: ref
      value: "{{ ref }}"
      description: Required parameter for the migrations resource.
    - name: query
      value: "{{ query }}"
    - name: name
      value: "{{ name }}"
    - name: rollback
      value: "{{ rollback }}"
    - name: Idempotency-Key
      value: "{{ Idempotency-Key }}"
      description: A unique key to ensure the same migration is tracked only once.
      description: A unique key to ensure the same migration is tracked only once.
`}</CodeBlock>

</TabItem>
</Tabs>


## `UPDATE` examples

<Tabs
    defaultValue="update"
    values={[
        { label: 'update', value: 'update' }
    ]}
>
<TabItem value="update">

No description available.

```sql
UPDATE supabase.database.migrations
SET 
name = '{{ name }}',
rollback = '{{ rollback }}'
WHERE 
version = '{{ version }}' --required
AND ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set;
```
</TabItem>
</Tabs>


## `DELETE` examples

<Tabs
    defaultValue="delete"
    values={[
        { label: 'delete', value: 'delete' }
    ]}
>
<TabItem value="delete">

No description available.

```sql
DELETE FROM supabase.database.migrations
WHERE gte = '{{ gte }}' --required
AND ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="upsert"
    values={[
        { label: 'upsert', value: 'upsert' }
    ]}
>
<TabItem value="upsert">

No description available.

```sql
EXEC supabase.database.migrations.upsert 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set, 
@Idempotency-Key='{{ Idempotency-Key }}' 
@@json=
'{
"query": "{{ query }}", 
"name": "{{ name }}", 
"rollback": "{{ rollback }}"
}'
;
```
</TabItem>
</Tabs>
