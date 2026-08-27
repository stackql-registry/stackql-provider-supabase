--- 
title: addons
hide_title: false
hide_table_of_contents: false
keywords:
  - addons
  - billing
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

Creates, updates, deletes, gets or lists an <code>addons</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="addons" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.billing.addons" /></td></tr>
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
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td> (custom_domain, compute_instance, pitr, ipv4, auth_mfa_phone, auth_mfa_web_authn, log_drain, etl_pipeline)</td>
</tr>
<tr>
    <td><CopyableCode code="variant" /></td>
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
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Returns the billing addons that are currently applied, including the active compute instance size, and lists every addon option that can be provisioned with pricing metadata.</td>
</tr>
<tr>
    <td><a href="#update"><CopyableCode code="update" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-addon_variant"><code>addon_variant</code></a>, <a href="#parameter-addon_type"><code>addon_type</code></a></td>
    <td></td>
    <td>Selects an addon variant, for example scaling the project’s compute instance up or down, and applies it to the project.</td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-addon_variant"><code>addon_variant</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Disables the selected addon variant, including rolling the compute instance back to its previous size.</td>
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
<tr id="parameter-addon_variant">
    <td><CopyableCode code="addon_variant" /></td>
    <td><code></code></td>
    <td></td>
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
    defaultValue="list"
    values={[
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="list">

Returns the billing addons that are currently applied, including the active compute instance size, and lists every addon option that can be provisioned with pricing metadata.

```sql
SELECT
type,
variant
FROM supabase.billing.addons
WHERE ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
;
```
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

Selects an addon variant, for example scaling the project’s compute instance up or down, and applies it to the project.

```sql
UPDATE supabase.billing.addons
SET 
addon_variant = '{{ addon_variant }}',
addon_type = '{{ addon_type }}'
WHERE 
ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
AND addon_variant = '{{ addon_variant }}' --required
AND addon_type = '{{ addon_type }}' --required;
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

Disables the selected addon variant, including rolling the compute instance back to its previous size.

```sql
DELETE FROM supabase.billing.addons
WHERE addon_variant = '{{ addon_variant }}' --required
AND ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
</Tabs>
