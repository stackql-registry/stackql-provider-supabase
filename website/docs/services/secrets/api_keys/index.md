--- 
title: api_keys
hide_title: false
hide_table_of_contents: false
keywords:
  - api_keys
  - secrets
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

Creates, updates, deletes, gets or lists an <code>api_keys</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="api_keys" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.secrets.api_keys" /></td></tr>
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
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="api_key" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="description" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hash" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="inserted_at" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z))$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="prefix" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="secret_jwt_template" /></td>
    <td><code>object</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td> (legacy, publishable, secret, )</td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z))$&lt;/code&gt;)</td>
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
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="api_key" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="description" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hash" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="inserted_at" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z))$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="prefix" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="secret_jwt_template" /></td>
    <td><code>object</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td> (legacy, publishable, secret, )</td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z))$&lt;/code&gt;)</td>
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
    <td><a href="#parameter-id"><code>id</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td><a href="#parameter-reveal"><code>reveal</code></a></td>
    <td></td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a></td>
    <td><a href="#parameter-reveal"><code>reveal</code></a></td>
    <td></td>
</tr>
<tr>
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-ref"><code>ref</code></a>, <a href="#parameter-type"><code>type</code></a>, <a href="#parameter-name"><code>name</code></a></td>
    <td><a href="#parameter-reveal"><code>reveal</code></a></td>
    <td></td>
</tr>
<tr>
    <td><a href="#update"><CopyableCode code="update" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-id"><code>id</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td><a href="#parameter-reveal"><code>reveal</code></a></td>
    <td></td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-id"><code>id</code></a>, <a href="#parameter-ref"><code>ref</code></a></td>
    <td><a href="#parameter-reveal"><code>reveal</code></a>, <a href="#parameter-was_compromised"><code>was_compromised</code></a>, <a href="#parameter-reason"><code>reason</code></a></td>
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
<tr id="parameter-id">
    <td><CopyableCode code="id" /></td>
    <td><code>string (uuid)</code></td>
    <td></td>
</tr>
<tr id="parameter-ref">
    <td><CopyableCode code="ref" /></td>
    <td><code>string</code></td>
    <td>Supabase project reference (the Project ID shown in the dashboard under Settings -&gt; General; 20 lowercase letters). Resolved from the SUPABASE_PROJECT_ID environment variable when it is set (x-stackQL-envVar); otherwise it must be supplied on every project-scoped query as WHERE ref = '&lt;ref&gt;'. A WHERE value always takes precedence over the environment. (x-stackQL-envVar: SUPABASE_PROJECT_ID)</td>
</tr>
<tr id="parameter-reason">
    <td><CopyableCode code="reason" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr id="parameter-reveal">
    <td><CopyableCode code="reveal" /></td>
    <td><code>string</code></td>
    <td>Boolean string, true or false</td>
</tr>
<tr id="parameter-was_compromised">
    <td><CopyableCode code="was_compromised" /></td>
    <td><code>string</code></td>
    <td>Boolean string, true or false</td>
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
api_key,
description,
hash,
inserted_at,
prefix,
secret_jwt_template,
type,
updated_at
FROM supabase.secrets.api_keys
WHERE id = '{{ id }}' -- required
AND ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
AND reveal = '{{ reveal }}'
;
```
</TabItem>
<TabItem value="list">

No description available.

```sql
SELECT
id,
name,
api_key,
description,
hash,
inserted_at,
prefix,
secret_jwt_template,
type,
updated_at
FROM supabase.secrets.api_keys
WHERE ref = '{{ ref }}' -- required unless SUPABASE_PROJECT_ID is set
AND reveal = '{{ reveal }}'
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
INSERT INTO supabase.secrets.api_keys (
type,
name,
description,
secret_jwt_template,
ref,
reveal
)
SELECT 
'{{ type }}' /* required */,
'{{ name }}' /* required */,
'{{ description }}',
'{{ secret_jwt_template }}',
'{{ ref }}',
'{{ reveal }}'
RETURNING
id,
name,
api_key,
description,
hash,
inserted_at,
prefix,
secret_jwt_template,
type,
updated_at
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: api_keys
  props:
    - name: ref
      value: "{{ ref }}"
      description: Required parameter for the api_keys resource.
    - name: type
      value: "{{ type }}"
      valid_values: ['publishable', 'secret']
    - name: name
      value: "{{ name }}"
    - name: description
      value: "{{ description }}"
    - name: secret_jwt_template
      value: "{{ secret_jwt_template }}"
    - name: reveal
      value: "{{ reveal }}"
      description: Boolean string.  Truthy values: \`true\`, \`1\`, \`yes\`, \`on\`, \`y\`, \`enabled\`  Falsy values: \`false\`, \`0\`, \`no\`, \`off\`, \`n\`, \`disabled\`
      description: Boolean string.  Truthy values: \`true\`, \`1\`, \`yes\`, \`on\`, \`y\`, \`enabled\`  Falsy values: \`false\`, \`0\`, \`no\`, \`off\`, \`n\`, \`disabled\`
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
UPDATE supabase.secrets.api_keys
SET 
name = '{{ name }}',
description = '{{ description }}',
secret_jwt_template = '{{ secret_jwt_template }}'
WHERE 
id = '{{ id }}' --required
AND ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
AND reveal = '{{ reveal}}'
RETURNING
id,
name,
api_key,
description,
hash,
inserted_at,
prefix,
secret_jwt_template,
type,
updated_at;
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
DELETE FROM supabase.secrets.api_keys
WHERE id = '{{ id }}' --required
AND ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
AND reveal = '{{ reveal }}'
AND was_compromised = '{{ was_compromised }}'
AND reason = '{{ reason }}'
;
```
</TabItem>
</Tabs>
