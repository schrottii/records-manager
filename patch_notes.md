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

## v1.2 (2026-04-05)
-> Mobile UI:
- Added support for portrait (mobile) UI
- Search/list and the selected category are below each other instead of next to each other
- Title (at the very top) is moved to not overlap

-> Ban lists:
- Added ban lists feature, shown at the bottom
- One row of buttons to switch between the different lists
- Each list shows the banned players

-> Design:
- Search bar no longer gets scrolled with the rest of the list
- Tree names (game names in the list) are now only shown for the first, not for multiple categories with the same tree in a row
- Tree names take up extra space to avoid overlapping and for easier overview
- Title of the selected category now belongs to the right side

-> Saving:
- userData (selected, settings) is now separate from saveData(records, catConfig)
- Some save/load changes

-> Settings:
- Merged Settings and tools into one
- New setting: Show gaps (shows how much higher every player is to the score below)
- (Editor mode only) Added button to convert to Wikitext

-> Editing:
- Ban lists: Create new ban list, Add Player, Remove Player, Load from Wiki
- Moving categories is now possible!
- Added Copy ID button
- Added Move table button, which moves it after the ID of another, or (by typing 0) to the very top
- Prettier editing categories