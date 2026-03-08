## v1.0 ()
- Release

## v1.1 (2026-03-08)
-> Record Points:
- New system: Record Points
- For every category, first place gets +10, second gets +9, etc. - beyond 10th they get nothing
- Added support for Record Points and Total Records based tables, these are made with the new isRecordPoints catConfig
- These are arguably the most important record categories, the "meta" categories
- Limited to 10 entries, all categories are included (this may become adjustable later)

-> Dark Theme:
- Added support for dark theme / dark mode
- Added three buttons in the top right to toggle between light, dark, and auto
- Auto uses light or dark theme depending on system/browser settings
- Background can also change according to the theme
- Severe CSS changes to implement this, including variables for easier adjustments of the entire design

-> Configs:
- New configs:
- darkModeSwitch (can the theme be switched?)
- defaultTheme (is light, dark, or auto default?)
- darkModeBG (does dark theme have an own background?)

-> Design:
- Added logo to the top left
- Added favicon

-> Saving:
- Selected and settings are now loaded differently, to persist through updates, and let users keep their settings
- Added auto save every 5 seconds (on top of saving when changing table)

-> Editing:
- Important fix: When a table is sorted after updating the sorter value, the editor row is now moved too!
- New catConfig: isRecordPoints - set to true for a record points based table, set to manual for total records
- Added experimental createNewCategory(name), proper support for adding and moving categories is planned for later