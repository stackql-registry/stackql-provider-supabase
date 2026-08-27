--- 
title: realtime_configs
hide_title: false
hide_table_of_contents: false
keywords:
  - realtime_configs
  - config
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

Creates, updates, deletes, gets or lists a <code>realtime_configs</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="realtime_configs" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.config.realtime_configs" /></td></tr>
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

Gets project's realtime configuration

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
    <td><CopyableCode code="connection_pool" /></td>
    <td><code>integer</code></td>
    <td>Sets connection pool size for Realtime Authorization</td>
</tr>
<tr>
    <td><CopyableCode code="max_bytes_per_second" /></td>
    <td><code>integer</code></td>
    <td>Sets maximum number of bytes per second rate per channel limit</td>
</tr>
<tr>
    <td><CopyableCode code="max_channels_per_client" /></td>
    <td><code>integer</code></td>
    <td>Sets maximum number of channels per client rate limit</td>
</tr>
<tr>
    <td><CopyableCode code="max_concurrent_users" /></td>
    <td><code>integer</code></td>
    <td>Sets maximum number of concurrent users rate limit</td>
</tr>
<tr>
    <td><CopyableCode code="max_events_per_second" /></td>
    <td><code>integer</code></td>
    <td>Sets maximum number of events per second rate per channel limit</td>
</tr>
<tr>
    <td><CopyableCode code="max_joins_per_second" /></td>
    <td><code>integer</code></td>
    <td>Sets maximum number of joins per second rate limit</td>
</tr>
<tr>
    <td><CopyableCode code="max_payload_size_in_kb" /></td>
    <td><code>integer</code></td>
    <td>Sets maximum number of payload size in KB rate limit</td>
</tr>
<tr>
    <td><CopyableCode code="max_presence_events_per_second" /></td>
    <td><code>integer</code></td>
    <td>Sets maximum number of presence events per second rate limit</td>
</tr>
<tr>
    <td><CopyableCode code="postgres_changes_pool" /></td>
    <td><code>integer</code></td>
    <td>Sets connection pool size used to create Postgres Changes subscriptions</td>
</tr>
<tr>
    <td><CopyableCode code="presence_enabled" /></td>
    <td><code>boolean</code></td>
    <td>Whether to enable presence</td>
</tr>
<tr>
    <td><CopyableCode code="private_only" /></td>
    <td><code>boolean</code></td>
    <td>Whether to only allow private channels</td>
</tr>
<tr>
    <td><CopyableCode code="suspend" /></td>
    <td><code>boolean</code></td>
    <td>Disables the Realtime service for this project when true. Set to false to re-enable it.</td>
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
<tr>
    <td><a href="#update"><CopyableCode code="update" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#shutdown"><CopyableCode code="shutdown" /></a></td>
    <td><CopyableCode code="exec" /></td>
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

Gets project's realtime configuration

```sql
SELECT
connection_pool,
max_bytes_per_second,
max_channels_per_client,
max_concurrent_users,
max_events_per_second,
max_joins_per_second,
max_payload_size_in_kb,
max_presence_events_per_second,
postgres_changes_pool,
presence_enabled,
private_only,
suspend
FROM supabase.config.realtime_configs
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

No description available.

```sql
UPDATE supabase.config.realtime_configs
SET 
private_only = {{ private_only }},
connection_pool = {{ connection_pool }},
postgres_changes_pool = {{ postgres_changes_pool }},
max_concurrent_users = {{ max_concurrent_users }},
max_events_per_second = {{ max_events_per_second }},
max_bytes_per_second = {{ max_bytes_per_second }},
max_channels_per_client = {{ max_channels_per_client }},
max_joins_per_second = {{ max_joins_per_second }},
max_presence_events_per_second = {{ max_presence_events_per_second }},
max_payload_size_in_kb = {{ max_payload_size_in_kb }},
suspend = {{ suspend }},
presence_enabled = {{ presence_enabled }}
WHERE 
ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set;
```
</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="shutdown"
    values={[
        { label: 'shutdown', value: 'shutdown' }
    ]}
>
<TabItem value="shutdown">

Realtime connections shutdown successfully

```sql
EXEC supabase.config.realtime_configs.shutdown 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
</Tabs>
