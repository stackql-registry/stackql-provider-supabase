--- 
title: branches
hide_title: false
hide_table_of_contents: false
keywords:
  - branches
  - branches
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

Creates, updates, deletes, gets or lists a <code>branches</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="branches" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.branches.branches" /></td></tr>
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
    <td><CopyableCode code="id" /></td>
    <td><code>string (uuid)</code></td>
    <td> (pattern: &lt;code&gt;^(&#91;0-9a-fA-F&#93;&#123;8&#125;-&#91;0-9a-fA-F&#93;&#123;4&#125;-&#91;1-8&#93;&#91;0-9a-fA-F&#93;&#123;3&#125;-&#91;89abAB&#93;&#91;0-9a-fA-F&#93;&#123;3&#125;-&#91;0-9a-fA-F&#93;&#123;12&#125;|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="latest_check_run_id" /></td>
    <td><code>number</code></td>
    <td>This field is deprecated and will not be populated.</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z))$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="deletion_scheduled_at" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z))$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="git_branch" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="is_default" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="notify_url" /></td>
    <td><code>string (uri)</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="parent_project_ref" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="persistent" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="pr_number" /></td>
    <td><code>integer (int32)</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="preview_project_status" /></td>
    <td><code>string</code></td>
    <td> (INACTIVE, ACTIVE_HEALTHY, ACTIVE_UNHEALTHY, COMING_UP, UNKNOWN, GOING_DOWN, INIT_FAILED, REMOVED, RESTORING, UPGRADING, PAUSING, RESTORE_FAILED, RESTARTING, PAUSE_FAILED, RESIZING)</td>
</tr>
<tr>
    <td><CopyableCode code="project_ref" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="review_requested_at" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z))$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>This field is deprecated. List action runs to get branch status instead. (CREATING_PROJECT, RUNNING_MIGRATIONS, MIGRATIONS_PASSED, MIGRATIONS_FAILED, FUNCTIONS_DEPLOYED, FUNCTIONS_FAILED)</td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z))$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="with_data" /></td>
    <td><code>boolean</code></td>
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
    <td><CopyableCode code="id" /></td>
    <td><code>string (uuid)</code></td>
    <td> (pattern: &lt;code&gt;^(&#91;0-9a-fA-F&#93;&#123;8&#125;-&#91;0-9a-fA-F&#93;&#123;4&#125;-&#91;1-8&#93;&#91;0-9a-fA-F&#93;&#123;3&#125;-&#91;89abAB&#93;&#91;0-9a-fA-F&#93;&#123;3&#125;-&#91;0-9a-fA-F&#93;&#123;12&#125;|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="latest_check_run_id" /></td>
    <td><code>number</code></td>
    <td>This field is deprecated and will not be populated.</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z))$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="deletion_scheduled_at" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z))$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="git_branch" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="is_default" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="notify_url" /></td>
    <td><code>string (uri)</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="parent_project_ref" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="persistent" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="pr_number" /></td>
    <td><code>integer (int32)</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="preview_project_status" /></td>
    <td><code>string</code></td>
    <td> (INACTIVE, ACTIVE_HEALTHY, ACTIVE_UNHEALTHY, COMING_UP, UNKNOWN, GOING_DOWN, INIT_FAILED, REMOVED, RESTORING, UPGRADING, PAUSING, RESTORE_FAILED, RESTARTING, PAUSE_FAILED, RESIZING)</td>
</tr>
<tr>
    <td><CopyableCode code="project_ref" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="review_requested_at" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z))$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>This field is deprecated. List action runs to get branch status instead. (CREATING_PROJECT, RUNNING_MIGRATIONS, MIGRATIONS_PASSED, MIGRATIONS_FAILED, FUNCTIONS_DEPLOYED, FUNCTIONS_FAILED)</td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z))$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="with_data" /></td>
    <td><code>boolean</code></td>
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
    <td><a href="#parameter-name"><code>name</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Fetches the specified database branch by its name.</td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Returns all database branches of the specified project.</td>
</tr>
<tr>
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-branch_name"><code>branch_name</code></a></td>
    <td></td>
    <td>Creates a database branch from the specified project.</td>
