--- 
title: buckets
hide_title: false
hide_table_of_contents: false
keywords:
  - buckets
  - storage
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

Creates, updates, deletes, gets or lists a <code>buckets</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="buckets" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.storage.buckets" /></td></tr>
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
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="owner" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="public" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
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
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
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
name,
created_at,
owner,
public,
updated_at
FROM supabase.storage.buckets
WHERE ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
</Tabs>
