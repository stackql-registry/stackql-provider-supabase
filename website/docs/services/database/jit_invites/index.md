--- 
title: jit_invites
hide_title: false
hide_table_of_contents: false
keywords:
  - jit_invites
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

Creates, updates, deletes, gets or lists a <code>jit_invites</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="jit_invites" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.database.jit_invites" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

`SELECT` not supported for this resource, use `SHOW METHODS` to view available operations for the resource.


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
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-email"><code>email</code></a>, <a href="#parameter-roles"><code>roles</code></a></td>
    <td></td>
    <td>Invites the external user and sets initial roles that can be assumed and for how long</td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-invite_id"><code>invite_id</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td></td>
    <td>Revokes and deletes the invitation</td>
</tr>
<tr>
    <td><a href="#accept"><CopyableCode code="accept" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-email"><code>email</code></a>, <a href="#parameter-token"><code>token</code></a></td>
    <td></td>
    <td>Accepts the invitation to JIT database access</td>
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
<tr id="parameter-invite_id">
    <td><CopyableCode code="invite_id" /></td>
    <td><code>string (uuid)</code></td>
    <td></td>
</tr>
<tr id="parameter-ref">
    <td><CopyableCode code="ref" /></td>
    <td><code>string</code></td>
    <td>Supabase project reference (the Project ID shown in the dashboard under Settings -&gt; General; 20 lowercase letters). Resolved from the SUPABASE_PROJECT_ID environment variable when it is set (x-stackQL-envVar); otherwise it must be supplied on every project-scoped query as WHERE ref = '&lt;ref&gt;'. A WHERE value always takes precedence over the environment. (x-stackQL-envVar: SUPABASE_PROJECT_ID)</td>
</tr>
</tbody>
</table>

## `INSERT` examples

<Tabs
    defaultValue="create"
    values={[
        { label: 'create', value: 'create' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create">

Invites the external user and sets initial roles that can be assumed and for how long

```sql
INSERT INTO supabase.database.jit_invites (
email,
roles,
ref
)
SELECT 
'{{ email }}' /* required */,
'{{ roles }}' /* required */,
'{{ ref }}'
RETURNING
invite_id,
email,
user_roles
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: jit_invites
  props:
    - name: ref
      value: "{{ ref }}"
      description: Required parameter for the jit_invites resource.
    - name: email
      value: "{{ email }}"
    - name: roles
      value:
        - role: "{{ role }}"
          expires_at: {{ expires_at }}
          allowed_networks:
            allowed_cidrs:
              - cidr: "{{ cidr }}"
            allowed_cidrs_v6:
              - cidr: "{{ cidr }}"
          branches_only: {{ branches_only }}
`}</CodeBlock>

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

Revokes and deletes the invitation

```sql
DELETE FROM supabase.database.jit_invites
WHERE invite_id = '{{ invite_id }}' --required
AND ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="accept"
    values={[
        { label: 'accept', value: 'accept' }
    ]}
>
<TabItem value="accept">

Accepts the invitation to JIT database access

```sql
EXEC supabase.database.jit_invites.accept 
@ref='{{ ref }}' --required unless SUPABASE_PROJECT_ID is set 
@@json=
'{
"email": "{{ email }}", 
"token": "{{ token }}"
}'
;
```
</TabItem>
</Tabs>
