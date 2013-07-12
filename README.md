extended-redmine
================

userscripts to extend redmine

This has only been tested with tampermonkey in chrome

You may want to change the match - rule on top of the script to make this work on your domain

```javascript
// @match http://my.domain.de/redmine/*
```

## Features

### Assign to helper

When working in a large team it may be hard to find the wanted user in the "Assigned to" dropdown.
This feature lets you choose some users you frequently need. Those will be added on top of the Select.
When first opening a issue-page you will pe propted to make your selection. You can change this later by clicking the "edit" link next to the "assigned to" dropdown.
