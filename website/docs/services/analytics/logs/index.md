--- 
title: logs
hide_title: false
hide_table_of_contents: false
keywords:
  - logs
  - analytics
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

Creates, updates, deletes, gets or lists a <code>logs</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="logs" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.analytics.logs" /></td></tr>
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
    <td><CopyableCode code="error" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="result" /></td>
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
    <td><a href="#parameter-sql"><code>sql</code></a>, <a href="#parameter-iso_timestamp_start"><code>iso_timestamp_start</code></a>, <a href="#parameter-iso_timestamp_end"><code>iso_timestamp_end</code></a></td>
    <td>Executes an SQL or LQL query on the project's unified logs stream.&lt;br /&gt;&lt;br /&gt;Either the `iso_timestamp_start` and `iso_timestamp_end` parameters must be provided.&lt;br /&gt;If both are not provided, only the last 1 minute of logs will be queried.&lt;br /&gt;The timestamp range must be no more than 24 hours and is rounded to the nearest minute. If the range is more than 24 hours, a validation error will be thrown.&lt;br /&gt;&lt;br /&gt;Filter by the `source` column to specify specific log sources, such as edge_logs, postgres_logs, etc.&lt;br /&gt;&lt;br /&gt;Note: SQL must be written in **ClickHouse SQL dialect**.&lt;br /&gt;</td>
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
<tr id="parameter-iso_timestamp_end">
    <td><CopyableCode code="iso_timestamp_end" /></td>
    <td><code>string (date-time)</code></td>
    <td></td>
</tr>
<tr id="parameter-iso_timestamp_start">
    <td><CopyableCode code="iso_timestamp_start" /></td>
    <td><code>string (date-time)</code></td>
    <td></td>
</tr>
<tr id="parameter-sql">
    <td><CopyableCode code="sql" /></td>
    <td><code>string</code></td>
    <td>Custom SQL query to execute on the logs. See &#91;querying logs&#93;(https:​//supabase.com/docs/guides/monitoring-and-debugging/logs#querying-with-the-logs-explorer) for more details.</td>
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

Executes an SQL or LQL query on the project's unified logs stream.&lt;br /&gt;&lt;br /&gt;Either the `iso_timestamp_start` and `iso_timestamp_end` parameters must be provided.&lt;br /&gt;If both are not provided, only the last 1 minute of logs will be queried.&lt;br /&gt;The timestamp range must be no more than 24 hours and is rounded to the nearest minute. If the range is more than 24 hours, a validation error will be thrown.&lt;br /&gt;&lt;br /&gt;Filter by the `source` column to specify specific log sources, such as edge_logs, postgres_logs, etc.&lt;br /&gt;&lt;br /&gt;Note: SQL must be written in **ClickHouse SQL dialect**.&lt;br /&gt;

```sql
SELECT
error,
result
FROM supabase.analytics.logs
WHERE ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
AND sql = '{{ sql }}'
AND iso_timestamp_start = '{{ iso_timestamp_start }}'
AND iso_timestamp_end = '{{ iso_timestamp_end }}'
;
```
</TabItem>
</Tabs>
