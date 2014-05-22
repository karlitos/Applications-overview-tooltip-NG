gs-ext-applications-overview-tooltip
====================================

Gnome shell extension. Shows a tooltip over applications icons on applications overview.

All credits goes to the original author https://github.com/fbianconi.

I just updated his extension, so it is compatible with Gnome-shell 3.10 and 3.12 and added some new features and settings. Those changes could break the functionality in gnome-shell <= 3.8 !!! I was not able to test it.

By default the extension shows now also the application-description in the tooltip-label if provided. The description is the one from the .desktop file of the application. The tooltips are always displayed, even if the text under the icon in the app.overview is not cut-off/elipsized.

This behavior and the timing can be changed in the first few lines of theextension.js file between /\*\*\* \*\*\* Settings \*\*\* \*\*\*/ and /\*\*\* end of setting - do not change anything from here below \*\*\*/.

I also added stylesheet.css where you can change the appearance of the tooltip-labels with css-styling.

## Instalation:

Copy the Applications_Overview_Tooltip@Tornado folder to ~/.local/share/gnome-shell/extensions or to /usr/share//gnome-shell/extensions for all users. For system-wide installation check owner and permissions.

## Known bugs:

*  <s>The extension does not start automaticaly after reboot. You have to go to overview, start twek-tool and disable-enable the extension. Then it works.</s> Fixed thanks to Raphaël Rochet.
* The tooltips do not work on anythin beside the application overview. I will try to implement the functionality also for dash.

Everyting ist still work-in-progress because I am a gnome-extension-noob.

![Alt text](./screenshot.png "Here is how it looks like")
