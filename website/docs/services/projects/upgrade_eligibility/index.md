--- 
title: upgrade_eligibility
hide_title: false
hide_table_of_contents: false
keywords:
  - upgrade_eligibility
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

Creates, updates, deletes, gets or lists a <code>upgrade_eligibility</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="upgrade_eligibility" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.projects.upgrade_eligibility" /></td></tr>
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
    <td><CopyableCode code="current_app_version" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="current_app_version_release_channel" /></td>
    <td><code>string</code></td>
    <td> (internal, alpha, beta, ga, withdrawn, preview)</td>
</tr>
<tr>
    <td><CopyableCode code="duration_estimate_hours" /></td>
    <td><code>number</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="eligible" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="latest_app_version" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="legacy_auth_custom_roles" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="objects_to_be_dropped" /></td>
    <td><code>array</code></td>
    <td>Use validation_errors instead.</td>
</tr>
<tr>
    <td><CopyableCode code="target_upgrade_versions" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="unsupported_extensions" /></td>
    <td><code>array</code></td>
    <td>Use validation_errors instead.</td>
</tr>
<tr>
    <td><CopyableCode code="user_defined_objects_in_internal_schemas" /></td>
    <td><code>array</code></td>
    <td>Use validation_errors instead.</td>
</tr>
<tr>
    <td><CopyableCode code="validation_errors" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="warnings" /></td>
    <td><code>array</code></td>
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
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' }
    ]}
>
<TabItem value="get">

No description available.

```sql
SELECT
current_app_version,
current_app_version_release_channel,
duration_estimate_hours,
eligible,
latest_app_version,
legacy_auth_custom_roles,
objects_to_be_dropped,
target_upgrade_versions,
unsupported_extensions,
user_defined_objects_in_internal_schemas,
validation_errors,
warnings
FROM supabase.projects.upgrade_eligibility
WHERE ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
</Tabs>