</tr>
<tr>
    <td><a href="#update"><CopyableCode code="update" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-branch_id_or_ref"><code>branch_id_or_ref</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Updates the configuration of the specified database branch</td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-branch_id_or_ref"><code>branch_id_or_ref</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td><a href="#parameter-force"><code>force</code></a></td>
    <td>Deletes the specified database branch. By default, deletes immediately. Use force=false to schedule deletion with 1-hour grace period (only when soft deletion is enabled).</td>
</tr>
<tr>
    <td><a href="#push"><CopyableCode code="push" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-branch_id_or_ref"><code>branch_id_or_ref</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Pushes the specified database branch</td>
</tr>
<tr>
    <td><a href="#merge"><CopyableCode code="merge" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-branch_id_or_ref"><code>branch_id_or_ref</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Merges the specified database branch</td>
</tr>
<tr>
    <td><a href="#reset"><CopyableCode code="reset" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-branch_id_or_ref"><code>branch_id_or_ref</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Resets the specified database branch</td>
</tr>
<tr>
    <td><a href="#restore"><CopyableCode code="restore" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-branch_id_or_ref"><code>branch_id_or_ref</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Cancels scheduled deletion and restores the branch to active state</td>
</tr>
<tr>
    <td><a href="#disable_branching"><CopyableCode code="disable_branching" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Disables preview branching for the specified project</td>
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
<tr id="parameter-branch_id_or_ref">
    <td><CopyableCode code="branch_id_or_ref" /></td>
    <td><code></code></td>
    <td>Branch ref or deprecated branch ID</td>
</tr>
<tr id="parameter-name">
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr id="parameter-ref">
    <td><CopyableCode code="ref" /></td>
    <td><code>string</code></td>
    <td>Supabase project reference (the Project ID shown in the dashboard under Settings -&gt; General; 20 lowercase letters). Resolved from the SUPABASE_PROJECT_ID environment variable when it is set (x-stackQL-envVar); otherwise it must be supplied on every project-scoped query as WHERE ref = '&lt;ref&gt;'. A WHERE value always takes precedence over the environment. (x-stackQL-envVar: SUPABASE_PROJECT_ID)</td>
</tr>
<tr id="parameter-force">
    <td><CopyableCode code="force" /></td>
    <td><code>string</code></td>
    <td>If set to false, schedule deletion with 1-hour grace period (only when soft deletion is enabled).</td>
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

Fetches the specified database branch by its name.

```sql
SELECT
id,
name,
latest_check_run_id,
created_at,
deletion_scheduled_at,
git_branch,
is_default,
notify_url,
parent_project_ref,
persistent,
pr_number,
preview_project_status,
project_ref,
review_requested_at,
status,
updated_at,
with_data
FROM supabase.branches.branches
WHERE name = '{{ name }}' -- required
AND ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
<TabItem value="list">

Returns all database branches of the specified project.

```sql
SELECT
id,
name,
latest_check_run_id,
created_at,
deletion_scheduled_at,
git_branch,
is_default,
notify_url,
parent_project_ref,
persistent,
pr_number,
preview_project_status,
project_ref,
review_requested_at,
status,
updated_at,
with_data
FROM supabase.branches.branches
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

Creates a database branch from the specified project.

