--- 
title: organization_projects
hide_title: false
hide_table_of_contents: false
keywords:
  - organization_projects
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

Creates, updates, deletes, gets or lists an <code>organization_projects</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="organization_projects" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.projects.organization_projects" /></td></tr>
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
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="cloud_provider" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="databases" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="inserted_at" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="is_branch" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="ref" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="region" /></td>
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
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-slug"><code>slug</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td><a href="#parameter-offset"><code>offset</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-search"><code>search</code></a>, <a href="#parameter-sort"><code>sort</code></a>, <a href="#parameter-statuses"><code>statuses</code></a></td>
    <td>Returns a paginated list of projects for the specified organization.&lt;br /&gt;&lt;br /&gt;This endpoint uses offset-based pagination. Use the `offset` parameter to skip a number of projects and the `limit` parameter to control the number of projects returned per page.</td>
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
<tr id="parameter-slug">
    <td><CopyableCode code="slug" /></td>
    <td><code>string</code></td>
    <td>Organization slug</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>Number of projects to return per page</td>
</tr>
<tr id="parameter-offset">
    <td><CopyableCode code="offset" /></td>
    <td><code>integer</code></td>
    <td>Number of projects to skip</td>
</tr>
<tr id="parameter-search">
    <td><CopyableCode code="search" /></td>
    <td><code>string</code></td>
    <td>Search projects by name</td>
</tr>
<tr id="parameter-sort">
    <td><CopyableCode code="sort" /></td>
    <td><code>string</code></td>
    <td>Sort order for projects</td>
</tr>
<tr id="parameter-statuses">
    <td><CopyableCode code="statuses" /></td>
    <td><code>string</code></td>
    <td>A comma-separated list of project statuses to filter by.  The following values are supported: `ACTIVE_HEALTHY`, `INACTIVE`.</td>
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

Returns a paginated list of projects for the specified organization.&lt;br /&gt;&lt;br /&gt;This endpoint uses offset-based pagination. Use the `offset` parameter to skip a number of projects and the `limit` parameter to control the number of projects returned per page.

```sql
SELECT
name,
cloud_provider,
databases,
inserted_at,
is_branch,
ref,
region,
status
FROM supabase.projects.organization_projects
WHERE slug = '{{ slug }}' -- required
AND ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
AND offset = '{{ offset }}'
AND limit = '{{ limit }}'
AND search = '{{ search }}'
AND sort = '{{ sort }}'
AND statuses = '{{ statuses }}'
;
```
</TabItem>
</Tabs>
