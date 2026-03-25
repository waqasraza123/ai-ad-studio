# Delivery follow-up reminders

## Purpose

The delivery follow-up reminder system turns reminder-scheduled delivery workspaces into owner notifications when the scheduled follow-up date becomes due.

It exists to make follow-up reminders operational instead of passive labels.

The worker reminder sweep does this by:
- loading active delivery workspaces with `follow_up_status = reminder_scheduled`
- selecting workspaces whose `follow_up_due_on` is today or earlier
- classifying each eligible workspace into one reminder bucket
- generating an owner notification when the workspace has not already been notified for that same bucket on the same date
- persisting same-day reminder checkpoint fields so repeated sweeps do not create duplicates

## Reminder buckets

The worker uses two reminder buckets:

- `due_today`
- `overdue`

Bucket resolution is based on `follow_up_due_on` compared with the sweep date:

- `follow_up_due_on = today` becomes `due_today`
- `follow_up_due_on < today` becomes `overdue`

Future dates are ignored by the sweep.

## Fields read by the sweep

The reminder sweep reads these delivery workspace fields:

- `id`
- `owner_id`
- `project_id`
- `canonical_export_id`
- `title`
- `status`
- `follow_up_status`
- `follow_up_note`
- `follow_up_due_on`
- `follow_up_last_notification_bucket`
- `follow_up_last_notification_date`

## Fields mutated by the sweep

The reminder sweep mutates these delivery workspace fields when a reminder is successfully created:

- `follow_up_last_notification_bucket`
- `follow_up_last_notification_date`
- `updated_at`

The reminder sweep also writes a row to `public.notifications`.

## Reminder eligibility rules

A workspace is eligible for reminder generation only when all of the following are true:

- `status = active`
- `follow_up_status = reminder_scheduled`
- `follow_up_due_on is not null`
- `follow_up_due_on <= today`
- the workspace has not already been notified for the same reminder bucket on the same day

The worker additionally expects the workspace to have:

- `owner_id`
- `project_id`
- `canonical_export_id`

These are required for notification creation.

## Duplicate prevention

Duplicate protection happens in two places.

First, the worker checks whether the workspace already has:

- the same `follow_up_last_notification_bucket`
- the same `follow_up_last_notification_date`

If both match the current sweep bucket and date, the workspace is skipped.

Second, the final notification write path is atomic in the database. The database function locks the workspace row, re-checks reminder eligibility, inserts the notification, updates the checkpoint fields, and commits both changes together.

This protects against partial writes and concurrent sweep races.

## Notification behavior

The sweep creates owner notifications with these kinds:

- `delivery_follow_up_due_today`
- `delivery_follow_up_overdue`

Severity is:

- `info` for `due_today`
- `warning` for `overdue`

The notification action URL is:

"/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity`

The notification metadata includes:

- `deliveryWorkspaceId`
- `followUpDueOn`
- `reminderBucket`

## Manual commands

### Run the reminder sweep once

Use this to execute the reminder sweep manually:

    pnpm --filter @ai-ad-studio/worker delivery:reminders

### Run the live smoke proof

Use only dedicated internal proof workspaces. This script mutates follow-up fields on the selected workspaces.

Required environment variables:

- `DELIVERY_REMINDER_SMOKE_CONFIRM`
- `DELIVERY_REMINDER_SMOKE_DUE_TODAY_WORKSPACE_ID`
- `DELIVERY_REMINDER_SMOKE_OVERDUE_WORKSPACE_ID`

Confirmation value must be:

`I_UNDERSTAND_THIS_MUTATES_WORKSPACES`

Example:

    DELIVERY_REMINDER_SMOKE_CONFIRM=I_UNDERSTAND_THIS_MUTATES_WORKSPACES \
    DELIVERY_REMINDER_SMOKE_DUE_TODAY_WORKSPACE_ID=REPLACE_WITH_DUE_TODAY_WORKSPACE_ID \
    DELIVERY_REMINDER_SMOKE_OVERDUE_WORKSPACE_ID=REPLACE_WITH_OVERDUE_WORKSPACE_ID \
    pnpm --filter @ai-ad-studio/worker delivery:reminders:smoke

### Run the worker with a shorter reminder interval for inspection

    WORKER_DELIVERY_FOLLOW_UP_REMINDER_SWEEP_INTERVAL_MS=5000 pnpm --filter @ai-ad-studio/worker dev

## Reminder sweep interval

The worker reminder cadence uses:

- `WORKER_DELIVERY_FOLLOW_UP_REMINDER_SWEEP_INTERVAL_MS`

If this variable is not set or is invalid, the worker falls back to its default reminder sweep interval.

This interval controls how often the worker attempts the reminder sweep, not how often notifications are generated. Same-day duplicate prevention still applies.

## Structured log payload

Each reminder sweep emits a structured JSON log payload with this stable key:

- `eventKey = worker.delivery_follow_up_reminder_sweep`

The payload includes:

