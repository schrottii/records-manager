## What is Records Manager?
Tool to manage game records that are written via Wikitext (wiki) tables, with tools to edit or update them faster and easier, and other neat things. 
It is still a work-in-progress, with new content and better explanations coming.

## How to use
It can be used locally, with savedata that is saved locally. Using it publicly for a game can be done by creating a fork, adjusting the config.js, keeping the updated data in wikidata.js and publishing it via GitHub pages or similar. 

## License
If you want to organize records for a game (or something else) yourself, you can copy/fork it and work with your wiki data. Feel free to edit the config.js and style.css. 
Be aware with other things, they could mess with later pulls. 
You may not make money with it (besides donations), remove the credits/donation button to me, or pretend that the record management system is yours. 

## Contact
- Discord: schrottii
- Discord Server: https://discord.gg/CbBeJXKUrk
- GitHub

## Contents 
To see what's new, read patch_notes.md

Accessible for users:
- Displaying list of categories with easy and fast selection
- Rendering the table
- Search function for both categories and table content, with highlight
- Highlighting tool
- Top 10 limiter tool

Accessible for editors: 
- Tools to edit the category and its config
- Auto sort
- Automatic ranking (place)
- Handling various number formats, such as time or standard notation (k, M, B, T, ...)
- Tools to edit a row (its values) or delete it, or its player everywhere
- Export and import data

Config content: 
- Enabling and disabling editor mode
- Various stuff regarding the project's name
- Easy changing of the table design in style.css
- Data from wikidata.js is loaded automatically on boot, can be used to show it to public

## To do
- proper support for adding and moving categories
- Own records, saved locally
- alarm if a player gets added a second time to table (catconfig for that?)