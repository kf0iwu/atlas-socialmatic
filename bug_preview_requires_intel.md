## Description

Generated post previews do not appear in the UI unless at least one Intelligence add-on is selected.

Generation appears to succeed (history entries are created), but the generated content is not rendered in the editor area.

## Reproduction Steps

1. Enter Topic
2. Enter Audience
3. Select a platform (example: X Medium)
4. Do NOT select any Intelligence add-ons
5. Click "Generate Selected"

## Observed Behavior

Button enters busy state and returns to normal but no preview appears.

Waiting 30 seconds does not change anything.

## Variation Tests

### X only
No add-ons  
Result: No preview

### X + LinkedIn Hooks
Result: Preview appears

### Blog only + LinkedIn Hooks
Result: Preview appears

### LinkedIn + X + Blog (no add-ons)
Result: No preview, but history entry appears

### LinkedIn + X + Blog + LinkedIn Hooks
Result: Preview appears correctly

## Notes

History click behavior currently only resets the topic (Issue #7 part B will implement full restore). This appears to be functioning correctly.

The bug seems isolated to preview rendering when no intelligence add-ons are selected.
