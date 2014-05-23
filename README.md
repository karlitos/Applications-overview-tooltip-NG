Applications-overview-tooltip-NG
====================================

Gnome shell extension. Shows a tooltip over applications icons on applications overview.

All credits for the initial functionality goes to the original author Franco Bianconi.

I updated his extension, so it is compatible with Gnome-shell 3.10 and 3.12, which makes it incompatible gnome-shell <= 3.8. I also added some new features and settings, which can be adjusted with preferences-dialog. For this reason i decided to fork the extension and call it "new generation". Users of Gnome <= 3.8 shall use the version from extensions.gnome.org or https://github.com/fbianconi.

By default the extension shows now also the application-description in the tooltip-label if provided. The description is the one from the .desktop file of the application. The tooltips are always displayed, even if the text under the icon in the app-overview is not cut-off/elipsized.

Those settings and some other can be adjuset in preferences dialog in the gnome-tweakutility.

## Known bugs:

* The tooltips do not work on anythin beside the application overview. I will try to implement the functionality also for dash.

The extension can behave buggy and the code is probably not the cleanest one, I am still a gnome-extension-noob.

![Alt text](./screenshot.png "Here is how it looks like")