```sql
INSERT INTO supabase.branches.branches (
branch_name,
git_branch,
is_default,
persistent,
region,
desired_instance_size,
release_channel,
postgres_engine,
secrets,
with_data,
notify_url,
ref
)
SELECT 
'{{ branch_name }}' /* required */,
'{{ git_branch }}',
{{ is_default }},
{{ persistent }},
'{{ region }}',
'{{ desired_instance_size }}',
'{{ release_channel }}',
'{{ postgres_engine }}',
'{{ secrets }}',
{{ with_data }},
'{{ notify_url }}',
'{{ ref }}'
RETURNING
id,
name,
latest_check_run_id,
created_at,
deletion_scheduled_at,
git_branch,
is_default,
notify_url,
parent_project_ref,
persistent,
pr_number,
preview_project_status,
project_ref,
review_requested_at,
status,
updated_at,
with_data
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: branches
  props:
    - name: ref
      value: "{{ ref }}"
      description: Required parameter for the branches resource.
    - name: branch_name
      value: "{{ branch_name }}"
    - name: git_branch
      value: "{{ git_branch }}"
    - name: is_default
      value: {{ is_default }}
    - name: persistent
      value: {{ persistent }}
    - name: region
      value: "{{ region }}"
    - name: desired_instance_size
      value: "{{ desired_instance_size }}"
      valid_values: ['pico', 'nano', 'micro', 'small', 'medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '24xlarge_optimized_memory', '24xlarge_optimized_cpu', '24xlarge_high_memory', '48xlarge', '48xlarge_optimized_memory', '48xlarge_optimized_cpu', '48xlarge_high_memory']
    - name: release_channel
      value: "{{ release_channel }}"
      description: |
        Release channel. If not provided, GA will be used.
      valid_values: ['internal', 'alpha', 'beta', 'ga', 'withdrawn', 'preview']
    - name: postgres_engine
      value: "{{ postgres_engine }}"
      description: |
        Postgres engine version. If not provided, the latest version will be used.
      valid_values: ['15', '17', '17-oriole']
    - name: secrets
      value: "{{ secrets }}"
    - name: with_data
      value: {{ with_data }}
    - name: notify_url
      value: "{{ notify_url }}"
      description: |
        HTTP endpoint to receive branch status updates.
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

Updates the configuration of the specified database branch

```sql
UPDATE supabase.branches.branches
SET 
branch_name = '{{ branch_name }}',
git_branch = '{{ git_branch }}',
reset_on_push = {{ reset_on_push }},
persistent = {{ persistent }},
status = '{{ status }}',
request_review = {{ request_review }},
notify_url = '{{ notify_url }}'
WHERE 
branch_id_or_ref = '{{ branch_id_or_ref }}' --required
AND ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
RETURNING
id,
name,
latest_check_run_id,
created_at,
deletion_scheduled_at,
git_branch,
is_default,
notify_url,
parent_project_ref,
persistent,
pr_number,
preview_project_status,
project_ref,
review_requested_at,
status,
updated_at,
with_data;
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

Deletes the specified database branch. By default, deletes immediately. Use force=false to schedule deletion with 1-hour grace period (only when soft deletion is enabled).

```sql
DELETE FROM supabase.branches.branches
WHERE branch_id_or_ref = '{{ branch_id_or_ref }}' --required
AND ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
AND force = '{{ force }}'
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="push"
    values={[
        { label: 'push', value: 'push' },
        { label: 'merge', value: 'merge' },
        { label: 'reset', value: 'reset' },
        { label: 'restore', value: 'restore' },
        { label: 'disable_branching', value: 'disable_branching' }
    ]}
>
<TabItem value="push">

Pushes the specified database branch

```sql
EXEC supabase.branches.branches.push 
@branch_id_or_ref='{{ branch_id_or_ref }}' --required, 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set 
@@json=
'{
"migration_version": "{{ migration_version }}"
}'
;
```
</TabItem>
<TabItem value="merge">

Merges the specified database branch

```sql
EXEC supabase.branches.branches.merge 
@branch_id_or_ref='{{ branch_id_or_ref }}' --required, 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set 
@@json=
'{
"migration_version": "{{ migration_version }}"
}'
;
```
</TabItem>
<TabItem value="reset">

Resets the specified database branch

```sql
EXEC supabase.branches.branches.reset 
@branch_id_or_ref='{{ branch_id_or_ref }}' --required, 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set 
@@json=
'{
"migration_version": "{{ migration_version }}"
}'
;
```
</TabItem>
<TabItem value="restore">

Cancels scheduled deletion and restores the branch to active state

```sql
EXEC supabase.branches.branches.restore 
@branch_id_or_ref='{{ branch_id_or_ref }}' --required, 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
<TabItem value="disable_branching">

Disables preview branching for the specified project

```sql
EXEC supabase.branches.branches.disable_branching 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
</Tabs>
