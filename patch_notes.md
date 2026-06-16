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
- New catConfig: isRecordPoints - set to true for a record points based table, set to total for total records
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



## v1.2.1 (2026-04-06)
-> PWA:
- Added PWA support, meaning RM (and derivates) can basically be "installed" on PC and mobile
- It works when offline, and auto updates when online
- It doesn't have the browser-own extra bars and buttons at the top/bottom
- for derivates: the relevant names & more are in serviceworker.js and manifest.webmanifest

-> Mobile UI:
- Improved table size
- Tables can now be scrolled horizontally
- Disabled empty space / scrolling to the right
- Fixed empty spaces in some categories



## v1.3 (2026-05-16)
-> Player Profiles:
- New feature: see info about a player!
- Can be accessed by clicking a row (if the new setting is enabled), or with the new profile search tool
- There is a back button to go back to the record category
- It shows the following:
- Ban status
- Record Points, average
- Amount of top 10, top 3 and #1 
- Place and points in every category they are in
- Every category they are first place in

-> Settings:
- New setting: Click player to see profile (enabled by default, you may want to turn it off to highlight text)
- Added ability to search for a player to see their profile
- Added random category button

-> Editing:
- Unset catconfig is no longer shown as undefined, but empty instead
- Prettier editing rows
- Add row: with the new config, duplicate entries can be added, aborted or replace the old one
- Add row: prettier example (using ; instead of ,)
- Add row: example now recognizes image(s) and video(s) better (such as youtube links)
- Added button to create a new category

-> Config:
- Added duplicatePlayerWarning (editing: warn if a player who is already in the table is getting added again)

-> Other:
- Added license (based on Balnoom license, with modifications), TOS (not very relevant here), and privacy policy
- They can be found in the bottom right (where the other info is)
- Increased space between buttons
- Other minor design changes



## v1.4
-> Favorites (Categories):
- New feature for user comfort/QoL
- Categories have a button in the top left to add/remove it as a favorite
- Favorites have a star emoji in the list
- Added a star button next to the search, clicking it toggles the list, to only show favorites
- Favorites and the favorites search setting are saved in userData