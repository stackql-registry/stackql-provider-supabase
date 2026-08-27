--- 
title: postgres_configs
hide_title: false
hide_table_of_contents: false
keywords:
  - postgres_configs
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

Creates, updates, deletes, gets or lists a <code>postgres_configs</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="postgres_configs" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.config.postgres_configs" /></td></tr>
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
    <td><CopyableCode code="checkpoint_timeout" /></td>
    <td><code>string</code></td>
    <td>Default unit: s (pattern: &lt;code&gt;^(-?&#91;0-9&#93;+(?:\.&#91;0-9&#93;+)?)(us|ms|s|min|h|d)?$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="cron.log_statement" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="effective_cache_size" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hot_standby_feedback" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="log_autovacuum_min_duration" /></td>
    <td><code>string</code></td>
    <td>Default unit: ms (pattern: &lt;code&gt;^(-?&#91;0-9&#93;+(?:\.&#91;0-9&#93;+)?)(us|ms|s|min|h|d)?$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="log_checkpoints" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="log_connections" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="log_disconnections" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="log_duration" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="log_lock_waits" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="log_recovery_conflict_waits" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="log_replication_commands" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="log_startup_progress_interval" /></td>
    <td><code>string</code></td>
    <td>Default unit: ms (pattern: &lt;code&gt;^(-?&#91;0-9&#93;+(?:\.&#91;0-9&#93;+)?)(us|ms|s|min|h|d)?$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="log_temp_files" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="logical_decoding_work_mem" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="maintenance_work_mem" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_connections" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_locks_per_transaction" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_logical_replication_workers" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_parallel_maintenance_workers" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_parallel_workers" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_parallel_workers_per_gather" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_replication_slots" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_slot_wal_keep_size" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_standby_archive_delay" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_standby_streaming_delay" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_sync_workers_per_subscription" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_wal_senders" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_wal_size" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="max_worker_processes" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="session_replication_role" /></td>
    <td><code>string</code></td>
    <td> (origin, replica, local)</td>
</tr>
<tr>
    <td><CopyableCode code="shared_buffers" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="statement_timeout" /></td>
    <td><code>string</code></td>
    <td>Default unit: ms (pattern: &lt;code&gt;^(-?&#91;0-9&#93;+(?:\.&#91;0-9&#93;+)?)(us|ms|s|min|h|d)?$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="track_activity_query_size" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="track_commit_timestamp" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="wal_keep_size" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="wal_sender_timeout" /></td>
    <td><code>string</code></td>
    <td>Default unit: ms (pattern: &lt;code&gt;^(-?&#91;0-9&#93;+(?:\.&#91;0-9&#93;+)?)(us|ms|s|min|h|d)?$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="work_mem" /></td>
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
checkpoint_timeout,
cron.log_statement,
effective_cache_size,
hot_standby_feedback,
log_autovacuum_min_duration,
log_checkpoints,
log_connections,
log_disconnections,
log_duration,
log_lock_waits,
log_recovery_conflict_waits,
log_replication_commands,
log_startup_progress_interval,
log_temp_files,
logical_decoding_work_mem,
maintenance_work_mem,
max_connections,
max_locks_per_transaction,
max_logical_replication_workers,
max_parallel_maintenance_workers,
max_parallel_workers,
max_parallel_workers_per_gather,
max_replication_slots,
max_slot_wal_keep_size,
max_standby_archive_delay,
max_standby_streaming_delay,
max_sync_workers_per_subscription,
max_wal_senders,
max_wal_size,
max_worker_processes,
session_replication_role,
shared_buffers,
statement_timeout,
track_activity_query_size,
track_commit_timestamp,
wal_keep_size,
wal_sender_timeout,
work_mem
FROM supabase.config.postgres_configs
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
UPDATE supabase.config.postgres_configs
SET 
effective_cache_size = '{{ effective_cache_size }}',
logical_decoding_work_mem = '{{ logical_decoding_work_mem }}',
cron.log_statement = {{ cron.log_statement }},
log_autovacuum_min_duration = '{{ log_autovacuum_min_duration }}',
log_checkpoints = {{ log_checkpoints }},
log_connections = {{ log_connections }},
log_disconnections = {{ log_disconnections }},
log_duration = {{ log_duration }},
log_lock_waits = {{ log_lock_waits }},
log_recovery_conflict_waits = {{ log_recovery_conflict_waits }},
log_replication_commands = {{ log_replication_commands }},
log_startup_progress_interval = '{{ log_startup_progress_interval }}',
log_temp_files = '{{ log_temp_files }}',
maintenance_work_mem = '{{ maintenance_work_mem }}',
track_activity_query_size = '{{ track_activity_query_size }}',
max_connections = {{ max_connections }},
max_locks_per_transaction = {{ max_locks_per_transaction }},
max_logical_replication_workers = {{ max_logical_replication_workers }},
max_parallel_maintenance_workers = {{ max_parallel_maintenance_workers }},
max_parallel_workers = {{ max_parallel_workers }},
max_parallel_workers_per_gather = {{ max_parallel_workers_per_gather }},
max_replication_slots = {{ max_replication_slots }},
max_slot_wal_keep_size = '{{ max_slot_wal_keep_size }}',
max_standby_archive_delay = '{{ max_standby_archive_delay }}',
max_standby_streaming_delay = '{{ max_standby_streaming_delay }}',
max_sync_workers_per_subscription = {{ max_sync_workers_per_subscription }},
max_wal_size = '{{ max_wal_size }}',
max_wal_senders = {{ max_wal_senders }},
max_worker_processes = {{ max_worker_processes }},
session_replication_role = '{{ session_replication_role }}',
shared_buffers = '{{ shared_buffers }}',
statement_timeout = '{{ statement_timeout }}',
track_commit_timestamp = {{ track_commit_timestamp }},
wal_keep_size = '{{ wal_keep_size }}',
wal_sender_timeout = '{{ wal_sender_timeout }}',
work_mem = '{{ work_mem }}',
checkpoint_timeout = '{{ checkpoint_timeout }}',
hot_standby_feedback = {{ hot_standby_feedback }},
restart_database = {{ restart_database }}
WHERE 
ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
RETURNING
checkpoint_timeout,
cron.log_statement,
effective_cache_size,
hot_standby_feedback,
log_autovacuum_min_duration,
log_checkpoints,
log_connections,
log_disconnections,
log_duration,
log_lock_waits,
log_recovery_conflict_waits,
log_replication_commands,
log_startup_progress_interval,
log_temp_files,
logical_decoding_work_mem,
maintenance_work_mem,
max_connections,
max_locks_per_transaction,
max_logical_replication_workers,
max_parallel_maintenance_workers,
max_parallel_workers,
max_parallel_workers_per_gather,
max_replication_slots,
max_slot_wal_keep_size,
max_standby_archive_delay,
max_standby_streaming_delay,
max_sync_workers_per_subscription,
max_wal_senders,
max_wal_size,
max_worker_processes,
session_replication_role,
shared_buffers,
statement_timeout,
track_activity_query_size,
track_commit_timestamp,
wal_keep_size,
wal_sender_timeout,
work_mem;
```
</TabItem>
</Tabs>
