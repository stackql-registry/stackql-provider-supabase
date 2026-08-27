--- 
title: backup_schedules
hide_title: false
hide_table_of_contents: false
keywords:
  - backup_schedules
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

Creates, updates, deletes, gets or lists a <code>backup_schedules</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="backup_schedules" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.database.backup_schedules" /></td></tr>
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
    <td><CopyableCode code="schedule_for" /></td>
    <td><code>string</code></td>
    <td>Time of day to schedule daily backups, in UTC. Format: HH:MM:SS. (pattern: &lt;code&gt;^(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?$&lt;/code&gt;, example: 04:00:00)</td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string (date-time)</code></td>
    <td>Timestamp of when the backup schedule was last updated. (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z|(&#91;+-&#93;(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d)))$&lt;/code&gt;, example: 2026-05-04T14:40:44+00:00)</td>
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
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-schedule_for"><code>schedule_for</code></a></td>
    <td></td>
    <td>Sets the time at which the daily backup runs. The change takes effect on the next backup window that includes the new time. If the new time has already passed for today, the first backup at the new time will occur the following day. It can only be updated 3 times per 24 hours.</td>
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
schedule_for,
updated_at
FROM supabase.database.backup_schedules
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

Sets the time at which the daily backup runs. The change takes effect on the next backup window that includes the new time. If the new time has already passed for today, the first backup at the new time will occur the following day. It can only be updated 3 times per 24 hours.

```sql
UPDATE supabase.database.backup_schedules
SET 
schedule_for = '{{ schedule_for }}'
WHERE 
ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
AND schedule_for = '{{ schedule_for }}' --required
RETURNING
schedule_for,
updated_at;
```
</TabItem>
</Tabs>
