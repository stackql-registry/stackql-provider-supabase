--- 
title: projects
hide_title: false
hide_table_of_contents: false
keywords:
  - projects
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

Creates, updates, deletes, gets or lists a <code>projects</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="projects" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.projects.projects" /></td></tr>
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
    <td><code>string</code></td>
    <td>Deprecated: Use `ref` instead.</td>
</tr>
<tr>
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td>Name of your project</td>
</tr>
<tr>
    <td><CopyableCode code="organization_id" /></td>
    <td><code>string</code></td>
    <td>Deprecated: Use `organization_slug` instead.</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>Creation timestamp</td>
</tr>
<tr>
    <td><CopyableCode code="database" /></td>
    <td><code>object</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="organization_slug" /></td>
    <td><code>string</code></td>
    <td>Organization slug (pattern: &lt;code&gt;^&#91;\w-&#93;+$&lt;/code&gt;, example: tsrqponmlkjihgfedcba)</td>
</tr>
<tr>
    <td><CopyableCode code="ref" /></td>
    <td><code>string</code></td>
    <td>Project ref (pattern: &lt;code&gt;^&#91;a-z&#93;+$&lt;/code&gt;, example: abcdefghijklmnopqrst)</td>
</tr>
<tr>
    <td><CopyableCode code="region" /></td>
    <td><code>string</code></td>
    <td>Region of your project</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td> (INACTIVE, ACTIVE_HEALTHY, ACTIVE_UNHEALTHY, COMING_UP, UNKNOWN, GOING_DOWN, INIT_FAILED, REMOVED, RESTORING, UPGRADING, PAUSING, RESTORE_FAILED, RESTARTING, PAUSE_FAILED, RESIZING)</td>
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
    <td><code>string</code></td>
    <td>Deprecated: Use `ref` instead.</td>
</tr>
<tr>
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td>Name of your project</td>
</tr>
<tr>
    <td><CopyableCode code="organization_id" /></td>
    <td><code>string</code></td>
    <td>Deprecated: Use `organization_slug` instead.</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>Creation timestamp</td>
</tr>
<tr>
    <td><CopyableCode code="database" /></td>
    <td><code>object</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="organization_slug" /></td>
    <td><code>string</code></td>
    <td>Organization slug (pattern: &lt;code&gt;^&#91;\w-&#93;+$&lt;/code&gt;, example: tsrqponmlkjihgfedcba)</td>
</tr>
<tr>
    <td><CopyableCode code="ref" /></td>
    <td><code>string</code></td>
    <td>Project ref (pattern: &lt;code&gt;^&#91;a-z&#93;+$&lt;/code&gt;, example: abcdefghijklmnopqrst)</td>
</tr>
<tr>
    <td><CopyableCode code="region" /></td>
    <td><code>string</code></td>
    <td>Region of your project</td>
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
    <td><a href="#get"><CopyableCode code="get" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Returns a list of all projects you've previously created.</td>
</tr>
<tr>
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-db_pass"><code>db_pass</code></a>, <a href="#parameter-name"><code>name</code></a>, <a href="#parameter-organization_slug"><code>organization_slug</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#update"><CopyableCode code="update" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-name"><code>name</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#upgrade"><CopyableCode code="upgrade" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-target_version"><code>target_version</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#pause"><CopyableCode code="pause" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#restart"><CopyableCode code="restart" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#restore"><CopyableCode code="restore" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#cancel_restore"><CopyableCode code="cancel_restore" /></a></td>
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
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

No description available.

```sql
SELECT
id,
name,
organization_id,
created_at,
database,
organization_slug,
ref,
region,
status
FROM supabase.projects.projects
WHERE ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
<TabItem value="list">

Returns a list of all projects you've previously created.

```sql
SELECT
id,
name,
organization_id,
created_at,
database,
organization_slug,
ref,
region,
status
FROM supabase.projects.projects
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

No description available.

```sql
INSERT INTO supabase.projects.projects (
db_pass,
name,
organization_id,
organization_slug,
plan,
region,
region_selection,
kps_enabled,
desired_instance_size,
template_url,
release_channel,
postgres_engine,
high_availability,
ref
)
SELECT 
'{{ db_pass }}' /* required */,
'{{ name }}' /* required */,
'{{ organization_id }}',
'{{ organization_slug }}' /* required */,
'{{ plan }}',
'{{ region }}',
'{{ region_selection }}',
{{ kps_enabled }},
'{{ desired_instance_size }}',
'{{ template_url }}',
'{{ release_channel }}',
'{{ postgres_engine }}',
{{ high_availability }},
'{{ ref }}'
RETURNING
id,
name,
organization_id,
created_at,
organization_slug,
ref,
region,
status
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: projects
  props:
    - name: ref
      value: "{{ ref }}"
      description: Required parameter for the projects resource.
    - name: db_pass
      value: "{{ db_pass }}"
      description: |
        Database password
    - name: name
      value: "{{ name }}"
      description: |
        Name of your project
    - name: organization_id
      value: "{{ organization_id }}"
      description: |
        Deprecated: Use \`organization_slug\` instead.
    - name: organization_slug
      value: "{{ organization_slug }}"
      description: |
        Organization slug
    - name: plan
      value: "{{ plan }}"
      description: |
        Subscription Plan is now set on organization level and is ignored in this request
      valid_values: ['free', 'pro']
    - name: region
      value: "{{ region }}"
      description: |
        Region you want your server to reside in. Use region_selection instead.
      valid_values: ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ap-east-1', 'ap-southeast-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-2', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1', 'eu-central-1', 'eu-central-2', 'ca-central-1', 'ap-south-1', 'sa-east-1']
    - name: region_selection
      description: |
        Region selection. Only one of region or region_selection can be specified.
      value:
        type: "{{ type }}"
        code: "{{ code }}"
    - name: kps_enabled
      value: {{ kps_enabled }}
      description: |
        This field is deprecated and is ignored in this request
    - name: desired_instance_size
      value: "{{ desired_instance_size }}"
      description: |
        Desired instance size. Omit this field to always default to the smallest possible size.
      valid_values: ['nano', 'micro', 'small', 'medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '24xlarge_optimized_memory', '24xlarge_optimized_cpu', '24xlarge_high_memory', '48xlarge', '48xlarge_optimized_memory', '48xlarge_optimized_cpu', '48xlarge_high_memory']
    - name: template_url
      value: "{{ template_url }}"
      description: |
        Template URL used to create the project from the CLI.
    - name: release_channel
      value: "{{ release_channel }}"
    - name: postgres_engine
      value: "{{ postgres_engine }}"
    - name: high_availability
      value: {{ high_availability }}
      description: |
        [Experimental] Whether to enable high availability for the project.
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

No description available.

```sql
UPDATE supabase.projects.projects
SET 
name = '{{ name }}'
WHERE 
ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
AND name = '{{ name }}' --required
RETURNING
id,
name,
ref;
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

No description available.

```sql
DELETE FROM supabase.projects.projects
WHERE ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="upgrade"
    values={[
        { label: 'upgrade', value: 'upgrade' },
        { label: 'pause', value: 'pause' },
        { label: 'restart', value: 'restart' },
        { label: 'restore', value: 'restore' },
        { label: 'cancel_restore', value: 'cancel_restore' }
    ]}
>
<TabItem value="upgrade">

No description available.

```sql
EXEC supabase.projects.projects.upgrade 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set 
@@json=
'{
"target_version": "{{ target_version }}", 
"release_channel": "{{ release_channel }}"
}'
;
```
</TabItem>
<TabItem value="pause">

No description available.

```sql
EXEC supabase.projects.projects.pause 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
<TabItem value="restart">

No description available.

```sql
EXEC supabase.projects.projects.restart 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
<TabItem value="restore">

No description available.

```sql
EXEC supabase.projects.projects.restore 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
<TabItem value="cancel_restore">

No description available.

```sql
EXEC supabase.projects.projects.cancel_restore 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
</Tabs>