- `status`
- `todayDateKey`
- `durationMs`
- `scannedCount`
- `notifiedCount`
- `skippedCount`
- `failureCount`
- `failureSample`
- `reminderBucketTotals`

`reminderBucketTotals` always contains:

- `due_today`
- `overdue`

Each bucket includes:

- `scannedCount`
- `notifiedCount`
- `skippedCount`
- `failedCount`

### Example success shape

    {
      "eventKey": "worker.delivery_follow_up_reminder_sweep",
      "status": "ok",
      "todayDateKey": "2026-03-24",
      "durationMs": 42,
      "scannedCount": 3,
      "notifiedCount": 2,
      "skippedCount": 1,
      "failureCount": 0,
      "failureSample": [],
      "reminderBucketTotals": {
        "due_today": {
          "scannedCount": 2,
          "notifiedCount": 1,
          "skippedCount": 1,
          "failedCount": 0
        },
        "overdue": {
          "scannedCount": 1,
          "notifiedCount": 1,
          "skippedCount": 0,
          "failedCount": 0
        }
      }
    }

### Status meanings

#### `ok`

The sweep completed and did not record any per-workspace failures.

This does not necessarily mean notifications were created. A sweep can be `ok` with zero notifications if all eligible workspaces were skipped because they were already notified earlier in the same day.

#### `partial_failure`

The sweep completed, but one or more workspaces failed during processing.

Other workspaces may still have been notified successfully.

Use `failureCount`, `failureSample`, and `reminderBucketTotals` to identify the affected bucket and scope.

#### `failed`

The sweep failed before it could return a normal result. This usually points to a top-level problem such as a configuration issue or a load failure before workspace-level processing completed.

A `failed` payload uses the same stable log structure but may have:

- `todayDateKey = null`
- zeroed bucket totals
- an `errorMessage`

## Operator checklist

When a reminder sweep log shows `ok`:

- check whether `notifiedCount` is non-zero when notifications were expected
- if `notifiedCount = 0`, inspect `skippedCount`
- if `skippedCount` is high, verify whether same-day checkpoint fields were already set on the relevant workspaces

When a reminder sweep log shows `partial_failure`:

- inspect `failureSample`
- compare `failureCount` with bucket-level `failedCount`
- confirm whether some notifications still succeeded by checking `notifiedCount`
- inspect the affected workspaces for:
  - missing `canonical_export_id`
  - unexpected `follow_up_status`
  - unexpected `follow_up_due_on`
  - stale or conflicting checkpoint values

When a reminder sweep log shows `failed`:

- verify worker environment configuration
- verify Supabase service credentials
- verify the reminder-related migration exists in the target database
- run the manual reminder command once to isolate whether the problem is cadence-related or sweep-related

## Database inspection queries

### Find reminder-scheduled workspaces due today or earlier

    select
      id,
      title,
      status,
      follow_up_status,
      follow_up_due_on,
      follow_up_last_notification_bucket,
      follow_up_last_notification_date,
      updated_at
    from public.delivery_workspaces
    where status = 'active'
      and follow_up_status = 'reminder_scheduled'
      and follow_up_due_on is not null
      and follow_up_due_on <= current_date
    order by follow_up_due_on asc, updated_at desc;

### Inspect notifications for one workspace

Replace the workspace id before running:

    select
      id,
      kind,
      title,
      body,
      severity,
      metadata,
      created_at
    from public.notifications
    where metadata ->> 'deliveryWorkspaceId' = 'REPLACE_WITH_WORKSPACE_ID'
      and kind in ('delivery_follow_up_due_today', 'delivery_follow_up_overdue')
    order by created_at desc;

### Inspect current checkpoint state for one workspace

Replace the workspace id before running:

    select
      id,
      title,
      follow_up_status,
      follow_up_due_on,
      follow_up_last_notification_bucket,
      follow_up_last_notification_date,
      updated_at
    from public.delivery_workspaces
    where id = 'REPLACE_WITH_WORKSPACE_ID';

## Safe smoke-proof workflow

Use this flow when you need live proof after a deployment or migration.
1. Choose two dedicated internal active workspaces with canonical exports.
2. Use one workspace for `due_today` and one for `overdue`.
3. Run the smoke proof command once.
4. Confirm:
   - one due-today notification exists
   - one overdue notification exists
   - both workspaces have same-day checkpoint fields
5. Confirm the second sweep does not create duplicate notifications.
6. Do not use active client workspaces for this proof.

## Known boundaries

The reminder system is designed to prevent same-day duplicate reminder notifications for the same bucket.

It does not attempt to preserve a historical sequence of every checkpoint transition inside the workspace row itself. Historical notification rows live in `public.notifications`.

The worker logs are intentionally lightweight. They are for operational visibility, not for full analytics.

## Related worker commands

    pnpm --filter @ai-ad-studio/worker delivery:reminders
    pnpm --filter @ai-ad-studio/worker delivery:reminders:smoke
    pnpm --filter @ai-ad-studio/worker dev
