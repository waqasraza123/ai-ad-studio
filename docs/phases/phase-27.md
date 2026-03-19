# Phase 27

Export approval publishing workflow, where only reviewed winners can be promoted to showcase and share campaigns.

## Acceptance criteria

- public promotion is gated by batch-winner review status
- showcase publishing only works for reviewed winners
- durable share_campaigns table exists
- public campaign pages exist
- old promotions are automatically deactivated when a different winner is selected
- promotion events write notifications and job traces
