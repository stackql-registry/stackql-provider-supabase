--- 
title: auth_configs
hide_title: false
hide_table_of_contents: false
keywords:
  - auth_configs
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

Creates, updates, deletes, gets or lists an <code>auth_configs</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="auth_configs" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="supabase.config.auth_configs" /></td></tr>
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
    <td><CopyableCode code="external_apple_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_azure_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_bitbucket_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_discord_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_facebook_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_figma_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_github_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_gitlab_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_google_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_kakao_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_keycloak_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_linkedin_oidc_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_notion_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_slack_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_slack_oidc_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_spotify_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_twitch_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_twitter_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_workos_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_x_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_zoom_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="nimbus_oauth_client_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="webauthn_rp_id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="smtp_sender_name" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="webauthn_rp_display_name" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="api_max_request_duration" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="custom_oauth_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="custom_oauth_max_providers" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="db_max_pool_size" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="db_max_pool_size_unit" /></td>
    <td><code>string</code></td>
    <td> (connections, percent, )</td>
</tr>
<tr>
    <td><CopyableCode code="disable_signup" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_anonymous_users_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_apple_additional_client_ids" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_apple_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_apple_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_apple_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_azure_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_azure_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_azure_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_azure_url" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_bitbucket_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_bitbucket_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_bitbucket_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_discord_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_discord_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_discord_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_email_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_facebook_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_facebook_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_facebook_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_figma_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_figma_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_figma_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_github_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_github_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_github_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_gitlab_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_gitlab_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_gitlab_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_gitlab_url" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_google_additional_client_ids" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_google_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_google_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_google_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_google_skip_nonce_check" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_kakao_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_kakao_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_kakao_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_keycloak_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_keycloak_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_keycloak_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_keycloak_url" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_linkedin_oidc_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_linkedin_oidc_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_linkedin_oidc_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_notion_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_notion_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_notion_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_phone_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_slack_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_slack_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_slack_oidc_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_slack_oidc_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_slack_oidc_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_slack_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_spotify_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_spotify_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_spotify_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_twitch_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_twitch_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_twitch_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_twitter_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_twitter_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_twitter_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_web3_ethereum_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_web3_solana_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_workos_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_workos_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_workos_url" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_x_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_x_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_x_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_zoom_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_zoom_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="external_zoom_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_after_user_created_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_after_user_created_secrets" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_after_user_created_uri" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_before_user_created_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_before_user_created_secrets" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_before_user_created_uri" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_custom_access_token_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_custom_access_token_secrets" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_custom_access_token_uri" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_mfa_verification_attempt_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_mfa_verification_attempt_secrets" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_mfa_verification_attempt_uri" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_password_verification_attempt_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_password_verification_attempt_secrets" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_password_verification_attempt_uri" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_send_email_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_send_email_secrets" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_send_email_uri" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_send_sms_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_send_sms_secrets" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="hook_send_sms_uri" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="jwt_exp" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_allow_unverified_email_sign_ins" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_autoconfirm" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_notifications_email_changed_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_notifications_identity_linked_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_notifications_identity_unlinked_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_notifications_mfa_factor_enrolled_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_notifications_mfa_factor_unenrolled_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_notifications_password_changed_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_notifications_phone_changed_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_otp_exp" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_otp_length" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_secure_email_change_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_confirmation" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_email_change" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_email_changed_notification" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_identity_linked_notification" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_identity_unlinked_notification" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_invite" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_magic_link" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_mfa_factor_enrolled_notification" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_mfa_factor_unenrolled_notification" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_password_changed_notification" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_phone_changed_notification" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_reauthentication" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_subjects_recovery" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_confirmation_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_email_change_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_email_changed_notification_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_identity_linked_notification_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_identity_unlinked_notification_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_invite_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_magic_link_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_mfa_factor_enrolled_notification_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_mfa_factor_unenrolled_notification_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_password_changed_notification_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_phone_changed_notification_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_reauthentication_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mailer_templates_recovery_content" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mfa_max_enrolled_factors" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mfa_phone_enroll_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mfa_phone_max_frequency" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mfa_phone_otp_length" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mfa_phone_template" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mfa_phone_verify_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mfa_totp_enroll_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mfa_totp_verify_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mfa_web_authn_enroll_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="mfa_web_authn_verify_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="nimbus_oauth_client_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="nimbus_oauth_email_optional" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="oauth_server_allow_dynamic_registration" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="oauth_server_authorization_path" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="oauth_server_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="passkey_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="password_hibp_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="password_min_length" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="password_required_characters" /></td>
    <td><code>string</code></td>
    <td> (abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789, abcdefghijklmnopqrstuvwxyz:ABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789, abcdefghijklmnopqrstuvwxyz:ABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789:!@#$%^&*()_+-=&#91;&#93;&#123;&#125;;'\\:"|&lt;&gt;?,./`~, , )</td>
</tr>
<tr>
    <td><CopyableCode code="rate_limit_anonymous_users" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="rate_limit_email_sent" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="rate_limit_otp" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="rate_limit_sms_sent" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="rate_limit_token_refresh" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="rate_limit_verify" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="rate_limit_web3" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="refresh_token_rotation_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="saml_allow_encrypted_assertions" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="saml_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="saml_external_url" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="security_captcha_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="security_captcha_provider" /></td>
    <td><code>string</code></td>
    <td> (turnstile, hcaptcha, )</td>
</tr>
<tr>
    <td><CopyableCode code="security_captcha_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="security_manual_linking_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="security_refresh_token_reuse_interval" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="security_sb_forwarded_for_enabled" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="security_update_password_require_reauthentication" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sessions_inactivity_timeout" /></td>
    <td><code>number</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sessions_single_per_user" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sessions_tags" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sessions_timebox" /></td>
    <td><code>number</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="site_url" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_autoconfirm" /></td>
    <td><code>boolean</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_max_frequency" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_messagebird_access_key" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_messagebird_originator" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_otp_exp" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_otp_length" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_provider" /></td>
    <td><code>string</code></td>
    <td> (messagebird, textlocal, twilio, twilio_verify, vonage, )</td>
</tr>
<tr>
    <td><CopyableCode code="sms_template" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_test_otp" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_test_otp_valid_until" /></td>
    <td><code>string (date-time)</code></td>
    <td> (pattern: &lt;code&gt;^(?:(?:\d\d&#91;2468&#93;&#91;048&#93;|\d\d&#91;13579&#93;&#91;26&#93;|\d\d0&#91;48&#93;|&#91;02468&#93;&#91;048&#93;00|&#91;13579&#93;&#91;26&#93;00)-02-29|\d&#123;4&#125;-(?:(?:0&#91;13578&#93;|1&#91;02&#93;)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|3&#91;01&#93;)|(?:0&#91;469&#93;|11)-(?:0&#91;1-9&#93;|&#91;12&#93;\d|30)|(?:02)-(?:0&#91;1-9&#93;|1\d|2&#91;0-8&#93;)))T(?:(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d(?::&#91;0-5&#93;\d(?:\.\d+)?)?(?:Z|(&#91;+-&#93;(?:&#91;01&#93;\d|2&#91;0-3&#93;):&#91;0-5&#93;\d)))$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="sms_textlocal_api_key" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_textlocal_sender" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_twilio_account_sid" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_twilio_auth_token" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_twilio_content_sid" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_twilio_message_service_sid" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_twilio_verify_account_sid" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_twilio_verify_auth_token" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_twilio_verify_message_service_sid" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_vonage_api_key" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_vonage_api_secret" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="sms_vonage_from" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="smtp_admin_email" /></td>
    <td><code>string (email)</code></td>
    <td> (pattern: &lt;code&gt;^(?!\.)(?!.*\.\.)(&#91;A-Za-z0-9_'+\-\.&#93;*)&#91;A-Za-z0-9_+-&#93;@(&#91;A-Za-z0-9&#93;&#91;A-Za-z0-9\-&#93;*\.)+&#91;A-Za-z&#93;&#123;2,&#125;$&lt;/code&gt;)</td>
</tr>
<tr>
    <td><CopyableCode code="smtp_host" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="smtp_max_frequency" /></td>
    <td><code>integer</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="smtp_pass" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="smtp_port" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="smtp_user" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="uri_allow_list" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="webauthn_rp_origins" /></td>
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
external_apple_client_id,
external_azure_client_id,
external_bitbucket_client_id,
external_discord_client_id,
external_facebook_client_id,
external_figma_client_id,
external_github_client_id,
external_gitlab_client_id,
external_google_client_id,
external_kakao_client_id,
external_keycloak_client_id,
external_linkedin_oidc_client_id,
external_notion_client_id,
external_slack_client_id,
external_slack_oidc_client_id,
external_spotify_client_id,
external_twitch_client_id,
external_twitter_client_id,
external_workos_client_id,
external_x_client_id,
external_zoom_client_id,
nimbus_oauth_client_id,
webauthn_rp_id,
smtp_sender_name,
webauthn_rp_display_name,
api_max_request_duration,
custom_oauth_enabled,
custom_oauth_max_providers,
db_max_pool_size,
db_max_pool_size_unit,
disable_signup,
external_anonymous_users_enabled,
external_apple_additional_client_ids,
external_apple_email_optional,
external_apple_enabled,
external_apple_secret,
external_azure_email_optional,
external_azure_enabled,
external_azure_secret,
external_azure_url,
external_bitbucket_email_optional,
external_bitbucket_enabled,
external_bitbucket_secret,
external_discord_email_optional,
external_discord_enabled,
external_discord_secret,
external_email_enabled,
external_facebook_email_optional,
external_facebook_enabled,
external_facebook_secret,
external_figma_email_optional,
external_figma_enabled,
external_figma_secret,
external_github_email_optional,
external_github_enabled,
external_github_secret,
external_gitlab_email_optional,
external_gitlab_enabled,
external_gitlab_secret,
external_gitlab_url,
external_google_additional_client_ids,
external_google_email_optional,
external_google_enabled,
external_google_secret,
external_google_skip_nonce_check,
external_kakao_email_optional,
external_kakao_enabled,
external_kakao_secret,
external_keycloak_email_optional,
external_keycloak_enabled,
external_keycloak_secret,
external_keycloak_url,
external_linkedin_oidc_email_optional,
external_linkedin_oidc_enabled,
external_linkedin_oidc_secret,
external_notion_email_optional,
external_notion_enabled,
external_notion_secret,
external_phone_enabled,
external_slack_email_optional,
external_slack_enabled,
external_slack_oidc_email_optional,
external_slack_oidc_enabled,
external_slack_oidc_secret,
external_slack_secret,
external_spotify_email_optional,
external_spotify_enabled,
external_spotify_secret,
external_twitch_email_optional,
external_twitch_enabled,
external_twitch_secret,
external_twitter_email_optional,
external_twitter_enabled,
external_twitter_secret,
external_web3_ethereum_enabled,
external_web3_solana_enabled,
external_workos_enabled,
external_workos_secret,
external_workos_url,
external_x_email_optional,
external_x_enabled,
external_x_secret,
external_zoom_email_optional,
external_zoom_enabled,
external_zoom_secret,
hook_after_user_created_enabled,
hook_after_user_created_secrets,
hook_after_user_created_uri,
hook_before_user_created_enabled,
hook_before_user_created_secrets,
hook_before_user_created_uri,
hook_custom_access_token_enabled,
hook_custom_access_token_secrets,
hook_custom_access_token_uri,
hook_mfa_verification_attempt_enabled,
hook_mfa_verification_attempt_secrets,
hook_mfa_verification_attempt_uri,
hook_password_verification_attempt_enabled,
hook_password_verification_attempt_secrets,
hook_password_verification_attempt_uri,
hook_send_email_enabled,
hook_send_email_secrets,
hook_send_email_uri,
hook_send_sms_enabled,
hook_send_sms_secrets,
hook_send_sms_uri,
jwt_exp,
mailer_allow_unverified_email_sign_ins,
mailer_autoconfirm,
mailer_notifications_email_changed_enabled,
mailer_notifications_identity_linked_enabled,
mailer_notifications_identity_unlinked_enabled,
mailer_notifications_mfa_factor_enrolled_enabled,
mailer_notifications_mfa_factor_unenrolled_enabled,
mailer_notifications_password_changed_enabled,
mailer_notifications_phone_changed_enabled,
mailer_otp_exp,
mailer_otp_length,
mailer_secure_email_change_enabled,
mailer_subjects_confirmation,
mailer_subjects_email_change,
mailer_subjects_email_changed_notification,
mailer_subjects_identity_linked_notification,
mailer_subjects_identity_unlinked_notification,
mailer_subjects_invite,
mailer_subjects_magic_link,
mailer_subjects_mfa_factor_enrolled_notification,
mailer_subjects_mfa_factor_unenrolled_notification,
mailer_subjects_password_changed_notification,
mailer_subjects_phone_changed_notification,
mailer_subjects_reauthentication,
mailer_subjects_recovery,
mailer_templates_confirmation_content,
mailer_templates_email_change_content,
mailer_templates_email_changed_notification_content,
mailer_templates_identity_linked_notification_content,
mailer_templates_identity_unlinked_notification_content,
mailer_templates_invite_content,
mailer_templates_magic_link_content,
mailer_templates_mfa_factor_enrolled_notification_content,
mailer_templates_mfa_factor_unenrolled_notification_content,
mailer_templates_password_changed_notification_content,
mailer_templates_phone_changed_notification_content,
mailer_templates_reauthentication_content,
mailer_templates_recovery_content,
mfa_max_enrolled_factors,
mfa_phone_enroll_enabled,
mfa_phone_max_frequency,
mfa_phone_otp_length,
mfa_phone_template,
mfa_phone_verify_enabled,
mfa_totp_enroll_enabled,
mfa_totp_verify_enabled,
mfa_web_authn_enroll_enabled,
mfa_web_authn_verify_enabled,
nimbus_oauth_client_secret,
nimbus_oauth_email_optional,
oauth_server_allow_dynamic_registration,
oauth_server_authorization_path,
oauth_server_enabled,
passkey_enabled,
password_hibp_enabled,
password_min_length,
password_required_characters,
rate_limit_anonymous_users,
rate_limit_email_sent,
rate_limit_otp,
rate_limit_sms_sent,
rate_limit_token_refresh,
rate_limit_verify,
rate_limit_web3,
refresh_token_rotation_enabled,
saml_allow_encrypted_assertions,
saml_enabled,
saml_external_url,
security_captcha_enabled,
security_captcha_provider,
security_captcha_secret,
security_manual_linking_enabled,
security_refresh_token_reuse_interval,
security_sb_forwarded_for_enabled,
security_update_password_require_reauthentication,
sessions_inactivity_timeout,
sessions_single_per_user,
sessions_tags,
sessions_timebox,
site_url,
sms_autoconfirm,
sms_max_frequency,
sms_messagebird_access_key,
sms_messagebird_originator,
sms_otp_exp,
sms_otp_length,
sms_provider,
sms_template,
sms_test_otp,
sms_test_otp_valid_until,
sms_textlocal_api_key,
sms_textlocal_sender,
sms_twilio_account_sid,
sms_twilio_auth_token,
sms_twilio_content_sid,
sms_twilio_message_service_sid,
sms_twilio_verify_account_sid,
sms_twilio_verify_auth_token,
sms_twilio_verify_message_service_sid,
sms_vonage_api_key,
sms_vonage_api_secret,
sms_vonage_from,
smtp_admin_email,
smtp_host,
smtp_max_frequency,
smtp_pass,
smtp_port,
smtp_user,
uri_allow_list,
webauthn_rp_origins
FROM supabase.config.auth_configs
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
UPDATE supabase.config.auth_configs
SET 
site_url = '{{ site_url }}',
disable_signup = {{ disable_signup }},
jwt_exp = {{ jwt_exp }},
smtp_admin_email = '{{ smtp_admin_email }}',
smtp_host = '{{ smtp_host }}',
smtp_port = '{{ smtp_port }}',
smtp_user = '{{ smtp_user }}',
smtp_pass = '{{ smtp_pass }}',
smtp_max_frequency = {{ smtp_max_frequency }},
smtp_sender_name = '{{ smtp_sender_name }}',
mailer_allow_unverified_email_sign_ins = {{ mailer_allow_unverified_email_sign_ins }},
mailer_autoconfirm = {{ mailer_autoconfirm }},
mailer_subjects_invite = '{{ mailer_subjects_invite }}',
mailer_subjects_confirmation = '{{ mailer_subjects_confirmation }}',
mailer_subjects_recovery = '{{ mailer_subjects_recovery }}',
mailer_subjects_email_change = '{{ mailer_subjects_email_change }}',
mailer_subjects_magic_link = '{{ mailer_subjects_magic_link }}',
mailer_subjects_reauthentication = '{{ mailer_subjects_reauthentication }}',
mailer_subjects_password_changed_notification = '{{ mailer_subjects_password_changed_notification }}',
mailer_subjects_email_changed_notification = '{{ mailer_subjects_email_changed_notification }}',
mailer_subjects_phone_changed_notification = '{{ mailer_subjects_phone_changed_notification }}',
mailer_subjects_mfa_factor_enrolled_notification = '{{ mailer_subjects_mfa_factor_enrolled_notification }}',
mailer_subjects_mfa_factor_unenrolled_notification = '{{ mailer_subjects_mfa_factor_unenrolled_notification }}',
mailer_subjects_identity_linked_notification = '{{ mailer_subjects_identity_linked_notification }}',
mailer_subjects_identity_unlinked_notification = '{{ mailer_subjects_identity_unlinked_notification }}',
mailer_templates_invite_content = '{{ mailer_templates_invite_content }}',
mailer_templates_confirmation_content = '{{ mailer_templates_confirmation_content }}',
mailer_templates_recovery_content = '{{ mailer_templates_recovery_content }}',
mailer_templates_email_change_content = '{{ mailer_templates_email_change_content }}',
mailer_templates_magic_link_content = '{{ mailer_templates_magic_link_content }}',
mailer_templates_reauthentication_content = '{{ mailer_templates_reauthentication_content }}',
mailer_templates_password_changed_notification_content = '{{ mailer_templates_password_changed_notification_content }}',
mailer_templates_email_changed_notification_content = '{{ mailer_templates_email_changed_notification_content }}',
mailer_templates_phone_changed_notification_content = '{{ mailer_templates_phone_changed_notification_content }}',
mailer_templates_mfa_factor_enrolled_notification_content = '{{ mailer_templates_mfa_factor_enrolled_notification_content }}',
mailer_templates_mfa_factor_unenrolled_notification_content = '{{ mailer_templates_mfa_factor_unenrolled_notification_content }}',
mailer_templates_identity_linked_notification_content = '{{ mailer_templates_identity_linked_notification_content }}',
mailer_templates_identity_unlinked_notification_content = '{{ mailer_templates_identity_unlinked_notification_content }}',
mailer_notifications_password_changed_enabled = {{ mailer_notifications_password_changed_enabled }},
mailer_notifications_email_changed_enabled = {{ mailer_notifications_email_changed_enabled }},
mailer_notifications_phone_changed_enabled = {{ mailer_notifications_phone_changed_enabled }},
mailer_notifications_mfa_factor_enrolled_enabled = {{ mailer_notifications_mfa_factor_enrolled_enabled }},
mailer_notifications_mfa_factor_unenrolled_enabled = {{ mailer_notifications_mfa_factor_unenrolled_enabled }},
mailer_notifications_identity_linked_enabled = {{ mailer_notifications_identity_linked_enabled }},
mailer_notifications_identity_unlinked_enabled = {{ mailer_notifications_identity_unlinked_enabled }},
mfa_max_enrolled_factors = {{ mfa_max_enrolled_factors }},
uri_allow_list = '{{ uri_allow_list }}',
external_anonymous_users_enabled = {{ external_anonymous_users_enabled }},
external_email_enabled = {{ external_email_enabled }},
external_phone_enabled = {{ external_phone_enabled }},
saml_enabled = {{ saml_enabled }},
saml_external_url = '{{ saml_external_url }}',
security_sb_forwarded_for_enabled = {{ security_sb_forwarded_for_enabled }},
security_captcha_enabled = {{ security_captcha_enabled }},
security_captcha_provider = '{{ security_captcha_provider }}',
security_captcha_secret = '{{ security_captcha_secret }}',
sessions_timebox = {{ sessions_timebox }},
sessions_inactivity_timeout = {{ sessions_inactivity_timeout }},
sessions_single_per_user = {{ sessions_single_per_user }},
sessions_tags = '{{ sessions_tags }}',
rate_limit_anonymous_users = {{ rate_limit_anonymous_users }},
rate_limit_email_sent = {{ rate_limit_email_sent }},
rate_limit_sms_sent = {{ rate_limit_sms_sent }},
rate_limit_verify = {{ rate_limit_verify }},
rate_limit_token_refresh = {{ rate_limit_token_refresh }},
rate_limit_otp = {{ rate_limit_otp }},
rate_limit_web3 = {{ rate_limit_web3 }},
mailer_secure_email_change_enabled = {{ mailer_secure_email_change_enabled }},
refresh_token_rotation_enabled = {{ refresh_token_rotation_enabled }},
password_hibp_enabled = {{ password_hibp_enabled }},
password_min_length = {{ password_min_length }},
password_required_characters = '{{ password_required_characters }}',
security_manual_linking_enabled = {{ security_manual_linking_enabled }},
security_update_password_require_reauthentication = {{ security_update_password_require_reauthentication }},
security_refresh_token_reuse_interval = {{ security_refresh_token_reuse_interval }},
mailer_otp_exp = {{ mailer_otp_exp }},
mailer_otp_length = {{ mailer_otp_length }},
sms_autoconfirm = {{ sms_autoconfirm }},
sms_max_frequency = {{ sms_max_frequency }},
sms_otp_exp = {{ sms_otp_exp }},
sms_otp_length = {{ sms_otp_length }},
sms_provider = '{{ sms_provider }}',
sms_messagebird_access_key = '{{ sms_messagebird_access_key }}',
sms_messagebird_originator = '{{ sms_messagebird_originator }}',
sms_test_otp = '{{ sms_test_otp }}',
sms_test_otp_valid_until = '{{ sms_test_otp_valid_until }}',
sms_textlocal_api_key = '{{ sms_textlocal_api_key }}',
sms_textlocal_sender = '{{ sms_textlocal_sender }}',
sms_twilio_account_sid = '{{ sms_twilio_account_sid }}',
sms_twilio_auth_token = '{{ sms_twilio_auth_token }}',
sms_twilio_content_sid = '{{ sms_twilio_content_sid }}',
sms_twilio_message_service_sid = '{{ sms_twilio_message_service_sid }}',
sms_twilio_verify_account_sid = '{{ sms_twilio_verify_account_sid }}',
sms_twilio_verify_auth_token = '{{ sms_twilio_verify_auth_token }}',
sms_twilio_verify_message_service_sid = '{{ sms_twilio_verify_message_service_sid }}',
sms_vonage_api_key = '{{ sms_vonage_api_key }}',
sms_vonage_api_secret = '{{ sms_vonage_api_secret }}',
sms_vonage_from = '{{ sms_vonage_from }}',
sms_template = '{{ sms_template }}',
hook_mfa_verification_attempt_enabled = {{ hook_mfa_verification_attempt_enabled }},
hook_mfa_verification_attempt_uri = '{{ hook_mfa_verification_attempt_uri }}',
hook_mfa_verification_attempt_secrets = '{{ hook_mfa_verification_attempt_secrets }}',
hook_password_verification_attempt_enabled = {{ hook_password_verification_attempt_enabled }},
hook_password_verification_attempt_uri = '{{ hook_password_verification_attempt_uri }}',
hook_password_verification_attempt_secrets = '{{ hook_password_verification_attempt_secrets }}',
hook_custom_access_token_enabled = {{ hook_custom_access_token_enabled }},
hook_custom_access_token_uri = '{{ hook_custom_access_token_uri }}',
hook_custom_access_token_secrets = '{{ hook_custom_access_token_secrets }}',
hook_send_sms_enabled = {{ hook_send_sms_enabled }},
hook_send_sms_uri = '{{ hook_send_sms_uri }}',
hook_send_sms_secrets = '{{ hook_send_sms_secrets }}',
hook_send_email_enabled = {{ hook_send_email_enabled }},
hook_send_email_uri = '{{ hook_send_email_uri }}',
hook_send_email_secrets = '{{ hook_send_email_secrets }}',
hook_before_user_created_enabled = {{ hook_before_user_created_enabled }},
hook_before_user_created_uri = '{{ hook_before_user_created_uri }}',
hook_before_user_created_secrets = '{{ hook_before_user_created_secrets }}',
hook_after_user_created_enabled = {{ hook_after_user_created_enabled }},
hook_after_user_created_uri = '{{ hook_after_user_created_uri }}',
hook_after_user_created_secrets = '{{ hook_after_user_created_secrets }}',
external_apple_enabled = {{ external_apple_enabled }},
external_apple_client_id = '{{ external_apple_client_id }}',
external_apple_email_optional = {{ external_apple_email_optional }},
external_apple_secret = '{{ external_apple_secret }}',
external_apple_additional_client_ids = '{{ external_apple_additional_client_ids }}',
external_azure_enabled = {{ external_azure_enabled }},
external_azure_client_id = '{{ external_azure_client_id }}',
external_azure_email_optional = {{ external_azure_email_optional }},
external_azure_secret = '{{ external_azure_secret }}',
external_azure_url = '{{ external_azure_url }}',
external_bitbucket_enabled = {{ external_bitbucket_enabled }},
external_bitbucket_client_id = '{{ external_bitbucket_client_id }}',
external_bitbucket_email_optional = {{ external_bitbucket_email_optional }},
external_bitbucket_secret = '{{ external_bitbucket_secret }}',
external_discord_enabled = {{ external_discord_enabled }},
external_discord_client_id = '{{ external_discord_client_id }}',
external_discord_email_optional = {{ external_discord_email_optional }},
external_discord_secret = '{{ external_discord_secret }}',
external_facebook_enabled = {{ external_facebook_enabled }},
external_facebook_client_id = '{{ external_facebook_client_id }}',
external_facebook_email_optional = {{ external_facebook_email_optional }},
external_facebook_secret = '{{ external_facebook_secret }}',
external_figma_enabled = {{ external_figma_enabled }},
external_figma_client_id = '{{ external_figma_client_id }}',
external_figma_email_optional = {{ external_figma_email_optional }},
external_figma_secret = '{{ external_figma_secret }}',
external_github_enabled = {{ external_github_enabled }},
external_github_client_id = '{{ external_github_client_id }}',
external_github_email_optional = {{ external_github_email_optional }},
external_github_secret = '{{ external_github_secret }}',
external_gitlab_enabled = {{ external_gitlab_enabled }},
external_gitlab_client_id = '{{ external_gitlab_client_id }}',
external_gitlab_email_optional = {{ external_gitlab_email_optional }},
external_gitlab_secret = '{{ external_gitlab_secret }}',
external_gitlab_url = '{{ external_gitlab_url }}',
external_google_enabled = {{ external_google_enabled }},
external_google_client_id = '{{ external_google_client_id }}',
external_google_email_optional = {{ external_google_email_optional }},
external_google_secret = '{{ external_google_secret }}',
external_google_additional_client_ids = '{{ external_google_additional_client_ids }}',
external_google_skip_nonce_check = {{ external_google_skip_nonce_check }},
external_kakao_enabled = {{ external_kakao_enabled }},
external_kakao_client_id = '{{ external_kakao_client_id }}',
external_kakao_email_optional = {{ external_kakao_email_optional }},
external_kakao_secret = '{{ external_kakao_secret }}',
external_keycloak_enabled = {{ external_keycloak_enabled }},
external_keycloak_client_id = '{{ external_keycloak_client_id }}',
external_keycloak_email_optional = {{ external_keycloak_email_optional }},
external_keycloak_secret = '{{ external_keycloak_secret }}',
external_keycloak_url = '{{ external_keycloak_url }}',
external_linkedin_oidc_enabled = {{ external_linkedin_oidc_enabled }},
external_linkedin_oidc_client_id = '{{ external_linkedin_oidc_client_id }}',
external_linkedin_oidc_email_optional = {{ external_linkedin_oidc_email_optional }},
external_linkedin_oidc_secret = '{{ external_linkedin_oidc_secret }}',
external_slack_oidc_enabled = {{ external_slack_oidc_enabled }},
external_slack_oidc_client_id = '{{ external_slack_oidc_client_id }}',
external_slack_oidc_email_optional = {{ external_slack_oidc_email_optional }},
external_slack_oidc_secret = '{{ external_slack_oidc_secret }}',
external_notion_enabled = {{ external_notion_enabled }},
external_notion_client_id = '{{ external_notion_client_id }}',
external_notion_email_optional = {{ external_notion_email_optional }},
external_notion_secret = '{{ external_notion_secret }}',
external_slack_enabled = {{ external_slack_enabled }},
external_slack_client_id = '{{ external_slack_client_id }}',
external_slack_email_optional = {{ external_slack_email_optional }},
external_slack_secret = '{{ external_slack_secret }}',
external_spotify_enabled = {{ external_spotify_enabled }},
external_spotify_client_id = '{{ external_spotify_client_id }}',
external_spotify_email_optional = {{ external_spotify_email_optional }},
external_spotify_secret = '{{ external_spotify_secret }}',
external_twitch_enabled = {{ external_twitch_enabled }},
external_twitch_client_id = '{{ external_twitch_client_id }}',
external_twitch_email_optional = {{ external_twitch_email_optional }},
external_twitch_secret = '{{ external_twitch_secret }}',
external_twitter_enabled = {{ external_twitter_enabled }},
external_twitter_client_id = '{{ external_twitter_client_id }}',
external_twitter_email_optional = {{ external_twitter_email_optional }},
external_twitter_secret = '{{ external_twitter_secret }}',
external_x_enabled = {{ external_x_enabled }},
external_x_client_id = '{{ external_x_client_id }}',
external_x_email_optional = {{ external_x_email_optional }},
external_x_secret = '{{ external_x_secret }}',
external_workos_enabled = {{ external_workos_enabled }},
external_workos_client_id = '{{ external_workos_client_id }}',
external_workos_secret = '{{ external_workos_secret }}',
external_workos_url = '{{ external_workos_url }}',
external_web3_solana_enabled = {{ external_web3_solana_enabled }},
external_web3_ethereum_enabled = {{ external_web3_ethereum_enabled }},
external_zoom_enabled = {{ external_zoom_enabled }},
external_zoom_client_id = '{{ external_zoom_client_id }}',
external_zoom_email_optional = {{ external_zoom_email_optional }},
external_zoom_secret = '{{ external_zoom_secret }}',
db_max_pool_size = {{ db_max_pool_size }},
db_max_pool_size_unit = '{{ db_max_pool_size_unit }}',
api_max_request_duration = {{ api_max_request_duration }},
mfa_totp_enroll_enabled = {{ mfa_totp_enroll_enabled }},
mfa_totp_verify_enabled = {{ mfa_totp_verify_enabled }},
mfa_web_authn_enroll_enabled = {{ mfa_web_authn_enroll_enabled }},
mfa_web_authn_verify_enabled = {{ mfa_web_authn_verify_enabled }},
passkey_enabled = {{ passkey_enabled }},
webauthn_rp_display_name = '{{ webauthn_rp_display_name }}',
webauthn_rp_id = '{{ webauthn_rp_id }}',
webauthn_rp_origins = '{{ webauthn_rp_origins }}',
mfa_phone_enroll_enabled = {{ mfa_phone_enroll_enabled }},
mfa_phone_verify_enabled = {{ mfa_phone_verify_enabled }},
mfa_phone_max_frequency = {{ mfa_phone_max_frequency }},
mfa_phone_otp_length = {{ mfa_phone_otp_length }},
mfa_phone_template = '{{ mfa_phone_template }}',
nimbus_oauth_client_id = '{{ nimbus_oauth_client_id }}',
nimbus_oauth_client_secret = '{{ nimbus_oauth_client_secret }}',
oauth_server_enabled = {{ oauth_server_enabled }},
oauth_server_allow_dynamic_registration = {{ oauth_server_allow_dynamic_registration }},
oauth_server_authorization_path = '{{ oauth_server_authorization_path }}',
custom_oauth_enabled = {{ custom_oauth_enabled }}
WHERE 
ref = '{{ ref }}' --required unless SUPABASE_PROJECT_ID is set
RETURNING
external_apple_client_id,
external_azure_client_id,
external_bitbucket_client_id,
external_discord_client_id,
external_facebook_client_id,
external_figma_client_id,
external_github_client_id,
external_gitlab_client_id,
external_google_client_id,
external_kakao_client_id,
external_keycloak_client_id,
external_linkedin_oidc_client_id,
external_notion_client_id,
external_slack_client_id,
external_slack_oidc_client_id,
external_spotify_client_id,
external_twitch_client_id,
external_twitter_client_id,
external_workos_client_id,
external_x_client_id,
external_zoom_client_id,
nimbus_oauth_client_id,
webauthn_rp_id,
smtp_sender_name,
webauthn_rp_display_name,
api_max_request_duration,
custom_oauth_enabled,
custom_oauth_max_providers,
db_max_pool_size,
db_max_pool_size_unit,
disable_signup,
external_anonymous_users_enabled,
external_apple_additional_client_ids,
external_apple_email_optional,
external_apple_enabled,
external_apple_secret,
external_azure_email_optional,
external_azure_enabled,
external_azure_secret,
external_azure_url,
external_bitbucket_email_optional,
external_bitbucket_enabled,
external_bitbucket_secret,
external_discord_email_optional,
external_discord_enabled,
external_discord_secret,
external_email_enabled,
external_facebook_email_optional,
external_facebook_enabled,
external_facebook_secret,
external_figma_email_optional,
external_figma_enabled,
external_figma_secret,
external_github_email_optional,
external_github_enabled,
external_github_secret,
external_gitlab_email_optional,
external_gitlab_enabled,
external_gitlab_secret,
external_gitlab_url,
external_google_additional_client_ids,
external_google_email_optional,
external_google_enabled,
external_google_secret,
external_google_skip_nonce_check,
external_kakao_email_optional,
external_kakao_enabled,
external_kakao_secret,
external_keycloak_email_optional,
external_keycloak_enabled,
external_keycloak_secret,
external_keycloak_url,
external_linkedin_oidc_email_optional,
external_linkedin_oidc_enabled,
external_linkedin_oidc_secret,
external_notion_email_optional,
external_notion_enabled,
external_notion_secret,
external_phone_enabled,
external_slack_email_optional,
external_slack_enabled,
external_slack_oidc_email_optional,
external_slack_oidc_enabled,
external_slack_oidc_secret,
external_slack_secret,
external_spotify_email_optional,
external_spotify_enabled,
external_spotify_secret,
external_twitch_email_optional,
external_twitch_enabled,
external_twitch_secret,
external_twitter_email_optional,
external_twitter_enabled,
external_twitter_secret,
external_web3_ethereum_enabled,
external_web3_solana_enabled,
external_workos_enabled,
external_workos_secret,
external_workos_url,
external_x_email_optional,
external_x_enabled,
external_x_secret,
external_zoom_email_optional,
external_zoom_enabled,
external_zoom_secret,
hook_after_user_created_enabled,
hook_after_user_created_secrets,
hook_after_user_created_uri,
hook_before_user_created_enabled,
hook_before_user_created_secrets,
hook_before_user_created_uri,
hook_custom_access_token_enabled,
hook_custom_access_token_secrets,
hook_custom_access_token_uri,
hook_mfa_verification_attempt_enabled,
hook_mfa_verification_attempt_secrets,
hook_mfa_verification_attempt_uri,
hook_password_verification_attempt_enabled,
hook_password_verification_attempt_secrets,
hook_password_verification_attempt_uri,
hook_send_email_enabled,
hook_send_email_secrets,
hook_send_email_uri,
hook_send_sms_enabled,
hook_send_sms_secrets,
hook_send_sms_uri,
jwt_exp,
mailer_allow_unverified_email_sign_ins,
mailer_autoconfirm,
mailer_notifications_email_changed_enabled,
mailer_notifications_identity_linked_enabled,
mailer_notifications_identity_unlinked_enabled,
mailer_notifications_mfa_factor_enrolled_enabled,
mailer_notifications_mfa_factor_unenrolled_enabled,
mailer_notifications_password_changed_enabled,
mailer_notifications_phone_changed_enabled,
mailer_otp_exp,
mailer_otp_length,
mailer_secure_email_change_enabled,
mailer_subjects_confirmation,
mailer_subjects_email_change,
mailer_subjects_email_changed_notification,
mailer_subjects_identity_linked_notification,
mailer_subjects_identity_unlinked_notification,
mailer_subjects_invite,
mailer_subjects_magic_link,
mailer_subjects_mfa_factor_enrolled_notification,
mailer_subjects_mfa_factor_unenrolled_notification,
mailer_subjects_password_changed_notification,
mailer_subjects_phone_changed_notification,
mailer_subjects_reauthentication,
mailer_subjects_recovery,
mailer_templates_confirmation_content,
mailer_templates_email_change_content,
mailer_templates_email_changed_notification_content,
mailer_templates_identity_linked_notification_content,
mailer_templates_identity_unlinked_notification_content,
mailer_templates_invite_content,
mailer_templates_magic_link_content,
mailer_templates_mfa_factor_enrolled_notification_content,
mailer_templates_mfa_factor_unenrolled_notification_content,
mailer_templates_password_changed_notification_content,
mailer_templates_phone_changed_notification_content,
mailer_templates_reauthentication_content,
mailer_templates_recovery_content,
mfa_max_enrolled_factors,
mfa_phone_enroll_enabled,
mfa_phone_max_frequency,
mfa_phone_otp_length,
mfa_phone_template,
mfa_phone_verify_enabled,
mfa_totp_enroll_enabled,
mfa_totp_verify_enabled,
mfa_web_authn_enroll_enabled,
mfa_web_authn_verify_enabled,
nimbus_oauth_client_secret,
nimbus_oauth_email_optional,
oauth_server_allow_dynamic_registration,
oauth_server_authorization_path,
oauth_server_enabled,
passkey_enabled,
password_hibp_enabled,
password_min_length,
password_required_characters,
rate_limit_anonymous_users,
rate_limit_email_sent,
rate_limit_otp,
rate_limit_sms_sent,
rate_limit_token_refresh,
rate_limit_verify,
rate_limit_web3,
refresh_token_rotation_enabled,
saml_allow_encrypted_assertions,
saml_enabled,
saml_external_url,
security_captcha_enabled,
security_captcha_provider,
security_captcha_secret,
security_manual_linking_enabled,
security_refresh_token_reuse_interval,
security_sb_forwarded_for_enabled,
security_update_password_require_reauthentication,
sessions_inactivity_timeout,
sessions_single_per_user,
sessions_tags,
sessions_timebox,
site_url,
sms_autoconfirm,
sms_max_frequency,
sms_messagebird_access_key,
sms_messagebird_originator,
sms_otp_exp,
sms_otp_length,
sms_provider,
sms_template,
sms_test_otp,
sms_test_otp_valid_until,
sms_textlocal_api_key,
sms_textlocal_sender,
sms_twilio_account_sid,
sms_twilio_auth_token,
sms_twilio_content_sid,
sms_twilio_message_service_sid,
sms_twilio_verify_account_sid,
sms_twilio_verify_auth_token,
sms_twilio_verify_message_service_sid,
sms_vonage_api_key,
sms_vonage_api_secret,
sms_vonage_from,
smtp_admin_email,
smtp_host,
smtp_max_frequency,
smtp_pass,
smtp_port,
smtp_user,
uri_allow_list,
webauthn_rp_origins;
```
</TabItem>
</Tabs>
