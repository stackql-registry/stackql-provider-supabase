--- 
title: available_regions
hide_title: false
hide_table_of_contents: false
keywords:
  - available_regions
  - projects
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

Creates, updates, deletes, gets or lists an <code>available_regions</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="available_regions" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.projects.available_regions" /></td></tr>
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
    <td><CopyableCode code="all" /></td>
    <td><code>object</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="recommendations" /></td>
    <td><code>object</code></td>
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
    <td><a href="#parameter-organization_slug"><code>organization_slug</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td><a href="#parameter-continent"><code>continent</code></a>, <a href="#parameter-desired_instance_size"><code>desired_instance_size</code></a></td>
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
<tr id="parameter-organization_slug">
    <td><CopyableCode code="organization_slug" /></td>
    <td><code>string</code></td>
    <td>Slug of your organization</td>
</tr>
<tr id="parameter-ref">
    <td><CopyableCode code="ref" /></td>
    <td><code>string</code></td>
    <td>Supabase project reference (the Project ID shown in the dashboard under Settings -&gt; General; 20 lowercase letters). Resolved from the SUPABASE_PROJECT_ID environment variable when it is set (x-stackQL-envVar); otherwise it must be supplied on every project-scoped query as WHERE ref = '&lt;ref&gt;'. A WHERE value always takes precedence over the environment. (x-stackQL-envVar: SUPABASE_PROJECT_ID)</td>
</tr>
<tr id="parameter-continent">
    <td><CopyableCode code="continent" /></td>
    <td><code>string</code></td>
    <td>Continent code to determine regional recommendations: NA (North America), SA (South America), EU (Europe), AF (Africa), AS (Asia), OC (Oceania), AN (Antarctica)</td>
</tr>
<tr id="parameter-desired_instance_size">
    <td><CopyableCode code="desired_instance_size" /></td>
    <td><code>string</code></td>
    <td>Desired instance size. Omit this field to always default to the smallest possible size.</td>
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

No description available.

```sql
SELECT
all,
recommendations
FROM supabase.projects.available_regions
WHERE organization_slug = '{{ organization_slug }}' -- required
AND ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
AND continent = '{{ continent }}'
AND desired_instance_size = '{{ desired_instance_size }}'
;
```
</TabItem>
</Tabs>
